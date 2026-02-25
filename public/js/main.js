/**
 * MAIN.JS - Single Entry Point for Canonix
 */

// Core Infrastructure
import './core/config.js';
import './core/utils.js';
import './core/socket.js';
import './core/api.js';
import './ui/manager.js';

// Components
import '../component/Header/js/Header.js';
import '../component/Ticker/js/Ticker.js';
import '../component/Footer/js/Footer.js';
import '../component/TokenSidebar/js/TokenSidebar.js';
import '../component/UnifiedSidebar/js/UnifiedSidebar.js';
import '../component/MobileNav/js/MobileNav.js';
import '../component/MoreMenu/js/MoreMenu.js';
import '../component/TokenModal/js/TokenModal.js';
import '../component/ConnectModal/js/ConnectModal.js';
import '../component/PINSheet/js/PINSheet.js';
import '../component/InternalWalletSheet/js/InternalWalletSheet.js';
import '../component/SlippageModal/js/SlippageModal.js';
import '../component/WalletSwitcher/js/WalletSwitcher.js';
import '../component/TxConfirmModal/js/TxConfirmModal.js';
import '../component/TxResultModal/js/TxResultModal.js';
import '../component/AIModal/js/AIModal.js';
import '../component/FAQModal/js/FAQModal.js';
import '../component/ConsoleModal/js/ConsoleModal.js';
import '../component/TradeHeaderStats/js/TradeHeaderStats.js';
import '../component/PriceChart/js/PriceChart.js';
import '../component/SwapTerminal/js/SwapTerminal.js';
import '../component/TradeStats/js/TradeStats.js';
import '../component/PoolDepth/js/PoolDepth.js';
import '../component/TokenInfo/js/TokenInfo.js';
import '../component/AboutToken/js/AboutToken.js';
import '../component/HoldersTab/js/HoldersTab.js';
import '../component/LandingHero/js/LandingHero.js';
import '../component/EventBanner/js/EventBanner.js';
import '../component/MarketRadar/js/MarketRadar.js';
import '../component/LandingAIScan/js/LandingAIScan.js';
import '../component/LandingFeatures/js/LandingFeatures.js';
import '../component/SettingsPage/js/SettingsPage.js';

// Landing Effects Logic
function initLandingEffects() {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-[20px]');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('opacity-0', 'translate-y-[20px]', 'transition-all', 'duration-[800ms]', 'ease-[cubic-bezier(0.4,0,0.2,1)]');
        observer.observe(el);
    });

    // Counter Animation
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Trigger counters when visible
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                const target = parseInt(entry.target.dataset.target);
                if (!isNaN(target)) {
                    animateValue(entry.target, 0, target, 2000);
                    entry.target.dataset.animated = "true";
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
}

// Initialize Page
const initialize = async () => {
    const path = window.location.pathname;

    if (path.includes('trade.html')) {
        // Import app.js for trade logic
        await import('./app.js');
        window.UIManager.init('trade', ['FAQModal']);
    } else if (path.includes('setting.html')) {
        window.UIManager.render('SettingsPage', 'app');
    } else {
        // Default to Landing
        window.UIManager.init('landing', ['FAQModal']);
        setTimeout(initLandingEffects, 100);
    }
};

// Handle Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
