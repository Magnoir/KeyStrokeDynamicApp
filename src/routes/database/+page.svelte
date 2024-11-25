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
		console.log("Data:", data);
		const result = data.database;
		if (result.data && typeof result.data === 'object') {
			const records: Record[] = Object.values(result.data);
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

	function downloadJSON() {
		const recordsWithParsedKeyData = parsedData.map((record, index) => {
			if (record.keyData) {
				try {
					const parsedKeyData = JSON.parse(record.keyData);
					return { ...record, keyData: parsedKeyData };
				} catch (e) {
					error = "Error parsing JSON data.";
					return record;
				}
			}
			return record;
		});

		const json = JSON.stringify(recordsWithParsedKeyData, null, 2);
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
			  <button class="btn btn-sm btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${index}`} aria-expanded="false" aria-controls={`collapse-${index}`}>
				Show/Hide Data
			  </button>
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