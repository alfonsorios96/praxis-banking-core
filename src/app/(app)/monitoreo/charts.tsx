import { CONCEPT_LABEL, type MinuteBucket, type PieSlice } from "@/monitoring/faults";
import { formatClock } from "./format";

const SLICE_COLORS = ["#9f2d2d", "#c2702e", "#1d4e89", "#5c6b7c"] as const;

const WIDTH = 640;
const HEIGHT = 240;
const PAD_LEFT = 32;
const PAD_RIGHT = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;

export function TimelineChart({ buckets }: { buckets: MinuteBucket[] }) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const peak = Math.max(...buckets.map((bucket) => bucket.count), 0);
  const top = Math.max(2, peak % 2 === 0 ? peak : peak + 1);
  const ticks = [0, top / 2, top];
  const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const band = innerWidth / buckets.length;
  const barWidth = band * 0.62;
  const y = (value: number) => PAD_TOP + innerHeight - (value / top) * innerHeight;
  const first = buckets[0];
  const last = buckets[buckets.length - 1];

  return (
    <figure className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block h-auto w-full"
        role="img"
        aria-label={
          total === 0
            ? "Sin fallos en los últimos 15 minutos."
            : `${total} fallos en los últimos 15 minutos, con un máximo de ${peak} en un minuto.`
        }
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text
              x={PAD_LEFT - 8}
              y={y(tick)}
              dy="0.32em"
              textAnchor="end"
              className="fill-muted text-[11px] tabular-nums"
            >
              {tick}
            </text>
          </g>
        ))}
        {buckets.map((bucket, index) => {
          const x = PAD_LEFT + index * band + (band - barWidth) / 2;
          const height = y(0) - y(bucket.count);
          return (
            <g key={bucket.start.toISOString()}>
              <title>
                {`${formatClock(bucket.start)}: ${bucket.count} ${bucket.count === 1 ? "fallo" : "fallos"}`}
              </title>
              <rect
                x={x}
                y={bucket.count > 0 ? y(bucket.count) : y(0) - 2}
                width={barWidth}
                height={bucket.count > 0 ? height : 2}
                rx={3}
                fill={bucket.count > 0 ? "var(--danger)" : "var(--line)"}
              />
            </g>
          );
        })}
        {buckets.map((bucket, index) =>
          index % 5 === 0 || index === buckets.length - 1 ? (
            <text
              key={`label-${bucket.start.toISOString()}`}
              x={PAD_LEFT + index * band + band / 2}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-muted text-[11px] tabular-nums"
            >
              {formatClock(bucket.start)}
            </text>
          ) : null,
        )}
      </svg>
      {total === 0 ? (
        <figcaption className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-sm text-muted">
          Sin fallos en los últimos 15 minutos.
        </figcaption>
      ) : (
        <figcaption className="sr-only">
          De {first ? formatClock(first.start) : ""} a {last ? formatClock(last.start) : ""}.
        </figcaption>
      )}
    </figure>
  );
}

export function FaultPie({ slices, total }: { slices: PieSlice[]; total: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center xl:flex-col">
      <svg
        viewBox="0 0 140 140"
        className="size-40 shrink-0"
        role="img"
        aria-label={
          slices.length === 0
            ? "Sin fallos registrados."
            : slices
                .map((slice) => `${slice.code} ${slice.concept}: ${Math.round(slice.share * 100)} %`)
                .join(". ")
        }
      >
        <circle cx={70} cy={70} r={radius} fill="none" stroke="var(--line)" strokeWidth={18} />
        {slices.map((slice, index) => (
          <circle
            key={slice.concept}
            cx={70}
            cy={70}
            r={radius}
            fill="none"
            stroke={SLICE_COLORS[index % SLICE_COLORS.length]}
            strokeWidth={18}
            strokeDasharray={`${slice.share * circumference} ${circumference}`}
            strokeDashoffset={-slice.offset * circumference}
            transform="rotate(-90 70 70)"
          />
        ))}
        <text
          x={70}
          y={66}
          textAnchor="middle"
          className="fill-ink text-[26px] font-medium tabular-nums"
        >
          {total}
        </text>
        <text x={70} y={86} textAnchor="middle" className="fill-muted text-[11px]">
          {total === 1 ? "fallo" : "fallos"}
        </text>
      </svg>

      {slices.length === 0 ? (
        <p className="text-sm text-muted">Sin fallos registrados.</p>
      ) : (
        <ul className="flex w-full flex-col gap-3">
          {slices.map((slice, index) => (
            <li key={slice.concept} className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-1.5 size-2.5 shrink-0 rounded-full"
                style={{ background: SLICE_COLORS[index % SLICE_COLORS.length] }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">
                  <span className="font-medium tabular-nums">{slice.code}</span> {slice.concept}
                </p>
                {CONCEPT_LABEL[slice.concept] ? (
                  <p className="text-sm leading-5 text-muted">{CONCEPT_LABEL[slice.concept]}</p>
                ) : null}
              </div>
              <p className="shrink-0 text-sm text-ink tabular-nums">
                {slice.count}{" "}
                <span className="text-muted">({Math.round(slice.share * 100)} %)</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
