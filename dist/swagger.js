"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
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
    // Используем абсолютные пути от корня проекта
    apis: [
        path_1.default.join(process.cwd(), 'backend/src/routes/*.ts'),
        path_1.default.join(process.cwd(), 'backend/src/controllers/*.ts'),
        path_1.default.join(process.cwd(), 'backend/src/models/*.ts'),
        path_1.default.join(process.cwd(), 'backend/src/server.ts'),
    ],
};
const specs = (0, swagger_jsdoc_1.default)(options);
console.log('📄 Пути поиска:', options.apis);
console.log('📄 Найдено эндпоинтов:', specs.paths ? Object.keys(specs.paths).length : 0);
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Lunar Glow API Docs',
    }));
    console.log('📄 Swagger документация: http://localhost:5000/api-docs');
};
exports.default = setupSwagger;
