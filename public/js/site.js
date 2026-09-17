/* Gizmoz — progressive enhancement only.
   Every form works without this file; it just makes them nicer. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- */
  /* Mobile navigation                                                 */
  /* ---------------------------------------------------------------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------------------------------------------------------------- */
  /* Product gallery                                                   */
  /* ---------------------------------------------------------------- */

  var mainImg = document.getElementById('gallery-main-img');
  if (mainImg) {
    document.querySelectorAll('.thumb').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        mainImg.src = thumb.dataset.full;
        document.querySelectorAll('.thumb').forEach(function (t) {
          t.classList.toggle('is-active', t === thumb);
        });
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Basket — stored per browser, never sent anywhere until submitted  */
  /* ---------------------------------------------------------------- */

  var KEY = 'gizmoz.cart.v1';

  function readCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(raw) ? raw.filter(function (i) { return i && i.slug; }) : [];
    } catch (err) {
      return [];
    }
  }

  function writeCart(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (err) {
      /* Private mode or storage full — the page still works, the basket
         just won't survive a reload. */
    }
    paintCount(items);
  }

  function paintCount(items) {
    var count = items.reduce(function (n, i) { return n + (i.qty || 1); }, 0);
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = String(count);
      el.hidden = count === 0;
    });
  }

  function money(n) {
    return '$' + Number(n).toLocaleString('en-AU');
  }

  paintCount(readCart());

  document.querySelectorAll('[data-add-to-cart]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var items = readCart();
      var existing = items.find(function (i) { return i.slug === btn.dataset.slug; });
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        items.push({
          slug: btn.dataset.slug,
          name: btn.dataset.name,
          price: Number(btn.dataset.price),
          image: btn.dataset.image,
          qty: 1,
        });
      }
      writeCart(items);
      var original = btn.textContent;
      btn.textContent = 'Added to basket ✓';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
      }, 1400);
    });
  });

  /* ---------------------------------------------------------------- */
  /* Basket page                                                       */
  /* ---------------------------------------------------------------- */

  var cartHost = document.querySelector('[data-cart-items]');
  if (cartHost) {
    var totalEl = document.querySelector('[data-cart-total]');
    var cartForm = document.querySelector('[data-cart-form]');
    var payload = document.querySelector('[data-cart-payload]');

    var renderCart = function () {
      var items = readCart();

      if (!items.length) {
        cartHost.innerHTML =
          '<p class="cart-empty">Your basket is empty. <a href="/shop">Have a look at the store →</a></p>';
        if (totalEl) totalEl.textContent = money(0);
        if (cartForm) cartForm.hidden = true;
        paintCount(items);
        return;
      }

      cartHost.innerHTML = items
        .map(function (i, idx) {
          return (
            '<div class="cart-row">' +
            '<img src="' + i.image + '" alt="">' +
            '<div><h3>' + i.name + '</h3>' +
            '<p class="line-price">' + money(i.price) + ' each · ' + money(i.price * i.qty) + ' total</p>' +
            '<button class="remove-btn" type="button" data-remove="' + idx + '">Remove</button></div>' +
            '<div class="cart-controls">' +
            '<button class="qty-btn" type="button" data-step="-1" data-idx="' + idx + '" aria-label="Decrease quantity">−</button>' +
            '<span class="qty-val">' + i.qty + '</span>' +
            '<button class="qty-btn" type="button" data-step="1" data-idx="' + idx + '" aria-label="Increase quantity">+</button>' +
            '</div></div>'
          );
        })
        .join('');

      var total = items.reduce(function (n, i) { return n + i.price * i.qty; }, 0);
      if (totalEl) totalEl.textContent = money(total);
      if (cartForm) cartForm.hidden = false;
      if (payload) {
        payload.value = JSON.stringify(
          items.map(function (i) { return { slug: i.slug, qty: i.qty }; })
        );
      }
      paintCount(items);
    };

    cartHost.addEventListener('click', function (event) {
      var step = event.target.closest('[data-step]');
      var remove = event.target.closest('[data-remove]');
      var items = readCart();

      if (step) {
        var i = Number(step.dataset.idx);
        if (!items[i]) return;
        items[i].qty = Math.max(1, Math.min(20, items[i].qty + Number(step.dataset.step)));
      } else if (remove) {
        items.splice(Number(remove.dataset.remove), 1);
      } else {
        return;
      }

      writeCart(items);
      renderCart();
    });

    renderCart();
  }

  /* ---------------------------------------------------------------- */
  /* Forms — submit over fetch, fall back to a normal POST             */
  /* ---------------------------------------------------------------- */

  document.querySelectorAll('[data-ajax-form]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (event) {
      if (!window.fetch) return; // let the browser post it the old way

      event.preventDefault();
      var label = submit ? submit.textContent : '';
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Sending…';
      }
      if (status) status.hidden = true;

      // URLSearchParams, not FormData: FormData would be sent as
      // multipart/form-data, which the server's urlencoded parser ignores.
      // Repeated names (checkbox groups) survive this conversion intact.
      fetch(form.action, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: new URLSearchParams(new FormData(form)).toString(),
      })
        .then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (result) {
          if (!result.ok || !result.data.ok) {
            throw new Error(result.data.message || 'Something went wrong. Please try again.');
          }
          if (form.hasAttribute('data-cart-form')) {
            try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
          }
          var kind = form.action.split('/').pop();
          window.location.href = '/thanks/' + kind;
        })
        .catch(function (err) {
          if (submit) {
            submit.disabled = false;
            submit.textContent = label;
          }
          if (status) {
            status.textContent = err.message;
            status.className = 'form-status is-error';
            status.hidden = false;
            status.scrollIntoView({ block: 'center', behavior: 'smooth' });
          } else {
            form.submit();
          }
        });
    });
  });
})();
