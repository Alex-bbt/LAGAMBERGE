# Bibliothèque de séances (Supabase)

La page **/coureur → onglet Séances** affiche une bibliothèque de séances
d'entraînement que le visiteur peut filtrer, personnaliser et **télécharger au
format `.FIT`** pour sa montre (Garmin, Coros…).

Comme le carnet et la newsletter, **tu gères le contenu directement dans
Supabase** — aucune interface d'admin sur le site. Tant que Supabase n'est pas
configuré (ou momentanément indisponible), le site affiche les **séances de
secours** codées dans `src/data/workouts.js` (la personnalisation et l'export
`.FIT` marchent quand même). Les variables d'environnement sont les **mêmes que
la newsletter** (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) : rien de plus à
brancher côté Vercel.

---

## Étape 1 — Créer les tables (une seule fois)

Dans Supabase → **SQL Editor** → **New query**, colle et exécute :

```sql
-- Catégories de séances
create table if not exists workout_categories (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text
);

-- Séances
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  description text,
  categorie_id uuid references workout_categories(id) on delete set null,
  distance_cible_m integer,          -- distance visée en mètres (10000 = 10 km), NULL si généraliste
  structure jsonb not null,          -- étapes de la séance (voir format plus bas)
  created_at timestamptz default now()
);

-- Recommandations d'allure (plusieurs objectifs possibles par séance)
create table if not exists workout_pace_guidance (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references workouts(id) on delete cascade,
  objectif_label text not null,                 -- ex : "Passer sous 40 min au 10 km"
  allure_recommandee_sec_par_km integer not null -- allure en secondes/km (240 = 4:00/km)
);

-- RLS : lecture publique seulement (aucune écriture depuis le site)
alter table workout_categories    enable row level security;
alter table workouts              enable row level security;
alter table workout_pace_guidance enable row level security;

create policy "lecture publique" on workout_categories    for select using (true);
create policy "lecture publique" on workouts              for select using (true);
create policy "lecture publique" on workout_pace_guidance for select using (true);
```

> Le site lit via `/api/workouts` avec la clé `service_role` (côté serveur,
> jamais exposée). Les policies de lecture publique permettent en plus une
> lecture avec la clé `anon` si un jour tu en as besoin. Aucune policy
> d'écriture n'est créée : personne ne peut modifier le contenu depuis le web.

---

## Étape 2 — Le format du champ `structure` (jsonb)

C'est le cœur d'une séance : une **liste ordonnée d'étapes**. Chaque étape a un
`type`, et est définie **soit en temps (`duree_sec`) soit en distance
(`distance_m`)**.

| `type`             | À quoi ça sert                                             |
| ------------------ | --------------------------------------------------------- |
| `echauffement`     | Mise en route (souvent en temps)                          |
| `effort`           | Portion rapide — accepte une `allure_cible_sec_par_km`    |
| `recuperation`     | Récup entre deux efforts                                  |
| `retour_calme`     | Retour au calme                                           |
| `repetition_bloc`  | Groupe qui se répète : `nb_repetitions` + `etapes: [...]` |

Champs par étape :

- `duree_sec` **ou** `distance_m` (l'un des deux) — la durée/distance de l'étape.
- `allure_cible_sec_par_km` (optionnel, surtout pour les `effort`) — allure
  cible en **secondes par kilomètre** (`240` = 4:00/km, `228` = 3:48/km).
- Pour un `repetition_bloc` uniquement : `nb_repetitions` (entier) et `etapes`
  (une sous-liste d'étapes, mêmes règles).

### Exemple — « 3 × 2000 m » orientée 10 km

```json
[
  { "type": "echauffement", "duree_sec": 1200, "allure_cible_sec_par_km": 360 },
  {
    "type": "repetition_bloc",
    "nb_repetitions": 3,
    "etapes": [
      { "type": "effort", "distance_m": 2000, "allure_cible_sec_par_km": 228 },
      { "type": "recuperation", "duree_sec": 180 }
    ]
  },
  { "type": "retour_calme", "duree_sec": 600 }
]
```

### Exemple — pyramide « 800-1000-1500-1000-800 »

Quand les distances varient, pas besoin de bloc : on liste les efforts à la
suite, séparés par des récups.

```json
[
  { "type": "echauffement", "duree_sec": 1200, "allure_cible_sec_par_km": 360 },
  { "type": "effort", "distance_m": 800,  "allure_cible_sec_par_km": 222 },
  { "type": "recuperation", "duree_sec": 120 },
  { "type": "effort", "distance_m": 1000, "allure_cible_sec_par_km": 228 },
  { "type": "recuperation", "duree_sec": 150 },
  { "type": "effort", "distance_m": 1500, "allure_cible_sec_par_km": 234 },
  { "type": "recuperation", "duree_sec": 150 },
  { "type": "effort", "distance_m": 1000, "allure_cible_sec_par_km": 228 },
  { "type": "recuperation", "duree_sec": 120 },
  { "type": "effort", "distance_m": 800,  "allure_cible_sec_par_km": 222 },
  { "type": "retour_calme", "duree_sec": 600 }
]
```

> 💡 Pour t'inspirer, les séances de secours de `src/data/workouts.js` sont
> écrites **exactement dans ce format** : copie-en une et adapte-la.

---

## Étape 3 — Ajouter une séance

Dans **Table Editor** → `workouts` → **Insert row** :

1. `titre` : ex. `3 × 2000 m`
2. `description` : une phrase courte (ton du site : clair, un brin léger).
3. `categorie_id` : choisis une catégorie existante (colonne `id` de
   `workout_categories`).
4. `distance_cible_m` : la distance visée en mètres (`10000` pour un 10 km), ou
   laisse vide si la séance est généraliste.
5. `structure` : colle le JSON (voir format ci-dessus).

Puis, pour proposer des allures selon l'objectif du coureur, ajoute une ou
plusieurs lignes dans `workout_pace_guidance` (chacune avec le `workout_id` de
ta séance) :

| `objectif_label`                | `allure_recommandee_sec_par_km` |
| ------------------------------- | ------------------------------- |
| `Passer sous 40 min au 10 km`   | `228` (= 3:48/km)               |
| `Viser 45 min au 10 km`         | `258` (= 4:18/km)               |

Sur le site, ces objectifs deviennent des **boutons cliquables** : cliquer
applique l'allure recommandée à **tous les efforts** de la séance. Le visiteur
peut ensuite affiner à la main avant de télécharger.

C'est tout — la nouvelle séance apparaît immédiatement (cache CDN de ~5 min).

---

## Aide-mémoire : allures ↔ secondes/km

| Allure    | sec/km | | Allure    | sec/km |
| --------- | ------ |-| --------- | ------ |
| 3:30/km   | 210    | | 4:30/km   | 270    |
| 3:45/km   | 225    | | 5:00/km   | 300    |
| 4:00/km   | 240    | | 5:30/km   | 330    |
| 4:15/km   | 255    | | 6:00/km   | 360    |

Formule : `secondes/km = minutes × 60 + secondes` (4:12/km → 4×60+12 = 252).

---

## Le fichier `.FIT` (pour info)

Le bouton « Télécharger pour ma montre » génère un fichier `.FIT` de type
*workout* structuré, **entièrement côté navigateur** (`src/lib/fit.js`, zéro
dépendance, rien n'est stocké). C'est un format universel : il s'importe dans
**Garmin Connect** (Entraînement → Importer) comme dans l'appli **Coros**, sans
dépendre d'une marque. Les allures sont exportées comme **zones de vitesse
cible**, les récups en temps, et les blocs comme de vraies **répétitions**.
