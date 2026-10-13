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
    // Contexte affiché sur l'accueil ; les études (IÉSEG) sont sur /histoire.
    contexte: ['Étudiant-entrepreneur'],
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
// Données vérifiées sur les diplômes et captures de résultats (relevé du
// 13 octobre 2026), sauf mention « communiqué(e) par Alex ».
// - `resultat` : valeur affichée sur la tuile (temps réel, ou classement si
//   aucun temps n'est documenté). Le temps RÉEL est la référence ; le temps
//   officiel est affiché à part quand il existe.
// - `accueil` : un des trois chronos de l'accueil (ancre /performances#id).
// - `recompense` : uniquement une récompense réellement obtenue ; null sinon.
// - Aucune donnée sur d'autres participants n'est recopiée.
export const performances = [
  {
    id: 'marathon', accueil: true, forte: true, type: 'route', photo: 'performance',
    course: 'Marathon de Paris 2026', epreuve: 'Marathon de Paris 2026', court: 'Marathon', distance: 'Marathon',
    date: '12 avril 2026', resultat: '2 h 38 min 21 s', tempsReel: '2 h 38 min 21 s', tempsOfficiel: null,
    classements: [
      { libelle: 'Classement général (temps réel)', valeur: '234e / 57 516' },
      { libelle: 'Classement hommes', valeur: '223e / 39 253' },
      { libelle: 'Catégorie SH', valeur: '145e / 15 233' },
    ],
    details: [], recompense: null,
  },
  {
    id: '10-km', accueil: true, type: 'route',
    course: 'Les Foulées de Vincennes', epreuve: '10 km · Les Foulées de Vincennes', court: '10 km', distance: '10 km',
    date: '8 février 2026', resultat: '33 min 01 s', tempsReel: '33 min 01 s', tempsOfficiel: '33 min 09 s',
    classements: [
      { libelle: 'Classement général', valeur: '71e / 2 975' },
      { libelle: 'Catégorie SEM', valeur: '57e / 1 214' },
    ],
    details: [], recompense: null,
  },
  {
    id: '5-km', accueil: true, type: 'route',
    course: 'Les Foulées du 12ème', epreuve: '5 km · Les Foulées du 12ème', court: '5 km', distance: '5 km',
    date: '14 juin 2026', resultat: '15 min 59 s', tempsReel: '15 min 59 s', tempsOfficiel: '16 min 00 s',
    classements: [
      { libelle: 'Classement général', valeur: '9e / 315' },
      { libelle: 'Catégorie SEM', valeur: '7e / 69' },
    ],
    details: ['Club : AC Vélizy-Villacoublay'], recompense: null,
  },
  {
    id: 'semi', type: 'route',
    course: 'Semi-marathon de Saint-Gilles', epreuve: 'Semi-marathon de Saint-Gilles', court: 'Semi-marathon', distance: 'Semi-marathon',
    date: '28 février 2026', dateCommuniquee: true, resultat: '1 h 16 min 04 s', tempsReel: '1 h 16 min 04 s', tempsOfficiel: null,
    classements: [
      { libelle: 'Classement général', valeur: '10e / 1 154' },
      { libelle: 'Classement hommes', valeur: '10e / 827' },
      { libelle: 'Classement catégorie', valeur: '5e / 249' },
    ],
    details: [], recompense: null,
  },
  {
    id: 'marathon-2025', type: 'route',
    course: 'Marathon de Paris 2025', epreuve: 'Marathon de Paris 2025', court: 'Marathon', distance: 'Marathon',
    date: '13 avril 2025', resultat: '2 h 59 min 37 s', tempsReel: '2 h 59 min 37 s', tempsOfficiel: null,
    classements: [
      { libelle: 'Classement général (temps réel)', valeur: '1 944e / 54 934' },
      { libelle: 'Classement hommes', valeur: '1 901e / 38 589' },
      { libelle: 'Catégorie SEH', valeur: '1 011e / 15 599' },
    ],
    details: ['Premier marathon'], recompense: null,
  },
  {
    // « 50K » est le nom du format, pas une distance exacte.
    id: 'nice-utmb', type: 'trail',
    course: 'Nice Côte d’Azur by UTMB — Levens–Nice', epreuve: 'Nice Côte d’Azur by UTMB, format 50K', court: 'Trail', distance: null,
    date: '25 septembre 2026', resultat: '4 h 02 min 39 s', tempsReel: null, tempsCourse: '4 h 02 min 39 s', tempsOfficiel: null,
    classements: [
      { libelle: 'Rang général', valeur: '26e / 666' },
      { libelle: 'Rang hommes', valeur: '26e / 546' },
    ],
    details: ['Distance affichée dans le résultat : 39 km', 'Dénivelé positif affiché : 1 388 m', 'Score de course UTMB : 637', '« 50K » désigne le format, pas la distance exacte'],
    recompense: null,
    classement: '26e', temps: '4 h 02', libelle: 'Nice Côte d’Azur by UTMB · format 50K', libelleCourt: 'Nice by UTMB, format 50K',
  },
  {
    // Justificatif non identifié : seules les informations communiquées sont affichées.
    id: 'viroflay', type: 'trail',
    course: 'Trail de Viroflay', epreuve: 'Trail de Viroflay', court: 'Trail', distance: null,
    date: '30 août 2026', dateCommuniquee: true, resultat: '2e', tempsReel: null, tempsOfficiel: null,
    classements: [{ libelle: 'Classement', valeur: '2e' }],
    details: [], recompense: null, justificatif: null, // À FOURNIR
  },
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
  // Suivi automatique : /api/streak (fonction Vercel, identifiants Strava
  // côté serveur uniquement). Règle de validation : au moins UNE course à
  // pied de 5 km ou plus dans la journée (heure de Paris) ; plusieurs sorties
  // le même jour ne comptent qu'une fois, et ne s'additionnent pas.
  api: '/api/streak',
  regle: 'Un jour est validé quand au moins une course à pied de 5 km ou plus y est enregistrée sur Strava (heure de Paris). Plusieurs sorties le même jour comptent pour un seul jour, et deux sorties plus courtes ne s’additionnent pas.',
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
    // Interactions = likes + commentaires + partages (les enregistrements ne
    // sont pas relevés sur TikTok, contrairement à Instagram).
    interactions: 454877 + 1501 + 8572, // 464 950
    publicationsPlus10k: 32, // vidéos publiques 2026 (fichier TikTok Studio du 12/10/2026)
    engagement: 'environ 9 %',
    engagementCourt: '≈ 9 %',
    engagementDefinition: '(likes + commentaires + partages) / vues',
    // Médiane des vues par vidéo : calculée sur les 106 vidéos publiques
    // publiées en 2026 (fichier fourni par Alex, recalculé : 5 117).
    medianeVues: 5117,
    medianeVuesAffichage: '≈ 5 100',
    medianePerimetre: '106 vidéos publiques publiées du 1er janvier au 6 octobre 2026 (2 vidéos privées exclues)',
    medianeReleve: '12 octobre 2026',
    quartilesVues: [2346, 11750], // 25 % et 75 % des vidéos
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
  note: 'Abonnements et vues additionnés sur les deux plateformes, pas des personnes uniques.',
  periodes: 'Vues depuis le 1er janvier 2026. Instagram au 12 octobre ; TikTok au 10 octobre.',
  // Prochain rafraîchissement global envisagé au passage des 20 000 abonnements cumulés.
};
// Vues médianes des stories TikTok (30 derniers jours) : À FOURNIR, avec la
// période du relevé. null = « Non renseigné ».
stats.tiktok.vuesMedianesStory = null;
stats.tiktok.vuesMedianesStoryPeriode = null;
stats.instagram.engagementLegende = 'Engagement rapporté à la couverture';
stats.tiktok.engagementLegende = 'Engagement rapporté aux vues';
stats.tiktok.engagementDetail = '(Likes + commentaires + partages) / vues. Vidéos de 2026, du 1er janvier au 10 octobre.';
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
    // Âge des ABONNÉS TikTok (capture fournie par Alex le 13 octobre 2026,
    // rattachée au relevé TikTok ci-dessus).
    ages: [
      { libelle: '18–24', valeur: 42.8 },
      { libelle: '25–34', valeur: 42.3 },
      { libelle: '35–44', valeur: 8.3 },
      { libelle: '45–54', valeur: 5.7 },
      { libelle: '55+', valeur: 0.9 },
    ],
    repereAge: '85,1 % des abonnés TikTok ont entre 18 et 34 ans.',
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

// -- Vidéos mises en avant (page /statistiques) ------------------------------
// Trois formats typiques, choisis par Alex. Vues communiquées par Alex le
// 13 octobre 2026. `miniature` : couverture réelle fournie par Alex
// (src/assets/videos/) ; sans elle, une couverture neutre s'affiche.
// La vidéo n'est chargée (lecteur officiel Instagram) qu'au clic.
export const videosAvant = [
  {
    id: 'depart-10k',
    format: 'Formats courts',
    titre: 'Départ du 10 km adidas, déguisé en vert dans le sas élite',
    resume: 'Des formats courts et spontanés, pensés pour amuser et capter rapidement l’attention.',
    plateforme: 'Instagram',
    url: 'https://www.instagram.com/p/DZaWXEPI757/',
    vues: 2958127,
    releve: '13 octobre 2026',
    miniature: 'depart-10k.webp',
  },
  {
    id: 'grosse-echeance',
    format: 'Récits d’objectifs',
    titre: 'Le récit de mon Marathon de Paris',
    resume: 'Des récits plus longs qui clôturent plusieurs mois de préparation et une série de contenus autour d’un objectif sportif.',
    plateforme: 'Instagram',
    url: 'https://www.instagram.com/reel/DXXAo85iP85/',
    vues: 52838,
    releve: '13 octobre 2026',
    miniature: 'marathon-paris.webp',
  },
  {
    id: 'sketch',
    format: 'Vidéos indépendantes',
    titre: 'Un sketch d’humour tourné sur une course',
    resume: 'Une idée, une expérience, une vidéo : des contenus autonomes, sans série à suivre avant ou après.',
    plateforme: 'Instagram',
    url: 'https://www.instagram.com/reel/DT-6y1HiCuf/',
    vues: 532531,
    releve: '13 octobre 2026',
    miniature: 'sketch.webp',
  },
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
    // Cadrage descendu pour garder les têtes ET les pieds de la rangée avant.
    position: '50% 93%',
    positionMobile: '50% 93%',
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
    sujet: 'Prochaine étape de ma découverte du trail.',
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
    logo: 'saintelyon.jpeg', // fourni par Alex (src/assets/logos/)
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
    logo: 'marathon-paris.jpg', // fourni par Alex (src/assets/logos/)
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
  // Ordre d'affichage validé ; mêmes tailles de titres pour les trois offres.
  {
    titre: 'Création de contenu rémunérée',
    texte: 'Vidéos, photos et stories pour mes réseaux ou vos propres supports.',
    precision: 'Formats, calendrier, rémunération et droits d’utilisation définis ensemble.',
  },
  {
    titre: 'Accompagnement dans la durée',
    texte: 'Un partenariat autour de plusieurs courses, contenus ou initiatives communautaires.',
    precision: 'Accompagnement matériel et/ou rémunération, avec des engagements adaptés au projet.',
  },
  {
    titre: 'Dotation de produits',
    texte: 'Des produits adaptés à ma pratique, sans contenu dédié obligatoire.',
    precision: 'Une utilisation possible dans mes entraînements et vidéos, sans exposition garantie.',

  },
];

export const affiliation =
  'Une affiliation rémunérée peut compléter la collaboration, avec des commissions et des conditions définies ensemble.';

// Références « Collaborations et produits reçus » (liste indiquée par Alex le
// 13 octobre 2026). Nature des relations non détaillée : aucune légende par
// marque tant que `nature` vaut null. `logo` : fichier officiel fourni par
// Alex (src/assets/logos/, ajoutés le 13 octobre 2026) ; l'orthographe suit
// le logo (Joyfuel, Vaï Vaï Coco).
export const references = [
  { nom: 'DJI', nature: null, publier: true, logo: 'DJI.png' },
  { nom: 'Shokz', nature: null, publier: true, logo: 'shokz.png' },
  { nom: 'Joyfuel', nature: null, publier: true, logo: 'joyfule.png' },
  { nom: 'Vaï Vaï Coco', nature: null, publier: true, logo: 'vaivai-coco.png' },
  // Hors liste d'Alex : non publiés.
  { nom: 'Brevo', nature: null, publier: false, logo: null },
  { nom: 'Nomio', nature: 'Envoi de produits', publier: false, logo: null },
];

// -- Utilitaire d'affichage ----------------------------------------------------
// Formate un nombre à la française (espaces fines insécables).
export const nombre = (n) => (typeof n === 'number' ? n.toLocaleString('fr-FR') : n);
