import express, { Request, Response } from 'express'
import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron'

import { colorPrint } from './logging'
import DiscoveryNetwork, { getWifiAddress } from '../network/discovery'

let discoveryNetwork: DiscoveryNetwork

// --- Renderer to Main to API --- //

ipcMain.on('connect-to-address', (event: IpcMainEvent, data) => {
	connectToAddress(event, data)
})

ipcMain.on('send-drone-location', (event: IpcMainEvent, location) => {
	sendDroneLocation(event, location)
})

ipcMain.on('send-missile-location', (event: IpcMainEvent, location) => {
	console.log('HERE')
	sendMissileLocation(event, location)
})

ipcMain.on('send-flare', (event: IpcMainEvent) => {
	sendFlare(event)
})

ipcMain.on('send-jam', (event: IpcMainEvent) => {
	sendJam(event)
})

ipcMain.on('send-drone-status', (event: IpcMainEvent, data) => {
	sendDroneStatus(event, data)
})

// --- Renderer to Main to Renderer --- //

ipcMain.handle('get-local-address', () => {
	return getWifiAddress()
})

ipcMain.handle('get-devices', () => {
	return discoveryNetwork.getDevices()
})

// --- Server API Endpoints --- //

function startServer(mainWindow: BrowserWindow, discovery: DiscoveryNetwork, port: number = 3003) {
	discoveryNetwork = discovery

	const server = express()
	server.use(express.json())

	server.listen(port, () => {
		console.log(`ServerQueries.ts: Server is running on http://${getWifiAddress()}:${port}`)
	})

	server.get('/', (_, res: Response) => {
		colorPrint('cyan', 'GET /')
		res.send('Hello from Blue GUI').status(200)
	})

	server.get('/launch-missile', (_, res) => {
		colorPrint('cyan', 'GET /launch-missile')
		mainWindow.webContents.send('launch-missile')
		res.sendStatus(200)
	})

	server.get('/line-of-sight', (_: Request, res: Response) => {
		colorPrint('cyan', 'GET /line-of-sight')
		sendLineOfSight(mainWindow)
		mainWindow.webContents.send('line-of-sight')
		res.sendStatus(200)
	})

	server.post('/missile-launcher-location', (req: Request, res: Response) => {
		colorPrint('cyan', 'POST /missile-launcher-location')
		mainWindow.webContents.send('missile-launcher-location', req.body)
		res.sendStatus(200)
	})
	server.post('/line-of-sight-location', (req: Request, res: Response) => {
		colorPrint('cyan', 'POST /line-of-sight-location')
		mainWindow.webContents.send('line-of-sight-location', req.body)
		res.sendStatus(200)
	})
}

// --- External API Endpoints --- //

async function connectToAddress(event: IpcMainEvent, data) {
	const { id, ip } = data
	try {
		const url = `http://${ip}`
		await fetch(url)
		event.sender.send('disable-ip-button', {})
		discoveryNetwork.setAddress(id, ip)
		colorPrint('cyan', url)
	} catch (error) {
		event.sender.send('enable-ip-button', {})
		colorPrint('red', 'connectToAddress():', error)
	}
}

async function sendDroneLocation(event: IpcMainEvent, location) {
	const id = 'red-gui'
	const api = '/drone-location'
	try {
		const address = await discoveryNetwork.getAddress(id)
		if (!address) {
			event.sender.send('enable-ip-button', { id: id, api: api })
			throw Error(`failed to connect to ${id}`)
		}

		const url = `http://${address}${api}`
		const payload = { x: location[0], y: location[1] }
		await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})
		colorPrint('cyan', url)
	} catch (error) {
		colorPrint('red', 'sendDroneLocation():', error)
		discoveryNetwork.deleteAddress(id)
	}
}

async function sendMissileLocation(event: IpcMainEvent, location) {
	const id = 'red-gui'
	const api = '/missile-location'
	try {
		const address = await discoveryNetwork.getAddress(id)
		if (!address) {
			event.sender.send('enable-ip-button', { id: id, api: api })
			throw Error(`failed to connect to ${id}`)
		}

		const url = `http://${address}${api}`
		const payload = { x: location[0], y: location[1] }
		await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})
		colorPrint('cyan', url)
	} catch (error) {
		colorPrint('red', 'sendMissileLocation():', error)
		discoveryNetwork.deleteAddress(id)
	}
}
async function sendLineOfSight(mainWindow: BrowserWindow) {
	const id = 'red-gui'
	const api = '/line-of-sight'
	try {
		const address = await discoveryNetwork.getAddress(id)
		if (!address) {
			mainWindow.webContents.send('enable-ip-button', { id: id, api: api })
			throw Error(`failed to connect to ${id}`)
		}

		const url = `http://${address}${api}`
		await fetch(url, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})
		colorPrint('cyan', url)
	} catch (error) {
		colorPrint('red', 'sendLineOfSight():', error)
		discoveryNetwork.deleteAddress(id)
	}
}
async function sendFlare(event: IpcMainEvent) {
	let intervalCount = 0
	const intervalMax = 4

	const interval = setInterval(async () => {
		const id = 'red-gui'
		const api = '/flare'
		try {
			const address = await discoveryNetwork.getAddress(id)
			if (!address) {
				event.sender.send('enable-ip-button', { id: id, api: api })
				throw Error(`failed to connect to ${id}`)
			}

			const url = `http://${address}${api}`
			await fetch(url, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			})
			colorPrint('cyan', url)
		} catch (error) {
			colorPrint('red', 'sendFlare():', error)
			discoveryNetwork.deleteAddress(id)
			clearInterval(interval)
		}

		intervalCount++
		if (intervalCount >= intervalMax) {
			clearInterval(interval)
		}
	}, 1000)
}

async function sendJam(event: IpcMainEvent) {
	const id = 'red-gui'
	const api = '/jam'
	try {
		const address = await discoveryNetwork.getAddress(id)
		if (!address) {
			event.sender.send('enable-ip-button', { id: id, api: api })
			throw Error(`failed to connect to ${id}`)
		}

		const url = `http://${address}${api}`
		await fetch(url, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})
		colorPrint('cyan', url)
	} catch (error) {
		colorPrint('red', 'sendJam():', error)
		discoveryNetwork.deleteAddress(id)
	}
}

async function sendDroneStatus(event: IpcMainEvent, data) {
	const id = 'red-gui'
	const api = '/drone-status'
	try {
		const address = await discoveryNetwork.getAddress(id)
		if (!address) {
			event.sender.send('enable-ip-button', { id: id, api: api })
			throw Error(`failed to connect to ${id}`)
		}

		const url = `http://${address}${api}`
		const payload = { droneStatus: data }
		await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})
		colorPrint('cyan', url)
	} catch (error) {
		colorPrint('red', 'sendDroneStatus():', error)
		discoveryNetwork.deleteAddress(id)
	}
}

export { startServer }
