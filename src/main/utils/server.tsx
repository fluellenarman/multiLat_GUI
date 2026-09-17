import express from 'express'
import { BrowserWindow, ipcMain } from 'electron'
import {colorPrint} from './logging'
import { DiscoveryNetwork, getDeviceAddresses } from '../network/discovery'

let discoveryNetwork: DiscoveryNetwork

function testFoo() {
	console.log('server.tsx: testFoo called')
}

ipcMain.handle('get-local-ip', () => {
	return getDeviceAddresses()[0].address
})
ipcMain.on('IP-address', (event, ipAddress) => {
	console.log('Received IP address from renderer:', ipAddress)
	const redPort = 3000
	const url = `http://${ipAddress}:${redPort}`
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

function startServer(mainWindow: BrowserWindow, discovery: DiscoveryNetwork) {
	discoveryNetwork = discovery
	const selfIP_address = getDeviceAddresses()[0].address
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
		res.send('Received POST request at /pingLOS')
		sendLOS_pingRedGUI()
		// console.log("ServerQueries.ts: Received POST request at /")
		// console.log("ServerQueries.ts: Request body:", req.body)
		mainWindow.webContents.send('ping', req.body)
	})
	server.get('/pingMissileLaunch', (req, res) => {
		res.send('Received GET request at /pingMissileLaunch')
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
		res.send('Received POST request at /pingLOSLoc')
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
	console.log(url)
	console.log('ServerQueries.ts: testQuery2() END\n')
	discoveryNetwork.setAddress('red-gui', url)
}
async function sendDroneLocRedGUI(loc) {
	try {
		const address = await discoveryNetwork.getAddress('red-gui')
		if (!address) {
			console.log('sendDroneLocRedGUI(): failed to connect to red gui')
			return
		}

		const url = `http://${address}/droneLoc`
		const payload = { x: loc[0], y: loc[1] }
		await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})
		console.log(url)
	} catch (error) {
		console.error('sendDroneLocRedGUI():', error)
	}
}

async function sendMissileLocRedGUI(loc) {
	try {
		const address = await discoveryNetwork.getAddress('red-gui')
		if (!address) {
			console.log('sendMissileLocRedGUI(): failed to connect to red gui')
			return
		}

		const url = `http://${address}/missileLoc`
		const payload = { x: loc[0], y: loc[1] }
		await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})
		console.log(url)
	} catch (error) {
		console.error('Error in sendMissileLocRedGUI():', error)
	}
}
async function sendLOS_pingRedGUI() {
	try {
		const address = await discoveryNetwork.getAddress('red-gui')
		if (!address) {
			console.log('sendLOS_pingRedGUI(): failed to connect to red gui')
			return
		}

		const url = `http://${address}/LOS-ping`
		await fetch(url, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})
		console.log(url)
	} catch (error) {
		console.error('Error in sendLOS_pingRedGUI():', error)
	}
}
async function sendFlarePingRedGUI() {
	try {
		const address = await discoveryNetwork.getAddress('red-gui')
		if (!address) {
			console.log('sendFlarePingRedGUI(): failed to connect to red gui')
			return
		}

		const url = `http://${address}/FlarePing`
		await fetch(url, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})
		console.log(url)
	} catch (error) {
		console.error('Error in sendFlarePingRedGUI():', error)
	}
}

export { testFoo, startServer }
