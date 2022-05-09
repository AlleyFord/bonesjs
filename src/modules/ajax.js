/*
  vanilla js ajax
*/



import Scaffold from '../scaffold.js';



class AJAX extends Scaffold {
  name = 'AJAX';

  // quick aliases off the main bones obj
  enable(parent) {
    parent.get = (...args) => this.get(...args);
    parent.post = (...args) => this.post(...args);
    parent.put = (...args) => this.put(...args);
  }

  get(url, args) {
    return this._request('get', url, args);
  }

  post(url, args) {
    return this._request('post', url, args);
  }

  put(url, args) {
    return this._request('put', url, args);
  }

  _request(method, url, args = {}) {
    method = method.toLowerCase();

    let body = null;

    // headers
    const headers = {...args.headers || {}};

    if (args.headers) delete args.headers;

    // tweaks to request based on method
    if (method === 'get') {
      if (Object.keys(args).length) {
        url += '?' + new URLSearchParams(args).toString();
      }
    }
    if (['post', 'put'].includes(method)) {
      body = args;
    }

    return fetch(url, {
      method: method,
      mode: 'cors',
      cache: 'no-cache',
      headers: headers,
      redirect: 'follow',
      body: body ? JSON.stringify(body) : null,
    })
    .then(res => {
      const mime = res.headers.get('content-type');
      let body = false;

      if (mime && (
           mime.indexOf('application/json') !== -1
        || mime.indexOf('text/json') !== -1
        || mime.indexOf('application/javascript') !== -1
        || mime.indexOf('text/javascript') !== -1
      )) {
        body = res.json();
      }

      else {
        body = res.text();
      }

      return body;
    });
  }
}



export default AJAX;
