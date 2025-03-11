import * as React from 'react';
import Map from './components/Map/Map';
import WaypointSidebar from './components/Sidebar/WaypointSidebar';
import ConfigSidebar from './components/Sidebar/ConfigSidebar';
import VelocitySidebar from './components/Sidebar/VelocitySidebar';
import './App.scss';

const App = () => {
  const [map, setMap] = React.useState("");

  return (
    <div className="app-container">
      <div>
        {/* Left sidebar for waypoint selection */}
        <WaypointSidebar />
        <VelocitySidebar />
      </div>
      
      <div>
        {/* Main map component */}
        <Map mapImage={map}/>
      </div>
      
      <div>
        {/* Right sidebar for map configuration */}
        <ConfigSidebar setMap = {setMap}/>
      </div>
    </div>
  );
};

export default App; 