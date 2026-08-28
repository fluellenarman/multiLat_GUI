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
    midcourseTurnRate: number = 3;
    terminalTurnRate: number = 4;
    LOSonMidcourse: boolean = false;

    chanceToTrackFlare: number = .5
    hitChance: number = 0 // compared against chanceToTrackFlare
    LOSsupplement: number = 0 // Added on hitChance
    finalHitChance: number = 0 

    zSpeed: number = 1;
    initialSpeed: number = 2;
    speed: number = 2;
    
    alive: boolean = false;
    initialLifeSpan: number = 0; // initialized during launch.
    lifespan: number = 0; // is seconds. lifespan initialize in it's launch button.
    lifeCycle: number = 0; // launch, mid-course, terminal.

    constructor() {
        this.x = 200;
        this.y = 200;
        this.z = 5;
    }

    checkLifeCycle() {
        // console.log("Initial: " + this.initialLifeSpan.toString() + "\nLifespan: " + this.lifespan.toString());
        if (this.initialLifeSpan > this.lifespan && this.lifespan > 2) {
            this.lifeCycle = 1; // mid-course
            this.speed = this.initialSpeed;
            this.turnRate = this.midcourseTurnRate;
        } 
        else if (this.lifespan <= 2) {
            // console.log("Missile in terminal phase");
            this.lifeCycle = 2; // terminal
            this.turnRate = this.terminalTurnRate; // 
        }
    }

    findNextPoint() {
        this.checkLifeCycle();
        if (this.lifeCycle == 0) {
            this.z += this.zSpeed;
            return;
        }
        if (this.lifeCycle == 2 && this.LOSonMidcourse == false) {
            console.log("Missile in terminal phase, no LOS on target. Continuing in current direction.");
            const point = pointFromAngleAndDistance(this.x, this.y, this.curDirection, this.speed);
            this.x = point.x;
            this.y = point.y;
            this.z = zPointFromDestination(this.z, this.target!.z, this.zSpeed, this.zSpeed);
            return;
        }
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
            this.x = this.launcherX
            this.y = this.launcherY
            this.z = 0
            this.chanceToTrackFlare = 0.5;
        }
    }

    // Change calculation to be based on distance instead of angle.
    calculateChanceToTrackFlare(drone: droneState) {
        const distanceToDrone = d3_distanceBetweenPoints(
            this.x, this.y, this.z,
            drone.x, drone.y, drone.z
        );
        console.log("Distance to drone: " + distanceToDrone.toString());
        // The closer to 100, the higher the chance to track flare.
        if (distanceToDrone <= 100) { 
            const chance = 100 - distanceToDrone
            this.chanceToTrackFlare = 100 - chance
        } else if (distanceToDrone > 100) {
            const chance = distanceToDrone - 100
            this.chanceToTrackFlare = 100 - chance
        }
        console.log("chanceToTrackFlare: " + this.chanceToTrackFlare.toString())
        // // Saving commented code in case future calculations need to use angles
        // const maxAngle = 90; // maximum considered angle (degrees)
        // const minChance = 0.1; // minimum chance
        // const maxChance = 1.0; // maximum chance

        // const absAngle = Math.abs(MDF_angle);
        // if (absAngle > maxAngle) {
        //     this.chanceToTrackFlare = minChance;
        // } else {
        //     // Linear interpolation: closer to 0 angle, higher the chance
        //     this.chanceToTrackFlare = maxChance - ((absAngle / maxAngle) * (maxChance - minChance));
        // }
        // console.log(    "chanceToTrackFlare: " + this.chanceToTrackFlare.toString() + 
        //                 "\nMDF angle: " + MDF_angle.toString() + 
        //                 "\nflareId: " + flareId);
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

    forwardAngle: number = 0;
    rearAngle: number = 0;

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
        
        this.updateAngles(angle);

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


    updateAngles(angle: number) {
        this.forwardAngle = angle;
        this.rearAngle = normalizeAngle(angle + 180);
    }

    // Render optimal flare circle. 
    // This is a visual aid for the user to see which distance the flares/chaffs will be most effect
    renderOptimalFlareCircle(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 100, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

class flareState {
    x: number = 0;
    y: number = 0;
    z: number = 0;

    id: number = 0;

    alive: boolean = true;
    zSpeed: number = 0;

    lifespan: number = 5;
    speed: number = 1;
    real: boolean = false; // only 1 flare will be used for countermeasure

    hasBeenChecked: boolean = false;

    path: { x: number, y: number, z: number }[] = [];
    angle: number = 0;
    isRight: boolean = true;
    MDF_angle: number = 180; // used for calculating flare success chance. Angle between drone->missile and drone->flare.

    // Arman, reference missileState's findNextPoint() for how to implement this.
    findNextPoint() {
        if  (this.isRight == true)  { this.angle += 1; } 
        else                        { this.angle -= 1; }

        const nextPoint = pointFromAngleAndDistance(this.x, this.y, this.angle, this.speed);
        this.x = nextPoint.x;
        this.y = nextPoint.y;
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

class DroneTracker {
    x: number = 0;
    y: number = 0
    shouldDrawLine: boolean = true;
    LOS_achieved: boolean = false
    showTracker: boolean = false

    LOS_default_lifetime: number = 4;
    LOS_lifetime: number = this.LOS_default_lifetime;

    // Should reset when changing drone
    quadrant: number = -1;
    quadrantLetter: Map<number, string> = new Map<number, string>([
        [0, 'C'], [1, 'F'], [2, 'I'],
        [3, 'B'], [4, 'E'], [5, 'H'],
        [6, 'A'], [7, 'D'], [8, 'G'],
    ]);

    handleLOS_timer() {
        this.LOS_lifetime -= 1
        if (this.LOS_lifetime <= 0) {
            this.LOS_achieved = false;
        }
        this.shouldDrawLine = this.LOS_achieved;
    }

    setCoords(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    renderDroneTracker(ctx: CanvasRenderingContext2D) {
        renderRedRect(ctx, this.x, this.y);
    }
    drawLineTo(ctx: CanvasRenderingContext2D, x: number, y: number) {
        if (this.shouldDrawLine == false) { return; }
        ctx.moveTo(this.x + 5, this.y + 5);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    checkLOSatMidcourse(missile: MissileState) {
        if (missile.lifeCycle == 1 && this.LOS_achieved == false) { 
            missile.LOSonMidcourse = true;
            console.log("Missile has LOS on target at mid-course");
        }
    }

    calculateLOSSupplement(missile: MissileState) {
        this.checkLOSatMidcourse(missile);
        if (this.LOS_achieved == true && missile.LOSsupplement <= 25) {
            missile.LOSsupplement += 0.1
        }
        else if (this.LOS_achieved == false && missile.LOSsupplement > 0) {
            missile.LOSsupplement -= 1
        }
    }

    calculateQuadrant(ctx: CanvasRenderingContext2D, x: number, y: number) {
        const { width, height } = ctx.canvas.getBoundingClientRect();
        
        const col = Math.floor(x / (width / 3))
        const row = Math.floor(y / (height / 3))

        const currentQuadrant = row * 3 + col;
        if (currentQuadrant !== this.quadrant) {
            console.log("Quadrant: ", currentQuadrant, "Letter: ", this.quadrantLetter.get(currentQuadrant));
            this.quadrant = currentQuadrant;
        }
    }

    // For testing purposes only. Do not call in production
    // Made defunct by feat #30
    testBehavior() {
        setInterval(() => {
            this.shouldDrawLine = !this.shouldDrawLine;
            if (this.shouldDrawLine == true)    { this.LOS_achieved = true; this.showTracker = true }
            else                                { this.LOS_achieved = false; }
        }, 5000)
    }
}

const droneTracker = new DroneTracker();
droneTracker.setCoords(100, 100);
// droneTracker.testBehavior();

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
function renderCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.beginPath();
    // Change the divisor of z based on the units used
    ctx.arc(x, y, radius, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
    ctx.fillStyle = "#000000ff";
    ctx.fill();
    ctx.stroke();
}

function renderRedRect(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.rect(x, y, 10, 10);
    ctx.fillStyle = "#ff0000ff";
    ctx.fill();
    ctx.stroke();
}

function renderText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, radius: number) {
    ctx.font = "12px Arial";
    ctx.fillStyle = "#000000ff";
    ctx.fillText(text, x + radius, y + radius);

}

function renderRedCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
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

// find angle from 3 points: current point, point1, point2.
function angleFromThreePoints(
    cx: number, cy: number, 
    x1: number, y1: number, 
    x2: number, y2: number): number 
{
    // Vectors from vertex to each point
    const v1 = { x: x1 - cx, y: y1 - cy };
    const v2 = { x: x2 - cx, y: y2 - cy };

    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const magnitudeV1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
    const magnitudeV2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);

    const cosAngle = Math.max(-1, Math.min(1, dotProduct / (magnitudeV1 * magnitudeV2)));

    return Math.acos(cosAngle) * (180 / Math.PI);
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
    droneTracker,
    renderRedRect,
    renderText,
    renderRect,
    flareState,
    drawLauncherDirection,
    changeLauncherDirection,
    d3_distanceBetweenPoints,
    angleFromThreePoints,
    pointFromAngleAndDistance,
    missile,
    drone1,
    drone2,
    testDrone
};