import { excludedKeys } from '$lib/words/excludedKeys';
/**
 * Handles the `keydown` event for a specific input field, tracking key press data.
 *
 * @param event - The `KeyboardEvent` triggered by the key press.
 * @param field - The ID of the input field being monitored.
 * @param startTimes - A record of start times for each field, where the key is the field ID and the value is the timestamp.
 * @param keyData - A record of key press data for each field, where the key is the field ID and the value is an array of key press objects.
 *
 * The function performs the following:
 * - Ignores keys listed in the `excludedKeys` array.
 * - Ensures the event is only processed if the focused element matches the specified input field.
 * - Resets the key data and start time for the field if the input value is empty and there is existing key data.
 * - Prevents duplicate key entries for keys that are already pressed and not yet released.
 * - Records the key press data, including the key, the time since the start of the field's tracking, and timestamps.
 */
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

/**
 * Handles the `keydown` event for a signup input field, tracking key press data.
 *
 * @param event - The `KeyboardEvent` triggered by the user pressing a key.
 * @param field - The ID of the input field being monitored.
 * @param startTimes - A record mapping field IDs to the start time of key tracking.
 * @param keyData - A record mapping field IDs to an array of key press data objects.
 *
 * The function performs the following:
 * - Ignores keys listed in the `excludedKeys` array.
 * - Ensures the event is triggered for the specified input field.
 * - Resets key data if the input field is empty and there is existing key data.
 * - Prevents duplicate key tracking for keys that are already pressed.
 * - Tracks the key press data, including the key, timestamps, and duration.
 */
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

/**
 * Handles the `keyup` event for a signup form field, recording key timing data.
 *
 * @param event - The keyboard event triggered by the `keyup` action.
 * @param field - The name of the field being interacted with.
 * @param startTimes - A record of start times for each field, where the key is the field name and the value is the start time in milliseconds.
 * @param keyData - A record of key data for each field, where the key is the field name and the value is an array of objects containing key timing information.
 *
 * The function updates the `keyData` record for the specified field by finding the last key entry with a matching key name and a `null` `keyUpTime`.
 * It calculates and sets the `keyUpTime`, `keyUpTimestamp`, and `durationInSeconds` for the key entry.
 * If the key is in the `excludedKeys` list, the function returns early without performing any updates.
 */
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

/**
 * Handles the `keyup` event for a specific field, updating the key data with timing information.
 *
 * @param event - The `KeyboardEvent` triggered by the `keyup` action.
 * @param field - The name of the field associated with the key event.
 * @param startTimes - A record mapping field names to their respective start times (in milliseconds).
 * @param keyData - A record mapping field names to arrays of key event data objects.
 *
 * The `keyData` objects should have the following structure:
 * - `key`: The key value of the event.
 * - `keyDownTime`: The time (in seconds) when the key was pressed down.
 * - `keyUpTime`: The time (in seconds) when the key was released (null initially).
 * - `keyUpTimestamp`: The timestamp (in milliseconds) when the key was released.
 * - `durationInSeconds`: The duration (in seconds) the key was held down.
 *
 * The function updates the `keyUpTime`, `keyUpTimestamp`, and `durationInSeconds` properties
 * of the corresponding key event object in the `keyData` array.
 *
 * If the key is included in the `excludedKeys` array, the function returns early without processing.
 */
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
