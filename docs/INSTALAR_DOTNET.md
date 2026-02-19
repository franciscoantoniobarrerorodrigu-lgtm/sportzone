# Guía de Instalación de .NET 8 SDK

## ⚠️ Requisito Previo

Para ejecutar el backend de SportZone Pro, necesitas instalar .NET 8 SDK.

---

## 🪟 Instalación en Windows

### Opción 1: Instalador Oficial (Recomendado)

1. **Descarga el instalador:**
   - Ve a: https://dotnet.microsoft.com/download/dotnet/8.0
   - Haz clic en "Download .NET 8.0 SDK (v8.0.x)" para Windows

2. **Ejecuta el instalador:**
   - Abre el archivo descargado (.exe)
   - Sigue las instrucciones del asistente
   - Acepta los términos y condiciones
   - Haz clic en "Install"

3. **Verifica la instalación:**
   - Abre una nueva terminal (CMD o PowerShell)
   - Ejecuta:
   ```bash
   dotnet --version
   ```
   - Deberías ver algo como: `8.0.x`

### Opción 2: Winget (Windows Package Manager)

Si tienes Winget instalado:

```bash
winget install Microsoft.DotNet.SDK.8
```

### Opción 3: Chocolatey

Si tienes Chocolatey instalado:

```bash
choco install dotnet-8.0-sdk
```

---

## 🐧 Instalación en Linux (Ubuntu/Debian)

```bash
# Agregar repositorio de Microsoft
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# Instalar .NET 8 SDK
sudo apt-get update
sudo apt-get install -y dotnet-sdk-8.0

# Verificar instalación
dotnet --version
```

---

## 🍎 Instalación en macOS

### Opción 1: Instalador Oficial

1. Descarga el instalador desde: https://dotnet.microsoft.com/download/dotnet/8.0
2. Abre el archivo .pkg descargado
3. Sigue las instrucciones del instalador

### Opción 2: Homebrew

```bash
brew install dotnet@8
```

---

## ✅ Verificar Instalación

Después de instalar, abre una **nueva terminal** y ejecuta:

```bash
dotnet --version
```

Deberías ver algo como:
```
8.0.101
```

También puedes verificar que todo esté correcto con:

```bash
dotnet --info
```

---

## 🚀 Ejecutar el Proyecto SportZone Pro

Una vez instalado .NET 8 SDK:

1. **Navega a la carpeta del proyecto:**
   ```bash
   cd SportZone.API
   ```

2. **Restaura los paquetes NuGet:**
   ```bash
   dotnet restore
   ```

3. **Compila el proyecto:**
   ```bash
   dotnet build
   ```

4. **Ejecuta el proyecto:**
   ```bash
   dotnet run
   ```

5. **Abre Swagger UI:**
   - Ve a: https://localhost:5001/swagger

---

## 🔧 Troubleshooting

### Error: "No .NET SDKs were found"

**Solución:** Cierra y abre una nueva terminal después de instalar .NET 8.

### Error: "The SDK 'Microsoft.NET.Sdk.Web' specified could not be found"

**Solución:** Asegúrate de instalar el SDK completo, no solo el runtime.

### Error: "dotnet: command not found"

**Solución:** 
1. Verifica que la instalación se completó correctamente
2. Reinicia tu terminal
3. En Windows, verifica que la variable de entorno PATH incluya la ruta de .NET

---

## 📚 Recursos Adicionales

- [Documentación oficial de .NET 8](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8)
- [Guía de instalación oficial](https://learn.microsoft.com/en-us/dotnet/core/install/)
- [Tutorial de .NET para principiantes](https://dotnet.microsoft.com/learn/dotnet/hello-world-tutorial/intro)

---

## 🎯 Próximos Pasos

Después de instalar .NET 8:

1. ✅ Instalar .NET 8 SDK
2. ⏳ Configurar credenciales de Supabase en `appsettings.Development.json`
3. ⏳ Ejecutar `dotnet restore`
4. ⏳ Ejecutar `dotnet build`
5. ⏳ Ejecutar `dotnet run`
6. ⏳ Probar en Swagger: https://localhost:5001/swagger

---

**Nota:** Si ya tienes .NET instalado pero es una versión anterior (como .NET 6 o 7), puedes tener múltiples versiones instaladas sin problemas. .NET 8 se instalará junto a las versiones anteriores.
