// Define interface for a Coordinate
export interface Coordinate {
  x: number;
  y: number;
  head: number;
  vel: number;
}

// Define interface for a point wrapper (Waypoint)
export interface Waypoint {
  index: number;
  section: number;
  coordinate: Coordinate;
  description?: string;
}

// Define interface for map configuration
export interface MapConfig {
  zoom: number;
  center: Coordinate;
  style?: string;
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