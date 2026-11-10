// Fonction serverless Vercel : GET /api/instagram-sync
// Lancée chaque jour par la tâche planifiée Vercel (vercel.json → crons).
//
// 1. Refuse tout appel sans le secret de la tâche planifiée (CRON_SECRET) :
//    l'URL n'est pas un point d'accès public.
// 2. Lit la base lagamberge-db à chaque passage : cette activité quotidienne
//    évite aussi la mise en pause automatique du projet Supabase gratuit.
// 3. Vérifie le jeton auprès de Meta (debug_token) : type, expiration, fin
//    d'accès aux données → alerte ALERTE_JOURS jours avant l'échéance.
// 4. Calcule le bilan (lib/instagram.mjs) et l'enregistre (snapshot + historique).
//    En cas d'échec, le dernier bilan réussi reste en place avec sa vraie date.
// 5. Si INSTAGRAM_DEPLOY_HOOK est défini, relance la construction du site pour
//    qu'il affiche les nouveaux chiffres.
// 6. Écrit le compte rendu du passage dans instagram_suivi (lu par
//    /api/instagram-etat) : les journaux Vercel Hobby ne durent qu'une heure.
// Le jeton n'apparaît jamais dans une réponse, un journal ou la base.

import { synchroniserInstagram, verifierJeton, etatJeton } from '../lib/instagram.mjs';
import { lireSnapshotInstagram, ecrireBilan, lireSuivi, ecrireSuivi } from '../lib/instagram-store.mjs';

// Compte rendu dans les journaux Vercel (jamais le jeton).
const journal = (etat, details = {}) => console.log(JSON.stringify({ tache: 'instagram-sync', etat, ...details }));

const DELAI_HOOK_MS = 10_000;

const STORE = { lireSnapshotInstagram, ecrireBilan, lireSuivi, ecrireSuivi };

export function creerHandler({ env, fetchFn = fetch, maintenant = () => Date.now(), synchroniser = synchroniserInstagram, verifier = verifierJeton, store = STORE }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const secret = env.CRON_SECRET;
    if (!secret || req.headers?.authorization !== `Bearer ${secret}`) {
      journal('refus', { secretConfigure: Boolean(secret), entete: Boolean(req.headers?.authorization) });
      res.status(401).json({ ok: false, error: 'non_autorise' });
      return;
    }

    const t = maintenant();
    // Activité quotidienne sur la base, et état précédent pour le compte rendu.
    const precedent = await store.lireSnapshotInstagram(env, fetchFn);
    const suiviPrecedent = await store.lireSuivi(env, fetchFn);
    const echecsAvant = suiviPrecedent?.data?.echecsConsecutifs || 0;
    const dernierReleve = precedent?.data?.releveIso || null;

    const terminer = async (statut, etat, details) => {
      const echecsConsecutifs = etat === 'releve_enregistre' ? 0 : echecsAvant + 1;
      const compteRendu = { etat, echecsConsecutifs, dernierReleve, ...details };
      await store.ecrireSuivi(env, compteRendu, fetchFn);
      journal(etat, compteRendu);
      res.status(statut).json({ ok: etat === 'releve_enregistre', ...compteRendu });
    };

    const jeton = env.INSTAGRAM_ACCESS_TOKEN;
    if (!jeton) {
      await terminer(200, 'sans_jeton', { base: precedent ? 'lue' : 'vide' });
      return;
    }

    // Jeton d'app facultatif : permet à Meta de décrire un jeton de Page.
    const jetonApp = env.INSTAGRAM_APP_ID && env.INSTAGRAM_APP_SECRET ? `${env.INSTAGRAM_APP_ID}|${env.INSTAGRAM_APP_SECRET}` : null;
    const etatDuJeton = etatJeton(await verifier(fetchFn, jeton, jetonApp), t);
    if (etatDuJeton.alerte) journal('alerte_jeton', { jeton: etatDuJeton });

    let bilan;
    try {
      bilan = await synchroniser({ fetchFn, jeton, idCompte: env.INSTAGRAM_USER_ID, maintenant: t });
    } catch (e) {
      const masquer = (x) => String(x).split(jeton).join('***');
      await terminer(200, 'echec_meta', {
        jeton: etatDuJeton,
        erreur: masquer(e.message || e),
        code: e.code ?? null,
        statut: e.statut ?? null,
        compteConfigure: Boolean(env.INSTAGRAM_USER_ID),
        diagnostic: e.diagnostic ? JSON.parse(masquer(JSON.stringify(e.diagnostic))) : null,
      });
      return;
    }
    const ecrit = await store.ecrireBilan(env, { ...bilan, jeton: etatDuJeton }, fetchFn);

    // Le Deploy Hook peut mettre une vingtaine de secondes à répondre (constaté
    // le 30/10/2026) : on n'attend pas plus de 10 s. Sans réponse, la demande
    // est en général déjà prise en compte par Vercel.
    let construction = 'non_configuree';
    if (env.INSTAGRAM_DEPLOY_HOOK && ecrit) {
      try {
        const r = await fetchFn(env.INSTAGRAM_DEPLOY_HOOK, { method: 'POST', signal: AbortSignal.timeout(DELAI_HOOK_MS) });
        construction = r.ok ? 'relancee' : 'echec';
      } catch (e) {
        construction = e?.name === 'TimeoutError' ? 'demandee_sans_reponse' : 'echec';
      }
    }

    await terminer(200, ecrit ? 'releve_enregistre' : 'releve_non_enregistre', {
      dernierReleve: ecrit ? bilan.releveIso : dernierReleve,
      construction,
      jeton: etatDuJeton,
      abonnes: bilan.abonnes,
      publications2026: bilan.publications2026,
      publicationsAvecStats: bilan.publicationsAvecStats,
      vuesCompte: bilan.vuesCompte2026 !== null,
      interactionsCompte: bilan.interactionsCompte2026 !== null,
      audience: Boolean(bilan.audience?.genre),
    });
  };
}

export default function handler(req, res) {
  return creerHandler({ env: process.env })(req, res);
}
