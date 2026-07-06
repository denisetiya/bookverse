FROM node:22-alpine
WORKDIR /app
COPY dist ./dist
COPY node_modules ./node_modules
COPY package.json ./
EXPOSE 4326
ENV HOST=0.0.0.0
ENV PORT=4326
CMD ["node", "./dist/server/entry.mjs"]
