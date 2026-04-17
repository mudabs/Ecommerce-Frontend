FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=https://api.smartcart.munashemudabura.com
ARG VITE_BACK_END_API_PREFIX=/api
ARG VITE_FRONTEND_URL=https://smartcart.munashemudabura.com
ARG VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SfkfKAqMmDsNoNqCeF2v3IOspzqVvjLox3yIOd8YHk58d4IRNET7W53m3ZgyNiYxp7X8zn8dfdKhdUFNZk0E5Hk00Z1L2rcMO
ARG VITE_SKIP_BACKEND_IMAGES=false

COPY package*.json ./
RUN npm ci

COPY . .
RUN VITE_API_BASE_URL="$VITE_API_BASE_URL" \
	VITE_BACK_END_API_PREFIX="$VITE_BACK_END_API_PREFIX" \
	VITE_FRONTEND_URL="$VITE_FRONTEND_URL" \
	VITE_STRIPE_PUBLISHABLE_KEY="$VITE_STRIPE_PUBLISHABLE_KEY" \
	VITE_SKIP_BACKEND_IMAGES="$VITE_SKIP_BACKEND_IMAGES" \
	npm run build

FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]