import * as React from 'react';
import './Sidebar.scss';
import { usePathPlanner } from '../../contexts/PathPlannerContext';
import useClickHandle from '../../hooks/useClickHandle';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import { Waypoint } from '../../types';

const WaypointSidebar: React.FC = () => {
  const { waypoints, selectWaypoint, selectedWaypoint, mapRef } = usePathPlanner();
  const click = useClickHandle();
  const shortcuts = useKeyboardShortcuts();
  
  const canvas = mapRef.current?.canvasRef.current?.getBoundingClientRect();
  let mapHeight = 1;
  let mapWidth = 1;
  if (canvas) {
    mapHeight = canvas!.height;
    mapWidth = canvas!.width;
  }
  
  return (
    <div className="sidebar waypoint-sidebar">
      <h2>Waypoints</h2>
      {waypoints.map((waypoint) => (
        <div 
          key={`${waypoint.section}-${waypoint.index}`} 
          data-waypoint-id = {`${waypoint.section}-${waypoint.index}`}
          className={selectedWaypoint === waypoint ? 'selected' : ''}
        >
            <p>{waypoint.section}-{waypoint.index} {
                waypoint.selected === true 
                ? <>[x: {(waypoint.coordinate.x/mapWidth * 144).toFixed(0)}, y: {(144 - waypoint.coordinate.y/mapHeight * 144).toFixed(0)}, th: {waypoint.coordinate.head?.toPrecision(2)}, vel: {waypoint.coordinate.vel.toFixed(1)}] </> 
                : <>dir: {waypoint.coordinate.dir} </> }
              {waypoint.coordinate.dir === 0 && <>
                p: {waypoint.coordinate.pausetime}
              </>}
            </p>
            
        </div>
      ))}
    </div>
  );
};

export default WaypointSidebar;