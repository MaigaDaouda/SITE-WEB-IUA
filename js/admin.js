/* ═══════════════════════════════════════════════════════
   admin.js — Scripts du dashboard administrateur
   Connecté à Firebase Firestore
   ═══════════════════════════════════════════════════════ */

import {
  ajouterCours,    supprimerCours,
  ajouterExamen,   supprimerExamen,
  ajouterRessource,supprimerRessource,
  ajouterAnnonce,  supprimerAnnonce,
  getCours, getExamens, getRessources, getAnnonces
} from './firestore.js';

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();

  if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
    alert('⛔ Accès réservé aux administrateurs.');
    window.location.replace('accueil.html');
    return;
  }

  loadStats();
  renderUsers();

  // Masquer gestion comptes pour les admins classiques
  const sectionUsers  = document.getElementById('section-users');
  const actionGestion = document.getElementById('action-gestion');
  const actionExport  = document.getElementById('action-export');

  if (session.role !== 'superadmin') {
    if (sectionUsers)  sectionUsers.style.display  = 'none';
    if (actionGestion) actionGestion.style.display = 'none';
    if (actionExport)  actionExport.style.display  = 'none';
  }

  // Badge rôle
  const badge = document.getElementById('admin-role-badge');
  if (badge) {
    if (session.role === 'superadmin') {
      badge.textContent      = '👑 Super Administrateur';
      badge.style.background = 'rgba(217,119,6,.15)';
      badge.style.color      = '#D97706';
    } else {
      badge.textContent = '🛡 Administrateur';
    }
  }
});

/* ── Statistiques ── */
function loadStats() {
  const users     = getUsers();
  const all       = Object.values(users);
  const etudiants = all.filter(u => u.role === 'etudiant').length;
  const admins    = all.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
  const nbEtu  = document.getElementById('adm-nb-etudiants');
  const nbAdm  = document.getElementById('adm-nb-admins');
  if (nbEtu) nbEtu.textContent = etudiants;
  if (nbAdm) nbAdm.textContent = `dont ${admins} admin(s)`;
}

/* ── Tableau utilisateurs ── */
window.renderUsers = function() {
  const users  = getUsers();
  const search = (document.getElementById('search-users')?.value || '').toLowerCase();
  const tbody  = document.getElementById('users-tbody');
  const noMsg  = document.getElementById('no-users');

  const list = Object.entries(users).filter(([mat, u]) =>
    !search || u.nom.toLowerCase().includes(search) || mat.toLowerCase().includes(search)
  );

  if (list.length === 0) {
    tbody.innerHTML = '';
    noMsg.style.display = 'block';
    return;
  }
  noMsg.style.display = 'none';

  tbody.innerHTML = list.map(([mat, u]) => {
    const date = u.createdAt
      ? new Date(u.createdAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
      : '—';
    const roleBadge = u.role === 'superadmin'
      ? '<span class="t-status adm">👑 Super Admin</span>'
      : u.role === 'admin'
      ? '<span class="t-status adm">🛡 Admin</span>'
      : '<span class="t-status ok">🎒 Étudiant</span>';
    return `
      <div class="t-row">
        <span class="t-name">${esc(u.nom)}</span>
        <span class="t-mat">${esc(mat)}</span>
        <span>${roleBadge}</span>
        <span style="font-size:12px;color:var(--muted);">${date}</span>
        <div class="t-act">
          <button class="t-del" onclick="confirmDelete('${esc(mat)}','${esc(u.nom)}')">🗑 Suppr.</button>
        </div>
      </div>`;
  }).join('');
};

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Suppression compte ── */
let toDeleteMat = null;

window.confirmDelete = function(mat, nom) {
  toDeleteMat = mat;
  document.getElementById('confirm-msg').textContent =
    `Tu es sur le point de supprimer le compte de "${nom}" (${mat}). Cette action est irréversible.`;
  document.getElementById('confirm-ok-btn').onclick = doDelete;
  document.getElementById('modal-confirm').classList.add('open');
  document.body.style.overflow = 'hidden';
};

function doDelete() {
  if (!toDeleteMat) return;
  const users = getUsers();
  delete users[toDeleteMat];
  saveUsers(users);
  toDeleteMat = null;
  closeConfirm();
  loadStats();
  window.renderUsers();
}

window.closeConfirm = function() {
  document.getElementById('modal-confirm').classList.remove('open');
  document.body.style.overflow = '';
};

/* ── Export JSON ── */
window.exportUsers = function() {
  const blob = new Blob([JSON.stringify(getUsers(), null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'mathapp_users.json';
  a.click();
};

/* ══════════════════════════════════════
   MODALES ACTIONS RAPIDES
══════════════════════════════════════ */

const modalConfigs = {

  cours: {
    title: '📚 Ajouter un cours PDF',
    body: `
      <div class="form-alert" id="m-alert"></div>
      <div class="m-field"><label>Titre du cours</label>
        <input class="m-inp" id="m-titre" placeholder="Ex : Structures algébriques"/></div>
      <div class="m-field"><label>UE</label>
        <select class="m-select" id="m-ue">
          <option>Algèbre</option>
          <option>Logique &amp; Maths Discrètes</option>
          <option>Analyse Réelle</option>
          <option>Introduction à l'Informatique</option>
          <option>Bureautique</option>
          <option>Techniques d'Expression</option>
          <option>Géométrie &amp; Probabilité</option>
          <option>Statistiques</option>
          <option>Calcul Différentiel &amp; Intégral</option>
          <option>Algorithme &amp; Structures de Données</option>
          <option>Programmation Web</option>
          <option>Comptabilité &amp; Économie</option>
        </select></div>
      <div class="m-field"><label>Semestre</label>
        <select class="m-select" id="m-sem">
          <option>Semestre 1</option><option>Semestre 2</option>
        </select></div>
      <div class="m-field"><label>Crédits</label>
        <input class="m-inp" id="m-credits" type="number" placeholder="Ex : 3" min="1" max="6"/></div>
      <div class="m-field"><label>Nom du fichier PDF</label>
        <input class="m-inp" id="m-fichier" placeholder="Ex : algebre_structures.pdf"/>
        <p style="font-size:11px;color:var(--muted);margin-top:6px;">📁 Place le fichier dans <strong>assets/cours/</strong></p></div>`,
    save: async () => {
      const titre   = document.getElementById('m-titre').value.trim();
      const ue      = document.getElementById('m-ue').value;
      const sem     = document.getElementById('m-sem').value;
      const credits = document.getElementById('m-credits').value;
      const fichier = document.getElementById('m-fichier').value.trim();

      if (!titre || !fichier) { showMAlert('Remplis tous les champs obligatoires.'); return; }

      const btn = document.getElementById('modal-save-btn');
      btn.disabled    = true;
      btn.textContent = 'Enregistrement…';

      const res = await ajouterCours({ titre, ue, semestre: sem, credits, fichier });

      if (res.succes) {
        showMAlert('✅ Cours ajouté avec succès dans la base de données !', true);
        setTimeout(window.closeModal, 1800);
      } else {
        showMAlert('❌ Erreur : ' + res.erreur);
        btn.disabled    = false;
        btn.textContent = 'Enregistrer';
      }
    }
  },

  examen: {
    title: '📝 Ajouter un sujet d\'examen',
    body: `
      <div class="form-alert" id="m-alert"></div>
      <div class="m-field"><label>Matière</label>
        <input class="m-inp" id="m-mat" placeholder="Ex : Algèbre"/></div>
      <div class="m-field"><label>Type</label>
        <select class="m-select" id="m-type">
          <option>Examen</option><option>Contrôle Continu</option><option>Session 2</option>
        </select></div>
      <div class="m-field"><label>Semestre</label>
        <select class="m-select" id="m-sem2">
          <option>Semestre 1</option><option>Semestre 2</option>
        </select></div>
      <div class="m-field"><label>Année académique</label>
        <select class="m-select" id="m-annee">
          <option>2024-25</option><option>2023-24</option><option>2022-23</option>
        </select></div>
      <div class="m-field"><label>Nom du fichier image</label>
        <input class="m-inp" id="m-img" placeholder="Ex : algebre_examen_s1_2425.jpg"/>
        <p style="font-size:11px;color:var(--muted);margin-top:6px;">📁 Place l'image dans <strong>assets/examens/</strong></p></div>`,
    save: async () => {
      const mat     = document.getElementById('m-mat').value.trim();
      const type    = document.getElementById('m-type').value;
      const sem     = document.getElementById('m-sem2').value;
      const annee   = document.getElementById('m-annee').value;
      const fichier = document.getElementById('m-img').value.trim();

      if (!mat || !fichier) { showMAlert('Remplis tous les champs.'); return; }

      const btn = document.getElementById('modal-save-btn');
      btn.disabled    = true;
      btn.textContent = 'Enregistrement…';

      const res = await ajouterExamen({ matiere: mat, type, semestre: sem, annee, fichier });

      if (res.succes) {
        showMAlert('✅ Sujet ajouté avec succès !', true);
        setTimeout(window.closeModal, 1800);
      } else {
        showMAlert('❌ Erreur : ' + res.erreur);
        btn.disabled    = false;
        btn.textContent = 'Enregistrer';
      }
    }
  },

  ressource: {
    title: '🌐 Ajouter une ressource',
    body: `
      <div class="form-alert" id="m-alert"></div>
      <div class="m-field"><label>Nom</label>
        <input class="m-inp" id="m-rnom" placeholder="Ex : Khan Academy"/></div>
      <div class="m-field"><label>Type</label>
        <select class="m-select" id="m-rtype">
          <option>Site web</option><option>Chaîne YouTube</option>
        </select></div>
      <div class="m-field"><label>URL</label>
        <input class="m-inp" id="m-rurl" placeholder="https://..."/></div>
      <div class="m-field"><label>Description</label>
        <textarea class="m-textarea" id="m-rdesc" placeholder="Ce que cette ressource apporte…"></textarea></div>`,
    save: async () => {
      const nom  = document.getElementById('m-rnom').value.trim();
      const type = document.getElementById('m-rtype').value;
      const url  = document.getElementById('m-rurl').value.trim();
      const desc = document.getElementById('m-rdesc').value.trim();

      if (!nom || !url) { showMAlert('Remplis le nom et l\'URL.'); return; }

      const btn = document.getElementById('modal-save-btn');
      btn.disabled    = true;
      btn.textContent = 'Enregistrement…';

      const res = await ajouterRessource({ nom, type, url, description: desc });

      if (res.succes) {
        showMAlert('✅ Ressource ajoutée avec succès !', true);
        setTimeout(window.closeModal, 1800);
      } else {
        showMAlert('❌ Erreur : ' + res.erreur);
        btn.disabled    = false;
        btn.textContent = 'Enregistrer';
      }
    }
  },

  annonce: {
    title: '📢 Publier une annonce',
    body: `
      <div class="form-alert" id="m-alert"></div>
      <div class="m-field"><label>Titre</label>
        <input class="m-inp" id="m-atit" placeholder="Ex : Nouveau sujet disponible"/></div>
      <div class="m-field"><label>Message (optionnel)</label>
        <textarea class="m-textarea" id="m-amsg" placeholder="Détails…"></textarea></div>
      <div class="m-field"><label>Couleur</label>
        <select class="m-select" id="m-acol">
          <option value="blue">🔵 Bleu — Information</option>
          <option value="gold">🟡 Or — Important</option>
          <option value="green">🟢 Vert — Succès</option>
        </select></div>`,
    save: async () => {
      const titre   = document.getElementById('m-atit').value.trim();
      const message = document.getElementById('m-amsg').value.trim();
      const couleur = document.getElementById('m-acol').value;

      if (!titre) { showMAlert('Entre un titre.'); return; }

      const btn = document.getElementById('modal-save-btn');
      btn.disabled    = true;
      btn.textContent = 'Publication…';

      const res = await ajouterAnnonce({ titre, message, couleur });

      if (res.succes) {
        showMAlert('✅ Annonce publiée avec succès !', true);
        setTimeout(window.closeModal, 1800);
      } else {
        showMAlert('❌ Erreur : ' + res.erreur);
        btn.disabled    = false;
        btn.textContent = 'Enregistrer';
      }
    }
  }
};

window.openModal = function(type) {
  const cfg = modalConfigs[type];
  document.getElementById('modal-title').textContent  = cfg.title;
  document.getElementById('modal-body').innerHTML     = cfg.body;
  document.getElementById('modal-save-btn').onclick   = cfg.save;
  document.getElementById('modal-save-btn').disabled  = false;
  document.getElementById('modal-save-btn').textContent = 'Enregistrer';
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeModal = function() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
};

function showMAlert(msg, ok = false) {
  const el = document.getElementById('m-alert');
  if (!el) return;
  el.textContent = msg;
  el.className   = 'form-alert show ' + (ok ? 'success' : 'error');
}