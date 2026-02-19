#!/bin/bash

# SportZone Pro - Database Restore Script
# Este script restaura un backup de la base de datos Supabase

# Variables de configuración
SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF:-your-project-ref}"
SUPABASE_DB_PASSWORD="${SUPABASE_DB_PASSWORD:-your-db-password}"
BACKUP_FILE=$1

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "SportZone Pro - Database Restore"
echo "========================================="

# Verificar que se proporcionó un archivo de backup
if [ -z "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Debe proporcionar un archivo de backup${NC}"
    echo "Uso: ./restore.sh <archivo_backup.sql.gz>"
    exit 1
fi

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: El archivo $BACKUP_FILE no existe${NC}"
    exit 1
fi

# Verificar que pg_restore está instalado
if ! command -v pg_restore &> /dev/null; then
    echo -e "${RED}Error: pg_restore no está instalado${NC}"
    echo "Instalar con: sudo apt-get install postgresql-client"
    exit 1
fi

# Advertencia
echo -e "${YELLOW}⚠️  ADVERTENCIA: Esta operación sobrescribirá la base de datos actual${NC}"
echo -e "${YELLOW}⚠️  Asegúrese de tener un backup reciente antes de continuar${NC}"
read -p "¿Desea continuar? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Operación cancelada"
    exit 0
fi

# Descomprimir si es necesario
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "Descomprimiendo backup..."
    gunzip -k $BACKUP_FILE
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Ejecutar restore
echo "Iniciando restore..."
PGPASSWORD=$SUPABASE_DB_PASSWORD pg_restore \
  -h db.$SUPABASE_PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  -c \
  -v \
  $BACKUP_FILE

# Verificar si el restore fue exitoso
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Restore completado exitosamente${NC}"
else
    echo -e "${RED}Error al restaurar backup${NC}"
    exit 1
fi

echo "========================================="
echo "Restore completado"
echo "========================================="
