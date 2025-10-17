import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto, res: Response): Promise<{
        message: string;
        user: any;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        message: string;
        user: any;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    me(req: Request): Promise<{
        user: any;
    }>;
}
