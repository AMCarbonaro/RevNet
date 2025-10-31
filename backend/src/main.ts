import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'], // Reduce logging for production
    });
    
    // Enable CORS for Angular frontend
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:4200',
      'https://revnet3-frontend.onrender.com', // Render production frontend
      'http://localhost:55711', // Angular dev server port
      'http://localhost:4200',   // Fallback port
      'http://localhost:4201',   // Alternative Angular dev server port
      'http://localhost:4202'    // Current Angular dev server port
    ];

    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Silent-Request'],
      credentials: true,
    });

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Backend running on port ${port} (v${Date.now()})`);
  } catch (error) {
    console.error('❌ Failed to start backend:', error);
    process.exit(1);
  }
}
bootstrap();
