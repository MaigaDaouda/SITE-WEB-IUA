/* ═══════════════════════════════════════════════════════
   accueil.js — Chargement dynamique depuis Firestore
   Annonces en temps réel
   ═══════════════════════════════════════════════════════ */

import { getAnnonces } from './firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  await chargerAnnonces();
});

async function chargerAnnonces() {
  const container = document.getElementById('annonces-liste');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px;">⏳ Chargement…</div>`;

  const annonces = await getAnnonces();

  if (annonces.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px;">Aucune annonce pour le moment.</div>`;
    return;
  }

  const couleurs = {
    blue:  'blue',
    gold:  'gold',
    green: 'green'
  };

  container.innerHTML = annonces.slice(0, 5).map(a => {
    const date = a.createdAt?.toDate
      ? a.createdAt.toDate().toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
      : '—';
    const couleur = couleurs[a.couleur] || 'blue';
    return `
      <div class="annonce-item">
        <div class="ann-dot ${couleur}"></div>
        <div>
          <div class="ann-title">${a.titre}</div>
          <div class="ann-date">${date}</div>
        </div>
      </div>`;
  }).join('');
}