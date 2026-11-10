// Fonction serverless Vercel : GET /api/instagram-etat
// Surveillance du relevé Instagram automatique, lisible par tous (aucun
// secret, aucun chiffre qui ne soit déjà sur le site) : date du dernier
// relevé réussi, état du dernier passage, échecs consécutifs, échéance du
// jeton. `alerte: true` dès qu'une action d'Alex est nécessaire.

import { lireSuivi } from '../lib/instagram-store.mjs';

const JOUR = 24 * 3600 * 1000;

export function resumerSuivi(suivi, maintenant = Date.now()) {
  if (!suivi?.data) return { ok: false, alerte: true, raison: 'aucun_passage_enregistre' };
  const d = suivi.data;
  const joursSansReleve = d.dernierReleve ? Math.floor((maintenant - Date.parse(d.dernierReleve)) / JOUR) : null;
  const joursSansPassage = suivi.passeLe ? Math.floor((maintenant - Date.parse(suivi.passeLe)) / JOUR) : null;
  const raisons = [];
  if (d.etat !== 'releve_enregistre') raisons.push(`dernier_passage_${d.etat}`);
  if (joursSansPassage !== null && joursSansPassage >= 2) raisons.push('tache_planifiee_muette');
  if (d.jeton?.alerte) raisons.push('jeton_bientot_expire_ou_invalide');
  if (d.construction === 'echec') raisons.push('reconstruction_en_echec');
  return {
    ok: raisons.length === 0,
    alerte: raisons.length > 0,
    raisons,
    dernierPassage: suivi.passeLe,
    etat: d.etat,
    echecsConsecutifs: d.echecsConsecutifs ?? null,
    dernierReleve: d.dernierReleve ?? null,
    joursSansReleve,
    construction: d.construction ?? null,
    jeton: d.jeton ? { type: d.jeton.type ?? null, valide: d.jeton.valide ?? null, expireLe: d.jeton.expireLe ?? null, accesDonneesExpireLe: d.jeton.accesDonneesExpireLe ?? null, joursRestants: d.jeton.joursRestants ?? null, connu: d.jeton.connu } : null,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const suivi = await lireSuivi(process.env);
  res.status(200).json(resumerSuivi(suivi));
}
