<script lang="ts">
	import { onMount } from 'svelte';
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';

	export const form = {};
	let data = $props();
	let password = $state('');
	let password1 = $state('');
	let password2 = $state('');
	let passwordsMatch1 = $state(false);
	let passwordsMatch2 = $state(false);
	let combinedData: [string, number][] = $state([]);

	function checkPasswords1() {
		passwordsMatch1 = password === password1 && password1 !== '';
	}
	function checkPasswords2() {
		passwordsMatch2 = password === password2 && password2 !== '';
	}

	$effect(() => {
		checkPasswords1();
		checkPasswords2();
	});

	let keyData: Record<string, any[]> = {
		password: [],
		password1: [],
		password2: [],
		floatingTextarea1: [],
		floatingTextarea2: []
	};

	let startTimes: Record<string, number> = {
		password: 0,
		password1: 0,
		password2: 0,
		floatingTextarea1: 0,
		floatingTextarea2: 0
	};

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
		const hiddenUsernameInput = document.createElement('input');
		hiddenUsernameInput.type = 'hidden';
		hiddenUsernameInput.name = 'username';
		hiddenUsernameInput.value = data.data.props.username;
		form.appendChild(hiddenUsernameInput);
		const dataForm = new FormData(event.currentTarget);
		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: dataForm
		});
		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success') {
			combinedData = result.data?.data?.percentages;
			combinedData.sort((a, b) => b[1] - a[1]);
			data = '';
			password = '';
			password1 = '';
			password2 = '';
		}
		form.removeChild(hiddenKeyDataInput);
		form.removeChild(hiddenUsernameInput);
		form.reset();
	}

	onMount(() => {
		const fields = ['password', 'password1', 'password2', 'floatingTextarea1', 'floatingTextarea2'];
		fields.forEach((field) => {
			const element = document.getElementById(field) as HTMLInputElement;
			if (element) {
				element.addEventListener('keydown', (event) => handleKeyDown(event, field));
				element.addEventListener('keyup', (event) => handleKeyUp(event, field));
			}
		});
	});
</script>

<div class="container p-3 mx-auto">
	<div class="card text-center">
		<div class="card-body">
			<h5 class="card-title">Username: <span class="fw-bold">{data.data.props.username}</span></h5>
		</div>
	</div>
	<div class="card mb-1">
		<form method="POST" onsubmit={handleSubmit} action="?/aws">
			<div class="card-body">
				<h3 class="text-center">I) First test : all inputs must be identical</h3>
				<label for="password" class="form-label">Password (first time)</label>
				<input
					type="text"
					autocomplete="off"
					class="form-control"
					id="password"
					name="password"
					bind:value={password}
					required
					aria-describedby="passwordHelp"
				/>
				<div id="passwordHelp" class="form-text">Password must be at least 8 characters long.</div>
				<label for="password1" class="form-label">Password (second time)</label>
				<input
					type="text"
					autocomplete="off"
					class="form-control"
					id="password1"
					name="password1"
					bind:value={password1}
					required
					aria-describedby="password1Help"
					class:is-valid={passwordsMatch1}
					class:is-invalid={!passwordsMatch1}
					oninput={checkPasswords1}
				/>
				<div id="password1Help" class="form-text">Password must be at least 8 characters long.</div>
				<label for="password2" class="form-label">Password (third time)</label>
				<input
					type="text"
					autocomplete="off"
					class="form-control"
					id="password2"
					name="password2"
					bind:value={password2}
					required
					aria-describedby="password2Help"
					class:is-valid={passwordsMatch2}
					class:is-invalid={!passwordsMatch2}
					oninput={checkPasswords2}
				/>
				<div id="password2Help" class="form-text">Password must be at least 8 characters long.</div>
				<button
					class="btn btn-primary mb-1 d-block mx-auto"
					disabled={!passwordsMatch1 || !passwordsMatch2}>Submit</button
				>
			</div>
		</form>
	</div>
	{#if combinedData.length > 0}
		<div class="card mb-1 text-center">
			<h1>You are {combinedData[0][0]} !</h1>
			<ul class="list-group">
				{#each combinedData as [name, count]}
					<li class="list-group-item d-flex justify-content-between">
						<span>{name}</span>
						<span class="badge bg-primary">{count.toFixed(2)}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
