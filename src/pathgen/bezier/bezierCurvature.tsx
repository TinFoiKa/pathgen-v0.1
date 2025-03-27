import { Coordinate } from '../../types';

// curvature calculation for bezier curve
const bezierCurvature = (p0: Coordinate, p1: Coordinate, p2: Coordinate, p3: Coordinate, t: number): number => {
  const mt = 1 - t;
  
  // First derivatives
  const dx = -3*p0.x*mt*mt + p1.x*(3*mt*mt - 6*mt*t) + p2.x*(6*mt*t - 3*t*t) + 3*p3.x*t*t;
  const dy = -3*p0.y*mt*mt + p1.y*(3*mt*mt - 6*mt*t) + p2.y*(6*mt*t - 3*t*t) + 3*p3.y*t*t;
  
  // Second derivatives
  const d2x = 6*mt*(p0.x - 2*p1.x + p2.x) + 6*t*(p1.x - 2*p2.x + p3.x);
  const d2y = 6*mt*(p0.y - 2*p1.y + p2.y) + 6*t*(p1.y - 2*p2.y + p3.y);
  
  // Curvature formula
  const num = Math.abs(dx * d2y - dy * d2x);
  const den = Math.pow(dx * dx + dy * dy, 1.5);
  
  return den !== 0 ? num/den : 0;
};

export default bezierCurvature;