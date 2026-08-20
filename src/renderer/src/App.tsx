import type { Component } from 'solid-js'
import { Show } from 'solid-js'
import Versions from './components/Versions'
import Canvas from './components/canvas'
import LaunchMissileButton from './components/launchMissileButton'
import TestDroneButton from './components/TestingDroneButton'
import { TestingMode, setTestingMode, toggleTestingMode } from './utils/testingMode'
import { FlareButton, flareArr } from './components/flaresButton'
import { IP_addressInput } from './components/IPaddressInput'
import electronLogo from './assets/electron.svg'
import './assets/canvas.css'

const App: Component = () => {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <p>Hello World</p>
      <TestDroneButton />
      <Show when={TestingMode() == true}>
        <LaunchMissileButton />
      </Show>
      <FlareButton />
      <IP_addressInput />
      <Canvas />
      {/* <Versions /> */}
    </>
  )
}

export default App
