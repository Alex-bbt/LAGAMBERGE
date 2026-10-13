/* ==========================================================================
   LA GAMBERGE — DONNÉES DU MEDIA KIT
   --------------------------------------------------------------------------
   C'est le SEUL fichier à modifier pour mettre le site à jour. Les pages et
   composants lisent tout ici : rien n'est écrit en dur ailleurs.

   Règles :
   - Une valeur à null n'est PAS affichée (le bloc correspondant disparaît
     proprement). Aucun chiffre n'est inventé ni calculé à partir de la date.
   - Chaque statistique a sa date de relevé : quand tu mets un chiffre à jour,
     mets aussi la date du relevé correspondant.
   - Les champs marqués « À FOURNIR » attendent une information d'Alex.

   Mise à jour mensuelle (10 minutes) :
     1. stats.instagram / stats.tiktok : nouveaux chiffres + date de relevé.
     2. defi.joursValides + defi.dateValidation : le nombre de jours VALIDÉS
        (vérifié sur Strava), jamais le numéro du jour de l'année.
     3. Une course est passée ? Remplis son « resultat » dans `courses` :
        elle quitte le calendrier et rejoint les performances toute seule.
   ========================================================================== */

// -- Identité -----------------------------------------------------------------
export const identite = {
  marque: 'LA GAMBERGE',
  positionnement: 'La performance, sans se prendre au sérieux.',
  description: 'Coureur, créateur de contenu et organisateur de défis sportifs.',
  promesse:
    'Je raconte ma progression avec de l’ambition, de l’autodérision et l’envie de faire courir les autres.',
  personne: {
    nom: 'Alex Bourbigot',
    age: 23,
    // Contexte affiché sur l'accueil (l'âge figure sur la page Histoire).
    contexte: ['IÉSEG', 'Étudiant-entrepreneur'],
  },
  // Photo principale (originaux dans src/assets/photos/, jamais modifiés).
  // position / positionMobile : zone gardée au recadrage (x% y%), visage inclus.
  // Accueil : affichée en entier (proportions d'origine 3:4) pour garder la
  // silhouette et les deux pieds.
  photo: {
    fichier: 'la-gamberge-accueil.jpg',
    alt: 'Alex franchit la ligne d’arrivée du Marathon de Paris, bras ouverts.',
  },
};

// -- Contact ------------------------------------------------------------------
export const contact = {
  // À FOURNIR : adresse email professionnelle. Tant qu'elle vaut null, aucun
  // bouton email n'est affiché : le contact passe par Instagram.
  email: 'contact@lagamberge.com',
  objetEmail: 'Partenariat La Gamberge',
};

// -- Comptes ------------------------------------------------------------------
// URL reprises de l'ancien site (src/data/site.js).
export const comptes = [
  { id: 'instagram', nom: 'Instagram', pseudo: '@lagambergee', url: 'https://instagram.com/lagambergee' },
  { id: 'tiktok', nom: 'TikTok', pseudo: '@lagambergeee', url: 'https://www.tiktok.com/@lagambergeee' },
  { id: 'youtube', nom: 'YouTube', pseudo: '@La_Gamberge', url: 'https://www.youtube.com/@La_Gamberge' },
  { id: 'strava', nom: 'Strava', pseudo: 'La Gamberge', url: 'https://strava.app.link/HoBElyFDt4b' },
];

// -- Performances -------------------------------------------------------------
// Références chiffrées affichées dans le bandeau « Le coureur ».
export const performances = [
  // `court` : libellé de la rangée route ; `type` : 'route' | 'trail'.
  { epreuve: 'Marathon de Paris 2026', court: 'Marathon', contexte: 'Paris 2026', resultat: '2 h 38 min 21 s', type: 'route', forte: true },
  { epreuve: '10 km', court: '10 km', resultat: '33 min 01 s', type: 'route' },
  { epreuve: '5 km', court: '5 km', resultat: '15 min 59 s', type: 'route' },
  // « 50K » est le nom du format, pas une distance exacte.
  { epreuve: 'Nice Côte d’Azur by UTMB, format 50K', resultat: '26e en 4 h 02', type: 'trail',
    classement: '26e', temps: '4 h 02', libelle: 'Nice Côte d’Azur by UTMB · format 50K', libelleCourt: 'Nice by UTMB, format 50K' },
];

// Progression marathon : `atteint: false` = objectif (affiché différemment).
export const progressionMarathon = [
  // `court` : valeur affichée dans la ligne de progression de l'accueil.
  { libelle: 'Premier marathon', valeur: '2 h 59', court: '2 h 59', atteint: true },
  { libelle: 'Paris 2026', valeur: '2 h 38 min 21 s', court: '2 h 38', atteint: true },
  { libelle: 'Paris 2027', valeur: 'moins de 2 h 30', court: 'moins de 2 h 30', atteint: false },
];

// Repères de l'histoire (page /histoire).
export const parcours = {
  debutCourse: 'février 2025',
  sportsAvant: ['football', 'tennis'],
  // À FOURNIR : les quatre objectifs initiaux et leur résultat exact.
  // Tant que la liste est vide, le bloc n'est pas publié.
  // Format : { objectif: '…', resultat: '…', statut: 'atteint' | 'manque' | 'en_cours' }
  objectifsInitiaux: [],
};

// -- Photos des sections -------------------------------------------------------
export const photos = {
  performance: {
    fichier: 'la-gamberge-performance.jpeg',
    // Proportions d'origine : visage, médaille et incrustations intacts ;
    // affichée dans une colonne étroite pour que le texte du site domine.
    alt: 'Alex après l’arrivée du Marathon de Paris 2026, médaille en main. Temps réel affiché : 02:38:21.',
  },
  divertissement: {
    fichier: 'la-gamberge-divertissement.jpeg',
    // Original 3:4 : affichée en 4:5 (rognage léger en bas), tête, mains et costume gardés.
    alt: 'Alex en combinaison intégrale verte, médaille de finisher autour du cou.',
    position: '50% 25%',
  },
  // Photo personnelle (course sur route) : illustre les projets, ce n'est PAS
  // une photo de trail ni de la SaintéLyon. Ne pas la légender comme telle.
  personnelle: {
    fichier: 'la-gamberge-trail.jpeg',
    // Original vertical (2:3) : recadrage léger en 4:5 vers le haut, qui garde
    // le visage, le geste de la main et les coureurs autour.
    alt: 'Alex en pleine course sur route, au milieu d’autres coureurs, la main au front.',
    position: '55% 20%',
    positionMobile: '55% 25%',
  },
};

// -- Défi quotidien -----------------------------------------------------------
export const defi = {
  intitule: 'Au moins 5 km chaque jour en 2026',
  titreCourt: '5 km minimum, chaque jour de 2026.',
  phrase: 'Une pratique régulière pour partager des retours d’expérience concrets.',
  minKm: 5,
  annee: 2026,
  totalJours: 365,
  // À FOURNIR : nombre de jours VALIDÉS (course ≥ 5 km) et date de vérification.
  // Ne JAMAIS y mettre le numéro du jour de l'année : ce n'est pas une preuve.
  joursValides: null, // ex. 285
  dateValidation: null, // ex. '12 octobre 2026'
  source: 'Strava',
};

// -- Statistiques des comptes -------------------------------------------------
export const stats = {
  instagram: {
    releve: '12 octobre 2026',
    periode: 'du 1er janvier au 12 octobre 2026',
    abonnes: 10234,
    abonnesAffichage: '10 000+',
    vues: 12325117,
    vuesAffichage: '12,3 M',
    vuesMedianesPublication: 16300, // environ, publications retenues en 2026
    publicationsPlus10k: 73,
    publicationsPlus100k: 13,
    vuesMedianesStory: 2500, // environ, 30 derniers jours
    interactions: 536333,
    engagement: '6,3 %',
    engagementDefinition: '(likes + commentaires + partages + enregistrements) / couverture',
  },
  tiktok: {
    releve: '10 octobre 2026',
    periode: 'du 1er janvier au 10 octobre 2026',
    abonnes: 9254,
    abonnesAffichage: '9 000+',
    vues: 5168694,
    vuesAffichage: '5,17 M',
    videosPlus100k: 6,
    likes: 454877,
    partages: 8572,
    commentaires: 1501,
    engagement: 'environ 9 %',
    engagementDefinition: '(likes + commentaires + partages) / vues',
  },
};

// Totaux cumulés Instagram + TikTok (accueil). Calculés à partir des relevés
// ci-dessus : ce ne sont PAS des audiences dédupliquées, et les vues ne sont
// pas des personnes uniques.
stats.cumul = {
  abonnes: stats.instagram.abonnes + stats.tiktok.abonnes, // 19 488
  abonnesLegende: 'Abonnements cumulés sur Instagram et TikTok',
  vues: stats.instagram.vues + stats.tiktok.vues, // 17 493 811
  vuesAffichage: '17,5 M',
  vuesLegende: 'Vues cumulées sur Instagram et TikTok en 2026',
  note: 'Totaux non dédupliqués. Instagram au 12 octobre 2026 ; TikTok au 10 octobre 2026. Vues depuis le 1er janvier.',
};
stats.instagram.engagementLegende = 'Engagement Instagram rapporté à la couverture';
stats.instagram.engagementDetail =
  '(Likes + commentaires + partages + enregistrements) / couverture. Publications retenues de 2026, relevé du 12 octobre.';

// -- Audience -----------------------------------------------------------------
// Pourcentages des plateformes, sans redistribution des catégories manquantes.
export const audience = {
  instagram: {
    population: 'Abonnés Instagram',
    releve: '12 octobre 2026',
    genre: [
      { libelle: 'Hommes', valeur: 85.5 },
      { libelle: 'Femmes', valeur: 14.5 },
    ],
    pays: [
      { libelle: 'France', valeur: 78.2 },
      { libelle: 'Belgique', valeur: 3.6 },
      { libelle: 'Suisse', valeur: 1.7 },
    ],
    villeRepere: { libelle: 'Paris', valeur: 7.4 },
    ages: [
      { libelle: '18–24', valeur: 35 },
      { libelle: '25–34', valeur: 47.5 },
      { libelle: '35–44', valeur: 12 },
      { libelle: '45–54', valeur: 4.1 },
      { libelle: '55+', valeur: 1.4 },
    ],
    repereAge: '82,5 % des abonnés Instagram ont entre 18 et 34 ans.',
  },
  tiktok: {
    population: 'Abonnés TikTok',
    releve: '10 octobre 2026',
    genre: [
      { libelle: 'Hommes', valeur: 57 },
      { libelle: 'Femmes', valeur: 43 },
    ],
    pays: [
      { libelle: 'France', valeur: 74.6 },
      { libelle: 'Belgique', valeur: 4.5 },
      { libelle: 'Canada', valeur: 2.5 },
      { libelle: 'Suisse', valeur: 1.2 },
    ],
  },
  // Population différente des abonnés : ne jamais mélanger.
  tiktokSpectateurs: {
    population: 'Spectateurs TikTok, 365 derniers jours',
    releve: '10 octobre 2026',
    ages: [
      { libelle: '18–24', valeur: 44.8 },
      { libelle: '25–34', valeur: 41.5 },
    ],
    genre: [
      { libelle: 'Hommes', valeur: 60 },
      { libelle: 'Femmes', valeur: 38 },
    ],
    pays: [{ libelle: 'France', valeur: 84.7 }],
  },
};

// -- Vidéos -------------------------------------------------------------------
// `url` et `miniature` restent à null tant que le lien exact n'est pas fourni :
// la carte s'affiche alors sans faux lecteur.
// `section` : 'coureur' | 'createur' | 'backtorun'. `principale` : la vidéo
// mise en avant dans sa section (une seule par section).
export const videos = [
  {
    titre: 'Départ du 10 km Paris',
    plateforme: 'TikTok',
    publication: '10 juin 2026',
    vues: 1919533,
    vuesAffichage: '1,92 M',
    releve: '10 octobre 2026',
    url: null, // À FOURNIR
    miniature: null,
    section: 'createur',
    principale: true,
  },
  {
    titre: '« Tout allait bien… » (les fléchettes)',
    plateforme: 'TikTok',
    publication: '5 octobre 2026',
    vues: 334866,
    releve: '10 octobre 2026',
    url: null,
    miniature: null,
    section: 'createur',
  },
  {
    titre: '« On m’appelle l’ovni »',
    plateforme: 'TikTok',
    publication: '8 mars 2026',
    vues: 602278,
    releve: '10 octobre 2026',
    url: null,
    miniature: null,
    section: 'createur',
  },
  // À FOURNIR : la vidéo performance (section 'coureur') et la vidéo
  // d'annonce Back to Run (section 'backtorun', vues cumulées à réconcilier,
  // en précisant les plateformes additionnées).
];

// -- Back to Run --------------------------------------------------------------
export const backToRun = {
  url: 'https://backtorun.fr',
  titre: 'Ils sont venus voir. Puis ils se sont mis à courir.',
  texte:
    'J’ai créé Back to Run autour d’un défi simple : courir au moins 5 km par jour pendant 30 jours. Une aventure collective, avec ses encouragements, ses rebondissements et un Tribunal pour défendre ses écarts.',
  texteAccueil:
    'Avec Back to Run, j’ai proposé à ma communauté de courir au moins 5 km par jour pendant 30 jours. Un défi collectif, avec des encouragements et un Tribunal pour défendre ses écarts.',
  prochaine: 'Deuxième édition : septembre 2027.',
  edition: 'Première édition, septembre 2026',
  principaux: [
    { valeur: 2019, legende: 'inscrits', forte: true },
    { valeur: 1293, legende: 'participants', definition: 'ont enregistré au moins une course', libelleCourt: 'participants ayant enregistré une course' },
    { valeur: 99657, legende: 'km enregistrés' },
    { valeur: 268, legende: 'finishers des 30 jours', libelleCourt: 'finishers' },
  ],
  secondaires: [
    { valeur: '64 %', legende: 'des inscrits ont enregistré au moins une course' },
    { valeur: 14377, legende: 'courses enregistrées' },
    { valeur: 37219, legende: 'votes au Tribunal' },
    { valeur: 434, legende: 'personnes actives par jour sur le site, en moyenne', definition: 'au moins une action sur le site, pas forcément une course' },
  ],
  suite: 'Deuxième édition\u00a0: septembre 2027.',
  produits: 'Des produits pour la communauté sont en développement.',
  photo: {
    fichier: 'back-to-run-communaute.jpeg',
    // Original vertical (3:4) : format 4:3 sur toute la largeur, pour garder
    // les personnes aux deux extrémités ; on retire surtout du ciel.
    alt: 'Des membres de la communauté Back to Run réunis à Paris, sourire aux lèvres.',
    position: '50% 78%',
    positionMobile: '50% 78%',
  },
  // À FOURNIR : capture du défi, logo / mascotte.
};

// -- Courses (calendrier + résultats) ----------------------------------------
// Calendrier communiqué par Alex, recoupé le 12 octobre 2026 avec les annonces
// publiques. `resultat` rempli = course terminée (elle quitte le calendrier et
// s'ajoute aux performances). `statut` : 'prevu' | 'eventuel'.
export const courses = [
  {
    id: 'ecotrail',
    nom: 'EcoTrail Paris Automne, 50 km',
    nomCourt: 'EcoTrail Paris Automne',
    date: '17 octobre 2026',
    type: 'Trail',
    statut: 'prevu',
    sujet: 'Premier rendez-vous trail de l’automne.',
    accueil: true,
    resultat: null,
  },
  {
    id: '10k-paris-centre',
    nom: '10 km Paris Centre',
    date: '15 novembre 2026',
    type: 'Route',
    statut: 'prevu',
    sujet: 'Retour sur route, sur le format court.',
    accueil: true,
    resultat: null,
  },
  {
    id: 'saintelyon',
    nom: 'SaintéLyon',
    // À FOURNIR : format inscrit (80 ou 100 km ?). Non affiché tant qu'il manque.
    format: null,
    date: '28 et 29 novembre 2026',
    type: 'Trail de nuit',
    statut: 'prevu',
    principal: true,
    sujet: 'Le grand objectif trail de fin 2026, de nuit, entre Saint-Étienne et Lyon.',
    accroche: 'Grand objectif trail de fin 2026',
    dateCourte: 'Novembre 2026',
    accrocheAccueil: 'Grand objectif trail · Projet de récit YouTube',
    reserve: 'Format (distance) à confirmer.',
    accueil: true,
    projet: 'Projet de récit YouTube',
    resultat: null,
  },
  {
    id: 'france-5km',
    nom: 'Championnats de France de 5 km',
    nomCourt: 'France de 5 km',
    date: '19 décembre 2026',
    type: 'Route',
    statut: 'eventuel',
    sujet: 'Participation éventuelle, sans objectif chronométrique : la SaintéLyon passe avant.',
    reserve: 'Participation non confirmée.',
    accueil: true,
    resultat: null,
  },
  {
    id: 'paris-2027',
    nom: 'Marathon de Paris 2027',
    // Date officielle non recoupée (4 ou 11 avril selon les sources).
    date: 'Printemps 2027',
    type: 'Route',
    statut: 'prevu',
    principal: true,
    sujet: 'Objectif annoncé : moins de 2 h 30.',
    accroche: 'Objectif : moins de 2 h 30',
    accrocheAccueil: 'Objectif : moins de 2 h 30',
    reserve: 'Date exacte à confirmer (début avril selon les sources).',
    accueil: true,
    resultat: null,
  },
  {
    id: 'btr-2',
    nom: 'Back to Run, édition 2',
    date: 'Septembre 2027',
    type: 'Communauté',
    statut: 'prevu',
    sujet: 'Deuxième édition du défi collectif.',
    reserve: 'Dates précises à annoncer.',
    resultat: null,
  },
];

// -- Collaborations -----------------------------------------------------------
export const offres = [
  {
    titre: 'Dotation de produits',
    texte: 'Vous m’équipez avec des produits adaptés à ma pratique, sans publication ni mention dédiée obligatoire.',
    precision: 'Leur utilisation peut les rendre visibles dans mes entraînements ou contenus, sans exposition garantie.',
  },
  {
    titre: 'Création de contenu rémunérée',
    texte: 'Vidéos, photos et stories pour mon audience ou vos propres supports.',
    precision: 'Formats, calendrier, rémunération et droits d’utilisation définis ensemble.',
  },
  {
    titre: 'Accompagnement dans la durée',
    texte: 'Un partenariat construit autour de plusieurs courses, contenus ou initiatives communautaires.',
    precision: 'Accompagnement matériel, rémunération et engagements adaptés au projet.',
  },
];

export const affiliation =
  'Une affiliation rémunérée peut compléter la collaboration, avec des commissions et des conditions définies ensemble.';

// Références : publiées uniquement quand `publier: true` ET `nature` précisée.
export const references = [
  { nom: 'Shokz', nature: null, publier: false }, // À FOURNIR : nature exacte
  { nom: 'DJI', nature: null, publier: false },
  { nom: 'Brevo', nature: null, publier: false },
  // Envoi de produits reçu : pas une campagne rémunérée ni un partenariat officiel.
  { nom: 'Nomio', nature: 'Envoi de produits', publier: false },
];

// -- Utilitaire d'affichage ----------------------------------------------------
// Formate un nombre à la française (espaces fines insécables).
export const nombre = (n) => (typeof n === 'number' ? n.toLocaleString('fr-FR') : n);
