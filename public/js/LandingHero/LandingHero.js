// ============================================
// LANDING HERO LOGIC
// ============================================

export const LandingHeroLogic = (container) => {
    container.querySelector('#trade-now-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'trade.html';
    });

    container.querySelector('#explore-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('market-radar')?.scrollIntoView({ behavior: 'smooth' });
    });
};
