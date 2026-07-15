import { spawn } from 'child_process';

var pyProcess;

const ranging = [
    0,
    0,
    0,
    0
]

function spawnProcessAndListen() {
    console.log("Spawning Python process...");
    pyProcess = spawn('python3', ['-u', 'testingUtil/child_spawn_test/child2.py'])

    pyProcess.stdout.on('data', (data) => { //Data is a buffer, not an object
        const str = data.toString()

        try {
            const obj = JSON.parse(str)
            // console.log(obj)
            if (obj.id != undefined) {
                console.log("received multilat from child")
                console.log(obj) // Send obj to renderer via IPC
            }
        } catch {
            // console.log("skipping message")
        }
    })


}

function sendMessageToChild(ranging) {
    const message = JSON.stringify(ranging) + '\n';
    pyProcess.stdin.write(message);
}

export { spawnProcessAndListen, pyProcess };