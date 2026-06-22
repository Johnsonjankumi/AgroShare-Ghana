# Frontend Dockerfile (React)
FROM node:24-alpine as builder

WORKDIR /app

ARG REACT_APP_API_BASE=/api
ARG REACT_APP_ENVIRONMENT=production
ENV REACT_APP_API_BASE=$REACT_APP_API_BASE
ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage - serve with lightweight server
FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000

CMD ["npx", "serve", "-s", "build", "-l", "3000"]
