import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    _id: { type: String }, // ID del mensaje
    conversationId: { type: String }, // ID de la conversación
    timestamp: Date, // Fecha y hora de la creación
    from: String, // ID de quien envió el mensaje
    userName: String, // Nombre del usuario
    text: String, // Contenido del mensaje
    type: String, // Tipo de mensaje
    direction: {
      type: String,
      enum: ["user", "agent"],
    }, // De parte de quien es el mensaje
    status: {
      type: String,
      default: "active",
    }, // Estado del mensaje/conversación
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // esto agrega createdAt y updatedAt automáticamente
  },
);

// Índices
messageSchema.index({ conversationId: 1 });
messageSchema.index({ from: 1 });
messageSchema.index({ timestamp: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ userId: 1 });

export default mongoose.model("Message", messageSchema);
