<script lang="ts">
	import { onMount } from 'svelte';

	export let data;

	interface KeyData {
		type: string;
		key: string;
		keyDownTime?: number;
		keyUpTime?: number;
		durationInSeconds?: number;
		floatingTextarea2?: string;
		floatingTextarea1?: string;
		password?: string;
		password1?: string;
		password2?: string;
	}

	interface Record {
		id: string;
		keyData?: KeyData;
		password?: string;
		password1?: string;
		password2?: string;
		username?: string;
		floatingTextarea1?: string;
		floatingTextarea2?: string;
	}

	let parsedData: Record[] = [];
	let groupedData: Record[][] = [];
	let error: string | null = null;

	onMount(async () => {
		const result = data.database;
		if (result.data && typeof result.data === 'object') {
			const records: Record[] = Object.entries(result.data).flatMap(([, record]) =>
				Object.entries(record as { [key: string]: any }).map(([sub_key, recordData]) => ({
					...recordData,
					id: sub_key,
					keyData: JSON.parse(recordData.keyData)
				}))
			);
			parsedData = records;
			groupedData = groupByUsername(parsedData);
		}
	});

	function groupByUsername(records: Record[]): Record[][] {
		const grouped: { [username: string]: Record[] } = {};
		records.forEach((record) => {
			if (record.username) {
				if (!grouped[record.username]) {
					grouped[record.username] = [];
				}
				grouped[record.username].push(record);
			}
		});
		return Object.values(grouped);
	}

	async function deleteRecord(id: string, username: string | undefined) {
		try {
			const response = await fetch('/api/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, username })
			});

			if (response.ok) {
				parsedData = parsedData.filter((record) => record.id !== id);

				groupedData = groupByUsername(parsedData);
			} else {
				const result = await response.json();
				error = result.error || 'Failed to delete the record.';
			}
		} catch {
			error = 'An error occurred while trying to delete the record.';
		}
	}

	function downloadJSON() {
		let downloadData = parsedData;
		downloadData.forEach((record: Record) => {
			if (record.floatingTextarea1) {
				if (record.keyData) {
					delete record.keyData.floatingTextarea2;
					delete record.keyData.password;
					delete record.keyData.password1;
					delete record.keyData.password2;
				}
			}
			if (record.floatingTextarea2) {
				if (record.keyData) {
					delete record.keyData.floatingTextarea1;
					delete record.keyData.password;
					delete record.keyData.password1;
					delete record.keyData.password2;
				}
			}
		});
		const json = JSON.stringify(parsedData, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'data.json';
		link.click();
	}
</script>

<div class="container mt-4">
	<div class="d-flex align-items-center justify-content-between mb-4">
		<h1 class="mb-0">Database</h1>
		<button class="btn btn-primary" on:click={downloadJSON}>Download Data as JSON</button>
	</div>
	{#if error}
		<div class="alert alert-danger">{error}</div>
	{:else if groupedData.length > 0}
		{#each groupedData as group, username}
			<div class="card mb-4">
				<div class="card-header d-flex justify-content-between align-items-center">
					<div>
						<strong>Username:</strong>
						{group[0].username} |
						<strong>Number of records:</strong>
						{group.length}
					</div>
					<div>
						<button
							class="btn btn-sm btn-secondary"
							type="button"
							data-bs-toggle="collapse"
							data-bs-target={`#collapse-${username}`}
							aria-expanded="false"
							aria-controls={`collapse-${username}`}
						>
							Show/Hide Data
						</button>
					</div>
				</div>
				<div id={`collapse-${username}`} class="collapse">
					<div class="card-body">
						{#each group as record}
							<div class="card mb-2">
								<div class="card-header d-flex justify-content-between align-items-center">
									<div>
										<strong>ID:</strong>
										{record.id} |
										{#if record.password}
											<strong>Password:</strong>
											{record.password} |
											<strong>Password 1:</strong>
											{record.password1} |
											<strong>Password 2:</strong>
											{record.password2}
										{/if}
										{#if record.floatingTextarea1}
											<strong>Textarea 1:</strong> {record.floatingTextarea1.slice(0, 50)} ...
										{/if}
										{#if record.floatingTextarea2}
											<strong>Textarea 2:</strong> {record.floatingTextarea2.slice(0, 50)} ...
										{/if}
									</div>
									<div>
										<button
											class="btn btn-sm btn-secondary"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target={`#collapse-id-${record.id}`}
											aria-expanded="false"
											aria-controls={`collapse-id-${record.id}`}
										>
											Show/Hide ID Data
										</button>
										<button
											class="btn btn-sm btn-danger ms-2"
											on:click={() => deleteRecord(record.id, record.username)}
										>
											Delete
										</button>
									</div>
								</div>
								<div id={`collapse-id-${record.id}`} class="collapse">
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
												{#if record.keyData}
													{#each Object.entries(record.keyData) as [type, entries]}
														{#each entries as entry}
															<tr>
																<td>{type}</td>
																<td>{entry.key}</td>
																<td>{entry.keyDownTime ?? 'N/A'}</td>
																<td>{entry.keyUpTime ?? 'N/A'}</td>
																<td>{entry.durationInSeconds ?? 'N/A'}</td>
															</tr>
														{/each}
													{/each}
												{/if}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	{:else}
		<p>Loading data...</p>
	{/if}
</div>
