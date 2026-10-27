/* Espace animateur : chargement des réponses, cartographie, QR code */
(function () {
  'use strict';
  var cfg = window.CONFIG, OUTILS = window.OUTILS, ETAPES = window.ETAPES, NIV = window.NIVEAUX;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase(); };
  var fmt = function (x) { return x == null ? '–' : x.toFixed(1).replace('.', ','); };
  var configure = /^https:\/\/script\.google\.com\//.test(cfg.APPS_SCRIPT_URL || '');
  var SEUILS = cfg.SEUILS || { consolider: 1.5, maitrise: 2.5 };
  var LIB = { ko: 'Non maîtrisé', mid: 'À consolider', ok: 'Maîtrisé' };

  var rows = [], demo = false, cle = '', timer = null;
  var filtres = { session: '', categorie: '', tab: 'carto' };

  /* ================= Chargement ================= */
  function parser(headers, values) {
    var cols = [];
    headers.forEach(function (h, i) {
      var m = String(h).match(/^\s*(\d{1,3})\s*·/);
      if (m && i >= 3) cols.push({ i: i, id: ('0' + m[1]).slice(-Math.max(2, m[1].length)) });
    });
    return values.map(function (v) {
      var niveaux = {};
      cols.forEach(function (c) { var n = parseInt(v[c.i], 10); if (n >= 0 && n <= 3) niveaux[c.id] = n; });
      return { date: +new Date(v[0]) || 0, prenom: String(v[1] || '').replace(/^'/, '').trim(),
               session: String(v[2] || '').replace(/^'/, '').trim(), niveaux: niveaux };
    }).filter(function (r) { return r.prenom; });
  }

  function lire() {
    if (demo) return Promise.resolve(genererDemo());
    var url = cfg.APPS_SCRIPT_URL + '?action=lire&key=' + encodeURIComponent(cle);
    return fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) throw new Error(j.error || 'Erreur inconnue');
      return parser(j.headers || [], j.rows || []);
    });
  }

  function genererDemo() {
    var noms = ['Alice', 'Bruno', 'Camille', 'David', 'Emma', 'Farid'];
    var seed = 11, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    var base = [3.1, 2.0, 2.7, 1.0, 1.5, 2.1, 1.1];
    return noms.map(function (p, i) {
      var aptitude = (rnd() - 0.5) * 1.2, niveaux = {};
      OUTILS.forEach(function (o) {
        var x = base[o.etape] + aptitude + (rnd() - 0.5) * 2.4 - (o.categorie === 'Approfondissement' ? 0.4 : 0);
        niveaux[o.id] = Math.max(0, Math.min(3, Math.round(x)));
      });
      return { date: Date.now() - i * 3600e3, prenom: p, session: 'Démo', niveaux: niveaux };
    });
  }

  /* ================= Calculs ================= */
  function derniers() {
    var map = {};
    rows.filter(function (r) { return !filtres.session || r.session === filtres.session; })
        .sort(function (a, b) { return a.date - b.date; })
        .forEach(function (r) { map[norm(r.session) + '|' + norm(r.prenom)] = r; });
    var list = Object.keys(map).map(function (k) { return map[k]; });
    list.sort(function (a, b) { return a.prenom.localeCompare(b.prenom, 'fr', { sensitivity: 'base' }); });
    var multi = {}; list.forEach(function (r) { multi[norm(r.prenom)] = (multi[norm(r.prenom)] || 0) + 1; });
    list.forEach(function (r) { r.label = multi[norm(r.prenom)] > 1 && r.session ? r.prenom + ' (' + r.session + ')' : r.prenom; });
    return list;
  }
  function outilsFiltres() {
    return OUTILS.filter(function (o) { return !filtres.categorie || o.categorie === filtres.categorie; });
  }
  function statutIndiv(n) { return n <= 1 ? 'ko' : (n === 2 ? 'mid' : 'ok'); }
  function statsOutils(stag) {
    return outilsFiltres().map(function (o) {
      var v = stag.map(function (s) { return s.niveaux[o.id]; }).filter(function (x) { return x !== undefined; });
      var n = v.length, moy = n ? v.reduce(function (a, b) { return a + b; }, 0) / n : null, st = null;
      if (n) st = moy >= SEUILS.maitrise ? 'ok' : (moy < SEUILS.consolider ? 'ko' : 'mid');
      var het = n >= 3 && (Math.max.apply(null, v) - Math.min.apply(null, v)) >= 2;
      return Object.assign({}, o, { n: n, moy: moy, statut: st, hetero: het });
    });
  }
  var catTag = function (o) { return (o.categorie === 'Socle' ? '<span class="tag">Socle</span>' : '') + (o.hetero ? '<span class="tag het">Niveaux hétérogènes</span>' : ''); };

  /* ================= Vues ================= */
  function vueCarto(stag, S) {
    if (!stag.length) return '<div class="card"><p class="muted">Aucune réponse pour le moment. Partagez le QR code (onglet « QR code ») puis actualisez.</p></div>';
    var tot = S.filter(function (o) { return o.statut; }).length;
    var cnt = { ko: 0, mid: 0, ok: 0 };
    S.forEach(function (o) { if (o.statut) cnt[o.statut]++; });
    var pct = function (n) { return tot ? Math.round(100 * n / tot) + ' % des outils' : ''; };
    var h = '<div class="kpis">' +
      '<div class="kpi base"><span>Répondants</span><b>' + stag.length + '</b><span>stagiaire(s)</span></div>' +
      '<div class="kpi ok"><span>Maîtrisés</span><b>' + cnt.ok + '</b><span>' + pct(cnt.ok) + '</span></div>' +
      '<div class="kpi mid"><span>À consolider</span><b>' + cnt.mid + '</b><span>' + pct(cnt.mid) + '</span></div>' +
      '<div class="kpi ko"><span>Non maîtrisés</span><b>' + cnt.ko + '</b><span>' + pct(cnt.ko) + '</span></div></div>';

    var prio = S.filter(function (o) { return o.categorie === 'Socle' && o.statut && o.statut !== 'ok'; })
                .sort(function (a, b) { return a.moy - b.moy; }).slice(0, 5);
    h += '<div class="prio"><h2>À traiter en priorité</h2><p class="muted small" style="margin-top:4px">Les outils du socle les moins maîtrisés par le groupe.</p>';
    h += prio.length ? '<ol>' + prio.map(function (o) {
      return '<li><b>' + esc(o.nom) + '</b> <span class="muted">· moyenne ' + fmt(o.moy) + ' / 3 · ' + esc(ETAPES[o.etape].titre) + '</span>' + (o.hetero ? '<span class="tag het">Niveaux hétérogènes</span>' : '') + '</li>';
    }).join('') + '</ol>' : '<p class="empty" style="margin-top:12px">Aucun outil du socle à traiter en priorité.</p>';
    h += '</div>';

    var regles = {
      ko: 'moyenne inférieure à ' + fmt(SEUILS.consolider),
      mid: 'moyenne de ' + fmt(SEUILS.consolider) + ' à ' + fmt(SEUILS.maitrise),
      ok: 'moyenne de ' + fmt(SEUILS.maitrise) + ' ou plus'
    };
    h += '<div class="lanes">' + ['ko', 'mid', 'ok'].map(function (k) {
      var items = S.filter(function (o) { return o.statut === k; });
      var corps = items.length ? ETAPES.map(function (et, i) {
        var l = items.filter(function (o) { return o.etape === i; });
        return l.length ? '<h4>' + (i + 1) + ' · ' + esc(et.titre) + '</h4>' + l.map(function (o) {
          return '<div class="chip"><span>' + esc(o.nom) + catTag(o) + '</span><span class="m">' + fmt(o.moy) + '</span></div>';
        }).join('') : '';
      }).join('') : '<p class="empty">Aucun outil dans cette catégorie.</p>';
      return '<div class="lane ' + k + '"><h3>' + LIB[k] + '<em>' + items.length + '</em></h3><p class="rule">' + regles[k] + '</p>' + corps + '</div>';
    }).join('') + '</div>';

    h += '<div class="card"><h2>Vue par étape du projet</h2><p class="muted small" style="margin-top:4px">Répartition des outils de chaque étape selon la lecture du groupe.</p><div class="etapes-bars">' +
      ETAPES.map(function (et, i) {
        var l = S.filter(function (o) { return o.etape === i && o.statut; });
        if (!l.length) return '';
        var c = { ko: 0, mid: 0, ok: 0 }; l.forEach(function (o) { c[o.statut]++; });
        var moy = l.reduce(function (a, o) { return a + o.moy; }, 0) / l.length;
        var seg = function (k) { return c[k] ? '<i class="s-' + k + '" style="width:' + (100 * c[k] / l.length) + '%" title="' + LIB[k] + ' : ' + c[k] + '"></i>' : ''; };
        return '<div class="eb-row"><span><b>' + (i + 1) + '.</b> ' + esc(et.titre) + '</span><div class="stack">' + seg('ok') + seg('mid') + seg('ko') + '</div><span class="muted" style="text-align:right">' + fmt(moy) + '</span></div>';
      }).join('') + '</div><div class="keys"><span><i class="s-ok"></i>Maîtrisé</span><span><i class="s-mid"></i>À consolider</span><span><i class="s-ko"></i>Non maîtrisé</span><span>Chiffre à droite : niveau moyen (0 à 3)</span></div></div>';
    return h;
  }

  function vueMatrice(stag, S) {
    if (!stag.length) return '<div class="card"><p class="muted">Aucune réponse pour le moment.</p></div>';
    var h = '<div class="table-wrap"><table class="matrice"><thead><tr><th>Outil</th>' +
      stag.map(function (s) { return '<th>' + esc(s.label) + '</th>'; }).join('') + '<th>Groupe</th></tr></thead><tbody>';
    ETAPES.forEach(function (et, i) {
      var l = S.filter(function (o) { return o.etape === i; });
      if (!l.length) return;
      h += '<tr class="sep"><td colspan="' + (stag.length + 2) + '">' + (i + 1) + ' · ' + esc(et.titre) + '</td></tr>';
      l.forEach(function (o) {
        h += '<tr><td>' + esc(o.nom) + catTag(o) + '</td>' + stag.map(function (s) {
          var v = s.niveaux[o.id];
          return v === undefined ? '<td class="c na">–</td>' : '<td class="c n' + v + '" title="' + esc(s.label) + ' : ' + esc(NIV[v].court) + '">' + v + '</td>';
        }).join('') + '<td class="g">' + (o.statut ? fmt(o.moy) + ' <span class="pillst ' + o.statut + '">' + LIB[o.statut] + '</span>' : '–') + '</td></tr>';
      });
    });
    h += '</tbody></table></div><div class="keys"><span><i style="background:var(--n0)"></i>0 Jamais vu</span><span><i style="background:var(--n1)"></i>1 De nom</span><span><i style="background:var(--n2)"></i>2 Déjà utilisé</span><span><i style="background:var(--n3)"></i>3 Maîtrisé</span></div>';
    return h;
  }

  function vueStagiaires(stag) {
    if (!stag.length) return '<div class="card"><p class="muted">Aucune réponse pour le moment.</p></div>';
    var outils = outilsFiltres();
    return '<div class="stag-grid">' + stag.map(function (s) {
      var c = { ko: 0, mid: 0, ok: 0 }, somme = 0, nb = 0;
      outils.forEach(function (o) { var v = s.niveaux[o.id]; if (v !== undefined) { c[statutIndiv(v)]++; somme += v; nb++; } });
      var seg = function (k) { return c[k] ? '<i class="s-' + k + '" style="width:' + (100 * c[k] / nb) + '%"></i>' : ''; };
      var aTravailler = outils.filter(function (o) { return o.categorie === 'Socle' && s.niveaux[o.id] !== undefined && s.niveaux[o.id] <= 1; });
      return '<article class="stag"><header><h3>' + esc(s.label) + '</h3><span class="muted small">moyenne ' + fmt(nb ? somme / nb : null) + ' / 3</span></header>' +
        '<div class="stack">' + seg('ok') + seg('mid') + seg('ko') + '</div>' +
        '<div class="nums"><span><b>' + c.ok + '</b> maîtrisés</span><span><b>' + c.mid + '</b> à consolider</span><span><b>' + c.ko + '</b> non maîtrisés</span></div>' +
        (aTravailler.length ? '<details><summary>Socle à travailler (' + aTravailler.length + ')</summary><ul>' + aTravailler.map(function (o) { return '<li>' + esc(o.nom) + '</li>'; }).join('') + '</ul></details>'
                            : '<p class="small muted">Aucun outil du socle au niveau 0 ou 1.</p>') + '</article>';
    }).join('') + '</div>';
  }

  /* ================= QR code ================= */
  function urlQuestionnaire() {
    return location.href.split('#')[0].split('?')[0].replace(/[^\/]*$/, '') + 'index.html';
    }
  function vuePartager() {
    return '<div class="card share"><div><canvas id="qr-canvas" width="400" height="400"></canvas></div><div>' +
      '<p class="eyebrow">Partager le questionnaire</p><h2 style="margin:6px 0 10px">QR code d\'accès</h2>' +
      '<p class="muted">Les stagiaires scannent le code avec leur téléphone, saisissent leur prénom et répondent.</p>' +
      '<label class="field" for="qr-url" style="margin-top:20px">Adresse du questionnaire</label><input type="url" id="qr-url">' +
      '<label class="field" for="qr-session" style="margin-top:14px">Session (facultatif)</label><input type="text" id="qr-session" placeholder="Ex. Bloc3-Octobre" maxlength="40">' +
      '<p class="muted small" style="margin-top:6px">Le libellé est enregistré avec les réponses et permet de séparer plusieurs groupes.</p>' +
      '<div class="actions"><button class="btn" id="qr-proj" type="button">Projeter en plein écran</button>' +
      '<button class="btn ghost" id="qr-png" type="button">Télécharger (PNG)</button>' +
      '<button class="btn ghost" id="qr-copy" type="button">Copier le lien</button></div></div></div>';
  }
  function lienFinal() {
    var u = ($('#qr-url').value || '').trim(), s = ($('#qr-session').value || '').trim();
    return s ? u + (u.indexOf('?') > -1 ? '&' : '?') + 'session=' + encodeURIComponent(s) : u;
  }
  function dessinerQR(canvas, texte) {
    if (!canvas || typeof qrcode !== 'function') return;
    var qr = qrcode(0, 'M'); qr.addData(texte, 'Byte'); qr.make();
    var n = qr.getModuleCount(), marge = 4, cell = Math.max(1, Math.floor(1024 / (n + 2 * marge))), size = cell * (n + 2 * marge);
    canvas.width = canvas.height = size;
    var ctx = canvas.getContext && canvas.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); ctx.fillStyle = '#1F2A44';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect((c + marge) * cell, (r + marge) * cell, cell, cell);
  }
  function brancherPartage() {
    $('#qr-url').value = urlQuestionnaire();
    var maj = function () { dessinerQR($('#qr-canvas'), lienFinal()); };
    $('#qr-url').addEventListener('input', maj); $('#qr-session').addEventListener('input', maj); maj();
    $('#qr-copy').addEventListener('click', function () {
      var b = this, t = lienFinal();
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { b.textContent = 'Lien copié ✓'; }, function () { window.prompt('Copiez ce lien :', t); });
    });
    $('#qr-png').addEventListener('click', function () {
      var a = document.createElement('a'); a.download = 'qrcode-questionnaire.png'; a.href = $('#qr-canvas').toDataURL('image/png'); a.click();
    });
    $('#qr-proj').addEventListener('click', function () {
      dessinerQR($('#proj-canvas'), lienFinal()); $('#proj-url').textContent = lienFinal(); $('#projection').hidden = false;
    });
  }

  /* ================= Orchestration ================= */
  function afficher() {
    var sess = Array.from(new Set(rows.map(function (r) { return r.session; }).filter(Boolean))).sort();
    var sel = $('#f-session');
    if (sess.length > 1) {
      sel.hidden = false;
      sel.innerHTML = '<option value="">Toutes les sessions</option>' + sess.map(function (s) { return '<option' + (s === filtres.session ? ' selected' : '') + ' value="' + esc(s) + '">' + esc(s) + '</option>'; }).join('');
    } else { sel.hidden = true; filtres.session = ''; }
    var stag = derniers(), S = statsOutils(stag);
    $('#tab-carto').innerHTML = vueCarto(stag, S);
    $('#tab-matrice').innerHTML = vueMatrice(stag, S);
    $('#tab-stagiaires').innerHTML = vueStagiaires(stag);
  }

  function montrerTab(t) {
    filtres.tab = t;
    document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === t); });
    ['carto', 'matrice', 'stagiaires', 'partager'].forEach(function (n) { $('#tab-' + n).hidden = (n !== t); });
    $('.toolbar').style.visibility = t === 'partager' ? 'hidden' : 'visible';
  }

  function ouvrir() {
    $('#gate').hidden = true; $('#dashboard').hidden = false; $('#tabs').hidden = false;
    $('#demo-banner').hidden = !demo;
    if (!$('#tab-partager').innerHTML) { $('#tab-partager').innerHTML = vuePartager(); brancherPartage(); }
    $('#auto-s').textContent = cfg.AUTO_REFRESH_SECONDES || 30;
    montrerTab(filtres.tab);
  }

  function actualiser() {
    var b = $('#refresh'); b.disabled = true;
    return lire().then(function (r) { rows = r; afficher(); }).catch(function (e) {
      $('#tab-carto').innerHTML = '<div class="banner err">Lecture impossible : ' + esc(e.message) + '</div>';
    }).then(function () { b.disabled = false; });
  }

  function exporterCSV() {
    var stag = derniers(), S = statsOutils(stag);
    var sep = ';', q = function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; };
    var lignes = [['N°', 'Outil', 'Étape', 'Catégorie'].concat(stag.map(function (s) { return s.label; })).concat(['Moyenne groupe', 'Lecture'])];
    S.forEach(function (o) {
      lignes.push([o.id, o.nom, ETAPES[o.etape].titre, o.categorie].concat(stag.map(function (s) { var v = s.niveaux[o.id]; return v === undefined ? '' : v; }))
        .concat([o.moy == null ? '' : fmt(o.moy), o.statut ? LIB[o.statut] : '']));
    });
    var csv = '\uFEFF' + lignes.map(function (l) { return l.map(q).join(sep); }).join('\r\n');
    var a = document.createElement('a'); a.download = 'cartographie-bloc3.csv';
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.click();
  }

  /* ---------- événements ---------- */
  $('#gate-form').addEventListener('submit', function (e) {
    e.preventDefault(); cle = $('#cle').value; var m = $('#gate-msg'); m.textContent = '';
    if (!configure) { m.textContent = 'L\'adresse du script Google n\'est pas renseignée dans config.js. Essayez d\'abord l\'exemple fictif ci-dessous.'; return; }
    if (!cle) { m.textContent = 'Saisissez la clé animateur.'; return; }
    lire().then(function (r) { rows = r; try { sessionStorage.setItem('diag-cle', cle); } catch (x) {} ouvrir(); afficher(); relancerAuto(); })
      .catch(function (err) { m.textContent = 'Accès refusé ou script injoignable : ' + err.message; });
  });
  $('#demo-lien').addEventListener('click', function (e) { e.preventDefault(); demo = true; rows = genererDemo(); ouvrir(); afficher(); });
  $('#qr-lien').addEventListener('click', function (e) { e.preventDefault(); demo = true; rows = []; ouvrir(); $('#demo-banner').hidden = true; montrerTab('partager'); });
  $('#tabs').addEventListener('click', function (e) { var b = e.target.closest('.tab-btn'); if (b) montrerTab(b.dataset.tab); });
  $('#f-session').addEventListener('change', function (e) { filtres.session = e.target.value; afficher(); });
  $('#f-cat').addEventListener('change', function (e) { filtres.categorie = e.target.value; afficher(); });
  $('#refresh').addEventListener('click', actualiser);
  $('#csv').addEventListener('click', exporterCSV);
  $('#print').addEventListener('click', function () { window.print(); });
  $('#projection').addEventListener('click', function () { this.hidden = true; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $('#projection').hidden = true; });
  function relancerAuto() {
    clearInterval(timer);
    if ($('#auto').checked && !demo) timer = setInterval(actualiser, (cfg.AUTO_REFRESH_SECONDES || 30) * 1000);
  }
  $('#auto').addEventListener('change', relancerAuto);

  if (!configure) $('#gate-texte').textContent = 'L\'adresse du script Google n\'est pas encore renseignée dans config.js. Vous pouvez néanmoins découvrir le rendu avec des données fictives.';
  try { var k = sessionStorage.getItem('diag-cle'); if (k) $('#cle').value = k; } catch (x) {}
  if (cfg.TITRE) $('#sous-titre').textContent = cfg.TITRE;
  window.__demo = function () { $('#demo-lien').click(); };   // utile pour les tests
})();
