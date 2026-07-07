import { createHmac } from "node:crypto";

function webhookTimeoutMs() {
  const configured = Number(process.env.FITMEET_LEADS_WEBHOOK_TIMEOUT_MS);

  if (Number.isFinite(configured) && configured >= 1_000 && configured <= 30_000) {
    return configured;
  }

  return 8_000;
}

export async function deliverLeadToWebhook(webhookUrl: string, lead: unknown) {
  const body = JSON.stringify(lead);
  const timestamp = new Date().toISOString();
  const secret = process.env.FITMEET_LEADS_WEBHOOK_SECRET;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), webhookTimeoutMs());
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (secret) {
    const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");

    headers["X-FitMeet-Timestamp"] = timestamp;
    headers["X-FitMeet-Signature"] = `sha256=${signature}`;
  }

  try {
    return await fetch(webhookUrl, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
