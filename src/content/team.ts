export type TeamSpecialtyKey =
  | 'derecho'
  | 'catastro'
  | 'ordenamiento'
  | 'geografia'
  | 'topografia'
  | 'geomatica'
  | 'software'

export interface FounderProfile {
  name: string
  role: string
  photo?: string
  photoAlt: string
  degrees: string[]
}

export interface AssociateProfileSlot {
  id: string
  specialtyKey: TeamSpecialtyKey
  specialtyLabel: string
  specialtyClass: `esp-${TeamSpecialtyKey}`
  specialtyRoute: string
  icon: string
  name: string
  photo?: string
}

export const FOUNDER_PROFILE: FounderProfile = {
  name: 'Cristian Brayan Ruiz Quiroga',
  role: 'Fundador y Director Técnico-Jurídico',
  // Cuando agregues tu fotografía (p. ej. src/assets/img/cristian.jpg), impórtala aquí:
  photo: undefined,
  photoAlt: 'Cristian Brayan Ruiz Quiroga — Fundador de LexGeoCat',
  degrees: [
    'T.U.S. en Catastro y Ordenamiento Territorial — UMSA',
    'Licenciado en Derecho — UPEA',
  ],
}

export const TEAM_BY_SPECIALTY: AssociateProfileSlot[] = [
  {
    id: 'prof-derecho',
    specialtyKey: 'derecho',
    specialtyLabel: 'Derecho',
    specialtyClass: 'esp-derecho',
    specialtyRoute: '/pages/derecho.html',
    icon: 'fa-scale-balanced',
    name: 'Próxima incorporación',
    photo: undefined,
  },
  {
    id: 'prof-catastro',
    specialtyKey: 'catastro',
    specialtyLabel: 'Catastro',
    specialtyClass: 'esp-catastro',
    specialtyRoute: '/pages/catastro.html',
    icon: 'fa-map',
    name: 'Próxima incorporación',
    photo: undefined,
  },
  {
    id: 'prof-ordenamiento',
    specialtyKey: 'ordenamiento',
    specialtyLabel: 'Ordenamiento Territorial',
    specialtyClass: 'esp-ordenamiento',
    specialtyRoute: '/pages/ordenamiento.html',
    icon: 'fa-compass-drafting',
    name: 'Próxima incorporación',
    photo: undefined,
  },
  {
    id: 'prof-geografia',
    specialtyKey: 'geografia',
    specialtyLabel: 'Geografía',
    specialtyClass: 'esp-geografia',
    specialtyRoute: '/pages/geografia.html',
    icon: 'fa-earth-americas',
    name: 'Próxima incorporación',
    photo: undefined,
  },
  {
    id: 'prof-topografia',
    specialtyKey: 'topografia',
    specialtyLabel: 'Topografía y Geodesia',
    specialtyClass: 'esp-topografia',
    specialtyRoute: '/pages/topogeodesia.html',
    icon: 'fa-mountain',
    name: 'Próxima incorporación',
    photo: undefined,
  },
  {
    id: 'prof-geomatica',
    specialtyKey: 'geomatica',
    specialtyLabel: 'Geomática',
    specialtyClass: 'esp-geomatica',
    specialtyRoute: '/pages/geomatica.html',
    icon: 'fa-layer-group',
    name: 'Próxima incorporación',
    photo: undefined,
  },
  {
    id: 'prof-software',
    specialtyKey: 'software',
    specialtyLabel: 'Software y Web GIS',
    specialtyClass: 'esp-software',
    specialtyRoute: '/pages/desarrollo-software.html',
    icon: 'fa-code',
    name: 'Próxima incorporación',
    photo: undefined,
  },
]
