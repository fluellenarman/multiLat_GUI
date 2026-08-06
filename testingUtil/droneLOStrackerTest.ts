/*
This is a test file that will send test pings to the server
*/

console.log("droneLOStrackerTest.ts: STARTING TESTS")

async function sendTestPing() {
    const testURL = 'http://localhost:3003';
    const pingData = {
        ping: true,
    };

    fetch(testURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pingData),
        keepalive: true
    }).catch(() => {}); // Ignore any errors
}

let sendPingCount = 0;
let sendingPing = true;
let pausePingCount = 4

setInterval(() => {
    if (sendingPing == true) {
        sendTestPing();
        sendPingCount += 1;
    } else if (sendingPing == false) {
        pausePingCount -= 1;
    }

    if (sendPingCount >= 4) {
        sendingPing = false;
        sendPingCount = 0;
    } else if (pausePingCount <= 0) {
        sendingPing = true;
    }
}, 300)

