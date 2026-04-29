# StableFlow MVP

StableFlow is a hackathon-ready stablecoin invoicing product for freelancers and small remote teams. It turns a fragmented payment workflow into one clean flow: create an invoice, collect a real USDC payment on Base Sepolia, confirm settlement, and record collaborator payouts from the same dashboard.

## Why it exists

Small teams handling cross-border work often manage stablecoin payments through chat messages, manual reminders, and ad hoc transfers. That creates three recurring problems:

- invoice details are inconsistent
- payment status is hard to track
- funds received from a client are not clearly routed to collaborators

StableFlow packages those steps into a product-shaped operator surface instead of another wallet demo.

## What is included

- Enterprise-style landing page and product UI
- Invoice creation flow with validation and live preview
- Real wallet-based payment flow on `Base Sepolia`
- Real `USDC` ERC-20 transfer submission through an injected EVM wallet
- Dashboard for receivables, confirmed payments, AI-generated ops summary, and payout records
- Lightweight payout routing flow for post-payment collaborator splits

## Payment rail

- Network: `Base Sepolia`
- Token: `USDC`
- Token contract: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Wallet support: MetaMask or another injected EVM wallet

## Demo flow

1. Open `Create invoice`
2. Enter a valid EVM recipient address and invoice details
3. Generate the invoice link
4. Open the payment page
5. Connect wallet and switch to `Base Sepolia`
6. Submit a real `USDC` payment
7. Wait for confirmation and return to the dashboard
8. Record one or more collaborator payouts against the paid invoice

## Local run

Use the included helper script:

```powershell
Set-Location D:\MyProjects\openclaw
.\start-local.ps1
```

Or run a local server manually:

```powershell
Set-Location D:\MyProjects\openclaw
python -m http.server 4173
```

Then open:

`http://127.0.0.1:4173`

## Demo prerequisites

- A wallet connected to `Base Sepolia`
- Test ETH for gas
- Test `USDC` on `Base Sepolia`

## Project docs

- [USER_GUIDE_ZH_EN.md](./USER_GUIDE_ZH_EN.md): usage guide
- [COMPETITION_PACK_ZH_EN.md](./COMPETITION_PACK_ZH_EN.md): competition-facing overview
- [DEMO_SCRIPT_ZH_EN.md](./DEMO_SCRIPT_ZH_EN.md): bilingual live demo script
- [JUDGE_QA.md](./JUDGE_QA.md): likely judge questions and answers
- [ONE_LINERS.md](./ONE_LINERS.md): short pitch versions
- [PITCH_NOTES.md](./PITCH_NOTES.md): longer pitch notes

## Current MVP boundaries

- Invoice metadata is stored in browser local storage
- Payout routing is still an application-layer record, not an on-chain payout contract
- Payment confirmation is real on testnet, but the rest of the system is still MVP-grade

## Built with AI-assisted development

This project was iterated with agent-style coding workflows and AI-assisted product refinement, including scope reduction, UI restructuring, state-flow cleanup, validation logic, and wallet payment integration.
