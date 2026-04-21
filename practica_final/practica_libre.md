# Práctica Libre - Proyecto Final Integrador

## Aprendizaje Automático 2

---

## Información General

| Campo | Valor |
|-------|-------|
| **Tipo** | Proyecto libre individual o en parejas (max. 2 personas) |
| **Peso** | Complementario a las practicas de unidad (2/10) |
| **Entrega** | Repositorio GitHub (publico o privado con acceso al profesor) |
| **Fecha límite** | Consultar calendario del curso |

---

## Objetivo

Diseñar y construir un **proyecto funcional de IA generativa** que integre conocimientos de al menos **3 unidades del curso**. El alumno tiene libertad para elegir la temática, las herramientas y el enfoque, siempre que el resultado demuestre comprension práctica de los conceptos estudiados.

---

## Reglas del Proyecto

### 1. Cobertura mínima obligatoria

El proyecto debe integrar conceptos de **al menos 3 de las 6 unidades** del curso. A continuacion se indica que cuenta como cobertura de cada unidad:

| Unidad | Tema | Se demuestra si el proyecto... |
|--------|------|-------------------------------|
| **U1** | IA Generativa y LLMs | Utiliza al menos un LLM (GPT, Claude, Gemini, LLaMA, etc.) de forma justificada, demostrando comprension del modelo elegido |
| **U2** | Prompt Engineering | Incluye prompts estructurados con tecnicas avanzadas (few-shot, chain-of-thought, system prompts) y justifica su diseno |
| **U3** | Transformers y APIs | Accede programaticamente a un LLM via API (OpenAI, Anthropic, Gemini, OpenRouter) con manejo de respuestas y errores |
| **U4** | Agentes y Automatizacion | Implementa un agente con capacidad de decision autonoma, function calling, o un workflow automatizado en n8n |
| **U5** | RAG y Bases Vectoriales | Incorpora un pipeline RAG con ingesta de documentos, embeddings, base vectorial y recuperacion semantica |
| **U6** | MCP (Model Context Protocol) | Implementa un servidor o cliente MCP con tools, resources o prompts |

### 2. Repositorio GitHub obligatorio

La entrega es exclusivamente a traves de un repositorio en GitHub. El repositorio debe cumplir:

- **README.md completo** (ver seccion de estructura mas abajo)
- **Codigo organizado** en carpetas logicas
- **Historial de commits** coherente (no un unico commit con todo el codigo)
- **Sin credenciales** en el repositorio (usar `.env.example` o documentar la configuracion necesaria)
- **`.gitignore`** apropiado (excluir `.env`, `node_modules/`, `__pycache__/`, bases de datos locales, etc.)

### 3. Originalidad

- El proyecto debe ser **original**. No se acepta "copiar" una práctica de unidad y presentarla como proyecto libre.
- Se permite reutilizar fragmentos de código de las prácticas de clase como punto de partida, pero el proyecto debe aportar algo nuevo (distinta temática, combinación de tecnologías, funcionalidad adicional).
- Si se trabaja en pareja, la contribucion de ambos miembros debe ser visible en el historial de commits.

### 4. Documentación funcional

No se pide un informe academico extenso. Se pide un **README.md** que permita a cualquier persona entender, instalar y probar el proyecto.

---

## Estructura del Repositorio

```
nombre-del-proyecto/
├── README.md                # Documentación principal (ver plantilla)
├── .gitignore               # Archivos excluidos del repositorio
├── .env.example             # Plantilla de variables de entorno (sin claves reales)
├── requirements.txt         # Dependencias Python (o package.json si aplica)
├── src/                     # Código fuente principal
│   └── ...
├── docs/                    # Capturas de pantalla, diagramas (opcional)
│   └── ...
└── workflows/               # Workflows n8n exportados en JSON (si aplica)
    └── ...
```

### Plantilla del README.md

El README del proyecto debe incluir como mínimo las siguientes secciones:

```markdown
# Nombre del Proyecto

Descripcion breve del proyecto (2-3 frases).

## Unidades del curso aplicadas

- **Unidad X:** [Explicar cómo se aplica en el proyecto]
- **Unidad Y:** [Explicar cómo se aplica en el proyecto]
- **Unidad Z:** [Explicar cómo se aplica en el proyecto]

## Arquitectura

Diagrama o descripción del flujo del sistema.
(Puede ser un diagrama en texto, una imagen, o una descripción paso a paso)

## Tecnologías utilizadas

- [Listar tecnologías, frameworks, APIs, etc.]

## Instalación y configuración

Pasos para que otra persona pueda ejecutar el proyecto desde cero.

## Uso

Instrucciones para usar el proyecto con ejemplos concretos.

## Capturas / Demo

Capturas de pantalla o GIFs del proyecto funcionando.
(Mínimo 3 capturas que demuestren funcionalidad real)

## Decisiones técnicas

Justificación breve de las decisiones mas importantes:
- Por qué se eligió este modelo/API
- Parámetros de configuración relevantes (temperatura, chunk size, k, etc.)
- Dificultades encontradas y cómo se resolvieron

## Posibles mejoras

Al menos 2 mejoras que se implementarían con más tiempo.

## Autor(es)

- Nombre y apellidos
- (Si es en pareja) Nombre y apellidos del compañero/a
```

---

## Ideas de Proyecto (orientativas)

Estas son solo sugerencias para inspirarse. El alumno puede proponer cualquier proyecto que cumpla las reglas.

| Idea | Unidades que cubre | Descripción |
|------|--------------------|-------------|
| **Chatbot especializado con RAG** | U1, U2, U3, U5 | Asistente que responde preguntas sobre un dominio especifico (normativa, manual tecnico, apuntes de una asignatura) usando RAG |
| **Agente de investigacion automatizado** | U1, U3, U4 | Agente que recibe un tema, busca informacion vía APIs, la sintetiza y genera un informe |
| **Servidor MCP para una API publica** | U1, U3, U6 | Servidor MCP que expone datos de una API pública (clima, noticias, deportes, criptomonedas) como tools y resources para Claude Desktop |
| **Pipeline de automatizacion con n8n + LLM** | U1, U2, U4 | Workflow en n8n que automatiza un proceso real: clasificacion de emails, resumen de noticias diarias, alertas inteligentes |
| **RAG + MCP: base de conocimiento accesible** | U3, U5, U6 | Sistema RAG completo expuesto como servidor MCP para que cualquier cliente MCP pueda consultar la base de conocimiento |
| **Agente multi-herramienta en n8n** | U2, U4, U5 | Agente con acceso a múltiples herramientas (buscador, calculadora, base vectorial) que resuelve tareas complejas paso a paso |
| **Comparador de LLMs** | U1, U2, U3 | Aplicación que envía el mismo prompt a múltiples LLMs (vía API) y compara las respuestas en calidad, velocidad y coste |
| **Asistente de codigo con RAG** | U2, U3, U5 | Sistema que indexa la documentación de un framework y responde preguntas técnicas con codigo de ejemplo |

---

## Rúbrica de Evaluación

### Criterios principales (sobre 10 puntos)

| Criterio | Descripción | Puntos |
|----------|-------------|--------|
| **Funcionalidad** | El proyecto funciona correctamente y hace lo que dice el README. Se puede ejecutar siguiendo las instrucciones. | **3** |
| **Integracion de unidades** | Demuestra comprensión práctica de al menos 3 unidades del curso. La integración es coherente, no forzada. | **3** |
| **Calidad del código** | Codigo organizado, legible, con estructura logica. Uso apropiado de las herramientas y frameworks elegidos. | **1.5** |
| **Documentación (README)** | README completo según la plantilla: instalación clara, capturas reales, decisiones justificadas. | **1.5** |
| **Repositorio GitHub** | Historial de commits coherente, `.gitignore` correcto, sin credenciales expuestas, estructura de carpetas ordenada. | **1** |
| **TOTAL** | | **10** |

### Detalle por nivel de desempeño

#### Funcionalidad (3 puntos)

| Nivel | Puntos | Descripción |
|-------|--------|-------------|
| Excelente | 2.5 - 3 | El proyecto funciona sin errores, gestiona casos límite y la experiencia de uso es fluida |
| Bueno | 1.5 - 2.4 | Funciona correctamente en el caso principal, puede tener errores menores en casos límite |
| Básico | 0.5 - 1.4 | Funciona parcialmente, requiere ajustes manuales o tiene errores que limitan el uso |
| Insuficiente | 0 - 0.4 | No funciona o no se puede ejecutar siguiendo las instrucciones del README |

#### Integración de unidades (3 puntos)

| Nivel | Puntos | Descripción |
|-------|--------|-------------|
| Excelente | 2.5 - 3 | 4+ unidades integradas de forma natural. Se evidencia comprensión profunda de cada una |
| Bueno | 1.5 - 2.4 | 3 unidades integradas correctamente. El alumno demuestra que entiende los conceptos |
| Básico | 0.5 - 1.4 | 3 unidades presentes pero la integracion es superficial o forzada |
| Insuficiente | 0 - 0.4 | Menos de 3 unidades cubiertas, o la integracion no demuestra comprensión |

#### Calidad del codigo (1.5 puntos)

| Nivel | Puntos | Descripcion |
|-------|--------|-------------|
| Excelente | 1.2 - 1.5 | Código limpio, modular, con nombres descriptivos. Buen uso de las librerias elegidas |
| Bueno | 0.7 - 1.1 | Código funcional y razonablemente organizado |
| Basico | 0.3 - 0.6 | Código desordenado pero funcional. Todo en un unico archivo sin estructura |
| Insuficiente | 0 - 0.2 | Código incoherente, con fragmentos sin usar o errores evidentes |

#### Documentacion (1.5 puntos)

| Nivel | Puntos | Descripcion |
|-------|--------|-------------|
| Excelente | 1.2 - 1.5 | README completo, capturas reales, instrucciones probadas, decisiones técnicas bien argumentadas |
| Bueno | 0.7 - 1.1 | README con las secciones principales cubiertas, al menos 3 capturas |
| Basico | 0.3 - 0.6 | README incompleto, faltan capturas o las instrucciones no permiten reproducir el proyecto |
| Insuficiente | 0 - 0.2 | Sin README o README genérico que no describe el proyecto real |

#### Repositorio GitHub (1 punto)

| Nivel | Puntos | Descripcion |
|-------|--------|-------------|
| Excelente | 0.8 - 1 | Múltiples commits descriptivos, `.gitignore` correcto, sin secretos, estructura clara |
| Bueno | 0.5 - 0.7 | Varios commits, estructura razonable, `.gitignore` presente |
| Basico | 0.2 - 0.4 | Pocos commits o commits genericos ("update", "fix"), estructura mejorable |
| Insuficiente | 0 - 0.1 | Commit único, credenciales expuestas, o entrega fuera de GitHub |

### Bonificaciones (hasta +1 punto adicional)

| Bonificacion | Descripcion | Puntos extra |
|--------------|-------------|--------------|
| **Despliegue** | Proyecto desplegado y accesible (Koyeb, Render, Railway, etc.) con URL funcional | **+0.25** |
| **Canal de comunicacion** | Integracion con Telegram, WhatsApp, Slack u otro canal de mensajeria | **+0.25** |
| **4+ unidades** | Cubrir 4 o mas unidades del curso de forma coherente | **+0.25** |
| **Demo en video** | Video corto (max. 3 min) mostrando el proyecto en funcionamiento | **+0.25** |

> **Nota:** La puntuacion maxima con bonificaciones es 10 + 1 = 11, pero la nota final se limitará a 10.

---

## Proceso de Entrega

### Paso 1: Crear el repositorio

1. Crear un repositorio en GitHub (publico o privado)
2. Si es privado, anadir al profesor como colaborador: **`rpmaya`**
3. Nombre sugerido del repositorio: `ml2-practica-libre` o similar

### Paso 2: Desarrollo

1. Trabajar con commits frecuentes y descriptivos
2. No dejar todo para un unico commit final
3. Usar ramas si se desea (no obligatorio)

### Paso 3: Entrega

1. Verificar que el README esta completo y las instrucciones funcionan
2. Verificar que no hay credenciales en el repositorio
3. Compartir la URL del repositorio en Blackboard antes de la fecha limite

**Formato de entrega en Blackboard:**

```
URL: https://github.com/usuario/nombre-del-repositorio/practica-final
Autor(es): Nombre Apellido (y compañero/a si aplica)
```

---

## Preguntas Frecuentes

**¿Puedo usar herramientas o APIs que no se vieron en clase?**
Sí, siempre que el núcleo del proyecto demuestre dominio de las tecnologías del curso. Usar herramientas adicionales se valora positivamente.

**¿Puedo usar modelos locales (Ollama, LM Studio)?**
Sí. Usar modelos locales es perfectamente válido y puede ser un punto a favor en las decisiones técnicas.

**¿Es obligatorio usar Python?**
No. Puedes usar cualquier lenguaje o herramienta (Python, JavaScript, n8n, etc.) siempre que el proyecto sea funcional y reproducible.

**¿Puedo hacer el proyecto sobre un tema personal o profesional?**
Sí, y es lo mas recomendable. Proyectos con motivación real suelen ser mejores.

**¿Qué pasa si mi proyecto es ambicioso pero no funciona al 100%?**
Se valora más un proyecto con alcance moderado que funcione bien, que uno muy ambicioso que no se pueda ejecutar. Funcionalidad es el criterio con mas peso (3 puntos).

**¿Puedo usar codigo generado por IA (ChatGPT, Copilot, Claude)?**
Sí, pero debes entender el código que entregas. En la seccion de decisiones técnicas del README, indica qué partes se apoyaron en herramientas de IA y qué modificaciones hiciste. El historial de commits debe reflejar trabajo progresivo, no un único bloque generado.

**¿Qué pasa si trabajo en pareja y mi compañero no contribuye?**
Los commits de GitHub reflejan quien contribuyó. Si un miembro no tiene commits significativos, su nota se ajustará proporcionalmente.

