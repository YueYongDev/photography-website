import "server-only";

const fallbackSlowStepThresholdMs = 750;

const getSlowStepThresholdMs = () => {
  const configured = Number(process.env.SERVER_TIMING_WARN_MS);
  return Number.isFinite(configured) && configured >= 0
    ? configured
    : fallbackSlowStepThresholdMs;
};

export const measureServerStep = async <Result>(
  label: string,
  operation: () => Promise<Result>,
) => {
  const startedAt = performance.now();

  try {
    return await operation();
  } finally {
    const durationMs = performance.now() - startedAt;

    if (durationMs >= getSlowStepThresholdMs()) {
      console.warn(`[performance] Slow server step: ${label}`, {
        durationMs: Math.round(durationMs),
      });
    }
  }
};
