import { derivePlantCondition } from './derive-plant-condition';

describe('derivePlantCondition', () => {
  it('returns good when all ideal (6 points)', () => {
    expect(derivePlantCondition(22, 65, 60)).toBe('good');
  });

  it('returns good at lower bound of total >= 5', () => {
    expect(derivePlantCondition(22, 65, 50)).toBe('good');
  });

  it('returns good_but_could_be_better for 3–4 points', () => {
    expect(derivePlantCondition(18, 50, 40)).toBe('good_but_could_be_better');
  });

  it('returns bad for 0–2 points when not critical', () => {
    expect(derivePlantCondition(15, 30, 30)).toBe('bad');
  });

  it('returns bad on critical low temperature', () => {
    expect(derivePlantCondition(9, 60, 60)).toBe('bad');
  });

  it('returns bad on critical high temperature', () => {
    expect(derivePlantCondition(36, 60, 60)).toBe('bad');
  });

  it('returns bad on critical low soil', () => {
    expect(derivePlantCondition(22, 24, 60)).toBe('bad');
  });

  it('returns bad on critical high soil', () => {
    expect(derivePlantCondition(22, 96, 60)).toBe('bad');
  });

  it('returns bad on critical high humidity', () => {
    expect(derivePlantCondition(22, 60, 96)).toBe('bad');
  });

  it('returns unknown when a value is not finite', () => {
    expect(derivePlantCondition(NaN, 60, 60)).toBe('unknown');
    expect(derivePlantCondition(22, NaN, 60)).toBe('unknown');
    expect(derivePlantCondition(22, 60, NaN)).toBe('unknown');
  });
});
