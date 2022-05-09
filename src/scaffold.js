class Scaffold {
  name = '';
  defaults = {};
  opts = {};

  apply(opts) {
    this.opts = {...this.defaults, ...opts};
  }

  init() {}

  enable(parent) {}
}



export default Scaffold;
