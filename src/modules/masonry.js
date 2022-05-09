import Scaffold from '../scaffold.js';



class Masonry extends Scaffold {
  name = 'Masonry';
  defaults = {
    cols: 2,
    selector: '.masonry',
  };


  constructor(one, two) {
    super();

    if (typeof one === 'string') this.init(one, two);
    else this.apply(one);
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
