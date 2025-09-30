import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('NestJS TODO API')
    .setDescription('Node - TypeScript - NestJS - Fastify -- Demo API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
}
