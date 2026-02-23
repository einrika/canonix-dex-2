export const HeaderLogic = (container, props) => {
    if (props.type === 'landing') return;

    container.querySelector('#mobile-sidebar-toggle')?.addEventListener('click', () => window.toggleMobileSidebar());
    container.querySelector('#nav-send-btn')?.addEventListener('click', () => window.setSidebarTab('send'));
    container.querySelector('#nav-lp-btn')?.addEventListener('click', () => window.setSidebarTab('lp'));
    container.querySelector('#nav-donate-btn')?.addEventListener('click', () => window.setSidebarTab('donate'));
    container.querySelector('#nav-console-btn')?.addEventListener('click', () => window.toggleConsoleModal());
    container.querySelector('#nav-settings-btn')?.addEventListener('click', () => window.location.href = 'setting.html');
    container.querySelector('#connectBtn')?.addEventListener('click', () => window.showConnectModal());
};
