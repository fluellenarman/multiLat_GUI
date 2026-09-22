import express from 'express'
import { BrowserWindow, ipcMain } from 'electron'
import { DiscoveryNetwork, getWifiAddress } from '../network/discovery'

let discoveryNetwork: DiscoveryNetwork

function testFoo() {
	console.log('server.tsx: testFoo called')
}

ipcMain.handle('get-local-ip', () => {
	return getWifiAddress()
})

ipcMain.on('IP-address', (event, data) => {
	console.log('Received IP address from renderer:', data)
	sendManualAddress(event, data) // Later, will need to change the query to be a POST request with correct data.
})

ipcMain.handle('get-devices', () => {
	return discoveryNetwork.getDevices()
})

ipcMain.on('droneLoc', (event, loc) => {
	// console.log("Received droneLoc from renderer:", loc);
	sendDroneLocRedGUI(event, loc)
})

ipcMain.on('missileLoc', (event, loc) => {
	// console.log("Received missileLoc from renderer:", loc);
	sendMissileLocRedGUI(event, loc)
})

ipcMain.on('flarePing', (event, data) => {
	console.log('Server.tsx: Received flarePing from renderer:')

	let intervalCount = 0
	const intervalMax = 4

	const id = setInterval(() => {
		intervalCount++
		sendFlarePingRedGUI(event)

		if (intervalCount >= intervalMax) {
			intervalCount = 0
			clearInterval(id)
		}
	}, 1000)
	// sendFlarePingRedGUI();
})

ipcMain.on('jam-ping', (event) => {
	sendJamPing(event)
})

ipcMain.on('droneStatus', (event, data) => {
	sendDroneStatusPing(event, data)
})

function startServer(mainWindow: BrowserWindow, discovery: DiscoveryNetwork) {
	discoveryNetwork = discovery
	const selfIP_address = getWifiAddress()
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
		sendLOS_pingRedGUI(mainWindow)
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

async function sendManualAddress(event, data) {
	const { id, ip } = data
	const port = 3000
	try {
		const address = `${ip}:${port}`
		const url = `http://${address}`
		await fetch(url)
		event.sender.send('disable-ip-button', {})
		discoveryNetwork.setAddress(id, address)
	} catch {
		event.sender.send('enable-ip-button', {})
	}
}

async function sendDroneLocRedGUI(event, loc) {
	const id = 'red-gui'
	const api = '/droneLoc'
	try {
		const address = await discoveryNetwork.getAddress(id)
		if (!address) {
			console.log(`sendDroneLocRedGUI(): failed to connect to ${id}`)
			event.sender.send('enable-ip-button', { id: id, api: api })
			return
		}

		const url = `http://${address}${api}`
		const payload = { x: loc[0], y: loc[1] }
		await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})
		console.log(url)
	} catch (error) {
		console.error('sendDroneLocRedGUI():', error)
		discoveryNetwork.deleteAddress(id)
	}
}

async function sendMissileLocRedGUI(event, loc) {
	const id = 'red-gui'
	const api = '/missileLOC'
	try {
		const address = await discoveryNetwork.getAddress(id)
		if (!address) {
			console.log(`sendMissileLocRedGUI(): failed to connect to ${id}`)
			event.sender.send('enable-ip-button', { id: id, api: api })
			return
		}

		const url = `http://${address}${api}`
		const payload = { x: loc[0], y: loc[1] }
		await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})
		console.log(url)
	} catch (error) {
		console.error('Error in sendMissileLocRedGUI():', error)
		discoveryNetwork.deleteAddress(id)
	}
}
async function sendLOS_pingRedGUI(mainWindow: BrowserWindow) {
	const id = 'red-gui'
	const api = '/LOS-ping'
	try {
		const address = await discoveryNetwork.getAddress(id)
		if (!address) {
			console.log(`sendLOS_pingRedGUI(): failed to connect to ${id}`)
			mainWindow.webContents.send('enable-ip-button', { id: id, api: api })
			return
		}

		const url = `http://${address}${api}`
		await fetch(url, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})
		console.log(url)
	} catch (error) {
		console.error('Error in sendLOS_pingRedGUI():', error)
		discoveryNetwork.deleteAddress(id)
	}
}
async function sendFlarePingRedGUI(event) {
	const id = 'red-gui'
	const api = '/FlarePing'
	try {
		const address = await discoveryNetwork.getAddress(id)
		if (!address) {
			console.log(`sendFlarePingRedGUI(): failed to connect to ${id}`)
			event.sender.send('enable-ip-button', { id: id, api: api })
			return
		}

		const url = `http://${address}${api}`
		await fetch(url, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})
		console.log(url)
	} catch (error) {
		console.error('Error in sendFlarePingRedGUI():', error)
		discoveryNetwork.deleteAddress(id)
	}
}

async function sendJamPing(event) {
	const id = 'red-gui'
	const api = '/jamPing'
	try {
		const address = await discoveryNetwork.getAddress(id)
		if (!address) {
			console.log(`sendJamPing(): failed to connect to ${id}`)
			event.sender.send('enable-ip-button', { id: id, api: api })
			return
		}

		const url = `http://${address}${api}`
		await fetch(url, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})
		console.log(url)
	} catch (error) {
		console.error('Error in sendJamPing():', error)
		discoveryNetwork.deleteAddress(id)
	}
}

async function sendDroneStatusPing(event, data) {
	const id = 'red-gui'
	const api = '/droneStatus'
	try {
		const address = await discoveryNetwork.getAddress(id)
		if (!address) {
			console.log(`sendDroneStatusPing(): failed to connect to ${id}`)
			event.sender.send('enable-ip-button', { id: id, api: api })
			return
		}

		const url = `http://${address}${api}`
		const payload = { droneStatus: data }
		await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})
		console.log(url)
	} catch (error) {
		console.error('Error in sendDroneStatusPing():', error)
		discoveryNetwork.deleteAddress(id)
	}
}

export { testFoo, startServer }
