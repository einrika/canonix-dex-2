// ============================================
// FAQ MODAL LOGIC
// ============================================

export const FAQModalLogic = (container) => {
    const modal = container.querySelector('#faqModal');

    window.addEventListener('paxi_show_faq', () => {
        modal?.classList.remove('hidden');
    });

    container.querySelector('#closeFaqModal')?.addEventListener('click', () => {
        modal?.classList.add('hidden');
    });

    container.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const answer = q.nextElementSibling;
            answer?.classList.toggle('hidden');
        });
    });
};
