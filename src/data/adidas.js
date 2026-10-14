/* ==========================================================================
   CANDIDATURES ADIDAS — FICHIER DE DONNÉES (3 pages non répertoriées)
   --------------------------------------------------------------------------
   Pages : /adidas-marketing, /adidas-brand-communications,
           /adidas-product-management (liens figés dans les 1-Pagers PDF).
   Tout le texte de ces pages vit ICI. Les composants
   (src/components/adidas/) ne contiennent aucun texte en dur.

   ⚠️ Le CONTENU est en ANGLAIS (candidature internationale) ; seuls les
   commentaires restent en français.

   Organisation :
     - `commun`   : tout ce qui est partagé par les 3 pages ;
     - `equipes`  : un objet par équipe (intitulé, fin de l'intro, ordre des
                    sections, chronologie, fin du paragraphe « game »,
                    3 apports, PDF, title/description).
   Un champ à null (ou une liste vide) n'est simplement pas affiché.
   Les champs « TODO » attendent une info d'Alex : ne rien inventer.
   ========================================================================== */

// Dossier des fichiers publics (public/adidas/).
const A = '/adidas';

export const commun = {
  nom: 'Alex Bourbigot',
  email: 'alex.bourbigot78@gmail.com',

  // CV : chemin du PDF dans public/adidas/. TODO (Alex) : déposer le CV dans
  // public/adidas/Alex_Bourbigot_CV.pdf puis remplacer null par
  // `${A}/Alex_Bourbigot_CV.pdf`. Tant que c'est null, aucun bouton CV.
  cv: null,

  // Photo du hero (déjà retouchée : ne pas la recadrer autrement).
  photo: {
    src: `${A}/img/hero.webp`,
    srcMobile: `${A}/img/hero-640.webp`,
    width: 1256,
    height: 1548,
    alt: 'Alex Bourbigot running a race, saluting, in colour against a black-and-white crowd.',
  },
  mascotte: {
    src: `${A}/img/mascot.webp`,
    width: 400,
    height: 650,
    alt: 'The Back to Run beaver mascot, waving.',
  },

  // -- Hero -------------------------------------------------------------------
  hero: {
    surTitre: 'adidas application',
    titre: 'I’m back', // le point bleu est ajouté par le composant
    dossard: '#2',
    dossardLegende: 'Application',
    debutIntro:
      'Last year, I applied for an adidas internship. I made it past the first round, but no further. I took that as a sign I still had more to learn.',
    mention: '6-month internship · From 1 March 2027 · Ready to move to Herzogenaurach',
  },

  boutons: {
    pdf: 'Download my 1-Pager (PDF)',
    cv: 'Download my CV',
    email: 'Email me',
  },

  // -- Chronologie « One year. New splits. » ---------------------------------
  splits: {
    repere: '02',
    surTitre: 'What changed',
    titre: 'One year.',
    titreAccent: 'New splits.',
    transition: 'On paper: management, export sales and sport retail.',
    transitionFleche: 'Beyond the CV ↓',
    // Dernière étape, commune aux 3 équipes (contour bleu).
    prochaine: { quand: 'Mar 2027', chiffre: 'Next', titre: 'Herzogenaurach', texte: 'Six months. Ready to move.' },
  },

  // -- Sections de preuves (ordre défini par équipe) --------------------------
  sections: {
    backToRun: {
      id: 'back-to-run',
      surTitre: 'Back to Run · September 2026',
      titre: 'I built a 30-day running challenge.',
      paragraphes: [
        'Back to Run was an online challenge: run at least 5 km every day for 30 days, throughout September 2026. Runs were tracked via Strava or logged by hand.',
        'The rule was demanding, and the pressure was real. What I could shape was how it felt: a beaver mascot, 12 beaver avatars to pick from, a “Tribunal” where runners pleaded a missed day, and “Le Coffre”, a weekend event with missions during the campaign.',
        'Not everyone lived it the same way. The rule stayed hard; the game, the humour and runners helping each other changed how it felt to carry.',
      ],
      // Ne jamais confondre inscrits, participants actifs et finishers.
      chiffres: [
        { valeur: '2,020', legende: 'signed up' },
        { valeur: '~1,200', legende: 'logged at least one run' },
        { valeur: '~250', legende: 'finished all 30 days' },
        { prefixe: 'Almost', valeur: '100,000', legende: 'km run together' },
      ],
      logo: { src: `${A}/img/btr-logo.webp`, width: 480, height: 314, alt: 'Back to Run logo' },
      univers: [
        { src: `${A}/img/btr-tribunal.webp`, width: 360, height: 360, alt: 'The beaver as judge, gavel in hand.', legende: 'The Tribunal: where runners pleaded a missed day.' },
        { src: `${A}/img/btr-coffre.webp`, width: 360, height: 362, alt: 'The beaver leaning on a treasure chest.', legende: 'Le Coffre: a weekend event with missions during the campaign.' },
        { src: `${A}/img/btr-medaille.webp`, width: 300, height: 482, alt: 'The beaver holding up a medal.', legende: 'One mascot, many moods.' },
      ],
      avatarsLegende: '12 beaver avatars, one for every kind of runner.',
      avatars: [
        { src: `${A}/img/avatar-classique.webp`, alt: 'Classic beaver avatar' },
        { src: `${A}/img/avatar-crame.webp`, alt: 'Exhausted beaver avatar' },
        { src: `${A}/img/avatar-pluie.webp`, alt: 'Rainy-day beaver avatar' },
        { src: `${A}/img/avatar-frimeur.webp`, alt: 'Show-off beaver avatar with sunglasses' },
        { src: `${A}/img/avatar-trailer.webp`, alt: 'Trail-runner beaver avatar' },
        { src: `${A}/img/avatar-finisher.webp`, alt: 'Finisher beaver avatar with a medal' },
      ],
      photo: {
        src: `${A}/img/btr-community.webp`,
        width: 1200,
        height: 960,
        alt: 'Members of the Back to Run community together in Paris, smiling.',
        legende: 'Back to Run community members, together in Paris.',
      },
      // URL publique du site (reprise de src/data/mediakit.js). À confirmer.
      lien: { url: 'https://backtorun.fr', texte: 'Visit Back to Run' },
    },

    laGamberge: {
      id: 'la-gamberge',
      surTitre: 'La Gamberge · since November 2025',
      titre: 'I make running content. People answer back.',
      paragraphes: [
        'In November 2025, I started La Gamberge: running content on Instagram, TikTok and YouTube. Video by video, it has grown to 19,000+ followers across the three.',
        'I write, film and edit every piece myself, and I talk with my audience directly.',
        'I have also made paid content for brands and for agency campaigns.',
        'In July 2026, I took it offline: the first La Gamberge community run, in Paris.',
      ],
      chiffre: { valeur: '19K+', legende: 'followers across Instagram, TikTok and YouTube' },
      videosTitre: 'A few videos',
      // Cartes vignettes cliquables (aucun embed lourd).
      //   plateforme : 'Instagram' | 'TikTok' | 'YouTube'
      //   YouTube : renseigner `youtubeId` → façade légère (vignette, iframe au clic).
      //   Une carte sans `url` (ni `youtubeId`) n'est pas affichée.
      // TODO (Alex) : confirmer ces 4 vidéos (reprises de mediakit.js) ou les
      // remplacer par tes liens TikTok / Instagram / YouTube préférés.
      videos: [
        { titre: '10K start line, dressed in green in the elite pen', plateforme: 'Instagram', url: 'https://www.instagram.com/p/DZaWXEPI757/', miniature: `${A}/img/video-depart-10k.webp`, width: 600, height: 935 },
        { titre: 'My Paris Marathon story', plateforme: 'Instagram', url: 'https://www.instagram.com/reel/DXXAo85iP85/', miniature: `${A}/img/video-marathon-paris.webp`, width: 600, height: 931 },
        { titre: 'A comedy sketch filmed during a race', plateforme: 'Instagram', url: 'https://www.instagram.com/reel/DT-6y1HiCuf/', miniature: `${A}/img/video-sketch.webp`, width: 600, height: 935 },
        { titre: 'Mission: win the race incognito', plateforme: 'Instagram', url: 'https://www.instagram.com/p/DZVU9EwosdJ/', miniature: `${A}/img/video-course-incognito.webp`, width: 558, height: 698 },
      ],
      reseauxTitre: 'Follow along',
    },

    coureur: {
      id: 'the-runner',
      surTitre: 'The runner',
      titre: 'Amateur runner. Serious about it.',
      paragraphes: [
        'I’m not a professional athlete. I played competitive football for about 12 years, then running took over.',
        'My first marathon was Paris 2025, in 2:59. One year later, in April 2026, I ran 2:38:21 at the Paris Marathon.',
        'Since 1 January 2026, I have run at least 5 km every single day. In 2026, I qualified for the French Championships over 5 km, 10 km and the marathon. In September 2026, I ran my first trail: Nice by UTMB, about 39 km.',
      ],
      chiffres: [
        { valeur: '2:59', legende: 'First marathon · Paris 2025' },
        { valeur: '2:38:21', legende: 'Paris Marathon · April 2026', accent: true },
        { valeur: '3', legende: 'French Championships qualifications in 2026: 5 km, 10 km, marathon' },
        { valeur: '~39 km', legende: 'First trail · Nice by UTMB, Sept 2026' },
      ],
      // Compteur EN DIRECT (/api/streak, Strava). Valeur de secours affichée
      // tant que l'API ne répond pas ou si elle échoue.
      streak: {
        secours: '280+',
        legende: 'days in a row with at least 5 km, since 1 January 2026',
        enDirect: 'Live from Strava', // suivi de « · updated {date} »
        misAJour: 'updated',
      },
    },

    experience: {
      id: 'experience',
      surTitre: 'Experience',
      titre: 'On paper.',
      postes: [
        {
          quand: 'Mar – Aug 2025',
          ou: 'Savencia International',
          role: 'Export Sales Assistant Intern',
          detail: 'International client portfolio, SAP orders, pricing, promotions, logistics follow-up, Excel and PowerPoint reporting.',
        },
        {
          quand: 'Jun – Aug 2022',
          ou: 'Nike House of Innovation Paris',
          role: 'Retail Athlete',
          detail: 'Advised customers in French, English and Spanish; Nike Air Zoom Mercurial activation.',
        },
        {
          quand: 'May – Jul 2021',
          ou: 'Decathlon',
          role: 'Running & Team Sports Sales Associate',
          detail: null,
        },
        {
          quand: 'Education',
          ou: 'IÉSEG School of Management',
          role: 'Master in Management',
          detail: 'General Management & Strategy Consulting. Exchange semester in Bogotá (2023).',
        },
      ],
      langues: {
        titre: 'Languages',
        liste: ['French · native', 'English · C1 (TOEIC 960)', 'Spanish · B2'],
      },
    },
  },

  // -- Bande bleue « Remember it's a game » -----------------------------------
  jeu: {
    repere: '03',
    surTitre: 'You got this',
    titre: 'Remember it’s a game.',
    debut:
      '5 km every day sounds like pressure, and Back to Run’s rules were demanding. So I wrapped them in a playful world: a beaver mascot, a “Tribunal” to plead a missed day, runners pushing each other to come back.',
  },

  apports: { repere: '04', titre: 'What I’d bring to' },

  // -- Pied de page / contact -------------------------------------------------
  contact: {
    repere: '05',
    surTitre: 'The rest of the story',
    titre: 'Let’s talk',
    mention: '6-month internship · From 1 March 2027 · Herzogenaurach',
  },
};

// Les sections de preuves disponibles (clés de `commun.sections`).
//   'backToRun' | 'laGamberge' | 'coureur' | 'experience'

export const equipes = {
  marketing: {
    slug: 'adidas-marketing',
    equipe: 'Marketing',
    title: 'Alex Bourbigot · adidas application · Marketing',
    description:
      'Alex Bourbigot’s application for the adidas Marketing internship: Back to Run, La Gamberge, the runner and the experience behind the 1-Pager.',
    finIntro: 'So I spent the year finding out what it takes to turn an idea into something people actually join.',
    ordre: ['backToRun', 'laGamberge', 'coureur', 'experience'],
    splits: [
      { quand: 'Nov 2025', chiffre: '19K+', titre: 'La Gamberge', texte: 'Started posting regularly. The audience grew, video by video, to 19,000+.' },
      { quand: 'Apr 2026', chiffre: '2:38', titre: 'Paris Marathon', texte: 'From 2:59 to 2:38:21 in one year. I know the sport by doing it.', accent: true },
      { quand: 'Sep 2026', chiffre: '2,020', titre: 'Back to Run', texte: '2,020 signed up. Around 1,200 took part. About 250 finished all 30 days.' },
    ],
    finJeu: 'A rule on its own asks people to comply. A story and a community give them a reason to join, and to keep following.',
    apports: [
      { titre: 'Plan the journey', texte: 'I set a goal, designed each stage of the challenge and tracked sign-ups, first runs and finishers separately. A sign-up is only the start.' },
      { titre: 'Adapt while it’s live', texte: 'I ran the challenge day by day and launched “Le Coffre” during the campaign to create a new moment. Watch, adjust, relaunch.' },
      { titre: 'Turn content into participation', texte: 'Videos are one thing. In July, I brought people together for a community run in Paris. In September, I launched Back to Run.' },
    ],
    pdf: `${A}/pdf/Alex_Bourbigot_adidas_1-Pager_Marketing.pdf`,
  },

  brandCommunications: {
    slug: 'adidas-brand-communications',
    equipe: 'Brand Communications',
    title: 'Alex Bourbigot · adidas application · Brand Communications',
    description:
      'Alex Bourbigot’s application for the adidas Brand Communications internship: La Gamberge, Back to Run, the runner and the experience behind the 1-Pager.',
    finIntro: 'So I spent the year getting closer to sport: running it, telling its stories and building something others could join.',
    ordre: ['laGamberge', 'backToRun', 'coureur', 'experience'],
    splits: [
      { quand: 'Nov 2025', chiffre: '19K+', titre: 'La Gamberge', texte: 'Started sharing what I was learning as a runner. Now a community of 19,000+.' },
      { quand: 'Apr 2026', chiffre: '2:38', titre: 'Paris Marathon', texte: 'From 2:59 to 2:38:21 in one year.', accent: true },
      { quand: 'Sep 2026', chiffre: '2,020', titre: 'Back to Run', texte: 'I built my first running challenge from scratch. 2,020 people joined.' },
    ],
    finJeu: 'The challenge stayed real. Playing it together made it easier to carry.',
    apports: [
      { titre: 'Several sides of sport', texte: 'Beginner, then competitive runner. Participant, then organiser. Watching sport’s stories, then telling my own.' },
      { titre: 'Ideas grounded in practice', texte: 'Publishing and running a challenge gave me ideas I couldn’t test alone. I’d bring the strongest ones, ready to be challenged by the team.' },
      { titre: 'Listen, then create', texte: 'I talk with my audience directly. Their replies show me which stories land, spark a reaction and make people want to join in.' },
    ],
    pdf: `${A}/pdf/Alex_Bourbigot_adidas_1-Pager_Brand_Communications.pdf`,
  },

  productManagement: {
    slug: 'adidas-product-management',
    equipe: 'Product Management',
    title: 'Alex Bourbigot · adidas application · Product Management',
    description:
      'Alex Bourbigot’s application for the adidas Product Management internship: the runner, the store floor, Back to Run and La Gamberge behind the 1-Pager.',
    finIntro: 'So I spent the year living sport day to day: training, racing and running alongside people of every level.',
    ordre: ['coureur', 'experience', 'backToRun', 'laGamberge'],
    splits: [
      { quand: 'Jan 2026', chiffre: '280+', titre: 'Days in a row', texte: 'At least 5 km every day: rain, heat, road, trail. Small frictions show up fast.' },
      { quand: 'Apr 2026', chiffre: '2:38', titre: 'Paris Marathon', texte: 'From 2:59 to 2:38:21 in one year.', accent: true },
      { quand: 'Sep 2026', chiffre: '2,020', titre: 'Back to Run', texte: '2,020 runners signed up, with very different levels and reasons to run.' },
    ],
    finJeu: 'Running daily myself, I saw kit play a similar role: the right product makes movement more inviting, the wrong one adds friction.',
    apports: [
      { titre: 'The athlete’s view', texte: 'About 12 years of football, then running, up to a 2:38:21 marathon. I know what a committed amateur expects from kit, session after session.' },
      { titre: 'The store-floor view', texte: 'At Nike and Decathlon, I advised customers and heard the questions and doubts that come just before a purchase.' },
      { titre: 'Not every runner is the same', texte: 'Through Back to Run and my community, I’ve seen people start from very different places. A beginner doesn’t need what a seasoned racer needs, and a range should reflect that.' },
    ],
    pdf: `${A}/pdf/Alex_Bourbigot_adidas_1-Pager_Product_Management.pdf`,
  },
};
