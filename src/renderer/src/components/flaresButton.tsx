//This component is to spawn in the testing drone for testing purposes. It will be used to test the drone's movement and behavior in the environment.

import {Component, onMount } from 'solid-js'
import { Show } from 'solid-js'
import { testDrone } from '../utils/canvasUtils';
import { TestingMode, setTestingMode, toggleTestingMode } from '../utils/testingMode';
import { flareState } from "../utils/canvasUtils";

let flareArr = [];
const FlareButton: Component = () => {
    
    let frameCounter: number = 0;
    let curFlares: number = 0;
    function handleFrame(interval: NodeJS.Timeout) {
        frameCounter++;

        if (frameCounter >= 15) {
            frameCounter = 0
            let flare = new flareState();
            flare.x = testDrone.x;
            flare.y = testDrone.y;
            flare.z = testDrone.z;
            flare.lifespan = 5;
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
        console.log("Flare button clicked");
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