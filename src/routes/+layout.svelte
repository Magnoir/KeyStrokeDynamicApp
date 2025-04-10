<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.min.css';
	import iconImg from '$lib/images/favicon.webp';
	let { data, children } = $props();
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/webp" sizes="192x192" href={iconImg} />
	<meta name="description" content="Navigation bar of the website" />
</svelte:head>

<nav class="navbar navbar-expand-lg bg-primary">
	<div class="container">
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarNav"
			aria-controls="navbarNav"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>

		<div class="collapse navbar-collapse" id="navbarNav">
			<ul class="navbar-nav mx-auto">
				{#if data.logged_in && data.user_status === 1}
					<li class="nav-item">
						<a class="nav-link text-white" href="/home">Home</a>
					</li>
					<li class="nav-item">
						<a class="nav-link text-white" href="/test">Test</a>
					</li>
					<li class="nav-item">
						<a class="nav-link text-white" href="/database">Database</a>
					</li>
					<li class="nav-item">
						<a class="nav-link text-white" href="/admin">Admin</a>
					</li>
				{/if}
				{#if !data.logged_in}
					<li class="nav-item">
						<a class="nav-link text-white" href="/signup">Sign Up</a>
					</li>
					<li class="nav-item">
						<a class="nav-link text-white" href="/login">Login</a>
					</li>
				{/if}
			</ul>
		</div>
		{#if data.logged_in}
			<form method="post">
				<button class="btn btn-danger" formaction="/?/logout">Logout</button>
			</form>
		{/if}
	</div>
</nav>

<main>
	{@render children()}
</main>
