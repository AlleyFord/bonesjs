/*
  vanilla js ajax
  quasi-production ready
*/
class AJAX {
  get(url, args) {
    return this._request('get', url, args);
  }

  post(url, args) {
    return this._request('post', url, args);
  }

  put(url, args) {
    return this._request('put', url, args);
  }

  async _request(method, url, args = {}) {
    const head = new Headers();
    let body = null;

    // headers
    const hk = Object.keys(args.headers || {});

    hk.forEach((v, k) => {
      head.append(k, v);
    });

    if (args.headers) delete args.headers;

    // tweaks to request based on method
    if (method === 'get') {
      if (Object.keys(args).length) {
        url += '?' . URLSearchParams(args).toString();
      }
    }
    if (method === 'post') {
      body = args;
    }

    const req = new Request(url, {
      method: method,
      headers: head,
      body: body,
    });

    return await fetch(req)
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



export { AJAX };
