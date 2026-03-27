FROM node:20-alpine

WORKDIR /app
COPY app/package*.json ./
RUN npm install --production
COPY app ./

ENV PORT=3000
ENV DATA_DIR=/data
ENV DATA_FILE=contacts.json

# preparar permisos y usuario no root
RUN mkdir -p /data && chown -R node:node /data /app
USER node

EXPOSE 3000
CMD ["node", "server.js"]