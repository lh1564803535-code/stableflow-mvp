// ═══════════════════════════════════════════════════════════
// StableFlow Contract Configuration — V4
// ═══════════════════════════════════════════════════════════

import StableFlowEscrowABI from "./abi/StableFlowEscrow.json";

export const ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`;

export const ESCROW_ABI = StableFlowEscrowABI;

export const USDC_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

// Milestone status enum mapping
export const MILESTONE_STATUS = {
  0: { label: "None", color: "text-gray-500", bg: "bg-gray-500/10" },
  1: { label: "Funded", color: "text-blue-400", bg: "bg-blue-500/10" },
  2: { label: "Delivered", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  3: { label: "Released", color: "text-green-400", bg: "bg-green-500/10" },
  4: { label: "Disputed", color: "text-red-400", bg: "bg-red-500/10" },
  5: { label: "Pending Resolution", color: "text-purple-400", bg: "bg-purple-500/10" },
} as const;

export function shortAddress(address: string): string {
  if (!address) return "Not connected";
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ─── Browse/seeded data (temporary until we have a real marketplace) ───

export const CATEGORIES: Record<string, { label: string; labelZh: string; icon: string }> = {
  design: { label: "Design", labelZh: "设计", icon: "🎨" },
  development: { label: "Development", labelZh: "开发", icon: "💻" },
  writing: { label: "Writing", labelZh: "写作", icon: "✍️" },
  video: { label: "Video", labelZh: "视频", icon: "🎬" },
  translation: { label: "Translation", labelZh: "翻译", icon: "🌐" },
  other: { label: "Other", labelZh: "其他", icon: "📦" },
};

export interface Milestone {
  name: string;
  percent: number;
  description: string;
}

export interface Service {
  id: string;
  sellerAddress: string;
  title: string;
  description: string;
  category: string;
  priceUSDC: number;
  milestones: Milestone[];
  orderCount: number;
  createdAt: string;
}

export const SEEDED_SERVICES: Service[] = [
  {
    id: "svc_001",
    sellerAddress: "0xA4f0000000000000000000000000000000dE91",
    title: "Logo Design for Startups",
    description: "I will design a modern, memorable logo for your startup. Includes 3 initial concepts, unlimited revisions on your chosen concept, and final files in SVG, PNG, and PDF formats.",
    category: "design",
    priceUSDC: 500,
    milestones: [
      { name: "Brief & Concepts", percent: 30, description: "3 initial logo concepts based on your brand brief." },
      { name: "Revisions", percent: 40, description: "Up to 3 rounds of revisions on your chosen concept." },
      { name: "Final Delivery", percent: 30, description: "Final logo files in SVG, PNG, and PDF." },
    ],
    orderCount: 3,
    createdAt: "2026-04-28T10:00:00Z",
  },
  {
    id: "svc_002",
    sellerAddress: "0xDev10000000000000000000000000000009a31",
    title: "Landing Page Development",
    description: "I will build a responsive, fast-loading landing page with modern HTML/CSS/JS. Includes mobile optimization, SEO basics, and deployment.",
    category: "development",
    priceUSDC: 1200,
    milestones: [
      { name: "Design Review", percent: 20, description: "Wireframe and visual mockup for your approval." },
      { name: "Development", percent: 50, description: "Fully coded page with all sections, responsive and tested." },
      { name: "Deployment", percent: 30, description: "Deploy to your hosting, test all links and forms." },
    ],
    orderCount: 1,
    createdAt: "2026-04-29T14:00:00Z",
  },
  {
    id: "svc_003",
    sellerAddress: "0xMkT2000000000000000000000000000000ba82",
    title: "Blog Article Writing (1500 words)",
    description: "I will write a well-researched, SEO-friendly blog article on any tech/business topic. Includes keyword research, outline approval, and one round of revisions.",
    category: "writing",
    priceUSDC: 150,
    milestones: [
      { name: "Outline", percent: 30, description: "Detailed outline with key points for your approval." },
      { name: "First Draft", percent: 50, description: "Complete first draft, ready for your review." },
      { name: "Final Version", percent: 20, description: "Revised version based on your feedback." },
    ],
    orderCount: 5,
    createdAt: "2026-04-30T09:00:00Z",
  },
];
