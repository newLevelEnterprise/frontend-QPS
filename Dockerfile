FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_BACKEND_URL=https://api-quant-production.up.railway.app
ARG VITE_HIDE_MOLD_FIELDS=false
ARG VITE_RESTRICTED_HOSTS=
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_HIDE_MOLD_FIELDS=$VITE_HIDE_MOLD_FIELDS \
    VITE_RESTRICTED_HOSTS=$VITE_RESTRICTED_HOSTS

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && sed -i 's/\r$//' /docker-entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
