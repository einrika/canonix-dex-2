import { State } from '../core/state.js';
import { APP_CONFIG } from '../core/config.js';
import { executeSwap, simulateGas } from '../core/blockchain.js';
import { formatAmount } from '../core/utils.js';

export const SwapTerminalLogic = (container) => {
    const buyTab = container.querySelector('#buyTab');
    const sellTab = container.querySelector('#sellTab');
    const payInput = container.querySelector('#tradePayAmount');
    const recvInput = container.querySelector('#tradeRecvAmount');
    const swapBtn = container.querySelector('#swap-execute-btn');
    const payBalanceEl = container.querySelector('#payBalance');
    const recvBalanceEl = container.querySelector('#recvBalance');
    const paySymbolEl = container.querySelector('#payTokenSymbol');
    const recvSymbolEl = container.querySelector('#recvTokenSymbol');
    const tradeRateEl = container.querySelector('#tradeRate');
    const minRecvEl = container.querySelector('#minRecv');
    const priceImpactEl = container.querySelector('#priceImpact');
    const networkFeeEl = container.querySelector('#networkFee');

    const updateUI = () => {
        const mode = State.get('tradeType') || 'buy';
        const currentToken = State.get('currentToken');

        if (mode === 'buy') {
            buyTab?.classList.add('bg-meme-green', 'text-black');
            buyTab?.classList.remove('text-gray-600');
            sellTab?.classList.remove('bg-meme-pink', 'text-white');
            sellTab?.classList.add('text-gray-600');
            if (paySymbolEl) paySymbolEl.textContent = 'PAXI';
            if (recvSymbolEl) recvSymbolEl.textContent = currentToken?.symbol || 'TOKEN';
        } else {
            buyTab?.classList.remove('bg-meme-green', 'text-black');
            buyTab?.classList.add('text-gray-600');
            sellTab?.classList.add('bg-meme-pink', 'text-white');
            sellTab?.classList.remove('text-gray-600');
            if (paySymbolEl) paySymbolEl.textContent = currentToken?.symbol || 'TOKEN';
            if (recvSymbolEl) recvSymbolEl.textContent = 'PAXI';
        }
        updateBalances();
    };

    const updateBalances = () => {
        const wallet = State.get('wallet');
        const userAssets = State.get('userAssets') || [];
        const currentToken = State.get('currentToken');
        const mode = State.get('tradeType');

        if (!wallet) return;

        const paxiAsset = userAssets.find(a => a.address === 'PAXI');
        const tokenAsset = currentToken ? userAssets.find(a => a.address === currentToken.address) : null;

        const paxiBal = paxiAsset ? (paxiAsset.balance / 1e6).toFixed(4) : '0.00';
        const tokenBal = tokenAsset ? (tokenAsset.balance / Math.pow(10, tokenAsset.decimals || 6)).toFixed(4) : '0.00';

        if (mode === 'buy') {
            if (payBalanceEl) payBalanceEl.textContent = paxiBal;
            if (recvBalanceEl) recvBalanceEl.textContent = tokenBal;
        } else {
            if (payBalanceEl) payBalanceEl.textContent = tokenBal;
            if (recvBalanceEl) recvBalanceEl.textContent = paxiBal;
        }
    };

    const calculateOutput = async () => {
        const payAmount = parseFloat(payInput?.value) || 0;
        const poolData = State.get('poolData');
        const mode = State.get('tradeType');
        const currentToken = State.get('currentToken');

        if (!poolData || payAmount <= 0 || !currentToken) {
            if (recvInput) recvInput.value = '';
            if (tradeRateEl) tradeRateEl.textContent = '1 PAXI = 0 TOKEN';
            return;
        }

        const tokenDecimals = currentToken.decimals || 6;
        const reservePaxi = parseFloat(poolData.reserve_paxi);
        const reservePrc20 = parseFloat(poolData.reserve_prc20);
        let outputAmount, priceImpact;

        if (mode === 'buy') {
            const fromAmountBase = payAmount * 1e6;
            const fee = fromAmountBase * 0.003;
            const amountAfterFee = fromAmountBase - fee;
            outputAmount = (amountAfterFee * reservePrc20) / (reservePaxi + amountAfterFee);
            priceImpact = (amountAfterFee / (reservePaxi + amountAfterFee)) * 100;
        } else {
            const fromAmountBase = payAmount * Math.pow(10, tokenDecimals);
            const fee = fromAmountBase * 0.003;
            const amountAfterFee = fromAmountBase - fee;
            outputAmount = (amountAfterFee * reservePaxi) / (reservePrc20 + amountAfterFee);
            priceImpact = (amountAfterFee / (reservePrc20 + amountAfterFee)) * 100;
        }

        const targetDecimals = mode === 'buy' ? tokenDecimals : 6;
        const outputVal = outputAmount / Math.pow(10, targetDecimals);
        if (recvInput) recvInput.value = outputVal.toFixed(6);

        if (priceImpactEl) {
            priceImpactEl.textContent = priceImpact.toFixed(2) + '%';
            priceImpactEl.className = priceImpact > 5 ? 'text-meme-pink' : 'text-meme-green';
        }

        const rate = mode === 'buy' ? (outputVal / payAmount) : (payAmount / outputVal);
        if (tradeRateEl) tradeRateEl.textContent = `1 PAXI = ${rate.toFixed(4)} ${currentToken.symbol}`;

        const minRecv = outputVal * 0.99;
        if (minRecvEl) minRecvEl.textContent = `${minRecv.toFixed(6)} ${mode === 'buy' ? currentToken.symbol : 'PAXI'}`;

        // Debounced Gas Estimation
        try {
            const gas = await simulateGas([], "Swap Simulation");
            if (networkFeeEl) networkFeeEl.textContent = `~${formatAmount(parseInt(gas.estimatedFee)/1e6, 4)} PAXI`;
        } catch (e) {}
    };

    buyTab?.addEventListener('click', () => {
        State.set('tradeType', 'buy');
        updateUI();
        calculateOutput();
    });

    sellTab?.addEventListener('click', () => {
        State.set('tradeType', 'sell');
        updateUI();
        calculateOutput();
    });

    payInput?.addEventListener('input', () => calculateOutput());

    swapBtn?.addEventListener('click', async () => {
        const wallet = State.get('wallet');
        if (!wallet) {
            window.dispatchEvent(new CustomEvent('paxi_show_connect_modal'));
            return;
        }

        const currentToken = State.get('currentToken');
        const payAmount = parseFloat(payInput.value);
        const mode = State.get('tradeType');
        const recvAmount = parseFloat(recvInput.value);

        const offerDenom = mode === 'buy' ? APP_CONFIG.DENOM : currentToken.address;
        const minReceive = recvAmount * 0.99;

        swapBtn.disabled = true;
        swapBtn.textContent = 'PROCESSING...';
        try {
            await executeSwap(currentToken.address, offerDenom, payAmount, minReceive);
        } catch (e) {
            console.error("Swap failed", e);
        } finally {
            swapBtn.disabled = false;
            updateUI();
        }
    });

    container.querySelectorAll('[data-percent]').forEach(btn => {
        btn.addEventListener('click', () => {
            const percent = parseInt(btn.dataset.percent);
            const balance = parseFloat(payBalanceEl.textContent);
            if (payInput) payInput.value = (balance * percent / 100).toFixed(6);
            calculateOutput();
        });
    });

    updateUI();
    State.subscribe('currentToken', () => { updateUI(); calculateOutput(); });
    State.subscribe('poolData', () => calculateOutput());
    State.subscribe('userAssets', () => updateBalances());
    State.subscribe('wallet', () => updateBalances());
};
