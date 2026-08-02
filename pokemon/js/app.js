import { startRouter } from './router.js';
import { state, hydratePersistentState } from './state.js';
import { loadPersistentData } from './storage.js';
import { VIEWS } from './views/index.js';
import { runEngineSelfTests } from './engine/effectiveness.js';

hydratePersistentState(loadPersistentData());

const viewRoot = document.querySelector('#app-view');
const navLinks = [...document.querySelectorAll('[data-route]')];

function render() {
  const view = VIEWS[state.route] ?? VIEWS.quiz;
  view(viewRoot, render);
  for (const link of navLinks) {
    const isCurrent = link.dataset.route === state.route;
    link.toggleAttribute('aria-current', isCurrent);
  }
}

startRouter(route => {
  state.route = route;
  render();
});

const testResults = runEngineSelfTests();
console.table(testResults);
if (testResults.some(test => !test.passed)) {
  console.error('Type engine self-test failed.');
}
