import React from 'react';
import './Sidebar.scss';

interface WaypointSidebarProps {
  // Add props as needed
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