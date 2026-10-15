/* ==========================================================================
   LA GAMBERGE — OUTILS COUREUR : coefficients World Athletics (cotation)
   --------------------------------------------------------------------------
   Score World Athletics = a·t² + b·t + c   (t = temps en secondes).
   Coefficients de l'édition 2025 des « World Athletics Scoring Tables »,
   ajustés par régression quadratique sur les tables officielles.
     Source des tables : World Athletics (worldathletics.org, éd. 2025)
     Coefficients repris de : https://github.com/jchen1/iaaf-scoring-tables
     Récupéré le : 2026-07-06
   Valeurs VÉRIFIÉES contre des repères connus (records du monde ≈ 1300 pts,
   voir lib/running/test.mjs). Seules les épreuves vérifiables sont incluses ;
   pas de Mile ni de 15 km ici (absents de la table → non affichés en cotation).
   ========================================================================== */

// Chaque épreuve : { key, label, meters, track, men:[a,b,c], women:[a,b,c] }
export const WA_EVENTS = [
  { key: '800m', label: '800 m', meters: 800, track: true,
    men: [0.1980049254166545, -72.07136038821409, 6558.28160300618],
    women: [0.06879989341997295, -34.399261916380055, 4299.822125108796] },
  { key: '1500m', label: '1500 m', meters: 1500, track: true,
    men: [0.04065992529984008, -31.307736299477256, 6026.662254345021],
    women: [0.01339999627048627, -14.471861176560651, 3907.3655835949467] },
  { key: '3000m', label: '3000 m', meters: 3000, track: true,
    men: [0.008150049932713843, -13.691983542337312, 5750.59246378555],
    women: [0.0025389974609562604, -6.09357042856243, 3656.127933666052] },
  { key: '5000m', label: '5000 m (piste)', meters: 5000, track: true,
    men: [0.002777997945427213, -8.000608112196687, 5760.418712362531],
    women: [8.079992470730324e-4, -3.3935897885437782, 3563.2616780022654] },
  { key: '10000m', label: '10 000 m (piste)', meters: 10000, track: true,
    men: [5.239994429364625e-4, -3.3011925260043427, 5199.371486475808],
    women: [1.712000450308747e-4, -1.5407985033832432, 3466.7925173026015] },
  { key: '5k', label: '5 km (route)', meters: 5000, track: false,
    men: [0.0027791125913787518, -8.002589936962636, 5760.829724426498],
    women: [8.086109772535849e-4, -3.394979088225057, 3563.519547606804] },
  { key: '10k', label: '10 km (route)', meters: 10000, track: false,
    men: [5.243835511893474e-4, -3.302659028227424, 5200.274036400777],
    women: [1.7119892280619345e-4, -1.540623663798911, 3466.0215817096905] },
  { key: 'half', label: 'Semi-marathon', meters: 21097.5, track: false,
    men: [9.469710951061014e-5, -1.3521892901331114, 4827.020676429092],
    women: [2.5960366893742386e-5, -0.5606107770831628, 3026.587224518895] },
  { key: 'marathon', label: 'Marathon', meters: 42195, track: false,
    men: [2.0101186255287035e-5, -0.6150659606552438, 4705.042285787989],
    women: [5.389966906974475e-6, -0.25224574933865895, 2951.2162982728405] },
];

export const waEventByKey = (key) => WA_EVENTS.find((e) => e.key === key) || null;
