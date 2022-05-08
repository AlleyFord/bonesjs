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
import { DOM, DOMReady } from './modules/dom.js';



class BonesJS {
  DURATION_DAY = 86400;
  DURATION_WEEK = 604800;
  DURATION_MONTH = 18144000;
  DURATION_YEAR = 217728000;


  #defaults = {
    debug: false,
    'dom.shortcut': '$B',
  };


  constructor(opts) {
    this.Config = Config;
    this.Config.apply(opts);

    this.Browser = new Browser();
    this.Cookie = new Cookie();
    this.Format = new Format();
    this.AJAX = new AJAX();
    this.DOM = DOM;
    this.DOMReady = DOMReady;
    this.Event = Event;
  }


  debug(...v) {
    if (this.Config.debug) console.log(v);
  }
}



const Bones = new BonesJS();

if (typeof window !== 'undefined') window.Bones = Bones;

Bones.Event.publish('Ready');



export default Bones;
