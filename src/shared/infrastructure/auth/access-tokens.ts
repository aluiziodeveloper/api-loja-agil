import { JwtService } from '@nestjs/jwt';

/** Quem fez a requisição, segundo o token: o usuário e o perfil dele. */
export type Principal = {
  userId: string;
  role: string;
};

export type IssuedToken = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
};

type Claims = { sub: string; role: string };

type AccessTokensOptions = {
  secret: string;
  expiresInSeconds: number;
};

/**
 * Emite os tokens de acesso (JWT assinado com HS256). O token leva só o
 * necessário para autorizar: o id do usuário (`sub`) e o perfil (`role`).
 */
export class AccessTokens {
  private readonly jwt: JwtService;

  constructor(private readonly options: AccessTokensOptions) {
    this.jwt = new JwtService({
      secret: options.secret,
      signOptions: { algorithm: 'HS256', expiresIn: options.expiresInSeconds },
    });
  }

  async issue({ userId, role }: Principal): Promise<IssuedToken> {
    const accessToken = await this.jwt.signAsync({ sub: userId, role });
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresInSeconds: this.options.expiresInSeconds,
    };
  }

  /** Assinatura, formato e validade conferidos; qualquer falha é `null`, sem explicar por quê. */
  async verify(token: string): Promise<Principal | null> {
    try {
      const { sub, role } = await this.jwt.verifyAsync<Claims>(token);
      return { userId: sub, role };
    } catch {
      return null;
    }
  }
}
