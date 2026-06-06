# Generador de paginas internas LexGeoCat
$pagesDir = Join-Path $PSScriptRoot "pages"
$topics = @(
  @{ id="derecho"; title="Derecho"; icon="fa-scale-balanced"; label="Derecho"; desc="Legislación boliviana, derecho civil y normativa territorial."; intro="El derecho constituye la base normativa de toda gestión territorial. En LexGeoCat abordamos la legislación boliviana aplicada al territorio: derecho civil, registral, notarial y procedimientos vinculados al saneamiento predial y la seguridad jurídica."; h2="Áreas de enfoque"; features=@("Derecho civil y procesal","Usucapión y derecho registral","Normativa catastral boliviana","Asesoría en trámites notariales") },
  @{ id="catastro"; title="Catastro Multifinalitario"; icon="fa-map"; label="Catastro"; desc="Registro predial, valuación fiscal y sistemas de información territorial."; intro="El catastro multifinalitario urbano es la herramienta técnica-jurídica que articula la información predial con la planificación territorial y la recaudación municipal en Bolivia."; h2="Servicios técnicos"; features=@("Levantamientos topográficos","Fichas y planos catastrales","Geocodificación predial","Actualización de bases catastrales") },
  @{ id="gis"; title="SIG y Geomática"; icon="fa-layer-group"; label="GIS"; desc="Sistemas de información geográfica, cartografía digital y análisis espacial."; intro="La geomática y los SIG permiten visualizar, analizar y gestionar el territorio con precisión. Trabajamos con QGIS, PostGIS y herramientas de código abierto adaptadas al contexto boliviano."; h2="Capacidades"; features=@("Cartografía digital","Bases de datos espaciales PostGIS","Análisis espacial avanzado","Teledetección aplicada") },
  @{ id="ordenamiento"; title="Ordenamiento Territorial"; icon="fa-compass-drafting"; label="Ordenamiento"; desc="Planificación urbana, zonificación y gestión territorial municipal."; intro="El ordenamiento territorial orienta el uso del suelo y la expansión urbana conforme a la normativa boliviana y los instrumentos de planificación municipal."; h2="Temas clave"; features=@("Planificación urbana","Zonificación y normativa de suelo","Gestión territorial municipal","Instrumentos de planificación") },
  @{ id="tecnologia"; title="Tecnología e Innovación"; icon="fa-microchip"; label="Tecnología"; desc="Software GIS, automatización y soluciones para el sector público."; intro="La innovación tecnológica moderniza la gestión pública territorial. Desarrollamos soluciones con Python, PostGIS, AutoLISP y aplicaciones web para municipios e instituciones."; h2="Soluciones"; features=@("Automatización GIS","Aplicaciones web territoriales","Modernización del sector público","Integración de geodatos") }
)

function Get-PageShell($pageId, $title, $desc, $body, $extraAttrs) {
  return @"
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$title — LexGeoCat</title>
  <meta name="description" content="$desc">
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
  <link href="../assets/css/main.css" rel="stylesheet">
</head>
<body data-page="$pageId" data-depth="1" $extraAttrs>
<div id="site-header"></div>
$body
<div id="site-footer"></div>
<script src="../assets/js/config.js"></script>
<script src="../assets/js/layout.js"></script>
<script src="../assets/js/main.js"></script>
</body>
</html>
"@
}

foreach ($t in $topics) {
  $features = ($t.features | ForEach-Object { "<div class=`"feature-item reveal`"><i class=`"fa-solid $($t.icon)`"></i><h3>$_</h3><p>Consultoría y recursos especializados en el contexto boliviano.</p></div>" }) -join "`n"
  $body = @"
<section class="page-hero">
  <div class="c">
    <div class="page-hero-icon"><i class="fa-solid $($t.icon)"></i></div>
    <span class="sl">Temática</span>
    <h1 class="st">$($t.title)</h1>
    <p class="sd">$($t.desc)</p>
  </div>
</section>
<section class="page-content">
  <div class="c">
    <div class="at-body">
      <p>$($t.intro)</p>
      <h2>$($t.h2)</h2>
      <p>Explora artículos, guías y materiales publicados en el blog de LexGeoCat sobre esta disciplina.</p>
      <div class="feature-grid">$features</div>
    </div>
    <div class="sh center" style="margin-top:48px">
      <span class="sl">Blog</span>
      <h2 class="st">Artículos recientes</h2>
      <p class="sd">Publicaciones del blog alojado en Blogger.</p>
    </div>
    <div class="g g3" id="topic-posts-grid"></div>
    <div class="blog-cta">
      <h3>¿Quieres profundizar en $($t.title)?</h3>
      <p>Visita el blog para tutoriales, análisis normativos y recursos descargables.</p>
      <a class="btn btn-gold" href="https://lexgeocat.blogspot.com/search/label/$([uri]::EscapeDataString($t.label))" target="_blank" rel="noopener"><i class="fa-solid fa-newspaper"></i> Ver más en el blog</a>
    </div>
  </div>
</section>
"@
  $html = Get-PageShell $t.id $t.title $t.desc $body "data-feed-label=`"$($t.label)`""
  Set-Content (Join-Path $pagesDir "$($t.id).html") $html -Encoding UTF8
}

Write-Host "Topic pages OK"
