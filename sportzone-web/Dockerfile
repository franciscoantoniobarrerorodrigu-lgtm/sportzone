# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build Angular app
RUN npm run build -- --configuration production

# Runtime stage with nginx
FROM nginx:alpine
COPY --from=build /app/dist/sportzone-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
