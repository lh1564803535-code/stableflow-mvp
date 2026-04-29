const STORAGE_KEY = "stableflow-demo-state";
const BASE_SEPOLIA = {
  chainId: "0x14A34",
  chainIdDecimal: 84532,
  chainName: "Base Sepolia",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
};

const PAYMENT_RAIL = {
  chain: BASE_SEPOLIA,
  token: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  },
};

const seededState = {
  invoices: [
    {
      id: "inv_001",
      clientName: "Northstar Labs",
      amount: 1850,
      token: "USDC",
      recipientAddress: "0xA4f0000000000000000000000000000000dE91",
      payerAddress: "0x1Cb90000000000000000000000000000007d77",
      note: "Fund a fast-response election night design and analytics sprint with routing decisions gated by external market mood and operator review.",
      dueAt: "2026-04-28",
      createdAt: "2026-04-23T10:00:00.000Z",
      status: "paid",
      categoryLabel: "Marketing",
      paymentDate: "2026-04-24T08:40:00.000Z",
      reminderText: "Reminder: Northstar Labs still owes 1,850 USDC, due Apr 28.",
      txHash: "0x2eb0b3c1be000000000000000000000000000000000000000000000000000001",
      networkChainId: BASE_SEPOLIA.chainIdDecimal,
      paymentRail: "base-sepolia-usdc",
      milestoneTitle: "Election night liquidity sprint",
      milestoneSummary: "Fund live design, analytics, and operator coverage first. Route capital only after market heat, ops judgment, and reviewer confidence stop fighting each other.",
      escrowStatus: "releasable",
      releaseConfidence: 76,
      releaseRecommendation: "release",
      releaseReason: "Market probability stayed constructive, ops saw low execution risk, and treasury can now route with a straight face and a little swagger.",
      releasedAt: "2026-04-24T09:20:00.000Z",
    },
    {
      id: "inv_002",
      clientName: "Parcel Forge",
      amount: 920,
      token: "USDC",
      recipientAddress: "0xA4f0000000000000000000000000000000dE91",
      payerAddress: "",
      note: "Stage a launch war room for a volatile product reveal and keep routing held until the signal board stops wobbling.",
      dueAt: "2026-04-30",
      createdAt: "2026-04-25T02:15:00.000Z",
      status: "pending",
      categoryLabel: "Marketing",
      paymentDate: "",
      reminderText: "Reminder: Parcel Forge still owes 920 USDC, due Apr 30.",
      txHash: "",
      networkChainId: 0,
      paymentRail: "base-sepolia-usdc",
      milestoneTitle: "Reveal day operator room",
      milestoneSummary: "Keep capital unfired until settlement lands and the market mood stops pretending every candle is a prophecy.",
      escrowStatus: "awaiting_funding",
      releaseConfidence: 42,
      releaseRecommendation: "hold",
      releaseReason: "Settlement has not arrived, so treasury is staying cool instead of chasing vibes.",
      releasedAt: "",
    },
    {
      id: "inv_003",
      clientName: "Beacon Studio",
      amount: 640,
      token: "USDC",
      recipientAddress: "0xA4f0000000000000000000000000000000dE91",
      payerAddress: "",
      note: "Prepare a rapid QA and operator response loop for a risky prototype window with signal-driven reserve discipline.",
      dueAt: "2026-04-22",
      createdAt: "2026-04-18T14:10:00.000Z",
      status: "overdue",
      categoryLabel: "QA",
      paymentDate: "",
      reminderText: "Beacon Studio is past due on a 640 USDC treasury request tied to QA and response coverage.",
      txHash: "",
      networkChainId: 0,
      paymentRail: "base-sepolia-usdc",
      milestoneTitle: "Prototype turbulence buffer",
      milestoneSummary: "This request exists to keep a reserve cushion while the prototype behaves like it had too much espresso.",
      escrowStatus: "awaiting_funding",
      releaseConfidence: 34,
      releaseRecommendation: "hold",
      releaseReason: "Signal quality is weak, funding is missing, and treasury should absolutely not cosplay as a degen here.",
      releasedAt: "",
    },
  ],
  payouts: [
    {
      id: "pay_001",
      invoiceId: "inv_001",
      recipientAddress: "0xDev10000000000000000000000000000009a31",
      amount: 700,
      status: "paid",
      label: "Live ops coverage",
      createdAt: "2026-04-24T09:30:00.000Z",
      mode: "fixed",
    },
    {
      id: "pay_002",
      invoiceId: "inv_001",
      recipientAddress: "0xMkT2000000000000000000000000000000ba82",
      amount: 250,
      status: "paid",
      label: "Signal dashboard handoff",
      createdAt: "2026-04-24T09:33:00.000Z",
      mode: "fixed",
    },
  ],
  signals: [
    {
      id: "sig_001",
      invoiceId: "inv_001",
      stance: "yes",
      weight: 3,
      sourceLabel: "Polymarket snapshot",
      createdAt: "2026-04-24T08:52:00.000Z",
    },
    {
      id: "sig_002",
      invoiceId: "inv_001",
      stance: "yes",
      weight: 2,
      sourceLabel: "Ops judgment",
      createdAt: "2026-04-24T09:04:00.000Z",
    },
    {
      id: "sig_003",
      invoiceId: "inv_001",
      stance: "no",
      weight: 1,
      sourceLabel: "Reviewer caution",
      createdAt: "2026-04-24T09:08:00.000Z",
    },
  ],
};

const walletState = {
  address: "",
  chainId: 0,
  connected: false,
  busy: false,
};

const app = document.getElementById("app");
const storageFallback = new Map();

function readStoredValue(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return storageFallback.has(key) ? storageFallback.get(key) : null;
  }
}

function writeStoredValue(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    storageFallback.set(key, value);
  }
}

function buildRouteUrl(hash) {
  const url = new URL(window.location.href);
  url.hash = hash.startsWith("#") ? hash : `#${hash}`;
  return url.toString();
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function getNumericAmount(value) {
  return Number(value) || 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function shortAddress(address) {
  if (!address) return "Not connected";
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(value || "").trim());
}

function encodeTransferData(to, amountUnits) {
  const method = "a9059cbb";
  const encodedTo = String(to).toLowerCase().replace(/^0x/, "").padStart(64, "0");
  const encodedAmount = amountUnits.toString(16).padStart(64, "0");
  return `0x${method}${encodedTo}${encodedAmount}`;
}

function amountToTokenUnits(amount, decimals) {
  const normalized = Number(amount).toFixed(decimals);
  const [whole, fraction = ""] = normalized.split(".");
  return BigInt(`${whole}${fraction.padEnd(decimals, "0")}`);
}

async function rpcRequest(method, params = []) {
  if (!window.ethereum) {
    throw new Error("No injected wallet was found. Use MetaMask or another EVM wallet.");
  }

  return window.ethereum.request({ method, params });
}

async function ensureBaseSepolia() {
  try {
    await rpcRequest("wallet_switchEthereumChain", [{ chainId: PAYMENT_RAIL.chain.chainId }]);
  } catch (error) {
    if (error && error.code === 4902) {
      await rpcRequest("wallet_addEthereumChain", [PAYMENT_RAIL.chain]);
      return;
    }

    throw error;
  }
}

async function connectWallet() {
  const accounts = await rpcRequest("eth_requestAccounts");
  const chainHex = await rpcRequest("eth_chainId");
  walletState.address = accounts[0] || "";
  walletState.chainId = Number.parseInt(chainHex, 16) || 0;
  walletState.connected = Boolean(walletState.address);
  return walletState.address;
}

function formatCurrency(amount, token = "USDC") {
  return `${getNumericAmount(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${token}`;
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function categoryFromNote(note) {
  const lowered = String(note || "").toLowerCase();
  if (lowered.includes("design")) return "Design";
  if (lowered.includes("market")) return "Marketing";
  if (lowered.includes("qa") || lowered.includes("bug")) return "QA";
  if (lowered.includes("build") || lowered.includes("dev")) return "Development";
  return "General Ops";
}

function milestoneTitleFromInvoice(invoice) {
  const client = String(invoice.clientName || "Client").trim() || "Client";
  const category = invoice.categoryLabel || categoryFromNote(invoice.note || "");
  return invoice.milestoneTitle || `${client} ${category} milestone`;
}

function milestoneSummaryFromInvoice(invoice) {
  if (invoice.milestoneSummary) return invoice.milestoneSummary;
  const note = String(invoice.note || "").trim();
  return note
    ? `${note} Treasury keeps the request in play until settlement lands, the market mood becomes legible, and an operator explicitly approves the move.`
    : "Treasury posture stays gated by settlement, signal quality, and one very intentional human click.";
}

function reminderFromInvoice(invoice) {
  return `Reminder: ${invoice.clientName} still owes ${formatCurrency(invoice.amount, invoice.token)}, due ${formatShortDate(invoice.dueAt)}. Treasury drama is easier after funding.`;
}

function deriveInvoiceStatus(invoice) {
  if (invoice.status === "paid") return "paid";
  if (!invoice.dueAt) return "pending";
  return invoice.dueAt < todayStamp() ? "overdue" : "pending";
}

function getSignalsForInvoice(id, sourceSignals = []) {
  return sourceSignals.filter((signal) => signal.invoiceId === id);
}

function confidenceFromSignals(signals, fallback = 42) {
  if (!signals.length) {
    return clamp(Math.round(fallback), 0, 100);
  }

  const yes = signals
    .filter((signal) => signal.stance === "yes")
    .reduce((sum, signal) => sum + getNumericAmount(signal.weight), 0);
  const no = signals
    .filter((signal) => signal.stance === "no")
    .reduce((sum, signal) => sum + getNumericAmount(signal.weight), 0);
  const total = yes + no;
  if (!total) return clamp(Math.round(fallback), 0, 100);
  return clamp(Math.round((yes / total) * 100), 0, 100);
}

function recommendationFromConfidence(confidence, escrowStatus) {
  if (escrowStatus === "awaiting_funding") {
    return {
      recommendation: "hold",
      reason: "Capital has not landed yet, so treasury should resist the urge to act before the board is even live.",
    };
  }

  if (escrowStatus === "funded") {
    return {
      recommendation: "hold",
      reason: "Settlement is real, but treasury still wants cleaner signal alignment before any routing move.",
    };
  }

  if (confidence >= 70) {
    return {
      recommendation: "release",
      reason: "Signals are decisively constructive, so treasury can route now without pretending uncertainty is sophistication.",
    };
  }

  if (confidence >= 45) {
    return {
      recommendation: "partial",
      reason: "Signals are mixed, so treasury should stage routing and keep reserve posture flexible.",
    };
  }

  return {
    recommendation: "hold",
    reason: "Signals lean negative, so reserve discipline beats theatrical optimism.",
  };
}

function deriveEscrowStatus(invoice) {
  const confidence = getNumericAmount(invoice.releaseConfidence);
  const current = invoice.escrowStatus || "";

  if (current === "released") return "released";
  if (invoice.status !== "paid") return "awaiting_funding";
  if (current === "funded" && confidence < 45) return "funded";
  if (confidence >= 70) return "releasable";
  return "in_review";
}

function hydrateInvoice(invoice, sourceSignals = []) {
  const hydrated = {
    token: PAYMENT_RAIL.token.symbol,
    payerAddress: "",
    paymentDate: "",
    reminderText: "",
    categoryLabel: categoryFromNote(invoice.note || ""),
    txHash: "",
    networkChainId: 0,
    paymentRail: "base-sepolia-usdc",
    milestoneTitle: "",
    milestoneSummary: "",
    escrowStatus: "awaiting_funding",
    releaseConfidence: 42,
    releaseRecommendation: "hold",
    releaseReason: "Funding has not arrived yet.",
    releasedAt: "",
    ...invoice,
  };

  hydrated.status = deriveInvoiceStatus(hydrated);
  hydrated.categoryLabel = hydrated.categoryLabel || categoryFromNote(hydrated.note || "");
  hydrated.milestoneTitle = milestoneTitleFromInvoice(hydrated);
  hydrated.milestoneSummary = milestoneSummaryFromInvoice(hydrated);
  hydrated.reminderText = hydrated.reminderText || reminderFromInvoice(hydrated);

  const signals = invoice.id ? getSignalsForInvoice(invoice.id, sourceSignals) : [];
  const confidence = confidenceFromSignals(signals, hydrated.releaseConfidence);
  hydrated.releaseConfidence = confidence;
  hydrated.escrowStatus = deriveEscrowStatus(hydrated);
  const recommendation = recommendationFromConfidence(confidence, hydrated.escrowStatus);
  hydrated.releaseRecommendation = hydrated.escrowStatus === "released" ? "release" : recommendation.recommendation;
  hydrated.releaseReason =
    hydrated.escrowStatus === "released"
      ? hydrated.releaseReason || "Release has already been approved and the payout path is now active."
      : recommendation.reason;
  if (hydrated.escrowStatus !== "released") {
    hydrated.releasedAt = "";
  }
  return hydrated;
}

function normalizeState(rawState) {
  const baseState = {
    invoices: Array.isArray(rawState.invoices) ? rawState.invoices : [],
    payouts: Array.isArray(rawState.payouts) ? rawState.payouts : [],
    signals: Array.isArray(rawState.signals) ? rawState.signals : [],
  };

  const nextState = {
    invoices: baseState.invoices,
    payouts: baseState.payouts.filter((payout) => getNumericAmount(payout.amount) > 0),
    signals: baseState.signals.filter((signal) => ["yes", "no"].includes(signal.stance)),
  };

  nextState.invoices = nextState.invoices.map((invoice) => hydrateInvoice(invoice, nextState.signals));
  return nextState;
}

function loadState() {
  const raw = readStoredValue(STORAGE_KEY);
  if (!raw) {
    const initialState = normalizeState(structuredClone(seededState));
    writeStoredValue(STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }

  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    const initialState = normalizeState(structuredClone(seededState));
    writeStoredValue(STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }
}

let state = loadState();

function saveState() {
  state = normalizeState(state);
  writeStoredValue(STORAGE_KEY, JSON.stringify(state));
}

function getInvoiceById(id) {
  return state.invoices.find((invoice) => invoice.id === id);
}

function getPayoutsForInvoice(id) {
  return state.payouts.filter((payout) => payout.invoiceId === id);
}

function invoiceRemaining(invoiceId) {
  const invoice = getInvoiceById(invoiceId);
  if (!invoice) return 0;
  const used = getPayoutsForInvoice(invoiceId).reduce((sum, payout) => sum + getNumericAmount(payout.amount), 0);
  return Math.max(0, getNumericAmount(invoice.amount) - used);
}

function totalCollectedAmount() {
  return state.invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + getNumericAmount(invoice.amount), 0);
}

function totalOpenAmount() {
  return state.invoices
    .filter((invoice) => invoice.status !== "paid")
    .reduce((sum, invoice) => sum + getNumericAmount(invoice.amount), 0);
}

function totalReadyToSplitAmount() {
  return state.invoices
    .filter((invoice) => ["releasable", "released"].includes(invoice.escrowStatus))
    .reduce((sum, invoice) => sum + invoiceRemaining(invoice.id), 0);
}

function totalFundedEscrowAmount() {
  return state.invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + getNumericAmount(invoice.amount), 0);
}

function totalReleasedAmount() {
  return state.invoices
    .filter((invoice) => invoice.escrowStatus === "released")
    .reduce((sum, invoice) => sum + getNumericAmount(invoice.amount), 0);
}

function totalRoutedAmount() {
  return state.payouts.reduce((sum, payout) => sum + getNumericAmount(payout.amount), 0);
}

function totalRetainedTreasuryAmount() {
  return Math.max(0, totalFundedEscrowAmount() - totalRoutedAmount());
}

function weeklySummary() {
  const funded = state.invoices.filter((invoice) => invoice.status === "paid");
  const inReview = state.invoices.filter((invoice) => invoice.escrowStatus === "in_review");
  const releasable = state.invoices.filter((invoice) => invoice.escrowStatus === "releasable");
  const released = state.invoices.filter((invoice) => invoice.escrowStatus === "released");
  const avgConfidence = funded.length
    ? Math.round(
        funded.reduce((sum, invoice) => sum + getNumericAmount(invoice.releaseConfidence), 0) / funded.length,
      )
    : 0;

  return [
    `Treasury is holding ${formatCurrency(totalFundedEscrowAmount())} across ${funded.length} live request${funded.length === 1 ? "" : "s"} that already touched the rail.`,
    `${inReview.length} request${inReview.length === 1 ? " is" : "s are"} still stuck between market excitement and operator caution, with an average signal confidence of ${avgConfidence}%.`,
    `${releasable.length} routing move${releasable.length === 1 ? " is" : "s are"} unlocked, exposing ${formatCurrency(totalReadyToSplitAmount())} for treasury action instead of wishful thinking.`,
    `${released.length} approved move${released.length === 1 ? " has" : "s have"} already pushed ${formatCurrency(totalRoutedAmount())} into routing records while ${formatCurrency(totalRetainedTreasuryAmount())} stays back as the adult in the room.`,
  ];
}

function averageConfidenceForPaid() {
  const paid = state.invoices.filter((invoice) => invoice.status === "paid");
  if (!paid.length) return 0;
  return Math.round(paid.reduce((sum, invoice) => sum + getNumericAmount(invoice.releaseConfidence), 0) / paid.length);
}

function highestConfidenceInvoice() {
  return state.invoices
    .filter((invoice) => invoice.status === "paid")
    .sort((a, b) => getNumericAmount(b.releaseConfidence) - getNumericAmount(a.releaseConfidence))[0];
}

function activeRoute(route) {
  if (route === "#pay") return "#dashboard";
  return route;
}

function syncTopbar(route) {
  document.querySelectorAll(".nav a").forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("is-active", href === activeRoute(route));
  });
}

function paymentProgressMarkup(invoice) {
  const steps = [
    {
      label: "Request framed",
      complete: Boolean(invoice.id),
    },
    {
      label: "Settlement confirmed",
      complete: invoice.status === "paid",
    },
    {
      label: "Treasury move unlocked",
      complete: ["releasable", "released"].includes(invoice.escrowStatus),
    },
  ];

  return `
    <div class="progress-strip">
      ${steps
        .map(
          (step) => `
            <article class="progress-card ${step.complete ? "is-complete" : ""}">
              <span class="progress-index">${step.complete ? "Live" : "Primed"}</span>
              <strong>${step.label}</strong>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function getEscrowStatusMeta(status) {
  const map = {
    awaiting_funding: {
      label: "Awaiting capital",
      detail: "The request is framed, but no USDC has entered the reactor yet.",
    },
    funded: {
      label: "Settlement landed",
      detail: "Capital is real and confirmed, but treasury still wants cleaner signal alignment before moving.",
    },
    in_review: {
      label: "Signal turbulence",
      detail: "Market heat and operator judgment are still arguing, so treasury is holding posture.",
    },
    releasable: {
      label: "Move unlocked",
      detail: "Confidence cleared the bar and treasury can now route with intent instead of vibes.",
    },
    released: {
      label: "Move executed",
      detail: "Treasury approved the action and downstream routing is now live.",
    },
  };
  return map[status] || { label: status, detail: status };
}

function recommendationMeta(recommendation) {
  const map = {
    hold: { label: "Keep reserve", tone: "hold" },
    partial: { label: "Stage routing", tone: "partial" },
    release: { label: "Route now", tone: "release" },
  };
  return map[recommendation] || { label: recommendation, tone: "hold" };
}

function signalWeightLabel(weight) {
  const numeric = getNumericAmount(weight);
  if (numeric >= 3) return "Loud";
  if (numeric >= 2) return "Firm";
  return "Soft";
}

function getRecentActivity() {
  const invoiceEvents = state.invoices.flatMap((invoice) => {
    const events = [
      {
        id: `invoice-created-${invoice.id}`,
        date: invoice.createdAt,
        title: `${invoice.clientName} request launched`,
        detail: `${invoice.milestoneTitle} entered the treasury board for ${formatCurrency(invoice.amount, invoice.token)}.`,
        kind: invoice.status,
      },
    ];

    if (invoice.paymentDate) {
      events.push({
        id: `invoice-funded-${invoice.id}`,
        date: invoice.paymentDate,
        title: `${invoice.clientName} pushed capital on-chain`,
        detail: `${formatCurrency(invoice.amount, invoice.token)} confirmed on ${PAYMENT_RAIL.chain.chainName}.`,
        kind: "funded",
      });
    }

    if (invoice.releasedAt) {
      events.push({
        id: `invoice-released-${invoice.id}`,
        date: invoice.releasedAt,
        title: `${invoice.clientName} treasury move approved`,
        detail: `${getEscrowStatusMeta(invoice.escrowStatus).label} at ${invoice.releaseConfidence}% confidence.`,
        kind: "released",
      });
    }

    return events;
  });

  const signalEvents = state.signals.map((signal) => {
    const invoice = getInvoiceById(signal.invoiceId);
    return {
      id: `signal-${signal.id}`,
      date: signal.createdAt,
      title: `${signal.sourceLabel} injected ${signal.stance === "yes" ? "bullish" : "bearish"} heat`,
      detail: `${signalWeightLabel(signal.weight)} conviction on ${invoice ? invoice.clientName : signal.invoiceId}.`,
      kind: signal.stance === "yes" ? "releasable" : "in_review",
    };
  });

  const payoutEvents = state.payouts.map((payout) => {
    const invoice = getInvoiceById(payout.invoiceId);
    return {
      id: `payout-${payout.id}`,
      date: payout.createdAt,
      title: `${payout.label} routing recorded`,
      detail: `${formatCurrency(payout.amount)} assigned from ${invoice ? invoice.clientName : payout.invoiceId}.`,
      kind: "released",
    };
  });

  return [...invoiceEvents, ...signalEvents, ...payoutEvents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);
}

function createStatusChip(status) {
  const labelMap = {
    pending: "Awaiting capital",
    paid: "Settled",
    overdue: "Overdue",
    funded: "Settlement landed",
    awaiting_funding: "Awaiting capital",
    in_review: "Signal turbulence",
    releasable: "Move unlocked",
    released: "Move executed",
  };
  return `<span class="status-chip" data-status="${status}">${labelMap[status] || status}</span>`;
}

function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2800);
}

function render() {
  state = normalizeState(state);
  const hash = window.location.hash || "#landing";
  const [route, queryString] = hash.split("?");
  const query = new URLSearchParams(queryString || "");
  syncTopbar(route);

  switch (route) {
    case "#create":
      renderTemplate("create-template");
      renderCreate(query);
      break;
    case "#pay":
      renderTemplate("pay-template");
      renderPay(query);
      break;
    case "#dashboard":
      renderTemplate("dashboard-template");
      renderDashboard();
      break;
    default:
      renderTemplate("landing-template");
      renderLanding();
      break;
  }
}

function renderTemplate(templateId) {
  const template = document.getElementById(templateId);
  app.innerHTML = "";
  app.appendChild(template.content.cloneNode(true));
}

function renderLanding() {
  const funded = totalFundedEscrowAmount();
  const reviewQueue = state.invoices.filter((invoice) => ["funded", "in_review"].includes(invoice.escrowStatus)).length;
  const releaseReady = totalReadyToSplitAmount();
  const releasedCount = state.invoices.filter((invoice) => invoice.escrowStatus === "released").length;

  document.getElementById("hero-total-collected").textContent = formatCurrency(funded);
  document.getElementById("hero-open-count").textContent = String(reviewQueue);
  document.getElementById("hero-paid-today").textContent = `${averageConfidenceForPaid()}%`;
  document.getElementById("hero-ready-to-split").textContent = formatCurrency(releaseReady);
  document.getElementById("hero-trend").textContent = releasedCount ? `${releasedCount} routing move live` : "Signal reactor warming up";

  document.querySelectorAll('[data-route-link]').forEach((link) => {
    const route = link.getAttribute('data-route-link');
    if (route) {
      link.href = buildRouteUrl(route);
    }
  });
}

function renderCreate(query) {
  const form = document.getElementById("invoice-form");
  const preview = document.getElementById("invoice-preview");
  const seedButton = document.getElementById("seed-invoice");
  const seeded = {
    clientName: "Northstar Labs",
    amount: "1850",
    dueAt: "2026-04-28",
    recipientAddress: "0xA4f0000000000000000000000000000000dE91",
    milestoneTitle: "Election night liquidity sprint",
    note: "Fund rapid design, analytics, and operator coverage for a volatile event window with market-sensitive routing after settlement.",
  };

  const draftSource = query.get("invoiceId");
  const draft = draftSource ? getInvoiceById(draftSource) : null;
  const initial = draft || seeded;

  Object.entries(initial).forEach(([key, value]) => {
    if (form.elements[key]) {
      form.elements[key].value = value;
    }
  });

  function updatePreview() {
    const formData = new FormData(form);
    const invoice = hydrateInvoice({
      clientName: formData.get("clientName") || "Counterparty / team",
      amount: getNumericAmount(formData.get("amount")),
      token: PAYMENT_RAIL.token.symbol,
      recipientAddress: formData.get("recipientAddress") || "0x...",
      dueAt: formData.get("dueAt") || new Date().toISOString(),
      milestoneTitle: formData.get("milestoneTitle") || "Event thesis",
      note: formData.get("note") || "Treasury intent will appear here.",
      releaseConfidence: 42,
      escrowStatus: "awaiting_funding",
    });

    preview.innerHTML = `
      <article class="preview-card invoice-spotlight">
        <div class="invoice-spotlight-head">
          <div>
            <p class="card-label">Signal-ready request</p>
            <h2>${invoice.clientName}</h2>
          </div>
          ${createStatusChip(invoice.escrowStatus)}
        </div>
        <p class="amount">${formatCurrency(invoice.amount, invoice.token)}</p>
        <div class="invoice-meta">
          <span>Event ${invoice.milestoneTitle}</span>
          <span>Deadline ${formatDate(invoice.dueAt)}</span>
          <span>Market mood ${invoice.releaseConfidence}%</span>
          <span>Recipient ${shortAddress(invoice.recipientAddress)}</span>
        </div>
        <p>${invoice.milestoneSummary}</p>
        <div class="preview-flair">
          <span>Polymarket-style input: primed</span>
          <span>Reserve posture: cautious</span>
          <span>Operator fun level: tasteful</span>
        </div>
        ${paymentProgressMarkup(invoice)}
      </article>
    `;
  }

  form.addEventListener("input", updatePreview);
  updatePreview();

  seedButton.addEventListener("click", () => {
    Object.entries(seeded).forEach(([key, value]) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
    updatePreview();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const amount = getNumericAmount(formData.get("amount"));
    const dueAt = String(formData.get("dueAt") || "");
    const recipientAddress = String(formData.get("recipientAddress") || "").trim();
    const clientName = String(formData.get("clientName") || "").trim();
    const milestoneTitle = String(formData.get("milestoneTitle") || "").trim();
    const note = String(formData.get("note") || "").trim();

    if (!clientName) {
      showToast("Add a counterparty or team name.");
      return;
    }

    if (amount <= 0) {
      showToast("Treasury size must be greater than zero.");
      return;
    }

    if (!dueAt) {
      showToast("Choose a decision deadline before launching the request.");
      return;
    }

    if (!isAddress(recipientAddress)) {
      showToast("Recipient wallet must be a valid EVM address.");
      return;
    }

    if (!milestoneTitle) {
      showToast("Add an event thesis.");
      return;
    }

    if (!note) {
      showToast("Add a treasury intent note.");
      return;
    }

    const invoice = hydrateInvoice({
      id: `inv_${Date.now()}`,
      clientName,
      amount,
      token: PAYMENT_RAIL.token.symbol,
      recipientAddress,
      payerAddress: "",
      note,
      dueAt,
      createdAt: new Date().toISOString(),
      status: "pending",
      categoryLabel: categoryFromNote(note),
      paymentDate: "",
      reminderText: "",
      txHash: "",
      networkChainId: 0,
      paymentRail: "base-sepolia-usdc",
      milestoneTitle,
      milestoneSummary: `${note} Treasury stays playful in presentation and painfully explicit in control until capital lands and signals clean up.`,
      escrowStatus: "awaiting_funding",
      releaseConfidence: 42,
      releaseRecommendation: "hold",
      releaseReason: "Capital has not landed yet, so treasury is keeping the confetti cannon holstered.",
      releasedAt: "",
    });

    state.invoices.unshift(invoice);
    saveState();
    window.location.hash = `#pay?invoiceId=${invoice.id}`;
  });
}

function walletStatusMarkup() {
  const networkOk = walletState.chainId === PAYMENT_RAIL.chain.chainIdDecimal;
  return `
    <div class="wallet-status-card">
      <div class="wallet-badge ${walletState.connected ? "is-on" : "is-off"}">
        <span class="wallet-dot"></span>
        ${walletState.connected ? "Wallet connected" : "Wallet disconnected"}
      </div>
      <div class="wallet-status-grid">
        <span>Address ${shortAddress(walletState.address)}</span>
        <span>Network ${walletState.chainId ? walletState.chainId : "Unknown"}</span>
        <span>Rail ${PAYMENT_RAIL.chain.chainName}</span>
        <span>${networkOk ? "Network ready" : "Switch required"}</span>
      </div>
    </div>
  `;
}

async function payInvoice(invoiceId) {
  const invoice = getInvoiceById(invoiceId);
  if (!invoice) throw new Error("Invoice not found.");
  if (invoice.status === "paid") throw new Error("This work scope is already funded.");
  if (!isAddress(invoice.recipientAddress)) throw new Error("Recipient address is invalid.");

  walletState.busy = true;

  try {
    const payerAddress = await connectWallet();
    await ensureBaseSepolia();
    const chainHex = await rpcRequest("eth_chainId");
    walletState.chainId = Number.parseInt(chainHex, 16) || 0;

    const units = amountToTokenUnits(invoice.amount, PAYMENT_RAIL.token.decimals);
    const data = encodeTransferData(invoice.recipientAddress, units);

    const txHash = await rpcRequest("eth_sendTransaction", [
      {
        from: payerAddress,
        to: PAYMENT_RAIL.token.address,
        data,
        value: "0x0",
      },
    ]);

    let receipt = null;
    for (let attempt = 0; attempt < 45; attempt += 1) {
      receipt = await rpcRequest("eth_getTransactionReceipt", [txHash]);
      if (receipt) break;
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
    }

    if (!receipt || receipt.status !== "0x1") {
      throw new Error("Transaction was submitted but not confirmed successfully.");
    }

    invoice.status = "paid";
    invoice.payerAddress = payerAddress;
    invoice.paymentDate = new Date().toISOString();
    invoice.txHash = txHash;
    invoice.networkChainId = walletState.chainId;
    invoice.paymentRail = "base-sepolia-usdc";
    invoice.escrowStatus = "funded";
    invoice.releaseRecommendation = "hold";
    invoice.releaseReason = "Settlement is confirmed. Now treasury waits for market mood, reviewer confidence, and one adult decision button.";
    saveState();
    return txHash;
  } finally {
    walletState.busy = false;
  }
}

function escrowRailMarkup(invoice) {
  const meta = getEscrowStatusMeta(invoice.escrowStatus);
  const recommendation = recommendationMeta(invoice.releaseRecommendation);
  return `
    <div class="rail-note escrow-note">
      <strong>Reactor state</strong>
      <p>${meta.detail}</p>
      <div class="rail-details">
        <span>Status ${meta.label}</span>
        <span>Market mood ${invoice.releaseConfidence}%</span>
        <span>Treasury move ${recommendation.label}</span>
      </div>
    </div>
  `;
}

function renderPay(query) {
  const invoiceId = query.get("invoiceId");
  const container = document.getElementById("pay-view");
  const invoice = getInvoiceById(invoiceId);

  if (!invoice) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Treasury request not found</h2>
        <p>Create a new request or load the spicy seeded state to continue the demo.</p>
      </div>
    `;
    return;
  }

  const isPaid = invoice.status === "paid";
  const shareLink = buildRouteUrl(`#pay?invoiceId=${invoice.id}`);
  const txExplorer = invoice.txHash ? `${PAYMENT_RAIL.chain.blockExplorerUrls[0]}/tx/${invoice.txHash}` : "";

  container.innerHTML = `
    <section class="pay-grid enterprise-pay-grid">
      <article class="pay-card invoice-core">
        <div class="pay-head">
          <div>
            <p class="card-label">Treasury request</p>
            <h2>${invoice.clientName}</h2>
          </div>
          ${createStatusChip(invoice.escrowStatus)}
        </div>
        <p class="amount">${formatCurrency(invoice.amount, invoice.token)}</p>
        <div class="pill-row">
          <span class="pill">${invoice.categoryLabel}</span>
          <span class="pill">Event ${invoice.milestoneTitle}</span>
          <span class="pill">Deadline ${formatShortDate(invoice.dueAt)}</span>
        </div>
        <p>${invoice.milestoneSummary}</p>
        <div class="invoice-meta">
          <span>Recipient ${shortAddress(invoice.recipientAddress)}</span>
          <span>Market mood ${invoice.releaseConfidence}%</span>
          <span>Treasury move ${recommendationMeta(invoice.releaseRecommendation).label}</span>
          <span>Request ID ${invoice.id}</span>
        </div>
        ${paymentProgressMarkup(invoice)}
        <div class="link-card">
          <code>${shareLink}</code>
          <button class="button button-secondary" id="copy-link">Copy link</button>
        </div>
        ${
          invoice.txHash
            ? `
              <div class="rail-proof">
                <p class="card-label">Settlement proof</p>
                <div class="rail-proof-row">
                  <span>${shortAddress(invoice.txHash)}</span>
                  <a class="button button-secondary" href="${txExplorer}" target="_blank" rel="noreferrer">View transaction</a>
                </div>
              </div>
            `
            : ""
        }
      </article>

      <aside class="pay-card rail-card">
        <div class="rail-card-head">
          <div>
            <p class="card-label">Real settlement rail</p>
            <h2>Feed the signal cockpit with real USDC</h2>
          </div>
          <span class="rail-token">${PAYMENT_RAIL.token.symbol}</span>
        </div>
        <p class="supporting">
          This still uses an injected EVM wallet and submits a real ERC-20 transfer. The fun part starts after settlement, when treasury uses market-style signals to decide whether to hold, stage, or route.
        </p>
        ${walletStatusMarkup()}
        <ul class="timeline">
          <li>Connect wallet and switch to Base Sepolia.</li>
          <li>Push real USDC into the treasury reactor.</li>
          <li>Let the signal board bully treasury into a clearer decision.</li>
        </ul>
        <div class="settlement-matrix">
          <article>
            <span>Event thesis</span>
            <strong>${invoice.milestoneTitle}</strong>
          </article>
          <article>
            <span>Capital entering rail</span>
            <strong>${formatCurrency(invoice.amount, invoice.token)}</strong>
          </article>
          <article>
            <span>Proof mode</span>
            <strong>On-chain receipt</strong>
          </article>
        </div>
        ${escrowRailMarkup(invoice)}
        <div class="pay-actions">
          <button class="button button-secondary" id="connect-wallet">Connect wallet</button>
          <button class="button button-primary" id="pay-action" ${isPaid ? "disabled" : ""}>
            ${isPaid ? "Settlement confirmed" : `Settle ${formatCurrency(invoice.amount, invoice.token)}`}
          </button>
        </div>
        <div class="rail-note">
          <strong>Demo note</strong>
          <p>Settlement is real on testnet. The signal theatre, reserve posture, and routing logic are intentionally product-layer MVP pieces.</p>
        </div>
      </aside>
    </section>
  `;

  document.getElementById("copy-link").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      showToast("Signal-aware request link copied.");
    } catch {
      showToast("Clipboard access unavailable in this browser.");
    }
  });

  document.getElementById("connect-wallet").addEventListener("click", async () => {
    try {
      await connectWallet();
      renderPay(new URLSearchParams(`invoiceId=${invoice.id}`));
      showToast("Wallet connected. Reactor online.");
    } catch (error) {
      showToast(error.message || "Wallet connection failed.");
    }
  });

  const payButton = document.getElementById("pay-action");
  if (!payButton.disabled) {
    payButton.addEventListener("click", async () => {
      payButton.disabled = true;
      payButton.textContent = "Waiting for wallet confirmation";

      try {
        await payInvoice(invoice.id);
        showToast("Settlement confirmed on-chain.");
        renderPay(new URLSearchParams(`invoiceId=${invoice.id}`));
        window.setTimeout(() => {
          window.location.hash = "#dashboard";
        }, 900);
      } catch (error) {
        payButton.disabled = false;
        payButton.textContent = `Settle ${formatCurrency(invoice.amount, invoice.token)}`;
        showToast(error.message || "Payment failed.");
      }
    });
  }
}

function renderDashboard() {
  renderOpsSpotlight();
  renderStats();
  renderTreasury();
  renderOpenInvoices();
  renderPaidInvoices();
  renderSummary();
  renderActivity();
  renderSplitForm();
  renderPayouts();
}

function renderOpsSpotlight() {
  const container = document.getElementById("ops-spotlight");
  const fundedCount = state.invoices.filter((invoice) => invoice.status === "paid").length;
  const reviewCount = state.invoices.filter((invoice) => invoice.escrowStatus === "in_review").length;
  const releasableCount = state.invoices.filter((invoice) => invoice.escrowStatus === "releasable").length;
  const bestInvoice = highestConfidenceInvoice();
  const opsSignal = releasableCount
    ? "Routing window opening"
    : reviewCount
      ? "Signal turbulence active"
      : fundedCount
        ? "Capital landed, waiting for conviction"
        : "Cockpit waiting for first live settlement";

  container.innerHTML = `
    <section class="ops-spotlight panel">
      <div class="ops-spotlight-copy">
        <p class="card-label">Treasury pulse</p>
        <h2>${opsSignal}</h2>
        <p>
          StableFlow now behaves like a strategy room: real settlement enters first, market-style signals make things interesting, and AI turns the noise into a treasury memo that still ends with a human click.
        </p>
      </div>
      <div class="ops-spotlight-grid">
        <article class="ops-pulse-card">
          <span>Capital on board</span>
          <strong>${formatCurrency(totalFundedEscrowAmount())}</strong>
          <small>${fundedCount} funded request${fundedCount === 1 ? " is" : "s are"} already inside the signal reactor.</small>
        </article>
        <article class="ops-pulse-card">
          <span>Drama queue</span>
          <strong>${reviewCount}</strong>
          <small>${reviewCount ? "Signals are still messy, so treasury is refusing to confuse excitement with policy." : "Nothing is theatrically undecided right now."}</small>
        </article>
        <article class="ops-pulse-card">
          <span>Hottest read</span>
          <strong>${bestInvoice ? `${bestInvoice.releaseConfidence}%` : "0%"}</strong>
          <small>${bestInvoice ? `${bestInvoice.clientName} currently has the cleanest case for a routing move.` : "Fund a request to let the market mood get loud."}</small>
        </article>
      </div>
    </section>
  `;
}

function renderStats() {
  const pending = state.invoices.filter((invoice) => invoice.status === "pending");
  const overdue = state.invoices.filter((invoice) => invoice.status === "overdue");
  const funded = state.invoices.filter((invoice) => invoice.escrowStatus === "funded");
  const releasable = state.invoices.filter((invoice) => invoice.escrowStatus === "releasable");
  const receivables = pending.reduce((sum, invoice) => sum + getNumericAmount(invoice.amount), 0);

  document.getElementById("stats-row").innerHTML = `
    <article class="stat-card emphasis-card">
      <p class="card-label">Capital landed</p>
      <div class="stat-value">${formatCurrency(totalFundedEscrowAmount())}</div>
      <p class="supporting">Real on-chain settlement is already giving the demo weight.</p>
    </article>
    <article class="stat-card">
      <p class="card-label">Dry powder waiting</p>
      <div class="stat-value">${formatCurrency(receivables)}</div>
      <p class="supporting">${pending.length} request(s) still need capital before the fun begins.</p>
    </article>
    <article class="stat-card">
      <p class="card-label">Reserve posture</p>
      <div class="stat-value">${funded.length}</div>
      <p class="supporting">${funded.length} funded request(s) are being held while treasury demands cleaner signals.</p>
    </article>
    <article class="stat-card">
      <p class="card-label">Routing unlocked</p>
      <div class="stat-value">${formatCurrency(totalReadyToSplitAmount())}</div>
      <p class="supporting">${releasable.length} move(s) are ready for explicit treasury action.</p>
    </article>
    <article class="stat-card">
      <p class="card-label">Chaos meter</p>
      <div class="stat-value">${overdue.length}</div>
      <p class="supporting">${overdue.length ? "Some requests are late, cranky, and not yet worthy of capital." : "No overdue chaos in the queue right now."}</p>
    </article>
  `;
}

function renderTreasury() {
  const container = document.getElementById("treasury-panel");
  container.innerHTML = `
    <div class="treasury-grid treasury-grid-wide">
      <article class="treasury-card">
        <span>Capital on rail</span>
        <strong>${formatCurrency(totalFundedEscrowAmount())}</strong>
        <small>Real Base Sepolia settlement already confirmed by wallet-triggered ERC-20 transfers.</small>
      </article>
      <article class="treasury-card">
        <span>Routing potential</span>
        <strong>${formatCurrency(totalReadyToSplitAmount())}</strong>
        <small>Capital currently unlocked by signal quality and explicit treasury approval.</small>
      </article>
      <article class="treasury-card">
        <span>Moves already routed</span>
        <strong>${formatCurrency(totalRoutedAmount())}</strong>
        <small>Value assigned downstream after treasury decided to stop being shy.</small>
      </article>
      <article class="treasury-card">
        <span>Adult supervision reserve</span>
        <strong>${formatCurrency(totalRetainedTreasuryAmount())}</strong>
        <small>Funded balance still retained after routing, because not every signal deserves obedience.</small>
      </article>
    </div>
  `;
}

function renderOpenInvoices() {
  const container = document.getElementById("open-invoices");
  const reviewQueue = state.invoices.filter((invoice) => invoice.escrowStatus !== "released");

  if (!reviewQueue.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No request is waiting</h3>
        <p>Create a treasury request to bring the signal cockpit back to life.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="invoice-list">
      ${reviewQueue
        .map((invoice) => {
          const recommendation = recommendationMeta(invoice.releaseRecommendation);
          return `
            <article class="invoice-card ledger-card">
              <div class="invoice-head">
                <div>
                  <h3>${invoice.clientName}</h3>
                  <p class="supporting">${invoice.milestoneTitle}</p>
                </div>
                ${createStatusChip(invoice.escrowStatus)}
              </div>
              <p class="amount">${formatCurrency(invoice.amount, invoice.token)}</p>
              <div class="invoice-meta">
                <span>Deadline ${formatDate(invoice.dueAt)}</span>
                <span>Market mood ${invoice.releaseConfidence}%</span>
                <span>Move ${recommendation.label}</span>
                <span>${invoice.status === "paid" ? "Capital confirmed" : invoice.reminderText}</span>
              </div>
              <p class="supporting">${invoice.releaseReason}</p>
              <div class="invoice-actions">
                <a class="button button-primary" href="${buildRouteUrl(`#pay?invoiceId=${invoice.id}`)}">Open settlement rail</a>
                <a class="button button-secondary" href="${buildRouteUrl(`#create?invoiceId=${invoice.id}`)}">Remix request</a>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderPaidInvoices() {
  const container = document.getElementById("paid-invoices");
  const fundedInvoices = state.invoices.filter((invoice) => invoice.status === "paid");

  if (!fundedInvoices.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No capital on board yet</h3>
        <p>Use the settlement reactor to submit a real Base Sepolia USDC transfer.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="invoice-list">
      ${fundedInvoices
        .map((invoice) => `
          <article class="invoice-card ledger-card paid-card">
            <div class="invoice-head">
              <div>
                <h3>${invoice.clientName}</h3>
                <p class="supporting">Settled ${formatDateTime(invoice.paymentDate || invoice.createdAt)}</p>
              </div>
              ${createStatusChip(invoice.escrowStatus)}
            </div>
            <p class="amount">${formatCurrency(invoice.amount, invoice.token)}</p>
            <div class="invoice-meta">
              <span>Payer ${shortAddress(invoice.payerAddress || "")}</span>
              <span>Reserve left ${formatCurrency(invoiceRemaining(invoice.id), invoice.token)}</span>
              <span>Signal mood ${invoice.releaseConfidence}%</span>
              <span>${invoice.txHash ? shortAddress(invoice.txHash) : "Seeded settlement"}</span>
            </div>
            <p class="supporting">${invoice.releaseReason}</p>
          </article>
        `)
        .join("")}
    </div>
  `;
}

function renderSummary() {
  const container = document.getElementById("summary-panel");
  const focus = highestConfidenceInvoice();
  const recommendation = focus ? recommendationMeta(focus.releaseRecommendation) : null;

  container.innerHTML = `
    <div class="summary-box summary-shell">
      <p>
        AI is not touching the funds. It is translating market heat, settlement posture, and routing tension into a memo that a finance lead can actually act on.
      </p>
      ${
        focus
          ? `
            <div class="ai-callout ${recommendation ? `is-${recommendation.tone}` : ""}">
              <span>Operator focus</span>
              <strong>${focus.clientName} — ${focus.milestoneTitle}</strong>
              <p>${focus.releaseReason}</p>
            </div>
          `
          : ""
      }
      <ul class="summary-list">
        ${weeklySummary()
          .map((line) => `<li>${line}</li>`)
          .join("")}
      </ul>
    </div>
  `;
}

function releaseInvoice(invoiceId) {
  const invoice = getInvoiceById(invoiceId);
  if (!invoice) return;
  invoice.escrowStatus = "released";
  invoice.releasedAt = new Date().toISOString();
  invoice.releaseRecommendation = "release";
  invoice.releaseReason = "Treasury approved the move. Routing can now happen with full signal receipts and zero fake drama.";
  saveState();
}

function renderActivity() {
  const container = document.getElementById("activity-panel");
  const fundedInvoices = state.invoices.filter((invoice) => invoice.status === "paid");
  const activity = getRecentActivity();
  const signalForms = fundedInvoices.length
    ? fundedInvoices
        .map((invoice) => {
          const latestSignals = getSignalsForInvoice(invoice.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          return `
            <article class="signal-entry-card">
              <div class="invoice-head">
                <div>
                  <h3>${invoice.clientName}</h3>
                  <p class="supporting">${invoice.milestoneTitle}</p>
                </div>
                ${createStatusChip(invoice.escrowStatus)}
              </div>
              <div class="signal-score-row">
                <strong>${invoice.releaseConfidence}% confidence</strong>
                <span>${recommendationMeta(invoice.releaseRecommendation).label}</span>
              </div>
              <form class="signal-form" data-invoice-id="${invoice.id}">
                <div class="signal-form-grid">
                  <label>
                    Signal source
                    <input name="sourceLabel" placeholder="Polymarket snapshot" required />
                  </label>
                  <label>
                    Conviction
                    <select name="weight">
                      <option value="1">Whisper</option>
                      <option value="2" selected>Firm nod</option>
                      <option value="3">Table slam</option>
                    </select>
                  </label>
                </div>
                <div class="signal-actions">
                  <button class="button button-secondary" type="submit" name="stance" value="no">Add bearish heat</button>
                  <button class="button button-primary" type="submit" name="stance" value="yes">Add bullish heat</button>
                </div>
              </form>
              <div class="signal-log">
                ${
                  latestSignals.length
                    ? latestSignals
                        .map(
                          (signal) => `
                            <div class="signal-log-item">
                              <span>${signal.sourceLabel}</span>
                              <strong>${signal.stance === "yes" ? "BULLISH" : "BEARISH"} · ${signalWeightLabel(signal.weight)}</strong>
                            </div>
                          `,
                        )
                        .join("")
                    : '<p class="supporting">No market heat yet. Add a signal and make treasury slightly more uncomfortable.</p>'
                }
              </div>
              ${
                invoice.escrowStatus === "releasable"
                  ? `<button class="button button-primary release-button" data-release-id="${invoice.id}">Approve treasury move</button>`
                  : ""
              }
            </article>
          `;
        })
        .join("")
    : "";

  container.innerHTML = `
    <div class="signal-panel-stack">
      ${
        fundedInvoices.length
          ? `
            <div class="signal-entry-grid">
              ${signalForms}
            </div>
          `
          : `
            <div class="empty-state">
              <h3>No signal theatre yet</h3>
              <p>Fund a request first, then let market heat and operator notes fight for treasury attention.</p>
            </div>
          `
      }
      ${
        activity.length
          ? `
            <div class="activity-list activity-list-tight">
              ${activity
                .map(
                  (entry) => `
                    <article class="activity-card">
                      <div class="activity-topline">
                        ${createStatusChip(entry.kind)}
                        <span>${formatDateTime(entry.date)}</span>
                      </div>
                      <h3>${entry.title}</h3>
                      <p>${entry.detail}</p>
                    </article>
                  `,
                )
                .join("")}
            </div>
          `
          : ""
      }
    </div>
  `;

  container.querySelectorAll(".signal-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const submitter = event.submitter;
      const invoiceId = form.getAttribute("data-invoice-id") || "";
      const invoice = getInvoiceById(invoiceId);
      if (!invoice) {
        showToast("Treasury request not found.");
        return;
      }

      const formData = new FormData(form);
      const sourceLabel = String(formData.get("sourceLabel") || "").trim();
      const weight = getNumericAmount(formData.get("weight"));
      const stance = submitter?.value === "no" ? "no" : "yes";

      if (!sourceLabel) {
        showToast("Add a signal source.");
        return;
      }

      state.signals.unshift({
        id: `sig_${Date.now()}`,
        invoiceId,
        stance,
        weight,
        sourceLabel,
        createdAt: new Date().toISOString(),
      });

      saveState();
      showToast(`${stance === "yes" ? "Bullish" : "Bearish"} signal added.`);
      renderDashboard();
    });
  });

  container.querySelectorAll(".release-button").forEach((button) => {
    button.addEventListener("click", () => {
      const invoiceId = button.getAttribute("data-release-id") || "";
      releaseInvoice(invoiceId);
      showToast("Treasury move approved.");
      renderDashboard();
    });
  });
}

function renderPayouts() {
  const container = document.getElementById("recent-payouts");

  if (!state.payouts.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No routing intent yet</h3>
        <p>Approve a treasury move, then record how capital should flow after the signal dust settles.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="payout-list">
      ${state.payouts
        .map((payout) => {
          const invoice = getInvoiceById(payout.invoiceId);
          return `
            <article class="payout-card ledger-card">
              <div class="payout-head">
                <div>
                  <h3>${payout.label}</h3>
                  <p class="supporting">${invoice ? invoice.clientName : payout.invoiceId}</p>
                </div>
                <span class="status-chip" data-status="released">Recorded</span>
              </div>
              <p class="amount">${formatCurrency(payout.amount)}</p>
              <div class="invoice-meta">
                <span>Recipient ${shortAddress(payout.recipientAddress)}</span>
                <span>Mode ${(payout.mode || "fixed").replace("_", " ")}</span>
                <span>Created ${formatDate(payout.createdAt)}</span>
                <span>Post-decision routing intent</span>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderSplitForm() {
  const form = document.getElementById("split-form");
  const releasableInvoices = state.invoices.filter((invoice) => ["releasable", "released"].includes(invoice.escrowStatus));

  if (!releasableInvoices.length) {
    form.innerHTML = `
      <div class="empty-state">
        <h3>Need an unlocked treasury move</h3>
        <p>Fund a request, stir the signal board, and approve the move before drafting a routing intent.</p>
      </div>
    `;
    return;
  }

  const options = releasableInvoices
    .map(
      (invoice) => `
        <option value="${invoice.id}">
          ${invoice.clientName} - ${invoice.releaseConfidence}% - ${formatCurrency(invoiceRemaining(invoice.id), invoice.token)} left
        </option>
      `,
    )
    .join("");

  form.innerHTML = `
    <label>
      Treasury move candidate
      <select name="invoiceId">${options}</select>
    </label>
    <div class="split-row">
      <label>
        Destination wallet
        <input name="recipientAddress" placeholder="0xF1c40000000000000000000000000000002E77" required />
      </label>
      <label>
        Routing amount
        <input name="amount" type="number" min="1" step="0.01" placeholder="250" required />
      </label>
    </div>
    <div class="split-row">
      <label>
        Move label
        <input name="label" placeholder="Live analytics reserve" required />
      </label>
      <label>
        Routing style
        <select name="mode">
          <option value="fixed">Fixed amount</option>
          <option value="percentage_hint">Percentage hint</option>
        </select>
      </label>
    </div>
    <div class="split-hint" id="split-hint"></div>
    <div class="split-actions">
      <button class="button button-primary" type="submit">Record routing intent</button>
    </div>
  `;

  const select = form.elements.invoiceId;
  const hint = document.getElementById("split-hint");

  function updateHint() {
    const invoiceId = select.value;
    const invoice = getInvoiceById(invoiceId);
    if (!invoice) return;
    const remaining = invoiceRemaining(invoiceId);
    hint.innerHTML = `
      <strong>${invoice.milestoneTitle}</strong>
      <p>Available to route: ${formatCurrency(remaining, invoice.token)} from ${invoice.clientName}. Suggested move: ${recommendationMeta(invoice.releaseRecommendation).label}.</p>
    `;
  }

  select.addEventListener("change", updateHint);
  updateHint();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const invoiceId = String(formData.get("invoiceId") || "");
    const invoice = getInvoiceById(invoiceId);
    const amount = getNumericAmount(formData.get("amount"));
    const remaining = invoiceRemaining(invoiceId);
    const recipientAddress = String(formData.get("recipientAddress") || "").trim();
    const label = String(formData.get("label") || "").trim();
    const mode = String(formData.get("mode") || "fixed");

    if (!invoice) {
      showToast("Select a treasury move candidate first.");
      return;
    }

    if (!["releasable", "released"].includes(invoice.escrowStatus)) {
      showToast("This request is not unlocked for routing yet.");
      return;
    }

    if (amount <= 0) {
      showToast("Routing amount must be greater than zero.");
      return;
    }

    if (!isAddress(recipientAddress)) {
      showToast("Destination wallet must be a valid EVM address.");
      return;
    }

    if (!label) {
      showToast("Add a move label.");
      return;
    }

    if (amount > remaining) {
      showToast(`This routing intent exceeds the remaining ${formatCurrency(remaining, invoice.token)}.`);
      return;
    }

    if (invoice.escrowStatus === "releasable") {
      releaseInvoice(invoice.id);
    }

    state.payouts.unshift({
      id: `pay_${Date.now()}`,
      invoiceId,
      recipientAddress,
      amount,
      status: "paid",
      label,
      createdAt: new Date().toISOString(),
      mode,
    });

    saveState();
    showToast("Routing intent recorded.");
    renderDashboard();
  });
}

async function syncWalletState() {
  if (!window.ethereum) return;

  try {
    const accounts = await rpcRequest("eth_accounts");
    const chainHex = await rpcRequest("eth_chainId");
    walletState.address = accounts[0] || "";
    walletState.chainId = Number.parseInt(chainHex, 16) || 0;
    walletState.connected = Boolean(walletState.address);
  } catch {
    walletState.address = "";
    walletState.chainId = 0;
    walletState.connected = false;
  }
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", async () => {
  await syncWalletState();
  render();
});

if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    walletState.address = accounts[0] || "";
    walletState.connected = Boolean(walletState.address);
    render();
  });

  window.ethereum.on("chainChanged", (chainHex) => {
    walletState.chainId = Number.parseInt(chainHex, 16) || 0;
    render();
  });
}
