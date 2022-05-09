# BonesJS

A totally not-production-ready, yet-another-jQuery-style-but-vanilla-js library with some added whistles and a few bells. No support for un-cool browsers.


# Install

```
npm i bonesjs
```


# Usage

The global is `Bones`, with the default shorthand of `B`. Everything runs off the monolithic class instance.

This probably shouldn't be used by anyone, ever, for any reason other than pointing and laughing at the author.


## DOM

The default DOM shorthand is `B.$`. The familiar chaning is supported here.

```
B.$(_ => {
    console.log("DOM's ready to play");
});


B.$('div.someclass > p:eq(2)`).css('background-color', '#f00');
```


## Event bus

For some generic, non-node/DOM-based events.

```
B.event('MagicHappened').subscribe(context => {
    console.log('Some magic truly did happen', context);
});

B.event('MagicHappened').publish({data: 'sample', stuff: 'context'})
```


## Cookies

Quick cookie abstraction.

```
B.cookie.set({
    key: 'mycookie',
    value: 'somevalue',
    duration: B.cookie.DURATION_YEAR, // that's a long cookie
});
B.cookie.get('mycookie');
```


## Lazy loading images

Cuz it's a thing for all sites and it's lame having separate libraries when it's a quick fix.

**HTML**
```
<div class="lazy lazy-bg" data-src="/images/canvas.jpg">
    <img class="lazy" data-src="/images/icon.png">
    <h1>Rad section</h1>
</div>
```

**JS**
```
B.lazy.init();
```


## Browser

Query string and history manip.

```
console.log(B.browser.queryString.get('q'));
B.browser.URI.set('#/search');
```


## Masonry

Hey why not!

**HTML**
```
<div class="masonry-container">
    <img class="lazy masonry" data-src="/images/one.png">
    <img class="lazy masonry" data-src="/images/two.png">
    <img class="lazy masonry" data-src="/images/three.png">
</div>
```

**JS**
```
B.masonry.init('.masonry-container');
```


## AJAX

Is saying AJAX still cool now that we've leveled up to web3?

```
B.post('https://api.dev', {
    arg1: true,
    arg2: true,
})
.then(json => {
    console.log(json);
});
```
