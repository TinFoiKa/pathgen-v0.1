import {Waypoint} from "../../types"

// Helper function to calculate optimal heading angle
const calculateOptimalHeading = (dx: number, dy: number) => {
  return Math.atan2(dy, dx);
};

// Calculate optimal control point distance based on segment characteristics
const getControlPointDistance = (dist: number, angle: number, isTransition: boolean) => {
  // Base distance is proportional to segment length, using the optimal ratio for cubic Beziers
  let baseDist = dist * 0.333;  // Use 1/3 ratio for optimal cubic Bezier smoothness
  
  // Adjust for sharp angles using a cosine-based smoothing factor
  const angleFactor = Math.pow(Math.cos(angle / 2), 2);  // Quadratic falloff for sharper angles
  baseDist *= Math.max(0.15, angleFactor);  // Allow smaller minimum for very sharp turns
  
  // Adjust for transitions (direction changes or stops)
  if (isTransition) {
    baseDist *= 0.25;  // Shorter control vectors for smoother transitions
  }
  
  // Clamp the distance to reasonable bounds based on segment length
  return Math.max(dist * 0.1, Math.min(dist * 0.4, baseDist));
};

// Helper to check if control points should be mirrored
const shouldMirrorControlPoints = (startHeading: number, endHeading: number, isTransition: boolean) => {
  if (isTransition) return false;
  
  // Calculate absolute angle difference (normalized to [0, π])
  const angleDiff = Math.abs(((endHeading - startHeading + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
  
  // Mirror points if the curve is relatively smooth (angle difference < 60 degrees)
  return angleDiff < Math.PI / 3;
};

// Calculate optimal control points using curvature minimization
const getControlPoints = (start: Waypoint, end: Waypoint, leadAngle: number) => {
  const dx = end.coordinate.x - start.coordinate.x;
  const dy = end.coordinate.y - start.coordinate.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Get the tangent vectors at start and end points
  const startTangent = start.coordinate.head ?? Math.atan2(dy, dx);
  const endTangent = end.coordinate.head ?? Math.atan2(dy, dx);
  
  // Calculate angle between tangents (used for both distance and velocity calculations)
  const tangentAngle = Math.abs(((endTangent - startTangent + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
  
  // Calculate optimal control point distances using chord-length parameterization
  const chordLength = dist;
  let startDist = start.controlPointParams?.exitMagnitude;
  let endDist = end.controlPointParams?.entryMagnitude;
  
  if (!startDist || !endDist) {
    // Use optimal ratio based on angle (derived from minimizing curvature variation)
    const optimalRatio = Math.min(1/3, Math.cos(tangentAngle / 2) / 3);
    startDist = chordLength * optimalRatio;
    endDist = startDist;
    
    // Special handling for pause points and final points
    if (end.coordinate.dir === 0) {
      // Create a longer approach to pause points for smoother deceleration
      startDist = chordLength * 0.4; // Extend the first control point
      endDist = chordLength * 0.15;  // Bring in the second control point for smoother stop
      
      // If the start point is also a pause point, adjust for smooth acceleration
      if (start.coordinate.dir === 0) {
        startDist = chordLength * 0.15; // Shorter distance for smooth start
      }
    } else if (start.coordinate.dir === 0) {
      // Smooth acceleration from a pause point
      startDist = chordLength * 0.15;
      endDist = chordLength * 0.4;
    } else if (start.coordinate.dir !== end.coordinate.dir) {
      // Handle direction changes with asymmetric control points
      const dirChangeFactor = Math.min(0.3, Math.cos(tangentAngle / 2));
      startDist = chordLength * dirChangeFactor;
      endDist = chordLength * dirChangeFactor;
    }
  }
  
  // Get angles (either from manual control or from optimal tangents)
  const startAngle = start.controlPointParams?.exitAngle ?? startTangent;
  let endAngle = end.controlPointParams?.entryAngle ?? endTangent;
  
  // Adjust final approach angle for pause points
  if (end.coordinate.dir === 0) {
    // Modify the end angle to create a more direct approach
    const approachAngle = Math.atan2(dy, dx);
    endAngle = end.controlPointParams?.entryAngle ?? approachAngle;
  }
  
  // Calculate initial velocity based on path characteristics
  const startVel = start.coordinate.dir === 0 ? 0.2 : // Coming from stop
                   start.coordinate.vel ?? 1.0;        // Use existing velocity or max

  // Calculate end velocity based on next point
  const endVel = end.coordinate.dir === 0 ? 0.1 :     // Approaching stop
                 end.coordinate.vel ?? 
                 (tangentAngle > Math.PI / 2 ? 0.5 :  // Sharp turn ahead
                 1.0);                                 // Continue at speed
  
  // Create control points using optimal positions
  const cp1 = {
    x: start.coordinate.x + Math.cos(startAngle) * startDist,
    y: start.coordinate.y + Math.sin(startAngle) * startDist,
    head: startAngle,
    dir: start.coordinate.dir,
    vel: startVel
  };
  
  const cp2 = {
    x: end.coordinate.x - Math.cos(endAngle) * endDist,
    y: end.coordinate.y - Math.sin(endAngle) * endDist,
    head: endAngle,
    dir: end.coordinate.dir,
    vel: endVel
  };

  return [cp1, cp2];
};

export default getControlPoints;