# CLAUDE.md — La Gamberge

Site personnel autour de la course à pied (**La Gamberge**). Landing page /
carte de visite : présentation, deux défis en direct (streak + qualifs),
actus/projets, conseils, réseaux, newsletter.

Production : **https://www.lagamberge.com** (déployée sur Vercel, branche `main`).

## Stack technique

- **Astro 5** en sortie **statique** (`output: 'static'`, défaut). Rendu
  pré-généré → chargement très rapide, zéro JS par défaut, idéal pour le
  trafic mobile venant d'Instagram.
- **Fonctions serverless Vercel** dans `/api` (zéro-config, runtime Node) pour
  les briques dynamiques (`streak`, `subscribe`, `journal`, `workouts`,
  `pace-easter-eggs`). Elles cohabitent avec le build Astro sans adaptateur.
- **Google Fonts** : Bricolage Grotesque (titres) + Inter (texte).
- Pas de framework CSS : un design system maison dans `src/styles/global.css`
  (variables, `.card`, `.btn`, etc.).
- Déploiement : push sur `main` → build de production automatique sur Vercel.

## Arborescence

```
api/
  streak.js          Endpoint GET /api/streak (streak + stats Strava en direct)
  subscribe.js       Endpoint POST /api/subscribe (inscription newsletter → Supabase)
  journal.js         Endpoint GET /api/journal (jours spéciaux du carnet ← Supabase)
  workouts.js        Endpoint GET /api/workouts (bibliothèque de séances ← Supabase)
lib/
  strava.mjs         Logique Strava PURE + testable (importée par api/streak.js)
src/
  data/site.js       ⭐ SOURCE DE VÉRITÉ ÉDITABLE (voir plus bas)
  data/workouts.js   Séances de SECOURS + doc du format `structure` (fallback)
  lib/fit.js         Encodeur .FIT (navigateur, zéro dépendance) — export séances
  lib/workouts-client.js  Helpers séances partagés (chargement + formatage)
  styles/global.css  Design system (couleurs, typo, composants)
  layouts/Base.astro Squelette HTML (head, métas, header/footer)
  components/*.astro  Header, Footer, StreakCounter, SeasonStats, QualTracker,
                      ProjectCard, Socials, Newsletter, Carnet, PaceCalculator,
                      WorkoutLibrary
  pages/
    index.astro      Accueil (hero, défis, chiffres, actus, réseaux, newsletter)
    carnet.astro     Carnet de bord (heatmap 2026 + timeline des jours spéciaux)
    coureur.astro    Espace Coureur (suite d'outils + bibliothèque séances)
    coureur/seance.astro  Page détail d'une séance (?id=) : éditorial + perso + .FIT
    actus.astro      Projets par statut
    conseils/        Liste + page article ([...slug].astro)
  content/conseils/  Articles en Markdown (collection de contenu Astro)
  content.config.ts  Schéma de la collection "conseils"
docs/
  strava-setup.md      Guide de configuration Strava (pour le propriétaire)
  newsletter-setup.md  Guide de configuration Supabase (pour le propriétaire)
  carnet-setup.md      Guide des tables du carnet de bord (Supabase)
  seances-setup.md     Guide d'ajout de séances dans Supabase (format JSON)
```

## Défi #1 — Streak Strava EN DIRECT, sans base de données

Le compteur « au moins 5 km chaque jour » est **recalculé à la volée** depuis
l'historique Strava. **Strava est la seule source de vérité — rien n'est
stocké.**

- `lib/strava.mjs` : fonctions pures (`computeStreak`, `computeSeasonStats`,
  `dayOfYear`, helpers de date) + `getStreakFromStrava(env)` qui rafraîchit le
  token, récupère les activités et calcule tout.
- `api/streak.js` : appelle `getStreakFromStrava` et renvoie le JSON. **Ne met
  en cache QUE les réponses réussies** (`s-maxage` + `stale-while-revalidate`) ;
  les échecs sont en `no-store` pour ne jamais figer un fallback.
- Côté client, `StreakCounter.astro` et `SeasonStats.astro` **partagent un seul
  appel** `/api/streak` (`window.__streakData`) et mettent à jour le DOM.
  Si Strava n'est pas configuré / échoue, on garde les valeurs de secours
  rendues côté serveur (aucune casse).

**Règles métier** (dans `computeStreak`) : une course **≥ 5 km** valide la
journée ; **une seule fois par jour** ; **course à pied uniquement**
(`Run`/`TrailRun`/`VirtualRun`, le vélo est ignoré) ; fuseau **Europe/Paris** ;
message « défi perdu le X » si un jour terminé n'a pas de course validée.

Variables d'environnement Vercel : `STRAVA_CLIENT_ID`,
`STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN` (+ optionnelles `STREAK_MIN_KM`,
`STREAK_TZ`, `STREAK_START`).

## Newsletter — Supabase, table `subscribers`

- `api/subscribe.js` : POST `{ email, prenom }` → insertion dans la table
  **`subscribers`** de Supabase via l'API REST PostgREST. La clé
  **`service_role` reste côté serveur** (jamais exposée au navigateur).
  Gère l'email en doublon (contrainte unique → 409 traité comme succès).
  Un GET renvoie un booléen `ready` (Supabase configuré ou non).
- `Newsletter.astro` : formulaire prénom + email → `/api/subscribe`, avec états
  (succès / déjà inscrit / non configuré / erreur / email invalide).
- Table (voir `docs/newsletter-setup.md`) : `id, email (unique), prenom, nom,
  age, source, data jsonb, created_at`. La colonne **`data` (JSON)** est la
  réserve pour des infos futures sans changer le schéma.
- Variables d'environnement Vercel : `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`.
- Supabase **stocke** seulement ; l'envoi d'emails (Brevo/Resend) reste à
  brancher plus tard par-dessus cette liste.

## Carnet de bord — heatmap 2026 + jours spéciaux Supabase

Page `/carnet` : le journal de bord visuel de la saison. Deux couches
superposées, chacune résiliente (jamais bloquante).

- **Heatmap de distance** : une grille type « contributions GitHub » (un carré
  par jour de 2026, coloré selon les km courus). Les distances viennent de
  Strava via `computeDailyDistances` (fonction pure de `lib/strava.mjs`),
  exposées dans le champ `dailyKm` de `/api/streak`. **Aucun appel Strava
  supplémentaire** : le carnet réutilise `window.__streakData`, comme le streak.
- **Jours spéciaux** : `api/journal.js` (GET) lit les tables Supabase
  **`journal_categories`** (catégories + couleurs, lues **dynamiquement** —
  jamais figées dans le code) et **`journal_entries`** (le jour, sa catégorie,
  titre, texte, média optionnel). RLS **lecture publique seule** ; l'ajout/édition
  se fait **uniquement dans le Table Editor Supabase** — aucune interface d'admin
  sur le site. Réutilise `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (mêmes
  variables que la newsletter). Voir `docs/carnet-setup.md`.
- **`Carnet.astro`** rend la grille (année 2026) côté serveur, puis colore les
  distances et marque les jours spéciaux côté client. **Chaque case est
  cliquable** (un seul écouteur délégué sur la grille) : un jour ordinaire ouvre
  un **popup par défaut** (date + km courus / « à venir » / « repos »), un jour
  spécial ouvre la **modale riche** (titre, texte, embed natif Instagram/YouTube
  via iframe officiel) et porte un anneau à la couleur de sa catégorie
  (par-dessus la distance, qui reste visible). La légende des catégories est
  **dédupliquée par nom** (robuste aux doublons dans la table Supabase). Sur
  mobile, la grille reste consultable (scroll) mais c'est la **timeline
  verticale** des jours spéciaux qui prime.
- ⚠️ **Grille type GitHub** : la colonne d'un jour = `Math.floor` du nombre de
  semaines depuis le lundi de la 1re colonne (⚠️ pas `round`, sinon ven/sam/dim
  glissent d'une colonne et la grille part en biais).
- ⚠️ **Piège Astro** : les éléments créés en JS (`createElement`) n'ont pas
  l'attribut de scope (`data-astro-cid-*`) ; leurs styles doivent passer par
  `:global(...)` (via un ancêtre rendu côté serveur), sinon ils sont ignorés.
- Résilience : Strava ou Supabase absent/en échec → la page s'affiche quand
  même (heatmap seule, ou grille neutre + message de carnet vide au bon ton).

## Espace coureur — `/coureur` (suite d'outils en onglets + bibliothèque de séances)

Page `src/pages/coureur.astro` : la boîte à outils du coureur. Une **suite
d'outils en onglets** (calcul 100 % côté client) puis une **bibliothèque de
séances** autonome (ancre `/coureur#seances`).

### Suite d'outils (onglets) — calcul côté client, rien de stocké
- Onglets : calculateur d'allure, équivalences, allures d'entraînement,
  cotation, splits, convertisseur. Enhancement progressif : sans JS, tous les
  panneaux restent empilés (accessibles).
- **Calculateur d'allure** (`components/PaceCalculator.astro`) : distance /
  allure / temps dans tous les sens (+ easter eggs via `api/pace-easter-eggs.js`).
- **Logique pure dans `lib/running/`** (ESM, testable Node ET importable dans les
  `<script>` Astro via Vite) : `format.mjs`, `vdot.mjs` (**Daniels-Gilbert
  recalculé** depuis les équations, pas les tables imprimées : coût O₂,
  %VO₂max/durée, VDOT, équivalences par bissection, allures E/M/T/I/R),
  `riegel.mjs`, `karvonen.mjs`, `units.mjs`, `splits.mjs`, `scoring.mjs`
  (World Athletics) + `agegrading.mjs` (WMA). `test.mjs` = cohérence
  (`node lib/running/test.mjs`, à lancer avant tout commit touchant aux modèles).
- **Données sourcées, jamais inventées, dans `lib/running/data/`** :
  `wa-scoring.mjs` (coefficients World Athletics 2025, `pts = a·t²+b·t+c`) et
  `wma-agegrading.mjs` (facteurs WMA/Alan Jones éd. 2020, **générés** depuis la
  source publique). En-tête source + date ; valeurs vérifiées contre des repères
  (records ≈ 1300 pts, standard open = 100 %).
- **Principe éditorial NON négociable** : aucun conseil perso, aucune prédiction
  (« tu peux courir X »), aucune injonction. Que des **équivalences théoriques**
  et des **données factuelles**, chacune avec sa **source affichée**
  (`components/coureur/SourceNote.astro` + section « Méthodes & sources »).
- ⚠️ **Garde-fou < 1500 m** : sous 1500 m la filière est anaérobie → les
  équivalences aérobies (VDOT/Riegel) sont **désactivées** avec un message
  explicite. Ne jamais afficher un temps équivalent pour 400 m/800 m.
- **Volontairement exclus** (non sourçables de façon fiable → on n'approxime
  pas) : niveaux **FFA**, et records du monde « du jour » (le repère utilise le
  standard open WMA, clairement étiqueté).
- Composants dans `src/components/coureur/` ; styles partagés préfixés `.c-*`
  dans `global.css`.

### Bibliothèque de séances (`components/WorkoutLibrary.astro`, ancre `#seances`)
Deux niveaux : la **bibliothèque** (liste filtrable) et une **page détail par
séance**.
- `WorkoutLibrary.astro` : filtres (catégorie / distance) + grille de cartes.
  Chaque carte est un **lien** vers `/coureur/seance/?id=<id>` (vraie navigation,
  bouton retour du navigateur). Plus de détail « inline ».
- **`src/pages/coureur/seance.astro`** : la page d'une séance. Lit l'`id` dans
  l'URL, charge la séance (live ou secours) et affiche : badges (catégorie /
  distance), **résumé « en clair »** de la structure (échauffement, blocs,
  récups, retour au calme, allures), estimation temps/distance, **blocs
  éditoriaux** (`interet` / `periode` / `pour_qui` / `conseils`, chacun masqué
  s'il est vide), puis la **personnalisation + export `.FIT`**.
- **`src/lib/workouts-client.js`** : helpers navigateur PARTAGÉS par la
  bibliothèque et la page détail (`loadWorkouts` avec repli sur les séances de
  secours, formateurs `fmtPace`/`fmtTime`/`fmtDist`, `normalize`, `slug`).
- ⚠️ **Piège Astro** : cartes et détail sont (ré)injectés en JS (`innerHTML`) →
  leurs nœuds n'ont pas l'attribut de scope. Leurs styles sont donc en
  **`:global` / `is:global`** (préfixés `#seances`/`#seance-app`), sinon ils
  s'affichent sans style dès que le JS tourne.

**Données des séances — Supabase, lecture seule** (mêmes variables que la
newsletter / le carnet) :
- Tables `workout_categories`, `workouts`, `workout_pace_guidance`, avec **RLS +
  policy de lecture publique uniquement** (le contenu se gère à la main dans
  Supabase, comme le carnet). Schéma + guide : `docs/seances-setup.md`.
- `api/workouts.js` : lit les 3 tables (3 requêtes simples, assemblées côté
  serveur — pas d'embedding PostgREST pour rester robuste), **ne met en cache
  QUE les réponses réussies**. Les séances sont lues en **`select=*`** →
  robuste aux colonnes éditoriales optionnelles ajoutées plus tard. Si Supabase
  n'est pas configuré/échoue, ou si aucune séance n'est encore saisie → le front
  bascule sur les **séances de secours** de `src/data/workouts.js` (la perso +
  l'export marchent quand même). Robustesse d'abord : la page ne plante jamais.
- Le champ **`structure` (jsonb)** décrit les étapes d'une séance :
  `echauffement` / `effort` / `recuperation` / `retour_calme` /
  `repetition_bloc` (avec `nb_repetitions` + sous-liste `etapes`). Chaque étape
  est en temps (`duree_sec`) OU distance (`distance_m`), + `allure_cible_sec_par_km`
  optionnelle. Colonnes éditoriales optionnelles : `interet`, `periode`,
  `pour_qui`, `conseils`. **Format documenté en détail dans
  `docs/seances-setup.md`**, et `src/data/workouts.js` en donne des exemples
  vivants (à copier/adapter).

**Personnalisation + export `.FIT`** (sur la page détail) — tout côté
navigateur, rien n'est stocké :
- La page clone la `structure` choisie et l'édite en direct (steppers +/- sur
  échauffement, récup, retour au calme, allures, nombre de répétitions). Les
  objectifs de `workout_pace_guidance` sont des boutons : cliquer applique
  l'allure à tous les efforts.
- `src/lib/fit.js` : encodeur **`.FIT` pur (zéro dépendance)** — messages
  `file_id` / `workout` / `workout_step`, CRC FIT, allures exportées en zones de
  vitesse cible, blocs en vraies répétitions. Fichier universel importable dans
  **Garmin Connect** et **Coros**. Logique testable (round-trip header/CRC/étapes).
  ⚠️ Les noms d'étapes dans le `.FIT` restent sans accents (lisibilité montre) ;
  l'UI du site, elle, garde les accents.

## `src/data/site.js` — la source de vérité éditable

Fichier unique, très commenté, pour tout le contenu qui bouge :
`streak` (jour de secours), `season` (chiffres de secours), `quals` (état des 4
qualifs), `socials` (liens réseaux), `projects` (actus). Les valeurs `streak`/
`season` ne servent que de **secours** quand Strava est branché (Strava prime).

## Conventions de code

- **Tout le contenu éditable au quotidien vit dans `src/data/site.js`** (et les
  `.md` de `src/content/conseils/`). Ne pas coder de contenu en dur ailleurs.
- **Langue** : tout en **français** — UI, commentaires, textes. Ton du site :
  léger, drôle, sincère, jamais « coach premium ».
- **Logique serveur pure et testable** : garder le calcul dans `lib/*.mjs`
  (fonctions pures) séparé des endpoints `api/*.js` (I/O). Tester la logique
  pure avec un petit script Node avant de déployer.
- **Robustesse d'abord** : les endpoints ne plantent jamais la page — en cas
  d'erreur ils renvoient un état de repli et le front garde les valeurs de
  secours.
- **Secrets** : uniquement dans les variables d'environnement Vercel, jamais
  dans le dépôt. Les clés sensibles restent côté serveur (`/api`, `/lib`).
- **CSS** : réutiliser les variables et classes de `src/styles/global.css` ;
  styles spécifiques dans le `<style>` scopé du composant Astro.
- **Déploiement** : développer sur une branche, ouvrir une PR vers `main`, la
  fusionner pour déclencher la production. ⚠️ Une variable d'environnement
  ajoutée/modifiée sur Vercel n'est prise en compte **qu'au déploiement
  suivant** (redéployer après tout changement de variable).

## Commandes

```bash
npm install        # dépendances
npm run dev        # serveur de dev (localhost:4321)
npm run build      # build de production → dist/
npm run preview    # prévisualiser le build statique
```
