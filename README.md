# RespawnTech

Aplicación personal para cotizaciones y órdenes de revisión, mantenimiento e instalación de software en computadoras, laptops y consolas. Precios manuales en USD, abonos, estados, garantía fija de 15 días desde la fecha en que el equipo queda listo, documentos imprimibles y mensajes de WhatsApp.

## Preparación con script

En Linux, macOS o Git Bash, con Python 3.8+ y Node.js 20+ instalados:

```sh
bash install.sh
python3 -m http.server 8000 --bind 127.0.0.1
```

El script comprueba los requisitos y archivos, valida JavaScript y ejecuta las pruebas. No descarga paquetes, no modifica el historial y no publica la app. Puedes repetirlo sin reinstalar nada. Node.js se necesita para validar; la app publicada solo necesita un navegador.

## Desarrollo

Requiere Python 3 y, para las pruebas, Node.js 20+. No necesita instalar dependencias ni compilar.

```sh
npm start
npm test
```

También puedes ejecutar `python3 -m http.server 8000` en esta carpeta. Para producción, sirve estos archivos por HTTPS (por ejemplo, GitHub Pages desde la raíz del repositorio). No se ha publicado automáticamente.

## Uso

Crea un trabajo, selecciona los servicios y escribe sus importes. Edita su estado a medida que avances. Al marcar Listo se propone la fecha actual, editable; la garantía empieza en esa fecha y dura 15 días. El estado Entregado conserva la fecha de inicio. El abono no puede superar el total.

En Ver / PDF usa Imprimir / PDF y selecciona Guardar como PDF en el navegador. WhatsApp abre un mensaje para revisar y enviar; no adjunta archivos ni envía automáticamente. Detalla en observaciones el software instalado y usa licencias autorizadas para las activaciones.

## Sin internet y datos

Abre la app una vez con conexión mediante HTTPS o localhost y espera a que se registre el service worker. Después puede cargar y guardar trabajos sin conexión. WhatsApp requiere internet. Todos los recursos están incluidos, sin CDN.

Los trabajos se guardan en localStorage de **ese navegador y origen**, sin servidor, autenticación ni sincronización automática. Usa dispositivos y sesiones protegidas; no guardes contraseñas ni claves de licencia. Borrar los datos del navegador elimina el historial. Exporta respaldos JSON regularmente. Importar agrega referencias nuevas y conserva los registros existentes; no actualiza registros repetidos. Para ver un mismo historial en otro dispositivo, importa el respaldo; los cambios posteriores no se sincronizan.

La marca de interfaz es un monograma SVG provisional; el logo compartido en el chat debe incorporarse desde su archivo original cuando esté disponible en el repositorio.

La garantía y los términos de respaldo de datos son texto fijo no editable. La cotización vence 15 días después de su emisión; editarla conserva su fecha original. No hay login ni usuarios por técnico: la app abre directamente en el taller.

El catálogo incluye Revisión, Mantenimiento, Instalación de software, Cambio de pasta térmica, Instalación de Windows, Reparación de HDMI y Limpieza de consola. Todos los precios se ingresan manualmente. El respaldo JSON incluye el historial; no incluye credenciales.

Los archivos principales son index.html, styles.css y app.js (sin módulos ES6). El manifiesto, service worker e icono habilitan el uso sin conexión. La generación de documentos conserva la impresión nativa del navegador; no usa html2canvas ni jsPDF ni garantiza una página para textos arbitrariamente largos.

El botón Abrir WhatsApp usa `https://wa.me/` con el teléfono del cliente y un resumen de servicios, total, abono y saldo. Los números locales de 8 dígitos reciben el indicativo +507. La apertura de la app depende de la instalación y asociación de enlaces del sistema; puede aparecer WhatsApp Web o un selector. No puede forzarse la app desde una página web. Adjunta el PDF manualmente y confirma el envío.
