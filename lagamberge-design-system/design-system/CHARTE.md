# La Gamberge

Système de design de la refonte de **lagamberge.com** : le site d'Alex Bourbigot, coureur, créateur de contenu (Instagram @lagambergee, TikTok @lagambergeee) et organisateur de Back to Run. Le site raconte une histoire chapitre par chapitre, de la première foulée à la SaintéLyon, et sert de media kit aux marques et aux magasins.

> Une seule idée guide tout : **le bleu poudre et le blanc ne se coupent jamais, ils se mélangent.** Pas de bandes de couleur alternées, pas de rupture sèche entre deux sections. Le fond est une brume claire traversée de nappes de bleu poudre, et le contenu flotte dessus dans des surfaces de verre translucides.

## Principes

1. **Un récit, pas une plaquette.** Chaque page avance comme un chapitre : un surtitre (« Chapitre 3 »), un titre court qui raconte, un chapeau, puis la preuve (photo, chiffre). On lit une histoire avant de lire des statistiques.
2. **Le bleu se mêle au blanc.** Le bleu poudre n'est jamais un aplat de section bord à bord. Il vit dans le fond fluide (`Ambient`), en nappes floues qui glissent d'un chapitre à l'autre, et transparaît à travers le verre.
3. **Le verre porte le contenu.** Cartes, navigation et boutons secondaires sont des surfaces de verre (`glass-fill` + `blur-glass` + `glass-stroke`). Le bleu roi reste la seule couleur foncée : texte, actions, et une carte forte par section, pas plus.
4. **Clair, toujours.** Aucun fond sombre, aucune section noire. La profondeur vient des ombres teintées de bleu roi et du flou, pas de l'obscurité.
5. **Des chiffres vrais et datés.** Chaque chiffre a une légende et une source datée (style `caption`). On n'affiche que des données vérifiées ; les abonnés se donnent en paliers (« plus de 10 000 »).

## Couleurs

| Rôle | Token | Valeur | Usage |
|---|---|---|---|
| Encre et actions | `royal` | #162660 | Tout le texte, les titres, les chiffres, le bouton principal |
| Survol, focus | `royal-hover` | #2D44A0 | États actifs, anneau de focus |
| Texte secondaire | `royal-muted` | #4A5785 | Légendes, sources, dates |
| Signature | `powder` | #D0E6FD | Nappes du fond fluide, emplacements photo |
| Transition | `powder-soft` | #E6F1FE | Paliers du dégradé poudre → blanc |
| Fond de page | `mist` | #F6FAFF | Fond de base, blanc à peine teinté |
| Blanc | `white` | #FFFFFF | Texte sur bleu roi, reflets |
| Verre | `glass-fill`, `glass-fill-strong`, `glass-stroke` | blanc translucide | Cartes, navigation |
| Verre fort | `glass-royal` | bleu roi à 90 % | Une carte forte par section |

**Contrastes vérifiés** : `royal` sur `powder` 11:1 ; `royal-muted` sur `powder` 5,5:1 et sur `mist` 6,7:1 ; `white` sur `royal` 14:1 ; `powder` sur `glass-royal` 8,6:1. Tout passe le seuil de 4,5:1.

**Proportions visées** sur un écran : environ 55 % de brume et de blanc, 35 % de bleu poudre fondu, 10 % de bleu roi (texte compris).

## Comment le bleu et le blanc s'entremêlent

- **Une seule toile de fond pour toute la page.** Le conteneur `Ambient` porte deux nappes de `powder` floutées à `blur-ambient` (90 px), qui se fondent dans `mist` par `powder-soft`. On n'arrête jamais une nappe sur une ligne droite.
- **D'un chapitre à l'autre, la nappe change de côté** (`lg-ambient--flip`) : en haut à gauche, puis en haut à droite, puis à gauche. En défilant, le bleu ondule de part et d'autre au lieu de se découper en bandes.
- **Le verre laisse passer le bleu.** Une carte blanche à 55 % posée sur une nappe devient bleutée ; posée sur la brume, elle reste blanche. Le même composant change de teinte selon où il flotte : c'est ce qui crée le mélange.
- **Les photos se fondent aussi** : leur emplacement vide est un dégradé `powder` → `powder-soft` → `white`, et la photo arrive avec un coin `radius-lg` et le filet `glass-stroke`.
- **Interdits** : bande de couleur pleine largeur à bord net, fond bleu roi de section, dégradé bleu-violet, contour gris autour du verre.

## Typographie

Deux familles, chargées depuis Google Fonts : **Unbounded** (titres et chiffres, graisse 800) et **Manrope** (texte, 400 / 500 / 700).

| Style | Famille | Taille | Usage |
|---|---|---|---|
| `display-xl` | Unbounded 800 | 64 px | Titre d'ouverture, une fois par écran |
| `display-l` | Unbounded 800 | 48 px | Titre de section |
| `title` | Unbounded 800 | 28 px | Titre de carte |
| `number` | Unbounded 800 | 40 px | Chiffres et chronos |
| `wordmark` | Unbounded 800 | 20 px | « LA GAMBERGE » en capitales |
| `lead` | Manrope 500 | 19 px | Chapeau |
| `body` | Manrope 400 | 16 px | Texte courant |
| `label` | Manrope 700 | 13 px capitales | « CHAPITRE 3 » |
| `button` | Manrope 700 | 15 px | Boutons |
| `caption` | Manrope 500 | 13 px | Sources et dates |

Sur mobile, `display-xl` descend à 40 px et `display-l` à 32 px. Les titres restent courts : une phrase, sans point d'exclamation.

## Espacements, rayons, profondeur

- **Espacements** : pas de 4 px (`space-1` à `space-24`). Cartes : `space-6` de marge intérieure. Entre deux chapitres : `space-24`, sans séparateur, c'est le fond qui fait la transition.
- **Rayons** : tout est arrondi, rien n'est carré. `radius-md` pour les cartes, `radius-lg` pour les photos, `radius-xl` pour les grands panneaux, `radius-pill` pour les boutons, étiquettes et la navigation.
- **Profondeur** : `shadow-glass` (ombre douce teintée bleu roi + reflet blanc en haut), `shadow-glass-lift` au survol, `shadow-royal` pour la carte forte et le bouton principal. Pas d'ombre grise ni noire.
- **Flou** : `blur-glass` (24 px, saturation 160 %) derrière le verre. Si le navigateur ne gère pas le flou, le verre passe automatiquement à `glass-fill-strong`.

## Structure du site en chapitres

1. **Prologue** : qui je suis, en une phrase, photo en course, bouton « Travailler ensemble ».
2. **Chapitre 1, le coureur** : la progression et les chronos.
3. **Chapitre 2, le créateur** : Instagram (la régularité) et TikTok (la viralité), en chiffres annuels datés.
4. **Chapitre 3, la communauté** : Back to Run, la preuve chiffrée.
5. **Chapitre 4, ce qui arrive** : la SaintéLyon et la préparation avec le matériel de course.
6. **Épilogue** : ils m'ont fait confiance (noms des marques, sans chiffres) et « Écrivons le prochain chapitre » avec le contact.

## Ton des textes

Première personne, phrases courtes, concrètes, sans jargon marketing. On raconte ce qui s'est passé, on ne promet ni ventes, ni vues, ni résultats. Exemple : « J'ai lancé Back to Run. 2 019 personnes se sont inscrites. » plutôt que « Une communauté engagée à fort potentiel ».

## Iconographie et images

Pas encore de logo dessiné : le logotype est le texte « LA GAMBERGE » en `wordmark`. Les photos de course sont l'image principale du site ; pas d'icônes décoratives ni d'emojis. Si une icône est nécessaire (flèche, lien externe), trait de 2 px en `royal`.

## Mise à jour (10 minutes par mois)

Tous les chiffres qui bougent sont regroupés au même endroit dans le site. Chaque mois : mettre à jour les paliers d'abonnés, les vues annuelles et la date de la légende (« Chiffres au … »). Les couleurs, typographies et composants ne changent pas.
