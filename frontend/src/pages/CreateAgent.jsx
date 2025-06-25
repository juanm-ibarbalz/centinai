// ✅ CreateAgent.jsx
import React, { useEffect, useState } from "react";
import "./createAgent.css";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const modelOptions = [
  { value: "", label: "Seleccionar modelo...", disabled: true },
  { value: "gpt-4", label: "OpenAI - GPT-4" },
  { value: "gpt-4o", label: "OpenAI - GPT-4o" },
  { value: "gpt-3.5-turbo", label: "OpenAI - GPT-3.5 Turbo" },
  { value: "gemini-1.5-pro", label: "Google - Gemini 1.5 Pro" },
  { value: "gemini-1.5-flash", label: "Google - Gemini 1.5 Flash" },
  { value: "claude-3-opus", label: "Anthropic - Claude 3 Opus" },
  { value: "claude-3-sonnet", label: "Anthropic - Claude 3 Sonnet" },
  { value: "mistral-medium", label: "Mistral - Medium" },
];

const CreateAgent = () => {
  const [step, setStep] = useState(1);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);

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
    const isCustomizado = form.mapping === "customizado";

    // Validación mínima para customizado (opcional pero recomendado)
    if (
      isCustomizado &&
      (!form.textKey || !form.fromKey || !form.toKey || !form.timestampKey)
    ) {
      alert("Todos los campos de mapeo personalizados son obligatorios.");
      return;
    }

    const finalForm = {
      phoneNumberId,
      name: form.name.trim(),
      description: form.description.trim(),
      modelName: form.modelName.trim(),
      payloadFormat: isStructured ? "structured" : "custom",
      authMode: form.authMethod,
      ...(isCustomizado && {
        fieldMapping: {
          text: form.textKey,
          from: form.fromKey,
          to: form.toKey,
          timestamp: form.timestampKey,
          ...(form.userNameKey ? { userName: form.userNameKey } : {}),
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

      const responseData = await res.json();

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Error del backend:", errorData);
        return;
      }

      console.log("✅ Respuesta del backend:");

      localStorage.removeItem("agentStep1");
      setSuccessMessage({
        token: responseData.secretToken,
        timeLeft: 15,
      });
      setTimeout(() => {
        navigate("/myAgents");
      }, 15000);
    } catch (error) {
      console.error("Error al añadir el agente:", error);
    }
  };

  const renderValidationMessage = (condition, text) => (
    <p className={condition ? "valid-text" : "error-text"}>
      {condition ? "✅" : "❌"} {text}
    </p>
  );

  useEffect(() => {
    if (successMessage && successMessage.token) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [successMessage]);

  return (
    <div className="create-agent-container">
      <h2>Añadir nuevo agente</h2>

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
                maxLength={5}
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
                maxLength={10}
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
              maxLength={20}
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
              maxLength={50}
              value={form.description}
              onChange={handleChange}
              required
            />
            {renderValidationMessage(
              form.description.trim().length >= 15,
              "mínimo 15 caracteres"
            )}

            <label htmlFor="modelName">Modelo de IA:</label>
            <div className="custom-select-container">
              <div
                className="custom-select-trigger"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                tabIndex="0"
              >
                {form.modelName
                  ? modelOptions.find((m) => m.value === form.modelName)?.label
                  : "Seleccionar modelo..."}
                <span
                  className={`custom-arrow ${
                    isModelDropdownOpen ? "open" : ""
                  }`}
                ></span>
              </div>
              {isModelDropdownOpen && (
                <div className="custom-options">
                  {modelOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`custom-option ${
                        option.disabled ? "disabled" : ""
                      } ${form.modelName === option.value ? "selected" : ""}`}
                      onClick={() => {
                        if (!option.disabled) {
                          setForm({ ...form, modelName: option.value });
                          setIsModelDropdownOpen(false);
                        }
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {renderValidationMessage(
              form.modelName,
              "debe seleccionar un modelo válido"
            )}

            <button type="button" onClick={handleNext} className="next-button">
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

            {form.mapping === "customizado" && (
              <div className="estructurado-extra">
                <label>Campo para Texto:</label>
                <input
                  type="text"
                  name="textKey"
                  maxLength={30}
                  value={form.textKey || ""}
                  onChange={(e) =>
                    setForm({ ...form, textKey: e.target.value })
                  }
                  required
                />

                <label>Campo para Emisor:</label>
                <input
                  type="text"
                  name="fromKey"
                  maxLength={30}
                  value={form.fromKey || ""}
                  onChange={(e) =>
                    setForm({ ...form, fromKey: e.target.value })
                  }
                  required
                />

                <label>Campo para Receptor:</label>
                <input
                  type="text"
                  name="toKey"
                  maxLength={30}
                  value={form.toKey || ""}
                  onChange={(e) => setForm({ ...form, toKey: e.target.value })}
                  required
                />

                <label>Campo para Timestamp:</label>
                <input
                  type="text"
                  name="timestampKey"
                  maxLength={30}
                  value={form.timestampKey || ""}
                  onChange={(e) =>
                    setForm({ ...form, timestampKey: e.target.value })
                  }
                  required
                />

                <label>Campo para userName (opcional):</label>
                <input
                  type="text"
                  name="userNameKey"
                  maxLength={30}
                  value={form.userNameKey || ""}
                  onChange={(e) =>
                    setForm({ ...form, userNameKey: e.target.value })
                  }
                  placeholder="Opcional"
                />
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

            <button type="submit">Guardar Agente</button>
          </>
        )}
      </form>
      {successMessage && successMessage.token && (
        <div className="success-overlay">
          <div className="success-box">
            <p>✅ Agente creado con éxito.</p>
            <p>
              🔐 Token secreto:{" "}
              <code className="token-badge">{successMessage.token}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(successMessage.token);
                }}
                className="copy-button"
              >
                📋 Copiar
              </button>
            </p>
            <p className="countdown-text">
              Redirigiendo a Mis Agentes en {timeLeft} segundo
              {timeLeft !== 1 && "s"}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAgent;
