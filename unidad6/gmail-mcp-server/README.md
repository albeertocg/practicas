# Gmail MCP Server — Práctica Unidad 6

Servidor **MCP (Model Context Protocol)** que expone Gmail a Claude Desktop mediante FastMCP y autenticación OAuth 2.0 con Google.

**Autor:** Alberto Coca González
**Asignatura:** Aprendizaje Automatizado 2 — Unidad 6 (MCP)

---

## 1. Componentes implementados

| Tipo | Nombre | Función |
|------|--------|---------|
| Tool | `list_emails(max_results)` | Lista los últimos N emails de la INBOX (remitente, asunto, fecha) |
| Tool | `send_email(to, subject, body)` | Envía un email a través de la cuenta autenticada |
| Resource | `gmail://profile` | Devuelve perfil del usuario (email, totales de mensajes e hilos) |
| Prompt | `redactar_email(destinatario, tema, tono)` | Plantilla reutilizable de redacción de emails |

Auxiliar: `get_gmail_service()` — gestiona el flujo OAuth (lectura/refresh de `token.json`, fallback al navegador con `credentials.json`).

---

## 2. Instalación

```bash
cd gmail-mcp-server
python -m venv venv
venv\Scripts\activate           # Windows
pip install -r requirements.txt
```

Con `uv` (recomendado por la práctica):

```bash
uv pip install fastmcp google-auth-oauthlib google-api-python-client
```

---

## 3. Configuración OAuth (Google Cloud)

1. Crear proyecto `gmail-mcp-server` en [Google Cloud Console](https://console.cloud.google.com/).
2. **APIs y servicios → Pantalla de consentimiento OAuth** → tipo **Externo**, añadir tu cuenta como **usuario de prueba**, y los scopes:
   - `gmail.readonly`
   - `gmail.send`
   - `gmail.modify`
3. **APIs y servicios → Credenciales → Crear ID de cliente OAuth → Aplicación de escritorio**.
4. Descargar el JSON, renombrarlo a `credentials.json` y colocarlo dentro de `gmail-mcp-server/`.
5. **APIs y servicios → Biblioteca → Gmail API → Habilitar**.

> `credentials.json` y `token.json` están en `.gitignore`. **No se suben al repositorio.**

---

## 4. Integración con Claude Desktop

Editar `%APPDATA%\Claude\claude_desktop_config.json` (Windows) y reiniciar Claude Desktop:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "python",
      "args": [
        "C:/Users/alber/OneDrive/Escritorio/Escritorio/asignaturas2cuatri/aprendizajeautomatizado2/practicas/unidad6/gmail-mcp-server/gmail_mcp_server.py"
      ]
    }
  }
}
```

Variante `uv`:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "uv",
      "args": [
        "--directory",
        "C:/Users/alber/.../unidad6/gmail-mcp-server",
        "run",
        "gmail_mcp_server.py"
      ]
    }
  }
}
```

La primera vez Claude lanzará el flujo OAuth: el navegador pedirá autorizar la cuenta, y se generará `token.json`. A partir de ahí la autenticación es transparente.

---

## 5. Pruebas (capturas en `/capturas/`)

| # | Prompt en Claude Desktop | Componente probado |
|---|--------------------------|--------------------|
| 1 | `Lista mis últimos 5 emails` | Tool `list_emails` |
| 2 | `Envía un email de prueba a albertococag2003@gmail.com con asunto "Test MCP" y cuerpo "Email enviado desde mi servidor MCP"` | Tool `send_email` |
| 3 | `¿Cuál es mi perfil de Gmail?` | Resource `gmail://profile` |
| 4 | `Usa la plantilla de redacción para escribir un email profesional a Juan García sobre la reunión del próximo lunes` | Prompt `redactar_email` |

---

## 6. Flujo OAuth (resumen)

1. `get_gmail_service()` busca `token.json`.
2. Si existe y es válido → construye el servicio Gmail.
3. Si está expirado pero hay `refresh_token` → renueva silenciosamente con `Request()`.
4. Si no hay token (primera ejecución) → `InstalledAppFlow.from_client_secrets_file(...).run_local_server(port=0)` abre el navegador, recibe el código en un puerto local efímero y persiste el token.
5. El servicio resultante se devuelve al resto de tools/resources.

---

## 7. Dificultades encontradas

- **Configuración de scopes en Google Cloud:** la pantalla de consentimiento exige añadir los scopes uno a uno y aceptar la cuenta como usuario de prueba (en modo Externo). Sin esto, el flujo OAuth falla con `access_denied`.
- **Rutas absolutas en Claude Desktop:** la configuración debe usar rutas absolutas; rutas relativas no funcionan porque Claude lanza el proceso desde su propio CWD.
- **Persistencia del token al lado del script:** se usa `os.path.dirname(__file__)` para que `token.json` se cree junto al `.py` y no en el directorio donde se invoca.

---

## 8. Mejoras y extensiones posibles

- **Búsqueda avanzada:** `search_emails(query)` envolviendo la sintaxis `q=` de la API (`from:`, `is:unread`, `has:attachment`).
- **Marcar como leído / archivar / eliminar:** con scope `gmail.modify` ya disponible.
- **Adjuntos:** soporte de `MIMEMultipart` en `send_email` con parámetro opcional `attachments: list[str]`.
- **Resource dinámico** `gmail://email/{id}` para leer un email concreto a demanda.
- **Despliegue remoto + JWT** (bonificación): exponer el servidor con FastMCP HTTP y autenticación JWT para uso multi-cliente.

---

## 9. Estructura del repositorio

```
gmail-mcp-server/
├── gmail_mcp_server.py     # Servidor MCP (tools + resource + prompt)
├── requirements.txt
├── pyproject.toml
├── .gitignore              # Excluye credentials.json y token.json
├── README.md
└── capturas/               # Screenshots de las 4 pruebas
```
