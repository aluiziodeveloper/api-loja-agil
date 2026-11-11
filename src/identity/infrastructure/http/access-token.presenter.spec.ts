import { presentAccessToken } from './access-token.presenter.js';

describe('presentAccessToken', () => {
  it('should answer the token, its type and its lifetime', () => {
    const token = {
      accessToken: 'eyJhbGciOiJIUzI1NiJ9.e30.c2ln',
      tokenType: 'Bearer' as const,
      expiresInSeconds: 3600,
    };

    expect(presentAccessToken(token)).toEqual(token);
  });
});
