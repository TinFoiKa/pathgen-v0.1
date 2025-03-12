import * as React from 'react';
import './Sidebar.scss';
import { MapConfig } from '../../types';
import Selection from '../Forms/Selection/Selection';

interface ConfigSidebarProps {
  // Add props as needed
  setMap : (map: string) => void;
  setConfig : (config: MapConfig) => void;
}

const ConfigSidebar: React.FC<ConfigSidebarProps> = (props) => {
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
        setFunction = {props.setMap}
      />

      {/* Add map configuration options */}
      <Selection
        name = ""
        options = {[]}
        setFunction = {() => {}}
      />
    </div>
  );
};

export default ConfigSidebar; 