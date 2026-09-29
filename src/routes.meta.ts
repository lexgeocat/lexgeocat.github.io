export const SITE_URL = 'https://lexgeocat.github.io'

export interface RouteSeo {
  path: string
  crumb: string
  title: string
  description: string
}

export const ROUTES: RouteSeo[] = [
  {
    path: '/',
    crumb: 'Inicio',
    title: 'LexGeoCat — Derecho, Catastro y Geomática en Bolivia',
    description:
      'Servicios profesionales en Derecho, Catastro, Ordenamiento Territorial, Topografía, Geomática y Desarrollo de Software en Bolivia. R.N.T. 970285 y R.P.A. 13437938CBRQ.',
  },
  {
    path: '/pages/servicios.html',
    crumb: 'Servicios',
    title: 'Servicios de Derecho, Catastro y Geomática | LexGeoCat',
    description:
      'Más de 40 servicios en derecho territorial, catastro, ordenamiento, topografía, SIG y software en Bolivia. Simula tu cotización en línea, gratis.',
  },
  {
    path: '/pages/derecho.html',
    crumb: 'Derecho',
    title: 'Derecho Territorial y Civil en Bolivia | LexGeoCat',
    description:
      'Asesoría legal en usucapión, derecho registral, notarial, agrario y normativa territorial boliviana. Abogado con R.P.A. vigente.',
  },
  {
    path: '/pages/catastro.html',
    crumb: 'Catastro',
    title: 'Catastro Multifinalitario en Bolivia | LexGeoCat',
    description:
      'Fichas catastrales, registro predial, valuación fiscal y nomenclatura catastral en Bolivia. Técnico colegiado S.I.B.',
  },
  {
    path: '/pages/ordenamiento.html',
    crumb: 'Ordenamiento Territorial',
    title: 'Ordenamiento Territorial en Bolivia | LexGeoCat',
    description:
      'Planificación urbana, zonificación, uso de suelo, PLOT y PDM para gobiernos municipales y privados en Bolivia.',
  },
  {
    path: '/pages/geografia.html',
    crumb: 'Geografía',
    title: 'Estudios Geográficos y de Riesgo en Bolivia | LexGeoCat',
    description:
      'Geografía física, humana y regional, análisis de vulnerabilidad y riesgos naturales aplicados al territorio boliviano.',
  },
  {
    path: '/pages/topogeodesia.html',
    crumb: 'Topografía y Geodesia',
    title: 'Topografía, GNSS y Geodesia en Bolivia | LexGeoCat',
    description:
      'Levantamientos topográficos, posicionamiento GNSS, redes geodésicas y georreferenciación SIRGAS en Bolivia.',
  },
  {
    path: '/pages/geomatica.html',
    crumb: 'Geomática',
    title: 'Geomática, SIG y PostGIS en Bolivia | LexGeoCat',
    description:
      'Sistemas de información geográfica, teledetección, cartografía digital, PostGIS, QGIS y GeoServer para proyectos en Bolivia.',
  },
  {
    path: '/pages/desarrollo-software.html',
    crumb: 'Desarrollo de Software',
    title: 'Desarrollo de Software y Web GIS a Medida | LexGeoCat',
    description:
      'Aplicaciones web geográficas, APIs geoespaciales y sistemas de gestión territorial a medida para instituciones en Bolivia.',
  },
  {
    path: '/pages/acerca-de.html',
    crumb: 'Sobre Mí',
    title: 'Cristian Ruiz Quiroga — Abogado y Técnico Catastral | LexGeoCat',
    description:
      'Licenciado en Derecho (R.P.A. 13437938CBRQ) y Técnico en Catastro y Ordenamiento Territorial (R.N.T. 970285). Viacha, La Paz.',
  },
  {
    path: '/pages/contacto.html',
    crumb: 'Contacto',
    title: 'Contacto | LexGeoCat',
    description:
      'Consultas en derecho, catastro y geomática en Bolivia. Escríbenos por WhatsApp, correo o formulario. Respuesta en menos de 24 h hábiles.',
  },
  {
    path: '/pages/recursos.html',
    crumb: 'Recursos',
    title: 'Recursos y Herramientas para Profesionales del Territorio | LexGeoCat',
    description:
      'Formatos legales, guías catastrales, tutoriales SIG y scripts de automatización para profesionales del territorio.',
  },
  {
    path: '/pages/normativa.html',
    crumb: 'Normativa',
    title: 'Biblioteca Jurídica — Normativa Legal Boliviana | LexGeoCat',
    description:
      'Leyes, códigos, decretos, jurisprudencia y doctrina del ordenamiento jurídico boliviano, con descarga en PDF.',
  },
  {
    path: '/pages/privacidad.html',
    crumb: 'Privacidad',
    title: 'Política de Privacidad | LexGeoCat',
    description: 'Política de privacidad y tratamiento de datos de LexGeoCat.',
  },
  {
    path: '/pages/terminos.html',
    crumb: 'Términos',
    title: 'Términos de Uso | LexGeoCat',
    description: 'Términos y condiciones de uso del sitio LexGeoCat.',
  },
]

export function seo(path: string) {
  const r = ROUTES.find((x) => x.path === path)
  if (!r) throw new Error(`[seo] ruta no registrada en routes.meta.ts: ${path}`)
  return { title: r.title, description: r.description }
}