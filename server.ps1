# Kleiner lokaler Webserver fuer die Vorschau, ohne Python oder Node.
# Start:  powershell -ExecutionPolicy Bypass -File server.ps1
# Dann im Browser: http://localhost:5500  (Beenden mit Strg+C)

param([int]$Port = 5500)

$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Ladenfenster laeuft auf http://localhost:$Port  (Strg+C zum Beenden)"

$types = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".ico"  = "image/x-icon"
  ".json" = "application/json; charset=utf-8"
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $response = $context.Response
    try {
      $path = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath).TrimStart("/")
      if ($path -eq "" -or $path.EndsWith("/")) { $path = $path + "index.html" }
      $file = [IO.Path]::GetFullPath((Join-Path $root $path))

      if ($file.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $file -PathType Leaf)) {
        [byte[]]$bytes = [IO.File]::ReadAllBytes($file)
        $ext = [IO.Path]::GetExtension($file).ToLower()
        $response.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
        $response.Headers.Add("Cache-Control", "no-store")
        $status = 200
      } else {
        $response.StatusCode = 404
        [byte[]]$bytes = [Text.Encoding]::UTF8.GetBytes("404 - Seite nicht gefunden")
        $response.ContentType = "text/plain; charset=utf-8"
        $status = 404
      }
      if ($context.Request.HttpMethod -ne "HEAD") {
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      }
      Write-Host "$status  /$path"
    } catch {
      Write-Host "Fehler bei /$path : $($_.Exception.Message)"
    } finally {
      $response.Close()
    }
  }
} finally {
  $listener.Stop()
}
