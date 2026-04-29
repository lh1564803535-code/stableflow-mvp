# StableFlow Demo Script

## 30-Second Positioning

StableFlow is a stablecoin invoicing and treasury operations surface for lean teams.
It handles invoice creation, real wallet-based settlement on Base Sepolia with USDC, and post-payment collaborator routing in one flow.

## 3-Minute Demo Flow

### 1. Open the product

Start on the landing page.

Say:

`StableFlow is designed to feel like a finance product, not a crypto toy. We focus on operational clarity, explicit payment control, and end-to-end visibility.`

### 2. Create an invoice

Open `Create invoice`.

Show:

- client name
- amount
- due date
- recipient wallet
- project note
- live preview

Say:

`The invoice flow is structured, validated, and shareable. The team gets a clean payment request instead of an ad hoc wallet message.`

### 3. Open the payment rail

Submit the invoice and move to the payment page.

Show:

- invoice summary
- payment progress
- wallet status
- Base Sepolia rail
- USDC token details

Say:

`This is not a fake payment button. The product is wired to an injected EVM wallet and prepared to submit a real USDC ERC-20 transfer on Base Sepolia.`

### 4. Connect wallet and pay

Connect wallet and, if available, execute the testnet payment.

Show:

- wallet connection
- network switch
- transaction confirmation
- settlement proof / transaction hash

Say:

`Payment execution remains wallet-controlled. AI helps operations, but it never takes custody or silently moves funds.`

### 5. Show the dashboard

Move to the dashboard after payment.

Show:

- collected value
- open receivables
- ready to split
- payouts sent
- treasury view
- activity feed
- AI ops summary

Say:

`Most demos stop at invoice generation. We go further into treasury visibility: what is still open, what has been collected, what remains available for collaborator routing, and what operational events just happened.`

### 6. Create a payout record

Use the split form for a paid invoice.

Show:

- invoice selector
- remaining balance hint
- collaborator wallet
- payout label

Say:

`After funds arrive, the team can route value downstream. In this MVP the payout layer is application-level, but the workflow is already visible and coherent.`

## If You Only Have 90 Seconds

1. Landing page positioning
2. Create invoice live preview
3. Payment rail with real wallet explanation
4. Dashboard treasury view and activity feed

## Fallback Line If Wallet Demo Is Unavailable

`The settlement rail is already wired for real Base Sepolia USDC transfers. If wallet permissions or testnet balance are unavailable in this room, we can still show the exact execution surface and the post-payment treasury flow.`
