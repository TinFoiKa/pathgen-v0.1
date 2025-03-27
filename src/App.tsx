import * as React from 'react';
import Map, { MapHandle } from './components/Map/Map';
import WaypointSidebar from './components/Sidebar/WaypointSidebar';
import ConfigSidebar from './components/Sidebar/ConfigSidebar';
import VelocitySidebar from './components/Sidebar/VelocitySidebar';
import './App.scss';
import { MapConfig } from './types';
import { PathPlannerProvider, usePathPlanner } from './contexts/PathPlannerContext';

const App : React.FC = () => {
  const mapRef = React.useRef<MapHandle>(null);
  
  // Global States
  const [map, setMap] = React.useState("pig.png");
  const [config, setConfig] = React.useState<MapConfig>({zoom: 0, center: {x:0, y:0, head: 0, dir: 0, vel:0}});

  return (
    <PathPlannerProvider mapRef = {mapRef}>
      <div className="app-container">
        <div className = "side">
          {/* Left sidebar for waypoint selection */}
          <WaypointSidebar />
          <VelocitySidebar />
        </div>
        
        <div className = "middle">
          {/* Main map component */}
          <Map 
            mapImage = { map } 
            ref = { mapRef }
          />
        </div>
        
        <div className = "side">
          {/* Right sidebar for map configuration */}
          <ConfigSidebar 
            mapState = {[map, setMap]} 
            configState = {[config, setConfig]}
          />
        </div>
      </div>
    </PathPlannerProvider>
  );
};

export default App;