window.UIManager.registerUI('SettingsPage', () => {
    return `
        <div id="settings-ui" class="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            <!-- Populated by Logic -->
        </div>
    `;
});

// ============================================
// SETTINGSPAGE LOGIC
// ============================================

window.SettingsPage = {
    defaults: {
        network: 'mainnet',
        rpc: 'https://mainnet-rpc.paxinet.io',
        lcd: 'https://mainnet-lcd.paxinet.io',
        aiEnabled: true,
        aiModel: 'gemini-pro',
        autoLock: 30, // minutes
        theme: 'dark',
        advancedMode: false,
        skipConfirmation: false
    },

    init: function(container) {
        this.config = this.loadConfig();
        this.renderSettings(container);
    },

    loadConfig: function() {
        const saved = localStorage.getItem('canonix_settings');
        return saved ? { ...this.defaults, ...JSON.parse(saved) } : { ...this.defaults };
    },

    saveConfig: function() {
        localStorage.setItem('canonix_settings', JSON.stringify(this.config));
        window.dispatchEvent(new CustomEvent('canonix_settings_updated', { detail: this.config }));
    },

    updateConfig: function(key, value, container) {
        this.config[key] = value;
        this.saveConfig();
        this.renderSettings(container);
    },

    renderSettings: function(container) {
        if (!container) container = document.getElementById('settings-ui');
        if (!container) return;

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div class="lg:col-span-1 space-y-4">
                    <button class="w-full flex items-center gap-4 p-6 bg-surface border-4 border-card shadow-brutal text-meme-cyan font-display text-2xl uppercase italic rotate-[-1deg]">
                        <i class="fas fa-network-wired"></i> HARDWARE
                    </button>
                    <button class="w-full flex items-center gap-4 p-6 bg-bg border-4 border-card shadow-brutal text-muted-text font-display text-2xl uppercase italic hover:text-primary-text transition-all">
                        <i class="fas fa-brain"></i> AI CORE
                    </button>
                    <button class="w-full flex items-center gap-4 p-6 bg-bg border-4 border-card shadow-brutal text-muted-text font-display text-2xl uppercase italic hover:text-primary-text transition-all">
                        <i class="fas fa-shield-alt"></i> DEFENSE
                    </button>
                </div>

                <div class="lg:col-span-2 space-y-12">
                    <div class="bg-surface border-4 border-card shadow-brutal-lg overflow-hidden rotate-[0.5deg]">
                        <div class="p-8 border-b-4 border-card bg-bg flex items-center gap-4">
                            <i class="fas fa-satellite text-meme-cyan text-3xl"></i>
                            <h3 class="text-4xl font-display text-primary-text italic uppercase tracking-tighter">DATA UPLINK</h3>
                        </div>
                        <div class="p-8 space-y-10">
                            <div class="space-y-4">
                                <label class="font-mono text-[10px] font-black uppercase text-muted-text tracking-widest">ACTIVE WAVELENGTH</label>
                                <div class="grid grid-cols-2 gap-6">
                                    <button id="net-mainnet" class="p-6 border-4 ${this.config.network === 'mainnet' ? 'border-meme-green bg-meme-green text-black shadow-brutal-green' : 'border-card bg-bg text-muted-text shadow-brutal'} font-display text-2xl uppercase italic transition-all">
                                        MAINNET
                                    </button>
                                    <button id="net-testnet" class="p-6 border-4 ${this.config.network === 'testnet' ? 'border-meme-pink bg-meme-pink text-primary-text shadow-brutal-pink' : 'border-card bg-bg text-muted-text shadow-brutal'} font-display text-2xl uppercase italic transition-all">
                                        TESTNET
                                    </button>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <label class="font-mono text-[10px] font-black uppercase text-muted-text tracking-widest">RPC COORDINATES</label>
                                <div class="bg-surface border-4 border-card p-4 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]">
                                    <input type="text" id="rpc-input" value="${this.config.rpc}"
                                        placeholder="https://..."
                                        class="w-full bg-transparent text-meme-cyan font-mono text-xs focus:text-primary-text outline-none">
                                </div>
                            </div>

                            <div class="space-y-4">
                                <label class="font-mono text-[10px] font-black uppercase text-muted-text tracking-widest">LCD FREQUENCY</label>
                                <div class="bg-surface border-4 border-card p-4 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]">
                                    <input type="text" id="lcd-input" value="${this.config.lcd}"
                                        placeholder="https://..."
                                        class="w-full bg-transparent text-meme-cyan font-mono text-xs focus:text-primary-text outline-none">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row justify-end gap-6 pt-10">
                        <button id="reset-defaults" class="px-10 py-5 bg-bg border-4 border-card text-muted-text font-display text-2xl uppercase italic shadow-brutal hover:text-meme-pink transition-all">FACTORY RESET</button>
                        <button id="save-params" class="px-16 py-6 bg-meme-pink text-primary-text font-display text-5xl border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">SAVE PARAMS</button>
                    </div>
                </div>
            </div>
        `;

        container.querySelector('#net-mainnet')?.addEventListener('click', () => this.updateConfig('network', 'mainnet', container));
        container.querySelector('#net-testnet')?.addEventListener('click', () => this.updateConfig('network', 'testnet', container));
        container.querySelector('#rpc-input')?.addEventListener('change', (e) => this.updateConfig('rpc', e.target.value, container));
        container.querySelector('#lcd-input')?.addEventListener('change', (e) => this.updateConfig('lcd', e.target.value, container));
        container.querySelector('#reset-defaults')?.addEventListener('click', () => this.resetToDefaults(container));
        container.querySelector('#save-params')?.addEventListener('click', () => this.saveConfig());
    },

    resetToDefaults: function(container) {
        if (confirm('PERMANENTLY REVERT TO FACTORY SPECS?')) {
            this.config = { ...this.defaults };
            this.saveConfig();
            this.renderSettings(container);
        }
    }
};

window.UIManager.registerLogic('SettingsPage', (container) => {
    window.SettingsPage.init(container);
});
