# Conectar Gmail a RespawnTech

La app crea un borrador con destinatario, asunto y PDF adjunto. Deja el cuerpo vacío. Abre la carpeta Borradores de la cuenta autorizada; selecciona la cotización para escribir el mensaje y enviarlo. No envía automáticamente ni modifica el generador de PDF.

## Configuración inicial (una vez)

1. Entra en https://console.cloud.google.com/ con tu cuenta de Google y crea o selecciona un proyecto.
2. En **APIs y servicios → Biblioteca**, habilita **Gmail API**.
3. En **Google Auth Platform**, configura el nombre de la aplicación y los correos de contacto. Para tu uso personal puedes mantener la audiencia externa en estado **Testing** y agregar tu propia cuenta Gmail como usuario de prueba.
4. En **Data Access / Acceso a datos**, agrega `https://www.googleapis.com/auth/gmail.compose`, `openid` y `https://www.googleapis.com/auth/userinfo.email`. El permiso de Gmail permite gestionar borradores y también enviar según la descripción de Google; esta app utiliza exclusivamente la creación de borradores y no llama al endpoint de envío.
5. En **Clients / Clientes**, crea un cliente OAuth del tipo **Aplicación web**. En **Orígenes autorizados de JavaScript** agrega exactamente `https://web-sources-dv.github.io` (sin `/RespawnTech/`). Para probar en desarrollo puedes agregar `http://127.0.0.1:8000` y `http://localhost:8000` por separado. Este flujo usa una ventana emergente de Google; no necesita una URL de redirección de servidor.
6. Copia el **ID de cliente** que termina en `.apps.googleusercontent.com`. Es público. **No copies el secreto de cliente ni tu contraseña.**
7. En RespawnTech abre una cotización → **Enviar por Gmail** → **Configurar conexión con Google**. Pega el ID, escribe el correo del cliente y pulsa **Preparar PDF**.
8. Pulsa **Conectar Gmail y crear borrador**, elige tu cuenta y autoriza. Cuando la app confirme la creación, pulsa **Abrir borradores en Gmail**.

Usa Chrome, Edge o Safari si Google bloquea el acceso desde un navegador integrado. Permite ventanas emergentes. Si aparece `origin_mismatch`, revisa el origen del paso 5; si Google rechaza la cuenta en modo Testing, agrégala como usuario de prueba. La configuración OAuth puede tardar en propagarse. Una publicación para usuarios externos podría requerir verificación por Google; aquí se prepara el uso personal con tu cuenta de prueba.

## Privacidad y funcionamiento

- El ID público queda guardado en ese navegador. Los tokens de acceso solo viven en memoria y caducan; no se incluyen en los respaldos ni en localStorage.
- Al conectar se solicita a Google autorización. El PDF y el destinatario se transfieren a Gmail solo al pulsar el botón para crear el borrador. No se envía ningún correo al cliente desde la app.
- **Desconectar Gmail** borra la autorización en memoria y solicita revocarla. Puedes revisar permisos también en tu cuenta Google.
- Gmail requiere internet. Cotizaciones y PDF siguen funcionando sin conexión.
- Si se pierde la conexión después de crear un borrador, comprueba Borradores antes de repetir. La app no reintenta automáticamente peticiones que podrían duplicarlo.
- Las pruebas automatizadas usan respuestas simuladas de Google; no conectan cuentas ni envían mensajes. La validación real requiere tu ID OAuth y tu consentimiento.

Referencias oficiales: https://developers.google.com/identity/oauth2/web/guides/use-token-model y https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.drafts/create
