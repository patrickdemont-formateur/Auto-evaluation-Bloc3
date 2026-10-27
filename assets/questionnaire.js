/* Questionnaire d'auto-évaluation : logique de la page stagiaire */
(function () {
  'use strict';
  var cfg = window.CONFIG, OUTILS = window.OUTILS, ETAPES = window.ETAPES, NIV = window.NIVEAUX;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var params = new URLSearchParams(location.search);
  var session = (params.get('session') || cfg.SESSION || '').trim();
  var configure = /^https:\/\/script\.google\.com\//.test(cfg.APPS_SCRIPT_URL || '');
  var CLE = 'diag-bloc3-brouillon';
  var state = { prenom: '', reponses: {}, submissionId: null };

  /* ---------- brouillon local (au cas où la page est rechargée) ---------- */
  function charger() {
    try { var s = JSON.parse(localStorage.getItem(CLE) || 'null'); if (s && s.reponses) state = s; } catch (e) {}
  }
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify(state)); } catch (e) {} }

  /* ---------- rendu ---------- */
  function rendre() {
    if (cfg.TITRE) $('#titre-formation').textContent = cfg.TITRE;
    $('#legend').innerHTML = NIV.map(function (n) {
      return '<li><span class="dot n' + n.n + '">' + n.n + '</span><span><b>' + esc(n.court) + '</b><br><span class="muted small">' + esc(n.long) + '</span></span></li>';
    }).join('');

    $('#etapes').innerHTML = ETAPES.map(function (et, i) {
      var items = OUTILS.filter(function (o) { return o.etape === i; });
      return '<section class="card etape" id="etape-' + i + '">' +
        '<header class="etape-head"><span class="etape-num">' + (i + 1) + '</span><div><h2>' + esc(et.titre) + '</h2><p>' + esc(et.sous) + '</p></div></header>' +
        items.map(outilHtml).join('') + '</section>';
    }).join('');

    $('#prenom').value = state.prenom || '';
    OUTILS.forEach(function (o) {
      var v = state.reponses[o.id];
      if (v !== undefined) {
        var r = document.querySelector('input[name="o' + o.id + '"][value="' + v + '"]');
        if (r) r.checked = true;
      }
    });
    maj();
  }

  function outilHtml(o) {
    var pills = NIV.map(function (n) {
      return '<label data-n="' + n.n + '"><input type="radio" name="o' + o.id + '" value="' + n.n + '">' +
        '<span class="pill"><b>' + n.n + '</b>' + esc(n.court) + '</span></label>';
    }).join('');
    return '<div class="outil" id="outil-' + o.id + '" role="group" aria-labelledby="nom-' + o.id + '">' +
      '<div class="outil-nom" id="nom-' + o.id + '">' + esc(o.nom) + '</div>' +
      '<p class="outil-def">' + esc(o.def) + '</p>' +
      '<div class="niveaux">' + pills + '</div></div>';
  }

  function maj() {
    var n = Object.keys(state.reponses).length, t = OUTILS.length, p = Math.round(100 * n / t);
    $('#progress-txt').textContent = n + ' / ' + t + ' outils renseignés';
    $('#progress-pct').textContent = p + ' %';
    $('#progress-bar').style.width = p + '%';
  }

  /* ---------- événements ---------- */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t && t.type === 'radio' && /^o\d+$/.test(t.name)) {
      state.reponses[t.name.slice(1)] = parseInt(t.value, 10);
      var bloc = document.getElementById('outil-' + t.name.slice(1));
      if (bloc) bloc.classList.remove('manque');
      sauver(); maj();
    }
  });
  $('#prenom').addEventListener('input', function (e) { state.prenom = e.target.value; sauver(); });

  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('#msg'); msg.textContent = '';
    var prenom = state.prenom.trim();
    if (prenom.length < 2) {
      msg.textContent = 'Merci d\'indiquer votre prénom.';
      $('#prenom').focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    var manquants = OUTILS.filter(function (o) { return state.reponses[o.id] === undefined; });
    if (manquants.length) {
      manquants.forEach(function (o) { document.getElementById('outil-' + o.id).classList.add('manque'); });
      msg.textContent = manquants.length + ' outil(s) sans réponse (surlignés en rouge). Choisissez « Jamais vu » si vous ne connaissez pas l\'outil.';
      document.getElementById('outil-' + manquants[0].id).scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    envoyer(prenom);
  });

  $('#modifier').addEventListener('click', function () {
    $('#merci').hidden = true; $('#form').hidden = false; window.scrollTo({ top: 0 });
  });

  /* ---------- envoi ---------- */
  function nouvelId() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 's' + Date.now() + Math.random().toString(16).slice(2);
  }

  function envoyer(prenom) {
    var btn = $('#envoyer'); btn.disabled = true; btn.textContent = 'Envoi en cours…';
    state.submissionId = nouvelId(); sauver();
    var payload = {
      submissionId: state.submissionId, prenom: prenom, session: session,
      outils: OUTILS.map(function (o) { return { id: o.id, nom: o.nom }; }),
      niveaux: state.reponses
    };
    var fin = function (res) {
      btn.disabled = false; btn.textContent = 'Envoyer mes réponses';
      if (res.etat === 'echec' || res.etat === 'refus') {
        $('#msg').textContent = res.etat === 'refus'
          ? 'Le serveur a refusé l\'envoi : ' + res.msg
          : 'Impossible d\'envoyer pour le moment. Vérifiez votre connexion puis réessayez : vos réponses sont conservées.';
        return;
      }
      afficherMerci(res.etat);
    };

    if (!configure) { // mode test : rien n'est envoyé
      console.info('[Mode test] Payload non envoyé :', payload);
      return setTimeout(function () { fin({ etat: 'test' }); }, 400);
    }
    transmettre(payload).then(fin);
  }

  function transmettre(payload) {
    var url = cfg.APPS_SCRIPT_URL, body = JSON.stringify(payload);
    var entetes = { 'Content-Type': 'text/plain;charset=utf-8' }; // évite la requête préliminaire CORS
    return fetch(url, { method: 'POST', headers: entetes, body: body }).then(function (r) {
      return r.json().then(function (j) {
        return j.ok ? { etat: 'confirme' } : { etat: 'refus', msg: j.error || 'erreur inconnue' };
      }, function () { return { etat: 'envoye' }; });
    }, function () {
      // réponse illisible (CORS / redirection) : on renvoie en mode « no-cors » ; l'identifiant évite le doublon côté script
      return fetch(url, { method: 'POST', mode: 'no-cors', headers: entetes, body: body })
        .then(function () { return { etat: 'envoye' }; }, function () { return { etat: 'echec' }; });
    });
  }

  function afficherMerci(etat) {
    var c = { ko: 0, mid: 0, ok: 0 };
    OUTILS.forEach(function (o) { var v = state.reponses[o.id]; if (v <= 1) c.ko++; else if (v === 2) c.mid++; else c.ok++; });
    $('#r-ko').textContent = c.ko; $('#r-mid').textContent = c.mid; $('#r-ok').textContent = c.ok;
    $('#merci-titre').textContent = 'Merci ' + state.prenom.trim() + ' !';
    $('#merci-sous').textContent = etat === 'test'
      ? 'Mode test : vos réponses n\'ont pas été envoyées (le script Google n\'est pas encore configuré).'
      : 'Vos réponses ont bien été transmises au formateur.';
    $('#merci-note').textContent = 'Vous pouvez modifier vos réponses et les renvoyer : seule la dernière version est prise en compte.';
    $('#form').hidden = true; $('#merci').hidden = false; window.scrollTo({ top: 0 });
  }

  if (!configure) {
    $('#banner').innerHTML = '<div class="banner test"><b>Mode test.</b> L\'adresse du script Google n\'est pas renseignée dans <code>config.js</code> : le questionnaire fonctionne, mais aucune réponse n\'est envoyée.</div>';
  }
  charger(); rendre();
})();
