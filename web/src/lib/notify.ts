type Channel = "SALES" | "SERVICE" | "HR";

// Sends a Telegram message when the bot is configured; never blocks or fails the request.
// Returns true only when Telegram accepted the message.
export async function notify(channel: Channel, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env[`TELEGRAM_CHAT_ID_${channel}`];
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch (error) {
    console.error("Telegram notification failed", error);
    return false;
  }
}
