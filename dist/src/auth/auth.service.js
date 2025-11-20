"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const mailer_service_1 = require("../common/mailer/mailer.service");
const crypto_1 = require("crypto");
const email_validation_service_1 = require("../common/email-validation/email-validation.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, mailer, emailValidator) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.mailer = mailer;
        this.emailValidator = emailValidator;
    }
    async register(dto, res) {
        const isReal = await this.emailValidator.validate(dto.email);
        if (!isReal)
            throw new common_1.BadRequestException('Invalid or undeliverable email address.');
        const email = dto.email.toLowerCase();
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            if (!existingUser.isVerified) {
                await this.resendVerification(email);
                throw new common_1.BadRequestException('Account exists but not verified. Verification email resent.');
            }
            throw new common_1.BadRequestException('Email already registered.');
        }
        const existingPending = await this.prisma.pendingVerification.findUnique({
            where: { email },
        });
        if (existingPending) {
            const token = (0, crypto_1.randomBytes)(32).toString('hex');
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            await this.prisma.pendingVerification.update({
                where: { email },
                data: { token, expiresAt },
            });
            await this.mailer.sendVerificationEmail(email, token);
            return { message: 'Verification email resent. Please check your inbox.' };
        }
        const hashed = await bcrypt.hash(dto.password, 10);
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.pendingVerification.create({
            data: {
                email,
                name: dto.name,
                password: hashed,
                token,
                expiresAt,
            },
        });
        await this.mailer.sendVerificationEmail(email, token);
        return { message: 'Verification email sent. Please check your inbox.' };
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return user;
    }
    async login(user, res, opts) {
        const payload = { sub: user.id, email: user.email };
        const signOptions = {
            secret: process.env.JWT_SECRET || 'supersecret',
        };
        const token = this.jwt.sign(payload, signOptions);
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };
        res.cookie('auth_token', token, cookieOptions);
        const { password, verificationToken, verificationExpiry } = user, safeUser = __rest(user, ["password", "verificationToken", "verificationExpiry"]);
        return {
            message: 'Login successful',
            token,
            user: Object.assign(Object.assign({}, safeUser), { needsVerification: !user.isVerified }),
        };
    }
    async verifyEmail(token) {
        const pending = await this.prisma.pendingVerification.findUnique({
            where: { token },
        });
        if (!pending)
            throw new common_1.BadRequestException('Invalid or expired verification token.');
        if (pending.expiresAt < new Date()) {
            await this.prisma.pendingVerification.delete({
                where: { id: pending.id },
            });
            throw new common_1.BadRequestException('Verification token expired. Please re-register.');
        }
        const existing = await this.prisma.user.findUnique({
            where: { email: pending.email },
        });
        if (existing) {
            await this.prisma.pendingVerification.delete({
                where: { id: pending.id },
            });
            return { message: 'Email already verified. You may now log in.' };
        }
        await this.prisma.user.create({
            data: {
                email: pending.email,
                password: pending.password,
                name: pending.name,
                isVerified: true,
            },
        });
        await this.prisma.pendingVerification.delete({ where: { id: pending.id } });
        return { message: 'Email verified successfully. You may now log in.' };
    }
    async resendVerification(email) {
        const emailLower = email.toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { email: emailLower },
        });
        if (user && user.isVerified)
            throw new common_1.BadRequestException('Email already verified.');
        const pending = await this.prisma.pendingVerification.findUnique({
            where: { email: emailLower },
        });
        if (!pending)
            throw new common_1.BadRequestException('No pending verification found for this email.');
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.pendingVerification.update({
            where: { email: emailLower },
            data: { token, expiresAt },
        });
        await this.mailer.sendVerificationEmail(emailLower, token);
        return { message: 'Verification email resent successfully.' };
    }
    async logout(res) {
        res.clearCookie('auth_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        });
        return { message: 'Logged out successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mailer_service_1.MailerService,
        email_validation_service_1.EmailValidationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map