// ============================================
// MOBILE NAV LOGIC
// ============================================

export const MobileNavLogic = (container) => {
    container.querySelector('#mobileConnectBtn')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('paxi_show_connect_modal'));
    });

    container.querySelector('#mobile-market-btn')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('paxi_toggle_token_sidebar'));
    });

    container.querySelector('#mobile-chart-btn')?.addEventListener('click', () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    });

    container.querySelector('#mobile-wallet-btn')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('paxi_toggle_sidebar'));
    });

    container.querySelector('#mobile-ai-btn')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('paxi_show_ai_modal'));
    });

    container.querySelector('#mobile-more-btn')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('paxi_show_more_menu'));
    });
};
