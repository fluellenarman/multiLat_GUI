//This component is to spawn in the testing drone for testing purposes. It will be used to test the drone's movement and behavior in the environment.

import {Component, onMount } from 'solid-js'
import { Show } from 'solid-js'

const IP_addressInput: Component = () => {
    function handleClick() {
        const inputElement = document.getElementById('IP-adress') as HTMLInputElement;
        const ipAddress = inputElement.value;
        console.log("IP Address entered: " + ipAddress);
        window.rendToMainAPI.sendIP(ipAddress);
    }

    return (
        <div>
            <input type="text" id='IP-adress' placeholder="Enter IP Address" />
            <button onClick={handleClick}> IP Address Button </button>
        </div>
    )
}

// export default FlareButton
export {
    IP_addressInput
}