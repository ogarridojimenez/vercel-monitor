module.exports = async (req, res) => {

  // GET
  if (req.method === "GET") {
    return res.status(200).send("Webhook funcionando 🚀");
  }

  // POST TEST
  if (req.method === "POST") {

    return res.status(200).json({
      success: true,
      body: req.body
    });

  }

  return res.status(405).send("Method not allowed");

};