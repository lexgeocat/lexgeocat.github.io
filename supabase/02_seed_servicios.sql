-- ═══════════════════════════════════════════════════════════════
-- LEXGEOCAT — Carga inicial de servicios existentes
-- Ejecutar UNA SOLA VEZ, después de 01_setup_supabase.sql
-- Esto migra los servicios que ya tenías hardcodeados en servicios.js
-- ═══════════════════════════════════════════════════════════════

insert into servicios (id, area, label, categoria, descripcion, tags, img_url, precio_min, precio_max, tiempo_min, tiempo_max, complejidad, details_type, unit_label, whatsapp_texto, orden) values

('usucapion', 'derecho', 'Prescripción Adquisitiva (Usucapión)', 'Derecho Civil',
 'Proceso judicial para adquirir propiedad por posesión continua y pacífica. Incluye estudio de títulos, elaboración de demanda y seguimiento procesal.',
 array['Proceso','+10 años','Rural/Urbano'], '', 800, 2500, '18 meses', '36 meses', 'Alta', 'usucapion', null,
 'Consulta Derecho Civil', 1),

('compraventa', 'derecho', 'Compraventa de Inmuebles', 'Derecho Civil',
 'Elaboración y revisión de minutas de compraventa, verificación de tradición dominial, habilitación para registro en DDRR y notaría.',
 array['Contrato','DDRR','Notaría'], '', 300, 800, '1 semana', '3 semanas', 'Media', 'compraventa', null,
 'Consulta Derecho Civil', 2),

('saneamiento_titulos', 'derecho', 'Saneamiento de Títulos', 'Derecho Civil',
 'Regularización de situación jurídica predial: resolución de cargas, gravámenes, superposiciones y vicios ocultos en la cadena de titularidad.',
 array['Saneamiento','Títulos'], '', 600, 1800, '2 meses', '8 meses', 'Alta', 'saneamiento', null,
 'Consulta Derecho Civil', 3),

('sucesiones', 'derecho', 'Sucesiones y Herencias', 'Derecho Civil',
 'Declaratoria de herederos, partición de bienes inmuebles, inventario sucesoral y trámites notariales vinculados a la transferencia por causa de muerte.',
 array['Sucesiones','Herederos'], '', 500, 1500, '2 meses', '6 meses', 'Media-Alta', 'sucesiones', null,
 'Consulta Derecho Civil', 4),

('contratos', 'derecho', 'Contratos Civiles y Comerciales', 'Derecho Civil',
 'Redacción, revisión y negociación de contratos de arrendamiento, anticrético, comodato, promesa de venta y contratos asociativos.',
 array['Contrato','Arrendamiento','Anticrético'], '', 150, 600, '3 días', '2 semanas', 'Baja-Media', 'contratos', null,
 'Consulta Derecho Civil', 5),

('particion', 'derecho', 'División y Partición de Bienes', 'Derecho Civil',
 'Proceso judicial o extrajudicial para la división de bienes en copropiedad, incluyendo la elaboración de planos de subdivisión catastral.',
 array['Partición','Copropiedad'], '', 600, 1500, '3 meses', '12 meses', 'Alta', 'general', null,
 'Consulta Derecho Civil', 6),

('inra', 'derecho', 'Saneamiento de Tierras INRA', 'Derecho Agrario',
 'Acompañamiento y asesoría técnico-jurídica en procesos de saneamiento agrario ante el INRA, incluyendo levantamiento GPS de polígonos prediales.',
 array['INRA','Saneamiento','GPS'], '', 1200, 4000, '6 meses', '24 meses', 'Muy Alta', 'inra', null,
 'Consulta Derecho Agrario', 7),

('minero', 'derecho', 'Concesiones Mineras', 'Derecho Minero',
 'Asesoría en tramitación de contratos administrativos mineros ante AJAM, georeferenciación de cuadrículas mineras y defensa de derechos ante COMIBOL y AJAM.',
 array['AJAM','Cuadrícula','Minería'], '', 1000, 3500, '3 meses', '12 meses', 'Alta', 'general', null,
 'Consulta Derecho Minero', 8),

('sociedad', 'derecho', 'Constitución de Sociedades', 'Derecho Corporativo',
 'Constitución de SRL, SA y cooperativas. Elaboración de estatutos, minuta de constitución, registro en FUNDEMPRESA y en el padrón de contribuyentes.',
 array['SRL','FUNDEMPRESA'], '', 350, 900, '2 semanas', '6 semanas', 'Media', 'general', null,
 'Consulta Derecho Minero', 9),

('ficha_predial', 'catastro', 'Ficha Predial Técnica y Jurídica', 'Catastro',
 'Elaboración de fichas prediales con datos físicos (área, linderos, construcción) y jurídicos (titularidad, gravámenes, tradición) integradas a base de datos SIG.',
 array['Ficha','SIG','QGIS'], '', 80, 300, '2 días', '2 semanas', 'Media', 'catastro_predio', 'por predio',
 'Consulta Catastro', 10),

('geocodificacion', 'catastro', 'Geocodificación y Nomenclatura', 'Catastro',
 'Asignación de códigos catastrales únicos, nomenclatura de calles, numeración predial y actualización de la base alfanumérica municipal.',
 array['Geocodificación','Código'], '', 1500, 5000, '4 semanas', '12 semanas', 'Media-Alta', 'catastro_area', null,
 'Consulta Catastro', 11),

('catastro_municipal', 'catastro', 'Actualización Catastral Municipal', 'Catastro',
 'Proceso integral de actualización o creación del catastro municipal: desde el diagnóstico de la información existente hasta la entrega de la base geoespacial actualizada.',
 array['Municipal','GAM'], '', 5000, 25000, '3 meses', '12 meses', 'Alta', 'catastro_municipal', null,
 'Consulta Catastro', 12),

('valuacion', 'catastro', 'Valuación Fiscal y Comercial', 'Catastro',
 'Determinación del valor catastral para fines del IPBI (Impuesto a la Propiedad de Bienes Inmuebles) y avalúo comercial para transacciones privadas.',
 array['Valuación','IPBI'], '', 200, 800, '3 días', '2 semanas', 'Media', 'general', null,
 'Consulta Catastro', 13),

('levantamiento', 'topografia', 'Levantamiento Planimétrico y Altimétrico', 'Topografía',
 'Medición de puntos en campo con estación total para la elaboración de planos planimétricos y modelos de terreno con curvas de nivel.',
 array['Planimetría','MDT'], '', 300, 2500, '2 días', '3 semanas', 'Media', 'topo_area', 'por hectárea',
 'Consulta Topografía', 14),

('gnss', 'topografia', 'Posicionamiento GNSS Diferencial', 'Topografía / Geodesia',
 'Georreferenciación de alta precisión con GPS diferencial en SIRGAS-BOL. Para control de vértices, límites municipales y puntos de referencia catastral.',
 array['GPS','SIRGAS','Precisión'], '', 250, 1200, '1 día', '1 semana', 'Media-Alta', 'topo_puntos', null,
 'Consulta Topografía', 15),

('cubicaciones', 'topografia', 'Cubicaciones y Movimiento de Tierras', 'Topografía',
 'Cálculo de volúmenes de corte y relleno para proyectos de construcción, infraestructura vial, nivelación de terrenos y diseño de taludes.',
 array['Volumen','Civil 3D'], '', 400, 2000, '1 semana', '4 semanas', 'Media', 'topo_area', null,
 'Consulta Topografía', 16),

('replanteo', 'topografia', 'Replanteo Urbano y de Obras', 'Topografía',
 'Materialización en campo de proyectos de construcción, loteos, urbanizaciones y obras de infraestructura a partir de planos aprobados.',
 array['Replanteo','Obras'], '', 300, 1800, '1 día', '2 semanas', 'Media', 'general', null,
 'Consulta Topografía', 17),

('sig_municipal', 'geomatica', 'Implementación SIG Municipal', 'Geomática',
 'Diseño e implementación de sistema de información geográfica para municipios: base de datos PostGIS, servidor GeoServer, visor web y capacitación al personal técnico.',
 array['PostGIS','GeoServer','Visor'], '', 3500, 15000, '6 semanas', '16 semanas', 'Alta', 'sig_mun', null,
 'Consulta Geomática SIG', 18),

('cartografia', 'geomatica', 'Cartografía Temática', 'Geomática',
 'Elaboración de mapas temáticos en QGIS: catastral, demográfico, uso de suelo, amenazas, infraestructura. Exportación en formatos impresión y web.',
 array['QGIS','Mapa'], '', 150, 800, '3 días', '2 semanas', 'Baja-Media', 'cartografia_mapas', null,
 'Consulta Geomática SIG', 19),

('satelital', 'geomatica', 'Análisis con Imágenes Satelitales', 'Geomática / Teledetección',
 'Procesamiento de imágenes Sentinel, Landsat y Planet para detección de cambios, clasificación de cobertura, índices de vegetación (NDVI) y análisis urbano.',
 array['Sentinel','NDVI','Landsat'], '', 500, 3000, '1 semana', '4 semanas', 'Alta', 'general', null,
 'Consulta Geomática SIG', 20),

('geoprocesamiento', 'geomatica', 'Geoprocesamiento Python', 'Geomática / Software',
 'Scripts automatizados con GeoPandas, Shapely y GDAL para procesamiento masivo de datos geoespaciales, integración de APIs y ETL territorial.',
 array['Python','GeoPandas','GDAL'], '', 400, 2500, '1 semana', '6 semanas', 'Alta', 'software_tiempo', null,
 'Consulta Geomática SIG', 21),

('visor_mapa', 'software', 'Visor de Mapas Interactivo', 'Software / Geomática',
 'Aplicación web con mapa interactivo: capas WMS/WFS desde GeoServer, consultas alfanuméricas, filtros, exportación y diseño responsivo.',
 array['Leaflet','WMS','GeoServer'], '', 1500, 6000, '3 semanas', '10 semanas', 'Alta', 'software_modulos', null,
 'Consulta Software', 22),

('portal', 'software', 'Portal Institucional Web', 'Software',
 'Sitio web para municipios, cooperativas o empresas: diseño responsivo, CMS, sección de noticias, descargas, contacto y SEO técnico básico.',
 array['HTML5','Responsivo','CMS'], '', 800, 3500, '3 semanas', '8 semanas', 'Media', 'software_modulos', null,
 'Consulta Software', 23),

('sistema_catastral', 'software', 'Sistema de Gestión Catastral', 'Software',
 'Aplicación web para gestión de fichas prediales, consulta de padrones, emisión de certificaciones y control de trámites catastrales municipales.',
 array['CRUD','PostgreSQL','API'], '', 4000, 18000, '8 semanas', '24 semanas', 'Muy Alta', 'software_modulos', null,
 'Consulta Software', 24),

('api_geo', 'software', 'API Geoespacial REST', 'Software',
 'Desarrollo de endpoints REST para consulta de datos espaciales: búsqueda por coordenadas, intersección de polígonos, exportación GeoJSON/Shapefile.',
 array['REST','GeoJSON','Python'], '', 1200, 5000, '3 semanas', '10 semanas', 'Alta', 'software_tiempo', null,
 'Consulta Software', 25),

('automatizacion', 'software', 'Automatización de Procesos GIS', 'Software / Geomática',
 'Scripts Python/PyQGIS para automatizar flujos de trabajo: carga de datos, generación de reportes, validación topológica y publicación automática de capas.',
 array['PyQGIS','Automatización'], '', 600, 3000, '2 semanas', '8 semanas', 'Alta', 'software_tiempo', null,
 'Consulta Software', 26),

('dashboard', 'software', 'Dashboard Territorial', 'Software',
 'Panel de control web con indicadores territoriales: estadísticas, gráficos interactivos, mapa de distribución y filtros temporales para toma de decisiones.',
 array['Dashboard','Charts'], '', 1000, 4500, '3 semanas', '10 semanas', 'Media-Alta', 'software_modulos', null,
 'Consulta Software', 27)

on conflict (id) do nothing;