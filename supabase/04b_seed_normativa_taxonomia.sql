-- ───────────────────────────────────────────────
-- Grupos (numerales romanos I..VIII)
-- ───────────────────────────────────────────────
insert into
    normativa_grupos (id, numeral, nombre, orden)
values (
        'normas_fundamentales',
        'I',
        'Normas Fundamentales del Estado',
        1
    ),
    (
        'legislacion_nacional',
        'II',
        'Legislación Nacional',
        2
    ),
    (
        'reglamentaria_nacional',
        'III',
        'Normativa Reglamentaria Nacional',
        3
    ),
    (
        'autonomica_departamental',
        'IV',
        'Legislación Autonómica Departamental',
        4
    ),
    (
        'autonomica_municipal',
        'V',
        'Legislación Autonómica Municipal',
        5
    ),
    (
        'jurisprudencia',
        'VI',
        'Jurisprudencia',
        6
    ),
    (
        'fuentes_auxiliares',
        'VII',
        'Fuentes Auxiliares del Derecho',
        7
    ),
    (
        'documentos_gestion',
        'VIII',
        'Documentos de Gestión y Apoyo',
        8
    ) on conflict (id) do
update
set
    numeral = excluded.numeral,
    nombre = excluded.nombre,
    orden = excluded.orden;

-- ───────────────────────────────────────────────
-- Tipos (los 20 puntos de la lista, en orden)
-- ───────────────────────────────────────────────

insert into
    normativa_tipos (
        id,
        grupo_id,
        numero,
        nombre,
        orden
    )
values
    -- I. Normas Fundamentales del Estado
    (
        'cpe',
        'normas_fundamentales',
        1,
        'Constitución Política del Estado (CPE)',
        1
    ),
    (
        'bloque_constitucionalidad',
        'normas_fundamentales',
        2,
        'Bloque de Constitucionalidad',
        2
    ),
    -- II. Legislación Nacional
    (
        'codigos_nacionales',
        'legislacion_nacional',
        3,
        'Códigos Nacionales',
        3
    ),
    (
        'leyes_nacionales',
        'legislacion_nacional',
        4,
        'Leyes Nacionales',
        4
    ),
    -- III. Normativa Reglamentaria Nacional
    (
        'decretos_supremos',
        'reglamentaria_nacional',
        5,
        'Decretos Supremos',
        5
    ),
    -- IV. Legislación Autonómica Departamental
    (
        'estatutos_departamentales',
        'autonomica_departamental',
        6,
        'Estatutos Autonómicos Departamentales',
        6
    ),
    (
        'leyes_departamentales',
        'autonomica_departamental',
        7,
        'Leyes Departamentales',
        7
    ),
    (
        'decretos_departamentales',
        'autonomica_departamental',
        8,
        'Decretos Departamentales',
        8
    ),
    -- V. Legislación Autonómica Municipal
    (
        'cartas_organicas_municipales',
        'autonomica_municipal',
        9,
        'Cartas Orgánicas Municipales',
        9
    ),
    (
        'leyes_municipales',
        'autonomica_municipal',
        10,
        'Leyes Municipales',
        10
    ),
    (
        'decretos_municipales',
        'autonomica_municipal',
        11,
        'Decretos Municipales',
        11
    ),
    -- VI. Jurisprudencia
    (
        'jurisprudencia_constitucional',
        'jurisprudencia',
        12,
        'Jurisprudencia Constitucional',
        12
    ),
    (
        'jurisprudencia_judicial',
        'jurisprudencia',
        13,
        'Jurisprudencia Judicial',
        13
    ),
    -- VII. Fuentes Auxiliares del Derecho
    (
        'doctrina_juridica',
        'fuentes_auxiliares',
        14,
        'Doctrina Jurídica',
        14
    ),
    (
        'principios_generales',
        'fuentes_auxiliares',
        15,
        'Principios Generales del Derecho',
        15
    ),
    (
        'derecho_comparado',
        'fuentes_auxiliares',
        16,
        'Derecho Comparado',
        16
    ),
    (
        'opiniones_informes',
        'fuentes_auxiliares',
        17,
        'Opiniones e Informes Jurídicos',
        17
    ),
    -- VIII. Documentos de Gestión y Apoyo
    (
        'modelos_formularios',
        'documentos_gestion',
        18,
        'Modelos y Formularios',
        18
    ),
    (
        'compendios_tematicos',
        'documentos_gestion',
        19,
        'Compendios Temáticos',
        19
    ),
    (
        'indice_normativo_general',
        'documentos_gestion',
        20,
        'Índice Normativo General',
        20
    ) on conflict (id) do
update
set
    grupo_id = excluded.grupo_id,
    numero = excluded.numero,
    nombre = excluded.nombre,
    orden = excluded.orden;