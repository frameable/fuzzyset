import unidecode from 'unidecode';


class FuzzySet {

  synonyms = {};
  stopwords = [ 'of', 'and', '&', 'the' ];

  tokenMatchFactor = 0.5;
  tokenPrefixFactor = 0.25;
  prefixFactor = 0.12;
  vaccuumFactor = 0.8;

  constructor(values=[], options={}) {

    Object.assign(this, options);

    this.values = values;
    this.nvalues = this.values.map(v => this.normalize(v));
    this.vvalues = this.nvalues.map(v => this.vaccuum(v));
    this.nfreq = {};

    const nts = this.nvalues.map(nv => nv.split(' ')).flat();
    const total = nts.length;

    for (const nt of nts) {
      if (!(nt in this.nfreq)) {
        this.nfreq[nt] = 0
      } else if (this.nfreq[nt] === 0) {
        this.nfreq[nt] = 2 / total;
      } else {
        this.nfreq[nt] += 1 / total;
      }
    }
  }

  ninverse(nt) {
    // if the term is common, don't count it for as much credit
    return 1 - Math.min(this.nfreq[nt], 0.1) * 9;
  }

  normalize(str) {

    str = unidecode(str)
      .replace(/([a-z])([A-Z][a-z])/g, "$1 $2") // camelCase
      .toLowerCase()
      .replace(/\s?\&\s?/g, ' and ')
      .replace(/[\.']/g, '')  // drop periods
      .replace(/['’]?s\b/g, '')  // possessives plurals
      .replace(/([a-z])\W+/g, "$1 ")  // punctuation following word
      .replace(/\W+/g, ' ')

    const words = str.split(' ').filter(s => !this.stopwords.includes(s));

    for (const [i, w] of words.entries()) {
      if (w in this.synonyms) {
        words[i] = this.synonyms[w];
      }
    }

    return words.join(' ');
  }

  vaccuum(str) {
    // remove repeated chars and strip vowels
    str = str.split("").filter((x, n, s) => s.indexOf(x) == n).join('')
    return str.replace(/[aeiou\s]/g, '');
  }

  match(query, options={}) {
    const scores = [];
    for (const [idx, v] of this.values.entries()) {
      scores[idx] = this.score(query, idx);
      scores[idx] += options.boost?.[idx] || 0;
    }

    return scores
      .map((s, idx) => [s, idx])
      .sort(([a], [b]) => b - a)
      .map(([s, idx]) => [idx, s]);
  }

  score(query, vidx) {

    let score = 0;
    const nquery = this.normalize(query);
    const nvalue = this.nvalues[vidx];
    const vquery = this.vaccuum(nquery);
    const vvalue = this.vvalues[vidx];

    if (nquery == nvalue) return 1;
    if (vquery == vvalue) return 0.95;

    const vtokens = this.nvalues[vidx].split(' ');
    const qntokens = nquery.split(' ');
    const qvtokens = vquery.split(' ');

    const { tokenMatchFactor, tokenPrefixFactor, prefixFactor, vaccuumFactor } = this;

    for (const vt of vtokens) {
      if (qntokens.includes(vt)) {
        const factor = tokenMatchFactor * this.ninverse(vt);
        score += factor / vtokens.length;
      }
    }

    for (const qt of qntokens) {
      for (const vt of vtokens) {
        if (vt.startsWith(qt)) {
          const factor = tokenPrefixFactor * this.ninverse(vt);
          score += factor * qt.length / nvalue.length;
        }
      }
    }

    if (nvalue.startsWith(nquery)) {
      score += prefixFactor;
    }

    if (vvalue.startsWith(vquery)) {
      score += vaccuumFactor;
    }

    return score;
  }

}

export default FuzzySet;
