/*
  cookie setter & getter
*/



class Cookie {
  DURATION_DAY = 86400;
  DURATION_WEEK = 604800;
  DURATION_MONTH = 18144000;
  DURATION_YEAR = 217728000;

  #defaults = {
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
    const options = {...this.#defaults, ...opts};
    let args = [];

    if (options.key === false) {
      return false;
    }

    if (options.path !== false) {
      args.push('path=' + options.path);
    }

    if (options.duration !== false) {
      let exp = new Date;

      args.push('max-age=' + options.duration);
      args.push('expires=' + exp.setTime(exp.getTime() + options.duration));
    }

    if (options.domain !== false) {
      args.push('domain=' + options.domain);
    }

    if (args.strict === true) {
      args.push('SameSite=Strict');
    }

    const pl = options.key + '=' + encodeURIComponent(options.value) +
      (args.length ? ';' + args.join(';') : '')
    ;

    document.cookie = pl;
    Bones.debug('bones:cookie ' + pl);

    return true;
  }
}



export default Cookie;
