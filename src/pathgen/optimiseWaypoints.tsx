import { Waypoint, PathConfig } from '../types';

const optimizeWaypoints = (waypoints: Waypoint[], config: PathConfig) => {
    if (waypoints.length < 2) return;

    // First pass: Calculate headings and velocities for each waypoint
    for (let i = 0; i < waypoints.length; i++) {
        const curr = waypoints[i];
        const prev = i > 0 ? waypoints[i-1] : null;
        const next = i < waypoints.length - 1 ? waypoints[i+1] : null;
        
        // Calculate direct vectors
        let inVector = prev ? {
            x: curr.coordinate.x - prev.coordinate.x,
            y: curr.coordinate.y - prev.coordinate.y,
            dist: 0
        } : null;

        let outVector = next ? {
            x: next.coordinate.x - curr.coordinate.x,
            y: next.coordinate.y - curr.coordinate.y,
            dist: 0
        } : null;

        // Calculate distances for scaling
        if (inVector) {
            inVector.dist = Math.sqrt(inVector.x * inVector.x + inVector.y * inVector.y);
            if (inVector.dist > 0) {
                inVector.x /= inVector.dist;
                inVector.y /= inVector.dist;
            }
        }
        if (outVector) {
            outVector.dist = Math.sqrt(outVector.x * outVector.x + outVector.y * outVector.y);
            if (outVector.dist > 0) {
                outVector.x /= outVector.dist;
                outVector.y /= outVector.dist;
            }
        }

        // Calculate heading with tighter control
        let heading: number;
        if (!prev) {
            // First point - align with exit direction
            heading = Math.atan2(outVector!.y, outVector!.x);
        } else if (!next) {
            // Last point - align with entry direction
            heading = Math.atan2(inVector!.y, inVector!.x);
        } else {
            // For middle points, use weighted average based on distances
            const inAngle = Math.atan2(inVector!.y, inVector!.x);
            const outAngle = Math.atan2(outVector!.y, outVector!.x);
            
            // Calculate angle difference
            let angleDiff = outAngle - inAngle;
            if (Math.abs(angleDiff) > Math.PI) {
                angleDiff -= Math.sign(angleDiff) * 2 * Math.PI;
            }

            // Weight based on distances to prev/next points
            const totalDist = inVector!.dist + outVector!.dist;
            const inWeight = outVector!.dist / totalDist;
            const outWeight = inVector!.dist / totalDist;
            
            // Weighted heading calculation
            heading = inAngle + angleDiff * outWeight;
        }

        // Normalize heading
        while (heading > Math.PI) heading -= 2 * Math.PI;
        while (heading < -Math.PI) heading += 2 * Math.PI;

        // Calculate velocity with more aggressive speed control
        let velocity: number;
        if (i === waypoints.length - 1) {
            velocity = 0; // Final stop
        } else {
            const turnAngle = next ? Math.abs(heading - Math.atan2(outVector!.y, outVector!.x)) : 0;
            
            // Base velocity on turn sharpness and distance
            velocity = config.maxVelocity;
            
            // Reduce speed more aggressively for turns
            if (turnAngle > Math.PI / 6) { // 30 degrees
                velocity *= Math.pow(Math.cos(turnAngle), 2);
            }
            
            // Additional speed reduction near final point
            if (i === waypoints.length - 2) {
                // For second-to-last point, reduce speed but don't stop
                velocity *= 0.5; // Slow down for final approach
            }
        }
        
        // Handle velocity for pause point and apply direction
        if (curr.coordinate.dir === 0) {
            velocity = 0;
        } else {
            // Apply direction sign to velocity
            velocity *= curr.coordinate.dir;
        }

        // Update current waypoint properties
        curr.coordinate.head = heading;
        curr.coordinate.vel = velocity;
    }

    // Second pass: Handle special cases and transitions
    for (let i = 0; i < waypoints.length; i++) {
        const curr = waypoints[i];
        const prev = i > 0 ? waypoints[i-1] : null;

        // Handle final point - only set direction if not already set
        if (i === waypoints.length - 1 && curr.coordinate.dir === undefined) {
            curr.coordinate.dir = 0; // Stop at final point
        }

        // Handle transitions between waypoints - only modify if not explicitly set
        if (prev && curr.coordinate.dir === 0 && prev.coordinate.dir === undefined) {
            // If current point is a pause and previous direction not set, set to forward
            prev.coordinate.dir = 1;
        }
    }
};

export default optimizeWaypoints;