import { DomainError } from './domain-error.js';

class SampleError extends DomainError {
  readonly code = 'SAMPLE_ERROR';
}

describe('DomainError', () => {
  it('should keep the message', () => {
    const error = new SampleError('Algo deu errado');

    expect(error.message).toBe('Algo deu errado');
  });

  it('should expose a stable code defined by the subclass', () => {
    const error = new SampleError('Algo deu errado');

    expect(error.code).toBe('SAMPLE_ERROR');
  });

  it('should use the subclass name as the error name', () => {
    const error = new SampleError('Algo deu errado');

    expect(error.name).toBe('SampleError');
  });

  it('should be an Error and a DomainError', () => {
    const error = new SampleError('Algo deu errado');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
  });
});
