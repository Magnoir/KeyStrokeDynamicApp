<script lang="ts">
	import type { ActionData } from './$types';
	import { random_words } from '$lib/words/words';
	import { onMount, tick } from 'svelte';

	let form: ActionData = $props();

	const shuffle = (array: string[]) => array.sort(() => Math.random() - 0.5);
	const selected_words = shuffle(random_words).slice(0, 3);
	const wordValue: string[] = $state(Array(selected_words.length).fill(''));

	const usefields = ['username', ...selected_words];
	// Initialise keyData et startTimes dynamiquement
	let keyData: Record<string, any[]> = {};
	let startTimes: Record<string, number> = {};

	usefields.forEach((field) => {
		keyData[field] = [];
		startTimes[field] = 0;
	});
	function handleKeyDown(event: KeyboardEvent, field: string) {
		const excludedKeys = [
			'Tab',
			'Enter',
			'Shift',
			'Control',
			'Alt',
			'Backspace',
			'Delete',
			'ArrowLeft',
			'ArrowRight',
			'ArrowUp',
			'ArrowDown',
			'Escape',
			'Suppr',
			'CapsLock'
		];
		if (excludedKeys.includes(event.key)) return;

		const currentTime = new Date().getTime();

		const focusedElement = document.activeElement;
		const inputElement = document.getElementById(field) as HTMLInputElement;

		if (focusedElement !== inputElement) return;

		if (inputElement.value === '' && keyData[field].length > 0) {
			keyData[field] = [];
			startTimes[field] = currentTime;
		}

		const existingKey = keyData[field].find(
			(key) => key.key === event.key && key.keyUpTime === null
		);
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

	function handleKeyUp(event: KeyboardEvent, field: string) {
		const excludedKeys = [
			'Tab',
			'Enter',
			'Shift',
			'Control',
			'Alt',
			'Backspace',
			'Delete',
			'ArrowLeft',
			'ArrowRight',
			'ArrowUp',
			'ArrowDown',
			'Escape',
			'Suppr',
			'CapsLock'
		];
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

	async function handleSubmit(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const hiddenKeyDataInput = document.createElement('input');
		hiddenKeyDataInput.type = 'hidden';
		hiddenKeyDataInput.name = 'keyData';
		hiddenKeyDataInput.value = JSON.stringify(keyData);
		form.appendChild(hiddenKeyDataInput);
		form.submit();
	}

	onMount(async () => {
		await tick(); // Attendre que Svelte ait bien mis à jour le DOM
		usefields.forEach((field) => {
			const element = document.getElementById(field) as HTMLInputElement;
			if (element) {
				element.addEventListener('keydown', (event) => handleKeyDown(event, field));
				element.addEventListener('keyup', (event) => handleKeyUp(event, field));
			}
		});
	});
</script>

<div class="container p-3 mx-auto" style="max-width: 400px;">
	<form method="POST" action="?/aws" onsubmit={handleSubmit}>
		<div class="mb-3">
			<label for="username" class="form-label">Username</label>
			<input
				type="text"
				autocomplete="off"
				class="form-control"
				id="username"
				name="username"
				required
			/>
		</div>
		<div class="mb-3">
			<label for="password1" class="form-label">Password</label>
			<input type="password" class="form-control" id="password1" name="password" required />
		</div>
		{#each selected_words as word, index}
			<div class="lead">{word}</div>
			<input
				type="text"
				autocomplete="off"
				class="form-control mb-2"
				id={word}
				name={word}
				required
				bind:value={wordValue[index]}
				placeholder="Type the word"
				aria-label="Type the word"
				class:is-valid={word == wordValue[index]}
				class:is-invalid={word !== wordValue[index]}
			/>
		{/each}
		<button type="submit" class="btn btn-primary mb-3 d-block mx-auto">Log In</button>
	</form>
</div>
