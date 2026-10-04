type Channel = "SALES" | "SERVICE" | "HR";

// Sends a Telegram message when the bot is configured; never blocks or fails the request.
export async function notify(channel: Channel, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env[`TELEGRAM_CHAT_ID_${channel}`];
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    console.error("Telegram notification failed", error);
  }
}
