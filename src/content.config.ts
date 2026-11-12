import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// A branch is an overlay that grows out of a word. In a post's body, link a
// word to `#b:<id>` and describe the branch under `branches.<id>`. Inside a
// branch's own text, `[word](#sub:<id>)` opens a nested branch from `subs`.
const branch: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.enum(['define', 'aside', 'diagram', 'figure', 'mood', 'project', 'leaf']),
    title: z.string().optional(),
    body: z.string().optional(),
    link: z.string().optional(),
    wide: z.boolean().default(false),
    want: z.enum(['L', 'R']).optional(),
    tone: z.enum(['hard', 'good']).optional(), // mood only
    steps: z.array(z.object({ label: z.string(), note: z.string().optional() })).optional(), // diagram
    cmd: z.string().optional(), // diagram
    figure: z.string().optional(), // name from src/lib/figures.ts
    seal: z.string().optional(), // define: a logo beside the title (SEALS in src/lib/ui.ts)
    subs: z.record(z.string(), branch).optional(),
  }),
);

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    dateline: z.string().optional(),
    repo: z.string().url().optional(), // shown first, above the title
    project: z.string().url().optional(), // the official GSoC project page, beside the repo
    glance: z.array(z.tuple([z.string(), z.string()])).default([]), // at a glance: [label, inline markdown]
    marks: z.array(z.string()).default([]), // seals for the header, joined by a line: from → to
    draft: z.boolean().default(false),
    branches: z.record(z.string(), branch).default({}),
  }),
});

export const collections = { writing };
