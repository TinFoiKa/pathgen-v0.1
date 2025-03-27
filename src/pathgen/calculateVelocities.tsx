import { Coordinate, PathConfig } from '../types';

// Calculate velocity profile
const calculateVelocities = (path: Coordinate[], config: PathConfig) => {
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
    
    const targetVel = Math.min(
      config.maxVelocity,
      config.maxVelocity * Math.exp(-config.turnK * turnFactor)
    );
    
    curr.vel = Math.min(
      targetVel,
      Math.sqrt(prev.vel * prev.vel + 2 * config.maxAccel * dist)
    );
  }

  // Backward pass - deceleration limited
  for (let i = path.length - 2; i >= 0; i--) {
    const curr = path[i];
    const next = path[i+1];
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    curr.vel = Math.min(
      curr.vel,
      Math.sqrt(next.vel * next.vel + 2 * config.maxAccel * dist)
    );
  }
};

export default calculateVelocities;