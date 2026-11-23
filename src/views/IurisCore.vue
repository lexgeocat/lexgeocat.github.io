<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { SITE } from '../config/site'
import { useReveal } from '../shared/composables/useReveal'
import iuriscoreLogo from '@/assets/img/iuriscore-logo.png'

interface PlanCatalogo {
  id: string
  nombre: string
  duracion_dias: number | null
  gracia_offline_dias: number | null
  precio_base_bs: number
  activo: boolean
}

interface ModalidadCatalogo {
  id: string
  nombre: string
  max_equipos: number
  descuento_pct: number
}

interface RespuestaCatalogoApi {
  ok?: boolean
  planes?: PlanCatalogo[]
  modalidades?: ModalidadCatalogo[]
}

interface ArchivoDescargaInfo {
  nombreArchivo: string
  url: string
  tamanoMb: number | null
}

interface InfoActualizacion {
  ok: boolean
  version: string | null
  url_descarga?: string
  tamano_mb?: number | null
  notas?: string
  descargas?: Partial<
    Record<'win10_64' | 'win10_32' | 'win7_64' | 'win7_32' | 'android_apk', ArchivoDescargaInfo>
  >
}

interface MediaGaleriaItem {
  id: string
  key: string
  tipo: 'portada_pc' | 'portada_movil' | 'captura_pc' | 'captura_movil'
  titulo: string
  descripcion: string
  orden: number
  url: string
}

interface RespuestaMediaApi {
  ok?: boolean
  items?: MediaGaleriaItem[]
}

const PLANES_RESPALDO: PlanCatalogo[] = [
  {
    id: 'pro_mensual',
    nombre: 'Pro Mensual',
    duracion_dias: 30,
    gracia_offline_dias: 15,
    precio_base_bs: 59,
    activo: true,
  },
  {
    id: 'pro_trimestral',
    nombre: 'Pro Trimestral',
    duracion_dias: 90,
    gracia_offline_dias: 20,
    precio_base_bs: 149,
    activo: true,
  },
  {
    id: 'pro_semestral',
    nombre: 'Pro Semestral',
    duracion_dias: 180,
    gracia_offline_dias: 30,
    precio_base_bs: 269,
    activo: true,
  },
  {
    id: 'pro_anual',
    nombre: 'Pro Anual',
    duracion_dias: 365,
    gracia_offline_dias: 30,
    precio_base_bs: 449,
    activo: true,
  },
  {
    id: 'est_mensual',
    nombre: 'Estudiante Mensual',
    duracion_dias: 30,
    gracia_offline_dias: 15,
    precio_base_bs: 29,
    activo: true,
  },
  {
    id: 'est_semestral',
    nombre: 'Estudiante Semestral',
    duracion_dias: 180,
    gracia_offline_dias: 30,
    precio_base_bs: 129,
    activo: true,
  },
  {
    id: 'est_anual',
    nombre: 'Estudiante Anual',
    duracion_dias: 365,
    gracia_offline_dias: 30,
    precio_base_bs: 219,
    activo: true,
  },
]

const MODALIDADES_RESPALDO: ModalidadCatalogo[] = [
  { id: 'individual', nombre: 'Individual', max_equipos: 1, descuento_pct: 0 },
  { id: 'estudio_3', nombre: 'Estudio 3 PCs', max_equipos: 3, descuento_pct: 15 },
  { id: 'estudio_5', nombre: 'Estudio 5 PCs', max_equipos: 5, descuento_pct: 25 },
]

const planes = ref<PlanCatalogo[]>(PLANES_RESPALDO)
const modalidades = ref<ModalidadCatalogo[]>(MODALIDADES_RESPALDO)
const tipoTarifa = ref<'profesional' | 'estudiante'>('profesional')
const modSelId = ref<string>('individual')
const infoVer = ref<InfoActualizacion | null>(null)
const galeriaMedia = ref<MediaGaleriaItem[]>([])
const filtroGaleria = ref<'todas' | 'pc' | 'movil'>('todas')
const lightboxItem = ref<MediaGaleriaItem | null>(null)
const faqAbierta = ref<number | null>(0)

const reveal = useReveal()

const modalidadesVisibles = computed(() => modalidades.value.filter((m) => m.id !== 'estudio_10'))

const modalidadActiva = computed(
  () => modalidadesVisibles.value.find((m) => m.id === modSelId.value) ?? modalidadesVisibles.value[0],
)

const ORDEN_PRO = ['pro_mensual', 'pro_trimestral', 'pro_semestral', 'pro_anual']
const ORDEN_EST = ['est_mensual', 'est_semestral', 'est_anual']

const planesVisibles = computed(() => {
  const pref = tipoTarifa.value === 'estudiante' ? 'est_' : 'pro_'
  const orden = tipoTarifa.value === 'estudiante' ? ORDEN_EST : ORDEN_PRO
  return planes.value
    .filter((p) => p.activo && p.id.startsWith(pref))
    .sort((a, b) => orden.indexOf(a.id) - orden.indexOf(b.id))
})

const portadaPc = computed(
  () => galeriaMedia.value.find((i) => i.tipo === 'portada_pc') ?? null,
)

const portadaMovil = computed(
  () => galeriaMedia.value.find((i) => i.tipo === 'portada_movil') ?? null,
)

const capturasGaleria = computed(() => {
  const capturas = galeriaMedia.value.filter(
    (i) => i.tipo === 'captura_pc' || i.tipo === 'captura_movil',
  )
  return capturas.length > 0 ? capturas : galeriaMedia.value
})

const itemsGaleriaFiltrados = computed(() => {
  if (filtroGaleria.value === 'pc') {
    return capturasGaleria.value.filter(
      (i) => i.tipo === 'captura_pc' || i.tipo === 'portada_pc',
    )
  }
  if (filtroGaleria.value === 'movil') {
    return capturasGaleria.value.filter(
      (i) => i.tipo === 'captura_movil' || i.tipo === 'portada_movil',
    )
  }
  return capturasGaleria.value
})

function esTipoMovil(tipo: MediaGaleriaItem['tipo']): boolean {
  return tipo === 'portada_movil' || tipo === 'captura_movil'
}

function etiquetaTipoMedia(tipo: MediaGaleriaItem['tipo']): string {
  if (tipo === 'portada_pc') return 'Portada PC'
  if (tipo === 'portada_movil') return 'Portada Android'
  if (tipo === 'captura_movil') return 'Android Móvil'
  return 'Escritorio PC'
}

function precioPlan(p: PlanCatalogo) {
  const esEst = p.id.startsWith('est_')
  const m = modalidadActiva.value
  const eq = esEst ? 1 : (m?.max_equipos ?? 1)
  const desc = esEst ? 0 : (m?.descuento_pct ?? 0)
  const bruto = p.precio_base_bs * eq
  const total = Math.round(bruto * (1 - desc / 100))
  const ahorro = bruto - total
  const dias = p.duracion_dias ?? 30
  const meses = dias >= 360 ? 12 : Math.max(1, Math.round(dias / 30))
  const equivNum = Math.round((total / meses) * 10) / 10
  const equiv = equivNum % 1 === 0 ? String(equivNum) : equivNum.toFixed(1)
  const baseMensual =
    planes.value.find((x) => x.id === (esEst ? 'est_mensual' : 'pro_mensual'))?.precio_base_bs ??
    (esEst ? 29 : 59)
  const ahorroMensualPct =
    meses > 1 ? Math.round((1 - p.precio_base_bs / (baseMensual * meses)) * 100) : 0
  return { total, bruto, ahorro, eq, desc, equiv, meses, ahorroMensualPct }
}

function linkComprar(planId: string): string {
  const modEf = planId.startsWith('est_') ? 'individual' : modSelId.value
  return `${SITE.iuriscore.comprar}?plan=${encodeURIComponent(planId)}&mod=${encodeURIComponent(modEf)}`
}

const whatsappPerpetua = computed(() => {
  const txt = encodeURIComponent(
    'Hola, quiero cotizar una Licencia Perpetua o paquete Estudio Jurídico (10+ puestos) de IurisCore.',
  )
  return `https://wa.me/${SITE.whatsappNumber}?text=${txt}`
})

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && lightboxItem.value) {
    lightboxItem.value = null
  }
}

const faqs = [
  {
    q: '¿Mis expedientes y escritos se suben a servidores de terceros?',
    a: 'No. IurisCore utiliza arquitectura 100 % Local-First: tu base de datos SQLite y tus archivos viven en tu ordenador y en tu teléfono. Si decides activar la sincronización entre PC y Android, todo se cifra localmente con ChaCha20-Poly1305 antes de guardarse en la carpeta privada oculta (appDataFolder) de tu propio Google Drive.',
  },
  {
    q: '¿La licencia funciona tanto en mi PC como en mi celular Android?',
    a: 'Sí. Cada puesto de licencia habilita el uso en Windows y su cupo complementario en Android. Solo conecta tu misma cuenta de Google (o usa tu clave IC3) para activar automáticamente ambos dispositivos y mantener tus datos sincronizados.',
  },
  {
    q: '¿Cuántos datos gasta la sincronización PC ↔ Android?',
    a: 'Utilizamos sincronización incremental diferencial (v2): al vincular o editar expedientes solo se envía o descarga la base de datos comprimida (~200-500 KB) y únicamente los archivos nuevos o modificados. Si borras un archivo, también se limpia en la nube.',
  },
  {
    q: '¿Funciona en computadoras antiguas con Windows 7 o sin internet?',
    a: 'Sí. Además de la edición moderna para Windows 10/11 (32 y 64 bits), ofrecemos una edición Legacy Offline para Windows 7 (32 y 64 bits) que no requiere WebView2 ni conexión permanente a internet.',
  },
  {
    q: '¿Qué ocurre al vencer la prueba gratuita de 3 días o al renovar mi plan?',
    a: 'Tus expedientes y documentos siempre se conservan intactos en tu dispositivo. Al finalizar los 3 días de prueba, el sistema te solicita activar un plan (Mensual, Trimestral, Semestral, Anual o Tarifa Estudiante -50 %). Si renuevas antes de vencer conservas un 15 % de descuento preferencial.',
  },
]

function textoTamanoMb(mb: number | null | undefined): string {
  return mb ? `${Number(mb).toFixed(1)} MB` : 'Directo'
}

onMounted(async () => {
  requestAnimationFrame(() => reveal.observe())
  window.addEventListener('keydown', onKeyDown)
  try {
    const [rCat, rVer, rMed] = await Promise.all([
      fetch(`${SITE.iuriscore.api}/api/catalogo`),
      fetch(`${SITE.iuriscore.api}/api/actualizaciones/info`),
      fetch(`${SITE.iuriscore.api}/api/media/galeria`),
    ])
    const resCat = rCat.ok ? ((await rCat.json()) as RespuestaCatalogoApi) : null
    const resVer = rVer.ok ? ((await rVer.json()) as InfoActualizacion) : null
    const resMed = rMed.ok ? ((await rMed.json()) as RespuestaMediaApi) : null
    if (resCat?.ok && Array.isArray(resCat.planes) && resCat.planes.length > 0) {
      planes.value = resCat.planes
    }
    if (resCat?.ok && Array.isArray(resCat.modalidades) && resCat.modalidades.length > 0) {
      modalidades.value = resCat.modalidades
    }
    if (resVer?.ok) {
      infoVer.value = resVer
    }
    if (resMed?.ok && Array.isArray(resMed.items)) {
      galeriaMedia.value = resMed.items
    }
  } catch {
    /* usa catálogo de respaldo si está offline */
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  reveal.disconnect()
})
</script>

<template>
  <section class="ic-hero">
    <div class="c">
      <div class="ic-hero-grid">
        <div>
          <div class="ic-hero-brand">
            <img
              :src="iuriscoreLogo"
              alt="IurisCore Legal Hub"
              class="ic-hero-logo"
            >
            <span class="ic-pill-ver">
              <i
                aria-hidden="true"
                class="fa-solid fa-sparkles"
              />
              {{
                infoVer?.version
                  ? `Versión actual v${infoVer.version} disponible`
                  : 'Windows 10/11 · Windows 7 · Android'
              }}
            </span>
          </div>

          <h1 class="ic-hero-title">
            Tu despacho jurídico completo, rápido, offline y sincronizado.
          </h1>
          <p class="ic-hero-sub">
            <strong>IurisCore · Legal Hub</strong> integra expedientes, clientes, escritos, modelos
            inteligentes en <strong>Redactor Forense 1:1</strong>, códigos en organigramas
            interactivos y búsqueda de jurisprudencia boliviana (<strong>TSJ &amp; TCP</strong>)
            con sincronización cifrada PC ↔ Android en tu propio Google Drive.
          </p>

          <div class="ic-cta-row">
            <a
              class="btn btn-gold"
              :href="SITE.iuriscore.home"
              target="_blank"
              rel="noopener"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-up-right-from-square"
              />
              Sitio oficial IurisCore
            </a>
            <a
              class="btn btn-teal"
              href="#descargas"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-download"
              />
              Descargas directas
            </a>
          </div>

          <div class="ic-hero-garantias">
            <span>
              <i
                aria-hidden="true"
                class="fa-solid fa-circle-check"
              /> Sin suscripciones ocultas
            </span>
            <span>
              <i
                aria-hidden="true"
                class="fa-solid fa-circle-check"
              /> 100 % funcional sin internet
            </span>
            <span>
              <i
                aria-hidden="true"
                class="fa-solid fa-circle-check"
              /> Datos cifrados con ChaCha20
            </span>
          </div>
        </div>

        <div
          v-if="portadaPc || portadaMovil"
          class="ic-showcase-stage"
        >
          <button
            v-if="portadaPc"
            type="button"
            class="ic-device-pc"
            :aria-label="`Ampliar ${portadaPc.titulo}`"
            @click="lightboxItem = portadaPc"
          >
            <div class="ic-device-pc-bar">
              <span class="ic-dot" /><span class="ic-dot" /><span class="ic-dot" />
              <span class="ic-device-title">IurisCore · Windows Desktop</span>
            </div>
            <img
              :src="portadaPc.url"
              :alt="portadaPc.titulo"
              class="ic-device-pc-img"
            >
          </button>

          <div
            v-else
            class="ic-eco-card ic-device-pc-fallback"
          >
            <div class="ic-eco-head">
              <strong>Ecosistema Jurídico Integrado</strong>
              <span class="ic-eco-estado">PC + Android Sync v2</span>
            </div>
            <div class="ic-eco-nodos">
              <div class="ic-eco-item">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-file-contract"
                />
                <div>
                  <strong>Redactor Forense con Impresión 1:1</strong>
                  <span>Memoriales, contratos y minutas en Carta, Oficio o A4.</span>
                </div>
              </div>
              <div class="ic-eco-item">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-sitemap"
                />
                <div>
                  <strong>Normativa en Organigrama y PDF</strong>
                  <span>Códigos indexados con citas jurídicas en un clic.</span>
                </div>
              </div>
            </div>
          </div>

          <button
            v-if="portadaMovil"
            type="button"
            class="ic-device-phone"
            :aria-label="`Ampliar ${portadaMovil.titulo}`"
            @click="lightboxItem = portadaMovil"
          >
            <div class="ic-device-phone-notch" />
            <img
              :src="portadaMovil.url"
              :alt="portadaMovil.titulo"
              class="ic-device-phone-img"
            >
            <span class="ic-device-phone-tag">
              <i
                aria-hidden="true"
                class="fa-brands fa-android"
              /> Android
            </span>
          </button>
        </div>

        <div
          v-else
          class="ic-eco-card"
        >
          <div class="ic-eco-head">
            <strong>Ecosistema Jurídico Integrado</strong>
            <span class="ic-eco-estado">PC + Android Sync v2</span>
          </div>
          <div class="ic-eco-nodos">
            <div class="ic-eco-item">
              <i
                aria-hidden="true"
                class="fa-solid fa-file-contract"
              />
              <div>
                <strong>Redactor Forense con Impresión 1:1</strong>
                <span>
                  Edita memoriales, minutas y contratos con variables automáticas del expediente e
                  imprime en Carta, Oficio o A4 tal como ves en pantalla.
                </span>
              </div>
            </div>
            <div class="ic-eco-item">
              <i
                aria-hidden="true"
                class="fa-solid fa-sitemap"
              />
              <div>
                <strong>Normativa en Esquema, Organigrama y PDF</strong>
                <span>
                  Navega cualquier ley por título, capítulo y artículo con cita jurídica en un clic y
                  mapas jerárquicos interactivos.
                </span>
              </div>
            </div>
            <div class="ic-eco-item">
              <i
                aria-hidden="true"
                class="fa-solid fa-landmark"
              />
              <div>
                <strong>Jurisprudencia Bolivia (TSJ y TCP)</strong>
                <span>
                  Busca autos supremos y sentencias constitucionales en línea, guárdalas offline y
                  vincúlalas directo a tus expedientes.
                </span>
              </div>
            </div>
            <div class="ic-eco-item">
              <i
                aria-hidden="true"
                class="fa-solid fa-cloud-arrow-up"
              />
              <div>
                <strong>Sincronización Incremental Inteligente</strong>
                <span>
                  Transfiere solo los cambios nuevos entre ordenador y celular ahorrando datos y
                  tiempo, cifrado de extremo a extremo.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="ic-trust-strip">
    <div class="c">
      <div class="ic-trust-grid">
        <div class="ic-trust-item">
          <i
            aria-hidden="true"
            class="fa-solid fa-database"
          />
          <div>
            <strong>Arquitectura Local-First</strong>
            <span>Tus expedientes jamás se venden ni se exponen en servidores ajenos.</span>
          </div>
        </div>
        <div class="ic-trust-item">
          <i
            aria-hidden="true"
            class="fa-solid fa-bolt"
          />
          <div>
            <strong>Sincronización Delta</strong>
            <span>Un cambio pequeño sincroniza kilobytes, no toda tu biblioteca.</span>
          </div>
        </div>
        <div class="ic-trust-item">
          <i
            aria-hidden="true"
            class="fa-solid fa-laptop-code"
          />
          <div>
            <strong>Win10/11 + Win7 + Android</strong>
            <span>Compatible con equipos modernos (64-bit) y antiguos (32-bit).</span>
          </div>
        </div>
        <div class="ic-trust-item">
          <i
            aria-hidden="true"
            class="fa-solid fa-qrcode"
          />
          <div>
            <strong>Activación Inmediata QR</strong>
            <span>Activa con cuenta Google o clave offline IC3 en minutos.</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="c">
      <div class="sh center">
        <span class="sl">CAPACIDADES PRINCIPALES</span>
        <h2 class="st">
          Diseñado para el trabajo forense real en Bolivia
        </h2>
        <p class="sd">
          Todo lo que un abogado o estudio jurídico necesita en un solo sistema rápido, claro y
          offline.
        </p>
      </div>

      <div class="g g-3">
        <article class="card reveal">
          <div class="card-i">
            <i
              aria-hidden="true"
              class="fa-solid fa-briefcase"
            />
          </div>
          <h3>Gestión de Expedientes y Partes</h3>
          <p>
            Registra clientes, contrapartes y actuaciones; genera escritos desde modelos en
            segundos y conserva cada documento en bóveda auto-reparable.
          </p>
        </article>
        <article class="card reveal">
          <div class="card-i">
            <i
              aria-hidden="true"
              class="fa-solid fa-pen-ruler"
            />
          </div>
          <h3>IurisCore Redactor Independiente</h3>
          <p>
            Procesador jurídico con regla, sangrías, columnas, resaltados Forenses, analizador de
            estilo, diccionarios integrados y exportación Word / PDF exacta.
          </p>
        </article>
        <article class="card reveal">
          <div class="card-i">
            <i
              aria-hidden="true"
              class="fa-solid fa-book-open"
            />
          </div>
          <h3>Normativa + Organigramas</h3>
          <p>
            Indexa códigos y leyes PDF automáticamente; visualiza su árbol completo en organigrama
            vertical u horizontal y copia citas exactas.
          </p>
        </article>
        <article class="card reveal">
          <div class="card-i">
            <i
              aria-hidden="true"
              class="fa-solid fa-diagram-project"
            />
          </div>
          <h3>Procedimientos y Flujogramas</h3>
          <p>
            Modela procesos por carriles, plazos, requisitos y decisiones; recórrelos paso a paso en
            audiencia o desde el móvil a pantalla completa.
          </p>
        </article>
        <article class="card reveal">
          <div class="card-i">
            <i
              aria-hidden="true"
              class="fa-solid fa-gavel"
            />
          </div>
          <h3>Buscador TSJ &amp; TCP + Biblioteca</h3>
          <p>
            Consulta jurisprudencia boliviana actualizada, descárgala en PDF a tu biblioteca offline
            y ábrela en Windows o Android al instante.
          </p>
        </article>
        <article class="card reveal">
          <div class="card-i">
            <i
              aria-hidden="true"
              class="fa-solid fa-spell-check"
            />
          </div>
          <h3>Diccionarios Jurídicos FTS5</h3>
          <p>
            Glosarios doctrinales (Cabanellas, Ossorio y tus propios PDFs) con búsqueda instantánea
            de definiciones y lectura sincronizada por página.
          </p>
        </article>
      </div>
    </div>
  </section>

  <section
    v-if="capturasGaleria.length > 0"
    class="sec ic-galeria-sec"
  >
    <div class="c">
      <div class="sh center">
        <span class="sl">VISTAS REALES DEL SISTEMA</span>
        <h2 class="st">
          Galería de Interfaces (PC y Android)
        </h2>
        <p class="sd">
          Explora las pantallas del entorno de escritorio para Windows y la experiencia táctil en
          dispositivos móviles.
        </p>
      </div>

      <div
        class="ic-galeria-filtros"
        role="group"
        aria-label="Filtrar capturas por plataforma"
      >
        <button
          type="button"
          :class="['ic-mod-btn', { activo: filtroGaleria === 'todas' }]"
          @click="filtroGaleria = 'todas'"
        >
          Todas ({{ capturasGaleria.length }})
        </button>
        <button
          type="button"
          :class="['ic-mod-btn', { activo: filtroGaleria === 'pc' }]"
          @click="filtroGaleria = 'pc'"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-desktop"
          /> Escritorio PC
        </button>
        <button
          type="button"
          :class="['ic-mod-btn', { activo: filtroGaleria === 'movil' }]"
          @click="filtroGaleria = 'movil'"
        >
          <i
            aria-hidden="true"
            class="fa-brands fa-android"
          /> Móvil Android
        </button>
      </div>

      <div class="ic-galeria-grid">
        <article
          v-for="item in itemsGaleriaFiltrados"
          :key="item.id || item.key"
          class="ic-galeria-card"
        >
          <button
            type="button"
            :class="['ic-galeria-media-btn', { movil: esTipoMovil(item.tipo) }]"
            :aria-label="`Ampliar ${item.titulo}`"
            @click="lightboxItem = item"
          >
            <img
              :src="item.url"
              :alt="item.titulo"
              loading="lazy"
            >
            <span class="ic-galeria-zoom">
              <i
                aria-hidden="true"
                class="fa-solid fa-magnifying-glass-plus"
              /> Ampliar
            </span>
          </button>
          <div class="ic-galeria-body">
            <span class="ic-badge-producto">{{ etiquetaTipoMedia(item.tipo) }}</span>
            <h3>{{ item.titulo }}</h3>
            <p v-if="item.descripcion">
              {{ item.descripcion }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section
    id="descargas"
    class="sec-stripe"
  >
    <div class="c">
      <div class="sh center">
        <span class="sl">MULTIPLATAFORMA REAL</span>
        <h2 class="st">
          Descarga la edición exacta para tu equipo
        </h2>
        <p class="sd">
          Instaladores oficiales alojados en el portal de IurisCore. Una misma licencia activa PC y Android.
        </p>
      </div>

      <div class="ic-plat-grid">
        <article class="ic-plat-card">
          <div class="ic-plat-ico">
            <i
              aria-hidden="true"
              class="fa-brands fa-windows"
            />
          </div>
          <h3>Windows 10 / 11</h3>
          <p>
            Edición nativa de alto rendimiento con motor Tauri v2, Auto-Updater y accesos directos
            propios para IurisCore e IurisCore Redactor.
          </p>
          <ul class="ic-plat-specs">
            <li>
              <i
                aria-hidden="true"
                class="fa-solid fa-check"
              /> Impresión física 1:1 en Carta, Oficio y A4
            </li>
            <li>
              <i
                aria-hidden="true"
                class="fa-solid fa-check"
              /> Actualizaciones firmadas con 1 clic
            </li>
          </ul>
          <div class="ic-plat-actions">
            <a
              class="btn btn-gold ic-dl-btn"
              :href="infoVer?.descargas?.win10_64?.url || infoVer?.url_descarga || SITE.iuriscore.descargar"
              target="_blank"
              rel="noopener"
            >
              <span>Windows 64-bit (.exe)</span>
              <span class="ic-dl-meta">{{ textoTamanoMb(infoVer?.descargas?.win10_64?.tamanoMb ?? infoVer?.tamano_mb) }}</span>
            </a>
            <a
              v-if="infoVer?.descargas?.win10_32?.url"
              class="btn btn-ghost ic-dl-btn"
              :href="infoVer.descargas.win10_32.url"
              target="_blank"
              rel="noopener"
            >
              <span>Windows 32-bit (.exe)</span>
              <span class="ic-dl-meta">{{ textoTamanoMb(infoVer.descargas.win10_32.tamanoMb) }}</span>
            </a>
          </div>
        </article>

        <article class="ic-plat-card">
          <div class="ic-plat-ico">
            <i
              aria-hidden="true"
              class="fa-solid fa-desktop"
            />
          </div>
          <h3>Windows 7 Offline</h3>
          <p>
            Edición especial para equipos con Windows 7 SP1 (32 y 64 bits) sin necesidad de WebView2
            ni conexión a internet.
          </p>
          <ul class="ic-plat-specs">
            <li>
              <i
                aria-hidden="true"
                class="fa-solid fa-check"
              /> Incluye IurisCore Redactor y Sync Drive
            </li>
            <li>
              <i
                aria-hidden="true"
                class="fa-solid fa-check"
              /> Comparte la misma base de datos SQLite
            </li>
          </ul>
          <div class="ic-plat-actions">
            <a
              v-if="infoVer?.descargas?.win7_64?.url"
              class="btn btn-teal ic-dl-btn"
              :href="infoVer.descargas.win7_64.url"
              target="_blank"
              rel="noopener"
            >
              <span>Win 7 64-bit (.exe)</span>
              <span class="ic-dl-meta">{{ textoTamanoMb(infoVer.descargas.win7_64.tamanoMb) }}</span>
            </a>
            <a
              v-if="infoVer?.descargas?.win7_32?.url"
              class="btn btn-ghost ic-dl-btn"
              :href="infoVer.descargas.win7_32.url"
              target="_blank"
              rel="noopener"
            >
              <span>Win 7 32-bit (.exe)</span>
              <span class="ic-dl-meta">{{ textoTamanoMb(infoVer.descargas.win7_32.tamanoMb) }}</span>
            </a>
            <a
              v-if="!infoVer?.descargas?.win7_64?.url && !infoVer?.descargas?.win7_32?.url"
              class="btn btn-ghost ic-dl-btn"
              :href="SITE.iuriscore.descargar"
              target="_blank"
              rel="noopener"
            >
              <span>Ver en Centro de Descargas</span>
              <span class="ic-dl-meta">Portal ↗</span>
            </a>
          </div>
        </article>

        <article class="ic-plat-card">
          <div class="ic-plat-ico">
            <i
              aria-hidden="true"
              class="fa-brands fa-android"
            />
          </div>
          <h3>Android (Móvil / Tablet)</h3>
          <p>
            Lleva tus expedientes, códigos, organigramas, flujogramas y jurisprudencia a audiencias y
            juzgados con visor integrado y pantalla completa.
          </p>
          <ul class="ic-plat-specs">
            <li>
              <i
                aria-hidden="true"
                class="fa-solid fa-check"
              /> Gestos táctiles y visor PDF / DOCX integrado
            </li>
            <li>
              <i
                aria-hidden="true"
                class="fa-solid fa-check"
              /> Sync incremental rápida con tu Google Drive
            </li>
          </ul>
          <div class="ic-plat-actions">
            <a
              class="btn btn-teal ic-dl-btn"
              :href="infoVer?.descargas?.android_apk?.url || SITE.iuriscore.descargar"
              target="_blank"
              rel="noopener"
            >
              <span>{{ infoVer?.descargas?.android_apk?.url ? 'Descargar Android (.apk)' : 'Centro de Descargas Android' }}</span>
              <span class="ic-dl-meta">{{ infoVer?.descargas?.android_apk?.url ? textoTamanoMb(infoVer.descargas.android_apk.tamanoMb) : 'Portal ↗' }}</span>
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section
    id="planes"
    class="sec"
  >
    <div class="c">
      <div class="sh center">
        <span class="sl">PLANES Y LICENCIAS · BOLIVIA</span>
        <h2 class="st">
          Invierte menos que un memorial al mes
        </h2>
        <p class="sd">
          Todos los planes incluyen soporte en Bolivia, pago por QR Simple, derecho a renovación
          preferencial (-15 %) y uso simultáneo PC + Android.
        </p>
      </div>

      <div
        class="ic-tipo-switch"
        role="group"
        aria-label="Seleccionar categoría de tarifa"
      >
        <button
          type="button"
          :class="['ic-tipo-btn', { activo: tipoTarifa === 'profesional' }]"
          @click="tipoTarifa = 'profesional'"
        >
          Abogados y Estudios
        </button>
        <button
          type="button"
          :class="['ic-tipo-btn', { activo: tipoTarifa === 'estudiante' }]"
          @click="tipoTarifa = 'estudiante'"
        >
          Estudiantes de Derecho (-50 %)
        </button>
      </div>

      <div
        v-if="tipoTarifa === 'profesional'"
        class="ic-mod-selector"
        role="group"
        aria-label="Seleccionar modalidad de equipos"
      >
        <button
          v-for="m in modalidadesVisibles"
          :key="m.id"
          type="button"
          :class="['ic-mod-btn', { activo: modSelId === m.id }]"
          @click="modSelId = m.id"
        >
          {{ m.nombre }} ({{ m.max_equipos }}
          {{ m.max_equipos === 1 ? 'puesto' : 'puestos'
          }}{{ m.descuento_pct > 0 ? ` · -${m.descuento_pct}%` : '' }})
        </button>
      </div>
      <div
        v-else
        class="ic-est-banner"
      >
        <i
          aria-hidden="true"
          class="fa-solid fa-graduation-cap"
        />
        <span>
          <strong>Tarifa Universitaria (-50 %):</strong> 1 PC Windows + 1 Android con acceso íntegro.
          Validación con matrícula o carnet universitario al confirmar QR.
        </span>
      </div>

      <div :class="['ic-pricing-grid', { estudiante: tipoTarifa === 'estudiante' }]">
        <article
          v-for="p in planesVisibles"
          :key="p.id"
          :class="[
            'ic-plan-card',
            { destacado: p.id === 'pro_anual' || p.id === 'est_semestral' },
          ]"
        >
          <span
            v-if="p.id === 'pro_anual'"
            class="ic-plan-badge"
          >Más popular · -37 %</span>
          <span
            v-else-if="p.id === 'est_semestral'"
            class="ic-plan-badge"
          >Recomendado</span>
          <span
            v-else-if="precioPlan(p).ahorroMensualPct > 0"
            class="ic-plan-ahorro"
          >Ahorra {{ precioPlan(p).ahorroMensualPct }} % vs mensual</span>

          <h3 class="ic-plan-nombre">
            {{ p.nombre }}
          </h3>
          <div class="ic-plan-precio">
            <strong>Bs {{ precioPlan(p).equiv }}</strong>
            <span>/ mes</span>
          </div>
          <p class="ic-plan-facturado">
            Facturado <strong>Bs {{ precioPlan(p).total }}</strong> · {{ p.duracion_dias ?? 30 }} días ·
            {{ precioPlan(p).eq }}
            {{ precioPlan(p).eq === 1 ? 'puesto PC + Android' : 'puestos PC + Android' }}
          </p>
          <span
            v-if="precioPlan(p).ahorro > 0"
            class="ic-plan-ahorro"
          >
            Ahorras Bs {{ precioPlan(p).ahorro }} por volumen (-{{ precioPlan(p).desc }} %)
          </span>
          <ul class="ic-plan-lista">
            <li>
              <i
                aria-hidden="true"
                class="fa-solid fa-circle-check"
              />
              <span>Hasta {{ p.gracia_offline_dias ?? 30 }} días de trabajo 100 % offline</span>
            </li>
            <li>
              <i
                aria-hidden="true"
                class="fa-solid fa-circle-check"
              />
              <span>Sincronización cifrada incremental PC ↔ Android</span>
            </li>
            <li>
              <i
                aria-hidden="true"
                class="fa-solid fa-circle-check"
              />
              <span>Renovación preferencial (-15 %) antes de vencer</span>
            </li>
          </ul>
          <a
            :class="[
              'btn',
              p.id === 'pro_anual' || p.id === 'est_semestral' ? 'btn-gold' : 'btn-teal',
            ]"
            :href="linkComprar(p.id)"
            target="_blank"
            rel="noopener"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-qrcode"
            />
            Adquirir con QR
          </a>
        </article>
      </div>

      <div class="ic-ent-band">
        <div class="ic-ent-card">
          <div>
            <span class="ic-badge-producto">Licencia Perpetua &amp; Bufetes (10+ PCs)</span>
            <h3>Cotización Corporativa a Consulta</h3>
            <p>
              Pago único de por vida de la versión adquirida con 12 meses de actualizaciones mayores,
              soporte prioritario e inducción personalizada.
            </p>
          </div>
          <a
            class="btn btn-ghost"
            :href="whatsappPerpetua"
            target="_blank"
            rel="noopener"
          >
            <i
              aria-hidden="true"
              class="fa-brands fa-whatsapp"
            />
            Consultar Perpetua o Bufete
          </a>
        </div>
        <div class="ic-ent-card">
          <div>
            <span class="ic-badge-producto">Derecho a Renovación</span>
            <h3>Congela tu tarifa + 15 % de descuento</h3>
            <p>
              Al renovar tu plan antes del vencimiento mantienes tu tarifa inicial y recibes un 15 %
              de descuento de fidelidad sin interrumpir tus expedientes.
            </p>
          </div>
          <a
            class="btn btn-gold"
            :href="linkComprar('pro_anual')"
            target="_blank"
            rel="noopener"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-shield-halved"
            />
            Asegurar Pro Anual
          </a>
        </div>
      </div>
    </div>
  </section>

  <section class="sec-stripe">
    <div class="c">
      <div class="sh center">
        <span class="sl">PREGUNTAS FRECUENTES</span>
        <h2 class="st">
          Dudas comunes antes de empezar
        </h2>
      </div>

      <div class="ic-faq-lista">
        <div
          v-for="(item, idx) in faqs"
          :key="item.q"
          class="ic-faq-item"
        >
          <button
            type="button"
            :aria-expanded="faqAbierta === idx"
            @click="faqAbierta = faqAbierta === idx ? null : idx"
          >
            <span>{{ item.q }}</span>
            <i
              aria-hidden="true"
              :class="faqAbierta === idx ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
            />
          </button>
          <p v-if="faqAbierta === idx">
            {{ item.a }}
          </p>
        </div>
      </div>

      <div
        class="ic-cta-legal"
        style="text-align: center; margin-top: 28px"
      >
        <a
          :href="SITE.iuriscore.home"
          target="_blank"
          rel="noopener"
        >Sitio oficial IurisCore</a>
        ·
        <a
          :href="SITE.iuriscore.privacidad"
          target="_blank"
          rel="noopener"
        >Política de Privacidad</a>
        ·
        <a
          :href="SITE.iuriscore.terminos"
          target="_blank"
          rel="noopener"
        >Términos del Servicio</a>
      </div>
    </div>
  </section>

  <div
    v-if="lightboxItem"
    class="ic-lightbox"
    role="dialog"
    aria-modal="true"
    :aria-label="lightboxItem.titulo"
    @click.self="lightboxItem = null"
  >
    <div class="ic-lightbox-panel">
      <div class="ic-lightbox-head">
        <div>
          <span class="ic-badge-producto">{{ etiquetaTipoMedia(lightboxItem.tipo) }}</span>
          <strong>{{ lightboxItem.titulo }}</strong>
        </div>
        <button
          type="button"
          class="ic-lightbox-close"
          aria-label="Cerrar vista previa"
          @click="lightboxItem = null"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-xmark"
          />
        </button>
      </div>
      <img
        :src="lightboxItem.url"
        :alt="lightboxItem.titulo"
        class="ic-lightbox-img"
      >
      <p
        v-if="lightboxItem.descripcion"
        class="ic-lightbox-desc"
      >
        {{ lightboxItem.descripcion }}
      </p>
    </div>
  </div>
</template>
