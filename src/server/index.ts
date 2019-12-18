import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestExceptionPipe } from '../common/utils/BadRequestExceptionPipe';
import { AppModule } from './app.module';

const { SERVER_PORT, NODE_ENV } = process.env;

/**
 * initializes and runs the nestjs app
 */

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  if (NODE_ENV === 'development') {
    const options = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('API documentation for the course planning API')
      .setBasePath('/api')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs/api', app, document);
  }
  app.useGlobalPipes(new BadRequestExceptionPipe());
  await app.listen(SERVER_PORT);
}

bootstrap();
