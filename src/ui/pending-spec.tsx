export function PendingSpec({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h1 className="screen-title">{title}</h1>
      <p className="text-base leading-6 text-muted">{body}</p>
    </section>
  );
}
