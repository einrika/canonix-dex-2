window.UIManager.registerLogic('MoreMenu', (container) => {
    container.querySelector('#close-more-menu')?.addEventListener('click', () => window.toggleMoreMenu());
    container.querySelector('#more-menu-connect')?.addEventListener('click', () => {
        window.toggleMoreMenu();
        window.showConnectModal();
    });
});
