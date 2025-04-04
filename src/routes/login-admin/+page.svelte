<script lang="ts">
	import type { ActionData } from './$types';
	let form: ActionData = $props();
</script>

<div class="container p-3 mx-auto" style="max-width: 400px;">
	<form method="POST">
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
			<label for="password" class="form-label">Password</label>
			<input type="password" class="form-control" id="password" name="password" required />
		</div>
		<button type="submit" class="btn btn-primary mb-3 d-block mx-auto">Log In</button>
	</form>
	{#if form && form.error}
		<p class="text-center text-danger">{form.error}</p>
	{/if}
</div>
