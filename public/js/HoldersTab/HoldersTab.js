window.UIManager.registerLogic('HoldersTab', (container) => {
    container.querySelector('#tab-holders')?.addEventListener('click', () => window.setTab('holders'));
});
