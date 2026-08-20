import express from 'express'
import { BrowserWindow } from 'electron'
import os from 'os'

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({ name, address: iface.address });
      }
    }
  }

  console.log("from server, addresses:\n",addresses[0]?.address, '\n');
}

function testFoo() {
    console.log("server.tsx: testFoo called");
}

function startServer(mainWindow: BrowserWindow) {
    getLocalIPAddress();
    const server = express()
    const port = 3003
    server.use(express.json())

    server.listen(port, () => {
        console.log(`ServerQueries.ts: Server is running on http://localhost:${port}`)
    })

    server.get('/', (req, res) => {
        res.send('Hello from the server!')
        console.log("ServerQueries.ts: Received GET request at /")
    })
    server.post('/pingLOS', (req, res) => {
        res.send('Received POST request at /')
        console.log("ServerQueries.ts: Received POST request at /")
        console.log("ServerQueries.ts: Request body:", req.body)
        mainWindow.webContents.send('ping', req.body)
    })
    server.get('/pingMissileLaunch', (req, res) => {
        console.log("ServerQueries.ts: Received POST request at /pingMissileLaunch")
        mainWindow.webContents.send('reqToLaunch', {})     
    })
    server.post('/pingLauncherLoc', (req, res) => {
        console.log("ServerQueries.ts: Received POST request at /pingLauncherLoc")
        console.log(req.body)
        const data = req.body
        mainWindow.webContents.send('reqToLauncherLoc', data)     
    })
    testQuery();

    console.log("ServerQueries.ts: startServer() END\n")
}

async function testQuery() {
    // Using this testURL because it's free and open
    const testURL = 'https://jsonplaceholder.typicode.com/todos/1'
    const response = await fetch(testURL);
    const data = await response.json();
    console.log(data);
    console.log("ServerQueries.ts: testQuery() END\n")
}

export { testFoo, startServer }

/*
ping received/handled will be in this JSON format.

ping {
    ping: true,
}
*/