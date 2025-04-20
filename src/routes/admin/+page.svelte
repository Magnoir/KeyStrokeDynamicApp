<script lang="ts">
	// Exporting the `data` prop to receive data from the parent component or server.
	export let data;

	// A boolean to track the loading state during status change operations.
	let loading = false;

	// Function to handle status changes for a user.
	async function changeStatus(username: string, status: number) {
		loading = true; // Set loading to true while the operation is in progress.
		try {
			// Sending a POST request to the server to update the user's status.
			const response = await fetch('/api/changestatus', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json' // Specify JSON content type.
				},
				body: JSON.stringify({ username, status }) // Send username and new status in the request body.
			});

			// Parse the JSON response from the server.
			const result = await response.json();
			if (response.ok) {
				// Update the user's status in the local `data` object if the request was successful.
				data.users[username].status = status;

				// Reload the page to reflect the changes (not ideal for UX, but functional).
				window.location.reload();
			} else {
				// Show an error message if the server responds with an error.
				alert(`Error: ${result.error}`);
			}
		} catch {
			// Handle any network or unexpected errors.
			alert('An error occurred while updating the status.');
		} finally {
			// Reset the loading state after the operation is complete.
			loading = false;
		}
	}
</script>

<div class="container mt-4">
	<h1>Admin Panel</h1>
	{#if loading}
		<!-- Display a loading message while the status change operation is in progress. -->
		<div class="alert alert-info" role="alert">Loading...</div>
	{/if}
	{#if data.logged_in}
		<!-- Display the list of users if the admin is logged in. -->
		<ul class="list-group">
			{#each Object.entries(data.users) as [username, user]}
				<li class="list-group-item d-flex justify-content-between align-items-center">
					<div>
						<!-- Display the username and current status of the user. -->
						<strong>{username}</strong> - Status:
						{#if user.status === 0}
							<!-- Status badge for "Visitor". -->
							<span class="badge bg-secondary">Visitor</span>
						{:else if user.status === 1}
							<!-- Status badge for "Admin". -->
							<span class="badge bg-primary">Admin</span>
						{/if}
					</div>
					<div>
						<!-- Buttons to change the user's status. -->
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
		<!-- Show an error message if the admin is not logged in. -->
		<div class="alert alert-danger" role="alert">
			You are not logged in. Please log in to access the admin panel.
		</div>
	{/if}
</div>
