import { test } from 'node:test';
import assert from 'node:assert';
import FuzzySet from './index.js';

const countries = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentine',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
]

test('countries', () => {
  const set = new FuzzySet(countries);
  const ranks = set.match('an');
  const [winner] = ranks.map(([i, score]) => [countries[i], score])
  assert.equal(winner[0], 'Angola');
})

test('missing letter', () => {
  const set = new FuzzySet(countries);
  const ranks = set.match('andora');
  const [winner] = ranks.map(([i, score]) => [countries[i], score])
  assert.equal(winner[0], 'Andorra');
})

test('missing vowels', () => {
  const set = new FuzzySet(countries);
  const ranks = set.match('andr');
  const [winner] = ranks.map(([i, score]) => [countries[i], score])
  assert.equal(winner[0], 'Andorra');
})

