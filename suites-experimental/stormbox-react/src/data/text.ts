import { FIRST_NAMES, WORDS } from './corpus';
import { createRng, hashSeed, int, pick, type Rng } from './random';

const SLOTS: Record<string, readonly string[]> = {
  verb: ['review', 'ship', 'finalize', 'revisit', 'split up', 'land', 'profile', 'simplify', 'document', 'test', 'merge', 'roll back', 'prototype', 'estimate'],
  past: ['reviewed', 'updated', 'rebased', 'profiled', 'rewrote', 'merged', 'tested', 'cleaned up', 'measured', 'drafted'],
  noun: ['proposal', 'patch', 'migration plan', 'release notes', 'budget', 'design doc', 'test plan', 'benchmark results', 'contract', 'onboarding guide', 'roadmap', 'cache schema', 'invoice', 'dashboard', 'slide deck', 'checklist', 'meeting notes', 'API change', 'crash report', 'trace'],
  adj: ['much better', 'mostly fine', 'a bit rough', 'promising', 'stable', 'slower than expected', 'ready', 'surprisingly fast', 'close', 'blocked'],
  when: ['Friday', 'the end of the week', 'Tuesday’s sync', 'next sprint', 'the offsite', 'tomorrow morning', 'the release cut', 'Monday', 'the planning meeting', 'month end'],
  project: ['Atlas', 'Borealis', 'the sync worker', 'the message list', 'the reading pane', 'search', 'the compose dialog', 'the mobile layout', 'billing', 'the importer'],
  status: ['on track', 'slipping a little', 'waiting on review', 'nearly done', 'blocked on infra', 'in QA', 'behind schedule', 'ahead of plan'],
  problem: ['the intermittent timeout', 'a layout jump', 'the memory spike', 'slow first paint', 'duplicate notifications', 'the flaky test', 'stale results', 'a rendering glitch'],
  platform: ['Firefox Nightly', 'older Android tablets', 'Safari', 'the staging cluster', 'Windows laptops', 'the CI runners', 'large mailboxes', 'slow networks'],
  condition: ['the window is resized', 'the cache is cold', 'two tabs are open', 'the folder has a few thousand messages', 'the user switches folders quickly', 'the device wakes from sleep'],
  meeting: ['standup', 'Thursday’s review', 'the weekly sync', 'office hours', 'the retro', 'our 1:1'],
  decision: ['the rollout plan', 'which option to keep', 'the final scope', 'the deadline', 'who owns the follow-up'],
  doc: ['spreadsheet', 'summary', 'report', 'draft', 'write-up', 'export'],
  thing: ['photos', 'tickets', 'recipe', 'itinerary', 'receipts', 'book list', 'playlist', 'notes'],
};

const TEMPLATES = [
  'Can we {verb} the {noun} before {when}?',
  'I {past} the {noun} and it looks {adj} now.',
  'The {noun} for {project} is {status}, so we should {verb} it by {when}.',
  '{name}, could you take a look at the {noun} when you get a chance?',
  'Thanks for sending the {noun}; I left a few comments inline.',
  'We are still seeing {problem} on {platform}, mostly when {condition}.',
  'Let’s {verb} this in {meeting} and decide on {decision}.',
  'Attached is the {doc} with the latest numbers for {project}.',
  'Quick update: {project} is {status} and the {noun} is {adj}.',
  'I think we can {verb} the {noun} without touching {project}.',
  'Does anyone remember why we decided to {verb} the {noun} last quarter?',
  '{name} mentioned that {problem} only shows up on {platform}.',
  'If nobody objects, I will {verb} the {noun} on {when}.',
  'The numbers from {platform} look {adj} after the last change.',
  'Sharing the {thing} from the weekend, more to follow.',
  'Happy to pair on the {noun} if that helps move {project} along.',
  'Before we {verb} anything, we should agree on {decision}.',
  'I moved the {noun} into the shared folder so everyone can find it.',
];

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function looseSentence(rng: Rng): string {
  const length = int(rng, 7, 16);
  const words: string[] = [];
  for (let i = 0; i < length; i += 1) words.push(pick(rng, WORDS));
  return `${capitalize(words.join(' '))}.`;
}

export function sentence(rng: Rng): string {
  if (rng() < 0.15) return looseSentence(rng);
  return pick(rng, TEMPLATES).replace(/\{(\w+)\}/g, (_, slot: string) => (
    slot === 'name' ? pick(rng, FIRST_NAMES) : pick(rng, SLOTS[slot])
  ));
}

export function paragraph(rng: Rng, min = 2, max = 5): string {
  const count = int(rng, min, max);
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) out.push(sentence(rng));
  return out.join(' ');
}

/** The opening paragraph of a body; also the source of its list preview. */
export function introParagraph(seed: number): string {
  return paragraph(createRng(hashSeed(seed, 1)), 2, 4);
}

export function previewOf(text: string): string {
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}
