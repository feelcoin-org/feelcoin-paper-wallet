# Feelcoin Paper Wallet

<!-- FEELCOIN-OFFICIAL-LINKS:START -->
## Official Feelcoin Ecosystem

| Service | Official address |
|---|---|
| Website | https://feelcoin.org |
| Mining Pool | https://pool.feelcoin.org |
| Block Explorer | https://explorer.feelcoin.org |
| Non-Custodial Web Wallet | https://wallet.feelcoin.org |
| Paper Wallet | https://paper.feelcoin.org |

### Mining endpoints

Standard mining: `pool.feelcoin.org:4242`

TLS mining: `pool.feelcoin.org:4244`

`feelcoin.org` is the canonical public domain for the Feelcoin ecosystem.
<!-- FEELCOIN-OFFICIAL-LINKS:END -->


![Feelcoin Logo](public/feelcoin-logo.jpeg)

**Official Feelcoin paper wallet generator**

> In Feels We Trust

Feelcoin Paper Wallet is a web-based wallet generator designed for the Feelcoin network. It creates genuine Feelcoin wallets using the official Feelcoin wallet RPC engine and provides the recovery information needed for secure offline storage.

## Features

- Genuine Feelcoin wallet generation
- Feelcoin public address
- 25-word recovery seed
- Private spend key
- Private view key
- Public address QR code
- Hide / show private wallet data
- Copy address and private data
- Printable paper wallet
- PDF export
- Responsive Feelcoin-branded interface
- Temporary wallet cleanup after generation

## Architecture

The current implementation uses:

- Node.js
- Express
- Vite
- jsPDF
- QRCode
- Feelcoin Wallet RPC

The web frontend communicates with a local backend API.

The backend communicates with:

```text
feelcoin-wallet-rpc

## Contact

Official Feelcoin support and project contact:

**support@feelcoin.org**
