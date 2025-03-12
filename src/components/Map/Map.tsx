import * as React from 'react';
import './Map.scss';
import { Waypoint } from '../../types';

interface MapProps {
  mapImage: string;  // Just the filename, e.g. "field1.jpg"
  newWaypoint: (coord: {x: number, y: number, isNew: boolean}) => void;
}

const Map: React.FC<MapProps> = (props) => {
  // Construct the proper public URL for the image
  const imageUrl = `maps/${props.mapImage}`;

  // Interaction Canvas
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // set previous button
  let previousButton = 0;

  // React effect to ensure event listener loader
  React.useEffect(() => {
    const canvas = canvasRef.current;
    console.log(canvas)

    if (canvas) {
      // Set initial canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Add event listener
      canvas.addEventListener("click", addWaypoint);

      // Cleanup
      return () => {
        canvas.removeEventListener("click", addWaypoint);
      };
    }
  }, [canvasRef.current])

  // Interactive canvas reading functions
  const coordinateEvent = (e: MouseEvent, canvas: HTMLCanvasElement) => {
    previousButton = e.button;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const isNew = e.button != previousButton
    console.log(x, y, isNew)
    return { x, y, isNew };
  }

  // Handle a waypoint add event
  const addWaypoint = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coord = coordinateEvent(e, canvas);

    // then draw the waypoint
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.fillStyle = 'blue';
      ctx.strokeStyle = 'blue';
      ctx.globalAlpha = 0.4;
      ctx.arc(coord.x, coord.y, 10, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Add Waypoint
    props.newWaypoint({x: coord.x, y: coord.y, isNew: coord.isNew});
    console.log("Waypoint added");
  }
  

  return (
    <div className="map-wrapper">
      <div className="map-container">
        {/* making the map interactive */}
        <canvas 
          ref = {canvasRef}
          className = "interaction-overlay" 
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
    </div>
  );
};

export default Map;