/**
 * MODAL COMPONENTS
 */

window.UIManager.register('modals', () => {
    return `
        <!-- More Menu Modal -->
        <div id="moreMenuModal" class="hidden fixed inset-0 bg-primary/95 z-[200] flex flex-col animate-fade-in p-4">
            <div class="flex justify-between items-center mb-6">
                <a href="index.html" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src="asset/android-icon-192x192.png" alt="Canonix Logo" class="w-6 h-6 object-contain">
                    <span class="text-accent font-display uppercase tracking-tight text-lg">
                        Canonix
                    </span>
                </a>

                <h2 class="text-2xl font-display text-accent uppercase tracking-tight">EXPLORER</h2>

                <button onclick="toggleMoreMenu()" class="w-8 h-8 flex items-center justify-center border border-secondary shadow-brutal hover:rotate-90 transition-transform">
                    <i class="fas fa-ellipsis-v text-accent text-base"></i>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar">
                <div class="grid grid-cols-2 gap-3">
                    <a href="launchpad.html" class="flex flex-col items-center gap-2 p-4 bg-secondary border border-secondary shadow-brutal hover:shadow-none transition-all group text-center">
                        <div class="w-10 h-10 bg-soft-success border border-secondary flex items-center justify-center text-black group-hover:rotate-6 transition-transform text-base"><i class="fas fa-rocket"></i></div>
                        <span class="font-display text-base text-primary-text group-hover:text-soft-success transition-colors uppercase">Launchpad</span>
                    </a>
                    <a href="pre-market.html" class="flex flex-col items-center gap-2 p-4 bg-secondary border border-secondary shadow-brutal hover:shadow-none transition-all group text-center">
                        <div class="w-10 h-10 bg-soft-failed border border-secondary flex items-center justify-center text-primary-text group-hover:rotate-6 transition-transform text-base"><i class="fas fa-clock"></i></div>
                        <span class="font-display text-base text-primary-text group-hover:text-soft-failed transition-colors uppercase">Pre-Market</span>
                    </a>
                    <a href="vesting.html" class="flex flex-col items-center gap-2 p-4 bg-secondary border border-secondary shadow-brutal hover:shadow-none transition-all group text-center">
                        <div class="w-10 h-10 bg-accent border border-secondary flex items-center justify-center text-black group-hover:rotate-6 transition-transform text-base"><i class="fas fa-layer-group"></i></div>
                        <span class="font-display text-base text-primary-text group-hover:text-accent transition-colors uppercase">Vesting</span>
                    </a>
                    <a href="locked-liquidity-pool.html" class="flex flex-col items-center gap-2 p-4 bg-secondary border border-secondary shadow-brutal hover:shadow-none transition-all group text-center">
                        <div class="w-10 h-10 bg-soft-warning border border-secondary flex items-center justify-center text-black group-hover:rotate-6 transition-transform text-base"><i class="fas fa-lock"></i></div>
                        <span class="font-display text-base text-primary-text group-hover:text-soft-warning transition-colors uppercase">Lp Lock</span>
                    </a>
                    <a href="reward.html" class="flex flex-col items-center gap-2 p-4 bg-secondary border border-secondary shadow-brutal hover:shadow-none transition-all group text-center">
                        <div class="w-10 h-10 bg-soft-success border border-secondary flex items-center justify-center text-black group-hover:rotate-6 transition-transform text-base"><i class="fas fa-gift"></i></div>
                        <span class="font-display text-base text-primary-text group-hover:text-soft-success transition-colors uppercase">Rewards</span>
                    </a>
                    <a href="daily.html" class="flex flex-col items-center gap-2 p-4 bg-secondary border border-secondary shadow-brutal hover:shadow-none transition-all group text-center">
                        <div class="w-10 h-10 bg-accent border border-secondary flex items-center justify-center text-black group-hover:rotate-6 transition-transform text-base"><i class="fas fa-calendar-check"></i></div>
                        <span class="font-display text-base text-primary-text group-hover:text-accent transition-colors uppercase">Daily</span>
                    </a>
                </div>
            </div>
            <div class="mt-6">
                <button onclick="showConnectModal()" class="w-full py-3 bg-accent text-black font-display text-xl border border-secondary shadow-brutal hover:shadow-none transition-all uppercase italic">Connect Wallet</button>
            </div>
        </div>

        <!-- Token Selection Modal -->
        <div id="tokenModal" class="hidden fixed inset-0 bg-primary/95 z-[333] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary shadow-minimal w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col">
                <div class="p-3 border-b border-secondary flex justify-between items-center bg-accent">
                    <h3 class="text-xl font-display text-black uppercase tracking-tight">Select Token</h3>
                    <button onclick="hideTokenSelector()" class="text-black hover:rotate-90 transition-transform">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>
                <div class="p-3 bg-primary border-b border-secondary">
                    <input type="text" id="tokenSearch" placeholder="SEARCH..." class="w-full px-3 py-2 bg-secondary border border-secondary text-primary-text font-sans text-sm outline-none focus:border-accent placeholder:text-muted-text uppercase" oninput="filterTokens()">
                </div>
                <div id="tokenList" class="flex-1 overflow-y-auto no-scrollbar bg-bg"></div>
            </div>
        </div>

        <!-- Connect Wallet Modal -->
        <div id="connectModal" class="hidden fixed inset-0 bg-primary/95 z-[100] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary shadow-minimal w-full max-w-xs overflow-hidden">
                <div class="p-3 border-b border-secondary flex justify-between items-center bg-accent">
                    <h3 class="text-xl font-display text-black uppercase tracking-tight">Connect Wallet</h3>
                    <button onclick="hideConnectModal()" class="text-black hover:scale-110 transition-transform"><i class="fas fa-times text-base"></i></button>
                </div>
                <div class="p-3 space-y-2 bg-primary">
                    <button onclick="connectWallet('internal')" class="w-full flex items-center justify-between p-3 bg-secondary border border-secondary shadow-brutal-sm hover:shadow-none transition-all group">
                        <div class="flex items-center gap-2.5 text-left">
                            <div class="w-8 h-8 bg-soft-success border border-secondary flex items-center justify-center text-black text-base group-hover:rotate-6 transition-transform"><i class="fas fa-shield-alt"></i></div>
                            <div>
                                <div class="text-base font-display text-primary-text uppercase leading-none">Internal</div>
                                <div class="font-mono text-[6px] text-muted-text font-bold uppercase">Secure & Encrypted</div>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right text-muted-text text-[10px]"></i>
                    </button>
                    <button onclick="connectWallet('paxihub')" class="w-full flex items-center justify-between p-3 bg-secondary border border-secondary shadow-brutal-sm hover:shadow-none transition-all group">
                        <div class="flex items-center gap-2.5 text-left">
                            <div class="w-8 h-8 bg-soft-failed border border-secondary flex items-center justify-center text-primary-text text-base group-hover:rotate-6 transition-transform"><i class="fas fa-wallet"></i></div>
                            <div>
                                <div class="text-base font-display text-primary-text uppercase leading-none">PaxiHub</div>
                                <div class="font-mono text-[6px] text-muted-text font-bold uppercase">Mobile & Extension</div>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right text-muted-text text-[10px]"></i>
                    </button>
                    <button onclick="connectWallet('keplr')" class="w-full flex items-center justify-between p-3 bg-secondary border border-secondary shadow-brutal-sm hover:shadow-none transition-all group">
                        <div class="flex items-center gap-2.5 text-left">
                            <div class="w-8 h-8 bg-accent border border-secondary flex items-center justify-center text-black text-base group-hover:rotate-6 transition-transform"><i class="fas fa-rocket"></i></div>
                            <div>
                                <div class="text-base font-display text-primary-text uppercase leading-none">Keplr</div>
                                <div class="font-mono text-[6px] text-muted-text font-bold uppercase">Cosmos Extension</div>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right text-muted-text text-[10px]"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- PIN Bottom Sheet -->
        <div id="pinSheet" class="hidden fixed inset-0 bg-primary/95 z-[100000] flex items-end justify-center">
            <div class="bg-secondary w-full max-w-md border-t-2 border-secondary animate-slide-up flex flex-col p-5 pb-8">
                <div class="w-12 h-1 bg-primary rounded-full mx-auto mb-6 shrink-0"></div>
                <h3 id="pinTitle" class="text-2xl font-display text-center mb-1 uppercase tracking-tight text-accent">Unlock</h3>
                <p id="pinMsg" class="font-mono text-[7px] text-muted-text text-center mb-6 font-bold uppercase tracking-widest">Enter your 6-digit access code</p>

                <!-- Pin Dots -->
                <div id="pinDots" class="flex justify-center gap-3 mb-8 shrink-0">
                    <div class="pin-dot w-4 h-4 bg-primary border border-secondary shadow-minimal"></div>
                    <div class="pin-dot w-4 h-4 bg-primary border border-secondary shadow-minimal"></div>
                    <div class="pin-dot w-4 h-4 bg-primary border border-secondary shadow-minimal"></div>
                    <div class="pin-dot w-4 h-4 bg-primary border border-secondary shadow-minimal"></div>
                    <div class="pin-dot w-4 h-4 bg-primary border border-secondary shadow-minimal"></div>
                    <div class="pin-dot w-4 h-4 bg-primary border border-secondary shadow-minimal"></div>
                </div>

                <!-- Keypad -->
                <div class="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                    <button onclick="pressPin(1)" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">1</button>
                    <button onclick="pressPin(2)" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">2</button>
                    <button onclick="pressPin(3)" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">3</button>
                    <button onclick="pressPin(4)" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">4</button>
                    <button onclick="pressPin(5)" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">5</button>
                    <button onclick="pressPin(6)" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">6</button>
                    <button onclick="pressPin(7)" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">7</button>
                    <button onclick="pressPin(8)" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">8</button>
                    <button onclick="pressPin(9)" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">9</button>
                    <button onclick="authenticateBiometric()" class="w-12 h-12 flex items-center justify-center text-accent hover:scale-110 transition-transform"><i class="fas fa-fingerprint text-2xl"></i></button>
                    <button onclick="pressPin(0)" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">0</button>
                    <button onclick="backspacePin()" class="w-12 h-12 flex items-center justify-center text-soft-failed hover:scale-110 transition-transform"><i class="fas fa-backspace text-xl"></i></button>
                </div>
                <button onclick="hidePinSheet()" class="mt-6 font-display text-lg text-muted-text uppercase hover:text-primary-text transition-colors tracking-widest shrink-0">Abort</button>
            </div>
        </div>

        <!-- Internal Wallet Sheet -->
        <div id="internalWalletSheet" class="fixed inset-0 bg-primary/80 z-[190] flex items-end justify-center transition-transform duration-300 translate-y-full">
            <div class="bg-secondary w-full max-w-md rounded-t-[2rem] border-t-2 border-secondary p-6 flex flex-col items-center">
                <div class="w-12 h-1 bg-primary rounded-full mb-6"></div>
                <div id="walletSheetContent" class="w-full">
                    <!-- Dynamically populated -->
                </div>
                <button onclick="hideInternalWalletSheet()" class="mt-6 font-display text-lg text-muted-text uppercase tracking-widest hover:text-soft-failed transition-colors">Close</button>
            </div>
        </div>

        <!-- Slippage Settings Modal -->
        <div id="slippageModal" class="hidden fixed inset-0 bg-primary/95 z-[400] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary shadow-minimal w-full max-w-[240px] overflow-hidden">
                <div class="p-2.5 border-b border-secondary flex justify-between items-center bg-soft-warning">
                    <h3 class="font-display text-lg text-black uppercase">SLIPPAGE</h3>
                    <button onclick="window.addClass('slippageModal', 'hidden')" class="text-black hover:rotate-90 transition-transform"><i class="fas fa-times text-base"></i></button>
                </div>
                <div class="p-3 space-y-3 bg-primary">
                    <div class="grid grid-cols-2 gap-1.5">
                        <button onclick="setSlippage(0.1)" class="py-1.5 bg-secondary border border-secondary text-primary-text font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase">0.1%</button>
                        <button onclick="setSlippage(0.5)" class="py-1.5 bg-secondary border border-secondary text-primary-text font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase">0.5%</button>
                        <button onclick="setSlippage(1.0)" class="py-1.5 bg-secondary border border-secondary text-primary-text font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase">1.0%</button>
                        <button onclick="setSlippage(30.0)" class="py-1.5 bg-secondary border border-secondary text-primary-text font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase">30.0%</button>
                    </div>
                    <div class="relative">
                        <input type="number" id="customSlippage" placeholder="CUSTOM" class="w-full pl-3 pr-8 py-2 bg-secondary border border-secondary text-primary-text font-display text-lg outline-none focus:border-accent placeholder:text-muted-text uppercase" oninput="updateCustomSlippage()">
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text font-display text-lg italic">%</span>
                    </div>
                    <button onclick="window.addClass('slippageModal', 'hidden')" class="w-full py-2.5 bg-accent text-black font-display text-xl border border-secondary shadow-brutal hover:shadow-none transition-all uppercase">Save</button>
                </div>
            </div>
        </div>

        <!-- Wallet Switcher Modal -->
        <div id="walletSwitcherModal" class="hidden fixed inset-0 bg-primary/95 z-[60000] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary shadow-minimal w-full max-w-xs overflow-hidden">
                <div class="p-3 border-b border-secondary flex justify-between items-center bg-soft-success">
                    <h3 class="text-xl font-display text-black uppercase tracking-tight">Switch Wallet</h3>
                    <button onclick="window.WalletUI.hideWalletSwitcher()" class="text-black hover:scale-110 transition-transform"><i class="fas fa-times text-base"></i></button>
                </div>
                <div id="walletListContainer" class="p-3 space-y-2 bg-primary max-h-[50vh] overflow-y-auto no-scrollbar">
                    <!-- Populated by JS -->
                </div>
                <div class="p-3 bg-secondary border-t border-secondary">
                    <div class="flex flex-col gap-3 w-full">
                        <button onclick="window.WalletUI.hideWalletSwitcher(); window.WalletUI.showCreateModal()" class="w-full py-3 bg-soft-success text-black font-display text-lg border border-secondary shadow-brutal hover:shadow-none transition-all uppercase">CREATE NEW WALLET</button>
                        <button onclick="window.WalletUI.hideWalletSwitcher(); window.WalletUI.showImportModal()" class="w-full py-3 bg-primary border border-secondary text-primary-text font-display text-lg shadow-minimal hover:shadow-none transition-all uppercase">IMPORT WALLET</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Transaction Confirmation Modal -->
        <div id="txConfirmModal" class="hidden fixed inset-0 bg-primary/98 z-[70000] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary w-full max-w-[280px] rounded-[1.5rem] p-5 animate-slide-up shadow-minimal">
                <div class="text-center mb-4">
                    <div class="w-10 h-10 bg-soft-success border border-secondary shadow-brutal-sm flex items-center justify-center mx-auto mb-3 rotate-[-5deg]">
                        <i class="fas fa-shield-check text-xl text-black"></i>
                    </div>
                    <h3 class="text-xl font-display uppercase tracking-tight mb-1 text-primary-text leading-none">CONFIRM</h3>
                    <p id="txConfirmMsg" class="font-mono text-[6px] text-muted-text uppercase font-bold tracking-widest">VERIFY ACTION</p>
                </div>

                <div class="space-y-2.5 bg-primary border border-secondary p-3 mb-5 shadow-inner">
                    <div class="flex justify-between items-center gap-2">
                        <span class="font-mono text-[6px] uppercase font-bold text-muted-text shrink-0">ACTION</span>
                        <span id="txConfirmAction" class="font-display text-sm italic text-accent uppercase truncate text-right">--</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-mono text-[6px] uppercase font-bold text-muted-text">NET</span>
                        <span id="txConfirmNetwork" class="font-display text-sm text-soft-warning italic tracking-tight">PAXI NET</span>
                    </div>
                    <div id="txConfirmFeeRow" class="flex justify-between items-center pt-2 border-t border-secondary">
                        <span class="font-mono text-[6px] uppercase font-bold text-muted-text">FEE</span>
                        <span id="txConfirmFee" class="font-mono text-[9px] font-bold text-soft-success">--</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button id="txCancelBtn" class="py-2.5 bg-primary border border-secondary text-muted-text font-display text-base uppercase hover:text-primary-text transition-all shadow-brutal-sm hover:shadow-none">Abort</button>
                    <button id="txConfirmBtn" class="py-2.5 bg-soft-success text-black font-display text-base uppercase border border-secondary shadow-brutal-sm hover:shadow-none">CONFIRM</button>
                </div>
            </div>
        </div>

        <!-- Transaction Result Modal -->
        <div id="txResultModal" class="hidden fixed inset-0 bg-primary/98 z-[80000] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary w-full max-w-xs rounded-[1.5rem] p-5 animate-slide-up overflow-y-auto max-h-[85vh] shadow-minimal no-scrollbar text-center">
                <div id="txResultIcon" class="w-12 h-12 border border-secondary shadow-brutal-sm flex items-center justify-center mx-auto mb-3 rotate-[5deg]">
                </div>
                <h3 id="txResultStatus" class="text-2xl font-display uppercase tracking-tight mb-1 leading-none">STATUS</h3>
                <div id="txResultType" class="font-mono text-[6px] font-bold uppercase tracking-widest text-muted-text italic mb-4">LOG</div>

                <div class="space-y-2 bg-primary border border-secondary p-3 mb-5 shadow-inner text-left">
                    <div class="flex justify-between items-center border-b border-secondary pb-1.5 mb-1.5">
                        <span class="font-mono text-[6px] uppercase font-bold text-muted-text">TIME</span>
                        <span id="txResultTime" class="font-mono text-[9px] text-accent uppercase">--:--</span>
                    </div>

                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-[6px] uppercase font-bold text-muted-text">TYPE</span>
                            <span id="logType" class="font-display text-sm italic text-primary-text uppercase">--</span>
                        </div>
                        <div class="flex justify-between items-center gap-4">
                            <span class="font-mono text-[6px] uppercase font-bold text-muted-text">ASSET</span>
                            <span id="logAsset" class="font-display text-sm text-soft-warning uppercase text-right truncate">--</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-[6px] uppercase font-bold text-muted-text">AMOUNT</span>
                            <span id="logAmount" class="font-mono text-[9px] font-bold text-soft-success">0.00</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-[6px] uppercase font-bold text-muted-text">NETWORK</span>
                            <span id="logNetwork" class="font-display text-sm text-soft-warning italic">PAXI NET</span>
                        </div>
                        <div class="flex flex-col gap-1 mt-1.5">
                            <span class="font-mono text-[6px] uppercase font-bold text-muted-text text-center">ADDRESS / RECIPIENT</span>
                            <div class="flex items-center gap-1.5 p-1.5 bg-primary border border-secondary">
                                <code id="logAddress" class="font-mono text-[6px] text-muted-text flex-1 truncate uppercase">--</code>
                                <button id="copyAddressBtn" class="text-accent hover:scale-110 transition-all"><i class="fas fa-copy text-[10px]"></i></button>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1 mt-1.5">
                            <span class="font-mono text-[6px] uppercase font-bold text-muted-text text-center">HASH</span>
                            <div class="flex items-center gap-1.5 p-1.5 bg-primary border border-secondary">
                                <code id="logHash" class="font-mono text-[6px] text-muted-text flex-1 truncate uppercase">--</code>
                                <button id="viewHashBtn" class="text-soft-success hover:scale-110 transition-all"><i class="fas fa-external-link-alt text-[10px]"></i></button>
                            </div>
                        </div>
                        <div id="txExtraInfo" class="hidden flex flex-col gap-1.5 pt-1.5 border-t border-secondary mt-1.5">
                            <div class="flex justify-between items-center">
                                <span class="font-mono text-[6px] uppercase font-bold text-muted-text">HEIGHT</span>
                                <span id="logHeight" class="font-mono text-[9px] text-primary-text">--</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-mono text-[6px] uppercase font-bold text-muted-text">GAS USED</span>
                                <span id="logGasUsed" class="font-mono text-[9px] text-accent">--</span>
                            </div>
                        </div>
                        <div id="logErrorContainer" class="hidden flex flex-col gap-1">
                            <span class="font-mono text-[6px] uppercase font-bold text-soft-failed text-center">ERROR</span>
                            <div class="p-2 bg-soft-failed/10 border border-soft-failed/30">
                                <p id="logError" class="font-mono text-[6px] text-soft-failed leading-tight font-bold uppercase break-words italic">--</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button onclick="window.closeTxResult()" class="w-full py-3 bg-primary border border-secondary text-primary-text font-display text-lg uppercase shadow-minimal hover:bg-secondary transition-all">CLOSE</button>
            </div>
        </div>

        <!-- AI Modal -->
        <div id="aiModal" class="hidden fixed inset-0 bg-primary/95 z-[120] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary shadow-minimal w-full max-w-lg max-h-[70vh] overflow-y-auto no-scrollbar relative">
                <div class="p-3 border-b border-secondary flex justify-between items-center sticky top-0 bg-secondary z-10">
                    <h3 class="text-xl font-display text-soft-success uppercase"><i class="fas fa-brain mr-2 text-base"></i>AI ORACLE</h3>
                    <button onclick="hideAI()" class="text-soft-failed hover:scale-110 transition-transform"><i class="fas fa-times text-lg"></i></button>
                </div>
                <div id="aiContent" class="p-4 font-mono text-[9px] text-muted-text leading-relaxed uppercase tracking-wide"></div>
            </div>
        </div>

        <!-- Console Log Modal -->
        <div id="consoleModal" class="hidden fixed inset-0 bg-primary/98 z-[9999] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary w-full max-w-3xl h-[60vh] flex flex-col overflow-hidden shadow-minimal">
                <div class="p-2.5 border-b border-secondary flex justify-between items-center bg-secondary">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-terminal text-soft-success text-base"></i>
                        <span class="font-display text-base text-primary-text uppercase">SYSTEM CONSOLE</span>
                    </div>
                    <button onclick="toggleConsoleModal()" class="text-soft-failed hover:scale-110 transition-transform"><i class="fas fa-times text-base"></i></button>
                </div>
                <div id="consoleContent" class="flex-1 overflow-y-auto p-3 font-mono text-[7px] text-soft-success bg-primary no-scrollbar selection:bg-soft-success selection:text-black"></div>
                <div class="p-2 border-t border-secondary bg-secondary flex justify-between items-center">
                    <span id="consoleStats" class="font-mono text-[7px] text-muted-text font-bold uppercase tracking-widest">0 LOGS</span>
                    <button onclick="clearConsoleLogs()" class="font-display text-sm text-soft-failed hover:text-primary-text transition-colors uppercase border-b border-soft-failed leading-none">PURGE</button>
                </div>
            </div>
        </div>
    `;
});
