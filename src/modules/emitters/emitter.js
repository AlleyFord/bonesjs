/*
  default emitter "interface"
 */
import { T } from '../track.js';
import { Config } from '../config.js';



class EmitterInterface {
  bonesHandle = "bones:track:emitter";
  name;
  version = '0.0.1';
  Config;


  CHECKOUT_BEGIN = 'Start';


  constructor() {
    this.Config = Config;
  }


  // what does the actual talking to the pixel
  _call(event, dimension, payload){}

  _injectPixel(){}

  _scriptTag(opts) {
    let script = document.createElement('script');

    script.type = 'application/javascript';

    for (const i in opts) {
      script[i] = opts[i];
    }

    return script;
  }

  _injectEnd(node) {
    document.body.appendChild(node);
  }

  // if we need to gen a random id for the event
  _uniqueId(prefix) {
    return (prefix || "") + String(Math.ceil(new Date().getTime() * 1000 * Math.random()));
  }


  /*
    naming convention = OOP JAVA from 2001
    also, verb -> thing
  */


  // content viewing
  viewCart(){}
  viewCategory(){}
  viewContent(){}
  viewProduct(){}
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
  changePurchaseFrequency(){}
  changeSize(){}
  changeQuantity(){}
  changeVariant(){}
  addToWishlist(){}
  addToCart(){}
  changeCart(){}
  rateProduct(){}


  // checkout and checkout intent
  beginCheckout(){}
  cancelOrder(){}
  completeCheckout(){}
  beginCheckoutStep(){}
  completeCheckoutStep(){}

  custom(){}
}



export { EmitterInterface, T };
