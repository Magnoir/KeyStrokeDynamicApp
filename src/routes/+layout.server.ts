import { redirect } from '@sveltejs/kit';

export function load({ url }: { url: any }) {
  if (url.pathname === "/") throw redirect(302, '/login');
}