# Stage 1: Node.js
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Stage 2: Python
FROM python:3.11-slim-buster

WORKDIR /app

COPY --from=build /app .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["node", "app.js"]