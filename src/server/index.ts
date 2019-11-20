import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const { SERVER_PORT } = process.env;

/**
 * initializes and runs the nestjs app
 */

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  if (process.env.NODE_ENV === 'development') {
    const options = new DocumentBuilder()
      .setTitle('DTO Documentation')
      .setDescription('Documentation that provides DTO descriptions and examples')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('dtodocs', app, document);
  }
  await app.listen(SERVER_PORT);
}

bootstrap();
