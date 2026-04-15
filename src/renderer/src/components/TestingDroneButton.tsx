//This component is to spawn in the testing drone for testing purposes. It will be used to test the drone's movement and behavior in the environment.

import {Component, onMount } from 'solid-js'
import { testDrone } from '../utils/canvasUtils';
import { TestingMode, setTestingMode, toggleTestingMode } from '../utils/testingMode';

const TestDroneButton: Component = () => {
    function handleClick() {
        testDrone.alive = true;
        toggleTestingMode();
    }

    return (
        <button onClick={handleClick}>test Drone</button>
    )
}

export default TestDroneButton