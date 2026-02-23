const isProduction = process.env.NODE_ENV === "production";

function formatJson(level: string, msg: string, extra?: Record<string, unknown>): string {
  const entry: Record<string, unknown> = {
    level,
    msg,
    time: new Date().toISOString(),
    ...extra,
  };
  return JSON.stringify(entry) + "\n";
}

export const logger = {
  info(msg: string, extra?: Record<string, unknown>) {
    if (isProduction) {
      process.stdout.write(formatJson("info", msg, extra));
    } else {
      console.info(msg, ...(extra ? [extra] : []));
    }
  },

  warn(msg: string, extra?: Record<string, unknown>) {
    if (isProduction) {
      process.stdout.write(formatJson("warn", msg, extra));
    } else {
      console.warn(msg, ...(extra ? [extra] : []));
    }
  },

  error(msg: string, extra?: Record<string, unknown>) {
    if (isProduction) {
      process.stdout.write(formatJson("error", msg, extra));
    } else {
      console.error(msg, ...(extra ? [extra] : []));
    }
  },
};
