<script lang="ts">
	import { onMount } from 'svelte';

	export const form = {};
	export let data;

	const text =
		"La frappologie est l'art de manipuler les mots, de jouer avec leur " +
		'sonorité et leur rythme pour créer des effets comiques, rythmiques ou poétiques. ' +
		"C'est une exploration ludique et créative du langage, où la répétition, les allitérations " +
		'et les assonances se mêlent pour offrir des morceaux de textes rythmés et amusants.';

	const mots: string[] = [
		'Arbre',
		'Océan',
		'Lumière',
		'Montagne',
		'Etoile',
		'Papillon',
		'Nuance',
		'Harmonie',
		'Couleur',
		'Miroir',
		'Éclat',
		'Douceur',
		'Voyage',
		'Rivière',
		'Pluie',
		'Rêve',
		'Lune',
		'Musique',
		'Parfum',
		'Sable',
		'Ciel',
		'Forêt',
		'Liberté',
		'Ecriture',
		'Sérénité',
		'Feuille',
		'Chant',
		'Légende',
		'Bonté',
		'Mystère',
		'Espoir',
		'Evasion',
		'Monstre',
		'Mémoire',
		'Oiseau',
		'Reflet',
		'Poème',
		'Savoir',
		'Arôme',
		'Ombre',
		'Cascade',
		'Tempête',
		'Parole',
		'Diamant',
		'Flamme',
		'Rire',
		'Espièglerie',
		'Danse',
		'Cri',
		'Aube'
	];

	function genererTexteAleatoireUnique(mots: string[], longueur: number): string {
		const motsMélangés = [...mots].sort(() => Math.random() - 0.5);

		const motsUniquement = motsMélangés.slice(0, longueur);

		return motsUniquement.join(' ');
	}

	const texteAleatoireUnique = genererTexteAleatoireUnique(mots, 50);

	let passwordcounter = 0;
	let textarea1counter = 0;
	let textarea2counter = 0;

	let textarea1 = '';
	let textarea2 = '';

	let textarea1Valid = false;
	let textarea2Valid = false;

	let errorMessage: string = '';
	let successMessage: string = '';
	let password = '';
	let password1 = '';
	let password2 = '';
	let passwordsMatch1 = false;
	let passwordsMatch2 = false;
	let isPasswordValid = false;

	function checkPasswords1() {
		passwordsMatch1 = password === password1 && password1 !== '' && password1.length >= 8;
	}
	function checkPasswords2() {
		passwordsMatch2 = password === password2 && password2 !== '' && password2.length >= 8;
	}

	function checkPasswordValidity() {
		isPasswordValid = password.length >= 8;
	}

	function checkTextarea1() {
		let i = 0;
		let isProgressingCorrectly = true;

		while (i < text.length && i < textarea1.length) {
			if (text[i] !== textarea1[i]) {
				isProgressingCorrectly = false;
				break;
			}
			i++;
		}
		textarea1Valid = isProgressingCorrectly && textarea1.length !== 0;
	}

	function checkTextarea2() {
		let i = 0;
		let isProgressingCorrectly = true;

		while (i < texteAleatoireUnique.length && i < textarea2.length) {
			if (texteAleatoireUnique[i] !== textarea2[i]) {
				isProgressingCorrectly = false;
				break;
			}
			i++;
		}
		textarea2Valid = isProgressingCorrectly && textarea2.length !== 0;
	}

	$: {
		checkPasswords1();
		checkPasswords2();
		checkPasswordValidity();
		checkTextarea1();
		checkTextarea2();
	}

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

	function handleSubmit(event: SubmitEvent) {
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
		hiddenUsernameInput.value = data.props.username;
		form.appendChild(hiddenUsernameInput);
		form.submit();
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

		for (const key in data.userDatabase.data) {
			const element = data.userDatabase.data[key];
			if (element.password) {
				passwordcounter++;
			} else if (element.floatingTextarea1) {
				textarea1counter++;
			} else if (element.floatingTextarea2) {
				textarea2counter++;
			}
		}
	});
</script>

<div class="container p-3 mx-auto">
	<div class="card mb-1 text-center">
		<div class="card-body">
			<h5 class="card-title">Username: <span class="fw-bold">{data.props.username}</span></h5>
			<div class="row">
				<div class="col-md-4">
					<span class="d-block">I) Attempts Count:</span>
					<span class="badge bg-primary">{passwordcounter}</span>
				</div>
				<div class="col-md-4">
					<span class="d-block">II) Attempts Count:</span>
					<span class="badge bg-success">{textarea1counter}</span>
				</div>
				<div class="col-md-4">
					<span class="d-block">III) Attempts Count:</span>
					<span class="badge bg-warning">{textarea2counter}</span>
				</div>
			</div>
		</div>
	</div>
	<div class="card mb-1">
		<form method="POST" on:submit={handleSubmit} action="?/form">
			<div class="card-body">
				<h3 class="text-center">I) First test : all passwords must be identical</h3>
				<label for="password" class="form-label">Password (first time)</label>
				<input
					type="password"
					minlength="8"
					autocomplete="off"
					class="form-control"
					id="password"
					name="password"
					bind:value={password}
					required
					aria-describedby="passwordHelp"
					class:is-valid={isPasswordValid}
					class:is-invalid={!isPasswordValid}
					on:input={checkPasswordValidity}
				/>
				<div id="passwordHelp" class="form-text">Password must be at least 8 characters long.</div>
				<label for="password1" class="form-label">Password (second time)</label>
				<input
					type="password"
					minlength="8"
					autocomplete="off"
					class="form-control"
					id="password1"
					name="password1"
					bind:value={password1}
					required
					aria-describedby="password1Help"
					class:is-valid={passwordsMatch1}
					class:is-invalid={!passwordsMatch1}
					on:input={checkPasswords1}
				/>
				<div id="password1Help" class="form-text">Password must be at least 8 characters long.</div>
				<label for="password2" class="form-label">Password (third time)</label>
				<input
					type="password"
					minlength="8"
					autocomplete="off"
					class="form-control"
					id="password2"
					name="password2"
					bind:value={password2}
					required
					aria-describedby="password2Help"
					class:is-valid={passwordsMatch2}
					class:is-invalid={!passwordsMatch2}
					on:input={checkPasswords2}
				/>
				<div id="password2Help" class="form-text">Password must be at least 8 characters long.</div>
				<button
					type="submit"
					class="btn btn-primary mb-1 d-block mx-auto"
					disabled={!passwordsMatch1 || !passwordsMatch2 || !isPasswordValid}>Submit</button
				>
			</div>
		</form>
	</div>
	<div class="card mb-1">
		<form method="POST" on:submit={handleSubmit} action="?/form">
			<div class="card-body">
				<h3 class="text-center">II) Second test : the text must be copied identically</h3>
				<h6 class="text-center">"{text}"</h6>
				<div class="form-floating mb-3">
					<textarea
						minlength="8"
						rows="8"
						autocomplete="off"
						class="form-control"
						id="floatingTextarea1"
						name="floatingTextarea1"
						bind:value={textarea1}
						required
						class:is-valid={textarea1Valid}
						class:is-invalid={!textarea1Valid}
						on:input={checkTextarea1}
						style="height:100%;"
					></textarea>
					<label for="floatingTextarea1">Comments</label>
				</div>
				<button
					type="submit"
					class="btn btn-primary mb-1 d-block mx-auto"
					disabled={!textarea1Valid || textarea1.length !== text.length}>Submit</button
				>
			</div>
		</form>
	</div>
	<div class="card mb-1">
		<form method="POST" on:submit={handleSubmit} action="?/form">
			<div class="card-body">
				<h3 class="text-center">III) Third test : the text must be copied identically</h3>
				<h6 class="text-center">"{texteAleatoireUnique}"</h6>
				<div class="form-floating mb-3">
					<textarea
						minlength="8"
						rows="8"
						autocomplete="off"
						class="form-control"
						id="floatingTextarea2"
						name="floatingTextarea2"
						bind:value={textarea2}
						required
						class:is-valid={textarea2Valid}
						class:is-invalid={!textarea2Valid}
						on:input={checkTextarea2}
						style="height:100%;"
					></textarea>
					<label for="floatingTextarea2">Comments</label>
				</div>
				<button
					type="submit"
					class="btn btn-primary mb-1 d-block mx-auto"
					disabled={!textarea2Valid || textarea2.length !== texteAleatoireUnique.length}
					>Submit</button
				>
			</div>
		</form>
	</div>
	{#if errorMessage}
		<p class="text-danger">{errorMessage}</p>
	{/if}
	{#if successMessage}
		<p class="text-success">{successMessage}</p>
	{/if}
</div>
