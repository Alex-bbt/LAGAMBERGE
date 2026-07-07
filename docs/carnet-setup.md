# Brancher le carnet de bord (jours spéciaux — Supabase)

La page **Carnet de bord** (`/carnet`) affiche l'année 2026 sous forme de
heatmap : un carré par jour, coloré selon la distance courue (données Strava,
déjà branchées). Certains jours sont mis en avant — une réussite, un échec, un
palier, une anecdote… — et cliquables pour lire un petit article.

Ces **jours spéciaux** sont gérés **entièrement à la main** dans le Table Editor
de Supabase. Il n'y a **aucune interface d'admin sur le site** : tu ajoutes,
modifies ou supprimes tes jours directement dans Supabase, le site se contente
de les lire et de les afficher.

> Tant que Supabase n'est pas configuré (ou si les tables sont vides), le carnet
> s'affiche quand même avec la seule heatmap de distance. Rien ne casse.

Le carnet **réutilise le même projet Supabase et les mêmes variables** que la
newsletter (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). Si tu as déjà suivi
`docs/newsletter-setup.md`, il n'y a **aucune nouvelle variable à ajouter**.

---

## Étape 1 — Créer les deux tables

Dans Supabase → **SQL Editor** → **New query**, colle ce code puis **Run** :

```sql
-- Catégories de jours spéciaux (couleur = code hexadécimal).
create table if not exists journal_categories (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  couleur text not null,
  created_at timestamptz default now()
);

-- Jours spéciaux (un article par jour mis en avant).
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  categorie_id uuid references journal_categories(id) on delete set null,
  titre text not null,
  texte text,
  lien_media text,            -- URL d'un post Instagram / d'une vidéo YouTube
  type_media text,            -- "instagram" ou "youtube" (pour l'intégration)
  created_at timestamptz default now()
);

-- Sécurité : RLS activé, LECTURE PUBLIQUE seulement. Personne ne peut écrire
-- via le site ; toi seul édites depuis ton compte Supabase (Table Editor).
alter table journal_categories enable row level security;
alter table journal_entries enable row level security;

create policy "lecture publique categories"
  on journal_categories for select using (true);
create policy "lecture publique entries"
  on journal_entries for select using (true);
```

---

## Étape 2 — Ajouter les catégories de base

Toujours dans le SQL Editor (ou à la main dans le Table Editor) :

```sql
insert into journal_categories (nom, couleur) values
  ('Réussite',       '#17baa8'),   -- vert / teal
  ('Échec',          '#ff5232'),   -- rouge-orangé
  ('Palier',         '#3b82f6'),   -- bleu
  ('Anecdote',       '#ffce3a'),   -- jaune
  ('Blessure/pause', '#9ca3af');   -- gris
```

Tu peux **ajouter d'autres catégories quand tu veux** (une ligne = une
catégorie). Le site lit la liste dynamiquement : la légende et les couleurs se
mettent à jour toutes seules, sans toucher au code.

---

## Étape 3 — Ajouter un jour spécial

Dans **Table Editor → `journal_entries` → Insert row** :

| Colonne | Exemple | Remarque |
| --- | --- | --- |
| `date` | `2026-03-14` | le jour concerné (format AAAA-MM-JJ) |
| `categorie_id` | *(choisir dans la liste)* | pointe vers une catégorie |
| `titre` | `1000 km depuis janvier` | titre de l'article |
| `texte` | `Un cap symbolique…` | le contenu ; sauts de ligne autorisés |
| `lien_media` | `https://www.instagram.com/p/XXXX/` | optionnel |
| `type_media` | `instagram` | optionnel : `instagram` ou `youtube` |

- **Sans média** (`lien_media` vide) → l'article affiche juste le titre + le texte.
- **Avec un lien Instagram** (`type_media = instagram`) → le post est intégré.
- **Avec un lien YouTube** (`type_media = youtube`) → la vidéo est intégrée.

Formats de liens reconnus pour l'intégration :
- YouTube : `youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/shorts/…`
- Instagram : `instagram.com/p/…`, `instagram.com/reel/…`, `instagram.com/tv/…`

---

## C'est fini

- Les **distances** viennent de Strava (voir `docs/strava-setup.md`).
- Les **jours spéciaux** viennent de ces deux tables Supabase.
- Le site rafraîchit les jours spéciaux environ toutes les 2 minutes (cache
  court) : un ajout apparaît vite, sans redéploiement.

> ⚠️ Comme pour la newsletter : si tu ajoutes/modifies une variable
> d'environnement sur Vercel, elle n'est prise en compte qu'au **déploiement
> suivant**. Éditer les tables dans Supabase, en revanche, ne demande aucun
> redéploiement.
