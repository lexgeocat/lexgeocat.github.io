import type {
  Cotizacion,
  FactorPrecio,
  Normativa,
  Servicio,
} from './supabase'

export interface Database {
  public: {
    Tables: {
      servicios: {
        Row: Servicio
        Insert: Partial<Servicio> & Pick<Servicio, 'area' | 'label' | 'categoria'>
        Update: Partial<Servicio>
        Relationships: []
      }
      factores_precio: {
        Row: FactorPrecio
        Insert: Partial<FactorPrecio> & Pick<FactorPrecio, 'id' | 'etiqueta' | 'parametros'>
        Update: Partial<FactorPrecio>
        Relationships: []
      }
      normativa: {
        Row: Normativa
        Insert: Partial<Normativa> & Pick<Normativa, 'titulo' | 'categoria' | 'estado'>
        Update: Partial<Normativa>
        Relationships: []
      }
      cotizaciones: {
        Row: Cotizacion
        Insert: Partial<Cotizacion> & Pick<Cotizacion, 'servicio_id' | 'area' | 'detalles'>
        Update: Partial<Cotizacion>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
