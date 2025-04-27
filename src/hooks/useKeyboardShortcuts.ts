import * as React from 'react';
import { FocusType } from '../types';
import { usePathPlanner } from '../contexts/PathPlannerContext';
import { MapHandle } from '../components/Map/Map';

const useKeyboardShortcuts = () => {
    const { mapRef, 
            handleWaypointAdd,  
            selectedWaypoint, 
            reloadWaypoints,
            waypoints } = usePathPlanner();

    const [keyPressed, setKeyPressed] = React.useState("");
    
    React.useEffect(() => {
        console.log("Keyboard shortcuts initialized");
        const canvas = mapRef.current?.canvasRef.current;
        if (!canvas) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            setKeyPressed(event.key);
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    React.useEffect(() => {
        // Handle the case that a waypoint is selected.
        if (selectedWaypoint) {
            switch (keyPressed) {
                case 'p':
                    
                    break;
                case 'b':
                    break;
            }
        }

    }, [keyPressed]);
}

export default useKeyboardShortcuts;