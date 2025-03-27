// Define interface for a Coordinate
export interface Coordinate {
  x: number;
  y: number;
  head: number | null;
  dir: number;  // 1 for forward, -1 for backward, 0 for pause
  vel: number;
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
  description?: string;
  selected?: boolean
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
  resolution: number;      // Points per segment
  maxVelocity: number;    // Maximum allowed velocity
  maxAccel: number;       // Maximum allowed acceleration
  turnK: number;          // Turn adjustment factor
  leadAngle: number;      // Lead angle for turns
  baseDensity: number;    // Base number of points per unit distance
  curvatureK: number;     // Curvature sensitivity factor
}
