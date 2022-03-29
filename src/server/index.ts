import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request } from 'express';
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
  PUBLIC_CLIENT_URL,
  HTTPS_ON,
  HTTPS_PRIVATE_KEY,
  HTTPS_PUBLIC_CERT,
} = process.env;

/**
 * initializes and runs the nestjs app
 */

async function bootstrap(): Promise<void> {
  const clientOrigin = new URL(CLIENT_URL).origin;
  const publicClientOrigin = new URL(PUBLIC_CLIENT_URL).origin;
  const serverPathname = new URL(SERVER_URL).pathname;

  const key = HTTPS_PRIVATE_KEY.replace(/\s+(?!RSA|PRIVATE|KEY)/g, '\n');
  const cert = HTTPS_PUBLIC_CERT.replace(/\s+(?!CERTIFICATE)/g, '\n');
  const httpsOptions = HTTPS_ON === 'true'
    ? {
      key,
      cert,
    }
    : null;

  const app = await NestFactory.create(AppModule, {
    logger: false,
    httpsOptions,
  });

  app.useLogger(app.get(LogService));
  app.enableCors((req: Request, callback) => {
    const requestOrigin = req.header('Origin');
    const allowedOrigins = [
      clientOrigin,
      publicClientOrigin,
    ];
    if (allowedOrigins.includes(requestOrigin)) {
      callback(null, {
        origin: true,
        credentials: true,
      });
    } else {
      callback(null, {
        origin: false,
      });
    }
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
