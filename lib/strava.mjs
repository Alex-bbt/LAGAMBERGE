/* ==========================================================================
   LA GAMBERGE — LOGIQUE STRAVA (côté serveur)
   --------------------------------------------------------------------------
   Recalcule la streak "au moins X km chaque jour" directement depuis
   l'historique Strava. Strava est la seule source de vérité : rien à stocker.
   Ce fichier est importé par la fonction serverless /api/streak.
   ========================================================================== */

const RUN_TYPES = ['Run', 'TrailRun', 'VirtualRun'];

// Renvoie la date locale d'un objet Date sous forme "YYYY-MM-DD" dans un
// fuseau donné (ex. "Europe/Paris"), indépendamment du lieu de la course.
export function localDateStr(date, tz) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

// Arithmétique de calendrier sur une chaîne "YYYY-MM-DD" (sans fuseau : on
// décale une date calendaire, pas un instant).
function shiftDay(ymd, delta) {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}
export const prevDay = (ymd) => shiftDay(ymd, -1);
export const nextDay = (ymd) => shiftDay(ymd, 1);

/**
 * Calcule l'état de la streak à partir d'une liste d'activités Strava.
 * Fonction pure (facile à tester).
 *
 * @returns {{
 *   validatedDay: number,   // longueur de la streak atteinte (jours d'affilée)
 *   state: 'validated'|'pending'|'failed',
 *   failedDate: string|null,
 *   validatedToday: boolean,
 *   today: string,
 *   updatedAt: string
 * }}
 */
export function computeStreak({ activities, now, minKm, tz, startDate }) {
  const minMeters = minKm * 1000;

  // Ensemble des jours (locaux) où au moins une course ≥ minKm existe.
  const days = new Set();
  for (const a of activities || []) {
    const type = a.sport_type || a.type;
    if (a.distance >= minMeters && RUN_TYPES.includes(type)) {
      days.add(localDateStr(new Date(a.start_date), tz));
    }
  }

  const today = localDateStr(now, tz);
  const yesterday = prevDay(today);

  // Dernier jour validé (≤ aujourd'hui, dans la fenêtre du défi).
  const validated = [...days].filter((d) => d <= today && d >= startDate).sort();
  const lastValidated = validated.length ? validated[validated.length - 1] : null;

  // Longueur de la streak se terminant à ce dernier jour validé.
  let count = 0;
  if (lastValidated) {
    let cursor = lastValidated;
    while (days.has(cursor) && cursor >= startDate) {
      count++;
      cursor = prevDay(cursor);
    }
  }

  // État courant.
  let state, failedDate = null;
  if (lastValidated === today) {
    state = 'validated';                 // couru aujourd'hui → jour validé
  } else if (lastValidated === yesterday) {
    state = 'pending';                   // hier validé, aujourd'hui pas encore
  } else {
    state = 'failed';                    // un jour terminé sans course → perdu
    failedDate = lastValidated ? nextDay(lastValidated) : startDate;
  }

  return {
    validatedDay: count,
    state,
    failedDate,
    validatedToday: state === 'validated',
    today,
    updatedAt: now.toISOString(),
  };
}

/**
 * Récupère et calcule la streak depuis l'API Strava.
 * Lit les identifiants dans les variables d'environnement.
 * Renvoie { configured: false } si Strava n'est pas encore configuré.
 */
export async function getStreakFromStrava(env) {
  const clientId = env.STRAVA_CLIENT_ID;
  const clientSecret = env.STRAVA_CLIENT_SECRET;
  const refreshToken = env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return { configured: false };
  }

  const minKm = Number(env.STREAK_MIN_KM || 5);
  const tz = env.STREAK_TZ || 'Europe/Paris';
  const startDate = env.STREAK_START || '2026-01-01';

  // 1) Rafraîchir le token d'accès (les access tokens Strava durent ~6 h).
  const tokRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  if (!tokRes.ok) throw new Error(`Strava token: ${tokRes.status}`);
  const { access_token } = await tokRes.json();

  // 2) Récupérer les activités depuis le début du défi (max ~400 jours).
  const afterEpoch = Math.floor(
    Math.max(
      new Date(`${startDate}T00:00:00Z`).getTime(),
      Date.now() - 400 * 86400000
    ) / 1000
  );
  let page = 1;
  let activities = [];
  while (page <= 5) {
    const r = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${afterEpoch}&per_page=200&page=${page}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    if (!r.ok) throw new Error(`Strava activities: ${r.status}`);
    const batch = await r.json();
    activities = activities.concat(batch);
    if (batch.length < 200) break;
    page++;
  }

  const result = computeStreak({
    activities,
    now: new Date(),
    minKm,
    tz,
    startDate,
  });

  return { configured: true, minKm, tz, ...result };
}
