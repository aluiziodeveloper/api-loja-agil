import { z } from 'zod';
import { RequestValidationError } from './request-validation.error.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(
    z.object({
      name: z.string(),
      address: z.object({ zipCode: z.string() }),
    }),
  );

  it('should return the parsed value, without unknown fields', () => {
    const value = pipe.transform({
      name: 'Ana',
      address: { zipCode: '01001-000' },
      role: 'OPERATOR',
    });

    expect(value).toEqual({ name: 'Ana', address: { zipCode: '01001-000' } });
  });

  it('should reject an invalid value, listing every problem', () => {
    const validate = () => pipe.transform({ address: {} });

    expect(validate).toThrow(RequestValidationError);
    expect(validate).toThrow(
      expect.objectContaining({
        details: [
          { path: 'name', message: expect.stringContaining('texto') },
          { path: 'address.zipCode', message: expect.any(String) },
        ],
      }),
    );
  });
});
