import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { purgeCss } from 'vite-plugin-svelte-purgecss';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()]
});
