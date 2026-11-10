/* ==========================================================================
   LA GAMBERGE — TEXTES, LIENS ET PHOTOS
   --------------------------------------------------------------------------
   Tout le texte du site est ici, chapitre par chapitre.

   - Pour changer un texte : remplace ce qui est entre guillemets.
   - Tant qu'un texte vaut null, le site affiche un emplacement
     [TEXTE À ÉCRIRE PAR ALEX] bien visible.
   - Pour une photo : dépose le fichier dans src/assets/photos/ puis écris
     son nom dans « fichier » (ex. "prologue.jpg"), et décris l'image dans
     « alt » (lu par les lecteurs d'écran et Google). Astro l'optimise tout seul.
   - Les chiffres qui bougent ne sont PAS ici : voir src/data/chiffres.js.

   Ton (charte) : première personne, phrases courtes et concrètes, pas de
   jargon marketing, pas de point d'exclamation dans les titres.
   ========================================================================== */

export const contenu = {
  meta: {
    titre: "La Gamberge · Alex Bourbigot",
    description: null, // phrase pour Google et les partages (≈ 150 caractères)
  },

  // -- Navigation ------------------------------------------------------------
  nav: [
    { libelle: "L'histoire", lien: "#chapitre-1" },
    { libelle: "La communauté", lien: "#chapitre-3" },
  ],

  // -- Prologue --------------------------------------------------------------
  prologue: {
    titre: "Alex Bourbigot",
    // Faits tirés de ta présentation ; reformule-les à ta façon.
    chapeau: "Coureur, créateur de contenu et organisateur de Back to Run.",
    phrase: null, // « qui je suis, en une phrase »
    photo: { fichier: null, alt: "", description: "Alex en course, format portrait 4:5" },
  },

  // -- Chapitre 1 : le coureur ----------------------------------------------
  coureur: {
    titre: "Le coureur",
    chapeau: null, // la progression, en deux ou trois phrases
    // Tes chronos de référence : remplace les null.
    chronos: [
      { epreuve: null, temps: null, source: null },
      { epreuve: null, temps: null, source: null },
    ],
    photo: { fichier: null, alt: "", description: "une course marquante, format paysage 3:2" },
  },

  // -- Chapitre 2 : le créateur ---------------------------------------------
  createur: {
    titre: "Le créateur",
    chapeau: null, // Instagram (la régularité) et TikTok (la viralité)
  },

  // -- Chapitre 3 : la communauté (Back to Run) -----------------------------
  communaute: {
    // Titre et chapeau repris de l'exemple du design system : à valider.
    titre: "Ils sont venus voir. Puis ils se sont mis à courir.",
    chapeau: "Back to Run, c'est la preuve qu'une audience peut se lever et passer à l'action.",
    lien: null, // lien vers Back to Run (site, Instagram…)
    photo: { fichier: null, alt: "", description: "le groupe Back to Run au départ, format paysage 3:2" },
  },

  // -- Chapitre 4 : ce qui arrive (SaintéLyon) ------------------------------
  saintelyon: {
    titre: "La SaintéLyon",
    chapeau: null, // pourquoi cette course, où en est la préparation
    date: null, // date de la course
    materiel: null, // le matériel de course utilisé pour la préparation
    photo: { fichier: null, alt: "", description: "un entraînement de nuit, frontale allumée, format paysage 3:2" },
  },

  // -- Épilogue --------------------------------------------------------------
  epilogue: {
    titre: "Écrivons le prochain chapitre",
    chapeau: null, // une phrase pour les marques et les magasins
    // « Ils m'ont fait confiance » : noms des marques, sans chiffres.
    // Ajoute une ligne par marque, ex. "Shokz".
    marques: [],
    email: null, // ex. "contact@lagamberge.com"
  },

  // -- Réseaux (repris de l'ancien site) ------------------------------------
  // Pour ajouter un réseau : copie une ligne et change les valeurs.
  reseaux: [
    { nom: "Instagram", pseudo: "@lagambergee", lien: "https://instagram.com/lagambergee" },
    { nom: "TikTok", pseudo: "@lagambergeee", lien: "https://www.tiktok.com/@lagambergeee" },
    { nom: "YouTube", pseudo: "@La_Gamberge", lien: "https://www.youtube.com/@La_Gamberge" },
    { nom: "Strava", pseudo: "La Gamberge", lien: "https://strava.app.link/HoBElyFDt4b" },
  ],
};
