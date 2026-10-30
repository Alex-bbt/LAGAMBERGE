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

## 1. Côté Meta (fait le 30 octobre 2026)

Meta n'ouvre plus la « connexion Instagram » aux nouvelles apps : l'app
`La Gamberge stats` utilise la **connexion unifiée**, qui exige un portefeuille
business (`La Gamberge`) et fournit un **jeton d'utilisateur système sans
expiration** (graph.facebook.com).

1. Compte Instagram en mode professionnel (Créateur).
2. developers.facebook.com → Créer une app → cas d'utilisation « Gérer les
   messages et les contenus sur Instagram » → aucune entreprise à la création.
3. Rôles dans l'application → Testeur Instagram `lagambergee` ; invitation
   acceptée sur instagram.com/accounts/manage_access/ (onglet Tester Invites).
4. Cas d'utilisation → Personnaliser → API setup with Unified login →
   associer le portefeuille business `La Gamberge`.
5. Autorisations et fonctionnalités : seules les autorisations de LECTURE
   sont ajoutées (`instagram_basic`, `instagram_manage_insights`,
   `instagram_business_basic`, `instagram_business_manage_insights`).
6. Facebook Login for Business → Configurations → configuration
   `Statistiques La Gamberge` : token d'utilisateur système, expiration
   jamais, élément Comptes Instagram (requis), autorisations `instagram_basic`
   + `instagram_manage_insights`. Ne pas utiliser le modèle par défaut (il
   ajoute publicités, messages, commentaires et publication, sans statistiques).
7. API setup with Unified login → étape 1 : choisir cette configuration ;
   étape 2 : « Générer un token » sur la ligne lagambergee.

Le code accepte aussi un jeton « connexion Instagram » (préfixe `IG`, renouvelé
automatiquement), au cas où Meta le proposerait de nouveau.

## 2. Côté Vercel (projet `lagamberge`, environnement Production)

| Variable | Valeur |
|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | le jeton généré à l'étape 7 (à coller dans Vercel, jamais dans le code ni dans un message) |
| `INSTAGRAM_USER_ID` | identifiant du compte Instagram pro : `17841477861354587` (non secret, affiché par Meta) |
| `CRON_SECRET` | une longue chaîne aléatoire ; Vercel l'envoie à la tâche planifiée, tout autre appel est refusé |
| `INSTAGRAM_DEPLOY_HOOK` | *(plus tard)* URL d'un Deploy Hook, pour reconstruire le site après chaque relevé quand l'affichage automatique sera activé |

`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` existent déjà (cache Strava).

Jeton « connexion Instagram » uniquement : après le premier relevé, il est
conservé dans la table `instagram_jeton` (il change à chaque renouvellement).
Le jeton d'utilisateur système de la connexion unifiée reste dans Vercel. Pour en remettre un neuf, mettre à jour
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
