import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | SignalForge",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
