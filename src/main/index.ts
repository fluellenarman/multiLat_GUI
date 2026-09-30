import os from 'os'
import { join } from 'path'
import express from 'express'
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { SerialPort } from 'serialport'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { ReadlineParser } from '@serialport/parser-readline'

import { colorPrint } from './utils/logging'
import DiscoveryNetwork from './network/discovery'
import { startServer } from './utils/server'
import { spawnProcessAndListen, pyProcess, setRangingData } from './utils/spawnChild'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
	const platform = os.platform()

	const mainWindow = new BrowserWindow({
		width: 700,
		height: 750,
		resizable: false,
		show: false,
		autoHideMenuBar: true,
		...(platform === 'linux' ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			sandbox: false
		}
	})

	const discoveryNetwork = new DiscoveryNetwork()
	startServer(mainWindow, discoveryNetwork)

	if (import.meta.env.MODE != 'test') {
		spawnProcessAndListen(mainWindow)
	} else {
		colorPrint('yellow', 'index.ts: Skipping spawning serial/multilat process')
	}

	let serialPath: string
	switch (platform) {
		case 'win32':
			serialPath = 'COM7'
			break
		case 'linux':
			serialPath = '/dev/ttyACM0'
			break
		default:
			throw new Error(`Unsupported OS platform: ${platform}`)
	}

	const port = new SerialPort({
		path: serialPath,
		baudRate: 115200,
		autoOpen: false
	})
	port.open((err) => {
		if (err) {
			colorPrint('red')
			console.error('Failed to open port:', err.message)
			return
		}
		colorPrint('green', 'Serial Port is open')
	})
	const parser = new ReadlineParser({
		delimiter: '\n',
		encoding: 'utf8',
		includeDelimiter: false
	})
	port.pipe(parser)

	parser.on('data', (line) => {
		const serialData = line.trim()
		setRangingData(serialData)
	})

	const server = express()
	server.use(express.json())
	server.listen(3004, () => console.log('Listening on port 3000 for test serial data...'))

	server.post('/send', (req, res) => {
		console.log(req.body.data)
		res.send('Data received')
		mainWindow.webContents.send('serial-data', req.body.data)
	})

	if (app.isPackaged == false) {
		mainWindow.webContents.openDevTools({ mode: 'undocked' })
	}

	mainWindow.on('ready-to-show', () => {
		mainWindow.show()
	})

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url)
		return { action: 'deny' }
	})

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId('com.electron')

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window)
	})

	// IPC test
	ipcMain.on('ping', () => console.log('pong'))

	// Listen to for messages from renderer // specifically for python child
	ipcMain.on('ranging-data', (_event, data) => {
		// console.log('Received message from renderer:', data);
		if (!pyProcess) {
			colorPrint('yellow', 'index.ts: Skipping ranging data, pyProcess not running')
			return
		}
		const message = JSON.stringify(data) + '\n'
		pyProcess.stdin.write(message)
	})

	createWindow()

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
