import { SettingsPageContent } from "@/components/settings/SettingsPageContent";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const searchParams = await props.searchParams;
  return <SettingsPageContent searchParams={searchParams} />;
}
