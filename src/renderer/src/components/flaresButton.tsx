//This component is to spawn in the testing drone for testing purposes. It will be used to test the drone's movement and behavior in the environment.

import {Component, onMount } from 'solid-js'
import { Show } from 'solid-js'
import { testDrone } from '../utils/canvasUtils';
import { TestingMode, setTestingMode, toggleTestingMode } from '../utils/testingMode';
import { flareState } from "../utils/canvasUtils";
import {d3_distanceBetweenPoints, missile, angleFromThreePoints, pointFromAngleAndDistance } from "../utils/canvasUtils"
import test from 'node:test';

let flareArr = [];
const FlareButton: Component = () => {
    
    let frameCounter: number = 0;
    let curFlares: number = 0;
    function handleFrame(interval: NodeJS.Timeout) {
        frameCounter++;

        if (frameCounter >= 15) {
            frameCounter = 0
            let flare = new flareState();
            const point = pointFromAngleAndDistance(testDrone.x, testDrone.y, testDrone.rearAngle, 20);
            flare.x = point.x;
            flare.y = point.y;
            flare.z = testDrone.z;
            flare.lifespan = 5;
            flare.id = curFlares;

            // Only flare[1] is real, all others are just for show
            if (curFlares == 1) {
                
                // Check for distance. If distance too far, flare.real =false
                const distance = d3_distanceBetweenPoints(
                    flare.x, flare.y, flare.z, 
                    missile.x, missile.y, missile.z)
                
                if (distance > 200) {
                    console.log("flare FAILED: Distance too far!")
                } else {
                    flare.real = true
                    const MDF_angle = angleFromThreePoints(
                        testDrone.x, testDrone.y,
                        missile.x, missile.y,
                        flare.x, flare.y
                    )
                    flare.MDF_angle = MDF_angle;
                    // console.log("FDM angle: " + MDF_angle.toString())
                    console.log("Spawned real flare")
                }
            }
            flare.startLifeCountdown();
            flareArr.push(flare);
            curFlares += 1;
            if (curFlares >= 5) {
                curFlares = 0;
                clearInterval(interval);
            }
        }
    }

    function handleClick() {
        console.log("Flare button clicked1");
        // for (let i = 0; i < 5; i++) {
        const interval = setInterval(() => handleFrame(interval), 30)
        // }
    }

    return (
        <div>
            <button onClick={handleClick}> Flares</button>
        </div>
    )
}

// export default FlareButton
export {
    FlareButton, 
    flareArr
}