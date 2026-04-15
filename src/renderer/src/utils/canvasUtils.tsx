class MissileState {
    x: number;
    y: number;

    curDirection: number = 0; // in degrees, 0 is to the right, increases counterclockwise
    speed: number = 2;
    alive: boolean = false;
    constructor() {
        this.x = 200;
        this.y = 200;
    }
}

class droneState {
    x: number = 10;
    y: number = 10;
    id: string = "undefined";
    alive: boolean = false;

    setId(id: string) {
        this.id = id;
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

    console.log(`drawCircle called with x=${drone1.x}, y=${drone1.y}`);
    ctx.beginPath();
    ctx.arc(drone1.x, drone1.y, 3, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
    ctx.fillStyle = "#000000ff";
    ctx.fill();
    ctx.stroke();
    // requestAnimationFrame(testFrame);
}

function drawRedCircle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // missile.x += x;
    // missile.y += y;

    let angle = angleBetweenPoints(missile.x, missile.y, drone1.x, drone1.y).toFixed(2)
    let point = pointFromAngleAndDistance(missile.x, missile.y, parseFloat(angle), 2);
    console.log(`Angle between missile and drone1: ${angleBetweenPoints(missile.x, missile.y, drone1.x, drone1.y).toFixed(2)} degrees`);
    console.log(`Point from angle and distance: x=${point.x.toFixed(2)}, y=${point.y.toFixed(2)}`);

    missile.x = point.x;
    missile.y = point.y;

    console.log(`drawRedCircle called with x=${missile.x}, y=${missile.y}`);
    ctx.beginPath();
    ctx.arc(missile.x, missile.y, 3, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
    ctx.fillStyle = "#ff0000ff";
    ctx.fill();
    ctx.stroke();
    
    // requestAnimationFrame(testFrame);
}

// Missile tracks target drone.
// Returns the missile's position for the next frame.
function missileTracking() {

}

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

export { utilFoo, 
    drawCircle, 
    drawRedCircle,
    missile,
    drone1,
    drone2,
    testDrone
};