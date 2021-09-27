FROM node:12.0-slim
COPY . .
RUN npm install
CMD [ "node", "gateway_service.js" ]

# docker build -t gateway .
# docker run --env-file ./.env -p 80:80 gateway