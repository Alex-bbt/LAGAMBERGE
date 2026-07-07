/* ==========================================================================
   LA GAMBERGE — OUTILS COUREUR : classement barème FFA (logique PURE)
   --------------------------------------------------------------------------
   Classe un chrono dans la pyramide officielle de la Fédération Française
   d'Athlétisme (de D7, le plus bas, à IA, le plus haut), regroupée en 5
   « étages » : Départemental → Régional → Interrégional → National →
   International.

   Aucune I/O : les barèmes viennent de Supabase (table `ffa_baremes`, lue par
   api/ffa.js). Ce module reçoit les lignes déjà chargées et fait tout le calcul.
   Importable côté client (bundlé par Vite dans le <script> du composant) ET
   côté Node (tests). Même convention que les autres modules `lib/running/*`.

   RÈGLE MÉTIER : un `temps_sec` est un MAXIMUM à ne pas dépasser pour obtenir
   le niveau. Plus le temps est bas, meilleur est le niveau. Un coureur obtient
   un niveau si son chrono est ≤ au seuil ; son niveau retenu est le meilleur
   (seuil le plus bas) qu'il atteint encore.
   ========================================================================== */

// -- Registre des épreuves (clés = valeurs de la colonne `epreuve` en base) --
// L'ordre = l'ordre d'affichage dans le sélecteur.
export const FFA_EPREUVES = [
  { key: '5km', label: '5 km', meters: 5000 },
  { key: '10km', label: '10 km', meters: 10000 },
  { key: '15km', label: '15 km', meters: 15000 },
  { key: '20km', label: '20 km', meters: 20000 },
  { key: 'semi-marathon', label: 'Semi-marathon', meters: 21097.5 },
  { key: 'marathon', label: 'Marathon', meters: 42195 },
];

export const ffaEpreuveByKey = (key) => FFA_EPREUVES.find((e) => e.key === key) || null;

// -- Les 5 étages, du plus haut (rang 0) au plus bas (rang 4) ---------------
// `key` = valeur de la colonne `etage` en base (sans accents). `label` = affichage.
export const FFA_ETAGES = [
  { key: 'International', label: 'International', rank: 0 },
  { key: 'National', label: 'National', rank: 1 },
  { key: 'Interregional', label: 'Interrégional', rank: 2 },
  { key: 'Regional', label: 'Régional', rank: 3 },
  { key: 'Departemental', label: 'Départemental', rank: 4 },
];

const ETAGE_BY_KEY = Object.fromEntries(FFA_ETAGES.map((e) => [e.key, e]));

// Rang d'un étage (0 = sommet). Inconnu → très bas, pour ne jamais planter.
export function etageRankOf(key) {
  const e = ETAGE_BY_KEY[key];
  return e ? e.rank : 99;
}

export function etageLabelOf(key) {
  const e = ETAGE_BY_KEY[key];
  return e ? e.label : key;
}

// -- Tri : du meilleur niveau (seuil le plus bas) au moins bon --------------
export function sortByLevel(rows) {
  return [...rows].sort((a, b) => a.temps_sec - b.temps_sec);
}

// -- Regroupement pour la pyramide : { etageKey -> [niveaux triés best→worst] }
// Renvoie un tableau d'étages (ordre FFA_ETAGES) avec leurs niveaux présents.
export function groupByEtage(rows) {
  const sorted = sortByLevel(rows);
  return FFA_ETAGES.map((et) => ({
    ...et,
    niveaux: sorted.filter((r) => r.etage === et.key),
  })).filter((g) => g.niveaux.length > 0);
}

/* --------------------------------------------------------------------------
   classifyFFA(rows, tempsSec)
   rows      : lignes ffa_baremes pour UN sexe + UNE épreuve
   tempsSec  : chrono du coureur, en secondes
   Renvoie :
     {
       sorted      : lignes triées (meilleur → moins bon),
       current     : ligne du niveau atteint (ou null),
       status      : 'ok' | 'top' | 'below' | 'empty' | 'invalid',
       nextNiveau  : ligne du niveau juste au-dessus (ou null),
       nextEtage   : ligne d'entrée de l'étage supérieur (ou null),
     }
   - status 'top'   : déjà au meilleur niveau possible (IA).
   - status 'below' : plus lent que le niveau le plus bas (sous D7). `nextNiveau`
                      pointe alors vers ce niveau le plus bas (objectif d'entrée).
   - status 'empty' : aucun barème fourni.
   - status 'invalid': chrono absent/incohérent.
   -------------------------------------------------------------------------- */
export function classifyFFA(rows, tempsSec) {
  const sorted = sortByLevel(rows || []);
  if (!sorted.length) {
    return { sorted, current: null, status: 'empty', nextNiveau: null, nextEtage: null };
  }
  if (!Number.isFinite(tempsSec) || tempsSec <= 0) {
    return { sorted, current: null, status: 'invalid', nextNiveau: null, nextEtage: null };
  }

  // Meilleur niveau atteint = premier seuil (trié croissant) encore ≥ au chrono.
  const i = sorted.findIndex((r) => r.temps_sec >= tempsSec);

  // Aucun seuil ≥ chrono → plus lent que le niveau le plus bas (sous D7).
  if (i === -1) {
    return {
      sorted,
      current: null,
      status: 'below',
      nextNiveau: sorted[sorted.length - 1], // le plus bas : objectif d'entrée
      nextEtage: null,
    };
  }

  const current = sorted[i];
  const nextNiveau = i > 0 ? sorted[i - 1] : null;

  // Étage supérieur : en remontant, la première ligne d'un étage mieux classé.
  // Comme les lignes remontent du moins bon au meilleur, la première rencontrée
  // dans l'étage du dessus en est bien l'entrée (le seuil le plus accessible).
  const curRank = etageRankOf(current.etage);
  let nextEtage = null;
  for (let j = i - 1; j >= 0; j--) {
    if (etageRankOf(sorted[j].etage) < curRank) {
      nextEtage = sorted[j];
      break;
    }
  }

  return {
    sorted,
    current,
    status: nextNiveau ? 'ok' : 'top',
    nextNiveau,
    nextEtage,
  };
}
