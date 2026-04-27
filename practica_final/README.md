# CV TalentMatch

Asistente inteligente de reclutamiento que analiza CVs (en texto, PDF o audio) y los cruza automáticamente contra una base vectorial de vacantes, devolviendo un ranking de coincidencias con feedback personalizado. Todo el pipeline está construido sobre n8n e integra LLMs, RAG, agentes y un canal de comunicación externo (WhatsApp).

---

## Unidades del curso aplicadas

Este proyecto integra **5 de las 6 unidades** del curso:

- **Unidad 1 — IA Generativa y LLMs:** se utiliza **GPT-5-mini** como modelo principal en dos puntos del flujo: como Chat Model del AI Agent (razonamiento y uso de herramientas) y como LLM de reformateo posterior (decidir si la respuesta se devuelve como texto o audio). Se usa también **Whisper** (speech-to-text) y **TTS (voice=fable)** de OpenAI para el canal multimodal.

- **Unidad 2 — Prompt Engineering:** el AI Agent recibe un **system prompt estructurado** con rol definido, capacidades disponibles, instrucciones numeradas, restricciones (caracteres prohibidos, idiomas, no inventar información) y formato de salida obligatorio. El segundo LLM de reformateo recibe un prompt en cadena (chain-of-thought) que reutiliza la salida del agente y genera la decisión final de formato audio/texto.

- **Unidad 3 — Transformers y APIs:** acceso programático a la API de OpenAI desde n8n para chat completion, embeddings (`text-embedding-ada-002`), transcripción (Whisper) y síntesis de voz (TTS). Manejo de respuestas binarias (audio OGG entrada, audio generado salida).

- **Unidad 4 — Agentes y Automatización:** el núcleo del proyecto es un **AI Agent de n8n** con capacidad de decisión autónoma y **function calling** sobre una herramienta de tipo Vector Store (`retrieve-as-tool`). El agente decide cuándo consultar la base vectorial según el CV recibido. Además, todo el workflow automatiza el proceso completo: recepción, enrutado por tipo de input, transcripción de audio, análisis, reformateo y respuesta multicanal.

- **Unidad 5 — RAG y Bases Vectoriales:** sistema RAG completo con dos workflows separados:
  - **Ingesta:** Google Drive Trigger → extracción PDF → chunking (`RecursiveCharacterTextSplitter`, chunk_size=300, overlap=50) → embeddings OpenAI → inserción en Supabase.
  - **Recuperación:** el AI Agent usa la tabla `N8n` de Supabase como tool con `topK=300`, recupera los chunks semánticamente relevantes y los inyecta como contexto para el ranking de vacantes.

> Unidad 6 (MCP) no se cubre en esta versión.

---

## Arquitectura

### Diagrama general

```
                    ┌─────────────────────────────────┐
                    │      WORKFLOW 1: INGESTA        │
                    │  (Subir Vacantes a Supabase)    │
                    └─────────────────────────────────┘

  [Google Drive Trigger / Webhook]
          │
          ▼
  [Edit Fields] ─── extrae id + nombre del fichero
          │
          ▼
  [Switch] ─── rama por mimeType (PDF / DOCS)
          │
          ▼
  [Extract from File] ─── texto plano del PDF
          │
          ▼
  [Recursive Text Splitter] ─── chunk_size=300, overlap=50
          │
          ▼
  [Default Data Loader] ─── añade metadata (id, nombre)
          │
          ▼
  [Embeddings OpenAI] ─── ada-002 (1536 dims)
          │
          ▼
  [Supabase Vector Store] ─── tabla N8n (INSERT)
```

```
                    ┌─────────────────────────────────┐
                    │   WORKFLOW 2: CV TALENTMATCH    │
                    │    (Agente de reclutamiento)    │
                    └─────────────────────────────────┘

  [Webhook POST] ← WhatsApp / HTTP externo
          │
          ▼
  [Switch] ─── enruta por tipo de input
    ├── PDF   ──► [Extract from File] ──┐
    ├── Texto ──────────────────────────┼──► [Mapeo de mensaje]
    └── Audio ──► [Convert to File] ──► [Transcribir (Whisper)] ──┘
                                                    │
                                                    ▼
                                            [AI Agent1 + Tool RAG]
                                            ├── Chat Model: GPT-5-mini
                                            ├── Tool: Supabase N8n (topK=300)
                                            └── Embeddings: OpenAI ada-002
                                                    │
                                                    ▼
                                            [Limpiamos el texto]
                                                    │
                                                    ▼
                                            [OpenAI (GPT-5-mini)]
                                            ranking + decisión Audio/Texto
                                                    │
                                                    ▼
                                               [Switch1]
                                            ├── Texto ─► [Edit Fields] ─► [Respond Webhook]
                                            └── Audio ─► [Limpiar] ─► [TTS fable] ─► [Extract Binary] ─► [Respond Webhook]
```

### Resumen del flujo

1. El usuario envía su CV por WhatsApp/HTTP (PDF, texto o nota de voz).
2. El workflow detecta el formato y normaliza a texto plano (Whisper si es audio).
3. El AI Agent analiza el CV, consulta la base vectorial de ofertas (Supabase) vía función y redacta un análisis.
4. Un segundo LLM genera el ranking final y decide si la respuesta debe entregarse como texto o audio.
5. Si es audio, se genera con TTS de OpenAI y se devuelve como fichero binario; si es texto, se responde en JSON.

---

## Tecnologías utilizadas

| Categoría | Tecnología |
|---|---|
| Orquestación | n8n (workflows) |
| LLM | OpenAI GPT-5-mini |
| Embeddings | OpenAI `text-embedding-ada-002` |
| Speech-to-Text | OpenAI Whisper |
| Text-to-Speech | OpenAI TTS (voz `fable`) |
| Base vectorial | Supabase (tabla `N8n`, extensión pgvector) |
| Fuente de ofertas | Google Drive (Trigger) |
| Canal externo | WhatsApp Cloud API (vía webhook) |

---

## Instalación y configuración

### Requisitos previos

- Instancia de n8n (cloud o self-hosted)
- Cuenta OpenAI con acceso a GPT-5-mini, embeddings, Whisper y TTS
- Proyecto Supabase con extensión `pgvector` habilitada y tabla `N8n` creada
- Base de datos Postgres (puede ser la misma de Supabase) para la memoria del agente
- Carpeta en Google Drive con las ofertas de empleo (PDFs)
- (Opcional) Cuenta de WhatsApp Business para el canal de comunicación

### Paso 1 — Crear tabla vectorial en Supabase

En el SQL Editor de Supabase:

```sql
-- Habilitar la extensión vector
create extension if not exists vector;

-- Tabla para almacenar embeddings
create table N8n (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(1536)
);

-- Función de búsqueda por similitud
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default 5,
  filter jsonb default '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
) language plpgsql as $$
begin
  return query
  select id, content, metadata,
         1 - (N8n.embedding <=> query_embedding) as similarity
  from N8n
  where metadata @> filter
  order by N8n.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

### Paso 2 — Configurar credenciales en n8n

Crear las siguientes credenciales:

- **OpenAi account** → API Key de OpenAI
- **Supabase account** → URL del proyecto + Service Role Key
- **Postgres account** → host, puerto, usuario, contraseña, base de datos
- **Google Drive account** (OAuth2) para el trigger del workflow de ingesta

### Paso 3 — Importar los workflows

1. En n8n → **Workflows → Import from File**
2. Importar `workflows/subir_vacantes.json` (ingesta)
3. Importar `workflows/cv_talentmatch.json` (chatbot)
4. En ambos, reasignar las credenciales importadas
5. Activar los dos workflows

### Paso 4 — Variables / endpoints

Los dos webhooks quedan expuestos en estas rutas (los paths reales los genera n8n):

- **Ingesta** → `POST /webhook/09dc0fb3-b413-420b-9217-a2fbbecc803a`
- **Chat TalentMatch** → `POST /webhook/2764b1cc-570d-4003-827f-7931b73a2b02`

Ver `.env.example` para los valores que debes configurar.

---

## Uso

### Cargar vacantes en la base vectorial

Subir los PDFs de ofertas a la carpeta vigilada por el Google Drive Trigger. Cada vez que se añada un fichero, el workflow de ingesta se ejecuta automáticamente: extrae el texto, lo fragmenta en chunks de 300 caracteres, genera los embeddings y los inserta en Supabase con metadatos (`id`, `nombre` del fichero).

### Consultar el asistente (texto)

```bash
curl -X POST https://tu-n8n.com/webhook/2764b1cc-570d-4003-827f-7931b73a2b02 \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Tengo 3 años como desarrollador backend en Python/Django, inglés B2, experiencia con PostgreSQL y AWS. ¿Qué vacantes encajan con mi perfil?"
  }'
```

Respuesta esperada: ranking con coincidencias altas / medias / sin coincidencia, skills faltantes y feedback.

### Consultar en audio

Enviar una nota de voz por WhatsApp con el mismo tipo de pregunta. El pipeline:
1. Recibe el audio OGG
2. Lo transcribe con Whisper
3. Procesa el CV igual que en texto
4. Si el usuario pide la respuesta en audio (o menciona "respuesta en audio"), genera el audio con TTS y lo devuelve

### Enviar CV en PDF

Enviar el PDF adjunto al webhook. El workflow extrae el texto del PDF automáticamente antes de pasarlo al agente.

---

## Capturas / Demo

> Capturas disponibles en la carpeta `docs/`:

- `docs/arquitectura_general.png` — diagrama completo del workflow principal (CV TalentMatch) en n8n
- `docs/arquitectura_subir_archivos.png` — diagrama del workflow de ingesta (Subir Vacantes) en n8n
- `docs/demo_texto.png` — ejemplo de consulta por texto con respuesta ranking
- `docs/demo_pdf.png` — envío de CV en PDF y análisis generado
- `docs/supabase_vectores.png` — vectores almacenados en la tabla `N8n`

---

## Decisiones técnicas

### Modelo LLM
Se eligió **GPT-5-mini** por ofrecer buen equilibrio coste/calidad para tareas de análisis y razonamiento estructurado. El mismo modelo se usa dos veces en el pipeline: primero como cerebro del agente (con acceso a tool de RAG) y después como reformateador de la salida final. Esta separación permite que el primer paso sea "libre" de razonamiento y el segundo se centre únicamente en formato de salida.

### Base vectorial
**Supabase** en lugar de Pinecone/Chroma porque:
- Ya se usa Postgres para la memoria del agente → una sola base de datos gestionada
- Integración nativa con n8n vía nodo `@n8n/n8n-nodes-langchain.vectorStoreSupabase`
- Facilidad para añadir filtros por metadata (`id`, `nombre` de oferta) en producción

### Parámetros de chunking
- `chunk_size=300` con `chunk_overlap=50`
- Tamaño pequeño porque las ofertas de empleo tienen secciones muy diferenciadas (requisitos, descripción, beneficios) y chunks pequeños favorecen la precisión del retriever
- Overlap del ~16% para no cortar frases completas entre chunks adyacentes

### topK = 300
Valor alto porque el agente compara el CV con TODAS las vacantes almacenadas y necesita cobertura total para generar el ranking. A diferencia de un RAG clásico (3-5 chunks), aquí queremos máxima recall.

### Arquitectura multicanal
El Switch inicial permite unificar tres formatos de entrada (PDF, texto, audio) en un único flujo, evitando duplicar la lógica del agente. El mismo patrón se aplica en la salida (Switch1) para decidir entre texto y audio según preferencia del usuario.

### Dificultades encontradas
- **Limpieza de texto antes de TTS:** la API de TTS de OpenAI tiene un límite de 4096 caracteres y no acepta ciertos caracteres especiales, por eso existe un nodo `Code` que limpia el texto (elimina HTML, saltos de línea, símbolos) antes de generar el audio.
- **Sustitución de dígitos por letras en audio:** se reemplazan números por letras antes del TTS porque la voz en español pronunciaba mal ciertas secuencias numéricas.

---

## Posibles mejoras

1. **Exponer el RAG como servidor MCP (Unidad 6):** añadir un servidor MCP que exponga las vacantes como resource y la búsqueda semántica como tool, permitiendo que Claude Desktop u otros clientes MCP consulten la base de ofertas.

2. **Filtrado previo por metadata antes del RAG:** actualmente el agente recupera con `topK=300` sin filtros. Añadir un paso de clasificación previa (área, seniority, localización) para reducir el espacio de búsqueda mejoraría latencia y precisión.

3. **Caché de embeddings de CVs:** guardar el embedding del CV del usuario en Postgres para futuras consultas, evitando regenerarlo en cada interacción.

4. **Reranking con Cross-Encoder:** aplicar un modelo de reranking (BGE-reranker o similar) sobre los chunks recuperados para mejorar la calidad del ranking final.

5. **Dashboard de métricas:** página web que muestre estadísticas del sistema (número de CVs procesados, tasa de match alta/media/baja, skills más demandadas) usando los datos almacenados en Postgres.

6. **Memoria conversacional:** integrar un nodo de `Postgres Chat Memory` al AI Agent para que el asistente recuerde las conversaciones previas del mismo usuario (ej. "muéstrame más vacantes como la última que me enseñaste").

---

## Autor

**Alberto Coca González**
Aprendizaje Automático 2 — Práctica Libre (Proyecto Final Integrador)
