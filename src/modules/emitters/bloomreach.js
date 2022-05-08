/*
  bloomreach emitter
*/
import { EmitterInterface, T } from './emitter.js';



class Emitter extends EmitterInterface {
  name = 'bloomreach';
  version = '0.0.1';

  STATUS_SUCCESS = 'success';
  STATUS_FAIL = 'fail';

  PURCHASE_STORE_ONLINE = 'online';
  PURCHASE_STORE_OFFLINE = 'offline';


  // what does the actual talking to the pixel
  _call(event, payload) {
    if (!event) return false;
    if (!window.exponea) return false;

    let emitter = window.exponea;

    emitter.track(event, payload);
    Bones.debug(`${this.bonesHandle}:${this.name} called ${event}`, payload);
  }

  _injectPixel() {
    window.exponea = {
      track: (..._) => { console.log('exponea mock pixel called', _); },
    };
  }

  // content viewing
  viewCart(){}
  viewCategory(e) {
    return this._call('view_category', T({
      slug: e.slug,
      category_name: e.collection_title,
      category_id: e.collection_id,
      category_listed_products: e.product_ids,
      category_1: e.category_1, // todo
      category_2: e.category_2, // todo
      category_3: e.category_3, // todo
      categories_path: e.category_path, // todo
      categories_ids: e.category_ids, // todo
      local_currency: e.local_currency || e.currency,
      language: e.lang,
      location: e.url,
      domain: e.domain,
    }));
  }
  viewContent(e) {
    return this._call('view_page', T({
      slug: e.slug,
      page_name: e.page_title,
      page_id: e.page_id,
      language: e.lang,
      location: e.url,
      domain: e.domain,
    }));
  }
  viewProduct(e) {
    return this._call('view_item', T({
      slug: e.slug, // not sure if we can pass this arbitrarily till we get hands on the sdk
      product_id: e.product_id,
      variant_id: e.variant_id,
      title: e.full_product_name || e.product_title,
      brand: e.vendor,
      price: e.price,
      price_local_currency: e.price_in_local_currency,
      discount_percentage: e.discount_percentage,
      discount_value: e.discount_value,
      original_price: e.msrp,
      original_price_local_currency: e.msrp_in_local_currency,
      local_currency: e.local_currency || e.currency,
      stock_level: e.inventory_amount,
      tags: e.tags,
      category_1: e.category_1, // todo
      category_2: e.category_2, // todo
      category_3: e.category_3, // todo
      categories_path: e.category_path, // todo
      category_id: e.category_id, // todo
      categories_ids: e.category_ids, // todo
      language: e.lang,
      location: e.url,
      domain: e.domain,
    }));
  }
  viewRecommendations(){}
  viewReviews(){}
  viewSearchResults(e) {
    return this._call('search', T({
      search_terms: e.search_terms,
      language: e.lang,
      location: e.url,
      domain: e.domain,
    }));
  }


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
  changeCart(e) {
    return this._call('cart_update', T({
      action: 'some action here',
      button_copy: e.button_copy,
      page_type: e.page_type,
      product_id: e.product_id,
      variant_id: e.variant_id,
      title: e.product_title,
      brand: e.vendor,
      price: e.price,
      price_local_currency: e.price_in_local_currency,
      discount_percentage: e.discount_percentage,
      discount_value: e.discount_value,
      original_price: e.msrp,
      original_price_local_currency: e.msrp_in_local_currency,
      product_list: e.products,
      product_ids: e.product_ids,
      total_quantity: e.total_quantity,
      total_price: e.total,
      total_price_without_tax: e.total_without_tax,
      total_price_local_currency: w.total_in_local_currency,
      local_currency: e.local_currency,
      tags: e.tags,
      category_1: e.category_1,
      category_2: e.category_2,
      categories_path: e.category_path,
      category_id: e.category_id,
      categories_ids: e.category_ids,
      variant_list: e.variants,
      variant_ids: e.variant_ids,
      language: e.lang,
      location: e.url,
      domain: e.domain,
    }));
  }
  rateProduct(){}


  // checkout and checkout intent
  beginCheckout(e) {
    e.checkout_step_number = 1;
    e.checkout_step_title = this.CHECKOUT_BEGIN;

    return this.beginCheckoutStep(e);
  }
  cancelOrder(){}
  completeCheckout(e) {
    return this._call('purchase', T({
      purchase_status: this.STATUS_SUCCESS,
      purchase_source_type: this.PURCHASE_STORE_ONLINE,
      purchase_source_name: e.domain,
      product_list: e.products, // todo
      product_ids: e.product_ids, // todo
      total_price: e.total,
      total_price_without_tax: e.total_without_tax,
      total_price_local_currency: e.total_local_currency,
      local_currency: e.local_currency,
      total_quantity: e.total_quantity,
      payment_type: e.payment_type,
      shipping_type: e.shipping_type,
      shipping_company: e.shipping_company,
      shipping_country: e.shipping_country,
      shipping_city: e.shipping_city,
      tax_percentage: e.tax_percentage,
      tax_value: e.tax,
      voucher_code: e.promo_code,
      voucher_percentage: e.promo_percentage,
      voucher_value: e.promo_value,
      variant_list: e.variants, // todo
      variant_ids: e.variant_ids, // todo
      language: e.lang,
      location: e.url,
      domain: e.domain,
    }));
  }
  beginCheckoutStep(e) {
    return this._call('checkout', T({
      step_number: e.checkout_step_number,
      step_title: e.checkout_step_title,
      purchase_source_type: this.PURCHASE_STORE_ONLINE,
      purchase_source_name: e.domain,
      product_list: e.products, // todo
      product_ids: e.product_ids, // todo
      local_currency: e.local_currency,
      total_quantity: e.total_quantity,
      variant_list: e.variants, // todo
      variant_ids: e.variant_ids, // todo
      language: e.lang,
      location: e.url,
      domain: e.domain,
    }));

  }
  completeCheckoutStep(){}

  custom(){}
}



export default Emitter;
