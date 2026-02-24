// ============================================
// TOKEN MODAL LOGIC
// ============================================

export const TokenModalLogic = (container) => {
    const modal = container.querySelector('#tokenModal');

    container.querySelector('#closeTokenModal')?.addEventListener('click', () => {
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
    });

    // Subscriptions and render logic handled by tokens module if needed
};
