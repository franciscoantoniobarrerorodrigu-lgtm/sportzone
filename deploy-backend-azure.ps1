# ============================================================
# Script de Despliegue Automático - SportZone Backend a Azure
# ============================================================
# Este script despliega el backend .NET en Azure App Service
# ============================================================

param(
    [string]$ResourceGroup = "sportzone-rg",
    [string]$Location = "eastus",
    [string]$AppServicePlan = "sportzone-plan",
    [string]$WebAppName = "sportzone-api-$(Get-Random -Minimum 1000 -Maximum 9999)"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SPORTZONE PRO - Despliegue de Backend en Azure" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Azure CLI está instalado
Write-Host "[1/8] Verificando Azure CLI..." -ForegroundColor Yellow
try {
    $azVersion = az --version 2>&1 | Select-String "azure-cli"
    Write-Host "✓ Azure CLI instalado: $azVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Azure CLI no está instalado" -ForegroundColor Red
    Write-Host "Instala Azure CLI desde: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
    exit 1
}

# Verificar que está logueado en Azure
Write-Host ""
Write-Host "[2/8] Verificando sesión de Azure..." -ForegroundColor Yellow
$account = az account show 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ No has iniciado sesión en Azure" -ForegroundColor Red
    Write-Host "Ejecuta: az login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Sesión activa en Azure" -ForegroundColor Green

# Crear grupo de recursos
Write-Host ""
Write-Host "[3/8] Creando grupo de recursos..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Grupo de recursos creado: $ResourceGroup" -ForegroundColor Green
} else {
    Write-Host "✗ Error al crear grupo de recursos" -ForegroundColor Red
    exit 1
}

# Crear App Service Plan
Write-Host ""
Write-Host "[4/8] Creando App Service Plan..." -ForegroundColor Yellow
az appservice plan create `
    --name $AppServicePlan `
    --resource-group $ResourceGroup `
    --sku F1 `
    --is-linux `
    --output none

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ App Service Plan creado: $AppServicePlan (Free tier)" -ForegroundColor Green
} else {
    Write-Host "✗ Error al crear App Service Plan" -ForegroundColor Red
    exit 1
}

# Crear Web App
Write-Host ""
Write-Host "[5/8] Creando Web App..." -ForegroundColor Yellow
az webapp create `
    --name $WebAppName `
    --resource-group $ResourceGroup `
    --plan $AppServicePlan `
    --runtime "DOTNETCORE:8.0" `
    --output none

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Web App creada: $WebAppName" -ForegroundColor Green
} else {
    Write-Host "✗ Error al crear Web App" -ForegroundColor Red
    exit 1
}

# Configurar variables de entorno
Write-Host ""
Write-Host "[6/8] Configurando variables de entorno..." -ForegroundColor Yellow
az webapp config appsettings set `
    --name $WebAppName `
    --resource-group $ResourceGroup `
    --settings `
        SUPABASE_URL="https://husilgpjmqqsccmvbbka.supabase.co" `
        SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2lsZ3BqbXFxc2NjbXZiYmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Mzg5OTAsImV4cCI6MjA4NzAxNDk5MH0.hxaotT74-hFgE-nn_mFZQzGKLmqzDpzkUcApQ_XOuDU" `
    --output none

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Variables de entorno configuradas" -ForegroundColor Green
} else {
    Write-Host "✗ Error al configurar variables de entorno" -ForegroundColor Red
    exit 1
}

# Publicar la aplicación
Write-Host ""
Write-Host "[7/8] Publicando aplicación .NET..." -ForegroundColor Yellow
Push-Location SportZone.API

dotnet publish -c Release -o ./publish --nologo --verbosity quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Aplicación publicada" -ForegroundColor Green
} else {
    Write-Host "✗ Error al publicar aplicación" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Crear archivo ZIP
Write-Host "  Creando archivo ZIP..." -ForegroundColor Yellow
if (Test-Path "./deploy.zip") {
    Remove-Item "./deploy.zip" -Force
}
Compress-Archive -Path ./publish/* -DestinationPath ./deploy.zip -Force
Write-Host "✓ Archivo ZIP creado" -ForegroundColor Green

# Desplegar a Azure
Write-Host ""
Write-Host "[8/8] Desplegando a Azure..." -ForegroundColor Yellow
az webapp deployment source config-zip `
    --name $WebAppName `
    --resource-group $ResourceGroup `
    --src ./deploy.zip `
    --output none

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Aplicación desplegada exitosamente" -ForegroundColor Green
} else {
    Write-Host "✗ Error al desplegar aplicación" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Limpiar archivos temporales
Remove-Item -Recurse -Force ./publish
Remove-Item -Force ./deploy.zip

Pop-Location

# Obtener la URL del backend
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE COMPLETADO" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = az webapp show `
    --name $WebAppName `
    --resource-group $ResourceGroup `
    --query "defaultHostName" `
    --output tsv

Write-Host "✓ Backend desplegado en:" -ForegroundColor Green
Write-Host "  https://$backendUrl" -ForegroundColor White
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Actualiza el archivo: sportzone-web/src/environments/environment.prod.ts" -ForegroundColor White
Write-Host "   apiUrl: 'https://$backendUrl/api'" -ForegroundColor Cyan
Write-Host "   signalRUrl: 'https://$backendUrl/hubs'" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Redesplega el frontend en Vercel:" -ForegroundColor White
Write-Host "   cd sportzone-web" -ForegroundColor Cyan
Write-Host "   npm run build" -ForegroundColor Cyan
Write-Host "   vercel --prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Prueba el backend:" -ForegroundColor White
Write-Host "   https://$backendUrl/swagger" -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
