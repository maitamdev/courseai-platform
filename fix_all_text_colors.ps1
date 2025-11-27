# PowerShell script to fix all text colors in components

Write-Host "🔧 Fixing all text colors to white/light gray..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src/components" -Filter "*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace dark text colors with light colors
    $content = $content -replace 'text-gray-600', 'text-gray-300'
    $content = $content -replace 'text-gray-700', 'text-gray-300'
    $content = $content -replace 'text-gray-800', 'text-white'
    $content = $content -replace 'text-gray-900', 'text-white'
    
    Set-Content -Path $file.FullName -Value $content
    
    Write-Host "✅ Fixed: $($file.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 All text colors fixed!" -ForegroundColor Green
Write-Host "Total files processed: $($files.Count)" -ForegroundColor Cyan
