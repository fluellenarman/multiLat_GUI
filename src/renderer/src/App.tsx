import type { Component } from 'solid-js'
import Versions from './components/Versions'
import Canvas from './components/canvas'
import LaunchMissileButton from './components/launchMissileButton'
import electronLogo from './assets/electron.svg'
import './assets/canvas.css'

const App: Component = () => {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <p>Hello World</p>
      <LaunchMissileButton />
      <Canvas />
      {/* <Versions /> */}
    </>
  )
}

export default App
