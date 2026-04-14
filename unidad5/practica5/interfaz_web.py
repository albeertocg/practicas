"""
Interfaz web con Gradio para el asistente RAG de TechCorp.
Bonificación: +1 punto por canal externo.
"""

import gradio as gr
from asistente import cargar_base_vectorial, crear_cadena_rag

# Cargar sistema RAG al iniciar
vectorstore = cargar_base_vectorial()
cadena, retriever = crear_cadena_rag(vectorstore)


def responder(pregunta, historial):
    """Procesa la pregunta y devuelve la respuesta del RAG."""
    if not pregunta.strip():
        return "", historial

    # Recuperar documentos para mostrar fuentes
    docs = retriever.invoke(pregunta)
    fuentes = set()
    for doc in docs:
        src = doc.metadata.get("source", "desconocida")
        fuentes.add(src.split("/")[-1].split("\\")[-1])

    # Generar respuesta
    respuesta = cadena.invoke(pregunta)

    # Añadir fuentes consultadas
    if fuentes:
        respuesta += f"\n\n_Fuentes consultadas: {', '.join(fuentes)}_"

    historial.append((pregunta, respuesta))
    return "", historial


with gr.Blocks(title="Asistente TechCorp", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# Asistente RAG - TechCorp")
    gr.Markdown("Pregunta sobre políticas de RRHH, soporte técnico y procedimientos internos.")

    chatbot = gr.Chatbot(height=450)
    msg = gr.Textbox(
        placeholder="Escribe tu pregunta aquí...",
        label="Tu pregunta",
        show_label=False
    )
    clear = gr.Button("Limpiar conversación")

    msg.submit(responder, [msg, chatbot], [msg, chatbot])
    clear.click(lambda: (None, []), outputs=[msg, chatbot])

if __name__ == "__main__":
    demo.launch()
