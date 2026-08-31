import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const language = z.enum(['zh', 'en']);
const localizedString = z.object({ zh: z.string(), en: z.string() });
const localizedStrings = z.object({ zh: z.array(z.string()), en: z.array(z.string()) });
const localizedBodyId = ({ data }: { data: Record<string, unknown> }) => `${data.slug}/${data.lang}`;
const slugId = ({ data }: { data: Record<string, unknown> }) => String(data.slug);

const news = defineCollection({
  loader: glob({ pattern: '**/meta.{yaml,yml}', base: './src/content/news', generateId: slugId }),
  schema: z.object({
    slug: z.string(),
    date: z.coerce.date(),
    category: z.enum(['publication', 'congrats', 'event', 'lab-life', 'award']),
    title: localizedString,
    excerpt: localizedString,
    image: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    locales: z.array(language).default(['zh', 'en']),
  }),
});

const newsArticles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/news', generateId: localizedBodyId }),
  schema: z.object({
    lang: language,
    slug: z.string(),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: '*.{yaml,yml}', base: './src/content/research', generateId: slugId }),
  schema: z.object({
    slug: z.string(),
    order: z.number(),
    title: localizedString,
    question: localizedString,
    summary: localizedString,
    description: localizedString,
    keywords: localizedStrings,
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/meta.{yaml,yml}', base: './src/content/projects', generateId: slugId }),
  schema: z.object({
    slug: z.string(),
    order: z.number(),
    title: localizedString,
    summary: localizedString,
    date: z.coerce.date().optional(),
    status: localizedString.optional(),
    tags: localizedStrings.default({ zh: [], en: [] }),
    articleLocales: z.array(language).default([]),
    link: z.url().optional(),
  }),
});

const projectArticles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects', generateId: localizedBodyId }),
  schema: z.object({
    lang: language,
    slug: z.string(),
  }),
});

const member = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/member' }),
  schema: z.object({
    name: localizedString,
    joinYear: z.number().int().min(1900).max(2100).optional(),
    academicTitle: localizedString.optional(),
    role: localizedString.optional(),
    bio: localizedString.optional(),
    recruiting: localizedString.optional(),
    destination: localizedString.optional(),
    profileLinks: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    avatar: z.string().optional(),
    email: z.string().optional(),
    homepage: z.url().optional(),
    scholar: z.url().optional(),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '*.{yaml,yml}', base: './src/content/publications', generateId: slugId }),
  schema: z.object({
    slug: z.string(),
    year: z.number(),
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    status: localizedString.optional(),
    tags: localizedStrings.default({ zh: [], en: [] }),
    paper: z.url().optional(),
    bib: z.url().optional(),
    bibtex: z.string().optional(),
    code: z.url().optional(),
    project: z.url().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  news,
  newsArticles,
  research,
  projects,
  projectArticles,
  member,
  publications,
};
