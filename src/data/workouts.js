/* ==========================================================================
   LA GAMBERGE — SÉANCES DE SECOURS (fallback)
   --------------------------------------------------------------------------
   ⚠️ CE FICHIER N'EST PAS LA SOURCE PRINCIPALE DES SÉANCES.
   Les séances "en vrai" sont gérées dans Supabase (tables workout_categories,
   workouts, workout_pace_guidance) — voir docs/seances-setup.md.

   Ces quelques séances servent UNIQUEMENT de secours : elles s'affichent tant
   que Supabase n'est pas configuré (ou momentanément indisponible), pour que la
   bibliothèque ne soit jamais vide et que l'export .FIT reste testable.

   Elles servent AUSSI d'exemple vivant du format attendu par la colonne
   `structure` (jsonb) dans Supabase. Copie/adapte ces objets pour créer les
   tiens. Le format est décrit en détail dans docs/seances-setup.md.

   Format d'une étape de `structure` :
     { type, duree_sec | distance_m, allure_cible_sec_par_km? }
   Types possibles :
     - "echauffement"      → mise en route (souvent en temps)
     - "effort"            → portion rapide (temps OU distance, + allure cible)
     - "recuperation"      → récup entre les efforts (souvent en temps)
     - "retour_calme"      → retour au calme (souvent en temps)
     - "repetition_bloc"   → groupe qui se répète, avec :
                               { type:"repetition_bloc", nb_repetitions:N,
                                 etapes:[ ...sous-étapes... ] }
   Les allures sont en SECONDES PAR KILOMÈTRE (240 = 4:00/km).
   ========================================================================== */

// -- Catégories de secours --------------------------------------------------
export const workoutCategoriesFallback = [
  { id: 'frac-court', nom: 'Fractionné court', description: "Efforts vifs et courts (200 m à 800 m). Ça pique, mais pas longtemps." },
  { id: 'frac-long', nom: 'Fractionné long', description: "Répétitions de 1 km et plus. Le mental autant que les jambes." },
  { id: 'seuil', nom: 'Seuil', description: "Allure « confortablement difficile », le socle du chrono." },
  { id: 'endurance', nom: 'Endurance fondamentale', description: "Le pilier tranquille : courir facile, longtemps, sans se cramer." },
];

// -- Séances de secours -----------------------------------------------------
// Les allures ci-dessous sont indicatives ; chaque séance porte sa propre
// `guidance` (objectifs cliquables) qui recalcule l'allure des efforts.
export const workoutsFallback = [
  {
    id: 'fb-400',
    titre: '10 × 400 m',
    description: "Le grand classique du VMA. Court, rapide, et fini avant d'avoir eu le temps de gamberger.",
    categorie_id: 'frac-court',
    distance_cible_m: 5000,
    structure: [
      { type: 'echauffement', duree_sec: 900, allure_cible_sec_par_km: 360 },
      {
        type: 'repetition_bloc',
        nb_repetitions: 10,
        etapes: [
          { type: 'effort', distance_m: 400, allure_cible_sec_par_km: 216 },
          { type: 'recuperation', duree_sec: 75 },
        ],
      },
      { type: 'retour_calme', duree_sec: 600 },
    ],
    guidance: [
      { objectif_label: 'Passer sous 20 min au 5 km', allure_recommandee_sec_par_km: 210 },
      { objectif_label: 'Découvrir la VMA en douceur', allure_recommandee_sec_par_km: 240 },
    ],
  },
  {
    id: 'fb-2000',
    titre: '3 × 2000 m',
    description: "Trois blocs pour apprendre à tenir l'allure quand ça devient inconfortable. Le fractionné qui construit le 10 km.",
    categorie_id: 'frac-long',
    distance_cible_m: 10000,
    structure: [
      { type: 'echauffement', duree_sec: 1200, allure_cible_sec_par_km: 360 },
      {
        type: 'repetition_bloc',
        nb_repetitions: 3,
        etapes: [
          { type: 'effort', distance_m: 2000, allure_cible_sec_par_km: 228 },
          { type: 'recuperation', duree_sec: 180 },
        ],
      },
      { type: 'retour_calme', duree_sec: 600 },
    ],
    guidance: [
      { objectif_label: 'Passer sous 40 min au 10 km', allure_recommandee_sec_par_km: 228 },
      { objectif_label: 'Viser 45 min au 10 km', allure_recommandee_sec_par_km: 258 },
    ],
  },
  {
    id: 'fb-pyramide',
    titre: 'Pyramide 800-1000-1500-1000-800',
    description: "Ça monte, ça redescend. Une séance ludique pour varier les distances et casser la routine (et la monotonie).",
    categorie_id: 'frac-long',
    distance_cible_m: 10000,
    structure: [
      { type: 'echauffement', duree_sec: 1200, allure_cible_sec_par_km: 360 },
      { type: 'effort', distance_m: 800, allure_cible_sec_par_km: 222 },
      { type: 'recuperation', duree_sec: 120 },
      { type: 'effort', distance_m: 1000, allure_cible_sec_par_km: 228 },
      { type: 'recuperation', duree_sec: 150 },
      { type: 'effort', distance_m: 1500, allure_cible_sec_par_km: 234 },
      { type: 'recuperation', duree_sec: 150 },
      { type: 'effort', distance_m: 1000, allure_cible_sec_par_km: 228 },
      { type: 'recuperation', duree_sec: 120 },
      { type: 'effort', distance_m: 800, allure_cible_sec_par_km: 222 },
      { type: 'retour_calme', duree_sec: 600 },
    ],
    guidance: [
      { objectif_label: 'Objectif 10 km ambitieux', allure_recommandee_sec_par_km: 225 },
      { objectif_label: 'Objectif 10 km tranquille', allure_recommandee_sec_par_km: 250 },
    ],
  },
  {
    id: 'fb-seuil',
    titre: '2 × 12 min au seuil',
    description: "Le pain quotidien de la progression. Une allure « soutenue mais gérable » : tu pourrais dire trois mots, pas une phrase.",
    categorie_id: 'seuil',
    distance_cible_m: 10000,
    structure: [
      { type: 'echauffement', duree_sec: 1200, allure_cible_sec_par_km: 360 },
      {
        type: 'repetition_bloc',
        nb_repetitions: 2,
        etapes: [
          { type: 'effort', duree_sec: 720, allure_cible_sec_par_km: 258 },
          { type: 'recuperation', duree_sec: 180 },
        ],
      },
      { type: 'retour_calme', duree_sec: 600 },
    ],
    guidance: [
      { objectif_label: 'Préparer un 10 km rapide', allure_recommandee_sec_par_km: 252 },
      { objectif_label: 'Préparer un semi-marathon', allure_recommandee_sec_par_km: 270 },
    ],
  },
  {
    id: 'fb-endurance',
    titre: '50 min tranquille',
    description: "La sortie qui ne paie pas de mine mais qui fait tout le boulot. Cours à un rythme où tu pourrais papoter. Vraiment.",
    categorie_id: 'endurance',
    distance_cible_m: null,
    structure: [
      { type: 'echauffement', duree_sec: 300 },
      { type: 'effort', duree_sec: 2400, allure_cible_sec_par_km: 330 },
      { type: 'retour_calme', duree_sec: 300 },
    ],
    guidance: [
      { objectif_label: 'Endurance fondamentale (footing)', allure_recommandee_sec_par_km: 330 },
      { objectif_label: 'Sortie récup très facile', allure_recommandee_sec_par_km: 360 },
    ],
  },
];
