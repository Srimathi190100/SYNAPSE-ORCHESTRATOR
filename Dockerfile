# Step 1: Build
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./

# 🔥 FIX for tailwind issue
RUN rm -rf node_modules package-lock.json && npm install

COPY . .
RUN npm run build

# Step 2: Serve
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
