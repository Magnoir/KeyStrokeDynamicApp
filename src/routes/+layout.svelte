<script lang="ts">
	import 'bootstrap/dist/css/bootstrap.min.css';
	let { data, children } = $props();
</script>

<svelte:head>
	<title>Key Stroke Dynamics Tests</title>
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
					<li class="nav-item">
						<a class="nav-link text-white" href="/login-admin">Login Admin</a>
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
