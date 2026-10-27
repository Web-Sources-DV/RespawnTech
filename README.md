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

En Ver / PDF usa Descargar PDF para generar directamente un archivo Carta de una página, con logo y texto seleccionable. WhatsApp abre un mensaje para revisar y enviar; no adjunta archivos ni envía automáticamente. Detalla en observaciones el software instalado y usa licencias autorizadas para las activaciones.

## Sin internet y datos

Abre la app una vez con conexión mediante HTTPS o localhost y espera a que se registre el service worker. Después puede cargar y guardar trabajos sin conexión. WhatsApp requiere internet. Todos los recursos están incluidos, sin CDN.

Los trabajos se guardan en localStorage de **ese navegador y origen**, sin servidor, autenticación ni sincronización automática. Usa dispositivos y sesiones protegidas; no guardes contraseñas ni claves de licencia. Borrar los datos del navegador elimina el historial. Exporta respaldos JSON regularmente. Importar agrega referencias nuevas y conserva los registros existentes; no actualiza registros repetidos. Para ver un mismo historial en otro dispositivo, importa el respaldo; los cambios posteriores no se sincronizan.

Usa el botón Logo para abrir la ventana de marca y seleccionar una imagen PNG, JPG o WebP (hasta 5 MB). También admite arrastrar la imagen o pegarla con Ctrl+V / ⌘V. Si el navegador integrado no abre el selector, pega la imagen o usa Chrome, Edge o Safari. Se guarda en ese navegador y se incluye en la imagen de marca de la esquina superior izquierda, el icono de la pestaña, la vista previa y el PDF; por defecto se usa el monograma RT. El logo no forma parte del respaldo de cotizaciones: cárgalo también en cada dispositivo.

La garantía y los términos de respaldo de datos son texto fijo no editable. La cotización vence 15 días después de su emisión; editarla conserva su fecha original. No hay login ni usuarios por técnico: la app abre directamente en el taller.

El catálogo incluye Revisión, Mantenimiento, Instalación de software, Cambio de pasta térmica, Instalación de Windows, Reparación de HDMI y Limpieza de consola. Todos los precios se ingresan manualmente. El respaldo JSON incluye el historial; no incluye credenciales.

Los archivos principales son index.html, styles.css y app.js (sin módulos ES6). El manifiesto, service worker e icono habilitan el uso sin conexión. El PDF se genera con jsPDF 4.2.1 incluido localmente en vendor/ (licencia MIT). El generador mide el contenido y ajusta su tamaño para mantenerlo en una página Carta; textos muy largos tendrán una fuente menor. No depende de un CDN ni del diálogo de impresión. El lema es «Nosotros reparamos. Tú vuelves a disfrutar.».

El botón Abrir WhatsApp usa `https://wa.me/` con el teléfono del cliente y un resumen de servicios, total, abono y saldo. Los números locales de 8 dígitos reciben el indicativo +507. La apertura de la app depende de la instalación y asociación de enlaces del sistema; puede aparecer WhatsApp Web o un selector. No puede forzarse la app desde una página web. Adjunta el PDF manualmente y confirma el envío.

## Referencias

Las referencias visibles son RT-0001, RT-0002, etc. El identificador interno distingue las cotizaciones para editar e importar respaldos. Los registros antiguos con UUID conservan ese identificador y muestran solo el consecutivo. Editar mantiene la referencia. La siguiente se calcula consultando el mayor consecutivo del historial y el contador anterior; no vuelve a 0001 por perder el contador si el historial permanece. Los navegadores con Web Locks coordinan el guardado entre pestañas. El consecutivo es local: no hay numeración central compartida entre dispositivos.

## Actualizar la app

El pie muestra la versión instalada. Pulsa Actualizar app con conexión para solicitar una navegación nueva sin borrar las cotizaciones ni el logo. Los recursos llevan una versión en su URL y el service worker consulta la red sin reutilizar la caché HTTP; la copia sin conexión se conserva para cuando no haya red. Si no ves el botón en una versión anterior, abre la dirección de la app con `?actualizar=202610263`. El despliegue de GitHub Pages debe haber terminado antes.

## Prueba del cargador de logo en navegador

Con el servidor local activo y Playwright disponible en tu entorno de pruebas, ejecuta `node scripts/check-logo.cjs`. Usa el Chromium de Playwright o indica su ejecutable mediante `RESPAWN_BROWSER_PATH`. La URL predeterminada es `http://127.0.0.1:8000`; puedes cambiarla con `RESPAWN_TEST_URL`. Esta prueba utiliza un contexto de navegador aislado y no cambia el historial real. Playwright es solo una herramienta de validación opcional; la app publicada no lo necesita.

## Correo mediante Gmail

En Ver / PDF encontrarás Enviar por Gmail. Prepara el documento y conecta tu cuenta para crear un borrador con PDF adjunto y cuerpo vacío. Abre Borradores en Gmail para escribir y confirmar el envío. Requiere un ID OAuth web de tu proyecto de Google Cloud y autorización de tu cuenta; sigue [Conectar Gmail](GMAIL.md). No hay contraseñas de Gmail ni secretos de cliente en la app. La integración real queda pendiente hasta configurar ese ID.
