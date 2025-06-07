import {
  findOpenConversation,
  shouldCloseConversation,
  closeConversation,
  updateTimestamp,
  createNewConversation,
  buildConversationMatchStage,
  buildConversationSortStage,
  buildConversationProjectStage,
} from "./helpers/conversation.helpers.js";
import Conversation from "../models/Conversation.js";

/**
 * Crea una nueva conversación o actualiza una existente,
 * cerrando la anterior si ya venció el timeout.
 * @param {string} userId - ID del usuario que envía el mensaje
 * @param {string} agentPhoneNumberId - Número de teléfono del agente
 * @param {string} userName - Nombre del usuario
 * @param {string} from - Identificador del remitente (número de teléfono del cliente)
 * @returns {Promise<string>} - ID de la conversación activa
 */
export const createOrUpdateConversation = async (
  userId,
  agentPhoneNumberId,
  userName,
  from,
) => {
  const now = new Date();
  const conversation = await findOpenConversation(from, agentPhoneNumberId);

  if (shouldCloseConversation(conversation, now)) {
    if (conversation) await closeConversation(conversation);
    return await createNewConversation(
      userId,
      agentPhoneNumberId,
      userName,
      from,
    );
  }

  await updateTimestamp(conversation);
  return conversation._id;
};

/**
 * Busca las conversaciones del usuario para un agente específico,
 * aplica paginación, ordenamiento y filtro por fecha, y une con métricas.
 * @param {string} userId
 * @param {string} agentPhoneNumberId
 * @param {Object} options
 * @param {number} options.limit
 * @param {number} options.offset
 * @param {"duration"|"cost"|"date"} [options.sortBy]
 * @param {"asc"|"desc"} [options.sortOrder]
 * @param {Date} [options.dateFrom]
 * @param {Date} [options.dateTo]
 *
 * @returns {Promise<Array>} - Lista de objetos con { conversation, metrics }
 */
export const findConversationsByAgent = async (
  userId,
  agentPhoneNumberId,
  { limit, offset, sortBy, sortOrder, dateFrom, dateTo },
) => {
  // 1) Stage $match
  const matchStage = buildConversationMatchStage(
    userId,
    agentPhoneNumberId,
    dateFrom,
    dateTo,
  );

  // 2) Stage $lookup
  // Lookup contra la colección "metrics" (modelo Metric) para traer durationSeconds y tokenUsage.cost
  // LEFT JOIN metrics m ON m.conversation_id = c.id AND m.user_id = :userId (y seleccionar columnas m.duration_seconds, m.token_usage_cost en el SELECT)
  const lookupStage = {
    $lookup: {
      from: "metrics",
      let: { convId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$conversationId", "$$convId"] },
                { $eq: ["$userId", userId] },
              ],
            },
          },
        },
        { $project: { _id: 0, durationSeconds: 1, "tokenUsage.cost": 1 } },
      ],
      as: "metrics",
    },
  };

  // 3) Stage $unwind (fijo)
  // Hacemos unwind para simplificar
  // Convierte “metrics” en un objeto simple en lugar de array.
  const unwindStage = {
    $unwind: { path: "$metrics", preserveNullAndEmptyArrays: true },
  };

  // 4) Stage $sort
  const sortStage = buildConversationSortStage(sortBy, sortOrder);

  // 5) Stages $skip y $limit
  const skipStage = { $skip: offset };
  const limitStage = { $limit: limit };

  // 6) Stage $project
  const projectStage = buildConversationProjectStage();

  // 7) Armamos el pipeline completo
  const pipeline = [
    matchStage,
    lookupStage,
    unwindStage,
    sortStage,
    skipStage,
    limitStage,
    projectStage,
  ];

  return await Conversation.aggregate(pipeline);
};
