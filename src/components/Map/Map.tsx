import * as React from 'react';
import './Map.scss';
import { usePathPlanner } from '../../contexts/PathPlannerContext';
import { Waypoint } from '../../types';
import useClickHandle from '../../hooks/useClickHandle';

interface MapProps {
  mapImage: string;  // Just the filename, e.g. "field1.jpg"
}

export interface MapHandle {
  redrawMap: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

// ------------------------------------------- //
//  This mainly implements waypoint graphics   //
// ------------------------------------------- //
const Map = React.forwardRef<MapHandle, MapProps>((props, ref) => {
  const { CustomMenu } = useClickHandle();
  const { waypoints, selectedWaypoint, segments } = usePathPlanner();

  // Construct the proper public URL for the image
  const imageUrl = `maps/${props.mapImage}`;

  const mapParams = {
    pointRadius: 12.5,
    smallRadius: 2.5,
    selectColor: 'purple',
    fwdColor: 'blue',
    bwdColor: 'red',
    pauseColor: 'orange'
  }

  // Interaction Canvas
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    redrawMap();
  }, [selectedWaypoint, waypoints]);

  const drawNewWaypoint = (canvas: HTMLCanvasElement, point: Waypoint) => {
    // if not, add new waypoint
    const ctx = canvas.getContext('2d');
    console.log(waypoints)

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
      clr = mapParams.selectColor
    }

    if (ctx) {
      ctx.beginPath();
      ctx.fillStyle = clr;
      ctx.strokeStyle = clr;
      ctx.globalAlpha = 0.4;
      ctx.arc(point.coordinate.x, point.coordinate.y, mapParams.pointRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  const drawPath = (canvas: HTMLCanvasElement) => {
    console.log(segments)
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    segments.forEach((segment) => {
      segment.path.forEach((coordinate) => {
        ctx.beginPath();
        ctx.fillStyle = `hsl(${coordinate.vel + 20}, 100%, 50%)`;
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
    console.log("referenced redrawMap")

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
          ref = {canvasRef}
          className = "interaction-overlay" 
          onMouseDown = {redrawMap}
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