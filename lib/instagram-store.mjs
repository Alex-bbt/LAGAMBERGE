/* ==========================================================================
   LA GAMBERGE — STOCKAGE INSTAGRAM (Supabase, projet lagamberge-db)
   --------------------------------------------------------------------------
   Tables accessibles UNIQUEMENT avec la clé service (RLS activé, aucune
   politique publique) :
     - instagram_snapshot   : le dernier bilan RÉUSSI (une ligne) ; jamais
                              écrasé par un échec, il garde sa vraie date ;
     - instagram_historique : un bilan par jour (suivi et comparaisons) ;
     - instagram_suivi      : le compte rendu du dernier passage, réussi ou
                              non (état, état du jeton, échecs consécutifs).
   (instagram_jeton n'est plus utilisée : le jeton reste dans Vercel.)
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

/** Compte rendu du dernier passage : { data, passeLe } ou null. */
export async function lireSuivi(env, fetchFn) {
  const l = await lireLigne(env, 'instagram_suivi', 'data,passe_le', fetchFn);
  return l ? { data: l.data, passeLe: l.passe_le } : null;
}

export function ecrireSuivi(env, data, fetchFn) {
  return upsert(env, 'instagram_suivi', { id: 1, data, passe_le: new Date().toISOString() }, fetchFn);
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
