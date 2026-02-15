// ============================================
// NAVIGATION.JS - Modular Navigation System
// ============================================

window.Navigation = {
    links: [
        { name: 'Market', path: 'index.html', icon: 'fa-chart-line' },
        { name: 'Trade', path: 'trade.html', icon: 'fa-exchange-alt' },
        { name: 'Launchpad', path: 'launchpad.html', icon: 'fa-rocket' },
        { name: 'Pre-Market', path: 'pre-market.html', icon: 'fa-clock' },
        { name: 'Vesting', path: 'vesting.html', icon: 'fa-layer-group' },
        { name: 'Liquidity Lock', path: 'locked-liquidity-pool.html', icon: 'fa-lock' },
        { name: 'Rewards', path: 'reward.html', icon: 'fa-gift' },
        { name: 'Daily', path: 'daily.html', icon: 'fa-calendar-check' },
        { name: 'Lottery', path: 'lottery.html', icon: 'fa-ticket-alt' },
        { name: 'Settings', path: 'setting.html', icon: 'fa-cog' }
    ],

    init: function() {
        this.renderHeader();
        this.setupMobileMenu();
        this.updateActiveState();
    },

    renderHeader: function() {
        const headerContainer = document.getElementById('nav-container');
        if (!headerContainer) return;

        const currentPath = window.location.pathname;
        const isActive = (path) => {
            if (currentPath === '/' && path === 'index.html') return true;
            return currentPath.includes(path);
        };

        const desktopLinks = this.links.slice(0, 5).map(link => `
            <a href="${link.path}" class="nav-link text-sm font-bold transition-all ${isActive(link.path) ? 'text-up' : 'text-gray-400 hover:text-white'}">
                ${link.name}
            </a>
        `).join('');

        const moreLinks = this.links.slice(5).map(link => `
            <a href="${link.path}" class="block px-4 py-2 text-sm ${isActive(link.path) ? 'text-up bg-surface' : 'text-gray-400'} hover:bg-surface hover:text-white transition-all">
                <i class="fas ${link.icon} mr-2 w-4"></i> ${link.name}
            </a>
        `).join('');

        headerContainer.innerHTML = `
            <nav class="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-[100] w-full">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16 items-center">
                        <!-- Logo -->
                        <a href="index.html" class="flex items-center gap-2 group">
                            <div class="w-8 h-8 bg-up/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <i class="fas fa-exchange-alt text-up text-xl"></i>
                            </div>
                            <span class="text-xl font-black gradient-text tracking-tighter">CANONIX</span>
                        </a>

                        <!-- Desktop Menu -->
                        <div class="hidden md:flex items-center gap-8">
                            ${desktopLinks}

                            <!-- More Dropdown -->
                            <div class="relative group" id="more-dropdown">
                                <button class="text-sm font-bold text-gray-400 group-hover:text-white flex items-center gap-1 transition-all">
                                    More <i class="fas fa-chevron-down text-[10px]"></i>
                                </button>
                                <div class="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                                    ${moreLinks}
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex items-center gap-3">
                            <div id="wallet-btn-placeholder">
                                <!-- Wallet connect button will be handled by original logic but styled here if needed -->
                                <button id="connectBtn" onclick="window.showConnectModal()" class="btn-primary px-5 py-2 rounded-xl text-xs font-black text-white shadow-glow-up flex items-center gap-2">
                                    <i class="fas fa-plug"></i> <span class="hidden sm:inline">CONNECT</span>
                                </button>
                            </div>

                            <!-- Mobile Menu Toggle -->
                            <button id="mobile-menu-btn" class="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-border text-gray-400 hover:text-white transition-all">
                                <i class="fas fa-bars"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Mobile Menu Overlay -->
            <div id="mobile-menu" class="fixed inset-0 bg-bg/95 z-[110] md:hidden transform translate-x-full transition-transform duration-300 ease-in-out">
                <div class="flex flex-col h-full">
                    <div class="flex justify-between items-center p-6 border-b border-border">
                        <span class="text-xl font-black gradient-text">MENU</span>
                        <button id="close-mobile-menu" class="w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-border text-gray-400 hover:text-white transition-all">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-6 space-y-4">
                        ${this.links.map(link => `
                            <a href="${link.path}" class="flex items-center gap-4 p-4 rounded-2xl bg-card border ${isActive(link.path) ? 'border-up text-up' : 'border-border text-gray-400'} transition-all hover:text-white">
                                <div class="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
                                    <i class="fas ${link.icon}"></i>
                                </div>
                                <span class="font-black italic uppercase tracking-widest text-sm">${link.name}</span>
                                <i class="fas fa-chevron-right ml-auto text-gray-600"></i>
                            </a>
                        `).join('')}
                    </div>
                    <div class="p-6 border-t border-border">
                        <button onclick="window.showConnectModal()" class="w-full py-4 bg-up text-bg font-black rounded-2xl shadow-glow-up uppercase italic">Connect Wallet</button>
                    </div>
                </div>
            </div>
        `;
    },

    setupMobileMenu: function() {
        const btn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('close-mobile-menu');
        const menu = document.getElementById('mobile-menu');

        if (btn && menu) {
            btn.onclick = () => {
                menu.classList.remove('translate-x-full');
                document.body.style.overflow = 'hidden';
            };
        }

        if (closeBtn && menu) {
            closeBtn.onclick = () => {
                menu.classList.add('translate-x-full');
                document.body.style.overflow = '';
            };
        }

        // Close on link click
        const links = document.querySelectorAll('#mobile-menu a');
        links.forEach(l => {
            l.onclick = () => {
                menu.classList.add('translate-x-full');
                document.body.style.overflow = '';
            };
        });
    },

    updateActiveState: function() {
        // Handled during render for simplicity
    }
};

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
});
