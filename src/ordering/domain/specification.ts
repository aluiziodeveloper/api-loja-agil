/** Specification: uma regra de negócio que responde sim ou não a um candidato. */
export interface Specification<Candidate> {
  isSatisfiedBy(candidate: Candidate): boolean;
}

/** Combina regras: o candidato precisa satisfazer todas. */
export function allOf<Candidate>(
  ...rules: Specification<Candidate>[]
): Specification<Candidate> {
  return {
    isSatisfiedBy: (candidate) =>
      rules.every((rule) => rule.isSatisfiedBy(candidate)),
  };
}
