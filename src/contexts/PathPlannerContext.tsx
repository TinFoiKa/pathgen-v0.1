import * as React from 'react';
import { Waypoint, Segment } from '../types';
import { MapHandle } from '../components/Map/Map';
import useClickHandle from '../hooks/useClickHandle';
import populatePath from '../pathgen/populatePath';

interface PathPlannerContextType {
  mapRef: React.RefObject<MapHandle>;

  segments: Segment[];

  waypoints: Waypoint[];
  setWaypoints: (waypoints: Waypoint[]) => void;
  addWaypoint: (coord: {x: number, y: number, dir: number}) => void;

  handleSelect: (e: MouseEvent, coord?: {x:number, y: number, dir: number}) => boolean;
  selectWaypoint: (waypoint: Waypoint | null) => void;
  selectedWaypoint: Waypoint | null;

  reloadWaypoints: () => void;
  handleWaypointAdd: (e: MouseEvent) => void;
  
  clearAllWaypoints: () => void;
}

const PathPlannerContext = React.createContext<PathPlannerContextType | undefined>(undefined);

interface PathPlannerProps {
  children: React.ReactNode;
  mapRef: React.RefObject<MapHandle>;
}

// ------------------------------------------------ //
//  Pathplanner handles waypoints and intermediate  //
//  points (things to be loaded by Map.tsx)         //
// ------------------------------------------------ //
export const PathPlannerProvider: React.FC<PathPlannerProps> = (props) => {
  const mapRef = props.mapRef;

  const [segments, setSegments] = React.useState<Segment[]>([]);
  const [waypoints, setWaypoints] = React.useState<Waypoint[]>([]);
  const [selectedWaypoint, setSelectedWaypoint] = React.useState<Waypoint | null>(null);

  let prevDir: number;

  const addWaypoint = (coord: {x: number, y: number, dir: number}) => {
    const waypointsEmpty = waypoints.length === 0;

    // initialise waypoint object with input values
    const newWaypoint: Waypoint = {
      section: waypointsEmpty ? 0 : waypoints[waypoints.length - 1].section,
      index: waypoints.length + 1,
      coordinate: {
        x: coord.x,
        y: coord.y,
        head: null,
        vel: 0,
        dir: coord.dir
      }
    };

    // A change in direction means a new section must be made
    if (coord.dir != prevDir) {
        newWaypoint.section++;
    }
    prevDir = coord.dir

    waypoints.push(newWaypoint);

    // update context
    setWaypoints(waypoints);
    // if not waypoints empty, now see repopulate the path
    if (!waypointsEmpty) {
      setSegments(populatePath(waypoints));
    }
  };

  /**
   * Selection function, handles selected waypoint and redraws map to reflect selection
   */
  const selectWaypoint = (waypoint: Waypoint | null) => {
    setSelectedWaypoint(waypoint);
    mapRef.current?.redrawMap();
  };

  /**
   * First works to renumber all waypoints including sections, then resets the map.
   */
  const reloadWaypoints = () => {
    prevDir = waypoints[0].coordinate.dir;
    let prevSection = waypoints[0].section;
    // renumber all waypoints
    waypoints.forEach((waypoint, index) => {
      waypoint.index = index + 1;
      waypoint.section = prevSection;
      if (waypoint.coordinate.dir != prevDir) {
        waypoint.section++;
      }
      prevDir = waypoint.coordinate.dir;
      prevSection = waypoint.section;
    });
    setWaypoints(waypoints);

    // recalculate path
    setSegments(populatePath(waypoints));
    
    // call a function to redraw all waypoints on the canvas
    console.log("referenced reloadWaypoints")
    mapRef.current?.redrawMap();
  }

  /**
   * Interactive canvas press reading function, taking the x y and intended direction of the click.
   */ 
  const coordinateEvent = (e: MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
  
    let dir = 1;

    console.log(x, y, dir)
    return { x, y, dir };
  }

  const handleSelect = (e: MouseEvent, coord?: {x: number, y: number, dir: number}) : boolean => {
    if (!coord) {
      // get our map and canvas
      const map = props.mapRef.current
      const canvas = map?.canvasRef.current;
      if (!canvas) return false;
      coord = coordinateEvent(e, canvas);
    }

    // if empty, skip selection check
    if (waypoints.length === 0) {
      return false;
    }

    const closest = waypoints.reduce((prev, curr) => {
      // repeated for edge effects
      prev.selected = false;
      curr.selected = false;
      
      // then compute closest
      const prevDist = Math.sqrt((prev.coordinate.x - coord.x) ** 2 + (prev.coordinate.y - coord.y) ** 2);
      const currDist = Math.sqrt((curr.coordinate.x - coord.x) ** 2 + (curr.coordinate.y - coord.y) ** 2);
      return prevDist < currDist ? prev : curr;
    });
    if (Math.sqrt((closest.coordinate.x - coord.x) ** 2 + (closest.coordinate.y - coord.y) ** 2) < 25) {
      // select logic
      console.log("Closest waypoint selected");
      selectWaypoint(closest);
      closest.selected = true;
      return true;
    } 
    return false;
  }

  // Handle a waypoint add event
  const handleWaypointAdd = (e: MouseEvent) => {
    e.preventDefault();
    
    // get our map and canvas
    const map = props.mapRef.current
    const canvas = map?.canvasRef.current;
    if (!canvas) return;
  
    const coord = coordinateEvent(e, canvas);
  
    // check first if coordinate next to an existing waypoint, if so, select closest waypoint instead
    if (waypoints.length > 0) {
      // Add Waypoint using context
      addWaypoint(coord);
      console.log("Waypoint added");
    } else {
      // Add Waypoint using context
      addWaypoint(coord);
      console.log("Waypoint added");
    }
  }
  
  const clearAllWaypoints = async () => {
    // update state
    await setWaypoints([]);
    
    // then internally delete
    waypoints.length = 0;
    mapRef.current?.redrawMap();
  }

  const value = {
    mapRef,
    
    segments,

    waypoints,
    setWaypoints,
    addWaypoint,

    handleSelect,
    selectWaypoint,
    selectedWaypoint,

    reloadWaypoints,
    handleWaypointAdd,
    clearAllWaypoints
  };

  return (
    <PathPlannerContext.Provider value={value}>
      {props.children}
    </PathPlannerContext.Provider>
  );
};

export const usePathPlanner = () => {
  const context = React.useContext(PathPlannerContext);
  if (context === undefined) {
    throw new Error('usePathPlanner must be used within a PathPlannerProvider');
  }
  return context;
};
