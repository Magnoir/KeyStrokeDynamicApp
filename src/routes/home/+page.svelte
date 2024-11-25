<script lang="ts">
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";

    export const form: any = {};

    let errorMessage: string = "";
    let successMessage: string = "";
    let username = "";
    let password = "";
    let password1 = "";
    let password2 = "";
    let passwordsMatch1 = false;
	let passwordsMatch2 = false;
    let isPasswordValid = false;
    let isUsernameValid = false;

    function checkPasswords1() {
        passwordsMatch1 = password === password1 && password1 !== "" && password1.length >= 8;
    }
	function checkPasswords2() {
        passwordsMatch2 = password === password2 && password2 !== "" && password2.length >= 8;
    }

    function checkPasswordValidity() {
        isPasswordValid = password.length >= 8;
    }

    function checkUsernameValidity() {
        isUsernameValid = username !== "";
    }

    $: {
        checkPasswords1();
		checkPasswords2();
        checkPasswordValidity();
        checkUsernameValidity();
    }

    let keyData: Record<string, any[]> = {
        password: [],
        password1: [],
        password2: []
    };

    let startTimes: Record<string, number> = {
        password: 0,
        password1: 0,
        password2: 0
    };

    function handleKeyDown(event: KeyboardEvent, field: string) {
        const excludedKeys = ['Tab', 'Enter', 'Shift', 'Control', 'Alt', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape', 'Suppr', 'CapsLock'];
        if (excludedKeys.includes(event.key)) return;

        const currentTime = new Date().getTime();

        const focusedElement = document.activeElement;
        const inputElement = document.getElementById(field) as HTMLInputElement;

        if (focusedElement !== inputElement) return;

        if (inputElement.value === "" && keyData[field].length > 0) {
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


    function handleKeyUp(event: KeyboardEvent, field: string) {
        const excludedKeys = ['Tab', 'Enter', 'Shift', 'Control', 'Alt', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape', 'Suppr', 'CapsLock'];
        if (excludedKeys.includes(event.key)) return;

        const currentTime = new Date().getTime();

        const lastKeyIndex = keyData[field].findIndex((key) => key.key === event.key && key.keyUpTime === null);

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
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'keyData';
        hiddenInput.value = JSON.stringify(keyData);
        form.appendChild(hiddenInput);
        form.submit();
    }

    onMount(() => {
        const fields = ['password', 'password1', 'password2'];
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
    <form method="POST" on:submit={handleSubmit}>
        <div class="mb-3">
            <select class="form-select" aria-label="Default select example" name="username" id="username" required bind:value={username}
            class:is-valid={isUsernameValid} class:is-invalid={!isUsernameValid} on:change={checkUsernameValidity}>
                <option selected disabled value="">Choose your username</option>
                <option value="gustave">Gustave</option>
                <option value="romain">Romain</option>
                <option value="james">James</option>
            </select>
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
