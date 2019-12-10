# Build the server
FROM node:12 as builder

WORKDIR /app
COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .
RUN yarn buildMappings
RUN npx tsc

# Copy only compiled files to our final container
FROM node:12

WORKDIR /app
COPY --from=builder /app/package.json .
COPY --from=builder /app/yarn.lock .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/swagger.json ./dist/swagger.json

ENTRYPOINT [ "node", "/app/dist" ]