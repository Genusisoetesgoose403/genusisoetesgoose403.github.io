import { OFFENSIVE_CHART, TYPES } from '../data/types.js';

export const MULTIPLIER_ORDER = [4, 2, 1, 0.5, 0.25, 0];

export function getMultiplier(attackingType, defendingTypes) {
  if (!OFFENSIVE_CHART[attackingType]) throw new Error(`Unknown attacking type: ${attackingType}`);
  return defendingTypes.reduce((total, defendingType) => {
    if (!TYPES.includes(defendingType)) throw new Error(`Unknown defending type: ${defendingType}`);
    return total * (OFFENSIVE_CHART[attackingType][defendingType] ?? 1);
  }, 1);
}

export function getDefendingTypesAtMultiplier(attackingType, multiplier) {
  return TYPES.filter(defendingType => getMultiplier(attackingType, [defendingType]) === multiplier);
}

export function getOffensiveMatchups(attackingType) {
  return Object.fromEntries(
    [2, 1, 0.5, 0].map(multiplier => [
      multiplier,
      TYPES.filter(defendingType => getMultiplier(attackingType, [defendingType]) === multiplier)
    ])
  );
}

export function getDefensiveMatchups(defendingTypes) {
  if (!Array.isArray(defendingTypes) || defendingTypes.length < 1 || defendingTypes.length > 2) {
    throw new Error('Defending types must contain one or two types.');
  }

  return Object.fromEntries(
    MULTIPLIER_ORDER.map(multiplier => [
      multiplier,
      TYPES.filter(attackingType => getMultiplier(attackingType, defendingTypes) === multiplier)
    ])
  );
}

export function runEngineSelfTests() {
  const cases = [
    ['normal', ['ghost'], 0],
    ['fire', ['bug', 'steel'], 4],
    ['ice', ['fire', 'steel'], 0.25],
    ['electric', ['water', 'flying'], 4]
  ];
  return cases.map(([attack, defend, expected]) => {
    const actual = getMultiplier(attack, defend);
    return {
      name: `${attack} → ${defend.join('/')}: expected ${expected}×`,
      attack,
      defend,
      expected,
      actual,
      passed: actual === expected
    };
  });
}
