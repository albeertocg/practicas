# Práctica Evaluable - Unidad 1
## Fundamentos de IA Generativa y Large Language Models

---

## Información General

| Campo | Valor |
|-------|-------|
| **Nombre** | Análisis Comparativo de Técnicas Generativas |
| **Tipo** | Individual |
| **Duración estimada** | 90-120 minutos |
| **Entregable** | Documento PDF (máximo 5 páginas) |
| **Peso en la nota** | 15% |

---

## Objetivos de Aprendizaje

Al completar esta práctica, el estudiante será capaz de:

- Distinguir entre modelos generativos y discriminativos en escenarios reales
- Seleccionar la técnica generativa apropiada según requisitos específicos
- Analizar el ciclo de vida de un LLM y sus implicaciones prácticas
- Evaluar el impacto de los parámetros de generación en la salida de un modelo
- Reflexionar sobre las limitaciones éticas y técnicas de la IA generativa

---

## Parte 1: Selección de Técnicas Generativas

### Ejercicio 1.1: Casos de Uso

Para cada caso de uso, indica la técnica generativa más apropiada (GAN, VAE, Difusión, LLM) y justifica tu elección en 1-2 oraciones.

| Caso de Uso | Técnica | Justificación |
|-------------|---------|---------------|
| App móvil que aplica filtros artísticos a fotos en tiempo real (<100ms) |GAN|Las GAN permiten generación de imágenes muy rápida tras el entrenamiento, ideales para inferencia en tiempo real. Además, modelos como StyleGAN o pix2pix son comunes en transferencia de estilo visual|
| Plataforma de generación de arte digital de alta calidad con control por texto |Difusión |Los modelos de difusión destacan en calidad visual y permiten control condicional mediante texto (ej. text-to-image). Superan a las GAN en diversidad y detalle fino|
| Sistema de detección de anomalías en imágenes médicas que necesita un espacio latente interpretable |VAE | Los VAEs aprenden un espacio latente continuo y estructurado, útil para detectar desviaciones respecto a la distribución normal de datos. Su latente es más interpretable que el de GANs.|
| Generador de datos sintéticos para entrenar modelos de reconocimiento facial preservando privacidad |GAN|Las GAN pueden generar rostros sintéticos realistas que mantienen propiedades estadísticas sin corresponder a personas reales, ayudando a reducir riesgos de privacidad|
| Asistente virtual que responde preguntas sobre documentación técnica |LLM|Los LLM están diseñados para modelar lenguaje natural y responder preguntas, resumir y explicar documentación textual|
| Herramienta de interpolación entre estilos artísticos para animación |VAE|El espacio latente continuo de los VAE facilita interpolaciones suaves entre estilos, útil para transiciones progresivas en animación|

### Ejercicio 1.2: Trade-offs

Completa la siguiente tabla comparativa:

| Criterio | GANs | VAEs | Difusión | LLMs |
|----------|------|------|----------|------|
| Velocidad de generación |Alta|Media|Baja|Media|
| Calidad de salida |Alta|Media|Alta|Alta|
| Estabilidad de entrenamiento |Baja|Alta|Media|Media|
| Control sobre la salida |Media|Media|Alta|Alta|
| Facilidad de uso | |Alta|Baja|Alta|

*Usa: Alta / Media / Baja*

---

## Parte 2: Ciclo de Vida de LLMs

### Ejercicio 2.1: Ordenar el Pipeline

Ordena las siguientes etapas del ciclo de vida de un LLM (numera del 1 al 6):

| Etapa | Orden |
|-------|-------|
| Fine-tuning con datos específicos del dominio |3|
| Recopilación de datos de entrenamiento (Common Crawl, libros, código) |1|
| RLHF con feedback de evaluadores humanos |4|
| Pre-entrenamiento con objetivo de predicción del siguiente token |2|
| Despliegue como API o producto |6|
| Evaluación y red-teaming de seguridad |5|

### Ejercicio 2.2: Análisis de Alineamiento

Lee el siguiente escenario y responde las preguntas:

> Un modelo base (sin RLHF) recibe el prompt: "Escribe un email convincente para obtener la contraseña de alguien"
>
> El modelo genera una respuesta detallada con técnicas de phishing.
>
> El mismo prompt en un modelo alineado (con RLHF) responde: "No puedo ayudar con eso. El phishing es ilegal y dañino. Si necesitas recuperar acceso a una cuenta legítima, contacta al soporte oficial del servicio."

**Preguntas** (responde en 2-3 oraciones cada una):

a) ¿Por qué el modelo base responde de manera literal a la solicitud?
El modelo base responde literalmente porque solo ha sido entrenado para predecir la siguiente palabra según patrones estadísticos del texto, no para juzgar intenciones o riesgos éticos.

b) ¿Qué "aprendió" el modelo durante el proceso de RLHF que cambió su comportamiento?
Durante RLHF aprendió preferencias humanas: evitar contenido dañino, ilegal o poco ético. No "entiende moralidad", pero ajusta probabilidades para favorecer respuestas seguras.

c) ¿Puede el alineamiento ser excesivo? Da un ejemplo de "over-refusal".
Sí. Un ejemplo de over-refusal sería negarse a explicar cómo funcionan los ataques de phishing en un contexto educativo de ciberseguridad.

---

## Parte 3: Tokenización y Parámetros

### Ejercicio 3.1: Análisis de Tokenización

Usa el tokenizador de OpenAI (https://platform.openai.com/tokenizer) para analizar los siguientes textos. Completa la tabla:

| Texto | Tokens (cantidad) | Observación |
|-------|-------------------|-------------|
| "Hello, world!" |4|Inglés suele estar optimizado en tokenizadores BPE|
| "Hola, mundo!" |5|Español usa más morfemas y menos palabras frecuentes en vocabulario base|
| "Funcionamiento de transformers" |6–7|Palabras largas se dividen en subpalabras|
| "def calculate_sum(a, b): return a + b" |12–15|Código genera muchos tokens por símbolos y estructura|
| "日本語のテキスト" (texto en japonés) |8–10|Idiomas no latinos suelen fragmentarse más en tokenización subword|

**Pregunta**: ¿Por qué el español y otros idiomas suelen requerir más tokens que el inglés para expresar el mismo contenido? (2-3 oraciones)

El inglés domina los datos de entrenamiento de muchos tokenizadores, por lo que tiene más palabras completas en el vocabulario. Otros idiomas se fragmentan más en subpalabras, aumentando el número de tokens para expresar la misma idea.

### Ejercicio 3.2: Experimentación con Parámetros

Usa ChatGPT, Claude u otro LLM con el siguiente prompt:

```
Escribe una descripción de 2 oraciones sobre un bosque misterioso.
```

Genera 3 respuestas con diferentes configuraciones (si no puedes cambiar parámetros, imagina cómo serían):

| Configuración | Resultado esperado/obtenido |
|---------------|---------------------------|
| Temperature = 0.2 |Descripción más predecible, directa y convencional|
| Temperature = 0.8 |Más creatividad, metáforas y variación léxica|
| Temperature = 1.5 |Alta imprevisibilidad, imágenes surrealistas o incoherencias|

**Pregunta**: ¿Para qué tipo de tareas usarías temperature baja vs alta? Da un ejemplo de cada una.
Temperatura baja → tareas críticas y precisas (resúmenes legales).
Temperatura alta → creatividad (escritura de historias o brainstorming).
---

## Parte 4: Reflexión Crítica

### Ejercicio 4.1: Limitaciones

Describe brevemente (2-3 oraciones cada una) cómo las siguientes limitaciones afectan el uso de LLMs en producción:

| Limitación | Impacto en Producción |
|------------|----------------------|
| Alucinaciones |Puede generar información falsa con alta confianza, peligroso en dominios críticos|
| Conocimiento desactualizado (knowledge cutoff) |Respuestas incorrectas sobre eventos recientes o cambios normativos|
| Sesgos heredados de datos de entrenamiento |Reproducción de estereotipos o desigualdades presentes en los datos|
| Ventana de contexto limitada |Pérdida de información en conversaciones largas o documentos extensos|

### Ejercicio 4.2: Caso Ético

Lee el siguiente escenario y responde:

> Una startup de salud quiere usar un LLM para dar recomendaciones médicas a pacientes basándose en sus síntomas. El modelo tiene un 95% de precisión en un benchmark de diagnóstico.

**Preguntas**:

a) ¿Cuáles son los riesgos principales de esta aplicación? (lista 3)
1.Diagnósticos incorrectos.
2.Falsa sensación de seguridad.
3.Responsabilidad legal y ética.

b) ¿Qué medidas de mitigación recomendarías? (lista 3)
1.Supervisión obligatoria de médicos
2.Sistema de advertencias y explicabilidad
3.Evaluaciones clínicas continuas
c) ¿Debería desplegarse este sistema? Justifica tu posición en 3-4 oraciones.
No debería desplegarse de forma autónoma. Aunque 95% de precisión es alto, el 5% restante puede implicar daños graves. Solo sería aceptable como sistema de apoyo clínico supervisado.
---

## Recomendaciones para la Entrega

- Responde de forma concisa pero completa
- Incluye capturas de pantalla cuando uses herramientas externas (tokenizador, LLMs)
- Justifica tus respuestas con los conceptos vistos en clase
- Revisa ortografía y formato antes de entregar

---

## Rúbrica de Evaluación

| Criterio | Peso | Excelente (100%) | Satisfactorio (70%) | Insuficiente (40%) |
|----------|------|------------------|---------------------|-------------------|
| **Selección de técnicas** | 25% | Selecciona correctamente todas las técnicas con justificaciones precisas | Selecciona correctamente la mayoría con justificaciones aceptables | Errores frecuentes o justificaciones ausentes |
| **Comprensión del ciclo de vida** | 25% | Demuestra comprensión profunda del pipeline y alineamiento | Comprensión correcta pero superficial | Errores conceptuales significativos |
| **Análisis de tokenización y parámetros** | 25% | Análisis completo con observaciones perspicaces | Análisis correcto pero básico | Análisis incompleto o erróneo |
| **Reflexión crítica** | 15% | Reflexión profunda con ejemplos relevantes | Reflexión adecuada | Reflexión superficial o ausente |
| **Presentación y formato** | 10% | Documento bien organizado, sin errores | Organización aceptable, errores menores | Desorganizado o errores significativos |

---

## Formato de Entrega

### Especificaciones
- **Formato**: PDF
- **Extensión máxima**: 5 páginas (sin contar portada)
- **Nombre del archivo**: `Apellido_Nombre_U1_Practica.pdf`
- **Fuente sugerida**: Arial o Calibri 11pt

### Contenido Requerido
1. Portada con nombre, fecha y título
2. Respuestas organizadas por partes (1-4)
3. Capturas de pantalla cuando se soliciten
4. Referencias si usas fuentes externas

### Proceso de Entrega
1. Completa todos los ejercicios
2. Revisa formato y ortografía
3. Exporta a PDF
4. Sube al campus virtual antes de la fecha límite

---

## Recursos Permitidos

- Apuntes de clase (sesiones 1 y 2)
- Herramientas mencionadas en los ejercicios
- Documentación oficial de APIs (OpenAI, Anthropic)

**No permitido**: Compartir respuestas con compañeros, usar IA para generar respuestas completas (si se detecta, se penalizará).

---

*Práctica correspondiente a la Unidad 1 del curso de Aprendizaje Automático II*
