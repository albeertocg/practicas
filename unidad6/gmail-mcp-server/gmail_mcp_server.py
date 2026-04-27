"""Servidor MCP para gestionar Gmail.

Expone las primitivas MCP estudiadas en la Unidad 6:
- Tools: list_emails, send_email
- Resource: gmail://profile
- Prompt: redactar_email

La autenticacion contra la API de Gmail se realiza mediante OAuth 2.0.
La primera ejecucion abrira el navegador para autorizar la aplicacion;
las siguientes reutilizaran el token guardado en token.json.
"""

import os
import base64
from email.mime.text import MIMEText

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from mcp.server.fastmcp import FastMCP


SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_PATH = os.path.join(BASE_DIR, "credentials.json")
TOKEN_PATH = os.path.join(BASE_DIR, "token.json")

mcp = FastMCP("Gmail MCP Server")


def get_gmail_service():
    """Autentica con OAuth y devuelve el servicio de Gmail."""
    creds = None

    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(TOKEN_PATH, "w") as token:
            token.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)


@mcp.tool()
def list_emails(max_results: int = 10) -> str:
    """Lista los emails mas recientes de la bandeja de entrada.

    Args:
        max_results: Numero maximo de emails a devolver (por defecto 10).
    """
    service = get_gmail_service()
    results = service.users().messages().list(
        userId="me",
        maxResults=max_results,
        labelIds=["INBOX"],
    ).execute()

    messages = results.get("messages", [])
    if not messages:
        return "No se encontraron emails."

    emails = []
    for msg in messages:
        message = service.users().messages().get(
            userId="me",
            id=msg["id"],
            format="metadata",
            metadataHeaders=["From", "Subject", "Date"],
        ).execute()

        headers = {h["name"]: h["value"] for h in message["payload"]["headers"]}
        emails.append(
            f"ID: {msg['id']}\n"
            f"De: {headers.get('From', 'Desconocido')}\n"
            f"Asunto: {headers.get('Subject', 'Sin asunto')}\n"
            f"Fecha: {headers.get('Date', 'Sin fecha')}\n"
        )

    return "\n---\n".join(emails)


@mcp.tool()
def send_email(to: str, subject: str, body: str) -> str:
    """Envia un email a traves de Gmail.

    Args:
        to: Direccion de email del destinatario.
        subject: Asunto del email.
        body: Cuerpo del email en texto plano.
    """
    service = get_gmail_service()

    message = MIMEText(body)
    message["to"] = to
    message["subject"] = subject

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    send_message = service.users().messages().send(
        userId="me",
        body={"raw": raw},
    ).execute()

    return f"Email enviado correctamente. ID: {send_message['id']}"


@mcp.resource("gmail://profile")
def get_profile() -> str:
    """Obtiene el perfil del usuario de Gmail."""
    service = get_gmail_service()
    profile = service.users().getProfile(userId="me").execute()

    return (
        f"Email: {profile.get('emailAddress', 'No disponible')}\n"
        f"Total de mensajes: {profile.get('messagesTotal', 0)}\n"
        f"Hilos totales: {profile.get('threadsTotal', 0)}"
    )


@mcp.prompt()
def redactar_email(destinatario: str, tema: str, tono: str = "profesional") -> str:
    """Plantilla para redactar un email.

    Args:
        destinatario: Nombre o direccion del destinatario.
        tema: Tema o proposito del email.
        tono: Tono del email (profesional, informal, formal).
    """
    return f"""Redacta un email con las siguientes caracteristicas:
- Destinatario: {destinatario}
- Tema: {tema}
- Tono: {tono}

El email debe ser claro, conciso y apropiado para el tono indicado.
Incluye un saludo, el cuerpo del mensaje y una despedida adecuada."""


if __name__ == "__main__":
    mcp.run()
