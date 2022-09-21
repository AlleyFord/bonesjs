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
  TL_L = '%%';
  TL_R = '%%';


  constructor(expr) {
    if (expr instanceof HTMLElement || Array.isArray(expr) || this._isNodeList(expr)) {
      this._setNodes(this._flatten(expr), true);
    }

    else if (typeof expr !== 'undefined') {
      this._setNodes(this._flatten(document.querySelectorAll(expr)), true);
    }

    else {
    }
  }

  _clone() {
    let newDOM = new DOMChain();

    newDOM._firstNodes = this._firstNodes;
    newDOM._nodes = this._nodes;

    return newDOM;
  }

  copy() {
    return this._clone();
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

  get length() {
    return this._nodes.length;
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

  on(event, isolated, callback, opts) {
    if (typeof isolated === 'function') {
      callback = isolated;
      isolated = false;
    }

    let options = {
      capture: false,
      once: false,
      passive: false,
    };

    this._apply((node, i) => {
      // need to limit scope before continuing
      if (isolated) {
        node.addEventListener(event, el => {
          if (el.target.matches(isolated)) {
            callback.call(new DOMChain(el.target), el);
          }
        }, {...options, ...opts});
      }

      else {
        node.addEventListener(event, el => {
          callback.call(this._clone().eq(i), el);
        }, {...options, ...opts});
      }
    });

    return this;
  }

  change(callback) {
    return this.on('change', null, callback);
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
      if (!data.hasOwnProperty(k)) {
        data[k] = v;
      }
      else {
        if (!Array.isArray(data[k])) {
          data[k] = [data[k]];
        }

        data[k].push(v);
      }
    }

    return data;
  }



  /**
   * selector manipulation
   */

  filter(expr, match_descendants) {
    let newDOM = this._clone();

    let _nodes = [];

    newDOM._apply(node => {
      let descendants = [];

      if (match_descendants) {
        descendants = node.querySelectorAll(expr);
      }

      const match = node.matches(expr);

      if (match) {
        _nodes.push(newDOM._flatten(node));
      }

      if (match_descendants) {
        if (descendants && descendants.length) {
          _nodes.push(newDOM._flatten(descendants));
        }
      }
    });

    newDOM._setNodes(newDOM._flatten(_nodes));

    return newDOM;
  }

  only(expr) {
    return this.filter(expr, false);
  }

  find(expr) {
    return this.filter(expr, true);
  }

  has(expr) { // this still doesn't work like i think it should
    let _nodes = [];

    this._apply(node => {
      const descendants = node.querySelectorAll(expr);

      if (descendants && descendants.length) {
        _nodes.push(this._flatten(node));
      }
    });

    this._setNodes(this._flatten(_nodes));

    return this;
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
    let newDOM = this._clone();

    if (this._nodes.length && typeof this._nodes[i] !== 'undefined') {
      newDOM._setNodes(newDOM._flatten([this._nodes[i]]));
    }

    return newDOM;
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

  //parents() == practical usage for selector-driven closest()

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
    this._apply((node, i) => {
      callback.call(this.eq(i), node);
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

  dimensions() { // @TODO this breaks convention for node lists
    return {
      height: this.height(),
      width: this.width(),
      outerHeight: this.outerHeight(),
      outerWidth: this.outerWidth(),
      innerHeight: this.innerHeight(),
      innerWidth: this.innerWidth(),
    };
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
    return this._returnStatic(node => {
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

  data(k, v) {
    return this.attr(`data-${k}`, v);
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

  isChecked() {
    return this._returnStatic(node => {
      return node.checked;
    });
  }

  deselect() {
    this._apply(node => {
      node.selected = false;
      node.removeAttribute('selected');
    });

    return this;
  }
  select() {
    this._apply(node => {
      node.selected = true;
      node.setAttribute('selected', 'selected');
    });

    return this;
  }

  id(kv) {
    return this.attr('id', kv);
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
        return node.innerText;
      });
    }

    this._apply(node => {
      node.innerText = v;
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
      html = html.replace(new RegExp(`${t.TL_L}\\s*${k}\\s*${t.TL_R}`, 'gm'), v);
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
