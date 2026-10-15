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
   Un moment dont `grand` est vide n'est pas publié (écran non construit).
   ========================================================================== */

const A = '/adidas';

export const commun = {
  email: 'alex.bourbigot78@gmail.com',
  cv: `${A}/Alex_Bourbigot_CV.pdf`,
  marque: 'La Gamberge',
  pour: 'For', // suivi du logo adidas puis de l'équipe : « For [logo] · Marketing »
  // Logo adidas (fichier fourni par Alex) : en-tête et grand filigrane de
  // l'écran 1, signature « You got this » après chaque problème réduit,
  // écran final.
  logo: { src: `${A}/img/adidas-logo.png`, alt: 'adidas' },
  nonAffiliation: 'A personal project by Alex Bourbigot. Not affiliated with or endorsed by adidas.',
  mailSujet: 'You got this — {team}',
  // Signature affichée quand un problème a été réduit (suivie du logo).
  signature: 'You got this.',

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
  //   tag : contexte · grand : LE PROBLÈME, en énorme, qui rétrécit
  //   contexte : l'événement (date · lieu · moment), affiché au-dessus du problème
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
      tag: 'Paris Marathon',
      contexte: 'April 2026 · Paris Marathon · Kilometre 34',
      grand: 'I’m going to crack.',
      seul: 'It’s only a race.',
      preuve: 'The group blew up. I ran the last 8 km alone. Finished in 2:38:21.',
    },
    {
      id: 'm2',
      tag: 'The streak',
      contexte: '2026 · The daily 5 km streak · Just another day',
      grand: 'Zero motivation.',
      seul: 'It’s only 5 km.',
      preuve: 'No race, no reason. Motivation at zero. Still went. {jour}.',
    },
    {
      id: 'm3',
      tag: 'Nice by UTMB',
      contexte: 'September 2026 · Nice by UTMB · Kilometre 30',
      grand: 'I’m going to walk.',
      seul: 'It’s only a few minutes.',
      preuve: 'My first trail. About 39 km.',
    },
    {
      id: 'm4',
      tag: 'This application',
      contexte: 'October 2026 · My adidas application · Second try',
      grand: 'Round 2',
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
    // Titre sur toute la largeur : la règle est dite explicitement.
    titre: '5 km a day for 30 days. I gave that rule to',
    titreAccent: '2,020',
    titreFin: 'runners.',
    definitionTitre: 'What is Back to Run?',
    explication: 'The online running challenge I built from scratch in September 2026. The rule: run at least 5 km every single day for 30 days. Runs were tracked via Strava or logged by hand.',
    // Chiffres validés : inscrits, finishers, kilomètres.
    chiffres: [
      { valeur: '2,020', legende: 'runners signed up' },
      { valeur: '~250', legende: 'finished all 30 days' },
      { valeur: '~100K', legende: 'km run together', accent: true },
    ],
    texteTitre: 'Why it worked',
    texte: 'The rule made real pressure. So I turned it into a game: a beaver mascot, a Tribunal to plead a missed day, and Le Coffre, a weekend of missions.',
    logo: { src: `${A}/img/btr-logo.webp`, width: 480, height: 314, alt: 'Back to Run' },
    mascotte: { src: `${A}/img/btr-mascotte.webp`, width: 400, height: 650, alt: 'The Back to Run beaver mascot, waving.' },
    // Lien vers le site du défi (remplace la frise des 12 avatars).
    lien: { url: 'https://backtorun.fr', texte: 'Visit backtorun.fr', detail: 'See the challenge for yourself' },
  },

  // -- Écran 8 : Your turn -----------------------------------------------------
  aToi: {
    titre: 'Your turn.',
    question: 'What feels huge for you today?',
    consigne: 'Pick one. Then hold to shrink it.',
    reponse: 'You got this.', // réponse affichée sans JavaScript
    // Problème (bouton) → réponse affichée quand il a rétréci (suivie du logo).
    // ⚠️ Faits d'actualité fournis par Alex : à vérifier avant envoi.
    choix: [
      { probleme: 'Failing to break 2 hours in the marathon?', reponse: 'Sabastian Sawe got this.' },
      { probleme: 'Not winning the World Cup?', reponse: 'Spain got this.' },
      { probleme: 'Letting Alex go and losing a talent?', reponse: 'You got this.' },
      { probleme: 'Not giving Alex a new pair of Adizero Adios Pro Evo 3?', reponse: 'You got this. (Please.)' },
    ],
  },

  // -- Écran 9 : Next ------------------------------------------------------------
  suite: {
    surTitre: 'Next stop',
    titre: 'March 2027.',
    titreAccent: 'Herzogenaurach.',
    infos: ['6-month internship', 'From 1 March 2027', 'Ready to move to Herzogenaurach'],
    projection: '{jour}. If the streak holds, my first day would be Day {proj}.',
    actionsTitre: 'The rest of the story',
    lienPdf: 'Download my {team} one-pager',
    lienPdfDetail: 'PDF · 1 page',
    lienCv: 'Download my CV',
    lienCvDetail: 'PDF · 1 page',
    lienMail: 'Email me',
    // Bouton-blague : ouvre un e-mail déjà rédigé vers Alex.
    embauche: {
      titre: 'Hire Alex directly',
      detail: 'A ready-to-send email. Just hit send.',
      sujet: 'Congratulations Alex, you’re hired! 🎉',
      // Fenêtre intermédiaire : la blague est désamorcée AVANT de préparer
      // l'e-mail. Si la personne confirme, c'est un vrai choix.
      fenetre: {
        titre: 'Wait, I was joking! 😅',
        texte: 'But if you insist… you won’t have to ask me twice.',
        confirmer: 'Prepare the email',
        confirmerDetail: 'Opens your mail app, ready to send.',
        fermer: 'Fine, back to the page',
      },
      corps: [
        'Hi Alex,',
        '',
        'Congratulations! After careful consideration (and a few long presses), we are delighted to offer you the 6-month {team} internship at adidas, starting 1 March 2027 in Herzogenaurach.',
        '',
        'Please bring your running shoes. The streak continues.',
        '',
        'You got this.',
        '',
        'Best regards,',
        '[Your name]',
        'adidas {team}',
      ],
    },
  },

  // -- Barre fixe -----------------------------------------------------------------
  barre: { pdf: 'One-pager ↓', cv: 'CV ↓', email: 'Email me' },
};

// -- Par équipe : intitulé, PDF, ligne Back to Run, phrase de fin --------------
// Textes validés provisoirement (à ajuster ici).
export const equipes = {
  marketing: {
    slug: 'adidas-marketing',
    equipe: 'Marketing',
    title: 'Alex Bourbigot · adidas application · Marketing',
    description: 'My take on “You Got This”: four real moments of pressure, made small. Alex Bourbigot’s application for the adidas Marketing internship.',
    pdf: `${A}/pdf/Alex_Bourbigot_adidas_1-Pager_Marketing.pdf`,
    btrLine: 'An idea only counts if people join it, and keep showing up.',
    finale: 'I want to turn ideas into things people join. At adidas Marketing.',
  },
  brandCommunications: {
    slug: 'adidas-brand-communications',
    equipe: 'Brand Communications',
    title: 'Alex Bourbigot · adidas application · Brand Communications',
    description: 'My take on “You Got This”: four real moments of pressure, made small. Alex Bourbigot’s application for the adidas Brand Communications internship.',
    pdf: `${A}/pdf/Alex_Bourbigot_adidas_1-Pager_Brand_Communications.pdf`,
    btrLine: 'One rule. 2,020 different stories with it. Finding the ones that touch people is the job.',
    finale: 'I want to find the sport stories that touch people. At adidas Brand Communications.',
  },
  productManagement: {
    slug: 'adidas-product-management',
    equipe: 'Product Management',
    title: 'Alex Bourbigot · adidas application · Product Management',
    description: 'My take on “You Got This”: four real moments of pressure, made small. Alex Bourbigot’s application for the adidas Product Management internship.',
    pdf: `${A}/pdf/Alex_Bourbigot_adidas_1-Pager_Product_Management.pdf`,
    btrLine: 'Every runner started from a different place. Every drop-off was a friction worth understanding.',
    finale: 'I want to build for runners who all start somewhere different. At adidas Product Management.',
  },
};
