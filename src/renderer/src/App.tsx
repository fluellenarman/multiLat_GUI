import { Component, createSignal, onMount, Show } from 'solid-js'
import { Toaster } from 'solid-toast'

import Canvas from './components/canvas'
import LaunchMissileButton from './components/launchMissileButton'
import TestDroneButton from './components/TestingDroneButton'
import { FlareButton } from './components/flaresButton'
import { JamButton } from './components/jamButton'
import { AddressInput } from './components/addressInput'
import { TestingMode } from './utils/testingMode'
import './assets/canvas.css'

const App: Component = () => {
	const [localAddress, setLocalAddress] = createSignal('')

	onMount(async () => setLocalAddress(await window.toRenderer.getLocalAddress()))

	return (
		<>
			<div class="button-row">
				<Toaster position="top-right" />
				<p>{localAddress()}</p>
				<TestDroneButton />
				<Show when={TestingMode() === true}>
					<LaunchMissileButton />
				</Show>
				<FlareButton />
				<JamButton />
				<AddressInput />
			</div>
			<Canvas />
		</>
	)
}

export default App
