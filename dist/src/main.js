"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
async function bootstrap() {
    var _a, _b;
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const isProd = process.env.NODE_ENV === 'production';
    app.use((0, cookie_parser_1.default)());
    app.use((0, express_1.json)({ limit: '1mb' }));
    app.use((0, express_1.urlencoded)({ extended: true }));
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.enableCors({
        origin: [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://10.0.2.15:3000',
            'https://front-commerce-rust.vercel.app',
            /\.vercel\.app$/,
        ],
        credentials: true,
    });
    app.use('/payments/webhook', (0, express_1.raw)({ type: '*/*' }));
    await app.listen((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3001, '0.0.0.0');
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${(_b = process.env.PORT) !== null && _b !== void 0 ? _b : 3001}`);
}
bootstrap();
//# sourceMappingURL=main.js.map