# Statistiques Instagram automatiques

Chaque jour, une tâche planifiée Vercel appelle `/api/instagram-sync`, qui lit le
compte Instagram professionnel d'Alex via l'API Instagram (connexion Instagram,
`graph.instagram.com`) et enregistre un bilan dans Supabase (`lagamberge-db`).

Code : `lib/instagram.mjs` (lecture + calculs), `lib/instagram-store.mjs`
(stockage), `api/instagram-sync.js` (tâche quotidienne), `vercel.json` (horaire).

## Ce qui est calculé

| Indicateur | Définition |
|---|---|
| Abonnés | `followers_count` du compte |
| Publications 2026 | publications du feed et Reels publiés depuis le 1er janvier (l'API ne liste pas les stories) |
| Vues médianes par publication | médiane des `views` de ces publications |
| Publications à plus de 10 000 / 100 000 vues | idem |
| Interactions des publications 2026 | `total_interactions` de chaque publication, additionnées |
| Vues du compte en 2026 | indicateur `views` du compte, additionné par fenêtres de 30 jours (toutes surfaces) |
| Audience des abonnés | `follower_demographics` : âge, genre, pays, villes, en % |

Restent relevés à la main : l'engagement « interactions / couverture » (la
couverture d'une année ne s'additionne pas) et les vues médianes des stories.

Tant que la comparaison avec les relevés manuels n'a pas été validée par Alex,
le site continue d'afficher les valeurs de `src/data/mediakit.js` : le bilan est
seulement enregistré.

## 1. Côté Meta (à faire par Alex, une fois)

1. **Compte professionnel** : dans l'appli Instagram, Paramètres → Type de compte
   et outils → le compte doit être « Créateur » ou « Entreprise ».
2. **Créer l'application** : sur <https://developers.facebook.com/apps>, « Créer
   une app » → cas d'utilisation « Gérer les messages et le contenu sur
   Instagram » (API Instagram) → nom : `La Gamberge stats`.
3. **Ajouter le compte comme testeur** : dans l'app, Rôles de l'app → Rôles →
   Ajouter des personnes → « Testeur Instagram » → `lagambergee`. Puis, dans
   l'appli Instagram : Paramètres → Apps et sites web → Invitations de testeur →
   Accepter.
4. **Générer le jeton** : dans l'app, Instagram → « Configuration de l'API avec
   connexion Instagram » → « Générer des tokens d'accès » → Ajouter un compte →
   se connecter avec `lagambergee` → accepter les autorisations
   `instagram_business_basic` et `instagram_business_manage_insights` →
   « Générer le token ». Le jeton affiché est valable 60 jours ; il est ensuite
   renouvelé automatiquement chaque semaine par la tâche quotidienne.

L'app reste en mode développement : pour son propre compte, aucune validation
par Meta n'est nécessaire.

## 2. Côté Vercel (projet `lagamberge`, environnement Production)

| Variable | Valeur |
|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | le jeton généré à l'étape 4 (à coller dans Vercel, jamais dans le code ni dans un message) |
| `CRON_SECRET` | une longue chaîne aléatoire ; Vercel l'envoie à la tâche planifiée, tout autre appel est refusé |
| `INSTAGRAM_DEPLOY_HOOK` | *(plus tard)* URL d'un Deploy Hook, pour reconstruire le site après chaque relevé quand l'affichage automatique sera activé |

`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` existent déjà (cache Strava).

Après le premier relevé, le jeton est conservé dans la table `instagram_jeton`
(il change à chaque renouvellement). Pour en remettre un neuf, mettre à jour
`INSTAGRAM_ACCESS_TOKEN` : il est utilisé dès que le jeton enregistré a expiré,
ou après avoir vidé la table.

## 3. Tables Supabase (déjà créées)

```sql
create table if not exists public.instagram_jeton (
  id int primary key default 1 check (id = 1),
  jeton text not null,
  expire_le timestamptz,
  renouvele_le timestamptz
);
create table if not exists public.instagram_snapshot (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.instagram_historique (
  jour date primary key,
  data jsonb not null,
  cree_le timestamptz not null default now()
);
alter table public.instagram_jeton enable row level security;
alter table public.instagram_snapshot enable row level security;
alter table public.instagram_historique enable row level security;
-- Accès réservé au serveur (clé service) : aucune politique publique.
revoke all on public.instagram_jeton, public.instagram_snapshot, public.instagram_historique from anon, authenticated;
grant select, insert, update, delete on public.instagram_jeton, public.instagram_snapshot, public.instagram_historique to service_role;
```

La tâche quotidienne lit aussi la base même sans jeton : cette activité évite la
mise en pause automatique du projet Supabase gratuit (au-delà de 7 jours sans
activité).
