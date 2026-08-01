import assert from 'node:assert/strict';
import test from 'node:test';
import { featureAvailability, featureEnabled } from '../lib/fitmeet-capabilities.ts';

test('capabilities fail closed when the manifest is missing or disabled', () => {
  assert.equal(featureEnabled(null, 'multiplayerGroups', 42), false);
  assert.equal(
    featureEnabled(
      { features: { multiplayerGroups: { enabled: false, rolloutPercentage: 100 } } },
      'multiplayerGroups',
      42,
    ),
    false,
  );
});

test('fully rolled out capabilities are available for authenticated users', () => {
  assert.deepEqual(
    featureAvailability(
      { features: { messaging: { enabled: true, rolloutPercentage: 100 } } },
      'messaging',
      42,
    ),
    { enabled: true, rolloutPercentage: 100 },
  );
});

test('partial rollouts require an authenticated stable user bucket', () => {
  const config = { features: { agent: { enabled: true, rolloutPercentage: 10 } } };
  assert.equal(featureEnabled(config, 'agent'), false);
  const first = featureAvailability(config, 'agent', 42);
  const second = featureAvailability(config, 'agent', 42);
  assert.deepEqual(first, second);
});
