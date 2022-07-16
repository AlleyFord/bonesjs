class Scaffold {
  name = '';
  defaults = {};
  opts = {};

  // constants
  //...

  apply(opts) {
    this.opts = {...this.defaults, ...opts};
  }

  init() {}

  enable(parent) {}
}



export default Scaffold;
