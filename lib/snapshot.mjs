/* ==========================================================================
   LA GAMBERGE — CACHE "DERNIÈRE VALEUR CONNUE" DU STREAK (côté serveur)
   --------------------------------------------------------------------------
   Persiste le dernier calcul Strava RÉUSSI dans Supabase (table
   streak_snapshot, une seule ligne). Ce snapshot devient la valeur par défaut
   fraîche renvoyée au chargement suivant : plus jamais de chiffre vieux de
   plusieurs jours en attendant que la sync Strava live confirme/actualise.

   Strava reste la source de vérité ; ceci n'est qu'un cache de secours qui
   ne fige jamais rien (il est réécrit à chaque sync réussie). I/O pure : si
   Supabase n'est pas configuré, tout est un no-op silencieux (robustesse
   d'abord — la page ne plante jamais).
   ========================================================================== */

// La table est un singleton : une seule ligne id = 1.
const ROW_ID = 1;
const TABLE = 'streak_snapshot';

function supabaseConfig(env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

/**
 * Lit le dernier snapshot connu.
 * @returns {Promise<{data: object, updatedAt: string}|null>}
 *   null si Supabase n'est pas configuré, si la table est vide, ou en cas
 *   d'erreur (jamais d'exception : le cache est du bonus, pas un point dur).
 */
export async function readSnapshot(env) {
  const cfg = supabaseConfig(env);
  if (!cfg) return null;
  try {
    const r = await fetch(
      `${cfg.url}/rest/v1/${TABLE}?id=eq.${ROW_ID}&select=data,updated_at`,
      {
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
          Accept: 'application/json',
        },
      }
    );
    if (!r.ok) return null;
    const rows = await r.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return { data: rows[0].data, updatedAt: rows[0].updated_at };
  } catch {
    return null;
  }
}

/**
 * Écrit (upsert) le snapshot courant. Appelé après chaque sync Strava réussie.
 * Ne lève jamais : un échec d'écriture n'empêche pas de renvoyer la réponse.
 * @returns {Promise<boolean>} true si l'écriture a réussi.
 */
export async function writeSnapshot(env, data) {
  const cfg = supabaseConfig(env);
  if (!cfg) return false;
  try {
    const r = await fetch(`${cfg.url}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
        // upsert sur la clé primaire (id) : on écrase toujours la ligne unique.
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ id: ROW_ID, data, updated_at: new Date().toISOString() }),
    });
    return r.ok || r.status === 201;
  } catch {
    return false;
  }
}
