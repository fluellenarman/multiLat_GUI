import type { Component } from 'solid-js'
import Versions from './components/Versions'
import Canvas from './components/canvas'
import electronLogo from './assets/electron.svg'
import './assets/canvas.css'

const App: Component = () => {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <p>Hello World</p>
      <Canvas />
      {/* <Versions /> */}
    </>
  )
}

export default App
