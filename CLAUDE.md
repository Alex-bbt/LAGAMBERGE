# CLAUDE.md — La Gamberge (media kit)

Media kit web de **La Gamberge** (Alex Bourbigot), destiné aux marques.
Positionnement : « La performance, sans se prendre au sérieux. »
Objectif du site : obtenir un email de prise de contact qualifié.

## Stack
- **Astro 5**, sortie statique. Déploiement Vercel (push sur `main` = production).
- Pas de framework CSS : le design system de `lagamberge-design-system/design-system/`
  (tokens.css + composants.css, classes `lg-*`) est importé tel quel par
  `src/styles/site.css`. **Ne jamais modifier `lagamberge-design-system/`.**
- Aucune couleur, taille, ombre ou police en dur : uniquement `var(--…)` et `lg-*`.
- Règle visuelle : chaque section est un `lg-ambient` (alterné avec
  `lg-ambient--flip`), le contenu repose sur du verre (`lg-glass`). Jamais de
  fond sombre ni de bande pleine largeur à bord net.

## Arborescence
```
src/data/mediakit.js   ⭐ TOUTES les données (identité, stats, audience, courses,
                       défi, vidéos, Back to Run, offres, contact). null = non affiché.
src/pages/index.astro  Six sections : #profil #coureur #createur (contenus + audience) #back-to-run
                       #objectifs #collaborer ; contact : #contact (nav et « Parlons partenariat »)
src/pages/histoire.astro, communaute.astro, projets.astro, statistiques.astro
                       Pages d'approfondissement (les détails quittent l'accueil pour y vivre)
src/components/        EnTete, CarteChiffre, Barres, Colonnes, DefiQuotidien, Progression,
                       CarteVideo, Calendrier, Contact, Photo
src/assets/photos/     Photos ORIGINALES (conservées) ; Astro génère les WebP optimisés au build.
                       Cadrage par photo (position / positionMobile) dans mediakit.js
ancien-site/           Ancien site et premier aperçu, conservés (ne pas supprimer)
api/streak.js, lib/    Fonction Strava de l'ancien site (non utilisée par les pages)
```

## Principe de mise en page (src/styles/site.css = système commun)
- Même conteneur, même en-tête de section (repère + h2 display-l + intro),
  mêmes espacements (--espace-section / --espace-bloc / --espace-interne).
- Un seul chiffre principal (.chiffre + title) et un seul secondaire
  (.chiffre-secondaire + lead). Panneau = regroupement ; encadré = aparté.
- Compositions sur une grille commune (.compo, média 5/12 – contenu 7/12).
- Photos : format choisi par photo ('naturel' quand le rognage coûte trop).
- Les valeurs exactes, définitions et populations secondaires vont dans les
  pages d'approfondissement (/statistiques, /communaute, /projets, /histoire).

## Règles éditoriales (non négociables)
- N'inventer aucun chiffre, lien, texte personnel, logo ou témoignage.
- Chaque statistique a sa période ou sa date de relevé.
- Ne jamais promettre vues, ventes, ROI ni résultat sportif.
- Défi quotidien : afficher uniquement un nombre de jours **validés** avec sa date ;
  jamais le jour de l'année.
- Résultats et objectifs toujours distingués visuellement.
- Références de marques publiées seulement si leur nature est confirmée.
- Tout en français, ton direct, chaleureux, sans jargon marketing.

## Commandes
```bash
npm install && npm run dev   # localhost:4321
npm run build                # contrôle principal (pas de lint configuré)
```
