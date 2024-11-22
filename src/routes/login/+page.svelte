<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData } from "./$types";
	export let form: ActionData;
</script>

<div class="container p-3 mx-auto" style="max-width: 400px;">
	<form method="POST" use:enhance>
		<div class="mb-3">
			<label for="username" class="form-label">Username</label>
			<input type="text" autocomplete="username" class="form-control" id="username" name="username">
		</div>
		<div class="mb-3">
			<label for="password" class="form-label">Password</label>
			<input type="password" class="form-control" id="password" name="password">
		</div>
		<button type="submit" class="btn btn-primary mb-3 d-block mx-auto">Submit</button>
	</form>
	{#if form && !form.password_correct}
		<p class="text-center text-danger">The username or the password is not correct.</p>
	{/if}
</div>
