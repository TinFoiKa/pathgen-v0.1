import * as React from 'react';
import './Sidebar.scss';
import { MapConfig } from '../../types';
import Selection from '../Forms/Selection/Selection';
import { usePathPlanner } from '../../contexts/PathPlannerContext';

interface ConfigSidebarProps {
  // Add props as needed
  mapState : [string, React.Dispatch<React.SetStateAction<string>>];
  configState : [MapConfig, React.Dispatch<React.SetStateAction<MapConfig>>];
}

const ConfigSidebar: React.FC<ConfigSidebarProps> = (props) => {
  const { reloadWaypoints, clearAllWaypoints } = usePathPlanner();

  return (
    <div className="sidebar config-sidebar">
      <h2>Configuration</h2>

      {/* Selection for map type */}
      <Selection 
        name = "Map Type"
        options = {[
            {label: "----", value: "pig.png"},
            {label: "High Stakes Competition", value: "field.png"},
            {label: "High Stakes Skills", value: "skills.png"}
          ]}
        state = {props.mapState}
      />

      {/* Add map configuration options */}
      <Selection
        name = "Output Type"
        options = {[
          {label: "----", value: "none"},
          {label: "Ramsete", value: "ramsete"},
          {label: "Pure Pursuit", value: "purepursuit"},
          {label: "PXRAuton", value: "pxrauton"}
        ]}
        state = {props.configState}
      />

      <input type = "button" value = "Save Configuration" onClick = {() => {}}/>
      <input type = "button" value = "Load Configuration" onClick = {() => {}}/>
      <input type = "button" value = "Refresh Graphics (spammable)" onClick = {() => {
        reloadWaypoints();
      }}/>
      <input type = "button" value = "Clear Waypoints" onClick = {() => {
        clearAllWaypoints();
      }}/>
    </div>
  );
};

export default ConfigSidebar; 