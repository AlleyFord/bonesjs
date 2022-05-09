class Masonry {
  #defaults = {
    cols: 2,
    selector: '.masonry',
  };
  config = {};


  constructor(one, two) {
    if (typeof one === 'string') this.init(one, two);
    else this.apply(one);
  }


  apply(opts) {
    this.opts = {...this.#defaults, ...opts};
  }


  init(sel, opts) {
    if (typeof opts !== 'undefined') this.apply(opts);

    const $s = document.querySelectorAll(sel);

    if (!$s.length) return;

    $s.forEach($p => {
      const heights = Array(this.opts.cols).fill(0);

      $p.querySelectorAll(this.opts.selector).forEach(($e, i) => {
        const order = i % this.cols;

        $e.style.order = order;
        heights[order] += parseFloat($e.clientHeight);
      });

      $p.style.height = Math.max(...heights) + 'px';
    });
  }
}



export default Masonry;
