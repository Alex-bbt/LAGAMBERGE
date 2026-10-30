/* ==========================================================================
   LA GAMBERGE — STOCKAGE INSTAGRAM (Supabase, projet lagamberge-db)
   --------------------------------------------------------------------------
   Trois tables, accessibles UNIQUEMENT avec la clé service (RLS activé, aucune
   politique publique) :
     - instagram_jeton      : le jeton d'accès courant (il change à chaque
                              renouvellement, d'où son stockage ici plutôt que
                              dans une variable Vercel figée) ;
     - instagram_snapshot   : le dernier bilan calculé (une ligne) ;
     - instagram_historique : un bilan par jour (suivi et comparaisons).
   Même principe que lib/snapshot.mjs : appels REST, jamais d'exception.
   ========================================================================== */

function config(env) {
  const url = env.SUPABASE_URL;
  const cle = env.SUPABASE_SERVICE_ROLE_KEY;
  return url && cle ? { url, cle } : null;
}

const entetes = (cfg, extra = {}) => ({
  apikey: cfg.cle,
  Authorization: `Bearer ${cfg.cle}`,
  Accept: 'application/json',
  ...extra,
});

async function lireLigne(env, table, colonnes, fetchFn = fetch) {
  const cfg = config(env);
  if (!cfg) return null;
  try {
    const r = await fetchFn(`${cfg.url}/rest/v1/${table}?id=eq.1&select=${colonnes}`, { headers: entetes(cfg) });
    if (!r.ok) return null;
    const lignes = await r.json();
    return Array.isArray(lignes) && lignes[0] ? lignes[0] : null;
  } catch {
    return null;
  }
}

async function upsert(env, table, ligne, fetchFn = fetch, conflit) {
  const cfg = config(env);
  if (!cfg) return false;
  try {
    const r = await fetchFn(`${cfg.url}/rest/v1/${table}${conflit ? `?on_conflict=${conflit}` : ''}`, {
      method: 'POST',
      headers: entetes(cfg, { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify(ligne),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** Jeton courant enregistré : { jeton, expireLe, renouveleLe } ou null. */
export async function lireJeton(env, fetchFn) {
  const l = await lireLigne(env, 'instagram_jeton', 'jeton,expire_le,renouvele_le', fetchFn);
  return l ? { jeton: l.jeton, expireLe: l.expire_le, renouveleLe: l.renouvele_le } : null;
}

export function ecrireJeton(env, { jeton, expireLe, renouveleLe }, fetchFn) {
  return upsert(env, 'instagram_jeton', { id: 1, jeton, expire_le: expireLe, renouvele_le: renouveleLe }, fetchFn);
}

/** Dernier bilan : { data, updatedAt } ou null. */
export async function lireSnapshotInstagram(env, fetchFn) {
  const l = await lireLigne(env, 'instagram_snapshot', 'data,updated_at', fetchFn);
  return l ? { data: l.data, updatedAt: l.updated_at } : null;
}

export async function ecrireBilan(env, bilan, fetchFn) {
  const maintenant = new Date().toISOString();
  const a = await upsert(env, 'instagram_snapshot', { id: 1, data: bilan, updated_at: maintenant }, fetchFn);
  const b = await upsert(env, 'instagram_historique', { jour: bilan.releveIso.slice(0, 10), data: bilan }, fetchFn, 'jour');
  return a && b;
}
