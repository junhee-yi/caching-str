import { AppShell } from "@/components/AppShell";
import type { ServiceType } from "@/lib/types";
import { ServicePage } from "@/screens/ServicePage";

export default async function ServiceRoute({
  params,
}: {
  params: Promise<{ serviceId: ServiceType }>;
}) {
  const { serviceId } = await params;

  return (
    <AppShell>
      <ServicePage serviceId={serviceId} />
    </AppShell>
  );
}
