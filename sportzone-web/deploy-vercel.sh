#!/bin/bash

# Script de deployment a Vercel para SportZone Pro Frontend
# Uso: ./deploy-vercel.sh [preview|production]

set -e

MODE=${1:-preview}

echo "🚀 Iniciando deployment a Vercel..."
echo "📦 Modo: $MODE"

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado"
    echo "📥 Instalando Vercel CLI..."
    npm i -g vercel
fi

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf dist .angular/cache

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Build local para verificar
echo "🔨 Ejecutando build local..."
npm run build

# Deploy a Vercel
if [ "$MODE" = "production" ]; then
    echo "🌍 Deploying a PRODUCCIÓN..."
    vercel --prod
else
    echo "👀 Deploying a PREVIEW..."
    vercel
fi

echo "✅ Deployment completado!"
echo "🔗 Verifica tu deployment en: https://vercel.com/dashboard"
