/*
  klaviyo emitter
  quasi-production ready
*/
import { EmitterInterface, T } from './emitter.js';



class Emitter extends EmitterInterface {
  name = 'klaviyo';
  version = '0.0.1';

  _call(event, dimension, payload) {
    if (!event) return false;

    let _learnq = window._learnq || [];
    let obj = [];

    if (dimension && typeof dimension === 'string') {
      obj = [event, dimension, payload];
    }
    else {
      payload = dimension;
      obj = [event, payload];
    }

    _learnq.push(obj);
    Bones.debug(`${this.bonesHandle}:${this.name} called ${event}`, dimension, payload);
  }

  _injectPixel() {
    this._injectEnd(
      this._scriptTag({
        async: 'async',
        src: `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${this.Config.get('track.klaviyo.api_key')}`
      })
    );
  }

  // content viewing
  viewCart(){}
  viewCategory(){}
  viewContent(){}
  viewProduct(e) {
    this._call('track', 'Viewed Product', T({
      'ProductName': e.name,
      'ProductID': e.id,
      'SKU': e.sku,
      'Categories': e.categories,
      'ImageURL': e.image_url,
      'URL': e.url,
      'Brand': e.brand,
      'Price': e.price,
      'CompareAtPrice': e.msrp,
    }));
    this._call('trackViewedItem', T({
      'Title': e.name,
      'ItemId': e.id,
      'Categories': e.categories,
      'ImageUrl': e.image_url,
      'Url': e.url,
      'Metadata': {
        'Brand': e.brand,
        'Price': e.price,
        'CompareAtPrice': e.msrp,
      }
    }));
  }
  viewRecommendations(){}
  viewReviews(){}
  viewSearchResults(){}


  // normal content interaction
  interactWithReviews(){}
  listFilter(){}
  listSort(){}
  shareContent(){}
  watchVideo(){}


  // generic DOM interaction
  blurElement(){}
  focusElement(){}


  // non-product form signups and submissions
  askProductQuestion(){}
  login(){}
  signupAccount(){}
  signupBackInStock(){}
  signupLead(){}
  submitContactForm(){}


  // product and cart actions
  addToCart(e) {
    this._call('track', 'Added to Cart', T({
      'ProductName': e.name,
      'ProductID': e.id,
      'SKU': e.sku,
      'Categories': e.categories,
      'ImageURL': e.image_url,
      'URL': e.url,
      'Brand': e.brand,
      'Price': e.price,
      'CompareAtPrice': e.msrp,
    }));
  }
  changePurchaseFrequency(){}
  changeSize(){}
  changeQuantity(){}
  changeVariant(){}
  addToWishlist(){}
  changeCart(){}
  rateProduct(){}


  // checkout and checkout intent
  beginCheckout(e) {
    this._call('track', 'Started Checkout', T({
      '$event_id': this._uniqueId(),
      '$value': e.total,
      'ItemNames': e.product_names,
      'CheckoutURL': e.checkout_url,
    }));
  }
  cancelOrder(){}
  completeCheckout(){}
  beginCheckoutStep(){}
  completeCheckoutStep(){}

  custom(){}
}



export default Emitter;
