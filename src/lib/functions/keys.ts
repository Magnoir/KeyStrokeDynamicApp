import { excludedKeys } from '$lib/words/excludedKeys';

export function handleKeyDown(
	event: KeyboardEvent,
	field: string,
	startTimes: Record<string, number>,
	keyData: Record<string, any[]>
) {
	if (excludedKeys.includes(event.key)) return;
	const currentTime = new Date().getTime();
	const focusedElement = document.activeElement;
	const inputElement = document.getElementById(field) as HTMLInputElement;
	if (focusedElement !== inputElement) return;
	if (inputElement.value === '' && keyData[field].length > 0) {
		keyData[field] = [];
		startTimes[field] = currentTime;
	}
	const existingKey = keyData[field].find((key) => key.key === event.key && key.keyUpTime === null);
	if (existingKey) return;
	if (startTimes[field] === 0) startTimes[field] = currentTime;
	keyData[field].push({
		key: event.key,
		keyDownTime: parseFloat(((currentTime - startTimes[field]) / 1000).toFixed(6)),
		keyDownTimestamp: currentTime,
		keyUpTime: null,
		keyUpTimestamp: null,
		durationInSeconds: null
	});
}

export function handleKeyDownSignup(
	event: KeyboardEvent,
	field: string,
	startTimes: Record<string, number>,
	keyData: Record<string, any[]>
) {
	if (excludedKeys.includes(event.key)) return;

	const currentTime = new Date().getTime();

	const focusedElement = document.activeElement;
	const inputElement = document.getElementById(field) as HTMLInputElement;

	if (focusedElement !== inputElement) return;

	if (inputElement.value === '' && keyData[field].length > 0) {
		keyData[field] = [];
		startTimes[field] = currentTime;
	}

	const existingKey = keyData[field].find((key) => key.key === event.key && key.keyUpTime === null);
	if (existingKey) return;

	if (startTimes[field] === 0) startTimes[field] = currentTime;

	keyData[field].push({
		key: event.key,
		keyDownTime: parseFloat(((currentTime - startTimes[field]) / 1000).toFixed(6)),
		keyDownTimestamp: currentTime,
		keyUpTime: null,
		keyUpTimestamp: null,
		durationInSeconds: null
	});
}

export function handleKeyUpSignup(
	event: KeyboardEvent,
	field: string,
	startTimes: Record<string, number>,
	keyData: Record<string, any[]>
) {
	if (excludedKeys.includes(event.key)) return;
	const currentTime = new Date().getTime();
	const lastKeyIndex = keyData[field].findIndex(
		(key) => key.key === event.key && key.keyUpTime === null
	);
	if (lastKeyIndex !== -1) {
		const lastKey = keyData[field][lastKeyIndex];
		lastKey.keyUpTime = parseFloat(((currentTime - startTimes[field]) / 1000).toFixed(6));
		lastKey.keyUpTimestamp = currentTime;
		lastKey.durationInSeconds = parseFloat((lastKey.keyUpTime - lastKey.keyDownTime).toFixed(6));
	}
}

export function handleKeyUp(
	event: KeyboardEvent,
	field: string,
	startTimes: Record<string, number>,
	keyData: Record<string, any[]>
) {
	if (excludedKeys.includes(event.key)) return;
	const currentTime = new Date().getTime();
	const lastKeyIndex = keyData[field].findIndex(
		(key) => key.key === event.key && key.keyUpTime === null
	);
	if (lastKeyIndex !== -1) {
		const lastKey = keyData[field][lastKeyIndex];
		lastKey.keyUpTime = parseFloat(((currentTime - startTimes[field]) / 1000).toFixed(6));
		lastKey.keyUpTimestamp = currentTime;
		lastKey.durationInSeconds = parseFloat((lastKey.keyUpTime - lastKey.keyDownTime).toFixed(6));
	}
}
