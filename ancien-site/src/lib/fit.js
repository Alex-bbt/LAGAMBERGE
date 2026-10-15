/* ==========================================================================
   LA GAMBERGE — ENCODEUR .FIT (côté navigateur, zéro dépendance)
   --------------------------------------------------------------------------
   Génère un fichier .FIT de type "workout" (séance structurée) standard,
   lisible par Garmin Connect et Coros (format universel, pas de marque).

   Structure d'un fichier FIT :
     [ en-tête 14 o ] [ messages : définitions + données ] [ CRC 2 o ]
   On écrit 3 types de messages du profil FIT :
     - file_id (global 0)      → « ceci est un fichier workout »
     - workout (global 26)     → sport, nombre d'étapes, nom
     - workout_step (global 27)→ une ligne par étape (effort, récup, répétition…)

   Tout est en little-endian. Les valeurs "absentes" utilisent les valeurs
   invalides du protocole (0xFF, 0xFFFF, 0xFFFFFFFF…).
   ========================================================================== */

// Époque FIT : secondes entre 1970-01-01 et 1989-12-31 00:00:00 UTC.
const FIT_EPOCH = 631065600;

// Types de base FIT (octet = capacité endian + numéro de type).
const T = { ENUM: 0x00, UINT8: 0x02, UINT16: 0x84, UINT32: 0x86, UINT32Z: 0x8c, STRING: 0x07 };

// Longueurs fixes des champs texte (octets, terminaison nulle incluse).
const NAME_LEN = 32;
const STEP_NAME_LEN = 24;

// ---- CRC-16 FIT -----------------------------------------------------------
const CRC_TABLE = [
  0x0000, 0xcc01, 0xd801, 0x1400, 0xf001, 0x3c00, 0x2800, 0xe401,
  0xa001, 0x6c00, 0x7800, 0xb401, 0x5000, 0x9c01, 0x8801, 0x4400,
];
function crc16(bytes, start = 0, end = bytes.length) {
  let crc = 0;
  for (let i = start; i < end; i++) {
    const b = bytes[i];
    let tmp = CRC_TABLE[crc & 0xf];
    crc = ((crc >> 4) & 0x0fff) ^ tmp ^ CRC_TABLE[b & 0xf];
    tmp = CRC_TABLE[crc & 0xf];
    crc = ((crc >> 4) & 0x0fff) ^ tmp ^ CRC_TABLE[(b >> 4) & 0xf];
  }
  return crc & 0xffff;
}

// ---- Petit écrivain d'octets (little-endian) ------------------------------
class Writer {
  constructor() { this.b = []; }
  u8(v) { this.b.push(v & 0xff); }
  u16(v) { this.u8(v); this.u8(v >> 8); }
  u32(v) {
    // >>> 0 pour rester en entier non signé 32 bits
    v = v >>> 0;
    this.u8(v); this.u8(v >> 8); this.u8(v >> 16); this.u8(v >> 24);
  }
  // Chaîne à longueur fixe, encodée UTF-8, tronquée et terminée par un 0.
  str(s, size) {
    const enc = new TextEncoder().encode(String(s || ''));
    const max = size - 1; // garder au moins un octet nul final
    for (let i = 0; i < size; i++) this.u8(i < enc.length && i < max ? enc[i] : 0);
  }
}

function writeDef(w, localType, globalNum, fields) {
  w.u8(0x40 | localType); // en-tête de définition (bit 6 = 1)
  w.u8(0);                // réservé
  w.u8(0);                // architecture : 0 = little-endian
  w.u16(globalNum);
  w.u8(fields.length);
  for (const f of fields) { w.u8(f.num); w.u8(f.size); w.u8(f.type); }
}

// ---- Constantes du profil FIT (enums) -------------------------------------
const DURATION = { TIME: 0, DISTANCE: 1, OPEN: 5, REPEAT_UNTIL_STEPS: 6 };
const TARGET = { SPEED: 0, OPEN: 2 };
const INTENSITY = { ACTIVE: 0, REST: 1, WARMUP: 2, COOLDOWN: 3, RECOVERY: 4 };
const INVALID_U32 = 0xffffffff;

// ---- Traduction d'une séance perso → étapes FIT plates --------------------
// On aplatit la structure (les blocs de répétition deviennent leurs sous-étapes
// suivies d'une étape "repeat" qui reboucle sur l'index de la première).

function paceToSpeedTarget(paceSecPerKm) {
  // Fenêtre d'allure ±5 s/km → une zone de vitesse (mm/s) pour la montre.
  const p = Math.max(60, Number(paceSecPerKm) || 0);
  const slow = p + 5; // allure plus lente = vitesse plus basse
  const fast = Math.max(60, p - 5);
  return {
    targetType: TARGET.SPEED,
    targetValue: 0,
    customLow: Math.round((1000 / slow) * 1000),  // mm/s
    customHigh: Math.round((1000 / fast) * 1000),  // mm/s
  };
}

function durationOf(item) {
  if (item.duree_sec != null) return { durationType: DURATION.TIME, durationValue: Math.round(item.duree_sec * 1000) };
  if (item.distance_m != null) return { durationType: DURATION.DISTANCE, durationValue: Math.round(item.distance_m * 100) };
  return { durationType: DURATION.OPEN, durationValue: INVALID_U32 };
}

const STEP_META = {
  echauffement: { name: 'Echauffement', intensity: INTENSITY.WARMUP },
  effort: { name: 'Effort', intensity: INTENSITY.ACTIVE },
  recuperation: { name: 'Recup', intensity: INTENSITY.RECOVERY },
  retour_calme: { name: 'Retour calme', intensity: INTENSITY.COOLDOWN },
};

function simpleStep(item) {
  const meta = STEP_META[item.type] || { name: '', intensity: INTENSITY.ACTIVE };
  const dur = durationOf(item);
  let target = { targetType: TARGET.OPEN, targetValue: 0, customLow: INVALID_U32, customHigh: INVALID_U32 };
  if (item.type === 'effort' && item.allure_cible_sec_par_km) {
    target = paceToSpeedTarget(item.allure_cible_sec_par_km);
  }
  return { name: meta.name, intensity: meta.intensity, ...dur, ...target };
}

// Transforme la `structure` (potentiellement imbriquée) en liste d'étapes FIT.
export function flattenSteps(structure) {
  const steps = [];
  for (const item of structure || []) {
    if (item.type === 'repetition_bloc') {
      const from = steps.length; // index de la 1re sous-étape
      for (const sub of item.etapes || []) steps.push(simpleStep(sub));
      steps.push({
        name: '',
        intensity: INTENSITY.ACTIVE,
        durationType: DURATION.REPEAT_UNTIL_STEPS,
        durationValue: from,
        targetType: TARGET.OPEN,
        targetValue: Math.max(1, Number(item.nb_repetitions) || 1),
        customLow: INVALID_U32,
        customHigh: INVALID_U32,
      });
    } else {
      steps.push(simpleStep(item));
    }
  }
  return steps;
}

// ---- Encodage complet -----------------------------------------------------
export function encodeWorkoutFit({ name, structure }) {
  const steps = flattenSteps(structure);
  const w = new Writer();

  // 1) file_id (global 0), local 0
  writeDef(w, 0, 0, [
    { num: 0, size: 1, type: T.ENUM },     // type
    { num: 1, size: 2, type: T.UINT16 },   // manufacturer
    { num: 2, size: 2, type: T.UINT16 },   // product
    { num: 3, size: 4, type: T.UINT32Z },  // serial_number
    { num: 4, size: 4, type: T.UINT32 },   // time_created
  ]);
  w.u8(0);                                     // en-tête données (local 0)
  w.u8(5);                                     // type = workout
  w.u16(255);                                  // manufacturer = development
  w.u16(0);                                    // product
  w.u32(12345);                                // serial_number
  w.u32(Math.floor(Date.now() / 1000) - FIT_EPOCH); // time_created

  // 2) workout (global 26), local 1
  writeDef(w, 1, 26, [
    { num: 5, size: 1, type: T.ENUM },          // sport
    { num: 6, size: 2, type: T.UINT16 },        // num_valid_steps
    { num: 8, size: NAME_LEN, type: T.STRING }, // wkt_name
  ]);
  w.u8(1);                                     // en-tête données (local 1)
  w.u8(1);                                     // sport = running
  w.u16(steps.length);                         // num_valid_steps
  w.str(name, NAME_LEN);                        // wkt_name

  // 3) workout_step (global 27), local 2 — définition partagée par toutes les étapes
  writeDef(w, 2, 27, [
    { num: 254, size: 2, type: T.UINT16 },           // message_index
    { num: 0, size: STEP_NAME_LEN, type: T.STRING }, // wkt_step_name
    { num: 1, size: 1, type: T.ENUM },               // duration_type
    { num: 2, size: 4, type: T.UINT32 },             // duration_value
    { num: 3, size: 1, type: T.ENUM },               // target_type
    { num: 4, size: 4, type: T.UINT32 },             // target_value
    { num: 5, size: 4, type: T.UINT32 },             // custom_target_value_low
    { num: 6, size: 4, type: T.UINT32 },             // custom_target_value_high
    { num: 7, size: 1, type: T.ENUM },               // intensity
  ]);
  steps.forEach((s, i) => {
    w.u8(2);                    // en-tête données (local 2)
    w.u16(i);                   // message_index
    w.str(s.name, STEP_NAME_LEN);
    w.u8(s.durationType);
    w.u32(s.durationValue);
    w.u8(s.targetType);
    w.u32(s.targetValue);
    w.u32(s.customLow);
    w.u32(s.customHigh);
    w.u8(s.intensity);
  });

  // ---- Assemblage : en-tête + données + CRC ----
  const data = Uint8Array.from(w.b);
  const out = new Uint8Array(14 + data.length + 2);

  out[0] = 14;          // taille de l'en-tête
  out[1] = 0x20;        // version du protocole (2.0)
  out[2] = 0x5c; out[3] = 0x08; // version du profil (~2140), peu critique
  const dsz = data.length;
  out[4] = dsz & 0xff; out[5] = (dsz >> 8) & 0xff; out[6] = (dsz >> 16) & 0xff; out[7] = (dsz >> 24) & 0xff;
  out[8] = 0x2e; out[9] = 0x46; out[10] = 0x49; out[11] = 0x54; // ".FIT"
  const hcrc = crc16(out, 0, 12);
  out[12] = hcrc & 0xff; out[13] = (hcrc >> 8) & 0xff;

  out.set(data, 14);

  const fcrc = crc16(out, 0, 14 + data.length);
  out[14 + data.length] = fcrc & 0xff;
  out[15 + data.length] = (fcrc >> 8) & 0xff;

  return out;
}

// Déclenche le téléchargement du .FIT dans le navigateur.
export function downloadWorkoutFit(workout, filename) {
  const bytes = encodeWorkoutFit(workout);
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (filename || 'seance') + '.fit';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
