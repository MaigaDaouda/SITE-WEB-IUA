/* ═══════════════════════════════════════════════════════
   admin.js — Scripts propres à dashboard_admin.html
   ═══════════════════════════════════════════════════════ */
'use strict';

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();

  // Seuls les admins et superadmins ont accès
  if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
    alert('⛔ Accès réservé aux administrateurs.');
    window.location.replace('accueil.html');
    return;
  }

  loadStats();
  renderUsers();

  // Afficher/masquer la section "Gérer les comptes" selon le rôle
  const sectionUsers   = document.getElementById('section-users');
  const actionGestion  = document.getElementById('action-gestion');
  const actionExport   = document.getElementById('action-export');

  if (session.role !== 'superadmin') {
    // Les admins classiques ne peuvent pas gérer les comptes
    if (sectionUsers)  sectionUsers.style.display  = 'none';
    if (actionGestion) actionGestion.style.display = 'none';
    if (actionExport)  actionExport.style.display  = 'none';
  }

  // Badge selon le rôle
  const badge = document.getElementById('admin-role-badge');
  if (badge) {
    if (session.role === 'superadmin') {
      badge.textContent = '👑 Super Administrateur';
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
  const admins    = all.filter(u => u.role === 'admin').length;
  document.getElementById('adm-nb-etudiants').textContent = etudiants;
  document.getElementById('adm-nb-admins').textContent    = `dont ${admins} admin(s)`;
}

/* ── Tableau utilisateurs ── */
function renderUsers() {
  const users  = getUsers();
  const search = (document.getElementById('search-users').value || '').toLowerCase();
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
    const roleBadge = u.role === 'admin'
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
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Suppression ── */
let toDeleteMat = null;

function confirmDelete(mat, nom) {
  toDeleteMat = mat;
  document.getElementById('confirm-msg').textContent =
    `Tu es sur le point de supprimer le compte de "${nom}" (${mat}). Cette action est irréversible.`;
  document.getElementById('confirm-ok-btn').onclick = doDelete;
  document.getElementById('modal-confirm').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function doDelete() {
  if (!toDeleteMat) return;
  const users = getUsers();
  delete users[toDeleteMat];
  saveUsers(users);
  toDeleteMat = null;
  closeConfirm();
  loadStats();
  renderUsers();
}
function closeConfirm() {
  document.getElementById('modal-confirm').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Export JSON ── */
function exportUsers() {
  const blob = new Blob([JSON.stringify(getUsers(), null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'mathapp_users.json';
  a.click();
}

/* ── Modales actions rapides ── */
const modalConfigs = {
  cours: {
    title: '📚 Référencer un cours PDF',
    body: `
      <div class="form-alert" id="m-alert"></div>
      <div class="m-field"><label>Titre du cours</label>
        <input class="m-inp" id="m-titre" placeholder="Ex : Algèbre – Structures algébriques"/></div>
      <div class="m-field"><label>UE</label>
        <select class="m-select" id="m-ue">
          <option>Algèbre</option><option>Logique &amp; Maths Discrètes</option>
          <option>Analyse Réelle</option><option>Introduction à l'Informatique</option>
          <option>Bureautique</option><option>Techniques d'Expression</option>
          <option>Géométrie &amp; Probabilité</option><option>Statistiques</option>
          <option>Calcul Différentiel &amp; Intégral</option>
          <option>Algorithme &amp; Structures de Données</option>
          <option>Programmation Web</option><option>Comptabilité &amp; Économie</option>
        </select></div>
      <div class="m-field"><label>Semestre</label>
        <select class="m-select" id="m-sem"><option>Semestre 1</option><option>Semestre 2</option></select></div>
      <div class="m-field"><label>Nom du fichier PDF</label>
        <input class="m-inp" id="m-file" placeholder="Ex : algebre_structures.pdf"/>
        <p style="font-size:11px;color:var(--muted);margin-top:6px;">📁 Place le fichier dans <strong>assets/cours/</strong></p></div>`,
    save: () => {
      if (!document.getElementById('m-titre').value.trim() ||
          !document.getElementById('m-file').value.trim()) {
        showMAlert('Remplis tous les champs.'); return;
      }
      showMAlert('✅ Cours référencé ! Mets à jour cours.html.', true);
      setTimeout(closeModal, 1800);
    }
  },
  examen: {
    title: '📝 Référencer un sujet d\'examen',
    body: `
      <div class="form-alert" id="m-alert"></div>
      <div class="m-field"><label>Matière</label>
        <input class="m-inp" id="m-mat" placeholder="Ex : Algèbre"/></div>
      <div class="m-field"><label>Type</label>
        <select class="m-select" id="m-type">
          <option>Examen</option><option>Contrôle Continu</option><option>Session 2</option>
        </select></div>
      <div class="m-field"><label>Semestre</label>
        <select class="m-select" id="m-sem2"><option>Semestre 1</option><option>Semestre 2</option></select></div>
      <div class="m-field"><label>Année académique</label>
        <select class="m-select" id="m-annee">
          <option>2024-25</option><option>2023-24</option><option>2022-23</option>
        </select></div>
      <div class="m-field"><label>Nom du fichier image</label>
        <input class="m-inp" id="m-img" placeholder="Ex : algebre_examen_s1_2425.jpg"/>
        <p style="font-size:11px;color:var(--muted);margin-top:6px;">📁 Place l'image dans <strong>assets/examens/</strong></p></div>`,
    save: () => {
      if (!document.getElementById('m-mat').value.trim() ||
          !document.getElementById('m-img').value.trim()) {
        showMAlert('Remplis tous les champs.'); return;
      }
      showMAlert('✅ Sujet référencé ! Mets à jour examens.html.', true);
      setTimeout(closeModal, 1800);
    }
  },
  ressource: {
    title: '🌐 Ajouter une ressource',
    body: `
      <div class="form-alert" id="m-alert"></div>
      <div class="m-field"><label>Nom</label>
        <input class="m-inp" id="m-rnom" placeholder="Ex : Khan Academy"/></div>
      <div class="m-field"><label>Type</label>
        <select class="m-select" id="m-rtype"><option>Site web</option><option>Chaîne YouTube</option></select></div>
      <div class="m-field"><label>URL</label>
        <input class="m-inp" id="m-rurl" placeholder="https://..."/></div>
      <div class="m-field"><label>Description</label>
        <textarea class="m-textarea" id="m-rdesc" placeholder="Ce que cette ressource apporte…"></textarea></div>`,
    save: () => {
      if (!document.getElementById('m-rnom').value.trim() ||
          !document.getElementById('m-rurl').value.trim()) {
        showMAlert('Remplis le nom et l\'URL.'); return;
      }
      showMAlert('✅ Ressource notée ! Mets à jour ressources.html.', true);
      setTimeout(closeModal, 1800);
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
    save: () => {
      if (!document.getElementById('m-atit').value.trim()) {
        showMAlert('Entre un titre.'); return;
      }
      showMAlert('✅ Annonce enregistrée ! Mets à jour accueil.html.', true);
      setTimeout(closeModal, 1800);
    }
  }
};

function openModal(type) {
  const cfg = modalConfigs[type];
  document.getElementById('modal-title').textContent = cfg.title;
  document.getElementById('modal-body').innerHTML    = cfg.body;
  document.getElementById('modal-save-btn').onclick  = cfg.save;
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}
function showMAlert(msg, ok = false) {
  const el = document.getElementById('m-alert');
  if (!el) return;
  el.textContent = msg;
  el.className   = 'form-alert show ' + (ok ? 'success' : 'error');
}