import { contextBridge, ipcRenderer } from 'electron'

export const toMainAPI = {
	rangingData: (data) => ipcRenderer.send('ranging-data', data),

	connectToAddress: (data) => ipcRenderer.send('connect-to-address', data),

	sendDroneLocation: (data) => ipcRenderer.send('send-drone-location', data),
	sendMissileLocation: (data) => ipcRenderer.send('send-missile-location', data),

	sendDroneStatus: (data) => ipcRenderer.send('send-drone-status', data),

	sendFlare: () => ipcRenderer.send('send-flare'),
	sendJam: () => ipcRenderer.send('send-jam')
}

export const toRendererAPI = {
	serialData: (callback) => ipcRenderer.on('serial-data', (_, data) => callback(data)),

	lineOfSight: (callback) => ipcRenderer.on('line-of-sight', (_, data) => callback(data)),
	launchMissile: (callback) => ipcRenderer.on('launch-missile', () => callback()),

	missileLauncherLocation: (callback) =>
		ipcRenderer.on('missile-launcher-location', (_, data) => callback(data)),
	lineOfSightLocation: (callback) =>
		ipcRenderer.on('line-of-sight-location', (_, data) => callback(data)),

	getLocalAddress: () => ipcRenderer.invoke('get-local-address'),
	getDevices: () => ipcRenderer.invoke('get-devices'),

	onEnableAddressButton: (callback) =>
		ipcRenderer.on('enable-ip-button', (_event, data) => callback(data)),
	onDisableAddressButton: (callback) =>
		ipcRenderer.on('disable-ip-button', (_event, data) => callback(data))
}

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('toMain', toMainAPI)
		contextBridge.exposeInMainWorld('toRenderer', toRendererAPI)
	} catch (error) {
		console.error(error)
	}
} else {
	// @ts-ignore (define in dts)
	window.toMain = toMainAPI
	// @ts-ignore (define in dts)
	window.toRenderer = toRendererAPI
}
