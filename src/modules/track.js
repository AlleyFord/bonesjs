/*
  tracking abstraciton
*/
import { Config } from './config.js';

import Bloomreach from './emitters/bloomreach.js';
import Klaviyo from './emitters/klaviyo.js';
import Pinterest from './emitters/pinterest.js';
import Meta from './emitters/meta.js';
import GoogleAnalytics from './emitters/google-analytics.js';



Config.default({
  'track.bloomreach': false, // fires events to bloomreach
  'track.bloomreach.inject-pixel': false, // injects the pixel automatically

  'track.klaviyo': false,
  'track.klaviyo.api_key': '',
  'track.klaviyo.inject-pixel': false,

  'track.meta': false,
  'track.meta.inject-pixel': false,

  'track.pinterest': false,
  'track.pinterest.inject-pixel': false,

  'track.google-analytics': false,
  'track.google-analytics.inject-pixel': false, // likely handled by shopify
});



// all this should do is eliminate undefined or null values from the payload so we're sending just what's present in the payload stack
function T(trans) {
  let payload = {};

  for (const [k, v] of Object.entries(trans)) {
    if (typeof v !== 'undefined' && v !== null && String(v).trim().length > 0) payload[k] = v;
  }

  return payload;
}



class Tracker {
  bonesHandle = "bones:track";
  #modules = [];
  payload = {};
  opts = {};


  PAGE_TYPE_PRODUCT = 'product';
  PAGE_TYPE_HOMEPAGE = 'homepage';
  PAGE_TYPE_CATEGORY = 'category';
  PAGE_TYPE_PAGE = 'page';
  PAGE_TYPE_CHECKOUT = 'checkout';


  constructor(opts) {
    // boring simple way to load all modules we want to make available
    if (Config.get('track.bloomreach')) this.#modules.push(new Bloomreach());
    if (Config.get('track.klaviyo')) this.#modules.push(new Klaviyo());
    if (Config.get('track.pinterest')) this.#modules.push(new Pinterest());
    if (Config.get('track.meta')) this.#modules.push(new Meta());
    if (Config.get('track.google-analytics')) this.#modules.push(new GoogleAnalytics());

    // iterate and add pixels if need be
    this._call('_injectPixel');

    return this.start(opts);
  }


  /*
  THESE VALUES ARE WHAT TRACK.JS KNOWS HOW TO TRANSLATE.
  This represents the object "e" in the emitter functions to various tracking method.
  Every emitter knows how to translate these standard fields into what their tracker wants

  // core
  @param {Object} opts
  @param {string} opts.url // filled from defaults and window if not set
  @param {string} opts.domain // filled from default config if not set
  @param {string} opts.lang // filled from default config if not set
  @param {string} opts.currency // site currency -- for purchases, set local_currency
  @param {string} [opts.page_title] // filled from defaults and window if not set
  @param {string} [opts.slug]

  // ids
  @param {number} [opts.page_id]
  @param {number} [opts.product_id]
  @param {number} [opts.variant_id]
  @param {number} [opts.collection_id]
  @param {string} [opts.sku]
  @param {string} [opts.gtin]
  @param {number} [opts.category_id]
  @param {number[]} [opts.category_ids]

  // names of things
  @param {string} [opts.author]
  @param {string} [opts.page_title]
  @param {string} [opts.full_product_name]
  @param {string} [opts.product_title]
  @param {string} [opts.variant_title]
  @param {string} [opts.collection_title]
  @param {string[]} [opts.collection_titles]
  @param {string} [opts.category_1]
  @param {string} [opts.category_2]
  @param {string} [opts.category_3]
  @param {string} [opts.category_path] // cat1 > cat2 > cat3, automatically generated

  // pricing/numbers
  @param {number} [opts.price]
  @param {number} [opts.price_in_local_currency]
  @param {number} [opts.discount_percentage] // discount from msrp expressed as a whole number percentage, automatically calculated with msrp and price
  @param {number} [opts.discount_value] // what the discount removed from the price, automatically calculated with msrp and price
  @param {number} [opts.msrp]
  @param {number} [opts.msrp_in_local_currency]
  @param {number} [opts.total]
  @param {number} [opts.subtotal] // automatically calculated
  @param {number} [opts.total_without_tax] // automatically calculated
  @param {number} [opts.total_in_local_currency]
  @param {number} [opts.local_currency]
  @param {number} [opts.total_quantity] // automatically calculated
  @param {number} [opts.shipping]
  @param {number} [opts.tax_percentage] // automatically calculated
  @param {number} [opts.tax]
  @param {number} [opts.promo_percentage] // discount from msrp expressed as a whole number percentage, automatically calculated
  @param {number} [opts.promo_value] // what the promo discounted from price, automatically calculated
  @param {number} [opts.weight]
  @param {string} [opts.weight_units]

  // images
  @param {string} [opts.image_url]

  // checkout extras
  @param {number} [opts.checkout_step_number]
  @param {number} [opts.checkout_step_title]
  @param {string} [opts.payment_type]
  @param {string} [opts.shipping_type]
  @param {string} [opts.shipping_company]
  @param {string} [opts.shipping_country]
  @param {string} [opts.shipping_city]
  @param {string} [opts.promo_code]
  @param {object[]} [opts.variants]
  @param {number[]} [opts.variant_ids] // automatically derived
  @param {object[]} [opts.products]
  @param {number[]} [opts.product_ids] // automatically derived

  // customer stuff
  @param {string} [opts.email]
  @param {string} [opts.first_name]
  @param {string} [opts.last_name]
  @param {string} [opts.avatar] // customer photo
  @param {string} [opts.full_customer_name]
  @param {string} [opts.company_name]

  // extra
  @param {string} [opts.page_type] // set automatically
  @param {string[]} [opts.tags]
  @param {string} [opts.search_terms]
  @param {string} [opts.vendor]
  @param {boolean} [opts.available]
  @param {number} [opts.inventory_amount] // prob never set this
  */
  start(opts) {
    return this.setOpts(opts);
  }
  end() {
    return this.setOpts();
  }

  setOpts(opts) {
    this.payload = opts || {};
    return this;
  }
  addOpts(opts) {
    this.payload = Object.assign(this.opts, opts || {});
    return this;
  }

  iterate(prop, callback) {
    if (this.payload.hasOwnProperty(prop) && Object.keys(this.payload[prop]).length) {
      return this.payload[prop].forEach((item, i, a) => {
        callback(item, i, a);
      });
    }

    return null;
  }

  compileNames() {
    this.payload.product_names = [];

    this.iterate('items', item => {
      this.payload.product_names.push(item.name);
    });

    return this;
  }

  addTotals() {
    this.payload.total = 0;
    this.payload.subtotal = 0;

    this.iterate('items', (item, i) => {
      const line_price = item.price * item.quantity;

      this.payload.total += line_price;
      this.payload.items[i]['line_price'] = line_price;
    });

    return this;
  }

  doNames() {
    this.payload.full_product_name = null;

    if (this.payload.product_title) {
      this.payload.full_product_name = this.payload.product_title;

      if (this.payload.variant_title) {
        this.payload.full_product_name += ` - ${this.payload.variant_title}`;
      }
    }

    return this;
  }

  doPricing() {
    if (this.payload.price) { // may be funky with $0 items
      if (this.payload.msrp) {
        this.payload.discount_value = Math.round(this.payload.msrp - this.payload.price, 2);
        this.payload.discount_percentage = Math.round(((this.payload.msrp - this.payload.price) / this.payload.msrp) * 100, 2);

        // localization todo
        this.payload.msrp_in_local_currency = this.payload.msrp;
      }

      // localization todo
      this.payload.price_in_local_currency = this.payload.price;
    }

    return this;
  }

  formatCurrencies() { // @TODO I don't think this is still relevant. each pixel should format
    ['total', 'subtotal'].forEach(item => {
      if (typeof this.payload[item] !== 'undefined') this.payload[item] = Bones.Format.currency(this.payload[item]);
    });

    this.iterate('items', (item, i) => {
      ['total', 'line_price'].forEach(_item => {
        if (typeof this.payload.items[i][_item] !== 'undefined') this.payload.items[i][_item] = Bones.Format.currency(this.payload.items[i][_item]);
      });
    });

    return this;
  }

  determinePageType() {
    this.payload['page_type'] = this.PAGE_TYPE_PAGE;

    if (this.payload.hasOwnProperty('url') && this.payload.url) {
      if (/\/products/.test(this.payload.url)) this.payload['page_type'] = this.PAGE_TYPE_PRODUCT;
      if (/\/collections/.test(this.payload.url)) this.payload['page_type'] = this.PAGE_TYPE_CATEGORY;
      if (/\/pages/.test(this.payload.url)) this.payload['page_type'] = this.PAGE_TYPE_PAGE;
      if (/^https?:\/\/[^\/]+$/.test(this.payload.url)) this.payload['page_type'] = this.PAGE_TYPE_HOMEPAGE;
    }

    return this;
  }

  formatEmail(v) {
    return String(v).toLowerCase().trim();
  }
  formatPhone(v) {
    v = String(v).replace(/[^0-9\+]/, '').trim();

    if (v.charAt(0) === '+') return v;
    if (v.length === 10) return '+1' + v;
  }

  applyDefaults() {
    // core stuff we want exposed for all calls we can intuit from the env if not explicitly passed already
    if (!this.payload.url) this.payload.url = window.location.href || document.URL;
    if (!this.payload.page_title) this.payload.page_title = document.title || null;

    // apply bones config values to the instance prior to calls
    for (const value of ['domain', 'lang', 'currency']) {
      this.payload[value] = Config.get(value);
    }

    // best practice -- ensure we format email the same every time
    if (this.payload.email) this.payload.email = this.formatEmail(this.payload.email);

    // format all phones to international
    if (this.payload.phone) this.payload.phone = this.formatPhone(this.payload.phone);
  }

  // dispatch to emitters
  _call(event, inlinePayload) {
    this.applyDefaults();

    // ability to call Bones.Track().changeCart({vars: values}) and have it reflect for shit that may pull from DOM and whatnot
    if (inlinePayload) {
      for (const [k, v] of Object.entries(inlinePayload)) {
        this.payload[k] = v;
      }
    }

    this.formatCurrencies();
    this.determinePageType();

    for (const mod of this.#modules) {
      if (typeof mod[event] === 'function') {
        try {
          Bones.debug(`${this.bonesHandle} calling ${event} on ${mod.name}`);
          mod[event](this.payload);
        }
        catch(e) {
          Bones.debug(`${this.bonesHandle} error calling ${event} on ${mod.name}: ${e}`);
        }
      }
    }

    return this;
  }



  /*
  core track behaviors
  */
  viewCart(e) { return this._call('viewCart', e); }
  viewCategory(e) { return this._call('viewCategory', e); } // add category manip to chain
  viewContent(e) { return this._call('viewContent', e); }
  viewProduct(e) {
    return this
      .doNames()
      .doPricing() // add category manip to chain
      ._call('viewProduct', e);
  }
  viewRecommendations(e) { return this._call('viewRecommendations', e); }
  viewReviews(e) { return this._call('viewReviews', e); }
  viewSearchResults(e) { return this._call('viewSearchResults', e); }


  // normal content interaction
  interactWithReviews(e) { return this._call('interactWithReviews', e); }
  listFilter(e) { return this._call('listFilter', e); }
  listSort(e) { return this._call('listSort', e); }
  shareContent(e) { return this._call('shareContent', e); }
  watchVideo(e) { return this._call('watchVideo', e); }


  // generic DOM interaction
  blurElement(e) { return this._call('blurElement', e); }
  focusElement(e) { return this._call('focusElement', e); }


  // non-product form signups and submissions
  askProductQuestion(e) { return this._call('askProductQuestion', e); }
  login(e) { return this._call('login', e); }
  signupAccount(e) { return this._call('signupAccount', e); }
  signupBackInStock(e) { return this._call('signupBackInStock', e); }
  signupLead(e) { return this._call('signupLead', e); }
  submitContactForm(e) { return this._call('submitContactForm', e); }


  // product and cart actions
  changePurchaseFrequency(e) { return this._call('changePurchaseFrequency', e); }
  changeSize(e) { return this._call('changeSize', e); }
  changeQuantity(e) { return this._call('changeQuantity', e); }
  changeVariant(e) { return this._call('changeVariant', e); }
  addToWishlist(e) { return this._call('addToWishList', e); }
  addToCart(e) { return this._call('addToCart', e); }
  changeCart(e) { return this._call('changeCart', e); }
  rateProduct(e) { return this._call('rateProduct', e); }


  // checkout and checkout intent
  beginCheckout(e) {
    this.payload['page_type'] = e['page_type'] = this.PAGE_TYPE_CHECKOUT;

    return this.addTotals() // todo maybe redo this
      .compileNames()
      ._call('beginCheckout', e);
  }
  cancelOrder(e) { return this._call('cancelOrder', e); }
  completeCheckout(e) {
    this.payload['page_type'] = e['page_type'] = this.PAGE_TYPE_CHECKOUT;

    return this._call('completeCheckout', e);
  }
  beginCheckoutStep(e) {
    this.payload['page_type'] = e['page_type'] = this.PAGE_TYPE_CHECKOUT;

    return this._call('beginCheckoutStep', e);
  }
  completeCheckoutStep(e) {
    this.payload['page_type'] = e['page_type'] = this.PAGE_TYPE_CHECKOUT;

    return this._call('completeCheckoutStep', e);
  }

  custom(e) { return this._call('custom', e); }
}



export { T, Tracker };
