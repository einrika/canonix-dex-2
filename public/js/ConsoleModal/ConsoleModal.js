// ============================================
// CONSOLE MODAL LOGIC
// ============================================

export const ConsoleModalLogic = (container) => {
    const modal = container.querySelector('#consoleModal');

    window.addEventListener('paxi_show_console', () => {
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    });

    container.querySelector('#closeConsoleModal')?.addEventListener('click', () => {
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
    });
};
