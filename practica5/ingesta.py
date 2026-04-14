"""
Ingesta de documentos para el sistema RAG.
Carga documentos, los divide en chunks y los almacena en FAISS.
"""

import os
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

# Cargar variables de entorno
load_dotenv()

# Verificar API Key
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("No se encontró OPENAI_API_KEY en el archivo .env")


def cargar_documentos(ruta_documentos: str):
    """Carga todos los documentos .txt de la carpeta indicada."""
    loader = DirectoryLoader(
        ruta_documentos,
        glob="**/*.txt",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"}
    )
    documentos = loader.load()
    print(f"Documentos cargados: {len(documentos)}")
    for doc in documentos:
        print(f"  - {doc.metadata['source']} ({len(doc.page_content)} caracteres)")
    return documentos


def dividir_documentos(documentos):
    """Divide los documentos en chunks con solapamiento."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=30,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    chunks = text_splitter.split_documents(documentos)
    print(f"Chunks generados: {len(chunks)}")
    print(f"Tamaño medio de chunk: {sum(len(c.page_content) for c in chunks) // len(chunks)} caracteres")
    return chunks


def crear_base_vectorial(chunks, ruta_db: str = "./faiss_db"):
    """Genera embeddings y almacena en FAISS."""
    embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")

    vectorstore = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings,
    )
    vectorstore.save_local(ruta_db)

    print(f"Base vectorial creada en: {ruta_db}")
    print(f"Vectores almacenados: {vectorstore.index.ntotal}")
    return vectorstore


if __name__ == "__main__":
    print("=" * 50)
    print("INGESTA DE DOCUMENTOS - Sistema RAG")
    print("=" * 50)

    # 1. Cargar documentos
    documentos = cargar_documentos("./documentos")

    # 2. Dividir en chunks
    chunks = dividir_documentos(documentos)

    # Mostrar ejemplo de chunk
    print(f"\nEjemplo de chunk:")
    print(f"  Contenido: {chunks[0].page_content[:150]}...")
    print(f"  Metadata: {chunks[0].metadata}")

    # 3. Crear base vectorial
    vectorstore = crear_base_vectorial(chunks)

    print("\nIngesta completada con éxito.")
