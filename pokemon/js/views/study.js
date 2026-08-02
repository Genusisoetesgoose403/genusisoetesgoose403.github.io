import { TYPES, TYPE_META } from '../data/types.js';
import { state } from '../state.js';
import { getOffensiveMatchups, getDefensiveMatchups } from '../engine/effectiveness.js';

const MULTIPLIER_LABELS = {
  4: '4× — extremely effective',
  2: '2× — super effective',
  1: '1× — neutral',
  0.5: '½× — resisted',
  0.25: '¼× — strongly resisted',
  0: '0× — no effect'
};

function el(tag, options = {}) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text) node.textContent = options.text;
  return node;
}

function createTypeSelect(value, includeNone = false) {
  const select = el('select');
  if (includeNone) {
    const none = document.createElement('option');
    none.value = '';
    none.textContent = 'None';
    select.append(none);
  }

  for (const type of TYPES) {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = TYPE_META[type].label;
    option.selected = type === value;
    select.append(option);
  }
  return select;
}

function createTypeChip(type) {
  return el('span', { className: 'type-chip', text: TYPE_META[type].label });
}

function renderGroup(multiplier, types) {
  if (!types.length) return null;
  const group = el('section', { className: 'matchup-group' });
  group.append(el('h3', { text: MULTIPLIER_LABELS[multiplier] }));
  const chips = el('div', { className: 'type-chip-list' });
  for (const type of types) chips.append(createTypeChip(type));
  group.append(chips);
  return group;
}

function renderResults(page) {
  const results = el('div', { className: 'study-results' });

  if (state.study.mode === 'offense') {
    const groups = getOffensiveMatchups(state.study.primaryType);
    results.append(el('p', {
      className: 'muted',
      text: `${TYPE_META[state.study.primaryType].label}-type attacks against each defending type.`
    }));
    for (const multiplier of [2, 1, 0.5, 0]) {
      const group = renderGroup(multiplier, groups[multiplier]);
      if (group) results.append(group);
    }
  } else {
    const defendingTypes = [state.study.primaryType];
    if (state.study.secondaryType) defendingTypes.push(state.study.secondaryType);
    const groups = getDefensiveMatchups(defendingTypes);
    const name = defendingTypes.map(type => TYPE_META[type].label).join('/');
    results.append(el('p', {
      className: 'muted',
      text: `Damage taken by a ${name}-type defender from each attacking type.`
    }));
    for (const multiplier of [4, 2, 1, 0.5, 0.25, 0]) {
      const group = renderGroup(multiplier, groups[multiplier]);
      if (group) results.append(group);
    }
  }

  page.append(results);
}

export function renderStudy(container, render) {
  const page = el('section', { className: 'page' });
  page.append(el('h2', { text: 'Study' }));

  const controls = el('div', { className: 'panel study-controls' });

  const modeLabel = el('label');
  modeLabel.append(el('span', { text: 'Lookup' }));
  const modeSelect = el('select');
  for (const [value, label] of [['offense', 'Attacking with a type'], ['defense', 'Defending as a type']]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    option.selected = state.study.mode === value;
    modeSelect.append(option);
  }
  modeSelect.addEventListener('change', () => {
    state.study.mode = modeSelect.value;
    render();
  });
  modeLabel.append(modeSelect);
  controls.append(modeLabel);

  const primaryLabel = el('label');
  primaryLabel.append(el('span', { text: state.study.mode === 'offense' ? 'Attacking type' : 'First defending type' }));
  const primarySelect = createTypeSelect(state.study.primaryType);
  primarySelect.addEventListener('change', () => {
    state.study.primaryType = primarySelect.value;
    if (state.study.secondaryType === primarySelect.value) state.study.secondaryType = null;
    render();
  });
  primaryLabel.append(primarySelect);
  controls.append(primaryLabel);

  if (state.study.mode === 'defense') {
    const secondaryLabel = el('label');
    secondaryLabel.append(el('span', { text: 'Second defending type' }));
    const secondarySelect = createTypeSelect(state.study.secondaryType, true);
    secondarySelect.addEventListener('change', () => {
      state.study.secondaryType = secondarySelect.value || null;
      if (state.study.secondaryType === state.study.primaryType) state.study.secondaryType = null;
      render();
    });
    secondaryLabel.append(secondarySelect);
    controls.append(secondaryLabel);
  }

  page.append(controls);
  renderResults(page);
  container.replaceChildren(page);
}
