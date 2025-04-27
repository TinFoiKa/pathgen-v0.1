import { Coordinate, PathConfig, Waypoint } from '../types';

// Find the nearest waypoint velocity for a given path point
const findNearestWaypointVelocity = (point: Coordinate, waypoints: Waypoint[], threshold: number = 5): number | null => {
  for (const waypoint of waypoints) {
    const dx = point.x - waypoint.coordinate.x;
    const dy = point.y - waypoint.coordinate.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < threshold) {
      return waypoint.coordinate.vel;
    }
  }
  return null;
};

// Calculate velocity profile using waypoint velocities as constraints
const calculateVelocities = (path: Coordinate[], config: PathConfig, waypoints: Waypoint[]) => {
  if (path.length < 2) return;

  // Initialize velocities based on waypoint constraints
  for (let i = 0; i < path.length; i++) {
    const waypointVel = findNearestWaypointVelocity(path[i], waypoints);
    if (waypointVel !== null) {
      path[i].vel = waypointVel;
    } else {
      path[i].vel = config.maxVelocity; // Start with max velocity for non-waypoint points
    }
  }

  // Forward pass - acceleration limited
  for (let i = 1; i < path.length; i++) {
    const prev = path[i-1];
    const curr = path[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate turn sharpness
    const turnFactor = i < path.length - 1 ? 
      Math.abs(Math.atan2(path[i+1].y - curr.y, path[i+1].x - curr.x) - 
               Math.atan2(curr.y - prev.y, curr.x - prev.x)) : 0;
    
    // Only apply turn-based velocity reduction to non-waypoint points
    const waypointVel = findNearestWaypointVelocity(curr, waypoints);
    if (waypointVel === null) {
      const targetVel = Math.min(
        config.maxVelocity,
        config.maxVelocity * Math.exp(-config.turnK * turnFactor)
      );
      
      // Respect acceleration limits and minimum velocity
      curr.vel = Math.max(
        config.minVelocity,
        Math.min(
          targetVel,
          Math.sqrt(prev.vel * prev.vel + 2 * config.maxAccel * dist)
        )
      );
    }
  }

  // Backward pass - deceleration limited
  for (let i = path.length - 2; i >= 0; i--) {
    const curr = path[i];
    const next = path[i+1];
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Only adjust velocity if not a waypoint
    const waypointVel = findNearestWaypointVelocity(curr, waypoints);
    if (waypointVel === null) {
      curr.vel = Math.max(
        config.minVelocity,
        Math.min(
          curr.vel,
          Math.sqrt(next.vel * next.vel + 2 * config.maxAccel * dist)
        )
      );
    }
  }

  // Final smoothing pass to ensure continuity
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i-1];
    const curr = path[i];
    const next = path[i+1];
    
    // Skip waypoints
    const waypointVel = findNearestWaypointVelocity(curr, waypoints);
    if (waypointVel === null) {
      // Smooth velocity transitions
      const avgVel = (prev.vel + next.vel) / 2;
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Ensure velocity changes are within acceleration limits and minimum velocity
      const maxVelChange = Math.sqrt(2 * config.maxAccel * dist);
      curr.vel = Math.max(
        config.minVelocity,
        Math.min(
          avgVel,
          Math.min(prev.vel + maxVelChange, next.vel + maxVelChange)
        )
      );
    }
  }
};

export default calculateVelocities;