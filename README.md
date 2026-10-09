# 🪙 Feelcoin Paper Wallet

**Official Feelcoin paper wallet generator**

🌐 **Paper wallet:** https://paper.feelcoin.org  
**Motto:** *In Feels We Trust.*

Feelcoin Paper Wallet is a web-based generator for Feelcoin wallet recovery material. It works with the Feelcoin wallet RPC engine and provides wallet information intended for careful offline backup and printing.

## Features

- Generate a Feelcoin wallet and public receiving address.
- Display the 25-word recovery seed, private spend key and private view key.
- Generate a public address QR code.
- Hide or reveal sensitive wallet information.
- Copy address and wallet information when needed.
- Create a printable paper wallet and export a PDF.
- Use a responsive Feelcoin-branded interface.

## Security — read before generating a wallet

**A paper wallet exposes highly sensitive recovery material.** Anyone who obtains the seed or private spend key can control the corresponding funds.

- Generate and print only in a trusted environment.
- Keep seeds and private keys away from screenshots, chats, cloud uploads and shared printers.
- Store your recovery material securely and separately from everyday devices.
- Verify wallet recovery using a safe test workflow before depositing meaningful funds.
- This tool's website and backend services should not be assumed to provide a fully offline, air-gapped generation process.

## How it works

The project uses Node.js, Express, Vite, jsPDF and QRCode. Its frontend communicates with a local application backend; the backend uses Feelcoin Wallet RPC to generate wallet information.

This is separate from the Android and desktop wallet applications, which have different storage and operational models.

## Official Feelcoin ecosystem

| Resource | Link |
| --- | --- |
| Website | https://feelcoin.org |
| Blockchain | https://github.com/feelcoin-org/feelcoin |
| Mining pool | https://pool.feelcoin.org |
| Block explorer | https://explorer.feelcoin.org |
| Web wallet | https://wallet.feelcoin.org |
| Paper wallet | https://paper.feelcoin.org |
| Android wallet | https://github.com/feelcoin-org/feelcoin-android |
| Desktop wallet | https://github.com/feelcoin-org/feelcoin-desktop |

---

## In Feels We Trust

## Contact

Official Feelcoin support and project contact:

[**support@feelcoin.org**](mailto:support@feelcoin.org)

---

## Support Feelcoin Development

Feelcoin is an open-source project.

If you would like to support ongoing development, infrastructure, documentation, testing, and community services, voluntary donations are welcome.

### FEEL

```text
FBx9yk7huEF9PjR33zABbUj915wFVw3LeXfHSX4F7eXMgvyrkaV7tEW4gDwZ9rnQdnRQ4RmZsfPyNezu2jFoLewZLCuS8iM
```

### Bitcoin

Bitcoin mainnet:

```text
bc1q78zv45v3tfek730x8es88vjavj0qej2n766h2f
```

### Ethereum

Ethereum mainnet:

```text
0x7eFC0c47ab555041c79a7269a37f46A835EB466f
```

Donations are entirely voluntary and do not provide ownership, governance rights, guaranteed returns, or preferential treatment.

These voluntary donation addresses are separate from the consensus-enforced Feelcoin development treasury.
