FROM node:22-alpine

WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 5173

CMD ["yarn", "start", "--host", "0.0.0.0", "--port", "5173"]
