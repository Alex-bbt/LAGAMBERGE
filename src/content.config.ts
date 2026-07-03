import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Collection "conseils" : chaque article est un fichier .md dans
// src/content/conseils/. Pour en ajouter un, copie un fichier existant,
// change le bloc du haut (le "frontmatter") et écris ton texte en dessous.
const conseils = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/conseils' }),
  schema: z.object({
    title: z.string(),
    resume: z.string(),
    emoji: z.string().default('👟'),
    niveau: z.enum(['debutant', 'intermediaire', 'tous']).default('tous'),
    date: z.coerce.date(),
    ordre: z.number().default(0), // pour ranger les articles à la main
  }),
});

export const collections = { conseils };
