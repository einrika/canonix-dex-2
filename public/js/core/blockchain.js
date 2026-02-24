// ============================================
// BLOCKCHAIN.JS - Transaction Logic & CosmJS
// ============================================

import { State } from './state.js';
import { APP_CONFIG } from './config.js';
import { fetchDirect, log, showNotif, formatAmount, toMicroAmount, waitForLibrary } from './utils.js';

// HELPER: GAS SIMULATION
export const simulateGas = async function(messages, memo = "", options = {}) {
    try {
        const wallet = State.get('wallet');
        if (!wallet) throw new Error("Wallet not connected");

        const { type = 'default' } = options;
        const endpoints = APP_CONFIG;

        // 1. Prepare dummy signer data for simulation
        const accountRes = await fetchDirect(`${endpoints.LCD}/cosmos/auth/v1beta1/accounts/${wallet.address}`);
        const account = accountRes.account.base_account || accountRes.account;

        let pubkeyBytes;
        if (wallet.signer) {
            const accounts = await wallet.signer.getAccounts();
            pubkeyBytes = accounts[0].pubkey;
        } else {
             if (typeof wallet.public_key === 'string') {
                pubkeyBytes = Uint8Array.from(atob(wallet.public_key), c => c.charCodeAt(0));
            } else if (wallet.public_key) {
                pubkeyBytes = new Uint8Array(wallet.public_key);
            }
        }

        const paxi = await waitForLibrary('PaxiCosmJS');
        const pubkeyAny = {
            typeUrl: "/cosmos.crypto.secp256k1.PubKey",
            value: paxi.PubKey.encode({ key: pubkeyBytes }).finish()
        };

        const txBody = paxi.TxBody.fromPartial({ messages, memo });
        const authInfo = paxi.AuthInfo.fromPartial({
            signerInfos: [{
                publicKey: pubkeyAny,
                modeInfo: { single: { mode: 1 } },
                sequence: BigInt(account.sequence)
            }],
            fee: { amount: [{ denom: APP_CONFIG.DENOM, amount: "0" }], gasLimit: BigInt(200000) }
        });

        const txRaw = paxi.TxRaw.fromPartial({
            bodyBytes: paxi.TxBody.encode(txBody).finish(),
            authInfoBytes: paxi.AuthInfo.encode(authInfo).finish(),
            signatures: [new Uint8Array(64)]
        });

        const txBytes = paxi.TxRaw.encode(txRaw).finish();
        const txBytesBase64 = btoa(String.fromCharCode(...txBytes));

        const simRes = await fetchDirect(`${endpoints.LCD}/cosmos/tx/v1beta1/simulate`, {
            method: 'POST',
            body: JSON.stringify({ tx_bytes: txBytesBase64 })
        });

        if (!simRes.gas_info) throw new Error(simRes.message || "Simulation failed");

        const gasLimit = Math.ceil(parseInt(simRes.gas_info.gas_used) * 1.3).toString();
        const estimatedFee = Math.ceil(parseInt(gasLimit) * 0.025).toString();

        return {
            gasLimit: BigInt(gasLimit),
            estimatedFee: estimatedFee,
            usdValue: (parseInt(estimatedFee) / 1e6 * (State.get('paxiPrice') || 0.05)).toFixed(4)
        };

    } catch (e) {
        console.error("Gas Simulation Error:", e);
        return { gasLimit: BigInt(300000), estimatedFee: "7500", usdValue: "0.0004" };
    }
};

// HELPER: BUILD & SEND TX
export const buildAndSendTx = async function(messages, memo = "", options = {}) {
    const wallet = State.get('wallet');
    const walletType = State.get('walletType');
    if (!wallet) throw new Error("Wallet not connected");

    const { silent = false, sequenceOverride = null, type = 'default', metadata = {} } = options;

    const endpoints = {
        rpc: APP_CONFIG.RPC,
        lcd: APP_CONFIG.LCD,
        chainId: 'paxi-mainnet'
    };

    try {
        const paxi = await waitForLibrary('PaxiCosmJS');

        if (!silent) {
            showNotif('Loading', 'info');
            const gasEstimate = await simulateGas(messages, memo, { type });
            const feeDisplay = `${formatAmount(parseInt(gasEstimate.estimatedFee) / 1e6, 4)} PAXI`;

            const confirmed = await new Promise(resolve => {
                window.dispatchEvent(new CustomEvent('paxi_show_tx_confirm', {
                    detail: { memo, fee: feeDisplay, callback: resolve }
                }));
            });
            if (!confirmed) throw new Error("Transaction cancelled");
        }

        const [chainRes, accountRes, gasEstimate] = await Promise.all([
            fetchDirect(`${endpoints.rpc}/status`),
            fetchDirect(`${endpoints.lcd}/cosmos/auth/v1beta1/accounts/${wallet.address}`),
            simulateGas(messages, memo, { type })
        ]);

        const chainId = chainRes.result.node_info.network;
        const account = accountRes.account.base_account || accountRes.account;
        const accountNumber = account.account_number;
        const sequence = sequenceOverride !== null ? sequenceOverride : account.sequence;

        const fee = {
            amount: [{ denom: APP_CONFIG.DENOM, amount: gasEstimate.estimatedFee }],
            gasLimit: gasEstimate.gasLimit
        };

        let pubkeyBytes;
        if (wallet.signer) {
            const accounts = await wallet.signer.getAccounts();
            pubkeyBytes = accounts[0].pubkey;
        } else {
            if (typeof wallet.public_key === 'string') {
                pubkeyBytes = Uint8Array.from(atob(wallet.public_key), c => c.charCodeAt(0));
            } else {
                pubkeyBytes = new Uint8Array(wallet.public_key);
            }
        }

        const pubkeyAny = {
            typeUrl: "/cosmos.crypto.secp256k1.PubKey",
            value: paxi.PubKey.encode({ key: pubkeyBytes }).finish()
        };

        const txBody = paxi.TxBody.fromPartial({ messages, memo });
        const authInfo = paxi.AuthInfo.fromPartial({
            signerInfos: [{
                publicKey: pubkeyAny,
                modeInfo: { single: { mode: 1 } },
                sequence: BigInt(sequence)
            }],
            fee
        });

        const signDoc = paxi.SignDoc.fromPartial({
            bodyBytes: paxi.TxBody.encode(txBody).finish(),
            authInfoBytes: paxi.AuthInfo.encode(authInfo).finish(),
            chainId,
            accountNumber: BigInt(accountNumber)
        });

        let txRaw;
        if (walletType === 'keplr' || walletType === 'internal') {
            const signResponse = await wallet.signer.signDirect(wallet.address, signDoc);
            txRaw = paxi.TxRaw.fromPartial({
                bodyBytes: signResponse.signed.bodyBytes,
                authInfoBytes: signResponse.signed.authInfoBytes,
                signatures: [Uint8Array.from(atob(signResponse.signature.signature), c => c.charCodeAt(0))]
            });
        } else {
            const txObj = {
                bodyBytes: btoa(String.fromCharCode(...signDoc.bodyBytes)),
                authInfoBytes: btoa(String.fromCharCode(...signDoc.authInfoBytes)),
                chainId: signDoc.chainId,
                accountNumber: signDoc.accountNumber.toString()
            };
            const result = await wallet.signer.signAndSendTransaction(txObj);
            if (!result || !result.success) throw new Error("Signing rejected or failed");
            const signatureBytes = Uint8Array.from(atob(result.success), c => c.charCodeAt(0));
            txRaw = paxi.TxRaw.fromPartial({
                bodyBytes: signDoc.bodyBytes,
                authInfoBytes: signDoc.authInfoBytes,
                signatures: [signatureBytes]
            });
        }

        const txBytes = paxi.TxRaw.encode(txRaw).finish();
        const txBytesBase64 = btoa(String.fromCharCode(...txBytes));

        const broadcastRes = await fetchDirect(`${endpoints.lcd}/cosmos/tx/v1beta1/txs`, {
            method: 'POST',
            body: JSON.stringify({ tx_bytes: txBytesBase64, mode: 'BROADCAST_MODE_SYNC' })
        });

        if (!broadcastRes.tx_response || broadcastRes.tx_response.code !== 0) {
            throw new Error(`Broadcast failed: ${broadcastRes.tx_response?.raw_log || "Unknown Error"}`);
        }

        const hash = broadcastRes.tx_response.txhash;

        let attempts = 0;
        let finalResult = null;
        while (attempts < 15) {
            try {
                const pollRes = await fetchDirect(`${endpoints.rpc}/tx?hash=0x${hash}`);
                if (pollRes?.result) {
                    finalResult = pollRes.result;
                    break;
                }
            } catch (e) {}
            attempts++;
            await new Promise(r => setTimeout(r, 2000));
        }

        const isSuccess = finalResult?.tx_result?.code === 0;
        window.dispatchEvent(new CustomEvent('paxi_show_tx_result', {
            detail: {
                status: isSuccess ? 'success' : 'failed',
                type: metadata.type || 'Transaction',
                asset: metadata.asset || '--',
                amount: metadata.amount || '--',
                address: metadata.address || wallet.address,
                hash: hash
            }
        }));

        return { success: isSuccess, hash };

    } catch (err) {
        console.error("Transaction Error:", err);
        if (err.message !== "Transaction cancelled") {
            window.dispatchEvent(new CustomEvent('paxi_show_tx_result', {
                detail: {
                    status: 'failed',
                    type: metadata.type || 'Transaction',
                    error: err.message
                }
            }));
        }
        throw err;
    }
};

export const executeSwap = async function(contractAddress, offerDenom, offerAmount, minReceive, memo = "Canonix Swap") {
    const wallet = State.get('wallet');
    if (!wallet) return;

    const paxi = await waitForLibrary('PaxiCosmJS');
    const userAssets = State.get('userAssets') || [];
    const tokenDetail = userAssets.find(t => t.address === contractAddress);
    const decimals = tokenDetail?.decimals || 6;

    const msgs = [];
    const microOffer = offerDenom === APP_CONFIG.DENOM ? toMicroAmount(offerAmount, 6) : toMicroAmount(offerAmount, decimals);
    const microMinReceive = offerDenom === APP_CONFIG.DENOM ? toMicroAmount(minReceive, decimals) : toMicroAmount(minReceive, 6);

    if (offerDenom !== APP_CONFIG.DENOM) {
        const allowanceMsg = { increase_allowance: { spender: APP_CONFIG.SWAP_MODULE, amount: microOffer } };
        msgs.push(paxi.Any.fromPartial({
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: paxi.MsgExecuteContract.encode({
                sender: wallet.address,
                contract: offerDenom,
                msg: new TextEncoder().encode(JSON.stringify(allowanceMsg)),
                funds: []
            }).finish()
        }));
    }

    const swapMsg = { creator: wallet.address, prc20: contractAddress, offerDenom, offerAmount: microOffer, minReceive: microMinReceive };
    msgs.push(paxi.Any.fromPartial({
        typeUrl: "/x.swap.types.MsgSwap",
        value: paxi.MsgSwap.encode(swapMsg).finish()
    }));

    const metadata = {
        type: 'Swap',
        asset: offerDenom === APP_CONFIG.DENOM ? `PAXI / ${tokenDetail?.symbol || 'TOKEN'}` : `${tokenDetail?.symbol || 'TOKEN'} / PAXI`,
        amount: `${offerAmount} ${offerDenom === APP_CONFIG.DENOM ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN')}`,
        address: wallet.address
    };

    return await buildAndSendTx(msgs, memo, { type: 'swap', metadata });
};

export const executeAddLPTransaction = async function(contractAddress, paxiAmount, tokenAmount) {
    const wallet = State.get('wallet');
    if (!wallet) return;

    const paxi = await waitForLibrary('PaxiCosmJS');
    const userAssets = State.get('userAssets') || [];
    const tokenDetail = userAssets.find(t => t.address === contractAddress);
    const decimals = tokenDetail?.decimals || 6;

    const msgs = [];
    const microPaxiAmount = toMicroAmount(paxiAmount, 6);
    const microPaxi = `${microPaxiAmount}${APP_CONFIG.DENOM}`;
    const microToken = toMicroAmount(tokenAmount, decimals);

    const allowanceMsg = { increase_allowance: { spender: APP_CONFIG.SWAP_MODULE, amount: microToken } };
    msgs.push(paxi.Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: paxi.MsgExecuteContract.encode({
            sender: wallet.address,
            contract: contractAddress,
            msg: new TextEncoder().encode(JSON.stringify(allowanceMsg)),
            funds: []
        }).finish()
    }));

    const lpMsg = { creator: wallet.address, prc20: contractAddress, paxiAmount: microPaxi, prc20Amount: microToken };
    msgs.push(paxi.Any.fromPartial({
        typeUrl: "/x.swap.types.MsgProvideLiquidity",
        value: paxi.MsgProvideLiquidity.encode(lpMsg).finish()
    }));

    const metadata = {
        type: 'Add Liquidity',
        asset: `PAXI / ${tokenDetail?.symbol || 'TOKEN'}`,
        amount: `${paxiAmount} PAXI + ${tokenAmount} ${tokenDetail?.symbol || 'TOKEN'}`,
        address: wallet.address
    };

    return await buildAndSendTx(msgs, "Add Liquidity", { type: 'add_lp', metadata });
};

export const executeRemoveLPTransaction = async function(contractAddress, lpAmount) {
    const wallet = State.get('wallet');
    if (!wallet) return;

    const paxi = await waitForLibrary('PaxiCosmJS');
    const microLP = toMicroAmount(lpAmount, 6);
    const msg = { creator: wallet.address, prc20: contractAddress, lpAmount: microLP };

    const anyMsg = paxi.Any.fromPartial({
        typeUrl: "/x.swap.types.MsgWithdrawLiquidity",
        value: paxi.MsgWithdrawLiquidity.encode(msg).finish()
    });

    const metadata = {
        type: 'Remove Liquidity',
        asset: `PAXI / ${State.get('currentToken')?.symbol || 'TOKEN'}`,
        amount: `${lpAmount} LP Tokens`,
        address: wallet.address
    };

    return await buildAndSendTx([anyMsg], "Remove Liquidity", { type: 'remove_lp', metadata });
};

export const executeSendTransaction = async function(tokenAddress, recipient, amount, memo = "Send from Canonix") {
    const wallet = State.get('wallet');
    if (!wallet) return;

    const paxi = await waitForLibrary('PaxiCosmJS');
    const userAssets = State.get('userAssets') || [];
    const tokenDetail = userAssets.find(t => t.address === tokenAddress);
    const decimals = tokenAddress === 'PAXI' ? 6 : (tokenDetail?.decimals || 6);

    const microAmount = toMicroAmount(amount, decimals);
    const msgs = [];

    if (tokenAddress === 'PAXI') {
        const sendMsg = paxi.MsgSend.fromPartial({
            fromAddress: wallet.address,
            toAddress: recipient,
            amount: [{ denom: APP_CONFIG.DENOM, amount: microAmount }]
        });
        msgs.push(paxi.Any.fromPartial({
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: paxi.MsgSend.encode(sendMsg).finish()
        }));
    } else {
        const transferMsg = { transfer: { recipient: recipient, amount: microAmount } };
        msgs.push(paxi.Any.fromPartial({
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: paxi.MsgExecuteContract.encode({
                sender: wallet.address,
                contract: tokenAddress,
                msg: new TextEncoder().encode(JSON.stringify(transferMsg)),
                funds: []
            }).finish()
        }));
    }

    const metadata = {
        type: 'Send',
        asset: tokenAddress === 'PAXI' ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN'),
        amount: `${amount} ${tokenAddress === 'PAXI' ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN')}`,
        address: recipient
    };

    return await buildAndSendTx(msgs, memo, { type: 'send', metadata });
};

export const executeBurnTransaction = async function(contractAddress, amount) {
    const wallet = State.get('wallet');
    if (!wallet) return;

    const paxi = await waitForLibrary('PaxiCosmJS');
    const userAssets = State.get('userAssets') || [];
    const tokenDetail = userAssets.find(t => t.address === contractAddress);
    const decimals = tokenDetail?.decimals || 6;
    const microAmount = toMicroAmount(amount, decimals);

    const burnMsg = { burn: { amount: microAmount } };
    const anyMsg = paxi.Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: paxi.MsgExecuteContract.encode({
            sender: wallet.address,
            contract: contractAddress,
            msg: new TextEncoder().encode(JSON.stringify(burnMsg)),
            funds: []
        }).finish()
    });

    const metadata = {
        type: 'Burn',
        asset: tokenDetail?.symbol || 'TOKEN',
        amount: `${amount} ${tokenDetail?.symbol || 'TOKEN'}`,
        address: wallet.address
    };

    return await buildAndSendTx([anyMsg], "Burn Tokens", { type: 'burn', metadata });
};
