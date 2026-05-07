//This component is to spawn in the testing drone for testing purposes. It will be used to test the drone's movement and behavior in the environment.

import {Component, onMount } from 'solid-js'
import { Show } from 'solid-js'
import { testDrone } from '../utils/canvasUtils';
import { TestingMode, setTestingMode, toggleTestingMode } from '../utils/testingMode';

const TestDroneButton: Component = () => {
    function handleClick() {
        testDrone.alive = true;
        toggleTestingMode();
    }

    function handleChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        console.log('handleChange called with path:', target.value);

        testDrone.x = 10;
        testDrone.y = 10;
        testDrone.currentPathIndex = 0;
        testDrone.currentPath.length = 0;

        switch (target.value) {
            case "path1":
                testDrone.currentPath.push(
                    { x: 50, y: 50, z: 10},
                    { x: 500, y: 50, z: 10 }
                )
                
                break;
            case "path2":
                console.log("Path 2 selected");
                testDrone.currentPath.push(
                    { x: 10, y: 10, z: 10 },
                    { x: 10, y: 500, z: 10 },
                    { x: 500, y: 500, z: 10 },
                    { x: 500, y: 10, z: 10 }
                );
                break;
            case "path3":
                console.log("Path 3 selected");
                testDrone.currentPath.push(
                    { x: 10, y: 10, z: 10},
                    { x: 10, y: 10, z: 100 }
                )
                break;
            default:
                testDrone.currentPath = [
                    { x: 10, y: 10, z: 10 },
                    { x: 500, y: 10, z: 10 }
                ];
        }
    }

    return (
        <div>
            <button onClick={handleClick}>test Drone</button>
            
            <Show when={TestingMode() == true}>
                <select onChange={(event) => handleChange(event)}>
                    <option value="path1">Test 1</option>
                    <option value="path2">Test 2</option>
                    <option value="path3">Test 3</option>
                </select>
            </Show>
        </div>
    )
}

export default TestDroneButton