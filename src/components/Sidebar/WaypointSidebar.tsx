import * as React from 'react';
import './Sidebar.scss';
import { usePathPlanner } from '../../contexts/PathPlannerContext';
import useClickHandle from '../../hooks/useClickHandle';

const WaypointSidebar: React.FC = () => {
  const { waypoints, selectWaypoint, selectedWaypoint } = usePathPlanner();
  const click = useClickHandle();

  return (
    <div className="sidebar waypoint-sidebar">
      <h2>Waypoints</h2>
      {waypoints.map((waypoint) => (
        <div 
          key={`${waypoint.section}-${waypoint.index}`} 
          onClick={() => selectWaypoint(waypoint)}
          className={selectedWaypoint === waypoint ? 'selected' : ''}
        >
          <p>{waypoint.section}-{waypoint.index} [{waypoint.coordinate.x.toFixed(0)}, {waypoint.coordinate.y}, {waypoint.coordinate.head?.toPrecision(2)}, {waypoint.coordinate.vel.toFixed(0)}] dir: {waypoint.coordinate.dir}</p>
        </div>
      ))}
    </div>
  );
};

export default WaypointSidebar;