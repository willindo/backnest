"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const public_decorator_1 = require("./decorators/public.decorator");
const auth_service_1 = require("./auth.service");
const mailer_service_1 = require("../common/mailer/mailer.service");
const crypto_1 = require("crypto");
let AuthController = class AuthController {
    constructor(auth, prisma, mailerService) {
        this.auth = auth;
        this.prisma = prisma;
        this.mailerService = mailerService;
    }
    async verifyEmail(token) {
        if (!token)
            throw new common_1.BadRequestException('Token missing');
        const user = await this.prisma.user.findUnique({
            where: { verificationToken: token },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid or expired token');
        if (user.verificationExpiry && user.verificationExpiry < new Date()) {
            throw new common_1.BadRequestException('Token expired');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationExpiry: null,
            },
        });
        return { message: 'Email verified successfully. You may now log in.' };
    }
    async resendVerification(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.BadRequestException('No account found with that email');
        if (user.isVerified)
            throw new common_1.BadRequestException('Email is already verified');
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiry = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { verificationToken: token, verificationExpiry: expiry },
        });
        await this.mailerService.sendVerificationEmail(user.email, token);
        return { message: 'Verification email resent. Please check your inbox.' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('verify-email'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        prisma_service_1.PrismaService,
        mailer_service_1.MailerService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map