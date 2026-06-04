# multilatgui

An Electron application with Solid and TypeScript

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

to generate changes.patch
```bash
$ git diff --output=changes.patch
```

### Main to Renderer IPC
`preload/index.ts`
creates a custom api channel called serial-data that the main process can use to send data to the renderer process.

#### `main/index.ts`
Sends data to the renderer process. serial-data is a channel.
``` javascript 
mainWindow.webContents.send('serial-data', serialData)
```

#### `renderer/src/components/canvas.tsx`
This is how the renderer receives serial data from the main process.
``` javascript
// Listen for Serial data
window.api.onSerialData((data: string) => {
    console.log("Received serial data in renderer:", data);
})
```

### Simulate Serial Data
The multilat GUI is supposed to receive ranging data through a serial port. A UWB receiver is connected through USB will receive ranging data from the other anchors and pass it to the GUI.

For testing reasons, the GUI has an Express server exposing port 3000 to receive generated test data from a python script. `simulator.py` will generate and send mock serial data to the GUI for testing purposes.

#### In root directory

```bash
npm run dev
```

#### In /testingUtil
```bash
python3 simulator.py
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
