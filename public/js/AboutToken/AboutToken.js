window.UIManager.registerLogic('AboutToken', (container) => {
    container.querySelector('#copy-mkt-btn')?.addEventListener('click', () => window.copyMktAddr());
});
