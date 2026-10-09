import { redirect } from "next/navigation";
import { verifySession } from "@/auth/dal";
import { BottomNav } from "@/ui/bottom-nav";
import { PhoneFrame } from "@/ui/phone-frame";
import { AppHeader } from "./app-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  return (
    <PhoneFrame header={<AppHeader username={session.username} />} footer={<BottomNav />}>
      {children}
    </PhoneFrame>
  );
}
