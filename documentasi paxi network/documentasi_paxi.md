# 📚 PAXINET DAPP DEVELOPMENT - COMPLETE DOCUMENTATION

## 🎯 QUICK REFERENCE GUIDE

Dokumentasi lengkap untuk membangun dApps di PaxiNet. Copy section yang kamu butuhkan atau berikan seluruh dokumentasi ini ke AI sebagai context.

---

## 📡 NETWORK CONFIGURATION

```javascript
// Mainnet Endpoints
const MAINNET_RPC = "https://mainnet-rpc.paxinet.io";
const MAINNET_LCD = "https://mainnet-lcd.paxinet.io";

// Testnet Endpoints  
const TESTNET_RPC = "https://testnet-rpc.paxinet.io";
const TESTNET_LCD = "https://testnet-lcd.paxinet.io";

// Chain Configuration
const CHAIN_PREFIX = "paxi";
const NATIVE_DENOM = "upaxi"; // 1 PAXI = 1,000,000 upaxi
const DECIMALS = 6;

// Swap Module Address (untuk allowance & swap operations)
const SWAP_MODULE_ADDRESS = "paxi1mfru9azs5nua2wxcd4sq64g5nt7nn4n80r745t";
```

---

## 1️⃣ SEND PAXI (Native Token Transfer)

### 📝 Description
Transfer PAXI tokens dari satu address ke address lain menggunakan MsgSend.

### ✅ Use Cases
- Payment processing & P2P transfers
- Airdrop distribution
- Reward systems
- Refund mechanisms

### 🚀 JavaScript/PaxiHub Implementation

```javascript
async function sendPaxi(recipientAddress, amount, memo = "") {
  const sender = await window.paxihub.paxi.getAddress();
  
  const msg = PaxiCosmJS.MsgSend.fromPartial({
    fromAddress: sender.address,
    toAddress: recipientAddress,
    amount: [PaxiCosmJS.coins(amount, "upaxi")[0]] // amount in upaxi
  });

  const anyMsg = PaxiCosmJS.Any.fromPartial({
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: PaxiCosmJS.MsgSend.encode(msg).finish()
  });

  return await buildAndSendTx([anyMsg], memo);
}

// Usage
await sendPaxi("paxi1recipient...", "1000000", "Payment for service");
```

### 🐍 Python Implementation

```python
def send_paxi(account, to_address, amount_paxi, fee_paxi, chain_id, lcd_url, memo=""):
    tx = Transaction(account=account, gas=int(fee_paxi * 10**6 / 0.05), chain_id=chain_id, memo=memo)
    tx.set_fee(amount=int(fee_paxi * 10**6), denom="upaxi")
    tx.add_msg(
        tx_type="transfer",
        sender=account,
        recipient=to_address,
        amount=int(amount_paxi * 10**6),
        denom="upaxi"
    )
    payload = {"tx_bytes": tx.get_tx_bytes_as_string(), "mode": "BROADCAST_MODE_ASYNC"}
    resp = requests.post(f"{lcd_url}/cosmos/tx/v1beta1/txs", json=payload)
    return resp.json().get("tx_response", {}).get("txhash")
```

### 💻 CLI Command

```bash
paxid tx bank send your_key_name paxi1recipient... 1000000upaxi \
  --gas auto --fees 30000upaxi --memo "Payment"
```

### 📊 REST API (Query Balance)

```bash
# Get all balances
GET https://mainnet-lcd.paxinet.io/cosmos/bank/v1beta1/balances/{address}

# Get specific denom balance
GET https://mainnet-lcd.paxinet.io/cosmos/bank/v1beta1/balances/{address}/by_denom?denom=upaxi
```

---

## 2️⃣ SEND PRC20 (Custom Token Transfer)

### 📝 Description
Transfer PRC20 tokens (custom tokens) menggunakan MsgExecuteContract.

### ✅ Use Cases
- Stablecoin transfers
- Utility token payments
- Gaming token transfers
- Loyalty points distribution

### 🚀 JavaScript/PaxiHub Implementation

```javascript
async function sendPRC20(contractAddress, recipientAddress, amount, memo = "") {
  const sender = await window.paxihub.paxi.getAddress();
  
  const msgObj = {
    transfer: {
      recipient: recipientAddress,
      amount: amount // amount as string, no decimals
    }
  };

  const msg = PaxiCosmJS.MsgExecuteContract.fromPartial({
    sender: sender.address,
    contract: contractAddress,
    msg: new TextEncoder().encode(JSON.stringify(msgObj))
  });

  const anyMsg = PaxiCosmJS.Any.fromPartial({
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: PaxiCosmJS.MsgExecuteContract.encode(msg).finish()
  });

  return await buildAndSendTx([anyMsg], memo);
}

// Usage
await sendPRC20(
  "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u",
  "paxi1recipient...",
  "1000000",
  "Token transfer"
);
```

### 💻 CLI Command

```bash
paxid tx wasm execute paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u \
  '{"transfer":{"recipient":"paxi1recipient...","amount":"1000000"}}' \
  --from your_key_name --gas auto --fees 30000upaxi
```

### 📊 Query PRC20 Balance

```bash
# CLI
paxid query wasm contract-state smart paxi14hj2tavq8... \
  '{"balance":{"address":"paxi1..."}}'

# REST API
POST https://mainnet-lcd.paxinet.io/cosmwasm/wasm/v1/contract/{contract_address}/smart
Body: {"balance":{"address":"paxi1..."}}
```

---

## 3️⃣ CREATE PRC20 TOKEN

### 📝 Description
Deploy PRC20 token contract dengan initial supply dan minting capabilities.

### ✅ Use Cases
- Launch custom tokens/stablecoins
- Create utility tokens untuk dApp
- Gaming currency
- Governance tokens

### 🚀 Create Token Process

#### Step 1: Upload Contract (Code ID 1 sudah ready di mainnet)

Contract sudah tersedia di mainnet dengan Code ID 1 untuk PRC20.

#### Step 2: Instantiate Token

```javascript
async function createPRC20Token(tokenConfig, memo = "") {
  const sender = await window.paxihub.paxi.getAddress();
  
  const initMsg = {
    name: tokenConfig.name,           // "My Token"
    symbol: tokenConfig.symbol,        // "MTK"
    decimals: tokenConfig.decimals,    // 6
    initial_balances: [
      {
        address: sender.address,
        amount: tokenConfig.initialSupply // "1000000000"
      }
    ],
    mint: {
      minter: sender.address  // who can mint more tokens
    },
    marketing: {
      project: tokenConfig.project || "My Token Project",
      description: tokenConfig.description || "Token description",
      marketing: sender.address,
      logo: {
        url: tokenConfig.logoUrl || ""
      }
    }
  };

  const msg = PaxiCosmJS.MsgInstantiateContract.fromPartial({
    sender: sender.address,
    admin: "", // no admin = immutable
    codeId: 1, // PRC20 code ID
    label: tokenConfig.label,
    msg: new TextEncoder().encode(JSON.stringify(initMsg)),
    funds: []
  });

  const anyMsg = PaxiCosmJS.Any.fromPartial({
    typeUrl: "/cosmwasm.wasm.v1.MsgInstantiateContract",
    value: PaxiCosmJS.MsgInstantiateContract.encode(msg).finish()
  });

  return await buildAndSendTx([anyMsg], memo);
}

// Usage
const config = {
  name: "My Token",
  symbol: "MTK",
  decimals: 6,
  initialSupply: "1000000000", // 1 billion tokens
  label: "MyToken v1",
  project: "My DApp Project",
  description: "Utility token for my dApp",
  logoUrl: "ipfs://QmYourLogoHash"
};

const txHash = await createPRC20Token(config, "Token creation");
```

### 💻 CLI Command

```bash
paxid tx wasm instantiate 1 '{
  "name": "My Token",
  "symbol": "MTK",
  "decimals": 6,
  "initial_balances": [
    {
      "address": "paxi1youraddress...",
      "amount": "1000000000"
    }
  ],
  "mint": {
    "minter": "paxi1youraddress..."
  },
  "marketing": {
    "project": "My Project",
    "description": "My token description",
    "marketing": "paxi1youraddress...",
    "logo": {
      "url": "ipfs://QmHash..."
    }
  }
}' --from your_key_name \
   --label "MyToken" \
   --no-admin \
   --gas auto \
   --fees 6000000upaxi
```

### 🔍 Get Contract Address After Creation

```bash
# Setelah TX sukses, dapatkan contract address:
curl 'https://mainnet-lcd.paxinet.io/cosmos/tx/v1beta1/txs/{TX_HASH}' | \
  jq -r '.tx_response.events[] | select(.type=="instantiate") | .attributes[] | select(.key=="_contract_address") | .value'
```

---

## 4️⃣ ADD LIQUIDITY / WITHDRAW LIQUIDITY

### 📝 Description
Provide atau withdraw liquidity dari Swap Pool untuk enable trading.

### ✅ Use Cases
- Menjadi liquidity provider & earn fees
- Bootstrap token liquidity
- Enable DEX trading untuk token kamu

### 🚀 Provide Liquidity

```javascript
async function provideLiquidity(prc20Contract, paxiAmount, prc20Amount, memo = "") {
  const sender = await window.paxihub.paxi.getAddress();
  const msgs = [];

  // Step 1: Increase allowance (WAJIB!)
  const allowanceMsg = {
    increase_allowance: {
      spender: SWAP_MODULE_ADDRESS,
      amount: prc20Amount
    }
  };

  const allowanceExec = PaxiCosmJS.MsgExecuteContract.fromPartial({
    sender: sender.address,
    contract: prc20Contract,
    msg: new TextEncoder().encode(JSON.stringify(allowanceMsg))
  });

  msgs.push(PaxiCosmJS.Any.fromPartial({
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: PaxiCosmJS.MsgExecuteContract.encode(allowanceExec).finish()
  }));

  // Step 2: Provide liquidity
  const provideLiqMsg = PaxiCosmJS.MsgProvideLiquidity.fromPartial({
    creator: sender.address,
    prc20: prc20Contract,
    paxiAmount: paxiAmount,    // amount in upaxi
    prc20Amount: prc20Amount   // amount of PRC20 tokens
  });

  msgs.push(PaxiCosmJS.Any.fromPartial({
    typeUrl: "/x.swap.types.MsgProvideLiquidity",
    value: PaxiCosmJS.MsgProvideLiquidity.encode(provideLiqMsg).finish()
  }));

  return await buildAndSendTx(msgs, memo);
}

// Usage
await provideLiquidity(
  "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u",
  "1000000",    // 1 PAXI
  "1000000000", // 1000 tokens
  "Add liquidity"
);
```

### 🚀 Withdraw Liquidity

```javascript
async function withdrawLiquidity(prc20Contract, lpAmount, memo = "") {
  const sender = await window.paxihub.paxi.getAddress();

  const msg = PaxiCosmJS.MsgWithdrawLiquidity.fromPartial({
    creator: sender.address,
    prc20: prc20Contract,
    lpAmount: lpAmount  // LP tokens to burn
  });

  const anyMsg = PaxiCosmJS.Any.fromPartial({
    typeUrl: "/x.swap.types.MsgWithdrawLiquidity",
    value: PaxiCosmJS.MsgWithdrawLiquidity.encode(msg).finish()
  });

  return await buildAndSendTx([anyMsg], memo);
}

// Usage
await withdrawLiquidity(
  "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u",
  "500000",
  "Remove liquidity"
);
```

### 💻 CLI Commands

```bash
# Provide Liquidity
paxid tx swap provide-liquidity \
  --prc20 "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u" \
  --paxi-amount "1000000upaxi" \
  --prc20-amount "1000000000" \
  --from your_key_name \
  --gas auto \
  --fees 21000upaxi

# Withdraw Liquidity
paxid tx swap withdraw-liquidity \
  --prc20 "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u" \
  --lp-amount "500000" \
  --from your_key_name \
  --gas auto \
  --fees 21000upaxi
```

---

## 5️⃣ GET ALL POOLS

### 📝 Description
Fetch list semua liquidity pools yang ada di network.

### 📊 REST API

```bash
GET https://mainnet-lcd.paxinet.io/paxi/swap/all_pools
```

### Response Example

```json
{
  "pools": [
    {
      "prc20": "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u",
      "reserve_paxi": "1000000",
      "reserve_prc20": "1000000000",
      "total_lp": "31622776"
    }
  ]
}
```

### 🚀 JavaScript Implementation

```javascript
async function getAllPools() {
  const response = await fetch(`${MAINNET_LCD}/paxi/swap/all_pools`);
  const data = await response.json();
  return data.pools;
}

// Usage
const pools = await getAllPools();
pools.forEach(pool => {
  console.log(`PRC20: ${pool.prc20}`);
  console.log(`PAXI Reserve: ${pool.reserve_paxi}`);
  console.log(`PRC20 Reserve: ${pool.reserve_prc20}`);
  console.log(`Total LP Tokens: ${pool.total_lp}`);
  console.log('---');
});
```

---

## 6️⃣ GET POOL DETAILS

### 📝 Description
Fetch detail spesifik pool untuk satu PRC20 token.

### 📊 REST API

```bash
GET https://mainnet-lcd.paxinet.io/paxi/swap/pool/{prc20_address}
```

### Response Example

```json
{
  "prc20": "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u",
  "reserve_paxi": "1000000",
  "reserve_prc20": "1000000000",
  "total_lp": "31622776"
}
```

### 🚀 JavaScript Implementation

```javascript
async function getPoolDetails(prc20Address) {
  const response = await fetch(`${MAINNET_LCD}/paxi/swap/pool/${prc20Address}`);
  const pool = await response.json();
  
  // Calculate price
  const paxiPerToken = parseFloat(pool.reserve_paxi) / parseFloat(pool.reserve_prc20);
  const tokenPerPaxi = parseFloat(pool.reserve_prc20) / parseFloat(pool.reserve_paxi);
  
  return {
    ...pool,
    paxiPerToken,
    tokenPerPaxi
  };
}

// Usage
const pool = await getPoolDetails("paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u");
console.log(`Price: 1 Token = ${pool.paxiPerToken} PAXI`);
```

---

## 7️⃣ GET LP POSITION

### 📝 Description
Check berapa banyak LP tokens yang dimiliki user untuk specific pool.

### 📊 REST API

```bash
GET https://mainnet-lcd.paxinet.io/paxi/swap/position/{creator_address}/{prc20_address}
```

### Response Example

```json
{
  "creator": "paxi1youraddress...",
  "prc20": "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u",
  "lp_amount": "1000000"
}
```

### 🚀 JavaScript Implementation

```javascript
async function getLPPosition(userAddress, prc20Address) {
  const response = await fetch(
    `${MAINNET_LCD}/paxi/swap/position/${userAddress}/${prc20Address}`
  );
  const position = await response.json();
  
  // Get pool to calculate share percentage
  const pool = await getPoolDetails(prc20Address);
  const sharePercentage = (parseFloat(position.lp_amount) / parseFloat(pool.total_lp)) * 100;
  
  return {
    ...position,
    sharePercentage,
    poolTotalLp: pool.total_lp
  };
}

// Usage
const position = await getLPPosition(
  "paxi1youraddress...",
  "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u"
);
console.log(`You own ${position.sharePercentage.toFixed(2)}% of the pool`);
```

---

## 8️⃣ SWAP TOKENS

### 📝 Description
Swap antara PAXI dan PRC20 tokens menggunakan liquidity pools.

### ✅ Use Cases
- DEX trading interface
- Automated trading bots
- Token exchange features
- Arbitrage opportunities

### 🚀 JavaScript Implementation

```javascript
async function swapTokens(prc20Contract, offerDenom, offerAmount, slippageTolerance = 0.5, memo = "") {
  const sender = await window.paxihub.paxi.getAddress();
  const msgs = [];

  // Fetch pool untuk calculate expected output
  const pool = await getPoolDetails(prc20Contract);
  const reservePaxi = parseFloat(pool.reserve_paxi);
  const reservePrc20 = parseFloat(pool.reserve_prc20);
  
  // Calculate minReceive dengan slippage protection
  let minReceive;
  if (offerDenom === "upaxi") {
    // Swapping PAXI -> PRC20
    minReceive = Math.floor(
      (parseFloat(offerAmount) * reservePrc20 / reservePaxi) * (1 - slippageTolerance)
    );
  } else {
    // Swapping PRC20 -> PAXI
    minReceive = Math.floor(
      (parseFloat(offerAmount) * reservePaxi / reservePrc20) * (1 - slippageTolerance)
    );
    
    // Increase allowance untuk PRC20
    const allowanceMsg = {
      increase_allowance: {
        spender: SWAP_MODULE_ADDRESS,
        amount: offerAmount
      }
    };

    const allowanceExec = PaxiCosmJS.MsgExecuteContract.fromPartial({
      sender: sender.address,
      contract: prc20Contract,
      msg: new TextEncoder().encode(JSON.stringify(allowanceMsg))
    });

    msgs.push(PaxiCosmJS.Any.fromPartial({
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: PaxiCosmJS.MsgExecuteContract.encode(allowanceExec).finish()
    }));
  }

  // Create swap message
  const swapMsg = PaxiCosmJS.MsgSwap.fromPartial({
    creator: sender.address,
    prc20: prc20Contract,
    offerDenom: offerDenom, // "upaxi" or prc20Contract address
    offerAmount: String(offerAmount),
    minReceive: String(minReceive)
  });

  msgs.push(PaxiCosmJS.Any.fromPartial({
    typeUrl: "/x.swap.types.MsgSwap",
    value: PaxiCosmJS.MsgSwap.encode(swapMsg).finish()
  }));

  return await buildAndSendTx(msgs, memo);
}

// Usage - Swap PAXI to PRC20
await swapTokens(
  "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u",
  "upaxi",          // offering PAXI
  "1000000",        // 1 PAXI
  0.01,             // 1% slippage tolerance
  "Swap PAXI->Token"
);

// Usage - Swap PRC20 to PAXI
await swapTokens(
  "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u",
  "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u", // offering PRC20
  "1000000",
  0.01,
  "Swap Token->PAXI"
);
```

### 💻 CLI Command

```bash
# Swap PAXI to PRC20
paxid tx swap swap \
  --prc20 "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u" \
  --offer-denom upaxi \
  --offer-amount 1000000 \
  --min-receive 900000 \
  --from your_key_name \
  --gas auto \
  --fees 21000upaxi
```

---

## 9️⃣ BURN TOKEN

### 📝 Description
Permanently remove PRC20 tokens from circulation.

### ✅ Use Cases
- Deflation mechanisms
- Token buyback & burn
- Gaming item destruction
- Supply management

### 🚀 JavaScript Implementation

```javascript
async function burnPRC20(contractAddress, amount, memo = "") {
  const sender = await window.paxihub.paxi.getAddress();
  
  const msgObj = {
    burn: {
      amount: amount
    }
  };

  const msg = PaxiCosmJS.MsgExecuteContract.fromPartial({
    sender: sender.address,
    contract: contractAddress,
    msg: new TextEncoder().encode(JSON.stringify(msgObj))
  });

  const anyMsg = PaxiCosmJS.Any.fromPartial({
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: PaxiCosmJS.MsgExecuteContract.encode(msg).finish()
  });

  return await buildAndSendTx([anyMsg], memo);
}

// Usage
await burnPRC20(
  "paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u",
  "1000000",
  "Burn tokens"
);
```

### 💻 CLI Command

```bash
paxid tx wasm execute paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u \
  '{"burn":{"amount":"1000000"}}' \
  --from your_key_name \
  --gas auto \
  --fees 30000upaxi
```

### 📊 Burn Native PAXI (Module Burn)

```bash
# REST API
POST https://mainnet-lcd.paxinet.io/tx/paxi/burn_token
Body: {
  "creator": "paxi1...",
  "amount": "1000000"
}
```

---

## 🔟 COSMOS BANK API ENDPOINTS

### 10. Get All Balances

```bash
GET https://mainnet-lcd.paxinet.io/cosmos/bank/v1beta1/balances/{address}
```

### 11. Get Denom Owners (Who holds this token)

```bash
GET https://mainnet-lcd.paxinet.io/cosmos/bank/v1beta1/denom_owners/{denom}
```

### 12. Get Balance by Specific Denom

```bash
GET https://mainnet-lcd.paxinet.io/cosmos/bank/v1beta1/balances/{address}/by_denom?denom=upaxi
```

### 13. Query Denom Owners with Pagination

```bash
GET https://mainnet-lcd.paxinet.io/cosmos/bank/v1beta1/denom_owners_by_query?denom=upaxi&pagination.limit=100
```

### 14. Get All Denoms Metadata

```bash
GET https://mainnet-lcd.paxinet.io/cosmos/bank/v1beta1/denoms_metadata
```

### 15. Get Specific Denom Metadata

```bash
GET https://mainnet-lcd.paxinet.io/cosmos/bank/v1beta1/denoms_metadata/{denom}
```

### 16. Query Denom Metadata by String

```bash
GET https://mainnet-lcd.paxinet.io/cosmos/bank/v1beta1/denoms_metadata_by_query_string?denom=upaxi
```

### 17. Get Supply by Denom

```bash
GET https://mainnet-lcd.paxinet.io/cosmos/bank/v1beta1/supply/by_denom?denom=upaxi
```

---

## 🔧 HELPER FUNCTIONS

### Build & Send Transaction (Core Function)

```javascript
async function buildAndSendTx(messages, memo = "") {
  // 1. Fetch chainId
  const chainRes = await fetch(`${MAINNET_RPC}/status`).then(r => r.json());
  const chainId = chainRes.result.node_info.network;

  // 2. Get sender info
  const senderInfo = await window.paxihub.paxi.getAddress();
  const sender = senderInfo.address;
  
  const res = await fetch(`${MAINNET_LCD}/cosmos/auth/v1beta1/accounts/${sender}`);
  const { account } = await res.json();
  const ba = account.base_account || account;
  const accountNumber = Number(ba.account_number);
  const sequence = Number(ba.sequence);

  // 3. Construct TxBody
  const txBody = PaxiCosmJS.TxBody.fromPartial({ messages, memo });

  // 4. Define fee
  const fee = {
    amount: [PaxiCosmJS.coins("40000", "upaxi")[0]],
    gasLimit: 800_000
  };

  // 5. PubKey Any
  const pubkeyBytes = new Uint8Array(senderInfo.public_key);
  const pubkeyAny = {
    typeUrl: "/cosmos.crypto.secp256k1.PubKey",
    value: PaxiCosmJS.PubKey.encode({ key: pubkeyBytes }).finish()
  };

  // 6. AuthInfo
  const authInfo = PaxiCosmJS.AuthInfo.fromPartial({
    signerInfos: [{
      publicKey: pubkeyAny,
      modeInfo: { single: { mode: 1 } },
      sequence: BigInt(sequence)
    }],
    fee
  });

  // 7. SignDoc
  const signDoc = PaxiCosmJS.SignDoc.fromPartial({
    bodyBytes: PaxiCosmJS.TxBody.encode(txBody).finish(),
    authInfoBytes: PaxiCosmJS.AuthInfo.encode(authInfo).finish(),
    chainId,
    accountNumber: BigInt(accountNumber)
  });

  // 8. Sign & Send
  const txObj = {
    bodyBytes: btoa(String.fromCharCode(...signDoc.bodyBytes)),
    authInfoBytes: btoa(String.fromCharCode(...signDoc.authInfoBytes)),
    chainId,
    accountNumber: signDoc.accountNumber.toString()
  };

  const result = await window.paxihub.paxi.signAndSendTransaction(txObj);
  const sigBytes = Uint8Array.from(atob(result.success), c => c.charCodeAt(0));

  // 9. Assemble TxRaw
  const txRaw = PaxiCosmJS.TxRaw.fromPartial({
    bodyBytes: signDoc.bodyBytes,
    authInfoBytes: signDoc.authInfoBytes,
    signatures: [sigBytes]
  });

  const txBytes = PaxiCosmJS.TxRaw.encode(txRaw).finish();
  const base64Tx = btoa(String.fromCharCode(...txBytes));

  // 10. Broadcast
  const broadcastResult = await fetch(`${MAINNET_LCD}/cosmos/tx/v1beta1/txs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tx_bytes: base64Tx, mode: "BROADCAST_MODE_SYNC" })
  }).then(r => r.json());
```javascript
  return broadcastResult;
}
```

### Fetch Account Info

```javascript
async function getAccountInfo(address) {
  const res = await fetch(`${MAINNET_LCD}/cosmos/auth/v1beta1/accounts/${address}`);
  const { account } = await res.json();
  const ba = account.base_account || account;
  return {
    address: ba.address,
    accountNumber: Number(ba.account_number),
    sequence: Number(ba.sequence),
    pubKey: ba.pub_key
  };
}
```

### Fetch Transaction Status

```javascript
async function getTxStatus(txHash) {
  try {
    const res = await fetch(`${MAINNET_LCD}/cosmos/tx/v1beta1/txs/${txHash}`);
    const data = await res.json();
    const txResponse = data.tx_response;
    
    return {
      hash: txResponse.txhash,
      height: txResponse.height,
      code: txResponse.code, // 0 = success
      success: txResponse.code === 0,
      rawLog: txResponse.raw_log,
      gasUsed: txResponse.gas_used,
      gasWanted: txResponse.gas_wanted,
      timestamp: txResponse.timestamp
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Usage
const status = await getTxStatus("ABC123...");
if (status.success) {
  console.log(`TX successful at height ${status.height}`);
} else {
  console.log(`TX failed: ${status.rawLog}`);
}
```

### Calculate Swap Output

```javascript
function calculateSwapOutput(inputAmount, inputReserve, outputReserve, feePercent = 0.003) {
  // AMM formula: outputAmount = (inputAmount * outputReserve) / (inputReserve + inputAmount)
  // With 0.3% fee
  const inputWithFee = inputAmount * (1 - feePercent);
  const outputAmount = (inputWithFee * outputReserve) / (inputReserve + inputWithFee);
  return Math.floor(outputAmount);
}

// Usage
const pool = await getPoolDetails("paxi14hj2...");
const output = calculateSwapOutput(
  1000000, // input 1 PAXI
  parseFloat(pool.reserve_paxi),
  parseFloat(pool.reserve_prc20)
);
console.log(`You will receive approximately ${output} tokens`);
```

### Calculate Price Impact

```javascript
function calculatePriceImpact(inputAmount, inputReserve, outputReserve) {
  // Price before swap
  const priceBefore = outputReserve / inputReserve;
  
  // Price after swap (new reserves)
  const newInputReserve = inputReserve + inputAmount;
  const outputAmount = calculateSwapOutput(inputAmount, inputReserve, outputReserve);
  const newOutputReserve = outputReserve - outputAmount;
  const priceAfter = newOutputReserve / newInputReserve;
  
  // Price impact percentage
  const priceImpact = ((priceAfter - priceBefore) / priceBefore) * 100;
  return Math.abs(priceImpact);
}

// Usage
const impact = calculatePriceImpact(
  1000000,
  parseFloat(pool.reserve_paxi),
  parseFloat(pool.reserve_prc20)
);
console.log(`Price impact: ${impact.toFixed(2)}%`);
```

---

## 📱 PAXIHUB INTEGRATION

### Check PaxiHub Availability

```javascript
function checkPaxiHub() {
  if (typeof window.paxihub !== 'undefined') {
    // PaxiHub is injected, ready to use
    return { available: true, injected: true };
  } else if (/Mobi/.test(navigator.userAgent)) {
    // Mobile device, deep link to PaxiHub
    window.location.href = `paxi://hub/explorer?url=${encodeURIComponent(window.location.href)}`;
    
    // Fallback to app store after 1 second
    setTimeout(() => {
      window.location.href = 'https://paxinet.io/paxi_docs/paxihub#paxihub-application';
    }, 1000);
    
    return { available: false, redirect: true };
  } else {
    // Desktop - show install message
    return { available: false, platform: 'desktop' };
  }
}

// Usage
const paxiHub = checkPaxiHub();
if (paxiHub.available) {
  console.log('PaxiHub ready!');
}
```

### Get User Address

```javascript
async function connectWallet() {
  try {
    const addressInfo = await window.paxihub.paxi.getAddress();
    return {
      address: addressInfo.address,
      publicKey: addressInfo.public_key,
      connected: true
    };
  } catch (error) {
    console.error('Failed to connect:', error);
    return { connected: false, error: error.message };
  }
}

// Usage
const wallet = await connectWallet();
console.log(`Connected: ${wallet.address}`);
```

### Sign Message (Off-chain)

```javascript
async function signMessage(message) {
  try {
    const result = await window.paxihub.paxi.signMessage(message);
    return {
      signature: result.signature,
      publicKey: result.public_key,
      signed: true
    };
  } catch (error) {
    return { signed: false, error: error.message };
  }
}

// Usage - Perfect for authentication!
const signature = await signMessage("Login to MyApp at " + new Date().toISOString());
// Send signature to backend for verification
```

---

## 🎯 ADVANCED USE CASES

### Multi-Hop Swap (Swap A -> B -> C)

```javascript
async function multiHopSwap(path, initialAmount, memo = "") {
  const msgs = [];
  let currentAmount = initialAmount;
  
  // path = [tokenA, tokenB, tokenC]
  for (let i = 0; i < path.length - 1; i++) {
    const fromToken = path[i];
    const toToken = path[i + 1];
    
    // Get pool for this pair
    const prc20Contract = fromToken === "upaxi" ? toToken : fromToken;
    const pool = await getPoolDetails(prc20Contract);
    
    // Calculate output
    const output = calculateSwapOutput(
      currentAmount,
      fromToken === "upaxi" ? pool.reserve_paxi : pool.reserve_prc20,
      fromToken === "upaxi" ? pool.reserve_prc20 : pool.reserve_paxi
    );
    
    // Add allowance if needed
    if (fromToken !== "upaxi") {
      const allowanceMsg = {
        increase_allowance: {
          spender: SWAP_MODULE_ADDRESS,
          amount: String(currentAmount)
        }
      };
      // ... add to msgs
    }
    
    // Add swap msg
    const swapMsg = PaxiCosmJS.MsgSwap.fromPartial({
      creator: (await window.paxihub.paxi.getAddress()).address,
      prc20: prc20Contract,
      offerDenom: fromToken,
      offerAmount: String(currentAmount),
      minReceive: String(Math.floor(output * 0.99)) // 1% slippage
    });
    
    msgs.push(PaxiCosmJS.Any.fromPartial({
      typeUrl: "/x.swap.types.MsgSwap",
      value: PaxiCosmJS.MsgSwap.encode(swapMsg).finish()
    }));
    
    currentAmount = output;
  }
  
  return await buildAndSendTx(msgs, memo);
}

// Usage: Swap PAXI -> TokenA -> TokenB
await multiHopSwap(
  ["upaxi", "paxi1tokenA...", "paxi1tokenB..."],
  "1000000",
  "Multi-hop swap"
);
```

### Batch Transfer (Airdrop)

```javascript
async function batchTransfer(recipients, amounts, denom = "upaxi", memo = "") {
  const sender = await window.paxihub.paxi.getAddress();
  const msgs = [];
  
  for (let i = 0; i < recipients.length; i++) {
    const msg = PaxiCosmJS.MsgSend.fromPartial({
      fromAddress: sender.address,
      toAddress: recipients[i],
      amount: [PaxiCosmJS.coins(amounts[i], denom)[0]]
    });
    
    msgs.push(PaxiCosmJS.Any.fromPartial({
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: PaxiCosmJS.MsgSend.encode(msg).finish()
    }));
  }
  
  return await buildAndSendTx(msgs, memo);
}

// Usage: Airdrop to multiple addresses
await batchTransfer(
  ["paxi1addr1...", "paxi1addr2...", "paxi1addr3..."],
  ["100000", "200000", "150000"],
  "upaxi",
  "Airdrop distribution"
);
```

### Auto-Compound LP Rewards

```javascript
async function autoCompoundLP(prc20Contract, memo = "") {
  const sender = await window.paxihub.paxi.getAddress();
  
  // 1. Get current position
  const position = await getLPPosition(sender.address, prc20Contract);
  const pool = await getPoolDetails(prc20Contract);
  
  // 2. Calculate share of pool
  const sharePercent = parseFloat(position.lp_amount) / parseFloat(pool.total_lp);
  const paxiOwned = sharePercent * parseFloat(pool.reserve_paxi);
  const prc20Owned = sharePercent * parseFloat(pool.reserve_prc20);
  
  // 3. Check if we have additional tokens to compound
  const balance = await fetch(`${MAINNET_LCD}/cosmos/bank/v1beta1/balances/${sender.address}`)
    .then(r => r.json());
  
  const paxiBalance = balance.balances.find(b => b.denom === "upaxi");
  const additionalPaxi = Math.floor(parseFloat(paxiBalance.amount) * 0.5); // Use 50% of balance
  
  if (additionalPaxi > 100000) { // Min 0.1 PAXI
    // Calculate proportional PRC20 needed
    const prc20Needed = Math.floor(additionalPaxi * (parseFloat(pool.reserve_prc20) / parseFloat(pool.reserve_paxi)));
    
    // Add liquidity
    await provideLiquidity(prc20Contract, String(additionalPaxi), String(prc20Needed), memo);
  }
}

// Usage: Auto-compound setiap hari
setInterval(async () => {
  await autoCompoundLP("paxi14hj2...", "Auto-compound");
}, 24 * 60 * 60 * 1000); // Every 24 hours
```

### Token Vesting Contract Interaction

```javascript
async function claimVestedTokens(vestingContract, memo = "") {
  const sender = await window.paxihub.paxi.getAddress();
  
  const msgObj = {
    claim: {}
  };

  const msg = PaxiCosmJS.MsgExecuteContract.fromPartial({
    sender: sender.address,
    contract: vestingContract,
    msg: new TextEncoder().encode(JSON.stringify(msgObj))
  });

  const anyMsg = PaxiCosmJS.Any.fromPartial({
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: PaxiCosmJS.MsgExecuteContract.encode(msg).finish()
  });

  return await buildAndSendTx([anyMsg], memo);
}
```

### Query Contract State (Generic)

```javascript
async function queryContract(contractAddress, queryMsg) {
  const queryBase64 = btoa(JSON.stringify(queryMsg));
  const res = await fetch(
    `${MAINNET_LCD}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${queryBase64}`
  );
  return await res.json();
}

// Usage examples:

// 1. Query PRC20 token info
const tokenInfo = await queryContract(
  "paxi14hj2...",
  { token_info: {} }
);
console.log(`Token: ${tokenInfo.data.name} (${tokenInfo.data.symbol})`);

// 2. Query PRC20 balance
const balance = await queryContract(
  "paxi14hj2...",
  { balance: { address: "paxi1..." } }
);
console.log(`Balance: ${balance.data.balance}`);

// 3. Query NFT info
const nftInfo = await queryContract(
  "paxi1nft...",
  { nft_info: { token_id: "1" } }
);
console.log(`NFT: ${nftInfo.data.token_uri}`);

// 4. Query all NFTs owned
const ownedNFTs = await queryContract(
  "paxi1nft...",
  { tokens: { owner: "paxi1...", limit: 100 } }
);
console.log(`Owned NFTs: ${ownedNFTs.data.tokens}`);
```

---

## 🛡️ SECURITY BEST PRACTICES

### 1. Validate Addresses

```javascript
function isValidPaxiAddress(address) {
  // Check prefix
  if (!address.startsWith('paxi1')) return false;
  
  // Check length (should be 43-44 chars for bech32)
  if (address.length < 43 || address.length > 45) return false;
  
  // Check only valid bech32 characters
  const validChars = /^[023456789acdefghjklmnpqrstuvwxyz]+$/;
  const addressBody = address.substring(5); // Remove 'paxi1'
  
  return validChars.test(addressBody);
}

// Usage
if (!isValidPaxiAddress(recipientAddress)) {
  throw new Error("Invalid recipient address");
}
```

### 2. Amount Validation

```javascript
function validateAmount(amount, decimals = 6) {
  const num = parseFloat(amount);
  
  // Check if valid number
  if (isNaN(num) || num <= 0) {
    throw new Error("Invalid amount");
  }
  
  // Check if exceeds max safe integer after conversion
  const microAmount = Math.floor(num * Math.pow(10, decimals));
  if (microAmount > Number.MAX_SAFE_INTEGER) {
    throw new Error("Amount too large");
  }
  
  return microAmount;
}

// Usage
const safeAmount = validateAmount(userInput, 6);
```

### 3. Slippage Protection

```javascript
function calculateMinReceive(expectedOutput, slippagePercent) {
  if (slippagePercent < 0 || slippagePercent > 100) {
    throw new Error("Invalid slippage percentage");
  }
  
  const minReceive = expectedOutput * (1 - slippagePercent / 100);
  return Math.floor(minReceive);
}

// Usage
const minReceive = calculateMinReceive(expectedOutput, 1); // 1% slippage
```

### 4. Gas Estimation

```javascript
function estimateGas(msgType, msgCount = 1) {
  const gasPerMsg = {
    'MsgSend': 100_000,
    'MsgExecuteContract': 200_000,
    'MsgSwap': 300_000,
    'MsgProvideLiquidity': 400_000,
    'MsgWithdrawLiquidity': 300_000
  };
  
  const baseGas = gasPerMsg[msgType] || 200_000;
  return baseGas * msgCount * 1.5; // 50% buffer
}

// Usage in buildAndSendTx
const fee = {
  amount: [PaxiCosmJS.coins("40000", "upaxi")[0]],
  gasLimit: estimateGas('MsgSwap', 2) // 2 swap messages
};
```

### 5. Gas estimates simulate

```javascript
// ============================================================================
// GAS SIMULATION 
// ============================================================================

async function simulateGasSimple() {
  try {
    console.log('🚀 Starting gas simulation...');
    
    // 1. Get wallet info
    if (!window.paxihub || !window.PaxiCosmJS) {
      throw new Error('❌ PaxiHub not available. Please connect wallet first.');
    }
    
    const senderInfo = await window.paxihub.paxi.getAddress();
    console.log('✅ Wallet connected:', senderInfo.address);
    
    // 2. Get chain ID
    const rpc = 'https://mainnet-rpc.paxinet.io';
    const chainId = await fetch(`${rpc}/status`)
      .then(r => r.json())
      .then(d => d.result.node_info.network);
    console.log('✅ Chain ID:', chainId);
    
    // 3. Get account info
    const lcd = 'https://mainnet-lcd.paxinet.io';
    const accountRes = await fetch(`${lcd}/cosmos/auth/v1beta1/accounts/${senderInfo.address}`);
    const accountData = await accountRes.json();
    const account = accountData.account.base_account || accountData.account;
    
    const accountNumber = Number(account.account_number);
    const sequence = Number(account.sequence);
    console.log('✅ Account:', { accountNumber, sequence });
    
    // 4. Build dummy transfer message (self-send 1 PAXI)
    const msg = window.PaxiCosmJS.MsgSend.fromPartial({
      fromAddress: senderInfo.address,
      toAddress: senderInfo.address,
      amount: [{ denom: 'upaxi', amount: '1000000' }] // 1 PAXI
    });
    
    const anyMsg = window.PaxiCosmJS.Any.fromPartial({
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: window.PaxiCosmJS.MsgSend.encode(msg).finish()
    });
    
    console.log('✅ Message created: Transfer 1 PAXI');
    
    // 5. Build TxBody
    const txBody = window.PaxiCosmJS.TxBody.fromPartial({
      messages: [anyMsg],
      memo: 'Gas Simulation Test'
    });
    
    const txBodyBytes = window.PaxiCosmJS.TxBody.encode(txBody).finish();
    
    // 6. Build PubKey
    const pubkeyBytes = new Uint8Array(senderInfo.public_key);
    const pubkeyAny = {
      typeUrl: '/cosmos.crypto.secp256k1.PubKey',
      value: window.PaxiCosmJS.PubKey.encode({ key: pubkeyBytes }).finish()
    };
    
    // 7. Build AuthInfo dengan fee = 0 (untuk simulasi)
    const authInfo = window.PaxiCosmJS.AuthInfo.fromPartial({
      signerInfos: [{
        publicKey: pubkeyAny,
        modeInfo: { single: { mode: 1 } },
        sequence: BigInt(sequence)
      }],
      fee: {
        amount: [],
        gasLimit: BigInt(0)
      }
    });
    
    const authInfoBytes = window.PaxiCosmJS.AuthInfo.encode(authInfo).finish();
    
    // 8. Build TxRaw dengan dummy signature
    const txRaw = window.PaxiCosmJS.TxRaw.fromPartial({
      bodyBytes: txBodyBytes,
      authInfoBytes: authInfoBytes,
      signatures: [new Uint8Array(64)] // Dummy signature untuk simulasi
    });
    
    const txBytes = window.PaxiCosmJS.TxRaw.encode(txRaw).finish();
    const base64TxBytes = btoa(String.fromCharCode(...txBytes));
    
    console.log('✅ Transaction built for simulation');
    
    // 9. POST ke Simulate API
    console.log('📡 Calling simulate API...');
    
    const simulateRes = await fetch(`${lcd}/cosmos/tx/v1beta1/simulate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_bytes: base64TxBytes
      })
    });
    
    if (!simulateRes.ok) {
      const errorText = await simulateRes.text();
      throw new Error(`Simulate API failed: ${errorText}`);
    }
    
    const simulateData = await simulateRes.json();
    console.log('✅ Simulate response:', simulateData);
    
    // 10. Extract gas info
    if (!simulateData.gas_info) {
      throw new Error('No gas_info in response');
    }
    
    const gasUsed = parseInt(simulateData.gas_info.gas_used);
    const gasAdjustment = 1.3; // 30% buffer
    const gasLimit = Math.ceil(gasUsed * gasAdjustment);
    
    const minGasPrice = 0.025;
    const feeAmount = Math.ceil(gasLimit * minGasPrice);
    const feePaxi = (feeAmount / 1000000).toFixed(6);
    
    // 11. Display hasil
    console.log('\n🎉 SIMULATION RESULT:');
    console.log('═══════════════════════════════════');
    console.log(`Gas Used:       ${gasUsed.toLocaleString()}`);
    console.log(`Gas Adjustment: ${gasAdjustment}x (30% buffer)`);
    console.log(`Gas Limit:      ${gasLimit.toLocaleString()}`);
    console.log(`Min Gas Price:  ${minGasPrice} upaxi`);
    console.log(`Fee Amount:     ${feeAmount.toLocaleString()} upaxi`);
    console.log(`Fee in PAXI:    ${feePaxi} PAXI`);
    console.log('═══════════════════════════════════\n');
    
    return {
      gasUsed,
      gasLimit,
      fee: {
        amount: [{ denom: 'upaxi', amount: feeAmount.toString() }],
        gasLimit: BigInt(gasLimit)
      },
      feePaxi,
      raw: simulateData
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    throw error;
  }
}

console.log('✅ Gas simulation script loaded!');
console.log('📝 Run: simulateGasSimple()');
```

---

## 📊 MONITORING & ANALYTICS

### Track Pool Performance

```javascript
async function getPoolAnalytics(prc20Contract, timeRangeHours = 24) {
  const currentPool = await getPoolDetails(prc20Contract);
  
  // Get historical data (you need to implement caching/storage)
  // This is a simplified example
  const analytics = {
    currentPrice: parseFloat(currentPool.reserve_paxi) / parseFloat(currentPool.reserve_prc20),
    totalLiquidity: parseFloat(currentPool.reserve_paxi) * 2, // in PAXI value
    volume24h: 0, // Need to track from events
    fees24h: 0,   // 0.3% of volume
    apr: 0        // Annual percentage rate
  };
  
  return analytics;
}
```

### Monitor Transactions

```javascript
async function monitorTxStatus(txHash, maxRetries = 60, interval = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const status = await getTxStatus(txHash);
      
      if (status.success) {
        console.log(`✅ TX confirmed at height ${status.height}`);
        return { confirmed: true, ...status };
      } else if (status.code !== undefined && status.code !== 0) {
        console.log(`❌ TX failed: ${status.rawLog}`);
        return { confirmed: false, ...status };
      }
    } catch (error) {
      // TX not found yet, keep waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return { confirmed: false, error: "Timeout waiting for confirmation" };
}

// Usage
const txHash = await sendPaxi("paxi1...", "1000000");
const result = await monitorTxStatus(txHash);
```

---

## 🔗 USEFUL LINKS & RESOURCES

### Official Links
- **Mainnet LCD**: https://mainnet-lcd.paxinet.io
- **Mainnet RPC**: https://mainnet-rpc.paxinet.io
- **Testnet LCD**: https://testnet-lcd.paxinet.io
- **Testnet RPC**: https://testnet-rpc.paxinet.io
- **Swagger API**: https://mainnet-lcd.paxinet.io/swagger
- **Explorer**: https://explorer.paxinet.io
- **GitHub**: https://github.com/paxi-web3/paxi
- **CosmJS Library**: https://mainnet-api.paxinet.io/resources/js/paxi-cosmjs.umd.js

### Code IDs (Mainnet)
- **PRC20 Token**: Code ID `1`
- **PRC721 NFT**: Code ID `2`

### Contract Standards
- **PRC-20**: https://github.com/paxi-web3/paxi/blob/main/docs/prc_20_standard.md
- **PRC-721**: https://github.com/paxi-web3/paxi/blob/main/docs/prc_721_standard.md

---

## 💡 QUICK TIPS FOR AI PROMPTS

Ketika menggunakan dokumentasi ini dengan AI, gunakan format:

```
"Using PaxiNet documentation:
1. Help me [create/send/swap] [tokens/NFTs/liquidity]
2. Show me how to [query/monitor/track] [balances/pools/transactions]
3. Explain [concept] with code examples
4. Debug this error: [error message]"
```

### Example AI Prompts:

```
"Using PaxiNet docs, create a swap interface with slippage protection"

"Show me how to build an airdrop tool using batch transfers"

"Help me query all LP positions for a user"

"Create a token launch checklist with code"

"Build a price monitoring bot for a PRC20 token"
```

---

## ✅ TESTING CHECKLIST

Sebelum deploy ke production:

- [ ] Test di testnet dulu
- [ ] Validate semua user inputs
- [ ] Implement proper error handling
- [ ] Add slippage protection untuk swaps
- [ ] Test dengan different wallet balances
- [ ] Verify contract addresses
- [ ] Check gas estimates
- [ ] Test transaction monitoring
- [ ] Implement retry logic
- [ ] Add loading states
- [ ] Test mobile compatibility (PaxiHub)
- [ ] Security audit untuk contract interactions

---

## 🎓 LEARNING PATH

### Beginner
1. Send PAXI (native transfers)
2. Query balances & account info
3. Connect PaxiHub wallet

### Intermediate
4. Send PRC20 tokens
5. Create PRC20 token
6. Query pools & swap tokens
7. Sign messages for authentication

### Advanced
8. Provide/withdraw liquidity
9. Multi-hop swaps
10. Batch operations
11. Contract state queries
12. Build trading bots