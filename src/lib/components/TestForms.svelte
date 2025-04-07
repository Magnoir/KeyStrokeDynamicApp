<script lang="ts">
	import { random_words } from '$lib/words/words';
	import { onMount, tick } from 'svelte';
	import { excludedKeys } from '$lib/words/excludedKeys';
	import type { ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';

	let { model } = $props();
	
	let title = $state("Model: " + model);

	function getHistoryStats(history: string[]) {
		const counts: Record<string, number> = {};
		history.forEach((result) => {
			counts[result] = (counts[result] || 0) + 1;
		});

		const total = history.length;
		const stats = Object.entries(counts)
			.map(([label, count]) => ({
				label,
				count,
				percentage: parseFloat(((count / total) * 100).toFixed(1))
			}))
			.sort((a, b) => b.count - a.count);

		return stats;
	}

	const shuffle = (array: string[]) => array.sort(() => Math.random() - 0.5);
	let selected_words = $state(shuffle(random_words).slice(0, 3));
	const history: string[] = $state([]);
	let wordValue: string[] = $state([]);
	let usefields = $state(['username']);

	$effect(() => {
		wordValue = Array(selected_words.length).fill('');
	});

	let resultData: string = $state('');
	// Initialise keyData et startTimes dynamiquement
	let keyData: Record<string, any[]> = {};
	let startTimes: Record<string, number> = {};

	function handleKeyDown(event: KeyboardEvent, field: string) {
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
		hiddenKeyDataInput.name = 'keyData-'+model;
		hiddenKeyDataInput.value = JSON.stringify(keyData);
		form.appendChild(hiddenKeyDataInput);
		const dataForm = new FormData(event.currentTarget);
		dataForm.append('model', model);
		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: dataForm
		});
		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success') {
			resultData = result.data?.result;
			history.push(resultData);
			resultData = '';
			keyData = {};
			startTimes = {};
			usefields = ['username-' + model, ...selected_words.map((word) => word + '-' + model)];
			usefields.forEach((field) => {
				keyData[field] = [];
				startTimes[field] = 0;
			});

			// Vide les champs et re-binde les événements
			await tick(); // Attends que le DOM soit mis à jour

			usefields.forEach((field, index) => {
				const inputElement = document.getElementById(field) as HTMLInputElement;
				if (inputElement) {
					inputElement.value = '';
					inputElement.addEventListener('keydown', (event) => handleKeyDown(event, field));
					inputElement.addEventListener('keyup', (event) => handleKeyUp(event, field));
				}
			});

			const usernameInput = document.getElementById(`username-${model}`) as HTMLInputElement;
			if (usernameInput) usernameInput.value = '';

			const passwordInput = document.getElementById(`password1-${model}`) as HTMLInputElement;
			if (passwordInput) passwordInput.value = '';

			selected_words = shuffle(random_words).slice(0, 3);
			form.removeChild(hiddenKeyDataInput);
		}
	};

	onMount(async () => {
		await tick(); // Attendre que Svelte ait bien mis à jour le DOM
		usefields = ['username-' + model, ...selected_words.map((word) => word + '-' + model)];
		usefields.forEach((field) => {
			keyData[field] = [];
			startTimes[field] = 0;
		});
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
	<h1>{title}</h1>
	<form method="POST" action="?/aws" onsubmit={handleSubmit}>
		<div class="mb-3">
			<label for="username-{model}" class="form-label">Username</label>
			<input
				type="text"
				autocomplete="off"
				class="form-control"
				id="username-{model}"
				name="username-{model}"
				required
			/>
		</div>
		<div class="mb-3">
			<label for="password1-{model}" class="form-label">Password</label>
			<input
				type="password"
				class="form-control"
				id="password1-{model}"
				name="password-{model}"
				required
			/>
		</div>
		{#each selected_words as word, index}
			<div class="lead">{word}</div>
			<input
				type="text"
				autocomplete="off"
				class="form-control mb-2"
				id={word + '-' + model}
				name={word + '-' + model}
				required
				bind:value={wordValue[index]}
				placeholder="Type the word"
				aria-label="Type the word"
				class:is-valid={word == wordValue[index]}
				class:is-invalid={word !== wordValue[index]}
			/>
		{/each}
		<button class="btn btn-primary mb-3 d-block mx-auto">Log In</button>
	</form>
	{#if resultData !== ''}
		<div class="card mb-1 text-center">
			<h1>You are {resultData} !</h1>
		</div>
	{/if}
	{#if history.length > 0}
		<div class="card mt-3">
			<div class="card-header text-center">History Stats</div>
			<ul class="list-group list-group-flush">
				{#each getHistoryStats(history) as stat}
					<li class="list-group-item d-flex justify-content-between align-items-center">
						<span class="text-capitalize">{stat.label}</span>
						<span>
							{stat.count} ({stat.percentage}%)
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
