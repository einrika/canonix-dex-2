// Presale Frontend Logic

const PRESALE_API = 'http://localhost:5000/api/presale'; // Change to production URL later

async function fetchTokens() {
    try {
        const response = await fetch(`${PRESALE_API}/tokens`);
        const data = await response.json();
        if (data.success) {
            renderTokenList(data.data);
        }
    } catch (error) {
        console.error('Failed to fetch tokens:', error);
    }
}

function renderTokenList(tokens) {
    const container = document.getElementById('tokenListContainer');
    if (!container) return;

    if (tokens.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-display text-2xl text-gray-500 uppercase">No Active Presales Found</div>';
        return;
    }

    container.innerHTML = tokens.map(token => `
        <div class="bg-meme-surface border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all p-6 flex flex-col gap-4">
            <div class="flex justify-between items-start">
                <div class="w-12 h-12 bg-meme-green border-4 border-black shadow-brutal-sm flex items-center justify-center font-display text-2xl rotate-[-5deg]">
                    ${token.symbol[0]}
                </div>
                <div class="bg-black text-meme-green text-[10px] font-mono px-2 py-0.5 border-2 border-black uppercase">
                    ${token.status}
                </div>
            </div>

            <div>
                <h3 class="font-display text-2xl uppercase tracking-tight">${token.name}</h3>
                <p class="font-mono text-xs text-gray-500 uppercase">${token.symbol}</p>
            </div>

            <div class="space-y-2">
                <div class="flex justify-between text-[10px] font-mono uppercase">
                    <span>Price</span>
                    <span class="text-meme-yellow">${token.price_paxi} PAXI</span>
                </div>
                <div class="flex justify-between text-[10px] font-mono uppercase">
                    <span>Hardcap</span>
                    <span>${token.hardcap / 1e6} PAXI</span>
                </div>
            </div>

            <a href="presale-detail.html?id=${token.id}" class="mt-4 block text-center py-3 bg-meme-pink text-white font-display text-xl border-4 border-black shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">
                View Detail
            </a>
        </div>
    `).join('');
}

// Token Detail Page Logic
async function loadTokenDetail() {
    const params = new URLSearchParams(window.location.search);
    const tokenId = params.get('id');
    if (!tokenId) return;

    try {
        const response = await fetch(`${PRESALE_API}/tokens/${tokenId}`);
        const data = await response.json();
        if (data.success) {
            renderTokenDetail(data.data);
        }
    } catch (error) {
        console.error('Failed to load token detail:', error);
    }
}

function renderTokenDetail(token) {
    const el = (id) => document.getElementById(id);
    if (!el('tokenName')) return;

    el('tokenName').textContent = token.name;
    el('tokenSymbol').textContent = token.symbol;
    el('tokenPrice').textContent = `${token.price_paxi} PAXI`;
    el('tokenHardcap').textContent = `${token.hardcap / 1e6} PAXI`;

    // Progress bar
    const progress = (parseFloat(token.total_raised) / parseFloat(token.hardcap)) * 100;
    el('progressBar').style.width = `${Math.min(progress, 100)}%`;
    el('progressText').textContent = `${progress.toFixed(2)}%`;
    el('totalRaised').textContent = `${token.total_raised / 1e6} PAXI`;

    // Purchase logic
    const buyBtn = el('buyBtn');
    const amountInput = el('paxiAmount');

    if (buyBtn && amountInput) {
        amountInput.oninput = () => {
            const paxi = parseFloat(amountInput.value) || 0;
            const tokens = paxi / parseFloat(token.price_paxi);
            el('tokenAmount').textContent = tokens.toFixed(token.decimals);
        };

        buyBtn.onclick = async () => {
            const amount = amountInput.value;
            if (!amount || amount <= 0) return alert('Enter valid amount');

            if (!window.wallet) return alert('Connect wallet first');

            try {
                // Send PAXI to receive_wallet
                const tx = await window.executeSendTransaction('PAXI', token.receive_wallet, amount, `Presale: ${token.symbol}`);

                if (tx && tx.hash) {
                    // Submit to backend
                    const submitRes = await fetch(`${PRESALE_API}/purchase`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            txHash: tx.hash,
                            tokenId: token.id,
                            userAddress: window.wallet.address,
                            amountPaxi: window.toMicroAmount(amount, 6),
                            amountToken: window.toMicroAmount(amount / parseFloat(token.price_paxi), token.decimals)
                        })
                    });

                    const submitData = await submitRes.json();
                    if (submitData.success) {
                        alert('Purchase submitted! Tokens will be distributed after verification.');
                        location.reload();
                    } else {
                        alert(`Error: ${submitData.message}`);
                    }
                }
            } catch (err) {
                console.error('Purchase failed:', err);
                alert(`Error: ${err.message}`);
            }
        };
    }

    // Load history
    loadUserHistory(window.wallet?.address);
}

async function loadUserHistory(address) {
    if (!address) return;
    try {
        const response = await fetch(`${PRESALE_API}/user/${address}`);
        const data = await response.json();
        if (data.success) {
            renderUserHistory(data.data);
        }
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

function renderUserHistory(history) {
    const container = document.getElementById('historyContainer');
    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = '<tr><td colspan="4" class="py-8 text-center text-gray-500 font-mono text-xs uppercase">No Purchase History</td></tr>';
        return;
    }

    container.innerHTML = history.map(item => `
        <tr class="border-b border-black hover:bg-black/20 transition-colors">
            <td class="py-4 font-mono text-[10px] uppercase">${item.name}</td>
            <td class="py-4 font-mono text-[10px] uppercase">${item.amount_paxi / 1e6} PAXI</td>
            <td class="py-4 font-mono text-[10px] uppercase">${item.amount_token / Math.pow(10, 6)} ${item.symbol}</td>
            <td class="py-4 text-right">
                <span class="px-2 py-0.5 text-[8px] font-mono uppercase border border-black ${item.status === 'distributed' ? 'bg-meme-green text-black' : 'bg-meme-yellow text-black'}">
                    ${item.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tokenListContainer')) {
        fetchTokens();
    }
    if (document.getElementById('tokenDetailView')) {
        loadTokenDetail();
    }
});

// Re-load history when wallet connected
window.addEventListener('paxi_active_wallet_changed', () => {
    const address = window.wallet?.address;
    if (address) {
        if (document.getElementById('tokenDetailView')) {
            loadTokenDetail();
        }
    }
});
