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
  les deux briques dynamiques : `api/streak.js` et `api/subscribe.js`. Elles
  cohabitent avec le build Astro sans adaptateur.
- **Google Fonts** : Bricolage Grotesque (titres) + Inter (texte).
- Pas de framework CSS : un design system maison dans `src/styles/global.css`
  (variables, `.card`, `.btn`, etc.).
- Déploiement : push sur `main` → build de production automatique sur Vercel.

## Arborescence

```
api/
  streak.js          Endpoint GET /api/streak (streak + stats Strava en direct)
  subscribe.js       Endpoint POST /api/subscribe (inscription newsletter → Supabase)
lib/
  strava.mjs         Logique Strava PURE + testable (importée par api/streak.js)
  snapshot.mjs       Cache "dernière valeur connue" du streak (table Supabase)
src/
  data/site.js       ⭐ SOURCE DE VÉRITÉ ÉDITABLE (voir plus bas)
  styles/global.css  Design system (couleurs, typo, composants)
  layouts/Base.astro Squelette HTML (head, métas, header/footer)
  components/*.astro  Header, Footer, StreakCounter, SeasonStats, QualTracker,
                      ProjectCard, Socials, Newsletter
  pages/
    index.astro      Accueil (hero, défis, chiffres, actus, réseaux, newsletter)
    actus.astro      Projets par statut
    conseils/        Liste + page article ([...slug].astro)
  content/conseils/  Articles en Markdown (collection de contenu Astro)
  content.config.ts  Schéma de la collection "conseils"
docs/
  strava-setup.md      Guide de configuration Strava (pour le propriétaire)
  newsletter-setup.md  Guide de configuration Supabase (pour le propriétaire)
```

## Défi #1 — Streak Strava EN DIRECT, sans base de données

Le compteur « au moins 5 km chaque jour » est **recalculé à la volée** depuis
l'historique Strava. **Strava est la seule source de vérité** ; un léger cache
« dernière valeur connue » (Supabase) évite juste d'afficher un chiffre périmé
le temps de la sync.

- `lib/strava.mjs` : fonctions pures (`computeStreak`, `computeSeasonStats`,
  `dayOfYear`, helpers de date) + `getStreakFromStrava(env)` qui rafraîchit le
  token, récupère les activités et calcule tout.
- `api/streak.js` : appelle `getStreakFromStrava` et renvoie le JSON. **Ne met
  en cache QUE les réponses réussies** (`s-maxage` + `stale-while-revalidate`) ;
  les échecs sont en `no-store` pour ne jamais figer un fallback.
- `lib/snapshot.mjs` : **cache « dernière valeur connue »** dans la table
  Supabase `streak_snapshot` (une seule ligne). `api/streak.js` sert d'abord ce
  snapshot s'il est récent (< 10 min) → réponse instantanée, jamais un chiffre
  vieux de plusieurs jours ; sinon il recalcule depuis Strava **et persiste** le
  résultat. En cas d'échec Strava, il renvoie le dernier snapshot plutôt que
  rien. Réécrit à chaque sync réussie : ne fige jamais rien. Sans Supabase
  configuré, no-op silencieux → comportement d'avant (sync live directe).
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
