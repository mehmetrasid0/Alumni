FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY server/package*.json ./
RUN npm install

# Copy server source code
COPY server/ ./

EXPOSE 5000

CMD ["npm", "run", "dev"]
