import express from 'express'
import { BrowserWindow, ipcMain } from 'electron'
import os from 'os'
import { Discovery } from '../network/discovery'

let networkURL = ''

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces()
  const addresses = []

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({ name, address: iface.address })
      }
    }
  }

  const selfIP_address = addresses[0]?.address
  console.log(addresses)
  console.log('from server, addresses:\n', addresses[0]?.address, '\n')
  console.log(`http://${addresses[0]?.address}:3003/`)
  return selfIP_address
}

function testFoo() {
  console.log('server.tsx: testFoo called')
}

ipcMain.handle('get-local-ip', () => {
  return getLocalIPAddress()
})
ipcMain.on('IP-address', (event, ipAddress) => {
  console.log('Received IP address from renderer:', ipAddress)
  const redPort = 3000
  const url = `http://${ipAddress}:${redPort}/`
  console.log('Constructed URL:', url)
  testQuery2(url) // Later, will need to change the query to be a POST request with correct data.
})
ipcMain.on('droneLoc', (event, loc) => {
  // console.log("Received droneLoc from renderer:", loc);
  sendDroneLocRedGUI(loc)
})
ipcMain.on('missileLoc', (event, loc) => {
  // console.log("Received missileLoc from renderer:", loc);
  sendMissileLocRedGUI(loc)
})
ipcMain.on('flarePing', (event, data) => {
  console.log('Server.tsx: Received flarePing from renderer:')

  let intervalCount = 0
  const intervalMax = 4

  const id = setInterval(() => {
    intervalCount++
    sendFlarePingRedGUI()

    if (intervalCount >= intervalMax) {
      intervalCount = 0
      clearInterval(id)
    }
  }, 1000)
  // sendFlarePingRedGUI();
})

function startServer(mainWindow: BrowserWindow) {
  const discovery = new Discovery()
  discovery.start()

  const selfIP_address = getLocalIPAddress()
  const server = express()
  const port = 3003
  server.use(express.json())

  console.log('server.tsx: startServer(): reqIP-for-HTML: ', selfIP_address)
  if (mainWindow.webContents.isLoading()) {
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.send('reqIP-for-HTML', selfIP_address)
    })
  } else {
    mainWindow.webContents.send('reqIP-for-HTML', selfIP_address)
  }

  server.listen(port, () => {
    console.log(`ServerQueries.ts: Server is running on http://localhost:${port}`)
  })

  server.get('/', (req, res) => {
    res.send('Hello from BLUE GUI server!')
    console.log('ServerQueries.ts: Received GET request at /')
  })
  server.post('/pingLOS', (req, res) => {
    // res.send('Received POST request at /pingLOS')
    sendLOS_pingRedGUI()
    // console.log("ServerQueries.ts: Received POST request at /")
    // console.log("ServerQueries.ts: Request body:", req.body)
    mainWindow.webContents.send('ping', req.body)
  })
  server.get('/pingMissileLaunch', (req, res) => {
    console.log('ServerQueries.ts: Received POST request at /pingMissileLaunch')
    mainWindow.webContents.send('reqToLaunch', {})
  })
  server.post('/pingLauncherLoc', (req, res) => {
    res.send('Received POST request at /pingLauncherLoc')
    console.log('ServerQueries.ts: Received POST request at /pingLauncherLoc')
    // console.log(req.body)
    const data = req.body
    mainWindow.webContents.send('reqToLauncherLoc', data)
  })
  server.post('/pingLOSLoc', (req, res) => {
    console.log('ServerQueries.ts: Received POST request at /pingLOSLoc')
    // console.log(req.body)
    const data = req.body
    mainWindow.webContents.send('reqToLOSLoc', data)
  })
  testQuery()

  console.log('ServerQueries.ts: startServer() END\n')
}

async function testQuery() {
  // Using this testURL because it's free and open
  const testURL = 'https://jsonplaceholder.typicode.com/todos/1'
  const response = await fetch(testURL)
  const data = await response.json()
  console.log(data)
  console.log('ServerQueries.ts: testQuery() END\n')
}
async function testQuery2(url) {
  const response = await fetch(url)
  const data = await response.text()
  console.log(data)
  console.log('ServerQueries.ts: testQuery2() END\n')
  networkURL = url
}
async function sendDroneLocRedGUI(loc) {
  const redPort = 3000
  const localhost_url = `http://localhost:${redPort}/droneLoc`
  const payload = { x: loc[0], y: loc[1] }
  // console.log(payload)
  try {
    let targetURL = localhost_url
    // console.log(networkURL)
    if (networkURL != '') {
      targetURL = `${networkURL}/droneLoc`
      console.log('Using network URL: ', networkURL)
    }
    // console.log(`Sending drone location to ${targetURL}`);
    await fetch(targetURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    // console.error("Error in launcherLocQuery():", error);
  }
}
async function sendMissileLocRedGUI(loc) {
  const redPort = 3000
  const localhost_url = `http://localhost:${redPort}/missileLoc`
  console.log(loc)
  const payload = { x: loc[0], y: loc[1] }
  console.log('sendMissileLocRedGUI')
  // console.log(payload)
  try {
    let targetURL = localhost_url
    // console.log(networkURL)
    if (networkURL != '') {
      targetURL = `${networkURL}missileLoc`
      console.log('Using network URL: ', networkURL)
    }
    console.log(`Sending drone location to ${targetURL}`)
    await fetch(targetURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    // console.error("Error in launcherLocQuery():", error);
  }
}
async function sendLOS_pingRedGUI() {
  const redPort = 3000
  const localhost_url = `http://localhost:${redPort}/LOS-ping`
  // console.log('sendLOS_pingRedGUI')
  try {
    let targetURL = localhost_url
    // console.log(networkURL)
    if (networkURL != '') {
      targetURL = `${networkURL}LOS-ping`
      console.log('Using network URL: ', networkURL)
    }
    // console.log(`Sending LOS ping to ${targetURL}`);
    await fetch(targetURL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // console.error("Error in launcherLocQuery():", error);
  }
}
async function sendFlarePingRedGUI() {
  const redPort = 3000
  const localhost_url = `http://localhost:${redPort}/FlarePing`
  console.log('server.tsx: sendLOS_pingRedGUI')
  try {
    let targetURL = localhost_url
    // console.log(networkURL)
    if (networkURL != '') {
      targetURL = `${networkURL}FlarePing`
      console.log('Using network URL: ', networkURL)
    }
    // console.log(`Sending LOS ping to ${targetURL}`);
    await fetch(targetURL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // console.error("Error in launcherLocQuery():", error);
  }
}

export { testFoo, startServer }

/*
ping received/handled will be in this JSON format.

ping {
    ping: true,
}
*/
