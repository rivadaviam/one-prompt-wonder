# Bánh Mì Vietnam — réplica estática

Réplica estática y responsive de la home pública de [banhmivietnam.xyz](https://banhmivietnam.xyz/), realizada con Vite y JavaScript vanilla. Conserva textos, paleta, tipografías, recursos gráficos y transiciones de la referencia.

## Uso

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://127.0.0.1:5173/`.

## Verificación

```bash
npx playwright install chromium
npm test
npm run build
```

El script de QA valida desktop y mobile, interacciones, consola, recursos, navegación, carousel y estados hover. Las capturas quedan en `verificacion/`.
