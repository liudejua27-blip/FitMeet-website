import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const onboardingSource = readFileSync(
  new URL('../components/fitmeet-app/OnboardingFlow.tsx', import.meta.url),
  'utf8',
);
const onboardingStyles = readFileSync(
  new URL('../components/fitmeet-app/fitmeet-complete.module.css', import.meta.url),
  'utf8',
);
const experienceSource = readFileSync(
  new URL('../components/fitmeet-app/FitMeetCompleteExperience.tsx', import.meta.url),
  'utf8',
);

test('desktop purpose cloud exposes a broad multi-select activity and industry taxonomy', () => {
  const purposeSection = onboardingSource.slice(
    onboardingSource.indexOf('const initialPurposeOptions'),
    onboardingSource.indexOf('export type InitialPurpose'),
  );
  assert.ok((purposeSection.match(/value: "/g) ?? []).length >= 30);
  for (const label of [
    '交友',
    '徒步露营',
    '桌游电竞',
    '求职交流',
    '商务合作',
    '编程科技',
    '装修维修',
    '公益志愿',
  ]) {
    assert.match(purposeSection, new RegExp(`title: "${label}"`));
  }
  assert.match(onboardingSource, /selectedInitialPurposes/);
  assert.match(onboardingSource, /aria-pressed=\{selected\}/);
  assert.match(onboardingSource, /selectedOptions\.map\(\(option\) => option\.title\)/);
  assert.match(onboardingSource, /\}, \[entry, stage\]\);/);
  assert.match(experienceSource, /selectedLabels\.join\('、'\)/);
});

test('purpose cloud uses scoped GSAP motion and respects reduced-motion preferences', () => {
  assert.match(onboardingSource, /useGSAP\(\(\) =>/);
  assert.match(onboardingSource, /gsap\.matchMedia\(\)/);
  assert.match(onboardingSource, /prefers-reduced-motion: reduce/);
  assert.match(onboardingSource, /data-purpose-tile/);
  assert.match(onboardingSource, /return \(\) => media\.revert\(\)/);
});

test('onboarding has wide desktop grids while retaining a one-column mobile fallback', () => {
  assert.match(onboardingStyles, /width: min\(100%, 1180px\)/);
  assert.match(onboardingStyles, /grid-template-columns: repeat\(7, minmax\(0, 1fr\)\)/);
  assert.match(onboardingStyles, /\.stageDesktopGrid/);
  assert.match(onboardingStyles, /@media \(max-width: 720px\)[\s\S]*grid-template-columns: 1fr/);
  assert.match(onboardingStyles, /\.onboardingPage :is\(button, input, textarea, select, a, \[tabindex\]\):focus-visible/);
});

test('onboarding reuses the current registration policy and repairs stale saved versions', () => {
  assert.match(
    onboardingSource,
    /import \{ FITMEET_CURRENT_REGISTRATION_POLICY \} from "@\/lib\/fitmeet-registration-consent"/,
  );
  assert.match(onboardingSource, /consents: \{[\s\S]*\.\.\.FITMEET_CURRENT_REGISTRATION_POLICY/);
  assert.doesNotMatch(onboardingSource, /termsVersion: "2026-07-02"/);
  assert.doesNotMatch(onboardingSource, /privacyVersion: "2026-07-02"/);
});
