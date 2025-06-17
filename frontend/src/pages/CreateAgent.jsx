// ✅ CreateAgent.jsx
import React, { useEffect, useState } from "react";
import "./createAgent.css";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const CreateAgent = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    description: "",
    phonePrefix: "",
    areaCode: "",
    localNumber: "",
    mapping: "",
    authMethod: "",
    modelName: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("agentStep1");
    if (saved) {
      setForm(JSON.parse(saved));
    }

    return () => {
      localStorage.removeItem("agentStep1");
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isNumeric = (value) => /^[0-9]*$/.test(value);

  const validatePhone = () => {
    return (
      form.phonePrefix &&
      isNumeric(form.areaCode) &&
      isNumeric(form.localNumber) &&
      form.areaCode.length >= 2 &&
      form.localNumber.length >= 6
    );
  };

  const validateFormStep1 = () => {
    return (
      form.name.trim().length >= 4 &&
      form.description.trim().length >= 15 &&
      form.modelName.trim().length >= 4 &&
      validatePhone()
    );
  };

  const goToStep = (targetStep) => {
    if (targetStep === 1) {
      setStep(1);
    } else if (targetStep === 2 && validateFormStep1()) {
      setStep(2);
    }
  };

  const handleNext = () => {
    if (validateFormStep1()) {
      localStorage.setItem("agentStep1", JSON.stringify(form));
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const phoneNumberId = `${form.phonePrefix}${form.areaCode}${form.localNumber}`;
    const isStructured = form.mapping === "estructurado";

    const customMappingParts = (form.customMapping || "").split(".");
    const isValidCustom =
      customMappingParts.length === 2 &&
      customMappingParts[0] &&
      customMappingParts[1];

    const finalForm = {
      phoneNumberId,
      name: form.name.trim(),
      description: form.description.trim(),
      modelName: form.modelName.trim(),
      payloadFormat: isStructured ? "structured" : "custom",
      authMode: form.authMethod,
      ...(isStructured
        ? {}
        : isValidCustom && {
            fieldMapping: {
              text: customMappingParts[0],
              from: customMappingParts[1],
              timestamp: "timestamp",
            },
          }),
    };

    try {
      console.log("✅ Payload enviado:", finalForm);

      const res = await fetch(`${API_URL}/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalForm),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Error del backend:", errorData);
        return;
      }

      localStorage.removeItem("agentStep1");
      navigate("/home");
    } catch (error) {
      console.error("Error al crear el agente:", error);
    }
  };

  const renderValidationMessage = (condition, text) => (
    <p className={condition ? "valid-text" : "error-text"}>
      {condition ? "✅" : "❌"} {text}
    </p>
  );

  return (
    <div className="create-agent-container">
      <h2>Crear nuevo agente</h2>

      <div className="stepper">
        <div
          className={`step ${step === 1 ? "active" : ""}`}
          onClick={() => goToStep(1)}
          title="Configuración general"
        >
          ⚙️
        </div>
        <div className={`line-progress ${step === 2 ? "filled" : ""}`}></div>
        <div
          className={`step ${step === 2 ? "active" : ""}`}
          onClick={() => goToStep(2)}
          title="Configuración específica"
        >
          💼
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-agent-form">
        {step === 1 && (
          <>
            <label htmlFor="phoneNumber">Teléfono:</label>
            <div className="phone-row">
              <PhoneInput
                className="phone-input-small"
                international
                defaultCountry="AR"
                value={form.phonePrefix}
                onChange={(phone) => {
                  if (phone) {
                    const match = phone.match(/^(\+\d{1,4})/);
                    const prefix = match ? match[1] : "";
                    setForm((prev) => ({ ...prev, phonePrefix: prefix }));
                  }
                }}
              />

              <input
                type="text"
                className="phone-input-medium"
                placeholder="Código área"
                value={form.areaCode}
                onChange={(e) => {
                  if (isNumeric(e.target.value)) {
                    setForm({ ...form, areaCode: e.target.value });
                  }
                }}
              />

              <input
                type="text"
                className="phone-input-large"
                placeholder="Número"
                value={form.localNumber}
                onChange={(e) => {
                  if (isNumeric(e.target.value)) {
                    setForm({ ...form, localNumber: e.target.value });
                  }
                }}
              />
            </div>

            <label htmlFor="name">Nombre del Bot:</label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            {renderValidationMessage(
              form.name.trim().length >= 4,
              "mínimo 4 caracteres"
            )}

            <label htmlFor="description">Descripción:</label>
            <input
              id="description"
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
            {renderValidationMessage(
              form.description.trim().length >= 15,
              "mínimo 15 caracteres"
            )}

            <label htmlFor="modelName">Modelo de IA:</label>
            <select
              id="modelName"
              name="modelName"
              value={form.modelName}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar modelo...</option>
              <option value="gpt-4">OpenAI - GPT-4</option>
              <option value="gpt-4o">OpenAI - GPT-4o</option>
              <option value="gpt-3.5-turbo">OpenAI - GPT-3.5 Turbo</option>
              <option value="gemini-1.5-pro">Google - Gemini 1.5 Pro</option>
              <option value="gemini-1.5-flash">
                Google - Gemini 1.5 Flash
              </option>
              <option value="claude-3-opus">Anthropic - Claude 3 Opus</option>
              <option value="claude-3-sonnet">
                Anthropic - Claude 3 Sonnet
              </option>
              <option value="mistral-medium">Mistral - Medium</option>
              <option value="mistral-small">Mistral - Small</option>
              <option value="titan-text-express">
                Amazon - Titan Text Express
              </option>
            </select>
            {renderValidationMessage(
              form.modelName.trim().length >= 4,
              "debe seleccionar un modelo válido"
            )}

            <button type="button" onClick={handleNext}>
              Siguiente
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label htmlFor="mapping">Mapeo:</label>
            <select
              id="mapping"
              name="mapping"
              value={form.mapping}
              onChange={(e) => setForm({ ...form, mapping: e.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="estructurado">Estructurado</option>
              <option value="customizado">Customizado</option>
            </select>

            {form.mapping === "estructurado" && (
              <div className="estructurado-extra">
                <label>Texto:</label>
                <input
                  type="text"
                  name="texto"
                  value={form.texto || ""}
                  onChange={(e) => setForm({ ...form, texto: e.target.value })}
                  required
                />

                <label>Emisor:</label>
                <input
                  type="text"
                  name="emisor"
                  value={form.emisor || ""}
                  onChange={(e) => setForm({ ...form, emisor: e.target.value })}
                  required
                />

                <label>Tiempo:</label>
                <input
                  type="text"
                  name="tiempo"
                  value={form.tiempo || ""}
                  onChange={(e) => setForm({ ...form, tiempo: e.target.value })}
                  required
                />
              </div>
            )}

            {form.mapping === "customizado" && (
              <div className="estructurado-extra">
                <label>Clave JSON (formato palabra.palabra):</label>
                <input
                  type="text"
                  name="customMapping"
                  value={form.customMapping || ""}
                  onChange={(e) =>
                    setForm({ ...form, customMapping: e.target.value })
                  }
                  required
                />
                {!/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)$/.test(
                  form.customMapping || ""
                ) && (
                  <p className="error-text">
                    ❌ Debe ser formato palabra.palabra
                  </p>
                )}
              </div>
            )}

            <label htmlFor="authMethod">Método de Autenticación:</label>
            <select
              id="authMethod"
              name="authMethod"
              value={form.authMethod}
              onChange={(e) => setForm({ ...form, authMethod: e.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="body">Body</option>
              <option value="header">Header</option>
              <option value="query">Query</option>
            </select>
            {form.authMethod === "query" && (
              <p className="warning-text">
                ⚠️ Query es un método poco seguro. Evítalo si es posible.
              </p>
            )}
            {["body", "header"].includes(form.authMethod) && (
              <p className="success-text">
                ✅ {form.authMethod} es un método seguro.
              </p>
            )}

            {/* authValue queda visible solo para ingresar, pero no se manda en el payload */}
            {["body", "header", "query"].includes(form.authMethod) && (
              <div className="estructurado-extra">
                <label>Valor de Autenticación:</label>
                <input
                  type="text"
                  name="authValue"
                  value={form.authValue || ""}
                  onChange={(e) =>
                    setForm({ ...form, authValue: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <button type="submit">Guardar Agente</button>
          </>
        )}
      </form>
    </div>
  );
};

export default CreateAgent;
