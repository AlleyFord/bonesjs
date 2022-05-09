/*
  bones js lib
  jquery-like vanilla js and more
*/

import Config from './modules/config.js';
import Browser from './modules/browser.js';
import Cookie from './modules/cookie.js';
import Event from './modules/event.js';
import Format from './modules/format.js';
import AJAX from './modules/ajax.js';
import DOM from './modules/dom.js';
import Masonry from './modules/masonry.js';
import Lazy from './modules/lazy.js';



class BonesJS {
  #defaults = {
    debug: false,
    shortcut: 'B',
    'dom.shortcut': '$',
    name: 'Bones',
  };
  opts = {};

  #modules = new Map([
    ['config', Config],
    ['browser', new Browser()],
    ['cookie', new Cookie()],
    ['format', new Format()],
    ['event', Event],
    ['ajax', new AJAX()],
    ['dom', DOM],
    ['masonry', new Masonry()],
    ['lazy', new Lazy()],
  ]);


  constructor(opts) {
    this.opts = {...this.#defaults, ...opts};

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



const Bones = new BonesJS();
Bones.init();
