import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
	interface Window {
		toMain: typeof import('.').toMainAPI
		toRenderer: typeof import('.').toRendererAPI
	}
}
