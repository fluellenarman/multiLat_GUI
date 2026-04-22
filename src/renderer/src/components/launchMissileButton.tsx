import {Component, onMount } from 'solid-js'
import { missile } from '../utils/canvasUtils';

const LaunchMissileButton: Component = () => { 
    function handleClick() {
        console.log("Launch button clicked");
        missile.lifespan = 10;
        missile.x = missile.launcherX;
        missile.y = missile.launcherY;
        missile.curDirection = missile.initialDirection;
        missile.alive = true;
    }

    return (
        <button onClick={handleClick}>Launch</button>
    )
}

export default LaunchMissileButton;