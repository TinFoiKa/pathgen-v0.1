import * as React from 'react';
import './Map.scss';
import { usePathPlanner } from '../../contexts/PathPlannerContext';
import { Waypoint, Coordinate } from '../../types';
import useClickHandle from '../../hooks/useClickHandle';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

interface MapProps {
  mapImage: string;  // Just the filename, e.g. "field1.jpg"
}

export interface MapHandle {
  redrawMap: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

// Helper to check if a point is within a circle
const isPointInCircle = (x: number, y: number, centerX: number, centerY: number, radius: number): boolean => {
  const dx = x - centerX;
  const dy = y - centerY;
  return (dx * dx + dy * dy) <= (radius * radius);
};

// ------------------------------------------- //
//  This mainly implements waypoint graphics   //
// ------------------------------------------- //
const Map = React.forwardRef<MapHandle, MapProps>((props, ref) => {
  const { CustomMenu } = useClickHandle();
  const { 
    waypoints, 
    selectedWaypoint, 
    segments, 
    reloadWaypoints,
    updateControlPoint 
  } = usePathPlanner();
  
  const shortcuts = useKeyboardShortcuts();
  
  // Track which control point is being dragged (if any)
  const [selectedControlPoint, setSelectedControlPoint] = React.useState<{
    waypoint: Waypoint,
    isCP1: boolean
  } | null>(null);

  // Construct the proper public URL for the image
  const imageUrl = `maps/${props.mapImage}`;

  const mapParams = {
    pointRadius: 12.5,
    smallRadius: 2.5,
    selectColor: 'purple',
    fwdColor: 'blue',
    bwdColor: 'red',
    pauseColor: 'orange',
    controlPointRadius: 8,
    controlPointColor: '#44FF44',
    controlLineColor: '#22AA22',
    controlPointHitRadius: 12  // Slightly larger hit area for control points
  }

  // Interaction Canvas
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    redrawMap();
  }, [selectedWaypoint, waypoints, selectedControlPoint]);

  React.useEffect(() => {
    redrawMap();
  }, [segments]);

  // Check for control point hits
  const checkControlPointHit = (x: number, y: number, waypoint: Waypoint): { isHit: boolean, isCP1: boolean } => {
    if (!waypoint.cp1 || !waypoint.cp2) return { isHit: false, isCP1: false };

    // Check CP1
    if (isPointInCircle(x, y, waypoint.cp1.x, waypoint.cp1.y, mapParams.controlPointHitRadius)) {
      return { isHit: true, isCP1: true };
    }
    // Check CP2
    if (isPointInCircle(x, y, waypoint.cp2.x, waypoint.cp2.y, mapParams.controlPointHitRadius)) {
      return { isHit: true, isCP1: false };
    }

    return { isHit: false, isCP1: false };
  };

  // Handle mouse interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // First, check if we're clicking a control point of the selected waypoint
    if (selectedWaypoint && selectedWaypoint.cp1 && selectedWaypoint.cp2) {
      const controlPointHit = checkControlPointHit(x, y, selectedWaypoint);
      if (controlPointHit.isHit) {
        setSelectedControlPoint({
          waypoint: selectedWaypoint,
          isCP1: controlPointHit.isCP1
        });
        e.stopPropagation();
        return;
      }
    }

    // If no control point was hit, proceed with normal waypoint selection
    redrawMap();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedControlPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update control point through context
    updateControlPoint(
      selectedControlPoint.waypoint,
      selectedControlPoint.isCP1,  // isEntry is same as isCP1
      x,
      y
    );

    // Visual update only - the actual control points will be updated through the path recalculation
    if (selectedControlPoint.isCP1 && selectedControlPoint.waypoint.cp1) {
      selectedControlPoint.waypoint.cp1.x = x;
      selectedControlPoint.waypoint.cp1.y = y;
    } else if (!selectedControlPoint.isCP1 && selectedControlPoint.waypoint.cp2) {
      selectedControlPoint.waypoint.cp2.x = x;
      selectedControlPoint.waypoint.cp2.y = y;
    }

    redrawMap();
  };

  const handleMouseUp = () => {
    if (selectedControlPoint) {
      setSelectedControlPoint(null);
    }
  };

  // New function to draw bezier control points
  const drawControlPoints = (ctx: CanvasRenderingContext2D, waypoint: Waypoint) => {
    if (!waypoint.cp1 || !waypoint.cp2) return;

    // Draw control point lines
    ctx.beginPath();
    ctx.strokeStyle = mapParams.controlLineColor;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    
    // Draw line from waypoint to cp1
    ctx.moveTo(waypoint.coordinate.x, waypoint.coordinate.y);
    ctx.lineTo(waypoint.cp1.x, waypoint.cp1.y);
    
    // Draw line from waypoint to cp2
    ctx.moveTo(waypoint.coordinate.x, waypoint.coordinate.y);
    ctx.lineTo(waypoint.cp2.x, waypoint.cp2.y);
    ctx.stroke();

    // Draw control points
    ctx.beginPath();
    ctx.fillStyle = mapParams.controlPointColor;
    ctx.globalAlpha = 0.8;
    
    // Draw cp1
    ctx.arc(waypoint.cp1.x, waypoint.cp1.y, mapParams.controlPointRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw cp2
    ctx.beginPath();
    ctx.arc(waypoint.cp2.x, waypoint.cp2.y, mapParams.controlPointRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  const drawNewWaypoint = (canvas: HTMLCanvasElement, point: Waypoint) => {
    // if not, add new waypoint
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // decide clr
    let clr = 'blue';
    switch(point.coordinate.dir) {
      case 1: 
        clr = mapParams.fwdColor;
        break;
      case -1:
        clr = mapParams.bwdColor;
        break;
      default:
        clr = mapParams.pauseColor;
        break;
    }
    
    if (selectedWaypoint === point) {
      clr = mapParams.selectColor;
      // Draw bezier control points for selected waypoint
      if (point.cp1 && point.cp2) {
        drawControlPoints(ctx, point);
      }
    }

    // Draw the waypoint
    ctx.beginPath();
    ctx.fillStyle = clr;
    ctx.strokeStyle = clr;
    ctx.globalAlpha = 0.4;
    ctx.arc(point.coordinate.x, point.coordinate.y, mapParams.pointRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  const drawPath = (canvas: HTMLCanvasElement) => {
    // console.log(segments)
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    segments.forEach((segment) => {
      segment.path.forEach((coordinate) => {
        ctx.beginPath();
        ctx.fillStyle = `hsl(${coordinate.vel + 20}, 100%, 50%)`;
        ctx.globalAlpha = 0.7;
        ctx.ellipse(coordinate.x, coordinate.y, mapParams.smallRadius, mapParams.smallRadius, 0, 0, 2 * Math.PI);
        ctx.fill();
      })
    });
  }
  
  // refresh the map
  const redrawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  
    const context = canvas.getContext('2d');
    context?.clearRect(0, 0, canvas.width, canvas.height);

    waypoints.forEach((waypoint) => {
      drawNewWaypoint(canvas, waypoint);
    })
    // console.log("referenced redrawMap")

    // Draw the path as mini points
    drawPath(canvas);
  }

  // pass up to parent
  React.useImperativeHandle(ref, () => ({ redrawMap, canvasRef }))

  return (
    <div className="map-wrapper">
      <div className="map-container">
        {/* making the map interactive */}
        <canvas 
          ref={canvasRef}
          className="interaction-overlay"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Display the map image */}
        <img 
          src={imageUrl} 
          alt="Field Map" 
          className="map-image"
          onError={(e) => {
            console.log(e)
          }}
        />
        
        {/* X-axis labels */}
        <div className="x-axis">
          {[...Array(13)].map((_, i) => (
            <span key={`x-${i}`} className="axis-label" style={{ left: `${i * 8.33}%` }}>
              {i * 12}
            </span>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="y-axis">
          {[...Array(13)].map((_, i) => (
            <span key={`y-${i}`} className="axis-label" style={{ bottom: `${i * 8.33}%` }}>
              {i * 12}
            </span>
          ))}
        </div>
      </div>
      <div className='toolbar-container'>
        
      </div>
      <CustomMenu/>
    </div>
  );
});

export default Map;