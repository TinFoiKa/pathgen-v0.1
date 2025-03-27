import { Waypoint, PathConfig } from '../types';

const optimizeWaypoints = (waypoints: Waypoint[], config: PathConfig) => {
    if (waypoints.length < 2) return;
  
    // Process first waypoint
    const first = waypoints[0];
    const second = waypoints[1];
    first.coordinate.head = Math.atan2(
      second.coordinate.y - first.coordinate.y,
      second.coordinate.x - first.coordinate.x
    );
    first.coordinate.vel = config.maxVelocity;
  
    // Process middle waypoints
    for (let i = 1; i < waypoints.length - 1; i++) {
      const prev = waypoints[i-1];
      const curr = waypoints[i];
      const next = waypoints[i+1];
  
      // Calculate entry and exit vectors
      const entryVector = {
        x: curr.coordinate.x - prev.coordinate.x,
        y: curr.coordinate.y - prev.coordinate.y
      };
      const exitVector = {
        x: next.coordinate.x - curr.coordinate.x,
        y: next.coordinate.y - curr.coordinate.y
      };
  
      // Calculate headings based on movement direction
      const entryAngle = Math.atan2(entryVector.y, entryVector.x) + 
        (prev.coordinate.dir === -1 ? Math.PI : 0);
      const exitAngle = Math.atan2(exitVector.y, exitVector.x) + 
        (curr.coordinate.dir === -1 ? Math.PI : 0);
      
      // Calculate heading based on movement directions
      let heading;
      if (curr.coordinate.dir === 0) {
        // For pause points, face the exit direction
        heading = exitAngle;
      } else {
        // Split the angle between entry and exit, considering directions
        heading = (entryAngle + exitAngle) / 2;
        if (Math.abs(exitAngle - entryAngle) > Math.PI) {
          heading += Math.PI;
        }
      }
      
      // Normalize heading
      while (heading > Math.PI) heading -= 2 * Math.PI;
      while (heading < -Math.PI) heading += 2 * Math.PI;
  
      // Calculate velocity based on turn sharpness and direction changes
      let velocity = config.maxVelocity;
      const turnAngle = Math.abs(exitAngle - entryAngle);
  
      if (curr.coordinate.dir === 0) {
        // Pause point
        velocity = 0;
      } else if (curr.coordinate.dir !== prev.coordinate.dir || curr.coordinate.dir !== next.coordinate.dir) {
        // Direction change
        velocity = 0;
      } else {
        // Adjust velocity for turn sharpness
        velocity *= Math.exp(-config.turnK * turnAngle);
      }
  
      curr.coordinate.head = heading;
      curr.coordinate.vel = velocity;
    }
  
    // Process last waypoint
    const last = waypoints[waypoints.length - 1];
    const secondLast = waypoints[waypoints.length - 2];
    last.coordinate.head = Math.atan2(
      last.coordinate.y - secondLast.coordinate.y,
      last.coordinate.x - secondLast.coordinate.x
    );
    last.coordinate.vel = 0; // Always end at zero velocity
  };

export default optimizeWaypoints;