// Fonction serverless Vercel : GET /api/strava-sync
// Lancée chaque jour par la tâche planifiée Vercel (vercel.json → crons).
// Actualise le bilan du défi (Strava → streak_snapshot) même sans visite de
// /defi-2026 : sans elle, le bilan n'était recalculé qu'à l'ouverture de la
// page et pouvait afficher une synchronisation vieille de plusieurs jours.
// Refuse tout appel sans le secret de la tâche planifiée (CRON_SECRET).
// En cas d'échec Strava, le dernier bilan reste en place avec sa vraie date.

import { getStreakFromStrava } from '../lib/strava.mjs';
import { writeSnapshot } from '../lib/snapshot.mjs';

const journal = (etat, details = {}) => console.log(JSON.stringify({ tache: 'strava-sync', etat, ...details }));

export function creerHandler({ env, strava = getStreakFromStrava, ecrire = writeSnapshot }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const secret = env.CRON_SECRET;
    if (!secret || req.headers?.authorization !== `Bearer ${secret}`) {
      journal('refus');
      res.status(401).json({ ok: false, error: 'non_autorise' });
      return;
    }
    try {
      const data = await strava(env);
      if (!data?.configured) {
        journal('non_configure');
        res.status(200).json({ ok: false, configured: false });
        return;
      }
      const ecrit = await ecrire(env, data);
      journal(ecrit ? 'bilan_enregistre' : 'bilan_non_enregistre', { jour: data.today, joursValides: data.validatedCount });
      res.status(200).json({ ok: ecrit, jour: data.today, joursValides: data.validatedCount, updatedAt: data.updatedAt });
    } catch (e) {
      journal('echec_strava', { erreur: String(e?.message || e) });
      res.status(200).json({ ok: false, error: 'strava_indisponible' });
    }
  };
}

export default function handler(req, res) {
  return creerHandler({ env: process.env })(req, res);
}
