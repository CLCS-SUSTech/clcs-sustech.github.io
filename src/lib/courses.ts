import { getCollection, type InferEntrySchema } from 'astro:content';

export type CourseTerm = InferEntrySchema<'courses'>;
export type CourseWeek = CourseTerm['weeks'][number];
export type CourseResource = NonNullable<CourseWeek['resources']>[number];

export interface Course {
  /** Term years, newest first (e.g. ['2026', '2025']). */
  years: string[];
  /** Term data keyed by year. */
  terms: Map<string, CourseTerm>;
}

/** Load one course (e.g. 'cse5026') from src/content/courses/<course>/<year>.yaml. */
export async function getCourse(course: string): Promise<Course> {
  const entries = await getCollection('courses', ({ data }) => data.course === course);
  const sorted = entries.sort((a, b) => b.data.year.localeCompare(a.data.year));
  return {
    years: sorted.map((entry) => entry.data.year),
    terms: new Map(sorted.map((entry) => [entry.data.year, entry.data])),
  };
}
