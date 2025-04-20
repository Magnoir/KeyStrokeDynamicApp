<script lang="ts">
	import { random_words } from '$lib/words/words';
	import type { ActionData } from './$types';
	import { onMount, tick } from 'svelte';
	import { handleKeyDownSignup, handleKeyUpSignup } from '$lib/functions/keys';

	let form: ActionData = $props();

	let password1 = $state('');
	let password2 = $state('');
	let isValidPassword = $state(false);
	let passwordsMatch = $state(false);
	let wordValue: string[] = $state(Array(10).fill(''));
	const usefields = [
		'username',
		'password-1',
		'password-2',
		'password-3',
		'password-4',
		'password-5',
		'password-6',
		'password-7',
		'password-8',
		'password-9',
		'password-10'
	];

	$effect(() => {
		isValidPassword = password1.length >= 8;
		passwordsMatch =
			password1 === password2 && password1 !== '' && password2 !== '' && password2.length >= 8;
	});

	// Initialise keyData et startTimes dynamiquement
	let keyData: Record<string, any[]> = {};
	let startTimes: Record<string, number> = {};

	usefields.forEach((field) => {
		keyData[field] = [];
		startTimes[field] = 0;
	});

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
				element.addEventListener('keydown', (event) =>
					handleKeyDownSignup(event, field, startTimes, keyData)
				);
				element.addEventListener('keyup', (event) =>
					handleKeyUpSignup(event, field, startTimes, keyData)
				);
			}
		});
	});
</script>

<div class="container p-3 mx-auto" style="max-width: 400px;">
	<form method="POST" onsubmit={handleSubmit} action="?/signup">
		<div class="mb-3">
			<label for="username" class="form-label">Username</label>
			<input
				type="text"
				autocomplete="username"
				class="form-control"
				id="username"
				name="username"
				required
			/>
		</div>
		<div class="mb-3">
			<label for="password1" class="form-label">Password</label>
			<input
				type="password"
				class="form-control"
				id="password1"
				name="password1"
				bind:value={password1}
				required
				aria-describedby="password1Help"
				class:is-valid={isValidPassword}
				class:is-invalid={!isValidPassword}
			/>
			<div id="password1Help" class="form-text">Password must be at least 8 characters long.</div>
		</div>
		<div class="mb-3">
			<label for="password2" class="form-label">Confirm Password</label>
			<input
				type="password"
				class="form-control"
				id="password2"
				name="password2"
				bind:value={password2}
				aria-describedby="password2Help"
				class:is-valid={passwordsMatch}
				class:is-invalid={!passwordsMatch}
				required
			/>
			<div id="password2Help" class="form-text">Password must be at least 8 characters long.</div>
		</div>
		<h2 class="text-center">To register you need to tap this words:</h2>
		<div class="mb-3">
			{#each random_words as word, index}
				<div class="lead">{word}</div>
				<div class="mb-3">
					<input
						type="text"
						class="form-control"
						id={word + '-' + index}
						name={word + '-' + index}
						aria-describedby="{word}Help"
						bind:value={wordValue[index]}
						autocomplete="off"
						placeholder="Type the word"
						aria-label="Type the word"
						class:is-valid={word == wordValue[index]}
						class:is-invalid={word !== wordValue[index]}
						required
					/>
				</div>
			{/each}
		</div>
		<button type="submit" class="btn btn-primary mb-3 d-block mx-auto" disabled={!passwordsMatch}
			>Sign In</button
		>
	</form>
	{#if form && form.error}
		<p class="text-center text-danger">{form.error}</p>
	{/if}
</div>
