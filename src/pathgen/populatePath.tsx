import { Waypoint, Segment, Coordinate, PathConfig } from '../types';
import bezierInterpolate from './bezier/bezierInterpolate';
import bezierCurvature from './bezier/bezierCurvature';
import getControlPoints from './bezier/getControlPoints';
import calculateVelocities from './calculateVelocities';
import optimizeWaypoints from './optimiseWaypoints';

const defaultConfig: PathConfig = {
  resolution: 30,
  maxVelocity: 120.0,
  maxAccel: 5.0,
  turnK: 0.8,
  leadAngle: Math.PI / 6,
  baseDensity: 0.05,      // Points per pixel
  curvatureK: 1.2        // Multiplier for curve density
};

const populatePath = (waypoints: Waypoint[], config: PathConfig = defaultConfig): Segment[] => {
  const segments: Segment[] = [];
  let currentSection = waypoints[0]?.section || 0;
  let sectionStart = 0;

  // Optimize waypoints before generating segments
  optimizeWaypoints(waypoints, config);

  // Process each section separately
  for (let i = 0; i < waypoints.length; i++) {
    if (waypoints[i].section !== currentSection) {
      // Process previous section
      const sectionWaypoints = waypoints.slice(sectionStart, i);
      const sectionSegments = generateSection(sectionWaypoints, config);
      segments.push(...sectionSegments);
      
      // Start new section
      currentSection = waypoints[i].section;
      sectionStart = i;
    }
  }

  // Process final section
  if (sectionStart < waypoints.length) {
    const sectionWaypoints = waypoints.slice(sectionStart);
    const sectionSegments = generateSection(sectionWaypoints, config);
    segments.push(...sectionSegments);
  }

  console.log("path updated")
  return segments;
};

const generateSection = (waypoints: Waypoint[], config: PathConfig): Segment[] => {
  const segments: Segment[] = [];

  for (let i = 1; i < waypoints.length; i++) {
    const start = waypoints[i-1];
    const end = waypoints[i];
    
    // Adjust lead angle based on direction
    const effectiveLeadAngle = config.leadAngle * start.coordinate.dir;
    const [cp1, cp2] = getControlPoints(start, end, effectiveLeadAngle);
    
    // Calculate path points with adaptive sampling
    const dx = end.coordinate.x - start.coordinate.x;
    const dy = end.coordinate.y - start.coordinate.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let basePoints = Math.max(5, Math.ceil(dist * config.baseDensity));
    
    // Increase density near pause points or direction changes
    if (start.coordinate.dir === 0 || end.coordinate.dir === 0 || 
        start.coordinate.dir !== end.coordinate.dir) {
      basePoints *= 2;
    }
    
    const path: Coordinate[] = [];
    let lastT = 0;
    
    // Generate path points
    while (lastT < 1) {
      const curvature = bezierCurvature(start.coordinate, cp1, cp2, end.coordinate, lastT);
      const stepSize = 1 / (basePoints * (1 + config.curvatureK * curvature));
      
      path.push(bezierInterpolate(
        start.coordinate,
        cp1,
        cp2,
        end.coordinate,
        lastT
      ));
      
      lastT += stepSize;
    }
    
    // Ensure end point is included
    if (lastT < 1) {
      path.push(bezierInterpolate(
        start.coordinate,
        cp1,
        cp2,
        end.coordinate,
        1
      ));
    }

    // Calculate heading for each point considering direction
    for (let j = 0; j < path.length - 1; j++) {
      const curr = path[j];
      const next = path[j+1];
      curr.head = Math.atan2(next.y - curr.y, next.x - curr.x);
      if (curr.dir === -1) {
        curr.head += Math.PI;
      }
    }
    
    // Set final point heading
    const lastPoint = path[path.length - 1];
    lastPoint.head = end.coordinate.head;
    lastPoint.dir = end.coordinate.dir;

    // To avoid ramping back up from every step, we preserve the velocity from the previous segment
    if (segments.length > 0) {
      path[0].vel = segments[segments.length - 1].path[segments[segments.length - 1].path.length - 1].vel;
    } else {
      path[0].vel = start.coordinate.vel;
    }

    // Calculate velocities with special handling for transitions
    if (start.coordinate.dir === 0 || end.coordinate.dir === 0 || 
        start.coordinate.dir !== end.coordinate.dir) {
      // Apply velocity ramping near transitions
      const rampLength = path.length / 3;
      path.forEach((point, idx) => {
        if (idx < rampLength) {
          point.vel = (start.coordinate.vel * idx) / rampLength;
        } else if (idx > path.length - rampLength) {
          point.vel = (end.coordinate.vel * (path.length - idx)) / rampLength;
        } else {
          point.vel = Math.min(start.coordinate.vel, end.coordinate.vel);
        }
      });
    } else {
      calculateVelocities(path, config);
    }

    segments.push({
      start,
      end,
      path,
      direction: start.coordinate.dir
    });
  }

  return segments;
};

export default populatePath;