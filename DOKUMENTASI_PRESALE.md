# 🚀 DOKUMENTASI SISTEM PRESALE - PAXI NETWORK

Sistem ini adalah platform "Pre-Market / Multi Token Presale" yang memungkinkan admin untuk meluncurkan berbagai token PRC20 dan pengguna untuk membelinya menggunakan native token PAXI.

## 🏗️ ARSITEKTUR SISTEM

Sistem terdiri dari 3 komponen utama:
1.  **Backend (Node.js + Express)**: Menangani API, verifikasi pembayaran, dan distribusi token.
2.  **Database (PostgreSQL)**: Menyimpan konfigurasi token, transaksi, dan logs.
3.  **Frontend (HTML/JS)**: Antarmuka pengguna untuk membeli token dan dashboard admin.

### Alur Kerja (Workflow)
1.  **Setup**: Admin menambahkan token PRC20 baru melalui Admin Panel.
2.  **Purchase**: User memilih token, memasukkan jumlah PAXI, dan mengirim transaksi via PaxiHub/Keplr ke **Receive Wallet**.
3.  **Submission**: Frontend mengirim `txHash` transaksi tersebut ke Backend.
4.  **Verification**: Backend memverifikasi transaksi melalui PAXI LCD API.
5.  **Distribution**: Jika valid, sistem (via Queue) mengirim token PRC20 dari **Send Wallet** ke alamat user menggunakan `MsgExecuteContract`.

---

## 🔗 BLOCKCHAIN INTEGRATION (PAXI NETWORK)

### Konfigurasi Jaringan
-   **RPC**: `https://mainnet-rpc.paxinet.io`
-   **LCD**: `https://mainnet-lcd.paxinet.io`
-   **Chain ID**: `paxi-mainnet`
-   **Native Denom**: `upaxi` (1 PAXI = 1.000.000 upaxi)

### Verifikasi Pembayaran (LCD API)
Endpoint: `GET /cosmos/tx/v1beta1/txs/{hash}`

Validasi yang dilakukan:
1.  `tx_response.code == 0` (Transaksi sukses).
2.  Mencari message tipe `/cosmos.bank.v1beta1.MsgSend`.
3.  `to_address` harus sama dengan `receive_wallet` token tersebut.
4.  `amount` harus sesuai dengan nominal yang dibeli.
5.  `from_address` harus sama dengan pengirim di database.

### Pengiriman PRC20 (Backend)
Menggunakan library `@cosmjs/cosmwasm-stargate`.

Message Format:
```json
{
  "transfer": {
    "recipient": "paxi1...",
    "amount": "1000000"
  }
}
```
Metode: `client.execute(sender, contractAddress, msg, "auto")`.

---

## 🛠️ SETUP & INSTALASI BACKEND

1.  Masuk ke direktori `server/`.
2.  Install dependensi: `npm install`.
3.  Salin `.env.example` menjadi `.env` dan isi variabelnya.
    -   `DATABASE_URL`: Koneksi PostgreSQL.
    -   `DISTRIBUTION_MNEMONIC`: Seed phrase dompet pengirim token.
4.  Jalankan migrasi database menggunakan `schema.sql`.
5.  Jalankan server: `npm start`.

---

## 🛡️ KEAMANAN & SKALABILITAS

1.  **Idempotency**: Pengecekan `txHash` unik di database mencegah double-claim.
2.  **Rate Limiting**: Melindungi API dari spam submission.
3.  **Security Middleware**: Admin routes dilindungi JWT dengan masa berlaku terbatas.
4.  **Queue System**: Distribusi dilakukan secara asinkron untuk menangani beban tinggi tanpa membebani respons API.
5.  **Private Keys**: Private key distribusi hanya tersimpan di `.env` backend, tidak pernah terekspos ke frontend.

---

## 📝 PRC20 MINIMAL ABI
Sesuai standar Cosmwasm CW20/PRC20:
-   `balance { address }`: Query saldo.
-   `transfer { recipient, amount }`: Kirim token.
-   `token_info {}`: Query detail token.

---
**Status**: Production Ready ✅
**Version**: 1.0.0
