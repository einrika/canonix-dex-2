/**
 * UI-TRIGGERS.JS - Global UI interaction handlers
 * Maps component-specific IDs to global actions
 */

export const setupGlobalUITriggers = () => {
    window.showConnectModal = () => {
        const el = document.getElementById('connectModal');
        if (el) { el.classList.remove('hidden'); el.classList.add('flex'); }
    };

    window.showPINSheet = () => {
        const el = document.getElementById('pinSheet');
        if (el) { el.classList.remove('hidden'); el.classList.add('flex'); }
    };

    window.toggleConsoleModal = () => {
        const el = document.getElementById('consoleModal');
        if (el) el.classList.toggle('hidden');
    };

    window.toggleMoreMenu = () => {
        const el = document.getElementById('moreMenuModal');
        if (el) el.classList.toggle('hidden');
    };

    window.toggleMobileSidebar = () => {
        const el = document.getElementById('tokenSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (el) {
            el.classList.toggle('-translate-x-full');
            if (overlay) overlay.classList.toggle('hidden');
        }
    };

    window.toggleUnifiedSidebar = () => {
        const el = document.getElementById('unifiedSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (el) {
            el.classList.toggle('translate-x-full');
            if (overlay) overlay.classList.toggle('hidden');
        }
    };

    window.setSidebarTab = (tab) => {
        const sidebar = document.getElementById('unifiedSidebar');
        if (sidebar && sidebar.classList.contains('translate-x-full')) {
            window.toggleUnifiedSidebar();
        }
        // Dispatch event or call component method to switch tab
        window.dispatchEvent(new CustomEvent('switch_sidebar_tab', { detail: tab }));
    };
};
