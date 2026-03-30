import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lunar Glow API Documentation',
      version: '1.0.0',
      description: 'Документация для интернет-магазина Lunar Glow',
      contact: {
        name: 'Команда L_Shop',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Сервер разработки',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
  },

  apis: [
    path.join(process.cwd(), 'src/routes/*.ts'),
    path.join(process.cwd(), 'src/controllers/*.ts'),
    path.join(process.cwd(), 'src/models/*.ts'),
    path.join(process.cwd(), 'src/server.ts'),
  ],
};

const specs = swaggerJsdoc(options) as any;
console.log('📄 Пути поиска:', options.apis);
console.log('📄 Найдено эндпоинтов:', specs.paths ? Object.keys(specs.paths).length : 0);

const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Lunar Glow API Docs',
  }));
  
  console.log('📄 Swagger документация: http://localhost:5000/api-docs');
};

export default setupSwagger;