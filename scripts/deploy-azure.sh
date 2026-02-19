#!/bin/bash

# SportZone Pro - Azure Deployment Script
# Este script automatiza el deployment completo en Azure

# Variables de configuración
RESOURCE_GROUP="sportzone-rg"
LOCATION="eastus"
APP_SERVICE_PLAN="sportzone-plan"
WEBAPP_NAME="sportzone-api"
SKU="B1"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "SportZone Pro - Azure Deployment"
echo "========================================="

# Verificar que Azure CLI está instalado
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI no está instalado${NC}"
    echo "Instalar desde: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Login a Azure
echo -e "${BLUE}Iniciando sesión en Azure...${NC}"
az login

# Crear Resource Group
echo -e "${BLUE}Creando Resource Group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Resource Group creado${NC}"
else
    echo -e "${RED}✗ Error al crear Resource Group${NC}"
    exit 1
fi

# Crear App Service Plan
echo -e "${BLUE}Creando App Service Plan...${NC}"
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku $SKU \
    --is-linux
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ App Service Plan creado${NC}"
else
    echo -e "${RED}✗ Error al crear App Service Plan${NC}"
    exit 1
fi

# Crear Web App
echo -e "${BLUE}Creando Web App...${NC}"
az webapp create \
    --name $WEBAPP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --runtime "DOTNETCORE:8.0"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Web App creada${NC}"
else
    echo -e "${RED}✗ Error al crear Web App${NC}"
    exit 1
fi

# Habilitar HTTPS only
echo -e "${BLUE}Configurando HTTPS only...${NC}"
az webapp update \
    --name $WEBAPP_NAME \
    --resource-group $RESOURCE_GROUP \
    --https-only true
echo -e "${GREEN}✓ HTTPS only habilitado${NC}"

# Habilitar WebSockets para SignalR
echo -e "${BLUE}Habilitando WebSockets...${NC}"
az webapp config set \
    --name $WEBAPP_NAME \
    --resource-group $RESOURCE_GROUP \
    --web-sockets-enabled true
echo -e "${GREEN}✓ WebSockets habilitado${NC}"

# Crear Application Insights
echo -e "${BLUE}Creando Application Insights...${NC}"
az monitor app-insights component create \
    --app sportzone-insights \
    --location $LOCATION \
    --resource-group $RESOURCE_GROUP \
    --application-type web
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Application Insights creado${NC}"
    
    # Obtener Connection String
    INSIGHTS_KEY=$(az monitor app-insights component show \
        --app sportzone-insights \
        --resource-group $RESOURCE_GROUP \
        --query connectionString -o tsv)
    
    echo -e "${YELLOW}Application Insights Connection String:${NC}"
    echo $INSIGHTS_KEY
else
    echo -e "${RED}✗ Error al crear Application Insights${NC}"
fi

echo "========================================="
echo "Deployment completado"
echo "========================================="
echo -e "${GREEN}Web App URL: https://${WEBAPP_NAME}.azurewebsites.net${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Configurar variables de entorno en Azure Portal"
echo "2. Configurar GitHub Actions secrets"
echo "3. Hacer push a main para deployar código"
