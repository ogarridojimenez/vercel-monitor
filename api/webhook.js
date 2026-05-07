export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const body = req.body;

    // Variables de entorno
    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // Evento recibido desde Vercel
    const event = body.type;

    const project = body.payload?.name || "Proyecto";
    const url = body.payload?.url || "";

    let message = "";

    // Deploy iniciado
    if (event === "deployment.created") {
      message =
        `🚀 Deploy iniciado\n\n` +
        `📦 Proyecto: ${project}`;
    }

    // Deploy exitoso
    if (
      event === "deployment.ready" ||
      event === "deployment.succeeded"
    ) {
      message =
        `✅ Deploy completado\n\n` +
        `📦 Proyecto: ${project}\n` +
        `🌐 https://${url}`;
    }

    // Error
    if (event === "deployment.error") {
      message =
        `❌ Deploy falló\n\n` +
        `📦 Proyecto: ${project}`;
    }

    // Si no hay mensaje, ignorar
    if (!message) {
      return res.status(200).json({
        ignored: true,
      });
    }

    // Enviar mensaje a Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
        }),
      }
    );

    const telegramData = await telegramResponse.json();

    return res.status(200).json({
      success: true,
      telegram: telegramData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}