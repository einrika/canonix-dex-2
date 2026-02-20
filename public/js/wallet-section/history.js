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
            color: "text-gray-400",
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
            <div class="text-center py-20 font-bold text-gray-500 uppercase text-sm">
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
                <div class="text-center py-20 text-gray-500 font-bold uppercase text-sm">
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
            class="bg-meme-card border border-gray-800 rounded-lg p-3 hover:bg-meme-card/70 transition cursor-pointer">

            <div class="flex justify-between items-center">

                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                        <i class="fa-solid ${meta.icon} ${meta.color} text-xs"></i>
                    </div>
                    <div>
                        <div class="text-xs font-bold ${meta.color}">
                            ${meta.label}
                        </div>
                        <div class="text-[10px] text-gray-500 font-mono">
                            Block ${tx.block || "-"}
                        </div>
                    </div>
                </div>

                <div class="text-right">
                    <div class="text-[10px] text-gray-500">${time}</div>
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
    modal.className = "fixed inset-0 bg-black/70 backdrop-blur-sm hidden items-center justify-center";
    modal.style.zIndex = "9999";
    
    modal.innerHTML = `
        <div class="bg-meme-card border border-gray-800 rounded-xl w-full max-w-2xl p-4 relative m-6 max-h-[85vh] overflow-y-auto text-xs">

            <button id="tx-modal-close"
                class="absolute top-3 right-3 text-gray-400 hover:text-white text-sm">
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
        </div>
    `;
    
    try {
        const detail = await window.fetchTxDetail(hash);
        if (!detail || !detail.tx_response) {
            content.innerHTML = `<div class="text-red-400 text-center">Failed</div>`;
            return;
        }
        
        const tx = detail.tx_response;
        const meta = getTxMeta(txType);
        const time = tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "-";
        
        content.innerHTML = `
            <div class="flex flex-col gap-4">

                <div class="flex items-center gap-2">
                    <i class="fa-solid ${meta.icon} ${meta.color}"></i>
                    <div class="font-bold ${meta.color}">
                        ${meta.label} DETAILS
                    </div>
                </div>

                <div class="border border-gray-800 rounded-lg p-3 bg-black/30 flex flex-col gap-2">

                    <div>
                        <div class="text-gray-400 text-[10px]">HASH</div>
                        <a href="https://explorer.paxinet.io/txs/${tx.txhash}"
                           target="_blank"
                           class="font-mono break-all text-blue-400 hover:underline">
                           ${tx.txhash}
                        </a>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <div class="text-gray-400 text-[10px]">BLOCK</div>
                            <div class="font-mono">${tx.height}</div>
                        </div>
                        <div>
                            <div class="text-gray-400 text-[10px]">GAS USED</div>
                            <div class="font-mono">${tx.gas_used}</div>
                        </div>
                        <div>
                            <div class="text-gray-400 text-[10px]">TIME</div>
                            <div>${time}</div>
                        </div>
                        <div>
                            <div class="text-gray-400 text-[10px]">STATUS</div>
                            <div class="${tx.code === 0 ? "text-green-400" : "text-red-400"} font-bold">
                                ${tx.code === 0 ? "SUCCESS" : "FAILED"}
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        `;
    } catch {
        content.innerHTML = `<div class="text-red-400 text-center">Failed</div>`;
    }
};

if (window.WalletUI) {
    window.WalletUI.loadHistory = function() {
        window.renderTransactionHistory();
    };
}