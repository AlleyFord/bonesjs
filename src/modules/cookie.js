/*
  cookie setter & getter
*/



import Scaffold from '../scaffold.js';



class Cookie extends Scaffold {
  DURATION_DAY = 86400;
  DURATION_WEEK = 604800;
  DURATION_MONTH = 18144000;
  DURATION_YEAR = 217728000;

  name = 'Cookie';
  defaults = {
    duration: this.DURATION_MONTH,
    strict: true,
    domain: false,
    path: '/',
    key: false,
    value: false,
  };

  get(k) {
    const m = document.cookie.match(new RegExp('[ ]?' + k + '=([^;]+)', 'i'));
    if (m) return decodeURIComponent(m[1]);

    return null;
  }

  set(opts) {
    this.apply(opts);

    let args = [];

    if (this.opts.key === false) {
      return false;
    }

    if (this.opts.path !== false) {
      args.push('path=' + this.opts.path);
    }

    if (this.opts.duration !== false) {
      let exp = new Date;

      args.push('max-age=' + this.opts.duration);
      args.push('expires=' + exp.setTime(exp.getTime() + this.opts.duration));
    }

    if (this.opts.domain !== false) {
      args.push('domain=' + this.opts.domain);
    }

    if (args.strict === true) {
      args.push('SameSite=Strict');
    }

    const pl = this.opts.key + '=' + encodeURIComponent(this.opts.value) +
      (args.length ? ';' + args.join(';') : '')
    ;

    document.cookie = pl;
    Bones.debug(this.name, pl);

    return true;
  }
}



export default Cookie;
