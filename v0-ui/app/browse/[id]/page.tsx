import ServiceDetail from "./service-detail";

export function generateStaticParams() {
  return [
    { id: "svc_001" },
    { id: "svc_002" },
    { id: "svc_003" },
  ];
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ServiceDetail id={id} />;
}
