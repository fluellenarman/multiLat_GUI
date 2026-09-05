import {Component, onMount } from 'solid-js'
import { testDrone } from '../utils/canvasUtils'
import { missile } from '../utils/canvasUtils';

window.electronAPI.onReqToLaunch(() => {
    console.log("Received reqToLaunch from main process");
    handleClick();
});
function handleClick() {
    console.log("Launch button clicked");

    missile.launcherShown = true;

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
        <div>
            <button onClick={handleClick} class="icon-button launch-button">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" color="currentColor" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"></path></svg>
            </button>
        </div>
    )
}

export default LaunchMissileButton;
export { handleClick };