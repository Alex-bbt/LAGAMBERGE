/* ==========================================================================
   CANDIDATURES ADIDAS — « SHRINK IT » — FICHIER DE DONNÉES
   --------------------------------------------------------------------------
   Pages non répertoriées : /adidas-marketing, /adidas-brand-communications,
   /adidas-product-management (liens figés dans les 1-Pagers PDF).
   Concept (Claude Design, handoff « Shrink It v2 ») : le visiteur arrive sur
   le compteur Strava (« DAY N »), puis réduit lui-même, d'un appui long,
   4 vrais moments de pression jusqu'à « It's only… ». Le dernier écran lui
   renvoie « You got this ». Ma lecture personnelle de la campagne : aucun
   logo, aucune trois-bandes, aucun visuel adidas, mention de non-affiliation.

   Tout le texte vit ICI (composants : src/components/adidas/). Le CONTENU est
   en ANGLAIS ; les commentaires restent en français.

   Jetons dans les textes (remplacés par le composant / le script) :
     {jour}  → « Day 285 today » / « Day 285, as of yesterday » /
               « Day 285, as of 13 Oct 2026 » (selon la fraîcheur de la donnée)
     {n}     → nombre de jours validés d'affilée
     {proj}  → numéro du jour projeté au 1er mars 2027
     {team}  → intitulé de l'équipe
   Un moment dont `voix` est vide n'est pas publié (écran non construit).
   ========================================================================== */

const A = '/adidas';

export const commun = {
  email: 'alex.bourbigot78@gmail.com',
  cv: `${A}/Alex_Bourbigot_CV.pdf`,
  marque: 'La Gamberge',
  pour: 'For', // suivi du logo adidas puis de l'équipe : « For [logo] · Marketing »
  // Logo adidas (fichier fourni par Alex), affiché avec parcimonie :
  // en-tête de l'écran 1 et signature de l'écran final.
  logo: { src: `${A}/img/adidas-logo.png`, alt: 'adidas' },
  nonAffiliation: 'A personal project by Alex Bourbigot. Not affiliated with or endorsed by adidas.',
  mailSujet: 'You got this — {team}',

  // -- Le défi quotidien (compteur) -------------------------------------------
  // En direct : /api/streak (Strava). Sans réponse : la valeur de SECOURS
  // ci-dessous, avec sa date de vérification (jamais le jour de l'année).
  // 👉 À mettre à jour de temps en temps (jours VALIDÉS + date du relevé).
  streak: {
    debut: '2026-01-01',
    premierJour: '2027-03-01',
    secours: { jours: 285, date: '2026-10-12' }, // relevé Strava : 285 jours validés au 12 oct. 2026
    libelleDirect: 'Live from Strava',
    libelleSecours: 'Verified on Strava',
    jourAujourdhui: 'Day {n} today',
    jourHier: 'Day {n}, as of yesterday',
    jourAuDate: 'Day {n}, as of {date}',
  },

  // -- Écran 1 : DAY N ---------------------------------------------------------
  ecranJour: {
    titre: 'Day',
    regle: 'At least 5 km, every single day since January 1, 2026.',
    regleCassee: 'Back to zero. Day {n} of the new streak.',
    accroche: 'Pressure makes everything look huge.',
    accrocheAccent: 'Let’s make it small.',
    intro: 'My take on “You Got This”. Scroll ↓',
  },

  // -- Écran 2 : la grille ------------------------------------------------------
  grille: {
    titre: 'One missed day.',
    titreAccent: 'Back to zero.',
    // Couru aujourd'hui (donnée en direct, jour validé)
    texteAujourdhui: '{n} squares. The orange one is today. The empty one is tomorrow, and it’s never guaranteed.',
    // Donnée de la veille ou de secours
    texteDernier: '{n} squares. The orange one is the latest. The empty one is next, and it’s never guaranteed.',
    // Série retombée à zéro (donnée en direct)
    texteZero: 'No squares left. The empty one is the first of a new streak, and it’s never guaranteed.',
    libelleAujourdhui: 'Today',
    libelleDernier: 'Latest day',
    libelleSuivant: 'Next day',
  },

  // -- Les 4 moments de pression (moments VÉCUS, fournis par Alex) -------------
  //   tag : contexte · grand : le mot qui rétrécit · voix : la voix négative
  //   seul / seulAccent : « It's only… » (accent = mot en orange, optionnel)
  //   preuve : le fait vérifiable
  boutons: {
    repos: 'Hold to shrink it',
    appui: 'Keep holding…',
    encore: 'Hold a little longer',
    fini: 'Next ↓',
  },
  moments: [
    {
      id: 'm1',
      tag: 'Paris Marathon · April 2026',
      grand: 'KM 34',
      voix: 'No. You can’t crack now.',
      seul: 'It’s only a race.',
      preuve: 'The group blew up. I ran the last 8 km alone. Finished in 2:38:21.',
    },
    {
      id: 'm2',
      tag: 'The streak · Just another day',
      grand: '0%',
      voix: 'You can’t crack now. You have to.',
      seul: 'It’s only 5 km.',
      preuve: 'No race, no reason. Motivation at zero. Still went. {jour}.',
    },
    {
      id: 'm3',
      tag: 'Nice by UTMB · September 2026',
      grand: 'KM 30',
      voix: 'I can’t take it anymore. I’m going to walk.',
      seul: 'It’s only a few minutes.',
      preuve: 'My first trail. About 39 km.',
    },
    {
      id: 'm4',
      tag: 'This application',
      grand: 'Round 2',
      voix: 'I wasn’t ready last year. Why would I be now? I’ve got nothing good to send.',
      seul: 'It’s only a',
      seulAccent: 'game',
      seulFin: '.',
      preuve: 'Last year I passed round one, not round two. So I came back.',
    },
  ],

  // -- Écran 6 : Back to Run ---------------------------------------------------
  // Chiffres validés : ne jamais confondre inscrits, actifs et finishers.
  backToRun: {
    surTitre: 'Back to Run · 30 days · 5 km a day · September 2026',
    titre: 'So I gave the same rule to',
    titreAccent: '2,020',
    titreFin: 'people.',
    chiffres: [
      { valeur: '2,020', legende: 'signed up' },
      { valeur: '~1,200', legende: 'logged at least one run' },
      { valeur: '~250', legende: 'finished all 30 days' },
      { valeur: '~100K', legende: 'km, all together', accent: true },
    ],
    texte: 'The rule made real pressure. A beaver, a Tribunal to plead a missed day and Le Coffre, a weekend of missions, made it a game.',
    avatarsLegende: 'The 12 beaver avatars runners could pick from.',
    avatars: [
      { src: `${A}/img/avatar-classique.webp`, alt: 'Classic beaver' },
      { src: `${A}/img/avatar-crame.webp`, alt: 'Exhausted beaver' },
      { src: `${A}/img/avatar-determine.webp`, alt: 'Determined beaver' },
      { src: `${A}/img/avatar-finisher.webp`, alt: 'Finisher beaver with a medal' },
      { src: `${A}/img/avatar-frimeur.webp`, alt: 'Show-off beaver in sunglasses' },
      { src: `${A}/img/avatar-juge.webp`, alt: 'Judge beaver with a gavel' },
      { src: `${A}/img/avatar-leve-tot.webp`, alt: 'Early-riser beaver' },
      { src: `${A}/img/avatar-marcheur.webp`, alt: 'Walking beaver' },
      { src: `${A}/img/avatar-nocturne.webp`, alt: 'Night-runner beaver with a headlamp' },
      { src: `${A}/img/avatar-pluie.webp`, alt: 'Rainy-day beaver' },
      { src: `${A}/img/avatar-supporter.webp`, alt: 'Supporter beaver waving a flag' },
      { src: `${A}/img/avatar-trailer.webp`, alt: 'Trail-runner beaver' },
    ],
  },

  // -- Écran 8 : Your turn -----------------------------------------------------
  aToi: {
    titre: 'Your turn.',
    question: 'What feels huge for you today?',
    reponse: 'You got this.',
  },

  // -- Écran 9 : Next ------------------------------------------------------------
  suite: {
    titre: 'March 2027.',
    titreAccent: 'Herzogenaurach.',
    projection: '{jour}. If the streak holds, my first day would be Day {proj}.',
    lienPdf: 'My {team} one-pager',
    lienCv: 'My CV',
    pdfFleche: 'PDF ↓',
  },

  // -- Barre fixe -----------------------------------------------------------------
  barre: { pdf: 'One-pager ↓', cv: 'CV ↓', email: 'Email me' },
};

// -- Par équipe : intitulé, PDF, ligne Back to Run, 3 choix, phrase de fin -----
// Textes validés provisoirement (à ajuster ici).
export const equipes = {
  marketing: {
    slug: 'adidas-marketing',
    equipe: 'Marketing',
    title: 'Alex Bourbigot · adidas application · Marketing',
    description: 'My take on “You Got This”: four real moments of pressure, made small. Alex Bourbigot’s application for the adidas Marketing internship.',
    pdf: `${A}/pdf/Alex_Bourbigot_adidas_1-Pager_Marketing.pdf`,
    btrLine: 'An idea only counts if people join it, and keep showing up.',
    choix: ['A launch date', 'A number to hit', 'A Monday brief'],
    finale: 'I want to turn ideas into things people join. At adidas Marketing.',
  },
  brandCommunications: {
    slug: 'adidas-brand-communications',
    equipe: 'Brand Communications',
    title: 'Alex Bourbigot · adidas application · Brand Communications',
    description: 'My take on “You Got This”: four real moments of pressure, made small. Alex Bourbigot’s application for the adidas Brand Communications internship.',
    pdf: `${A}/pdf/Alex_Bourbigot_adidas_1-Pager_Brand_Communications.pdf`,
    btrLine: 'One rule. 2,020 different stories with it. Finding the ones that touch people is the job.',
    choix: ['A blank page', 'A story that won’t land', 'A deadline'],
    finale: 'I want to find the sport stories that touch people. At adidas Brand Communications.',
  },
  productManagement: {
    slug: 'adidas-product-management',
    equipe: 'Product Management',
    title: 'Alex Bourbigot · adidas application · Product Management',
    description: 'My take on “You Got This”: four real moments of pressure, made small. Alex Bourbigot’s application for the adidas Product Management internship.',
    pdf: `${A}/pdf/Alex_Bourbigot_adidas_1-Pager_Product_Management.pdf`,
    btrLine: 'Every runner started from a different place. Every drop-off was a friction worth understanding.',
    choix: ['A trade-off', 'A user who quit', 'A launch date'],
    finale: 'I want to build for runners who all start somewhere different. At adidas Product Management.',
  },
};
