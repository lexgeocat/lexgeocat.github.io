# Contributing

## Scripts

```bash
npm run dev          # servidor de desarrollo Vite
npm run build        # build producción
npm run typecheck    # vue-tsc --noEmit
npm run lint         # eslint + --fix
npm run lint:css     # stylelint
npm run prebuild     # genera sitemap.xml
```

## Antes de hacer push

```bash
npm run typecheck
npm run lint
npm run lint:css
npm run build
```

Asegurate de que no hay warnings de eslint (`--max-warnings 0`).

## Convenciones

- **Nombres de archivos**: PascalCase para componentes Vue, camelCase para composables/utils.
- **Imports**: `../../lib/queries` desde features (moduleResolution bundler resuelve barriles).
- **Estilos**: SCSS con CSS custom properties desde `tokens.scss`. No usar valores literales.
- **Tipado**: `eslint-disable` solo como escape hatch documentado en queries genéricas de Supabase.
- **Commits**: convencional commits (`feat:`, `fix:`, `refactor:`, `chore:`).
