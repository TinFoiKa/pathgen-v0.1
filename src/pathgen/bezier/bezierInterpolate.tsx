import { Coordinate } from "../../types";

// Cubic Bezier interpolation with improved smoothness
const bezierInterpolate = (p0: Coordinate, p1: Coordinate, p2: Coordinate, p3: Coordinate, t: number): Coordinate => {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  // Calculate position using cubic Bezier formula
  const x = mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x;
  const y = mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y;

  // Calculate tangent vector for heading
  const dx = -3 * mt2 * p0.x + 3 * mt2 * p1.x - 6 * mt * t * p1.x + 6 * mt * t * p2.x - 3 * t2 * p2.x + 3 * t2 * p3.x;
  const dy = -3 * mt2 * p0.y + 3 * mt2 * p1.y - 6 * mt * t * p1.y + 6 * mt * t * p2.y - 3 * t2 * p2.y + 3 * t2 * p3.y;
  
  // Calculate heading from tangent
  let head = Math.atan2(dy, dx);
  
  // Smooth direction transitions
  let dir: number;
  if (p0.dir !== p3.dir) {
    // For direction changes, smoothly transition
    const transitionStart = 0.3;
    const transitionEnd = 0.7;
    if (t < transitionStart) {
      dir = p0.dir;
    } else if (t > transitionEnd) {
      dir = p3.dir;
    } else {
      // Smooth transition in the middle section
      const progress = (t - transitionStart) / (transitionEnd - transitionStart);
      dir = p0.dir === 0 || p3.dir === 0 ? 
        (progress < 0.5 ? p0.dir : p3.dir) : // Handle stops
        (p0.dir * (1 - progress) + p3.dir * progress); // Smooth direction change
      
      // Adjust heading for reverse direction
      if (dir === -1) {
        head += Math.PI;
      }
    }
  } else {
    dir = p0.dir;
    // Adjust heading for reverse direction
    if (dir === -1) {
      head += Math.PI;
    }
  }

  return {
    x,
    y,
    head,
    dir,
    vel: 0 // Will be calculated later in velocity profile generation
  };
};

export default bezierInterpolate;