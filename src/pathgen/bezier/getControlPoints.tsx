import {Waypoint} from "../../types"

// Helper function to calculate optimal heading angle
const calculateOptimalHeading = (dx: number, dy: number) => {
  return Math.atan2(dy, dx);
};

// Calculate control points for bezier curve
const getControlPoints = (start: Waypoint, end: Waypoint, leadAngle: number) => {
  const dx = end.coordinate.x - start.coordinate.x;
  const dy = end.coordinate.y - start.coordinate.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Use optimal heading if undefined, considering direction
  const startHeading = start.coordinate.head ?? 
    (calculateOptimalHeading(dx, dy) + (start.coordinate.dir === -1 ? Math.PI : 0));
  const endHeading = end.coordinate.head ?? 
    (calculateOptimalHeading(dx, dy) + (end.coordinate.dir === -1 ? Math.PI : 0));
  
  // Adjust control point distances based on movement type
  const startDist = start.coordinate.dir === 0 ? dist * 0.1 : dist * 0.4;
  const endDist = end.coordinate.dir === 0 ? dist * 0.1 : dist * 0.4;
  
  const cp1 = {
    x: start.coordinate.x + Math.cos(startHeading) * startDist,
    y: start.coordinate.y + Math.sin(startHeading) * startDist,
    head: 0,
    dir: start.coordinate.dir,
    vel: 0
  };
  
  const cp2 = {
    x: end.coordinate.x - Math.cos(endHeading) * endDist,
    y: end.coordinate.y - Math.sin(endHeading) * endDist,
    head: 0,
    dir: end.coordinate.dir,
    vel: 0
  };

  return [cp1, cp2];
};

export default getControlPoints;