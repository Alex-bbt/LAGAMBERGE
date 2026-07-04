// Fonction serverless Vercel : GET /api/workouts
// Renvoie la bibliothèque de séances lue en direct depuis Supabase :
//   { configured:true, categories:[...], workouts:[...] }
// où chaque workout embarque sa catégorie et ses recommandations d'allure.
//
// Si Supabase n'est pas configuré (variables d'env absentes) ou en cas d'erreur,
// renvoie { configured:false } → le site retombe sur les séances de secours
// (src/data/workouts.js). Ne plante jamais la page.
//
// Lecture seule : les tables ont une policy de lecture publique. La clé reste
// côté serveur (jamais exposée au navigateur), comme pour la newsletter.
//
// On lit les 3 tables séparément puis on assemble côté serveur (catégorie +
// guidance rattachées à chaque séance). Volontairement SANS embedding PostgREST
// : c'est plus robuste (aucune dépendance à la détection des clés étrangères).

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ configured: false });
    return;
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' };
  const get = (path) => fetch(`${url}/rest/v1/${path}`, { headers });

  try {
    const [cRes, wRes, gRes] = await Promise.all([
      get('workout_categories?select=id,nom,description&order=nom.asc'),
      get('workouts?select=id,titre,description,categorie_id,distance_cible_m,structure,created_at&order=created_at.desc'),
      get('workout_pace_guidance?select=id,workout_id,objectif_label,allure_recommandee_sec_par_km'),
    ]);

    if (!cRes.ok || !wRes.ok || !gRes.ok) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ configured: false, error: 'db' });
      return;
    }

    const categories = await cRes.json();
    const rawWorkouts = await wRes.json();
    const guidance = await gRes.json();

    // Assemblage : on rattache la catégorie et la liste des objectifs d'allure.
    const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
    const guidanceByWorkout = {};
    for (const g of guidance) {
      (guidanceByWorkout[g.workout_id] ||= []).push({
        id: g.id,
        objectif_label: g.objectif_label,
        allure_recommandee_sec_par_km: g.allure_recommandee_sec_par_km,
      });
    }

    const workouts = rawWorkouts.map((w) => ({
      ...w,
      categorie: catById[w.categorie_id] || null,
      guidance: guidanceByWorkout[w.id] || [],
    }));

    // On ne met en cache QUE les réponses réussies (le contenu bouge rarement).
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    res.status(200).json({ configured: true, categories, workouts });
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ configured: false, error: 'network' });
  }
}
