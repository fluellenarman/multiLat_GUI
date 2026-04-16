class MissileState {
    x: number;
    y: number;
    z: number;

    curDirection: number = 0; // in degrees, 0 is to the right, increases counterclockwise
    
    zSpeed: number = 1;
    speed: number = 1;
    
    alive: boolean = false;
    constructor() {
        this.x = 200;
        this.y = 200;
        this.z = 5;
    }

    findNextPoint() {
        const angle = angleBetweenPoints(this.x, this.y, testDrone.x, testDrone.y).toFixed(2)
        const point = pointFromAngleAndDistance(this.x, this.y, parseFloat(angle), this.speed);

        this.x = point.x;
        this.y = point.y;
        this.z = zPointFromDestination(this.z, testDrone.z, this.zSpeed, this.zSpeed);
    }
}

class droneState {
    x: number = 10;
    y: number = 10;
    z: number = 5;

    climbSpeed: number = 1;
    fallSpeed: number = 2;
    speed: number = 1;

    id: string = "undefined";
    alive: boolean = false;

    currentPathIndex: number = 0;
    currentPath: { x: number, y: number, z: number }[] = [
        { x: 10, y: 10, z: 10},
        { x: 500, y: 10, z: 10 }
    ];

    setId(id: string) {
        this.id = id;
    }

    // Determine next point given current coord and dest
    findNextPoint() {
        if (this.ifAtPoint() == true) { return; }

        console.log(this.currentPath);

        const dest = this.currentPath[this.currentPathIndex];
        const angle = angleBetweenPoints(this.x, this.y, dest.x, dest.y);
        const nextPoint = pointFromAngleAndDistance(this.x, this.y, angle, this.speed);
        
        this.x = nextPoint.x;
        this.y = nextPoint.y;
        this.z = zPointFromDestination(this.z, dest.z, this.climbSpeed, this.fallSpeed);
    }

    // Determines if drone is at next destination point
    ifAtPoint() {
        const deviation = 5;
        const dest = this.currentPath[this.currentPathIndex];
        // const distance = distanceBetweenPoints(this.x, this.y, dest.x, dest.y);
        const distance = d3_distanceBetweenPoints(this.x, this.y, this.z, dest.x, dest.y, dest.z);
        
        if (distance <= deviation) {
            this.currentPathIndex += 1;
            if (this.currentPathIndex >= this.currentPath.length) {
                this.currentPathIndex = 0; // Loop back to start of path
            }
            return true;
        }
        return false;
    }
}

const missile = new MissileState();
const drone1 = new droneState();
const drone2 = new droneState();
drone1.setId("drone1");
drone2.setId("drone2");

const testDrone = new droneState();
testDrone.setId("test");

function utilFoo() {
    console.log("utilFoo called");
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    drone1.x += x;
    drone1.y += y;

    // console.log(`drawCircle called with x=${drone1.x}, y=${drone1.y}`);
    ctx.beginPath();
    ctx.arc(drone1.x, drone1.y, 3, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
    ctx.fillStyle = "#000000ff";
    ctx.fill();
    ctx.stroke();
    // requestAnimationFrame(testFrame);
}

// Same as drawCircle but without logic.
function renderCircle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
    ctx.fillStyle = "#000000ff";
    ctx.fill();
    ctx.stroke();
}

function renderText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
    ctx.font = "12px Arial";
    ctx.fillStyle = "#000000ff";
    ctx.fillText(text, x, y);

}

function drawRedCircle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // missile.x += x;
    // missile.y += y;

    let angle = angleBetweenPoints(missile.x, missile.y, testDrone.x, testDrone.y).toFixed(2)
    let point = pointFromAngleAndDistance(missile.x, missile.y, parseFloat(angle), 2);
    // console.log(`Angle between missile and drone1: ${angleBetweenPoints(missile.x, missile.y, drone1.x, drone1.y).toFixed(2)} degrees`);
    // console.log(`Point from angle and distance: x=${point.x.toFixed(2)}, y=${point.y.toFixed(2)}`);

    missile.x = point.x;
    missile.y = point.y;

    // console.log(`drawRedCircle called with x=${missile.x}, y=${missile.y}`);
    ctx.beginPath();
    ctx.arc(missile.x, missile.y, 3, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
    ctx.fillStyle = "#ff0000ff";
    ctx.fill();
    ctx.stroke();
    
    // requestAnimationFrame(testFrame);
}

function renderRedCircle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.arc(missile.x, missile.y, 3, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
    ctx.fillStyle = "#ff0000ff";
    ctx.fill();
    ctx.stroke();
}
// Missile tracks target drone.
// Returns the missile's position for the next frame.
function missileTracking() {

}

// Math | Utility functions for pathfinding and movement.

function angleBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI); // Convert to degrees
}

function pointFromAngleAndDistance(x: number, y: number, angle: number, distance: number): { x: number, y: number } {
    const radians = angle * (Math.PI / 180); // Convert to radians
    return {
        x: x + distance * Math.cos(radians),
        y: y + distance * Math.sin(radians)
    };
}

function distanceBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// 3D versions of the above functions.
function d3_distanceBetweenPoints(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
}

// Splitting speed and z speed allows for simpler logic.
// Can drone and missile have same logic for handling z?
function zPointFromDestination(currentZ: number, destZ: number, climbSpeed: number, fallSpeed: number): number {
    if (currentZ < destZ) { // Climb
        currentZ += climbSpeed;
        if (currentZ > destZ) {
            currentZ = destZ; // Prevent overshooting
        }
    } else if (currentZ > destZ) { // Fall
        currentZ -= fallSpeed; 
        if (currentZ < destZ) {
            currentZ = destZ; // Prevent overshooting
        }
    }
    
    return currentZ;
}

//

export { utilFoo, 
    renderCircle,
    renderRedCircle,
    renderText,
    drawCircle, 
    drawRedCircle,
    missile,
    drone1,
    drone2,
    testDrone
};