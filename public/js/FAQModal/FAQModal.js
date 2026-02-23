// ============================================
// FAQMODAL LOGIC
// ============================================

export const FAQModalLogic = (container) => {
    // FAQ handlers
};

export const showFAQ = function() {
    const modal = document.getElementById('faqModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

export const hideFAQ = function() {
    const modal = document.getElementById('faqModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

export const toggleFAQ = function(element) {
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

window.showFAQ = showFAQ;
window.hideFAQ = hideFAQ;
window.toggleFAQ = toggleFAQ;
