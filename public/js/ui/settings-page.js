// ============================================
// SETTINGS-PAGE.JS - User Preferences & System Controls
// ============================================

export const SettingsPage = {
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

    init: function() {
        this.config = this.loadConfig();
        this.renderSettings();
    },

    loadConfig: function() {
        const saved = localStorage.getItem('canonix_settings');
        return saved ? { ...this.defaults, ...JSON.parse(saved) } : { ...this.defaults };
    },

    saveConfig: function() {
        localStorage.setItem('canonix_settings', JSON.stringify(this.config));
        window.dispatchEvent(new CustomEvent('canonix_settings_updated', { detail: this.config }));
    },

    updateConfig: function(key, value) {
        this.config[key] = value;
        this.saveConfig();
        this.renderSettings();
    },

    renderSettings: function() {
        const container = document.getElementById('settings-ui');
        if (!container) return;

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div class="lg:col-span-1 space-y-4">
                    <button class="w-full flex items-center gap-4 p-6 bg-surface border-4 border-card shadow-brutal text-meme-cyan font-display text-2xl uppercase italic rotate-[-1deg]"><i class="fas fa-network-wired"></i> HARDWARE</button>
                    <button class="w-full flex items-center gap-4 p-6 bg-bg border-4 border-card shadow-brutal text-muted-text font-display text-2xl uppercase italic hover:text-primary-text transition-all"><i class="fas fa-brain"></i> AI CORE</button>
                    <button class="w-full flex items-center gap-4 p-6 bg-bg border-4 border-card shadow-brutal text-muted-text font-display text-2xl uppercase italic hover:text-primary-text transition-all"><i class="fas fa-shield-alt"></i> DEFENSE</button>
                </div>
                <div class="lg:col-span-2 space-y-12">
                    <div class="bg-surface border-4 border-card shadow-brutal-lg overflow-hidden rotate-[0.5deg]">
                        <div class="p-8 border-b-4 border-card bg-bg flex items-center gap-4"><i class="fas fa-satellite text-meme-cyan text-3xl"></i><h3 class="text-4xl font-display text-primary-text italic uppercase tracking-tighter">DATA UPLINK</h3></div>
                        <div class="p-8 space-y-10">
                            <div class="space-y-4">
                                <label class="font-mono text-[10px] font-black uppercase text-muted-text tracking-widest">ACTIVE WAVELENGTH</label>
                                <div class="grid grid-cols-2 gap-6">
                                    <button onclick="SettingsPage.updateConfig('network', 'mainnet')" class="p-6 border-4 ${this.config.network === 'mainnet' ? 'border-meme-green bg-meme-green text-black shadow-brutal-green' : 'border-card bg-bg text-muted-text shadow-brutal'} font-display text-2xl uppercase italic transition-all">MAINNET</button>
                                    <button onclick="SettingsPage.updateConfig('network', 'testnet')" class="p-6 border-4 ${this.config.network === 'testnet' ? 'border-meme-pink bg-meme-pink text-primary-text shadow-brutal-pink' : 'border-card bg-bg text-muted-text shadow-brutal'} font-display text-2xl uppercase italic transition-all">TESTNET</button>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <label class="font-mono text-[10px] font-black uppercase text-muted-text tracking-widest">RPC COORDINATES</label>
                                <div class="bg-surface border-4 border-card p-4 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]"><input type="text" value="${this.config.rpc}" onchange="SettingsPage.updateConfig('rpc', this.value)" placeholder="https://..." class="w-full bg-transparent text-meme-cyan font-mono text-xs focus:text-primary-text outline-none"></div>
                            </div>
                            <div class="space-y-4">
                                <label class="font-mono text-[10px] font-black uppercase text-muted-text tracking-widest">LCD FREQUENCY</label>
                                <div class="bg-surface border-4 border-card p-4 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]"><input type="text" value="${this.config.lcd}" onchange="SettingsPage.updateConfig('lcd', this.value)" placeholder="https://..." class="w-full bg-transparent text-meme-cyan font-mono text-xs focus:text-primary-text outline-none"></div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-surface border-4 border-card shadow-brutal-lg overflow-hidden rotate-[-0.5deg]">
                        <div class="p-8 border-b-4 border-card bg-bg flex items-center gap-4"><i class="fas fa-microchip text-meme-pink text-3xl"></i><h3 class="text-4xl font-display text-primary-text italic uppercase tracking-tighter">AI BRAIN STEM</h3></div>
                        <div class="p-8 space-y-10">
                            <div class="flex items-center justify-between p-6 bg-surface border-4 border-card shadow-brutal">
                                <div><h4 class="font-display text-2xl text-primary-text italic uppercase">Bionic Insights</h4><p class="font-mono text-[9px] text-muted-text font-bold uppercase">Activate Gemini-PRO consciousness</p></div>
                                <button onclick="SettingsPage.updateConfig('aiEnabled', ${!this.config.aiEnabled})" class="w-16 h-8 rounded-full border-2 border-card ${this.config.aiEnabled ? 'bg-meme-green' : 'bg-gray-800'} relative transition-all shadow-brutal"><div class="absolute top-1 ${this.config.aiEnabled ? 'right-1' : 'left-1'} w-5 h-5 bg-white border-2 border-card rounded-full transition-all"></div></button>
                            </div>
                            <div class="space-y-4">
                                <label class="font-mono text-[10px] font-black uppercase text-muted-text tracking-widest">NEURAL MODEL</label>
                                <div class="bg-surface border-4 border-card p-4 shadow-brutal">
                                    <select onchange="SettingsPage.updateConfig('aiModel', this.value)" class="w-full bg-transparent font-display text-2xl text-meme-pink uppercase italic outline-none cursor-pointer">
                                        <option value="gemini-pro" class="bg-bg" ${this.config.aiModel === 'gemini-pro' ? 'selected' : ''}>GEMINI 1.5 PRO (MAX IQ)</option>
                                        <option value="gemini-flash" class="bg-bg" ${this.config.aiModel === 'gemini-flash' ? 'selected' : ''}>GEMINI 1.5 FLASH (SPEED)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-surface border-4 border-card shadow-brutal-lg overflow-hidden rotate-[1deg]">
                        <div class="p-8 border-b-4 border-card bg-bg flex items-center gap-4"><i class="fas fa-shield-halved text-meme-green text-3xl"></i><h3 class="text-4xl font-display text-primary-text italic uppercase tracking-tighter">FIREWALL OPS</h3></div>
                        <div class="p-8 space-y-10">
                            <div class="space-y-4">
                                <label class="font-mono text-[10px] font-black uppercase text-muted-text tracking-widest">AUTO-LOCKDOWN (MINS)</label>
                                <div class="bg-surface border-4 border-card p-4 shadow-brutal"><input type="number" value="${this.config.autoLock}" onchange="SettingsPage.updateConfig('autoLock', parseInt(this.value))" class="w-full bg-transparent font-display text-4xl text-meme-green outline-none italic"></div>
                            </div>
                            <div class="flex items-center justify-between p-6 bg-surface border-4 border-card shadow-brutal">
                                <div><h4 class="font-display text-2xl text-primary-text italic uppercase">Giga Mode</h4><p class="font-mono text-[9px] text-muted-text font-bold uppercase">Exposure of technical log streams</p></div>
                                <button onclick="SettingsPage.updateConfig('advancedMode', ${!this.config.advancedMode})" class="w-16 h-8 rounded-full border-2 border-card ${this.config.advancedMode ? 'bg-meme-green' : 'bg-gray-800'} relative transition-all shadow-brutal"><div class="absolute top-1 ${this.config.advancedMode ? 'right-1' : 'left-1'} w-5 h-5 bg-white border-2 border-card rounded-full transition-all"></div></button>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-end gap-6 pt-10">
                        <button onclick="SettingsPage.resetToDefaults()" class="px-10 py-5 bg-bg border-4 border-card text-muted-text font-display text-2xl uppercase italic shadow-brutal hover:text-meme-pink transition-all">FACTORY RESET</button>
                        <button onclick="SettingsPage.saveConfig()" class="px-16 py-6 bg-meme-pink text-primary-text font-display text-5xl border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">SAVE PARAMS</button>
                    </div>
                </div>
            </div>
        `;
    },

    resetToDefaults: function() {
        if (confirm('PERMANENTLY REVERT TO FACTORY SPECS?')) {
            this.config = { ...this.defaults };
            this.saveConfig();
            this.renderSettings();
        }
    }
};

window.SettingsPage = SettingsPage;
