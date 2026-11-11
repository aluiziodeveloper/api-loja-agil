import { JwtService } from '@nestjs/jwt';
import { AccessTokens } from './access-tokens.js';

const secret = 'a-secret-with-more-than-32-characters';
const ana = {
  userId: '0b6f1c1e-3c55-4a4f-9a8e-2d8f6f7b9c10',
  role: 'CUSTOMER',
};

describe('AccessTokens', () => {
  const tokens = new AccessTokens({ secret, expiresInSeconds: 900 });

  it('should issue a Bearer token with its lifetime', async () => {
    const issued = await tokens.issue(ana);

    expect(issued).toEqual({
      accessToken: expect.any(String),
      tokenType: 'Bearer',
      expiresInSeconds: 900,
    });
  });

  it('should sign who the user is and what they may do, for 15 minutes', async () => {
    const { accessToken } = await tokens.issue(ana);

    const claims = await new JwtService({ secret }).verifyAsync<{
      sub: string;
      role: string;
      iat: number;
      exp: number;
    }>(accessToken);

    expect(claims).toMatchObject({ sub: ana.userId, role: 'CUSTOMER' });
    expect(claims.exp - claims.iat).toBe(900);
  });

  it('should sign with HS256', async () => {
    const { accessToken } = await tokens.issue(ana);

    const header = new JwtService().decode<{ alg: string }>(accessToken, {
      complete: true,
    });

    expect(header).toMatchObject({ header: { alg: 'HS256' } });
  });

  it('should tell who the user is from a token it issued', async () => {
    const { accessToken } = await tokens.issue(ana);

    await expect(tokens.verify(accessToken)).resolves.toEqual(ana);
  });

  it.each([
    [
      'signed with another secret',
      () =>
        new AccessTokens({
          secret: 'another-secret-with-more-than-32-chars',
          expiresInSeconds: 900,
        })
          .issue(ana)
          .then(({ accessToken }) => accessToken),
    ],
    ['that is not a JWT', () => Promise.resolve('not-a-token')],
  ])('should not trust a token %s', async (_, tokenOf) => {
    await expect(tokens.verify(await tokenOf())).resolves.toBeNull();
  });
});
