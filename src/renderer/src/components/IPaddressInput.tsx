//This component is to spawn in the testing drone for testing purposes. It will be used to test the drone's movement and behavior in the environment.

import {Component} from 'solid-js'
import { Show } from 'solid-js'
import toast from 'solid-toast';

const IP_addressInput: Component = () => {

    window.electronAPI.onIP_feedback((data) => {
        console.log("IP_addressInput.tsx: onIP_feedback: HIT")
        if (data == "progress") {
            toast.loading("Connecting to IP address...", {duration: 3000})
            console.log("IP_addressInput.tsx: onReqToLOSLoc: progress")
        } else if (data == "success") {
            console.log("IP_addressInput.tsx: onReqToLOSLoc: success")
            toast.success("Successfully connected to IP address.", {duration: 5000})
        } else if (data == "failed") {
            console.log("IP_addressInput.tsx: onReqToLOSLoc: failed")
            toast.error("Failed to connect to IP address. Please check the address and try again.", {duration: 5000})
        }
    })
    
    function handleClick() {
        const inputElement = document.getElementById('IP-adress') as HTMLInputElement;
        const ipAddress = inputElement.value;
        console.log("IP Address entered: " + ipAddress);
        window.rendToMainAPI.sendIP(ipAddress);
    }

    return (
        <div>
            <input class="text-field add-field" type="text" id='IP-adress' placeholder="Enter IP Address"/>
            <button onClick={handleClick} class="icon-button add-button" data-tooltip="Connect to Network">
                <svg viewBox="0 0 20 16" fill="currentColor" color="currentColor" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;"><path fill="currentColor" d="M10 9c1.654 0 3.154.673 4.241 1.759l-1.414 1.414C12.103 11.449 11.103 11 10 11s-2.103.449-2.827 1.173l-1.414-1.414A5.982 5.982 0 0 1 10 9zM2.929 7.929C4.818 6.04 7.329 5 10 5s5.182 1.04 7.071 2.929l-1.414 1.414C14.146 7.832 12.137 7 10 7s-4.146.832-5.657 2.343L2.929 7.929zM15.45 2.101a13.966 13.966 0 0 1 4.45 3l-1.414 1.414C16.219 4.249 13.206 3 10.001 3S3.782 4.248 1.516 6.515L.102 5.101A13.955 13.955 0 0 1 10.002 1c1.89 0 3.723.37 5.45 1.101zM9 14a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"></path></svg>
            </button>
        </div>
    )
}

// export default FlareButton
export {
    IP_addressInput
}