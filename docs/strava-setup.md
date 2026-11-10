# Connecter Strava au streak (guide pas à pas)

Le site sait recalculer tout seul ta streak « au moins 5 km par jour » à partir
de ton historique Strava. Tant que ce n'est pas configuré, il affiche la valeur
manuelle de `src/data/site.js`. Une fois les 3 variables ci-dessous renseignées
sur Vercel, ça passe en **mode direct** : le chiffre se met à jour tout seul, et
un message d'échec apparaît si un jour se termine sans course validée.

Tu n'as à faire ça **qu'une seule fois** (~10 minutes).

---

## Étape 1 — Créer ton application Strava

1. Va sur **https://www.strava.com/settings/api**
2. Remplis le formulaire :
   - **Application Name** : `La Gamberge`
   - **Category** : peu importe (ex. *Visualizer*)
   - **Website** : `https://lagamberge.vercel.app`
   - **Authorization Callback Domain** : `localhost`
3. Valide. Tu obtiens :
   - un **Client ID** (un nombre)
   - un **Client Secret** (une longue chaîne)

Garde ces deux valeurs sous la main.

---

## Étape 2 — Autoriser l'accès à tes activités (une fois)

On récupère un **refresh token** : un jeton longue durée qui permet au site de
lire tes activités.

1. Colle cette URL dans ton navigateur en remplaçant `TON_CLIENT_ID` :

   ```
   https://www.strava.com/oauth/authorize?client_id=TON_CLIENT_ID&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read_all
   ```

2. Clique **Authorize**. Le navigateur va tenter d'ouvrir une page
   `http://localhost/exchange_token?...` qui **n'affiche rien** (normal).
   Regarde l'URL : copie la valeur de `code=` (entre `code=` et `&scope`).

3. Échange ce code contre les jetons. Dans un terminal (remplace les 3 valeurs) :

   ```bash
   curl -X POST https://www.strava.com/oauth/token \
     -d client_id=TON_CLIENT_ID \
     -d client_secret=TON_CLIENT_SECRET \
     -d code=LE_CODE_COPIE \
     -d grant_type=authorization_code
   ```

4. La réponse JSON contient un champ **`refresh_token`**. C'est celui-là qu'il
   te faut (pas l'`access_token`, qui lui expire vite).

---

## Étape 3 — Renseigner les variables sur Vercel

Dans **Vercel → ton projet → Settings → Environment Variables**, ajoute :

| Nom | Valeur |
| --- | --- |
| `STRAVA_CLIENT_ID` | ton Client ID |
| `STRAVA_CLIENT_SECRET` | ton Client Secret |
| `STRAVA_REFRESH_TOKEN` | le refresh token de l'étape 2 |

Optionnel (sinon valeurs par défaut) :

| Nom | Défaut | Rôle |
| --- | --- | --- |
| `STREAK_MIN_KM` | `5` | distance minimale d'une course valide |
| `STREAK_TZ` | `Europe/Paris` | fuseau pour définir « le jour » |
| `STREAK_START` | `2026-01-01` | début du défi |

Puis **redéploie** (Vercel → Deployments → Redeploy, ou pousse un commit).

---

## C'est tout

Le compteur du site passe en direct. Règles appliquées :

- une course **≥ 5 km** valide la journée ;
- **une seule fois par jour** (2 courses le même jour = +1, pas +2) ;
- seules les **courses à pied** comptent (les sorties vélo, natation… sont ignorées) ;
- si un jour se termine sans course valide → **message « défi perdu le … »**.

Le calcul se fait à la volée à chaque visite (avec un cache de 5 min), donc la
mise à jour apparaît quelques minutes après que ta course soit sur Strava.

---

## Dernière valeur connue (plus de chiffre périmé au chargement)

Pour éviter que la page affiche pendant quelques secondes une valeur de secours
vieille de plusieurs jours (le temps que Strava réponde), chaque calcul réussi
est **mémorisé** dans une petite table Supabase `streak_snapshot` (une seule
ligne). Au chargement suivant, `/api/streak` sert d'abord cette dernière valeur
validée — instantanément — puis la sync Strava confirme ou actualise.

C'est **automatique** dès que Supabase est branché (mêmes variables que la
newsletter : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). Rien à faire côté
Strava. Si Supabase n'est pas configuré, tout continue de marcher comme avant
(sync live directe, secours = `src/data/site.js`).

La table (déjà créée) :

```sql
create table if not exists streak_snapshot (
  id int primary key default 1,
  data jsonb not null,                     -- dernier résultat /api/streak
  updated_at timestamptz not null default now(),
  constraint streak_snapshot_singleton check (id = 1)
);
alter table streak_snapshot enable row level security;
```

Strava reste la source de vérité : ce snapshot n'est qu'un cache de secours,
réécrit à chaque sync réussie — il ne fige jamais rien.

> Astuce : `activity:read_all` permet de lire aussi tes activités privées. Si tu
> préfères ne partager que les publiques, remplace-le par `activity:read` à
> l'étape 2 — mais assure-toi alors que tes courses ne sont pas en privé.
