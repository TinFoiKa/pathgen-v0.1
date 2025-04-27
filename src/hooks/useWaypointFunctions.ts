import * as React from 'react'
import { usePathPlanner } from '../contexts/PathPlannerContext';
import { Waypoint } from '../types';

const useWaypointFunctions = () => {
    const { selectedWaypoint, setPauseEdit, selectWaypoint } = usePathPlanner();

    const setDirection = (dir : number) => {
        selectedWaypoint!.coordinate.dir = dir;
    }

    const addPause = () => {
        if (!selectedWaypoint) return;
        const coord = selectedWaypoint.coordinate;

        coord.dir = 0;
        coord.pausetime = 250;
        
        selectWaypoint(selectedWaypoint);
    }

    const changePause = (waypoint: Waypoint) => {
        if(!waypoint) return;
        setPauseEdit(waypoint);
    }

    return {
        setDirection,
        addPause,
        changePause
    }
}

export default useWaypointFunctions;