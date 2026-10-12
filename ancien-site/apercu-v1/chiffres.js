/* ==========================================================================
   LA GAMBERGE — LES CHIFFRES QUI BOUGENT
   --------------------------------------------------------------------------
   C'est le SEUL fichier à ouvrir pour la mise à jour mensuelle (10 minutes) :
     1. Change la date de « dateChiffres » (elle s'affiche sous les chiffres).
     2. Mets à jour les paliers d'abonnés et les vues de l'année.
     3. Sauvegarde : le site se met à jour au prochain déploiement.

   Règles de la charte :
   - Que des chiffres vérifiés. Les abonnés se donnent en PALIERS
     (« 10 000+ »), jamais au chiffre près.
   - Tant qu'une valeur vaut null, le site affiche un emplacement
     [CHIFFRE À CONFIRMER] bien visible : rien n'est inventé.
   - Écris les valeurs comme tu veux les voir à l'écran, entre guillemets :
     "10 000+", "12,3 M", "2 019"…
   ========================================================================== */

export const chiffres = {
  // Date affichée dans les sources : « Meta · au 12 octobre 2026 ».
  // Écris-la en toutes lettres, exactement comme elle doit apparaître.
  dateChiffres: null, // ex. "12 octobre 2026"

  // L'année des vues annuelles (« vues Instagram en 2026 »).
  annee: 2026,

  // -- Chapitre 2 : le créateur ---------------------------------------------
  instagram: {
    abonnes: null, // palier, ex. "10 000+"
    vuesAnnee: null, // ex. "12,3 M"
  },
  tiktok: {
    abonnes: null, // palier
    vuesAnnee: null,
  },

  // -- Chapitre 3 : Back to Run ---------------------------------------------
  backToRun: {
    inscrits: null,
    kmCommunaute: null,
    actifsParJour: null,
  },

  // -- Chapitre 1 : le streak (secours) -------------------------------------
  // Le compteur se met à jour tout seul depuis Strava (fonction /api/streak).
  // Cette valeur ne sert que si Strava ne répond pas. null = emplacement visible.
  streakSecours: null, // ex. "285"
};
