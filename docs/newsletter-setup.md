# Brancher la newsletter (base de données Supabase)

Le formulaire de newsletter enregistre les inscrits dans une base **Supabase**
(gratuit). Tant que ce n'est pas configuré, le formulaire affiche un message
« la newsletter se branche en ce moment ». Une fois les 2 variables ajoutées
sur Vercel, chaque inscription est stockée pour de vrai.

À faire **une seule fois** (~10 minutes).

---

## Étape 1 — Créer un projet Supabase

1. Va sur **https://supabase.com** → **Start your project** → connecte-toi
   (avec GitHub, c'est le plus simple).
2. **New project** :
   - **Name** : `la-gamberge`
   - **Database Password** : choisis-en un et **garde-le** (tu n'en auras pas
     besoin pour le site, mais c'est utile un jour).
   - **Region** : choisis l'Europe (ex. *Frankfurt* ou *Paris*).
3. Attends ~1 minute que le projet se crée.

---

## Étape 2 — Créer la table des inscrits

1. Dans le menu de gauche, ouvre **SQL Editor** → **New query**.
2. Colle ce code puis clique **Run** :

   ```sql
   create table if not exists subscribers (
     id uuid primary key default gen_random_uuid(),
     email text unique not null,
     prenom text,
     nom text,
     age int,
     source text,
     data jsonb default '{}'::jsonb,   -- fourre-tout pour des infos futures
     created_at timestamptz default now()
   );

   -- Sécurité : on active RLS. Le site écrit via une clé "service" (côté
   -- serveur) qui outrepasse RLS, donc personne d'autre ne peut lire/écrire.
   alter table subscribers enable row level security;
   ```

   La colonne **`data`** (de type JSON) est ta réserve pour l'avenir : tu
   pourras y stocker n'importe quelle information supplémentaire (préférences,
   objectifs, réponses à un questionnaire…) **sans avoir à modifier la table**.

---

## Étape 3 — Récupérer les 2 identifiants

Dans **Settings** (roue crantée) → **API** :

- **Project URL** → c'est la valeur de `SUPABASE_URL`
  (ressemble à `https://xxxxxxxx.supabase.co`)
- **Project API keys** → la clé **`service_role`** (clique *Reveal*) →
  c'est la valeur de `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ La clé `service_role` est **puissante et secrète**. Ne la mets nulle part
> d'autre que dans les variables Vercel. Le site ne l'utilise que côté serveur,
> elle n'est jamais visible dans le navigateur.

---

## Étape 4 — Ajouter les variables sur Vercel

Vercel → projet **lagamberge** → **Settings → Environment Variables**.
Ajoute ces 2 variables (au moment de saisir la valeur, coche bien
**Production + Preview** — comme pour Strava) :

| Nom | Valeur |
| --- | --- |
| `SUPABASE_URL` | l'URL du projet |
| `SUPABASE_SERVICE_ROLE_KEY` | la clé service_role |

Puis **redéploie** (Deployments → ligne du haut → ⋯ → Redeploy), ou pousse un
commit.

---

## C'est fini

Le formulaire enregistre désormais chaque inscription dans la table
`subscribers`. Tu peux voir les inscrits dans Supabase → **Table Editor** →
`subscribers`.

Règles déjà en place :
- email **unique** (une même adresse ne crée pas de doublon) ;
- prénom enregistré s'il est renseigné ;
- date d'inscription automatique.

### Et pour envoyer des emails plus tard ?

Supabase **stocke** les inscrits mais n'envoie pas d'emails. Le jour où tu veux
envoyer une vraie newsletter, on branchera un outil d'envoi (Brevo, Resend…)
qui lira cette liste. Dis-le moi à ce moment-là.
