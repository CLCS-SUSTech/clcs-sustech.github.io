import { defineConfig } from 'astro/config';

const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserSite = owner && repository?.toLowerCase() === `${owner.toLowerCase()}.github.io`;
const inferredBase = process.env.GITHUB_ACTIONS
  ? isUserSite
    ? '/'
    : `/${repository}`
  : '/';

export default defineConfig({
  site: process.env.SITE_URL ?? (owner ? `https://${owner}.github.io` : 'https://example.com'),
  base: process.env.BASE_PATH ?? inferredBase,
  output: 'static',
  trailingSlash: 'always',
});
