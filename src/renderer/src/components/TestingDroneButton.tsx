//This component is to spawn in the testing drone for testing purposes. It will be used to test the drone's movement and behavior in the environment.

import {Component, onMount } from 'solid-js'
import { VsAdd } from 'solid-icons/vs'
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
            case "path4":
                console.log("Path 4 selected");
                testDrone.currentPath.push(
                    { x: 10, y: 10, z: 10 },
                    { x: 50, y: 50, z: 15 },
                    { x: 100, y: 100, z: 20 },
                    { x: 150, y: 150, z: 30 },
                    { x: 200, y: 200, z: 40 },
                    { x: 250, y: 250, z: 50 },
                    { x: 300, y: 300, z: 60 },
                    { x: 350, y: 350, z: 70 },
                    { x: 400, y: 400, z: 80 },
                    { x: 450, y: 450, z: 90 },
                    { x: 500, y: 500, z: 100 },
                    { x: 450, y: 450, z: 90 },
                    { x: 400, y: 400, z: 80 },
                    { x: 350, y: 350, z: 70 },
                    { x: 300, y: 300, z: 60 },
                    { x: 250, y: 250, z: 50 },
                    { x: 200, y: 200, z: 40 },
                    { x: 150, y: 150, z: 30 },
                    { x: 100, y: 100, z: 20 },
                    { x: 50, y: 50, z: 15 },
                    { x: 10, y: 10, z: 10 }
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
            <button onClick={handleClick} class="icon-button drone-button">
                <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" color="currentColor" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;"><path d="M10 10h4v4h-4v-4M10 10 6.5 6.5M9.96 6A3.5 3.5 0 1 0 6 9.96M14 10l3.5-3.5M18 9.96A3.5 3.5 0 1 0 14.04 6M14 14l3.5 3.5M14.04 18A3.5 3.5 0 1 0 18 14.04M10 14l-3.5 3.5M6 14.04A3.5 3.5 0 1 0 9.96 18"></path></svg>
            </button>
            
            <Show when={TestingMode() == true}>
                <select onChange={(event) => handleChange(event)} class="select-field drone-field">
                    <option value="path1">Test 1</option>
                    <option value="path2">Test 2</option>
                    <option value="path3">Test 3</option>
                    <option value="path4">Test 4</option>
                </select>
            </Show>
        </div>
    )
}

export default TestDroneButton