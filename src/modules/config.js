/*
*/



const Config = {
  cfg: {
    // defaults go here from modules
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

  set: function(opts, v) {
    if (typeof opts === 'string') {
      this.cfg[opts] = v;
      return;
    }

    this.apply(opts);
  },
};



export default Config;
