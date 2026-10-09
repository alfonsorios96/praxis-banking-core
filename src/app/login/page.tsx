import type { Metadata } from "next";
import { PhoneFrame } from "@/ui/phone-frame";
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
        <div className="flex flex-col gap-3">
          <p className="font-display text-5xl tracking-tight text-ink">Praxis</p>
          <p className="max-w-xs text-base leading-7 text-muted">
            Core bancario. Entra con el usuario de acceso. No hay registro público.
          </p>
        </div>
        <LoginForm from={from} />
      </section>
    </PhoneFrame>
  );
}
