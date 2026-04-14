"""
Script de prueba: ejecuta las 5 consultas obligatorias de la práctica
y muestra los resultados con los documentos recuperados.
"""

from asistente import cargar_base_vectorial, crear_cadena_rag

CONSULTAS = [
    "¿Cuántos días de vacaciones tengo al año?",
    "¿Cuál es el procedimiento para reportar una incidencia técnica?",
    "¿Puedo trabajar desde casa todos los días de la semana?",
    "¿Cuál es el menú del comedor de la empresa?",
    "¿Cada cuánto tiempo debo cambiar mi contraseña?",
]

def main():
    print("=" * 60)
    print("PRUEBAS DEL SISTEMA RAG - TechCorp")
    print("=" * 60)

    vectorstore = cargar_base_vectorial()
    cadena, retriever = crear_cadena_rag(vectorstore)

    for i, pregunta in enumerate(CONSULTAS, 1):
        print(f"\n{'=' * 60}")
        print(f"CONSULTA {i}: {pregunta}")
        print("-" * 60)

        docs = retriever.invoke(pregunta)
        print(f"Documentos recuperados ({len(docs)}):")
        for j, doc in enumerate(docs, 1):
            fuente = doc.metadata.get("source", "desconocida").split("\\")[-1]
            print(f"  {j}. [{fuente}] {doc.page_content[:100]}...")

        print()
        respuesta = cadena.invoke(pregunta)
        print(f"Respuesta del asistente:\n{respuesta}")

    print(f"\n{'=' * 60}")
    print("Pruebas completadas.")

if __name__ == "__main__":
    main()
