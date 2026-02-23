export const ConnectModalLogic = (container) => {
    // Logic handled by global functions currently
};

export const showConnectModal = function() {
    const modal = document.getElementById('connectModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

export const hideConnectModal = function() {
    const modal = document.getElementById('connectModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.showConnectModal = showConnectModal;
window.hideConnectModal = hideConnectModal;
