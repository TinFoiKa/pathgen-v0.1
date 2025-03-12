import * as React from 'react';
import './Sidebar.scss';
import { Waypoint } from '../../types';

interface WaypointSidebarProps {
  // Add props as needed
  waypoints : Waypoint[];
}

const WaypointSidebar: React.FC<WaypointSidebarProps> = () => {
  return (
    <div className="sidebar waypoint-sidebar">
      <h2>Waypoints</h2>
      {/* Add waypoint list and selection functionality */}
    </div>
  );
};

export default WaypointSidebar; 