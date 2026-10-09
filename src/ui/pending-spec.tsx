export function PendingSpec({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="font-display text-4xl tracking-tight text-ink">{title}</h1>
      <p className="text-base leading-7 text-muted">{body}</p>
      <div className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm leading-6 text-ink">
        <p>Esta capacidad espera una spec activa. Ábrela con:</p>
        <p className="mt-2 font-mono text-[0.85em] break-all">bun run sdd:new -- --id …</p>
      </div>
    </section>
  );
}
