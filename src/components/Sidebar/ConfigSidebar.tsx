import * as React from 'react';
import './Sidebar.scss';
import { MapConfig } from '../../types';
import Selection from '../Forms/Selection/Selection';
import { usePathPlanner } from '../../contexts/PathPlannerContext';
import TextInput from "../Forms/TextInput/TextInput"
import exportPathPoints from '../../hooks/exportPathPoints';

interface ConfigSidebarProps {
  // Add props as needed
  mapState : [string, React.Dispatch<React.SetStateAction<string>>];
  configState : [MapConfig, React.Dispatch<React.SetStateAction<MapConfig>>];
}

const ConfigSidebar: React.FC<ConfigSidebarProps> = (props) => {
  const { reloadWaypoints, clearAllWaypoints, pauseEdit, setPauseEdit, segments, mapRef } = usePathPlanner();
  const [pauseTime, setPauseTime] = React.useState<number | undefined>(pauseEdit?.coordinate.pausetime);

  React.useEffect(() => {
    if (pauseEdit?.coordinate.pausetime) {
      setPauseTime(pauseEdit.coordinate.pausetime);
    }
  }, [pauseEdit?.coordinate.pausetime]);

  React.useEffect(() => {
    if (pauseTime !== undefined && pauseEdit) {
      pauseEdit.coordinate.pausetime = pauseTime;
      setPauseEdit(pauseEdit);
    }
  }, [pauseTime]);

  // React.useEffect(() => {
  //   pauseEdit!.coordinate.pausetime! = pauseTime as number;
  //   setPauseEdit(pauseEdit);
  // }, [pauseTime])

  const canvasRect = mapRef.current?.canvasRef.current?.getBoundingClientRect();
  if (!canvasRect) {
    return;
  }
  const mapDimensions = {width: canvasRect!.width, height: canvasRect!.height};

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
      <input type="button" value = "Export to CSV" onClick = {() => {
        exportPathPoints(segments, mapDimensions)
      }} />

      {pauseEdit && <TextInput
        name = "Pause Time" 
        placeholder = "time (sec)"
        type = {"number"}
        state = {[pauseTime, setPauseTime]}
      />}

    </div>
  );
};

export default ConfigSidebar; 