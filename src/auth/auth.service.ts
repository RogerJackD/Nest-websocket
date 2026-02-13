import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const password = bcrypt.hashSync(registerDto.password, 10);
        registerDto.password = password;
        const user = await this.usersService.create(registerDto);
        const token = this.jwtService.sign({ id: user?.id, email: user?.email, role: user?.role })
        return {
            user,
            token
        };
    }

    async login( loginDto: LoginDto ) {
        console.log(loginDto)
        const user = await this.usersService.findOneByEmail(loginDto.email);
        if( !user ) throw new UnauthorizedException('invalid credentials');

        const isPasswordValid = await bcrypt.compare( loginDto.password, user.password);
        if( !isPasswordValid ) throw new UnauthorizedException('invalid credentials');

        const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role });

        return{
            user,
            token
        }
    }

}
