import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { BrowserWindow } from 'electron'

import { colorPrint } from './logging'

let pyProcess: ChildProcessWithoutNullStreams

const ranging = [0, 0, 0, 0]

function spawnProcessAndListen(mainWindow: BrowserWindow) {
	colorPrint('yellow', 'Spawning Python process...')
	pyProcess = spawn('python', ['-u', 'testingUtil/child_spawn_test/child2.py'])

	pyProcess.stdout.on('data', (data) => {
		//Data is a buffer, not an object
		const str = data.toString()

		try {
			const obj = JSON.parse(str)
			// console.log(obj)
			if (obj.id != undefined) {
				colorPrint('blue', 'spawnChild.tsx: Received drone coords from multilat-child')
				colorPrint('blue', obj.x, obj.y, obj.z)
				mainWindow.webContents.send('serial-data', obj)
				// console.log(obj) // Send obj to renderer via IPC
			}
		} catch (error) {
			// console.log('skipping message')
			// console.log(error)
		}
	})

	pyProcess.stderr.on('data', (data) => {
		colorPrint('red', `Python Stderr Error: ${data.toString()}`)
	})
}

function sendMessageToChild(ranging) {
	if (!pyProcess) {
		colorPrint('yellow', 'spawnChild.tsx: Skipping send, pyProcess not running')
		return
	}
	const message = JSON.stringify(ranging) + '\n'
	pyProcess.stdin.write(message)
}

const maxTimer = 5 // 500 ms
let curLimitTimer = maxTimer

setInterval(() => {
	curLimitTimer -= 1
}, 100)

function setRangingData(serialData) {
	// colorPrint('green', 'spawnChild.tsx: Received drone ranging data from serial', serialData)
	const parts = serialData.replace('Received line:', '').trim().split(/\s+/)
	const anchor = parts[0]
	let range = parts[1]
	if (range > 40) {
		range = 0
	}
	// colorPrint("green", "spawnChild.tsx: anchor/ranging: ", anchor, range)
	if (anchor == 'A') {
		ranging[0] = parseFloat(range)
	} else if (anchor == 'B') {
		ranging[1] = parseFloat(range)
	} else if (anchor == 'C') {
		ranging[2] = parseFloat(range)
	} else if (anchor == 'D') {
		ranging[3] = parseFloat(range)
	}
	// colorPrint("yellow", "ranging: ", ranging)
	if (
		curLimitTimer <= 0 &&
		ranging[0] != 0 &&
		ranging[1] != 0 &&
		ranging[2] != 0 &&
		ranging[3] != 0
	) {
		//convert meters to feet
		ranging[0] = ranging[0] * 3.28084
		ranging[1] = ranging[1] * 3.28084
		ranging[2] = ranging[2] * 3.28084
		ranging[3] = ranging[3] * 3.28084
		colorPrint('yellow', 'spawnChild.tsx: Sending ranging data to multilat-child')
		sendMessageToChild(ranging)
		curLimitTimer = maxTimer

		for (let i = 0; i < ranging.length; i++) {
			ranging[i] = 0
		}
	}
}

// setInterval(() => {
//     if (!pyProcess) return

//     sendMessageToChild([
//         rangings[rangingIndex][0],
//         rangings[rangingIndex][1],
//         rangings[rangingIndex][2],
//         rangings[rangingIndex][3],
//     ])
//     rangingIndex +=1
//     if (rangingIndex >= rangings.length) {rangingIndex = 0}
//     sendMessageToChild(
//         [23.53720459187964,
//         25.826343140289914,
//         24.596747752497688,
//         21.470910553583888]
//     )
// }, 1000)

// let rangingIndex = 0
// const rangings = [
//     [23.53720459187964, 25.826343140289914, 24.596747752497688, 21.470910553583888],
//     [23.861541567533394, 25.613841304636917, 26.71591986773287, 23.776616293727],
//     [25.051815355760628, 24.378046538209826, 27.78418004942964, 24.970938488953998],
//     [26.340344326889955, 23.24885888939765, 28.95135485014689, 26.26343571696445],
//     [27.713426816240606, 22.24252068222314, 30.205980108235586, 27.64033904095831],
//     [29.15912057211472, 21.376389146418628, 31.53762072413079, 29.089665328757636],
//     [30.667158316008415, 20.668098596124516, 32.936936827506045, 30.601126050835518],
//     [32.22878970453473, 20.134313651553263, 34.39566970156452, 32.165963411953385],
//     [33.83659516646325, 19.789160488993062, 35.90657851785831, 33.776759596786725],
//     [35.48429876859799, 19.642585356798733, 37.463350991323836, 35.42724623081965],
//     [37.16659448670438, 19.699021451308795, 39.06050376197323, 37.11212823510833],
// ];

export { spawnProcessAndListen, pyProcess, sendMessageToChild, setRangingData }
