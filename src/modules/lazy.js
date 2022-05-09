import Scaffold from '../scaffold.js';



class Lazy extends Scaffold {
  name = 'Lazy';
  defaults = {
    class: 'lazy',
    class_bg: 'lazy-bg',
    placeholder: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
  };


  init(opts) {
    this.apply(opts);

    const Lazy = new IntersectionObserver((en, ob) => {
      en.forEach(e => {
        if (e.isIntersecting) {
          let img = e.target;

          if (img.classList.contains(this.opts.class_bg)) {
            img.style.backgroundImage = `url(${img.dataset.src})`;
          }
          else {
            img.src = img.dataset.src;
          }

          img.classList.remove(this.opts.class);
          img.classList.remove(this.opts.class_bg);
          Lazy.unobserve(img);
        }
      });
    });

    [].slice.call(document.querySelectorAll(`.${this.opts.class}`)).forEach(e => {
      Lazy.observe(e);
      e.src = this.opts.placeholder;
    });
  }
}



export default Lazy;
