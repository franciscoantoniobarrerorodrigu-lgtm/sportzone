#!/bin/bash

# SportZone Pro - Database Migration Script
# Este script ejecuta todas las migraciones en orden

# Variables de configuración
SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF:-your-project-ref}"
SUPABASE_DB_PASSWORD="${SUPABASE_DB_PASSWORD:-your-db-password}"
DB_URL="postgresql://postgres:$SUPABASE_DB_PASSWORD@db.$SUPABASE_PROJECT_REF.supabase.co:5432/postgres"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================="
echo "SportZone Pro - Database Migrations"
echo "========================================="

# Verificar que psql está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql no está instalado${NC}"
    echo "Instalar con: sudo apt-get install postgresql-client"
    exit 1
fi

# Lista de scripts de migración en orden
MIGRATION_SCRIPTS=(
    "01_extensions.sql"
    "02_tables_core.sql"
    "03_tables_partidos.sql"
    "04_tables_admin.sql"
    "05_tables_notificaciones.sql"
    "06_tables_marketing.sql"
    "07_views.sql"
    "08_functions.sql"
    "09_triggers.sql"
    "10_rls.sql"
    "11_indexes.sql"
    "12_seed_data.sql"
    "13_auth_roles.sql"
)

# Contador de éxitos y fallos
SUCCESS_COUNT=0
FAIL_COUNT=0

# Ejecutar cada script
for script in "${MIGRATION_SCRIPTS[@]}"; do
    if [ -f "database/$script" ]; then
        echo -e "${BLUE}Ejecutando $script...${NC}"
        
        PGPASSWORD=$SUPABASE_DB_PASSWORD psql $DB_URL -f "database/$script" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ $script ejecutado exitosamente${NC}"
            ((SUCCESS_COUNT++))
        else
            echo -e "${RED}✗ Error al ejecutar $script${NC}"
            ((FAIL_COUNT++))
        fi
    else
        echo -e "${RED}✗ Archivo no encontrado: database/$script${NC}"
        ((FAIL_COUNT++))
    fi
done

echo "========================================="
echo "Migraciones completadas"
echo "Exitosas: $SUCCESS_COUNT"
echo "Fallidas: $FAIL_COUNT"
echo "========================================="

if [ $FAIL_COUNT -eq 0 ]; then
    exit 0
else
    exit 1
fi
