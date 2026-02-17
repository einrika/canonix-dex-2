// ============================================
// SETTINGS-PAGE.JS - User Preferences & System Controls
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

        // Dispatch event for other modules to pick up changes
        window.dispatchEvent(new CustomEvent('canonix_settings_updated', { detail: this.config }));
    },

    updateConfig: function(key, value) {
        this.config[key] = value;
        this.saveConfig();
        this.renderSettings(); // Re-render to show updated state
    },

    renderSettings: function() {
        const container = document.getElementById('settings-ui');
        if (!container) return;

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Sidebar Tabs -->
                <div class="lg:col-span-1 space-y-2">
                    <button class="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-up text-up font-bold transition-all">
                        <i class="fas fa-network-wired"></i> General & Network
                    </button>
                    <button class="w-full flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border text-gray-400 hover:text-white transition-all">
                        <i class="fas fa-brain"></i> AI Configuration
                    </button>
                    <button class="w-full flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border text-gray-400 hover:text-white transition-all">
                        <i class="fas fa-shield-alt"></i> Security & Privacy
                    </button>
                    <button class="w-full flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border text-gray-400 hover:text-white transition-all">
                        <i class="fas fa-palette"></i> Appearance
                    </button>
                </div>

                <!-- Main Content -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Network Section -->
                    <div class="bg-card border border-border rounded-[2.5rem] overflow-hidden">
                        <div class="p-8 border-b border-border">
                            <h3 class="text-xl font-black italic uppercase">Network & Node Settings</h3>
                        </div>
                        <div class="p-8 space-y-6">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase text-gray-500 tracking-widest">Active Network</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <button onclick="SettingsPage.updateConfig('network', 'mainnet')" class="p-4 rounded-2xl border ${this.config.network === 'mainnet' ? 'border-up bg-up/5 text-up' : 'border-border bg-surface text-gray-500'} font-bold transition-all">
                                        Paxi Mainnet
                                    </button>
                                    <button onclick="SettingsPage.updateConfig('network', 'testnet')" class="p-4 rounded-2xl border ${this.config.network === 'testnet' ? 'border-up bg-up/5 text-up' : 'border-border bg-surface text-gray-500'} font-bold transition-all">
                                        Paxi Testnet
                                    </button>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase text-gray-500 tracking-widest">Custom RPC Endpoint</label>
                                <input type="text" value="${this.config.rpc}"
                                    onchange="SettingsPage.updateConfig('rpc', this.value)"
                                    placeholder="https://..."
                                    class="w-full p-4 bg-surface border border-border rounded-2xl text-sm font-mono focus:border-up outline-none transition-all">
                            </div>

                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase text-gray-500 tracking-widest">Custom LCD Endpoint</label>
                                <input type="text" value="${this.config.lcd}"
                                    onchange="SettingsPage.updateConfig('lcd', this.value)"
                                    placeholder="https://..."
                                    class="w-full p-4 bg-surface border border-border rounded-2xl text-sm font-mono focus:border-up outline-none transition-all">
                            </div>
                        </div>
                    </div>

                    <!-- AI Configuration -->
                    <div class="bg-card border border-border rounded-[2.5rem] overflow-hidden">
                        <div class="p-8 border-b border-border">
                            <h3 class="text-xl font-black italic uppercase">AI Analysis Preferences</h3>
                        </div>
                        <div class="p-8 space-y-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold text-white">Enable AI Insights</h4>
                                    <p class="text-xs text-gray-500">Show Gemini-powered analysis in terminals</p>
                                </div>
                                <button onclick="SettingsPage.updateConfig('aiEnabled', ${!this.config.aiEnabled})" class="w-12 h-6 rounded-full ${this.config.aiEnabled ? 'bg-up' : 'bg-gray-700'} relative transition-all">
                                    <div class="absolute top-1 ${this.config.aiEnabled ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all"></div>
                                </button>
                            </div>

                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase text-gray-500 tracking-widest">Model Selection</label>
                                <select onchange="SettingsPage.updateConfig('aiModel', this.value)" class="w-full p-4 bg-surface border border-border rounded-2xl text-sm font-bold focus:border-up outline-none appearance-none">
                                    <option value="gemini-pro" ${this.config.aiModel === 'gemini-pro' ? 'selected' : ''}>Gemini 1.5 Pro (Balanced)</option>
                                    <option value="gemini-flash" ${this.config.aiModel === 'gemini-flash' ? 'selected' : ''}>Gemini 1.5 Flash (Fast)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Security Section -->
                    <div class="bg-card border border-border rounded-[2.5rem] overflow-hidden">
                        <div class="p-8 border-b border-border">
                            <h3 class="text-xl font-black italic uppercase">Security & Privacy</h3>
                        </div>
                        <div class="p-8 space-y-6">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black uppercase text-gray-500 tracking-widest">Auto-Lock Session (Minutes)</label>
                                <input type="number" value="${this.config.autoLock}"
                                    onchange="SettingsPage.updateConfig('autoLock', parseInt(this.value))"
                                    class="w-full p-4 bg-surface border border-border rounded-2xl text-sm font-bold focus:border-up outline-none transition-all">
                            </div>

                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-bold text-white">Advanced Mode</h4>
                                    <p class="text-xs text-gray-500">Enable technical logs and raw transaction data</p>
                                </div>
                                <button onclick="SettingsPage.updateConfig('advancedMode', ${!this.config.advancedMode})" class="w-12 h-6 rounded-full ${this.config.advancedMode ? 'bg-up' : 'bg-gray-700'} relative transition-all">
                                    <div class="absolute top-1 ${this.config.advancedMode ? 'right-1' : 'left-1'} w-4 h-4 bg-white rounded-full transition-all"></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-4">
                        <button onclick="SettingsPage.resetToDefaults()" class="px-8 py-4 bg-surface border border-border rounded-2xl font-bold hover:text-down transition-all">RESET DEFAULTS</button>
                        <button onclick="SettingsPage.saveConfig()" class="btn-primary px-12 py-4 rounded-2xl font-black text-white italic">SAVE ALL CHANGES</button>
                    </div>
                </div>
            </div>
        `;
    },

    resetToDefaults: function() {
        if (confirm('Reset all settings to default values?')) {
            this.config = { ...this.defaults };
            this.saveConfig();
            this.renderSettings();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('settings-ui')) {
        SettingsPage.init();
    }
});
