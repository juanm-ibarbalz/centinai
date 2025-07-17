# 📊 Analyzer Module — CentinIA

El módulo `Analyzer` forma parte de la plataforma **CentinIA**, diseñada para monitorear, analizar y entender el comportamiento de agentes conversacionales que utilizan inteligencia artificial. Este módulo se encarga de **procesar conversaciones**, **calcular métricas**, **detectar anomalías** y **evaluar el éxito del agente** de forma automática.

---

## 🚀 Features principales

- Procesamiento estructurado de conversaciones desde fuentes externas.
- Cálculo de latencia y análisis de tokens consumidos.
- Evaluación de éxito conversacional mediante análisis de contexto, palabras clave, emociones y patrones repetitivos.

---

## 📁 Estructura del módulo

```
src/
├── api/                         # Endpoints REST para disparar análisis
│   └── app.py
├── behavior_analysis/          # Lógica de análisis de éxito conversacional
│   └── ...
├── config/                     # Configuración general del módulo
│   └── settings.py
├── db/                         # Acceso a MongoDB (repo, conexión, etc.)
│   └── mongo_client.py
├── scripts/                    # Scripts de generación y pruebas manuales
│   └── generateFakeMessages.py
├── services/                   # Lógica de negocio principal
│   ├── processor.py
│   ├── latency_calculator.py
│   └── token_utils.py
├── storage/                    # Abstracción de escritura a BD
│   └── session_writter.py
├── tests/                      # Pruebas unitarias
│   ├── test_analyzer.py
│   └── test_success_evaluator.py
├── utils/                      # Utilidades generales
│   └── analyze_resolved.py
```

---

## ⚙️ Instalación

```bash
git clone <repo-url>
cd analyzer
pip install -r requirements.txt
```
---

## 🧪 Cómo correr los tests

```bash
pytest -s src/tests
```

Puedes probar componentes individuales como:

```bash
pytest -s src/tests/test_success_evaluator.py
```

También puedes usar el archivo `test.json` para cargar datos reales de ejemplo y ver cómo responde el módulo.

---

## ▶️ Ejemplo de uso

```python
from services.processor import process_conversation
from utils.analyze_resolved import load_test_conversation

conversation_data = load_test_conversation("src/tests/test.json")
result = process_conversation(conversation_data)
print(result)
```

---

## 📌 Requisitos

- Python 3.10 o superior.
- MongoDB (local o en Atlas, configurado en `config/settings.py`).
- Archivo . env con: Nombre de la base de datos Mongo DB, y la mongo uri correspondiente.
- Dependencias listadas en `requirements.txt`.

---

🛠️ Tecnologías y dependencias

Este módulo utiliza las siguientes tecnologías y paquetes de Python:

- pymongo: Conexión y operaciones con MongoDB.

- pandas: Manipulación de datos.

- python-dotenv: Carga de variables de entorno desde archivos .env.

- gunicorn: Servidor WSGI para despliegue en producción (utilizado por Docker).

- pytest (opcional): Framework de testing para pruebas unitarias locales.

- tiktoken: Tokenización de texto para conteo de tokens en modelos de OpenAI.

- tokonomics: Cálculo de costos de tokens para distintos modelos LLM.

- flask: Framework web para exponer la API de cargado de sesiones.

- flask_cors: Habilita CORS en la API de Flask.

- pyyaml: Lectura y escritura de archivos YAML (configuración).

- langdetect: Detección automática del idioma de los mensajes.

--

## 📈 Próximos pasos

- [ ] Integrar logger centralizado
- [ ] Profundizar el analisis con data science (Implementacion de pysentimiento, ramdom forest, modelos lpm)
- [ ] Terminar de establecer un sistema robusto de tags por conversación
- [ ] Analizar relaciones entre métricas para modelos predictivos

---

## 🧠 Parte de CentinIA

Este módulo es uno de los tres pilares fundamentales del proyecto **CentinIA**, junto con los módulos de **backend** y **frontend**. Si te interesa colaborar o saber más, contactanos o revisá el resto del monorrepo.
