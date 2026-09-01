export type CameraPreset = {
  value: number;
  label: string;
};

export const DEFAULT_CAPTURE_TIMEZONE_OFFSET = 8 * 60;

const CAPTURE_TIMEZONE_OFFSETS = [
  -720,
  -660,
  -600,
  -570,
  -540,
  -480,
  -420,
  -360,
  -300,
  -240,
  -210,
  -180,
  -150,
  -120,
  -60,
  0,
  60,
  120,
  180,
  210,
  240,
  270,
  300,
  330,
  345,
  360,
  390,
  420,
  480,
  525,
  540,
  570,
  600,
  630,
  660,
  720,
  765,
  780,
  825,
  840,
] as const;

export type CaptureTimeZoneOption = {
  value: number;
  label: string;
};

export const formatCaptureTimezoneOffset = (offsetMinutes: number) => {
  const sign = offsetMinutes >= 0 ? "+" : "−";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  return `UTC${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const getCaptureTimeZoneOptions = (
  locale: "en" | "zh-CN",
): CaptureTimeZoneOption[] =>
  CAPTURE_TIMEZONE_OFFSETS.map((value) => ({
    value,
    label:
      value === DEFAULT_CAPTURE_TIMEZONE_OFFSET
        ? `${formatCaptureTimezoneOffset(value)} · ${locale === "zh-CN" ? "东八区（默认）" : "China Standard Time (default)"}`
        : formatCaptureTimezoneOffset(value),
  }));

const trimDecimal = (value: number, maximumFractionDigits: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    useGrouping: false,
  }).format(value);

export const cameraValueKey = (value: number) =>
  Number(value.toPrecision(12)).toString();

export const formatFocalLength = (value: number) =>
  `${trimDecimal(value, 3)} mm`;

export const formatAperture = (value: number) =>
  `f/${trimDecimal(value, 2)}`;

export const formatIso = (value: number) => `ISO ${Math.round(value)}`;

export const formatExposureCompensation = (value: number) => {
  if (Math.abs(value) < 0.0001) return "0 EV";

  const sign = value > 0 ? "+" : "−";
  const absoluteValue = Math.abs(value);
  const thirds = Math.round(absoluteValue * 3);
  const cameraValue =
    thirds % 3 === 0
      ? String(thirds / 3)
      : (thirds / 3).toFixed(1);

  return `${sign}${cameraValue} EV`;
};

export const formatShutterSpeed = (seconds: number) => {
  if (seconds <= 0 || !Number.isFinite(seconds)) return "—";

  if (seconds < 1) {
    const denominator = Math.round(1 / seconds);
    if (denominator >= 2) return `1/${denominator} s`;
  }

  return `${trimDecimal(seconds, 1)} s`;
};

export const formatLocalDateTimeInput = (
  value: Date | string | null | undefined,
  timezoneOffsetMinutes = DEFAULT_CAPTURE_TIMEZONE_OFFSET,
) => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "";

  const captureDate = new Date(
    date.getTime() + timezoneOffsetMinutes * 60_000,
  );

  const pad = (part: number) => String(part).padStart(2, "0");
  return [
    `${captureDate.getUTCFullYear()}-${pad(captureDate.getUTCMonth() + 1)}-${pad(captureDate.getUTCDate())}`,
    `${pad(captureDate.getUTCHours())}:${pad(captureDate.getUTCMinutes())}:${pad(captureDate.getUTCSeconds())}`,
  ].join("T");
};

export const parseLocalDateTimeInput = (
  value: string,
  timezoneOffsetMinutes = DEFAULT_CAPTURE_TIMEZONE_OFFSET,
) => {
  if (!value) return undefined;

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (!match) return undefined;

  const [, year, month, day, hours, minutes, seconds = "0"] = match;
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds),
    ) -
      timezoneOffsetMinutes * 60_000,
  );

  return Number.isFinite(date.getTime()) ? date : undefined;
};

export const formatExifDateTimeInput = (value: unknown) => {
  if (!value) return "";

  if (typeof value === "string") {
    const match = value
      .trim()
      .match(
        /^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/,
      );

    if (match) {
      const [, year, month, day, hours, minutes, seconds = "00"] = match;
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (!Number.isFinite(date.getTime())) return "";

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const formatCaptureDate = (
  value: Date | string,
  timezoneOffsetMinutes: number,
  locale: string,
  options: Intl.DateTimeFormatOptions,
) => {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  const captureDate = new Date(
    date.getTime() + timezoneOffsetMinutes * 60_000,
  );

  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: "UTC",
  }).format(captureDate);
};

export const getCaptureYear = (
  value: Date | string | null | undefined,
  timezoneOffsetMinutes = DEFAULT_CAPTURE_TIMEZONE_OFFSET,
) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  return new Date(
    date.getTime() + timezoneOffsetMinutes * 60_000,
  ).getUTCFullYear();
};

export const APERTURE_PRESETS: CameraPreset[] = [
  1,
  1.1,
  1.2,
  1.4,
  1.6,
  1.8,
  2,
  2.2,
  2.5,
  2.8,
  3.2,
  3.5,
  4,
  4.5,
  5,
  5.6,
  6.3,
  7.1,
  8,
  9,
  10,
  11,
  13,
  14,
  16,
  18,
  20,
  22,
  25,
  29,
  32,
  36,
  40,
  45,
  51,
  57,
  64,
].map((value) => ({ value, label: formatAperture(value) }));

export const ISO_PRESETS: CameraPreset[] = [
  25,
  32,
  40,
  50,
  64,
  80,
  100,
  125,
  160,
  200,
  250,
  320,
  400,
  500,
  640,
  800,
  1000,
  1250,
  1600,
  2000,
  2500,
  3200,
  4000,
  5000,
  6400,
  8000,
  10000,
  12800,
  16000,
  20000,
  25600,
  32000,
  40000,
  51200,
  64000,
  80000,
  102400,
  128000,
  160000,
  204800,
  256000,
  409600,
  819200,
].map((value) => ({ value, label: formatIso(value) }));

export const EXPOSURE_COMPENSATION_PRESETS: CameraPreset[] = Array.from(
  { length: 31 },
  (_, index) => {
    const value = (index - 15) / 3;
    return { value, label: formatExposureCompensation(value) };
  },
);

const shutterFractions = [
  32000,
  25000,
  20000,
  16000,
  13000,
  10000,
  8000,
  6400,
  5000,
  4000,
  3200,
  2500,
  2000,
  1600,
  1250,
  1000,
  800,
  640,
  500,
  400,
  320,
  250,
  200,
  160,
  125,
  100,
  80,
  60,
  50,
  40,
  30,
  25,
  20,
  15,
  13,
  10,
  8,
  6,
  5,
  4,
  3,
  2,
];

const shutterSeconds = [
  0.6,
  0.8,
  1,
  1.3,
  1.6,
  2,
  2.5,
  3.2,
  4,
  5,
  6,
  8,
  10,
  13,
  15,
  20,
  25,
  30,
];

export const SHUTTER_FRACTION_PRESETS: CameraPreset[] = shutterFractions.map(
  (denominator) => ({
    value: 1 / denominator,
    label: `1/${denominator} s`,
  }),
);

export const SHUTTER_SECONDS_PRESETS: CameraPreset[] = shutterSeconds.map(
  (value) => ({
    value,
    label: `${trimDecimal(value, 1)} s`,
  }),
);

export const SHUTTER_PRESETS = [
  ...SHUTTER_FRACTION_PRESETS,
  ...SHUTTER_SECONDS_PRESETS,
];

export const includesCameraPreset = (
  presets: CameraPreset[],
  value: number | null | undefined,
) => {
  if (value === null || value === undefined) return false;
  return presets.some(
    (preset) =>
      Math.abs(preset.value - value) <=
      Math.max(Math.abs(preset.value), Math.abs(value), 1) * 1e-10,
  );
};
