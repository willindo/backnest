"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("../prisma/prisma.module");
const orders_module_1 = require("./orders/orders.module");
const cart_module_1 = require("./cart/cart.module");
const product_module_1 = require("./products/product.module");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const checkout_module_1 = require("./checkout/checkout.module");
const payments_module_1 = require("./payments/payments.module");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const jwt_guard_1 = require("./auth/guards/jwt.guard");
const roles_guard_1 = require("./auth/guards/roles.guard");
const jwt_1 = require("@nestjs/jwt");
const filters_module_1 = require("./filters/filters.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
            }),
            jwt_1.JwtModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            product_module_1.ProductsModule,
            cart_module_1.CartModule,
            checkout_module_1.CheckoutModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            filters_module_1.FiltersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map