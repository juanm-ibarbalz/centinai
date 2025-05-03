import { saveIncomingMessage } from "../../services/processors/message.service.js";

export const verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Verifying webhook:", req.query);

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

export const handleIncomingMessage = async (req, res) => {
  try {
    console.log("Analizando mensaje...");
    await saveIncomingMessage(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Error handling message:", err);
    res.sendStatus(500);
  }
};
