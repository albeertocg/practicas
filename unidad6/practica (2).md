# Práctica Evaluable - Unidad 6
## Gestor de Gmail con MCP

---

## Información General

| Campo | Valor |
|-------|-------|
| **Unidad** | 6 - Model Context Protocol (MCP) |
| **Tipo** | Práctica individual |
| **Duración estimada** | 120-150 minutos |
| **Entrega** | Enlace Github a directorio con código + capturas + documentación |
| **Fecha límite** | Según calendario del curso |

---

## Objetivo

Construir un **servidor MCP completo** que gestione Gmail, integrando todos los conceptos estudiados en la unidad: herramientas (tools), recursos (resources), prompts y autenticación OAuth con Google.

El servidor permitirá a Claude Desktop listar emails de la bandeja de entrada, enviar nuevos emails, consultar el perfil del usuario y utilizar plantillas de redacción, todo ello a través del protocolo MCP.

### Objetivos de Aprendizaje

1. Implementar un servidor MCP funcional con FastMCP
2. Configurar autenticación OAuth 2.0 con Google Cloud
3. Crear herramientas (tools), recursos (resources) y prompts en un servidor MCP
4. Integrar el servidor con Claude Desktop como cliente MCP

---

## Estructura del Proyecto

```
gmail-mcp-server/
├── gmail_mcp_server.py      # Servidor MCP principal
├── credentials.json         # Credenciales OAuth de Google Cloud
├── token.json               # Token de acceso (se genera automáticamente)
├── pyproject.toml            # Configuración del proyecto Python
└── requirements.txt          # Dependencias
```

### Dependencias

```
fastmcp
google-auth-oauthlib
google-api-python-client
```

Instalación:

```bash
uv pip install fastmcp google-auth-oauthlib google-api-python-client
```

---

## Paso 1: Crear Proyecto en Google Cloud Console (15 min)

### Contexto

Para acceder a la API de Gmail necesitamos crear un proyecto en Google Cloud y obtener credenciales OAuth 2.0. Este proceso solo se realiza una vez y nos permitirá autenticarnos de forma segura.

### Instrucciones

1. Accede a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. En la barra superior, haz clic en el **selector de proyectos** (junto al logo de Google Cloud)
4. Haz clic en **"Nuevo Proyecto"**
5. Configura el proyecto:
   - **Nombre del proyecto:** `gmail-mcp-server` (o el nombre que prefieras)
   - **Organización:** Dejar por defecto (o "Sin organización")
   - **Ubicación:** Dejar por defecto
6. Haz clic en **"Crear"**
7. Espera unos segundos a que se cree el proyecto
8. Asegúrate de que el proyecto recién creado está **seleccionado** en la barra superior

> **Importante:** Anota el nombre del proyecto. Lo necesitarás en los siguientes pasos.

---

## Paso 2: Configurar Pantalla de Consentimiento OAuth (10 min)

### Contexto

La pantalla de consentimiento es lo que verá el usuario cuando la aplicación solicite acceso a su cuenta de Gmail. Debemos configurarla antes de crear las credenciales.

### Instrucciones

1. En Google Cloud Console, ve al menú de navegación (hamburguesa, arriba a la izquierda)
2. Navega a **"APIs y servicios" > "Pantalla de consentimiento OAuth"**
3. Selecciona el tipo de usuario: **"Externo"** y haz clic en **"Crear"**
4. Rellena la información de la aplicación:
   - **Nombre de la aplicación:** `Gmail MCP Server`
   - **Correo electrónico de asistencia del usuario:** Tu email
   - **Logotipo de la aplicación:** Dejar en blanco (opcional)
5. En **"Información de contacto del desarrollador"**, introduce tu email
6. Haz clic en **"Guardar y continuar"**
7. En la sección **"Permisos"** (Scopes):
   - Haz clic en **"Agregar o quitar permisos"**
   - Busca y selecciona:
     - `https://www.googleapis.com/auth/gmail.readonly` (leer emails)
     - `https://www.googleapis.com/auth/gmail.send` (enviar emails)
     - `https://www.googleapis.com/auth/gmail.modify` (modificar emails)
   - Haz clic en **"Actualizar"** y luego en **"Guardar y continuar"**
8. En la sección **"Usuarios de prueba"**:
   - Haz clic en **"+ Agregar usuarios"**
   - Añade **tu dirección de email de Gmail** como usuario de prueba
   - Haz clic en **"Agregar"** y luego en **"Guardar y continuar"**
9. Revisa el resumen y haz clic en **"Volver al panel"**

> **Nota:** Al configurar el tipo como "Externo", la aplicación estará en modo de prueba. Solo los usuarios que añadas explícitamente como "usuarios de prueba" podrán utilizarla. Esto es suficiente para esta práctica.

---

## Paso 3: Crear Credenciales OAuth (10 min)

### Contexto

Las credenciales OAuth permiten que nuestra aplicación se identifique ante Google. Descargaremos un archivo JSON con el client ID y client secret que usará nuestro servidor MCP.

### Instrucciones

1. En Google Cloud Console, ve a **"APIs y servicios" > "Credenciales"**
2. Haz clic en **"+ Crear credenciales"** en la parte superior
3. Selecciona **"ID de cliente OAuth"**
4. Configura:
   - **Tipo de aplicación:** `Aplicación de escritorio`
   - **Nombre:** `Gmail MCP Client` (o el que prefieras)
5. Haz clic en **"Crear"**
6. Aparecerá un diálogo con tu Client ID y Client Secret
7. Haz clic en **"Descargar JSON"**
8. Renombra el archivo descargado a **`credentials.json`**
9. Mueve el archivo a la carpeta de tu proyecto `gmail-mcp-server/`

> **ADVERTENCIA DE SEGURIDAD:** El archivo `credentials.json` contiene las credenciales secretas de tu aplicación. **NUNCA** lo subas a un repositorio público, no lo compartas, y no lo incluyas en la entrega de la práctica. Trátalo como una contraseña.

---

## Paso 4: Habilitar Gmail API (5 min)

### Instrucciones

1. En Google Cloud Console, ve a **"APIs y servicios" > "Biblioteca"**
2. En el buscador, escribe **"Gmail API"**
3. Haz clic en **"Gmail API"** en los resultados
4. Haz clic en el botón **"Habilitar"**
5. Espera a que se active (aparecerá un panel de control de la API)

> **Verificación:** Puedes confirmar que la API está habilitada yendo a **"APIs y servicios" > "APIs y servicios habilitados"** y comprobando que Gmail API aparece en la lista.

---

## Paso 5: Implementar el Servidor MCP (40-50 min)

### Contexto

Este es el paso principal de la práctica. Implementaremos un servidor MCP que expone las funcionalidades de Gmail como herramientas, recursos y prompts utilizando la librería **FastMCP**.

**Código de referencia:** [gmail_mcp_server.py en GitHub](https://github.com/rpmaya/ml2_code/blob/main/MCP/gmail-mcp-server/gmail_mcp_server.py)

### 5.1 Estructura General del Servidor

El servidor MCP tendrá los siguientes componentes:

| Componente | Tipo | Descripción |
|-----------|------|-------------|
| `get_gmail_service()` | Función auxiliar | Gestiona la autenticación OAuth con Google |
| `list_emails` | Tool (herramienta) | Lista los emails de la bandeja de entrada |
| `send_email` | Tool (herramienta) | Envía un nuevo email |
| `get_profile` | Resource (recurso) | Obtiene el perfil del usuario autenticado |
| `redactar_email` | Prompt (plantilla) | Plantilla para que el LLM redacte emails |

### 5.2 Autenticación OAuth

La función `get_gmail_service()` gestiona todo el flujo OAuth:

1. Comprueba si existe un `token.json` con credenciales válidas
2. Si el token ha expirado, intenta renovarlo automáticamente
3. Si no hay token o no se puede renovar, abre el navegador para que el usuario autorice la aplicación
4. Guarda el token para futuras ejecuciones

```python
import os
import base64
from email.mime.text import MIMEText
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from mcp.server.fastmcp import FastMCP

# Permisos que solicita la aplicación
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify"
]

mcp = FastMCP("Gmail MCP Server")

def get_gmail_service():
    """Autentica con OAuth y devuelve el servicio de Gmail."""
    creds = None

    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)

        with open("token.json", "w") as token:
            token.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)
```

> **Nota:** La primera vez que ejecutes el servidor, se abrirá una ventana del navegador pidiendo que autorices el acceso a Gmail. Selecciona tu cuenta de Google, acepta los permisos y el `token.json` se generará automáticamente. En ejecuciones posteriores, la autenticación será transparente.

### 5.3 Tool: Listar Emails

Esta herramienta permite al LLM consultar los emails más recientes de la bandeja de entrada:

```python
@mcp.tool()
def list_emails(max_results: int = 10) -> str:
    """Lista los emails más recientes de la bandeja de entrada."""
    service = get_gmail_service()
    results = service.users().messages().list(
        userId="me",
        maxResults=max_results,
        labelIds=["INBOX"]
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
            metadataHeaders=["From", "Subject", "Date"]
        ).execute()

        headers = {h["name"]: h["value"] for h in message["payload"]["headers"]}
        emails.append(
            f"ID: {msg['id']}\n"
            f"De: {headers.get('From', 'Desconocido')}\n"
            f"Asunto: {headers.get('Subject', 'Sin asunto')}\n"
            f"Fecha: {headers.get('Date', 'Sin fecha')}\n"
        )

    return "\n---\n".join(emails)
```

### 5.4 Tool: Enviar Email

Esta herramienta permite enviar emails a través de Gmail:

```python
@mcp.tool()
def send_email(to: str, subject: str, body: str) -> str:
    """Envía un email a través de Gmail.

    Args:
        to: Dirección de email del destinatario
        subject: Asunto del email
        body: Cuerpo del email en texto plano
    """
    service = get_gmail_service()

    message = MIMEText(body)
    message["to"] = to
    message["subject"] = subject

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    send_message = service.users().messages().send(
        userId="me",
        body={"raw": raw}
    ).execute()

    return f"Email enviado correctamente. ID: {send_message['id']}"
```

### 5.5 Resource: Perfil del Usuario

Los recursos en MCP exponen datos que el LLM puede consultar. Aquí exponemos el perfil del usuario autenticado:

```python
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
```

### 5.6 Prompt: Plantilla de Redacción

Los prompts en MCP proporcionan plantillas predefinidas que el LLM puede usar para tareas específicas:

```python
@mcp.prompt()
def redactar_email(destinatario: str, tema: str, tono: str = "profesional") -> str:
    """Plantilla para redactar un email.

    Args:
        destinatario: Nombre o dirección del destinatario
        tema: Tema o propósito del email
        tono: Tono del email (profesional, informal, formal)
    """
    return f"""Redacta un email con las siguientes características:
- Destinatario: {destinatario}
- Tema: {tema}
- Tono: {tono}

El email debe ser claro, conciso y apropiado para el tono indicado.
Incluye un saludo, el cuerpo del mensaje y una despedida adecuada."""
```

### 5.7 Punto de Entrada

Finalmente, añade el punto de entrada del servidor al final del archivo:

```python
if __name__ == "__main__":
    mcp.run()
```

### 5.8 Archivo `requirements.txt`

Crea el archivo `requirements.txt` con las dependencias:

```
fastmcp
google-auth-oauthlib
google-api-python-client
```

> **Conexión con la teoría:** Este servidor implementa los tres tipos de primitivas MCP estudiadas en clase: **Tools** (acciones que el LLM puede ejecutar), **Resources** (datos que el LLM puede consultar) y **Prompts** (plantillas reutilizables). La autenticación OAuth demuestra cómo un servidor MCP puede acceder a servicios externos de forma segura.

---

## Paso 6: Integración con Claude Desktop (15-20 min)

### Contexto

Una vez implementado el servidor MCP, debemos configurar Claude Desktop para que lo reconozca y pueda utilizar las herramientas, recursos y prompts que hemos creado.

### 6.1 Localizar el Archivo de Configuración

El archivo de configuración de Claude Desktop se encuentra en:

| Sistema Operativo | Ruta |
|-------------------|------|
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |

Si el archivo no existe, créalo.

### 6.2 Opción A: Configuración con Python

Edita `claude_desktop_config.json` con la siguiente configuración:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "python",
      "args": [
        "/ruta/completa/a/tu/gmail-mcp-server/gmail_mcp_server.py"
      ]
    }
  }
}
```

> **Importante:** Sustituye `/ruta/completa/a/tu/gmail-mcp-server/` por la ruta real donde se encuentra tu archivo `gmail_mcp_server.py`.

### 6.3 Opción B: Configuración con UV (Recomendada)

Si utilizas **uv** como gestor de paquetes Python, puedes configurar el servidor así:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "uv",
      "args": [
        "--directory",
        "/ruta/completa/a/tu/gmail-mcp-server",
        "run",
        "gmail_mcp_server.py"
      ]
    }
  }
}
```

> **Ventaja de UV:** `uv` gestiona automáticamente las dependencias y el entorno virtual, lo que simplifica la ejecución del servidor.

### 6.4 Verificar la Integración

1. **Reinicia Claude Desktop** completamente (cierra y vuelve a abrir la aplicación)
2. En la ventana de chat, busca el icono de herramientas (martillo) o de MCP
3. Haz clic en él para verificar que aparece el servidor **"Gmail MCP Server"**
4. Deberías ver listadas las herramientas (`list_emails`, `send_email`), el recurso (`gmail://profile`) y el prompt (`redactar_email`)

> **Si el servidor no aparece:** Revisa que la ruta en `claude_desktop_config.json` es correcta y absoluta, que Python (o uv) está accesible desde la terminal, y que las dependencias están instaladas. Consulta los logs de Claude Desktop para más detalles.

---

## Paso 7: Pruebas (20-30 min)

### Contexto

Realiza las siguientes pruebas en Claude Desktop para verificar que todos los componentes funcionan correctamente. **Documenta cada prueba con capturas de pantalla.**

### 7.1 Prueba de Listar Emails

En Claude Desktop, escribe:

```
Lista mis últimos 5 emails
```

**Resultado esperado:** Claude utiliza la herramienta `list_emails` y muestra los emails recientes con remitente, asunto y fecha.

### 7.2 Prueba de Enviar Email

Escribe:

```
Envía un email de prueba a mi.email@ejemplo.com con asunto "Test MCP"
y cuerpo "Este es un email enviado desde mi servidor MCP"
```

> **Nota:** Usa tu propia dirección de email como destinatario para verificar la recepción.

**Resultado esperado:** Claude utiliza la herramienta `send_email` y confirma el envío con el ID del mensaje.

### 7.3 Prueba de Consultar Perfil

Escribe:

```
¿Cuál es mi perfil de Gmail?
```

**Resultado esperado:** Claude accede al recurso `gmail://profile` y muestra la dirección de email, el número total de mensajes y de hilos.

### 7.4 Prueba del Prompt de Redacción

Utiliza el prompt de redacción desde la interfaz de Claude Desktop (si está disponible como botón) o escribe:

```
Usa la plantilla de redacción para escribir un email profesional
a Juan García sobre la reunión del próximo lunes
```

**Resultado esperado:** Claude utiliza el prompt `redactar_email` para generar un borrador de email con el tono y contenido solicitados.

### 7.5 Documentación de las Pruebas

Para cada prueba, captura:

1. La pregunta o instrucción que escribiste en Claude Desktop
2. La respuesta de Claude, incluyendo la indicación de qué herramienta/recurso utilizó
3. El resultado final (emails listados, confirmación de envío, perfil, borrador)

---

## Recomendaciones

- **Completa la configuración de Google Cloud** antes de empezar a programar
- **Prueba la autenticación OAuth** ejecutando el servidor de forma independiente antes de integrarlo con Claude Desktop
- Si el token expira, elimina `token.json` y vuelve a autenticarte
- **Documenta cada paso** con capturas de pantalla claras
- Asegúrate de que las credenciales OAuth están correctamente configuradas antes de integrar con Claude Desktop
- Si encuentras errores de permisos en Gmail API, verifica que los scopes están correctamente configurados en la pantalla de consentimiento
- **No incluyas archivos sensibles** (`credentials.json`, `token.json`) en la entrega

---

## Rúbrica de Evaluación

| Criterio | Descripción | Puntos |
|----------|-------------|--------|
| **OAuth funcional** | Credenciales configuradas correctamente en Google Cloud y autenticación exitosa con Gmail API | **2** |
| **Tools implementadas** | `list_emails` y `send_email` funcionan correctamente y devuelven resultados apropiados | **3** |
| **Resource y Prompt** | Recurso `get_profile` y prompt `redactar_email` implementados y funcionando | **2** |
| **Integración Claude Desktop** | Servidor aparece correctamente en Claude Desktop y las herramientas son utilizables desde la interfaz | **2** |
| **Documentación** | Capturas de prueba de cada funcionalidad y explicación del proceso | **1** |
| **TOTAL** | | **10** |

### Bonificación (hasta +1 punto adicional)

| Bonificación | Descripción | Puntos extra |
|--------------|-------------|--------------|
| **Despliegue remoto** | Servidor MCP desplegado de forma remota con autenticación JWT para conexiones seguras | **+1** |

---

## Formato y Proceso de Entrega

### Enlace al directorio de tu repositorio GitHub

```
https://github.com/rpmaya/ml2_clases/practica6
```

### Contenido del directorio

1. **Código del servidor:** `gmail_mcp_server.py` con la implementación completa
2. **Dependencias:** `requirements.txt` con las librerías necesarias
3. **Capturas de prueba:** Imágenes o PDF mostrando el funcionamiento de cada componente (listar emails, enviar email, consultar perfil, usar prompt)
4. **Documento explicativo** (1-2 páginas, PDF o Word):
   - Descripción del flujo OAuth implementado
   - Componentes del servidor MCP (tools, resources, prompts)
   - Dificultades encontradas durante el desarrollo
   - Posibles mejoras o extensiones del servidor

> **ADVERTENCIA DE SEGURIDAD:** **NO incluyas** los archivos `credentials.json` ni `token.json` en la entrega. Estos archivos contienen credenciales sensibles que no deben compartirse (añade estas entradas a .gitignore). Configuraré mis propias credenciales para probar el servidor.

### Proceso de Entrega

1. Verifica que el servidor funciona correctamente en tu entorno
2. Prepara las capturas de pantalla de todas las pruebas realizadas
3. Redacta el documento explicativo (1-2 páginas)
4. Sube los archivos a tu directorio de github (excluyendo en .gitignore `credentials.json` y `token.json`)
5. Sube el enlace a tu directorio de GitHub antes de la fecha límite
6. Verifica que la entrega se ha realizado correctamente

---

## Recursos Útiles

### Herramientas

- [FastMCP - Documentación](https://github.com/jlowin/fastmcp)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Gmail API - Documentación oficial](https://developers.google.com/gmail/api)
- [Google Auth Library para Python](https://google-auth.readthedocs.io/)

### Referencias

- [Sesión 1 - Teoría](./sesion_1/teoria.md)
- [Sesión 2 - Teoría](./sesion_2/teoria.md)
- [Código de referencia - gmail_mcp_server.py](https://github.com/rpmaya/ml2_code/blob/main/MCP/gmail-mcp-server/gmail_mcp_server.py)
- [MCP - Especificación oficial](https://modelcontextprotocol.io/)
- [Claude Desktop - Configuración MCP](https://modelcontextprotocol.io/quickstart/user)

---

## Notas Finales

- Esta práctica es **individual**
- Puedes consultar la documentación oficial de FastMCP, Gmail API y los materiales del curso
- Se valora la originalidad en las mejoras propuestas y la calidad de la documentación
- Asegúrate de que el código funciona correctamente antes de entregar
- Si usas credenciales, **no las incluyas en la entrega** (se configurarán en el entorno del evaluador)
- En caso de dudas, consulta al profesor

**Fecha de entrega:** Consultar calendario del curso
