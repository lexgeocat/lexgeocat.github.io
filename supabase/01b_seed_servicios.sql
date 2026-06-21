-- ═══════════════════════════════════════════════════════════════
-- LEXGEOCAT — 05a. Seed: servicios (7 por área × 7 áreas = 49)
-- Requiere: 01_servicios.sql
-- Idempotente: usa upsert por id.
-- ═══════════════════════════════════════════════════════════════

insert into servicios (
  id, area, label, categoria, descripcion, tags, img_url,
  precio_min, precio_max, tiempo_min, tiempo_max, complejidad,
  details_type, unit_label, orden, activo
) values

-- ───────────────────────── DERECHO ─────────────────────────
('usucapion', 'derecho', 'Usucapión', 'Derecho Civil',
 'Prescripción adquisitiva de propiedad por posesión continua y pacífica.',
 array['Proceso','+10 años','Rural/Urbano'], null,
 3500, 9000, '6 meses', '18 meses', 'Alta', 'usucapion', null, 1, true),

('saneamiento_titulos', 'derecho', 'Saneamiento de Títulos', 'Derecho Civil',
 'Regularización de la situación jurídica de un predio con cargas u observaciones.',
 array['Títulos','Gravámenes'], null,
 2000, 6000, '2 meses', '8 meses', 'Media', 'saneamiento', null, 2, true),

('compraventa_inmuebles', 'derecho', 'Compraventa de Inmuebles', 'Derecho Civil',
 'Asesoría legal completa en compraventa, minuta y transferencia registral.',
 array['Contratos','Registro'], null,
 800, 2500, '1 semana', '4 semanas', 'Baja', 'compraventa', null, 3, true),

('sucesiones_herencias', 'derecho', 'Sucesiones y Herencias', 'Derecho Civil',
 'Declaratoria de herederos y partición de bienes hereditarios.',
 array['Herencia','Partición'], null,
 1500, 5000, '1 mes', '6 meses', 'Media', 'sucesiones', null, 4, true),

('contratos_civiles', 'derecho', 'Contratos Civiles y Comerciales', 'Derecho Civil',
 'Redacción, revisión y negociación de contratos civiles y comerciales.',
 array['Contratos','Redacción'], null,
 600, 3000, '3 días', '3 semanas', 'Baja', 'contratos', null, 5, true),

('saneamiento_inra', 'derecho', 'Saneamiento INRA', 'Derecho Agrario',
 'Acompañamiento legal en procesos de saneamiento de tierras ante el INRA.',
 array['Agrario','INRA'], null,
 4000, 15000, '6 meses', '24 meses', 'Alta', 'inra', null, 6, true),

('constitucion_sociedades', 'derecho', 'Constitución de Sociedades', 'Derecho Corporativo',
 'Constitución, estatutos y registro de sociedades comerciales en FUNDEMPRESA.',
 array['Empresas','Registro'], null,
 1200, 4000, '2 semanas', '6 semanas', 'Media', 'general', null, 7, true),

-- ───────────────────────── CATASTRO ─────────────────────────
('ficha_predial', 'catastro', 'Ficha Predial', 'Catastro',
 'Levantamiento y elaboración de ficha catastral predial individual.',
 array['Predial','Campo'], null,
 250, 800, '3 días', '2 semanas', 'Baja', 'catastro_predio', null, 1, true),

('catastro_lote_predios', 'catastro', 'Catastro por Lote de Predios', 'Catastro',
 'Levantamiento catastral de un conjunto de predios en una misma zona.',
 array['Predial','Lote'], null,
 2000, 12000, '1 mes', '4 meses', 'Media', 'catastro_predio', null, 2, true),

('geocodificacion_area', 'catastro', 'Geocodificación por Área', 'Catastro',
 'Asignación de nomenclatura y geocódigos catastrales por área urbana.',
 array['Nomenclatura','SIG'], null,
 1500, 6000, '3 semanas', '3 meses', 'Media', 'catastro_area', null, 3, true),

('valuacion_fiscal', 'catastro', 'Valuación Fiscal', 'Catastro',
 'Determinación del avalúo fiscal de un predio conforme a normativa municipal.',
 array['Avalúo','Fiscal'], null,
 300, 1200, '1 semana', '3 semanas', 'Baja', 'general', null, 4, true),

('actualizacion_catastral', 'catastro', 'Actualización Catastral', 'Catastro',
 'Actualización de datos físicos, jurídicos y económicos de predios existentes.',
 array['Actualización','Base de datos'], null,
 1800, 7000, '1 mes', '3 meses', 'Media', 'catastro_predio', null, 5, true),

('catastro_municipal_integral', 'catastro', 'Catastro Municipal Integral', 'Catastro',
 'Proyecto integral de implementación o actualización del catastro municipal.',
 array['Municipal','Proyecto'], null,
 15000, 90000, '6 meses', '18 meses', 'Alta', 'catastro_municipal', null, 6, true),

('regularizacion_catastral', 'catastro', 'Regularización Catastral', 'Catastro',
 'Corrección de inconsistencias entre catastro y registro de derechos reales.',
 array['Regularización','DDRR'], null,
 500, 2500, '2 semanas', '2 meses', 'Media', 'general', null, 7, true),

-- ─────────────────────── ORDENAMIENTO ───────────────────────
('plot_municipal', 'ordenamiento', 'Plan de Ordenamiento (PLOT)', 'Ordenamiento Territorial',
 'Elaboración de Plan de Uso de Suelo y Ordenamiento Territorial municipal.',
 array['PLOT','Municipal'], null,
 20000, 80000, '6 meses', '12 meses', 'Alta', 'sig_mun', null, 1, true),

('zonificacion_urbana', 'ordenamiento', 'Zonificación Urbana', 'Ordenamiento Territorial',
 'Definición de zonas de uso de suelo urbano y normativa de edificación.',
 array['Zonificación','Urbano'], null,
 5000, 20000, '2 meses', '6 meses', 'Alta', 'general', null, 2, true),

('diagnostico_territorial', 'ordenamiento', 'Diagnóstico Territorial', 'Ordenamiento Territorial',
 'Análisis biofísico, socioeconómico y de uso actual del territorio.',
 array['Diagnóstico','Análisis'], null,
 3000, 12000, '1 mes', '3 meses', 'Media', 'sig_mun', null, 3, true),

('asesoria_gam', 'ordenamiento', 'Asesoría a Gobiernos Municipales', 'Ordenamiento Territorial',
 'Acompañamiento técnico continuo a Gobiernos Autónomos Municipales (GAMs).',
 array['GAM','Asesoría'], null,
 2000, 10000, '1 mes', 'Continuo', 'Media', 'general', 'por mes', 4, true),

('reglamento_uso_suelo', 'ordenamiento', 'Reglamento de Uso de Suelo', 'Ordenamiento Territorial',
 'Redacción de reglamento técnico-normativo de uso y ocupación del suelo.',
 array['Reglamento','Normativa'], null,
 4000, 15000, '6 semanas', '4 meses', 'Alta', 'general', null, 5, true),

('plan_desarrollo_municipal', 'ordenamiento', 'Plan de Desarrollo Municipal (PDM)', 'Ordenamiento Territorial',
 'Elaboración de instrumento de planificación de desarrollo municipal.',
 array['PDM','Planificación'], null,
 15000, 60000, '4 meses', '10 meses', 'Alta', 'sig_mun', null, 6, true),

('estudio_riesgos_territoriales', 'ordenamiento', 'Estudio de Riesgos Territoriales', 'Ordenamiento Territorial',
 'Identificación de amenazas y zonas de riesgo para fines de planificación.',
 array['Riesgos','Planificación'], null,
 3500, 14000, '1 mes', '4 meses', 'Alta', 'general', null, 7, true),

-- ───────────────────────── GEOGRAFÍA ─────────────────────────
('estudio_geografico_fisico', 'geografia', 'Estudio de Geografía Física', 'Geografía Física',
 'Caracterización de relieve, clima, hidrografía y geomorfología de un área.',
 array['Física','Relieve'], null,
 2500, 10000, '3 semanas', '3 meses', 'Media', 'geografia_estudio', null, 1, true),

('estudio_geografico_humano', 'geografia', 'Estudio de Geografía Humana', 'Geografía Humana',
 'Análisis poblacional, cultural y de actividades económicas en el territorio.',
 array['Humana','Población'], null,
 2000, 8000, '3 semanas', '2 meses', 'Media', 'geografia_estudio', null, 2, true),

('caracterizacion_regional', 'geografia', 'Caracterización Regional', 'Geografía Regional',
 'Caracterización de regiones, cuencas, valles y unidades territoriales.',
 array['Regional','Cuencas'], null,
 3000, 12000, '1 mes', '3 meses', 'Media', 'geografia_estudio', null, 3, true),

('analisis_vulnerabilidad', 'geografia', 'Análisis de Vulnerabilidad', 'Riesgos y Vulnerabilidad',
 'Evaluación de susceptibilidad y vulnerabilidad territorial ante amenazas naturales.',
 array['Riesgos','Vulnerabilidad'], null,
 3500, 13000, '1 mes', '3 meses', 'Alta', 'geografia_estudio', null, 4, true),

('cartografia_basica', 'geografia', 'Cartografía Básica de Apoyo', 'Geografía Aplicada',
 'Elaboración de mapas base para estudios geográficos o académicos.',
 array['Cartografía','Mapas'], null,
 500, 2500, '1 semana', '3 semanas', 'Baja', 'cartografia_mapas', null, 5, true),

('estudio_impacto_territorial', 'geografia', 'Estudio de Impacto Territorial', 'Geografía Aplicada',
 'Evaluación de efectos territoriales de proyectos de infraestructura o uso de suelo.',
 array['Impacto','Proyectos'], null,
 4000, 16000, '1 mes', '4 meses', 'Alta', 'geografia_estudio', null, 6, true),

('consultoria_geoespacial', 'geografia', 'Consultoría Geoespacial', 'Geografía Aplicada',
 'Asesoría puntual en análisis geoespacial para instituciones y proyectos.',
 array['Consultoría','SIG'], null,
 800, 3500, '1 semana', '1 mes', 'Media', 'general', 'por entrega', 7, true),

-- ─────────────────────── TOPOGRAFÍA / GEODESIA ───────────────────────
('levantamiento_topo_area', 'topografia', 'Levantamiento Topográfico por Área', 'Topografía',
 'Levantamiento planimétrico y altimétrico de un predio o área de terreno.',
 array['Campo','Planimetría'], null,
 600, 5000, '3 días', '3 semanas', 'Media', 'topo_area', null, 1, true),

('georreferenciacion_puntos', 'topografia', 'Georreferenciación GNSS', 'Topografía / Geodesia',
 'Posicionamiento GNSS de puntos de control con precisión centimétrica.',
 array['GNSS','Puntos de control'], null,
 400, 4000, '1 día', '2 semanas', 'Media', 'topo_puntos', null, 2, true),

('replanteo_terreno', 'topografia', 'Replanteo de Terreno', 'Topografía',
 'Materialización en campo de límites, ejes o cotas de proyecto.',
 array['Replanteo','Campo'], null,
 500, 3000, '2 días', '2 semanas', 'Media', 'topo_area', null, 3, true),

('curvas_nivel_mdt', 'topografia', 'Curvas de Nivel y MDT', 'Topografía',
 'Generación de curvas de nivel y modelo digital de terreno (MDT).',
 array['MDT','Curvas de nivel'], null,
 700, 5500, '1 semana', '4 semanas', 'Media', 'topo_area', null, 4, true),

('cubicacion_volumenes', 'topografia', 'Cubicación de Volúmenes', 'Topografía',
 'Cálculo de volúmenes de corte y relleno para obras civiles.',
 array['Volúmenes','Obras'], null,
 600, 4500, '1 semana', '3 semanas', 'Media', 'topo_area', null, 5, true),

('red_geodesica_control', 'topografia', 'Red Geodésica de Control', 'Geodesia',
 'Diseño, monumentación y observación de redes de puntos de control geodésico.',
 array['Geodesia','Red de control'], null,
 3000, 18000, '1 mes', '4 meses', 'Alta', 'topo_puntos', null, 6, true),

('modelo_geoidal_local', 'topografia', 'Modelo Geoidal Local', 'Geodesia',
 'Determinación de altitudes ortométricas mediante modelo geoidal ajustado.',
 array['Geodesia','Altimetría'], null,
 2000, 9000, '2 semanas', '2 meses', 'Alta', 'topo_puntos', null, 7, true),

-- ───────────────────────── GEOMÁTICA ─────────────────────────
('implementacion_postgis', 'geomatica', 'Implementación PostGIS', 'Geomática / Software',
 'Diseño e implementación de base de datos espacial con PostgreSQL/PostGIS.',
 array['PostGIS','Base de datos'], null,
 1500, 8000, '3 semanas', '2 meses', 'Media', 'sig_mun', null, 1, true),

('analisis_espacial_avanzado', 'geomatica', 'Análisis Espacial Avanzado', 'Geomática',
 'Geoprocesamiento, modelos predictivos y análisis de conectividad territorial.',
 array['Geoprocesamiento','Modelos'], null,
 1200, 6000, '2 semanas', '6 semanas', 'Alta', 'general', null, 2, true),

('teledeteccion_satelital', 'geomatica', 'Teledetección Satelital', 'Geomática / Teledetección',
 'Procesamiento de imágenes Sentinel/Landsat y análisis multiespectral (NDVI, etc.).',
 array['Teledetección','NDVI'], null,
 1000, 7000, '2 semanas', '2 meses', 'Alta', 'general', null, 3, true),

('cartografia_tematica', 'geomatica', 'Cartografía Temática', 'Geomática',
 'Elaboración de mapas temáticos especializados para proyectos y publicaciones.',
 array['Cartografía','Temática'], null,
 500, 4000, '1 semana', '1 mes', 'Media', 'cartografia_mapas', null, 4, true),

('visor_web_mapas', 'geomatica', 'Visor Web de Mapas', 'Geomática / Software',
 'Desarrollo de visor web interactivo de capas geográficas (Leaflet/MapLibre).',
 array['Visor','Web'], null,
 1500, 10000, '3 semanas', '3 meses', 'Alta', 'sig_mun', null, 5, true),

('servicios_ogc', 'geomatica', 'Publicación de Servicios OGC', 'Geomática',
 'Publicación de capas mediante servicios WMS/WFS/WCS en GeoServer.',
 array['OGC','GeoServer'], null,
 800, 5000, '1 semana', '4 semanas', 'Media', 'sig_mun', null, 6, true),

('automatizacion_geoespacial', 'geomatica', 'Automatización Geoespacial', 'Geomática / Software',
 'Scripts Python (GeoPandas, GDAL/OGR) para flujos ETL geoespaciales automatizados.',
 array['Python','ETL'], null,
 700, 5000, '1 semana', '4 semanas', 'Alta', 'software_tiempo', null, 7, true),

-- ───────────────────────── SOFTWARE ─────────────────────────
('app_web_geografica', 'software', 'Aplicación Web Geográfica', 'Software / Geomática',
 'Desarrollo de aplicación web a medida con componente geoespacial.',
 array['Web','Geoespacial'], null,
 2000, 15000, '1 mes', '4 meses', 'Alta', 'software_modulos', null, 1, true),

('api_geoespacial', 'software', 'API REST Geoespacial', 'Software / GIS',
 'Diseño e implementación de API REST para consumo de datos geoespaciales.',
 array['API','Backend'], null,
 1500, 9000, '3 semanas', '2 meses', 'Alta', 'software_modulos', null, 2, true),

('portal_institucional', 'software', 'Portal Institucional', 'Software',
 'Desarrollo de portal web institucional con panel de administración.',
 array['Portal','Web'], null,
 1200, 8000, '3 semanas', '2 meses', 'Media', 'software_modulos', null, 3, true),

('sistema_gestion_tramites', 'software', 'Sistema de Gestión de Trámites', 'Software',
 'Sistema web para digitalizar y dar seguimiento a trámites administrativos.',
 array['Trámites','Gestión'], null,
 3000, 20000, '2 meses', '6 meses', 'Alta', 'software_modulos', null, 4, true),

('mantenimiento_software', 'software', 'Mantenimiento de Software', 'Software',
 'Soporte, corrección de errores y mejoras continuas sobre sistemas existentes.',
 array['Mantenimiento','Soporte'], null,
 300, 2500, '1 semana', 'Continuo', 'Baja', 'software_tiempo', 'por mes', 5, true),

('automatizacion_scripts', 'software', 'Scripts de Automatización', 'Software',
 'Scripts a medida en Python/JS para automatizar tareas repetitivas.',
 array['Scripts','Automatización'], null,
 400, 3000, '3 días', '3 semanas', 'Media', 'software_tiempo', null, 6, true),

('despliegue_hosting', 'software', 'Despliegue y Hosting', 'Software',
 'Configuración de despliegue, dominio y hosting (VPS, GitHub Pages, etc.).',
 array['Despliegue','Hosting'], null,
 200, 1500, '1 día', '1 semana', 'Baja', 'general', null, 7, true)

on conflict (id) do update set
  area          = excluded.area,
  label         = excluded.label,
  categoria     = excluded.categoria,
  descripcion   = excluded.descripcion,
  tags          = excluded.tags,
  img_url       = excluded.img_url,
  precio_min    = excluded.precio_min,
  precio_max    = excluded.precio_max,
  tiempo_min    = excluded.tiempo_min,
  tiempo_max    = excluded.tiempo_max,
  complejidad   = excluded.complejidad,
  details_type  = excluded.details_type,
  unit_label    = excluded.unit_label,
  orden         = excluded.orden,
  activo        = excluded.activo;
