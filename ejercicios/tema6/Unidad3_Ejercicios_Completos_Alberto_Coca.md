# Ejercicios Prácticos — Unidad 3, Sesión 2  
## Acceso Programático a LLMs

**Autor:** Alberto Coca  
**Fecha:** 3 de marzo de 2026  

> Nota: Donde se incluye “Ejemplo de output”, es una muestra de cómo debería verse la salida al ejecutar el código. Sustituir por el output real si se dispone de API key y ejecución local.

---

# Ejercicio 1 — Primera llamada a la API

## 1) Código completo (OpenRouter + modelo free)

```python
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

MODEL = "google/gemini-2.0-flash-exp:free"

def ask_ml(temp: float):
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "user", "content": "¿Qué es el machine learning? Responde en 3 oraciones."}
        ],
        temperature=temp,
    )
    return resp

if __name__ == "__main__":
    for t in [0, 0.7, 1.5]:
        r = ask_ml(t)
        print(f"\n=== temperature={t} ===")
        print("Respuesta:", r.choices[0].message.content)
        print("Modelo:", r.model)
        # Algunos proveedores pueden no devolver usage; en ese caso, mostrar None/0
        usage = getattr(r, "usage", None)
        if usage:
            print("Prompt tokens:", usage.prompt_tokens)
            print("Completion tokens:", usage.completion_tokens)
            print("Total tokens:", usage.total_tokens)
        else:
            print("Usage: no disponible en este proveedor/modelo")
```

## 2) Ejemplo de output (1 ejecución por temperatura)

**temperature = 0**
```
Respuesta: El machine learning es una rama de la inteligencia artificial que aprende patrones a partir de datos. Permite hacer predicciones o decisiones sin reglas explícitas programadas. Se usa en sistemas de recomendación, detección de fraude y visión por computador.
Modelo: google/gemini-2.0-flash-exp:free
Prompt tokens: 18
Completion tokens: 52
Total tokens: 70
```

**temperature = 0.7**
```
Respuesta: El machine learning permite que un sistema aprenda de ejemplos para reconocer patrones y predecir resultados. En lugar de programar reglas a mano, se entrenan modelos con datos para generalizar a casos nuevos. Es clave en reconocimiento de voz, recomendaciones y diagnóstico asistido.
Modelo: google/gemini-2.0-flash-exp:free
Prompt tokens: 18
Completion tokens: 55
Total tokens: 73
```

**temperature = 1.5**
```
Respuesta: El machine learning es como enseñar a una máquina a “intuir” a partir de experiencias (datos). Entrena modelos que capturan patrones para acertar con predicciones o clasificaciones futuras. Por eso impulsa desde filtros de spam hasta coches autónomos.
Modelo: google/gemini-2.0-flash-exp:free
Prompt tokens: 18
Completion tokens: 54
Total tokens: 72
```

## 3) Tabla comparativa (temperature)

| Temperature | Variabilidad | Estilo típico | Riesgo de “creatividad excesiva” |
|---:|---|---|---|
| 0.0 | Baja | Directo y consistente | Bajo |
| 0.7 | Media | Explicativo y natural | Medio |
| 1.5 | Alta | Creativo / metafórico | Alto |

## 4) Preguntas de reflexión

1. **¿Por qué es importante monitorear el consumo de tokens?**  
   Porque los tokens determinan coste y límites de contexto. En producción, prompts largos o históricos sin control aumentan gasto y pueden causar truncamientos o errores al exceder el contexto.

2. **¿Qué sucede si envías un prompt muy largo?**  
   Sube el consumo de tokens (más coste) y reduce el espacio disponible para la respuesta. Si excede el contexto máximo del modelo, puede fallar o truncar entradas/salidas.

3. **¿Diferencia entre temperature=0 y temperature=1.5?**  
   Con 0 el modelo tiende a escoger la continuación más probable (salida estable). Con 1.5 aumenta exploración (más variedad/creatividad), pero también incoherencias o detalles menos fiables.

---

# Ejercicio 2 — Comparativa de APIs / Modelos (mismo prompt, métricas y criterio)

## Prompt de prueba (idéntico en todos)
> “Explica qué es el machine learning en 3 oraciones e incluye 1 ejemplo de aplicación.”

## Método de medición (para coherencia)
- **Tokens:** `usage.total_tokens` (si el proveedor lo devuelve).  
- **Tiempo:** medir con `time.perf_counter()` alrededor de la llamada (latencia total cliente→API→cliente).  
- **Calidad:** escala /10, con criterios: claridad (0–3), precisión (0–4), ejemplo útil (0–3).

## Tabla comparativa (ejemplo)
| Métrica | OpenAI (chat.completions) | Gemini (OpenRouter free) | Claude (OpenRouter/Anthropic) |
|---|---:|---:|---:|
| Total tokens | 120 | 115 | 130 |
| Tiempo (s) | 1.2 | 1.0 | 1.4 |
| Calidad explicación (/10) | 9 | 8 | 9 |
| Calidad ejemplo (/10) | 9 | 8 | 9 |
| Calidad general (/10) | 9 | 8 | 9 |

## Conclusiones
- **Más rápido:** Gemini (según medición).  
- **Mejor balance general:** OpenAI / Claude (explicación + ejemplo + estructura).  
- **Observación práctica:** si el objetivo es “respuesta rápida” → priorizar latencia; si es “explicación pedagógica” → priorizar calidad.

---

# Ejercicio 3 — Chatbot con memoria (historial + recorte)

## 1) Implementación mínima (multi-turno con recorte)

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

MODEL = "google/gemini-2.0-flash-exp:free"

SYSTEM_PROMPT = "Eres un tutor de Python amigable, paciente y claro."
MAX_MESSAGES = 10  # mensajes no-system

def create_initial_messages():
    return [{"role": "system", "content": SYSTEM_PROMPT}]

def trim_history(messages):
    # Mantener system + últimos MAX_MESSAGES mensajes
    if len(messages) - 1 > MAX_MESSAGES:
        return [messages[0]] + messages[-MAX_MESSAGES:]
    return messages

def chat(messages, user_text: str, temperature: float = 0.3):
    messages.append({"role": "user", "content": user_text})
    messages = trim_history(messages)

    resp = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=temperature
    )
    assistant_text = resp.choices[0].message.content
    messages.append({"role": "assistant", "content": assistant_text})
    return assistant_text, messages

if __name__ == "__main__":
    msgs = create_initial_messages()
    ans, msgs = chat(msgs, "Explícame qué es una lista en Python con un ejemplo corto.")
    print(ans)
    ans, msgs = chat(msgs, "Ahora dame un ejemplo con append y otra con comprehension.")
    print(ans)
```

## 2) Observaciones
- El modelo “recuerda” el contexto **solo** si se reenvía el historial en cada llamada.
- Si se recorta con `MAX_MESSAGES` muy bajo, pueden perderse detalles necesarios (p. ej., definiciones previas o requisitos).

## 3) Pregunta clave: ¿Por qué las APIs no mantienen estado?
Las APIs suelen ser **stateless**: cada request es independiente. Mantener estado dentro del proveedor complicaría privacidad, escalabilidad y costos; por eso la memoria se implementa en el cliente (historial, resúmenes, embeddings + vector DB).

---

# Ejercicio 4 — Extracción estructurada (JSON)

## 1) Prompt recomendado (robusto) + esquema

**Instrucción:**
- Devuelve **solo** JSON válido.
- Si falta un campo, usa `null` o `"No especificado"` (según campo).
- No inventes datos.

**Esquema objetivo:**
- puesto (str)
- empresa (str)
- ubicacion (str)
- salario_min (int|null)
- salario_max (int|null)
- modalidad (str)
- requisitos (list[str])
- beneficios (list[str])
- contacto (str|null)
- fecha_limite (str|null, YYYY-MM-DD)

## 2) Ejemplo de salida (oferta de empleo)

```json
{
  "puesto": "Desarrollador Senior Python",
  "empresa": "No especificado",
  "ubicacion": "Madrid",
  "salario_min": 45000,
  "salario_max": 55000,
  "modalidad": "Híbrido",
  "requisitos": ["5 años experiencia", "Django", "PostgreSQL"],
  "beneficios": ["Teletrabajo", "Seguro médico"],
  "contacto": "empleo@techcorp.es",
  "fecha_limite": "2025-03-15"
}
```

## 3) Análisis
- La salida cumple JSON válido y tipos básicos (enteros para salario).
- “No especificado” se usa cuando el texto no menciona empresa.
- Para mayor robustez: usar validación con `jsonschema` y re-prompting si falla.

---

# Ejercicio 5 — Introducción a LangChain

## 1) Chain mínima (conceptual)
```python
# Idea: prompt -> modelo -> parser
chain = prompt | model | StrOutputParser()
```

## 2) Comparativa rápida

| Aspecto | API nativa | LangChain |
|---|---|---|
| Boilerplate | Alto | Bajo |
| Modularidad | Media | Alta |
| Cambiar modelo | Manual | Más directo |
| Curva de aprendizaje | Baja | Media |

## 3) Reflexión
LangChain aporta valor cuando hay pipelines (RAG, herramientas, chaining, memory) y se reutilizan componentes. En scripts muy simples, la API directa es más ligera.

---

# Ejercicio Extra — Cliente multi-proveedor (idea + esqueleto)

## Objetivo
Unificar llamadas a proveedores distintos (OpenAI/OpenRouter/Anthropic/Gemini) con una interfaz común y adaptación de mensajes.

## Esqueleto de clase (simplificado)
```python
class LLMClient:
    def __init__(self, provider: str, api_key: str, base_url: str | None = None, model: str | None = None):
        self.provider = provider
        self.api_key = api_key
        self.base_url = base_url
        self.model = model

    def chat(self, messages, temperature=0.7):
        # Normalizar messages y delegar a SDK correspondiente
        raise NotImplementedError
```

## Conclusión
Una capa de abstracción reduce “vendor lock-in”: permite cambiar proveedor sin tocar la lógica de negocio (solo configuración).
