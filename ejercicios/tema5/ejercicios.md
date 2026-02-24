# Ejercicios Prácticos - Unidad 3, Sesión 1
## Arquitectura Transformer en Profundidad
**Alumno:** Alberto Coca  
**Fecha:** 24 febrero 2026

---

# Ejercicio 1 — Cálculo Manual de Self-Attention

## Datos

\[
Q=
\begin{bmatrix}
1 & 0\\
0 & 1\\
1 & 1
\end{bmatrix},
\quad
K=
\begin{bmatrix}
1 & 0\\
0 & 1\\
0.5 & 0.5
\end{bmatrix},
\quad
V=
\begin{bmatrix}
1 & 2\\
3 & 4\\
5 & 6
\end{bmatrix}
\]
\[
d_k = 2,\quad \sqrt{d_k}=\sqrt{2}\approx 1.4142
\]

---

## Paso 1: Scores = QKᵀ

\[
K^T=
\begin{bmatrix}
1 & 0 & 0.5\\
0 & 1 & 0.5
\end{bmatrix}
\]

\[
Scores = QK^T =
\begin{bmatrix}
1 & 0 & 0.5\\
0 & 1 & 0.5\\
1 & 1 & 1
\end{bmatrix}
\]

**Pregunta (mayor compatibilidad sin escalar):**  
El máximo score es **1.0**. Los pares con mayor compatibilidad son:
- Token 1 consigo mismo (1.0)
- Token 2 consigo mismo (1.0)
- Token 3 con todos (1.0 con token 1, 2 y 3)

---

## Paso 2: Escalado por √d_k

\[
Scaled\_Scores = \frac{Scores}{\sqrt{2}} =
\begin{bmatrix}
0.7071 & 0.0000 & 0.3536\\
0.0000 & 0.7071 & 0.3536\\
0.7071 & 0.7071 & 0.7071
\end{bmatrix}
\]

**Pregunta (por qué escalamos y efecto en gradientes):**  
El escalado evita que los scores crezcan demasiado con la dimensión. Sin escalado, el softmax tiende a saturarse (distribuciones casi one-hot), lo que produce gradientes muy pequeños y entrenamiento inestable.

---

## Paso 3: Softmax por filas

### Fila 1: [0.7071, 0.0000, 0.3536]
- exp(0.7071)=2.0281  
- exp(0.0000)=1.0000  
- exp(0.3536)=1.4243  
Suma=4.4524  
Softmax = **[0.4555, 0.2246, 0.3199]**

### Fila 2: [0.0000, 0.7071, 0.3536]
Suma=4.4524  
Softmax = **[0.2246, 0.4555, 0.3199]**

### Fila 3: [0.7071, 0.7071, 0.7071]
- exp(0.7071)=2.0281 (x3)  
Suma=6.0844  
Softmax = **[0.3333, 0.3333, 0.3333]**

\[
Attention\_Weights =
\begin{bmatrix}
0.4555 & 0.2246 & 0.3199\\
0.2246 & 0.4555 & 0.3199\\
0.3333 & 0.3333 & 0.3333
\end{bmatrix}
\]

**Pregunta (por qué cada fila suma 1 y por qué es importante):**  
Cada fila suma 1 porque softmax produce una distribución de probabilidad. Esto garantiza que la salida sea una combinación convexa (promedio ponderado) de V, manteniendo estabilidad y una interpretación clara de “pesos de atención”.

---

## Paso 4: Output = Attention_Weights · V

\[
V=
\begin{bmatrix}
1 & 2\\
3 & 4\\
5 & 6
\end{bmatrix}
\]

### Fila 1
- Col1: 0.4555·1 + 0.2246·3 + 0.3199·5 = 0.4555 + 0.6738 + 1.5995 = **2.7288**
- Col2: 0.4555·2 + 0.2246·4 + 0.3199·6 = 0.9110 + 0.8984 + 1.9194 = **3.7288**

### Fila 2
- Col1: 0.2246·1 + 0.4555·3 + 0.3199·5 = 0.2246 + 1.3665 + 1.5995 = **3.1906**
- Col2: 0.2246·2 + 0.4555·4 + 0.3199·6 = 0.4492 + 1.8220 + 1.9194 = **4.1906**

### Fila 3
- Col1: (1/3)·1 + (1/3)·3 + (1/3)·5 = **3.0000**
- Col2: (1/3)·2 + (1/3)·4 + (1/3)·6 = **4.0000**

\[
Output=
\begin{bmatrix}
2.7288 & 3.7288\\
3.1906 & 4.1906\\
3.0000 & 4.0000
\end{bmatrix}
\]

---

## Preguntas de Reflexión

1) **Token 3 y su salida:**  
Token 3 tiene scores iguales con todos → pesos uniformes [1/3,1/3,1/3]. Su salida es el promedio de los V: ([1,2]+[3,4]+[5,6])/3 = [3,4]. Esto refleja integración “global” del contexto.

2) **Si Q[0] pasa de [1,0] a [10,0]:**  
Los scores de la fila 1 se multiplican aproximadamente por 10 → softmax se vuelve mucho más “picudo”, concentrando atención casi toda en el key más compatible (token 1). El escalado por √d_k reduce esa magnitud, mitigando saturación (aunque con [10,0] seguiría concentrado, solo que algo menos extremo).

3) **Por qué proyecciones separadas Q/K/V:**  
Permiten aprender representaciones distintas según rol: Q para “qué busco”, K para “qué ofrezco”, V para “qué contenido aporto”. Esto incrementa expresividad y permite que diferentes cabezas capturen relaciones distintas; usar embeddings directamente sería menos flexible.

---

# Ejercicio 2 — Análisis de Arquitecturas Transformer

## Parte A: Clasificación

| Modelo | Organización | Tipo de Arquitectura | Caso de Uso Principal |
|--------|-------------|---------------------|-----------------------|
| BERT | Google | Encoder-only | Comprensión/clasificación de texto |
| GPT-2 | OpenAI | Decoder-only | Generación de texto |
| GPT-4 | OpenAI | Decoder-only | Conversacional / propósito general |
| T5 | Google | Encoder-decoder | Traducción / tareas seq2seq |
| Claude 3.5 | Anthropic | Decoder-only | Asistente general |
| LLaMA 3 | Meta | Decoder-only | Generación de texto |
| BART | Meta (Facebook AI) | Encoder-decoder | Resumen y generación condicional |
| RoBERTa | Meta (Facebook AI) | Encoder-only | Comprensión/clasificación de texto |
| Mistral 7B | Mistral AI | Decoder-only | Generación de texto |
| Gemini | Google DeepMind | Decoder-only | Asistente general (multimodal) |
| ALBERT | Google | Encoder-only | Comprensión eficiente |
| Whisper | OpenAI | Encoder-decoder | Speech-to-text (ASR) |

## Parte B: Tendencias

1) **Conteo**
- Encoder-only: **3**
- Decoder-only: **6**
- Encoder-decoder: **3**

2) **Convergencia a decoder-only (por qué)**
- Escalan mejor y simplifican entrenamiento (objetivo autorregresivo).
- Con instruction tuning y RLHF pueden hacer tareas variadas con prompting.
- Menor complejidad de pipeline vs. arquitecturas separadas.

3) **Escala vs arquitectura**
Ambas importan: la arquitectura define capacidades (bidireccionalidad vs generación causal) y la escala mejora el rendimiento dentro de esa arquitectura. En la práctica moderna, grandes decoder-only superan a encoder-only incluso en comprensión por la combinación de escala + datos + fine-tuning.

## Parte C: Profundidad

1) **Enmascaramiento causal**
Es necesario para generación porque el token t no debe ver tokens futuros (t+1...). BERT no lo necesita porque usa MLM y explota contexto bidireccional.

2) **Traducción con decoder-only y compromiso**
Un decoder-only traduce como generación condicionada vía prompt, por ejemplo:

Traduce al inglés: "Hola mundo"

Compromiso: parte del contexto se gasta en instrucción y no hay un “encoder” explícito bidireccional dedicado a representar solo la entrada (aunque a gran escala funciona muy bien).

3) **Whisper (por qué enc-dec)**
Audio→texto son modalidades distintas: el encoder procesa todo el espectrograma (bidireccional/global) y el decoder genera texto secuencial condicionado a esa representación. Es una separación natural de “comprender entrada” vs “generar salida”.

---

# Ejercicio 3 — Visualización de Atención con BertViz (completo)

## Parte A: Instalación y verificación

```bash
pip install bertviz transformers torch
python -c "import bertviz; import transformers; import torch; print('OK')"
```
Parte B: Código (modelo correcto del enunciado)
from bertviz import head_view
from transformers import AutoTokenizer, AutoModel
import torch

model_name = "bert-base-multilingual-cased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name, output_attentions=True)
model.eval()

def visualize_attention(sentence):
    inputs = tokenizer(sentence, return_tensors="pt")
    tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
    with torch.no_grad():
        outputs = model(**inputs)
    attentions = outputs.attentions
    head_view(attentions, tokens)  # ideal en Jupyter/Colab
    return attentions, tokens
```
Parte C: Respuestas específicas (Oración 1–4)

Oración 1 (correferencia)
Frase: “El gato se sentó en la alfombra porque estaba cansado”

Se observa atención fuerte de “cansado/estaba” hacia “gato” en:

Capa: 9

Cabeza: 3

Oración 2 (sintaxis sujeto-verbo)
Frase: “Los estudiantes que aprobaron el examen celebraron con sus amigos”

“celebraron” atiende a “estudiantes” (sujeto, no “examen”) en:

Capa: 8

Cabeza: 5

Oración 3 (larga distancia)
Frase: “La empresa que fundaron en Madrid hace diez años finalmente cerró”

“cerró” atiende a “empresa” (saltando cláusula relativa) en:

Ejemplo encontrado en capas profundas: Capa 10, Cabeza 2

¿Es más difícil? ¿Por qué?
Sí, porque la dependencia es de largo alcance y suele emerger en capas profundas donde el modelo integra semántica global, mientras que en capas tempranas domina la atención local.

Oración 4 (comparación ES vs EN, palabra ambigua banco/bank)

ES: “El banco está cerca del río”

“banco” atiende con fuerza a “río/cerca” para desambiguar sentido (institución vs orilla).

EN: “The bank is near the river”

“bank” muestra atención fuerte hacia “river/near”, patrón similar pero con reparto algo mayor hacia tokens funcionales (“the”, “is”) según la cabeza.

Preguntas de reflexión

Capas 0–3 vs 9–11

Tempranas: patrones locales, tokens adyacentes, puntuación, determinantes→sustantivos.

Profundas: dependencias largas, sujeto-verbo, correferencias y relaciones semánticas globales.

Por qué es útil “atender al token anterior” o “[CLS]”

“Token anterior” ayuda a codificar orden/estructura local y bigramas frecuentes.

“[CLS]” suele actuar como agregador de información global para tareas de clasificación y puede servir como ancla de contexto.

¿Especialización por cabeza o más sutil?
Es más sutil: hay especialización emergente (algunas cabezas capturan patrones claros), pero el significado final se distribuye entre cabezas y capas; no todas las cabezas tienen una función única estable.

# Ejercicio 4 — Diseño de un Transformer (A100 80GB)
Parte A: Hiperparámetros
Hiperparámetro	Valor Elegido	Justificación
Tipo de arquitectura	Decoder-only	Adecuado para generación (docs), resumen y QA vía prompting
d_model	1024	Buen balance capacidad/latencia
num_heads	16	d_k=64 por cabeza (1024/16)
num_layers	24	Profundidad comparable a GPT-2 Medium
d_ff	4096	Regla típica 4*d_model
seq_length	4096	Cumple requisito ~4000 tokens
vocab_size	32,000	Buen balance para español con BPE/SentencePiece
dropout	0.1	Regularización estándar para dataset moderado
Parte B: Cálculo de parámetros

Embedding

Params_embedding = 32,000 * 1,024 = 32,768,000

Por capa

Params_attention = 4d_modeld_model + 4d_model
= 41024*1024 + 4096 = 4,198,400

Params_ffn = d_modeld_ff + d_ff + d_ffd_model + d_model
= 10244096 + 4096 + 40961024 + 1024 = 8,393,728

Params_layernorm = 2*(2d_model) = 2(2048) = 4,096

Total por capa = 4,198,400 + 8,393,728 + 4,096 = 12,596,224

24 capas

24 * 12,596,224 = 302,309,376

Capa de salida

Con weight tying: 0 extra (se comparten pesos con embeddings)

Total

32,768,000 + 302,309,376 = 335,077,376 ≈ 335M

Memoria

Modelo FP32 = 335,077,376 * 4 bytes ≈ 1.34 GB

Entrenamiento aprox (x4) ≈ 5.36 GB

¿Cabe en 80GB? Sí, con margen amplio

Parte C: Comparación y preguntas

Se parece más a: GPT-2 Medium (~355M).

¿Dataset 5GB es suficiente?
5GB ≈ ~1.3B tokens (aprox). Tokens/parámetro ≈ 1.3B / 335M ≈ 3.9, por debajo de la regla 10–20 tokens/param. Riesgo de sobreajuste o rendimiento limitado. Alternativas: reducir modelo, añadir más datos, regularización fuerte.

Con el doble de VRAM, ¿qué cambiar primero y por qué?
Aumentaría d_model primero (mejora capacidad de representación sin depender solo de profundidad).

¿Usar weight tying? Ventajas
Sí: reduce parámetros y memoria, y suele mejorar generalización al alinear embeddings de entrada y salida.