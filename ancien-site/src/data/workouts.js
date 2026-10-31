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

   Champs d'une séance :
     - titre, description (courte)         → carte de la bibliothèque
     - categorie_id, distance_cible_m      → filtres
     - structure (voir plus bas)           → étapes de la séance
     - guidance                            → objectifs d'allure cliquables
     - CONTENU ÉDITORIAL (tous optionnels, affichés sur la page détail) :
         interet   → « L'intérêt de la séance » (ce qu'elle développe)
         periode   → « Quand la placer » (phase de prépa, fréquence)
         pour_qui  → « Pour qui » (niveau, objectif)
         conseils  → « Conseils d'exécution » (comment bien la courir)

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
export const workoutsFallback = [
  {
    id: 'fb-400',
    titre: '10 × 400 m',
    description: "Le grand classique du VMA. Court, rapide, et fini avant d'avoir eu le temps de gamberger.",
    categorie_id: 'frac-court',
    distance_cible_m: 5000,
    interet: "Cette séance travaille la VMA (vitesse maximale aérobie) et la vitesse pure : la cylindrée du moteur. En répétant des efforts courts et rapides, tu apprends à ton corps à courir vite en restant relâché, et tu repousses le plafond au-dessus duquel tout devient rouge.",
    periode: "En pleine préparation, une fois par semaine, quand tu as déjà quelques semaines d'endurance dans les jambes. À alléger la dernière semaine avant une course (garde la vivacité, pas la fatigue).",
    pour_qui: "Les coureurs déjà à l'aise avec l'allure rapide, ou qui préparent un 5 km. Si tu débutes le fractionné, commence par moins de répétitions et une allure plus sage.",
    conseils: "Cours les 400 les plus réguliers possible : la tentation, c'est de partir trop vite sur le premier. Récupère en trottinant (pas à l'arrêt) pour rester chaud. Si l'allure s'effondre sur les derniers, c'est que tu es parti trop fort.",
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
    interet: "L'objectif : apprendre à tenir ton allure spécifique 10 km alors que la fatigue s'installe. Des blocs longs à allure course, c'est ce qui fait la différence le jour J — le corps mémorise le rythme et la tête apprend à ne pas lâcher quand ça tire.",
    periode: "Au cœur d'une préparation 10 km, typiquement 3 à 6 semaines avant l'objectif. Une fois par semaine grand maximum : c'est une séance exigeante qui demande d'être fraîche.",
    pour_qui: "Les coureurs qui visent un chrono sur 10 km et ont déjà une bonne base d'endurance. Ce n'est pas une séance de découverte : mieux vaut avoir déjà tâté du fractionné plus court avant.",
    conseils: "Vise une allure que tu peux tenir sur les TROIS blocs, pas seulement le premier. La récup active (petit trot) garde le corps prêt à repartir. Si tu finis le 3e bloc en ayant l'impression de pouvoir en faire un 4e, c'est réussi.",
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
    interet: "La pyramide fait travailler l'allure course tout en variant les distances : le corps ne s'installe jamais dans une routine, et la tête reste occupée à gérer chaque palier. Un excellent moyen de faire du volume qualitatif sans répéter dix fois la même chose.",
    periode: "En milieu de préparation, quand tu veux du volume à allure soutenue sans la monotonie d'une séance uniforme. Une fois par semaine, à la place d'un fractionné long classique.",
    pour_qui: "Les coureurs confirmés qui aiment jouer avec les allures et les sensations. La variété est ludique mais demande un peu d'expérience pour bien doser chaque palier.",
    conseils: "Garde une allure homogène sur tous les paliers (ne pars pas plus vite sur les 800). Le 1500 au sommet est le plus dur, mentalement surtout : accroche-toi, après ça redescend. Récup à trottiner entre chaque.",
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
    interet: "Le seuil, c'est l'allure où ton corps évacue le lactate aussi vite qu'il le produit — juste avant que ça bascule dans le rouge. La travailler, c'est repousser ce point de bascule : le meilleur rapport bénéfice/fatigue de toute la préparation. La séance qui fait le plus progresser pour le moins de casse.",
    periode: "Presque toute l'année : c'est la base d'une préparation du 10 km au semi-marathon. Une fois par semaine, en routine, sans jamais vraiment s'arrêter.",
    pour_qui: "Tous les niveaux, dès que tu as une petite base d'endurance. L'allure s'adapte à ton niveau : le seuil de chacun est différent, l'important c'est la sensation.",
    conseils: "Cours à une allure « confortablement difficile » : tu pourrais lâcher trois mots, pas une phrase entière. L'erreur classique, c'est de partir trop vite et de transformer le seuil en course. Reste patient, ça doit rester tenable.",
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
    interet: "L'endurance fondamentale, c'est le moteur aérobie qui se construit lentement : plus de capillaires, un cœur plus efficace, des jambes qui durent. C'est la majorité de ton volume et le socle sur lequel tout le reste s'appuie. Sans elle, les séances rapides ne servent à rien.",
    periode: "Toute l'année, tout le temps. C'est le pain quotidien : la plupart de tes sorties devraient ressembler à ça. Parfaite en lendemain de séance dure ou de course, pour récupérer en bougeant.",
    pour_qui: "Absolument tout le monde, du grand débutant au marathonien confirmé. Personne n'est trop fort pour l'endurance fondamentale — les meilleurs en font même le plus.",
    conseils: "Cours VRAIMENT facile. Le test : si tu peux tenir une conversation complète, c'est bon. Si tu es essoufflé, ralentis, même si ton ego proteste. L'endurance fondamentale mal courue (trop vite) est l'erreur numéro un des coureurs.",
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
