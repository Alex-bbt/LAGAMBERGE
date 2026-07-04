# Les easter eggs du calculateur d'allure (table Supabase)

Le calculateur d'allure (`/coureur`) peut afficher de petits messages surprise
quand l'utilisateur saisit certaines allures. **Ces messages ne sont PAS codés
dans le site** : ils vivent dans une table Supabase `pace_easter_eggs`. Tu peux
donc en **ajouter, modifier ou supprimer** à tout moment, directement dans
Supabase, **sans toucher au code** ni redemander une modification.

Le site lit cette table via `/api/pace-easter-eggs` (la clé `service_role`
reste côté serveur, comme pour la newsletter). Tant que la table n'existe pas ou
que Supabase n'est pas configuré, le calculateur fonctionne normalement — il
n'affiche simplement aucun easter egg.

> Prérequis : Supabase déjà branché pour la newsletter (variables `SUPABASE_URL`
> et `SUPABASE_SERVICE_ROLE_KEY` sur Vercel). Voir `docs/newsletter-setup.md`.

---

## Étape 1 — Créer la table

Dans Supabase → **SQL Editor** → **New query**, colle ce code puis **Run** :

```sql
create table if not exists pace_easter_eggs (
  id uuid primary key default gen_random_uuid(),
  -- Distance précise en MÈTRES pour laquelle l'easter egg se déclenche.
  -- Laisse VIDE (null) pour qu'il se déclenche quelle que soit la distance.
  -- Ex : 42195 = marathon, 21100 = semi, 10000 = 10 km, 5000 = 5 km.
  distance_m integer,
  -- Plage d'allure qui déclenche le message, en SECONDES par km.
  -- Ex : 3:20/km = 200 s ; 4:30/km = 270 s. (minutes × 60 + secondes)
  pace_min_sec_per_km integer not null,  -- borne basse
  pace_max_sec_per_km integer not null,  -- borne haute
  -- Le texte affiché. Peut contenir {distance} : remplacé automatiquement par
  -- la distance saisie par l'utilisateur (en km, ex : 42,195).
  message text not null,
  created_at timestamptz default now()
);

-- Sécurité : on active RLS. Le site lit via la clé "service" (côté serveur)
-- qui outrepasse RLS ; personne d'autre ne peut lire/écrire la table.
alter table pace_easter_eggs enable row level security;
```

---

## Étape 2 — Ajouter les premiers messages

Toujours dans le **SQL Editor**, voici les deux exemples de départ :

```sql
insert into pace_easter_eggs
  (distance_m, pace_min_sec_per_km, pace_max_sec_per_km, message)
values
  -- ≈ 3:20 min/km (195 à 205 s), quelle que soit la distance :
  (null, 195, 205,
   'Le saviez-vous : à cette vitesse, Jimmy Gressier est physiologiquement en footing.'),

  -- Allure « record du monde » sur marathon (≈ 2:52/km ou plus rapide) :
  (42195, 0, 172,
   'Si tu tiens cette allure-là sur {distance} km je te paye le café... Bon j''avoue je prends pas trop de risque 😅');
```

> Astuce : pour un easter egg « record du monde » sur d'autres distances, ajoute
> une ligne par distance avec la bonne borne haute d'allure (en s/km). Repères
> actuels (arrondis, à ajuster à ta guise) :
> - **5 km** : `distance_m = 5000`, allure record ≈ 2:26/km → `pace_max ≈ 146`
> - **10 km** : `distance_m = 10000`, ≈ 2:39/km → `pace_max ≈ 159`
> - **Semi** : `distance_m = 21100`, ≈ 2:47/km → `pace_max ≈ 167`
> - **Marathon** : `distance_m = 42195`, ≈ 2:52/km → `pace_max ≈ 172`
>
> Mets `pace_min = 0` pour attraper « ce record OU plus rapide ».

---

## Comment ça marche côté site

À chaque calcul, le calculateur compare l'allure obtenue (en s/km) à chaque
ligne de la table :

1. l'allure doit être **entre** `pace_min_sec_per_km` et `pace_max_sec_per_km` ;
2. si `distance_m` est renseigné, la **distance saisie** doit correspondre (à
   ~1 % près, pour gérer 21,1 vs 21,0975 km) ; s'il est vide, l'easter egg vaut
   pour **toutes** les distances.

Tous les messages qui correspondent s'affichent discrètement **sous** le
calculateur (jamais de popup bloquante). Le `{distance}` éventuel est remplacé
par la distance saisie (ex : `42,195`).

## Ajouter un easter egg plus tard

Deux options, au choix :

- **Table Editor** (le plus simple) : Supabase → **Table Editor** →
  `pace_easter_eggs` → **Insert row**, remplis les colonnes.
- **SQL Editor** : un `insert into pace_easter_eggs (...) values (...)`.

Le nouveau message apparaît sur le site en moins d'une minute (petit cache).
Aucun déploiement nécessaire.
