/*
  bones js lib
  jquery-like vanilla js
*/

import { Config } from './modules/config.js';
import { Browser } from './modules/browser.js';
import { Cookie } from './modules/cookie.js';
import { Tracker } from './modules/track.js';
import { Event } from './modules/event.js';
import { Format } from './modules/format.js';
import { DOM, DOMReady } from './modules/dom.js';
import { AJAX } from './modules/ajax.js';
//import { Shopify } from './modules/shopify.js'; //@TODO not really remotely ready



class Bones {
  #debug_mode = true;
  #loaded = false;

  Browser;
  Cookie;
  Format;
  AJAX;
  DOM;
  DOMReady;
  Event;
  Config;
  Tracker;
  Track;

  // constants for times in seconds
  DURATION_DAY = 86400;
  DURATION_WEEK = 604800;
  DURATION_MONTH = 18144000;
  DURATION_YEAR = 217728000;

  // languages
  LANG_EN = 'en';
  LANG_FR = 'fr';

  // currency
  CURRENCY_USD = 'usd';
  CURRENCY_GBP = 'gbp';
  CURRENCY_EUR = 'eur';


  constructor() {}

  load(opts) {
    if (this.#loaded) return;

    this.Config = Config;
    this.Config.apply(opts);

    this.Browser = new Browser();
    this.Cookie = new Cookie();
    this.Format = new Format();
    this.AJAX = new AJAX();
    //this.Shopify = new Shopify();

    this.DOM = DOM;
    window[this.Config.get('dom.shortcut')] = this.DOM;

    this.DOMReady = DOMReady;
    this.Event = Event;

    this.Tracker = new Tracker();
    this.Track = opts => {
      return this.Tracker.addOpts(opts);
    };

    this.#loaded = true;
  }

  debug(...v) {
    if (this.#debug_mode) console.log(v);
  }
}



// make ready for the browser
const _e = document.createEvent('Event');
_e.initEvent('BonesReady', true, true);

const $$ = new Bones();
window.$$ = $$;

window.dispatchEvent(_e);
