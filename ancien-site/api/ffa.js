// Fonction serverless Vercel : GET /api/ffa
// Renvoie le barème de niveau FFA lu en direct depuis Supabase :
//   { configured:true, rows:[ { sexe, epreuve, distance_m, niveau, etage,
//                               points, temps_sec }, ... ] }
//
// Si Supabase n'est pas configuré (variables d'env absentes) ou en cas d'erreur,
// renvoie { configured:false } → le composant affiche un état « indisponible »
// sans jamais planter la page.
//
// Lecture seule : la table `ffa_baremes` a une policy de lecture publique. La
// clé reste côté serveur (jamais exposée au navigateur), comme la newsletter et
// la bibliothèque de séances. Le barème est quasi statique → cache long.

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ configured: false });
    return;
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' };
  // Trié du meilleur niveau (temps le plus bas) au moins bon : le composant
  // s'appuie sur cet ordre, mais retrie de toute façon par sécurité.
  const query =
    'ffa_baremes?select=sexe,epreuve,distance_m,niveau,etage,points,temps_sec' +
    '&order=sexe.asc,epreuve.asc,temps_sec.asc';

  try {
    const r = await fetch(`${url}/rest/v1/${query}`, { headers });
    if (!r.ok) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ configured: false, error: 'db' });
      return;
    }
    const rows = await r.json();

    // On ne met en cache QUE les réponses réussies. Le barème ne bouge (quasi)
    // jamais → cache long côté CDN, revalidation en arrière-plan.
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({ configured: true, rows });
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ configured: false, error: 'network' });
  }
}
