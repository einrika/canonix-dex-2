// ============================================
// INTERNAL WALLET SHEET LOGIC
// ============================================

import { State } from '../core/state.js';
import { wallets, security } from '../wallet-section/wallet-core.js';
import { waitForLibrary, showNotif } from '../core/utils.js';

export const InternalWalletSheetLogic = (container) => {
    const sheet = container.querySelector('#internalWalletSheet');
    const content = container.querySelector('#walletSheetContent');

    const renderOptions = () => {
        const hasWallet = wallets.getWallets().length > 0;
        if (hasWallet) {
            content.innerHTML = `
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-meme-cyan/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-shield-alt text-2xl text-meme-cyan"></i>
                    </div>
                    <h3 class="text-xl font-bold uppercase italic">Internal Wallet</h3>
                </div>
                <div class="space-y-3">
                    <button id="unlock-internal-btn" class="w-full py-4 bg-meme-cyan text-black font-display rounded-xl font-bold uppercase italic">UNLOCK WALLET</button>
                    <button id="create-new-btn" class="w-full py-3 text-gray-500 font-semibold text-sm uppercase italic">ADD ANOTHER WALLET</button>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-meme-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-plus-circle text-2xl text-meme-green"></i>
                    </div>
                    <h3 class="text-xl font-bold uppercase italic">Setup Wallet</h3>
                </div>
                <div class="space-y-3">
                    <button id="create-new-btn" class="w-full py-4 bg-meme-green text-black font-display rounded-xl font-bold uppercase italic">CREATE NEW WALLET</button>
                    <button id="import-btn" class="w-full py-4 bg-black border border-gray-800 text-white font-display rounded-xl font-bold uppercase italic">IMPORT SEED PHRASE</button>
                </div>
            `;
        }
        attachEvents();
    };

    const attachEvents = () => {
        content.querySelector('#create-new-btn')?.addEventListener('click', () => createNewWallet());
        content.querySelector('#import-btn')?.addEventListener('click', () => showImportForm());
        content.querySelector('#unlock-internal-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('paxi_show_pin_sheet', {
                detail: {
                    title: 'Unlock Wallet',
                    callback: async (pin) => {
                        const active = wallets.getActiveWallet();
                        try {
                            const paxi = await waitForLibrary('PaxiCosmJS');
                            const decrypted = await security.decrypt(active.encryptedData, pin);
                            const wallet = await paxi.DirectSecp256k1HdWallet.fromMnemonic(decrypted, { prefix: "paxi" });
                            const accounts = await wallet.getAccounts();

                            State.set('wallet', {
                                address: accounts[0].address,
                                signer: wallet,
                                type: 'internal',
                                name: active.name
                            });
                            State.set('walletType', 'internal');
                            security.setSessionPin(pin);
                            hide();
                        } catch (e) {
                            showNotif('Wrong PIN', 'error');
                        }
                    }
                }
            }));
        });
    };

    const createNewWallet = async () => {
        try {
            const paxi = await waitForLibrary('PaxiCosmJS');
            const wallet = await paxi.DirectSecp256k1HdWallet.generate(12, { prefix: "paxi" });
            const mnemonic = wallet.mnemonic;

            content.innerHTML = `
                <h3 class="text-lg font-bold mb-2 uppercase italic">Back up Seed Phrase</h3>
                <div class="bg-black/40 p-4 rounded-xl grid grid-cols-3 gap-2 mb-6 border border-gray-800 font-mono text-[10px]">
                    ${mnemonic.split(' ').map((w, i) => `<div><span class="text-gray-600">${i+1}.</span> ${w}</div>`).join('')}
                </div>
                <button id="confirm-backup-btn" class="w-full py-4 bg-meme-cyan text-black font-display rounded-xl font-bold uppercase italic">I HAVE WRITTEN IT DOWN</button>
            `;

            content.querySelector('#confirm-backup-btn')?.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('paxi_show_pin_sheet', {
                    detail: {
                        title: 'Set 6-Digit PIN',
                        callback: async (pin) => {
                            const accounts = await wallet.getAccounts();
                            const encrypted = await security.encrypt(mnemonic, pin);
                            await wallets.addWallet('My Wallet', 'mnemonic', encrypted, accounts[0].address);
                            security.setSessionPin(pin);
                            State.set('wallet', { address: accounts[0].address, signer: wallet, type: 'internal', name: 'My Wallet' });
                            State.set('walletType', 'internal');
                            hide();
                        }
                    }
                }));
            });
        } catch (e) {
            console.error(e);
        }
    };

    const showImportForm = () => {
        content.innerHTML = `
            <h3 class="text-lg font-bold mb-2 uppercase italic">Import Wallet</h3>
            <textarea id="import-mnemonic" class="w-full h-32 bg-black/40 border border-gray-800 rounded-xl p-4 text-sm mb-4 outline-none focus:border-meme-cyan" placeholder="word1 word2 ..."></textarea>
            <button id="process-import-btn" class="w-full py-4 bg-meme-cyan text-black font-display rounded-xl font-bold uppercase italic">IMPORT WALLET</button>
        `;

        content.querySelector('#process-import-btn')?.addEventListener('click', async () => {
            const mnemonic = content.querySelector('#import-mnemonic').value.trim();
            if (!mnemonic) return;

            window.dispatchEvent(new CustomEvent('paxi_show_pin_sheet', {
                detail: {
                    title: 'Set PIN',
                    callback: async (pin) => {
                        try {
                            const paxi = await waitForLibrary('PaxiCosmJS');
                            const wallet = await paxi.DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: "paxi" });
                            const accounts = await wallet.getAccounts();
                            const encrypted = await security.encrypt(mnemonic, pin);
                            await wallets.addWallet('Imported Wallet', 'mnemonic', encrypted, accounts[0].address);
                            security.setSessionPin(pin);
                            State.set('wallet', { address: accounts[0].address, signer: wallet, type: 'internal', name: 'Imported Wallet' });
                            State.set('walletType', 'internal');
                            hide();
                        } catch (e) {
                            showNotif('Invalid Seed Phrase', 'error');
                        }
                    }
                }
            }));
        });
    };

    const hide = () => {
        sheet?.classList.add('hidden');
        sheet?.classList.remove('translate-y-0');
        sheet?.classList.add('translate-y-full');
    };

    window.addEventListener('paxi_show_internal_wallet', () => {
        sheet?.classList.remove('hidden');
        sheet?.classList.remove('translate-y-full');
        sheet?.classList.add('translate-y-0');
        renderOptions();
    });

    container.querySelector('#close-wallet-sheet')?.addEventListener('click', hide);
};
