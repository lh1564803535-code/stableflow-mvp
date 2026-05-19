import OrderDetail from "./order-detail";

export function generateStaticParams() {
  // Pre-generate first 20 order pages for static export
  return Array.from({ length: 20 }, (_, i) => ({ id: String(i) }));
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}
