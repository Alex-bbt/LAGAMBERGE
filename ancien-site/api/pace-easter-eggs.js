// Fonction serverless Vercel : GET /api/pace-easter-eggs
// Renvoie la liste des « easter eggs » d'allure stockés dans Supabase
// (table `pace_easter_eggs`). Le calculateur d'allure lit cette liste et
// déclenche un message quand l'allure saisie tombe dans une plage.
//
// Objectif : pouvoir AJOUTER de nouveaux messages directement dans Supabase,
// sans toucher au code. Rien n'est codé en dur ici.
//
// Si Supabase n'est pas configuré (variables d'env absentes), renvoie
// { configured: false, eggs: [] } → le calculateur fonctionne quand même,
// simplement sans easter eggs. Ne plante jamais la page.
//
// La clé service_role reste côté serveur : elle n'est JAMAIS envoyée au
// navigateur. On ne renvoie au client que les colonnes utiles au déclenchement.

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Pas encore branché : le calculateur tourne sans easter eggs.
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ configured: false, eggs: [] });
    return;
  }

  try {
    // On ne récupère que les colonnes nécessaires au déclenchement côté client.
    const select =
      'distance_m,pace_min_sec_per_km,pace_max_sec_per_km,message';
    const r = await fetch(
      `${url}/rest/v1/pace_easter_eggs?select=${encodeURIComponent(select)}`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Accept: 'application/json',
        },
      }
    );

    if (!r.ok) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ configured: false, eggs: [], error: 'db' });
      return;
    }

    const rows = await r.json();
    const eggs = (Array.isArray(rows) ? rows : [])
      .map((row) => ({
        distance_m:
          row.distance_m === null || row.distance_m === undefined
            ? null
            : Number(row.distance_m),
        pace_min: Number(row.pace_min_sec_per_km),
        pace_max: Number(row.pace_max_sec_per_km),
        message: String(row.message || ''),
      }))
      // On ignore les lignes incomplètes plutôt que de casser le front.
      .filter(
        (e) =>
          Number.isFinite(e.pace_min) &&
          Number.isFinite(e.pace_max) &&
          e.message
      );

    // Les easter eggs bougent rarement : petit cache CDN, rafraîchi en fond,
    // pour qu'un nouveau message ajouté dans Supabase apparaisse très vite.
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=30, stale-while-revalidate=300'
    );
    res.status(200).json({ configured: true, eggs });
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ configured: false, eggs: [], error: 'network' });
  }
}
