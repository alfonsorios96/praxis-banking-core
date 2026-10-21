import type { Metadata } from "next";
import { PhoneFrame } from "@/ui/phone-frame";
import { GuestEntry } from "./guest-entry";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <PhoneFrame>
      <section className="flex flex-col gap-8 pt-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-medium tracking-tight text-ink">Praxis</h1>
          <p className="text-base leading-6 text-muted">Entra con tu usuario.</p>
        </div>
        <div className="flex flex-col gap-4">
          <LoginForm from={from} />
          <GuestEntry />
        </div>
      </section>
    </PhoneFrame>
  );
}
