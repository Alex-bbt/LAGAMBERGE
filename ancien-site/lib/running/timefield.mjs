/* ==========================================================================
   LA GAMBERGE — OUTILS COUREUR : champ de temps/allure segmenté (client)
   --------------------------------------------------------------------------
   Initialise un widget `.c-timefield` (cases h/min/sec ou min/sec + steppers).
   - Aucune saisie de « : » : chaque unité a sa case (clavier numérique mobile).
   - Expose sur l'élément racine :
       root._getSeconds()            -> secondes (Number) ou null si vide
       root._setSeconds(n, {silent}) -> renseigne les cases depuis n secondes
   - Émet un événement `input` (bubbling) à chaque changement utilisateur.
   Idempotent : appeler initTimeField plusieurs fois est sans effet.
   ========================================================================== */

export function initTimeField(root) {
  if (!root) return null;
  if (root._tf) return root._tf;
  root._tf = true;

  const segs = Array.from(root.querySelectorAll('.c-tf-input'));
  const hasHours = segs.some((s) => s.dataset.unit === 'h');
  const maxFor = (unit) => (unit === 'h' ? 99 : 59);
  const emit = () => root.dispatchEvent(new Event('input', { bubbles: true }));
  const pad2 = (v) => String(v).padStart(2, '0');
  // Affichage « propre » : secondes toujours sur 2 chiffres ; minutes aussi
  // quand il y a des heures (lecture type horloge). Heures/minutes d'allure nues.
  const display = (unit, v) => (unit === 's' || (unit === 'm' && hasHours) ? pad2(v) : String(v));

  function recalc() {
    const anyFilled = segs.some((s) => s.value !== '');
    let secs = 0;
    for (const s of segs) {
      const v = s.value === '' ? 0 : parseInt(s.value, 10) || 0;
      if (s.dataset.unit === 'h') secs += v * 3600;
      else if (s.dataset.unit === 'm') secs += v * 60;
      else secs += v;
    }
    root.dataset.seconds = anyFilled ? String(secs) : '';
  }

  function sanitize(inp) {
    inp.value = inp.value.replace(/[^0-9]/g, '').slice(0, 2);
    if (inp.value !== '') {
      let v = parseInt(inp.value, 10);
      const max = maxFor(inp.dataset.unit);
      if (v > max) v = max;
      inp.value = String(v);
    }
  }

  segs.forEach((inp) => {
    inp.addEventListener('input', () => { sanitize(inp); recalc(); emit(); });
    // Au blur : mise au propre de l'affichage (ex : « 3 » -> « 03 »).
    inp.addEventListener('blur', () => {
      if (inp.value !== '') inp.value = display(inp.dataset.unit, parseInt(inp.value, 10) || 0);
    });
    // Confort : molette pour ajuster quand le champ a le focus.
    inp.addEventListener('wheel', (e) => {
      if (document.activeElement !== inp) return;
      e.preventDefault();
      step(inp.dataset.unit, e.deltaY < 0 ? 1 : -1);
    }, { passive: false });
  });

  function step(unit, dir) {
    const inp = segs.find((s) => s.dataset.unit === unit);
    if (!inp) return;
    let v = inp.value === '' ? 0 : parseInt(inp.value, 10) || 0;
    v += dir;
    const max = maxFor(unit);
    if (v < 0) v = 0;
    if (v > max) v = max;
    inp.value = String(v);
    recalc();
    emit();
  }

  root.querySelectorAll('.c-tf-step').forEach((btn) => {
    btn.addEventListener('click', () => step(btn.dataset.unit, btn.dataset.dir === 'up' ? 1 : -1));
  });

  root._getSeconds = () => {
    const r = root.dataset.seconds;
    return r === '' || r == null ? null : Number(r);
  };

  root._setSeconds = (total, { silent = false } = {}) => {
    if (total == null || Number.isNaN(total)) {
      segs.forEach((s) => { s.value = ''; });
    } else {
      total = Math.round(total);
      const h = Math.floor(total / 3600);
      const m = hasHours ? Math.floor((total % 3600) / 60) : Math.floor(total / 60);
      const s = total % 60;
      for (const seg of segs) {
        if (seg.dataset.unit === 'h') seg.value = display('h', h);
        else if (seg.dataset.unit === 'm') seg.value = display('m', m);
        else seg.value = display('s', s);
      }
    }
    recalc();
    if (!silent) emit();
  };

  recalc();
  return root;
}
