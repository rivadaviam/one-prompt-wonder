# Bánh Mì Vietnam — notas de implementación y QA

## Fase 0 — baseline

- El repositorio inicial contenía únicamente `.gitkeep`.
- No había `README`, manifiesto de dependencias, framework, servidor, código ni tests.
- Por lo tanto, no existía una aplicación que instalar o levantar y el baseline se considera **no ejecutable por ausencia de proyecto**, no por una regresión.
- Decisión de stack: Vite + HTML/CSS/JavaScript vanilla. Es la convención más pequeña y común para una réplica estática sin framework preexistente.

## Referencia congelada antes de la Fase 1

- URL: `https://banhmivietnam.xyz/`.
- HTML descargado con `curl` en `verificacion/referencia/original.html`.
- CSS descargado con `curl` en `verificacion/referencia/original.css`.
- JavaScript descargado para reproducir interacciones en `verificacion/referencia/original.js`.
- Paleta exacta extraída del CSS: `#f5ecd7` (brand/fondo), `#d4a373` (superficie), `#bc4749` (rojo), `#6a994e` (verde) y `#000000` (texto/progreso).
- Tipografías: `Asap Condensed` 400/700 y `Poppins` 400/700 mediante la URL de Google Fonts de la referencia.
- Los textos son los textos reales del HTML original en inglés.
- Los 44 recursos de imagen/SVG se sirven directamente desde `https://banhmivietnam.xyz/img/`; no se sustituyen por placeholders ni copias locales.
- La consigna menciona genéricamente “tarjetas de proyectos”, pero la referencia no contiene proyectos. Se interpreta como las tarjetas visuales `.fl-img` del carrusel “Fillings”, y se verifica su estado hover.

## Fase 1 — criterios de aceptación verificables

1. La home responde HTTP 200, tiene título `Bánh Mì Vietnam` y no muestra overflow horizontal a 1440 px ni a 390 px.
2. El hero ocupa el viewport y muestra menú, hashtag, títulos `Banh mi`/`Viet nam`, pronunciación, descripción y las dos imágenes reales superpuestas.
3. Se respetan la paleta y las tipografías exactas extraídas de la referencia.
4. Están presentes, en orden, Evolution, los tres hitos (1859/1958/2011), Anatomy, Fillings, Street icon y footer, con textos e imágenes reales.
5. Los links Story, Anatomy, Fillings, Street icon y Go to top responden y llevan a la sección correcta; en mobile el control Menu abre y Close/click en el menú lo cierra.
6. El carrusel de fillings se mueve automáticamente y los botones anterior/siguiente cambian la tarjeta activa.
7. Las tarjetas del carrusel muestran una respuesta visual al hover y foco accesible.
8. El scroll actualiza la barra de progreso y hace aparecer el menú flotante de desktop.
9. La composición se adapta a 390 px: navegación compacta, contenido sin desborde y secciones legibles.
10. La página no produce `pageerror`, errores de consola ni respuestas fallidas para recursos críticos durante el flujo automatizado.
11. Se guardan capturas desktop 1440 px y mobile 390 px de original y réplica, y una comparación automatizada cuantifica la similitud del primer viewport.

## Decisiones adicionales

- Se elimina únicamente Google Analytics de la réplica porque no aporta UI y genera tráfico ajeno a una entrega estática local.
- Se mantienen las librerías y versiones de la referencia (GSAP 3.15, Swiper 11, Lenis 1.1.13 e iconos Phosphor 2.1.1) para conservar animaciones y layout.
- Los estados de foco usan `:focus-visible` sin alterar el estado visual por defecto.

## Incidencia de tooling de navegador integrado

- El navegador integrado falló dos veces al inicializar, antes de abrir una pestaña, con `Cannot redefine property: process`.
- Siguiendo el límite de dos intentos, no se volvió a intentar esa superficie. La verificación reproducible del repositorio usa el script Playwright solicitado y Chromium.

## Fases 3 y 4 — resultado final

- Chromium de Playwright arrancó en el primer intento.
- Vuelta 1: el assert del texto del hero no contemplaba los saltos de línea que agrega SplitText; se corrigió el assert manteniendo el texto exacto.
- Vuelta 2: se detectaron dos `pageerror` del original en la animación Street por usar `.from()` con firma de `.fromTo()`; se corrigieron ambos timelines.
- Vuelta 3: se detectaron callbacks `onComplete` inválidos heredados del original (`play()` se ejecutaba al construir el timeline); se convirtieron en funciones.
- Vuelta 4: el assert del menú mobile observaba el estado antes de terminar la transición GSAP de 500 ms; se alineó la espera con la animación real.
- Vuelta 5: QA funcional aprobado en desktop y mobile, sin errores de consola, `pageerror` ni recursos críticos fallidos.
- Comparación visual final del primer viewport: **0.000% de diferencia desktop** (1440×1000) y **0.000% mobile** (390×844).
- Capturas y diffs: `verificacion/original-desktop.png`, `verificacion/replica-desktop.png`, `verificacion/diff-desktop.png`, y sus equivalentes mobile.
- `npm run build` finalizó correctamente y el preview de producción respondió HTTP 200, incluyendo `dist/script.js` con todas las interacciones.
- No había tests iniciales que preservar. El nuevo `npm test` quedó aprobado.
- No quedan criterios sin resolver.
