/*
  meta emitter
  not production ready
 */
import { EmitterInterface, T } from './emitter.js';



class Emitter extends EmitterInterface {
  name = 'meta';
  version = '0.0.1';

  // what does the actual talking to the pixel
  _call(event, dimension, payload){}

  _injectPixel(){}

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



export default Emitter;
