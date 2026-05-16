/* ═══════════════════════════════════
   cours.js — Scripts propres à cours.html
   ═══════════════════════════════════ */
'use strict';

document.querySelectorAll('#filter-bar .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#filter-bar .chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    applyFilter();
  });
});

function applyFilter() {
  const activeChip = document.querySelector('#filter-bar .chip.active');
  const filter     = activeChip ? activeChip.dataset.filter : 'tous';
  const search     = (document.getElementById('search-cours').value || '').toLowerCase();
  const allCards   = document.querySelectorAll('.ue-card');
  let visible      = 0;

  allCards.forEach(card => {
    const matchFilter =
      filter === 'tous'             ||
      card.dataset.sem === filter   ||
      card.dataset.cat === filter;
    const matchSearch = !search || card.textContent.toLowerCase().includes(search);
    const show = matchFilter && matchSearch;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  const s1Visible = [...document.querySelectorAll('.ue-card[data-sem="S1"]')].some(c => c.style.display !== 'none');
  const s2Visible = [...document.querySelectorAll('.ue-card[data-sem="S2"]')].some(c => c.style.display !== 'none');
  const lS1 = document.getElementById('label-S1');
  const lS2 = document.getElementById('label-S2');
  if (lS1) lS1.style.display = s1Visible ? '' : 'none';
  if (lS2) lS2.style.display = s2Visible ? '' : 'none';
  document.getElementById('no-result').style.display = visible === 0 ? 'block' : 'none';
}

function dlCours(filename) {
  const path = '../assets/cours/' + filename;
  const a    = document.createElement('a');
  a.href     = path;
  a.download = filename;
  a.target   = '_blank'; // Ouvre dans un nouvel onglet si le PDF n'existe pas encore
  a.click();
}