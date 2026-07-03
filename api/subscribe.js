// Fonction serverless Vercel : POST /api/subscribe
// Enregistre un inscrit à la newsletter dans la base Supabase.
// Si Supabase n'est pas configuré (variables d'env absentes), renvoie
// { ok:false, configured:false } → le formulaire affiche un message adapté.
// La clé Supabase reste côté serveur : elle n'est JAMAIS envoyée au navigateur.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method' });
    return;
  }

  // Corps de la requête (Vercel parse le JSON automatiquement, on sécurise).
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const email = String(body.email || '').trim().toLowerCase();
  const prenom = String(body.prenom || '').trim() || null;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    res.status(400).json({ ok: false, error: 'email' });
    return;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // Pas encore branché : on le dit clairement au formulaire.
    res.status(200).json({ ok: false, configured: false });
    return;
  }

  try {
    const r = await fetch(`${url}/rest/v1/subscribers`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email, prenom, source: 'site' }),
    });

    if (r.status === 201 || r.ok) {
      res.status(200).json({ ok: true });
      return;
    }
    // 409 = email déjà présent (contrainte unique) → on considère ça OK.
    if (r.status === 409) {
      res.status(200).json({ ok: true, already: true });
      return;
    }
    const detail = (await r.text()).slice(0, 200);
    res.status(200).json({ ok: false, error: 'db', detail });
  } catch (err) {
    res.status(200).json({ ok: false, error: 'network' });
  }
}
