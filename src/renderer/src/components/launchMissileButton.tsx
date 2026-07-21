import {Component, onMount } from 'solid-js'
import { testDrone } from '../utils/canvasUtils'
import { missile } from '../utils/canvasUtils';

const LaunchMissileButton: Component = () => { 
    function handleClick() {
        console.log("Launch button clicked");
        missile.lifespan = 6; // should only travel roughly 1 square
        missile.x = missile.launcherX;
        missile.y = missile.launcherY;
        missile.curDirection = missile.initialDirection;
        missile.target = testDrone;
        missile.alive = true;
    }

    return (
        <button onClick={handleClick}>Launch</button>
    )
}

export default LaunchMissileButton;