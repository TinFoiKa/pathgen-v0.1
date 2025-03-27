import { useState, useEffect } from 'react'
import { FocusType, Segment } from '../types';
import { PathPlannerProvider, usePathPlanner } from '../contexts/PathPlannerContext';
import './Menu.scss'
import { MapHandle } from '../components/Map/Map';
import React from 'react';

interface MenuProps {
    name: string;
    function?: () => void;
    submenu?: MenuProps[]; // recursive, optional submenu
}

const useClickHandle = () => {
    const { waypoints, 
            setWaypoints, 
            mapRef, 
            handleWaypointAdd, 
            selectWaypoint, 
            handleSelect, 
            selectedWaypoint, 
            reloadWaypoints 
        } = usePathPlanner();

    const [rightFocused, setRightFocused] = useState(false);
    const [focus, setFocus] = useState<FocusType>();
    const [clickCoords, setClickCoords] = useState({ x: 0, y: 0 });
    // one layer of sub menu
    const [activeSubmenu, setActiveSubmenu] = useState<MenuProps[] | null>(null);
    const [options, setOptions] = useState<MenuProps[]>([{
        name: "",
        function: () => {}
    }])

    // Set options when focus updates
    useEffect(() => {
        if (focus?.isWaypoint) {
            // filter directionlist based on what directions we are missing.
            if (waypoints.length === 0) return;
            const dir = waypoints[waypoints.indexOf(selectedWaypoint!)]?.coordinate.dir;
            const directionlist = [
                {
                    name: "Forward",
                    function: () => {
                        waypoints[focus.waypointIndex!].coordinate.dir = 1;
                        setWaypoints(waypoints);
                    }
                },
                {
                    name: "Backward",
                    function: () => {
                        waypoints[focus.waypointIndex!].coordinate.dir = -1;
                        setWaypoints(waypoints);
                    }
                },
                {
                    name: "Pause",
                    function: () => {
                        waypoints[focus.waypointIndex!].coordinate.dir = 0;
                        setWaypoints(waypoints);
                    }
                }
            ].filter((item) => item.name !== (dir === 1 ? "Forward" : dir === -1 ? "Backward" : "Pause"));

            setOptions([
                {
                    name: "Delete",
                    function: () => {
                        waypoints.splice(focus.waypointIndex!, 1);
                        setWaypoints(waypoints);
                    }
                },
                {
                    name: "Edit Type >",
                    submenu: directionlist
                }
            ])
        } else {
            setOptions([
                { 
                    name: "Add Waypoint", 
                    function: () => {
                        const map = mapRef.current;
                        const canvas = map?.canvasRef.current;
                        if (!canvas) return;

                        const rect = canvas.getBoundingClientRect();

                        // reestalish artificial event with readded click coords
                        const artEvent = new MouseEvent("click", {
                            clientX: clickCoords.x + rect.x, 
                            clientY: clickCoords.y + rect.y, 
                            button: 0
                        });
                        handleWaypointAdd(artEvent);
                    }
                }
            ])
        }
    }, [focus, waypoints]);

    // use effect for focus based on waypoint selection
    useEffect(() => {
        if (!selectedWaypoint) return;
        const { x: wpX, y: wpY } = selectedWaypoint.coordinate;
        const dist = Math.sqrt((wpX - clickCoords.x) ** 2 + (wpY - clickCoords.y) ** 2);
        // Assume a threshold of 50 for waypoint selection.
        const isWaypoint = dist < 50;
        setFocus({
            x: clickCoords.x,
            y: clickCoords.y,
            isWaypoint,
            waypointIndex: isWaypoint ? waypoints.indexOf(selectedWaypoint) : undefined
        });
    }, [selectedWaypoint, clickCoords, waypoints]);

    // effect to clear context menu when out of focus
    useEffect(() => {
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault();
        })

        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("contextmenu", (e: MouseEvent) => {
                e.preventDefault();
            })
        }
    }, []);

    const unfocus = () => {
        selectWaypoint(null);
        setRightFocused(false);
    }

    const handleClick = (e: MouseEvent) => {
        const map = mapRef.current;
        const canvas = map?.canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        // Set click coordinates relative to the canvas.
        const x = e.clientX - rect.x;
        const y = e.clientY - rect.y;
        setClickCoords({ x, y });

        const isWithin = e.clientX > rect.x 
                    && e.clientY > rect.y 
                    && e.clientX < rect.x + rect.width 
                    && e.clientY < rect.y + rect.height;
                    
        
        // if clicking on right menu, do nothing
        if (rightFocused) return;

        // prepare focus for mouse event
        unfocus();

        const noSelection = !handleSelect(e);

        if (isWithin) {
            switch (e.button) {
                case 0: // Left
                    // prioritise menu before addition
                    if (rightFocused) {
                        setRightFocused(false);
                    } else if (noSelection) {
                        handleWaypointAdd(e);
                    }
                    break; 
                case 1: // Middle
                    break;
                case 2: // Right
                    setFocus({x: clickCoords.x, y: clickCoords.y, isWaypoint: !noSelection});
                    setRightFocused(true); 
                    break;
            }
        }
    }

    const CustomMenu: React.FC = () => {
        return (
            <div 
                className="menu" 
                style={{
                    display: rightFocused ? "block" : "none", 
                    top: clickCoords.y + 40, 
                    left: clickCoords.x + 50
                }}
                onMouseDown = {(e) => e.stopPropagation()}
            >
                {options.map((option, idx) => (
                    <div 
                        key={idx} 
                        className="menu-item" 
                        onClick={(e) =>{
                            e.stopPropagation();
                            if(option.submenu) {
                                setActiveSubmenu(activeSubmenu ? null : option.submenu)
                            } else {
                                option.function && option.function();
                                setRightFocused(false);
                                setActiveSubmenu(null);
                                reloadWaypoints();
                            }
                        }}
                    >
                        {option.name}
                    </div>
                ))}
                {activeSubmenu && (
                    <div 
                        className="submenu" 
                        style={{
                            position: "absolute",
                            top: 20,
                            left: 100,
                            background: "#101010",
                            border: "1px solid #ccc",
                            padding: "5px"
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {activeSubmenu.map((subOption, subIdx) => (
                            <div 
                                key={subIdx} 
                                className="menu-item" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    subOption.function && subOption.function();
                                    setRightFocused(false);
                                    setActiveSubmenu(null);
                                    reloadWaypoints();
                                }}
                            >
                                {subOption.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return {   
        setRightFocused,
        rightFocused,
        focus,
        setFocus,
        CustomMenu
    }
}

export default useClickHandle;