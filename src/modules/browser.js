/*
  quick uri helpers
*/



class Browser_URI {
  set(path) {
    window.history.replaceState({}, '', path);
  }
}



class Browser_QS {
  qs = {};

  constructor(qs) {
    this.parse(qs);
  }

  parse(qs) {
    if (typeof qs === 'undefined') {
      qs = window.location.search;
    }

    this.qs = new URLSearchParams(qs);
  }

  get(k) {
    if (!k) return this.qs;

    return this.qs.get(k);
  }

  getAll(k) {
    if (!k) return this.qs;

    return this.qs.getAll(k);
  }
}



class Browser_Hash {
  hash = {};

  constructor() {
    this.hash = window.location.hash;
  }

  get() {
    return this.hash;
  }
}



class Browser {
  URI;
  queryString;

  constructor() {
    this.URI = new Browser_URI();
    this.queryString = new Browser_QS();
    this.hash = new Browser_Hash();
  }
}



export default Browser;
