/* Le petit essai de la page d'accueil : une question par classe, comme dans l'appli.
   Rien n'est enregistré ni envoyé : tout se passe dans la page. */
(function () {
  'use strict';
  var racine = document.getElementById('jeu');
  if (!racine) return;

  var ORDRE = ['GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'];
  var QUESTIONS = {
    GS: { nom: 'Grande section', scene: 'etoiles', enonce: "Stella a trois étoiles. Le facteur lui en donne deux. Maintenant, Stella a combien d'étoiles ?", choix: ['3', '4', '5', '6'], bon: '5', aide: 'On recompte ensemble : un, deux, trois… et encore deux. Essaie encore.' },
    CP: { nom: 'CP', scene: 'calcul', texte: '37 + 25 = ?', enonce: 'Calcule.', choix: ['52', '62', '63', '512'], bon: '62', aide: 'Ajoute les dizaines, 30 + 20, puis les unités, 7 + 5. Essaie encore.' },
    CE1: { nom: 'CE1', scene: 'phrase', texte: 'Nous ____ (ranger) la chambre.', enonce: 'Choisis le verbe bien conjugué.', choix: ['ranges', 'range', 'rangez', 'rangeons'], bon: 'rangeons', aide: 'Regarde le sujet : « nous ». Essaie encore.' },
    CE2: { nom: 'CE2', scene: 'bande', enonce: 'Quelle fraction de la bande est coloriée ?', choix: ['5/10', '4/5', '4/10', '3/10'], bon: '4/10', aide: 'Compte les cases : combien en tout ? Combien de coloriées ? Essaie encore.' },
    CM1: { nom: 'CM1', scene: 'lecture', enonce: 'Lis le texte, puis réponds à la question.', choix: ['grâce à ses grands yeux', "grâce à l'écho de ses cris", 'grâce à la lumière de la lune'], bon: "grâce à l'écho de ses cris", aide: 'Relis la dernière phrase du texte. Essaie encore.' },
    CM2: { nom: 'CM2', scene: 'calcul', texte: '25 % de 80 = ?', enonce: 'Calcule ce pourcentage du nombre.', choix: ['20', '25', '40', '55'], bon: '20', aide: "25 %, c'est le quart du nombre. Essaie encore." }
  };
  var TEXTE_CM1 = "Les chauves-souris ne sont pas des oiseaux, mais des mammifères : les mères allaitent leurs petits. Elles dorment le jour, la tête en bas, accrochées par les pattes. La nuit, elles chassent les insectes. Pour se diriger dans le noir, elles poussent de petits cris et écoutent l'écho qui revient vers elles.";
  var GRIGNOU = { question: 'img/grignou.svg', aide: 'img/grignou-crayon.svg', bravo: 'img/grignou-content.svg', montre: 'img/grignou.svg' };

  var etat = { classe: 'CE2', essais: 0, phase: 'question', ecartees: [], gagnees: {} };

  function el(nom, attrs, enfants) {
    var e = document.createElement(nom), k;
    for (k in (attrs || {})) {
      if (k === 'texte') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (enfants || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }
  function etoile(classe) { return el('img', { src: 'img/etoile.svg', alt: 'étoile', 'class': classe || '' }); }

  // Les éléments fixes
  var classes = el('div', { 'class': 'jeu-classes', role: 'group', 'aria-label': 'Choisir une classe' });
  var boutonsClasse = {};
  ORDRE.forEach(function (id, i) {
    var b = el('button', { type: 'button', 'class': 'c' + (i + 1), texte: id, 'aria-label': QUESTIONS[id].nom });
    b.addEventListener('click', function () {
      etat.classe = id; etat.essais = 0; etat.phase = 'question'; etat.ecartees = [];
      afficher();
    });
    boutonsClasse[id] = b;
    classes.appendChild(b);
  });
  var niveau = el('span');
  var compteur = el('span', { texte: '0' });
  var barre = el('div', { 'class': 'jeu-barre' }, [niveau, el('span', { 'class': 'jeu-etoiles' }, [el('img', { src: 'img/etoile.svg', alt: 'Étoiles gagnées :' }), compteur])]);
  var tete = el('img', { src: GRIGNOU.question, alt: 'Grignou', width: '96', height: '96' });
  var bulle = el('p', { 'aria-live': 'polite' });
  var dit = el('div', { 'class': 'jeu-dit' }, [tete, bulle]);
  var scene = el('div', { 'class': 'jeu-scene' });
  var reponses = el('div', { 'class': 'jeu-reponses' });
  var note = el('p', { 'class': 'jeu-note', texte: "Dans l'appli, une série fait dix questions comme celle-ci. Essayez une autre classe." });
  var ecran = el('div', { 'class': 'jeu-ecran' }, [barre, dit, scene, reponses, note]);

  function dessinerScene(q) {
    scene.textContent = '';
    scene.className = 'jeu-scene' + (etat.phase === 'aide' && q.scene === 'etoiles' ? ' compte' : '');
    if (q.scene === 'etoiles') {
      scene.appendChild(el('div', { 'class': 'groupes' }, [
        el('div', { 'class': 'groupe' }, [el('span', { texte: 'Stella' }), etoile('e1'), etoile('e2'), etoile('e3')]),
        el('div', { 'class': 'groupe g2' }, [el('span', { texte: 'le facteur donne' }), etoile('e4'), etoile('e5')])
      ]));
    } else if (q.scene === 'bande') {
      var bande = el('div', { 'class': 'bande', role: 'img', 'aria-label': 'Une bande de dix cases, dont quatre sont coloriées' });
      for (var i = 0; i < 10; i++) bande.appendChild(el('i', i < 4 ? { 'class': 'pleine' } : {}));
      scene.appendChild(bande);
    } else if (q.scene === 'lecture') {
      scene.appendChild(el('div', { 'class': 'lecture' }, [el('p', { texte: TEXTE_CM1 }), el('p', { 'class': 'question', texte: 'Comment se dirige-t-elle dans le noir ?' })]));
    } else {
      scene.appendChild(el('p', { 'class': q.scene, texte: q.texte }));
    }
  }

  function repondre(q, choix) {
    if (etat.phase !== 'question' && etat.phase !== 'aide') return;
    if (choix === q.bon) {
      if (etat.essais === 0) etat.gagnees[etat.classe] = true;
      etat.phase = 'bravo';
    } else if (etat.essais === 0) {
      etat.essais = 1; etat.phase = 'aide'; etat.ecartees = [choix];
    } else {
      etat.essais = 2; etat.phase = 'montre'; etat.ecartees.push(choix);
    }
    afficher();
  }

  function afficher() {
    var q = QUESTIONS[etat.classe];
    var clos = etat.phase === 'bravo' || etat.phase === 'montre';
    ORDRE.forEach(function (id) { boutonsClasse[id].setAttribute('aria-pressed', id === etat.classe ? 'true' : 'false'); });
    niveau.textContent = q.nom;
    compteur.textContent = String(Object.keys(etat.gagnees).length);
    tete.src = GRIGNOU[etat.phase];
    var texte = q.enonce;
    if (etat.phase === 'aide') texte = q.aide;
    if (etat.phase === 'bravo') texte = etat.essais === 0 ? 'Bravo ! Une étoile.' : "C'est ça !";
    if (etat.phase === 'montre') texte = 'La réponse : ' + q.bon + ". Dans l'appli, cette question reviendrait en fin de série.";
    bulle.textContent = texte;
    dessinerScene(q);
    reponses.textContent = '';
    reponses.className = 'jeu-reponses' + (q.scene === 'lecture' ? ' longues' : '');
    q.choix.forEach(function (choix, i) {
      var ecartee = etat.ecartees.indexOf(choix) >= 0;
      var bonne = choix === q.bon;
      var b = el('button', { type: 'button', 'class': 'c' + [1, 3, 4, 5][i] + ((ecartee || (clos && !bonne)) ? ' ecartee' : '') + (clos && bonne ? ' bonne' : ''), texte: choix });
      if (clos || ecartee) b.disabled = true;
      b.addEventListener('click', function () { repondre(q, choix); });
      reponses.appendChild(b);
    });
    note.hidden = !clos;
  }

  racine.textContent = '';
  racine.appendChild(classes);
  racine.appendChild(ecran);
  afficher();
})();
