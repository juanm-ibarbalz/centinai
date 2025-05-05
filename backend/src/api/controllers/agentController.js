import { createAgent } from "../../services/agent.service.js";
import { createAgentSchema } from "../../validators/agent.validator.js";

export const createAgentController = async (req, res) => {
  const result = createAgentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.flatten() });
  }

  const userId = req.user.id;

  try {
    const agent = await createAgent({ userId, ...result.data });
    res.status(201).json(agent);
  } catch (error) {
    console.error("Error al registrar agente:", error);
    res
      .status(500)
      .json({ error: error.message || "Error al registrar agente" });
  }
};
