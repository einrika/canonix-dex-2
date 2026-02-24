// ============================================
// MORE MENU LOGIC
// ============================================

export const MoreMenuLogic = (container) => {
    const modal = container.querySelector('#moreMenu');

    window.addEventListener('paxi_show_more_menu', () => {
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    });

    container.querySelector('#closeMoreMenu')?.addEventListener('click', () => {
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
    });

    container.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            modal?.classList.add('hidden');
            modal?.classList.remove('flex');
        });
    });
};
