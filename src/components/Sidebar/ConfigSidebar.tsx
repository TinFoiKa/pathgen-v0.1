import * as React from 'react';
import './Sidebar.scss';

interface ConfigSidebarProps {
  // Add props as needed
  setMap : (map: string) => void;
}

const ConfigSidebar: React.FC<ConfigSidebarProps> = (props) => {
  return (
    <div className="sidebar config-sidebar">
      <h2>Configuration</h2>
      <select name = "map" onChange={(e) => props.setMap(e.target.value)} defaultValue = "pig.png">
        <option
          value = "pig.png">
            ----
          </option>
        <option
          value = "field.png"
        >High Stakes Competition</option>
        <option
          value = "skills.png"
        >High Stakes Skills</option>
      </select>
      {/* Add map configuration options */}
    </div>
  );
};

export default ConfigSidebar; 