import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestExceptionPipe } from './utils/BadRequestExceptionPipe';
import { AppModule } from './app.module';
import { LogService } from './log/log.service';

declare const module: NodeModule & {
  hot: Record<string, (arg1?: () => Promise<void>) => void>
};

const {
  SERVER_PORT,
  SERVER_URL,
  NODE_ENV,
  CLIENT_URL,
} = process.env;

/**
 * initializes and runs the nestjs app
 */

async function bootstrap(): Promise<void> {
  const clientOrigin = new URL(CLIENT_URL).origin;
  const serverPathname = new URL(SERVER_URL).pathname;

  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  app.useLogger(app.get(LogService));
  app.enableCors({
    origin: clientOrigin,
    credentials: true,
  });

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
  app.setGlobalPrefix(serverPathname);
  await app.listen(SERVER_PORT);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

void bootstrap();
