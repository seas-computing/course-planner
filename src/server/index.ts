import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestExceptionPipe } from './utils/BadRequestExceptionPipe';
import { AppModule } from './app.module';

declare const module: NodeModule & { hot: Record<string, Function> };

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
      .addTag('Course', 'Endpoints for course management operations')
      .addTag('Faculty', 'Endpoints for faculty management operations')
      .addTag('Faculty Schedule', 'Endpoints for faculty schedule operations')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs/api', app, document);
  }
  app.useGlobalPipes(new BadRequestExceptionPipe());
  await app.listen(SERVER_PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose((): Promise<void> => app.close());
  }
}

bootstrap();
