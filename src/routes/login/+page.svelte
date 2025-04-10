<script lang="ts">
	import TestForms from '$lib/components/TestForms.svelte';
	let models = ['GMM-UBM'];
</script>

<div class="container p-3 mx-auto">
	<div class="row justify-content-center">
		{#each models as model}
			<div class="col-4">
				<TestForms {model} />
			</div>
		{/each}
	</div>
</div>
