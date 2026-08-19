import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

interface Props {
  bibtex: string;
  slug: string;
}

export async function getStaticPaths() {
  const publications = await getCollection('publications');

  return publications
    .filter((entry) => Boolean(entry.data.bibtex))
    .map((entry) => ({
      params: { slug: entry.data.slug },
      props: {
        bibtex: entry.data.bibtex!,
        slug: entry.data.slug,
      },
    }));
}

export const GET: APIRoute<Props> = ({ props }) => new Response(
  props.bibtex.trim() + '\n',
  {
    headers: {
      'Content-Type': 'application/x-bibtex; charset=utf-8',
      'Content-Disposition': 'inline; filename="' + props.slug + '.bib"',
    },
  },
);
