# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["SportZone.API.csproj", "./"]
RUN dotnet restore "SportZone.API.csproj"

# Copy source code and build
COPY . .
RUN dotnet build "SportZone.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "SportZone.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Copy published files
COPY --from=publish /app/publish .

# Copy Firebase credentials (if using FCM)
# COPY firebase-adminsdk.json /app/firebase-adminsdk.json

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["dotnet", "SportZone.API.dll"]
