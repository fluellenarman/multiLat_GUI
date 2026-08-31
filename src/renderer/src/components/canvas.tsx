import { Component, onMount } from "solid-js";
import { utilFoo, renderCircle, 
        renderText, renderRedCircle, renderRect, changeLauncherDirection, renderRedRect,
        missile, testDrone, drawLauncherDirection, droneTracker,
        flareState
} from "../utils/canvasUtils";
import {
    flareArr
} from "./flaresButton"
import {contextBridge, ipcRenderer } from 'electron'
import test from "node:test";

interface renderBuffObj {
    x: number;
    y: number;
    id: string;
}

window.electronAPI.onPing((data) => {
    console.log("Received ping from main process:", data);
    droneTracker.LOS_lifetime = droneTracker.LOS_default_lifetime; // Reset LOS lifetime on ping
    droneTracker.LOS_achieved = true;
    droneTracker.shouldDrawLine = true;
})

window.electronAPI.onReqToLauncherLoc((data) => {
    console.log("Received reqToLauncherLoc from main process", data);
    const launcherLoc = {
        x: data.x * 20,
        y: 600 - data.y * 40
    }
    missile.launcherX = launcherLoc.x;
    missile.launcherY = launcherLoc.y;
})

window.electronAPI.onReqToLOSLoc((data) => {
    console.log("Received reqToLOSLoc from main process", data);
    const LOSLoc = {
        x: data.x * 20,
        y: 600 - data.y * 40
    }
    droneTracker.setCoords(LOSLoc.x, LOSLoc.y)
})

const Canvas: Component = () => {
    let global_x = 0;
    let global_y = 0;
    let renderBuffer: renderBuffObj[] = [];
    
    // All rendering should happen in this function.
    function renderObjs(ctx) {
        
        renderRect(ctx, missile.launcherX, missile.launcherY, 10, 10);
        drawLauncherDirection(ctx);
        if (testDrone.alive == true) {
            testDrone.findNextPoint();

            const radius = testDrone.z / 10 + 3;
            renderCircle(ctx, testDrone.x, testDrone.y, radius);
            testDrone.renderOptimalFlareCircle(ctx);
            renderText(ctx, testDrone.z.toString(), testDrone.x, testDrone.y, radius + 5);
            // console.log("TestDroneAngle: " + testDrone.forwardAngle.toString() + ", " + testDrone.rearAngle.toString());
        }
        if (missile.alive == true) {
            missile.findNextPoint();

            const radius = missile.z / 10 + 3;
            renderRedCircle(ctx, missile.x, missile.y, radius);
            renderText(ctx, missile.z.toString(), missile.x, missile.y, radius + 5);
        }
        if (flareArr.length > 0) {
            for (let i = flareArr.length - 1; i >= 0; i--) {
                let flare: flareState = flareArr[i];
                if (flare.alive != true) {
                    continue
                    flareArr.splice(i,1);
                } else {
                    flare.findNextPoint();

                    const radius = flare.z / 10 + 3;
                    renderCircle(ctx, flare.x, flare.y, radius);
                    renderText(ctx, flare.z.toString(), flare.x, flare.y, radius + 5);
                }
            }
        }
        droneTracker.calculateLOSSupplement(missile);
        droneTracker.renderDroneTracker(ctx);
        droneTracker.drawLineTo(ctx, testDrone.x, testDrone.y);
        droneTracker.calculateQuadrant(ctx, testDrone.x, testDrone.y);
    }

    function drawGrid(ctx, canvas) {
        ctx.beginPath();
        ctx.moveTo(canvas.width * (1/3), 0);
        ctx.lineTo(canvas.width * (1/3), canvas.height);
        ctx.moveTo(canvas.width * (2/3), 0);
        ctx.lineTo(canvas.width * (2/3), canvas.height);

        ctx.moveTo(0, canvas.height * (1/3));
        ctx.lineTo(canvas.width, canvas.height * (1/3));
        ctx.moveTo(0, canvas.height * (2/3));
        ctx.lineTo(canvas.width, canvas.height * (2/3));
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.font = "24px sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText("C", canvas.width * (1/6), canvas.height * (1/6))
        ctx.fillText("I", canvas.width * (5/6), canvas.height * (1/6))
        ctx.fillText("B", canvas.width * (1/6), canvas.height * (1/2))
        ctx.fillText("E", canvas.width * (1/2), canvas.height * (1/2))
        ctx.fillText("H", canvas.width * (1/2), canvas.height * (5/6))
        ctx.fillText("A", canvas.width * (1/6), canvas.height * (5/6))
        ctx.fillText("D", canvas.width * (5/6), canvas.height * (1/2))
        ctx.fillText("G", canvas.width * (5/6), canvas.height * (5/6))
        ctx.fillText("F", canvas.width * (1/2), canvas.height * (1/6))
    }
    
    function testIntervalFoo(ctx, canvas) {
        // console.log("testIntervalFoo called");
        console.log(canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx, canvas);
        let obj: renderBuffObj = {
            x: 50 + global_x,
            y: 50 + global_y,
            id: "test1"
        }
        // renderBuffer.push(obj);
        secTriggerCheck();
        requestAnimationFrame(() => renderObjs(ctx));

        global_x += 1;
        global_y += 1;
    }

    
    let frameCount = 0
    function secTriggerCheck() {
        frameCount += 1;
        if (frameCount >= 30) {
            // console.log("TestDrone forward angle: ", testDrone.forwardAngle)
            // console.log("Second triggered");
            if (missile.alive == true) {
                console.log("Missile lifespan: " + missile.lifespan.toString());
                missile.lifespan -= 1;
                if (missile.lifespan <= 0) {
                    missile.alive = false;
                    console.log("Missile expired");
                }
            }
            for (let i = 0; i < flareArr.length; i++) {
                let flare: flareState = flareArr[i];
                if (flare.real == true && !flare.hasBeenChecked && flare.alive == true) {
                    missile.calculateChanceToTrackFlare(testDrone)
                    flare.hasBeenChecked = true;
                    if (flare.lifespan > 0) {
                        missile.hitChance = Math.random()*100; // Determines if tracking follows flares or drone
                        if (missile.LOSonMidcourse == true) {
                            missile.hitChance += missile.LOSsupplement;
                        }

                        console.log("missileHitChance: " + missile.hitChance.toString() + ", missile.chanceToTrackFlare: " + missile.chanceToTrackFlare.toString());
                        if (missile.hitChance < missile.chanceToTrackFlare && flare.real == true) {
                            missile.target = flare
                            console.log("flare success!");
                        }
                    }
                }
                flare.lifespan -= 1;
            }
            droneTracker.handleLOS_timer();
            if (droneTracker.LOS_achieved == true) {
                console.log("canvas.tsx: LOS achieved - loc", testDrone.x, testDrone.y);
                // Send location to main process
                window.rendToMainAPI.sendDroneLoc([testDrone.x, testDrone.y]);
            }
            frameCount = 0;
        }
    }

    const targetLocations = [
        ['A', 0],
        ['B', 0],
        ['C', 0],
        ['D', 0],
    ];

    function preProcessSerialData(data: string) {
        const preArr = data.trim().split(/\s+/);
        const letter    = preArr[0]; // 'A'
        const num       = preArr[1]; // '1.50'
        if      (letter == 'A') { targetLocations[0][1] = Number(num) }
        else if (letter == 'B') { targetLocations[1][1] = Number(num) }
        else if (letter == 'C') { targetLocations[2][1] = Number(num) }
        else if (letter == 'D') { targetLocations[3][1] = Number(num) }
    }

    function ifTargetLocComplete() {
        if (
            targetLocations[0][1] != 0 &&
            targetLocations[1][1] != 0 &&
            targetLocations[2][1] != 0 && 
            targetLocations[3][1] != 0
        ) { return true }
        else { return false}
    }

    onMount(() => {
        console.log("Canvas component mounted");
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");

        if (canvas) {
            // Set canvas size
            canvas.width = 600;
            canvas.height = 600;
            // requestAnimationFrame(testFrame);
            setInterval(() => testIntervalFoo(ctx, canvas), 1000 / 30);
        }

        // Listen for Serial data
        window.api.onSerialData((data: string) => {
            console.log("Received serial data in renderer:", data);
            preProcessSerialData(data)
            // Send data to mulilatProcess py
            if (ifTargetLocComplete() == true) {
                console.log("targetLocCompleted")
                const ranging = [
                    targetLocations[0][1],
                    targetLocations[1][1],
                    targetLocations[2][1],
                    targetLocations[3][1],
                ]

                // Here, would send the ranging data to Python Child process
                // renderer -IPC-> main -> python child
                console.log(ranging);
                window.rendToMainAPI.sendMessage(ranging); // replace testData with ranging

                // End targetLocation
                targetLocations[0][1] = 0
                targetLocations[1][1] = 0
                targetLocations[2][1] = 0
                targetLocations[3][1] = 0
            }
        })
        
        canvas?.addEventListener("click", (event) => {
            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            if (changeLauncherDirection(ctx, x, y)) {
                return;
            }
            missile.launcherX = x;
            missile.launcherY = y;
            console.log("Canvas clicked at", x, y); // (0,0) is top-left of canvas
        });
    });
    return (
        <div>
            <p>Canvas Component</p>
            <div id="grid">
                <canvas id="canvas"></canvas>
            </div>
        </div>
    );
};

export default Canvas;