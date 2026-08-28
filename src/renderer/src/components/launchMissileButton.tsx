import {Component, onMount } from 'solid-js'
import { testDrone } from '../utils/canvasUtils'
import { missile } from '../utils/canvasUtils';

window.electronAPI.onReqToLaunch(() => {
    console.log("Received reqToLaunch from main process");
    handleClick();
});
function handleClick() {
    console.log("Launch button clicked");
    missile.initialLifeSpan = 6; // should only travel roughly 1 square
    missile.lifespan = missile.initialLifeSpan; // should only travel roughly 1 square
    missile.x = missile.launcherX;
    missile.y = missile.launcherY;
    missile.z = 5
    
    missile.curDirection = missile.initialDirection;
    missile.target = testDrone;
    missile.alive = true;
    missile.lifeCycle = 0; // launch phase
    missile.LOSonMidcourse = false;

    missile.initialSpeed = 2;
    missile.turnRate = missile.midcourseTurnRate;

    missile.launched = false
}

const LaunchMissileButton: Component = () => { 
    return (
        <button onClick={handleClick}>Launch</button>
    )
}

export default LaunchMissileButton;
export { handleClick };