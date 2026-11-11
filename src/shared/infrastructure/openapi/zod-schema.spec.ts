import { z } from 'zod';
import { requestSchema, responseSchema } from './zod-schema.js';

describe('requestSchema', () => {
  it('should describe what the client sends, before the conversions', () => {
    const body = z.object({
      page: z.coerce.number().optional(),
      expiresAt: z.iso.datetime().transform((value) => new Date(value)),
    });

    expect(requestSchema(body)).toEqual({
      type: 'object',
      properties: {
        page: { type: 'number' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
      required: ['expiresAt'],
    });
  });
});

describe('responseSchema', () => {
  it('should allow only the fields of the presenter', () => {
    const response = z.object({
      id: z.uuid(),
      couponCode: z.string().nullable(),
    });

    expect(responseSchema(response)).toEqual({
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        couponCode: { type: 'string', nullable: true },
      },
      required: ['id', 'couponCode'],
      additionalProperties: false,
    });
  });

  it('should leave out the safe integer limits that every integer has', () => {
    expect(responseSchema(z.number().int())).toEqual({ type: 'integer' });
  });

  it('should keep a limit that the schema chose', () => {
    expect(responseSchema(z.number().int().min(1))).toEqual({
      type: 'integer',
      minimum: 1,
    });
  });
});
