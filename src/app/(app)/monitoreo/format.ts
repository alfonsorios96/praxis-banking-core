const CLOCK = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
});

const CLOCK_SECONDS = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Europe/Madrid",
});

export function formatClock(date: Date): string {
  return CLOCK.format(date);
}

export function formatClockSeconds(date: Date): string {
  return CLOCK_SECONDS.format(date);
}
