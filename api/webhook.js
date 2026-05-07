module.exports = async (req, res) => {

  if (req.method === "GET") {
    return res.status(200).send("Webhook funcionando 🚀");
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const body = req.body || {};

    const event = body.type || "unknown";

    const project =
      body.payload?.name ||
      "Proyecto";

    const deploymentUrl =
      body.payload?.url ||
      "";

    let message = `📡 Evento: ${event}`;

    if (event === "deployment.created") {
      message =
        `🚀 Deploy iniciado\n\n` +
        `📦 Proyecto: ${project}`;
    }

    if (
      event === "deployment.ready" ||
      event === "deployment.succeeded"
    ) {
      message =
        `✅ Deploy completado\n\n` +
        `📦 Proyecto: ${project}\n\n` +
        `🌐 https://${deploymentUrl}`;
    }

    if (
      event === "deployment.error" ||
      event === "deployment.failed"
    ) {
      message =
        `❌ Deploy falló\n\n` +
        `📦 Proyecto: ${project}`;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
        }),
      }
    );

    const data = await response.json();

    return res.status(200).json({
      success: true,
      telegram: data,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      error: error.message,
    });

  }

};