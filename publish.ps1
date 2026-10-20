$ErrorActionPreference = 'Stop'
& node (Join-Path $PSScriptRoot 'scripts/build-learning.cjs')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar os projetos por estudo.' }
$OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$owner = 'DominiqueCuruantaue'
$repo = 'profissional_profile'
function Invoke-Gh {
  param([string[]]$GhArgs)
  $result = & gh @GhArgs
  if ($LASTEXITCODE -ne 0) { throw "O comando gh falhou. Verifique a mensagem acima." }
  return $result
}
Invoke-Gh -GhArgs @('auth', 'status')
$login = Invoke-Gh -GhArgs @('api', 'user', '--jq', '.login')
if ($login -ne $owner) { throw "Autentique a conta $owner antes de publicar." }
Invoke-Gh -GhArgs @('repo', 'view', "$owner/$repo")
$files = @('assets/css/style.css', 'assets/css/experience.css', 'assets/js/main.js', 'assets/favicon.svg', 'assets/images/dominique-portrait.png', 'assets/certificates/compass-uol-participacao.pdf', '.nojekyll', 'index.html', 'publish.ps1')
$files += @('assets/certificates/moc-introducao-t-sql.pdf', 'assets/certificates/alura-imersao-ia.pdf', 'assets/sql/Scripts_Imersao.sql')
$files += @('data/learning.json', 'scripts/build-learning.cjs', 'scripts/test-learning.cjs', 'README.md', 'LEARNING.md')
foreach ($file in $files) {
  $path = Join-Path $PSScriptRoot $file
  $encoded = [Convert]::ToBase64String([IO.File]::ReadAllBytes($path))
  $body = @{ message = "Publicar $file"; content = $encoded; branch = 'main' }
  $ErrorActionPreference = 'Continue'
  $current = & gh api "repos/$owner/$repo/contents/${file}?ref=main" --jq '.sha' 2>$null
  $lookupExitCode = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ($lookupExitCode -eq 0) { $body.sha = $current }
  $payload = $body | ConvertTo-Json -Compress
  $payload | & gh api --method PUT "repos/$owner/$repo/contents/$file" --input - --silent
  if ($LASTEXITCODE -ne 0) { throw "Falha ao enviar $file. O repositório pode estar parcialmente publicado; reveja antes de repetir." }
}
$ErrorActionPreference = 'Continue'
& gh api "repos/$owner/$repo/pages" --silent 2>$null
$pagesExists = $LASTEXITCODE -eq 0
$ErrorActionPreference = 'Stop'
$pages = @{ source = @{ branch = 'main'; path = '/' } } | ConvertTo-Json -Compress
$pagesMethod = if ($pagesExists) { 'PUT' } else { 'POST' }
$pages | & gh api --method $pagesMethod "repos/$owner/$repo/pages" --input -
if ($LASTEXITCODE -ne 0) { throw 'Ficheiros enviados, mas Pages não foi ativado. Verifique Settings > Pages no repositório.' }
Write-Host 'Publicação solicitada. Endereço previsto: https://dominiquecuruantaue.github.io/profissional_profile/'
Write-Host 'Consulte Settings > Pages para confirmar a conclusão da publicação.'
