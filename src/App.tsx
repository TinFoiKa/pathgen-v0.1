import React from 'react';
import Map from './components/Map/Map';
import WaypointSidebar from './components/Sidebar/WaypointSidebar';
import ConfigSidebar from './components/Sidebar/ConfigSidebar';
import './App.scss';

const App: React.FC = () => {
  return (
    <div className="app-container">
      {/* Left sidebar for waypoint selection */}
      <WaypointSidebar />
      
      {/* Main map component */}
      <Map />
      
      {/* Right sidebar for map configuration */}
      <ConfigSidebar />
    </div>
  );
};

export default App; 