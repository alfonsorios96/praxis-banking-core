import { redirect } from "next/navigation";
import { ROLE_CUENTAHABIENTE } from "@/auth/constants";
import { verifySession } from "@/auth/dal";
import { disabledModulePaths, MODULE_KEYS, MODULE_PATH } from "@/modules/keys";
import { readModuleState } from "@/modules/store";
import { platformDisplayName } from "@/db/directory";
import { DEFAULT_DISPLAY_NAME } from "@/db/models/platform-settings";
import { currentBuildId } from "@/releases/build-id";
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
  let hidden: string[] = [];
  if (session.role === ROLE_CUENTAHABIENTE) {
    try {
      hidden = disabledModulePaths(await readModuleState(session.userId));
    } catch (error) {
      console.error(error);
      hidden = MODULE_KEYS.map((key) => MODULE_PATH[key]);
    }
  }

  return (
    <PhoneFrame
      header={
        <AppHeader
          username={session.username}
          role={session.role}
          displayName={displayName}
          version={currentBuildId()}
        />
      }
      footer={<BottomNav role={session.role} hidden={hidden} />}
    >
      {offer ? <ReleaseOffer buildId={offer} /> : null}
      {children}
    </PhoneFrame>
  );
}
