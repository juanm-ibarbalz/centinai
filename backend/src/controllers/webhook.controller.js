import { saveIncomingMessage } from "../services/messageProcessor.js";
import { updateConversationStatus } from "../services/conversationProcessor.js";

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
    await saveIncomingMessage(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Error handling message:", err);
    res.sendStatus(500);
  }
};

export const finalizeConversation = async (req, res) => {
  const { id } = req.params;

  try {
    await updateConversationStatus(id, "resolved");
    res.status(200).json({ message: "Conversación finalizada" });
  } catch (err) {
    console.error("Error al finalizar conversación:", err);
    res.status(500).json({ error: "No se pudo finalizar la conversación" });
  }
};
