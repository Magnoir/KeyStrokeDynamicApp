<script lang="ts">
	export let data;

	let loading = false;

	async function changeStatus(username: string, status: number) {
		loading = true;
		try {
			const response = await fetch('/api/changestatus', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, status })
			});

			const result = await response.json();
			if (response.ok) {
				data.users[username].status = status;

				window.location.reload();
			} else {
				alert(`Error: ${result.error}`);
			}
		} catch {
			alert('An error occurred while updating the status.');
		} finally {
			loading = false;
		}
	}
</script>

<div class="container mt-4">
	<h1>Admin Panel</h1>
	{#if loading}
		<div class="alert alert-info" role="alert">Loading...</div>
	{/if}
	{#if data.logged_in}
		<ul class="list-group">
			{#each Object.entries(data.users) as [username, user]}
				<li class="list-group-item d-flex justify-content-between align-items-center">
					<div>
						<strong>{username}</strong> - Status:
						{#if user.status === 0}
							<span class="badge bg-secondary">Visitor</span>
						{:else if user.status === 1}
							<span class="badge bg-primary">Admin</span>
						{/if}
					</div>
					<div>
						<button class="btn btn-sm btn-primary" on:click={() => changeStatus(username, 0)}
							>Set User</button
						>
						<button class="btn btn-sm btn-warning" on:click={() => changeStatus(username, 1)}
							>Set Admin</button
						>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
	{#if !data.logged_in}
		<div class="alert alert-danger" role="alert">
			You are not logged in. Please log in to access the admin panel.
		</div>
	{/if}
</div>
