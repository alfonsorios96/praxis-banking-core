"use client";

import { Eye, EyeOff, Nfc, Snowflake } from "lucide-react";
import {
  useActionState,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { setCardFrozen, type CardFreezeState } from "@/app/actions/cards";
import type { OwnedCard } from "@/cards/types";

type Status = OwnedCard["status"];

const SLIDE_GAP_PX = 12;

const PLASTIC: Record<OwnedCard["kind"], string> = {
  checking: "bg-[linear-gradient(135deg,#2a63a8_0%,#1d4e89_45%,#0d2a4f_100%)]",
  savings: "bg-[linear-gradient(135deg,#4a5d72_0%,#2b3a4b_50%,#121a24_100%)]",
};

const DIGITAL_SURFACE = "bg-[linear-gradient(160deg,#2f7d82_0%,#1f5c63_100%)]";

const ENGRAVING =
  "bg-[repeating-radial-gradient(circle_at_115%_-20%,transparent_0,transparent_9px,rgba(255,255,255,0.07)_10px,transparent_11px)]";

function surfaceOf(card: OwnedCard): string {
  return card.medium === "digital" ? DIGITAL_SURFACE : PLASTIC[card.kind];
}

function titleOf(card: OwnedCard): string {
  return card.medium === "digital"
    ? `Digital ${card.accountLabel.toLowerCase()}`
    : `Débito ${card.accountLabel.toLowerCase()}`;
}

export function CardCarousel({ cards }: { cards: OwnedCard[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [seenCount, setSeenCount] = useState(cards.length);
  if (cards.length !== seenCount) {
    setSeenCount(cards.length);
    if (cards.length > seenCount) {
      setIndex(cards.length - 1);
    }
  }
  useEffect(() => {
    const first = scroller.current?.firstElementChild;
    if (first instanceof HTMLElement && index === cards.length - 1) {
      scroller.current?.scrollTo({
        left: index * (first.offsetWidth + SLIDE_GAP_PX),
        behavior: "smooth",
      });
    }
    // Only follow a newly added card; manual scrolling sets the index itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [statuses, setOptimisticStatus] = useOptimistic(
    Object.fromEntries(cards.map((card) => [card.id, card.status])) as Record<string, Status>,
    (current, change: { id: string; status: Status }) => ({ ...current, [change.id]: change.status }),
  );
  const [state, action, pending] = useActionState(
    async (previous: CardFreezeState | undefined, formData: FormData) => {
      const id = String(formData.get("cardId") ?? "");
      setOptimisticStatus({ id, status: formData.get("intent") === "freeze" ? "frozen" : "active" });
      return setCardFrozen(previous, formData);
    },
    undefined,
  );

  const selected = cards[Math.min(index, cards.length - 1)];
  if (!selected) {
    return (
      <p className="text-base leading-6 text-muted">
        Todavía no tienes tarjetas. Aparecen cuando se abren tus cuentas.
      </p>
    );
  }
  const selectedStatus = statuses[selected.id] ?? selected.status;
  const frozen = selectedStatus === "frozen";
  const showBack = revealed[selected.id] ?? false;

  function slideStep(): number {
    const first = scroller.current?.firstElementChild;
    return first instanceof HTMLElement ? first.offsetWidth + SLIDE_GAP_PX : 1;
  }

  function goTo(next: number) {
    const clamped = Math.max(0, Math.min(cards.length - 1, next));
    scroller.current?.scrollTo({ left: clamped * slideStep(), behavior: "smooth" });
    setIndex(clamped);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div
          ref={scroller}
          role="region"
          aria-roledescription="carrusel"
          aria-label="Tus tarjetas"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onScroll={(event) => {
            const next = Math.round(event.currentTarget.scrollLeft / slideStep());
            if (next !== index) {
              setIndex(Math.max(0, Math.min(cards.length - 1, next)));
            }
          }}
          className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-scrollbar]:hidden"
        >
          {cards.map((card, position) => (
            <div
              key={card.id}
              role="group"
              aria-roledescription="tarjeta"
              aria-label={`${position + 1} de ${cards.length}: ${titleOf(card).toLowerCase()}`}
              className="w-[88%] shrink-0 snap-start"
            >
              <Plastic
                card={card}
                frozen={(statuses[card.id] ?? card.status) === "frozen"}
                showBack={revealed[card.id] ?? false}
              />
            </div>
          ))}
        </div>

        {cards.length > 1 ? (
          <div className="flex justify-center gap-2">
            {cards.map((card, position) => (
              <button
                key={card.id}
                type="button"
                onClick={() => goTo(position)}
                aria-label={`Ver tarjeta ${titleOf(card).toLowerCase()} ${card.last4}`}
                aria-current={position === index}
                className="flex size-6 items-center justify-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    position === index ? "w-5 bg-accent" : "w-1.5 bg-line"
                  }`}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col">
        <h2 className="section-title">{titleOf(selected)}</h2>
        <dl className="mt-3 divide-y divide-line border-y border-line">
          <div className="flex items-baseline justify-between gap-3 py-3">
            <dt className="text-sm text-muted">Cuenta vinculada</dt>
            <dd className="text-base text-ink tabular-nums">{selected.balanceLabel}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-3">
            <dt className="text-sm text-muted">Límite diario</dt>
            <dd className="text-base text-ink tabular-nums">{selected.limitLabel}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-3">
            <dt className="text-sm text-muted">Estado</dt>
            <dd className={`text-base ${frozen ? "text-muted" : "text-accent"}`}>
              {frozen ? "Congelada" : "Activa"}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => setRevealed((current) => ({ ...current, [selected.id]: !showBack }))}
          aria-pressed={showBack}
          className="flex min-h-12 items-center gap-3 border-b border-line py-3 text-left text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {showBack ? (
            <EyeOff aria-hidden className="size-5 text-muted" />
          ) : (
            <Eye aria-hidden className="size-5 text-muted" />
          )}
          <span className="flex-1">{showBack ? "Ocultar datos" : "Ver datos de la tarjeta"}</span>
        </button>

        <form action={action} className="border-b border-line">
          <input type="hidden" name="cardId" value={selected.id} />
          <input type="hidden" name="intent" value={frozen ? "unfreeze" : "freeze"} />
          <button
            type="submit"
            role="switch"
            aria-checked={frozen}
            disabled={pending}
            className="flex min-h-14 w-full items-center gap-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
          >
            <Snowflake aria-hidden className={`size-5 ${frozen ? "text-accent" : "text-muted"}`} />
            <span className="flex-1">
              <span className="block text-base text-ink">Congelar tarjeta</span>
              <span className="block text-sm text-muted">
                {frozen ? "No se puede usar hasta que la descongeles." : "Bloquéala al momento si no la encuentras."}
              </span>
            </span>
            <span
              aria-hidden
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                frozen ? "bg-accent" : "bg-line"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow-sm transition-transform ${
                  frozen ? "translate-x-5" : ""
                }`}
              />
            </span>
          </button>
        </form>

        <div className="min-h-6 pt-3" aria-live="polite">
          {state?.error ? (
            <p className="error" role="alert">
              {state.error}
            </p>
          ) : state?.message ? (
            <p className="status">{state.message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Plastic({ card, frozen, showBack }: { card: OwnedCard; frozen: boolean; showBack: boolean }) {
  return (
    <div className="relative aspect-[1.586] perspective-[1200px]">
      <div
        className={`relative size-full transition-transform duration-500 ease-out transform-3d ${
          showBack ? "rotate-y-180" : ""
        }`}
      >
        <div
          aria-hidden={showBack}
          className={`absolute inset-0 overflow-hidden rounded-2xl text-white shadow-[0_12px_28px_-12px_rgba(18,26,36,0.55)] backface-hidden ${surfaceOf(card)} ${
            frozen ? "grayscale" : ""
          }`}
        >
          {card.medium === "plastic" ? <div className={`absolute inset-0 ${ENGRAVING}`} /> : null}
          <div className="relative flex size-full flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <span className="text-sm text-white/80">{titleOf(card)}</span>
              <Nfc aria-hidden className="size-6 text-white/80" />
            </div>
            {card.medium === "plastic" ? (
              <span
                aria-hidden
                className="block h-8 w-11 rounded-md bg-[linear-gradient(135deg,#e9d39a,#b8954d_55%,#e2c886)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)]"
              />
            ) : (
              <span className="self-start rounded-full border border-white/40 px-2.5 py-0.5 text-xs text-white/90">
                Solo en línea y móvil
              </span>
            )}
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg tracking-[0.12em] tabular-nums">
                  <span className="sr-only">Termina en </span>
                  <span aria-hidden>•••• </span>
                  {card.last4}
                </p>
                <p className="mt-1 truncate text-xs tracking-wide text-white/80">
                  {card.holderName} <span className="ml-2 tabular-nums">{card.expLabel}</span>
                </p>
              </div>
              <span className="shrink-0 text-2xl font-bold italic tracking-tight">VISA</span>
            </div>
          </div>
          {frozen ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/30 backdrop-blur-[2px]">
              <Snowflake aria-hidden className="size-8 text-ink" />
              <span className="text-sm font-medium text-ink">Congelada</span>
            </div>
          ) : null}
        </div>

        <div
          aria-hidden={!showBack}
          className={`absolute inset-0 rotate-y-180 overflow-hidden rounded-2xl text-white shadow-[0_12px_28px_-12px_rgba(18,26,36,0.55)] backface-hidden ${surfaceOf(card)}`}
        >
          <div className="mt-5 h-10 bg-[#0b1320]" />
          <div className="flex flex-col gap-3 px-5 pt-4">
            <div className="flex items-center gap-3">
              <div className="h-8 flex-1 rounded-sm bg-[repeating-linear-gradient(-45deg,#f4f7fb_0,#f4f7fb_6px,#e1e7ef_6px,#e1e7ef_12px)]" />
              <div className="rounded-sm bg-white px-2 py-1 text-sm text-ink tabular-nums">
                <span className="sr-only">CVV </span>
                {card.cvv}
              </div>
            </div>
            <p className="text-lg tracking-[0.08em] tabular-nums">{card.numberLabel}</p>
            <div className="flex items-center justify-between text-xs text-white/80">
              <span className="tabular-nums">Caduca {card.expLabel}</span>
              <span>Datos de prueba</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
