import { allOf, type Specification } from './specification.js';

const isEven: Specification<number> = {
  isSatisfiedBy: (candidate) => candidate % 2 === 0,
};
const isPositive: Specification<number> = {
  isSatisfiedBy: (candidate) => candidate > 0,
};

describe('allOf', () => {
  it.each([
    { candidate: 4, satisfied: true },
    { candidate: 3, satisfied: false },
    { candidate: -2, satisfied: false },
  ])('should require every rule ($candidate)', ({ candidate, satisfied }) => {
    expect(allOf(isEven, isPositive).isSatisfiedBy(candidate)).toBe(satisfied);
  });

  it('should be satisfied when there are no rules', () => {
    expect(allOf<number>().isSatisfiedBy(7)).toBe(true);
  });
});
