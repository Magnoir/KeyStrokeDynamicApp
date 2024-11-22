<script lang="ts">
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";
    import type { ActionData } from "./$types";

    export const form: ActionData = {};

    let errorMessage: string = "";
    let successMessage: string = "";
    let password = "";
    let password1 = "";
    let password2 = "";
    let passwordsMatch1 = false;
	let passwordsMatch2 = false;
    let isPasswordValid = false;  // Validation du premier mot de passe

    // Vérifier si tous les mots de passe sont identiques
    function checkPasswords1() {
        passwordsMatch1 = password === password1 && password1 !== "";
    }
	function checkPasswords2() {
        passwordsMatch2 = password === password2 && password2 !== "";
    }

    // Vérifier si le premier mot de passe est valide
    function checkPasswordValidity() {
        isPasswordValid = password.length >= 8;
    }

    // Watch for password changes and validate passwords
    $: {
        checkPasswords1();  // Vérifie si les mots de passe sont identiques
		checkPasswords2();  // Vérifie si les mots de passe sont identiques
        checkPasswordValidity(); // Vérifie la validité du premier mot de passe
    }

    // Object to hold the keypress timings for each field
    let keyData: Record<string, any[]> = {
        username: [],
        password: [],
        password1: [],
        password2: []
    };

    // Object to store the start time of the first keypress for each field
    let startTimes: Record<string, number> = {
        username: 0,
        password: 0,
        password1: 0,
        password2: 0
    };

    // Function to handle key press events
    function handleKeyDown(event: KeyboardEvent, field: string) {
        // Exclude keys like 'Tab', 'Enter', etc.
        const excludedKeys = ['Tab', 'Enter', 'Shift', 'Control', 'Alt', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape', 'Suppr'];
        if (excludedKeys.includes(event.key)) {
            return; // Do nothing if it's an excluded key
        }

        const currentTime = new Date().getTime(); // Time when key is pressed

        // If the element is not focused, do nothing
        const focusedElement = document.activeElement;
        const inputElement = document.getElementById(field) as HTMLInputElement;
        if (focusedElement !== inputElement) {
            return; // Only log keys for the focused input
        }

        // If it's the first keypress, set the start time for that field
        if (startTimes[field] === 0) {
            startTimes[field] = currentTime;
        }

        // Store keyDownTime as seconds, ensuring maximum precision (6 decimals)
        keyData[field].push({
            key: event.key,
            keyDownTime: parseFloat(((currentTime - startTimes[field]) / 1000).toFixed(6)),  // Keep 6 decimals
            keyDownTimestamp: currentTime,  // Store keyDownTime as timestamp (milliseconds)
            keyUpTime: null,
            keyUpTimestamp: null,  // Will set this when key is released
            durationInSeconds: null  // Will calculate later when the key is released
        });
    }

    function handleKeyUp(event: KeyboardEvent, field: string) {
        // Exclude keys like 'Tab', 'Enter', etc.
        const excludedKeys = ['Tab', 'Enter', 'Shift', 'Control', 'Alt'];
        if (excludedKeys.includes(event.key)) {
            return; // Do nothing if it's an excluded key
        }

        const currentTime = new Date().getTime(); // Time when key is released
        const lastKey = keyData[field][keyData[field].length - 1];

        if (lastKey && lastKey.key === event.key && lastKey.keyUpTime === null) {
            // Store keyUpTime as seconds, ensuring precision (6 decimals)
            lastKey.keyUpTime = parseFloat(((currentTime - startTimes[field]) / 1000).toFixed(6));  // Keep 6 decimals
            lastKey.keyUpTimestamp = currentTime;  // Store keyUpTime as timestamp (milliseconds)

            // Calculate the duration in seconds with 6 decimals
            lastKey.durationInSeconds = parseFloat((lastKey.keyUpTime - lastKey.keyDownTime).toFixed(6));  // Keep 6 decimals
        }
    }

    // Handle form submission
    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'keyData';
        hiddenInput.value = JSON.stringify(keyData);
        form.appendChild(hiddenInput);

        form.submit();
    }

    onMount(() => {
        const fields = ['username', 'password', 'password1', 'password2'];
        fields.forEach((field) => {
            const element = document.getElementById(field) as HTMLInputElement;
            if (element) {
                element.addEventListener('keydown', (event) => handleKeyDown(event, field));
                element.addEventListener('keyup', (event) => handleKeyUp(event, field));
            }
        });
    });
</script>


<div class="container p-3 mx-auto" style="max-width: 400px;">
    <form method="POST" on:submit={handleSubmit} use:enhance>
        <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" minlength="5" autocomplete="off" class="form-control" id="username" name="username" required aria-describedby="usernameHelp">
            <div id="usernameHelp" class="form-text">Username must be at least 5 characters long.</div>
        </div>
        <h5 class="text-center">All passwords must be identical.</h5>
        <div class="mb-3">
            <label for="password" class="form-label">Password (first time)</label>
            <input type="password" minlength="8" autocomplete="off" class="form-control" id="password" name="password" bind:value={password}
            required aria-describedby="passwordHelp" class:is-valid={isPasswordValid} class:is-invalid={!isPasswordValid} on:input={checkPasswordValidity}>
            <div id="passwordHelp" class="form-text">Password must be at least 8 characters long.</div>
        </div>
        <div class="mb-3">
			<label for="password1" class="form-label">Password (second time)</label>
			<input type="password" minlength="8" autocomplete="off" class="form-control" id="password1" name="password1" bind:value={password1}
			required aria-describedby="password1Help" class:is-valid={passwordsMatch1} class:is-invalid={!passwordsMatch1} on:input={checkPasswords1}>
			<div id="password1Help" class="form-text">Password must be at least 8 characters long.</div>
		</div>
		<div class="mb-3">
			<label for="password2" class="form-label">Password (third time)</label>
			<input type="password" minlength="8" autocomplete="off" class="form-control" id="password2" name="password2" bind:value={password2}
			required aria-describedby="password2Help" class:is-valid={passwordsMatch2} class:is-invalid={!passwordsMatch2} on:input={checkPasswords2}>
			<div id="password2Help" class="form-text">Password must be at least 8 characters long.</div>
		</div>		
        <button type="submit" class="btn btn-primary mb-3 d-block mx-auto" disabled={!passwordsMatch1 || !passwordsMatch2 || !isPasswordValid}>Sign up</button>
    </form>

    {#if errorMessage}
        <p class="text-danger">{errorMessage}</p>
    {/if}
    {#if successMessage}
        <p class="text-success">{successMessage}</p>
    {/if}
</div>
