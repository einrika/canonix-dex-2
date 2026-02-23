window.WalletHistory = {
    init: function() {},
    loadHistory: function() {
        if (window.renderTransactionHistory) {
            window.renderTransactionHistory();
        }
    }
};

window.txHistory = [];

function detectTxType(tx) {
    const type = (tx.type || "").toLowerCase();
    if (type.includes("send") || type.includes("transfer")) return "send";
    if (type.includes("burn")) return "burn";
    if (type.includes("swap")) return "swap";
    if (type.includes("add") && type.includes("lp")) return "add_lp";
    if (type.includes("withdraw") || type.includes("remove")) return "wd_lp";
    return "other";
}

function getTxMeta(type) {
    const map = {
        send: {
            icon: "fa-paper-plane",
            color: "text-blue-400",
            label: "SEND"
        },
        burn: {
            icon: "fa-fire",
            color: "text-red-500",
            label: "BURN"
        },
        swap: {
            icon: "fa-right-left",
            color: "text-purple-400",
            label: "SWAP"
        },
        add_lp: {
            icon: "fa-plus-circle",
            color: "text-green-400",
            label: "ADD LP"
        },
        wd_lp: {
            icon: "fa-minus-circle",
            color: "text-yellow-400",
            label: "WITHDRAW LP"
        },
        other: {
            icon: "fa-receipt",
            color: "text-secondary-text",
            label: "TRANSACTION"
        }
    };
    return map[type] || map.other;
}

window.renderTransactionHistory = async function(page = 1) {
    const container = document.getElementById("history-container");
    if (!container) return;
    
    if (!window.wallet || !window.wallet.address) {
        container.innerHTML = `
            <div class="text-center py-20 font-bold text-secondary-text uppercase text-sm">
                Wallet Not Connected
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="text-center py-20">
            <div class="w-8 h-8 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
    `;
    
    try {
        const history = await window.loadTransactionHistory(
            window.wallet.address,
            page
        );
        
        if (!history || history.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20 text-secondary-text font-bold uppercase text-sm">
                    No transaction history found
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="flex flex-col gap-2">
                ${history.map(tx => renderTxCard(tx)).join("")}
            </div>
        `;
    } catch {
        container.innerHTML = `
            <div class="text-center py-20 text-red-500 font-bold text-sm">
                Failed to load transaction history
            </div>
        `;
    }
};

function renderTxCard(tx) {
    const txType = detectTxType(tx);
    const meta = getTxMeta(txType);
    
    const time = tx.timestamp ?
        new Date(tx.timestamp).toLocaleString() :
        "-";
    
    const statusColor =
        tx.status === "success" ?
        "text-green-400" :
        "text-red-400";
    
    return `
        <div onclick="openTxDetailModal('${tx.hash}','${txType}')"
            class="bg-card border border-gray-800 rounded-lg p-3 hover:bg-card/70 transition cursor-pointer">

            <div class="flex justify-between items-center">

                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-surface/40 flex items-center justify-center">
                        <i class="fa-solid ${meta.icon} ${meta.color} text-xs"></i>
                    </div>
                    <div>
                        <div class="text-xs font-bold ${meta.color}">
                            ${meta.label}
                        </div>
                        <div class="text-[10px] text-secondary-text font-mono">
                            Block ${tx.block || "-"}
                        </div>
                    </div>
                </div>

                <div class="text-right">
                    <div class="text-[10px] text-secondary-text">${time}</div>
                    <div class="text-[10px] font-bold ${statusColor}">
                        ${tx.status || "-"}
                    </div>
                </div>

            </div>
        </div>
    `;
}

(function initTxModal() {
    if (document.getElementById("tx-detail-modal")) return;
    
    const modal = document.createElement("div");
    modal.id = "tx-detail-modal";
    modal.className = "fixed inset-0 bg-surface/70 backdrop-blur-sm hidden items-center justify-center";
    modal.style.zIndex = "9999";
    
    modal.innerHTML = `
        <div class="bg-card border border-gray-800 rounded-xl w-full max-w-2xl p-4 relative m-6 max-h-[85vh] overflow-y-auto text-xs">

            <button id="tx-modal-close"
                class="absolute top-3 right-3 text-secondary-text hover:text-primary-text text-sm">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <div id="tx-modal-content"></div>

        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById("tx-modal-close").onclick = () => {
        modal.classList.add("hidden");
    };
    
    modal.addEventListener("click", (e) => {
        if (e.target.id === "tx-detail-modal") {
            modal.classList.add("hidden");
        }
    });
})();

window.openTxDetailModal = async function(hash, txType) {
    const modal = document.getElementById("tx-detail-modal");
    const content = document.getElementById("tx-modal-content");
    if (!modal || !content) return;
    
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    
    content.innerHTML = `
        <div class="text-center py-8">
            <div class="w-6 h-6 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-[10px] text-gray-500 mt-2 font-mono uppercase italic tracking-widest">DECODING LEDGER...</p>
        </div>
    `;
    
    try {
        const detail = await window.fetchTxDetail(hash);
        if (!detail) {
            content.innerHTML = `<div class="text-red-400 text-center uppercase font-bold p-8 border-2 border-meme-pink/20 bg-meme-pink/5">Data Link Severed</div>`;
            return;
        }

        // Use normalized data from backend
        const isSuccess = detail.status === 'success';
        const meta = getTxMeta(txType);
        const time = detail.timestamp ? new Date(detail.timestamp).toLocaleString() : "-";
        const txHash = detail.hash || hash;

        content.innerHTML = `
            <div class="flex flex-col gap-5">
                <!-- Header -->
                <div class="flex items-center justify-between border-b-2 border-gray-800 pb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-surface border-2 border-card flex items-center justify-center shadow-brutal-sm">
                            <i class="fa-solid ${meta.icon} ${meta.color} text-lg"></i>
                        </div>
                        <div>
                            <div class="font-display text-lg uppercase italic ${meta.color}">${meta.label}</div>
                            <div class="text-[8px] text-secondary-text font-mono uppercase tracking-widest">TRANSACTION DETAILS</div>
                        </div>
                    </div>
                    <div class="px-3 py-1 border-2 border-card font-display text-sm italic ${isSuccess ? 'bg-meme-green text-black' : 'bg-meme-pink text-white'}">
                        ${isSuccess ? 'CONFIRMED' : 'REJECTED'}
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-surface/50 border-2 border-card p-3 shadow-brutal-sm">
                        <div class="text-secondary-text text-[9px] font-mono uppercase tracking-widest mb-1 italic">Signature Hash</div>
                        <a href="https://explorer.paxinet.io/txs/${txHash}" target="_blank"
                           class="font-mono text-meme-cyan hover:underline break-all block text-[10px]">
                           ${txHash}
                        </a>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-surface/50 border-2 border-card p-3 shadow-brutal-sm">
                            <div class="text-secondary-text text-[9px] font-mono uppercase tracking-widest mb-1 italic">Block</div>
                            <div class="font-display text-lg text-primary-text italic">${detail.height || '-'}</div>
                        </div>
                        <div class="bg-surface/50 border-2 border-card p-3 shadow-brutal-sm">
                            <div class="text-secondary-text text-[9px] font-mono uppercase tracking-widest mb-1 italic">Gas Load</div>
                            <div class="font-display text-lg text-primary-text italic">${detail.gas_used || '0'}</div>
                        </div>
                    </div>
                </div>

                <!-- Footer Info -->
                <div class="flex justify-between items-center text-[10px] font-mono text-muted-text bg-card/30 p-2 border-l-4 border-meme-cyan">
                    <span>RECORDED: ${time}</span>
                    <span class="uppercase italic">SOURCE: ${detail.source || 'LCD-NODE'}</span>
                </div>

                <!-- Raw Data -->
                <div class="mt-2">
                    <button onclick="this.nextElementSibling.classList.toggle('hidden')"
                            class="text-secondary-text hover:text-meme-cyan text-[9px] font-mono uppercase underline italic">
                        [ VIEW RAW DATA STREAM ]
                    </button>
                    <pre class="hidden mt-3 p-4 bg-black/80 border-2 border-card rounded-lg overflow-x-auto text-[9px] text-meme-green/80 font-mono scrollbar-thin">
${JSON.stringify(detail.raw || detail, null, 2)}
                    </pre>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Error opening tx modal:', e);
        content.innerHTML = `
            <div class="p-8 border-4 border-meme-pink bg-meme-pink/10 text-center">
                <i class="fas fa-exclamation-triangle text-3xl text-meme-pink mb-4"></i>
                <div class="font-display text-xl text-meme-pink uppercase italic mb-2">Signal Lost</div>
                <div class="text-[10px] text-secondary-text font-mono uppercase">${e.message}</div>
            </div>
        `;
    }
};

if (window.WalletUI) {
    window.WalletUI.loadHistory = function() {
        window.renderTransactionHistory();
    };
}