import { Waypoint, Segment, Coordinate, PathConfig } from '../types';
import bezierInterpolate from './bezier/bezierInterpolate';
import bezierCurvature from './bezier/bezierCurvature';
import getControlPoints from './bezier/getControlPoints';
import calculateVelocities from './calculateVelocities';
import optimizeWaypoints from './optimiseWaypoints';

const defaultConfig: PathConfig = {
  maxVelocity: 120.0,
  minVelocity: 15.0,
  maxAccel: 5.0,
  turnK: 0.8,
  leadAngle: Math.PI / 6,
  baseDensity: 0.05,      // Points per pixel
  curvatureK: 1.5        // Multiplier for curve density
};

// Helper to optimize control points for a sequence of waypoints
const optimizeControlPointSequence = (waypoints: Waypoint[], config: PathConfig) => {
  if (waypoints.length < 2) return;
  
  // First pass: Calculate optimal control points for each consecutive pair
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [cp1, cp2] = getControlPoints(waypoints[i], waypoints[i + 1], config.leadAngle);
    
    // Only update if not manually set
    if (!waypoints[i].controlPointParams?.exitMagnitude || !waypoints[i].controlPointParams?.exitAngle) {
      waypoints[i].cp2 = cp1;
    }
    if (!waypoints[i + 1].controlPointParams?.entryMagnitude || !waypoints[i + 1].controlPointParams?.entryAngle) {
      waypoints[i + 1].cp1 = cp2;
    }
  }
  
  // Second pass: Adjust control points for continuity at intermediate waypoints
  for (let i = 1; i < waypoints.length - 1; i++) {
    const curr = waypoints[i];
    
    // Skip if manually set
    if (curr.controlPointParams?.entryMagnitude && curr.controlPointParams?.exitMagnitude &&
        curr.controlPointParams?.entryAngle && curr.controlPointParams?.exitAngle) {
      continue;
    }
    
    // Calculate the angle between incoming and outgoing segments
    const inVector = {
      x: curr.coordinate.x - waypoints[i-1].coordinate.x,
      y: curr.coordinate.y - waypoints[i-1].coordinate.y
    };
    const outVector = {
      x: waypoints[i+1].coordinate.x - curr.coordinate.x,
      y: waypoints[i+1].coordinate.y - curr.coordinate.y
    };
    
    const angle = Math.abs(Math.atan2(
      inVector.x * outVector.y - inVector.y * outVector.x,
      inVector.x * outVector.x + inVector.y * outVector.y
    ));
    
    // For smooth curves (angle < 60°), make control points symmetric
    if (angle < Math.PI / 3 && !curr.controlPointParams) {
      const avgDist = (
        Math.hypot(curr.cp1!.x - curr.coordinate.x, curr.cp1!.y - curr.coordinate.y) +
        Math.hypot(curr.cp2!.x - curr.coordinate.x, curr.cp2!.y - curr.coordinate.y)
      ) / 2;
      
      const avgAngle = Math.atan2(
        curr.cp2!.y - curr.cp1!.y,
        curr.cp2!.x - curr.cp1!.x
      );
      
      curr.cp1 = {
        x: curr.coordinate.x - Math.cos(avgAngle) * avgDist,
        y: curr.coordinate.y - Math.sin(avgAngle) * avgDist,
        head: avgAngle,
        dir: curr.coordinate.dir,
        vel: 0
      };
      
      curr.cp2 = {
        x: curr.coordinate.x + Math.cos(avgAngle) * avgDist,
        y: curr.coordinate.y + Math.sin(avgAngle) * avgDist,
        head: avgAngle,
        dir: curr.coordinate.dir,
        vel: 0
      };
    }
  }
};

const populatePath = (waypoints: Waypoint[], config: PathConfig = defaultConfig): Segment[] => {
  if (waypoints.length < 2) return [];

  // Optimize waypoints before generating segments
  optimizeWaypoints(waypoints, config);

  // Optimize control points for the entire path
  optimizeControlPointSequence(waypoints, config);
  
  // Generate a single segment for the entire path
  const segment = generatePathSegment(waypoints, config);
  return [segment];
};

const mergeClosePoints = (path: Coordinate[], config: PathConfig): Coordinate[] => {
  if (path.length < 3) return path;
  
  const minDistance = 1 / config.baseDensity; // Minimum distance between points
  const optimizedPath: Coordinate[] = [path[0]]; // Always keep first point
  
  let i = 1;
  while (i < path.length - 1) { // Process all points except last
    const curr = path[i];
    const next = path[i + 1];
    const prev = optimizedPath[optimizedPath.length - 1];
    
    // Calculate distance between current point and next point
    const distToNext = Math.hypot(next.x - curr.x, next.y - curr.y);
    
    if (distToNext < minDistance) {
      // Points are too close, merge them by averaging
      const mergedPoint: Coordinate = {
        x: (curr.x + next.x) / 2,
        y: (curr.y + next.y) / 2,
        head: curr.head !== null && next.head !== null ? (curr.head + next.head) / 2 : curr.head ?? next.head ?? 0,
        dir: curr.dir,
        vel: (curr.vel + next.vel) / 2
      };
      
      // Skip the next point since we merged it
      i += 2;
      
      // Only add if it's far enough from previous point
      const distToPrev = Math.hypot(mergedPoint.x - prev.x, mergedPoint.y - prev.y);
      if (distToPrev >= minDistance) {
        optimizedPath.push(mergedPoint);
      }
    } else {
      // Point is far enough, keep it
      optimizedPath.push(curr);
      i++;
    }
  }
  
  // Always keep last point
  optimizedPath.push(path[path.length - 1]);
  
  return optimizedPath;
};

const generatePathSegment = (waypoints: Waypoint[], config: PathConfig): Segment => {
  const path: Coordinate[] = [];
  const start = waypoints[0];
  const end = waypoints[waypoints.length - 1];
  
  // Generate path points through all waypoints
  for (let i = 1; i < waypoints.length; i++) {
    const curr = waypoints[i-1];
    const next = waypoints[i];
    
    // Calculate path density based on segment characteristics
    const dx = next.coordinate.x - curr.coordinate.x;
    const dy = next.coordinate.y - curr.coordinate.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Base number of points scaled by distance
    const basePoints = Math.max(5, Math.ceil(dist * config.baseDensity));
    let lastT = 0;
    
    // Generate points with adaptive sampling based on curvature
    while (lastT < 1) {
      // Calculate curvature at current point
      const curvature = bezierCurvature(
        curr.coordinate,
        curr.cp2!,
        next.cp1!,
        next.coordinate,
        lastT
      );
      
      // Adjust step size based on curvature
      // Smaller steps for higher curvature
      const stepSize = 1.0 / (basePoints * (1 + config.curvatureK * Math.abs(curvature)));
      
      const point = bezierInterpolate(
        curr.coordinate,
        curr.cp2!,
        next.cp1!,
        next.coordinate,
        lastT
      );
      
      // Add point if it meaningfully contributes to path definition
      if (path.length === 0 || 
          Math.hypot(point.x - path[path.length-1].x, point.y - path[path.length-1].y) > dist / (basePoints * (1 + config.curvatureK * Math.abs(curvature)))) {
        // Set direction and velocity placeholders
        point.dir = curr.coordinate.dir;
        point.vel = 0;
        path.push(point);
      }
      
      lastT = Math.min(1, lastT + stepSize);
    }
    
    // Ensure we include the endpoint of each segment
    if (lastT >= 1) {
      const endPoint = bezierInterpolate(
        curr.coordinate,
        curr.cp2!,
        next.cp1!,
        next.coordinate,
        1
      );
      endPoint.dir = next.coordinate.dir;
      endPoint.vel = 0;
      path.push(endPoint);
    }
  }
  
  // Calculate headings with consideration for path curvature
  for (let i = 0; i < path.length - 1; i++) {
    const curr = path[i];
    const next = path[i+1];
    
    // Calculate heading based on next point
    curr.head = Math.atan2(next.y - curr.y, next.x - curr.x);
    
    // Adjust heading for reverse direction
    if (curr.dir === -1) {
      curr.head += Math.PI;
    }
  }
    
  // Set final point heading
  const lastPoint = path[path.length-1];
  lastPoint.head = end.coordinate.head;
  lastPoint.dir = end.coordinate.dir;

  // Calculate velocities considering curvature and waypoint constraints
  calculateVelocities(path, config, waypoints);
  
  // Optimize path by merging close points
  const optimizedPath = mergeClosePoints(path, config);
  
  return {
    start,
    end,
    path: optimizedPath,
    direction: start.coordinate.dir
  };
};

export default populatePath;