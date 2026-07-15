import { spawn } from 'child_process'

// console.log("HELLO WORLD");

const py = spawn('python3', ['-u', 'child.py'])  // -u for unbuffered output

// Listen for data from stdout (e.g., print() statements in Python)
py.stdout.on('data', (data) => {
    const message = data.toString().trim();
    console.log(`Parent received: ${message}`);
});

py.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
});

py.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
});

// // Send initial message
// setTimeout(() => {
//     console.log("Parent: Sending initial message");
//     py.stdin.write("Hello from Parent\n");
// }, 1000);

// Send messages periodically
setInterval(() => {
    const message = `the quick Brown fox`;
    console.log(`Parent: Sending ${message}`);
    py.stdin.write(message + "\n");
}, 3000);

console.log('end of parentjs')