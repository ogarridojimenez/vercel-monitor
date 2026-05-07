module.exports = async (req, res) => {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET
  if (req.method === "GET") {
    return res.status(200).send("Webhook funcionando 🚀");
  }

  // SOLO POST
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const body = req.body || {};

    console.log("BODY:", body);

    const event = body.type || "unknown";

    const project =
      body.payload?.project?.name ||
      body.payload?.name ||
      "Proyecto";

    const deploymentUrl =
      body.payload?.url ||
      body.payload?.deployment?.url ||
      "";

    let message =
      `📡 Evento recibido\n\n` +
      `🧩 ${event}`;

    // DEPLOY INICIADO
    if (event === "deployment.created") {
      message =
        `🚀 Deploy iniciado\n\n` +
        `📦 Proyecto: ${project}`;
    }

    // DEPLOY EXITOSO
    if (
      event === "deployment.ready" ||
      event === "deployment.succeeded"
    ) {
      message =
        `✅ Deploy completado\n\n` +
        `📦 Proyecto: ${project}\n\n` +
        `🌐 https://${deploymentUrl}`;
    }

    // ERROR
    if (
      event === "deployment.error" ||
      event === "deployment.failed"
    ) {
      message =
        `❌ Deploy falló\n\n` +
        `📦 Proyecto: ${project}`;
    }

    // ENVIAR A TELEGRAM
    const telegramResponse = await fetch(
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

    const telegramData =   await        telegramResponse.json();

    console.log("TELEGRAM:",     telegramData);

    return res.status(200).json({
      success: true,
      telegram: telegramData,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });

  }

};