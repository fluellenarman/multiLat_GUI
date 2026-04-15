import { createSignal } from 'solid-js';

const [TestingMode, setTestingMode] = createSignal(false);

const toggleTestingMode = () => setTestingMode(!TestingMode());

export { TestingMode, setTestingMode, toggleTestingMode };