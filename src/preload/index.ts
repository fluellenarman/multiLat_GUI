import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
	onSerialData: (callback) => ipcRenderer.on('serial-data', (_event, data) => callback(data))
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('electron', electronAPI)
		contextBridge.exposeInMainWorld('api', api)

		// one-way: renderer -> main, no response needed
		contextBridge.exposeInMainWorld('rendToMainAPI', {
			sendMessage: (data) => ipcRenderer.send('message-channel', data),
			sendIP: (data) => ipcRenderer.send('IP-address', data),
			sendDroneLoc: (data) => ipcRenderer.send('droneLoc', data),
			sendMissileLoc: (data) => ipcRenderer.send('missileLoc', data),
			sendFlarePing: (data) => ipcRenderer.send('flarePing', data),
			sendDroneStatusPing: (data) => ipcRenderer.send('droneStatus', data)
		})
		contextBridge.exposeInMainWorld('electronAPI', {
			// main to renderer
			onPing: (callback) => ipcRenderer.on('ping', (_event, data) => callback(data)),
			onReqToLaunch: (callback) => ipcRenderer.on('reqToLaunch', () => callback()),
			onReqToLauncherLoc: (callback) =>
				ipcRenderer.on('reqToLauncherLoc', (_event, data) => callback(data)),
			onReqToLOSLoc: (callback) =>
				ipcRenderer.on('reqToLOSLoc', (_event, data) => callback(data)),
			onIPforHTML: (callback) =>
				ipcRenderer.on('reqIP-for-HTML', (_event, data) => callback(data)),

			getLocalIP: () => ipcRenderer.invoke('get-local-ip'),
			getDevices: () => ipcRenderer.invoke('get-devices'),

			onIP_feedback: (callback) =>
				ipcRenderer.on('sendIP-feedback', (_event, data) => callback(data)),
			onEnableAddressButton: (callback) =>
				ipcRenderer.on('enable-ip-button', (_event, value) => callback(value)),
			onDisableAddressButton: (callback) =>
				ipcRenderer.on('disable-ip-button', (_event, value) => callback(value))
		})
	} catch (error) {
		console.error(error)
	}
} else {
	// @ts-ignore (define in dts)
	window.electron = electronAPI
	// @ts-ignore (define in dts)
	window.api = api
}
