import { saveIncomingMessage } from "../services/messageProcessor.js";

export const verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

export const handleIncomingMessage = async (req, res) => {
  try {
    await saveIncomingMessage(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Error handling message:", err);
    res.sendStatus(500);
  }
};
