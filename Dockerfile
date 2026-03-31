FROM node:20-alpine AS build

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL
ARG BUILD_NUMBER=0

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV BUILD_NUMBER=$BUILD_NUMBER
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
