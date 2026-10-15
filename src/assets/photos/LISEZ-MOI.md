# Photos du site

Ce dossier contient les **originaux**, jamais modifiés ni mis en ligne tels quels.
Au build, Astro génère des versions WebP redimensionnées (480 à 1 600 px de large,
sans métadonnées, GPS compris) : ce sont les seules envoyées aux visiteurs.

| Fichier | Section | Remarque |
|---|---|---|
| la-gamberge-accueil.jpg | Haut de page | Arrivée du Marathon de Paris |
| la-gamberge-performance.jpeg | Le coureur | Affichée en proportions d'origine (encarts du temps intacts) |
| la-gamberge-divertissement.jpeg | Le créateur | |
| back-to-run-communaute.jpeg | Back to Run | |
| la-gamberge-trail.jpeg | Les projets | Photo personnelle sur route : ne pas la légender comme du trail ni comme la SaintéLyon |

## Changer une photo
1. Dépose le fichier ici (nom simple, sans espace ni accent).
2. Dans `src/data/mediakit.js`, écris son nom dans `fichier`, décris l'image dans `alt`.
3. Cadrage : `position` (ordinateur) et `positionMobile` (mobile), en « x% y% ».
   Exemple : '50% 30%' garde le centre horizontal et le haut de l'image (visage).
