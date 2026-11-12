import { InvalidIdError } from './invalid-id.error.js';
import { UniqueId } from './unique-id.value-object.js';

const UUID_V7 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('UniqueId', () => {
  describe('create', () => {
    it('should generate a UUID v7', () => {
      const id = UniqueId.create();

      expect(id.toString()).toMatch(UUID_V7);
    });

    it('should generate a different value on each call', () => {
      const first = UniqueId.create();
      const second = UniqueId.create();

      expect(first.equals(second)).toBe(false);
    });

    it('should generate values that sort by creation time', async () => {
      const older = UniqueId.create();
      await new Promise((resolve) => setTimeout(resolve, 2));

      const newer = UniqueId.create();

      expect(older.toString() < newer.toString()).toBe(true);
    });
  });

  describe('from', () => {
    it('should restore an id from a valid UUID', () => {
      const original = UniqueId.create();

      const restored = UniqueId.from(original.toString());

      expect(restored.equals(original)).toBe(true);
    });

    it('should normalize the value to lowercase', () => {
      const id = UniqueId.from('0195F3A1-7C2B-7D4E-9F10-2A3B4C5D6E7F');

      expect(id.toString()).toBe('0195f3a1-7c2b-7d4e-9f10-2a3b4c5d6e7f');
    });

    it.each([
      '',
      '123',
      'not-a-uuid',
      '0195f3a1-7c2b-7d4e-9f10-2a3b4c5d6e7',
      'x0195f3a1-7c2b-7d4e-9f10-2a3b4c5d6e7f',
      '0195f3a1-7c2b-7d4e-9f10-2a3b4c5d6e7fx',
    ])('should reject the invalid value "%s"', (value) => {
      expect(() => UniqueId.from(value)).toThrow(InvalidIdError);
    });

    it('should report the INVALID_ID code', () => {
      expect(() => UniqueId.from('123')).toThrow(
        expect.objectContaining({
          code: 'INVALID_ID',
          message: 'Identificador inválido: "123".',
        }),
      );
    });
  });
});
