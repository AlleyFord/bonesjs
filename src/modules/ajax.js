/*
  vanilla js ajax
*/



import Scaffold from '../scaffold.js';



class AJAX extends Scaffold {
  name = 'AJAX';

  MIME_JSON = 'application/json';
  MIME_JS = 'application/javascript';
  MIME_TXT_JSON = 'text/json';
  MIME_TXT_JS = 'text/javascript';



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
           mime.indexOf(this.MIME_JSON) !== -1
        || mime.indexOf(this.MIME_TXT_JSON) !== -1
        || mime.indexOf(this.MIME_JS) !== -1
        || mime.indexOf(this.MIME_TXT_JS) !== -1
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
