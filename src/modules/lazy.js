import Scaffold from '../scaffold.js';



class Lazy extends Scaffold {
  name = 'Lazy';

  breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  defaults = {
    class: 'lazy',
    class_bg: 'lazy-bg',
    placeholder: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
    sizes: [],
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

    [].slice.call(document.querySelectorAll(`.${this.opts.class},.${this.opts.class_bg}`)).forEach(e => {
      Lazy.observe(e);

      if (e.classList.contains(this.opts.class_bg)) {
        e.style.backgroundImage = `url(${this.opts.placeholder})`;
      }
      else {
        e.src = this.opts.placeholder;
      }
    });
  }
}



export default Lazy;
