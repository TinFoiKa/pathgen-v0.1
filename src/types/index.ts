// Define interface for a Coordinate
export interface Coordinate {
  x: number;
  y: number;
  head: number | null;
  dir: number;  // 1 for forward, -1 for backward, 0 for pause
  vel: number;
  pausetime?: number;
}

// Define interface for focusing with right click
export interface FocusType {
  x: number,
  y: number,
  isWaypoint: boolean,
  waypointIndex?: number
}

// Define interface for a point wrapper (Waypoint)
export interface Waypoint {
  index: number;
  section: number;
  coordinate: Coordinate;
  cp1: Coordinate | null;
  cp2: Coordinate | null;
  description?: string;
  selected?: boolean;
  controlPointParams?: {
    entryMagnitude?: number;  // Distance of CP1 from waypoint
    entryAngle?: number;      // Angle of CP1 relative to waypoint
    exitMagnitude?: number;   // Distance of CP2 from waypoint
    exitAngle?: number;       // Angle of CP2 relative to waypoint
  };
}

// Define interface for map configuration
export interface MapConfig {
  zoom: number;
  center: Coordinate;
  style?: string;
} 

// Define interface for waypoint segment
export interface Segment {
  start: Waypoint;
  end: Waypoint;
  path: Coordinate[];
  direction: number;
  selected?: boolean;
}

// Interface for saving a work session in local storage 
export interface Session {
  waypoints: Waypoint[];
  mapConfig: MapConfig;
}

// used in Select and things which use select
export interface Option {
  value: string;
  label: string;
}

export interface PathConfig {
  maxVelocity: number;    // Maximum allowed velocity
  minVelocity: number;
  maxAccel: number;       // Maximum allowed acceleration
  turnK: number;          // Turn adjustment factor
  leadAngle: number;      // Lead angle for turns
  baseDensity: number;    // Base number of points per unit distance
  curvatureK: number;     // Curvature sensitivity factor
}
