(function () {
    'use strict';

    var n,
      l$1,
      u$1,
      t$1,
      r$1,
      o$1,
      f$1,
      c$1 = {},
      s$1 = [],
      a$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
    function h$1(n, l) {
      for (var u in l) n[u] = l[u];
      return n;
    }
    function v$1(n) {
      var l = n.parentNode;
      l && l.removeChild(n);
    }
    function y(l, u, i) {
      var t,
        r,
        o,
        f = {};
      for (o in u) "key" == o ? t = u[o] : "ref" == o ? r = u[o] : f[o] = u[o];
      if (arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : i), "function" == typeof l && null != l.defaultProps) for (o in l.defaultProps) void 0 === f[o] && (f[o] = l.defaultProps[o]);
      return p$1(l, f, t, r, null);
    }
    function p$1(n, i, t, r, o) {
      var f = {
        type: n,
        props: i,
        key: t,
        ref: r,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __d: void 0,
        __c: null,
        __h: null,
        constructor: void 0,
        __v: null == o ? ++u$1 : o
      };
      return null == o && null != l$1.vnode && l$1.vnode(f), f;
    }
    function _$1(n) {
      return n.children;
    }
    function k$1(n, l) {
      this.props = n, this.context = l;
    }
    function b$1(n, l) {
      if (null == l) return n.__ ? b$1(n.__, n.__.__k.indexOf(n) + 1) : null;
      for (var u; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
      return "function" == typeof n.type ? b$1(n) : null;
    }
    function g$1(n) {
      var l, u;
      if (null != (n = n.__) && null != n.__c) {
        for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) {
          n.__e = n.__c.base = u.__e;
          break;
        }
        return g$1(n);
      }
    }
    function m$1(n) {
      (!n.__d && (n.__d = !0) && t$1.push(n) && !w$1.__r++ || r$1 !== l$1.debounceRendering) && ((r$1 = l$1.debounceRendering) || o$1)(w$1);
    }
    function w$1() {
      var n, l, u, i, r, o, e, c;
      for (t$1.sort(f$1); n = t$1.shift();) n.__d && (l = t$1.length, i = void 0, r = void 0, e = (o = (u = n).__v).__e, (c = u.__P) && (i = [], (r = h$1({}, o)).__v = o.__v + 1, L(c, o, r, u.__n, void 0 !== c.ownerSVGElement, null != o.__h ? [e] : null, i, null == e ? b$1(o) : e, o.__h), M(i, o), o.__e != e && g$1(o)), t$1.length > l && t$1.sort(f$1));
      w$1.__r = 0;
    }
    function x(n, l, u, i, t, r, o, f, e, a) {
      var h,
        v,
        y,
        d,
        k,
        g,
        m,
        w = i && i.__k || s$1,
        x = w.length;
      for (u.__k = [], h = 0; h < l.length; h++) if (null != (d = u.__k[h] = null == (d = l[h]) || "boolean" == typeof d || "function" == typeof d ? null : "string" == typeof d || "number" == typeof d || "bigint" == typeof d ? p$1(null, d, null, null, d) : Array.isArray(d) ? p$1(_$1, {
        children: d
      }, null, null, null) : d.__b > 0 ? p$1(d.type, d.props, d.key, d.ref ? d.ref : null, d.__v) : d)) {
        if (d.__ = u, d.__b = u.__b + 1, null === (y = w[h]) || y && d.key == y.key && d.type === y.type) w[h] = void 0;else for (v = 0; v < x; v++) {
          if ((y = w[v]) && d.key == y.key && d.type === y.type) {
            w[v] = void 0;
            break;
          }
          y = null;
        }
        L(n, d, y = y || c$1, t, r, o, f, e, a), k = d.__e, (v = d.ref) && y.ref != v && (m || (m = []), y.ref && m.push(y.ref, null, d), m.push(v, d.__c || k, d)), null != k ? (null == g && (g = k), "function" == typeof d.type && d.__k === y.__k ? d.__d = e = A(d, e, n) : e = C(n, d, y, w, k, e), "function" == typeof u.type && (u.__d = e)) : e && y.__e == e && e.parentNode != n && (e = b$1(y));
      }
      for (u.__e = g, h = x; h--;) null != w[h] && ("function" == typeof u.type && null != w[h].__e && w[h].__e == u.__d && (u.__d = $(i).nextSibling), S(w[h], w[h]));
      if (m) for (h = 0; h < m.length; h++) O(m[h], m[++h], m[++h]);
    }
    function A(n, l, u) {
      for (var i, t = n.__k, r = 0; t && r < t.length; r++) (i = t[r]) && (i.__ = n, l = "function" == typeof i.type ? A(i, l, u) : C(u, i, i, t, i.__e, l));
      return l;
    }
    function C(n, l, u, i, t, r) {
      var o, f, e;
      if (void 0 !== l.__d) o = l.__d, l.__d = void 0;else if (null == u || t != r || null == t.parentNode) n: if (null == r || r.parentNode !== n) n.appendChild(t), o = null;else {
        for (f = r, e = 0; (f = f.nextSibling) && e < i.length; e += 1) if (f == t) break n;
        n.insertBefore(t, r), o = r;
      }
      return void 0 !== o ? o : t.nextSibling;
    }
    function $(n) {
      var l, u, i;
      if (null == n.type || "string" == typeof n.type) return n.__e;
      if (n.__k) for (l = n.__k.length - 1; l >= 0; l--) if ((u = n.__k[l]) && (i = $(u))) return i;
      return null;
    }
    function H(n, l, u, i, t) {
      var r;
      for (r in u) "children" === r || "key" === r || r in l || T(n, r, null, u[r], i);
      for (r in l) t && "function" != typeof l[r] || "children" === r || "key" === r || "value" === r || "checked" === r || u[r] === l[r] || T(n, r, l[r], u[r], i);
    }
    function I(n, l, u) {
      "-" === l[0] ? n.setProperty(l, null == u ? "" : u) : n[l] = null == u ? "" : "number" != typeof u || a$1.test(l) ? u : u + "px";
    }
    function T(n, l, u, i, t) {
      var r;
      n: if ("style" === l) {
        if ("string" == typeof u) n.style.cssText = u;else {
          if ("string" == typeof i && (n.style.cssText = i = ""), i) for (l in i) u && l in u || I(n.style, l, "");
          if (u) for (l in u) i && u[l] === i[l] || I(n.style, l, u[l]);
        }
      } else if ("o" === l[0] && "n" === l[1]) r = l !== (l = l.replace(/Capture$/, "")), l = l.toLowerCase() in n ? l.toLowerCase().slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + r] = u, u ? i || n.addEventListener(l, r ? z$1 : j$1, r) : n.removeEventListener(l, r ? z$1 : j$1, r);else if ("dangerouslySetInnerHTML" !== l) {
        if (t) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");else if ("width" !== l && "height" !== l && "href" !== l && "list" !== l && "form" !== l && "tabIndex" !== l && "download" !== l && l in n) try {
          n[l] = null == u ? "" : u;
          break n;
        } catch (n) {}
        "function" == typeof u || (null == u || !1 === u && -1 == l.indexOf("-") ? n.removeAttribute(l) : n.setAttribute(l, u));
      }
    }
    function j$1(n) {
      return this.l[n.type + !1](l$1.event ? l$1.event(n) : n);
    }
    function z$1(n) {
      return this.l[n.type + !0](l$1.event ? l$1.event(n) : n);
    }
    function L(n, u, i, t, r, o, f, e, c) {
      var s,
        a,
        v,
        y,
        p,
        d,
        b,
        g,
        m,
        w,
        A,
        P,
        C,
        $,
        H,
        I = u.type;
      if (void 0 !== u.constructor) return null;
      null != i.__h && (c = i.__h, e = u.__e = i.__e, u.__h = null, o = [e]), (s = l$1.__b) && s(u);
      try {
        n: if ("function" == typeof I) {
          if (g = u.props, m = (s = I.contextType) && t[s.__c], w = s ? m ? m.props.value : s.__ : t, i.__c ? b = (a = u.__c = i.__c).__ = a.__E : ("prototype" in I && I.prototype.render ? u.__c = a = new I(g, w) : (u.__c = a = new k$1(g, w), a.constructor = I, a.render = q), m && m.sub(a), a.props = g, a.state || (a.state = {}), a.context = w, a.__n = t, v = a.__d = !0, a.__h = [], a._sb = []), null == a.__s && (a.__s = a.state), null != I.getDerivedStateFromProps && (a.__s == a.state && (a.__s = h$1({}, a.__s)), h$1(a.__s, I.getDerivedStateFromProps(g, a.__s))), y = a.props, p = a.state, a.__v = u, v) null == I.getDerivedStateFromProps && null != a.componentWillMount && a.componentWillMount(), null != a.componentDidMount && a.__h.push(a.componentDidMount);else {
            if (null == I.getDerivedStateFromProps && g !== y && null != a.componentWillReceiveProps && a.componentWillReceiveProps(g, w), !a.__e && null != a.shouldComponentUpdate && !1 === a.shouldComponentUpdate(g, a.__s, w) || u.__v === i.__v) {
              for (u.__v !== i.__v && (a.props = g, a.state = a.__s, a.__d = !1), a.__e = !1, u.__e = i.__e, u.__k = i.__k, u.__k.forEach(function (n) {
                n && (n.__ = u);
              }), A = 0; A < a._sb.length; A++) a.__h.push(a._sb[A]);
              a._sb = [], a.__h.length && f.push(a);
              break n;
            }
            null != a.componentWillUpdate && a.componentWillUpdate(g, a.__s, w), null != a.componentDidUpdate && a.__h.push(function () {
              a.componentDidUpdate(y, p, d);
            });
          }
          if (a.context = w, a.props = g, a.__P = n, P = l$1.__r, C = 0, "prototype" in I && I.prototype.render) {
            for (a.state = a.__s, a.__d = !1, P && P(u), s = a.render(a.props, a.state, a.context), $ = 0; $ < a._sb.length; $++) a.__h.push(a._sb[$]);
            a._sb = [];
          } else do {
            a.__d = !1, P && P(u), s = a.render(a.props, a.state, a.context), a.state = a.__s;
          } while (a.__d && ++C < 25);
          a.state = a.__s, null != a.getChildContext && (t = h$1(h$1({}, t), a.getChildContext())), v || null == a.getSnapshotBeforeUpdate || (d = a.getSnapshotBeforeUpdate(y, p)), H = null != s && s.type === _$1 && null == s.key ? s.props.children : s, x(n, Array.isArray(H) ? H : [H], u, i, t, r, o, f, e, c), a.base = u.__e, u.__h = null, a.__h.length && f.push(a), b && (a.__E = a.__ = null), a.__e = !1;
        } else null == o && u.__v === i.__v ? (u.__k = i.__k, u.__e = i.__e) : u.__e = N(i.__e, u, i, t, r, o, f, c);
        (s = l$1.diffed) && s(u);
      } catch (n) {
        u.__v = null, (c || null != o) && (u.__e = e, u.__h = !!c, o[o.indexOf(e)] = null), l$1.__e(n, u, i);
      }
    }
    function M(n, u) {
      l$1.__c && l$1.__c(u, n), n.some(function (u) {
        try {
          n = u.__h, u.__h = [], n.some(function (n) {
            n.call(u);
          });
        } catch (n) {
          l$1.__e(n, u.__v);
        }
      });
    }
    function N(l, u, i, t, r, o, f, e) {
      var s,
        a,
        h,
        y = i.props,
        p = u.props,
        d = u.type,
        _ = 0;
      if ("svg" === d && (r = !0), null != o) for (; _ < o.length; _++) if ((s = o[_]) && "setAttribute" in s == !!d && (d ? s.localName === d : 3 === s.nodeType)) {
        l = s, o[_] = null;
        break;
      }
      if (null == l) {
        if (null === d) return document.createTextNode(p);
        l = r ? document.createElementNS("http://www.w3.org/2000/svg", d) : document.createElement(d, p.is && p), o = null, e = !1;
      }
      if (null === d) y === p || e && l.data === p || (l.data = p);else {
        if (o = o && n.call(l.childNodes), a = (y = i.props || c$1).dangerouslySetInnerHTML, h = p.dangerouslySetInnerHTML, !e) {
          if (null != o) for (y = {}, _ = 0; _ < l.attributes.length; _++) y[l.attributes[_].name] = l.attributes[_].value;
          (h || a) && (h && (a && h.__html == a.__html || h.__html === l.innerHTML) || (l.innerHTML = h && h.__html || ""));
        }
        if (H(l, p, y, r, e), h) u.__k = [];else if (_ = u.props.children, x(l, Array.isArray(_) ? _ : [_], u, i, t, r && "foreignObject" !== d, o, f, o ? o[0] : i.__k && b$1(i, 0), e), null != o) for (_ = o.length; _--;) null != o[_] && v$1(o[_]);
        e || ("value" in p && void 0 !== (_ = p.value) && (_ !== l.value || "progress" === d && !_ || "option" === d && _ !== y.value) && T(l, "value", _, y.value, !1), "checked" in p && void 0 !== (_ = p.checked) && _ !== l.checked && T(l, "checked", _, y.checked, !1));
      }
      return l;
    }
    function O(n, u, i) {
      try {
        "function" == typeof n ? n(u) : n.current = u;
      } catch (n) {
        l$1.__e(n, i);
      }
    }
    function S(n, u, i) {
      var t, r;
      if (l$1.unmount && l$1.unmount(n), (t = n.ref) && (t.current && t.current !== n.__e || O(t, null, u)), null != (t = n.__c)) {
        if (t.componentWillUnmount) try {
          t.componentWillUnmount();
        } catch (n) {
          l$1.__e(n, u);
        }
        t.base = t.__P = null, n.__c = void 0;
      }
      if (t = n.__k) for (r = 0; r < t.length; r++) t[r] && S(t[r], u, i || "function" != typeof n.type);
      i || null == n.__e || v$1(n.__e), n.__ = n.__e = n.__d = void 0;
    }
    function q(n, l, u) {
      return this.constructor(n, u);
    }
    function B$1(u, i, t) {
      var r, o, f;
      l$1.__ && l$1.__(u, i), o = (r = "function" == typeof t) ? null : t && t.__k || i.__k, f = [], L(i, u = (!r && t || i).__k = y(_$1, null, [u]), o || c$1, c$1, void 0 !== i.ownerSVGElement, !r && t ? [t] : o ? null : i.firstChild ? n.call(i.childNodes) : null, f, !r && t ? t : o ? o.__e : i.firstChild, r), M(f, u);
    }
    n = s$1.slice, l$1 = {
      __e: function (n, l, u, i) {
        for (var t, r, o; l = l.__;) if ((t = l.__c) && !t.__) try {
          if ((r = t.constructor) && null != r.getDerivedStateFromError && (t.setState(r.getDerivedStateFromError(n)), o = t.__d), null != t.componentDidCatch && (t.componentDidCatch(n, i || {}), o = t.__d), o) return t.__E = t;
        } catch (l) {
          n = l;
        }
        throw n;
      }
    }, u$1 = 0, k$1.prototype.setState = function (n, l) {
      var u;
      u = null != this.__s && this.__s !== this.state ? this.__s : this.__s = h$1({}, this.state), "function" == typeof n && (n = n(h$1({}, u), this.props)), n && h$1(u, n), null != n && this.__v && (l && this._sb.push(l), m$1(this));
    }, k$1.prototype.forceUpdate = function (n) {
      this.__v && (this.__e = !0, n && this.__h.push(n), m$1(this));
    }, k$1.prototype.render = _$1, t$1 = [], o$1 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, f$1 = function (n, l) {
      return n.__v.__b - l.__v.__b;
    }, w$1.__r = 0;

    var t,
      r,
      u,
      i,
      o = 0,
      f = [],
      c = [],
      e = l$1.__b,
      a = l$1.__r,
      v = l$1.diffed,
      l = l$1.__c,
      m = l$1.unmount;
    function d(t, u) {
      l$1.__h && l$1.__h(r, t, o || u), o = 0;
      var i = r.__H || (r.__H = {
        __: [],
        __h: []
      });
      return t >= i.__.length && i.__.push({
        __V: c
      }), i.__[t];
    }
    function h(n) {
      return o = 1, s(B, n);
    }
    function s(n, u, i) {
      var o = d(t++, 2);
      if (o.t = n, !o.__c && (o.__ = [i ? i(u) : B(void 0, u), function (n) {
        var t = o.__N ? o.__N[0] : o.__[0],
          r = o.t(t, n);
        t !== r && (o.__N = [r, o.__[1]], o.__c.setState({}));
      }], o.__c = r, !r.u)) {
        var f = function (n, t, r) {
          if (!o.__c.__H) return !0;
          var u = o.__c.__H.__.filter(function (n) {
            return n.__c;
          });
          if (u.every(function (n) {
            return !n.__N;
          })) return !c || c.call(this, n, t, r);
          var i = !1;
          return u.forEach(function (n) {
            if (n.__N) {
              var t = n.__[0];
              n.__ = n.__N, n.__N = void 0, t !== n.__[0] && (i = !0);
            }
          }), !(!i && o.__c.props === n) && (!c || c.call(this, n, t, r));
        };
        r.u = !0;
        var c = r.shouldComponentUpdate,
          e = r.componentWillUpdate;
        r.componentWillUpdate = function (n, t, r) {
          if (this.__e) {
            var u = c;
            c = void 0, f(n, t, r), c = u;
          }
          e && e.call(this, n, t, r);
        }, r.shouldComponentUpdate = f;
      }
      return o.__N || o.__;
    }
    function p(u, i) {
      var o = d(t++, 3);
      !l$1.__s && z(o.__H, i) && (o.__ = u, o.i = i, r.__H.__h.push(o));
    }
    function _(n) {
      return o = 5, F(function () {
        return {
          current: n
        };
      }, []);
    }
    function F(n, r) {
      var u = d(t++, 7);
      return z(u.__H, r) ? (u.__V = n(), u.i = r, u.__h = n, u.__V) : u.__;
    }
    function b() {
      for (var t; t = f.shift();) if (t.__P && t.__H) try {
        t.__H.__h.forEach(k), t.__H.__h.forEach(w), t.__H.__h = [];
      } catch (r) {
        t.__H.__h = [], l$1.__e(r, t.__v);
      }
    }
    l$1.__b = function (n) {
      r = null, e && e(n);
    }, l$1.__r = function (n) {
      a && a(n), t = 0;
      var i = (r = n.__c).__H;
      i && (u === r ? (i.__h = [], r.__h = [], i.__.forEach(function (n) {
        n.__N && (n.__ = n.__N), n.__V = c, n.__N = n.i = void 0;
      })) : (i.__h.forEach(k), i.__h.forEach(w), i.__h = [])), u = r;
    }, l$1.diffed = function (t) {
      v && v(t);
      var o = t.__c;
      o && o.__H && (o.__H.__h.length && (1 !== f.push(o) && i === l$1.requestAnimationFrame || ((i = l$1.requestAnimationFrame) || j)(b)), o.__H.__.forEach(function (n) {
        n.i && (n.__H = n.i), n.__V !== c && (n.__ = n.__V), n.i = void 0, n.__V = c;
      })), u = r = null;
    }, l$1.__c = function (t, r) {
      r.some(function (t) {
        try {
          t.__h.forEach(k), t.__h = t.__h.filter(function (n) {
            return !n.__ || w(n);
          });
        } catch (u) {
          r.some(function (n) {
            n.__h && (n.__h = []);
          }), r = [], l$1.__e(u, t.__v);
        }
      }), l && l(t, r);
    }, l$1.unmount = function (t) {
      m && m(t);
      var r,
        u = t.__c;
      u && u.__H && (u.__H.__.forEach(function (n) {
        try {
          k(n);
        } catch (n) {
          r = n;
        }
      }), u.__H = void 0, r && l$1.__e(r, u.__v));
    };
    var g = "function" == typeof requestAnimationFrame;
    function j(n) {
      var t,
        r = function () {
          clearTimeout(u), g && cancelAnimationFrame(t), setTimeout(n);
        },
        u = setTimeout(r, 100);
      g && (t = requestAnimationFrame(r));
    }
    function k(n) {
      var t = r,
        u = n.__c;
      "function" == typeof u && (n.__c = void 0, u()), r = t;
    }
    function w(n) {
      var t = r;
      n.__c = n.__(), r = t;
    }
    function z(n, t) {
      return !n || n.length !== t.length || t.some(function (t, r) {
        return t !== n[r];
      });
    }
    function B(n, t) {
      return "function" == typeof t ? t(n) : t;
    }

    function uuid() {
      let uuid = "";
      for (let i = 0; i < 32; i++) {
        let random = Math.random() * 16 | 0;
        // prettier-ignore
        if (i === 8 || i === 12 || i === 16 || i === 20) uuid += "-";
        uuid += (i === 12 ? 4 : i === 16 ? random & 3 | 8 : random).toString(16);
      }
      return uuid;
    }
    let todos = [];
    function TodoModel(sub) {
      const onChanges = [sub];
      function inform() {
        onChanges.forEach(cb => cb());
      }
      function addItem(title) {
        todos = todos.concat({
          id: uuid(),
          title,
          completed: false
        });
        inform();
      }
      function toggleItem(todoToToggle) {
        todos = todos.map(todo => todo !== todoToToggle ? todo : {
          ...todo,
          completed: !todo.completed
        });
        inform();
      }
      function removeItem(todo) {
        todos = todos.filter(t => t !== todo);
        inform();
      }
      function updateItem(todoToSave, title) {
        todos = todos.map(todo => todo !== todoToSave ? todo : {
          ...todo,
          title
        });
        inform();
      }
      function toggleAll(completed) {
        todos = todos.map(todo => ({
          ...todo,
          completed
        }));
        inform();
      }
      function clearCompleted() {
        todos = todos.filter(todo => !todo.completed);
        inform();
      }
      function getTodos() {
        return [...todos];
      }
      return {
        addItem,
        toggleAll,
        toggleItem,
        removeItem,
        updateItem,
        clearCompleted,
        getTodos
      };
    }

    // eslint-disable-next-line no-unused-vars
    function TodoHeader(_ref) {
      let {
        onKeyDown
      } = _ref;
      return y("header", {
        class: "header"
      }, y("h1", null, "todos"), y("input", {
        class: "new-todo",
        placeholder: "What needs to be done?",
        onKeyDown: onKeyDown,
        autoFocus: true
      }));
    }

    var classnamesExports = {};
    var classnames = {
      get exports(){ return classnamesExports; },
      set exports(v){ classnamesExports = v; },
    };

    /*!
    	Copyright (c) 2018 Jed Watson.
    	Licensed under the MIT License (MIT), see
    	http://jedwatson.github.io/classnames
    */

    (function (module) {
    	/* global define */

    	(function () {

    	  var hasOwn = {}.hasOwnProperty;
    	  function classNames() {
    	    var classes = [];
    	    for (var i = 0; i < arguments.length; i++) {
    	      var arg = arguments[i];
    	      if (!arg) continue;
    	      var argType = typeof arg;
    	      if (argType === 'string' || argType === 'number') {
    	        classes.push(arg);
    	      } else if (Array.isArray(arg)) {
    	        if (arg.length) {
    	          var inner = classNames.apply(null, arg);
    	          if (inner) {
    	            classes.push(inner);
    	          }
    	        }
    	      } else if (argType === 'object') {
    	        if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
    	          classes.push(arg.toString());
    	          continue;
    	        }
    	        for (var key in arg) {
    	          if (hasOwn.call(arg, key) && arg[key]) {
    	            classes.push(key);
    	          }
    	        }
    	      }
    	    }
    	    return classes.join(' ');
    	  }
    	  if (module.exports) {
    	    classNames.default = classNames;
    	    module.exports = classNames;
    	  } else {
    	    window.classNames = classNames;
    	  }
    	})();
    } (classnames));

    var cx = classnamesExports;

    function TodoItem(_ref) {
      let {
        onSave,
        onRemove,
        onToggle,
        todo
      } = _ref;
      const [editing, setEditing] = h(false);
      const inputRef = _(null);

      /**
       * useEffect keeps track of the 'editing' state change.
       * If the input field is present, we set focus programmatically.
       */
      p(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
        }
      }, [editing]);
      function handleSubmit(e) {
        const val = e.target.value.trim();
        if (val) {
          onSave(todo, val);
          setEditing(false);
        } else {
          onRemove(todo);
        }
      }
      function handleKeyDown(e) {
        // prettier-ignore
        if (e.key === "Escape" || e.key === "ESCAPE") setEditing(false);else if (e.key === "Enter" || e.key === "ENTER") handleSubmit(e);
      }
      function handleDoubleClick() {
        setEditing(true);
      }
      function handleToggle(e) {
        onToggle(todo);
        e.preventDefault();
      }
      function handleRemove() {
        onRemove(todo);
      }
      return y("li", {
        class: cx({
          completed: todo.completed,
          editing
        })
      }, y("div", {
        class: "view"
      }, y("input", {
        class: "toggle",
        type: "checkbox",
        checked: todo.completed,
        onChange: handleToggle
      }), y("label", {
        onDblClick: handleDoubleClick
      }, todo.title), y("button", {
        class: "destroy",
        onClick: handleRemove
      })), editing && y("input", {
        class: "edit",
        ref: inputRef,
        onBlur: handleSubmit,
        onKeyDown: handleKeyDown,
        defaultValue: todo.title
      }));
    }

    const FILTERS = {
      all: todo => true,
      active: todo => !todo.completed,
      completed: todo => todo.completed
    };

    // eslint-disable-next-line no-unused-vars
    function TodoMain(_ref) {
      let {
        onChange,
        onToggle,
        onRemove,
        onSave,
        todos,
        route
      } = _ref;
      const visibleTodos = todos.filter(FILTERS[route]);
      const activeTodoCount = todos.filter(FILTERS["active"]).length;
      return y("section", {
        class: "main"
      }, y("div", {
        class: "toggle-all-container"
      }, y("input", {
        class: "toggle-all",
        type: "checkbox",
        checked: activeTodoCount === 0,
        onChange: onChange
      }), y("label", {
        class: "toggle-all-label",
        htmlFor: "toggle-all"
      }, "Toggle All Input")), y("ul", {
        class: "todo-list"
      }, visibleTodos.map(todo => y(TodoItem, {
        key: todo.id,
        todo: todo,
        onToggle: onToggle,
        onRemove: onRemove,
        onSave: onSave
      }))));
    }

    function TodoFooter(_ref) {
      let {
        todos,
        route,
        onClearCompleted
      } = _ref;
      const activeTodoCount = todos.filter(todo => !todo.completed).length;
      const completedTodoCount = todos.length - activeTodoCount;
      return y("footer", {
        class: "footer"
      }, y("span", {
        class: "todo-count"
      }, `${activeTodoCount} ${activeTodoCount === 1 ? "item" : "items"} left!`), y("ul", {
        class: "filters"
      }, y("li", null, y("a", {
        href: "#/",
        class: cx({
          selected: route === "all"
        })
      }, "All")), " ", y("li", null, y("a", {
        href: "#/active",
        class: cx({
          selected: route === "active"
        })
      }, "Active")), " ", y("li", null, y("a", {
        href: "#/completed",
        class: cx({
          selected: route === "completed"
        })
      }, "Completed"))), completedTodoCount > 0 && y("button", {
        class: "clear-completed",
        onClick: onClearCompleted
      }, "Clear completed"));
    }

    // eslint-disable-next-line no-unused-vars
    const getRoute = () => {
      let route = String(location.hash || "").split("/").pop();

      // prettier-ignore
      if (!FILTERS[route]) route = "all";
      return route;
    };
    function App() {
      const [, setUpdatedAt] = h(Date.now());
      const [route, setRoute] = h("all");

      /**
       * The udpate function gets called from the model after changes are made.
       * This sets state in the app component, which forces a re-render.
       * 
       */
      function update() {
        setUpdatedAt(Date.now());
      }
      const model = TodoModel(update);

      /**
       * useEffect with an empty dependency array runs on the initial mount of the component.
       * Since it doesn't depend on state or prop changes, it will only run once.
       */
      p(() => {
        function handleHashChange() {
          setRoute(getRoute());
        }
        addEventListener("hashchange", handleHashChange);
        handleHashChange();
      }, []);
      function handleKeyDown(e) {
        if (e.key === "Enter" || e.key === "ENTER") {
          const value = e.target.value.trim();
          if (value) {
            model.addItem(value);
            e.target.value = "";
          }
        }
      }
      function toggleAll(e) {
        model.toggleAll(e.target.checked);
      }
      return y("div", null, y(TodoHeader, {
        onKeyDown: handleKeyDown
      }), model.getTodos().length > 0 ? y("div", null, y(TodoMain, {
        todos: model.getTodos(),
        route: route,
        onChange: toggleAll,
        onToggle: model.toggleItem,
        onRemove: model.removeItem,
        onSave: model.updateItem
      }), y(TodoFooter, {
        todos: model.getTodos(),
        route: route,
        onClearCompleted: model.clearCompleted
      })) : null);
    }

    // eslint-disable-next-line no-unused-vars
    B$1(y(App, null), document.querySelector(".todoapp"));

})();
//# sourceMappingURL=app.js.map
