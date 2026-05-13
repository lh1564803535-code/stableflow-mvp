/* ═══════════════════════════════════════════════════════════════
   StableFlow V2 — Dark Cyber Theme + i18n
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "stableflow-v2-state";

const CATEGORIES = {
  design: { label: "Design", icon: "🎨" },
  development: { label: "Development", icon: "💻" },
  writing: { label: "Writing", icon: "✍️" },
  video: { label: "Video", icon: "🎬" },
  translation: { label: "Translation", icon: "🌐" },
  other: { label: "Other", icon: "📦" },
};

const BASE_SEPOLIA = {
  chainId: "0x14A34",
  chainIdDecimal: 84532,
  chainName: "Base Sepolia",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
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
  platformFeePercent: 2,
};

// ──── Contract Config ────
// After deploying, replace with your actual contract address
const CONTRACT_ADDRESS = "DEPLOYED_CONTRACT_ADDRESS";
const CONTRACT_ABI = [
  "function createOrder(address _seller, uint256 _amount, uint256[] _milestonePercents) external returns (uint256)",
  "function deliverMilestone(uint256 _orderId, uint256 _index) external",
  "function releaseMilestone(uint256 _orderId, uint256 _index) external",
  "function autoReleaseMilestone(uint256 _orderId, uint256 _index) external",
  "function disputeMilestone(uint256 _orderId, uint256 _index) external",
  "function resolveDispute(uint256 _orderId, uint256 _index, address _recipient, uint256 _percentToRecipient) external",
  "function claimTimeoutRefund(uint256 _orderId, uint256 _index) external",
  "function pause() external",
  "function unpause() external",
  "function setArbitrator(address _newArbitrator) external",
  "function setPlatformWallet(address _newWallet) external",
  "function arbitrator() external view returns (address)",
  "function DISPUTE_TIMEOUT() external view returns (uint256)",
  "function DELIVERY_CONFIRM_TIMEOUT() external view returns (uint256)",
  "function MIN_ORDER_AMOUNT() external view returns (uint256)",
  "function canAutoRelease(uint256 _orderId, uint256 _index) external view returns (bool)",
  "function canClaimTimeoutRefund(uint256 _orderId, uint256 _index) external view returns (bool)",
  "function getOrder(uint256 _orderId) external view returns (tuple(uint256 id, address buyer, address seller, uint256 totalAmount, uint256 releasedAmount, uint256 milestoneCount, uint256 createdAt, bool completed))",
  "function getMilestone(uint256 _orderId, uint256 _index) external view returns (tuple(uint256 amount, uint8 status, uint256 deliveredAt, uint256 releasedAt, uint256 disputedAt))",
  "function getOrderCount() external view returns (uint256)",
  "event OrderCreated(uint256 indexed orderId, address indexed buyer, address indexed seller, uint256 totalAmount, uint256 milestoneCount)",
  "event MilestoneDelivered(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed seller, uint256 timestamp)",
  "event MilestoneReleased(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed buyer, uint256 amount, uint256 timestamp)",
  "event MilestoneAutoReleased(uint256 indexed orderId, uint256 indexed milestoneIndex, uint256 amount)",
  "event MilestoneDisputed(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed party, uint256 timestamp)",
  "event MilestoneResolved(uint256 indexed orderId, uint256 indexed milestoneIndex, address indexed recipient, uint256 recipientAmount, uint256 otherAmount)",
  "event MilestoneTimeoutRefund(uint256 indexed orderId, uint256 indexed milestoneIndex, uint256 refundAmount)",
];

let escrowContract = null;

async function getEscrowContract() {
  if (!window.ethereum) throw new Error("No wallet connected.");
  if (CONTRACT_ADDRESS === "DEPLOYED_CONTRACT_ADDRESS") {
    throw new Error("Contract not deployed yet. Please deploy first.");
  }
  if (!escrowContract) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    escrowContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }
  return escrowContract;
}

// ─── i18n ────────────────────────────────────────────────────────
const LANG = {
  en: {
    nav_home: "Home",
    nav_browse: "Browse",
    nav_sell: "Sell",
    nav_orders: "Orders",
    nav_sales: "Sales",
    network: "Base Sepolia + USDC",
    eyebrow: "Stablecoin marketplace",
    hero_title_1: "Buy and sell services with ",
    hero_title_2: "USDC",
    hero_title_3: ". Milestone escrow. ",
    hero_title_4: "Instant release",
    hero_title_5: ".",
    hero_text: "StableFlow is a marketplace where freelancers list services and clients pay with USDC. Funds are locked in escrow and released milestone by milestone. No middleman, no 20% fee.",
    cta_browse: "Browse services",
    cta_sell: "Sell a service",
    how_it_works: "How it works",
    step1_title: "List",
    step1_desc: "Freelancer creates a service with milestones and price.",
    step2_title: "Pay",
    step2_desc: "Client pays USDC. Funds lock in escrow.",
    step3_title: "Deliver",
    step3_desc: "Freelancer completes milestones. Client confirms. Funds release.",
    fee_label: "Fee",
    fee_desc: "2% platform fee on release. Gas only on Base.",
    browse_title: "Browse services",
    filter_all: "All",
    sell_service: "Sell a service",
    back_to_browse: "Back to browse",
    buy_service: "Buy this service",
    milestones: "Milestones",
    delivery_steps: "Delivery steps",
    seller: "Seller",
    orders_count: "orders",
    funds_locked: "Funds locked in escrow until milestones are confirmed",
    platform_fee: "Platform fee (2%)",
    seller_receives: "Seller receives",
    create_title: "Create service",
    service_title_label: "Service title",
    service_title_placeholder: "e.g. Logo Design for Startups",
    category_label: "Category",
    description_label: "Description",
    description_placeholder: "Describe what you offer, your process, and what the client can expect.",
    price_label: "Price (USDC)",
    milestone_section: "Milestones",
    milestone_total: "Total",
    milestone_hint: "Percentages must sum to exactly 100%",
    add_milestone: "+ Add milestone",
    publish: "Publish service",
    ms_name: "Name",
    ms_percent: "Percent",
    ms_desc: "Description",
    wallet_required: "Wallet required",
    connect_wallet: "Connect your wallet to see your orders",
    connect_wallet_sales: "Connect your wallet to see your sales",
    connect_wallet_profile: "Connect a wallet or visit a user profile",
    connect_btn: "Connect Wallet",
    no_orders: "No orders yet",
    no_orders_desc: "Browse services and make your first purchase.",
    no_sales: "No sales yet",
    no_sales_desc: "Create a service to start receiving orders.",
    confirm_release: "Confirm Release",
    dispute: "Dispute",
    completed: "Completed",
    mark_delivered: "Mark as Delivered",
    orders_label: "Buyer",
    sales_label: "Seller",
    profile_label: "Account",
    profile_title: "Profile",
    services: "Services",
    as_buyer: "As Buyer",
    as_seller: "As Seller",
    listed_services: "Listed Services",
    no_services: "No services listed.",
    toast_purchased: "Service purchased! Order created.",
    toast_delivered: "Milestone marked as delivered.",
    toast_released: "Milestone released!",
    toast_disputed: "Milestone disputed.",
    toast_published: "Service published!",
    toast_connect: "Connect wallet to continue.",
    toast_wallet_error: "Connect a wallet first to publish.",
  },
  zh: {
    nav_home: "首页",
    nav_browse: "浏览",
    nav_sell: "出售",
    nav_orders: "订单",
    nav_sales: "销售",
    network: "Base Sepolia + USDC",
    eyebrow: "稳定币服务市场",
    hero_title_1: "用 ",
    hero_title_2: "USDC",
    hero_title_3: " 买卖服务。里程碑托管。 ",
    hero_title_4: "即时释放",
    hero_title_5: "。",
    hero_text: "StableFlow 是一个自由职业者挂服务、客户用 USDC 付款的市场。资金锁定在托管合约中，按里程碑逐步释放。没有中间商，没有 20% 手续费。",
    cta_browse: "浏览服务",
    cta_sell: "出售服务",
    how_it_works: "运作方式",
    step1_title: "上架",
    step1_desc: "自由职业者创建服务，设定里程碑和价格。",
    step2_title: "付款",
    step2_desc: "客户用 USDC 付款，资金锁定在托管合约中。",
    step3_title: "交付",
    step3_desc: "自由职业者完成里程碑，客户确认，资金释放。",
    fee_label: "手续费",
    fee_desc: "释放时收取 2% 平台费。Gas 费在 Base 上。",
    browse_title: "浏览服务",
    filter_all: "全部",
    sell_service: "出售服务",
    back_to_browse: "返回浏览",
    buy_service: "购买此服务",
    milestones: "里程碑",
    delivery_steps: "交付步骤",
    seller: "卖家",
    orders_count: "笔订单",
    funds_locked: "资金锁定在托管中，直到里程碑确认",
    platform_fee: "平台费 (2%)",
    seller_receives: "卖家收到",
    create_title: "创建服务",
    service_title_label: "服务标题",
    service_title_placeholder: "例如：初创公司 Logo 设计",
    category_label: "分类",
    description_label: "服务描述",
    description_placeholder: "描述你提供的服务、流程和客户可以期待的结果。",
    price_label: "价格（USDC）",
    milestone_section: "里程碑",
    milestone_total: "合计",
    milestone_hint: "百分比总和必须等于 100%",
    add_milestone: "+ 添加里程碑",
    publish: "发布服务",
    ms_name: "名称",
    ms_percent: "百分比",
    ms_desc: "描述",
    wallet_required: "需要钱包",
    connect_wallet: "连接钱包以查看你的订单",
    connect_wallet_sales: "连接钱包以查看你的销售",
    connect_wallet_profile: "连接钱包或访问用户资料",
    connect_btn: "连接钱包",
    no_orders: "暂无订单",
    no_orders_desc: "浏览服务并完成你的第一笔购买。",
    no_sales: "暂无销售",
    no_sales_desc: "创建服务以开始接收订单。",
    confirm_release: "确认释放",
    dispute: "争议",
    completed: "已完成",
    mark_delivered: "标记为已交付",
    orders_label: "买家",
    sales_label: "卖家",
    profile_label: "账户",
    profile_title: "个人资料",
    services: "服务",
    as_buyer: "作为买家",
    as_seller: "作为卖家",
    listed_services: "已上架服务",
    no_services: "暂无上架服务。",
    toast_purchased: "服务已购买！订单已创建。",
    toast_delivered: "里程碑已标记为已交付。",
    toast_released: "里程碑已释放！",
    toast_disputed: "里程碑已争议。",
    toast_published: "服务已发布！",
    toast_connect: "请先连接钱包。",
    toast_wallet_error: "请先连接钱包再发布。",
  },
};

let currentLang = localStorage.getItem("stableflow-lang") || "en";

function t(key) {
  return LANG[currentLang][key] || LANG.en[key] || key;
}

function toggleLang() {
  currentLang = currentLang === "en" ? "zh" : "en";
  localStorage.setItem("stableflow-lang", currentLang);
  render();
  showToast(currentLang === "en" ? "Switched to English" : "已切换到中文");
}

// ─── Seeded Data ─────────────────────────────────────────────────
const seededState = {
  services: [
    {
      id: "svc_001",
      sellerAddress: "0xA4f0000000000000000000000000000000dE91",
      title: "Logo Design for Startups",
      description: "I will design a modern, memorable logo for your startup. Includes 3 initial concepts, unlimited revisions on your chosen concept, and final files in SVG, PNG, and PDF formats. Typical turnaround: 5 days.",
      category: "design",
      priceUSDC: 500,
      milestones: [
        { name: "Brief & Concepts", percent: 30, description: "I'll send 3 initial logo concepts based on your brand brief." },
        { name: "Revisions", percent: 40, description: "Up to 3 rounds of revisions on your chosen concept." },
        { name: "Final Delivery", percent: 30, description: "Final logo files in SVG, PNG, and PDF." },
      ],
      examples: [],
      createdAt: "2026-04-28T10:00:00Z",
      orderCount: 3,
    },
    {
      id: "svc_002",
      sellerAddress: "0xDev10000000000000000000000000000009a31",
      title: "Landing Page Development",
      description: "I will build a responsive, fast-loading landing page with modern HTML/CSS/JS. Includes mobile optimization, SEO basics, and deployment to your hosting. No framework bloat, pure performance.",
      category: "development",
      priceUSDC: 1200,
      milestones: [
        { name: "Design Review", percent: 20, description: "Wireframe and visual mockup for your approval." },
        { name: "Development", percent: 50, description: "Fully coded page with all sections, responsive and tested." },
        { name: "Deployment", percent: 30, description: "Deploy to your hosting, test all links and forms." },
      ],
      examples: [],
      createdAt: "2026-04-29T14:00:00Z",
      orderCount: 1,
    },
    {
      id: "svc_003",
      sellerAddress: "0xMkT2000000000000000000000000000000ba82",
      title: "Blog Article Writing (1500 words)",
      description: "I will write a well-researched, SEO-friendly blog article on any tech/business topic. Includes keyword research, outline approval, and one round of revisions. Native English quality.",
      category: "writing",
      priceUSDC: 150,
      milestones: [
        { name: "Outline", percent: 30, description: "Detailed outline with key points for your approval." },
        { name: "First Draft", percent: 50, description: "Complete first draft, ready for your review." },
        { name: "Final Version", percent: 20, description: "Revised version based on your feedback." },
      ],
      examples: [],
      createdAt: "2026-04-30T09:00:00Z",
      orderCount: 5,
    },
    {
      id: "svc_004",
      sellerAddress: "0xA4f0000000000000000000000000000000dE91",
      title: "Smart Contract Audit (Solidity)",
      description: "I will audit your Solidity smart contract for security vulnerabilities, gas optimization, and best practices. Includes detailed report with severity ratings and fix recommendations.",
      category: "development",
      priceUSDC: 2000,
      milestones: [
        { name: "Initial Review", percent: 25, description: "First pass review, identify critical issues." },
        { name: "Deep Analysis", percent: 50, description: "Full audit with detailed findings report." },
        { name: "Fix Verification", percent: 25, description: "Verify your fixes and issue final sign-off." },
      ],
      examples: [],
      createdAt: "2026-05-01T08:00:00Z",
      orderCount: 0,
    },
  ],
  orders: [
    {
      id: "ord_demo_001",
      serviceId: "svc_001",
      buyerAddress: "0x1Cb90000000000000000000000000000007d77",
      sellerAddress: "0xA4f0000000000000000000000000000000dE91",
      serviceTitle: "Logo Design for Startups",
      totalAmount: 500,
      status: "active",
      milestoneStatuses: [
        { index: 0, status: "released", fundedAt: "2026-04-28T12:00:00Z", deliveredAt: "2026-04-29T10:00:00Z", releasedAt: "2026-04-29T14:00:00Z" },
        { index: 1, status: "delivered", fundedAt: "2026-04-28T12:00:00Z", deliveredAt: "2026-05-01T09:00:00Z", releasedAt: null },
        { index: 2, status: "funded", fundedAt: "2026-04-28T12:00:00Z", deliveredAt: null, releasedAt: null },
      ],
      createdAt: "2026-04-28T12:00:00Z",
      txHash: "0x2eb0b3c1be000000000000000000000000000000000000000000000000000001",
    },
  ],
};

// ─── Wallet Utilities ────────────────────────────────────────────
const walletState = { address: "", chainId: 0, connected: false, busy: false };
const app = document.getElementById("app");
const storageFallback = new Map();

function readStoredValue(key) {
  try { return window.localStorage.getItem(key); }
  catch { return storageFallback.has(key) ? storageFallback.get(key) : null; }
}

function writeStoredValue(key, value) {
  try { window.localStorage.setItem(key, value); }
  catch { storageFallback.set(key, value); }
}

function buildRouteUrl(hash) {
  const url = new URL(window.location.href);
  url.hash = hash.startsWith("#") ? hash : `#${hash}`;
  return url.toString();
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
  if (!window.ethereum) throw new Error("No injected wallet found. Use MetaMask.");
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

// ─── Formatting ──────────────────────────────────────────────────
function getNumericAmount(value) { return Number(value) || 0; }

function formatCurrency(amount, token = "USDC") {
  return `${getNumericAmount(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${token}`;
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

// ─── State Management ────────────────────────────────────────────
function loadState() {
  const raw = readStoredValue(STORAGE_KEY);
  if (!raw) { const i = structuredClone(seededState); writeStoredValue(STORAGE_KEY, JSON.stringify(i)); return i; }
  try { return JSON.parse(raw); }
  catch { const i = structuredClone(seededState); writeStoredValue(STORAGE_KEY, JSON.stringify(i)); return i; }
}

let state = loadState();
function saveState() { writeStoredValue(STORAGE_KEY, JSON.stringify(state)); }

// ─── Queries ─────────────────────────────────────────────────────
function getServiceById(id) { return state.services.find((s) => s.id === id); }
function getOrdersForService(serviceId) { return state.orders.filter((o) => o.serviceId === serviceId); }
function getOrdersByBuyer(address) { return state.orders.filter((o) => o.buyerAddress.toLowerCase() === address.toLowerCase()); }
function getOrdersBySeller(address) { return state.orders.filter((o) => o.sellerAddress.toLowerCase() === address.toLowerCase()); }
function getServicesBySeller(address) { return state.services.filter((s) => s.sellerAddress.toLowerCase() === address.toLowerCase()); }
function getServicesByCategory(category) {
  if (!category || category === "all") return state.services;
  return state.services.filter((s) => s.category === category);
}

// ─── Order Management ────────────────────────────────────────────
function createOrder(serviceId, buyerAddress) {
  const service = getServiceById(serviceId);
  if (!service) return null;
  const order = {
    id: `ord_${Date.now()}`,
    serviceId: service.id,
    buyerAddress,
    sellerAddress: service.sellerAddress,
    serviceTitle: service.title,
    totalAmount: service.priceUSDC,
    status: "active",
    milestoneStatuses: service.milestones.map((_, i) => ({ index: i, status: "funded", fundedAt: new Date().toISOString(), deliveredAt: null, releasedAt: null })),
    createdAt: new Date().toISOString(),
  };
  state.orders.push(order);
  service.orderCount += 1;
  saveState();
  return order;
}

function deliverMilestone(orderId, milestoneIndex) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return false;
  const ms = order.milestoneStatuses[milestoneIndex];
  if (!ms || ms.status !== "funded") return false;
  ms.status = "delivered";
  ms.deliveredAt = new Date().toISOString();
  saveState();
  return true;
}

function releaseMilestone(orderId, milestoneIndex) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return false;
  const ms = order.milestoneStatuses[milestoneIndex];
  if (!ms || ms.status !== "delivered") return false;
  ms.status = "released";
  ms.releasedAt = new Date().toISOString();
  if (order.milestoneStatuses.every((m) => m.status === "released")) order.status = "completed";
  saveState();
  return true;
}

function disputeMilestone(orderId, milestoneIndex) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return false;
  const ms = order.milestoneStatuses[milestoneIndex];
  if (!ms || ms.status !== "delivered") return false;
  ms.status = "disputed";
  order.status = "disputed";
  saveState();
  return true;
}

function getMilestoneAmount(order, milestoneIndex) {
  const service = getServiceById(order.serviceId);
  if (!service) return 0;
  const milestone = service.milestones[milestoneIndex];
  if (!milestone) return 0;
  return Math.round(order.totalAmount * (milestone.percent / 100));
}

function getPlatformFee(amount) { return Math.round(amount * (PAYMENT_RAIL.platformFeePercent / 100)); }
function getSellerReceives(amount) { return amount - getPlatformFee(amount); }

// ─── Buy Service (Contract) ──────────────────────────────────────
async function buyService(serviceId) {
  const service = getServiceById(serviceId);
  if (!service) throw new Error("Service not found.");

  const buyerAddress = await connectWallet();
  await ensureBaseSepolia();

  const contract = await getEscrowContract();
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // 1. Approve USDC
  const usdcContract = new ethers.Contract(
    PAYMENT_RAIL.token.address,
    ["function approve(address spender, uint256 amount) external returns (bool)"],
    signer
  );
  const amount = ethers.parseUnits(service.priceUSDC.toString(), 6);
  const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, amount);
  await approveTx.wait();

  // 2. Create order on contract
  const milestonePercents = service.milestones.map(m => m.percent * 100); // basis points
  const createTx = await contract.createOrder(service.sellerAddress, amount, milestonePercents);
  const receipt = await createTx.wait();

  // 3. Get orderId from event
  let orderId = 0;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed.name === "OrderCreated") {
        orderId = Number(parsed.args.orderId);
        break;
      }
    } catch {}
  }

  // 4. Save order to localStorage
  const order = {
    id: `ord_${Date.now()}`,
    serviceId: service.id,
    buyerAddress,
    sellerAddress: service.sellerAddress,
    serviceTitle: service.title,
    totalAmount: service.priceUSDC,
    contractOrderId: orderId,
    txHash: createTx.hash,
    status: "active",
    milestoneStatuses: service.milestones.map((_, i) => ({
      index: i,
      status: "funded",
      fundedAt: new Date().toISOString(),
      deliveredAt: null,
      releasedAt: null,
    })),
    createdAt: new Date().toISOString(),
  };

  state.orders.push(order);
  service.orderCount += 1;
  saveState();
  return order;
}

// ─── Contract Milestone Functions ─────────────────────────────────
async function deliverMilestoneFromContract(orderId, milestoneIndex) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) throw new Error("Order not found.");
  if (order.contractOrderId == null) {
    // Fallback to local-only if no contract order
    return deliverMilestone(orderId, milestoneIndex);
  }

  const contract = await getEscrowContract();
  const tx = await contract.deliverMilestone(order.contractOrderId, milestoneIndex);
  await tx.wait();

  const ms = order.milestoneStatuses[milestoneIndex];
  ms.status = "delivered";
  ms.deliveredAt = new Date().toISOString();
  saveState();
  return true;
}

async function releaseMilestoneFromContract(orderId, milestoneIndex) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) throw new Error("Order not found.");
  if (order.contractOrderId == null) {
    return releaseMilestone(orderId, milestoneIndex);
  }

  const contract = await getEscrowContract();
  const tx = await contract.releaseMilestone(order.contractOrderId, milestoneIndex);
  await tx.wait();

  const ms = order.milestoneStatuses[milestoneIndex];
  ms.status = "released";
  ms.releasedAt = new Date().toISOString();
  if (order.milestoneStatuses.every(m => m.status === "released")) {
    order.status = "completed";
  }
  saveState();
  return true;
}

async function autoReleaseMilestoneFromContract(orderId, milestoneIndex) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) throw new Error("Order not found.");
  if (order.contractOrderId == null) throw new Error("No contract order");

  const contract = await getEscrowContract();
  const tx = await contract.autoReleaseMilestone(order.contractOrderId, milestoneIndex);
  await tx.wait();

  const ms = order.milestoneStatuses[milestoneIndex];
  ms.status = "released";
  ms.releasedAt = new Date().toISOString();
  if (order.milestoneStatuses.every(m => m.status === "released")) {
    order.status = "completed";
  }
  saveState();
  return true;
}

// ─── Event Listening ──────────────────────────────────────────────
let eventListenersSetup = false;

async function setupEventListeners() {
  if (eventListenersSetup || CONTRACT_ADDRESS === "DEPLOYED_CONTRACT_ADDRESS") return;
  try {
    const contract = await getEscrowContract();
    contract.on("MilestoneReleased", (orderId, msIndex, buyer, amount, timestamp) => {
      showToast(`Milestone ${msIndex} released: ${ethers.formatUnits(amount, 6)} USDC`);
      render();
    });
    contract.on("MilestoneAutoReleased", (orderId, msIndex, amount) => {
      showToast(`Milestone ${msIndex} auto-released (timeout)`);
      render();
    });
    contract.on("MilestoneResolved", (orderId, msIndex, recipient, recipientAmt, otherAmt) => {
      showToast(`Dispute resolved for milestone ${msIndex}`);
      render();
    });
    contract.on("MilestoneTimeoutRefund", (orderId, msIndex, refundAmt) => {
      showToast(`Timeout refund: ${ethers.formatUnits(refundAmt, 6)} USDC`);
      render();
    });
    eventListenersSetup = true;
  } catch {}
}

// ─── Template Rendering ──────────────────────────────────────────
function renderTemplate(templateId) {
  const template = document.getElementById(templateId);
  app.innerHTML = "";
  app.appendChild(template.content.cloneNode(true));
}

// ─── Router ──────────────────────────────────────────────────────
function render() {
  const hash = window.location.hash || "#landing";
  const [route, queryString] = hash.split("?");
  const query = new URLSearchParams(queryString || "");

  switch (route) {
    case "#browse": renderTemplate("browse-template"); renderBrowse(query); break;
    case "#service": renderTemplate("service-template"); renderServiceDetail(query); break;
    case "#create": renderTemplate("create-template"); renderCreateService(); break;
    case "#orders": renderTemplate("orders-template"); renderMyOrders(); break;
    case "#sales": renderTemplate("sales-template"); renderMySales(); break;
    case "#profile": renderTemplate("profile-template"); renderProfile(query); break;
    default: renderTemplate("landing-template"); renderLanding(); break;
  }

  document.querySelectorAll(".nav a").forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === route);
  });
  document.querySelectorAll("[data-route-link]").forEach((link) => {
    const r = link.getAttribute("data-route-link");
    if (r) link.href = buildRouteUrl(r);
  });

  // Update language button
  const langBtn = document.getElementById("lang-btn");
  if (langBtn) langBtn.textContent = currentLang === "en" ? "中文" : "EN";
}

// ─── Page: Landing ───────────────────────────────────────────────
function renderLanding() {
  // Update hero title with gradient-text highlights
  const heroTitle = document.querySelector(".hero h1");
  if (heroTitle) {
    heroTitle.innerHTML = `使用 <span class="hl">${t("hero_title_2")}</span> 进行安全交易<br><span class="hl" id="hero-word-rotate"></span> 托管资金`;
  }
  const heroText = document.querySelector(".hero-text");
  if (heroText) heroText.textContent = t("hero_text");

  // Initialize animations after DOM is ready
  requestAnimationFrame(() => initAnimations());

  // Update How it works
  const articles = document.querySelectorAll(".how-it-works-grid article");
  if (articles.length >= 3) {
    articles[0].querySelector("strong").textContent = t("step1_title");
    articles[0].querySelector("p").textContent = t("step1_desc");
    articles[1].querySelector("strong").textContent = t("step2_title");
    articles[1].querySelector("p").textContent = t("step2_desc");
    articles[2].querySelector("strong").textContent = t("step3_title");
    articles[2].querySelector("p").textContent = t("step3_desc");
  }

  // Update CTA buttons
  const ctaBtns = document.querySelectorAll(".hero-actions .button");
  if (ctaBtns.length >= 2) {
    ctaBtns[0].textContent = t("cta_browse");
    ctaBtns[1].textContent = t("cta_sell");
  }

  // Update fee callout
  const callout = document.querySelector(".hero-callout");
  if (callout) {
    const label = callout.querySelector(".card-label");
    const desc = callout.querySelector("p:last-child");
    if (label) label.textContent = t("fee_label");
    if (desc) desc.textContent = t("fee_desc");
  }
}

// ─── Page: Browse ────────────────────────────────────────────────
function renderBrowse(query) {
  const category = query.get("category") || "all";
  const services = getServicesByCategory(category);
  const grid = document.getElementById("service-grid");
  if (!grid) return;

  document.querySelectorAll(".category-btn").forEach((btn) => {
    const cat = btn.dataset.category;
    btn.classList.toggle("is-active", cat === category);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.hash = cat === "all" ? "#browse" : `#browse?category=${cat}`;
    });
  });

  if (services.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>${t("no_orders")}</p></div>`;
    return;
  }

  grid.innerHTML = services.map((service) => {
    const cat = CATEGORIES[service.category] || CATEGORIES.other;
    const milestonesPreview = service.milestones.slice(0, 2).map((m) => `<span class="milestone-chip">${m.name}</span>`).join("");
    return `
      <a class="service-card" href="#service?id=${service.id}">
        <div class="service-card-head">
          <h3>${service.title}</h3>
          <span class="service-price">${formatCurrency(service.priceUSDC)}</span>
        </div>
        <div class="service-meta">
          <span>${cat.icon} ${cat.label}</span>
          <span>${shortAddress(service.sellerAddress)}</span>
          <span>${service.orderCount} ${t("orders_count")}</span>
        </div>
        <p class="service-description">${service.description}</p>
        <div class="milestone-preview">${milestonesPreview}</div>
      </a>`;
  }).join("");
}

// ─── Page: Service Detail ────────────────────────────────────────
function renderServiceDetail(query) {
  const serviceId = query.get("id");
  const service = getServiceById(serviceId);
  const container = document.getElementById("service-detail-content");
  if (!container) return;

  if (!service) {
    container.innerHTML = `<div class="empty-state"><p>Service not found.</p></div>`;
    return;
  }

  const cat = CATEGORIES[service.category] || CATEGORIES.other;
  const milestoneList = service.milestones.map((m, i) => `
    <div class="milestone-item">
      <div class="milestone-step is-pending">${i + 1}</div>
      <div class="milestone-content">
        <strong>${m.name}</strong>
        <p>${m.description}</p>
      </div>
      <span class="milestone-percent">${m.percent}%</span>
    </div>`).join("");

  const fee = getPlatformFee(service.priceUSDC);
  const sellerReceives = getSellerReceives(service.priceUSDC);

  container.innerHTML = `
    <div class="service-detail-grid">
      <div class="service-detail-main">
        <div class="panel">
          <p class="card-label">${cat.icon} ${cat.label}</p>
          <h2>${service.title}</h2>
          <p style="margin-top:12px;line-height:1.7;color:var(--text-secondary);">${service.description}</p>
        </div>
        <div class="panel">
          <p class="card-label">${t("milestones")}</p>
          <h2>${t("delivery_steps")}</h2>
          <div class="milestone-list" style="margin-top:16px;">${milestoneList}</div>
        </div>
      </div>
      <div class="service-detail-sidebar">
        <div class="panel">
          <p class="card-label">${t("price_label")}</p>
          <h2 style="font-size:2rem;margin:8px 0;">${formatCurrency(service.priceUSDC)}</h2>
          <div style="margin:16px 0;font-size:0.85rem;color:var(--text-secondary);">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span>${t("platform_fee")}</span><span>${formatCurrency(fee)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span>${t("seller_receives")}</span><span>${formatCurrency(sellerReceives)}</span>
            </div>
          </div>
          <button class="button button-primary" style="width:100%;margin-top:12px;" id="buy-btn">${t("buy_service")}</button>
          <p style="margin-top:12px;font-size:0.75rem;color:var(--text-muted);text-align:center;">${t("funds_locked")}</p>
        </div>
        <div class="panel">
          <p class="card-label">${t("seller")}</p>
          <div style="margin-top:8px;font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);word-break:break-all;">${service.sellerAddress}</div>
          <div style="margin-top:12px;font-size:0.85rem;color:var(--text-muted);">${service.orderCount} ${t("orders_count")}</div>
        </div>
      </div>
    </div>`;

  const buyBtn = document.getElementById("buy-btn");
  if (buyBtn) {
    buyBtn.addEventListener("click", async () => {
      buyBtn.disabled = true;
      buyBtn.textContent = "Processing...";
      try {
        await buyService(service.id);
        showToast(t("toast_purchased"));
        window.location.hash = "#orders";
      } catch (err) {
        showToast(err.message || "Payment failed.");
        buyBtn.disabled = false;
        buyBtn.textContent = t("buy_service");
      }
    });
  }
}

// ─── Page: Create Service ────────────────────────────────────────
function renderCreateService() {
  const form = document.getElementById("create-service-form");
  const milestoneContainer = document.getElementById("milestone-form-list");
  const addMilestoneBtn = document.getElementById("add-milestone-btn");
  const percentDisplay = document.getElementById("milestone-total-percent");
  if (!form) return;

  let milestoneCount = 0;

  function addMilestone(name = "", percent = "", description = "") {
    milestoneCount++;
    const id = milestoneCount;
    const item = document.createElement("div");
    item.className = "milestone-form-item";
    item.dataset.id = id;
    item.innerHTML = `
      <label>${t("ms_name")}<input name="ms_name_${id}" placeholder="e.g. Design Review" value="${name}" required /></label>
      <label>${t("ms_percent")}<input name="ms_percent_${id}" type="number" min="1" max="100" placeholder="30" value="${percent}" required /></label>
      <div>
        <label>${t("ms_desc")}<input name="ms_desc_${id}" placeholder="What this step includes" value="${description}" /></label>
        <button type="button" class="remove-milestone" style="margin-top:8px;">Remove</button>
      </div>`;
    item.querySelector(".remove-milestone").addEventListener("click", () => { item.remove(); updatePercentTotal(); });
    item.querySelectorAll("input").forEach((inp) => inp.addEventListener("input", updatePercentTotal));
    milestoneContainer.appendChild(item);
    updatePercentTotal();
  }

  function updatePercentTotal() {
    let total = 0;
    milestoneContainer.querySelectorAll("[name^='ms_percent_']").forEach((inp) => { total += Number(inp.value) || 0; });
    if (percentDisplay) {
      percentDisplay.textContent = `${total}%`;
      percentDisplay.style.color = total === 100 ? "var(--success)" : total > 100 ? "var(--danger)" : "inherit";
    }
  }

  addMilestoneBtn.addEventListener("click", () => addMilestone());
  addMilestone("Brief & Concepts", "30", "Initial concepts based on your brief.");
  addMilestone("Final Delivery", "70", "Final deliverables.");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const category = formData.get("category");
    const priceUSDC = Number(formData.get("price")) || 0;

    if (!title) { showToast("Enter a service title."); return; }
    if (!description) { showToast("Enter a service description."); return; }
    if (priceUSDC <= 0) { showToast("Set a price greater than 0."); return; }

    const milestones = [];
    let totalPercent = 0;
    milestoneContainer.querySelectorAll(".milestone-form-item").forEach((item) => {
      const id = item.dataset.id;
      const name = String(formData.get(`ms_name_${id}`) || "").trim();
      const percent = Number(formData.get(`ms_percent_${id}`)) || 0;
      const desc = String(formData.get(`ms_desc_${id}`) || "").trim();
      if (name && percent > 0) { milestones.push({ name, percent, description: desc }); totalPercent += percent; }
    });

    if (milestones.length === 0) { showToast("Add at least one milestone."); return; }
    if (totalPercent !== 100) { showToast(`Milestone percentages must sum to 100 (currently ${totalPercent}).`); return; }

    connectWallet().then((addr) => {
      const service = {
        id: `svc_${Date.now()}`, sellerAddress: addr, title, description,
        category: category || "other", priceUSDC, milestones, examples: [],
        createdAt: new Date().toISOString(), orderCount: 0,
      };
      state.services.unshift(service);
      saveState();
      showToast(t("toast_published"));
      window.location.hash = `#service?id=${service.id}`;
    }).catch(() => showToast(t("toast_wallet_error")));
  });
}

// ─── Page: My Orders (Buyer) ────────────────────────────────────
function renderMyOrders() {
  const container = document.getElementById("orders-content");
  if (!container) return;

  const address = walletState.address;
  if (!address) {
    container.innerHTML = `
      <div class="panel empty-state">
        <p class="card-label">${t("wallet_required")}</p>
        <h2>${t("connect_wallet")}</h2>
        <button class="button button-primary" style="margin-top:16px;" id="connect-wallet-btn">${t("connect_btn")}</button>
      </div>`;
    document.getElementById("connect-wallet-btn")?.addEventListener("click", async () => {
      try { await connectWallet(); renderMyOrders(); } catch (err) { showToast(err.message); }
    });
    return;
  }

  const orders = getOrdersByBuyer(address);
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="panel empty-state">
        <p class="card-label">${t("no_orders")}</p>
        <h2>${t("no_orders_desc")}</h2>
        <a class="button button-primary" style="margin-top:16px;" href="#browse">${t("cta_browse")}</a>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="order-list">${orders.map((o) => renderOrderCard(o, "buyer")).join("")}</div>`;
  bindOrderActions(container, "buyer");
}

// ─── Page: My Sales (Seller) ─────────────────────────────────────
function renderMySales() {
  const container = document.getElementById("sales-content");
  if (!container) return;

  const address = walletState.address;
  if (!address) {
    container.innerHTML = `
      <div class="panel empty-state">
        <p class="card-label">${t("wallet_required")}</p>
        <h2>${t("connect_wallet_sales")}</h2>
        <button class="button button-primary" style="margin-top:16px;" id="connect-wallet-btn">${t("connect_btn")}</button>
      </div>`;
    document.getElementById("connect-wallet-btn")?.addEventListener("click", async () => {
      try { await connectWallet(); renderMySales(); } catch (err) { showToast(err.message); }
    });
    return;
  }

  const orders = getOrdersBySeller(address);
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="panel empty-state">
        <p class="card-label">${t("no_sales")}</p>
        <h2>${t("no_sales_desc")}</h2>
        <a class="button button-primary" style="margin-top:16px;" href="#create">${t("cta_sell")}</a>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="order-list">${orders.map((o) => renderOrderCard(o, "seller")).join("")}</div>`;
  bindOrderActions(container, "seller");
}

// ─── Shared: Order Card ──────────────────────────────────────────
function renderOrderCard(order, role) {
  const service = getServiceById(order.serviceId);
  const milestones = service ? service.milestones : [];
  const progressSteps = order.milestoneStatuses.map((ms) => `<div class="order-progress-step is-${ms.status}"></div>`).join("");
  const milestoneDetails = order.milestoneStatuses.map((ms, i) => {
    const msDef = milestones[i];
    const amount = getMilestoneAmount(order, i);
    return `
      <div class="milestone-item">
        <div class="milestone-step is-${ms.status}">${i + 1}</div>
        <div class="milestone-content">
          <strong>${msDef ? msDef.name : `Step ${i + 1}`}</strong>
          <span style="font-size:0.8rem;color:var(--text-muted);">${formatCurrency(amount)} — ${ms.status}</span>
        </div>
      </div>`;
  }).join("");

  let actions = "";
  if (role === "buyer") {
    order.milestoneStatuses.forEach((ms, i) => {
      if (ms.status === "delivered") {
        actions += `<button class="button button-primary action-confirm" data-order="${order.id}" data-ms="${i}" style="font-size:0.8rem;padding:8px 16px;">${t("confirm_release")}</button>
        <button class="button button-secondary action-dispute" data-order="${order.id}" data-ms="${i}" style="font-size:0.8rem;padding:8px 16px;">${t("dispute")}</button>`;
      }
    });
    if (order.status === "completed") actions = `<span style="color:var(--success);font-weight:700;">✓ ${t("completed")}</span>`;
  } else {
    order.milestoneStatuses.forEach((ms, i) => {
      if (ms.status === "funded") {
        actions += `<button class="button button-primary action-deliver" data-order="${order.id}" data-ms="${i}" style="font-size:0.8rem;padding:8px 16px;">${t("mark_delivered")}</button>`;
      }
      if (ms.status === "delivered") {
        // Show auto-release if deliveredAt + 14 days has passed
        const deliveredAt = ms.deliveredAt ? new Date(ms.deliveredAt).getTime() : 0;
        const now = Date.now();
        const daysSince = (now - deliveredAt) / (1000 * 60 * 60 * 24);
        if (daysSince >= 14) {
          actions += `<button class="button button-secondary action-auto-release" data-order="${order.id}" data-ms="${i}" style="font-size:0.8rem;padding:8px 16px;">Auto Release</button>`;
        } else {
          actions += `<span style="font-size:0.75rem;color:var(--text-muted);">Buyer confirm needed (${Math.ceil(14 - daysSince)}d left)</span>`;
        }
      }
    });
    if (order.status === "completed") actions = `<span style="color:var(--success);font-weight:700;">✓ ${t("completed")}</span>`;
  }

  return `
    <div class="order-card panel">
      <div class="order-head">
        <div>
          <p class="card-label">${order.serviceTitle}</p>
          <h3 style="margin:4px 0;">${formatCurrency(order.totalAmount)}</h3>
        </div>
        <span class="status-chip" data-status="${order.status}">${order.status}</span>
      </div>
      <div class="order-progress">${progressSteps}</div>
      <div class="milestone-list">${milestoneDetails}</div>
      <div class="order-actions">${actions}</div>
    </div>`;
}

function bindOrderActions(container, role) {
  container.querySelectorAll(".action-confirm").forEach((btn) => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "...";
      try {
        await releaseMilestoneFromContract(btn.dataset.order, Number(btn.dataset.ms));
        showToast(t("toast_released"));
        render();
      } catch (err) {
        showToast(err.message || "Failed");
        btn.disabled = false;
        btn.textContent = t("confirm_release");
      }
    });
  });
  container.querySelectorAll(".action-dispute").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (disputeMilestone(btn.dataset.order, Number(btn.dataset.ms))) {
        showToast(t("toast_disputed"));
        render();
      }
    });
  });
  container.querySelectorAll(".action-deliver").forEach((btn) => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "...";
      try {
        await deliverMilestoneFromContract(btn.dataset.order, Number(btn.dataset.ms));
        showToast(t("toast_delivered"));
        render();
      } catch (err) {
        showToast(err.message || "Failed");
        btn.disabled = false;
        btn.textContent = t("mark_delivered");
      }
    });
  });
  container.querySelectorAll(".action-auto-release").forEach((btn) => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "...";
      try {
        await autoReleaseMilestoneFromContract(btn.dataset.order, Number(btn.dataset.ms));
        showToast("Auto-released (timeout)");
        render();
      } catch (err) {
        showToast(err.message || "Failed");
        btn.disabled = false;
        btn.textContent = "Auto Release";
      }
    });
  });
}

// ─── Page: Profile ───────────────────────────────────────────────
function renderProfile(query) {
  const container = document.getElementById("profile-content");
  if (!container) return;

  const address = walletState.address;
  const displayAddress = query.get("address") || address;

  if (!displayAddress) {
    container.innerHTML = `
      <div class="panel empty-state">
        <p class="card-label">${t("wallet_required")}</p>
        <h2>${t("connect_wallet_profile")}</h2>
        <button class="button button-primary" style="margin-top:16px;" id="connect-wallet-btn">${t("connect_btn")}</button>
      </div>`;
    document.getElementById("connect-wallet-btn")?.addEventListener("click", async () => {
      try { await connectWallet(); renderProfile(new URLSearchParams("")); } catch (err) { showToast(err.message); }
    });
    return;
  }

  const sellerServices = getServicesBySeller(displayAddress);
  const buyerOrders = getOrdersByBuyer(displayAddress);
  const sellerOrders = getOrdersBySeller(displayAddress);

  const servicesHtml = sellerServices.length
    ? sellerServices.map((s) => `<a class="service-card" href="#service?id=${s.id}" style="display:block;"><h3>${s.title}</h3><div class="service-meta"><span>${formatCurrency(s.priceUSDC)}</span><span>${s.orderCount} ${t("orders_count")}</span></div></a>`).join("")
    : `<p style="color:var(--text-muted);">${t("no_services")}</p>`;

  container.innerHTML = `
    <div class="profile-header">
      <div class="brand-mark" style="width:56px;height:56px;font-size:1.2rem;">${shortAddress(displayAddress).slice(0, 2)}</div>
      <div>
        <p class="card-label">${t("profile_title")}</p>
        <div class="profile-address">${displayAddress}</div>
      </div>
    </div>
    <div class="profile-stats">
      <div class="profile-stat panel"><p class="card-label">${t("services")}</p><h3>${sellerServices.length}</h3></div>
      <div class="profile-stat panel"><p class="card-label">${t("as_buyer")}</p><h3>${buyerOrders.length}</h3></div>
      <div class="profile-stat panel"><p class="card-label">${t("as_seller")}</p><h3>${sellerOrders.length}</h3></div>
      <div class="profile-stat panel"><p class="card-label">${t("completed")}</p><h3>${[...buyerOrders, ...sellerOrders].filter((o) => o.status === "completed").length}</h3></div>
    </div>
    <div style="margin-top:24px;">
      <p class="card-label" style="margin-bottom:12px;">${t("listed_services")}</p>
      <div class="service-grid">${servicesHtml}</div>
    </div>`;
}

// ─── Animations ───────────────────────────────────────────────────
let scrollObserver = null;
let wordRotateInterval = null;

function initAnimations() {
  // Scroll-triggered animations
  if (scrollObserver) scrollObserver.disconnect();
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".animate-on-scroll, .animate-stagger").forEach((el) => {
    scrollObserver.observe(el);
  });

  // Word rotation
  if (wordRotateInterval) clearInterval(wordRotateInterval);
  const wordRotateEl = document.getElementById("hero-word-rotate");
  if (wordRotateEl) {
    const words = ["即时释放", "安全托管", "闪电结算", "零信任"];
    let wordIndex = 0;
    wordRotateEl.textContent = words[0];
    wordRotateEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";

    wordRotateInterval = setInterval(() => {
      wordRotateEl.style.opacity = "0";
      wordRotateEl.style.transform = "translateY(-8px)";
      setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        wordRotateEl.textContent = words[wordIndex];
        wordRotateEl.style.transform = "translateY(8px)";
        requestAnimationFrame(() => {
          wordRotateEl.style.opacity = "1";
          wordRotateEl.style.transform = "translateY(0)";
        });
      }, 300);
    }, 2500);
  }

  // Stats marquee
  const marqueeEl = document.getElementById("stats-marquee");
  if (marqueeEl) {
    const stats = [
      { value: "2% 手续费", label: "行业最低", company: "FEE" },
      { value: "14 天", label: "自动释放", company: "PROTECTION" },
      { value: "30 天", label: "争议超时", company: "SECURITY" },
      { value: "1 USDC", label: "最低订单", company: "MINIMUM" },
      { value: "Base", label: "超低 Gas", company: "NETWORK" },
    ];
    // Duplicate for seamless loop
    const html = [...stats, ...stats].map(s => `
      <div style="display:inline-flex;align-items:baseline;gap:16px;">
        <span style="font-size:2rem;font-weight:800;background:linear-gradient(135deg,var(--gradient-start),var(--gradient-end));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${s.value}</span>
        <span style="font-size:0.85rem;color:var(--muted-foreground);">
          ${s.label}
          <span style="display:block;font-size:0.7rem;font-family:var(--font-mono);margin-top:2px;opacity:0.6;">${s.company}</span>
        </span>
      </div>
    `).join("");
    marqueeEl.innerHTML = html;
  }
}

// ─── Init ────────────────────────────────────────────────────────
window.addEventListener("hashchange", render);
setupEventListeners();
render();
