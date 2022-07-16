/*
  bones js lib
  jquery-like vanilla js and more
*/

import Scaffold from './scaffold.js';
import Browser from './modules/browser.js';
import Cookie from './modules/cookie.js';
import Event from './modules/event.js';
import Format from './modules/format.js';
import AJAX from './modules/ajax.js';
import DOM from './modules/dom.js';
import Masonry from './modules/masonry.js';
import Lazy from './modules/lazy.js';



class BonesJS extends Scaffold {
  name = 'Bones';

  defaults = {
    debug: false,
    shortcut: 'B',
    'dom.shortcut': '$',
  };

  #modules = new Map([
    ['browser', new Browser()],
    ['cookie', new Cookie()],
    ['format', new Format()],
    ['event', Event],
    ['ajax', new AJAX()],
    ['dom', DOM],
    ['masonry', new Masonry()],
    ['lazy', new Lazy()],
  ]);

  EMOJI_THUMBSUP = '👍';
  EMOJI_CHECK = '✔️';
  EMOJI_CROSS = '❌';


  constructor(opts) {
    super();

    this.apply(opts);

    for (const mod of this.#modules) {
      this[mod[0]] = mod[1];

      if (typeof this[mod[0]]['enable'] === 'function') this[mod[0]]['enable'](this);
    }

    return this;
  }


  init(name) {
    if (typeof name === 'undefined') name = this.name;

    if (typeof window !== 'undefined') {
      if (typeof this.dom !== 'undefined') window[this.opts['dom.shortcut']] = this.dom;

      window[name] = this;
      window[this.opts.shortcut] = window[name];
    }

    this.event('ready').publish();
  }


  debug(mod, ...v) {
    if (this.opts.debug) console.log(mod, v);
  }
}



export default BonesJS;
