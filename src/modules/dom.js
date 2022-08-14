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
  TEMPLATE_LITERAL_LEFT = '%%';
  TEMPLATE_LITERAL_RIGHT = '%%';


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
    return this.on('keyup', null, function (e) {
      if (e.keyCode === 13) {
        callback.call(this, e);
      }
    });
  }

  submit(callback) {
    return this.on('submit', null, callback);
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

  focus(callback) {
    return this.on('focus', null, callback);
  }

  blur(callback) {
    return this.on('blur', null, callback);
  }



  /**
   * helpers
   */

   serialize() {
    let data = {};
    const form = new FormData(this._nodes[0]);

    for (const [k, v] of form) {
      data[k] = v;
    }

    return data;
  }



  /**
   * selector manipulation
   */

  filter(expr) {
    let newDOM = this._clone();

    let _nodes = [];

    newDOM._apply(node => {
      const descendants = node.querySelectorAll(expr);
      const match = node.matches(expr);

      if (match) {
        _nodes.push(newDOM._flatten(node));
      }
      if (descendants && descendants.length) {
        _nodes.push(newDOM._flatten(descendants));
      }
    });

    newDOM._setNodes(newDOM._flatten(_nodes));

    return newDOM;
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

  gt(i) {
    let newDOM = this._clone();
    let _nodes = [];

    newDOM._setNodes(newDOM._flatten(this._nodes.slice(i)));

    return newDOM;
  }

  lt(i) { // TODO
    let newDOM = this._clone();
    let _nodes = [];

    for (let x = i - 1; x => 0; x--) {
      _nodes.push(this._nodes[x]);
    }

    newDOM._setNodes(newDOM._flatten(_nodes));

    return newDOM;
  }

  parent() {
    let newDOM = this._clone();
    let _nodes = [];

    this._apply(node => {
      _nodes.push(node.parentNode);
    });

    newDOM._setNodes(newDOM._flatten(_nodes));

    return newDOM;
  }
  // todo parentS with filter

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
  style(k, v) {
    return this.css(k, v);
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

  removeAttr(k) {
    this._apply(node => {
      node.removeAttribute(k);
    });

    return this;
  }

  enable() {
    return this.removeAttr('disabled');
  }

  disable() {
    return this.attr('disabled', 'disabled');
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

  replace(v) {
    this._apply(node => {
      node.outerHTML = v;
    });

    return this;
  }

  remove(v) {
    this._apply(node => {
      node.remove();
    });
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
        return node.value;
      });
    }

    this._apply(node => {
      node.value = v;
    });

    return this;
  }

  template(sel, vars) {
    const t = new DOMChain(sel);
    let html = t.html();

    for (const [k, v] of Object.entries(vars || {})) {
      html = html.replace(new RegExp(`${t.TEMPLATE_LITERAL_LEFT}\\s*${k}\\s*${t.TEMPLATE_LITERAL_RIGHT}`, 'gm'), v);
    }

    return this._nodes && this._nodes.length ? this.html(html) : html; // allows direct invocation
  }
}



const DOMReady = function(callback) {
  if (document.readyState != 'loading') callback();
  else document.addEventListener('DOMContentLoaded', callback);
};


const DOM = expr => {
  // allow extending
  if (typeof expr === 'undefined') return DOMChain.prototype;

  // domready
  if (typeof expr === 'function') return DOMReady(expr);

  // selector chain
  return new DOMChain(expr);
}



export default DOM;
