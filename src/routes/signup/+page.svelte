<script lang="ts">
	import { enhance } from "$app/forms";
    import type { ActionData } from "./$types";
	export let form: ActionData;

    let password1 = "";
    let password2 = "";
    let isValidPassword = false;
    let passwordsMatch = false;
    $: {
        isValidPassword = password1.length >= 8;
        passwordsMatch = password1 === password2 && password1 !== "" && password2 !== "";
    }

</script>

<div class="container p-3 mx-auto" style="max-width: 400px;">
	<form method="POST" use:enhance>
		<div class="mb-3">
			<label for="username" class="form-label">Username</label>
			<input type="text" autocomplete="username" class="form-control" id="username" name="username" required>
		</div>
		<div class="mb-3">
			<label for="password1" class="form-label">Password</label>
			<input type="password" class="form-control" id="password1" name="password1" bind:value={password1} 
            required aria-describedby="password1Help" class:is-valid={isValidPassword} class:is-invalid={!isValidPassword}>
            <div id="password1Help" class="form-text">Password must be at least 8 characters long.</div>
        </div>
        <div class="mb-3">
			<label for="password2" class="form-label">Confirm Password</label>
			<input type="password" class="form-control" id="password2" name="password2" bind:value={password2} 
            aria-describedby="password2Help" class:is-valid={passwordsMatch} class:is-invalid={!passwordsMatch} required>
            <div id="password2Help" class="form-text">Password must be at least 8 characters long.</div>
        </div>
		<button type="submit" class="btn btn-primary mb-3 d-block mx-auto" disabled={!passwordsMatch}>Sign In</button>
	</form>
    {#if form && form.error}
		<p class="text-center text-danger">{form.error}</p>
	{/if}
</div>