// Sistema de temas multi-eje (portado desde F:\Apps_web\legal-hub\src\ui\_core\tema.ts)

export type ColorScheme = 'light' | 'dark'
export type PrimaryId =
  | 'blue'
  | 'indigo'
  | 'emerald'
  | 'teal'
  | 'sky'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'noir'
export type SurfaceId =
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | 'soho'
  | 'viva'
  | 'ocean'
  | 'rose'
export type PresetId = 'aura' | 'lara' | 'nora'
export type LayoutTheme = 'color-scheme' | 'primary'

export interface ConfigTema {
  colorScheme: ColorScheme
  primary: PrimaryId
  surface: SurfaceId
  preset: PresetId
  layoutTheme: LayoutTheme
}

export interface InfoPrimario {
  id: PrimaryId
  nombre: string
  swatch: string
  primario: string
  primarioH: string
  primarioOscuro: string
  primarioHOscuro: string
  primarioInkOscuro: string
  rgb: string
  dorado: string
  doradoBg: string
  doradoBorde: string
  navBg: string
  navSolido: string
  navPopover: string
  navBorde: string
  navTexto: string
  navTextoMutado: string
  navTextoCab: string
  navHover: string
  navLogoBg: string
  navLogoBorde: string
  navLogoColor: string
  barLightBg: string
  barLightBg2: string
  barLightBorde: string
}

export interface EscalaSuperficie {
  bg: string
  superficie: string
  superficie2: string
  superficie3: string
  borde: string
  bordeFuerte: string
  texto: string
  texto2: string
  texto3: string
  desk: string
  reglaZona: string
  reglaPapel: string
  navBg: string
  navSolido: string
  navPopover: string
  navBorde: string
  navTexto: string
  navMutado: string
  navCab: string
  navHover: string
  navPillBg: string
  barBg: string
  barBg2: string
  barBorde: string
  barTexto: string
  barTexto2: string
  barTexto3: string
}

export interface InfoSuperficie {
  id: SurfaceId
  nombre: string
  swatchFondo: string
  swatchTarjeta: string
  claro: EscalaSuperficie
  oscuro: EscalaSuperficie
}

export interface InfoPreset {
  id: PresetId
  nombre: string
  descripcion: string
  radioSm: string
  radio: string
  radioLg: string
  sombraCardClaro: string
  sombraCardOscuro: string
}

export interface PerfilTema {
  id: string
  nombre: string
  subtitulo: string
  config: ConfigTema
}

const DORADO_INSTITUCIONAL = {
  dorado: '#b45309',
  doradoBg: 'rgba(217, 119, 6, 0.12)',
  doradoBorde: 'rgba(217, 119, 6, 0.30)',
} as const

export const PRIMARIOS: InfoPrimario[] = [
  {
    id: 'blue',
    nombre: 'Cobalt',
    swatch: '#2563eb',
    primario: '#1d4ed8',
    primarioH: '#1e40af',
    primarioOscuro: '#2563eb',
    primarioHOscuro: '#3b82f6',
    primarioInkOscuro: '#60a5fa',
    rgb: '37, 99, 235',
    ...DORADO_INSTITUCIONAL,
    navBg: 'linear-gradient(180deg, #0e172f 0%, #080f21 100%)',
    navSolido: '#0e172f',
    navPopover: '#132042',
    navBorde: 'rgba(255, 255, 255, 0.09)',
    navTexto: '#d7e0f5',
    navTextoMutado: '#8a98bf',
    navTextoCab: '#9eadd6',
    navHover: 'rgba(255, 255, 255, 0.08)',
    navLogoBg: 'linear-gradient(135deg, #1e3a8a, #0b1329)',
    navLogoBorde: 'rgba(245, 158, 11, 0.45)',
    navLogoColor: '#fbbf24',
    barLightBg: '#122044',
    barLightBg2: '#1b2f61',
    barLightBorde: '#294485',
  },
  {
    id: 'indigo',
    nombre: 'Indigo',
    swatch: '#4f46e5',
    primario: '#4338ca',
    primarioH: '#3730a3',
    primarioOscuro: '#4f46e5',
    primarioHOscuro: '#6366f1',
    primarioInkOscuro: '#818cf8',
    rgb: '79, 70, 229',
    ...DORADO_INSTITUCIONAL,
    navBg: 'linear-gradient(180deg, #17153b 0%, #0f0e29 100%)',
    navSolido: '#17153b',
    navPopover: '#201d52',
    navBorde: 'rgba(224, 231, 255, 0.11)',
    navTexto: '#e0e7ff',
    navTextoMutado: '#9aa0d6',
    navTextoCab: '#b4bbf0',
    navHover: 'rgba(255, 255, 255, 0.08)',
    navLogoBg: 'linear-gradient(135deg, #3730a3, #17153b)',
    navLogoBorde: 'rgba(165, 180, 252, 0.48)',
    navLogoColor: '#c7d2fe',
    barLightBg: '#1c194a',
    barLightBg2: '#282466',
    barLightBorde: '#3d378f',
  },
  {
    id: 'emerald',
    nombre: 'Emerald',
    swatch: '#10b981',
    primario: '#047857',
    primarioH: '#065f46',
    primarioOscuro: '#047857',
    primarioHOscuro: '#059669',
    primarioInkOscuro: '#34d399',
    rgb: '16, 185, 129',
    ...DORADO_INSTITUCIONAL,
    navBg: 'linear-gradient(180deg, #0b241d 0%, #061712 100%)',
    navSolido: '#0b241d',
    navPopover: '#11352b',
    navBorde: 'rgba(209, 250, 229, 0.11)',
    navTexto: '#d1fae5',
    navTextoMutado: '#7ebaa0',
    navTextoCab: '#9bd4bb',
    navHover: 'rgba(255, 255, 255, 0.08)',
    navLogoBg: 'linear-gradient(135deg, #065f46, #062119)',
    navLogoBorde: 'rgba(110, 231, 183, 0.45)',
    navLogoColor: '#6ee7b7',
    barLightBg: '#0c2b22',
    barLightBg2: '#133f32',
    barLightBorde: '#1e5c4a',
  },
  {
    id: 'teal',
    nombre: 'Teal',
    swatch: '#14b8a6',
    primario: '#0f766e',
    primarioH: '#115e59',
    primarioOscuro: '#0f766e',
    primarioHOscuro: '#0d9488',
    primarioInkOscuro: '#2dd4bf',
    rgb: '20, 184, 166',
    ...DORADO_INSTITUCIONAL,
    navBg: 'linear-gradient(180deg, #0b2325 0%, #061617 100%)',
    navSolido: '#0b2325',
    navPopover: '#113336',
    navBorde: 'rgba(204, 251, 241, 0.11)',
    navTexto: '#ccfbf1',
    navTextoMutado: '#7db9b5',
    navTextoCab: '#9bd2ce',
    navHover: 'rgba(255, 255, 255, 0.08)',
    navLogoBg: 'linear-gradient(135deg, #115e59, #071e20)',
    navLogoBorde: 'rgba(94, 234, 212, 0.45)',
    navLogoColor: '#5eead4',
    barLightBg: '#0c2a2d',
    barLightBg2: '#133d41',
    barLightBorde: '#1f5a60',
  },
  {
    id: 'sky',
    nombre: 'Sky',
    swatch: '#0ea5e9',
    primario: '#0369a1',
    primarioH: '#075985',
    primarioOscuro: '#0284c7',
    primarioHOscuro: '#0ea5e9',
    primarioInkOscuro: '#38bdf8',
    rgb: '14, 165, 233',
    ...DORADO_INSTITUCIONAL,
    navBg: 'linear-gradient(180deg, #0b2136 0%, #071524 100%)',
    navSolido: '#0b2136',
    navPopover: '#11304d',
    navBorde: 'rgba(224, 242, 254, 0.11)',
    navTexto: '#e0f2fe',
    navTextoMutado: '#82b3d6',
    navTextoCab: '#a0cbe8',
    navHover: 'rgba(255, 255, 255, 0.08)',
    navLogoBg: 'linear-gradient(135deg, #075985, #081c2e)',
    navLogoBorde: 'rgba(125, 211, 252, 0.45)',
    navLogoColor: '#7dd3fc',
    barLightBg: '#0c2640',
    barLightBg2: '#13385c',
    barLightBorde: '#1d5285',
  },
  {
    id: 'violet',
    nombre: 'Violet',
    swatch: '#8b5cf6',
    primario: '#6d28d9',
    primarioH: '#5b21b6',
    primarioOscuro: '#7c3aed',
    primarioHOscuro: '#8b5cf6',
    primarioInkOscuro: '#a78bfa',
    rgb: '139, 92, 246',
    ...DORADO_INSTITUCIONAL,
    navBg: 'linear-gradient(180deg, #1d1438 0%, #130b26 100%)',
    navSolido: '#1d1438',
    navPopover: '#291c4f',
    navBorde: 'rgba(237, 233, 254, 0.11)',
    navTexto: '#ede9fe',
    navTextoMutado: '#a696d9',
    navTextoCab: '#c0b3ed',
    navHover: 'rgba(255, 255, 255, 0.08)',
    navLogoBg: 'linear-gradient(135deg, #5b21b6, #18102e)',
    navLogoBorde: 'rgba(196, 181, 253, 0.48)',
    navLogoColor: '#ddd6fe',
    barLightBg: '#231845',
    barLightBg2: '#322263',
    barLightBorde: '#4b338f',
  },
  {
    id: 'rose',
    nombre: 'Rose',
    swatch: '#b8466e',
    primario: '#9d4466',
    primarioH: '#833452',
    primarioOscuro: '#be406a',
    primarioHOscuro: '#d65681',
    primarioInkOscuro: '#f472b6',
    rgb: '190, 64, 106',
    dorado: '#a87650',
    doradoBg: 'rgba(200, 157, 124, 0.16)',
    doradoBorde: 'rgba(200, 157, 124, 0.35)',
    navBg: 'linear-gradient(180deg, #22111a 0%, #160810 100%)',
    navSolido: '#22111a',
    navPopover: '#2f1824',
    navBorde: 'rgba(244, 215, 222, 0.12)',
    navTexto: '#f3d6df',
    navTextoMutado: '#b8889a',
    navTextoCab: '#d1a3b4',
    navHover: 'rgba(244, 114, 182, 0.10)',
    navLogoBg: 'linear-gradient(135deg, #601e37, #1f0c16)',
    navLogoBorde: 'rgba(200, 157, 124, 0.60)',
    navLogoColor: '#fce7f3',
    barLightBg: '#2b1420',
    barLightBg2: '#3f1e2f',
    barLightBorde: '#5c2d45',
  },
  {
    id: 'amber',
    nombre: 'Amber',
    swatch: '#d97706',
    primario: '#b45309',
    primarioH: '#92400e',
    primarioOscuro: '#b45309',
    primarioHOscuro: '#d97706',
    primarioInkOscuro: '#fbbf24',
    rgb: '217, 119, 6',
    dorado: '#b45309',
    doradoBg: 'rgba(217, 119, 6, 0.16)',
    doradoBorde: 'rgba(217, 119, 6, 0.35)',
    navBg: 'linear-gradient(180deg, #24190d 0%, #170f07 100%)',
    navSolido: '#24190d',
    navPopover: '#332413',
    navBorde: 'rgba(254, 243, 199, 0.12)',
    navTexto: '#fef3c7',
    navTextoMutado: '#c7a474',
    navTextoCab: '#dfc092',
    navHover: 'rgba(255, 255, 255, 0.08)',
    navLogoBg: 'linear-gradient(135deg, #92400e, #24190d)',
    navLogoBorde: 'rgba(251, 191, 36, 0.5)',
    navLogoColor: '#fde68a',
    barLightBg: '#2d1e0f',
    barLightBg2: '#422c17',
    barLightBorde: '#634324',
  },
  {
    id: 'noir',
    nombre: 'Noir',
    swatch: '#334155',
    primario: '#1e293b',
    primarioH: '#0f172a',
    primarioOscuro: '#334155',
    primarioHOscuro: '#475569',
    primarioInkOscuro: '#e2e8f0',
    rgb: '100, 116, 139',
    ...DORADO_INSTITUCIONAL,
    navBg: 'linear-gradient(180deg, #111318 0%, #090b0e 100%)',
    navSolido: '#111318',
    navPopover: '#1b1f27',
    navBorde: 'rgba(255, 255, 255, 0.10)',
    navTexto: '#e2e8f0',
    navTextoMutado: '#94a3b8',
    navTextoCab: '#b0bac9',
    navHover: 'rgba(255, 255, 255, 0.08)',
    navLogoBg: 'linear-gradient(135deg, #334155, #0f172a)',
    navLogoBorde: 'rgba(148, 163, 184, 0.45)',
    navLogoColor: '#f8fafc',
    barLightBg: '#161920',
    barLightBg2: '#232833',
    barLightBorde: '#373f4f',
  },
]

interface PaletaSuperficie {
  id: SurfaceId
  nombre: string
  s0: string
  s50: string
  s100: string
  s200: string
  s300: string
  s400: string
  s500: string
  s600: string
  s700: string
  s800: string
  s900: string
  s950: string
}

/** Construye escalas Light y Dark alineadas al sistema Verona PrimeReact. */
function crearSuperficie(p: PaletaSuperficie): InfoSuperficie {
  return {
    id: p.id,
    nombre: p.nombre,
    swatchFondo: p.s600,
    swatchTarjeta: p.s300,
    claro: {
      bg: p.s100,
      superficie: p.s0,
      superficie2: p.s50,
      superficie3: p.s200,
      borde: p.s200,
      bordeFuerte: p.s300,
      texto: p.s900,
      texto2: p.s700,
      texto3: p.s500,
      desk: p.s200,
      reglaZona: p.s100,
      reglaPapel: p.s0,
      navBg: `linear-gradient(180deg, ${p.s0} 0%, ${p.s50} 100%)`,
      navSolido: p.s0,
      navPopover: p.s0,
      navBorde: p.s200,
      navTexto: p.s900,
      navMutado: p.s500,
      navCab: p.s600,
      navHover: p.s100,
      navPillBg: p.s100,
      barBg: p.s50,
      barBg2: p.s100,
      barBorde: p.s200,
      barTexto: p.s900,
      barTexto2: p.s700,
      barTexto3: p.s500,
    },
    oscuro: {
      bg: p.s950,
      superficie: p.s900,
      superficie2: p.s800,
      superficie3: p.s700,
      borde: p.s800,
      bordeFuerte: p.s700,
      texto: p.s50,
      texto2: p.s300,
      texto3: p.s400,
      desk: p.s950,
      reglaZona: p.s900,
      reglaPapel: p.s800,
      navBg: `linear-gradient(180deg, ${p.s900} 0%, ${p.s950} 100%)`,
      navSolido: p.s900,
      navPopover: p.s800,
      navBorde: p.s800,
      navTexto: p.s100,
      navMutado: p.s400,
      navCab: p.s400,
      navHover: 'rgba(255, 255, 255, 0.08)',
      navPillBg: 'rgba(255, 255, 255, 0.06)',
      barBg: p.s900,
      barBg2: p.s800,
      barBorde: p.s800,
      barTexto: p.s50,
      barTexto2: p.s300,
      barTexto3: p.s400,
    },
  }
}

export const SUPERFICIES: InfoSuperficie[] = [
  crearSuperficie({
    id: 'slate',
    nombre: 'Slate',
    s0: '#ffffff',
    s50: '#f8fafc',
    s100: '#f1f5f9',
    s200: '#e2e8f0',
    s300: '#cbd5e1',
    s400: '#94a3b8',
    s500: '#64748b',
    s600: '#475569',
    s700: '#334155',
    s800: '#1e293b',
    s900: '#131c2e',
    s950: '#090e1a',
  }),
  crearSuperficie({
    id: 'gray',
    nombre: 'Gray',
    s0: '#ffffff',
    s50: '#f9fafb',
    s100: '#f3f4f6',
    s200: '#e5e7eb',
    s300: '#d1d5db',
    s400: '#9ca3af',
    s500: '#6b7280',
    s600: '#4b5563',
    s700: '#374151',
    s800: '#1f2937',
    s900: '#151c28',
    s950: '#0b0f17',
  }),
  crearSuperficie({
    id: 'zinc',
    nombre: 'Zinc',
    s0: '#ffffff',
    s50: '#fafafa',
    s100: '#f4f4f5',
    s200: '#e4e4e7',
    s300: '#d4d4d8',
    s400: '#a1a1aa',
    s500: '#71717a',
    s600: '#52525b',
    s700: '#3f3f46',
    s800: '#27272a',
    s900: '#18181b',
    s950: '#09090b',
  }),
  crearSuperficie({
    id: 'neutral',
    nombre: 'Neutral',
    s0: '#ffffff',
    s50: '#fafafa',
    s100: '#f5f5f5',
    s200: '#e5e5e5',
    s300: '#d4d4d4',
    s400: '#a3a3a3',
    s500: '#737373',
    s600: '#525252',
    s700: '#404040',
    s800: '#262626',
    s900: '#171717',
    s950: '#0a0a0a',
  }),
  crearSuperficie({
    id: 'stone',
    nombre: 'Stone',
    s0: '#ffffff',
    s50: '#fafaf9',
    s100: '#f5f5f4',
    s200: '#e7e5e4',
    s300: '#d6d3d1',
    s400: '#a8a29e',
    s500: '#78716c',
    s600: '#57534e',
    s700: '#44403c',
    s800: '#292524',
    s900: '#1c1917',
    s950: '#0c0a09',
  }),
  crearSuperficie({
    id: 'soho',
    nombre: 'Soho',
    s0: '#ffffff',
    s50: '#f7f6fb',
    s100: '#efedf7',
    s200: '#dfdce9',
    s300: '#c8c3dc',
    s400: '#9b94ba',
    s500: '#6e6694',
    s600: '#524b73',
    s700: '#3d3759',
    s800: '#2c2742',
    s900: '#1f1b30',
    s950: '#12101d',
  }),
  crearSuperficie({
    id: 'viva',
    nombre: 'Viva',
    s0: '#ffffff',
    s50: '#f4f7fc',
    s100: '#eaf0f9',
    s200: '#d7e2f2',
    s300: '#bacae3',
    s400: '#849dc4',
    s500: '#54719e',
    s600: '#3b537a',
    s700: '#2c4061',
    s800: '#1f2e47',
    s900: '#152035',
    s950: '#0b1220',
  }),
  crearSuperficie({
    id: 'ocean',
    nombre: 'Ocean',
    s0: '#ffffff',
    s50: '#f2f9fb',
    s100: '#e6f3f7',
    s200: '#cee5ec',
    s300: '#acd0db',
    s400: '#72a7b8',
    s500: '#3f7f94',
    s600: '#2a6073',
    s700: '#1f4b5c',
    s800: '#163744',
    s900: '#0f2630',
    s950: '#07161d',
  }),
  crearSuperficie({
    id: 'rose',
    nombre: 'Rose Quartz',
    s0: '#ffffff',
    s50: '#fcf6f7',
    s100: '#f8ecee',
    s200: '#ebd5d9',
    s300: '#dab9bf',
    s400: '#b88993',
    s500: '#915d69',
    s600: '#6e414c',
    s700: '#543039',
    s800: '#3d2128',
    s900: '#29151b',
    s950: '#160b0e',
  }),
]

export const PRESETS: InfoPreset[] = [
  {
    id: 'aura',
    nombre: 'Aura',
    descripcion: 'Equilibrado moderno con bordes finos y sombras limpias.',
    radioSm: '6px',
    radio: '10px',
    radioLg: '14px',
    sombraCardClaro: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.06)',
    sombraCardOscuro: '0 3px 10px rgba(8, 13, 24, 0.26)',
  },
  {
    id: 'lara',
    nombre: 'Lara',
    descripcion: 'Suave clásico con tarjetas más redondeadas y relieve envolvente.',
    radioSm: '8px',
    radio: '13px',
    radioLg: '18px',
    sombraCardClaro: '0 3px 10px -1px rgba(15, 23, 42, 0.09), 0 1px 3px rgba(15, 23, 42, 0.06)',
    sombraCardOscuro: '0 6px 18px rgba(8, 13, 24, 0.34)',
  },
  {
    id: 'nora',
    nombre: 'Nora',
    descripcion: 'Ejecutivo compacto con trazos rectos y mayor definición.',
    radioSm: '4px',
    radio: '6px',
    radioLg: '9px',
    sombraCardClaro: '0 1px 2px rgba(15, 23, 42, 0.07)',
    sombraCardOscuro: '0 2px 6px rgba(8, 13, 24, 0.28)',
  },
]

export const PERFILES_TEMAS: PerfilTema[] = [
  {
    id: 'oxford-imperial',
    nombre: 'Oxford Imperial',
    subtitulo: 'Light · Cobalt + Slate · Aura',
    config: { colorScheme: 'light', primary: 'blue', surface: 'slate', preset: 'aura', layoutTheme: 'primary' },
  },
  {
    id: 'magna-carta',
    nombre: 'Magna Carta',
    subtitulo: 'Light · Noir + Stone · Nora',
    config: { colorScheme: 'light', primary: 'noir', surface: 'stone', preset: 'nora', layoutTheme: 'primary' },
  },
  {
    id: 'obsidian-gold',
    nombre: 'Obsidian Gold',
    subtitulo: 'Dark · Amber + Soho · Aura',
    config: { colorScheme: 'dark', primary: 'amber', surface: 'soho', preset: 'aura', layoutTheme: 'color-scheme' },
  },
  {
    id: 'verona-abyssal',
    nombre: 'Verona Abyssal',
    subtitulo: 'Dark · Teal + Ocean · Lara',
    config: { colorScheme: 'dark', primary: 'teal', surface: 'ocean', preset: 'lara', layoutTheme: 'color-scheme' },
  },
]

const CLAVE_CONFIG = 'lgc_tema_config_v2'
const CLAVE_LEGACY = 'lgc-theme'
const oyentes = new Set<(c: ConfigTema) => void>()

function validarId<T extends string>(lista: readonly { id: T }[], v: unknown, fallback: T): T {
  return lista.some((item) => item.id === v) ? (v as T) : fallback
}

function normalizarConfigTema(raw: Partial<ConfigTema>): ConfigTema {
  return {
    colorScheme: raw.colorScheme === 'dark' ? 'dark' : 'light',
    primary: validarId(PRIMARIOS, raw.primary, 'blue'),
    surface: validarId(SUPERFICIES, raw.surface, 'slate'),
    preset: validarId(PRESETS, raw.preset, 'aura'),
    layoutTheme: raw.layoutTheme === 'color-scheme' ? 'color-scheme' : 'primary',
  }
}

/** Migra un esquema legado ('dark' | 'light') al modelo completo de 5 ejes. */
export function migrarTemaLegacy(val: string | null | undefined): ConfigTema {
  if (val === 'dark') {
    return { ...PERFILES_TEMAS[2].config }
  }
  return { ...PERFILES_TEMAS[0].config }
}

/** Lee la configuración de tema persistida o detecta preferencia del sistema. */
export function obtenerConfigTema(): ConfigTema {
  try {
    const raw = localStorage.getItem(CLAVE_CONFIG)
    if (raw) {
      return normalizarConfigTema(JSON.parse(raw) as Partial<ConfigTema>)
    }
    const legacy = localStorage.getItem(CLAVE_LEGACY)
    if (legacy) return migrarTemaLegacy(legacy)
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return { ...PERFILES_TEMAS[2].config }
    }
  } catch {
    // fallback seguro
  }
  return { ...PERFILES_TEMAS[0].config }
}

/** Aplica todos los design tokens CSS y atributos semánticos sobre <html>. */
export function aplicarTemaAlDocumento(cfg: ConfigTema): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const p = PRIMARIOS.find((x) => x.id === cfg.primary) ?? PRIMARIOS[0]
  const s = SUPERFICIES.find((x) => x.id === cfg.surface) ?? SUPERFICIES[0]
  const pr = PRESETS.find((x) => x.id === cfg.preset) ?? PRESETS[0]
  const esOscuro = cfg.colorScheme === 'dark'
  const navClaro = !esOscuro && cfg.layoutTheme === 'color-scheme'

  root.setAttribute('data-color-scheme', cfg.colorScheme)
  root.setAttribute('data-primary', cfg.primary)
  root.setAttribute('data-surface', cfg.surface)
  root.setAttribute('data-preset', cfg.preset)
  root.setAttribute('data-layout-theme', cfg.layoutTheme)
  if (navClaro) root.setAttribute('data-nav-claro', 'true')
  else root.removeAttribute('data-nav-claro')

  const st = root.style
  st.colorScheme = cfg.colorScheme

  /* 1. Geometría del Preset */
  st.setProperty('--radio-sm', pr.radioSm)
  st.setProperty('--radio', pr.radio)
  st.setProperty('--radio-lg', pr.radioLg)
  const radioLgNum = Number.parseInt(pr.radioLg, 10) || 14
  st.setProperty('--rs', pr.radioSm)
  st.setProperty('--r', pr.radio)
  st.setProperty('--rm', pr.radioLg)
  st.setProperty('--rl', `${radioLgNum + 6}px`)

  if (esOscuro) {
    const d = s.oscuro
    st.setProperty('--bg', d.bg)
    st.setProperty('--superficie', d.superficie)
    st.setProperty('--superficie-2', d.superficie2)
    st.setProperty('--superficie-3', d.superficie3)
    st.setProperty('--borde', d.borde)
    st.setProperty('--borde-fuerte', d.bordeFuerte)
    st.setProperty('--texto', d.texto)
    st.setProperty('--texto-2', d.texto2)
    st.setProperty('--texto-3', d.texto3)
    st.setProperty('--ed-desk', d.desk)
    st.setProperty('--regla-zona', d.reglaZona)
    st.setProperty('--regla-papel', d.reglaPapel)
    st.setProperty('--pg-hoja', '#ffffff')

    st.setProperty('--primario', p.primarioOscuro)
    st.setProperty('--primario-h', p.primarioHOscuro)
    st.setProperty('--primario-texto', p.primarioInkOscuro)
    st.setProperty('--primario-claro', `rgba(${p.rgb}, 0.16)`)
    st.setProperty('--primario-borde', `rgba(${p.rgb}, 0.38)`)
    st.setProperty('--dorado', '#fbbf24')
    st.setProperty('--dorado-bg', 'rgba(245, 158, 11, 0.16)')
    st.setProperty('--dorado-borde', 'rgba(251, 191, 36, 0.36)')

    st.setProperty('--ok', '#4ade80')
    st.setProperty('--ok-bg', 'rgba(34, 197, 94, 0.16)')
    st.setProperty('--ok-borde', 'rgba(74, 222, 128, 0.34)')
    st.setProperty('--adv', '#fbbf24')
    st.setProperty('--adv-bg', 'rgba(245, 158, 11, 0.16)')
    st.setProperty('--adv-borde', 'rgba(251, 191, 36, 0.34)')
    st.setProperty('--err', '#fb7185')
    st.setProperty('--err-bg', 'rgba(244, 63, 94, 0.16)')
    st.setProperty('--err-borde', 'rgba(251, 113, 133, 0.34)')
    st.setProperty('--info', p.primarioInkOscuro)
    st.setProperty('--info-bg', `rgba(${p.rgb}, 0.16)`)
    st.setProperty('--info-borde', `rgba(${p.rgb}, 0.36)`)
    st.setProperty('--violeta', '#c084fc')
    st.setProperty('--violeta-bg', 'rgba(168, 85, 247, 0.16)')
    st.setProperty('--violeta-borde', 'rgba(192, 132, 252, 0.34)')

    st.setProperty('--bar-bg', d.barBg)
    st.setProperty('--bar-bg-2', d.barBg2)
    st.setProperty('--bar-borde', d.barBorde)
    st.setProperty('--bar-texto', d.barTexto)
    st.setProperty('--bar-texto-2', d.barTexto2)
    st.setProperty('--bar-texto-3', d.barTexto3)

    st.setProperty('--nav-bg', d.navBg)
    st.setProperty('--nav-bg-solido', d.navSolido)
    st.setProperty('--nav-popover-bg', d.navPopover)
    st.setProperty('--nav-borde', d.navBorde)
    st.setProperty('--nav-texto', d.navTexto)
    st.setProperty('--nav-texto-mutado', d.navMutado)
    st.setProperty('--nav-texto-cab', d.navCab)
    st.setProperty('--nav-hover', d.navHover)
    st.setProperty('--nav-hover-texto', '#ffffff')
    st.setProperty('--nav-titulo', d.barTexto)
    st.setProperty('--nav-pill-bg', d.navPillBg)
    st.setProperty('--nav-pill-borde', d.navBorde)
    st.setProperty(
      '--nav-activo-bg',
      `linear-gradient(135deg, ${p.primarioOscuro} 0%, ${p.primario} 100%)`,
    )
    st.setProperty('--nav-activo-texto', '#ffffff')
    st.setProperty(
      '--nav-activo-sombra',
      `0 2px 12px rgba(${p.rgb}, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.18)`,
    )
    st.setProperty('--nav-focus', p.primarioInkOscuro)
    st.setProperty('--nav-focus-halo', `rgba(${p.rgb}, 0.30)`)
    st.setProperty('--nav-badge-bg', p.primarioOscuro)
    st.setProperty('--nav-logo-bg', p.navLogoBg)
    st.setProperty('--nav-logo-borde', p.navLogoBorde)
    st.setProperty('--nav-logo-color', p.navLogoColor)
    st.setProperty('--nav-brand-lex', d.barTexto)
    st.setProperty('--nav-brand-geo', d.barTexto)
    st.setProperty('--nav-brand-cat', d.barTexto)
    st.setProperty('--nav-accent', p.primarioInkOscuro)

    st.setProperty('--sombra-xs', '0 1px 2px rgba(2, 6, 23, 0.35)')
    st.setProperty('--sombra', pr.sombraCardOscuro)
    st.setProperty('--sombra-md', '0 8px 24px rgba(2, 6, 23, 0.45)')
    st.setProperty(
      '--sombra-lg',
      '0 20px 48px rgba(2, 6, 23, 0.62), 0 0 0 1px rgba(255, 255, 255, 0.06)',
    )

    /* Aliases semánticos del sitio sobre el sistema Verona Dark */
    st.setProperty('--color-bg-primary', d.bg)
    st.setProperty('--color-bg-surface', d.superficie2)
    st.setProperty('--color-bg-card', d.superficie)
    st.setProperty('--color-bg-elevated', d.superficie3)
    st.setProperty('--color-border', d.borde)
    st.setProperty('--color-border-strong', d.bordeFuerte)
    st.setProperty('--color-border-highlight', d.bordeFuerte)
    st.setProperty('--color-text-primary', d.texto)
    st.setProperty('--color-text-secondary', d.texto2)
    st.setProperty('--color-text-muted', d.texto3)
    st.setProperty('--color-text-subtle', d.texto3)
    st.setProperty('--color-copper', p.primarioInkOscuro)
    st.setProperty('--color-copper-glow', p.primarioHOscuro)
    st.setProperty('--color-copper-deep', p.primarioOscuro)
    st.setProperty('--color-sapphire', '#4ea0e6')
    st.setProperty('--color-sapphire-glow', '#7cc0f8')
    st.setProperty('--color-teal', '#28c7b5')
    st.setProperty('--color-teal-glow', '#4be2d0')
    st.setProperty('--color-amber', '#fbbf24')
    st.setProperty('--color-grid-line', `rgba(${p.rgb}, 0.10)`)
    st.setProperty('--color-glow-copper', `rgba(${p.rgb}, 0.20)`)
    st.setProperty('--color-glow-sapphire', 'rgba(78, 160, 230, 0.16)')
    st.setProperty('--color-glow-teal', 'rgba(40, 199, 181, 0.16)')
    st.setProperty('--color-overlay', 'rgba(6, 10, 18, 0.88)')
    st.setProperty('--color-overlay-card', 'rgba(6, 10, 18, 0.68)')
    st.setProperty('--color-shadow-overlay', 'rgba(0, 0, 0, 0.65)')

    st.setProperty('--hdr-bg', `color-mix(in srgb, ${d.navSolido} 82%, transparent)`)
    st.setProperty('--hdr-bg-scrolled', `color-mix(in srgb, ${d.navSolido} 95%, transparent)`)
    st.setProperty('--sh-inset', 'inset 0 1px 0 rgba(255, 255, 255, 0.06)')
    st.setProperty('--sh-sapphire', '0 4px 20px rgba(50, 130, 196, 0.24)')
  } else {
    const l = s.claro
    st.setProperty('--bg', l.bg)
    st.setProperty('--superficie', l.superficie)
    st.setProperty('--superficie-2', l.superficie2)
    st.setProperty('--superficie-3', l.superficie3)
    st.setProperty('--borde', l.borde)
    st.setProperty('--borde-fuerte', l.bordeFuerte)
    st.setProperty('--texto', l.texto)
    st.setProperty('--texto-2', l.texto2)
    st.setProperty('--texto-3', l.texto3)
    st.setProperty('--ed-desk', l.desk)
    st.setProperty('--regla-zona', l.reglaZona)
    st.setProperty('--regla-papel', l.reglaPapel)
    st.setProperty('--pg-hoja', '#ffffff')

    st.setProperty('--primario', p.primario)
    st.setProperty('--primario-h', p.primarioH)
    st.setProperty('--primario-texto', p.primario)
    st.setProperty('--primario-claro', `rgba(${p.rgb}, 0.11)`)
    st.setProperty('--primario-borde', `rgba(${p.rgb}, 0.30)`)
    st.setProperty('--dorado', p.dorado)
    st.setProperty('--dorado-bg', p.doradoBg)
    st.setProperty('--dorado-borde', p.doradoBorde)

    st.setProperty('--ok', '#047857')
    st.setProperty('--ok-bg', 'rgba(5, 150, 105, 0.11)')
    st.setProperty('--ok-borde', 'rgba(5, 150, 105, 0.28)')
    st.setProperty('--adv', '#b45309')
    st.setProperty('--adv-bg', 'rgba(217, 119, 6, 0.12)')
    st.setProperty('--adv-borde', 'rgba(217, 119, 6, 0.30)')
    st.setProperty('--err', '#b91c1c')
    st.setProperty('--err-bg', 'rgba(220, 38, 38, 0.10)')
    st.setProperty('--err-borde', 'rgba(220, 38, 38, 0.26)')
    st.setProperty('--info', p.primario)
    st.setProperty('--info-bg', `rgba(${p.rgb}, 0.11)`)
    st.setProperty('--info-borde', `rgba(${p.rgb}, 0.28)`)
    st.setProperty('--violeta', '#6d28d9')
    st.setProperty('--violeta-bg', 'rgba(109, 40, 217, 0.10)')
    st.setProperty('--violeta-borde', 'rgba(109, 40, 217, 0.26)')

    st.setProperty('--nav-activo-bg', `linear-gradient(135deg, ${p.swatch} 0%, ${p.primarioH} 100%)`)
    st.setProperty('--nav-activo-texto', '#ffffff')
    st.setProperty(
      '--nav-activo-sombra',
      `0 2px 12px rgba(${p.rgb}, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
    )
    st.setProperty('--nav-focus', p.swatch)
    st.setProperty('--nav-focus-halo', `rgba(${p.rgb}, 0.28)`)
    st.setProperty('--nav-badge-bg', p.primario)

    st.setProperty('--sombra-xs', '0 1px 2px rgba(15, 23, 42, 0.06)')
    st.setProperty('--sombra', pr.sombraCardClaro)
    st.setProperty(
      '--sombra-md',
      '0 4px 10px -1px rgba(15, 23, 42, 0.10), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
    )
    st.setProperty(
      '--sombra-lg',
      '0 12px 30px -4px rgba(15, 23, 42, 0.18), 0 4px 6px -2px rgba(15, 23, 42, 0.06)',
    )

    if (cfg.layoutTheme === 'primary') {
      st.setProperty('--nav-bg', p.navBg)
      st.setProperty('--nav-bg-solido', p.navSolido)
      st.setProperty('--nav-popover-bg', p.navPopover)
      st.setProperty('--nav-borde', p.navBorde)
      st.setProperty('--nav-texto', p.navTexto)
      st.setProperty('--nav-texto-mutado', p.navTextoMutado)
      st.setProperty('--nav-texto-cab', p.navTextoCab)
      st.setProperty('--nav-hover', p.navHover)
      st.setProperty('--nav-hover-texto', '#ffffff')
      st.setProperty('--nav-titulo', '#ffffff')
      st.setProperty('--nav-pill-bg', 'rgba(255, 255, 255, 0.06)')
      st.setProperty('--nav-pill-borde', p.navBorde)
      st.setProperty('--nav-logo-bg', p.navLogoBg)
      st.setProperty('--nav-logo-borde', p.navLogoBorde)
      st.setProperty('--nav-logo-color', p.navLogoColor)
      st.setProperty('--nav-brand-lex', '#ffffff')
      st.setProperty('--nav-brand-geo', '#ffffff')
      st.setProperty('--nav-brand-cat', '#ffffff')
      st.setProperty('--nav-accent', p.primarioInkOscuro)

      st.setProperty('--bar-bg', p.barLightBg)
      st.setProperty('--bar-bg-2', p.barLightBg2)
      st.setProperty('--bar-borde', p.barLightBorde)
      st.setProperty('--bar-texto', '#f8fafc')
      st.setProperty('--bar-texto-2', '#cbd5e1')
      st.setProperty('--bar-texto-3', '#94a3b8')

      st.setProperty('--hdr-bg', `color-mix(in srgb, ${p.navSolido} 90%, transparent)`)
      st.setProperty('--hdr-bg-scrolled', `color-mix(in srgb, ${p.navSolido} 97%, transparent)`)
    } else {
      st.setProperty('--nav-bg', l.navBg)
      st.setProperty('--nav-bg-solido', l.navSolido)
      st.setProperty('--nav-popover-bg', l.navPopover)
      st.setProperty('--nav-borde', l.navBorde)
      st.setProperty('--nav-texto', l.navTexto)
      st.setProperty('--nav-texto-mutado', l.navMutado)
      st.setProperty('--nav-texto-cab', l.navCab)
      st.setProperty('--nav-hover', l.navHover)
      st.setProperty('--nav-hover-texto', p.primario)
      st.setProperty('--nav-titulo', l.texto)
      st.setProperty('--nav-pill-bg', l.navPillBg)
      st.setProperty('--nav-pill-borde', l.borde)
      st.setProperty(
        '--nav-logo-bg',
        `linear-gradient(135deg, ${p.swatch} 0%, ${p.primarioH} 100%)`,
      )
      st.setProperty('--nav-logo-borde', `rgba(${p.rgb}, 0.35)`)
      st.setProperty('--nav-logo-color', '#ffffff')
      st.setProperty('--nav-brand-lex', l.texto)
      st.setProperty('--nav-brand-geo', l.texto)
      st.setProperty('--nav-brand-cat', l.texto)
      st.setProperty('--nav-accent', p.primario)

      st.setProperty('--bar-bg', l.barBg)
      st.setProperty('--bar-bg-2', l.barBg2)
      st.setProperty('--bar-borde', l.barBorde)
      st.setProperty('--bar-texto', l.barTexto)
      st.setProperty('--bar-texto-2', l.barTexto2)
      st.setProperty('--bar-texto-3', l.barTexto3)

      st.setProperty('--hdr-bg', `color-mix(in srgb, ${l.navSolido} 86%, transparent)`)
      st.setProperty('--hdr-bg-scrolled', `color-mix(in srgb, ${l.navSolido} 96%, transparent)`)
    }

    /* Aliases semánticos del sitio sobre el sistema Verona Light */
    st.setProperty('--color-bg-primary', l.bg)
    st.setProperty('--color-bg-surface', l.superficie2)
    st.setProperty('--color-bg-card', l.superficie)
    st.setProperty('--color-bg-elevated', l.superficie3)
    st.setProperty('--color-border', l.borde)
    st.setProperty('--color-border-strong', l.bordeFuerte)
    st.setProperty('--color-border-highlight', l.bordeFuerte)
    st.setProperty('--color-text-primary', l.texto)
    st.setProperty('--color-text-secondary', l.texto2)
    st.setProperty('--color-text-muted', l.texto3)
    st.setProperty('--color-text-subtle', l.texto3)
    st.setProperty('--color-copper', p.primario)
    st.setProperty('--color-copper-glow', p.primarioH)
    st.setProperty('--color-copper-deep', p.primarioH)
    st.setProperty('--color-sapphire', '#15548a')
    st.setProperty('--color-sapphire-glow', '#1f6db0')
    st.setProperty('--color-teal', '#0d6e63')
    st.setProperty('--color-teal-glow', '#12877a')
    st.setProperty('--color-amber', p.dorado)
    st.setProperty('--color-grid-line', `rgba(${p.rgb}, 0.06)`)
    st.setProperty('--color-glow-copper', `rgba(${p.rgb}, 0.11)`)
    st.setProperty('--color-glow-sapphire', 'rgba(21, 84, 138, 0.10)')
    st.setProperty('--color-glow-teal', 'rgba(13, 110, 99, 0.10)')
    st.setProperty('--color-overlay', 'rgba(15, 23, 42, 0.60)')
    st.setProperty('--color-overlay-card', 'rgba(15, 23, 42, 0.14)')
    st.setProperty('--color-shadow-overlay', 'rgba(15, 23, 42, 0.28)')
    st.setProperty('--color-hero-light-1', l.superficie)
    st.setProperty('--color-hero-light-2', l.superficie2)
    st.setProperty('--color-hero-light-3', l.bg)
    st.setProperty('--color-hero-light-fade', l.bg)
    st.setProperty('--sh-inset', 'inset 0 1px 0 rgba(255, 255, 255, 0.9)')
    st.setProperty('--sh-sapphire', '0 4px 18px rgba(21, 84, 138, 0.15)')
  }

  /* Aliases comunes dependientes de modo */
  st.setProperty('--bg2', 'var(--superficie-2)')
  st.setProperty('--bg3', 'var(--superficie-3)')
  st.setProperty('--card', 'var(--superficie)')
  st.setProperty('--card2', 'var(--superficie-2)')
  st.setProperty('--card3', 'var(--superficie-3)')
  st.setProperty('--copper', 'var(--primario-texto)')
  st.setProperty('--copper2', 'var(--primario-h)')
  st.setProperty('--copper-lt', 'var(--primario-claro)')
  st.setProperty('--copper-bd', 'var(--primario-borde)')
  st.setProperty('--gold', 'var(--dorado)')
  st.setProperty('--gold-lt', 'var(--dorado-bg)')
  st.setProperty('--amber', 'var(--dorado)')
  st.setProperty('--amber-lt', 'var(--dorado-bg)')
  st.setProperty('--text', 'var(--texto)')
  st.setProperty('--text2', 'var(--texto-2)')
  st.setProperty('--text3', 'var(--texto-3)')
  st.setProperty('--text4', 'var(--texto-3)')
  st.setProperty('--border', 'var(--borde)')
  st.setProperty('--border2', 'var(--borde-fuerte)')
  st.setProperty('--border3', 'var(--borde-fuerte)')
  st.setProperty('--sh', 'var(--sombra)')
  st.setProperty('--sh2', 'var(--sombra-md)')
  st.setProperty('--sh3', 'var(--sombra-lg)')
  st.setProperty(
    '--sh-copper',
    `0 4px 20px rgba(${p.rgb}, ${esOscuro ? '0.26' : '0.18'}), 0 1px 4px rgba(${p.rgb}, 0.12)`,
  )
  st.setProperty(
    '--sh-copper-h',
    `0 10px 32px rgba(${p.rgb}, ${esOscuro ? '0.38' : '0.26'}), 0 3px 10px rgba(${p.rgb}, 0.16)`,
  )

  const themeMeta = document.querySelector('meta[name="theme-color"]')
  if (themeMeta) {
    themeMeta.setAttribute(
      'content',
      esOscuro ? s.oscuro.navSolido : cfg.layoutTheme === 'primary' ? p.navSolido : s.claro.navSolido,
    )
  }
}

/** Persiste y aplica una nueva configuración de tema notificando a los suscriptores. */
export function guardarConfigTema(nueva: ConfigTema): void {
  const normalizada = normalizarConfigTema(nueva)
  try {
    localStorage.setItem(CLAVE_CONFIG, JSON.stringify(normalizada))
  } catch {
    // ignore
  }
  aplicarTemaAlDocumento(normalizada)
  oyentes.forEach((fn) => fn(normalizada))
}

export function actualizarConfigTema(parcial: Partial<ConfigTema>): ConfigTema {
  const siguiente = { ...obtenerConfigTema(), ...parcial }
  guardarConfigTema(siguiente)
  return siguiente
}

export function aplicarPerfilTema(perfilId: string): ConfigTema | null {
  const encontrado = PERFILES_TEMAS.find((p) => p.id === perfilId)
  if (!encontrado) return null
  guardarConfigTema({ ...encontrado.config })
  return { ...encontrado.config }
}

export function alternarColorScheme(): ColorScheme {
  const actual = obtenerConfigTema()
  const nuevo: ColorScheme = actual.colorScheme === 'dark' ? 'light' : 'dark'
  guardarConfigTema({ ...actual, colorScheme: nuevo })
  return nuevo
}

export function suscribirConfigTema(fn: (c: ConfigTema) => void): () => void {
  oyentes.add(fn)
  return () => {
    oyentes.delete(fn)
  }
}
