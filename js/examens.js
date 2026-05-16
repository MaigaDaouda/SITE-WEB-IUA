// Chips
document.querySelectorAll('#filter-ex .chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('#filter-ex .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filterExamens();
    });
});

function filterExamens() {
    const filter = (document.querySelector('#filter-ex .chip.active') || {}).dataset?.filter || 'tous';
    const search = (document.getElementById('search-examen').value || '').toLowerCase();
    const cards  = document.querySelectorAll('.exam-card');
    let visible  = 0;

    cards.forEach(card => {
        const matchFilter = filter === 'tous'
        || card.dataset.sem  === filter
        || card.dataset.type === filter;
        const text        = card.textContent.toLowerCase();
        const matchSearch = !search || text.includes(search);
        const show = matchFilter && matchSearch;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
    });

    const s1v = [...document.querySelectorAll('.exam-card[data-sem="S1"]')].some(c => c.style.display !== 'none');
    const s2v = [...document.querySelectorAll('.exam-card[data-sem="S2"]')].some(c => c.style.display !== 'none');
    document.getElementById('label-S1').style.display = s1v ? '' : 'none';
    document.getElementById('label-S2').style.display = s2v ? '' : 'none';
    document.getElementById('no-result-ex').style.display = visible === 0 ? 'block' : 'none';
}

// Modale
function openModal(title, src) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-img').src = src;
    document.getElementById('modal-dl-btn').onclick = () => dlEx(src, src.split('/').pop());
    document.getElementById('modal').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    document.getElementById('modal').classList.remove('open');
    document.body.style.overflow = '';
}
function dlEx(src, filename) {
    const a = document.createElement('a');
    a.href = src; a.download = filename; a.click();
}
