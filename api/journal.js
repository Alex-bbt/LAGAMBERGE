// Fonction serverless Vercel : GET /api/journal
// Lit le carnet de bord depuis Supabase : les catégories (journal_categories)
// et les jours spéciaux (journal_entries). Lecture seule.
//
// Le contenu est géré à la main dans le Table Editor de Supabase — aucune
// écriture ici, aucune interface d'admin sur le site. La clé Supabase reste
// côté serveur (jamais exposée au navigateur), comme pour la newsletter.
//
// Résilience : si Supabase n'est pas configuré (variables d'env absentes) ou
// injoignable, on renvoie des listes vides avec `configured:false` → le carnet
// s'affiche quand même (juste la heatmap de distance), sans jamais planter.

export default async function handler(req, res) {
  const empty = { configured: false, categories: [], entries: [] };

  if (req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    res.status(405).json({ ...empty, method: req.method });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // Pas encore branché : le carnet retombe sur la seule heatmap de distance.
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(empty);
    return;
  }

  try {
    const headers = {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    };

    // Deux lectures en parallèle : catégories + entrées (triées par date).
    const [catRes, entRes] = await Promise.all([
      fetch(`${url}/rest/v1/journal_categories?select=id,nom,couleur`, { headers }),
      fetch(
        `${url}/rest/v1/journal_entries?select=id,date,categorie_id,titre,texte,lien_media,type_media&order=date.asc`,
        { headers }
      ),
    ]);

    if (!catRes.ok || !entRes.ok) throw new Error('supabase_read');

    const categories = await catRes.json();
    const entries = await entRes.json();

    // On ne met en cache QUE les réponses réussies. Cache court (2 min) pour
    // que les ajouts faits dans Supabase apparaissent vite ; SWR long pour
    // servir instantanément la dernière bonne réponse.
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=86400');
    res.status(200).json({
      configured: true,
      categories: Array.isArray(categories) ? categories : [],
      entries: Array.isArray(entries) ? entries : [],
    });
  } catch (err) {
    // Jamais bloquant : on garde la heatmap, sans les jours spéciaux.
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ...empty, error: 'journal_unavailable' });
  }
}
