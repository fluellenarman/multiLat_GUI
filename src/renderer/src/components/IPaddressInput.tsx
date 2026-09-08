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
            <input class="text-field add-field" type="text" id='IP-adress' placeholder="Enter IP Address" />
            <button onClick={handleClick} class="icon-button add-button">
                {/* <svg fill="currentColor" viewBox="0 0 16 16" color="currentColor" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;"><path d="M8 1.5a.5.5 0 0 0-1 0V7H1.5a.5.5 0 0 0 0 1H7v5.5a.5.5 0 0 0 1 0V8h5.5a.5.5 0 0 0 0-1H8V1.5Z"></path></svg> */}
                {/* <svg fill="currentColor" viewBox="0 0 16 16" color="currentColor" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;"><path d="M6.013 6.775a1.252 1.252 0 0 0-1.768 0l-.22.22A3.469 3.469 0 0 0 3 9.524c.012.756.26 1.47.71 2.059l-2.063 2.063a.5.5 0 0 0 .708.707l2.07-2.07a3.448 3.448 0 0 0 2.036.652c.938 0 1.888-.363 2.604-1.08l.131-.131a1.252 1.252 0 0 0 0-1.768L6.014 6.774l-.001.001Zm2.475 4.243-.131.131c-.994.995-2.596 1.059-3.568.142a2.481 2.481 0 0 1-.788-1.783c-.01-.682.25-1.324.732-1.806l.22-.22a.247.247 0 0 1 .177-.073c.065 0 .128.024.177.073l3.182 3.182a.25.25 0 0 1 0 .354h-.001Zm5.866-9.372a.5.5 0 0 0-.707 0l-2.07 2.07c-1.37-.999-3.37-.843-4.64.428l-.131.131a1.252 1.252 0 0 0 0 1.768l3.182 3.182c.243.244.563.366.884.366.321 0 .641-.122.884-.366l.22-.22a3.469 3.469 0 0 0 1.025-2.529 3.463 3.463 0 0 0-.71-2.059l2.063-2.063a.502.502 0 0 0 0-.708Zm-3.086 6.651-.22.22a.25.25 0 0 1-.354 0L7.512 5.335a.25.25 0 0 1 0-.354l.131-.131a2.69 2.69 0 0 1 1.897-.79c.61 0 1.211.214 1.671.648.498.468.777 1.101.788 1.783a2.482 2.482 0 0 1-.731 1.806Z"></path></svg> */}
                <svg viewBox="0 0 20 16" fill="currentColor" color="currentColor" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;"><path fill="currentColor" d="M10 9c1.654 0 3.154.673 4.241 1.759l-1.414 1.414C12.103 11.449 11.103 11 10 11s-2.103.449-2.827 1.173l-1.414-1.414A5.982 5.982 0 0 1 10 9zM2.929 7.929C4.818 6.04 7.329 5 10 5s5.182 1.04 7.071 2.929l-1.414 1.414C14.146 7.832 12.137 7 10 7s-4.146.832-5.657 2.343L2.929 7.929zM15.45 2.101a13.966 13.966 0 0 1 4.45 3l-1.414 1.414C16.219 4.249 13.206 3 10.001 3S3.782 4.248 1.516 6.515L.102 5.101A13.955 13.955 0 0 1 10.002 1c1.89 0 3.723.37 5.45 1.101zM9 14a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"></path></svg>
            </button>
        </div>
    )
}

// export default FlareButton
export {
    IP_addressInput
}