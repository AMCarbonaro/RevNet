import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // Reduce logging for production
  });
  
  // Enable CORS for Angular frontend
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:4200',
      'http://localhost:55711', // Angular dev server port
      'http://localhost:4200',   // Fallback port
      'http://localhost:4201',   // Alternative Angular dev server port
      'http://localhost:4202'    // Current Angular dev server port
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on port ${port} (v${Date.now()})`);
}
bootstrap();
