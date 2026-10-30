# Statistiques Instagram automatiques

Chaque jour (vers 05:17 UTC, à l'heure près sur l'offre Hobby), la tâche
planifiée Vercel appelle `/api/instagram-sync`. Elle lit le compte Instagram
professionnel `lagambergee` par l'API Graph de Meta, enregistre un bilan dans
Supabase (`lagamberge-db`), puis relance la construction du site par un
Deploy Hook. Le site affiche alors les nouveaux abonnés et vues 2026 avec leur
date de relevé réelle.

Code : `lib/instagram.mjs` (lecture + calculs), `lib/instagram-store.mjs`
(stockage), `lib/instagram-reels-essai.mjs` (Reels d'essai à exclure),
`api/instagram-sync.js` (tâche quotidienne), `api/instagram-etat.js`
(surveillance), `vercel.json` (horaire), `src/data/releve-instagram.js`
(lecture au moment de la construction).

## Voie d'accès réellement en place

- Adresse : `graph.facebook.com/v26.0/17841477861354587` (ID du compte
  Instagram pro). C'est la seule voie : `graph.instagram.com` refuse les jetons
  `EAA…`, et la « connexion Instagram » (jetons `IG…`) n'est plus ouverte aux
  nouvelles apps.
- App Meta « La Gamberge stats » (`950609494490086`), en mode développement.
- Jeton : généré dans le **Graph API Explorer** avec `instagram_basic`,
  `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`.
  - Jeton utilisateur longue durée : environ 60 jours. Le code ne le renouvelle pas.
  - Cible : **jeton de Page** obtenu à partir d'un jeton utilisateur longue
    durée (`GET {id-de-la-page}?fields=access_token`) : Meta indique qu'il n'a
    pas de date d'expiration. Il est invalidé si le mot de passe Facebook
    change, si le rôle d'Alex sur la Page est retiré ou si l'app perd son
    autorisation.
- Ce qui a échoué (ne pas refaire) : le jeton de l'utilisateur système
  automatique de l'étape « Générer un token » (erreur 100), l'utilisateur
  système `lagamberge-site` (la Page n'est pas attribuable, erreur 100),
  tout jeton `EAA…` sur `graph.instagram.com` (erreur 190).

## Ce qui est calculé

| Indicateur | Définition |
|---|---|
| Abonnés | `followers_count` du compte |
| Publications 2026 | feed et Reels publiés depuis le 1er janvier (l'API ne liste pas les stories) |
| Vues médianes, publications > 10 000 et > 100 000 vues | `views` de ces publications ; aussi calculées hors Reels d'essai (`horsReelsEssai`) |
| Interactions des publications 2026 | `total_interactions` de chaque publication, additionnées |
| Interactions du compte 2026 | indicateur `total_interactions` du compte (publications, Reels, stories, vidéos, lives), par fenêtres de 30 jours |
| Vues du compte 2026 | indicateur `views` du compte, par fenêtres de 30 jours (toutes surfaces) |
| Genre | `follower_demographics`, « non renseigné » exclu (sa part est gardée dans `genreNonRenseigne`) |
| Âge | tranches du site en % des abonnés de 18 ans et plus (part des 13–17 ans dans `moins18`) |
| Pays, villes | `follower_demographics` : % du nombre total d'abonnés (`paysSurAbonnes`, base retenue le 30/10/2026 ; Meta renvoie 45 pays couvrant ~99,5 % des abonnés) ; `pays` = ancienne base (% des lignes renvoyées) ; effectifs dans `audience.bases` |

Reels d'essai : l'API ne permet pas de les reconnaître. Les lister à la main
(code court du lien) dans `lib/instagram-reels-essai.mjs`.

Restent relevés à la main : l'engagement « interactions / couverture » (la
couverture d'une année ne s'additionne pas) et les vues médianes des stories.

Affichés automatiquement : **abonnés**, **vues 2026** et **pays des abonnés**
(3 premiers pays, en % du total d'abonnés), chacun avec sa date de relevé.
Tout autre indicateur ne passe en automatique qu'après validation d'Alex.

## Variables Vercel (projet `lagamberge`, Production)

| Variable | Valeur |
|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | le jeton (Sensitive ; jamais dans le code ni dans un message) |
| `INSTAGRAM_USER_ID` | `17841477861354587` (non secret) |
| `CRON_SECRET` | longue chaîne aléatoire ; Vercel l'envoie à la tâche, tout autre appel est refusé |
| `INSTAGRAM_DEPLOY_HOOK` | URL du Deploy Hook `instagram` (branche `main`) — Sensitive |
| `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` | *(facultatif)* ID et clé secrète de l'app : permettent à Meta de décrire le jeton (`debug_token`) et donc l'alerte d'expiration avec un jeton de Page |

`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` existent déjà.
⚠️ Une variable ajoutée ou modifiée n'est prise en compte qu'au déploiement suivant.

## Surveillance

- `instagram_suivi` (Supabase) garde le compte rendu du dernier passage, réussi
  ou non : état, nombre d'échecs consécutifs, date du dernier relevé réussi,
  état du jeton (type, expiration, fin d'accès aux données, jours restants).
- `GET /api/instagram-etat` le résume sans aucun secret : `alerte: true` avec
  ses raisons (`dernier_passage_echec_meta`, `tache_planifiee_muette`,
  `jeton_bientot_expire_ou_invalide`, `reconstruction_en_echec`). L'alerte
  jeton se déclenche 21 jours avant la première échéance.
- Durée : la tâche doit tenir en 60 s (limite de `vercel.json`). Les lectures Meta
  sont faites en parallèle (~30 s) et le Deploy Hook, qui peut mettre ~20 s à
  répondre, n'est attendu que 10 s (`construction: demandee_sans_reponse`).
- En cas d'échec, `instagram_snapshot` n'est pas touché : le site continue
  d'afficher le dernier relevé réussi avec sa vraie date.
- Journaux Vercel : `{"tache":"instagram-sync","etat":…}` ; l'offre Hobby ne
  les garde qu'une heure.

## Tables Supabase (déjà créées)

```sql
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
create table if not exists public.instagram_suivi (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  passe_le timestamptz not null default now()
);
alter table public.instagram_snapshot enable row level security;
alter table public.instagram_historique enable row level security;
alter table public.instagram_suivi enable row level security;
-- Accès réservé au serveur (clé service) ; GRANT explicite obligatoire
-- pour toute nouvelle table du schéma public (Supabase, 30 octobre 2026).
revoke all on public.instagram_snapshot, public.instagram_historique, public.instagram_suivi from anon, authenticated;
grant select, insert, update, delete on public.instagram_snapshot, public.instagram_historique, public.instagram_suivi to service_role;
```

`instagram_jeton` (ancien renouvellement des jetons `IG…`) a été supprimée le
30/10/2026.

La tâche quotidienne lit la base à chaque passage : cette activité évite la
mise en pause automatique du projet Supabase gratuit (7 jours sans activité).
