# fuzzyset

Search a set of strings/documents with fuzzy matching

```javascript
import FuzzySet from 'fuzzyset';

const docs = ['afghanistan', 'albania', 'algeria', ...]

const set = new FuzzySet(docs);
const results = set.query('al');

for (const [i, score] of results) {
  console.log(countries[i], score);
}

// Albania 1.0
// Algeria 0.5
// ...
```

### new FuzzySet(docs, options)

Instantiate a set, given docs and options.

##### docs

Array of strings, each of which could be a simple title, or the entire text of a document, or a list of keywords.

##### options

- `synonyms` - Object with keys as alias terms pointing to canonical terms.  Ex: `{ nyc: 'New York City', philly: 'Philadelphia' }`

- `stopwords` - Array of terms that should be ignored for having no semantic meaning.  Ex: `['a', 'an', 'of', 'the', '&']`

- `tokenMatchFactor` - Weight to give to matching normalized tokens.  Default `0.5`.

- `tokenPrefixFactor` - Weight to give to terms matching prefixes.  Default `0.25`.

- `prefixFactor` - Weight to give to direct document prefix term matching.  Default `0.12`

- `vaccuumFactor` - Weight to give to consonant terms with vowels removed.  Default `0.8`

