/*
  event subscriptions
*/



import Scaffold from '../scaffold.js';



class EventHandler extends Scaffold {
  name = 'EventHandler';

  #events = {};
  #name = false;
  #counter = 0;

  init(...names) {
    this.#name = names;
    return this;
  }

  debug() {
    console.log(this.#events);
  }

  isMulti() {
    return this.#name.length > 1;
  }

  #fn(fn, opts, id) {
    return {
      fn: fn,
      opts: opts,
      id: id,
      dependents: [],
    };
  }

  #new(name, stack, calls) {
    this.#counter++;

    this.#events[name] = {
      stack: stack,
      published: parseInt(calls),
      last_context: null,
    };
  }

  #call(fn, context, opts, id) {
    fn.call(context, context);

    if (opts && this.#hasOpt(opts, 'runOnce')) {
      for (const name of Object.keys(this.#events)) {
        this.#events[name].stack.filter(callback => {
          if (callback.dependents.length) {
            return this.hasPublishedMulti(callback.dependents);
          }

          return callback.id !== id;
        });
      }
    }
  }

  #hasOpt(opts, v) {
    return opts.hasOwnProperty(v) && opts[v];
  }

  addPublishedDependents(id, dependents) {
    for (const name of Object.keys(this.#events)) {
      for (let i = 0; i < this.#events[name].stack.length; i++) {
        // performance? don't dupe the work on subsequent calls of a mutli-event subscription
        if (this.#events[name].stack[i].dependents.length > 0) continue;

        if (this.#events[name].stack[i].id === id) {
          this.#events[name].stack[i].dependents = dependents;
        }
      }
    }
  }

  subscribe(callback, opts) {
    const id = 'fn' + this.#counter + performance.now() + (Math.random() * 100000);

    callback = this.#fn(callback, opts, id);

    for (const name of this.#name) {
      if (this.#events.hasOwnProperty(name)) {
        this.#events[name].stack.push(callback);
      }

      else {
        this.#new(name, [callback], 0);
      }

      if (opts) {
        // require one event to have been published in order to run (cascade)
        if (this.#hasOpt(opts, 'runIfPublished') && this.hasPublished(name)) {
          this.#call(callback.fn, this.#events[name].last_context, callback.opts, callback.id);
        }

        // require any multi event to all have been published in order to run
        if (this.isMulti() && this.#hasOpt(opts, 'requireBothPublished')) {
          this.addPublishedDependents(id, this.#name);

          if (this.hasPublishedMulti()) {
            this.#call(callback.fn, this.#events[name].last_context, callback.opts, callback.id);
          }
        }
      }
    }

    return this;
  }

  hasPublished(name) {
    if (this.#events.hasOwnProperty(name)) {
      return this.#events[name].published > 0 ? 1 : 0;
    }

    return 0;
  }
  hasPublishedMulti(names) {
    names = (typeof names !== 'undefined') ? names : this.#name;

    let conds = [];

    for (const name of names) {
      conds.push(this.hasPublished(name));
    }

    return names.length === conds.reduce((p, c) => p + c);
  }

  publish(context) {
    for (const name of this.#name) {
      if (this.#events.hasOwnProperty(name)) {
        this.#events[name].stack.forEach(callback => {
          this.#events[name].published++;

          this.#call(callback.fn, context, callback.opts, callback.id);
        });
      }

      else {
        this.#new(name, [], 1);
      }

      this.#events[name].last_context = context;
    }

    return this;
  }
}

const Handler = new EventHandler();



function Event(...name) {
  // allow extending
  if (typeof name === 'undefined') return Handler.prototype;

  return Handler.init(...name);
}



export default Event;
