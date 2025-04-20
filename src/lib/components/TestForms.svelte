<script lang="ts">
	// Importation des modules nécessaires
	import { random_words } from '$lib/words/words'; // Liste de mots aléatoires
	import { onMount, tick } from 'svelte'; // Fonctions pour gérer le cycle de vie des composants
	import { excludedKeys } from '$lib/words/excludedKeys'; // Liste des touches à exclure
	import type { ActionResult } from '@sveltejs/kit'; // Type pour les résultats d'action
	import { deserialize } from '$app/forms'; // Fonction pour désérialiser les données de formulaire

	// Propriété passée au composant
	let { model } = $props();

	// Fonction pour calculer les statistiques d'historique
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

	// Fonction pour mélanger un tableau
	const shuffle = (array: string[]) => array.sort(() => Math.random() - 0.5);

	// Liste de mots sélectionnés aléatoirement
	let selected_words = $state(shuffle(random_words).slice(0, 3));

	// Historique des résultats
	const history: string[] = $state([]);

	// Valeurs des mots saisis
	let wordValue: string[] = $state([]);

	// Champs utilisés dans le formulaire
	let usefields = $state(['username']);

	// Effet pour initialiser les valeurs des mots
	$effect(() => {
		wordValue = Array(selected_words.length).fill('');
	});

	// Données de résultat
	let resultData: string = $state('');

	// Données dynamiques pour les touches et les temps de début
	let keyData: Record<string, any[]> = {};
	let startTimes: Record<string, number> = {};

	// Gestionnaire pour l'événement "keydown"
	function handleKeyDown(event: KeyboardEvent, field: string) {
		if (excludedKeys.includes(event.key)) return; // Ignorer les touches exclues

		const currentTime = new Date().getTime();

		// Vérifie si l'élément actif est le champ ciblé
		const focusedElement = document.activeElement;
		const inputElement = document.getElementById(field) as HTMLInputElement;

		if (focusedElement !== inputElement) return;

		// Réinitialise les données si le champ est vide
		if (inputElement.value === '' && keyData[field].length > 0) {
			keyData[field] = [];
			startTimes[field] = currentTime;
		}

		// Vérifie si la touche est déjà enregistrée
		const existingKey = keyData[field].find(
			(key) => key.key === event.key && key.keyUpTime === null
		);
		if (existingKey) return;

		// Initialise le temps de début si nécessaire
		if (startTimes[field] === 0) startTimes[field] = currentTime;

		// Ajoute les données de la touche
		keyData[field].push({
			key: event.key,
			keyDownTime: parseFloat(((currentTime - startTimes[field]) / 1000).toFixed(6)),
			keyDownTimestamp: currentTime,
			keyUpTime: null,
			keyUpTimestamp: null,
			durationInSeconds: null
		});
	}

	// Gestionnaire pour l'événement "keyup"
	function handleKeyUp(event: KeyboardEvent, field: string) {
		if (excludedKeys.includes(event.key)) return; // Ignorer les touches exclues

		const currentTime = new Date().getTime();

		// Trouve la dernière occurrence de la touche
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

	// Gestionnaire pour la soumission du formulaire
	async function handleSubmit(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault(); // Empêche le comportement par défaut
		const form = event.target as HTMLFormElement;

		// Ajoute les données des touches au formulaire
		const hiddenKeyDataInput = document.createElement('input');
		hiddenKeyDataInput.type = 'hidden';
		hiddenKeyDataInput.name = 'keyData-' + model;
		hiddenKeyDataInput.value = JSON.stringify(keyData);
		form.appendChild(hiddenKeyDataInput);

		// Prépare les données du formulaire
		const dataForm = new FormData(event.currentTarget);
		dataForm.append('model', model);

		// Envoie les données au serveur
		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: dataForm
		});
		const result: ActionResult = deserialize(await response.text());

		// Gère le résultat de la soumission
		if (result.type === 'success') {
			resultData = result.data?.result;
			history.push(resultData);
			resultData = '';
			keyData = {};
			startTimes = {};
			usefields = [
				'username-' + model,
				...selected_words.map((word, index) => word + '-' + model + '-' + index)
			];
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

			// Réinitialise les champs spécifiques
			const usernameInput = document.getElementById(`username-${model}`) as HTMLInputElement;
			if (usernameInput) usernameInput.value = '';

			const passwordInput = document.getElementById(`password1-${model}`) as HTMLInputElement;
			if (passwordInput) passwordInput.value = '';

			// Sélectionne de nouveaux mots
			selected_words = shuffle(random_words).slice(0, 3);
			form.removeChild(hiddenKeyDataInput);
		}
	}

	// Initialisation lors du montage du composant
	onMount(async () => {
		await tick(); // Attendre que Svelte ait bien mis à jour le DOM
		usefields = [
			'username-' + model,
			...selected_words.map((word, index) => word + '-' + model + '-' + index)
		];
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

<!-- Structure HTML du composant -->
<div class="container p-3 mx-auto" style="max-width: 400px;">
	<form method="POST" action="?/aws" onsubmit={handleSubmit}>
		<!-- Champ pour le nom d'utilisateur -->
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
		<!-- Champ pour le mot de passe -->
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
		<!-- Champs pour les mots aléatoires -->
		{#each selected_words as word, index}
			<div class="lead">{word}</div>
			<input
				type="text"
				autocomplete="off"
				class="form-control mb-2"
				id={word + '-' + model + '-' + index}
				name={word + '-' + model}
				required
				bind:value={wordValue[index]}
				placeholder="Type the word"
				aria-label="Type the word"
				class:is-valid={word == wordValue[index]}
				class:is-invalid={word !== wordValue[index]}
			/>
		{/each}
		<!-- Bouton de soumission -->
		<button class="btn btn-primary mb-3 d-block mx-auto">Log In</button>
	</form>
	<!-- Affichage du résultat -->
	{#if resultData !== ''}
		<div class="card mb-1 text-center">
			<h1>You are {resultData} !</h1>
		</div>
	{/if}
	<!-- Affichage des statistiques d'historique -->
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
