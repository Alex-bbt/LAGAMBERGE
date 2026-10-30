# CLAUDE.md — La Gamberge (media kit)

Media kit web de **La Gamberge** (Alex Bourbigot), destiné aux marques.
Positionnement : « La performance, sans se prendre au sérieux. »
Objectif du site : obtenir un email de prise de contact qualifié.

## Stack
- **Astro 5**, sortie statique. Déploiement Vercel (push sur `main` = production).
- Pas de framework CSS : le design system de `lagamberge-design-system/design-system/`
  (tokens.css + composants.css, classes `lg-*`) est importé tel quel par
  `src/styles/site.css`. **Ne jamais modifier `lagamberge-design-system/`.**
- Aucune couleur, taille, ombre ou police en dur : uniquement `var(--…)` et `lg-*`
  (seule exception : `--bone: #F1E4D1`, défini dans site.css).
- Palette : Royal Blue #162660, Powder Blue #D0E6FD, Bone #F1E4D1.
- Accueil : fonds nets qui changent d'une section à l'autre —
  `.fond-clair`, `.fond-poudre`, `.fond-accent` (Bone), `.fond-blanc`, `.fond-roi`.
  Bone sert à une section et aux CTA (`.btn-accent`).
- Échelle : `.section--ample` = au moins 100svh sur grand écran (≥ 1081 × 720 px),
  hauteur naturelle sur mobile et en paysage bas ; jamais de contenu coupé,
  pas de scroll-snap. Apparitions `[data-apparition]` discrètes, désactivées
  avec prefers-reduced-motion (classe `apparitions` posée par Base.astro).

## Arborescence
```
src/data/mediakit.js   ⭐ TOUTES les données (identité, stats, audience, courses,
                       défi, vidéos, Back to Run, offres, contact). null = non affiché.
src/pages/index.astro  Six étapes : #profil (clair) → #statistiques (poudre, 2 chiffres
                       dominants + graphiques Instagram/TikTok) → #pourquoi (blanc, crédibilité
                       sportive + divertissement) → #back-to-run (Bone) → #objectifs (clair)
                       → #collaborer (bleu roi, 3 offres + #contact).
                       Nav : Profil, Audience, Projets, Collaborer. Pied : pages détaillées,
                       réseaux, note unique des dates de relevé.
src/pages/histoire.astro, communaute.astro, projets.astro, statistiques.astro
                       Pages d'approfondissement (les détails quittent l'accueil pour y vivre)
src/pages/performances.astro  Mur de cartes stables (aucune ne se déploie) + fenêtre <dialog>
                              de détails ; ancres #marathon, #10-km, #5-km : saut natif seul
                              (scroll-margin-top de la carte, :target), aucun script de défilement.
                              Section en overflow: clip (jamais hidden : .lg-ambient en hidden
                              devient un conteneur que le saut d'ancre fait défiler → haut masqué)
src/pages/mentions-legales.astro, confidentialite.astro
                       Données : `editeur` / `hebergeur` (mediakit.js). Champ null = non affiché ;
                       build de PRODUCTION en échec tant qu'un champ obligatoire manque
                       (src/data/legal.js). Jamais de valeur provisoire ni de TVA inexistante.
                       Éditeur = même entreprise que Back to Run (EI « Roue Libre »,
                       back-to-run/src/lib/legal-entity.ts) ; RCS non confirmé, donc non publié.
src/styles/polices.css Unbounded 500/800 + Manrope 400/500/700 hébergées (public/fonts/la-gamberge/,
                       licences OFL) ; l'@import Google de tokens.css est retiré au build par un
                       plugin PostCSS (astro.config.mjs). Aucune requête vers Google.
public/favicon.*       Monogramme « LG » (SVG, ICO, PNG 16/32, apple-touch-icon 180)
src/pages/defi-2026.astro     Suivi du défi, lit /api/streak (dernier bilan affiché tout de suite)
src/components/        EnTete, CarteChiffre, Barres, Colonnes, AudienceGraphiques (sélecteur
                       Instagram/TikTok), Frise (calendrier horizontal de /projets),
                       Reseaux (icônes SVG Simple Icons, CC0), DefiQuotidien, Progression,
                       CarteVideo, Calendrier, Contact, Photo, VideoInstagram (miniature + lecteur
                       chargé au clic ; `compact` = bloc Divertissement de l'accueil, videoDivertissement ;
                       `fichier` = vidéo hébergée dans public/videos/, lue sur place, si Instagram
                       refuse la lecture intégrée)
src/assets/photos/     Photos ORIGINALES (conservées) ; Astro génère les WebP optimisés au build.
                       Cadrage par photo (position / positionMobile) dans mediakit.js
ancien-site/           Ancien site et premier aperçu, conservés (ne pas supprimer)
api/streak.js, lib/    Fonction Strava (identifiants en variables Vercel, jamais côté client).
                       Cache persistant Supabase (lib/snapshot.mjs, projet lagamberge-db) :
                       dernier bilan servi immédiatement, Strava relancé en arrière-plan
                       (waitUntil, @vercel/functions) au-delà de 10 min. updatedAt = date réelle
                       de la dernière synchronisation. validatedDates = jours avec UNE course ≥ 5 km.
api/instagram-sync.js  Tâche quotidienne (vercel.json → crons, protégée par CRON_SECRET) : lit
lib/instagram*.mjs     l'API Instagram (connexion Instagram), enregistre un bilan dans lagamberge-db
                       (instagram_snapshot / instagram_historique ; jeton renouvelé chaque semaine
                       dans instagram_jeton). Maintient aussi l'activité de la base (pas de mise en
                       pause). Affichage : seuls les abonnés et les vues 2026 Instagram sont lus
                       au build (src/data/releve-instagram.js, repli sur les valeurs manuelles),
                       avec leur propre date ; le reste reste manuel. Voir docs/instagram-setup.md.
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

- Exception : /communaute (Back to Run) suit la DA de Back to Run (dépôt Alex-bbt/back-to-run) :
  styles `src/styles/back-to-run.css` rangés sous `.theme-btr` (tokens `--btr-*`),
  Figtree + Caprasimo (chiffres seulement) dans `public/fonts/back-to-run/`,
  poses de la mascotte dans `src/assets/back-to-run/`. Nav et pied restent La Gamberge.
- Accueil : statistiques (faits) et « Pourquoi moi ? » (arguments) toujours séparés.
  Totaux cumulés = non dédupliqués, avec leur note. Âge des abonnés TikTok et âge
  des spectateurs TikTok (365 jours) sont deux populations : ne jamais les mélanger.

- Pied de page : fond Powder et filet supérieur, distinct de toutes les sections.
  Liens : pages détaillées (dont /performances), Mentions légales, Confidentialité ;
  dates de relevé par type de données (abonnés/vues/audience, vidéos).
- Vidéos : rien de tiers avant action. Lecteur Instagram seulement après accord
  (« Lire ici » / « Non merci », mémorisé 6 mois, retrait sur /confidentialite#videos) ;
  `lecture: 'externe'` = miniature locale + lien. Aucun outil de mesure d'audience.
- Performances : temps réel = référence, temps officiel affiché à part ; aucune
  médaille ni podium inventé ; données issues des diplômes (voir mediakit.js).
- Tuiles : `.tuile-stat` = information, non cliquable (pas de lien, curseur normal) ;
  `.tuile-chrono` = lien avec libellé de destination. Ne pas mélanger les deux.

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
