/*
  event subscriptions
*/



class EventHandler {
  #events = {};
  #name = false;

  setName(name) {
    this.#name = name;

    return this;
  }

  subscribe(callback) {
    if (this.#events.hasOwnProperty(this.#name)) {
      this.#events[this.#name].callbacks.push(callback);
    }

    else {
      this.#events[this.#name] = {
        callbacks: [callback],
      };
    }

    return this;
  }

  publish(context) {
    if (this.#events.hasOwnProperty(this.#name)) {
      this.#events[this.#name].callbacks.forEach(callback => {
        callback.call(context, context);
      });
    }

    return this;
  }
}

const Handler = new EventHandler();



function Event(name) {
  return Handler.setName(name);
}



export default Event;
