# Build stage
FROM node:20-slim as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the app
RUN npm run build

# Serve stage
FROM nginx:stable-alpine

# Copy the build output to nginx's serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if we want to handle client-side routing
# For simplicity, we can add a basic try_files in a custom config
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
