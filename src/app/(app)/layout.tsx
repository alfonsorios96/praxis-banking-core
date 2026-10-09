import { redirect } from "next/navigation";
import { verifySession } from "@/auth/dal";
import { platformDisplayName } from "@/db/directory";
import { DEFAULT_DISPLAY_NAME } from "@/db/models/platform-settings";
import { releaseOfferFor } from "@/releases/offer";
import { BottomNav } from "@/ui/bottom-nav";
import { PhoneFrame } from "@/ui/phone-frame";
import { ReleaseOffer } from "@/ui/release-offer";
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

  let displayName = DEFAULT_DISPLAY_NAME;
  let offer: string | null = null;
  try {
    displayName = await platformDisplayName();
  } catch (error) {
    console.error(error);
  }
  try {
    offer = await releaseOfferFor(session);
  } catch (error) {
    console.error(error);
  }

  return (
    <PhoneFrame
      header={
        <AppHeader
          username={session.username}
          role={session.role}
          displayName={displayName}
        />
      }
      footer={<BottomNav role={session.role} />}
    >
      {offer ? <ReleaseOffer buildId={offer} /> : null}
      {children}
    </PhoneFrame>
  );
}
