// ============================================
// FAQMODAL LOGIC
// ============================================

window.UIManager.registerLogic('FAQModal', (container) => {
    // FAQ handlers
});

window.showFAQ = function() {
    const modal = document.getElementById('faqModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

window.hideFAQ = function() {
    const modal = document.getElementById('faqModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.toggleFAQ = function(element) {
    if (!element) return;
    const answer = element.nextElementSibling;
    if (!answer) return;

    document.querySelectorAll('.faq-answer').forEach(el => {
        if (el !== answer) {
            el.classList.add('hidden');
            if (el.previousElementSibling) {
                el.previousElementSibling.classList.remove('active');
            }
        }
    });

    if (!answer.classList.contains('hidden')) {
        answer.classList.add('hidden');
        element.classList.remove('active');
    } else {
        answer.classList.remove('hidden');
        element.classList.add('active');
    }
};
