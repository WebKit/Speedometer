function ascending$1(a2, b) {
  return a2 == null || b == null ? NaN : a2 < b ? -1 : a2 > b ? 1 : a2 >= b ? 0 : NaN;
}
function descending(a2, b) {
  return a2 == null || b == null ? NaN : b < a2 ? -1 : b > a2 ? 1 : b >= a2 ? 0 : NaN;
}
function bisector(f) {
  let compare1, compare2, delta;
  if (f.length !== 2) {
    compare1 = ascending$1;
    compare2 = (d, x) => ascending$1(f(d), x);
    delta = (d, x) => f(d) - x;
  } else {
    compare1 = f === ascending$1 || f === descending ? f : zero$1;
    compare2 = f;
    delta = f;
  }
  function left2(a2, x, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0)
        return hi;
      do {
        const mid2 = lo + hi >>> 1;
        if (compare2(a2[mid2], x) < 0)
          lo = mid2 + 1;
        else
          hi = mid2;
      } while (lo < hi);
    }
    return lo;
  }
  function right2(a2, x, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0)
        return hi;
      do {
        const mid2 = lo + hi >>> 1;
        if (compare2(a2[mid2], x) <= 0)
          lo = mid2 + 1;
        else
          hi = mid2;
      } while (lo < hi);
    }
    return lo;
  }
  function center2(a2, x, lo = 0, hi = a2.length) {
    const i = left2(a2, x, lo, hi - 1);
    return i > lo && delta(a2[i - 1], x) > -delta(a2[i], x) ? i - 1 : i;
  }
  return { left: left2, center: center2, right: right2 };
}
function zero$1() {
  return 0;
}
function number$4(x) {
  return x === null ? NaN : +x;
}
function* numbers(values2, valueof2) {
  if (valueof2 === void 0) {
    for (let value of values2) {
      if (value != null && (value = +value) >= value) {
        yield value;
      }
    }
  } else {
    let index2 = -1;
    for (let value of values2) {
      if ((value = valueof2(value, ++index2, values2)) != null && (value = +value) >= value) {
        yield value;
      }
    }
  }
}
const ascendingBisect = bisector(ascending$1);
const bisectRight = ascendingBisect.right;
bisector(number$4).center;
const bisect = bisectRight;
function length$1(array2) {
  return array2.length | 0;
}
function empty$1(length2) {
  return !(length2 > 0);
}
function arrayify$1(values2) {
  return typeof values2 !== "object" || "length" in values2 ? values2 : Array.from(values2);
}
function reducer(reduce) {
  return (values2) => reduce(...values2);
}
function cross(...values2) {
  const reduce = typeof values2[values2.length - 1] === "function" && reducer(values2.pop());
  values2 = values2.map(arrayify$1);
  const lengths = values2.map(length$1);
  const j = values2.length - 1;
  const index2 = new Array(j + 1).fill(0);
  const product = [];
  if (j < 0 || lengths.some(empty$1))
    return product;
  while (true) {
    product.push(index2.map((j2, i2) => values2[i2][j2]));
    let i = j;
    while (++index2[i] === lengths[i]) {
      if (i === 0)
        return reduce ? product.map(reduce) : product;
      index2[i--] = 0;
    }
  }
}
function cumsum(values2, valueof2) {
  var sum2 = 0, index2 = 0;
  return Float64Array.from(values2, valueof2 === void 0 ? (v) => sum2 += +v || 0 : (v) => sum2 += +valueof2(v, index2++, values2) || 0);
}
function variance(values2, valueof2) {
  let count = 0;
  let delta;
  let mean2 = 0;
  let sum2 = 0;
  if (valueof2 === void 0) {
    for (let value of values2) {
      if (value != null && (value = +value) >= value) {
        delta = value - mean2;
        mean2 += delta / ++count;
        sum2 += delta * (value - mean2);
      }
    }
  } else {
    let index2 = -1;
    for (let value of values2) {
      if ((value = valueof2(value, ++index2, values2)) != null && (value = +value) >= value) {
        delta = value - mean2;
        mean2 += delta / ++count;
        sum2 += delta * (value - mean2);
      }
    }
  }
  if (count > 1)
    return sum2 / (count - 1);
}
function deviation(values2, valueof2) {
  const v = variance(values2, valueof2);
  return v ? Math.sqrt(v) : v;
}
function extent$1(values2, valueof2) {
  let min2;
  let max2;
  if (valueof2 === void 0) {
    for (const value of values2) {
      if (value != null) {
        if (min2 === void 0) {
          if (value >= value)
            min2 = max2 = value;
        } else {
          if (min2 > value)
            min2 = value;
          if (max2 < value)
            max2 = value;
        }
      }
    }
  } else {
    let index2 = -1;
    for (let value of values2) {
      if ((value = valueof2(value, ++index2, values2)) != null) {
        if (min2 === void 0) {
          if (value >= value)
            min2 = max2 = value;
        } else {
          if (min2 > value)
            min2 = value;
          if (max2 < value)
            max2 = value;
        }
      }
    }
  }
  return [min2, max2];
}
class Adder {
  constructor() {
    this._partials = new Float64Array(32);
    this._n = 0;
  }
  add(x) {
    const p = this._partials;
    let i = 0;
    for (let j = 0; j < this._n && j < 32; j++) {
      const y = p[j], hi = x + y, lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
      if (lo)
        p[i++] = lo;
      x = hi;
    }
    p[i] = x;
    this._n = i + 1;
    return this;
  }
  valueOf() {
    const p = this._partials;
    let n = this._n, x, y, lo, hi = 0;
    if (n > 0) {
      hi = p[--n];
      while (n > 0) {
        x = hi;
        y = p[--n];
        hi = x + y;
        lo = y - (hi - x);
        if (lo)
          break;
      }
      if (n > 0 && (lo < 0 && p[n - 1] < 0 || lo > 0 && p[n - 1] > 0)) {
        y = lo * 2;
        x = hi + y;
        if (y == x - hi)
          hi = x;
      }
    }
    return hi;
  }
}
class InternMap extends Map {
  constructor(entries, key = keyof) {
    super();
    Object.defineProperties(this, { _intern: { value: /* @__PURE__ */ new Map() }, _key: { value: key } });
    if (entries != null)
      for (const [key2, value] of entries)
        this.set(key2, value);
  }
  get(key) {
    return super.get(intern_get(this, key));
  }
  has(key) {
    return super.has(intern_get(this, key));
  }
  set(key, value) {
    return super.set(intern_set(this, key), value);
  }
  delete(key) {
    return super.delete(intern_delete(this, key));
  }
}
class InternSet extends Set {
  constructor(values2, key = keyof) {
    super();
    Object.defineProperties(this, { _intern: { value: /* @__PURE__ */ new Map() }, _key: { value: key } });
    if (values2 != null)
      for (const value of values2)
        this.add(value);
  }
  has(value) {
    return super.has(intern_get(this, value));
  }
  add(value) {
    return super.add(intern_set(this, value));
  }
  delete(value) {
    return super.delete(intern_delete(this, value));
  }
}
function intern_get({ _intern, _key }, value) {
  const key = _key(value);
  return _intern.has(key) ? _intern.get(key) : value;
}
function intern_set({ _intern, _key }, value) {
  const key = _key(value);
  if (_intern.has(key))
    return _intern.get(key);
  _intern.set(key, value);
  return value;
}
function intern_delete({ _intern, _key }, value) {
  const key = _key(value);
  if (_intern.has(key)) {
    value = _intern.get(key);
    _intern.delete(key);
  }
  return value;
}
function keyof(value) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}
function identity$8(x) {
  return x;
}
function group(values2, ...keys) {
  return nest(values2, identity$8, identity$8, keys);
}
function groups(values2, ...keys) {
  return nest(values2, Array.from, identity$8, keys);
}
function rollup(values2, reduce, ...keys) {
  return nest(values2, identity$8, reduce, keys);
}
function index(values2, ...keys) {
  return nest(values2, identity$8, unique, keys);
}
function unique(values2) {
  if (values2.length !== 1)
    throw new Error("duplicate key");
  return values2[0];
}
function nest(values2, map2, reduce, keys) {
  return function regroup(values3, i) {
    if (i >= keys.length)
      return reduce(values3);
    const groups2 = new InternMap();
    const keyof2 = keys[i++];
    let index2 = -1;
    for (const value of values3) {
      const key = keyof2(value, ++index2, values3);
      const group2 = groups2.get(key);
      if (group2)
        group2.push(value);
      else
        groups2.set(key, [value]);
    }
    for (const [key, values4] of groups2) {
      groups2.set(key, regroup(values4, i));
    }
    return map2(groups2);
  }(values2, 0);
}
function permute(source, keys) {
  return Array.from(keys, (key) => source[key]);
}
function sort$1(values2, ...F) {
  if (typeof values2[Symbol.iterator] !== "function")
    throw new TypeError("values is not iterable");
  values2 = Array.from(values2);
  let [f] = F;
  if (f && f.length !== 2 || F.length > 1) {
    const index2 = Uint32Array.from(values2, (d, i) => i);
    if (F.length > 1) {
      F = F.map((f2) => values2.map(f2));
      index2.sort((i, j) => {
        for (const f2 of F) {
          const c2 = ascendingDefined$1(f2[i], f2[j]);
          if (c2)
            return c2;
        }
      });
    } else {
      f = values2.map(f);
      index2.sort((i, j) => ascendingDefined$1(f[i], f[j]));
    }
    return permute(values2, index2);
  }
  return values2.sort(compareDefined(f));
}
function compareDefined(compare = ascending$1) {
  if (compare === ascending$1)
    return ascendingDefined$1;
  if (typeof compare !== "function")
    throw new TypeError("compare is not a function");
  return (a2, b) => {
    const x = compare(a2, b);
    if (x || x === 0)
      return x;
    return (compare(b, b) === 0) - (compare(a2, a2) === 0);
  };
}
function ascendingDefined$1(a2, b) {
  return (a2 == null || !(a2 >= a2)) - (b == null || !(b >= b)) || (a2 < b ? -1 : a2 > b ? 1 : 0);
}
function groupSort(values2, reduce, key) {
  return (reduce.length !== 2 ? sort$1(rollup(values2, reduce, key), ([ak, av], [bk, bv]) => ascending$1(av, bv) || ascending$1(ak, bk)) : sort$1(group(values2, key), ([ak, av], [bk, bv]) => reduce(av, bv) || ascending$1(ak, bk))).map(([key2]) => key2);
}
const e10 = Math.sqrt(50), e5 = Math.sqrt(10), e2 = Math.sqrt(2);
function tickSpec(start2, stop, count) {
  const step = (stop - start2) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
  let i1, i2, inc;
  if (power < 0) {
    inc = Math.pow(10, -power) / factor;
    i1 = Math.round(start2 * inc);
    i2 = Math.round(stop * inc);
    if (i1 / inc < start2)
      ++i1;
    if (i2 / inc > stop)
      --i2;
    inc = -inc;
  } else {
    inc = Math.pow(10, power) * factor;
    i1 = Math.round(start2 / inc);
    i2 = Math.round(stop / inc);
    if (i1 * inc < start2)
      ++i1;
    if (i2 * inc > stop)
      --i2;
  }
  if (i2 < i1 && 0.5 <= count && count < 2)
    return tickSpec(start2, stop, count * 2);
  return [i1, i2, inc];
}
function ticks(start2, stop, count) {
  stop = +stop, start2 = +start2, count = +count;
  if (!(count > 0))
    return [];
  if (start2 === stop)
    return [start2];
  const reverse2 = stop < start2, [i1, i2, inc] = reverse2 ? tickSpec(stop, start2, count) : tickSpec(start2, stop, count);
  if (!(i2 >= i1))
    return [];
  const n = i2 - i1 + 1, ticks2 = new Array(n);
  if (reverse2) {
    if (inc < 0)
      for (let i = 0; i < n; ++i)
        ticks2[i] = (i2 - i) / -inc;
    else
      for (let i = 0; i < n; ++i)
        ticks2[i] = (i2 - i) * inc;
  } else {
    if (inc < 0)
      for (let i = 0; i < n; ++i)
        ticks2[i] = (i1 + i) / -inc;
    else
      for (let i = 0; i < n; ++i)
        ticks2[i] = (i1 + i) * inc;
  }
  return ticks2;
}
function tickIncrement(start2, stop, count) {
  stop = +stop, start2 = +start2, count = +count;
  return tickSpec(start2, stop, count)[2];
}
function tickStep(start2, stop, count) {
  stop = +stop, start2 = +start2, count = +count;
  const reverse2 = stop < start2, inc = reverse2 ? tickIncrement(stop, start2, count) : tickIncrement(start2, stop, count);
  return (reverse2 ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
}
function max(values2, valueof2) {
  let max2;
  if (valueof2 === void 0) {
    for (const value of values2) {
      if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
        max2 = value;
      }
    }
  } else {
    let index2 = -1;
    for (let value of values2) {
      if ((value = valueof2(value, ++index2, values2)) != null && (max2 < value || max2 === void 0 && value >= value)) {
        max2 = value;
      }
    }
  }
  return max2;
}
function maxIndex(values2, valueof2) {
  let max2;
  let maxIndex2 = -1;
  let index2 = -1;
  if (valueof2 === void 0) {
    for (const value of values2) {
      ++index2;
      if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
        max2 = value, maxIndex2 = index2;
      }
    }
  } else {
    for (let value of values2) {
      if ((value = valueof2(value, ++index2, values2)) != null && (max2 < value || max2 === void 0 && value >= value)) {
        max2 = value, maxIndex2 = index2;
      }
    }
  }
  return maxIndex2;
}
function min$1(values2, valueof2) {
  let min2;
  if (valueof2 === void 0) {
    for (const value of values2) {
      if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
        min2 = value;
      }
    }
  } else {
    let index2 = -1;
    for (let value of values2) {
      if ((value = valueof2(value, ++index2, values2)) != null && (min2 > value || min2 === void 0 && value >= value)) {
        min2 = value;
      }
    }
  }
  return min2;
}
function minIndex(values2, valueof2) {
  let min2;
  let minIndex2 = -1;
  let index2 = -1;
  if (valueof2 === void 0) {
    for (const value of values2) {
      ++index2;
      if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
        min2 = value, minIndex2 = index2;
      }
    }
  } else {
    for (let value of values2) {
      if ((value = valueof2(value, ++index2, values2)) != null && (min2 > value || min2 === void 0 && value >= value)) {
        min2 = value, minIndex2 = index2;
      }
    }
  }
  return minIndex2;
}
function quickselect(array2, k2, left2 = 0, right2 = Infinity, compare) {
  k2 = Math.floor(k2);
  left2 = Math.floor(Math.max(0, left2));
  right2 = Math.floor(Math.min(array2.length - 1, right2));
  if (!(left2 <= k2 && k2 <= right2))
    return array2;
  compare = compare === void 0 ? ascendingDefined$1 : compareDefined(compare);
  while (right2 > left2) {
    if (right2 - left2 > 600) {
      const n = right2 - left2 + 1;
      const m = k2 - left2 + 1;
      const z = Math.log(n);
      const s2 = 0.5 * Math.exp(2 * z / 3);
      const sd = 0.5 * Math.sqrt(z * s2 * (n - s2) / n) * (m - n / 2 < 0 ? -1 : 1);
      const newLeft = Math.max(left2, Math.floor(k2 - m * s2 / n + sd));
      const newRight = Math.min(right2, Math.floor(k2 + (n - m) * s2 / n + sd));
      quickselect(array2, k2, newLeft, newRight, compare);
    }
    const t = array2[k2];
    let i = left2;
    let j = right2;
    swap(array2, left2, k2);
    if (compare(array2[right2], t) > 0)
      swap(array2, left2, right2);
    while (i < j) {
      swap(array2, i, j), ++i, --j;
      while (compare(array2[i], t) < 0)
        ++i;
      while (compare(array2[j], t) > 0)
        --j;
    }
    if (compare(array2[left2], t) === 0)
      swap(array2, left2, j);
    else
      ++j, swap(array2, j, right2);
    if (j <= k2)
      left2 = j + 1;
    if (k2 <= j)
      right2 = j - 1;
  }
  return array2;
}
function swap(array2, i, j) {
  const t = array2[i];
  array2[i] = array2[j];
  array2[j] = t;
}
function greatest(values2, compare = ascending$1) {
  let max2;
  let defined2 = false;
  if (compare.length === 1) {
    let maxValue;
    for (const element of values2) {
      const value = compare(element);
      if (defined2 ? ascending$1(value, maxValue) > 0 : ascending$1(value, value) === 0) {
        max2 = element;
        maxValue = value;
        defined2 = true;
      }
    }
  } else {
    for (const value of values2) {
      if (defined2 ? compare(value, max2) > 0 : compare(value, value) === 0) {
        max2 = value;
        defined2 = true;
      }
    }
  }
  return max2;
}
function quantile$1(values2, p, valueof2) {
  values2 = Float64Array.from(numbers(values2, valueof2));
  if (!(n = values2.length) || isNaN(p = +p))
    return;
  if (p <= 0 || n < 2)
    return min$1(values2);
  if (p >= 1)
    return max(values2);
  var n, i = (n - 1) * p, i0 = Math.floor(i), value0 = max(quickselect(values2, i0).subarray(0, i0 + 1)), value1 = min$1(values2.subarray(i0 + 1));
  return value0 + (value1 - value0) * (i - i0);
}
function quantileSorted(values2, p, valueof2 = number$4) {
  if (!(n = values2.length) || isNaN(p = +p))
    return;
  if (p <= 0 || n < 2)
    return +valueof2(values2[0], 0, values2);
  if (p >= 1)
    return +valueof2(values2[n - 1], n - 1, values2);
  var n, i = (n - 1) * p, i0 = Math.floor(i), value0 = +valueof2(values2[i0], i0, values2), value1 = +valueof2(values2[i0 + 1], i0 + 1, values2);
  return value0 + (value1 - value0) * (i - i0);
}
function mean(values2, valueof2) {
  let count = 0;
  let sum2 = 0;
  if (valueof2 === void 0) {
    for (let value of values2) {
      if (value != null && (value = +value) >= value) {
        ++count, sum2 += value;
      }
    }
  } else {
    let index2 = -1;
    for (let value of values2) {
      if ((value = valueof2(value, ++index2, values2)) != null && (value = +value) >= value) {
        ++count, sum2 += value;
      }
    }
  }
  if (count)
    return sum2 / count;
}
function median(values2, valueof2) {
  return quantile$1(values2, 0.5, valueof2);
}
function* flatten(arrays) {
  for (const array2 of arrays) {
    yield* array2;
  }
}
function merge(arrays) {
  return Array.from(flatten(arrays));
}
function mode(values2, valueof2) {
  const counts = new InternMap();
  if (valueof2 === void 0) {
    for (let value of values2) {
      if (value != null && value >= value) {
        counts.set(value, (counts.get(value) || 0) + 1);
      }
    }
  } else {
    let index2 = -1;
    for (let value of values2) {
      if ((value = valueof2(value, ++index2, values2)) != null && value >= value) {
        counts.set(value, (counts.get(value) || 0) + 1);
      }
    }
  }
  let modeValue;
  let modeCount = 0;
  for (const [value, count] of counts) {
    if (count > modeCount) {
      modeCount = count;
      modeValue = value;
    }
  }
  return modeValue;
}
function range$1(start2, stop, step) {
  start2 = +start2, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start2, start2 = 0, 1) : n < 3 ? 1 : +step;
  var i = -1, n = Math.max(0, Math.ceil((stop - start2) / step)) | 0, range2 = new Array(n);
  while (++i < n) {
    range2[i] = start2 + i * step;
  }
  return range2;
}
function sum(values2, valueof2) {
  let sum2 = 0;
  if (valueof2 === void 0) {
    for (let value of values2) {
      if (value = +value) {
        sum2 += value;
      }
    }
  } else {
    let index2 = -1;
    for (let value of values2) {
      if (value = +valueof2(value, ++index2, values2)) {
        sum2 += value;
      }
    }
  }
  return sum2;
}
function reverse(values2) {
  if (typeof values2[Symbol.iterator] !== "function")
    throw new TypeError("values is not iterable");
  return Array.from(values2).reverse();
}
function identity$7(x) {
  return x;
}
var top = 1, right = 2, bottom = 3, left = 4, epsilon$2 = 1e-6;
function translateX(x) {
  return "translate(" + x + ",0)";
}
function translateY(y) {
  return "translate(0," + y + ")";
}
function number$3(scale) {
  return (d) => +scale(d);
}
function center(scale, offset2) {
  offset2 = Math.max(0, scale.bandwidth() - offset2 * 2) / 2;
  if (scale.round())
    offset2 = Math.round(offset2);
  return (d) => +scale(d) + offset2;
}
function entering() {
  return !this.__axis;
}
function axis(orient, scale) {
  var tickArguments = [], tickValues = null, tickFormat2 = null, tickSizeInner = 6, tickSizeOuter = 6, tickPadding = 3, offset2 = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5, k2 = orient === top || orient === left ? -1 : 1, x = orient === left || orient === right ? "x" : "y", transform = orient === top || orient === bottom ? translateX : translateY;
  function axis2(context) {
    var values2 = tickValues == null ? scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain() : tickValues, format2 = tickFormat2 == null ? scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity$7 : tickFormat2, spacing = Math.max(tickSizeInner, 0) + tickPadding, range2 = scale.range(), range0 = +range2[0] + offset2, range1 = +range2[range2.length - 1] + offset2, position2 = (scale.bandwidth ? center : number$3)(scale.copy(), offset2), selection2 = context.selection ? context.selection() : context, path = selection2.selectAll(".domain").data([null]), tick = selection2.selectAll(".tick").data(values2, scale).order(), tickExit = tick.exit(), tickEnter = tick.enter().append("g").attr("class", "tick"), line = tick.select("line"), text2 = tick.select("text");
    path = path.merge(path.enter().insert("path", ".tick").attr("class", "domain").attr("stroke", "currentColor"));
    tick = tick.merge(tickEnter);
    line = line.merge(tickEnter.append("line").attr("stroke", "currentColor").attr(x + "2", k2 * tickSizeInner));
    text2 = text2.merge(tickEnter.append("text").attr("fill", "currentColor").attr(x, k2 * spacing).attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));
    if (context !== selection2) {
      path = path.transition(context);
      tick = tick.transition(context);
      line = line.transition(context);
      text2 = text2.transition(context);
      tickExit = tickExit.transition(context).attr("opacity", epsilon$2).attr("transform", function(d) {
        return isFinite(d = position2(d)) ? transform(d + offset2) : this.getAttribute("transform");
      });
      tickEnter.attr("opacity", epsilon$2).attr("transform", function(d) {
        var p = this.parentNode.__axis;
        return transform((p && isFinite(p = p(d)) ? p : position2(d)) + offset2);
      });
    }
    tickExit.remove();
    path.attr("d", orient === left || orient === right ? tickSizeOuter ? "M" + k2 * tickSizeOuter + "," + range0 + "H" + offset2 + "V" + range1 + "H" + k2 * tickSizeOuter : "M" + offset2 + "," + range0 + "V" + range1 : tickSizeOuter ? "M" + range0 + "," + k2 * tickSizeOuter + "V" + offset2 + "H" + range1 + "V" + k2 * tickSizeOuter : "M" + range0 + "," + offset2 + "H" + range1);
    tick.attr("opacity", 1).attr("transform", function(d) {
      return transform(position2(d) + offset2);
    });
    line.attr(x + "2", k2 * tickSizeInner);
    text2.attr(x, k2 * spacing).text(format2);
    selection2.filter(entering).attr("fill", "none").attr("font-size", 10).attr("font-family", "sans-serif").attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");
    selection2.each(function() {
      this.__axis = position2;
    });
  }
  axis2.scale = function(_) {
    return arguments.length ? (scale = _, axis2) : scale;
  };
  axis2.ticks = function() {
    return tickArguments = Array.from(arguments), axis2;
  };
  axis2.tickArguments = function(_) {
    return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis2) : tickArguments.slice();
  };
  axis2.tickValues = function(_) {
    return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis2) : tickValues && tickValues.slice();
  };
  axis2.tickFormat = function(_) {
    return arguments.length ? (tickFormat2 = _, axis2) : tickFormat2;
  };
  axis2.tickSize = function(_) {
    return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis2) : tickSizeInner;
  };
  axis2.tickSizeInner = function(_) {
    return arguments.length ? (tickSizeInner = +_, axis2) : tickSizeInner;
  };
  axis2.tickSizeOuter = function(_) {
    return arguments.length ? (tickSizeOuter = +_, axis2) : tickSizeOuter;
  };
  axis2.tickPadding = function(_) {
    return arguments.length ? (tickPadding = +_, axis2) : tickPadding;
  };
  axis2.offset = function(_) {
    return arguments.length ? (offset2 = +_, axis2) : offset2;
  };
  return axis2;
}
function axisBottom(scale) {
  return axis(bottom, scale);
}
var noop$1 = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t))
      throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames$1(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0)
      name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t))
      throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames$1(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n)
        if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name)))
          return t;
      return;
    }
    if (callback != null && typeof callback !== "function")
      throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type)
        _[t] = set$1(_[t], typename.name, callback);
      else if (callback == null)
        for (t in _)
          _[t] = set$1(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy2 = {}, _ = this._;
    for (var t in _)
      copy2[t] = _[t].slice();
    return new Dispatch(copy2);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0)
      for (var args = new Array(n), i = 0, n, t; i < n; ++i)
        args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type))
      throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i)
      t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type))
      throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i)
      t[i].value.apply(that, args);
  }
};
function get$1(type, name) {
  for (var i = 0, n = type.length, c2; i < n; ++i) {
    if ((c2 = type[i]).name === name) {
      return c2.value;
    }
  }
}
function set$1(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop$1, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null)
    type.push({ name, value: callback });
  return type;
}
var xhtml = "http://www.w3.org/1999/xhtml";
const namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function namespace(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns")
    name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? { space: namespaces[prefix], local: name } : name;
}
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator(name) {
  var fullname = namespace(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}
function none() {
}
function selector(selector2) {
  return selector2 == null ? none : function() {
    return this.querySelector(selector2);
  };
}
function selection_select(select2) {
  if (typeof select2 !== "function")
    select2 = selector(select2);
  for (var groups2 = this._groups, m = groups2.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group2 = groups2[j], n = group2.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group2[i]) && (subnode = select2.call(node, node.__data__, i, group2))) {
        if ("__data__" in node)
          subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}
function array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}
function empty() {
  return [];
}
function selectorAll(selector2) {
  return selector2 == null ? empty : function() {
    return this.querySelectorAll(selector2);
  };
}
function arrayAll(select2) {
  return function() {
    return array(select2.apply(this, arguments));
  };
}
function selection_selectAll(select2) {
  if (typeof select2 === "function")
    select2 = arrayAll(select2);
  else
    select2 = selectorAll(select2);
  for (var groups2 = this._groups, m = groups2.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group2 = groups2[j], n = group2.length, node, i = 0; i < n; ++i) {
      if (node = group2[i]) {
        subgroups.push(select2.call(node, node.__data__, i, group2));
        parents.push(node);
      }
    }
  }
  return new Selection$1(subgroups, parents);
}
function matcher(selector2) {
  return function() {
    return this.matches(selector2);
  };
}
function childMatcher(selector2) {
  return function(node) {
    return node.matches(selector2);
  };
}
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selection_selectChild(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}
var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selection_selectChildren(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}
function selection_filter(match) {
  if (typeof match !== "function")
    match = matcher(match);
  for (var groups2 = this._groups, m = groups2.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group2 = groups2[j], n = group2.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group2[i]) && match.call(node, node.__data__, i, group2)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}
function sparse(update) {
  return new Array(update.length);
}
function selection_enter() {
  return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector2) {
    return this._parent.querySelector(selector2);
  },
  querySelectorAll: function(selector2) {
    return this._parent.querySelectorAll(selector2);
  }
};
function constant$2(x) {
  return function() {
    return x;
  };
}
function bindIndex(parent, group2, enter, update, exit, data) {
  var i = 0, node, groupLength = group2.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group2[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group2[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group2, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group2.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group2[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group2) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group2[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function selection_data(value, key) {
  if (!arguments.length)
    return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups2 = this._groups;
  if (typeof value !== "function")
    value = constant$2(value);
  for (var m = groups2.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j], group2 = groups2[j], groupLength = group2.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group2, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1)
          i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength)
          ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection$1(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}
function selection_exit() {
  return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
}
function selection_join(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter)
      enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update)
      update = update.selection();
  }
  if (onexit == null)
    exit.remove();
  else
    onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}
function selection_merge(context) {
  var selection2 = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge2[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection$1(merges, this._parents);
}
function selection_order() {
  for (var groups2 = this._groups, j = -1, m = groups2.length; ++j < m; ) {
    for (var group2 = groups2[j], i = group2.length - 1, next = group2[i], node; --i >= 0; ) {
      if (node = group2[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4)
          next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}
function selection_sort(compare) {
  if (!compare)
    compare = ascending;
  function compareNode(a2, b) {
    return a2 && b ? compare(a2.__data__, b.__data__) : !a2 - !b;
  }
  for (var groups2 = this._groups, m = groups2.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group2 = groups2[j], n = group2.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group2[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection$1(sortgroups, this._parents).order();
}
function ascending(a2, b) {
  return a2 < b ? -1 : a2 > b ? 1 : a2 >= b ? 0 : NaN;
}
function selection_call() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}
function selection_nodes() {
  return Array.from(this);
}
function selection_node() {
  for (var groups2 = this._groups, j = 0, m = groups2.length; j < m; ++j) {
    for (var group2 = groups2[j], i = 0, n = group2.length; i < n; ++i) {
      var node = group2[i];
      if (node)
        return node;
    }
  }
  return null;
}
function selection_size() {
  let size = 0;
  for (const node of this)
    ++size;
  return size;
}
function selection_empty() {
  return !this.node();
}
function selection_each(callback) {
  for (var groups2 = this._groups, j = 0, m = groups2.length; j < m; ++j) {
    for (var group2 = groups2[j], i = 0, n = group2.length, node; i < n; ++i) {
      if (node = group2[i])
        callback.call(node, node.__data__, i, group2);
    }
  }
  return this;
}
function attrRemove$1(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS$1(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant$1(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS$1(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction$1(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.removeAttribute(name);
    else
      this.setAttribute(name, v);
  };
}
function attrFunctionNS$1(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.removeAttributeNS(fullname.space, fullname.local);
    else
      this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function selection_attr(name, value) {
  var fullname = namespace(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS$1 : attrRemove$1 : typeof value === "function" ? fullname.local ? attrFunctionNS$1 : attrFunction$1 : fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, value));
}
function defaultView(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}
function styleRemove$1(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant$1(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction$1(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      this.style.removeProperty(name);
    else
      this.style.setProperty(name, v, priority);
  };
}
function selection_style(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove$1 : typeof value === "function" ? styleFunction$1 : styleConstant$1)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null)
      delete this[name];
    else
      this[name] = v;
  };
}
function selection_property(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}
function classArray(string2) {
  return string2.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n)
    list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n)
    list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function selection_classed(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n)
      if (!list.contains(names[i]))
        return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}
function textRemove() {
  this.textContent = "";
}
function textConstant$1(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction$1(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function selection_text(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction$1 : textConstant$1)(value)) : this.node().textContent;
}
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function selection_html(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}
function raise() {
  if (this.nextSibling)
    this.parentNode.appendChild(this);
}
function selection_raise() {
  return this.each(raise);
}
function lower() {
  if (this.previousSibling)
    this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function selection_lower() {
  return this.each(lower);
}
function selection_append(name) {
  var create2 = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create2.apply(this, arguments));
  });
}
function constantNull() {
  return null;
}
function selection_insert(name, before) {
  var create2 = typeof name === "function" ? name : creator(name), select2 = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create2.apply(this, arguments), select2.apply(this, arguments) || null);
  });
}
function remove() {
  var parent = this.parentNode;
  if (parent)
    parent.removeChild(this);
}
function selection_remove() {
  return this.each(remove);
}
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_clone(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}
function selection_datum(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0)
      name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on)
      return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i)
      on.length = i;
    else
      delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on)
      for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on)
      this.__on = [o];
    else
      on.push(o);
  };
}
function selection_on(typename, value, options) {
  var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on)
      for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i)
    this.each(on(typenames[i], value, options));
  return this;
}
function dispatchEvent(node, type, params) {
  var window2 = defaultView(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params)
      event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else
      event.initEvent(type, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}
function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}
function selection_dispatch(type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}
function* selection_iterator() {
  for (var groups2 = this._groups, j = 0, m = groups2.length; j < m; ++j) {
    for (var group2 = groups2[j], i = 0, n = group2.length, node; i < n; ++i) {
      if (node = group2[i])
        yield node;
    }
  }
}
var root = [null];
function Selection$1(groups2, parents) {
  this._groups = groups2;
  this._parents = parents;
}
function selection() {
  return new Selection$1([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection$1.prototype = selection.prototype = {
  constructor: Selection$1,
  select: selection_select,
  selectAll: selection_selectAll,
  selectChild: selection_selectChild,
  selectChildren: selection_selectChildren,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  join: selection_join,
  merge: selection_merge,
  selection: selection_selection,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  clone: selection_clone,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch,
  [Symbol.iterator]: selection_iterator
};
function select(selector2) {
  return typeof selector2 === "string" ? new Selection$1([[document.querySelector(selector2)]], [document.documentElement]) : new Selection$1([[selector2]], root);
}
function define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition)
    prototype[key] = definition[key];
  return prototype;
}
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*", reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", reHex = /^#([0-9a-f]{3,8})$/, reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`), reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`), reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`), reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`), reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`), reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define(Color, color$1, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color$1(format2) {
  var m, l;
  format2 = (format2 + "").trim().toLowerCase();
  return (m = reHex.exec(format2)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format2)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format2)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format2)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format2)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a2) {
  if (a2 <= 0)
    r = g = b = NaN;
  return new Rgb(r, g, b, a2);
}
function rgbConvert(o) {
  if (!(o instanceof Color))
    o = color$1(o);
  if (!o)
    return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity2) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity2 == null ? 1 : opacity2);
}
function Rgb(r, g, b, opacity2) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity2;
}
define(Rgb, rgb, extend(Color, {
  brighter(k2) {
    k2 = k2 == null ? brighter : Math.pow(brighter, k2);
    return new Rgb(this.r * k2, this.g * k2, this.b * k2, this.opacity);
  },
  darker(k2) {
    k2 = k2 == null ? darker : Math.pow(darker, k2);
    return new Rgb(this.r * k2, this.g * k2, this.b * k2, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a2 = clampa(this.opacity);
  return `${a2 === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a2 === 1 ? ")" : `, ${a2})`}`;
}
function clampa(opacity2) {
  return isNaN(opacity2) ? 1 : Math.max(0, Math.min(1, opacity2));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s2, l, a2) {
  if (a2 <= 0)
    h = s2 = l = NaN;
  else if (l <= 0 || l >= 1)
    h = s2 = NaN;
  else if (s2 <= 0)
    h = NaN;
  return new Hsl(h, s2, l, a2);
}
function hslConvert(o) {
  if (o instanceof Hsl)
    return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color))
    o = color$1(o);
  if (!o)
    return new Hsl();
  if (o instanceof Hsl)
    return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r, g, b), max2 = Math.max(r, g, b), h = NaN, s2 = max2 - min2, l = (max2 + min2) / 2;
  if (s2) {
    if (r === max2)
      h = (g - b) / s2 + (g < b) * 6;
    else if (g === max2)
      h = (b - r) / s2 + 2;
    else
      h = (r - g) / s2 + 4;
    s2 /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
    h *= 60;
  } else {
    s2 = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s2, l, o.opacity);
}
function hsl$1(h, s2, l, opacity2) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s2, l, opacity2 == null ? 1 : opacity2);
}
function Hsl(h, s2, l, opacity2) {
  this.h = +h;
  this.s = +s2;
  this.l = +l;
  this.opacity = +opacity2;
}
define(Hsl, hsl$1, extend(Color, {
  brighter(k2) {
    k2 = k2 == null ? brighter : Math.pow(brighter, k2);
    return new Hsl(this.h, this.s, this.l * k2, this.opacity);
  },
  darker(k2) {
    k2 = k2 == null ? darker : Math.pow(darker, k2);
    return new Hsl(this.h, this.s, this.l * k2, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360, s2 = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s2, m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a2 = clampa(this.opacity);
    return `${a2 === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a2 === 1 ? ")" : `, ${a2})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
const radians$2 = Math.PI / 180;
const degrees$2 = 180 / Math.PI;
const K = 18, Xn = 0.96422, Yn = 1, Zn = 0.82521, t0$1 = 4 / 29, t1$1 = 6 / 29, t2 = 3 * t1$1 * t1$1, t3 = t1$1 * t1$1 * t1$1;
function labConvert(o) {
  if (o instanceof Lab)
    return new Lab(o.l, o.a, o.b, o.opacity);
  if (o instanceof Hcl)
    return hcl2lab(o);
  if (!(o instanceof Rgb))
    o = rgbConvert(o);
  var r = rgb2lrgb(o.r), g = rgb2lrgb(o.g), b = rgb2lrgb(o.b), y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
  if (r === g && g === b)
    x = z = y;
  else {
    x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
    z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
  }
  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
}
function lab$1(l, a2, b, opacity2) {
  return arguments.length === 1 ? labConvert(l) : new Lab(l, a2, b, opacity2 == null ? 1 : opacity2);
}
function Lab(l, a2, b, opacity2) {
  this.l = +l;
  this.a = +a2;
  this.b = +b;
  this.opacity = +opacity2;
}
define(Lab, lab$1, extend(Color, {
  brighter(k2) {
    return new Lab(this.l + K * (k2 == null ? 1 : k2), this.a, this.b, this.opacity);
  },
  darker(k2) {
    return new Lab(this.l - K * (k2 == null ? 1 : k2), this.a, this.b, this.opacity);
  },
  rgb() {
    var y = (this.l + 16) / 116, x = isNaN(this.a) ? y : y + this.a / 500, z = isNaN(this.b) ? y : y - this.b / 200;
    x = Xn * lab2xyz(x);
    y = Yn * lab2xyz(y);
    z = Zn * lab2xyz(z);
    return new Rgb(
      lrgb2rgb(3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
      lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.033454 * z),
      lrgb2rgb(0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
      this.opacity
    );
  }
}));
function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0$1;
}
function lab2xyz(t) {
  return t > t1$1 ? t * t * t : t2 * (t - t0$1);
}
function lrgb2rgb(x) {
  return 255 * (x <= 31308e-7 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
}
function rgb2lrgb(x) {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}
function hclConvert(o) {
  if (o instanceof Hcl)
    return new Hcl(o.h, o.c, o.l, o.opacity);
  if (!(o instanceof Lab))
    o = labConvert(o);
  if (o.a === 0 && o.b === 0)
    return new Hcl(NaN, 0 < o.l && o.l < 100 ? 0 : NaN, o.l, o.opacity);
  var h = Math.atan2(o.b, o.a) * degrees$2;
  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
}
function hcl$1(h, c2, l, opacity2) {
  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c2, l, opacity2 == null ? 1 : opacity2);
}
function Hcl(h, c2, l, opacity2) {
  this.h = +h;
  this.c = +c2;
  this.l = +l;
  this.opacity = +opacity2;
}
function hcl2lab(o) {
  if (isNaN(o.h))
    return new Lab(o.l, 0, 0, o.opacity);
  var h = o.h * radians$2;
  return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
}
define(Hcl, hcl$1, extend(Color, {
  brighter(k2) {
    return new Hcl(this.h, this.c, this.l + K * (k2 == null ? 1 : k2), this.opacity);
  },
  darker(k2) {
    return new Hcl(this.h, this.c, this.l - K * (k2 == null ? 1 : k2), this.opacity);
  },
  rgb() {
    return hcl2lab(this).rgb();
  }
}));
var A = -0.14861, B = 1.78277, C = -0.29227, D = -0.90649, E = 1.97294, ED = E * D, EB = E * B, BC_DA = B * C - D * A;
function cubehelixConvert(o) {
  if (o instanceof Cubehelix)
    return new Cubehelix(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Rgb))
    o = rgbConvert(o);
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB), bl = b - l, k2 = (E * (g - l) - C * bl) / D, s2 = Math.sqrt(k2 * k2 + bl * bl) / (E * l * (1 - l)), h = s2 ? Math.atan2(k2, bl) * degrees$2 - 120 : NaN;
  return new Cubehelix(h < 0 ? h + 360 : h, s2, l, o.opacity);
}
function cubehelix$1(h, s2, l, opacity2) {
  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s2, l, opacity2 == null ? 1 : opacity2);
}
function Cubehelix(h, s2, l, opacity2) {
  this.h = +h;
  this.s = +s2;
  this.l = +l;
  this.opacity = +opacity2;
}
define(Cubehelix, cubehelix$1, extend(Color, {
  brighter(k2) {
    k2 = k2 == null ? brighter : Math.pow(brighter, k2);
    return new Cubehelix(this.h, this.s, this.l * k2, this.opacity);
  },
  darker(k2) {
    k2 = k2 == null ? darker : Math.pow(darker, k2);
    return new Cubehelix(this.h, this.s, this.l * k2, this.opacity);
  },
  rgb() {
    var h = isNaN(this.h) ? 0 : (this.h + 120) * radians$2, l = +this.l, a2 = isNaN(this.s) ? 0 : this.s * l * (1 - l), cosh = Math.cos(h), sinh = Math.sin(h);
    return new Rgb(
      255 * (l + a2 * (A * cosh + B * sinh)),
      255 * (l + a2 * (C * cosh + D * sinh)),
      255 * (l + a2 * (E * cosh)),
      this.opacity
    );
  }
}));
function basis(t12, v0, v1, v2, v3) {
  var t22 = t12 * t12, t32 = t22 * t12;
  return ((1 - 3 * t12 + 3 * t22 - t32) * v0 + (4 - 6 * t22 + 3 * t32) * v1 + (1 + 3 * t12 + 3 * t22 - 3 * t32) * v2 + t32 * v3) / 6;
}
function basis$1(values2) {
  var n = values2.length - 1;
  return function(t) {
    var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values2[i], v2 = values2[i + 1], v0 = i > 0 ? values2[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values2[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}
const constant$1 = (x) => () => x;
function linear$1(a2, d) {
  return function(t) {
    return a2 + t * d;
  };
}
function exponential(a2, b, y) {
  return a2 = Math.pow(a2, y), b = Math.pow(b, y) - a2, y = 1 / y, function(t) {
    return Math.pow(a2 + t * b, y);
  };
}
function hue(a2, b) {
  var d = b - a2;
  return d ? linear$1(a2, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$1(isNaN(a2) ? b : a2);
}
function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a2, b) {
    return b - a2 ? exponential(a2, b, y) : constant$1(isNaN(a2) ? b : a2);
  };
}
function nogamma(a2, b) {
  var d = b - a2;
  return d ? linear$1(a2, d) : constant$1(isNaN(a2) ? b : a2);
}
const interpolateRgb = function rgbGamma(y) {
  var color2 = gamma(y);
  function rgb$1(start2, end) {
    var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity2 = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.r = r(t);
      start2.g = g(t);
      start2.b = b(t);
      start2.opacity = opacity2(t);
      return start2 + "";
    };
  }
  rgb$1.gamma = rgbGamma;
  return rgb$1;
}(1);
function rgbSpline(spline) {
  return function(colors2) {
    var n = colors2.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
    for (i = 0; i < n; ++i) {
      color2 = rgb(colors2[i]);
      r[i] = color2.r || 0;
      g[i] = color2.g || 0;
      b[i] = color2.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color2.opacity = 1;
    return function(t) {
      color2.r = r(t);
      color2.g = g(t);
      color2.b = b(t);
      return color2 + "";
    };
  };
}
var rgbBasis = rgbSpline(basis$1);
function numberArray(a2, b) {
  if (!b)
    b = [];
  var n = a2 ? Math.min(b.length, a2.length) : 0, c2 = b.slice(), i;
  return function(t) {
    for (i = 0; i < n; ++i)
      c2[i] = a2[i] * (1 - t) + b[i] * t;
    return c2;
  };
}
function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}
function genericArray(a2, b) {
  var nb = b ? b.length : 0, na = a2 ? Math.min(nb, a2.length) : 0, x = new Array(na), c2 = new Array(nb), i;
  for (i = 0; i < na; ++i)
    x[i] = interpolate$1(a2[i], b[i]);
  for (; i < nb; ++i)
    c2[i] = b[i];
  return function(t) {
    for (i = 0; i < na; ++i)
      c2[i] = x[i](t);
    return c2;
  };
}
function date$1(a2, b) {
  var d = new Date();
  return a2 = +a2, b = +b, function(t) {
    return d.setTime(a2 * (1 - t) + b * t), d;
  };
}
function interpolateNumber(a2, b) {
  return a2 = +a2, b = +b, function(t) {
    return a2 * (1 - t) + b * t;
  };
}
function object(a2, b) {
  var i = {}, c2 = {}, k2;
  if (a2 === null || typeof a2 !== "object")
    a2 = {};
  if (b === null || typeof b !== "object")
    b = {};
  for (k2 in b) {
    if (k2 in a2) {
      i[k2] = interpolate$1(a2[k2], b[k2]);
    } else {
      c2[k2] = b[k2];
    }
  }
  return function(t) {
    for (k2 in i)
      c2[k2] = i[k2](t);
    return c2;
  };
}
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, reB = new RegExp(reA.source, "g");
function zero(b) {
  return function() {
    return b;
  };
}
function one$1(b) {
  return function(t) {
    return b(t) + "";
  };
}
function interpolateString(a2, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s2 = [], q = [];
  a2 = a2 + "", b = b + "";
  while ((am = reA.exec(a2)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s2[i])
        s2[i] += bs;
      else
        s2[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s2[i])
        s2[i] += bm;
      else
        s2[++i] = bm;
    } else {
      s2[++i] = null;
      q.push({ i, x: interpolateNumber(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s2[i])
      s2[i] += bs;
    else
      s2[++i] = bs;
  }
  return s2.length < 2 ? q[0] ? one$1(q[0].x) : zero(b) : (b = q.length, function(t) {
    for (var i2 = 0, o; i2 < b; ++i2)
      s2[(o = q[i2]).i] = o.x(t);
    return s2.join("");
  });
}
function interpolate$1(a2, b) {
  var t = typeof b, c2;
  return b == null || t === "boolean" ? constant$1(b) : (t === "number" ? interpolateNumber : t === "string" ? (c2 = color$1(b)) ? (b = c2, interpolateRgb) : interpolateString : b instanceof color$1 ? interpolateRgb : b instanceof Date ? date$1 : isNumberArray(b) ? numberArray : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object : interpolateNumber)(a2, b);
}
function interpolateRound(a2, b) {
  return a2 = +a2, b = +b, function(t) {
    return Math.round(a2 * (1 - t) + b * t);
  };
}
var degrees$1 = 180 / Math.PI;
var identity$6 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose(a2, b, c2, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a2 * a2 + b * b))
    a2 /= scaleX, b /= scaleX;
  if (skewX = a2 * c2 + b * d)
    c2 -= a2 * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c2 * c2 + d * d))
    c2 /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a2 * d < b * c2)
    a2 = -a2, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a2) * degrees$1,
    skewX: Math.atan(skewX) * degrees$1,
    scaleX,
    scaleY
  };
}
var svgNode;
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity$6 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value) {
  if (value == null)
    return identity$6;
  if (!svgNode)
    svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate()))
    return identity$6;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}
function interpolateTransform(parse2, pxComma, pxParen, degParen) {
  function pop(s2) {
    return s2.length ? s2.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s2, q) {
    if (xa !== xb || ya !== yb) {
      var i = s2.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb || yb) {
      s2.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a2, b, s2, q) {
    if (a2 !== b) {
      if (a2 - b > 180)
        b += 360;
      else if (b - a2 > 180)
        a2 += 360;
      q.push({ i: s2.push(pop(s2) + "rotate(", null, degParen) - 2, x: interpolateNumber(a2, b) });
    } else if (b) {
      s2.push(pop(s2) + "rotate(" + b + degParen);
    }
  }
  function skewX(a2, b, s2, q) {
    if (a2 !== b) {
      q.push({ i: s2.push(pop(s2) + "skewX(", null, degParen) - 2, x: interpolateNumber(a2, b) });
    } else if (b) {
      s2.push(pop(s2) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s2, q) {
    if (xa !== xb || ya !== yb) {
      var i = s2.push(pop(s2) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s2.push(pop(s2) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a2, b) {
    var s2 = [], q = [];
    a2 = parse2(a2), b = parse2(b);
    translate(a2.translateX, a2.translateY, b.translateX, b.translateY, s2, q);
    rotate(a2.rotate, b.rotate, s2, q);
    skewX(a2.skewX, b.skewX, s2, q);
    scale(a2.scaleX, a2.scaleY, b.scaleX, b.scaleY, s2, q);
    a2 = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n)
        s2[(o = q[i]).i] = o.x(t);
      return s2.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
function hsl(hue2) {
  return function(start2, end) {
    var h = hue2((start2 = hsl$1(start2)).h, (end = hsl$1(end)).h), s2 = nogamma(start2.s, end.s), l = nogamma(start2.l, end.l), opacity2 = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.h = h(t);
      start2.s = s2(t);
      start2.l = l(t);
      start2.opacity = opacity2(t);
      return start2 + "";
    };
  };
}
const interpolateHsl = hsl(hue);
function lab(start2, end) {
  var l = nogamma((start2 = lab$1(start2)).l, (end = lab$1(end)).l), a2 = nogamma(start2.a, end.a), b = nogamma(start2.b, end.b), opacity2 = nogamma(start2.opacity, end.opacity);
  return function(t) {
    start2.l = l(t);
    start2.a = a2(t);
    start2.b = b(t);
    start2.opacity = opacity2(t);
    return start2 + "";
  };
}
function hcl(hue2) {
  return function(start2, end) {
    var h = hue2((start2 = hcl$1(start2)).h, (end = hcl$1(end)).h), c2 = nogamma(start2.c, end.c), l = nogamma(start2.l, end.l), opacity2 = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.h = h(t);
      start2.c = c2(t);
      start2.l = l(t);
      start2.opacity = opacity2(t);
      return start2 + "";
    };
  };
}
const interpolateHcl = hcl(hue);
function cubehelix(hue2) {
  return function cubehelixGamma(y) {
    y = +y;
    function cubehelix2(start2, end) {
      var h = hue2((start2 = cubehelix$1(start2)).h, (end = cubehelix$1(end)).h), s2 = nogamma(start2.s, end.s), l = nogamma(start2.l, end.l), opacity2 = nogamma(start2.opacity, end.opacity);
      return function(t) {
        start2.h = h(t);
        start2.s = s2(t);
        start2.l = l(Math.pow(t, y));
        start2.opacity = opacity2(t);
        return start2 + "";
      };
    }
    cubehelix2.gamma = cubehelixGamma;
    return cubehelix2;
  }(1);
}
cubehelix(hue);
var cubehelixLong = cubehelix(nogamma);
function piecewise(interpolate2, values2) {
  if (values2 === void 0)
    values2 = interpolate2, interpolate2 = interpolate$1;
  var i = 0, n = values2.length - 1, v = values2[0], I = new Array(n < 0 ? 0 : n);
  while (i < n)
    I[i] = interpolate2(v, v = values2[++i]);
  return function(t) {
    var i2 = Math.max(0, Math.min(n - 1, Math.floor(t *= n)));
    return I[i2](t - i2);
  };
}
function quantize(interpolator, n) {
  var samples = new Array(n);
  for (var i = 0; i < n; ++i)
    samples[i] = interpolator(i / (n - 1));
  return samples;
}
var frame$1 = 0, timeout$1 = 0, interval = 0, pokeDelay = 1e3, taskHead, taskTail, clockLast = 0, clockNow = 0, clockSkew = 0, clock = typeof performance === "object" && performance.now ? performance : Date, setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time2) {
    if (typeof callback !== "function")
      throw new TypeError("callback is not a function");
    time2 = (time2 == null ? now() : +time2) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail)
        taskTail._next = this;
      else
        taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time2;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time2) {
  var t = new Timer();
  t.restart(callback, delay, time2);
  return t;
}
function timerFlush() {
  now();
  ++frame$1;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0)
      t._call.call(void 0, e);
    t = t._next;
  }
  --frame$1;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame$1 = timeout$1 = 0;
  try {
    timerFlush();
  } finally {
    frame$1 = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay)
    clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t02, t12 = taskHead, t22, time2 = Infinity;
  while (t12) {
    if (t12._call) {
      if (time2 > t12._time)
        time2 = t12._time;
      t02 = t12, t12 = t12._next;
    } else {
      t22 = t12._next, t12._next = null;
      t12 = t02 ? t02._next = t22 : taskHead = t22;
    }
  }
  taskTail = t02;
  sleep(time2);
}
function sleep(time2) {
  if (frame$1)
    return;
  if (timeout$1)
    timeout$1 = clearTimeout(timeout$1);
  var delay = time2 - clockNow;
  if (delay > 24) {
    if (time2 < Infinity)
      timeout$1 = setTimeout(wake, time2 - clock.now() - clockSkew);
    if (interval)
      interval = clearInterval(interval);
  } else {
    if (!interval)
      clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame$1 = 1, setFrame(wake);
  }
}
function timeout(callback, delay, time2) {
  var t = new Timer();
  delay = delay == null ? 0 : +delay;
  t.restart((elapsed) => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time2);
  return t;
}
var emptyOn = dispatch("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule(node, name, id2, index2, group2, timing) {
  var schedules = node.__transition;
  if (!schedules)
    node.__transition = {};
  else if (id2 in schedules)
    return;
  create$1(node, id2, {
    name,
    index: index2,
    // For context during callback.
    group: group2,
    // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > CREATED)
    throw new Error("too late; already scheduled");
  return schedule2;
}
function set(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > STARTED)
    throw new Error("too late; already running");
  return schedule2;
}
function get(node, id2) {
  var schedule2 = node.__transition;
  if (!schedule2 || !(schedule2 = schedule2[id2]))
    throw new Error("transition not found");
  return schedule2;
}
function create$1(node, id2, self) {
  var schedules = node.__transition, tween;
  schedules[id2] = self;
  self.timer = timer(schedule2, 0, self.time);
  function schedule2(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start2, self.delay, self.time);
    if (self.delay <= elapsed)
      start2(elapsed - self.delay);
  }
  function start2(elapsed) {
    var i, j, n, o;
    if (self.state !== SCHEDULED)
      return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name)
        continue;
      if (o.state === STARTED)
        return timeout(start2);
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      } else if (+i < id2) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }
    timeout(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING)
      return;
    self.state = STARTED;
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }
  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id2];
    for (var i in schedules)
      return;
    delete node.__transition;
  }
}
function interrupt(node, name) {
  var schedules = node.__transition, schedule2, active, empty2 = true, i;
  if (!schedules)
    return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule2 = schedules[i]).name !== name) {
      empty2 = false;
      continue;
    }
    active = schedule2.state > STARTING && schedule2.state < ENDING;
    schedule2.state = ENDED;
    schedule2.timer.stop();
    schedule2.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule2.index, schedule2.group);
    delete schedules[i];
  }
  if (empty2)
    delete node.__transition;
}
function selection_interrupt(name) {
  return this.each(function() {
    interrupt(this, name);
  });
}
function tweenRemove(id2, name) {
  var tween0, tween1;
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule2.tween = tween1;
  };
}
function tweenFunction(id2, name, value) {
  var tween0, tween1;
  if (typeof value !== "function")
    throw new Error();
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n)
        tween1.push(t);
    }
    schedule2.tween = tween1;
  };
}
function transition_tween(name, value) {
  var id2 = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get(this.node(), id2).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
}
function tweenValue(transition, name, value) {
  var id2 = transition._id;
  transition.each(function() {
    var schedule2 = set(this, id2);
    (schedule2.value || (schedule2.value = {}))[name] = value.apply(this, arguments);
  });
  return function(node) {
    return get(node, id2).value[name];
  };
}
function interpolate(a2, b) {
  var c2;
  return (typeof b === "number" ? interpolateNumber : b instanceof color$1 ? interpolateRgb : (c2 = color$1(b)) ? (b = c2, interpolateRgb) : interpolateString)(a2, b);
}
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrConstantNS(fullname, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null)
      return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function attrFunctionNS(fullname, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null)
      return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function transition_attr(name, value) {
  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname) : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}
function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}
function attrTweenNS(fullname, value) {
  var t02, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t02 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t02;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t02, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t02 = (i0 = i) && attrInterpolate(name, i);
    return t02;
  }
  tween._value = value;
  return tween;
}
function transition_attrTween(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error();
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}
function delayFunction(id2, value) {
  return function() {
    init(this, id2).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id2, value) {
  return value = +value, function() {
    init(this, id2).delay = value;
  };
}
function transition_delay(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get(this.node(), id2).delay;
}
function durationFunction(id2, value) {
  return function() {
    set(this, id2).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id2, value) {
  return value = +value, function() {
    set(this, id2).duration = value;
  };
}
function transition_duration(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get(this.node(), id2).duration;
}
function easeConstant(id2, value) {
  if (typeof value !== "function")
    throw new Error();
  return function() {
    set(this, id2).ease = value;
  };
}
function transition_ease(value) {
  var id2 = this._id;
  return arguments.length ? this.each(easeConstant(id2, value)) : get(this.node(), id2).ease;
}
function easeVarying(id2, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function")
      throw new Error();
    set(this, id2).ease = v;
  };
}
function transition_easeVarying(value) {
  if (typeof value !== "function")
    throw new Error();
  return this.each(easeVarying(this._id, value));
}
function transition_filter(match) {
  if (typeof match !== "function")
    match = matcher(match);
  for (var groups2 = this._groups, m = groups2.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group2 = groups2[j], n = group2.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group2[i]) && match.call(node, node.__data__, i, group2)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}
function transition_merge(transition) {
  if (transition._id !== this._id)
    throw new Error();
  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge2[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}
function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0)
      t = t.slice(0, i);
    return !t || t === "start";
  });
}
function onFunction(id2, name, listener) {
  var on0, on1, sit = start(name) ? init : set;
  return function() {
    var schedule2 = sit(this, id2), on = schedule2.on;
    if (on !== on0)
      (on1 = (on0 = on).copy()).on(name, listener);
    schedule2.on = on1;
  };
}
function transition_on(name, listener) {
  var id2 = this._id;
  return arguments.length < 2 ? get(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
}
function removeFunction(id2) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition)
      if (+i !== id2)
        return;
    if (parent)
      parent.removeChild(this);
  };
}
function transition_remove() {
  return this.on("end.remove", removeFunction(this._id));
}
function transition_select(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function")
    select2 = selector(select2);
  for (var groups2 = this._groups, m = groups2.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group2 = groups2[j], n = group2.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group2[i]) && (subnode = select2.call(node, node.__data__, i, group2))) {
        if ("__data__" in node)
          subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id2, i, subgroup, get(node, id2));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id2);
}
function transition_selectAll(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function")
    select2 = selectorAll(select2);
  for (var groups2 = this._groups, m = groups2.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group2 = groups2[j], n = group2.length, node, i = 0; i < n; ++i) {
      if (node = group2[i]) {
        for (var children2 = select2.call(node, node.__data__, i, group2), child, inherit2 = get(node, id2), k2 = 0, l = children2.length; k2 < l; ++k2) {
          if (child = children2[k2]) {
            schedule(child, name, id2, k2, children2, inherit2);
          }
        }
        subgroups.push(children2);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id2);
}
var Selection = selection.prototype.constructor;
function transition_selection() {
  return new Selection(this._groups, this._parents);
}
function styleNull(name, interpolate2) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, string10 = string1);
  };
}
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function styleFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    if (value1 == null)
      string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function styleMaybeRemove(id2, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
  return function() {
    var schedule2 = set(this, id2), on = schedule2.on, listener = schedule2.value[key] == null ? remove2 || (remove2 = styleRemove(name)) : void 0;
    if (on !== on0 || listener0 !== listener)
      (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    schedule2.on = on1;
  };
}
function transition_style(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove(name)) : typeof value === "function" ? this.styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant(name, i, value), priority).on("end.style." + name, null);
}
function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}
function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}
function transition_styleTween(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function transition_text(value) {
  return this.tween("text", typeof value === "function" ? textFunction(tweenValue(this, "text", value)) : textConstant(value == null ? "" : value + ""));
}
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t02, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0)
      t02 = (i0 = i) && textInterpolate(i);
    return t02;
  }
  tween._value = value;
  return tween;
}
function transition_textTween(value) {
  var key = "text";
  if (arguments.length < 1)
    return (key = this.tween(key)) && key._value;
  if (value == null)
    return this.tween(key, null);
  if (typeof value !== "function")
    throw new Error();
  return this.tween(key, textTween(value));
}
function transition_transition() {
  var name = this._name, id0 = this._id, id1 = newId();
  for (var groups2 = this._groups, m = groups2.length, j = 0; j < m; ++j) {
    for (var group2 = groups2[j], n = group2.length, node, i = 0; i < n; ++i) {
      if (node = group2[i]) {
        var inherit2 = get(node, id0);
        schedule(node, name, id1, i, group2, {
          time: inherit2.time + inherit2.delay + inherit2.duration,
          delay: 0,
          duration: inherit2.duration,
          ease: inherit2.ease
        });
      }
    }
  }
  return new Transition(groups2, this._parents, name, id1);
}
function transition_end() {
  var on0, on1, that = this, id2 = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0)
        resolve();
    } };
    that.each(function() {
      var schedule2 = set(this, id2), on = schedule2.on;
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule2.on = on1;
    });
    if (size === 0)
      resolve();
  });
}
var id = 0;
function Transition(groups2, parents, name, id2) {
  this._groups = groups2;
  this._parents = parents;
  this._name = name;
  this._id = id2;
}
function newId() {
  return ++id;
}
var selection_prototype = selection.prototype;
Transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  textTween: transition_textTween,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease,
  easeVarying: transition_easeVarying,
  end: transition_end,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};
function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var defaultTiming = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit$1(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function selection_transition(name) {
  var id2, timing;
  if (name instanceof Transition) {
    id2 = name._id, name = name._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups2 = this._groups, m = groups2.length, j = 0; j < m; ++j) {
    for (var group2 = groups2[j], n = group2.length, node, i = 0; i < n; ++i) {
      if (node = group2[i]) {
        schedule(node, name, id2, i, group2, timing || inherit$1(node, id2));
      }
    }
  }
  return new Transition(groups2, this._parents, name, id2);
}
selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;
const pi$3 = Math.PI, tau$3 = 2 * pi$3, epsilon$1 = 1e-6, tauEpsilon = tau$3 - epsilon$1;
function append$1(strings) {
  this._ += strings[0];
  for (let i = 1, n = strings.length; i < n; ++i) {
    this._ += arguments[i] + strings[i];
  }
}
function appendRound$1(digits) {
  let d = Math.floor(digits);
  if (!(d >= 0))
    throw new Error(`invalid digits: ${digits}`);
  if (d > 15)
    return append$1;
  const k2 = 10 ** d;
  return function(strings) {
    this._ += strings[0];
    for (let i = 1, n = strings.length; i < n; ++i) {
      this._ += Math.round(arguments[i] * k2) / k2 + strings[i];
    }
  };
}
class Path {
  constructor(digits) {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null;
    this._ = "";
    this._append = digits == null ? append$1 : appendRound$1(digits);
  }
  moveTo(x, y) {
    this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
  }
  closePath() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._append`Z`;
    }
  }
  lineTo(x, y) {
    this._append`L${this._x1 = +x},${this._y1 = +y}`;
  }
  quadraticCurveTo(x12, y12, x, y) {
    this._append`Q${+x12},${+y12},${this._x1 = +x},${this._y1 = +y}`;
  }
  bezierCurveTo(x12, y12, x2, y2, x, y) {
    this._append`C${+x12},${+y12},${+x2},${+y2},${this._x1 = +x},${this._y1 = +y}`;
  }
  arcTo(x12, y12, x2, y2, r) {
    x12 = +x12, y12 = +y12, x2 = +x2, y2 = +y2, r = +r;
    if (r < 0)
      throw new Error(`negative radius: ${r}`);
    let x02 = this._x1, y02 = this._y1, x21 = x2 - x12, y21 = y2 - y12, x01 = x02 - x12, y01 = y02 - y12, l01_2 = x01 * x01 + y01 * y01;
    if (this._x1 === null) {
      this._append`M${this._x1 = x12},${this._y1 = y12}`;
    } else if (!(l01_2 > epsilon$1))
      ;
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon$1) || !r) {
      this._append`L${this._x1 = x12},${this._y1 = y12}`;
    } else {
      let x20 = x2 - x02, y20 = y2 - y02, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = Math.sqrt(l21_2), l01 = Math.sqrt(l01_2), l = r * Math.tan((pi$3 - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
      if (Math.abs(t01 - 1) > epsilon$1) {
        this._append`L${x12 + t01 * x01},${y12 + t01 * y01}`;
      }
      this._append`A${r},${r},0,0,${+(y01 * x20 > x01 * y20)},${this._x1 = x12 + t21 * x21},${this._y1 = y12 + t21 * y21}`;
    }
  }
  arc(x, y, r, a0, a1, ccw) {
    x = +x, y = +y, r = +r, ccw = !!ccw;
    if (r < 0)
      throw new Error(`negative radius: ${r}`);
    let dx = r * Math.cos(a0), dy = r * Math.sin(a0), x02 = x + dx, y02 = y + dy, cw = 1 ^ ccw, da = ccw ? a0 - a1 : a1 - a0;
    if (this._x1 === null) {
      this._append`M${x02},${y02}`;
    } else if (Math.abs(this._x1 - x02) > epsilon$1 || Math.abs(this._y1 - y02) > epsilon$1) {
      this._append`L${x02},${y02}`;
    }
    if (!r)
      return;
    if (da < 0)
      da = da % tau$3 + tau$3;
    if (da > tauEpsilon) {
      this._append`A${r},${r},0,1,${cw},${x - dx},${y - dy}A${r},${r},0,1,${cw},${this._x1 = x02},${this._y1 = y02}`;
    } else if (da > epsilon$1) {
      this._append`A${r},${r},0,${+(da >= pi$3)},${cw},${this._x1 = x + r * Math.cos(a1)},${this._y1 = y + r * Math.sin(a1)}`;
    }
  }
  rect(x, y, w, h) {
    this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${w = +w}v${+h}h${-w}Z`;
  }
  toString() {
    return this._;
  }
}
function pathRound(digits = 3) {
  return new Path(+digits);
}
var EOL = {}, EOF = {}, QUOTE = 34, NEWLINE = 10, RETURN = 13;
function objectConverter(columns) {
  return new Function("d", "return {" + columns.map(function(name, i) {
    return JSON.stringify(name) + ": d[" + i + '] || ""';
  }).join(",") + "}");
}
function customConverter(columns, f) {
  var object2 = objectConverter(columns);
  return function(row, i) {
    return f(object2(row), i, columns);
  };
}
function inferColumns(rows) {
  var columnSet = /* @__PURE__ */ Object.create(null), columns = [];
  rows.forEach(function(row) {
    for (var column2 in row) {
      if (!(column2 in columnSet)) {
        columns.push(columnSet[column2] = column2);
      }
    }
  });
  return columns;
}
function pad$2(value, width) {
  var s2 = value + "", length2 = s2.length;
  return length2 < width ? new Array(width - length2 + 1).join(0) + s2 : s2;
}
function formatYear$2(year) {
  return year < 0 ? "-" + pad$2(-year, 6) : year > 9999 ? "+" + pad$2(year, 6) : pad$2(year, 4);
}
function formatDate(date2) {
  var hours = date2.getUTCHours(), minutes = date2.getUTCMinutes(), seconds = date2.getUTCSeconds(), milliseconds = date2.getUTCMilliseconds();
  return isNaN(date2) ? "Invalid Date" : formatYear$2(date2.getUTCFullYear()) + "-" + pad$2(date2.getUTCMonth() + 1, 2) + "-" + pad$2(date2.getUTCDate(), 2) + (milliseconds ? "T" + pad$2(hours, 2) + ":" + pad$2(minutes, 2) + ":" + pad$2(seconds, 2) + "." + pad$2(milliseconds, 3) + "Z" : seconds ? "T" + pad$2(hours, 2) + ":" + pad$2(minutes, 2) + ":" + pad$2(seconds, 2) + "Z" : minutes || hours ? "T" + pad$2(hours, 2) + ":" + pad$2(minutes, 2) + "Z" : "");
}
function dsvFormat(delimiter) {
  var reFormat = new RegExp('["' + delimiter + "\n\r]"), DELIMITER = delimiter.charCodeAt(0);
  function parse2(text2, f) {
    var convert, columns, rows = parseRows(text2, function(row, i) {
      if (convert)
        return convert(row, i - 1);
      columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
    });
    rows.columns = columns || [];
    return rows;
  }
  function parseRows(text2, f) {
    var rows = [], N = text2.length, I = 0, n = 0, t, eof = N <= 0, eol = false;
    if (text2.charCodeAt(N - 1) === NEWLINE)
      --N;
    if (text2.charCodeAt(N - 1) === RETURN)
      --N;
    function token() {
      if (eof)
        return EOF;
      if (eol)
        return eol = false, EOL;
      var i, j = I, c2;
      if (text2.charCodeAt(j) === QUOTE) {
        while (I++ < N && text2.charCodeAt(I) !== QUOTE || text2.charCodeAt(++I) === QUOTE)
          ;
        if ((i = I) >= N)
          eof = true;
        else if ((c2 = text2.charCodeAt(I++)) === NEWLINE)
          eol = true;
        else if (c2 === RETURN) {
          eol = true;
          if (text2.charCodeAt(I) === NEWLINE)
            ++I;
        }
        return text2.slice(j + 1, i - 1).replace(/""/g, '"');
      }
      while (I < N) {
        if ((c2 = text2.charCodeAt(i = I++)) === NEWLINE)
          eol = true;
        else if (c2 === RETURN) {
          eol = true;
          if (text2.charCodeAt(I) === NEWLINE)
            ++I;
        } else if (c2 !== DELIMITER)
          continue;
        return text2.slice(j, i);
      }
      return eof = true, text2.slice(j, N);
    }
    while ((t = token()) !== EOF) {
      var row = [];
      while (t !== EOL && t !== EOF)
        row.push(t), t = token();
      if (f && (row = f(row, n++)) == null)
        continue;
      rows.push(row);
    }
    return rows;
  }
  function preformatBody(rows, columns) {
    return rows.map(function(row) {
      return columns.map(function(column2) {
        return formatValue(row[column2]);
      }).join(delimiter);
    });
  }
  function format2(rows, columns) {
    if (columns == null)
      columns = inferColumns(rows);
    return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
  }
  function formatBody(rows, columns) {
    if (columns == null)
      columns = inferColumns(rows);
    return preformatBody(rows, columns).join("\n");
  }
  function formatRows(rows) {
    return rows.map(formatRow).join("\n");
  }
  function formatRow(row) {
    return row.map(formatValue).join(delimiter);
  }
  function formatValue(value) {
    return value == null ? "" : value instanceof Date ? formatDate(value) : reFormat.test(value += "") ? '"' + value.replace(/"/g, '""') + '"' : value;
  }
  return {
    parse: parse2,
    parseRows,
    format: format2,
    formatBody,
    formatRows,
    formatRow,
    formatValue
  };
}
var csv = dsvFormat(",");
var csvParse = csv.parse;
function formatDecimal(x) {
  return Math.abs(x = Math.round(x)) >= 1e21 ? x.toLocaleString("en").replace(/,/g, "") : x.toString(10);
}
function formatDecimalParts(x, p) {
  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0)
    return null;
  var i, coefficient = x.slice(0, i);
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x.slice(i + 1)
  ];
}
function exponent(x) {
  return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
}
function formatGroup(grouping, thousands) {
  return function(value, width) {
    var i = value.length, t = [], j = 0, g = grouping[0], length2 = 0;
    while (i > 0 && g > 0) {
      if (length2 + g + 1 > width)
        g = Math.max(1, width - length2);
      t.push(value.substring(i -= g, i + g));
      if ((length2 += g + 1) > width)
        break;
      g = grouping[j = (j + 1) % grouping.length];
    }
    return t.reverse().join(thousands);
  };
}
function formatNumerals(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}
var re$1 = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(specifier) {
  if (!(match = re$1.exec(specifier)))
    throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(specifier) {
  this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
  this.align = specifier.align === void 0 ? ">" : specifier.align + "";
  this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === void 0 ? void 0 : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === void 0 ? "" : specifier.type + "";
}
FormatSpecifier.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
function formatTrim(s2) {
  out:
    for (var n = s2.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s2[i]) {
        case ".":
          i0 = i1 = i;
          break;
        case "0":
          if (i0 === 0)
            i0 = i;
          i1 = i;
          break;
        default:
          if (!+s2[i])
            break out;
          if (i0 > 0)
            i0 = 0;
          break;
      }
    }
  return i0 > 0 ? s2.slice(0, i0) + s2.slice(i1 + 1) : s2;
}
var prefixExponent;
function formatPrefixAuto(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d)
    return x + "";
  var coefficient = d[0], exponent2 = d[1], i = exponent2 - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent2 / 3))) * 3) + 1, n = coefficient.length;
  return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0];
}
function formatRounded(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d)
    return x + "";
  var coefficient = d[0], exponent2 = d[1];
  return exponent2 < 0 ? "0." + new Array(-exponent2).join("0") + coefficient : coefficient.length > exponent2 + 1 ? coefficient.slice(0, exponent2 + 1) + "." + coefficient.slice(exponent2 + 1) : coefficient + new Array(exponent2 - coefficient.length + 2).join("0");
}
const formatTypes = {
  "%": (x, p) => (x * 100).toFixed(p),
  "b": (x) => Math.round(x).toString(2),
  "c": (x) => x + "",
  "d": formatDecimal,
  "e": (x, p) => x.toExponential(p),
  "f": (x, p) => x.toFixed(p),
  "g": (x, p) => x.toPrecision(p),
  "o": (x) => Math.round(x).toString(8),
  "p": (x, p) => formatRounded(x * 100, p),
  "r": formatRounded,
  "s": formatPrefixAuto,
  "X": (x) => Math.round(x).toString(16).toUpperCase(),
  "x": (x) => Math.round(x).toString(16)
};
function identity$5(x) {
  return x;
}
var map$1 = Array.prototype.map, prefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function formatLocale$1(locale2) {
  var group2 = locale2.grouping === void 0 || locale2.thousands === void 0 ? identity$5 : formatGroup(map$1.call(locale2.grouping, Number), locale2.thousands + ""), currencyPrefix = locale2.currency === void 0 ? "" : locale2.currency[0] + "", currencySuffix = locale2.currency === void 0 ? "" : locale2.currency[1] + "", decimal = locale2.decimal === void 0 ? "." : locale2.decimal + "", numerals = locale2.numerals === void 0 ? identity$5 : formatNumerals(map$1.call(locale2.numerals, String)), percent = locale2.percent === void 0 ? "%" : locale2.percent + "", minus = locale2.minus === void 0 ? "−" : locale2.minus + "", nan = locale2.nan === void 0 ? "NaN" : locale2.nan + "";
  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);
    var fill = specifier.fill, align = specifier.align, sign2 = specifier.sign, symbol2 = specifier.symbol, zero2 = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type = specifier.type;
    if (type === "n")
      comma = true, type = "g";
    else if (!formatTypes[type])
      precision === void 0 && (precision = 12), trim = true, type = "g";
    if (zero2 || fill === "0" && align === "=")
      zero2 = true, fill = "0", align = "=";
    var prefix = symbol2 === "$" ? currencyPrefix : symbol2 === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "", suffix = symbol2 === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";
    var formatType = formatTypes[type], maybeSuffix = /[defgprs%]/.test(type);
    precision = precision === void 0 ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
    function format2(value) {
      var valuePrefix = prefix, valueSuffix = suffix, i, n, c2;
      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;
        var valueNegative = value < 0 || 1 / value < 0;
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
        if (trim)
          value = formatTrim(value);
        if (valueNegative && +value === 0 && sign2 !== "+")
          valueNegative = false;
        valuePrefix = (valueNegative ? sign2 === "(" ? sign2 : minus : sign2 === "-" || sign2 === "(" ? "" : sign2) + valuePrefix;
        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign2 === "(" ? ")" : "");
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c2 = value.charCodeAt(i), 48 > c2 || c2 > 57) {
              valueSuffix = (c2 === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }
      if (comma && !zero2)
        value = group2(value, Infinity);
      var length2 = valuePrefix.length + value.length + valueSuffix.length, padding = length2 < width ? new Array(width - length2 + 1).join(fill) : "";
      if (comma && zero2)
        value = group2(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
      switch (align) {
        case "<":
          value = valuePrefix + value + valueSuffix + padding;
          break;
        case "=":
          value = valuePrefix + padding + value + valueSuffix;
          break;
        case "^":
          value = padding.slice(0, length2 = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length2);
          break;
        default:
          value = padding + valuePrefix + value + valueSuffix;
          break;
      }
      return numerals(value);
    }
    format2.toString = function() {
      return specifier + "";
    };
    return format2;
  }
  function formatPrefix2(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)), e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3, k2 = Math.pow(10, -e), prefix = prefixes[8 + e / 3];
    return function(value2) {
      return f(k2 * value2) + prefix;
    };
  }
  return {
    format: newFormat,
    formatPrefix: formatPrefix2
  };
}
var locale$1;
var format$1;
var formatPrefix;
defaultLocale$1({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});
function defaultLocale$1(definition) {
  locale$1 = formatLocale$1(definition);
  format$1 = locale$1.format;
  formatPrefix = locale$1.formatPrefix;
  return locale$1;
}
function precisionFixed(step) {
  return Math.max(0, -exponent(Math.abs(step)));
}
function precisionPrefix(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
}
function precisionRound(step, max2) {
  step = Math.abs(step), max2 = Math.abs(max2) - step;
  return Math.max(0, exponent(max2) - exponent(step)) + 1;
}
var epsilon = 1e-6;
var epsilon2 = 1e-12;
var pi$2 = Math.PI;
var halfPi = pi$2 / 2;
var quarterPi = pi$2 / 4;
var tau$2 = pi$2 * 2;
var degrees = 180 / pi$2;
var radians$1 = pi$2 / 180;
var abs = Math.abs;
var atan = Math.atan;
var atan2 = Math.atan2;
var cos$1 = Math.cos;
var exp = Math.exp;
var log$1 = Math.log;
var pow$1 = Math.pow;
var sin$1 = Math.sin;
var sign = Math.sign || function(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
};
var sqrt$1 = Math.sqrt;
var tan = Math.tan;
function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi$2 : Math.acos(x);
}
function asin(x) {
  return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
}
function noop() {
}
function streamGeometry(geometry, stream) {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    streamGeometryType[geometry.type](geometry, stream);
  }
}
var streamObjectType = {
  Feature: function(object2, stream) {
    streamGeometry(object2.geometry, stream);
  },
  FeatureCollection: function(object2, stream) {
    var features = object2.features, i = -1, n = features.length;
    while (++i < n)
      streamGeometry(features[i].geometry, stream);
  }
};
var streamGeometryType = {
  Sphere: function(object2, stream) {
    stream.sphere();
  },
  Point: function(object2, stream) {
    object2 = object2.coordinates;
    stream.point(object2[0], object2[1], object2[2]);
  },
  MultiPoint: function(object2, stream) {
    var coordinates = object2.coordinates, i = -1, n = coordinates.length;
    while (++i < n)
      object2 = coordinates[i], stream.point(object2[0], object2[1], object2[2]);
  },
  LineString: function(object2, stream) {
    streamLine(object2.coordinates, stream, 0);
  },
  MultiLineString: function(object2, stream) {
    var coordinates = object2.coordinates, i = -1, n = coordinates.length;
    while (++i < n)
      streamLine(coordinates[i], stream, 0);
  },
  Polygon: function(object2, stream) {
    streamPolygon(object2.coordinates, stream);
  },
  MultiPolygon: function(object2, stream) {
    var coordinates = object2.coordinates, i = -1, n = coordinates.length;
    while (++i < n)
      streamPolygon(coordinates[i], stream);
  },
  GeometryCollection: function(object2, stream) {
    var geometries = object2.geometries, i = -1, n = geometries.length;
    while (++i < n)
      streamGeometry(geometries[i], stream);
  }
};
function streamLine(coordinates, stream, closed) {
  var i = -1, n = coordinates.length - closed, coordinate;
  stream.lineStart();
  while (++i < n)
    coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
  stream.lineEnd();
}
function streamPolygon(coordinates, stream) {
  var i = -1, n = coordinates.length;
  stream.polygonStart();
  while (++i < n)
    streamLine(coordinates[i], stream, 1);
  stream.polygonEnd();
}
function geoStream(object2, stream) {
  if (object2 && streamObjectType.hasOwnProperty(object2.type)) {
    streamObjectType[object2.type](object2, stream);
  } else {
    streamGeometry(object2, stream);
  }
}
function spherical(cartesian2) {
  return [atan2(cartesian2[1], cartesian2[0]), asin(cartesian2[2])];
}
function cartesian(spherical2) {
  var lambda = spherical2[0], phi = spherical2[1], cosPhi = cos$1(phi);
  return [cosPhi * cos$1(lambda), cosPhi * sin$1(lambda), sin$1(phi)];
}
function cartesianDot(a2, b) {
  return a2[0] * b[0] + a2[1] * b[1] + a2[2] * b[2];
}
function cartesianCross(a2, b) {
  return [a2[1] * b[2] - a2[2] * b[1], a2[2] * b[0] - a2[0] * b[2], a2[0] * b[1] - a2[1] * b[0]];
}
function cartesianAddInPlace(a2, b) {
  a2[0] += b[0], a2[1] += b[1], a2[2] += b[2];
}
function cartesianScale(vector, k2) {
  return [vector[0] * k2, vector[1] * k2, vector[2] * k2];
}
function cartesianNormalizeInPlace(d) {
  var l = sqrt$1(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
  d[0] /= l, d[1] /= l, d[2] /= l;
}
function compose(a2, b) {
  function compose2(x, y) {
    return x = a2(x, y), b(x[0], x[1]);
  }
  if (a2.invert && b.invert)
    compose2.invert = function(x, y) {
      return x = b.invert(x, y), x && a2.invert(x[0], x[1]);
    };
  return compose2;
}
function rotationIdentity(lambda, phi) {
  if (abs(lambda) > pi$2)
    lambda -= Math.round(lambda / tau$2) * tau$2;
  return [lambda, phi];
}
rotationIdentity.invert = rotationIdentity;
function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
  return (deltaLambda %= tau$2) ? deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma)) : rotationLambda(deltaLambda) : deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma) : rotationIdentity;
}
function forwardRotationLambda(deltaLambda) {
  return function(lambda, phi) {
    lambda += deltaLambda;
    if (abs(lambda) > pi$2)
      lambda -= Math.round(lambda / tau$2) * tau$2;
    return [lambda, phi];
  };
}
function rotationLambda(deltaLambda) {
  var rotation2 = forwardRotationLambda(deltaLambda);
  rotation2.invert = forwardRotationLambda(-deltaLambda);
  return rotation2;
}
function rotationPhiGamma(deltaPhi, deltaGamma) {
  var cosDeltaPhi = cos$1(deltaPhi), sinDeltaPhi = sin$1(deltaPhi), cosDeltaGamma = cos$1(deltaGamma), sinDeltaGamma = sin$1(deltaGamma);
  function rotation2(lambda, phi) {
    var cosPhi = cos$1(phi), x = cos$1(lambda) * cosPhi, y = sin$1(lambda) * cosPhi, z = sin$1(phi), k2 = z * cosDeltaPhi + x * sinDeltaPhi;
    return [
      atan2(y * cosDeltaGamma - k2 * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
      asin(k2 * cosDeltaGamma + y * sinDeltaGamma)
    ];
  }
  rotation2.invert = function(lambda, phi) {
    var cosPhi = cos$1(phi), x = cos$1(lambda) * cosPhi, y = sin$1(lambda) * cosPhi, z = sin$1(phi), k2 = z * cosDeltaGamma - y * sinDeltaGamma;
    return [
      atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k2 * sinDeltaPhi),
      asin(k2 * cosDeltaPhi - x * sinDeltaPhi)
    ];
  };
  return rotation2;
}
function rotation(rotate) {
  rotate = rotateRadians(rotate[0] * radians$1, rotate[1] * radians$1, rotate.length > 2 ? rotate[2] * radians$1 : 0);
  function forward(coordinates) {
    coordinates = rotate(coordinates[0] * radians$1, coordinates[1] * radians$1);
    return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
  }
  forward.invert = function(coordinates) {
    coordinates = rotate.invert(coordinates[0] * radians$1, coordinates[1] * radians$1);
    return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
  };
  return forward;
}
function circleStream(stream, radius2, delta, direction, t02, t12) {
  if (!delta)
    return;
  var cosRadius = cos$1(radius2), sinRadius = sin$1(radius2), step = direction * delta;
  if (t02 == null) {
    t02 = radius2 + direction * tau$2;
    t12 = radius2 - step / 2;
  } else {
    t02 = circleRadius(cosRadius, t02);
    t12 = circleRadius(cosRadius, t12);
    if (direction > 0 ? t02 < t12 : t02 > t12)
      t02 += direction * tau$2;
  }
  for (var point2, t = t02; direction > 0 ? t > t12 : t < t12; t -= step) {
    point2 = spherical([cosRadius, -sinRadius * cos$1(t), -sinRadius * sin$1(t)]);
    stream.point(point2[0], point2[1]);
  }
}
function circleRadius(cosRadius, point2) {
  point2 = cartesian(point2), point2[0] -= cosRadius;
  cartesianNormalizeInPlace(point2);
  var radius2 = acos(-point2[1]);
  return ((-point2[2] < 0 ? -radius2 : radius2) + tau$2 - epsilon) % tau$2;
}
function clipBuffer() {
  var lines = [], line;
  return {
    point: function(x, y, m) {
      line.push([x, y, m]);
    },
    lineStart: function() {
      lines.push(line = []);
    },
    lineEnd: noop,
    rejoin: function() {
      if (lines.length > 1)
        lines.push(lines.pop().concat(lines.shift()));
    },
    result: function() {
      var result = lines;
      lines = [];
      line = null;
      return result;
    }
  };
}
function pointEqual(a2, b) {
  return abs(a2[0] - b[0]) < epsilon && abs(a2[1] - b[1]) < epsilon;
}
function Intersection(point2, points, other, entry) {
  this.x = point2;
  this.z = points;
  this.o = other;
  this.e = entry;
  this.v = false;
  this.n = this.p = null;
}
function clipRejoin(segments, compareIntersection2, startInside, interpolate2, stream) {
  var subject = [], clip2 = [], i, n;
  segments.forEach(function(segment) {
    if ((n2 = segment.length - 1) <= 0)
      return;
    var n2, p0 = segment[0], p1 = segment[n2], x;
    if (pointEqual(p0, p1)) {
      if (!p0[2] && !p1[2]) {
        stream.lineStart();
        for (i = 0; i < n2; ++i)
          stream.point((p0 = segment[i])[0], p0[1]);
        stream.lineEnd();
        return;
      }
      p1[0] += 2 * epsilon;
    }
    subject.push(x = new Intersection(p0, segment, null, true));
    clip2.push(x.o = new Intersection(p0, null, x, false));
    subject.push(x = new Intersection(p1, segment, null, false));
    clip2.push(x.o = new Intersection(p1, null, x, true));
  });
  if (!subject.length)
    return;
  clip2.sort(compareIntersection2);
  link(subject);
  link(clip2);
  for (i = 0, n = clip2.length; i < n; ++i) {
    clip2[i].e = startInside = !startInside;
  }
  var start2 = subject[0], points, point2;
  while (1) {
    var current = start2, isSubject = true;
    while (current.v)
      if ((current = current.n) === start2)
        return;
    points = current.z;
    stream.lineStart();
    do {
      current.v = current.o.v = true;
      if (current.e) {
        if (isSubject) {
          for (i = 0, n = points.length; i < n; ++i)
            stream.point((point2 = points[i])[0], point2[1]);
        } else {
          interpolate2(current.x, current.n.x, 1, stream);
        }
        current = current.n;
      } else {
        if (isSubject) {
          points = current.p.z;
          for (i = points.length - 1; i >= 0; --i)
            stream.point((point2 = points[i])[0], point2[1]);
        } else {
          interpolate2(current.x, current.p.x, -1, stream);
        }
        current = current.p;
      }
      current = current.o;
      points = current.z;
      isSubject = !isSubject;
    } while (!current.v);
    stream.lineEnd();
  }
}
function link(array2) {
  if (!(n = array2.length))
    return;
  var n, i = 0, a2 = array2[0], b;
  while (++i < n) {
    a2.n = b = array2[i];
    b.p = a2;
    a2 = b;
  }
  a2.n = b = array2[0];
  b.p = a2;
}
function longitude(point2) {
  return abs(point2[0]) <= pi$2 ? point2[0] : sign(point2[0]) * ((abs(point2[0]) + pi$2) % tau$2 - pi$2);
}
function polygonContains(polygon, point2) {
  var lambda = longitude(point2), phi = point2[1], sinPhi = sin$1(phi), normal = [sin$1(lambda), -cos$1(lambda), 0], angle = 0, winding = 0;
  var sum2 = new Adder();
  if (sinPhi === 1)
    phi = halfPi + epsilon;
  else if (sinPhi === -1)
    phi = -halfPi - epsilon;
  for (var i = 0, n = polygon.length; i < n; ++i) {
    if (!(m = (ring = polygon[i]).length))
      continue;
    var ring, m, point0 = ring[m - 1], lambda0 = longitude(point0), phi0 = point0[1] / 2 + quarterPi, sinPhi0 = sin$1(phi0), cosPhi0 = cos$1(phi0);
    for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
      var point1 = ring[j], lambda1 = longitude(point1), phi1 = point1[1] / 2 + quarterPi, sinPhi1 = sin$1(phi1), cosPhi1 = cos$1(phi1), delta = lambda1 - lambda0, sign2 = delta >= 0 ? 1 : -1, absDelta = sign2 * delta, antimeridian = absDelta > pi$2, k2 = sinPhi0 * sinPhi1;
      sum2.add(atan2(k2 * sign2 * sin$1(absDelta), cosPhi0 * cosPhi1 + k2 * cos$1(absDelta)));
      angle += antimeridian ? delta + sign2 * tau$2 : delta;
      if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
        var arc = cartesianCross(cartesian(point0), cartesian(point1));
        cartesianNormalizeInPlace(arc);
        var intersection = cartesianCross(normal, arc);
        cartesianNormalizeInPlace(intersection);
        var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
          winding += antimeridian ^ delta >= 0 ? 1 : -1;
        }
      }
    }
  }
  return (angle < -epsilon || angle < epsilon && sum2 < -epsilon2) ^ winding & 1;
}
function clip(pointVisible, clipLine2, interpolate2, start2) {
  return function(sink) {
    var line = clipLine2(sink), ringBuffer = clipBuffer(), ringSink = clipLine2(ringBuffer), polygonStarted = false, polygon, segments, ring;
    var clip2 = {
      point: point2,
      lineStart,
      lineEnd,
      polygonStart: function() {
        clip2.point = pointRing;
        clip2.lineStart = ringStart;
        clip2.lineEnd = ringEnd;
        segments = [];
        polygon = [];
      },
      polygonEnd: function() {
        clip2.point = point2;
        clip2.lineStart = lineStart;
        clip2.lineEnd = lineEnd;
        segments = merge(segments);
        var startInside = polygonContains(polygon, start2);
        if (segments.length) {
          if (!polygonStarted)
            sink.polygonStart(), polygonStarted = true;
          clipRejoin(segments, compareIntersection, startInside, interpolate2, sink);
        } else if (startInside) {
          if (!polygonStarted)
            sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          interpolate2(null, null, 1, sink);
          sink.lineEnd();
        }
        if (polygonStarted)
          sink.polygonEnd(), polygonStarted = false;
        segments = polygon = null;
      },
      sphere: function() {
        sink.polygonStart();
        sink.lineStart();
        interpolate2(null, null, 1, sink);
        sink.lineEnd();
        sink.polygonEnd();
      }
    };
    function point2(lambda, phi) {
      if (pointVisible(lambda, phi))
        sink.point(lambda, phi);
    }
    function pointLine(lambda, phi) {
      line.point(lambda, phi);
    }
    function lineStart() {
      clip2.point = pointLine;
      line.lineStart();
    }
    function lineEnd() {
      clip2.point = point2;
      line.lineEnd();
    }
    function pointRing(lambda, phi) {
      ring.push([lambda, phi]);
      ringSink.point(lambda, phi);
    }
    function ringStart() {
      ringSink.lineStart();
      ring = [];
    }
    function ringEnd() {
      pointRing(ring[0][0], ring[0][1]);
      ringSink.lineEnd();
      var clean = ringSink.clean(), ringSegments = ringBuffer.result(), i, n = ringSegments.length, m, segment, point3;
      ring.pop();
      polygon.push(ring);
      ring = null;
      if (!n)
        return;
      if (clean & 1) {
        segment = ringSegments[0];
        if ((m = segment.length - 1) > 0) {
          if (!polygonStarted)
            sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          for (i = 0; i < m; ++i)
            sink.point((point3 = segment[i])[0], point3[1]);
          sink.lineEnd();
        }
        return;
      }
      if (n > 1 && clean & 2)
        ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
      segments.push(ringSegments.filter(validSegment));
    }
    return clip2;
  };
}
function validSegment(segment) {
  return segment.length > 1;
}
function compareIntersection(a2, b) {
  return ((a2 = a2.x)[0] < 0 ? a2[1] - halfPi - epsilon : halfPi - a2[1]) - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
}
const clipAntimeridian = clip(
  function() {
    return true;
  },
  clipAntimeridianLine,
  clipAntimeridianInterpolate,
  [-pi$2, -halfPi]
);
function clipAntimeridianLine(stream) {
  var lambda0 = NaN, phi0 = NaN, sign0 = NaN, clean;
  return {
    lineStart: function() {
      stream.lineStart();
      clean = 1;
    },
    point: function(lambda1, phi1) {
      var sign1 = lambda1 > 0 ? pi$2 : -pi$2, delta = abs(lambda1 - lambda0);
      if (abs(delta - pi$2) < epsilon) {
        stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        stream.point(lambda1, phi0);
        clean = 0;
      } else if (sign0 !== sign1 && delta >= pi$2) {
        if (abs(lambda0 - sign0) < epsilon)
          lambda0 -= sign0 * epsilon;
        if (abs(lambda1 - sign1) < epsilon)
          lambda1 -= sign1 * epsilon;
        phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        clean = 0;
      }
      stream.point(lambda0 = lambda1, phi0 = phi1);
      sign0 = sign1;
    },
    lineEnd: function() {
      stream.lineEnd();
      lambda0 = phi0 = NaN;
    },
    clean: function() {
      return 2 - clean;
    }
  };
}
function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
  var cosPhi0, cosPhi1, sinLambda0Lambda1 = sin$1(lambda0 - lambda1);
  return abs(sinLambda0Lambda1) > epsilon ? atan((sin$1(phi0) * (cosPhi1 = cos$1(phi1)) * sin$1(lambda1) - sin$1(phi1) * (cosPhi0 = cos$1(phi0)) * sin$1(lambda0)) / (cosPhi0 * cosPhi1 * sinLambda0Lambda1)) : (phi0 + phi1) / 2;
}
function clipAntimeridianInterpolate(from, to, direction, stream) {
  var phi;
  if (from == null) {
    phi = direction * halfPi;
    stream.point(-pi$2, phi);
    stream.point(0, phi);
    stream.point(pi$2, phi);
    stream.point(pi$2, 0);
    stream.point(pi$2, -phi);
    stream.point(0, -phi);
    stream.point(-pi$2, -phi);
    stream.point(-pi$2, 0);
    stream.point(-pi$2, phi);
  } else if (abs(from[0] - to[0]) > epsilon) {
    var lambda = from[0] < to[0] ? pi$2 : -pi$2;
    phi = direction * lambda / 2;
    stream.point(-lambda, phi);
    stream.point(0, phi);
    stream.point(lambda, phi);
  } else {
    stream.point(to[0], to[1]);
  }
}
function clipCircle(radius2) {
  var cr = cos$1(radius2), delta = 6 * radians$1, smallRadius = cr > 0, notHemisphere = abs(cr) > epsilon;
  function interpolate2(from, to, direction, stream) {
    circleStream(stream, radius2, delta, direction, from, to);
  }
  function visible(lambda, phi) {
    return cos$1(lambda) * cos$1(phi) > cr;
  }
  function clipLine2(stream) {
    var point0, c0, v0, v00, clean;
    return {
      lineStart: function() {
        v00 = v0 = false;
        clean = 1;
      },
      point: function(lambda, phi) {
        var point1 = [lambda, phi], point2, v = visible(lambda, phi), c2 = smallRadius ? v ? 0 : code(lambda, phi) : v ? code(lambda + (lambda < 0 ? pi$2 : -pi$2), phi) : 0;
        if (!point0 && (v00 = v0 = v))
          stream.lineStart();
        if (v !== v0) {
          point2 = intersect(point0, point1);
          if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2))
            point1[2] = 1;
        }
        if (v !== v0) {
          clean = 0;
          if (v) {
            stream.lineStart();
            point2 = intersect(point1, point0);
            stream.point(point2[0], point2[1]);
          } else {
            point2 = intersect(point0, point1);
            stream.point(point2[0], point2[1], 2);
            stream.lineEnd();
          }
          point0 = point2;
        } else if (notHemisphere && point0 && smallRadius ^ v) {
          var t;
          if (!(c2 & c0) && (t = intersect(point1, point0, true))) {
            clean = 0;
            if (smallRadius) {
              stream.lineStart();
              stream.point(t[0][0], t[0][1]);
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
            } else {
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
              stream.lineStart();
              stream.point(t[0][0], t[0][1], 3);
            }
          }
        }
        if (v && (!point0 || !pointEqual(point0, point1))) {
          stream.point(point1[0], point1[1]);
        }
        point0 = point1, v0 = v, c0 = c2;
      },
      lineEnd: function() {
        if (v0)
          stream.lineEnd();
        point0 = null;
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean: function() {
        return clean | (v00 && v0) << 1;
      }
    };
  }
  function intersect(a2, b, two) {
    var pa = cartesian(a2), pb = cartesian(b);
    var n1 = [1, 0, 0], n2 = cartesianCross(pa, pb), n2n2 = cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
    if (!determinant)
      return !two && a2;
    var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = cartesianCross(n1, n2), A5 = cartesianScale(n1, c1), B2 = cartesianScale(n2, c2);
    cartesianAddInPlace(A5, B2);
    var u = n1xn2, w = cartesianDot(A5, u), uu = cartesianDot(u, u), t22 = w * w - uu * (cartesianDot(A5, A5) - 1);
    if (t22 < 0)
      return;
    var t = sqrt$1(t22), q = cartesianScale(u, (-w - t) / uu);
    cartesianAddInPlace(q, A5);
    q = spherical(q);
    if (!two)
      return q;
    var lambda0 = a2[0], lambda1 = b[0], phi0 = a2[1], phi1 = b[1], z;
    if (lambda1 < lambda0)
      z = lambda0, lambda0 = lambda1, lambda1 = z;
    var delta2 = lambda1 - lambda0, polar = abs(delta2 - pi$2) < epsilon, meridian = polar || delta2 < epsilon;
    if (!polar && phi1 < phi0)
      z = phi0, phi0 = phi1, phi1 = z;
    if (meridian ? polar ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1) : phi0 <= q[1] && q[1] <= phi1 : delta2 > pi$2 ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
      var q1 = cartesianScale(u, (-w + t) / uu);
      cartesianAddInPlace(q1, A5);
      return [q, spherical(q1)];
    }
  }
  function code(lambda, phi) {
    var r = smallRadius ? radius2 : pi$2 - radius2, code2 = 0;
    if (lambda < -r)
      code2 |= 1;
    else if (lambda > r)
      code2 |= 2;
    if (phi < -r)
      code2 |= 4;
    else if (phi > r)
      code2 |= 8;
    return code2;
  }
  return clip(visible, clipLine2, interpolate2, smallRadius ? [0, -radius2] : [-pi$2, radius2 - pi$2]);
}
function clipLine(a2, b, x02, y02, x12, y12) {
  var ax = a2[0], ay = a2[1], bx = b[0], by = b[1], t02 = 0, t12 = 1, dx = bx - ax, dy = by - ay, r;
  r = x02 - ax;
  if (!dx && r > 0)
    return;
  r /= dx;
  if (dx < 0) {
    if (r < t02)
      return;
    if (r < t12)
      t12 = r;
  } else if (dx > 0) {
    if (r > t12)
      return;
    if (r > t02)
      t02 = r;
  }
  r = x12 - ax;
  if (!dx && r < 0)
    return;
  r /= dx;
  if (dx < 0) {
    if (r > t12)
      return;
    if (r > t02)
      t02 = r;
  } else if (dx > 0) {
    if (r < t02)
      return;
    if (r < t12)
      t12 = r;
  }
  r = y02 - ay;
  if (!dy && r > 0)
    return;
  r /= dy;
  if (dy < 0) {
    if (r < t02)
      return;
    if (r < t12)
      t12 = r;
  } else if (dy > 0) {
    if (r > t12)
      return;
    if (r > t02)
      t02 = r;
  }
  r = y12 - ay;
  if (!dy && r < 0)
    return;
  r /= dy;
  if (dy < 0) {
    if (r > t12)
      return;
    if (r > t02)
      t02 = r;
  } else if (dy > 0) {
    if (r < t02)
      return;
    if (r < t12)
      t12 = r;
  }
  if (t02 > 0)
    a2[0] = ax + t02 * dx, a2[1] = ay + t02 * dy;
  if (t12 < 1)
    b[0] = ax + t12 * dx, b[1] = ay + t12 * dy;
  return true;
}
var clipMax = 1e9, clipMin = -clipMax;
function clipRectangle(x02, y02, x12, y12) {
  function visible(x, y) {
    return x02 <= x && x <= x12 && y02 <= y && y <= y12;
  }
  function interpolate2(from, to, direction, stream) {
    var a2 = 0, a1 = 0;
    if (from == null || (a2 = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoint(from, to) < 0 ^ direction > 0) {
      do
        stream.point(a2 === 0 || a2 === 3 ? x02 : x12, a2 > 1 ? y12 : y02);
      while ((a2 = (a2 + direction + 4) % 4) !== a1);
    } else {
      stream.point(to[0], to[1]);
    }
  }
  function corner(p, direction) {
    return abs(p[0] - x02) < epsilon ? direction > 0 ? 0 : 3 : abs(p[0] - x12) < epsilon ? direction > 0 ? 2 : 1 : abs(p[1] - y02) < epsilon ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
  }
  function compareIntersection2(a2, b) {
    return comparePoint(a2.x, b.x);
  }
  function comparePoint(a2, b) {
    var ca = corner(a2, 1), cb = corner(b, 1);
    return ca !== cb ? ca - cb : ca === 0 ? b[1] - a2[1] : ca === 1 ? a2[0] - b[0] : ca === 2 ? a2[1] - b[1] : b[0] - a2[0];
  }
  return function(stream) {
    var activeStream = stream, bufferStream = clipBuffer(), segments, polygon, ring, x__, y__, v__, x_, y_, v_, first2, clean;
    var clipStream = {
      point: point2,
      lineStart,
      lineEnd,
      polygonStart,
      polygonEnd
    };
    function point2(x, y) {
      if (visible(x, y))
        activeStream.point(x, y);
    }
    function polygonInside() {
      var winding = 0;
      for (var i = 0, n = polygon.length; i < n; ++i) {
        for (var ring2 = polygon[i], j = 1, m = ring2.length, point3 = ring2[0], a0, a1, b0 = point3[0], b1 = point3[1]; j < m; ++j) {
          a0 = b0, a1 = b1, point3 = ring2[j], b0 = point3[0], b1 = point3[1];
          if (a1 <= y12) {
            if (b1 > y12 && (b0 - a0) * (y12 - a1) > (b1 - a1) * (x02 - a0))
              ++winding;
          } else {
            if (b1 <= y12 && (b0 - a0) * (y12 - a1) < (b1 - a1) * (x02 - a0))
              --winding;
          }
        }
      }
      return winding;
    }
    function polygonStart() {
      activeStream = bufferStream, segments = [], polygon = [], clean = true;
    }
    function polygonEnd() {
      var startInside = polygonInside(), cleanInside = clean && startInside, visible2 = (segments = merge(segments)).length;
      if (cleanInside || visible2) {
        stream.polygonStart();
        if (cleanInside) {
          stream.lineStart();
          interpolate2(null, null, 1, stream);
          stream.lineEnd();
        }
        if (visible2) {
          clipRejoin(segments, compareIntersection2, startInside, interpolate2, stream);
        }
        stream.polygonEnd();
      }
      activeStream = stream, segments = polygon = ring = null;
    }
    function lineStart() {
      clipStream.point = linePoint;
      if (polygon)
        polygon.push(ring = []);
      first2 = true;
      v_ = false;
      x_ = y_ = NaN;
    }
    function lineEnd() {
      if (segments) {
        linePoint(x__, y__);
        if (v__ && v_)
          bufferStream.rejoin();
        segments.push(bufferStream.result());
      }
      clipStream.point = point2;
      if (v_)
        activeStream.lineEnd();
    }
    function linePoint(x, y) {
      var v = visible(x, y);
      if (polygon)
        ring.push([x, y]);
      if (first2) {
        x__ = x, y__ = y, v__ = v;
        first2 = false;
        if (v) {
          activeStream.lineStart();
          activeStream.point(x, y);
        }
      } else {
        if (v && v_)
          activeStream.point(x, y);
        else {
          var a2 = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))], b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
          if (clipLine(a2, b, x02, y02, x12, y12)) {
            if (!v_) {
              activeStream.lineStart();
              activeStream.point(a2[0], a2[1]);
            }
            activeStream.point(b[0], b[1]);
            if (!v)
              activeStream.lineEnd();
            clean = false;
          } else if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
            clean = false;
          }
        }
      }
      x_ = x, y_ = y, v_ = v;
    }
    return clipStream;
  };
}
const identity$4 = (x) => x;
var areaSum = new Adder(), areaRingSum = new Adder(), x00$2, y00$2, x0$3, y0$3;
var areaStream = {
  point: noop,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: function() {
    areaStream.lineStart = areaRingStart;
    areaStream.lineEnd = areaRingEnd;
  },
  polygonEnd: function() {
    areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop;
    areaSum.add(abs(areaRingSum));
    areaRingSum = new Adder();
  },
  result: function() {
    var area = areaSum / 2;
    areaSum = new Adder();
    return area;
  }
};
function areaRingStart() {
  areaStream.point = areaPointFirst;
}
function areaPointFirst(x, y) {
  areaStream.point = areaPoint;
  x00$2 = x0$3 = x, y00$2 = y0$3 = y;
}
function areaPoint(x, y) {
  areaRingSum.add(y0$3 * x - x0$3 * y);
  x0$3 = x, y0$3 = y;
}
function areaRingEnd() {
  areaPoint(x00$2, y00$2);
}
const pathArea = areaStream;
var x0$2 = Infinity, y0$2 = x0$2, x1 = -x0$2, y1 = x1;
var boundsStream = {
  point: boundsPoint,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop,
  result: function() {
    var bounds = [[x0$2, y0$2], [x1, y1]];
    x1 = y1 = -(y0$2 = x0$2 = Infinity);
    return bounds;
  }
};
function boundsPoint(x, y) {
  if (x < x0$2)
    x0$2 = x;
  if (x > x1)
    x1 = x;
  if (y < y0$2)
    y0$2 = y;
  if (y > y1)
    y1 = y;
}
const boundsStream$1 = boundsStream;
var X0 = 0, Y0 = 0, Z0 = 0, X1 = 0, Y1 = 0, Z1 = 0, X2 = 0, Y2 = 0, Z2 = 0, x00$1, y00$1, x0$1, y0$1;
var centroidStream = {
  point: centroidPoint,
  lineStart: centroidLineStart,
  lineEnd: centroidLineEnd,
  polygonStart: function() {
    centroidStream.lineStart = centroidRingStart;
    centroidStream.lineEnd = centroidRingEnd;
  },
  polygonEnd: function() {
    centroidStream.point = centroidPoint;
    centroidStream.lineStart = centroidLineStart;
    centroidStream.lineEnd = centroidLineEnd;
  },
  result: function() {
    var centroid = Z2 ? [X2 / Z2, Y2 / Z2] : Z1 ? [X1 / Z1, Y1 / Z1] : Z0 ? [X0 / Z0, Y0 / Z0] : [NaN, NaN];
    X0 = Y0 = Z0 = X1 = Y1 = Z1 = X2 = Y2 = Z2 = 0;
    return centroid;
  }
};
function centroidPoint(x, y) {
  X0 += x;
  Y0 += y;
  ++Z0;
}
function centroidLineStart() {
  centroidStream.point = centroidPointFirstLine;
}
function centroidPointFirstLine(x, y) {
  centroidStream.point = centroidPointLine;
  centroidPoint(x0$1 = x, y0$1 = y);
}
function centroidPointLine(x, y) {
  var dx = x - x0$1, dy = y - y0$1, z = sqrt$1(dx * dx + dy * dy);
  X1 += z * (x0$1 + x) / 2;
  Y1 += z * (y0$1 + y) / 2;
  Z1 += z;
  centroidPoint(x0$1 = x, y0$1 = y);
}
function centroidLineEnd() {
  centroidStream.point = centroidPoint;
}
function centroidRingStart() {
  centroidStream.point = centroidPointFirstRing;
}
function centroidRingEnd() {
  centroidPointRing(x00$1, y00$1);
}
function centroidPointFirstRing(x, y) {
  centroidStream.point = centroidPointRing;
  centroidPoint(x00$1 = x0$1 = x, y00$1 = y0$1 = y);
}
function centroidPointRing(x, y) {
  var dx = x - x0$1, dy = y - y0$1, z = sqrt$1(dx * dx + dy * dy);
  X1 += z * (x0$1 + x) / 2;
  Y1 += z * (y0$1 + y) / 2;
  Z1 += z;
  z = y0$1 * x - x0$1 * y;
  X2 += z * (x0$1 + x);
  Y2 += z * (y0$1 + y);
  Z2 += z * 3;
  centroidPoint(x0$1 = x, y0$1 = y);
}
const pathCentroid = centroidStream;
function PathContext(context) {
  this._context = context;
}
PathContext.prototype = {
  _radius: 4.5,
  pointRadius: function(_) {
    return this._radius = _, this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0)
      this._context.closePath();
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x, y);
        this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(x, y);
        break;
      }
      default: {
        this._context.moveTo(x + this._radius, y);
        this._context.arc(x, y, this._radius, 0, tau$2);
        break;
      }
    }
  },
  result: noop
};
var lengthSum = new Adder(), lengthRing, x00, y00, x0, y0;
var lengthStream = {
  point: noop,
  lineStart: function() {
    lengthStream.point = lengthPointFirst;
  },
  lineEnd: function() {
    if (lengthRing)
      lengthPoint(x00, y00);
    lengthStream.point = noop;
  },
  polygonStart: function() {
    lengthRing = true;
  },
  polygonEnd: function() {
    lengthRing = null;
  },
  result: function() {
    var length2 = +lengthSum;
    lengthSum = new Adder();
    return length2;
  }
};
function lengthPointFirst(x, y) {
  lengthStream.point = lengthPoint;
  x00 = x0 = x, y00 = y0 = y;
}
function lengthPoint(x, y) {
  x0 -= x, y0 -= y;
  lengthSum.add(sqrt$1(x0 * x0 + y0 * y0));
  x0 = x, y0 = y;
}
const pathMeasure = lengthStream;
let cacheDigits, cacheAppend, cacheRadius, cacheCircle;
class PathString {
  constructor(digits) {
    this._append = digits == null ? append : appendRound(digits);
    this._radius = 4.5;
    this._ = "";
  }
  pointRadius(_) {
    this._radius = +_;
    return this;
  }
  polygonStart() {
    this._line = 0;
  }
  polygonEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    if (this._line === 0)
      this._ += "Z";
    this._point = NaN;
  }
  point(x, y) {
    switch (this._point) {
      case 0: {
        this._append`M${x},${y}`;
        this._point = 1;
        break;
      }
      case 1: {
        this._append`L${x},${y}`;
        break;
      }
      default: {
        this._append`M${x},${y}`;
        if (this._radius !== cacheRadius || this._append !== cacheAppend) {
          const r = this._radius;
          const s2 = this._;
          this._ = "";
          this._append`m0,${r}a${r},${r} 0 1,1 0,${-2 * r}a${r},${r} 0 1,1 0,${2 * r}z`;
          cacheRadius = r;
          cacheAppend = this._append;
          cacheCircle = this._;
          this._ = s2;
        }
        this._ += cacheCircle;
        break;
      }
    }
  }
  result() {
    const result = this._;
    this._ = "";
    return result.length ? result : null;
  }
}
function append(strings) {
  let i = 1;
  this._ += strings[0];
  for (const j = strings.length; i < j; ++i) {
    this._ += arguments[i] + strings[i];
  }
}
function appendRound(digits) {
  const d = Math.floor(digits);
  if (!(d >= 0))
    throw new RangeError(`invalid digits: ${digits}`);
  if (d > 15)
    return append;
  if (d !== cacheDigits) {
    const k2 = 10 ** d;
    cacheDigits = d;
    cacheAppend = function append2(strings) {
      let i = 1;
      this._ += strings[0];
      for (const j = strings.length; i < j; ++i) {
        this._ += Math.round(arguments[i] * k2) / k2 + strings[i];
      }
    };
  }
  return cacheAppend;
}
function geoPath(projection2, context) {
  let digits = 3, pointRadius = 4.5, projectionStream, contextStream;
  function path(object2) {
    if (object2) {
      if (typeof pointRadius === "function")
        contextStream.pointRadius(+pointRadius.apply(this, arguments));
      geoStream(object2, projectionStream(contextStream));
    }
    return contextStream.result();
  }
  path.area = function(object2) {
    geoStream(object2, projectionStream(pathArea));
    return pathArea.result();
  };
  path.measure = function(object2) {
    geoStream(object2, projectionStream(pathMeasure));
    return pathMeasure.result();
  };
  path.bounds = function(object2) {
    geoStream(object2, projectionStream(boundsStream$1));
    return boundsStream$1.result();
  };
  path.centroid = function(object2) {
    geoStream(object2, projectionStream(pathCentroid));
    return pathCentroid.result();
  };
  path.projection = function(_) {
    if (!arguments.length)
      return projection2;
    projectionStream = _ == null ? (projection2 = null, identity$4) : (projection2 = _).stream;
    return path;
  };
  path.context = function(_) {
    if (!arguments.length)
      return context;
    contextStream = _ == null ? (context = null, new PathString(digits)) : new PathContext(context = _);
    if (typeof pointRadius !== "function")
      contextStream.pointRadius(pointRadius);
    return path;
  };
  path.pointRadius = function(_) {
    if (!arguments.length)
      return pointRadius;
    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
    return path;
  };
  path.digits = function(_) {
    if (!arguments.length)
      return digits;
    if (_ == null)
      digits = null;
    else {
      const d = Math.floor(_);
      if (!(d >= 0))
        throw new RangeError(`invalid digits: ${_}`);
      digits = d;
    }
    if (context === null)
      contextStream = new PathString(digits);
    return path;
  };
  return path.projection(projection2).digits(digits).context(context);
}
function geoTransform(methods) {
  return {
    stream: transformer$2(methods)
  };
}
function transformer$2(methods) {
  return function(stream) {
    var s2 = new TransformStream();
    for (var key in methods)
      s2[key] = methods[key];
    s2.stream = stream;
    return s2;
  };
}
function TransformStream() {
}
TransformStream.prototype = {
  constructor: TransformStream,
  point: function(x, y) {
    this.stream.point(x, y);
  },
  sphere: function() {
    this.stream.sphere();
  },
  lineStart: function() {
    this.stream.lineStart();
  },
  lineEnd: function() {
    this.stream.lineEnd();
  },
  polygonStart: function() {
    this.stream.polygonStart();
  },
  polygonEnd: function() {
    this.stream.polygonEnd();
  }
};
function fit(projection2, fitBounds, object2) {
  var clip2 = projection2.clipExtent && projection2.clipExtent();
  projection2.scale(150).translate([0, 0]);
  if (clip2 != null)
    projection2.clipExtent(null);
  geoStream(object2, projection2.stream(boundsStream$1));
  fitBounds(boundsStream$1.result());
  if (clip2 != null)
    projection2.clipExtent(clip2);
  return projection2;
}
function fitExtent(projection2, extent2, object2) {
  return fit(projection2, function(b) {
    var w = extent2[1][0] - extent2[0][0], h = extent2[1][1] - extent2[0][1], k2 = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])), x = +extent2[0][0] + (w - k2 * (b[1][0] + b[0][0])) / 2, y = +extent2[0][1] + (h - k2 * (b[1][1] + b[0][1])) / 2;
    projection2.scale(150 * k2).translate([x, y]);
  }, object2);
}
function fitSize(projection2, size, object2) {
  return fitExtent(projection2, [[0, 0], size], object2);
}
function fitWidth(projection2, width, object2) {
  return fit(projection2, function(b) {
    var w = +width, k2 = w / (b[1][0] - b[0][0]), x = (w - k2 * (b[1][0] + b[0][0])) / 2, y = -k2 * b[0][1];
    projection2.scale(150 * k2).translate([x, y]);
  }, object2);
}
function fitHeight(projection2, height, object2) {
  return fit(projection2, function(b) {
    var h = +height, k2 = h / (b[1][1] - b[0][1]), x = -k2 * b[0][0], y = (h - k2 * (b[1][1] + b[0][1])) / 2;
    projection2.scale(150 * k2).translate([x, y]);
  }, object2);
}
var maxDepth = 16, cosMinDistance = cos$1(30 * radians$1);
function resample(project2, delta2) {
  return +delta2 ? resample$1(project2, delta2) : resampleNone(project2);
}
function resampleNone(project2) {
  return transformer$2({
    point: function(x, y) {
      x = project2(x, y);
      this.stream.point(x[0], x[1]);
    }
  });
}
function resample$1(project2, delta2) {
  function resampleLineTo(x02, y02, lambda0, a0, b0, c0, x12, y12, lambda1, a1, b1, c1, depth, stream) {
    var dx = x12 - x02, dy = y12 - y02, d2 = dx * dx + dy * dy;
    if (d2 > 4 * delta2 && depth--) {
      var a2 = a0 + a1, b = b0 + b1, c2 = c0 + c1, m = sqrt$1(a2 * a2 + b * b + c2 * c2), phi2 = asin(c2 /= m), lambda2 = abs(abs(c2) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a2), p = project2(lambda2, phi2), x2 = p[0], y2 = p[1], dx2 = x2 - x02, dy2 = y2 - y02, dz = dy * dx2 - dx * dy2;
      if (dz * dz / d2 > delta2 || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
        resampleLineTo(x02, y02, lambda0, a0, b0, c0, x2, y2, lambda2, a2 /= m, b /= m, c2, depth, stream);
        stream.point(x2, y2);
        resampleLineTo(x2, y2, lambda2, a2, b, c2, x12, y12, lambda1, a1, b1, c1, depth, stream);
      }
    }
  }
  return function(stream) {
    var lambda00, x002, y002, a00, b00, c00, lambda0, x02, y02, a0, b0, c0;
    var resampleStream = {
      point: point2,
      lineStart,
      lineEnd,
      polygonStart: function() {
        stream.polygonStart();
        resampleStream.lineStart = ringStart;
      },
      polygonEnd: function() {
        stream.polygonEnd();
        resampleStream.lineStart = lineStart;
      }
    };
    function point2(x, y) {
      x = project2(x, y);
      stream.point(x[0], x[1]);
    }
    function lineStart() {
      x02 = NaN;
      resampleStream.point = linePoint;
      stream.lineStart();
    }
    function linePoint(lambda, phi) {
      var c2 = cartesian([lambda, phi]), p = project2(lambda, phi);
      resampleLineTo(x02, y02, lambda0, a0, b0, c0, x02 = p[0], y02 = p[1], lambda0 = lambda, a0 = c2[0], b0 = c2[1], c0 = c2[2], maxDepth, stream);
      stream.point(x02, y02);
    }
    function lineEnd() {
      resampleStream.point = point2;
      stream.lineEnd();
    }
    function ringStart() {
      lineStart();
      resampleStream.point = ringPoint;
      resampleStream.lineEnd = ringEnd;
    }
    function ringPoint(lambda, phi) {
      linePoint(lambda00 = lambda, phi), x002 = x02, y002 = y02, a00 = a0, b00 = b0, c00 = c0;
      resampleStream.point = linePoint;
    }
    function ringEnd() {
      resampleLineTo(x02, y02, lambda0, a0, b0, c0, x002, y002, lambda00, a00, b00, c00, maxDepth, stream);
      resampleStream.lineEnd = lineEnd;
      lineEnd();
    }
    return resampleStream;
  };
}
var transformRadians = transformer$2({
  point: function(x, y) {
    this.stream.point(x * radians$1, y * radians$1);
  }
});
function transformRotate(rotate) {
  return transformer$2({
    point: function(x, y) {
      var r = rotate(x, y);
      return this.stream.point(r[0], r[1]);
    }
  });
}
function scaleTranslate(k2, dx, dy, sx, sy) {
  function transform(x, y) {
    x *= sx;
    y *= sy;
    return [dx + k2 * x, dy - k2 * y];
  }
  transform.invert = function(x, y) {
    return [(x - dx) / k2 * sx, (dy - y) / k2 * sy];
  };
  return transform;
}
function scaleTranslateRotate(k2, dx, dy, sx, sy, alpha) {
  if (!alpha)
    return scaleTranslate(k2, dx, dy, sx, sy);
  var cosAlpha = cos$1(alpha), sinAlpha = sin$1(alpha), a2 = cosAlpha * k2, b = sinAlpha * k2, ai = cosAlpha / k2, bi = sinAlpha / k2, ci = (sinAlpha * dy - cosAlpha * dx) / k2, fi = (sinAlpha * dx + cosAlpha * dy) / k2;
  function transform(x, y) {
    x *= sx;
    y *= sy;
    return [a2 * x - b * y + dx, dy - b * x - a2 * y];
  }
  transform.invert = function(x, y) {
    return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
  };
  return transform;
}
function projection(project2) {
  return projectionMutator(function() {
    return project2;
  })();
}
function projectionMutator(projectAt) {
  var project2, k2 = 150, x = 480, y = 250, lambda = 0, phi = 0, deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, alpha = 0, sx = 1, sy = 1, theta = null, preclip = clipAntimeridian, x02 = null, y02, x12, y12, postclip = identity$4, delta2 = 0.5, projectResample, projectTransform, projectRotateTransform, cache, cacheStream;
  function projection2(point2) {
    return projectRotateTransform(point2[0] * radians$1, point2[1] * radians$1);
  }
  function invert(point2) {
    point2 = projectRotateTransform.invert(point2[0], point2[1]);
    return point2 && [point2[0] * degrees, point2[1] * degrees];
  }
  projection2.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
  };
  projection2.preclip = function(_) {
    return arguments.length ? (preclip = _, theta = void 0, reset2()) : preclip;
  };
  projection2.postclip = function(_) {
    return arguments.length ? (postclip = _, x02 = y02 = x12 = y12 = null, reset2()) : postclip;
  };
  projection2.clipAngle = function(_) {
    return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians$1) : (theta = null, clipAntimeridian), reset2()) : theta * degrees;
  };
  projection2.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x02 = y02 = x12 = y12 = null, identity$4) : clipRectangle(x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reset2()) : x02 == null ? null : [[x02, y02], [x12, y12]];
  };
  projection2.scale = function(_) {
    return arguments.length ? (k2 = +_, recenter()) : k2;
  };
  projection2.translate = function(_) {
    return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
  };
  projection2.center = function(_) {
    return arguments.length ? (lambda = _[0] % 360 * radians$1, phi = _[1] % 360 * radians$1, recenter()) : [lambda * degrees, phi * degrees];
  };
  projection2.rotate = function(_) {
    return arguments.length ? (deltaLambda = _[0] % 360 * radians$1, deltaPhi = _[1] % 360 * radians$1, deltaGamma = _.length > 2 ? _[2] % 360 * radians$1 : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
  };
  projection2.angle = function(_) {
    return arguments.length ? (alpha = _ % 360 * radians$1, recenter()) : alpha * degrees;
  };
  projection2.reflectX = function(_) {
    return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
  };
  projection2.reflectY = function(_) {
    return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
  };
  projection2.precision = function(_) {
    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset2()) : sqrt$1(delta2);
  };
  projection2.fitExtent = function(extent2, object2) {
    return fitExtent(projection2, extent2, object2);
  };
  projection2.fitSize = function(size, object2) {
    return fitSize(projection2, size, object2);
  };
  projection2.fitWidth = function(width, object2) {
    return fitWidth(projection2, width, object2);
  };
  projection2.fitHeight = function(height, object2) {
    return fitHeight(projection2, height, object2);
  };
  function recenter() {
    var center2 = scaleTranslateRotate(k2, 0, 0, sx, sy, alpha).apply(null, project2(lambda, phi)), transform = scaleTranslateRotate(k2, x - center2[0], y - center2[1], sx, sy, alpha);
    rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
    projectTransform = compose(project2, transform);
    projectRotateTransform = compose(rotate, projectTransform);
    projectResample = resample(projectTransform, delta2);
    return reset2();
  }
  function reset2() {
    cache = cacheStream = null;
    return projection2;
  }
  return function() {
    project2 = projectAt.apply(this, arguments);
    projection2.invert = project2.invert && invert;
    return recenter();
  };
}
function conicProjection$1(projectAt) {
  var phi0 = 0, phi1 = pi$2 / 3, m = projectionMutator(projectAt), p = m(phi0, phi1);
  p.parallels = function(_) {
    return arguments.length ? m(phi0 = _[0] * radians$1, phi1 = _[1] * radians$1) : [phi0 * degrees, phi1 * degrees];
  };
  return p;
}
function cylindricalEqualAreaRaw(phi0) {
  var cosPhi0 = cos$1(phi0);
  function forward(lambda, phi) {
    return [lambda * cosPhi0, sin$1(phi) / cosPhi0];
  }
  forward.invert = function(x, y) {
    return [x / cosPhi0, asin(y * cosPhi0)];
  };
  return forward;
}
function conicEqualAreaRaw(y02, y12) {
  var sy0 = sin$1(y02), n = (sy0 + sin$1(y12)) / 2;
  if (abs(n) < epsilon)
    return cylindricalEqualAreaRaw(y02);
  var c2 = 1 + sy0 * (2 * n - sy0), r0 = sqrt$1(c2) / n;
  function project2(x, y) {
    var r = sqrt$1(c2 - 2 * n * sin$1(y)) / n;
    return [r * sin$1(x *= n), r0 - r * cos$1(x)];
  }
  project2.invert = function(x, y) {
    var r0y = r0 - y, l = atan2(x, abs(r0y)) * sign(r0y);
    if (r0y * n < 0)
      l -= pi$2 * sign(x) * sign(r0y);
    return [l / n, asin((c2 - (x * x + r0y * r0y) * n * n) / (2 * n))];
  };
  return project2;
}
function geoConicEqualArea() {
  return conicProjection$1(conicEqualAreaRaw).scale(155.424).center([0, 33.6442]);
}
function geoAlbers() {
  return geoConicEqualArea().parallels([29.5, 45.5]).scale(1070).translate([480, 250]).rotate([96, 0]).center([-0.6, 38.7]);
}
function multiplex(streams) {
  var n = streams.length;
  return {
    point: function(x, y) {
      var i = -1;
      while (++i < n)
        streams[i].point(x, y);
    },
    sphere: function() {
      var i = -1;
      while (++i < n)
        streams[i].sphere();
    },
    lineStart: function() {
      var i = -1;
      while (++i < n)
        streams[i].lineStart();
    },
    lineEnd: function() {
      var i = -1;
      while (++i < n)
        streams[i].lineEnd();
    },
    polygonStart: function() {
      var i = -1;
      while (++i < n)
        streams[i].polygonStart();
    },
    polygonEnd: function() {
      var i = -1;
      while (++i < n)
        streams[i].polygonEnd();
    }
  };
}
function geoAlbersUsa() {
  var cache, cacheStream, lower48 = geoAlbers(), lower48Point, alaska = geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, hawaii = geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, point2, pointStream = { point: function(x, y) {
    point2 = [x, y];
  } };
  function albersUsa(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    return point2 = null, (lower48Point.point(x, y), point2) || (alaskaPoint.point(x, y), point2) || (hawaiiPoint.point(x, y), point2);
  }
  albersUsa.invert = function(coordinates) {
    var k2 = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k2, y = (coordinates[1] - t[1]) / k2;
    return (y >= 0.12 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii : lower48).invert(coordinates);
  };
  albersUsa.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
  };
  albersUsa.precision = function(_) {
    if (!arguments.length)
      return lower48.precision();
    lower48.precision(_), alaska.precision(_), hawaii.precision(_);
    return reset2();
  };
  albersUsa.scale = function(_) {
    if (!arguments.length)
      return lower48.scale();
    lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
    return albersUsa.translate(lower48.translate());
  };
  albersUsa.translate = function(_) {
    if (!arguments.length)
      return lower48.translate();
    var k2 = lower48.scale(), x = +_[0], y = +_[1];
    lower48Point = lower48.translate(_).clipExtent([[x - 0.455 * k2, y - 0.238 * k2], [x + 0.455 * k2, y + 0.238 * k2]]).stream(pointStream);
    alaskaPoint = alaska.translate([x - 0.307 * k2, y + 0.201 * k2]).clipExtent([[x - 0.425 * k2 + epsilon, y + 0.12 * k2 + epsilon], [x - 0.214 * k2 - epsilon, y + 0.234 * k2 - epsilon]]).stream(pointStream);
    hawaiiPoint = hawaii.translate([x - 0.205 * k2, y + 0.212 * k2]).clipExtent([[x - 0.214 * k2 + epsilon, y + 0.166 * k2 + epsilon], [x - 0.115 * k2 - epsilon, y + 0.234 * k2 - epsilon]]).stream(pointStream);
    return reset2();
  };
  albersUsa.fitExtent = function(extent2, object2) {
    return fitExtent(albersUsa, extent2, object2);
  };
  albersUsa.fitSize = function(size, object2) {
    return fitSize(albersUsa, size, object2);
  };
  albersUsa.fitWidth = function(width, object2) {
    return fitWidth(albersUsa, width, object2);
  };
  albersUsa.fitHeight = function(height, object2) {
    return fitHeight(albersUsa, height, object2);
  };
  function reset2() {
    cache = cacheStream = null;
    return albersUsa;
  }
  return albersUsa.scale(1070);
}
function azimuthalRaw(scale) {
  return function(x, y) {
    var cx = cos$1(x), cy = cos$1(y), k2 = scale(cx * cy);
    if (k2 === Infinity)
      return [2, 0];
    return [
      k2 * cy * sin$1(x),
      k2 * sin$1(y)
    ];
  };
}
function azimuthalInvert(angle) {
  return function(x, y) {
    var z = sqrt$1(x * x + y * y), c2 = angle(z), sc = sin$1(c2), cc = cos$1(c2);
    return [
      atan2(x * sc, z * cc),
      asin(z && y * sc / z)
    ];
  };
}
var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
  return sqrt$1(2 / (1 + cxcy));
});
azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
  return 2 * asin(z / 2);
});
function geoAzimuthalEqualArea() {
  return projection(azimuthalEqualAreaRaw).scale(124.75).clipAngle(180 - 1e-3);
}
var azimuthalEquidistantRaw = azimuthalRaw(function(c2) {
  return (c2 = acos(c2)) && c2 / sin$1(c2);
});
azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
  return z;
});
function geoAzimuthalEquidistant() {
  return projection(azimuthalEquidistantRaw).scale(79.4188).clipAngle(180 - 1e-3);
}
function mercatorRaw(lambda, phi) {
  return [lambda, log$1(tan((halfPi + phi) / 2))];
}
mercatorRaw.invert = function(x, y) {
  return [x, 2 * atan(exp(y)) - halfPi];
};
function geoMercator() {
  return mercatorProjection(mercatorRaw).scale(961 / tau$2);
}
function mercatorProjection(project2) {
  var m = projection(project2), center2 = m.center, scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, x02 = null, y02, x12, y12;
  m.scale = function(_) {
    return arguments.length ? (scale(_), reclip()) : scale();
  };
  m.translate = function(_) {
    return arguments.length ? (translate(_), reclip()) : translate();
  };
  m.center = function(_) {
    return arguments.length ? (center2(_), reclip()) : center2();
  };
  m.clipExtent = function(_) {
    return arguments.length ? (_ == null ? x02 = y02 = x12 = y12 = null : (x02 = +_[0][0], y02 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reclip()) : x02 == null ? null : [[x02, y02], [x12, y12]];
  };
  function reclip() {
    var k2 = pi$2 * scale(), t = m(rotation(m.rotate()).invert([0, 0]));
    return clipExtent(x02 == null ? [[t[0] - k2, t[1] - k2], [t[0] + k2, t[1] + k2]] : project2 === mercatorRaw ? [[Math.max(t[0] - k2, x02), y02], [Math.min(t[0] + k2, x12), y12]] : [[x02, Math.max(t[1] - k2, y02)], [x12, Math.min(t[1] + k2, y12)]]);
  }
  return reclip();
}
function tany(y) {
  return tan((halfPi + y) / 2);
}
function conicConformalRaw(y02, y12) {
  var cy0 = cos$1(y02), n = y02 === y12 ? sin$1(y02) : log$1(cy0 / cos$1(y12)) / log$1(tany(y12) / tany(y02)), f = cy0 * pow$1(tany(y02), n) / n;
  if (!n)
    return mercatorRaw;
  function project2(x, y) {
    if (f > 0) {
      if (y < -halfPi + epsilon)
        y = -halfPi + epsilon;
    } else {
      if (y > halfPi - epsilon)
        y = halfPi - epsilon;
    }
    var r = f / pow$1(tany(y), n);
    return [r * sin$1(n * x), f - r * cos$1(n * x)];
  }
  project2.invert = function(x, y) {
    var fy = f - y, r = sign(n) * sqrt$1(x * x + fy * fy), l = atan2(x, abs(fy)) * sign(fy);
    if (fy * n < 0)
      l -= pi$2 * sign(x) * sign(fy);
    return [l / n, 2 * atan(pow$1(f / r, 1 / n)) - halfPi];
  };
  return project2;
}
function geoConicConformal() {
  return conicProjection$1(conicConformalRaw).scale(109.5).parallels([30, 30]);
}
function equirectangularRaw(lambda, phi) {
  return [lambda, phi];
}
equirectangularRaw.invert = equirectangularRaw;
function geoEquirectangular() {
  return projection(equirectangularRaw).scale(152.63);
}
function conicEquidistantRaw(y02, y12) {
  var cy0 = cos$1(y02), n = y02 === y12 ? sin$1(y02) : (cy0 - cos$1(y12)) / (y12 - y02), g = cy0 / n + y02;
  if (abs(n) < epsilon)
    return equirectangularRaw;
  function project2(x, y) {
    var gy = g - y, nx = n * x;
    return [gy * sin$1(nx), g - gy * cos$1(nx)];
  }
  project2.invert = function(x, y) {
    var gy = g - y, l = atan2(x, abs(gy)) * sign(gy);
    if (gy * n < 0)
      l -= pi$2 * sign(x) * sign(gy);
    return [l / n, g - sign(n) * sqrt$1(x * x + gy * gy)];
  };
  return project2;
}
function geoConicEquidistant() {
  return conicProjection$1(conicEquidistantRaw).scale(131.154).center([0, 13.9389]);
}
var A1 = 1.340264, A2 = -0.081106, A3 = 893e-6, A4 = 3796e-6, M = sqrt$1(3) / 2, iterations = 12;
function equalEarthRaw(lambda, phi) {
  var l = asin(M * sin$1(phi)), l2 = l * l, l6 = l2 * l2 * l2;
  return [
    lambda * cos$1(l) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
    l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2))
  ];
}
equalEarthRaw.invert = function(x, y) {
  var l = y, l2 = l * l, l6 = l2 * l2 * l2;
  for (var i = 0, delta, fy, fpy; i < iterations; ++i) {
    fy = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y;
    fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
    l -= delta = fy / fpy, l2 = l * l, l6 = l2 * l2 * l2;
    if (abs(delta) < epsilon2)
      break;
  }
  return [
    M * x * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)) / cos$1(l),
    asin(sin$1(l) / M)
  ];
};
function geoEqualEarth() {
  return projection(equalEarthRaw).scale(177.158);
}
function gnomonicRaw(x, y) {
  var cy = cos$1(y), k2 = cos$1(x) * cy;
  return [cy * sin$1(x) / k2, sin$1(y) / k2];
}
gnomonicRaw.invert = azimuthalInvert(atan);
function geoGnomonic() {
  return projection(gnomonicRaw).scale(144.049).clipAngle(60);
}
function orthographicRaw(x, y) {
  return [cos$1(y) * sin$1(x), sin$1(y)];
}
orthographicRaw.invert = azimuthalInvert(asin);
function geoOrthographic() {
  return projection(orthographicRaw).scale(249.5).clipAngle(90 + epsilon);
}
function stereographicRaw(x, y) {
  var cy = cos$1(y), k2 = 1 + cos$1(x) * cy;
  return [cy * sin$1(x) / k2, sin$1(y) / k2];
}
stereographicRaw.invert = azimuthalInvert(function(z) {
  return 2 * atan(z);
});
function geoStereographic() {
  return projection(stereographicRaw).scale(250).clipAngle(142);
}
function transverseMercatorRaw(lambda, phi) {
  return [log$1(tan((halfPi + phi) / 2)), -lambda];
}
transverseMercatorRaw.invert = function(x, y) {
  return [-y, 2 * atan(exp(x)) - halfPi];
};
function geoTransverseMercator() {
  var m = mercatorProjection(transverseMercatorRaw), center2 = m.center, rotate = m.rotate;
  m.center = function(_) {
    return arguments.length ? center2([-_[1], _[0]]) : (_ = center2(), [_[1], -_[0]]);
  };
  m.rotate = function(_) {
    return arguments.length ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(), [_[0], _[1], _[2] - 90]);
  };
  return rotate([0, 0, 90]).scale(159.155);
}
function initRange(domain, range2) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(domain);
      break;
    default:
      this.range(range2).domain(domain);
      break;
  }
  return this;
}
function initInterpolator(domain, interpolator) {
  switch (arguments.length) {
    case 0:
      break;
    case 1: {
      if (typeof domain === "function")
        this.interpolator(domain);
      else
        this.range(domain);
      break;
    }
    default: {
      this.domain(domain);
      if (typeof interpolator === "function")
        this.interpolator(interpolator);
      else
        this.range(interpolator);
      break;
    }
  }
  return this;
}
const implicit = Symbol("implicit");
function ordinal() {
  var index2 = new InternMap(), domain = [], range2 = [], unknown = implicit;
  function scale(d) {
    let i = index2.get(d);
    if (i === void 0) {
      if (unknown !== implicit)
        return unknown;
      index2.set(d, i = domain.push(d) - 1);
    }
    return range2[i % range2.length];
  }
  scale.domain = function(_) {
    if (!arguments.length)
      return domain.slice();
    domain = [], index2 = new InternMap();
    for (const value of _) {
      if (index2.has(value))
        continue;
      index2.set(value, domain.push(value) - 1);
    }
    return scale;
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), scale) : range2.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.copy = function() {
    return ordinal(domain, range2).unknown(unknown);
  };
  initRange.apply(scale, arguments);
  return scale;
}
function band() {
  var scale = ordinal().unknown(void 0), domain = scale.domain, ordinalRange2 = scale.range, r0 = 0, r1 = 1, step, bandwidth, round = false, paddingInner = 0, paddingOuter = 0, align = 0.5;
  delete scale.unknown;
  function rescale() {
    var n = domain().length, reverse2 = r1 < r0, start2 = reverse2 ? r1 : r0, stop = reverse2 ? r0 : r1;
    step = (stop - start2) / Math.max(1, n - paddingInner + paddingOuter * 2);
    if (round)
      step = Math.floor(step);
    start2 += (stop - start2 - step * (n - paddingInner)) * align;
    bandwidth = step * (1 - paddingInner);
    if (round)
      start2 = Math.round(start2), bandwidth = Math.round(bandwidth);
    var values2 = range$1(n).map(function(i) {
      return start2 + step * i;
    });
    return ordinalRange2(reverse2 ? values2.reverse() : values2);
  }
  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };
  scale.range = function(_) {
    return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
  };
  scale.rangeRound = function(_) {
    return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
  };
  scale.bandwidth = function() {
    return bandwidth;
  };
  scale.step = function() {
    return step;
  };
  scale.round = function(_) {
    return arguments.length ? (round = !!_, rescale()) : round;
  };
  scale.padding = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
  };
  scale.paddingInner = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
  };
  scale.paddingOuter = function(_) {
    return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
  };
  scale.align = function(_) {
    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
  };
  scale.copy = function() {
    return band(domain(), [r0, r1]).round(round).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align);
  };
  return initRange.apply(rescale(), arguments);
}
function pointish(scale) {
  var copy2 = scale.copy;
  scale.padding = scale.paddingOuter;
  delete scale.paddingInner;
  delete scale.paddingOuter;
  scale.copy = function() {
    return pointish(copy2());
  };
  return scale;
}
function point() {
  return pointish(band.apply(null, arguments).paddingInner(1));
}
function constants(x) {
  return function() {
    return x;
  };
}
function number$2(x) {
  return +x;
}
var unit$1 = [0, 1];
function identity$3(x) {
  return x;
}
function normalize(a2, b) {
  return (b -= a2 = +a2) ? function(x) {
    return (x - a2) / b;
  } : constants(isNaN(b) ? NaN : 0.5);
}
function clamper(a2, b) {
  var t;
  if (a2 > b)
    t = a2, a2 = b, b = t;
  return function(x) {
    return Math.max(a2, Math.min(b, x));
  };
}
function bimap(domain, range2, interpolate2) {
  var d0 = domain[0], d1 = domain[1], r0 = range2[0], r1 = range2[1];
  if (d1 < d0)
    d0 = normalize(d1, d0), r0 = interpolate2(r1, r0);
  else
    d0 = normalize(d0, d1), r0 = interpolate2(r0, r1);
  return function(x) {
    return r0(d0(x));
  };
}
function polymap(domain, range2, interpolate2) {
  var j = Math.min(domain.length, range2.length) - 1, d = new Array(j), r = new Array(j), i = -1;
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range2 = range2.slice().reverse();
  }
  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate2(range2[i], range2[i + 1]);
  }
  return function(x) {
    var i2 = bisect(domain, x, 1, j) - 1;
    return r[i2](d[i2](x));
  };
}
function copy$1(source, target) {
  return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer$1() {
  var domain = unit$1, range2 = unit$1, interpolate2 = interpolate$1, transform, untransform, unknown, clamp = identity$3, piecewise2, output, input;
  function rescale() {
    var n = Math.min(domain.length, range2.length);
    if (clamp !== identity$3)
      clamp = clamper(domain[0], domain[n - 1]);
    piecewise2 = n > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }
  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise2(domain.map(transform), range2, interpolate2)))(transform(clamp(x)));
  }
  scale.invert = function(y) {
    return clamp(untransform((input || (input = piecewise2(range2, domain.map(transform), interpolateNumber)))(y)));
  };
  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_, number$2), rescale()) : domain.slice();
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), rescale()) : range2.slice();
  };
  scale.rangeRound = function(_) {
    return range2 = Array.from(_), interpolate2 = interpolateRound, rescale();
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp = _ ? true : identity$3, rescale()) : clamp !== identity$3;
  };
  scale.interpolate = function(_) {
    return arguments.length ? (interpolate2 = _, rescale()) : interpolate2;
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  return function(t, u) {
    transform = t, untransform = u;
    return rescale();
  };
}
function continuous() {
  return transformer$1()(identity$3, identity$3);
}
function tickFormat(start2, stop, count, specifier) {
  var step = tickStep(start2, stop, count), precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start2), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value)))
        specifier.precision = precision;
      return formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start2), Math.abs(stop)))))
        specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed(step)))
        specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format$1(specifier);
}
function linearish(scale) {
  var domain = scale.domain;
  scale.ticks = function(count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };
  scale.tickFormat = function(count, specifier) {
    var d = domain();
    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
  };
  scale.nice = function(count) {
    if (count == null)
      count = 10;
    var d = domain();
    var i0 = 0;
    var i1 = d.length - 1;
    var start2 = d[i0];
    var stop = d[i1];
    var prestep;
    var step;
    var maxIter = 10;
    if (stop < start2) {
      step = start2, start2 = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }
    while (maxIter-- > 0) {
      step = tickIncrement(start2, stop, count);
      if (step === prestep) {
        d[i0] = start2;
        d[i1] = stop;
        return domain(d);
      } else if (step > 0) {
        start2 = Math.floor(start2 / step) * step;
        stop = Math.ceil(stop / step) * step;
      } else if (step < 0) {
        start2 = Math.ceil(start2 * step) / step;
        stop = Math.floor(stop * step) / step;
      } else {
        break;
      }
      prestep = step;
    }
    return scale;
  };
  return scale;
}
function linear() {
  var scale = continuous();
  scale.copy = function() {
    return copy$1(scale, linear());
  };
  initRange.apply(scale, arguments);
  return linearish(scale);
}
function identity$2(domain) {
  var unknown;
  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : x;
  }
  scale.invert = scale;
  scale.domain = scale.range = function(_) {
    return arguments.length ? (domain = Array.from(_, number$2), scale) : domain.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.copy = function() {
    return identity$2(domain).unknown(unknown);
  };
  domain = arguments.length ? Array.from(domain, number$2) : [0, 1];
  return linearish(scale);
}
function nice(domain, interval2) {
  domain = domain.slice();
  var i0 = 0, i1 = domain.length - 1, x02 = domain[i0], x12 = domain[i1], t;
  if (x12 < x02) {
    t = i0, i0 = i1, i1 = t;
    t = x02, x02 = x12, x12 = t;
  }
  domain[i0] = interval2.floor(x02);
  domain[i1] = interval2.ceil(x12);
  return domain;
}
function transformLog$1(x) {
  return Math.log(x);
}
function transformExp(x) {
  return Math.exp(x);
}
function transformLogn(x) {
  return -Math.log(-x);
}
function transformExpn(x) {
  return -Math.exp(-x);
}
function pow10(x) {
  return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
}
function powp(base) {
  return base === 10 ? pow10 : base === Math.E ? Math.exp : (x) => Math.pow(base, x);
}
function logp(base) {
  return base === Math.E ? Math.log : base === 10 && Math.log10 || base === 2 && Math.log2 || (base = Math.log(base), (x) => Math.log(x) / base);
}
function reflect(f) {
  return (x, k2) => -f(-x, k2);
}
function loggish(transform) {
  const scale = transform(transformLog$1, transformExp);
  const domain = scale.domain;
  let base = 10;
  let logs;
  let pows;
  function rescale() {
    logs = logp(base), pows = powp(base);
    if (domain()[0] < 0) {
      logs = reflect(logs), pows = reflect(pows);
      transform(transformLogn, transformExpn);
    } else {
      transform(transformLog$1, transformExp);
    }
    return scale;
  }
  scale.base = function(_) {
    return arguments.length ? (base = +_, rescale()) : base;
  };
  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };
  scale.ticks = (count) => {
    const d = domain();
    let u = d[0];
    let v = d[d.length - 1];
    const r = v < u;
    if (r)
      [u, v] = [v, u];
    let i = logs(u);
    let j = logs(v);
    let k2;
    let t;
    const n = count == null ? 10 : +count;
    let z = [];
    if (!(base % 1) && j - i < n) {
      i = Math.floor(i), j = Math.ceil(j);
      if (u > 0)
        for (; i <= j; ++i) {
          for (k2 = 1; k2 < base; ++k2) {
            t = i < 0 ? k2 / pows(-i) : k2 * pows(i);
            if (t < u)
              continue;
            if (t > v)
              break;
            z.push(t);
          }
        }
      else
        for (; i <= j; ++i) {
          for (k2 = base - 1; k2 >= 1; --k2) {
            t = i > 0 ? k2 / pows(-i) : k2 * pows(i);
            if (t < u)
              continue;
            if (t > v)
              break;
            z.push(t);
          }
        }
      if (z.length * 2 < n)
        z = ticks(u, v, n);
    } else {
      z = ticks(i, j, Math.min(j - i, n)).map(pows);
    }
    return r ? z.reverse() : z;
  };
  scale.tickFormat = (count, specifier) => {
    if (count == null)
      count = 10;
    if (specifier == null)
      specifier = base === 10 ? "s" : ",";
    if (typeof specifier !== "function") {
      if (!(base % 1) && (specifier = formatSpecifier(specifier)).precision == null)
        specifier.trim = true;
      specifier = format$1(specifier);
    }
    if (count === Infinity)
      return specifier;
    const k2 = Math.max(1, base * count / scale.ticks().length);
    return (d) => {
      let i = d / pows(Math.round(logs(d)));
      if (i * base < base - 0.5)
        i *= base;
      return i <= k2 ? specifier(d) : "";
    };
  };
  scale.nice = () => {
    return domain(nice(domain(), {
      floor: (x) => pows(Math.floor(logs(x))),
      ceil: (x) => pows(Math.ceil(logs(x)))
    }));
  };
  return scale;
}
function log() {
  const scale = loggish(transformer$1()).domain([1, 10]);
  scale.copy = () => copy$1(scale, log()).base(scale.base());
  initRange.apply(scale, arguments);
  return scale;
}
function transformSymlog$1(c2) {
  return function(x) {
    return Math.sign(x) * Math.log1p(Math.abs(x / c2));
  };
}
function transformSymexp(c2) {
  return function(x) {
    return Math.sign(x) * Math.expm1(Math.abs(x)) * c2;
  };
}
function symlogish(transform) {
  var c2 = 1, scale = transform(transformSymlog$1(c2), transformSymexp(c2));
  scale.constant = function(_) {
    return arguments.length ? transform(transformSymlog$1(c2 = +_), transformSymexp(c2)) : c2;
  };
  return linearish(scale);
}
function symlog() {
  var scale = symlogish(transformer$1());
  scale.copy = function() {
    return copy$1(scale, symlog()).constant(scale.constant());
  };
  return initRange.apply(scale, arguments);
}
function transformPow$1(exponent2) {
  return function(x) {
    return x < 0 ? -Math.pow(-x, exponent2) : Math.pow(x, exponent2);
  };
}
function transformSqrt$1(x) {
  return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
}
function transformSquare(x) {
  return x < 0 ? -x * x : x * x;
}
function powish(transform) {
  var scale = transform(identity$3, identity$3), exponent2 = 1;
  function rescale() {
    return exponent2 === 1 ? transform(identity$3, identity$3) : exponent2 === 0.5 ? transform(transformSqrt$1, transformSquare) : transform(transformPow$1(exponent2), transformPow$1(1 / exponent2));
  }
  scale.exponent = function(_) {
    return arguments.length ? (exponent2 = +_, rescale()) : exponent2;
  };
  return linearish(scale);
}
function pow() {
  var scale = powish(transformer$1());
  scale.copy = function() {
    return copy$1(scale, pow()).exponent(scale.exponent());
  };
  initRange.apply(scale, arguments);
  return scale;
}
function quantile() {
  var domain = [], range2 = [], thresholds = [], unknown;
  function rescale() {
    var i = 0, n = Math.max(1, range2.length);
    thresholds = new Array(n - 1);
    while (++i < n)
      thresholds[i - 1] = quantileSorted(domain, i / n);
    return scale;
  }
  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : range2[bisect(thresholds, x)];
  }
  scale.invertExtent = function(y) {
    var i = range2.indexOf(y);
    return i < 0 ? [NaN, NaN] : [
      i > 0 ? thresholds[i - 1] : domain[0],
      i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
    ];
  };
  scale.domain = function(_) {
    if (!arguments.length)
      return domain.slice();
    domain = [];
    for (let d of _)
      if (d != null && !isNaN(d = +d))
        domain.push(d);
    domain.sort(ascending$1);
    return rescale();
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), rescale()) : range2.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.quantiles = function() {
    return thresholds.slice();
  };
  scale.copy = function() {
    return quantile().domain(domain).range(range2).unknown(unknown);
  };
  return initRange.apply(scale, arguments);
}
function threshold() {
  var domain = [0.5], range2 = [0, 1], unknown, n = 1;
  function scale(x) {
    return x != null && x <= x ? range2[bisect(domain, x, 0, n)] : unknown;
  }
  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_), n = Math.min(domain.length, range2.length - 1), scale) : domain.slice();
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), n = Math.min(domain.length, range2.length - 1), scale) : range2.slice();
  };
  scale.invertExtent = function(y) {
    var i = range2.indexOf(y);
    return [domain[i - 1], domain[i]];
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.copy = function() {
    return threshold().domain(domain).range(range2).unknown(unknown);
  };
  return initRange.apply(scale, arguments);
}
const t0 = new Date(), t1 = new Date();
function timeInterval(floori, offseti, count, field2) {
  function interval2(date2) {
    return floori(date2 = arguments.length === 0 ? new Date() : new Date(+date2)), date2;
  }
  interval2.floor = (date2) => {
    return floori(date2 = new Date(+date2)), date2;
  };
  interval2.ceil = (date2) => {
    return floori(date2 = new Date(date2 - 1)), offseti(date2, 1), floori(date2), date2;
  };
  interval2.round = (date2) => {
    const d0 = interval2(date2), d1 = interval2.ceil(date2);
    return date2 - d0 < d1 - date2 ? d0 : d1;
  };
  interval2.offset = (date2, step) => {
    return offseti(date2 = new Date(+date2), step == null ? 1 : Math.floor(step)), date2;
  };
  interval2.range = (start2, stop, step) => {
    const range2 = [];
    start2 = interval2.ceil(start2);
    step = step == null ? 1 : Math.floor(step);
    if (!(start2 < stop) || !(step > 0))
      return range2;
    let previous;
    do
      range2.push(previous = new Date(+start2)), offseti(start2, step), floori(start2);
    while (previous < start2 && start2 < stop);
    return range2;
  };
  interval2.filter = (test) => {
    return timeInterval((date2) => {
      if (date2 >= date2)
        while (floori(date2), !test(date2))
          date2.setTime(date2 - 1);
    }, (date2, step) => {
      if (date2 >= date2) {
        if (step < 0)
          while (++step <= 0) {
            while (offseti(date2, -1), !test(date2)) {
            }
          }
        else
          while (--step >= 0) {
            while (offseti(date2, 1), !test(date2)) {
            }
          }
      }
    });
  };
  if (count) {
    interval2.count = (start2, end) => {
      t0.setTime(+start2), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count(t0, t1));
    };
    interval2.every = (step) => {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval2 : interval2.filter(field2 ? (d) => field2(d) % step === 0 : (d) => interval2.count(0, d) % step === 0);
    };
  }
  return interval2;
}
const millisecond = timeInterval(() => {
}, (date2, step) => {
  date2.setTime(+date2 + step);
}, (start2, end) => {
  return end - start2;
});
millisecond.every = (k2) => {
  k2 = Math.floor(k2);
  if (!isFinite(k2) || !(k2 > 0))
    return null;
  if (!(k2 > 1))
    return millisecond;
  return timeInterval((date2) => {
    date2.setTime(Math.floor(date2 / k2) * k2);
  }, (date2, step) => {
    date2.setTime(+date2 + step * k2);
  }, (start2, end) => {
    return (end - start2) / k2;
  });
};
millisecond.range;
const durationSecond = 1e3;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;
const second$1 = timeInterval((date2) => {
  date2.setTime(date2 - date2.getMilliseconds());
}, (date2, step) => {
  date2.setTime(+date2 + step * durationSecond);
}, (start2, end) => {
  return (end - start2) / durationSecond;
}, (date2) => {
  return date2.getUTCSeconds();
});
second$1.range;
const timeMinute = timeInterval((date2) => {
  date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * durationSecond);
}, (date2, step) => {
  date2.setTime(+date2 + step * durationMinute);
}, (start2, end) => {
  return (end - start2) / durationMinute;
}, (date2) => {
  return date2.getMinutes();
});
timeMinute.range;
const utcMinute = timeInterval((date2) => {
  date2.setUTCSeconds(0, 0);
}, (date2, step) => {
  date2.setTime(+date2 + step * durationMinute);
}, (start2, end) => {
  return (end - start2) / durationMinute;
}, (date2) => {
  return date2.getUTCMinutes();
});
utcMinute.range;
const timeHour = timeInterval((date2) => {
  date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * durationSecond - date2.getMinutes() * durationMinute);
}, (date2, step) => {
  date2.setTime(+date2 + step * durationHour);
}, (start2, end) => {
  return (end - start2) / durationHour;
}, (date2) => {
  return date2.getHours();
});
timeHour.range;
const utcHour = timeInterval((date2) => {
  date2.setUTCMinutes(0, 0, 0);
}, (date2, step) => {
  date2.setTime(+date2 + step * durationHour);
}, (start2, end) => {
  return (end - start2) / durationHour;
}, (date2) => {
  return date2.getUTCHours();
});
utcHour.range;
const timeDay = timeInterval(
  (date2) => date2.setHours(0, 0, 0, 0),
  (date2, step) => date2.setDate(date2.getDate() + step),
  (start2, end) => (end - start2 - (end.getTimezoneOffset() - start2.getTimezoneOffset()) * durationMinute) / durationDay,
  (date2) => date2.getDate() - 1
);
timeDay.range;
const utcDay = timeInterval((date2) => {
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setUTCDate(date2.getUTCDate() + step);
}, (start2, end) => {
  return (end - start2) / durationDay;
}, (date2) => {
  return date2.getUTCDate() - 1;
});
utcDay.range;
const unixDay = timeInterval((date2) => {
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setUTCDate(date2.getUTCDate() + step);
}, (start2, end) => {
  return (end - start2) / durationDay;
}, (date2) => {
  return Math.floor(date2 / durationDay);
});
unixDay.range;
function timeWeekday(i) {
  return timeInterval((date2) => {
    date2.setDate(date2.getDate() - (date2.getDay() + 7 - i) % 7);
    date2.setHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setDate(date2.getDate() + step * 7);
  }, (start2, end) => {
    return (end - start2 - (end.getTimezoneOffset() - start2.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}
const timeSunday = timeWeekday(0);
const timeMonday = timeWeekday(1);
const timeTuesday = timeWeekday(2);
const timeWednesday = timeWeekday(3);
const timeThursday = timeWeekday(4);
const timeFriday = timeWeekday(5);
const timeSaturday = timeWeekday(6);
timeSunday.range;
timeMonday.range;
timeTuesday.range;
timeWednesday.range;
timeThursday.range;
timeFriday.range;
timeSaturday.range;
function utcWeekday(i) {
  return timeInterval((date2) => {
    date2.setUTCDate(date2.getUTCDate() - (date2.getUTCDay() + 7 - i) % 7);
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCDate(date2.getUTCDate() + step * 7);
  }, (start2, end) => {
    return (end - start2) / durationWeek;
  });
}
const utcSunday = utcWeekday(0);
const utcMonday = utcWeekday(1);
const utcTuesday = utcWeekday(2);
const utcWednesday = utcWeekday(3);
const utcThursday = utcWeekday(4);
const utcFriday = utcWeekday(5);
const utcSaturday = utcWeekday(6);
utcSunday.range;
utcMonday.range;
utcTuesday.range;
utcWednesday.range;
utcThursday.range;
utcFriday.range;
utcSaturday.range;
const timeMonth = timeInterval((date2) => {
  date2.setDate(1);
  date2.setHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setMonth(date2.getMonth() + step);
}, (start2, end) => {
  return end.getMonth() - start2.getMonth() + (end.getFullYear() - start2.getFullYear()) * 12;
}, (date2) => {
  return date2.getMonth();
});
timeMonth.range;
const utcMonth = timeInterval((date2) => {
  date2.setUTCDate(1);
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setUTCMonth(date2.getUTCMonth() + step);
}, (start2, end) => {
  return end.getUTCMonth() - start2.getUTCMonth() + (end.getUTCFullYear() - start2.getUTCFullYear()) * 12;
}, (date2) => {
  return date2.getUTCMonth();
});
utcMonth.range;
const timeYear = timeInterval((date2) => {
  date2.setMonth(0, 1);
  date2.setHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setFullYear(date2.getFullYear() + step);
}, (start2, end) => {
  return end.getFullYear() - start2.getFullYear();
}, (date2) => {
  return date2.getFullYear();
});
timeYear.every = (k2) => {
  return !isFinite(k2 = Math.floor(k2)) || !(k2 > 0) ? null : timeInterval((date2) => {
    date2.setFullYear(Math.floor(date2.getFullYear() / k2) * k2);
    date2.setMonth(0, 1);
    date2.setHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setFullYear(date2.getFullYear() + step * k2);
  });
};
timeYear.range;
const utcYear = timeInterval((date2) => {
  date2.setUTCMonth(0, 1);
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setUTCFullYear(date2.getUTCFullYear() + step);
}, (start2, end) => {
  return end.getUTCFullYear() - start2.getUTCFullYear();
}, (date2) => {
  return date2.getUTCFullYear();
});
utcYear.every = (k2) => {
  return !isFinite(k2 = Math.floor(k2)) || !(k2 > 0) ? null : timeInterval((date2) => {
    date2.setUTCFullYear(Math.floor(date2.getUTCFullYear() / k2) * k2);
    date2.setUTCMonth(0, 1);
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCFullYear(date2.getUTCFullYear() + step * k2);
  });
};
utcYear.range;
function ticker(year, month, week, day, hour, minute) {
  const tickIntervals = [
    [second$1, 1, durationSecond],
    [second$1, 5, 5 * durationSecond],
    [second$1, 15, 15 * durationSecond],
    [second$1, 30, 30 * durationSecond],
    [minute, 1, durationMinute],
    [minute, 5, 5 * durationMinute],
    [minute, 15, 15 * durationMinute],
    [minute, 30, 30 * durationMinute],
    [hour, 1, durationHour],
    [hour, 3, 3 * durationHour],
    [hour, 6, 6 * durationHour],
    [hour, 12, 12 * durationHour],
    [day, 1, durationDay],
    [day, 2, 2 * durationDay],
    [week, 1, durationWeek],
    [month, 1, durationMonth],
    [month, 3, 3 * durationMonth],
    [year, 1, durationYear]
  ];
  function ticks2(start2, stop, count) {
    const reverse2 = stop < start2;
    if (reverse2)
      [start2, stop] = [stop, start2];
    const interval2 = count && typeof count.range === "function" ? count : tickInterval(start2, stop, count);
    const ticks3 = interval2 ? interval2.range(start2, +stop + 1) : [];
    return reverse2 ? ticks3.reverse() : ticks3;
  }
  function tickInterval(start2, stop, count) {
    const target = Math.abs(stop - start2) / count;
    const i = bisector(([, , step2]) => step2).right(tickIntervals, target);
    if (i === tickIntervals.length)
      return year.every(tickStep(start2 / durationYear, stop / durationYear, count));
    if (i === 0)
      return millisecond.every(Math.max(tickStep(start2, stop, count), 1));
    const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
    return t.every(step);
  }
  return [ticks2, tickInterval];
}
const [utcTicks, utcTickInterval] = ticker(utcYear, utcMonth, utcSunday, unixDay, utcHour, utcMinute);
const [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute);
function localDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date2 = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
    date2.setFullYear(d.y);
    return date2;
  }
  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}
function utcDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date2 = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
    date2.setUTCFullYear(d.y);
    return date2;
  }
  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}
function newDate(y, m, d) {
  return { y, m, d, H: 0, M: 0, S: 0, L: 0 };
}
function formatLocale(locale2) {
  var locale_dateTime = locale2.dateTime, locale_date = locale2.date, locale_time = locale2.time, locale_periods = locale2.periods, locale_weekdays = locale2.days, locale_shortWeekdays = locale2.shortDays, locale_months = locale2.months, locale_shortMonths = locale2.shortMonths;
  var periodRe = formatRe(locale_periods), periodLookup = formatLookup(locale_periods), weekdayRe = formatRe(locale_weekdays), weekdayLookup = formatLookup(locale_weekdays), shortWeekdayRe = formatRe(locale_shortWeekdays), shortWeekdayLookup = formatLookup(locale_shortWeekdays), monthRe = formatRe(locale_months), monthLookup = formatLookup(locale_months), shortMonthRe = formatRe(locale_shortMonths), shortMonthLookup = formatLookup(locale_shortMonths);
  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "f": formatMicroseconds,
    "g": formatYearISO,
    "G": formatFullYearISO,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "q": formatQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatSeconds,
    "u": formatWeekdayNumberMonday,
    "U": formatWeekNumberSunday,
    "V": formatWeekNumberISO,
    "w": formatWeekdayNumberSunday,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear$1,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };
  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "f": formatUTCMicroseconds,
    "g": formatUTCYearISO,
    "G": formatUTCFullYearISO,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "q": formatUTCQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatUTCSeconds,
    "u": formatUTCWeekdayNumberMonday,
    "U": formatUTCWeekNumberSunday,
    "V": formatUTCWeekNumberISO,
    "w": formatUTCWeekdayNumberSunday,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };
  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "f": parseMicroseconds,
    "g": parseYear,
    "G": parseFullYear,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "q": parseQuarter,
    "Q": parseUnixTimestamp,
    "s": parseUnixTimestampSeconds,
    "S": parseSeconds,
    "u": parseWeekdayNumberMonday,
    "U": parseWeekNumberSunday,
    "V": parseWeekNumberISO,
    "w": parseWeekdayNumberSunday,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);
  function newFormat(specifier, formats2) {
    return function(date2) {
      var string2 = [], i = -1, j = 0, n = specifier.length, c2, pad2, format2;
      if (!(date2 instanceof Date))
        date2 = new Date(+date2);
      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string2.push(specifier.slice(j, i));
          if ((pad2 = pads[c2 = specifier.charAt(++i)]) != null)
            c2 = specifier.charAt(++i);
          else
            pad2 = c2 === "e" ? " " : "0";
          if (format2 = formats2[c2])
            c2 = format2(date2, pad2);
          string2.push(c2);
          j = i + 1;
        }
      }
      string2.push(specifier.slice(j, i));
      return string2.join("");
    };
  }
  function newParse(specifier, Z) {
    return function(string2) {
      var d = newDate(1900, void 0, 1), i = parseSpecifier(d, specifier, string2 += "", 0), week, day;
      if (i != string2.length)
        return null;
      if ("Q" in d)
        return new Date(d.Q);
      if ("s" in d)
        return new Date(d.s * 1e3 + ("L" in d ? d.L : 0));
      if (Z && !("Z" in d))
        d.Z = 0;
      if ("p" in d)
        d.H = d.H % 12 + d.p * 12;
      if (d.m === void 0)
        d.m = "q" in d ? d.q : 0;
      if ("V" in d) {
        if (d.V < 1 || d.V > 53)
          return null;
        if (!("w" in d))
          d.w = 1;
        if ("Z" in d) {
          week = utcDate(newDate(d.y, 0, 1)), day = week.getUTCDay();
          week = day > 4 || day === 0 ? utcMonday.ceil(week) : utcMonday(week);
          week = utcDay.offset(week, (d.V - 1) * 7);
          d.y = week.getUTCFullYear();
          d.m = week.getUTCMonth();
          d.d = week.getUTCDate() + (d.w + 6) % 7;
        } else {
          week = localDate(newDate(d.y, 0, 1)), day = week.getDay();
          week = day > 4 || day === 0 ? timeMonday.ceil(week) : timeMonday(week);
          week = timeDay.offset(week, (d.V - 1) * 7);
          d.y = week.getFullYear();
          d.m = week.getMonth();
          d.d = week.getDate() + (d.w + 6) % 7;
        }
      } else if ("W" in d || "U" in d) {
        if (!("w" in d))
          d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
        day = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
        d.m = 0;
        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
      }
      if ("Z" in d) {
        d.H += d.Z / 100 | 0;
        d.M += d.Z % 100;
        return utcDate(d);
      }
      return localDate(d);
    };
  }
  function parseSpecifier(d, specifier, string2, j) {
    var i = 0, n = specifier.length, m = string2.length, c2, parse2;
    while (i < n) {
      if (j >= m)
        return -1;
      c2 = specifier.charCodeAt(i++);
      if (c2 === 37) {
        c2 = specifier.charAt(i++);
        parse2 = parses[c2 in pads ? specifier.charAt(i++) : c2];
        if (!parse2 || (j = parse2(d, string2, j)) < 0)
          return -1;
      } else if (c2 != string2.charCodeAt(j++)) {
        return -1;
      }
    }
    return j;
  }
  function parsePeriod(d, string2, i) {
    var n = periodRe.exec(string2.slice(i));
    return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseShortWeekday(d, string2, i) {
    var n = shortWeekdayRe.exec(string2.slice(i));
    return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseWeekday(d, string2, i) {
    var n = weekdayRe.exec(string2.slice(i));
    return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseShortMonth(d, string2, i) {
    var n = shortMonthRe.exec(string2.slice(i));
    return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseMonth(d, string2, i) {
    var n = monthRe.exec(string2.slice(i));
    return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseLocaleDateTime(d, string2, i) {
    return parseSpecifier(d, locale_dateTime, string2, i);
  }
  function parseLocaleDate(d, string2, i) {
    return parseSpecifier(d, locale_date, string2, i);
  }
  function parseLocaleTime(d, string2, i) {
    return parseSpecifier(d, locale_time, string2, i);
  }
  function formatShortWeekday(d) {
    return locale_shortWeekdays[d.getDay()];
  }
  function formatWeekday(d) {
    return locale_weekdays[d.getDay()];
  }
  function formatShortMonth(d) {
    return locale_shortMonths[d.getMonth()];
  }
  function formatMonth(d) {
    return locale_months[d.getMonth()];
  }
  function formatPeriod(d) {
    return locale_periods[+(d.getHours() >= 12)];
  }
  function formatQuarter(d) {
    return 1 + ~~(d.getMonth() / 3);
  }
  function formatUTCShortWeekday(d) {
    return locale_shortWeekdays[d.getUTCDay()];
  }
  function formatUTCWeekday(d) {
    return locale_weekdays[d.getUTCDay()];
  }
  function formatUTCShortMonth(d) {
    return locale_shortMonths[d.getUTCMonth()];
  }
  function formatUTCMonth(d) {
    return locale_months[d.getUTCMonth()];
  }
  function formatUTCPeriod(d) {
    return locale_periods[+(d.getUTCHours() >= 12)];
  }
  function formatUTCQuarter(d) {
    return 1 + ~~(d.getUTCMonth() / 3);
  }
  return {
    format: function(specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    parse: function(specifier) {
      var p = newParse(specifier += "", false);
      p.toString = function() {
        return specifier;
      };
      return p;
    },
    utcFormat: function(specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    utcParse: function(specifier) {
      var p = newParse(specifier += "", true);
      p.toString = function() {
        return specifier;
      };
      return p;
    }
  };
}
var pads = { "-": "", "_": " ", "0": "0" }, numberRe = /^\s*\d+/, percentRe = /^%/, requoteRe = /[\\^$*+?|[\]().{}]/g;
function pad$1(value, fill, width) {
  var sign2 = value < 0 ? "-" : "", string2 = (sign2 ? -value : value) + "", length2 = string2.length;
  return sign2 + (length2 < width ? new Array(width - length2 + 1).join(fill) + string2 : string2);
}
function requote(s2) {
  return s2.replace(requoteRe, "\\$&");
}
function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}
function formatLookup(names) {
  return new Map(names.map((name, i) => [name.toLowerCase(), i]));
}
function parseWeekdayNumberSunday(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 1));
  return n ? (d.w = +n[0], i + n[0].length) : -1;
}
function parseWeekdayNumberMonday(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 1));
  return n ? (d.u = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberSunday(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.U = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberISO(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.V = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberMonday(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.W = +n[0], i + n[0].length) : -1;
}
function parseFullYear(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 4));
  return n ? (d.y = +n[0], i + n[0].length) : -1;
}
function parseYear(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2e3), i + n[0].length) : -1;
}
function parseZone(d, string2, i) {
  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string2.slice(i, i + 6));
  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}
function parseQuarter(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 1));
  return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
}
function parseMonthNumber(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}
function parseDayOfMonth(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.d = +n[0], i + n[0].length) : -1;
}
function parseDayOfYear(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 3));
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}
function parseHour24(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.H = +n[0], i + n[0].length) : -1;
}
function parseMinutes(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.M = +n[0], i + n[0].length) : -1;
}
function parseSeconds(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.S = +n[0], i + n[0].length) : -1;
}
function parseMilliseconds(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 3));
  return n ? (d.L = +n[0], i + n[0].length) : -1;
}
function parseMicroseconds(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 6));
  return n ? (d.L = Math.floor(n[0] / 1e3), i + n[0].length) : -1;
}
function parseLiteralPercent(d, string2, i) {
  var n = percentRe.exec(string2.slice(i, i + 1));
  return n ? i + n[0].length : -1;
}
function parseUnixTimestamp(d, string2, i) {
  var n = numberRe.exec(string2.slice(i));
  return n ? (d.Q = +n[0], i + n[0].length) : -1;
}
function parseUnixTimestampSeconds(d, string2, i) {
  var n = numberRe.exec(string2.slice(i));
  return n ? (d.s = +n[0], i + n[0].length) : -1;
}
function formatDayOfMonth(d, p) {
  return pad$1(d.getDate(), p, 2);
}
function formatHour24(d, p) {
  return pad$1(d.getHours(), p, 2);
}
function formatHour12(d, p) {
  return pad$1(d.getHours() % 12 || 12, p, 2);
}
function formatDayOfYear(d, p) {
  return pad$1(1 + timeDay.count(timeYear(d), d), p, 3);
}
function formatMilliseconds(d, p) {
  return pad$1(d.getMilliseconds(), p, 3);
}
function formatMicroseconds(d, p) {
  return formatMilliseconds(d, p) + "000";
}
function formatMonthNumber(d, p) {
  return pad$1(d.getMonth() + 1, p, 2);
}
function formatMinutes(d, p) {
  return pad$1(d.getMinutes(), p, 2);
}
function formatSeconds(d, p) {
  return pad$1(d.getSeconds(), p, 2);
}
function formatWeekdayNumberMonday(d) {
  var day = d.getDay();
  return day === 0 ? 7 : day;
}
function formatWeekNumberSunday(d, p) {
  return pad$1(timeSunday.count(timeYear(d) - 1, d), p, 2);
}
function dISO(d) {
  var day = d.getDay();
  return day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
}
function formatWeekNumberISO(d, p) {
  d = dISO(d);
  return pad$1(timeThursday.count(timeYear(d), d) + (timeYear(d).getDay() === 4), p, 2);
}
function formatWeekdayNumberSunday(d) {
  return d.getDay();
}
function formatWeekNumberMonday(d, p) {
  return pad$1(timeMonday.count(timeYear(d) - 1, d), p, 2);
}
function formatYear$1(d, p) {
  return pad$1(d.getFullYear() % 100, p, 2);
}
function formatYearISO(d, p) {
  d = dISO(d);
  return pad$1(d.getFullYear() % 100, p, 2);
}
function formatFullYear(d, p) {
  return pad$1(d.getFullYear() % 1e4, p, 4);
}
function formatFullYearISO(d, p) {
  var day = d.getDay();
  d = day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
  return pad$1(d.getFullYear() % 1e4, p, 4);
}
function formatZone(d) {
  var z = d.getTimezoneOffset();
  return (z > 0 ? "-" : (z *= -1, "+")) + pad$1(z / 60 | 0, "0", 2) + pad$1(z % 60, "0", 2);
}
function formatUTCDayOfMonth(d, p) {
  return pad$1(d.getUTCDate(), p, 2);
}
function formatUTCHour24(d, p) {
  return pad$1(d.getUTCHours(), p, 2);
}
function formatUTCHour12(d, p) {
  return pad$1(d.getUTCHours() % 12 || 12, p, 2);
}
function formatUTCDayOfYear(d, p) {
  return pad$1(1 + utcDay.count(utcYear(d), d), p, 3);
}
function formatUTCMilliseconds(d, p) {
  return pad$1(d.getUTCMilliseconds(), p, 3);
}
function formatUTCMicroseconds(d, p) {
  return formatUTCMilliseconds(d, p) + "000";
}
function formatUTCMonthNumber(d, p) {
  return pad$1(d.getUTCMonth() + 1, p, 2);
}
function formatUTCMinutes(d, p) {
  return pad$1(d.getUTCMinutes(), p, 2);
}
function formatUTCSeconds(d, p) {
  return pad$1(d.getUTCSeconds(), p, 2);
}
function formatUTCWeekdayNumberMonday(d) {
  var dow = d.getUTCDay();
  return dow === 0 ? 7 : dow;
}
function formatUTCWeekNumberSunday(d, p) {
  return pad$1(utcSunday.count(utcYear(d) - 1, d), p, 2);
}
function UTCdISO(d) {
  var day = d.getUTCDay();
  return day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
}
function formatUTCWeekNumberISO(d, p) {
  d = UTCdISO(d);
  return pad$1(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
}
function formatUTCWeekdayNumberSunday(d) {
  return d.getUTCDay();
}
function formatUTCWeekNumberMonday(d, p) {
  return pad$1(utcMonday.count(utcYear(d) - 1, d), p, 2);
}
function formatUTCYear(d, p) {
  return pad$1(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCYearISO(d, p) {
  d = UTCdISO(d);
  return pad$1(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCFullYear(d, p) {
  return pad$1(d.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCFullYearISO(d, p) {
  var day = d.getUTCDay();
  d = day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
  return pad$1(d.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCZone() {
  return "+0000";
}
function formatLiteralPercent() {
  return "%";
}
function formatUnixTimestamp(d) {
  return +d;
}
function formatUnixTimestampSeconds(d) {
  return Math.floor(+d / 1e3);
}
var locale;
var timeFormat;
var utcFormat;
defaultLocale({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});
function defaultLocale(definition) {
  locale = formatLocale(definition);
  timeFormat = locale.format;
  locale.parse;
  utcFormat = locale.utcFormat;
  locale.utcParse;
  return locale;
}
function date(t) {
  return new Date(t);
}
function number$1(t) {
  return t instanceof Date ? +t : +new Date(+t);
}
function calendar(ticks2, tickInterval, year, month, week, day, hour, minute, second2, format2) {
  var scale = continuous(), invert = scale.invert, domain = scale.domain;
  var formatMillisecond = format2(".%L"), formatSecond = format2(":%S"), formatMinute = format2("%I:%M"), formatHour = format2("%I %p"), formatDay = format2("%a %d"), formatWeek = format2("%b %d"), formatMonth = format2("%B"), formatYear2 = format2("%Y");
  function tickFormat2(date2) {
    return (second2(date2) < date2 ? formatMillisecond : minute(date2) < date2 ? formatSecond : hour(date2) < date2 ? formatMinute : day(date2) < date2 ? formatHour : month(date2) < date2 ? week(date2) < date2 ? formatDay : formatWeek : year(date2) < date2 ? formatMonth : formatYear2)(date2);
  }
  scale.invert = function(y) {
    return new Date(invert(y));
  };
  scale.domain = function(_) {
    return arguments.length ? domain(Array.from(_, number$1)) : domain().map(date);
  };
  scale.ticks = function(interval2) {
    var d = domain();
    return ticks2(d[0], d[d.length - 1], interval2 == null ? 10 : interval2);
  };
  scale.tickFormat = function(count, specifier) {
    return specifier == null ? tickFormat2 : format2(specifier);
  };
  scale.nice = function(interval2) {
    var d = domain();
    if (!interval2 || typeof interval2.range !== "function")
      interval2 = tickInterval(d[0], d[d.length - 1], interval2 == null ? 10 : interval2);
    return interval2 ? domain(nice(d, interval2)) : scale;
  };
  scale.copy = function() {
    return copy$1(scale, calendar(ticks2, tickInterval, year, month, week, day, hour, minute, second2, format2));
  };
  return scale;
}
function time() {
  return initRange.apply(calendar(timeTicks, timeTickInterval, timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute, second$1, timeFormat).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
}
function utcTime() {
  return initRange.apply(calendar(utcTicks, utcTickInterval, utcYear, utcMonth, utcSunday, utcDay, utcHour, utcMinute, second$1, utcFormat).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]), arguments);
}
function copy(source, target) {
  return target.domain(source.domain()).interpolator(source.interpolator()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer() {
  var x02 = 0, x12 = 0.5, x2 = 1, s2 = 1, t02, t12, t22, k10, k21, interpolator = identity$3, transform, clamp = false, unknown;
  function scale(x) {
    return isNaN(x = +x) ? unknown : (x = 0.5 + ((x = +transform(x)) - t12) * (s2 * x < s2 * t12 ? k10 : k21), interpolator(clamp ? Math.max(0, Math.min(1, x)) : x));
  }
  scale.domain = function(_) {
    return arguments.length ? ([x02, x12, x2] = _, t02 = transform(x02 = +x02), t12 = transform(x12 = +x12), t22 = transform(x2 = +x2), k10 = t02 === t12 ? 0 : 0.5 / (t12 - t02), k21 = t12 === t22 ? 0 : 0.5 / (t22 - t12), s2 = t12 < t02 ? -1 : 1, scale) : [x02, x12, x2];
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, scale) : clamp;
  };
  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };
  function range2(interpolate2) {
    return function(_) {
      var r0, r1, r2;
      return arguments.length ? ([r0, r1, r2] = _, interpolator = piecewise(interpolate2, [r0, r1, r2]), scale) : [interpolator(0), interpolator(0.5), interpolator(1)];
    };
  }
  scale.range = range2(interpolate$1);
  scale.rangeRound = range2(interpolateRound);
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  return function(t) {
    transform = t, t02 = t(x02), t12 = t(x12), t22 = t(x2), k10 = t02 === t12 ? 0 : 0.5 / (t12 - t02), k21 = t12 === t22 ? 0 : 0.5 / (t22 - t12), s2 = t12 < t02 ? -1 : 1;
    return scale;
  };
}
function diverging() {
  var scale = linearish(transformer()(identity$3));
  scale.copy = function() {
    return copy(scale, diverging());
  };
  return initInterpolator.apply(scale, arguments);
}
function divergingLog() {
  var scale = loggish(transformer()).domain([0.1, 1, 10]);
  scale.copy = function() {
    return copy(scale, divergingLog()).base(scale.base());
  };
  return initInterpolator.apply(scale, arguments);
}
function divergingSymlog() {
  var scale = symlogish(transformer());
  scale.copy = function() {
    return copy(scale, divergingSymlog()).constant(scale.constant());
  };
  return initInterpolator.apply(scale, arguments);
}
function divergingPow() {
  var scale = powish(transformer());
  scale.copy = function() {
    return copy(scale, divergingPow()).exponent(scale.exponent());
  };
  return initInterpolator.apply(scale, arguments);
}
function colors(specifier) {
  var n = specifier.length / 6 | 0, colors2 = new Array(n), i = 0;
  while (i < n)
    colors2[i] = "#" + specifier.slice(i * 6, ++i * 6);
  return colors2;
}
const schemeCategory10 = colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");
const schemeAccent = colors("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666");
const schemeDark2 = colors("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666");
const schemePaired = colors("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");
const schemePastel1 = colors("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2");
const schemePastel2 = colors("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc");
const schemeSet1 = colors("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999");
const schemeSet2 = colors("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3");
const schemeSet3 = colors("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f");
const schemeTableau10 = colors("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab");
const ramp$1 = (scheme2) => rgbBasis(scheme2[scheme2.length - 1]);
var scheme$q = new Array(3).concat(
  "d8b365f5f5f55ab4ac",
  "a6611adfc27d80cdc1018571",
  "a6611adfc27df5f5f580cdc1018571",
  "8c510ad8b365f6e8c3c7eae55ab4ac01665e",
  "8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e",
  "8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e",
  "8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e",
  "5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30",
  "5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30"
).map(colors);
const interpolateBrBG = ramp$1(scheme$q);
var scheme$p = new Array(3).concat(
  "af8dc3f7f7f77fbf7b",
  "7b3294c2a5cfa6dba0008837",
  "7b3294c2a5cff7f7f7a6dba0008837",
  "762a83af8dc3e7d4e8d9f0d37fbf7b1b7837",
  "762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837",
  "762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837",
  "762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837",
  "40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b",
  "40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b"
).map(colors);
const interpolatePRGn = ramp$1(scheme$p);
var scheme$o = new Array(3).concat(
  "e9a3c9f7f7f7a1d76a",
  "d01c8bf1b6dab8e1864dac26",
  "d01c8bf1b6daf7f7f7b8e1864dac26",
  "c51b7de9a3c9fde0efe6f5d0a1d76a4d9221",
  "c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221",
  "c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221",
  "c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221",
  "8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419",
  "8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419"
).map(colors);
const interpolatePiYG = ramp$1(scheme$o);
var scheme$n = new Array(3).concat(
  "998ec3f7f7f7f1a340",
  "5e3c99b2abd2fdb863e66101",
  "5e3c99b2abd2f7f7f7fdb863e66101",
  "542788998ec3d8daebfee0b6f1a340b35806",
  "542788998ec3d8daebf7f7f7fee0b6f1a340b35806",
  "5427888073acb2abd2d8daebfee0b6fdb863e08214b35806",
  "5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806",
  "2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08",
  "2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08"
).map(colors);
const interpolatePuOr = ramp$1(scheme$n);
var scheme$m = new Array(3).concat(
  "ef8a62f7f7f767a9cf",
  "ca0020f4a58292c5de0571b0",
  "ca0020f4a582f7f7f792c5de0571b0",
  "b2182bef8a62fddbc7d1e5f067a9cf2166ac",
  "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac",
  "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac",
  "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac",
  "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061",
  "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061"
).map(colors);
const interpolateRdBu = ramp$1(scheme$m);
var scheme$l = new Array(3).concat(
  "ef8a62ffffff999999",
  "ca0020f4a582bababa404040",
  "ca0020f4a582ffffffbababa404040",
  "b2182bef8a62fddbc7e0e0e09999994d4d4d",
  "b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d",
  "b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d",
  "b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d",
  "67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a",
  "67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a"
).map(colors);
const interpolateRdGy = ramp$1(scheme$l);
var scheme$k = new Array(3).concat(
  "fc8d59ffffbf91bfdb",
  "d7191cfdae61abd9e92c7bb6",
  "d7191cfdae61ffffbfabd9e92c7bb6",
  "d73027fc8d59fee090e0f3f891bfdb4575b4",
  "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
  "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
  "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
  "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
  "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
).map(colors);
const interpolateRdYlBu = ramp$1(scheme$k);
var scheme$j = new Array(3).concat(
  "fc8d59ffffbf91cf60",
  "d7191cfdae61a6d96a1a9641",
  "d7191cfdae61ffffbfa6d96a1a9641",
  "d73027fc8d59fee08bd9ef8b91cf601a9850",
  "d73027fc8d59fee08bffffbfd9ef8b91cf601a9850",
  "d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850",
  "d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850",
  "a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837",
  "a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837"
).map(colors);
const interpolateRdYlGn = ramp$1(scheme$j);
var scheme$i = new Array(3).concat(
  "fc8d59ffffbf99d594",
  "d7191cfdae61abdda42b83ba",
  "d7191cfdae61ffffbfabdda42b83ba",
  "d53e4ffc8d59fee08be6f59899d5943288bd",
  "d53e4ffc8d59fee08bffffbfe6f59899d5943288bd",
  "d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd",
  "d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd",
  "9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2",
  "9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2"
).map(colors);
const interpolateSpectral = ramp$1(scheme$i);
var scheme$h = new Array(3).concat(
  "e5f5f999d8c92ca25f",
  "edf8fbb2e2e266c2a4238b45",
  "edf8fbb2e2e266c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a42ca25f006d2c",
  "edf8fbccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
  "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
).map(colors);
const interpolateBuGn = ramp$1(scheme$h);
var scheme$g = new Array(3).concat(
  "e0ecf49ebcda8856a7",
  "edf8fbb3cde38c96c688419d",
  "edf8fbb3cde38c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68856a7810f7c",
  "edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b",
  "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b"
).map(colors);
const interpolateBuPu = ramp$1(scheme$g);
var scheme$f = new Array(3).concat(
  "e0f3dba8ddb543a2ca",
  "f0f9e8bae4bc7bccc42b8cbe",
  "f0f9e8bae4bc7bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
  "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
  "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
).map(colors);
const interpolateGnBu = ramp$1(scheme$f);
var scheme$e = new Array(3).concat(
  "fee8c8fdbb84e34a33",
  "fef0d9fdcc8afc8d59d7301f",
  "fef0d9fdcc8afc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59e34a33b30000",
  "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
  "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
).map(colors);
const interpolateOrRd = ramp$1(scheme$e);
var scheme$d = new Array(3).concat(
  "ece2f0a6bddb1c9099",
  "f6eff7bdc9e167a9cf02818a",
  "f6eff7bdc9e167a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf1c9099016c59",
  "f6eff7d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450",
  "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636"
).map(colors);
const interpolatePuBuGn = ramp$1(scheme$d);
var scheme$c = new Array(3).concat(
  "ece7f2a6bddb2b8cbe",
  "f1eef6bdc9e174a9cf0570b0",
  "f1eef6bdc9e174a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
  "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
  "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
).map(colors);
const interpolatePuBu = ramp$1(scheme$c);
var scheme$b = new Array(3).concat(
  "e7e1efc994c7dd1c77",
  "f1eef6d7b5d8df65b0ce1256",
  "f1eef6d7b5d8df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0dd1c77980043",
  "f1eef6d4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f",
  "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f"
).map(colors);
const interpolatePuRd = ramp$1(scheme$b);
var scheme$a = new Array(3).concat(
  "fde0ddfa9fb5c51b8a",
  "feebe2fbb4b9f768a1ae017e",
  "feebe2fbb4b9f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1c51b8a7a0177",
  "feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177",
  "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a"
).map(colors);
const interpolateRdPu = ramp$1(scheme$a);
var scheme$9 = new Array(3).concat(
  "edf8b17fcdbb2c7fb8",
  "ffffcca1dab441b6c4225ea8",
  "ffffcca1dab441b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
  "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
  "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
).map(colors);
const interpolateYlGnBu = ramp$1(scheme$9);
var scheme$8 = new Array(3).concat(
  "f7fcb9addd8e31a354",
  "ffffccc2e69978c679238443",
  "ffffccc2e69978c67931a354006837",
  "ffffccd9f0a3addd8e78c67931a354006837",
  "ffffccd9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32",
  "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529"
).map(colors);
const interpolateYlGn = ramp$1(scheme$8);
var scheme$7 = new Array(3).concat(
  "fff7bcfec44fd95f0e",
  "ffffd4fed98efe9929cc4c02",
  "ffffd4fed98efe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929d95f0e993404",
  "ffffd4fee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04",
  "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506"
).map(colors);
const interpolateYlOrBr = ramp$1(scheme$7);
var scheme$6 = new Array(3).concat(
  "ffeda0feb24cf03b20",
  "ffffb2fecc5cfd8d3ce31a1c",
  "ffffb2fecc5cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cf03b20bd0026",
  "ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026",
  "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026"
).map(colors);
const interpolateYlOrRd = ramp$1(scheme$6);
var scheme$5 = new Array(3).concat(
  "deebf79ecae13182bd",
  "eff3ffbdd7e76baed62171b5",
  "eff3ffbdd7e76baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed63182bd08519c",
  "eff3ffc6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
  "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
).map(colors);
const interpolateBlues = ramp$1(scheme$5);
var scheme$4 = new Array(3).concat(
  "e5f5e0a1d99b31a354",
  "edf8e9bae4b374c476238b45",
  "edf8e9bae4b374c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47631a354006d2c",
  "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
  "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
).map(colors);
const interpolateGreens = ramp$1(scheme$4);
var scheme$3 = new Array(3).concat(
  "f0f0f0bdbdbd636363",
  "f7f7f7cccccc969696525252",
  "f7f7f7cccccc969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696636363252525",
  "f7f7f7d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
  "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
).map(colors);
const interpolateGreys = ramp$1(scheme$3);
var scheme$2 = new Array(3).concat(
  "efedf5bcbddc756bb1",
  "f2f0f7cbc9e29e9ac86a51a3",
  "f2f0f7cbc9e29e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
  "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
  "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
).map(colors);
const interpolatePurples = ramp$1(scheme$2);
var scheme$1 = new Array(3).concat(
  "fee0d2fc9272de2d26",
  "fee5d9fcae91fb6a4acb181d",
  "fee5d9fcae91fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
  "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
  "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
).map(colors);
const interpolateReds = ramp$1(scheme$1);
var scheme = new Array(3).concat(
  "fee6cefdae6be6550d",
  "feeddefdbe85fd8d3cd94701",
  "feeddefdbe85fd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3ce6550da63603",
  "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
  "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
).map(colors);
const interpolateOranges = ramp$1(scheme);
function interpolateCividis(t) {
  t = Math.max(0, Math.min(1, t));
  return "rgb(" + Math.max(0, Math.min(255, Math.round(-4.54 - t * (35.34 - t * (2381.73 - t * (6402.7 - t * (7024.72 - t * 2710.57))))))) + ", " + Math.max(0, Math.min(255, Math.round(32.49 + t * (170.73 + t * (52.82 - t * (131.46 - t * (176.58 - t * 67.37))))))) + ", " + Math.max(0, Math.min(255, Math.round(81.24 + t * (442.36 - t * (2482.43 - t * (6167.24 - t * (6614.94 - t * 2475.67))))))) + ")";
}
const interpolateCubehelixDefault = cubehelixLong(cubehelix$1(300, 0.5, 0), cubehelix$1(-240, 0.5, 1));
var warm = cubehelixLong(cubehelix$1(-100, 0.75, 0.35), cubehelix$1(80, 1.5, 0.8));
var cool = cubehelixLong(cubehelix$1(260, 0.75, 0.35), cubehelix$1(80, 1.5, 0.8));
var c$2 = cubehelix$1();
function interpolateRainbow(t) {
  if (t < 0 || t > 1)
    t -= Math.floor(t);
  var ts = Math.abs(t - 0.5);
  c$2.h = 360 * t - 100;
  c$2.s = 1.5 - 1.5 * ts;
  c$2.l = 0.8 - 0.9 * ts;
  return c$2 + "";
}
var c$1 = rgb(), pi_1_3 = Math.PI / 3, pi_2_3 = Math.PI * 2 / 3;
function interpolateSinebow(t) {
  var x;
  t = (0.5 - t) * Math.PI;
  c$1.r = 255 * (x = Math.sin(t)) * x;
  c$1.g = 255 * (x = Math.sin(t + pi_1_3)) * x;
  c$1.b = 255 * (x = Math.sin(t + pi_2_3)) * x;
  return c$1 + "";
}
function interpolateTurbo(t) {
  t = Math.max(0, Math.min(1, t));
  return "rgb(" + Math.max(0, Math.min(255, Math.round(34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05))))))) + ", " + Math.max(0, Math.min(255, Math.round(23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56))))))) + ", " + Math.max(0, Math.min(255, Math.round(27.2 + t * (3211.1 - t * (15327.97 - t * (27814 - t * (22569.18 - t * 6838.66))))))) + ")";
}
function ramp(range2) {
  var n = range2.length;
  return function(t) {
    return range2[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}
const interpolateViridis = ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));
var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));
var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));
var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));
const cos = Math.cos;
const min = Math.min;
const sin = Math.sin;
const sqrt = Math.sqrt;
const pi$1 = Math.PI;
const tau$1 = 2 * pi$1;
const sqrt3$3 = sqrt(3);
const symbolAsterisk = {
  draw(context, size) {
    const r = sqrt(size + min(size / 28, 0.75)) * 0.59436;
    const t = r / 2;
    const u = t * sqrt3$3;
    context.moveTo(0, r);
    context.lineTo(0, -r);
    context.moveTo(-u, -t);
    context.lineTo(u, t);
    context.moveTo(-u, t);
    context.lineTo(u, -t);
  }
};
const symbolCircle = {
  draw(context, size) {
    const r = sqrt(size / pi$1);
    context.moveTo(r, 0);
    context.arc(0, 0, r, 0, tau$1);
  }
};
const symbolCross = {
  draw(context, size) {
    const r = sqrt(size / 5) / 2;
    context.moveTo(-3 * r, -r);
    context.lineTo(-r, -r);
    context.lineTo(-r, -3 * r);
    context.lineTo(r, -3 * r);
    context.lineTo(r, -r);
    context.lineTo(3 * r, -r);
    context.lineTo(3 * r, r);
    context.lineTo(r, r);
    context.lineTo(r, 3 * r);
    context.lineTo(-r, 3 * r);
    context.lineTo(-r, r);
    context.lineTo(-3 * r, r);
    context.closePath();
  }
};
const tan30 = sqrt(1 / 3);
const tan30_2 = tan30 * 2;
const symbolDiamond = {
  draw(context, size) {
    const y = sqrt(size / tan30_2);
    const x = y * tan30;
    context.moveTo(0, -y);
    context.lineTo(x, 0);
    context.lineTo(0, y);
    context.lineTo(-x, 0);
    context.closePath();
  }
};
const symbolDiamond2 = {
  draw(context, size) {
    const r = sqrt(size) * 0.62625;
    context.moveTo(0, -r);
    context.lineTo(r, 0);
    context.lineTo(0, r);
    context.lineTo(-r, 0);
    context.closePath();
  }
};
const symbolPlus = {
  draw(context, size) {
    const r = sqrt(size - min(size / 7, 2)) * 0.87559;
    context.moveTo(-r, 0);
    context.lineTo(r, 0);
    context.moveTo(0, r);
    context.lineTo(0, -r);
  }
};
const symbolSquare = {
  draw(context, size) {
    const w = sqrt(size);
    const x = -w / 2;
    context.rect(x, x, w, w);
  }
};
const symbolSquare2 = {
  draw(context, size) {
    const r = sqrt(size) * 0.4431;
    context.moveTo(r, r);
    context.lineTo(r, -r);
    context.lineTo(-r, -r);
    context.lineTo(-r, r);
    context.closePath();
  }
};
const ka = 0.8908130915292852;
const kr = sin(pi$1 / 10) / sin(7 * pi$1 / 10);
const kx = sin(tau$1 / 10) * kr;
const ky = -cos(tau$1 / 10) * kr;
const symbolStar = {
  draw(context, size) {
    const r = sqrt(size * ka);
    const x = kx * r;
    const y = ky * r;
    context.moveTo(0, -r);
    context.lineTo(x, y);
    for (let i = 1; i < 5; ++i) {
      const a2 = tau$1 * i / 5;
      const c2 = cos(a2);
      const s2 = sin(a2);
      context.lineTo(s2 * r, -c2 * r);
      context.lineTo(c2 * x - s2 * y, s2 * x + c2 * y);
    }
    context.closePath();
  }
};
const sqrt3$2 = sqrt(3);
const symbolTriangle = {
  draw(context, size) {
    const y = -sqrt(size / (sqrt3$2 * 3));
    context.moveTo(0, y * 2);
    context.lineTo(-sqrt3$2 * y, -y);
    context.lineTo(sqrt3$2 * y, -y);
    context.closePath();
  }
};
const sqrt3$1 = sqrt(3);
const symbolTriangle2 = {
  draw(context, size) {
    const s2 = sqrt(size) * 0.6824;
    const t = s2 / 2;
    const u = s2 * sqrt3$1 / 2;
    context.moveTo(0, -s2);
    context.lineTo(u, t);
    context.lineTo(-u, t);
    context.closePath();
  }
};
const c = -0.5;
const s = sqrt(3) / 2;
const k = 1 / sqrt(12);
const a = (k / 2 + 1) * 3;
const symbolWye = {
  draw(context, size) {
    const r = sqrt(size / a);
    const x02 = r / 2, y02 = r * k;
    const x12 = x02, y12 = r * k + r;
    const x2 = -x12, y2 = y12;
    context.moveTo(x02, y02);
    context.lineTo(x12, y12);
    context.lineTo(x2, y2);
    context.lineTo(c * x02 - s * y02, s * x02 + c * y02);
    context.lineTo(c * x12 - s * y12, s * x12 + c * y12);
    context.lineTo(c * x2 - s * y2, s * x2 + c * y2);
    context.lineTo(c * x02 + s * y02, c * y02 - s * x02);
    context.lineTo(c * x12 + s * y12, c * y12 - s * x12);
    context.lineTo(c * x2 + s * y2, c * y2 - s * x2);
    context.closePath();
  }
};
const symbolTimes = {
  draw(context, size) {
    const r = sqrt(size - min(size / 6, 1.7)) * 0.6189;
    context.moveTo(-r, -r);
    context.lineTo(r, r);
    context.moveTo(-r, r);
    context.lineTo(r, -r);
  }
};
const symbolsFill = [
  symbolCircle,
  symbolCross,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolTriangle,
  symbolWye
];
const symbolsStroke = [
  symbolCircle,
  symbolPlus,
  symbolTimes,
  symbolTriangle2,
  symbolAsterisk,
  symbolSquare2,
  symbolDiamond2
];
function Transform(k2, x, y) {
  this.k = k2;
  this.x = x;
  this.y = y;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k2) {
    return k2 === 1 ? this : new Transform(this.k * k2, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point2) {
    return [point2[0] * this.k + this.x, point2[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
Transform.prototype;
function format(date2, fallback) {
  if (!(date2 instanceof Date))
    date2 = new Date(+date2);
  if (isNaN(date2))
    return typeof fallback === "function" ? fallback(date2) : fallback;
  const hours = date2.getUTCHours();
  const minutes = date2.getUTCMinutes();
  const seconds = date2.getUTCSeconds();
  const milliseconds = date2.getUTCMilliseconds();
  return `${formatYear(date2.getUTCFullYear())}-${pad(date2.getUTCMonth() + 1, 2)}-${pad(date2.getUTCDate(), 2)}${hours || minutes || seconds || milliseconds ? `T${pad(hours, 2)}:${pad(minutes, 2)}${seconds || milliseconds ? `:${pad(seconds, 2)}${milliseconds ? `.${pad(milliseconds, 3)}` : ``}` : ``}Z` : ``}`;
}
function formatYear(year) {
  return year < 0 ? `-${pad(-year, 6)}` : year > 9999 ? `+${pad(year, 6)}` : pad(year, 4);
}
function pad(value, width) {
  return `${value}`.padStart(width, "0");
}
const re = /^(?:[-+]\d{2})?\d{4}(?:-\d{2}(?:-\d{2})?)?(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?(?:Z|[-+]\d{2}:?\d{2})?)?$/;
function parse(string2, fallback) {
  if (!re.test(string2 += ""))
    return typeof fallback === "function" ? fallback(string2) : fallback;
  return new Date(string2);
}
const timeIntervals = /* @__PURE__ */ new Map([
  ["second", second$1],
  ["minute", timeMinute],
  ["hour", timeHour],
  ["day", timeDay],
  ["week", timeSunday],
  ["month", timeMonth],
  ["year", timeYear],
  ["monday", timeMonday],
  ["tuesday", timeTuesday],
  ["wednesday", timeWednesday],
  ["thursday", timeThursday],
  ["friday", timeFriday],
  ["saturday", timeSaturday],
  ["sunday", timeSunday]
]);
const utcIntervals = /* @__PURE__ */ new Map([
  ["second", second$1],
  ["minute", utcMinute],
  ["hour", utcHour],
  ["day", utcDay],
  ["week", utcSunday],
  ["month", utcMonth],
  ["year", utcYear],
  ["monday", utcMonday],
  ["tuesday", utcTuesday],
  ["wednesday", utcWednesday],
  ["thursday", utcThursday],
  ["friday", utcFriday],
  ["saturday", utcSaturday],
  ["sunday", utcSunday]
]);
function maybeTimeInterval(interval2) {
  const i = timeIntervals.get(`${interval2}`.toLowerCase());
  if (!i)
    throw new Error(`unknown interval: ${interval2}`);
  return i;
}
function maybeUtcInterval(interval2) {
  const i = utcIntervals.get(`${interval2}`.toLowerCase());
  if (!i)
    throw new Error(`unknown interval: ${interval2}`);
  return i;
}
const TypedArray = Object.getPrototypeOf(Uint8Array);
const objectToString = Object.prototype.toString;
function valueof(data, value, type) {
  const valueType = typeof value;
  return valueType === "string" ? map(data, field(value), type) : valueType === "function" ? map(data, value, type) : valueType === "number" || value instanceof Date || valueType === "boolean" ? map(data, constant(value), type) : value && typeof value.transform === "function" ? arrayify(value.transform(data), type) : arrayify(value, type);
}
const field = (name) => (d) => d[name];
const indexOf = (d, i) => i;
const identity$1 = { transform: (d) => d };
const one = () => 1;
const yes = () => true;
const string = (x) => x == null ? x : `${x}`;
const number = (x) => x == null ? x : +x;
const first = (x) => x ? x[0] : void 0;
const second = (x) => x ? x[1] : void 0;
const constant = (x) => () => x;
function percentile(reduce) {
  const p = +`${reduce}`.slice(1) / 100;
  return (I, f) => quantile$1(I, p, f);
}
function maybeColorChannel(value, defaultValue) {
  if (value === void 0)
    value = defaultValue;
  return value === null ? [void 0, "none"] : isColor(value) ? [void 0, value] : [value, void 0];
}
function maybeNumberChannel(value, defaultValue) {
  if (value === void 0)
    value = defaultValue;
  return value === null || typeof value === "number" ? [void 0, value] : [value, void 0];
}
function maybeKeyword(input, name, allowed) {
  if (input != null)
    return keyword(input, name, allowed);
}
function keyword(input, name, allowed) {
  const i = `${input}`.toLowerCase();
  if (!allowed.includes(i))
    throw new Error(`invalid ${name}: ${input}`);
  return i;
}
function arrayify(data, type) {
  return data == null ? data : type === void 0 ? data instanceof Array || data instanceof TypedArray ? data : Array.from(data) : data instanceof type ? data : type.from(data);
}
function map(values2, f, type = Array) {
  return values2 instanceof type ? values2.map(f) : type.from(values2, f);
}
function slice(values2, type = Array) {
  return values2 instanceof type ? values2.slice() : type.from(values2);
}
function isTypedArray(values2) {
  return values2 instanceof TypedArray;
}
function isObject(option) {
  return (option == null ? void 0 : option.toString) === objectToString;
}
function isScaleOptions(option) {
  return isObject(option) && (option.type !== void 0 || option.domain !== void 0);
}
function isOptions(option) {
  return isObject(option) && typeof option.transform !== "function";
}
function isDomainSort(sort2) {
  return isOptions(sort2) && sort2.value === void 0 && sort2.channel === void 0;
}
function maybeZero(x, x12, x2, x3 = identity$1) {
  if (x12 === void 0 && x2 === void 0) {
    x12 = 0, x2 = x === void 0 ? x3 : x;
  } else if (x12 === void 0) {
    x12 = x === void 0 ? 0 : x;
  } else if (x2 === void 0) {
    x2 = x === void 0 ? 0 : x;
  }
  return [x12, x2];
}
function maybeTuple(x, y) {
  return x === void 0 && y === void 0 ? [first, second] : [x, y];
}
function maybeZ({ z, fill, stroke } = {}) {
  if (z === void 0)
    [z] = maybeColorChannel(fill);
  if (z === void 0)
    [z] = maybeColorChannel(stroke);
  return z;
}
function range(data) {
  const n = data.length;
  const r = new Uint32Array(n);
  for (let i = 0; i < n; ++i)
    r[i] = i;
  return r;
}
function take(values2, index2) {
  return map(index2, (i) => values2[i]);
}
function column(source) {
  let value;
  return [
    {
      transform: () => value,
      label: labelof(source)
    },
    (v) => value = v
  ];
}
function maybeColumn(source) {
  return source == null ? [source] : column(source);
}
function labelof(value, defaultValue) {
  return typeof value === "string" ? value : value && value.label !== void 0 ? value.label : defaultValue;
}
function mid$1(x12, x2) {
  return {
    transform(data) {
      const X12 = x12.transform(data);
      const X22 = x2.transform(data);
      return isTemporal(X12) || isTemporal(X22) ? map(X12, (_, i) => new Date((+X12[i] + +X22[i]) / 2)) : map(X12, (_, i) => (+X12[i] + +X22[i]) / 2, Float64Array);
    },
    label: x12.label
  };
}
function maybeInterval(interval2, type) {
  if (interval2 == null)
    return;
  if (typeof interval2 === "number") {
    const n = interval2;
    return {
      floor: (d) => n * Math.floor(d / n),
      offset: (d) => d + n,
      range: (lo, hi) => range$1(Math.ceil(lo / n), hi / n).map((x) => n * x)
    };
  }
  if (typeof interval2 === "string")
    return (type === "time" ? maybeTimeInterval : maybeUtcInterval)(interval2);
  if (typeof interval2.floor !== "function")
    throw new Error("invalid interval; missing floor method");
  if (typeof interval2.offset !== "function")
    throw new Error("invalid interval; missing offset method");
  return interval2;
}
function maybeValue(value) {
  return value === void 0 || isOptions(value) ? value : { value };
}
function numberChannel(source) {
  return source == null ? null : {
    transform: (data) => valueof(data, source, Float64Array),
    label: labelof(source)
  };
}
function isIterable(value) {
  return value && typeof value[Symbol.iterator] === "function";
}
function isTextual(values2) {
  for (const value of values2) {
    if (value == null)
      continue;
    return typeof value !== "object" || value instanceof Date;
  }
}
function isOrdinal(values2) {
  for (const value of values2) {
    if (value == null)
      continue;
    const type = typeof value;
    return type === "string" || type === "boolean";
  }
}
function isTemporal(values2) {
  for (const value of values2) {
    if (value == null)
      continue;
    return value instanceof Date;
  }
}
function isTemporalString(values2) {
  for (const value of values2) {
    if (value == null)
      continue;
    return typeof value === "string" && isNaN(value) && parse(value);
  }
}
function isNumericString(values2) {
  for (const value of values2) {
    if (value == null)
      continue;
    if (typeof value !== "string")
      return false;
    if (!value.trim())
      continue;
    return !isNaN(value);
  }
}
function isNumeric(values2) {
  for (const value of values2) {
    if (value == null)
      continue;
    return typeof value === "number";
  }
}
function isEvery(values2, is) {
  let every;
  for (const value of values2) {
    if (value == null)
      continue;
    if (!is(value))
      return false;
    every = true;
  }
  return every;
}
function isColor(value) {
  if (typeof value !== "string")
    return false;
  value = value.toLowerCase().trim();
  return value === "none" || value === "currentcolor" || value.startsWith("url(") && value.endsWith(")") || // <funciri>, e.g. pattern or gradient
  value.startsWith("var(") && value.endsWith(")") || // CSS variable
  color$1(value) !== null;
}
function isNoneish(value) {
  return value == null || isNone(value);
}
function isNone(value) {
  return /^\s*none\s*$/i.test(value);
}
function isRound(value) {
  return /^\s*round\s*$/i.test(value);
}
function maybeFrameAnchor(value = "middle") {
  return keyword(value, "frameAnchor", [
    "middle",
    "top-left",
    "top",
    "top-right",
    "right",
    "bottom-right",
    "bottom",
    "bottom-left",
    "left"
  ]);
}
function orderof(values2) {
  if (values2 == null)
    return;
  const first2 = values2[0];
  const last = values2[values2.length - 1];
  return descending(first2, last);
}
function inherit(options = {}, ...rest) {
  let o = options;
  for (const defaults2 of rest) {
    for (const key in defaults2) {
      if (o[key] === void 0) {
        const value = defaults2[key];
        if (o === options)
          o = { ...o, [key]: value };
        else
          o[key] = value;
      }
    }
  }
  return o;
}
function Named(things) {
  console.warn("named iterables are deprecated; please use an object instead");
  const names = /* @__PURE__ */ new Set();
  return Object.fromEntries(Array.from(things, (thing) => {
    const { name } = thing;
    if (name == null)
      throw new Error("missing name");
    const key = `${name}`;
    if (key === "__proto__")
      throw new Error(`illegal name: ${key}`);
    if (names.has(key))
      throw new Error(`duplicate name: ${key}`);
    names.add(key);
    return [name, thing];
  }));
}
function maybeNamed(things) {
  return isIterable(things) ? Named(things) : things;
}
const position = Symbol("position");
const color = Symbol("color");
const radius = Symbol("radius");
const length = Symbol("length");
const opacity = Symbol("opacity");
const symbol = Symbol("symbol");
const registry = /* @__PURE__ */ new Map([
  ["x", position],
  ["y", position],
  ["fx", position],
  ["fy", position],
  ["r", radius],
  ["color", color],
  ["opacity", opacity],
  ["symbol", symbol],
  ["length", length]
]);
const sqrt3 = Math.sqrt(3);
const sqrt4_3 = 2 / sqrt3;
const symbolHexagon = {
  draw(context, size) {
    const rx = Math.sqrt(size / Math.PI), ry = rx * sqrt4_3, hy = ry / 2;
    context.moveTo(0, ry);
    context.lineTo(rx, hy);
    context.lineTo(rx, -hy);
    context.lineTo(0, -ry);
    context.lineTo(-rx, -hy);
    context.lineTo(-rx, hy);
    context.closePath();
  }
};
const symbols = /* @__PURE__ */ new Map([
  ["asterisk", symbolAsterisk],
  ["circle", symbolCircle],
  ["cross", symbolCross],
  ["diamond", symbolDiamond],
  ["diamond2", symbolDiamond2],
  ["hexagon", symbolHexagon],
  ["plus", symbolPlus],
  ["square", symbolSquare],
  ["square2", symbolSquare2],
  ["star", symbolStar],
  ["times", symbolTimes],
  ["triangle", symbolTriangle],
  ["triangle2", symbolTriangle2],
  ["wye", symbolWye]
]);
function isSymbolObject(value) {
  return value && typeof value.draw === "function";
}
function isSymbol(value) {
  if (isSymbolObject(value))
    return true;
  if (typeof value !== "string")
    return false;
  return symbols.has(value.toLowerCase());
}
function maybeSymbol(symbol2) {
  if (symbol2 == null || isSymbolObject(symbol2))
    return symbol2;
  const value = symbols.get(`${symbol2}`.toLowerCase());
  if (value)
    return value;
  throw new Error(`invalid symbol: ${symbol2}`);
}
function maybeSymbolChannel(symbol2) {
  if (symbol2 == null || isSymbolObject(symbol2))
    return [void 0, symbol2];
  if (typeof symbol2 === "string") {
    const value = symbols.get(`${symbol2}`.toLowerCase());
    if (value)
      return [void 0, value];
  }
  return [symbol2, void 0];
}
function defined(x) {
  return x != null && !Number.isNaN(x);
}
function ascendingDefined(a2, b) {
  return +defined(b) - +defined(a2) || ascending$1(a2, b);
}
function descendingDefined(a2, b) {
  return +defined(b) - +defined(a2) || descending(a2, b);
}
function nonempty(x) {
  return x != null && `${x}` !== "";
}
function finite(x) {
  return isFinite(x) ? x : NaN;
}
function positive(x) {
  return x > 0 && isFinite(x) ? x : NaN;
}
function negative(x) {
  return x < 0 && isFinite(x) ? x : NaN;
}
function basic(options = {}, transform) {
  let { filter: f1, sort: s1, reverse: r1, transform: t12, initializer: i1, ...remainingOptions } = options;
  if (t12 === void 0) {
    if (f1 != null)
      t12 = filterTransform(f1);
    if (s1 != null && !isDomainSort(s1))
      t12 = composeTransform(t12, sortTransform(s1));
    if (r1)
      t12 = composeTransform(t12, reverseTransform);
  }
  if (transform != null && i1 != null)
    throw new Error("transforms cannot be applied after initializers");
  return {
    ...remainingOptions,
    ...(s1 === null || isDomainSort(s1)) && { sort: s1 },
    transform: composeTransform(t12, transform)
  };
}
function initializer(options = {}, initializer2) {
  let { filter: f1, sort: s1, reverse: r1, initializer: i1, ...remainingOptions } = options;
  if (i1 === void 0) {
    if (f1 != null)
      i1 = filterTransform(f1);
    if (s1 != null && !isDomainSort(s1))
      i1 = composeInitializer(i1, sortTransform(s1));
    if (r1)
      i1 = composeInitializer(i1, reverseTransform);
  }
  return {
    ...remainingOptions,
    ...(s1 === null || isDomainSort(s1)) && { sort: s1 },
    initializer: composeInitializer(i1, initializer2)
  };
}
function composeTransform(t12, t22) {
  if (t12 == null)
    return t22 === null ? void 0 : t22;
  if (t22 == null)
    return t12 === null ? void 0 : t12;
  return function(data, facets) {
    ({ data, facets } = t12.call(this, data, facets));
    return t22.call(this, arrayify(data), facets);
  };
}
function composeInitializer(i1, i2) {
  if (i1 == null)
    return i2 === null ? void 0 : i2;
  if (i2 == null)
    return i1 === null ? void 0 : i1;
  return function(data, facets, channels, ...args) {
    let c1, d1, f1, c2, d2, f2;
    ({ data: d1 = data, facets: f1 = facets, channels: c1 } = i1.call(this, data, facets, channels, ...args));
    ({ data: d2 = d1, facets: f2 = f1, channels: c2 } = i2.call(this, d1, f1, { ...channels, ...c1 }, ...args));
    return { data: d2, facets: f2, channels: { ...c1, ...c2 } };
  };
}
function apply(options, t) {
  return (options.initializer != null ? initializer : basic)(options, t);
}
function filterTransform(value) {
  return (data, facets) => {
    const V = valueof(data, value);
    return { data, facets: facets.map((I) => I.filter((i) => V[i])) };
  };
}
function reverseTransform(data, facets) {
  return { data, facets: facets.map((I) => I.slice().reverse()) };
}
function sort(order, options) {
  return {
    ...(isOptions(order) && order.channel !== void 0 ? initializer : apply)(options, sortTransform(order)),
    sort: null
  };
}
function sortTransform(value) {
  return (typeof value === "function" && value.length !== 1 ? sortData : sortValue)(value);
}
function sortData(compare) {
  return (data, facets) => {
    const compareData = (i, j) => compare(data[i], data[j]);
    return { data, facets: facets.map((I) => I.slice().sort(compareData)) };
  };
}
function sortValue(value) {
  let channel, order;
  ({ channel, value, order = ascendingDefined } = { ...maybeValue(value) });
  if (typeof order !== "function") {
    switch (`${order}`.toLowerCase()) {
      case "ascending":
        order = ascendingDefined;
        break;
      case "descending":
        order = descendingDefined;
        break;
      default:
        throw new Error(`invalid order: ${order}`);
    }
  }
  return (data, facets, channels) => {
    let V;
    if (channel === void 0) {
      V = valueof(data, value);
    } else {
      if (channels === void 0)
        throw new Error("channel sort requires an initializer");
      V = channels[channel];
      if (!V)
        return {};
      V = V.value;
    }
    const compareValue = (i, j) => order(V[i], V[j]);
    return { data, facets: facets.map((I) => I.slice().sort(compareValue)) };
  };
}
function maybeReduce(reduce, value) {
  if (typeof (reduce == null ? void 0 : reduce.reduce) === "function" && isObject(reduce))
    return reduce;
  if (typeof reduce === "function")
    return reduceFunction(reduce);
  if (/^p\d{2}$/i.test(reduce))
    return reduceAccessor(percentile(reduce));
  switch (`${reduce}`.toLowerCase()) {
    case "first":
      return reduceFirst;
    case "last":
      return reduceLast;
    case "count":
      return reduceCount;
    case "distinct":
      return reduceDistinct;
    case "sum":
      return value == null ? reduceCount : reduceSum;
    case "proportion":
      return reduceProportion(value, "data");
    case "proportion-facet":
      return reduceProportion(value, "facet");
    case "deviation":
      return reduceAccessor(deviation);
    case "min":
      return reduceAccessor(min$1);
    case "min-index":
      return reduceAccessor(minIndex);
    case "max":
      return reduceAccessor(max);
    case "max-index":
      return reduceAccessor(maxIndex);
    case "mean":
      return reduceMaybeTemporalAccessor(mean);
    case "median":
      return reduceMaybeTemporalAccessor(median);
    case "variance":
      return reduceAccessor(variance);
    case "mode":
      return reduceAccessor(mode);
    case "x":
      return reduceX;
    case "x1":
      return reduceX1;
    case "x2":
      return reduceX2;
    case "y":
      return reduceY;
    case "y1":
      return reduceY1;
    case "y2":
      return reduceY2;
  }
  throw new Error(`invalid reduce: ${reduce}`);
}
function reduceFunction(f) {
  return {
    reduce(I, X, extent2) {
      return f(take(X, I), extent2);
    }
  };
}
function reduceAccessor(f) {
  return {
    reduce(I, X) {
      return f(I, (i) => X[i]);
    }
  };
}
function reduceMaybeTemporalAccessor(f) {
  return {
    reduce(I, X) {
      const x = f(I, (i) => X[i]);
      return isTemporal(X) ? new Date(x) : x;
    }
  };
}
const reduceFirst = {
  reduce(I, X) {
    return X[I[0]];
  }
};
const reduceLast = {
  reduce(I, X) {
    return X[I[I.length - 1]];
  }
};
const reduceCount = {
  label: "Frequency",
  reduce(I) {
    return I.length;
  }
};
const reduceDistinct = {
  label: "Distinct",
  reduce: (I, X) => {
    const s2 = new InternSet();
    for (const i of I)
      s2.add(X[i]);
    return s2.size;
  }
};
const reduceSum = reduceAccessor(sum);
function reduceProportion(value, scope) {
  return value == null ? { scope, label: "Frequency", reduce: (I, V, basis2 = 1) => I.length / basis2 } : { scope, reduce: (I, V, basis2 = 1) => sum(I, (i) => V[i]) / basis2 };
}
function mid(x12, x2) {
  const m = (+x12 + +x2) / 2;
  return x12 instanceof Date ? new Date(m) : m;
}
const reduceX = {
  reduce(I, X, { x1: x12, x2 }) {
    return mid(x12, x2);
  }
};
const reduceY = {
  reduce(I, X, { y1: y12, y2 }) {
    return mid(y12, y2);
  }
};
const reduceX1 = {
  reduce(I, X, { x1: x12 }) {
    return x12;
  }
};
const reduceX2 = {
  reduce(I, X, { x2 }) {
    return x2;
  }
};
const reduceY1 = {
  reduce(I, X, { y1: y12 }) {
    return y12;
  }
};
const reduceY2 = {
  reduce(I, X, { y2 }) {
    return y2;
  }
};
function Channel(data, { scale, type, value, filter: filter2, hint }, name) {
  return inferChannelScale(name, {
    scale,
    type,
    value: valueof(data, value),
    label: labelof(value),
    filter: filter2,
    hint
  });
}
function Channels(channels, data) {
  return Object.fromEntries(Object.entries(channels).map(([name, channel]) => [name, Channel(data, channel, name)]));
}
function valueObject(channels, scales) {
  return Object.fromEntries(Object.entries(channels).map(([name, { scale: scaleName, value }]) => {
    const scale = scaleName == null ? null : scales[scaleName];
    return [name, scale == null ? value : map(value, scale)];
  }));
}
function inferChannelScale(name, channel) {
  const { scale, value } = channel;
  if (scale === true || scale === "auto") {
    switch (name) {
      case "fill":
      case "stroke":
      case "color":
        channel.scale = isEvery(value, isColor) ? null : "color";
        break;
      case "fillOpacity":
      case "strokeOpacity":
        channel.scale = "opacity";
        break;
      case "symbol":
        if (isEvery(value, isSymbol)) {
          channel.scale = null;
          channel.value = map(value, maybeSymbol);
        } else {
          channel.scale = "symbol";
        }
        break;
      default:
        channel.scale = registry.has(name) ? name : null;
        break;
    }
  } else if (scale != null && !registry.has(scale)) {
    throw new Error(`unknown scale: ${scale}`);
  }
  return channel;
}
function channelDomain(channels, facetChannels, data, options) {
  const { reverse: defaultReverse, reduce: defaultReduce = true, limit: defaultLimit } = options;
  for (const x in options) {
    if (!registry.has(x))
      continue;
    let { value: y, reverse: reverse2 = defaultReverse, reduce = defaultReduce, limit = defaultLimit } = maybeValue(options[x]);
    if (reverse2 === void 0)
      reverse2 = y === "width" || y === "height";
    if (reduce == null || reduce === false)
      continue;
    const X = findScaleChannel(channels, x) || facetChannels && findScaleChannel(facetChannels, x);
    if (!X)
      throw new Error(`missing channel for scale: ${x}`);
    const XV = X.value;
    const [lo = 0, hi = Infinity] = isIterable(limit) ? limit : limit < 0 ? [limit] : [0, limit];
    if (y == null) {
      X.domain = () => {
        let domain = XV;
        if (reverse2)
          domain = domain.slice().reverse();
        if (lo !== 0 || hi !== Infinity)
          domain = domain.slice(lo, hi);
        return domain;
      };
    } else {
      const YV = y === "data" ? data : y === "height" ? difference(channels, "y1", "y2") : y === "width" ? difference(channels, "x1", "x2") : values(channels, y, y === "y" ? "y2" : y === "x" ? "x2" : void 0);
      const reducer2 = maybeReduce(reduce === true ? "max" : reduce, YV);
      X.domain = () => {
        let domain = rollup(range(XV), (I) => reducer2.reduce(I, YV), (i) => XV[i]);
        domain = sort$1(domain, reverse2 ? descendingGroup : ascendingGroup);
        if (lo !== 0 || hi !== Infinity)
          domain = domain.slice(lo, hi);
        return domain.map(first);
      };
    }
  }
}
function findScaleChannel(channels, scale) {
  for (const name in channels) {
    const channel = channels[name];
    if (channel.scale === scale)
      return channel;
  }
}
function difference(channels, k1, k2) {
  const X12 = values(channels, k1);
  const X22 = values(channels, k2);
  return map(X22, (x2, i) => Math.abs(x2 - X12[i]), Float64Array);
}
function values(channels, name, alias) {
  let channel = channels[name];
  if (!channel && alias !== void 0)
    channel = channels[alias];
  if (channel)
    return channel.value;
  throw new Error(`missing channel: ${name}`);
}
function ascendingGroup([ak, av], [bk, bv]) {
  return ascending$1(av, bv) || ascending$1(ak, bk);
}
function descendingGroup([ak, av], [bk, bv]) {
  return descending(av, bv) || ascending$1(ak, bk);
}
const ordinalSchemes = /* @__PURE__ */ new Map([
  // categorical
  ["accent", schemeAccent],
  ["category10", schemeCategory10],
  ["dark2", schemeDark2],
  ["paired", schemePaired],
  ["pastel1", schemePastel1],
  ["pastel2", schemePastel2],
  ["set1", schemeSet1],
  ["set2", schemeSet2],
  ["set3", schemeSet3],
  ["tableau10", schemeTableau10],
  // diverging
  ["brbg", scheme11(scheme$q, interpolateBrBG)],
  ["prgn", scheme11(scheme$p, interpolatePRGn)],
  ["piyg", scheme11(scheme$o, interpolatePiYG)],
  ["puor", scheme11(scheme$n, interpolatePuOr)],
  ["rdbu", scheme11(scheme$m, interpolateRdBu)],
  ["rdgy", scheme11(scheme$l, interpolateRdGy)],
  ["rdylbu", scheme11(scheme$k, interpolateRdYlBu)],
  ["rdylgn", scheme11(scheme$j, interpolateRdYlGn)],
  ["spectral", scheme11(scheme$i, interpolateSpectral)],
  // reversed diverging (for temperature data)
  ["burd", scheme11r(scheme$m, interpolateRdBu)],
  ["buylrd", scheme11r(scheme$k, interpolateRdYlBu)],
  // sequential (single-hue)
  ["blues", scheme9(scheme$5, interpolateBlues)],
  ["greens", scheme9(scheme$4, interpolateGreens)],
  ["greys", scheme9(scheme$3, interpolateGreys)],
  ["oranges", scheme9(scheme, interpolateOranges)],
  ["purples", scheme9(scheme$2, interpolatePurples)],
  ["reds", scheme9(scheme$1, interpolateReds)],
  // sequential (multi-hue)
  ["turbo", schemei(interpolateTurbo)],
  ["viridis", schemei(interpolateViridis)],
  ["magma", schemei(magma)],
  ["inferno", schemei(inferno)],
  ["plasma", schemei(plasma)],
  ["cividis", schemei(interpolateCividis)],
  ["cubehelix", schemei(interpolateCubehelixDefault)],
  ["warm", schemei(warm)],
  ["cool", schemei(cool)],
  ["bugn", scheme9(scheme$h, interpolateBuGn)],
  ["bupu", scheme9(scheme$g, interpolateBuPu)],
  ["gnbu", scheme9(scheme$f, interpolateGnBu)],
  ["orrd", scheme9(scheme$e, interpolateOrRd)],
  ["pubu", scheme9(scheme$c, interpolatePuBu)],
  ["pubugn", scheme9(scheme$d, interpolatePuBuGn)],
  ["purd", scheme9(scheme$b, interpolatePuRd)],
  ["rdpu", scheme9(scheme$a, interpolateRdPu)],
  ["ylgn", scheme9(scheme$8, interpolateYlGn)],
  ["ylgnbu", scheme9(scheme$9, interpolateYlGnBu)],
  ["ylorbr", scheme9(scheme$7, interpolateYlOrBr)],
  ["ylorrd", scheme9(scheme$6, interpolateYlOrRd)],
  // cyclical
  ["rainbow", schemeicyclical(interpolateRainbow)],
  ["sinebow", schemeicyclical(interpolateSinebow)]
]);
function scheme9(scheme2, interpolate2) {
  return ({ length: n }) => {
    if (n === 1)
      return [scheme2[3][1]];
    if (n === 2)
      return [scheme2[3][1], scheme2[3][2]];
    n = Math.max(3, Math.floor(n));
    return n > 9 ? quantize(interpolate2, n) : scheme2[n];
  };
}
function scheme11(scheme2, interpolate2) {
  return ({ length: n }) => {
    if (n === 2)
      return [scheme2[3][0], scheme2[3][2]];
    n = Math.max(3, Math.floor(n));
    return n > 11 ? quantize(interpolate2, n) : scheme2[n];
  };
}
function scheme11r(scheme2, interpolate2) {
  return ({ length: n }) => {
    if (n === 2)
      return [scheme2[3][2], scheme2[3][0]];
    n = Math.max(3, Math.floor(n));
    return n > 11 ? quantize((t) => interpolate2(1 - t), n) : scheme2[n].slice().reverse();
  };
}
function schemei(interpolate2) {
  return ({ length: n }) => quantize(interpolate2, Math.max(2, Math.floor(n)));
}
function schemeicyclical(interpolate2) {
  return ({ length: n }) => quantize(interpolate2, Math.floor(n) + 1).slice(0, -1);
}
function ordinalScheme(scheme2) {
  const s2 = `${scheme2}`.toLowerCase();
  if (!ordinalSchemes.has(s2))
    throw new Error(`unknown ordinal scheme: ${s2}`);
  return ordinalSchemes.get(s2);
}
function ordinalRange(scheme2, length2) {
  const s2 = ordinalScheme(scheme2);
  const r = typeof s2 === "function" ? s2({ length: length2 }) : s2;
  return r.length !== length2 ? r.slice(0, length2) : r;
}
function maybeBooleanRange(domain, scheme2 = "greys") {
  const range2 = /* @__PURE__ */ new Set();
  const [f, t] = ordinalRange(scheme2, 2);
  for (const value of domain) {
    if (value == null)
      continue;
    if (value === true)
      range2.add(t);
    else if (value === false)
      range2.add(f);
    else
      return;
  }
  return [...range2];
}
const quantitativeSchemes = /* @__PURE__ */ new Map([
  // diverging
  ["brbg", interpolateBrBG],
  ["prgn", interpolatePRGn],
  ["piyg", interpolatePiYG],
  ["puor", interpolatePuOr],
  ["rdbu", interpolateRdBu],
  ["rdgy", interpolateRdGy],
  ["rdylbu", interpolateRdYlBu],
  ["rdylgn", interpolateRdYlGn],
  ["spectral", interpolateSpectral],
  // reversed diverging (for temperature data)
  ["burd", (t) => interpolateRdBu(1 - t)],
  ["buylrd", (t) => interpolateRdYlBu(1 - t)],
  // sequential (single-hue)
  ["blues", interpolateBlues],
  ["greens", interpolateGreens],
  ["greys", interpolateGreys],
  ["purples", interpolatePurples],
  ["reds", interpolateReds],
  ["oranges", interpolateOranges],
  // sequential (multi-hue)
  ["turbo", interpolateTurbo],
  ["viridis", interpolateViridis],
  ["magma", magma],
  ["inferno", inferno],
  ["plasma", plasma],
  ["cividis", interpolateCividis],
  ["cubehelix", interpolateCubehelixDefault],
  ["warm", warm],
  ["cool", cool],
  ["bugn", interpolateBuGn],
  ["bupu", interpolateBuPu],
  ["gnbu", interpolateGnBu],
  ["orrd", interpolateOrRd],
  ["pubugn", interpolatePuBuGn],
  ["pubu", interpolatePuBu],
  ["purd", interpolatePuRd],
  ["rdpu", interpolateRdPu],
  ["ylgnbu", interpolateYlGnBu],
  ["ylgn", interpolateYlGn],
  ["ylorbr", interpolateYlOrBr],
  ["ylorrd", interpolateYlOrRd],
  // cyclical
  ["rainbow", interpolateRainbow],
  ["sinebow", interpolateSinebow]
]);
function quantitativeScheme(scheme2) {
  const s2 = `${scheme2}`.toLowerCase();
  if (!quantitativeSchemes.has(s2))
    throw new Error(`unknown quantitative scheme: ${s2}`);
  return quantitativeSchemes.get(s2);
}
const divergingSchemes = /* @__PURE__ */ new Set([
  "brbg",
  "prgn",
  "piyg",
  "puor",
  "rdbu",
  "rdgy",
  "rdylbu",
  "rdylgn",
  "spectral",
  "burd",
  "buylrd"
]);
function isDivergingScheme(scheme2) {
  return scheme2 != null && divergingSchemes.has(`${scheme2}`.toLowerCase());
}
const flip = (i) => (t) => i(1 - t);
const unit = [0, 1];
const interpolators = /* @__PURE__ */ new Map([
  // numbers
  ["number", interpolateNumber],
  // color spaces
  ["rgb", interpolateRgb],
  ["hsl", interpolateHsl],
  ["hcl", interpolateHcl],
  ["lab", lab]
]);
function Interpolator(interpolate2) {
  const i = `${interpolate2}`.toLowerCase();
  if (!interpolators.has(i))
    throw new Error(`unknown interpolator: ${i}`);
  return interpolators.get(i);
}
function ScaleQ(key, scale, channels, { type, nice: nice2, clamp, zero: zero2, domain = inferAutoDomain(key, channels), unknown, round, scheme: scheme2, interval: interval2, range: range2 = registry.get(key) === radius ? inferRadialRange(channels, domain) : registry.get(key) === length ? inferLengthRange(channels, domain) : registry.get(key) === opacity ? unit : void 0, interpolate: interpolate2 = registry.get(key) === color ? scheme2 == null && range2 !== void 0 ? interpolateRgb : quantitativeScheme(scheme2 !== void 0 ? scheme2 : type === "cyclical" ? "rainbow" : "turbo") : round ? interpolateRound : interpolateNumber, reverse: reverse$1 }) {
  interval2 = maybeInterval(interval2, type);
  if (type === "cyclical" || type === "sequential")
    type = "linear";
  reverse$1 = !!reverse$1;
  if (typeof interpolate2 !== "function") {
    interpolate2 = Interpolator(interpolate2);
  }
  if (interpolate2.length === 1) {
    if (reverse$1) {
      interpolate2 = flip(interpolate2);
      reverse$1 = false;
    }
    if (range2 === void 0) {
      range2 = Float64Array.from(domain, (_, i) => i / (domain.length - 1));
      if (range2.length === 2)
        range2 = unit;
    }
    scale.interpolate((range2 === unit ? constant : interpolatePiecewise)(interpolate2));
  } else {
    scale.interpolate(interpolate2);
  }
  if (zero2) {
    const [min2, max2] = extent$1(domain);
    if (min2 > 0 || max2 < 0) {
      domain = slice(domain);
      if (orderof(domain) !== Math.sign(min2))
        domain[domain.length - 1] = 0;
      else
        domain[0] = 0;
    }
  }
  if (reverse$1)
    domain = reverse(domain);
  scale.domain(domain).unknown(unknown);
  if (nice2)
    scale.nice(nice2 === true ? void 0 : nice2), domain = scale.domain();
  if (range2 !== void 0)
    scale.range(range2);
  if (clamp)
    scale.clamp(clamp);
  return { type, domain, range: range2, scale, interpolate: interpolate2, interval: interval2 };
}
function ScaleLinear(key, channels, options) {
  return ScaleQ(key, linear(), channels, options);
}
function ScaleSqrt(key, channels, options) {
  return ScalePow(key, channels, { ...options, exponent: 0.5 });
}
function ScalePow(key, channels, { exponent: exponent2 = 1, ...options }) {
  return ScaleQ(key, pow().exponent(exponent2), channels, { ...options, type: "pow" });
}
function ScaleLog(key, channels, { base = 10, domain = inferLogDomain(channels), ...options }) {
  return ScaleQ(key, log().base(base), channels, { ...options, domain });
}
function ScaleSymlog(key, channels, { constant: constant2 = 1, ...options }) {
  return ScaleQ(key, symlog().constant(constant2), channels, options);
}
function ScaleQuantile(key, channels, {
  range: range2,
  quantiles = range2 === void 0 ? 5 : (range2 = [...range2]).length,
  // deprecated; use n instead
  n = quantiles,
  scheme: scheme2 = "rdylbu",
  domain = inferQuantileDomain(channels),
  interpolate: interpolate2,
  reverse: reverse2
}) {
  if (range2 === void 0) {
    range2 = interpolate2 !== void 0 ? quantize(interpolate2, n) : registry.get(key) === color ? ordinalRange(scheme2, n) : void 0;
  }
  if (domain.length > 0) {
    domain = quantile(domain, range2 === void 0 ? { length: n } : range2).quantiles();
  }
  return ScaleThreshold(key, channels, { domain, range: range2, reverse: reverse2 });
}
function ScaleQuantize(key, channels, { range: range2, n = range2 === void 0 ? 5 : (range2 = [...range2]).length, scheme: scheme2 = "rdylbu", domain = inferAutoDomain(key, channels), unknown, interpolate: interpolate2, reverse: reverse2 }) {
  const [min2, max2] = extent$1(domain);
  let thresholds;
  if (range2 === void 0) {
    thresholds = ticks(min2, max2, n);
    if (thresholds[0] <= min2)
      thresholds.splice(0, 1);
    if (thresholds[thresholds.length - 1] >= max2)
      thresholds.pop();
    n = thresholds.length + 1;
    range2 = interpolate2 !== void 0 ? quantize(interpolate2, n) : registry.get(key) === color ? ordinalRange(scheme2, n) : void 0;
  } else {
    thresholds = quantize(interpolateNumber(min2, max2), n + 1).slice(1, -1);
    if (min2 instanceof Date)
      thresholds = thresholds.map((x) => new Date(x));
  }
  if (orderof(arrayify(domain)) < 0)
    thresholds.reverse();
  return ScaleThreshold(key, channels, { domain: thresholds, range: range2, reverse: reverse2, unknown });
}
function ScaleThreshold(key, channels, {
  domain = [0],
  // explicit thresholds in ascending order
  unknown,
  scheme: scheme2 = "rdylbu",
  interpolate: interpolate2,
  range: range2 = interpolate2 !== void 0 ? quantize(interpolate2, domain.length + 1) : registry.get(key) === color ? ordinalRange(scheme2, domain.length + 1) : void 0,
  reverse: reverse$1
}) {
  domain = arrayify(domain);
  const sign2 = orderof(domain);
  if (!isOrdered(domain, sign2))
    throw new Error(`the ${key} scale has a non-monotonic domain`);
  if (reverse$1)
    range2 = reverse(range2);
  return {
    type: "threshold",
    scale: threshold(sign2 < 0 ? reverse(domain) : domain, range2 === void 0 ? [] : range2).unknown(unknown),
    domain,
    range: range2
  };
}
function isOrdered(domain, sign2) {
  for (let i = 1, n = domain.length, d = domain[0]; i < n; ++i) {
    const s2 = descending(d, d = domain[i]);
    if (s2 !== 0 && s2 !== sign2)
      return false;
  }
  return true;
}
function ScaleIdentity() {
  return { type: "identity", scale: identity$2() };
}
function inferDomain$1(channels, f = finite) {
  return channels.length ? [
    min$1(channels, ({ value }) => value === void 0 ? value : min$1(value, f)),
    max(channels, ({ value }) => value === void 0 ? value : max(value, f))
  ] : [0, 1];
}
function inferAutoDomain(key, channels) {
  const type = registry.get(key);
  return (type === radius || type === opacity || type === length ? inferZeroDomain : inferDomain$1)(channels);
}
function inferZeroDomain(channels) {
  return [0, channels.length ? max(channels, ({ value }) => value === void 0 ? value : max(value, finite)) : 1];
}
function inferRadialRange(channels, domain) {
  const hint = channels.find(({ radius: radius2 }) => radius2 !== void 0);
  if (hint !== void 0)
    return [0, hint.radius];
  const h25 = quantile$1(channels, 0.5, ({ value }) => value === void 0 ? NaN : quantile$1(value, 0.25, positive));
  const range2 = domain.map((d) => 3 * Math.sqrt(d / h25));
  const k2 = 30 / max(range2);
  return k2 < 1 ? range2.map((r) => r * k2) : range2;
}
function inferLengthRange(channels, domain) {
  const h50 = median(channels, ({ value }) => value === void 0 ? NaN : median(value, Math.abs));
  const range2 = domain.map((d) => 12 * d / h50);
  const k2 = 60 / max(range2);
  return k2 < 1 ? range2.map((r) => r * k2) : range2;
}
function inferLogDomain(channels) {
  for (const { value } of channels) {
    if (value !== void 0) {
      for (let v of value) {
        if (v > 0)
          return inferDomain$1(channels, positive);
        if (v < 0)
          return inferDomain$1(channels, negative);
      }
    }
  }
  return [1, 10];
}
function inferQuantileDomain(channels) {
  const domain = [];
  for (const { value } of channels) {
    if (value === void 0)
      continue;
    for (const v of value)
      domain.push(v);
  }
  return domain;
}
function interpolatePiecewise(interpolate2) {
  return (i, j) => (t) => interpolate2(i + t * (j - i));
}
function ScaleD(key, scale, transform, channels, { type, nice: nice2, clamp, domain = inferDomain$1(channels), unknown, pivot = 0, scheme: scheme2, range: range2, symmetric = true, interpolate: interpolate2 = registry.get(key) === color ? scheme2 == null && range2 !== void 0 ? interpolateRgb : quantitativeScheme(scheme2 !== void 0 ? scheme2 : "rdbu") : interpolateNumber, reverse: reverse2 }) {
  pivot = +pivot;
  let [min2, max2] = domain;
  if (descending(min2, max2) < 0)
    [min2, max2] = [max2, min2], reverse2 = !reverse2;
  min2 = Math.min(min2, pivot);
  max2 = Math.max(max2, pivot);
  if (typeof interpolate2 !== "function") {
    interpolate2 = Interpolator(interpolate2);
  }
  if (range2 !== void 0) {
    interpolate2 = interpolate2.length === 1 ? interpolatePiecewise(interpolate2)(...range2) : piecewise(interpolate2, range2);
  }
  if (reverse2)
    interpolate2 = flip(interpolate2);
  if (symmetric) {
    const mid2 = transform.apply(pivot);
    const mindelta = mid2 - transform.apply(min2);
    const maxdelta = transform.apply(max2) - mid2;
    if (mindelta < maxdelta)
      min2 = transform.invert(mid2 - maxdelta);
    else if (mindelta > maxdelta)
      max2 = transform.invert(mid2 + mindelta);
  }
  scale.domain([min2, pivot, max2]).unknown(unknown).interpolator(interpolate2);
  if (clamp)
    scale.clamp(clamp);
  if (nice2)
    scale.nice(nice2);
  return { type, domain: [min2, max2], pivot, interpolate: interpolate2, scale };
}
function ScaleDiverging(key, channels, options) {
  return ScaleD(key, diverging(), transformIdentity, channels, options);
}
function ScaleDivergingSqrt(key, channels, options) {
  return ScaleDivergingPow(key, channels, { ...options, exponent: 0.5 });
}
function ScaleDivergingPow(key, channels, { exponent: exponent2 = 1, ...options }) {
  return ScaleD(key, divergingPow().exponent(exponent2 = +exponent2), transformPow(exponent2), channels, {
    ...options,
    type: "diverging-pow"
  });
}
function ScaleDivergingLog(key, channels, { base = 10, pivot = 1, domain = inferDomain$1(channels, pivot < 0 ? negative : positive), ...options }) {
  return ScaleD(key, divergingLog().base(base = +base), transformLog, channels, { domain, pivot, ...options });
}
function ScaleDivergingSymlog(key, channels, { constant: constant2 = 1, ...options }) {
  return ScaleD(key, divergingSymlog().constant(constant2 = +constant2), transformSymlog(constant2), channels, options);
}
const transformIdentity = {
  apply(x) {
    return x;
  },
  invert(x) {
    return x;
  }
};
const transformLog = {
  apply: Math.log,
  invert: Math.exp
};
const transformSqrt = {
  apply(x) {
    return Math.sign(x) * Math.sqrt(Math.abs(x));
  },
  invert(x) {
    return Math.sign(x) * (x * x);
  }
};
function transformPow(exponent2) {
  return exponent2 === 0.5 ? transformSqrt : {
    apply(x) {
      return Math.sign(x) * Math.pow(Math.abs(x), exponent2);
    },
    invert(x) {
      return Math.sign(x) * Math.pow(Math.abs(x), 1 / exponent2);
    }
  };
}
function transformSymlog(constant2) {
  return {
    apply(x) {
      return Math.sign(x) * Math.log1p(Math.abs(x / constant2));
    },
    invert(x) {
      return Math.sign(x) * Math.expm1(Math.abs(x)) * constant2;
    }
  };
}
function ScaleT(key, scale, channels, options) {
  return ScaleQ(key, scale, channels, options);
}
function ScaleTime(key, channels, options) {
  return ScaleT(key, time(), channels, options);
}
function ScaleUtc(key, channels, options) {
  return ScaleT(key, utcTime(), channels, options);
}
const ordinalImplicit = Symbol("ordinal");
function ScaleO(key, scale, channels, { type, interval: interval2, domain, range: range2, reverse: reverse$1, hint }) {
  interval2 = maybeInterval(interval2, type);
  if (domain === void 0)
    domain = inferDomain(channels, interval2, key);
  if (type === "categorical" || type === ordinalImplicit)
    type = "ordinal";
  if (reverse$1)
    domain = reverse(domain);
  scale.domain(domain);
  if (range2 !== void 0) {
    if (typeof range2 === "function")
      range2 = range2(domain);
    scale.range(range2);
  }
  return { type, domain, range: range2, scale, hint, interval: interval2 };
}
function ScaleOrdinal(key, channels, { type, interval: interval2, domain, range: range2, scheme: scheme2, unknown, ...options }) {
  interval2 = maybeInterval(interval2, type);
  if (domain === void 0)
    domain = inferDomain(channels, interval2, key);
  let hint;
  if (registry.get(key) === symbol) {
    hint = inferSymbolHint(channels);
    range2 = range2 === void 0 ? inferSymbolRange(hint) : map(range2, maybeSymbol);
  } else if (registry.get(key) === color) {
    if (range2 === void 0 && (type === "ordinal" || type === ordinalImplicit)) {
      range2 = maybeBooleanRange(domain, scheme2);
      if (range2 !== void 0)
        scheme2 = void 0;
    }
    if (scheme2 === void 0 && range2 === void 0) {
      scheme2 = type === "ordinal" ? "turbo" : "tableau10";
    }
    if (scheme2 !== void 0) {
      if (range2 !== void 0) {
        const interpolate2 = quantitativeScheme(scheme2);
        const t02 = range2[0], d = range2[1] - range2[0];
        range2 = ({ length: n }) => quantize((t) => interpolate2(t02 + d * t), n);
      } else {
        range2 = ordinalScheme(scheme2);
      }
    }
  }
  if (unknown === implicit) {
    throw new Error(`implicit unknown on ${key} scale is not supported`);
  }
  return ScaleO(key, ordinal().unknown(unknown), channels, { ...options, type, domain, range: range2, hint });
}
function ScalePoint(key, channels, { align = 0.5, padding = 0.5, ...options }) {
  return maybeRound(point().align(align).padding(padding), channels, options, key);
}
function ScaleBand(key, channels, { align = 0.5, padding = 0.1, paddingInner = padding, paddingOuter = key === "fx" || key === "fy" ? 0 : padding, ...options }) {
  return maybeRound(band().align(align).paddingInner(paddingInner).paddingOuter(paddingOuter), channels, options, key);
}
function maybeRound(scale, channels, options, key) {
  let { round } = options;
  if (round !== void 0)
    scale.round(round = !!round);
  scale = ScaleO(key, scale, channels, options);
  scale.round = round;
  return scale;
}
function inferDomain(channels, interval2, key) {
  const values2 = new InternSet();
  for (const { value, domain } of channels) {
    if (domain !== void 0)
      return domain();
    if (value === void 0)
      continue;
    for (const v of value)
      values2.add(v);
  }
  if (interval2 !== void 0) {
    const [min2, max2] = extent$1(values2).map(interval2.floor, interval2);
    return interval2.range(min2, interval2.offset(max2));
  }
  if (values2.size > 1e4 && registry.get(key) === position) {
    throw new Error(`implicit ordinal domain of ${key} scale has more than 10,000 values`);
  }
  return sort$1(values2, ascendingDefined);
}
function inferHint(channels, key) {
  let value;
  for (const { hint } of channels) {
    const candidate = hint == null ? void 0 : hint[key];
    if (candidate === void 0)
      continue;
    if (value === void 0)
      value = candidate;
    else if (value !== candidate)
      return;
  }
  return value;
}
function inferSymbolHint(channels) {
  return {
    fill: inferHint(channels, "fill"),
    stroke: inferHint(channels, "stroke")
  };
}
function inferSymbolRange(hint) {
  return isNoneish(hint.fill) ? symbolsStroke : symbolsFill;
}
let warnings = 0;
function consumeWarnings() {
  const w = warnings;
  warnings = 0;
  return w;
}
function warn(message) {
  console.warn(message);
  ++warnings;
}
function Scales(channelsByScale, { label: globalLabel, inset: globalInset = 0, insetTop: globalInsetTop = globalInset, insetRight: globalInsetRight = globalInset, insetBottom: globalInsetBottom = globalInset, insetLeft: globalInsetLeft = globalInset, round, nice: nice2, clamp, zero: zero2, align, padding, projection: projection2, facet: { label: facetLabel = globalLabel } = {}, ...options } = {}) {
  const scales = {};
  for (const [key, channels] of channelsByScale) {
    const scaleOptions = options[key];
    const scale = Scale(key, channels, {
      round: registry.get(key) === position ? round : void 0,
      nice: nice2,
      clamp,
      zero: zero2,
      align,
      padding,
      projection: projection2,
      ...scaleOptions
    });
    if (scale) {
      let {
        label = key === "fx" || key === "fy" ? facetLabel : globalLabel,
        percent,
        transform,
        inset,
        insetTop = inset !== void 0 ? inset : key === "y" ? globalInsetTop : 0,
        // not fy
        insetRight = inset !== void 0 ? inset : key === "x" ? globalInsetRight : 0,
        // not fx
        insetBottom = inset !== void 0 ? inset : key === "y" ? globalInsetBottom : 0,
        // not fy
        insetLeft = inset !== void 0 ? inset : key === "x" ? globalInsetLeft : 0
        // not fx
      } = scaleOptions || {};
      if (transform == null)
        transform = void 0;
      else if (typeof transform !== "function")
        throw new Error("invalid scale transform; not a function");
      scale.percent = !!percent;
      scale.label = label === void 0 ? inferScaleLabel(channels, scale) : label;
      scale.transform = transform;
      if (key === "x" || key === "fx") {
        scale.insetLeft = +insetLeft;
        scale.insetRight = +insetRight;
      } else if (key === "y" || key === "fy") {
        scale.insetTop = +insetTop;
        scale.insetBottom = +insetBottom;
      }
      scales[key] = scale;
    }
  }
  return scales;
}
function ScaleFunctions(scales) {
  return Object.fromEntries(Object.entries(scales).filter(([, { scale }]) => scale).map(([name, { scale, type, interval: interval2, label }]) => {
    scale.type = type;
    if (interval2 != null)
      scale.interval = interval2;
    if (label != null)
      scale.label = label;
    return [name, scale];
  }));
}
function autoScaleRange(scales, dimensions) {
  const { x, y, fx, fy } = scales;
  const superdimensions = fx || fy ? outerDimensions(dimensions) : dimensions;
  if (fx)
    autoScaleRangeX(fx, superdimensions);
  if (fy)
    autoScaleRangeY(fy, superdimensions);
  const subdimensions = fx || fy ? innerDimensions(scales, dimensions) : dimensions;
  if (x)
    autoScaleRangeX(x, subdimensions);
  if (y)
    autoScaleRangeY(y, subdimensions);
}
function inferScaleLabel(channels = [], scale) {
  let label;
  for (const { label: l } of channels) {
    if (l === void 0)
      continue;
    if (label === void 0)
      label = l;
    else if (label !== l)
      return;
  }
  if (label === void 0)
    return;
  if (isTemporalScale(scale) && /^(date|time|year)$/i.test(label))
    return;
  if (!isOrdinalScale(scale) && scale.percent)
    label = `${label} (%)`;
  return { inferred: true, toString: () => label };
}
function outerDimensions(dimensions) {
  const { marginTop, marginRight, marginBottom, marginLeft, width, height, facet: { marginTop: facetMarginTop, marginRight: facetMarginRight, marginBottom: facetMarginBottom, marginLeft: facetMarginLeft } } = dimensions;
  return {
    marginTop: Math.max(marginTop, facetMarginTop),
    marginRight: Math.max(marginRight, facetMarginRight),
    marginBottom: Math.max(marginBottom, facetMarginBottom),
    marginLeft: Math.max(marginLeft, facetMarginLeft),
    width,
    height
  };
}
function innerDimensions({ fx, fy }, dimensions) {
  const { marginTop, marginRight, marginBottom, marginLeft, width, height } = outerDimensions(dimensions);
  return {
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    width: fx ? fx.scale.bandwidth() + marginLeft + marginRight : width,
    height: fy ? fy.scale.bandwidth() + marginTop + marginBottom : height
  };
}
function autoScaleRangeX(scale, dimensions) {
  if (scale.range === void 0) {
    const { insetLeft, insetRight } = scale;
    const { width, marginLeft = 0, marginRight = 0 } = dimensions;
    const left2 = marginLeft + insetLeft;
    const right2 = width - marginRight - insetRight;
    scale.range = [left2, Math.max(left2, right2)];
    if (!isOrdinalScale(scale))
      scale.range = piecewiseRange(scale);
    scale.scale.range(scale.range);
  }
  autoScaleRound(scale);
}
function autoScaleRangeY(scale, dimensions) {
  if (scale.range === void 0) {
    const { insetTop, insetBottom } = scale;
    const { height, marginTop = 0, marginBottom = 0 } = dimensions;
    const top2 = marginTop + insetTop;
    const bottom2 = height - marginBottom - insetBottom;
    scale.range = [Math.max(top2, bottom2), top2];
    if (!isOrdinalScale(scale))
      scale.range = piecewiseRange(scale);
    else
      scale.range.reverse();
    scale.scale.range(scale.range);
  }
  autoScaleRound(scale);
}
function autoScaleRound(scale) {
  if (scale.round === void 0 && isBandScale(scale) && roundError(scale) <= 30) {
    scale.scale.round(true);
  }
}
function roundError({ scale }) {
  const n = scale.domain().length;
  const [start2, stop] = scale.range();
  const paddingInner = scale.paddingInner ? scale.paddingInner() : 1;
  const paddingOuter = scale.paddingOuter ? scale.paddingOuter() : scale.padding();
  const m = n - paddingInner;
  const step = Math.abs(stop - start2) / Math.max(1, m + paddingOuter * 2);
  return (step - Math.floor(step)) * m;
}
function piecewiseRange(scale) {
  const length2 = scale.scale.domain().length + isThresholdScale(scale);
  if (!(length2 > 2))
    return scale.range;
  const [start2, end] = scale.range;
  return Array.from({ length: length2 }, (_, i) => start2 + i / (length2 - 1) * (end - start2));
}
function Scale(key, channels = [], options = {}) {
  const type = inferScaleType(key, channels, options);
  if (options.type === void 0 && options.domain === void 0 && options.range === void 0 && options.interval == null && key !== "fx" && key !== "fy" && isOrdinalScale({ type })) {
    const values2 = channels.map(({ value }) => value).filter((value) => value !== void 0);
    if (values2.some(isTemporal))
      warn(`Warning: some data associated with the ${key} scale are dates. Dates are typically associated with a "utc" or "time" scale rather than a "${formatScaleType(type)}" scale. If you are using a bar mark, you probably want a rect mark with the interval option instead; if you are using a group transform, you probably want a bin transform instead. If you want to treat this data as ordinal, you can specify the interval of the ${key} scale (e.g., d3.utcDay), or you can suppress this warning by setting the type of the ${key} scale to "${formatScaleType(type)}".`);
    else if (values2.some(isTemporalString))
      warn(`Warning: some data associated with the ${key} scale are strings that appear to be dates (e.g., YYYY-MM-DD). If these strings represent dates, you should parse them to Date objects. Dates are typically associated with a "utc" or "time" scale rather than a "${formatScaleType(type)}" scale. If you are using a bar mark, you probably want a rect mark with the interval option instead; if you are using a group transform, you probably want a bin transform instead. If you want to treat this data as ordinal, you can suppress this warning by setting the type of the ${key} scale to "${formatScaleType(type)}".`);
    else if (values2.some(isNumericString))
      warn(`Warning: some data associated with the ${key} scale are strings that appear to be numbers. If these strings represent numbers, you should parse or coerce them to numbers. Numbers are typically associated with a "linear" scale rather than a "${formatScaleType(type)}" scale. If you want to treat this data as ordinal, you can specify the interval of the ${key} scale (e.g., 1 for integers), or you can suppress this warning by setting the type of the ${key} scale to "${formatScaleType(type)}".`);
  }
  options.type = type;
  switch (type) {
    case "diverging":
    case "diverging-sqrt":
    case "diverging-pow":
    case "diverging-log":
    case "diverging-symlog":
    case "cyclical":
    case "sequential":
    case "linear":
    case "sqrt":
    case "threshold":
    case "quantile":
    case "pow":
    case "log":
    case "symlog":
      options = coerceType(channels, options, coerceNumbers);
      break;
    case "identity":
      switch (registry.get(key)) {
        case position:
          options = coerceType(channels, options, coerceNumbers);
          break;
        case symbol:
          options = coerceType(channels, options, coerceSymbols);
          break;
      }
      break;
    case "utc":
    case "time":
      options = coerceType(channels, options, coerceDates);
      break;
  }
  switch (type) {
    case "diverging":
      return ScaleDiverging(key, channels, options);
    case "diverging-sqrt":
      return ScaleDivergingSqrt(key, channels, options);
    case "diverging-pow":
      return ScaleDivergingPow(key, channels, options);
    case "diverging-log":
      return ScaleDivergingLog(key, channels, options);
    case "diverging-symlog":
      return ScaleDivergingSymlog(key, channels, options);
    case "categorical":
    case "ordinal":
    case ordinalImplicit:
      return ScaleOrdinal(key, channels, options);
    case "cyclical":
    case "sequential":
    case "linear":
      return ScaleLinear(key, channels, options);
    case "sqrt":
      return ScaleSqrt(key, channels, options);
    case "threshold":
      return ScaleThreshold(key, channels, options);
    case "quantile":
      return ScaleQuantile(key, channels, options);
    case "quantize":
      return ScaleQuantize(key, channels, options);
    case "pow":
      return ScalePow(key, channels, options);
    case "log":
      return ScaleLog(key, channels, options);
    case "symlog":
      return ScaleSymlog(key, channels, options);
    case "utc":
      return ScaleUtc(key, channels, options);
    case "time":
      return ScaleTime(key, channels, options);
    case "point":
      return ScalePoint(key, channels, options);
    case "band":
      return ScaleBand(key, channels, options);
    case "identity":
      return registry.get(key) === position ? ScaleIdentity() : { type: "identity" };
    case void 0:
      return;
    default:
      throw new Error(`unknown scale type: ${type}`);
  }
}
function formatScaleType(type) {
  return typeof type === "symbol" ? type.description : type;
}
const typeProjection = { toString: () => "projection" };
function inferScaleType(key, channels, { type, domain, range: range2, scheme: scheme2, pivot, projection: projection2 }) {
  if (key === "fx" || key === "fy")
    return "band";
  if ((key === "x" || key === "y") && projection2 != null)
    type = typeProjection;
  for (const { type: t } of channels) {
    if (t === void 0)
      continue;
    else if (type === void 0)
      type = t;
    else if (type !== t)
      throw new Error(`scale incompatible with channel: ${type} !== ${t}`);
  }
  if (type === typeProjection)
    return;
  if (type !== void 0)
    return type;
  if (domain === void 0 && !channels.some(({ value }) => value !== void 0))
    return;
  const kind = registry.get(key);
  if (kind === radius)
    return "sqrt";
  if (kind === opacity || kind === length)
    return "linear";
  if (kind === symbol)
    return "ordinal";
  if ((domain || range2 || []).length > 2)
    return asOrdinalType(kind);
  if (domain !== void 0) {
    if (isOrdinal(domain))
      return asOrdinalType(kind);
    if (isTemporal(domain))
      return "utc";
    if (kind === color && (pivot != null || isDivergingScheme(scheme2)))
      return "diverging";
    return "linear";
  }
  const values2 = channels.map(({ value }) => value).filter((value) => value !== void 0);
  if (values2.some(isOrdinal))
    return asOrdinalType(kind);
  if (values2.some(isTemporal))
    return "utc";
  if (kind === color && (pivot != null || isDivergingScheme(scheme2)))
    return "diverging";
  return "linear";
}
function asOrdinalType(kind) {
  switch (kind) {
    case position:
      return "point";
    case color:
      return ordinalImplicit;
    default:
      return "ordinal";
  }
}
function isTemporalScale({ type }) {
  return type === "time" || type === "utc";
}
function isOrdinalScale({ type }) {
  return type === "ordinal" || type === "point" || type === "band" || type === ordinalImplicit;
}
function isThresholdScale({ type }) {
  return type === "threshold";
}
function isBandScale({ type }) {
  return type === "point" || type === "band";
}
function isCollapsed(scale) {
  if (scale === void 0)
    return true;
  const domain = scale.domain();
  const value = scale(domain[0]);
  for (let i = 1, n = domain.length; i < n; ++i) {
    if (scale(domain[i]) - value) {
      return false;
    }
  }
  return true;
}
function coerceType(channels, { domain, ...options }, coerceValues) {
  for (const c2 of channels) {
    if (c2.value !== void 0) {
      c2.value = coerceValues(c2.value);
    }
  }
  return {
    domain: domain === void 0 ? domain : coerceValues(domain),
    ...options
  };
}
function coerceSymbols(values2) {
  return map(values2, maybeSymbol);
}
function coerceDates(values2) {
  return map(values2, coerceDate);
}
function coerceNumbers(values2) {
  return isTypedArray(values2) ? values2 : map(values2, coerceNumber, Float64Array);
}
function coerceNumber(x) {
  return x == null ? NaN : Number(x);
}
function coerceDate(x) {
  return x instanceof Date && !isNaN(x) ? x : typeof x === "string" ? parse(x) : x == null || isNaN(x = +x) ? void 0 : new Date(x);
}
function exposeScales(scaleDescriptors) {
  return (key) => {
    if (!registry.has(key = `${key}`))
      throw new Error(`unknown scale: ${key}`);
    return key in scaleDescriptors ? exposeScale(scaleDescriptors[key]) : void 0;
  };
}
function exposeScale({ scale, type, domain, range: range2, interpolate: interpolate2, interval: interval2, transform, percent, pivot }) {
  if (type === "identity")
    return { type: "identity", apply: (d) => d, invert: (d) => d };
  const unknown = scale.unknown ? scale.unknown() : void 0;
  return {
    type,
    domain: slice(domain),
    ...range2 !== void 0 && { range: slice(range2) },
    ...transform !== void 0 && { transform },
    ...percent && { percent },
    ...unknown !== void 0 && { unknown },
    ...interval2 !== void 0 && { interval: interval2 },
    // quantitative
    ...interpolate2 !== void 0 && { interpolate: interpolate2 },
    ...scale.clamp && { clamp: scale.clamp() },
    // diverging (always asymmetric; we never want to apply the symmetric transform twice)
    ...pivot !== void 0 && { pivot, symmetric: false },
    // log, diverging-log
    ...scale.base && { base: scale.base() },
    // pow, diverging-pow
    ...scale.exponent && { exponent: scale.exponent() },
    // symlog, diverging-symlog
    ...scale.constant && { constant: scale.constant() },
    // band, point
    ...scale.align && { align: scale.align(), round: scale.round() },
    ...scale.padding && (scale.paddingInner ? { paddingInner: scale.paddingInner(), paddingOuter: scale.paddingOuter() } : { padding: scale.padding() }),
    ...scale.bandwidth && { bandwidth: scale.bandwidth(), step: scale.step() },
    // utilities
    apply: (t) => scale(t),
    ...scale.invert && { invert: (t) => scale.invert(t) }
  };
}
const pi = Math.PI;
const tau = 2 * pi;
const defaultAspectRatio = 0.618;
function Projection({ projection: projection2, inset: globalInset = 0, insetTop = globalInset, insetRight = globalInset, insetBottom = globalInset, insetLeft = globalInset } = {}, dimensions) {
  if (projection2 == null)
    return;
  if (typeof projection2.stream === "function")
    return projection2;
  let options;
  let domain;
  let clip2 = "frame";
  if (isObject(projection2)) {
    let inset;
    ({
      type: projection2,
      domain,
      inset,
      insetTop = inset !== void 0 ? inset : insetTop,
      insetRight = inset !== void 0 ? inset : insetRight,
      insetBottom = inset !== void 0 ? inset : insetBottom,
      insetLeft = inset !== void 0 ? inset : insetLeft,
      clip: clip2 = clip2,
      ...options
    } = projection2);
    if (projection2 == null)
      return;
  }
  if (typeof projection2 !== "function")
    ({ type: projection2 } = namedProjection(projection2));
  const { width, height, marginLeft, marginRight, marginTop, marginBottom } = dimensions;
  const dx = width - marginLeft - marginRight - insetLeft - insetRight;
  const dy = height - marginTop - marginBottom - insetTop - insetBottom;
  projection2 = projection2 == null ? void 0 : projection2({ width: dx, height: dy, clip: clip2, ...options });
  if (projection2 == null)
    return;
  clip2 = maybePostClip(clip2, marginLeft, marginTop, width - marginRight, height - marginBottom);
  let tx = marginLeft + insetLeft;
  let ty = marginTop + insetTop;
  let transform;
  if (domain != null) {
    const [[x02, y02], [x12, y12]] = geoPath(projection2).bounds(domain);
    const k2 = Math.min(dx / (x12 - x02), dy / (y12 - y02));
    if (k2 > 0) {
      tx -= (k2 * (x02 + x12) - dx) / 2;
      ty -= (k2 * (y02 + y12) - dy) / 2;
      transform = geoTransform({
        point(x, y) {
          this.stream.point(x * k2 + tx, y * k2 + ty);
        }
      });
    } else {
      warn(`Warning: the projection could not be fit to the specified domain; using the default scale.`);
    }
  }
  transform ?? (transform = tx === 0 && ty === 0 ? identity() : geoTransform({
    point(x, y) {
      this.stream.point(x + tx, y + ty);
    }
  }));
  return { stream: (s2) => projection2.stream(transform.stream(clip2(s2))) };
}
function namedProjection(projection2) {
  switch (`${projection2}`.toLowerCase()) {
    case "albers-usa":
      return scaleProjection(geoAlbersUsa, 0.7463, 0.4673);
    case "albers":
      return conicProjection(geoAlbers, 0.7463, 0.4673);
    case "azimuthal-equal-area":
      return scaleProjection(geoAzimuthalEqualArea, 4, 4);
    case "azimuthal-equidistant":
      return scaleProjection(geoAzimuthalEquidistant, tau, tau);
    case "conic-conformal":
      return conicProjection(geoConicConformal, tau, tau);
    case "conic-equal-area":
      return conicProjection(geoConicEqualArea, 6.1702, 2.9781);
    case "conic-equidistant":
      return conicProjection(geoConicEquidistant, 7.312, 3.6282);
    case "equal-earth":
      return scaleProjection(geoEqualEarth, 5.4133, 2.6347);
    case "equirectangular":
      return scaleProjection(geoEquirectangular, tau, pi);
    case "gnomonic":
      return scaleProjection(geoGnomonic, 3.4641, 3.4641);
    case "identity":
      return { type: identity };
    case "reflect-y":
      return { type: reflectY };
    case "mercator":
      return scaleProjection(geoMercator, tau, tau);
    case "orthographic":
      return scaleProjection(geoOrthographic, 2, 2);
    case "stereographic":
      return scaleProjection(geoStereographic, 2, 2);
    case "transverse-mercator":
      return scaleProjection(geoTransverseMercator, tau, tau);
    default:
      throw new Error(`unknown projection type: ${projection2}`);
  }
}
function maybePostClip(clip2, x12, y12, x2, y2) {
  if (clip2 === false || clip2 == null || typeof clip2 === "number")
    return (s2) => s2;
  if (clip2 === true)
    clip2 = "frame";
  switch (`${clip2}`.toLowerCase()) {
    case "frame":
      return clipRectangle(x12, y12, x2, y2);
    default:
      throw new Error(`unknown projection clip type: ${clip2}`);
  }
}
function scaleProjection(createProjection, kx2, ky2) {
  return {
    type: ({ width, height, rotate, precision = 0.15, clip: clip2 }) => {
      var _a, _b, _c;
      const projection2 = createProjection();
      if (precision != null)
        (_a = projection2.precision) == null ? void 0 : _a.call(projection2, precision);
      if (rotate != null)
        (_b = projection2.rotate) == null ? void 0 : _b.call(projection2, rotate);
      if (typeof clip2 === "number")
        (_c = projection2.clipAngle) == null ? void 0 : _c.call(projection2, clip2);
      projection2.scale(Math.min(width / kx2, height / ky2));
      projection2.translate([width / 2, height / 2]);
      return projection2;
    },
    aspectRatio: ky2 / kx2
  };
}
function conicProjection(createProjection, kx2, ky2) {
  const { type, aspectRatio } = scaleProjection(createProjection, kx2, ky2);
  return {
    type: (options) => {
      const { parallels, domain, width, height } = options;
      const projection2 = type(options);
      if (parallels != null) {
        projection2.parallels(parallels);
        if (domain === void 0) {
          projection2.fitSize([width, height], { type: "Sphere" });
        }
      }
      return projection2;
    },
    aspectRatio
  };
}
const identity = constant({ stream: (stream) => stream });
const reflectY = constant(geoTransform({
  point(x, y) {
    this.stream.point(x, -y);
  }
}));
function maybeProject(cx, cy, channels, values2, context) {
  const x = channels[cx] && channels[cx].scale === "x";
  const y = channels[cy] && channels[cy].scale === "y";
  if (x && y) {
    project(cx, cy, values2, context.projection);
  } else if (x) {
    throw new Error(`projection requires paired x and y channels; ${cx} is missing ${cy}`);
  } else if (y) {
    throw new Error(`projection requires paired x and y channels; ${cy} is missing ${cx}`);
  }
}
function project(cx, cy, values2, projection2) {
  const x = values2[cx];
  const y = values2[cy];
  const n = x.length;
  const X = values2[cx] = new Float64Array(n).fill(NaN);
  const Y = values2[cy] = new Float64Array(n).fill(NaN);
  let i;
  const stream = projection2.stream({
    point(x2, y2) {
      X[i] = x2;
      Y[i] = y2;
    }
  });
  for (i = 0; i < n; ++i) {
    stream.point(x[i], y[i]);
  }
}
function projectionAspectRatio(projection2, marks2) {
  if (typeof (projection2 == null ? void 0 : projection2.stream) === "function")
    return defaultAspectRatio;
  if (isObject(projection2))
    projection2 = projection2.type;
  if (projection2 == null)
    return hasGeometry(marks2) ? defaultAspectRatio : void 0;
  if (typeof projection2 !== "function") {
    const { aspectRatio } = namedProjection(projection2);
    if (aspectRatio)
      return aspectRatio;
  }
  return defaultAspectRatio;
}
function hasGeometry(marks2) {
  for (const mark of marks2)
    if (mark.channels.geometry)
      return true;
  return false;
}
function Context(options = {}, dimensions) {
  const { document: document2 = typeof window !== "undefined" ? window.document : void 0 } = options;
  return { document: document2, projection: Projection(options, dimensions) };
}
function create(name, { document: document2 }) {
  return select(creator(name).call(document2.documentElement));
}
function memoize1(compute) {
  let cacheValue, cacheKeys;
  return (...keys) => {
    if ((cacheKeys == null ? void 0 : cacheKeys.length) !== keys.length || cacheKeys.some((k2, i) => k2 !== keys[i])) {
      cacheKeys = keys;
      cacheValue = compute(...keys);
    }
    return cacheValue;
  };
}
const numberFormat = memoize1((locale2) => new Intl.NumberFormat(locale2));
function formatNumber(locale2 = "en-US") {
  const format2 = numberFormat(locale2);
  return (i) => i != null && !isNaN(i) ? format2.format(i) : void 0;
}
function formatIsoDate(date2) {
  return format(date2, "Invalid Date");
}
function formatAuto(locale2 = "en-US") {
  const number2 = formatNumber(locale2);
  return (v) => (v instanceof Date ? formatIsoDate : typeof v === "number" ? number2 : string)(v);
}
const formatDefault = formatAuto();
const offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5;
let nextClipId = 0;
function getClipId() {
  return `plot-clip-${++nextClipId}`;
}
function styles(mark, { title, href, ariaLabel: variaLabel, ariaDescription, ariaHidden, target, fill, fillOpacity, stroke, strokeWidth, strokeOpacity, strokeLinejoin, strokeLinecap, strokeMiterlimit, strokeDasharray, strokeDashoffset, opacity: opacity2, mixBlendMode, paintOrder, pointerEvents, shapeRendering }, { ariaLabel: cariaLabel, fill: defaultFill = "currentColor", fillOpacity: defaultFillOpacity, stroke: defaultStroke = "none", strokeOpacity: defaultStrokeOpacity, strokeWidth: defaultStrokeWidth, strokeLinecap: defaultStrokeLinecap, strokeLinejoin: defaultStrokeLinejoin, strokeMiterlimit: defaultStrokeMiterlimit, paintOrder: defaultPaintOrder }) {
  if (defaultFill === null) {
    fill = null;
    fillOpacity = null;
  }
  if (defaultStroke === null) {
    stroke = null;
    strokeOpacity = null;
  }
  if (isNoneish(defaultFill)) {
    if (!isNoneish(defaultStroke) && !isNoneish(fill))
      defaultStroke = "none";
  } else {
    if (isNoneish(defaultStroke) && !isNoneish(stroke))
      defaultFill = "none";
  }
  const [vfill, cfill] = maybeColorChannel(fill, defaultFill);
  const [vfillOpacity, cfillOpacity] = maybeNumberChannel(fillOpacity, defaultFillOpacity);
  const [vstroke, cstroke] = maybeColorChannel(stroke, defaultStroke);
  const [vstrokeOpacity, cstrokeOpacity] = maybeNumberChannel(strokeOpacity, defaultStrokeOpacity);
  const [vopacity, copacity] = maybeNumberChannel(opacity2);
  if (!isNone(cstroke)) {
    if (strokeWidth === void 0)
      strokeWidth = defaultStrokeWidth;
    if (strokeLinecap === void 0)
      strokeLinecap = defaultStrokeLinecap;
    if (strokeLinejoin === void 0)
      strokeLinejoin = defaultStrokeLinejoin;
    if (strokeMiterlimit === void 0 && !isRound(strokeLinejoin))
      strokeMiterlimit = defaultStrokeMiterlimit;
    if (!isNone(cfill) && paintOrder === void 0)
      paintOrder = defaultPaintOrder;
  }
  const [vstrokeWidth, cstrokeWidth] = maybeNumberChannel(strokeWidth);
  if (defaultFill !== null) {
    mark.fill = impliedString(cfill, "currentColor");
    mark.fillOpacity = impliedNumber(cfillOpacity, 1);
  }
  if (defaultStroke !== null) {
    mark.stroke = impliedString(cstroke, "none");
    mark.strokeWidth = impliedNumber(cstrokeWidth, 1);
    mark.strokeOpacity = impliedNumber(cstrokeOpacity, 1);
    mark.strokeLinejoin = impliedString(strokeLinejoin, "miter");
    mark.strokeLinecap = impliedString(strokeLinecap, "butt");
    mark.strokeMiterlimit = impliedNumber(strokeMiterlimit, 4);
    mark.strokeDasharray = impliedString(strokeDasharray, "none");
    mark.strokeDashoffset = impliedString(strokeDashoffset, "0");
  }
  mark.target = string(target);
  mark.ariaLabel = string(cariaLabel);
  mark.ariaDescription = string(ariaDescription);
  mark.ariaHidden = string(ariaHidden);
  mark.opacity = impliedNumber(copacity, 1);
  mark.mixBlendMode = impliedString(mixBlendMode, "normal");
  mark.paintOrder = impliedString(paintOrder, "normal");
  mark.pointerEvents = impliedString(pointerEvents, "auto");
  mark.shapeRendering = impliedString(shapeRendering, "auto");
  return {
    title: { value: title, optional: true },
    href: { value: href, optional: true },
    ariaLabel: { value: variaLabel, optional: true },
    fill: { value: vfill, scale: "auto", optional: true },
    fillOpacity: { value: vfillOpacity, scale: "opacity", optional: true },
    stroke: { value: vstroke, scale: "auto", optional: true },
    strokeOpacity: { value: vstrokeOpacity, scale: "opacity", optional: true },
    strokeWidth: { value: vstrokeWidth, optional: true },
    opacity: { value: vopacity, scale: "opacity", optional: true }
  };
}
function applyTitle(selection2, L) {
  if (L)
    selection2.filter((i) => nonempty(L[i])).append("title").call(applyText, L);
}
function applyText(selection2, T) {
  if (T)
    selection2.text((i) => formatDefault(T[i]));
}
function applyChannelStyles(selection2, { target }, { ariaLabel: AL, title: T, fill: F, fillOpacity: FO, stroke: S, strokeOpacity: SO, strokeWidth: SW, opacity: O, href: H }) {
  if (AL)
    applyAttr(selection2, "aria-label", (i) => AL[i]);
  if (F)
    applyAttr(selection2, "fill", (i) => F[i]);
  if (FO)
    applyAttr(selection2, "fill-opacity", (i) => FO[i]);
  if (S)
    applyAttr(selection2, "stroke", (i) => S[i]);
  if (SO)
    applyAttr(selection2, "stroke-opacity", (i) => SO[i]);
  if (SW)
    applyAttr(selection2, "stroke-width", (i) => SW[i]);
  if (O)
    applyAttr(selection2, "opacity", (i) => O[i]);
  if (H)
    applyHref(selection2, (i) => H[i], target);
  applyTitle(selection2, T);
}
function maybeClip(clip2) {
  if (clip2 === true)
    clip2 = "frame";
  else if (clip2 === false)
    clip2 = null;
  return maybeKeyword(clip2, "clip", ["frame", "sphere"]);
}
function applyClip(selection2, mark, dimensions, context) {
  let clipUrl;
  switch (mark.clip) {
    case "frame": {
      const { width, height, marginLeft, marginRight, marginTop, marginBottom } = dimensions;
      const id2 = getClipId();
      clipUrl = `url(#${id2})`;
      selection2 = create("svg:g", context).call((g) => g.append("svg:clipPath").attr("id", id2).append("rect").attr("x", marginLeft).attr("y", marginTop).attr("width", width - marginRight - marginLeft).attr("height", height - marginTop - marginBottom)).each(function() {
        this.appendChild(selection2.node());
        selection2.node = () => this;
      });
      break;
    }
    case "sphere": {
      const { projection: projection2 } = context;
      if (!projection2)
        throw new Error(`the "sphere" clip option requires a projection`);
      const id2 = getClipId();
      clipUrl = `url(#${id2})`;
      selection2.append("clipPath").attr("id", id2).append("path").attr("d", geoPath(projection2)({ type: "Sphere" }));
      break;
    }
  }
  applyAttr(selection2, "aria-label", mark.ariaLabel);
  applyAttr(selection2, "aria-description", mark.ariaDescription);
  applyAttr(selection2, "aria-hidden", mark.ariaHidden);
  applyAttr(selection2, "clip-path", clipUrl);
}
function applyIndirectStyles(selection2, mark, dimensions, context) {
  applyClip(selection2, mark, dimensions, context);
  applyAttr(selection2, "fill", mark.fill);
  applyAttr(selection2, "fill-opacity", mark.fillOpacity);
  applyAttr(selection2, "stroke", mark.stroke);
  applyAttr(selection2, "stroke-width", mark.strokeWidth);
  applyAttr(selection2, "stroke-opacity", mark.strokeOpacity);
  applyAttr(selection2, "stroke-linejoin", mark.strokeLinejoin);
  applyAttr(selection2, "stroke-linecap", mark.strokeLinecap);
  applyAttr(selection2, "stroke-miterlimit", mark.strokeMiterlimit);
  applyAttr(selection2, "stroke-dasharray", mark.strokeDasharray);
  applyAttr(selection2, "stroke-dashoffset", mark.strokeDashoffset);
  applyAttr(selection2, "shape-rendering", mark.shapeRendering);
  applyAttr(selection2, "paint-order", mark.paintOrder);
  applyAttr(selection2, "pointer-events", mark.pointerEvents);
}
function applyDirectStyles(selection2, mark) {
  applyStyle(selection2, "mix-blend-mode", mark.mixBlendMode);
  applyAttr(selection2, "opacity", mark.opacity);
}
function applyHref(selection2, href, target) {
  selection2.each(function(i) {
    const h = href(i);
    if (h != null) {
      const a2 = this.ownerDocument.createElementNS(namespaces.svg, "a");
      a2.setAttribute("fill", "inherit");
      a2.setAttributeNS(namespaces.xlink, "href", h);
      if (target != null)
        a2.setAttribute("target", target);
      this.parentNode.insertBefore(a2, this).appendChild(this);
    }
  });
}
function applyAttr(selection2, name, value) {
  if (value != null)
    selection2.attr(name, value);
}
function applyStyle(selection2, name, value) {
  if (value != null)
    selection2.style(name, value);
}
function applyTransform(selection2, mark, { x, y }, tx = offset, ty = offset) {
  tx += mark.dx;
  ty += mark.dy;
  if (x == null ? void 0 : x.bandwidth)
    tx += x.bandwidth() / 2;
  if (y == null ? void 0 : y.bandwidth)
    ty += y.bandwidth() / 2;
  if (tx || ty)
    selection2.attr("transform", `translate(${tx},${ty})`);
}
function impliedString(value, impliedValue) {
  if ((value = string(value)) !== impliedValue)
    return value;
}
function impliedNumber(value, impliedValue) {
  if ((value = number(value)) !== impliedValue)
    return value;
}
const validClassName = /^-?([_a-z]|[\240-\377]|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])([_a-z0-9-]|[\240-\377]|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])*$/;
function maybeClassName(name) {
  if (name === void 0)
    return `plot-${Math.random().toString(16).slice(2)}`;
  name = `${name}`;
  if (!validClassName.test(name))
    throw new Error(`invalid class name: ${name}`);
  return name;
}
function applyInlineStyles(selection2, style) {
  if (typeof style === "string") {
    selection2.property("style", style);
  } else if (style != null) {
    for (const element of selection2) {
      Object.assign(element.style, style);
    }
  }
}
function applyFrameAnchor({ frameAnchor }, { width, height, marginTop, marginRight, marginBottom, marginLeft }) {
  return [
    /left$/.test(frameAnchor) ? marginLeft : /right$/.test(frameAnchor) ? width - marginRight : (marginLeft + width - marginRight) / 2,
    /^top/.test(frameAnchor) ? marginTop : /^bottom/.test(frameAnchor) ? height - marginBottom : (marginTop + height - marginBottom) / 2
  ];
}
function Dimensions(scales, marks2, options = {}) {
  let marginTopDefault = 0.5 - offset, marginRightDefault = 0.5 + offset, marginBottomDefault = 0.5 + offset, marginLeftDefault = 0.5 - offset;
  for (const { marginTop: marginTop2, marginRight: marginRight2, marginBottom: marginBottom2, marginLeft: marginLeft2 } of marks2) {
    if (marginTop2 > marginTopDefault)
      marginTopDefault = marginTop2;
    if (marginRight2 > marginRightDefault)
      marginRightDefault = marginRight2;
    if (marginBottom2 > marginBottomDefault)
      marginBottomDefault = marginBottom2;
    if (marginLeft2 > marginLeftDefault)
      marginLeftDefault = marginLeft2;
  }
  let { margin, marginTop = margin !== void 0 ? margin : marginTopDefault, marginRight = margin !== void 0 ? margin : marginRightDefault, marginBottom = margin !== void 0 ? margin : marginBottomDefault, marginLeft = margin !== void 0 ? margin : marginLeftDefault } = options;
  marginTop = +marginTop;
  marginRight = +marginRight;
  marginBottom = +marginBottom;
  marginLeft = +marginLeft;
  let { width = 640, height = autoHeight(scales, marks2, options, {
    width,
    marginTopDefault,
    marginRightDefault,
    marginBottomDefault,
    marginLeftDefault
  }) + Math.max(0, marginTop - marginTopDefault + marginBottom - marginBottomDefault) } = options;
  width = +width;
  height = +height;
  const dimensions = {
    width,
    height,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft
  };
  if (scales.fx || scales.fy) {
    let { margin: facetMargin, marginTop: facetMarginTop = facetMargin !== void 0 ? facetMargin : marginTop, marginRight: facetMarginRight = facetMargin !== void 0 ? facetMargin : marginRight, marginBottom: facetMarginBottom = facetMargin !== void 0 ? facetMargin : marginBottom, marginLeft: facetMarginLeft = facetMargin !== void 0 ? facetMargin : marginLeft } = options.facet ?? {};
    facetMarginTop = +facetMarginTop;
    facetMarginRight = +facetMarginRight;
    facetMarginBottom = +facetMarginBottom;
    facetMarginLeft = +facetMarginLeft;
    dimensions.facet = {
      marginTop: facetMarginTop,
      marginRight: facetMarginRight,
      marginBottom: facetMarginBottom,
      marginLeft: facetMarginLeft
    };
  }
  return dimensions;
}
function autoHeight({ x, y, fy, fx }, marks2, { projection: projection2, aspectRatio }, { width, marginTopDefault, marginRightDefault, marginBottomDefault, marginLeftDefault }) {
  const nfy = fy ? fy.scale.domain().length : 1;
  const ar = projectionAspectRatio(projection2, marks2);
  if (ar) {
    const nfx = fx ? fx.scale.domain().length : 1;
    const far = (1.1 * nfy - 0.1) / (1.1 * nfx - 0.1) * ar;
    const lar = Math.max(0.1, Math.min(10, far));
    return Math.round((width - marginLeftDefault - marginRightDefault) * lar + marginTopDefault + marginBottomDefault);
  }
  const ny = y ? isOrdinalScale(y) ? y.scale.domain().length : Math.max(7, 17 / nfy) : 1;
  if (aspectRatio != null) {
    aspectRatio = +aspectRatio;
    if (!(isFinite(aspectRatio) && aspectRatio > 0))
      throw new Error(`invalid aspectRatio: ${aspectRatio}`);
    const ratio = aspectRatioLength("y", y) / (aspectRatioLength("x", x) * aspectRatio);
    const fxb = fx ? fx.scale.bandwidth() : 1;
    const fyb = fy ? fy.scale.bandwidth() : 1;
    const w = fxb * (width - marginLeftDefault - marginRightDefault) - x.insetLeft - x.insetRight;
    return (ratio * w + y.insetTop + y.insetBottom) / fyb + marginTopDefault + marginBottomDefault;
  }
  return !!(y || fy) * Math.max(1, Math.min(60, ny * nfy)) * 20 + !!fx * 30 + 60;
}
function aspectRatioLength(k2, scale) {
  if (!scale)
    throw new Error(`aspectRatio requires ${k2} scale`);
  const { type, domain } = scale;
  let transform;
  switch (type) {
    case "linear":
    case "utc":
    case "time":
      transform = Number;
      break;
    case "pow": {
      const exponent2 = scale.scale.exponent();
      transform = (x) => Math.pow(x, exponent2);
      break;
    }
    case "log":
      transform = Math.log;
      break;
    case "point":
    case "band":
      return domain.length;
    default:
      throw new Error(`unsupported ${k2} scale for aspectRatio: ${type}`);
  }
  const [min2, max2] = extent$1(domain);
  return Math.abs(transform(max2) - transform(min2));
}
function Facets(channelsByScale, options) {
  const { fx, fy } = Scales(channelsByScale, options);
  const fxDomain = fx == null ? void 0 : fx.scale.domain();
  const fyDomain = fy == null ? void 0 : fy.scale.domain();
  return fxDomain && fyDomain ? cross(fxDomain, fyDomain).map(([x, y], i) => ({ x, y, i })) : fxDomain ? fxDomain.map((x, i) => ({ x, i })) : fyDomain ? fyDomain.map((y, i) => ({ y, i })) : void 0;
}
function facetOrder({ x: X, y: Y }) {
  const xi = X && new Map(X.map((v, i) => [v, i]));
  const yi = Y && new Map(Y.map((v, i) => [v, i]));
  return X && Y ? (a2, b) => xi.get(a2.x) - xi.get(b.x) || yi.get(a2.y) - yi.get(b.y) : X ? (a2, b) => xi.get(a2.x) - xi.get(b.x) : (a2, b) => yi.get(a2.y) - yi.get(b.y);
}
function facetGroups(data, { fx, fy }) {
  const I = range(data);
  const FX = fx == null ? void 0 : fx.value;
  const FY = fy == null ? void 0 : fy.value;
  return fx && fy ? rollup(I, (G) => (G.fx = FX[G[0]], G.fy = FY[G[0]], G), (i) => FX[i], (i) => FY[i]) : fx ? rollup(I, (G) => (G.fx = FX[G[0]], G), (i) => FX[i]) : rollup(I, (G) => (G.fy = FY[G[0]], G), (i) => FY[i]);
}
function facetTranslate(fx, fy, { marginTop, marginLeft }) {
  return fx && fy ? ({ x, y }) => `translate(${fx(x) - marginLeft},${fy(y) - marginTop})` : fx ? ({ x }) => `translate(${fx(x) - marginLeft},0)` : ({ y }) => `translate(0,${fy(y) - marginTop})`;
}
function facetExclude(index2) {
  const ex = [];
  const e = new Uint32Array(sum(index2, (d) => d.length));
  for (const i of index2) {
    let n = 0;
    for (const j of index2) {
      if (i === j)
        continue;
      e.set(j, n);
      n += j.length;
    }
    ex.push(e.slice(0, n));
  }
  return ex;
}
const facetAnchors = /* @__PURE__ */ new Map([
  ["top", facetAnchorTop],
  ["right", facetAnchorRight],
  ["bottom", facetAnchorBottom],
  ["left", facetAnchorLeft],
  ["top-left", and(facetAnchorTop, facetAnchorLeft)],
  ["top-right", and(facetAnchorTop, facetAnchorRight)],
  ["bottom-left", and(facetAnchorBottom, facetAnchorLeft)],
  ["bottom-right", and(facetAnchorBottom, facetAnchorRight)],
  ["top-empty", facetAnchorTopEmpty],
  ["right-empty", facetAnchorRightEmpty],
  ["bottom-empty", facetAnchorBottomEmpty],
  ["left-empty", facetAnchorLeftEmpty],
  ["empty", facetAnchorEmpty]
]);
function maybeFacetAnchor(facetAnchor) {
  if (facetAnchor == null)
    return null;
  const anchor = facetAnchors.get(`${facetAnchor}`.toLowerCase());
  if (anchor)
    return anchor;
  throw new Error(`invalid facet anchor: ${facetAnchor}`);
}
function facetAnchorTop(facets, { y: Y }, { y }) {
  return Y ? Y.indexOf(y) === 0 : true;
}
function facetAnchorBottom(facets, { y: Y }, { y }) {
  return Y ? Y.indexOf(y) === Y.length - 1 : true;
}
function facetAnchorLeft(facets, { x: X }, { x }) {
  return X ? X.indexOf(x) === 0 : true;
}
function facetAnchorRight(facets, { x: X }, { x }) {
  return X ? X.indexOf(x) === X.length - 1 : true;
}
function facetAnchorTopEmpty(facets, { y: Y }, { x, y, empty: empty2 }) {
  var _a;
  if (empty2)
    return false;
  const i = Y == null ? void 0 : Y.indexOf(y);
  if (i > 0) {
    const y2 = Y[i - 1];
    return (_a = facets.find((f) => f.x === x && f.y === y2)) == null ? void 0 : _a.empty;
  }
}
function facetAnchorBottomEmpty(facets, { y: Y }, { x, y, empty: empty2 }) {
  var _a;
  if (empty2)
    return false;
  const i = Y == null ? void 0 : Y.indexOf(y);
  if (i < (Y == null ? void 0 : Y.length) - 1) {
    const y2 = Y[i + 1];
    return (_a = facets.find((f) => f.x === x && f.y === y2)) == null ? void 0 : _a.empty;
  }
}
function facetAnchorLeftEmpty(facets, { x: X }, { x, y, empty: empty2 }) {
  var _a;
  if (empty2)
    return false;
  const i = X == null ? void 0 : X.indexOf(x);
  if (i > 0) {
    const x2 = X[i - 1];
    return (_a = facets.find((f) => f.x === x2 && f.y === y)) == null ? void 0 : _a.empty;
  }
}
function facetAnchorRightEmpty(facets, { x: X }, { x, y, empty: empty2 }) {
  var _a;
  if (empty2)
    return false;
  const i = X == null ? void 0 : X.indexOf(x);
  if (i < (X == null ? void 0 : X.length) - 1) {
    const x2 = X[i + 1];
    return (_a = facets.find((f) => f.x === x2 && f.y === y)) == null ? void 0 : _a.empty;
  }
}
function facetAnchorEmpty(facets, channels, { empty: empty2 }) {
  return empty2;
}
function and(a2, b) {
  return function() {
    return a2.apply(null, arguments) && b.apply(null, arguments);
  };
}
function facetFilter(facets, { channels: { fx, fy }, groups: groups2 }) {
  return fx && fy ? facets.map(({ x, y }) => {
    var _a;
    return ((_a = groups2.get(x)) == null ? void 0 : _a.get(y)) ?? [];
  }) : fx ? facets.map(({ x }) => groups2.get(x) ?? []) : facets.map(({ y }) => groups2.get(y) ?? []);
}
function inferFontVariant$2(scale) {
  return isOrdinalScale(scale) && scale.interval === void 0 ? void 0 : "tabular-nums";
}
function maybeAutoTickFormat(tickFormat2, domain) {
  return tickFormat2 === void 0 ? isTemporal(domain) ? formatIsoDate : string : typeof tickFormat2 === "function" ? tickFormat2 : (typeof tickFormat2 === "string" ? isTemporal(domain) ? utcFormat : format$1 : constant)(tickFormat2);
}
function legendRamp(color2, options) {
  let { label = color2.label, tickSize = 6, width = 240, height = 44 + tickSize, marginTop = 18, marginRight = 0, marginBottom = 16 + tickSize, marginLeft = 0, style, ticks: ticks2 = (width - marginLeft - marginRight) / 64, tickFormat: tickFormat2, fontVariant = inferFontVariant$2(color2), round = true, className } = options;
  const context = Context(options);
  className = maybeClassName(className);
  if (tickFormat2 === null)
    tickFormat2 = () => null;
  const svg = create("svg", context).attr("class", className).attr("font-family", "system-ui, sans-serif").attr("font-size", 10).attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`).call((svg2) => svg2.append("style").text(`
        .${className} {
          display: block;
          background: white;
          height: auto;
          height: intrinsic;
          max-width: 100%;
          overflow: visible;
        }
        .${className} text {
          white-space: pre;
        }
      `)).call(applyInlineStyles, style);
  let tickAdjust = (g) => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;
  const applyRange = round ? (x2, range3) => x2.rangeRound(range3) : (x2, range3) => x2.range(range3);
  const { type, domain, range: range2, interpolate: interpolate2, scale, pivot } = color2;
  if (interpolate2) {
    const interpolator = range2 === void 0 ? interpolate2 : piecewise(interpolate2.length === 1 ? interpolatePiecewise(interpolate2) : interpolate2, range2);
    x = applyRange(scale.copy(), quantize(interpolateNumber(marginLeft, width - marginRight), Math.min(domain.length + (pivot !== void 0), range2 === void 0 ? Infinity : range2.length)));
    const n = 256;
    const canvas = context.document.createElement("canvas");
    canvas.width = n;
    canvas.height = 1;
    const context2 = canvas.getContext("2d");
    for (let i = 0, j = n - 1; i < n; ++i) {
      context2.fillStyle = interpolator(i / j);
      context2.fillRect(i, 0, 1, 1);
    }
    svg.append("image").attr("x", marginLeft).attr("y", marginTop).attr("width", width - marginLeft - marginRight).attr("height", height - marginTop - marginBottom).attr("preserveAspectRatio", "none").attr("xlink:href", canvas.toDataURL());
  } else if (type === "threshold") {
    const thresholds = domain;
    const thresholdFormat = tickFormat2 === void 0 ? (d) => d : typeof tickFormat2 === "string" ? format$1(tickFormat2) : tickFormat2;
    x = applyRange(linear().domain([-1, range2.length - 1]), [marginLeft, width - marginRight]);
    svg.append("g").selectAll().data(range2).enter().append("rect").attr("x", (d, i) => x(i - 1)).attr("y", marginTop).attr("width", (d, i) => x(i) - x(i - 1)).attr("height", height - marginTop - marginBottom).attr("fill", (d) => d);
    ticks2 = map(thresholds, (_, i) => i);
    tickFormat2 = (i) => thresholdFormat(thresholds[i], i);
  } else {
    x = applyRange(band().domain(domain), [marginLeft, width - marginRight]);
    svg.append("g").selectAll().data(domain).enter().append("rect").attr("x", x).attr("y", marginTop).attr("width", Math.max(0, x.bandwidth() - 1)).attr("height", height - marginTop - marginBottom).attr("fill", scale);
    tickAdjust = () => {
    };
  }
  svg.append("g").attr("transform", `translate(0,${height - marginBottom})`).call(axisBottom(x).ticks(Array.isArray(ticks2) ? null : ticks2, typeof tickFormat2 === "string" ? tickFormat2 : void 0).tickFormat(typeof tickFormat2 === "function" ? tickFormat2 : void 0).tickSize(tickSize).tickValues(Array.isArray(ticks2) ? ticks2 : null)).attr("font-size", null).attr("font-family", null).attr("font-variant", impliedString(fontVariant, "normal")).call(tickAdjust).call((g) => g.select(".domain").remove());
  if (label !== void 0) {
    svg.append("text").attr("x", marginLeft).attr("y", marginTop - 6).attr("fill", "currentColor").attr("font-weight", "bold").text(label);
  }
  return svg.node();
}
function maybeScale(scale, key) {
  if (key == null)
    return key;
  const s2 = scale(key);
  if (!s2)
    throw new Error(`scale not found: ${key}`);
  return s2;
}
function legendSwatches(color2, options) {
  if (!isOrdinalScale(color2) && !isThresholdScale(color2))
    throw new Error(`swatches legend requires ordinal or threshold color scale (not ${color2.type})`);
  return legendItems(color2, options, (selection2, scale) => selection2.append("svg").attr("fill", scale.scale).append("rect").attr("width", "100%").attr("height", "100%"), (className) => `.${className}-swatch svg {
        width: var(--swatchWidth);
        height: var(--swatchHeight);
        margin-right: 0.5em;
      }`);
}
function legendSymbols(symbol2, { fill = ((_a) => (_a = symbol2.hint) == null ? void 0 : _a.fill)() !== void 0 ? symbol2.hint.fill : "none", fillOpacity = 1, stroke = ((_b) => (_b = symbol2.hint) == null ? void 0 : _b.stroke)() !== void 0 ? symbol2.hint.stroke : isNoneish(fill) ? "currentColor" : "none", strokeOpacity = 1, strokeWidth = 1.5, r = 4.5, ...options } = {}, scale) {
  const [vf, cf] = maybeColorChannel(fill);
  const [vs, cs] = maybeColorChannel(stroke);
  const sf = maybeScale(scale, vf);
  const ss = maybeScale(scale, vs);
  const size = r * r * Math.PI;
  fillOpacity = maybeNumberChannel(fillOpacity)[1];
  strokeOpacity = maybeNumberChannel(strokeOpacity)[1];
  strokeWidth = maybeNumberChannel(strokeWidth)[1];
  return legendItems(symbol2, options, (selection2) => selection2.append("svg").attr("viewBox", "-8 -8 16 16").attr("fill", vf === "color" ? (d) => sf.scale(d) : null).attr("stroke", vs === "color" ? (d) => ss.scale(d) : null).append("path").attr("d", (d) => {
    const p = pathRound();
    symbol2.scale(d).draw(p, size);
    return p;
  }), (className) => `.${className}-swatch > svg {
        width: var(--swatchWidth);
        height: var(--swatchHeight);
        margin-right: 0.5em;
        overflow: visible;
        fill: ${cf};
        fill-opacity: ${fillOpacity};
        stroke: ${cs};
        stroke-width: ${strokeWidth}px;
        stroke-opacity: ${strokeOpacity};
      }`);
}
function legendItems(scale, options = {}, swatch, swatchStyle) {
  let {
    columns,
    tickFormat: tickFormat2,
    fontVariant = inferFontVariant$2(scale),
    // TODO label,
    swatchSize = 15,
    swatchWidth = swatchSize,
    swatchHeight = swatchSize,
    marginLeft = 0,
    className,
    style,
    width
  } = options;
  const context = Context(options);
  className = maybeClassName(className);
  tickFormat2 = maybeAutoTickFormat(tickFormat2, scale.domain);
  const swatches = create("div", context).attr("class", className).attr("style", `
        --swatchWidth: ${+swatchWidth}px;
        --swatchHeight: ${+swatchHeight}px;
      `);
  let extraStyle;
  if (columns != null) {
    extraStyle = `
      .${className}-swatch {
        display: flex;
        align-items: center;
        break-inside: avoid;
        padding-bottom: 1px;
      }
      .${className}-swatch::before {
        flex-shrink: 0;
      }
      .${className}-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `;
    swatches.style("columns", columns).selectAll().data(scale.domain).enter().append("div").attr("class", `${className}-swatch`).call(swatch, scale).call((item) => item.append("div").attr("class", `${className}-label`).attr("title", tickFormat2).text(tickFormat2));
  } else {
    extraStyle = `
      .${className} {
        display: flex;
        align-items: center;
        min-height: 33px;
        flex-wrap: wrap;
      }
      .${className}-swatch {
        display: inline-flex;
        align-items: center;
        margin-right: 1em;
      }
    `;
    swatches.selectAll().data(scale.domain).enter().append("span").attr("class", `${className}-swatch`).call(swatch, scale).append(function() {
      return this.ownerDocument.createTextNode(tickFormat2.apply(this, arguments));
    });
  }
  return swatches.call((div) => div.insert("style", "*").text(`
        .${className} {
          font-family: system-ui, sans-serif;
          font-size: 10px;
          margin-bottom: 0.5em;${marginLeft === void 0 ? "" : `
          margin-left: ${+marginLeft}px;`}${width === void 0 ? "" : `
          width: ${width}px;`}
        }
        ${swatchStyle(className)}
        ${extraStyle}
      `)).style("font-variant", impliedString(fontVariant, "normal")).call(applyInlineStyles, style).node();
}
const legendRegistry = /* @__PURE__ */ new Map([
  ["symbol", legendSymbols],
  ["color", legendColor],
  ["opacity", legendOpacity]
]);
function exposeLegends(scales, context, defaults2 = {}) {
  return (key, options) => {
    if (!legendRegistry.has(key))
      throw new Error(`unknown legend type: ${key}`);
    if (!(key in scales))
      return;
    return legendRegistry.get(key)(scales[key], legendOptions(context, defaults2[key], options), (key2) => scales[key2]);
  };
}
function legendOptions(context, { label, ticks: ticks2, tickFormat: tickFormat2 } = {}, options) {
  return inherit(options, context, { label, ticks: ticks2, tickFormat: tickFormat2 });
}
function legendColor(color2, { legend = true, ...options }) {
  if (legend === true)
    legend = color2.type === "ordinal" ? "swatches" : "ramp";
  if (color2.domain === void 0)
    return;
  switch (`${legend}`.toLowerCase()) {
    case "swatches":
      return legendSwatches(color2, options);
    case "ramp":
      return legendRamp(color2, options);
    default:
      throw new Error(`unknown legend type: ${legend}`);
  }
}
function legendOpacity({ type, interpolate: interpolate2, ...scale }, { legend = true, color: color2 = rgb(0, 0, 0), ...options }) {
  if (!interpolate2)
    throw new Error(`${type} opacity scales are not supported`);
  if (legend === true)
    legend = "ramp";
  if (`${legend}`.toLowerCase() !== "ramp")
    throw new Error(`${legend} opacity legends are not supported`);
  return legendColor({ type, ...scale, interpolate: interpolateOpacity(color2) }, { legend, ...options });
}
function interpolateOpacity(color2) {
  const { r, g, b } = rgb(color2) || rgb(0, 0, 0);
  return (t) => `rgba(${r},${g},${b},${t})`;
}
function Legends(scales, context, options) {
  const legends = [];
  for (const [key, value] of legendRegistry) {
    const o = options[key];
    if ((o == null ? void 0 : o.legend) && key in scales) {
      const legend = value(scales[key], legendOptions(context, scales[key], o), (key2) => scales[key2]);
      if (legend != null)
        legends.push(legend);
    }
  }
  return legends;
}
class Mark {
  constructor(data, channels = {}, options = {}, defaults2) {
    const { facet = "auto", facetAnchor, fx, fy, sort: sort2, dx = 0, dy = 0, margin = 0, marginTop = margin, marginRight = margin, marginBottom = margin, marginLeft = margin, clip: clip2, channels: extraChannels } = options;
    this.data = data;
    this.sort = isDomainSort(sort2) ? sort2 : null;
    this.initializer = initializer(options).initializer;
    this.transform = this.initializer ? options.transform : basic(options).transform;
    if (facet === null || facet === false) {
      this.facet = null;
    } else {
      this.facet = keyword(facet === true ? "include" : facet, "facet", ["auto", "include", "exclude", "super"]);
      this.fx = fx;
      this.fy = fy;
    }
    this.facetAnchor = maybeFacetAnchor(facetAnchor);
    channels = maybeNamed(channels);
    if (extraChannels !== void 0)
      channels = { ...maybeNamed(extraChannels), ...channels };
    if (defaults2 !== void 0)
      channels = { ...styles(this, options, defaults2), ...channels };
    this.channels = Object.fromEntries(Object.entries(channels).map(([name, channel]) => {
      const { value } = channel;
      if (isOptions(value)) {
        channel = { ...channel, value: value.value };
        if (value.scale !== void 0)
          channel.scale = value.scale;
      }
      return [name, channel];
    }).filter(([name, { value, optional }]) => {
      if (value != null)
        return true;
      if (optional)
        return false;
      throw new Error(`missing channel value: ${name}`);
    }));
    this.dx = +dx;
    this.dy = +dy;
    this.marginTop = +marginTop;
    this.marginRight = +marginRight;
    this.marginBottom = +marginBottom;
    this.marginLeft = +marginLeft;
    this.clip = maybeClip(clip2);
    if (this.facet === "super") {
      if (fx || fy)
        throw new Error(`super-faceting cannot use fx or fy`);
      for (const name in this.channels) {
        const { scale } = channels[name];
        if (scale !== "x" && scale !== "y")
          continue;
        throw new Error(`super-faceting cannot use x or y`);
      }
    }
  }
  initialize(facets, facetChannels) {
    let data = arrayify(this.data);
    if (facets === void 0 && data != null)
      facets = [range(data)];
    if (this.transform != null)
      ({ facets, data } = this.transform(data, facets)), data = arrayify(data);
    const channels = Channels(this.channels, data);
    if (this.sort != null)
      channelDomain(channels, facetChannels, data, this.sort);
    return { data, facets, channels };
  }
  filter(index2, channels, values2) {
    for (const name in channels) {
      const { filter: filter2 = defined } = channels[name];
      if (filter2 !== null) {
        const value = values2[name];
        index2 = index2.filter((i) => filter2(value[i]));
      }
    }
    return index2;
  }
  // If there is a projection, and there are both x and y channels (or x1 and
  // y1, or x2 and y2 channels), and those channels are associated with the x
  // and y scale respectively (and not already in screen coordinates as with an
  // initializer), then apply the projection, replacing the x and y values. Note
  // that the x and y scales themselves don’t exist if there is a projection,
  // but whether the channels are associated with scales still determines
  // whether the projection should apply; think of the projection as a
  // combination xy-scale.
  project(channels, values2, context) {
    maybeProject("x", "y", channels, values2, context);
    maybeProject("x1", "y1", channels, values2, context);
    maybeProject("x2", "y2", channels, values2, context);
  }
  scale(channels, scales, context) {
    const values2 = valueObject(channels, scales);
    if (context.projection)
      this.project(channels, values2, context);
    return values2;
  }
}
function marks(...marks2) {
  marks2.plot = Mark.prototype.plot;
  return marks2;
}
const radians = Math.PI / 180;
function maybeInsetX({ inset, insetLeft, insetRight, ...options } = {}) {
  [insetLeft, insetRight] = maybeInset(inset, insetLeft, insetRight);
  return { inset, insetLeft, insetRight, ...options };
}
function maybeInsetY({ inset, insetTop, insetBottom, ...options } = {}) {
  [insetTop, insetBottom] = maybeInset(inset, insetTop, insetBottom);
  return { inset, insetTop, insetBottom, ...options };
}
function maybeInset(inset, inset1, inset2) {
  return inset === void 0 && inset1 === void 0 && inset2 === void 0 ? offset ? [1, 0] : [0.5, 0.5] : [inset1, inset2];
}
function maybeIntervalValue(value, { interval: interval2 }) {
  value = { ...maybeValue(value) };
  value.interval = maybeInterval(value.interval === void 0 ? interval2 : value.interval);
  return value;
}
function maybeIntervalK(k2, maybeInsetK, options, trivial) {
  const { [k2]: v, [`${k2}1`]: v1, [`${k2}2`]: v2 } = options;
  const { value, interval: interval2 } = maybeIntervalValue(v, options);
  if (value == null || interval2 == null && !trivial)
    return options;
  const label = labelof(v);
  if (interval2 == null) {
    let V;
    const kv = { transform: (data) => V || (V = valueof(data, value)), label };
    return {
      ...options,
      [k2]: void 0,
      [`${k2}1`]: v1 === void 0 ? kv : v1,
      [`${k2}2`]: v2 === void 0 ? kv : v2
    };
  }
  let D1, V1;
  function transform(data) {
    if (V1 !== void 0 && data === D1)
      return V1;
    return V1 = map(valueof(D1 = data, value), (v3) => interval2.floor(v3));
  }
  return maybeInsetK({
    ...options,
    [k2]: void 0,
    [`${k2}1`]: v1 === void 0 ? { transform, label } : v1,
    [`${k2}2`]: v2 === void 0 ? { transform: (data) => transform(data).map((v3) => interval2.offset(v3)), label } : v2
  });
}
function maybeIntervalMidK(k2, maybeInsetK, options) {
  const { [k2]: v } = options;
  const { value, interval: interval2 } = maybeIntervalValue(v, options);
  if (value == null || interval2 == null)
    return options;
  return maybeInsetK({
    ...options,
    [k2]: {
      label: labelof(v),
      transform: (data) => {
        const V1 = map(valueof(data, value), (v2) => interval2.floor(v2));
        const V2 = V1.map((v2) => interval2.offset(v2));
        return V1.map(isTemporal(V1) ? (v1, v2) => v1 == null || isNaN(v1 = +v1) || (v2 = V2[v2], v2 == null) || isNaN(v2 = +v2) ? void 0 : new Date((v1 + v2) / 2) : (v1, v2) => v1 == null || (v2 = V2[v2], v2 == null) ? NaN : (+v1 + +v2) / 2);
      }
    }
  });
}
function maybeIntervalX(options = {}) {
  return maybeIntervalK("x", maybeInsetX, options);
}
function maybeIntervalY(options = {}) {
  return maybeIntervalK("y", maybeInsetY, options);
}
function maybeIntervalMidX(options = {}) {
  return maybeIntervalMidK("x", maybeInsetX, options);
}
function maybeIntervalMidY(options = {}) {
  return maybeIntervalMidK("y", maybeInsetY, options);
}
const defaults$5 = {
  ariaLabel: "rule",
  fill: null,
  stroke: "currentColor"
};
class RuleX extends Mark {
  constructor(data, options = {}) {
    const { x, y1: y12, y2, inset = 0, insetTop = inset, insetBottom = inset } = options;
    super(data, {
      x: { value: x, scale: "x", optional: true },
      y1: { value: y12, scale: "y", optional: true },
      y2: { value: y2, scale: "y", optional: true }
    }, options, defaults$5);
    this.insetTop = number(insetTop);
    this.insetBottom = number(insetBottom);
  }
  render(index2, scales, channels, dimensions, context) {
    const { x, y } = scales;
    const { x: X, y1: Y12, y2: Y22 } = channels;
    const { width, height, marginTop, marginRight, marginLeft, marginBottom } = dimensions;
    const { insetTop, insetBottom } = this;
    return create("svg:g", context).call(applyIndirectStyles, this, dimensions).call(applyTransform, this, { x: X && x }, offset, 0).call((g) => g.selectAll().data(index2).enter().append("line").call(applyDirectStyles, this).attr("x1", X ? (i) => X[i] : (marginLeft + width - marginRight) / 2).attr("x2", X ? (i) => X[i] : (marginLeft + width - marginRight) / 2).attr("y1", Y12 && !isCollapsed(y) ? (i) => Y12[i] + insetTop : marginTop + insetTop).attr("y2", Y22 && !isCollapsed(y) ? y.bandwidth ? (i) => Y22[i] + y.bandwidth() - insetBottom : (i) => Y22[i] - insetBottom : height - marginBottom - insetBottom).call(applyChannelStyles, this, channels)).node();
  }
}
class RuleY extends Mark {
  constructor(data, options = {}) {
    const { x1: x12, x2, y, inset = 0, insetRight = inset, insetLeft = inset } = options;
    super(data, {
      y: { value: y, scale: "y", optional: true },
      x1: { value: x12, scale: "x", optional: true },
      x2: { value: x2, scale: "x", optional: true }
    }, options, defaults$5);
    this.insetRight = number(insetRight);
    this.insetLeft = number(insetLeft);
  }
  render(index2, scales, channels, dimensions, context) {
    const { x, y } = scales;
    const { y: Y, x1: X12, x2: X22 } = channels;
    const { width, height, marginTop, marginRight, marginLeft, marginBottom } = dimensions;
    const { insetLeft, insetRight } = this;
    return create("svg:g", context).call(applyIndirectStyles, this, dimensions, context).call(applyTransform, this, { y: Y && y }, 0, offset).call((g) => g.selectAll().data(index2).enter().append("line").call(applyDirectStyles, this).attr("x1", X12 && !isCollapsed(x) ? (i) => X12[i] + insetLeft : marginLeft + insetLeft).attr("x2", X22 && !isCollapsed(x) ? x.bandwidth ? (i) => X22[i] + x.bandwidth() - insetRight : (i) => X22[i] - insetRight : width - marginRight - insetRight).attr("y1", Y ? (i) => Y[i] : (marginTop + height - marginBottom) / 2).attr("y2", Y ? (i) => Y[i] : (marginTop + height - marginBottom) / 2).call(applyChannelStyles, this, channels)).node();
  }
}
function ruleX(data, options) {
  let { x = identity$1, y, y1: y12, y2, ...rest } = maybeIntervalY(options);
  [y12, y2] = maybeOptionalZero(y, y12, y2);
  return new RuleX(data, { ...rest, x, y1: y12, y2 });
}
function ruleY(data, options) {
  let { y = identity$1, x, x1: x12, x2, ...rest } = maybeIntervalX(options);
  [x12, x2] = maybeOptionalZero(x, x12, x2);
  return new RuleY(data, { ...rest, y, x1: x12, x2 });
}
function maybeOptionalZero(x, x12, x2) {
  if (x === void 0) {
    if (x12 === void 0) {
      if (x2 !== void 0)
        return [0, x2];
    } else {
      if (x2 === void 0)
        return [0, x12];
    }
  } else if (x12 === void 0) {
    return x2 === void 0 ? [0, x] : [x, x2];
  } else if (x2 === void 0) {
    return [x, x12];
  }
  return [x12, x2];
}
function template(strings, ...parts) {
  let n = parts.length;
  for (let j = 0, copy2 = true; j < n; ++j) {
    if (typeof parts[j] !== "function") {
      if (copy2) {
        strings = strings.slice();
        copy2 = false;
      }
      strings.splice(j, 2, strings[j] + parts[j] + strings[j + 1]);
      parts.splice(j, 1);
      --j, --n;
    }
  }
  return (i) => {
    let s2 = strings[0];
    for (let j = 0; j < n; ++j) {
      s2 += parts[j](i) + strings[j + 1];
    }
    return s2;
  };
}
const defaults$4 = {
  ariaLabel: "text",
  strokeLinejoin: "round",
  strokeWidth: 3,
  paintOrder: "stroke"
};
const softHyphen = "­";
class Text extends Mark {
  constructor(data, options = {}) {
    const { x, y, text: text2 = isIterable(data) && isTextual(data) ? identity$1 : indexOf, frameAnchor, textAnchor = /right$/i.test(frameAnchor) ? "end" : /left$/i.test(frameAnchor) ? "start" : "middle", lineAnchor = /^top/i.test(frameAnchor) ? "top" : /^bottom/i.test(frameAnchor) ? "bottom" : "middle", lineHeight = 1, lineWidth = Infinity, textOverflow, monospace, fontFamily = monospace ? "ui-monospace, monospace" : void 0, fontSize, fontStyle, fontVariant, fontWeight, rotate } = options;
    const [vrotate, crotate] = maybeNumberChannel(rotate, 0);
    const [vfontSize, cfontSize] = maybeFontSizeChannel(fontSize);
    super(data, {
      x: { value: x, scale: "x", optional: true },
      y: { value: y, scale: "y", optional: true },
      fontSize: { value: vfontSize, optional: true },
      rotate: { value: numberChannel(vrotate), optional: true },
      text: { value: text2, filter: nonempty, optional: true }
    }, options, defaults$4);
    this.rotate = crotate;
    this.textAnchor = impliedString(textAnchor, "middle");
    this.lineAnchor = keyword(lineAnchor, "lineAnchor", ["top", "middle", "bottom"]);
    this.lineHeight = +lineHeight;
    this.lineWidth = +lineWidth;
    this.textOverflow = maybeTextOverflow(textOverflow);
    this.monospace = !!monospace;
    this.fontFamily = string(fontFamily);
    this.fontSize = cfontSize;
    this.fontStyle = string(fontStyle);
    this.fontVariant = string(fontVariant);
    this.fontWeight = string(fontWeight);
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
    if (!(this.lineWidth >= 0))
      throw new Error(`invalid lineWidth: ${lineWidth}`);
    this.splitLines = splitter(this);
    this.clipLine = clipper(this);
  }
  render(index2, scales, channels, dimensions, context) {
    const { x, y } = scales;
    const { x: X, y: Y, rotate: R, text: T, title: TL, fontSize: FS } = channels;
    const { rotate } = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    return create("svg:g", context).call(applyIndirectStyles, this, dimensions, context).call(applyIndirectTextStyles, this, T, dimensions).call(applyTransform, this, { x: X && x, y: Y && y }).call((g) => g.selectAll().data(index2).enter().append("text").call(applyDirectStyles, this).call(applyMultilineText, this, T, TL).attr("transform", template`translate(${X ? (i) => X[i] : cx},${Y ? (i) => Y[i] : cy})${R ? (i) => ` rotate(${R[i]})` : rotate ? ` rotate(${rotate})` : ``}`).call(applyAttr, "font-size", FS && ((i) => FS[i])).call(applyChannelStyles, this, channels)).node();
  }
}
function maybeTextOverflow(textOverflow) {
  return textOverflow == null ? null : keyword(textOverflow, "textOverflow", [
    "clip",
    "ellipsis",
    "clip-start",
    "clip-end",
    "ellipsis-start",
    "ellipsis-middle",
    "ellipsis-end"
  ]).replace(/^(clip|ellipsis)$/, "$1-end");
}
function applyMultilineText(selection2, mark, T, TL) {
  if (!T)
    return;
  const { lineAnchor, lineHeight, textOverflow, splitLines, clipLine: clipLine2 } = mark;
  selection2.each(function(i) {
    const lines = splitLines(formatDefault(T[i])).map(clipLine2);
    const n = lines.length;
    const y = lineAnchor === "top" ? 0.71 : lineAnchor === "bottom" ? 1 - n : (164 - n * 100) / 200;
    if (n > 1) {
      for (let i2 = 0; i2 < n; ++i2) {
        if (!lines[i2])
          continue;
        const tspan = this.ownerDocument.createElementNS(namespaces.svg, "tspan");
        tspan.setAttribute("x", 0);
        tspan.setAttribute("y", `${(y + i2) * lineHeight}em`);
        tspan.textContent = lines[i2];
        this.appendChild(tspan);
      }
    } else {
      if (y)
        this.setAttribute("y", `${y * lineHeight}em`);
      this.textContent = lines[0];
    }
    if (textOverflow && !TL && lines[0] !== T[i]) {
      const title = this.ownerDocument.createElementNS(namespaces.svg, "title");
      title.textContent = T[i];
      this.appendChild(title);
    }
  });
}
function text(data, options = {}) {
  let { x, y, ...remainingOptions } = options;
  if (options.frameAnchor === void 0)
    [x, y] = maybeTuple(x, y);
  return new Text(data, { ...remainingOptions, x, y });
}
function textX(data, options = {}) {
  const { x = identity$1, ...remainingOptions } = options;
  return new Text(data, maybeIntervalMidY({ ...remainingOptions, x }));
}
function textY(data, options = {}) {
  const { y = identity$1, ...remainingOptions } = options;
  return new Text(data, maybeIntervalMidX({ ...remainingOptions, y }));
}
function applyIndirectTextStyles(selection2, mark, T) {
  applyAttr(selection2, "text-anchor", mark.textAnchor);
  applyAttr(selection2, "font-family", mark.fontFamily);
  applyAttr(selection2, "font-size", mark.fontSize);
  applyAttr(selection2, "font-style", mark.fontStyle);
  applyAttr(selection2, "font-variant", mark.fontVariant === void 0 ? inferFontVariant$1(T) : mark.fontVariant);
  applyAttr(selection2, "font-weight", mark.fontWeight);
}
function inferFontVariant$1(T) {
  return isNumeric(T) || isTemporal(T) ? "tabular-nums" : void 0;
}
const fontSizes = /* @__PURE__ */ new Set([
  // global keywords
  "inherit",
  "initial",
  "revert",
  "unset",
  // absolute keywords
  "xx-small",
  "x-small",
  "small",
  "medium",
  "large",
  "x-large",
  "xx-large",
  "xxx-large",
  // relative keywords
  "larger",
  "smaller"
]);
function maybeFontSizeChannel(fontSize) {
  if (fontSize == null || typeof fontSize === "number")
    return [void 0, fontSize];
  if (typeof fontSize !== "string")
    return [fontSize, void 0];
  fontSize = fontSize.trim().toLowerCase();
  return fontSizes.has(fontSize) || /^[+-]?\d*\.?\d+(e[+-]?\d+)?(\w*|%)$/.test(fontSize) ? [void 0, fontSize] : [fontSize, void 0];
}
function lineWrap(input, maxWidth, widthof) {
  const lines = [];
  let lineStart, lineEnd = 0;
  for (const [wordStart, wordEnd, required] of lineBreaks(input)) {
    if (lineStart === void 0)
      lineStart = wordStart;
    if (lineEnd > lineStart && widthof(input, lineStart, wordEnd) > maxWidth) {
      lines.push(input.slice(lineStart, lineEnd) + (input[lineEnd - 1] === softHyphen ? "-" : ""));
      lineStart = wordStart;
    }
    if (required) {
      lines.push(input.slice(lineStart, wordEnd));
      lineStart = void 0;
      continue;
    }
    lineEnd = wordEnd;
  }
  return lines;
}
function* lineBreaks(input) {
  let i = 0, j = 0;
  const n = input.length;
  while (j < n) {
    let k2 = 1;
    switch (input[j]) {
      case softHyphen:
      case "-":
        ++j;
        yield [i, j, false];
        i = j;
        break;
      case " ":
        yield [i, j, false];
        while (input[++j] === " ")
          ;
        i = j;
        break;
      case "\r":
        if (input[j + 1] === "\n")
          ++k2;
      case "\n":
        yield [i, j, true];
        j += k2;
        i = j;
        break;
      default:
        ++j;
        break;
    }
  }
  yield [i, j, true];
}
const defaultWidthMap = {
  a: 56,
  b: 63,
  c: 57,
  d: 63,
  e: 58,
  f: 37,
  g: 62,
  h: 60,
  i: 26,
  j: 26,
  k: 55,
  l: 26,
  m: 88,
  n: 60,
  o: 60,
  p: 62,
  q: 62,
  r: 39,
  s: 54,
  t: 38,
  u: 60,
  v: 55,
  w: 79,
  x: 54,
  y: 55,
  z: 55,
  A: 69,
  B: 67,
  C: 73,
  D: 74,
  E: 61,
  F: 58,
  G: 76,
  H: 75,
  I: 28,
  J: 55,
  K: 67,
  L: 58,
  M: 89,
  N: 75,
  O: 78,
  P: 65,
  Q: 78,
  R: 67,
  S: 65,
  T: 65,
  U: 75,
  V: 69,
  W: 98,
  X: 69,
  Y: 67,
  Z: 67,
  0: 64,
  1: 48,
  2: 62,
  3: 64,
  4: 66,
  5: 63,
  6: 65,
  7: 58,
  8: 65,
  9: 65,
  " ": 29,
  "!": 32,
  '"': 49,
  "'": 31,
  "(": 39,
  ")": 39,
  ",": 31,
  "-": 48,
  ".": 31,
  "/": 32,
  ":": 31,
  ";": 31,
  "?": 52,
  "‘": 31,
  "’": 31,
  "“": 47,
  "”": 47,
  "…": 82
};
function defaultWidth(text2, start2 = 0, end = text2.length) {
  let sum2 = 0;
  for (let i = start2; i < end; i = readCharacter(text2, i)) {
    sum2 += defaultWidthMap[text2[i]] ?? (isPictographic(text2, i) ? 120 : defaultWidthMap.e);
  }
  return sum2;
}
function monospaceWidth(text2, start2 = 0, end = text2.length) {
  let sum2 = 0;
  for (let i = start2; i < end; i = readCharacter(text2, i)) {
    sum2 += isPictographic(text2, i) ? 200 : 100;
  }
  return sum2;
}
function splitter({ monospace, lineWidth, textOverflow }) {
  if (textOverflow != null || lineWidth == Infinity)
    return (text2) => text2.split(/\r\n?|\n/g);
  const widthof = monospace ? monospaceWidth : defaultWidth;
  const maxWidth = lineWidth * 100;
  return (text2) => lineWrap(text2, maxWidth, widthof);
}
function clipper({ monospace, lineWidth, textOverflow }) {
  if (textOverflow == null || lineWidth == Infinity)
    return (text2) => text2;
  const widthof = monospace ? monospaceWidth : defaultWidth;
  const maxWidth = lineWidth * 100;
  switch (textOverflow) {
    case "clip-start":
      return (text2) => clipStart(text2, maxWidth, widthof, "");
    case "clip-end":
      return (text2) => clipEnd(text2, maxWidth, widthof, "");
    case "ellipsis-start":
      return (text2) => clipStart(text2, maxWidth, widthof, "…");
    case "ellipsis-middle":
      return (text2) => clipMiddle(text2, maxWidth, widthof, "…");
    case "ellipsis-end":
      return (text2) => clipEnd(text2, maxWidth, widthof, "…");
  }
}
function cut(text2, width, widthof, inset) {
  const I = [];
  let w = 0;
  for (let i = 0, j = 0, n = text2.length; i < n; i = j) {
    j = readCharacter(text2, i);
    const l = widthof(text2, i, j);
    if (w + l > width) {
      w += inset;
      while (w > width && i > 0)
        j = i, i = I.pop(), w -= widthof(text2, i, j);
      return [i, width - w];
    }
    w += l;
    I.push(i);
  }
  return [-1, 0];
}
function clipEnd(text2, width, widthof, ellipsis) {
  text2 = text2.trim();
  const e = widthof(ellipsis);
  const [i] = cut(text2, width, widthof, e);
  return i < 0 ? text2 : text2.slice(0, i).trimEnd() + ellipsis;
}
function clipMiddle(text2, width, widthof, ellipsis) {
  text2 = text2.trim();
  const w = widthof(text2);
  if (w <= width)
    return text2;
  const e = widthof(ellipsis) / 2;
  const [i, ei] = cut(text2, width / 2, widthof, e);
  const [j] = cut(text2, w - width / 2 - ei + e, widthof, -e);
  return j < 0 ? ellipsis : text2.slice(0, i).trimEnd() + ellipsis + text2.slice(readCharacter(text2, j)).trimStart();
}
function clipStart(text2, width, widthof, ellipsis) {
  text2 = text2.trim();
  const w = widthof(text2);
  if (w <= width)
    return text2;
  const e = widthof(ellipsis);
  const [j] = cut(text2, w - width + e, widthof, -e);
  return j < 0 ? ellipsis : ellipsis + text2.slice(readCharacter(text2, j)).trimStart();
}
const reCombiner = /[\p{Combining_Mark}\p{Emoji_Modifier}]+/uy;
const rePictographic = /\p{Extended_Pictographic}/uy;
function readCharacter(text2, i) {
  i += isSurrogatePair(text2, i) ? 2 : 1;
  if (isCombiner(text2, i))
    i = reCombiner.lastIndex;
  if (isZeroWidthJoiner(text2, i))
    return readCharacter(text2, i + 1);
  return i;
}
function isAscii(text2, i) {
  return text2.charCodeAt(i) < 128;
}
function isSurrogatePair(text2, i) {
  const hi = text2.charCodeAt(i);
  if (hi >= 55296 && hi < 56320) {
    const lo = text2.charCodeAt(i + 1);
    return lo >= 56320 && lo < 57344;
  }
  return false;
}
function isZeroWidthJoiner(text2, i) {
  return text2.charCodeAt(i) === 8205;
}
function isCombiner(text2, i) {
  return isAscii(text2, i) ? false : (reCombiner.lastIndex = i, reCombiner.test(text2));
}
function isPictographic(text2, i) {
  return isAscii(text2, i) ? false : (rePictographic.lastIndex = i, rePictographic.test(text2));
}
const defaults$3 = {
  ariaLabel: "vector",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinejoin: "round",
  strokeLinecap: "round"
};
const defaultRadius = 3.5;
const wingRatio = defaultRadius * 5;
const shapeArrow = {
  draw(context, l, r) {
    const wing = l * r / wingRatio;
    context.moveTo(0, 0);
    context.lineTo(0, -l);
    context.moveTo(-wing, wing - l);
    context.lineTo(0, -l);
    context.lineTo(wing, wing - l);
  }
};
const shapeSpike = {
  draw(context, l, r) {
    context.moveTo(-r, 0);
    context.lineTo(0, -l);
    context.lineTo(r, 0);
  }
};
const shapes = /* @__PURE__ */ new Map([
  ["arrow", shapeArrow],
  ["spike", shapeSpike]
]);
function isShapeObject(value) {
  return value && typeof value.draw === "function";
}
function Shape(shape) {
  if (isShapeObject(shape))
    return shape;
  const value = shapes.get(`${shape}`.toLowerCase());
  if (value)
    return value;
  throw new Error(`invalid shape: ${shape}`);
}
class Vector extends Mark {
  constructor(data, options = {}) {
    const { x, y, r = defaultRadius, length: length2, rotate, shape = shapeArrow, anchor = "middle", frameAnchor } = options;
    const [vl, cl] = maybeNumberChannel(length2, 12);
    const [vr, cr] = maybeNumberChannel(rotate, 0);
    super(data, {
      x: { value: x, scale: "x", optional: true },
      y: { value: y, scale: "y", optional: true },
      length: { value: vl, scale: "length", optional: true },
      rotate: { value: vr, optional: true }
    }, options, defaults$3);
    this.r = +r;
    this.length = cl;
    this.rotate = cr;
    this.shape = Shape(shape);
    this.anchor = keyword(anchor, "anchor", ["start", "middle", "end"]);
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
  }
  render(index2, scales, channels, dimensions, context) {
    const { x, y } = scales;
    const { x: X, y: Y, length: L, rotate: A5 } = channels;
    const { length: length2, rotate, anchor, shape, r } = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    return create("svg:g", context).call(applyIndirectStyles, this, dimensions, context).call(applyTransform, this, { x: X && x, y: Y && y }).call((g) => g.selectAll().data(index2).enter().append("path").call(applyDirectStyles, this).attr("transform", template`translate(${X ? (i) => X[i] : cx},${Y ? (i) => Y[i] : cy})${A5 ? (i) => ` rotate(${A5[i]})` : rotate ? ` rotate(${rotate})` : ``}${anchor === "start" ? `` : anchor === "end" ? L ? (i) => ` translate(0,${L[i]})` : ` translate(0,${length2})` : L ? (i) => ` translate(0,${L[i] / 2})` : ` translate(0,${length2 / 2})`}`).attr("d", L ? (i) => {
      const p = pathRound();
      shape.draw(p, L[i], r);
      return p;
    } : (() => {
      const p = pathRound();
      shape.draw(p, length2, r);
      return p;
    })()).call(applyChannelStyles, this, channels)).node();
  }
}
function vectorX(data, options = {}) {
  const { x = identity$1, ...rest } = options;
  return new Vector(data, { ...rest, x });
}
function vectorY(data, options = {}) {
  const { y = identity$1, ...rest } = options;
  return new Vector(data, { ...rest, y });
}
function maybeData(data, options) {
  if (arguments.length < 2 && !isIterable(data))
    options = data, data = null;
  if (options === void 0)
    options = {};
  return [data, options];
}
function maybeAnchor({ anchor } = {}, anchors) {
  return anchor === void 0 ? anchors[0] : keyword(anchor, "anchor", anchors);
}
function anchorY(options) {
  return maybeAnchor(options, ["left", "right"]);
}
function anchorFy(options) {
  return maybeAnchor(options, ["right", "left"]);
}
function anchorX(options) {
  return maybeAnchor(options, ["bottom", "top"]);
}
function anchorFx(options) {
  return maybeAnchor(options, ["top", "bottom"]);
}
function axisY() {
  const [data, options] = maybeData(...arguments);
  return axisKy("y", anchorY(options), data, options);
}
function axisFy() {
  const [data, options] = maybeData(...arguments);
  return axisKy("fy", anchorFy(options), data, options);
}
function axisX() {
  const [data, options] = maybeData(...arguments);
  return axisKx("x", anchorX(options), data, options);
}
function axisFx() {
  const [data, options] = maybeData(...arguments);
  return axisKx("fx", anchorFx(options), data, options);
}
function axisKy(k2, anchor, data, { color: color2 = "currentColor", opacity: opacity2 = 1, stroke = color2, strokeOpacity = opacity2, strokeWidth = 1, fill = color2, fillOpacity = opacity2, textAnchor, textStroke, textStrokeOpacity, textStrokeWidth, tickSize = k2 === "y" ? 6 : 0, tickPadding, tickRotate, x, marginTop = 20, marginRight = anchor === "right" ? 40 : 0, marginBottom = 20, marginLeft = anchor === "left" ? 40 : 0, label, labelOffset, labelAnchor, ...options }) {
  tickSize = number(tickSize);
  tickPadding = number(tickPadding);
  tickRotate = number(tickRotate);
  if (labelAnchor !== void 0)
    labelAnchor = keyword(labelAnchor, "labelAnchor", ["center", "top", "bottom"]);
  return marks(tickSize && !isNoneish(stroke) ? axisTickKy(k2, anchor, data, {
    stroke,
    strokeOpacity,
    strokeWidth,
    tickSize,
    tickPadding,
    tickRotate,
    x,
    ...options
  }) : null, !isNoneish(fill) ? axisTextKy(k2, anchor, data, {
    fill,
    fillOpacity,
    stroke: textStroke,
    strokeOpacity: textStrokeOpacity,
    strokeWidth: textStrokeWidth,
    textAnchor,
    tickSize,
    tickPadding,
    tickRotate,
    x,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    ...options
  }) : null, !isNoneish(fill) && label !== null ? text([], {
    fill,
    fillOpacity,
    ...options,
    lineWidth: void 0,
    textOverflow: void 0,
    facet: "super",
    x: null,
    y: null,
    initializer: function(data2, facets, channels, scales, dimensions) {
      const scale = scales[k2];
      const { marginTop: marginTop2, marginRight: marginRight2, marginBottom: marginBottom2, marginLeft: marginLeft2 } = k2 === "y" && dimensions.inset || dimensions;
      const cla = labelAnchor ?? (scale.bandwidth ? "center" : "top");
      const clo = labelOffset ?? (anchor === "right" ? marginRight2 : marginLeft2) - 3;
      if (cla === "center") {
        this.textAnchor = void 0;
        this.lineAnchor = anchor === "right" ? "bottom" : "top";
        this.frameAnchor = anchor;
        this.rotate = -90;
      } else {
        this.textAnchor = anchor === "right" ? "end" : "start";
        this.lineAnchor = cla;
        this.frameAnchor = `${cla}-${anchor}`;
        this.rotate = 0;
      }
      this.dy = cla === "top" ? 3 - marginTop2 : cla === "bottom" ? marginBottom2 - 3 : 0;
      this.dx = anchor === "right" ? clo : -clo;
      this.ariaLabel = `${k2}-axis label`;
      return {
        facets: [[0]],
        channels: {
          text: {
            value: [label === void 0 ? inferAxisLabel(k2, scale, cla) : label]
          }
        }
      };
    }
  }) : null);
}
function axisKx(k2, anchor, data, { color: color2 = "currentColor", opacity: opacity2 = 1, stroke = color2, strokeOpacity = opacity2, strokeWidth = 1, fill = color2, fillOpacity = opacity2, textAnchor, textStroke, textStrokeOpacity, textStrokeWidth, tickSize = k2 === "x" ? 6 : 0, tickPadding, tickRotate, y, marginTop = anchor === "top" ? 30 : 0, marginRight = 20, marginBottom = anchor === "bottom" ? 30 : 0, marginLeft = 20, label, labelAnchor, labelOffset, ...options }) {
  tickSize = number(tickSize);
  tickPadding = number(tickPadding);
  tickRotate = number(tickRotate);
  if (labelAnchor !== void 0)
    labelAnchor = keyword(labelAnchor, "labelAnchor", ["center", "left", "right"]);
  return marks(tickSize && !isNoneish(stroke) ? axisTickKx(k2, anchor, data, {
    stroke,
    strokeOpacity,
    strokeWidth,
    tickSize,
    tickPadding,
    tickRotate,
    y,
    ...options
  }) : null, !isNoneish(fill) ? axisTextKx(k2, anchor, data, {
    fill,
    fillOpacity,
    stroke: textStroke,
    strokeOpacity: textStrokeOpacity,
    strokeWidth: textStrokeWidth,
    textAnchor,
    tickSize,
    tickPadding,
    tickRotate,
    y,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    ...options
  }) : null, !isNoneish(fill) && label !== null ? text([], {
    fill,
    fillOpacity,
    ...options,
    lineWidth: void 0,
    textOverflow: void 0,
    facet: "super",
    x: null,
    y: null,
    initializer: function(data2, facets, channels, scales, dimensions) {
      const scale = scales[k2];
      const { marginTop: marginTop2, marginRight: marginRight2, marginBottom: marginBottom2, marginLeft: marginLeft2 } = k2 === "x" && dimensions.inset || dimensions;
      const cla = labelAnchor ?? (scale.bandwidth ? "center" : "right");
      const clo = labelOffset ?? (anchor === "top" ? marginTop2 : marginBottom2) - 3;
      if (cla === "center") {
        this.frameAnchor = anchor;
        this.textAnchor = void 0;
      } else {
        this.frameAnchor = `${anchor}-${cla}`;
        this.textAnchor = cla === "right" ? "end" : "start";
      }
      this.lineAnchor = anchor;
      this.dy = anchor === "top" ? -clo : clo;
      this.dx = cla === "right" ? marginRight2 - 3 : cla === "left" ? 3 - marginLeft2 : 0;
      this.ariaLabel = `${k2}-axis label`;
      return {
        facets: [[0]],
        channels: {
          text: {
            value: [label === void 0 ? inferAxisLabel(k2, scale, cla) : label]
          }
        }
      };
    }
  }) : null);
}
function axisTickKy(k2, anchor, data, { strokeWidth = 1, strokeLinecap = null, strokeLinejoin = null, facetAnchor = anchor + (k2 === "y" ? "-empty" : ""), frameAnchor = anchor, tickSize, inset = 0, insetLeft = inset, insetRight = inset, dx = 0, y = k2 === "y" ? void 0 : null, ...options }) {
  return axisMark(vectorY, k2, `${k2}-axis tick`, data, {
    strokeWidth,
    strokeLinecap,
    strokeLinejoin,
    facetAnchor,
    frameAnchor,
    y,
    ...options,
    dx: anchor === "left" ? +dx - offset + +insetLeft : +dx + offset - insetRight,
    anchor: "start",
    length: tickSize,
    shape: anchor === "left" ? shapeTickLeft : shapeTickRight
  });
}
function axisTickKx(k2, anchor, data, { strokeWidth = 1, strokeLinecap = null, strokeLinejoin = null, facetAnchor = anchor + (k2 === "x" ? "-empty" : ""), frameAnchor = anchor, tickSize, inset = 0, insetTop = inset, insetBottom = inset, dy = 0, x = k2 === "x" ? void 0 : null, ...options }) {
  return axisMark(vectorX, k2, `${k2}-axis tick`, data, {
    strokeWidth,
    strokeLinejoin,
    strokeLinecap,
    facetAnchor,
    frameAnchor,
    x,
    ...options,
    dy: anchor === "bottom" ? +dy - offset - insetBottom : +dy + offset + +insetTop,
    anchor: "start",
    length: tickSize,
    shape: anchor === "bottom" ? shapeTickBottom : shapeTickTop
  });
}
function axisTextKy(k2, anchor, data, { facetAnchor = anchor + (k2 === "y" ? "-empty" : ""), frameAnchor = anchor, tickSize, tickRotate = 0, tickPadding = Math.max(3, 9 - tickSize) + (Math.abs(tickRotate) > 60 ? 4 * Math.cos(tickRotate * radians) : 0), tickFormat: tickFormat2, text: text2 = typeof tickFormat2 === "function" ? tickFormat2 : void 0, textAnchor = Math.abs(tickRotate) > 60 ? "middle" : anchor === "left" ? "end" : "start", lineAnchor = tickRotate > 60 ? "top" : tickRotate < -60 ? "bottom" : "middle", fontVariant, inset = 0, insetLeft = inset, insetRight = inset, dx = 0, y = k2 === "y" ? void 0 : null, ...options }) {
  return axisMark(textY, k2, `${k2}-axis tick label`, data, {
    facetAnchor,
    frameAnchor,
    text: text2 === void 0 ? null : text2,
    textAnchor,
    lineAnchor,
    fontVariant,
    rotate: tickRotate,
    y,
    ...options,
    dx: anchor === "left" ? +dx - tickSize - tickPadding + +insetLeft : +dx + +tickSize + +tickPadding - insetRight
  }, function(scale, ticks2, channels) {
    if (fontVariant === void 0)
      this.fontVariant = inferFontVariant(scale);
    if (text2 === void 0)
      channels.text = inferTextChannel(scale, ticks2, tickFormat2);
  });
}
function axisTextKx(k2, anchor, data, { facetAnchor = anchor + (k2 === "x" ? "-empty" : ""), frameAnchor = anchor, tickSize, tickRotate = 0, tickPadding = Math.max(3, 9 - tickSize) + (Math.abs(tickRotate) >= 10 ? 4 * Math.cos(tickRotate * radians) : 0), tickFormat: tickFormat2, text: text2 = typeof tickFormat2 === "function" ? tickFormat2 : void 0, textAnchor = Math.abs(tickRotate) >= 10 ? tickRotate < 0 ^ anchor === "bottom" ? "start" : "end" : "middle", lineAnchor = Math.abs(tickRotate) >= 10 ? "middle" : anchor === "bottom" ? "top" : "bottom", fontVariant, inset = 0, insetTop = inset, insetBottom = inset, dy = 0, x = k2 === "x" ? void 0 : null, ...options }) {
  return axisMark(textX, k2, `${k2}-axis tick label`, data, {
    facetAnchor,
    frameAnchor,
    text: text2 === void 0 ? null : text2,
    textAnchor,
    lineAnchor,
    fontVariant,
    rotate: tickRotate,
    x,
    ...options,
    dy: anchor === "bottom" ? +dy + +tickSize + +tickPadding - insetBottom : +dy - tickSize - tickPadding + +insetTop
  }, function(scale, ticks2, channels) {
    if (fontVariant === void 0)
      this.fontVariant = inferFontVariant(scale);
    if (text2 === void 0)
      channels.text = inferTextChannel(scale, ticks2, tickFormat2);
  });
}
function gridY() {
  const [data, options] = maybeData(...arguments);
  return gridKy("y", anchorY(options), data, options);
}
function gridFy() {
  const [data, options] = maybeData(...arguments);
  return gridKy("fy", anchorFy(options), data, options);
}
function gridX() {
  const [data, options] = maybeData(...arguments);
  return gridKx("x", anchorX(options), data, options);
}
function gridFx() {
  const [data, options] = maybeData(...arguments);
  return gridKx("fx", anchorFx(options), data, options);
}
function gridKy(k2, anchor, data, { y = k2 === "y" ? void 0 : null, x = null, x1: x12 = anchor === "left" ? x : null, x2 = anchor === "right" ? x : null, ...options }) {
  return axisMark(ruleY, k2, `${k2}-grid`, data, { y, x1: x12, x2, ...gridDefaults(options) });
}
function gridKx(k2, anchor, data, { x = k2 === "x" ? void 0 : null, y = null, y1: y12 = anchor === "top" ? y : null, y2 = anchor === "bottom" ? y : null, ...options }) {
  return axisMark(ruleX, k2, `${k2}-grid`, data, { x, y1: y12, y2, ...gridDefaults(options) });
}
function gridDefaults({ color: color2 = "currentColor", opacity: opacity2 = 0.1, stroke = color2, strokeOpacity = opacity2, strokeWidth = 1, ...options }) {
  return { stroke, strokeOpacity, strokeWidth, ...options };
}
function axisMark(mark, k2, ariaLabel, data, options, initialize) {
  let channels;
  const m = mark(data, initializer(options, function(data2, facets, _channels, scales) {
    const { [k2]: scale } = scales;
    if (!scale)
      throw new Error(`missing scale: ${k2}`);
    let { ticks: ticks2, tickSpacing, interval: interval2 } = options;
    if (isTemporalScale(scale) && typeof ticks2 === "string")
      interval2 = ticks2, ticks2 = void 0;
    if (data2 == null) {
      if (isIterable(ticks2)) {
        data2 = arrayify(ticks2);
      } else if (scale.ticks) {
        if (ticks2 !== void 0) {
          data2 = scale.ticks(ticks2);
        } else {
          interval2 = maybeInterval(interval2 === void 0 ? scale.interval : interval2, scale.type);
          if (interval2 !== void 0) {
            const [min2, max2] = extent$1(scale.domain());
            data2 = interval2.range(min2, interval2.offset(interval2.floor(max2)));
          } else {
            const [min2, max2] = extent$1(scale.range());
            ticks2 = (max2 - min2) / (tickSpacing === void 0 ? k2 === "x" ? 80 : 35 : tickSpacing);
            data2 = scale.ticks(ticks2);
          }
        }
      } else {
        data2 = scale.domain();
      }
      if (k2 === "y" || k2 === "x") {
        facets = [range(data2)];
      } else {
        channels[k2] = { scale: k2, value: identity$1 };
        facets = void 0;
      }
    }
    initialize == null ? void 0 : initialize.call(this, scale, ticks2, channels);
    return {
      data: data2,
      facets,
      channels: Object.fromEntries(Object.entries(channels).map(([name, channel]) => [name, { ...channel, value: valueof(data2, channel.value) }]))
    };
  }));
  if (data == null) {
    channels = m.channels;
    m.channels = {};
  } else {
    channels = {};
  }
  m.ariaLabel = ariaLabel;
  return m;
}
function inferTextChannel(scale, ticks2, tickFormat2) {
  return { value: inferTickFormat(scale, ticks2, tickFormat2) };
}
function inferTickFormat(scale, ticks2, tickFormat2) {
  return scale.tickFormat ? scale.tickFormat(isIterable(ticks2) ? null : ticks2, tickFormat2) : tickFormat2 === void 0 ? formatDefault : typeof tickFormat2 === "string" ? (isTemporal(scale.domain()) ? utcFormat : format$1)(tickFormat2) : constant(tickFormat2);
}
const shapeTickBottom = {
  draw(context, l) {
    context.moveTo(0, 0);
    context.lineTo(0, l);
  }
};
const shapeTickTop = {
  draw(context, l) {
    context.moveTo(0, 0);
    context.lineTo(0, -l);
  }
};
const shapeTickLeft = {
  draw(context, l) {
    context.moveTo(0, 0);
    context.lineTo(-l, 0);
  }
};
const shapeTickRight = {
  draw(context, l) {
    context.moveTo(0, 0);
    context.lineTo(l, 0);
  }
};
function inferFontVariant(scale) {
  return scale.bandwidth && scale.interval === void 0 ? void 0 : "tabular-nums";
}
function inferScaleOrder(scale) {
  return Math.sign(orderof(scale.domain())) * Math.sign(orderof(scale.range()));
}
function inferAxisLabel(key, scale, labelAnchor) {
  const label = scale.label;
  if (scale.bandwidth || !(label == null ? void 0 : label.inferred))
    return label;
  const order = inferScaleOrder(scale);
  return order ? key === "x" || labelAnchor === "center" ? key === "x" === order < 0 ? `← ${label}` : `${label} →` : `${order < 0 ? "↑ " : "↓ "}${label}` : label;
}
const defaults$2 = {
  ariaLabel: "frame",
  fill: "none",
  stroke: "currentColor"
};
const lineDefaults = {
  ariaLabel: "frame",
  fill: null,
  stroke: "currentColor",
  strokeLinecap: "square"
};
class Frame extends Mark {
  constructor(options = {}) {
    const { anchor = null, inset = 0, insetTop = inset, insetRight = inset, insetBottom = inset, insetLeft = inset, rx, ry } = options;
    super(void 0, void 0, options, anchor == null ? defaults$2 : lineDefaults);
    this.anchor = maybeKeyword(anchor, "anchor", ["top", "right", "bottom", "left"]);
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
    this.rx = number(rx);
    this.ry = number(ry);
  }
  render(index2, scales, channels, dimensions, context) {
    const { marginTop, marginRight, marginBottom, marginLeft, width, height } = dimensions;
    const { anchor, insetTop, insetRight, insetBottom, insetLeft, rx, ry } = this;
    const x12 = marginLeft + insetLeft;
    const x2 = width - marginRight - insetRight;
    const y12 = marginTop + insetTop;
    const y2 = height - marginBottom - insetBottom;
    return create(anchor ? "svg:line" : "svg:rect", context).call(applyIndirectStyles, this, dimensions, context).call(applyDirectStyles, this).call(applyTransform, this, {}).call(anchor === "left" ? (line) => line.attr("x1", x12).attr("x2", x12).attr("y1", y12).attr("y2", y2) : anchor === "right" ? (line) => line.attr("x1", x2).attr("x2", x2).attr("y1", y12).attr("y2", y2) : anchor === "top" ? (line) => line.attr("x1", x12).attr("x2", x2).attr("y1", y12).attr("y2", y12) : anchor === "bottom" ? (line) => line.attr("x1", x12).attr("x2", x2).attr("y1", y2).attr("y2", y2) : (rect) => rect.attr("x", x12).attr("y", y12).attr("width", x2 - x12).attr("height", y2 - y12).attr("rx", rx).attr("ry", ry)).node();
  }
}
function frame(options) {
  return new Frame(options);
}
function plot(options = {}) {
  const { facet, style, caption, ariaLabel, ariaDescription } = options;
  const className = maybeClassName(options.className);
  const marks2 = options.marks === void 0 ? [] : flatMarks(options.marks);
  const topFacetState = maybeTopFacet(facet, options);
  const facetStateByMark = /* @__PURE__ */ new Map();
  for (const mark of marks2) {
    const facetState = maybeMarkFacet(mark, topFacetState, options);
    if (facetState)
      facetStateByMark.set(mark, facetState);
  }
  const channelsByScale = /* @__PURE__ */ new Map();
  if (topFacetState)
    addScaleChannels(channelsByScale, [topFacetState]);
  addScaleChannels(channelsByScale, facetStateByMark);
  const axes = flatMarks(inferAxes(marks2, channelsByScale, options));
  for (const mark of axes) {
    const facetState = maybeMarkFacet(mark, topFacetState, options);
    if (facetState)
      facetStateByMark.set(mark, facetState);
  }
  marks2.unshift(...axes);
  const facets = Facets(channelsByScale, options);
  if (facets !== void 0) {
    const topFacetsIndex = topFacetState ? facetFilter(facets, topFacetState) : void 0;
    for (const mark of marks2) {
      if (mark.facet === null || mark.facet === "super")
        continue;
      const facetState = facetStateByMark.get(mark);
      if (facetState === void 0)
        continue;
      facetState.facetsIndex = mark.fx != null || mark.fy != null ? facetFilter(facets, facetState) : topFacetsIndex;
    }
    const nonEmpty = /* @__PURE__ */ new Set();
    for (const { facetsIndex } of facetStateByMark.values()) {
      facetsIndex == null ? void 0 : facetsIndex.forEach((index2, i) => {
        if ((index2 == null ? void 0 : index2.length) > 0) {
          nonEmpty.add(i);
        }
      });
    }
    facets.forEach(0 < nonEmpty.size && nonEmpty.size < facets.length ? (f, i) => f.empty = !nonEmpty.has(i) : (f) => f.empty = false);
    for (const mark of marks2) {
      if (mark.facet === "exclude") {
        const facetState = facetStateByMark.get(mark);
        if (facetState !== void 0)
          facetState.facetsIndex = facetExclude(facetState.facetsIndex);
      }
    }
  }
  for (const key of registry.keys()) {
    if (isScaleOptions(options[key]) && key !== "fx" && key !== "fy") {
      channelsByScale.set(key, []);
    }
  }
  const stateByMark = /* @__PURE__ */ new Map();
  for (const mark of marks2) {
    if (stateByMark.has(mark))
      throw new Error("duplicate mark; each mark must be unique");
    const { facetsIndex, channels: facetChannels } = facetStateByMark.get(mark) ?? {};
    const { data, facets: facets2, channels } = mark.initialize(facetsIndex, facetChannels);
    applyScaleTransforms(channels, options);
    stateByMark.set(mark, { data, facets: facets2, channels });
  }
  const scaleDescriptors = Scales(addScaleChannels(channelsByScale, stateByMark), options);
  const scales = ScaleFunctions(scaleDescriptors);
  const dimensions = Dimensions(scaleDescriptors, marks2, options);
  autoScaleRange(scaleDescriptors, dimensions);
  const { fx, fy } = scales;
  const subdimensions = fx || fy ? innerDimensions(scaleDescriptors, dimensions) : dimensions;
  const superdimensions = fx || fy ? actualDimensions(scales, dimensions) : dimensions;
  const context = Context(options, subdimensions);
  const newByScale = /* @__PURE__ */ new Set();
  for (const [mark, state] of stateByMark) {
    if (mark.initializer != null) {
      const dimensions2 = mark.facet === "super" ? superdimensions : subdimensions;
      const update = mark.initializer(state.data, state.facets, state.channels, scales, dimensions2, context);
      if (update.data !== void 0) {
        state.data = update.data;
      }
      if (update.facets !== void 0) {
        state.facets = update.facets;
      }
      if (update.channels !== void 0) {
        inferChannelScales(update.channels);
        Object.assign(state.channels, update.channels);
        for (const channel of Object.values(update.channels)) {
          const { scale } = channel;
          if (scale != null && registry.get(scale) !== position) {
            applyScaleTransform(channel, options);
            newByScale.add(scale);
          }
        }
        const { fx: fx2, fy: fy2 } = update.channels;
        if (fx2 != null || fy2 != null) {
          const facetState = facetStateByMark.get(mark) ?? { channels: {} };
          if (fx2 != null)
            facetState.channels.fx = fx2;
          if (fy2 != null)
            facetState.channels.fy = fy2;
          facetState.groups = facetGroups(state.data, facetState.channels);
          facetState.facetsIndex = state.facets = facetFilter(facets, facetState);
          facetStateByMark.set(mark, facetState);
        }
      }
    }
  }
  if (newByScale.size) {
    const newChannelsByScale = /* @__PURE__ */ new Map();
    addScaleChannels(newChannelsByScale, stateByMark, (key) => newByScale.has(key));
    addScaleChannels(channelsByScale, stateByMark, (key) => newByScale.has(key));
    const newScaleDescriptors = inheritScaleLabels(Scales(newChannelsByScale, options), scaleDescriptors);
    const newScales = ScaleFunctions(newScaleDescriptors);
    Object.assign(scaleDescriptors, newScaleDescriptors);
    Object.assign(scales, newScales);
  }
  for (const [mark, state] of stateByMark) {
    state.values = mark.scale(state.channels, scales, context);
  }
  const { width, height } = dimensions;
  const svg = create("svg", context).attr("class", className).attr("fill", "currentColor").attr("font-family", "system-ui, sans-serif").attr("font-size", 10).attr("text-anchor", "middle").attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`).attr("aria-label", ariaLabel).attr("aria-description", ariaDescription).call((svg2) => svg2.append("style").text(`
        .${className} {
          display: block;
          background: white;
          height: auto;
          height: intrinsic;
          max-width: 100%;
        }
        .${className} text,
        .${className} tspan {
          white-space: pre;
        }
      `)).call(applyInlineStyles, style).node();
  if (facets !== void 0) {
    const facetDomains = { x: fx == null ? void 0 : fx.domain(), y: fy == null ? void 0 : fy.domain() };
    facets.sort(facetOrder(facetDomains));
    select(svg).selectAll().data(facets).enter().append("g").attr("aria-label", "facet").attr("transform", facetTranslate(fx, fy, dimensions)).each(function(f) {
      var _a;
      let empty2 = true;
      for (const mark of marks2) {
        if (mark.facet === "super")
          continue;
        const { channels, values: values2, facets: indexes } = stateByMark.get(mark);
        if (!(((_a = mark.facetAnchor) == null ? void 0 : _a.call(mark, facets, facetDomains, f)) ?? !f.empty))
          continue;
        let index2 = null;
        if (indexes) {
          index2 = indexes[facetStateByMark.has(mark) ? f.i : 0];
          index2 = mark.filter(index2, channels, values2);
          if (index2.length === 0)
            continue;
          index2.fi = f.i;
        }
        const node = mark.render(index2, scales, values2, subdimensions, context);
        if (node == null)
          continue;
        empty2 = false;
        this.appendChild(node);
      }
      if (empty2)
        this.remove();
    });
  }
  for (const mark of marks2) {
    if (facets !== void 0 && mark.facet !== "super")
      continue;
    const { channels, values: values2, facets: indexes } = stateByMark.get(mark);
    let index2 = null;
    if (indexes) {
      index2 = indexes[0];
      index2 = mark.filter(index2, channels, values2);
      if (index2.length === 0)
        continue;
    }
    const node = mark.render(index2, scales, values2, superdimensions, context);
    if (node != null)
      svg.appendChild(node);
  }
  let figure = svg;
  const legends = Legends(scaleDescriptors, context, options);
  if (caption != null || legends.length > 0) {
    const { document: document2 } = context;
    figure = document2.createElement("figure");
    figure.style.maxWidth = "initial";
    for (const legend of legends)
      figure.appendChild(legend);
    figure.appendChild(svg);
    if (caption != null) {
      const figcaption = document2.createElement("figcaption");
      figcaption.appendChild(caption instanceof Node ? caption : document2.createTextNode(caption));
      figure.appendChild(figcaption);
    }
  }
  figure.scale = exposeScales(scaleDescriptors);
  figure.legend = exposeLegends(scaleDescriptors, context, options);
  const w = consumeWarnings();
  if (w > 0) {
    select(svg).append("text").attr("x", width).attr("y", 20).attr("dy", "-1em").attr("text-anchor", "end").attr("font-family", "initial").text("⚠️").append("title").text(`${w.toLocaleString("en-US")} warning${w === 1 ? "" : "s"}. Please check the console.`);
  }
  return figure;
}
function plotThis({ marks: marks2 = [], ...options } = {}) {
  return plot({ ...options, marks: [...marks2, this] });
}
Mark.prototype.plot = plotThis;
function flatMarks(marks2) {
  return marks2.flat(Infinity).filter((mark) => mark != null).map(markify);
}
function markify(mark) {
  return typeof mark.render === "function" ? mark : new Render(mark);
}
class Render extends Mark {
  constructor(render) {
    if (typeof render !== "function")
      throw new TypeError("invalid mark; missing render function");
    super();
    this.render = render;
  }
  render() {
  }
}
function applyScaleTransforms(channels, options) {
  for (const name in channels)
    applyScaleTransform(channels[name], options);
  return channels;
}
function applyScaleTransform(channel, options) {
  var _a;
  const { scale } = channel;
  if (scale == null)
    return;
  const { type, percent, interval: interval2, transform = percent ? (x) => x * 100 : (_a = maybeInterval(interval2, type)) == null ? void 0 : _a.floor } = options[scale] ?? {};
  if (transform != null)
    channel.value = map(channel.value, transform);
}
function inferChannelScales(channels) {
  for (const name in channels) {
    inferChannelScale(name, channels[name]);
  }
}
function addScaleChannels(channelsByScale, stateByMark, filter2 = yes) {
  for (const { channels } of stateByMark.values()) {
    for (const name in channels) {
      const channel = channels[name];
      const { scale } = channel;
      if (scale != null && filter2(scale)) {
        const scaleChannels = channelsByScale.get(scale);
        if (scaleChannels !== void 0)
          scaleChannels.push(channel);
        else
          channelsByScale.set(scale, [channel]);
      }
    }
  }
  return channelsByScale;
}
function maybeTopFacet(facet, options) {
  if (facet == null)
    return;
  const { x, y } = facet;
  if (x == null && y == null)
    return;
  const data = arrayify(facet.data ?? x ?? y);
  if (data === void 0)
    throw new Error(`missing facet data`);
  const channels = {};
  if (x != null)
    channels.fx = Channel(data, { value: x, scale: "fx" });
  if (y != null)
    channels.fy = Channel(data, { value: y, scale: "fy" });
  applyScaleTransforms(channels, options);
  const groups2 = facetGroups(data, channels);
  return { channels, groups: groups2, data: facet.data };
}
function maybeMarkFacet(mark, topFacetState, options) {
  var _a;
  if (mark.facet === null || mark.facet === "super")
    return;
  const { fx, fy } = mark;
  if (fx != null || fy != null) {
    const data2 = arrayify(mark.data ?? fx ?? fy);
    if (data2 === void 0)
      throw new Error(`missing facet data in ${mark.ariaLabel}`);
    if (data2 === null)
      return;
    const channels2 = {};
    if (fx != null)
      channels2.fx = Channel(data2, { value: fx, scale: "fx" });
    if (fy != null)
      channels2.fy = Channel(data2, { value: fy, scale: "fy" });
    applyScaleTransforms(channels2, options);
    return { channels: channels2, groups: facetGroups(data2, channels2) };
  }
  if (topFacetState === void 0)
    return;
  const { channels, groups: groups2, data } = topFacetState;
  if (mark.facet !== "auto" || mark.data === data)
    return { channels, groups: groups2 };
  if ((groups2.size > 1 || groups2.size === 1 && channels.fx && channels.fy && [...groups2][0][1].size > 1) && ((_a = arrayify(mark.data)) == null ? void 0 : _a.length) === data.length) {
    warn(`Warning: the ${mark.ariaLabel} mark appears to use faceted data, but isn’t faceted. The mark data has the same length as the facet data and the mark facet option is "auto", but the mark data and facet data are distinct. If this mark should be faceted, set the mark facet option to true; otherwise, suppress this warning by setting the mark facet option to false.`);
  }
}
function inferAxes(marks2, channelsByScale, options) {
  let { projection: projection2, x = {}, y = {}, fx = {}, fy = {}, axis: axis2, grid, facet = {}, facet: { axis: facetAxis = axis2, grid: facetGrid } = facet, x: { axis: xAxis = axis2, grid: xGrid = xAxis === null ? null : grid } = x, y: { axis: yAxis = axis2, grid: yGrid = yAxis === null ? null : grid } = y, fx: { axis: fxAxis = facetAxis, grid: fxGrid = fxAxis === null ? null : facetGrid } = fx, fy: { axis: fyAxis = facetAxis, grid: fyGrid = fyAxis === null ? null : facetGrid } = fy } = options;
  if (projection2 || !isScaleOptions(x) && !hasScaleChannel("x", marks2))
    xAxis = xGrid = null;
  if (projection2 || !isScaleOptions(y) && !hasScaleChannel("y", marks2))
    yAxis = yGrid = null;
  if (!channelsByScale.has("fx"))
    fxAxis = fxGrid = null;
  if (!channelsByScale.has("fy"))
    fyAxis = fyGrid = null;
  if (xAxis === void 0)
    xAxis = !hasAxis(marks2, "x");
  if (yAxis === void 0)
    yAxis = !hasAxis(marks2, "y");
  if (fxAxis === void 0)
    fxAxis = !hasAxis(marks2, "fx");
  if (fyAxis === void 0)
    fyAxis = !hasAxis(marks2, "fy");
  if (xAxis === true)
    xAxis = "bottom";
  if (yAxis === true)
    yAxis = "left";
  if (fxAxis === true)
    fxAxis = xAxis === "top" || xAxis === null ? "bottom" : "top";
  if (fyAxis === true)
    fyAxis = yAxis === "right" || yAxis === null ? "left" : "right";
  const axes = [];
  maybeGrid(axes, fyGrid, gridFy, fy);
  maybeAxis(axes, fyAxis, axisFy, "right", "left", facet, fy);
  maybeGrid(axes, fxGrid, gridFx, fx);
  maybeAxis(axes, fxAxis, axisFx, "top", "bottom", facet, fx);
  maybeGrid(axes, yGrid, gridY, y);
  maybeAxis(axes, yAxis, axisY, "left", "right", options, y);
  maybeGrid(axes, xGrid, gridX, x);
  maybeAxis(axes, xAxis, axisX, "bottom", "top", options, x);
  return axes;
}
function maybeAxis(axes, axis2, axisType, primary, secondary, defaults2, options) {
  if (!axis2)
    return;
  const both = isBoth(axis2);
  options = axisOptions(both ? primary : axis2, defaults2, options);
  const { line } = options;
  if ((axisType === axisY || axisType === axisX) && line && !isNone(line))
    axes.push(frame(lineOptions(options)));
  axes.push(axisType(options));
  if (both)
    axes.push(axisType({ ...options, anchor: secondary, label: null }));
}
function maybeGrid(axes, grid, gridType, options) {
  if (!grid || isNone(grid))
    return;
  axes.push(gridType(gridOptions(grid, options)));
}
function isBoth(value) {
  return /^\s*both\s*$/i.test(value);
}
function axisOptions(anchor, defaults2, { line = defaults2.line, ticks: ticks2, tickSize, tickSpacing, tickPadding, tickFormat: tickFormat2, tickRotate, fontVariant, ariaLabel, ariaDescription, label = defaults2.label, labelAnchor, labelOffset }) {
  return {
    anchor,
    line,
    ticks: ticks2,
    tickSize,
    tickSpacing,
    tickPadding,
    tickFormat: tickFormat2,
    tickRotate,
    fontVariant,
    ariaLabel,
    ariaDescription,
    label,
    labelAnchor,
    labelOffset
  };
}
function lineOptions(options) {
  const { anchor, line } = options;
  return { anchor, facetAnchor: anchor + "-empty", stroke: line === true ? void 0 : line };
}
function gridOptions(grid, { stroke = isColor(grid) ? grid : void 0, ticks: ticks2 = isGridTicks(grid) ? grid : void 0, tickSpacing, ariaLabel, ariaDescription }) {
  return {
    stroke,
    ticks: ticks2,
    tickSpacing,
    ariaLabel,
    ariaDescription
  };
}
function isGridTicks(grid) {
  switch (typeof grid) {
    case "number":
      return true;
    case "string":
      return !isColor(grid);
  }
  return isIterable(grid) || typeof (grid == null ? void 0 : grid.range) === "function";
}
function hasAxis(marks2, k2) {
  const prefix = `${k2}-axis `;
  return marks2.some((m) => {
    var _a;
    return (_a = m.ariaLabel) == null ? void 0 : _a.startsWith(prefix);
  });
}
function hasScaleChannel(k2, marks2) {
  for (const mark of marks2) {
    for (const key in mark.channels) {
      if (mark.channels[key].scale === k2) {
        return true;
      }
    }
  }
  return false;
}
function inheritScaleLabels(newScales, scales) {
  for (const key in newScales) {
    const newScale = newScales[key];
    const scale = scales[key];
    if (newScale.label === void 0 && scale) {
      newScale.label = scale.label;
    }
  }
  return newScales;
}
function actualDimensions({ fx, fy }, dimensions) {
  const { marginTop, marginRight, marginBottom, marginLeft, width, height } = outerDimensions(dimensions);
  const fxr = fx && outerRange(fx);
  const fyr = fy && outerRange(fy);
  return {
    marginTop: fy ? fyr[0] : marginTop,
    marginRight: fx ? width - fxr[1] : marginRight,
    marginBottom: fy ? height - fyr[1] : marginBottom,
    marginLeft: fx ? fxr[0] : marginLeft,
    // Some marks, namely the x- and y-axis labels, want to know what the
    // desired (rather than actual) margins are for positioning.
    inset: {
      marginTop: dimensions.marginTop,
      marginRight: dimensions.marginRight,
      marginBottom: dimensions.marginBottom,
      marginLeft: dimensions.marginLeft
    },
    width,
    height
  };
}
function outerRange(scale) {
  const domain = scale.domain();
  let x12 = scale(domain[0]);
  let x2 = scale(domain[domain.length - 1]);
  if (x2 < x12)
    [x12, x2] = [x2, x12];
  return [x12, x2 + scale.bandwidth()];
}
function maybeIdentityY(options = {}) {
  const { y, y1: y12, y2 } = options;
  return y12 === void 0 && y2 === void 0 && y === void 0 ? { ...options, y: identity$1 } : options;
}
function stackY(stack2 = {}, options = {}) {
  if (arguments.length === 1)
    [stack2, options] = mergeOptions(stack2);
  const { x1: x12, x = x12, y, ...rest } = options;
  const [transform, X, y12, y2] = stackAlias(x, y, "y", stack2, rest);
  return { ...transform, x1: x12, x: X, y1: y12, y2, y: mid$1(y12, y2) };
}
function maybeStackY({ y, y1: y12, y2, ...options } = {}) {
  if (y12 === void 0 && y2 === void 0)
    return stackY({ y, ...options });
  [y12, y2] = maybeZero(y, y12, y2);
  return { ...options, y1: y12, y2 };
}
function mergeOptions(options) {
  const { offset: offset2, order, reverse: reverse2, ...rest } = options;
  return [{ offset: offset2, order, reverse: reverse2 }, rest];
}
function stack(x, y = one, ky2, { offset: offset2, order, reverse: reverse2 }, options) {
  const z = maybeZ(options);
  const [X, setX] = maybeColumn(x);
  const [Y12, setY1] = column(y);
  const [Y22, setY2] = column(y);
  offset2 = maybeOffset(offset2);
  order = maybeOrder(order, offset2, ky2);
  return [
    basic(options, (data, facets) => {
      const X3 = x == null ? void 0 : setX(valueof(data, x));
      const Y = valueof(data, y, Float64Array);
      const Z = valueof(data, z);
      const O = order && order(data, X3, Y, Z);
      const n = data.length;
      const Y13 = setY1(new Float64Array(n));
      const Y23 = setY2(new Float64Array(n));
      const facetstacks = [];
      for (const facet of facets) {
        const stacks = X3 ? Array.from(group(facet, (i) => X3[i]).values()) : [facet];
        if (O)
          applyOrder(stacks, O);
        for (const stack2 of stacks) {
          let yn = 0, yp = 0;
          if (reverse2)
            stack2.reverse();
          for (const i of stack2) {
            const y2 = Y[i];
            if (y2 < 0)
              yn = Y23[i] = (Y13[i] = yn) + y2;
            else if (y2 > 0)
              yp = Y23[i] = (Y13[i] = yp) + y2;
            else
              Y23[i] = Y13[i] = yp;
          }
        }
        facetstacks.push(stacks);
      }
      if (offset2)
        offset2(facetstacks, Y13, Y23, Z);
      return { data, facets };
    }),
    X,
    Y12,
    Y22
  ];
}
const stackAlias = stack;
function maybeOffset(offset2) {
  if (offset2 == null)
    return;
  if (typeof offset2 === "function")
    return offset2;
  switch (`${offset2}`.toLowerCase()) {
    case "expand":
    case "normalize":
      return offsetExpand;
    case "center":
    case "silhouette":
      return offsetCenter;
    case "wiggle":
      return offsetWiggle;
  }
  throw new Error(`unknown offset: ${offset2}`);
}
function extent(stack2, Y22) {
  let min2 = 0, max2 = 0;
  for (const i of stack2) {
    const y = Y22[i];
    if (y < min2)
      min2 = y;
    if (y > max2)
      max2 = y;
  }
  return [min2, max2];
}
function offsetExpand(facetstacks, Y12, Y22) {
  for (const stacks of facetstacks) {
    for (const stack2 of stacks) {
      const [yn, yp] = extent(stack2, Y22);
      for (const i of stack2) {
        const m = 1 / (yp - yn || 1);
        Y12[i] = m * (Y12[i] - yn);
        Y22[i] = m * (Y22[i] - yn);
      }
    }
  }
}
function offsetCenter(facetstacks, Y12, Y22) {
  for (const stacks of facetstacks) {
    for (const stack2 of stacks) {
      const [yn, yp] = extent(stack2, Y22);
      for (const i of stack2) {
        const m = (yp + yn) / 2;
        Y12[i] -= m;
        Y22[i] -= m;
      }
    }
    offsetZero(stacks, Y12, Y22);
  }
  offsetCenterFacets(facetstacks, Y12, Y22);
}
function offsetWiggle(facetstacks, Y12, Y22, Z) {
  for (const stacks of facetstacks) {
    const prev = new InternMap();
    let y = 0;
    for (const stack2 of stacks) {
      let j = -1;
      const Fi = stack2.map((i) => Math.abs(Y22[i] - Y12[i]));
      const Df = stack2.map((i) => {
        j = Z ? Z[i] : ++j;
        const value = Y22[i] - Y12[i];
        const diff = prev.has(j) ? value - prev.get(j) : 0;
        prev.set(j, value);
        return diff;
      });
      const Cf1 = [0, ...cumsum(Df)];
      for (const i of stack2) {
        Y12[i] += y;
        Y22[i] += y;
      }
      const s1 = sum(Fi);
      if (s1)
        y -= sum(Fi, (d, i) => (Df[i] / 2 + Cf1[i]) * d) / s1;
    }
    offsetZero(stacks, Y12, Y22);
  }
  offsetCenterFacets(facetstacks, Y12, Y22);
}
function offsetZero(stacks, Y12, Y22) {
  const m = min$1(stacks, (stack2) => min$1(stack2, (i) => Y12[i]));
  for (const stack2 of stacks) {
    for (const i of stack2) {
      Y12[i] -= m;
      Y22[i] -= m;
    }
  }
}
function offsetCenterFacets(facetstacks, Y12, Y22) {
  const n = facetstacks.length;
  if (n === 1)
    return;
  const facets = facetstacks.map((stacks) => stacks.flat());
  const m = facets.map((I) => (min$1(I, (i) => Y12[i]) + max(I, (i) => Y22[i])) / 2);
  const m0 = min$1(m);
  for (let j = 0; j < n; j++) {
    const p = m0 - m[j];
    for (const i of facets[j]) {
      Y12[i] += p;
      Y22[i] += p;
    }
  }
}
function maybeOrder(order, offset2, ky2) {
  if (order === void 0 && offset2 === offsetWiggle)
    return orderInsideOut;
  if (order == null)
    return;
  if (typeof order === "string") {
    switch (order.toLowerCase()) {
      case "value":
      case ky2:
        return orderY;
      case "z":
        return orderZ;
      case "sum":
        return orderSum;
      case "appearance":
        return orderAppearance;
      case "inside-out":
        return orderInsideOut;
    }
    return orderFunction(field(order));
  }
  if (typeof order === "function")
    return orderFunction(order);
  if (Array.isArray(order))
    return orderGiven(order);
  throw new Error(`invalid order: ${order}`);
}
function orderY(data, X, Y) {
  return Y;
}
function orderZ(order, X, Y, Z) {
  return Z;
}
function orderSum(data, X, Y, Z) {
  return orderZDomain(Z, groupSort(range(data), (I) => sum(I, (i) => Y[i]), (i) => Z[i]));
}
function orderAppearance(data, X, Y, Z) {
  return orderZDomain(Z, groupSort(range(data), (I) => X[greatest(I, (i) => Y[i])], (i) => Z[i]));
}
function orderInsideOut(data, X, Y, Z) {
  const I = range(data);
  const K2 = groupSort(I, (I2) => X[greatest(I2, (i) => Y[i])], (i) => Z[i]);
  const sums = rollup(I, (I2) => sum(I2, (i) => Y[i]), (i) => Z[i]);
  const Kp = [], Kn = [];
  let s2 = 0;
  for (const k2 of K2) {
    if (s2 < 0) {
      s2 += sums.get(k2);
      Kp.push(k2);
    } else {
      s2 -= sums.get(k2);
      Kn.push(k2);
    }
  }
  return orderZDomain(Z, Kn.reverse().concat(Kp));
}
function orderFunction(f) {
  return (data) => valueof(data, f);
}
function orderGiven(domain) {
  return (data, X, Y, Z) => orderZDomain(Z, domain);
}
function orderZDomain(Z, domain) {
  if (!Z)
    throw new Error("missing channel: z");
  domain = new InternMap(domain.map((d, i) => [d, i]));
  return Z.map((z) => domain.get(z));
}
function applyOrder(stacks, O) {
  for (const stack2 of stacks) {
    stack2.sort((i, j) => ascendingDefined(O[i], O[j]));
  }
}
const defaults$1 = {
  ariaLabel: "dot",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5
};
function withDefaultSort(options) {
  return options.sort === void 0 && options.reverse === void 0 ? sort({ channel: "r", order: "descending" }, options) : options;
}
class Dot extends Mark {
  constructor(data, options = {}) {
    const { x, y, r, rotate, symbol: symbol2 = symbolCircle, frameAnchor } = options;
    const [vrotate, crotate] = maybeNumberChannel(rotate, 0);
    const [vsymbol, csymbol] = maybeSymbolChannel(symbol2);
    const [vr, cr] = maybeNumberChannel(r, vsymbol == null ? 3 : 4.5);
    super(data, {
      x: { value: x, scale: "x", optional: true },
      y: { value: y, scale: "y", optional: true },
      r: { value: vr, scale: "r", filter: positive, optional: true },
      rotate: { value: vrotate, optional: true },
      symbol: { value: vsymbol, scale: "auto", optional: true }
    }, withDefaultSort(options), defaults$1);
    this.r = cr;
    this.rotate = crotate;
    this.symbol = csymbol;
    this.frameAnchor = maybeFrameAnchor(frameAnchor);
    const { channels } = this;
    const { symbol: symbolChannel } = channels;
    if (symbolChannel) {
      const { fill: fillChannel, stroke: strokeChannel } = channels;
      symbolChannel.hint = {
        fill: fillChannel ? fillChannel.value === symbolChannel.value ? "color" : "currentColor" : this.fill,
        stroke: strokeChannel ? strokeChannel.value === symbolChannel.value ? "color" : "currentColor" : this.stroke
      };
    }
  }
  render(index2, scales, channels, dimensions, context) {
    const { x, y } = scales;
    const { x: X, y: Y, r: R, rotate: A5, symbol: S } = channels;
    const { r, rotate, symbol: symbol2 } = this;
    const [cx, cy] = applyFrameAnchor(this, dimensions);
    const circle = this.symbol === symbolCircle;
    const size = R ? void 0 : r * r * Math.PI;
    if (negative(r))
      index2 = [];
    return create("svg:g", context).call(applyIndirectStyles, this, dimensions, context).call(applyTransform, this, { x: X && x, y: Y && y }).call((g) => g.selectAll().data(index2).enter().append(circle ? "circle" : "path").call(applyDirectStyles, this).call(circle ? (selection2) => {
      selection2.attr("cx", X ? (i) => X[i] : cx).attr("cy", Y ? (i) => Y[i] : cy).attr("r", R ? (i) => R[i] : r);
    } : (selection2) => {
      selection2.attr("transform", template`translate(${X ? (i) => X[i] : cx},${Y ? (i) => Y[i] : cy})${A5 ? (i) => ` rotate(${A5[i]})` : rotate ? ` rotate(${rotate})` : ``}`).attr("d", R && S ? (i) => {
        const p = pathRound();
        S[i].draw(p, R[i] * R[i] * Math.PI);
        return p;
      } : R ? (i) => {
        const p = pathRound();
        symbol2.draw(p, R[i] * R[i] * Math.PI);
        return p;
      } : S ? (i) => {
        const p = pathRound();
        S[i].draw(p, size);
        return p;
      } : (() => {
        const p = pathRound();
        symbol2.draw(p, size);
        return p;
      })());
    }).call(applyChannelStyles, this, channels)).node();
  }
}
function dot(data, options = {}) {
  let { x, y, ...remainingOptions } = options;
  if (options.frameAnchor === void 0)
    [x, y] = maybeTuple(x, y);
  return new Dot(data, { ...remainingOptions, x, y });
}
class AbstractBar extends Mark {
  constructor(data, channels, options = {}, defaults2) {
    super(data, channels, options, defaults2);
    const { inset = 0, insetTop = inset, insetRight = inset, insetBottom = inset, insetLeft = inset, rx, ry } = options;
    this.insetTop = number(insetTop);
    this.insetRight = number(insetRight);
    this.insetBottom = number(insetBottom);
    this.insetLeft = number(insetLeft);
    this.rx = impliedString(rx, "auto");
    this.ry = impliedString(ry, "auto");
  }
  render(index2, scales, channels, dimensions, context) {
    const { rx, ry } = this;
    return create("svg:g", context).call(applyIndirectStyles, this, dimensions, context).call(this._transform, this, scales).call((g) => g.selectAll().data(index2).enter().append("rect").call(applyDirectStyles, this).attr("x", this._x(scales, channels, dimensions)).attr("width", this._width(scales, channels, dimensions)).attr("y", this._y(scales, channels, dimensions)).attr("height", this._height(scales, channels, dimensions)).call(applyAttr, "rx", rx).call(applyAttr, "ry", ry).call(applyChannelStyles, this, channels)).node();
  }
  _x(scales, { x: X }, { marginLeft }) {
    const { insetLeft } = this;
    return X ? (i) => X[i] + insetLeft : marginLeft + insetLeft;
  }
  _y(scales, { y: Y }, { marginTop }) {
    const { insetTop } = this;
    return Y ? (i) => Y[i] + insetTop : marginTop + insetTop;
  }
  _width({ x }, { x: X }, { marginRight, marginLeft, width }) {
    const { insetLeft, insetRight } = this;
    const bandwidth = X && x ? x.bandwidth() : width - marginRight - marginLeft;
    return Math.max(0, bandwidth - insetLeft - insetRight);
  }
  _height({ y }, { y: Y }, { marginTop, marginBottom, height }) {
    const { insetTop, insetBottom } = this;
    const bandwidth = Y && y ? y.bandwidth() : height - marginTop - marginBottom;
    return Math.max(0, bandwidth - insetTop - insetBottom);
  }
}
const defaults = {
  ariaLabel: "bar"
};
class BarY extends AbstractBar {
  constructor(data, options = {}) {
    const { x, y1: y12, y2 } = options;
    super(data, {
      y1: { value: y12, scale: "y" },
      y2: { value: y2, scale: "y" },
      x: { value: x, scale: "x", type: "band", optional: true }
    }, options, defaults);
  }
  _transform(selection2, mark, { y }) {
    selection2.call(applyTransform, mark, { y }, 0, 0);
  }
  _y({ y }, { y1: Y12, y2: Y22 }, { marginTop }) {
    const { insetTop } = this;
    return isCollapsed(y) ? marginTop + insetTop : (i) => Math.min(Y12[i], Y22[i]) + insetTop;
  }
  _height({ y }, { y1: Y12, y2: Y22 }, { marginTop, marginBottom, height }) {
    const { insetTop, insetBottom } = this;
    return isCollapsed(y) ? height - marginTop - marginBottom - insetTop - insetBottom : (i) => Math.max(0, Math.abs(Y22[i] - Y12[i]) - insetTop - insetBottom);
  }
}
function barY(data, options = { x: indexOf, y2: identity$1 }) {
  return new BarY(data, maybeStackY(maybeIntervalY(maybeIdentityY(options))));
}
const airportsString = `iata,name,city,state,country,latitude,longitude
00M,Thigpen,Bay Springs,MS,USA,31.95376472,-89.23450472
00R,Livingston Municipal,Livingston,TX,USA,30.68586111,-95.01792778
00V,Meadow Lake,Colorado Springs,CO,USA,38.94574889,-104.5698933
01G,Perry-Warsaw,Perry,NY,USA,42.74134667,-78.05208056
01J,Hilliard Airpark,Hilliard,FL,USA,30.6880125,-81.90594389
01M,Tishomingo County,Belmont,MS,USA,34.49166667,-88.20111111
02A,Gragg-Wade,Clanton,AL,USA,32.85048667,-86.61145333
02C,Capitol,Brookfield,WI,USA,43.08751,-88.17786917
02G,Columbiana County,East Liverpool,OH,USA,40.67331278,-80.64140639
03D,Memphis Memorial,Memphis,MO,USA,40.44725889,-92.22696056
04M,Calhoun County,Pittsboro,MS,USA,33.93011222,-89.34285194
04Y,Hawley Municipal,Hawley,MN,USA,46.88384889,-96.35089861
05C,Griffith-Merrillville,Griffith,IN,USA,41.51961917,-87.40109333
05F,Gatesville - City/County,Gatesville,TX,USA,31.42127556,-97.79696778
05U,Eureka,Eureka,NV,USA,39.60416667,-116.0050597
06A,Moton  Municipal,Tuskegee,AL,USA,32.46047167,-85.68003611
06C,Schaumburg,Chicago/Schaumburg,IL,USA,41.98934083,-88.10124278
06D,Rolla Municipal,Rolla,ND,USA,48.88434111,-99.62087694
06M,Eupora Municipal,Eupora,MS,USA,33.53456583,-89.31256917
06N,Randall,Middletown,NY,USA,41.43156583,-74.39191722
06U,Jackpot/Hayden,Jackpot,NV,USA,41.97602222,-114.6580911
07C,Dekalb County,Auburn,IN,USA,41.30716667,-85.06433333
07F,Gladewater Municipal,Gladewater,TX,USA,32.52883861,-94.97174556
07G,Fitch H Beach,Charlotte,MI,USA,42.57450861,-84.81143139
07K,Central City Municipal,Central City,NE,USA,41.11668056,-98.05033639
08A,Wetumpka Municipal,Wetumpka,AL,USA,32.52943944,-86.32822139
08D,Stanley Municipal,Stanley,ND,USA,48.30079861,-102.4063514
08K,Harvard State,Harvard,NE,USA,40.65138528,-98.07978667
08M,Carthage-Leake County,Carthage,MS,USA,32.76124611,-89.53007139
09A,Butler-Choctaw County,Butler,AL,USA,32.11931306,-88.1274625
09J,Jekyll Island,Jekyll Island,GA,USA,31.07447222,-81.42777778
09K,Sargent Municipal,Sargent,NE,USA,41.63695083,-99.34038139
09M,Charleston Municipal,Charleston,MS,USA,33.99150222,-90.078145
09W,South Capitol Street,Washington,DC,USA,38.86872333,-77.00747583
0A3,Smithville Municipal,Smithville,TN,USA,35.98531194,-85.80931806
0A8,Bibb County,Centreville,AL,USA,32.93679056,-87.08888306
0A9,Elizabethton Municipal,Elizabethton,TN,USA,36.37094306,-82.17374111
0AK,Pilot Station,Pilot Station,AK,USA,61.93396417,-162.8929358
0B1,Col. Dyke,Bethel,ME,USA,44.42506444,-70.80784778
0B4,Hartington Municipal,Hartington,NE,USA,42.60355556,-97.25263889
0B5,Turners Falls,Montague,MA,USA,42.59136361,-72.52275472
0B7,Warren-Sugar Bush,Warren,VT,USA,44.11672722,-72.82705806
0B8,Elizabeth,Fishers Island,NY,USA,41.25130806,-72.03161139
0C0,Dacy,Chicago/Harvard,IL,USA,42.40418556,-88.63343222
0C4,Pender Municipal,Pender,NE,USA,42.11388722,-96.72892556
0D1,South Haven Municipal,South Haven,MI,USA,42.35083333,-86.25613889
0D8,Gettysburg Municipal,Gettysburg,SD,USA,44.98730556,-99.9535
0E0,Moriarty,Moriarty,NM,USA,34.98560639,-106.0094661
0E8,Crownpoint,Crownpoint,NM,USA,35.71765889,-108.2015961
0F2,Bowie Municipal,Bowie,TX,USA,33.60166667,-97.77556
0F4,Loup City Municipal,Loup City,NE,USA,41.29028694,-98.99064278
0F7,Fountainhead Lodge Airpark,Eufaula,OK,USA,35.38898833,-95.60165111
0F8,William R Pogue Municipal,Sand Springs,OK,USA,36.17528,-96.15181028
0F9,Tishomingo Airpark,Tishomingo,OK,USA,34.19592833,-96.67555694
0G0,North Buffalo Suburban,Lockport,NY,USA,43.10318389,-78.70334583
0G3,Tecumseh Municipal,Tecumseh,NE,USA,40.39944417,-96.17139694
0G6,Williams County,Bryan,OH,USA,41.46736111,-84.50655556
0G7,Finger Lakes Regional,Seneca Falls,NY,USA,42.88062278,-76.78162028
0H1,Trego Wakeeney,Wakeeney,KS,USA,39.0044525,-99.89289917
0I8,Cynthiana-Harrison County,Cynthiana,KY,USA,38.36674167,-84.28410056
0J0,Abbeville Municipal,Abbeville,AL,USA,31.60016778,-85.23882222
0J4,Florala Municipal,Florala,AL,USA,31.04247361,-86.31156111
0J6,Headland Municipal,Headland,AL,USA,31.364895,-85.30965556
0K7,Humboldt Municipal,Humboldt,IA,USA,42.7360825,-94.24524167
0L5,Goldfield,Goldfield,NV,USA,37.71798833,-117.2384119
0L7,Jean,Jean,NV,USA,35.76827222,-115.3296378
0L9,Echo Bay,Overton,NV,USA,36.31108972,-114.4638672
0M0,Dumas Municipal,Dumas,AR,USA,33.8845475,-91.53429111
0M1,Scott,Parsons,TN,USA,35.63778,-88.127995
0M4,Benton County,Camden,TN,USA,36.01122694,-88.12328833
0M5,Humphreys County,Waverly,TN,USA,36.11659972,-87.73815889
0M6,Panola County,Batesville,MS,USA,34.36677444,-89.90008917
0M8,Byerley,Lake Providence,LA,USA,32.82587917,-91.187665
0O3,Calaveras Co-Maury Rasmussen,San Andreas,CA,USA,38.14611639,-120.6481733
0O4,Corning Municipal,Corning,CA,USA,39.94376806,-122.1713781
0O5,University,Davis,CA,USA,38.53146222,-121.7864906
0Q5,Shelter Cove,Shelter Cove,CA,USA,40.02764333,-124.0733639
0Q6,Shingletown,Shingletown,CA,USA,40.52210111,-121.8177683
0R0,Columbia-Marion County,Columbia,MS,USA,31.29700806,-89.81282944
0R1,Atmore Municipal,Atmore,AL,USA,31.01621528,-87.44675972
0R3,Abbeville Chris Crusta Memorial,Abbeville,LA,USA,29.97576083,-92.08415167
0R4,Concordia Parish,Vidalia,LA,USA,31.56683278,-91.50011889
0R5,David G Joyce,Winnfield,LA,USA,31.96366222,-92.66026056
0R7,Red River,Coushatta,LA,USA,31.99071694,-93.30739306
0S7,Dorothy Scott,Oroville,WA,USA,48.958965,-119.4119622
0S9,Jefferson County International,Port Townsend,WA,USA,48.04981361,-122.8012792
0V2,Harriet Alexander,Salida,CO,USA,38.53916389,-106.0458483
0V3,Pioneer Village,Minden,NE,USA,40.5149125,-98.94565083
0V4,Brookneal/Campbell County,Brookneal,VA,USA,37.14172222,-79.01638889
0V6,Mission Sioux,Mission,SD,USA,43.30694778,-100.6281936
0V7,Kayenta,Kayenta,AZ,USA,36.70972139,-110.2367978
10C,Galt,Chicago/Greenwood/Wonderlake,IL,USA,42.40266472,-88.37588917
10D,Winsted Municipal,Winsted,MN,USA,44.94996278,-94.0669175
10G,Holmes County,Millersburg,OH,USA,40.53716667,-81.95436111
10N,Wallkill,Wallkill,NY,USA,41.62787111,-74.13375583
10U,Owyhee,Owyhee,NV,USA,41.95323306,-116.1876014
11A,Clayton Municipal,Clayton,AL,USA,31.88329917,-85.48491361
11D,Clarion Cty,Clarion,PA,USA,41.22581222,-79.44098972
11IS,Schaumburg Heliport,Chicago/Schaumburg,IL,USA,42.04808278,-88.05257194
11J,Early County,Blakely,GA,USA,31.39698611,-84.89525694
11R,Brenham Municipal,Brenham,TX,USA,30.219,-96.37427778
12C,Rochelle Municipal,Rochelle,IL,USA,41.89300139,-89.07829
12D,Tower Municipal,Tower,MN,USA,47.81833333,-92.29166667
12J,Brewton Municipal,Brewton,AL,USA,31.05126306,-87.06796833
12K,Superior Municipal,Superior,NE,USA,40.04636111,-98.06011111
12Y,Le Sueur Municipal,Le Sueur,MN,USA,44.43746472,-93.91274083
13C,Lakeview,Lakeview,MI,USA,43.45213722,-85.26480333
13K,Eureka Municipal,Eureka,KS,USA,37.8515825,-96.29169806
13N,Trinca,Andover,NJ,USA,40.96676444,-74.78016556
14J,Carl Folsom,Elba,AL,USA,31.40988861,-86.08883583
14M,Hollandale Municipal,Hollandale,MS,USA,33.18262167,-90.83065444
14Y,Todd Field,Long Prairie,MN,USA,45.89857556,-94.87391
15F,Haskell Municipal,Haskell,TX,USA,33.19155556,-99.71793056
15J,Cook County,Adel,GA,USA,31.13780556,-83.45308333
15M,Luka,Luka,MS,USA,34.7723125,-88.16587444
15Z,McCarthy 2,McCarthy,AK,USA,61.43706083,-142.9037372
16A,Nunapitchuk,Nunapitchuk,AK,USA,60.90582833,-162.4391158
16G,Seneca County,Tiffin,OH,USA,41.09405556,-83.2125
16J,Dawson Municipal,Dawson,GA,USA,31.74328472,-84.419285
16S,Myrtle Creek Municipal,Myrtle Creek,OR,USA,42.99845056,-123.3095092
17G,Port Bucyrus-Crawford County,Bucyrus,OH,USA,40.78141667,-82.97469444
17J,Donalsonville Municipal,Donalsonville,GA,USA,31.00694444,-84.87761111
17K,Boise City,Boise City,OK,USA,36.77430028,-102.5104364
17M,Magee Municipal,Magee,MS,USA,31.86127139,-89.80285361
17N,Cross Keys,Cross Keys,NJ,USA,39.70547583,-75.03300306
17Z,Manokotak,Manokotak,AK,USA,58.98896583,-159.0499739
18A,Franklin County,Canon,GA,USA,34.34010472,-83.13348333
18I,McCreary County,Pine Knot,KY,USA,36.69591306,-84.39160389
19A,Jackson County,Jefferson,GA,USA,34.17402472,-83.56066528
19M,C A Moore,Lexington,MS,USA,33.12546111,-90.02555694
19N,Camden,Berlin,NJ,USA,39.77842056,-74.94780389
19P,Port Protection SPB,Port Protection,AK,USA,56.32880417,-133.6100844
1A3,Martin Campbell,Copperhill,TN,USA,35.01619111,-84.34631083
1A5,Macon County,Franklin,NC,USA,35.222595,-83.41904389
1A6,Middlesboro-Bell County,Middlesboro,KY,USA,36.6106375,-83.73741611
1A7,Jackson County,Gainesboro,TN,USA,36.39728139,-85.64164278
1A9,Autauga County,Prattville,AL,USA,32.438775,-86.51044778
1B0,Dexter Regional,Dexter,ME,USA,45.00839444,-69.23976722
1B1,Columbia Cty,Hudson,NY,USA,42.29130028,-73.71031944
1B3,Fair Haven,Fair Haven,VT,USA,43.61534389,-73.27455556
1B9,Mansfield Municipal,Mansfield,MA,USA,42.00013306,-71.19677139
1C5,Clow,Chicago/Plainfield,IL,USA,41.69597444,-88.12923056
1D1,Milbank Municipal,Milbank,SD,USA,45.23053806,-96.56596556
1D2,Canton -Plymouth -  Mettetal,Plymouth,MI,USA,42.35003667,-83.45826833
1D3,Platte Municipal,Platte,SD,USA,43.40332833,-98.82952972
1D6,Hector Municipal,Hector,MN,USA,44.73107278,-94.71471333
1D7,Webster Municipal,Webster,SD,USA,45.29329111,-97.51369889
1D8,Redfield Municipal,Redfield,SD,USA,44.86247611,-98.52953972
1F0,Downtown Ardmore,Ardmore,OK,USA,34.14698917,-97.12265194
1F1,Lake Murray State Park,Overbrook,OK,USA,34.07509694,-97.10667917
1F4,Madill Municipal,Madill,OK,USA,34.14040194,-96.81203222
1F9,Bridgeport Municipal,Bridgeport,TX,USA,33.17533333,-97.82838889
1G0,Wood County,Bowling Green,OH,USA,41.391,-83.63013889
1G3,Kent State University,Kent,OH,USA,41.15186167,-81.41658306
1G4,Grand Canyon West,Peach Springs,AZ,USA,35.99221,-113.8166164
1G5,Freedom,Medina,OH,USA,41.13144444,-81.76491667
1G6,Michael,Cicero,NY,USA,43.18166667,-76.12777778
1H0,Creve Coeur,St Louis,MO,USA,38.72752,-90.50830417
1H2,Effingham County Memorial,Effingham,IL,USA,39.07045083,-88.53351972
1H3,Linn State Tech. College,Linn,MO,USA,38.47149444,-91.81531667
1H8,Casey Municipal,Casey,IL,USA,39.30250917,-88.00406194
1I5,Freehold,Freehold,NY,USA,42.36425,-74.06596806
1I9,Delphi Municipal,Delphi,IN,USA,40.54281417,-86.68167194
1J0,Tri-County,Bonifay,FL,USA,30.84577778,-85.60138889
1K2,Lindsay Municipal,Lindsay,OK,USA,34.85007333,-97.58642028
1K4,David J. Perry,Goldsby,OK,USA,35.1550675,-97.47039389
1K5,Waynoka Municipal,Waynoka,OK,USA,36.56670028,-98.85231333
1K9,Satanta Municipal,Satanta,KS,USA,37.45419111,-100.9921119
1L0,St. John the Baptist Parish,Reserve,LA,USA,30.08720833,-90.58266528
1L1,Lincoln Co,Panaca,NV,USA,37.78746444,-114.4216567
1L7,Escalante Municipal,Escalante,UT,USA,37.74532639,-111.5701653
1L9,Parowan,Parowan,UT,USA,37.85969694,-112.816055
1M1,North Little Rock Municipal,No Lit Rock,AR,USA,34.83398056,-92.25792778
1M2,Belzoni Municipal,Belzoni,MS,USA,33.14518056,-90.51528472
1M4,Posey,Haleyville,AL,USA,34.28034806,-87.60044139
1M5,Portland Municipal,Portland,TN,USA,36.59287528,-86.47691028
1M7,Fulton,Fulton,KY,USA,36.52589417,-88.91561611
1MO,Mountain Grove Memorial,Mountain Grove,MO,USA,37.12071889,-92.311245
1N2,Spadaro,East Moriches,NY,USA,40.82787639,-72.74871083
1N4,Woodbine Muni,Woodbine,NJ,USA,39.21915,-74.794765
1N7,Blairstown,Blairstown,NJ,USA,40.97114556,-74.99747556
1N9,Allentown Queen City Muni,Allentown,PA,USA,40.57027778,-75.48830556
1ND3,Hamry,Kindred,ND,USA,46.6485775,-97.00564306
1O1,Grandfield Municipal,Grandfield,OK,USA,34.23758944,-98.74200917
1O2,Lampson,Lakeport,CA,USA,38.99017472,-122.8997175
1O3,Lodi,Lodi,CA,USA,38.20241667,-121.2684167
1O4,Thomas Municipal,Thomas,OK,USA,35.73338222,-98.73063833
1O6,Dunsmuir Municipal-Mott,Dunsmuir,CA,USA,41.26320889,-122.2719528
1R1,Jena,Jena,LA,USA,31.671005,-92.15846722
1R7,Brookhaven-Lincoln County,Brookhaven,MS,USA,31.6058475,-90.40931583
1R8,Bay Minette Municipal,Bay Minette,AL,USA,30.87046278,-87.81738167
1S0,Pierce County,Puyallup,WA,USA,47.10391667,-122.2871944
1S3,Tillitt,Forsyth,MT,USA,46.27110639,-106.6239206
1S5,Sunnyside Municipal,Sunnyside,WA,USA,46.32763139,-119.9705964
1S6,Priest River Muni,Priest River,ID,USA,48.19018611,-116.9093644
1U7,Bear Lake County,Paris,ID,USA,42.24714972,-111.33826
1V0,Navajo State Park,Navajo Dam,NM,USA,36.80833833,-107.6514444
1V2,Grant County,Hyannis,NE,USA,42.00942944,-101.7693439
1V5,Boulder Muni,Boulder,CO,USA,40.03942972,-105.2258217
1V6,Fremont County,Canon City,CO,USA,38.42838111,-105.1054994
1V9,Blake,Delta,CO,USA,38.78539722,-108.0636611
20A,Robbins,Oneonta,AL,USA,33.97231972,-86.37942722
20M,Macon Municipal,Macon,MS,USA,33.13345889,-88.53559806
20N,Kingston-Ulster,Kingston,NY,USA,41.9852525,-73.96409722
20U,Beach,Beach,ND,USA,46.92362444,-103.9785389
20V,McElroy Airfield,Kremmling,CO,USA,40.05367972,-106.3689467
21D,Lake Elmo,St Paul,MN,USA,44.99748861,-92.85568111
21F,Jacksboro Municipal,Jacksboro,TX,USA,33.228725,-98.14671083
22B,Mountain Meadow Airstrip,Burlington,CT,USA,41.77287528,-73.01121667
22I,Vinton County,McArthur,OH,USA,39.328125,-82.44182167
22M,Pontotoc County,Pontotoc,MS,USA,34.27593833,-89.03839694
22N,Carbon Cty-Jake Arner Memorial,Lehighton,PA,USA,40.80950889,-75.76149639
23J,Herlong,Jacksonville,FL,USA,30.27778889,-81.80594722
23M,Clarke County,Quitman,MS,USA,32.08487111,-88.73893389
23N,Bayport Aerodrome,Bayport,NY,USA,40.75843139,-73.05372083
23R,Devine Municipal,Devine,TX,USA,29.1384075,-98.94189028
24A,Jackson County,Sylva,NC,USA,35.3168625,-83.20936806
24J,Suwannee County,Live Oak,FL,USA,30.30105583,-83.02318778
24N,Jicarilla Apache Nation,Dulce,NM,USA,36.828535,-106.8841914
25J,Cuthbert-Randolph,Cuthbert,GA,USA,31.70016583,-84.82492194
25M,Ripley,Ripley,MS,USA,34.72226778,-89.01504944
25R,International,Edinburg,TX,USA,26.44201083,-98.12945306
26A,Ashland/Lineville,Ashland/Lineville,AL,USA,33.28761417,-85.80412861
26N,Ocean City Muni cipal,Ocean City,NJ,USA,39.26347222,-74.60747222
26R,Jackson County,Edna/Ganado,TX,USA,29.00101,-96.58194667
26U,McDermitt State,McDermitt,OR,USA,42.00211083,-117.7231972
27A,Elbert County-Patz,Elberton,GA,USA,34.09519722,-82.81586417
27D,Myers,Canby,MN,USA,44.72801889,-96.26309972
27J,Newberry Municipal,Newberry,SC,USA,34.30927778,-81.63972222
27K,Georgetown-Scott County,Georgetown,KY,USA,38.23442528,-84.43468667
28J,Kay Larkin,Palatka,FL,USA,29.65863889,-81.68855556
29D,Grove City,Grove City,PA,USA,41.14597611,-80.16592194
29G,Portage County,Ravenna,OH,USA,41.210195,-81.25163083
29S,Gardiner,Gardiner,MT,USA,45.04993556,-110.7466008
2A0,Mark Anton,Dayton,TN,USA,35.48624611,-84.93109722
2A1,Jamestown Municipal,Jamestown,TN,USA,36.34970833,-84.94664472
2A3,Larsen Bay,Larsen Bay,AK,USA,57.53510667,-153.9784169
2A9,Kotlik,Kotlik,AK,USA,63.03116111,-163.5299278
2AK,Lime Village,Lime Village,AK,USA,61.35848528,-155.4403508
2B3,Parlin,Newport,NH,USA,43.38812944,-72.18925417
2B7,Pittsfield Municipal,Pittsfield,ME,USA,44.76852778,-69.37441667
2B9,Post Mills,Post Mills,VT,USA,43.884235,-72.25370333
2D1,Barber,Alliance,OH,USA,40.97089139,-81.09981889
2D5,Oakes Municipal,Oakes,ND,USA,46.17301972,-98.07987556
2F5,Lamesa Municipal,Lamesa,TX,USA,32.75627778,-101.9194722
2F6,Skiatook Municipal,Skiatook,OK,USA,36.357035,-96.01138556
2F7,Commerce Municipal,Commerce,TX,USA,33.29288889,-95.89641806
2F8,Morehouse Memorial,Bastrop,LA,USA,32.75607944,-91.88057194
2G2,Jefferson County Airpark,Steubenville,OH,USA,40.35944306,-80.70007806
2G3,Connellsville,Connellsville,PA,USA,39.95893667,-79.65713306
2G4,Garrett County,Oakland,MD,USA,39.58027778,-79.33941667
2G9,Somerset County,Somerset,PA,USA,40.03911111,-79.01455556
2H0,Shelby County,Shelbyville,IL,USA,39.41042861,-88.8454325
2H2,Aurora Memorial Municipal,Aurora,MO,USA,36.96230778,-93.69531111
2I0,Madisonville Municipal,Madisonville,KY,USA,37.35502778,-87.39963889
2I5,Chanute,Rantoul,IL,USA,40.29355556,-88.14236111
2IS,Airglades,Clewiston,FL,USA,26.74200972,-81.04978917
2J2,Liberty County,Hinesville,GA,USA,31.78461111,-81.64116667
2J3,Louisville Municipal,Louisville,GA,USA,32.98654083,-82.38568139
2J5,Millen,Millen,GA,USA,32.89376972,-81.96511583
2J9,Quincy Municipal,Quincy,FL,USA,30.59786111,-84.55741667
2K3,Stanton County Municipal,Johnson,KS,USA,37.58271111,-101.73281
2K4,Scott,Mangum,OK,USA,34.89172583,-99.52675667
2K5,Telida,Telida,AK,USA,63.39387278,-153.2689733
2M0,Princeton-Caldwell County,Princeton,KY,USA,37.11560444,-87.85556944
2M2,Lawrenceburg Municipal,Lawrenceburg,TN,USA,35.2343025,-87.25793222
2M3,Sallisaw Municipal,Sallisaw,OK,USA,35.43816667,-94.80277778
2M4,G. V. Montgomery,Forest,MS,USA,32.35347778,-89.48867944
2M8,Charles W. Baker,Millington,TN,USA,35.27897583,-89.93147611
2O1,Gansner,Quincy,CA,USA,39.94378056,-120.9468983
2O3,Angwin-Parrett,Angwin,CA,USA,38.57851778,-122.4352572
2O6,Chowchilla,Chowchilla,CA,USA,37.11244417,-120.2468406
2O7,Independence,Independence,CA,USA,36.81382111,-118.2050956
2O8,Hinton Municipal,Hinton,OK,USA,35.50592472,-98.34236111
2P2,Washington Island,Washington Island,WI,USA,45.38620833,-86.92448056
2Q3,Yolo Co-Davis/Woodland/Winters,Davis/Woodland/Winters,CA,USA,38.5790725,-121.8566322
2R0,Waynesboro Municipal,Waynesboro,MS,USA,31.64599472,-88.63475667
2R4,Peter Prince,Milton,FL,USA,30.63762083,-86.99365278
2R5,St Elmo,St Elmo,AL,USA,30.50190833,-88.27511667
2R9,Karnes County,Kenedy,TX,USA,28.8250075,-97.86558333
2S1,Vashon Municipal,Vashon,WA,USA,47.45815333,-122.4773506
2S6,Sportsman Airpark,Newberg,OR,USA,45.29567333,-122.9553783
2S7,Chiloquin State,Chiloquin,OR,USA,42.58319167,-121.8761261
2S8,Wilbur,Wilbur,WA,USA,47.75320639,-118.7438936
2T1,Muleshoe Municipal,Muleshoe,TX,USA,34.18513639,-102.6410981
2V1,Stevens,Pagosa Springs,CO,USA,37.277505,-107.0558742
2V2,Vance Brand,Longmont,CO,USA,40.16367139,-105.1630369
2V5,Wray Municipal,Wray,CO,USA,40.10032333,-102.24096
2V6,Yuma Municipal,Yuma,CO,USA,40.10415306,-102.7129869
2W5,Maryland,Indian Head,MD,USA,38.60053667,-77.07296917
2W6,Captain Walter Francis Duke Regional,Leonardtown,MD,USA,38.31536111,-76.55011111
2Y3,Yakutat SPB,Yakutat,AK,USA,59.5624775,-139.7410994
2Y4,Rockwell City Municipal,Rockwell City,IA,USA,42.38748056,-94.61803333
31F,Gaines County,Seminole,TX,USA,32.67535389,-102.652685
32M,Norfolk,Norfolk,MA,USA,42.12787528,-71.37033556
32S,Stevensville,Stevensville,MT,USA,46.52511111,-114.0528056
33J,Geneva Municipal,Geneva,AL,USA,31.05527778,-85.88033333
33M,Water Valley,Water Valley,MS,USA,34.16677639,-89.68619722
33N,Delaware Airpark,Dover,DE,USA,39.21837556,-75.59642667
33S,Pru,Ritzville,WA,USA,47.12487194,-118.3927539
34A,Laurens County,Laurens,SC,USA,34.50705556,-81.94719444
35A,"Union County, Troy Shelton",Union,SC,USA,34.68680111,-81.64121167
35D,Padgham,Allegan,MI,USA,42.53098278,-85.82513556
35S,Wasco State,Wasco,OR,USA,45.58944444,-120.6741667
36K,Lakin,Lakin,KS,USA,37.96946389,-101.2554472
36S,Happy Camp,Happy Camp,CA,USA,41.79067944,-123.3889444
36U,Heber City Municipal/Russ McDonald,Heber,UT,USA,40.48180556,-111.4288056
37T,Calico Rock-Izard County,Calico Rock,AR,USA,36.16565278,-92.14523611
37W,Harnett County,Erwin,NC,USA,35.37880028,-78.73362917
38A,Shaktoolik,Shaktoolik,AK,USA,64.36263194,-161.2025369
38S,Deer Lodge-City-County,Deer Lodge,MT,USA,46.38881583,-112.7669842
38U,Wayne Wonderland,Loa,UT,USA,38.36247972,-111.5960164
39N,Princeton,Princeton,NJ,USA,40.39834833,-74.65760361
3A0,Grove Hill Municipal,Grove Hill,AL,USA,31.68932389,-87.7613875
3A1,Folsom,Cullman,AL,USA,34.26870833,-86.85833611
3A2,New Tazewell Municipal,Tazewell,TN,USA,36.41008417,-83.55546167
3A3,Anson County,Wadesboro,NC,USA,35.02397611,-80.08127333
3AU,Augusta Municipal,Augusta,KS,USA,37.67162778,-97.07787222
3B0,Southbridge Municipal,Southbridge,MA,USA,42.10092806,-72.03840833
3B1,Greenville Municipal,Greenville,ME,USA,45.46302778,-69.55161111
3B2,Marshfield,Marshfield,MA,USA,42.09824111,-70.67212083
3B9,Chester,Chester,CT,USA,41.38390472,-72.50589444
3BS,Jack Barstow,Midland,MI,USA,43.66291528,-84.261325
3CK,Lake In The Hills,Lake In The Hills,IL,USA,42.20680306,-88.32304028
3CM,James Clements Municipal,Bay City,MI,USA,43.54691667,-83.89550222
3CU,Cable Union,Cable,WI,USA,46.19424889,-91.24640972
3D2,Ephraim/Gibraltar,Ephraim,WI,USA,45.13535778,-87.18586556
3D4,Frankfort Dow Memorial,Frankfort,MI,USA,44.62506389,-86.20061944
3F3,De Soto Parish,Mansfield,LA,USA,32.07345972,-93.76551889
3F4,Vivian,Vivian,LA,USA,32.86133333,-94.01015361
3F7,Jones Memorial,Bristow,OK,USA,35.80685278,-96.42185556
3FM,Fremont Municipal,Fremont,MI,USA,43.43890528,-85.99478
3FU,Faulkton Municipal,Faulkton,SD,USA,45.03191861,-99.11566417
3G3,Wadsworth Municipal,Wadsworth,OH,USA,41.00158222,-81.75513111
3G4,Ashland County,Ashland,OH,USA,40.90297222,-82.25563889
3G7,Williamson/Sodus,Williamson,NY,USA,43.23472222,-77.12097222
3GM,Grand Haven Memorial Airpark,Grand Haven,MI,USA,43.03404639,-86.1981625
3I2,Mason County,Point Pleasant,WV,USA,38.91463889,-82.09858333
3I7,Phillipsburg,Phillipsburg,OH,USA,39.91344194,-84.40030889
3J1,Ridgeland,Ridgeland,SC,USA,32.49268694,-80.99233028
3J7,Greene County Airpark,Greensboro,GA,USA,33.59766667,-83.139
3JC,Freeman,Junction City,KS,USA,39.04327556,-96.84328694
3K3,Syracuse-Hamilton County Municipal,Syracuse,KS,USA,37.99167972,-101.7462822
3K6,St Louis-Metro East,Troy/Marine/St. Louis,IL,USA,38.73290861,-89.80656722
3K7,Mark Hoard Memorial,Leoti,KS,USA,38.45696333,-101.3532161
3LC,Logan County,Lincoln,IL,USA,40.15847222,-89.33497222
3LF,Litchfield Municipal,Litchfield,IL,USA,39.16635306,-89.67489694
3M7,Lafayette Municipal,Lafayette,TN,USA,36.518375,-86.05828083
3M8,North Pickens,Reform,AL,USA,33.38900611,-88.00557806
3M9,Warren Municipal,Warren,AR,USA,33.56044333,-92.08538861
3MY,Mt. Hawley Auxiliary,Peoria,IL,USA,40.79525917,-89.6134025
3N6,Old Bridge,Old Bridge,NJ,USA,40.32988667,-74.34678694
3N8,Mahnomen County,Mahnomen,MN,USA,47.25996056,-95.92809778
3ND0,Northwood Municipal,Northwood,ND,USA,47.72423333,-97.59042222
3O1,Gustine,Gustine,CA,USA,37.26271722,-120.9632586
3O3,Municipal,Purcell,OK,USA,34.97979444,-97.38586167
3O4,Sayre Municipal,Sayre,OK,USA,35.16755222,-99.65787361
3O5,Walters Municipal,Walters,OK,USA,34.37258444,-98.40588583
3O7,Hollister Municipal,Hollister,CA,USA,36.89334528,-121.4102706
3O9,Grand Lake Regional,Afton,OK,USA,36.5775775,-94.86190028
3R0,Beeville Municipal,Beeville,TX,USA,28.36455528,-97.79208194
3R1,Bay City Municipal,Bay City,TX,USA,28.973255,-95.86345528
3R2,Le Gros Memorial,Crowley,LA,USA,30.16173611,-92.48396111
3R4,Hart,Many,LA,USA,31.54489667,-93.48645306
3R7,Jennings,Jennings,LA,USA,30.24269333,-92.67344778
3S4,Illinois Valley,Illinois Valley (Cave Junction),OR,USA,42.10372417,-123.6822911
3S8,Grants Pass,Grants Pass,OR,USA,42.51011722,-123.3879894
3S9,Condon State-Pauling,Condon,OR,USA,45.24651889,-120.1664233
3SG,Harry W Browne,Saginaw - H.Browne,MI,USA,43.43341028,-83.86245833
3SQ,St Charles,St Charles,MO,USA,38.84866139,-90.50011833
3T3,Boyceville Municipal,Boyceville,WI,USA,45.042185,-92.0293475
3T5,Fayette Regional Air Center,La Grange,TX,USA,29.90930556,-96.9505
3TR,Jerry Tyler Memorial,Niles,MI,USA,41.83590806,-86.22517611
3U3,Bowman,Anaconda,MT,USA,46.15313278,-112.86784
3U7,Benchmark,Benchmark,MT,USA,47.48133194,-112.8697678
3U8,Big Sandy,Big Sandy,MT,USA,48.16247972,-110.1132631
3V4,Fort Morgan Municipal,Fort Morgan,CO,USA,40.33423194,-103.8039508
3WO,Shawano Municipal,Shawano,WI,USA,44.78777778,-88.56152444
3Y2,George L Scott Municipal,West Union,IA,USA,42.98508917,-91.79060417
3Y3,Winterset Madison County,Winterset,IA,USA,41.36276778,-94.02106194
3Z9,Haines SPB,Haines,AK,USA,59.23495111,-135.4407181
40J,Perry-Foley,Perry,FL,USA,30.06927778,-83.58058333
40N,Chester Cty-G O Carlson,Coatesville,PA,USA,39.97897222,-75.86547222
40U,Manila,Manila,UT,USA,40.98607,-109.6784811
41U,Manti-Ephraim,Manti,UT,USA,39.32912833,-111.6146397
42A,Melbourne Municipal,Melbourne,AR,USA,36.07079222,-91.82914667
42C,White Cloud,White Cloud,MI,USA,43.55974139,-85.77421944
42J,Keystone Airpark,Keystone Heights,FL,USA,29.84475,-82.04752778
42S,Poplar,Poplar,MT,USA,48.11595861,-105.1821928
43A,Montgomery County,Star,NC,USA,35.38819528,-79.79281667
44B,Dover/Foxcroft,Dover-Foxcroft,ME,USA,45.18338806,-69.2328225
44N,Sky Acres,Millbrook,NY,USA,41.70742861,-73.73802889
45J,Rockingham-Hamlet,Rockingham,NC,USA,34.89107083,-79.75905806
45OH,North Bass Island,North Bass Island,OH,USA,41.71932528,-82.82196917
45R,Kountz - Hawthorne,Kountze/Silsbee,TX,USA,30.33633806,-94.25754361
46A,Blairsville,Blairsville,GA,USA,34.85508722,-83.996855
46D,Carrington Municipal,Carrington,ND,USA,47.45111111,-99.15111111
46N,Sky Park,Red Hook,NY,USA,41.98458333,-73.83596556
47A,Cherokee County,Canton,GA,USA,34.31058333,-84.42391667
47J,Cheraw Municipal,Cheraw,SC,USA,34.71258333,-79.95794444
47N,Central Jersey Regional,Manville,NJ,USA,40.52438417,-74.59839194
47V,Curtis Municipal,Curtis,NE,USA,40.63750778,-100.4712539
48A,Cochran,Cochran,GA,USA,32.39936111,-83.27591667
48D,Clare Municipal,Clare,MI,USA,43.83111111,-84.74133333
48I,Braxton County,Sutton,WV,USA,38.68704444,-80.65176083
48K,Ness City Municipal,Ness City,KS,USA,38.47110278,-99.90806667
48S,Harlem,Harlem,MT,USA,48.56666472,-108.7729339
48V,Tri-County,Erie,CO,USA,40.010225,-105.047975
49A,Gilmer County,Ellijay,GA,USA,34.62786417,-84.52492889
49T,Downtown Heliport,Dallas,TX,USA,32.77333333,-96.80027778
49X,Chemehuevi Valley,Chemehuevi Valley,CA,USA,34.52751083,-114.4310697
49Y,Fillmore County,Preston,MN,USA,43.67676,-92.17973444
4A2,Atmautluak,Atmautluak,AK,USA,60.86674556,-162.2731389
4A4,Cornelius-Moore,Cedartown,GA,USA,34.01869444,-85.14647222
4A5,Marshall-Searcy County,Marshall,AR,USA,35.89893667,-92.65588611
4A6,Scottsboro Municipal,Scottsboro,AL,USA,34.68897278,-86.0058125
4A7,Clayton County,Hampton,GA,USA,33.38911111,-84.33236111
4A9,Isbell,Fort Payne,AL,USA,34.4728925,-85.72221722
4B0,South Albany,South Bethlehem,NY,USA,42.56072611,-73.83395639
4B1,Duanesburg,Duanesburg,NY,USA,42.75840889,-74.13290472
4B6,Ticonderoga Muni,Ticonderoga,NY,USA,43.87700278,-73.41317639
4B7,Schroon Lake,Schroon Lake,NY,USA,43.86256083,-73.74262972
4B8,Robertson,Plainville,CT,USA,41.69037667,-72.8648225
4B9,Simsbury Tri-Town,Simsbury,CT,USA,41.91676389,-72.77731778
4C8,Albia Municipal,Albia,IA,USA,40.99445361,-92.76297194
4D0,Abrams Municipal,Grandledge,MI,USA,42.77420167,-84.73309806
4D9,Alma Municipal,Alma,NE,USA,40.11389972,-99.34565306
4F2,Panola County-Sharpe,Carthage,TX,USA,32.17608333,-94.29880556
4F4,Gilmer-Upshur County,Gilmer,TX,USA,32.699,-94.94886111
4G1,Greenville Muni,Greenville,PA,USA,41.44683167,-80.39126167
4G2,Hamburg Inc.,Hamburg,NY,USA,42.7008925,-78.91475694
4G5,Monroe County,Woodsfield,OH,USA,39.77904472,-81.10277222
4G6,Hornell Muni,Hornell,NY,USA,42.38214444,-77.6821125
4G7,Fairmont Muni,Fairmont,WV,USA,39.44816667,-80.16702778
4I0,Mingo County,Williamson,WV,USA,37.68760139,-82.26097306
4I3,Knox County,Mount Vernon,OH,USA,40.32872222,-82.52377778
4I7,Putnam County,Greencastle,IN,USA,39.63359556,-86.8138325
4I9,Morrow County,Mt. Gilead,OH,USA,40.52452778,-82.85005556
4J1,Brantley County,Nahunta,GA,USA,31.21272417,-81.90539083
4J2,Berrien County,Nashville,GA,USA,31.21255556,-83.22627778
4J5,Quitman-Brooks County,Quitman,GA,USA,30.80575139,-83.58654889
4J6,St Marys,St Marys,GA,USA,30.75468028,-81.55731917
4K0,Pedro Bay,Pedro Bay,AK,USA,59.78960972,-154.1238331
4K5,Ouzinkie,Ouzinkie,AK,USA,57.92287611,-152.5005111
4K6,Bloomfield Municipal,Bloomfield,IA,USA,40.73210556,-92.42826889
4KA,Tununak,Tununak,AK,USA,60.57559667,-165.2731272
4M1,Carroll County,Berryville,AR,USA,36.38340333,-93.61685667
4M3,Carlisle Municipal,Carlisle,AR,USA,34.80823,-91.71205083
4M4,Clinton Municipal,Clinton,AR,USA,35.59785528,-92.45182472
4M7,Russellville-Logan County,Russellville,KY,USA,36.79991667,-86.81016667
4M8,Clarendon Municipal,Clarendon,AR,USA,34.64870694,-91.39457111
4M9,Corning Municipal,Corning,AR,USA,36.40423139,-90.64792639
4N1,Greenwood Lake,West Milford,NJ,USA,41.12854806,-74.34584611
4O3,Blackwell-Tonkawa Municipal,Blackwell-Tonkawa,OK,USA,36.74511583,-97.34959972
4O4,McCurtain County Regional,Idabel,OK,USA,33.909325,-94.85835278
4O5,Cherokee Municipal,Cherokee,OK,USA,36.78336306,-98.35035083
4PH,Polacca,Polacca,AZ,USA,35.79167222,-110.4234653
4R1,I H Bass Jr Memorial,Lumberton,MS,USA,31.01546028,-89.48256556
4R3,Jackson Municipal,Jackson,AL,USA,31.47210861,-87.89472083
4R4,Fairhope Municipal,Fairhope,AL,USA,30.4621125,-87.87801972
4R5,Madeline Island,La Pointe,WI,USA,46.78865556,-90.75866944
4R7,Eunice,Eunice,LA,USA,30.46628389,-92.42379917
4R9,Dauphin Island,Dauphin Island,AL,USA,30.26048083,-88.12749972
4S1,Gold Beach Muni,Gold Beach,OR,USA,42.41344444,-124.4242742
4S2,Hood River,Hood River,OR,USA,45.67261833,-121.5364625
4S3,Joseph State,Joseph,OR,USA,45.35709583,-117.2532244
4S9,Portland-Mulino,Mulino (Portland),OR,USA,45.21632417,-122.5900839
4SD,Reno/Stead,Reno,NV,USA,39.66738111,-119.8754169
4T6,Mid-Way,Midlothian-Waxahachie,TX,USA,32.45609722,-96.91240972
4U3,Liberty County,Chester,MT,USA,48.51072222,-110.9908639
4U6,Circle Town County,Circle,MT,USA,47.41861972,-105.5619431
4V0,Rangely,Rangely,CO,USA,40.09469917,-108.7612172
4V1,Johnson,Walsenburg,CO,USA,37.69640056,-104.7838747
4V9,Antelope County,Neligh,NE,USA,42.11222889,-98.0386775
4W1,Elizabethtown Municipal,Elizabethtown,NC,USA,34.60183722,-78.57973306
4Z4,Holy Cross,Holy Cross,AK,USA,62.18829583,-159.7749503
4Z7,Hyder SPB,Hyder,AK,USA,55.90331972,-130.0067031
50I,Kentland Municipal,Kentland,IN,USA,40.75873222,-87.42821917
50J,Berkeley County,Moncks Corner,SC,USA,33.18605556,-80.03563889
50K,Pawnee City Municipal,Pawnee City,NE,USA,40.11611111,-96.19445278
50R,Lockhart Municipal,Lockhart,TX,USA,29.85033333,-97.67241667
51D,Edgeley Municipal,Edgeley,ND,USA,46.34858333,-98.73555556
51Z,Minto (New),Minto,AK,USA,65.14370889,-149.3699647
52A,Madison Municipal,Madison,GA,USA,33.61212528,-83.46044333
52E,Timberon,Timberon,NM,USA,32.63388889,-105.6863889
52J,Lee County,Bishopville,SC,USA,34.24459889,-80.23729333
53A,"Dr. C.P. Savage, Sr.",Montezuma,GA,USA,32.302,-84.00747222
53K,Osage City Municipal,Osage City,KS,USA,38.63334222,-95.80859806
54J,Defuniak Springs,Defuniak Springs,FL,USA,30.7313,-86.15160833
55D,Grayling Army Airfield,Grayling,MI,USA,44.68032028,-84.72886278
55J,Fernandina Beach Municipal,Fernandina Beach,FL,USA,30.61170083,-81.462345
55S,Packwood,Packwood,WA,USA,46.60400083,-121.6778664
56D,Wyandot County,Upper Sandusky,OH,USA,40.88336139,-83.3145325
56M,Warsaw Municipal,Warsaw,MO,USA,38.34688889,-93.345425
56S,Seaside Municipal,Seaside,OR,USA,46.01649694,-123.9054167
57B,Islesboro,Islesboro,ME,USA,44.30285556,-68.91058722
57C,East Troy Municipal,East Troy,WI,USA,42.79711111,-88.3725
59B,Newton,Jackman,ME,USA,45.63199111,-70.24728944
5A4,Okolona Mun.-Richard M. Stovall,Okolona,MS,USA,34.01580528,-88.72618944
5A6,Winona-Montgomery County,Winona,MS,USA,33.46540139,-89.72924806
5A8,Aleknagik,Aleknagik,AK,USA,59.28256167,-158.6176725
5A9,Roosevelt Memorial,Warm Springs,GA,USA,32.93346222,-84.68881639
5B2,Saratoga Cty,Saratoga Springs,NY,USA,43.05126111,-73.86119444
5B3,Danielson,Danielson,CT,USA,41.81974056,-71.90096306
5B7,Rensselaer Air Park,Troy,NY,USA,42.69091194,-73.57956
5CD,Chandalar Shelf,Chandalar Camp,AK,USA,68.06543944,-149.5797392
5D3,Owosso Community,Owosso,MI,USA,42.99297222,-84.1389125
5F1,Post-Garza County Municipal,Post,TX,USA,33.20370556,-101.340415
5F4,Homer Municipal,Homer,LA,USA,32.78850806,-93.00366083
5G0,Leroy,Le Roy,NY,USA,42.98136667,-77.93751389
5G7,Bluffton,Bluffton,OH,USA,40.88544444,-83.86863889
5G8,Pittsburgh Boquet Airpark,Jeanette,PA,USA,40.37645722,-79.60837583
5G9,Toledo Suburban,Lambertville,MI,USA,41.7358775,-83.65541056
5HO,Hope,Hope,AK,USA,60.90415028,-149.6238389
5I4,Sheridan,Sheridan,IN,USA,40.17792583,-86.21729889
5J0,John Day State,John Day,OR,USA,44.40416667,-118.9625
5J9,Twin City,Loris,SC,USA,34.08848361,-78.86462028
5K2,Tribune Municipal,Tribune,KS,USA,38.45418222,-101.7462828
5M0,Rountree,Hartselle,AL,USA,34.40823444,-86.93295056
5M1,De Witt Municipal,De Witt,AR,USA,34.2626,-91.30984194
5M4,Fordyce Municipal,Fordyce,AR,USA,33.84593722,-92.36542861
5M9,Marion-Crittenden County,Marion,KY,USA,37.33616222,-88.11113611
5N8,Casselton Regional,Casselton,ND,USA,46.85469528,-97.20870028
5ND6,Hillsboro Municipal,Hillsboro,ND,USA,47.35940778,-97.06041639
5NI,Nikolai,Nikolai,AK,USA,63.0174475,-154.3639608
5NK,Naknek,Naknek,AK,USA,58.73288056,-157.0199197
5NN,Nondalton,Nondalton,AK,USA,59.97904306,-154.8396944
5R3,Rusty Allen,Lago Vista,TX,USA,30.498585,-97.96947222
5R4,Foley Municipal,Foley,AL,USA,30.42769722,-87.70082
5R5,Wharton Municipal,Wharton,TX,USA,29.25427778,-96.15438889
5R8,De Quincy Industrial Airpark,De Quincy,LA,USA,30.44117222,-93.47349722
5S8,St. Michael,St. Michael,AK,USA,63.49005056,-162.1103692
5T5,Hillsboro Municipal,Hillsboro,TX,USA,32.08348611,-97.09722722
5T6,Dona Ana County  At Santa Teresa,Santa Teresa,NM,USA,31.88098556,-106.7048131
5T9,Maverick County Meml Intl,Eagle Pass,TX,USA,28.85719361,-100.5122997
5TE,Tetlin,Tetlin,AK,USA,63.13382361,-142.5219339
5U3,Ennis - Big Sky,Ennis,MT,USA,45.27175833,-111.6486389
5U8,Geraldine,Geraldine,MT,USA,47.59664,-110.2660367
5V5,Shiprock Airstrip,Shiprock,NM,USA,36.6977775,-108.7011986
5V8,Kadoka Municipal,Kadoka,SD,USA,43.83332611,-101.4970881
5W8,Siler City Municipal,Siler City,NC,USA,35.7029175,-79.50529972
5Z1,Juneau Harbor,Juneau,AK,USA,58.29888889,-134.4077778
5Z5,Kantishna,Kantishna,AK,USA,63.54171472,-150.9939547
60F,Seymour Municipal,Seymour,TX,USA,33.64870417,-99.26063056
60J,Ocean Isle,Ocean Isle Beach,NC,USA,33.90850556,-78.43667222
61A,Camden Municipal,Camden,AL,USA,31.97987056,-87.33888056
61B,Boulder City Municipal,Boulder City,NV,USA,35.94748028,-114.8610967
61C,Fort Atkinson Municipal,Fort Atkinson,WI,USA,42.96320278,-88.81762806
61J,Portland Downtown Heliport,Portland,OR,USA,45.52527778,-122.6709289
61S,Cottage Grove State,Cottage Grove,OR,USA,43.79984528,-123.0289678
62D,Warren,Warren,OH,USA,41.26672278,-80.92897778
62H,Giddings-Lee County,Giddings,TX,USA,30.16927167,-96.98001083
62S,Christmas Valley,Christmas Valley,OR,USA,43.23653139,-120.6660967
63A,Lloyd R. Roundtree Seaplane Facility,Petersburg,AK,USA,56.81131972,-132.9600567
63C,Adams County Legion,Adams/Friendship,WI,USA,43.96117222,-89.78804889
63S,Colville Municipal,Colville,WA,USA,48.54156944,-117.8844247
65J,Wrens Memorial,Wrens,GA,USA,33.222645,-82.38373611
65S,Boundary County,Bonners Ferry,ID,USA,48.72632639,-116.2954761
66D,Sturgis Municipal,Sturgis,SD,USA,44.41761111,-103.3747778
67L,Mesquite,Mesquite,NV,USA,36.83497556,-114.0552453
68A,Wrangell SPB,Wrangell,AK,USA,56.466325,-132.3800181
68S,Davenport,Davenport,WA,USA,47.65404528,-118.1677519
6A1,Butler Municipal,Butler,GA,USA,32.56736694,-84.25074833
6A2,Griffin-Spaulding County,Griffin,GA,USA,33.22697222,-84.27494444
6A3,Andrews-Murphy,Andrews,NC,USA,35.19453167,-83.86490194
6A4,Johnson County,Mountain City,TN,USA,36.41789833,-81.82511528
6A8,Allakaket,Allakaket,AK,USA,66.55194444,-152.6222222
6B0,Middlebury State,Middlebury,VT,USA,43.98478278,-73.09594889
6B4,Frankfort-Highland,Utica/Frankfort,NY,USA,43.02090306,-75.17043861
6B6,Minute Man Airfield,Stow,MA,USA,42.46045361,-71.51791444
6B8,Caledonia County State,Lyndonville,VT,USA,44.56911417,-72.01797889
6B9,Skaneateles Aero Drome,Skaneateles,NY,USA,42.91395583,-76.44076889
6D6,Greenville Municipal,Greenville,MI,USA,43.14228139,-85.25380722
6D8,Barnes County Municipal,Valley City,ND,USA,46.94100778,-98.01762611
6F1,Talihina Municipal,Talihina,OK,USA,34.70777139,-95.07378583
6G1,Titusville,Titusville,PA,USA,41.60880861,-79.74133111
6G5,Barnesville - Bradfield,Barnesville,OH,USA,40.00243139,-81.19183
6I2,Lebanon-Springfield,Springfield,KY,USA,37.63355556,-85.24216667
6J0,Corporate,Pelion,SC,USA,33.79463889,-81.24586111
6J2,St George,St George,SC,USA,33.1955,-80.50847222
6J4,Saluda County,Saluda,SC,USA,33.92680111,-81.79455306
6K3,Creighton Municipal,Creighton,NE,USA,42.47083694,-97.88367778
6K4,Fairview Municipal,Fairview,OK,USA,36.29014667,-98.47582833
6K8,Tok Junction,Tok,AK,USA,63.32881806,-142.9536194
6L4,Logan County,Logan,WV,USA,37.85567778,-81.91589722
6M2,Horseshoe Bend,Horseshoe Bend,AR,USA,36.21673389,-91.75014556
6M6,Lewis County Regional,Monticello,MO,USA,40.12916667,-91.67833333
6M7,Lee County-Marianna,Marianna,AR,USA,34.78027778,-90.81055556
6M8,Marked Tree Municipal,Marked Tree,AR,USA,35.53341472,-90.40149028
6N5,E 34th St Heliport,New York,NY,USA,40.74260167,-73.97208306
6N7,New York Skyports Inc. SPB,New York,NY,USA,40.73399083,-73.97291639
6N8,Thomas County,Thedford,NE,USA,41.96217028,-100.5690139
6R3,Cleveland Municipal,Cleveland,TX,USA,30.35643,-95.00801472
6R7,Old Harbor (New),Old Harbor,AK,USA,57.21810306,-153.2697494
6R9,Llano Municipal,Llano,TX,USA,30.78450278,-98.66025083
6S0,Big Timber,Big Timber,MT,USA,45.80638889,-109.9811111
6S2,Florence Muni,Florence,OR,USA,43.97901,-124.1095631
6S3,Columbus,Columbus,MT,USA,45.6291075,-109.2507167
6S5,Ravalli County,Hamilton,MT,USA,46.25149444,-114.1255403
6S8,Laurel Municipal,Laurel,MT,USA,45.70308833,-108.7610886
6V0,Edgemont Municipal,Edgemont,SD,USA,43.29525056,-103.8435325
6V3,Tazewell County,Richlands,VA,USA,37.06374667,-81.79826944
6V4,Wall Municipal,Wall,SD,USA,43.99498861,-102.2504367
6V6,Hopkins,Nucla,CO,USA,38.23879833,-108.5632597
70J,Cairo-Grady County,Cairo,GA,USA,30.88797667,-84.15473528
71J,Blackwell,Ozark,AL,USA,31.43113889,-85.61922222
72S,Rosalia Municipal,Rosalia,WA,USA,47.23683778,-117.4210244
73C,Lancaster,Lancaster,WI,USA,42.78054722,-90.68096028
73J,Beaufort County,Beaufort,SC,USA,32.4121375,-80.63455083
74D,Marshall Cty,Moundsville,WV,USA,39.88083333,-80.73577778
74S,Anacortes,Anacortes,WA,USA,48.4989925,-122.6623956
74V,Roosevelt Municipal,Roosevelt,UT,USA,40.27829167,-110.0512619
75J,Turner County,Ashburn,GA,USA,31.68545833,-83.63211194
76G,Marine City,Marine City,MI,USA,42.72086583,-82.59574694
77G,Marlette Township,Marlette,MI,USA,43.31183,-83.09091444
77S,Hobby,Creswell,OR,USA,43.93206889,-123.0067483
78D,Caro Municipal,Caro,MI,USA,43.45908333,-83.44522222
79D,Philippi-Barbour County Regional,Philippi,WV,USA,39.16620778,-80.06258056
79J,Andalusia,Andalusia,AL,USA,31.30875278,-86.39376083
79S,Fort Benton,Fort Benton,MT,USA,47.84583333,-110.6336111
7A0,Greensboro Municipal,Greensboro,AL,USA,32.68147222,-87.66208333
7A2,Demopolis Municipal,Demopolis,AL,USA,32.46381944,-87.95406389
7A3,Lanett Municipal,Lanett,AL,USA,32.81204611,-85.22958111
7A5,Roanoke Municipal,Roanoke,AL,USA,33.12928722,-85.366615
7A8,Avery County/Morrison,Spruce Pine,NC,USA,35.94457028,-81.99566944
7B2,La Fleur,Northampton,MA,USA,42.32816806,-72.61151667
7D2,Troy-Oakland,Troy,MI,USA,42.54294389,-83.17790861
7F3,Caddo Mills Municipal,Caddo Mills,TX,USA,33.03622222,-96.24313889
7F6,Clarksville-Red River County,Clarksville,TX,USA,33.59316472,-95.06355528
7F7,Clifton Municipal,Clifton,TX,USA,31.81682333,-97.56696361
7F9,Comanche County-City,Comanche,TX,USA,31.91681306,-98.600325
7G0,Ledgedale Airpark,Brockport,NY,USA,43.18118194,-77.91362333
7G8,Geauga County,Middlefield,OH,USA,41.44960972,-81.06292972
7I7,Bellefontaine Municipal,Bellefontaine,OH,USA,40.41208333,-83.73686111
7K0,Pike County-Hatcher,Pikeville,KY,USA,37.56173889,-82.56660694
7K2,Skagway SPB,Skagway,AK,USA,59.44689528,-135.3226633
7K4,Ohio County,Hartford,KY,USA,37.45832417,-86.84995194
7K8,Martin,South Sioux City,NE,USA,42.45416111,-96.47253111
7KA,Tatitlek,Tatitlek,AK,USA,60.86890528,-146.6864653
7M1,McGehee Municipal,McGehee,AR,USA,33.62022111,-91.36484056
7M3,Bearce,Mount Ida,AR,USA,34.52926056,-93.52713472
7M4,Osceola Municipal,Osceola,AR,USA,35.69114639,-90.01012028
7M5,Ozark-Franklin County,Ozark,AR,USA,35.51069583,-93.8393075
7M7,Piggott Municipal,Piggott,AR,USA,36.37820556,-90.16624167
7N0,New Orleans Downtown Heliport,New Orleans,LA,USA,29.95194444,-90.08166667
7N1,Corning-Painted Post,Corning,NY,USA,42.17590722,-77.11219278
7N7,Spitfire Aerodrome,Pedrictown,NJ,USA,39.73556333,-75.39772111
7S0,Ronan,Ronan,MT,USA,47.57076861,-114.0967783
7S1,Twin Bridges,Twin Bridges,MT,USA,45.53325917,-112.3091656
7S5,Independence State,Independence,OR,USA,44.86676444,-123.1982475
7S6,White Sulphur Springs,White Sulphur Springs,MT,USA,46.50410722,-110.9132667
7S7,Valier,Valier,MT,USA,48.29997583,-112.2508711
7V1,Buena Vista Muni,Buena Vista,CO,USA,38.81416194,-106.1206939
7V7,Red Cloud Municipal,Red Cloud,NE,USA,40.08473556,-98.54061694
7W6,Hyde County,Englehard,NC,USA,35.5623925,-75.95518417
80F,Antlers Municipal,Antlers,OK,USA,34.19260083,-95.64985889
81B,Oxford County Regional,Norway,ME,USA,44.15742611,-70.48129583
82C,Mauston-New Lisbon Union,New Lisbon,WI,USA,43.83872167,-90.13768389
82V,Pine Bluffs Municipal,Pine Bluffs,WY,USA,41.15331528,-104.1302292
83D,Mackinac County,St Ignace,MI,USA,45.89029056,-84.73755083
84D,Cheyenne Eagle Butte,Eagle Butte,SD,USA,44.984375,-101.2510417
84K,Meyers Chuck SPB,Meyers Chuck,AK,USA,55.73963611,-132.2550183
84R,Smithville Municipal,Smithville,TX,USA,30.03048028,-97.16687194
85V,Ganado,Ganado,AZ,USA,35.70140278,-109.5103814
86F,Carnegie Municipal,Carnegie,OK,USA,35.12061417,-98.5806175
87I,Yazoo County,Yazoo City,MS,USA,32.883215,-90.4636475
87Y,Blackhawk Airfield,Madison,WI,USA,43.10491444,-89.18553833
88C,Palmyra Municipal,Palmyra,WI,USA,42.88355556,-88.59743056
88J,Allendale County,Allendale,SC,USA,32.99512944,-81.27024583
88M,Eureka,Eureka,MT,USA,48.96885444,-115.0704464
89D,Kelleys Island Land,Kelleys Island,OH,USA,41.60282583,-82.684625
8A0,Albertville Municipal,Albertville,AL,USA,34.22910972,-86.25575806
8A1,Guntersville Municipal,Guntersville,AL,USA,34.39944167,-86.27016111
8A3,Livingston Municipal,Livingston,TN,USA,36.41217389,-85.31154861
8B0,Rangeley Municipal,Rangeley,ME,USA,44.991895,-70.66462472
8D1,New Holstein Municipal,New Holstein,WI,USA,43.94424111,-88.1134775
8D3,Sisseton Municipal,Sisseton,SD,USA,45.67079278,-96.99619167
8D4,Sparta,Sparta,MI,USA,43.12860833,-85.67689778
8D7,Clark County,Clark,SD,USA,44.89570278,-97.71191361
8D9,Howard Municipal,Howard,SD,USA,44.02914056,-97.53784778
8F7,Decatur Municipal,Decatur,TX,USA,33.25463889,-97.58055556
8G2,Lawrence,Corry,PA,USA,41.90755611,-79.64105083
8G6,Harrison County,Cadiz,OH,USA,40.23820667,-81.01256917
8G7,Zelienople,Zelienople,PA,USA,40.80161944,-80.16072889
8K8,Cimarron Municipal,Cimarron,KS,USA,37.83057667,-100.3504222
8K9,Murphys Pullout SPB,Ketchikan,AK,USA,55.38965028,-131.7380742
8M1,Booneville-Baldwyn,Booneville,MS,USA,34.58981806,-88.64699861
8S1,Polson,Polson,MT,USA,47.69543861,-114.1851178
8S2,Cashmere-Dryden,Cashmere,WA,USA,47.51484611,-120.4848025
8S5,East Cooper,Mt Pleasant,SC,USA,32.89783333,-79.78286111
8U6,Terry,Terry,MT,USA,46.77917333,-105.3047083
8U8,Townsend,Townsend,MT,USA,46.33111111,-111.4813889
8V2,Stuart-Atkinson Municipal,Atkinson,NE,USA,42.56250167,-99.03787611
8Y2,Buffalo Municipal,Buffalo,MN,USA,45.15904694,-93.84330361
91C,Sauk - Prairie,Prairie Du Sac,WI,USA,43.2969325,-89.75595639
91F,Arrowhead,Canadian,OK,USA,35.15426444,-95.62026389
93B,Stonington,Stonington,ME,USA,44.17508056,-68.67863722
93C,Richland,Richland Center,WI,USA,43.28333333,-90.29827778
93F,Mignon Laird Municipal,Cheyenne,OK,USA,35.60393694,-99.70343889
93Y,David City Municipal,David City,NE,USA,41.23334583,-97.11698111
94K,Cassville Municipal,Cassville,MO,USA,36.69741667,-93.90052778
95F,Cleveland Municipal,Cleveland,OK,USA,36.28340306,-96.46418833
96D,Walhalla Municipal,Walhalla,ND,USA,48.94057222,-97.902775
96Z,North Whale SPB,North Whale Pass,AK,USA,56.11631056,-133.1217153
97M,Ekalaka,Ekalaka,MT,USA,45.87791444,-104.5375072
98D,Onida Municipal,Onida,SD,USA,44.70414917,-100.1087353
99N,Bamburg County,Bamburg,SC,USA,33.30515528,-81.10898917
99Y,Greeley Municipal,Greeley,NE,USA,41.55834528,-98.54618528
9A1,Covington Municipal,Covington,GA,USA,33.6324825,-83.84955806
9A3,Chuathbaluk,Chuathbaluk,AK,USA,61.58317306,-159.2359667
9A4,Lawrence County,Courtland,AL,USA,34.65938889,-87.34883333
9A5,Barwick-LaFayette,LaFayette,GA,USA,34.68896917,-85.29023333
9A6,Chester Municipal,Chester,SC,USA,34.78933333,-81.19577778
9A8,Ugashik,Ugashik,AK,USA,57.5278675,-157.3993056
9C8,Evart Municipal,Evart,MI,USA,43.8958525,-85.27920861
9D0,Highmore Municipal,Highmore,SD,USA,44.54165056,-99.44622306
9D1,Gregory Municipal,Gregory,SD,USA,43.22174722,-99.4033
9D2,Harding County,Buffalo,SD,USA,45.58055222,-103.5296356
9D7,Cando Municipal,Cando,ND,USA,48.4841675,-99.23680389
9D9,Hastings Municipal,Hastings,MI,USA,42.66361778,-85.34625944
9G0,Buffalo Airfield,Buffalo,NY,USA,42.86200306,-78.71658528
9G1,West Penn,Tarentum,PA,USA,40.60423333,-79.82060611
9G3,Akron,Akron,NY,USA,43.02108667,-78.48296778
9G5,Royalton,Gasport,NY,USA,43.18200222,-78.55780528
9G8,Ebensburg,Ebensburg,PA,USA,40.46121083,-78.77524389
9I0,Havana Regional,Havana,IL,USA,40.221155,-90.02289361
9I3,West Liberty,West Liberty,KY,USA,37.91453139,-83.25212111
9K2,Kokhanok,Kokhanok,AK,USA,59.43264556,-154.8027058
9K4,Skyhaven,Warrensburg,MO,USA,38.7842425,-93.80285417
9K7,Ellsworth Municipal,Ellsworth,KS,USA,38.74750889,-98.23061222
9K8,Kingman Municipal,Kingman,KS,USA,37.66660278,-98.12264722
9M4,Ackerman-Choctaw County,Ackerman,MS,USA,33.3034575,-89.22840028
9M6,Kelly,Oak Grove,LA,USA,32.84921361,-91.40390611
9M8,Sheridan-Grant County Regional,Sheridan,AR,USA,34.32842917,-92.35098583
9S2,Scobey,Scobey,MT,USA,48.80772722,-105.43947
9S4,Mineral County,Superior,MT,USA,47.16825944,-114.8537411
9S5,Three Forks,Three Forks,MT,USA,45.87852778,-111.5691389
9S7,Winifred,Winifred,MT,USA,47.55164778,-109.3776792
9S9,Lexington,Lexington,OR,USA,45.45263139,-119.6886361
9U0,Turner,Turner,MT,USA,48.85417361,-108.4090214
9U3,Austin,Austin,NV,USA,39.46798056,-117.1953703
9U4,Dixon,Dixon,WY,USA,41.03829806,-107.4972869
9V5,Modisett,Rushville,NE,USA,42.73748639,-102.4448947
9V6,Martin Municipal,Martin,SD,USA,43.16564083,-101.7126953
9V9,Chamberlain Municipal,Chamberlain,SD,USA,43.76612222,-99.32134
9W7,Currituck County,Currituck,NC,USA,36.39893194,-76.01631111
A04,Centre Municipal,Centre,AL,USA,34.15987361,-85.63512944
A14,Portage Creek,Portage Creek,AK,USA,58.906485,-157.7141078
A29,Sitka SPB,Sitka,AK,USA,57.05213778,-135.3462086
A30,Scott Valley,Fort Jones,CA,USA,41.55819444,-122.8553103
A32,Butte Valley,Dorris,CA,USA,41.88709222,-121.9755614
A61,Tuntutuliak,Tuntutuliak,AK,USA,60.33534556,-162.6670094
A63,Twin Hills,Twin Hills,AK,USA,59.07562167,-160.2730436
A79,Chignik Lake,Chignik Lake,AK,USA,56.25504722,-158.7753614
A85,Kwigillingok,Kwigillingok,AK,USA,59.87644778,-163.1675583
AAF,Apalachicola Municipal,Apalachicola,FL,USA,29.72754583,-85.02744778
AAO,Colonel James Jabara,Wichita,KS,USA,37.74755556,-97.22113889
AAS,Taylor County,Cambellsville,KY,USA,37.35827778,-85.30941667
AAT,Alturas Municipal,Alturas,CA,USA,41.483,-120.5653611
ABE,Lehigh Valley International,Allentown,PA,USA,40.65236278,-75.44040167
ABI,Abilene Regional,Abilene,TX,USA,32.41132,-99.68189722
ABO,Antonio (Nery) Juarbe Pol,Arecibo,PR,USA,18.45111111,-66.67555556
ABQ,Albuquerque International,Albuquerque,NM,USA,35.04022222,-106.6091944
ABR,Aberdeen Regional,Aberdeen,SD,USA,45.44905556,-98.42183333
ABY,Southwest Georgia Regional,Albany,GA,USA,31.535515,-84.19447333
ACB,Antrim County,Bellaire,MI,USA,44.98857611,-85.198355
ACJ,Souther,Americus,GA,USA,32.11079917,-84.18884806
ACK,Nantucket Memorial,Nantucket,MA,USA,41.25305194,-70.06018139
ACQ,Waseca Municipal,Waseca,MN,USA,44.07346389,-93.55294361
ACT,Waco Regional,Waco,TX,USA,31.61128833,-97.23051917
ACV,Arcata,Arcata/Eureka,CA,USA,40.97811528,-124.1086189
ACY,Atlantic City International,Atlantic City,NJ,USA,39.45758333,-74.57716667
ACZ,Henderson,Wallace,NC,USA,34.71789028,-78.00362444
ADC,Wadena Municipal,Wadena,MN,USA,46.45026972,-95.21095472
ADG,Lenawee County,Adrian,MI,USA,41.86943667,-84.07480528
ADH,Ada Municipal,Ada,OK,USA,34.80434056,-96.6712775
ADK,Adak,Adak,AK,USA,51.87796389,-176.6460306
ADM,Ardmore Municipal,Ardmore,OK,USA,34.30320667,-97.01952167
ADQ,Kodiak,Kodiak,AK,USA,57.74996778,-152.4938553
ADS,Addison,Dallas/Addison,TX,USA,32.96855944,-96.83644778
ADT,Atwood-Rawlins County City-County,Atwood,KS,USA,39.84013889,-101.0420278
ADU,Audubon Municipal,Audubon,IA,USA,41.70137556,-94.92054167
AEG,Double Eagle II,Albuquerque,NM,USA,35.14515278,-106.7951617
AEL,Albert Lea Municipal,Albert Lea,MN,USA,43.68151278,-93.36723778
AEX,Alexandria International,Alexandria,LA,USA,31.32737167,-92.54855611
AFE,Kake,Kake,AK,USA,56.96048139,-133.9082694
AFJ,Washington County,Washington,PA,USA,40.13648833,-80.29020083
AFK,Nebraska City Municipal,Nebraska City,NE,USA,40.60688889,-95.86569444
AFM,Ambler,Ambler,AK,USA,67.10610472,-157.8536203
AFN,Jaffrey Municipal Silver Ranch,Jaffrey,NH,USA,42.80513417,-72.00302194
AFO,Afton Municipal,Afton,WY,USA,42.71124583,-110.9421639
AFW,Fort Worth Alliance,Fort Worth,TX,USA,32.98763889,-97.31880556
AGC,Allegheny Cty,Pittsburgh,PA,USA,40.35440139,-79.93016889
AGN,Angoon SPB,Angoon,AK,USA,57.50355528,-134.5850939
AGO,Magnolia Municipal,Magnolia,AR,USA,33.22802111,-93.21696861
AGS,Bush,Augusta,GA,USA,33.369955,-81.96449611
AGZ,Wagner Municipal,Wagner,SD,USA,43.06332694,-98.29618972
AHH,Amery Municipal,Amery,WI,USA,45.28114833,-92.37539222
AHN,Athens Municipal,Athens,GA,USA,33.94859528,-83.32634694
AHP,Port Alexander SPB,Port Alexander,AK,USA,56.24684222,-134.6481539
AHQ,Wahoo Municipal,Wahoo,NE,USA,41.24133333,-96.59402778
AIA,Alliance Municipal,Alliance,NE,USA,42.05325,-102.8037222
AID,Anderson Municipal,Anderson,IN,USA,40.10862139,-85.61299472
AIG,Langlade County,Antigo,WI,USA,45.15419444,-89.11072222
AIK,Aiken Municipal,Aiken,SC,USA,33.64955556,-81.68447222
AIO,Atlantic Municipal,Atlantic,IA,USA,41.40726722,-95.04690639
AIT,Aitkin Municipal,Aitkin,MN,USA,46.5484225,-93.6768
AIV,George Downer,Aliceville,AL,USA,33.10706889,-88.19725167
AIY,Atlantic City Municipal,Atlantic City,NJ,USA,39.36002778,-74.45608333
AIZ,Lee C Fine Memorial,Kaiser/Lake Ozark,MO,USA,38.096035,-92.5494875
AJC,Chignik (Anchorage Bay),Chignik,AK,USA,56.3114625,-158.3732369
AJG,Mt Carmel Municipal,Mt Carmel,IL,USA,38.60654722,-87.72669417
AJO,Corona Municipal,Corona,CA,USA,33.89765389,-117.60244
AJR,Habersham County,Cornelia,GA,USA,34.50081944,-83.55487
AK5,Perryville,Perryville,AK,USA,55.90806056,-159.1585781
AKA,Atka,Atka,AK,USA,52.22034833,-174.2063503
AKH,Gastonia Municipal,Gastonia,NC,USA,35.20265944,-81.1498675
AKI,Akiak,Akiak,AK,USA,60.90481194,-161.2270189
AKK,Akhiok,Akhiok,AK,USA,56.93869083,-154.1825556
AKN,King Salmon,King Salmon,AK,USA,58.67680167,-156.6492175
AKO,Akron-Washington Co,Akron,CO,USA,40.17563333,-103.2220278
AKP,Anaktuvuk Pass,Anaktuvuk Pass,AK,USA,68.1343225,-151.74168
AKR,Akron Fulton Intl.,Akron,OH,USA,41.0375,-81.46693944
AKW,Klawock,Klawock,AK,USA,55.57923333,-133.0759972
AL08,Vaiden,Marion,AL,USA,32.51235611,-87.38555472
ALB,Albany Cty,Albany,NY,USA,42.74811944,-73.80297861
ALI,Alice International,Alice,TX,USA,27.74088889,-98.02694444
ALM,Alamogordo-White Sands Regional,Alamogordo,NM,USA,32.83994444,-105.9905833
ALN,St. Louis Regional,Alton/St. Louis,IL,USA,38.89029083,-90.04604306
ALO,Waterloo Municipal,Waterloo,IA,USA,42.55708139,-92.40034361
ALS,San Luis Valley Regional/Bergman,Alamosa,CO,USA,37.43491667,-105.8665556
ALW,Walla Walla Regional,Walla Walla,WA,USA,46.09456167,-118.2880367
ALX,Thomas C Russell,Alexander City,AL,USA,32.91475167,-85.96295611
AMA,Amarillo International,Amarillo,TX,USA,35.2193725,-101.7059272
AMG,Bacon County,Alma,GA,USA,31.53605556,-82.50655556
AMN,Gratiot Community,Alma,MI,USA,43.3221425,-84.68794917
AMT,Alexander Salamon,West Union,OH,USA,38.85148778,-83.56627778
AMW,Ames Municipal,Ames,IA,USA,41.99206972,-93.62180139
ANB,Anniston Metropolitan,Anniston,AL,USA,33.58816667,-85.85811111
ANC,Ted Stevens Anchorage International,Anchorage,AK,USA,61.17432028,-149.9961856
AND,Anderson County,Anderson,SC,USA,34.49494444,-82.70902778
ANE,Anoka County,Minneapolis,MN,USA,45.145,-93.21138889
ANI,Aniak,Aniak,AK,USA,61.58159694,-159.5430428
ANQ,Steuben County-Tri State,Angola,IN,USA,41.63969833,-85.08349333
ANV,Anvik,Anvik,AK,USA,62.64858333,-160.1898889
ANW,Ainsworth Municipal,Ainsworth,NE,USA,42.57922222,-99.99297222
ANY,Anthony Municipal,Anthony,KS,USA,37.15852194,-98.07964667
AOC,Arco-Butte County,Arco,ID,USA,43.60343056,-113.3340972
AOH,Allen County,Lima,OH,USA,40.70694444,-84.02666667
AOO,Altoona-Blair Cty,Altoona,PA,USA,40.29637222,-78.32002306
APA,Centennial,Denver,CO,USA,39.57012833,-104.8492942
APC,Napa County,Napa,CA,USA,38.21319444,-122.2806944
APF,Naples Municipal,Naples,FL,USA,26.15247222,-81.77544444
APN,Alpena County Regional,Alpena,MI,USA,45.0780675,-83.56028583
APT,Marion County-Brown,Jasper,TN,USA,35.06067778,-85.58531667
APV,Apple Valley,Apple Valley,CA,USA,34.57528944,-117.1861792
AQC,Klawock SPB,Klawock,AK,USA,55.5546575,-133.1016928
AQH,Kwinhagak,Quinhagak,AK,USA,59.75700722,-161.8794789
AQT,Nuiqsut,Nuiqsut,AK,USA,70.20995278,-151.0055611
AQW,Harriman And West,North Adams,MA,USA,42.69591417,-73.17038306
AQY,Girdwood,Girdwood,AK,USA,60.96609583,-149.1257892
ARA,Acadiana Regional,New Iberia,LA,USA,30.03775833,-91.88389611
ARB,Ann Arbor Municipal,Ann Arbor,MI,USA,42.22298361,-83.74560722
ARC,Arctic Village,Arctic Village,AK,USA,68.11608083,-145.5761114
ARG,Walnut Ridge Regional,Walnut Ridge,AR,USA,36.12534667,-90.92461944
ARR,Aurora Municipal,Chicago/Aurora,IL,USA,41.77192944,-88.47565917
ART,Watertown Intl,Watertown,NY,USA,43.99192222,-76.02173861
ARV,Lakeland,Minocqua-Woodruff,WI,USA,45.92792556,-89.73094278
ASD,Slidell,Slidell,LA,USA,30.345055,-89.82078833
ASE,Aspen-Pitkin Co/Sardy,Aspen,CO,USA,39.22316,-106.868845
ASG,Springdale Municipal,Springdale,AR,USA,36.17641056,-94.11925833
ASH,Boire,Nashua,NH,USA,42.78176306,-71.51477944
ASJ,Tri-County,Ahoskie,NC,USA,36.29752583,-77.17085556
ASL,Marshall - Harrison County,Marshall,TX,USA,32.5205,-94.30777778
ASN,Talladega Municipal,Talladega,AL,USA,33.56991111,-86.05085833
AST,Astoria Regional,Astoria,OR,USA,46.15797222,-123.8786944
ASW,Warsaw Municipal,Warsaw,IN,USA,41.2747,-85.84005556
ASX,John F Kennedy Memorial,Ashland,WI,USA,46.54852806,-90.91896639
ATA,Hall-Miller Municipal,Atlanta,TX,USA,33.101805,-94.19532694
ATK,Atqasuk,Atqasuk,AK,USA,70.46727611,-157.4357361
ATL,William B Hartsfield-Atlanta Intl,Atlanta,GA,USA,33.64044444,-84.42694444
ATS,Artesia Municipal,Artesia,NM,USA,32.85252806,-104.4676864
ATW,Outagamie County Regional,Appleton,WI,USA,44.25740806,-88.51947556
ATY,Watertown Municipal,Watertown,SD,USA,44.91398056,-97.15471944
AUG,Augusta State,Augusta,ME,USA,44.32064972,-69.79731806
AUH,Aurora Municipal,Aurora,NE,USA,40.89413889,-97.99455556
AUK,Alakanuk,Alakanuk,AK,USA,62.68004417,-164.6599253
AUM,Austin Municipal,Austin,MN,USA,43.66499083,-92.933385
AUN,Auburn Municipal,Auburn,CA,USA,38.95476944,-121.0820806
AUO,Auburn-Opelik,Auburn,AL,USA,32.61635417,-85.43355944
AUS,Austin-Bergstrom International,Austin,TX,USA,30.19453278,-97.66987194
AUW,Wausau Municipal,Wausau,WI,USA,44.92847222,-89.62661111
AVC,Mecklenburg-Brunswick Regional,South Hill,VA,USA,36.68827778,-78.05447222
AVK,Alva Regional,Alva,OK,USA,36.77317,-98.66994611
AVL,Asheville Regional,Asheville,NC,USA,35.43619444,-82.54180556
AVO,Avon Park Municipal,Avon Park,FL,USA,27.591145,-81.52785333
AVP,Wilkes-Barre/Scranton Intl,Wilkes-Barre/Scranton,PA,USA,41.33814944,-75.7242675
AVQ,Marana Northwest Regional,Marana,AZ,USA,32.40939028,-111.2185086
AVX,Catalina,Avalon,CA,USA,33.40494444,-118.4158611
AWG,Washington Municipal,Washington,IA,USA,41.27610083,-91.67344389
AWI,Wainwright,Wainwright,AK,USA,70.638,-159.99475
AWM,West Memphis Municipal,West Memphis,AR,USA,35.13505861,-90.23444639
AWO,Arlington Municipal,Arlington,WA,USA,48.16074833,-122.1590208
AXA,Algona Municipal,Algona,IA,USA,43.07791056,-94.27199278
AXN,Chandler,Alexandria,MN,USA,45.86629833,-95.39466806
AXS,Altus Municipal,Altus,OK,USA,34.69878194,-99.3381
AXV,Neil Armstrong,Wapakoneta,OH,USA,40.49338889,-84.29894444
AXX,Angel Fire,Angel Fire,NM,USA,36.42240972,-105.2892967
AYS,Waycross-Ware County,Waycross,GA,USA,31.24905556,-82.39530556
AZC,Colorado City Municipal,Colorado City,AZ,USA,36.95994444,-113.0138889
AZE,Hazelhurst,Hazelhurst,GA,USA,31.88465639,-82.64738778
AZO,Kalamazoo County,Kalamazoo,MI,USA,42.234875,-85.5520575
B01,Granville,Granville,NY,USA,43.42507111,-73.26205306
B08,Silver Springs,Silver Springs,NV,USA,39.40324917,-119.2518292
B16,Whitford,Weedsport,NY,USA,43.08027611,-76.53837556
B19,Biddeford Municipal,Biddeford,ME,USA,43.46411111,-70.47238889
B21,Sugarloaf Regional,Carrabasset,ME,USA,45.08616639,-70.21617778
BAF,Barnes Municipal,Westfield,MA,USA,42.15773111,-72.71562028
BAK,Columbus Municipal,Columbus,IN,USA,39.26191861,-85.89634556
BAM,Battle Mountain,Battle Mountain,NV,USA,40.59904583,-116.8743358
BAX,Huron County Memorial,Bad Axe,MI,USA,43.78091667,-82.98566667
BAZ,New Braunfels Municipal,New Braunfels,TX,USA,29.7045,-98.04222222
BBB,Benson Municipal,Benson,MN,USA,45.3319325,-95.650565
BBD,Curtis,Brady,TX,USA,31.17816667,-99.32463889
BBP,Marlboro County,Bennettsville,SC,USA,34.62170861,-79.73435944
BBW,Broken Bow Municipal,Broken Bow,NE,USA,41.43645056,-99.64216861
BCB,Virginia Tech,Blacksburg,VA,USA,37.20782361,-80.40832778
BCE,Bryce Canyon,Bryce Canyon,UT,USA,37.70637111,-112.1454725
BCK,Black River Falls Area,Black River Falls,WI,USA,44.25073861,-90.85528028
BCT,Boca Raton,Boca Raton,FL,USA,26.37848667,-80.10769667
BCV,Birchwood,Birchwood,AK,USA,61.41612444,-149.50888
BDE,Baudette International,Baudette,MN,USA,48.72741667,-94.61030556
BDG,Blanding Muni,Blanding,UT,USA,37.58303472,-109.4832889
BDL,Bradley International,Windsor Locks,CT,USA,41.93887417,-72.68322833
BDQ,Morrilton Municipal,Morrilton,AR,USA,35.13619528,-92.71349722
BDR,Igor I Sikorsky Memorial,Bridgeport,CT,USA,41.16348417,-73.12617861
BDX,Broadus,Broadus,MT,USA,45.433325,-105.4172133
BED,Laurence G Hanscom,Bedford,MA,USA,42.46995306,-71.28903
BEH,Southwest Michigan Regional,Benton Harbor,MI,USA,42.12858333,-86.4285
BET,Bethel,Bethel,AK,USA,60.77977639,-161.8379975
BFD,Bradford Reg,Bradford,PA,USA,41.80306778,-78.64012083
BFF,Scotts Bluff County,Scottsbluff,NE,USA,41.87402778,-103.5956389
BFI,Boeing Field/King County Intl,Seattle,WA,USA,47.52998917,-122.3019561
BFK,Buffalo Municipal,Buffalo,OK,USA,36.86330139,-99.61873056
BFL,Meadows,Bakersfield,CA,USA,35.43359806,-119.0567681
BFM,Mobile Downtown,Mobile,AL,USA,30.62646944,-88.06799861
BFR,Virgil I Grissom Municipal,Bedford,IN,USA,38.84003306,-86.44536361
BFW,Silver Bay Municipal,Silver Bay,MN,USA,47.24902778,-91.41558333
BGD,Hutchinson County,Borger,TX,USA,35.70004194,-101.3940536
BGE,Decatur County Industrial Airpark,Bainbridge,GA,USA,30.97152778,-84.63744444
BGF,Winchester Municipal,Winchester,TN,USA,35.17753417,-86.06616722
BGM,Binghamton Regional,Binghamton,NY,USA,42.20848278,-75.97961361
BGQ,Big Lake Strip Nr 2,Big Lake,AK,USA,61.53556806,-149.8138975
BGR,Bangor International,Bangor,ME,USA,44.80744444,-68.82813889
BHB,Hancock Co-Bar Harbor,Bar Harbor,ME,USA,44.44969444,-68.3615
BHC,Baxley Municipal,Baxley,GA,USA,31.71383333,-82.39377778
BHK,Baker Muni,Baker City,MT,USA,46.34763639,-104.2594475
BHM,Birmingham International,Birmingham,AL,USA,33.56294306,-86.75354972
BID,Block Island State,Block Island,RI,USA,41.16811889,-71.57784167
BIE,Beatrice Municipal,Beatrice,NE,USA,40.30127778,-96.75411111
BIG,Allen AAF,Delta Junction,AK,USA,63.99454722,-145.7216417
BIH,Bishop,Bishop,CA,USA,37.37309556,-118.3636089
BIL,Billings Logan Intl,Billings,MT,USA,45.8076625,-108.5428611
BIS,Bismarck Municipal,Bismarck,ND,USA,46.77411111,-100.7467222
BIV,Tulip City,Holland,MI,USA,42.74316667,-86.10502778
BJC,Jeffco,Denver,CO,USA,39.90878667,-105.1172158
BJI,Bemidji-Beltrami County,Bemidji,MN,USA,47.50942417,-94.93372333
BJJ,Wayne County,Wooster,OH,USA,40.87480556,-81.88825
BKD,Breckenridge Stephens County,Breckenridge,TX,USA,32.71904694,-98.89099972
BKE,Baker City Municipal,Baker City,OR,USA,44.83733333,-117.8090833
BKL,Burke Lakefront,Cleveland,OH,USA,41.5175,-81.68333333
BKV,Hernando County,Brooksville,FL,USA,28.47359722,-82.45542139
BKW,Raleigh Cty Memorial,Beckley,WV,USA,37.78732833,-81.12416417
BKX,Brookings Municipal,Brookings,SD,USA,44.30483333,-96.81694444
BLF,Mercer Cty,Bluefield,WV,USA,37.29579944,-81.20769056
BLH,Blythe,Blythe,CA,USA,33.61916278,-114.7168764
BLI,Bellingham Intl,Bellingham,WA,USA,48.79275,-122.5375278
BLM,Allaire Arpt,Belmar/Farmingdale,NJ,USA,40.18691806,-74.12488694
BLV,Scott AFB/MidAmerica,Belleville/St. Louis,IL,USA,38.54517861,-89.83518444
BMC,Brigham City,Brigham City,UT,USA,41.55239139,-112.0622625
BMG,Monroe County,Bloomington,IN,USA,39.14602139,-86.61668278
BMI,Central Illinois Regional,Bloomington,IL,USA,40.47798556,-88.91595278
BML,Berlin Municipal,Berlin,NH,USA,44.57537278,-71.17593167
BMQ,Burnet Muni-Kate Craddock,Burnet,TX,USA,30.73894444,-98.23858333
BMT,Beaumont Municipal,Beaumont,TX,USA,30.07044111,-94.21553806
BNA,Nashville International,Nashville,TN,USA,36.12447667,-86.67818222
BNF,Baranof Warm Springs SPB,Baranof Warm Springs,AK,USA,57.08882583,-134.8331414
BNG,Banning Municipal,Banning,CA,USA,33.92307111,-116.8505756
BNL,Barnwell County,Barnwell,SC,USA,33.25777778,-81.38833333
BNO,Burns Muni,Burns,OR,USA,43.59212778,-118.9549789
BNW,Boone Municipal,Boone,IA,USA,42.04956944,-93.84757222
BOI,Boise Air Terminal,Boise,ID,USA,43.56444444,-116.2227778
BOK,Brookings,Brookings,OR,USA,42.07455556,-124.2900939
BOS,Gen Edw L Logan Intl,Boston,MA,USA,42.3643475,-71.00517917
BOW,Bartow Municipal,Bartow,FL,USA,27.9433575,-81.78344167
BPI,Big Piney-Marbleton,Big Piney,WY,USA,42.58506972,-110.1111531
BPK,Baxter County Regional,Mountain Home,AR,USA,36.36894194,-92.47052806
BPT,Southeast Texas Regional,Beaumont/Port Arthur,TX,USA,29.95083333,-94.02069444
BQK,Glynco Jetport,Brunswick,GA,USA,31.25902778,-81.46630556
BQN,Rafael Hernandez,Aguadilla,PR,USA,18.49486111,-67.12944444
BRD,Brainerd-Crow Wing County Regional,Brainerd,MN,USA,46.39785806,-94.1372275
BRL,Burlington Municipal,Burlington,IA,USA,40.783225,-91.12550556
BRO,Brownsville/S.Padre Island International,Brownsville,TX,USA,25.90683333,-97.42586111
BRW,Wiley Post Will Rogers Memorial,Barrow,AK,USA,71.2854475,-156.7660019
BRY,Samuels,Bardstown,KY,USA,37.81432167,-85.49963806
BST,Belfast Municipal,Belfast,ME,USA,44.40966667,-69.01225
BTI,Barter Island,Kaktovik,AK,USA,70.13390278,-143.5770444
BTL,W K Kellogg Regional,Battle Creek,MI,USA,42.30727806,-85.25147972
BTM,Bert Mooney,Butte,MT,USA,45.95479528,-112.49746
BTN,Britton Municipal,Britton,SD,USA,45.81522222,-97.74313889
BTP,Butler Cty,Butler,PA,USA,40.77692611,-79.94972417
BTR,"Baton Rouge Metropolitan, Ryan",Baton Rouge,LA,USA,30.53316083,-91.14963444
BTT,Bettles,Bettles,AK,USA,66.91528667,-151.5280556
BTV,Burlington International,Burlington,VT,USA,44.47300361,-73.1503125
BTY,Beatty,Beatty,NV,USA,36.86105722,-116.7870036
BUB,Cram,Burwell,NE,USA,41.77669444,-99.14975
BUF,Buffalo Niagara Intl,Buffalo,NY,USA,42.94052472,-78.73216667
BUM,Butler Memorial,Butler,MO,USA,38.28977028,-94.34012694
BUR,Burbank-Glendale-Pasadena,Burbank,CA,USA,34.20061917,-118.3584969
BUY,Burlington Municipal,Burlington,NC,USA,36.04854333,-79.47488694
BVI,Beaver County,Beaver Falls,PA,USA,40.77248083,-80.39142556
BVK,Buckland,Buckland,AK,USA,65.98228611,-161.1519778
BVN,Albion Municipal,Albion,NE,USA,41.72857778,-98.05575972
BVO,Bartlesville Municipal,Bartlesville,OK,USA,36.76247611,-96.01115167
BVS,Skagit Regional/Bay View,Burlington/Mount Vernon,WA,USA,48.47088889,-122.4208611
BVX,Batesville Regional,Batesville,AR,USA,35.726105,-91.64736083
BVY,Beverly Municipal,Beverly,MA,USA,42.58417111,-70.91651833
BWC,Brawley Municipal,Brawley,CA,USA,32.9931,-115.5169325
BWD,Brownwood Municipal,Brownwood,TX,USA,31.79362222,-98.95649528
BWG,Bowling Green-Warren County,Bowling Green,KY,USA,36.96451667,-86.41967917
BWI,Baltimore-Washington International,Baltimore,MD,USA,39.17540167,-76.66819833
BWP,Harry Stern,Wahpeton,ND,USA,46.24640083,-96.6056825
BXA,George R Carr Memorial,Bogalusa,LA,USA,30.81368639,-89.86496444
BXG,Burke County,Waynesboro,GA,USA,33.04093056,-82.00397917
BXK,Buckeye Municipal,Buckeye,AZ,USA,33.42088556,-112.6863
BYA,Boundary,Boundary,AK,USA,64.07830278,-141.113375
BYG,Johnson County,Buffalo,WY,USA,44.38108528,-106.7217897
BYI,Burley Municipal,Burley,ID,USA,42.54260361,-113.7715442
BZN,Gallatin,Bozeman,MT,USA,45.77690139,-111.1530072
C00,Mercer County,Aledo,IL,USA,41.248645,-90.73708361
C05,Chenega Bay,Chenega,AK,USA,60.07730556,-147.9918889
C09,Morris Municipal,Morris,IL,USA,41.42541667,-88.41869444
C15,Pekin Municipal,Pekin,IL,USA,40.48820611,-89.67591083
C17,Marion,Marion,IA,USA,42.03111083,-91.52934222
C18,Frankfort,Chicago/Frankfort,IL,USA,41.4775,-87.84047222
C25,Waverly Municipal,Waverly,IA,USA,42.7419525,-92.50793528
C29,Morey,Middleton,WI,USA,43.11424444,-89.53073222
C34,Gibson City Municipal,Gibson City,IL,USA,40.48578389,-88.2672725
C35,Reedsburg Municipal,Reedsburg,WI,USA,43.52589944,-89.98322194
C47,Portage Municipal,Portage,WI,USA,43.5600925,-89.48309278
C52,Burlington Municipal,Burlington,WI,USA,42.69056389,-88.30464
C56,Sanger,Chicago/Monee,IL,USA,41.37756167,-87.68137528
C62,Kendallville Municipal,Kendallville,IN,USA,41.47271639,-85.26080833
C65,Plymouth Municipal,Plymouth,IN,USA,41.36513333,-86.30050417
C66,Monmouth Municipal,Monmouth,IL,USA,40.92970444,-90.63110722
C71,Crosby Municipal,Crosby,MS,USA,31.29600472,-91.05288167
C73,Dixon Muni-Charles R Walgreen,Dixon,IL,USA,41.83369889,-89.44621333
C75,Marshall County,Lacon,IL,USA,41.01928583,-89.38642222
C77,Poplar Grove,Poplar Grove,IL,USA,42.32268639,-88.83651833
C80,New Coalinga Municipal,Coalinga,CA,USA,36.16313889,-120.2938139
C81,Campbell,Chicago/Round Lake Park,IL,USA,42.32461111,-88.07408806
C83,Byron,Byron,CA,USA,37.8284525,-121.6258219
C91,Dowagiac Municipal,Dowagiac,MI,USA,41.99293417,-86.1280125
CAD,Wexford County,Cadillac,MI,USA,44.27531333,-85.41892694
CAE,Columbia Metropolitan,Columbia,SC,USA,33.93884,-81.11953944
CAG,Craig-Moffat,Craig,CO,USA,40.49522139,-107.5216467
CAK,Akron-Canton Regional,Akron,OH,USA,40.91631194,-81.44246556
CAO,Clayton Municipal Airpark,Clayton,NM,USA,36.44585972,-103.1546583
CAR,Caribou Municipal,Caribou,ME,USA,46.8715,-68.01791667
CAV,Clarion Municipal,Clarion,IA,USA,42.74194389,-93.75890944
CBE,Cumberland Regional,Cumberland,MD,USA,39.61541667,-78.76086361
CBF,Council Bluffs Municipal,Council Bluffs,IA,USA,41.25947222,-95.75997222
CBG,Cambridge Municipal,Cambridge,MN,USA,45.55854639,-93.26464361
CBK,Shaltz,Colby,KS,USA,39.42753083,-101.0465719
CCB,Cable,Upland,CA,USA,34.11154056,-117.6875897
CCO,Newnan-Coweta County,Newnan,GA,USA,33.31208333,-84.77027778
CCR,Buchanan,Concord,CA,USA,37.98965639,-122.0568972
CCY,Charles City Municipal,Charles City,IA,USA,43.07260861,-92.61077833
CDB,Cold Bay,Cold Bay,AK,USA,55.20559972,-162.7242628
CDC,Cedar City Muni,Cedar City,UT,USA,37.70097028,-113.098575
CDH,Harrell,Camden,AR,USA,33.62279917,-92.76339528
CDI,Cambridge Municipal,Cambridge,OH,USA,39.97504417,-81.57759528
CDK,George T Lewis,Cedar Key,FL,USA,29.137745,-83.04984361
CDN,Woodward,Camden,SC,USA,34.28358333,-80.56486111
CDR,Chadron Municipal,Chadron,NE,USA,42.83755556,-103.0954167
CDV,Merle K (Mudhole) Smith,Cordova,AK,USA,60.49183389,-145.4776503
CDW,Essex Cty Arpt,Caldwell,NJ,USA,40.87522278,-74.28135667
CEC,Jack McNamara,Crescent City,CA,USA,41.78015722,-124.2365333
CEF,Westover AFB,Chicopee,MA,USA,42.19826389,-72.53425833
CEK,Crete Municipal,Crete,NE,USA,40.61791667,-96.92488889
CEM,Central,Central,AK,USA,65.57380667,-144.7832908
CEU,Oconee County Regional,Clemson,SC,USA,34.67205556,-82.88644444
CEV,Mettel,Connersville,IN,USA,39.69803139,-85.13124528
CEW,Bob Sikes,Crestview,FL,USA,30.77883333,-86.52211111
CEY,Kyle-Oakley,Murray,KY,USA,36.66458333,-88.37277722
CEZ,Cortez Muni,Cortez,CO,USA,37.30299778,-108.6280658
CFD,Coulter,Bryan,TX,USA,30.71569444,-96.33136111
CFJ,Crawfordsville Municipal,Crawfordsville,IN,USA,39.97562861,-86.91986361
CFK,Chefornak,Chefornak,AK,USA,60.14922556,-164.2856325
CFT,Greenlee County,Clifton-Morenci,AZ,USA,32.95284306,-109.2103453
CFV,Coffeyville Municipal,Coffeyville,KS,USA,37.0940475,-95.57189417
CGA,Craig SPB,Craig,AK,USA,55.47883139,-133.1478011
CGC,Crystal River,Crystal River,FL,USA,28.86727778,-82.57130556
CGE,Cambridge-Dorchester,Cambridge,MD,USA,38.53930556,-76.03036111
CGF,Cuyahoga County,Cleveland,OH,USA,41.56512389,-81.48635389
CGI,Cape Girardeau Municipal,Cape Girardeau,MO,USA,37.22531694,-89.57075167
CGS,College Park,College Park,MD,USA,38.98058333,-76.92230556
CGX,Chicago Meigs,Chicago,IL,USA,41.85884389,-87.60791167
CGZ,Casa Grande Municipal,Casa Grande,AZ,USA,32.95488889,-111.7668333
CHA,Lovell,Chattanooga,TN,USA,35.03526833,-85.20378778
CHD,Chandler Municipal,Chandler,AZ,USA,33.26908333,-111.8111389
CHK,Chickasha Municipal,Chickasha,OK,USA,35.09614694,-97.96618361
CHO,Charlottesville-Albermarle,Charlottesville,VA,USA,38.13863889,-78.45286111
CHP,Circle Hot Springs,Circle Hot Springs,AK,USA,65.48547222,-144.6107836
CHS,Charleston AFB/International,Charleston,SC,USA,32.89864639,-80.04050583
CHT,Chillicothe Municipal,Chillicothe,MO,USA,39.78215278,-93.49568056
CHU,Houston County,Caledonia,MN,USA,43.59635861,-91.50394639
CIC,Chico Municipal,Chico,CA,USA,39.79538278,-121.8584231
CID,Eastern Iowa,Cedar Rapids,IA,USA,41.88458833,-91.71087222
CII,Choteau,Choteau,MT,USA,47.82528056,-112.1662136
CIK,Chalkyitsik,Chalkyitsik,AK,USA,66.64969083,-143.7359492
CIN,Arthur N Neu,Carroll,IA,USA,42.04619444,-94.789
CIR,Cairo,Cairo,IL,USA,37.06447222,-89.21961111
CIU,Chippewa County International,Sault Ste. Marie,MI,USA,46.25075194,-84.47238528
CJR,Culpeper Regional,Culpeper,VA,USA,38.5267075,-77.85885528
CJX,Crooked Creek,Crooked Creek,AK,USA,61.86902194,-158.1371178
CKB,Benedum,Clarksburg,WV,USA,39.29663889,-80.22808333
CKC,Grand Marais/Cook County,Grand Marais,MN,USA,47.83830556,-90.38313889
CKF,Crisp County - Cordele,Cordele,GA,USA,31.98883333,-83.77391667
CKI,Williamsburg County,Kingstree,SC,USA,33.71722222,-79.85697222
CKM,Fletcher,Clarksdale,MS,USA,34.29971,-90.51231611
CKN,Crookston Muni Kirkwood,Crookston,MN,USA,47.84169417,-96.62162028
CKP,Cherokee Municipal,Cherokee,IA,USA,42.73147222,-95.55613889
CKU,Cordova Muni,Cordova,AK,USA,60.54390333,-145.7267042
CKV,Outlaw,Clarksville,TN,USA,36.62188083,-87.41495361
CKX,Chicken,Chicken,AK,USA,64.07133833,-141.9522792
CLD,MC Clellan-Palomar Airport,NA,NA,USA,33.127231,-117.278727
CLE,Cleveland-Hopkins Intl,Cleveland,OH,USA,41.41089417,-81.84939667
CLI,Clintonville Municipal,Clintonville,WI,USA,44.61381306,-88.73126667
CLK,Clinton Municipal,Clinton,OK,USA,35.53832778,-98.932695
CLL,Easterwood,College Station,TX,USA,30.58858944,-96.36382417
CLM,William R Fairchild Intl,Port Angeles,WA,USA,48.12019444,-123.4996944
CLP,Clarks Point,Clarks Point,AK,USA,58.84230472,-158.5452331
CLS,Chehalis-Centralia,Chehalis,WA,USA,46.67649194,-122.9792967
CLT,Charlotte/Douglas International,Charlotte,NC,USA,35.21401111,-80.94312583
CLW,Clearwater Air Park,Clearwater,FL,USA,27.97668639,-82.75874028
CMA,Camarillo,Camarillo,CA,USA,34.21375472,-119.0943264
CMH,Port Columbus Intl,Columbus,OH,USA,39.99798528,-82.89188278
CMI,University of Illinois-Willard,Champaign/Urbana,IL,USA,40.03925,-88.27805556
CMX,Houghton County Memorial,Hancock,MI,USA,47.16841722,-88.48906083
CMY,Sparta/Fort McCoy,Sparta,WI,USA,43.95834806,-90.7378975
CNC,Chariton Municipal,Chariton,IA,USA,41.01962389,-93.35968028
CNH,Claremont Municipal,Claremont,NH,USA,43.37043194,-72.36867667
CNK,Blosser Municipal,Concordia,KS,USA,39.54925139,-97.65231667
CNM,Cavern City Air Terminal,Carlsbad,NM,USA,32.33747222,-104.2632778
CNO,Chino,Chino,CA,USA,33.97469444,-117.6366111
CNP,Billy G Ray,Chappell,NE,USA,41.07747222,-102.4640556
CNU,Chanute Martin Johnson,Chanute,KS,USA,37.66879722,-95.48506444
CNW,TSTC-Waco,Waco,TX,USA,31.63783139,-97.07413889
CNY,Canyonlands,Moab,UT,USA,38.75495611,-109.7548439
COD,Yellowstone Regional,Cody,WY,USA,44.52019417,-109.0237961
COE,Coeur D'Alene Air Terminal,Coeur D'Alene,ID,USA,47.77429167,-116.8196231
COI,Merritt Island,Merritt Island,FL,USA,28.34158944,-80.6854975
COM,Coleman Municipal,Coleman,TX,USA,31.84113889,-99.40361111
CON,Concord Municipal,Concord,NH,USA,43.20273278,-71.50228556
COQ,Cloquet-Carlton County,Cloquet,MN,USA,46.70016833,-92.50552861
COS,City of Colorado Springs Muni,Colorado Springs,CO,USA,38.80580556,-104.70025
COT,Cotulla-Lasalle County,Cotulla,TX,USA,28.45825583,-99.22016389
COU,Columbia Regional,Columbia,MO,USA,38.81809306,-92.21962917
CPC,Columbus County Municipal,Whiteville,NC,USA,34.27287278,-78.71499278
CPK,Chesapeake Municipal,Norfolk,VA,USA,36.66561833,-76.32066389
CPM,Compton/Woodley,Compton,CA,USA,33.89001611,-118.2436831
CPR,Natrona County Intl,Casper,WY,USA,42.90835556,-106.4644661
CPS,St. Louis Downtown,Cahokia/St. Louis,IL,USA,38.57072444,-90.15622111
CPX,Benjamin Rivera Noriega,Isla De Culebra,PR,USA,18.31328917,-65.30432444
CQA,Lakefield,Celina,OH,USA,40.48408333,-84.56011111
CQB,Chandler Municipal,Chandler,OK,USA,35.72381556,-96.82027306
CQX,Chatham Municipal,Chatham,MA,USA,41.68840028,-69.98952417
CRC,Circle City,Circle,AK,USA,65.83049389,-144.0758128
CRE,Grand Strand,North Myrtle Beach,SC,USA,33.81175,-78.72394444
CRG,Craig Municipal,Jacksonville,FL,USA,30.33633333,-81.51444444
CRO,Corcoran,Corcoran,CA,USA,36.10245111,-119.5948469
CRP,Corpus Christi International,Corpus Christi,TX,USA,27.77036083,-97.50121528
CRQ,McClellan-Palomar,Carlsbad,CA,USA,33.12822222,-117.2802222
CRS,C Davis Campbell -Corsicana Muni,Corsicana,TX,USA,32.02748861,-96.39803611
CRT,Crossett Municipal,Crossett,AR,USA,33.17833278,-91.88018806
CRW,Yeager,Charleston,WV,USA,38.37315083,-81.59318972
CRX,Roscoe Turner,Corinth,MS,USA,34.91496778,-88.60348361
CSB,Cambridge Municipal,Cambridge,NE,USA,40.30658333,-100.1620833
CSG,Columbus Metropolitan,Columbus,GA,USA,32.51633333,-84.93886111
CSM,Clinton-Sherman,Clinton,OK,USA,35.33983917,-99.20049944
CSQ,Creston Municipal,Creston,IA,USA,41.02146139,-94.36331917
CSV,Crossville Memorial,Crossville,TN,USA,35.95129194,-85.08497806
CTB,Cut Bank Muni,Cut Bank,MT,USA,48.60835444,-112.3761464
CTJ,West Georgia Regional,Carrollton,GA,USA,33.63102778,-85.15202778
CTK,Ingersoll,Canton,IL,USA,40.56909444,-90.07484
CTY,Cross City,Cross City,FL,USA,29.63552778,-83.10475
CTZ,Sampson County,Clinton,NC,USA,34.97561194,-78.36461528
CUB,Columbia Owens Downtown,Columbia,SC,USA,33.97047222,-80.99525
CUH,Cushing Municipal,Cushing,OK,USA,35.949925,-96.77305278
CUL,Carmi Municipal,Carmi,IL,USA,38.08947917,-88.12306111
CUT,Custer County,Custer,SD,USA,43.73331611,-103.6176947
CVG,Cincinnati Northern Kentucky Intl,Covington,KY,USA,39.04614278,-84.6621725
CVK,Sharp County Regional,Ash Flat,AR,USA,36.26487139,-91.56264111
CVN,Clovis Municipal,Clovis,NM,USA,34.42513889,-103.0792778
CVO,Corvallis Muni,Corvallis,OR,USA,44.49719361,-123.2898297
CVX,Charlevoix Municipal,Charlevoix,MI,USA,45.30477778,-85.27477778
CWA,Central Wisconsin,Mosinee,WI,USA,44.77761917,-89.66677944
CWF,Chennault International,Lake Charles,LA,USA,30.21059167,-93.14318944
CWI,Clinton Municipal,Clinton,IA,USA,41.8311125,-90.32913056
CWV,Claxton-Evans County,Claxton,GA,USA,32.19505556,-81.86955556
CXC,Chitina,Chitina,AK,USA,61.58285917,-144.4270969
CXE,Chase City Municipal,Chase City,VA,USA,36.78833556,-78.50155361
CXF,Coldfoot,Coldfoot,AK,USA,67.25163417,-150.2065672
CXL,Calexico International,Calexico,CA,USA,32.66950333,-115.5133281
CXO,Montgomery County,Conroe,TX,USA,30.35183333,-95.4144675
CXP,Carson,Carson City,NV,USA,39.19222972,-119.7343611
CXU,Camilla-Mitchell County,Camilla,GA,USA,31.21291667,-84.23680556
CXY,Capital City,Harrisburg,PA,USA,40.21713889,-76.85147222
CYO,Pickaway County Memorial,Circleville,OH,USA,39.51600611,-82.98215361
CYS,Cheyenne,Cheyenne,WY,USA,41.1557225,-104.8118381
CYW,Clay Center Municipal,Clay Center,KS,USA,39.38713889,-97.15721417
CZD,Cozad Municipal,Cozad,NE,USA,40.86911111,-100.0042222
CZG,Tri-Cities,Endicott,NY,USA,42.07853583,-76.09633306
CZL,Tom B David,Calhoun,GA,USA,34.45678278,-84.93949944
CZN,Chisana,Chisana,AK,USA,62.07118972,-142.0483742
CZT,Dimmit County,Carrizo Springs,TX,USA,28.52225111,-99.82363444
D04,Bowman Municipal,Bowman,ND,USA,46.18699111,-103.4280806
D05,Garrison Municipal,Garrison,ND,USA,47.65594444,-101.4372222
D07,Faith Municipal,Faith,SD,USA,45.03609417,-102.0198803
D09,Bottineau Municipal,Bottineau,ND,USA,48.83039167,-100.4171361
D19,Quentin Aanenson,Luverne,MN,USA,43.62080278,-96.21864028
D22,Angola,Angola,NY,USA,42.66010111,-78.99115556
D25,Manitowish Waters,Manitowish Waters,WI,USA,46.12197222,-89.88233333
D38,Canandaiga,Canandaiga,NY,USA,42.90718611,-77.32162639
D42,Springfield Municipal,Springfield,MN,USA,44.23107,-94.99893444
D50,Crosby Municipal,Crosby,ND,USA,48.92851556,-103.2972514
D55,Robertson,Langdon,ND,USA,48.75301778,-98.39333694
D57,Glen Ullin Municipal,Glen Ullin,ND,USA,46.81278306,-101.8601556
D60,Tioga Municipal,Tioga,ND,USA,48.3805325,-102.8979853
D73,Monroe-Walton County,Monroe,GA,USA,33.78149889,-83.69355389
D77,Lancaster,Lancaster,NY,USA,42.92228111,-78.61224889
D87,Harbor Springs,Harbor Springs,MI,USA,45.42556528,-84.91338389
D95,Dupont-Lapeer,Lapeer,MI,USA,43.06703333,-83.27244444
D98,Romeo,Romeo,MI,USA,42.79699083,-82.97526583
DAB,Daytona Beach International,Daytona Beach,FL,USA,29.17991667,-81.05805556
DAG,Barstow-Daggett,Daggett,CA,USA,34.85371333,-116.7866875
DAL,Dallas Love,Dallas,TX,USA,32.84711389,-96.85177222
DAN,Danville Regional,Danville,VA,USA,36.57286111,-79.33611111
DAW,Skyhaven,Rochester,NH,USA,43.28406194,-70.92925472
DAY,James M Cox Dayton Intl,Dayton,OH,USA,39.90237583,-84.219375
DBN,"W. H. ""Bud"" Barron",Dublin,GA,USA,32.56445806,-82.98525556
DBQ,Dubuque Municipal,Dubuque,IA,USA,42.40295944,-90.70916722
DCA,Ronald Reagan Washington National,Arlington,VA,USA,38.85208333,-77.03772222
DCK,Dahl Creek,Dahl Creek,AK,USA,66.94333806,-156.9046739
DCU,Pryor  Regional,Decatur,AL,USA,34.65264667,-86.94536778
DCY,Daviess County,Washington,IN,USA,38.70042333,-87.12973222
DDC,Dodge City Regional,Dodge City,KS,USA,37.76312194,-99.96542389
DDH,William H. Morse State,Bennington,VT,USA,42.8913325,-73.2464075
DEC,Decatur,Decatur,IL,USA,39.8345625,-88.86568917
DED,Deland Municipal-Taylor,Deland,FL,USA,29.06698056,-81.28394167
DEE,Deering,Deering,AK,USA,66.06820583,-162.7666028
DEH,Decorah Municipal,Decorah,IA,USA,43.27550139,-91.73937389
DEN,Denver Intl,Denver,CO,USA,39.85840806,-104.6670019
DEQ,J Lynn Helms Sevier County,De Queen,AR,USA,34.04699556,-94.39936556
DET,Detroit City,Detroit,MI,USA,42.40919444,-83.00986111
DEW,Deer Park,Deer Park,WA,USA,47.96663889,-117.4266667
DFI,Defiance Memorial,Defiance,OH,USA,41.3375,-84.42880556
DFW,Dallas-Fort Worth International,Dallas-Fort Worth,TX,USA,32.89595056,-97.0372
DGW,Converse County,Douglas,WY,USA,42.79725,-105.3857361
DHN,Dothan,Dothan,AL,USA,31.32133917,-85.44962889
DHT,Dalhart Municipal,Dalhart,TX,USA,36.022585,-102.5472775
DIK,Dickinson Municipal,Dickinson,ND,USA,46.79738889,-102.8019528
DKB,Dekalb-Taylor Municipal,Dekalb,IL,USA,41.93188111,-88.70829861
DKK,Dunkirk Municipal,Dunkirk,NY,USA,42.49333528,-79.27204167
DKX,Knoxville Downtown Island,Knoxville,TN,USA,35.96383361,-83.87365389
DLG,Dillingham,Dillingham,AK,USA,59.0454125,-158.5033389
DLH,Duluth International,Duluth,MN,USA,46.84209028,-92.19364861
DLL,Baraboo - Wisconsin Dells,Baraboo,WI,USA,43.52195389,-89.77090222
DLN,Dillon,Dillon,MT,USA,45.25536056,-112.5525067
DLO,Delano Municipal,Delano,CA,USA,35.74558056,-119.2365039
DLS,Columbia Gorge Regional,The Dalles,OR,USA,45.61854556,-121.1673439
DLZ,Delaware Municipal,Delaware,OH,USA,40.27970139,-83.11480167
DM2,Diomede Heliport,Diomede,AK,USA,65.75861111,-168.9530556
DMN,Deming Municipal,Deming,NM,USA,32.26230917,-107.7206397
DMO,Sedalia Memorial,Sedalia,MO,USA,38.70688889,-93.17611111
DMW,Carroll County,Westminster,MD,USA,39.60827778,-77.00766667
DNL,Daniel,Augusta,GA,USA,33.46663667,-82.03933917
DNN,Dalton Municipal,Dalton,GA,USA,34.72174833,-84.86910806
DNS,Denison Municipal,Denison,IA,USA,41.9864325,-95.38072083
DNV,Vermilion County,Danville,IL,USA,40.19946861,-87.59553528
DOV,Dover Air Force Base,Dover,DE,USA,39.1301125,-75.46631028
DPA,Du Page,Chicago/West Chicago,IL,USA,41.90688333,-88.24841722
DPL,P B Raiford,Kenansville,NC,USA,35.00006444,-77.981695
DQH,Douglas Municipal,Douglas,GA,USA,31.47780833,-82.85961556
DRI,Beauregard Parish,De Ridder,LA,USA,30.83152778,-93.33963889
DRO,Durango-La Plata County,Durango,CO,USA,37.15151667,-107.7537692
DRT,Del Rio International,Del Rio,TX,USA,29.37181222,-100.9232339
DSM,Des Moines International,Des Moines,IA,USA,41.53493306,-93.66068222
DSV,Dansville Muni,Dansville,NY,USA,42.57089972,-77.71305083
DTA,Delta Municipal,Delta,UT,USA,39.38328861,-112.5096683
DTL,Detroit Lakes -Wething,Detroit Lakes,MN,USA,46.82520861,-95.8856875
DTN,Shreveport Downtown,Shreveport,LA,USA,32.54021889,-93.7450225
DTO,Denton Municipal,Denton,TX,USA,33.20072167,-97.19797722
DTS,Destin-Ft. Walton Beach,Destin,FL,USA,30.40006111,-86.47147722
DTW,Detroit Metropolitan-Wayne County,Detroit,MI,USA,42.21205889,-83.34883583
DUA,Eaker,Durant,OK,USA,33.942265,-96.39451806
DUC,Halliburton,Duncan,OK,USA,34.470875,-97.95986111
DUG,Bisbee Douglas International,Douglas Bisbee,AZ,USA,31.46902778,-109.6036667
DUJ,Du Bois-Jefferson Cty,Du Bois,PA,USA,41.17826611,-78.89869778
DUT,Unalaska,Unalaska,AK,USA,53.90013889,-166.5435
DUX,Moore County,Dumas,TX,USA,35.85792833,-102.0130978
DUY,Kongiganak,Kongiganak,AK,USA,59.95950583,-162.8817231
DVK,Stuart Powell,Danville,KY,USA,37.57791667,-84.76969444
DVL,Devils Lake Municipal-Knoke,Devils Lake,ND,USA,48.11424528,-98.90877833
DVN,Davenport Municipal,Davenport,IA,USA,41.6102775,-90.58832528
DVO,Gnoss,Novato,CA,USA,38.14351944,-122.5572167
DVT,Phoenix-Deer Valley,Phoenix,AZ,USA,33.68831667,-112.0825614
DWH,David Wayne Hooks Memorial,Houston,TX,USA,30.06186111,-95.55277778
DWU,Ashland-Boyd County,Ashland,KY,USA,38.5545,-82.738
DXE,Dexter Municipal,Dexter,MO,USA,36.77747,-89.94117333
DXR,Danbury Municipal,Danbury,CT,USA,41.37153528,-73.48219056
DXX,Madison-Lac Qui Parle County,Madison,MN,USA,44.98624,-96.17773611
DYB,Summerville,Summerville,SC,USA,33.06344444,-80.27933333
DYL,Doylestown,Doylestown,PA,USA,40.33305028,-75.12233833
DYR,Dyersburg Municipal,Dyersburg,TN,USA,35.99850694,-89.40608333
DYT,Sky Harbor,Duluth,MN,USA,46.72186083,-92.04343889
E01,Monahans-Roy Hurd Memorial,Monahans,TX,USA,31.58246583,-102.9090428
E04,Eunice,Eunice,NM,USA,32.45679139,-103.2404708
E05,Hatch Muni,Hatch,NM,USA,32.66106083,-107.1979339
E06,Lea County-Zip Franklin Memorial,Lovington,NM,USA,32.95394444,-103.4087778
E07,Lea County/Tatum,Tatum,NM,USA,33.26122278,-103.2768939
E11,Andrews County,Andrews,TX,USA,32.33111111,-102.5295278
E15,Graham Municipal,Graham,TX,USA,33.11022222,-98.55527861
E19,Gruver Municipal,Gruver,TX,USA,36.23372611,-101.4321894
E24,Whiteriver,Whiteriver,AZ,USA,33.81255056,-109.9867658
E25,Wickenburg Municipal,Wickenburg,AZ,USA,33.96891833,-112.7985128
E26,Lea County,Jal,NM,USA,32.13107833,-103.1548506
E35,Fabens,Fabens,TX,USA,31.51567306,-106.1471978
E38,Alpine-Casparis Municipal,Alpine,TX,USA,30.38422222,-103.6835833
E42,Spearman Municipal,Spearman,TX,USA,36.221,-101.1945
E51,Bagdad,Bagdad,AZ,USA,34.59585278,-113.170195
E52,Oldham County,Vega,TX,USA,35.23199833,-102.3990931
E60,Eloy Municipal,Eloy,AZ,USA,32.80700583,-111.58679
E63,Gila Bend Municipal,Gila Bend,AZ,USA,32.95810083,-112.6782181
E80,Alexander Municipal,Belen,NM,USA,34.64519778,-106.8336958
E89,Conchas State Park,Conchas Dam,NM,USA,35.36671583,-104.1880314
E91,Chinle Municipal,Chinle,AZ,USA,36.11088056,-109.5754222
E94,Glenwood-Catron County,Glenwood,NM,USA,33.35283972,-108.8672858
E95,Benson Municipal,Benson,AZ,USA,31.99972222,-110.3572222
EAA,Eagle,Eagle,AK,USA,64.77639306,-141.1509206
EAN,Phifer Airfield,Wheatland,WY,USA,42.05552528,-104.9327492
EAR,Kearney Municipal,Kearney,NE,USA,40.72702778,-99.00677778
EAT,Pangborn Memorial,Wenatchee,WA,USA,47.39886111,-120.2068333
EAU,Chippewa Valley Regional,Eau Claire,WI,USA,44.86525722,-91.48507194
EBS,Webster City Municipal,Webster City,IA,USA,42.43663889,-93.86886111
ECG,Elizabeth City CG Air Station/Municipal,Elizabeth City,NC,USA,36.26057417,-76.17459778
ECS,Mondell,Newcastle,WY,USA,43.88545056,-104.3179178
EDE,Edenton Municipal,Edenton,NC,USA,36.027735,-76.56709333
EDN,Enterprise Municipal,Enterprise,AL,USA,31.29972222,-85.89986111
EED,Needles,Needles,CA,USA,34.76619444,-114.6232931
EEK,Eek,Eek,AK,USA,60.21590417,-162.0056092
EEN,Dillant-Hopkins,Keene,NH,USA,42.89839944,-72.27078111
EEO,Meeker,Meeker,CO,USA,40.04886222,-107.8859067
EET,Shelby County,Alabaster,AL,USA,33.17781083,-86.78323722
EFC,Belle Fourche Municipal,Belle Fourche,SD,USA,44.7342075,-103.8619925
EFD,Ellington,Houston,TX,USA,29.60733333,-95.15875
EFK,Newport State,Newport,VT,USA,44.88879722,-72.22915833
EFT,Monroe Municipal,Monroe,WI,USA,42.61493972,-89.59075583
EFW,Jefferson Municipal,Jefferson,IA,USA,42.01016667,-94.34258333
EGE,Eagle County Regional,Eagle,CO,USA,39.64256778,-106.9176953
EGQ,Emmetsburg Municipal,Emmetsburg,IA,USA,43.10202056,-94.704675
EGT,Wellington Municipal,Wellington,KS,USA,37.32441028,-97.38732333
EGV,Eagle River Union,Eagle River,WI,USA,45.93179639,-89.26906778
EHA,Elkhart-Morton County,Elkhart,KS,USA,37.00188194,-101.8821258
EHO,Shelby Municipal,Shelby,NC,USA,35.25555556,-81.60099722
EHR,Henderson City-County,Henderson,KY,USA,37.8078425,-87.68569
EII,Egegik,Egegik,AK,USA,58.18837472,-157.3809872
EIW,County Memorial,New Madrid,MO,USA,36.53531083,-89.59971722
EKA,Murray,Eureka,CA,USA,40.80338889,-124.1127917
EKM,Elkhart Municipal,Elkhart,IN,USA,41.71935833,-86.00168361
EKN,Elkins-Randolph Co-Jennings Randolph,Elkins,WV,USA,38.88944444,-79.85713889
EKO,Elko Regional,Elko,NV,USA,40.82492611,-115.7916964
EKQ,Wayne County,Monticello,KY,USA,36.85527778,-84.85613889
EKX,Elizabethtown,Elizabethtown,KY,USA,37.68694444,-85.92377778
EKY,Bessemer Municipal,Bessemer,AL,USA,33.31288444,-86.92591889
ELA,Eagle Lake Municipal,Eagle Lake,TX,USA,29.60301389,-96.32248444
ELD,South Arkansas Regional At Goodwin,El Dorado,AR,USA,33.2208625,-92.81325167
ELI,Elim,Elim,AK,USA,64.61400972,-162.2700681
ELK,Elk City Municipal,Elk City,OK,USA,35.42941083,-99.39425917
ELM,Elmira/Corning Regional,Elmira,NY,USA,42.15991361,-76.89144333
ELN,Bowers,Ellensburg,WA,USA,47.03302778,-120.5306944
ELO,Ely Municipal,Ely,MN,USA,47.82454639,-91.83073056
ELP,El Paso International,El Paso,TX,USA,31.80666667,-106.3778056
ELV,Elfin Cove SPB,Elfin Cove,AK,USA,58.19518417,-136.3473928
ELY,Ely Arpt (Yelland),Ely,NV,USA,39.29969444,-114.8418889
ELZ,Wellsville Muni Tarantine,Wellsville,NY,USA,42.10951194,-77.99194806
EMM,Kemmerer Municipal,Kemmerer,WY,USA,41.82494611,-110.5590586
EMP,Emporia Municipal,Emporia,KS,USA,38.33211111,-96.19116667
EMT,El Monte,El Monte,CA,USA,34.08600889,-118.0348453
EMV,Emporia-Greensville Regional,Emporia,VA,USA,36.68691667,-77.48280556
ENA,Kenai Municipal,Kenai,AK,USA,60.572,-151.2475278
ENL,Centralia Municipal,Centralia,IL,USA,38.51479889,-89.09217944
ENM,Emmonak,Emmonak,AK,USA,62.78518639,-164.4910461
ENN,Nenana Municipal,Nenana,AK,USA,64.54898167,-149.0735053
ENV,Wendover,Wendover,UT,USA,40.71869528,-114.03089
ENW,Kenosha Regional,Kenosha,WI,USA,42.5957075,-87.92780333
EOK,Keokuk Municipal,Keokuk,IA,USA,40.45990778,-91.42850111
EOS,Neosho Memorial,Neosho,MO,USA,36.81080556,-94.39169444
EPH,Ephrata Muni,Ephrata,WA,USA,47.30758333,-119.5158889
EPM,Eastport Municipal,Eastport,ME,USA,44.91011111,-67.01269444
EQA,Captain Jack Thomas,El Dorado,KS,USA,37.77410833,-96.81762778
EQY,Monroe,Monroe,NC,USA,35.01884306,-80.62023444
ERI,Erie Intl,Erie,PA,USA,42.08202139,-80.17621556
ERV,Kerrville Muni/Louis Schreiner,Kerrville,TX,USA,29.976735,-99.08567972
ERY,Luce County Hale,Newberry,MI,USA,46.31118694,-85.45731639
ESC,Delta County,Escanaba,MI,USA,45.72266972,-87.09373139
ESF,Esler Regional,Alexandria,LA,USA,31.3949025,-92.29577194
ESN,Easton /Newnam,Easton,MD,USA,38.80416667,-76.069
EST,Estherville Municipal,Estherville,IA,USA,43.40744444,-94.74641667
ETB,West Bend Municipal,West Bend,WI,USA,43.42219444,-88.12792667
ETC,Edgecombe County,Tarboro,NC,USA,35.93710083,-77.54663833
ETH,Wheaton Municipal,Wheaton,MN,USA,45.78046056,-96.54353972
ETN,Eastland Municipal,Eastland,TX,USA,32.41349167,-98.80975667
EUF,Weedon,Eufaula,AL,USA,31.95131917,-85.128925
EUG,Mahlon Sweet,Eugene,OR,USA,44.12326,-123.2186856
EUL,Caldwell Industrial,Caldwell (Boise),ID,USA,43.64186111,-116.6357778
EVB,New Smyrna Beach Municipal,New Smyrna Beach,FL,USA,29.05580556,-80.94836111
EVM,Eveleth-Virginia Muni,Eveleth,MN,USA,47.42507778,-92.49846944
EVU,Maryville Memorial,Maryville,MO,USA,40.35260167,-94.91552722
EVV,Evansville Regional,Evansville,IN,USA,38.03799139,-87.53062667
EVW,Evanston-Uinta County Burns,Evanston,WY,USA,41.27494528,-111.0321286
EVY,Summit Airpark,Middletown,DE,USA,39.52038889,-75.72044444
EWB,New Bedford Municipal,New Bedford,MA,USA,41.67614167,-70.95694167
EWK,Newton-City-County,Newton,KS,USA,38.05710528,-97.27522861
EWN,Craven County Regional,New Bern,NC,USA,35.07297222,-77.04294444
EWR,Newark Intl,Newark,NJ,USA,40.69249722,-74.16866056
EWU,Newtok,Newtok,AK,USA,60.93865417,-164.6412147
EXI,Excursion Inlet SPB,Excursion Inlet,AK,USA,58.42049861,-135.4490328
EXX,Davidson County,Lexington,NC,USA,35.78114028,-80.30378194
EYE,Eagle Creek Airpark,Indianapolis,IN,USA,39.83070944,-86.29438056
EYW,Key West International,Key West,FL,USA,24.55611111,-81.75955556
EZI,Kewanee Municipal,Kewanee,IL,USA,41.20520361,-89.96386
EZM,Eastman-Dodge County,Eastman,GA,USA,32.21425,-83.12802778
EZZ,Cameron Memorial,Cameron,MO,USA,39.72755972,-94.276375
F00,Jones,Bonham,TX,USA,33.61172222,-96.17938889
F01,Quanah Municipal,Quanah,TX,USA,34.27708306,-99.75926861
F05,Vernon - Wilbarger County,Vernon,TX,USA,34.22566806,-99.28375
F06,Marian Airpark,Wellington,TX,USA,34.84561083,-100.1959481
F08,Eufaula Municipal,Eufaula,OK,USA,35.29593194,-95.62526417
F10,Henryetta Municipal,Henryetta,OK,USA,35.40687972,-96.01583278
F12,Rusk County,Henderson,TX,USA,32.14172222,-94.85172222
F17,Center Municipal,Center,TX,USA,31.83158333,-94.15641667
F18,Cleburne Municipal,Cleburne,TX,USA,32.35376389,-97.43375
F21,Memphis Municipal,Memphis,TX,USA,34.73958944,-100.5297008
F22,Perry Municipal,Perry,OK,USA,36.38559583,-97.27721083
F24,Minden-Webster,Minden,LA,USA,32.64601,-93.29808556
F28,El Reno Municipal,El Reno,OK,USA,35.47163639,-98.00599444
F29,Clarence E. Page Municipal,Oklahoma City,OK,USA,35.4880825,-97.82354556
F30,Sulphur Municipal,Sulphur,OK,USA,34.52453278,-96.98973944
F31,Lake Texoma State Park,Kingston,OK,USA,33.99287639,-96.64249722
F32,Healdton Municipal,Healdton,OK,USA,34.24925806,-97.47391306
F36,Cordell Municipal,Cordell,OK,USA,35.30421917,-98.96702167
F37,Wauchula Municipal,Wauchula,FL,USA,27.51364889,-81.88063917
F39,Grayson County,Sherman/Denison,TX,USA,33.71411111,-96.67366667
F41,Ennis Municipal,Ennis,TX,USA,32.32969444,-96.66388889
F44,Athens Jones Municipal,Athens,TX,USA,32.16384778,-95.82835306
F45,North Palm Beach County General Aviation,West Palm Beach,FL,USA,26.84537306,-80.22148111
F46,Rockwall Municipal,Rockwall,TX,USA,32.93059444,-96.43548556
F49,Slaton Municipal,Slaton,TX,USA,33.48481,-101.6607158
F51,Winnsboro Municipal,Winnsboro,TX,USA,32.93884556,-95.27886083
F53,Franklin County,Mount Vernon,TX,USA,33.21530583,-95.2374925
F55,Granbury Municipal,Granbury,TX,USA,32.44441583,-97.8169475
F56,Arledge,Stamford,TX,USA,32.91019472,-99.73422972
F70,French Valley,Murieta/Temecula,CA,USA,33.57605556,-117.1279722
F80,Atoka Municipal,Atoka,OK,USA,34.39833889,-96.14805972
F81,Okemah Flying,Okemah,OK,USA,35.42925306,-96.28778361
F84,Stigler Municipal,Stigler,OK,USA,35.28910556,-95.09389722
F85,Morton-Cochran County,Morton,TX,USA,33.72926389,-102.7338183
F87,Farmerville,Farmerville,LA,USA,32.72495583,-92.33716583
F88,Jonesboro,Jonesboro,LA,USA,32.20199028,-92.73293028
F89,Winnsboro Municipal,Winnsboro,LA,USA,32.15431917,-91.70012472
F91,Thomas P Stafford,Weatherford,OK,USA,35.54482944,-98.66849028
F99,Holdenville Municipal,Holdenville,OK,USA,35.085875,-96.41666667
FAI,Fairbanks International,Fairbanks,AK,USA,64.8136775,-147.8596694
FAM,Farmington Regional,Farmington,MO,USA,37.76107917,-90.42859722
FAQ,Fitiuta,Fitiuta Village,AS,USA,14.21577583,-169.4239058
FAR,Hector International,Fargo,ND,USA,46.91934889,-96.81498889
FAT,Fresno Yosemite International,Fresno,CA,USA,36.77619444,-119.7181389
FAY,Fayetteville Municipal,Fayetteville,NC,USA,34.99147222,-78.88
FBL,Faribault Municipal,Faribault,MN,USA,44.32468556,-93.31082889
FBR,Fort Bridger,Fort Bridger,WY,USA,41.39193583,-110.4067961
FBY,Fairbury Municipal,Fairbury,NE,USA,40.18297222,-97.16927778
FCA,Glacier Park Intl,Kalispell,MT,USA,48.31140472,-114.2550694
FCH,Fresno-Chandler Downtown,Fresno,CA,USA,36.732365,-119.8198961
FCI,Chesterfield County,Richmond,VA,USA,37.4065375,-77.52498667
FCM,Flying Cloud,Minneapolis,MN,USA,44.82724111,-93.45714639
FCY,Forrest City Municipal,Forrest City,AR,USA,34.94199806,-90.77496611
FDK,Frederick Municipal,Frederick,MD,USA,39.41758333,-77.37430556
FDR,Frederick Municipal,Frederick,OK,USA,34.35219472,-98.98460222
FDW,Fairfield County,Winnsboro,SC,USA,34.31547222,-81.10880556
FDY,Findlay,Findlay,OH,USA,41.01352778,-83.66869444
FEP,Albertus,Freeport,IL,USA,42.24626722,-89.58223944
FET,Fremont Municipal,Fremont,NE,USA,41.44913889,-96.52019444
FFA,First Flight,Kill Devil Hills,NC,USA,36.01822278,-75.67128694
FFC,Peachtree City - Falcon,Atlanta,GA,USA,33.35725,-84.57183333
FFL,Fairfield Municipal,Fairfield,IA,USA,41.05332417,-91.97892333
FFM,Fergus Falls Muni-Einar Mickelson,Fergus Falls,MN,USA,46.28439389,-96.15668556
FFT,Capital City,Frankfort,KY,USA,38.18248861,-84.90470083
FFZ,Falcon,Mesa,AZ,USA,33.46083333,-111.7283333
FGX,Fleming-Mason,Flemingsburg,KY,USA,38.54180556,-83.74338889
FHR,Friday Harbor,Friday Harbor,WA,USA,48.52197222,-123.0243611
FHU,Libby AAF-Sierra Vista Municipal,Fort Huachuca-Sierra Vista,AZ,USA,31.58847222,-110.3443889
FIG,Clearfield-Lawrence,Clearfield,PA,USA,41.04861306,-78.41310306
FIT,Fitchburg Municipal,Fitchburg,MA,USA,42.55412194,-71.75895639
FKL,Chess-Lamberton,Franklin,PA,USA,41.37787361,-79.86036167
FKN,Franklin Municipal-John Beverly Rose,Franklin,VA,USA,36.69817806,-76.90312694
FKR,Frankfort Municipal,Frankfort,IN,USA,40.27343083,-86.56217028
FLD,Fond Du Lac County,Fond Du Lac,WI,USA,43.77117417,-88.48842917
FLG,Flagstaff Pulliam,Flagstaff,AZ,USA,35.13845472,-111.6712183
FLL,Fort Lauderdale-Hollywood Int'l,Ft. Lauderdale,FL,USA,26.07258333,-80.15275
FLO,Florence Regional,Florence,SC,USA,34.18536111,-79.72388889
FLP,Marion County Regional,Flippin,AR,USA,36.29087528,-92.59023417
FLT,Flat,Flat,AK,USA,62.45264889,-157.98907
FLX,Fallon Municipal,Fallon,NV,USA,39.499545,-118.7490197
FME,Tipton,Odenton,MD,USA,39.08538667,-76.75941444
FMN,Four Corners Regional,Farmington,NM,USA,36.74125,-108.2299444
FMY,Page,Ft. Myers,FL,USA,26.58661111,-81.86325
FMZ,Fairmont State,Fairmont,NE,USA,40.58569444,-97.57305556
FNB,Brenner,Falls City,NE,USA,40.07878611,-95.59199167
FNL,Fort Collins-Loveland,Fort Collins/Loveland,CO,USA,40.45182722,-105.0113356
FNR,Funter Bay SPB,Funter Bay,AK,USA,58.25438583,-134.8979067
FNT,Bishop,Flint,MI,USA,42.96550333,-83.74345639
FOA,Flora,Flora,IL,USA,38.66494528,-88.45299556
FOD,Fort Dodge Municipal,Fort Dodge,IA,USA,42.55145611,-94.19255111
FOE,Forbes,Topeka,KS,USA,38.95095194,-95.66361444
FOK,Francis Gabreski,Westhampton Beach,NY,USA,40.84365472,-72.63178917
FOT,Rohnerville,Fortuna,CA,USA,40.55393583,-124.1326589
FPR,St. Lucie County International,Ft. Pierce,FL,USA,27.49505556,-80.36827778
FQD,Rutherford County-Marchman,Rutherfordton,NC,USA,35.42822222,-81.93507778
FRG,Republic,Farmingdale,NY,USA,40.72878111,-73.41340722
FRH,French Lick Municipal,French Lick,IN,USA,38.50622139,-86.63693528
FRM,Fairmont Municipal,Fairmont,MN,USA,43.64394111,-94.41561556
FRR,Front Royal-Warren County,Front Royal,VA,USA,38.9175325,-78.25351472
FSD,Joe Foss,Sioux Falls,SD,USA,43.58135111,-96.74170028
FSE,Fosston Municipal,Fosston,MN,USA,47.59282028,-95.77349889
FSK,Fort Scott Municipal,Fort Scott,KS,USA,37.79843056,-94.76938111
FSM,Fort Smith Regional,Fort Smith,AR,USA,35.33659028,-94.36744111
FSO,Franklin County State,Highgate,VT,USA,44.94028083,-73.09746
FST,Fort Stockton - Pecos County,Fort Stockton,TX,USA,30.91566667,-102.9161389
FSU,Fort Sumner Municipal,Fort Sumner,NM,USA,34.48339944,-104.2171967
FSW,Fort Madison Municipal,Fort Madison,IA,USA,40.6592625,-91.3268175
FTG,Front Range,Denver,CO,USA,39.78525,-104.5431389
FTT,Elton Hensley Memorial,Fulton,MO,USA,38.83987472,-92.00421056
FTW,Fort Worth Meacham International,Fort Worth,TX,USA,32.81977778,-97.36244444
FTY,Fulton County - Brown,Atlanta,GA,USA,33.77913889,-84.52136111
FUL,Fullerton Municipal,Fullerton,CA,USA,33.87201417,-117.9797842
FVE,Northern Aroostook Regional,Frenchville,ME,USA,47.28550417,-68.31275
FVX,Farmville Municipal,Farmville,VA,USA,37.35752861,-78.43779806
FWA,Fort Wayne International,Fort Wayne,IN,USA,40.97846583,-85.19514639
FWC,Fairfield Municipal,Fairfield,IL,USA,38.37863306,-88.41265222
FWN,Sussex,Sussex,NJ,USA,41.20020667,-74.62305056
FWS,Spinks,Fort Worth,TX,USA,32.56522778,-97.30807778
FXE,Fort Lauderdale Executive,Ft. Lauderdale,FL,USA,26.19728,-80.17070833
FXY,Forest City Municipal,Forest City,IA,USA,43.23473417,-93.6241025
FYE,Fayette County,Somerville,TN,USA,35.20592,-89.39441667
FYM,Fayetteville Municipal,Fayetteville,TN,USA,35.05836278,-86.56441139
FYU,Fort Yukon,Fort Yukon,AK,USA,66.57149028,-145.2504169
FYV,Fayetteville Municipal,Fayetteville,AR,USA,36.00509472,-94.17005694
FZG,Fitzgerald Municipal,Fitzgerald,GA,USA,31.68368667,-83.27046056
FZI,Fostoria Metropolitan,Fostoria,OH,USA,41.19083111,-83.39453639
FZY,Oswego Cty,Fulton,NY,USA,43.35077528,-76.38805361
GAB,Gabbs,Gabbs,NV,USA,38.92409111,-117.9590072
GAD,Gadsden Municipal,Gadsden,AL,USA,33.97262528,-86.08900139
GAF,Grafton Municipal,Grafton,ND,USA,48.40469444,-97.37094444
GAG,Gage,Gage,OK,USA,36.29553889,-99.77642361
GAI,Montgomery Co Airpark,Gaithersburg,MD,USA,39.16833611,-77.166
GAL,Edward G. Pitka Sr.,Galena,AK,USA,64.73617806,-156.9374164
GAM,Gambell,Gambell,AK,USA,63.76676556,-171.7328236
GAS,Gallia - Meigs Regional,Gallipolis,OH,USA,38.83410833,-82.16342306
GBD,Great Bend Municipal,Great Bend,KS,USA,38.34441861,-98.85917028
GBG,Galesburg Municipal,Galesburg,IL,USA,40.93800194,-90.43112556
GBH,Galbraith Lake,Galbraith Lake,AK,USA,68.47906306,-149.4900214
GBR,Great Barrington,Great Barrington,MA,USA,42.18421417,-73.40324056
GCC,Gillette-Campbell County,Gillette,WY,USA,44.34889806,-105.5393614
GCK,Garden City Regional,Garden City,KS,USA,37.92751556,-100.7244147
GCM,Claremore Regional,Claremore,OK,USA,36.29441667,-95.47966667
GCN,Grand Canyon National Park,Grand Canyon,AZ,USA,35.95235389,-112.1469647
GCT,Guthrie County Regional,Guthrie Center,IA,USA,41.68776417,-94.43524611
GCY,Greeneville Municipal,Greeneville,TN,USA,36.19299083,-82.81507028
GDM,Gardner Municipal,Gardner,MA,USA,42.54986639,-72.01602194
GDV,Dawson Community,Glendive,MT,USA,47.13871861,-104.8071994
GDW,Gladwin,Gladwin,MI,USA,43.97063278,-84.47503861
GDY,Grundy Municipal,Grundy,VA,USA,37.23240111,-82.12499083
GED,Sussex Cty Arpt,Georgetown,DE,USA,38.68919444,-75.35888889
GEG,Spokane Intl,Spokane,WA,USA,47.61985556,-117.5338425
GEO,Brown County,Georgetown,OH,USA,38.88195778,-83.88273278
GEU,Glendale Municipal,Glendale,AZ,USA,33.52726278,-112.2951564
GEY,South Big Horn County,Greybull,WY,USA,44.51644444,-108.0831944
GEZ,Shelbyville Municipal,Shelbyville,IN,USA,39.58316583,-85.80481
GFK,Grand Forks International,Grand Forks,ND,USA,47.949255,-97.17611111
GFL,Floyd D. Bennett,Glens Falls,NY,USA,43.34121,-73.6103075
GFZ,Greenfield Municipal,Greenfield,IA,USA,41.32702778,-94.44572222
GGE,Georgetown County,Georgetown,SC,USA,33.31169444,-79.31958333
GGF,Grant Municipal,Grant,NE,USA,40.86952778,-101.7328611
GGG,Gregg County,Longview,TX,USA,32.38486111,-94.71171
GGI,Grinnell Municipal,Grinnell,IA,USA,41.70916083,-92.73491278
GGP,Logansport Municipal,Logansport,IN,USA,40.71126139,-86.37449917
GGW,Wokal Field/Glasgow Intl,Glasgow,MT,USA,48.21246417,-106.6148231
GHM,Centerville Municipal,Centerville,TN,USA,35.83742722,-87.445375
GHW,Glenwood Municipal,Glenwood,MN,USA,45.64389167,-95.32043056
GIF,Winter Havens Gilbert,Winter Haven,FL,USA,28.06291667,-81.75330556
GJT,Walker,Grand Junction,CO,USA,39.1224125,-108.5267347
GKJ,Port Meadville,Meadville,PA,USA,41.62652667,-80.2147275
GKN,Gulkana,Gulkana,AK,USA,62.15488889,-145.4566389
GKT,Gatlinburg-Pigeon Forge,Sevierville,TN,USA,35.85775889,-83.52870472
GKY,Arlington Municipal,Arlington,TX,USA,32.66241528,-97.09391139
GLD,Renner Field/Goodland Municipal,Goodland,KS,USA,39.37062194,-101.6989919
GLE,Gainesville Municipal,Gainesville,TX,USA,33.65136111,-97.19702778
GLH,Mid Delta Regional,Greenville,MS,USA,33.48288111,-90.98561389
GLR,Otsego County,Gaylord,MI,USA,45.01354806,-84.70318944
GLS,Galveston-Scholes,Galveston,TX,USA,29.26532333,-94.86040667
GLW,Glasgow Municipal,Glasgow,KY,USA,37.03205556,-85.95261111
GLY,Clinton Memorial,Clinton,MO,USA,38.35657306,-93.68417694
GMJ,Grove Municipal,Grove,OK,USA,36.60527056,-94.73856667
GMU,Greenville Downtown,Greenville,SC,USA,34.84794444,-82.35
GNB,Granby-Grand County,Granby,CO,USA,40.08970806,-105.9172367
GNF,Grenada Municipal,Grenada,MS,USA,33.83253,-89.79822806
GNG,Gooding Municipal,Gooding,ID,USA,42.91716639,-114.7651575
GNT,Grants-Milan Municipal,Grants,NM,USA,35.16531472,-107.9006142
GNU,Goodnews,Goodnews,AK,USA,59.11727556,-161.5813967
GNV,Gainesville Regional,Gainesville,FL,USA,29.69005556,-82.27177778
GOK,Guthrie Municipal,Guthrie,OK,USA,35.84980556,-97.41560833
GON,Groton-New London,Groton,CT,USA,41.33005778,-72.04513556
GPH,Clay County Regional,Mosby,MO,USA,39.33046528,-94.30997361
GPM,Grand Prairie Municipal,Grand Prairie,TX,USA,32.69858333,-97.04652778
GPT,Gulfport-Biloxi Regional,Gulfport-Biloxi,MS,USA,30.40728028,-89.07009278
GPZ,Grand Rapids-Itasca County,Grand Rapids,MN,USA,47.21110333,-93.50984472
GQQ,Galion Municipal,Galion,OH,USA,40.75338889,-82.72380556
GRB,Austin Straubel International,Green Bay,WI,USA,44.48507333,-88.12959
GRD,Greenwood County,Greenwood,SC,USA,34.24872222,-82.15908333
GRE,Greenville,Greenville,IL,USA,38.83615778,-89.37841111
GRI,Central Nebraska Regional,Grand Island,NE,USA,40.96747222,-98.30861111
GRK,Robert Gray AAF,Killeen,TX,USA,31.06489778,-97.82779778
GRN,Gordon Municipal,Gordon,NE,USA,42.80597222,-102.17525
GRO,Rota International,Rota Island,CQ,USA,14.1743075,-145.2425353
GRR,Kent County International,Grand Rapids,MI,USA,42.88081972,-85.52276778
GSH,Goshen Municipal,Goshen,IN,USA,41.52716028,-85.79210278
GSN,Saipan International,Obyan,CQ,USA,15.11900139,-145.7293561
GSO,Piedmont Triad International,Greensboro,NC,USA,36.09774694,-79.9372975
GSP,Greenville-Spartanburg,Greer,SC,USA,34.89566722,-82.21885833
GST,Gustavus,Gustavus,AK,USA,58.42438139,-135.7073814
GTF,Great Falls Intl,Great Falls,MT,USA,47.48200194,-111.3706853
GTR,Golden Triangle Regional,Columbus-Starkville-West Point,MS,USA,33.45033444,-88.59136861
GTU,Georgetown Municipal,Georgetown,TX,USA,30.67880889,-97.67938389
GUC,Gunnison County,Gunnison,CO,USA,38.53396333,-106.9331817
GUM,Guam International,Agana,GU,USA,13.48345,-144.7959825
GUP,Gallup Municipal,Gallup,NM,USA,35.51105833,-108.7893094
GUY,Guymon Municipal,Guymon,OK,USA,36.68507194,-101.5077817
GVL,Lee Gilmer Memorial,Gainesville,GA,USA,34.27290389,-83.82681333
GVQ,Genesee Cty,Batavia,NY,USA,43.03172639,-78.16759972
GVT,Majors,Greenville,TX,USA,33.06783889,-96.0653325
GWO,Greenwood-Leflore,Greenwood,MS,USA,33.49432667,-90.084705
GWR,Gwinner-Roger Melroe,Gwinner,ND,USA,46.21872222,-97.64325
GWW,Goldsboro-Wayne Municipal,Goldsboro,NC,USA,35.46055444,-77.96493306
GXY,Greeley-Weld County,Greeley,CO,USA,40.43561833,-104.6321156
GYH,Donaldson Center,Greenville,SC,USA,34.75831917,-82.376415
GYR,Phoenix Goodyear,Goodyear,AZ,USA,33.42281972,-112.3759919
GYY,Gary/Chicago,Gary,IN,USA,41.61627306,-87.41278806
GZH,Middleton,Evergreen,AL,USA,31.41580111,-87.04404333
GZS,Abernathy,Pulaski,TN,USA,35.15371972,-87.05681444
H04,Vinita Municipal,Vinita,OK,USA,36.63301806,-95.15136111
H05,Wilburton Municipal,Wilburton,OK,USA,34.91954278,-95.39469722
H19,Bowling Green Municipal,Bowling Green,MO,USA,39.36993361,-91.21925556
H21,Camdenton Memorial,Camdenton,MO,USA,37.97468528,-92.69161528
H30,Hamilton Municipal,Hamilton,NY,USA,42.84381889,-75.56140194
H35,Clarksville Municipal,Clarksville,AR,USA,35.47069417,-93.427155
H41,Memorial,Mexico,MO,USA,39.15751389,-91.81826667
H45,Seminole Municipal,Seminole,OK,USA,35.27467806,-96.67516194
H66,Nowata Municipal,Nowata,OK,USA,36.72092222,-95.62525583
H71,Mid-America Industrial,Pryor,OK,USA,36.22539389,-95.33006333
H79,Eldon Model Airpark,Eldon,MO,USA,38.36062611,-92.57157139
H88,Municipal,Fredericktown,MO,USA,37.605825,-90.28731389
H92,Hominy,Hominy,OK,USA,36.43340222,-96.38362861
H96,Benton Municipal,Benton,IL,USA,38.00675111,-88.93441528
H97,Pawnee Municipal,Pawnee,OK,USA,36.38338556,-96.8103125
HAB,Marion County,Hamilton,AL,USA,34.11757222,-87.99819583
HAE,Hannibal Municipal,Hannibal,MO,USA,39.72448944,-91.44367944
HAF,Half Moon Bay,Half Moon Bay,CA,USA,37.51382944,-122.5010892
HAI,Three Rivers Municipal,Three Rivers,MI,USA,41.95975,-85.59338889
HAO,Hamilton-Fairfield,Hamilton,OH,USA,39.36448861,-84.52457722
HAY,Haycock,Haycock,AK,USA,65.20098944,-161.1567792
HBC,Mohall Municipal,Mohall,ND,USA,48.76838333,-101.5369953
HBG,Bobby L. Chain Municipal,Hattiesburg,MS,USA,31.26506556,-89.2530325
HBR,Hobart Municipal,Hobart,OK,USA,34.9913075,-99.0513525
HBV,Jim Hogg County,Hebbronville,TX,USA,27.34955556,-98.73697222
HBZ,Heber Springs Municipal,Heber Springs,AR,USA,35.51169389,-92.01300944
HCD,Hutchinson Municipal,Hutchinson,MN,USA,44.85890667,-94.38178917
HCO,Hallock Municipal,Hallock,MN,USA,48.75273139,-96.94300306
HDC,Hammond Municipal,Hammond,LA,USA,30.52096889,-90.41762056
HDE,Brewster,Holdredge,NE,USA,40.45269444,-99.33733333
HDH,Dillingham Airfield,Mokuleia,HI,USA,21.57947361,-158.1972814
HDI,Hardwick,Cleveland,TN,USA,35.22007306,-84.83244333
HDN,Yampa Valley,Hayden,CO,USA,40.48118028,-107.2176597
HDO,Hondo Municipal,Hondo,TX,USA,29.35952778,-99.17666667
HEE,Thompson-Robbins,Helena-West Helena,AR,USA,34.57648972,-90.67588639
HEF,Manassas Reg./Harry P Davis,Manassas,VA,USA,38.72141667,-77.51544444
HEI,Hettinger Municipal,Hettinger,ND,USA,46.01494444,-102.6559722
HEQ,Holyoke,Holyoke,CO,USA,40.56943056,-102.2726875
HEZ,Natchez-Adams County,Natchez,MS,USA,31.61366111,-91.29733639
HFD,Hartford Brainard,Hartford,CT,USA,41.73626861,-72.65021389
HFY,Greenwood Municipal,Indianapolis/Greenwood,IN,USA,39.62841667,-86.08788889
HGR,Hagerstown Regional-Richard Henson,Hagerstown,MD,USA,39.70794444,-77.7295
HHF,Hemphill County,Canadian,TX,USA,35.89530778,-100.4036397
HHG,Huntington Municipal,Huntington,IN,USA,40.85299,-85.45941917
HHH,Hilton Head,NA,NA,USA,32.224384,-80.697629
HHR,Jack Northrop Field/Hawthorne Municipal,Hawthorne,CA,USA,33.92283972,-118.3351872
HHW,Stan Stamper Municipal,Hugo,OK,USA,34.03482556,-95.54190611
HI01,Princeville,Hanalei,HI,USA,22.20919,-159.4455339
HIB,Chisholm-Hibbing,Hibbing,MN,USA,47.38659917,-92.83899333
HIE,Mt Washington Regional,Whitefield,NH,USA,44.36761639,-71.54447111
HIG,Higginsville Industrial Municipal,Higginsville,MO,USA,39.07334639,-93.67716083
HII,Lake Havasu City,Lake Havasu City,AZ,USA,34.56816056,-114.3561783
HIO,Portland-Hillsboro,Hillsboro (Portland),OR,USA,45.54039389,-122.9498258
HJH,Hebron Municipal,Hebron,NE,USA,40.15225,-97.58697222
HJO,Hanford Municipal,Hanford,CA,USA,36.31852194,-119.6288675
HKA,Blytheville Municipal,Blytheville,AR,USA,35.94040667,-89.83080583
HKS,Hawkins,Jackson,MS,USA,32.3347725,-90.22253167
HKY,Hickory Municipal,Hickory,NC,USA,35.74114639,-81.38954889
HLC,Hill City Municipal,Hill City,KS,USA,39.37883611,-99.83149444
HLG,Wheeling-Ohio Cty,Wheeling,WV,USA,40.175,-80.64627778
HLN,Helena Regional,Helena,MT,USA,46.60681806,-111.9827503
HLX,Twin County,Galax,VA,USA,36.76611472,-80.82356556
HMT,Hemet-Ryan,Hemet,CA,USA,33.73398167,-117.0225258
HMZ,Bedford County,Bedford,PA,USA,40.08536861,-78.51221778
HNB,Huntingburg,Huntingburg,IN,USA,38.24902583,-86.95371833
HNH,Hoonah,Hoonah,AK,USA,58.09609139,-135.4096975
HNL,Honolulu International,Honolulu,HI,USA,21.31869111,-157.9224072
HNM,Hana,Hana,HI,USA,20.79563722,-156.0144378
HNR,Harlan Municipal,Harlan,IA,USA,41.58438889,-95.33963889
HNS,Haines,Haines,AK,USA,59.24522806,-135.5221086
HNZ,Henderson-Oxford,Oxford,NC,USA,36.36156111,-78.52916639
HOB,Lea County Regional,Hobbs,NM,USA,32.68752778,-103.2170278
HOC,Highland County,Hillsboro,OH,USA,39.18875944,-83.53880694
HOE,Homerville,Homerville,GA,USA,31.05591667,-82.77413889
HOM,Homer,Homer,AK,USA,59.64555556,-151.4765833
HON,Huron Regional,Huron,SD,USA,44.38520056,-98.2285425
HOT,Memorial,Hot Springs,AR,USA,34.47803389,-93.09620833
HOU,William P Hobby,Houston,TX,USA,29.64541861,-95.27888889
HPB,Hooper Bay,Hooper Bay,AK,USA,61.52418306,-166.1467797
HPN,Westchester Cty,White Plains,NY,USA,41.06695778,-73.70757444
HPT,Hampton Municipal,Hampton,IA,USA,42.72372361,-93.22634056
HQG,Hugoton Municipal,Hugoton,KS,USA,37.16308056,-101.3705267
HQM,Bowerman,Hoquiam,WA,USA,46.97120167,-123.9365581
HQU,Thomson-McDuffie County,Thomson,GA,USA,33.52972639,-82.51678556
HQZ,Mesquite Metro,Mesquite,TX,USA,32.74696278,-96.53041722
HRI,Hermiston Muni,Hermiston,OR,USA,45.82822222,-119.2591667
HRL,Valley International,Harlingen,TX,USA,26.22850611,-97.65439389
HRO,Boone County,Harrison,AR,USA,36.26152056,-93.15472889
HRR,Healy River,Healy,AK,USA,63.86620806,-148.9689842
HRU,Herington Municipal,Herington,KS,USA,38.68322389,-96.80800639
HRX,Hereford Municipal,Hereford,TX,USA,34.85761639,-102.3272017
HSA,Stennis International,Bay St Louis,MS,USA,30.36780778,-89.45461083
HSB,Harrisburg-Raleigh,Harrisburg,IL,USA,37.8115,-88.54913889
HSE,Billy Mitchell,Hatteras,NC,USA,35.2327875,-75.617795
HSI,Hastings Municipal,Hastings,NE,USA,40.60525,-98.42788889
HSL,Huslia,Huslia,AK,USA,65.70055556,-156.3875
HSP,Ingalls,Hot Springs,VA,USA,37.95144444,-79.83389444
HSR,Hot Springs Municipal,Hot Springs,SD,USA,43.36824528,-103.3881378
HSV,Huntsville International,Huntsville,AL,USA,34.6404475,-86.77310944
HTH,Hawthorne Municipal,Hawthorne,NV,USA,38.54436583,-118.6343003
HTL,Roscommon County,Houghton Lake,MI,USA,44.35980556,-84.67111111
HTO,East Hampton,East Hampton,NY,USA,40.95957778,-72.25185056
HTS,Tri-State/Walker-Long,Huntington,WV,USA,38.36666667,-82.55802778
HTW,"Lawrence County Airpark,Inc",Chesapeake,OH,USA,38.41924861,-82.4943225
HUF,Terre Haute International-Hulman,Terre Haute,IN,USA,39.45146361,-87.30756111
HUL,Houlton International,Houlton,ME,USA,46.12308333,-67.79205556
HUM,Houma-Terrebonne,Houma,LA,USA,29.5665,-90.66041667
HUS,Hughes,Hughes,AK,USA,66.04112167,-154.2631903
HUT,Hutchinson Municipal,Hutchinson,KS,USA,38.06548306,-97.86063361
HVC,Hopkinsville-Christian County,Hopkinsville,KY,USA,36.85658333,-87.45725
HVE,Hanksville,Hanksville,UT,USA,38.41803722,-110.7040378
HVN,Tweed-New Haven,New Haven,CT,USA,41.26389889,-72.8871
HVR,Havre City-County,Havre,MT,USA,48.542985,-109.7623419
HVS,Hartsville Municipal,Hartsville,SC,USA,34.40308333,-80.11922222
HWD,Hayward Executive,Hayward,CA,USA,37.65926528,-122.1224083
HWI,Hawk Inlet SPB,Hawk Inlet,AK,USA,58.12744139,-134.7559531
HWO,North Perry,Hollywood,FL,USA,26.00142417,-80.24052056
HWQ,Wheatland County  At Harlowton,Harlowton,MT,USA,46.4541225,-109.8549061
HWV,Brookhaven,Shirley,NY,USA,40.81676528,-72.86204722
HXD,Hilton Head,Hilton Head Island,SC,USA,32.22436111,-80.69747222
HXF,Hartford Municipal,Hartford,WI,USA,43.34927806,-88.39112528
HYA,Barnstable Mun Boardman/Polando,Hyannis,MA,USA,41.66933639,-70.28035583
HYG,Hydaburg SPB,Hydaburg,AK,USA,55.20631611,-132.8283131
HYI,San Marcos Municipal,San Marcos,TX,USA,29.89361111,-97.86469444
HYL,Hollis SPB,Hollis,AK,USA,55.48158833,-132.6460942
HYR,Sawyer County,Hayward,WI,USA,46.02585722,-91.44424278
HYS,Hays Municipal,Hays,KS,USA,38.84494167,-99.27403361
HYW,Conway-Horry County,Conway,SC,USA,33.8285,-79.12216667
HZD,Carroll County,Huntingdon,TN,USA,36.08930722,-88.46329778
HZE,Mercer County Regional,Hazen,ND,USA,47.28986111,-101.5809444
HZL,Hazleton Muni,Hazleton,PA,USA,40.98677778,-75.99488889
HZR,False River Air Park,New Roads,LA,USA,30.71832333,-91.47866972
HZY,Ashtabula County,Ashtabula,OH,USA,41.77797528,-80.69551333
I05,Sturgis Municipal,Sturgis,KY,USA,37.54083333,-87.95183333
I12,Sidney Municipal,Sidney,OH,USA,40.24127944,-84.15101167
I16,Kee,Pineville,WV,USA,37.60044444,-81.55927778
I18,Jackson County,Ravenswood,WV,USA,38.92977778,-81.81947222
I19,Greene County,Dayton,OH,USA,39.69172639,-83.99023806
I22,Randolph County,Winchester,IN,USA,40.16885083,-84.92585333
I23,Fayette County,Washington Court House,OH,USA,39.57040167,-83.42052444
I25,Welch Muni,Welch,WV,USA,37.41678056,-81.52899417
I32,Morehead-Rowan County,Morehead,KY,USA,38.13341472,-83.53796528
I34,Greensburg-Decatur County,Greensburg,IN,USA,39.32691111,-85.52252694
I35,Tucker-Guthrie Memorial,Harlan,KY,USA,36.85981028,-83.36101639
I39,Madison County,Richmond,KY,USA,37.63152778,-84.33244444
I40,Richard Downing,Coshocton,OH,USA,40.30918056,-81.85338194
I42,Paoli Municipal,Paoli,IN,USA,38.58338806,-86.46248778
I43,James A Rhodes,Jackson,OH,USA,38.98135194,-82.57785667
I50,Stanton,Stanton,KY,USA,37.85008167,-83.84575194
I57,Pike County,Waverly,OH,USA,39.16693333,-82.928175
I63,Mt. Sterling Municipal,Mt. Sterling,IL,USA,39.9875,-90.80416667
I66,Clinton,Wilmington,OH,USA,39.50286111,-83.86305556
I67,Cincinnati West,Harrison,OH,USA,39.25894444,-84.77430556
I68,Lebanon-Warren County,Lebanon,OH,USA,39.46217306,-84.25184722
I69,Clermont County,Batavia,OH,USA,39.07839722,-84.21020722
I74,Grimes,Urbana,OH,USA,40.12928306,-83.7548775
I75,Osceola Municipal,Osceola,IA,USA,41.05221889,-93.68966222
I76,Peru Municipal,Peru,IN,USA,40.78631889,-86.14638306
I78,Union County,Marysville,OH,USA,40.22469444,-83.35161111
I83,Salem Municipal,Salem,IN,USA,38.60200167,-86.13997889
I86,Perry County,New Lexington,OH,USA,39.69159667,-82.19778583
I88,Pontiac Municipal,Pontiac,IL,USA,40.92372222,-88.6255
I93,Breckinridge County,Hardinsburg,KY,USA,37.78505944,-86.44192194
I95,Hardin County,Kenton,OH,USA,40.61072,-83.64359694
IAD,Washington Dulles International,Chantilly,VA,USA,38.94453194,-77.45580972
IAG,Niagara Falls Intl,Niagara Falls,NY,USA,43.10725861,-78.94538139
IAH,George Bush Intercontinental,Houston,TX,USA,29.98047222,-95.33972222
IAN,Bob Baker Memorial,Kiana,AK,USA,66.97937611,-160.4358597
IBM,Robert E. Arraj,Kimball,NE,USA,41.18805556,-103.6773889
ICL,Schenck,Clarinda,IA,USA,40.72178361,-95.02642667
ICT,Wichita Mid-Continent,Wichita,KS,USA,37.64995889,-97.43304583
IDA,Idaho Falls Regional,Idaho Falls,ID,USA,43.51455556,-112.0701667
IDI,Indiana Cty/Jimmy Stewart,Indiana,PA,USA,40.63222222,-79.10552778
IDL,Indianola Municipal,Indianola,MS,USA,33.48574611,-90.67887611
IDP,Independence Municipal,Independence,KS,USA,37.15837222,-95.77838333
IEM,Whittier,Whittier,AK,USA,60.7772125,-148.7215775
IEN,Pine Ridge,Pine Ridge,SD,USA,43.02257694,-102.5110728
IER,Natchitoches Municipal,Natchitoches,LA,USA,31.73572,-93.09913639
IFA,Iowa Falls Municipal,Iowa Falls,IA,USA,42.47078639,-93.26995361
IFP,Laughlin/Bullhead International,Bullhead City,AZ,USA,35.15738889,-114.5595278
IGG,Igiugig,Igiugig,AK,USA,59.32373528,-155.9032733
IGM,Kingman,Kingman,AZ,USA,35.25947222,-113.9380556
IGQ,Lansing Municipal,Chicago/Lansing,IL,USA,41.53988889,-87.53216667
IGT,Nightmute,Nightmute,AK,USA,60.47032722,-164.6856414
IIB,Independence Municipal,Independence,IA,USA,42.45359833,-91.94761833
IIK,Kipnuk,Kipnuk,AK,USA,59.93295111,-164.0305131
IIY,Washington-Wilkes County,Washington,GA,USA,33.77987528,-82.81661639
IJD,Windham,Willimantic,CT,USA,41.74404028,-72.18023583
IJX,Jacksonville Municipal,Jacksonville,IL,USA,39.77429694,-90.23856583
IKK,Greater Kankakee,Kankakee,IL,USA,41.07140417,-87.84626861
IKV,Ankeny Regional,Ankeny,IA,USA,41.69128556,-93.56630333
ILE,Killeen Municipal,Killeen,TX,USA,31.08583333,-97.6865
ILG,New Castle County,Wilmington,DE,USA,39.67872222,-75.60652778
ILI,Iliamna,Iliamna,AK,USA,59.75380028,-154.9109597
ILM,Wilmington International,Wilmington,NC,USA,34.27061111,-77.90255556
IML,Imperial Municipal,Imperial,NE,USA,40.50930556,-101.6205278
IMM,Immokalee,Immokalee,FL,USA,26.43316667,-81.40102778
IMS,Madison Municipal,Madison,IN,USA,38.75888889,-85.46552778
IMT,Ford,Iron Mountain/Kingsford,MI,USA,45.81835417,-88.1145425
IN03,Indianapolis Downtown,Indianapolis,IN,USA,39.76587639,-86.148875
IND,Indianapolis International,Indianapolis,IN,USA,39.71732917,-86.29438417
INK,Winkler County,Wink,TX,USA,31.77962833,-103.2013619
INL,Falls International,International Falls,MN,USA,48.56618722,-93.40306667
INT,Smith Reynolds,Winston-Salem,NC,USA,36.13372222,-80.222
INW,Winslow-Lindbergh Regional,Winslow,AZ,USA,35.02191667,-110.7225278
IOB,Mt Sterling-Montgomery County,Mount Sterling,KY,USA,38.05813889,-83.97958333
IOW,Iowa City Municipal,Iowa City,IA,USA,41.63924389,-91.54650333
IPJ,Lincoln County,Lincolnton,NC,USA,35.48332889,-81.16125833
IPL,Imperial County,Imperial,CA,USA,32.83422028,-115.5787456
IPT,Williamsport-Lycoming Cty,Williamsport,PA,USA,41.24183583,-76.92109556
IRK,Kirksville Regional,Kirksville,MO,USA,40.09364444,-92.54496917
IRS,Kirsch Municipal,Sturgis,MI,USA,41.8128725,-85.43906111
ISM,Kissimmee Municipal,Orlando,FL,USA,28.28980556,-81.43708333
ISN,Sloulin Field International,Williston,ND,USA,48.17793861,-103.6423467
ISO,Kinston Regional Jetport At Stallin,Kinston,NC,USA,35.32807944,-77.61552611
ISP,Long Island - MacArthur,Islip,NY,USA,40.7952425,-73.10021194
ISQ,Schoolcraft County,Manistique,MI,USA,45.97464056,-86.17183056
ISW,Alexander,Wisconsin Rapids,WI,USA,44.36033833,-89.83897056
ISZ,Cincinnati-Blue Ash,Cincinnati,OH,USA,39.24669444,-84.38897222
ITH,Tompkins Cty,Ithaca,NY,USA,42.49102778,-76.45844444
ITO,Hilo International,Hilo,HI,USA,19.72026306,-155.0484703
ITR,Kit Carson County,Burlington,CO,USA,39.2425,-102.2853889
IWA,Williams Gateway,Phoenix,AZ,USA,33.30783333,-111.6554722
IWD,Gogebic County,Ironwood,MI,USA,46.52747472,-90.13139667
IWH,Wabash Municipal,Wabash,IN,USA,40.76195972,-85.79873417
IWI,Wiscasset,Wiscasset,ME,USA,43.96141667,-69.71255556
IWK,Wales,Wales,AK,USA,65.62394028,-168.0991719
IWS,West Houston,Houston,TX,USA,29.81819444,-95.67261111
IXD,New Century Aircenter,Olathe,KS,USA,38.83090472,-94.89030333
IYK,Inyokern,Inyokern,CA,USA,35.65884306,-117.8295122
IYS,Wasilla,Wasilla,AK,USA,61.57196083,-149.5405556
IZA,Santa Ynez,Santa Ynez,CA,USA,34.60682028,-120.0755617
IZG,Eastern Slopes Regional,Fryeburg,ME,USA,43.99114472,-70.94787444
JAC,Jackson Hole,Jackson,WY,USA,43.60732417,-110.7377389
JAN,Jackson International,Jackson,MS,USA,32.31116667,-90.07588889
JAS,Jasper County -Bell,Jasper,TX,USA,30.89058333,-94.03483333
JAU,Campbell County,Jacksboro,TN,USA,36.33457556,-84.16234472
JAX,Jacksonville International,Jacksonville,FL,USA,30.49405556,-81.68786111
JBR,Jonesboro Municipal,Jonesboro,AR,USA,35.83186111,-90.64616667
JCT,Kimble County,Junction,TX,USA,30.51126,-99.76345528
JDN,Jordan,Jordan,MT,USA,47.33333417,-106.9339564
JEF,Jefferson City Memorial,Jefferson City,MO,USA,38.59117917,-92.15614389
JER,Jerome County,Jerome,ID,USA,42.72663639,-114.4571506
JES,Jesup-Wayne County,Jesup,GA,USA,31.55408333,-81.88344444
JFK,John F Kennedy Intl,New York,NY,USA,40.63975111,-73.77892556
JFX,Walker County,Jasper,AL,USA,33.90199528,-87.31416639
JHM,Kapalua,Lahaina,HI,USA,20.96293639,-156.6730317
JHW,Chautauqua Cty,Jamestown,NY,USA,42.15336861,-79.258035
JKA,Jack Edwards,Gulf Shores,AL,USA,30.28951667,-87.67371472
JKJ,Moorhead Municipal,Moorhead,MN,USA,46.83919194,-96.66313028
JKL,Julian Carroll,Jackson,KY,USA,37.59386111,-83.31725
JLN,Joplin Regional,Joplin,MO,USA,37.15181361,-94.49826833
JMR,Mora Municipal,Mora,MN,USA,45.88609722,-93.27177833
JMS,Jamestown Municipal,Jamestown,ND,USA,46.92971944,-98.67819528
JNU,Juneau International,Juneau,AK,USA,58.35496194,-134.5762764
JNX,Johnston County,Smithfield,NC,USA,35.54094139,-78.39032944
JOT,Joliet Park District,Chicago/Joliet,IL,USA,41.51805833,-88.17525583
JQF,Concord Regional,Concord,NC,USA,35.38520694,-80.70971389
JRA,Port Authority-W 30th St Midtown Heliport,New York,NY,USA,40.75454583,-74.00708389
JRB,Downtown Manhattan/Wall St. Heliport,New York,NY,USA,40.70121361,-74.00902833
JRF,Kalaeloa (John Rodgers),Kapolei,HI,USA,21.30735389,-158.0703017
JSO,Jacksonville-Cherokee County,Jacksonville,TX,USA,31.86933667,-95.21739028
JST,Johnstown-Cambria Cty,Johnstown,PA,USA,40.31611111,-78.83394444
JVL,Rock County,Janesville,WI,USA,42.61958222,-89.04034028
JVY,Clark County,Jeffersonville,IN,USA,38.36562278,-85.73829639
JWG,Watonga,Watonga,OK,USA,35.86469444,-98.42075
JWN,John C. Tune,Nashville,TN,USA,36.18236194,-86.88672278
JXN,Jackson County Reynolds,Jackson,MI,USA,42.25978556,-84.45940361
JYG,St James Municipal,St James,MN,USA,43.98631833,-94.55793722
JYL,Plantation Airpark,Sylvania,GA,USA,32.64544861,-81.59649722
JYM,Hillsdale Municipal,Hillsdale,MI,USA,41.92126083,-84.5857625
JYO,Leesburg Executive,Leesburg,VA,USA,39.07797222,-77.5575
JYR,Municipal,York,NE,USA,40.89675,-97.62277778
JZI,Charleston Executive,Charleston,SC,USA,32.70086111,-80.00291667
JZP,Pickens County,Jasper,GA,USA,34.45147972,-84.45659278
JZZ,Koliganek,Koliganek,AK,USA,59.72664194,-157.2594722
K01,Farington,Auburn,NE,USA,40.38750167,-95.78916167
K02,Perryville Municipal,Perryville,MO,USA,37.86866667,-89.86213889
K06,Greater Beardstown,Beardstown,IL,USA,39.97338139,-90.40373556
K09,Piseco Muni,Piseco,NY,USA,43.45340222,-74.51765083
K15,Linn Creek-Grand Glaize Memorial,Osage Beach,MO,USA,38.11045,-92.68054583
K20,Wendell H. Ford,Hazard,KY,USA,37.38783833,-83.26205889
K22,Big Sandy Regional,Prestonburg,KY,USA,37.75102778,-82.63669444
K24,Russell County,Jamestown,KY,USA,37.00888889,-85.10277778
K29,Council,Council,AK,USA,64.89788278,-163.7034472
K33,Salem Memorial,Salem,MO,USA,37.61523333,-91.60444167
K34,Municipal,Gardner,KS,USA,38.80708333,-94.95602778
K39,St Clair Memorial,St Clair,MO,USA,38.37594333,-90.97073944
K46,Blair Municipal,Blair,NE,USA,41.41805139,-96.1136275
K54,Teller,Teller,AK,USA,65.24089806,-166.3360067
K57,Gould Peterson Municipal,Tarkio,MO,USA,40.44583139,-95.36275806
K59,Amelia Earhart,Atchison,KS,USA,39.57052472,-95.18033139
K61,Moritz Memorial,Beloit,KS,USA,39.47115222,-98.12878389
K62,Falmouth Pendleton County,Falmouth,KY,USA,38.70423611,-84.39160417
K67,Oswego Municipal,Oswego,KS,USA,37.15978667,-95.04246222
K68,Garnett Municipal,Garnett,KS,USA,38.27918833,-95.21691833
K78,Abilene Municipal,Abilene.,KS,USA,38.90405583,-97.23585389
K81,Miami County,Paola,KS,USA,38.53751389,-94.92524194
K82,Smith Center Municipal,Smith Center,KS,USA,39.76112278,-98.79343639
K83,Sabetha Municipal,Sabetha,KS,USA,39.90416667,-95.7794325
K88,Allen County,Iola,KS,USA,37.87008333,-95.38638889
K89,Macon-Fower Memorial,Macon,MO,USA,39.72870694,-92.464455
K96,Tuscola,Tuscola,IL,USA,39.78086528,-88.30616
KAE,Kake SPB,Kake,AK,USA,56.97299639,-133.9456147
KAL,Kaltag,Kaltag,AK,USA,64.32571917,-158.7441475
KCC,Coffman Cove SPB,Coffman Cove,AK,USA,56.00324444,-132.8419689
KCL,Chignik Lagoon,Chignik Flats,AK,USA,56.31116306,-158.5359264
KEB,English Bay,English Bay,AK,USA,59.35214833,-151.9251558
KEK,Ekwok,Ekwok,AK,USA,59.35399444,-157.4744092
KFP,False Pass,False Pass,AK,USA,54.84744583,-163.4103222
KGX,Grayling,Grayling,AK,USA,62.89456056,-160.0649042
KIB,Ivanof Bay SPB,Ivanof Bay,AK,USA,55.89753333,-159.4886689
KIC,Mesa Del Rey,King City,CA,USA,36.22802139,-121.1218614
KKA,Koyuk,Koyuk,AK,USA,64.93404056,-161.158145
KKB,Kitoi Bay SPB,Kitoi Bay,AK,USA,58.19094611,-152.3704875
KLG,Kalskag,Kalskag,AK,USA,61.53627389,-160.3413306
KLL,Levelock,Levelock,AK,USA,59.11816472,-156.8652169
KLS,Kelso-Longview,Kelso,WA,USA,46.118,-122.8983889
KNB,Kanab Muni,Kanab,UT,USA,37.01110583,-112.5311936
KNW,Stuyahok,New Stuyahok,AK,USA,59.44955333,-157.3271908
KOA,Kona International At Keahole,Kailua/Kona,HI,USA,19.73876583,-156.0456314
KPB,Point Baker SPB,Point Baker,AK,USA,56.35185972,-133.6225864
KPH,Pauloff Harbor SPB,Pauloff Harbor,AK,USA,54.45912028,-162.6936406
KQA,Akutan SPB,Akutan,AK,USA,54.13246694,-165.7853111
KSM,St. Mary's,St. Mary's,AK,USA,62.06048639,-163.3021108
KTB,Thorne Bay,Thorne Bay,AK,USA,55.68796194,-132.5366758
KTN,Ketchikan International,Ketchikan,AK,USA,55.35556861,-131.71374
KTS,Brevig Mission,Brevig Mission,AK,USA,65.33136111,-166.4631667
KVC,King Cove,King Cove,AK,USA,55.1163475,-162.2662272
KVL,Kivalina,Kivalina,AK,USA,67.73125333,-164.5518019
KWT,Kwethluk,Kwethluk,AK,USA,60.80425194,-161.44535
KXA,Kasaan SPB,Kasaan,AK,USA,55.53741389,-132.3975144
KYK,Karluk,Karluk,AK,USA,57.56706389,-154.4503714
KYU,Koyukuk,Koyukuk,AK,USA,64.87714278,-157.7158358
L04,Holtville,Holtville,CA,USA,32.84032361,-115.2674806
L05,Kern Valley,Kernville,CA,USA,35.72828472,-118.4198069
L06,Furnace Creek,Death Valley National Park,CA,USA,36.46383694,-116.8814425
L08,Borrego Valley,Borrego Springs,CA,USA,33.25902778,-116.3209722
L12,Redlands Municipal,Redlands,CA,USA,34.08526167,-117.1463789
L15,Henderson,Las Vegas,NV,USA,35.97636444,-115.1327708
L17,Taft-Kern County,Taft,CA,USA,35.14107806,-119.4412294
L18,Fallbrook Community Airpark,Fallbrook,CA,USA,33.35419806,-117.2508686
L19,Wasco-Kern County,Wasco,CA,USA,35.61967889,-119.3537242
L26,Hesperia,Hesperia,CA,USA,34.37722333,-117.3158783
L31,Greater St. Tammany Parish,Covington,LA,USA,30.44505417,-89.98887889
L35,Big Bear City,Big Bear,CA,USA,34.26361944,-116.854475
L38,Louisiana Regional,Gonzales,LA,USA,30.17135306,-90.94039583
L39,Leesville,Leesville,LA,USA,31.16819444,-93.34245833
L42,Allen Parish,Oakdale,LA,USA,30.75016667,-92.68847222
L45,Bakersfield Municipal,Bakersfield,CA,USA,35.32483333,-118.9958333
L49,South Lafourche,Galliano,LA,USA,29.44482222,-90.26111667
L52,Oceano County,Oceano,CA,USA,35.10136472,-120.6221153
L67,Rialto Municipal,Rialto,CA,USA,34.12934361,-117.4016303
L70,Agua Dulce Airpark,Agua Dulce,CA,USA,34.50415889,-118.3128561
L71,California City Municipal,California City,CA,USA,35.15125306,-118.0166667
L72,Trona,Trona,CA,USA,35.81245333,-117.3272783
L75,Southland,Sulphur,LA,USA,30.13138889,-93.37611111
L83,Thibodaux Municipal,Thibodaux,LA,USA,29.74779194,-90.83289889
L84,Lost Hills-Kern County,Lost Hills,CA,USA,35.62357083,-119.6862383
L92,Alamo Landing,Alamo,NV,USA,37.36246083,-115.1944622
LAA,Lamar Muni,Lamar,CO,USA,38.06969444,-102.6885
LAF,Purdue University,Lafayette,IN,USA,40.41231694,-86.93689889
LAL,Lakeland Linder Regional,Lakeland,FL,USA,27.98891667,-82.01855556
LAM,Los Alamos,Los Alamos,NM,USA,35.87980194,-106.2694153
LAN,Capital City,Lansing,MI,USA,42.7787,-84.58735806
LAR,Laramie Regional,Laramie,WY,USA,41.31205,-105.6749864
LAS,McCarran International,Las Vegas,NV,USA,36.08036111,-115.1523333
LAW,Lawton-Ft Sill Regional,Lawton,OK,USA,34.56771444,-98.41663667
LAX,Los Angeles International,Los Angeles,CA,USA,33.94253611,-118.4080744
LBB,Lubbock International,Lubbock,TX,USA,33.66363889,-101.8227778
LBE,Arnold Palmer Regional,Latrobe,PA,USA,40.27594,-79.40479722
LBF,North Platte Regional,North Platte,NE,USA,41.12621194,-100.6836542
LBL,Liberal Municipal,Liberal,KS,USA,37.04420944,-100.9598611
LBO,Floyd W Jones Lebanon,Lebanon,MO,USA,37.64718056,-92.65375778
LBT,Lumberton Municipal,Lumberton,NC,USA,34.60991667,-79.05944444
LBX,Brazoria County,Angleton,TX,USA,29.10863889,-95.46208056
LCG,Wayne Municipal,Wayne,NE,USA,42.24188889,-96.98141667
LCH,Lake Charles Regional,Lake Charles,LA,USA,30.1260975,-93.22340361
LCI,Laconia Municipal,Laconia,NH,USA,43.57272806,-71.41890028
LCK,Rickenbacker International,Columbus,OH,USA,39.81375917,-82.92786472
LCQ,Lake City Municipal,Lake City,FL,USA,30.18205556,-82.57686111
LDJ,Linden,Linden,NJ,USA,40.61744722,-74.24459417
LDM,Mason County,Ludington,MI,USA,43.96253278,-86.40791528
LEB,Lebanon Municipal,Lebanon,NH,USA,43.62637222,-72.30426722
LEE,Leesburg Regional,Leesburg,FL,USA,28.82274417,-81.80900722
LEM,Lemmon Municipal,Lemmon,SD,USA,45.91869722,-102.1061778
LEW,Auburn-Lewiston Municipal,Auburn-Lewiston,ME,USA,44.04847278,-70.2835075
LEX,Blue Grass,Lexington,KY,USA,38.03697222,-84.60538889
LFK,Lufkin-Angelina County,Lufkin,TX,USA,31.23401389,-94.75
LFT,Lafayette Regional,Lafayette,LA,USA,30.20527972,-91.987655
LGA,LaGuardia,New York,NY,USA,40.77724306,-73.87260917
LGB,Long Beach (Daugherty),Long Beach,CA,USA,33.81772222,-118.1516111
LGC,LaGrange-Callaway,Lagrange,GA,USA,33.00884694,-85.07260556
LGD,La Grande/Union County,La Grande,OR,USA,45.29020944,-118.0071108
LGU,Logan-Cache,Logan,UT,USA,41.78773083,-111.8526822
LHD,Lake Hood SPB,Anchorage,AK,USA,61.18000361,-149.9719322
LHM,Lincoln Regional,Lincoln,CA,USA,38.90916111,-121.3513361
LHQ,Fairfield County,Lancaster,OH,USA,39.75564722,-82.65711
LHV,Wm T Piper Memorial,Lock Haven,PA,USA,41.13618028,-77.42053556
LHX,La Junta Muni,La Junta,CO,USA,38.05134111,-103.5106908
LHZ,Franklin County,Louisburg,NC,USA,36.02334528,-78.33027139
LIC,Limon Municipal,Limon,CO,USA,39.272765,-103.6663392
LIH,Lihue,Lihue,HI,USA,21.97598306,-159.3389581
LIT,Adams,Little Rock,AR,USA,34.72939611,-92.22424556
LJF,Litchfield Municipal,Litchfield,MN,USA,45.09712889,-94.50726833
LKP,Lake Placid,Lake Placid,NY,USA,44.26447361,-73.96186639
LKR,Lancaster County,Lancaster,SC,USA,34.72291667,-80.85458333
LKU,Louisa County / Freeman,Louisa,VA,USA,38.00983333,-77.97013889
LKV,Lake County,Lakeview,OR,USA,42.16111111,-120.3990703
LLJ,Challis,Challis,ID,USA,44.52297806,-114.2175642
LLQ,Monticello Municipal,Monticello,AR,USA,33.6385525,-91.75101833
LLU,Lamar Municipal,Lamar,MO,USA,37.4894925,-94.31150444
LMS,Louisville-Winston County,Louisville,MS,USA,33.14620944,-89.06247917
LMT,Klamath Falls International,Klamath Falls,OR,USA,42.15614361,-121.7332081
LNA,Palm Beach County Park,Lantana,FL,USA,26.593,-80.08505556
LNC,Lancaster,Lancaster,TX,USA,32.57919111,-96.71905111
LND,Hunt,Lander,WY,USA,42.81523611,-108.7298392
LNK,Lincoln Municipal,Lincoln,NE,USA,40.85097222,-96.75925
LNL,Kings Land O' Lakes,Land O' Lakes,WI,USA,46.15387722,-89.21194417
LNN,Lost Nation,Willoughby,OH,USA,41.68391667,-81.39030556
LNP,Lonesome Pine,Wise,VA,USA,36.98743194,-82.53017361
LNS,Lancaster,Lancaster,PA,USA,40.12171528,-76.29609778
LNY,Lanai,Lanai City,HI,USA,20.78561111,-156.9514181
LOL,Derby,Lovelock,NV,USA,40.066405,-118.5651664
LOT,Lewis University,Chicago/Romeoville,IL,USA,41.60844444,-88.09094444
LOU,Bowman,Louisville,KY,USA,38.228,-85.66372222
LOZ,London-Corbin  Magee,London,KY,USA,37.08727778,-84.07677778
LPC,Lompoc,Lompoc,CA,USA,34.66561028,-120.4667883
LPR,Lorain Co Regional,Lorain/Elyria,OH,USA,41.34427778,-82.17763889
LQK,Pickens County,Pickens,SC,USA,34.80997222,-82.70288889
LQR,Larned-Pawnee County,Larned,KS,USA,38.20809667,-99.08607306
LRD,Laredo International,Laredo,TX,USA,27.54373861,-99.46154361
LRG,Lincoln Regional,Lincoln,ME,USA,45.36216083,-68.53474694
LRJ,Le Mars Municipal,Le Mars,IA,USA,42.77801778,-96.19368944
LRU,Las Cruces International,Las Cruces,NM,USA,32.28941667,-106.9219722
LSB,Lordsburg Municipal,Lordsburg,NM,USA,32.33278083,-108.6909742
LSE,La Crosse Municipal,La Crosse,WI,USA,43.87937972,-91.25653778
LSK,Lusk Muni,Lusk,WY,USA,42.75380806,-104.4045536
LSN,Los Banos Municipal,Los Banos,CA,USA,37.06290556,-120.8692511
LUG,Ellington,Lewisburg,TN,USA,35.506975,-86.80388611
LUK,Cincinnati Muni-Lunken,Cincinnati,OH,USA,39.10334417,-84.41861417
LUL,Hesler-Noble,Laurel,MS,USA,31.67255139,-89.17222417
LUP,Kalaupapa,Kalaupapa,HI,USA,21.21104028,-156.9735972
LVJ,Clover,Houston,TX,USA,29.52130556,-95.24216667
LVK,Livermore Municipal,Livermore,CA,USA,37.69339944,-121.8203519
LVM,Mission,Livingston,MT,USA,45.69938889,-110.4483056
LVN,Airlake,Minneapolis,MN,USA,44.62785361,-93.22810806
LVS,Las Vegas Municipal,Las Vegas,NM,USA,35.65422222,-105.1423889
LWB,Greenbrier Valley,Lewisburg,WV,USA,37.85830556,-80.39947222
LWC,Lawrence Municipal,Lawrence,KS,USA,39.01115222,-95.21657694
LWD,Lamoni Municipal,Lamoni,IA,USA,40.63333306,-93.90217028
LWL,Wells Municipal/Harriet,Wells,NV,USA,41.11853306,-114.9222661
LWM,Lawrence Municipal,Lawrence,MA,USA,42.71720944,-71.12343
LWS,Lewiston-Nez Perce County,Lewiston,ID,USA,46.37449806,-117.0153944
LWT,Lewistown Muni,Lewistown,MT,USA,47.04913944,-109.4666006
LWV,Lawrenceville-Vincennes Municipal,Lawrenceville,IL,USA,38.76429639,-87.60549556
LXL,Little Falls - Morrison County,Little Falls,MN,USA,45.94943778,-94.34708472
LXN,Lexington (Jim Kelly),Lexington,NE,USA,40.791,-99.77727778
LXT,Lee's Summit Municipal,Lee's Summit,MO,USA,38.95975,-94.37158333
LXV,Lake County,Leadville,CO,USA,39.2202675,-106.3166906
LXY,Mexia-Limestone County,Mexia,TX,USA,31.63983472,-96.51472222
LYH,Lynchburg Municipal-Preston Glenn,Lynchburg,VA,USA,37.32668528,-79.20043056
LYO,Lyons-Rice County Municipal,Lyons,KS,USA,38.34261472,-98.22709639
LZU,Gwinnett County,Lawrenceville,GA,USA,33.97807611,-83.96237722
M01,General Dewitt Spain,Memphis,TN,USA,35.20069278,-90.05397694
M02,Dickson Municipal,Dickson,TN,USA,36.12931722,-87.43007056
M03,Dennis F Cantrell,Conway,AR,USA,35.08080778,-92.42496167
M04,Covington Municipal,Covington,TN,USA,35.583365,-89.58722167
M05,Caruthersville Memorial,Caruthersville,MO,USA,36.17506917,-89.67508
M08,William L. Whitehurst,Bolivar,TN,USA,35.21445944,-89.04336222
M09,Piedmont Municipal,Piedmont,MO,USA,37.12671694,-90.7128975
M11,Copiah County,Crystal Springs,MS,USA,31.90293639,-90.36870222
M13,Poplarville-Pearl River County,Poplarville,MS,USA,30.78602056,-89.50450694
M15,Perry County,Linden,TN,USA,35.59590306,-87.87669361
M16,John Bell Williams,Raymond,MS,USA,32.30334111,-90.40848333
M17,Bolivar Municipal,Bolivar,MO,USA,37.59693194,-93.34765
M18,Hope Municipal,Hope,AR,USA,33.72008889,-93.65884556
M19,Newport Municipal,Newport,AR,USA,35.63771778,-91.17637556
M21,Muhlenberg County,Greenville,KY,USA,37.22561111,-87.15752778
M22,Russellville Municipal,Russellville,AL,USA,34.44953972,-87.71030833
M23,James H. Easom,Newton,MS,USA,32.31181111,-89.13589194
M24,Dean Griffin Memorial,Wiggins,MS,USA,30.84324389,-89.15977333
M25,Mayfield-Graves County,Mayfield,KY,USA,36.76911111,-88.58472222
M27,Waldron Municipal,Waldron,AR,USA,34.87509944,-94.10993056
M29,Hassel,Clifton,TN,USA,35.38507528,-87.96752833
M30,Metropolis Municipal,Metropolis,IL,USA,37.18588722,-88.75061
M32,Lake Village Municipal,Lake Village,AR,USA,33.3459775,-91.31569833
M33,Sumner County Regional,Gallatin,TN,USA,36.37684472,-86.40875861
M34,Kentucky Dam State Park,Gilbertsville,KY,USA,37.00950028,-88.29586639
M36,Frank Federer Memorial,Brinkley,AR,USA,34.88000194,-91.1764375
M37,Ruleville-Drew,Drew,MS,USA,33.77639167,-90.52500833
M39,Mena Intermountain Municipal,Mena,AR,USA,34.54539444,-94.20265278
M40,Monroe County,Aberdeen-Amory,MS,USA,33.87374861,-88.48967833
M41,Holly Springs-Marshall County,Holly Springs,MS,USA,34.80434611,-89.5211075
M43,Prentiss-Jefferson Davis County,Prentiss,MS,USA,31.59544583,-89.90619056
M44,Houston Municipal,Houston,MS,USA,33.89177944,-89.02367194
M46,Colstrip,Colstrip,MT,USA,45.85285,-106.7092722
M48,Houston Memorial,Houston,MO,USA,37.33009167,-91.97316944
M52,Franklin-Wilkins,Lexington,TN,USA,35.65131944,-88.37893444
M53,Humboldt Municipal,Humboldt,TN,USA,35.80218,-88.87494944
M54,Lebanon Municipal,Lebanon,TN,USA,36.19041667,-86.31569444
M58,Monett Municipal,Monett,MO,USA,36.90621528,-94.01275833
M59,Richton-Perry County,Richton,MS,USA,31.31739944,-88.93504778
M60,Woodruff County,Augusta,AR,USA,35.27175278,-91.27040417
M65,Wynne Municipal,Wynne,AR,USA,35.23160167,-90.76155111
M70,Pocahontas Municipal,Pocahontas,AR,USA,36.24551111,-90.95520444
M72,New Albany-Union County,New Albany,MS,USA,34.54722222,-89.02416667
M73,Almyra Municipal,Almyra,AR,USA,34.41232833,-91.46634722
M75,Malta,Malta,MT,USA,48.36694167,-107.9193444
M76,Picayune Municipal,Picayune,MS,USA,30.48748472,-89.65119306
M77,Howard County,Nashville,AR,USA,33.99673833,-93.83813583
M78,Malvern Municipal,Malvern,AR,USA,34.33331583,-92.76149944
M79,John H Hooks Jr Memorial,Rayville,LA,USA,32.48633611,-91.77087528
M82,Madison County Executive,Huntsville,AL,USA,34.85645028,-86.55621472
M83,McCharen,West Point,MS,USA,33.58403556,-88.66668694
M89,Dexter B. Florence Memorial,Arkadelphia,AR,USA,34.09984639,-93.06611694
M91,Springfield-Robertson County,Springfield,TN,USA,36.53726194,-86.92068917
M95,Richard Arthur,Fayette,AL,USA,33.71221972,-87.81504639
M97,Tunica Municipal,Tunica,MS,USA,34.69232306,-90.35065389
M99,Saline County/Watts,Benton,AR,USA,34.55656472,-92.60693972
MAC,Herbert Smart Downtown,Macon,GA,USA,32.82213889,-83.56202778
MAE,Madera Municipal,Madera,CA,USA,36.9857175,-120.1119844
MAF,Midland International,Midland,TX,USA,31.94252778,-102.2019139
MAI,Marianna Municipal,Marianna,FL,USA,30.83780556,-85.18188889
MAL,Malone-Dufort,Malone,NY,USA,44.85365722,-74.32894972
MAO,Marion County,Marion,SC,USA,34.18116667,-79.33472222
MAW,Malden Municipal,Malden,MO,USA,36.60055694,-89.99220278
MAZ,Eugenio Maria De Hostos,Mayaguez,PR,USA,18.25569444,-67.14847222
MBG,Mobridge Municipal,Mobridge,SD,USA,45.54650361,-100.4079192
MBL,Manistee County Blacker,Manistee,MI,USA,44.27319722,-86.2490025
MBO,Bruce Campbell,Madison,MS,USA,32.43866444,-90.10309222
MBS,Mbs International,Saginaw,MI,USA,43.53291472,-84.07964722
MBT,Murfreesboro Municipal,Murfreesboro,TN,USA,35.87748444,-86.37753222
MBY,Omar N Bradley,Moberly,MO,USA,39.46392583,-92.42759778
MCB,McComb-Pike County,McComb,MS,USA,31.17845444,-90.47187528
MCD,Mackinac Island,Mackinac Island,MI,USA,45.86493444,-84.63734444
MCE,Merced Municipal/MacReady,Merced,CA,USA,37.28472861,-120.5138858
MCG,McGrath,McGrath,AK,USA,62.95287361,-155.6057625
MCI,Kansas City International,Kansas City,MO,USA,39.29760528,-94.71390556
MCK,McCook Municipal,McCook,NE,USA,40.20638889,-100.5918056
MCN,Middle Georgia Regional,Macon,GA,USA,32.69284944,-83.64921083
MCO,Orlando International,Orlando,FL,USA,28.42888889,-81.31602778
MCW,Mason City Municipal,Mason City,IA,USA,43.1577925,-93.33126056
MCX,White County,Monticello,IN,USA,40.70881639,-86.76676139
MCZ,Martin County,Williamston,NC,USA,35.86219306,-77.17820278
MDD,Midland Airpark,Midland,TX,USA,32.03652444,-102.1010278
MDF,Mooreland Municipal,Mooreland,OK,USA,36.48475778,-99.19415778
MDH,Southern Illinois,Carbondale,IL,USA,37.77809583,-89.25203111
MDR,Medfra,Medfra,AK,USA,63.10577694,-154.7189806
MDS,Madison Municipal,Madison,SD,USA,44.01597222,-97.08593333
MDT,Harrisburg Intl,Harrisburg,PA,USA,40.19349528,-76.76340361
MDW,Chicago Midway,Chicago,IL,USA,41.7859825,-87.75242444
MDZ,Taylor County,Medford,WI,USA,45.10097556,-90.30341
MEB,Laurinburg-Maxton,Maxton,NC,USA,34.79193917,-79.36584778
MEI,Key,Meridian,MS,USA,32.33313333,-88.75120556
MEJ,Meade Municipal,Meade,KS,USA,37.27938889,-100.3563056
MEM,Memphis International,Memphis,TN,USA,35.04241667,-89.97666667
MER,Castle,Atwater,CA,USA,37.38048056,-120.5681889
MEV,Minden-Tahoe,Minden,NV,USA,39.00030889,-119.7508064
MEY,Mapleton Municipal,Mapleton,IA,USA,42.178295,-95.79364528
MFD,Mansfield Lahm Municipal,Mansfield,OH,USA,40.82141667,-82.51663889
MFE,McAllen Miller International,McAllen,TX,USA,26.17583333,-98.23861111
MFI,Marshfield Municipal,Marshfield,WI,USA,44.63687972,-90.18932667
MFR,Rogue Valley International,Medford,OR,USA,42.37422778,-122.8734978
MFV,Accomack County,Melfa,VA,USA,37.64688889,-75.76105556
MGC,Michigan City Municipal,Michigan City,IN,USA,41.70331694,-86.82124167
MGJ,Orange Cty,Montgomery,NY,USA,41.50998278,-74.26465056
MGM,Montgomery Regional Apt,Montgomery,AL,USA,32.30064417,-86.39397611
MGR,Moultrie Municipal,Moultrie,GA,USA,31.08490917,-83.80325528
MGW,Morgantown Muni-Walter L. Bill Hart Fld.,Morgantown,WV,USA,39.6429075,-79.91631417
MGY,Dayton Wright Brothers,Dayton,OH,USA,39.58897222,-84.22486111
MHE,Mitchell Municipal,Mitchell,SD,USA,43.77483333,-98.03861111
MHK,Manhattan Regional,Manhattan,KS,USA,39.14096722,-96.67083278
MHL,Marshall Memorial Municipal,Marshall,MO,USA,39.09575472,-93.20287889
MHM,Minchumina,Minchumina,AK,USA,63.880565,-152.3006756
MHP,Metter Municipal,Metter,GA,USA,32.37388889,-82.07919444
MHR,Sacramento Mather,Sacramento,CA,USA,38.55389694,-121.2975908
MHT,Manchester,Manchester,NH,USA,42.93451639,-71.43705583
MHV,Mojave,Mojave,CA,USA,35.05936472,-118.1518561
MIA,Miami International,Miami,FL,USA,25.79325,-80.29055556
MIB,Minot AFB,NA,NA,USA,48.415769,-101.358039
MIC,Crystal,Minneapolis,MN,USA,45.06198611,-93.3539375
MIE,Delaware County,Muncie,IN,USA,40.24234806,-85.39586
MIO,Miami Municipal,Miami,OK,USA,36.90922083,-94.88750028
MIT,Shafter-Minter,Shafter,CA,USA,35.50592944,-119.1915236
MIV,Millville Muni,Millville,NJ,USA,39.36780556,-75.07222222
MIW,Marshalltown Municipal,Marshalltown,IA,USA,42.11272639,-92.91778778
MJQ,Jackson Municipal,Jackson,MN,USA,43.65004111,-94.98654611
MJX,Robert J. Miller Airpark,Toms River,NJ,USA,39.92749806,-74.29237917
MKA,Miller Municipal,Miller,SD,USA,44.52524444,-98.95811444
MKC,Downtown,Kansas City,MO,USA,39.12324111,-94.592735
MKE,General Mitchell International,Milwaukee,WI,USA,42.94722222,-87.89658333
MKG,Muskegon County,Muskegon,MI,USA,43.16948806,-86.23822306
MKJ,Mountain Empire,Marion,VA,USA,36.8948525,-81.349955
MKK,Molokai,Kaunakakai,HI,USA,21.15288583,-157.0962561
MKL,McKellar-Sipes Regional,Jackson,TN,USA,35.59987944,-88.91561611
MKO,Davis,Muskogee,OK,USA,35.65773028,-95.36164889
MKT,Mankato Regional,Mankato,MN,USA,44.22164528,-93.91874333
MKV,Marksville Municipal,Marksville,LA,USA,31.09466,-92.06906861
MKY,Marco Island,Marco Island,FL,USA,25.99502778,-81.67252778
MLB,Melbourne International,Melbourne,FL,USA,28.10275,-80.64580556
MLC,McAlester Regional,McAlester,OK,USA,34.88240194,-95.78346278
MLE,Millard,Omaha,NE,USA,41.196,-96.11227778
MLF,Milford Municipal,Milford,UT,USA,38.4266325,-113.0124564
MLI,Quad City,Moline,IL,USA,41.44852639,-90.50753917
MLJ,Baldwin County,Milledgeville,GA,USA,33.15419444,-83.24061111
MLL,Marshall,Marshall,AK,USA,61.8659225,-162.0690456
MLS,Frank Wiley,Miles City,MT,USA,46.42795972,-105.8862397
MLT,Millinocket Municipal,Millinocket,ME,USA,45.64783611,-68.68556194
MLU,Monroe Regional,Monroe,LA,USA,32.51086556,-92.03768778
MLY,Manley Hot Springs,Manley Hot Springs,AK,USA,64.99756472,-150.6441297
MMH,Mammoth Yosemite,Mammoth Lakes,CA,USA,37.62404861,-118.8377722
MMI,McMinn County,Athens,TN,USA,35.39730333,-84.56256861
MMK,Meriden-Markham Municipal,Meriden,CT,USA,41.50871472,-72.82947833
MML,Marshall Muni - Ryan,Marshall,MN,USA,44.45006611,-95.82234028
MMU,Morristown Municipal,Morristown,NJ,USA,40.79935,-74.41487472
MMV,McMinnville Muni,McMinnville,OR,USA,45.19444444,-123.1359444
MNF,Mountain View,Mountain View,MO,USA,36.99282694,-91.71445611
MNI,Clarendon County,Manning,SC,USA,33.58711111,-80.20866667
MNM,Menominee-Marinette Twin County,Menominee,MI,USA,45.12665028,-87.63844056
MNN,Marion Municipal,Marion,OH,USA,40.61625,-83.06347222
MNV,Monroe County,Madisonville,TN,USA,35.54537222,-84.380235
MNZ,Hamilton Municipal,Hamilton,TX,USA,31.66592639,-98.1486375
MO6,Washington Memorial,Washington,MO,USA,38.59163472,-90.99761444
MO85,Lawrence Smith Memorial,Harrisonville,MO,USA,38.61102222,-94.34213056
MOB,Mobile Regional,Mobile,AL,USA,30.69141667,-88.24283333
MOD,Modesto City-County-Harry Sham,Modesto,CA,USA,37.62581722,-120.9544214
MOP,Mount Pleasant Municipal,Mount Pleasant,MI,USA,43.62166833,-84.737485
MOR,Moore-Murrell,Morristown,TN,USA,36.17939639,-83.37544944
MOT,Minot International,Minot,ND,USA,48.25937778,-101.2803339
MOU,Mountain Village,Mountain Village,AK,USA,62.09536222,-163.6820594
MOX,Morris Municipal,Morris,MN,USA,45.56651667,-95.96763611
MPE,Philadelphia Municipal,Philadelphia,MS,USA,32.7995775,-89.12589472
MPJ,Petit Jean Park,Morrilton,AR,USA,35.13886306,-92.90919694
MPO,Pocono Mountains Muni,Mount Pocono,PA,USA,41.1374775,-75.37887833
MPR,McPherson,McPherson,KS,USA,38.35243722,-97.69133028
MPV,Edward F Knapp State,Barre-Montpelier,VT,USA,44.203505,-72.56232944
MPZ,Mount Pleasant Municipal,Mount Pleasant,IA,USA,40.94661389,-91.511075
MQB,Macomb Municipal,Macomb,IL,USA,40.52034556,-90.65246389
MQI,Dare County Regional,Manteo,NC,USA,35.91898806,-75.69553944
MQJ,Mount Comfort,Indianapolis,IN,USA,39.84348556,-85.89706389
MQT,Marquette County Airport,NA,NA,USA,46.353639,-87.395361
MQW,Telfair-Wheeler,McRae,GA,USA,32.09577778,-82.88002778
MQY,Smyrna,Smyrna,TN,USA,36.00897944,-86.52007667
MRB,Eastern Wv Reg/Shephard,Martinsburg,WV,USA,39.40193278,-77.98458139
MRC,Maury County,Columbia-Mt Pleasant,TN,USA,35.55413889,-87.17891667
MRF,Marfa Municipal,Marfa,TX,USA,30.37147222,-104.0166944
MRH,Michael J. Smith,Beaufort,NC,USA,34.73355028,-76.66059611
MRI,Merrill,Anchorage,AK,USA,61.21437861,-149.8461614
MRJ,Iowa County,Mineral Point,WI,USA,42.88532917,-90.23198583
MRN,Morganton-Lenoir,Morganton,NC,USA,35.82149222,-81.61073639
MRY,Monterey Peninsula,Monterey,CA,USA,36.5869825,-121.8429478
MSA,Mount Pleasant Municipal,Mount Pleasant,TX,USA,33.12936111,-94.97563889
MSL,Northwest Alabama Regional,Muscle Shoals,AL,USA,34.74532028,-87.61023222
MSN,Dane County Regional,Madison,WI,USA,43.13985778,-89.33751361
MSO,Missoula International,Missoula,MT,USA,46.91630556,-114.0905556
MSP,Minneapolis-St Paul Intl,Minneapolis,MN,USA,44.88054694,-93.2169225
MSS,Massena Int'l-Richards,Massena,NY,USA,44.93582722,-74.84554583
MSV,Sullivan Cty Intl,Monticello,NY,USA,41.70164917,-74.79501389
MSY,New Orleans International,New Orleans,LA,USA,29.99338889,-90.25802778
MTH,Florida Keys Marathon,Marathon,FL,USA,24.72614083,-81.05137806
MTJ,Montrose Regional,Montrose,CO,USA,38.50886722,-107.8938333
MTM,Metlakatla SPB,Metlakatla,AK,USA,55.13104528,-131.5780675
MTN,Martin State,Baltimore,MD,USA,39.32566333,-76.41376556
MTO,Coles County Memorial,Mattoon-Charleston,IL,USA,39.47793722,-88.27923833
MTP,Montauk,Montauk,NY,USA,41.07694333,-71.92039972
MTV,Blue Ridge,Martinsville,VA,USA,36.63074861,-80.01834917
MTW,Manitowoc County,Manitowoc,WI,USA,44.1287725,-87.68058472
MUE,Waimea-Kohala,Kamuela,HI,USA,20.00132694,-155.6681072
MUT,Muscatine Municipal,Muscatine,IA,USA,41.36786333,-91.14821639
MVC,Monroe County,Monroeville,AL,USA,31.45805306,-87.35104028
MVE,Montevideo-Chippewa County,Montevideo,MN,USA,44.96905556,-95.71025
MVI,Monte Vista Muni,Monte Vista,CO,USA,37.52855833,-106.0460533
MVL,Morrisville-Stowe State,Morrisville,VT,USA,44.53460806,-72.61400444
MVM,Machias Valley,Machias,ME,USA,44.70311111,-67.47861111
MVN,Mt Vernon-Outland,Mt. Vernon,IL,USA,38.32335444,-88.85847917
MVY,Marthas Vineyard,Marthas Vineyard,MA,USA,41.39302583,-70.6143325
MWA,Williamson County,Marion,IL,USA,37.75313528,-89.01159694
MWC,Lawrence J Timmerman,Milwaukee,WI,USA,43.11092694,-88.03442194
MWH,Grant County,Moses Lake,WA,USA,47.20770806,-119.3201897
MWK,Mount Airy-Surry County,Mount Airy,NC,USA,36.459735,-80.55295722
MWL,Mineral Wells Municipal,Mineral Wells,TX,USA,32.78160556,-98.060175
MWM,Windom Municipal,Windom,MN,USA,43.91340167,-95.10940833
MWO,Hook Field Municipal,Middletown,OH,USA,39.53102778,-84.39527778
MXA,Manila Municipal,Manila,AR,USA,35.89444444,-90.15456944
MXO,Monticello Municipal,Monticello,IA,USA,42.22611111,-91.16708333
MYF,Montgomery,San Diego,CA,USA,32.81573306,-117.1395664
MYK,May Creek,May Creek,AK,USA,61.33567417,-142.686775
MYL,McCall,McCall,ID,USA,44.88879556,-116.1017497
MYR,Myrtle Beach International,Myrtle Beach,SC,USA,33.67975,-78.92833333
MYU,Mekoryuk,Mekoryuk,AK,USA,60.37142,-166.2706083
MYV,Yuba County,Marysville,CA,USA,39.09777278,-121.569825
MYZ,Marysville Municipal,Marysville,KS,USA,39.85416833,-96.63021389
MZJ,Pinal Airpark,Marana,AZ,USA,32.50984389,-111.3253339
MZZ,Marion Municipal,Marion,IN,USA,40.49037278,-85.67914389
N00,Maben,Lexington,NY,USA,42.27230778,-74.39403667
N03,Cortland Cty-Chase,Cortland,NY,USA,42.59264528,-76.2148825
N04,Griswold,Madison,CT,USA,41.27118222,-72.54972972
N07,Lincoln Park,Lincoln Park,NJ,USA,40.94752444,-74.31450139
N10,Perkiomen Valley,Collegeville,PA,USA,40.20404833,-75.43026306
N12,Lakewood,Lakewood,NJ,USA,40.0667825,-74.17764167
N13,Bloomsburg Muni,Bloomsburg,PA,USA,40.99778111,-76.43605583
N14,Flying W,Lumbrerton,NJ,USA,39.93427778,-74.80725
N23,Sidney Muni,Sidney,NY,USA,42.30258,-75.41595639
N24,Questa Municipal Nr 2,Questa,NM,USA,36.80030556,-105.5975
N25,Westport,"Westport, NY",NY,USA,44.15838611,-73.43290444
N27,Bradford County,Towanda,PA,USA,41.74324028,-76.44457083
N29,Magdalena,Magdalena,NM,USA,34.09450778,-107.2978142
N30,Cherry Ridge,Honesdale,PA,USA,41.51533861,-75.25148139
N35,Punxsutawney Muni,Punxsutawney,PA,USA,40.96667472,-78.93000528
N37,Monticello,Monticello,NY,USA,41.62249167,-74.70141111
N38,Grand Canyon State,Wellsboro,PA,USA,41.72790028,-77.39651139
N40,Sky Manor,Pittstown,NJ,USA,40.56626889,-74.97864139
N47,Pottstown Muni,Pottstown,PA,USA,40.26040083,-75.67085306
N51,Solberg-Hunterdon,Readington,NJ,USA,40.58286278,-74.73656222
N53,Stroudsburg-Pocono,East Stroudsburg,PA,USA,41.03587167,-75.16067889
N57,New Garden Flying,Toughkenamon,PA,USA,39.83052639,-75.76974472
N66,Oneonta Muni,Oneonta,NY,USA,42.52476694,-75.06446167
N67,Wings,Ambler,PA,USA,40.13647333,-75.26702972
N68,Chambersburg Muni,Chambersburg,PA,USA,39.97295167,-77.64326778
N69,Stormville,Stormville,NY,USA,41.57698222,-73.73235278
N72,Warwick Muni,Warwick,NY,USA,41.28759361,-74.28709472
N73,Red Lion,Vincentown,NJ,USA,39.90415167,-74.74954917
N79,Northumberland Cty,Shamokin,PA,USA,40.83692306,-76.55245611
N81,Hammonton Muni,Hammonton,NJ,USA,39.66746889,-74.75773444
N82,Wurtsboro-Sullivan Cty,Wurtsboro,NY,USA,41.59720444,-74.45840722
N85,Alexandria,Pittstown,NJ,USA,40.58757389,-75.01942056
N87,Trenton-Robbinsville,Robbinsville,NJ,USA,40.21394333,-74.60179472
N89,Joseph Y. Resnick,Ellenville,NY,USA,41.72787111,-74.37737583
N93,New Golovin,Golovin,AK,USA,64.55305556,-163.0088889
N99,Brandywine,West Chester,PA,USA,39.99472222,-75.58333333
NC14,Rockingham County NC Shiloh,Reidsville,NC,USA,36.43722083,-79.85101
NC67,Ashe County,West Jefferson,NC,USA,36.43243111,-81.41968472
ND06,Cavalier Municipal,Cavalier,ND,USA,48.78388139,-97.62981028
ND12,Ellendale Municipal,Ellendale,ND,USA,46.01247194,-98.51287889
ND17,Harvey Municipal,Harvey,ND,USA,47.79123306,-99.93174222
ND26,Kenmare Municipal,Kenmare,ND,USA,48.66758278,-102.0475944
ND28,Lakota Municipal,Lakota,ND,USA,48.0313875,-98.32788111
ND29,La Moure Rott Municipal,La Moure (New Site),ND,USA,46.34663556,-98.28371
ND33,Linton Municipal,Linton,ND,USA,46.21830472,-100.2450028
ND44,Mott Municipal,Mott,ND,USA,46.359725,-102.3229389
ND66,Washburn Municipal,Washburn,ND,USA,47.35305,-101.0273681
NEW,Lakefront,New Orleans,LA,USA,30.04242056,-90.02825694
NH12,Plymouth Municipal,Plymouth,NH,USA,43.77923806,-71.75369056
NK03,Kamp,Durhamville,NY,USA,43.13472111,-75.64890417
NQA,Millington Municipal,Millington,TN,USA,35.35666667,-89.87027778
NRN,Norton Municipal,Norton,KS,USA,39.84914444,-99.89320583
NUL,Nulato,Nulato,AK,USA,64.72981944,-158.0731889
NVD,Nevada Municipal,Nevada,MO,USA,37.85206528,-94.30486472
NY0,Fulton Cty,Johnstown,NY,USA,42.99821222,-74.32955111
O02,Nervino,Beckwourth,CA,USA,39.82073556,-120.3543767
O05,Rogers,Chester,CA,USA,40.28235278,-121.2411683
O08,Colusa County,Colusa,CA,USA,39.17903,-121.9933611
O09,Round Valley,Covelo,CA,USA,39.79015444,-123.2664025
O11,Cherokee Nation,Stilwell,OK,USA,35.75703083,-94.64994417
O15,Turlock Municipal,Turlock,CA,USA,37.48743556,-120.6968669
O16,Garberville,Garberville,CA,USA,40.08597806,-123.8136397
O17,Nevada County  Air Park,Grass Valley,CA,USA,39.22402778,-121.0030833
O19,Kneeland,Eureka,CA,USA,40.7193,-123.9275531
O21,Hoopa,Hoopa,CA,USA,41.04290778,-123.6683894
O22,Columbia,Columbia,CA,USA,38.03042306,-120.4145556
O24,Lee Vining,Lee Vining,CA,USA,37.95825861,-119.1065375
O26,Lone Pine,Lone Pine,CA,USA,36.58826667,-118.0520314
O27,Oakdale,Oakdale,CA,USA,37.75634472,-120.8002089
O28,Ells Field-Willits Municipal,Willits,CA,USA,39.45129778,-123.3722844
O31,Healdsburg Municipal,Healdsburg,CA,USA,38.65352083,-122.8994397
O32,Reedley Municipal,Reedley,CA,USA,36.66633917,-119.4498483
O35,Hollis Municipal,Hollis,OK,USA,34.70839417,-99.90871194
O37,Haigh,Orland,CA,USA,39.72124194,-122.1466508
O41,Watts-Woodland,Woodland,CA,USA,38.67387639,-121.8720772
O42,Woodlake,Woodlake,CA,USA,36.39883833,-119.1073289
O43,Yerington Municipal,Yerington,NV,USA,39.00408444,-119.1579303
O45,Hooker Municipal,Hooker,OK,USA,36.85708306,-101.2270903
O46,Weed,Weed,CA,USA,41.47487,-122.4530739
O47,Prague Municipal,Prague,OK,USA,35.48201417,-96.71862944
O48,Little River,Little River,CA,USA,39.26203778,-123.7537347
O52,Sutter County,Yuba City,CA,USA,39.12655889,-121.6091328
O53,Medford Municipal,Medford,OK,USA,36.79058417,-97.74899722
O54,Lonnie Pool /Weaverville,Weaverville,CA,USA,40.7457,-122.92197
O57,Bryant,Bridgeport,CA,USA,38.26241917,-119.2257094
O59,Cedarville,Cedarville,CA,USA,41.55267139,-120.1663339
O60,Cloverdale Municipal,Cloverdale,CA,USA,38.7743525,-122.9922217
O61,Cameron Airpark,Cameron Park,CA,USA,38.68407028,-120.9871642
O65,Okeene Municipal,Okeene,OK,USA,36.11253667,-98.3086825
O68,Mariposa-Yosemite,Mariposa,CA,USA,37.51077,-120.0418439
O69,Petaluma Municipal,Petaluma,CA,USA,38.2578325,-122.6055406
O70,Westover Field Amador County,Jackson,CA,USA,38.37680111,-120.7939075
O81,Tulelake Municipal,Tulelake,CA,USA,41.88738,-121.3594331
O85,Benton,Redding,CA,USA,40.57487278,-122.4080642
O86,Trinity Center,Trinity Center,CA,USA,40.98320111,-122.6941889
O88,Rio Vista Municipal,Rio Vista,CA,USA,38.1935,-121.7023889
O89,Fall River Mills,Fall River Mills,CA,USA,41.01877417,-121.4333136
OAJ,Albert J Ellis,Jacksonville,NC,USA,34.82916444,-77.61213778
OAK,Metropolitan Oakland International,Oakland,CA,USA,37.72129083,-122.2207167
OAR,Marina Municipal,Marina,CA,USA,36.68190278,-121.7624492
OBE,Okeechobee County,Okeechobee,FL,USA,27.26282306,-80.84978306
OBU,Kobuk,Kobuk,AK,USA,66.90917056,-156.8610575
OCF,Ocala Regional/Jim Taylor,Ocala,FL,USA,29.17261111,-82.22416667
OCH,Nacogdoches-A.L. Mangham Jr. Regional,Nacogdoches,TX,USA,31.57802778,-94.70954167
OCQ,Oconto Municipal,Oconto,WI,USA,44.8735825,-87.9090525
OCW,Warren,Washington,NC,USA,35.57046806,-77.04981306
ODO,Odessa-Schlemeyer,Odessa,TX,USA,31.92056722,-102.3870892
ODX,Evelyn Sharp,Ord,NE,USA,41.62425,-98.95236111
OEB,Branch County Memorial,Coldwater,MI,USA,41.93344861,-85.052585
OEL,Oakley Municipal,Oakley,KS,USA,39.10994444,-100.8164444
OEO,L. O. Simenstad Municipal,Osceola,WI,USA,45.30858944,-92.69008056
OFK,Karl Stefan Memorial,Norfolk,NE,USA,41.98546389,-97.43511111
OFP,Hanover County Municipal,Richmond,VA,USA,37.7080325,-77.43601028
OGA,Searle,Ogallala,NE,USA,41.11961111,-101.7689444
OGB,Orangeburg Municipal,Orangeburg,SC,USA,33.46094444,-80.85891667
OGD,Ogden-Hinckley,Ogden,UT,USA,41.19594417,-112.012175
OGG,Kahului,Kahului,HI,USA,20.89864972,-156.4304578
OGM,Ontonagon County,Ontonagon,MI,USA,46.84547028,-89.36708806
OGS,Ogdensburg Intl,Ogdensburg,NY,USA,44.68185361,-75.46549917
OH17,Henry County,Napoleon,OH,USA,41.37427778,-84.06791667
OH21,Huron County,Norwalk,OH,USA,41.24476583,-82.55122722
OH30,Put In Bay,Put In Bay,OH,USA,41.63674333,-82.82833333
OIC,Lt Warren Eaton,Norwich,NY,USA,42.56655417,-75.52411167
OIN,Oberlin Municipal,Oberlin,KS,USA,39.83378278,-100.5394236
OJC,Johnson County Executive,Olathe,KS,USA,38.84760194,-94.73758583
OKB,Oceanside Municipal,Oceanside,CA,USA,33.21797639,-117.3515075
OKC,Will Rogers World,Oklahoma City,OK,USA,35.39308833,-97.60073389
OKK,Kokomo Municipal,Kokomo,IN,USA,40.5281775,-86.05899
OKM,Okmulgee Municipal,Okmulgee,OK,USA,35.66813889,-95.94869444
OKS,Garden County,Oshkosh,NE,USA,41.40097222,-102.3550278
OKV,Winchester Regional,Winchester,VA,USA,39.14352139,-78.14444444
OKZ,Kaolin,Sandersville,GA,USA,32.96672222,-82.83816667
OLD,Dewitt Field-Old Town Municipal,Old Town,ME,USA,44.9525,-68.67433333
OLE,Olean Muni,Olean,NY,USA,42.24006611,-78.371685
OLF,L M Clayton,Wolf Point,MT,USA,48.09451778,-105.5750536
OLM,Olympia,Olympia,WA,USA,46.9705,-122.9022083
OLS,Nogales International,Nogales,AZ,USA,31.41772222,-110.8478889
OLU,Columbus Municipal,Columbus,NE,USA,41.448,-97.34263889
OLV,Olive Branch,Olive Branch,MS,USA,34.97875,-89.78683333
OLY,Olney-Noble,Olney-Noble,IL,USA,38.72182722,-88.17643278
OLZ,Oelwein Municipal,Oelwein,IA,USA,42.68084472,-91.97447833
OMA,Eppley Airfield,Omaha,NE,USA,41.30251861,-95.89417306
OME,Nome,Nome,AK,USA,64.51220222,-165.4452458
OMH,Orange County,Orange,VA,USA,38.24721639,-78.04561028
OMK,Omak,Omak,WA,USA,48.46440222,-119.5180503
OMN,Ormond Beach Municipal,Ormond Beach,FL,USA,29.30113889,-81.11380556
ONA,Winona Muni-Max Conrad,Winona,MN,USA,44.07721306,-91.70831694
ONL,O Neill Municipal,O Neill,NE,USA,42.46988889,-98.68805556
ONM,Socorro Municipal,Socorro,NM,USA,34.02247222,-106.9031389
ONO,Ontario Muni,Ontario,OR,USA,44.02052417,-117.013635
ONP,Newport Muni,Newport,OR,USA,44.58036111,-124.0579167
ONT,Ontario International,Ontario,CA,USA,34.056,-117.6011944
ONY,Olney Municipal,Olney,TX,USA,33.35088056,-98.81916667
ONZ,Grosse Ile Municipal,Detroit - Grosse Ile,MI,USA,42.09860472,-83.16105861
OOA,Oskaloosa Municipal,Oskaloosa,IA,USA,41.22614944,-92.49388278
OOH,Hoonah SPB,Hoonah,AK,USA,58.11215944,-135.451805
OOK,Toksook Bay,Toksook Bay,AK,USA,60.53337639,-165.1139636
OPF,Opa-Locka,Miami,FL,USA,25.907,-80.27838889
OPL,St Landry Parish - Ahart,Opelousas,LA,USA,30.55840556,-92.099375
OPN,Thomaston-Upton County,Thomaston,GA,USA,32.95458861,-84.26315222
OQU,Quonset State,North Kingstown,RI,USA,41.5971525,-71.41215333
OQW,Maquoketa Municipal,Maquoketa,IA,USA,42.050075,-90.73880472
OR33,Boardman,Boardman,OR,USA,45.814825,-119.8205006
ORB,Orr Regional,Orr,MN,USA,48.01592194,-92.85605139
ORC,Orange City Municipal,Orange City,IA,USA,42.99026444,-96.06279667
ORD,Chicago O'Hare International,Chicago,IL,USA,41.979595,-87.90446417
ORE,Orange Municipal,Orange,MA,USA,42.57011889,-72.28860667
ORF,Norfolk International,Norfolk,VA,USA,36.89461111,-76.20122222
ORG,Orange County,Orange,TX,USA,30.06916667,-93.80091667
ORH,Worcester Regional,Worcester,MA,USA,42.26733944,-71.87570944
ORI,Port Lions,Port Lions,AK,USA,57.8853775,-152.8461011
ORL,Executive,Orlando,FL,USA,28.54547222,-81.33294444
ORS,Orcas Island,Eastsound,WA,USA,48.70816,-122.9137961
ORT,Northway,Northway,AK,USA,62.96133361,-141.9291369
ORV,Robert(Bob) Curtis Memorial,Noorvik,AK,USA,66.82852667,-161.0277908
OSC,Oscoda - Wurtsmith,Oscoda,MI,USA,44.45260972,-83.38036389
OSH,Wittman Regional,Oshkosh,WI,USA,43.98436639,-88.55705944
OSU,Ohio State University,Columbus,OH,USA,40.07977778,-83.07302778
OSX,Kosciusko-Attala County,Kosciusko,MS,USA,33.09025889,-89.54201722
OTG,Worthington Municipal,Worthington,MN,USA,43.65506611,-95.57920917
OTH,North Bend Muni,North Bend,OR,USA,43.41713889,-124.2460278
OTM,Ottumwa Industrial,Ottumwa,IA,USA,41.10659611,-92.44793972
OTZ,Ralph Wien Memorial,Kotzebue,AK,USA,66.88467694,-162.5985497
OUN,University of Oklahoma Westheimer,Norman,OK,USA,35.24556444,-97.47212861
OVE,Oroville Municipal,Oroville,CA,USA,39.48775,-121.622
OVO,North Vernon,North Vernon,IN,USA,39.04563667,-85.60533
OVS,Boscobel,Boscobel,WI,USA,43.16063056,-90.67421833
OWA,Owatonna Degner Regional,Owatonna,MN,USA,44.12339722,-93.26061667
OWB,Owensboro-Daviess County,Owensboro,KY,USA,37.74011111,-87.16683333
OWD,Norwood Memorial,Norwood,MA,USA,42.19079694,-71.17310389
OWI,Ottawa Municipal,Ottawa,KS,USA,38.53866667,-95.25297222
OWK,Central Maine,Norridgewock,ME,USA,44.7155,-69.86647222
OWX,Putnam County,Ottawa,OH,USA,41.0355825,-83.98202444
OXB,Ocean City,Ocean City,MD,USA,38.31044444,-75.12397222
OXC,Waterbury-Oxford,Oxford,CT,USA,41.47855556,-73.13525
OXD,Miami University,Oxford,OH,USA,39.50203917,-84.7841425
OXI,Starke County,Knox,IN,USA,41.3301875,-86.66473194
OXR,Oxnard,Oxnard,CA,USA,34.20080083,-119.2072164
OXV,Knoxville Municipal,Knoxville,IA,USA,41.29888556,-93.11381556
OYM,St Marys Muni,St Marys,PA,USA,41.41247778,-78.50263139
OZA,Ozona Municipal,Ozona,TX,USA,30.73528028,-101.2029719
OZW,Livingston County,Howell,MI,USA,42.62950694,-83.98417361
P01,Ajo Municipal,Ajo,AZ,USA,32.45005694,-112.8673778
P04,Bisbee Municipal,Bisbee,AZ,USA,31.36399028,-109.8831286
P08,Coolidge Municipal,Coolidge,AZ,USA,32.93594444,-111.4265278
P13,San Carlos Apache,Globe,AZ,USA,33.35314722,-110.6673611
P14,Holbrook Municipal,Holbrook,AZ,USA,34.93891389,-110.1395656
P20,Avi Suquilla,Parker,AZ,USA,34.15063889,-114.2712222
P32,H.A. Clark Memorial,Williams,AZ,USA,35.30223222,-112.1940575
P33,Cochise County,Willcox,AZ,USA,32.24540278,-109.8946319
P45,Mount Pleasant-Scottdale,Mount Pleasant,PA,USA,40.10840556,-79.54142694
P52,Cottonwood,Cottonwood,AZ,USA,34.73002111,-112.0351569
P53,Rostraver,Monongahela,PA,USA,40.20972222,-79.83144444
PAE,Snohomish County,Everett,WA,USA,47.90762861,-122.2815892
PAH,Barkley Regional,Paducah,KY,USA,37.06083333,-88.77375
PAK,Port Allen,Hanapepe,HI,USA,21.89686833,-159.6033217
PAN,Payson,Payson,AZ,USA,34.25683639,-111.3392558
PAO,Palo Alto Arpt of Santa Clara Co,Palo Alto,CA,USA,37.46111944,-122.1150444
PAQ,Palmer Municipal,Palmer,AK,USA,61.59474194,-149.0888242
PBF,Grider,Pine Bluff,AR,USA,34.17498722,-91.93472028
PBH,Price County,Phillips,WI,USA,45.70895028,-90.40248472
PBI,Palm Beach International,West Palm Beach,FL,USA,26.68316194,-80.09559417
PBV,St. George,St. George,AK,USA,56.57735278,-169.6637361
PCK,Porcupine Creek,Porcupine Creek,AK,USA,67.23789833,-150.2860608
PCM,Plant City Municipal,Plant City,FL,USA,28.00021667,-82.16424167
PCW,Carl R. Keller,Port Clinton,OH,USA,41.51627778,-82.86869444
PCZ,Waupaca Municipal,Waupaca,WI,USA,44.33368778,-89.01549861
PDC,Prairie Du Chien Municipal,Prairie Du Chien,WI,USA,43.01928889,-91.12374722
PDK,Dekalb-Peachtree,Atlanta,GA,USA,33.87560444,-84.30196778
PDT,Eastern Oregon Regional At Pendleton,Pendleton,OR,USA,45.69505556,-118.8414444
PDX,Portland Intl,Portland,OR,USA,45.58872222,-122.5975
PEA,Pella Municipal,Pella,IA,USA,41.40006667,-92.94588333
PEC,Pelican SPB,Pelican,AK,USA,57.95517222,-136.2362733
PEO,Penn Yan,Penn Yan,NY,USA,42.63813556,-77.05306083
PEQ,Pecos Municipal,Pecos City,TX,USA,31.3823575,-103.5107017
PEZ,Pleasanton Municipal,Pleasanton,TX,USA,28.95419444,-98.51998917
PFN,Panama City-Bay County International,Panama City,FL,USA,30.21208333,-85.68280556
PGA,Page Municipal,Page,AZ,USA,36.92611111,-111.4483611
PGD,Charlotte County,Punta Gorda,FL,USA,26.92019444,-81.99052778
PGM,Port Graham,Port Graham,AK,USA,59.34825944,-151.8315389
PGR,Kirk,Paragould,AR,USA,36.06352944,-90.50986028
PGV,Pitt-Greenville,Greenville,NC,USA,35.63523944,-77.38532028
PHD,Harry Clever,New Philadelphia,OH,USA,40.47091667,-81.41975
PHF,Newport News/Williamsburg International,Newport News,VA,USA,37.13189556,-76.4929875
PHG,Phillipsburg Municipal,Phillipsburg,KS,USA,39.73530556,-99.31741667
PHH,Andrews Municipal,Andrews,SC,USA,33.45169472,-79.52620111
PHK,Palm Beach County Glades,Pahokee,FL,USA,26.78503861,-80.69335528
PHL,Philadelphia Intl,Philadelphia,PA,USA,39.87195278,-75.24114083
PHN,St Clair County International,Port Huron,MI,USA,42.91095778,-82.52886139
PHO,Point Hope,Point Hope,AK,USA,68.34877417,-166.7993086
PHP,Philip,Philip,SD,USA,44.04862722,-101.5990603
PHT,Henry County,Paris,TN,USA,36.33822472,-88.38287861
PHX,Phoenix Sky Harbor International,Phoenix,AZ,USA,33.43416667,-112.0080556
PIA,Greater Peoria Regional,Peoria,IL,USA,40.66424333,-89.69330556
PIB,Hattiesburg-Laurel Regional,Hattiesburg-Laurel,MS,USA,31.46714944,-89.33705778
PIE,St. Petersburg-Clearwater International,St. Petersburg,FL,USA,27.91076333,-82.68743944
PIH,Pocatello Regional,Pocatello,ID,USA,42.91130556,-112.5958611
PIL,Port Isabel-Cameron County,Port Isabel,TX,USA,26.16621,-97.34588611
PIM,Callaway Gardens-Harris County,Pine Mountain,GA,USA,32.84069444,-84.88244444
PIR,Pierre Regional,Pierre,SD,USA,44.38267694,-100.285965
PIT,Pittsburgh International,Pittsburgh,PA,USA,40.49146583,-80.23287083
PIZ,Point Lay Dew Station,Point Lay,AK,USA,69.732875,-163.0053417
PJY,Pinckneyville-Duquoin,Pinckneyville-Duquoin,IL,USA,37.97788417,-89.36044889
PKA,Napaskiak,Napaskiak,AK,USA,60.70369056,-161.7767367
PKB,Wood Cty/Gill Robb Wilson,Parkersburg,WV,USA,39.34510333,-81.43920194
PKD,Park Rapids Municipal,Park Rapids,MN,USA,46.90062583,-95.07313278
PKF,Park Falls Municipal,Park Falls,WI,USA,45.95502361,-90.42441806
PLB,Clinton Cty,Plattsburgh,NY,USA,44.68751861,-73.52452306
PLD,Portland Municipal,Portland,IN,USA,40.45076167,-84.99007917
PLN,Pellston Regional  of Emmet County,Pellston,MI,USA,45.5709275,-84.796715
PLR,St Clair County,Pell City,AL,USA,33.55883333,-86.24905556
PMB,Pembina Municipal,Pembina,ND,USA,48.9425,-97.24083333
PMD,Palmdale Production Flight,Palmdale,CA,USA,34.62938889,-118.0845528
PMH,Greater Portsmouth Regional,Portsmouth,OH,USA,38.84047,-82.84731361
PMP,Pompano Beach Airpark,Pompano Beach,FL,USA,26.24713889,-80.11105556
PMV,Plattsmouth Municipal,Plattsmouth,NE,USA,40.95025,-95.91788889
PMX,Metropolitan,Palmer,MA,USA,42.22328722,-72.31138694
PMZ,Plymouth Municipal,Plymouth,NC,USA,35.80843944,-76.75927694
PNA,Ralph Wenz,Pinedale,WY,USA,42.79549917,-109.8070944
PNC,Ponca City Municipal,Ponca City,OK,USA,36.73058417,-97.09976833
PNE,Northeast Philadelphia,Philadelphia,PA,USA,40.08194417,-75.01058667
PNM,Princeton Municipal,Princeton,MN,USA,45.55986778,-93.60821611
PNN,Princeton Municipal,Princeton,ME,USA,45.20066667,-67.56438889
PNP,Pilot Point,Pilot Point,AK,USA,57.58038056,-157.5674444
PNS,Pensacola Regional,Pensacola,FL,USA,30.47330556,-87.18744444
POC,Brackett,La Verne,CA,USA,34.09164833,-117.7817803
POF,Poplar Bluff Municipal,Poplar Bluff,MO,USA,36.77394444,-90.32484722
POH,Pocahontas Municipal,Pocahontas,IA,USA,42.74280556,-94.64730556
POU,Dutchess Cty,Poughkeepsie,NY,USA,41.62661111,-73.88411111
POY,Powell Muni,Powell,WY,USA,44.86797222,-108.793
PPA,Perry Lefors,Pampa,TX,USA,35.61298806,-100.9962608
PPC,Prospect Creek,Prospect Creek,AK,USA,66.81288139,-150.6437925
PPF,Tri City,Parsons,KS,USA,37.33125778,-95.50900667
PPG,Pago Pago International,Pago Pago,AS,USA,14.33102278,-170.7105258
PPO,La Porte Municipal,La Porte,IN,USA,41.57276194,-86.73413139
PPQ,Pittsfield Penstone Municipal,Pittsfield,IL,USA,39.63885556,-90.77843111
PQI,Northern Maine Regional,Presque Isle,ME,USA,46.68896,-68.04479972
PQL,Trent Lott International,Pascagoula,MS,USA,30.46278111,-88.52922778
PQN,Pipestone Municipal,Pipestone,MN,USA,43.98330333,-96.30031083
PR03,Fajardo Harbor Seaplane Base,Fajardo,PR,USA,18.339675,-65.62460583
PRB,Paso Robles Municipal,Paso Robles,CA,USA,35.67288611,-120.6270558
PRC,Ernest A. Love,Prescott,AZ,USA,34.65447222,-112.4195833
PRG,Edgar County,Paris,IL,USA,39.70015944,-87.66961861
PRN,Greenville Municipal,Greenville,AL,USA,31.84540222,-86.61044583
PRO,Perry Municipal,Perry,IA,USA,41.82801306,-94.15990361
PRX,Cox,Paris,TX,USA,33.63660667,-95.45073194
PSB,Mid-State,Philipsburg,PA,USA,40.88439139,-78.08734167
PSC,Tri-Cities,Pasco,WA,USA,46.26468028,-119.1190292
PSE,Mercedita,Ponce,PR,USA,18.00830278,-66.56301194
PSF,Pittsfield Municipal,Pittsfield,MA,USA,42.42684667,-73.29292806
PSG,James C. Johnson Petersburg,Petersburg,AK,USA,56.80165194,-132.9452781
PSK,New River Valley,Dublin,VA,USA,37.13734528,-80.67848167
PSM,Pease International Tradeport,Portsmouth,NH,USA,43.07795889,-70.82327333
PSN,Palestine Municipal,Palestine,TX,USA,31.77969444,-95.70630556
PSP,Palm Springs International,Palm Springs,CA,USA,33.82921556,-116.5062531
PSX,Palacios Municipal,Palacios,TX,USA,28.72751778,-96.2509675
PTB,Dinwiddie County,Petersburg,VA,USA,37.18375833,-77.50738889
PTD,Potsdam Muni-Damon,Potsdam,NY,USA,44.67666917,-74.94844639
PTH,Port Heiden,Port Heiden,AK,USA,56.95943333,-158.6318208
PTK,Oakland-Pontiac,Pontiac,MI,USA,42.66520389,-83.41870917
PTN,Harry P. Williams Memorial,Patterson,LA,USA,29.71081917,-91.33971778
PTS,Atkinson Municipal,Pittsburg,KS,USA,37.44855556,-94.73133333
PTT,Pratt Industrial,Pratt,KS,USA,37.7000175,-98.7462025
PTU,Platinum,Platinum,AK,USA,59.01135611,-161.8196661
PTV,Porterville Municipal,Porterville,CA,USA,36.02960778,-119.0627311
PTW,Pottstown Limerick,Pottstown,PA,USA,40.23957167,-75.55662528
PUB,Pueblo Memorial,Pueblo,CO,USA,38.28908722,-104.4965722
PUC,Carbon County,Price,UT,USA,39.61391556,-110.7514183
PUW,Pullman/Moscow Regional,"Pullman/Moscow,ID",WA,USA,46.74386111,-117.1095833
PVB,Platteville Municipal,Platteville,WI,USA,42.68935583,-90.44439278
PVC,Provincetown Municipal,Provincetown,MA,USA,42.07199833,-70.22137667
PVD,Theodore F Green State,Providence,RI,USA,41.72399917,-71.42822111
PVF,Placerville,Placerville,CA,USA,38.72421806,-120.753325
PVG,Hampton Roads Executive,Portsmouth,VA,USA,36.78014889,-76.44883472
PVJ,Pauls Valley Municipal,Pauls Valley,OK,USA,34.71105361,-97.22321694
PVU,Provo Muni,Provo,UT,USA,40.21919444,-111.7233611
PVW,Hale County,Plainview,TX,USA,34.16814722,-101.7173361
PWA,Wiley Post,Oklahoma City,OK,USA,35.53455,-97.64721556
PWC,Pine River Regional,Pine River,MN,USA,46.7247875,-94.3817
PWD,Sher-Wood,Plentywood,MT,USA,48.79030583,-104.533845
PWG,McGregor Exectuive,Waco,TX,USA,31.48491667,-97.31652778
PWK,Palwaukee,Chicago/Wheeling/Prospect Heights,IL,USA,42.11418083,-87.90148083
PWM,Portland International Jetport,Portland,ME,USA,43.64616667,-70.30875
PWT,Bremerton National,Bremerton,WA,USA,47.49275361,-122.7624286
PXE,Perry-Houston Couty,Perry,GA,USA,32.51058333,-83.76733333
PYG,Pageland,Pageland,SC,USA,34.74213889,-80.34519444
PYM,Plymouth Municipal,Plymouth,MA,USA,41.90902444,-70.72878778
PYX,Perryton Ochiltree County,Perryton,TX,USA,36.41200333,-100.7517883
PZQ,Presque Isle County,Rogers City,MI,USA,45.40709667,-83.81288556
Q00,Littlefield Municipal,Littlefield,TX,USA,33.92395306,-102.3866831
Q06,City of Tulia/Swisher County Municipal,Tulia,TX,USA,34.56682472,-101.7814611
Q14,San Juan Pueblo,Espanola,NM,USA,36.02502306,-106.0464114
Q16,Reserve,Reserve,NM,USA,33.70005472,-108.8506214
Q17,Boonville,Boonville,CA,USA,39.0126775,-123.3827864
Q21,Brownsville,Brownsville,CA,USA,39.45544417,-121.2913511
Q24,Levelland Municipal,Levelland,TX,USA,33.54980833,-102.3727333
Q25,Dinsmore,Dinsmore,CA,USA,40.49291944,-123.5997589
Q26,Terry County,Brownfield,TX,USA,33.173675,-102.1926208
Q31,Sequoia,Visalia,CA,USA,36.44856139,-119.3190056
Q34,Portales Municipal,Portales,NM,USA,34.14547222,-103.4103333
Q35,Springerville Babbitt,Springerville,AZ,USA,34.1286575,-109.3114756
Q37,Carrizozo Municipal,Carrizozo,NM,USA,33.64886139,-105.895685
Q41,Floydada Municipal,Floydada,TX,USA,34.00230056,-101.330435
Q42,Springer Municipal,Springer,NM,USA,36.32697806,-104.6197117
Q44,Beaver Municipal,Beaver,OK,USA,36.79891472,-100.5298708
Q49,Firebaugh,Firebaugh,CA,USA,36.85998861,-120.4644675
Q53,Franklin,Franklin,CA,USA,38.30491306,-121.4296736
Q55,Dimmitt Municipal,Dimmitt,TX,USA,34.56673556,-102.3226947
Q58,Santa Rosa Municipal,Santa Rosa,NM,USA,34.93442472,-104.643065
Q61,Georgetown,Georgetown,CA,USA,38.92111389,-120.8647944
Q68,Pine Mountain Lake,Groveland,CA,USA,37.86166667,-120.1778889
Q72,Hayfork,Hayfork,CA,USA,40.54708833,-123.1816953
Q84,Mendota,Mendota,CA,USA,36.75800528,-120.3712794
Q88,Paradise Skypark,Paradise,CA,USA,39.70960639,-121.6163617
Q94,Rio Linda,Rio Linda,CA,USA,38.67601389,-121.4455092
Q95,Ruth,Ruth,CA,USA,40.21125917,-123.2975231
Q99,South County  of Santa Clara Co,San Martin,CA,USA,37.08158611,-121.5968056
RAC,John H Batten,Racine,WI,USA,42.76119139,-87.81389806
RAL,Riverside Municipal,Riverside,CA,USA,33.95187528,-117.4451017
RAP,Rapid City Regional,Rapid City,SD,USA,44.04532139,-103.0573708
RBD,Redbird,Dallas,TX,USA,32.68086111,-96.86819444
RBE,Bassett Municipal,Bassett,NE,USA,42.56966667,-99.56836111
RBG,Roseburg Regional,Roseburg,OR,USA,43.23878306,-123.3558617
RBL,Red Bluff Municipal,Red Bluff,CA,USA,40.15065667,-122.2522903
RBW,Walterboro Municipal,Walterboro,SC,USA,32.92052778,-80.64125
RBY,Ruby,Ruby,AK,USA,64.72721556,-155.4698886
RCA,Ellsworth AFB,NA,NA,USA,44.145094,-103.103567
RCR,Fulton County,Rochester,IN,USA,41.06554833,-86.18170444
RCX,Rusk County,Ladysmith,WI,USA,45.49825694,-91.00186361
RDD,Redding Municipal,Redding,CA,USA,40.50898361,-122.2934019
RDG,"Reading Muni,Gen Carl A Spaatz",Reading,PA,USA,40.3785,-75.96525
RDK,Red Oak Municipal,Red Oak,IA,USA,41.01052778,-95.25986111
RDM,Roberts,Redmond,OR,USA,44.25406722,-121.1499633
RDR,Grand Forks AFB,NA,NA,USA,47.961167,-97.401167
RDU,Raleigh-Durham International,Raleigh,NC,USA,35.87763889,-78.78747222
RDV,Red Devil,Red Devil,AK,USA,61.78764333,-157.3479344
RED,Red Lodge,Red Lodge,MT,USA,45.18744472,-109.2673778
RFD,Greater Rockford,Rockford,IL,USA,42.19536389,-89.09721111
RFG,Refugio-Rooke,Refugio,TX,USA,28.29361694,-97.32304833
RGK,Red Wing Municipal,Red Wing,MN,USA,44.58935611,-92.48496889
RHI,Rhinelander-Oneida County,Rhinelander,WI,USA,45.63119306,-89.46745361
RHV,Reid-Hillview of Santa Clara Co,San Jose,CA,USA,37.33287306,-121.8197947
RIC,Richmond International,Richmond,VA,USA,37.50516667,-77.31966667
RID,Richmond Municipal,Richmond,IN,USA,39.75721528,-84.84282
RIF,Richfield Muni,Richfield,UT,USA,38.73643611,-112.0989444
RIL,Garfield County Regional,Rifle,CO,USA,39.526315,-107.7269403
RIU,Rancho Murieta,Rancho Murieta,CA,USA,38.4887975,-121.1024447
RIV,March,Riverside,CA,USA,33.88057333,-117.2594836
RIW,Riverton Regional,Riverton,WY,USA,43.064235,-108.4598411
RKD,Knox County Regional,Rockland,ME,USA,44.06008333,-69.09925
RKP,Aransas County,Rockport,TX,USA,28.08677778,-97.04461111
RKR,Robert S Kerr,Poteau,OK,USA,35.02162639,-94.6212525
RKS,Rock Springs-Sweetwater County,Rock Springs,WY,USA,41.5942175,-109.0651928
RKW,Rockwood Municipal,Rockwood,TN,USA,35.922295,-84.68966278
RLD,Richland,Richland,WA,USA,46.305635,-119.3041853
RME,Griffis Airpark,Rome,NY,USA,43.23379861,-75.40703333
RMG,Richard B Russell,Rome,GA,USA,34.35060111,-85.15801389
RMP,Rampart,Rampart,AK,USA,65.50786222,-150.1428047
RMY,Brooks,Marshall,MI,USA,42.25118111,-84.9554525
RNC,Warren County Memorial,McMinnville,TN,USA,35.69870944,-85.84381722
RNH,New Richmond Municipal,New Richmond,WI,USA,45.14831139,-92.53806139
RNM,Ramona,Ramona,CA,USA,33.038905,-116.9136392
RNO,Reno/Tahoe International,Reno,NV,USA,39.49857611,-119.7680647
RNT,Renton Municipal,Renton,WA,USA,47.49313889,-122.21575
RNV,Cleveland Municipal,Cleveland,MS,USA,33.76114056,-90.75787528
ROA,Roanoke Regional/ Woodrum,Roanoke,VA,USA,37.32546833,-79.97542833
ROC,Greater Rochester Int'l,Rochester,NY,USA,43.11886611,-77.67238389
ROG,Rogers Municipal-Carter,Rogers,AR,USA,36.37229667,-94.10686972
ROP,Prachinburi,NA,NA,Thailand,14.078333,101.378334
ROR,Babelthoup/Koror,NA,NA,Palau,7.367222,134.544167
ROS,Rush City Regional,Rush City,MN,USA,45.69801389,-92.95298972
ROW,Roswell Industrial Air Center,Roswell,NM,USA,33.30155556,-104.5305556
ROX,Roseau Municipal,Roseau,MN,USA,48.85603806,-95.69703861
RPB,Belleville Municipal,Belleville,KS,USA,39.81790861,-97.659625
RPD,Rice Lake Regional-Carl's,Rice Lake,WI,USA,45.41809056,-91.77365194
RPX,Roundup,Roundup,MT,USA,46.47357528,-108.5576333
RQB,Roben-Hood,Big Rapids,MI,USA,43.72263278,-85.50407333
RQE,Window Rock,Window Rock,AZ,USA,35.65205556,-109.0673889
RRL,Merrill Municipal,Merrill,WI,USA,45.19927083,-89.71143389
RRT,Warroad Intl Swede Carlson,Warroad,MN,USA,48.94138889,-95.34838889
RSH,Russian Mission,Russian Mission,AK,USA,61.77967583,-161.3194772
RSL,Russell Municipal,Russell,KS,USA,38.87212222,-98.81177611
RSN,Ruston Regional,Ruston,LA,USA,32.51444444,-92.58833333
RST,Rochester International,Rochester,MN,USA,43.90882639,-92.49798722
RSV,Robinson Municipal,Robinson,IL,USA,39.01604222,-87.649775
RSW,Southwest Florida International,Ft. Myers,FL,USA,26.53616667,-81.75516667
RTN,Raton Municipal/Crews,Raton,NM,USA,36.74152778,-104.5021833
RUE,Russellville Municipal,Russellville,AR,USA,35.25914667,-93.09326611
RUG,Rugby Municipal,Rugby,ND,USA,48.39035917,-100.0242739
RUQ,Rowan County,Salisbury,NC,USA,35.64588583,-80.52029306
RUT,Rutland State,Rutland,VT,USA,43.52990694,-72.949615
RVJ,Reidsville,Reidsville,GA,USA,32.05897222,-82.15172222
RVL,Mifflin Cty,Reedsville,PA,USA,40.67737417,-77.62682833
RVN,Hawkins County,Rogersville,TN,USA,36.45757917,-82.88503722
RVS,"Richard Lloyd Jones, Jr.",Tulsa,OK,USA,36.0396275,-95.984635
RWF,Redwood Falls Muni,Redwood Falls,MN,USA,44.54720389,-95.082255
RWI,Rocky Mount Wilson,Rocky Mount,NC,USA,35.85498861,-77.89295611
RWL,Rawlins Muni,Rawlins,WY,USA,41.8055975,-107.19994
RWN,Arens,Winamac,IN,USA,41.09226306,-86.61287111
RXE,Rexburg-Madison County,Rexburg,ID,USA,43.83391139,-111.805105
RYN,Ryan,Tucson,AZ,USA,32.14308333,-111.1728611
RYV,Watertown Municipal,Watertown,WI,USA,43.16963222,-88.72321222
RYY,Cobb County-McCollum,Marietta,GA,USA,34.01315611,-84.59854472
RZL,Jasper County,Rensselaer,IN,USA,40.94789861,-87.18257944
RZN,Burnett County,Siren,WI,USA,45.8227275,-92.37250083
RZT,Ross County,Chillicothe,OH,USA,39.44136778,-83.02251556
RZZ,Halifax County,Roanoke Rapids,NC,USA,36.43945583,-77.70934139
S01,Conrad,Conrad,MT,USA,48.16863889,-111.9764722
S03,Ashland Muni-Sumner Parker,Ashland,OR,USA,42.19028361,-122.6606283
S05,Bandon State,Bandon,OR,USA,43.08733083,-124.4095578
S07,Bend Muni,Bend,OR,USA,44.09483333,-121.2006389
S10,Chelan Muni,Chelan,WA,USA,47.86597139,-119.9427053
S12,Albany Municipal,Albany,OR,USA,44.63781639,-123.0594486
S18,Forks,Forks,WA,USA,47.94146583,-124.3929867
S21,Sunriver,Sunriver,OR,USA,43.87633333,-121.4530556
S23,Ione Municipal,Ione,WA,USA,48.70727528,-117.4126036
S24,Sandusky Co,Fremont,OH,USA,41.29570556,-83.03723056
S25,Watford City Municipal,Watford City,ND,USA,47.79569972,-103.2536992
S27,Kalispell City,Kalispell,MT,USA,48.17856944,-114.3037408
S28,International Peace Garden,Dunseith,ND,USA,48.99778194,-100.0434589
S30,Lebanon State,Lebanon,OR,USA,44.529845,-122.9295336
S31,Lopez Island,Lopez,WA,USA,48.48259944,-122.9368444
S32,Cooperstown Municipal,Cooperstown,ND,USA,47.42277361,-98.10587139
S33,City-County,Madras,OR,USA,44.66623139,-121.1631
S34,Plains,Plains,MT,USA,47.47243611,-114.900135
S39,Prineville,Prineville,OR,USA,44.28699389,-120.9038328
S40,Prosser,Prosser,WA,USA,46.212355,-119.7928122
S43,Harvey,Snohomish,WA,USA,47.90815306,-122.1054072
S45,Siletz Bay State,Siletz Bay (Gleneden Beach),OR,USA,44.87761139,-124.0284472
S47,Tillamook,Tillamook,OR,USA,45.41824194,-123.8143839
S50,Auburn Municipal,Auburn,WA,USA,47.32815583,-122.2265092
S52,Methow Valley State,Winthrop,WA,USA,48.42070056,-120.1470264
S59,Libby,Libby,MT,USA,48.28384528,-115.4902453
S60,Kenmore Air Harbor Inc,Kenmore,WA,USA,47.75482,-122.2592931
S64,Stanford,Stanford,MT,USA,47.14718944,-110.2299289
S66,Homedale Municipal,Homedale,ID,USA,43.61488056,-116.9215372
S67,Nampa Muni,Nampa,ID,USA,43.58133333,-116.5230556
S68,Orofino Municipal,Orofino,ID,USA,46.49129139,-116.2768061
S69,Lincoln,Lincoln,MT,USA,46.97494083,-112.6447606
S70,Othello Muni,Othello,WA,USA,46.79486278,-119.0802875
S71,Edgar G Obie,Chinook,MT,USA,48.59194444,-109.2488889
S72,St Maries Municipal,St Maries,ID,USA,47.32768722,-116.5773906
S73,Kamiah Municipal,Kamiah,ID,USA,46.21934028,-116.0134736
S80,Idaho County,Grangeville,ID,USA,45.94255806,-116.1234158
S83,Shoshone County,Kellogg,ID,USA,47.54769889,-116.1885008
S85,Big Sky,Culbertson,MT,USA,48.15333333,-104.5038889
S87,Weiser Municipal,Weiser,ID,USA,44.20683056,-116.9623869
S89,Craigmont Municipal,Craigmont,ID,USA,46.24710917,-116.4801447
S93,Cle Elum Municipal,Cle Elum,WA,USA,47.18317583,-120.884525
S94,Whitman County Memorial,Colfax,WA,USA,46.8584975,-117.4137964
S97,Anderson,Brewster,WA,USA,48.10486806,-119.7206128
SAA,Shively,Saratoga,WY,USA,41.44485944,-106.8235264
SAC,Sacramento Executive,Sacramento,CA,USA,38.51252389,-121.4934689
SAD,Safford Regional,Safford,AZ,USA,32.85331278,-109.6349708
SAF,Santa Fe Municipal,Santa Fe,NM,USA,35.61677778,-106.0881389
SAN,San Diego International-Lindbergh,San Diego,CA,USA,32.73355611,-117.1896567
SAR,Sparta Community-Hunter,Sparta,IL,USA,38.14893833,-89.69870972
SAT,San Antonio International,San Antonio,TX,USA,29.53369444,-98.46977778
SAV,Savannah International,Savannah,GA,USA,32.12758333,-81.20213889
SAW,Sawyer,Gwinn,MI,USA,46.35361111,-87.39583222
SAZ,Staples Municipal,Staples,MN,USA,46.38087944,-94.80660167
SBA,Santa Barbara Municipal,Santa Barbara,CA,USA,34.42621194,-119.8403733
SBD,San Bernardino International,San Bernardino,CA,USA,34.09535361,-117.2348742
SBM,Sheboygan County Memorial,Sheboygan,WI,USA,43.76949444,-87.85158944
SBN,South Bend Regional,South Bend,IN,USA,41.70895361,-86.31847417
SBO,Emanuel County,Swainsboro,GA,USA,32.60825,-82.36869444
SBP,San Luis Obispo Co-McChesney,San Luis Obispo,CA,USA,35.23705806,-120.6423931
SBS,Steamboat Springs,Steamboat Springs,CO,USA,40.51625944,-106.8663006
SBU,Blue Earth Municipal,Blue Earth,MN,USA,43.59534389,-94.09284833
SBX,Shelby,Shelby,MT,USA,48.54125278,-111.8720722
SBY,Salisbury-Ocean City: Wicomico Regional,Salisbury,MD,USA,38.34052611,-75.51028806
SCB,Scribner State,Scribner,NE,USA,41.61033333,-96.62986111
SCC,Deadhorse,Deadhorse,AK,USA,70.19475583,-148.4651608
SCD,Merkel Field Sylacauga Municipal,Sylacauga,AL,USA,33.17183583,-86.30553778
SCE,University Park,NA,NA,USA,40.851206,-77.846302
SCH,Schenectady Cty,Schenectady,NY,USA,42.85245556,-73.9288675
SCK,Stockton Metro,Stockton,CA,USA,37.89426694,-121.2386203
SCM,Scammon Bay,Scammon Bay,AK,USA,61.84454111,-165.5737492
SCX,Scott Municipal,Oneida,TN,USA,36.45569444,-84.58575
SD07,Bison Municipal,Bison,SD,USA,45.51859778,-102.4671042
SD10,Canton Municipal,Canton,SD,USA,43.30888889,-96.571
SD12,Wilder,De Smet,SD,USA,44.43080278,-97.56118861
SD16,Eureka Municipal,Eureka,SD,USA,45.79998111,-99.6420625
SD18,Flandreau Municipal,Flandreau,SD,USA,44.00386056,-96.59310139
SD22,Hoven Municipal,Hoven,SD,USA,45.25755861,-99.79783944
SD28,McLaughlin Municipal,McLaughlin,SD,USA,45.79680833,-100.7842503
SD32,Murdo Municipal,Murdo,SD,USA,43.85165639,-100.7120811
SD33,Parkston Municipal,Parkston,SD,USA,43.37915361,-97.97118278
SD34,Presho Municipal,Presho,SD,USA,43.90637833,-100.0370669
SDA,Shenandoah Municipal,Shenandoah,IA,USA,40.75148167,-95.41347222
SDF,Louisville International-Standiford,Louisville,KY,USA,38.17438889,-85.736
SDL,Scottsdale,Scottsdale,AZ,USA,33.622875,-111.9105333
SDM,Brown  Municipal,San Diego,CA,USA,32.57230556,-116.98025
SDP,Sand Point Municipal,Sand Point,AK,USA,55.31502778,-160.5176944
SDY,Sidney-Richland Municipal,Sidney,MT,USA,47.70685778,-104.1925544
SEA,Seattle-Tacoma Intl,Seattle,WA,USA,47.44898194,-122.3093131
SEE,Gillespie,San Diego (El Cajon),CA,USA,32.82623111,-116.9724497
SEF,Sebring  And Industrial Park,Sebring,FL,USA,27.45640278,-81.3424
SEG,Penn Valley,Selinsgrove,PA,USA,40.82052917,-76.86377611
SEM,Craig,Selma,AL,USA,32.34394667,-86.98780333
SEP,Clark Field Municipal,Stephenville,TX,USA,32.21532333,-98.17766722
SER,Freeman Municipal,Seymour,IN,USA,38.92355361,-85.90736556
SET,St Charles County Smart,St Charles,MO,USA,38.92969444,-90.42996111
SEZ,Sedona,Sedona,AZ,USA,34.84862889,-111.7884614
SFB,Orlando Sanford,Orlando,FL,USA,28.77764,-81.23748944
SFD,Bob Wiley,Winner,SD,USA,43.39058278,-99.84256194
SFF,Felts,Spokane,WA,USA,47.68281806,-117.3225583
SFM,Sanford Regional,Sanford,ME,USA,43.39386111,-70.70800028
SFO,San Francisco International,San Francisco,CA,USA,37.61900194,-122.3748433
SFQ,Suffolk Municipal,Suffolk,VA,USA,36.68235361,-76.60187333
SFY,Tri-Township,Savanna,IL,USA,42.04581972,-90.10760056
SFZ,North Central State,Pawtucket,RI,USA,41.92076333,-71.49138139
SGF,Springfield-Branson Regional,Springfield,MO,USA,37.24432611,-93.38685806
SGH,Springfield-Beckley Municipal,Springfield,OH,USA,39.84028194,-83.84015056
SGJ,St. Augustine,St. Augustine,FL,USA,29.95925,-81.33975
SGR,Sugar Land Municipal/Hull,Houston,TX,USA,29.62225306,-95.65652889
SGS,South St.Paul Municipal,South St Paul,MN,USA,44.85713278,-93.03285389
SGT,Stuttgart Municipal,Stuttgart,AR,USA,34.60054,-91.57457417
SGU,St George Muni,St George,UT,USA,37.09058333,-113.5930556
SGY,Skagway,Skagway,AK,USA,59.46006194,-135.3156636
SHD,Shenandoah Valley Regional,Staunton/Harrisonburg,VA,USA,38.26384333,-78.89643806
SHG,Shungnak,Shungnak,AK,USA,66.88916556,-157.1505119
SHH,Shishmaref,Shishmaref,AK,USA,66.24956861,-166.0895589
SHL,Sheldon Municipal,Sheldon,IA,USA,43.20839361,-95.83343306
SHN,Sanderson,Shelton,WA,USA,47.23355556,-123.1475556
SHR,Sheridan County,Sheridan,WY,USA,44.76919556,-106.9802794
SHV,Shreveport Regional,Shreveport,LA,USA,32.4466275,-93.82559833
SHX,Shageluk,Shageluk,AK,USA,62.69511944,-159.5690614
SIG,Fernando Luis Ribas Dominicci,San Juan,PR,USA,18.45675,-66.09883333
SIK,Sikeston Memorial Municipal,Sikeston,MO,USA,36.89888889,-89.56175
SIT,Sitka,Sitka,AK,USA,57.04713806,-135.3615983
SIV,Sullivan County,Sullivan,IN,USA,39.1147125,-87.44832917
SIY,Siskiyou County,Montague,CA,USA,41.78144167,-122.4681094
SJC,San Jose International,San Jose,CA,USA,37.36186194,-121.9290089
SJN,St Johns Industrial Air Park,St Johns,AZ,USA,34.51855556,-109.37875
SJT,San Angelo Regional /Mathis,San Angelo,TX,USA,31.35775,-100.4963056
SJU,Luis Munoz Marin International,San Juan,PR,USA,18.43941667,-66.00183333
SJX,Beaver Island,St James,MI,USA,45.69227778,-85.56630556
SKA,Fairchild AFB,NA,NA,USA,47.615058,-117.655803
SKI,Sac City Municipal,Sac City,IA,USA,42.37908333,-94.97958333
SKW,Skwentna,Skwentna,AK,USA,61.965295,-151.1913661
SKX,Taos Municipal,Taos,NM,USA,36.45819,-105.6724289
SLB,Storm Lake Municipal,Storm Lake,IA,USA,42.59719444,-95.24066667
SLC,Salt Lake City Intl,Salt Lake City,UT,USA,40.78838778,-111.9777731
SLE,McNary Fld,Salem,OR,USA,44.90952778,-123.0025
SLG,Smith,Siloam Springs,AR,USA,36.19060778,-94.49088306
SLK,Adirondack,Saranac Lake,NY,USA,44.38531,-74.20618472
SLN,Salina Municipal,Salina,KS,USA,38.7914825,-97.65060333
SLO,Salem-Leckrone,Salem,IL,USA,38.64287222,-88.96418528
SLQ,Sleetmute,Sleetmute,AK,USA,61.70931139,-157.1557008
SLR,Sulphur Springs Municipal,Sulphur Springs,TX,USA,33.15983333,-95.62113889
SMD,Smith,Fort Wayne,IN,USA,41.14335389,-85.15277694
SME,Somerset-Pulaski County,Somerset,KY,USA,37.05419722,-84.61494139
SMF,Sacramento International,Sacramento,CA,USA,38.69542167,-121.5907669
SMN,Lemhi County,Salmon,ID,USA,45.12047778,-113.8820103
SMO,Santa Monica Municipal,Santa Monica,CA,USA,34.01582194,-118.4512961
SMQ,Somerset,Somerville,NJ,USA,40.62599083,-74.67024333
SMS,Sumter Municipal,Sumter,SC,USA,33.99569444,-80.3615
SMX,Santa Maria Pub/Capt G Allan Hancock,Santa Maria,CA,USA,34.89924833,-120.4575825
SNA,John Wayne /Orange Co,Santa Ana,CA,USA,33.67565861,-117.8682225
SNH,Savannah Hardin County,Savannah,TN,USA,35.17036,-88.21587
SNK,Winston,Snyder,TX,USA,32.69338667,-100.9504525
SNL,Shawnee Municipal,Shawnee,OK,USA,35.35730333,-96.94282833
SNP,St. Paul,St. Paul,AK,USA,57.16733333,-170.2204444
SNS,Salinas Municipal,Salinas,CA,USA,36.66279222,-121.6063603
SNY,Sidney Municipal,Sidney,NE,USA,41.10133333,-102.9852778
SOP,Moore County,Pinehurst/Southern Pines,NC,USA,35.23735278,-79.39116944
SOV,Seldovia,Seldovia,AK,USA,59.44243917,-151.7040503
SOW,Show Low Municipal,Show Low,AZ,USA,34.26527194,-110.0054075
SPA,Spartanburg Downtown Memorial,Spartanburg,SC,USA,34.91572222,-81.9565
SPB,Scappoose Industrial Airpark,Scappoose,OR,USA,45.77250444,-122.8623611
SPF,Black Hills-Clyde Ice,Spearfish,SD,USA,44.48022222,-103.7768889
SPG,Albert Whitted Municipal,St. Petersburg,FL,USA,27.76511111,-82.62697222
SPH,Springhill,Springhill,LA,USA,32.98316472,-93.41081028
SPI,Capital,Springfield,IL,USA,39.84395194,-89.67761861
SPN,Tinian International Airport,NA,NA,N Mariana Islands,14.996111,145.621384
SPS,Sheppard AFB/Wichita Falls Municipal,Wichita Falls,TX,USA,33.98879611,-98.49189333
SPW,Spencer Municipal,Spencer,IA,USA,43.16552778,-95.20280556
SPX,Houston-Gulf,Houston,TX,USA,29.50836111,-95.05133333
SQI,Whiteside Co,Sterling Rockfalls,IL,USA,41.74284139,-89.67629028
SQL,San Carlos,San Carlos,CA,USA,37.511855,-122.2495236
SRB,Upper Cumberland Regional,Sparta,TN,USA,36.05593278,-85.5307475
SRC,Searcy Municipal,Searcy,AR,USA,35.21194639,-91.737165
SRQ,Sarasota Bradenton International,Sarasota,FL,USA,27.39533333,-82.55411111
SRR,Sierra Blanca Regional,Ruidoso,NM,USA,33.46285,-105.5347508
SRV,Stony River 2,Stony River,AK,USA,61.789875,-156.5881861
SSF,Stinson Municipal,San Antonio,TX,USA,29.3370075,-98.47114056
SSI,Malcolm McKinnon,Brunswick,GA,USA,31.1515925,-81.39134667
SSQ,Shell Lake Municipal,Shell Lake,WI,USA,45.73138139,-91.92066194
STC,St Cloud Regional,St Cloud,MN,USA,45.54532417,-94.05833667
STE,Stevens Point Municipal,Stevens Point,WI,USA,44.54513556,-89.53028444
STF,George M Bryan,Starkville,MS,USA,33.43381667,-88.84863806
STJ,Rosecrans Memorial,St Joseph,MO,USA,39.77194444,-94.90970556
STK,Crosson,Sterling,CO,USA,40.6152625,-103.2646556
STL,Lambert-St Louis International,St Louis,MO,USA,38.74768694,-90.35998972
STP,St Paul Downtown Holman,St Paul,MN,USA,44.9344725,-93.05999861
STS,Sonoma Co,Santa Rosa,CA,USA,38.50897694,-122.8128803
STT,Cyril E. King,Charlotte Amalie,VI,USA,18.33730556,-64.97336111
STX,Henry E. Rohlsen,Christiansted,VI,USA,17.70188889,-64.79855556
SUA,Witham,Stuart,FL,USA,27.18169444,-80.22108333
SUD,Stroud Municipal,Stroud,OK,USA,35.78756833,-96.65862861
SUE,Door County Cherryland,Sturgeon Bay,WI,USA,44.84366222,-87.42154111
SUN,Friedman Memorial,Hailey,ID,USA,43.50484139,-114.2965903
SUS,Spirit of St Louis,St Louis,MO,USA,38.66187028,-90.65123
SUT,Brunswick County,Southport,NC,USA,33.92925694,-78.07499167
SUW,Richard I Bong,Superior,WI,USA,46.6897175,-92.094655
SUX,Sioux Gateway,Sioux City,IA,USA,42.40260333,-96.38436694
SVA,Savoonga,Savoonga,AK,USA,63.68639444,-170.4926361
SVC,Grant County,Silver City,NM,USA,32.63654694,-108.1563853
SVE,Susanville Municipal,Susanville,CA,USA,40.37684111,-120.5730033
SVH,Statesville Municipal,Statesville,NC,USA,35.76526389,-80.95673611
SVS,Stevens Village,Stevens Village,AK,USA,66.00900528,-149.0959153
SWD,Seward,Seward,AK,USA,60.12693833,-149.4188122
SWF,Stewart,Newburgh,NY,USA,41.50409361,-74.10483833
SWO,Stillwater Regional,Stillwater,OK,USA,36.16025194,-97.08577028
SWT,Seward Municipal,Seward,NE,USA,40.86525806,-97.10931306
SWW,Avenger,Sweetwater,TX,USA,32.46736806,-100.4665508
SXL,Summersville,Summersville,WV,USA,38.23163889,-80.87080556
SXP,Sheldon Point,Sheldon Point,AK,USA,62.52055556,-164.8477778
SXQ,Soldotna,Soldotna,AK,USA,60.47613889,-151.0324444
SYF,Cheyenne County Municipal,St Francis,KS,USA,39.76104833,-101.7958414
SYI,Bomar Field-Shelbyville Municipal,Shelbyville,TN,USA,35.56009889,-86.44249333
SYR,Syracuse-Hancock Intl,Syracuse,NY,USA,43.11118694,-76.10631056
SYV,Sylvester,Sylvester,GA,USA,31.55851111,-83.89573389
SZP,Santa Paula,Santa Paula,CA,USA,34.34722167,-119.061215
SZT,Sandpoint,Sandpoint,ID,USA,48.29965139,-116.5597681
SZY,Robert Sibley,Selmer,TN,USA,35.20295,-88.49836139
T00,Chambers County,Anahauac,TX,USA,29.77,-94.66361194
T03,Tuba City,Tuba City,AZ,USA,36.09276972,-111.3826419
T08,Tomahawk Regional,Tomahawk,WI,USA,45.46913889,-89.80569444
T18,Brooks County,Falfurrias,TX,USA,27.20683333,-98.12117083
T28,Lampasas Municipal,Lampasas,TX,USA,31.10672694,-98.19600194
T35,Cameron Municipal Airpark,Cameron,TX,USA,30.87935556,-96.97109694
T36,Paul Pittman Memorial,Tylertown,MS,USA,31.14601111,-90.168145
T41,La Porte Municipal,La Porte,TX,USA,29.66925,-95.06419444
T44,Trident Basin,Kodiak,AK,USA,57.78083333,-152.3913889
T47,Kickapoo Downtown Airpark,Wichita Falls,TX,USA,33.86122222,-98.4904425
T49,Big Spring McMahon-Wrinkle,Big Spring,TX,USA,32.21261111,-101.5216389
T53,Robstown-Nueces County,Robstown,TX,USA,27.77854306,-97.69052389
T56,Crockett-Houston County,Crockett,TX,USA,31.30696111,-95.40383056
T57,Garland Heliport,Garland,TX,USA,32.887625,-96.6836075
T60,Stonewall County,Aspermont,TX,USA,33.17231861,-100.1976044
T65,Mid Valley,Weslaco,TX,USA,26.17763889,-97.97305556
T69,Sinton-San Patricio County,Sinton,TX,USA,28.03925,-97.54244444
T71,Cuero Municipal,Cuero,TX,USA,29.08358806,-97.26693417
T72,Hearne Municipal,Hearne,TX,USA,30.87182917,-96.62222639
T74,Taylor Municipal,Taylor,TX,USA,30.57194444,-97.44316667
T78,Liberty Municipal,Liberty,TX,USA,30.07780556,-94.69855556
T80,Kleberg County,Kingsville,TX,USA,27.55086111,-98.03091833
T82,Gillespie County,Fredericksburg,TX,USA,30.24369444,-98.90952778
T89,Castroville Municipal,Castroville,TX,USA,29.34192083,-98.85090056
T90,Chambers County,Winnie/Stowell,TX,USA,29.80411,-94.43102306
T97,Calhoun County,Port Lavaca,TX,USA,28.65405111,-96.6813125
TAD,Perry Stokes,Trinidad,CO,USA,37.25937778,-104.340675
TAL,Ralph M Calhoun Memorial,Tanana,AK,USA,65.17439528,-152.1093886
TAN,Taunton Municipal,Taunton,MA,USA,41.87460139,-71.01687583
TAZ,Taylorville Municipal,Taylorville,IL,USA,39.53418583,-89.32781222
TBN,Forney AAF,Fort Leonard Wood,MO,USA,37.74163111,-92.14073611
TBR,Statesboro Municipal,Statesboro,GA,USA,32.48316667,-81.73727778
TCC,Tucumcari Municipal,Tucumcari,NM,USA,35.18277806,-103.6031853
TCL,Tuscaloosa Municipal,Tuscaloosa,AL,USA,33.2206275,-87.61140139
TCS,Truth Or Consequences Municipal,Truth Or Consequences,NM,USA,33.23694444,-107.27175
TCT,Takotna,Takotna,AK,USA,62.99270417,-156.0681903
TCY,Tracy Municipal,Tracy,CA,USA,37.68910778,-121.4418172
TDF,Person County,Roxboro,NC,USA,36.28489194,-78.98422694
TDO,Toledo-Winlock Ed Carlson Memorial,Toledo,WA,USA,46.47709083,-122.80686
TDZ,Toledo Metcalf,Toledo,OH,USA,41.56487194,-83.48226139
TEB,Teterboro,Teterboro,NJ,USA,40.85010139,-74.06083611
TEL,Perry County Municipal,Tell City,IN,USA,38.01769694,-86.69093
TEW,Mason Jewett,Mason,MI,USA,42.56576833,-84.42321861
TEX,Telluride Regional,Telluride,CO,USA,37.95375861,-107.90848
TGC,Gibson County,Trenton,TN,USA,35.93245472,-88.84894028
TGI,Tangier Island,Tangier,VA,USA,37.82513889,-75.99777778
THA,Tullahoma Regional,Tullahoma,TN,USA,35.38015694,-86.24602333
THM,Thompson Falls,Thompson Falls,MT,USA,47.57493556,-115.2843164
THP,Hot Springs County-Thermopolis Municipal,Thermopolis,WY,USA,43.65828917,-108.2131542
THV,York,York,PA,USA,39.916995,-76.87302611
TIW,Tacoma Narrows,Tacoma,WA,USA,47.26793111,-122.5780997
TIX,Space Cost Regional,Titusville,FL,USA,28.51479944,-80.7992275
TKA,Talkeetna,Talkeetna,AK,USA,62.3205,-150.0936944
TKE,Tenakee SPB,Tenakee Springs,AK,USA,57.77965833,-135.2184439
TKI,McKinney Municipal,McKinney,TX,USA,33.17794778,-96.5905275
TKX,Kennett Memorial,Kennett,MO,USA,36.23087083,-90.03466806
TLH,Tallahassee Regional,Tallahassee,FL,USA,30.39652778,-84.35033333
TLR,Mefford,Tulare,CA,USA,36.15630556,-119.3261667
TLT,Tuluksak,Tuluksak,AK,USA,61.09676222,-160.9684167
TMA,Henry Tift Myers,Tifton,GA,USA,31.42879528,-83.48787167
TMB,Kendall-Tamiami Executive,Miami,FL,USA,25.64788889,-80.43277778
TNI,West Tinian,Peipeinimaru,CQ,USA,14.99685028,-145.6180383
TNP,Twentynine Palms,Twentynine Palms,CA,USA,34.13208528,-115.9458319
TNT,Dade Collier T And T,Miami,FL,USA,25.86180556,-80.897
TNU,Newton Municipal,Newton,IA,USA,41.67442972,-93.02172917
TOA,Zamperini,Torrance,CA,USA,33.8033775,-118.3396
TOB,Dodge Center,Dodge Center,MN,USA,44.018,-92.8315
TOC,"Toccoa, R G Le Tourneau",Toccoa,GA,USA,34.59376444,-83.2958
TOG,Togiak Village,Togiak,AK,USA,59.05284222,-160.3969339
TOI,Troy Municipal,Troy,AL,USA,31.86041667,-86.01213889
TOL,Toledo Express,Toledo,OH,USA,41.58680556,-83.80783333
TOP,Philip Billard Municipal,Topeka,KS,USA,39.0686575,-95.62248361
TOR,Torrington Muni,Torrington,WY,USA,42.0645475,-104.1526986
TPA,Tampa International,Tampa,FL,USA,27.97547222,-82.53325
TPF,Peter O. Knight,Tampa,FL,USA,27.91557833,-82.44926083
TPH,Tonopah,Tonopah,NV,USA,38.06020222,-117.0871536
TPL,Draughon-Miller Central Texas Regional,Temple,TX,USA,31.1525,-97.40777778
TPO,Port Alsworth,Port Alsworth,AK,USA,60.20433333,-154.3188728
TQE,Municipal,Tekamah,NE,USA,41.76352778,-96.17794444
TQH,Tahlequah Municipal,Tahlequah,OK,USA,35.92891667,-95.00452778
TQK,Scott City Municipal,Scott City,KS,USA,38.47427778,-100.8849444
TRI,Tri-Cities Regional,Bristol,TN,USA,36.47521417,-82.40742056
TRK,Truckee-Tahoe,Truckee,CA,USA,39.32004222,-120.1395628
TRL,Terrell Municipal,Terrell,TX,USA,32.71004667,-96.26742306
TRM,Desert Resorts Regional,Palm Springs,CA,USA,33.62789944,-116.1601194
TRX,Trenton Municipal,Trenton,MO,USA,40.08351333,-93.59063472
TSO,Carroll County-Tolson,Carrollton,OH,USA,40.56186833,-81.07748611
TSP,Tehachapi Municipal,Tehachapi,CA,USA,35.13497222,-118.43925
TT01,Pagan Airstrip,Shomu-Shon,CQ,USA,18.12444444,-145.7686111
TTA,Sanford-Lee County Regional,Sanford,NC,USA,35.58247222,-79.10136111
TTD,Portland-Troutdale,Portland,OR,USA,45.54936889,-122.4012519
TTF,Monroe Custer,Monroe,MI,USA,41.93990639,-83.43468306
TTN,Trenton-Mercer County,Trenton,NJ,USA,40.27669111,-74.81346833
TUL,Tulsa International,Tulsa,OK,USA,36.19837222,-95.88824167
TUP,Tupelo Municipal,Tupelo,MS,USA,34.26810833,-88.769895
TUS,Tucson International,Tucson,AZ,USA,32.11608333,-110.9410278
TVB,Cabool Memorial,Cabool,MO,USA,37.13244083,-92.08396167
TVC,Cherry Capital,Traverse City,MI,USA,44.74144472,-85.582235
TVF,Thief River Falls Regional,Thief River Falls,MN,USA,48.06550028,-96.18336083
TVI,Thomasville Municipal,Thomasville,GA,USA,30.90155194,-83.88133556
TVK,Centerville Municipal,Centerville,IA,USA,40.68390306,-92.90103333
TVL,Lake Tahoe,South Lake Tahoe,CA,USA,38.89388167,-119.9953347
TVR,Vicksburg Tallulah Regional,Tallulah,LA,USA,32.35160639,-91.02768917
TVY,Tooele Valley,Tooele,UT,USA,40.6122725,-112.3507719
TWF,Joslin Field - Magic Valley,Twin Falls,ID,USA,42.48180389,-114.4877356
TWM,Richard B. Helgeson,Two Harbors,MN,USA,47.049225,-91.74514167
TXK,Texarkana Regional-Webb,Texarkana,AR,USA,33.45370806,-93.99102
TYL,Taylor,Taylor,AZ,USA,34.45283333,-110.1148056
TYQ,Indianapolis Terry,Indianapolis,IN,USA,40.03064972,-86.2514375
TYR,Tyler Pounds,Tyler,TX,USA,32.35413889,-95.40238611
TYS,McGhee-Tyson,Knoxville,TN,USA,35.81248722,-83.99285583
TZR,Bolton,Columbus,OH,USA,39.90081778,-83.13719361
TZT,Belle Plaine Municipal,Belle Plaine,IA,USA,41.87877778,-92.28456944
TZV,Tompkinsville-Monroe County,Tompkinsville,KY,USA,36.72978,-85.65191556
U02,McCarley,Blackfoot,ID,USA,43.20925,-112.3495861
U03,Buhl Municipal,Buhl,ID,USA,42.59157139,-114.7967178
U05,Riddick,Philipsburg,MT,USA,46.31936972,-113.3050642
U08,Perkins,Overton,NV,USA,36.56803,-114.4433133
U10,Preston,Preston,ID,USA,42.10690806,-111.9125389
U14,Nephi Municipal,Nephi,UT,USA,39.73884333,-111.8716011
U25,Dubois Municipal,Dubois,WY,USA,43.54834722,-109.6902611
U30,Temple Bar,Temple Bar,AZ,USA,36.02054056,-114.3352461
U34,Green River Muni,Green River,UT,USA,38.96136167,-110.2273619
U36,Aberdeen Municipal,Aberdeen,ID,USA,42.92102222,-112.8811053
U42,Salt Lake City Municipal 2,Salt Lake City,UT,USA,40.61954,-111.9928858
U43,Monticello,Monticello,UT,USA,37.937215,-109.3465053
U52,Beaver Municipal,Beaver,UT,USA,38.23071,-112.6753497
U55,Panguitch Municipal,Panguitch,UT,USA,37.84523333,-112.3918731
U59,Driggs-Reed Memorial,Driggs,ID,USA,43.74193056,-111.0978608
U68,North Big Horn County,Cowley/Lovell/Byron,WY,USA,44.91167028,-108.4455092
U69,Duchesne Municipal,Duchesne,UT,USA,40.19190167,-110.3809886
U70,Cascade,Cascade,ID,USA,44.4937825,-116.0162422
U76,Mountain Home Municipal,Mountain Home,ID,USA,43.13125278,-115.7295944
U77,Spanish Fork-Springville,Spanish Fork,UT,USA,40.14162139,-111.6613125
U82,Council Municipal,Council,ID,USA,44.7498875,-116.4468092
U96,Cal Black Memorial,Halls Crossing,UT,USA,37.44221444,-110.5695836
UAO,Aurora State,Aurora,OR,USA,45.24713889,-122.7700556
UBE,Cumberland Municipal,Cumberland,WI,USA,45.50597028,-91.98108694
UBS,Columbus-Lowndes County,Columbus,MS,USA,33.46539667,-88.38031639
UBX,Cuba Municipal,Cuba,MO,USA,38.06877667,-91.42885694
UCA,Oneida Cty,Utica,NY,USA,43.14511944,-75.38385889
UCP,New Castle Muni,New Castle,PA,USA,41.02533778,-80.41337194
UCY,Everett-Stewart,Union City,TN,USA,36.38025,-88.98547778
UDD,Bermuda Dunes,Palm Springs,CA,USA,33.7484375,-116.2748133
UDG,Darlington County,Darlington,SC,USA,34.44919444,-79.89036111
UES,Waukesha County,Waukesha,WI,USA,43.04102778,-88.23705556
UGN,Waukegan Regional,Chicago/Waukegan,IL,USA,42.42216,-87.86790694
UIL,Quillayute,Forks,WA,USA,47.93714444,-124.5612497
UIN,Quincy Municipal-Baldwin,Quincy,IL,USA,39.94262417,-91.19445611
UIZ,Berz-Macomb,Utica,MI,USA,42.66389361,-82.96542583
UKF,Wilkes County,North Wilkesboro,NC,USA,36.22284028,-81.0983375
UKI,Ukiah Municipal,Ukiah,CA,USA,39.12595722,-123.200855
UKL,Coffey County,Burlington,KS,USA,38.30248472,-95.7249575
UKT,Quakertown,Quakertown,PA,USA,40.43521194,-75.38192861
ULM,New Ulm Municipal,New Ulm,MN,USA,44.31957306,-94.50230778
ULS,Ulysses,Ulysses,KS,USA,37.60375278,-101.3733889
UMP,Indianapolis Metropolitan,Indianapolis,IN,USA,39.9352025,-86.04495333
UNI,Ohio University,Athens/Albany,OH,USA,39.21096222,-82.23142583
UNK,Unalakleet,Unalakleet,AK,USA,63.88835917,-160.7989517
UNO,West Plains Municipal,West Plains,MO,USA,36.87813889,-91.90269444
UNU,Dodge County,Juneau,WI,USA,43.42658333,-88.70322222
UNV,University Park,State College,PA,USA,40.84927778,-77.84869444
UOS,Franklin County,Sewanee,TN,USA,35.20397028,-85.89858889
UOX,University-Oxford,Oxford,MS,USA,34.38431528,-89.53530972
UPP,Upolu,Hawi,HI,USA,20.26525583,-155.8599875
USE,Fulton County,Wauseon,OH,USA,41.61033333,-84.12552778
UTS,Huntsville Municipal,Huntsville,TX,USA,30.74688667,-95.58716667
UUO,Willow,Willow,AK,USA,61.75441667,-150.0516639
UUU,Newport State,Newport,RI,USA,41.53243972,-71.28154389
UUV,Sullivan Regional,Sullivan,MO,USA,38.23343056,-91.16433333
UVA,Garner,Uvalde,TX,USA,29.21135028,-99.74358306
UWL,New Castle-Henry Co,New Castle,IN,USA,39.87585167,-85.32646806
UYF,Madison County,London,OH,USA,39.93272694,-83.46200361
UZA,Rock Hill Municipal/Bryant,Rock Hill,SC,USA,34.98783333,-81.05716667
VAK,Chevak,Chevak,AK,USA,61.53363583,-165.5837322
VAY,South Jersey Reg,Mount Holly,NJ,USA,39.94289056,-74.84571944
VBT,Bentonville Municipal,Bentonville,AR,USA,36.34571528,-94.219345
VCB,Nut Tree,Vacaville,CA,USA,38.37675167,-121.962455
VCT,Victoria Regional,Victoria,TX,USA,28.85255556,-96.91848722
VCV,Southern California Logistic,Victorville,CA,USA,34.593225,-117.3794667
VDI,Vidalia Municipal,Vidalia,GA,USA,32.19255556,-82.37194444
VDZ,Valdez,Valdez,AK,USA,61.13395028,-146.24836
VEE,Venetie,Venetie,AK,USA,67.02269444,-146.4137753
VEL,Vernal,Vernal,UT,USA,40.44090167,-109.5099203
VER,Jesse Viertel Memorial,Boonville,MO,USA,38.94577556,-92.68277139
VES,Darke County,Versailles,OH,USA,40.20441667,-84.53191667
VGT,North Las Vegas,Las Vegas,NV,USA,36.21166667,-115.19575
VHN,Culberson County,Van Horn,TX,USA,31.05784417,-104.7838056
VIH,Rolla National,Rolla/Vichy,MO,USA,38.12743222,-91.7695225
VIQ,Neillsville Municipal,Neillsville,WI,USA,44.55812861,-90.51224694
VIS,Visalia Municipal,Visalia,CA,USA,36.31866667,-119.3928889
VJI,Virginia Highlands,Abingdon,VA,USA,36.68711028,-82.03333583
VLA,Vandalia Municipal,Vandalia,IL,USA,38.99130556,-89.16622222
VLD,Valdosta Regional,Valdosta,GA,USA,30.7825,-83.27672222
VMR,Harold Davidson,Vermillion,SD,USA,42.76528917,-96.93425472
VNC,Venice Municipal,Venice,FL,USA,27.07161111,-82.44033333
VNW,Van Wert County,Van Wert,OH,USA,40.86472222,-84.60944444
VNY,Van Nuys,Van Nuys,CA,USA,34.20980972,-118.4899733
VPC,Cartersville,Cartersville,GA,USA,34.12313889,-84.84869444
VPS,Eglin Air Force Base,Valparaiso,FL,USA,30.48325,-86.5254
VPZ,Porter County Municipal,Valparaiso,IN,USA,41.45396667,-87.00707139
VQQ,Cecil,Jacksonville,FL,USA,30.21867306,-81.87666444
VQS,Antonio Rivera Rodriguez,Isla De Vieques,PR,USA,18.13551806,-65.49182583
VRB,Vero Beach Municipal,Vero Beach,FL,USA,27.65555556,-80.41794444
VSF,Springfield State/Hartness,Springfield,VT,USA,43.34362889,-72.5173125
VTA,Newark-Heath,Newark,OH,USA,40.024675,-82.46182194
VTI,Vinton Veterans Memorial Airpark,Vinton,IA,USA,42.21862611,-92.02592806
VTN,Miller,Valentine,NE,USA,42.85767194,-100.547355
VUJ,Stanly County,Albemarle,NC,USA,35.41669472,-80.15079556
VUO,Pearson Airpark,Vancouver,WA,USA,45.6204525,-122.6564883
VVV,Ortonville Municipal,Ortonville,MN,USA,45.30566472,-96.42442278
VYS,Illinois Valley Regional,Peru/Lasalle,IL,USA,41.35186806,-89.15308417
W04,Ocean Shores Municipal,Ocean Shores,WA,USA,47.00369806,-124.143785
W05,Gettysburg  & Travel Center,Gettysburg,PA,USA,39.84092833,-77.27415139
W11,Menomonie Municipal - Score,Menomonie,WI,USA,44.89234639,-91.86777944
W22,Upshur County Regional,Buckhannon,WV,USA,39.00035833,-80.27392778
W29,Bay Bridge Industrial,Stevensville,MD,USA,38.97638889,-76.32963889
W31,Lunenburg County,Kenbridge,VA,USA,36.96015,-78.18499861
W33,Friday Harbor,Friday Harbor,WA,USA,48.53732194,-123.0096236
W40,Mt Olive Municipal,Mt Olive,NC,USA,35.22224722,-78.03779444
W41,Crisfield Municipal,Crisfield,MD,USA,38.01679028,-75.82882056
W44,Asheboro Municipal,Asheboro,NC,USA,35.6538825,-79.8950425
W45,Luray Caverns,Luray,VA,USA,38.66705556,-78.50058333
W66,Warrenton-Fauquier,Warrenton,VA,USA,38.58704667,-77.71138389
W78,William M Tuck,South Boston,VA,USA,36.710045,-78.84802028
W95,Ocracoke Island,Ocracoke,NC,USA,35.10117083,-75.96595278
W96,New Kent County,Quinton,VA,USA,37.50320139,-77.12552694
W97,Middle Peninsula Regional,West Point,VA,USA,37.52122778,-76.7646825
W99,Grant County,Petersburg,WV,USA,38.99419444,-79.14438889
WA10,Grove,Camas/Washougal,WA,USA,45.62777778,-122.4041667
WA21,Grand Coulee Dam,Electric City,WA,USA,47.92348361,-119.0805789
WA31,Whidbey Air Park,Langley,WA,USA,48.01814917,-122.4384789
WA43,Odessa Municipal,Odessa,WA,USA,47.3582025,-118.6733264
WAY,Greene Cty,Waynesburg,PA,USA,39.900075,-80.13311667
WBB,Stebbins,Stebbins,AK,USA,63.51591972,-162.2827394
WBQ,Beaver,Beaver,AK,USA,66.36155056,-147.4012186
WBW,Wilkes-Barre Wyoming Valley,Wilkes-Barre,PA,USA,41.29717222,-75.85120556
WCR,Chandalar Lake,Chandalar Lake,AK,USA,67.50451667,-148.4832222
WDG,Enid Woodring Municipal,Enid,OK,USA,36.37920333,-97.79111222
WDR,Winder,Winder,GA,USA,33.98227778,-83.66808333
WHP,Whiteman,Los Angeles,CA,USA,34.25932528,-118.4134331
WJF,General Wm. J. Fox Airfield,Lancaster,CA,USA,34.74095944,-118.2189489
WLD,Strother,Winfield/Arkansas City,KS,USA,37.16861556,-97.03752194
WLK,Selawik,Selawik,AK,USA,66.60002778,-159.9861944
WLW,Willows-Glenn County,Willows,CA,USA,39.51635389,-122.2175106
WMC,Winnemucca Municipal,Winnemucca,NV,USA,40.89661111,-117.8058889
WMO,White Mountain,White Mountain,AK,USA,64.68919444,-163.4125556
WNA,Napakiak,Napakiak,AK,USA,60.69118917,-161.9695161
WRG,Wrangell,Wrangell,AK,USA,56.48432583,-132.3698242
WRL,Worland Muni,Worland,WY,USA,43.96571306,-107.9508308
WSM,Wiseman,Wiseman,AK,USA,67.40457333,-150.1227417
WSN,South Naknek 2,South Naknek,AK,USA,58.70343611,-157.0082511
WST,Westerly State,Westerly,RI,USA,41.34961694,-71.80337778
WTK,Noatak,Noatak,AK,USA,67.56208333,-162.9752778
WVI,Watsonville Municipal,Watsonville,CA,USA,36.93573,-121.7896178
WVL,Waterville-Robert Lafleur,Waterville,ME,USA,44.53325,-69.67552778
WWD,Cape May Cty,Wildwood,NJ,USA,39.00850694,-74.90827389
WWR,West Woodward,Woodward,OK,USA,36.4367025,-99.5209975
WYS,Yellowstone,West Yellowstone,MT,USA,44.68839917,-111.1176375
X01,Everglades,Everglades,FL,USA,25.84871167,-81.39007944
X06,Arcadia Municipal,Arcadia,FL,USA,27.19199444,-81.83730472
X07,Lake Wales Municipal,Lake Wales,FL,USA,27.89380556,-81.62038889
X10,Belle Glade Municipal,Belle Glade,FL,USA,26.70089833,-80.66227972
X14,Labelle Municipal,Labelle,FL,USA,26.74423278,-81.43257556
X16,Vandenberg,Tampa,FL,USA,28.01398389,-82.34527917
X21,Arthur Dunn Airpark,Titusville,FL,USA,28.62234556,-80.835695
X23,Umatilla Municipal,Umatilla,FL,USA,28.922765,-81.65174111
X26,Sebastian Municipal,Sebastian,FL,USA,27.81280389,-80.49560833
X35,Dunnellon/Marion Co.,Dunellon,FL,USA,29.06177778,-82.37658333
X40,Inverness,Inverness,FL,USA,28.80859639,-82.31648167
X44,Watson Island Base,Miami,FL,USA,25.77833333,-80.17027778
X46,Opa-Locka West,Miami,FL,USA,25.94898194,-80.42338694
X47,Flagler County,Bunnell,FL,USA,29.46738889,-81.20633333
X51,Homestead General Aviation,Homestead,FL,USA,25.49872139,-80.55422528
X59,Valkaria,Valkaria,FL,USA,27.96196472,-80.55977556
X60,Williston Municipal,Williston,FL,USA,29.35422,-82.47288194
X63,Humacao,Humacao,PR,USA,18.13801667,-65.8007175
X66,Charlotte Amalie Harbor Seaplane Base,Charlotte Amalie,VI,USA,18.33856722,-64.94070111
X67,Christiansted Harbor Seaplane Base,Christiansted,VI,USA,17.74719528,-64.70486444
X95,Diego Jimenez Torres,Fajardo,PR,USA,18.30800972,-65.66182806
X96,Cruz Bay Harbor Seaplane Base,Cruz Bay,VI,USA,18.33689833,-64.79958306
XNA,Northwest Arkansas Regional,Fayetteville/Springdale/Rogers,AR,USA,36.28186944,-94.30681111
XVG,Longville Municipal,Longville,MN,USA,46.99016361,-94.20400222
Y03,Springfield Municipal,Springfield,SD,USA,42.87999833,-97.90117972
Y14,Marv Skie-Lincoln County,Tea,SD,USA,43.45747694,-96.80199528
Y15,Cheboygan City-County,Cheboygan,MI,USA,45.65371028,-84.51927306
Y19,Mandan Municipal,Mandan,ND,USA,46.76823667,-100.8943433
Y27,Standing Rock,Fort Yates,ND,USA,46.06638556,-100.6348492
Y31,West Branch Community,West Branch,MI,USA,44.244825,-84.17980472
Y37,Park River Municipal,Park River,ND,USA,48.39443778,-97.78147889
Y47,New Hudson,New Hudson,MI,USA,42.50311694,-83.62371667
Y50,Wautoma Municipal,Wautoma,WI,USA,44.04162556,-89.30448694
Y51,Viroqua Municipal,Viroqua,WI,USA,43.57913917,-90.90096333
Y55,Crandon Municipal,Crandon,WI,USA,45.51662972,-88.93344694
Y63,Elbow Lake Municipal,Elbow Lake,MN,USA,45.98607111,-95.99199861
Y66,Drummond Island,Drummond Island,MI,USA,46.00931139,-83.74393417
Y68,Tracy Municipal,Tracy,MN,USA,44.24995694,-95.60445389
Y70,Ionia County,Ionia,MI,USA,42.93769972,-85.06066722
Y74,Hankins,Parshall,ND,USA,47.93640083,-102.1421142
Y83,Sandusky City,Sandusky,MI,USA,43.45418694,-82.84938028
Y93,Atlanta Municipal,Atlanta,MI,USA,45.00000833,-84.13333667
YAK,Yakutat,Yakutat,AK,USA,59.50336056,-139.6602261
YAP,Yap International,NA,NA,Federated States of Micronesia,9.5167,138.1
YIP,Willow Run,Detroit,MI,USA,42.2379275,-83.53040889
YKM,Yakima Air Terminal,Yakima,WA,USA,46.56816972,-120.5440594
YKN,Chan Gurney Municipal,Yankton,SD,USA,42.91669444,-97.38594444
YNG,Youngstown-Warren Regional,Youngstown,OH,USA,41.26073556,-80.67909667
YUM,Yuma MCAS-Yuma International,Yuma,AZ,USA,32.65658333,-114.6059722
Z08,Ofu,Ofu Village,AS,USA,14.18435056,-169.6700236
Z09,Kasigluk,Kasigluk,AK,USA,60.87202194,-162.5248094
Z13,Akiachak,Akiachak,AK,USA,60.90453167,-161.42091
Z17,Ophir,Ophir,AK,USA,63.1460375,-156.529865
Z40,Goose Bay,Goose Bay,AK,USA,61.39445139,-149.8455556
Z55,Lake Louise,Lake Louise,AK,USA,62.29368944,-146.5794219
Z73,Nelson Lagoon,Nelson Lagoon,AK,USA,56.00753611,-161.1603672
Z84,Clear,Clear A.F.B.,AK,USA,64.30120361,-149.1201436
Z91,Birch Creek,Birch Creek,AK,USA,66.27399583,-145.8240381
Z95,Cibecue,Cibecue,AZ,USA,34.00333333,-110.4441667
ZEF,Elkin Municipal,Elkin,NC,USA,36.28002361,-80.78606861
ZER,Schuylkill Cty/Joe Zerbey,Pottsville,PA,USA,40.70644889,-76.37314667
ZPH,Zephyrhills Municipal,Zephyrhills,FL,USA,28.22806472,-82.15591639
ZUN,Black Rock,Zuni,NM,USA,35.08322694,-108.7917769
ZZV,Zanesville Municipal,Zanesville,OH,USA,39.94445833,-81.89210528
`;
const flightsString = "origin,destination,count\nABE,ATL,853\nABE,BHM,1\nABE,CLE,805\nABE,CLT,465\nABE,CVG,247\nABE,DTW,997\nABE,JFK,3\nABE,LGA,9\nABE,ORD,1425\nABE,PHL,2\nABI,DFW,2660\nABQ,AMA,368\nABQ,ATL,1067\nABQ,AUS,433\nABQ,BWI,546\nABQ,CLE,12\nABQ,CVG,260\nABQ,DAL,3078\nABQ,DEN,4318\nABQ,DFW,2888\nABQ,ELP,799\nABQ,EWR,167\nABQ,HOU,1011\nABQ,IAD,365\nABQ,IAH,2261\nABQ,LAS,2402\nABQ,LAX,2395\nABQ,LBB,366\nABQ,MAF,367\nABQ,MCI,670\nABQ,MCO,730\nABQ,MDW,730\nABQ,MSP,677\nABQ,OAK,1016\nABQ,OKC,229\nABQ,ONT,446\nABQ,ORD,751\nABQ,PDX,366\nABQ,PHX,5265\nABQ,SAN,1034\nABQ,SAT,424\nABQ,SEA,721\nABQ,SFO,530\nABQ,SLC,2307\nABQ,SMF,466\nABQ,STL,366\nABQ,TPA,366\nABQ,TUL,230\nABQ,TUS,719\nABY,ATL,1095\nACK,EWR,234\nACK,JFK,223\nACT,DFW,1993\nACV,CEC,362\nACV,MRY,2\nACV,SFO,2343\nACV,SJC,1\nACV,SLC,388\nACV,SMF,618\nACY,ATL,113\nACY,JFK,1\nACY,LGA,2\nADK,ANC,102\nADQ,ANC,706\nAEX,ATL,983\nAEX,DFW,1005\nAEX,IAH,342\nAGS,ATL,2380\nAGS,CLT,16\nAGS,LGA,7\nAKN,ANC,78\nAKN,DLG,38\nALB,ATL,1154\nALB,BOS,1\nALB,BWI,2297\nALB,CLE,1113\nALB,CLT,956\nALB,CVG,914\nALB,DCA,327\nALB,DTW,1013\nALB,EWR,611\nALB,FLL,60\nALB,JFK,367\nALB,LAS,366\nALB,MCO,1037\nALB,MDW,730\nALB,MSP,57\nALB,ORD,1630\nALB,PHL,449\nALB,SBN,1\nALB,TPA,391\nALO,MSP,323\nAMA,ABQ,366\nAMA,DAL,2669\nAMA,DEN,729\nAMA,DFW,2556\nAMA,IAH,809\nAMA,LAS,366\nAMA,TUL,1\nANC,ADK,102\nANC,ADQ,706\nANC,AKN,116\nANC,ATL,115\nANC,BET,1035\nANC,CDV,362\nANC,CVG,90\nANC,DEN,451\nANC,DFW,153\nANC,DLG,78\nANC,DTW,96\nANC,FAI,3217\nANC,HNL,236\nANC,IAH,207\nANC,JNU,1163\nANC,LAS,237\nANC,LAX,238\nANC,MSP,826\nANC,OGG,27\nANC,OME,365\nANC,ORD,561\nANC,OTZ,725\nANC,PDX,576\nANC,PHX,366\nANC,SCC,363\nANC,SEA,6257\nANC,SFO,181\nANC,SLC,478\nASE,ATL,16\nASE,DEN,3992\nASE,GJT,1\nASE,LAX,334\nASE,MSN,1\nASE,ORD,332\nASE,PHX,109\nASE,RFD,1\nASE,SFO,62\nASE,SLC,459\nATL,ABE,852\nATL,ABQ,1064\nATL,ABY,1095\nATL,ACY,113\nATL,AEX,982\nATL,AGS,2381\nATL,ALB,1153\nATL,ANC,115\nATL,ASE,16\nATL,ATW,742\nATL,AUS,2255\nATL,AVL,1936\nATL,AVP,584\nATL,BDL,2140\nATL,BGR,270\nATL,BHM,2871\nATL,BMI,2509\nATL,BNA,3096\nATL,BOI,41\nATL,BOS,5990\nATL,BQK,924\nATL,BTR,2665\nATL,BTV,500\nATL,BUF,3578\nATL,BWI,5978\nATL,BZN,60\nATL,CAE,2494\nATL,CAK,3902\nATL,CHA,2082\nATL,CHO,786\nATL,CHS,4492\nATL,CID,357\nATL,CLE,2865\nATL,CLT,6720\nATL,CMH,1796\nATL,COS,589\nATL,CRP,5\nATL,CRW,1430\nATL,CSG,1481\nATL,CVG,2810\nATL,DAB,2413\nATL,DAY,4372\nATL,DCA,7289\nATL,DEN,5726\nATL,DFW,9847\nATL,DHN,1397\nATL,DSM,1114\nATL,DTW,5612\nATL,EGE,110\nATL,ELP,575\nATL,EVV,1150\nATL,EWN,791\nATL,EWR,8028\nATL,EYW,974\nATL,FAY,2173\nATL,FCA,25\nATL,FLL,7665\nATL,FLO,614\nATL,FNT,3132\nATL,FSD,135\nATL,FSM,632\nATL,FWA,1028\nATL,GNV,2064\nATL,GPT,3441\nATL,GRB,93\nATL,GRK,642\nATL,GRR,1352\nATL,GSO,2866\nATL,GSP,2450\nATL,GTR,964\nATL,GUC,2\nATL,HDN,107\nATL,HHH,836\nATL,HNL,637\nATL,HOU,3593\nATL,HPN,2155\nATL,HSV,2627\nATL,IAD,5309\nATL,IAH,5268\nATL,ICT,3146\nATL,ILM,1996\nATL,IND,3517\nATL,ISP,214\nATL,JAC,118\nATL,JAN,2694\nATL,JAX,5656\nATL,JFK,1915\nATL,LAS,4766\nATL,LAW,544\nATL,LAX,5406\nATL,LEX,2213\nATL,LFT,995\nATL,LGA,10506\nATL,LIT,2527\nATL,LWB,185\nATL,LYH,625\nATL,MCI,4140\nATL,MCN,652\nATL,MCO,9613\nATL,MDT,1789\nATL,MDW,3256\nATL,MEI,674\nATL,MEM,4866\nATL,MFE,9\nATL,MGM,2513\nATL,MHT,695\nATL,MIA,6628\nATL,MKE,3610\nATL,MLB,2000\nATL,MLI,2590\nATL,MLU,983\nATL,MOB,2224\nATL,MSN,384\nATL,MSP,5368\nATL,MSY,4695\nATL,MTJ,37\nATL,MYR,1853\nATL,OAJ,1178\nATL,OAK,90\nATL,OKC,1883\nATL,OMA,1730\nATL,ONT,796\nATL,ORD,7677\nATL,ORF,2784\nATL,PBI,4263\nATL,PDX,1095\nATL,PFN,2548\nATL,PHF,4158\nATL,PHL,6915\nATL,PHX,4603\nATL,PIA,622\nATL,PIT,4555\nATL,PNS,4429\nATL,PVD,1389\nATL,PWM,904\nATL,RDU,5411\nATL,RIC,4532\nATL,RNO,167\nATL,ROA,1732\nATL,ROC,2489\nATL,RSW,4193\nATL,SAN,2857\nATL,SAT,3239\nATL,SAV,3892\nATL,SBN,1038\nATL,SCE,121\nATL,SDF,2754\nATL,SEA,2574\nATL,SFO,3462\nATL,SGF,1171\nATL,SHV,1816\nATL,SJC,640\nATL,SJU,1874\nATL,SLC,2860\nATL,SMF,682\nATL,SNA,1461\nATL,SRQ,3326\nATL,STL,3958\nATL,STT,451\nATL,STX,67\nATL,SWF,1617\nATL,SYR,1419\nATL,TLH,2484\nATL,TOL,119\nATL,TPA,7311\nATL,TRI,1809\nATL,TUL,1981\nATL,TUP,9\nATL,TUS,668\nATL,TYS,2428\nATL,VLD,938\nATL,VPS,3046\nATL,XNA,1769\nATW,ATL,743\nATW,CHS,1\nATW,CVG,697\nATW,DSM,1\nATW,DTW,1020\nATW,MKE,1032\nATW,MSP,90\nATW,ORD,2288\nATW,XNA,1\nAUS,ABQ,435\nAUS,ATL,2252\nAUS,BNA,792\nAUS,BOS,368\nAUS,BWI,730\nAUS,CLE,380\nAUS,CLT,659\nAUS,CVG,653\nAUS,DAL,5573\nAUS,DEN,2673\nAUS,DFW,5506\nAUS,DSM,1\nAUS,DTW,1\nAUS,ELP,1349\nAUS,EWR,949\nAUS,FLL,481\nAUS,HOU,2319\nAUS,HRL,367\nAUS,IAD,670\nAUS,IAH,3691\nAUS,IND,218\nAUS,JAX,226\nAUS,JFK,1358\nAUS,LAS,1231\nAUS,LAX,1733\nAUS,LBB,692\nAUS,LGB,245\nAUS,MAF,470\nAUS,MCI,459\nAUS,MCO,632\nAUS,MDW,712\nAUS,MEM,834\nAUS,MSP,55\nAUS,MSY,444\nAUS,OAK,236\nAUS,OKC,88\nAUS,ONT,305\nAUS,ORD,2514\nAUS,ORF,1\nAUS,PHL,290\nAUS,PHX,2783\nAUS,RDU,231\nAUS,SAN,719\nAUS,SEA,149\nAUS,SFO,610\nAUS,SJC,968\nAUS,SLC,548\nAUS,SNA,245\nAUS,STL,95\nAUS,TPA,367\nAUS,TUL,88\nAUS,TUS,228\nAVL,ATL,1936\nAVL,CVG,167\nAVL,DTW,768\nAVL,EWR,658\nAVL,IAH,459\nAVL,MCO,47\nAVL,MSP,364\nAVP,ATL,586\nAVP,CVG,356\nAVP,DTW,722\nAVP,HPN,1\nAVP,JFK,2\nAVP,LGA,3\nAVP,ORD,716\nAZO,CVG,148\nAZO,DTW,1177\nAZO,FAR,1\nAZO,MSP,245\nAZO,ORD,2352\nAZO,XNA,1\nBDL,ATL,2141\nBDL,BNA,366\nBDL,BWI,2880\nBDL,CLE,544\nBDL,CLT,1834\nBDL,CVG,1187\nBDL,DCA,1182\nBDL,DEN,214\nBDL,DFW,1065\nBDL,DTW,1516\nBDL,EWR,766\nBDL,FLL,546\nBDL,GRB,1\nBDL,IAD,1397\nBDL,IAH,120\nBDL,IND,585\nBDL,JFK,602\nBDL,LAS,366\nBDL,LAX,132\nBDL,MCO,1755\nBDL,MDW,1028\nBDL,MEM,48\nBDL,MIA,366\nBDL,MKE,536\nBDL,MSP,986\nBDL,ORD,3131\nBDL,PBI,373\nBDL,PHL,521\nBDL,PHX,335\nBDL,RDU,1150\nBDL,RSW,134\nBDL,SJU,366\nBDL,TPA,1276\nBET,ANC,1035\nBFL,DEN,533\nBFL,FAT,1\nBFL,LAS,102\nBFL,LAX,906\nBFL,PHX,1194\nBFL,SAN,225\nBFL,SFO,943\nBFL,SLC,371\nBFL,SMF,227\nBGM,DTW,728\nBGR,ATL,270\nBGR,BOS,793\nBGR,BTV,1\nBGR,CVG,129\nBGR,DTW,801\nBGR,EWR,536\nBGR,JFK,338\nBGR,MSP,11\nBHM,ATL,2876\nBHM,AUS,1\nBHM,BNA,696\nBHM,BWI,1038\nBHM,CLE,264\nBHM,CLT,786\nBHM,CVG,598\nBHM,DAL,1074\nBHM,DEN,666\nBHM,DFW,1287\nBHM,DTW,892\nBHM,EWR,668\nBHM,HOU,723\nBHM,HSV,1\nBHM,IAD,245\nBHM,IAH,2345\nBHM,JAX,366\nBHM,JFK,1\nBHM,LAS,366\nBHM,LGA,840\nBHM,MCO,1196\nBHM,MDW,709\nBHM,MEM,886\nBHM,MKE,1\nBHM,MSY,1008\nBHM,ORD,1497\nBHM,PHX,366\nBHM,RDU,159\nBHM,SDF,679\nBHM,SLC,8\nBHM,STL,366\nBHM,TPA,1071\nBIL,DEN,1628\nBIL,GTF,1\nBIL,MSP,820\nBIL,ORD,103\nBIL,PIH,3\nBIL,SLC,1950\nBIS,DEN,1239\nBIS,MSP,1052\nBIS,RAP,2\nBJI,MSP,74\nBLI,SLC,120\nBMI,ATL,2511\nBMI,DFW,60\nBMI,LAS,50\nBMI,MCO,173\nBMI,ORD,2007\nBNA,ATL,3097\nBNA,AUS,795\nBNA,BDL,365\nBNA,BHM,688\nBNA,BOS,78\nBNA,BWI,2502\nBNA,CID,1\nBNA,CLE,1147\nBNA,CLT,2127\nBNA,CMH,677\nBNA,COS,1\nBNA,CVG,769\nBNA,DCA,1403\nBNA,DEN,2529\nBNA,DFW,2859\nBNA,DTW,2708\nBNA,EWR,1836\nBNA,FLL,738\nBNA,FSD,2\nBNA,HOU,1504\nBNA,IAD,418\nBNA,IAH,2522\nBNA,JAX,1382\nBNA,JFK,523\nBNA,LAS,1202\nBNA,LAX,1400\nBNA,LGA,1216\nBNA,MCI,1302\nBNA,MCO,1798\nBNA,MDW,2993\nBNA,MEM,1020\nBNA,MIA,731\nBNA,MKE,772\nBNA,MSP,785\nBNA,MSY,1012\nBNA,OAK,363\nBNA,ONT,365\nBNA,ORD,3725\nBNA,ORF,236\nBNA,PHL,980\nBNA,PHX,1124\nBNA,PVD,366\nBNA,RDU,1623\nBNA,SAN,721\nBNA,SAT,677\nBNA,SEA,364\nBNA,SLC,115\nBNA,STL,258\nBNA,TPA,1720\nBOI,ATL,41\nBOI,ATW,1\nBOI,DEN,2064\nBOI,GEG,1042\nBOI,GJT,1\nBOI,LAS,756\nBOI,LAX,1001\nBOI,MSP,807\nBOI,OAK,666\nBOI,ONT,471\nBOI,ORD,787\nBOI,PDX,1027\nBOI,PHX,679\nBOI,PIT,1\nBOI,RNO,1029\nBOI,SAN,475\nBOI,SEA,1080\nBOI,SFO,1754\nBOI,SLC,3342\nBOS,ACK,1\nBOS,ATL,5982\nBOS,AUS,368\nBOS,BGR,794\nBOS,BNA,2\nBOS,BTV,1\nBOS,BUF,729\nBOS,BWI,4797\nBOS,CAK,467\nBOS,CHS,156\nBOS,CLE,1362\nBOS,CLT,3533\nBOS,CMH,916\nBOS,CVG,1937\nBOS,DCA,8899\nBOS,DEN,2077\nBOS,DFW,3036\nBOS,DTW,2306\nBOS,EWR,3883\nBOS,FLL,2476\nBOS,GGG,1\nBOS,GSO,141\nBOS,IAD,4184\nBOS,IAH,1800\nBOS,IND,950\nBOS,JAX,647\nBOS,JFK,7372\nBOS,LAS,1383\nBOS,LAX,2234\nBOS,LGA,12029\nBOS,LGB,788\nBOS,MCO,3474\nBOS,MDW,344\nBOS,MEM,200\nBOS,MIA,2196\nBOS,MKE,209\nBOS,MSP,1635\nBOS,MSY,254\nBOS,MYR,45\nBOS,OAK,516\nBOS,ORD,7085\nBOS,ORF,243\nBOS,PBI,1743\nBOS,PDX,366\nBOS,PHF,715\nBOS,PHL,6375\nBOS,PHX,1069\nBOS,PIT,591\nBOS,RDU,3777\nBOS,RIC,689\nBOS,RSW,1716\nBOS,SAN,608\nBOS,SAV,89\nBOS,SDF,80\nBOS,SEA,979\nBOS,SFO,2668\nBOS,SJC,256\nBOS,SJU,1274\nBOS,SLC,707\nBOS,SRQ,23\nBOS,STL,865\nBOS,STT,88\nBOS,TPA,1785\nBPT,IAH,276\nBQK,ATL,925\nBQN,EWR,366\nBQN,JFK,661\nBQN,MCO,492\nBRO,IAH,1464\nBRW,ANC,364\nBRW,FAI,364\nBTM,SLC,708\nBTR,ATL,2663\nBTR,CVG,2\nBTR,DCA,129\nBTR,DEN,1\nBTR,DFW,2922\nBTR,IAH,2009\nBTR,MEM,999\nBTR,MSY,1\nBTR,ORD,215\nBTV,ATL,500\nBTV,BWI,538\nBTV,CLE,614\nBTV,CVG,153\nBTV,DTW,826\nBTV,EWR,879\nBTV,IAD,129\nBTV,IND,1\nBTV,JFK,2207\nBTV,MCO,346\nBTV,MSP,75\nBTV,ORD,737\nBUF,ATL,3575\nBUF,BOS,728\nBUF,BWI,2439\nBUF,CLE,633\nBUF,CLT,1435\nBUF,CVG,160\nBUF,DCA,312\nBUF,DFW,93\nBUF,DTW,1510\nBUF,EWR,1469\nBUF,FLL,672\nBUF,IAD,16\nBUF,JFK,3679\nBUF,LAS,589\nBUF,MCO,1876\nBUF,MDW,1276\nBUF,MSP,227\nBUF,ORD,3437\nBUF,PHL,685\nBUF,PHX,365\nBUF,RSW,376\nBUF,TPA,729\nBUR,DEN,944\nBUR,DFW,1376\nBUR,IAD,163\nBUR,JFK,1366\nBUR,LAS,5162\nBUR,OAK,5423\nBUR,PDX,60\nBUR,PHX,4751\nBUR,PMD,1\nBUR,PSP,1\nBUR,RNO,1\nBUR,SEA,1390\nBUR,SFO,2258\nBUR,SJC,3377\nBUR,SLC,1673\nBUR,SMF,3458\nBUR,TUS,1\nBWI,ABQ,549\nBWI,ALB,2296\nBWI,ATL,5972\nBWI,AUS,728\nBWI,BDL,2863\nBWI,BHM,1037\nBWI,BNA,2492\nBWI,BOS,4795\nBWI,BTV,539\nBWI,BUF,2437\nBWI,CLE,2543\nBWI,CLT,3652\nBWI,CMH,1683\nBWI,CVG,1228\nBWI,DAB,32\nBWI,DAY,982\nBWI,DEN,2664\nBWI,DFW,2311\nBWI,DTW,3105\nBWI,EWR,507\nBWI,FLL,2710\nBWI,GRR,1\nBWI,HOU,1262\nBWI,IAH,1728\nBWI,IND,1016\nBWI,ISP,2427\nBWI,JAN,664\nBWI,JAX,1058\nBWI,JFK,1134\nBWI,LAS,1626\nBWI,LAX,898\nBWI,LGA,7\nBWI,LIT,366\nBWI,MCI,1025\nBWI,MCO,4926\nBWI,MDW,2809\nBWI,MEM,827\nBWI,MHT,3633\nBWI,MIA,929\nBWI,MKE,1290\nBWI,MSP,974\nBWI,MSY,392\nBWI,OKC,366\nBWI,ORD,3545\nBWI,ORF,1683\nBWI,PBI,1351\nBWI,PHL,692\nBWI,PHX,2098\nBWI,PIT,1064\nBWI,PVD,3988\nBWI,PWM,995\nBWI,RDU,2082\nBWI,ROC,863\nBWI,RSW,1336\nBWI,SAN,721\nBWI,SAT,729\nBWI,SAV,1\nBWI,SDF,1474\nBWI,SEA,242\nBWI,SFO,366\nBWI,SJU,319\nBWI,SLC,727\nBWI,SRQ,245\nBWI,STL,1682\nBWI,TPA,3388\nBZN,ATL,60\nBZN,BTM,1\nBZN,DEN,1293\nBZN,DTW,19\nBZN,IDA,1\nBZN,LAX,13\nBZN,MSP,878\nBZN,ORD,337\nBZN,SFO,28\nBZN,SLC,2029\nCAE,ATL,2508\nCAE,CVG,927\nCAE,DFW,1157\nCAE,DTW,713\nCAE,EWR,684\nCAE,IAD,1386\nCAE,IAH,164\nCAE,LGA,609\nCAE,MEM,706\nCAE,ORD,1696\nCAK,ATL,3905\nCAK,BOS,467\nCAK,CVG,40\nCAK,DEN,779\nCAK,DTW,1044\nCAK,FLL,8\nCAK,LAS,42\nCAK,LGA,793\nCAK,MCO,371\nCAK,ORD,1049\nCAK,RSW,137\nCAK,TPA,359\nCDC,LAX,1\nCDC,SGU,1\nCDC,SLC,666\nCDV,ANC,363\nCDV,YAK,362\nCEC,ACV,360\nCEC,SFO,703\nCHA,ATL,2086\nCHA,CVG,132\nCHA,DFW,426\nCHA,DTW,72\nCHA,IAH,459\nCHA,MEM,630\nCHA,ORD,766\nCHO,ATL,786\nCHO,CVG,36\nCHO,DCA,1\nCHS,ATL,4494\nCHS,BOS,156\nCHS,CLE,150\nCHS,CLT,1121\nCHS,CVG,786\nCHS,DFW,1155\nCHS,DTW,756\nCHS,EWR,1284\nCHS,IAD,712\nCHS,IAH,73\nCHS,JAX,2\nCHS,LGA,1413\nCHS,MEM,714\nCHS,MSP,27\nCHS,ORD,1337\nCHS,SAV,1\nCIC,FAT,1\nCIC,MRY,1\nCIC,SFO,1390\nCID,ATL,357\nCID,CVG,874\nCID,DEN,798\nCID,DFW,1897\nCID,DSM,1\nCID,DTW,946\nCID,LGA,156\nCID,MKE,1\nCID,MSP,416\nCID,ORD,3931\nCLD,LAX,2259\nCLD,PHX,44\nCLE,ABE,805\nCLE,ABQ,12\nCLE,ALB,1106\nCLE,ATL,3115\nCLE,AUS,380\nCLE,BDL,516\nCLE,BHM,264\nCLE,BNA,1128\nCLE,BOS,1354\nCLE,BTV,613\nCLE,BUF,620\nCLE,BWI,2562\nCLE,CHS,150\nCLE,CLT,1981\nCLE,CMH,17\nCLE,CVG,493\nCLE,DAB,12\nCLE,DAY,869\nCLE,DCA,934\nCLE,DEN,976\nCLE,DFW,1656\nCLE,DSM,139\nCLE,DTW,1359\nCLE,EWR,2105\nCLE,FLL,618\nCLE,GRR,1136\nCLE,GSO,148\nCLE,GSP,510\nCLE,IAD,1433\nCLE,IAH,2151\nCLE,IND,142\nCLE,JAX,143\nCLE,JFK,1392\nCLE,LAS,1656\nCLE,LAX,1050\nCLE,LEX,15\nCLE,LGA,2936\nCLE,MCI,1230\nCLE,MCO,1915\nCLE,MDT,58\nCLE,MDW,2561\nCLE,MEM,1211\nCLE,MHT,1235\nCLE,MIA,399\nCLE,MKE,2226\nCLE,MSN,317\nCLE,MSP,1693\nCLE,MSY,54\nCLE,OKC,32\nCLE,OMA,430\nCLE,ORD,4569\nCLE,ORF,2\nCLE,PBI,383\nCLE,PHL,674\nCLE,PHX,1110\nCLE,PVD,360\nCLE,PWM,306\nCLE,RDU,319\nCLE,RIC,905\nCLE,ROC,928\nCLE,RSW,595\nCLE,SAN,85\nCLE,SAT,232\nCLE,SAV,321\nCLE,SDF,679\nCLE,SEA,231\nCLE,SFO,466\nCLE,SJU,43\nCLE,SLC,346\nCLE,SRQ,118\nCLE,STL,1191\nCLE,SYR,696\nCLE,TPA,874\nCLE,TUL,10\nCLE,TYS,495\nCLL,DFW,1105\nCLL,IAH,262\nCLT,ABE,465\nCLT,AGS,17\nCLT,ALB,978\nCLT,ATL,6722\nCLT,ATW,1\nCLT,AUS,660\nCLT,BDL,1834\nCLT,BHM,787\nCLT,BNA,2126\nCLT,BOS,3551\nCLT,BUF,1434\nCLT,BWI,3684\nCLT,CHS,1122\nCLT,CLE,1971\nCLT,CMH,125\nCLT,CVG,877\nCLT,DAB,23\nCLT,DCA,2988\nCLT,DEN,1925\nCLT,DFW,3796\nCLT,DTW,2701\nCLT,EGE,13\nCLT,EWR,5953\nCLT,FAY,95\nCLT,FLL,3295\nCLT,GRR,1\nCLT,GSO,985\nCLT,HSV,13\nCLT,IAD,3126\nCLT,IAH,3711\nCLT,ILM,1257\nCLT,IND,1230\nCLT,JAX,2524\nCLT,JFK,1866\nCLT,LAS,1734\nCLT,LAX,1458\nCLT,LGA,5339\nCLT,LIT,39\nCLT,MCI,1183\nCLT,MCO,3277\nCLT,MDT,1144\nCLT,MDW,13\nCLT,MEM,2578\nCLT,MHT,705\nCLT,MIA,2970\nCLT,MKE,243\nCLT,MSP,1816\nCLT,MSY,1466\nCLT,MYR,2217\nCLT,OAJ,6\nCLT,ORD,5639\nCLT,ORF,1543\nCLT,PBI,1873\nCLT,PDX,136\nCLT,PHL,3525\nCLT,PHX,2186\nCLT,PIT,2349\nCLT,PNS,371\nCLT,PVD,1439\nCLT,PWM,276\nCLT,RDU,2340\nCLT,RIC,1801\nCLT,ROC,412\nCLT,RSW,1765\nCLT,SAN,704\nCLT,SAT,661\nCLT,SAV,1432\nCLT,SDF,796\nCLT,SEA,481\nCLT,SFO,1427\nCLT,SJU,796\nCLT,SLC,212\nCLT,SMF,76\nCLT,SRQ,207\nCLT,STL,1094\nCLT,STT,418\nCLT,STX,20\nCLT,SYR,747\nCLT,TLH,240\nCLT,TPA,2811\nCLT,TRI,16\nCLT,TUS,208\nCMH,ATL,1808\nCMH,BNA,685\nCMH,BOS,661\nCMH,BWI,1681\nCMH,CLE,24\nCMH,CLT,125\nCMH,CVG,1185\nCMH,DCA,77\nCMH,DEN,385\nCMH,DFW,1694\nCMH,DTW,1909\nCMH,EWR,1646\nCMH,GRB,1\nCMH,GRR,1\nCMH,IAH,841\nCMH,ICT,1\nCMH,JFK,515\nCMH,LAS,1341\nCMH,LAX,48\nCMH,LGA,2355\nCMH,MCI,164\nCMH,MCO,1074\nCMH,MDW,2643\nCMH,MEM,1057\nCMH,MIA,469\nCMH,MKE,1054\nCMH,MSP,1076\nCMH,OMA,1\nCMH,ORD,4959\nCMH,PBI,5\nCMH,PHL,996\nCMH,PHX,1096\nCMH,RDU,500\nCMH,RSW,137\nCMH,SLC,291\nCMH,STL,679\nCMH,SYR,1\nCMH,TPA,972\nCMI,ABI,1\nCMI,DFW,366\nCMI,ORD,2406\nCMI,SPI,1\nCMX,MSP,318\nCOD,DEN,481\nCOD,SLC,707\nCOS,ABQ,1\nCOS,ATL,591\nCOS,CLE,1\nCOS,CVG,104\nCOS,DEN,4193\nCOS,DFW,2036\nCOS,FAT,1\nCOS,IAH,1725\nCOS,LAN,1\nCOS,LAS,98\nCOS,LAX,997\nCOS,MCI,179\nCOS,MEM,117\nCOS,MKE,1\nCOS,MSP,450\nCOS,ONT,460\nCOS,ORD,1519\nCOS,PHX,1393\nCOS,SAN,472\nCOS,SFO,364\nCOS,SLC,1074\nCOS,SMF,424\nCPR,DEN,1536\nCPR,MSP,32\nCPR,ORD,134\nCPR,PIH,1\nCPR,SLC,1006\nCRP,ATL,6\nCRP,DFW,2510\nCRP,HOU,1933\nCRP,IAH,821\nCRW,ATL,1430\nCRW,BNA,1\nCRW,CVG,391\nCRW,DTW,208\nCRW,IAH,674\nCRW,LEX,1\nCRW,ORD,709\nCSG,ATL,1481\nCVG,ABE,248\nCVG,ABQ,260\nCVG,ALB,912\nCVG,ANC,90\nCVG,ATL,2758\nCVG,ATW,697\nCVG,AUS,653\nCVG,AVL,167\nCVG,AVP,357\nCVG,AZO,149\nCVG,BDL,1157\nCVG,BGR,127\nCVG,BHM,852\nCVG,BNA,902\nCVG,BOS,1859\nCVG,BTR,2\nCVG,BTV,152\nCVG,BUF,160\nCVG,BWI,1235\nCVG,CAE,942\nCVG,CAK,39\nCVG,CHA,132\nCVG,CHO,35\nCVG,CHS,786\nCVG,CID,873\nCVG,CLE,493\nCVG,CLT,926\nCVG,CMH,795\nCVG,COS,104\nCVG,CRW,391\nCVG,DAB,6\nCVG,DAY,746\nCVG,DCA,2015\nCVG,DEN,1384\nCVG,DFW,3244\nCVG,DSM,983\nCVG,DTW,3023\nCVG,EGE,30\nCVG,EVV,135\nCVG,EWR,3094\nCVG,FLL,683\nCVG,FSD,555\nCVG,GRB,447\nCVG,GRR,1386\nCVG,GSO,1057\nCVG,GSP,456\nCVG,HPN,126\nCVG,HSV,800\nCVG,HTS,159\nCVG,IAD,783\nCVG,IAH,2048\nCVG,ILM,140\nCVG,IND,491\nCVG,JAC,13\nCVG,JAN,120\nCVG,JAX,1125\nCVG,JFK,1532\nCVG,LAN,485\nCVG,LAS,921\nCVG,LAX,1143\nCVG,LEX,1525\nCVG,LGA,3645\nCVG,LIT,49\nCVG,MCI,1491\nCVG,MCO,1305\nCVG,MDT,1007\nCVG,MEM,1226\nCVG,MHT,776\nCVG,MIA,1045\nCVG,MKE,839\nCVG,MSN,259\nCVG,MSP,1745\nCVG,MSY,195\nCVG,MYR,13\nCVG,OKC,769\nCVG,OMA,1003\nCVG,ORD,6014\nCVG,ORF,450\nCVG,PBI,389\nCVG,PDX,318\nCVG,PFN,36\nCVG,PHL,1671\nCVG,PHX,468\nCVG,PIT,1292\nCVG,PVD,958\nCVG,PWM,555\nCVG,RDU,1087\nCVG,RIC,786\nCVG,ROA,1\nCVG,ROC,730\nCVG,RSW,539\nCVG,SAN,571\nCVG,SAT,882\nCVG,SAV,732\nCVG,SBN,12\nCVG,SCE,23\nCVG,SDF,635\nCVG,SEA,790\nCVG,SFO,777\nCVG,SGF,245\nCVG,SLC,1627\nCVG,SNA,285\nCVG,SRQ,444\nCVG,STL,345\nCVG,SYR,831\nCVG,TOL,20\nCVG,TPA,1099\nCVG,TRI,247\nCVG,TUL,882\nCVG,TVC,129\nCVG,TYS,916\nCVG,VPS,103\nCVG,XNA,101\nCWA,DTW,549\nCWA,MKE,285\nCWA,MLI,1\nCWA,MSP,13\nCWA,ORD,1715\nDAB,ATL,2412\nDAB,BWI,32\nDAB,CLE,12\nDAB,CLT,23\nDAB,CVG,6\nDAB,EWR,311\nDAB,JAX,1\nDAB,LGA,159\nDAB,MCO,1\nDAL,ABQ,3106\nDAL,AMA,2665\nDAL,AUS,5583\nDAL,BHM,1051\nDAL,ELP,2282\nDAL,HOU,9790\nDAL,HRL,33\nDAL,IAH,3730\nDAL,LBB,2680\nDAL,LIT,2330\nDAL,MAF,1997\nDAL,MCI,3922\nDAL,MSY,2096\nDAL,OKC,1686\nDAL,ORD,1005\nDAL,SAT,4973\nDAL,STL,2722\nDAL,TUL,2277\nDAY,ATL,4369\nDAY,BWI,980\nDAY,CLE,862\nDAY,CVG,755\nDAY,DEN,838\nDAY,DFW,1037\nDAY,DTW,1322\nDAY,EWR,948\nDAY,IAD,53\nDAY,IAH,864\nDAY,LAS,43\nDAY,MCO,416\nDAY,MKE,609\nDAY,MSP,692\nDAY,ORD,1799\nDAY,TPA,204\nDBQ,ORD,1349\nDCA,ALB,304\nDCA,ATL,7296\nDCA,BDL,1183\nDCA,BNA,1401\nDCA,BOS,8929\nDCA,BTR,129\nDCA,BUF,632\nDCA,CLE,935\nDCA,CLT,3001\nDCA,CMH,77\nDCA,CVG,1841\nDCA,DEN,1429\nDCA,DFW,3965\nDCA,DSM,272\nDCA,DTW,2982\nDCA,EWR,2289\nDCA,FLL,1361\nDCA,GRR,307\nDCA,HSV,561\nDCA,IAH,2919\nDCA,IND,968\nDCA,JAN,304\nDCA,JAX,888\nDCA,JFK,3017\nDCA,LAS,365\nDCA,LAX,366\nDCA,LEX,311\nDCA,LGA,11102\nDCA,MCO,1845\nDCA,MEM,1043\nDCA,MHT,306\nDCA,MIA,2987\nDCA,MKE,122\nDCA,MSN,287\nDCA,MSP,2199\nDCA,MSY,408\nDCA,ORD,7427\nDCA,PBI,909\nDCA,PHL,5\nDCA,PHX,1081\nDCA,PIT,322\nDCA,PLN,1\nDCA,PVD,671\nDCA,RDU,2732\nDCA,RSW,706\nDCA,SEA,727\nDCA,SLC,365\nDCA,SRQ,12\nDCA,STL,1296\nDCA,SYR,313\nDCA,TPA,1554\nDCA,XNA,210\nDEN,ABQ,4309\nDEN,AMA,731\nDEN,ANC,451\nDEN,ASE,3979\nDEN,ATL,5903\nDEN,AUS,2719\nDEN,BDL,213\nDEN,BFL,533\nDEN,BHM,651\nDEN,BIL,1631\nDEN,BIS,1240\nDEN,BNA,2556\nDEN,BOI,2069\nDEN,BOS,2234\nDEN,BTR,1\nDEN,BUR,1238\nDEN,BWI,2655\nDEN,BZN,1286\nDEN,CAK,780\nDEN,CID,572\nDEN,CLE,969\nDEN,CLT,1925\nDEN,CMH,685\nDEN,COD,481\nDEN,COS,4188\nDEN,CPR,1533\nDEN,CRW,1\nDEN,CVG,1384\nDEN,CYS,1\nDEN,DAY,850\nDEN,DCA,1428\nDEN,DFW,8268\nDEN,DRO,2473\nDEN,DSM,1404\nDEN,DTW,2913\nDEN,EGE,1673\nDEN,ELP,1060\nDEN,EUG,726\nDEN,EWR,2189\nDEN,FAR,1246\nDEN,FAT,1266\nDEN,FCA,668\nDEN,FLL,908\nDEN,FSD,1474\nDEN,GCC,695\nDEN,GEG,1440\nDEN,GJT,2469\nDEN,GRB,2\nDEN,GRR,343\nDEN,GTF,868\nDEN,GUC,832\nDEN,HDN,1310\nDEN,HLN,414\nDEN,HNL,367\nDEN,HOU,1056\nDEN,HSV,654\nDEN,IAD,2943\nDEN,IAH,4788\nDEN,ICT,1583\nDEN,IDA,979\nDEN,IND,2083\nDEN,JAC,1340\nDEN,JAX,118\nDEN,JFK,1084\nDEN,KOA,45\nDEN,LAS,8147\nDEN,LAX,8811\nDEN,LGA,3051\nDEN,LIH,45\nDEN,LIT,121\nDEN,LNK,1200\nDEN,MBS,1\nDEN,MCI,5111\nDEN,MCO,3015\nDEN,MDW,4338\nDEN,MEM,1730\nDEN,MFR,365\nDEN,MIA,810\nDEN,MKE,1587\nDEN,MLI,723\nDEN,MRY,363\nDEN,MSN,1003\nDEN,MSO,1108\nDEN,MSP,5011\nDEN,MSY,1174\nDEN,MTJ,1592\nDEN,OAK,3100\nDEN,OGG,163\nDEN,OKC,2636\nDEN,OMA,3169\nDEN,ONT,1544\nDEN,ORD,6051\nDEN,PBI,94\nDEN,PDX,4563\nDEN,PHL,2975\nDEN,PHX,8391\nDEN,PIA,363\nDEN,PIH,1\nDEN,PIT,804\nDEN,PSC,939\nDEN,PSP,997\nDEN,RAP,2308\nDEN,RDM,12\nDEN,RDU,470\nDEN,RFD,289\nDEN,RKS,545\nDEN,RNO,1350\nDEN,ROC,1\nDEN,RSW,221\nDEN,SAN,5358\nDEN,SAT,2651\nDEN,SBA,841\nDEN,SDF,384\nDEN,SEA,6414\nDEN,SFO,5604\nDEN,SGF,953\nDEN,SJC,3684\nDEN,SLC,8905\nDEN,SMF,3331\nDEN,SNA,3340\nDEN,STL,2126\nDEN,TPA,1682\nDEN,TUL,1628\nDEN,TUS,2089\nDEN,TVC,88\nDEN,TYS,510\nDEN,XNA,686\nDFW,ABI,2660\nDFW,ABQ,2888\nDFW,ACT,1994\nDFW,AEX,1003\nDFW,AMA,2551\nDFW,ANC,153\nDFW,ATL,9849\nDFW,AUS,5508\nDFW,BDL,1065\nDFW,BHM,1287\nDFW,BMI,60\nDFW,BNA,2861\nDFW,BOS,3036\nDFW,BTR,2919\nDFW,BUF,93\nDFW,BUR,1375\nDFW,BWI,2309\nDFW,CAE,1157\nDFW,CHA,426\nDFW,CHS,1154\nDFW,CID,1897\nDFW,CLE,1665\nDFW,CLL,1104\nDFW,CLT,3797\nDFW,CMH,1694\nDFW,CMI,366\nDFW,COS,2034\nDFW,CRP,2509\nDFW,CVG,3244\nDFW,DAY,1038\nDFW,DCA,3965\nDFW,DEN,8193\nDFW,DSM,2134\nDFW,DTW,2792\nDFW,EGE,457\nDFW,ELP,2900\nDFW,EVV,365\nDFW,EWR,3728\nDFW,FAT,730\nDFW,FLL,2296\nDFW,FNT,245\nDFW,FSM,1825\nDFW,FWA,713\nDFW,GGG,971\nDFW,GJT,600\nDFW,GPT,1155\nDFW,GRK,2562\nDFW,GRR,793\nDFW,GSO,1037\nDFW,GSP,1435\nDFW,GUC,109\nDFW,HDN,126\nDFW,HNL,732\nDFW,HOU,2425\nDFW,HSV,1714\nDFW,IAD,2010\nDFW,IAH,5526\nDFW,ICT,1792\nDFW,IND,2086\nDFW,JAC,213\nDFW,JAN,2604\nDFW,JAX,1366\nDFW,JFK,833\nDFW,LAS,4956\nDFW,LAW,1822\nDFW,LAX,6571\nDFW,LBB,3012\nDFW,LEX,908\nDFW,LFT,1181\nDFW,LGA,5365\nDFW,LIT,3245\nDFW,LRD,1400\nDFW,MAF,1777\nDFW,MCI,2878\nDFW,MCO,4114\nDFW,MDT,272\nDFW,MEM,2501\nDFW,MFE,1439\nDFW,MIA,3350\nDFW,MKE,745\nDFW,MLI,588\nDFW,MLU,964\nDFW,MOB,1398\nDFW,MSN,946\nDFW,MSP,2810\nDFW,MSY,2501\nDFW,MTJ,231\nDFW,OAK,724\nDFW,OGG,366\nDFW,OKC,2846\nDFW,OMA,1747\nDFW,ONT,1741\nDFW,ORD,8165\nDFW,ORF,1035\nDFW,PBI,853\nDFW,PDX,1578\nDFW,PHL,3483\nDFW,PHX,5388\nDFW,PIA,635\nDFW,PIT,2140\nDFW,PNS,2020\nDFW,PSP,1095\nDFW,RDU,2347\nDFW,RIC,1041\nDFW,RNO,1093\nDFW,ROC,176\nDFW,ROW,961\nDFW,RSW,918\nDFW,SAN,3526\nDFW,SAT,5414\nDFW,SAV,795\nDFW,SBA,365\nDFW,SDF,1386\nDFW,SEA,3915\nDFW,SFO,3486\nDFW,SGF,3231\nDFW,SHV,3579\nDFW,SJC,2250\nDFW,SJT,1315\nDFW,SJU,985\nDFW,SLC,3143\nDFW,SMF,1346\nDFW,SNA,3669\nDFW,SPS,1831\nDFW,STL,3598\nDFW,SYR,178\nDFW,TPA,2803\nDFW,TUL,3256\nDFW,TUS,2677\nDFW,TXK,1247\nDFW,TYR,1585\nDFW,TYS,1505\nDFW,VPS,1962\nDFW,XNA,2780\nDHN,ATL,1397\nDLG,ANC,116\nDLH,DTW,721\nDLH,MSP,1292\nDRO,ABQ,1\nDRO,DEN,2475\nDRO,PHX,812\nDRO,SLC,386\nDSM,ATL,1115\nDSM,CLE,139\nDSM,CVG,982\nDSM,CWA,1\nDSM,DCA,272\nDSM,DEN,1704\nDSM,DFW,2137\nDSM,DTW,956\nDSM,GJT,2\nDSM,IAH,688\nDSM,LAX,175\nDSM,LGA,707\nDSM,LNK,1\nDSM,MEM,751\nDSM,MKE,722\nDSM,MSP,1012\nDSM,ORD,4525\nDSM,ORF,1\nDSM,PHX,749\nDSM,RFD,1\nDSM,SLC,3\nDTW,ABE,997\nDTW,ALB,1013\nDTW,ANC,96\nDTW,ATL,5612\nDTW,ATW,1021\nDTW,AVL,768\nDTW,AVP,722\nDTW,AZO,1176\nDTW,BDL,1565\nDTW,BGM,728\nDTW,BGR,801\nDTW,BHM,887\nDTW,BNA,2712\nDTW,BOS,2377\nDTW,BTV,826\nDTW,BUF,1508\nDTW,BWI,3101\nDTW,BZN,19\nDTW,CAE,713\nDTW,CAK,1044\nDTW,CHA,73\nDTW,CHS,761\nDTW,CID,948\nDTW,CLE,1182\nDTW,CLT,2703\nDTW,CMH,1894\nDTW,CRW,208\nDTW,CVG,3099\nDTW,CWA,549\nDTW,DAY,1322\nDTW,DCA,2986\nDTW,DEN,2919\nDTW,DFW,2799\nDTW,DLH,722\nDTW,DSM,977\nDTW,ELM,1336\nDTW,ERI,1398\nDTW,EVV,1342\nDTW,EWR,4374\nDTW,FLL,1321\nDTW,FNT,1519\nDTW,FWA,1202\nDTW,GRB,1245\nDTW,GRR,2527\nDTW,GSO,1245\nDTW,GSP,1239\nDTW,HPN,666\nDTW,HSV,698\nDTW,IAD,1708\nDTW,IAH,2740\nDTW,ICT,242\nDTW,IND,2605\nDTW,ITH,133\nDTW,JAN,682\nDTW,JAX,507\nDTW,JFK,1754\nDTW,LAN,1642\nDTW,LAS,2038\nDTW,LAX,1608\nDTW,LEX,1658\nDTW,LGA,4594\nDTW,LIT,362\nDTW,LNK,320\nDTW,MBS,1468\nDTW,MCI,1438\nDTW,MCO,3481\nDTW,MDT,543\nDTW,MDW,3179\nDTW,MEM,2562\nDTW,MHT,844\nDTW,MIA,1227\nDTW,MKE,1742\nDTW,MLI,745\nDTW,MSN,1603\nDTW,MSP,4947\nDTW,MSY,68\nDTW,MYR,287\nDTW,OKC,622\nDTW,OMA,1324\nDTW,ORD,7553\nDTW,ORF,968\nDTW,PBI,472\nDTW,PDX,250\nDTW,PHL,2791\nDTW,PHX,2928\nDTW,PIA,701\nDTW,PIT,1558\nDTW,PLN,263\nDTW,PVD,1105\nDTW,PWM,66\nDTW,RDU,1368\nDTW,RIC,700\nDTW,ROA,748\nDTW,ROC,864\nDTW,RST,105\nDTW,RSW,1144\nDTW,SAN,583\nDTW,SAT,597\nDTW,SAV,508\nDTW,SBN,1638\nDTW,SCE,500\nDTW,SDF,1082\nDTW,SEA,1172\nDTW,SFO,1235\nDTW,SGF,363\nDTW,SHV,360\nDTW,SJU,155\nDTW,SLC,572\nDTW,SRQ,219\nDTW,STL,2516\nDTW,STT,16\nDTW,SWF,724\nDTW,SYR,1015\nDTW,TPA,1452\nDTW,TUL,726\nDTW,TVC,1209\nDTW,TYS,1788\nDTW,XNA,362\nEGE,ATL,109\nEGE,CLT,13\nEGE,CVG,30\nEGE,DEN,1674\nEGE,DFW,457\nEGE,EWR,207\nEGE,IAH,124\nEGE,JFK,13\nEGE,LAX,111\nEGE,LGA,16\nEGE,MIA,43\nEGE,MSP,112\nEGE,ORD,197\nEKO,SLC,1577\nEKO,TWF,3\nELM,DTW,1336\nELP,ABQ,792\nELP,ATL,575\nELP,AUS,1344\nELP,DAL,2290\nELP,DEN,1060\nELP,DFW,2901\nELP,HOU,1033\nELP,IAH,1136\nELP,LAS,1056\nELP,LAX,1075\nELP,LBB,362\nELP,ONT,381\nELP,ORD,670\nELP,PHX,4136\nELP,SAN,366\nELP,SAT,1344\nELP,SLC,121\nELP,TUS,89\nERI,DTW,1398\nERI,PIT,1\nEUG,DEN,726\nEUG,FAT,1\nEUG,LAS,162\nEUG,LAX,305\nEUG,MFR,1\nEUG,PDX,1551\nEUG,PHX,372\nEUG,RDM,1\nEUG,SFO,1919\nEUG,SLC,711\nEVV,ATL,1151\nEVV,CVG,136\nEVV,DFW,366\nEVV,DTW,1342\nEVV,MEM,904\nEVV,ORD,1944\nEVV,STL,1\nEWN,ATL,791\nEWR,ABQ,166\nEWR,ACK,234\nEWR,ALB,619\nEWR,ATL,8060\nEWR,AUS,939\nEWR,AVL,658\nEWR,BDL,793\nEWR,BGR,536\nEWR,BHM,681\nEWR,BNA,1812\nEWR,BOS,3870\nEWR,BQN,366\nEWR,BTV,879\nEWR,BUF,1481\nEWR,BWI,508\nEWR,CAE,684\nEWR,CHS,1285\nEWR,CLE,2103\nEWR,CLT,5945\nEWR,CMH,1653\nEWR,CVG,3095\nEWR,DAB,311\nEWR,DAY,946\nEWR,DCA,2269\nEWR,DEN,2209\nEWR,DFW,3729\nEWR,DTW,4419\nEWR,EGE,207\nEWR,FLL,4432\nEWR,GRB,1\nEWR,GRR,593\nEWR,GSO,1092\nEWR,GSP,1036\nEWR,HDN,15\nEWR,HNL,362\nEWR,IAD,1789\nEWR,IAH,3989\nEWR,IND,1722\nEWR,JAN,121\nEWR,JAX,1596\nEWR,LAS,2350\nEWR,LAX,3239\nEWR,LEX,389\nEWR,LGA,1\nEWR,LIT,323\nEWR,MCI,1798\nEWR,MCO,4978\nEWR,MDW,279\nEWR,MEM,1192\nEWR,MHT,1331\nEWR,MIA,2873\nEWR,MKE,2523\nEWR,MSN,313\nEWR,MSP,3103\nEWR,MSY,1139\nEWR,MTJ,21\nEWR,MYR,234\nEWR,OKC,360\nEWR,OMA,1079\nEWR,ORD,7505\nEWR,ORF,379\nEWR,PBI,2769\nEWR,PDX,687\nEWR,PHL,19\nEWR,PHX,2601\nEWR,PIT,677\nEWR,PSE,16\nEWR,PVD,1101\nEWR,PWM,740\nEWR,RDU,2391\nEWR,RIC,1576\nEWR,ROC,925\nEWR,RSW,1873\nEWR,SAN,1179\nEWR,SAT,949\nEWR,SAV,1127\nEWR,SDF,1052\nEWR,SEA,2030\nEWR,SFO,2777\nEWR,SJC,200\nEWR,SJU,1580\nEWR,SLC,812\nEWR,SNA,908\nEWR,SRQ,399\nEWR,STL,1707\nEWR,STT,232\nEWR,SYR,993\nEWR,TPA,2838\nEWR,TUL,343\nEWR,TUS,186\nEWR,TYS,660\nEWR,XNA,545\nEYW,ATL,974\nEYW,MCO,35\nFAI,ANC,2853\nFAI,BRW,364\nFAI,MSP,205\nFAI,SCC,364\nFAI,SEA,956\nFAI,SLC,80\nFAR,DEN,1263\nFAR,LAN,1\nFAR,MCI,1\nFAR,MSP,1743\nFAR,ORD,1327\nFAR,SLC,95\nFAR,STL,1\nFAT,DEN,1265\nFAT,DFW,730\nFAT,LAS,2092\nFAT,LAX,4022\nFAT,LGB,435\nFAT,MRY,2\nFAT,OGD,1\nFAT,ONT,239\nFAT,PHX,1625\nFAT,SAN,581\nFAT,SBA,2\nFAT,SFO,2438\nFAT,SLC,845\nFAT,TWF,1\nFAY,ATL,2172\nFAY,CLT,95\nFCA,ATL,25\nFCA,DEN,668\nFCA,IDA,2\nFCA,MSP,210\nFCA,ORD,104\nFCA,SFO,12\nFCA,SLC,1741\nFLG,PHX,1871\nFLL,ALB,60\nFLL,ATL,7666\nFLL,AUS,481\nFLL,BDL,545\nFLL,BNA,740\nFLL,BOS,2473\nFLL,BUF,672\nFLL,BWI,2704\nFLL,CAK,8\nFLL,CLE,618\nFLL,CLT,2947\nFLL,CVG,687\nFLL,DCA,1339\nFLL,DEN,903\nFLL,DFW,2298\nFLL,DTW,1320\nFLL,EWR,4431\nFLL,GPT,366\nFLL,HOU,722\nFLL,HPN,1022\nFLL,IAD,1176\nFLL,IAH,1933\nFLL,IND,578\nFLL,ISP,1092\nFLL,JAX,1812\nFLL,JFK,4699\nFLL,LAS,677\nFLL,LAX,372\nFLL,LGA,3149\nFLL,LGB,332\nFLL,MCI,60\nFLL,MCO,2095\nFLL,MDW,1622\nFLL,MEM,480\nFLL,MHT,245\nFLL,MIA,1\nFLL,MKE,43\nFLL,MSP,475\nFLL,MSY,593\nFLL,OAK,13\nFLL,ORD,1581\nFLL,PHF,309\nFLL,PHL,2977\nFLL,PHX,622\nFLL,PIT,872\nFLL,PNS,145\nFLL,PSE,44\nFLL,PVD,424\nFLL,RDU,695\nFLL,RIC,366\nFLL,ROC,114\nFLL,SJU,765\nFLL,SLC,242\nFLL,STL,470\nFLL,SWF,476\nFLL,SYR,328\nFLL,TLH,262\nFLL,TPA,3036\nFLO,ATL,615\nFNT,ATL,3133\nFNT,DFW,246\nFNT,DTW,1522\nFNT,LAS,90\nFNT,LGA,393\nFNT,MCO,455\nFNT,MKE,838\nFNT,MKG,105\nFNT,MSP,354\nFNT,ORD,1264\nFNT,RSW,149\nFNT,TPA,200\nFSD,ATL,135\nFSD,CVG,555\nFSD,DEN,1429\nFSD,GRB,1\nFSD,MSN,1\nFSD,MSP,1927\nFSD,ORD,1770\nFSD,PIA,1\nFSD,SDF,1\nFSD,SLC,8\nFSM,ATL,633\nFSM,DFW,1826\nFSM,MEM,478\nFWA,ATL,1029\nFWA,DFW,713\nFWA,DTW,1202\nFWA,MSP,241\nFWA,ORD,2958\nFWA,TVC,1\nGCC,DEN,695\nGCC,RKS,59\nGCC,SLC,292\nGEG,BLI,1\nGEG,BOI,1016\nGEG,DEN,1436\nGEG,LAS,753\nGEG,LAX,431\nGEG,LGB,1\nGEG,MSP,826\nGEG,OAK,719\nGEG,ONT,440\nGEG,ORD,328\nGEG,PDX,1314\nGEG,PHX,777\nGEG,RDM,1\nGEG,RNO,213\nGEG,SAN,454\nGEG,SEA,4372\nGEG,SLC,1951\nGEG,SMF,375\nGEG,TUS,152\nGFK,MSP,1371\nGGG,DFW,978\nGJT,ASE,2\nGJT,DEN,2463\nGJT,DFW,599\nGJT,HDN,1\nGJT,LAX,4\nGJT,ORD,6\nGJT,PHX,1037\nGJT,SLC,1040\nGNV,ATL,2064\nGPT,ATL,3441\nGPT,DFW,1157\nGPT,FLL,366\nGPT,IAH,1908\nGPT,MEM,1088\nGPT,ORD,215\nGPT,TPA,366\nGRB,ATL,93\nGRB,CVG,447\nGRB,DEN,1\nGRB,DSM,1\nGRB,DTW,1224\nGRB,GTF,1\nGRB,MKE,774\nGRB,MQT,323\nGRB,MSP,1431\nGRB,ORD,3634\nGRB,SDF,1\nGRK,ATL,643\nGRK,DFW,2565\nGRK,IAH,525\nGRR,ATL,1351\nGRR,CLE,1147\nGRR,CVG,1387\nGRR,DCA,307\nGRR,DEN,346\nGRR,DFW,795\nGRR,DTW,2655\nGRR,EWR,582\nGRR,IAH,714\nGRR,LGA,363\nGRR,MCO,128\nGRR,MEM,362\nGRR,MKE,1244\nGRR,MKG,23\nGRR,MSP,1516\nGRR,ORD,3696\nGSO,ATL,2848\nGSO,BOS,132\nGSO,CLE,148\nGSO,CLT,987\nGSO,CVG,1097\nGSO,DFW,1037\nGSO,DTW,1245\nGSO,EWR,1093\nGSO,IAD,208\nGSO,IAH,1035\nGSO,JAX,1\nGSO,LGA,905\nGSO,MCO,19\nGSO,MEM,1043\nGSO,MIA,520\nGSO,MSP,365\nGSO,ORD,870\nGSO,ORF,2\nGSO,RDU,3\nGSP,ATL,2450\nGSP,CLE,510\nGSP,CLT,1\nGSP,CVG,456\nGSP,DFW,1436\nGSP,DTW,1238\nGSP,EWR,1040\nGSP,IAD,828\nGSP,IAH,950\nGSP,LGA,609\nGSP,MCO,90\nGSP,MEM,1089\nGSP,ORD,1159\nGST,JNU,85\nGTF,BZN,1\nGTF,DEN,869\nGTF,MSP,196\nGTF,ORD,23\nGTF,SLC,1051\nGTR,ATL,964\nGUC,ATL,2\nGUC,DEN,831\nGUC,DFW,111\nGUC,ORD,2\nGUC,SLC,13\nHDN,ATL,107\nHDN,DEN,1314\nHDN,DFW,127\nHDN,EWR,15\nHDN,IAH,112\nHDN,JFK,13\nHDN,LGA,15\nHDN,MSP,112\nHDN,ORD,205\nHDN,SLC,378\nHHH,ATL,836\nHLN,DEN,412\nHLN,MSP,365\nHLN,SLC,1209\nHNL,ANC,236\nHNL,ATL,637\nHNL,DEN,366\nHNL,DFW,732\nHNL,EWR,362\nHNL,IAH,702\nHNL,ITO,7685\nHNL,KOA,8745\nHNL,LAS,732\nHNL,LAX,4963\nHNL,LIH,10769\nHNL,MSP,366\nHNL,OAK,121\nHNL,OGG,12014\nHNL,ORD,641\nHNL,PDX,732\nHNL,PHX,914\nHNL,SAN,393\nHNL,SEA,1643\nHNL,SFO,2359\nHNL,SJC,366\nHNL,SLC,366\nHNL,SMF,366\nHNL,SNA,66\nHOU,ABQ,1023\nHOU,ATL,3595\nHOU,AUS,2310\nHOU,BHM,736\nHOU,BNA,1500\nHOU,BTR,1\nHOU,BWI,1262\nHOU,CRP,1932\nHOU,DAL,9766\nHOU,DEN,1063\nHOU,DFW,2425\nHOU,ELP,1032\nHOU,FLL,723\nHOU,HRL,2967\nHOU,JAN,1341\nHOU,JAX,366\nHOU,JFK,944\nHOU,LAS,1460\nHOU,LAX,1416\nHOU,LIT,365\nHOU,MAF,676\nHOU,MCO,1753\nHOU,MDW,2054\nHOU,MSY,3726\nHOU,OAK,713\nHOU,OKC,1366\nHOU,PHL,659\nHOU,PHX,1722\nHOU,SAN,421\nHOU,SAT,2572\nHOU,STL,1348\nHOU,TPA,1396\nHOU,TUL,1300\nHPN,ATL,2158\nHPN,CVG,126\nHPN,DTW,666\nHPN,EWR,1\nHPN,FLL,1021\nHPN,JFK,2\nHPN,MCO,1485\nHPN,ORD,3626\nHPN,PBI,1048\nHPN,PIA,1\nHPN,PIT,1\nHPN,RSW,520\nHPN,TPA,60\nHRL,AUS,366\nHRL,DAL,33\nHRL,HOU,2949\nHRL,IAH,398\nHRL,SAT,675\nHSV,ATL,2622\nHSV,BHM,4\nHSV,CLT,13\nHSV,CVG,787\nHSV,DCA,577\nHSV,DEN,653\nHSV,DFW,1717\nHSV,DTW,702\nHSV,IAD,726\nHSV,IAH,1043\nHSV,LGA,72\nHSV,MCO,248\nHSV,MEM,1079\nHSV,ORD,547\nHSV,TUS,1\nHTS,CVG,158\nIAD,ABQ,365\nIAD,ATL,5362\nIAD,AUS,631\nIAD,BDL,1192\nIAD,BHM,245\nIAD,BNA,233\nIAD,BOS,3846\nIAD,BTV,129\nIAD,BUF,16\nIAD,BUR,163\nIAD,CAE,1709\nIAD,CHS,710\nIAD,CLE,1435\nIAD,CLT,2762\nIAD,CVG,783\nIAD,DAY,52\nIAD,DCA,1\nIAD,DEN,2984\nIAD,DFW,2009\nIAD,DTW,1684\nIAD,EWR,1790\nIAD,FLL,1174\nIAD,GSO,207\nIAD,GSP,682\nIAD,HSV,725\nIAD,IAH,1389\nIAD,JAX,751\nIAD,JFK,2297\nIAD,LAS,1623\nIAD,LAX,4092\nIAD,LGA,1105\nIAD,LGB,756\nIAD,MCI,313\nIAD,MCO,4244\nIAD,MDT,984\nIAD,MDW,2075\nIAD,MHT,585\nIAD,MIA,575\nIAD,MSP,712\nIAD,MSY,413\nIAD,MYR,533\nIAD,OAK,841\nIAD,OKC,319\nIAD,ORD,2948\nIAD,ORF,956\nIAD,PBI,14\nIAD,PDX,367\nIAD,PHL,607\nIAD,PHX,731\nIAD,PIT,740\nIAD,PVD,511\nIAD,PWM,380\nIAD,RDU,1679\nIAD,ROA,682\nIAD,ROC,492\nIAD,RSW,14\nIAD,SAN,1331\nIAD,SAT,111\nIAD,SAV,1008\nIAD,SEA,1098\nIAD,SFO,3139\nIAD,SJC,245\nIAD,SJU,707\nIAD,SLC,524\nIAD,SMF,365\nIAD,SPI,141\nIAD,STT,137\nIAD,SYR,653\nIAD,TPA,1746\nIAD,TUS,112\nIAD,TYS,97\nIAH,ABQ,2261\nIAH,AEX,342\nIAH,AGS,1\nIAH,AMA,807\nIAH,ANC,206\nIAH,ATL,4989\nIAH,AUS,3704\nIAH,AVL,458\nIAH,BDL,120\nIAH,BHM,2333\nIAH,BNA,2547\nIAH,BOS,1822\nIAH,BPT,275\nIAH,BRO,1465\nIAH,BTR,2009\nIAH,BWI,1728\nIAH,CAE,165\nIAH,CHA,458\nIAH,CHS,73\nIAH,CLE,2147\nIAH,CLL,261\nIAH,CLT,3709\nIAH,CMH,839\nIAH,COS,1725\nIAH,CRP,823\nIAH,CRW,674\nIAH,CVG,2045\nIAH,DAL,3730\nIAH,DAY,859\nIAH,DCA,2941\nIAH,DEN,4584\nIAH,DFW,5539\nIAH,DSM,688\nIAH,DTW,2742\nIAH,EGE,124\nIAH,ELP,1136\nIAH,EWR,3970\nIAH,FLL,1933\nIAH,GPT,1908\nIAH,GRK,525\nIAH,GRR,714\nIAH,GSO,1036\nIAH,GSP,954\nIAH,HDN,112\nIAH,HNL,702\nIAH,HOU,2\nIAH,HRL,398\nIAH,HSV,1043\nIAH,IAD,1422\nIAH,ICT,1594\nIAH,IND,1763\nIAH,JAN,1720\nIAH,JAX,1529\nIAH,JFK,969\nIAH,LAS,2682\nIAH,LAX,3867\nIAH,LBB,769\nIAH,LCH,999\nIAH,LEX,646\nIAH,LFT,2703\nIAH,LGA,3399\nIAH,LIT,1111\nIAH,LRD,716\nIAH,MAF,1187\nIAH,MCI,2516\nIAH,MCO,2494\nIAH,MEM,3046\nIAH,MFE,2665\nIAH,MGM,246\nIAH,MIA,2735\nIAH,MKE,1673\nIAH,MLU,580\nIAH,MOB,1420\nIAH,MSP,2466\nIAH,MSY,4248\nIAH,MTJ,261\nIAH,OAK,722\nIAH,OKC,2625\nIAH,OMA,2098\nIAH,ONT,1093\nIAH,ORD,5651\nIAH,ORF,970\nIAH,PBI,1389\nIAH,PDX,1271\nIAH,PHL,1732\nIAH,PHX,4176\nIAH,PIT,1713\nIAH,PNS,635\nIAH,PSP,216\nIAH,RDU,1987\nIAH,RIC,970\nIAH,RNO,428\nIAH,RSW,1064\nIAH,SAN,2392\nIAH,SAT,3760\nIAH,SAV,948\nIAH,SDF,396\nIAH,SEA,2393\nIAH,SFO,2655\nIAH,SHV,1017\nIAH,SJC,995\nIAH,SJU,732\nIAH,SLC,2696\nIAH,SMF,1085\nIAH,SNA,1873\nIAH,SRQ,70\nIAH,STL,736\nIAH,TLH,481\nIAH,TPA,1963\nIAH,TUL,2310\nIAH,TUS,1670\nIAH,TYS,1353\nIAH,VPS,420\nIAH,XNA,1435\nICT,ATL,3146\nICT,CID,1\nICT,COS,1\nICT,DEN,1578\nICT,DFW,1794\nICT,DTW,241\nICT,IAH,1594\nICT,LAX,184\nICT,MCI,1\nICT,MEM,1092\nICT,MSP,714\nICT,MSY,1\nICT,OKC,2\nICT,ORD,3005\nICT,PHX,692\nICT,PIA,1\nICT,SGF,1\nICT,SLC,1\nICT,STL,1\nIDA,DEN,980\nIDA,MSP,336\nIDA,SLC,1787\nILM,ATL,1991\nILM,CLT,1259\nILM,CVG,146\nILM,RDU,1\nIND,ATL,3515\nIND,AUS,218\nIND,BDL,587\nIND,BOS,950\nIND,BWI,1003\nIND,CLE,635\nIND,CLT,1587\nIND,CVG,507\nIND,DCA,968\nIND,DEN,2089\nIND,DFW,2087\nIND,DTW,2558\nIND,EWR,1717\nIND,FLL,578\nIND,IAH,1275\nIND,JAX,366\nIND,JFK,117\nIND,LAS,1675\nIND,LAX,548\nIND,LGA,1331\nIND,MCI,1069\nIND,MCO,2298\nIND,MDW,1333\nIND,MEM,1066\nIND,MIA,213\nIND,MKE,738\nIND,MSP,1700\nIND,MSY,10\nIND,ORD,4102\nIND,PHL,495\nIND,PHX,1457\nIND,PIT,1\nIND,RDU,673\nIND,RSW,1057\nIND,SAT,236\nIND,SEA,75\nIND,SFO,173\nIND,SRQ,155\nIND,TPA,1587\nIND,XNA,1\nINL,MSP,72\nIPL,LAX,646\nIPL,YUM,343\nISP,ATL,215\nISP,BWI,2438\nISP,FLL,1087\nISP,LAS,366\nISP,MCO,2105\nISP,MDW,1427\nISP,PBI,1090\nISP,RSW,375\nISP,TPA,1080\nITH,DTW,132\nITO,HNL,7386\nITO,KOA,299\nITO,OGG,366\nIYK,BFL,1\nIYK,LAX,956\nIYK,PSP,1\nJAC,ATL,118\nJAC,CVG,13\nJAC,DEN,1443\nJAC,DFW,214\nJAC,IDA,1\nJAC,LAX,15\nJAC,MSP,117\nJAC,ORD,360\nJAC,SLC,1485\nJAN,ATL,2704\nJAN,BWI,666\nJAN,CVG,121\nJAN,DCA,293\nJAN,DFW,2605\nJAN,DTW,689\nJAN,EWR,121\nJAN,HOU,1345\nJAN,IAH,1721\nJAN,MCO,381\nJAN,MDW,677\nJAN,MEM,1075\nJAN,ORD,211\nJAX,ATL,5656\nJAX,AUS,229\nJAX,BHM,366\nJAX,BNA,1373\nJAX,BOS,652\nJAX,BWI,1066\nJAX,CLE,144\nJAX,CLT,2520\nJAX,CVG,1110\nJAX,DCA,896\nJAX,DEN,118\nJAX,DFW,1366\nJAX,DTW,508\nJAX,EWR,1581\nJAX,FLL,1809\nJAX,HOU,366\nJAX,IAD,743\nJAX,IAH,1541\nJAX,IND,366\nJAX,JFK,1068\nJAX,LAS,236\nJAX,LAX,3\nJAX,LGA,1294\nJAX,MCI,226\nJAX,MEM,871\nJAX,MIA,218\nJAX,MSP,200\nJAX,MSY,470\nJAX,ORD,1704\nJAX,ORF,712\nJAX,PHL,1657\nJAX,PIR,2\nJAX,RDU,596\nJAX,TPA,1017\nJAX,TYS,1\nJFK,ACK,234\nJFK,ALB,364\nJFK,ATL,2279\nJFK,AUS,1356\nJFK,BDL,631\nJFK,BGR,338\nJFK,BNA,463\nJFK,BOS,7513\nJFK,BQN,661\nJFK,BTV,2207\nJFK,BUF,3674\nJFK,BUR,1366\nJFK,BWI,1123\nJFK,CHS,1\nJFK,CLE,1392\nJFK,CLT,1833\nJFK,CMH,571\nJFK,CVG,1346\nJFK,DCA,2941\nJFK,DEN,1082\nJFK,DFW,834\nJFK,DTW,1848\nJFK,EGE,14\nJFK,FLL,4696\nJFK,HDN,13\nJFK,HOU,943\nJFK,HPN,1\nJFK,IAD,2299\nJFK,IAH,972\nJFK,IND,125\nJFK,JAX,1067\nJFK,LAS,4471\nJFK,LAX,8078\nJFK,LGA,2\nJFK,LGB,1541\nJFK,MCO,5373\nJFK,MIA,2737\nJFK,MSP,1441\nJFK,MSY,1070\nJFK,OAK,1177\nJFK,ONT,247\nJFK,ORD,3672\nJFK,ORF,277\nJFK,PBI,2534\nJFK,PDX,680\nJFK,PHL,587\nJFK,PHX,2254\nJFK,PIT,2244\nJFK,PSE,346\nJFK,PVD,603\nJFK,PWM,1824\nJFK,RDU,4149\nJFK,RIC,1694\nJFK,ROC,2425\nJFK,RSW,1893\nJFK,SAN,1630\nJFK,SEA,1855\nJFK,SFO,6591\nJFK,SJC,480\nJFK,SJU,3565\nJFK,SLC,1795\nJFK,SMF,341\nJFK,SRQ,534\nJFK,STL,795\nJFK,STT,366\nJFK,SYR,1824\nJFK,TPA,3390\nJFK,TUS,132\nJNU,ANC,1163\nJNU,GST,85\nJNU,KTN,364\nJNU,PSG,363\nJNU,SEA,1209\nJNU,SIT,863\nJNU,YAK,363\nKOA,DEN,45\nKOA,HNL,9038\nKOA,LAX,1040\nKOA,LIH,55\nKOA,OAK,4\nKOA,OGG,793\nKOA,ORD,221\nKOA,PHX,330\nKOA,SAN,23\nKOA,SEA,411\nKOA,SFO,713\nKOA,SNA,37\nKTN,JNU,362\nKTN,SEA,1289\nKTN,SIT,365\nKTN,WRG,364\nLAN,CVG,486\nLAN,DTW,1641\nLAN,MSP,157\nLAN,ORD,1409\nLAS,ABQ,2408\nLAS,ALB,366\nLAS,AMA,367\nLAS,ANC,238\nLAS,ATL,4761\nLAS,AUS,1232\nLAS,BDL,366\nLAS,BFL,102\nLAS,BHM,366\nLAS,BMI,51\nLAS,BNA,1201\nLAS,BOI,755\nLAS,BOS,1383\nLAS,BUF,588\nLAS,BUR,5154\nLAS,BWI,1628\nLAS,CAK,43\nLAS,CLE,1667\nLAS,CLT,1730\nLAS,CMH,1351\nLAS,COS,98\nLAS,CVG,920\nLAS,DAY,42\nLAS,DCA,366\nLAS,DEN,8165\nLAS,DFW,4959\nLAS,DTW,2036\nLAS,ELP,1042\nLAS,EUG,162\nLAS,EWR,2341\nLAS,FAT,2101\nLAS,FLL,677\nLAS,FNT,91\nLAS,GEG,753\nLAS,HNL,732\nLAS,HOU,1461\nLAS,IAD,1625\nLAS,IAH,2678\nLAS,IND,1674\nLAS,ISP,366\nLAS,JAX,236\nLAS,JFK,4481\nLAS,LAX,11729\nLAS,LBB,366\nLAS,LGB,854\nLAS,LIT,382\nLAS,MAF,366\nLAS,MCI,1913\nLAS,MCO,1076\nLAS,MDW,3836\nLAS,MEM,373\nLAS,MFR,139\nLAS,MHT,365\nLAS,MIA,787\nLAS,MKE,530\nLAS,MLI,50\nLAS,MRY,14\nLAS,MSP,2464\nLAS,MSY,726\nLAS,OAK,4693\nLAS,OKC,471\nLAS,OMA,1088\nLAS,ONT,3501\nLAS,ORD,5235\nLAS,ORF,365\nLAS,PBI,62\nLAS,PDX,3568\nLAS,PHL,2829\nLAS,PHX,10626\nLAS,PIT,1411\nLAS,PSP,1280\nLAS,PVD,365\nLAS,RDU,724\nLAS,RNO,4492\nLAS,ROC,83\nLAS,SAN,5895\nLAS,SAT,1573\nLAS,SBA,305\nLAS,SBP,128\nLAS,SDF,366\nLAS,SEA,5065\nLAS,SFO,6994\nLAS,SJC,4148\nLAS,SLC,5378\nLAS,SMF,4054\nLAS,SNA,4115\nLAS,STL,1647\nLAS,TPA,1175\nLAS,TUL,390\nLAS,TUS,2018\nLAS,YUM,99\nLAW,ATL,543\nLAW,DFW,1826\nLAX,ABQ,2415\nLAX,ANC,239\nLAX,ASE,324\nLAX,ATL,5402\nLAX,AUS,1732\nLAX,BDL,132\nLAX,BFL,902\nLAX,BNA,1418\nLAX,BOI,985\nLAX,BOS,2441\nLAX,BWI,897\nLAX,BZN,13\nLAX,CLD,2258\nLAX,CLE,1053\nLAX,CLT,1460\nLAX,CMH,49\nLAX,COS,994\nLAX,CVG,1144\nLAX,DCA,366\nLAX,DEN,8894\nLAX,DFW,6571\nLAX,DSM,177\nLAX,DTW,1972\nLAX,EGE,107\nLAX,ELP,1076\nLAX,EUG,305\nLAX,EWR,3249\nLAX,FAT,4045\nLAX,FLL,373\nLAX,GEG,428\nLAX,GJT,8\nLAX,HNL,4964\nLAX,HOU,1426\nLAX,IAD,3836\nLAX,IAH,3849\nLAX,ICT,186\nLAX,IND,548\nLAX,IPL,660\nLAX,IYK,954\nLAX,JAC,15\nLAX,JAX,2\nLAX,JFK,8058\nLAX,KOA,1038\nLAX,LAS,11773\nLAX,LIH,1067\nLAX,MCI,1338\nLAX,MCO,1725\nLAX,MDW,2388\nLAX,MEM,729\nLAX,MFR,1\nLAX,MIA,2495\nLAX,MKE,355\nLAX,MOD,659\nLAX,MRY,2763\nLAX,MSP,2392\nLAX,MSY,930\nLAX,MTJ,18\nLAX,OAK,7583\nLAX,OGG,2054\nLAX,OKC,501\nLAX,ONT,24\nLAX,ORD,7333\nLAX,OXR,1291\nLAX,PDX,3503\nLAX,PHL,2246\nLAX,PHX,9897\nLAX,PIT,373\nLAX,PSP,2596\nLAX,RDU,8\nLAX,RNO,1898\nLAX,RSW,1\nLAX,SAN,11257\nLAX,SAT,1781\nLAX,SBA,4554\nLAX,SBP,2684\nLAX,SEA,6876\nLAX,SFO,13390\nLAX,SGU,722\nLAX,SJC,8908\nLAX,SJU,144\nLAX,SLC,5178\nLAX,SMF,5692\nLAX,SMX,1679\nLAX,SNA,32\nLAX,STL,1686\nLAX,TPA,516\nLAX,TUL,73\nLAX,TUS,4141\nLAX,XNA,359\nLAX,YUM,1030\nLBB,ABQ,366\nLBB,AUS,690\nLBB,DAL,2679\nLBB,DFW,3015\nLBB,ELP,364\nLBB,IAH,769\nLBB,LAS,366\nLCH,IAH,1000\nLEX,ATL,2217\nLEX,CLE,14\nLEX,COS,1\nLEX,CVG,1539\nLEX,DAY,1\nLEX,DCA,304\nLEX,DFW,907\nLEX,DTW,1656\nLEX,EWR,390\nLEX,IAH,646\nLEX,LGA,411\nLEX,MCO,39\nLEX,MEM,252\nLEX,ORD,1967\nLFT,ATL,995\nLFT,DFW,1182\nLFT,IAH,2702\nLGA,AGS,7\nLGA,ATL,10507\nLGA,BHM,591\nLGA,BNA,1217\nLGA,BOS,12035\nLGA,CAE,609\nLGA,CAK,793\nLGA,CHS,1414\nLGA,CID,156\nLGA,CLE,2920\nLGA,CLT,4958\nLGA,CMH,2350\nLGA,CVG,3635\nLGA,DAB,159\nLGA,DCA,11063\nLGA,DEN,2970\nLGA,DFW,5372\nLGA,DSM,705\nLGA,DTW,4601\nLGA,EGE,16\nLGA,FLL,3152\nLGA,FNT,392\nLGA,GRR,363\nLGA,GSO,927\nLGA,GSP,609\nLGA,HDN,15\nLGA,HSV,69\nLGA,IAD,1103\nLGA,IAH,3418\nLGA,IND,1331\nLGA,JAX,1285\nLGA,LEX,415\nLGA,MCO,3158\nLGA,MEM,1605\nLGA,MIA,3586\nLGA,MKE,592\nLGA,MLB,2\nLGA,MSN,620\nLGA,MSP,2719\nLGA,MSY,512\nLGA,MYR,123\nLGA,ORD,10862\nLGA,PBI,1934\nLGA,PHF,770\nLGA,PHL,1\nLGA,PIT,1297\nLGA,RDU,4423\nLGA,RIC,1336\nLGA,RSW,238\nLGA,SAV,995\nLGA,SDF,571\nLGA,SLC,24\nLGA,SRQ,74\nLGA,STL,1604\nLGA,STT,9\nLGA,TPA,1464\nLGA,TVC,50\nLGA,TYS,642\nLGA,VPS,2\nLGA,XNA,765\nLGB,AUS,245\nLGB,BOS,789\nLGB,FAT,431\nLGB,FLL,332\nLGB,GEG,1\nLGB,IAD,756\nLGB,JFK,1544\nLGB,LAS,853\nLGB,MRY,436\nLGB,OAK,1631\nLGB,ONT,1\nLGB,ORD,600\nLGB,PDX,142\nLGB,PHX,1623\nLGB,RNO,459\nLGB,SEA,1499\nLGB,SFO,210\nLGB,SJC,661\nLGB,SLC,2500\nLGB,SMF,729\nLGB,TWF,1\nLIH,DEN,45\nLIH,HNL,10407\nLIH,KOA,54\nLIH,LAX,1069\nLIH,OGG,426\nLIH,PHX,280\nLIH,SAN,31\nLIH,SEA,366\nLIH,SFO,483\nLIH,SNA,23\nLIT,ATL,2526\nLIT,BWI,366\nLIT,CLT,39\nLIT,CVG,49\nLIT,DAL,2327\nLIT,DEN,118\nLIT,DFW,3245\nLIT,DTW,361\nLIT,EWR,331\nLIT,HOU,365\nLIT,IAH,1103\nLIT,LAS,382\nLIT,MCO,1\nLIT,MDW,383\nLIT,MEM,887\nLIT,MSP,157\nLIT,ORD,1806\nLIT,PHX,235\nLIT,SAT,1\nLIT,SLC,18\nLIT,STL,669\nLMT,MFR,1\nLMT,PDX,162\nLMT,SFO,348\nLNK,ABE,1\nLNK,CRW,1\nLNK,DEN,1204\nLNK,DTW,320\nLNK,LAN,1\nLNK,MSP,106\nLNK,ORD,1403\nLNK,PIA,1\nLRD,DFW,1401\nLRD,IAH,714\nLSE,MSP,434\nLSE,ORD,1571\nLWB,ATL,185\nLWS,BOI,1\nLWS,IDA,1\nLWS,SLC,650\nLYH,ATL,625\nMAF,ABQ,366\nMAF,AUS,471\nMAF,DAL,1995\nMAF,DFW,1778\nMAF,HOU,676\nMAF,IAH,1187\nMAF,LAS,366\nMBS,DTW,1460\nMBS,MSP,117\nMBS,ORD,1341\nMCI,ABQ,670\nMCI,ATL,4140\nMCI,AUS,459\nMCI,BNA,1317\nMCI,BWI,1025\nMCI,CLE,1219\nMCI,CLT,1182\nMCI,CMH,164\nMCI,COS,178\nMCI,CVG,1491\nMCI,DAL,3943\nMCI,DEN,5256\nMCI,DFW,2877\nMCI,DTW,1252\nMCI,EWR,1799\nMCI,FLL,60\nMCI,IAD,227\nMCI,IAH,2527\nMCI,ICT,1\nMCI,IND,1074\nMCI,JAX,229\nMCI,LAS,1926\nMCI,LAX,1331\nMCI,LNK,1\nMCI,MCO,1349\nMCI,MDW,3850\nMCI,MEM,1005\nMCI,MGM,1\nMCI,MIA,65\nMCI,MKE,3\nMCI,MSN,250\nMCI,MSP,2136\nMCI,MSY,462\nMCI,OAK,686\nMCI,OKC,1128\nMCI,OMA,3\nMCI,ONT,301\nMCI,ORD,3837\nMCI,PDX,366\nMCI,PHX,2165\nMCI,PIT,266\nMCI,RDU,652\nMCI,RSW,5\nMCI,SAN,689\nMCI,SAT,577\nMCI,SEA,365\nMCI,SLC,1054\nMCI,SMF,306\nMCI,STL,1763\nMCI,TPA,695\nMCI,TUL,810\nMCI,TUS,233\nMCN,ATL,652\nMCO,ABQ,726\nMCO,ALB,1040\nMCO,ATL,9611\nMCO,AUS,632\nMCO,AVL,47\nMCO,BDL,1758\nMCO,BHM,1214\nMCO,BMI,173\nMCO,BNA,1782\nMCO,BOS,3478\nMCO,BQN,492\nMCO,BTV,346\nMCO,BUF,1877\nMCO,BWI,4926\nMCO,CAK,371\nMCO,CLE,1909\nMCO,CLT,3276\nMCO,CMH,1165\nMCO,CVG,1304\nMCO,DAY,416\nMCO,DCA,1845\nMCO,DEN,2997\nMCO,DFW,4114\nMCO,DTW,3477\nMCO,EWR,4977\nMCO,EYW,35\nMCO,FLL,2074\nMCO,FNT,455\nMCO,GRR,128\nMCO,GSO,11\nMCO,GSP,90\nMCO,HOU,1758\nMCO,HPN,1484\nMCO,HSV,248\nMCO,IAD,4094\nMCO,IAH,2499\nMCO,IND,2306\nMCO,ISP,2110\nMCO,JAN,381\nMCO,JAX,2\nMCO,JFK,5371\nMCO,LAS,1077\nMCO,LAX,1725\nMCO,LEX,39\nMCO,LGA,3156\nMCO,LIT,1\nMCO,MCI,1349\nMCO,MDT,42\nMCO,MDW,3565\nMCO,MEM,1434\nMCO,MHT,1606\nMCO,MIA,2195\nMCO,MKE,831\nMCO,MLI,172\nMCO,MSP,1929\nMCO,MSY,1568\nMCO,OKC,9\nMCO,OMA,9\nMCO,ORD,3978\nMCO,ORF,755\nMCO,PBI,1\nMCO,PDX,237\nMCO,PFN,195\nMCO,PHF,362\nMCO,PHL,7034\nMCO,PHX,1038\nMCO,PIT,2465\nMCO,PNS,365\nMCO,PSE,347\nMCO,PVD,2149\nMCO,PWM,460\nMCO,RDU,1655\nMCO,RIC,517\nMCO,ROC,701\nMCO,RSW,1414\nMCO,SAN,13\nMCO,SAT,744\nMCO,SDF,533\nMCO,SEA,731\nMCO,SFO,366\nMCO,SJU,2420\nMCO,SLC,685\nMCO,STL,2422\nMCO,SWF,834\nMCO,SYR,390\nMCO,TLH,219\nMCO,TPA,1\nMCO,TUL,9\nMCO,TYS,126\nMDT,ATL,1789\nMDT,AVP,1\nMDT,BWI,1\nMDT,CLE,58\nMDT,CLT,1144\nMDT,CVG,1008\nMDT,DCA,1\nMDT,DFW,274\nMDT,DTW,542\nMDT,IAD,937\nMDT,LGA,2\nMDT,MCO,42\nMDT,MSP,197\nMDT,ORD,1598\nMDW,ABQ,730\nMDW,ALB,729\nMDW,ATL,3257\nMDW,AUS,713\nMDW,BDL,1052\nMDW,BHM,726\nMDW,BNA,3016\nMDW,BOS,345\nMDW,BUF,1278\nMDW,BWI,2776\nMDW,CLE,2556\nMDW,CLT,13\nMDW,CMH,2644\nMDW,DEN,4325\nMDW,DTW,3070\nMDW,EWR,278\nMDW,FLL,1621\nMDW,HOU,2052\nMDW,IAD,2065\nMDW,IND,1314\nMDW,ISP,1422\nMDW,JAN,682\nMDW,LAS,3832\nMDW,LAX,2390\nMDW,LIT,383\nMDW,MCI,3885\nMDW,MCO,3568\nMDW,MHT,1649\nMDW,MIA,133\nMDW,MSP,1476\nMDW,MSY,391\nMDW,OAK,1719\nMDW,OMA,2047\nMDW,ORF,731\nMDW,PDX,891\nMDW,PHL,2664\nMDW,PHX,2800\nMDW,PIT,2037\nMDW,PVD,1380\nMDW,RDU,1353\nMDW,RNO,365\nMDW,RSW,1095\nMDW,SAN,1708\nMDW,SAT,700\nMDW,SDF,1690\nMDW,SEA,1331\nMDW,SFO,1083\nMDW,SJC,658\nMDW,SLC,1003\nMDW,SMF,686\nMDW,SRQ,565\nMDW,STL,3784\nMDW,TPA,2231\nMDW,TUS,727\nMEI,ATL,674\nMEM,ATL,4870\nMEM,AUS,835\nMEM,BDL,49\nMEM,BHM,891\nMEM,BNA,1024\nMEM,BOS,199\nMEM,BTR,998\nMEM,BWI,783\nMEM,CAE,706\nMEM,CHA,629\nMEM,CHS,709\nMEM,CLE,1205\nMEM,CLT,2576\nMEM,CMH,1072\nMEM,COS,117\nMEM,CVG,1225\nMEM,DCA,1043\nMEM,DEN,1731\nMEM,DFW,2458\nMEM,DSM,813\nMEM,DTW,2205\nMEM,EVV,904\nMEM,EWR,1170\nMEM,FLL,479\nMEM,FSM,479\nMEM,GPT,1088\nMEM,GRR,362\nMEM,GSO,1043\nMEM,GSP,1088\nMEM,HSV,1083\nMEM,IAH,3079\nMEM,ICT,1093\nMEM,IND,1058\nMEM,JAN,1082\nMEM,JAX,871\nMEM,LAS,372\nMEM,LAX,1095\nMEM,LEX,252\nMEM,LGA,1608\nMEM,LIT,886\nMEM,MCI,981\nMEM,MCO,1432\nMEM,MGM,1091\nMEM,MIA,785\nMEM,MKE,744\nMEM,MLI,668\nMEM,MOB,1094\nMEM,MSN,359\nMEM,MSP,2845\nMEM,MSY,1004\nMEM,OKC,940\nMEM,OMA,749\nMEM,ORD,3769\nMEM,ORF,241\nMEM,PFN,1095\nMEM,PHL,1039\nMEM,PHX,817\nMEM,PIT,1002\nMEM,PNS,1097\nMEM,RDU,1062\nMEM,RIC,292\nMEM,RSW,58\nMEM,SAN,109\nMEM,SAT,831\nMEM,SAV,765\nMEM,SDF,786\nMEM,SEA,349\nMEM,SFO,208\nMEM,SGF,1080\nMEM,SHV,1094\nMEM,SJU,26\nMEM,STL,1049\nMEM,TLH,1094\nMEM,TPA,861\nMEM,TRI,44\nMEM,TUL,1094\nMEM,TYS,1096\nMEM,VPS,1045\nMEM,XNA,1041\nMFE,ATL,10\nMFE,DFW,1441\nMFE,IAH,2665\nMFR,DEN,365\nMFR,LAS,139\nMFR,MOD,1\nMFR,OTH,1\nMFR,PDX,1543\nMFR,PHX,304\nMFR,RDD,1\nMFR,RDM,1\nMFR,SBA,1\nMFR,SFO,2571\nMFR,SLC,724\nMFR,TWF,1\nMGM,ATL,2514\nMGM,IAH,246\nMGM,MEM,1091\nMHT,ATL,696\nMHT,BOS,4\nMHT,BWI,3628\nMHT,CLE,1212\nMHT,CLT,723\nMHT,CVG,777\nMHT,DCA,288\nMHT,DTW,846\nMHT,EWR,1353\nMHT,FLL,246\nMHT,IAD,584\nMHT,LAS,366\nMHT,MCO,1605\nMHT,MDW,1643\nMHT,ORD,1145\nMHT,PHL,2365\nMHT,PHX,365\nMHT,TPA,742\nMIA,ATL,6623\nMIA,BDL,366\nMIA,BNA,731\nMIA,BOS,2193\nMIA,BWI,929\nMIA,CLE,399\nMIA,CLT,2970\nMIA,CMH,470\nMIA,CVG,1045\nMIA,DCA,2982\nMIA,DEN,809\nMIA,DFW,3346\nMIA,DTW,1228\nMIA,EGE,43\nMIA,EWR,2873\nMIA,FLL,1\nMIA,GSO,519\nMIA,IAD,574\nMIA,IAH,2734\nMIA,IND,211\nMIA,JAX,217\nMIA,JFK,2743\nMIA,LAS,787\nMIA,LAX,2494\nMIA,LGA,3587\nMIA,MCI,65\nMIA,MCO,2195\nMIA,MDW,133\nMIA,MEM,785\nMIA,MSP,907\nMIA,MSY,1098\nMIA,ORD,3343\nMIA,ORF,152\nMIA,PHL,2203\nMIA,PHX,366\nMIA,PIT,174\nMIA,RDU,1098\nMIA,RIC,151\nMIA,SDF,365\nMIA,SEA,366\nMIA,SFO,1097\nMIA,SJU,2559\nMIA,STL,732\nMIA,STT,732\nMIA,STX,349\nMIA,TLH,832\nMIA,TPA,1829\nMIA,XNA,154\nMKE,ABE,1\nMKE,ATL,3606\nMKE,ATW,1030\nMKE,AVP,1\nMKE,BDL,539\nMKE,BHM,1\nMKE,BNA,771\nMKE,BOS,208\nMKE,BWI,1293\nMKE,CLE,2226\nMKE,CLT,245\nMKE,CMH,1054\nMKE,CVG,840\nMKE,CWA,285\nMKE,DAY,608\nMKE,DCA,122\nMKE,DEN,1449\nMKE,DFW,747\nMKE,DSM,723\nMKE,DTW,1905\nMKE,EWR,2524\nMKE,FAR,1\nMKE,FLL,43\nMKE,FNT,839\nMKE,GRB,774\nMKE,GRR,1244\nMKE,IAH,1671\nMKE,IND,738\nMKE,LAS,531\nMKE,LAX,355\nMKE,LGA,590\nMKE,MCI,2\nMKE,MCO,830\nMKE,MEM,734\nMKE,MKG,264\nMKE,MQT,357\nMKE,MSN,1294\nMKE,MSP,3464\nMKE,OMA,703\nMKE,ORD,3541\nMKE,PHL,775\nMKE,PHX,867\nMKE,PIT,1082\nMKE,RDU,490\nMKE,RSW,226\nMKE,SAN,106\nMKE,SDF,258\nMKE,SEA,122\nMKE,SFO,115\nMKE,SLC,6\nMKE,STL,320\nMKE,TPA,178\nMKE,TUS,2\nMKG,FNT,109\nMKG,GRR,24\nMKG,MKE,263\nMLB,ATL,2000\nMLB,LGA,2\nMLI,ATL,2592\nMLI,DEN,719\nMLI,DFW,587\nMLI,DTW,755\nMLI,LAS,51\nMLI,MCO,172\nMLI,MEM,669\nMLI,MSP,442\nMLI,ORD,2580\nMLU,ATL,983\nMLU,DFW,966\nMLU,IAH,581\nMOB,ATL,2225\nMOB,DFW,1399\nMOB,IAH,1420\nMOB,MEM,1094\nMOB,ORD,210\nMOD,BFL,1\nMOD,LAX,679\nMOD,ONT,1\nMOD,RNO,1\nMOD,SFO,1643\nMOT,MSP,1085\nMQT,GRB,322\nMQT,MKE,356\nMQT,ORD,313\nMRY,DEN,365\nMRY,LAS,14\nMRY,LAX,2758\nMRY,LGB,435\nMRY,ONT,246\nMRY,PHX,910\nMRY,SAN,445\nMRY,SFO,2428\nMRY,SLC,6\nMSN,ATL,384\nMSN,ATW,1\nMSN,CLE,317\nMSN,CVG,259\nMSN,DCA,287\nMSN,DEN,943\nMSN,DFW,947\nMSN,DSM,1\nMSN,DTW,1603\nMSN,EWR,313\nMSN,LGA,622\nMSN,MCI,249\nMSN,MEM,359\nMSN,MKE,1293\nMSN,MSP,1439\nMSN,ORD,4943\nMSN,RFD,1\nMSO,DEN,1107\nMSO,MSP,189\nMSO,ORD,105\nMSO,PIH,2\nMSO,SFO,12\nMSO,SLC,1841\nMSP,ABQ,677\nMSP,ALB,57\nMSP,ALO,323\nMSP,ANC,826\nMSP,ATL,5369\nMSP,ATW,89\nMSP,AUS,54\nMSP,AVL,364\nMSP,AZO,246\nMSP,BDL,933\nMSP,BGR,11\nMSP,BIL,820\nMSP,BIS,1052\nMSP,BJI,74\nMSP,BNA,781\nMSP,BOI,807\nMSP,BOS,1563\nMSP,BTV,75\nMSP,BUF,229\nMSP,BWI,1017\nMSP,BZN,878\nMSP,CHS,27\nMSP,CID,412\nMSP,CLE,1876\nMSP,CLT,1814\nMSP,CMH,1076\nMSP,CMX,318\nMSP,COS,449\nMSP,CPR,31\nMSP,CVG,1760\nMSP,CWA,13\nMSP,DAY,692\nMSP,DCA,2194\nMSP,DEN,5374\nMSP,DFW,2851\nMSP,DLH,1290\nMSP,DSM,929\nMSP,DTW,5459\nMSP,EGE,112\nMSP,EWR,3144\nMSP,FAI,205\nMSP,FAR,1744\nMSP,FCA,209\nMSP,FLL,475\nMSP,FNT,355\nMSP,FSD,1925\nMSP,FWA,242\nMSP,GEG,826\nMSP,GFK,1371\nMSP,GRB,1408\nMSP,GRR,1645\nMSP,GSO,365\nMSP,GTF,195\nMSP,HDN,112\nMSP,HLN,365\nMSP,HNL,366\nMSP,IAD,710\nMSP,IAH,2451\nMSP,ICT,714\nMSP,IDA,336\nMSP,IND,1661\nMSP,INL,72\nMSP,JAC,117\nMSP,JAX,201\nMSP,JFK,1441\nMSP,LAN,157\nMSP,LAS,2461\nMSP,LAX,2389\nMSP,LGA,2723\nMSP,LIT,157\nMSP,LNK,106\nMSP,LSE,433\nMSP,MBS,109\nMSP,MCI,1976\nMSP,MCO,1931\nMSP,MDT,197\nMSP,MDW,1367\nMSP,MEM,2551\nMSP,MIA,908\nMSP,MKE,3619\nMSP,MLI,450\nMSP,MOT,1085\nMSP,MSN,1438\nMSP,MSO,189\nMSP,MYR,27\nMSP,OKC,542\nMSP,OMA,1177\nMSP,ORD,9356\nMSP,ORF,122\nMSP,PDX,1501\nMSP,PHL,1709\nMSP,PHX,3515\nMSP,PIR,3\nMSP,PIT,1006\nMSP,PSP,214\nMSP,PVD,6\nMSP,PWM,42\nMSP,RAP,877\nMSP,RDU,726\nMSP,RHI,221\nMSP,RIC,339\nMSP,ROC,134\nMSP,RST,881\nMSP,RSW,647\nMSP,SAN,1330\nMSP,SAT,190\nMSP,SAV,27\nMSP,SBN,365\nMSP,SDF,707\nMSP,SEA,2475\nMSP,SFO,1909\nMSP,SGF,359\nMSP,SJC,693\nMSP,SJU,26\nMSP,SLC,2197\nMSP,SMF,809\nMSP,SNA,1037\nMSP,SPI,1\nMSP,STL,1626\nMSP,SUX,121\nMSP,TPA,1005\nMSP,TUL,717\nMSP,TUS,439\nMSP,TVC,346\nMSP,TYS,365\nMSP,XNA,677\nMSY,ATL,4695\nMSY,AUS,443\nMSY,BHM,1012\nMSY,BNA,1010\nMSY,BOS,254\nMSY,BWI,391\nMSY,CLE,54\nMSY,CLT,1504\nMSY,CMH,1\nMSY,CVG,193\nMSY,DAL,2079\nMSY,DCA,430\nMSY,DEN,1176\nMSY,DFW,2501\nMSY,DTW,53\nMSY,EWR,1129\nMSY,FLL,594\nMSY,HOU,3737\nMSY,IAD,457\nMSY,IAH,4257\nMSY,IND,10\nMSY,JAX,472\nMSY,JFK,1070\nMSY,LAS,727\nMSY,LAX,928\nMSY,LGA,511\nMSY,MCI,461\nMSY,MCO,1566\nMSY,MDW,390\nMSY,MEM,1003\nMSY,MIA,1097\nMSY,MSP,16\nMSY,OKC,1\nMSY,ORD,1458\nMSY,PHL,1046\nMSY,PHX,365\nMSY,RDU,472\nMSY,SAT,432\nMSY,SLC,329\nMSY,TPA,1097\nMSY,TWF,1\nMTJ,ATL,37\nMTJ,DEN,1591\nMTJ,DFW,232\nMTJ,EWR,21\nMTJ,IAH,261\nMTJ,LAX,18\nMTJ,ORD,30\nMTJ,SLC,229\nMYR,ATL,1854\nMYR,BOS,45\nMYR,CLT,2216\nMYR,CVG,13\nMYR,DTW,287\nMYR,EWR,234\nMYR,IAD,533\nMYR,ILM,1\nMYR,LGA,124\nMYR,MSP,27\nMYR,PHL,1\nOAJ,ATL,1178\nOAJ,CLT,6\nOAK,ABQ,1004\nOAK,ATL,88\nOAK,AUS,236\nOAK,BNA,363\nOAK,BOI,667\nOAK,BOS,518\nOAK,BUR,5420\nOAK,DEN,3101\nOAK,DFW,725\nOAK,FLL,13\nOAK,GEG,726\nOAK,HNL,121\nOAK,HOU,711\nOAK,IAD,841\nOAK,IAH,721\nOAK,JFK,1177\nOAK,KOA,4\nOAK,LAS,4642\nOAK,LAX,7578\nOAK,LGB,1632\nOAK,MCI,684\nOAK,MDW,1720\nOAK,OGG,60\nOAK,ONT,3701\nOAK,ORD,59\nOAK,PDX,2482\nOAK,PHX,4213\nOAK,RNO,1331\nOAK,SAN,5851\nOAK,SEA,5047\nOAK,SLC,3146\nOAK,SMF,1\nOAK,SNA,3645\nOAK,TUS,307\nOGG,ANC,27\nOGG,DEN,163\nOGG,DFW,366\nOGG,HNL,12383\nOGG,ITO,366\nOGG,KOA,1379\nOGG,LAX,2058\nOGG,LIH,60\nOGG,OAK,60\nOGG,PDX,366\nOGG,PHX,586\nOGG,SAN,280\nOGG,SEA,533\nOGG,SFO,932\nOGG,SLC,261\nOGG,SMF,60\nOGG,SNA,60\nOKC,ABQ,231\nOKC,ATL,1884\nOKC,AUS,87\nOKC,BMI,1\nOKC,BWI,366\nOKC,CLE,21\nOKC,CVG,769\nOKC,DAL,1687\nOKC,DEN,2848\nOKC,DFW,2845\nOKC,DTW,604\nOKC,EWR,361\nOKC,HOU,1353\nOKC,IAD,5\nOKC,IAH,2635\nOKC,LAS,471\nOKC,LAX,500\nOKC,MCI,1144\nOKC,MCO,9\nOKC,MEM,883\nOKC,MSP,617\nOKC,ONT,231\nOKC,ORD,2038\nOKC,PHX,1513\nOKC,SAN,302\nOKC,SAT,89\nOKC,SLC,743\nOKC,SMF,226\nOKC,STL,688\nOKC,TUL,1\nOMA,ABQ,1\nOMA,ATL,1731\nOMA,ATW,1\nOMA,BHM,1\nOMA,CLE,428\nOMA,COS,1\nOMA,CVG,1002\nOMA,DEN,3231\nOMA,DFW,1748\nOMA,DSM,1\nOMA,DTW,1324\nOMA,EWR,1080\nOMA,GRB,1\nOMA,IAH,2099\nOMA,LAS,1083\nOMA,LNK,1\nOMA,MCO,9\nOMA,MDW,2045\nOMA,MEM,763\nOMA,MKE,701\nOMA,MSP,1163\nOMA,ONT,304\nOMA,ORD,4045\nOMA,PHX,2067\nOMA,SAN,314\nOMA,SLC,609\nOMA,STL,1033\nOMA,TUS,221\nOME,ANC,729\nOME,OTZ,361\nONT,ABQ,443\nONT,ATL,797\nONT,AUS,304\nONT,BNA,365\nONT,BOI,471\nONT,COS,458\nONT,DEN,1544\nONT,DFW,1742\nONT,ELP,382\nONT,FAT,238\nONT,GEG,440\nONT,GJT,1\nONT,IAH,1093\nONT,JFK,248\nONT,LAS,3494\nONT,LAX,24\nONT,MCI,302\nONT,MRY,246\nONT,OAK,3697\nONT,OKC,231\nONT,OMA,303\nONT,PDX,60\nONT,PHX,5628\nONT,RNO,273\nONT,SAN,2\nONT,SAT,439\nONT,SEA,1343\nONT,SFO,1599\nONT,SJC,2742\nONT,SLC,1658\nONT,SMF,3803\nONT,TUL,228\nONT,TUS,474\nORD,ABE,1426\nORD,ABQ,754\nORD,ALB,1632\nORD,ANC,561\nORD,ASE,310\nORD,ATL,7449\nORD,ATW,2288\nORD,AUS,2515\nORD,AVP,718\nORD,AZO,2350\nORD,BDL,3335\nORD,BHM,1511\nORD,BIL,105\nORD,BMI,2005\nORD,BNA,3905\nORD,BOI,786\nORD,BOS,7133\nORD,BTR,215\nORD,BTV,738\nORD,BUF,3437\nORD,BWI,3552\nORD,BZN,336\nORD,CAE,1373\nORD,CAK,1047\nORD,CHA,767\nORD,CHS,1337\nORD,CID,4154\nORD,CLE,4567\nORD,CLT,6013\nORD,CMH,4664\nORD,CMI,2404\nORD,COS,1525\nORD,CPR,134\nORD,CRW,708\nORD,CVG,5993\nORD,CWA,1715\nORD,DAL,1007\nORD,DAY,1786\nORD,DBQ,1347\nORD,DCA,7430\nORD,DEN,5773\nORD,DFW,8093\nORD,DSM,4823\nORD,DTW,7602\nORD,EGE,197\nORD,ELP,670\nORD,EVV,1944\nORD,EWR,7174\nORD,FAR,1344\nORD,FCA,104\nORD,FLL,1583\nORD,FNT,1265\nORD,FSD,1724\nORD,FWA,2956\nORD,GEG,327\nORD,GJT,13\nORD,GPT,214\nORD,GRB,3631\nORD,GRR,3699\nORD,GSO,870\nORD,GSP,1302\nORD,GTF,23\nORD,GUC,2\nORD,HDN,200\nORD,HNL,641\nORD,HPN,3624\nORD,HSV,547\nORD,IAD,2891\nORD,IAH,5463\nORD,ICT,3001\nORD,IND,4103\nORD,JAC,463\nORD,JAN,211\nORD,JAX,1697\nORD,JFK,3684\nORD,LAN,1409\nORD,LAS,5257\nORD,LAX,6974\nORD,LEX,1965\nORD,LGA,10770\nORD,LGB,604\nORD,LIT,1806\nORD,LNK,1407\nORD,LSE,1572\nORD,MBS,1339\nORD,MCI,3900\nORD,MCO,3798\nORD,MDT,1552\nORD,MEM,3782\nORD,MHT,1144\nORD,MIA,3343\nORD,MKE,3400\nORD,MLI,2579\nORD,MOB,210\nORD,MQT,313\nORD,MSN,4878\nORD,MSO,105\nORD,MSP,9688\nORD,MSY,1502\nORD,MTJ,30\nORD,OAK,59\nORD,OGG,221\nORD,OKC,1937\nORD,OMA,4097\nORD,ORF,1188\nORD,PBI,656\nORD,PDX,2394\nORD,PHL,6733\nORD,PHX,5124\nORD,PIA,3256\nORD,PIT,3611\nORD,PNS,292\nORD,PSP,451\nORD,PVD,1789\nORD,PWM,343\nORD,RAP,218\nORD,RDU,3140\nORD,RIC,1884\nORD,RNO,365\nORD,ROA,555\nORD,ROC,2550\nORD,RST,2366\nORD,RSW,764\nORD,SAN,3308\nORD,SAT,1713\nORD,SAV,1132\nORD,SBN,2266\nORD,SDF,3496\nORD,SEA,4802\nORD,SFO,5524\nORD,SGF,2306\nORD,SHV,211\nORD,SJC,1333\nORD,SJU,1036\nORD,SLC,2860\nORD,SMF,1077\nORD,SNA,2580\nORD,SPI,1085\nORD,STL,4558\nORD,STT,80\nORD,SYR,2314\nORD,TOL,1337\nORD,TPA,2443\nORD,TUL,2040\nORD,TUS,865\nORD,TVC,2435\nORD,TYS,2017\nORD,VPS,236\nORD,XNA,3116\nORF,ATL,2784\nORF,BDL,1\nORF,BNA,236\nORF,BOI,1\nORF,BOS,197\nORF,BWI,1675\nORF,CLE,2\nORF,CLT,1836\nORF,CVG,499\nORF,DFW,1035\nORF,DTW,968\nORF,EWR,380\nORF,IAD,1057\nORF,IAH,969\nORF,JAX,719\nORF,JFK,277\nORF,LAS,366\nORF,MCO,753\nORF,MDW,731\nORF,MEM,240\nORF,MIA,152\nORF,MSP,123\nORF,ORD,1089\nORF,PBI,1\nORF,SAV,1\nORF,TPA,366\nOTH,PDX,162\nOTH,SFO,353\nOTZ,ANC,361\nOTZ,OME,725\nOXR,LAX,1291\nOXR,PSP,1\nPBI,ATL,4262\nPBI,BDL,373\nPBI,BOS,1746\nPBI,BWI,1353\nPBI,CLE,383\nPBI,CLT,1871\nPBI,CMH,5\nPBI,CVG,390\nPBI,DCA,909\nPBI,DEN,95\nPBI,DFW,854\nPBI,DTW,472\nPBI,EWR,2770\nPBI,HPN,1046\nPBI,IAD,14\nPBI,IAH,1389\nPBI,ISP,1082\nPBI,JFK,2531\nPBI,LAS,62\nPBI,LGA,1934\nPBI,ORD,654\nPBI,PHL,1899\nPBI,PIT,4\nPBI,SWF,359\nPBI,TPA,1365\nPDX,ABQ,366\nPDX,ANC,576\nPDX,ATL,1102\nPDX,BOI,1038\nPDX,BOS,366\nPDX,BUR,60\nPDX,CLT,136\nPDX,CVG,311\nPDX,DEN,4654\nPDX,DFW,1577\nPDX,DTW,250\nPDX,EUG,1551\nPDX,EWR,692\nPDX,GEG,1311\nPDX,HNL,732\nPDX,IAD,367\nPDX,IAH,1265\nPDX,JFK,680\nPDX,LAS,3564\nPDX,LAX,3517\nPDX,LGB,141\nPDX,LMT,162\nPDX,MCI,366\nPDX,MCO,236\nPDX,MDW,894\nPDX,MFR,1543\nPDX,MSN,1\nPDX,MSP,1502\nPDX,OAK,2471\nPDX,OGG,366\nPDX,ONT,60\nPDX,ORD,2184\nPDX,OTH,162\nPDX,PHL,379\nPDX,PHX,3946\nPDX,PSP,168\nPDX,RDM,1621\nPDX,RNO,1150\nPDX,SAN,1352\nPDX,SEA,2449\nPDX,SFO,3088\nPDX,SJC,2322\nPDX,SLC,3277\nPDX,SMF,2484\nPDX,SNA,1421\nPFN,ATL,2548\nPFN,CVG,36\nPFN,MCO,196\nPFN,MEM,1095\nPHF,ATL,4157\nPHF,BOS,716\nPHF,FLL,310\nPHF,LGA,767\nPHF,MCO,361\nPHF,TPA,95\nPHL,ALB,448\nPHL,ATL,6918\nPHL,ATW,1\nPHL,AUS,290\nPHL,AVP,1\nPHL,BDL,521\nPHL,BNA,981\nPHL,BOS,6384\nPHL,BUF,365\nPHL,BWI,660\nPHL,CLE,674\nPHL,CLT,3545\nPHL,CMH,994\nPHL,CVG,1583\nPHL,DCA,584\nPHL,DEN,2961\nPHL,DFW,3485\nPHL,DTW,2760\nPHL,EWR,19\nPHL,FLL,2977\nPHL,GRR,1\nPHL,HOU,687\nPHL,IAD,607\nPHL,IAH,1732\nPHL,ICT,1\nPHL,IND,853\nPHL,JAX,1665\nPHL,JFK,675\nPHL,LAS,2836\nPHL,LAX,2240\nPHL,LGA,4\nPHL,MCO,7032\nPHL,MDW,2652\nPHL,MEM,1032\nPHL,MHT,2357\nPHL,MIA,2206\nPHL,MKE,774\nPHL,MSP,1749\nPHL,MSY,1107\nPHL,ORD,7078\nPHL,ORF,292\nPHL,PBI,1903\nPHL,PDX,380\nPHL,PHX,2885\nPHL,PIT,3188\nPHL,PVD,2550\nPHL,RDU,3347\nPHL,RIC,387\nPHL,RSW,1223\nPHL,SAN,817\nPHL,SAT,290\nPHL,SDF,2\nPHL,SEA,708\nPHL,SFO,2237\nPHL,SJU,1474\nPHL,SLC,670\nPHL,SMF,207\nPHL,STL,578\nPHL,STT,198\nPHL,SYR,334\nPHL,TPA,3390\nPHX,ABQ,5234\nPHX,ANC,366\nPHX,ASE,109\nPHX,ATL,4607\nPHX,AUS,2786\nPHX,BDL,334\nPHX,BFL,1194\nPHX,BHM,367\nPHX,BNA,1123\nPHX,BOI,679\nPHX,BOS,1067\nPHX,BUF,365\nPHX,BUR,4754\nPHX,BWI,2103\nPHX,CLD,43\nPHX,CLE,1115\nPHX,CLT,2183\nPHX,CMH,1096\nPHX,COS,1392\nPHX,CVG,463\nPHX,DCA,1080\nPHX,DEN,8402\nPHX,DFW,5387\nPHX,DRO,811\nPHX,DSM,749\nPHX,DTW,2929\nPHX,ELP,4155\nPHX,EUG,371\nPHX,EWR,2579\nPHX,FAT,1618\nPHX,FLG,1871\nPHX,FLL,620\nPHX,GEG,777\nPHX,GJT,1037\nPHX,HNL,914\nPHX,HOU,1677\nPHX,IAD,731\nPHX,IAH,4197\nPHX,ICT,692\nPHX,IND,1458\nPHX,JFK,2256\nPHX,KOA,330\nPHX,LAS,10337\nPHX,LAX,9992\nPHX,LGB,1624\nPHX,LIH,280\nPHX,LIT,235\nPHX,MCI,2140\nPHX,MCO,1039\nPHX,MDW,2795\nPHX,MEM,816\nPHX,MFR,303\nPHX,MHT,365\nPHX,MIA,366\nPHX,MKE,866\nPHX,MRY,911\nPHX,MSP,3508\nPHX,MSY,365\nPHX,OAK,4150\nPHX,OGG,586\nPHX,OKC,1516\nPHX,OMA,2060\nPHX,ONT,5627\nPHX,ORD,5130\nPHX,PDX,3948\nPHX,PHL,2883\nPHX,PIT,1086\nPHX,PSP,1752\nPHX,PVD,365\nPHX,RDU,755\nPHX,RNO,2776\nPHX,SAN,7609\nPHX,SAT,2783\nPHX,SBA,1618\nPHX,SBP,990\nPHX,SDF,365\nPHX,SEA,5072\nPHX,SFO,4884\nPHX,SJC,4050\nPHX,SLC,7177\nPHX,SMF,4134\nPHX,SNA,5497\nPHX,STL,2755\nPHX,TEX,194\nPHX,TPA,1022\nPHX,TUL,1015\nPHX,TUS,3684\nPHX,YUM,1962\nPIA,ATL,623\nPIA,DEN,362\nPIA,DFW,634\nPIA,DTW,701\nPIA,HPN,1\nPIA,LNK,1\nPIA,ORD,3259\nPIH,SLC,1659\nPIR,JAX,2\nPIR,MSP,3\nPIT,ATL,4557\nPIT,BOS,616\nPIT,BWI,1043\nPIT,CLT,2376\nPIT,CVG,1288\nPIT,DCA,7\nPIT,DEN,859\nPIT,DFW,2140\nPIT,DTW,1511\nPIT,EWR,671\nPIT,FLL,507\nPIT,GRB,1\nPIT,IAD,780\nPIT,IAH,1719\nPIT,JFK,2249\nPIT,LAS,1411\nPIT,LAX,373\nPIT,LGA,936\nPIT,MCI,266\nPIT,MCO,2470\nPIT,MDW,2070\nPIT,MEM,1005\nPIT,MIA,174\nPIT,MKE,1083\nPIT,MSP,1050\nPIT,ORD,3521\nPIT,PBI,4\nPIT,PHL,4169\nPIT,PHX,1086\nPIT,RSW,181\nPIT,SFO,369\nPIT,SJU,1\nPIT,SLC,218\nPIT,TPA,1089\nPLN,DCA,1\nPLN,DTW,263\nPMD,SFO,728\nPNS,ATL,4430\nPNS,CLT,372\nPNS,DFW,2024\nPNS,FLL,145\nPNS,IAH,635\nPNS,MCO,366\nPNS,MEM,1097\nPNS,ORD,293\nPNS,TPA,135\nPSC,DEN,940\nPSC,SLC,1600\nPSC,TWF,1\nPSE,EWR,17\nPSE,FLL,45\nPSE,JFK,346\nPSE,MCO,347\nPSG,JNU,364\nPSG,WRG,363\nPSP,DEN,998\nPSP,DFW,1096\nPSP,FAT,1\nPSP,GJT,1\nPSP,IAH,216\nPSP,LAS,1281\nPSP,LAX,2597\nPSP,MSP,214\nPSP,ONT,1\nPSP,ORD,452\nPSP,PDX,169\nPSP,PHX,1752\nPSP,SEA,664\nPSP,SFO,1638\nPSP,SLC,898\nPSP,TWF,1\nPUB,COS,2\nPVD,ATL,1390\nPVD,BDL,1\nPVD,BNA,366\nPVD,BOS,3\nPVD,BWI,3981\nPVD,CLE,360\nPVD,CLT,1439\nPVD,CVG,958\nPVD,DCA,672\nPVD,DTW,1105\nPVD,EWR,1102\nPVD,FLL,425\nPVD,IAD,511\nPVD,JFK,604\nPVD,LAS,364\nPVD,MCO,2148\nPVD,MDW,1373\nPVD,MSP,6\nPVD,ORD,1792\nPVD,PHL,2563\nPVD,PHX,365\nPVD,TPA,981\nPWM,ATL,904\nPWM,BOS,2\nPWM,BWI,995\nPWM,CLE,306\nPWM,CLT,277\nPWM,CVG,563\nPWM,DTW,67\nPWM,EWR,741\nPWM,IAD,407\nPWM,JFK,1818\nPWM,MCO,459\nPWM,MSP,42\nPWM,ORD,316\nRAP,DEN,2309\nRAP,MSP,877\nRAP,ORD,217\nRAP,SLC,757\nRAP,TWF,1\nRDD,SBA,1\nRDD,SFO,1680\nRDD,SMF,1\nRDM,DEN,12\nRDM,IDA,1\nRDM,PDX,1619\nRDM,SFO,1083\nRDM,SLC,719\nRDU,ATL,5418\nRDU,AUS,231\nRDU,BDL,1149\nRDU,BHM,160\nRDU,BNA,1617\nRDU,BOS,3870\nRDU,BWI,2078\nRDU,CLE,307\nRDU,CLT,2339\nRDU,CMH,500\nRDU,CVG,1317\nRDU,DCA,2772\nRDU,DEN,470\nRDU,DFW,2347\nRDU,DTW,1368\nRDU,EWR,2394\nRDU,FLL,696\nRDU,GRB,1\nRDU,IAD,1722\nRDU,IAH,1995\nRDU,IND,673\nRDU,JAX,595\nRDU,JFK,3989\nRDU,LAS,715\nRDU,LAX,8\nRDU,LGA,4135\nRDU,MCI,652\nRDU,MCO,1738\nRDU,MDW,1360\nRDU,MEM,1062\nRDU,MIA,1098\nRDU,MKE,490\nRDU,MSP,726\nRDU,MSY,474\nRDU,ORD,3094\nRDU,PHL,3363\nRDU,PHX,755\nRDU,SAT,229\nRDU,SDF,426\nRDU,SLC,327\nRDU,STL,358\nRDU,TPA,1057\nRDU,XNA,104\nRFD,DEN,290\nRHI,MSP,221\nRIC,ATL,4536\nRIC,BOS,688\nRIC,CLE,905\nRIC,CLT,1800\nRIC,CVG,779\nRIC,DCA,2\nRIC,DFW,1041\nRIC,DTW,700\nRIC,EWR,1576\nRIC,FLL,366\nRIC,IAH,971\nRIC,JAX,1\nRIC,JFK,1703\nRIC,LGA,1337\nRIC,MCO,515\nRIC,MEM,292\nRIC,MIA,152\nRIC,MSP,340\nRIC,ORD,1884\nRIC,ORF,1\nRIC,PHL,387\nRIC,RDU,1\nRKS,DEN,545\nRKS,GCC,58\nRKS,SLC,351\nRNO,ATL,169\nRNO,BOI,1025\nRNO,BUR,1\nRNO,DEN,1353\nRNO,DFW,1095\nRNO,GEG,214\nRNO,IAH,428\nRNO,LAS,4508\nRNO,LAX,1905\nRNO,LGB,464\nRNO,MDW,365\nRNO,OAK,1322\nRNO,ONT,273\nRNO,ORD,365\nRNO,PDX,1144\nRNO,PHX,2779\nRNO,PIH,1\nRNO,SAN,730\nRNO,SEA,799\nRNO,SFO,1886\nRNO,SJC,1364\nRNO,SLC,1814\nRNO,SNA,60\nRNO,TUS,222\nROA,ATL,1731\nROA,BWI,1\nROA,CLT,1\nROA,CVG,2\nROA,DTW,748\nROA,IAD,601\nROA,MSN,1\nROA,ORD,635\nROC,ATL,2488\nROC,BOS,1\nROC,BWI,865\nROC,CLE,921\nROC,CLT,412\nROC,CVG,724\nROC,DFW,177\nROC,DTW,864\nROC,EWR,933\nROC,FLL,114\nROC,IAD,560\nROC,JFK,2435\nROC,LAS,84\nROC,MCO,700\nROC,MSP,136\nROC,ORD,2484\nROC,TPA,366\nROW,DFW,961\nRST,DTW,171\nRST,MSP,817\nRST,ORD,2365\nRSW,ATL,4196\nRSW,BDL,134\nRSW,BOS,1716\nRSW,BUF,376\nRSW,BWI,1335\nRSW,CAK,138\nRSW,CLE,594\nRSW,CLT,1765\nRSW,CMH,137\nRSW,CVG,539\nRSW,DCA,708\nRSW,DEN,222\nRSW,DFW,919\nRSW,DTW,1144\nRSW,EWR,1874\nRSW,FNT,149\nRSW,HPN,520\nRSW,IAD,14\nRSW,IAH,1066\nRSW,IND,1057\nRSW,ISP,374\nRSW,JFK,1890\nRSW,LGA,237\nRSW,MCI,5\nRSW,MCO,1414\nRSW,MDW,1096\nRSW,MEM,58\nRSW,MIA,2\nRSW,MKE,225\nRSW,MSP,647\nRSW,ORD,763\nRSW,PBI,1\nRSW,PHL,1223\nRSW,PIT,181\nRSW,STL,417\nSAN,ABQ,1054\nSAN,ATL,2855\nSAN,AUS,715\nSAN,BFL,224\nSAN,BNA,727\nSAN,BOI,475\nSAN,BOS,610\nSAN,BWI,729\nSAN,CLE,87\nSAN,CLT,704\nSAN,COS,476\nSAN,CVG,573\nSAN,DEN,5263\nSAN,DFW,3528\nSAN,DTW,580\nSAN,ELP,366\nSAN,EWR,1180\nSAN,FAT,582\nSAN,GEG,452\nSAN,HNL,393\nSAN,HOU,422\nSAN,IAD,1331\nSAN,IAH,2388\nSAN,JFK,1630\nSAN,KOA,23\nSAN,LAS,5902\nSAN,LAX,11224\nSAN,LIH,31\nSAN,MCI,686\nSAN,MCO,13\nSAN,MDW,1708\nSAN,MEM,109\nSAN,MKE,106\nSAN,MRY,446\nSAN,MSP,1333\nSAN,OAK,5831\nSAN,OGG,279\nSAN,OKC,305\nSAN,OMA,317\nSAN,ONT,3\nSAN,ORD,2948\nSAN,PDX,1352\nSAN,PHL,817\nSAN,PHX,7581\nSAN,RNO,729\nSAN,SAT,643\nSAN,SEA,2831\nSAN,SFO,6769\nSAN,SJC,5286\nSAN,SLC,2549\nSAN,SMF,4603\nSAN,STL,366\nSAN,TUL,228\nSAN,TUS,1413\nSAT,ABQ,426\nSAT,AMA,1\nSAT,ATL,3241\nSAT,AUS,2\nSAT,BNA,676\nSAT,BWI,730\nSAT,CLE,233\nSAT,CLT,658\nSAT,CVG,882\nSAT,DAL,4999\nSAT,DEN,2510\nSAT,DFW,5413\nSAT,DTW,642\nSAT,ELP,1332\nSAT,EWR,954\nSAT,HOU,2582\nSAT,HRL,656\nSAT,IAD,149\nSAT,IAH,3755\nSAT,IND,236\nSAT,LAS,1575\nSAT,LAX,1783\nSAT,MCI,578\nSAT,MCO,744\nSAT,MDW,710\nSAT,MEM,788\nSAT,MGM,1\nSAT,MSP,191\nSAT,MSY,430\nSAT,OKC,87\nSAT,ONT,441\nSAT,ORD,1815\nSAT,PHL,290\nSAT,PHX,2767\nSAT,RDU,228\nSAT,SAN,646\nSAT,SFO,366\nSAT,SLC,587\nSAT,SMF,226\nSAT,STL,246\nSAT,TPA,365\nSAT,TUL,89\nSAT,TUS,240\nSAV,ATL,3888\nSAV,BOS,89\nSAV,CHS,1\nSAV,CLE,321\nSAV,CLT,1433\nSAV,CVG,731\nSAV,DFW,795\nSAV,DTW,509\nSAV,EWR,1127\nSAV,IAD,1007\nSAV,IAH,949\nSAV,JAX,3\nSAV,LGA,996\nSAV,MEM,764\nSAV,MSP,27\nSAV,ORD,1134\nSBA,DEN,840\nSBA,DFW,366\nSBA,LAS,305\nSBA,LAX,4498\nSBA,MRY,1\nSBA,PHX,1617\nSBA,SBP,1\nSBA,SFO,3047\nSBA,SJC,1208\nSBA,SLC,685\nSBN,ATL,1039\nSBN,CVG,12\nSBN,DTW,1638\nSBN,MSP,365\nSBN,ORD,2265\nSBP,FAT,1\nSBP,LAS,128\nSBP,LAX,2682\nSBP,MFR,1\nSBP,MRY,2\nSBP,PHX,990\nSBP,SFO,1758\nSBP,SLC,284\nSCC,ANC,363\nSCC,BRW,364\nSCE,ATL,122\nSCE,CVG,23\nSCE,DTW,500\nSDF,ATL,2756\nSDF,BHM,674\nSDF,BOS,81\nSDF,BWI,1483\nSDF,CLE,728\nSDF,CLT,795\nSDF,CVG,639\nSDF,DEN,384\nSDF,DFW,1386\nSDF,DTW,1011\nSDF,EWR,1037\nSDF,IAH,361\nSDF,LAS,365\nSDF,LGA,572\nSDF,MCO,533\nSDF,MDW,1685\nSDF,MEM,787\nSDF,MIA,366\nSDF,MKE,257\nSDF,MSP,780\nSDF,ORD,3497\nSDF,PHL,2\nSDF,PHX,365\nSDF,RDU,426\nSDF,SLC,3\nSDF,SPI,1\nSDF,STL,995\nSDF,TPA,489\nSEA,ABQ,708\nSEA,ANC,6256\nSEA,ATL,2571\nSEA,AUS,147\nSEA,BNA,364\nSEA,BOI,1070\nSEA,BOS,980\nSEA,BUR,1390\nSEA,BWI,242\nSEA,CLE,229\nSEA,CLT,480\nSEA,CVG,791\nSEA,DCA,727\nSEA,DEN,6623\nSEA,DFW,3917\nSEA,DTW,1172\nSEA,EWR,2026\nSEA,FAI,956\nSEA,GEG,4346\nSEA,HNL,1638\nSEA,IAD,1097\nSEA,IAH,2395\nSEA,IND,75\nSEA,JFK,1852\nSEA,JNU,1334\nSEA,KOA,45\nSEA,KTN,1289\nSEA,LAS,5051\nSEA,LAX,6865\nSEA,LGB,1500\nSEA,LIH,366\nSEA,MCI,365\nSEA,MCO,731\nSEA,MDW,1361\nSEA,MEM,350\nSEA,MIA,366\nSEA,MKE,121\nSEA,MSP,2474\nSEA,OAK,5095\nSEA,OGG,900\nSEA,ONT,1343\nSEA,ORD,4608\nSEA,PDX,2449\nSEA,PHL,707\nSEA,PHX,5062\nSEA,PSP,667\nSEA,RNO,802\nSEA,SAN,2833\nSEA,SFO,5409\nSEA,SIT,104\nSEA,SJC,3534\nSEA,SLC,3774\nSEA,SMF,3642\nSEA,SNA,2860\nSEA,STL,567\nSEA,TUS,443\nSFO,ABQ,529\nSFO,ACV,2337\nSFO,ANC,182\nSFO,ASE,59\nSFO,ATL,3098\nSFO,AUS,609\nSFO,BFL,941\nSFO,BOI,1766\nSFO,BOS,2594\nSFO,BUR,1962\nSFO,BWI,366\nSFO,BZN,28\nSFO,CEC,705\nSFO,CIC,1392\nSFO,CLE,466\nSFO,CLT,1429\nSFO,COS,364\nSFO,CVG,782\nSFO,DEN,5374\nSFO,DFW,3487\nSFO,DTW,1160\nSFO,EUG,1923\nSFO,EWR,3137\nSFO,FAT,2410\nSFO,FCA,12\nSFO,GJT,2\nSFO,HNL,2359\nSFO,IAD,2732\nSFO,IAH,2660\nSFO,IDA,1\nSFO,IND,173\nSFO,JFK,6971\nSFO,KOA,713\nSFO,LAS,7007\nSFO,LAX,13788\nSFO,LGB,209\nSFO,LIH,483\nSFO,LMT,348\nSFO,MCO,366\nSFO,MDW,1092\nSFO,MEM,208\nSFO,MFR,2570\nSFO,MIA,1098\nSFO,MKE,115\nSFO,MOD,1665\nSFO,MRY,2410\nSFO,MSO,12\nSFO,MSP,1984\nSFO,OGG,932\nSFO,ONT,1600\nSFO,ORD,5746\nSFO,OTH,354\nSFO,PDX,2972\nSFO,PHL,2554\nSFO,PHX,4870\nSFO,PIT,369\nSFO,PMD,728\nSFO,PSP,1636\nSFO,RDD,1683\nSFO,RDM,1082\nSFO,RNO,1885\nSFO,SAN,6312\nSFO,SAT,366\nSFO,SBA,2991\nSFO,SBP,1751\nSFO,SEA,5414\nSFO,SJC,1\nSFO,SLC,4064\nSFO,SMF,2301\nSFO,SMX,2\nSFO,SNA,3955\nSFO,STL,574\nSFO,TUS,365\nSFO,TWF,2\nSGF,ATL,1170\nSGF,BNA,2\nSGF,CVG,247\nSGF,DEN,777\nSGF,DFW,3228\nSGF,DTW,363\nSGF,FSD,1\nSGF,MEM,1079\nSGF,MSP,360\nSGF,ORD,2492\nSGF,STL,368\nSGU,CDC,1\nSGU,LAX,721\nSGU,PIH,1\nSGU,PSP,1\nSGU,SLC,2594\nSGU,TWF,1\nSHV,ATL,1817\nSHV,DFW,3579\nSHV,DTW,360\nSHV,IAH,1018\nSHV,MEM,1094\nSHV,ORD,211\nSIT,JNU,740\nSIT,KTN,365\nSIT,SEA,227\nSJC,ATL,634\nSJC,AUS,968\nSJC,BFL,1\nSJC,BOS,256\nSJC,BUR,3380\nSJC,DEN,3670\nSJC,DFW,2264\nSJC,EWR,200\nSJC,FAT,1\nSJC,HNL,366\nSJC,IAD,245\nSJC,IAH,994\nSJC,JFK,481\nSJC,LAS,4176\nSJC,LAX,8939\nSJC,LGB,660\nSJC,MDW,659\nSJC,MSP,695\nSJC,ONT,2719\nSJC,ORD,1348\nSJC,PDX,2322\nSJC,PHX,4027\nSJC,RNO,1371\nSJC,SAN,5254\nSJC,SBA,1206\nSJC,SEA,3543\nSJC,SFO,1\nSJC,SLC,1372\nSJC,SMX,1\nSJC,SNA,5383\nSJT,DFW,1316\nSJU,ATL,1872\nSJU,BDL,366\nSJU,BOS,1273\nSJU,BWI,318\nSJU,CLE,43\nSJU,CLT,795\nSJU,DFW,986\nSJU,DTW,172\nSJU,EWR,1582\nSJU,FLL,764\nSJU,IAD,844\nSJU,IAH,730\nSJU,JFK,3558\nSJU,LAX,144\nSJU,MCO,2415\nSJU,MEM,26\nSJU,MIA,2560\nSJU,MSP,26\nSJU,ORD,1115\nSJU,PHL,1475\nSJU,PIT,1\nSJU,STT,245\nSJU,TPA,366\nSLC,ABQ,2293\nSLC,ACV,389\nSLC,ANC,478\nSLC,ASE,443\nSLC,ATL,2866\nSLC,AUS,550\nSLC,BFL,371\nSLC,BHM,5\nSLC,BIL,1953\nSLC,BLI,120\nSLC,BNA,114\nSLC,BOI,3370\nSLC,BOS,707\nSLC,BTM,704\nSLC,BUR,1674\nSLC,BWI,728\nSLC,BZN,2029\nSLC,CDC,666\nSLC,CLE,348\nSLC,CLT,211\nSLC,CMH,290\nSLC,COD,706\nSLC,COS,1073\nSLC,CPR,1006\nSLC,CVG,1620\nSLC,CYS,1\nSLC,DCA,365\nSLC,DEN,9269\nSLC,DFW,3149\nSLC,DRO,386\nSLC,DSM,3\nSLC,DTW,573\nSLC,EKO,1579\nSLC,ELP,120\nSLC,EUG,714\nSLC,EWR,812\nSLC,FAI,80\nSLC,FAR,95\nSLC,FAT,849\nSLC,FCA,1742\nSLC,FLL,242\nSLC,FSD,7\nSLC,GCC,293\nSLC,GEG,1947\nSLC,GJT,1062\nSLC,GTF,1050\nSLC,GUC,14\nSLC,HDN,373\nSLC,HLN,1215\nSLC,HNL,366\nSLC,IAD,523\nSLC,IAH,2698\nSLC,IDA,1788\nSLC,JAC,1485\nSLC,JFK,1784\nSLC,LAS,5373\nSLC,LAX,5178\nSLC,LBB,1\nSLC,LGA,24\nSLC,LGB,2499\nSLC,LIT,18\nSLC,LWS,652\nSLC,MCI,1051\nSLC,MCO,687\nSLC,MDW,997\nSLC,MFR,726\nSLC,MKE,5\nSLC,MRY,6\nSLC,MSO,1845\nSLC,MSP,2191\nSLC,MSY,328\nSLC,MTJ,229\nSLC,OAK,3134\nSLC,OGD,1\nSLC,OGG,261\nSLC,OKC,740\nSLC,OMA,605\nSLC,ONT,1661\nSLC,ORD,2863\nSLC,PDX,3289\nSLC,PHL,671\nSLC,PHX,7168\nSLC,PIH,1660\nSLC,PIT,217\nSLC,PSC,1602\nSLC,PSP,901\nSLC,RAP,757\nSLC,RDM,720\nSLC,RDU,328\nSLC,RKS,349\nSLC,RNO,1817\nSLC,SAN,2548\nSLC,SAT,587\nSLC,SBA,688\nSLC,SBP,285\nSLC,SDF,2\nSLC,SEA,3771\nSLC,SFO,3705\nSLC,SGF,1\nSLC,SGU,2594\nSLC,SJC,1372\nSLC,SLE,484\nSLC,SMF,1660\nSLC,SNA,2016\nSLC,STL,1386\nSLC,SUN,2903\nSLC,TPA,329\nSLC,TUL,602\nSLC,TUS,1485\nSLC,TWF,1772\nSLC,WYS,264\nSLC,XNA,4\nSLC,YKM,338\nSLC,YUM,440\nSLE,SLC,484\nSLE,TWF,2\nSMF,ABQ,466\nSMF,ACV,616\nSMF,ATL,682\nSMF,BFL,229\nSMF,BUR,3466\nSMF,CLT,76\nSMF,COS,426\nSMF,DEN,3327\nSMF,DFW,1347\nSMF,GEG,371\nSMF,HNL,366\nSMF,IAD,366\nSMF,IAH,1085\nSMF,JFK,342\nSMF,LAS,4064\nSMF,LAX,5717\nSMF,LGB,729\nSMF,MCI,306\nSMF,MDW,683\nSMF,MSP,810\nSMF,OGG,59\nSMF,OKC,229\nSMF,ONT,3814\nSMF,ORD,1077\nSMF,PDX,2482\nSMF,PHL,207\nSMF,PHX,4115\nSMF,RDD,1\nSMF,SAN,4573\nSMF,SAT,228\nSMF,SBA,1\nSMF,SEA,3638\nSMF,SFO,2300\nSMF,SLC,1660\nSMF,SNA,2503\nSMF,TUL,228\nSMF,TUS,467\nSMX,LAX,1681\nSNA,ATL,1463\nSNA,AUS,246\nSNA,CVG,285\nSNA,DEN,3326\nSNA,DFW,3656\nSNA,EWR,954\nSNA,HNL,64\nSNA,IAH,1826\nSNA,KOA,36\nSNA,LAS,4130\nSNA,LAX,33\nSNA,LIH,23\nSNA,MSP,1036\nSNA,OAK,3652\nSNA,OGG,60\nSNA,ORD,2554\nSNA,PDX,1418\nSNA,PHX,5477\nSNA,RNO,60\nSNA,SAN,1\nSNA,SEA,2862\nSNA,SFO,3994\nSNA,SJC,5401\nSNA,SLC,2015\nSNA,SMF,2498\nSNA,STL,306\nSPI,IAD,142\nSPI,ORD,1083\nSPS,DFW,1834\nSRQ,ATL,3327\nSRQ,BOS,23\nSRQ,BWI,245\nSRQ,CLE,118\nSRQ,CLT,207\nSRQ,CVG,445\nSRQ,DCA,12\nSRQ,DTW,219\nSRQ,EWR,399\nSRQ,IAH,70\nSRQ,IND,155\nSRQ,JFK,534\nSRQ,LGA,74\nSRQ,MDW,565\nSRQ,STL,37\nSRQ,TPA,2\nSTL,ABQ,366\nSTL,ATL,3956\nSTL,AUS,95\nSTL,BHM,366\nSTL,BNA,258\nSTL,BOS,865\nSTL,BWI,1676\nSTL,CLE,916\nSTL,CLT,1093\nSTL,CMH,674\nSTL,CVG,346\nSTL,DAL,2718\nSTL,DCA,1296\nSTL,DEN,2430\nSTL,DFW,3597\nSTL,DTW,2455\nSTL,EWR,1725\nSTL,FLL,472\nSTL,HOU,1340\nSTL,IAH,1003\nSTL,JFK,795\nSTL,LAS,1651\nSTL,LAX,1687\nSTL,LGA,1603\nSTL,LIT,666\nSTL,MCI,1785\nSTL,MCO,2421\nSTL,MDW,3755\nSTL,MEM,1048\nSTL,MIA,731\nSTL,MKE,321\nSTL,MSP,1696\nSTL,OKC,687\nSTL,OMA,1043\nSTL,ORD,4256\nSTL,PHL,576\nSTL,PHX,2763\nSTL,RDU,357\nSTL,RSW,417\nSTL,SAN,366\nSTL,SAT,246\nSTL,SDF,994\nSTL,SEA,566\nSTL,SFO,574\nSTL,SGF,366\nSTL,SLC,1386\nSTL,SNA,305\nSTL,SRQ,38\nSTL,TPA,1088\nSTL,TUL,899\nSTT,ATL,451\nSTT,BOS,88\nSTT,CLT,418\nSTT,EWR,232\nSTT,JFK,366\nSTT,LGA,9\nSTT,MIA,732\nSTT,PHL,198\nSTT,SJU,478\nSTX,ATL,64\nSTX,CLT,20\nSTX,JAX,2\nSTX,MGM,1\nSTX,MIA,349\nSUN,SLC,2870\nSUN,TWF,1\nSUX,MSP,122\nSWF,ATL,1617\nSWF,BDL,1\nSWF,BOS,1\nSWF,DTW,724\nSWF,FLL,476\nSWF,MCO,835\nSWF,PBI,360\nSWF,TPA,235\nSYR,ATL,1419\nSYR,CAK,1\nSYR,CLE,686\nSYR,CLT,746\nSYR,CVG,831\nSYR,DCA,313\nSYR,DFW,178\nSYR,DTW,1015\nSYR,EWR,1002\nSYR,FLL,328\nSYR,IAD,622\nSYR,JFK,1825\nSYR,MCO,391\nSYR,ORD,2342\nSYR,PHL,333\nTEX,PHX,194\nTLH,ATL,2484\nTLH,CLT,240\nTLH,FLL,261\nTLH,IAH,482\nTLH,MCO,219\nTLH,MEM,1094\nTLH,MIA,831\nTLH,TPA,301\nTOL,ATL,120\nTOL,CVG,21\nTOL,ORD,1337\nTPA,ABQ,366\nTPA,ALB,391\nTPA,ATL,7313\nTPA,AUS,367\nTPA,BDL,1266\nTPA,BHM,1052\nTPA,BNA,1695\nTPA,BOS,1782\nTPA,BUF,728\nTPA,BWI,3402\nTPA,CAK,359\nTPA,CLE,874\nTPA,CLT,2825\nTPA,CMH,973\nTPA,CVG,1101\nTPA,DAY,204\nTPA,DCA,1554\nTPA,DEN,1692\nTPA,DFW,2804\nTPA,DTW,1452\nTPA,EWR,2837\nTPA,FLL,3051\nTPA,FNT,200\nTPA,GPT,366\nTPA,HOU,1411\nTPA,HPN,60\nTPA,IAD,1906\nTPA,IAH,1962\nTPA,IND,1578\nTPA,ISP,1093\nTPA,JAX,1006\nTPA,JFK,3395\nTPA,LAS,1178\nTPA,LAX,519\nTPA,LGA,1465\nTPA,MCI,699\nTPA,MCO,1\nTPA,MDW,2218\nTPA,MEM,860\nTPA,MHT,741\nTPA,MIA,1829\nTPA,MKE,178\nTPA,MSP,1005\nTPA,MSY,1088\nTPA,ORD,2288\nTPA,ORF,366\nTPA,PBI,1353\nTPA,PHF,95\nTPA,PHL,3380\nTPA,PHX,1022\nTPA,PIT,1096\nTPA,PNS,136\nTPA,PVD,981\nTPA,RDU,1067\nTPA,ROC,366\nTPA,SAT,365\nTPA,SDF,488\nTPA,SJU,366\nTPA,SLC,329\nTPA,STL,1099\nTPA,SWF,235\nTPA,TLH,301\nTRI,ATL,1808\nTRI,CLT,16\nTRI,CVG,249\nTRI,MEM,44\nTUL,ABQ,229\nTUL,ASE,1\nTUL,ATL,1980\nTUL,AUS,90\nTUL,CVG,883\nTUL,DAL,2284\nTUL,DEN,1631\nTUL,DFW,3260\nTUL,DTW,726\nTUL,EWR,344\nTUL,GJT,2\nTUL,HOU,1300\nTUL,IAH,2319\nTUL,LAS,391\nTUL,LAX,73\nTUL,MCI,806\nTUL,MCO,9\nTUL,MEM,1094\nTUL,MSP,717\nTUL,OKC,1\nTUL,OMA,1\nTUL,ONT,227\nTUL,ORD,2038\nTUL,PHX,1021\nTUL,PIA,1\nTUL,SAN,228\nTUL,SAT,88\nTUL,SLC,599\nTUL,SMF,225\nTUL,STL,890\nTUL,XNA,1\nTUP,ATL,10\nTUS,ABQ,718\nTUS,ATL,667\nTUS,AUS,229\nTUS,CLT,207\nTUS,DEN,2029\nTUS,DFW,2676\nTUS,ELP,88\nTUS,EWR,186\nTUS,GEG,151\nTUS,IAD,112\nTUS,IAH,1669\nTUS,JFK,132\nTUS,LAS,2242\nTUS,LAX,4190\nTUS,MCI,230\nTUS,MDW,723\nTUS,MSP,439\nTUS,OAK,306\nTUS,OMA,221\nTUS,ONT,477\nTUS,ORD,865\nTUS,PHX,3474\nTUS,PSP,1\nTUS,RNO,219\nTUS,SAN,1412\nTUS,SAT,239\nTUS,SEA,444\nTUS,SFO,365\nTUS,SLC,1485\nTUS,SMF,465\nTVC,CVG,129\nTVC,DEN,89\nTVC,DTW,1210\nTVC,LGA,50\nTVC,MSN,1\nTVC,MSP,347\nTVC,ORD,2436\nTWF,BOI,1\nTWF,SLC,1810\nTWF,SUN,2\nTXK,DFW,1250\nTYR,DFW,1585\nTYS,ATL,2431\nTYS,AUS,3\nTYS,CLE,511\nTYS,CVG,954\nTYS,DEN,511\nTYS,DFW,1506\nTYS,DTW,1424\nTYS,EWR,651\nTYS,IAD,96\nTYS,IAH,1344\nTYS,LGA,603\nTYS,MCI,1\nTYS,MCO,125\nTYS,MEM,1460\nTYS,MSP,365\nTYS,ORD,2019\nVLD,ATL,938\nVPS,ATL,3045\nVPS,CVG,103\nVPS,DFW,1968\nVPS,IAH,421\nVPS,LGA,2\nVPS,MEM,1045\nVPS,ORD,236\nWRG,KTN,363\nWRG,PSG,364\nWYS,SLC,264\nXNA,ATL,1768\nXNA,BHM,1\nXNA,CAK,1\nXNA,COS,1\nXNA,CVG,101\nXNA,DCA,209\nXNA,DEN,685\nXNA,DFW,2781\nXNA,DTW,361\nXNA,EWR,545\nXNA,FAR,1\nXNA,IAH,1435\nXNA,LAX,358\nXNA,LEX,1\nXNA,LGA,766\nXNA,MEM,1044\nXNA,MIA,154\nXNA,MSP,676\nXNA,ORD,3114\nXNA,RDU,104\nXNA,RFD,1\nXNA,SGF,1\nXNA,SLC,4\nYAK,CDV,363\nYAK,JNU,362\nYKM,SLC,340\nYUM,GJT,1\nYUM,IPL,326\nYUM,LAS,99\nYUM,LAX,1044\nYUM,PHX,1961\nYUM,SLC,440\n";
let preparedData;
function prepare() {
  const { airports, flights } = parseAirportsInformation();
  const flightsByAirport = groupFlightsByAirports(flights);
  const byAirport = index(airports, (d) => d.iata);
  const airportsGroupedByStateArray = groups(airports, (d) => d.state);
  const stateInformationSortedArray = airportsGroupedByStateArray.map(([state, airportsInState]) => {
    const totalFlightsInState = sum(airportsInState, ({ iata }) => {
      var _a;
      return (_a = flightsByAirport.get(iata)) == null ? void 0 : _a.total;
    });
    const sorted = sort$1(airportsInState, ({ iata }) => {
      var _a;
      return -((_a = flightsByAirport.get(iata)) == null ? void 0 : _a.total);
    });
    const mostUsedAirportsInState = sorted.slice(0, 6);
    return {
      state,
      total: totalFlightsInState,
      mostUsedAirports: mostUsedAirportsInState
    };
  }).sort((stateA, stateB) => stateB.total - stateA.total);
  const stateSortedArray = stateInformationSortedArray.map(({ state }) => state);
  const statesWithMostFlights = stateSortedArray.slice(0, 6);
  const plotData = stateInformationSortedArray.flatMap(({ mostUsedAirports, total, state }) => {
    const enrichedMostUsedAirports = mostUsedAirports.map(({ iata, name, city }, index2) => ({
      state,
      iata,
      name,
      city,
      index: index2,
      // This will be used to have consistent colors.
      ...flightsByAirport.get(iata)
    }));
    enrichedMostUsedAirports.push({
      state,
      iata: "Other",
      total: total - sum(mostUsedAirports, ({ iata }) => {
        var _a;
        return (_a = flightsByAirport.get(iata)) == null ? void 0 : _a.total;
      }),
      index: enrichedMostUsedAirports.length
    });
    return enrichedMostUsedAirports;
  });
  preparedData = {
    airports,
    flights,
    flightsByAirport,
    byAirport,
    stateInformationSortedArray,
    stateSortedArray,
    statesWithMostFlights,
    plotData
  };
}
function parseAirportsInformation() {
  return {
    airports: csvParse(airportsString),
    flights: csvParse(flightsString)
  };
}
function groupFlightsByAirports(flights) {
  const flightsByAirport = /* @__PURE__ */ new Map();
  for (const { origin, destination, count } of flights) {
    const infoForOriginAirport = flightsByAirport.get(origin) ?? { origin: 0, destination: 0, total: 0 };
    const intCount = Number(count);
    if (Number.isNaN(intCount)) {
      console.error(`Couldn't convert ${count} to number.`);
      continue;
    }
    infoForOriginAirport.origin += intCount;
    infoForOriginAirport.total += intCount;
    flightsByAirport.set(origin, infoForOriginAirport);
    const infoForDestinationAirport = flightsByAirport.get(destination) ?? { origin: 0, destination: 0, total: 0 };
    infoForDestinationAirport.destination += intCount;
    infoForDestinationAirport.total += intCount;
    flightsByAirport.set(destination, infoForDestinationAirport);
  }
  return flightsByAirport;
}
function isReady() {
  return preparedData;
}
function addStackedBars() {
  if (!isReady())
    throw new Error("Please prepare the data first.");
  const options = {
    width: 2e3,
    height: 1e3,
    color: { type: "categorical" },
    x: {
      domain: preparedData.stateSortedArray
    },
    y: { grid: true, tickFormat: "~s" },
    marks: [
      // stacked bars
      barY(preparedData.plotData, {
        x: "state",
        y: "total",
        fill: "index",
        title: (d) => `${d.iata === "Other" ? "Other" : `${d.name}, ${d.city} (${d.iata})`}
${format$1(",")(d.total)} flights`
      }),
      // labels
      text(preparedData.stateInformationSortedArray, { x: "state", y: "total", text: (d) => format$1(".2~s")(d.total), dy: -10 }),
      // horizontal bottom line
      ruleY([0])
    ]
  };
  document.querySelector("#chart").append(plot(options));
}
function addGroupedBars() {
  if (!isReady())
    throw new Error("Please prepare the data first.");
  const options = {
    width: 2e3,
    height: 1e3,
    x: {
      axis: null,
      domain: Array.from({ length: 7 }, (_, i) => i)
    },
    y: {
      grid: true,
      tickFormat: "~s"
    },
    color: { type: "categorical" },
    fx: {
      domain: preparedData.statesWithMostFlights,
      label: null,
      tickSize: 6
    },
    facet: {
      data: preparedData.plotData,
      x: "state"
    },
    marks: [
      // bars
      barY(preparedData.plotData, {
        x: "index",
        y: "total",
        fill: "index",
        title: (d) => `${d.iata === "Other" ? "Other" : `${d.name}, ${d.city} (${d.iata})`}
${format$1(",")(d.total)} flights`
      }),
      // labels
      text(preparedData.plotData, { x: "index", y: "total", text: (d) => format$1(".2~s")(d.total), dy: -10 }),
      // horizontal bottom line
      ruleY([0])
    ]
  };
  document.querySelector("#chart").append(plot(options));
}
function addDottedBars() {
  if (!isReady())
    throw new Error("Please prepare the data first.");
  const data = [...preparedData.flightsByAirport].flatMap(([iata, { origin, destination }]) => {
    const airportInformation = preparedData.byAirport.get(iata);
    return [
      { ...airportInformation, value: -origin },
      { ...airportInformation, value: destination }
    ];
  }).filter((d) => d.value);
  const options = {
    width: 2e3,
    height: 1e3,
    color: { type: "threshold", domain: [0] },
    x: {
      domain: preparedData.stateSortedArray
    },
    y: {
      grid: true,
      label: "← outward          Number of flights          inward →",
      labelAnchor: "center",
      tickFormat: (v) => format$1("~s")(Math.abs(v)),
      type: "pow",
      exponent: 0.2
    },
    marks: [
      dot(data, {
        x: "state",
        y: "value",
        r: 4,
        stroke: "value",
        strokeWidth: 3,
        title: (d) => `${d.iata === "Other" ? "Other" : `${d.name}, ${d.city} (${d.iata})`}
${format$1(",")(Math.abs(d.value))} ${d.value > 0 ? "inward" : "outward"} flights`
      }),
      // horizontal bottom line
      ruleY([0])
    ]
  };
  document.querySelector("#chart").append(plot(options));
}
function reset() {
  document.querySelector("#chart").textContent = "";
}
async function runAllTheThings() {
  reset();
  [
    // Force prettier to use a multiline formatting
    "prepare",
    "add-stacked-chart-button",
    "add-grouped-chart-button",
    "add-dotted-chart-button"
  ].forEach((id2) => document.getElementById(id2).click());
}
document.getElementById("prepare").addEventListener("click", prepare);
document.getElementById("add-stacked-chart-button").addEventListener("click", addStackedBars);
document.getElementById("add-grouped-chart-button").addEventListener("click", addGroupedBars);
document.getElementById("add-dotted-chart-button").addEventListener("click", addDottedBars);
document.getElementById("reset").addEventListener("click", reset);
document.getElementById("run-all").addEventListener("click", runAllTheThings);
