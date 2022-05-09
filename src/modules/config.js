/*
*/



const Config = {
  cfg: {
    // defaults go here from modules
  },

  enable: function(parent) {
    this.apply(parent.opts);
  },

  default: function(opts) {
    this.cfg = Object.assign(opts || {}, this.cfg);
  },

  apply: function(opts) {
    this.cfg = Object.assign(this.cfg, opts || {});
  },

  get: function(k) {
    return this.cfg[k] || null;
  },

  match: function(expr) {
    let matches = {};

    for (const [k, v] of Object.entries(this.cfg)) {
      if (expr.test(k)) matches[k] = v;
    }

    return Object.entries(matches);
  },

  set: function(opts, v) {
    if (typeof opts === 'string') {
      this.cfg[opts] = v;
      return;
    }

    this.apply(opts);
  },
};



export default Config;
