# Refonte de lagamberge.com — à lire par Claude Code

Le dossier `design-system/` contient le système de design de la refonte. Applique-le au site existant.

## Sources de vérité
- `design-system/CHARTE.md` : principes, couleurs, typographie, structure en chapitres, ton. **Lis-la en entier avant de toucher au code.**
- `design-system/tokens.css` : toutes les variables CSS (couleurs, espacements, rayons, ombres, flous, polices) + classes de texte. Les valeurs ne se recopient jamais en dur : on utilise `var(--…)`.
- `design-system/composants.css` : les classes `lg-*` (fond fluide, verre, boutons, étiquettes, navigation, chiffres, photos).
- `design-system/composants/*.md` + `*.exemple.html` : règles et exemple HTML de chaque composant.
- `design-system/page-exemple.html` : ouvre-la dans un navigateur pour voir le rendu attendu.

## Ce que tu dois faire
1. Inspecte le site existant (framework, pages, styles) et résume-moi ce que tu as trouvé avant de modifier quoi que ce soit.
2. Intègre `tokens.css` et `composants.css` globalement, adaptés à la techno du site (fichiers CSS globaux, ou variables Tailwind si le site utilise Tailwind — dans ce cas mappe les tokens dans la config plutôt que de dupliquer les valeurs).
3. Remplace l'ancien style : couleurs, polices, boutons, cartes, navigation, par les composants du système.
4. Règle principale : **jamais de bande de couleur pleine largeur à bord net**. Chaque section est un `lg-ambient`, en alternant `lg-ambient--flip`, et le contenu est posé dans du verre (`lg-glass`). Aucun fond sombre.
5. Structure la page d'accueil en chapitres (voir CHARTE.md > Structure du site). Là où le texte manque, mets un emplacement clairement marqué `[TEXTE À ÉCRIRE PAR ALEX]` : n'invente aucun texte personnel, aucun chiffre.
6. Regroupe tous les chiffres qui changent (abonnés, vues, date « Chiffres au … ») dans **un seul fichier de données** facile à modifier.
7. Vérifie : mobile (375 px), contraste, `prefers-reduced-motion`, navigateur sans `backdrop-filter`.
8. Montre-moi le résultat en local avant tout déploiement. Ne déploie rien sans mon accord.
