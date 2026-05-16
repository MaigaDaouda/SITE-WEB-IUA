/* ═══════════════════════════════════════════════════════
   main.js — MathApp Space IUA
   Scripts partagés pour toutes les pages internes
   ═══════════════════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // 1. Vérifier la session
  const session = getSession();
  if (!session) {
    window.location.replace('../index.html');
    return;
  }

  // 2. Remplir la sidebar
  initSidebar(session);

  // 3. Bannière de bienvenue
  const heroGreeting = document.getElementById('hero-greeting');
  if (heroGreeting) {
    const prenom = session.nom.split(' ')[0];
    heroGreeting.textContent = `Bienvenue, ${prenom} 👋`;
  }

  // 4. Compteur étudiants inscrits
  const statEtudiants = document.getElementById('stat-etudiants');
  if (statEtudiants) {
    const users = getUsers();
    const count = Object.values(users).filter(u => u.role === 'etudiant').length;
    statEtudiants.textContent = count;
  }

  // 5. Chips de filtre
  initChips();
});

/* ── Sidebar ── */
function initSidebar(session) {
  const avatarEl = document.getElementById('sb-avatar');
  if (avatarEl) {
    const parts    = session.nom.trim().split(' ');
    const initials = parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].substring(0, 2);
    avatarEl.textContent = initials.toUpperCase();
  }

  const nameEl = document.getElementById('sb-name');
  if (nameEl) nameEl.textContent = session.nom;

  // Rôle
  const roleEl = document.getElementById('sb-role');
  if (roleEl) {
    if (session.role === 'superadmin') {
      roleEl.textContent = '👑 Super Admin';
      roleEl.className   = 'sb-user-role admin';
    } else if (session.role === 'admin') {
      roleEl.textContent = '🛡 Administrateur';
      roleEl.className   = 'sb-user-role admin';
    } else {
      roleEl.textContent = '🎒 Étudiant L1';
      roleEl.className   = 'sb-user-role etudiant';
    }
  }

  // Afficher le lien Admin dans la sidebar si admin ou superadmin
  const adminLink = document.getElementById('sb-admin-link');
  if (adminLink && (session.role === 'admin' || session.role === 'superadmin')) {
    adminLink.style.display = 'flex';
  }
}

/* ── Chips ── */
function initChips() {
  document.querySelectorAll('.filter-bar').forEach(bar => {
    bar.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        bar.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  });
}