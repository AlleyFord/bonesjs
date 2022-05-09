/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/modules/config.js
/*
*/



const Config = {
  cfg: {
    // defaults go here from modules
  },

  enable: function(parent) {
    this.apply(parent.defaults);
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



/* harmony default export */ const config = (Config);

;// CONCATENATED MODULE: ./src/modules/browser.js
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



class Browser {
  URI;
  queryString;

  constructor() {
    this.URI = new Browser_URI();
    this.queryString = new Browser_QS();
  }
}



/* harmony default export */ const browser = (Browser);

;// CONCATENATED MODULE: ./src/modules/cookie.js
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



/* harmony default export */ const cookie = (Cookie);

;// CONCATENATED MODULE: ./src/modules/event.js
/*
  event subscriptions
*/



class EventHandler {
  #events = {};
  #name = false;

  setName(name) {
    this.#name = name;

    return this;
  }

  subscribe(callback) {
    if (this.#events.hasOwnProperty(this.#name)) {
      this.#events[this.#name].callbacks.push(callback);
    }

    else {
      this.#events[this.#name] = {
        callbacks: [callback],
      };
    }

    return this;
  }

  publish(context) {
    if (this.#events.hasOwnProperty(this.#name)) {
      this.#events[this.#name].callbacks.forEach(callback => {
        callback.call(context, context);
      });
    }

    return this;
  }
}

const Handler = new EventHandler();



function Event(name) {
  return Handler.setName(name);
}



/* harmony default export */ const modules_event = (Event);

;// CONCATENATED MODULE: ./src/modules/format.js
/*
  text & number formatting
*/



class Format {
  currency(v) {
    return parseFloat(String(v).replace(/[^\d\.]/g, '')).toFixed(2);
  }
}



/* harmony default export */ const format = (Format);

;// CONCATENATED MODULE: ./src/modules/ajax.js
/*
  vanilla js ajax
*/



class AJAX {
  // quick aliases off the main bones obj
  enable(parent) {
    parent.get = (...args) => this.get(...args);
    parent.post = (...args) => this.post(...args);
    parent.put = (...args) => this.put(...args);
  }

  get(url, args) {
    return this._request('get', url, args);
  }

  post(url, args) {
    return this._request('post', url, args);
  }

  put(url, args) {
    return this._request('put', url, args);
  }

  _request(method, url, args = {}) {
    method = method.toLowerCase();

    let body = null;

    // headers
    const headers = {...args.headers || {}};

    if (args.headers) delete args.headers;

    // tweaks to request based on method
    if (method === 'get') {
      if (Object.keys(args).length) {
        url += '?' + new URLSearchParams(args).toString();
      }
    }
    if (['post', 'put'].includes(method)) {
      body = args;
    }

    return fetch(url, {
      method: method,
      mode: 'cors',
      cache: 'no-cache',
      headers: headers,
      redirect: 'follow',
      body: body ? JSON.stringify(body) : null,
    })
    .then(res => {
      const mime = res.headers.get('content-type');
      let body = false;

      if (mime && (
           mime.indexOf('application/json') !== -1
        || mime.indexOf('text/json') !== -1
        || mime.indexOf('application/javascript') !== -1
        || mime.indexOf('text/javascript') !== -1
      )) {
        body = res.json();
      }

      else {
        body = res.text();
      }

      return body;
    });
  }
}



/* harmony default export */ const ajax = (AJAX);

;// CONCATENATED MODULE: ./src/modules/dom.js
/*
  allows you to perform jquery-style actions w/ vanilla js
  quasi-production ready
*/



const DOMHelper = {
  sanitizeHTML: html => {
    return html.replace(/javascript:/gi, '').replace(/[^\w-_. ]/gi, c => {
      return `&#${c.charCodeAt(0)};`;
    });
  },

  dashToCamel: str => {
    return str.toLowerCase().replace(/[^a-z0-9]+(.)/g, (m, c) => {
      return c.toUpperCase();
    });
  }
}



class DOMChain {
  constructor(expr) {
    if (typeof expr !== 'undefined') {
      this._setNodes(this._flatten(document.querySelectorAll(expr)), true);
    }
  }

  _clone() {
    let newDOM = new DOMChain();

    newDOM._firstNodes = this._firstNodes;
    newDOM._nodes = this._nodes;

    return newDOM;
  }

  _isNodeList(nodes) {
    return NodeList.prototype.isPrototypeOf(nodes);
  }

  // cleans to normal 1d array
  _flatten(nodes) {
    let _nodes = [];

    if (this._isNodeList(nodes)) {
      // noop
    }
    else if (!Array.isArray(nodes)) {
      nodes = [nodes];
    }

    nodes.forEach((node) => {
      if (Array.isArray(node)) {
        node.forEach(_node => {
          _nodes.push(_node);
        });
      }
      else {
        _nodes.push(node);
      }
    });

    return _nodes;
  }

  _apply(callback) {
    return this._nodes.forEach((node, i) => { callback(node, i); });
  }

  _returnStatic(callback) {
    let ret = [];

    this._nodes.forEach(node => {
      ret.push(callback(node));
    });

    return (ret.length === 1) ? ret[0] : ret;
  }

  _setNodes(nodes, replaceFirstNodes = false) {
    this._nodes = nodes;

    if (replaceFirstNodes) {
      this._firstNodes = this._nodes;
    }
  }



  /**
   * events
   */

  enter(callback) {
    return this.on('keyup', false, function (e) {
      if (e.keyCode === 13) {
        callback.call(this, e);
      }
    });
  }

  on(event, target, callback, opts) {
    if (typeof target === 'function') {
      callback = target;
      target = false;
    }

    let options = {
      capture: false,
      once: false,
      passive: false,
    };

    this._apply((node, i) => {
      let newDOM = this._clone().eq(i);

      // need to limit scope before continuing
      if (target) {
        node.addEventListener(event, e => {
          if (e.target.matches(target)) {
            newDOM = new DOMChain();
            newDOM._nodes = newDOM._firstNodes = [e.target];

            callback.call(newDOM, e);
          }
        }, {...options, ...opts});
      }

      else {
        node.addEventListener(event, e => {
          callback.call(newDOM, e);
        }, {...options, ...opts});
      }
    });

    return this;
  }

  click(callback) {
    return this.on('click', null, callback);
  }



  /**
   * selector manipulation
   */

  filter(expr) {
    let _nodes = [];

    this._apply(node => {
      _nodes.push(this._flatten(node.querySelectorAll(expr)));
    });

    this._setNodes(this._flatten(_nodes));

    return this;
  }
  find(expr) {
    return this.filter(expr);
  }
  has(expr) {
    return this.filter(expr);
  }

  closest(expr) {
    let _nodes = [];

    this._apply(node => {
      _nodes.push(this._flatten(node.closest(expr)));
    });

    this._setNodes(this._flatten(_nodes));

    return this;
  }

  end() {
    this._nodes = this._firstNodes;

    return this;
  }
  reset() {
    return this.end();
  }

  first() {
    if (this._nodes.length) {
      this._setNodes([this._nodes[0]]);
    }

    return this;
  }

  last() {
    if (this._nodes.length) {
      this._setNodes([this._nodes.pop()]);
    }

    return this;
  }

  next() {} //@TODO
  prev() {} //@TODO

  eq(i) {
    if (this._nodes.length && typeof this._nodes[i] !== 'undefined') {
      this._setNodes([this._nodes[i]]);
    }

    return this;
  }
  get(i) {
    return this.eq(i);
  }

  parent() {
    let _nodes = [];

    this._apply(node => {
      _nodes.push(node.parentNode);
    });

    this._setNodes(this._flatten(_nodes));

    return this;
  }

  children() {} //@TODO
  siblings() {} //@TODO

  each(callback) {
    this._apply(node => {
      callback.call(this, node);
    });

    return this;
  }

  is(expr) {} //@TODO
  not(expr) {} //@TODO



  /**
   * class manipulation
   */

  hasClass(...vs) {
    let flag = 1;

    this._apply((node) => {
      vs.forEach((v) => {
        if (node.classList.contains(v)) flag &= 1;
        else flag &= 0;
      });
    });

    return flag;
  }

  addClass(...vs) {
    this._apply((node) => {
      vs.forEach((v) => {
        node.classList.add(v);
      });
    });

    return this;
  }

  removeClass(...vs) {
    this._apply((node) => {
      vs.forEach((v) => {
        node.classList.remove(v);
      });
    });

    return this;
  }

  toggleClass(...vs) {
    this._apply((node) => {
      vs.forEach((v) => {
        node.classList.toggle(v);
      });
    });

    return this;
  }



  /**
   * style manipulation
   */

  css(k, v) {
    let map = {};

    if (typeof k === 'object') {
      for (const [key, value] of Object.entries(k)) {
        map[key] = value;
      }
    }
    else if (typeof v === 'undefined') {
      return this._returnStatic(node => {
        return node.getAttribute(k);
      });
    }
    else {
      map[k] = v;
    }

    this._apply(node => {
      for (const [key, value] of Object.entries(map)) {
        node.style[DOMHelper.dashToCamel(key)] = value;
      }
    });

    return this;
  }

  hide() {
    this._apply(node => {
      node.style.display = 'none';
    });

    return this;
  }

  show() {
    this._apply(node => {
      if (node.style.display === 'none') {
        node.style.display = '';
      }
      else {
        node.style.display = 'block'; // @TODO make this know what default display to be (block or inline-block or other)
      }
    });

    return this;
  }



  /**
   * size calculations
   */

  width() {
    return this._returnStatic(node => {
      const cs = window.getComputedStyle(node, null);

      return node.clientWidth
        - parseInt(cs.getPropertyValue('padding-left'))
        - parseInt(cs.getPropertyValue('padding-right'))
      ;
    });
  }

  innerWidth() {
    return this._returnStatic(node => {
      return node.clientWidth;
    });
  }

  outerWidth(includeMargin = false) {
    return this._returnStatic(node => {
      let width = node.offsetWidth;

      if (includeMargin) {
        const cs = window.getComputedStyle(node, null);

        width += parseInt(cs.getPropertyValue('margin-left'))
             + parseInt(cs.getPropertyValue('margin-right'))
        ;
      }

      return width;
    });
  }

  fullWidth() {
    return this.outerWidth(true);
  }

  height() {
    return this._returnStatic(node => {
      const cs = window.getComputedStyle(node, null);

      return node.clientHeight
        - parseInt(cs.getPropertyValue('padding-top'))
        - parseInt(cs.getPropertyValue('padding-bottom'))
      ;
    });
  }

  innerHeight() {
    return this._returnStatic(node => {
      return node.clientHeight;
    });
  }

  outerHeight(includeMargin = false) {
    return this._returnStatic(node => {
      let width = node.offsetHeight;

      if (includeMargin) {
        const cs = window.getComputedStyle(node, null);

        width += parseInt(cs.getPropertyValue('margin-top'))
             + parseInt(cs.getPropertyValue('margin-bottom'))
        ;
      }

      return width;
    });
  }

  fullHeight() {
    return this.outerHeight(true);
  }

  scrollTop(v) {
    if (typeof v !== 'undefined') {
      return this._returnStatic(node => {
        return node.pageYOffset;
      });
    }

    this._apply(node => {
      node.pageYOffset = v;
    });

    return this;
  }

  position() {
    this._returnStatic(node => {
      const rect = node.getBoundingClientRect();

      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
      };
    });
  }



  /**
   * attribute manipulation
   */

  attr(k, v) {
    if (typeof v === 'undefined') {
      return this._returnStatic(node => {
        return node.getAttribute(k);
      });
    }

    this._apply(node => {
      node.setAttribute(k, v);
    });

    return this;
  }



  /**
   * tree manipulation
   */

  append(v) {
    this._apply(node => {
      node.insertAdjacentHTML('beforeend', v);
    });

    return this;
  }

  prepend(v) {
    this._apply(node => {
      node.insertAdjacentHTML('afterbegin', v);
    });

    return this;
  }

  before(v) {
    this._apply(node => {
      node.insertAdjacentHTML('beforebegin', v);
    });

    return this;
  }

  after(v) {
    this._apply(node => {
      node.insertAdjacentHTML('afterend', v);
    });

    return this;
  }



  /**
   * content manipulation
   */

  html(v) {
    if (typeof v === 'undefined') {
      return this._returnStatic(node => {
        return node.innerHTML;
      });
    }

    this._apply(node => {
      node.innerHTML = v;
    });

    return this;
  }

  text(v) {
    if (typeof v === 'undefined') {
      return this._returnStatic(node => {
        return node.textContent;
      });
    }

    this._apply(node => {
      node.textContent = v;
    });

    return this;
  }

  val(v) {
    if (typeof v === 'undefined') {
      return this._returnStatic(node => {
        return node.getAttribute('value');
      });
    }

    this._apply(node => {
      node.setAttribute('value', v);
    });

    return this;
  }
}



const DOMReady = function(callback) {
  if (document.readyState != 'loading') callback();
  else document.addEventListener('DOMContentLoaded', callback);
};


const DOM = expr => {
  if (typeof expr === 'function') return DOMReady(expr);
  return new DOMChain(expr);
}



/* harmony default export */ const dom = (DOM);

;// CONCATENATED MODULE: ./src/modules/masonry.js
class Masonry {
  #defaults = {
    cols: 2,
    selector: '.masonry',
  };
  config = {};


  constructor(one, two) {
    if (typeof one === 'string') this.init(one, two);
    else this.apply(one);
  }


  apply(opts) {
    this.opts = {...this.#defaults, ...opts};
  }


  init(sel, opts) {
    if (typeof opts !== 'undefined') this.apply(opts);

    const $s = document.querySelectorAll(sel);

    if (!$s.length) return;

    $s.forEach($p => {
      const heights = Array(this.opts.cols).fill(0);

      $p.querySelectorAll(this.opts.selector).forEach(($e, i) => {
        const order = i % this.cols;

        $e.style.order = order;
        heights[order] += parseFloat($e.clientHeight);
      });

      $p.style.height = Math.max(...heights) + 'px';
    });
  }
}



/* harmony default export */ const masonry = (Masonry);

;// CONCATENATED MODULE: ./src/modules/lazy.js
class Lazy {
  #defaults = {
    class: 'lazy',
    class_bg: 'lazy-bg',
    placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  };
  opts = {};



  init(opts) {
    this.opts = {...this.#defaults, ...opts};

    const Lazy = new IntersectionObserver((en, ob) => {
      en.forEach(e => {
        if (e.isIntersecting) {
          let img = e.target;

          if (img.classList.contains(this.opts.class_bg)) {
            img.style.backgroundImage = `url(${img.dataset.src})`;
          }
          else {
            img.src = img.dataset.src;
          }

          img.classList.remove(this.opts.class);
          img.classList.remove(this.opts.class_bg);
          Lazy.unobserve(img);
        }
      });
    });

    [].slice.call(document.querySelectorAll(`.${this.opts.class}`)).forEach(e => {
      Lazy.observe(e);
      e.src = this.opts.placeholder;
    });
  }
}



/* harmony default export */ const lazy = (Lazy);

;// CONCATENATED MODULE: ./src/bones.js
/*
  bones js lib
  jquery-like vanilla js and more
*/













class BonesJS {
  defaults = {
    debug: false,
    shortcut: 'B',
    'dom.shortcut': '$',
    name: 'Bones',
  };
  #modules = new Map([
    ['config', config],
    ['browser', new browser()],
    ['cookie', new cookie()],
    ['format', new format()],
    ['event', modules_event],
    ['ajax', new ajax()],
    ['dom', dom],
    ['masonry', new masonry()],
    ['lazy', new lazy()],
  ]);


  constructor(opts) {
    this.defaults = {...this.defaults, ...opts};

    for (const mod of this.#modules) {
      this[mod[0]] = mod[1];

      if (typeof this[mod[0]]['enable'] === 'function') this[mod[0]]['enable'](this);
    }

    return this;
  }


  init(name) {
    if (typeof name === 'undefined') name = this.config.get('name');

    if (typeof window !== 'undefined') {
      if (typeof this.dom !== 'undefined') this[this.config.get('dom.shortcut')] = this.dom;

      window[name] = this;
      window[this.config.get('shortcut')] = window[name];
    }

    this.event('ready').publish();
  }


  debug(...v) {
    if (this.config.get('debug')) console.log(v);
  }
}



const bones_Bones = new BonesJS();
bones_Bones.init();

/******/ })()
;