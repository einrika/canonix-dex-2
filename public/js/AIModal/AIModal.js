window.UIManager.registerLogic('AIModal', (container) => {
    container.querySelector('#close-ai-modal')?.addEventListener('click', () => window.hideAI());
});
