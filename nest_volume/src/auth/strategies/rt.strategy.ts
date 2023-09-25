import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'rt-secret',
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: any) {
        const authorizationHeader = req.get('authorization');
        let refreshToken = '';

        if (authorizationHeader) {
            refreshToken = authorizationHeader.replace('Bearer', '').trim();
        } else {
            // Throw an HttpException
            throw new HttpException('Authorization header is missing', HttpStatus.UNAUTHORIZED);
        }
    }
}