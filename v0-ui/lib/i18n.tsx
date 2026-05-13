"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ═══════════════════════════════════════════════════════════
// Translations — Copied from openclaw app.js LANG object
// ═══════════════════════════════════════════════════════════

const translations = {
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
    services: "Services",
    as_buyer: "As Buyer",
    as_seller: "As Seller",
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
    services: "服务",
    as_buyer: "作为买家",
    as_seller: "作为卖家",
    no_services: "暂无上架服务。",
    toast_purchased: "服务已购买！订单已创建。",
    toast_delivered: "里程碑已标记为已交付。",
    toast_released: "里程碑已释放！",
    toast_disputed: "里程碑已争议。",
    toast_published: "服务已发布！",
    toast_connect: "请先连接钱包。",
    toast_wallet_error: "请先连接钱包再发布。",
  },
} as const;

type Lang = "en" | "zh";
type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("stableflow-lang") as Lang) || "en";
    }
    return "en";
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("stableflow-lang", newLang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[lang][key] || translations.en[key] || key;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  return useContext(I18nContext);
}
