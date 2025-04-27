import * as React from 'react';
import { Waypoint, Segment } from '../types';
import { MapHandle } from '../components/Map/Map';
import useClickHandle from '../hooks/useClickHandle';
import populatePath from '../pathgen/populatePath';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import useWaypointFunctions from '../hooks/useWaypointFunctions';

interface PathPlannerContextType {
  mapRef: React.RefObject<MapHandle>;

  segments: Segment[];

  waypoints: Waypoint[];
  setWaypoints: (waypoints: Waypoint[]) => void;
  addWaypoint: (coord: {x: number, y: number, dir: number}) => void;

  coordinateEvent: (e: MouseEvent, canvas: HTMLCanvasElement) => {x: number, y: number, dir: number };
  selectWaypoint: (waypoint: Waypoint | null) => void;
  selectedWaypoint: Waypoint | null;

  reloadWaypoints: () => void;
  handleWaypointAdd: (e: MouseEvent) => void;
  
  clearAllWaypoints: () => void;

  pauseEdit: Waypoint | null;
  setPauseEdit: (waypoint: Waypoint | null) => void;

  // Add control point management
  updateControlPoint: (waypoint: Waypoint, isEntry: boolean, x: number, y: number) => void;
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
  const [pauseEdit, setPauseEdit] = React.useState<Waypoint | null>(null);

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
      },
      cp1: null,
      cp2: null
    };

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
    waypoints.forEach((waypoint) => (waypoint.selected = false))
    setSelectedWaypoint(waypoint);
    if(waypoint) {
      waypoint.selected = true;
    }
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

  const updateControlPoint = (waypoint: Waypoint, isEntry: boolean, x: number, y: number) => {
    // Calculate control point parameters relative to waypoint
    const wpX = waypoint.coordinate.x;
    const wpY = waypoint.coordinate.y;
    
    const dx = x - wpX;
    const dy = y - wpY;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Initialize controlPointParams if not exists
    if (!waypoint.controlPointParams) {
      waypoint.controlPointParams = {};
    }

    // Update the control point parameters
    if (isEntry) {
      waypoint.controlPointParams.entryMagnitude = magnitude;
      waypoint.controlPointParams.entryAngle = angle;
    } else {
      waypoint.controlPointParams.exitMagnitude = magnitude;
      waypoint.controlPointParams.exitAngle = angle;
    }

    // Update the waypoints array to trigger a re-render
    setWaypoints([...waypoints]);
    
    // Recalculate path
    setSegments(populatePath(waypoints));
  };

  const value = {
    mapRef,
    
    segments,

    waypoints,
    setWaypoints,
    addWaypoint,

    selectWaypoint,
    selectedWaypoint,

    coordinateEvent,

    reloadWaypoints,
    handleWaypointAdd,
    clearAllWaypoints,

    pauseEdit,
    setPauseEdit,
    updateControlPoint,
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
