export function PhoneFrame({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background md:flex md:items-center md:justify-center md:py-6">
      <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col bg-paper md:h-[min(52rem,calc(100dvh-3rem))] md:overflow-hidden md:rounded-[2rem] md:shadow-[0_24px_80px_rgba(20,36,33,0.16)]">
        {header}
        <main className="flex-1 overflow-y-auto px-5 py-6">{children}</main>
        {footer}
      </div>
    </div>
  );
}
