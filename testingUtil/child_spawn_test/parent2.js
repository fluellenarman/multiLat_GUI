// Test plan
// Parent spawns python child
// Parent feeds python child ranging data
// python child does multilat calculation.
// python child sends back calculation to JS parent.

import { spawn } from 'child_process'

const pyProcess = spawn('python3', ['-u', 'child2.py'])

pyProcess.stdout.on('data', (data) => { //Data is a buffer, not an object
    // console.log(`stdout: ${data}`);
    const str = data.toString()
    // console.log(str)
    // console.log(`${data}`);
    try {
        const obj = JSON.parse(str)
        // console.log(obj)
        if (obj.id != undefined) {
            console.log(obj)
        }
    } catch {
        console.log("skipping message")
    }
    // console.log(typeof(str))
    // console.log(typeof(`${data}`))


    // console.log(data['id'])
    // console.log(typeof(data))
})

const ranging = [
    23.53720459187964,
    25.826343140289914,
    24.596747752497688,
    21.470910553583888
]

const message = JSON.stringify(ranging) + "\n"
console.log(message)

// Send messages periodically
setInterval(() => {
    console.log("parent2: sending message")
    // const message = `the quick Brown fox` + "\n"; // python sys.stdin looks for a newline
    pyProcess.stdin.write(message);
}, 3000);

console.log("parent2.js END")
