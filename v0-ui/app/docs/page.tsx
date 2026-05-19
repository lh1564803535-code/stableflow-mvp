"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ExternalLink } from "lucide-react";

const sections = [
  { id: "quick-start", title: "Quick Start" },
  { id: "for-buyers", title: "For Buyers" },
  { id: "for-sellers", title: "For Sellers" },
  { id: "smart-contract", title: "Smart Contract" },
  { id: "faq", title: "FAQ" },
];

export default function DocsPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0E1A] pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 lg:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            Navigation
          </button>

          {/* Sidebar / TOC */}
          <aside
            className={`${
              menuOpen ? "block" : "hidden"
            } mb-8 lg:sticky lg:top-24 lg:block lg:self-start`}
          >
            <nav className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="prose-invert max-w-none">
            <h1 className="mb-2 text-3xl font-bold text-white lg:text-4xl">
              StableFlow User Guide
            </h1>
            <p className="mb-12 text-gray-400">
              Everything you need to know to use StableFlow — the on-chain escrow platform for freelancers.
            </p>

            {/* Section 1: Quick Start */}
            <section id="quick-start" className="mb-16 scroll-mt-24">
              <h2 className="mb-6 text-2xl font-bold text-white">Quick Start（30 秒上手）</h2>
              <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
                <Step number={1} title="连接钱包">
                  点击右上角 &quot;Connect Wallet&quot;（支持 MetaMask 或其他钱包）
                </Step>
                <Step number={2} title="切换网络">
                  确保钱包切换到 Base Sepolia 网络（Chain ID: 84532）
                </Step>
                <Step number={3} title="准备 USDC">
                  确保钱包里有 USDC（测试网）
                </Step>
                <Step number={4} title="开始使用">
                  点 &quot;Browse&quot; 浏览服务，或点 &quot;Create&quot; 上架你的服务
                </Step>
              </div>
            </section>

            {/* Section 2: For Buyers */}
            <section id="for-buyers" className="mb-16 scroll-mt-24">
              <h2 className="mb-6 text-2xl font-bold text-white">For Buyers（买家指南）</h2>

              <h3 className="mb-4 text-lg font-semibold text-gray-200">如何购买服务</h3>
              <ol className="mb-8 list-inside space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0052FF]/20 text-xs font-bold text-[#0052FF]">1</span>
                  <span>点击 Browse 浏览可用服务</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0052FF]/20 text-xs font-bold text-[#0052FF]">2</span>
                  <span>选择一个服务，查看里程碑和价格</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0052FF]/20 text-xs font-bold text-[#0052FF]">3</span>
                  <span>点击 &quot;Purchase&quot;，MetaMask 会弹窗确认</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0052FF]/20 text-xs font-bold text-[#0052FF]">4</span>
                  <span>资金会锁进智能合约（Escrow）</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0052FF]/20 text-xs font-bold text-[#0052FF]">5</span>
                  <span>卖家交付每个里程碑后，你确认即可释放对应资金</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0052FF]/20 text-xs font-bold text-[#0052FF]">6</span>
                  <span>如果有问题，可以发起争议（Dispute）</span>
                </li>
              </ol>

              <h3 className="mb-4 text-lg font-semibold text-gray-200">关键规则</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0052FF]" />
                  资金锁在合约里，平台无法动用
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0052FF]" />
                  卖家 14 天不交付，你可以申请退款
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0052FF]" />
                  争议由仲裁员裁决，48 小时异议期
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0052FF]" />
                  30 天超时可申请退款
                </li>
              </ul>
            </section>

            {/* Section 3: For Sellers */}
            <section id="for-sellers" className="mb-16 scroll-mt-24">
              <h2 className="mb-6 text-2xl font-bold text-white">For Sellers（卖家指南）</h2>

              <h3 className="mb-4 text-lg font-semibold text-gray-200">如何上架服务</h3>
              <ol className="mb-8 list-inside space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">1</span>
                  <span>点击 Create 或访问 /create</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">2</span>
                  <span>填写：买家钱包地址、服务总价格（USDC）、里程碑名称和百分比</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">3</span>
                  <span>里程碑百分比之和必须等于 100%</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">4</span>
                  <span>确认后，买家的 USDC 会锁进合约</span>
                </li>
              </ol>

              <h3 className="mb-4 text-lg font-semibold text-gray-200">如何收款</h3>
              <ol className="mb-8 list-inside space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">1</span>
                  <span>完成一个里程碑后，在订单详情页点击 &quot;Mark as Delivered&quot;</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">2</span>
                  <span>买家确认后，对应百分比的资金自动释放到你的钱包</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">3</span>
                  <span>如果买家 14 天不确认，资金自动释放（Auto-Release）</span>
                </li>
              </ol>

              <h3 className="mb-4 text-lg font-semibold text-gray-200">关键规则</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                  你交付，买家确认，钱到账
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                  争议时，仲裁员会裁决
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                  90 天超时可以申请紧急退出（50/50 分割）
                </li>
              </ul>
            </section>

            {/* Section 4: Smart Contract */}
            <section id="smart-contract" className="mb-16 scroll-mt-24">
              <h2 className="mb-6 text-2xl font-bold text-white">Smart Contract（合约信息）</h2>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-white/5">
                    <TableRow label="网络" value="Base Sepolia（Chain ID: 84532）" />
                    <TableRow
                      label="合约地址"
                      value="0x6EdD143062Ae71D836B7584Ba73A99E8c49DBd8C"
                      mono
                    />
                    <TableRow
                      label="USDC 地址"
                      value="0x036CbD53842c5426634e7929541eC2318f3dCF7e"
                      mono
                    />
                    <TableRow label="平台手续费" value="2%（可配置，上限 10%）" />
                    <TableRow label="状态" value="已通过 75 个测试 + Slither 静态分析" />
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <a
                  href="https://sepolia.basescan.org/address/0x6EdD143062Ae71D836B7584Ba73A99E8c49DBd8C"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#0052FF] hover:underline"
                >
                  在区块浏览器查看 <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </section>

            {/* Section 5: FAQ */}
            <section id="faq" className="mb-16 scroll-mt-24">
              <h2 className="mb-6 text-2xl font-bold text-white">FAQ（常见问题）</h2>

              <div className="space-y-4">
                <FaqItem
                  q="我需要多少 Gas？"
                  a="部署订单大约需要 0.001-0.005 ETH（Base Sepolia 费用很低）"
                />
                <FaqItem
                  q="资金安全吗？"
                  a="资金锁在经过测试的智能合约里，平台无法动用。只有买家确认或超时才会释放。"
                />
                <FaqItem
                  q="争议怎么处理？"
                  a="任一方可以发起争议，仲裁员提议方案，48 小时异议期后执行。"
                />
                <FaqItem
                  q="支持哪些币？"
                  a="目前支持 USDC（Base Sepolia）。未来计划支持更多稳定币。"
                />
                <FaqItem
                  q="主网上线了吗？"
                  a="目前在测试网（Base Sepolia），主网计划中。"
                />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0052FF]/20 text-sm font-bold text-[#0052FF]">
        {number}
      </span>
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="mt-0.5 text-sm text-gray-400">{children}</p>
      </div>
    </div>
  );
}

function TableRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <tr>
      <td className="whitespace-nowrap px-4 py-3 text-gray-400">{label}</td>
      <td className={`px-4 py-3 text-white ${mono ? "font-mono text-xs break-all" : ""}`}>
        {value}
      </td>
    </tr>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="font-medium text-white">Q: {q}</p>
      <p className="mt-2 text-sm text-gray-400">A: {a}</p>
    </div>
  );
}
