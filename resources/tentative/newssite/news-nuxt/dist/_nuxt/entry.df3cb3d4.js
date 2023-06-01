function jn(e, t) {
    const i = Object.create(null),
        s = e.split(",");
    for (let n = 0; n < s.length; n++) i[s[n]] = !0;
    return t ? (n) => !!i[n.toLowerCase()] : (n) => !!i[n];
}
const ge = {},
    $t = [],
    Ke = () => {},
    gu = () => !1,
    fu = /^on[^a-z]/,
    Mi = (e) => fu.test(e),
    Cn = (e) => e.startsWith("onUpdate:"),
    ye = Object.assign,
    An = (e, t) => {
        const i = e.indexOf(t);
        i > -1 && e.splice(i, 1);
    },
    vu = Object.prototype.hasOwnProperty,
    se = (e, t) => vu.call(e, t),
    z = Array.isArray,
    Bt = (e) => Ii(e) === "[object Map]",
    Er = (e) => Ii(e) === "[object Set]",
    bu = (e) => Ii(e) === "[object RegExp]",
    G = (e) => typeof e == "function",
    fe = (e) => typeof e == "string",
    kn = (e) => typeof e == "symbol",
    he = (e) => e !== null && typeof e == "object",
    xr = (e) => he(e) && G(e.then) && G(e.catch),
    jr = Object.prototype.toString,
    Ii = (e) => jr.call(e),
    _u = (e) => Ii(e).slice(8, -1),
    Cr = (e) => Ii(e) === "[object Object]",
    Tn = (e) => fe(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e,
    fi = jn(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),
    fs = (e) => {
        const t = Object.create(null);
        return (i) => t[i] || (t[i] = e(i));
    },
    yu = /-(\w)/g,
    it = fs((e) => e.replace(yu, (t, i) => (i ? i.toUpperCase() : ""))),
    qu = /\B([A-Z])/g,
    ii = fs((e) => e.replace(qu, "-$1").toLowerCase()),
    vs = fs((e) => e.charAt(0).toUpperCase() + e.slice(1)),
    Ms = fs((e) => (e ? `on${vs(e)}` : "")),
    ji = (e, t) => !Object.is(e, t),
    vi = (e, t) => {
        for (let i = 0; i < e.length; i++) e[i](t);
    },
    is = (e, t, i) => {
        Object.defineProperty(e, t, { configurable: !0, enumerable: !1, value: i });
    },
    wu = (e) => {
        const t = parseFloat(e);
        return isNaN(t) ? e : t;
    },
    Ar = (e) => {
        const t = fe(e) ? Number(e) : NaN;
        return isNaN(t) ? e : t;
    };
let ua;
const Ys = () => ua || (ua = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function bs(e) {
    if (z(e)) {
        const t = {};
        for (let i = 0; i < e.length; i++) {
            const s = e[i],
                n = fe(s) ? ju(s) : bs(s);
            if (n) for (const a in n) t[a] = n[a];
        }
        return t;
    } else {
        if (fe(e)) return e;
        if (he(e)) return e;
    }
}
const Pu = /;(?![^(]*\))/g,
    Eu = /:([^]+)/,
    xu = /\/\*[^]*?\*\//g;
function ju(e) {
    const t = {};
    return (
        e
            .replace(xu, "")
            .split(Pu)
            .forEach((i) => {
                if (i) {
                    const s = i.split(Eu);
                    s.length > 1 && (t[s[0].trim()] = s[1].trim());
                }
            }),
        t
    );
}
function te(e) {
    let t = "";
    if (fe(e)) t = e;
    else if (z(e))
        for (let i = 0; i < e.length; i++) {
            const s = te(e[i]);
            s && (t += s + " ");
        }
    else if (he(e)) for (const i in e) e[i] && (t += i + " ");
    return t.trim();
}
function of(e) {
    if (!e) return null;
    let { class: t, style: i } = e;
    return t && !fe(t) && (e.class = te(t)), i && (e.style = bs(i)), e;
}
const Cu = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",
    Au = jn(Cu);
function kr(e) {
    return !!e || e === "";
}
const kt = (e) => (fe(e) ? e : e == null ? "" : z(e) || (he(e) && (e.toString === jr || !G(e.toString))) ? JSON.stringify(e, Tr, 2) : String(e)),
    Tr = (e, t) => (t && t.__v_isRef ? Tr(e, t.value) : Bt(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((i, [s, n]) => ((i[`${s} =>`] = n), i), {}) } : Er(t) ? { [`Set(${t.size})`]: [...t.values()] } : he(t) && !z(t) && !Cr(t) ? String(t) : t);
let Be;
class ku {
    constructor(t = !1) {
        (this.detached = t), (this._active = !0), (this.effects = []), (this.cleanups = []), (this.parent = Be), !t && Be && (this.index = (Be.scopes || (Be.scopes = [])).push(this) - 1);
    }
    get active() {
        return this._active;
    }
    run(t) {
        if (this._active) {
            const i = Be;
            try {
                return (Be = this), t();
            } finally {
                Be = i;
            }
        }
    }
    on() {
        Be = this;
    }
    off() {
        Be = this.parent;
    }
    stop(t) {
        if (this._active) {
            let i, s;
            for (i = 0, s = this.effects.length; i < s; i++) this.effects[i].stop();
            for (i = 0, s = this.cleanups.length; i < s; i++) this.cleanups[i]();
            if (this.scopes) for (i = 0, s = this.scopes.length; i < s; i++) this.scopes[i].stop(!0);
            if (!this.detached && this.parent && !t) {
                const n = this.parent.scopes.pop();
                n && n !== this && ((this.parent.scopes[this.index] = n), (n.index = this.index));
            }
            (this.parent = void 0), (this._active = !1);
        }
    }
}
function Tu(e, t = Be) {
    t && t.active && t.effects.push(e);
}
function Su() {
    return Be;
}
const Sn = (e) => {
        const t = new Set(e);
        return (t.w = 0), (t.n = 0), t;
    },
    Sr = (e) => (e.w & yt) > 0,
    Rr = (e) => (e.n & yt) > 0,
    Ru = ({ deps: e }) => {
        if (e.length) for (let t = 0; t < e.length; t++) e[t].w |= yt;
    },
    Nu = (e) => {
        const { deps: t } = e;
        if (t.length) {
            let i = 0;
            for (let s = 0; s < t.length; s++) {
                const n = t[s];
                Sr(n) && !Rr(n) ? n.delete(e) : (t[i++] = n), (n.w &= ~yt), (n.n &= ~yt);
            }
            t.length = i;
        }
    },
    ss = new WeakMap();
let hi = 0,
    yt = 1;
const Xs = 30;
let Ve;
const Tt = Symbol(""),
    Zs = Symbol("");
class Rn {
    constructor(t, i = null, s) {
        (this.fn = t), (this.scheduler = i), (this.active = !0), (this.deps = []), (this.parent = void 0), Tu(this, s);
    }
    run() {
        if (!this.active) return this.fn();
        let t = Ve,
            i = bt;
        for (; t; ) {
            if (t === this) return;
            t = t.parent;
        }
        try {
            return (this.parent = Ve), (Ve = this), (bt = !0), (yt = 1 << ++hi), hi <= Xs ? Ru(this) : oa(this), this.fn();
        } finally {
            hi <= Xs && Nu(this), (yt = 1 << --hi), (Ve = this.parent), (bt = i), (this.parent = void 0), this.deferStop && this.stop();
        }
    }
    stop() {
        Ve === this ? (this.deferStop = !0) : this.active && (oa(this), this.onStop && this.onStop(), (this.active = !1));
    }
}
function oa(e) {
    const { deps: t } = e;
    if (t.length) {
        for (let i = 0; i < t.length; i++) t[i].delete(e);
        t.length = 0;
    }
}
let bt = !0;
const Nr = [];
function si() {
    Nr.push(bt), (bt = !1);
}
function ni() {
    const e = Nr.pop();
    bt = e === void 0 ? !0 : e;
}
function Ie(e, t, i) {
    if (bt && Ve) {
        let s = ss.get(e);
        s || ss.set(e, (s = new Map()));
        let n = s.get(i);
        n || s.set(i, (n = Sn())), Mr(n);
    }
}
function Mr(e, t) {
    let i = !1;
    hi <= Xs ? Rr(e) || ((e.n |= yt), (i = !Sr(e))) : (i = !e.has(Ve)), i && (e.add(Ve), Ve.deps.push(e));
}
function lt(e, t, i, s, n, a) {
    const r = ss.get(e);
    if (!r) return;
    let u = [];
    if (t === "clear") u = [...r.values()];
    else if (i === "length" && z(e)) {
        const l = Number(s);
        r.forEach((o, c) => {
            (c === "length" || c >= l) && u.push(o);
        });
    } else
        switch ((i !== void 0 && u.push(r.get(i)), t)) {
            case "add":
                z(e) ? Tn(i) && u.push(r.get("length")) : (u.push(r.get(Tt)), Bt(e) && u.push(r.get(Zs)));
                break;
            case "delete":
                z(e) || (u.push(r.get(Tt)), Bt(e) && u.push(r.get(Zs)));
                break;
            case "set":
                Bt(e) && u.push(r.get(Tt));
                break;
        }
    if (u.length === 1) u[0] && en(u[0]);
    else {
        const l = [];
        for (const o of u) o && l.push(...o);
        en(Sn(l));
    }
}
function en(e, t) {
    const i = z(e) ? e : [...e];
    for (const s of i) s.computed && ca(s);
    for (const s of i) s.computed || ca(s);
}
function ca(e, t) {
    (e !== Ve || e.allowRecurse) && (e.scheduler ? e.scheduler() : e.run());
}
function Mu(e, t) {
    var i;
    return (i = ss.get(e)) == null ? void 0 : i.get(t);
}
const Iu = jn("__proto__,__v_isRef,__isVue"),
    Ir = new Set(
        Object.getOwnPropertyNames(Symbol)
            .filter((e) => e !== "arguments" && e !== "caller")
            .map((e) => Symbol[e])
            .filter(kn)
    ),
    Ou = Nn(),
    Lu = Nn(!1, !0),
    Hu = Nn(!0),
    da = Fu();
function Fu() {
    const e = {};
    return (
        ["includes", "indexOf", "lastIndexOf"].forEach((t) => {
            e[t] = function (...i) {
                const s = ne(this);
                for (let a = 0, r = this.length; a < r; a++) Ie(s, "get", a + "");
                const n = s[t](...i);
                return n === -1 || n === !1 ? s[t](...i.map(ne)) : n;
            };
        }),
        ["push", "pop", "shift", "unshift", "splice"].forEach((t) => {
            e[t] = function (...i) {
                si();
                const s = ne(this)[t].apply(this, i);
                return ni(), s;
            };
        }),
        e
    );
}
function Uu(e) {
    const t = ne(this);
    return Ie(t, "has", e), t.hasOwnProperty(e);
}
function Nn(e = !1, t = !1) {
    return function (s, n, a) {
        if (n === "__v_isReactive") return !e;
        if (n === "__v_isReadonly") return e;
        if (n === "__v_isShallow") return t;
        if (n === "__v_raw" && a === (e ? (t ? io : Ur) : t ? Fr : Hr).get(s)) return s;
        const r = z(s);
        if (!e) {
            if (r && se(da, n)) return Reflect.get(da, n, a);
            if (n === "hasOwnProperty") return Uu;
        }
        const u = Reflect.get(s, n, a);
        return (kn(n) ? Ir.has(n) : Iu(n)) || (e || Ie(s, "get", n), t) ? u : qe(u) ? (r && Tn(n) ? u : u.value) : he(u) ? (e ? $r(u) : Qe(u)) : u;
    };
}
const Du = Or(),
    $u = Or(!0);
function Or(e = !1) {
    return function (i, s, n, a) {
        let r = i[s];
        if (Nt(r) && qe(r) && !qe(n)) return !1;
        if (!e && (!ns(n) && !Nt(n) && ((r = ne(r)), (n = ne(n))), !z(i) && qe(r) && !qe(n))) return (r.value = n), !0;
        const u = z(i) && Tn(s) ? Number(s) < i.length : se(i, s),
            l = Reflect.set(i, s, n, a);
        return i === ne(a) && (u ? ji(n, r) && lt(i, "set", s, n) : lt(i, "add", s, n)), l;
    };
}
function Bu(e, t) {
    const i = se(e, t);
    e[t];
    const s = Reflect.deleteProperty(e, t);
    return s && i && lt(e, "delete", t, void 0), s;
}
function Vu(e, t) {
    const i = Reflect.has(e, t);
    return (!kn(t) || !Ir.has(t)) && Ie(e, "has", t), i;
}
function Wu(e) {
    return Ie(e, "iterate", z(e) ? "length" : Tt), Reflect.ownKeys(e);
}
const Lr = { get: Ou, set: Du, deleteProperty: Bu, has: Vu, ownKeys: Wu },
    Ku = {
        get: Hu,
        set(e, t) {
            return !0;
        },
        deleteProperty(e, t) {
            return !0;
        },
    },
    Qu = ye({}, Lr, { get: Lu, set: $u }),
    Mn = (e) => e,
    _s = (e) => Reflect.getPrototypeOf(e);
function Di(e, t, i = !1, s = !1) {
    e = e.__v_raw;
    const n = ne(e),
        a = ne(t);
    i || (t !== a && Ie(n, "get", t), Ie(n, "get", a));
    const { has: r } = _s(n),
        u = s ? Mn : i ? Ln : Ci;
    if (r.call(n, t)) return u(e.get(t));
    if (r.call(n, a)) return u(e.get(a));
    e !== n && e.get(t);
}
function $i(e, t = !1) {
    const i = this.__v_raw,
        s = ne(i),
        n = ne(e);
    return t || (e !== n && Ie(s, "has", e), Ie(s, "has", n)), e === n ? i.has(e) : i.has(e) || i.has(n);
}
function Bi(e, t = !1) {
    return (e = e.__v_raw), !t && Ie(ne(e), "iterate", Tt), Reflect.get(e, "size", e);
}
function ma(e) {
    e = ne(e);
    const t = ne(this);
    return _s(t).has.call(t, e) || (t.add(e), lt(t, "add", e, e)), this;
}
function ha(e, t) {
    t = ne(t);
    const i = ne(this),
        { has: s, get: n } = _s(i);
    let a = s.call(i, e);
    a || ((e = ne(e)), (a = s.call(i, e)));
    const r = n.call(i, e);
    return i.set(e, t), a ? ji(t, r) && lt(i, "set", e, t) : lt(i, "add", e, t), this;
}
function pa(e) {
    const t = ne(this),
        { has: i, get: s } = _s(t);
    let n = i.call(t, e);
    n || ((e = ne(e)), (n = i.call(t, e))), s && s.call(t, e);
    const a = t.delete(e);
    return n && lt(t, "delete", e, void 0), a;
}
function ga() {
    const e = ne(this),
        t = e.size !== 0,
        i = e.clear();
    return t && lt(e, "clear", void 0, void 0), i;
}
function Vi(e, t) {
    return function (s, n) {
        const a = this,
            r = a.__v_raw,
            u = ne(r),
            l = t ? Mn : e ? Ln : Ci;
        return !e && Ie(u, "iterate", Tt), r.forEach((o, c) => s.call(n, l(o), l(c), a));
    };
}
function Wi(e, t, i) {
    return function (...s) {
        const n = this.__v_raw,
            a = ne(n),
            r = Bt(a),
            u = e === "entries" || (e === Symbol.iterator && r),
            l = e === "keys" && r,
            o = n[e](...s),
            c = i ? Mn : t ? Ln : Ci;
        return (
            !t && Ie(a, "iterate", l ? Zs : Tt),
            {
                next() {
                    const { value: d, done: h } = o.next();
                    return h ? { value: d, done: h } : { value: u ? [c(d[0]), c(d[1])] : c(d), done: h };
                },
                [Symbol.iterator]() {
                    return this;
                },
            }
        );
    };
}
function dt(e) {
    return function (...t) {
        return e === "delete" ? !1 : this;
    };
}
function zu() {
    const e = {
            get(a) {
                return Di(this, a);
            },
            get size() {
                return Bi(this);
            },
            has: $i,
            add: ma,
            set: ha,
            delete: pa,
            clear: ga,
            forEach: Vi(!1, !1),
        },
        t = {
            get(a) {
                return Di(this, a, !1, !0);
            },
            get size() {
                return Bi(this);
            },
            has: $i,
            add: ma,
            set: ha,
            delete: pa,
            clear: ga,
            forEach: Vi(!1, !0),
        },
        i = {
            get(a) {
                return Di(this, a, !0);
            },
            get size() {
                return Bi(this, !0);
            },
            has(a) {
                return $i.call(this, a, !0);
            },
            add: dt("add"),
            set: dt("set"),
            delete: dt("delete"),
            clear: dt("clear"),
            forEach: Vi(!0, !1),
        },
        s = {
            get(a) {
                return Di(this, a, !0, !0);
            },
            get size() {
                return Bi(this, !0);
            },
            has(a) {
                return $i.call(this, a, !0);
            },
            add: dt("add"),
            set: dt("set"),
            delete: dt("delete"),
            clear: dt("clear"),
            forEach: Vi(!0, !0),
        };
    return (
        ["keys", "values", "entries", Symbol.iterator].forEach((a) => {
            (e[a] = Wi(a, !1, !1)), (i[a] = Wi(a, !0, !1)), (t[a] = Wi(a, !1, !0)), (s[a] = Wi(a, !0, !0));
        }),
        [e, i, t, s]
    );
}
const [Ju, Gu, Yu, Xu] = zu();
function In(e, t) {
    const i = t ? (e ? Xu : Yu) : e ? Gu : Ju;
    return (s, n, a) => (n === "__v_isReactive" ? !e : n === "__v_isReadonly" ? e : n === "__v_raw" ? s : Reflect.get(se(i, n) && n in s ? i : s, n, a));
}
const Zu = { get: In(!1, !1) },
    eo = { get: In(!1, !0) },
    to = { get: In(!0, !1) },
    Hr = new WeakMap(),
    Fr = new WeakMap(),
    Ur = new WeakMap(),
    io = new WeakMap();
function so(e) {
    switch (e) {
        case "Object":
        case "Array":
            return 1;
        case "Map":
        case "Set":
        case "WeakMap":
        case "WeakSet":
            return 2;
        default:
            return 0;
    }
}
function no(e) {
    return e.__v_skip || !Object.isExtensible(e) ? 0 : so(_u(e));
}
function Qe(e) {
    return Nt(e) ? e : On(e, !1, Lr, Zu, Hr);
}
function Dr(e) {
    return On(e, !1, Qu, eo, Fr);
}
function $r(e) {
    return On(e, !0, Ku, to, Ur);
}
function On(e, t, i, s, n) {
    if (!he(e) || (e.__v_raw && !(t && e.__v_isReactive))) return e;
    const a = n.get(e);
    if (a) return a;
    const r = no(e);
    if (r === 0) return e;
    const u = new Proxy(e, r === 2 ? s : i);
    return n.set(e, u), u;
}
function Vt(e) {
    return Nt(e) ? Vt(e.__v_raw) : !!(e && e.__v_isReactive);
}
function Nt(e) {
    return !!(e && e.__v_isReadonly);
}
function ns(e) {
    return !!(e && e.__v_isShallow);
}
function Br(e) {
    return Vt(e) || Nt(e);
}
function ne(e) {
    const t = e && e.__v_raw;
    return t ? ne(t) : e;
}
function Vr(e) {
    return is(e, "__v_skip", !0), e;
}
const Ci = (e) => (he(e) ? Qe(e) : e),
    Ln = (e) => (he(e) ? $r(e) : e);
function Wr(e) {
    bt && Ve && ((e = ne(e)), Mr(e.dep || (e.dep = Sn())));
}
function Kr(e, t) {
    e = ne(e);
    const i = e.dep;
    i && en(i);
}
function qe(e) {
    return !!(e && e.__v_isRef === !0);
}
function rt(e) {
    return Qr(e, !1);
}
function Ai(e) {
    return Qr(e, !0);
}
function Qr(e, t) {
    return qe(e) ? e : new ao(e, t);
}
class ao {
    constructor(t, i) {
        (this.__v_isShallow = i), (this.dep = void 0), (this.__v_isRef = !0), (this._rawValue = i ? t : ne(t)), (this._value = i ? t : Ci(t));
    }
    get value() {
        return Wr(this), this._value;
    }
    set value(t) {
        const i = this.__v_isShallow || ns(t) || Nt(t);
        (t = i ? t : ne(t)), ji(t, this._rawValue) && ((this._rawValue = t), (this._value = i ? t : Ci(t)), Kr(this));
    }
}
function pe(e) {
    return qe(e) ? e.value : e;
}
const ro = {
    get: (e, t, i) => pe(Reflect.get(e, t, i)),
    set: (e, t, i, s) => {
        const n = e[t];
        return qe(n) && !qe(i) ? ((n.value = i), !0) : Reflect.set(e, t, i, s);
    },
};
function zr(e) {
    return Vt(e) ? e : new Proxy(e, ro);
}
class lo {
    constructor(t, i, s) {
        (this._object = t), (this._key = i), (this._defaultValue = s), (this.__v_isRef = !0);
    }
    get value() {
        const t = this._object[this._key];
        return t === void 0 ? this._defaultValue : t;
    }
    set value(t) {
        this._object[this._key] = t;
    }
    get dep() {
        return Mu(ne(this._object), this._key);
    }
}
class uo {
    constructor(t) {
        (this._getter = t), (this.__v_isRef = !0), (this.__v_isReadonly = !0);
    }
    get value() {
        return this._getter();
    }
}
function Jr(e, t, i) {
    return qe(e) ? e : G(e) ? new uo(e) : he(e) && arguments.length > 1 ? oo(e, t, i) : rt(e);
}
function oo(e, t, i) {
    const s = e[t];
    return qe(s) ? s : new lo(e, t, i);
}
class co {
    constructor(t, i, s, n) {
        (this._setter = i),
            (this.dep = void 0),
            (this.__v_isRef = !0),
            (this.__v_isReadonly = !1),
            (this._dirty = !0),
            (this.effect = new Rn(t, () => {
                this._dirty || ((this._dirty = !0), Kr(this));
            })),
            (this.effect.computed = this),
            (this.effect.active = this._cacheable = !n),
            (this.__v_isReadonly = s);
    }
    get value() {
        const t = ne(this);
        return Wr(t), (t._dirty || !t._cacheable) && ((t._dirty = !1), (t._value = t.effect.run())), t._value;
    }
    set value(t) {
        this._setter(t);
    }
}
function mo(e, t, i = !1) {
    let s, n;
    const a = G(e);
    return a ? ((s = e), (n = Ke)) : ((s = e.get), (n = e.set)), new co(s, n, a || !n, i);
}
function _t(e, t, i, s) {
    let n;
    try {
        n = s ? e(...s) : e();
    } catch (a) {
        ai(a, t, i);
    }
    return n;
}
function De(e, t, i, s) {
    if (G(e)) {
        const a = _t(e, t, i, s);
        return (
            a &&
                xr(a) &&
                a.catch((r) => {
                    ai(r, t, i);
                }),
            a
        );
    }
    const n = [];
    for (let a = 0; a < e.length; a++) n.push(De(e[a], t, i, s));
    return n;
}
function ai(e, t, i, s = !0) {
    const n = t ? t.vnode : null;
    if (t) {
        let a = t.parent;
        const r = t.proxy,
            u = i;
        for (; a; ) {
            const o = a.ec;
            if (o) {
                for (let c = 0; c < o.length; c++) if (o[c](e, r, u) === !1) return;
            }
            a = a.parent;
        }
        const l = t.appContext.config.errorHandler;
        if (l) {
            _t(l, null, 10, [e, r, u]);
            return;
        }
    }
    ho(e, i, n, s);
}
function ho(e, t, i, s = !0) {
    console.error(e);
}
let ki = !1,
    tn = !1;
const Ae = [];
let et = 0;
const Wt = [];
let at = null,
    jt = 0;
const Gr = Promise.resolve();
let Hn = null;
function ri(e) {
    const t = Hn || Gr;
    return e ? t.then(this ? e.bind(this) : e) : t;
}
function po(e) {
    let t = et + 1,
        i = Ae.length;
    for (; t < i; ) {
        const s = (t + i) >>> 1;
        Ti(Ae[s]) < e ? (t = s + 1) : (i = s);
    }
    return t;
}
function ys(e) {
    (!Ae.length || !Ae.includes(e, ki && e.allowRecurse ? et + 1 : et)) && (e.id == null ? Ae.push(e) : Ae.splice(po(e.id), 0, e), Yr());
}
function Yr() {
    !ki && !tn && ((tn = !0), (Hn = Gr.then(Zr)));
}
function go(e) {
    const t = Ae.indexOf(e);
    t > et && Ae.splice(t, 1);
}
function Xr(e) {
    z(e) ? Wt.push(...e) : (!at || !at.includes(e, e.allowRecurse ? jt + 1 : jt)) && Wt.push(e), Yr();
}
function fa(e, t = ki ? et + 1 : 0) {
    for (; t < Ae.length; t++) {
        const i = Ae[t];
        i && i.pre && (Ae.splice(t, 1), t--, i());
    }
}
function as(e) {
    if (Wt.length) {
        const t = [...new Set(Wt)];
        if (((Wt.length = 0), at)) {
            at.push(...t);
            return;
        }
        for (at = t, at.sort((i, s) => Ti(i) - Ti(s)), jt = 0; jt < at.length; jt++) at[jt]();
        (at = null), (jt = 0);
    }
}
const Ti = (e) => (e.id == null ? 1 / 0 : e.id),
    fo = (e, t) => {
        const i = Ti(e) - Ti(t);
        if (i === 0) {
            if (e.pre && !t.pre) return -1;
            if (t.pre && !e.pre) return 1;
        }
        return i;
    };
function Zr(e) {
    (tn = !1), (ki = !0), Ae.sort(fo);
    const t = Ke;
    try {
        for (et = 0; et < Ae.length; et++) {
            const i = Ae[et];
            i && i.active !== !1 && _t(i, null, 14);
        }
    } finally {
        (et = 0), (Ae.length = 0), as(), (ki = !1), (Hn = null), (Ae.length || Wt.length) && Zr();
    }
}
function vo(e, t, ...i) {
    if (e.isUnmounted) return;
    const s = e.vnode.props || ge;
    let n = i;
    const a = t.startsWith("update:"),
        r = a && t.slice(7);
    if (r && r in s) {
        const c = `${r === "modelValue" ? "model" : r}Modifiers`,
            { number: d, trim: h } = s[c] || ge;
        h && (n = i.map((v) => (fe(v) ? v.trim() : v))), d && (n = i.map(wu));
    }
    let u,
        l = s[(u = Ms(t))] || s[(u = Ms(it(t)))];
    !l && a && (l = s[(u = Ms(ii(t)))]), l && De(l, e, 6, n);
    const o = s[u + "Once"];
    if (o) {
        if (!e.emitted) e.emitted = {};
        else if (e.emitted[u]) return;
        (e.emitted[u] = !0), De(o, e, 6, n);
    }
}
function el(e, t, i = !1) {
    const s = t.emitsCache,
        n = s.get(e);
    if (n !== void 0) return n;
    const a = e.emits;
    let r = {},
        u = !1;
    if (!G(e)) {
        const l = (o) => {
            const c = el(o, t, !0);
            c && ((u = !0), ye(r, c));
        };
        !i && t.mixins.length && t.mixins.forEach(l), e.extends && l(e.extends), e.mixins && e.mixins.forEach(l);
    }
    return !a && !u ? (he(e) && s.set(e, null), null) : (z(a) ? a.forEach((l) => (r[l] = null)) : ye(r, a), he(e) && s.set(e, r), r);
}
function qs(e, t) {
    return !e || !Mi(t) ? !1 : ((t = t.slice(2).replace(/Once$/, "")), se(e, t[0].toLowerCase() + t.slice(1)) || se(e, ii(t)) || se(e, t));
}
let Pe = null,
    ws = null;
function rs(e) {
    const t = Pe;
    return (Pe = e), (ws = (e && e.type.__scopeId) || null), t;
}
function cf(e) {
    ws = e;
}
function df() {
    ws = null;
}
function Ps(e, t = Pe, i) {
    if (!t || e._n) return e;
    const s = (...n) => {
        s._d && Ta(-1);
        const a = rs(t);
        let r;
        try {
            r = e(...n);
        } finally {
            rs(a), s._d && Ta(1);
        }
        return r;
    };
    return (s._n = !0), (s._c = !0), (s._d = !0), s;
}
function Is(e) {
    const {
        type: t,
        vnode: i,
        proxy: s,
        withProxy: n,
        props: a,
        propsOptions: [r],
        slots: u,
        attrs: l,
        emit: o,
        render: c,
        renderCache: d,
        data: h,
        setupState: v,
        ctx: b,
        inheritAttrs: q,
    } = e;
    let T, f;
    const g = rs(e);
    try {
        if (i.shapeFlag & 4) {
            const y = n || s;
            (T = Fe(c.call(y, y, d, a, v, h, b))), (f = l);
        } else {
            const y = t;
            (T = Fe(y.length > 1 ? y(a, { attrs: l, slots: u, emit: o }) : y(a, null))), (f = t.props ? l : _o(l));
        }
    } catch (y) {
        (yi.length = 0), ai(y, e, 1), (T = Z(Se));
    }
    let E = T;
    if (f && q !== !1) {
        const y = Object.keys(f),
            { shapeFlag: C } = E;
        y.length && C & 7 && (r && y.some(Cn) && (f = yo(f, r)), (E = ut(E, f)));
    }
    return i.dirs && ((E = ut(E)), (E.dirs = E.dirs ? E.dirs.concat(i.dirs) : i.dirs)), i.transition && (E.transition = i.transition), (T = E), rs(g), T;
}
function bo(e) {
    let t;
    for (let i = 0; i < e.length; i++) {
        const s = e[i];
        if (Yt(s)) {
            if (s.type !== Se || s.children === "v-if") {
                if (t) return;
                t = s;
            }
        } else return;
    }
    return t;
}
const _o = (e) => {
        let t;
        for (const i in e) (i === "class" || i === "style" || Mi(i)) && ((t || (t = {}))[i] = e[i]);
        return t;
    },
    yo = (e, t) => {
        const i = {};
        for (const s in e) (!Cn(s) || !(s.slice(9) in t)) && (i[s] = e[s]);
        return i;
    };
function qo(e, t, i) {
    const { props: s, children: n, component: a } = e,
        { props: r, children: u, patchFlag: l } = t,
        o = a.emitsOptions;
    if (t.dirs || t.transition) return !0;
    if (i && l >= 0) {
        if (l & 1024) return !0;
        if (l & 16) return s ? va(s, r, o) : !!r;
        if (l & 8) {
            const c = t.dynamicProps;
            for (let d = 0; d < c.length; d++) {
                const h = c[d];
                if (r[h] !== s[h] && !qs(o, h)) return !0;
            }
        }
    } else return (n || u) && (!u || !u.$stable) ? !0 : s === r ? !1 : s ? (r ? va(s, r, o) : !0) : !!r;
    return !1;
}
function va(e, t, i) {
    const s = Object.keys(t);
    if (s.length !== Object.keys(e).length) return !0;
    for (let n = 0; n < s.length; n++) {
        const a = s[n];
        if (t[a] !== e[a] && !qs(i, a)) return !0;
    }
    return !1;
}
function Fn({ vnode: e, parent: t }, i) {
    for (; t && t.subTree === e; ) ((e = t.vnode).el = i), (t = t.parent);
}
const tl = (e) => e.__isSuspense,
    wo = {
        name: "Suspense",
        __isSuspense: !0,
        process(e, t, i, s, n, a, r, u, l, o) {
            e == null ? Po(t, i, s, n, a, r, u, l, o) : Eo(e, t, i, s, n, r, u, l, o);
        },
        hydrate: xo,
        create: Un,
        normalize: jo,
    },
    il = wo;
function Si(e, t) {
    const i = e.props && e.props[t];
    G(i) && i();
}
function Po(e, t, i, s, n, a, r, u, l) {
    const {
            p: o,
            o: { createElement: c },
        } = l,
        d = c("div"),
        h = (e.suspense = Un(e, n, s, t, d, i, a, r, u, l));
    o(null, (h.pendingBranch = e.ssContent), d, null, s, h, a, r), h.deps > 0 ? (Si(e, "onPending"), Si(e, "onFallback"), o(null, e.ssFallback, t, i, s, null, a, r), Kt(h, e.ssFallback)) : h.resolve(!1, !0);
}
function Eo(e, t, i, s, n, a, r, u, { p: l, um: o, o: { createElement: c } }) {
    const d = (t.suspense = e.suspense);
    (d.vnode = t), (t.el = e.el);
    const h = t.ssContent,
        v = t.ssFallback,
        { activeBranch: b, pendingBranch: q, isInFallback: T, isHydrating: f } = d;
    if (q)
        (d.pendingBranch = h),
            We(h, q)
                ? (l(q, h, d.hiddenContainer, null, n, d, a, r, u), d.deps <= 0 ? d.resolve() : T && (l(b, v, i, s, n, null, a, r, u), Kt(d, v)))
                : (d.pendingId++,
                  f ? ((d.isHydrating = !1), (d.activeBranch = q)) : o(q, n, d),
                  (d.deps = 0),
                  (d.effects.length = 0),
                  (d.hiddenContainer = c("div")),
                  T
                      ? (l(null, h, d.hiddenContainer, null, n, d, a, r, u), d.deps <= 0 ? d.resolve() : (l(b, v, i, s, n, null, a, r, u), Kt(d, v)))
                      : b && We(h, b)
                      ? (l(b, h, i, s, n, d, a, r, u), d.resolve(!0))
                      : (l(null, h, d.hiddenContainer, null, n, d, a, r, u), d.deps <= 0 && d.resolve()));
    else if (b && We(h, b)) l(b, h, i, s, n, d, a, r, u), Kt(d, h);
    else if ((Si(t, "onPending"), (d.pendingBranch = h), d.pendingId++, l(null, h, d.hiddenContainer, null, n, d, a, r, u), d.deps <= 0)) d.resolve();
    else {
        const { timeout: g, pendingId: E } = d;
        g > 0
            ? setTimeout(() => {
                  d.pendingId === E && d.fallback(v);
              }, g)
            : g === 0 && d.fallback(v);
    }
}
function Un(e, t, i, s, n, a, r, u, l, o, c = !1) {
    const {
        p: d,
        m: h,
        um: v,
        n: b,
        o: { parentNode: q, remove: T },
    } = o;
    let f;
    const g = Co(e);
    g && t != null && t.pendingBranch && ((f = t.pendingId), t.deps++);
    const E = e.props ? Ar(e.props.timeout) : void 0,
        y = {
            vnode: e,
            parent: t,
            parentComponent: i,
            isSVG: r,
            container: s,
            hiddenContainer: n,
            anchor: a,
            deps: 0,
            pendingId: 0,
            timeout: typeof E == "number" ? E : -1,
            activeBranch: null,
            pendingBranch: null,
            isInFallback: !0,
            isHydrating: c,
            isUnmounted: !1,
            effects: [],
            resolve(C = !1, N = !1) {
                const { vnode: S, activeBranch: P, pendingBranch: O, pendingId: D, effects: Q, parentComponent: H, container: J } = y;
                if (y.isHydrating) y.isHydrating = !1;
                else if (!C) {
                    const ie = P && O.transition && O.transition.mode === "out-in";
                    ie &&
                        (P.transition.afterLeave = () => {
                            D === y.pendingId && h(O, J, ae, 0);
                        });
                    let { anchor: ae } = y;
                    P && ((ae = b(P)), v(P, H, y, !0)), ie || h(O, J, ae, 0);
                }
                Kt(y, O), (y.pendingBranch = null), (y.isInFallback = !1);
                let U = y.parent,
                    ve = !1;
                for (; U; ) {
                    if (U.pendingBranch) {
                        U.effects.push(...Q), (ve = !0);
                        break;
                    }
                    U = U.parent;
                }
                ve || Xr(Q), (y.effects = []), g && t && t.pendingBranch && f === t.pendingId && (t.deps--, t.deps === 0 && !N && t.resolve()), Si(S, "onResolve");
            },
            fallback(C) {
                if (!y.pendingBranch) return;
                const { vnode: N, activeBranch: S, parentComponent: P, container: O, isSVG: D } = y;
                Si(N, "onFallback");
                const Q = b(S),
                    H = () => {
                        y.isInFallback && (d(null, C, O, Q, P, null, D, u, l), Kt(y, C));
                    },
                    J = C.transition && C.transition.mode === "out-in";
                J && (S.transition.afterLeave = H), (y.isInFallback = !0), v(S, P, null, !0), J || H();
            },
            move(C, N, S) {
                y.activeBranch && h(y.activeBranch, C, N, S), (y.container = C);
            },
            next() {
                return y.activeBranch && b(y.activeBranch);
            },
            registerDep(C, N) {
                const S = !!y.pendingBranch;
                S && y.deps++;
                const P = C.vnode.el;
                C.asyncDep
                    .catch((O) => {
                        ai(O, C, 0);
                    })
                    .then((O) => {
                        if (C.isUnmounted || y.isUnmounted || y.pendingId !== C.suspenseId) return;
                        C.asyncResolved = !0;
                        const { vnode: D } = C;
                        on(C, O, !1), P && (D.el = P);
                        const Q = !P && C.subTree.el;
                        N(C, D, q(P || C.subTree.el), P ? null : b(C.subTree), y, r, l), Q && T(Q), Fn(C, D.el), S && --y.deps === 0 && y.resolve();
                    });
            },
            unmount(C, N) {
                (y.isUnmounted = !0), y.activeBranch && v(y.activeBranch, i, C, N), y.pendingBranch && v(y.pendingBranch, i, C, N);
            },
        };
    return y;
}
function xo(e, t, i, s, n, a, r, u, l) {
    const o = (t.suspense = Un(t, s, i, e.parentNode, document.createElement("div"), null, n, a, r, u, !0)),
        c = l(e, (o.pendingBranch = t.ssContent), i, o, a, r);
    return o.deps === 0 && o.resolve(!1, !0), c;
}
function jo(e) {
    const { shapeFlag: t, children: i } = e,
        s = t & 32;
    (e.ssContent = ba(s ? i.default : i)), (e.ssFallback = s ? ba(i.fallback) : Z(Se));
}
function ba(e) {
    let t;
    if (G(e)) {
        const i = Gt && e._c;
        i && ((e._d = !1), B()), (e = e()), i && ((e._d = !0), (t = Ue), Al());
    }
    return z(e) && (e = bo(e)), (e = Fe(e)), t && !e.dynamicChildren && (e.dynamicChildren = t.filter((i) => i !== e)), e;
}
function sl(e, t) {
    t && t.pendingBranch ? (z(e) ? t.effects.push(...e) : t.effects.push(e)) : Xr(e);
}
function Kt(e, t) {
    e.activeBranch = t;
    const { vnode: i, parentComponent: s } = e,
        n = (i.el = t.el);
    s && s.subTree === i && ((s.vnode.el = n), Fn(s, n));
}
function Co(e) {
    var t;
    return ((t = e.props) == null ? void 0 : t.suspensible) != null && e.props.suspensible !== !1;
}
function Ao(e, t) {
    return Dn(e, null, t);
}
const Ki = {};
function Qt(e, t, i) {
    return Dn(e, t, i);
}
function Dn(e, t, { immediate: i, deep: s, flush: n, onTrack: a, onTrigger: r } = ge) {
    var u;
    const l = Su() === ((u = _e) == null ? void 0 : u.scope) ? _e : null;
    let o,
        c = !1,
        d = !1;
    if (
        (qe(e)
            ? ((o = () => e.value), (c = ns(e)))
            : Vt(e)
            ? ((o = () => e), (s = !0))
            : z(e)
            ? ((d = !0),
              (c = e.some((y) => Vt(y) || ns(y))),
              (o = () =>
                  e.map((y) => {
                      if (qe(y)) return y.value;
                      if (Vt(y)) return At(y);
                      if (G(y)) return _t(y, l, 2);
                  })))
            : G(e)
            ? t
                ? (o = () => _t(e, l, 2))
                : (o = () => {
                      if (!(l && l.isUnmounted)) return h && h(), De(e, l, 3, [v]);
                  })
            : (o = Ke),
        t && s)
    ) {
        const y = o;
        o = () => At(y());
    }
    let h,
        v = (y) => {
            h = g.onStop = () => {
                _t(y, l, 4);
            };
        },
        b;
    if (Zt)
        if (((v = Ke), t ? i && De(t, l, 3, [o(), d ? [] : void 0, v]) : o(), n === "sync")) {
            const y = wc();
            b = y.__watcherHandles || (y.__watcherHandles = []);
        } else return Ke;
    let q = d ? new Array(e.length).fill(Ki) : Ki;
    const T = () => {
        if (g.active)
            if (t) {
                const y = g.run();
                (s || c || (d ? y.some((C, N) => ji(C, q[N])) : ji(y, q))) && (h && h(), De(t, l, 3, [y, q === Ki ? void 0 : d && q[0] === Ki ? [] : q, v]), (q = y));
            } else g.run();
    };
    T.allowRecurse = !!t;
    let f;
    n === "sync" ? (f = T) : n === "post" ? (f = () => xe(T, l && l.suspense)) : ((T.pre = !0), l && (T.id = l.uid), (f = () => ys(T)));
    const g = new Rn(o, f);
    t ? (i ? T() : (q = g.run())) : n === "post" ? xe(g.run.bind(g), l && l.suspense) : g.run();
    const E = () => {
        g.stop(), l && l.scope && An(l.scope.effects, g);
    };
    return b && b.push(E), E;
}
function ko(e, t, i) {
    const s = this.proxy,
        n = fe(e) ? (e.includes(".") ? nl(s, e) : () => s[e]) : e.bind(s, s);
    let a;
    G(t) ? (a = t) : ((a = t.handler), (i = t));
    const r = _e;
    Xt(this);
    const u = Dn(n, a.bind(s), i);
    return r ? Xt(r) : Rt(), u;
}
function nl(e, t) {
    const i = t.split(".");
    return () => {
        let s = e;
        for (let n = 0; n < i.length && s; n++) s = s[i[n]];
        return s;
    };
}
function At(e, t) {
    if (!he(e) || e.__v_skip || ((t = t || new Set()), t.has(e))) return e;
    if ((t.add(e), qe(e))) At(e.value, t);
    else if (z(e)) for (let i = 0; i < e.length; i++) At(e[i], t);
    else if (Er(e) || Bt(e))
        e.forEach((i) => {
            At(i, t);
        });
    else if (Cr(e)) for (const i in e) At(e[i], t);
    return e;
}
function To(e, t) {
    const i = Pe;
    if (i === null) return e;
    const s = Cs(i) || i.proxy,
        n = e.dirs || (e.dirs = []);
    for (let a = 0; a < t.length; a++) {
        let [r, u, l, o = ge] = t[a];
        r && (G(r) && (r = { mounted: r, updated: r }), r.deep && At(u), n.push({ dir: r, instance: s, value: u, oldValue: void 0, arg: l, modifiers: o }));
    }
    return e;
}
function Ze(e, t, i, s) {
    const n = e.dirs,
        a = t && t.dirs;
    for (let r = 0; r < n.length; r++) {
        const u = n[r];
        a && (u.oldValue = a[r].value);
        let l = u.dir[s];
        l && (si(), De(l, i, 8, [e.el, u, e, t]), ni());
    }
}
function So() {
    const e = { isMounted: !1, isLeaving: !1, isUnmounting: !1, leavingVNodes: new Map() };
    return (
        $n(() => {
            e.isMounted = !0;
        }),
        xs(() => {
            e.isUnmounting = !0;
        }),
        e
    );
}
const He = [Function, Array],
    al = {
        mode: String,
        appear: Boolean,
        persisted: Boolean,
        onBeforeEnter: He,
        onEnter: He,
        onAfterEnter: He,
        onEnterCancelled: He,
        onBeforeLeave: He,
        onLeave: He,
        onAfterLeave: He,
        onLeaveCancelled: He,
        onBeforeAppear: He,
        onAppear: He,
        onAfterAppear: He,
        onAppearCancelled: He,
    },
    Ro = {
        name: "BaseTransition",
        props: al,
        setup(e, { slots: t }) {
            const i = Li(),
                s = So();
            let n;
            return () => {
                const a = t.default && ll(t.default(), !0);
                if (!a || !a.length) return;
                let r = a[0];
                if (a.length > 1) {
                    for (const q of a)
                        if (q.type !== Se) {
                            r = q;
                            break;
                        }
                }
                const u = ne(e),
                    { mode: l } = u;
                if (s.isLeaving) return Os(r);
                const o = _a(r);
                if (!o) return Os(r);
                const c = sn(o, u, s, i);
                ls(o, c);
                const d = i.subTree,
                    h = d && _a(d);
                let v = !1;
                const { getTransitionKey: b } = o.type;
                if (b) {
                    const q = b();
                    n === void 0 ? (n = q) : q !== n && ((n = q), (v = !0));
                }
                if (h && h.type !== Se && (!We(o, h) || v)) {
                    const q = sn(h, u, s, i);
                    if ((ls(h, q), l === "out-in"))
                        return (
                            (s.isLeaving = !0),
                            (q.afterLeave = () => {
                                (s.isLeaving = !1), i.update.active !== !1 && i.update();
                            }),
                            Os(r)
                        );
                    l === "in-out" &&
                        o.type !== Se &&
                        (q.delayLeave = (T, f, g) => {
                            const E = rl(s, h);
                            (E[String(h.key)] = h),
                                (T._leaveCb = () => {
                                    f(), (T._leaveCb = void 0), delete c.delayedLeave;
                                }),
                                (c.delayedLeave = g);
                        });
                }
                return r;
            };
        },
    },
    No = Ro;
function rl(e, t) {
    const { leavingVNodes: i } = e;
    let s = i.get(t.type);
    return s || ((s = Object.create(null)), i.set(t.type, s)), s;
}
function sn(e, t, i, s) {
    const {
            appear: n,
            mode: a,
            persisted: r = !1,
            onBeforeEnter: u,
            onEnter: l,
            onAfterEnter: o,
            onEnterCancelled: c,
            onBeforeLeave: d,
            onLeave: h,
            onAfterLeave: v,
            onLeaveCancelled: b,
            onBeforeAppear: q,
            onAppear: T,
            onAfterAppear: f,
            onAppearCancelled: g,
        } = t,
        E = String(e.key),
        y = rl(i, e),
        C = (P, O) => {
            P && De(P, s, 9, O);
        },
        N = (P, O) => {
            const D = O[1];
            C(P, O), z(P) ? P.every((Q) => Q.length <= 1) && D() : P.length <= 1 && D();
        },
        S = {
            mode: a,
            persisted: r,
            beforeEnter(P) {
                let O = u;
                if (!i.isMounted)
                    if (n) O = q || u;
                    else return;
                P._leaveCb && P._leaveCb(!0);
                const D = y[E];
                D && We(e, D) && D.el._leaveCb && D.el._leaveCb(), C(O, [P]);
            },
            enter(P) {
                let O = l,
                    D = o,
                    Q = c;
                if (!i.isMounted)
                    if (n) (O = T || l), (D = f || o), (Q = g || c);
                    else return;
                let H = !1;
                const J = (P._enterCb = (U) => {
                    H || ((H = !0), U ? C(Q, [P]) : C(D, [P]), S.delayedLeave && S.delayedLeave(), (P._enterCb = void 0));
                });
                O ? N(O, [P, J]) : J();
            },
            leave(P, O) {
                const D = String(e.key);
                if ((P._enterCb && P._enterCb(!0), i.isUnmounting)) return O();
                C(d, [P]);
                let Q = !1;
                const H = (P._leaveCb = (J) => {
                    Q || ((Q = !0), O(), J ? C(b, [P]) : C(v, [P]), (P._leaveCb = void 0), y[D] === e && delete y[D]);
                });
                (y[D] = e), h ? N(h, [P, H]) : H();
            },
            clone(P) {
                return sn(P, t, i, s);
            },
        };
    return S;
}
function Os(e) {
    if (Oi(e)) return (e = ut(e)), (e.children = null), e;
}
function _a(e) {
    return Oi(e) ? (e.children ? e.children[0] : void 0) : e;
}
function ls(e, t) {
    e.shapeFlag & 6 && e.component ? ls(e.component.subTree, t) : e.shapeFlag & 128 ? ((e.ssContent.transition = t.clone(e.ssContent)), (e.ssFallback.transition = t.clone(e.ssFallback))) : (e.transition = t);
}
function ll(e, t = !1, i) {
    let s = [],
        n = 0;
    for (let a = 0; a < e.length; a++) {
        let r = e[a];
        const u = i == null ? r.key : String(i) + String(r.key != null ? r.key : a);
        r.type === ce ? (r.patchFlag & 128 && n++, (s = s.concat(ll(r.children, t, u)))) : (t || r.type !== Se) && s.push(u != null ? ut(r, { key: u }) : r);
    }
    if (n > 1) for (let a = 0; a < s.length; a++) s[a].patchFlag = -2;
    return s;
}
function Mt(e, t) {
    return G(e) ? (() => ye({ name: e.name }, t, { setup: e }))() : e;
}
const St = (e) => !!e.type.__asyncLoader;
function Mo(e) {
    G(e) && (e = { loader: e });
    const { loader: t, loadingComponent: i, errorComponent: s, delay: n = 200, timeout: a, suspensible: r = !0, onError: u } = e;
    let l = null,
        o,
        c = 0;
    const d = () => (c++, (l = null), h()),
        h = () => {
            let v;
            return (
                l ||
                (v = l =
                    t()
                        .catch((b) => {
                            if (((b = b instanceof Error ? b : new Error(String(b))), u))
                                return new Promise((q, T) => {
                                    u(
                                        b,
                                        () => q(d()),
                                        () => T(b),
                                        c + 1
                                    );
                                });
                            throw b;
                        })
                        .then((b) => (v !== l && l ? l : (b && (b.__esModule || b[Symbol.toStringTag] === "Module") && (b = b.default), (o = b), b))))
            );
        };
    return Mt({
        name: "AsyncComponentWrapper",
        __asyncLoader: h,
        get __asyncResolved() {
            return o;
        },
        setup() {
            const v = _e;
            if (o) return () => Ls(o, v);
            const b = (g) => {
                (l = null), ai(g, v, 13, !s);
            };
            if ((r && v.suspense) || Zt)
                return h()
                    .then((g) => () => Ls(g, v))
                    .catch((g) => (b(g), () => (s ? Z(s, { error: g }) : null)));
            const q = rt(!1),
                T = rt(),
                f = rt(!!n);
            return (
                n &&
                    setTimeout(() => {
                        f.value = !1;
                    }, n),
                a != null &&
                    setTimeout(() => {
                        if (!q.value && !T.value) {
                            const g = new Error(`Async component timed out after ${a}ms.`);
                            b(g), (T.value = g);
                        }
                    }, a),
                h()
                    .then(() => {
                        (q.value = !0), v.parent && Oi(v.parent.vnode) && ys(v.parent.update);
                    })
                    .catch((g) => {
                        b(g), (T.value = g);
                    }),
                () => {
                    if (q.value && o) return Ls(o, v);
                    if (T.value && s) return Z(s, { error: T.value });
                    if (i && !f.value) return Z(i);
                }
            );
        },
    });
}
function Ls(e, t) {
    const { ref: i, props: s, children: n, ce: a } = t.vnode,
        r = Z(e, s, n);
    return (r.ref = i), (r.ce = a), delete t.vnode.ce, r;
}
const Oi = (e) => e.type.__isKeepAlive,
    Io = {
        name: "KeepAlive",
        __isKeepAlive: !0,
        props: { include: [String, RegExp, Array], exclude: [String, RegExp, Array], max: [String, Number] },
        setup(e, { slots: t }) {
            const i = Li(),
                s = i.ctx;
            if (!s.renderer)
                return () => {
                    const g = t.default && t.default();
                    return g && g.length === 1 ? g[0] : g;
                };
            const n = new Map(),
                a = new Set();
            let r = null;
            const u = i.suspense,
                {
                    renderer: {
                        p: l,
                        m: o,
                        um: c,
                        o: { createElement: d },
                    },
                } = s,
                h = d("div");
            (s.activate = (g, E, y, C, N) => {
                const S = g.component;
                o(g, E, y, 0, u),
                    l(S.vnode, g, E, y, S, u, C, g.slotScopeIds, N),
                    xe(() => {
                        (S.isDeactivated = !1), S.a && vi(S.a);
                        const P = g.props && g.props.onVnodeMounted;
                        P && Me(P, S.parent, g);
                    }, u);
            }),
                (s.deactivate = (g) => {
                    const E = g.component;
                    o(g, h, null, 1, u),
                        xe(() => {
                            E.da && vi(E.da);
                            const y = g.props && g.props.onVnodeUnmounted;
                            y && Me(y, E.parent, g), (E.isDeactivated = !0);
                        }, u);
                });
            function v(g) {
                Hs(g), c(g, i, u, !0);
            }
            function b(g) {
                n.forEach((E, y) => {
                    const C = cn(E.type);
                    C && (!g || !g(C)) && q(y);
                });
            }
            function q(g) {
                const E = n.get(g);
                !r || !We(E, r) ? v(E) : r && Hs(r), n.delete(g), a.delete(g);
            }
            Qt(
                () => [e.include, e.exclude],
                ([g, E]) => {
                    g && b((y) => pi(g, y)), E && b((y) => !pi(E, y));
                },
                { flush: "post", deep: !0 }
            );
            let T = null;
            const f = () => {
                T != null && n.set(T, Fs(i.subTree));
            };
            return (
                $n(f),
                dl(f),
                xs(() => {
                    n.forEach((g) => {
                        const { subTree: E, suspense: y } = i,
                            C = Fs(E);
                        if (g.type === C.type && g.key === C.key) {
                            Hs(C);
                            const N = C.component.da;
                            N && xe(N, y);
                            return;
                        }
                        v(g);
                    });
                }),
                () => {
                    if (((T = null), !t.default)) return null;
                    const g = t.default(),
                        E = g[0];
                    if (g.length > 1) return (r = null), g;
                    if (!Yt(E) || (!(E.shapeFlag & 4) && !(E.shapeFlag & 128))) return (r = null), E;
                    let y = Fs(E);
                    const C = y.type,
                        N = cn(St(y) ? y.type.__asyncResolved || {} : C),
                        { include: S, exclude: P, max: O } = e;
                    if ((S && (!N || !pi(S, N))) || (P && N && pi(P, N))) return (r = y), E;
                    const D = y.key == null ? C : y.key,
                        Q = n.get(D);
                    return (
                        y.el && ((y = ut(y)), E.shapeFlag & 128 && (E.ssContent = y)),
                        (T = D),
                        Q ? ((y.el = Q.el), (y.component = Q.component), y.transition && ls(y, y.transition), (y.shapeFlag |= 512), a.delete(D), a.add(D)) : (a.add(D), O && a.size > parseInt(O, 10) && q(a.values().next().value)),
                        (y.shapeFlag |= 256),
                        (r = y),
                        tl(E.type) ? E : y
                    );
                }
            );
        },
    },
    Oo = Io;
function pi(e, t) {
    return z(e) ? e.some((i) => pi(i, t)) : fe(e) ? e.split(",").includes(t) : bu(e) ? e.test(t) : !1;
}
function ul(e, t) {
    cl(e, "a", t);
}
function ol(e, t) {
    cl(e, "da", t);
}
function cl(e, t, i = _e) {
    const s =
        e.__wdc ||
        (e.__wdc = () => {
            let n = i;
            for (; n; ) {
                if (n.isDeactivated) return;
                n = n.parent;
            }
            return e();
        });
    if ((Es(t, s, i), i)) {
        let n = i.parent;
        for (; n && n.parent; ) Oi(n.parent.vnode) && Lo(s, t, i, n), (n = n.parent);
    }
}
function Lo(e, t, i, s) {
    const n = Es(t, e, s, !0);
    ml(() => {
        An(s[t], n);
    }, i);
}
function Hs(e) {
    (e.shapeFlag &= -257), (e.shapeFlag &= -513);
}
function Fs(e) {
    return e.shapeFlag & 128 ? e.ssContent : e;
}
function Es(e, t, i = _e, s = !1) {
    if (i) {
        const n = i[e] || (i[e] = []),
            a =
                t.__weh ||
                (t.__weh = (...r) => {
                    if (i.isUnmounted) return;
                    si(), Xt(i);
                    const u = De(t, i, e, r);
                    return Rt(), ni(), u;
                });
        return s ? n.unshift(a) : n.push(a), a;
    }
}
const ot =
        (e) =>
        (t, i = _e) =>
            (!Zt || e === "sp") && Es(e, (...s) => t(...s), i),
    Ho = ot("bm"),
    $n = ot("m"),
    Fo = ot("bu"),
    dl = ot("u"),
    xs = ot("bum"),
    ml = ot("um"),
    Uo = ot("sp"),
    Do = ot("rtg"),
    $o = ot("rtc");
function hl(e, t = _e) {
    Es("ec", e, t);
}
const Bn = "components";
function mf(e, t) {
    return fl(Bn, e, !0, t) || e;
}
const pl = Symbol.for("v-ndc");
function gl(e) {
    return fe(e) ? fl(Bn, e, !1) || e : e || pl;
}
function fl(e, t, i = !0, s = !1) {
    const n = Pe || _e;
    if (n) {
        const a = n.type;
        if (e === Bn) {
            const u = cn(a, !1);
            if (u && (u === t || u === it(t) || u === vs(it(t)))) return a;
        }
        const r = ya(n[e] || a[e], t) || ya(n.appContext[e], t);
        return !r && s ? a : r;
    }
}
function ya(e, t) {
    return e && (e[t] || e[it(t)] || e[vs(it(t))]);
}
function vt(e, t, i, s) {
    let n;
    const a = i && i[s];
    if (z(e) || fe(e)) {
        n = new Array(e.length);
        for (let r = 0, u = e.length; r < u; r++) n[r] = t(e[r], r, void 0, a && a[r]);
    } else if (typeof e == "number") {
        n = new Array(e);
        for (let r = 0; r < e; r++) n[r] = t(r + 1, r, void 0, a && a[r]);
    } else if (he(e))
        if (e[Symbol.iterator]) n = Array.from(e, (r, u) => t(r, u, void 0, a && a[u]));
        else {
            const r = Object.keys(e);
            n = new Array(r.length);
            for (let u = 0, l = r.length; u < l; u++) {
                const o = r[u];
                n[u] = t(e[o], o, u, a && a[u]);
            }
        }
    else n = [];
    return i && (i[s] = n), n;
}
function hf(e, t, i = {}, s, n) {
    if (Pe.isCE || (Pe.parent && St(Pe.parent) && Pe.parent.isCE)) return t !== "default" && (i.name = t), Z("slot", i, s && s());
    let a = e[t];
    a && a._c && (a._d = !1), B();
    const r = a && vl(a(i)),
        u = we(ce, { key: i.key || (r && r.key) || `_${t}` }, r || (s ? s() : []), r && e._ === 1 ? 64 : -2);
    return !n && u.scopeId && (u.slotScopeIds = [u.scopeId + "-s"]), a && a._c && (a._d = !0), u;
}
function vl(e) {
    return e.some((t) => (Yt(t) ? !(t.type === Se || (t.type === ce && !vl(t.children))) : !0)) ? e : null;
}
const nn = (e) => (e ? (Sl(e) ? Cs(e) || e.proxy : nn(e.parent)) : null),
    bi = ye(Object.create(null), {
        $: (e) => e,
        $el: (e) => e.vnode.el,
        $data: (e) => e.data,
        $props: (e) => e.props,
        $attrs: (e) => e.attrs,
        $slots: (e) => e.slots,
        $refs: (e) => e.refs,
        $parent: (e) => nn(e.parent),
        $root: (e) => nn(e.root),
        $emit: (e) => e.emit,
        $options: (e) => Vn(e),
        $forceUpdate: (e) => e.f || (e.f = () => ys(e.update)),
        $nextTick: (e) => e.n || (e.n = ri.bind(e.proxy)),
        $watch: (e) => ko.bind(e),
    }),
    Us = (e, t) => e !== ge && !e.__isScriptSetup && se(e, t),
    Bo = {
        get({ _: e }, t) {
            const { ctx: i, setupState: s, data: n, props: a, accessCache: r, type: u, appContext: l } = e;
            let o;
            if (t[0] !== "$") {
                const v = r[t];
                if (v !== void 0)
                    switch (v) {
                        case 1:
                            return s[t];
                        case 2:
                            return n[t];
                        case 4:
                            return i[t];
                        case 3:
                            return a[t];
                    }
                else {
                    if (Us(s, t)) return (r[t] = 1), s[t];
                    if (n !== ge && se(n, t)) return (r[t] = 2), n[t];
                    if ((o = e.propsOptions[0]) && se(o, t)) return (r[t] = 3), a[t];
                    if (i !== ge && se(i, t)) return (r[t] = 4), i[t];
                    an && (r[t] = 0);
                }
            }
            const c = bi[t];
            let d, h;
            if (c) return t === "$attrs" && Ie(e, "get", t), c(e);
            if ((d = u.__cssModules) && (d = d[t])) return d;
            if (i !== ge && se(i, t)) return (r[t] = 4), i[t];
            if (((h = l.config.globalProperties), se(h, t))) return h[t];
        },
        set({ _: e }, t, i) {
            const { data: s, setupState: n, ctx: a } = e;
            return Us(n, t) ? ((n[t] = i), !0) : s !== ge && se(s, t) ? ((s[t] = i), !0) : se(e.props, t) || (t[0] === "$" && t.slice(1) in e) ? !1 : ((a[t] = i), !0);
        },
        has({ _: { data: e, setupState: t, accessCache: i, ctx: s, appContext: n, propsOptions: a } }, r) {
            let u;
            return !!i[r] || (e !== ge && se(e, r)) || Us(t, r) || ((u = a[0]) && se(u, r)) || se(s, r) || se(bi, r) || se(n.config.globalProperties, r);
        },
        defineProperty(e, t, i) {
            return i.get != null ? (e._.accessCache[t] = 0) : se(i, "value") && this.set(e, t, i.value, null), Reflect.defineProperty(e, t, i);
        },
    };
function qa(e) {
    return z(e) ? e.reduce((t, i) => ((t[i] = null), t), {}) : e;
}
let an = !0;
function Vo(e) {
    const t = Vn(e),
        i = e.proxy,
        s = e.ctx;
    (an = !1), t.beforeCreate && wa(t.beforeCreate, e, "bc");
    const {
        data: n,
        computed: a,
        methods: r,
        watch: u,
        provide: l,
        inject: o,
        created: c,
        beforeMount: d,
        mounted: h,
        beforeUpdate: v,
        updated: b,
        activated: q,
        deactivated: T,
        beforeDestroy: f,
        beforeUnmount: g,
        destroyed: E,
        unmounted: y,
        render: C,
        renderTracked: N,
        renderTriggered: S,
        errorCaptured: P,
        serverPrefetch: O,
        expose: D,
        inheritAttrs: Q,
        components: H,
        directives: J,
        filters: U,
    } = t;
    if ((o && Wo(o, s, null), r))
        for (const ae in r) {
            const re = r[ae];
            G(re) && (s[ae] = re.bind(i));
        }
    if (n) {
        const ae = n.call(i, i);
        he(ae) && (e.data = Qe(ae));
    }
    if (((an = !0), a))
        for (const ae in a) {
            const re = a[ae],
                st = G(re) ? re.bind(i, i) : G(re.get) ? re.get.bind(i, i) : Ke,
                ct = !G(re) && G(re.set) ? re.set.bind(i) : Ke,
                Ge = Te({ get: st, set: ct });
            Object.defineProperty(s, ae, { enumerable: !0, configurable: !0, get: () => Ge.value, set: (Re) => (Ge.value = Re) });
        }
    if (u) for (const ae in u) bl(u[ae], s, i, ae);
    if (l) {
        const ae = G(l) ? l.call(i) : l;
        Reflect.ownKeys(ae).forEach((re) => {
            zt(re, ae[re]);
        });
    }
    c && wa(c, e, "c");
    function ie(ae, re) {
        z(re) ? re.forEach((st) => ae(st.bind(i))) : re && ae(re.bind(i));
    }
    if ((ie(Ho, d), ie($n, h), ie(Fo, v), ie(dl, b), ie(ul, q), ie(ol, T), ie(hl, P), ie($o, N), ie(Do, S), ie(xs, g), ie(ml, y), ie(Uo, O), z(D)))
        if (D.length) {
            const ae = e.exposed || (e.exposed = {});
            D.forEach((re) => {
                Object.defineProperty(ae, re, { get: () => i[re], set: (st) => (i[re] = st) });
            });
        } else e.exposed || (e.exposed = {});
    C && e.render === Ke && (e.render = C), Q != null && (e.inheritAttrs = Q), H && (e.components = H), J && (e.directives = J);
}
function Wo(e, t, i = Ke) {
    z(e) && (e = rn(e));
    for (const s in e) {
        const n = e[s];
        let a;
        he(n) ? ("default" in n ? (a = Le(n.from || s, n.default, !0)) : (a = Le(n.from || s))) : (a = Le(n)), qe(a) ? Object.defineProperty(t, s, { enumerable: !0, configurable: !0, get: () => a.value, set: (r) => (a.value = r) }) : (t[s] = a);
    }
}
function wa(e, t, i) {
    De(z(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy), t, i);
}
function bl(e, t, i, s) {
    const n = s.includes(".") ? nl(i, s) : () => i[s];
    if (fe(e)) {
        const a = t[e];
        G(a) && Qt(n, a);
    } else if (G(e)) Qt(n, e.bind(i));
    else if (he(e))
        if (z(e)) e.forEach((a) => bl(a, t, i, s));
        else {
            const a = G(e.handler) ? e.handler.bind(i) : t[e.handler];
            G(a) && Qt(n, a, e);
        }
}
function Vn(e) {
    const t = e.type,
        { mixins: i, extends: s } = t,
        {
            mixins: n,
            optionsCache: a,
            config: { optionMergeStrategies: r },
        } = e.appContext,
        u = a.get(t);
    let l;
    return u ? (l = u) : !n.length && !i && !s ? (l = t) : ((l = {}), n.length && n.forEach((o) => us(l, o, r, !0)), us(l, t, r)), he(t) && a.set(t, l), l;
}
function us(e, t, i, s = !1) {
    const { mixins: n, extends: a } = t;
    a && us(e, a, i, !0), n && n.forEach((r) => us(e, r, i, !0));
    for (const r in t)
        if (!(s && r === "expose")) {
            const u = Ko[r] || (i && i[r]);
            e[r] = u ? u(e[r], t[r]) : t[r];
        }
    return e;
}
const Ko = {
    data: Pa,
    props: Ea,
    emits: Ea,
    methods: gi,
    computed: gi,
    beforeCreate: ke,
    created: ke,
    beforeMount: ke,
    mounted: ke,
    beforeUpdate: ke,
    updated: ke,
    beforeDestroy: ke,
    beforeUnmount: ke,
    destroyed: ke,
    unmounted: ke,
    activated: ke,
    deactivated: ke,
    errorCaptured: ke,
    serverPrefetch: ke,
    components: gi,
    directives: gi,
    watch: zo,
    provide: Pa,
    inject: Qo,
};
function Pa(e, t) {
    return t
        ? e
            ? function () {
                  return ye(G(e) ? e.call(this, this) : e, G(t) ? t.call(this, this) : t);
              }
            : t
        : e;
}
function Qo(e, t) {
    return gi(rn(e), rn(t));
}
function rn(e) {
    if (z(e)) {
        const t = {};
        for (let i = 0; i < e.length; i++) t[e[i]] = e[i];
        return t;
    }
    return e;
}
function ke(e, t) {
    return e ? [...new Set([].concat(e, t))] : t;
}
function gi(e, t) {
    return e ? ye(Object.create(null), e, t) : t;
}
function Ea(e, t) {
    return e ? (z(e) && z(t) ? [...new Set([...e, ...t])] : ye(Object.create(null), qa(e), qa(t ?? {}))) : t;
}
function zo(e, t) {
    if (!e) return t;
    if (!t) return e;
    const i = ye(Object.create(null), e);
    for (const s in t) i[s] = ke(e[s], t[s]);
    return i;
}
function _l() {
    return {
        app: null,
        config: { isNativeTag: gu, performance: !1, globalProperties: {}, optionMergeStrategies: {}, errorHandler: void 0, warnHandler: void 0, compilerOptions: {} },
        mixins: [],
        components: {},
        directives: {},
        provides: Object.create(null),
        optionsCache: new WeakMap(),
        propsCache: new WeakMap(),
        emitsCache: new WeakMap(),
    };
}
let Jo = 0;
function Go(e, t) {
    return function (s, n = null) {
        G(s) || (s = ye({}, s)), n != null && !he(n) && (n = null);
        const a = _l(),
            r = new Set();
        let u = !1;
        const l = (a.app = {
            _uid: Jo++,
            _component: s,
            _props: n,
            _container: null,
            _context: a,
            _instance: null,
            version: Nl,
            get config() {
                return a.config;
            },
            set config(o) {},
            use(o, ...c) {
                return r.has(o) || (o && G(o.install) ? (r.add(o), o.install(l, ...c)) : G(o) && (r.add(o), o(l, ...c))), l;
            },
            mixin(o) {
                return a.mixins.includes(o) || a.mixins.push(o), l;
            },
            component(o, c) {
                return c ? ((a.components[o] = c), l) : a.components[o];
            },
            directive(o, c) {
                return c ? ((a.directives[o] = c), l) : a.directives[o];
            },
            mount(o, c, d) {
                if (!u) {
                    const h = Z(s, n);
                    return (h.appContext = a), c && t ? t(h, o) : e(h, o, d), (u = !0), (l._container = o), (o.__vue_app__ = l), Cs(h.component) || h.component.proxy;
                }
            },
            unmount() {
                u && (e(null, l._container), delete l._container.__vue_app__);
            },
            provide(o, c) {
                return (a.provides[o] = c), l;
            },
            runWithContext(o) {
                Ri = l;
                try {
                    return o();
                } finally {
                    Ri = null;
                }
            },
        });
        return l;
    };
}
let Ri = null;
function zt(e, t) {
    if (_e) {
        let i = _e.provides;
        const s = _e.parent && _e.parent.provides;
        s === i && (i = _e.provides = Object.create(s)), (i[e] = t);
    }
}
function Le(e, t, i = !1) {
    const s = _e || Pe;
    if (s || Ri) {
        const n = s ? (s.parent == null ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides) : Ri._context.provides;
        if (n && e in n) return n[e];
        if (arguments.length > 1) return i && G(t) ? t.call(s && s.proxy) : t;
    }
}
function yl() {
    return !!(_e || Pe || Ri);
}
function Yo(e, t, i, s = !1) {
    const n = {},
        a = {};
    is(a, js, 1), (e.propsDefaults = Object.create(null)), ql(e, t, n, a);
    for (const r in e.propsOptions[0]) r in n || (n[r] = void 0);
    i ? (e.props = s ? n : Dr(n)) : e.type.props ? (e.props = n) : (e.props = a), (e.attrs = a);
}
function Xo(e, t, i, s) {
    const {
            props: n,
            attrs: a,
            vnode: { patchFlag: r },
        } = e,
        u = ne(n),
        [l] = e.propsOptions;
    let o = !1;
    if ((s || r > 0) && !(r & 16)) {
        if (r & 8) {
            const c = e.vnode.dynamicProps;
            for (let d = 0; d < c.length; d++) {
                let h = c[d];
                if (qs(e.emitsOptions, h)) continue;
                const v = t[h];
                if (l)
                    if (se(a, h)) v !== a[h] && ((a[h] = v), (o = !0));
                    else {
                        const b = it(h);
                        n[b] = ln(l, u, b, v, e, !1);
                    }
                else v !== a[h] && ((a[h] = v), (o = !0));
            }
        }
    } else {
        ql(e, t, n, a) && (o = !0);
        let c;
        for (const d in u) (!t || (!se(t, d) && ((c = ii(d)) === d || !se(t, c)))) && (l ? i && (i[d] !== void 0 || i[c] !== void 0) && (n[d] = ln(l, u, d, void 0, e, !0)) : delete n[d]);
        if (a !== u) for (const d in a) (!t || !se(t, d)) && (delete a[d], (o = !0));
    }
    o && lt(e, "set", "$attrs");
}
function ql(e, t, i, s) {
    const [n, a] = e.propsOptions;
    let r = !1,
        u;
    if (t)
        for (let l in t) {
            if (fi(l)) continue;
            const o = t[l];
            let c;
            n && se(n, (c = it(l))) ? (!a || !a.includes(c) ? (i[c] = o) : ((u || (u = {}))[c] = o)) : qs(e.emitsOptions, l) || ((!(l in s) || o !== s[l]) && ((s[l] = o), (r = !0)));
        }
    if (a) {
        const l = ne(i),
            o = u || ge;
        for (let c = 0; c < a.length; c++) {
            const d = a[c];
            i[d] = ln(n, l, d, o[d], e, !se(o, d));
        }
    }
    return r;
}
function ln(e, t, i, s, n, a) {
    const r = e[i];
    if (r != null) {
        const u = se(r, "default");
        if (u && s === void 0) {
            const l = r.default;
            if (r.type !== Function && !r.skipFactory && G(l)) {
                const { propsDefaults: o } = n;
                i in o ? (s = o[i]) : (Xt(n), (s = o[i] = l.call(null, t)), Rt());
            } else s = l;
        }
        r[0] && (a && !u ? (s = !1) : r[1] && (s === "" || s === ii(i)) && (s = !0));
    }
    return s;
}
function wl(e, t, i = !1) {
    const s = t.propsCache,
        n = s.get(e);
    if (n) return n;
    const a = e.props,
        r = {},
        u = [];
    let l = !1;
    if (!G(e)) {
        const c = (d) => {
            l = !0;
            const [h, v] = wl(d, t, !0);
            ye(r, h), v && u.push(...v);
        };
        !i && t.mixins.length && t.mixins.forEach(c), e.extends && c(e.extends), e.mixins && e.mixins.forEach(c);
    }
    if (!a && !l) return he(e) && s.set(e, $t), $t;
    if (z(a))
        for (let c = 0; c < a.length; c++) {
            const d = it(a[c]);
            xa(d) && (r[d] = ge);
        }
    else if (a)
        for (const c in a) {
            const d = it(c);
            if (xa(d)) {
                const h = a[c],
                    v = (r[d] = z(h) || G(h) ? { type: h } : ye({}, h));
                if (v) {
                    const b = Aa(Boolean, v.type),
                        q = Aa(String, v.type);
                    (v[0] = b > -1), (v[1] = q < 0 || b < q), (b > -1 || se(v, "default")) && u.push(d);
                }
            }
        }
    const o = [r, u];
    return he(e) && s.set(e, o), o;
}
function xa(e) {
    return e[0] !== "$";
}
function ja(e) {
    const t = e && e.toString().match(/^\s*(function|class) (\w+)/);
    return t ? t[2] : e === null ? "null" : "";
}
function Ca(e, t) {
    return ja(e) === ja(t);
}
function Aa(e, t) {
    return z(t) ? t.findIndex((i) => Ca(i, e)) : G(t) && Ca(t, e) ? 0 : -1;
}
const Pl = (e) => e[0] === "_" || e === "$stable",
    Wn = (e) => (z(e) ? e.map(Fe) : [Fe(e)]),
    Zo = (e, t, i) => {
        if (t._n) return t;
        const s = Ps((...n) => Wn(t(...n)), i);
        return (s._c = !1), s;
    },
    El = (e, t, i) => {
        const s = e._ctx;
        for (const n in e) {
            if (Pl(n)) continue;
            const a = e[n];
            if (G(a)) t[n] = Zo(n, a, s);
            else if (a != null) {
                const r = Wn(a);
                t[n] = () => r;
            }
        }
    },
    xl = (e, t) => {
        const i = Wn(t);
        e.slots.default = () => i;
    },
    ec = (e, t) => {
        if (e.vnode.shapeFlag & 32) {
            const i = t._;
            i ? ((e.slots = ne(t)), is(t, "_", i)) : El(t, (e.slots = {}));
        } else (e.slots = {}), t && xl(e, t);
        is(e.slots, js, 1);
    },
    tc = (e, t, i) => {
        const { vnode: s, slots: n } = e;
        let a = !0,
            r = ge;
        if (s.shapeFlag & 32) {
            const u = t._;
            u ? (i && u === 1 ? (a = !1) : (ye(n, t), !i && u === 1 && delete n._)) : ((a = !t.$stable), El(t, n)), (r = t);
        } else t && (xl(e, t), (r = { default: 1 }));
        if (a) for (const u in n) !Pl(u) && !(u in r) && delete n[u];
    };
function os(e, t, i, s, n = !1) {
    if (z(e)) {
        e.forEach((h, v) => os(h, t && (z(t) ? t[v] : t), i, s, n));
        return;
    }
    if (St(s) && !n) return;
    const a = s.shapeFlag & 4 ? Cs(s.component) || s.component.proxy : s.el,
        r = n ? null : a,
        { i: u, r: l } = e,
        o = t && t.r,
        c = u.refs === ge ? (u.refs = {}) : u.refs,
        d = u.setupState;
    if ((o != null && o !== l && (fe(o) ? ((c[o] = null), se(d, o) && (d[o] = null)) : qe(o) && (o.value = null)), G(l))) _t(l, u, 12, [r, c]);
    else {
        const h = fe(l),
            v = qe(l);
        if (h || v) {
            const b = () => {
                if (e.f) {
                    const q = h ? (se(d, l) ? d[l] : c[l]) : l.value;
                    n ? z(q) && An(q, a) : z(q) ? q.includes(a) || q.push(a) : h ? ((c[l] = [a]), se(d, l) && (d[l] = c[l])) : ((l.value = [a]), e.k && (c[e.k] = l.value));
                } else h ? ((c[l] = r), se(d, l) && (d[l] = r)) : v && ((l.value = r), e.k && (c[e.k] = r));
            };
            r ? ((b.id = -1), xe(b, i)) : b();
        }
    }
}
let mt = !1;
const Qi = (e) => /svg/.test(e.namespaceURI) && e.tagName !== "foreignObject",
    zi = (e) => e.nodeType === 8;
function ic(e) {
    const {
            mt: t,
            p: i,
            o: { patchProp: s, createText: n, nextSibling: a, parentNode: r, remove: u, insert: l, createComment: o },
        } = e,
        c = (f, g) => {
            if (!g.hasChildNodes()) {
                i(null, f, g), as(), (g._vnode = f);
                return;
            }
            (mt = !1), d(g.firstChild, f, null, null, null), as(), (g._vnode = f), mt && console.error("Hydration completed but contains mismatches.");
        },
        d = (f, g, E, y, C, N = !1) => {
            const S = zi(f) && f.data === "[",
                P = () => q(f, g, E, y, C, S),
                { type: O, ref: D, shapeFlag: Q, patchFlag: H } = g;
            let J = f.nodeType;
            (g.el = f), H === -2 && ((N = !1), (g.dynamicChildren = null));
            let U = null;
            switch (O) {
                case Jt:
                    J !== 3 ? (g.children === "" ? (l((g.el = n("")), r(f), f), (U = f)) : (U = P())) : (f.data !== g.children && ((mt = !0), (f.data = g.children)), (U = a(f)));
                    break;
                case Se:
                    J !== 8 || S ? (U = P()) : (U = a(f));
                    break;
                case es:
                    if ((S && ((f = a(f)), (J = f.nodeType)), J === 1 || J === 3)) {
                        U = f;
                        const ve = !g.children.length;
                        for (let ie = 0; ie < g.staticCount; ie++) ve && (g.children += U.nodeType === 1 ? U.outerHTML : U.data), ie === g.staticCount - 1 && (g.anchor = U), (U = a(U));
                        return S ? a(U) : U;
                    } else P();
                    break;
                case ce:
                    S ? (U = b(f, g, E, y, C, N)) : (U = P());
                    break;
                default:
                    if (Q & 1) J !== 1 || g.type.toLowerCase() !== f.tagName.toLowerCase() ? (U = P()) : (U = h(f, g, E, y, C, N));
                    else if (Q & 6) {
                        g.slotScopeIds = C;
                        const ve = r(f);
                        if ((t(g, ve, null, E, y, Qi(ve), N), (U = S ? T(f) : a(f)), U && zi(U) && U.data === "teleport end" && (U = a(U)), St(g))) {
                            let ie;
                            S ? ((ie = Z(ce)), (ie.anchor = U ? U.previousSibling : ve.lastChild)) : (ie = f.nodeType === 3 ? Qn("") : Z("div")), (ie.el = f), (g.component.subTree = ie);
                        }
                    } else Q & 64 ? (J !== 8 ? (U = P()) : (U = g.type.hydrate(f, g, E, y, C, N, e, v))) : Q & 128 && (U = g.type.hydrate(f, g, E, y, Qi(r(f)), C, N, e, d));
            }
            return D != null && os(D, null, y, g), U;
        },
        h = (f, g, E, y, C, N) => {
            N = N || !!g.dynamicChildren;
            const { type: S, props: P, patchFlag: O, shapeFlag: D, dirs: Q } = g,
                H = (S === "input" && Q) || S === "option";
            if (H || O !== -1) {
                if ((Q && Ze(g, null, E, "created"), P))
                    if (H || !N || O & 48) for (const U in P) ((H && U.endsWith("value")) || (Mi(U) && !fi(U))) && s(f, U, null, P[U], !1, void 0, E);
                    else P.onClick && s(f, "onClick", null, P.onClick, !1, void 0, E);
                let J;
                if (
                    ((J = P && P.onVnodeBeforeMount) && Me(J, E, g),
                    Q && Ze(g, null, E, "beforeMount"),
                    ((J = P && P.onVnodeMounted) || Q) &&
                        sl(() => {
                            J && Me(J, E, g), Q && Ze(g, null, E, "mounted");
                        }, y),
                    D & 16 && !(P && (P.innerHTML || P.textContent)))
                ) {
                    let U = v(f.firstChild, g, f, E, y, C, N);
                    for (; U; ) {
                        mt = !0;
                        const ve = U;
                        (U = U.nextSibling), u(ve);
                    }
                } else D & 8 && f.textContent !== g.children && ((mt = !0), (f.textContent = g.children));
            }
            return f.nextSibling;
        },
        v = (f, g, E, y, C, N, S) => {
            S = S || !!g.dynamicChildren;
            const P = g.children,
                O = P.length;
            for (let D = 0; D < O; D++) {
                const Q = S ? P[D] : (P[D] = Fe(P[D]));
                if (f) f = d(f, Q, y, C, N, S);
                else {
                    if (Q.type === Jt && !Q.children) continue;
                    (mt = !0), i(null, Q, E, null, y, C, Qi(E), N);
                }
            }
            return f;
        },
        b = (f, g, E, y, C, N) => {
            const { slotScopeIds: S } = g;
            S && (C = C ? C.concat(S) : S);
            const P = r(f),
                O = v(a(f), g, P, E, y, C, N);
            return O && zi(O) && O.data === "]" ? a((g.anchor = O)) : ((mt = !0), l((g.anchor = o("]")), P, O), O);
        },
        q = (f, g, E, y, C, N) => {
            if (((mt = !0), (g.el = null), N)) {
                const O = T(f);
                for (;;) {
                    const D = a(f);
                    if (D && D !== O) u(D);
                    else break;
                }
            }
            const S = a(f),
                P = r(f);
            return u(f), i(null, g, P, S, E, y, Qi(P), C), S;
        },
        T = (f) => {
            let g = 0;
            for (; f; )
                if (((f = a(f)), f && zi(f) && (f.data === "[" && g++, f.data === "]"))) {
                    if (g === 0) return a(f);
                    g--;
                }
            return f;
        };
    return [c, d];
}
const xe = sl;
function sc(e) {
    return jl(e);
}
function nc(e) {
    return jl(e, ic);
}
function jl(e, t) {
    const i = Ys();
    i.__VUE__ = !0;
    const { insert: s, remove: n, patchProp: a, createElement: r, createText: u, createComment: l, setText: o, setElementText: c, parentNode: d, nextSibling: h, setScopeId: v = Ke, insertStaticContent: b } = e,
        q = (m, p, _, w = null, j = null, A = null, L = !1, R = null, M = !!p.dynamicChildren) => {
            if (m === p) return;
            m && !We(m, p) && ((w = x(m)), Re(m, j, A, !0), (m = null)), p.patchFlag === -2 && ((M = !1), (p.dynamicChildren = null));
            const { type: k, ref: W, shapeFlag: $ } = p;
            switch (k) {
                case Jt:
                    T(m, p, _, w);
                    break;
                case Se:
                    f(m, p, _, w);
                    break;
                case es:
                    m == null && g(p, _, w, L);
                    break;
                case ce:
                    H(m, p, _, w, j, A, L, R, M);
                    break;
                default:
                    $ & 1 ? C(m, p, _, w, j, A, L, R, M) : $ & 6 ? J(m, p, _, w, j, A, L, R, M) : ($ & 64 || $ & 128) && k.process(m, p, _, w, j, A, L, R, M, I);
            }
            W != null && j && os(W, m && m.ref, A, p || m, !p);
        },
        T = (m, p, _, w) => {
            if (m == null) s((p.el = u(p.children)), _, w);
            else {
                const j = (p.el = m.el);
                p.children !== m.children && o(j, p.children);
            }
        },
        f = (m, p, _, w) => {
            m == null ? s((p.el = l(p.children || "")), _, w) : (p.el = m.el);
        },
        g = (m, p, _, w) => {
            [m.el, m.anchor] = b(m.children, p, _, w, m.el, m.anchor);
        },
        E = ({ el: m, anchor: p }, _, w) => {
            let j;
            for (; m && m !== p; ) (j = h(m)), s(m, _, w), (m = j);
            s(p, _, w);
        },
        y = ({ el: m, anchor: p }) => {
            let _;
            for (; m && m !== p; ) (_ = h(m)), n(m), (m = _);
            n(p);
        },
        C = (m, p, _, w, j, A, L, R, M) => {
            (L = L || p.type === "svg"), m == null ? N(p, _, w, j, A, L, R, M) : O(m, p, j, A, L, R, M);
        },
        N = (m, p, _, w, j, A, L, R) => {
            let M, k;
            const { type: W, props: $, shapeFlag: K, transition: Y, dirs: ee } = m;
            if (((M = m.el = r(m.type, A, $ && $.is, $)), K & 8 ? c(M, m.children) : K & 16 && P(m.children, M, null, w, j, A && W !== "foreignObject", L, R), ee && Ze(m, null, w, "created"), S(M, m, m.scopeId, L, w), $)) {
                for (const oe in $) oe !== "value" && !fi(oe) && a(M, oe, null, $[oe], A, m.children, w, j, je);
                "value" in $ && a(M, "value", null, $.value), (k = $.onVnodeBeforeMount) && Me(k, w, m);
            }
            ee && Ze(m, null, w, "beforeMount");
            const me = (!j || (j && !j.pendingBranch)) && Y && !Y.persisted;
            me && Y.beforeEnter(M),
                s(M, p, _),
                ((k = $ && $.onVnodeMounted) || me || ee) &&
                    xe(() => {
                        k && Me(k, w, m), me && Y.enter(M), ee && Ze(m, null, w, "mounted");
                    }, j);
        },
        S = (m, p, _, w, j) => {
            if ((_ && v(m, _), w)) for (let A = 0; A < w.length; A++) v(m, w[A]);
            if (j) {
                let A = j.subTree;
                if (p === A) {
                    const L = j.vnode;
                    S(m, L, L.scopeId, L.slotScopeIds, j.parent);
                }
            }
        },
        P = (m, p, _, w, j, A, L, R, M = 0) => {
            for (let k = M; k < m.length; k++) {
                const W = (m[k] = R ? gt(m[k]) : Fe(m[k]));
                q(null, W, p, _, w, j, A, L, R);
            }
        },
        O = (m, p, _, w, j, A, L) => {
            const R = (p.el = m.el);
            let { patchFlag: M, dynamicChildren: k, dirs: W } = p;
            M |= m.patchFlag & 16;
            const $ = m.props || ge,
                K = p.props || ge;
            let Y;
            _ && wt(_, !1), (Y = K.onVnodeBeforeUpdate) && Me(Y, _, p, m), W && Ze(p, m, _, "beforeUpdate"), _ && wt(_, !0);
            const ee = j && p.type !== "foreignObject";
            if ((k ? D(m.dynamicChildren, k, R, _, w, ee, A) : L || re(m, p, R, null, _, w, ee, A, !1), M > 0)) {
                if (M & 16) Q(R, p, $, K, _, w, j);
                else if ((M & 2 && $.class !== K.class && a(R, "class", null, K.class, j), M & 4 && a(R, "style", $.style, K.style, j), M & 8)) {
                    const me = p.dynamicProps;
                    for (let oe = 0; oe < me.length; oe++) {
                        const be = me[oe],
                            $e = $[be],
                            Lt = K[be];
                        (Lt !== $e || be === "value") && a(R, be, $e, Lt, j, m.children, _, w, je);
                    }
                }
                M & 1 && m.children !== p.children && c(R, p.children);
            } else !L && k == null && Q(R, p, $, K, _, w, j);
            ((Y = K.onVnodeUpdated) || W) &&
                xe(() => {
                    Y && Me(Y, _, p, m), W && Ze(p, m, _, "updated");
                }, w);
        },
        D = (m, p, _, w, j, A, L) => {
            for (let R = 0; R < p.length; R++) {
                const M = m[R],
                    k = p[R],
                    W = M.el && (M.type === ce || !We(M, k) || M.shapeFlag & 70) ? d(M.el) : _;
                q(M, k, W, null, w, j, A, L, !0);
            }
        },
        Q = (m, p, _, w, j, A, L) => {
            if (_ !== w) {
                if (_ !== ge) for (const R in _) !fi(R) && !(R in w) && a(m, R, _[R], null, L, p.children, j, A, je);
                for (const R in w) {
                    if (fi(R)) continue;
                    const M = w[R],
                        k = _[R];
                    M !== k && R !== "value" && a(m, R, k, M, L, p.children, j, A, je);
                }
                "value" in w && a(m, "value", _.value, w.value);
            }
        },
        H = (m, p, _, w, j, A, L, R, M) => {
            const k = (p.el = m ? m.el : u("")),
                W = (p.anchor = m ? m.anchor : u(""));
            let { patchFlag: $, dynamicChildren: K, slotScopeIds: Y } = p;
            Y && (R = R ? R.concat(Y) : Y),
                m == null
                    ? (s(k, _, w), s(W, _, w), P(p.children, _, W, j, A, L, R, M))
                    : $ > 0 && $ & 64 && K && m.dynamicChildren
                    ? (D(m.dynamicChildren, K, _, j, A, L, R), (p.key != null || (j && p === j.subTree)) && Kn(m, p, !0))
                    : re(m, p, _, W, j, A, L, R, M);
        },
        J = (m, p, _, w, j, A, L, R, M) => {
            (p.slotScopeIds = R), m == null ? (p.shapeFlag & 512 ? j.ctx.activate(p, _, w, L, M) : U(p, _, w, j, A, L, M)) : ve(m, p, M);
        },
        U = (m, p, _, w, j, A, L) => {
            const R = (m.component = gc(m, w, j));
            if ((Oi(m) && (R.ctx.renderer = I), fc(R), R.asyncDep)) {
                if ((j && j.registerDep(R, ie), !m.el)) {
                    const M = (R.subTree = Z(Se));
                    f(null, M, p, _);
                }
                return;
            }
            ie(R, m, p, _, j, A, L);
        },
        ve = (m, p, _) => {
            const w = (p.component = m.component);
            if (qo(m, p, _))
                if (w.asyncDep && !w.asyncResolved) {
                    ae(w, p, _);
                    return;
                } else (w.next = p), go(w.update), w.update();
            else (p.el = m.el), (w.vnode = p);
        },
        ie = (m, p, _, w, j, A, L) => {
            const R = () => {
                    if (m.isMounted) {
                        let { next: W, bu: $, u: K, parent: Y, vnode: ee } = m,
                            me = W,
                            oe;
                        wt(m, !1), W ? ((W.el = ee.el), ae(m, W, L)) : (W = ee), $ && vi($), (oe = W.props && W.props.onVnodeBeforeUpdate) && Me(oe, Y, W, ee), wt(m, !0);
                        const be = Is(m),
                            $e = m.subTree;
                        (m.subTree = be), q($e, be, d($e.el), x($e), m, j, A), (W.el = be.el), me === null && Fn(m, be.el), K && xe(K, j), (oe = W.props && W.props.onVnodeUpdated) && xe(() => Me(oe, Y, W, ee), j);
                    } else {
                        let W;
                        const { el: $, props: K } = p,
                            { bm: Y, m: ee, parent: me } = m,
                            oe = St(p);
                        if ((wt(m, !1), Y && vi(Y), !oe && (W = K && K.onVnodeBeforeMount) && Me(W, me, p), wt(m, !0), $ && le)) {
                            const be = () => {
                                (m.subTree = Is(m)), le($, m.subTree, m, j, null);
                            };
                            oe ? p.type.__asyncLoader().then(() => !m.isUnmounted && be()) : be();
                        } else {
                            const be = (m.subTree = Is(m));
                            q(null, be, _, w, m, j, A), (p.el = be.el);
                        }
                        if ((ee && xe(ee, j), !oe && (W = K && K.onVnodeMounted))) {
                            const be = p;
                            xe(() => Me(W, me, be), j);
                        }
                        (p.shapeFlag & 256 || (me && St(me.vnode) && me.vnode.shapeFlag & 256)) && m.a && xe(m.a, j), (m.isMounted = !0), (p = _ = w = null);
                    }
                },
                M = (m.effect = new Rn(R, () => ys(k), m.scope)),
                k = (m.update = () => M.run());
            (k.id = m.uid), wt(m, !0), k();
        },
        ae = (m, p, _) => {
            p.component = m;
            const w = m.vnode.props;
            (m.vnode = p), (m.next = null), Xo(m, p.props, w, _), tc(m, p.children, _), si(), fa(), ni();
        },
        re = (m, p, _, w, j, A, L, R, M = !1) => {
            const k = m && m.children,
                W = m ? m.shapeFlag : 0,
                $ = p.children,
                { patchFlag: K, shapeFlag: Y } = p;
            if (K > 0) {
                if (K & 128) {
                    ct(k, $, _, w, j, A, L, R, M);
                    return;
                } else if (K & 256) {
                    st(k, $, _, w, j, A, L, R, M);
                    return;
                }
            }
            Y & 8 ? (W & 16 && je(k, j, A), $ !== k && c(_, $)) : W & 16 ? (Y & 16 ? ct(k, $, _, w, j, A, L, R, M) : je(k, j, A, !0)) : (W & 8 && c(_, ""), Y & 16 && P($, _, w, j, A, L, R, M));
        },
        st = (m, p, _, w, j, A, L, R, M) => {
            (m = m || $t), (p = p || $t);
            const k = m.length,
                W = p.length,
                $ = Math.min(k, W);
            let K;
            for (K = 0; K < $; K++) {
                const Y = (p[K] = M ? gt(p[K]) : Fe(p[K]));
                q(m[K], Y, _, null, j, A, L, R, M);
            }
            k > W ? je(m, j, A, !0, !1, $) : P(p, _, w, j, A, L, R, M, $);
        },
        ct = (m, p, _, w, j, A, L, R, M) => {
            let k = 0;
            const W = p.length;
            let $ = m.length - 1,
                K = W - 1;
            for (; k <= $ && k <= K; ) {
                const Y = m[k],
                    ee = (p[k] = M ? gt(p[k]) : Fe(p[k]));
                if (We(Y, ee)) q(Y, ee, _, null, j, A, L, R, M);
                else break;
                k++;
            }
            for (; k <= $ && k <= K; ) {
                const Y = m[$],
                    ee = (p[K] = M ? gt(p[K]) : Fe(p[K]));
                if (We(Y, ee)) q(Y, ee, _, null, j, A, L, R, M);
                else break;
                $--, K--;
            }
            if (k > $) {
                if (k <= K) {
                    const Y = K + 1,
                        ee = Y < W ? p[Y].el : w;
                    for (; k <= K; ) q(null, (p[k] = M ? gt(p[k]) : Fe(p[k])), _, ee, j, A, L, R, M), k++;
                }
            } else if (k > K) for (; k <= $; ) Re(m[k], j, A, !0), k++;
            else {
                const Y = k,
                    ee = k,
                    me = new Map();
                for (k = ee; k <= K; k++) {
                    const Oe = (p[k] = M ? gt(p[k]) : Fe(p[k]));
                    Oe.key != null && me.set(Oe.key, k);
                }
                let oe,
                    be = 0;
                const $e = K - ee + 1;
                let Lt = !1,
                    aa = 0;
                const ui = new Array($e);
                for (k = 0; k < $e; k++) ui[k] = 0;
                for (k = Y; k <= $; k++) {
                    const Oe = m[k];
                    if (be >= $e) {
                        Re(Oe, j, A, !0);
                        continue;
                    }
                    let Ye;
                    if (Oe.key != null) Ye = me.get(Oe.key);
                    else
                        for (oe = ee; oe <= K; oe++)
                            if (ui[oe - ee] === 0 && We(Oe, p[oe])) {
                                Ye = oe;
                                break;
                            }
                    Ye === void 0 ? Re(Oe, j, A, !0) : ((ui[Ye - ee] = k + 1), Ye >= aa ? (aa = Ye) : (Lt = !0), q(Oe, p[Ye], _, null, j, A, L, R, M), be++);
                }
                const ra = Lt ? ac(ui) : $t;
                for (oe = ra.length - 1, k = $e - 1; k >= 0; k--) {
                    const Oe = ee + k,
                        Ye = p[Oe],
                        la = Oe + 1 < W ? p[Oe + 1].el : w;
                    ui[k] === 0 ? q(null, Ye, _, la, j, A, L, R, M) : Lt && (oe < 0 || k !== ra[oe] ? Ge(Ye, _, la, 2) : oe--);
                }
            }
        },
        Ge = (m, p, _, w, j = null) => {
            const { el: A, type: L, transition: R, children: M, shapeFlag: k } = m;
            if (k & 6) {
                Ge(m.component.subTree, p, _, w);
                return;
            }
            if (k & 128) {
                m.suspense.move(p, _, w);
                return;
            }
            if (k & 64) {
                L.move(m, p, _, I);
                return;
            }
            if (L === ce) {
                s(A, p, _);
                for (let $ = 0; $ < M.length; $++) Ge(M[$], p, _, w);
                s(m.anchor, p, _);
                return;
            }
            if (L === es) {
                E(m, p, _);
                return;
            }
            if (w !== 2 && k & 1 && R)
                if (w === 0) R.beforeEnter(A), s(A, p, _), xe(() => R.enter(A), j);
                else {
                    const { leave: $, delayLeave: K, afterLeave: Y } = R,
                        ee = () => s(A, p, _),
                        me = () => {
                            $(A, () => {
                                ee(), Y && Y();
                            });
                        };
                    K ? K(A, ee, me) : me();
                }
            else s(A, p, _);
        },
        Re = (m, p, _, w = !1, j = !1) => {
            const { type: A, props: L, ref: R, children: M, dynamicChildren: k, shapeFlag: W, patchFlag: $, dirs: K } = m;
            if ((R != null && os(R, null, _, m, !0), W & 256)) {
                p.ctx.deactivate(m);
                return;
            }
            const Y = W & 1 && K,
                ee = !St(m);
            let me;
            if ((ee && (me = L && L.onVnodeBeforeUnmount) && Me(me, p, m), W & 6)) Ui(m.component, _, w);
            else {
                if (W & 128) {
                    m.suspense.unmount(_, w);
                    return;
                }
                Y && Ze(m, null, p, "beforeUnmount"), W & 64 ? m.type.remove(m, p, _, j, I, w) : k && (A !== ce || ($ > 0 && $ & 64)) ? je(k, p, _, !1, !0) : ((A === ce && $ & 384) || (!j && W & 16)) && je(M, p, _), w && It(m);
            }
            ((ee && (me = L && L.onVnodeUnmounted)) || Y) &&
                xe(() => {
                    me && Me(me, p, m), Y && Ze(m, null, p, "unmounted");
                }, _);
        },
        It = (m) => {
            const { type: p, el: _, anchor: w, transition: j } = m;
            if (p === ce) {
                Ot(_, w);
                return;
            }
            if (p === es) {
                y(m);
                return;
            }
            const A = () => {
                n(_), j && !j.persisted && j.afterLeave && j.afterLeave();
            };
            if (m.shapeFlag & 1 && j && !j.persisted) {
                const { leave: L, delayLeave: R } = j,
                    M = () => L(_, A);
                R ? R(m.el, A, M) : M();
            } else A();
        },
        Ot = (m, p) => {
            let _;
            for (; m !== p; ) (_ = h(m)), n(m), (m = _);
            n(p);
        },
        Ui = (m, p, _) => {
            const { bum: w, scope: j, update: A, subTree: L, um: R } = m;
            w && vi(w),
                j.stop(),
                A && ((A.active = !1), Re(L, m, p, _)),
                R && xe(R, p),
                xe(() => {
                    m.isUnmounted = !0;
                }, p),
                p && p.pendingBranch && !p.isUnmounted && m.asyncDep && !m.asyncResolved && m.suspenseId === p.pendingId && (p.deps--, p.deps === 0 && p.resolve());
        },
        je = (m, p, _, w = !1, j = !1, A = 0) => {
            for (let L = A; L < m.length; L++) Re(m[L], p, _, w, j);
        },
        x = (m) => (m.shapeFlag & 6 ? x(m.component.subTree) : m.shapeFlag & 128 ? m.suspense.next() : h(m.anchor || m.el)),
        F = (m, p, _) => {
            m == null ? p._vnode && Re(p._vnode, null, null, !0) : q(p._vnode || null, m, p, null, null, null, _), fa(), as(), (p._vnode = m);
        },
        I = { p: q, um: Re, m: Ge, r: It, mt: U, mc: P, pc: re, pbc: D, n: x, o: e };
    let V, le;
    return t && ([V, le] = t(I)), { render: F, hydrate: V, createApp: Go(F, V) };
}
function wt({ effect: e, update: t }, i) {
    e.allowRecurse = t.allowRecurse = i;
}
function Kn(e, t, i = !1) {
    const s = e.children,
        n = t.children;
    if (z(s) && z(n))
        for (let a = 0; a < s.length; a++) {
            const r = s[a];
            let u = n[a];
            u.shapeFlag & 1 && !u.dynamicChildren && ((u.patchFlag <= 0 || u.patchFlag === 32) && ((u = n[a] = gt(n[a])), (u.el = r.el)), i || Kn(r, u)), u.type === Jt && (u.el = r.el);
        }
}
function ac(e) {
    const t = e.slice(),
        i = [0];
    let s, n, a, r, u;
    const l = e.length;
    for (s = 0; s < l; s++) {
        const o = e[s];
        if (o !== 0) {
            if (((n = i[i.length - 1]), e[n] < o)) {
                (t[s] = n), i.push(s);
                continue;
            }
            for (a = 0, r = i.length - 1; a < r; ) (u = (a + r) >> 1), e[i[u]] < o ? (a = u + 1) : (r = u);
            o < e[i[a]] && (a > 0 && (t[s] = i[a - 1]), (i[a] = s));
        }
    }
    for (a = i.length, r = i[a - 1]; a-- > 0; ) (i[a] = r), (r = t[r]);
    return i;
}
const rc = (e) => e.__isTeleport,
    _i = (e) => e && (e.disabled || e.disabled === ""),
    ka = (e) => typeof SVGElement < "u" && e instanceof SVGElement,
    un = (e, t) => {
        const i = e && e.to;
        return fe(i) ? (t ? t(i) : null) : i;
    },
    lc = {
        __isTeleport: !0,
        process(e, t, i, s, n, a, r, u, l, o) {
            const {
                    mc: c,
                    pc: d,
                    pbc: h,
                    o: { insert: v, querySelector: b, createText: q, createComment: T },
                } = o,
                f = _i(t.props);
            let { shapeFlag: g, children: E, dynamicChildren: y } = t;
            if (e == null) {
                const C = (t.el = q("")),
                    N = (t.anchor = q(""));
                v(C, i, s), v(N, i, s);
                const S = (t.target = un(t.props, b)),
                    P = (t.targetAnchor = q(""));
                S && (v(P, S), (r = r || ka(S)));
                const O = (D, Q) => {
                    g & 16 && c(E, D, Q, n, a, r, u, l);
                };
                f ? O(i, N) : S && O(S, P);
            } else {
                t.el = e.el;
                const C = (t.anchor = e.anchor),
                    N = (t.target = e.target),
                    S = (t.targetAnchor = e.targetAnchor),
                    P = _i(e.props),
                    O = P ? i : N,
                    D = P ? C : S;
                if (((r = r || ka(N)), y ? (h(e.dynamicChildren, y, O, n, a, r, u), Kn(e, t, !0)) : l || d(e, t, O, D, n, a, r, u, !1), f)) P || Ji(t, i, C, o, 1);
                else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
                    const Q = (t.target = un(t.props, b));
                    Q && Ji(t, Q, null, o, 0);
                } else P && Ji(t, N, S, o, 1);
            }
            Cl(t);
        },
        remove(e, t, i, s, { um: n, o: { remove: a } }, r) {
            const { shapeFlag: u, children: l, anchor: o, targetAnchor: c, target: d, props: h } = e;
            if ((d && a(c), (r || !_i(h)) && (a(o), u & 16)))
                for (let v = 0; v < l.length; v++) {
                    const b = l[v];
                    n(b, t, i, !0, !!b.dynamicChildren);
                }
        },
        move: Ji,
        hydrate: uc,
    };
function Ji(e, t, i, { o: { insert: s }, m: n }, a = 2) {
    a === 0 && s(e.targetAnchor, t, i);
    const { el: r, anchor: u, shapeFlag: l, children: o, props: c } = e,
        d = a === 2;
    if ((d && s(r, t, i), (!d || _i(c)) && l & 16)) for (let h = 0; h < o.length; h++) n(o[h], t, i, 2);
    d && s(u, t, i);
}
function uc(e, t, i, s, n, a, { o: { nextSibling: r, parentNode: u, querySelector: l } }, o) {
    const c = (t.target = un(t.props, l));
    if (c) {
        const d = c._lpa || c.firstChild;
        if (t.shapeFlag & 16)
            if (_i(t.props)) (t.anchor = o(r(e), t, u(e), i, s, n, a)), (t.targetAnchor = d);
            else {
                t.anchor = r(e);
                let h = d;
                for (; h; )
                    if (((h = r(h)), h && h.nodeType === 8 && h.data === "teleport anchor")) {
                        (t.targetAnchor = h), (c._lpa = t.targetAnchor && r(t.targetAnchor));
                        break;
                    }
                o(d, t, c, i, s, n, a);
            }
        Cl(t);
    }
    return t.anchor && r(t.anchor);
}
const oc = lc;
function Cl(e) {
    const t = e.ctx;
    if (t && t.ut) {
        let i = e.children[0].el;
        for (; i !== e.targetAnchor; ) i.nodeType === 1 && i.setAttribute("data-v-owner", t.uid), (i = i.nextSibling);
        t.ut();
    }
}
const ce = Symbol.for("v-fgt"),
    Jt = Symbol.for("v-txt"),
    Se = Symbol.for("v-cmt"),
    es = Symbol.for("v-stc"),
    yi = [];
let Ue = null;
function B(e = !1) {
    yi.push((Ue = e ? null : []));
}
function Al() {
    yi.pop(), (Ue = yi[yi.length - 1] || null);
}
let Gt = 1;
function Ta(e) {
    Gt += e;
}
function kl(e) {
    return (e.dynamicChildren = Gt > 0 ? Ue || $t : null), Al(), Gt > 0 && Ue && Ue.push(e), e;
}
function X(e, t, i, s, n, a) {
    return kl(de(e, t, i, s, n, a, !0));
}
function we(e, t, i, s, n) {
    return kl(Z(e, t, i, s, n, !0));
}
function Yt(e) {
    return e ? e.__v_isVNode === !0 : !1;
}
function We(e, t) {
    return e.type === t.type && e.key === t.key;
}
const js = "__vInternal",
    Tl = ({ key: e }) => e ?? null,
    ts = ({ ref: e, ref_key: t, ref_for: i }) => (typeof e == "number" && (e = "" + e), e != null ? (fe(e) || qe(e) || G(e) ? { i: Pe, r: e, k: t, f: !!i } : e) : null);
function de(e, t = null, i = null, s = 0, n = null, a = e === ce ? 0 : 1, r = !1, u = !1) {
    const l = {
        __v_isVNode: !0,
        __v_skip: !0,
        type: e,
        props: t,
        key: t && Tl(t),
        ref: t && ts(t),
        scopeId: ws,
        slotScopeIds: null,
        children: i,
        component: null,
        suspense: null,
        ssContent: null,
        ssFallback: null,
        dirs: null,
        transition: null,
        el: null,
        anchor: null,
        target: null,
        targetAnchor: null,
        staticCount: 0,
        shapeFlag: a,
        patchFlag: s,
        dynamicProps: n,
        dynamicChildren: null,
        appContext: null,
        ctx: Pe,
    };
    return u ? (zn(l, i), a & 128 && e.normalize(l)) : i && (l.shapeFlag |= fe(i) ? 8 : 16), Gt > 0 && !r && Ue && (l.patchFlag > 0 || a & 6) && l.patchFlag !== 32 && Ue.push(l), l;
}
const Z = cc;
function cc(e, t = null, i = null, s = 0, n = null, a = !1) {
    if (((!e || e === pl) && (e = Se), Yt(e))) {
        const u = ut(e, t, !0);
        return i && zn(u, i), Gt > 0 && !a && Ue && (u.shapeFlag & 6 ? (Ue[Ue.indexOf(e)] = u) : Ue.push(u)), (u.patchFlag |= -2), u;
    }
    if ((yc(e) && (e = e.__vccOpts), t)) {
        t = dc(t);
        let { class: u, style: l } = t;
        u && !fe(u) && (t.class = te(u)), he(l) && (Br(l) && !z(l) && (l = ye({}, l)), (t.style = bs(l)));
    }
    const r = fe(e) ? 1 : tl(e) ? 128 : rc(e) ? 64 : he(e) ? 4 : G(e) ? 2 : 0;
    return de(e, t, i, s, n, r, a, !0);
}
function dc(e) {
    return e ? (Br(e) || js in e ? ye({}, e) : e) : null;
}
function ut(e, t, i = !1) {
    const { props: s, ref: n, patchFlag: a, children: r } = e,
        u = t ? mc(s || {}, t) : s;
    return {
        __v_isVNode: !0,
        __v_skip: !0,
        type: e.type,
        props: u,
        key: u && Tl(u),
        ref: t && t.ref ? (i && n ? (z(n) ? n.concat(ts(t)) : [n, ts(t)]) : ts(t)) : n,
        scopeId: e.scopeId,
        slotScopeIds: e.slotScopeIds,
        children: r,
        target: e.target,
        targetAnchor: e.targetAnchor,
        staticCount: e.staticCount,
        shapeFlag: e.shapeFlag,
        patchFlag: t && e.type !== ce ? (a === -1 ? 16 : a | 16) : a,
        dynamicProps: e.dynamicProps,
        dynamicChildren: e.dynamicChildren,
        appContext: e.appContext,
        dirs: e.dirs,
        transition: e.transition,
        component: e.component,
        suspense: e.suspense,
        ssContent: e.ssContent && ut(e.ssContent),
        ssFallback: e.ssFallback && ut(e.ssFallback),
        el: e.el,
        anchor: e.anchor,
        ctx: e.ctx,
        ce: e.ce,
    };
}
function Qn(e = " ", t = 0) {
    return Z(Jt, null, e, t);
}
function Ce(e = "", t = !1) {
    return t ? (B(), we(Se, null, e)) : Z(Se, null, e);
}
function Fe(e) {
    return e == null || typeof e == "boolean" ? Z(Se) : z(e) ? Z(ce, null, e.slice()) : typeof e == "object" ? gt(e) : Z(Jt, null, String(e));
}
function gt(e) {
    return (e.el === null && e.patchFlag !== -1) || e.memo ? e : ut(e);
}
function zn(e, t) {
    let i = 0;
    const { shapeFlag: s } = e;
    if (t == null) t = null;
    else if (z(t)) i = 16;
    else if (typeof t == "object")
        if (s & 65) {
            const n = t.default;
            n && (n._c && (n._d = !1), zn(e, n()), n._c && (n._d = !0));
            return;
        } else {
            i = 32;
            const n = t._;
            !n && !(js in t) ? (t._ctx = Pe) : n === 3 && Pe && (Pe.slots._ === 1 ? (t._ = 1) : ((t._ = 2), (e.patchFlag |= 1024)));
        }
    else G(t) ? ((t = { default: t, _ctx: Pe }), (i = 32)) : ((t = String(t)), s & 64 ? ((i = 16), (t = [Qn(t)])) : (i = 8));
    (e.children = t), (e.shapeFlag |= i);
}
function mc(...e) {
    const t = {};
    for (let i = 0; i < e.length; i++) {
        const s = e[i];
        for (const n in s)
            if (n === "class") t.class !== s.class && (t.class = te([t.class, s.class]));
            else if (n === "style") t.style = bs([t.style, s.style]);
            else if (Mi(n)) {
                const a = t[n],
                    r = s[n];
                r && a !== r && !(z(a) && a.includes(r)) && (t[n] = a ? [].concat(a, r) : r);
            } else n !== "" && (t[n] = s[n]);
    }
    return t;
}
function Me(e, t, i, s = null) {
    De(e, t, 7, [i, s]);
}
const hc = _l();
let pc = 0;
function gc(e, t, i) {
    const s = e.type,
        n = (t ? t.appContext : e.appContext) || hc,
        a = {
            uid: pc++,
            vnode: e,
            type: s,
            parent: t,
            appContext: n,
            root: null,
            next: null,
            subTree: null,
            effect: null,
            update: null,
            scope: new ku(!0),
            render: null,
            proxy: null,
            exposed: null,
            exposeProxy: null,
            withProxy: null,
            provides: t ? t.provides : Object.create(n.provides),
            accessCache: null,
            renderCache: [],
            components: null,
            directives: null,
            propsOptions: wl(s, n),
            emitsOptions: el(s, n),
            emit: null,
            emitted: null,
            propsDefaults: ge,
            inheritAttrs: s.inheritAttrs,
            ctx: ge,
            data: ge,
            props: ge,
            attrs: ge,
            slots: ge,
            refs: ge,
            setupState: ge,
            setupContext: null,
            attrsProxy: null,
            slotsProxy: null,
            suspense: i,
            suspenseId: i ? i.pendingId : 0,
            asyncDep: null,
            asyncResolved: !1,
            isMounted: !1,
            isUnmounted: !1,
            isDeactivated: !1,
            bc: null,
            c: null,
            bm: null,
            m: null,
            bu: null,
            u: null,
            um: null,
            bum: null,
            da: null,
            a: null,
            rtg: null,
            rtc: null,
            ec: null,
            sp: null,
        };
    return (a.ctx = { _: a }), (a.root = t ? t.root : a), (a.emit = vo.bind(null, a)), e.ce && e.ce(a), a;
}
let _e = null;
const Li = () => _e || Pe;
let Jn,
    Ht,
    Sa = "__VUE_INSTANCE_SETTERS__";
(Ht = Ys()[Sa]) || (Ht = Ys()[Sa] = []),
    Ht.push((e) => (_e = e)),
    (Jn = (e) => {
        Ht.length > 1 ? Ht.forEach((t) => t(e)) : Ht[0](e);
    });
const Xt = (e) => {
        Jn(e), e.scope.on();
    },
    Rt = () => {
        _e && _e.scope.off(), Jn(null);
    };
function Sl(e) {
    return e.vnode.shapeFlag & 4;
}
let Zt = !1;
function fc(e, t = !1) {
    Zt = t;
    const { props: i, children: s } = e.vnode,
        n = Sl(e);
    Yo(e, i, n, t), ec(e, s);
    const a = n ? vc(e, t) : void 0;
    return (Zt = !1), a;
}
function vc(e, t) {
    const i = e.type;
    (e.accessCache = Object.create(null)), (e.proxy = Vr(new Proxy(e.ctx, Bo)));
    const { setup: s } = i;
    if (s) {
        const n = (e.setupContext = s.length > 1 ? _c(e) : null);
        Xt(e), si();
        const a = _t(s, e, 0, [e.props, n]);
        if ((ni(), Rt(), xr(a))) {
            if ((a.then(Rt, Rt), t))
                return a
                    .then((r) => {
                        on(e, r, t);
                    })
                    .catch((r) => {
                        ai(r, e, 0);
                    });
            e.asyncDep = a;
        } else on(e, a, t);
    } else Rl(e, t);
}
function on(e, t, i) {
    G(t) ? (e.type.__ssrInlineRender ? (e.ssrRender = t) : (e.render = t)) : he(t) && (e.setupState = zr(t)), Rl(e, i);
}
let Ra;
function Rl(e, t, i) {
    const s = e.type;
    if (!e.render) {
        if (!t && Ra && !s.render) {
            const n = s.template || Vn(e).template;
            if (n) {
                const { isCustomElement: a, compilerOptions: r } = e.appContext.config,
                    { delimiters: u, compilerOptions: l } = s,
                    o = ye(ye({ isCustomElement: a, delimiters: u }, r), l);
                s.render = Ra(n, o);
            }
        }
        e.render = s.render || Ke;
    }
    Xt(e), si(), Vo(e), ni(), Rt();
}
function bc(e) {
    return (
        e.attrsProxy ||
        (e.attrsProxy = new Proxy(e.attrs, {
            get(t, i) {
                return Ie(e, "get", "$attrs"), t[i];
            },
        }))
    );
}
function _c(e) {
    const t = (i) => {
        e.exposed = i || {};
    };
    return {
        get attrs() {
            return bc(e);
        },
        slots: e.slots,
        emit: e.emit,
        expose: t,
    };
}
function Cs(e) {
    if (e.exposed)
        return (
            e.exposeProxy ||
            (e.exposeProxy = new Proxy(zr(Vr(e.exposed)), {
                get(t, i) {
                    if (i in t) return t[i];
                    if (i in bi) return bi[i](e);
                },
                has(t, i) {
                    return i in t || i in bi;
                },
            }))
        );
}
function cn(e, t = !0) {
    return G(e) ? e.displayName || e.name : e.name || (t && e.__name);
}
function yc(e) {
    return G(e) && "__vccOpts" in e;
}
const Te = (e, t) => mo(e, t, Zt);
function tt(e, t, i) {
    const s = arguments.length;
    return s === 2 ? (he(t) && !z(t) ? (Yt(t) ? Z(e, null, [t]) : Z(e, t)) : Z(e, null, t)) : (s > 3 ? (i = Array.prototype.slice.call(arguments, 2)) : s === 3 && Yt(i) && (i = [i]), Z(e, t, i));
}
const qc = Symbol.for("v-scx"),
    wc = () => Le(qc),
    Nl = "3.3.4",
    Pc = "http://www.w3.org/2000/svg",
    Ct = typeof document < "u" ? document : null,
    Na = Ct && Ct.createElement("template"),
    Ec = {
        insert: (e, t, i) => {
            t.insertBefore(e, i || null);
        },
        remove: (e) => {
            const t = e.parentNode;
            t && t.removeChild(e);
        },
        createElement: (e, t, i, s) => {
            const n = t ? Ct.createElementNS(Pc, e) : Ct.createElement(e, i ? { is: i } : void 0);
            return e === "select" && s && s.multiple != null && n.setAttribute("multiple", s.multiple), n;
        },
        createText: (e) => Ct.createTextNode(e),
        createComment: (e) => Ct.createComment(e),
        setText: (e, t) => {
            e.nodeValue = t;
        },
        setElementText: (e, t) => {
            e.textContent = t;
        },
        parentNode: (e) => e.parentNode,
        nextSibling: (e) => e.nextSibling,
        querySelector: (e) => Ct.querySelector(e),
        setScopeId(e, t) {
            e.setAttribute(t, "");
        },
        insertStaticContent(e, t, i, s, n, a) {
            const r = i ? i.previousSibling : t.lastChild;
            if (n && (n === a || n.nextSibling)) for (; t.insertBefore(n.cloneNode(!0), i), !(n === a || !(n = n.nextSibling)); );
            else {
                Na.innerHTML = s ? `<svg>${e}</svg>` : e;
                const u = Na.content;
                if (s) {
                    const l = u.firstChild;
                    for (; l.firstChild; ) u.appendChild(l.firstChild);
                    u.removeChild(l);
                }
                t.insertBefore(u, i);
            }
            return [r ? r.nextSibling : t.firstChild, i ? i.previousSibling : t.lastChild];
        },
    };
function xc(e, t, i) {
    const s = e._vtc;
    s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : i ? e.setAttribute("class", t) : (e.className = t);
}
function jc(e, t, i) {
    const s = e.style,
        n = fe(i);
    if (i && !n) {
        if (t && !fe(t)) for (const a in t) i[a] == null && dn(s, a, "");
        for (const a in i) dn(s, a, i[a]);
    } else {
        const a = s.display;
        n ? t !== i && (s.cssText = i) : t && e.removeAttribute("style"), "_vod" in e && (s.display = a);
    }
}
const Ma = /\s*!important$/;
function dn(e, t, i) {
    if (z(i)) i.forEach((s) => dn(e, t, s));
    else if ((i == null && (i = ""), t.startsWith("--"))) e.setProperty(t, i);
    else {
        const s = Cc(e, t);
        Ma.test(i) ? e.setProperty(ii(s), i.replace(Ma, ""), "important") : (e[s] = i);
    }
}
const Ia = ["Webkit", "Moz", "ms"],
    Ds = {};
function Cc(e, t) {
    const i = Ds[t];
    if (i) return i;
    let s = it(t);
    if (s !== "filter" && s in e) return (Ds[t] = s);
    s = vs(s);
    for (let n = 0; n < Ia.length; n++) {
        const a = Ia[n] + s;
        if (a in e) return (Ds[t] = a);
    }
    return t;
}
const Oa = "http://www.w3.org/1999/xlink";
function Ac(e, t, i, s, n) {
    if (s && t.startsWith("xlink:")) i == null ? e.removeAttributeNS(Oa, t.slice(6, t.length)) : e.setAttributeNS(Oa, t, i);
    else {
        const a = Au(t);
        i == null || (a && !kr(i)) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : i);
    }
}
function kc(e, t, i, s, n, a, r) {
    if (t === "innerHTML" || t === "textContent") {
        s && r(s, n, a), (e[t] = i ?? "");
        return;
    }
    const u = e.tagName;
    if (t === "value" && u !== "PROGRESS" && !u.includes("-")) {
        e._value = i;
        const o = u === "OPTION" ? e.getAttribute("value") : e.value,
            c = i ?? "";
        o !== c && (e.value = c), i == null && e.removeAttribute(t);
        return;
    }
    let l = !1;
    if (i === "" || i == null) {
        const o = typeof e[t];
        o === "boolean" ? (i = kr(i)) : i == null && o === "string" ? ((i = ""), (l = !0)) : o === "number" && ((i = 0), (l = !0));
    }
    try {
        e[t] = i;
    } catch {}
    l && e.removeAttribute(t);
}
function Tc(e, t, i, s) {
    e.addEventListener(t, i, s);
}
function Sc(e, t, i, s) {
    e.removeEventListener(t, i, s);
}
function Rc(e, t, i, s, n = null) {
    const a = e._vei || (e._vei = {}),
        r = a[t];
    if (s && r) r.value = s;
    else {
        const [u, l] = Nc(t);
        if (s) {
            const o = (a[t] = Oc(s, n));
            Tc(e, u, o, l);
        } else r && (Sc(e, u, r, l), (a[t] = void 0));
    }
}
const La = /(?:Once|Passive|Capture)$/;
function Nc(e) {
    let t;
    if (La.test(e)) {
        t = {};
        let s;
        for (; (s = e.match(La)); ) (e = e.slice(0, e.length - s[0].length)), (t[s[0].toLowerCase()] = !0);
    }
    return [e[2] === ":" ? e.slice(3) : ii(e.slice(2)), t];
}
let $s = 0;
const Mc = Promise.resolve(),
    Ic = () => $s || (Mc.then(() => ($s = 0)), ($s = Date.now()));
function Oc(e, t) {
    const i = (s) => {
        if (!s._vts) s._vts = Date.now();
        else if (s._vts <= i.attached) return;
        De(Lc(s, i.value), t, 5, [s]);
    };
    return (i.value = e), (i.attached = Ic()), i;
}
function Lc(e, t) {
    if (z(t)) {
        const i = e.stopImmediatePropagation;
        return (
            (e.stopImmediatePropagation = () => {
                i.call(e), (e._stopped = !0);
            }),
            t.map((s) => (n) => !n._stopped && s && s(n))
        );
    } else return t;
}
const Ha = /^on[a-z]/,
    Hc = (e, t, i, s, n = !1, a, r, u, l) => {
        t === "class"
            ? xc(e, s, n)
            : t === "style"
            ? jc(e, i, s)
            : Mi(t)
            ? Cn(t) || Rc(e, t, i, s, r)
            : (t[0] === "." ? ((t = t.slice(1)), !0) : t[0] === "^" ? ((t = t.slice(1)), !1) : Fc(e, t, s, n))
            ? kc(e, t, s, a, r, u, l)
            : (t === "true-value" ? (e._trueValue = s) : t === "false-value" && (e._falseValue = s), Ac(e, t, s, n));
    };
function Fc(e, t, i, s) {
    return s
        ? !!(t === "innerHTML" || t === "textContent" || (t in e && Ha.test(t) && G(i)))
        : t === "spellcheck" || t === "draggable" || t === "translate" || t === "form" || (t === "list" && e.tagName === "INPUT") || (t === "type" && e.tagName === "TEXTAREA") || (Ha.test(t) && fe(i))
        ? !1
        : t in e;
}
const ht = "transition",
    oi = "animation",
    As = (e, { slots: t }) => tt(No, Uc(e), t);
As.displayName = "Transition";
const Ml = {
    name: String,
    type: String,
    css: { type: Boolean, default: !0 },
    duration: [String, Number, Object],
    enterFromClass: String,
    enterActiveClass: String,
    enterToClass: String,
    appearFromClass: String,
    appearActiveClass: String,
    appearToClass: String,
    leaveFromClass: String,
    leaveActiveClass: String,
    leaveToClass: String,
};
As.props = ye({}, al, Ml);
const Pt = (e, t = []) => {
        z(e) ? e.forEach((i) => i(...t)) : e && e(...t);
    },
    Fa = (e) => (e ? (z(e) ? e.some((t) => t.length > 1) : e.length > 1) : !1);
function Uc(e) {
    const t = {};
    for (const H in e) H in Ml || (t[H] = e[H]);
    if (e.css === !1) return t;
    const {
            name: i = "v",
            type: s,
            duration: n,
            enterFromClass: a = `${i}-enter-from`,
            enterActiveClass: r = `${i}-enter-active`,
            enterToClass: u = `${i}-enter-to`,
            appearFromClass: l = a,
            appearActiveClass: o = r,
            appearToClass: c = u,
            leaveFromClass: d = `${i}-leave-from`,
            leaveActiveClass: h = `${i}-leave-active`,
            leaveToClass: v = `${i}-leave-to`,
        } = e,
        b = Dc(n),
        q = b && b[0],
        T = b && b[1],
        { onBeforeEnter: f, onEnter: g, onEnterCancelled: E, onLeave: y, onLeaveCancelled: C, onBeforeAppear: N = f, onAppear: S = g, onAppearCancelled: P = E } = t,
        O = (H, J, U) => {
            Et(H, J ? c : u), Et(H, J ? o : r), U && U();
        },
        D = (H, J) => {
            (H._isLeaving = !1), Et(H, d), Et(H, v), Et(H, h), J && J();
        },
        Q = (H) => (J, U) => {
            const ve = H ? S : g,
                ie = () => O(J, H, U);
            Pt(ve, [J, ie]),
                Ua(() => {
                    Et(J, H ? l : a), pt(J, H ? c : u), Fa(ve) || Da(J, s, q, ie);
                });
        };
    return ye(t, {
        onBeforeEnter(H) {
            Pt(f, [H]), pt(H, a), pt(H, r);
        },
        onBeforeAppear(H) {
            Pt(N, [H]), pt(H, l), pt(H, o);
        },
        onEnter: Q(!1),
        onAppear: Q(!0),
        onLeave(H, J) {
            H._isLeaving = !0;
            const U = () => D(H, J);
            pt(H, d),
                Vc(),
                pt(H, h),
                Ua(() => {
                    H._isLeaving && (Et(H, d), pt(H, v), Fa(y) || Da(H, s, T, U));
                }),
                Pt(y, [H, U]);
        },
        onEnterCancelled(H) {
            O(H, !1), Pt(E, [H]);
        },
        onAppearCancelled(H) {
            O(H, !0), Pt(P, [H]);
        },
        onLeaveCancelled(H) {
            D(H), Pt(C, [H]);
        },
    });
}
function Dc(e) {
    if (e == null) return null;
    if (he(e)) return [Bs(e.enter), Bs(e.leave)];
    {
        const t = Bs(e);
        return [t, t];
    }
}
function Bs(e) {
    return Ar(e);
}
function pt(e, t) {
    t.split(/\s+/).forEach((i) => i && e.classList.add(i)), (e._vtc || (e._vtc = new Set())).add(t);
}
function Et(e, t) {
    t.split(/\s+/).forEach((s) => s && e.classList.remove(s));
    const { _vtc: i } = e;
    i && (i.delete(t), i.size || (e._vtc = void 0));
}
function Ua(e) {
    requestAnimationFrame(() => {
        requestAnimationFrame(e);
    });
}
let $c = 0;
function Da(e, t, i, s) {
    const n = (e._endId = ++$c),
        a = () => {
            n === e._endId && s();
        };
    if (i) return setTimeout(a, i);
    const { type: r, timeout: u, propCount: l } = Bc(e, t);
    if (!r) return s();
    const o = r + "end";
    let c = 0;
    const d = () => {
            e.removeEventListener(o, h), a();
        },
        h = (v) => {
            v.target === e && ++c >= l && d();
        };
    setTimeout(() => {
        c < l && d();
    }, u + 1),
        e.addEventListener(o, h);
}
function Bc(e, t) {
    const i = window.getComputedStyle(e),
        s = (b) => (i[b] || "").split(", "),
        n = s(`${ht}Delay`),
        a = s(`${ht}Duration`),
        r = $a(n, a),
        u = s(`${oi}Delay`),
        l = s(`${oi}Duration`),
        o = $a(u, l);
    let c = null,
        d = 0,
        h = 0;
    t === ht ? r > 0 && ((c = ht), (d = r), (h = a.length)) : t === oi ? o > 0 && ((c = oi), (d = o), (h = l.length)) : ((d = Math.max(r, o)), (c = d > 0 ? (r > o ? ht : oi) : null), (h = c ? (c === ht ? a.length : l.length) : 0));
    const v = c === ht && /\b(transform|all)(,|$)/.test(s(`${ht}Property`).toString());
    return { type: c, timeout: d, propCount: h, hasTransform: v };
}
function $a(e, t) {
    for (; e.length < t.length; ) e = e.concat(e);
    return Math.max(...t.map((i, s) => Ba(i) + Ba(e[s])));
}
function Ba(e) {
    return Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function Vc() {
    return document.body.offsetHeight;
}
const Wc = {
    beforeMount(e, { value: t }, { transition: i }) {
        (e._vod = e.style.display === "none" ? "" : e.style.display), i && t ? i.beforeEnter(e) : ci(e, t);
    },
    mounted(e, { value: t }, { transition: i }) {
        i && t && i.enter(e);
    },
    updated(e, { value: t, oldValue: i }, { transition: s }) {
        !t != !i &&
            (s
                ? t
                    ? (s.beforeEnter(e), ci(e, !0), s.enter(e))
                    : s.leave(e, () => {
                          ci(e, !1);
                      })
                : ci(e, t));
    },
    beforeUnmount(e, { value: t }) {
        ci(e, t);
    },
};
function ci(e, t) {
    e.style.display = t ? e._vod : "none";
}
const Il = ye({ patchProp: Hc }, Ec);
let qi,
    Va = !1;
function Kc() {
    return qi || (qi = sc(Il));
}
function Qc() {
    return (qi = Va ? qi : nc(Il)), (Va = !0), qi;
}
const zc = (...e) => {
        const t = Kc().createApp(...e),
            { mount: i } = t;
        return (
            (t.mount = (s) => {
                const n = Ol(s);
                if (!n) return;
                const a = t._component;
                !G(a) && !a.render && !a.template && (a.template = n.innerHTML), (n.innerHTML = "");
                const r = i(n, !1, n instanceof SVGElement);
                return n instanceof Element && (n.removeAttribute("v-cloak"), n.setAttribute("data-v-app", "")), r;
            }),
            t
        );
    },
    Jc = (...e) => {
        const t = Qc().createApp(...e),
            { mount: i } = t;
        return (
            (t.mount = (s) => {
                const n = Ol(s);
                if (n) return i(n, !0, n instanceof SVGElement);
            }),
            t
        );
    };
function Ol(e) {
    return fe(e) ? document.querySelector(e) : e;
}
const Gc = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,
    Yc = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,
    Xc = /^\s*["[{]|^\s*-?\d[\d.]{0,14}\s*$/;
function Zc(e, t) {
    if (e !== "__proto__" && !(e === "constructor" && t && typeof t == "object" && "prototype" in t)) return t;
}
function ed(e, t = {}) {
    if (typeof e != "string") return e;
    const i = e.toLowerCase().trim();
    if (i === "true") return !0;
    if (i === "false") return !1;
    if (i === "null") return null;
    if (i === "nan") return Number.NaN;
    if (i === "infinity") return Number.POSITIVE_INFINITY;
    if (i !== "undefined") {
        if (!Xc.test(e)) {
            if (t.strict) throw new SyntaxError("Invalid JSON");
            return e;
        }
        try {
            return Gc.test(e) || Yc.test(e) ? JSON.parse(e, Zc) : JSON.parse(e);
        } catch (s) {
            if (t.strict) throw s;
            return e;
        }
    }
}
const td = /#/g,
    id = /&/g,
    sd = /=/g,
    Ll = /\+/g,
    nd = /%5e/gi,
    ad = /%60/gi,
    rd = /%7c/gi,
    ld = /%20/gi;
function ud(e) {
    return encodeURI("" + e).replace(rd, "|");
}
function mn(e) {
    return ud(typeof e == "string" ? e : JSON.stringify(e))
        .replace(Ll, "%2B")
        .replace(ld, "+")
        .replace(td, "%23")
        .replace(id, "%26")
        .replace(ad, "`")
        .replace(nd, "^");
}
function Vs(e) {
    return mn(e).replace(sd, "%3D");
}
function Hl(e = "") {
    try {
        return decodeURIComponent("" + e);
    } catch {
        return "" + e;
    }
}
function od(e) {
    return Hl(e.replace(Ll, " "));
}
function cd(e = "") {
    const t = {};
    e[0] === "?" && (e = e.slice(1));
    for (const i of e.split("&")) {
        const s = i.match(/([^=]+)=?(.*)/) || [];
        if (s.length < 2) continue;
        const n = Hl(s[1]);
        if (n === "__proto__" || n === "constructor") continue;
        const a = od(s[2] || "");
        typeof t[n] < "u" ? (Array.isArray(t[n]) ? t[n].push(a) : (t[n] = [t[n], a])) : (t[n] = a);
    }
    return t;
}
function dd(e, t) {
    return (typeof t == "number" || typeof t == "boolean") && (t = String(t)), t ? (Array.isArray(t) ? t.map((i) => `${Vs(e)}=${mn(i)}`).join("&") : `${Vs(e)}=${mn(t)}`) : Vs(e);
}
function md(e) {
    return Object.keys(e)
        .filter((t) => e[t] !== void 0)
        .map((t) => dd(t, e[t]))
        .join("&");
}
const hd = /^\w{2,}:([/\\]{1,2})/,
    pd = /^\w{2,}:([/\\]{2})?/,
    gd = /^([/\\]\s*){2,}[^/\\]/;
function Hi(e, t = {}) {
    return typeof t == "boolean" && (t = { acceptRelative: t }), t.strict ? hd.test(e) : pd.test(e) || (t.acceptRelative ? gd.test(e) : !1);
}
const fd = /\/$|\/\?/;
function hn(e = "", t = !1) {
    return t ? fd.test(e) : e.endsWith("/");
}
function Fl(e = "", t = !1) {
    if (!t) return (hn(e) ? e.slice(0, -1) : e) || "/";
    if (!hn(e, !0)) return e || "/";
    const [i, ...s] = e.split("?");
    return (i.slice(0, -1) || "/") + (s.length > 0 ? `?${s.join("?")}` : "");
}
function vd(e = "", t = !1) {
    if (!t) return e.endsWith("/") ? e : e + "/";
    if (hn(e, !0)) return e || "/";
    const [i, ...s] = e.split("?");
    return i + "/" + (s.length > 0 ? `?${s.join("?")}` : "");
}
function bd(e = "") {
    return e.startsWith("/");
}
function _d(e = "") {
    return (bd(e) ? e.slice(1) : e) || "/";
}
function yd(e, t) {
    if (Ul(t) || Hi(e)) return e;
    const i = Fl(t);
    return e.startsWith(i) ? e : Fi(i, e);
}
function Wa(e, t) {
    if (Ul(t)) return e;
    const i = Fl(t);
    if (!e.startsWith(i)) return e;
    const s = e.slice(i.length);
    return s[0] === "/" ? s : "/" + s;
}
function qd(e, t) {
    const i = ks(e),
        s = { ...cd(i.search), ...t };
    return (i.search = md(s)), Pd(i);
}
function Ul(e) {
    return !e || e === "/";
}
function wd(e) {
    return e && e !== "/";
}
function Fi(e, ...t) {
    let i = e || "";
    for (const s of t.filter((n) => wd(n))) i = i ? vd(i) + _d(s) : s;
    return i;
}
function ks(e = "", t) {
    if (!Hi(e, { acceptRelative: !0 })) return t ? ks(t + e) : Ka(e);
    const [i = "", s, n = ""] = (e.replace(/\\/g, "/").match(/([^/:]+:)?\/\/([^/@]+@)?(.*)/) || []).splice(1),
        [a = "", r = ""] = (n.match(/([^#/?]*)(.*)?/) || []).splice(1),
        { pathname: u, search: l, hash: o } = Ka(r.replace(/\/(?=[A-Za-z]:)/, ""));
    return { protocol: i, auth: s ? s.slice(0, Math.max(0, s.length - 1)) : "", host: a, pathname: u, search: l, hash: o };
}
function Ka(e = "") {
    const [t = "", i = "", s = ""] = (e.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
    return { pathname: t, search: i, hash: s };
}
function Pd(e) {
    const t = e.pathname + (e.search ? (e.search.startsWith("?") ? "" : "?") + e.search : "") + e.hash;
    return e.protocol ? e.protocol + "//" + (e.auth ? e.auth + "@" : "") + e.host + t : t;
}
class Ed extends Error {
    constructor() {
        super(...arguments), (this.name = "FetchError");
    }
}
function xd(e, t, i) {
    let s = "";
    t && (s = t.message), e && i ? (s = `${s} (${i.status} ${i.statusText} (${e.toString()}))`) : e && (s = `${s} (${e.toString()})`);
    const n = new Ed(s);
    return (
        Object.defineProperty(n, "request", {
            get() {
                return e;
            },
        }),
        Object.defineProperty(n, "response", {
            get() {
                return i;
            },
        }),
        Object.defineProperty(n, "data", {
            get() {
                return i && i._data;
            },
        }),
        Object.defineProperty(n, "status", {
            get() {
                return i && i.status;
            },
        }),
        Object.defineProperty(n, "statusText", {
            get() {
                return i && i.statusText;
            },
        }),
        Object.defineProperty(n, "statusCode", {
            get() {
                return i && i.status;
            },
        }),
        Object.defineProperty(n, "statusMessage", {
            get() {
                return i && i.statusText;
            },
        }),
        n
    );
}
const jd = new Set(Object.freeze(["PATCH", "POST", "PUT", "DELETE"]));
function Qa(e = "GET") {
    return jd.has(e.toUpperCase());
}
function Cd(e) {
    if (e === void 0) return !1;
    const t = typeof e;
    return t === "string" || t === "number" || t === "boolean" || t === null ? !0 : t !== "object" ? !1 : Array.isArray(e) ? !0 : (e.constructor && e.constructor.name === "Object") || typeof e.toJSON == "function";
}
const Ad = new Set(["image/svg", "application/xml", "application/xhtml", "application/html"]),
    kd = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function Td(e = "") {
    if (!e) return "json";
    const t = e.split(";").shift() || "";
    return kd.test(t) ? "json" : Ad.has(t) || t.startsWith("text/") ? "text" : "blob";
}
const Sd = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
function Dl(e) {
    const { fetch: t, Headers: i } = e;
    function s(r) {
        const u = (r.error && r.error.name === "AbortError") || !1;
        if (r.options.retry !== !1 && !u) {
            let o;
            typeof r.options.retry == "number" ? (o = r.options.retry) : (o = Qa(r.options.method) ? 0 : 1);
            const c = (r.response && r.response.status) || 500;
            if (o > 0 && Sd.has(c)) return n(r.request, { ...r.options, retry: o - 1 });
        }
        const l = xd(r.request, r.error, r.response);
        throw (Error.captureStackTrace && Error.captureStackTrace(l, n), l);
    }
    const n = async function (u, l = {}) {
            const o = { request: u, options: { ...e.defaults, ...l }, response: void 0, error: void 0 };
            o.options.onRequest && (await o.options.onRequest(o)),
                typeof o.request == "string" &&
                    (o.options.baseURL && (o.request = yd(o.request, o.options.baseURL)),
                    (o.options.query || o.options.params) && (o.request = qd(o.request, { ...o.options.params, ...o.options.query })),
                    o.options.body &&
                        Qa(o.options.method) &&
                        Cd(o.options.body) &&
                        ((o.options.body = typeof o.options.body == "string" ? o.options.body : JSON.stringify(o.options.body)),
                        (o.options.headers = new i(o.options.headers)),
                        o.options.headers.has("content-type") || o.options.headers.set("content-type", "application/json"),
                        o.options.headers.has("accept") || o.options.headers.set("accept", "application/json"))),
                (o.response = await t(o.request, o.options).catch(async (d) => ((o.error = d), o.options.onRequestError && (await o.options.onRequestError(o)), s(o))));
            const c = (o.options.parseResponse ? "json" : o.options.responseType) || Td(o.response.headers.get("content-type") || "");
            if (c === "json") {
                const d = await o.response.text(),
                    h = o.options.parseResponse || ed;
                o.response._data = h(d);
            } else c === "stream" ? (o.response._data = o.response.body) : (o.response._data = await o.response[c]());
            return o.options.onResponse && (await o.options.onResponse(o)), o.response.status >= 400 && o.response.status < 600 ? (o.options.onResponseError && (await o.options.onResponseError(o)), s(o)) : o.response;
        },
        a = function (u, l) {
            return n(u, l).then((o) => o._data);
        };
    return (a.raw = n), (a.native = t), (a.create = (r = {}) => Dl({ ...e, defaults: { ...e.defaults, ...r } })), a;
}
const $l = (function () {
        if (typeof globalThis < "u") return globalThis;
        if (typeof self < "u") return self;
        if (typeof window < "u") return window;
        if (typeof global < "u") return global;
        throw new Error("unable to locate global object");
    })(),
    Rd = $l.fetch || (() => Promise.reject(new Error("[ofetch] global.fetch is not supported!"))),
    Nd = $l.Headers,
    Md = Dl({ fetch: Rd, Headers: Nd }),
    Id = Md,
    Od = () => {
        var e;
        return ((e = window == null ? void 0 : window.__NUXT__) == null ? void 0 : e.config) || {};
    },
    cs = Od().app,
    Ld = () => cs.baseURL,
    Hd = () => cs.buildAssetsDir,
    Fd = (...e) => Fi(Bl(), Hd(), ...e),
    Bl = (...e) => {
        const t = cs.cdnURL || cs.baseURL;
        return e.length ? Fi(t, ...e) : t;
    };
(globalThis.__buildAssetsURL = Fd), (globalThis.__publicAssetsURL = Bl);
function pn(e, t = {}, i) {
    for (const s in e) {
        const n = e[s],
            a = i ? `${i}:${s}` : s;
        typeof n == "object" && n !== null ? pn(n, t, a) : typeof n == "function" && (t[a] = n);
    }
    return t;
}
const Ud = { run: (e) => e() },
    Dd = () => Ud,
    Vl = typeof console.createTask < "u" ? console.createTask : Dd;
function $d(e, t) {
    const i = t.shift(),
        s = Vl(i);
    return e.reduce((n, a) => n.then(() => s.run(() => a(...t))), Promise.resolve());
}
function Bd(e, t) {
    const i = t.shift(),
        s = Vl(i);
    return Promise.all(e.map((n) => s.run(() => n(...t))));
}
function Ws(e, t) {
    for (const i of [...e]) i(t);
}
class Vd {
    constructor() {
        (this._hooks = {}),
            (this._before = void 0),
            (this._after = void 0),
            (this._deprecatedMessages = void 0),
            (this._deprecatedHooks = {}),
            (this.hook = this.hook.bind(this)),
            (this.callHook = this.callHook.bind(this)),
            (this.callHookWith = this.callHookWith.bind(this));
    }
    hook(t, i, s = {}) {
        if (!t || typeof i != "function") return () => {};
        const n = t;
        let a;
        for (; this._deprecatedHooks[t]; ) (a = this._deprecatedHooks[t]), (t = a.to);
        if (a && !s.allowDeprecated) {
            let r = a.message;
            r || (r = `${n} hook has been deprecated` + (a.to ? `, please use ${a.to}` : "")), this._deprecatedMessages || (this._deprecatedMessages = new Set()), this._deprecatedMessages.has(r) || (console.warn(r), this._deprecatedMessages.add(r));
        }
        if (!i.name)
            try {
                Object.defineProperty(i, "name", { get: () => "_" + t.replace(/\W+/g, "_") + "_hook_cb", configurable: !0 });
            } catch {}
        return (
            (this._hooks[t] = this._hooks[t] || []),
            this._hooks[t].push(i),
            () => {
                i && (this.removeHook(t, i), (i = void 0));
            }
        );
    }
    hookOnce(t, i) {
        let s,
            n = (...a) => (typeof s == "function" && s(), (s = void 0), (n = void 0), i(...a));
        return (s = this.hook(t, n)), s;
    }
    removeHook(t, i) {
        if (this._hooks[t]) {
            const s = this._hooks[t].indexOf(i);
            s !== -1 && this._hooks[t].splice(s, 1), this._hooks[t].length === 0 && delete this._hooks[t];
        }
    }
    deprecateHook(t, i) {
        this._deprecatedHooks[t] = typeof i == "string" ? { to: i } : i;
        const s = this._hooks[t] || [];
        delete this._hooks[t];
        for (const n of s) this.hook(t, n);
    }
    deprecateHooks(t) {
        Object.assign(this._deprecatedHooks, t);
        for (const i in t) this.deprecateHook(i, t[i]);
    }
    addHooks(t) {
        const i = pn(t),
            s = Object.keys(i).map((n) => this.hook(n, i[n]));
        return () => {
            for (const n of s.splice(0, s.length)) n();
        };
    }
    removeHooks(t) {
        const i = pn(t);
        for (const s in i) this.removeHook(s, i[s]);
    }
    removeAllHooks() {
        for (const t in this._hooks) delete this._hooks[t];
    }
    callHook(t, ...i) {
        return i.unshift(t), this.callHookWith($d, t, ...i);
    }
    callHookParallel(t, ...i) {
        return i.unshift(t), this.callHookWith(Bd, t, ...i);
    }
    callHookWith(t, i, ...s) {
        const n = this._before || this._after ? { name: i, args: s, context: {} } : void 0;
        this._before && Ws(this._before, n);
        const a = t(i in this._hooks ? [...this._hooks[i]] : [], s);
        return a instanceof Promise
            ? a.finally(() => {
                  this._after && n && Ws(this._after, n);
              })
            : (this._after && n && Ws(this._after, n), a);
    }
    beforeEach(t) {
        return (
            (this._before = this._before || []),
            this._before.push(t),
            () => {
                if (this._before !== void 0) {
                    const i = this._before.indexOf(t);
                    i !== -1 && this._before.splice(i, 1);
                }
            }
        );
    }
    afterEach(t) {
        return (
            (this._after = this._after || []),
            this._after.push(t),
            () => {
                if (this._after !== void 0) {
                    const i = this._after.indexOf(t);
                    i !== -1 && this._after.splice(i, 1);
                }
            }
        );
    }
}
function Wl() {
    return new Vd();
}
function Wd(e = {}) {
    let t,
        i = !1;
    const s = (r) => {
        if (t && t !== r) throw new Error("Context conflict");
    };
    let n;
    if (e.asyncContext) {
        const r = e.AsyncLocalStorage || globalThis.AsyncLocalStorage;
        r ? (n = new r()) : console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
    const a = () => {
        if (n && t === void 0) {
            const r = n.getStore();
            if (r !== void 0) return r;
        }
        return t;
    };
    return {
        use: () => {
            const r = a();
            if (r === void 0) throw new Error("Context is not available");
            return r;
        },
        tryUse: () => a(),
        set: (r, u) => {
            u || s(r), (t = r), (i = !0);
        },
        unset: () => {
            (t = void 0), (i = !1);
        },
        call: (r, u) => {
            s(r), (t = r);
            try {
                return n ? n.run(r, u) : u();
            } finally {
                i || (t = void 0);
            }
        },
        async callAsync(r, u) {
            t = r;
            const l = () => {
                    t = r;
                },
                o = () => (t === r ? l : void 0);
            gn.add(o);
            try {
                const c = n ? n.run(r, u) : u();
                return i || (t = void 0), await c;
            } finally {
                gn.delete(o);
            }
        },
    };
}
function Kd(e = {}) {
    const t = {};
    return {
        get(i, s = {}) {
            return t[i] || (t[i] = Wd({ ...e, ...s })), t[i], t[i];
        },
    };
}
const ds = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : typeof window < "u" ? window : {},
    za = "__unctx__",
    Qd = ds[za] || (ds[za] = Kd()),
    zd = (e, t = {}) => Qd.get(e, t),
    Ja = "__unctx_async_handlers__",
    gn = ds[Ja] || (ds[Ja] = new Set());
function ms(e) {
    const t = [];
    for (const n of gn) {
        const a = n();
        a && t.push(a);
    }
    const i = () => {
        for (const n of t) n();
    };
    let s = e();
    return (
        s &&
            typeof s == "object" &&
            "catch" in s &&
            (s = s.catch((n) => {
                throw (i(), n);
            })),
        [s, i]
    );
}
const Kl = zd("nuxt-app"),
    Jd = "__nuxt_plugin";
function Gd(e) {
    let t = 0;
    const i = {
        provide: void 0,
        globalName: "nuxt",
        versions: {
            get nuxt() {
                return "3.5.2";
            },
            get vue() {
                return i.vueApp.version;
            },
        },
        payload: Qe({ data: {}, state: {}, _errors: {}, ...(window.__NUXT__ ?? {}) }),
        static: { data: {} },
        runWithContext: (n) => em(i, n),
        isHydrating: !0,
        deferHydration() {
            if (!i.isHydrating) return () => {};
            t++;
            let n = !1;
            return () => {
                if (!n && ((n = !0), t--, t === 0)) return (i.isHydrating = !1), i.callHook("app:suspense:resolve");
            };
        },
        _asyncDataPromises: {},
        _asyncData: {},
        _payloadRevivers: {},
        ...e,
    };
    (i.hooks = Wl()),
        (i.hook = i.hooks.hook),
        (i.callHook = i.hooks.callHook),
        (i.provide = (n, a) => {
            const r = "$" + n;
            Gi(i, r, a), Gi(i.vueApp.config.globalProperties, r, a);
        }),
        Gi(i.vueApp, "$nuxt", i),
        Gi(i.vueApp.config.globalProperties, "$nuxt", i);
    {
        window.addEventListener("nuxt.preloadError", (a) => {
            i.callHook("app:chunkError", { error: a.payload });
        });
        const n = i.hook("app:error", (...a) => {
            console.error("[nuxt] error caught during app initialization", ...a);
        });
        i.hook("app:mounted", n);
    }
    const s = Qe(i.payload.config);
    return i.provide("config", s), i;
}
async function Yd(e, t) {
    if (typeof t != "function") return;
    const { provide: i } = (await e.runWithContext(() => t(e))) || {};
    if (i && typeof i == "object") for (const s in i) e.provide(s, i[s]);
}
async function Xd(e, t) {
    var n;
    const i = [],
        s = [];
    for (const a of t) {
        const r = Yd(e, a);
        (n = a.meta) != null && n.parallel ? i.push(r.catch((u) => s.push(u))) : await r;
    }
    if ((await Promise.all(i), s.length)) throw s[0];
}
function Zd(e) {
    const t = [];
    for (const i of e) {
        if (typeof i != "function") continue;
        let s = i;
        i.length > 1 && (s = (n) => i(n, n.provide)), t.push(s);
    }
    return (
        t.sort((i, s) => {
            var n, a;
            return (((n = i.meta) == null ? void 0 : n.order) || hs.default) - (((a = s.meta) == null ? void 0 : a.order) || hs.default);
        }),
        t
    );
}
const hs = { pre: -20, default: 0, post: 20 };
function qt(e, t) {
    var s;
    if (typeof e == "function") return qt({ setup: e }, t);
    const i = (n) => {
        if ((e.hooks && n.hooks.addHooks(e.hooks), e.setup)) return e.setup(n);
    };
    return (i.meta = { name: (t == null ? void 0 : t.name) || e.name || ((s = e.setup) == null ? void 0 : s.name), parallel: e.parallel, order: (t == null ? void 0 : t.order) || e.order || hs[e.enforce || "default"] || hs.default }), (i[Jd] = !0), i;
}
function em(e, t, i) {
    const s = () => (i ? t(...i) : t());
    return Kl.set(e), e.vueApp.runWithContext(s);
}
function Ee() {
    var t;
    let e;
    if ((yl() && (e = (t = Li()) == null ? void 0 : t.appContext.app.$nuxt), (e = e || Kl.tryUse()), !e)) throw new Error("[nuxt] instance unavailable");
    return e;
}
function Gn() {
    return Ee().$config;
}
function Gi(e, t, i) {
    Object.defineProperty(e, t, { get: () => i });
}
const tm = "modulepreload",
    im = function (e, t) {
        return e.startsWith(".") ? new URL(e, t).href : e;
    },
    Ga = {},
    sm = function (t, i, s) {
        if (!i || i.length === 0) return t();
        const n = document.getElementsByTagName("link");
        return Promise.all(
            i.map((a) => {
                if (((a = im(a, s)), a in Ga)) return;
                Ga[a] = !0;
                const r = a.endsWith(".css"),
                    u = r ? '[rel="stylesheet"]' : "";
                if (s)
                    for (let c = n.length - 1; c >= 0; c--) {
                        const d = n[c];
                        if (d.href === a && (!r || d.rel === "stylesheet")) return;
                    }
                else if (document.querySelector(`link[href="${a}"]${u}`)) return;
                const o = document.createElement("link");
                if (((o.rel = r ? "stylesheet" : tm), r || ((o.as = "script"), (o.crossOrigin = "")), (o.href = a), document.head.appendChild(o), r))
                    return new Promise((c, d) => {
                        o.addEventListener("load", c), o.addEventListener("error", () => d(new Error(`Unable to preload CSS for ${a}`)));
                    });
            })
        ).then(() => t());
    },
    Yn = (...e) =>
        sm(...e).catch((t) => {
            const i = new Event("nuxt.preloadError");
            throw ((i.payload = t), window.dispatchEvent(i), t);
        }),
    nm = -1,
    am = -2,
    rm = -3,
    lm = -4,
    um = -5,
    om = -6;
function cm(e, t) {
    return dm(JSON.parse(e), t);
}
function dm(e, t) {
    if (typeof e == "number") return n(e, !0);
    if (!Array.isArray(e) || e.length === 0) throw new Error("Invalid input");
    const i = e,
        s = Array(i.length);
    function n(a, r = !1) {
        if (a === nm) return;
        if (a === rm) return NaN;
        if (a === lm) return 1 / 0;
        if (a === um) return -1 / 0;
        if (a === om) return -0;
        if (r) throw new Error("Invalid input");
        if (a in s) return s[a];
        const u = i[a];
        if (!u || typeof u != "object") s[a] = u;
        else if (Array.isArray(u))
            if (typeof u[0] == "string") {
                const l = u[0],
                    o = t == null ? void 0 : t[l];
                if (o) return (s[a] = o(n(u[1])));
                switch (l) {
                    case "Date":
                        s[a] = new Date(u[1]);
                        break;
                    case "Set":
                        const c = new Set();
                        s[a] = c;
                        for (let v = 1; v < u.length; v += 1) c.add(n(u[v]));
                        break;
                    case "Map":
                        const d = new Map();
                        s[a] = d;
                        for (let v = 1; v < u.length; v += 2) d.set(n(u[v]), n(u[v + 1]));
                        break;
                    case "RegExp":
                        s[a] = new RegExp(u[1], u[2]);
                        break;
                    case "Object":
                        s[a] = Object(u[1]);
                        break;
                    case "BigInt":
                        s[a] = BigInt(u[1]);
                        break;
                    case "null":
                        const h = Object.create(null);
                        s[a] = h;
                        for (let v = 1; v < u.length; v += 2) h[u[v]] = n(u[v + 1]);
                        break;
                    default:
                        throw new Error(`Unknown type ${l}`);
                }
            } else {
                const l = new Array(u.length);
                s[a] = l;
                for (let o = 0; o < u.length; o += 1) {
                    const c = u[o];
                    c !== am && (l[o] = n(c));
                }
            }
        else {
            const l = {};
            s[a] = l;
            for (const o in u) {
                const c = u[o];
                l[o] = n(c);
            }
        }
        return s[a];
    }
    return n(0);
}
function mm(e) {
    return Array.isArray(e) ? e : [e];
}
const Ql = ["title", "script", "style", "noscript"],
    zl = ["base", "meta", "link", "style", "script", "noscript"],
    hm = ["title", "titleTemplate", "templateParams", "base", "htmlAttrs", "bodyAttrs", "meta", "link", "style", "script", "noscript"],
    pm = ["base", "title", "titleTemplate", "bodyAttrs", "htmlAttrs", "templateParams"],
    gm = ["tagPosition", "tagPriority", "tagDuplicateStrategy", "innerHTML", "textContent"];
function Jl(e) {
    let t = 9;
    for (let i = 0; i < e.length; ) t = Math.imul(t ^ e.charCodeAt(i++), 9 ** 9);
    return ((t ^ (t >>> 9)) + 65536).toString(16).substring(1, 8).toLowerCase();
}
function fn(e) {
    return Jl(
        `${e.tag}:${e.textContent || e.innerHTML || ""}:${Object.entries(e.props)
            .map(([t, i]) => `${t}:${String(i)}`)
            .join(",")}`
    );
}
function fm(e) {
    let t = 9;
    for (const i of e) for (let s = 0; s < i.length; ) t = Math.imul(t ^ i.charCodeAt(s++), 9 ** 9);
    return ((t ^ (t >>> 9)) + 65536).toString(16).substring(1, 8).toLowerCase();
}
function Gl(e, t) {
    const { props: i, tag: s } = e;
    if (pm.includes(s)) return s;
    if (s === "link" && i.rel === "canonical") return "canonical";
    if (i.charset) return "charset";
    const n = ["id"];
    s === "meta" && n.push("name", "property", "http-equiv");
    for (const a of n)
        if (typeof i[a] < "u") {
            const r = String(i[a]);
            return t && !t(r) ? !1 : `${s}:${a}:${r}`;
        }
    return !1;
}
function Ya(e, t) {
    return e == null ? t || null : typeof e == "function" ? e(t) : e;
}
function Yi(e, t = !1, i) {
    const { tag: s, $el: n } = e;
    n &&
        (Object.entries(s.props).forEach(([a, r]) => {
            r = String(r);
            const u = `attr:${a}`;
            if (a === "class") {
                if (!r) return;
                for (const l of r.split(" ")) {
                    const o = `${u}:${l}`;
                    i && i(e, o, () => n.classList.remove(l)), n.classList.contains(l) || n.classList.add(l);
                }
                return;
            }
            i && !a.startsWith("data-h-") && i(e, u, () => n.removeAttribute(a)), (t || n.getAttribute(a) !== r) && n.setAttribute(a, r);
        }),
        Ql.includes(s.tag) && (s.textContent && s.textContent !== n.textContent ? (n.textContent = s.textContent) : s.innerHTML && s.innerHTML !== n.innerHTML && (n.innerHTML = s.innerHTML)));
}
let di = !1;
async function vm(e, t = {}) {
    var h, v;
    const i = { shouldRender: !0 };
    if ((await e.hooks.callHook("dom:beforeRender", i), !i.shouldRender)) return;
    const s = t.document || e.resolvedOptions.document || window.document,
        n = (await e.resolveTags()).map(u);
    if (e.resolvedOptions.experimentalHashHydration && ((di = di || e._hash || !1), di)) {
        const b = fm(n.map((q) => q.tag._h));
        if (di === b) return;
        di = b;
    }
    const a = e._popSideEffectQueue();
    e.headEntries()
        .map((b) => b._sde)
        .forEach((b) => {
            Object.entries(b).forEach(([q, T]) => {
                a[q] = T;
            });
        });
    const r = (b, q, T) => {
        (q = `${b.renderId}:${q}`), b.entry && (b.entry._sde[q] = T), delete a[q];
    };
    function u(b) {
        const q = e.headEntries().find((f) => f._i === b._e),
            T = { renderId: b._d || fn(b), $el: null, shouldRender: !0, tag: b, entry: q, markSideEffect: (f, g) => r(T, f, g) };
        return T;
    }
    const l = [],
        o = { body: [], head: [] },
        c = (b) => {
            (e._elMap[b.renderId] = b.$el),
                l.push(b),
                r(b, "el", () => {
                    var q;
                    (q = b.$el) == null || q.remove(), delete e._elMap[b.renderId];
                });
        };
    for (const b of n) {
        if ((await e.hooks.callHook("dom:beforeRenderTag", b), !b.shouldRender)) continue;
        const { tag: q } = b;
        if (q.tag === "title") {
            (s.title = q.textContent || ""), l.push(b);
            continue;
        }
        if (q.tag === "htmlAttrs" || q.tag === "bodyAttrs") {
            (b.$el = s[q.tag === "htmlAttrs" ? "documentElement" : "body"]), Yi(b, !1, r), l.push(b);
            continue;
        }
        if (((b.$el = e._elMap[b.renderId]), !b.$el && q.key && (b.$el = s.querySelector(`${(h = q.tagPosition) != null && h.startsWith("body") ? "body" : "head"} > ${q.tag}[data-h-${q._h}]`)), b.$el)) {
            b.tag._d && Yi(b), c(b);
            continue;
        }
        o[(v = q.tagPosition) != null && v.startsWith("body") ? "body" : "head"].push(b);
    }
    const d = { bodyClose: void 0, bodyOpen: void 0, head: void 0 };
    Object.entries(o).forEach(([b, q]) => {
        var f;
        if (!q.length) return;
        const T = (f = s == null ? void 0 : s[b]) == null ? void 0 : f.children;
        if (T) {
            for (const g of [...T].reverse()) {
                const E = g.tagName.toLowerCase();
                if (!zl.includes(E)) continue;
                const y = g.getAttributeNames().reduce((P, O) => ({ ...P, [O]: g.getAttribute(O) }), {}),
                    C = { tag: E, props: y };
                g.innerHTML && (C.innerHTML = g.innerHTML);
                const N = fn(C);
                let S = q.findIndex((P) => (P == null ? void 0 : P.renderId) === N);
                if (S === -1) {
                    const P = Gl(C);
                    S = q.findIndex((O) => (O == null ? void 0 : O.tag._d) && O.tag._d === P);
                }
                if (S !== -1) {
                    const P = q[S];
                    (P.$el = g), Yi(P), c(P), delete q[S];
                }
            }
            q.forEach((g) => {
                const E = g.tag.tagPosition || "head";
                (d[E] = d[E] || s.createDocumentFragment()), g.$el || ((g.$el = s.createElement(g.tag.tag)), Yi(g, !0)), d[E].appendChild(g.$el), c(g);
            });
        }
    }),
        d.head && s.head.appendChild(d.head),
        d.bodyOpen && s.body.insertBefore(d.bodyOpen, s.body.firstChild),
        d.bodyClose && s.body.appendChild(d.bodyClose);
    for (const b of l) await e.hooks.callHook("dom:renderTag", b);
    Object.values(a).forEach((b) => b());
}
let Ks = null;
async function bm(e, t = {}) {
    function i() {
        return (Ks = null), vm(e, t);
    }
    const s = t.delayFn || ((n) => setTimeout(n, 10));
    return (Ks = Ks || new Promise((n) => s(() => n(i()))));
}
function _m(e) {
    return {
        hooks: {
            "entries:updated": function (t) {
                if (typeof (e == null ? void 0 : e.document) > "u" && typeof window > "u") return;
                let i = e == null ? void 0 : e.delayFn;
                !i && typeof requestAnimationFrame < "u" && (i = requestAnimationFrame), bm(t, { document: (e == null ? void 0 : e.document) || window.document, delayFn: i });
            },
        },
    };
}
function ym(e) {
    var t;
    return ((t = e == null ? void 0 : e.head.querySelector('meta[name="unhead:ssr"]')) == null ? void 0 : t.getAttribute("content")) || !1;
}
const Xa = { critical: 2, high: 9, low: 12, base: -1, title: 1, meta: 10 };
function Za(e) {
    if (typeof e.tagPriority == "number") return e.tagPriority;
    if (e.tag === "meta") {
        if (e.props.charset) return -2;
        if (e.props["http-equiv"] === "content-security-policy") return 0;
    }
    const t = e.tagPriority || e.tag;
    return t in Xa ? Xa[t] : 10;
}
const qm = [
    { prefix: "before:", offset: -1 },
    { prefix: "after:", offset: 1 },
];
function wm() {
    return {
        hooks: {
            "tags:resolve": (e) => {
                const t = (i) => {
                    var s;
                    return (s = e.tags.find((n) => n._d === i)) == null ? void 0 : s._p;
                };
                for (const { prefix: i, offset: s } of qm)
                    for (const n of e.tags.filter((a) => typeof a.tagPriority == "string" && a.tagPriority.startsWith(i))) {
                        const a = t(n.tagPriority.replace(i, ""));
                        typeof a < "u" && (n._p = a + s);
                    }
                e.tags.sort((i, s) => i._p - s._p).sort((i, s) => Za(i) - Za(s));
            },
        },
    };
}
function Pm() {
    return {
        hooks: {
            "tags:resolve": (e) => {
                const { tags: t } = e;
                let i = t.findIndex((n) => n.tag === "titleTemplate");
                const s = t.findIndex((n) => n.tag === "title");
                if (s !== -1 && i !== -1) {
                    const n = Ya(t[i].textContent, t[s].textContent);
                    n !== null ? (t[s].textContent = n || t[s].textContent) : delete t[s];
                } else if (i !== -1) {
                    const n = Ya(t[i].textContent);
                    n !== null && ((t[i].textContent = n), (t[i].tag = "title"), (i = -1));
                }
                i !== -1 && delete t[i], (e.tags = t.filter(Boolean));
            },
        },
    };
}
function Em() {
    return {
        hooks: {
            "tag:normalise": function ({ tag: e }) {
                typeof e.props.body < "u" && ((e.tagPosition = "bodyClose"), delete e.props.body);
            },
        },
    };
}
const xm = ["link", "style", "script", "noscript"];
function jm() {
    return {
        hooks: {
            "tag:normalise": ({ tag: e, resolvedOptions: t }) => {
                t.experimentalHashHydration === !0 && (e._h = fn(e)), e.key && xm.includes(e.tag) && ((e._h = Jl(e.key)), (e.props[`data-h-${e._h}`] = ""));
            },
        },
    };
}
const er = ["script", "link", "bodyAttrs"];
function Cm() {
    const e = (t, i) => {
        const s = {},
            n = {};
        Object.entries(i.props).forEach(([r, u]) => {
            r.startsWith("on") && typeof u == "function" ? (n[r] = u) : (s[r] = u);
        });
        let a;
        return t === "dom" && i.tag === "script" && typeof s.src == "string" && typeof n.onload < "u" && ((a = s.src), delete s.src), { props: s, eventHandlers: n, delayedSrc: a };
    };
    return {
        hooks: {
            "ssr:render": function (t) {
                t.tags = t.tags.map((i) => (!er.includes(i.tag) || !Object.entries(i.props).find(([s, n]) => s.startsWith("on") && typeof n == "function") || (i.props = e("ssr", i).props), i));
            },
            "dom:beforeRenderTag": function (t) {
                if (!er.includes(t.tag.tag) || !Object.entries(t.tag.props).find(([a, r]) => a.startsWith("on") && typeof r == "function")) return;
                const { props: i, eventHandlers: s, delayedSrc: n } = e("dom", t.tag);
                Object.keys(s).length && ((t.tag.props = i), (t.tag._eventHandlers = s), (t.tag._delayedSrc = n));
            },
            "dom:renderTag": function (t) {
                const i = t.$el;
                if (!t.tag._eventHandlers || !i) return;
                const s = t.tag.tag === "bodyAttrs" && typeof window < "u" ? window : i;
                Object.entries(t.tag._eventHandlers).forEach(([n, a]) => {
                    const r = `${t.tag._d || t.tag._p}:${n}`,
                        u = n.slice(2).toLowerCase(),
                        l = `data-h-${u}`;
                    if ((t.markSideEffect(r, () => {}), i.hasAttribute(l))) return;
                    const o = a;
                    i.setAttribute(l, ""),
                        s.addEventListener(u, o),
                        t.entry &&
                            (t.entry._sde[r] = () => {
                                s.removeEventListener(u, o), i.removeAttribute(l);
                            });
                }),
                    t.tag._delayedSrc && i.setAttribute("src", t.tag._delayedSrc);
            },
        },
    };
}
const Am = ["templateParams", "htmlAttrs", "bodyAttrs"];
function km() {
    return {
        hooks: {
            "tag:normalise": function ({ tag: e }) {
                ["hid", "vmid", "key"].forEach((s) => {
                    e.props[s] && ((e.key = e.props[s]), delete e.props[s]);
                });
                const i = Gl(e) || (e.key ? `${e.tag}:${e.key}` : !1);
                i && (e._d = i);
            },
            "tags:resolve": function (e) {
                const t = {};
                e.tags.forEach((s) => {
                    const n = (s.key ? `${s.tag}:${s.key}` : s._d) || s._p,
                        a = t[n];
                    if (a) {
                        let u = s == null ? void 0 : s.tagDuplicateStrategy;
                        if ((!u && Am.includes(s.tag) && (u = "merge"), u === "merge")) {
                            const l = a.props;
                            ["class", "style"].forEach((o) => {
                                s.props[o] && l[o] && (o === "style" && !l[o].endsWith(";") && (l[o] += ";"), (s.props[o] = `${l[o]} ${s.props[o]}`));
                            }),
                                (t[n].props = { ...l, ...s.props });
                            return;
                        } else if (s._e === a._e) {
                            (a._duped = a._duped || []), (s._d = `${a._d}:${a._duped.length + 1}`), a._duped.push(s);
                            return;
                        }
                    }
                    const r = Object.keys(s.props).length + (s.innerHTML ? 1 : 0) + (s.textContent ? 1 : 0);
                    if (zl.includes(s.tag) && r === 0) {
                        delete t[n];
                        return;
                    }
                    t[n] = s;
                });
                const i = [];
                Object.values(t).forEach((s) => {
                    const n = s._duped;
                    delete s._duped, i.push(s), n && i.push(...n);
                }),
                    (e.tags = i);
            },
        },
    };
}
function Xi(e, t) {
    function i(a) {
        if (["s", "pageTitle"].includes(a)) return t.pageTitle;
        let r;
        return a.includes(".") ? (r = a.split(".").reduce((u, l) => (u && u[l]) || void 0, t)) : (r = t[a]), typeof r < "u" ? r || "" : !1;
    }
    let s = e;
    try {
        s = decodeURI(e);
    } catch {}
    return (
        (s.match(/%(\w+\.+\w+)|%(\w+)/g) || [])
            .sort()
            .reverse()
            .forEach((a) => {
                const r = i(a.slice(1));
                typeof r == "string" && (e = e.replace(new RegExp(`\\${a}(\\W|$)`, "g"), `${r}$1`).trim());
            }),
        t.separator &&
            (e.endsWith(t.separator) && (e = e.slice(0, -t.separator.length).trim()), e.startsWith(t.separator) && (e = e.slice(t.separator.length).trim()), (e = e.replace(new RegExp(`\\${t.separator}\\s*\\${t.separator}`, "g"), t.separator))),
        e
    );
}
function Tm() {
    return {
        hooks: {
            "tags:resolve": (e) => {
                var a;
                const { tags: t } = e,
                    i = (a = t.find((r) => r.tag === "title")) == null ? void 0 : a.textContent,
                    s = t.findIndex((r) => r.tag === "templateParams"),
                    n = s !== -1 ? t[s].props : {};
                n.pageTitle = n.pageTitle || i || "";
                for (const r of t)
                    if (["titleTemplate", "title"].includes(r.tag) && typeof r.textContent == "string") r.textContent = Xi(r.textContent, n);
                    else if (r.tag === "meta" && typeof r.props.content == "string") r.props.content = Xi(r.props.content, n);
                    else if (r.tag === "link" && typeof r.props.href == "string") r.props.href = Xi(r.props.href, n);
                    else if (r.tag === "script" && ["application/json", "application/ld+json"].includes(r.props.type) && typeof r.innerHTML == "string")
                        try {
                            r.innerHTML = JSON.stringify(JSON.parse(r.innerHTML), (u, l) => (typeof l == "string" ? Xi(l, n) : l));
                        } catch {}
                e.tags = t.filter((r) => r.tag !== "templateParams");
            },
        },
    };
}
const Sm = typeof window < "u";
let Yl;
function Rm(e) {
    return (Yl = e);
}
function Nm() {
    return Yl;
}
async function Mm(e, t) {
    const i = { tag: e, props: {} };
    return e === "templateParams"
        ? ((i.props = t), i)
        : ["title", "titleTemplate"].includes(e)
        ? ((i.textContent = t instanceof Promise ? await t : t), i)
        : typeof t == "string"
        ? ["script", "noscript", "style"].includes(e)
            ? (e === "script" && (/^(https?:)?\/\//.test(t) || t.startsWith("/")) ? (i.props.src = t) : (i.innerHTML = t), i)
            : !1
        : ((i.props = await Om(e, { ...t })),
          i.props.children && (i.props.innerHTML = i.props.children),
          delete i.props.children,
          Object.keys(i.props)
              .filter((s) => gm.includes(s))
              .forEach((s) => {
                  (!["innerHTML", "textContent"].includes(s) || Ql.includes(i.tag)) && (i[s] = i.props[s]), delete i.props[s];
              }),
          ["innerHTML", "textContent"].forEach((s) => {
              if (i.tag === "script" && typeof i[s] == "string" && ["application/ld+json", "application/json"].includes(i.props.type))
                  try {
                      i[s] = JSON.parse(i[s]);
                  } catch {
                      i[s] = "";
                  }
              typeof i[s] == "object" && (i[s] = JSON.stringify(i[s]));
          }),
          i.props.class && (i.props.class = Im(i.props.class)),
          i.props.content && Array.isArray(i.props.content) ? i.props.content.map((s) => ({ ...i, props: { ...i.props, content: s } })) : i);
}
function Im(e) {
    return (
        typeof e == "object" && !Array.isArray(e) && (e = Object.keys(e).filter((t) => e[t])),
        (Array.isArray(e) ? e.join(" ") : e)
            .split(" ")
            .filter((t) => t.trim())
            .filter(Boolean)
            .join(" ")
    );
}
async function Om(e, t) {
    for (const i of Object.keys(t)) {
        const s = i.startsWith("data-");
        t[i] instanceof Promise && (t[i] = await t[i]), String(t[i]) === "true" ? (t[i] = s ? "true" : "") : String(t[i]) === "false" && (s ? (t[i] = "false") : delete t[i]);
    }
    return t;
}
const Lm = 10;
async function Hm(e) {
    const t = [];
    return (
        Object.entries(e.resolvedInput)
            .filter(([i, s]) => typeof s < "u" && hm.includes(i))
            .forEach(([i, s]) => {
                const n = mm(s);
                t.push(...n.map((a) => Mm(i, a)).flat());
            }),
        (await Promise.all(t))
            .flat()
            .filter(Boolean)
            .map((i, s) => ((i._e = e._i), (i._p = (e._i << Lm) + s), i))
    );
}
function Fm() {
    return [km(), wm(), Tm(), Pm(), jm(), Cm(), Em()];
}
function Um(e = {}) {
    return [_m({ document: e == null ? void 0 : e.document, delayFn: e == null ? void 0 : e.domDelayFn })];
}
function Dm(e = {}) {
    const t = $m({ ...e, plugins: [...Um(e), ...((e == null ? void 0 : e.plugins) || [])] });
    return e.experimentalHashHydration && t.resolvedOptions.document && (t._hash = ym(t.resolvedOptions.document)), Rm(t), t;
}
function $m(e = {}) {
    let t = [],
        i = {},
        s = 0;
    const n = Wl();
    e != null && e.hooks && n.addHooks(e.hooks), (e.plugins = [...Fm(), ...((e == null ? void 0 : e.plugins) || [])]), e.plugins.forEach((u) => u.hooks && n.addHooks(u.hooks)), (e.document = e.document || (Sm ? document : void 0));
    const a = () => n.callHook("entries:updated", r),
        r = {
            resolvedOptions: e,
            headEntries() {
                return t;
            },
            get hooks() {
                return n;
            },
            use(u) {
                u.hooks && n.addHooks(u.hooks);
            },
            push(u, l) {
                const o = { _i: s++, input: u, _sde: {} };
                return (
                    l != null && l.mode && (o._m = l == null ? void 0 : l.mode),
                    l != null && l.transform && (o._t = l == null ? void 0 : l.transform),
                    t.push(o),
                    a(),
                    {
                        dispose() {
                            t = t.filter((c) => (c._i !== o._i ? !0 : ((i = { ...i, ...(c._sde || {}) }), (c._sde = {}), a(), !1)));
                        },
                        patch(c) {
                            t = t.map((d) => (d._i === o._i && ((o.input = d.input = c), a()), d));
                        },
                    }
                );
            },
            async resolveTags() {
                const u = { tags: [], entries: [...t] };
                await n.callHook("entries:resolve", u);
                for (const l of u.entries) {
                    const o = l._t || ((c) => c);
                    if (((l.resolvedInput = o(l.resolvedInput || l.input)), l.resolvedInput))
                        for (const c of await Hm(l)) {
                            const d = { tag: c, entry: l, resolvedOptions: r.resolvedOptions };
                            await n.callHook("tag:normalise", d), u.tags.push(d.tag);
                        }
                }
                return await n.callHook("tags:resolve", u), u.tags;
            },
            _popSideEffectQueue() {
                const u = { ...i };
                return (i = {}), u;
            },
            _elMap: {},
        };
    return r.hooks.callHook("init", r), r;
}
function Bm(e) {
    return typeof e == "function" ? e() : pe(e);
}
function ps(e, t = "") {
    if (e instanceof Promise) return e;
    const i = Bm(e);
    return !e || !i ? i : Array.isArray(i) ? i.map((s) => ps(s, t)) : typeof i == "object" ? Object.fromEntries(Object.entries(i).map(([s, n]) => (s === "titleTemplate" || s.startsWith("on") ? [s, pe(n)] : [s, ps(n, s)]))) : i;
}
const Vm = Nl.startsWith("3"),
    Wm = typeof window < "u",
    Xl = "usehead";
function Xn() {
    return (Li() && Le(Xl)) || Nm();
}
function Km(e) {
    return {
        install(i) {
            Vm && ((i.config.globalProperties.$unhead = e), (i.config.globalProperties.$head = e), i.provide(Xl, e));
        },
    }.install;
}
function Qm(e = {}) {
    const t = Dm({ ...e, domDelayFn: (i) => setTimeout(() => ri(() => i()), 10), plugins: [zm(), ...((e == null ? void 0 : e.plugins) || [])] });
    return (t.install = Km(t)), t;
}
function zm() {
    return {
        hooks: {
            "entries:resolve": function (e) {
                for (const t of e.entries) t.resolvedInput = ps(t.input);
            },
        },
    };
}
function Jm(e, t = {}) {
    const i = Xn(),
        s = rt(!1),
        n = rt({});
    Ao(() => {
        n.value = s.value ? {} : ps(e);
    });
    const a = i.push(n.value, t);
    return (
        Qt(n, (u) => {
            a.patch(u);
        }),
        Li() &&
            (xs(() => {
                a.dispose();
            }),
            ol(() => {
                s.value = !0;
            }),
            ul(() => {
                s.value = !1;
            })),
        a
    );
}
function Gm(e, t = {}) {
    return Xn().push(e, t);
}
function Ym(e, t = {}) {
    var s;
    const i = Xn();
    if (i) {
        const n = Wm || !!((s = i.resolvedOptions) != null && s.document);
        return (t.mode === "server" && n) || (t.mode === "client" && !n) ? void 0 : n ? Jm(e, t) : Gm(e, t);
    }
}
const Xm = { meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }, { charset: "utf-8" }], link: [], style: [], script: [], noscript: [] },
    Zm = !1,
    vn = !1,
    eh = !1,
    th = "__nuxt",
    ih = !0;
function tr(e, t = {}) {
    const i = sh(e, t),
        s = Ee(),
        n = (s._payloadCache = s._payloadCache || {});
    return n[i] || (n[i] = Zl(i).then((a) => a || (delete n[i], null))), n[i];
}
const ir = "json";
function sh(e, t = {}) {
    const i = new URL(e, "http://localhost");
    if (i.search) throw new Error("Payload URL cannot contain search params: " + e);
    if (i.host !== "localhost" || Hi(i.pathname, { acceptRelative: !0 })) throw new Error("Payload URL must not include hostname: " + e);
    const s = t.hash || (t.fresh ? Date.now() : "");
    return Fi(Gn().app.baseURL, i.pathname, s ? `_payload.${s}.${ir}` : `_payload.${ir}`);
}
async function Zl(e) {
    try {
        return ih ? eu(await fetch(e).then((t) => t.text())) : await Yn(() => import(e), [], import.meta.url).then((t) => t.default || t);
    } catch (t) {
        console.warn("[nuxt] Cannot load payload ", e, t);
    }
    return null;
}
function nh() {
    return !!Ee().payload.prerenderedAt;
}
let Zi = null;
async function ah() {
    if (Zi) return Zi;
    const e = document.getElementById("__NUXT_DATA__");
    if (!e) return {};
    const t = eu(e.textContent || ""),
        i = e.dataset.src ? await Zl(e.dataset.src) : void 0;
    return (Zi = { ...t, ...i, ...window.__NUXT__ }), Zi;
}
function eu(e) {
    return cm(e, Ee()._payloadRevivers);
}
function rh(e, t) {
    Ee()._payloadRevivers[e] = t;
}
function Qs(e) {
    return e !== null && typeof e == "object";
}
function bn(e, t, i = ".", s) {
    if (!Qs(t)) return bn(e, {}, i, s);
    const n = Object.assign({}, t);
    for (const a in e) {
        if (a === "__proto__" || a === "constructor") continue;
        const r = e[a];
        r != null && ((s && s(n, a, r, i)) || (Array.isArray(r) && Array.isArray(n[a]) ? (n[a] = [...r, ...n[a]]) : Qs(r) && Qs(n[a]) ? (n[a] = bn(r, n[a], (i ? `${i}.` : "") + a.toString(), s)) : (n[a] = r)));
    }
    return n;
}
function lh(e) {
    return (...t) => t.reduce((i, s) => bn(i, s, "", e), {});
}
const uh = lh();
class _n extends Error {
    constructor() {
        super(...arguments), (this.statusCode = 500), (this.fatal = !1), (this.unhandled = !1), (this.statusMessage = void 0);
    }
    toJSON() {
        const t = { message: this.message, statusCode: qn(this.statusCode, 500) };
        return this.statusMessage && (t.statusMessage = tu(this.statusMessage)), this.data !== void 0 && (t.data = this.data), t;
    }
}
_n.__h3_error__ = !0;
function yn(e) {
    if (typeof e == "string") return new _n(e);
    if (oh(e)) return e;
    const t = new _n(e.message ?? e.statusMessage, e.cause ? { cause: e.cause } : void 0);
    if ("stack" in e)
        try {
            Object.defineProperty(t, "stack", {
                get() {
                    return e.stack;
                },
            });
        } catch {
            try {
                t.stack = e.stack;
            } catch {}
        }
    if (
        (e.data && (t.data = e.data),
        e.statusCode ? (t.statusCode = qn(e.statusCode, t.statusCode)) : e.status && (t.statusCode = qn(e.status, t.statusCode)),
        e.statusMessage ? (t.statusMessage = e.statusMessage) : e.statusText && (t.statusMessage = e.statusText),
        t.statusMessage)
    ) {
        const i = t.statusMessage;
        tu(t.statusMessage) !== i && console.warn("[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future `statusMessage` will be sanitized by default.");
    }
    return e.fatal !== void 0 && (t.fatal = e.fatal), e.unhandled !== void 0 && (t.unhandled = e.unhandled), t;
}
function oh(e) {
    var t;
    return ((t = e == null ? void 0 : e.constructor) == null ? void 0 : t.__h3_error__) === !0;
}
const ch = /[^\u0009\u0020-\u007E]/g;
function tu(e = "") {
    return e.replace(ch, "");
}
function qn(e, t = 200) {
    return !e || (typeof e == "string" && (e = Number.parseInt(e, 10)), e < 100 || e > 999) ? t : e;
}
function dh(...e) {
    const t = typeof e[e.length - 1] == "string" ? e.pop() : void 0;
    typeof e[0] != "string" && e.unshift(t);
    const [i, s] = e;
    if (!i || typeof i != "string") throw new TypeError("[nuxt] [useState] key must be a string: " + i);
    if (s !== void 0 && typeof s != "function") throw new Error("[nuxt] [useState] init must be a function: " + s);
    const n = "$s" + i,
        a = Ee(),
        r = Jr(a.payload.state, n);
    if (r.value === void 0 && s) {
        const u = s();
        if (qe(u)) return (a.payload.state[n] = u), u;
        r.value = u;
    }
    return r;
}
const li = () => {
        var e;
        return (e = Ee()) == null ? void 0 : e.$router;
    },
    Zn = () => (yl() ? Le("_route", Ee()._route) : Ee()._route),
    mh = (e) => e,
    hh = () => {
        try {
            if (Ee()._processingMiddleware) return !0;
        } catch {
            return !0;
        }
        return !1;
    },
    pf = (e, t) => {
        e || (e = "/");
        const i = typeof e == "string" ? e : e.path || "/",
            s = (t == null ? void 0 : t.external) || Hi(i, { acceptRelative: !0 });
        if (s && !(t != null && t.external)) throw new Error("Navigating to external URL is not allowed by default. Use `navigateTo (url, { external: true })`.");
        if (s && ks(i).protocol === "script:") throw new Error("Cannot navigate to an URL with script protocol.");
        const n = hh();
        if (!s && n) return e;
        const a = li();
        return s ? (t != null && t.replace ? location.replace(i) : (location.href = i), Promise.resolve()) : t != null && t.replace ? a.replace(e) : a.push(e);
    },
    Ts = () => Jr(Ee().payload, "error"),
    Ut = (e) => {
        const t = ea(e);
        try {
            const i = Ee(),
                s = Ts();
            i.hooks.callHook("app:error", t), (s.value = s.value || t);
        } catch {
            throw t;
        }
        return t;
    },
    ph = async (e = {}) => {
        const t = Ee(),
            i = Ts();
        t.callHook("app:error:cleared", e), e.redirect && (await li().replace(e.redirect)), (i.value = null);
    },
    gh = (e) => !!(e && typeof e == "object" && "__nuxt_error" in e),
    ea = (e) => {
        const t = yn(e);
        return (t.__nuxt_error = !0), t;
    },
    sr = {
        NuxtError: (e) => ea(e),
        EmptyShallowRef: (e) => Ai(e === "_" ? void 0 : JSON.parse(e)),
        EmptyRef: (e) => rt(e === "_" ? void 0 : JSON.parse(e)),
        ShallowRef: (e) => Ai(e),
        ShallowReactive: (e) => Dr(e),
        Ref: (e) => rt(e),
        Reactive: (e) => Qe(e),
    },
    fh = qt(
        {
            name: "nuxt:revive-payload:client",
            order: -30,
            async setup(e) {
                let t, i;
                for (const s in sr) rh(s, sr[s]);
                Object.assign(e.payload, (([t, i] = ms(() => e.runWithContext(ah))), (t = await t), i(), t)), (window.__NUXT__ = e.payload);
            },
        },
        1
    ),
    vh = qt({ name: "nuxt:global-components" }),
    bh = qt({
        name: "nuxt:head",
        setup(e) {
            const i = Qm();
            i.push(Xm), e.vueApp.use(i);
            {
                let s = !0;
                const n = () => {
                    (s = !1), i.hooks.callHook("entries:updated", i);
                };
                i.hooks.hook("dom:beforeRender", (a) => {
                    a.shouldRender = !s;
                }),
                    e.hooks.hook("page:start", () => {
                        s = !0;
                    }),
                    e.hooks.hook("page:finish", n),
                    e.hooks.hook("app:suspense:resolve", n);
            }
        },
    });
/*!
 * vue-router v4.2.2
 * (c) 2023 Eduardo San Martin Morote
 * @license MIT
 */ const Ft = typeof window < "u";
function _h(e) {
    return e.__esModule || e[Symbol.toStringTag] === "Module";
}
const ue = Object.assign;
function zs(e, t) {
    const i = {};
    for (const s in t) {
        const n = t[s];
        i[s] = ze(n) ? n.map(e) : e(n);
    }
    return i;
}
const wi = () => {},
    ze = Array.isArray,
    yh = /\/$/,
    qh = (e) => e.replace(yh, "");
function Js(e, t, i = "/") {
    let s,
        n = {},
        a = "",
        r = "";
    const u = t.indexOf("#");
    let l = t.indexOf("?");
    return (
        u < l && u >= 0 && (l = -1),
        l > -1 && ((s = t.slice(0, l)), (a = t.slice(l + 1, u > -1 ? u : t.length)), (n = e(a))),
        u > -1 && ((s = s || t.slice(0, u)), (r = t.slice(u, t.length))),
        (s = xh(s ?? t, i)),
        { fullPath: s + (a && "?") + a + r, path: s, query: n, hash: r }
    );
}
function wh(e, t) {
    const i = t.query ? e(t.query) : "";
    return t.path + (i && "?") + i + (t.hash || "");
}
function nr(e, t) {
    return !t || !e.toLowerCase().startsWith(t.toLowerCase()) ? e : e.slice(t.length) || "/";
}
function Ph(e, t, i) {
    const s = t.matched.length - 1,
        n = i.matched.length - 1;
    return s > -1 && s === n && ei(t.matched[s], i.matched[n]) && iu(t.params, i.params) && e(t.query) === e(i.query) && t.hash === i.hash;
}
function ei(e, t) {
    return (e.aliasOf || e) === (t.aliasOf || t);
}
function iu(e, t) {
    if (Object.keys(e).length !== Object.keys(t).length) return !1;
    for (const i in e) if (!Eh(e[i], t[i])) return !1;
    return !0;
}
function Eh(e, t) {
    return ze(e) ? ar(e, t) : ze(t) ? ar(t, e) : e === t;
}
function ar(e, t) {
    return ze(t) ? e.length === t.length && e.every((i, s) => i === t[s]) : e.length === 1 && e[0] === t;
}
function xh(e, t) {
    if (e.startsWith("/")) return e;
    if (!e) return t;
    const i = t.split("/"),
        s = e.split("/"),
        n = s[s.length - 1];
    (n === ".." || n === ".") && s.push("");
    let a = i.length - 1,
        r,
        u;
    for (r = 0; r < s.length; r++)
        if (((u = s[r]), u !== "."))
            if (u === "..") a > 1 && a--;
            else break;
    return i.slice(0, a).join("/") + "/" + s.slice(r - (r === s.length ? 1 : 0)).join("/");
}
var Ni;
(function (e) {
    (e.pop = "pop"), (e.push = "push");
})(Ni || (Ni = {}));
var Pi;
(function (e) {
    (e.back = "back"), (e.forward = "forward"), (e.unknown = "");
})(Pi || (Pi = {}));
function jh(e) {
    if (!e)
        if (Ft) {
            const t = document.querySelector("base");
            (e = (t && t.getAttribute("href")) || "/"), (e = e.replace(/^\w+:\/\/[^\/]+/, ""));
        } else e = "/";
    return e[0] !== "/" && e[0] !== "#" && (e = "/" + e), qh(e);
}
const Ch = /^[^#]+#/;
function Ah(e, t) {
    return e.replace(Ch, "#") + t;
}
function kh(e, t) {
    const i = document.documentElement.getBoundingClientRect(),
        s = e.getBoundingClientRect();
    return { behavior: t.behavior, left: s.left - i.left - (t.left || 0), top: s.top - i.top - (t.top || 0) };
}
const Ss = () => ({ left: window.pageXOffset, top: window.pageYOffset });
function Th(e) {
    let t;
    if ("el" in e) {
        const i = e.el,
            s = typeof i == "string" && i.startsWith("#"),
            n = typeof i == "string" ? (s ? document.getElementById(i.slice(1)) : document.querySelector(i)) : i;
        if (!n) return;
        t = kh(n, e);
    } else t = e;
    "scrollBehavior" in document.documentElement.style ? window.scrollTo(t) : window.scrollTo(t.left != null ? t.left : window.pageXOffset, t.top != null ? t.top : window.pageYOffset);
}
function rr(e, t) {
    return (history.state ? history.state.position - t : -1) + e;
}
const wn = new Map();
function Sh(e, t) {
    wn.set(e, t);
}
function Rh(e) {
    const t = wn.get(e);
    return wn.delete(e), t;
}
let Nh = () => location.protocol + "//" + location.host;
function su(e, t) {
    const { pathname: i, search: s, hash: n } = t,
        a = e.indexOf("#");
    if (a > -1) {
        let u = n.includes(e.slice(a)) ? e.slice(a).length : 1,
            l = n.slice(u);
        return l[0] !== "/" && (l = "/" + l), nr(l, "");
    }
    return nr(i, e) + s + n;
}
function Mh(e, t, i, s) {
    let n = [],
        a = [],
        r = null;
    const u = ({ state: h }) => {
        const v = su(e, location),
            b = i.value,
            q = t.value;
        let T = 0;
        if (h) {
            if (((i.value = v), (t.value = h), r && r === b)) {
                r = null;
                return;
            }
            T = q ? h.position - q.position : 0;
        } else s(v);
        n.forEach((f) => {
            f(i.value, b, { delta: T, type: Ni.pop, direction: T ? (T > 0 ? Pi.forward : Pi.back) : Pi.unknown });
        });
    };
    function l() {
        r = i.value;
    }
    function o(h) {
        n.push(h);
        const v = () => {
            const b = n.indexOf(h);
            b > -1 && n.splice(b, 1);
        };
        return a.push(v), v;
    }
    function c() {
        const { history: h } = window;
        h.state && h.replaceState(ue({}, h.state, { scroll: Ss() }), "");
    }
    function d() {
        for (const h of a) h();
        (a = []), window.removeEventListener("popstate", u), window.removeEventListener("beforeunload", c);
    }
    return window.addEventListener("popstate", u), window.addEventListener("beforeunload", c, { passive: !0 }), { pauseListeners: l, listen: o, destroy: d };
}
function lr(e, t, i, s = !1, n = !1) {
    return { back: e, current: t, forward: i, replaced: s, position: window.history.length, scroll: n ? Ss() : null };
}
function Ih(e) {
    const { history: t, location: i } = window,
        s = { value: su(e, i) },
        n = { value: t.state };
    n.value || a(s.value, { back: null, current: s.value, forward: null, position: t.length - 1, replaced: !0, scroll: null }, !0);
    function a(l, o, c) {
        const d = e.indexOf("#"),
            h = d > -1 ? (i.host && document.querySelector("base") ? e : e.slice(d)) + l : Nh() + e + l;
        try {
            t[c ? "replaceState" : "pushState"](o, "", h), (n.value = o);
        } catch (v) {
            console.error(v), i[c ? "replace" : "assign"](h);
        }
    }
    function r(l, o) {
        const c = ue({}, t.state, lr(n.value.back, l, n.value.forward, !0), o, { position: n.value.position });
        a(l, c, !0), (s.value = l);
    }
    function u(l, o) {
        const c = ue({}, n.value, t.state, { forward: l, scroll: Ss() });
        a(c.current, c, !0);
        const d = ue({}, lr(s.value, l, null), { position: c.position + 1 }, o);
        a(l, d, !1), (s.value = l);
    }
    return { location: s, state: n, push: u, replace: r };
}
function nu(e) {
    e = jh(e);
    const t = Ih(e),
        i = Mh(e, t.state, t.location, t.replace);
    function s(a, r = !0) {
        r || i.pauseListeners(), history.go(a);
    }
    const n = ue({ location: "", base: e, go: s, createHref: Ah.bind(null, e) }, t, i);
    return Object.defineProperty(n, "location", { enumerable: !0, get: () => t.location.value }), Object.defineProperty(n, "state", { enumerable: !0, get: () => t.state.value }), n;
}
function Oh(e) {
    return (e = location.host ? e || location.pathname + location.search : ""), e.includes("#") || (e += "#"), nu(e);
}
function Lh(e) {
    return typeof e == "string" || (e && typeof e == "object");
}
function au(e) {
    return typeof e == "string" || typeof e == "symbol";
}
const Xe = { path: "/", name: void 0, params: {}, query: {}, hash: "", fullPath: "/", matched: [], meta: {}, redirectedFrom: void 0 },
    ru = Symbol("");
var ur;
(function (e) {
    (e[(e.aborted = 4)] = "aborted"), (e[(e.cancelled = 8)] = "cancelled"), (e[(e.duplicated = 16)] = "duplicated");
})(ur || (ur = {}));
function ti(e, t) {
    return ue(new Error(), { type: e, [ru]: !0 }, t);
}
function nt(e, t) {
    return e instanceof Error && ru in e && (t == null || !!(e.type & t));
}
const or = "[^/]+?",
    Hh = { sensitive: !1, strict: !1, start: !0, end: !0 },
    Fh = /[.+*?^${}()[\]/\\]/g;
function Uh(e, t) {
    const i = ue({}, Hh, t),
        s = [];
    let n = i.start ? "^" : "";
    const a = [];
    for (const o of e) {
        const c = o.length ? [] : [90];
        i.strict && !o.length && (n += "/");
        for (let d = 0; d < o.length; d++) {
            const h = o[d];
            let v = 40 + (i.sensitive ? 0.25 : 0);
            if (h.type === 0) d || (n += "/"), (n += h.value.replace(Fh, "\\$&")), (v += 40);
            else if (h.type === 1) {
                const { value: b, repeatable: q, optional: T, regexp: f } = h;
                a.push({ name: b, repeatable: q, optional: T });
                const g = f || or;
                if (g !== or) {
                    v += 10;
                    try {
                        new RegExp(`(${g})`);
                    } catch (y) {
                        throw new Error(`Invalid custom RegExp for param "${b}" (${g}): ` + y.message);
                    }
                }
                let E = q ? `((?:${g})(?:/(?:${g}))*)` : `(${g})`;
                d || (E = T && o.length < 2 ? `(?:/${E})` : "/" + E), T && (E += "?"), (n += E), (v += 20), T && (v += -8), q && (v += -20), g === ".*" && (v += -50);
            }
            c.push(v);
        }
        s.push(c);
    }
    if (i.strict && i.end) {
        const o = s.length - 1;
        s[o][s[o].length - 1] += 0.7000000000000001;
    }
    i.strict || (n += "/?"), i.end ? (n += "$") : i.strict && (n += "(?:/|$)");
    const r = new RegExp(n, i.sensitive ? "" : "i");
    function u(o) {
        const c = o.match(r),
            d = {};
        if (!c) return null;
        for (let h = 1; h < c.length; h++) {
            const v = c[h] || "",
                b = a[h - 1];
            d[b.name] = v && b.repeatable ? v.split("/") : v;
        }
        return d;
    }
    function l(o) {
        let c = "",
            d = !1;
        for (const h of e) {
            (!d || !c.endsWith("/")) && (c += "/"), (d = !1);
            for (const v of h)
                if (v.type === 0) c += v.value;
                else if (v.type === 1) {
                    const { value: b, repeatable: q, optional: T } = v,
                        f = b in o ? o[b] : "";
                    if (ze(f) && !q) throw new Error(`Provided param "${b}" is an array but it is not repeatable (* or + modifiers)`);
                    const g = ze(f) ? f.join("/") : f;
                    if (!g)
                        if (T) h.length < 2 && (c.endsWith("/") ? (c = c.slice(0, -1)) : (d = !0));
                        else throw new Error(`Missing required param "${b}"`);
                    c += g;
                }
        }
        return c || "/";
    }
    return { re: r, score: s, keys: a, parse: u, stringify: l };
}
function Dh(e, t) {
    let i = 0;
    for (; i < e.length && i < t.length; ) {
        const s = t[i] - e[i];
        if (s) return s;
        i++;
    }
    return e.length < t.length ? (e.length === 1 && e[0] === 40 + 40 ? -1 : 1) : e.length > t.length ? (t.length === 1 && t[0] === 40 + 40 ? 1 : -1) : 0;
}
function $h(e, t) {
    let i = 0;
    const s = e.score,
        n = t.score;
    for (; i < s.length && i < n.length; ) {
        const a = Dh(s[i], n[i]);
        if (a) return a;
        i++;
    }
    if (Math.abs(n.length - s.length) === 1) {
        if (cr(s)) return 1;
        if (cr(n)) return -1;
    }
    return n.length - s.length;
}
function cr(e) {
    const t = e[e.length - 1];
    return e.length > 0 && t[t.length - 1] < 0;
}
const Bh = { type: 0, value: "" },
    Vh = /[a-zA-Z0-9_]/;
function Wh(e) {
    if (!e) return [[]];
    if (e === "/") return [[Bh]];
    if (!e.startsWith("/")) throw new Error(`Invalid path "${e}"`);
    function t(v) {
        throw new Error(`ERR (${i})/"${o}": ${v}`);
    }
    let i = 0,
        s = i;
    const n = [];
    let a;
    function r() {
        a && n.push(a), (a = []);
    }
    let u = 0,
        l,
        o = "",
        c = "";
    function d() {
        o &&
            (i === 0
                ? a.push({ type: 0, value: o })
                : i === 1 || i === 2 || i === 3
                ? (a.length > 1 && (l === "*" || l === "+") && t(`A repeatable param (${o}) must be alone in its segment. eg: '/:ids+.`), a.push({ type: 1, value: o, regexp: c, repeatable: l === "*" || l === "+", optional: l === "*" || l === "?" }))
                : t("Invalid state to consume buffer"),
            (o = ""));
    }
    function h() {
        o += l;
    }
    for (; u < e.length; ) {
        if (((l = e[u++]), l === "\\" && i !== 2)) {
            (s = i), (i = 4);
            continue;
        }
        switch (i) {
            case 0:
                l === "/" ? (o && d(), r()) : l === ":" ? (d(), (i = 1)) : h();
                break;
            case 4:
                h(), (i = s);
                break;
            case 1:
                l === "(" ? (i = 2) : Vh.test(l) ? h() : (d(), (i = 0), l !== "*" && l !== "?" && l !== "+" && u--);
                break;
            case 2:
                l === ")" ? (c[c.length - 1] == "\\" ? (c = c.slice(0, -1) + l) : (i = 3)) : (c += l);
                break;
            case 3:
                d(), (i = 0), l !== "*" && l !== "?" && l !== "+" && u--, (c = "");
                break;
            default:
                t("Unknown state");
                break;
        }
    }
    return i === 2 && t(`Unfinished custom RegExp for param "${o}"`), d(), r(), n;
}
function Kh(e, t, i) {
    const s = Uh(Wh(e.path), i),
        n = ue(s, { record: e, parent: t, children: [], alias: [] });
    return t && !n.record.aliasOf == !t.record.aliasOf && t.children.push(n), n;
}
function Qh(e, t) {
    const i = [],
        s = new Map();
    t = hr({ strict: !1, end: !0, sensitive: !1 }, t);
    function n(c) {
        return s.get(c);
    }
    function a(c, d, h) {
        const v = !h,
            b = zh(c);
        b.aliasOf = h && h.record;
        const q = hr(t, c),
            T = [b];
        if ("alias" in c) {
            const E = typeof c.alias == "string" ? [c.alias] : c.alias;
            for (const y of E) T.push(ue({}, b, { components: h ? h.record.components : b.components, path: y, aliasOf: h ? h.record : b }));
        }
        let f, g;
        for (const E of T) {
            const { path: y } = E;
            if (d && y[0] !== "/") {
                const C = d.record.path,
                    N = C[C.length - 1] === "/" ? "" : "/";
                E.path = d.record.path + (y && N + y);
            }
            if (((f = Kh(E, d, q)), h ? h.alias.push(f) : ((g = g || f), g !== f && g.alias.push(f), v && c.name && !mr(f) && r(c.name)), b.children)) {
                const C = b.children;
                for (let N = 0; N < C.length; N++) a(C[N], f, h && h.children[N]);
            }
            (h = h || f), ((f.record.components && Object.keys(f.record.components).length) || f.record.name || f.record.redirect) && l(f);
        }
        return g
            ? () => {
                  r(g);
              }
            : wi;
    }
    function r(c) {
        if (au(c)) {
            const d = s.get(c);
            d && (s.delete(c), i.splice(i.indexOf(d), 1), d.children.forEach(r), d.alias.forEach(r));
        } else {
            const d = i.indexOf(c);
            d > -1 && (i.splice(d, 1), c.record.name && s.delete(c.record.name), c.children.forEach(r), c.alias.forEach(r));
        }
    }
    function u() {
        return i;
    }
    function l(c) {
        let d = 0;
        for (; d < i.length && $h(c, i[d]) >= 0 && (c.record.path !== i[d].record.path || !lu(c, i[d])); ) d++;
        i.splice(d, 0, c), c.record.name && !mr(c) && s.set(c.record.name, c);
    }
    function o(c, d) {
        let h,
            v = {},
            b,
            q;
        if ("name" in c && c.name) {
            if (((h = s.get(c.name)), !h)) throw ti(1, { location: c });
            (q = h.record.name),
                (v = ue(
                    dr(
                        d.params,
                        h.keys.filter((g) => !g.optional).map((g) => g.name)
                    ),
                    c.params &&
                        dr(
                            c.params,
                            h.keys.map((g) => g.name)
                        )
                )),
                (b = h.stringify(v));
        } else if ("path" in c) (b = c.path), (h = i.find((g) => g.re.test(b))), h && ((v = h.parse(b)), (q = h.record.name));
        else {
            if (((h = d.name ? s.get(d.name) : i.find((g) => g.re.test(d.path))), !h)) throw ti(1, { location: c, currentLocation: d });
            (q = h.record.name), (v = ue({}, d.params, c.params)), (b = h.stringify(v));
        }
        const T = [];
        let f = h;
        for (; f; ) T.unshift(f.record), (f = f.parent);
        return { name: q, path: b, params: v, matched: T, meta: Gh(T) };
    }
    return e.forEach((c) => a(c)), { addRoute: a, resolve: o, removeRoute: r, getRoutes: u, getRecordMatcher: n };
}
function dr(e, t) {
    const i = {};
    for (const s of t) s in e && (i[s] = e[s]);
    return i;
}
function zh(e) {
    return {
        path: e.path,
        redirect: e.redirect,
        name: e.name,
        meta: e.meta || {},
        aliasOf: void 0,
        beforeEnter: e.beforeEnter,
        props: Jh(e),
        children: e.children || [],
        instances: {},
        leaveGuards: new Set(),
        updateGuards: new Set(),
        enterCallbacks: {},
        components: "components" in e ? e.components || null : e.component && { default: e.component },
    };
}
function Jh(e) {
    const t = {},
        i = e.props || !1;
    if ("component" in e) t.default = i;
    else for (const s in e.components) t[s] = typeof i == "boolean" ? i : i[s];
    return t;
}
function mr(e) {
    for (; e; ) {
        if (e.record.aliasOf) return !0;
        e = e.parent;
    }
    return !1;
}
function Gh(e) {
    return e.reduce((t, i) => ue(t, i.meta), {});
}
function hr(e, t) {
    const i = {};
    for (const s in e) i[s] = s in t ? t[s] : e[s];
    return i;
}
function lu(e, t) {
    return t.children.some((i) => i === e || lu(e, i));
}
const uu = /#/g,
    Yh = /&/g,
    Xh = /\//g,
    Zh = /=/g,
    ep = /\?/g,
    ou = /\+/g,
    tp = /%5B/g,
    ip = /%5D/g,
    cu = /%5E/g,
    sp = /%60/g,
    du = /%7B/g,
    np = /%7C/g,
    mu = /%7D/g,
    ap = /%20/g;
function ta(e) {
    return encodeURI("" + e)
        .replace(np, "|")
        .replace(tp, "[")
        .replace(ip, "]");
}
function rp(e) {
    return ta(e).replace(du, "{").replace(mu, "}").replace(cu, "^");
}
function Pn(e) {
    return ta(e).replace(ou, "%2B").replace(ap, "+").replace(uu, "%23").replace(Yh, "%26").replace(sp, "`").replace(du, "{").replace(mu, "}").replace(cu, "^");
}
function lp(e) {
    return Pn(e).replace(Zh, "%3D");
}
function up(e) {
    return ta(e).replace(uu, "%23").replace(ep, "%3F");
}
function op(e) {
    return e == null ? "" : up(e).replace(Xh, "%2F");
}
function gs(e) {
    try {
        return decodeURIComponent("" + e);
    } catch {}
    return "" + e;
}
function cp(e) {
    const t = {};
    if (e === "" || e === "?") return t;
    const s = (e[0] === "?" ? e.slice(1) : e).split("&");
    for (let n = 0; n < s.length; ++n) {
        const a = s[n].replace(ou, " "),
            r = a.indexOf("="),
            u = gs(r < 0 ? a : a.slice(0, r)),
            l = r < 0 ? null : gs(a.slice(r + 1));
        if (u in t) {
            let o = t[u];
            ze(o) || (o = t[u] = [o]), o.push(l);
        } else t[u] = l;
    }
    return t;
}
function pr(e) {
    let t = "";
    for (let i in e) {
        const s = e[i];
        if (((i = lp(i)), s == null)) {
            s !== void 0 && (t += (t.length ? "&" : "") + i);
            continue;
        }
        (ze(s) ? s.map((a) => a && Pn(a)) : [s && Pn(s)]).forEach((a) => {
            a !== void 0 && ((t += (t.length ? "&" : "") + i), a != null && (t += "=" + a));
        });
    }
    return t;
}
function dp(e) {
    const t = {};
    for (const i in e) {
        const s = e[i];
        s !== void 0 && (t[i] = ze(s) ? s.map((n) => (n == null ? null : "" + n)) : s == null ? s : "" + s);
    }
    return t;
}
const mp = Symbol(""),
    gr = Symbol(""),
    ia = Symbol(""),
    sa = Symbol(""),
    En = Symbol("");
function mi() {
    let e = [];
    function t(s) {
        return (
            e.push(s),
            () => {
                const n = e.indexOf(s);
                n > -1 && e.splice(n, 1);
            }
        );
    }
    function i() {
        e = [];
    }
    return { add: t, list: () => e, reset: i };
}
function ft(e, t, i, s, n) {
    const a = s && (s.enterCallbacks[n] = s.enterCallbacks[n] || []);
    return () =>
        new Promise((r, u) => {
            const l = (d) => {
                    d === !1 ? u(ti(4, { from: i, to: t })) : d instanceof Error ? u(d) : Lh(d) ? u(ti(2, { from: t, to: d })) : (a && s.enterCallbacks[n] === a && typeof d == "function" && a.push(d), r());
                },
                o = e.call(s && s.instances[n], t, i, l);
            let c = Promise.resolve(o);
            e.length < 3 && (c = c.then(l)), c.catch((d) => u(d));
        });
}
function Gs(e, t, i, s) {
    const n = [];
    for (const a of e)
        for (const r in a.components) {
            let u = a.components[r];
            if (!(t !== "beforeRouteEnter" && !a.instances[r]))
                if (hp(u)) {
                    const o = (u.__vccOpts || u)[t];
                    o && n.push(ft(o, i, s, a, r));
                } else {
                    let l = u();
                    n.push(() =>
                        l.then((o) => {
                            if (!o) return Promise.reject(new Error(`Couldn't resolve component "${r}" at "${a.path}"`));
                            const c = _h(o) ? o.default : o;
                            a.components[r] = c;
                            const h = (c.__vccOpts || c)[t];
                            return h && ft(h, i, s, a, r)();
                        })
                    );
                }
        }
    return n;
}
function hp(e) {
    return typeof e == "object" || "displayName" in e || "props" in e || "__vccOpts" in e;
}
function fr(e) {
    const t = Le(ia),
        i = Le(sa),
        s = Te(() => t.resolve(pe(e.to))),
        n = Te(() => {
            const { matched: l } = s.value,
                { length: o } = l,
                c = l[o - 1],
                d = i.matched;
            if (!c || !d.length) return -1;
            const h = d.findIndex(ei.bind(null, c));
            if (h > -1) return h;
            const v = vr(l[o - 2]);
            return o > 1 && vr(c) === v && d[d.length - 1].path !== v ? d.findIndex(ei.bind(null, l[o - 2])) : h;
        }),
        a = Te(() => n.value > -1 && vp(i.params, s.value.params)),
        r = Te(() => n.value > -1 && n.value === i.matched.length - 1 && iu(i.params, s.value.params));
    function u(l = {}) {
        return fp(l) ? t[pe(e.replace) ? "replace" : "push"](pe(e.to)).catch(wi) : Promise.resolve();
    }
    return { route: s, href: Te(() => s.value.href), isActive: a, isExactActive: r, navigate: u };
}
const pp = Mt({
        name: "RouterLink",
        compatConfig: { MODE: 3 },
        props: { to: { type: [String, Object], required: !0 }, replace: Boolean, activeClass: String, exactActiveClass: String, custom: Boolean, ariaCurrentValue: { type: String, default: "page" } },
        useLink: fr,
        setup(e, { slots: t }) {
            const i = Qe(fr(e)),
                { options: s } = Le(ia),
                n = Te(() => ({ [br(e.activeClass, s.linkActiveClass, "router-link-active")]: i.isActive, [br(e.exactActiveClass, s.linkExactActiveClass, "router-link-exact-active")]: i.isExactActive }));
            return () => {
                const a = t.default && t.default(i);
                return e.custom ? a : tt("a", { "aria-current": i.isExactActive ? e.ariaCurrentValue : null, href: i.href, onClick: i.navigate, class: n.value }, a);
            };
        },
    }),
    gp = pp;
function fp(e) {
    if (!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) && !e.defaultPrevented && !(e.button !== void 0 && e.button !== 0)) {
        if (e.currentTarget && e.currentTarget.getAttribute) {
            const t = e.currentTarget.getAttribute("target");
            if (/\b_blank\b/i.test(t)) return;
        }
        return e.preventDefault && e.preventDefault(), !0;
    }
}
function vp(e, t) {
    for (const i in t) {
        const s = t[i],
            n = e[i];
        if (typeof s == "string") {
            if (s !== n) return !1;
        } else if (!ze(n) || n.length !== s.length || s.some((a, r) => a !== n[r])) return !1;
    }
    return !0;
}
function vr(e) {
    return e ? (e.aliasOf ? e.aliasOf.path : e.path) : "";
}
const br = (e, t, i) => e ?? t ?? i,
    bp = Mt({
        name: "RouterView",
        inheritAttrs: !1,
        props: { name: { type: String, default: "default" }, route: Object },
        compatConfig: { MODE: 3 },
        setup(e, { attrs: t, slots: i }) {
            const s = Le(En),
                n = Te(() => e.route || s.value),
                a = Le(gr, 0),
                r = Te(() => {
                    let o = pe(a);
                    const { matched: c } = n.value;
                    let d;
                    for (; (d = c[o]) && !d.components; ) o++;
                    return o;
                }),
                u = Te(() => n.value.matched[r.value]);
            zt(
                gr,
                Te(() => r.value + 1)
            ),
                zt(mp, u),
                zt(En, n);
            const l = rt();
            return (
                Qt(
                    () => [l.value, u.value, e.name],
                    ([o, c, d], [h, v, b]) => {
                        c && ((c.instances[d] = o), v && v !== c && o && o === h && (c.leaveGuards.size || (c.leaveGuards = v.leaveGuards), c.updateGuards.size || (c.updateGuards = v.updateGuards))),
                            o && c && (!v || !ei(c, v) || !h) && (c.enterCallbacks[d] || []).forEach((q) => q(o));
                    },
                    { flush: "post" }
                ),
                () => {
                    const o = n.value,
                        c = e.name,
                        d = u.value,
                        h = d && d.components[c];
                    if (!h) return _r(i.default, { Component: h, route: o });
                    const v = d.props[c],
                        b = v ? (v === !0 ? o.params : typeof v == "function" ? v(o) : v) : null,
                        T = tt(
                            h,
                            ue({}, b, t, {
                                onVnodeUnmounted: (f) => {
                                    f.component.isUnmounted && (d.instances[c] = null);
                                },
                                ref: l,
                            })
                        );
                    return _r(i.default, { Component: T, route: o }) || T;
                }
            );
        },
    });
function _r(e, t) {
    if (!e) return null;
    const i = e(t);
    return i.length === 1 ? i[0] : i;
}
const hu = bp;
function _p(e) {
    const t = Qh(e.routes, e),
        i = e.parseQuery || cp,
        s = e.stringifyQuery || pr,
        n = e.history,
        a = mi(),
        r = mi(),
        u = mi(),
        l = Ai(Xe);
    let o = Xe;
    Ft && e.scrollBehavior && "scrollRestoration" in history && (history.scrollRestoration = "manual");
    const c = zs.bind(null, (x) => "" + x),
        d = zs.bind(null, op),
        h = zs.bind(null, gs);
    function v(x, F) {
        let I, V;
        return au(x) ? ((I = t.getRecordMatcher(x)), (V = F)) : (V = x), t.addRoute(V, I);
    }
    function b(x) {
        const F = t.getRecordMatcher(x);
        F && t.removeRoute(F);
    }
    function q() {
        return t.getRoutes().map((x) => x.record);
    }
    function T(x) {
        return !!t.getRecordMatcher(x);
    }
    function f(x, F) {
        if (((F = ue({}, F || l.value)), typeof x == "string")) {
            const _ = Js(i, x, F.path),
                w = t.resolve({ path: _.path }, F),
                j = n.createHref(_.fullPath);
            return ue(_, w, { params: h(w.params), hash: gs(_.hash), redirectedFrom: void 0, href: j });
        }
        let I;
        if ("path" in x) I = ue({}, x, { path: Js(i, x.path, F.path).path });
        else {
            const _ = ue({}, x.params);
            for (const w in _) _[w] == null && delete _[w];
            (I = ue({}, x, { params: d(_) })), (F.params = d(F.params));
        }
        const V = t.resolve(I, F),
            le = x.hash || "";
        V.params = c(h(V.params));
        const m = wh(s, ue({}, x, { hash: rp(le), path: V.path })),
            p = n.createHref(m);
        return ue({ fullPath: m, hash: le, query: s === pr ? dp(x.query) : x.query || {} }, V, { redirectedFrom: void 0, href: p });
    }
    function g(x) {
        return typeof x == "string" ? Js(i, x, l.value.path) : ue({}, x);
    }
    function E(x, F) {
        if (o !== x) return ti(8, { from: F, to: x });
    }
    function y(x) {
        return S(x);
    }
    function C(x) {
        return y(ue(g(x), { replace: !0 }));
    }
    function N(x) {
        const F = x.matched[x.matched.length - 1];
        if (F && F.redirect) {
            const { redirect: I } = F;
            let V = typeof I == "function" ? I(x) : I;
            return typeof V == "string" && ((V = V.includes("?") || V.includes("#") ? (V = g(V)) : { path: V }), (V.params = {})), ue({ query: x.query, hash: x.hash, params: "path" in V ? {} : x.params }, V);
        }
    }
    function S(x, F) {
        const I = (o = f(x)),
            V = l.value,
            le = x.state,
            m = x.force,
            p = x.replace === !0,
            _ = N(I);
        if (_) return S(ue(g(_), { state: typeof _ == "object" ? ue({}, le, _.state) : le, force: m, replace: p }), F || I);
        const w = I;
        w.redirectedFrom = F;
        let j;
        return (
            !m && Ph(s, V, I) && ((j = ti(16, { to: w, from: V })), Ge(V, V, !0, !1)),
            (j ? Promise.resolve(j) : D(w, V))
                .catch((A) => (nt(A) ? (nt(A, 2) ? A : ct(A)) : re(A, w, V)))
                .then((A) => {
                    if (A) {
                        if (nt(A, 2)) return S(ue({ replace: p }, g(A.to), { state: typeof A.to == "object" ? ue({}, le, A.to.state) : le, force: m }), F || w);
                    } else A = H(w, V, !0, p, le);
                    return Q(w, V, A), A;
                })
        );
    }
    function P(x, F) {
        const I = E(x, F);
        return I ? Promise.reject(I) : Promise.resolve();
    }
    function O(x) {
        const F = Ot.values().next().value;
        return F && typeof F.runWithContext == "function" ? F.runWithContext(x) : x();
    }
    function D(x, F) {
        let I;
        const [V, le, m] = yp(x, F);
        I = Gs(V.reverse(), "beforeRouteLeave", x, F);
        for (const _ of V)
            _.leaveGuards.forEach((w) => {
                I.push(ft(w, x, F));
            });
        const p = P.bind(null, x, F);
        return (
            I.push(p),
            je(I)
                .then(() => {
                    I = [];
                    for (const _ of a.list()) I.push(ft(_, x, F));
                    return I.push(p), je(I);
                })
                .then(() => {
                    I = Gs(le, "beforeRouteUpdate", x, F);
                    for (const _ of le)
                        _.updateGuards.forEach((w) => {
                            I.push(ft(w, x, F));
                        });
                    return I.push(p), je(I);
                })
                .then(() => {
                    I = [];
                    for (const _ of x.matched)
                        if (_.beforeEnter && !F.matched.includes(_))
                            if (ze(_.beforeEnter)) for (const w of _.beforeEnter) I.push(ft(w, x, F));
                            else I.push(ft(_.beforeEnter, x, F));
                    return I.push(p), je(I);
                })
                .then(() => (x.matched.forEach((_) => (_.enterCallbacks = {})), (I = Gs(m, "beforeRouteEnter", x, F)), I.push(p), je(I)))
                .then(() => {
                    I = [];
                    for (const _ of r.list()) I.push(ft(_, x, F));
                    return I.push(p), je(I);
                })
                .catch((_) => (nt(_, 8) ? _ : Promise.reject(_)))
        );
    }
    function Q(x, F, I) {
        for (const V of u.list()) O(() => V(x, F, I));
    }
    function H(x, F, I, V, le) {
        const m = E(x, F);
        if (m) return m;
        const p = F === Xe,
            _ = Ft ? history.state : {};
        I && (V || p ? n.replace(x.fullPath, ue({ scroll: p && _ && _.scroll }, le)) : n.push(x.fullPath, le)), (l.value = x), Ge(x, F, I, p), ct();
    }
    let J;
    function U() {
        J ||
            (J = n.listen((x, F, I) => {
                if (!Ui.listening) return;
                const V = f(x),
                    le = N(V);
                if (le) {
                    S(ue(le, { replace: !0 }), V).catch(wi);
                    return;
                }
                o = V;
                const m = l.value;
                Ft && Sh(rr(m.fullPath, I.delta), Ss()),
                    D(V, m)
                        .catch((p) =>
                            nt(p, 12)
                                ? p
                                : nt(p, 2)
                                ? (S(p.to, V)
                                      .then((_) => {
                                          nt(_, 20) && !I.delta && I.type === Ni.pop && n.go(-1, !1);
                                      })
                                      .catch(wi),
                                  Promise.reject())
                                : (I.delta && n.go(-I.delta, !1), re(p, V, m))
                        )
                        .then((p) => {
                            (p = p || H(V, m, !1)), p && (I.delta && !nt(p, 8) ? n.go(-I.delta, !1) : I.type === Ni.pop && nt(p, 20) && n.go(-1, !1)), Q(V, m, p);
                        })
                        .catch(wi);
            }));
    }
    let ve = mi(),
        ie = mi(),
        ae;
    function re(x, F, I) {
        ct(x);
        const V = ie.list();
        return V.length ? V.forEach((le) => le(x, F, I)) : console.error(x), Promise.reject(x);
    }
    function st() {
        return ae && l.value !== Xe
            ? Promise.resolve()
            : new Promise((x, F) => {
                  ve.add([x, F]);
              });
    }
    function ct(x) {
        return ae || ((ae = !x), U(), ve.list().forEach(([F, I]) => (x ? I(x) : F())), ve.reset()), x;
    }
    function Ge(x, F, I, V) {
        const { scrollBehavior: le } = e;
        if (!Ft || !le) return Promise.resolve();
        const m = (!I && Rh(rr(x.fullPath, 0))) || ((V || !I) && history.state && history.state.scroll) || null;
        return ri()
            .then(() => le(x, F, m))
            .then((p) => p && Th(p))
            .catch((p) => re(p, x, F));
    }
    const Re = (x) => n.go(x);
    let It;
    const Ot = new Set(),
        Ui = {
            currentRoute: l,
            listening: !0,
            addRoute: v,
            removeRoute: b,
            hasRoute: T,
            getRoutes: q,
            resolve: f,
            options: e,
            push: y,
            replace: C,
            go: Re,
            back: () => Re(-1),
            forward: () => Re(1),
            beforeEach: a.add,
            beforeResolve: r.add,
            afterEach: u.add,
            onError: ie.add,
            isReady: st,
            install(x) {
                const F = this;
                x.component("RouterLink", gp),
                    x.component("RouterView", hu),
                    (x.config.globalProperties.$router = F),
                    Object.defineProperty(x.config.globalProperties, "$route", { enumerable: !0, get: () => pe(l) }),
                    Ft && !It && l.value === Xe && ((It = !0), y(n.location).catch((le) => {}));
                const I = {};
                for (const le in Xe) I[le] = Te(() => l.value[le]);
                x.provide(ia, F), x.provide(sa, Qe(I)), x.provide(En, l);
                const V = x.unmount;
                Ot.add(x),
                    (x.unmount = function () {
                        Ot.delete(x), Ot.size < 1 && ((o = Xe), J && J(), (J = null), (l.value = Xe), (It = !1), (ae = !1)), V();
                    });
            },
        };
    function je(x) {
        return x.reduce((F, I) => F.then(() => O(I)), Promise.resolve());
    }
    return Ui;
}
function yp(e, t) {
    const i = [],
        s = [],
        n = [],
        a = Math.max(t.matched.length, e.matched.length);
    for (let r = 0; r < a; r++) {
        const u = t.matched[r];
        u && (e.matched.find((o) => ei(o, u)) ? s.push(u) : i.push(u));
        const l = e.matched[r];
        l && (t.matched.find((o) => ei(o, l)) || n.push(l));
    }
    return [i, s, n];
}
function qp() {
    return Le(sa);
}
const yr = [],
    wp = { props: { headerClass: String, text: String, link: String } },
    Je = (e, t) => {
        const i = e.__vccOpts || e;
        for (const [s, n] of t) i[s] = n;
        return i;
    },
    Pp = { key: 0, href: "link" },
    Ep = { key: 1 };
function xp(e, t, i, s, n, a) {
    return i.text ? (B(), X("header", { key: 0, class: te(i.headerClass) }, [i.link ? (B(), X("a", Pp, [de("h2", null, kt(i.text), 1)])) : (B(), X("h2", Ep, kt(i.text), 1))], 2)) : Ce("", !0);
}
const jp = Je(wp, [["render", xp]]),
    Cp = {},
    Ap = { width: "24", height: "24", viewBox: "0 0 24 24" },
    kp = de("title", null, "Lightning Icon", -1),
    Tp = de("path", { d: "M8 24l3-9h-9l14-15-3 9h9l-14 15z" }, null, -1),
    Sp = [kp, Tp];
function Rp(e, t) {
    return B(), X("svg", Ap, Sp);
}
const Np = Je(Cp, [["render", Rp]]),
    Mp = {},
    Ip = { width: "24", height: "24", viewBox: "0 0 24 24" },
    Op = de("title", null, "Play Icon", -1),
    Lp = de("path", { d: "M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3 17v-10l9 5.146-9 4.854z" }, null, -1),
    Hp = [Op, Lp];
function Fp(e, t) {
    return B(), X("svg", Ip, Hp);
}
const Up = Je(Mp, [["render", Fp]]),
    Dp = {},
    $p = { width: "24", height: "24", viewBox: "0 0 24 24", fillRule: "evenodd", clipRule: "evenodd" },
    Bp = de("title", null, "Fire Icon", -1),
    Vp = de(
        "path",
        {
            d: "M8.625 0c.61 7.189-5.625 9.664-5.625 15.996 0 4.301 3.069 7.972 9 8.004 5.931.032 9-4.414 9-8.956 0-4.141-2.062-8.046-5.952-10.474.924 2.607-.306 4.988-1.501 5.808.07-3.337-1.125-8.289-4.922-10.378zm4.711 13c3.755 3.989 1.449 9-1.567 9-1.835 0-2.779-1.265-2.769-2.577.019-2.433 2.737-2.435 4.336-6.423z",
        },
        null,
        -1
    ),
    Wp = [Bp, Vp];
function Kp(e, t) {
    return B(), X("svg", $p, Wp);
}
const Qp = Je(Dp, [["render", Kp]]),
    zp = { props: { text: String, textClass: [String, Array], type: String } };
function Jp(e, t, i, s, n, a) {
    return i.text ? (B(), we(gl(i.type || "p"), { key: 0, class: te(i.textClass) }, { default: Ps(() => [Qn(kt(i.text), 1)]), _: 1 }, 8, ["class"])) : Ce("", !0);
}
const Rs = Je(zp, [["render", Jp]]),
    Gp = "_breaking_18r3k_108",
    Yp = "_watch_18r3k_112",
    Xp = "_horizontal_18r3k_164",
    Zp = "_vertical_18r3k_168",
    eg = "_bullets_18r3k_178",
    Ns = {
        "article-header": "_article-header_18r3k_1",
        "article-body": "_article-body_18r3k_45",
        "article-image-container": "_article-image-container_18r3k_65",
        "article-image": "_article-image_18r3k_65",
        "article-image-captions": "_article-image-captions_18r3k_89",
        "article-image-tag": "_article-image-tag_18r3k_94",
        breaking: Gp,
        watch: Yp,
        "article-title": "_article-title_18r3k_128",
        "article-content": "_article-content_18r3k_137",
        "article-list": "_article-list_18r3k_151",
        "article-list-item": "_article-list-item_18r3k_159",
        horizontal: Xp,
        vertical: Zp,
        bullets: eg,
        "article-hero": "_article-hero_18r3k_193",
        "article-list-content": "_article-list-content_18r3k_211",
    },
    tg = {
        props: { tag: String },
        data() {
            return { styles: Ns };
        },
    };
function ig(e, t, i, s, n, a) {
    const r = Np,
        u = Up,
        l = Qp,
        o = Rs;
    return i.tag
        ? (B(),
          X(
              "div",
              { key: 0, class: te([n.styles["article-image-tag"], n.styles[i.tag]]) },
              [i.tag === "breaking" ? (B(), we(r, { key: 0 })) : Ce("", !0), i.tag === "watch" ? (B(), we(u, { key: 1 })) : Ce("", !0), i.tag === "new" ? (B(), we(l, { key: 2 })) : Ce("", !0), Z(o, { text: i.tag }, null, 8, ["text"])],
              2
          ))
        : Ce("", !0);
}
const sg = Je(tg, [["render", ig]]),
    ng = {
        props: { image: Object, imageClass: String, meta: Object },
        data() {
            return { styles: Ns };
        },
    },
    ag = ["src", "width", "height", "alt"];
function rg(e, t, i, s, n, a) {
    var l, o;
    const r = sg,
        u = Rs;
    return (
        B(),
        X(
            ce,
            null,
            [
                i.image
                    ? (B(),
                      X(
                          "div",
                          { key: 0, class: te(i.imageClass) },
                          [de("img", { class: te(n.styles["article-image"]), src: i.image.src, width: i.image.width, height: i.image.height, alt: i.image.alt }, null, 10, ag), Z(r, { tag: (l = i.meta) == null ? void 0 : l.tag }, null, 8, ["tag"])],
                          2
                      ))
                    : Ce("", !0),
                Z(u, { textClass: n.styles["article-image-captions"], text: (o = i.meta) == null ? void 0 : o.captions }, null, 8, ["textClass", "text"]),
            ],
            64
        )
    );
}
const pu = Je(ng, [["render", rg]]),
    lg = "_preview_8m7ze_2",
    ug = "_page_8m7ze_12",
    og = "_row_8m7ze_46",
    cg = "_column_8m7ze_52",
    na = {
        preview: lg,
        "no-scroll": "_no-scroll_8m7ze_8",
        page: ug,
        "page-main": "_page-main_8m7ze_28",
        row: og,
        column: cg,
        "columns-1": "_columns-1_8m7ze_59",
        "columns-2-balanced": "_columns-2-balanced_8m7ze_63",
        "columns-3-balanced": "_columns-3-balanced_8m7ze_67",
        "columns-4-balanced": "_columns-4-balanced_8m7ze_71",
        "columns-3-wide": "_columns-3-wide_8m7ze_75",
        "columns-3-narrow": "_columns-3-narrow_8m7ze_79",
        "columns-wrap": "_columns-wrap_8m7ze_83",
        "grid-container": "_grid-container_8m7ze_88",
        "grid-wrap": "_grid-wrap_8m7ze_95",
        "grid-item": "_grid-item_8m7ze_99",
        "row-header": "_row-header_8m7ze_104",
    },
    dg = {
        props: { type: String, content: [String, Array], display: String },
        data() {
            return { styles: Ns, layoutStyles: na };
        },
    },
    mg = ["href"],
    hg = ["href"],
    pg = ["href"];
function gg(e, t, i, s, n, a) {
    const r = Rs,
        u = pu;
    return (
        B(),
        X(
            ce,
            null,
            [
                i.type === "text" ? (B(), X("div", { key: 0, class: te(n.styles["article-content"]) }, [Z(r, { text: i.content }, null, 8, ["text"])], 2)) : Ce("", !0),
                i.type === "list"
                    ? (B(),
                      X(
                          "div",
                          { key: 1, class: te(n.styles["article-content"]) },
                          [
                              de(
                                  "ul",
                                  { class: te([n.styles["article-list"], n.styles.vertical, { [n.styles[i.display]]: i.display }]) },
                                  [
                                      (B(!0),
                                      X(
                                          ce,
                                          null,
                                          vt(
                                              i.content,
                                              (l) => (
                                                  B(),
                                                  X(
                                                      "li",
                                                      { class: te(n.styles["article-list-item"]) },
                                                      [l.url && !l.title ? (B(), X("a", { key: 0, href: l.url }, [Z(r, { text: l.content }, null, 8, ["text"])], 8, mg)) : (B(), we(r, { key: 1, text: l.content }, null, 8, ["text"]))],
                                                      2
                                                  )
                                              )
                                          ),
                                          256
                                      )),
                                  ],
                                  2
                              ),
                          ],
                          2
                      ))
                    : Ce("", !0),
                i.type === "articles-list"
                    ? (B(),
                      X(
                          "div",
                          { key: 2, class: te(n.styles["article-list-content"]) },
                          [
                              de(
                                  "ul",
                                  { class: te([n.styles["article-list"], n.styles.vertical]) },
                                  [
                                      (B(!0),
                                      X(
                                          ce,
                                          null,
                                          vt(
                                              i.content,
                                              (l) => (
                                                  B(),
                                                  X(
                                                      "li",
                                                      { class: te(n.styles["article-list-item"]) },
                                                      [
                                                          Z(r, { textClass: [n.styles["article-title"], "truncate-multiline", "truncate-multiline-3"], text: l.title, type: "h3" }, null, 8, ["textClass", "text"]),
                                                          l.url && !l.title ? (B(), X("a", { key: 0, href: l.url }, [Z(r, { text: l.content }, null, 8, ["text"])], 8, hg)) : (B(), we(r, { key: 1, text: l.content }, null, 8, ["text"])),
                                                      ],
                                                      2
                                                  )
                                              )
                                          ),
                                          256
                                      )),
                                  ],
                                  2
                              ),
                          ],
                          2
                      ))
                    : Ce("", !0),
                i.type === "excerpt"
                    ? (B(),
                      X(
                          "ul",
                          { key: 3, class: te([n.styles["article-list"], n.styles.horizontal]) },
                          [
                              (B(!0),
                              X(
                                  ce,
                                  null,
                                  vt(
                                      i.content,
                                      (l) => (
                                          B(),
                                          X(
                                              "li",
                                              { class: te(n.styles["article-list-item"]) },
                                              [
                                                  Z(u, { imageClass: n.styles["article-hero"], image: l.image }, null, 8, ["imageClass", "image"]),
                                                  de("div", { class: te(n.styles["article-content"]) }, [Z(r, { textClass: ["truncate-multiline", "truncate-multiline-3"], text: l.text, type: "div" }, null, 8, ["text"])], 2),
                                              ],
                                              2
                                          )
                                      )
                                  ),
                                  256
                              )),
                          ],
                          2
                      ))
                    : Ce("", !0),
                i.type === "grid"
                    ? (B(),
                      X(
                          "div",
                          { key: 4, class: te([n.layoutStyles["grid-container"], { [n.layoutStyles[i.display]]: i.display }]) },
                          [
                              (B(!0),
                              X(
                                  ce,
                                  null,
                                  vt(
                                      i.content,
                                      (l) => (
                                          B(),
                                          X(
                                              "div",
                                              { class: te(n.layoutStyles["grid-item"]) },
                                              [
                                                  Z(u, { imageClass: n.styles["article-image-container"], image: l.image, meta: l.meta }, null, 8, ["imageClass", "image", "meta"]),
                                                  l.url
                                                      ? (B(),
                                                        X(
                                                            "a",
                                                            { key: 0, href: l.url },
                                                            [Z(r, { textClass: [n.styles["article-content"], "truncate-multiline", "truncate-multiline-3"], text: l.text, type: "h3" }, null, 8, ["textClass", "text"])],
                                                            8,
                                                            pg
                                                        ))
                                                      : (B(), we(r, { key: 1, textClass: [n.styles["article-content"], "truncate-multiline", "truncate-multiline-3"], text: l.text, type: "h3" }, null, 8, ["textClass", "text"])),
                                              ],
                                              2
                                          )
                                      )
                                  ),
                                  256
                              )),
                          ],
                          2
                      ))
                    : Ce("", !0),
                i.type === "preview"
                    ? (B(),
                      X(
                          "ul",
                          { key: 5, class: te([n.styles["article-list"], n.styles.vertical]) },
                          [
                              (B(!0),
                              X(
                                  ce,
                                  null,
                                  vt(
                                      i.content,
                                      (l) => (
                                          B(),
                                          X(
                                              "li",
                                              { class: te(n.styles["article-list-item"]) },
                                              [
                                                  Z(u, { imageClass: n.styles["article-image-container"], image: l.image }, null, 8, ["imageClass", "image"]),
                                                  Z(r, { textClass: [n.styles["article-title"], "truncate-multiline", "truncate-multiline-3"], text: l.title, type: "h3" }, null, 8, ["textClass", "text"]),
                                              ],
                                              2
                                          )
                                      )
                                  ),
                                  256
                              )),
                          ],
                          2
                      ))
                    : Ce("", !0),
            ],
            64
        )
    );
}
const fg = Je(dg, [["render", gg]]),
    vg = {
        props: { article: Object },
        data() {
            return { layoutStyles: na, articleStyles: Ns };
        },
    };
function bg(e, t, i, s, n, a) {
    const r = jp,
        u = pu,
        l = Rs,
        o = fg;
    return (
        B(),
        X(
            "article",
            { class: te([n.layoutStyles.column, n.layoutStyles[i.article.class], n.articleStyles.article]) },
            [
                Z(r, { headerClass: n.articleStyles["article-header"], text: i.article.header, link: i.article.url }, null, 8, ["headerClass", "text", "link"]),
                de(
                    "section",
                    { class: te(n.articleStyles["article-body"]) },
                    [
                        Z(u, { imageClass: n.articleStyles["article-image-container"], image: i.article.image, meta: i.article.meta }, null, 8, ["imageClass", "image", "meta"]),
                        Z(l, { textClass: [n.articleStyles["article-title"], "truncate-singleline"], text: i.article.title, type: "h3" }, null, 8, ["textClass", "text"]),
                        Z(o, { type: i.article.type, content: i.article.content, display: i.article.display }, null, 8, ["type", "content", "display"]),
                    ],
                    2
                ),
            ],
            2
        )
    );
}
const _g = Je(vg, [["render", bg]]),
    yg = {
        props: { section: Object },
        data() {
            return { styles: na };
        },
    },
    qg = ["id"];
function wg(e, t, i, s, n, a) {
    var u;
    const r = _g;
    return (
        B(),
        X(
            ce,
            null,
            [
                (u = i.section) != null && u.name ? (B(), X("div", { key: 0, id: i.section.id, class: te(n.styles["row-header"]) }, [de("h2", null, kt(i.section.name), 1)], 10, qg)) : Ce("", !0),
                de(
                    "section",
                    { class: te(n.styles.row) },
                    [
                        (B(!0),
                        X(
                            ce,
                            null,
                            vt(i.section.articles, (l) => (B(), we(r, { article: l }, null, 8, ["article"]))),
                            256
                        )),
                    ],
                    2
                ),
            ],
            64
        )
    );
}
const Pg = Je(yg, [["render", wg]]),
    Eg = "_toast_13eok_1",
    xg = "_open_13eok_16",
    jg = {
        toast: Eg,
        open: xg,
        "toast-close-button": "_toast-close-button_13eok_23",
        "toast-close-button-icon": "_toast-close-button-icon_13eok_34",
        "toast-header": "_toast-header_13eok_41",
        "toast-body": "_toast-body_13eok_52",
        "toast-description": "_toast-description_13eok_59",
        "toast-actions": "_toast-actions_13eok_78",
        "toast-actions-button": "_toast-actions-button_13eok_83",
    },
    Cg = "_button_kdg42_1",
    Ag = { button: Cg, "primary-button": "_primary-button_kdg42_13", "secondary-button": "_secondary-button_kdg42_25" },
    kg = {
        props: { onClose: Function, onAccept: Function, onReject: Function, notification: Object },
        data() {
            return { toastStyles: jg, buttonStyles: Ag, callbacks: { accept: this.onAccept, reject: this.onReject } };
        },
    },
    Tg = de("span", { class: "animated-icon-inner" }, [de("span"), de("span")], -1),
    Sg = [Tg],
    Rg = ["id", "onClick"];
function Ng(e, t, i, s, n, a) {
    return (
        B(),
        X(
            "div",
            { class: te([n.toastStyles.toast, n.toastStyles.open]) },
            [
                de(
                    "button",
                    { id: "close-toast-link", class: te(n.toastStyles["toast-close-button"]), onClick: t[0] || (t[0] = (...r) => i.onClose && i.onClose(...r)) },
                    [de("div", { class: te([n.toastStyles["toast-close-button-icon"], "animated-icon", "close-icon", "hover"]), title: "Close Icon" }, Sg, 2)],
                    2
                ),
                i.notification.title ? (B(), X("header", { key: 0, class: te(n.toastStyles["toast-header"]) }, [de("h2", null, kt(i.notification.title), 1)], 2)) : Ce("", !0),
                de(
                    "section",
                    { class: te(n.toastStyles["toast-body"]) },
                    [
                        de("div", { class: te(n.toastStyles["toast-description"]) }, kt(i.notification.description), 3),
                        de(
                            "div",
                            { class: te(n.toastStyles["toast-actions"]) },
                            [
                                (B(!0),
                                X(
                                    ce,
                                    null,
                                    vt(
                                        i.notification.actions,
                                        (r) => (
                                            B(),
                                            X(
                                                "button",
                                                { id: `toast-${r.type}-button`, class: te([n.buttonStyles.button, n.buttonStyles[`${r.priority}-button`], n.toastStyles["toast-actions-button"]]), onClick: n.callbacks[r.type] },
                                                kt(r.name),
                                                11,
                                                Rg
                                            )
                                        )
                                    ),
                                    256
                                )),
                            ],
                            2
                        ),
                    ],
                    2
                ),
            ],
            2
        )
    );
}
const Mg = Je(kg, [["render", Ng]]);
function Ig(e = {}) {
    const t = e.path || window.location.pathname;
    let i = {};
    try {
        i = JSON.parse(sessionStorage.getItem("nuxt:reload") || "{}");
    } catch {}
    if (e.force || (i == null ? void 0 : i.path) !== t || (i == null ? void 0 : i.expires) < Date.now()) {
        try {
            sessionStorage.setItem("nuxt:reload", JSON.stringify({ path: t, expires: Date.now() + (e.ttl ?? 1e4) }));
        } catch {}
        if (e.persistState)
            try {
                sessionStorage.setItem("nuxt:reload:state", JSON.stringify({ state: Ee().payload.state }));
            } catch {}
        window.location.pathname !== t ? (window.location.href = t) : window.location.reload();
    }
}
const Ei = {
        home: {
            name: "Front Page",
            url: "/",
            priority: 0,
            notification: {
                name: "cookies",
                title: "This website uses cookies 🍪",
                description: "We use cookies to improve your experience on our site and to show you the most relevant content possible. To find out more, please read our privacy policy and our cookie policy.",
                actions: [
                    { name: "Cancel", priority: "secondary", type: "reject" },
                    { name: "Accept", priority: "primary", type: "accept" },
                ],
            },
            sections: [
                {
                    id: "content-frontpage-breaking-news",
                    name: "Breaking News",
                    articles: [
                        {
                            class: "columns-3-narrow",
                            header: "Uncensored",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Nisl nunc mi ipsum faucibus vitae aliquet.",
                            type: "text",
                            content: `Velit dignissim sodales ut eu. Sed tempus urna et pharetra. Porttitor rhoncus dolor purus non. Elementum curabitur vitae nunc sed velit dignissim sodales.

Pretium fusce id velit ut tortor pretium viverra suspendisse potenti. In nulla posuere sollicitudin aliquam ultrices sagittis orci. Aliquam sem fringilla ut morbi tincidunt augue interdum velit. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Nunc mi ipsum faucibus vitae aliquet.`,
                        },
                        {
                            class: "columns-3-wide",
                            header: "More top stories",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone.", tag: "breaking" },
                            title: "Justo eget magna fermentum iaculis eu non diam phasellus vestibulum.",
                            type: "text",
                            content: `Pulvinar etiam non quam lacus suspendisse faucibus interdum posuere. Arcu bibendum at varius vel pharetra vel turpis nunc. Eget dolor morbi non arcu risus quis varius. Ac odio tempor orci dapibus ultrices in.

Amet tellus cras adipiscing enim eu turpis. Tortor pretium viverra suspendisse potenti nullam. Condimentum vitae sapien pellentesque habitant morbi. Ultrices in iaculis nunc sed augue lacus viverra vitae.`,
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Crime & justice",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Eu sem integer vitae justo eget magna fermentum iaculis.",
                            type: "text",
                            content: `Volutpat commodo sed egestas egestas. Eget lorem dolor sed viverra ipsum nunc aliquet bibendum enim. Felis eget velit aliquet sagittis id consectetur purus. Lorem ipsum dolor sit amet. Ut diam quam nulla porttitor. Id volutpat lacus laoreet non.

 Odio morbi quis commodo odio aenean sed adipiscing diam donec. Quis eleifend quam adipiscing vitae proin sagittis nisl. Praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus.`,
                        },
                    ],
                },
                {
                    id: "content-frontpage-latest-news",
                    name: "Latest News",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Happening Now",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Lorem ipsum dolor sit amet.",
                                    content:
                                        "Molestie nunc non blandit massa enim nec. Ornare suspendisse sed nisi lacus sed viverra tellus in. Id consectetur purus ut faucibus. At auctor urna nunc id cursus metus. Eget aliquet nibh praesent tristique magna. Morbi tristique senectus et netus et malesuada fames.",
                                },
                                {
                                    title: "Consectetur adipiscing elit.",
                                    content:
                                        "Sit amet consectetur adipiscing elit ut aliquam purus sit. Consequat nisl vel pretium lectus quam. Sagittis id consectetur purus ut faucibus pulvinar elementum integer enim. Nec sagittis aliquam malesuada bibendum arcu.",
                                },
                                {
                                    title: "Sed do eiusmod tempor incididunt.",
                                    content: "Pulvinar neque laoreet suspendisse interdum consectetur libero id faucibus nisl. Pulvinar elementum integer enim neque volutpat ac. Lorem donec massa sapien faucibus.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Noteworthy",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Augue neque gravida in fermentum et sollicitudin ac orci.",
                            type: "list",
                            content: [
                                { content: "Odio morbi quis commodo odio aenean sed adipiscing diam donec." },
                                { content: "Consequat semper viverra nam libero justo laoreet sit." },
                                { content: "Risus ultricies tristique nulla aliquet enim tortor at auctor." },
                                { content: "Diam vulputate ut pharetra sit amet aliquam id diam maecenas." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Around the Globe",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Volutpat est velit egestas dui id ornare arcu.",
                            type: "list",
                            content: [
                                { content: "Nibh mauris cursus mattis molestie. Varius vel pharetra vel turpis nunc eget lorem dolor." },
                                { content: "Turpis egestas maecenas pharetra convallis posuere morbi leo urna molestie." },
                                { content: "Enim blandit volutpat maecenas volutpat blandit aliquam etiam erat." },
                                { content: "Fermentum dui faucibus in ornare. In hac habitasse platea dictumst vestibulum rhoncus est pellentesque elit." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-frontpage-latest-media",
                    name: "Latest Media",
                    articles: [
                        {
                            class: "columns-1",
                            type: "grid",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                            ],
                        },
                    ],
                },
                {
                    id: "content-frontpage-highlights",
                    name: "Highlights",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "Domestic Highlights",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "At urna condimentum mattis pellentesque id nibh tortor id. Urna cursus eget nunc scelerisque viverra mauris in. Pretium vulputate sapien nec sagittis aliquam malesuada bibendum arcu.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Enim lobortis scelerisque fermentum dui faucibus in. Vitae semper quis lectus nulla at volutpat. In nisl nisi scelerisque eu ultrices vitae auctor.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Lorem donec massa sapien faucibus et molestie ac feugiat. Quis varius quam quisque id diam vel. Ut tristique et egestas quis ipsum suspendisse. Fermentum posuere urna nec tincidunt praesent semper feugiat.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Global Highlights",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Augue eget arcu dictum varius duis at consectetur. Ornare arcu dui vivamus arcu felis bibendum ut. Magna eget est lorem ipsum dolor sit amet. Tincidunt nunc pulvinar sapien et ligula ullamcorper malesuada proin.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Leo urna molestie at elementum eu facilisis sed. Est lorem ipsum dolor sit amet consectetur adipiscing elit pellentesque.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Nisi scelerisque eu ultrices vitae auctor. Quis risus sed vulputate odio. Pellentesque sit amet porttitor eget dolor morbi non. Nullam eget felis eget nunc lobortis mattis aliquam.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Local Highlights",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Mattis ullamcorper velit sed ullamcorper. Orci ac auctor augue mauris augue neque. Condimentum mattis pellentesque id nibh tortor.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Fermentum odio eu feugiat pretium. Urna nec tincidunt praesent semper feugiat nibh sed. Adipiscing elit ut aliquam purus sit.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Vitae tempus quam pellentesque nec nam aliquam sem et. Fringilla urna porttitor rhoncus dolor purus non enim praesent elementum. Congue nisi vitae suscipit tellus mauris a diam maecenas. Quis varius quam quisque id diam.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-frontpage-top-stories",
                    name: "Top Stories",
                    articles: [
                        {
                            class: "columns-1",
                            type: "grid",
                            display: "grid-wrap",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Ut venenatis tellus in metus vulputate eu scelerisque. In nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Mattis nunc sed blandit libero volutpat sed cras ornare arcu. Scelerisque eu ultrices vitae auctor eu augue. Libero justo laoreet sit amet cursus sit amet.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Non consectetur a erat nam. Blandit massa enim nec dui nunc mattis enim ut. Tempor orci eu lobortis elementum nibh tellus molestie nunc. Facilisi etiam dignissim diam quis enim lobortis scelerisque fermentum dui.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Eget est lorem ipsum dolor sit amet. Vivamus at augue eget arcu dictum varius duis at consectetur. Scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis. Vitae sapien pellentesque habitant morbi tristique senectus et.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Diam in arcu cursus euismod quis viverra nibh cras pulvinar. Est velit egestas dui id ornare arcu odio ut sem. A cras semper auctor neque. Ipsum suspendisse ultrices gravida dictum fusce ut.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Tellus integer feugiat scelerisque varius morbi enim. Diam donec adipiscing tristique risus nec feugiat in fermentum. Volutpat odio facilisis mauris sit amet massa vitae. Tempor orci dapibus ultrices in iaculis nunc sed. Aenean vel elit scelerisque mauris pellentesque pulvinar.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-frontpage-international",
                    name: "International",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Europe",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Commodo elit at imperdiet dui accumsan sit amet. Habitasse platea dictumst vestibulum rhoncus.",
                                    content:
                                        "Orci ac auctor augue mauris augue neque gravida. Lectus magna fringilla urna porttitor rhoncus dolor purus non enim. Sagittis aliquam malesuada bibendum arcu vitae. Pellentesque habitant morbi tristique senectus et netus. Etiam erat velit scelerisque in dictum non consectetur a.",
                                },
                                {
                                    title: "Netus et malesuada fames ac turpis egestas maecenas pharetra.",
                                    content:
                                        "Facilisis leo vel fringilla est. Turpis tincidunt id aliquet risus feugiat in ante metus. Viverra ipsum nunc aliquet bibendum enim facilisis. Tristique et egestas quis ipsum suspendisse ultrices gravida dictum. Tristique senectus et netus et malesuada fames ac turpis egestas.",
                                },
                                {
                                    title: "Ornare suspendisse sed nisi lacus sed viverra tellus in.",
                                    content:
                                        "Dui vivamus arcu felis bibendum. Purus ut faucibus pulvinar elementum integer enim neque volutpat ac. Auctor eu augue ut lectus arcu bibendum. Diam volutpat commodo sed egestas egestas fringilla phasellus.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "South America",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Augue eget arcu dictum varius duis.",
                                    content: "Commodo ullamcorper a lacus vestibulum sed arcu non. Nullam ac tortor vitae purus faucibus ornare suspendisse sed. Id interdum velit laoreet id donec ultrices tincidunt arcu non.",
                                },
                                {
                                    title: "Fringilla ut morbi tincidunt augue interdum velit euismod in pellentesque.",
                                    content:
                                        "Turpis egestas maecenas pharetra convallis posuere morbi leo. Odio pellentesque diam volutpat commodo. Ornare massa eget egestas purus viverra accumsan in nisl nisi. Tellus integer feugiat scelerisque varius morbi enim nunc. Erat velit scelerisque in dictum non consectetur.",
                                },
                                {
                                    title: "Mi bibendum neque egestas congue quisque.",
                                    content: "Sapien eget mi proin sed libero. Adipiscing elit duis tristique sollicitudin nibh sit. Faucibus scelerisque eleifend donec pretium. Ac tortor dignissim convallis aenean et tortor at risus.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Asia",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Sodales ut etiam sit amet nisl purus in. Enim sed faucibus turpis in eu mi bibendum neque.",
                                    content: "Tortor id aliquet lectus proin. Pulvinar elementum integer enim neque volutpat ac tincidunt. Auctor eu augue ut lectus arcu bibendum at varius. Congue mauris rhoncus aenean vel elit scelerisque mauris.",
                                },
                                {
                                    title: "haretra convallis posuere morbi leo urna.",
                                    content:
                                        "Egestas diam in arcu cursus euismod quis. Ac turpis egestas integer eget aliquet nibh praesent tristique magna. Molestie at elementum eu facilisis sed odio morbi quis. Lectus arcu bibendum at varius. Eros in cursus turpis massa tincidunt dui.",
                                },
                                {
                                    title: "At varius vel pharetra vel turpis nunc eget lorem dolor. ",
                                    content: "Proin sagittis nisl rhoncus mattis rhoncus urna neque viverra. Lacus sed viverra tellus in. Sed nisi lacus sed viverra tellus in. Venenatis cras sed felis eget velit aliquet sagittis id consectetur.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-frontpage-featured",
                    name: "Featured",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Washington",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Et netus et malesuada fames ac.",
                            type: "list",
                            display: "bullets",
                            content: [
                                { content: "Vulputate dignissim suspendisse in est ante.", url: "#" },
                                { content: "Blandit turpis cursus in hac habitasse platea dictumst.", url: "#" },
                                { content: "Sed nisi lacus sed viverra tellus in hac.", url: "#" },
                                { content: "Euismod in pellentesque massa placerat duis ultricies lacus sed.", url: "#" },
                                { content: "Quam lacus suspendisse faucibus interdum posuere.", url: "#" },
                                { content: "Sit amet mattis vulputate enim nulla aliquet porttitor lacus.", url: "#" },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "New York",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Commodo quis imperdiet massa tincidunt nunc pulvinar sapien et ligula.",
                            type: "list",
                            display: "bullets",
                            content: [
                                { content: "Id semper risus in hendrerit gravida rutrum quisque non.", url: "#" },
                                { content: "Sit amet est placerat in egestas erat imperdiet sed euismod.", url: "#" },
                                { content: "Aliquam malesuada bibendum arcu vitae elementum curabitur vitae nunc.", url: "#" },
                                { content: "get gravida cum sociis natoque. Bibendum ut tristique et egestas.", url: "#" },
                                { content: "Mauris cursus mattis molestie a iaculis at erat.", url: "#" },
                                { content: "Sit amet massa vitae tortor condimentum lacinia.", url: "#" },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Los Angeles",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Parturient montes nascetur ridiculus mus mauris.",
                            type: "list",
                            display: "bullets",
                            content: [
                                { content: "Mattis enim ut tellus elementum sagittis.", url: "#" },
                                { content: "Sit amet venenatis urna cursus eget nunc scelerisque viverra mauris.", url: "#" },
                                { content: "Mi bibendum neque egestas congue quisque egestas.", url: "#" },
                                { content: "Nunc scelerisque viverra mauris in aliquam.", url: "#" },
                                { content: "Egestas erat imperdiet sed euismod nisi porta lorem mollis aliquam.", url: "#" },
                                { content: "Phasellus egestas tellus rutrum tellus pellentesque eu tincidunt tortor aliquam.", url: "#" },
                            ],
                        },
                    ],
                },
                {
                    id: "content-frontpage-underscored",
                    name: "Underscored",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Rhoncus urna neque viverra justo nec. Dis parturient montes nascetur ridiculus mus mauris vitae ultricies leo. Praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus. Enim nunc faucibus a pellentesque sit amet. Est ullamcorper eget nulla facilisi.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Enim lobortis scelerisque fermentum dui faucibus in ornare quam. Iaculis urna id volutpat lacus laoreet non curabitur gravida. Non quam lacus suspendisse faucibus. Elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at. Bibendum est ultricies integer quis auctor elit.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Faucibus scelerisque eleifend donec pretium vulputate. Lacus luctus accumsan tortor posuere. Nulla facilisi nullam vehicula ipsum a arcu cursus vitae. Viverra aliquet eget sit amet tellus cras adipiscing. Congue quisque egestas diam in arcu cursus.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Cum sociis natoque penatibus et magnis dis parturient montes. Ut eu sem integer vitae justo eget magna fermentum iaculis. Amet venenatis urna cursus eget nunc scelerisque viverra. Quisque id diam vel quam elementum. Nulla facilisi cras fermentum odio eu feugiat pretium nibh.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-frontpage-happening-now",
                    name: "Happening Now",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "Political",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Cras semper auctor neque vitae tempus quam pellentesque. Consequat ac felis donec et odio pellentesque. Eu consequat ac felis donec et odio pellentesque diam volutpat. Suscipit tellus mauris a diam maecenas sed enim ut sem.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Sed faucibus turpis in eu mi bibendum neque. Condimentum id venenatis a condimentum vitae sapien pellentesque habitant morbi. In iaculis nunc sed augue lacus viverra. Pellentesque nec nam aliquam sem et. Tellus mauris a diam maecenas sed.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Mattis vulputate enim nulla aliquet. Ac tortor dignissim convallis aenean. Nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Consequat ac felis donec et odio pellentesque diam. Lorem ipsum dolor sit amet consectetur adipiscing.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Health",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Vitae tortor condimentum lacinia quis. Nisl nisi scelerisque eu ultrices vitae. Id velit ut tortor pretium viverra suspendisse potenti nullam. Viverra accumsan in nisl nisi scelerisque eu ultrices vitae.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Ullamcorper malesuada proin libero nunc consequat. Imperdiet sed euismod nisi porta. Arcu cursus vitae congue mauris rhoncus aenean vel. Enim nunc faucibus a pellentesque. Gravida in fermentum et sollicitudin ac orci phasellus.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Morbi tristique senectus et netus et malesuada fames. Sit amet cursus sit amet dictum sit. Sagittis vitae et leo duis ut diam quam. Non consectetur a erat nam at lectus. Massa massa ultricies mi quis hendrerit dolor magna eget est.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Business",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Integer enim neque volutpat ac. Feugiat sed lectus vestibulum mattis. Ullamcorper malesuada proin libero nunc consequat interdum varius sit amet. Mattis molestie a iaculis at erat pellentesque. Adipiscing elit duis tristique sollicitudin.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Dignissim sodales ut eu sem integer. Mauris cursus mattis molestie a iaculis at erat. Tempus quam pellentesque nec nam aliquam sem et tortor. Id diam vel quam elementum pulvinar etiam non quam.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Massa vitae tortor condimentum lacinia quis vel eros. Platea dictumst vestibulum rhoncus est pellentesque. Sollicitudin tempor id eu nisl nunc mi ipsum faucibus vitae. Sed risus ultricies tristique nulla aliquet. Magna sit amet purus gravida quis blandit turpis cursus in.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-frontpage-hot-topics",
                    name: "Hot Topics",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Amet nisl suscipit adipiscing bibendum. Elit ullamcorper dignissim cras tincidunt lobortis feugiat. Non odio euismod lacinia at. Risus viverra adipiscing at in tellus integer feugiat scelerisque.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Viverra suspendisse potenti nullam ac tortor. Tellus id interdum velit laoreet id donec. Dui nunc mattis enim ut tellus. Nec ullamcorper sit amet risus nullam eget felis eget. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Commodo ullamcorper a lacus vestibulum sed arcu non odio euismod. Etiam non quam lacus suspendisse. Hac habitasse platea dictumst vestibulum rhoncus est.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Mi eget mauris pharetra et ultrices neque ornare aenean euismod. Egestas congue quisque egestas diam in arcu cursus euismod quis. Tincidunt id aliquet risus feugiat. Viverra nibh cras pulvinar mattis nunc sed.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-frontpage-paid-content",
                    name: "Paid Content",
                    articles: [
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Nunc aliquet bibendum enim facilisis gravida neque. Nec feugiat in fermentum posuere urna. Molestie at elementum eu facilisis sed odio morbi. Scelerisque purus semper eget duis at tellus.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Eget dolor morbi non arcu risus quis. Non curabitur gravida arcu ac tortor dignissim." },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Quam lacus suspendisse faucibus interdum. In pellentesque massa placerat duis ultricies lacus sed. Convallis a cras semper auctor neque vitae tempus quam. Ut pharetra sit amet aliquam id diam.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam. Eu feugiat pretium nibh ipsum consequat." },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Non tellus orci ac auctor augue mauris augue neque gravida. Nulla facilisi nullam vehicula ipsum a arcu cursus vitae. Quam nulla porttitor massa id neque aliquam vestibulum morbi. Diam quis enim lobortis scelerisque.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Haretra diam sit amet nisl suscipit adipiscing bibendum est ultricies. Senectus et netus et malesuada fames." },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "It amet porttitor eget dolor morbi non. Sed lectus vestibulum mattis ullamcorper. Laoreet id donec ultrices tincidunt arcu non. Quam adipiscing vitae proin sagittis.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Mollis aliquam ut porttitor leo a diam. Nunc aliquet bibendum enim facilisis gravida neque convallis." },
                            ],
                        },
                    ],
                },
            ],
        },
        us: {
            name: "US",
            url: "/us",
            priority: 1,
            message: { title: "Watch breaking news!", description: "Something important happened and you should watch it!" },
            sections: [
                {
                    id: "content-us-world-news",
                    name: "World News",
                    articles: [
                        {
                            class: "columns-3-wide",
                            header: "Happening Today",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone.", tag: "breaking" },
                            title: "Sed egestas egestas fringilla phasellus faucibus scelerisque eleifend.",
                            type: "text",
                            content:
                                "Iaculis urna id volutpat lacus. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Dictum varius duis at consectetur lorem donec. At tellus at urna condimentum mattis pellentesque id. Consectetur lorem donec massa sapien faucibus et molestie ac. Risus at ultrices mi tempus.",
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Trending",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Ut eu sem integer vitae justo eget magna.",
                            type: "text",
                            content: `Id neque aliquam vestibulum morbi blandit cursus risus at ultrices. Arcu dui vivamus arcu felis bibendum ut tristique et. Justo donec enim diam vulputate ut.

Pellentesque elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at. Ipsum suspendisse ultrices gravida dictum fusce ut placerat. Convallis tellus id interdum velit laoreet id.`,
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Weather",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Id consectetur purus ut faucibus pulvinar elementum integer enim.",
                            type: "list",
                            content: [
                                { content: "Pellentesque habitant morbi tristique senectus et. Vel eros donec ac odio tempor orci dapibus ultrices in." },
                                { content: "Et odio pellentesque diam volutpat commodo sed egestas egestas fringilla." },
                                { content: "Et netus et malesuada fames ac turpis egestas. Maecenas ultricies mi eget mauris pharetra et ultrices." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-us-around-the-nation",
                    name: "Around the Nation",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Latest",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Nullam eget felis eget nunc lobortis mattis aliquam.",
                            type: "list",
                            content: [
                                { content: "Nibh ipsum consequat nisl vel. Senectus et netus et malesuada fames." },
                                { content: "Lectus vestibulum mattis ullamcorper velit sed ullamcorper morbi." },
                                { content: "Blandit volutpat maecenas volutpat blandit aliquam etiam erat." },
                                { content: "Non curabitur gravida arcu ac. Est sit amet facilisis magna etiam tempor orci eu lobortis." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Business",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Vestibulum rhoncus est pellentesque elit. Enim lobortis scelerisque fermentum dui faucibus.",
                            type: "list",
                            content: [{ content: "Sapien pellentesque habitant morbi tristique senectus et." }, { content: "Aliquet eget sit amet tellus cras adipiscing." }, { content: "Tellus mauris a diam maecenas sed enim ut sem viverra." }],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Politics",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Hendrerit dolor magna eget est. Nec dui nunc mattis enim ut tellus elementum sagittis.",
                            type: "list",
                            content: [
                                { content: "Euismod elementum nisi quis eleifend quam adipiscing vitae proin sagittis." },
                                { content: "Ac tincidunt vitae semper quis lectus nulla at volutpat diam." },
                                { content: "In mollis nunc sed id semper risus in hendrerit. Turpis massa sed elementum tempus egestas sed sed risus. Imperdiet proin fermentum leo vel orci." },
                                { content: "Nisl purus in mollis nunc sed id semper. Pretium lectus quam id leo in vitae." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-us-roundup",
                    name: "Roundup",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "Washington",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Nisl nisi scelerisque eu ultrices vitae. Consectetur adipiscing elit duis tristique sollicitudin. Ornare suspendisse sed nisi lacus. Justo eget magna fermentum iaculis.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Tellus integer feugiat scelerisque varius morbi enim. Ut tristique et egestas quis." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Nulla malesuada pellentesque elit eget gravida cum sociis natoque penatibus." },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "East Coast",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Pharetra et ultrices neque ornare aenean euismod elementum nisi. Ipsum dolor sit amet consectetur adipiscing elit ut.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Quam vulputate dignissim suspendisse in est. Vestibulum mattis ullamcorper velit sed." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Habitant morbi tristique senectus et netus et. Ullamcorper sit amet risus nullam eget felis." },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "West Coast",
                            type: "excerpt",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Bibendum enim facilisis gravida neque convallis a cras. Semper feugiat nibh sed pulvinar proin gravida hendrerit." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Vel facilisis volutpat est velit. Odio ut sem nulla pharetra diam sit amet nisl." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Risus nec feugiat in fermentum posuere urna nec. Massa tincidunt nunc pulvinar sapien." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-us-crime+justice",
                    name: "Crime & Justice",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Supreme Court",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Vel risus commodo viverra maecenas.",
                                    content:
                                        "Vitae tempus quam pellentesque nec nam aliquam sem. Mi in nulla posuere sollicitudin aliquam ultrices sagittis. Leo integer malesuada nunc vel. Ultricies integer quis auctor elit sed vulputate. Sit amet justo donec enim diam vulputate. Velit aliquet sagittis id consectetur purus ut faucibus pulvinar.",
                                },
                                {
                                    title: "Sit amet mattis vulputate enim.",
                                    content:
                                        "Urna porttitor rhoncus dolor purus non. Tristique senectus et netus et malesuada fames ac turpis egestas. Suscipit tellus mauris a diam maecenas. Risus ultricies tristique nulla aliquet enim. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper.",
                                },
                                {
                                    title: "Mauris in aliquam sem fringilla ut morbi tincidunt.",
                                    content:
                                        "A erat nam at lectus. Orci sagittis eu volutpat odio facilisis mauris sit. Faucibus nisl tincidunt eget nullam non. Nisl condimentum id venenatis a. Suscipit tellus mauris a diam maecenas sed enim. Orci nulla pellentesque dignissim enim sit amet venenatis. Est ultricies integer quis auctor.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Local Law",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Sit amet justo donec enim diam vulputate ut.",
                                    content:
                                        "Tincidunt dui ut ornare lectus sit amet est. Risus sed vulputate odio ut enim blandit volutpat maecenas volutpat. Posuere urna nec tincidunt praesent semper feugiat nibh sed pulvinar. Euismod in pellentesque massa placerat duis.",
                                },
                                {
                                    title: "Aliquam ultrices sagittis orci a scelerisque purus semper eget duis.",
                                    content:
                                        "Lobortis feugiat vivamus at augue eget arcu. Id ornare arcu odio ut sem nulla pharetra diam. Mauris in aliquam sem fringilla ut morbi tincidunt augue interdum. Congue quisque egestas diam in arcu cursus euismod quis viverra.",
                                },
                                {
                                    title: "In metus vulputate eu scelerisque felis imperdiet proin.",
                                    content: "Elementum pulvinar etiam non quam. Id nibh tortor id aliquet lectus proin nibh. Elementum facilisis leo vel fringilla est ullamcorper eget. Dictum sit amet justo donec enim diam vulputate.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Opinion",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Magna ac placerat vestibulum lectus.",
                                    content:
                                        "enenatis urna cursus eget nunc scelerisque viverra mauris. Convallis posuere morbi leo urna molestie at elementum. Eu lobortis elementum nibh tellus. Vitae purus faucibus ornare suspendisse sed nisi lacus sed viverra.",
                                },
                                {
                                    title: "Nisl rhoncus mattis rhoncus urna neque viverra justo.",
                                    content:
                                        "Tristique sollicitudin nibh sit amet. Aliquam purus sit amet luctus venenatis. Vitae nunc sed velit dignissim sodales ut. Elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus. Sit amet risus nullam eget.",
                                },
                                {
                                    title: "Sed felis eget velit aliquet sagittis id consectetur purus ut.",
                                    content:
                                        "Egestas erat imperdiet sed euismod nisi porta. Vel orci porta non pulvinar neque laoreet. Urna condimentum mattis pellentesque id nibh. Arcu non sodales neque sodales ut etiam sit amet. Elementum curabitur vitae nunc sed velit dignissim.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-us-around-the-us",
                    name: "Around the US",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Latest",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Ut tortor pretium viverra suspendisse potenti nullam ac tortor.",
                            type: "list",
                            content: [
                                { content: "Erat pellentesque adipiscing commodo elit at. Ornare lectus sit amet est placerat in." },
                                { content: "Dui ut ornare lectus sit amet est placerat in egestas. Commodo sed egestas egestas fringilla phasellus." },
                                { content: "Mi quis hendrerit dolor magna eget est lorem ipsum. Urna molestie at elementum eu facilisis sed odio morbi." },
                                { content: "Mauris rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Business",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Nam at lectus urna duis convallis convallis tellus id. Sem nulla pharetra diam sit amet nisl.",
                            type: "list",
                            content: [
                                { content: "Nunc faucibus a pellentesque sit amet. Id velit ut tortor pretium viverra suspendisse potenti nullam ac." },
                                { content: "Eget mi proin sed libero enim sed. A scelerisque purus semper eget duis at tellus." },
                                { content: "Praesent tristique magna sit amet purus. Eros in cursus turpis massa." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Politics",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Tristique nulla aliquet enim tortor at auctor urna nunc.",
                            type: "list",
                            content: [
                                { content: "Tincidunt ornare massa eget egestas purus viverra accumsan in nisl. Amet mattis vulputate enim nulla." },
                                { content: "Pellentesque massa placerat duis ultricies. Tortor at auctor urna nunc id cursus." },
                                { content: "Venenatis urna cursus eget nunc scelerisque viverra mauris." },
                                { content: "Dolor morbi non arcu risus quis varius quam quisque id." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-us-latest-media",
                    name: "Latest Media",
                    articles: [
                        {
                            class: "columns-1",
                            type: "grid",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                            ],
                        },
                    ],
                },
                {
                    id: "content-us-business",
                    name: "Business",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Local",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Sed viverra tellus in hac habitasse platea dictumst vestibulum.",
                                    content:
                                        "Maecenas volutpat blandit aliquam etiam. Diam volutpat commodo sed egestas egestas fringilla phasellus faucibus scelerisque. Est ullamcorper eget nulla facilisi etiam dignissim diam quis. Tincidunt praesent semper feugiat nibh sed pulvinar proin gravida hendrerit. Varius vel pharetra vel turpis nunc eget. Enim ut tellus elementum sagittis vitae et leo duis.",
                                },
                                {
                                    title: "Porttitor leo a diam sollicitudin tempor id eu nisl.",
                                    content:
                                        "Ut diam quam nulla porttitor massa id neque. Nulla facilisi etiam dignissim diam quis enim lobortis. Quam nulla porttitor massa id. Neque ornare aenean euismod elementum nisi quis eleifend quam adipiscing. Justo nec ultrices dui sapien eget mi. Volutpat diam ut venenatis tellus in. Mi in nulla posuere sollicitudin aliquam ultrices.",
                                },
                                {
                                    title: "Leo vel orci porta non pulvinar neque laoreet.",
                                    content:
                                        "Placerat duis ultricies lacus sed. Pellentesque adipiscing commodo elit at imperdiet dui. Accumsan lacus vel facilisis volutpat. Condimentum lacinia quis vel eros donec ac. Pellentesque habitant morbi tristique senectus. Ultrices eros in cursus turpis massa tincidunt dui ut ornare. Rhoncus urna neque viverra justo nec ultrices dui sapien. Amet venenatis urna cursus eget.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Global",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Platea dictumst quisque sagittis purus sit amet volutpat consequat mauris.",
                                    content:
                                        "Eu lobortis elementum nibh tellus molestie nunc. Vel turpis nunc eget lorem dolor sed viverra. Massa sapien faucibus et molestie ac feugiat sed. Sed egestas egestas fringilla phasellus faucibus. At erat pellentesque adipiscing commodo elit at imperdiet dui accumsan",
                                },
                                {
                                    title: "Ultrices gravida dictum fusce ut placerat orci nulla pellentesque.",
                                    content:
                                        "Velit ut tortor pretium viverra suspendisse potenti nullam ac tortor. Feugiat nibh sed pulvinar proin gravida. Feugiat in fermentum posuere urna nec tincidunt praesent. Nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. A scelerisque purus semper eget.",
                                },
                                {
                                    title: "Est ullamcorper eget nulla facilisi etiam.",
                                    content:
                                        "Augue mauris augue neque gravida in fermentum et. Ornare arcu odio ut sem nulla pharetra diam. Tristique et egestas quis ipsum suspendisse ultrices gravida. Aliquam vestibulum morbi blandit cursus risus at ultrices mi. Non blandit massa enim nec dui nunc mattis.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Quarterly",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Non curabitur gravida arcu ac tortor dignissim.",
                                    content:
                                        "Dui nunc mattis enim ut. Non consectetur a erat nam. Arcu vitae elementum curabitur vitae nunc sed velit dignissim. Congue quisque egestas diam in arcu cursus euismod quis viverra. Consequat semper viverra nam libero justo laoreet sit amet.",
                                },
                                {
                                    title: "Velit egestas dui id ornare arcu odio ut.",
                                    content:
                                        "At ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget. Aenean et tortor at risus viverra. Lectus magna fringilla urna porttitor rhoncus dolor. Posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Euismod in pellentesque massa placerat duis ultricies lacus sed turpis.",
                                },
                                {
                                    title: "Malesuada nunc vel risus commodo viverra maecenas accumsan lacus vel.",
                                    content:
                                        "Nunc eget lorem dolor sed. Amet aliquam id diam maecenas ultricies mi. Sodales ut etiam sit amet nisl purus. Consectetur adipiscing elit ut aliquam purus sit amet luctus venenatis. Fusce ut placerat orci nulla pellentesque dignissim enim sit.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-us-underscored",
                    name: "Underscored",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Netus et malesuada fames ac turpis egestas. Habitasse platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim. Morbi tempus iaculis urna id volutpat lacus laoreet non curabitur. Sed enim ut sem viverra. Tellus integer feugiat scelerisque varius morbi enim.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Aenean vel elit scelerisque mauris. Et ligula ullamcorper malesuada proin libero nunc. Mi sit amet mauris commodo quis imperdiet. Elit ullamcorper dignissim cras tincidunt lobortis feugiat. Erat velit scelerisque in dictum non consectetur a erat nam. Orci porta non pulvinar neque.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Eget gravida cum sociis natoque penatibus et. Malesuada pellentesque elit eget gravida cum. Curabitur vitae nunc sed velit dignissim sodales ut. Curabitur vitae nunc sed velit dignissim. Vel pretium lectus quam id leo in. Aliquet lectus proin nibh nisl condimentum id venenatis a.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Tristique senectus et netus et malesuada fames ac turpis. Semper risus in hendrerit gravida rutrum. Urna cursus eget nunc scelerisque viverra. Amet mauris commodo quis imperdiet massa. Erat nam at lectus urna duis convallis convallis tellus id.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-us-state-by-state",
                    name: "State by state",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "California",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Et tortor at risus viverra adipiscing at. Leo urna molestie at elementum eu facilisis sed. Adipiscing tristique risus nec feugiat in fermentum posuere urna.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Luctus venenatis lectus magna fringilla. Condimentum mattis pellentesque id nibh tortor id. Rhoncus aenean vel elit scelerisque mauris pellentesque.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Feugiat scelerisque varius morbi enim nunc. Amet consectetur adipiscing elit ut aliquam purus sit amet luctus. Orci a scelerisque purus semper eget duis at tellus at.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "New York",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Vitae sapien pellentesque habitant morbi tristique. Quisque id diam vel quam elementum pulvinar etiam non. Hendrerit gravida rutrum quisque non tellus orci.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Rhoncus dolor purus non enim praesent. Massa enim nec dui nunc mattis. Odio eu feugiat pretium nibh ipsum consequat. Bibendum enim facilisis gravida neque convallis a cras.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Cursus euismod quis viverra nibh. Facilisis mauris sit amet massa. Eget mauris pharetra et ultrices. Vitae turpis massa sed elementum tempus egestas sed. Semper viverra nam libero justo.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Washington",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Iaculis nunc sed augue lacus viverra. Sed libero enim sed faucibus turpis in. Massa tincidunt dui ut ornare. Adipiscing bibendum est ultricies integer quis auctor elit.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Aliquet nec ullamcorper sit amet risus nullam eget felis eget. Tortor dignissim convallis aenean et tortor at risus. Dolor sed viverra ipsum nunc.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "In cursus turpis massa tincidunt dui ut ornare. Lacus vestibulum sed arcu non odio euismod lacinia at. Mi ipsum faucibus vitae aliquet nec. Commodo sed egestas egestas fringilla phasellus faucibus scelerisque eleifend.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-us-hot-topics",
                    name: "Hot Topics",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Magna ac placerat vestibulum lectus mauris ultrices eros. Risus nullam eget felis eget nunc. Orci porta non pulvinar neque. Aliquam purus sit amet luctus venenatis lectus magna fringilla urna. In arcu cursus euismod quis viverra nibh.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Id venenatis a condimentum vitae sapien. Dui vivamus arcu felis bibendum ut tristique. Laoreet sit amet cursus sit amet dictum sit amet justo. Id semper risus in hendrerit gravida rutrum quisque non. Posuere sollicitudin aliquam ultrices sagittis orci a scelerisque.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Nulla porttitor massa id neque aliquam. Amet massa vitae tortor condimentum lacinia quis vel. Semper quis lectus nulla at volutpat diam ut venenatis. In nulla posuere sollicitudin aliquam ultrices.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Egestas congue quisque egestas diam in arcu cursus. Vitae tempus quam pellentesque nec nam aliquam. Proin nibh nisl condimentum id. Mattis ullamcorper velit sed ullamcorper morbi tincidunt. Egestas integer eget aliquet nibh praesent tristique.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-us-paid-content",
                    name: "Paid Content",
                    articles: [
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Mi tempus imperdiet nulla malesuada pellentesque elit eget gravida cum. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Sed cras ornare arcu dui vivamus arcu. Blandit aliquam etiam erat velit scelerisque in. Nisl rhoncus mattis rhoncus urna neque viverra.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Nunc sed id semper risus in hendrerit gravida rutrum. Ac felis donec et odio pellentesque diam volutpat commodo sed.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Semper quis lectus nulla at volutpat diam ut venenatis tellus. Felis eget nunc lobortis mattis aliquam faucibus purus in massa. Et malesuada fames ac turpis.",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        world: {
            name: "World",
            url: "/world",
            priority: 1,
            sections: [
                {
                    id: "content-world-global-trends",
                    name: "Global trends",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Africa",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Sed id semper risus in hendrerit gravida. Sagittis orci a scelerisque purus semper eget duis at tellus.",
                            type: "text",
                            content:
                                "Quam viverra orci sagittis eu volutpat odio facilisis mauris sit. Magna fringilla urna porttitor rhoncus dolor purus non enim praesent. Pellentesque sit amet porttitor eget dolor morbi non arcu risus. Dictum varius duis at consectetur. Ut porttitor leo a diam sollicitudin tempor id eu nisl.",
                        },
                        {
                            class: "columns-3-balanced",
                            header: "China",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Convallis aenean et tortor at risus. Pellentesque elit eget gravida cum sociis natoque penatibus.",
                            type: "text",
                            content:
                                "Auctor urna nunc id cursus metus aliquam. Amet commodo nulla facilisi nullam. Blandit massa enim nec dui nunc mattis enim ut. Et netus et malesuada fames ac turpis. Pellentesque habitant morbi tristique senectus et netus et malesuada. Habitant morbi tristique senectus et netus et malesuada fames ace.",
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Russia",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Pharetra magna ac placerat vestibulum lectus mauris ultrices eros.",
                            type: "list",
                            content: [
                                { content: "Luctus venenatis lectus magna fringilla urna porttitor rhoncus." },
                                { content: "Placerat orci nulla pellentesque dignissim enim sit amet venenatis." },
                                { content: "Pellentesque nec nam aliquam sem et." },
                                { content: "In hendrerit gravida rutrum quisque non tellus." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-world-around-the-world",
                    name: "Around the world",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Europe",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Porttitor massa id neque aliquam vestibulum. Semper auctor neque vitae tempus quam.",
                            type: "text",
                            content:
                                "Metus vulputate eu scelerisque felis imperdiet proin fermentum leo vel. Nisi scelerisque eu ultrices vitae auctor eu. Risus pretium quam vulputate dignissim suspendisse. Pulvinar neque laoreet suspendisse interdum. Mauris cursus mattis molestie a iaculis at erat.",
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Middle East",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Et molestie ac feugiat sed lectus vestibulum mattis.",
                            type: "text",
                            content:
                                "Suspendisse interdum consectetur libero id faucibus nisl tincidunt eget nullam. Cursus vitae congue mauris rhoncus aenean vel elit scelerisque mauris. Quam vulputate dignissim suspendisse in est ante in nibh mauris.",
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Asia",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Metus dictum at tempor commodo.",
                            type: "list",
                            content: [
                                { content: "Id faucibus nisl tincidunt eget nullam non nisi." },
                                { content: "Lectus quam id leo in vitae turpis massa." },
                                { content: "Urna nec tincidunt praesent semper feugiat nibh sed. Sed turpis tincidunt id aliquet risus." },
                                { content: "Eu ultrices vitae auctor eu augue ut lectus." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-world-latest-media",
                    name: "Latest Media",
                    articles: [
                        {
                            class: "columns-1",
                            type: "grid",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                            ],
                        },
                    ],
                },
                {
                    id: "content-world-today",
                    name: "Today",
                    articles: [
                        {
                            class: "columns-3-wide",
                            header: "Unrest",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone.", tag: "breaking" },
                            title: "Viverra aliquet eget sit amet. In fermentum posuere urna nec.",
                            type: "list",
                            content: [
                                { content: "Massa enim nec dui nunc mattis. Ornare lectus sit amet est placerat in." },
                                { content: "Morbi tristique senectus et netus et malesuada fames ac turpis." },
                                { content: "Fed vulputate mi sit amet mauris commodo quis imperdiet massa." },
                                { content: "In egestas erat imperdiet sed euismod nisi porta lorem mollis. Scelerisque eu ultrices vitae auctor eu augue ut lectus arcu." },
                            ],
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Happening now",
                            url: "#",
                            type: "preview",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Semper auctor neque vitae tempus quam pellentesque nec nam aliquam." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Viverra maecenas accumsan lacus vel facilisis volutpat." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Orci sagittis eu volutpat odio facilisis mauris sit." },
                            ],
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Noteworthy",
                            url: "#",
                            type: "preview",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Nunc aliquet bibendum enim facilisis gravida neque convallis a." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Ut diam quam nulla porttitor massa id neque aliquam vestibulum." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Magna fermentum iaculis eu non diam phasellus vestibulum lorem." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-world-featured",
                    name: "Featured",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "European Union",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Luctus venenatis lectus magna fringilla urna.",
                            type: "list",
                            content: [
                                { content: "Nulla facilisi cras fermentum odio eu. Porttitor lacus luctus accumsan tortor posuere ac ut." },
                                { content: "Phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Leo vel orci porta non. Sem nulla pharetra diam sit amet nisl." },
                                { content: "Justo donec enim diam vulputate ut pharetra sit amet aliquam. Eu consequat ac felis donec et." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Britain",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Orci a scelerisque purus semper eget duis.",
                            type: "text",
                            content: `Gravida rutrum quisque non tellus orci ac auctor augue mauris. Enim ut sem viverra aliquet eget. Sit amet volutpat consequat mauris nunc congue nisi vitae.

Praesent tristique magna sit amet purus gravida quis blandit turpis. Commodo odio aenean sed adipiscing diam donec adipiscing tristique risus. Quam quisque id diam vel quam elementum.`,
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Latin America",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Congue nisi vitae suscipit tellus.",
                            type: "list",
                            display: "bullets",
                            content: [
                                { content: "Ut venenatis tellus in metus vulputate.", url: "#" },
                                { content: "Vitae aliquet nec ullamcorper sit amet risus nullam.", url: "#" },
                                { content: "Ellus in hac habitasse platea dictumst.", url: "#" },
                                { content: "In nisl nisi scelerisque eu ultrices vitae.", url: "#" },
                                { content: "Est ullamcorper eget nulla facilisi etiam dignissim diam quis enim.", url: "#" },
                                { content: "It volutpat diam ut venenatis tellus.", url: "#" },
                            ],
                        },
                    ],
                },
                {
                    id: "content-world-international",
                    name: "International",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "United Nations",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Morbi quis commodo odio aenean sed adipiscing diam. Congue mauris rhoncus aenean vel elit scelerisque mauris pellentesque. Justo nec ultrices dui sapien.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Nibh nisl condimentum id venenatis a condimentum. Id diam maecenas ultricies mi eget mauris pharetra et ultrices. Faucibus turpis in eu mi bibendum neque egestas. Et malesuada fames ac turpis egestas sed tempus urna et.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Ut etiam sit amet nisl purus in mollis nunc sed. Pellentesque adipiscing commodo elit at imperdiet dui. Ac tortor vitae purus faucibus ornare suspendisse sed nisi lacus. Enim facilisis gravida neque convallis.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "European Union",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Donec massa sapien faucibus et molestie. Fermentum iaculis eu non diam. Donec pretium vulputate sapien nec sagittis. Placerat duis ultricies lacus sed. Pretium lectus quam id leo in vitae turpis massa.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Luctus accumsan tortor posuere ac ut. Convallis posuere morbi leo urna molestie at elementum. Nisi est sit amet facilisis magna etiam tempor orci eu.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Purus in massa tempor nec feugiat nisl pretium fusce. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl vel. Vestibulum sed arcu non odio euismod lacinia at quis.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Global Crisis",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "ristique senectus et netus et malesuada. Orci phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Varius quam quisque id diam vel quam elementum pulvinar. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Cras ornare arcu dui vivamus arcu felis bibendum ut. Volutpat blandit aliquam etiam erat velit scelerisque in dictum. Pharetra magna ac placerat vestibulum lectus.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Leo integer malesuada nunc vel. Porttitor lacus luctus accumsan tortor posuere ac ut consequat. Ultrices eros in cursus turpis massa tincidunt dui ut. Eleifend mi in nulla posuere sollicitudin.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-world-global-impact",
                    name: "Global Impact",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Weather",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Euismod elementum nisi quis eleifend.",
                            type: "list",
                            content: [
                                { content: "Enim tortor at auctor urna nunc id cursus metus. Nisi est sit amet facilisis magna etiam." },
                                { content: "Neque volutpat ac tincidunt vitae. Metus aliquam eleifend mi in." },
                                { content: "Aliquam malesuada bibendum arcu vitae elementum curabitur vitae." },
                                { content: "Turpis cursus in hac habitasse platea dictumst." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Business",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Nunc mi ipsum faucibus vitae aliquet nec ullamcorper.",
                            type: "list",
                            content: [
                                { content: "Eget nulla facilisi etiam dignissim diam quis enim." },
                                { content: "Risus viverra adipiscing at in tellus integer feugiat scelerisque." },
                                { content: "Cursus turpis massa tincidunt dui." },
                                { content: "Nascetur ridiculus mus mauris vitae ultricies leo integer." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Politics",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Vulputate sapien nec sagittis aliquam malesuada.",
                            type: "list",
                            content: [
                                { content: "Nisi scelerisque eu ultrices vitae auctor." },
                                { content: "Urna porttitor rhoncus dolor purus non enim praesent elementum." },
                                { content: "Ac turpis egestas integer eget aliquet." },
                                { content: "Nisl tincidunt eget nullam non nisi est." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-world-underscored",
                    name: "Underscored",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Risus sed vulputate odio ut enim blandit volutpat. Tempus egestas sed sed risus pretium quam vulputate. Ultrices mi tempus imperdiet nulla malesuada. Pellentesque diam volutpat commodo sed egestas. Scelerisque eleifend donec pretium vulputate sapien nec sagittis aliquam.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Nunc mi ipsum faucibus vitae aliquet nec. Felis eget nunc lobortis mattis aliquam faucibus. Amet est placerat in egestas. Vitae proin sagittis nisl rhoncus mattis rhoncus. Mauris in aliquam sem fringilla ut. Pellentesque habitant morbi tristique senectus et netus et.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Egestas diam in arcu cursus euismod quis viverra nibh cras. Scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis. Sed ullamcorper morbi tincidunt ornare massa eget egestas purus viverra. Risus in hendrerit gravida rutrum.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Integer malesuada nunc vel risus commodo viverra maecenas accumsan. Nec feugiat nisl pretium fusce id. Vel fringilla est ullamcorper eget nulla facilisi etiam dignissim diam. At tempor commodo ullamcorper a lacus vestibulum sed arcu. Suspendisse faucibus interdum posuere lorem ipsum dolor.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-world-global-issues",
                    name: "Global Issues",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "Rising Crime",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Phasellus faucibus scelerisque eleifend donec pretium. Tellus molestie nunc non blandit. Sed sed risus pretium quam vulputate dignissim suspendisse.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "In vitae turpis massa sed. In hac habitasse platea dictumst vestibulum rhoncus est pellentesque elit. Egestas pretium aenean pharetra magna ac placerat vestibulum.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Morbi tempus iaculis urna id volutpat lacus laoreet non. Dignissim convallis aenean et tortor at risus viverra adipiscing at. Nibh tortor id aliquet lectus proin nibh nisl.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Health concerns",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Id diam maecenas ultricies mi eget mauris pharetra. Aliquam sem fringilla ut morbi tincidunt augue interdum. Accumsan sit amet nulla facilisi morbi tempus iaculis.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "In fermentum posuere urna nec tincidunt praesent semper feugiat nibh. Dolor sit amet consectetur adipiscing elit pellentesque habitant. Eget dolor morbi non arcu risus quis varius quam quisque.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Commodo sed egestas egestas fringilla phasellus faucibus. Lectus urna duis convallis convallis. Sit amet tellus cras adipiscing enim eu turpis egestas.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Economy",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Ante in nibh mauris cursus mattis molestie. Vestibulum sed arcu non odio euismod lacinia at quis. Consequat semper viverra nam libero justo laoreet.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Nunc non blandit massa enim nec dui nunc. Lobortis feugiat vivamus at augue eget arcu. Tempor commodo ullamcorper a lacus. Malesuada bibendum arcu vitae elementum curabitur vitae.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "In nulla posuere sollicitudin aliquam ultrices sagittis orci a. Sem fringilla ut morbi tincidunt augue interdum. Arcu felis bibendum ut tristique et egestas. Praesent elementum facilisis leo vel fringilla est ullamcorper.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-world-hot-topics",
                    name: "Hot Topics",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Leo vel fringilla est ullamcorper eget nulla facilisi etiam dignissim. Aliquam nulla facilisi cras fermentum odio. In est ante in nibh. Vulputate ut pharetra sit amet aliquam. Vitae congue eu consequat ac felis. Semper auctor neque vitae tempus quam pellentesque nec nam aliquam.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Vitae sapien pellentesque habitant morbi tristique senectus. Faucibus interdum posuere lorem ipsum dolor sit. Urna id volutpat lacus laoreet non curabitur. Tristique et egestas quis ipsum suspendisse ultrices gravida dictum.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Donec ultrices tincidunt arcu non sodales neque sodales ut. Consequat mauris nunc congue nisi vitae suscipit tellus mauris. Dictum sit amet justo donec enim diam vulputate. Ultrices vitae auctor eu augue ut lectus arcu bibendum at.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et. Adipiscing at in tellus integer feugiat scelerisque varius. Faucibus ornare suspendisse sed nisi lacus sed viverra tellus in. Eget velit aliquet sagittis id consectetur purus ut faucibus pulvinar.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-world-paid-content",
                    name: "Paid Content",
                    articles: [
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [{ image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Et sollicitudin ac orci phasellus. Massa placerat duis ultricies lacus sed turpis tincidunt id." }],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Neque volutpat ac tincidunt vitae semper. Nunc pulvinar sapien et ligula. Quam pellentesque nec nam aliquam sem et tortor consequat.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Velit euismod in pellentesque massa placerat duis ultricies. Nulla aliquet enim tortor at auctor. Vitae et leo duis ut diam quam nulla porttitor massa.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Eros in cursus turpis massa tincidunt dui ut ornare lectus. Pulvinar neque laoreet suspendisse interdum consectetur libero id faucibus nisl.",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        politics: {
            name: "Politics",
            url: "/politics",
            priority: 1,
            sections: [
                {
                    id: "content-politics-what-really-matters",
                    name: "What Really Matters",
                    articles: [
                        {
                            class: "columns-1",
                            type: "grid",
                            display: "grid-wrap",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Libero justo laoreet sit amet. Et egestas quis ipsum suspendisse ultrices gravida dictum fusce. Eget aliquet nibh praesent tristique magna. Turpis cursus in hac habitasse platea dictumst quisque sagittis purus.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Arcu cursus euismod quis viverra nibh. Cras ornare arcu dui vivamus arcu. At lectus urna duis convallis convallis tellus id.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Urna et pharetra pharetra massa massa ultricies mi quis hendrerit. Risus sed vulputate odio ut enim blandit volutpat maecenas volutpat. Quis ipsum suspendisse ultrices gravida dictum fusce ut.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Velit aliquet sagittis id consectetur purus ut faucibus. Tellus mauris a diam maecenas sed. Urna neque viverra justo nec. Odio eu feugiat pretium nibh ipsum.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Amet nulla facilisi morbi tempus iaculis urna id. Scelerisque eleifend donec pretium vulputate sapien nec sagittis. Id leo in vitae turpis massa.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-politics-today",
                    name: "Today",
                    articles: [
                        {
                            class: "columns-3-wide",
                            header: "Campaign News",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone.", tag: "breaking" },
                            title: "Adipiscing at in tellus integer feugiat scelerisque varius morbi enim.",
                            type: "list",
                            content: [
                                { content: "Sem fringilla ut morbi tincidunt augue interdum velit euismod." },
                                { content: "Quisque sagittis purus sit amet. Ornare lectus sit amet est." },
                                { content: "Placerat orci nulla pellentesque dignissim enim sit amet." },
                                { content: "In fermentum et sollicitudin ac orci phasellus egestas tellus." },
                            ],
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Elections",
                            url: "#",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Nunc aliquet bibendum enim facilisis gravida neque. Nec feugiat in fermentum posuere urna. Molestie at elementum eu facilisis sed odio morbi. Scelerisque purus semper eget duis at tellus.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Eget dolor morbi non arcu risus quis. Non curabitur gravida arcu ac tortor dignissim." },
                            ],
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Local Government",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Nunc vel risus commodo viverra maecenas accumsan lacus.",
                            type: "list",
                            content: [
                                { content: "Molestie at elementum eu facilisis sed odio morbi." },
                                { content: "Sit amet nisl suscipit adipiscing bibendum est ultricies integer quis." },
                                { content: "Bibendum neque egestas congue quisque egestas diam in arcu." },
                                { content: "Tellus molestie nunc non blandit massa enim nec." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-politics-latest-headlines",
                    name: "Latest Headlines",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Analysis",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Pellentesque pulvinar pellentesque habitant morbi tristique senectus et netus et.",
                            type: "list",
                            content: [
                                { content: "Arcu vitae elementum curabitur vitae nunc sed velit." },
                                { content: "Ornare suspendisse sed nisi lacus sed viverra tellus in." },
                                { content: "Vel fringilla est ullamcorper eget nulla." },
                                { content: "Risus commodo viverra maecenas accumsan lacus vel facilisis volutpat est." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Facts First",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "At varius vel pharetra vel turpis nunc eget lorem dolor.",
                            type: "list",
                            content: [
                                { content: "Consectetur purus ut faucibus pulvinar elementum integer enim." },
                                { content: "Purus semper eget duis at. Tincidunt ornare massa eget egestas purus viverra accumsan." },
                                { content: "Amet massa vitae tortor condimentum lacinia quis vel." },
                                { content: "Tristique senectus et netus et malesuada." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "More Politics News",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Vitae auctor eu augue ut lectus arcu bibendum at varius.",
                            type: "text",
                            content: `Pharetra diam sit amet nisl suscipit adipiscing bibendum est. Id aliquet lectus proin nibh. Porta lorem mollis aliquam ut porttitor leo a. Congue eu consequat ac felis donec et odio pellentesque.

Mi ipsum faucibus vitae aliquet nec ullamcorper. Sapien nec sagittis aliquam malesuada bibendum arcu vitae elementum curabitur. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper.`,
                        },
                    ],
                },
                {
                    id: "content-politics-latest-media",
                    name: "Latest Media",
                    articles: [
                        {
                            class: "columns-1",
                            type: "grid",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                            ],
                        },
                    ],
                },
                {
                    id: "content-politics-election",
                    name: "Election",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "Democrats",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Est ullamcorper eget nulla facilisi etiam dignissim. Est pellentesque elit ullamcorper dignissim cras. Velit euismod in pellentesque massa placerat duis ultricies.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Vitae suscipit tellus mauris a diam maecenas sed enim. Aenean sed adipiscing diam donec. Laoreet suspendisse interdum consectetur libero id faucibus nisl tincidunt.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Mattis enim ut tellus elementum sagittis vitae et. Massa sapien faucibus et molestie." },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Republicans",
                            type: "excerpt",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Platea dictumst quisque sagittis purus sit amet volutpat. Ante in nibh mauris cursus mattis molestie a iaculis." },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Quis hendrerit dolor magna eget est. Pellentesque pulvinar pellentesque habitant morbi tristique. Adipiscing commodo elit at imperdiet dui.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Donec pretium vulputate sapien nec sagittis aliquam. Cras adipiscing enim eu turpis egestas pretium aenean." },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Liberals",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Cursus sit amet dictum sit amet justo donec enim. Tempor id eu nisl nunc. Amet cursus sit amet dictum sit amet justo donec.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Enim diam vulputate ut pharetra sit amet aliquam. Tristique senectus et netus et malesuada." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Eu turpis egestas pretium aenean. Auctor elit sed vulputate mi sit amet. In nibh mauris cursus mattis molestie." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-politics-more-political-news",
                    name: "More political News",
                    articles: [
                        {
                            class: "columns-3-wide",
                            header: "More News",
                            url: "#",
                            type: "list",
                            content: [
                                { content: "Eros donec ac odio tempor. Tortor pretium viverra suspendisse potenti nullam." },
                                { content: "Ut venenatis tellus in metus vulputate eu scelerisque." },
                                { content: "Id diam maecenas ultricies mi eget. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper sit." },
                                { content: "Consectetur lorem donec massa sapien. Sed cras ornare arcu dui vivamus arcu felis." },
                                { content: "Fames ac turpis egestas maecenas pharetra convallis posuere morbi." },
                                { content: "Consequat nisl vel pretium lectus quam id." },
                                { content: "Tincidunt ornare massa eget egestas purus viverra accumsan in nisl." },
                                { content: "Sed euismod nisi porta lorem mollis aliquam ut." },
                                { content: "Suspendisse sed nisi lacus sed viverra tellus in hac." },
                                { content: "Aliquet risus feugiat in ante metus dictum at tempor." },
                                { content: "Velit aliquet sagittis id consectetur purus ut faucibus." },
                                { content: "Libero volutpat sed cras ornare. Consectetur adipiscing elit duis tristique sollicitudin nibh sit amet." },
                                { content: "Nibh nisl condimentum id venenatis a condimentum vitae. Fames ac turpis egestas maecenas pharetra." },
                                { content: "Massa sapien faucibus et molestie. Ac turpis egestas maecenas pharetra convallis posuere morbi leo urna." },
                                { content: "Est pellentesque elit ullamcorper dignissim cras. Mi proin sed libero enim sed." },
                            ],
                        },
                        {
                            class: "columns-3-narrow",
                            url: "#",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Nunc aliquet bibendum enim facilisis gravida neque. Nec feugiat in fermentum posuere urna. Molestie at elementum eu facilisis sed odio morbi. Scelerisque purus semper eget duis at tellus.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Eget dolor morbi non arcu risus quis. Non curabitur gravida arcu ac tortor dignissim." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Eget dolor morbi non arcu risus quis. Non curabitur gravida arcu ac tortor dignissim." },
                            ],
                        },
                        {
                            class: "columns-3-narrow",
                            url: "#",
                            type: "preview",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Tellus in metus vulputate eu scelerisque felis imperdiet proin fermentum." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Adipiscing tristique risus nec feugiat in fermentum posuere vulputate eu scelerisque." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Potenti nullam ac tortor vitae purus. Adipiscing diam donec adipiscing tristique risus nec feugiat in fermentum." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-politics-underscored",
                    name: "Underscored",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Ut aliquam purus sit amet luctus venenatis lectus magna fringilla. Urna neque viverra justo nec ultrices dui sapien. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Risus viverra adipiscing at in tellus integer feugiat scelerisque. Pretium nibh ipsum consequat nisl vel.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Nunc id cursus metus aliquam eleifend. Sit amet est placerat in egestas erat. Vitae tortor condimentum lacinia quis vel eros donec ac. Maecenas pharetra convallis posuere morbi leo urna molestie at. Lectus proin nibh nisl condimentum id venenatis. Ut enim blandit volutpat maecenas volutpat blandit.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Vestibulum sed arcu non odio euismod lacinia. Ipsum dolor sit amet consectetur. Nisi scelerisque eu ultrices vitae. Eu consequat ac felis donec. Viverra orci sagittis eu volutpat odio facilisis mauris sit amet. Purus semper eget duis at tellus at urna. Nulla aliquet porttitor lacus luctus accumsan tortor posuere ac.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Elementum eu facilisis sed odio morbi. Scelerisque viverra mauris in aliquam sem fringilla ut. Enim ut sem viverra aliquet. Massa sed elementum tempus egestas. Nam at lectus urna duis convallis convallis tellus. Sem integer vitae justo eget magna. In mollis nunc sed id.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-politics-trending",
                    name: "Trending",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "New Legislations",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Consequat ac felis donec et. Libero nunc consequat interdum varius sit amet mattis vulputate enim. Cursus euismod quis viverra nibh cras pulvinar mattis nunc. Nisi lacus sed viverra tellus in hac. Aliquam malesuada bibendum arcu vitae elementum curabitur.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Neque gravida in fermentum et sollicitudin ac orci. Pretium aenean pharetra magna ac placerat vestibulum lectus mauris ultrices. Fermentum leo vel orci porta non pulvinar neque laoreet.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Egestas diam in arcu cursus. Aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices sagittis. Augue ut lectus arcu bibendum at varius vel pharetra.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Latest Polls",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Aliquam eleifend mi in nulla posuere sollicitudin. Tempor nec feugiat nisl pretium fusce. Fermentum iaculis eu non diam phasellus vestibulum lorem. Scelerisque eleifend donec pretium vulputate sapien nec. Sit amet aliquam id diam maecenas ultricies mi.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Morbi leo urna molestie at elementum eu. Phasellus vestibulum lorem sed risus. Aliquet bibendum enim facilisis gravida neque. Aliquam sem et tortor consequat id porta. Interdum varius sit amet mattis vulputate enim nulla aliquet. Enim nulla aliquet porttitor lacus luctus accumsan tortor.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Molestie nunc non blandit massa. Adipiscing diam donec adipiscing tristique risus nec feugiat in. Odio morbi quis commodo odio aenean sed adipiscing diam donec. Felis eget velit aliquet sagittis id consectetur purus ut. Odio ut enim blandit volutpat maecenas.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Who's gaining votes",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Risus viverra adipiscing at in tellus integer feugiat scelerisque. Porttitor eget dolor morbi non arcu risus quis varius quam. Consectetur adipiscing elit ut aliquam purus sit. Pulvinar mattis nunc sed blandit.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Non curabitur gravida arcu ac tortor dignissim. Purus in mollis nunc sed id semper risus in hendrerit. Vestibulum morbi blandit cursus risus. Pellentesque nec nam aliquam sem et tortor. Ac tortor dignissim convallis aenean et.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Ullamcorper a lacus vestibulum sed arcu non. Pharetra sit amet aliquam id diam. Viverra vitae congue eu consequat ac felis donec. Amet massa vitae tortor condimentum lacinia quis vel eros.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-politics-around-the-world",
                    name: "Around the World",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Britain",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Sed blandit libero volutpat sed cras ornare arcu dui. Id ornare arcu odio ut sem.",
                            type: "list",
                            content: [
                                { content: "Dolor sed viverra ipsum nunc aliquet bibendum enim. Hendrerit dolor magna eget est lorem ipsum dolor." },
                                { content: "At elementum eu facilisis sed odio morbi quis commodo odio. In massa tempor nec feugiat nisl." },
                                { content: "Est sit amet facilisis magna etiam tempor orci eu. Vulputate dignissim suspendisse in est ante in." },
                                { content: "Tempor nec feugiat nisl pretium. Id velit ut tortor pretium viverra suspendisse potenti nullam." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Italy",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Vitae congue mauris rhoncus aenean vel elit.",
                            type: "list",
                            content: [
                                { content: "Aliquam sem fringilla ut morbi tincidunt augue interdum. Enim eu turpis egestas pretium aenean pharetra magna ac." },
                                { content: "Amet porttitor eget dolor morbi non arcu risus quis varius. Ultricies tristique nulla aliquet enim tortor at auctor." },
                                { content: "Nisi lacus sed viverra tellus in hac habitasse platea. Interdum velit euismod in pellentesque." },
                                { content: "Mattis ullamcorper velit sed ullamcorper morbi tincidunt ornare. Eu non diam phasellus vestibulum lorem sed risus." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Poland",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Sed id semper risus in hendrerit gravida rutrum quisque.",
                            type: "list",
                            content: [
                                { content: "Viverra justo nec ultrices dui sapien eget. A scelerisque purus semper eget duis at tellus at." },
                                { content: "Non diam phasellus vestibulum lorem sed risus ultricies tristique. Ornare arcu dui vivamus arcu felis bibendum ut tristique et." },
                                { content: "Quisque non tellus orci ac. At augue eget arcu dictum varius." },
                                { content: "Aenean sed adipiscing diam donec adipiscing tristique. Sagittis eu volutpat odio facilisis mauris." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-politics-hot-topics",
                    name: "Hot Topics",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Suspendisse sed nisi lacus sed viverra tellus in hac habitasse. Tincidunt id aliquet risus feugiat in. Eget aliquet nibh praesent tristique magna sit amet. Enim lobortis scelerisque fermentum dui faucibus. Molestie ac feugiat sed lectus. Facilisis sed odio morbi quis commodo.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Vitae ultricies leo integer malesuada nunc. Convallis aenean et tortor at risus viverra adipiscing at. Vitae sapien pellentesque habitant morbi tristique senectus. Pellentesque nec nam aliquam sem et tortor consequat id. Fames ac turpis egestas integer.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in. Euismod quis viverra nibh cras. Non sodales neque sodales ut etiam sit. Curabitur vitae nunc sed velit dignissim sodales ut eu. Id leo in vitae turpis massa sed elementum tempus egestas.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Morbi tristique senectus et netus et malesuada fames. Placerat duis ultricies lacus sed turpis tincidunt id aliquet. Habitant morbi tristique senectus et netus et. Laoreet sit amet cursus sit amet dictum sit. Pellentesque elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-politics-paid-content",
                    name: "Paid Content",
                    articles: [
                        { class: "columns-4-balanced", type: "preview", content: [{ image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Duis at consectetur lorem donec massa." }] },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [{ image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Eget mi proin sed libero enim sed. Proin libero nunc consequat interdum varius." }],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [{ image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Porta nibh venenatis cras sed felisDolor sit amet consectetur adipiscing elit ut aliquam purus sit." }],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Nisl vel pretium lectus quam id leo in vitae. Ultrices neque ornare aenean euismod elementum nisi quis eleifend quam. Eget nullam non nisi est sit. Aliquet enim tortor at auctor urna.",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        business: {
            name: "Business",
            url: "/business",
            priority: 1,
            sections: [
                {
                    id: "content-business-latest-trends",
                    name: "Latest trends",
                    articles: [
                        {
                            class: "columns-3-wide",
                            header: "Investing",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone.", tag: "breaking" },
                            title: "Enim lobortis scelerisque fermentum dui faucibus in ornare. Ante metus dictum at tempor.",
                            type: "text",
                            content: `Consequat mauris nunc congue nisi vitae. Felis imperdiet proin fermentum leo vel orci porta. Facilisis gravida neque convallis a cras semper. Risus quis varius quam quisque id diam vel quam. Egestas quis ipsum suspendisse ultrices gravida. Nisl nisi scelerisque eu ultrices vitae auctor.

Viverra vitae congue eu consequat ac felis. Vestibulum rhoncus est pellentesque elit ullamcorper. Donec massa sapien faucibus et. Vehicula ipsum a arcu cursus vitae congue mauris rhoncus. Quis ipsum suspendisse ultrices gravida. Vel facilisis volutpat est velit egestas dui id ornare arcu. Commodo ullamcorper a lacus vestibulum.`,
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Media",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Gravida in fermentum et sollicitudin ac. Varius duis at consectetur lorem donec massa sapien faucibus.",
                            type: "text",
                            content:
                                "Nisi quis eleifend quam adipiscing vitae proin. Nunc sed velit dignissim sodales ut. Turpis nunc eget lorem dolor sed. Enim nulla aliquet porttitor lacus. Consequat ac felis donec et. Aliquam sem fringilla ut morbi tincidunt augue interdum velit. Arcu vitae elementum curabitur vitae nunc sed velit dignissim.",
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Insights",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Venenatis urna cursus eget nunc. Adipiscing elit duis tristique sollicitudin.",
                            type: "text",
                            content: `Donec adipiscing tristique risus nec. Vel fringilla est ullamcorper eget nulla facilisi etiam dignissim. Vitae et leo duis ut diam quam. Pulvinar etiam non quam lacus suspendisse faucibus interdum posuere lorem.

Ac odio tempor orci dapibus ultrices in iaculis nunc. A diam maecenas sed enim ut sem. At quis risus sed vulputate.`,
                        },
                    ],
                },
                {
                    id: "content-business-market-watch",
                    name: "Market Watch",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Trending",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Dictumst quisque sagittis purus sit amet.",
                            type: "text",
                            content:
                                "Dolor magna eget est lorem. Nibh sit amet commodo nulla facilisi nullam. Etiam non quam lacus suspendisse faucibus interdum. Posuere sollicitudin aliquam ultrices sagittis orci. Massa enim nec dui nunc mattis enim ut tellus. Congue mauris rhoncus aenean vel. Egestas integer eget aliquet nibh praesent tristique.",
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Tech",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Posuere sollicitudin aliquam ultrices sagittis orci a.",
                            type: "text",
                            content:
                                "Praesent elementum facilisis leo vel fringilla est ullamcorper. Scelerisque viverra mauris in aliquam sem fringilla. Donec ac odio tempor orci. Eu augue ut lectus arcu. Diam sollicitudin tempor id eu nisl nunc mi ipsum.",
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Success",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Scelerisque fermentum dui faucibus in.",
                            type: "text",
                            content:
                                "landit volutpat maecenas volutpat blandit. Pulvinar pellentesque habitant morbi tristique senectus et. Facilisis magna etiam tempor orci. Sit amet commodo nulla facilisi nullam vehicula. Tortor vitae purus faucibus ornare suspendisse sed nisi lacus sed. Mus mauris vitae ultricies leo.",
                        },
                    ],
                },
                {
                    id: "content-business-economy-today",
                    name: "Economy Today",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "Global Impact",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Bibendum arcu vitae elementum curabitur vitae nunc sed. Ipsum faucibus vitae aliquet nec ullamcorper sit. Blandit libero volutpat sed cras ornare arcu dui. Maecenas sed enim ut sem viverra aliquet.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Arcu risus quis varius quam quisque id diam vel quam. Sed risus pretium quam vulputate dignissim suspendisse in. Amet aliquam id diam maecenas ultricies mi. Egestas dui id ornare arcu odio.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "At risus viverra adipiscing at in tellus. Morbi tempus iaculis urna id volutpat lacus laoreet non. Eu volutpat odio facilisis mauris sit amet. Leo urna molestie at elementum eu facilisis sed.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Outlook",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Ut etiam sit amet nisl purus in mollis nunc sed. Eget mauris pharetra et ultrices neque ornare aenean. Magna sit amet purus gravida quis blandit turpis.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Eu nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Viverra aliquet eget sit amet tellus cras. Consequat id porta nibh venenatis. Ac felis donec et odio pellentesque diam volutpat commodo sed.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Montes nascetur ridiculus mus mauris vitae ultricies leo integer. Habitasse platea dictumst vestibulum rhoncus est pellentesque elit.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Financial Freedom",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Bibendum arcu vitae elementum curabitur vitae nunc sed. Facilisis mauris sit amet massa vitae tortor condimentum lacinia.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Ipsum nunc aliquet bibendum enim facilisis gravida neque convallis. At in tellus integer feugiat scelerisque varius morbi enim. Nisi vitae suscipit tellus mauris a.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Diam sollicitudin tempor id eu nisl nunc mi ipsum faucibus. In pellentesque massa placerat duis ultricies lacus sed.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-business-must-read",
                    name: "Must Read",
                    articles: [
                        {
                            class: "columns-1",
                            type: "grid",
                            display: "grid-wrap",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Scelerisque viverra mauris in aliquam sem fringilla ut morbi. Senectus et netus et malesuada fames ac turpis egestas. Et tortor at risus viverra. Iaculis nunc sed augue lacus viverra vitae congue. Nulla aliquet porttitor lacus luctus accumsan.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Vitae justo eget magna fermentum. Vel eros donec ac odio tempor orci dapibus. Volutpat est velit egestas dui id ornare arcu odio. Est sit amet facilisis magna. Bibendum est ultricies integer quis auctor elit. Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Nisl tincidunt eget nullam non nisi est sit. At consectetur lorem donec massa sapien faucibus et molestie ac. Semper risus in hendrerit gravida rutrum. Eget aliquet nibh praesent tristique magna sit. Mi quis hendrerit dolor magna eget.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Pulvinar proin gravida hendrerit lectus a. At volutpat diam ut venenatis tellus in metus vulputate eu. Maecenas accumsan lacus vel facilisis volutpat. Enim eu turpis egestas pretium aenean pharetra magna. Orci eu lobortis elementum nibh tellus molestie nunc.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-business-educational",
                    name: "Educational",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Business 101",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Dictumst quisque sagittis purus sit amet.",
                            type: "text",
                            content: `incidunt dui ut ornare lectus sit. Quis varius quam quisque id diam. Adipiscing diam donec adipiscing tristique risus nec feugiat in. Cursus sit amet dictum sit. Lacinia quis vel eros donec ac odio. Accumsan tortor posuere ac ut consequat semper. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing. Integer malesuada nunc vel risus commodo viverra. Arcu risus quis varius quam quisque id diam vel quam.

Enim neque volutpat ac tincidunt vitae semper quis lectus nulla. Eget nulla facilisi etiam dignissim diam quis enim lobortis scelerisque. Sed tempus urna et pharetra pharetra massa.`,
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Startup",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Posuere sollicitudin aliquam ultrices sagittis orci a.",
                            type: "text",
                            content: `Potenti nullam ac tortor vitae purus faucibus. Vulputate mi sit amet mauris. Elit pellentesque habitant morbi tristique senectus. In pellentesque massa placerat duis ultricies. Cras fermentum odio eu feugiat pretium nibh ipsum. Ornare quam viverra orci sagittis eu. Commodo sed egestas egestas fringilla phasellus faucibus scelerisque eleifend. Non diam phasellus vestibulum lorem sed risus. Metus vulputate eu scelerisque felis imperdiet.

Magna ac placerat vestibulum lectus mauris. Lobortis feugiat vivamus at augue eget. Facilisis volutpat est velit egestas dui id ornare arcu odio.`,
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Make profit",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Scelerisque fermentum dui faucibus in.",
                            type: "text",
                            content: `Ornare aenean euismod elementum nisi quis. Tellus in hac habitasse platea dictumst vestibulum rhoncus est. Nisl nunc mi ipsum faucibus vitae aliquet nec. Eget egestas purus viverra accumsan in nisl nisi scelerisque. Urna duis convallis convallis tellus id interdum velit laoreet. Ultrices sagittis orci a scelerisque purus. Feugiat vivamus at augue eget. Ultricies tristique nulla aliquet enim. Nibh mauris cursus mattis molestie a iaculis at erat pellentesque.

Elementum eu facilisis sed odio morbi. Ac turpis egestas integer eget aliquet nibh praesent tristique magna. Tortor at risus viverra adipiscing at in tellus.`,
                        },
                    ],
                },
                {
                    id: "content-business-underscored",
                    name: "Underscored",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Scelerisque viverra mauris in aliquam sem fringilla ut morbi. Senectus et netus et malesuada fames ac turpis egestas. Et tortor at risus viverra. Iaculis nunc sed augue lacus viverra vitae congue. Nulla aliquet porttitor lacus luctus accumsan.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Vitae justo eget magna fermentum. Vel eros donec ac odio tempor orci dapibus. Volutpat est velit egestas dui id ornare arcu odio. Est sit amet facilisis magna. Bibendum est ultricies integer quis auctor elit. Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Scelerisque viverra mauris in aliquam sem fringilla ut morbi. Senectus et netus et malesuada fames ac turpis egestas. Et tortor at risus viverra. Iaculis nunc sed augue lacus viverra vitae congue. Nulla aliquet porttitor lacus luctus accumsan.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Vitae justo eget magna fermentum. Vel eros donec ac odio tempor orci dapibus. Volutpat est velit egestas dui id ornare arcu odio. Est sit amet facilisis magna. Bibendum est ultricies integer quis auctor elit. Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-business-investing-101",
                    name: "Investing 101",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Manage your assets",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Ic turpis egestas maecenas pharetra convallis. Dui accumsan sit amet nulla facilisi morbi tempus.",
                                    content:
                                        "A scelerisque purus semper eget duis at. Condimentum lacinia quis vel eros donec ac odio. Pretium fusce id velit ut tortor pretium viverra suspendisse. Blandit aliquam etiam erat velit scelerisque in. Est placerat in egestas erat imperdiet sed euismod nisi. Suspendisse potenti nullam ac tortor vitae purus faucibus.",
                                },
                                {
                                    title: "Risus commodo viverra maecenas accumsan lacus vel.",
                                    content:
                                        "Est ullamcorper eget nulla facilisi etiam dignissim diam quis enim. Iaculis eu non diam phasellus. Odio aenean sed adipiscing diam donec. Eleifend donec pretium vulputate sapien nec sagittis aliquam malesuada bibendum.",
                                },
                                {
                                    title: "Vitae ultricies leo integer malesuada nunc vel risus commodo.",
                                    content:
                                        "Donec et odio pellentesque diam volutpat. Sed libero enim sed faucibus turpis in eu. Aliquam nulla facilisi cras fermentum odio eu feugiat pretium. Tristique risus nec feugiat in fermentum. Turpis egestas maecenas pharetra convallis posuere morbi leo urna.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "What to watch",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Elementum integer enim neque volutpat.",
                                    content:
                                        "Dignissim diam quis enim lobortis scelerisque. Lacus vestibulum sed arcu non odio euismod lacinia at quis. Mi bibendum neque egestas congue quisque. Arcu dui vivamus arcu felis bibendum ut tristique. Consectetur adipiscing elit ut aliquam purus sit amet luctus venenatis.",
                                },
                                {
                                    title: "Vitae turpis massa sed elementum tempus egestas sed.",
                                    content:
                                        "Eu lobortis elementum nibh tellus molestie. Egestas congue quisque egestas diam in arcu cursus euismod quis. Purus non enim praesent elementum facilisis. Suscipit tellus mauris a diam maecenas sed enim ut sem. Sed elementum tempus egestas sed sed risus pretium quam.",
                                },
                                {
                                    title: "Consequat ac felis donec et odio pellentesque diam.",
                                    content:
                                        "Pharetra diam sit amet nisl suscipit adipiscing bibendum. Mi eget mauris pharetra et ultrices neque ornare. Habitant morbi tristique senectus et netus et. Quis eleifend quam adipiscing vitae. Fames ac turpis egestas maecenas pharetra convallis posuere morbi.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Did you know?",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Lacus sed viverra tellus in. Eget mi proin sed libero enim sed.",
                                    content:
                                        "A diam maecenas sed enim. Platea dictumst vestibulum rhoncus est pellentesque elit. Metus dictum at tempor commodo ullamcorper. Est ullamcorper eget nulla facilisi etiam dignissim diam. Felis eget velit aliquet sagittis id consectetur purus.",
                                },
                                {
                                    title: "Est lorem ipsum dolor sit amet. Duis ultricies lacus sed turpis tincidunt.",
                                    content:
                                        "Mattis pellentesque id nibh tortor id aliquet lectus. Odio aenean sed adipiscing diam donec adipiscing. Mi in nulla posuere sollicitudin aliquam ultrices sagittis. Dictum varius duis at consectetur lorem donec massa sapien faucibus.",
                                },
                                {
                                    title: "Duis ut diam quam nulla porttitor massa id.",
                                    content:
                                        "Id aliquet lectus proin nibh nisl condimentum id venenatis. Ultrices in iaculis nunc sed augue lacus viverra vitae congue. Lectus urna duis convallis convallis tellus id interdum velit. Duis convallis convallis tellus id interdum. Et malesuada fames ac turpis egestas sed.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-business-stock-market",
                    name: "Stock market",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "Dow Jones",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Pretium fusce id velit ut tortor pretium viverra suspendisse potenti. Nisi scelerisque eu ultrices vitae auctor eu. Amet massa vitae tortor condimentum lacinia quis vel. In arcu cursus euismod quis.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Tempus urna et pharetra pharetra massa massa ultricies mi. Vestibulum lorem sed risus ultricies tristique nulla aliquet enim. Sit amet luctus venenatis lectus magna fringilla urna.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Viverra adipiscing at in tellus integer feugiat scelerisque varius morbi. Massa tempor nec feugiat nisl pretium fusce id. Elit ut aliquam purus sit amet luctus.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "S&P 500",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Risus quis varius quam quisque id diam vel quam. Risus at ultrices mi tempus imperdiet nulla malesuada. Aliquet enim tortor at auctor urna. Sapien et ligula ullamcorper malesuada proin libero. Nunc sed augue lacus viverra vitae congue.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Quisque id diam vel quam elementum pulvinar etiam non. Lacus laoreet non curabitur gravida arcu ac tortor dignissim convallis. Ac ut consequat semper viverra nam libero justo.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Pulvinar etiam non quam lacus suspendisse faucibus interdum posuere lorem. Enim facilisis gravida neque convallis. Quis blandit turpis cursus in hac habitasse platea.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Day Trading",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Pellentesque pulvinar pellentesque habitant morbi tristique senectus et netus et. Sed enim ut sem viverra aliquet eget. Porttitor lacus luctus accumsan tortor. Sit amet justo donec enim diam.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Nibh sit amet commodo nulla facilisi nullam vehicula. Lectus mauris ultrices eros in cursus turpis massa. Egestas fringilla phasellus faucibus scelerisque eleifend donec pretium. Sed adipiscing diam donec adipiscing tristique risus nec feugiat in.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Consectetur lorem donec massa sapien faucibus. Aliquet porttitor lacus luctus accumsan tortor. Pharetra pharetra massa massa ultricies mi. Aliquam id diam maecenas ultricies mi eget mauris pharetra. Rhoncus urna neque viverra justo nec ultrices dui sapien eget.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-business-impact",
                    name: "Impact",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Oil crisis",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Eleifend donec pretium vulputate sapien nec sagittis.",
                                    content:
                                        "Adipiscing bibendum est ultricies integer quis. Viverra ipsum nunc aliquet bibendum enim facilisis gravida neque. Suspendisse in est ante in. Semper auctor neque vitae tempus quam pellentesque. Et tortor at risus viverra adipiscing at in tellus integer.",
                                },
                                {
                                    title: "Ornare aenean euismod elementum nisi quis eleifend quam.",
                                    content:
                                        "Pretium aenean pharetra magna ac. Sem nulla pharetra diam sit amet nisl suscipit adipiscing bibendum. Neque vitae tempus quam pellentesque nec nam aliquam sem. Potenti nullam ac tortor vitae purus faucibus ornare suspendisse. Ipsum nunc aliquet bibendum enim facilisis gravida neque.",
                                },
                                {
                                    title: "Ultrices sagittis orci a scelerisque purus semper. Porttitor massa id neque aliquam vestibulum morbi blandit.",
                                    content:
                                        "Augue eget arcu dictum varius. Aliquet nibh praesent tristique magna sit amet purus gravida. Mattis enim ut tellus elementum. A diam sollicitudin tempor id eu nisl nunc mi. Justo nec ultrices dui sapien eget mi proin. Euismod lacinia at quis risus sed vulputate odio.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Tech Markets",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Dictum sit amet justo donec. Justo donec enim diam vulputate ut pharetra sit.",
                                    content:
                                        "Bibendum enim facilisis gravida neque. Ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at augue. Auctor neque vitae tempus quam pellentesque nec. Justo donec enim diam vulputate ut pharetra sit amet. Aliquam sem fringilla ut morbi tincidunt augue interdum velit.",
                                },
                                {
                                    title: "Massa massa ultricies mi quis hendrerit dolor magna eget.",
                                    content:
                                        "Ornare massa eget egestas purus viverra accumsan in nisl nisi. A arcu cursus vitae congue mauris rhoncus. Gravida arcu ac tortor dignissim convallis aenean et tortor. Elit scelerisque mauris pellentesque pulvinar pellentesque habitant. Volutpat diam ut venenatis tellus in metus.",
                                },
                                {
                                    title: "Duis at consectetur lorem donec massa sapien faucibus.",
                                    content:
                                        "acilisis gravida neque convallis a cras semper auctor neque. Non nisi est sit amet facilisis magna etiam tempor. Posuere morbi leo urna molestie at elementum eu. Tellus in hac habitasse platea dictumst vestibulum rhoncus est pellentesque.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Declining Markets",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Odio aenean sed adipiscing diam donec adipiscing tristique risus nec.",
                                    content: "Pharetra vel turpis nunc eget. Non arcu risus quis varius quam quisque id. Augue ut lectus arcu bibendum at varius vel pharetra vel. Rhoncus dolor purus non enim praesent elementum.",
                                },
                                {
                                    title: "Quis enim lobortis scelerisque fermentum. Nisl rhoncus mattis rhoncus urna. Felis eget velit aliquet sagittis id consectetur purus ut.",
                                    content:
                                        "Enim nec dui nunc mattis enim ut. Amet luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor. Sed vulputate mi sit amet mauris commodo. Ultricies lacus sed turpis tincidunt id aliquet risus feugiat. In hac habitasse platea dictumst vestibulum rhoncus est.",
                                },
                                {
                                    title: "landit cursus risus at ultrices mi tempus imperdiet nulla malesuada.",
                                    content:
                                        "Vitae justo eget magna fermentum iaculis eu non diam phasellus. Et netus et malesuada fames ac turpis. In eu mi bibendum neque egestas congue. Justo eget magna fermentum iaculis eu non diam. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-business-hot-topics",
                    name: "Hot Topics",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "In massa tempor nec feugiat nisl. Mattis vulputate enim nulla aliquet porttitor lacus luctus. Et sollicitudin ac orci phasellus egestas tellus rutrum tellus pellentesque. Nec sagittis aliquam malesuada bibendum.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Euismod quis viverra nibh cras pulvinar mattis nunc. Mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus. Malesuada bibendum arcu vitae elementum curabitur vitae. Fusce id velit ut tortor.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Scelerisque felis imperdiet proin fermentum leo vel orci. Tortor vitae purus faucibus ornare suspendisse sed nisi. Molestie at elementum eu facilisis sed odio. Pellentesque sit amet porttitor eget. Vitae auctor eu augue ut lectus arcu bibendum at varius.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Potenti nullam ac tortor vitae purus faucibus ornare. Nunc mattis enim ut tellus elementum sagittis vitae et leo. Pellentesque pulvinar pellentesque habitant morbi tristique senectus.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-business-paid-content",
                    name: "Paid Content",
                    articles: [
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Facilisis magna etiam tempor orci eu lobortis elementum nibh tellus. Morbi enim nunc faucibus a pellentesque sit amet porttitor eget.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Cursus vitae congue mauris rhoncus aenean vel elit. Ultrices neque ornare aenean euismod elementum nisi. Aliquet risus feugiat in ante metus dictum at tempor commodo.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Sit amet aliquam id diam maecenas ultricies. Magna sit amet purus gravida quis blandit. Risus nullam eget felis eget nunc. Ac felis donec et odio pellentesque diam volutpat commodo sed.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Purus faucibus ornare suspendisse sed nisi lacus. Malesuada nunc vel risus commodo. Pretium fusce id velit ut tortor pretium viverra suspendisse potenti.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Aliquam malesuada bibendum arcu vitae elementum curabitur. A pellentesque sit amet porttitor eget dolor morbi non.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Tortor at auctor urna nunc id cursus metus aliquam. Facilisis magna etiam tempor orci. Eu nisl nunc mi ipsum faucibus vitae aliquet.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Cursus mattis molestie a iaculis at. Nullam eget felis eget nunc. Tortor id aliquet lectus proin nibh nisl condimentum id.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "arius morbi enim nunc faucibus a pellentesque sit amet porttitor. Blandit libero volutpat sed cras. Sed viverra ipsum nunc aliquet bibendum.",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        opinion: {
            name: "Opinion",
            url: "/opinion",
            priority: 2,
            sections: [
                {
                    id: "content-opinion-a-deeper-look",
                    name: "A deeper look",
                    articles: [
                        {
                            class: "columns-3-wide",
                            header: "Latest Facts",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { tag: "breaking" },
                            title: "Senectus et netus et malesuada fames ac turpis egestas. Odio facilisis mauris sit amet massa. Ornare quam viverra orci sagittis eu volutpat odio.",
                            type: "text",
                            content:
                                "Lorem ipsum dolor sit amet consectetur. Ridiculus mus mauris vitae ultricies leo. Volutpat ac tincidunt vitae semper quis. In est ante in nibh. Fringilla phasellus faucibus scelerisque eleifend donec pretium. Scelerisque eu ultrices vitae auctor eu augue.",
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Top of our mind",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Nisl pretium fusce id velit ut tortor pretium. Arcu cursus vitae congue mauris rhoncus aenean.",
                            type: "text",
                            content: "Aenean euismod elementum nisi quis eleifend quam adipiscing vitae proin. Pharetra vel turpis nunc eget lorem. Morbi tincidunt augue interdum velit euismod in pellentesque massa placerat.",
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Editor Report",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Dignissim enim sit amet venenatis urna cursus.",
                            type: "text",
                            content: `Aenean pharetra magna ac placerat vestibulum lectus mauris. Massa sapien faucibus et molestie ac feugiat sed lectus vestibulum.

Vitae congue mauris rhoncus aenean vel elit scelerisque. Faucibus turpis in eu mi bibendum neque egestas congue quisque.`,
                        },
                    ],
                },
                {
                    id: "content-opinion-top-issues",
                    name: "Top Issues",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Thoughts",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Morbi tincidunt ornare massa eget.",
                            type: "list",
                            content: [
                                { content: "Tortor consequat id porta nibh venenatis cras sed." },
                                { content: "Suspendisse faucibus interdum posuere lorem ipsum dolor sit amet consectetur." },
                                { content: "Adipiscing diam donec adipiscing tristique risus nec feugiat in." },
                                { content: "Ultrices neque ornare aenean euismod elementum nisi quis." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Social commentary",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Sagittis aliquam malesuada bibendum arcu vitae.",
                            type: "list",
                            content: [
                                { content: "Nisi porta lorem mollis aliquam ut porttitor leo a diam." },
                                { content: "Purus ut faucibus pulvinar elementum integer enim neque volutpat ac." },
                                { content: "Suspendisse in est ante in nibh mauris cursus." },
                                { content: "Aliquam vestibulum morbi blandit cursus. Leo integer malesuada nunc vel risus commodo viverra maecenas." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Special Projects",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Nulla aliquet enim tortor at auctor urna nunc id.",
                            type: "text",
                            content:
                                "Platea dictumst quisque sagittis purus sit amet volutpat. Vulputate ut pharetra sit amet aliquam id. Tellus integer feugiat scelerisque varius morbi enim nunc faucibus. Est ante in nibh mauris. Libero volutpat sed cras ornare arcu dui vivamus.",
                        },
                    ],
                },
                {
                    id: "content-opinon-trending",
                    name: "Trending",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "Around the world",
                            type: "excerpt",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Egestas congue quisque egestas diam in arcu. Sollicitudin tempor id eu nisl nunc mi." },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "A condimentum vitae sapien pellentesque habitant morbi tristique senectus. Neque laoreet suspendisse interdum consectetur.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Dui vivamus arcu felis bibendum. Sit amet purus gravida quis blandit turpis cursus in." },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Support",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Malesuada fames ac turpis egestas integer eget. Ante metus dictum at tempor commodo ullamcorper. Ipsum dolor sit amet consectetur.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Dictumst quisque sagittis purus sit amet. Cras fermentum odio eu feugiat pretium. Pretium aenean pharetra magna ac placerat vestibulum lectus.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Et odio pellentesque diam volutpat commodo sed egestas egestas. Sagittis aliquam malesuada bibendum arcu vitae elementum curabitur.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Know More",
                            type: "excerpt",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Nullam eget felis eget nunc. Fames ac turpis egestas integer eget aliquet nibh praesent tristique." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Massa ultricies mi quis hendrerit dolor magna eget est." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Ut tellus elementum sagittis vitae et leo duis ut. Purus ut faucibus pulvinar elementum integer enim." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-opinion-think-about-it",
                    name: "Think about it",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Mental Health",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "olutpat ac tincidunt vitae semper quis lectus nulla at. Non quam lacus suspendisse faucibus interdum posuere lorem..",
                            type: "list",
                            display: "bullets",
                            content: [
                                { content: "Et tortor consequat id porta nibh venenatis cras sed felis. Neque aliquam vestibulum morbi blandit cursus risus at ultrices mi.", url: "#" },
                                { content: "Commodo quis imperdiet massa tincidunt nunc. Diam maecenas sed enim ut sem viverra aliquet eget sit.", url: "#" },
                                { content: "Aliquam malesuada bibendum arcu vitae elementum curabitur. Quis ipsum suspendisse ultrices gravida dictum fusce ut placerat.", url: "#" },
                                { content: "Quis enim lobortis scelerisque fermentum. Nibh venenatis cras sed felis eget velit aliquet.", url: "#" },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Better life",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Placerat vestibulum lectus mauris ultrices. Eros in cursus turpis massa.",
                            type: "list",
                            display: "bullets",
                            content: [
                                { content: "In hac habitasse platea dictumst vestibulum rhoncus est pellentesque elit. At lectus urna duis convallis convallis tellus id interdum.", url: "#" },
                                { content: "Ultrices eros in cursus turpis massa tincidunt dui. Mi tempus imperdiet nulla malesuada pellentesque.", url: "#" },
                                { content: "Ipsum faucibus vitae aliquet nec ullamcorper sit. Eleifend donec pretium vulputate sapien nec sagittis aliquam.", url: "#" },
                                { content: "In hac habitasse platea dictumst. Pretium vulputate sapien nec sagittis aliquam malesuada bibendum arcu.", url: "#" },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "The right choice",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Faucibus et molestie ac feugiat. Enim sit amet venenatis urna cursus eget nunc scelerisque viverra.",
                            type: "list",
                            display: "bullets",
                            content: [
                                { content: "Urna porttitor rhoncus dolor purus. Eget sit amet tellus cras adipiscing enim.", url: "#" },
                                { content: "Leo urna molestie at elementum eu facilisis sed. Metus dictum at tempor commodo ullamcorper a.", url: "#" },
                                { content: "Non odio euismod lacinia at quis risus sed vulputate.", url: "#" },
                                { content: "Justo donec enim diam vulputate ut. Euismod elementum nisi quis eleifend.", url: "#" },
                            ],
                        },
                    ],
                },
                {
                    id: "content-opinion-latest-media",
                    name: "Latest Media",
                    articles: [
                        {
                            class: "columns-1",
                            type: "grid",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                            ],
                        },
                    ],
                },
                {
                    id: "content-opinion-in-case-you-missed-it",
                    name: "In case you missed it",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Critical thoughts",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Facilisi morbi tempus iaculis urna id. Nibh cras pulvinar mattis nunc sed.",
                            type: "list",
                            content: [
                                { content: "Eget felis eget nunc lobortis mattis aliquam faucibus purus in." },
                                { content: "Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus." },
                                { content: "Eu volutpat odio facilisis mauris sit amet massa." },
                                { content: "Vitae tortor condimentum lacinia quis vel eros donec ac." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Critical Thinking",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Euismod nisi porta lorem mollis aliquam ut porttitor leo a.",
                            type: "list",
                            content: [
                                { content: "Enim facilisis gravida neque convallis a." },
                                { content: "Ridiculus mus mauris vitae ultricies leo integer malesuada." },
                                { content: "Elementum nisi quis eleifend quam. Sed elementum tempus egestas sed sed." },
                                { content: "Ut tellus elementum sagittis vitae et leo duis ut diam. Ultrices gravida dictum fusce ut placerat orci nulla pellentesque dignissim." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Critical Actions",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Amet dictum sit amet justo donec enim diam.",
                            type: "list",
                            content: [
                                { content: "Metus dictum at tempor commodo ullamcorper a lacus vestibulum." },
                                { content: "In nisl nisi scelerisque eu ultrices. In fermentum et sollicitudin ac orci phasellus egestas." },
                                { content: "Ut aliquam purus sit amet luctus venenatis lectus magna fringilla." },
                                { content: "Morbi enim nunc faucibus a pellentesque. Mi ipsum faucibus vitae aliquet nec ullamcorper." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-opinion-environmental-issues",
                    name: "Environmental Issues",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Global Warming",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Dis parturient montes nascetur ridiculus mus mauris vitae.",
                                    content:
                                        "Justo donec enim diam vulputate ut pharetra sit amet aliquam. Curabitur vitae nunc sed velit dignissim sodales. Varius vel pharetra vel turpis nunc eget lorem. Sed viverra ipsum nunc aliquet bibendum. Ultrices in iaculis nunc sed augue.",
                                },
                                {
                                    title: "Vitae turpis massa sed elementum tempus egestas sed sed risus.",
                                    content:
                                        "Nascetur ridiculus mus mauris vitae ultricies leo integer. Hendrerit dolor magna eget est lorem ipsum dolor sit amet. Ultrices gravida dictum fusce ut placerat orci nulla pellentesque. Gravida arcu ac tortor dignissim convallis aenean. Urna duis convallis convallis tellus id interdum.",
                                },
                                {
                                    title: "Rutrum tellus pellentesque eu tincidunt tortor. Volutpat sed cras ornare arcu.",
                                    content:
                                        "estibulum mattis ullamcorper velit sed ullamcorper morbi tincidunt. Urna porttitor rhoncus dolor purus. Nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Ultrices in iaculis nunc sed augue lacus. Nunc pulvinar sapien et ligula ullamcorper.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Recycling",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Tellus id interdum velit laoreet id donec ultrices tincidunt arcu.",
                                    content:
                                        "Eget est lorem ipsum dolor sit amet. Faucibus scelerisque eleifend donec pretium vulputate sapien. Quam adipiscing vitae proin sagittis. Quisque id diam vel quam elementum pulvinar etiam non. Laoreet non curabitur gravida arcu ac tortor dignissim convallis aenean.",
                                },
                                {
                                    title: "Scelerisque viverra mauris in aliquam sem fringilla ut.",
                                    content: "Amet mauris commodo quis imperdiet. Eu consequat ac felis donec et odio pellentesque. Hendrerit gravida rutrum quisque non tellus orci ac. Amet cursus sit amet dictum.",
                                },
                                {
                                    title: "Vulputate eu scelerisque felis imperdiet. Non quam lacus suspendisse faucibus interdum posuere.",
                                    content:
                                        "Luctus venenatis lectus magna fringilla urna porttitor. Hac habitasse platea dictumst vestibulum rhoncus. Orci a scelerisque purus semper eget duis at tellus. Risus nec feugiat in fermentum posuere urna nec tincidunt praesent.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "New researches",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Non quam lacus suspendisse faucibus.",
                                    content:
                                        "Nisi quis eleifend quam adipiscing vitae proin sagittis nisl rhoncus. Odio euismod lacinia at quis. Molestie a iaculis at erat. Id cursus metus aliquam eleifend mi in nulla posuere sollicitudin. Donec ac odio tempor orci dapibus.",
                                },
                                {
                                    title: "Sit amet consectetur adipiscing elit. Lorem sed risus ultricies tristique nulla aliquet.",
                                    content:
                                        "Neque aliquam vestibulum morbi blandit cursus risus at. Habitant morbi tristique senectus et netus et. Quis blandit turpis cursus in. Adipiscing vitae proin sagittis nisl rhoncus mattis rhoncus urna. Vel risus commodo viverra maecenas. Tortor dignissim convallis aenean et tortor at.",
                                },
                                {
                                    title: "Ullamcorper sit amet risus nullam eget.",
                                    content:
                                        "urpis nunc eget lorem dolor sed viverra ipsum nunc aliquet. Mollis aliquam ut porttitor leo a diam. Posuere morbi leo urna molestie. Suscipit tellus mauris a diam maecenas sed. Ultrices dui sapien eget mi proin sed libero enim sed.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-opinion-underscored",
                    name: "Underscored",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Faucibus interdum posuere lorem ipsum. Aliquam nulla facilisi cras fermentum odio. Odio facilisis mauris sit amet massa vitae. Et tortor at risus viverra adipiscing. Luctus accumsan tortor posuere ac ut consequat semper viverra nam.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Montes nascetur ridiculus mus mauris vitae. Amet porttitor eget dolor morbi non arcu risus quis varius. Rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar. A lacus vestibulum sed arcu non odio euismod lacinia.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Volutpat consequat mauris nunc congue. Arcu dui vivamus arcu felis bibendum ut tristique. Fringilla ut morbi tincidunt augue. Libero enim sed faucibus turpis in eu mi bibendum. Posuere ac ut consequat semper viverra.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Nec nam aliquam sem et. Maecenas ultricies mi eget mauris pharetra. Nibh nisl condimentum id venenatis a condimentum vitae sapien. Tellus pellentesque eu tincidunt tortor aliquam nulla facilisi cras fermentum.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-opinon-what-matters-most",
                    name: "What matters most",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "Discussion",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Nibh sed pulvinar proin gravida hendrerit lectus. Habitasse platea dictumst quisque sagittis purus sit amet. Mi sit amet mauris commodo quis.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Nascetur ridiculus mus mauris vitae ultricies leo integer malesuada. Arcu non odio euismod lacinia. Ac turpis egestas sed tempus urna.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Lectus sit amet est placerat in. Auctor augue mauris augue neque gravida in fermentum. Duis convallis convallis tellus id interdum.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Is it worth it?",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Venenatis tellus in metus vulputate eu scelerisque felis. Orci phasellus egestas tellus rutrum tellus pellentesque eu. Id leo in vitae turpis massa sed elementum.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Feugiat vivamus at augue eget arcu dictum varius duis at. Ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Eget sit amet tellus cras adipiscing enim eu. Dictum at tempor commodo ullamcorper a lacus. Lectus proin nibh nisl condimentum id venenatis a condimentum vitae.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Just do it",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Mattis rhoncus urna neque viverra. Hendrerit gravida rutrum quisque non tellus orci ac. Ut venenatis tellus in metus.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Enim ut tellus elementum sagittis vitae et leo duis. Dictumst quisque sagittis purus sit amet volutpat consequat." },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "urus ut faucibus pulvinar elementum integer enim neque. Commodo sed egestas egestas fringilla phasellus faucibus scelerisque.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-opinion-hot-topics",
                    name: "Hot Topics",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Feugiat in ante metus dictum at tempor. Faucibus scelerisque eleifend donec pretium. Turpis egestas integer eget aliquet nibh praesent. In metus vulputate eu scelerisque felis imperdiet. Diam maecenas sed enim ut sem. Quis imperdiet massa tincidunt nunc pulvinar sapien et.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Massa eget egestas purus viverra accumsan in nisl nisi. Sodales ut eu sem integer. Ac tortor dignissim convallis aenean et tortor. Erat velit scelerisque in dictum non consectetur. Id venenatis a condimentum vitae sapien pellentesque habitant.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Nisl rhoncus mattis rhoncus urna. Ligula ullamcorper malesuada proin libero nunc consequat interdum. Nunc mi ipsum faucibus vitae aliquet nec ullamcorper. Pellentesque nec nam aliquam sem et tortor consequat. Consequat interdum varius sit amet mattis. Diam sit amet nisl suscipit adipiscing bibendum est ultricies.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Non enim praesent elementum facilisis leo vel fringilla est ullamcorper. Nulla aliquet enim tortor at auctor urna. In arcu cursus euismod quis viverra nibh cras pulvinar mattis.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-opinion-paid-content",
                    name: "Paid Content",
                    articles: [
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Nulla facilisi nullam vehicula ipsum. Sit amet tellus cras adipiscing enim eu turpis egestas pretium. Diam phasellus vestibulum lorem sed risus ultricies.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [{ image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, title: "Dictum fusce ut placerat orci nulla. Quis ipsum suspendisse ultrices gravida dictum fusce ut placerat." }],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Sed cras ornare arcu dui vivamus. Eget nunc lobortis mattis aliquam faucibus purus in. Nulla facilisi nullam vehicula ipsum a. Sed faucibus turpis in eu mi bibendum.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Mauris nunc congue nisi vitae suscipit tellus. Auctor augue mauris augue neque gravida in. Phasellus vestibulum lorem sed risus ultricies.",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        health: {
            name: "Health",
            url: "/health",
            priority: 2,
            sections: [
                {
                    id: "content-health-trending",
                    name: "Trending",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Mindfulness",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Consectetur lorem donec massa sapien faucibus et.",
                            type: "list",
                            content: [
                                { content: "Eu turpis egestas pretium aenean pharetra. Nisl condimentum id venenatis a condimentum vitae sapien pellentesque habitant." },
                                { content: "Bibendum arcu vitae elementum curabitur vitae nunc sed velit dignissim." },
                                { content: "Eu non diam phasellus vestibulum lorem. Fermentum dui faucibus in ornare quam viverra orci sagittis." },
                                { content: "Et malesuada fames ac turpis. Ornare massa eget egestas purus viverra accumsan." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Latest research",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Sed velit dignissim sodales ut eu sem integer vitae.",
                            type: "list",
                            content: [
                                { content: "Metus vulputate eu scelerisque felis." },
                                { content: "Aliquam sem et tortor consequat id. Feugiat nibh sed pulvinar proin." },
                                { content: "Quisque non tellus orci ac auctor augue." },
                                { content: "Sed risus pretium quam vulputate dignissim. Vitae tortor condimentum lacinia quis vel eros." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Healthy Senior",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Scelerisque in dictum non consectetur a.",
                            type: "list",
                            content: [
                                { content: "Odio euismod lacinia at quis risus sed vulputate odio. Ullamcorper eget nulla facilisi etiam." },
                                { content: "Ipsum consequat nisl vel pretium. Nisi vitae suscipit tellus mauris a diam." },
                                { content: "Laoreet id donec ultrices tincidunt arcu non sodales neque sodales." },
                                { content: "At volutpat diam ut venenatis tellus in metus vulputate eu." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-health-latest-facts",
                    name: "Latest Facts",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "More Life, But Better",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Sed tempus urna et pharetra pharetra massa massa ultricies mi.",
                            type: "list",
                            content: [
                                { content: "Pharetra vel turpis nunc eget. Eu feugiat pretium nibh ipsum consequat." },
                                { content: "Velit dignissim sodales ut eu sem. Viverra accumsan in nisl nisi scelerisque eu ultrices." },
                                { content: "Arcu dictum varius duis at consectetur lorem donec massa sapien." },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "In case you missed it",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Egestas pretium aenean pharetra magna ac.",
                            type: "text",
                            content: `Lectus proin nibh nisl condimentum id venenatis a condimentum vitae. Tincidunt praesent semper feugiat nibh sed pulvinar proin.

Quis ipsum suspendisse ultrices gravida dictum fusce. Id donec ultrices tincidunt arcu non. Pellentesque habitant morbi tristique senectus et netus et malesuada fames.`,
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Space and science",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Vitae ultricies leo integer malesuada nunc vel risus.",
                            type: "list",
                            display: "bullets",
                            content: [
                                { content: "Semper eget duis at tellus at urna condimentum.", url: "#" },
                                { content: "Aliquet lectus proin nibh nisl condimentum id. Velit scelerisque in dictum non.", url: "#" },
                                { content: "Nulla posuere sollicitudin aliquam ultrices sagittis orci.", url: "#" },
                                { content: "Condimentum vitae sapien pellentesque habitant. Iaculis at erat pellentesque adipiscing commodo elit at imperdiet.", url: "#" },
                            ],
                        },
                    ],
                },
                {
                    id: "content-health-medical-breakthroughs",
                    name: "Medical Breakthroughs",
                    articles: [
                        {
                            class: "columns-3-wide",
                            header: "Surgical Inventions",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone.", tag: "breaking" },
                            title: "Nisi est sit amet facilisis magna etiam tempor. Cursus eget nunc scelerisque viverra mauris in aliquam sem fringilla.",
                            type: "text",
                            content:
                                "Ut eu sem integer vitae justo eget. Ut aliquam purus sit amet luctus. Sit amet mauris commodo quis imperdiet massa tincidunt. Tellus rutrum tellus pellentesque eu tincidunt tortor aliquam nulla facilisi. Turpis nunc eget lorem dolor sed. Ultrices in iaculis nunc sed augue lacus. Quam elementum pulvinar etiam non. Urna cursus eget nunc scelerisque. Nisl purus in mollis nunc sed.",
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Medicare",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Cras semper auctor neque vitae. Vel turpis nunc eget lorem dolor sed viverra ipsum nunc.",
                            type: "text",
                            content: `Lacus sed viverra tellus in hac habitasse. Sapien faucibus et molestie ac feugiat sed lectus. Pretium aenean pharetra magna ac. Volutpat odio facilisis mauris sit amet massa vitae tortor condimentum. Pellentesque massa placerat duis ultricies lacus sed turpis tincidunt id.

Parturient montes nascetur ridiculus mus mauris. Ultrices eros in cursus turpis. Bibendum at varius vel pharetra vel turpis. Luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor.`,
                        },
                        {
                            class: "columns-3-narrow",
                            header: "Medication",
                            url: "#",
                            image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                            meta: { captions: "Photo taken by someone." },
                            title: "Ipsum dolor sit amet consectetur adipiscing elit. Velit scelerisque in dictum non consectetur a erat nam.",
                            type: "text",
                            content: `Mattis molestie a iaculis at erat pellentesque adipiscing. Sed augue lacus viverra vitae congue. Volutpat consequat mauris nunc congue nisi vitae suscipit tellus. Lacus laoreet non curabitur gravida arcu. Nisl nisi scelerisque eu ultrices vitae auctor.

Integer vitae justo eget magna fermentum iaculis eu non. Sollicitudin ac orci phasellus egestas. Ligula ullamcorper malesuada proin libero nunc consequat interdum.`,
                        },
                    ],
                },
                {
                    id: "content-health-latest-videos",
                    name: "Latest Videos",
                    articles: [
                        {
                            class: "columns-1",
                            type: "grid",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, meta: { tag: "watch" } },
                            ],
                        },
                    ],
                },
                {
                    id: "content-health-educational",
                    name: "Educational",
                    articles: [
                        {
                            class: "columns-1",
                            type: "grid",
                            display: "grid-wrap",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Orci phasellus egestas tellus rutrum tellus pellentesque eu. Pulvinar neque laoreet suspendisse interdum consectetur. Viverra maecenas accumsan lacus vel facilisis volutpat. Nibh ipsum consequat nisl vel pretium lectus quam id. Leo integer malesuada nunc vel risus commodo viverra.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Proin libero nunc consequat interdum varius sit amet. Convallis posuere morbi leo urna molestie at. Consectetur lorem donec massa sapien faucibus et molestie ac feugiat. Egestas diam in arcu cursus euismod quis viverra nibh.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Elit sed vulputate mi sit. Ullamcorper a lacus vestibulum sed arcu non odio euismod lacinia. Magna eget est lorem ipsum dolor sit amet consectetur. In tellus integer feugiat scelerisque varius morbi enim nunc faucibus. Nam libero justo laoreet sit.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Nam aliquam sem et tortor consequat. Non sodales neque sodales ut etiam sit amet nisl purus. Viverra mauris in aliquam sem. Leo vel fringilla est ullamcorper. Tellus at urna condimentum mattis pellentesque id nibh tortor. Lacus laoreet non curabitur gravida. Ut morbi tincidunt augue interdum velit euismod in pellentesque.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Egestas integer eget aliquet nibh praesent tristique magna sit. Id consectetur purus ut faucibus. Molestie a iaculis at erat pellentesque adipiscing commodo elit at. Nulla facilisi etiam dignissim diam quis enim lobortis scelerisque. Lectus proin nibh nisl condimentum id. Ornare quam viverra orci sagittis eu volutpat odio facilisis mauris.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-health-fitness",
                    name: "Fitness",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "Burn your calories",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Dictumst quisque sagittis purus sit amet volutpat consequat. At imperdiet dui accumsan sit amet nulla facilisi. Felis bibendum ut tristique et egestas. Mus mauris vitae ultricies leo integer malesuada. Adipiscing at in tellus integer feugiat.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Morbi non arcu risus quis varius quam quisque id. Enim nulla aliquet porttitor lacus luctus. Quis imperdiet massa tincidunt nunc pulvinar sapien et ligula ullamcorper. Tempor id eu nisl nunc mi ipsum faucibus vitae aliquet. Consequat semper viverra nam libero justo laoreet sit.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Suscipit adipiscing bibendum est ultricies integer quis auctor elit. Gravida quis blandit turpis cursus in hac habitasse platea. Maecenas ultricies mi eget mauris pharetra et ultrices. Massa sed elementum tempus egestas sed.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Gym favorites",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Nulla facilisi nullam vehicula ipsum a arcu cursus. Et ultrices neque ornare aenean euismod elementum nisi quis. Velit euismod in pellentesque massa. In fermentum posuere urna nec tincidunt praesent semper.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Sit amet consectetur adipiscing elit duis tristique sollicitudin. Ante metus dictum at tempor commodo ullamcorper. Tincidunt eget nullam non nisi est sit. Platea dictumst quisque sagittis purus sit amet volutpat consequat.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Sed vulputate odio ut enim blandit volutpat maecenas. Risus viverra adipiscing at in. Fusce id velit ut tortor pretium viverra. Sem nulla pharetra diam sit amet nisl. Posuere urna nec tincidunt praesent semper feugiat nibh.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Pilates",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Massa massa ultricies mi quis hendrerit dolor magna. Cursus vitae congue mauris rhoncus aenean vel elit scelerisque. Vestibulum lorem sed risus ultricies tristique. Egestas fringilla phasellus faucibus scelerisque eleifend donec pretium vulputate.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Massa enim nec dui nunc mattis enim ut tellus elementum. Eros in cursus turpis massa tincidunt dui. Sit amet consectetur adipiscing elit ut aliquam purus sit amet. Eget nullam non nisi est sit amet facilisis magna.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "enenatis tellus in metus vulputate eu scelerisque felis imperdiet proin. In eu mi bibendum neque egestas congue quisque egestas. Bibendum est ultricies integer quis auctor elit. Ipsum nunc aliquet bibendum enim facilisis. Magna fringilla urna porttitor rhoncus dolor purus non enim praesent.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-health-guides",
                    name: "Guides",
                    articles: [
                        {
                            class: "columns-3-balanced",
                            header: "Health after 50",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Ac ut consequat semper viverra nam libero justo.",
                                    content:
                                        "A lacus vestibulum sed arcu non odio euismod lacinia at. Viverra mauris in aliquam sem fringilla ut morbi tincidunt augue. Enim nec dui nunc mattis enim ut tellus. Congue eu consequat ac felis donec et odio. Vitae sapien pellentesque habitant morbi tristique senectus.",
                                },
                                {
                                    title: "Sit amet porttitor eget dolor morbi non arcu risus quis.",
                                    content:
                                        "Gravida in fermentum et sollicitudin. Diam sollicitudin tempor id eu nisl. Proin libero nunc consequat interdum varius sit amet. Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero. Lacinia quis vel eros donec ac.",
                                },
                                {
                                    title: "Faucibus nisl tincidunt eget nullam non nisi.",
                                    content:
                                        "Diam ut venenatis tellus in metus. Luctus accumsan tortor posuere ac. Eget aliquet nibh praesent tristique magna. Diam donec adipiscing tristique risus nec feugiat in fermentum posuere. Dolor morbi non arcu risus quis varius quam quisque.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Healthy Heart",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Gravida cum sociis natoque penatibus et magnis dis parturient montes.",
                                    content:
                                        "Nulla porttitor massa id neque aliquam vestibulum morbi. Nullam non nisi est sit amet facilisis. Vitae turpis massa sed elementum tempus. Varius duis at consectetur lorem. Consequat semper viverra nam libero justo laoreet sit.",
                                },
                                {
                                    title: "Non nisi est sit amet facilisis magna etiam tempor orci.",
                                    content:
                                        "At augue eget arcu dictum varius duis at. Arcu felis bibendum ut tristique et egestas. Elementum tempus egestas sed sed risus pretium quam vulputate. Cursus euismod quis viverra nibh cras pulvinar. Praesent tristique magna sit amet purus gravida quis.",
                                },
                                {
                                    title: "Sit amet justo donec enim diam vulputate ut pharetra.",
                                    content:
                                        "Nulla at volutpat diam ut venenatis tellus. Pulvinar mattis nunc sed blandit libero volutpat. Sit amet justo donec enim diam vulputate. Condimentum id venenatis a condimentum vitae sapien pellentesque habitant.",
                                },
                            ],
                        },
                        {
                            class: "columns-3-balanced",
                            header: "Healthy Digestive",
                            type: "articles-list",
                            content: [
                                {
                                    title: "Metus aliquam eleifend mi in nulla posuere sollicitudin.",
                                    content:
                                        "Sodales ut etiam sit amet nisl purus in. Lorem ipsum dolor sit amet consectetur. Tincidunt ornare massa eget egestas purus viverra accumsan in. Orci eu lobortis elementum nibh tellus molestie nunc non. Ut faucibus pulvinar elementum integer enim neque.",
                                },
                                {
                                    title: "Placerat duis ultricies lacus sed. Donec enim diam vulputate ut.",
                                    content:
                                        "Condimentum id venenatis a condimentum vitae sapien. Eu ultrices vitae auctor eu augue ut lectus. Fermentum iaculis eu non diam phasellus. Urna nunc id cursus metus aliquam eleifend mi. Venenatis cras sed felis eget velit aliquet sagittis.",
                                },
                                {
                                    title: "Rhoncus dolor purus non enim praesent elementum facilisis.",
                                    content:
                                        "Nunc consequat interdum varius sit. Non diam phasellus vestibulum lorem sed risus ultricies. Feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Eget egestas purus viverra accumsan in nisl nisi scelerisque.",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-health-underscored",
                    name: "Underscored",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Lectus arcu bibendum at varius. Sed id semper risus in hendrerit gravida rutrum. Bibendum ut tristique et egestas quis ipsum suspendisse ultrices gravida. Euismod nisi porta lorem mollis. At varius vel pharetra vel turpis.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Pretium aenean pharetra magna ac placerat vestibulum lectus mauris ultrices. Lacus sed turpis tincidunt id. Eget nunc scelerisque viverra mauris in aliquam sem fringilla ut. Dapibus ultrices in iaculis nunc sed.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Tempus iaculis urna id volutpat lacus laoreet non. Elementum nisi quis eleifend quam adipiscing vitae proin. Vel pretium lectus quam id leo. Eget sit amet tellus cras adipiscing enim eu turpis.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Adipiscing vitae proin sagittis nisl rhoncus. Euismod in pellentesque massa placerat duis. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin. Quam nulla porttitor massa id neque.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-health-what-to-eat",
                    name: "What to eat",
                    articles: [
                        {
                            class: "columns-wrap",
                            header: "Low carbs",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Nec feugiat in fermentum posuere urna. Odio ut sem nulla pharetra. Est ultricies integer quis auctor elit sed. Dignissim cras tincidunt lobortis feugiat vivamus at augue eget.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Egestas sed tempus urna et. Lorem ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant." },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Sapien pellentesque habitant morbi tristique senectus et netus et malesuada. Dictum non consectetur a erat. Duis ut diam quam nulla porttitor.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Vegetarian",
                            type: "excerpt",
                            content: [
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Sed viverra tellus in hac habitasse platea dictumst vestibulum. Nisi est sit amet facilisis magna etiam." },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Convallis a cras semper auctor neque vitae tempus. Cursus risus at ultrices mi tempus imperdiet nulla." },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Ut faucibus pulvinar elementum integer enim neque volutpat. Netus et malesuada fames ac turpis egestas sed tempus urna.",
                                },
                            ],
                        },
                        {
                            class: "columns-wrap",
                            header: "Breakfast",
                            type: "excerpt",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Eget mauris pharetra et ultrices. In ante metus dictum at tempor commodo ullamcorper a. Ut sem nulla pharetra diam sit.",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    text: "Lacus sed turpis tincidunt id aliquet risus. Nulla facilisi etiam dignissim diam quis enim. Non curabitur gravida arcu ac tortor dignissim convallis aenean.",
                                },
                                { image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" }, text: "Aliquam etiam erat velit scelerisque in dictum non. Pretium fusce id velit ut tortor pretium viverra." },
                            ],
                        },
                    ],
                },
                {
                    id: "content-health-hot-topics",
                    name: "Hot Topics",
                    articles: [
                        {
                            class: "columns-2-balanced",
                            header: "This First",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Augue ut lectus arcu bibendum at varius. Cursus turpis massa tincidunt dui. Feugiat scelerisque varius morbi enim. Vel orci porta non pulvinar. Est velit egestas dui id ornare arcu odio. Amet porttitor eget dolor morbi non arcu risus quis. Turpis in eu mi bibendum neque egestas.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "new" },
                                    text: "Et pharetra pharetra massa massa. Commodo odio aenean sed adipiscing diam donec adipiscing. In mollis nunc sed id semper risus in hendrerit. A diam sollicitudin tempor id eu nisl nunc. Sit amet consectetur adipiscing elit duis tristique.",
                                    url: "#",
                                },
                            ],
                        },
                        {
                            class: "columns-2-balanced",
                            header: "This Second",
                            type: "grid",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Ac tincidunt vitae semper quis lectus nulla. Porttitor massa id neque aliquam. Sed faucibus turpis in eu mi bibendum neque egestas congue. Tincidunt id aliquet risus feugiat in ante metus. Hendrerit gravida rutrum quisque non tellus orci ac auctor augue. Augue eget arcu dictum varius duis at.",
                                    url: "#",
                                },
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    meta: { tag: "breaking" },
                                    text: "Feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam. Ipsum dolor sit amet consectetur. Non diam phasellus vestibulum lorem sed risus. Porttitor lacus luctus accumsan tortor. Morbi enim nunc faucibus a pellentesque sit amet porttitor. Vel turpis nunc eget lorem. Ligula ullamcorper malesuada proin libero.",
                                    url: "#",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "content-health-paid-content",
                    name: "Paid Content",
                    articles: [
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Eu sem integer vitae justo eget magna fermentum iaculis. Aenean pharetra magna ac placerat vestibulum lectus. Amet commodo nulla facilisi nullam.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Nullam vehicula ipsum a arcu cursus vitae congue. Enim ut tellus elementum sagittis vitae et leo duis. Nulla malesuada pellentesque elit eget.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Est velit egestas dui id ornare arcu odio. Urna nunc id cursus metus. Pellentesque adipiscing commodo elit at imperdiet dui accumsan sit. At ultrices mi tempus imperdiet nulla malesuada pellentesque elit.",
                                },
                            ],
                        },
                        {
                            class: "columns-4-balanced",
                            type: "preview",
                            content: [
                                {
                                    image: { src: "placeholder_light.jpg", alt: "Placeholder", width: "1280", height: "720" },
                                    title: "Erat imperdiet sed euismod nisi porta. Nullam ac tortor vitae purus faucibus ornare. Feugiat nisl pretium fusce id. Massa enim nec dui nunc mattis enim ut tellus elementum.",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    },
    Og = {
        data() {
            return { content: Ei, showPortal: !1 };
        },
        mounted() {
            this.showPortal = Ei[this.$route.name].notification;
        },
        methods: {
            openPortal() {
                this.showPortal = !0;
            },
            closePortal() {
                this.showPortal = !1;
            },
        },
    },
    xt = Object.assign(Og, {
        __name: "Page",
        setup(e) {
            const t = Zn();
            return (i, s) => {
                const n = Pg,
                    a = Mg;
                return (
                    B(),
                    X(
                        ce,
                        null,
                        [
                            (B(!0),
                            X(
                                ce,
                                null,
                                vt(pe(Ei)[pe(t).name].sections, (r) => (B(), we(n, { section: r }, null, 8, ["section"]))),
                                256
                            )),
                            (B(),
                            we(oc, { to: "body" }, [
                                pe(Ei)[pe(t).name].notification
                                    ? To(
                                          (B(), we(a, { key: 0, onClose: i.closePortal, onAccept: i.closePortal, onReject: i.closePortal, notification: pe(Ei)[pe(t).name].notification }, null, 8, ["onClose", "onAccept", "onReject", "notification"])),
                                          [[Wc, i.showPortal]]
                                      )
                                    : Ce("", !0),
                            ])),
                        ],
                        64
                    )
                );
            };
        },
    }),
    Lg = {
        routes: (e) => [
            { name: "home", path: "/", component: xt },
            { name: "us", path: "/us", component: xt },
            { name: "world", path: "/world", component: xt },
            { name: "politics", path: "/politics", component: xt },
            { name: "business", path: "/business", component: xt },
            { name: "opinion", path: "/opinion", component: xt },
            { name: "health", path: "/health", component: xt },
        ],
    },
    Hg = {
        scrollBehavior(e, t, i) {
            const s = Ee();
            let n = i || void 0;
            if ((!n && t && e && e.meta.scrollToTop !== !1 && Fg(t, e) && (n = { left: 0, top: 0 }), e.path === t.path)) {
                if (t.hash && !e.hash) return { left: 0, top: 0 };
                if (e.hash) return { el: e.hash, top: qr(e.hash) };
            }
            const a = (u) => !!(u.meta.pageTransition ?? vn),
                r = a(t) && a(e) ? "page:transition:finish" : "page:finish";
            return new Promise((u) => {
                s.hooks.hookOnce(r, async () => {
                    await ri(), e.hash && (n = { el: e.hash, top: qr(e.hash) }), u(n);
                });
            });
        },
    };
function qr(e) {
    try {
        const t = document.querySelector(e);
        if (t) return parseFloat(getComputedStyle(t).scrollMarginTop);
    } catch {}
    return 0;
}
function Fg(e, t) {
    const i = e.matched[0] === t.matched[0];
    return !!(!i || (i && JSON.stringify(e.params) !== JSON.stringify(t.params)));
}
const Ug = {},
    Ne = { ...Ug, ...Hg, ...Lg },
    Dg = mh(async (e) => {
        var l;
        let t, i;
        if (!((l = e.meta) != null && l.validate)) return;
        const s = Ee(),
            n = li();
        if ((([t, i] = ms(() => Promise.resolve(e.meta.validate(e)))), (t = await t), i(), t) === !0) return;
        const r = ea({ statusCode: 404, statusMessage: `Page Not Found: ${e.fullPath}` }),
            u = n.beforeResolve((o) => {
                if ((u(), o === e)) {
                    const c = n.afterEach(async () => {
                        c(), await s.runWithContext(() => Ut(r)), window.history.pushState({}, "", e.fullPath);
                    });
                    return !1;
                }
            });
    }),
    $g = [Dg],
    xi = {};
function Bg(e, t) {
    const { pathname: i, search: s, hash: n } = t,
        a = e.indexOf("#");
    if (a > -1) {
        const u = n.includes(e.slice(a)) ? e.slice(a).length : 1;
        let l = n.slice(u);
        return l[0] !== "/" && (l = "/" + l), Wa(l, "");
    }
    return Wa(i, e) + s + n;
}
const Vg = qt(
        {
            name: "nuxt:router",
            enforce: "pre",
            async setup(e) {
                var q, T;
                let t,
                    i,
                    s = Gn().app.baseURL;
                Ne.hashMode && !s.includes("#") && (s += "#");
                const n = ((q = Ne.history) == null ? void 0 : q.call(Ne, s)) ?? (Ne.hashMode ? Oh(s) : nu(s)),
                    a = ((T = Ne.routes) == null ? void 0 : T.call(Ne, yr)) ?? yr;
                let r;
                const u = Bg(s, window.location),
                    l = _p({
                        ...Ne,
                        scrollBehavior: (f, g, E) => {
                            var y;
                            if (g === Xe) {
                                r = E;
                                return;
                            }
                            return (l.options.scrollBehavior = Ne.scrollBehavior), (y = Ne.scrollBehavior) == null ? void 0 : y.call(Ne, f, Xe, r || E);
                        },
                        history: n,
                        routes: a,
                    });
                e.vueApp.use(l);
                const o = Ai(l.currentRoute.value);
                l.afterEach((f, g) => {
                    o.value = g;
                }),
                    Object.defineProperty(e.vueApp.config.globalProperties, "previousRoute", { get: () => o.value });
                const c = Ai(l.resolve(u)),
                    d = () => {
                        c.value = l.currentRoute.value;
                    };
                e.hook("page:finish", d),
                    l.afterEach((f, g) => {
                        var E, y, C, N;
                        ((y = (E = f.matched[0]) == null ? void 0 : E.components) == null ? void 0 : y.default) === ((N = (C = g.matched[0]) == null ? void 0 : C.components) == null ? void 0 : N.default) && d();
                    });
                const h = {};
                for (const f in c.value) h[f] = Te(() => c.value[f]);
                (e._route = Qe(h)), (e._middleware = e._middleware || { global: [], named: {} });
                const v = Ts();
                try {
                    ([t, i] = ms(() => l.isReady())), await t, i();
                } catch (f) {
                    ([t, i] = ms(() => e.runWithContext(() => Ut(f)))), await t, i();
                }
                const b = dh("_layout");
                return (
                    l.beforeEach(async (f, g) => {
                        var E;
                        (f.meta = Qe(f.meta)), e.isHydrating && b.value && !Nt(f.meta.layout) && (f.meta.layout = b.value), (e._processingMiddleware = !0);
                        {
                            const y = new Set([...$g, ...e._middleware.global]);
                            for (const C of f.matched) {
                                const N = C.meta.middleware;
                                if (N)
                                    if (Array.isArray(N)) for (const S of N) y.add(S);
                                    else y.add(N);
                            }
                            for (const C of y) {
                                const N = typeof C == "string" ? e._middleware.named[C] || (await ((E = xi[C]) == null ? void 0 : E.call(xi).then((P) => P.default || P))) : C;
                                if (!N) throw new Error(`Unknown route middleware: '${C}'.`);
                                const S = await e.runWithContext(() => N(f, g));
                                if (!e.payload.serverRendered && e.isHydrating && (S === !1 || S instanceof Error)) {
                                    const P = S || yn({ statusCode: 404, statusMessage: `Page Not Found: ${u}` });
                                    return await e.runWithContext(() => Ut(P)), !1;
                                }
                                if (S || S === !1) return S;
                            }
                        }
                    }),
                    l.onError(() => {
                        delete e._processingMiddleware;
                    }),
                    l.afterEach(async (f, g, E) => {
                        delete e._processingMiddleware,
                            !e.isHydrating && v.value && (await e.runWithContext(ph)),
                            f.matched.length === 0 && (await e.runWithContext(() => Ut(yn({ statusCode: 404, fatal: !1, statusMessage: `Page not found: ${f.fullPath}` }))));
                    }),
                    e.hooks.hookOnce("app:created", async () => {
                        try {
                            await l.replace({ ...l.resolve(u), name: void 0, force: !0 }), (l.options.scrollBehavior = Ne.scrollBehavior);
                        } catch (f) {
                            await e.runWithContext(() => Ut(f));
                        }
                    }),
                    { provide: { router: l } }
                );
            },
        },
        1
    ),
    Dt = { default: () => Yn(() => import("./default.ef6e7e54.js"), ["./default.ef6e7e54.js", "./nuxt-link.61fa2917.js", "./default.ad23962f.css"], import.meta.url).then((e) => e.default || e) },
    Wg = qt({
        name: "nuxt:prefetch",
        setup(e) {
            const t = li();
            e.hooks.hook("app:mounted", () => {
                t.beforeEach(async (i) => {
                    var n;
                    const s = (n = i == null ? void 0 : i.meta) == null ? void 0 : n.layout;
                    s && typeof Dt[s] == "function" && (await Dt[s]());
                });
            }),
                e.hooks.hook("link:prefetch", (i) => {
                    var r, u, l, o;
                    if (Hi(i)) return;
                    const s = t.resolve(i);
                    if (!s) return;
                    const n = (r = s == null ? void 0 : s.meta) == null ? void 0 : r.layout;
                    let a = Array.isArray((u = s == null ? void 0 : s.meta) == null ? void 0 : u.middleware) ? ((l = s == null ? void 0 : s.meta) == null ? void 0 : l.middleware) : [(o = s == null ? void 0 : s.meta) == null ? void 0 : o.middleware];
                    a = a.filter((c) => typeof c == "string");
                    for (const c of a) typeof xi[c] == "function" && xi[c]();
                    n && typeof Dt[n] == "function" && Dt[n]();
                });
        },
    }),
    Kg = qt({
        name: "nuxt:chunk-reload",
        setup(e) {
            const t = li(),
                i = Gn(),
                s = new Set();
            t.beforeEach(() => {
                s.clear();
            }),
                e.hook("app:chunkError", ({ error: n }) => {
                    s.add(n);
                }),
                t.onError((n, a) => {
                    if (s.has(n)) {
                        const u = "href" in a && a.href.startsWith("#") ? i.app.baseURL + a.href : Fi(i.app.baseURL, a.fullPath);
                        Ig({ path: u, persistState: !0 });
                    }
                });
        },
    }),
    Qg = qt({
        name: "nuxt:payload",
        setup(e) {
            nh() &&
                (e.hooks.hook("link:prefetch", async (t) => {
                    ks(t).protocol || (await tr(t));
                }),
                li().beforeResolve(async (t, i) => {
                    if (t.path === i.path) return;
                    const s = await tr(t.path);
                    s && Object.assign(e.static.data, s.data);
                }));
        },
    }),
    zg = [fh, vh, bh, Vg, Wg, Kg, Qg],
    Jg = (e, t) =>
        t.path
            .replace(/(:\w+)\([^)]+\)/g, "$1")
            .replace(/(:\w+)[?+*]/g, "$1")
            .replace(/:\w+/g, (i) => {
                var s;
                return ((s = e.params[i.slice(1)]) == null ? void 0 : s.toString()) || "";
            }),
    Gg = (e, t) => {
        const i = e.route.matched.find((n) => {
                var a;
                return ((a = n.components) == null ? void 0 : a.default) === e.Component.type;
            }),
            s = t ?? (i == null ? void 0 : i.meta.key) ?? (i && Jg(e.route, i));
        return typeof s == "function" ? s(e.route) : s;
    },
    Yg = (e, t) => ({ default: () => (e ? tt(Oo, e === !0 ? {} : e, t) : t) }),
    xn = (e, t, i) => (
        (t = t === !0 ? {} : t),
        {
            default: () => {
                var s;
                return t ? tt(e, t, i) : (s = i.default) == null ? void 0 : s.call(i);
            },
        }
    ),
    Xg = Mt({
        name: "NuxtPage",
        inheritAttrs: !1,
        props: { name: { type: String }, transition: { type: [Boolean, Object], default: void 0 }, keepalive: { type: [Boolean, Object], default: void 0 }, route: { type: Object }, pageKey: { type: [Function, String], default: null } },
        setup(e, { attrs: t }) {
            const i = Ee();
            return () =>
                tt(
                    hu,
                    { name: e.name, route: e.route, ...t },
                    {
                        default: (s) => {
                            if (!s.Component) return;
                            const n = Gg(s, e.pageKey),
                                a = i.deferHydration(),
                                r = !!(e.transition ?? s.route.meta.pageTransition ?? vn),
                                u =
                                    r &&
                                    ef(
                                        [
                                            e.transition,
                                            s.route.meta.pageTransition,
                                            vn,
                                            {
                                                onAfterLeave: () => {
                                                    i.callHook("page:transition:finish", s.Component);
                                                },
                                            },
                                        ].filter(Boolean)
                                    );
                            return xn(
                                As,
                                r && u,
                                Yg(
                                    e.keepalive ?? s.route.meta.keepalive ?? eh,
                                    tt(
                                        il,
                                        {
                                            suspensible: !0,
                                            onPending: () => i.callHook("page:start", s.Component),
                                            onResolve: () => {
                                                ri(() => i.callHook("page:finish", s.Component).finally(a));
                                            },
                                        },
                                        { default: () => tt(tf, { key: n, routeProps: s, pageKey: n, hasTransition: r }) }
                                    )
                                )
                            ).default();
                        },
                    }
                );
        },
    });
function Zg(e) {
    return Array.isArray(e) ? e : e ? [e] : [];
}
function ef(e) {
    const t = e.map((i) => ({ ...i, onAfterLeave: Zg(i.onAfterLeave) }));
    return uh(...t);
}
const tf = Mt({
        name: "RouteProvider",
        props: ["routeProps", "pageKey", "hasTransition"],
        setup(e) {
            const t = e.pageKey,
                i = e.routeProps.route,
                s = {};
            for (const n in e.routeProps.route) s[n] = Te(() => (t === e.pageKey ? e.routeProps.route[n] : i[n]));
            return zt("_route", Qe(s)), () => tt(e.routeProps.Component);
        },
    }),
    sf = Mt({
        name: "LayoutLoader",
        inheritAttrs: !1,
        props: { name: String },
        async setup(e, t) {
            const i = await Dt[e.name]().then((s) => s.default || s);
            return () => tt(i, t.attrs, t.slots);
        },
    }),
    nf = Mt({
        name: "NuxtLayout",
        inheritAttrs: !1,
        props: { name: { type: [String, Boolean, Object], default: null } },
        setup(e, t) {
            const i = Le("_route"),
                s = i === Zn() ? qp() : i,
                n = Te(() => pe(e.name) ?? s.meta.layout ?? "default");
            return () => {
                const a = n.value && n.value in Dt,
                    r = s.meta.layoutTransition ?? Zm;
                return xn(As, a && r, { default: () => xn(sf, a && { key: n.value, name: n.value, ...t.attrs }, t.slots).default() }).default();
            };
        },
    }),
    af = de("div", { id: "settings-container" }, null, -1),
    rf = de("div", { id: "notifications-container" }, null, -1),
    lf = {
        __name: "app",
        setup(e) {
            return (
                Ym({
                    title: "The Daily Broadcast",
                    htmlAttrs: { lang: "en" },
                    meta: [{ charset: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }, { hid: "description", name: "description", content: "A news site developed with Nuxt." }],
                }),
                (t, i) => {
                    const s = Xg,
                        n = nf;
                    return B(), X(ce, null, [Z(n, null, { default: Ps(() => [Z(s)]), _: 1 }), af, rf], 64);
                }
            );
        },
    },
    wr = {
        __name: "nuxt-root",
        setup(e) {
            const t = Mo(() => Yn(() => import("./error-component.3737a0e9.js"), [], import.meta.url).then((l) => l.default || l)),
                i = () => null,
                s = Ee(),
                n = s.deferHydration(),
                a = !1;
            zt("_route", Zn()), s.hooks.callHookWith((l) => l.map((o) => o()), "vue:setup");
            const r = Ts();
            hl((l, o, c) => {
                if ((s.hooks.callHook("vue:error", l, o, c).catch((d) => console.error("[nuxt] Error in `vue:error` hook", d)), gh(l) && (l.fatal || l.unhandled))) return s.runWithContext(() => Ut(l)), !1;
            });
            const { islandContext: u } = !1;
            return (l, o) => (
                B(),
                we(
                    il,
                    { onResolve: pe(n) },
                    {
                        default: Ps(() => [
                            pe(r)
                                ? (B(), we(pe(t), { key: 0, error: pe(r) }, null, 8, ["error"]))
                                : pe(u)
                                ? (B(), we(pe(i), { key: 1, context: pe(u) }, null, 8, ["context"]))
                                : pe(a)
                                ? (B(), we(gl(pe(a)), { key: 2 }))
                                : (B(), we(pe(lf), { key: 3 })),
                        ]),
                        _: 1,
                    },
                    8,
                    ["onResolve"]
                )
            );
        },
    };
globalThis.$fetch || (globalThis.$fetch = Id.create({ baseURL: Ld() }));
let Pr;
const uf = Zd(zg);
{
    let e;
    (Pr = async function () {
        var a, r;
        if (e) return e;
        const s = ((a = window.__NUXT__) != null && a.serverRendered) || ((r = document.getElementById("__NUXT_DATA__")) == null ? void 0 : r.dataset.ssr) === "true" ? Jc(wr) : zc(wr),
            n = Gd({ vueApp: s });
        try {
            await Xd(n, uf);
        } catch (u) {
            await n.callHook("app:error", u), (n.payload.error = n.payload.error || u);
        }
        try {
            await n.hooks.callHook("app:created", s), await n.hooks.callHook("app:beforeMount", s), s.mount("#" + th), await n.hooks.callHook("app:mounted", s), await ri();
        } catch (u) {
            await n.callHook("app:error", u), (n.payload.error = n.payload.error || u);
        }
        return s;
    }),
        (e = Pr().catch((t) => {
            console.error("Error while mounting app:", t);
        }));
}
export {
    Ym as A,
    cf as B,
    df as C,
    Ee as D,
    li as E,
    ce as F,
    Mt as G,
    Te as H,
    Hi as I,
    rt as J,
    $n as K,
    xs as L,
    tt as M,
    mf as N,
    ks as O,
    cd as P,
    vd as Q,
    Fl as R,
    oc as T,
    Yn as _,
    Je as a,
    X as b,
    we as c,
    Mo as d,
    de as e,
    Z as f,
    dc as g,
    te as h,
    Qn as i,
    Ei as j,
    vt as k,
    Ce as l,
    Zn as m,
    of as n,
    B as o,
    Ag as p,
    pf as q,
    hf as r,
    na as s,
    kt as t,
    pe as u,
    To as v,
    Ps as w,
    Wc as x,
    Qt as y,
    ri as z,
};
