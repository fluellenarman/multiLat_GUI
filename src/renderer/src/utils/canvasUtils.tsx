class MissileState {
    x: number;
    y: number;
    z: number;

    launcherX: number = 500;
    launcherY: number = 500;

    target: droneState | flareState | null = null;

    initialDirection: number = 270;
    curDirection: number = 270; // in degrees, 0 is to the right, increases counterclockwise
    turnRate: number = 3;

    zSpeed: number = 1;
    speed: number = 1;
    
    alive: boolean = false;
    lifespan: number = 0; // is seconds. lifespan initialize in it's launch button.

    constructor() {
        this.x = 200;
        this.y = 200;
        this.z = 5;
    }

    findNextPoint() {
        // Calculate angle to target
        let targetAngle = angleBetweenPoints(this.x, this.y, this.target.x, this.target.y);
        targetAngle = normalizeAngle(targetAngle);

        // Find the smallest difference (-180 to 180)
        let angleDiff = targetAngle - this.curDirection;
        angleDiff = ((angleDiff + 180) % 360) - 180;

        // Clamp to turnRate
        if (angleDiff > this.turnRate) angleDiff = this.turnRate;
        if (angleDiff < -this.turnRate) angleDiff = -this.turnRate;

        // Update direction
        this.curDirection = normalizeAngle(this.curDirection + angleDiff);

        // Move forward in current direction
        const point = pointFromAngleAndDistance(this.x, this.y, this.curDirection, this.speed);

        this.determineHit();

        this.x = point.x;
        this.y = point.y;
        this.z = zPointFromDestination(this.z, this.target.z, this.zSpeed, this.zSpeed);
    }

    setTarget(target: droneState) {
        this.target = target;
    }

    determineHit() {
        const curDistanceToTarget = d3_distanceBetweenPoints(
            this.x, this.y, this.z, 
            this.target.x, this.target.y, this.target.z);
        
        if (curDistanceToTarget < 5) {
            console.log("Hit detected!");
            this.alive = false;
            this.target.alive = false;
        }
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
        { x: 50, y: 50, z: 10},
        { x: 500, y: 50, z: 10 }
    ];

    setId(id: string) {
        this.id = id;
    }

    // Determine next point given current coord and dest
    findNextPoint() {
        if (this.ifAtPoint() == true) { return; }

        // console.log(this.currentPath);

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

class flareState {
    x: number = 0;
    y: number = 0;
    z: number = 0;

    alive: boolean = true;
    zSpeed: number = 0;

    lifespan: number = 5;

    path: { x: number, y: number, z: number }[] = [];

    

    createFlarePath() {

    }

    frameCounter: number = 0
    handleCountdown(interval: NodeJS.Timeout) {
        this.frameCounter++;
        if (this.frameCounter >= 30) {
            this.frameCounter = 0
            this.lifespan--;
            if (this.lifespan <= 0) {
                this.alive = false;
                console.log("flare expired");
                clearInterval(interval);
            }
        }
    }

    startLifeCountdown() {
        const interval = setInterval(() => this.handleCountdown(interval), 33) // 30ms
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

function renderRedCircle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.arc(missile.x, missile.y, 3, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
    ctx.fillStyle = "#ff0000ff";
    ctx.fill();
    ctx.stroke();
}

function renderRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = "#ff0000ff";
    ctx.fill();
    ctx.stroke();
}

function drawLauncherDirection(ctx: CanvasRenderingContext2D) {
    // Define a new path
    ctx.beginPath();
    // Set a start-point
    ctx.moveTo(missile.launcherX, missile.launcherY);

    const end = pointFromAngleAndDistance(missile.launcherX, missile.launcherY, missile.initialDirection, 40);

    // Set an end-point
    ctx.lineTo(end.x, end.y);

    ctx.stroke();
}

function changeLauncherDirection(ctx: CanvasRenderingContext2D, clickX: number, clickY: number) {
    const distance = distanceBetweenPoints(clickX, clickY, missile.launcherX, missile.launcherY)
    if (distance > 40) {
        return false;
    }
    
    const newAngle = angleBetweenPoints(missile.launcherX, missile.launcherY, clickX, clickY);
    missile.initialDirection = newAngle;
    return true;
}

// Missile tracks target drone.

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

// Used only by the missile object, as it has a turning rate.
function pointFromAngleDistanceTurningRate(x: number, y: number, angle: number, distance: number, turningRate: number): { x: number, y: number } {
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

function normalizeAngle(angle: number): number {
    return (angle + 360) % 360;
}

function convertAngleToRadians(angle: number): number {
    return angle * (Math.PI / 180);
}

//

export { utilFoo, 
    renderCircle,
    renderRedCircle,
    renderText,
    renderRect,
    flareState,
    drawLauncherDirection,
    changeLauncherDirection,
    missile,
    drone1,
    drone2,
    testDrone
};