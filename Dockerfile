FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate


RUN npx nest build || (echo "Build failed" && exit 1)

EXPOSE 4000

EXPOSE 5555
CMD sh -c "yarn prisma db push --schema=./prisma/schema.prisma && yarn prisma db pull --schema=./prisma/schema.prisma && yarn prisma studio --hostname 0.0.0.0 & node dist/src/main.js"