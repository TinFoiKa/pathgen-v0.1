import { Coordinate } from '../../types';

// Enhanced curvature calculation for bezier curve with transition handling
const bezierCurvature = (p0: Coordinate, p1: Coordinate, p2: Coordinate, p3: Coordinate, t: number): number => {
  const mt = 1 - t;
  
  // First derivatives (velocity components)
  const dx = -3*p0.x*mt*mt + p1.x*(3*mt*mt - 6*mt*t) + p2.x*(6*mt*t - 3*t*t) + 3*p3.x*t*t;
  const dy = -3*p0.y*mt*mt + p1.y*(3*mt*mt - 6*mt*t) + p2.y*(6*mt*t - 3*t*t) + 3*p3.y*t*t;
  
  // Second derivatives (acceleration components)
  const d2x = 6*mt*(p0.x - 2*p1.x + p2.x) + 6*t*(p1.x - 2*p2.x + p3.x);
  const d2y = 6*mt*(p0.y - 2*p1.y + p2.y) + 6*t*(p1.y - 2*p2.y + p3.y);
  
  // Calculate speed and curvature
  const speed = Math.sqrt(dx * dx + dy * dy);
  
  // Handle near-zero speed cases (like at stops)
  if (speed < 1e-6) {
    return 0;
  }
  
  // Calculate signed curvature
  const curvature = (dx * d2y - dy * d2x) / Math.pow(speed, 3);
  
  // Apply transition smoothing if at direction change
  if (p0.dir !== p3.dir) {
    const transitionStart = 0.3;
    const transitionEnd = 0.7;
    if (t > transitionStart && t < transitionEnd) {
      // Reduce curvature during direction changes
      const transitionFactor = Math.sin(Math.PI * (t - transitionStart) / (transitionEnd - transitionStart));
      return curvature * (1 - transitionFactor * 0.5);
    }
  }
  
  return curvature;
};

export default bezierCurvature;