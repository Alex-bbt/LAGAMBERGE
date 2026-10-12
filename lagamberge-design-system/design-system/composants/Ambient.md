# Ambient
Le fond fluide de toute la page : une brume claire (`mist`) traversée de nappes floues de bleu poudre, pour que le bleu et le blanc se mélangent au lieu de se couper.

- Classe `lg-ambient` sur le conteneur de chaque chapitre ; `lg-ambient--flip` un chapitre sur deux, pour que la nappe passe de gauche à droite en défilant.
- Les nappes sont des dégradés radiaux `powder` → `powder-soft` → transparent, floutés à `blur-ambient`.
- Ne jamais poser une section à fond plein et bord net au milieu : la transition entre chapitres, c'est `space-24` de brume.
- Le consommateur fournit le contenu ; le fond se place derrière tout seul (`z-index: -1`).
