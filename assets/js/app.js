/* ==========================================================================
   Afran Design Studio — site script
   Loads the JSON content edited in Pages CMS (content/*.json) and renders it.
   Shared chrome (header, side-panel menu, footer) is defined here once.
   ========================================================================== */
(function () {
  "use strict";

  // ---------- Static site structure (rarely changes; edit here, not in the CMS) ----------
  var NAV = [
    { href: "projects.html", label: "پروژه‌ها", note: "projects", page: ["projects", "project"] },
    { href: "studio.html", label: "استودیو", note: "درباره ما", page: ["studio"] },
    { href: "team.html", label: "تیم افران", note: "افراد", page: ["team"] },
    { href: "contact.html", label: "تماس", note: "شروع گفت‌وگو", page: ["contact"] }
  ];
  var LOGO_BLOCKS =
    '<rect class="b-g" x="0" y="0" width="62" height="72"/>' +
    '<rect class="b-w" x="117" y="0" width="122" height="72"/>' +
    '<rect class="b-w" x="0" y="93" width="152" height="70"/>' +
    '<rect class="b-w" x="0" y="184" width="95" height="73"/>' +
    '<rect class="b-g" x="152" y="184" width="87" height="73"/>';
  var GLYPHS = [ // small two-block marks for the approach items
    [[34, 0, 14, 14], [0, 0, 28, 40]], [[0, 0, 14, 14], [0, 20, 48, 20]],
    [[34, 26, 14, 14], [0, 0, 48, 20]], [[0, 26, 14, 14], [20, 0, 28, 40]]
  ];

  // ---------- Helpers ----------
  var page = document.body.getAttribute("data-page");
  var cache = {};

  function loadJSON(path) {
    if (!cache[path]) {
      cache[path] = fetch(path, { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error(path + " → " + r.status);
        return r.json();
      });
    }
    return cache[path];
  }

  function fa(value) {
    return String(value).replace(/\d/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; });
  }

  function get(obj, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }

  function safeUrl(url) {
    url = String(url || "").trim();
    return /^(javascript|data|vbscript):/i.test(url.replace(/[\s\u0000-\u001f]/g, "")) ? "#" : url;
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === "text") node.textContent = v;
        else if (k === "html") node.innerHTML = v; // static markup only, never content
        else if (k === "class") node.className = v;
        else if (k === "href" || k === "src") node.setAttribute(k, safeUrl(v));
        else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function paragraphs(text, className) {
    return String(text || "").split(/\n\s*\n/).map(function (t) { return t.trim(); })
      .filter(Boolean).map(function (t) { return el("p", { class: className, text: t }); });
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

  function logoSvg(extraClass) {
    var s = '<svg viewBox="0 0 239 257" aria-hidden="true" focusable="false"' +
      (extraClass ? ' class="' + extraClass + '"' : "") + ">" + LOGO_BLOCKS + "</svg>";
    return s;
  }

  function whatsappUrl(number) { return "https://wa.me/" + String(number || "").replace(/\D/g, ""); }

  function persianYear() {
    try { return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" }).format(new Date()).replace(/[^۰-۹]/g, ""); }
    catch (e) { return "۱۴۰۵"; }
  }

  // Fill [data-text], [data-src], [data-alt], [data-paras] inside root from data.
  function bind(root, data) {
    root.querySelectorAll("[data-text]").forEach(function (n) {
      var v = get(data, n.getAttribute("data-text"));
      if (v != null) n.textContent = n.hasAttribute("data-quote") ? "«" + v + "»" : v;
    });
    root.querySelectorAll("[data-src]").forEach(function (n) {
      var v = get(data, n.getAttribute("data-src"));
      if (v) n.setAttribute("src", safeUrl(v));
    });
    root.querySelectorAll("[data-alt]").forEach(function (n) {
      var v = get(data, n.getAttribute("data-alt"));
      n.setAttribute("alt", v || "");
    });
    root.querySelectorAll("[data-paras]").forEach(function (n) {
      clear(n);
      paragraphs(get(data, n.getAttribute("data-paras")), n.getAttribute("data-paras-class"))
        .forEach(function (p) { n.appendChild(p); });
    });
  }

  function serviceTitle(site, id) {
    var s = (site.services || []).filter(function (x) { return x.id === id; })[0];
    return s ? s.title : "";
  }

  // ---------- Header & side-panel menu ----------
  function renderHeader(site, projects) {
    var slot = document.querySelector("[data-header]");
    if (!slot) return;
    var over = slot.getAttribute("data-header") === "over";

    // RTL: the menu button comes first (right edge), the logo second (left edge).
    var header = el("header", { class: "site-header" + (over ? " site-header--over" : "") }, [
      el("button", { class: "menu-toggle", type: "button", "aria-expanded": "false", "aria-controls": "site-menu",
        html: '<span class="menu-toggle__bars" aria-hidden="true"><span></span><span></span></span><span class="menu-toggle__label">منو</span>' }),
      el("a", { class: "logo" + (over ? "" : " logo--light"), href: "index.html", "aria-label": "استودیو طراحی افران، صفحه اصلی",
        html: logoSvg() + '<span class="logo__word"><span class="logo__name">AFRAN</span><span class="logo__line"></span><span class="logo__sub">DESIGN STUDIO</span></span>' })
    ]);
    slot.replaceWith(header);

    var count = (projects && projects.projects) ? projects.projects.length : 0;
    var c = site.contact || {};
    var nav = el("nav", { class: "menu__nav", "aria-label": "منوی اصلی" }, NAV.map(function (item, i) {
      var current = item.page.indexOf(page) !== -1;
      return el("a", { class: "menu__link", href: item.href, "aria-current": current ? "page" : null }, [
        el("span", { class: "menu__link-main" }, [
          el("span", { class: "dot" + (i === 1 || i === 2 ? " dot--graphite" : "") }),
          el("span", { class: "menu__link-label", text: item.label })
        ]),
        el("span", { class: "menu__link-note", text: item.note === "projects" ? fa(count) + " پروژه" : item.note })
      ]);
    }));

    var panel = el("div", { class: "menu__panel", role: "dialog", "aria-modal": "true", "aria-label": "منو" }, [
      el("div", { class: "menu__top" }, [
        el("button", { class: "menu__close", type: "button",
          html: '<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3l14 14M17 3L3 17" stroke="currentColor" stroke-width="1.2" fill="none"/></svg> بستن' }),
        el("a", { class: "logo logo--light", href: "index.html", "aria-label": "صفحه اصلی",
          html: logoSvg() + '<span class="logo__word"><span class="logo__name">AFRAN</span><span class="logo__line"></span><span class="logo__sub">DESIGN STUDIO</span></span>' })
      ]),
      nav,
      el("div", { class: "menu__contact" }, [
        c.address ? el("span", { text: c.address }) : null,
        el("div", { class: "menu__contact-links" }, [
          c.email ? el("a", { href: "mailto:" + c.email, text: c.email }) : null,
          c.phone ? el("a", { href: "tel:" + c.phone, dir: "ltr", text: c.phone_display || c.phone }) : null,
          c.whatsapp ? el("a", { href: whatsappUrl(c.whatsapp), target: "_blank", rel: "noopener", text: "واتس‌اپ ↗" }) : null,
          c.instagram ? el("a", { href: c.instagram, target: "_blank", rel: "noopener", text: "اینستاگرام ↗" }) : null
        ])
      ])
    ]);
    var overlay = el("button", { class: "menu__overlay", type: "button", tabindex: "-1", "aria-label": "بستن منو" });
    var menu = el("div", { class: "menu", id: "site-menu" }, [overlay, panel]);
    document.body.appendChild(menu);

    var toggle = header.querySelector(".menu-toggle");
    var closeBtn = panel.querySelector(".menu__close");

    function open() {
      menu.classList.add("is-open");
      document.body.classList.add("menu-open");
      toggle.setAttribute("aria-expanded", "true");
      setTimeout(function () { closeBtn.focus(); }, 50);
    }
    function close() {
      menu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
    toggle.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);
    menu.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      var f = panel.querySelectorAll("a, button");
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    });
  }

  // ---------- Footer ----------
  function renderFooter(site) {
    var slot = document.querySelector("[data-footer]");
    if (!slot) return;
    var c = site.contact || {};
    var footer = el("footer", { class: "site-footer" }, [
      el("div", { class: "container site-footer__inner" }, [
        el("div", { class: "site-footer__cols" }, [
          el("div", { class: "footer-brand" }, [
            el("img", { src: "assets/images/site/logo-white.svg", alt: "استودیو طراحی و معماری افران", width: "240", height: "377" })
          ]),
          el("div", { class: "footer-col" }, [
            el("span", { class: "footer-col__title", text: "استودیو" }),
            el("span", { class: "pre-line", text: c.address || "" })
          ]),
          el("div", { class: "footer-col" }, [
            el("span", { class: "footer-col__title", text: "تماس" }),
            c.email ? el("a", { href: "mailto:" + c.email, text: c.email }) : null,
            c.phone ? el("a", { href: "tel:" + c.phone, dir: "ltr", style: "text-align:right", text: c.phone_display || c.phone }) : null,
            c.whatsapp ? el("a", { href: whatsappUrl(c.whatsapp), target: "_blank", rel: "noopener", text: "واتس‌اپ ↗" }) : null
          ]),
          el("div", { class: "footer-col" }, [
            el("span", { class: "footer-col__title", text: "دنبال کنید" }),
            c.instagram ? el("a", { href: c.instagram, target: "_blank", rel: "noopener", text: "اینستاگرام" }) : null,
            c.linkedin ? el("a", { href: c.linkedin, target: "_blank", rel: "noopener", text: "لینکدین" }) : null
          ])
        ]),
        el("div", { class: "site-footer__bottom" }, [
          el("nav", { "aria-label": "منوی پانویس" }, NAV.map(function (n) { return el("a", { href: n.href, text: n.label }); })),
          el("span", { text: "© " + persianYear() + " استودیو طراحی افران" }),
          el("a", { href: "#main", text: "بازگشت به بالا ↑" })
        ])
      ])
    ]);
    slot.replaceWith(footer);
  }

  // ---------- Shared pieces ----------
  function projectUrl(p) { return "project.html?p=" + encodeURIComponent(p.slug); }

  function card(p, site, wide) {
    return el("a", { class: "card" + (wide ? " card--wide" : ""), href: projectUrl(p) }, [
      el("span", { class: "card__media" }, [
        el("img", { src: p.cover, alt: p.cover_alt || p.title, loading: "lazy", decoding: "async" }),
        el("span", { class: "card__tag" }, [el("span", { class: "dot" }), serviceTitle(site, p.category)])
      ]),
      el("span", { class: "card__meta" }, [
        el("span", null, [
          el("span", { class: "card__title", text: p.title }),
          el("span", { class: "card__place", text: p.location })
        ]),
        signature(p.category)
      ])
    ]);
  }

  // The logo's five blocks in a per-category arrangement; on hover they snap back into the logo (CSS).
  function signature(category) {
    return el("span", { class: "sig sig--" + (category || "none"), "aria-hidden": "true" },
      ["b1", "b2", "b3", "b4", "b5"].map(function (b) { return el("i", { class: b }); }));
  }

  // Filter chips: "all" + one per service. onChange(id) is called with the chosen id.
  function renderChips(container, site, projects, current, onChange) {
    clear(container);
    var options = [{ id: "all", title: "همه" }].concat(site.services || []);
    options.forEach(function (s) {
      var n = s.id === "all" ? projects.length : projects.filter(function (p) { return p.category === s.id; }).length;
      container.appendChild(el("button", {
        class: "chip", type: "button", "aria-pressed": String(s.id === current),
        onclick: function () { onChange(s.id); }
      }, [s.title, el("span", { class: "chip__count", text: fa(n) })]));
    });
  }

  function renderServices(list, site, linked) {
    clear(list);
    (site.services || []).forEach(function (s, i) {
      list.appendChild(el(linked ? "a" : "div", { class: "service", href: linked ? "projects.html?c=" + encodeURIComponent(s.id) : null }, [
        el("span", { class: "service__num", text: fa(i + 1) }),
        el("span", { class: "service__title", text: s.title }),
        el("span", { class: "service__text", text: s.text }),
        linked ? el("span", { class: "arrow", "aria-hidden": "true", text: "⟵" }) : null
      ]));
    });
  }

  // ---------- Pages ----------
  var pages = {};

  pages.home = function (site, projectsData) {
    return loadJSON("content/home.json").then(function (home) {
      bind(document, home);
      var all = projectsData.projects || [];
      var filter = "all";
      var chips = document.getElementById("home-filters");
      var grid = document.getElementById("home-cards");
      var count = document.getElementById("home-count");

      function draw() {
        var list;
        if (filter === "all") {
          list = all.filter(function (p) { return p.featured; });
          if (!list.length) list = all;
          list = list.slice(0, 3);
        } else {
          list = all.filter(function (p) { return p.category === filter; });
        }
        renderChips(chips, site, all, filter, function (id) { filter = id; draw(); });
        clear(grid);
        list.forEach(function (p) { grid.appendChild(card(p, site)); });
        if (!list.length) grid.appendChild(el("p", { class: "empty", text: "پروژه‌ای در این دسته نیست." }));
        count.textContent = "(" + fa(list.length) + ")";
      }
      draw();

      var principles = document.getElementById("principles");
      clear(principles);
      ((home.approach && home.approach.items) || []).forEach(function (item, i) {
        var g = GLYPHS[i % GLYPHS.length];
        principles.appendChild(el("div", { class: "principle" }, [
          el("span", { html: '<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="' + g[0][0] + '" y="' + g[0][1] + '" width="' + g[0][2] + '" height="' + g[0][3] + '" fill="#9DB387"/><rect x="' + g[1][0] + '" y="' + g[1][1] + '" width="' + g[1][2] + '" height="' + g[1][3] + '" fill="#F2F0EB"/></svg>' }),
          el("span", { class: "principle__num", text: fa(i + 1) }),
          el("h3", { class: "principle__title", text: item.title }),
          el("p", { class: "principle__text", text: item.text })
        ]));
      });

      renderServices(document.getElementById("services-list"), site, true);
    });
  };

  pages.projects = function (site, projectsData) {
    bind(document, projectsData);
    var all = projectsData.projects || [];
    var params = new URLSearchParams(location.search);
    var valid = (site.services || []).map(function (s) { return s.id; });
    var filter = valid.indexOf(params.get("c")) !== -1 ? params.get("c") : "all";
    var view = params.get("view") === "list" ? "list" : "grid";
    var chips = document.getElementById("project-filters");
    var works = document.getElementById("works");
    var gridBtn = document.getElementById("view-grid");
    var listBtn = document.getElementById("view-list");
    document.getElementById("projects-count").textContent = fa(all.length);

    function syncUrl() {
      var q = new URLSearchParams();
      if (filter !== "all") q.set("c", filter);
      if (view === "list") q.set("view", "list");
      var s = q.toString();
      history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
    }

    function draw() {
      var list = all.filter(function (p) { return filter === "all" || p.category === filter; });
      renderChips(chips, site, all, filter, function (id) { filter = id; syncUrl(); draw(); });
      gridBtn.setAttribute("aria-pressed", String(view === "grid"));
      listBtn.setAttribute("aria-pressed", String(view === "list"));
      clear(works);
      if (!list.length) { works.className = "works"; works.appendChild(el("p", { class: "empty", text: "پروژه‌ای در این دسته نیست." })); return; }
      if (view === "grid") {
        works.className = "works works--grid";
        list.forEach(function (p, i) { works.appendChild(card(p, site, i % 4 === 0 || i % 4 === 3)); });
      } else {
        works.className = "works-list";
        works.appendChild(el("div", { class: "works-list__head", "aria-hidden": "true" }, [
          el("span", { class: "col-num", text: "شماره" }), el("span", { class: "col-title", text: "پروژه" }),
          el("span", { class: "col-meta", text: "موقعیت" }), el("span", { class: "col-meta", text: "خدمت" }), el("span", { class: "col-img" })
        ]));
        list.forEach(function (p) {
          works.appendChild(el("a", { class: "row", href: projectUrl(p) }, [
            el("span", { class: "row__num", text: fa(all.indexOf(p) + 1) }),
            el("span", { class: "row__title", text: p.title }),
            el("span", { class: "row__meta", text: p.location }),
            el("span", { class: "row__meta", text: serviceTitle(site, p.category) }),
            el("img", { src: p.cover, alt: "", loading: "lazy" })
          ]));
        });
      }
    }
    gridBtn.addEventListener("click", function () { view = "grid"; syncUrl(); draw(); });
    listBtn.addEventListener("click", function () { view = "list"; syncUrl(); draw(); });
    draw();
    return Promise.resolve();
  };

  pages.project = function (site, projectsData) {
    var all = projectsData.projects || [];
    var slug = new URLSearchParams(location.search).get("p");
    var index = all.map(function (p) { return p.slug; }).indexOf(slug);
    if (index === -1) {
      if (!all.length) return Promise.resolve();
      if (slug) { // unknown project → back to the index
        location.replace("projects.html");
        return Promise.resolve();
      }
      index = 0;
    }
    var p = all[index];
    document.title = p.title + " — استودیو افران";
    bind(document, p);

    var facts = document.getElementById("facts");
    clear(facts);
    (p.facts || []).forEach(function (f) {
      facts.appendChild(el("div", null, [el("dt", { text: f.label }), el("dd", { text: f.value })]));
    });

    // Slideshow
    var slides = (p.gallery || []).filter(function (g) { return g.image; });
    var show = document.getElementById("slideshow");
    if (!slides.length) { show.hidden = true; }
    else {
      var stage = show.querySelector(".slideshow__stage");
      var bars = show.querySelector(".slideshow__bars");
      var caption = show.querySelector(".slideshow__caption");
      var countNow = show.querySelector("[data-now]");
      var countAll = show.querySelector("[data-all]");
      var imgs = slides.map(function (g, i) {
        var img = el("img", { src: g.image, alt: g.alt || g.caption || p.title, loading: i ? "lazy" : null });
        stage.insertBefore(img, stage.firstChild);
        bars.appendChild(el("span"));
        return img;
      });
      var cur = 0;
      var go = function (n) {
        cur = (n + slides.length) % slides.length;
        imgs.forEach(function (img, i) { img.classList.toggle("is-active", i === cur); });
        Array.prototype.forEach.call(bars.children, function (b, i) { b.classList.toggle("is-active", i === cur); });
        caption.textContent = fa(cur + 1) + " — " + (slides[cur].caption || "");
        countNow.textContent = fa(cur + 1);
      };
      countAll.textContent = fa(slides.length);
      show.querySelectorAll("[data-prev]").forEach(function (b) { b.addEventListener("click", function () { go(cur - 1); }); });
      show.querySelectorAll("[data-next]").forEach(function (b) { b.addEventListener("click", function () { go(cur + 1); }); });
      stage.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") go(cur + 1);
        if (e.key === "ArrowRight") go(cur - 1);
      });
      var startX = null;
      stage.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
      stage.addEventListener("touchend", function (e) {
        if (startX == null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) go(dx < 0 ? cur - 1 : cur + 1);
        startX = null;
      });
      if (slides.length < 2) show.querySelector(".slideshow__controls").hidden = true;
      go(0);
    }

    var quote = document.getElementById("project-quote");
    quote.hidden = !p.quote;
    var cite = quote.querySelector("cite");
    if (!p.quote_author) cite.hidden = true;

    var next = all[(index + 1) % all.length];
    var nextLink = document.getElementById("next-project");
    if (all.length < 2) nextLink.hidden = true;
    else {
      nextLink.setAttribute("href", projectUrl(next));
      bind(nextLink, { next: next });
    }
    return Promise.resolve();
  };

  pages.studio = function (site) {
    return loadJSON("content/studio.json").then(function (studio) {
      bind(document, studio);
      var steps = document.getElementById("steps");
      clear(steps);
      ((studio.process && studio.process.steps) || []).forEach(function (s, i) {
        steps.appendChild(el("li", { class: "step" }, [
          el("span", { class: "step__num", text: fa(i + 1) }),
          el("h3", { class: "step__title", text: s.title }),
          el("p", { class: "step__text", text: s.text })
        ]));
      });
      renderServices(document.getElementById("services-list"), site, true);
    });
  };

  pages.team = function () {
    return loadJSON("content/team.json").then(function (team) {
      bind(document, team);
      var stats = document.getElementById("stats");
      clear(stats);
      (team.stats || []).forEach(function (s) {
        stats.appendChild(el("div", { class: "stat" }, [
          el("span", { class: "stat__value", text: s.value }), el("span", { class: "stat__label", text: s.label })
        ]));
      });
      var f = team.founder || {};
      var tags = document.getElementById("founder-tags");
      clear(tags);
      (f.tags || []).forEach(function (t) { tags.appendChild(el("li", { text: t })); });
      var links = document.getElementById("founder-links");
      clear(links);
      if (f.email) links.appendChild(el("a", { href: "mailto:" + f.email, text: "ایمیل" }));
      if (f.linkedin) links.appendChild(el("a", { href: f.linkedin, target: "_blank", rel: "noopener", text: "لینکدین" }));

      var members = document.getElementById("members");
      var tones = [["#D6D2C9", "#58585A"], ["#C9D4BC", "#F2F0EB"], ["#58585A", "#E6E4DF"], ["#E2DED6", "#9DB387"]];
      clear(members);
      (team.members || []).forEach(function (m, i) {
        var t = tones[i % tones.length];
        var portrait = el("div", { class: "portrait", style: "background:" + t[0] });
        if (m.photo) portrait.appendChild(el("img", { src: m.photo, alt: m.name, loading: "lazy" }));
        else portrait.appendChild(el("span", { role: "img", "aria-label": m.name, html:
          '<svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' +
          '<circle cx="100" cy="96" r="36" fill="#E6D3BF"/>' +
          '<path d="M62 92 C62 54 138 54 138 92 C126 74 74 74 62 92 Z" fill="#2E2A27"/>' +
          '<path d="M28 250 C28 178 64 150 100 150 C136 150 172 178 172 250 Z" fill="' + t[1] + '"/></svg>' }));
        portrait.appendChild(el("span", { class: "dot", style: i % 2 ? "background:#58585A" : null }));
        members.appendChild(el("div", { class: "member" }, [
          portrait,
          el("div", { class: "member__head" }, [
            el("span", { class: "member__name", text: m.name }),
            el("span", { class: "member__role", text: m.role })
          ]),
          m.bio ? el("p", { class: "member__bio", text: m.bio }) : null
        ]));
      });
      document.getElementById("members-count").textContent = "(" + fa((team.members || []).length) + ")";
    });
  };

  pages.contact = function (site) {
    var c = site.contact || {};
    var dl = document.getElementById("details");
    clear(dl);
    function row(label, children) { dl.appendChild(el("div", null, [el("dt", { text: label }), el("dd", null, children)])); }
    if (c.address) row("استودیو", [el("span", { class: "pre-line", text: c.address })]);
    if (c.email) row("ایمیل", [el("a", { class: "u", href: "mailto:" + c.email, text: c.email })]);
    if (c.phone) row("تلفن", [el("a", { href: "tel:" + c.phone, dir: "ltr", text: c.phone_display || c.phone })]);
    if (c.whatsapp) row("واتس‌اپ", [el("a", { class: "u", href: whatsappUrl(c.whatsapp), target: "_blank", rel: "noopener" },
      [el("span", { dir: "ltr", text: c.whatsapp_display || c.whatsapp }), " — پیام در واتس‌اپ ↗"])]);
    if (c.instagram || c.linkedin) row("شبکه‌ها", [
      c.instagram ? el("a", { href: c.instagram, target: "_blank", rel: "noopener", text: "اینستاگرام" }) : null,
      c.linkedin ? el("a", { href: c.linkedin, target: "_blank", rel: "noopener", text: "لینکدین" }) : null
    ]);

    var types = document.getElementById("project-types");
    clear(types);
    (site.services || []).map(function (s) { return s.title; }).concat(["سایر"]).forEach(function (title, i) {
      types.appendChild(el("label", { class: "chip" }, [
        el("input", { type: "radio", name: "project_type", value: title, checked: i === 0 }), title
      ]));
    });

    var form = document.getElementById("contact-form");
    var status = document.getElementById("form-status");

    function messageText(data) {
      return ["نام: " + data.get("name"), "تماس: " + data.get("contact"), "نوع پروژه: " + data.get("project_type"),
        "مکان پروژه: " + (data.get("location") || "—"), "", data.get("message")].join("\n");
    }

    // "Send on WhatsApp": opens a chat with the studio, message pre-filled.
    var waBtn = document.getElementById("send-whatsapp");
    if (c.whatsapp) {
      waBtn.hidden = false;
      waBtn.addEventListener("click", function () {
        if (!form.reportValidity()) return;
        var text = "سلام، درباره یک پروژه پیام می‌دهم.\n\n" + messageText(new FormData(form));
        window.open(whatsappUrl(c.whatsapp) + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      if (data.get("_gotcha")) return; // spam trap
      var endpoint = String(site.form_endpoint || "").trim();
      if (!/^https:\/\//.test(endpoint)) { // no form service configured → open the visitor's mail app
        location.href = "mailto:" + (c.email || "") + "?subject=" + encodeURIComponent("پروژه جدید — " + data.get("name")) +
          "&body=" + encodeURIComponent(messageText(data));
        return;
      }
      var btn = form.querySelector("[type=submit]");
      btn.disabled = true;
      status.className = "form__status";
      status.textContent = "در حال ارسال…";
      fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          status.className = "form__status is-ok";
          status.textContent = "پیام شما رسید. به‌زودی با شما تماس می‌گیریم.";
        })
        .catch(function () {
          status.className = "form__status is-error";
          status.textContent = "ارسال پیام ممکن نشد. لطفاً دوباره تلاش کنید یا با ما تماس بگیرید.";
        })
        .then(function () { btn.disabled = false; });
    });
    return Promise.resolve();
  };

  // ---------- Motion: first-visit intro and page transitions ----------
  // The inline script in each page's <head> adds html.fx-intro (first page of a visit) or
  // html.fx-enter (arrived through a transition), which paints a cover before this script runs.
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var markReady;
  var ready = new Promise(function (resolve) { markReady = resolve; });

  function store(key, value) {
    try { if (value) sessionStorage.setItem(key, value); else sessionStorage.removeItem(key); } catch (e) { /* storage blocked */ }
  }
  function wait(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }
  // Wait at least `min` ms, and for the content up to `max` ms.
  function settle(min, max) { return Promise.all([wait(min), Promise.race([ready, wait(max)])]); }

  function bars() {
    return el("div", { class: "fx-bars", "aria-hidden": "true" },
      ["b1", "b2", "b3", "b4", "b5"].map(function (b) { return el("i", { class: b }); }));
  }

  function playIntro() {
    var intro = el("div", { class: "fx-intro", "aria-hidden": "true" }, [
      el("div", { class: "fx-intro__logo" }, [
        el("img", { class: "fx-intro__word", src: "assets/images/site/logo-white.svg", alt: "" })
      ].concat(["b1", "b2", "b3", "b4", "b5"].map(function (b) { return el("i", { class: b }); })))
    ]);
    document.body.appendChild(intro);
    root.classList.remove("fx-intro");
    store("afran-intro", "1");
    settle(2000, 3000).then(function () {
      intro.classList.add("is-done");
      setTimeout(function () { intro.remove(); }, 600);
    });
  }

  function playEnter() {
    var cover = bars();
    document.body.appendChild(cover);
    root.classList.remove("fx-enter");
    store("afran-go", null);
    settle(80, 1200).then(function () {
      cover.classList.add("is-out");
      setTimeout(function () { cover.remove(); }, 900);
    });
  }

  function leave(href) {
    var cover = bars();
    cover.classList.add("is-in");
    document.body.appendChild(cover);
    store("afran-go", "1");
    setTimeout(function () { location.href = href; }, 620);
  }

  if (root.classList.contains("fx-intro")) playIntro();
  else if (root.classList.contains("fx-enter")) playEnter();

  if (!reduceMotion) {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.target || a.hasAttribute("download")) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page or #anchor
      e.preventDefault();
      leave(url.href);
    });
  }
  // Coming back through the browser's back/forward cache: drop a cover left from leaving.
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    store("afran-go", null);
    document.querySelectorAll(".fx-bars, .fx-intro").forEach(function (n) { n.remove(); });
  });

  // ---------- Boot ----------
  Promise.all([loadJSON("content/site.json"), loadJSON("content/projects.json")])
    .then(function (res) {
      var site = res[0], projects = res[1];
      if (site.description) {
        var meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute("content", site.description);
      }
      renderHeader(site, projects);
      renderFooter(site);
      return (pages[page] || function () { return Promise.resolve(); })(site, projects);
    })
    .then(function () { document.documentElement.classList.add("is-ready"); markReady(); })
    .catch(function (err) {
      markReady();
      console.error(err);
      var main = document.getElementById("main");
      if (main) main.insertBefore(el("p", { class: "container empty", text: "بارگذاری محتوا ممکن نشد. لطفاً صفحه را دوباره بارگذاری کنید." }), main.firstChild);
    });
})();
