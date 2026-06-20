export interface TopicFeature {
  icon: string
  title: string
  desc: string
}

export interface TopicConfig {
  slug: string
  routePath: string
  icon: string
  label: string
  title: string
  description: string
  blogLabel: string
  blogBadgeCls: string
  blogBadgeLabel: string
  blogLimit?: number
  features: TopicFeature[]
  blogCta: string
  blogCtaHref?: string
}

export const TOPICS: TopicConfig[] = [
  {
    slug: 'derecho',
    routePath: '/pages/derecho.html',
    icon: 'fa-scale-balanced',
    label: 'Especialidad',
    title: 'Derecho',
    description: 'Legislación boliviana, derecho civil, usucapión y normativa territorial.',
    blogLabel: 'Derecho',
    blogBadgeCls: 'law',
    blogBadgeLabel: 'Derecho',
    features: [
      { icon: 'fa-scale-balanced', title: 'Derecho civil y procesal', desc: 'Consultoría y recursos en el contexto boliviano.' },
      { icon: 'fa-scale-balanced', title: 'Usucapión y derecho registral', desc: 'Trámites y normativa aplicable.' },
      { icon: 'fa-scale-balanced', title: 'Normativa catastral', desc: 'Marco legal del catastro en Bolivia.' },
      { icon: 'fa-scale-balanced', title: 'Trámites notariales', desc: 'Asesoría en documentación predial.' },
    ],
    blogCta: '¿Quieres profundizar en Derecho?',
    blogCtaHref: 'https://lexgeocat.blogspot.com/search/label/Derecho',
  },
  {
    slug: 'catastro',
    routePath: '/pages/catastro.html',
    icon: 'fa-map',
    label: 'Especialidad',
    title: 'Catastro Multifinalitario',
    description: 'Registro predial, valuación fiscal, nomenclatura catastral y sistemas de información territorial.',
    blogLabel: 'Catastro',
    blogBadgeCls: 'cat',
    blogBadgeLabel: 'Catastro',
    features: [
      { icon: 'fa-map', title: 'Levantamientos topográficos', desc: 'Precision y normativa técnica.' },
      { icon: 'fa-map', title: 'Planos y fichas catastrales', desc: 'Documentación predial oficial.' },
      { icon: 'fa-map', title: 'Geocodificación', desc: 'Integración de datos territoriales.' },
      { icon: 'fa-map', title: 'Actualización catastral', desc: 'Mantenimiento de bases de datos.' },
    ],
    blogCta: '¿Quieres profundizar en Catastro?',
    blogCtaHref: 'https://lexgeocat.blogspot.com/search/label/Catastro',
  },
  {
    slug: 'ordenamiento',
    routePath: '/pages/ordenamiento.html',
    icon: 'fa-compass-drafting',
    label: 'Especialidad',
    title: 'Ordenamiento Territorial',
    description: 'Planificación urbana, zonificación, uso de suelo y gestión territorial a nivel municipal.',
    blogLabel: 'Ordenamiento Territorial',
    blogBadgeCls: 'orden',
    blogBadgeLabel: 'Ordenamiento',
    features: [
      { icon: 'fa-compass-drafting', title: 'Planificación urbana', desc: 'Instrumentos y metodología.' },
      { icon: 'fa-compass-drafting', title: 'Zonificación', desc: 'Usos de suelo y normativa.' },
      { icon: 'fa-compass-drafting', title: 'Gestión municipal', desc: 'Políticas territoriales locales.' },
      { icon: 'fa-compass-drafting', title: 'Instrumentos de planificación', desc: 'Planes y programas territoriales.' },
    ],
    blogCta: '¿Quieres profundizar en Ordenamiento?',
    blogCtaHref: 'https://lexgeocat.blogspot.com/search/label/Ordenamiento%20Territorial',
  },
  {
    slug: 'geografia',
    routePath: '/pages/geografia.html',
    icon: 'fa-earth-americas',
    label: 'Especialidad',
    title: 'Geografía',
    description: 'Análisis del territorio, geografía humana, física, regional y planificación geoespacial aplicada al contexto boliviano.',
    blogLabel: 'Geografía',
    blogBadgeCls: 'geo',
    blogBadgeLabel: 'Geografía',
    features: [
      { icon: 'fa-mountain-city', title: 'Geografía física', desc: 'Relieve, clima, hidrografía, geomorfología y ecosistemas de Bolivia.' },
      { icon: 'fa-people-group', title: 'Geografía humana', desc: 'Población, cultura, migraciones, actividades económicas y dinámicas sociales en el territorio.' },
      { icon: 'fa-map-location-dot', title: 'Geografía regional', desc: 'Caracterización de regiones, cuencas, valles, altiplano y llanos de Bolivia.' },
      { icon: 'fa-triangle-exclamation', title: 'Riesgos y vulnerabilidad', desc: 'Análisis de amenazas naturales, susceptibilidad y vulnerabilidad territorial.' },
    ],
    blogCta: '¿Necesitas un estudio geográfico?',
  },
  {
    slug: 'topogeodesia',
    routePath: '/pages/topogeodesia.html',
    icon: 'fa-mountain',
    label: 'Especialidad',
    title: 'Topografía y Geodesia',
    description: 'Levantamientos topográficos de precisión, posicionamiento GNSS, redes geodésicas y georeferenciación profesional para Bolivia.',
    blogLabel: 'Topografía y Geodesia',
    blogBadgeCls: 'topo',
    blogBadgeLabel: 'Topografía',
    features: [
      { icon: 'fa-ruler-combined', title: 'Planimetría y altimetría', desc: 'Medición de distancias, ángulos, coordenadas y cotas.' },
      { icon: 'fa-wave-square', title: 'Curvas de nivel', desc: 'Modelos digitales de terreno para proyectos civiles y catastrales.' },
      { icon: 'fa-bullseye', title: 'Replanteo y cubicaciones', desc: 'Materialización en campo y cálculo de volúmenes.' },
      { icon: 'fa-satellite', title: 'Posicionamiento GNSS', desc: 'Precisión centimétrica con GPS, GLONASS, Galileo y BeiDou.' },
    ],
    blogCta: '¿Necesitas un levantamiento profesional?',
  },
  {
    slug: 'geomatica',
    routePath: '/pages/geomantica.html',
    icon: 'fa-layer-group',
    label: 'Especialidad',
    title: 'Geomática',
    description: 'Sistemas de información geográfica, teledetección, cartografía digital, PostGIS/QGIS y análisis espacial avanzado en Bolivia.',
    blogLabel: 'Geomática',
    blogBadgeCls: 'gis',
    blogBadgeLabel: 'Geomática',
    features: [
      { icon: 'fa-layer-group', title: 'Cartografía digital', desc: 'Mapas técnicos, temáticos y de planificación.' },
      { icon: 'fa-database', title: 'Bases de datos PostGIS', desc: 'Modelado, despliegue y administración de bases de datos espaciales.' },
      { icon: 'fa-chart-area', title: 'Análisis espacial', desc: 'Geoprocesamiento, modelos predictivos y análisis de conectividad.' },
      { icon: 'fa-satellite-dish', title: 'Teledetección', desc: 'Procesamiento de imágenes satelitales y análisis multiespectral.' },
    ],
    blogCta: '¿Necesitas una solución SIG profesional?',
  },
  {
    slug: 'desarrollo-software',
    routePath: '/pages/desarrollo-software.html',
    icon: 'fa-code',
    label: 'Especialidad',
    title: 'Desarrollo de Software y Aplicaciones Web',
    description: 'Diseño, desarrollo e implementación de software y aplicaciones web especializadas en gestión territorial, catastro, SIG y servicios públicos digitales en Bolivia.',
    blogLabel: 'Desarrollo de Software',
    blogBadgeCls: 'software',
    blogBadgeLabel: 'Software',
    features: [
      { icon: 'fa-globe', title: 'Aplicaciones web geográficas', desc: 'Visores de mapas, portales SIG y plataformas web responsive.' },
      { icon: 'fa-database', title: 'Bases de datos espaciales', desc: 'PostgreSQL/PostGIS, modelado geoespacial y optimización.' },
      { icon: 'fa-server', title: 'APIs y microservicios', desc: 'APIs REST geoespaciales y servicios OGC (WMS, WFS, WCS).' },
      { icon: 'fa-gears', title: 'Automatización y ETL', desc: 'Scripts Python, flujos ETL geoespaciales y publicación automática.' },
    ],
    blogCta: '¿Necesitas un sistema o aplicación a medida?',
  },
  {
    slug: 'recursos',
    routePath: '/pages/recursos.html',
    icon: 'fa-folder-open',
    label: 'Biblioteca',
    title: 'Recursos y Herramientas',
    description: 'Plantillas, formatos legales, guías técnicas y materiales de apoyo para profesionales del territorio.',
    blogLabel: 'Recursos',
    blogBadgeCls: 'white',
    blogBadgeLabel: 'Recurso',
    blogLimit: 10,
    features: [],
    blogCta: '¿Buscas más material?',
    blogCtaHref: 'https://lexgeocat.blogspot.com/search/label/Recursos',
  },
]

export function getTopic(slug: string): TopicConfig | undefined {
  return TOPICS.find(t => t.slug === slug)
}