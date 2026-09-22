import type { Component } from 'solid-js'
import { Show, createSignal, onMount } from 'solid-js'
import Versions from './components/Versions'
import Canvas from './components/canvas'
import LaunchMissileButton from './components/launchMissileButton'
import TestDroneButton from './components/TestingDroneButton'
import { TestingMode, setTestingMode, toggleTestingMode } from './utils/testingMode'
import { FlareButton, flareArr } from './components/flaresButton'
import { JamButton } from './components/jamButton'
import { IP_addressInput } from './components/IPaddressInput'
import electronLogo from './assets/electron.svg'
import './assets/canvas.css'
import { Toaster } from 'solid-toast'

const App: Component = () => {
	const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

	const [selfIPaddress, setSelfIPaddress] = createSignal('')

	onMount(() => {
		// also explicitly request the IP from main to avoid race
		window.electronAPI
			.getLocalIP?.()
			.then((ip: string) => {
				if (ip) {
					console.log('App.tsx: getLocalIP', ip)
					setSelfIPaddress(ip)
				}
			})
			.catch((e) => console.warn('getLocalIP failed', e))
	})
	const isTestMode = () => import.meta.env.VITE_TEST_MODE === 'true'

	return (
		<>
			<div class="button-row">
				<Toaster position="top-right" />
				<p>{selfIPaddress()}</p>
				<Show when={isTestMode() === true}>
					<TestDroneButton />
				</Show>
				<Show when={TestingMode() === true}>
					<LaunchMissileButton />
				</Show>
				<FlareButton />
				<JamButton />
				<IP_addressInput />
			</div>
			<Canvas />
			{/* <Versions /> */}
		</>
	)
}

export default App
