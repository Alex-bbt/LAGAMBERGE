# TikTok : étude (rien n'est branché)

Statut au 30 octobre 2026 : étude seulement. Les valeurs TikTok du site restent
manuelles (relevé du 10/10/2026). La documentation developers.tiktok.com n'est
pas joignable depuis l'environnement de développement : les points marqués
« à vérifier » viennent de sources secondaires.

## Ce que l'API peut donner à un créateur (Login Kit + Display API)

| Scope | Données | Utilité |
|---|---|---|
| `user.info.basic` | identifiant, pseudo, avatar | identification |
| `user.info.stats` | `follower_count`, `likes_count`, `video_count` | abonnés (automatisable) |
| `video.list` | vidéos publiques : `view_count`, `like_count`, `comment_count`, `share_count`, `create_time` | vues 2026 = somme des vues des vidéos publiées en 2026 |

Point de vigilance : les « vues 2026 » manuelles (5 168 694) viennent de
TikTok Studio. La somme des vues des vidéos de 2026 n'est pas forcément la même
définition : à comparer avant tout affichage.

Pas d'audience (âge, genre, pays) dans la Display API : elle reste manuelle,
avec sa date. Abonnés et spectateurs restent deux populations distinctes.

## Jetons

- Jeton de renouvellement : 365 jours (exemple de réponse de la documentation
  officielle, `refresh_expires_in: 31536000`).
- Jeton d'accès : 24 heures (source secondaire, à vérifier).
- À faire côté serveur : renouveler chaque jour, stocker le jeton de
  renouvellement dans Supabase (il peut changer à chaque renouvellement,
  à vérifier), alerte avant les 365 jours.

## Validation de l'app

- Mode sandbox : intégration testable sans validation par TikTok, jusqu'à
  10 comptes cibles par sandbox (documentation officielle « Add a sandbox »).
  Hypothèse : suffisant pour le seul compte @lagambergeee, à confirmer.
- Validation complète (si le sandbox ne suffit pas en production) : vidéo de
  démonstration, URL des conditions d'utilisation et de la politique de
  confidentialité (à vérifier). `/confidentialite` existe ; il faudrait une
  page de conditions.
- URL de redirection : HTTPS, déclarée dans l'app. Prévue :
  `https://www.lagamberge.com/api/tiktok-callback` (reçoit le code une seule fois).

## Architecture prévue (identique à Instagram)

`lib/tiktok.mjs` (pur) + `api/tiktok-sync.js` (tâche planifiée) + tables
`tiktok_jeton`, `tiktok_snapshot`, `tiktok_historique` (RLS + GRANT explicite)
+ `src/data/releve-tiktok.js` (lecture au build, repli manuel) + même Deploy
Hook. Mettre à jour `/confidentialite` si un nouveau traitement apparaît.
