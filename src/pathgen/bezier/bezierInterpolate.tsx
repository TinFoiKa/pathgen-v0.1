import { Coordinate } from "../../types";

// Cubic Bezier interpolation
const bezierInterpolate = (p0: Coordinate, p1: Coordinate, p2: Coordinate, p3: Coordinate, t: number): Coordinate => {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  // Linear interpolation for direction at transition points
  const dir = t < 0.5 ? p0.dir : p3.dir;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
    head: 0, // Will be calculated later
    dir: dir,
    vel: 0   // Will be calculated later
  };
};

export default bezierInterpolate;