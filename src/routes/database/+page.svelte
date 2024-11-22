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
  </script>
  
  <div class="container mt-4">
	<h1 class="mb-4">Firebase Database</h1>
	{#if error}
	  <div class="alert alert-danger">{error}</div>
	{:else if parsedData.length > 0}
	  {#each parsedData as record, index}
		{#if parsedKeyData[index]}
		  <h3>
			Username : {record.username} |
			Password : {record.password} |
			Password 1 : {record.password1} |
			Password 2 : {record.password2}
		  </h3>
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
		{:else}
		  <p>No key data for this record.</p>
		{/if}
	  {/each}
	{:else}
	  <p>Loading data...</p>
	{/if}
  </div>