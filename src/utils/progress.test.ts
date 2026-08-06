import assert from 'node:assert';
import { computeIsCompleted, computeProgressPercent } from './progress';

function main() {
  assert.equal(computeProgressPercent(0, 12), 0);
  assert.equal(computeProgressPercent(6, 12), 50);
  assert.equal(computeProgressPercent(12, 12), 100);
  assert.equal(computeProgressPercent(5, 3), 167);
  assert.equal(computeProgressPercent(0, 0), 0);
  assert.equal(computeProgressPercent(1, null), 0);

  assert.equal(computeIsCompleted(12, 12), true);
  assert.equal(computeIsCompleted(13, 12), true);
  assert.equal(computeIsCompleted(11, 12), false);
  assert.equal(computeIsCompleted(0, 0), false);
  assert.equal(computeIsCompleted(0, null), false);

  console.log('progress self-check: OK');
}

main();
