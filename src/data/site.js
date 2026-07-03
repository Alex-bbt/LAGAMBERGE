/* ==========================================================================
   LA GAMBERGE — FICHIER DE DONNÉES CENTRAL
   --------------------------------------------------------------------------
   C'EST LE SEUL FICHIER À ÉDITER AU QUOTIDIEN.
   Tout ce qui change souvent (le compteur de streak, l'état des qualifs,
   la liste des projets, les liens réseaux) se trouve ici.
   Pas besoin de toucher au reste du code : modifie une valeur, sauvegarde,
   le site se met à jour tout seul au prochain déploiement.
   ========================================================================== */

export const site = {
  // -- Identité -------------------------------------------------------------
  name: "La Gamberge",
  // Petite phrase d'accroche affichée sous le titre du hero.
  tagline: "Je cours pour arrêter de gamberger. Spoiler : je gamberge en courant.",
  // Utilisé dans les balises <meta> (partages Instagram, Google, etc.)
  description:
    "La Gamberge, c'est mon épopée en petites foulées : deux défis un peu absurdes, beaucoup de kilomètres, et l'envie de faire ça sérieusement sans jamais me prendre au sérieux.",

  // -- DÉFI #1 : le streak (au moins 5 km chaque jour de l'année) -----------
  //    👉 EN MODE MANUEL : change simplement "day" chaque jour/semaine.
  //    👉 EN MODE STRAVA  : ce chiffre devient un simple secours. Une fois
  //       Strava configuré (voir docs/strava-setup.md), le site recalcule la
  //       streak tout seul et ignore cette valeur. Utile de la garder à jour
  //       quand même, au cas où Strava serait momentanément indisponible.
  streak: {
    year: 2026,
    day: 183,        // ⬅️ LE chiffre à mettre à jour (jour actuel du défi)
    totalDays: 365,  // 366 en année bissextile — 2026 n'en est pas une
    minKm: 5,        // distance minimale parcourue chaque jour
  },

  // -- DÉFI #2 : les 4 qualifications aux Championnats de France -------------
  //    statuts possibles : "qualifie" | "rate" | "a_venir"
  //    👉 POUR METTRE À JOUR : change "status" (et "note" si tu veux).
  qualDeadline: "fin juillet 2026",
  quals: [
    {
      distance: "5 km",
      status: "qualifie",
      note: "Dans la boîte. Court mais ça pique.",
    },
    {
      distance: "10 km",
      status: "qualifie",
      note: "Validé. Le format que je préfère détester.",
    },
    {
      distance: "Semi-marathon",
      status: "rate",
      note: "Raté de pas grand-chose. On y retourne, forcément.",
    },
    {
      distance: "Marathon",
      status: "qualifie",
      note: "42,195 km et toujours vivant. Coché.",
    },
  ],

  // -- Réseaux sociaux ------------------------------------------------------
  //    👉 POUR AJOUTER UN RÉSEAU : copie un bloc et change les valeurs.
  socials: [
    {
      name: "Instagram",
      handle: "@lagambergee",
      url: "https://instagram.com/lagambergee",
      emoji: "📸",
      blurb: "Le QG. Stories du quotidien, foulées et bêtises.",
    },
    {
      name: "YouTube",
      handle: "La Gamberge",
      url: "https://youtube.com/@lagamberge",
      emoji: "🎬",
      blurb: "Les formats longs, quand la gamberge mérite un épisode.",
    },
    {
      name: "Strava",
      handle: "La Gamberge",
      url: "https://strava.com",
      emoji: "📈",
      blurb: "La preuve que je ne triche pas sur le streak.",
    },
  ],

  // -- Projets & actus ------------------------------------------------------
  //    statuts possibles : "en_cours" | "a_venir" | "termine"
  //    👉 POUR AJOUTER UN PROJET : copie un bloc et change les valeurs.
  projects: [
    {
      title: "Objectif : les 4 qualifs en un an",
      status: "en_cours",
      emoji: "🎯",
      description:
        "5 km, 10 km, semi, marathon : quatre qualifs aux Championnats de France dans la même saison. Il m'en manque une, et le chrono du calendrier tourne (fin juillet).",
    },
    {
      title: "Le streak 2026 — 5 km par jour",
      status: "en_cours",
      emoji: "🔥",
      description:
        "Chaque jour de l'année, au moins 5 km. Pluie, boulot, lendemains difficiles : aucune excuse n'a survécu pour l'instant.",
    },
    {
      title: "Podcast « La Gamberge à voix haute »",
      status: "a_venir",
      emoji: "🎙️",
      description:
        "Discuter course à pied, mental et vie de coureur amateur avec des gens plus rapides que moi. En préparation dans ma tête (donc en gamberge).",
    },
    {
      title: "Le guide « Débuter sans se cramer »",
      status: "a_venir",
      emoji: "📘",
      description:
        "Un petit guide gratuit pour commencer à courir sans se dégoûter en trois semaines. Concret, court, sans blabla de coach.",
    },
  ],

  // -- Newsletter -----------------------------------------------------------
  //    Pour la V1, le formulaire fonctionne en mode démo (message de
  //    confirmation local). Pour le brancher à un vrai service (Brevo,
  //    Buttondown, Mailchimp, Resend...), colle ici l'URL du formulaire ou
  //    de l'API — le formulaire postera automatiquement dessus.
  //    Laisse la chaîne vide ("") pour rester en mode démo.
  newsletterEndpoint: "",
};

// Petits utilitaires dérivés — pas besoin d'y toucher.
export const streakPercent = Math.min(
  100,
  Math.round((site.streak.day / site.streak.totalDays) * 100)
);
export const qualsDone = site.quals.filter((q) => q.status === "qualifie").length;
