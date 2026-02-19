#!/bin/bash

# SportZone Pro - Database Backup Script
# Este script crea backups automáticos de la base de datos Supabase

# Variables de configuración
SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF:-your-project-ref}"
SUPABASE_DB_PASSWORD="${SUPABASE_DB_PASSWORD:-your-db-password}"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sportzone_backup_$DATE.sql"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================="
echo "SportZone Pro - Database Backup"
echo "========================================="

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

# Verificar que pg_dump está instalado
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump no está instalado${NC}"
    echo "Instalar con: sudo apt-get install postgresql-client"
    exit 1
fi

# Ejecutar backup
echo "Iniciando backup..."
PGPASSWORD=$SUPABASE_DB_PASSWORD pg_dump \
  -h db.$SUPABASE_PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f $BACKUP_FILE

# Verificar si el backup fue exitoso
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup completado exitosamente${NC}"
    
    # Comprimir backup
    echo "Comprimiendo backup..."
    gzip $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backup comprimido: ${BACKUP_FILE}.gz${NC}"
        
        # Mostrar tamaño del archivo
        SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
        echo "Tamaño del backup: $SIZE"
    else
        echo -e "${RED}Error al comprimir backup${NC}"
        exit 1
    fi
else
    echo -e "${RED}Error al crear backup${NC}"
    exit 1
fi

# Eliminar backups antiguos (más de 30 días)
echo "Limpiando backups antiguos..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
echo -e "${GREEN}✓ Backups antiguos eliminados${NC}"

echo "========================================="
echo "Backup completado: ${BACKUP_FILE}.gz"
echo "========================================="
