import * as React from 'react';
import Map from './components/Map/Map';
import WaypointSidebar from './components/Sidebar/WaypointSidebar';
import ConfigSidebar from './components/Sidebar/ConfigSidebar';
import VelocitySidebar from './components/Sidebar/VelocitySidebar';
import './App.scss';
import { MapConfig, Waypoint } from './types';

const App : React.FC = () => {
  // Global States
  const [map, setMap] = React.useState("pig.png");
  const [waypoints, setWaypoints] = React.useState<Waypoint[]>([]);
  const [config, setConfig] = React.useState<MapConfig>();

  // abstracted function to add waypoints
  const addWaypoint = (coord: {x: number, y: number, isNew: boolean}) => {
    // pad with more waypoint information
    const index = waypoints.length;

    const current = waypoints.length == 0 ? 0 : waypoints[waypoints.length - 1].section
    const section = coord.isNew ? current + 1 : current;

    waypoints.push({
      index: index,
      section: section,
      coordinate: {
        x: coord.x,
        y: coord.y,
        head: 0,
        vel: 0
      }
    });
    console.log(waypoints)
  }

  return (
    <div className="app-container">
      <div>
        {/* Left sidebar for waypoint selection */}
        <WaypointSidebar waypoints = {waypoints}/>
        <VelocitySidebar />
      </div>
      
      <div>
        {/* Main map component */}
        <Map 
          mapImage = {map} 
          newWaypoint = {addWaypoint}
        />
      </div>
      
      <div>
        {/* Right sidebar for map configuration */}
        <ConfigSidebar 
          setMap = {setMap} 
          setConfig = {setConfig}
        />
      </div>
    </div>
  );
};

export default App; 