import { k as keyName, b as base, s as shift, c as code, a as code$1 } from "./index.es-8aa334e1.js";
class Text {
  /**
  @internal
  */
  constructor() {
  }
  /**
  Get the line description around the given position.
  */
  lineAt(pos) {
    if (pos < 0 || pos > this.length)
      throw new RangeError(`Invalid position ${pos} in document of length ${this.length}`);
    return this.lineInner(pos, false, 1, 0);
  }
  /**
  Get the description for the given (1-based) line number.
  */
  line(n) {
    if (n < 1 || n > this.lines)
      throw new RangeError(`Invalid line number ${n} in ${this.lines}-line document`);
    return this.lineInner(n, true, 1, 0);
  }
  /**
  Replace a range of the text with the given content.
  */
  replace(from, to, text) {
    let parts = [];
    this.decompose(
      0,
      from,
      parts,
      2
      /* Open.To */
    );
    if (text.length)
      text.decompose(
        0,
        text.length,
        parts,
        1 | 2
        /* Open.To */
      );
    this.decompose(
      to,
      this.length,
      parts,
      1
      /* Open.From */
    );
    return TextNode.from(parts, this.length - (to - from) + text.length);
  }
  /**
  Append another document to this one.
  */
  append(other) {
    return this.replace(this.length, this.length, other);
  }
  /**
  Retrieve the text between the given points.
  */
  slice(from, to = this.length) {
    let parts = [];
    this.decompose(from, to, parts, 0);
    return TextNode.from(parts, to - from);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(other) {
    if (other == this)
      return true;
    if (other.length != this.length || other.lines != this.lines)
      return false;
    let start = this.scanIdentical(other, 1), end = this.length - this.scanIdentical(other, -1);
    let a = new RawTextCursor(this), b = new RawTextCursor(other);
    for (let skip = start, pos = start; ; ) {
      a.next(skip);
      b.next(skip);
      skip = 0;
      if (a.lineBreak != b.lineBreak || a.done != b.done || a.value != b.value)
        return false;
      pos += a.value.length;
      if (a.done || pos >= end)
        return true;
    }
  }
  /**
  Iterate over the text. When `dir` is `-1`, iteration happens
  from end to start. This will return lines and the breaks between
  them as separate strings.
  */
  iter(dir = 1) {
    return new RawTextCursor(this, dir);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(from, to = this.length) {
    return new PartialTextCursor(this, from, to);
  }
  /**
  Return a cursor that iterates over the given range of lines,
  _without_ returning the line breaks between, and yielding empty
  strings for empty lines.
  
  When `from` and `to` are given, they should be 1-based line numbers.
  */
  iterLines(from, to) {
    let inner;
    if (from == null) {
      inner = this.iter();
    } else {
      if (to == null)
        to = this.lines + 1;
      let start = this.line(from).from;
      inner = this.iterRange(start, Math.max(start, to == this.lines + 1 ? this.length : to <= 1 ? 0 : this.line(to - 1).to));
    }
    return new LineCursor(inner);
  }
  /**
  @internal
  */
  toString() {
    return this.sliceString(0);
  }
  /**
  Convert the document to an array of lines (which can be
  deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
  */
  toJSON() {
    let lines = [];
    this.flatten(lines);
    return lines;
  }
  /**
  Create a `Text` instance for the given array of lines.
  */
  static of(text) {
    if (text.length == 0)
      throw new RangeError("A document must have at least one line");
    if (text.length == 1 && !text[0])
      return Text.empty;
    return text.length <= 32 ? new TextLeaf(text) : TextNode.from(TextLeaf.split(text, []));
  }
}
class TextLeaf extends Text {
  constructor(text, length = textLength(text)) {
    super();
    this.text = text;
    this.length = length;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(target, isLine, line, offset) {
    for (let i = 0; ; i++) {
      let string2 = this.text[i], end = offset + string2.length;
      if ((isLine ? line : end) >= target)
        return new Line(offset, end, line, string2);
      offset = end + 1;
      line++;
    }
  }
  decompose(from, to, target, open) {
    let text = from <= 0 && to >= this.length ? this : new TextLeaf(sliceText(this.text, from, to), Math.min(to, this.length) - Math.max(0, from));
    if (open & 1) {
      let prev = target.pop();
      let joined = appendText(text.text, prev.text.slice(), 0, text.length);
      if (joined.length <= 32) {
        target.push(new TextLeaf(joined, prev.length + text.length));
      } else {
        let mid = joined.length >> 1;
        target.push(new TextLeaf(joined.slice(0, mid)), new TextLeaf(joined.slice(mid)));
      }
    } else {
      target.push(text);
    }
  }
  replace(from, to, text) {
    if (!(text instanceof TextLeaf))
      return super.replace(from, to, text);
    let lines = appendText(this.text, appendText(text.text, sliceText(this.text, 0, from)), to);
    let newLen = this.length + text.length - (to - from);
    if (lines.length <= 32)
      return new TextLeaf(lines, newLen);
    return TextNode.from(TextLeaf.split(lines, []), newLen);
  }
  sliceString(from, to = this.length, lineSep = "\n") {
    let result = "";
    for (let pos = 0, i = 0; pos <= to && i < this.text.length; i++) {
      let line = this.text[i], end = pos + line.length;
      if (pos > from && i)
        result += lineSep;
      if (from < end && to > pos)
        result += line.slice(Math.max(0, from - pos), to - pos);
      pos = end + 1;
    }
    return result;
  }
  flatten(target) {
    for (let line of this.text)
      target.push(line);
  }
  scanIdentical() {
    return 0;
  }
  static split(text, target) {
    let part = [], len = -1;
    for (let line of text) {
      part.push(line);
      len += line.length + 1;
      if (part.length == 32) {
        target.push(new TextLeaf(part, len));
        part = [];
        len = -1;
      }
    }
    if (len > -1)
      target.push(new TextLeaf(part, len));
    return target;
  }
}
class TextNode extends Text {
  constructor(children, length) {
    super();
    this.children = children;
    this.length = length;
    this.lines = 0;
    for (let child of children)
      this.lines += child.lines;
  }
  lineInner(target, isLine, line, offset) {
    for (let i = 0; ; i++) {
      let child = this.children[i], end = offset + child.length, endLine = line + child.lines - 1;
      if ((isLine ? endLine : end) >= target)
        return child.lineInner(target, isLine, line, offset);
      offset = end + 1;
      line = endLine + 1;
    }
  }
  decompose(from, to, target, open) {
    for (let i = 0, pos = 0; pos <= to && i < this.children.length; i++) {
      let child = this.children[i], end = pos + child.length;
      if (from <= end && to >= pos) {
        let childOpen = open & ((pos <= from ? 1 : 0) | (end >= to ? 2 : 0));
        if (pos >= from && end <= to && !childOpen)
          target.push(child);
        else
          child.decompose(from - pos, to - pos, target, childOpen);
      }
      pos = end + 1;
    }
  }
  replace(from, to, text) {
    if (text.lines < this.lines)
      for (let i = 0, pos = 0; i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (from >= pos && to <= end) {
          let updated = child.replace(from - pos, to - pos, text);
          let totalLines = this.lines - child.lines + updated.lines;
          if (updated.lines < totalLines >> 5 - 1 && updated.lines > totalLines >> 5 + 1) {
            let copy = this.children.slice();
            copy[i] = updated;
            return new TextNode(copy, this.length - (to - from) + text.length);
          }
          return super.replace(pos, end, updated);
        }
        pos = end + 1;
      }
    return super.replace(from, to, text);
  }
  sliceString(from, to = this.length, lineSep = "\n") {
    let result = "";
    for (let i = 0, pos = 0; i < this.children.length && pos <= to; i++) {
      let child = this.children[i], end = pos + child.length;
      if (pos > from && i)
        result += lineSep;
      if (from < end && to > pos)
        result += child.sliceString(from - pos, to - pos, lineSep);
      pos = end + 1;
    }
    return result;
  }
  flatten(target) {
    for (let child of this.children)
      child.flatten(target);
  }
  scanIdentical(other, dir) {
    if (!(other instanceof TextNode))
      return 0;
    let length = 0;
    let [iA, iB, eA, eB] = dir > 0 ? [0, 0, this.children.length, other.children.length] : [this.children.length - 1, other.children.length - 1, -1, -1];
    for (; ; iA += dir, iB += dir) {
      if (iA == eA || iB == eB)
        return length;
      let chA = this.children[iA], chB = other.children[iB];
      if (chA != chB)
        return length + chA.scanIdentical(chB, dir);
      length += chA.length + 1;
    }
  }
  static from(children, length = children.reduce((l, ch) => l + ch.length + 1, -1)) {
    let lines = 0;
    for (let ch of children)
      lines += ch.lines;
    if (lines < 32) {
      let flat = [];
      for (let ch of children)
        ch.flatten(flat);
      return new TextLeaf(flat, length);
    }
    let chunk = Math.max(
      32,
      lines >> 5
      /* Tree.BranchShift */
    ), maxChunk = chunk << 1, minChunk = chunk >> 1;
    let chunked = [], currentLines = 0, currentLen = -1, currentChunk = [];
    function add2(child) {
      let last;
      if (child.lines > maxChunk && child instanceof TextNode) {
        for (let node of child.children)
          add2(node);
      } else if (child.lines > minChunk && (currentLines > minChunk || !currentLines)) {
        flush();
        chunked.push(child);
      } else if (child instanceof TextLeaf && currentLines && (last = currentChunk[currentChunk.length - 1]) instanceof TextLeaf && child.lines + last.lines <= 32) {
        currentLines += child.lines;
        currentLen += child.length + 1;
        currentChunk[currentChunk.length - 1] = new TextLeaf(last.text.concat(child.text), last.length + 1 + child.length);
      } else {
        if (currentLines + child.lines > chunk)
          flush();
        currentLines += child.lines;
        currentLen += child.length + 1;
        currentChunk.push(child);
      }
    }
    function flush() {
      if (currentLines == 0)
        return;
      chunked.push(currentChunk.length == 1 ? currentChunk[0] : TextNode.from(currentChunk, currentLen));
      currentLen = -1;
      currentLines = currentChunk.length = 0;
    }
    for (let child of children)
      add2(child);
    flush();
    return chunked.length == 1 ? chunked[0] : new TextNode(chunked, length);
  }
}
Text.empty = /* @__PURE__ */ new TextLeaf([""], 0);
function textLength(text) {
  let length = -1;
  for (let line of text)
    length += line.length + 1;
  return length;
}
function appendText(text, target, from = 0, to = 1e9) {
  for (let pos = 0, i = 0, first = true; i < text.length && pos <= to; i++) {
    let line = text[i], end = pos + line.length;
    if (end >= from) {
      if (end > to)
        line = line.slice(0, to - pos);
      if (pos < from)
        line = line.slice(from - pos);
      if (first) {
        target[target.length - 1] += line;
        first = false;
      } else
        target.push(line);
    }
    pos = end + 1;
  }
  return target;
}
function sliceText(text, from, to) {
  return appendText(text, [""], from, to);
}
class RawTextCursor {
  constructor(text, dir = 1) {
    this.dir = dir;
    this.done = false;
    this.lineBreak = false;
    this.value = "";
    this.nodes = [text];
    this.offsets = [dir > 0 ? 1 : (text instanceof TextLeaf ? text.text.length : text.children.length) << 1];
  }
  nextInner(skip, dir) {
    this.done = this.lineBreak = false;
    for (; ; ) {
      let last = this.nodes.length - 1;
      let top2 = this.nodes[last], offsetValue = this.offsets[last], offset = offsetValue >> 1;
      let size = top2 instanceof TextLeaf ? top2.text.length : top2.children.length;
      if (offset == (dir > 0 ? size : 0)) {
        if (last == 0) {
          this.done = true;
          this.value = "";
          return this;
        }
        if (dir > 0)
          this.offsets[last - 1]++;
        this.nodes.pop();
        this.offsets.pop();
      } else if ((offsetValue & 1) == (dir > 0 ? 0 : 1)) {
        this.offsets[last] += dir;
        if (skip == 0) {
          this.lineBreak = true;
          this.value = "\n";
          return this;
        }
        skip--;
      } else if (top2 instanceof TextLeaf) {
        let next = top2.text[offset + (dir < 0 ? -1 : 0)];
        this.offsets[last] += dir;
        if (next.length > Math.max(0, skip)) {
          this.value = skip == 0 ? next : dir > 0 ? next.slice(skip) : next.slice(0, next.length - skip);
          return this;
        }
        skip -= next.length;
      } else {
        let next = top2.children[offset + (dir < 0 ? -1 : 0)];
        if (skip > next.length) {
          skip -= next.length;
          this.offsets[last] += dir;
        } else {
          if (dir < 0)
            this.offsets[last]--;
          this.nodes.push(next);
          this.offsets.push(dir > 0 ? 1 : (next instanceof TextLeaf ? next.text.length : next.children.length) << 1);
        }
      }
    }
  }
  next(skip = 0) {
    if (skip < 0) {
      this.nextInner(-skip, -this.dir);
      skip = this.value.length;
    }
    return this.nextInner(skip, this.dir);
  }
}
class PartialTextCursor {
  constructor(text, start, end) {
    this.value = "";
    this.done = false;
    this.cursor = new RawTextCursor(text, start > end ? -1 : 1);
    this.pos = start > end ? text.length : 0;
    this.from = Math.min(start, end);
    this.to = Math.max(start, end);
  }
  nextInner(skip, dir) {
    if (dir < 0 ? this.pos <= this.from : this.pos >= this.to) {
      this.value = "";
      this.done = true;
      return this;
    }
    skip += Math.max(0, dir < 0 ? this.pos - this.to : this.from - this.pos);
    let limit = dir < 0 ? this.pos - this.from : this.to - this.pos;
    if (skip > limit)
      skip = limit;
    limit -= skip;
    let { value } = this.cursor.next(skip);
    this.pos += (value.length + skip) * dir;
    this.value = value.length <= limit ? value : dir < 0 ? value.slice(value.length - limit) : value.slice(0, limit);
    this.done = !this.value;
    return this;
  }
  next(skip = 0) {
    if (skip < 0)
      skip = Math.max(skip, this.from - this.pos);
    else if (skip > 0)
      skip = Math.min(skip, this.to - this.pos);
    return this.nextInner(skip, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
}
class LineCursor {
  constructor(inner) {
    this.inner = inner;
    this.afterBreak = true;
    this.value = "";
    this.done = false;
  }
  next(skip = 0) {
    let { done, lineBreak, value } = this.inner.next(skip);
    if (done) {
      this.done = true;
      this.value = "";
    } else if (lineBreak) {
      if (this.afterBreak) {
        this.value = "";
      } else {
        this.afterBreak = true;
        this.next();
      }
    } else {
      this.value = value;
      this.afterBreak = false;
    }
    return this;
  }
  get lineBreak() {
    return false;
  }
}
if (typeof Symbol != "undefined") {
  Text.prototype[Symbol.iterator] = function() {
    return this.iter();
  };
  RawTextCursor.prototype[Symbol.iterator] = PartialTextCursor.prototype[Symbol.iterator] = LineCursor.prototype[Symbol.iterator] = function() {
    return this;
  };
}
class Line {
  /**
  @internal
  */
  constructor(from, to, number2, text) {
    this.from = from;
    this.to = to;
    this.number = number2;
    this.text = text;
  }
  /**
  The length of the line (not including any line break after it).
  */
  get length() {
    return this.to - this.from;
  }
}
let extend = /* @__PURE__ */ "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((s) => s ? parseInt(s, 36) : 1);
for (let i = 1; i < extend.length; i++)
  extend[i] += extend[i - 1];
function isExtendingChar(code2) {
  for (let i = 1; i < extend.length; i += 2)
    if (extend[i] > code2)
      return extend[i - 1] <= code2;
  return false;
}
function isRegionalIndicator(code2) {
  return code2 >= 127462 && code2 <= 127487;
}
const ZWJ = 8205;
function findClusterBreak(str, pos, forward = true, includeExtending = true) {
  return (forward ? nextClusterBreak : prevClusterBreak)(str, pos, includeExtending);
}
function nextClusterBreak(str, pos, includeExtending) {
  if (pos == str.length)
    return pos;
  if (pos && surrogateLow(str.charCodeAt(pos)) && surrogateHigh(str.charCodeAt(pos - 1)))
    pos--;
  let prev = codePointAt(str, pos);
  pos += codePointSize(prev);
  while (pos < str.length) {
    let next = codePointAt(str, pos);
    if (prev == ZWJ || next == ZWJ || includeExtending && isExtendingChar(next)) {
      pos += codePointSize(next);
      prev = next;
    } else if (isRegionalIndicator(next)) {
      let countBefore = 0, i = pos - 2;
      while (i >= 0 && isRegionalIndicator(codePointAt(str, i))) {
        countBefore++;
        i -= 2;
      }
      if (countBefore % 2 == 0)
        break;
      else
        pos += 2;
    } else {
      break;
    }
  }
  return pos;
}
function prevClusterBreak(str, pos, includeExtending) {
  while (pos > 0) {
    let found = nextClusterBreak(str, pos - 2, includeExtending);
    if (found < pos)
      return found;
    pos--;
  }
  return 0;
}
function surrogateLow(ch) {
  return ch >= 56320 && ch < 57344;
}
function surrogateHigh(ch) {
  return ch >= 55296 && ch < 56320;
}
function codePointAt(str, pos) {
  let code0 = str.charCodeAt(pos);
  if (!surrogateHigh(code0) || pos + 1 == str.length)
    return code0;
  let code1 = str.charCodeAt(pos + 1);
  if (!surrogateLow(code1))
    return code0;
  return (code0 - 55296 << 10) + (code1 - 56320) + 65536;
}
function fromCodePoint(code2) {
  if (code2 <= 65535)
    return String.fromCharCode(code2);
  code2 -= 65536;
  return String.fromCharCode((code2 >> 10) + 55296, (code2 & 1023) + 56320);
}
function codePointSize(code2) {
  return code2 < 65536 ? 1 : 2;
}
const DefaultSplit = /\r\n?|\n/;
var MapMode = /* @__PURE__ */ function(MapMode2) {
  MapMode2[MapMode2["Simple"] = 0] = "Simple";
  MapMode2[MapMode2["TrackDel"] = 1] = "TrackDel";
  MapMode2[MapMode2["TrackBefore"] = 2] = "TrackBefore";
  MapMode2[MapMode2["TrackAfter"] = 3] = "TrackAfter";
  return MapMode2;
}(MapMode || (MapMode = {}));
class ChangeDesc {
  // Sections are encoded as pairs of integers. The first is the
  // length in the current document, and the second is -1 for
  // unaffected sections, and the length of the replacement content
  // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
  // 0), and a replacement two positive numbers.
  /**
  @internal
  */
  constructor(sections) {
    this.sections = sections;
  }
  /**
  The length of the document before the change.
  */
  get length() {
    let result = 0;
    for (let i = 0; i < this.sections.length; i += 2)
      result += this.sections[i];
    return result;
  }
  /**
  The length of the document after the change.
  */
  get newLength() {
    let result = 0;
    for (let i = 0; i < this.sections.length; i += 2) {
      let ins = this.sections[i + 1];
      result += ins < 0 ? this.sections[i] : ins;
    }
    return result;
  }
  /**
  False when there are actual changes in this set.
  */
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  /**
  Iterate over the unchanged parts left by these changes. `posA`
  provides the position of the range in the old document, `posB`
  the new position in the changed document.
  */
  iterGaps(f) {
    for (let i = 0, posA = 0, posB = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++];
      if (ins < 0) {
        f(posA, posB, len);
        posB += len;
      } else {
        posB += ins;
      }
      posA += len;
    }
  }
  /**
  Iterate over the ranges changed by these changes. (See
  [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
  variant that also provides you with the inserted text.)
  `fromA`/`toA` provides the extent of the change in the starting
  document, `fromB`/`toB` the extent of the replacement in the
  changed document.
  
  When `individual` is true, adjacent changes (which are kept
  separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
  reported separately.
  */
  iterChangedRanges(f, individual = false) {
    iterChanges(this, f, individual);
  }
  /**
  Get a description of the inverted form of these changes.
  */
  get invertedDesc() {
    let sections = [];
    for (let i = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++];
      if (ins < 0)
        sections.push(len, ins);
      else
        sections.push(ins, len);
    }
    return new ChangeDesc(sections);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(other) {
    return this.empty ? other : other.empty ? this : composeSets(this, other);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `other` happened before the ones in `this`.
  */
  mapDesc(other, before = false) {
    return other.empty ? this : mapSet(this, other, before);
  }
  mapPos(pos, assoc = -1, mode = MapMode.Simple) {
    let posA = 0, posB = 0;
    for (let i = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++], endA = posA + len;
      if (ins < 0) {
        if (endA > pos)
          return posB + (pos - posA);
        posB += len;
      } else {
        if (mode != MapMode.Simple && endA >= pos && (mode == MapMode.TrackDel && posA < pos && endA > pos || mode == MapMode.TrackBefore && posA < pos || mode == MapMode.TrackAfter && endA > pos))
          return null;
        if (endA > pos || endA == pos && assoc < 0 && !len)
          return pos == posA || assoc < 0 ? posB : posB + ins;
        posB += ins;
      }
      posA = endA;
    }
    if (pos > posA)
      throw new RangeError(`Position ${pos} is out of range for changeset of length ${posA}`);
    return posB;
  }
  /**
  Check whether these changes touch a given range. When one of the
  changes entirely covers the range, the string `"cover"` is
  returned.
  */
  touchesRange(from, to = from) {
    for (let i = 0, pos = 0; i < this.sections.length && pos <= to; ) {
      let len = this.sections[i++], ins = this.sections[i++], end = pos + len;
      if (ins >= 0 && pos <= to && end >= from)
        return pos < from && end > to ? "cover" : true;
      pos = end;
    }
    return false;
  }
  /**
  @internal
  */
  toString() {
    let result = "";
    for (let i = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++];
      result += (result ? " " : "") + len + (ins >= 0 ? ":" + ins : "");
    }
    return result;
  }
  /**
  Serialize this change desc to a JSON-representable value.
  */
  toJSON() {
    return this.sections;
  }
  /**
  Create a change desc from its JSON representation (as produced
  by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
  */
  static fromJSON(json) {
    if (!Array.isArray(json) || json.length % 2 || json.some((a) => typeof a != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new ChangeDesc(json);
  }
  /**
  @internal
  */
  static create(sections) {
    return new ChangeDesc(sections);
  }
}
class ChangeSet extends ChangeDesc {
  constructor(sections, inserted) {
    super(sections);
    this.inserted = inserted;
  }
  /**
  Apply the changes to a document, returning the modified
  document.
  */
  apply(doc2) {
    if (this.length != doc2.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    iterChanges(this, (fromA, toA, fromB, _toB, text) => doc2 = doc2.replace(fromB, fromB + (toA - fromA), text), false);
    return doc2;
  }
  mapDesc(other, before = false) {
    return mapSet(this, other, before, true);
  }
  /**
  Given the document as it existed _before_ the changes, return a
  change set that represents the inverse of this set, which could
  be used to go from the document created by the changes back to
  the document as it existed before the changes.
  */
  invert(doc2) {
    let sections = this.sections.slice(), inserted = [];
    for (let i = 0, pos = 0; i < sections.length; i += 2) {
      let len = sections[i], ins = sections[i + 1];
      if (ins >= 0) {
        sections[i] = ins;
        sections[i + 1] = len;
        let index = i >> 1;
        while (inserted.length < index)
          inserted.push(Text.empty);
        inserted.push(len ? doc2.slice(pos, pos + len) : Text.empty);
      }
      pos += len;
    }
    return new ChangeSet(sections, inserted);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(other) {
    return this.empty ? other : other.empty ? this : composeSets(this, other, true);
  }
  /**
  Given another change set starting in the same document, maps this
  change set over the other, producing a new change set that can be
  applied to the document produced by applying `other`. When
  `before` is `true`, order changes as if `this` comes before
  `other`, otherwise (the default) treat `other` as coming first.
  
  Given two changes `A` and `B`, `A.compose(B.map(A))` and
  `B.compose(A.map(B, true))` will produce the same document. This
  provides a basic form of [operational
  transformation](https://en.wikipedia.org/wiki/Operational_transformation),
  and can be used for collaborative editing.
  */
  map(other, before = false) {
    return other.empty ? this : mapSet(this, other, before, true);
  }
  /**
  Iterate over the changed ranges in the document, calling `f` for
  each, with the range in the original document (`fromA`-`toA`)
  and the range that replaces it in the new document
  (`fromB`-`toB`).
  
  When `individual` is true, adjacent changes are reported
  separately.
  */
  iterChanges(f, individual = false) {
    iterChanges(this, f, individual);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return ChangeDesc.create(this.sections);
  }
  /**
  @internal
  */
  filter(ranges) {
    let resultSections = [], resultInserted = [], filteredSections = [];
    let iter = new SectionIter(this);
    done:
      for (let i = 0, pos = 0; ; ) {
        let next = i == ranges.length ? 1e9 : ranges[i++];
        while (pos < next || pos == next && iter.len == 0) {
          if (iter.done)
            break done;
          let len = Math.min(iter.len, next - pos);
          addSection(filteredSections, len, -1);
          let ins = iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0;
          addSection(resultSections, len, ins);
          if (ins > 0)
            addInsert(resultInserted, resultSections, iter.text);
          iter.forward(len);
          pos += len;
        }
        let end = ranges[i++];
        while (pos < end) {
          if (iter.done)
            break done;
          let len = Math.min(iter.len, end - pos);
          addSection(resultSections, len, -1);
          addSection(filteredSections, len, iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0);
          iter.forward(len);
          pos += len;
        }
      }
    return {
      changes: new ChangeSet(resultSections, resultInserted),
      filtered: ChangeDesc.create(filteredSections)
    };
  }
  /**
  Serialize this change set to a JSON-representable value.
  */
  toJSON() {
    let parts = [];
    for (let i = 0; i < this.sections.length; i += 2) {
      let len = this.sections[i], ins = this.sections[i + 1];
      if (ins < 0)
        parts.push(len);
      else if (ins == 0)
        parts.push([len]);
      else
        parts.push([len].concat(this.inserted[i >> 1].toJSON()));
    }
    return parts;
  }
  /**
  Create a change set for the given changes, for a document of the
  given length, using `lineSep` as line separator.
  */
  static of(changes, length, lineSep) {
    let sections = [], inserted = [], pos = 0;
    let total = null;
    function flush(force = false) {
      if (!force && !sections.length)
        return;
      if (pos < length)
        addSection(sections, length - pos, -1);
      let set = new ChangeSet(sections, inserted);
      total = total ? total.compose(set.map(total)) : set;
      sections = [];
      inserted = [];
      pos = 0;
    }
    function process2(spec) {
      if (Array.isArray(spec)) {
        for (let sub of spec)
          process2(sub);
      } else if (spec instanceof ChangeSet) {
        if (spec.length != length)
          throw new RangeError(`Mismatched change set length (got ${spec.length}, expected ${length})`);
        flush();
        total = total ? total.compose(spec.map(total)) : spec;
      } else {
        let { from, to = from, insert: insert2 } = spec;
        if (from > to || from < 0 || to > length)
          throw new RangeError(`Invalid change range ${from} to ${to} (in doc of length ${length})`);
        let insText = !insert2 ? Text.empty : typeof insert2 == "string" ? Text.of(insert2.split(lineSep || DefaultSplit)) : insert2;
        let insLen = insText.length;
        if (from == to && insLen == 0)
          return;
        if (from < pos)
          flush();
        if (from > pos)
          addSection(sections, from - pos, -1);
        addSection(sections, to - from, insLen);
        addInsert(inserted, sections, insText);
        pos = to;
      }
    }
    process2(changes);
    flush(!total);
    return total;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(length) {
    return new ChangeSet(length ? [length, -1] : [], []);
  }
  /**
  Create a changeset from its JSON representation (as produced by
  [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
  */
  static fromJSON(json) {
    if (!Array.isArray(json))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let sections = [], inserted = [];
    for (let i = 0; i < json.length; i++) {
      let part = json[i];
      if (typeof part == "number") {
        sections.push(part, -1);
      } else if (!Array.isArray(part) || typeof part[0] != "number" || part.some((e, i2) => i2 && typeof e != "string")) {
        throw new RangeError("Invalid JSON representation of ChangeSet");
      } else if (part.length == 1) {
        sections.push(part[0], 0);
      } else {
        while (inserted.length < i)
          inserted.push(Text.empty);
        inserted[i] = Text.of(part.slice(1));
        sections.push(part[0], inserted[i].length);
      }
    }
    return new ChangeSet(sections, inserted);
  }
  /**
  @internal
  */
  static createSet(sections, inserted) {
    return new ChangeSet(sections, inserted);
  }
}
function addSection(sections, len, ins, forceJoin = false) {
  if (len == 0 && ins <= 0)
    return;
  let last = sections.length - 2;
  if (last >= 0 && ins <= 0 && ins == sections[last + 1])
    sections[last] += len;
  else if (len == 0 && sections[last] == 0)
    sections[last + 1] += ins;
  else if (forceJoin) {
    sections[last] += len;
    sections[last + 1] += ins;
  } else
    sections.push(len, ins);
}
function addInsert(values, sections, value) {
  if (value.length == 0)
    return;
  let index = sections.length - 2 >> 1;
  if (index < values.length) {
    values[values.length - 1] = values[values.length - 1].append(value);
  } else {
    while (values.length < index)
      values.push(Text.empty);
    values.push(value);
  }
}
function iterChanges(desc, f, individual) {
  let inserted = desc.inserted;
  for (let posA = 0, posB = 0, i = 0; i < desc.sections.length; ) {
    let len = desc.sections[i++], ins = desc.sections[i++];
    if (ins < 0) {
      posA += len;
      posB += len;
    } else {
      let endA = posA, endB = posB, text = Text.empty;
      for (; ; ) {
        endA += len;
        endB += ins;
        if (ins && inserted)
          text = text.append(inserted[i - 2 >> 1]);
        if (individual || i == desc.sections.length || desc.sections[i + 1] < 0)
          break;
        len = desc.sections[i++];
        ins = desc.sections[i++];
      }
      f(posA, endA, posB, endB, text);
      posA = endA;
      posB = endB;
    }
  }
}
function mapSet(setA, setB, before, mkSet = false) {
  let sections = [], insert2 = mkSet ? [] : null;
  let a = new SectionIter(setA), b = new SectionIter(setB);
  for (let inserted = -1; ; ) {
    if (a.ins == -1 && b.ins == -1) {
      let len = Math.min(a.len, b.len);
      addSection(sections, len, -1);
      a.forward(len);
      b.forward(len);
    } else if (b.ins >= 0 && (a.ins < 0 || inserted == a.i || a.off == 0 && (b.len < a.len || b.len == a.len && !before))) {
      let len = b.len;
      addSection(sections, b.ins, -1);
      while (len) {
        let piece = Math.min(a.len, len);
        if (a.ins >= 0 && inserted < a.i && a.len <= piece) {
          addSection(sections, 0, a.ins);
          if (insert2)
            addInsert(insert2, sections, a.text);
          inserted = a.i;
        }
        a.forward(piece);
        len -= piece;
      }
      b.next();
    } else if (a.ins >= 0) {
      let len = 0, left = a.len;
      while (left) {
        if (b.ins == -1) {
          let piece = Math.min(left, b.len);
          len += piece;
          left -= piece;
          b.forward(piece);
        } else if (b.ins == 0 && b.len < left) {
          left -= b.len;
          b.next();
        } else {
          break;
        }
      }
      addSection(sections, len, inserted < a.i ? a.ins : 0);
      if (insert2 && inserted < a.i)
        addInsert(insert2, sections, a.text);
      inserted = a.i;
      a.forward(a.len - left);
    } else if (a.done && b.done) {
      return insert2 ? ChangeSet.createSet(sections, insert2) : ChangeDesc.create(sections);
    } else {
      throw new Error("Mismatched change set lengths");
    }
  }
}
function composeSets(setA, setB, mkSet = false) {
  let sections = [];
  let insert2 = mkSet ? [] : null;
  let a = new SectionIter(setA), b = new SectionIter(setB);
  for (let open = false; ; ) {
    if (a.done && b.done) {
      return insert2 ? ChangeSet.createSet(sections, insert2) : ChangeDesc.create(sections);
    } else if (a.ins == 0) {
      addSection(sections, a.len, 0, open);
      a.next();
    } else if (b.len == 0 && !b.done) {
      addSection(sections, 0, b.ins, open);
      if (insert2)
        addInsert(insert2, sections, b.text);
      b.next();
    } else if (a.done || b.done) {
      throw new Error("Mismatched change set lengths");
    } else {
      let len = Math.min(a.len2, b.len), sectionLen = sections.length;
      if (a.ins == -1) {
        let insB = b.ins == -1 ? -1 : b.off ? 0 : b.ins;
        addSection(sections, len, insB, open);
        if (insert2 && insB)
          addInsert(insert2, sections, b.text);
      } else if (b.ins == -1) {
        addSection(sections, a.off ? 0 : a.len, len, open);
        if (insert2)
          addInsert(insert2, sections, a.textBit(len));
      } else {
        addSection(sections, a.off ? 0 : a.len, b.off ? 0 : b.ins, open);
        if (insert2 && !b.off)
          addInsert(insert2, sections, b.text);
      }
      open = (a.ins > len || b.ins >= 0 && b.len > len) && (open || sections.length > sectionLen);
      a.forward2(len);
      b.forward(len);
    }
  }
}
class SectionIter {
  constructor(set) {
    this.set = set;
    this.i = 0;
    this.next();
  }
  next() {
    let { sections } = this.set;
    if (this.i < sections.length) {
      this.len = sections[this.i++];
      this.ins = sections[this.i++];
    } else {
      this.len = 0;
      this.ins = -2;
    }
    this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let { inserted } = this.set, index = this.i - 2 >> 1;
    return index >= inserted.length ? Text.empty : inserted[index];
  }
  textBit(len) {
    let { inserted } = this.set, index = this.i - 2 >> 1;
    return index >= inserted.length && !len ? Text.empty : inserted[index].slice(this.off, len == null ? void 0 : this.off + len);
  }
  forward(len) {
    if (len == this.len)
      this.next();
    else {
      this.len -= len;
      this.off += len;
    }
  }
  forward2(len) {
    if (this.ins == -1)
      this.forward(len);
    else if (len == this.ins)
      this.next();
    else {
      this.ins -= len;
      this.off += len;
    }
  }
}
class SelectionRange {
  constructor(from, to, flags) {
    this.from = from;
    this.to = to;
    this.flags = flags;
  }
  /**
  The anchor of the range—the side that doesn't move when you
  extend it.
  */
  get anchor() {
    return this.flags & 16 ? this.to : this.from;
  }
  /**
  The head of the range, which is moved when the range is
  [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
  */
  get head() {
    return this.flags & 16 ? this.from : this.to;
  }
  /**
  True when `anchor` and `head` are at the same position.
  */
  get empty() {
    return this.from == this.to;
  }
  /**
  If this is a cursor that is explicitly associated with the
  character on one of its sides, this returns the side. -1 means
  the character before its position, 1 the character after, and 0
  means no association.
  */
  get assoc() {
    return this.flags & 4 ? -1 : this.flags & 8 ? 1 : 0;
  }
  /**
  The bidirectional text level associated with this cursor, if
  any.
  */
  get bidiLevel() {
    let level = this.flags & 3;
    return level == 3 ? null : level;
  }
  /**
  The goal column (stored vertical offset) associated with a
  cursor. This is used to preserve the vertical position when
  [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
  lines of different length.
  */
  get goalColumn() {
    let value = this.flags >> 5;
    return value == 33554431 ? void 0 : value;
  }
  /**
  Map this range through a change, producing a valid range in the
  updated document.
  */
  map(change, assoc = -1) {
    let from, to;
    if (this.empty) {
      from = to = change.mapPos(this.from, assoc);
    } else {
      from = change.mapPos(this.from, 1);
      to = change.mapPos(this.to, -1);
    }
    return from == this.from && to == this.to ? this : new SelectionRange(from, to, this.flags);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(from, to = from) {
    if (from <= this.anchor && to >= this.anchor)
      return EditorSelection.range(from, to);
    let head = Math.abs(from - this.anchor) > Math.abs(to - this.anchor) ? from : to;
    return EditorSelection.range(this.anchor, head);
  }
  /**
  Compare this range to another range.
  */
  eq(other) {
    return this.anchor == other.anchor && this.head == other.head;
  }
  /**
  Return a JSON-serializable object representing the range.
  */
  toJSON() {
    return { anchor: this.anchor, head: this.head };
  }
  /**
  Convert a JSON representation of a range to a `SelectionRange`
  instance.
  */
  static fromJSON(json) {
    if (!json || typeof json.anchor != "number" || typeof json.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return EditorSelection.range(json.anchor, json.head);
  }
  /**
  @internal
  */
  static create(from, to, flags) {
    return new SelectionRange(from, to, flags);
  }
}
class EditorSelection {
  constructor(ranges, mainIndex) {
    this.ranges = ranges;
    this.mainIndex = mainIndex;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(change, assoc = -1) {
    if (change.empty)
      return this;
    return EditorSelection.create(this.ranges.map((r) => r.map(change, assoc)), this.mainIndex);
  }
  /**
  Compare this selection to another selection.
  */
  eq(other) {
    if (this.ranges.length != other.ranges.length || this.mainIndex != other.mainIndex)
      return false;
    for (let i = 0; i < this.ranges.length; i++)
      if (!this.ranges[i].eq(other.ranges[i]))
        return false;
    return true;
  }
  /**
  Get the primary selection range. Usually, you should make sure
  your code applies to _all_ ranges, by using methods like
  [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
  */
  get main() {
    return this.ranges[this.mainIndex];
  }
  /**
  Make sure the selection only has one range. Returns a selection
  holding only the main range from this selection.
  */
  asSingle() {
    return this.ranges.length == 1 ? this : new EditorSelection([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(range, main = true) {
    return EditorSelection.create([range].concat(this.ranges), main ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(range, which = this.mainIndex) {
    let ranges = this.ranges.slice();
    ranges[which] = range;
    return EditorSelection.create(ranges, this.mainIndex);
  }
  /**
  Convert this selection to an object that can be serialized to
  JSON.
  */
  toJSON() {
    return { ranges: this.ranges.map((r) => r.toJSON()), main: this.mainIndex };
  }
  /**
  Create a selection from a JSON representation.
  */
  static fromJSON(json) {
    if (!json || !Array.isArray(json.ranges) || typeof json.main != "number" || json.main >= json.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new EditorSelection(json.ranges.map((r) => SelectionRange.fromJSON(r)), json.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(anchor, head = anchor) {
    return new EditorSelection([EditorSelection.range(anchor, head)], 0);
  }
  /**
  Sort and merge the given set of ranges, creating a valid
  selection.
  */
  static create(ranges, mainIndex = 0) {
    if (ranges.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let pos = 0, i = 0; i < ranges.length; i++) {
      let range = ranges[i];
      if (range.empty ? range.from <= pos : range.from < pos)
        return EditorSelection.normalized(ranges.slice(), mainIndex);
      pos = range.to;
    }
    return new EditorSelection(ranges, mainIndex);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(pos, assoc = 0, bidiLevel, goalColumn) {
    return SelectionRange.create(pos, pos, (assoc == 0 ? 0 : assoc < 0 ? 4 : 8) | (bidiLevel == null ? 3 : Math.min(2, bidiLevel)) | (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5);
  }
  /**
  Create a selection range.
  */
  static range(anchor, head, goalColumn, bidiLevel) {
    let flags = (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5 | (bidiLevel == null ? 3 : Math.min(2, bidiLevel));
    return head < anchor ? SelectionRange.create(head, anchor, 16 | 8 | flags) : SelectionRange.create(anchor, head, (head > anchor ? 4 : 0) | flags);
  }
  /**
  @internal
  */
  static normalized(ranges, mainIndex = 0) {
    let main = ranges[mainIndex];
    ranges.sort((a, b) => a.from - b.from);
    mainIndex = ranges.indexOf(main);
    for (let i = 1; i < ranges.length; i++) {
      let range = ranges[i], prev = ranges[i - 1];
      if (range.empty ? range.from <= prev.to : range.from < prev.to) {
        let from = prev.from, to = Math.max(range.to, prev.to);
        if (i <= mainIndex)
          mainIndex--;
        ranges.splice(--i, 2, range.anchor > range.head ? EditorSelection.range(to, from) : EditorSelection.range(from, to));
      }
    }
    return new EditorSelection(ranges, mainIndex);
  }
}
function checkSelection(selection, docLength) {
  for (let range of selection.ranges)
    if (range.to > docLength)
      throw new RangeError("Selection points outside of document");
}
let nextID = 0;
class Facet {
  constructor(combine, compareInput, compare2, isStatic, enables) {
    this.combine = combine;
    this.compareInput = compareInput;
    this.compare = compare2;
    this.isStatic = isStatic;
    this.id = nextID++;
    this.default = combine([]);
    this.extensions = typeof enables == "function" ? enables(this) : enables;
  }
  /**
  Define a new facet.
  */
  static define(config2 = {}) {
    return new Facet(config2.combine || ((a) => a), config2.compareInput || ((a, b) => a === b), config2.compare || (!config2.combine ? sameArray$1 : (a, b) => a === b), !!config2.static, config2.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(value) {
    return new FacetProvider([], this, 0, value);
  }
  /**
  Create an extension that computes a value for the facet from a
  state. You must take care to declare the parts of the state that
  this value depends on, since your function is only called again
  for a new state when one of those parts changed.
  
  In cases where your value depends only on a single field, you'll
  want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
  */
  compute(deps, get) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new FacetProvider(deps, this, 1, get);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(deps, get) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new FacetProvider(deps, this, 2, get);
  }
  from(field, get) {
    if (!get)
      get = (x) => x;
    return this.compute([field], (state) => get(state.field(field)));
  }
}
function sameArray$1(a, b) {
  return a == b || a.length == b.length && a.every((e, i) => e === b[i]);
}
class FacetProvider {
  constructor(dependencies, facet, type, value) {
    this.dependencies = dependencies;
    this.facet = facet;
    this.type = type;
    this.value = value;
    this.id = nextID++;
  }
  dynamicSlot(addresses) {
    var _a2;
    let getter = this.value;
    let compare2 = this.facet.compareInput;
    let id2 = this.id, idx = addresses[id2] >> 1, multi = this.type == 2;
    let depDoc = false, depSel = false, depAddrs = [];
    for (let dep of this.dependencies) {
      if (dep == "doc")
        depDoc = true;
      else if (dep == "selection")
        depSel = true;
      else if ((((_a2 = addresses[dep.id]) !== null && _a2 !== void 0 ? _a2 : 1) & 1) == 0)
        depAddrs.push(addresses[dep.id]);
    }
    return {
      create(state) {
        state.values[idx] = getter(state);
        return 1;
      },
      update(state, tr) {
        if (depDoc && tr.docChanged || depSel && (tr.docChanged || tr.selection) || ensureAll(state, depAddrs)) {
          let newVal = getter(state);
          if (multi ? !compareArray(newVal, state.values[idx], compare2) : !compare2(newVal, state.values[idx])) {
            state.values[idx] = newVal;
            return 1;
          }
        }
        return 0;
      },
      reconfigure: (state, oldState) => {
        let newVal, oldAddr = oldState.config.address[id2];
        if (oldAddr != null) {
          let oldVal = getAddr(oldState, oldAddr);
          if (this.dependencies.every((dep) => {
            return dep instanceof Facet ? oldState.facet(dep) === state.facet(dep) : dep instanceof StateField ? oldState.field(dep, false) == state.field(dep, false) : true;
          }) || (multi ? compareArray(newVal = getter(state), oldVal, compare2) : compare2(newVal = getter(state), oldVal))) {
            state.values[idx] = oldVal;
            return 0;
          }
        } else {
          newVal = getter(state);
        }
        state.values[idx] = newVal;
        return 1;
      }
    };
  }
}
function compareArray(a, b, compare2) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++)
    if (!compare2(a[i], b[i]))
      return false;
  return true;
}
function ensureAll(state, addrs) {
  let changed = false;
  for (let addr of addrs)
    if (ensureAddr(state, addr) & 1)
      changed = true;
  return changed;
}
function dynamicFacetSlot(addresses, facet, providers) {
  let providerAddrs = providers.map((p) => addresses[p.id]);
  let providerTypes = providers.map((p) => p.type);
  let dynamic = providerAddrs.filter((p) => !(p & 1));
  let idx = addresses[facet.id] >> 1;
  function get(state) {
    let values = [];
    for (let i = 0; i < providerAddrs.length; i++) {
      let value = getAddr(state, providerAddrs[i]);
      if (providerTypes[i] == 2)
        for (let val of value)
          values.push(val);
      else
        values.push(value);
    }
    return facet.combine(values);
  }
  return {
    create(state) {
      for (let addr of providerAddrs)
        ensureAddr(state, addr);
      state.values[idx] = get(state);
      return 1;
    },
    update(state, tr) {
      if (!ensureAll(state, dynamic))
        return 0;
      let value = get(state);
      if (facet.compare(value, state.values[idx]))
        return 0;
      state.values[idx] = value;
      return 1;
    },
    reconfigure(state, oldState) {
      let depChanged = ensureAll(state, providerAddrs);
      let oldProviders = oldState.config.facets[facet.id], oldValue = oldState.facet(facet);
      if (oldProviders && !depChanged && sameArray$1(providers, oldProviders)) {
        state.values[idx] = oldValue;
        return 0;
      }
      let value = get(state);
      if (facet.compare(value, oldValue)) {
        state.values[idx] = oldValue;
        return 0;
      }
      state.values[idx] = value;
      return 1;
    }
  };
}
const initField = /* @__PURE__ */ Facet.define({ static: true });
class StateField {
  constructor(id2, createF, updateF, compareF, spec) {
    this.id = id2;
    this.createF = createF;
    this.updateF = updateF;
    this.compareF = compareF;
    this.spec = spec;
    this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(config2) {
    let field = new StateField(nextID++, config2.create, config2.update, config2.compare || ((a, b) => a === b), config2);
    if (config2.provide)
      field.provides = config2.provide(field);
    return field;
  }
  create(state) {
    let init = state.facet(initField).find((i) => i.field == this);
    return ((init === null || init === void 0 ? void 0 : init.create) || this.createF)(state);
  }
  /**
  @internal
  */
  slot(addresses) {
    let idx = addresses[this.id] >> 1;
    return {
      create: (state) => {
        state.values[idx] = this.create(state);
        return 1;
      },
      update: (state, tr) => {
        let oldVal = state.values[idx];
        let value = this.updateF(oldVal, tr);
        if (this.compareF(oldVal, value))
          return 0;
        state.values[idx] = value;
        return 1;
      },
      reconfigure: (state, oldState) => {
        if (oldState.config.address[this.id] != null) {
          state.values[idx] = oldState.field(this);
          return 0;
        }
        state.values[idx] = this.create(state);
        return 1;
      }
    };
  }
  /**
  Returns an extension that enables this field and overrides the
  way it is initialized. Can be useful when you need to provide a
  non-default starting value for the field.
  */
  init(create) {
    return [this, initField.of({ field: this, create })];
  }
  /**
  State field instances can be used as
  [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
  given state.
  */
  get extension() {
    return this;
  }
}
const Prec_ = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function prec(value) {
  return (ext) => new PrecExtension(ext, value);
}
const Prec = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ prec(Prec_.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ prec(Prec_.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ prec(Prec_.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ prec(Prec_.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ prec(Prec_.lowest)
};
class PrecExtension {
  constructor(inner, prec2) {
    this.inner = inner;
    this.prec = prec2;
  }
}
class Compartment {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(ext) {
    return new CompartmentInstance(this, ext);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(content2) {
    return Compartment.reconfigure.of({ compartment: this, extension: content2 });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(state) {
    return state.config.compartments.get(this);
  }
}
class CompartmentInstance {
  constructor(compartment, inner) {
    this.compartment = compartment;
    this.inner = inner;
  }
}
class Configuration {
  constructor(base2, compartments, dynamicSlots, address, staticValues, facets) {
    this.base = base2;
    this.compartments = compartments;
    this.dynamicSlots = dynamicSlots;
    this.address = address;
    this.staticValues = staticValues;
    this.facets = facets;
    this.statusTemplate = [];
    while (this.statusTemplate.length < dynamicSlots.length)
      this.statusTemplate.push(
        0
        /* SlotStatus.Unresolved */
      );
  }
  staticFacet(facet) {
    let addr = this.address[facet.id];
    return addr == null ? facet.default : this.staticValues[addr >> 1];
  }
  static resolve(base2, compartments, oldState) {
    let fields = [];
    let facets = /* @__PURE__ */ Object.create(null);
    let newCompartments = /* @__PURE__ */ new Map();
    for (let ext of flatten(base2, compartments, newCompartments)) {
      if (ext instanceof StateField)
        fields.push(ext);
      else
        (facets[ext.facet.id] || (facets[ext.facet.id] = [])).push(ext);
    }
    let address = /* @__PURE__ */ Object.create(null);
    let staticValues = [];
    let dynamicSlots = [];
    for (let field of fields) {
      address[field.id] = dynamicSlots.length << 1;
      dynamicSlots.push((a) => field.slot(a));
    }
    let oldFacets = oldState === null || oldState === void 0 ? void 0 : oldState.config.facets;
    for (let id2 in facets) {
      let providers = facets[id2], facet = providers[0].facet;
      let oldProviders = oldFacets && oldFacets[id2] || [];
      if (providers.every(
        (p) => p.type == 0
        /* Provider.Static */
      )) {
        address[facet.id] = staticValues.length << 1 | 1;
        if (sameArray$1(oldProviders, providers)) {
          staticValues.push(oldState.facet(facet));
        } else {
          let value = facet.combine(providers.map((p) => p.value));
          staticValues.push(oldState && facet.compare(value, oldState.facet(facet)) ? oldState.facet(facet) : value);
        }
      } else {
        for (let p of providers) {
          if (p.type == 0) {
            address[p.id] = staticValues.length << 1 | 1;
            staticValues.push(p.value);
          } else {
            address[p.id] = dynamicSlots.length << 1;
            dynamicSlots.push((a) => p.dynamicSlot(a));
          }
        }
        address[facet.id] = dynamicSlots.length << 1;
        dynamicSlots.push((a) => dynamicFacetSlot(a, facet, providers));
      }
    }
    let dynamic = dynamicSlots.map((f) => f(address));
    return new Configuration(base2, newCompartments, dynamic, address, staticValues, facets);
  }
}
function flatten(extension, compartments, newCompartments) {
  let result = [[], [], [], [], []];
  let seen = /* @__PURE__ */ new Map();
  function inner(ext, prec2) {
    let known = seen.get(ext);
    if (known != null) {
      if (known <= prec2)
        return;
      let found = result[known].indexOf(ext);
      if (found > -1)
        result[known].splice(found, 1);
      if (ext instanceof CompartmentInstance)
        newCompartments.delete(ext.compartment);
    }
    seen.set(ext, prec2);
    if (Array.isArray(ext)) {
      for (let e of ext)
        inner(e, prec2);
    } else if (ext instanceof CompartmentInstance) {
      if (newCompartments.has(ext.compartment))
        throw new RangeError(`Duplicate use of compartment in extensions`);
      let content2 = compartments.get(ext.compartment) || ext.inner;
      newCompartments.set(ext.compartment, content2);
      inner(content2, prec2);
    } else if (ext instanceof PrecExtension) {
      inner(ext.inner, ext.prec);
    } else if (ext instanceof StateField) {
      result[prec2].push(ext);
      if (ext.provides)
        inner(ext.provides, prec2);
    } else if (ext instanceof FacetProvider) {
      result[prec2].push(ext);
      if (ext.facet.extensions)
        inner(ext.facet.extensions, Prec_.default);
    } else {
      let content2 = ext.extension;
      if (!content2)
        throw new Error(`Unrecognized extension value in extension set (${ext}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      inner(content2, prec2);
    }
  }
  inner(extension, Prec_.default);
  return result.reduce((a, b) => a.concat(b));
}
function ensureAddr(state, addr) {
  if (addr & 1)
    return 2;
  let idx = addr >> 1;
  let status = state.status[idx];
  if (status == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (status & 2)
    return status;
  state.status[idx] = 4;
  let changed = state.computeSlot(state, state.config.dynamicSlots[idx]);
  return state.status[idx] = 2 | changed;
}
function getAddr(state, addr) {
  return addr & 1 ? state.config.staticValues[addr >> 1] : state.values[addr >> 1];
}
const languageData = /* @__PURE__ */ Facet.define();
const allowMultipleSelections = /* @__PURE__ */ Facet.define({
  combine: (values) => values.some((v) => v),
  static: true
});
const lineSeparator = /* @__PURE__ */ Facet.define({
  combine: (values) => values.length ? values[0] : void 0,
  static: true
});
const changeFilter = /* @__PURE__ */ Facet.define();
const transactionFilter = /* @__PURE__ */ Facet.define();
const transactionExtender = /* @__PURE__ */ Facet.define();
const readOnly = /* @__PURE__ */ Facet.define({
  combine: (values) => values.length ? values[0] : false
});
class Annotation {
  /**
  @internal
  */
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
  /**
  Define a new type of annotation.
  */
  static define() {
    return new AnnotationType();
  }
}
class AnnotationType {
  /**
  Create an instance of this annotation.
  */
  of(value) {
    return new Annotation(this, value);
  }
}
class StateEffectType {
  /**
  @internal
  */
  constructor(map) {
    this.map = map;
  }
  /**
  Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
  type.
  */
  of(value) {
    return new StateEffect(this, value);
  }
}
class StateEffect {
  /**
  @internal
  */
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
  /**
  Map this effect through a position mapping. Will return
  `undefined` when that ends up deleting the effect.
  */
  map(mapping) {
    let mapped = this.type.map(this.value, mapping);
    return mapped === void 0 ? void 0 : mapped == this.value ? this : new StateEffect(this.type, mapped);
  }
  /**
  Tells you whether this effect object is of a given
  [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
  */
  is(type) {
    return this.type == type;
  }
  /**
  Define a new effect type. The type parameter indicates the type
  of values that his effect holds.
  */
  static define(spec = {}) {
    return new StateEffectType(spec.map || ((v) => v));
  }
  /**
  Map an array of effects through a change set.
  */
  static mapEffects(effects, mapping) {
    if (!effects.length)
      return effects;
    let result = [];
    for (let effect of effects) {
      let mapped = effect.map(mapping);
      if (mapped)
        result.push(mapped);
    }
    return result;
  }
}
StateEffect.reconfigure = /* @__PURE__ */ StateEffect.define();
StateEffect.appendConfig = /* @__PURE__ */ StateEffect.define();
class Transaction {
  constructor(startState, changes, selection, effects, annotations, scrollIntoView2) {
    this.startState = startState;
    this.changes = changes;
    this.selection = selection;
    this.effects = effects;
    this.annotations = annotations;
    this.scrollIntoView = scrollIntoView2;
    this._doc = null;
    this._state = null;
    if (selection)
      checkSelection(selection, changes.newLength);
    if (!annotations.some((a) => a.type == Transaction.time))
      this.annotations = annotations.concat(Transaction.time.of(Date.now()));
  }
  /**
  @internal
  */
  static create(startState, changes, selection, effects, annotations, scrollIntoView2) {
    return new Transaction(startState, changes, selection, effects, annotations, scrollIntoView2);
  }
  /**
  The new document produced by the transaction. Contrary to
  [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
  force the entire new state to be computed right away, so it is
  recommended that [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
  when they need to look at the new document.
  */
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  /**
  The new selection produced by the transaction. If
  [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
  this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
  current selection through the changes made by the transaction.
  */
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  /**
  The new state created by the transaction. Computed on demand
  (but retained for subsequent access), so it is recommended not to
  access it in [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
  */
  get state() {
    if (!this._state)
      this.startState.applyTransaction(this);
    return this._state;
  }
  /**
  Get the value of the given annotation type, if any.
  */
  annotation(type) {
    for (let ann of this.annotations)
      if (ann.type == type)
        return ann.value;
    return void 0;
  }
  /**
  Indicates whether the transaction changed the document.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Indicates whether this transaction reconfigures the state
  (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
  with a top-level configuration
  [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
  */
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
  /**
  Returns true if the transaction has a [user
  event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
  or more specific than `event`. For example, if the transaction
  has `"select.pointer"` as user event, `"select"` and
  `"select.pointer"` will match it.
  */
  isUserEvent(event) {
    let e = this.annotation(Transaction.userEvent);
    return !!(e && (e == event || e.length > event.length && e.slice(0, event.length) == event && e[event.length] == "."));
  }
}
Transaction.time = /* @__PURE__ */ Annotation.define();
Transaction.userEvent = /* @__PURE__ */ Annotation.define();
Transaction.addToHistory = /* @__PURE__ */ Annotation.define();
Transaction.remote = /* @__PURE__ */ Annotation.define();
function joinRanges(a, b) {
  let result = [];
  for (let iA = 0, iB = 0; ; ) {
    let from, to;
    if (iA < a.length && (iB == b.length || b[iB] >= a[iA])) {
      from = a[iA++];
      to = a[iA++];
    } else if (iB < b.length) {
      from = b[iB++];
      to = b[iB++];
    } else
      return result;
    if (!result.length || result[result.length - 1] < from)
      result.push(from, to);
    else if (result[result.length - 1] < to)
      result[result.length - 1] = to;
  }
}
function mergeTransaction(a, b, sequential) {
  var _a2;
  let mapForA, mapForB, changes;
  if (sequential) {
    mapForA = b.changes;
    mapForB = ChangeSet.empty(b.changes.length);
    changes = a.changes.compose(b.changes);
  } else {
    mapForA = b.changes.map(a.changes);
    mapForB = a.changes.mapDesc(b.changes, true);
    changes = a.changes.compose(mapForA);
  }
  return {
    changes,
    selection: b.selection ? b.selection.map(mapForB) : (_a2 = a.selection) === null || _a2 === void 0 ? void 0 : _a2.map(mapForA),
    effects: StateEffect.mapEffects(a.effects, mapForA).concat(StateEffect.mapEffects(b.effects, mapForB)),
    annotations: a.annotations.length ? a.annotations.concat(b.annotations) : b.annotations,
    scrollIntoView: a.scrollIntoView || b.scrollIntoView
  };
}
function resolveTransactionInner(state, spec, docSize) {
  let sel = spec.selection, annotations = asArray$1(spec.annotations);
  if (spec.userEvent)
    annotations = annotations.concat(Transaction.userEvent.of(spec.userEvent));
  return {
    changes: spec.changes instanceof ChangeSet ? spec.changes : ChangeSet.of(spec.changes || [], docSize, state.facet(lineSeparator)),
    selection: sel && (sel instanceof EditorSelection ? sel : EditorSelection.single(sel.anchor, sel.head)),
    effects: asArray$1(spec.effects),
    annotations,
    scrollIntoView: !!spec.scrollIntoView
  };
}
function resolveTransaction(state, specs, filter) {
  let s = resolveTransactionInner(state, specs.length ? specs[0] : {}, state.doc.length);
  if (specs.length && specs[0].filter === false)
    filter = false;
  for (let i = 1; i < specs.length; i++) {
    if (specs[i].filter === false)
      filter = false;
    let seq = !!specs[i].sequential;
    s = mergeTransaction(s, resolveTransactionInner(state, specs[i], seq ? s.changes.newLength : state.doc.length), seq);
  }
  let tr = Transaction.create(state, s.changes, s.selection, s.effects, s.annotations, s.scrollIntoView);
  return extendTransaction(filter ? filterTransaction(tr) : tr);
}
function filterTransaction(tr) {
  let state = tr.startState;
  let result = true;
  for (let filter of state.facet(changeFilter)) {
    let value = filter(tr);
    if (value === false) {
      result = false;
      break;
    }
    if (Array.isArray(value))
      result = result === true ? value : joinRanges(result, value);
  }
  if (result !== true) {
    let changes, back;
    if (result === false) {
      back = tr.changes.invertedDesc;
      changes = ChangeSet.empty(state.doc.length);
    } else {
      let filtered = tr.changes.filter(result);
      changes = filtered.changes;
      back = filtered.filtered.mapDesc(filtered.changes).invertedDesc;
    }
    tr = Transaction.create(state, changes, tr.selection && tr.selection.map(back), StateEffect.mapEffects(tr.effects, back), tr.annotations, tr.scrollIntoView);
  }
  let filters = state.facet(transactionFilter);
  for (let i = filters.length - 1; i >= 0; i--) {
    let filtered = filters[i](tr);
    if (filtered instanceof Transaction)
      tr = filtered;
    else if (Array.isArray(filtered) && filtered.length == 1 && filtered[0] instanceof Transaction)
      tr = filtered[0];
    else
      tr = resolveTransaction(state, asArray$1(filtered), false);
  }
  return tr;
}
function extendTransaction(tr) {
  let state = tr.startState, extenders = state.facet(transactionExtender), spec = tr;
  for (let i = extenders.length - 1; i >= 0; i--) {
    let extension = extenders[i](tr);
    if (extension && Object.keys(extension).length)
      spec = mergeTransaction(spec, resolveTransactionInner(state, extension, tr.changes.newLength), true);
  }
  return spec == tr ? tr : Transaction.create(state, tr.changes, tr.selection, spec.effects, spec.annotations, spec.scrollIntoView);
}
const none$2 = [];
function asArray$1(value) {
  return value == null ? none$2 : Array.isArray(value) ? value : [value];
}
var CharCategory = /* @__PURE__ */ function(CharCategory2) {
  CharCategory2[CharCategory2["Word"] = 0] = "Word";
  CharCategory2[CharCategory2["Space"] = 1] = "Space";
  CharCategory2[CharCategory2["Other"] = 2] = "Other";
  return CharCategory2;
}(CharCategory || (CharCategory = {}));
const nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let wordChar;
try {
  wordChar = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch (_) {
}
function hasWordChar(str) {
  if (wordChar)
    return wordChar.test(str);
  for (let i = 0; i < str.length; i++) {
    let ch = str[i];
    if (/\w/.test(ch) || ch > "" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch)))
      return true;
  }
  return false;
}
function makeCategorizer(wordChars) {
  return (char) => {
    if (!/\S/.test(char))
      return CharCategory.Space;
    if (hasWordChar(char))
      return CharCategory.Word;
    for (let i = 0; i < wordChars.length; i++)
      if (char.indexOf(wordChars[i]) > -1)
        return CharCategory.Word;
    return CharCategory.Other;
  };
}
class EditorState {
  constructor(config2, doc2, selection, values, computeSlot, tr) {
    this.config = config2;
    this.doc = doc2;
    this.selection = selection;
    this.values = values;
    this.status = config2.statusTemplate.slice();
    this.computeSlot = computeSlot;
    if (tr)
      tr._state = this;
    for (let i = 0; i < this.config.dynamicSlots.length; i++)
      ensureAddr(this, i << 1);
    this.computeSlot = null;
  }
  field(field, require2 = true) {
    let addr = this.config.address[field.id];
    if (addr == null) {
      if (require2)
        throw new RangeError("Field is not present in this state");
      return void 0;
    }
    ensureAddr(this, addr);
    return getAddr(this, addr);
  }
  /**
  Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
  state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
  can be passed. Unless
  [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
  [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
  are assumed to start in the _current_ document (not the document
  produced by previous specs), and its
  [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
  [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
  to the document created by its _own_ changes. The resulting
  transaction contains the combined effect of all the different
  specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
  specs take precedence over earlier ones.
  */
  update(...specs) {
    return resolveTransaction(this, specs, true);
  }
  /**
  @internal
  */
  applyTransaction(tr) {
    let conf = this.config, { base: base2, compartments } = conf;
    for (let effect of tr.effects) {
      if (effect.is(Compartment.reconfigure)) {
        if (conf) {
          compartments = /* @__PURE__ */ new Map();
          conf.compartments.forEach((val, key) => compartments.set(key, val));
          conf = null;
        }
        compartments.set(effect.value.compartment, effect.value.extension);
      } else if (effect.is(StateEffect.reconfigure)) {
        conf = null;
        base2 = effect.value;
      } else if (effect.is(StateEffect.appendConfig)) {
        conf = null;
        base2 = asArray$1(base2).concat(effect.value);
      }
    }
    let startValues;
    if (!conf) {
      conf = Configuration.resolve(base2, compartments, this);
      let intermediateState = new EditorState(conf, this.doc, this.selection, conf.dynamicSlots.map(() => null), (state, slot) => slot.reconfigure(state, this), null);
      startValues = intermediateState.values;
    } else {
      startValues = tr.startState.values.slice();
    }
    new EditorState(conf, tr.newDoc, tr.newSelection, startValues, (state, slot) => slot.update(state, tr), tr);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(text) {
    if (typeof text == "string")
      text = this.toText(text);
    return this.changeByRange((range) => ({
      changes: { from: range.from, to: range.to, insert: text },
      range: EditorSelection.cursor(range.from + text.length)
    }));
  }
  /**
  Create a set of changes and a new selection by running the given
  function for each range in the active selection. The function
  can return an optional set of changes (in the coordinate space
  of the start document), plus an updated range (in the coordinate
  space of the document produced by the call's own changes). This
  method will merge all the changes and ranges into a single
  changeset and selection, and return it as a [transaction
  spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
  [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
  */
  changeByRange(f) {
    let sel = this.selection;
    let result1 = f(sel.ranges[0]);
    let changes = this.changes(result1.changes), ranges = [result1.range];
    let effects = asArray$1(result1.effects);
    for (let i = 1; i < sel.ranges.length; i++) {
      let result = f(sel.ranges[i]);
      let newChanges = this.changes(result.changes), newMapped = newChanges.map(changes);
      for (let j = 0; j < i; j++)
        ranges[j] = ranges[j].map(newMapped);
      let mapBy = changes.mapDesc(newChanges, true);
      ranges.push(result.range.map(mapBy));
      changes = changes.compose(newMapped);
      effects = StateEffect.mapEffects(effects, newMapped).concat(StateEffect.mapEffects(asArray$1(result.effects), mapBy));
    }
    return {
      changes,
      selection: EditorSelection.create(ranges, sel.mainIndex),
      effects
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(spec = []) {
    if (spec instanceof ChangeSet)
      return spec;
    return ChangeSet.of(spec, this.doc.length, this.facet(EditorState.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(string2) {
    return Text.of(string2.split(this.facet(EditorState.lineSeparator) || DefaultSplit));
  }
  /**
  Return the given range of the document as a string.
  */
  sliceDoc(from = 0, to = this.doc.length) {
    return this.doc.sliceString(from, to, this.lineBreak);
  }
  /**
  Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
  */
  facet(facet) {
    let addr = this.config.address[facet.id];
    if (addr == null)
      return facet.default;
    ensureAddr(this, addr);
    return getAddr(this, addr);
  }
  /**
  Convert this state to a JSON-serializable object. When custom
  fields should be serialized, you can pass them in as an object
  mapping property names (in the resulting object, which should
  not use `doc` or `selection`) to fields.
  */
  toJSON(fields) {
    let result = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (fields)
      for (let prop in fields) {
        let value = fields[prop];
        if (value instanceof StateField && this.config.address[value.id] != null)
          result[prop] = value.spec.toJSON(this.field(fields[prop]), this);
      }
    return result;
  }
  /**
  Deserialize a state from its JSON representation. When custom
  fields should be deserialized, pass the same object you passed
  to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
  third argument.
  */
  static fromJSON(json, config2 = {}, fields) {
    if (!json || typeof json.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let fieldInit = [];
    if (fields)
      for (let prop in fields) {
        if (Object.prototype.hasOwnProperty.call(json, prop)) {
          let field = fields[prop], value = json[prop];
          fieldInit.push(field.init((state) => field.spec.fromJSON(value, state)));
        }
      }
    return EditorState.create({
      doc: json.doc,
      selection: EditorSelection.fromJSON(json.selection),
      extensions: config2.extensions ? fieldInit.concat([config2.extensions]) : fieldInit
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(config2 = {}) {
    let configuration = Configuration.resolve(config2.extensions || [], /* @__PURE__ */ new Map());
    let doc2 = config2.doc instanceof Text ? config2.doc : Text.of((config2.doc || "").split(configuration.staticFacet(EditorState.lineSeparator) || DefaultSplit));
    let selection = !config2.selection ? EditorSelection.single(0) : config2.selection instanceof EditorSelection ? config2.selection : EditorSelection.single(config2.selection.anchor, config2.selection.head);
    checkSelection(selection, doc2.length);
    if (!configuration.staticFacet(allowMultipleSelections))
      selection = selection.asSingle();
    return new EditorState(configuration, doc2, selection, configuration.dynamicSlots.map(() => null), (state, slot) => slot.create(state), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(EditorState.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(EditorState.lineSeparator) || "\n";
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(readOnly);
  }
  /**
  Look up a translation for the given phrase (via the
  [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
  original string if no translation is found.
  
  If additional arguments are passed, they will be inserted in
  place of markers like `$1` (for the first value) and `$2`, etc.
  A single `$` is equivalent to `$1`, and `$$` will produce a
  literal dollar sign.
  */
  phrase(phrase2, ...insert2) {
    for (let map of this.facet(EditorState.phrases))
      if (Object.prototype.hasOwnProperty.call(map, phrase2)) {
        phrase2 = map[phrase2];
        break;
      }
    if (insert2.length)
      phrase2 = phrase2.replace(/\$(\$|\d*)/g, (m, i) => {
        if (i == "$")
          return "$";
        let n = +(i || 1);
        return !n || n > insert2.length ? m : insert2[n - 1];
      });
    return phrase2;
  }
  /**
  Find the values for a given language data field, provided by the
  the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
  
  Examples of language data fields are...
  
  - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
    comment syntax.
  - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
    for providing language-specific completion sources.
  - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
    characters that should be considered part of words in this
    language.
  - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
    bracket closing behavior.
  */
  languageDataAt(name2, pos, side = -1) {
    let values = [];
    for (let provider of this.facet(languageData)) {
      for (let result of provider(this, pos, side)) {
        if (Object.prototype.hasOwnProperty.call(result, name2))
          values.push(result[name2]);
      }
    }
    return values;
  }
  /**
  Return a function that can categorize strings (expected to
  represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
  into one of:
  
   - Word (contains an alphanumeric character or a character
     explicitly listed in the local language's `"wordChars"`
     language data, which should be a string)
   - Space (contains only whitespace)
   - Other (anything else)
  */
  charCategorizer(at) {
    return makeCategorizer(this.languageDataAt("wordChars", at).join(""));
  }
  /**
  Find the word at the given position, meaning the range
  containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
  around it. If no word characters are adjacent to the position,
  this returns null.
  */
  wordAt(pos) {
    let { text, from, length } = this.doc.lineAt(pos);
    let cat = this.charCategorizer(pos);
    let start = pos - from, end = pos - from;
    while (start > 0) {
      let prev = findClusterBreak(text, start, false);
      if (cat(text.slice(prev, start)) != CharCategory.Word)
        break;
      start = prev;
    }
    while (end < length) {
      let next = findClusterBreak(text, end);
      if (cat(text.slice(end, next)) != CharCategory.Word)
        break;
      end = next;
    }
    return start == end ? null : EditorSelection.range(start + from, end + from);
  }
}
EditorState.allowMultipleSelections = allowMultipleSelections;
EditorState.tabSize = /* @__PURE__ */ Facet.define({
  combine: (values) => values.length ? values[0] : 4
});
EditorState.lineSeparator = lineSeparator;
EditorState.readOnly = readOnly;
EditorState.phrases = /* @__PURE__ */ Facet.define({
  compare(a, b) {
    let kA = Object.keys(a), kB = Object.keys(b);
    return kA.length == kB.length && kA.every((k) => a[k] == b[k]);
  }
});
EditorState.languageData = languageData;
EditorState.changeFilter = changeFilter;
EditorState.transactionFilter = transactionFilter;
EditorState.transactionExtender = transactionExtender;
Compartment.reconfigure = /* @__PURE__ */ StateEffect.define();
function combineConfig(configs, defaults2, combine = {}) {
  let result = {};
  for (let config2 of configs)
    for (let key of Object.keys(config2)) {
      let value = config2[key], current = result[key];
      if (current === void 0)
        result[key] = value;
      else if (current === value || value === void 0)
        ;
      else if (Object.hasOwnProperty.call(combine, key))
        result[key] = combine[key](current, value);
      else
        throw new Error("Config merge conflict for field " + key);
    }
  for (let key in defaults2)
    if (result[key] === void 0)
      result[key] = defaults2[key];
  return result;
}
class RangeValue {
  /**
  Compare this value with another value. Used when comparing
  rangesets. The default implementation compares by identity.
  Unless you are only creating a fixed number of unique instances
  of your value type, it is a good idea to implement this
  properly.
  */
  eq(other) {
    return this == other;
  }
  /**
  Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
  */
  range(from, to = from) {
    return Range$1.create(from, to, this);
  }
}
RangeValue.prototype.startSide = RangeValue.prototype.endSide = 0;
RangeValue.prototype.point = false;
RangeValue.prototype.mapMode = MapMode.TrackDel;
let Range$1 = class Range {
  constructor(from, to, value) {
    this.from = from;
    this.to = to;
    this.value = value;
  }
  /**
  @internal
  */
  static create(from, to, value) {
    return new Range(from, to, value);
  }
};
function cmpRange(a, b) {
  return a.from - b.from || a.value.startSide - b.value.startSide;
}
class Chunk {
  constructor(from, to, value, maxPoint) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.maxPoint = maxPoint;
  }
  get length() {
    return this.to[this.to.length - 1];
  }
  // Find the index of the given position and side. Use the ranges'
  // `from` pos when `end == false`, `to` when `end == true`.
  findIndex(pos, side, end, startAt = 0) {
    let arr = end ? this.to : this.from;
    for (let lo = startAt, hi = arr.length; ; ) {
      if (lo == hi)
        return lo;
      let mid = lo + hi >> 1;
      let diff = arr[mid] - pos || (end ? this.value[mid].endSide : this.value[mid].startSide) - side;
      if (mid == lo)
        return diff >= 0 ? lo : hi;
      if (diff >= 0)
        hi = mid;
      else
        lo = mid + 1;
    }
  }
  between(offset, from, to, f) {
    for (let i = this.findIndex(from, -1e9, true), e = this.findIndex(to, 1e9, false, i); i < e; i++)
      if (f(this.from[i] + offset, this.to[i] + offset, this.value[i]) === false)
        return false;
  }
  map(offset, changes) {
    let value = [], from = [], to = [], newPos = -1, maxPoint = -1;
    for (let i = 0; i < this.value.length; i++) {
      let val = this.value[i], curFrom = this.from[i] + offset, curTo = this.to[i] + offset, newFrom, newTo;
      if (curFrom == curTo) {
        let mapped = changes.mapPos(curFrom, val.startSide, val.mapMode);
        if (mapped == null)
          continue;
        newFrom = newTo = mapped;
        if (val.startSide != val.endSide) {
          newTo = changes.mapPos(curFrom, val.endSide);
          if (newTo < newFrom)
            continue;
        }
      } else {
        newFrom = changes.mapPos(curFrom, val.startSide);
        newTo = changes.mapPos(curTo, val.endSide);
        if (newFrom > newTo || newFrom == newTo && val.startSide > 0 && val.endSide <= 0)
          continue;
      }
      if ((newTo - newFrom || val.endSide - val.startSide) < 0)
        continue;
      if (newPos < 0)
        newPos = newFrom;
      if (val.point)
        maxPoint = Math.max(maxPoint, newTo - newFrom);
      value.push(val);
      from.push(newFrom - newPos);
      to.push(newTo - newPos);
    }
    return { mapped: value.length ? new Chunk(from, to, value, maxPoint) : null, pos: newPos };
  }
}
class RangeSet {
  constructor(chunkPos, chunk, nextLayer, maxPoint) {
    this.chunkPos = chunkPos;
    this.chunk = chunk;
    this.nextLayer = nextLayer;
    this.maxPoint = maxPoint;
  }
  /**
  @internal
  */
  static create(chunkPos, chunk, nextLayer, maxPoint) {
    return new RangeSet(chunkPos, chunk, nextLayer, maxPoint);
  }
  /**
  @internal
  */
  get length() {
    let last = this.chunk.length - 1;
    return last < 0 ? 0 : Math.max(this.chunkEnd(last), this.nextLayer.length);
  }
  /**
  The number of ranges in the set.
  */
  get size() {
    if (this.isEmpty)
      return 0;
    let size = this.nextLayer.size;
    for (let chunk of this.chunk)
      size += chunk.value.length;
    return size;
  }
  /**
  @internal
  */
  chunkEnd(index) {
    return this.chunkPos[index] + this.chunk[index].length;
  }
  /**
  Update the range set, optionally adding new ranges or filtering
  out existing ones.
  
  (Note: The type parameter is just there as a kludge to work
  around TypeScript variance issues that prevented `RangeSet<X>`
  from being a subtype of `RangeSet<Y>` when `X` is a subtype of
  `Y`.)
  */
  update(updateSpec) {
    let { add: add2 = [], sort = false, filterFrom = 0, filterTo = this.length } = updateSpec;
    let filter = updateSpec.filter;
    if (add2.length == 0 && !filter)
      return this;
    if (sort)
      add2 = add2.slice().sort(cmpRange);
    if (this.isEmpty)
      return add2.length ? RangeSet.of(add2) : this;
    let cur2 = new LayerCursor(this, null, -1).goto(0), i = 0, spill = [];
    let builder = new RangeSetBuilder();
    while (cur2.value || i < add2.length) {
      if (i < add2.length && (cur2.from - add2[i].from || cur2.startSide - add2[i].value.startSide) >= 0) {
        let range = add2[i++];
        if (!builder.addInner(range.from, range.to, range.value))
          spill.push(range);
      } else if (cur2.rangeIndex == 1 && cur2.chunkIndex < this.chunk.length && (i == add2.length || this.chunkEnd(cur2.chunkIndex) < add2[i].from) && (!filter || filterFrom > this.chunkEnd(cur2.chunkIndex) || filterTo < this.chunkPos[cur2.chunkIndex]) && builder.addChunk(this.chunkPos[cur2.chunkIndex], this.chunk[cur2.chunkIndex])) {
        cur2.nextChunk();
      } else {
        if (!filter || filterFrom > cur2.to || filterTo < cur2.from || filter(cur2.from, cur2.to, cur2.value)) {
          if (!builder.addInner(cur2.from, cur2.to, cur2.value))
            spill.push(Range$1.create(cur2.from, cur2.to, cur2.value));
        }
        cur2.next();
      }
    }
    return builder.finishInner(this.nextLayer.isEmpty && !spill.length ? RangeSet.empty : this.nextLayer.update({ add: spill, filter, filterFrom, filterTo }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(changes) {
    if (changes.empty || this.isEmpty)
      return this;
    let chunks = [], chunkPos = [], maxPoint = -1;
    for (let i = 0; i < this.chunk.length; i++) {
      let start = this.chunkPos[i], chunk = this.chunk[i];
      let touch = changes.touchesRange(start, start + chunk.length);
      if (touch === false) {
        maxPoint = Math.max(maxPoint, chunk.maxPoint);
        chunks.push(chunk);
        chunkPos.push(changes.mapPos(start));
      } else if (touch === true) {
        let { mapped, pos } = chunk.map(start, changes);
        if (mapped) {
          maxPoint = Math.max(maxPoint, mapped.maxPoint);
          chunks.push(mapped);
          chunkPos.push(pos);
        }
      }
    }
    let next = this.nextLayer.map(changes);
    return chunks.length == 0 ? next : new RangeSet(chunkPos, chunks, next || RangeSet.empty, maxPoint);
  }
  /**
  Iterate over the ranges that touch the region `from` to `to`,
  calling `f` for each. There is no guarantee that the ranges will
  be reported in any specific order. When the callback returns
  `false`, iteration stops.
  */
  between(from, to, f) {
    if (this.isEmpty)
      return;
    for (let i = 0; i < this.chunk.length; i++) {
      let start = this.chunkPos[i], chunk = this.chunk[i];
      if (to >= start && from <= start + chunk.length && chunk.between(start, from - start, to - start, f) === false)
        return;
    }
    this.nextLayer.between(from, to, f);
  }
  /**
  Iterate over the ranges in this set, in order, including all
  ranges that end at or after `from`.
  */
  iter(from = 0) {
    return HeapCursor.from([this]).goto(from);
  }
  /**
  @internal
  */
  get isEmpty() {
    return this.nextLayer == this;
  }
  /**
  Iterate over the ranges in a collection of sets, in order,
  starting from `from`.
  */
  static iter(sets, from = 0) {
    return HeapCursor.from(sets).goto(from);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(oldSets, newSets, textDiff, comparator, minPointSize = -1) {
    let a = oldSets.filter((set) => set.maxPoint > 0 || !set.isEmpty && set.maxPoint >= minPointSize);
    let b = newSets.filter((set) => set.maxPoint > 0 || !set.isEmpty && set.maxPoint >= minPointSize);
    let sharedChunks = findSharedChunks(a, b, textDiff);
    let sideA = new SpanCursor(a, sharedChunks, minPointSize);
    let sideB = new SpanCursor(b, sharedChunks, minPointSize);
    textDiff.iterGaps((fromA, fromB, length) => compare(sideA, fromA, sideB, fromB, length, comparator));
    if (textDiff.empty && textDiff.length == 0)
      compare(sideA, 0, sideB, 0, 0, comparator);
  }
  /**
  Compare the contents of two groups of range sets, returning true
  if they are equivalent in the given range.
  */
  static eq(oldSets, newSets, from = 0, to) {
    if (to == null)
      to = 1e9 - 1;
    let a = oldSets.filter((set) => !set.isEmpty && newSets.indexOf(set) < 0);
    let b = newSets.filter((set) => !set.isEmpty && oldSets.indexOf(set) < 0);
    if (a.length != b.length)
      return false;
    if (!a.length)
      return true;
    let sharedChunks = findSharedChunks(a, b);
    let sideA = new SpanCursor(a, sharedChunks, 0).goto(from), sideB = new SpanCursor(b, sharedChunks, 0).goto(from);
    for (; ; ) {
      if (sideA.to != sideB.to || !sameValues(sideA.active, sideB.active) || sideA.point && (!sideB.point || !sideA.point.eq(sideB.point)))
        return false;
      if (sideA.to > to)
        return true;
      sideA.next();
      sideB.next();
    }
  }
  /**
  Iterate over a group of range sets at the same time, notifying
  the iterator about the ranges covering every given piece of
  content. Returns the open count (see
  [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
  of the iteration.
  */
  static spans(sets, from, to, iterator, minPointSize = -1) {
    let cursor = new SpanCursor(sets, null, minPointSize).goto(from), pos = from;
    let openRanges = cursor.openStart;
    for (; ; ) {
      let curTo = Math.min(cursor.to, to);
      if (cursor.point) {
        let active = cursor.activeForPoint(cursor.to);
        let openCount = cursor.pointFrom < from ? active.length + 1 : Math.min(active.length, openRanges);
        iterator.point(pos, curTo, cursor.point, active, openCount, cursor.pointRank);
        openRanges = Math.min(cursor.openEnd(curTo), active.length);
      } else if (curTo > pos) {
        iterator.span(pos, curTo, cursor.active, openRanges);
        openRanges = cursor.openEnd(curTo);
      }
      if (cursor.to > to)
        return openRanges + (cursor.point && cursor.to > to ? 1 : 0);
      pos = cursor.to;
      cursor.next();
    }
  }
  /**
  Create a range set for the given range or array of ranges. By
  default, this expects the ranges to be _sorted_ (by start
  position and, if two start at the same position,
  `value.startSide`). You can pass `true` as second argument to
  cause the method to sort them.
  */
  static of(ranges, sort = false) {
    let build = new RangeSetBuilder();
    for (let range of ranges instanceof Range$1 ? [ranges] : sort ? lazySort(ranges) : ranges)
      build.add(range.from, range.to, range.value);
    return build.finish();
  }
}
RangeSet.empty = /* @__PURE__ */ new RangeSet([], [], null, -1);
function lazySort(ranges) {
  if (ranges.length > 1)
    for (let prev = ranges[0], i = 1; i < ranges.length; i++) {
      let cur2 = ranges[i];
      if (cmpRange(prev, cur2) > 0)
        return ranges.slice().sort(cmpRange);
      prev = cur2;
    }
  return ranges;
}
RangeSet.empty.nextLayer = RangeSet.empty;
class RangeSetBuilder {
  /**
  Create an empty builder.
  */
  constructor() {
    this.chunks = [];
    this.chunkPos = [];
    this.chunkStart = -1;
    this.last = null;
    this.lastFrom = -1e9;
    this.lastTo = -1e9;
    this.from = [];
    this.to = [];
    this.value = [];
    this.maxPoint = -1;
    this.setMaxPoint = -1;
    this.nextLayer = null;
  }
  finishChunk(newArrays) {
    this.chunks.push(new Chunk(this.from, this.to, this.value, this.maxPoint));
    this.chunkPos.push(this.chunkStart);
    this.chunkStart = -1;
    this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint);
    this.maxPoint = -1;
    if (newArrays) {
      this.from = [];
      this.to = [];
      this.value = [];
    }
  }
  /**
  Add a range. Ranges should be added in sorted (by `from` and
  `value.startSide`) order.
  */
  add(from, to, value) {
    if (!this.addInner(from, to, value))
      (this.nextLayer || (this.nextLayer = new RangeSetBuilder())).add(from, to, value);
  }
  /**
  @internal
  */
  addInner(from, to, value) {
    let diff = from - this.lastTo || value.startSide - this.last.endSide;
    if (diff <= 0 && (from - this.lastFrom || value.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    if (diff < 0)
      return false;
    if (this.from.length == 250)
      this.finishChunk(true);
    if (this.chunkStart < 0)
      this.chunkStart = from;
    this.from.push(from - this.chunkStart);
    this.to.push(to - this.chunkStart);
    this.last = value;
    this.lastFrom = from;
    this.lastTo = to;
    this.value.push(value);
    if (value.point)
      this.maxPoint = Math.max(this.maxPoint, to - from);
    return true;
  }
  /**
  @internal
  */
  addChunk(from, chunk) {
    if ((from - this.lastTo || chunk.value[0].startSide - this.last.endSide) < 0)
      return false;
    if (this.from.length)
      this.finishChunk(true);
    this.setMaxPoint = Math.max(this.setMaxPoint, chunk.maxPoint);
    this.chunks.push(chunk);
    this.chunkPos.push(from);
    let last = chunk.value.length - 1;
    this.last = chunk.value[last];
    this.lastFrom = chunk.from[last] + from;
    this.lastTo = chunk.to[last] + from;
    return true;
  }
  /**
  Finish the range set. Returns the new set. The builder can't be
  used anymore after this has been called.
  */
  finish() {
    return this.finishInner(RangeSet.empty);
  }
  /**
  @internal
  */
  finishInner(next) {
    if (this.from.length)
      this.finishChunk(false);
    if (this.chunks.length == 0)
      return next;
    let result = RangeSet.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(next) : next, this.setMaxPoint);
    this.from = null;
    return result;
  }
}
function findSharedChunks(a, b, textDiff) {
  let inA = /* @__PURE__ */ new Map();
  for (let set of a)
    for (let i = 0; i < set.chunk.length; i++)
      if (set.chunk[i].maxPoint <= 0)
        inA.set(set.chunk[i], set.chunkPos[i]);
  let shared = /* @__PURE__ */ new Set();
  for (let set of b)
    for (let i = 0; i < set.chunk.length; i++) {
      let known = inA.get(set.chunk[i]);
      if (known != null && (textDiff ? textDiff.mapPos(known) : known) == set.chunkPos[i] && !(textDiff === null || textDiff === void 0 ? void 0 : textDiff.touchesRange(known, known + set.chunk[i].length)))
        shared.add(set.chunk[i]);
    }
  return shared;
}
class LayerCursor {
  constructor(layer2, skip, minPoint, rank = 0) {
    this.layer = layer2;
    this.skip = skip;
    this.minPoint = minPoint;
    this.rank = rank;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(pos, side = -1e9) {
    this.chunkIndex = this.rangeIndex = 0;
    this.gotoInner(pos, side, false);
    return this;
  }
  gotoInner(pos, side, forward) {
    while (this.chunkIndex < this.layer.chunk.length) {
      let next = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(next) || this.layer.chunkEnd(this.chunkIndex) < pos || next.maxPoint < this.minPoint))
        break;
      this.chunkIndex++;
      forward = false;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let rangeIndex = this.layer.chunk[this.chunkIndex].findIndex(pos - this.layer.chunkPos[this.chunkIndex], side, true);
      if (!forward || this.rangeIndex < rangeIndex)
        this.setRangeIndex(rangeIndex);
    }
    this.next();
  }
  forward(pos, side) {
    if ((this.to - pos || this.endSide - side) < 0)
      this.gotoInner(pos, side, true);
  }
  next() {
    for (; ; ) {
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9;
        this.value = null;
        break;
      } else {
        let chunkPos = this.layer.chunkPos[this.chunkIndex], chunk = this.layer.chunk[this.chunkIndex];
        let from = chunkPos + chunk.from[this.rangeIndex];
        this.from = from;
        this.to = chunkPos + chunk.to[this.rangeIndex];
        this.value = chunk.value[this.rangeIndex];
        this.setRangeIndex(this.rangeIndex + 1);
        if (this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
    }
  }
  setRangeIndex(index) {
    if (index == this.layer.chunk[this.chunkIndex].value.length) {
      this.chunkIndex++;
      if (this.skip) {
        while (this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]))
          this.chunkIndex++;
      }
      this.rangeIndex = 0;
    } else {
      this.rangeIndex = index;
    }
  }
  nextChunk() {
    this.chunkIndex++;
    this.rangeIndex = 0;
    this.next();
  }
  compare(other) {
    return this.from - other.from || this.startSide - other.startSide || this.rank - other.rank || this.to - other.to || this.endSide - other.endSide;
  }
}
class HeapCursor {
  constructor(heap) {
    this.heap = heap;
  }
  static from(sets, skip = null, minPoint = -1) {
    let heap = [];
    for (let i = 0; i < sets.length; i++) {
      for (let cur2 = sets[i]; !cur2.isEmpty; cur2 = cur2.nextLayer) {
        if (cur2.maxPoint >= minPoint)
          heap.push(new LayerCursor(cur2, skip, minPoint, i));
      }
    }
    return heap.length == 1 ? heap[0] : new HeapCursor(heap);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(pos, side = -1e9) {
    for (let cur2 of this.heap)
      cur2.goto(pos, side);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      heapBubble(this.heap, i);
    this.next();
    return this;
  }
  forward(pos, side) {
    for (let cur2 of this.heap)
      cur2.forward(pos, side);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      heapBubble(this.heap, i);
    if ((this.to - pos || this.value.endSide - side) < 0)
      this.next();
  }
  next() {
    if (this.heap.length == 0) {
      this.from = this.to = 1e9;
      this.value = null;
      this.rank = -1;
    } else {
      let top2 = this.heap[0];
      this.from = top2.from;
      this.to = top2.to;
      this.value = top2.value;
      this.rank = top2.rank;
      if (top2.value)
        top2.next();
      heapBubble(this.heap, 0);
    }
  }
}
function heapBubble(heap, index) {
  for (let cur2 = heap[index]; ; ) {
    let childIndex = (index << 1) + 1;
    if (childIndex >= heap.length)
      break;
    let child = heap[childIndex];
    if (childIndex + 1 < heap.length && child.compare(heap[childIndex + 1]) >= 0) {
      child = heap[childIndex + 1];
      childIndex++;
    }
    if (cur2.compare(child) < 0)
      break;
    heap[childIndex] = cur2;
    heap[index] = child;
    index = childIndex;
  }
}
class SpanCursor {
  constructor(sets, skip, minPoint) {
    this.minPoint = minPoint;
    this.active = [];
    this.activeTo = [];
    this.activeRank = [];
    this.minActive = -1;
    this.point = null;
    this.pointFrom = 0;
    this.pointRank = 0;
    this.to = -1e9;
    this.endSide = 0;
    this.openStart = -1;
    this.cursor = HeapCursor.from(sets, skip, minPoint);
  }
  goto(pos, side = -1e9) {
    this.cursor.goto(pos, side);
    this.active.length = this.activeTo.length = this.activeRank.length = 0;
    this.minActive = -1;
    this.to = pos;
    this.endSide = side;
    this.openStart = -1;
    this.next();
    return this;
  }
  forward(pos, side) {
    while (this.minActive > -1 && (this.activeTo[this.minActive] - pos || this.active[this.minActive].endSide - side) < 0)
      this.removeActive(this.minActive);
    this.cursor.forward(pos, side);
  }
  removeActive(index) {
    remove(this.active, index);
    remove(this.activeTo, index);
    remove(this.activeRank, index);
    this.minActive = findMinIndex(this.active, this.activeTo);
  }
  addActive(trackOpen) {
    let i = 0, { value, to, rank } = this.cursor;
    while (i < this.activeRank.length && this.activeRank[i] <= rank)
      i++;
    insert(this.active, i, value);
    insert(this.activeTo, i, to);
    insert(this.activeRank, i, rank);
    if (trackOpen)
      insert(trackOpen, i, this.cursor.from);
    this.minActive = findMinIndex(this.active, this.activeTo);
  }
  // After calling this, if `this.point` != null, the next range is a
  // point. Otherwise, it's a regular range, covered by `this.active`.
  next() {
    let from = this.to, wasPoint = this.point;
    this.point = null;
    let trackOpen = this.openStart < 0 ? [] : null;
    for (; ; ) {
      let a = this.minActive;
      if (a > -1 && (this.activeTo[a] - this.cursor.from || this.active[a].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[a] > from) {
          this.to = this.activeTo[a];
          this.endSide = this.active[a].endSide;
          break;
        }
        this.removeActive(a);
        if (trackOpen)
          remove(trackOpen, a);
      } else if (!this.cursor.value) {
        this.to = this.endSide = 1e9;
        break;
      } else if (this.cursor.from > from) {
        this.to = this.cursor.from;
        this.endSide = this.cursor.startSide;
        break;
      } else {
        let nextVal = this.cursor.value;
        if (!nextVal.point) {
          this.addActive(trackOpen);
          this.cursor.next();
        } else if (wasPoint && this.cursor.to == this.to && this.cursor.from < this.cursor.to) {
          this.cursor.next();
        } else {
          this.point = nextVal;
          this.pointFrom = this.cursor.from;
          this.pointRank = this.cursor.rank;
          this.to = this.cursor.to;
          this.endSide = nextVal.endSide;
          this.cursor.next();
          this.forward(this.to, this.endSide);
          break;
        }
      }
    }
    if (trackOpen) {
      this.openStart = 0;
      for (let i = trackOpen.length - 1; i >= 0 && trackOpen[i] < from; i--)
        this.openStart++;
    }
  }
  activeForPoint(to) {
    if (!this.active.length)
      return this.active;
    let active = [];
    for (let i = this.active.length - 1; i >= 0; i--) {
      if (this.activeRank[i] < this.pointRank)
        break;
      if (this.activeTo[i] > to || this.activeTo[i] == to && this.active[i].endSide >= this.point.endSide)
        active.push(this.active[i]);
    }
    return active.reverse();
  }
  openEnd(to) {
    let open = 0;
    for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > to; i--)
      open++;
    return open;
  }
}
function compare(a, startA, b, startB, length, comparator) {
  a.goto(startA);
  b.goto(startB);
  let endB = startB + length;
  let pos = startB, dPos = startB - startA;
  for (; ; ) {
    let diff = a.to + dPos - b.to || a.endSide - b.endSide;
    let end = diff < 0 ? a.to + dPos : b.to, clipEnd = Math.min(end, endB);
    if (a.point || b.point) {
      if (!(a.point && b.point && (a.point == b.point || a.point.eq(b.point)) && sameValues(a.activeForPoint(a.to + dPos), b.activeForPoint(b.to))))
        comparator.comparePoint(pos, clipEnd, a.point, b.point);
    } else {
      if (clipEnd > pos && !sameValues(a.active, b.active))
        comparator.compareRange(pos, clipEnd, a.active, b.active);
    }
    if (end > endB)
      break;
    pos = end;
    if (diff <= 0)
      a.next();
    if (diff >= 0)
      b.next();
  }
}
function sameValues(a, b) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++)
    if (a[i] != b[i] && !a[i].eq(b[i]))
      return false;
  return true;
}
function remove(array, index) {
  for (let i = index, e = array.length - 1; i < e; i++)
    array[i] = array[i + 1];
  array.pop();
}
function insert(array, index, value) {
  for (let i = array.length - 1; i >= index; i--)
    array[i + 1] = array[i];
  array[index] = value;
}
function findMinIndex(value, array) {
  let found = -1, foundPos = 1e9;
  for (let i = 0; i < array.length; i++)
    if ((array[i] - foundPos || value[i].endSide - value[found].endSide) < 0) {
      found = i;
      foundPos = array[i];
    }
  return found;
}
function countColumn(string2, tabSize, to = string2.length) {
  let n = 0;
  for (let i = 0; i < to; ) {
    if (string2.charCodeAt(i) == 9) {
      n += tabSize - n % tabSize;
      i++;
    } else {
      n++;
      i = findClusterBreak(string2, i);
    }
  }
  return n;
}
function findColumn(string2, col, tabSize, strict) {
  for (let i = 0, n = 0; ; ) {
    if (n >= col)
      return i;
    if (i == string2.length)
      break;
    n += string2.charCodeAt(i) == 9 ? tabSize - n % tabSize : 1;
    i = findClusterBreak(string2, i);
  }
  return strict === true ? -1 : string2.length;
}
const C = "ͼ";
const COUNT = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C);
const SET = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet");
const top = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {};
class StyleModule {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(spec, options) {
    this.rules = [];
    let { finish } = options || {};
    function splitSelector(selector) {
      return /^@/.test(selector) ? [selector] : selector.split(/,\s*/);
    }
    function render(selectors, spec2, target, isKeyframes) {
      let local = [], isAt = /^@(\w+)\b/.exec(selectors[0]), keyframes = isAt && isAt[1] == "keyframes";
      if (isAt && spec2 == null)
        return target.push(selectors[0] + ";");
      for (let prop in spec2) {
        let value = spec2[prop];
        if (/&/.test(prop)) {
          render(
            prop.split(/,\s*/).map((part) => selectors.map((sel) => part.replace(/&/, sel))).reduce((a, b) => a.concat(b)),
            value,
            target
          );
        } else if (value && typeof value == "object") {
          if (!isAt)
            throw new RangeError("The value of a property (" + prop + ") should be a primitive value.");
          render(splitSelector(prop), value, local, keyframes);
        } else if (value != null) {
          local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, (l) => "-" + l.toLowerCase()) + ": " + value + ";");
        }
      }
      if (local.length || keyframes) {
        target.push((finish && !isAt && !isKeyframes ? selectors.map(finish) : selectors).join(", ") + " {" + local.join(" ") + "}");
      }
    }
    for (let prop in spec)
      render(splitSelector(prop), spec[prop], this.rules);
  }
  // :: () → string
  // Returns a string containing the module's CSS rules.
  getRules() {
    return this.rules.join("\n");
  }
  // :: () → string
  // Generate a new unique CSS class name.
  static newName() {
    let id2 = top[COUNT] || 1;
    top[COUNT] = id2 + 1;
    return C + id2.toString(36);
  }
  // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>)
  //
  // Mount the given set of modules in the given DOM root, which ensures
  // that the CSS rules defined by the module are available in that
  // context.
  //
  // Rules are only added to the document once per root.
  //
  // Rule order will follow the order of the modules, so that rules from
  // modules later in the array take precedence of those from earlier
  // modules. If you call this function multiple times for the same root
  // in a way that changes the order of already mounted modules, the old
  // order will be changed.
  static mount(root, modules) {
    (root[SET] || new StyleSet(root)).mount(Array.isArray(modules) ? modules : [modules]);
  }
}
let adoptedSet = null;
class StyleSet {
  constructor(root) {
    if (!root.head && root.adoptedStyleSheets && typeof CSSStyleSheet != "undefined") {
      if (adoptedSet) {
        root.adoptedStyleSheets = [adoptedSet.sheet].concat(root.adoptedStyleSheets);
        return root[SET] = adoptedSet;
      }
      this.sheet = new CSSStyleSheet();
      root.adoptedStyleSheets = [this.sheet].concat(root.adoptedStyleSheets);
      adoptedSet = this;
    } else {
      this.styleTag = (root.ownerDocument || root).createElement("style");
      let target = root.head || root;
      target.insertBefore(this.styleTag, target.firstChild);
    }
    this.modules = [];
    root[SET] = this;
  }
  mount(modules) {
    let sheet = this.sheet;
    let pos = 0, j = 0;
    for (let i = 0; i < modules.length; i++) {
      let mod = modules[i], index = this.modules.indexOf(mod);
      if (index < j && index > -1) {
        this.modules.splice(index, 1);
        j--;
        index = -1;
      }
      if (index == -1) {
        this.modules.splice(j++, 0, mod);
        if (sheet)
          for (let k = 0; k < mod.rules.length; k++)
            sheet.insertRule(mod.rules[k], pos++);
      } else {
        while (j < index)
          pos += this.modules[j++].rules.length;
        pos += mod.rules.length;
        j++;
      }
    }
    if (!sheet) {
      let text = "";
      for (let i = 0; i < this.modules.length; i++)
        text += this.modules[i].getRules() + "\n";
      this.styleTag.textContent = text;
    }
  }
}
function getSelection(root) {
  let target;
  if (root.nodeType == 11) {
    target = root.getSelection ? root : root.ownerDocument;
  } else {
    target = root;
  }
  return target.getSelection();
}
function contains(dom, node) {
  return node ? dom == node || dom.contains(node.nodeType != 1 ? node.parentNode : node) : false;
}
function deepActiveElement(doc2) {
  let elt = doc2.activeElement;
  while (elt && elt.shadowRoot)
    elt = elt.shadowRoot.activeElement;
  return elt;
}
function hasSelection(dom, selection) {
  if (!selection.anchorNode)
    return false;
  try {
    return contains(dom, selection.anchorNode);
  } catch (_) {
    return false;
  }
}
function clientRectsFor(dom) {
  if (dom.nodeType == 3)
    return textRange(dom, 0, dom.nodeValue.length).getClientRects();
  else if (dom.nodeType == 1)
    return dom.getClientRects();
  else
    return [];
}
function isEquivalentPosition(node, off, targetNode, targetOff) {
  return targetNode ? scanFor(node, off, targetNode, targetOff, -1) || scanFor(node, off, targetNode, targetOff, 1) : false;
}
function domIndex(node) {
  for (var index = 0; ; index++) {
    node = node.previousSibling;
    if (!node)
      return index;
  }
}
function scanFor(node, off, targetNode, targetOff, dir) {
  for (; ; ) {
    if (node == targetNode && off == targetOff)
      return true;
    if (off == (dir < 0 ? 0 : maxOffset(node))) {
      if (node.nodeName == "DIV")
        return false;
      let parent = node.parentNode;
      if (!parent || parent.nodeType != 1)
        return false;
      off = domIndex(node) + (dir < 0 ? 0 : 1);
      node = parent;
    } else if (node.nodeType == 1) {
      node = node.childNodes[off + (dir < 0 ? -1 : 0)];
      if (node.nodeType == 1 && node.contentEditable == "false")
        return false;
      off = dir < 0 ? maxOffset(node) : 0;
    } else {
      return false;
    }
  }
}
function maxOffset(node) {
  return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
}
const Rect0 = { left: 0, right: 0, top: 0, bottom: 0 };
function flattenRect(rect, left) {
  let x = left ? rect.left : rect.right;
  return { left: x, right: x, top: rect.top, bottom: rect.bottom };
}
function windowRect(win) {
  return {
    left: 0,
    right: win.innerWidth,
    top: 0,
    bottom: win.innerHeight
  };
}
function scrollRectIntoView(dom, rect, side, x, y, xMargin, yMargin, ltr) {
  let doc2 = dom.ownerDocument, win = doc2.defaultView || window;
  for (let cur2 = dom; cur2; ) {
    if (cur2.nodeType == 1) {
      let bounding, top2 = cur2 == doc2.body;
      if (top2) {
        bounding = windowRect(win);
      } else {
        if (cur2.scrollHeight <= cur2.clientHeight && cur2.scrollWidth <= cur2.clientWidth) {
          cur2 = cur2.assignedSlot || cur2.parentNode;
          continue;
        }
        let rect2 = cur2.getBoundingClientRect();
        bounding = {
          left: rect2.left,
          right: rect2.left + cur2.clientWidth,
          top: rect2.top,
          bottom: rect2.top + cur2.clientHeight
        };
      }
      let moveX = 0, moveY = 0;
      if (y == "nearest") {
        if (rect.top < bounding.top) {
          moveY = -(bounding.top - rect.top + yMargin);
          if (side > 0 && rect.bottom > bounding.bottom + moveY)
            moveY = rect.bottom - bounding.bottom + moveY + yMargin;
        } else if (rect.bottom > bounding.bottom) {
          moveY = rect.bottom - bounding.bottom + yMargin;
          if (side < 0 && rect.top - moveY < bounding.top)
            moveY = -(bounding.top + moveY - rect.top + yMargin);
        }
      } else {
        let rectHeight = rect.bottom - rect.top, boundingHeight = bounding.bottom - bounding.top;
        let targetTop = y == "center" && rectHeight <= boundingHeight ? rect.top + rectHeight / 2 - boundingHeight / 2 : y == "start" || y == "center" && side < 0 ? rect.top - yMargin : rect.bottom - boundingHeight + yMargin;
        moveY = targetTop - bounding.top;
      }
      if (x == "nearest") {
        if (rect.left < bounding.left) {
          moveX = -(bounding.left - rect.left + xMargin);
          if (side > 0 && rect.right > bounding.right + moveX)
            moveX = rect.right - bounding.right + moveX + xMargin;
        } else if (rect.right > bounding.right) {
          moveX = rect.right - bounding.right + xMargin;
          if (side < 0 && rect.left < bounding.left + moveX)
            moveX = -(bounding.left + moveX - rect.left + xMargin);
        }
      } else {
        let targetLeft = x == "center" ? rect.left + (rect.right - rect.left) / 2 - (bounding.right - bounding.left) / 2 : x == "start" == ltr ? rect.left - xMargin : rect.right - (bounding.right - bounding.left) + xMargin;
        moveX = targetLeft - bounding.left;
      }
      if (moveX || moveY) {
        if (top2) {
          win.scrollBy(moveX, moveY);
        } else {
          let movedX = 0, movedY = 0;
          if (moveY) {
            let start = cur2.scrollTop;
            cur2.scrollTop += moveY;
            movedY = cur2.scrollTop - start;
          }
          if (moveX) {
            let start = cur2.scrollLeft;
            cur2.scrollLeft += moveX;
            movedX = cur2.scrollLeft - start;
          }
          rect = {
            left: rect.left - movedX,
            top: rect.top - movedY,
            right: rect.right - movedX,
            bottom: rect.bottom - movedY
          };
          if (movedX && Math.abs(movedX - moveX) < 1)
            x = "nearest";
          if (movedY && Math.abs(movedY - moveY) < 1)
            y = "nearest";
        }
      }
      if (top2)
        break;
      cur2 = cur2.assignedSlot || cur2.parentNode;
    } else if (cur2.nodeType == 11) {
      cur2 = cur2.host;
    } else {
      break;
    }
  }
}
function scrollableParent(dom) {
  let doc2 = dom.ownerDocument;
  for (let cur2 = dom.parentNode; cur2; ) {
    if (cur2 == doc2.body) {
      break;
    } else if (cur2.nodeType == 1) {
      if (cur2.scrollHeight > cur2.clientHeight || cur2.scrollWidth > cur2.clientWidth)
        return cur2;
      cur2 = cur2.assignedSlot || cur2.parentNode;
    } else if (cur2.nodeType == 11) {
      cur2 = cur2.host;
    } else {
      break;
    }
  }
  return null;
}
class DOMSelectionState {
  constructor() {
    this.anchorNode = null;
    this.anchorOffset = 0;
    this.focusNode = null;
    this.focusOffset = 0;
  }
  eq(domSel) {
    return this.anchorNode == domSel.anchorNode && this.anchorOffset == domSel.anchorOffset && this.focusNode == domSel.focusNode && this.focusOffset == domSel.focusOffset;
  }
  setRange(range) {
    this.set(range.anchorNode, range.anchorOffset, range.focusNode, range.focusOffset);
  }
  set(anchorNode, anchorOffset, focusNode, focusOffset) {
    this.anchorNode = anchorNode;
    this.anchorOffset = anchorOffset;
    this.focusNode = focusNode;
    this.focusOffset = focusOffset;
  }
}
let preventScrollSupported = null;
function focusPreventScroll(dom) {
  if (dom.setActive)
    return dom.setActive();
  if (preventScrollSupported)
    return dom.focus(preventScrollSupported);
  let stack = [];
  for (let cur2 = dom; cur2; cur2 = cur2.parentNode) {
    stack.push(cur2, cur2.scrollTop, cur2.scrollLeft);
    if (cur2 == cur2.ownerDocument)
      break;
  }
  dom.focus(preventScrollSupported == null ? {
    get preventScroll() {
      preventScrollSupported = { preventScroll: true };
      return true;
    }
  } : void 0);
  if (!preventScrollSupported) {
    preventScrollSupported = false;
    for (let i = 0; i < stack.length; ) {
      let elt = stack[i++], top2 = stack[i++], left = stack[i++];
      if (elt.scrollTop != top2)
        elt.scrollTop = top2;
      if (elt.scrollLeft != left)
        elt.scrollLeft = left;
    }
  }
}
let scratchRange;
function textRange(node, from, to = from) {
  let range = scratchRange || (scratchRange = document.createRange());
  range.setEnd(node, to);
  range.setStart(node, from);
  return range;
}
function dispatchKey(elt, name2, code2) {
  let options = { key: name2, code: name2, keyCode: code2, which: code2, cancelable: true };
  let down = new KeyboardEvent("keydown", options);
  down.synthetic = true;
  elt.dispatchEvent(down);
  let up = new KeyboardEvent("keyup", options);
  up.synthetic = true;
  elt.dispatchEvent(up);
  return down.defaultPrevented || up.defaultPrevented;
}
function getRoot(node) {
  while (node) {
    if (node && (node.nodeType == 9 || node.nodeType == 11 && node.host))
      return node;
    node = node.assignedSlot || node.parentNode;
  }
  return null;
}
function clearAttributes(node) {
  while (node.attributes.length)
    node.removeAttributeNode(node.attributes[0]);
}
function atElementStart(doc2, selection) {
  let node = selection.focusNode, offset = selection.focusOffset;
  if (!node || selection.anchorNode != node || selection.anchorOffset != offset)
    return false;
  for (; ; ) {
    if (offset) {
      if (node.nodeType != 1)
        return false;
      let prev = node.childNodes[offset - 1];
      if (prev.contentEditable == "false")
        offset--;
      else {
        node = prev;
        offset = maxOffset(node);
      }
    } else if (node == doc2) {
      return true;
    } else {
      offset = domIndex(node);
      node = node.parentNode;
    }
  }
}
class DOMPos {
  constructor(node, offset, precise = true) {
    this.node = node;
    this.offset = offset;
    this.precise = precise;
  }
  static before(dom, precise) {
    return new DOMPos(dom.parentNode, domIndex(dom), precise);
  }
  static after(dom, precise) {
    return new DOMPos(dom.parentNode, domIndex(dom) + 1, precise);
  }
}
const noChildren = [];
class ContentView {
  constructor() {
    this.parent = null;
    this.dom = null;
    this.dirty = 2;
  }
  get overrideDOMText() {
    return null;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(view) {
    let pos = this.posAtStart;
    for (let child of this.children) {
      if (child == view)
        return pos;
      pos += child.length + child.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(view) {
    return this.posBefore(view) + view.length;
  }
  // Will return a rectangle directly before (when side < 0), after
  // (side > 0) or directly on (when the browser supports it) the
  // given position.
  coordsAt(_pos, _side) {
    return null;
  }
  sync(view, track) {
    if (this.dirty & 2) {
      let parent = this.dom;
      let prev = null, next;
      for (let child of this.children) {
        if (child.dirty) {
          if (!child.dom && (next = prev ? prev.nextSibling : parent.firstChild)) {
            let contentView = ContentView.get(next);
            if (!contentView || !contentView.parent && contentView.canReuseDOM(child))
              child.reuseDOM(next);
          }
          child.sync(view, track);
          child.dirty = 0;
        }
        next = prev ? prev.nextSibling : parent.firstChild;
        if (track && !track.written && track.node == parent && next != child.dom)
          track.written = true;
        if (child.dom.parentNode == parent) {
          while (next && next != child.dom)
            next = rm$1(next);
        } else {
          parent.insertBefore(child.dom, next);
        }
        prev = child.dom;
      }
      next = prev ? prev.nextSibling : parent.firstChild;
      if (next && track && track.node == parent)
        track.written = true;
      while (next)
        next = rm$1(next);
    } else if (this.dirty & 1) {
      for (let child of this.children)
        if (child.dirty) {
          child.sync(view, track);
          child.dirty = 0;
        }
    }
  }
  reuseDOM(_dom) {
  }
  localPosFromDOM(node, offset) {
    let after;
    if (node == this.dom) {
      after = this.dom.childNodes[offset];
    } else {
      let bias = maxOffset(node) == 0 ? 0 : offset == 0 ? -1 : 1;
      for (; ; ) {
        let parent = node.parentNode;
        if (parent == this.dom)
          break;
        if (bias == 0 && parent.firstChild != parent.lastChild) {
          if (node == parent.firstChild)
            bias = -1;
          else
            bias = 1;
        }
        node = parent;
      }
      if (bias < 0)
        after = node;
      else
        after = node.nextSibling;
    }
    if (after == this.dom.firstChild)
      return 0;
    while (after && !ContentView.get(after))
      after = after.nextSibling;
    if (!after)
      return this.length;
    for (let i = 0, pos = 0; ; i++) {
      let child = this.children[i];
      if (child.dom == after)
        return pos;
      pos += child.length + child.breakAfter;
    }
  }
  domBoundsAround(from, to, offset = 0) {
    let fromI = -1, fromStart = -1, toI = -1, toEnd = -1;
    for (let i = 0, pos = offset, prevEnd = offset; i < this.children.length; i++) {
      let child = this.children[i], end = pos + child.length;
      if (pos < from && end > to)
        return child.domBoundsAround(from, to, pos);
      if (end >= from && fromI == -1) {
        fromI = i;
        fromStart = pos;
      }
      if (pos > to && child.dom.parentNode == this.dom) {
        toI = i;
        toEnd = prevEnd;
        break;
      }
      prevEnd = end;
      pos = end + child.breakAfter;
    }
    return {
      from: fromStart,
      to: toEnd < 0 ? offset + this.length : toEnd,
      startDOM: (fromI ? this.children[fromI - 1].dom.nextSibling : null) || this.dom.firstChild,
      endDOM: toI < this.children.length && toI >= 0 ? this.children[toI].dom : null
    };
  }
  markDirty(andParent = false) {
    this.dirty |= 2;
    this.markParentsDirty(andParent);
  }
  markParentsDirty(childList) {
    for (let parent = this.parent; parent; parent = parent.parent) {
      if (childList)
        parent.dirty |= 2;
      if (parent.dirty & 1)
        return;
      parent.dirty |= 1;
      childList = false;
    }
  }
  setParent(parent) {
    if (this.parent != parent) {
      this.parent = parent;
      if (this.dirty)
        this.markParentsDirty(true);
    }
  }
  setDOM(dom) {
    if (this.dom)
      this.dom.cmView = null;
    this.dom = dom;
    dom.cmView = this;
  }
  get rootView() {
    for (let v = this; ; ) {
      let parent = v.parent;
      if (!parent)
        return v;
      v = parent;
    }
  }
  replaceChildren(from, to, children = noChildren) {
    this.markDirty();
    for (let i = from; i < to; i++) {
      let child = this.children[i];
      if (child.parent == this)
        child.destroy();
    }
    this.children.splice(from, to - from, ...children);
    for (let i = 0; i < children.length; i++)
      children[i].setParent(this);
  }
  ignoreMutation(_rec) {
    return false;
  }
  ignoreEvent(_event) {
    return false;
  }
  childCursor(pos = this.length) {
    return new ChildCursor(this.children, pos, this.children.length);
  }
  childPos(pos, bias = 1) {
    return this.childCursor().findPos(pos, bias);
  }
  toString() {
    let name2 = this.constructor.name.replace("View", "");
    return name2 + (this.children.length ? "(" + this.children.join() + ")" : this.length ? "[" + (name2 == "Text" ? this.text : this.length) + "]" : "") + (this.breakAfter ? "#" : "");
  }
  static get(node) {
    return node.cmView;
  }
  get isEditable() {
    return true;
  }
  get isWidget() {
    return false;
  }
  merge(from, to, source, hasStart, openStart, openEnd) {
    return false;
  }
  become(other) {
    return false;
  }
  canReuseDOM(other) {
    return other.constructor == this.constructor;
  }
  // When this is a zero-length view with a side, this should return a
  // number <= 0 to indicate it is before its position, or a
  // number > 0 when after its position.
  getSide() {
    return 0;
  }
  destroy() {
    this.parent = null;
  }
}
ContentView.prototype.breakAfter = 0;
function rm$1(dom) {
  let next = dom.nextSibling;
  dom.parentNode.removeChild(dom);
  return next;
}
class ChildCursor {
  constructor(children, pos, i) {
    this.children = children;
    this.pos = pos;
    this.i = i;
    this.off = 0;
  }
  findPos(pos, bias = 1) {
    for (; ; ) {
      if (pos > this.pos || pos == this.pos && (bias > 0 || this.i == 0 || this.children[this.i - 1].breakAfter)) {
        this.off = pos - this.pos;
        return this;
      }
      let next = this.children[--this.i];
      this.pos -= next.length + next.breakAfter;
    }
  }
}
function replaceRange(parent, fromI, fromOff, toI, toOff, insert2, breakAtStart, openStart, openEnd) {
  let { children } = parent;
  let before = children.length ? children[fromI] : null;
  let last = insert2.length ? insert2[insert2.length - 1] : null;
  let breakAtEnd = last ? last.breakAfter : breakAtStart;
  if (fromI == toI && before && !breakAtStart && !breakAtEnd && insert2.length < 2 && before.merge(fromOff, toOff, insert2.length ? last : null, fromOff == 0, openStart, openEnd))
    return;
  if (toI < children.length) {
    let after = children[toI];
    if (after && toOff < after.length) {
      if (fromI == toI) {
        after = after.split(toOff);
        toOff = 0;
      }
      if (!breakAtEnd && last && after.merge(0, toOff, last, true, 0, openEnd)) {
        insert2[insert2.length - 1] = after;
      } else {
        if (toOff)
          after.merge(0, toOff, null, false, 0, openEnd);
        insert2.push(after);
      }
    } else if (after === null || after === void 0 ? void 0 : after.breakAfter) {
      if (last)
        last.breakAfter = 1;
      else
        breakAtStart = 1;
    }
    toI++;
  }
  if (before) {
    before.breakAfter = breakAtStart;
    if (fromOff > 0) {
      if (!breakAtStart && insert2.length && before.merge(fromOff, before.length, insert2[0], false, openStart, 0)) {
        before.breakAfter = insert2.shift().breakAfter;
      } else if (fromOff < before.length || before.children.length && before.children[before.children.length - 1].length == 0) {
        before.merge(fromOff, before.length, null, false, openStart, 0);
      }
      fromI++;
    }
  }
  while (fromI < toI && insert2.length) {
    if (children[toI - 1].become(insert2[insert2.length - 1])) {
      toI--;
      insert2.pop();
      openEnd = insert2.length ? 0 : openStart;
    } else if (children[fromI].become(insert2[0])) {
      fromI++;
      insert2.shift();
      openStart = insert2.length ? 0 : openEnd;
    } else {
      break;
    }
  }
  if (!insert2.length && fromI && toI < children.length && !children[fromI - 1].breakAfter && children[toI].merge(0, 0, children[fromI - 1], false, openStart, openEnd))
    fromI--;
  if (fromI < toI || insert2.length)
    parent.replaceChildren(fromI, toI, insert2);
}
function mergeChildrenInto(parent, from, to, insert2, openStart, openEnd) {
  let cur2 = parent.childCursor();
  let { i: toI, off: toOff } = cur2.findPos(to, 1);
  let { i: fromI, off: fromOff } = cur2.findPos(from, -1);
  let dLen = from - to;
  for (let view of insert2)
    dLen += view.length;
  parent.length += dLen;
  replaceRange(parent, fromI, fromOff, toI, toOff, insert2, 0, openStart, openEnd);
}
let nav = typeof navigator != "undefined" ? navigator : { userAgent: "", vendor: "", platform: "" };
let doc = typeof document != "undefined" ? document : { documentElement: { style: {} } };
const ie_edge = /* @__PURE__ */ /Edge\/(\d+)/.exec(nav.userAgent);
const ie_upto10 = /* @__PURE__ */ /MSIE \d/.test(nav.userAgent);
const ie_11up = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(nav.userAgent);
const ie = !!(ie_upto10 || ie_11up || ie_edge);
const gecko = !ie && /* @__PURE__ */ /gecko\/(\d+)/i.test(nav.userAgent);
const chrome = !ie && /* @__PURE__ */ /Chrome\/(\d+)/.exec(nav.userAgent);
const webkit = "webkitFontSmoothing" in doc.documentElement.style;
const safari = !ie && /* @__PURE__ */ /Apple Computer/.test(nav.vendor);
const ios = safari && (/* @__PURE__ */ /Mobile\/\w+/.test(nav.userAgent) || nav.maxTouchPoints > 2);
var browser = {
  mac: ios || /* @__PURE__ */ /Mac/.test(nav.platform),
  windows: /* @__PURE__ */ /Win/.test(nav.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(nav.platform),
  ie,
  ie_version: ie_upto10 ? doc.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0,
  gecko,
  gecko_version: gecko ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
  chrome: !!chrome,
  chrome_version: chrome ? +chrome[1] : 0,
  ios,
  android: /* @__PURE__ */ /Android\b/.test(nav.userAgent),
  webkit,
  safari,
  webkit_version: webkit ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0,
  tabSize: doc.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
const MaxJoinLen = 256;
class TextView extends ContentView {
  constructor(text) {
    super();
    this.text = text;
  }
  get length() {
    return this.text.length;
  }
  createDOM(textDOM) {
    this.setDOM(textDOM || document.createTextNode(this.text));
  }
  sync(view, track) {
    if (!this.dom)
      this.createDOM();
    if (this.dom.nodeValue != this.text) {
      if (track && track.node == this.dom)
        track.written = true;
      this.dom.nodeValue = this.text;
    }
  }
  reuseDOM(dom) {
    if (dom.nodeType == 3)
      this.createDOM(dom);
  }
  merge(from, to, source) {
    if (source && (!(source instanceof TextView) || this.length - (to - from) + source.length > MaxJoinLen))
      return false;
    this.text = this.text.slice(0, from) + (source ? source.text : "") + this.text.slice(to);
    this.markDirty();
    return true;
  }
  split(from) {
    let result = new TextView(this.text.slice(from));
    this.text = this.text.slice(0, from);
    this.markDirty();
    return result;
  }
  localPosFromDOM(node, offset) {
    return node == this.dom ? offset : offset ? this.text.length : 0;
  }
  domAtPos(pos) {
    return new DOMPos(this.dom, pos);
  }
  domBoundsAround(_from, _to, offset) {
    return { from: offset, to: offset + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling };
  }
  coordsAt(pos, side) {
    return textCoords(this.dom, pos, side);
  }
}
class MarkView extends ContentView {
  constructor(mark, children = [], length = 0) {
    super();
    this.mark = mark;
    this.children = children;
    this.length = length;
    for (let ch of children)
      ch.setParent(this);
  }
  setAttrs(dom) {
    clearAttributes(dom);
    if (this.mark.class)
      dom.className = this.mark.class;
    if (this.mark.attrs)
      for (let name2 in this.mark.attrs)
        dom.setAttribute(name2, this.mark.attrs[name2]);
    return dom;
  }
  reuseDOM(node) {
    if (node.nodeName == this.mark.tagName.toUpperCase()) {
      this.setDOM(node);
      this.dirty |= 4 | 2;
    }
  }
  sync(view, track) {
    if (!this.dom)
      this.setDOM(this.setAttrs(document.createElement(this.mark.tagName)));
    else if (this.dirty & 4)
      this.setAttrs(this.dom);
    super.sync(view, track);
  }
  merge(from, to, source, _hasStart, openStart, openEnd) {
    if (source && (!(source instanceof MarkView && source.mark.eq(this.mark)) || from && openStart <= 0 || to < this.length && openEnd <= 0))
      return false;
    mergeChildrenInto(this, from, to, source ? source.children : [], openStart - 1, openEnd - 1);
    this.markDirty();
    return true;
  }
  split(from) {
    let result = [], off = 0, detachFrom = -1, i = 0;
    for (let elt of this.children) {
      let end = off + elt.length;
      if (end > from)
        result.push(off < from ? elt.split(from - off) : elt);
      if (detachFrom < 0 && off >= from)
        detachFrom = i;
      off = end;
      i++;
    }
    let length = this.length - from;
    this.length = from;
    if (detachFrom > -1) {
      this.children.length = detachFrom;
      this.markDirty();
    }
    return new MarkView(this.mark, result, length);
  }
  domAtPos(pos) {
    return inlineDOMAtPos(this, pos);
  }
  coordsAt(pos, side) {
    return coordsInChildren(this, pos, side);
  }
}
function textCoords(text, pos, side) {
  let length = text.nodeValue.length;
  if (pos > length)
    pos = length;
  let from = pos, to = pos, flatten2 = 0;
  if (pos == 0 && side < 0 || pos == length && side >= 0) {
    if (!(browser.chrome || browser.gecko)) {
      if (pos) {
        from--;
        flatten2 = 1;
      } else if (to < length) {
        to++;
        flatten2 = -1;
      }
    }
  } else {
    if (side < 0)
      from--;
    else if (to < length)
      to++;
  }
  let rects = textRange(text, from, to).getClientRects();
  if (!rects.length)
    return Rect0;
  let rect = rects[(flatten2 ? flatten2 < 0 : side >= 0) ? 0 : rects.length - 1];
  if (browser.safari && !flatten2 && rect.width == 0)
    rect = Array.prototype.find.call(rects, (r) => r.width) || rect;
  return flatten2 ? flattenRect(rect, flatten2 < 0) : rect || null;
}
class WidgetView extends ContentView {
  constructor(widget, length, side) {
    super();
    this.widget = widget;
    this.length = length;
    this.side = side;
    this.prevWidget = null;
  }
  static create(widget, length, side) {
    return new (widget.customView || WidgetView)(widget, length, side);
  }
  split(from) {
    let result = WidgetView.create(this.widget, this.length - from, this.side);
    this.length -= from;
    return result;
  }
  sync(view) {
    if (!this.dom || !this.widget.updateDOM(this.dom, view)) {
      if (this.dom && this.prevWidget)
        this.prevWidget.destroy(this.dom);
      this.prevWidget = null;
      this.setDOM(this.widget.toDOM(view));
      this.dom.contentEditable = "false";
    }
  }
  getSide() {
    return this.side;
  }
  merge(from, to, source, hasStart, openStart, openEnd) {
    if (source && (!(source instanceof WidgetView) || !this.widget.compare(source.widget) || from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
      return false;
    this.length = from + (source ? source.length : 0) + (this.length - to);
    return true;
  }
  become(other) {
    if (other.length == this.length && other instanceof WidgetView && other.side == this.side) {
      if (this.widget.constructor == other.widget.constructor) {
        if (!this.widget.eq(other.widget))
          this.markDirty(true);
        if (this.dom && !this.prevWidget)
          this.prevWidget = this.widget;
        this.widget = other.widget;
        return true;
      }
    }
    return false;
  }
  ignoreMutation() {
    return true;
  }
  ignoreEvent(event) {
    return this.widget.ignoreEvent(event);
  }
  get overrideDOMText() {
    if (this.length == 0)
      return Text.empty;
    let top2 = this;
    while (top2.parent)
      top2 = top2.parent;
    let { view } = top2, text = view && view.state.doc, start = this.posAtStart;
    return text ? text.slice(start, start + this.length) : Text.empty;
  }
  domAtPos(pos) {
    return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(pos, side) {
    let rects = this.dom.getClientRects(), rect = null;
    if (!rects.length)
      return Rect0;
    for (let i = pos > 0 ? rects.length - 1 : 0; ; i += pos > 0 ? -1 : 1) {
      rect = rects[i];
      if (pos > 0 ? i == 0 : i == rects.length - 1 || rect.top < rect.bottom)
        break;
    }
    return this.length ? rect : flattenRect(rect, this.side > 0);
  }
  get isEditable() {
    return false;
  }
  get isWidget() {
    return true;
  }
  destroy() {
    super.destroy();
    if (this.dom)
      this.widget.destroy(this.dom);
  }
}
class CompositionView extends WidgetView {
  domAtPos(pos) {
    let { topView, text } = this.widget;
    if (!topView)
      return new DOMPos(text, Math.min(pos, text.nodeValue.length));
    return scanCompositionTree(pos, 0, topView, text, (v, p) => v.domAtPos(p), (p) => new DOMPos(text, Math.min(p, text.nodeValue.length)));
  }
  sync() {
    this.setDOM(this.widget.toDOM());
  }
  localPosFromDOM(node, offset) {
    let { topView, text } = this.widget;
    if (!topView)
      return Math.min(offset, this.length);
    return posFromDOMInCompositionTree(node, offset, topView, text);
  }
  ignoreMutation() {
    return false;
  }
  get overrideDOMText() {
    return null;
  }
  coordsAt(pos, side) {
    let { topView, text } = this.widget;
    if (!topView)
      return textCoords(text, pos, side);
    return scanCompositionTree(pos, side, topView, text, (v, pos2, side2) => v.coordsAt(pos2, side2), (pos2, side2) => textCoords(text, pos2, side2));
  }
  destroy() {
    var _a2;
    super.destroy();
    (_a2 = this.widget.topView) === null || _a2 === void 0 ? void 0 : _a2.destroy();
  }
  get isEditable() {
    return true;
  }
  canReuseDOM() {
    return true;
  }
}
function scanCompositionTree(pos, side, view, text, enterView, fromText) {
  if (view instanceof MarkView) {
    for (let child = view.dom.firstChild; child; child = child.nextSibling) {
      let desc = ContentView.get(child);
      if (!desc)
        return fromText(pos, side);
      let hasComp = contains(child, text);
      let len = desc.length + (hasComp ? text.nodeValue.length : 0);
      if (pos < len || pos == len && desc.getSide() <= 0)
        return hasComp ? scanCompositionTree(pos, side, desc, text, enterView, fromText) : enterView(desc, pos, side);
      pos -= len;
    }
    return enterView(view, view.length, -1);
  } else if (view.dom == text) {
    return fromText(pos, side);
  } else {
    return enterView(view, pos, side);
  }
}
function posFromDOMInCompositionTree(node, offset, view, text) {
  if (view instanceof MarkView) {
    for (let child of view.children) {
      let pos = 0, hasComp = contains(child.dom, text);
      if (contains(child.dom, node))
        return pos + (hasComp ? posFromDOMInCompositionTree(node, offset, child, text) : child.localPosFromDOM(node, offset));
      pos += hasComp ? text.nodeValue.length : child.length;
    }
  } else if (view.dom == text) {
    return Math.min(offset, text.nodeValue.length);
  }
  return view.localPosFromDOM(node, offset);
}
class WidgetBufferView extends ContentView {
  constructor(side) {
    super();
    this.side = side;
  }
  get length() {
    return 0;
  }
  merge() {
    return false;
  }
  become(other) {
    return other instanceof WidgetBufferView && other.side == this.side;
  }
  split() {
    return new WidgetBufferView(this.side);
  }
  sync() {
    if (!this.dom) {
      let dom = document.createElement("img");
      dom.className = "cm-widgetBuffer";
      dom.setAttribute("aria-hidden", "true");
      this.setDOM(dom);
    }
  }
  getSide() {
    return this.side;
  }
  domAtPos(pos) {
    return DOMPos.before(this.dom);
  }
  localPosFromDOM() {
    return 0;
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(pos) {
    let imgRect = this.dom.getBoundingClientRect();
    let siblingRect = inlineSiblingRect(this, this.side > 0 ? -1 : 1);
    return siblingRect && siblingRect.top < imgRect.bottom && siblingRect.bottom > imgRect.top ? { left: imgRect.left, right: imgRect.right, top: siblingRect.top, bottom: siblingRect.bottom } : imgRect;
  }
  get overrideDOMText() {
    return Text.empty;
  }
}
TextView.prototype.children = WidgetView.prototype.children = WidgetBufferView.prototype.children = noChildren;
function inlineSiblingRect(view, side) {
  let parent = view.parent, index = parent ? parent.children.indexOf(view) : -1;
  while (parent && index >= 0) {
    if (side < 0 ? index > 0 : index < parent.children.length) {
      let next = parent.children[index + side];
      if (next instanceof TextView) {
        let nextRect = next.coordsAt(side < 0 ? next.length : 0, side);
        if (nextRect)
          return nextRect;
      }
      index += side;
    } else if (parent instanceof MarkView && parent.parent) {
      index = parent.parent.children.indexOf(parent) + (side < 0 ? 0 : 1);
      parent = parent.parent;
    } else {
      let last = parent.dom.lastChild;
      if (last && last.nodeName == "BR")
        return last.getClientRects()[0];
      break;
    }
  }
  return void 0;
}
function inlineDOMAtPos(parent, pos) {
  let dom = parent.dom, { children } = parent, i = 0;
  for (let off = 0; i < children.length; i++) {
    let child = children[i], end = off + child.length;
    if (end == off && child.getSide() <= 0)
      continue;
    if (pos > off && pos < end && child.dom.parentNode == dom)
      return child.domAtPos(pos - off);
    if (pos <= off)
      break;
    off = end;
  }
  for (let j = i; j > 0; j--) {
    let prev = children[j - 1];
    if (prev.dom.parentNode == dom)
      return prev.domAtPos(prev.length);
  }
  for (let j = i; j < children.length; j++) {
    let next = children[j];
    if (next.dom.parentNode == dom)
      return next.domAtPos(0);
  }
  return new DOMPos(dom, 0);
}
function joinInlineInto(parent, view, open) {
  let last, { children } = parent;
  if (open > 0 && view instanceof MarkView && children.length && (last = children[children.length - 1]) instanceof MarkView && last.mark.eq(view.mark)) {
    joinInlineInto(last, view.children[0], open - 1);
  } else {
    children.push(view);
    view.setParent(parent);
  }
  parent.length += view.length;
}
function coordsInChildren(view, pos, side) {
  let before = null, beforePos = -1, after = null, afterPos = -1;
  function scan(view2, pos2) {
    for (let i = 0, off = 0; i < view2.children.length && off <= pos2; i++) {
      let child = view2.children[i], end = off + child.length;
      if (end >= pos2) {
        if (child.children.length) {
          scan(child, pos2 - off);
        } else if (!after && (end > pos2 || off == end && child.getSide() > 0)) {
          after = child;
          afterPos = pos2 - off;
        } else if (off < pos2 || off == end && child.getSide() < 0) {
          before = child;
          beforePos = pos2 - off;
        }
      }
      off = end;
    }
  }
  scan(view, pos);
  let target = (side < 0 ? before : after) || before || after;
  if (target)
    return target.coordsAt(Math.max(0, target == before ? beforePos : afterPos), side);
  return fallbackRect(view);
}
function fallbackRect(view) {
  let last = view.dom.lastChild;
  if (!last)
    return view.dom.getBoundingClientRect();
  let rects = clientRectsFor(last);
  return rects[rects.length - 1] || null;
}
function combineAttrs(source, target) {
  for (let name2 in source) {
    if (name2 == "class" && target.class)
      target.class += " " + source.class;
    else if (name2 == "style" && target.style)
      target.style += ";" + source.style;
    else
      target[name2] = source[name2];
  }
  return target;
}
function attrsEq(a, b) {
  if (a == b)
    return true;
  if (!a || !b)
    return false;
  let keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length != keysB.length)
    return false;
  for (let key of keysA) {
    if (keysB.indexOf(key) == -1 || a[key] !== b[key])
      return false;
  }
  return true;
}
function updateAttrs(dom, prev, attrs) {
  let changed = null;
  if (prev) {
    for (let name2 in prev)
      if (!(attrs && name2 in attrs))
        dom.removeAttribute(changed = name2);
  }
  if (attrs) {
    for (let name2 in attrs)
      if (!(prev && prev[name2] == attrs[name2]))
        dom.setAttribute(changed = name2, attrs[name2]);
  }
  return !!changed;
}
class WidgetType {
  /**
  Compare this instance to another instance of the same type.
  (TypeScript can't express this, but only instances of the same
  specific class will be passed to this method.) This is used to
  avoid redrawing widgets when they are replaced by a new
  decoration of the same type. The default implementation just
  returns `false`, which will cause new instances of the widget to
  always be redrawn.
  */
  eq(widget) {
    return false;
  }
  /**
  Update a DOM element created by a widget of the same type (but
  different, non-`eq` content) to reflect this widget. May return
  true to indicate that it could update, false to indicate it
  couldn't (in which case the widget will be redrawn). The default
  implementation just returns false.
  */
  updateDOM(dom, view) {
    return false;
  }
  /**
  @internal
  */
  compare(other) {
    return this == other || this.constructor == other.constructor && this.eq(other);
  }
  /**
  The estimated height this widget will have, to be used when
  estimating the height of content that hasn't been drawn. May
  return -1 to indicate you don't know. The default implementation
  returns -1.
  */
  get estimatedHeight() {
    return -1;
  }
  /**
  Can be used to configure which kinds of events inside the widget
  should be ignored by the editor. The default is to ignore all
  events.
  */
  ignoreEvent(event) {
    return true;
  }
  /**
  @internal
  */
  get customView() {
    return null;
  }
  /**
  This is called when the an instance of the widget is removed
  from the editor view.
  */
  destroy(dom) {
  }
}
var BlockType = /* @__PURE__ */ function(BlockType2) {
  BlockType2[BlockType2["Text"] = 0] = "Text";
  BlockType2[BlockType2["WidgetBefore"] = 1] = "WidgetBefore";
  BlockType2[BlockType2["WidgetAfter"] = 2] = "WidgetAfter";
  BlockType2[BlockType2["WidgetRange"] = 3] = "WidgetRange";
  return BlockType2;
}(BlockType || (BlockType = {}));
class Decoration extends RangeValue {
  constructor(startSide, endSide, widget, spec) {
    super();
    this.startSide = startSide;
    this.endSide = endSide;
    this.widget = widget;
    this.spec = spec;
  }
  /**
  @internal
  */
  get heightRelevant() {
    return false;
  }
  /**
  Create a mark decoration, which influences the styling of the
  content in its range. Nested mark decorations will cause nested
  DOM elements to be created. Nesting order is determined by
  precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
  the higher-precedence decorations creating the inner DOM nodes.
  Such elements are split on line boundaries and on the boundaries
  of lower-precedence decorations.
  */
  static mark(spec) {
    return new MarkDecoration(spec);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(spec) {
    let side = spec.side || 0, block = !!spec.block;
    side += block ? side > 0 ? 3e8 : -4e8 : side > 0 ? 1e8 : -1e8;
    return new PointDecoration(spec, side, side, block, spec.widget || null, false);
  }
  /**
  Create a replace decoration which replaces the given range with
  a widget, or simply hides it.
  */
  static replace(spec) {
    let block = !!spec.block, startSide, endSide;
    if (spec.isBlockGap) {
      startSide = -5e8;
      endSide = 4e8;
    } else {
      let { start, end } = getInclusive(spec, block);
      startSide = (start ? block ? -3e8 : -1 : 5e8) - 1;
      endSide = (end ? block ? 2e8 : 1 : -6e8) + 1;
    }
    return new PointDecoration(spec, startSide, endSide, block, spec.widget || null, true);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(spec) {
    return new LineDecoration(spec);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(of, sort = false) {
    return RangeSet.of(of, sort);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : false;
  }
}
Decoration.none = RangeSet.empty;
class MarkDecoration extends Decoration {
  constructor(spec) {
    let { start, end } = getInclusive(spec);
    super(start ? -1 : 5e8, end ? 1 : -6e8, null, spec);
    this.tagName = spec.tagName || "span";
    this.class = spec.class || "";
    this.attrs = spec.attributes || null;
  }
  eq(other) {
    return this == other || other instanceof MarkDecoration && this.tagName == other.tagName && this.class == other.class && attrsEq(this.attrs, other.attrs);
  }
  range(from, to = from) {
    if (from >= to)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(from, to);
  }
}
MarkDecoration.prototype.point = false;
class LineDecoration extends Decoration {
  constructor(spec) {
    super(-2e8, -2e8, null, spec);
  }
  eq(other) {
    return other instanceof LineDecoration && this.spec.class == other.spec.class && attrsEq(this.spec.attributes, other.spec.attributes);
  }
  range(from, to = from) {
    if (to != from)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(from, to);
  }
}
LineDecoration.prototype.mapMode = MapMode.TrackBefore;
LineDecoration.prototype.point = true;
class PointDecoration extends Decoration {
  constructor(spec, startSide, endSide, block, widget, isReplace) {
    super(startSide, endSide, widget, spec);
    this.block = block;
    this.isReplace = isReplace;
    this.mapMode = !block ? MapMode.TrackDel : startSide <= 0 ? MapMode.TrackBefore : MapMode.TrackAfter;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide < this.endSide ? BlockType.WidgetRange : this.startSide <= 0 ? BlockType.WidgetBefore : BlockType.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && this.widget.estimatedHeight >= 5;
  }
  eq(other) {
    return other instanceof PointDecoration && widgetsEq(this.widget, other.widget) && this.block == other.block && this.startSide == other.startSide && this.endSide == other.endSide;
  }
  range(from, to = from) {
    if (this.isReplace && (from > to || from == to && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && to != from)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(from, to);
  }
}
PointDecoration.prototype.point = true;
function getInclusive(spec, block = false) {
  let { inclusiveStart: start, inclusiveEnd: end } = spec;
  if (start == null)
    start = spec.inclusive;
  if (end == null)
    end = spec.inclusive;
  return { start: start !== null && start !== void 0 ? start : block, end: end !== null && end !== void 0 ? end : block };
}
function widgetsEq(a, b) {
  return a == b || !!(a && b && a.compare(b));
}
function addRange(from, to, ranges, margin = 0) {
  let last = ranges.length - 1;
  if (last >= 0 && ranges[last] + margin >= from)
    ranges[last] = Math.max(ranges[last], to);
  else
    ranges.push(from, to);
}
class LineView extends ContentView {
  constructor() {
    super(...arguments);
    this.children = [];
    this.length = 0;
    this.prevAttrs = void 0;
    this.attrs = null;
    this.breakAfter = 0;
  }
  // Consumes source
  merge(from, to, source, hasStart, openStart, openEnd) {
    if (source) {
      if (!(source instanceof LineView))
        return false;
      if (!this.dom)
        source.transferDOM(this);
    }
    if (hasStart)
      this.setDeco(source ? source.attrs : null);
    mergeChildrenInto(this, from, to, source ? source.children : [], openStart, openEnd);
    return true;
  }
  split(at) {
    let end = new LineView();
    end.breakAfter = this.breakAfter;
    if (this.length == 0)
      return end;
    let { i, off } = this.childPos(at);
    if (off) {
      end.append(this.children[i].split(off), 0);
      this.children[i].merge(off, this.children[i].length, null, false, 0, 0);
      i++;
    }
    for (let j = i; j < this.children.length; j++)
      end.append(this.children[j], 0);
    while (i > 0 && this.children[i - 1].length == 0)
      this.children[--i].destroy();
    this.children.length = i;
    this.markDirty();
    this.length = at;
    return end;
  }
  transferDOM(other) {
    if (!this.dom)
      return;
    this.markDirty();
    other.setDOM(this.dom);
    other.prevAttrs = this.prevAttrs === void 0 ? this.attrs : this.prevAttrs;
    this.prevAttrs = void 0;
    this.dom = null;
  }
  setDeco(attrs) {
    if (!attrsEq(this.attrs, attrs)) {
      if (this.dom) {
        this.prevAttrs = this.attrs;
        this.markDirty();
      }
      this.attrs = attrs;
    }
  }
  append(child, openStart) {
    joinInlineInto(this, child, openStart);
  }
  // Only called when building a line view in ContentBuilder
  addLineDeco(deco) {
    let attrs = deco.spec.attributes, cls = deco.spec.class;
    if (attrs)
      this.attrs = combineAttrs(attrs, this.attrs || {});
    if (cls)
      this.attrs = combineAttrs({ class: cls }, this.attrs || {});
  }
  domAtPos(pos) {
    return inlineDOMAtPos(this, pos);
  }
  reuseDOM(node) {
    if (node.nodeName == "DIV") {
      this.setDOM(node);
      this.dirty |= 4 | 2;
    }
  }
  sync(view, track) {
    var _a2;
    if (!this.dom) {
      this.setDOM(document.createElement("div"));
      this.dom.className = "cm-line";
      this.prevAttrs = this.attrs ? null : void 0;
    } else if (this.dirty & 4) {
      clearAttributes(this.dom);
      this.dom.className = "cm-line";
      this.prevAttrs = this.attrs ? null : void 0;
    }
    if (this.prevAttrs !== void 0) {
      updateAttrs(this.dom, this.prevAttrs, this.attrs);
      this.dom.classList.add("cm-line");
      this.prevAttrs = void 0;
    }
    super.sync(view, track);
    let last = this.dom.lastChild;
    while (last && ContentView.get(last) instanceof MarkView)
      last = last.lastChild;
    if (!last || !this.length || last.nodeName != "BR" && ((_a2 = ContentView.get(last)) === null || _a2 === void 0 ? void 0 : _a2.isEditable) == false && (!browser.ios || !this.children.some((ch) => ch instanceof TextView))) {
      let hack = document.createElement("BR");
      hack.cmIgnore = true;
      this.dom.appendChild(hack);
    }
  }
  measureTextSize() {
    if (this.children.length == 0 || this.length > 20)
      return null;
    let totalWidth = 0;
    for (let child of this.children) {
      if (!(child instanceof TextView) || /[^ -~]/.test(child.text))
        return null;
      let rects = clientRectsFor(child.dom);
      if (rects.length != 1)
        return null;
      totalWidth += rects[0].width;
    }
    return !totalWidth ? null : {
      lineHeight: this.dom.getBoundingClientRect().height,
      charWidth: totalWidth / this.length
    };
  }
  coordsAt(pos, side) {
    return coordsInChildren(this, pos, side);
  }
  become(_other) {
    return false;
  }
  get type() {
    return BlockType.Text;
  }
  static find(docView, pos) {
    for (let i = 0, off = 0; i < docView.children.length; i++) {
      let block = docView.children[i], end = off + block.length;
      if (end >= pos) {
        if (block instanceof LineView)
          return block;
        if (end > pos)
          break;
      }
      off = end + block.breakAfter;
    }
    return null;
  }
}
class BlockWidgetView extends ContentView {
  constructor(widget, length, type) {
    super();
    this.widget = widget;
    this.length = length;
    this.type = type;
    this.breakAfter = 0;
    this.prevWidget = null;
  }
  merge(from, to, source, _takeDeco, openStart, openEnd) {
    if (source && (!(source instanceof BlockWidgetView) || !this.widget.compare(source.widget) || from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
      return false;
    this.length = from + (source ? source.length : 0) + (this.length - to);
    return true;
  }
  domAtPos(pos) {
    return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
  }
  split(at) {
    let len = this.length - at;
    this.length = at;
    let end = new BlockWidgetView(this.widget, len, this.type);
    end.breakAfter = this.breakAfter;
    return end;
  }
  get children() {
    return noChildren;
  }
  sync(view) {
    if (!this.dom || !this.widget.updateDOM(this.dom, view)) {
      if (this.dom && this.prevWidget)
        this.prevWidget.destroy(this.dom);
      this.prevWidget = null;
      this.setDOM(this.widget.toDOM(view));
      this.dom.contentEditable = "false";
    }
  }
  get overrideDOMText() {
    return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : Text.empty;
  }
  domBoundsAround() {
    return null;
  }
  become(other) {
    if (other instanceof BlockWidgetView && other.type == this.type && other.widget.constructor == this.widget.constructor) {
      if (!other.widget.eq(this.widget))
        this.markDirty(true);
      if (this.dom && !this.prevWidget)
        this.prevWidget = this.widget;
      this.widget = other.widget;
      this.length = other.length;
      this.breakAfter = other.breakAfter;
      return true;
    }
    return false;
  }
  ignoreMutation() {
    return true;
  }
  ignoreEvent(event) {
    return this.widget.ignoreEvent(event);
  }
  get isEditable() {
    return false;
  }
  get isWidget() {
    return true;
  }
  destroy() {
    super.destroy();
    if (this.dom)
      this.widget.destroy(this.dom);
  }
}
class ContentBuilder {
  constructor(doc2, pos, end, disallowBlockEffectsFor) {
    this.doc = doc2;
    this.pos = pos;
    this.end = end;
    this.disallowBlockEffectsFor = disallowBlockEffectsFor;
    this.content = [];
    this.curLine = null;
    this.breakAtStart = 0;
    this.pendingBuffer = 0;
    this.bufferMarks = [];
    this.atCursorPos = true;
    this.openStart = -1;
    this.openEnd = -1;
    this.text = "";
    this.textOff = 0;
    this.cursor = doc2.iter();
    this.skip = pos;
  }
  posCovered() {
    if (this.content.length == 0)
      return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
    let last = this.content[this.content.length - 1];
    return !last.breakAfter && !(last instanceof BlockWidgetView && last.type == BlockType.WidgetBefore);
  }
  getLine() {
    if (!this.curLine) {
      this.content.push(this.curLine = new LineView());
      this.atCursorPos = true;
    }
    return this.curLine;
  }
  flushBuffer(active = this.bufferMarks) {
    if (this.pendingBuffer) {
      this.curLine.append(wrapMarks(new WidgetBufferView(-1), active), active.length);
      this.pendingBuffer = 0;
    }
  }
  addBlockWidget(view) {
    this.flushBuffer();
    this.curLine = null;
    this.content.push(view);
  }
  finish(openEnd) {
    if (this.pendingBuffer && openEnd <= this.bufferMarks.length)
      this.flushBuffer();
    else
      this.pendingBuffer = 0;
    if (!this.posCovered())
      this.getLine();
  }
  buildText(length, active, openStart) {
    while (length > 0) {
      if (this.textOff == this.text.length) {
        let { value, lineBreak, done } = this.cursor.next(this.skip);
        this.skip = 0;
        if (done)
          throw new Error("Ran out of text content when drawing inline views");
        if (lineBreak) {
          if (!this.posCovered())
            this.getLine();
          if (this.content.length)
            this.content[this.content.length - 1].breakAfter = 1;
          else
            this.breakAtStart = 1;
          this.flushBuffer();
          this.curLine = null;
          this.atCursorPos = true;
          length--;
          continue;
        } else {
          this.text = value;
          this.textOff = 0;
        }
      }
      let take = Math.min(
        this.text.length - this.textOff,
        length,
        512
        /* T.Chunk */
      );
      this.flushBuffer(active.slice(active.length - openStart));
      this.getLine().append(wrapMarks(new TextView(this.text.slice(this.textOff, this.textOff + take)), active), openStart);
      this.atCursorPos = true;
      this.textOff += take;
      length -= take;
      openStart = 0;
    }
  }
  span(from, to, active, openStart) {
    this.buildText(to - from, active, openStart);
    this.pos = to;
    if (this.openStart < 0)
      this.openStart = openStart;
  }
  point(from, to, deco, active, openStart, index) {
    if (this.disallowBlockEffectsFor[index] && deco instanceof PointDecoration) {
      if (deco.block)
        throw new RangeError("Block decorations may not be specified via plugins");
      if (to > this.doc.lineAt(this.pos).to)
        throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
    }
    let len = to - from;
    if (deco instanceof PointDecoration) {
      if (deco.block) {
        let { type } = deco;
        if (type == BlockType.WidgetAfter && !this.posCovered())
          this.getLine();
        this.addBlockWidget(new BlockWidgetView(deco.widget || new NullWidget("div"), len, type));
      } else {
        let view = WidgetView.create(deco.widget || new NullWidget("span"), len, len ? 0 : deco.startSide);
        let cursorBefore = this.atCursorPos && !view.isEditable && openStart <= active.length && (from < to || deco.startSide > 0);
        let cursorAfter = !view.isEditable && (from < to || openStart > active.length || deco.startSide <= 0);
        let line = this.getLine();
        if (this.pendingBuffer == 2 && !cursorBefore)
          this.pendingBuffer = 0;
        this.flushBuffer(active);
        if (cursorBefore) {
          line.append(wrapMarks(new WidgetBufferView(1), active), openStart);
          openStart = active.length + Math.max(0, openStart - active.length);
        }
        line.append(wrapMarks(view, active), openStart);
        this.atCursorPos = cursorAfter;
        this.pendingBuffer = !cursorAfter ? 0 : from < to || openStart > active.length ? 1 : 2;
        if (this.pendingBuffer)
          this.bufferMarks = active.slice();
      }
    } else if (this.doc.lineAt(this.pos).from == this.pos) {
      this.getLine().addLineDeco(deco);
    }
    if (len) {
      if (this.textOff + len <= this.text.length) {
        this.textOff += len;
      } else {
        this.skip += len - (this.text.length - this.textOff);
        this.text = "";
        this.textOff = 0;
      }
      this.pos = to;
    }
    if (this.openStart < 0)
      this.openStart = openStart;
  }
  static build(text, from, to, decorations2, dynamicDecorationMap) {
    let builder = new ContentBuilder(text, from, to, dynamicDecorationMap);
    builder.openEnd = RangeSet.spans(decorations2, from, to, builder);
    if (builder.openStart < 0)
      builder.openStart = builder.openEnd;
    builder.finish(builder.openEnd);
    return builder;
  }
}
function wrapMarks(view, active) {
  for (let mark of active)
    view = new MarkView(mark, [view], view.length);
  return view;
}
class NullWidget extends WidgetType {
  constructor(tag) {
    super();
    this.tag = tag;
  }
  eq(other) {
    return other.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(elt) {
    return elt.nodeName.toLowerCase() == this.tag;
  }
}
const clickAddsSelectionRange = /* @__PURE__ */ Facet.define();
const dragMovesSelection$1 = /* @__PURE__ */ Facet.define();
const mouseSelectionStyle = /* @__PURE__ */ Facet.define();
const exceptionSink = /* @__PURE__ */ Facet.define();
const updateListener = /* @__PURE__ */ Facet.define();
const inputHandler$1 = /* @__PURE__ */ Facet.define();
const focusChangeEffect = /* @__PURE__ */ Facet.define();
const perLineTextDirection = /* @__PURE__ */ Facet.define({
  combine: (values) => values.some((x) => x)
});
const nativeSelectionHidden = /* @__PURE__ */ Facet.define({
  combine: (values) => values.some((x) => x)
});
class ScrollTarget {
  constructor(range, y = "nearest", x = "nearest", yMargin = 5, xMargin = 5) {
    this.range = range;
    this.y = y;
    this.x = x;
    this.yMargin = yMargin;
    this.xMargin = xMargin;
  }
  map(changes) {
    return changes.empty ? this : new ScrollTarget(this.range.map(changes), this.y, this.x, this.yMargin, this.xMargin);
  }
}
const scrollIntoView$1 = /* @__PURE__ */ StateEffect.define({ map: (t2, ch) => t2.map(ch) });
function logException(state, exception, context) {
  let handler = state.facet(exceptionSink);
  if (handler.length)
    handler[0](exception);
  else if (window.onerror)
    window.onerror(String(exception), context, void 0, void 0, exception);
  else if (context)
    console.error(context + ":", exception);
  else
    console.error(exception);
}
const editable = /* @__PURE__ */ Facet.define({ combine: (values) => values.length ? values[0] : true });
let nextPluginID = 0;
const viewPlugin = /* @__PURE__ */ Facet.define();
class ViewPlugin {
  constructor(id2, create, domEventHandlers, buildExtensions) {
    this.id = id2;
    this.create = create;
    this.domEventHandlers = domEventHandlers;
    this.extension = buildExtensions(this);
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(create, spec) {
    const { eventHandlers, provide, decorations: deco } = spec || {};
    return new ViewPlugin(nextPluginID++, create, eventHandlers, (plugin) => {
      let ext = [viewPlugin.of(plugin)];
      if (deco)
        ext.push(decorations.of((view) => {
          let pluginInst = view.plugin(plugin);
          return pluginInst ? deco(pluginInst) : Decoration.none;
        }));
      if (provide)
        ext.push(provide(plugin));
      return ext;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(cls, spec) {
    return ViewPlugin.define((view) => new cls(view), spec);
  }
}
class PluginInstance {
  constructor(spec) {
    this.spec = spec;
    this.mustUpdate = null;
    this.value = null;
  }
  update(view) {
    if (!this.value) {
      if (this.spec) {
        try {
          this.value = this.spec.create(view);
        } catch (e) {
          logException(view.state, e, "CodeMirror plugin crashed");
          this.deactivate();
        }
      }
    } else if (this.mustUpdate) {
      let update = this.mustUpdate;
      this.mustUpdate = null;
      if (this.value.update) {
        try {
          this.value.update(update);
        } catch (e) {
          logException(update.state, e, "CodeMirror plugin crashed");
          if (this.value.destroy)
            try {
              this.value.destroy();
            } catch (_) {
            }
          this.deactivate();
        }
      }
    }
    return this;
  }
  destroy(view) {
    var _a2;
    if ((_a2 = this.value) === null || _a2 === void 0 ? void 0 : _a2.destroy) {
      try {
        this.value.destroy();
      } catch (e) {
        logException(view.state, e, "CodeMirror plugin crashed");
      }
    }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const editorAttributes = /* @__PURE__ */ Facet.define();
const contentAttributes = /* @__PURE__ */ Facet.define();
const decorations = /* @__PURE__ */ Facet.define();
const atomicRanges = /* @__PURE__ */ Facet.define();
const scrollMargins = /* @__PURE__ */ Facet.define();
const styleModule = /* @__PURE__ */ Facet.define();
class ChangedRange {
  constructor(fromA, toA, fromB, toB) {
    this.fromA = fromA;
    this.toA = toA;
    this.fromB = fromB;
    this.toB = toB;
  }
  join(other) {
    return new ChangedRange(Math.min(this.fromA, other.fromA), Math.max(this.toA, other.toA), Math.min(this.fromB, other.fromB), Math.max(this.toB, other.toB));
  }
  addToSet(set) {
    let i = set.length, me = this;
    for (; i > 0; i--) {
      let range = set[i - 1];
      if (range.fromA > me.toA)
        continue;
      if (range.toA < me.fromA)
        break;
      me = me.join(range);
      set.splice(i - 1, 1);
    }
    set.splice(i, 0, me);
    return set;
  }
  static extendWithRanges(diff, ranges) {
    if (ranges.length == 0)
      return diff;
    let result = [];
    for (let dI = 0, rI = 0, posA = 0, posB = 0; ; dI++) {
      let next = dI == diff.length ? null : diff[dI], off = posA - posB;
      let end = next ? next.fromB : 1e9;
      while (rI < ranges.length && ranges[rI] < end) {
        let from = ranges[rI], to = ranges[rI + 1];
        let fromB = Math.max(posB, from), toB = Math.min(end, to);
        if (fromB <= toB)
          new ChangedRange(fromB + off, toB + off, fromB, toB).addToSet(result);
        if (to > end)
          break;
        else
          rI += 2;
      }
      if (!next)
        return result;
      new ChangedRange(next.fromA, next.toA, next.fromB, next.toB).addToSet(result);
      posA = next.toA;
      posB = next.toB;
    }
  }
}
class ViewUpdate {
  constructor(view, state, transactions) {
    this.view = view;
    this.state = state;
    this.transactions = transactions;
    this.flags = 0;
    this.startState = view.state;
    this.changes = ChangeSet.empty(this.startState.doc.length);
    for (let tr of transactions)
      this.changes = this.changes.compose(tr.changes);
    let changedRanges = [];
    this.changes.iterChangedRanges((fromA, toA, fromB, toB) => changedRanges.push(new ChangedRange(fromA, toA, fromB, toB)));
    this.changedRanges = changedRanges;
  }
  /**
  @internal
  */
  static create(view, state, transactions) {
    return new ViewUpdate(view, state, transactions);
  }
  /**
  Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
  [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
  update.
  */
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  /**
  Indicates whether the height of a block element in the editor
  changed in this update.
  */
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  /**
  Returns true when the document was modified or the size of the
  editor, or elements within the editor, changed.
  */
  get geometryChanged() {
    return this.docChanged || (this.flags & (8 | 2)) > 0;
  }
  /**
  True when this update indicates a focus change.
  */
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  /**
  Whether the document changed in this update.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Whether the selection was explicitly set in this update.
  */
  get selectionSet() {
    return this.transactions.some((tr) => tr.selection);
  }
  /**
  @internal
  */
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
}
var Direction = /* @__PURE__ */ function(Direction2) {
  Direction2[Direction2["LTR"] = 0] = "LTR";
  Direction2[Direction2["RTL"] = 1] = "RTL";
  return Direction2;
}(Direction || (Direction = {}));
const LTR = Direction.LTR, RTL = Direction.RTL;
function dec(str) {
  let result = [];
  for (let i = 0; i < str.length; i++)
    result.push(1 << +str[i]);
  return result;
}
const LowTypes = /* @__PURE__ */ dec("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008");
const ArabicTypes = /* @__PURE__ */ dec("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333");
const Brackets = /* @__PURE__ */ Object.create(null), BracketStack = [];
for (let p of ["()", "[]", "{}"]) {
  let l = /* @__PURE__ */ p.charCodeAt(0), r = /* @__PURE__ */ p.charCodeAt(1);
  Brackets[l] = r;
  Brackets[r] = -l;
}
function charType(ch) {
  return ch <= 247 ? LowTypes[ch] : 1424 <= ch && ch <= 1524 ? 2 : 1536 <= ch && ch <= 1785 ? ArabicTypes[ch - 1536] : 1774 <= ch && ch <= 2220 ? 4 : 8192 <= ch && ch <= 8203 ? 256 : 64336 <= ch && ch <= 65023 ? 4 : ch == 8204 ? 256 : 1;
}
const BidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class BidiSpan {
  /**
  @internal
  */
  constructor(from, to, level) {
    this.from = from;
    this.to = to;
    this.level = level;
  }
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? RTL : LTR;
  }
  /**
  @internal
  */
  side(end, dir) {
    return this.dir == dir == end ? this.to : this.from;
  }
  /**
  @internal
  */
  static find(order, index, level, assoc) {
    let maybe = -1;
    for (let i = 0; i < order.length; i++) {
      let span = order[i];
      if (span.from <= index && span.to >= index) {
        if (span.level == level)
          return i;
        if (maybe < 0 || (assoc != 0 ? assoc < 0 ? span.from < index : span.to > index : order[maybe].level > span.level))
          maybe = i;
      }
    }
    if (maybe < 0)
      throw new RangeError("Index out of range");
    return maybe;
  }
}
const types = [];
function computeOrder(line, direction) {
  let len = line.length, outerType = direction == LTR ? 1 : 2, oppositeType = direction == LTR ? 2 : 1;
  if (!line || outerType == 1 && !BidiRE.test(line))
    return trivialOrder(len);
  for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
    let type = charType(line.charCodeAt(i));
    if (type == 512)
      type = prev;
    else if (type == 8 && prevStrong == 4)
      type = 16;
    types[i] = type == 4 ? 2 : type;
    if (type & 7)
      prevStrong = type;
    prev = type;
  }
  for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
    let type = types[i];
    if (type == 128) {
      if (i < len - 1 && prev == types[i + 1] && prev & 24)
        type = types[i] = prev;
      else
        types[i] = 256;
    } else if (type == 64) {
      let end = i + 1;
      while (end < len && types[end] == 64)
        end++;
      let replace = i && prev == 8 || end < len && types[end] == 8 ? prevStrong == 1 ? 1 : 8 : 256;
      for (let j = i; j < end; j++)
        types[j] = replace;
      i = end - 1;
    } else if (type == 8 && prevStrong == 1) {
      types[i] = 1;
    }
    prev = type;
    if (type & 7)
      prevStrong = type;
  }
  for (let i = 0, sI = 0, context = 0, ch, br, type; i < len; i++) {
    if (br = Brackets[ch = line.charCodeAt(i)]) {
      if (br < 0) {
        for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
          if (BracketStack[sJ + 1] == -br) {
            let flags = BracketStack[sJ + 2];
            let type2 = flags & 2 ? outerType : !(flags & 4) ? 0 : flags & 1 ? oppositeType : outerType;
            if (type2)
              types[i] = types[BracketStack[sJ]] = type2;
            sI = sJ;
            break;
          }
        }
      } else if (BracketStack.length == 189) {
        break;
      } else {
        BracketStack[sI++] = i;
        BracketStack[sI++] = ch;
        BracketStack[sI++] = context;
      }
    } else if ((type = types[i]) == 2 || type == 1) {
      let embed = type == outerType;
      context = embed ? 0 : 1;
      for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
        let cur2 = BracketStack[sJ + 2];
        if (cur2 & 2)
          break;
        if (embed) {
          BracketStack[sJ + 2] |= 2;
        } else {
          if (cur2 & 4)
            break;
          BracketStack[sJ + 2] |= 4;
        }
      }
    }
  }
  for (let i = 0; i < len; i++) {
    if (types[i] == 256) {
      let end = i + 1;
      while (end < len && types[end] == 256)
        end++;
      let beforeL = (i ? types[i - 1] : outerType) == 1;
      let afterL = (end < len ? types[end] : outerType) == 1;
      let replace = beforeL == afterL ? beforeL ? 1 : 2 : outerType;
      for (let j = i; j < end; j++)
        types[j] = replace;
      i = end - 1;
    }
  }
  let order = [];
  if (outerType == 1) {
    for (let i = 0; i < len; ) {
      let start = i, rtl = types[i++] != 1;
      while (i < len && rtl == (types[i] != 1))
        i++;
      if (rtl) {
        for (let j = i; j > start; ) {
          let end = j, l = types[--j] != 2;
          while (j > start && l == (types[j - 1] != 2))
            j--;
          order.push(new BidiSpan(j, end, l ? 2 : 1));
        }
      } else {
        order.push(new BidiSpan(start, i, 0));
      }
    }
  } else {
    for (let i = 0; i < len; ) {
      let start = i, rtl = types[i++] == 2;
      while (i < len && rtl == (types[i] == 2))
        i++;
      order.push(new BidiSpan(start, i, rtl ? 1 : 2));
    }
  }
  return order;
}
function trivialOrder(length) {
  return [new BidiSpan(0, length, 0)];
}
let movedOver = "";
function moveVisually(line, order, dir, start, forward) {
  var _a2;
  let startIndex = start.head - line.from, spanI = -1;
  if (startIndex == 0) {
    if (!forward || !line.length)
      return null;
    if (order[0].level != dir) {
      startIndex = order[0].side(false, dir);
      spanI = 0;
    }
  } else if (startIndex == line.length) {
    if (forward)
      return null;
    let last = order[order.length - 1];
    if (last.level != dir) {
      startIndex = last.side(true, dir);
      spanI = order.length - 1;
    }
  }
  if (spanI < 0)
    spanI = BidiSpan.find(order, startIndex, (_a2 = start.bidiLevel) !== null && _a2 !== void 0 ? _a2 : -1, start.assoc);
  let span = order[spanI];
  if (startIndex == span.side(forward, dir)) {
    span = order[spanI += forward ? 1 : -1];
    startIndex = span.side(!forward, dir);
  }
  let indexForward = forward == (span.dir == dir);
  let nextIndex = findClusterBreak(line.text, startIndex, indexForward);
  movedOver = line.text.slice(Math.min(startIndex, nextIndex), Math.max(startIndex, nextIndex));
  if (nextIndex != span.side(forward, dir))
    return EditorSelection.cursor(nextIndex + line.from, indexForward ? -1 : 1, span.level);
  let nextSpan = spanI == (forward ? order.length - 1 : 0) ? null : order[spanI + (forward ? 1 : -1)];
  if (!nextSpan && span.level != dir)
    return EditorSelection.cursor(forward ? line.to : line.from, forward ? -1 : 1, dir);
  if (nextSpan && nextSpan.level < span.level)
    return EditorSelection.cursor(nextSpan.side(!forward, dir) + line.from, forward ? 1 : -1, nextSpan.level);
  return EditorSelection.cursor(nextIndex + line.from, forward ? -1 : 1, span.level);
}
const LineBreakPlaceholder = "￿";
class DOMReader {
  constructor(points, state) {
    this.points = points;
    this.text = "";
    this.lineSeparator = state.facet(EditorState.lineSeparator);
  }
  append(text) {
    this.text += text;
  }
  lineBreak() {
    this.text += LineBreakPlaceholder;
  }
  readRange(start, end) {
    if (!start)
      return this;
    let parent = start.parentNode;
    for (let cur2 = start; ; ) {
      this.findPointBefore(parent, cur2);
      this.readNode(cur2);
      let next = cur2.nextSibling;
      if (next == end)
        break;
      let view = ContentView.get(cur2), nextView = ContentView.get(next);
      if (view && nextView ? view.breakAfter : (view ? view.breakAfter : isBlockElement(cur2)) || isBlockElement(next) && (cur2.nodeName != "BR" || cur2.cmIgnore))
        this.lineBreak();
      cur2 = next;
    }
    this.findPointBefore(parent, end);
    return this;
  }
  readTextNode(node) {
    let text = node.nodeValue;
    for (let point of this.points)
      if (point.node == node)
        point.pos = this.text.length + Math.min(point.offset, text.length);
    for (let off = 0, re = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let nextBreak = -1, breakSize = 1, m;
      if (this.lineSeparator) {
        nextBreak = text.indexOf(this.lineSeparator, off);
        breakSize = this.lineSeparator.length;
      } else if (m = re.exec(text)) {
        nextBreak = m.index;
        breakSize = m[0].length;
      }
      this.append(text.slice(off, nextBreak < 0 ? text.length : nextBreak));
      if (nextBreak < 0)
        break;
      this.lineBreak();
      if (breakSize > 1) {
        for (let point of this.points)
          if (point.node == node && point.pos > this.text.length)
            point.pos -= breakSize - 1;
      }
      off = nextBreak + breakSize;
    }
  }
  readNode(node) {
    if (node.cmIgnore)
      return;
    let view = ContentView.get(node);
    let fromView = view && view.overrideDOMText;
    if (fromView != null) {
      this.findPointInside(node, fromView.length);
      for (let i = fromView.iter(); !i.next().done; ) {
        if (i.lineBreak)
          this.lineBreak();
        else
          this.append(i.value);
      }
    } else if (node.nodeType == 3) {
      this.readTextNode(node);
    } else if (node.nodeName == "BR") {
      if (node.nextSibling)
        this.lineBreak();
    } else if (node.nodeType == 1) {
      this.readRange(node.firstChild, null);
    }
  }
  findPointBefore(node, next) {
    for (let point of this.points)
      if (point.node == node && node.childNodes[point.offset] == next)
        point.pos = this.text.length;
  }
  findPointInside(node, maxLen) {
    for (let point of this.points)
      if (node.nodeType == 3 ? point.node == node : node.contains(point.node))
        point.pos = this.text.length + Math.min(maxLen, point.offset);
  }
}
function isBlockElement(node) {
  return node.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(node.nodeName);
}
class DOMPoint {
  constructor(node, offset) {
    this.node = node;
    this.offset = offset;
    this.pos = -1;
  }
}
class DocView extends ContentView {
  constructor(view) {
    super();
    this.view = view;
    this.compositionDeco = Decoration.none;
    this.decorations = [];
    this.dynamicDecorationMap = [];
    this.minWidth = 0;
    this.minWidthFrom = 0;
    this.minWidthTo = 0;
    this.impreciseAnchor = null;
    this.impreciseHead = null;
    this.forceSelection = false;
    this.lastUpdate = Date.now();
    this.setDOM(view.contentDOM);
    this.children = [new LineView()];
    this.children[0].setParent(this);
    this.updateDeco();
    this.updateInner([new ChangedRange(0, 0, 0, view.state.doc.length)], 0);
  }
  get length() {
    return this.view.state.doc.length;
  }
  // Update the document view to a given state. scrollIntoView can be
  // used as a hint to compute a new viewport that includes that
  // position, if we know the editor is going to scroll that position
  // into view.
  update(update) {
    let changedRanges = update.changedRanges;
    if (this.minWidth > 0 && changedRanges.length) {
      if (!changedRanges.every(({ fromA, toA }) => toA < this.minWidthFrom || fromA > this.minWidthTo)) {
        this.minWidth = this.minWidthFrom = this.minWidthTo = 0;
      } else {
        this.minWidthFrom = update.changes.mapPos(this.minWidthFrom, 1);
        this.minWidthTo = update.changes.mapPos(this.minWidthTo, 1);
      }
    }
    if (this.view.inputState.composing < 0)
      this.compositionDeco = Decoration.none;
    else if (update.transactions.length || this.dirty)
      this.compositionDeco = computeCompositionDeco(this.view, update.changes);
    if ((browser.ie || browser.chrome) && !this.compositionDeco.size && update && update.state.doc.lines != update.startState.doc.lines)
      this.forceSelection = true;
    let prevDeco = this.decorations, deco = this.updateDeco();
    let decoDiff = findChangedDeco(prevDeco, deco, update.changes);
    changedRanges = ChangedRange.extendWithRanges(changedRanges, decoDiff);
    if (this.dirty == 0 && changedRanges.length == 0) {
      return false;
    } else {
      this.updateInner(changedRanges, update.startState.doc.length);
      if (update.transactions.length)
        this.lastUpdate = Date.now();
      return true;
    }
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(changes, oldLength) {
    this.view.viewState.mustMeasureContent = true;
    this.updateChildren(changes, oldLength);
    let { observer } = this.view;
    observer.ignore(() => {
      this.dom.style.height = this.view.viewState.contentHeight + "px";
      this.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let track = browser.chrome || browser.ios ? { node: observer.selectionRange.focusNode, written: false } : void 0;
      this.sync(this.view, track);
      this.dirty = 0;
      if (track && (track.written || observer.selectionRange.focusNode != track.node))
        this.forceSelection = true;
      this.dom.style.height = "";
    });
    let gaps = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length) {
      for (let child of this.children)
        if (child instanceof BlockWidgetView && child.widget instanceof BlockGapWidget)
          gaps.push(child.dom);
    }
    observer.updateGaps(gaps);
  }
  updateChildren(changes, oldLength) {
    let cursor = this.childCursor(oldLength);
    for (let i = changes.length - 1; ; i--) {
      let next = i >= 0 ? changes[i] : null;
      if (!next)
        break;
      let { fromA, toA, fromB, toB } = next;
      let { content: content2, breakAtStart, openStart, openEnd } = ContentBuilder.build(this.view.state.doc, fromB, toB, this.decorations, this.dynamicDecorationMap);
      let { i: toI, off: toOff } = cursor.findPos(toA, 1);
      let { i: fromI, off: fromOff } = cursor.findPos(fromA, -1);
      replaceRange(this, fromI, fromOff, toI, toOff, content2, breakAtStart, openStart, openEnd);
    }
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(mustRead = false, fromPointer = false) {
    if (mustRead || !this.view.observer.selectionRange.focusNode)
      this.view.observer.readSelectionRange();
    if (!(fromPointer || this.mayControlSelection()))
      return;
    let force = this.forceSelection;
    this.forceSelection = false;
    let main = this.view.state.selection.main;
    let anchor = this.domAtPos(main.anchor);
    let head = main.empty ? anchor : this.domAtPos(main.head);
    if (browser.gecko && main.empty && betweenUneditable(anchor)) {
      let dummy = document.createTextNode("");
      this.view.observer.ignore(() => anchor.node.insertBefore(dummy, anchor.node.childNodes[anchor.offset] || null));
      anchor = head = new DOMPos(dummy, 0);
      force = true;
    }
    let domSel = this.view.observer.selectionRange;
    if (force || !domSel.focusNode || !isEquivalentPosition(anchor.node, anchor.offset, domSel.anchorNode, domSel.anchorOffset) || !isEquivalentPosition(head.node, head.offset, domSel.focusNode, domSel.focusOffset)) {
      this.view.observer.ignore(() => {
        if (browser.android && browser.chrome && this.dom.contains(domSel.focusNode) && inUneditable(domSel.focusNode, this.dom)) {
          this.dom.blur();
          this.dom.focus({ preventScroll: true });
        }
        let rawSel = getSelection(this.view.root);
        if (!rawSel)
          ;
        else if (main.empty) {
          if (browser.gecko) {
            let nextTo = nextToUneditable(anchor.node, anchor.offset);
            if (nextTo && nextTo != (1 | 2)) {
              let text = nearbyTextNode(anchor.node, anchor.offset, nextTo == 1 ? 1 : -1);
              if (text)
                anchor = new DOMPos(text, nextTo == 1 ? 0 : text.nodeValue.length);
            }
          }
          rawSel.collapse(anchor.node, anchor.offset);
          if (main.bidiLevel != null && domSel.cursorBidiLevel != null)
            domSel.cursorBidiLevel = main.bidiLevel;
        } else if (rawSel.extend) {
          rawSel.collapse(anchor.node, anchor.offset);
          try {
            rawSel.extend(head.node, head.offset);
          } catch (_) {
          }
        } else {
          let range = document.createRange();
          if (main.anchor > main.head)
            [anchor, head] = [head, anchor];
          range.setEnd(head.node, head.offset);
          range.setStart(anchor.node, anchor.offset);
          rawSel.removeAllRanges();
          rawSel.addRange(range);
        }
      });
      this.view.observer.setSelectionRange(anchor, head);
    }
    this.impreciseAnchor = anchor.precise ? null : new DOMPos(domSel.anchorNode, domSel.anchorOffset);
    this.impreciseHead = head.precise ? null : new DOMPos(domSel.focusNode, domSel.focusOffset);
  }
  enforceCursorAssoc() {
    if (this.compositionDeco.size)
      return;
    let { view } = this, cursor = view.state.selection.main;
    let sel = getSelection(view.root);
    let { anchorNode, anchorOffset } = view.observer.selectionRange;
    if (!sel || !cursor.empty || !cursor.assoc || !sel.modify)
      return;
    let line = LineView.find(this, cursor.head);
    if (!line)
      return;
    let lineStart = line.posAtStart;
    if (cursor.head == lineStart || cursor.head == lineStart + line.length)
      return;
    let before = this.coordsAt(cursor.head, -1), after = this.coordsAt(cursor.head, 1);
    if (!before || !after || before.bottom > after.top)
      return;
    let dom = this.domAtPos(cursor.head + cursor.assoc);
    sel.collapse(dom.node, dom.offset);
    sel.modify("move", cursor.assoc < 0 ? "forward" : "backward", "lineboundary");
    view.observer.readSelectionRange();
    let newRange = view.observer.selectionRange;
    if (view.docView.posFromDOM(newRange.anchorNode, newRange.anchorOffset) != cursor.from)
      sel.collapse(anchorNode, anchorOffset);
  }
  mayControlSelection() {
    let active = this.view.root.activeElement;
    return active == this.dom || hasSelection(this.dom, this.view.observer.selectionRange) && !(active && this.dom.contains(active));
  }
  nearest(dom) {
    for (let cur2 = dom; cur2; ) {
      let domView = ContentView.get(cur2);
      if (domView && domView.rootView == this)
        return domView;
      cur2 = cur2.parentNode;
    }
    return null;
  }
  posFromDOM(node, offset) {
    let view = this.nearest(node);
    if (!view)
      throw new RangeError("Trying to find position for a DOM position outside of the document");
    return view.localPosFromDOM(node, offset) + view.posAtStart;
  }
  domAtPos(pos) {
    let { i, off } = this.childCursor().findPos(pos, -1);
    for (; i < this.children.length - 1; ) {
      let child = this.children[i];
      if (off < child.length || child instanceof LineView)
        break;
      i++;
      off = 0;
    }
    return this.children[i].domAtPos(off);
  }
  coordsAt(pos, side) {
    for (let off = this.length, i = this.children.length - 1; ; i--) {
      let child = this.children[i], start = off - child.breakAfter - child.length;
      if (pos > start || pos == start && child.type != BlockType.WidgetBefore && child.type != BlockType.WidgetAfter && (!i || side == 2 || this.children[i - 1].breakAfter || this.children[i - 1].type == BlockType.WidgetBefore && side > -2))
        return child.coordsAt(pos - start, side);
      off = start;
    }
  }
  measureVisibleLineHeights(viewport) {
    let result = [], { from, to } = viewport;
    let contentWidth = this.view.contentDOM.clientWidth;
    let isWider = contentWidth > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1;
    let widest = -1, ltr = this.view.textDirection == Direction.LTR;
    for (let pos = 0, i = 0; i < this.children.length; i++) {
      let child = this.children[i], end = pos + child.length;
      if (end > to)
        break;
      if (pos >= from) {
        let childRect = child.dom.getBoundingClientRect();
        result.push(childRect.height);
        if (isWider) {
          let last = child.dom.lastChild;
          let rects = last ? clientRectsFor(last) : [];
          if (rects.length) {
            let rect = rects[rects.length - 1];
            let width = ltr ? rect.right - childRect.left : childRect.right - rect.left;
            if (width > widest) {
              widest = width;
              this.minWidth = contentWidth;
              this.minWidthFrom = pos;
              this.minWidthTo = end;
            }
          }
        }
      }
      pos = end + child.breakAfter;
    }
    return result;
  }
  textDirectionAt(pos) {
    let { i } = this.childPos(pos, 1);
    return getComputedStyle(this.children[i].dom).direction == "rtl" ? Direction.RTL : Direction.LTR;
  }
  measureTextSize() {
    for (let child of this.children) {
      if (child instanceof LineView) {
        let measure = child.measureTextSize();
        if (measure)
          return measure;
      }
    }
    let dummy = document.createElement("div"), lineHeight, charWidth;
    dummy.className = "cm-line";
    dummy.style.width = "99999px";
    dummy.textContent = "abc def ghi jkl mno pqr stu";
    this.view.observer.ignore(() => {
      this.dom.appendChild(dummy);
      let rect = clientRectsFor(dummy.firstChild)[0];
      lineHeight = dummy.getBoundingClientRect().height;
      charWidth = rect ? rect.width / 27 : 7;
      dummy.remove();
    });
    return { lineHeight, charWidth };
  }
  childCursor(pos = this.length) {
    let i = this.children.length;
    if (i)
      pos -= this.children[--i].length;
    return new ChildCursor(this.children, pos, i);
  }
  computeBlockGapDeco() {
    let deco = [], vs = this.view.viewState;
    for (let pos = 0, i = 0; ; i++) {
      let next = i == vs.viewports.length ? null : vs.viewports[i];
      let end = next ? next.from - 1 : this.length;
      if (end > pos) {
        let height = vs.lineBlockAt(end).bottom - vs.lineBlockAt(pos).top;
        deco.push(Decoration.replace({
          widget: new BlockGapWidget(height),
          block: true,
          inclusive: true,
          isBlockGap: true
        }).range(pos, end));
      }
      if (!next)
        break;
      pos = next.to + 1;
    }
    return Decoration.set(deco);
  }
  updateDeco() {
    let allDeco = this.view.state.facet(decorations).map((d, i) => {
      let dynamic = this.dynamicDecorationMap[i] = typeof d == "function";
      return dynamic ? d(this.view) : d;
    });
    for (let i = allDeco.length; i < allDeco.length + 3; i++)
      this.dynamicDecorationMap[i] = false;
    return this.decorations = [
      ...allDeco,
      this.compositionDeco,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ];
  }
  scrollIntoView(target) {
    let { range } = target;
    let rect = this.coordsAt(range.head, range.empty ? range.assoc : range.head > range.anchor ? -1 : 1), other;
    if (!rect)
      return;
    if (!range.empty && (other = this.coordsAt(range.anchor, range.anchor > range.head ? -1 : 1)))
      rect = {
        left: Math.min(rect.left, other.left),
        top: Math.min(rect.top, other.top),
        right: Math.max(rect.right, other.right),
        bottom: Math.max(rect.bottom, other.bottom)
      };
    let mLeft = 0, mRight = 0, mTop = 0, mBottom = 0;
    for (let margins of this.view.state.facet(scrollMargins).map((f) => f(this.view)))
      if (margins) {
        let { left, right, top: top2, bottom } = margins;
        if (left != null)
          mLeft = Math.max(mLeft, left);
        if (right != null)
          mRight = Math.max(mRight, right);
        if (top2 != null)
          mTop = Math.max(mTop, top2);
        if (bottom != null)
          mBottom = Math.max(mBottom, bottom);
      }
    let targetRect = {
      left: rect.left - mLeft,
      top: rect.top - mTop,
      right: rect.right + mRight,
      bottom: rect.bottom + mBottom
    };
    scrollRectIntoView(this.view.scrollDOM, targetRect, range.head < range.anchor ? -1 : 1, target.x, target.y, target.xMargin, target.yMargin, this.view.textDirection == Direction.LTR);
  }
}
function betweenUneditable(pos) {
  return pos.node.nodeType == 1 && pos.node.firstChild && (pos.offset == 0 || pos.node.childNodes[pos.offset - 1].contentEditable == "false") && (pos.offset == pos.node.childNodes.length || pos.node.childNodes[pos.offset].contentEditable == "false");
}
class BlockGapWidget extends WidgetType {
  constructor(height) {
    super();
    this.height = height;
  }
  toDOM() {
    let elt = document.createElement("div");
    this.updateDOM(elt);
    return elt;
  }
  eq(other) {
    return other.height == this.height;
  }
  updateDOM(elt) {
    elt.style.height = this.height + "px";
    return true;
  }
  get estimatedHeight() {
    return this.height;
  }
}
function compositionSurroundingNode(view) {
  let sel = view.observer.selectionRange;
  let textNode = sel.focusNode && nearbyTextNode(sel.focusNode, sel.focusOffset, 0);
  if (!textNode)
    return null;
  let cView = view.docView.nearest(textNode);
  if (!cView)
    return null;
  if (cView instanceof LineView) {
    let topNode = textNode;
    while (topNode.parentNode != cView.dom)
      topNode = topNode.parentNode;
    let prev = topNode.previousSibling;
    while (prev && !ContentView.get(prev))
      prev = prev.previousSibling;
    let pos = prev ? ContentView.get(prev).posAtEnd : cView.posAtStart;
    return { from: pos, to: pos, node: topNode, text: textNode };
  } else {
    for (; ; ) {
      let { parent } = cView;
      if (!parent)
        return null;
      if (parent instanceof LineView)
        break;
      cView = parent;
    }
    let from = cView.posAtStart;
    return { from, to: from + cView.length, node: cView.dom, text: textNode };
  }
}
function computeCompositionDeco(view, changes) {
  let surrounding = compositionSurroundingNode(view);
  if (!surrounding)
    return Decoration.none;
  let { from, to, node, text: textNode } = surrounding;
  let newFrom = changes.mapPos(from, 1), newTo = Math.max(newFrom, changes.mapPos(to, -1));
  let { state } = view, text = node.nodeType == 3 ? node.nodeValue : new DOMReader([], state).readRange(node.firstChild, null).text;
  if (newTo - newFrom < text.length) {
    if (state.doc.sliceString(newFrom, Math.min(state.doc.length, newFrom + text.length), LineBreakPlaceholder) == text)
      newTo = newFrom + text.length;
    else if (state.doc.sliceString(Math.max(0, newTo - text.length), newTo, LineBreakPlaceholder) == text)
      newFrom = newTo - text.length;
    else
      return Decoration.none;
  } else if (state.doc.sliceString(newFrom, newTo, LineBreakPlaceholder) != text) {
    return Decoration.none;
  }
  let topView = ContentView.get(node);
  if (topView instanceof CompositionView)
    topView = topView.widget.topView;
  else if (topView)
    topView.parent = null;
  return Decoration.set(Decoration.replace({ widget: new CompositionWidget(node, textNode, topView), inclusive: true }).range(newFrom, newTo));
}
class CompositionWidget extends WidgetType {
  constructor(top2, text, topView) {
    super();
    this.top = top2;
    this.text = text;
    this.topView = topView;
  }
  eq(other) {
    return this.top == other.top && this.text == other.text;
  }
  toDOM() {
    return this.top;
  }
  ignoreEvent() {
    return false;
  }
  get customView() {
    return CompositionView;
  }
}
function nearbyTextNode(node, offset, side) {
  for (; ; ) {
    if (node.nodeType == 3)
      return node;
    if (node.nodeType == 1 && offset > 0 && side <= 0) {
      node = node.childNodes[offset - 1];
      offset = maxOffset(node);
    } else if (node.nodeType == 1 && offset < node.childNodes.length && side >= 0) {
      node = node.childNodes[offset];
      offset = 0;
    } else {
      return null;
    }
  }
}
function nextToUneditable(node, offset) {
  if (node.nodeType != 1)
    return 0;
  return (offset && node.childNodes[offset - 1].contentEditable == "false" ? 1 : 0) | (offset < node.childNodes.length && node.childNodes[offset].contentEditable == "false" ? 2 : 0);
}
class DecorationComparator$1 {
  constructor() {
    this.changes = [];
  }
  compareRange(from, to) {
    addRange(from, to, this.changes);
  }
  comparePoint(from, to) {
    addRange(from, to, this.changes);
  }
}
function findChangedDeco(a, b, diff) {
  let comp = new DecorationComparator$1();
  RangeSet.compare(a, b, diff, comp);
  return comp.changes;
}
function inUneditable(node, inside2) {
  for (let cur2 = node; cur2 && cur2 != inside2; cur2 = cur2.assignedSlot || cur2.parentNode) {
    if (cur2.nodeType == 1 && cur2.contentEditable == "false") {
      return true;
    }
  }
  return false;
}
function groupAt(state, pos, bias = 1) {
  let categorize = state.charCategorizer(pos);
  let line = state.doc.lineAt(pos), linePos = pos - line.from;
  if (line.length == 0)
    return EditorSelection.cursor(pos);
  if (linePos == 0)
    bias = 1;
  else if (linePos == line.length)
    bias = -1;
  let from = linePos, to = linePos;
  if (bias < 0)
    from = findClusterBreak(line.text, linePos, false);
  else
    to = findClusterBreak(line.text, linePos);
  let cat = categorize(line.text.slice(from, to));
  while (from > 0) {
    let prev = findClusterBreak(line.text, from, false);
    if (categorize(line.text.slice(prev, from)) != cat)
      break;
    from = prev;
  }
  while (to < line.length) {
    let next = findClusterBreak(line.text, to);
    if (categorize(line.text.slice(to, next)) != cat)
      break;
    to = next;
  }
  return EditorSelection.range(from + line.from, to + line.from);
}
function getdx(x, rect) {
  return rect.left > x ? rect.left - x : Math.max(0, x - rect.right);
}
function getdy(y, rect) {
  return rect.top > y ? rect.top - y : Math.max(0, y - rect.bottom);
}
function yOverlap(a, b) {
  return a.top < b.bottom - 1 && a.bottom > b.top + 1;
}
function upTop(rect, top2) {
  return top2 < rect.top ? { top: top2, left: rect.left, right: rect.right, bottom: rect.bottom } : rect;
}
function upBot(rect, bottom) {
  return bottom > rect.bottom ? { top: rect.top, left: rect.left, right: rect.right, bottom } : rect;
}
function domPosAtCoords(parent, x, y) {
  let closest, closestRect, closestX, closestY, closestOverlap = false;
  let above, below, aboveRect, belowRect;
  for (let child = parent.firstChild; child; child = child.nextSibling) {
    let rects = clientRectsFor(child);
    for (let i = 0; i < rects.length; i++) {
      let rect = rects[i];
      if (closestRect && yOverlap(closestRect, rect))
        rect = upTop(upBot(rect, closestRect.bottom), closestRect.top);
      let dx = getdx(x, rect), dy = getdy(y, rect);
      if (dx == 0 && dy == 0)
        return child.nodeType == 3 ? domPosInText(child, x, y) : domPosAtCoords(child, x, y);
      if (!closest || closestY > dy || closestY == dy && closestX > dx) {
        closest = child;
        closestRect = rect;
        closestX = dx;
        closestY = dy;
        let side = dy ? y < rect.top ? -1 : 1 : dx ? x < rect.left ? -1 : 1 : 0;
        closestOverlap = !side || (side > 0 ? i < rects.length - 1 : i > 0);
      }
      if (dx == 0) {
        if (y > rect.bottom && (!aboveRect || aboveRect.bottom < rect.bottom)) {
          above = child;
          aboveRect = rect;
        } else if (y < rect.top && (!belowRect || belowRect.top > rect.top)) {
          below = child;
          belowRect = rect;
        }
      } else if (aboveRect && yOverlap(aboveRect, rect)) {
        aboveRect = upBot(aboveRect, rect.bottom);
      } else if (belowRect && yOverlap(belowRect, rect)) {
        belowRect = upTop(belowRect, rect.top);
      }
    }
  }
  if (aboveRect && aboveRect.bottom >= y) {
    closest = above;
    closestRect = aboveRect;
  } else if (belowRect && belowRect.top <= y) {
    closest = below;
    closestRect = belowRect;
  }
  if (!closest)
    return { node: parent, offset: 0 };
  let clipX = Math.max(closestRect.left, Math.min(closestRect.right, x));
  if (closest.nodeType == 3)
    return domPosInText(closest, clipX, y);
  if (closestOverlap && closest.contentEditable != "false")
    return domPosAtCoords(closest, clipX, y);
  let offset = Array.prototype.indexOf.call(parent.childNodes, closest) + (x >= (closestRect.left + closestRect.right) / 2 ? 1 : 0);
  return { node: parent, offset };
}
function domPosInText(node, x, y) {
  let len = node.nodeValue.length;
  let closestOffset = -1, closestDY = 1e9, generalSide = 0;
  for (let i = 0; i < len; i++) {
    let rects = textRange(node, i, i + 1).getClientRects();
    for (let j = 0; j < rects.length; j++) {
      let rect = rects[j];
      if (rect.top == rect.bottom)
        continue;
      if (!generalSide)
        generalSide = x - rect.left;
      let dy = (rect.top > y ? rect.top - y : y - rect.bottom) - 1;
      if (rect.left - 1 <= x && rect.right + 1 >= x && dy < closestDY) {
        let right = x >= (rect.left + rect.right) / 2, after = right;
        if (browser.chrome || browser.gecko) {
          let rectBefore = textRange(node, i).getBoundingClientRect();
          if (rectBefore.left == rect.right)
            after = !right;
        }
        if (dy <= 0)
          return { node, offset: i + (after ? 1 : 0) };
        closestOffset = i + (after ? 1 : 0);
        closestDY = dy;
      }
    }
  }
  return { node, offset: closestOffset > -1 ? closestOffset : generalSide > 0 ? node.nodeValue.length : 0 };
}
function posAtCoords(view, coords, precise, bias = -1) {
  var _a2;
  let content2 = view.contentDOM.getBoundingClientRect(), docTop = content2.top + view.viewState.paddingTop;
  let block, { docHeight } = view.viewState;
  let { x, y } = coords, yOffset = y - docTop;
  if (yOffset < 0)
    return 0;
  if (yOffset > docHeight)
    return view.state.doc.length;
  for (let halfLine = view.defaultLineHeight / 2, bounced = false; ; ) {
    block = view.elementAtHeight(yOffset);
    if (block.type == BlockType.Text)
      break;
    for (; ; ) {
      yOffset = bias > 0 ? block.bottom + halfLine : block.top - halfLine;
      if (yOffset >= 0 && yOffset <= docHeight)
        break;
      if (bounced)
        return precise ? null : 0;
      bounced = true;
      bias = -bias;
    }
  }
  y = docTop + yOffset;
  let lineStart = block.from;
  if (lineStart < view.viewport.from)
    return view.viewport.from == 0 ? 0 : precise ? null : posAtCoordsImprecise(view, content2, block, x, y);
  if (lineStart > view.viewport.to)
    return view.viewport.to == view.state.doc.length ? view.state.doc.length : precise ? null : posAtCoordsImprecise(view, content2, block, x, y);
  let doc2 = view.dom.ownerDocument;
  let root = view.root.elementFromPoint ? view.root : doc2;
  let element = root.elementFromPoint(x, y);
  if (element && !view.contentDOM.contains(element))
    element = null;
  if (!element) {
    x = Math.max(content2.left + 1, Math.min(content2.right - 1, x));
    element = root.elementFromPoint(x, y);
    if (element && !view.contentDOM.contains(element))
      element = null;
  }
  let node, offset = -1;
  if (element && ((_a2 = view.docView.nearest(element)) === null || _a2 === void 0 ? void 0 : _a2.isEditable) != false) {
    if (doc2.caretPositionFromPoint) {
      let pos = doc2.caretPositionFromPoint(x, y);
      if (pos)
        ({ offsetNode: node, offset } = pos);
    } else if (doc2.caretRangeFromPoint) {
      let range = doc2.caretRangeFromPoint(x, y);
      if (range) {
        ({ startContainer: node, startOffset: offset } = range);
        if (!view.contentDOM.contains(node) || browser.safari && isSuspiciousSafariCaretResult(node, offset, x) || browser.chrome && isSuspiciousChromeCaretResult(node, offset, x))
          node = void 0;
      }
    }
  }
  if (!node || !view.docView.dom.contains(node)) {
    let line = LineView.find(view.docView, lineStart);
    if (!line)
      return yOffset > block.top + block.height / 2 ? block.to : block.from;
    ({ node, offset } = domPosAtCoords(line.dom, x, y));
  }
  let nearest = view.docView.nearest(node);
  if (!nearest)
    return null;
  if (nearest.isWidget) {
    let rect = nearest.dom.getBoundingClientRect();
    return coords.y < rect.top || coords.y <= rect.bottom && coords.x <= (rect.left + rect.right) / 2 ? nearest.posAtStart : nearest.posAtEnd;
  } else {
    return nearest.localPosFromDOM(node, offset) + nearest.posAtStart;
  }
}
function posAtCoordsImprecise(view, contentRect, block, x, y) {
  let into = Math.round((x - contentRect.left) * view.defaultCharacterWidth);
  if (view.lineWrapping && block.height > view.defaultLineHeight * 1.5) {
    let line = Math.floor((y - block.top) / view.defaultLineHeight);
    into += line * view.viewState.heightOracle.lineLength;
  }
  let content2 = view.state.sliceDoc(block.from, block.to);
  return block.from + findColumn(content2, into, view.state.tabSize);
}
function isSuspiciousSafariCaretResult(node, offset, x) {
  let len;
  if (node.nodeType != 3 || offset != (len = node.nodeValue.length))
    return false;
  for (let next = node.nextSibling; next; next = next.nextSibling)
    if (next.nodeType != 1 || next.nodeName != "BR")
      return false;
  return textRange(node, len - 1, len).getBoundingClientRect().left > x;
}
function isSuspiciousChromeCaretResult(node, offset, x) {
  if (offset != 0)
    return false;
  for (let cur2 = node; ; ) {
    let parent = cur2.parentNode;
    if (!parent || parent.nodeType != 1 || parent.firstChild != cur2)
      return false;
    if (parent.classList.contains("cm-line"))
      break;
    cur2 = parent;
  }
  let rect = node.nodeType == 1 ? node.getBoundingClientRect() : textRange(node, 0, Math.max(node.nodeValue.length, 1)).getBoundingClientRect();
  return x - rect.left > 5;
}
function moveToLineBoundary(view, start, forward, includeWrap) {
  let line = view.state.doc.lineAt(start.head);
  let coords = !includeWrap || !view.lineWrapping ? null : view.coordsAtPos(start.assoc < 0 && start.head > line.from ? start.head - 1 : start.head);
  if (coords) {
    let editorRect = view.dom.getBoundingClientRect();
    let direction = view.textDirectionAt(line.from);
    let pos = view.posAtCoords({
      x: forward == (direction == Direction.LTR) ? editorRect.right - 1 : editorRect.left + 1,
      y: (coords.top + coords.bottom) / 2
    });
    if (pos != null)
      return EditorSelection.cursor(pos, forward ? -1 : 1);
  }
  let lineView = LineView.find(view.docView, start.head);
  let end = lineView ? forward ? lineView.posAtEnd : lineView.posAtStart : forward ? line.to : line.from;
  return EditorSelection.cursor(end, forward ? -1 : 1);
}
function moveByChar(view, start, forward, by) {
  let line = view.state.doc.lineAt(start.head), spans = view.bidiSpans(line);
  let direction = view.textDirectionAt(line.from);
  for (let cur2 = start, check = null; ; ) {
    let next = moveVisually(line, spans, direction, cur2, forward), char = movedOver;
    if (!next) {
      if (line.number == (forward ? view.state.doc.lines : 1))
        return cur2;
      char = "\n";
      line = view.state.doc.line(line.number + (forward ? 1 : -1));
      spans = view.bidiSpans(line);
      next = EditorSelection.cursor(forward ? line.from : line.to);
    }
    if (!check) {
      if (!by)
        return next;
      check = by(char);
    } else if (!check(char)) {
      return cur2;
    }
    cur2 = next;
  }
}
function byGroup(view, pos, start) {
  let categorize = view.state.charCategorizer(pos);
  let cat = categorize(start);
  return (next) => {
    let nextCat = categorize(next);
    if (cat == CharCategory.Space)
      cat = nextCat;
    return cat == nextCat;
  };
}
function moveVertically(view, start, forward, distance) {
  let startPos = start.head, dir = forward ? 1 : -1;
  if (startPos == (forward ? view.state.doc.length : 0))
    return EditorSelection.cursor(startPos, start.assoc);
  let goal = start.goalColumn, startY;
  let rect = view.contentDOM.getBoundingClientRect();
  let startCoords = view.coordsAtPos(startPos), docTop = view.documentTop;
  if (startCoords) {
    if (goal == null)
      goal = startCoords.left - rect.left;
    startY = dir < 0 ? startCoords.top : startCoords.bottom;
  } else {
    let line = view.viewState.lineBlockAt(startPos);
    if (goal == null)
      goal = Math.min(rect.right - rect.left, view.defaultCharacterWidth * (startPos - line.from));
    startY = (dir < 0 ? line.top : line.bottom) + docTop;
  }
  let resolvedGoal = rect.left + goal;
  let dist = distance !== null && distance !== void 0 ? distance : view.defaultLineHeight >> 1;
  for (let extra = 0; ; extra += 10) {
    let curY = startY + (dist + extra) * dir;
    let pos = posAtCoords(view, { x: resolvedGoal, y: curY }, false, dir);
    if (curY < rect.top || curY > rect.bottom || (dir < 0 ? pos < startPos : pos > startPos))
      return EditorSelection.cursor(pos, start.assoc, void 0, goal);
  }
}
function skipAtoms(view, oldPos, pos) {
  let atoms = view.state.facet(atomicRanges).map((f) => f(view));
  for (; ; ) {
    let moved = false;
    for (let set of atoms) {
      set.between(pos.from - 1, pos.from + 1, (from, to, value) => {
        if (pos.from > from && pos.from < to) {
          pos = oldPos.head > pos.from ? EditorSelection.cursor(from, 1) : EditorSelection.cursor(to, -1);
          moved = true;
        }
      });
    }
    if (!moved)
      return pos;
  }
}
class InputState {
  constructor(view) {
    this.lastKeyCode = 0;
    this.lastKeyTime = 0;
    this.lastTouchTime = 0;
    this.lastFocusTime = 0;
    this.lastScrollTop = 0;
    this.lastScrollLeft = 0;
    this.chromeScrollHack = -1;
    this.pendingIOSKey = void 0;
    this.lastSelectionOrigin = null;
    this.lastSelectionTime = 0;
    this.lastEscPress = 0;
    this.lastContextMenu = 0;
    this.scrollHandlers = [];
    this.registeredEvents = [];
    this.customHandlers = [];
    this.composing = -1;
    this.compositionFirstChange = null;
    this.compositionEndedAt = 0;
    this.mouseSelection = null;
    let handleEvent = (handler, event) => {
      if (this.ignoreDuringComposition(event))
        return;
      if (event.type == "keydown" && this.keydown(view, event))
        return;
      if (this.mustFlushObserver(event))
        view.observer.forceFlush();
      if (this.runCustomHandlers(event.type, view, event))
        event.preventDefault();
      else
        handler(view, event);
    };
    for (let type in handlers) {
      let handler = handlers[type];
      view.contentDOM.addEventListener(type, (event) => {
        if (eventBelongsToEditor(view, event))
          handleEvent(handler, event);
      }, handlerOptions[type]);
      this.registeredEvents.push(type);
    }
    view.scrollDOM.addEventListener("mousedown", (event) => {
      if (event.target == view.scrollDOM && event.clientY > view.contentDOM.getBoundingClientRect().bottom)
        handleEvent(handlers.mousedown, event);
    });
    if (browser.chrome && browser.chrome_version == 102) {
      view.scrollDOM.addEventListener("wheel", () => {
        if (this.chromeScrollHack < 0)
          view.contentDOM.style.pointerEvents = "none";
        else
          window.clearTimeout(this.chromeScrollHack);
        this.chromeScrollHack = setTimeout(() => {
          this.chromeScrollHack = -1;
          view.contentDOM.style.pointerEvents = "";
        }, 100);
      }, { passive: true });
    }
    this.notifiedFocused = view.hasFocus;
    if (browser.safari)
      view.contentDOM.addEventListener("input", () => null);
  }
  setSelectionOrigin(origin) {
    this.lastSelectionOrigin = origin;
    this.lastSelectionTime = Date.now();
  }
  ensureHandlers(view, plugins) {
    var _a2;
    let handlers2;
    this.customHandlers = [];
    for (let plugin of plugins)
      if (handlers2 = (_a2 = plugin.update(view).spec) === null || _a2 === void 0 ? void 0 : _a2.domEventHandlers) {
        this.customHandlers.push({ plugin: plugin.value, handlers: handlers2 });
        for (let type in handlers2)
          if (this.registeredEvents.indexOf(type) < 0 && type != "scroll") {
            this.registeredEvents.push(type);
            view.contentDOM.addEventListener(type, (event) => {
              if (!eventBelongsToEditor(view, event))
                return;
              if (this.runCustomHandlers(type, view, event))
                event.preventDefault();
            });
          }
      }
  }
  runCustomHandlers(type, view, event) {
    for (let set of this.customHandlers) {
      let handler = set.handlers[type];
      if (handler) {
        try {
          if (handler.call(set.plugin, event, view) || event.defaultPrevented)
            return true;
        } catch (e) {
          logException(view.state, e);
        }
      }
    }
    return false;
  }
  runScrollHandlers(view, event) {
    this.lastScrollTop = view.scrollDOM.scrollTop;
    this.lastScrollLeft = view.scrollDOM.scrollLeft;
    for (let set of this.customHandlers) {
      let handler = set.handlers.scroll;
      if (handler) {
        try {
          handler.call(set.plugin, event, view);
        } catch (e) {
          logException(view.state, e);
        }
      }
    }
  }
  keydown(view, event) {
    this.lastKeyCode = event.keyCode;
    this.lastKeyTime = Date.now();
    if (event.keyCode == 9 && Date.now() < this.lastEscPress + 2e3)
      return true;
    if (browser.android && browser.chrome && !event.synthetic && (event.keyCode == 13 || event.keyCode == 8)) {
      view.observer.delayAndroidKey(event.key, event.keyCode);
      return true;
    }
    let pending;
    if (browser.ios && !event.synthetic && !event.altKey && !event.metaKey && ((pending = PendingKeys.find((key) => key.keyCode == event.keyCode)) && !event.ctrlKey || EmacsyPendingKeys.indexOf(event.key) > -1 && event.ctrlKey && !event.shiftKey)) {
      this.pendingIOSKey = pending || event;
      setTimeout(() => this.flushIOSKey(view), 250);
      return true;
    }
    return false;
  }
  flushIOSKey(view) {
    let key = this.pendingIOSKey;
    if (!key)
      return false;
    this.pendingIOSKey = void 0;
    return dispatchKey(view.contentDOM, key.key, key.keyCode);
  }
  ignoreDuringComposition(event) {
    if (!/^key/.test(event.type))
      return false;
    if (this.composing > 0)
      return true;
    if (browser.safari && !browser.ios && Date.now() - this.compositionEndedAt < 100) {
      this.compositionEndedAt = 0;
      return true;
    }
    return false;
  }
  mustFlushObserver(event) {
    return event.type == "keydown" && event.keyCode != 229;
  }
  startMouseSelection(mouseSelection) {
    if (this.mouseSelection)
      this.mouseSelection.destroy();
    this.mouseSelection = mouseSelection;
  }
  update(update) {
    if (this.mouseSelection)
      this.mouseSelection.update(update);
    if (update.transactions.length)
      this.lastKeyCode = this.lastSelectionTime = 0;
  }
  destroy() {
    if (this.mouseSelection)
      this.mouseSelection.destroy();
  }
}
const PendingKeys = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
];
const EmacsyPendingKeys = "dthko";
const modifierCodes = [16, 17, 18, 20, 91, 92, 224, 225];
function dragScrollSpeed(dist) {
  return dist * 0.7 + 8;
}
class MouseSelection {
  constructor(view, startEvent, style, mustSelect) {
    this.view = view;
    this.style = style;
    this.mustSelect = mustSelect;
    this.scrollSpeed = { x: 0, y: 0 };
    this.scrolling = -1;
    this.lastEvent = startEvent;
    this.scrollParent = scrollableParent(view.contentDOM);
    let doc2 = view.contentDOM.ownerDocument;
    doc2.addEventListener("mousemove", this.move = this.move.bind(this));
    doc2.addEventListener("mouseup", this.up = this.up.bind(this));
    this.extend = startEvent.shiftKey;
    this.multiple = view.state.facet(EditorState.allowMultipleSelections) && addsSelectionRange(view, startEvent);
    this.dragMove = dragMovesSelection(view, startEvent);
    this.dragging = isInPrimarySelection(view, startEvent) && getClickType(startEvent) == 1 ? null : false;
  }
  start(event) {
    if (this.dragging === false) {
      event.preventDefault();
      this.select(event);
    }
  }
  move(event) {
    var _a2;
    if (event.buttons == 0)
      return this.destroy();
    if (this.dragging !== false)
      return;
    this.select(this.lastEvent = event);
    let sx = 0, sy = 0;
    let rect = ((_a2 = this.scrollParent) === null || _a2 === void 0 ? void 0 : _a2.getBoundingClientRect()) || { left: 0, top: 0, right: this.view.win.innerWidth, bottom: this.view.win.innerHeight };
    if (event.clientX <= rect.left)
      sx = -dragScrollSpeed(rect.left - event.clientX);
    else if (event.clientX >= rect.right)
      sx = dragScrollSpeed(event.clientX - rect.right);
    if (event.clientY <= rect.top)
      sy = -dragScrollSpeed(rect.top - event.clientY);
    else if (event.clientY >= rect.bottom)
      sy = dragScrollSpeed(event.clientY - rect.bottom);
    this.setScrollSpeed(sx, sy);
  }
  up(event) {
    if (this.dragging == null)
      this.select(this.lastEvent);
    if (!this.dragging)
      event.preventDefault();
    this.destroy();
  }
  destroy() {
    this.setScrollSpeed(0, 0);
    let doc2 = this.view.contentDOM.ownerDocument;
    doc2.removeEventListener("mousemove", this.move);
    doc2.removeEventListener("mouseup", this.up);
    this.view.inputState.mouseSelection = null;
  }
  setScrollSpeed(sx, sy) {
    this.scrollSpeed = { x: sx, y: sy };
    if (sx || sy) {
      if (this.scrolling < 0)
        this.scrolling = setInterval(() => this.scroll(), 50);
    } else if (this.scrolling > -1) {
      clearInterval(this.scrolling);
      this.scrolling = -1;
    }
  }
  scroll() {
    if (this.scrollParent) {
      this.scrollParent.scrollLeft += this.scrollSpeed.x;
      this.scrollParent.scrollTop += this.scrollSpeed.y;
    } else {
      this.view.win.scrollBy(this.scrollSpeed.x, this.scrollSpeed.y);
    }
    if (this.dragging === false)
      this.select(this.lastEvent);
  }
  select(event) {
    let selection = this.style.get(event, this.extend, this.multiple);
    if (this.mustSelect || !selection.eq(this.view.state.selection) || selection.main.assoc != this.view.state.selection.main.assoc)
      this.view.dispatch({
        selection,
        userEvent: "select.pointer"
      });
    this.mustSelect = false;
  }
  update(update) {
    if (update.docChanged && this.dragging)
      this.dragging = this.dragging.map(update.changes);
    if (this.style.update(update))
      setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function addsSelectionRange(view, event) {
  let facet = view.state.facet(clickAddsSelectionRange);
  return facet.length ? facet[0](event) : browser.mac ? event.metaKey : event.ctrlKey;
}
function dragMovesSelection(view, event) {
  let facet = view.state.facet(dragMovesSelection$1);
  return facet.length ? facet[0](event) : browser.mac ? !event.altKey : !event.ctrlKey;
}
function isInPrimarySelection(view, event) {
  let { main } = view.state.selection;
  if (main.empty)
    return false;
  let sel = getSelection(view.root);
  if (!sel || sel.rangeCount == 0)
    return true;
  let rects = sel.getRangeAt(0).getClientRects();
  for (let i = 0; i < rects.length; i++) {
    let rect = rects[i];
    if (rect.left <= event.clientX && rect.right >= event.clientX && rect.top <= event.clientY && rect.bottom >= event.clientY)
      return true;
  }
  return false;
}
function eventBelongsToEditor(view, event) {
  if (!event.bubbles)
    return true;
  if (event.defaultPrevented)
    return false;
  for (let node = event.target, cView; node != view.contentDOM; node = node.parentNode)
    if (!node || node.nodeType == 11 || (cView = ContentView.get(node)) && cView.ignoreEvent(event))
      return false;
  return true;
}
const handlers = /* @__PURE__ */ Object.create(null);
const handlerOptions = /* @__PURE__ */ Object.create(null);
const brokenClipboardAPI = browser.ie && browser.ie_version < 15 || browser.ios && browser.webkit_version < 604;
function capturePaste(view) {
  let parent = view.dom.parentNode;
  if (!parent)
    return;
  let target = parent.appendChild(document.createElement("textarea"));
  target.style.cssText = "position: fixed; left: -10000px; top: 10px";
  target.focus();
  setTimeout(() => {
    view.focus();
    target.remove();
    doPaste(view, target.value);
  }, 50);
}
function doPaste(view, input) {
  let { state } = view, changes, i = 1, text = state.toText(input);
  let byLine = text.lines == state.selection.ranges.length;
  let linewise = lastLinewiseCopy != null && state.selection.ranges.every((r) => r.empty) && lastLinewiseCopy == text.toString();
  if (linewise) {
    let lastLine = -1;
    changes = state.changeByRange((range) => {
      let line = state.doc.lineAt(range.from);
      if (line.from == lastLine)
        return { range };
      lastLine = line.from;
      let insert2 = state.toText((byLine ? text.line(i++).text : input) + state.lineBreak);
      return {
        changes: { from: line.from, insert: insert2 },
        range: EditorSelection.cursor(range.from + insert2.length)
      };
    });
  } else if (byLine) {
    changes = state.changeByRange((range) => {
      let line = text.line(i++);
      return {
        changes: { from: range.from, to: range.to, insert: line.text },
        range: EditorSelection.cursor(range.from + line.length)
      };
    });
  } else {
    changes = state.replaceSelection(text);
  }
  view.dispatch(changes, {
    userEvent: "input.paste",
    scrollIntoView: true
  });
}
handlers.keydown = (view, event) => {
  view.inputState.setSelectionOrigin("select");
  if (event.keyCode == 27)
    view.inputState.lastEscPress = Date.now();
  else if (modifierCodes.indexOf(event.keyCode) < 0)
    view.inputState.lastEscPress = 0;
};
handlers.touchstart = (view, e) => {
  view.inputState.lastTouchTime = Date.now();
  view.inputState.setSelectionOrigin("select.pointer");
};
handlers.touchmove = (view) => {
  view.inputState.setSelectionOrigin("select.pointer");
};
handlerOptions.touchstart = handlerOptions.touchmove = { passive: true };
handlers.mousedown = (view, event) => {
  view.observer.flush();
  if (view.inputState.lastTouchTime > Date.now() - 2e3)
    return;
  let style = null;
  for (let makeStyle of view.state.facet(mouseSelectionStyle)) {
    style = makeStyle(view, event);
    if (style)
      break;
  }
  if (!style && event.button == 0)
    style = basicMouseSelection(view, event);
  if (style) {
    let mustFocus = view.root.activeElement != view.contentDOM;
    view.inputState.startMouseSelection(new MouseSelection(view, event, style, mustFocus));
    if (mustFocus)
      view.observer.ignore(() => focusPreventScroll(view.contentDOM));
    if (view.inputState.mouseSelection)
      view.inputState.mouseSelection.start(event);
  }
};
function rangeForClick(view, pos, bias, type) {
  if (type == 1) {
    return EditorSelection.cursor(pos, bias);
  } else if (type == 2) {
    return groupAt(view.state, pos, bias);
  } else {
    let visual = LineView.find(view.docView, pos), line = view.state.doc.lineAt(visual ? visual.posAtEnd : pos);
    let from = visual ? visual.posAtStart : line.from, to = visual ? visual.posAtEnd : line.to;
    if (to < view.state.doc.length && to == line.to)
      to++;
    return EditorSelection.range(from, to);
  }
}
let insideY = (y, rect) => y >= rect.top && y <= rect.bottom;
let inside = (x, y, rect) => insideY(y, rect) && x >= rect.left && x <= rect.right;
function findPositionSide(view, pos, x, y) {
  let line = LineView.find(view.docView, pos);
  if (!line)
    return 1;
  let off = pos - line.posAtStart;
  if (off == 0)
    return 1;
  if (off == line.length)
    return -1;
  let before = line.coordsAt(off, -1);
  if (before && inside(x, y, before))
    return -1;
  let after = line.coordsAt(off, 1);
  if (after && inside(x, y, after))
    return 1;
  return before && insideY(y, before) ? -1 : 1;
}
function queryPos(view, event) {
  let pos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
  return { pos, bias: findPositionSide(view, pos, event.clientX, event.clientY) };
}
const BadMouseDetail = browser.ie && browser.ie_version <= 11;
let lastMouseDown = null, lastMouseDownCount = 0, lastMouseDownTime = 0;
function getClickType(event) {
  if (!BadMouseDetail)
    return event.detail;
  let last = lastMouseDown, lastTime = lastMouseDownTime;
  lastMouseDown = event;
  lastMouseDownTime = Date.now();
  return lastMouseDownCount = !last || lastTime > Date.now() - 400 && Math.abs(last.clientX - event.clientX) < 2 && Math.abs(last.clientY - event.clientY) < 2 ? (lastMouseDownCount + 1) % 3 : 1;
}
function basicMouseSelection(view, event) {
  let start = queryPos(view, event), type = getClickType(event);
  let startSel = view.state.selection;
  return {
    update(update) {
      if (update.docChanged) {
        start.pos = update.changes.mapPos(start.pos);
        startSel = startSel.map(update.changes);
      }
    },
    get(event2, extend2, multiple) {
      let cur2 = queryPos(view, event2);
      let range = rangeForClick(view, cur2.pos, cur2.bias, type);
      if (start.pos != cur2.pos && !extend2) {
        let startRange = rangeForClick(view, start.pos, start.bias, type);
        let from = Math.min(startRange.from, range.from), to = Math.max(startRange.to, range.to);
        range = from < range.from ? EditorSelection.range(from, to) : EditorSelection.range(to, from);
      }
      if (extend2)
        return startSel.replaceRange(startSel.main.extend(range.from, range.to));
      else if (multiple && startSel.ranges.length > 1 && startSel.ranges.some((r) => r.eq(range)))
        return removeRange(startSel, range);
      else if (multiple)
        return startSel.addRange(range);
      else
        return EditorSelection.create([range]);
    }
  };
}
function removeRange(sel, range) {
  for (let i = 0; ; i++) {
    if (sel.ranges[i].eq(range))
      return EditorSelection.create(sel.ranges.slice(0, i).concat(sel.ranges.slice(i + 1)), sel.mainIndex == i ? 0 : sel.mainIndex - (sel.mainIndex > i ? 1 : 0));
  }
}
handlers.dragstart = (view, event) => {
  let { selection: { main } } = view.state;
  let { mouseSelection } = view.inputState;
  if (mouseSelection)
    mouseSelection.dragging = main;
  if (event.dataTransfer) {
    event.dataTransfer.setData("Text", view.state.sliceDoc(main.from, main.to));
    event.dataTransfer.effectAllowed = "copyMove";
  }
};
function dropText(view, event, text, direct) {
  if (!text)
    return;
  let dropPos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
  event.preventDefault();
  let { mouseSelection } = view.inputState;
  let del = direct && mouseSelection && mouseSelection.dragging && mouseSelection.dragMove ? { from: mouseSelection.dragging.from, to: mouseSelection.dragging.to } : null;
  let ins = { from: dropPos, insert: text };
  let changes = view.state.changes(del ? [del, ins] : ins);
  view.focus();
  view.dispatch({
    changes,
    selection: { anchor: changes.mapPos(dropPos, -1), head: changes.mapPos(dropPos, 1) },
    userEvent: del ? "move.drop" : "input.drop"
  });
}
handlers.drop = (view, event) => {
  if (!event.dataTransfer)
    return;
  if (view.state.readOnly)
    return event.preventDefault();
  let files = event.dataTransfer.files;
  if (files && files.length) {
    event.preventDefault();
    let text = Array(files.length), read = 0;
    let finishFile = () => {
      if (++read == files.length)
        dropText(view, event, text.filter((s) => s != null).join(view.state.lineBreak), false);
    };
    for (let i = 0; i < files.length; i++) {
      let reader = new FileReader();
      reader.onerror = finishFile;
      reader.onload = () => {
        if (!/[\x00-\x08\x0e-\x1f]{2}/.test(reader.result))
          text[i] = reader.result;
        finishFile();
      };
      reader.readAsText(files[i]);
    }
  } else {
    dropText(view, event, event.dataTransfer.getData("Text"), true);
  }
};
handlers.paste = (view, event) => {
  if (view.state.readOnly)
    return event.preventDefault();
  view.observer.flush();
  let data = brokenClipboardAPI ? null : event.clipboardData;
  if (data) {
    doPaste(view, data.getData("text/plain"));
    event.preventDefault();
  } else {
    capturePaste(view);
  }
};
function captureCopy(view, text) {
  let parent = view.dom.parentNode;
  if (!parent)
    return;
  let target = parent.appendChild(document.createElement("textarea"));
  target.style.cssText = "position: fixed; left: -10000px; top: 10px";
  target.value = text;
  target.focus();
  target.selectionEnd = text.length;
  target.selectionStart = 0;
  setTimeout(() => {
    target.remove();
    view.focus();
  }, 50);
}
function copiedRange(state) {
  let content2 = [], ranges = [], linewise = false;
  for (let range of state.selection.ranges)
    if (!range.empty) {
      content2.push(state.sliceDoc(range.from, range.to));
      ranges.push(range);
    }
  if (!content2.length) {
    let upto = -1;
    for (let { from } of state.selection.ranges) {
      let line = state.doc.lineAt(from);
      if (line.number > upto) {
        content2.push(line.text);
        ranges.push({ from: line.from, to: Math.min(state.doc.length, line.to + 1) });
      }
      upto = line.number;
    }
    linewise = true;
  }
  return { text: content2.join(state.lineBreak), ranges, linewise };
}
let lastLinewiseCopy = null;
handlers.copy = handlers.cut = (view, event) => {
  let { text, ranges, linewise } = copiedRange(view.state);
  if (!text && !linewise)
    return;
  lastLinewiseCopy = linewise ? text : null;
  let data = brokenClipboardAPI ? null : event.clipboardData;
  if (data) {
    event.preventDefault();
    data.clearData();
    data.setData("text/plain", text);
  } else {
    captureCopy(view, text);
  }
  if (event.type == "cut" && !view.state.readOnly)
    view.dispatch({
      changes: ranges,
      scrollIntoView: true,
      userEvent: "delete.cut"
    });
};
const isFocusChange = /* @__PURE__ */ Annotation.define();
function focusChangeTransaction(state, focus) {
  let effects = [];
  for (let getEffect of state.facet(focusChangeEffect)) {
    let effect = getEffect(state, focus);
    if (effect)
      effects.push(effect);
  }
  return effects ? state.update({ effects, annotations: isFocusChange.of(true) }) : null;
}
function updateForFocusChange(view) {
  setTimeout(() => {
    let focus = view.hasFocus;
    if (focus != view.inputState.notifiedFocused) {
      let tr = focusChangeTransaction(view.state, focus);
      if (tr)
        view.dispatch(tr);
      else
        view.update([]);
    }
  }, 10);
}
handlers.focus = (view) => {
  view.inputState.lastFocusTime = Date.now();
  if (!view.scrollDOM.scrollTop && (view.inputState.lastScrollTop || view.inputState.lastScrollLeft)) {
    view.scrollDOM.scrollTop = view.inputState.lastScrollTop;
    view.scrollDOM.scrollLeft = view.inputState.lastScrollLeft;
  }
  updateForFocusChange(view);
};
handlers.blur = (view) => {
  view.observer.clearSelectionRange();
  updateForFocusChange(view);
};
handlers.compositionstart = handlers.compositionupdate = (view) => {
  if (view.inputState.compositionFirstChange == null)
    view.inputState.compositionFirstChange = true;
  if (view.inputState.composing < 0) {
    view.inputState.composing = 0;
  }
};
handlers.compositionend = (view) => {
  view.inputState.composing = -1;
  view.inputState.compositionEndedAt = Date.now();
  view.inputState.compositionFirstChange = null;
  if (browser.chrome && browser.android)
    view.observer.flushSoon();
  setTimeout(() => {
    if (view.inputState.composing < 0 && view.docView.compositionDeco.size)
      view.update([]);
  }, 50);
};
handlers.contextmenu = (view) => {
  view.inputState.lastContextMenu = Date.now();
};
handlers.beforeinput = (view, event) => {
  var _a2;
  let pending;
  if (browser.chrome && browser.android && (pending = PendingKeys.find((key) => key.inputType == event.inputType))) {
    view.observer.delayAndroidKey(pending.key, pending.keyCode);
    if (pending.key == "Backspace" || pending.key == "Delete") {
      let startViewHeight = ((_a2 = window.visualViewport) === null || _a2 === void 0 ? void 0 : _a2.height) || 0;
      setTimeout(() => {
        var _a3;
        if ((((_a3 = window.visualViewport) === null || _a3 === void 0 ? void 0 : _a3.height) || 0) > startViewHeight + 10 && view.hasFocus) {
          view.contentDOM.blur();
          view.focus();
        }
      }, 100);
    }
  }
};
const wrappingWhiteSpace = ["pre-wrap", "normal", "pre-line", "break-spaces"];
class HeightOracle {
  constructor(lineWrapping) {
    this.lineWrapping = lineWrapping;
    this.doc = Text.empty;
    this.heightSamples = {};
    this.lineHeight = 14;
    this.charWidth = 7;
    this.lineLength = 30;
    this.heightChanged = false;
  }
  heightForGap(from, to) {
    let lines = this.doc.lineAt(to).number - this.doc.lineAt(from).number + 1;
    if (this.lineWrapping)
      lines += Math.max(0, Math.ceil((to - from - lines * this.lineLength * 0.5) / this.lineLength));
    return this.lineHeight * lines;
  }
  heightForLine(length) {
    if (!this.lineWrapping)
      return this.lineHeight;
    let lines = 1 + Math.max(0, Math.ceil((length - this.lineLength) / (this.lineLength - 5)));
    return lines * this.lineHeight;
  }
  setDoc(doc2) {
    this.doc = doc2;
    return this;
  }
  mustRefreshForWrapping(whiteSpace) {
    return wrappingWhiteSpace.indexOf(whiteSpace) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(lineHeights) {
    let newHeight = false;
    for (let i = 0; i < lineHeights.length; i++) {
      let h = lineHeights[i];
      if (h < 0) {
        i++;
      } else if (!this.heightSamples[Math.floor(h * 10)]) {
        newHeight = true;
        this.heightSamples[Math.floor(h * 10)] = true;
      }
    }
    return newHeight;
  }
  refresh(whiteSpace, lineHeight, charWidth, lineLength, knownHeights) {
    let lineWrapping = wrappingWhiteSpace.indexOf(whiteSpace) > -1;
    let changed = Math.round(lineHeight) != Math.round(this.lineHeight) || this.lineWrapping != lineWrapping;
    this.lineWrapping = lineWrapping;
    this.lineHeight = lineHeight;
    this.charWidth = charWidth;
    this.lineLength = lineLength;
    if (changed) {
      this.heightSamples = {};
      for (let i = 0; i < knownHeights.length; i++) {
        let h = knownHeights[i];
        if (h < 0)
          i++;
        else
          this.heightSamples[Math.floor(h * 10)] = true;
      }
    }
    return changed;
  }
}
class MeasuredHeights {
  constructor(from, heights) {
    this.from = from;
    this.heights = heights;
    this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class BlockInfo {
  /**
  @internal
  */
  constructor(from, length, top2, height, type) {
    this.from = from;
    this.length = length;
    this.top = top2;
    this.height = height;
    this.type = type;
  }
  /**
  The end of the element as a document position.
  */
  get to() {
    return this.from + this.length;
  }
  /**
  The bottom position of the element.
  */
  get bottom() {
    return this.top + this.height;
  }
  /**
  @internal
  */
  join(other) {
    let detail = (Array.isArray(this.type) ? this.type : [this]).concat(Array.isArray(other.type) ? other.type : [other]);
    return new BlockInfo(this.from, this.length + other.length, this.top, this.height + other.height, detail);
  }
}
var QueryType$1 = /* @__PURE__ */ function(QueryType2) {
  QueryType2[QueryType2["ByPos"] = 0] = "ByPos";
  QueryType2[QueryType2["ByHeight"] = 1] = "ByHeight";
  QueryType2[QueryType2["ByPosNoHeight"] = 2] = "ByPosNoHeight";
  return QueryType2;
}(QueryType$1 || (QueryType$1 = {}));
const Epsilon = 1e-3;
class HeightMap {
  constructor(length, height, flags = 2) {
    this.length = length;
    this.height = height;
    this.flags = flags;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(value) {
    this.flags = (value ? 2 : 0) | this.flags & ~2;
  }
  setHeight(oracle, height) {
    if (this.height != height) {
      if (Math.abs(this.height - height) > Epsilon)
        oracle.heightChanged = true;
      this.height = height;
    }
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(_from, _to, nodes) {
    return HeightMap.of(nodes);
  }
  // Again, these are base cases, and are overridden for branch and gap nodes.
  decomposeLeft(_to, result) {
    result.push(this);
  }
  decomposeRight(_from, result) {
    result.push(this);
  }
  applyChanges(decorations2, oldDoc, oracle, changes) {
    let me = this, doc2 = oracle.doc;
    for (let i = changes.length - 1; i >= 0; i--) {
      let { fromA, toA, fromB, toB } = changes[i];
      let start = me.lineAt(fromA, QueryType$1.ByPosNoHeight, oracle.setDoc(oldDoc), 0, 0);
      let end = start.to >= toA ? start : me.lineAt(toA, QueryType$1.ByPosNoHeight, oracle, 0, 0);
      toB += end.to - toA;
      toA = end.to;
      while (i > 0 && start.from <= changes[i - 1].toA) {
        fromA = changes[i - 1].fromA;
        fromB = changes[i - 1].fromB;
        i--;
        if (fromA < start.from)
          start = me.lineAt(fromA, QueryType$1.ByPosNoHeight, oracle, 0, 0);
      }
      fromB += start.from - fromA;
      fromA = start.from;
      let nodes = NodeBuilder.build(oracle.setDoc(doc2), decorations2, fromB, toB);
      me = me.replace(fromA, toA, nodes);
    }
    return me.updateHeight(oracle, 0);
  }
  static empty() {
    return new HeightMapText(0, 0);
  }
  // nodes uses null values to indicate the position of line breaks.
  // There are never line breaks at the start or end of the array, or
  // two line breaks next to each other, and the array isn't allowed
  // to be empty (same restrictions as return value from the builder).
  static of(nodes) {
    if (nodes.length == 1)
      return nodes[0];
    let i = 0, j = nodes.length, before = 0, after = 0;
    for (; ; ) {
      if (i == j) {
        if (before > after * 2) {
          let split = nodes[i - 1];
          if (split.break)
            nodes.splice(--i, 1, split.left, null, split.right);
          else
            nodes.splice(--i, 1, split.left, split.right);
          j += 1 + split.break;
          before -= split.size;
        } else if (after > before * 2) {
          let split = nodes[j];
          if (split.break)
            nodes.splice(j, 1, split.left, null, split.right);
          else
            nodes.splice(j, 1, split.left, split.right);
          j += 2 + split.break;
          after -= split.size;
        } else {
          break;
        }
      } else if (before < after) {
        let next = nodes[i++];
        if (next)
          before += next.size;
      } else {
        let next = nodes[--j];
        if (next)
          after += next.size;
      }
    }
    let brk = 0;
    if (nodes[i - 1] == null) {
      brk = 1;
      i--;
    } else if (nodes[i] == null) {
      brk = 1;
      j++;
    }
    return new HeightMapBranch(HeightMap.of(nodes.slice(0, i)), brk, HeightMap.of(nodes.slice(j)));
  }
}
HeightMap.prototype.size = 1;
class HeightMapBlock extends HeightMap {
  constructor(length, height, type) {
    super(length, height);
    this.type = type;
  }
  blockAt(_height, _oracle, top2, offset) {
    return new BlockInfo(offset, this.length, top2, this.height, this.type);
  }
  lineAt(_value, _type, oracle, top2, offset) {
    return this.blockAt(0, oracle, top2, offset);
  }
  forEachLine(from, to, oracle, top2, offset, f) {
    if (from <= offset + this.length && to >= offset)
      f(this.blockAt(0, oracle, top2, offset));
  }
  updateHeight(oracle, offset = 0, _force = false, measured) {
    if (measured && measured.from <= offset && measured.more)
      this.setHeight(oracle, measured.heights[measured.index++]);
    this.outdated = false;
    return this;
  }
  toString() {
    return `block(${this.length})`;
  }
}
class HeightMapText extends HeightMapBlock {
  constructor(length, height) {
    super(length, height, BlockType.Text);
    this.collapsed = 0;
    this.widgetHeight = 0;
  }
  replace(_from, _to, nodes) {
    let node = nodes[0];
    if (nodes.length == 1 && (node instanceof HeightMapText || node instanceof HeightMapGap && node.flags & 4) && Math.abs(this.length - node.length) < 10) {
      if (node instanceof HeightMapGap)
        node = new HeightMapText(node.length, this.height);
      else
        node.height = this.height;
      if (!this.outdated)
        node.outdated = false;
      return node;
    } else {
      return HeightMap.of(nodes);
    }
  }
  updateHeight(oracle, offset = 0, force = false, measured) {
    if (measured && measured.from <= offset && measured.more)
      this.setHeight(oracle, measured.heights[measured.index++]);
    else if (force || this.outdated)
      this.setHeight(oracle, Math.max(this.widgetHeight, oracle.heightForLine(this.length - this.collapsed)));
    this.outdated = false;
    return this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class HeightMapGap extends HeightMap {
  constructor(length) {
    super(length, 0);
  }
  heightMetrics(oracle, offset) {
    let firstLine = oracle.doc.lineAt(offset).number, lastLine = oracle.doc.lineAt(offset + this.length).number;
    let lines = lastLine - firstLine + 1;
    let perLine, perChar = 0;
    if (oracle.lineWrapping) {
      let totalPerLine = Math.min(this.height, oracle.lineHeight * lines);
      perLine = totalPerLine / lines;
      perChar = (this.height - totalPerLine) / (this.length - lines - 1);
    } else {
      perLine = this.height / lines;
    }
    return { firstLine, lastLine, perLine, perChar };
  }
  blockAt(height, oracle, top2, offset) {
    let { firstLine, lastLine, perLine, perChar } = this.heightMetrics(oracle, offset);
    if (oracle.lineWrapping) {
      let guess = offset + Math.round(Math.max(0, Math.min(1, (height - top2) / this.height)) * this.length);
      let line = oracle.doc.lineAt(guess), lineHeight = perLine + line.length * perChar;
      let lineTop = Math.max(top2, height - lineHeight / 2);
      return new BlockInfo(line.from, line.length, lineTop, lineHeight, BlockType.Text);
    } else {
      let line = Math.max(0, Math.min(lastLine - firstLine, Math.floor((height - top2) / perLine)));
      let { from, length } = oracle.doc.line(firstLine + line);
      return new BlockInfo(from, length, top2 + perLine * line, perLine, BlockType.Text);
    }
  }
  lineAt(value, type, oracle, top2, offset) {
    if (type == QueryType$1.ByHeight)
      return this.blockAt(value, oracle, top2, offset);
    if (type == QueryType$1.ByPosNoHeight) {
      let { from, to } = oracle.doc.lineAt(value);
      return new BlockInfo(from, to - from, 0, 0, BlockType.Text);
    }
    let { firstLine, perLine, perChar } = this.heightMetrics(oracle, offset);
    let line = oracle.doc.lineAt(value), lineHeight = perLine + line.length * perChar;
    let linesAbove = line.number - firstLine;
    let lineTop = top2 + perLine * linesAbove + perChar * (line.from - offset - linesAbove);
    return new BlockInfo(line.from, line.length, Math.max(top2, Math.min(lineTop, top2 + this.height - lineHeight)), lineHeight, BlockType.Text);
  }
  forEachLine(from, to, oracle, top2, offset, f) {
    from = Math.max(from, offset);
    to = Math.min(to, offset + this.length);
    let { firstLine, perLine, perChar } = this.heightMetrics(oracle, offset);
    for (let pos = from, lineTop = top2; pos <= to; ) {
      let line = oracle.doc.lineAt(pos);
      if (pos == from) {
        let linesAbove = line.number - firstLine;
        lineTop += perLine * linesAbove + perChar * (from - offset - linesAbove);
      }
      let lineHeight = perLine + perChar * line.length;
      f(new BlockInfo(line.from, line.length, lineTop, lineHeight, BlockType.Text));
      lineTop += lineHeight;
      pos = line.to + 1;
    }
  }
  replace(from, to, nodes) {
    let after = this.length - to;
    if (after > 0) {
      let last = nodes[nodes.length - 1];
      if (last instanceof HeightMapGap)
        nodes[nodes.length - 1] = new HeightMapGap(last.length + after);
      else
        nodes.push(null, new HeightMapGap(after - 1));
    }
    if (from > 0) {
      let first = nodes[0];
      if (first instanceof HeightMapGap)
        nodes[0] = new HeightMapGap(from + first.length);
      else
        nodes.unshift(new HeightMapGap(from - 1), null);
    }
    return HeightMap.of(nodes);
  }
  decomposeLeft(to, result) {
    result.push(new HeightMapGap(to - 1), null);
  }
  decomposeRight(from, result) {
    result.push(null, new HeightMapGap(this.length - from - 1));
  }
  updateHeight(oracle, offset = 0, force = false, measured) {
    let end = offset + this.length;
    if (measured && measured.from <= offset + this.length && measured.more) {
      let nodes = [], pos = Math.max(offset, measured.from), singleHeight = -1;
      if (measured.from > offset)
        nodes.push(new HeightMapGap(measured.from - offset - 1).updateHeight(oracle, offset));
      while (pos <= end && measured.more) {
        let len = oracle.doc.lineAt(pos).length;
        if (nodes.length)
          nodes.push(null);
        let height = measured.heights[measured.index++];
        if (singleHeight == -1)
          singleHeight = height;
        else if (Math.abs(height - singleHeight) >= Epsilon)
          singleHeight = -2;
        let line = new HeightMapText(len, height);
        line.outdated = false;
        nodes.push(line);
        pos += len + 1;
      }
      if (pos <= end)
        nodes.push(null, new HeightMapGap(end - pos).updateHeight(oracle, pos));
      let result = HeightMap.of(nodes);
      if (singleHeight < 0 || Math.abs(result.height - this.height) >= Epsilon || Math.abs(singleHeight - this.heightMetrics(oracle, offset).perLine) >= Epsilon)
        oracle.heightChanged = true;
      return result;
    } else if (force || this.outdated) {
      this.setHeight(oracle, oracle.heightForGap(offset, offset + this.length));
      this.outdated = false;
    }
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class HeightMapBranch extends HeightMap {
  constructor(left, brk, right) {
    super(left.length + brk + right.length, left.height + right.height, brk | (left.outdated || right.outdated ? 2 : 0));
    this.left = left;
    this.right = right;
    this.size = left.size + right.size;
  }
  get break() {
    return this.flags & 1;
  }
  blockAt(height, oracle, top2, offset) {
    let mid = top2 + this.left.height;
    return height < mid ? this.left.blockAt(height, oracle, top2, offset) : this.right.blockAt(height, oracle, mid, offset + this.left.length + this.break);
  }
  lineAt(value, type, oracle, top2, offset) {
    let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
    let left = type == QueryType$1.ByHeight ? value < rightTop : value < rightOffset;
    let base2 = left ? this.left.lineAt(value, type, oracle, top2, offset) : this.right.lineAt(value, type, oracle, rightTop, rightOffset);
    if (this.break || (left ? base2.to < rightOffset : base2.from > rightOffset))
      return base2;
    let subQuery = type == QueryType$1.ByPosNoHeight ? QueryType$1.ByPosNoHeight : QueryType$1.ByPos;
    if (left)
      return base2.join(this.right.lineAt(rightOffset, subQuery, oracle, rightTop, rightOffset));
    else
      return this.left.lineAt(rightOffset, subQuery, oracle, top2, offset).join(base2);
  }
  forEachLine(from, to, oracle, top2, offset, f) {
    let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
    if (this.break) {
      if (from < rightOffset)
        this.left.forEachLine(from, to, oracle, top2, offset, f);
      if (to >= rightOffset)
        this.right.forEachLine(from, to, oracle, rightTop, rightOffset, f);
    } else {
      let mid = this.lineAt(rightOffset, QueryType$1.ByPos, oracle, top2, offset);
      if (from < mid.from)
        this.left.forEachLine(from, mid.from - 1, oracle, top2, offset, f);
      if (mid.to >= from && mid.from <= to)
        f(mid);
      if (to > mid.to)
        this.right.forEachLine(mid.to + 1, to, oracle, rightTop, rightOffset, f);
    }
  }
  replace(from, to, nodes) {
    let rightStart = this.left.length + this.break;
    if (to < rightStart)
      return this.balanced(this.left.replace(from, to, nodes), this.right);
    if (from > this.left.length)
      return this.balanced(this.left, this.right.replace(from - rightStart, to - rightStart, nodes));
    let result = [];
    if (from > 0)
      this.decomposeLeft(from, result);
    let left = result.length;
    for (let node of nodes)
      result.push(node);
    if (from > 0)
      mergeGaps(result, left - 1);
    if (to < this.length) {
      let right = result.length;
      this.decomposeRight(to, result);
      mergeGaps(result, right);
    }
    return HeightMap.of(result);
  }
  decomposeLeft(to, result) {
    let left = this.left.length;
    if (to <= left)
      return this.left.decomposeLeft(to, result);
    result.push(this.left);
    if (this.break) {
      left++;
      if (to >= left)
        result.push(null);
    }
    if (to > left)
      this.right.decomposeLeft(to - left, result);
  }
  decomposeRight(from, result) {
    let left = this.left.length, right = left + this.break;
    if (from >= right)
      return this.right.decomposeRight(from - right, result);
    if (from < left)
      this.left.decomposeRight(from, result);
    if (this.break && from < right)
      result.push(null);
    result.push(this.right);
  }
  balanced(left, right) {
    if (left.size > 2 * right.size || right.size > 2 * left.size)
      return HeightMap.of(this.break ? [left, null, right] : [left, right]);
    this.left = left;
    this.right = right;
    this.height = left.height + right.height;
    this.outdated = left.outdated || right.outdated;
    this.size = left.size + right.size;
    this.length = left.length + this.break + right.length;
    return this;
  }
  updateHeight(oracle, offset = 0, force = false, measured) {
    let { left, right } = this, rightStart = offset + left.length + this.break, rebalance = null;
    if (measured && measured.from <= offset + left.length && measured.more)
      rebalance = left = left.updateHeight(oracle, offset, force, measured);
    else
      left.updateHeight(oracle, offset, force);
    if (measured && measured.from <= rightStart + right.length && measured.more)
      rebalance = right = right.updateHeight(oracle, rightStart, force, measured);
    else
      right.updateHeight(oracle, rightStart, force);
    if (rebalance)
      return this.balanced(left, right);
    this.height = this.left.height + this.right.height;
    this.outdated = false;
    return this;
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function mergeGaps(nodes, around) {
  let before, after;
  if (nodes[around] == null && (before = nodes[around - 1]) instanceof HeightMapGap && (after = nodes[around + 1]) instanceof HeightMapGap)
    nodes.splice(around - 1, 3, new HeightMapGap(before.length + 1 + after.length));
}
const relevantWidgetHeight = 5;
class NodeBuilder {
  constructor(pos, oracle) {
    this.pos = pos;
    this.oracle = oracle;
    this.nodes = [];
    this.lineStart = -1;
    this.lineEnd = -1;
    this.covering = null;
    this.writtenTo = pos;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(_from, to) {
    if (this.lineStart > -1) {
      let end = Math.min(to, this.lineEnd), last = this.nodes[this.nodes.length - 1];
      if (last instanceof HeightMapText)
        last.length += end - this.pos;
      else if (end > this.pos || !this.isCovered)
        this.nodes.push(new HeightMapText(end - this.pos, -1));
      this.writtenTo = end;
      if (to > end) {
        this.nodes.push(null);
        this.writtenTo++;
        this.lineStart = -1;
      }
    }
    this.pos = to;
  }
  point(from, to, deco) {
    if (from < to || deco.heightRelevant) {
      let height = deco.widget ? deco.widget.estimatedHeight : 0;
      if (height < 0)
        height = this.oracle.lineHeight;
      let len = to - from;
      if (deco.block) {
        this.addBlock(new HeightMapBlock(len, height, deco.type));
      } else if (len || height >= relevantWidgetHeight) {
        this.addLineDeco(height, len);
      }
    } else if (to > from) {
      this.span(from, to);
    }
    if (this.lineEnd > -1 && this.lineEnd < this.pos)
      this.lineEnd = this.oracle.doc.lineAt(this.pos).to;
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from, to } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = from;
    this.lineEnd = to;
    if (this.writtenTo < from) {
      if (this.writtenTo < from - 1 || this.nodes[this.nodes.length - 1] == null)
        this.nodes.push(this.blankContent(this.writtenTo, from - 1));
      this.nodes.push(null);
    }
    if (this.pos > from)
      this.nodes.push(new HeightMapText(this.pos - from, -1));
    this.writtenTo = this.pos;
  }
  blankContent(from, to) {
    let gap = new HeightMapGap(to - from);
    if (this.oracle.doc.lineAt(from).to == to)
      gap.flags |= 4;
    return gap;
  }
  ensureLine() {
    this.enterLine();
    let last = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (last instanceof HeightMapText)
      return last;
    let line = new HeightMapText(0, -1);
    this.nodes.push(line);
    return line;
  }
  addBlock(block) {
    this.enterLine();
    if (block.type == BlockType.WidgetAfter && !this.isCovered)
      this.ensureLine();
    this.nodes.push(block);
    this.writtenTo = this.pos = this.pos + block.length;
    if (block.type != BlockType.WidgetBefore)
      this.covering = block;
  }
  addLineDeco(height, length) {
    let line = this.ensureLine();
    line.length += length;
    line.collapsed += length;
    line.widgetHeight = Math.max(line.widgetHeight, height);
    this.writtenTo = this.pos = this.pos + length;
  }
  finish(from) {
    let last = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    if (this.lineStart > -1 && !(last instanceof HeightMapText) && !this.isCovered)
      this.nodes.push(new HeightMapText(0, -1));
    else if (this.writtenTo < this.pos || last == null)
      this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let pos = from;
    for (let node of this.nodes) {
      if (node instanceof HeightMapText)
        node.updateHeight(this.oracle, pos);
      pos += node ? node.length : 1;
    }
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(oracle, decorations2, from, to) {
    let builder = new NodeBuilder(from, oracle);
    RangeSet.spans(decorations2, from, to, builder, 0);
    return builder.finish(from);
  }
}
function heightRelevantDecoChanges(a, b, diff) {
  let comp = new DecorationComparator();
  RangeSet.compare(a, b, diff, comp, 0);
  return comp.changes;
}
class DecorationComparator {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(from, to, a, b) {
    if (from < to || a && a.heightRelevant || b && b.heightRelevant)
      addRange(from, to, this.changes, 5);
  }
}
function visiblePixelRange(dom, paddingTop) {
  let rect = dom.getBoundingClientRect();
  let doc2 = dom.ownerDocument, win = doc2.defaultView || window;
  let left = Math.max(0, rect.left), right = Math.min(win.innerWidth, rect.right);
  let top2 = Math.max(0, rect.top), bottom = Math.min(win.innerHeight, rect.bottom);
  for (let parent = dom.parentNode; parent && parent != doc2.body; ) {
    if (parent.nodeType == 1) {
      let elt = parent;
      let style = window.getComputedStyle(elt);
      if ((elt.scrollHeight > elt.clientHeight || elt.scrollWidth > elt.clientWidth) && style.overflow != "visible") {
        let parentRect = elt.getBoundingClientRect();
        left = Math.max(left, parentRect.left);
        right = Math.min(right, parentRect.right);
        top2 = Math.max(top2, parentRect.top);
        bottom = parent == dom.parentNode ? parentRect.bottom : Math.min(bottom, parentRect.bottom);
      }
      parent = style.position == "absolute" || style.position == "fixed" ? elt.offsetParent : elt.parentNode;
    } else if (parent.nodeType == 11) {
      parent = parent.host;
    } else {
      break;
    }
  }
  return {
    left: left - rect.left,
    right: Math.max(left, right) - rect.left,
    top: top2 - (rect.top + paddingTop),
    bottom: Math.max(top2, bottom) - (rect.top + paddingTop)
  };
}
function fullPixelRange(dom, paddingTop) {
  let rect = dom.getBoundingClientRect();
  return {
    left: 0,
    right: rect.right - rect.left,
    top: paddingTop,
    bottom: rect.bottom - (rect.top + paddingTop)
  };
}
class LineGap {
  constructor(from, to, size) {
    this.from = from;
    this.to = to;
    this.size = size;
  }
  static same(a, b) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++) {
      let gA = a[i], gB = b[i];
      if (gA.from != gB.from || gA.to != gB.to || gA.size != gB.size)
        return false;
    }
    return true;
  }
  draw(wrapping) {
    return Decoration.replace({ widget: new LineGapWidget(this.size, wrapping) }).range(this.from, this.to);
  }
}
class LineGapWidget extends WidgetType {
  constructor(size, vertical) {
    super();
    this.size = size;
    this.vertical = vertical;
  }
  eq(other) {
    return other.size == this.size && other.vertical == this.vertical;
  }
  toDOM() {
    let elt = document.createElement("div");
    if (this.vertical) {
      elt.style.height = this.size + "px";
    } else {
      elt.style.width = this.size + "px";
      elt.style.height = "2px";
      elt.style.display = "inline-block";
    }
    return elt;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
}
class ViewState {
  constructor(state) {
    this.state = state;
    this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 };
    this.inView = true;
    this.paddingTop = 0;
    this.paddingBottom = 0;
    this.contentDOMWidth = 0;
    this.contentDOMHeight = 0;
    this.editorHeight = 0;
    this.editorWidth = 0;
    this.scaler = IdScaler;
    this.scrollTarget = null;
    this.printing = false;
    this.mustMeasureContent = true;
    this.defaultTextDirection = Direction.LTR;
    this.visibleRanges = [];
    this.mustEnforceCursorAssoc = false;
    let guessWrapping = state.facet(contentAttributes).some((v) => typeof v != "function" && v.class == "cm-lineWrapping");
    this.heightOracle = new HeightOracle(guessWrapping);
    this.stateDeco = state.facet(decorations).filter((d) => typeof d != "function");
    this.heightMap = HeightMap.empty().applyChanges(this.stateDeco, Text.empty, this.heightOracle.setDoc(state.doc), [new ChangedRange(0, 0, 0, state.doc.length)]);
    this.viewport = this.getViewport(0, null);
    this.updateViewportLines();
    this.updateForViewport();
    this.lineGaps = this.ensureLineGaps([]);
    this.lineGapDeco = Decoration.set(this.lineGaps.map((gap) => gap.draw(false)));
    this.computeVisibleRanges();
  }
  updateForViewport() {
    let viewports = [this.viewport], { main } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let pos = i ? main.head : main.anchor;
      if (!viewports.some(({ from, to }) => pos >= from && pos <= to)) {
        let { from, to } = this.lineBlockAt(pos);
        viewports.push(new Viewport(from, to));
      }
    }
    this.viewports = viewports.sort((a, b) => a.from - b.from);
    this.scaler = this.heightMap.height <= 7e6 ? IdScaler : new BigScaler(this.heightOracle, this.heightMap, this.viewports);
  }
  updateViewportLines() {
    this.viewportLines = [];
    this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (block) => {
      this.viewportLines.push(this.scaler.scale == 1 ? block : scaleBlock(block, this.scaler));
    });
  }
  update(update, scrollTarget = null) {
    this.state = update.state;
    let prevDeco = this.stateDeco;
    this.stateDeco = this.state.facet(decorations).filter((d) => typeof d != "function");
    let contentChanges = update.changedRanges;
    let heightChanges = ChangedRange.extendWithRanges(contentChanges, heightRelevantDecoChanges(prevDeco, this.stateDeco, update ? update.changes : ChangeSet.empty(this.state.doc.length)));
    let prevHeight = this.heightMap.height;
    this.heightMap = this.heightMap.applyChanges(this.stateDeco, update.startState.doc, this.heightOracle.setDoc(this.state.doc), heightChanges);
    if (this.heightMap.height != prevHeight)
      update.flags |= 2;
    let viewport = heightChanges.length ? this.mapViewport(this.viewport, update.changes) : this.viewport;
    if (scrollTarget && (scrollTarget.range.head < viewport.from || scrollTarget.range.head > viewport.to) || !this.viewportIsAppropriate(viewport))
      viewport = this.getViewport(0, scrollTarget);
    let updateLines = !update.changes.empty || update.flags & 2 || viewport.from != this.viewport.from || viewport.to != this.viewport.to;
    this.viewport = viewport;
    this.updateForViewport();
    if (updateLines)
      this.updateViewportLines();
    if (this.lineGaps.length || this.viewport.to - this.viewport.from > 2e3 << 1)
      this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, update.changes)));
    update.flags |= this.computeVisibleRanges();
    if (scrollTarget)
      this.scrollTarget = scrollTarget;
    if (!this.mustEnforceCursorAssoc && update.selectionSet && update.view.lineWrapping && update.state.selection.main.empty && update.state.selection.main.assoc && !update.state.facet(nativeSelectionHidden))
      this.mustEnforceCursorAssoc = true;
  }
  measure(view) {
    let dom = view.contentDOM, style = window.getComputedStyle(dom);
    let oracle = this.heightOracle;
    let whiteSpace = style.whiteSpace;
    this.defaultTextDirection = style.direction == "rtl" ? Direction.RTL : Direction.LTR;
    let refresh = this.heightOracle.mustRefreshForWrapping(whiteSpace);
    let domRect = dom.getBoundingClientRect();
    let measureContent = refresh || this.mustMeasureContent || this.contentDOMHeight != domRect.height;
    this.contentDOMHeight = domRect.height;
    this.mustMeasureContent = false;
    let result = 0, bias = 0;
    let paddingTop = parseInt(style.paddingTop) || 0, paddingBottom = parseInt(style.paddingBottom) || 0;
    if (this.paddingTop != paddingTop || this.paddingBottom != paddingBottom) {
      this.paddingTop = paddingTop;
      this.paddingBottom = paddingBottom;
      result |= 8 | 2;
    }
    if (this.editorWidth != view.scrollDOM.clientWidth) {
      if (oracle.lineWrapping)
        measureContent = true;
      this.editorWidth = view.scrollDOM.clientWidth;
      result |= 8;
    }
    let pixelViewport = (this.printing ? fullPixelRange : visiblePixelRange)(dom, this.paddingTop);
    let dTop = pixelViewport.top - this.pixelViewport.top, dBottom = pixelViewport.bottom - this.pixelViewport.bottom;
    this.pixelViewport = pixelViewport;
    let inView = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (inView != this.inView) {
      this.inView = inView;
      if (inView)
        measureContent = true;
    }
    if (!this.inView && !this.scrollTarget)
      return 0;
    let contentWidth = domRect.width;
    if (this.contentDOMWidth != contentWidth || this.editorHeight != view.scrollDOM.clientHeight) {
      this.contentDOMWidth = domRect.width;
      this.editorHeight = view.scrollDOM.clientHeight;
      result |= 8;
    }
    if (measureContent) {
      let lineHeights = view.docView.measureVisibleLineHeights(this.viewport);
      if (oracle.mustRefreshForHeights(lineHeights))
        refresh = true;
      if (refresh || oracle.lineWrapping && Math.abs(contentWidth - this.contentDOMWidth) > oracle.charWidth) {
        let { lineHeight, charWidth } = view.docView.measureTextSize();
        refresh = lineHeight > 0 && oracle.refresh(whiteSpace, lineHeight, charWidth, contentWidth / charWidth, lineHeights);
        if (refresh) {
          view.docView.minWidth = 0;
          result |= 8;
        }
      }
      if (dTop > 0 && dBottom > 0)
        bias = Math.max(dTop, dBottom);
      else if (dTop < 0 && dBottom < 0)
        bias = Math.min(dTop, dBottom);
      oracle.heightChanged = false;
      for (let vp of this.viewports) {
        let heights = vp.from == this.viewport.from ? lineHeights : view.docView.measureVisibleLineHeights(vp);
        this.heightMap = (refresh ? HeightMap.empty().applyChanges(this.stateDeco, Text.empty, this.heightOracle, [new ChangedRange(0, 0, 0, view.state.doc.length)]) : this.heightMap).updateHeight(oracle, 0, refresh, new MeasuredHeights(vp.from, heights));
      }
      if (oracle.heightChanged)
        result |= 2;
    }
    let viewportChange = !this.viewportIsAppropriate(this.viewport, bias) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    if (viewportChange)
      this.viewport = this.getViewport(bias, this.scrollTarget);
    this.updateForViewport();
    if (result & 2 || viewportChange)
      this.updateViewportLines();
    if (this.lineGaps.length || this.viewport.to - this.viewport.from > 2e3 << 1)
      this.updateLineGaps(this.ensureLineGaps(refresh ? [] : this.lineGaps, view));
    result |= this.computeVisibleRanges();
    if (this.mustEnforceCursorAssoc) {
      this.mustEnforceCursorAssoc = false;
      view.docView.enforceCursorAssoc();
    }
    return result;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(bias, scrollTarget) {
    let marginTop = 0.5 - Math.max(-0.5, Math.min(0.5, bias / 1e3 / 2));
    let map = this.heightMap, oracle = this.heightOracle;
    let { visibleTop, visibleBottom } = this;
    let viewport = new Viewport(map.lineAt(visibleTop - marginTop * 1e3, QueryType$1.ByHeight, oracle, 0, 0).from, map.lineAt(visibleBottom + (1 - marginTop) * 1e3, QueryType$1.ByHeight, oracle, 0, 0).to);
    if (scrollTarget) {
      let { head } = scrollTarget.range;
      if (head < viewport.from || head > viewport.to) {
        let viewHeight = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top);
        let block = map.lineAt(head, QueryType$1.ByPos, oracle, 0, 0), topPos;
        if (scrollTarget.y == "center")
          topPos = (block.top + block.bottom) / 2 - viewHeight / 2;
        else if (scrollTarget.y == "start" || scrollTarget.y == "nearest" && head < viewport.from)
          topPos = block.top;
        else
          topPos = block.bottom - viewHeight;
        viewport = new Viewport(map.lineAt(topPos - 1e3 / 2, QueryType$1.ByHeight, oracle, 0, 0).from, map.lineAt(topPos + viewHeight + 1e3 / 2, QueryType$1.ByHeight, oracle, 0, 0).to);
      }
    }
    return viewport;
  }
  mapViewport(viewport, changes) {
    let from = changes.mapPos(viewport.from, -1), to = changes.mapPos(viewport.to, 1);
    return new Viewport(this.heightMap.lineAt(from, QueryType$1.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(to, QueryType$1.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from, to }, bias = 0) {
    if (!this.inView)
      return true;
    let { top: top2 } = this.heightMap.lineAt(from, QueryType$1.ByPos, this.heightOracle, 0, 0);
    let { bottom } = this.heightMap.lineAt(to, QueryType$1.ByPos, this.heightOracle, 0, 0);
    let { visibleTop, visibleBottom } = this;
    return (from == 0 || top2 <= visibleTop - Math.max(10, Math.min(
      -bias,
      250
      /* VP.MaxCoverMargin */
    ))) && (to == this.state.doc.length || bottom >= visibleBottom + Math.max(10, Math.min(
      bias,
      250
      /* VP.MaxCoverMargin */
    ))) && (top2 > visibleTop - 2 * 1e3 && bottom < visibleBottom + 2 * 1e3);
  }
  mapLineGaps(gaps, changes) {
    if (!gaps.length || changes.empty)
      return gaps;
    let mapped = [];
    for (let gap of gaps)
      if (!changes.touchesRange(gap.from, gap.to))
        mapped.push(new LineGap(changes.mapPos(gap.from), changes.mapPos(gap.to), gap.size));
    return mapped;
  }
  // Computes positions in the viewport where the start or end of a
  // line should be hidden, trying to reuse existing line gaps when
  // appropriate to avoid unneccesary redraws.
  // Uses crude character-counting for the positioning and sizing,
  // since actual DOM coordinates aren't always available and
  // predictable. Relies on generous margins (see LG.Margin) to hide
  // the artifacts this might produce from the user.
  ensureLineGaps(current, mayMeasure) {
    let wrapping = this.heightOracle.lineWrapping;
    let margin = wrapping ? 1e4 : 2e3, halfMargin = margin >> 1, doubleMargin = margin << 1;
    if (this.defaultTextDirection != Direction.LTR && !wrapping)
      return [];
    let gaps = [];
    let addGap = (from, to, line, structure) => {
      if (to - from < halfMargin)
        return;
      let sel = this.state.selection.main, avoid = [sel.from];
      if (!sel.empty)
        avoid.push(sel.to);
      for (let pos of avoid) {
        if (pos > from && pos < to) {
          addGap(from, pos - 10, line, structure);
          addGap(pos + 10, to, line, structure);
          return;
        }
      }
      let gap = find(current, (gap2) => gap2.from >= line.from && gap2.to <= line.to && Math.abs(gap2.from - from) < halfMargin && Math.abs(gap2.to - to) < halfMargin && !avoid.some((pos) => gap2.from < pos && gap2.to > pos));
      if (!gap) {
        if (to < line.to && mayMeasure && wrapping && mayMeasure.visibleRanges.some((r) => r.from <= to && r.to >= to)) {
          let lineStart = mayMeasure.moveToLineBoundary(EditorSelection.cursor(to), false, true).head;
          if (lineStart > from)
            to = lineStart;
        }
        gap = new LineGap(from, to, this.gapSize(line, from, to, structure));
      }
      gaps.push(gap);
    };
    for (let line of this.viewportLines) {
      if (line.length < doubleMargin)
        continue;
      let structure = lineStructure(line.from, line.to, this.stateDeco);
      if (structure.total < doubleMargin)
        continue;
      let target = this.scrollTarget ? this.scrollTarget.range.head : null;
      let viewFrom, viewTo;
      if (wrapping) {
        let marginHeight = margin / this.heightOracle.lineLength * this.heightOracle.lineHeight;
        let top2, bot;
        if (target != null) {
          let targetFrac = findFraction(structure, target);
          let spaceFrac = ((this.visibleBottom - this.visibleTop) / 2 + marginHeight) / line.height;
          top2 = targetFrac - spaceFrac;
          bot = targetFrac + spaceFrac;
        } else {
          top2 = (this.visibleTop - line.top - marginHeight) / line.height;
          bot = (this.visibleBottom - line.top + marginHeight) / line.height;
        }
        viewFrom = findPosition(structure, top2);
        viewTo = findPosition(structure, bot);
      } else {
        let totalWidth = structure.total * this.heightOracle.charWidth;
        let marginWidth = margin * this.heightOracle.charWidth;
        let left, right;
        if (target != null) {
          let targetFrac = findFraction(structure, target);
          let spaceFrac = ((this.pixelViewport.right - this.pixelViewport.left) / 2 + marginWidth) / totalWidth;
          left = targetFrac - spaceFrac;
          right = targetFrac + spaceFrac;
        } else {
          left = (this.pixelViewport.left - marginWidth) / totalWidth;
          right = (this.pixelViewport.right + marginWidth) / totalWidth;
        }
        viewFrom = findPosition(structure, left);
        viewTo = findPosition(structure, right);
      }
      if (viewFrom > line.from)
        addGap(line.from, viewFrom, line, structure);
      if (viewTo < line.to)
        addGap(viewTo, line.to, line, structure);
    }
    return gaps;
  }
  gapSize(line, from, to, structure) {
    let fraction = findFraction(structure, to) - findFraction(structure, from);
    if (this.heightOracle.lineWrapping) {
      return line.height * fraction;
    } else {
      return structure.total * this.heightOracle.charWidth * fraction;
    }
  }
  updateLineGaps(gaps) {
    if (!LineGap.same(gaps, this.lineGaps)) {
      this.lineGaps = gaps;
      this.lineGapDeco = Decoration.set(gaps.map((gap) => gap.draw(this.heightOracle.lineWrapping)));
    }
  }
  computeVisibleRanges() {
    let deco = this.stateDeco;
    if (this.lineGaps.length)
      deco = deco.concat(this.lineGapDeco);
    let ranges = [];
    RangeSet.spans(deco, this.viewport.from, this.viewport.to, {
      span(from, to) {
        ranges.push({ from, to });
      },
      point() {
      }
    }, 20);
    let changed = ranges.length != this.visibleRanges.length || this.visibleRanges.some((r, i) => r.from != ranges[i].from || r.to != ranges[i].to);
    this.visibleRanges = ranges;
    return changed ? 4 : 0;
  }
  lineBlockAt(pos) {
    return pos >= this.viewport.from && pos <= this.viewport.to && this.viewportLines.find((b) => b.from <= pos && b.to >= pos) || scaleBlock(this.heightMap.lineAt(pos, QueryType$1.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(height) {
    return scaleBlock(this.heightMap.lineAt(this.scaler.fromDOM(height), QueryType$1.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  elementAtHeight(height) {
    return scaleBlock(this.heightMap.blockAt(this.scaler.fromDOM(height), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class Viewport {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
}
function lineStructure(from, to, stateDeco) {
  let ranges = [], pos = from, total = 0;
  RangeSet.spans(stateDeco, from, to, {
    span() {
    },
    point(from2, to2) {
      if (from2 > pos) {
        ranges.push({ from: pos, to: from2 });
        total += from2 - pos;
      }
      pos = to2;
    }
  }, 20);
  if (pos < to) {
    ranges.push({ from: pos, to });
    total += to - pos;
  }
  return { total, ranges };
}
function findPosition({ total, ranges }, ratio) {
  if (ratio <= 0)
    return ranges[0].from;
  if (ratio >= 1)
    return ranges[ranges.length - 1].to;
  let dist = Math.floor(total * ratio);
  for (let i = 0; ; i++) {
    let { from, to } = ranges[i], size = to - from;
    if (dist <= size)
      return from + dist;
    dist -= size;
  }
}
function findFraction(structure, pos) {
  let counted = 0;
  for (let { from, to } of structure.ranges) {
    if (pos <= to) {
      counted += pos - from;
      break;
    }
    counted += to - from;
  }
  return counted / structure.total;
}
function find(array, f) {
  for (let val of array)
    if (f(val))
      return val;
  return void 0;
}
const IdScaler = {
  toDOM(n) {
    return n;
  },
  fromDOM(n) {
    return n;
  },
  scale: 1
};
class BigScaler {
  constructor(oracle, heightMap, viewports) {
    let vpHeight = 0, base2 = 0, domBase = 0;
    this.viewports = viewports.map(({ from, to }) => {
      let top2 = heightMap.lineAt(from, QueryType$1.ByPos, oracle, 0, 0).top;
      let bottom = heightMap.lineAt(to, QueryType$1.ByPos, oracle, 0, 0).bottom;
      vpHeight += bottom - top2;
      return { from, to, top: top2, bottom, domTop: 0, domBottom: 0 };
    });
    this.scale = (7e6 - vpHeight) / (heightMap.height - vpHeight);
    for (let obj of this.viewports) {
      obj.domTop = domBase + (obj.top - base2) * this.scale;
      domBase = obj.domBottom = obj.domTop + (obj.bottom - obj.top);
      base2 = obj.bottom;
    }
  }
  toDOM(n) {
    for (let i = 0, base2 = 0, domBase = 0; ; i++) {
      let vp = i < this.viewports.length ? this.viewports[i] : null;
      if (!vp || n < vp.top)
        return domBase + (n - base2) * this.scale;
      if (n <= vp.bottom)
        return vp.domTop + (n - vp.top);
      base2 = vp.bottom;
      domBase = vp.domBottom;
    }
  }
  fromDOM(n) {
    for (let i = 0, base2 = 0, domBase = 0; ; i++) {
      let vp = i < this.viewports.length ? this.viewports[i] : null;
      if (!vp || n < vp.domTop)
        return base2 + (n - domBase) / this.scale;
      if (n <= vp.domBottom)
        return vp.top + (n - vp.domTop);
      base2 = vp.bottom;
      domBase = vp.domBottom;
    }
  }
}
function scaleBlock(block, scaler) {
  if (scaler.scale == 1)
    return block;
  let bTop = scaler.toDOM(block.top), bBottom = scaler.toDOM(block.bottom);
  return new BlockInfo(block.from, block.length, bTop, bBottom - bTop, Array.isArray(block.type) ? block.type.map((b) => scaleBlock(b, scaler)) : block.type);
}
const theme = /* @__PURE__ */ Facet.define({ combine: (strs) => strs.join(" ") });
const darkTheme = /* @__PURE__ */ Facet.define({ combine: (values) => values.indexOf(true) > -1 });
const baseThemeID = /* @__PURE__ */ StyleModule.newName(), baseLightID = /* @__PURE__ */ StyleModule.newName(), baseDarkID = /* @__PURE__ */ StyleModule.newName();
const lightDarkIDs = { "&light": "." + baseLightID, "&dark": "." + baseDarkID };
function buildTheme(main, spec, scopes) {
  return new StyleModule(spec, {
    finish(sel) {
      return /&/.test(sel) ? sel.replace(/&\w*/, (m) => {
        if (m == "&")
          return main;
        if (!scopes || !scopes[m])
          throw new RangeError(`Unsupported selector: ${m}`);
        return scopes[m];
      }) : main + " " + sel;
    }
  });
}
const baseTheme$1$3 = /* @__PURE__ */ buildTheme("." + baseThemeID, {
  "&": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      // Provide a simple default outline to make sure a focused
      // editor is visually distinct. Can't leave the default behavior
      // because that will apply to the content element, which is
      // inside the scrollable container and doesn't include the
      // gutters. We also can't use an 'auto' outline, since those
      // are, for some reason, drawn behind the element content, which
      // will cause things like the active line background to cover
      // the outline (#297).
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    flexShrink: 0,
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    boxSizing: "border-box",
    padding: "4px 0",
    outline: "none",
    "&[contenteditable=true]": {
      WebkitUserModify: "read-write-plaintext-only"
    }
  },
  ".cm-lineWrapping": {
    whiteSpace_fallback: "pre-wrap",
    whiteSpace: "break-spaces",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    flexShrink: 1
  },
  "&light .cm-content": { caretColor: "black" },
  "&dark .cm-content": { caretColor: "white" },
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 6px"
  },
  ".cm-layer": {
    contain: "size style",
    "& > *": {
      position: "absolute"
    }
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    pointerEvents: "none"
  },
  "&.cm-focused .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  // Two animations defined so that we can switch between them to
  // restart the animation without forcing another style
  // recomputation.
  "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none"
  },
  ".cm-cursor": {
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#444"
  },
  ".cm-dropCursor": {
    position: "absolute"
  },
  "&.cm-focused .cm-cursor": {
    display: "block"
  },
  "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
  "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
  "&light .cm-specialChar": { color: "red" },
  "&dark .cm-specialChar": { color: "#f78" },
  ".cm-gutters": {
    flexShrink: 0,
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    left: 0,
    zIndex: 200
  },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#6c6c6c",
    borderRight: "1px solid #ddd"
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    minHeight: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  },
  "&dark .cm-activeLineGutter": {
    backgroundColor: "#222227"
  },
  ".cm-panels": {
    boxSizing: "border-box",
    position: "sticky",
    left: 0,
    right: 0
  },
  "&light .cm-panels": {
    backgroundColor: "#f5f5f5",
    color: "black"
  },
  "&light .cm-panels-top": {
    borderBottom: "1px solid #ddd"
  },
  "&light .cm-panels-bottom": {
    borderTop: "1px solid #ddd"
  },
  "&dark .cm-panels": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-widgetBuffer": {
    verticalAlign: "text-top",
    height: "1em",
    width: 0,
    display: "inline"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block",
    verticalAlign: "top"
  },
  ".cm-highlightSpace:before": {
    content: "attr(data-display)",
    position: "absolute",
    pointerEvents: "none",
    color: "#888"
  },
  ".cm-highlightTab": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
    backgroundSize: "auto 100%",
    backgroundPosition: "right 90%",
    backgroundRepeat: "no-repeat"
  },
  ".cm-trailingSpace": {
    backgroundColor: "#ff332255"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "1px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, lightDarkIDs);
class DOMChange {
  constructor(view, start, end, typeOver) {
    this.typeOver = typeOver;
    this.bounds = null;
    this.text = "";
    let { impreciseHead: iHead, impreciseAnchor: iAnchor } = view.docView;
    if (view.state.readOnly && start > -1) {
      this.newSel = null;
    } else if (start > -1 && (this.bounds = view.docView.domBoundsAround(start, end, 0))) {
      let selPoints = iHead || iAnchor ? [] : selectionPoints(view);
      let reader = new DOMReader(selPoints, view.state);
      reader.readRange(this.bounds.startDOM, this.bounds.endDOM);
      this.text = reader.text;
      this.newSel = selectionFromPoints(selPoints, this.bounds.from);
    } else {
      let domSel = view.observer.selectionRange;
      let head = iHead && iHead.node == domSel.focusNode && iHead.offset == domSel.focusOffset || !contains(view.contentDOM, domSel.focusNode) ? view.state.selection.main.head : view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
      let anchor = iAnchor && iAnchor.node == domSel.anchorNode && iAnchor.offset == domSel.anchorOffset || !contains(view.contentDOM, domSel.anchorNode) ? view.state.selection.main.anchor : view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset);
      this.newSel = EditorSelection.single(anchor, head);
    }
  }
}
function applyDOMChange(view, domChange) {
  let change;
  let { newSel } = domChange, sel = view.state.selection.main;
  if (domChange.bounds) {
    let { from, to } = domChange.bounds;
    let preferredPos = sel.from, preferredSide = null;
    if (view.inputState.lastKeyCode === 8 && view.inputState.lastKeyTime > Date.now() - 100 || browser.android && domChange.text.length < to - from) {
      preferredPos = sel.to;
      preferredSide = "end";
    }
    let diff = findDiff(view.state.doc.sliceString(from, to, LineBreakPlaceholder), domChange.text, preferredPos - from, preferredSide);
    if (diff) {
      if (browser.chrome && view.inputState.lastKeyCode == 13 && diff.toB == diff.from + 2 && domChange.text.slice(diff.from, diff.toB) == LineBreakPlaceholder + LineBreakPlaceholder)
        diff.toB--;
      change = {
        from: from + diff.from,
        to: from + diff.toA,
        insert: Text.of(domChange.text.slice(diff.from, diff.toB).split(LineBreakPlaceholder))
      };
    }
  } else if (newSel && (!view.hasFocus && view.state.facet(editable) || newSel.main.eq(sel))) {
    newSel = null;
  }
  if (!change && !newSel)
    return false;
  if (!change && domChange.typeOver && !sel.empty && newSel && newSel.main.empty) {
    change = { from: sel.from, to: sel.to, insert: view.state.doc.slice(sel.from, sel.to) };
  } else if (change && change.from >= sel.from && change.to <= sel.to && (change.from != sel.from || change.to != sel.to) && sel.to - sel.from - (change.to - change.from) <= 4) {
    change = {
      from: sel.from,
      to: sel.to,
      insert: view.state.doc.slice(sel.from, change.from).append(change.insert).append(view.state.doc.slice(change.to, sel.to))
    };
  } else if ((browser.mac || browser.android) && change && change.from == change.to && change.from == sel.head - 1 && /^\. ?$/.test(change.insert.toString()) && view.contentDOM.getAttribute("autocorrect") == "off") {
    if (newSel && change.insert.length == 2)
      newSel = EditorSelection.single(newSel.main.anchor - 1, newSel.main.head - 1);
    change = { from: sel.from, to: sel.to, insert: Text.of([" "]) };
  } else if (browser.chrome && change && change.from == change.to && change.from == sel.head && change.insert.toString() == "\n " && view.lineWrapping) {
    if (newSel)
      newSel = EditorSelection.single(newSel.main.anchor - 1, newSel.main.head - 1);
    change = { from: sel.from, to: sel.to, insert: Text.of([" "]) };
  }
  if (change) {
    let startState = view.state;
    if (browser.ios && view.inputState.flushIOSKey(view))
      return true;
    if (browser.android && (change.from == sel.from && change.to == sel.to && change.insert.length == 1 && change.insert.lines == 2 && dispatchKey(view.contentDOM, "Enter", 13) || change.from == sel.from - 1 && change.to == sel.to && change.insert.length == 0 && dispatchKey(view.contentDOM, "Backspace", 8) || change.from == sel.from && change.to == sel.to + 1 && change.insert.length == 0 && dispatchKey(view.contentDOM, "Delete", 46)))
      return true;
    let text = change.insert.toString();
    if (view.state.facet(inputHandler$1).some((h) => h(view, change.from, change.to, text)))
      return true;
    if (view.inputState.composing >= 0)
      view.inputState.composing++;
    let tr;
    if (change.from >= sel.from && change.to <= sel.to && change.to - change.from >= (sel.to - sel.from) / 3 && (!newSel || newSel.main.empty && newSel.main.from == change.from + change.insert.length) && view.inputState.composing < 0) {
      let before = sel.from < change.from ? startState.sliceDoc(sel.from, change.from) : "";
      let after = sel.to > change.to ? startState.sliceDoc(change.to, sel.to) : "";
      tr = startState.replaceSelection(view.state.toText(before + change.insert.sliceString(0, void 0, view.state.lineBreak) + after));
    } else {
      let changes = startState.changes(change);
      let mainSel = newSel && !startState.selection.main.eq(newSel.main) && newSel.main.to <= changes.newLength ? newSel.main : void 0;
      if (startState.selection.ranges.length > 1 && view.inputState.composing >= 0 && change.to <= sel.to && change.to >= sel.to - 10) {
        let replaced = view.state.sliceDoc(change.from, change.to);
        let compositionRange = compositionSurroundingNode(view) || view.state.doc.lineAt(sel.head);
        let offset = sel.to - change.to, size = sel.to - sel.from;
        tr = startState.changeByRange((range) => {
          if (range.from == sel.from && range.to == sel.to)
            return { changes, range: mainSel || range.map(changes) };
          let to = range.to - offset, from = to - replaced.length;
          if (range.to - range.from != size || view.state.sliceDoc(from, to) != replaced || // Unfortunately, there's no way to make multiple
          // changes in the same node work without aborting
          // composition, so cursors in the composition range are
          // ignored.
          compositionRange && range.to >= compositionRange.from && range.from <= compositionRange.to)
            return { range };
          let rangeChanges = startState.changes({ from, to, insert: change.insert }), selOff = range.to - sel.to;
          return {
            changes: rangeChanges,
            range: !mainSel ? range.map(rangeChanges) : EditorSelection.range(Math.max(0, mainSel.anchor + selOff), Math.max(0, mainSel.head + selOff))
          };
        });
      } else {
        tr = {
          changes,
          selection: mainSel && startState.selection.replaceRange(mainSel)
        };
      }
    }
    let userEvent = "input.type";
    if (view.composing) {
      userEvent += ".compose";
      if (view.inputState.compositionFirstChange) {
        userEvent += ".start";
        view.inputState.compositionFirstChange = false;
      }
    }
    view.dispatch(tr, { scrollIntoView: true, userEvent });
    return true;
  } else if (newSel && !newSel.main.eq(sel)) {
    let scrollIntoView2 = false, userEvent = "select";
    if (view.inputState.lastSelectionTime > Date.now() - 50) {
      if (view.inputState.lastSelectionOrigin == "select")
        scrollIntoView2 = true;
      userEvent = view.inputState.lastSelectionOrigin;
    }
    view.dispatch({ selection: newSel, scrollIntoView: scrollIntoView2, userEvent });
    return true;
  } else {
    return false;
  }
}
function findDiff(a, b, preferredPos, preferredSide) {
  let minLen = Math.min(a.length, b.length);
  let from = 0;
  while (from < minLen && a.charCodeAt(from) == b.charCodeAt(from))
    from++;
  if (from == minLen && a.length == b.length)
    return null;
  let toA = a.length, toB = b.length;
  while (toA > 0 && toB > 0 && a.charCodeAt(toA - 1) == b.charCodeAt(toB - 1)) {
    toA--;
    toB--;
  }
  if (preferredSide == "end") {
    let adjust = Math.max(0, from - Math.min(toA, toB));
    preferredPos -= toA + adjust - from;
  }
  if (toA < from && a.length < b.length) {
    let move = preferredPos <= from && preferredPos >= toA ? from - preferredPos : 0;
    from -= move;
    toB = from + (toB - toA);
    toA = from;
  } else if (toB < from) {
    let move = preferredPos <= from && preferredPos >= toB ? from - preferredPos : 0;
    from -= move;
    toA = from + (toA - toB);
    toB = from;
  }
  return { from, toA, toB };
}
function selectionPoints(view) {
  let result = [];
  if (view.root.activeElement != view.contentDOM)
    return result;
  let { anchorNode, anchorOffset, focusNode, focusOffset } = view.observer.selectionRange;
  if (anchorNode) {
    result.push(new DOMPoint(anchorNode, anchorOffset));
    if (focusNode != anchorNode || focusOffset != anchorOffset)
      result.push(new DOMPoint(focusNode, focusOffset));
  }
  return result;
}
function selectionFromPoints(points, base2) {
  if (points.length == 0)
    return null;
  let anchor = points[0].pos, head = points.length == 2 ? points[1].pos : anchor;
  return anchor > -1 && head > -1 ? EditorSelection.single(anchor + base2, head + base2) : null;
}
const observeOptions = {
  childList: true,
  characterData: true,
  subtree: true,
  attributes: true,
  characterDataOldValue: true
};
const useCharData = browser.ie && browser.ie_version <= 11;
class DOMObserver {
  constructor(view) {
    this.view = view;
    this.active = false;
    this.selectionRange = new DOMSelectionState();
    this.selectionChanged = false;
    this.delayedFlush = -1;
    this.resizeTimeout = -1;
    this.queue = [];
    this.delayedAndroidKey = null;
    this.flushingAndroidKey = -1;
    this.lastChange = 0;
    this.scrollTargets = [];
    this.intersection = null;
    this.resizeScroll = null;
    this.resizeContent = null;
    this.intersecting = false;
    this.gapIntersection = null;
    this.gaps = [];
    this.parentCheck = -1;
    this.dom = view.contentDOM;
    this.observer = new MutationObserver((mutations) => {
      for (let mut of mutations)
        this.queue.push(mut);
      if ((browser.ie && browser.ie_version <= 11 || browser.ios && view.composing) && mutations.some((m) => m.type == "childList" && m.removedNodes.length || m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length))
        this.flushSoon();
      else
        this.flush();
    });
    if (useCharData)
      this.onCharData = (event) => {
        this.queue.push({
          target: event.target,
          type: "characterData",
          oldValue: event.prevValue
        });
        this.flushSoon();
      };
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onPrint = this.onPrint.bind(this);
    this.onScroll = this.onScroll.bind(this);
    if (typeof ResizeObserver == "function") {
      this.resizeScroll = new ResizeObserver(() => {
        var _a2;
        if (((_a2 = this.view.docView) === null || _a2 === void 0 ? void 0 : _a2.lastUpdate) < Date.now() - 75)
          this.onResize();
      });
      this.resizeScroll.observe(view.scrollDOM);
      this.resizeContent = new ResizeObserver(() => this.view.requestMeasure());
      this.resizeContent.observe(view.contentDOM);
    }
    this.addWindowListeners(this.win = view.win);
    this.start();
    if (typeof IntersectionObserver == "function") {
      this.intersection = new IntersectionObserver((entries) => {
        if (this.parentCheck < 0)
          this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3);
        if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0 != this.intersecting) {
          this.intersecting = !this.intersecting;
          if (this.intersecting != this.view.inView)
            this.onScrollChanged(document.createEvent("Event"));
        }
      }, {});
      this.intersection.observe(this.dom);
      this.gapIntersection = new IntersectionObserver((entries) => {
        if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0)
          this.onScrollChanged(document.createEvent("Event"));
      }, {});
    }
    this.listenForScroll();
    this.readSelectionRange();
  }
  onScrollChanged(e) {
    this.view.inputState.runScrollHandlers(this.view, e);
    if (this.intersecting)
      this.view.measure();
  }
  onScroll(e) {
    if (this.intersecting)
      this.flush(false);
    this.onScrollChanged(e);
  }
  onResize() {
    if (this.resizeTimeout < 0)
      this.resizeTimeout = setTimeout(() => {
        this.resizeTimeout = -1;
        this.view.requestMeasure();
      }, 50);
  }
  onPrint() {
    this.view.viewState.printing = true;
    this.view.measure();
    setTimeout(() => {
      this.view.viewState.printing = false;
      this.view.requestMeasure();
    }, 500);
  }
  updateGaps(gaps) {
    if (this.gapIntersection && (gaps.length != this.gaps.length || this.gaps.some((g, i) => g != gaps[i]))) {
      this.gapIntersection.disconnect();
      for (let gap of gaps)
        this.gapIntersection.observe(gap);
      this.gaps = gaps;
    }
  }
  onSelectionChange(event) {
    let wasChanged = this.selectionChanged;
    if (!this.readSelectionRange() || this.delayedAndroidKey)
      return;
    let { view } = this, sel = this.selectionRange;
    if (view.state.facet(editable) ? view.root.activeElement != this.dom : !hasSelection(view.dom, sel))
      return;
    let context = sel.anchorNode && view.docView.nearest(sel.anchorNode);
    if (context && context.ignoreEvent(event)) {
      if (!wasChanged)
        this.selectionChanged = false;
      return;
    }
    if ((browser.ie && browser.ie_version <= 11 || browser.android && browser.chrome) && !view.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
      this.flushSoon();
    else
      this.flush(false);
  }
  readSelectionRange() {
    let { view } = this;
    let range = browser.safari && view.root.nodeType == 11 && deepActiveElement(this.dom.ownerDocument) == this.dom && safariSelectionRangeHack(this.view) || getSelection(view.root);
    if (!range || this.selectionRange.eq(range))
      return false;
    let local = hasSelection(this.dom, range);
    if (local && !this.selectionChanged && view.inputState.lastFocusTime > Date.now() - 200 && view.inputState.lastTouchTime < Date.now() - 300 && atElementStart(this.dom, range)) {
      this.view.inputState.lastFocusTime = 0;
      view.docView.updateSelection();
      return false;
    }
    this.selectionRange.setRange(range);
    if (local)
      this.selectionChanged = true;
    return true;
  }
  setSelectionRange(anchor, head) {
    this.selectionRange.set(anchor.node, anchor.offset, head.node, head.offset);
    this.selectionChanged = false;
  }
  clearSelectionRange() {
    this.selectionRange.set(null, 0, null, 0);
  }
  listenForScroll() {
    this.parentCheck = -1;
    let i = 0, changed = null;
    for (let dom = this.dom; dom; ) {
      if (dom.nodeType == 1) {
        if (!changed && i < this.scrollTargets.length && this.scrollTargets[i] == dom)
          i++;
        else if (!changed)
          changed = this.scrollTargets.slice(0, i);
        if (changed)
          changed.push(dom);
        dom = dom.assignedSlot || dom.parentNode;
      } else if (dom.nodeType == 11) {
        dom = dom.host;
      } else {
        break;
      }
    }
    if (i < this.scrollTargets.length && !changed)
      changed = this.scrollTargets.slice(0, i);
    if (changed) {
      for (let dom of this.scrollTargets)
        dom.removeEventListener("scroll", this.onScroll);
      for (let dom of this.scrollTargets = changed)
        dom.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(f) {
    if (!this.active)
      return f();
    try {
      this.stop();
      return f();
    } finally {
      this.start();
      this.clear();
    }
  }
  start() {
    if (this.active)
      return;
    this.observer.observe(this.dom, observeOptions);
    if (useCharData)
      this.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
    this.active = true;
  }
  stop() {
    if (!this.active)
      return;
    this.active = false;
    this.observer.disconnect();
    if (useCharData)
      this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
  }
  // Throw away any pending changes
  clear() {
    this.processRecords();
    this.queue.length = 0;
    this.selectionChanged = false;
  }
  // Chrome Android, especially in combination with GBoard, not only
  // doesn't reliably fire regular key events, but also often
  // surrounds the effect of enter or backspace with a bunch of
  // composition events that, when interrupted, cause text duplication
  // or other kinds of corruption. This hack makes the editor back off
  // from handling DOM changes for a moment when such a key is
  // detected (via beforeinput or keydown), and then tries to flush
  // them or, if that has no effect, dispatches the given key.
  delayAndroidKey(key, keyCode) {
    var _a2;
    if (!this.delayedAndroidKey) {
      let flush = () => {
        let key2 = this.delayedAndroidKey;
        if (key2) {
          this.clearDelayedAndroidKey();
          if (!this.flush() && key2.force)
            dispatchKey(this.dom, key2.key, key2.keyCode);
        }
      };
      this.flushingAndroidKey = this.view.win.requestAnimationFrame(flush);
    }
    if (!this.delayedAndroidKey || key == "Enter")
      this.delayedAndroidKey = {
        key,
        keyCode,
        // Only run the key handler when no changes are detected if
        // this isn't coming right after another change, in which case
        // it is probably part of a weird chain of updates, and should
        // be ignored if it returns the DOM to its previous state.
        force: this.lastChange < Date.now() - 50 || !!((_a2 = this.delayedAndroidKey) === null || _a2 === void 0 ? void 0 : _a2.force)
      };
  }
  clearDelayedAndroidKey() {
    this.win.cancelAnimationFrame(this.flushingAndroidKey);
    this.delayedAndroidKey = null;
    this.flushingAndroidKey = -1;
  }
  flushSoon() {
    if (this.delayedFlush < 0)
      this.delayedFlush = this.view.win.requestAnimationFrame(() => {
        this.delayedFlush = -1;
        this.flush();
      });
  }
  forceFlush() {
    if (this.delayedFlush >= 0) {
      this.view.win.cancelAnimationFrame(this.delayedFlush);
      this.delayedFlush = -1;
    }
    this.flush();
  }
  processRecords() {
    let records = this.queue;
    for (let mut of this.observer.takeRecords())
      records.push(mut);
    if (records.length)
      this.queue = [];
    let from = -1, to = -1, typeOver = false;
    for (let record of records) {
      let range = this.readMutation(record);
      if (!range)
        continue;
      if (range.typeOver)
        typeOver = true;
      if (from == -1) {
        ({ from, to } = range);
      } else {
        from = Math.min(range.from, from);
        to = Math.max(range.to, to);
      }
    }
    return { from, to, typeOver };
  }
  readChange() {
    let { from, to, typeOver } = this.processRecords();
    let newSel = this.selectionChanged && hasSelection(this.dom, this.selectionRange);
    if (from < 0 && !newSel)
      return null;
    if (from > -1)
      this.lastChange = Date.now();
    this.view.inputState.lastFocusTime = 0;
    this.selectionChanged = false;
    return new DOMChange(this.view, from, to, typeOver);
  }
  // Apply pending changes, if any
  flush(readSelection = true) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return false;
    if (readSelection)
      this.readSelectionRange();
    let domChange = this.readChange();
    if (!domChange)
      return false;
    let startState = this.view.state;
    let handled = applyDOMChange(this.view, domChange);
    if (this.view.state == startState)
      this.view.update([]);
    return handled;
  }
  readMutation(rec) {
    let cView = this.view.docView.nearest(rec.target);
    if (!cView || cView.ignoreMutation(rec))
      return null;
    cView.markDirty(rec.type == "attributes");
    if (rec.type == "attributes")
      cView.dirty |= 4;
    if (rec.type == "childList") {
      let childBefore = findChild(cView, rec.previousSibling || rec.target.previousSibling, -1);
      let childAfter = findChild(cView, rec.nextSibling || rec.target.nextSibling, 1);
      return {
        from: childBefore ? cView.posAfter(childBefore) : cView.posAtStart,
        to: childAfter ? cView.posBefore(childAfter) : cView.posAtEnd,
        typeOver: false
      };
    } else if (rec.type == "characterData") {
      return { from: cView.posAtStart, to: cView.posAtEnd, typeOver: rec.target.nodeValue == rec.oldValue };
    } else {
      return null;
    }
  }
  setWindow(win) {
    if (win != this.win) {
      this.removeWindowListeners(this.win);
      this.win = win;
      this.addWindowListeners(this.win);
    }
  }
  addWindowListeners(win) {
    win.addEventListener("resize", this.onResize);
    win.addEventListener("beforeprint", this.onPrint);
    win.addEventListener("scroll", this.onScroll);
    win.document.addEventListener("selectionchange", this.onSelectionChange);
  }
  removeWindowListeners(win) {
    win.removeEventListener("scroll", this.onScroll);
    win.removeEventListener("resize", this.onResize);
    win.removeEventListener("beforeprint", this.onPrint);
    win.document.removeEventListener("selectionchange", this.onSelectionChange);
  }
  destroy() {
    var _a2, _b, _c, _d;
    this.stop();
    (_a2 = this.intersection) === null || _a2 === void 0 ? void 0 : _a2.disconnect();
    (_b = this.gapIntersection) === null || _b === void 0 ? void 0 : _b.disconnect();
    (_c = this.resizeScroll) === null || _c === void 0 ? void 0 : _c.disconnect();
    (_d = this.resizeContent) === null || _d === void 0 ? void 0 : _d.disconnect();
    for (let dom of this.scrollTargets)
      dom.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win);
    clearTimeout(this.parentCheck);
    clearTimeout(this.resizeTimeout);
    this.win.cancelAnimationFrame(this.delayedFlush);
    this.win.cancelAnimationFrame(this.flushingAndroidKey);
  }
}
function findChild(cView, dom, dir) {
  while (dom) {
    let curView = ContentView.get(dom);
    if (curView && curView.parent == cView)
      return curView;
    let parent = dom.parentNode;
    dom = parent != cView.dom ? parent : dir > 0 ? dom.nextSibling : dom.previousSibling;
  }
  return null;
}
function safariSelectionRangeHack(view) {
  let found = null;
  function read(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    found = event.getTargetRanges()[0];
  }
  view.contentDOM.addEventListener("beforeinput", read, true);
  view.dom.ownerDocument.execCommand("indent");
  view.contentDOM.removeEventListener("beforeinput", read, true);
  if (!found)
    return null;
  let anchorNode = found.startContainer, anchorOffset = found.startOffset;
  let focusNode = found.endContainer, focusOffset = found.endOffset;
  let curAnchor = view.docView.domAtPos(view.state.selection.main.anchor);
  if (isEquivalentPosition(curAnchor.node, curAnchor.offset, focusNode, focusOffset))
    [anchorNode, anchorOffset, focusNode, focusOffset] = [focusNode, focusOffset, anchorNode, anchorOffset];
  return { anchorNode, anchorOffset, focusNode, focusOffset };
}
class EditorView {
  /**
  Construct a new view. You'll want to either provide a `parent`
  option, or put `view.dom` into your document after creating a
  view, so that the user can see the editor.
  */
  constructor(config2 = {}) {
    this.plugins = [];
    this.pluginMap = /* @__PURE__ */ new Map();
    this.editorAttrs = {};
    this.contentAttrs = {};
    this.bidiCache = [];
    this.destroyed = false;
    this.updateState = 2;
    this.measureScheduled = -1;
    this.measureRequests = [];
    this.contentDOM = document.createElement("div");
    this.scrollDOM = document.createElement("div");
    this.scrollDOM.tabIndex = -1;
    this.scrollDOM.className = "cm-scroller";
    this.scrollDOM.appendChild(this.contentDOM);
    this.announceDOM = document.createElement("div");
    this.announceDOM.style.cssText = "position: fixed; top: -10000px";
    this.announceDOM.setAttribute("aria-live", "polite");
    this.dom = document.createElement("div");
    this.dom.appendChild(this.announceDOM);
    this.dom.appendChild(this.scrollDOM);
    this._dispatch = config2.dispatch || ((tr) => this.update([tr]));
    this.dispatch = this.dispatch.bind(this);
    this._root = config2.root || getRoot(config2.parent) || document;
    this.viewState = new ViewState(config2.state || EditorState.create(config2));
    this.plugins = this.state.facet(viewPlugin).map((spec) => new PluginInstance(spec));
    for (let plugin of this.plugins)
      plugin.update(this);
    this.observer = new DOMObserver(this);
    this.inputState = new InputState(this);
    this.inputState.ensureHandlers(this, this.plugins);
    this.docView = new DocView(this);
    this.mountStyles();
    this.updateAttrs();
    this.updateState = 0;
    this.requestMeasure();
    if (config2.parent)
      config2.parent.appendChild(this.dom);
  }
  /**
  The current editor state.
  */
  get state() {
    return this.viewState.state;
  }
  /**
  To be able to display large documents without consuming too much
  memory or overloading the browser, CodeMirror only draws the
  code that is visible (plus a margin around it) to the DOM. This
  property tells you the extent of the current drawn viewport, in
  document positions.
  */
  get viewport() {
    return this.viewState.viewport;
  }
  /**
  When there are, for example, large collapsed ranges in the
  viewport, its size can be a lot bigger than the actual visible
  content. Thus, if you are doing something like styling the
  content in the viewport, it is preferable to only do so for
  these ranges, which are the subset of the viewport that is
  actually drawn.
  */
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  /**
  Returns false when the editor is entirely scrolled out of view
  or otherwise hidden.
  */
  get inView() {
    return this.viewState.inView;
  }
  /**
  Indicates whether the user is currently composing text via
  [IME](https://en.wikipedia.org/wiki/Input_method), and at least
  one change has been made in the current composition.
  */
  get composing() {
    return this.inputState.composing > 0;
  }
  /**
  Indicates whether the user is currently in composing state. Note
  that on some platforms, like Android, this will be the case a
  lot, since just putting the cursor on a word starts a
  composition there.
  */
  get compositionStarted() {
    return this.inputState.composing >= 0;
  }
  /**
  The document or shadow root that the view lives in.
  */
  get root() {
    return this._root;
  }
  /**
  @internal
  */
  get win() {
    return this.dom.ownerDocument.defaultView || window;
  }
  dispatch(...input) {
    this._dispatch(input.length == 1 && input[0] instanceof Transaction ? input[0] : this.state.update(...input));
  }
  /**
  Update the view for the given array of transactions. This will
  update the visible document and selection to match the state
  produced by the transactions, and notify view plugins of the
  change. You should usually call
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
  as a primitive.
  */
  update(transactions) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let redrawn = false, attrsChanged = false, update;
    let state = this.state;
    for (let tr of transactions) {
      if (tr.startState != state)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      state = tr.state;
    }
    if (this.destroyed) {
      this.viewState.state = state;
      return;
    }
    let focus = this.hasFocus, focusFlag = 0, dispatchFocus = null;
    if (transactions.some((tr) => tr.annotation(isFocusChange))) {
      this.inputState.notifiedFocused = focus;
      focusFlag = 1;
    } else if (focus != this.inputState.notifiedFocused) {
      this.inputState.notifiedFocused = focus;
      dispatchFocus = focusChangeTransaction(state, focus);
      if (!dispatchFocus)
        focusFlag = 1;
    }
    let pendingKey = this.observer.delayedAndroidKey, domChange = null;
    if (pendingKey) {
      this.observer.clearDelayedAndroidKey();
      domChange = this.observer.readChange();
      if (domChange && !this.state.doc.eq(state.doc) || !this.state.selection.eq(state.selection))
        domChange = null;
    } else {
      this.observer.clear();
    }
    if (state.facet(EditorState.phrases) != this.state.facet(EditorState.phrases))
      return this.setState(state);
    update = ViewUpdate.create(this, state, transactions);
    update.flags |= focusFlag;
    let scrollTarget = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let tr of transactions) {
        if (scrollTarget)
          scrollTarget = scrollTarget.map(tr.changes);
        if (tr.scrollIntoView) {
          let { main } = tr.state.selection;
          scrollTarget = new ScrollTarget(main.empty ? main : EditorSelection.cursor(main.head, main.head > main.anchor ? -1 : 1));
        }
        for (let e of tr.effects)
          if (e.is(scrollIntoView$1))
            scrollTarget = e.value;
      }
      this.viewState.update(update, scrollTarget);
      this.bidiCache = CachedOrder.update(this.bidiCache, update.changes);
      if (!update.empty) {
        this.updatePlugins(update);
        this.inputState.update(update);
      }
      redrawn = this.docView.update(update);
      if (this.state.facet(styleModule) != this.styleModules)
        this.mountStyles();
      attrsChanged = this.updateAttrs();
      this.showAnnouncements(transactions);
      this.docView.updateSelection(redrawn, transactions.some((tr) => tr.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (update.startState.facet(theme) != update.state.facet(theme))
      this.viewState.mustMeasureContent = true;
    if (redrawn || attrsChanged || scrollTarget || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent)
      this.requestMeasure();
    if (!update.empty)
      for (let listener of this.state.facet(updateListener))
        listener(update);
    if (dispatchFocus || domChange)
      Promise.resolve().then(() => {
        if (dispatchFocus && this.state == dispatchFocus.startState)
          this.dispatch(dispatchFocus);
        if (domChange) {
          if (!applyDOMChange(this, domChange) && pendingKey.force)
            dispatchKey(this.contentDOM, pendingKey.key, pendingKey.keyCode);
        }
      });
  }
  /**
  Reset the view to the given state. (This will cause the entire
  document to be redrawn and all view plugins to be reinitialized,
  so you should probably only use it when the new state isn't
  derived from the old state. Otherwise, use
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
  */
  setState(newState) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    if (this.destroyed) {
      this.viewState.state = newState;
      return;
    }
    this.updateState = 2;
    let hadFocus = this.hasFocus;
    try {
      for (let plugin of this.plugins)
        plugin.destroy(this);
      this.viewState = new ViewState(newState);
      this.plugins = newState.facet(viewPlugin).map((spec) => new PluginInstance(spec));
      this.pluginMap.clear();
      for (let plugin of this.plugins)
        plugin.update(this);
      this.docView = new DocView(this);
      this.inputState.ensureHandlers(this, this.plugins);
      this.mountStyles();
      this.updateAttrs();
      this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    if (hadFocus)
      this.focus();
    this.requestMeasure();
  }
  updatePlugins(update) {
    let prevSpecs = update.startState.facet(viewPlugin), specs = update.state.facet(viewPlugin);
    if (prevSpecs != specs) {
      let newPlugins = [];
      for (let spec of specs) {
        let found = prevSpecs.indexOf(spec);
        if (found < 0) {
          newPlugins.push(new PluginInstance(spec));
        } else {
          let plugin = this.plugins[found];
          plugin.mustUpdate = update;
          newPlugins.push(plugin);
        }
      }
      for (let plugin of this.plugins)
        if (plugin.mustUpdate != update)
          plugin.destroy(this);
      this.plugins = newPlugins;
      this.pluginMap.clear();
      this.inputState.ensureHandlers(this, this.plugins);
    } else {
      for (let p of this.plugins)
        p.mustUpdate = update;
    }
    for (let i = 0; i < this.plugins.length; i++)
      this.plugins[i].update(this);
  }
  /**
  @internal
  */
  measure(flush = true) {
    if (this.destroyed)
      return;
    if (this.measureScheduled > -1)
      cancelAnimationFrame(this.measureScheduled);
    this.measureScheduled = 0;
    if (flush)
      this.observer.forceFlush();
    let updated = null;
    let { scrollHeight, scrollTop, clientHeight } = this.scrollDOM;
    let refHeight = scrollTop > scrollHeight - clientHeight - 4 ? scrollHeight : scrollTop;
    try {
      for (let i = 0; ; i++) {
        this.updateState = 1;
        let oldViewport = this.viewport;
        let refBlock = this.viewState.lineBlockAtHeight(refHeight);
        let changed = this.viewState.measure(this);
        if (!changed && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (i > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let measuring = [];
        if (!(changed & 4))
          [this.measureRequests, measuring] = [measuring, this.measureRequests];
        let measured = measuring.map((m) => {
          try {
            return m.read(this);
          } catch (e) {
            logException(this.state, e);
            return BadMeasure;
          }
        });
        let update = ViewUpdate.create(this, this.state, []), redrawn = false, scrolled = false;
        update.flags |= changed;
        if (!updated)
          updated = update;
        else
          updated.flags |= changed;
        this.updateState = 2;
        if (!update.empty) {
          this.updatePlugins(update);
          this.inputState.update(update);
          this.updateAttrs();
          redrawn = this.docView.update(update);
        }
        for (let i2 = 0; i2 < measuring.length; i2++)
          if (measured[i2] != BadMeasure) {
            try {
              let m = measuring[i2];
              if (m.write)
                m.write(measured[i2], this);
            } catch (e) {
              logException(this.state, e);
            }
          }
        if (this.viewState.editorHeight) {
          if (this.viewState.scrollTarget) {
            this.docView.scrollIntoView(this.viewState.scrollTarget);
            this.viewState.scrollTarget = null;
            scrolled = true;
          } else {
            let diff = this.viewState.lineBlockAt(refBlock.from).top - refBlock.top;
            if (diff > 1 || diff < -1) {
              this.scrollDOM.scrollTop += diff;
              scrolled = true;
            }
          }
        }
        if (redrawn)
          this.docView.updateSelection(true);
        if (this.viewport.from == oldViewport.from && this.viewport.to == oldViewport.to && !scrolled && this.measureRequests.length == 0)
          break;
      }
    } finally {
      this.updateState = 0;
      this.measureScheduled = -1;
    }
    if (updated && !updated.empty)
      for (let listener of this.state.facet(updateListener))
        listener(updated);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return baseThemeID + " " + (this.state.facet(darkTheme) ? baseDarkID : baseLightID) + " " + this.state.facet(theme);
  }
  updateAttrs() {
    let editorAttrs = attrsFromFacet(this, editorAttributes, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    });
    let contentAttrs = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      translate: "no",
      contenteditable: !this.state.facet(editable) ? "false" : "true",
      class: "cm-content",
      style: `${browser.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    if (this.state.readOnly)
      contentAttrs["aria-readonly"] = "true";
    attrsFromFacet(this, contentAttributes, contentAttrs);
    let changed = this.observer.ignore(() => {
      let changedContent = updateAttrs(this.contentDOM, this.contentAttrs, contentAttrs);
      let changedEditor = updateAttrs(this.dom, this.editorAttrs, editorAttrs);
      return changedContent || changedEditor;
    });
    this.editorAttrs = editorAttrs;
    this.contentAttrs = contentAttrs;
    return changed;
  }
  showAnnouncements(trs) {
    let first = true;
    for (let tr of trs)
      for (let effect of tr.effects)
        if (effect.is(EditorView.announce)) {
          if (first)
            this.announceDOM.textContent = "";
          first = false;
          let div = this.announceDOM.appendChild(document.createElement("div"));
          div.textContent = effect.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(styleModule);
    StyleModule.mount(this.root, this.styleModules.concat(baseTheme$1$3).reverse());
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    if (this.updateState == 0 && this.measureScheduled > -1)
      this.measure(false);
  }
  /**
  Schedule a layout measurement, optionally providing callbacks to
  do custom DOM measuring followed by a DOM write phase. Using
  this is preferable reading DOM layout directly from, for
  example, an event handler, because it'll make sure measuring and
  drawing done by other components is synchronized, avoiding
  unnecessary DOM layout computations.
  */
  requestMeasure(request) {
    if (this.measureScheduled < 0)
      this.measureScheduled = this.win.requestAnimationFrame(() => this.measure());
    if (request) {
      if (this.measureRequests.indexOf(request) > -1)
        return;
      if (request.key != null)
        for (let i = 0; i < this.measureRequests.length; i++) {
          if (this.measureRequests[i].key === request.key) {
            this.measureRequests[i] = request;
            return;
          }
        }
      this.measureRequests.push(request);
    }
  }
  /**
  Get the value of a specific plugin, if present. Note that
  plugins that crash can be dropped from a view, so even when you
  know you registered a given plugin, it is recommended to check
  the return value of this method.
  */
  plugin(plugin) {
    let known = this.pluginMap.get(plugin);
    if (known === void 0 || known && known.spec != plugin)
      this.pluginMap.set(plugin, known = this.plugins.find((p) => p.spec == plugin) || null);
    return known && known.update(this).value;
  }
  /**
  The top position of the document, in screen coordinates. This
  may be negative when the editor is scrolled down. Points
  directly to the top of the first line, not above the padding.
  */
  get documentTop() {
    return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
  }
  /**
  Reports the padding above and below the document.
  */
  get documentPadding() {
    return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
  }
  /**
  Find the text line or block widget at the given vertical
  position (which is interpreted as relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
  */
  elementAtHeight(height) {
    this.readMeasured();
    return this.viewState.elementAtHeight(height);
  }
  /**
  Find the line block (see
  [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) at the given
  height, again interpreted relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
  */
  lineBlockAtHeight(height) {
    this.readMeasured();
    return this.viewState.lineBlockAtHeight(height);
  }
  /**
  Get the extent and vertical position of all [line
  blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
  are relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
  */
  get viewportLineBlocks() {
    return this.viewState.viewportLines;
  }
  /**
  Find the line block around the given document position. A line
  block is a range delimited on both sides by either a
  non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line breaks, or the
  start/end of the document. It will usually just hold a line of
  text, but may be broken into multiple textblocks by block
  widgets.
  */
  lineBlockAt(pos) {
    return this.viewState.lineBlockAt(pos);
  }
  /**
  The editor's total content height.
  */
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  /**
  Move a cursor position by [grapheme
  cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
  the motion is away from the line start, or towards it. In
  bidirectional text, the line is traversed in visual order, using
  the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
  When the start position was the last one on the line, the
  returned position will be across the line break. If there is no
  further line, the original position is returned.
  
  By default, this method moves over a single cluster. The
  optional `by` argument can be used to move across more. It will
  be called with the first cluster as argument, and should return
  a predicate that determines, for each subsequent cluster,
  whether it should also be moved over.
  */
  moveByChar(start, forward, by) {
    return skipAtoms(this, start, moveByChar(this, start, forward, by));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(start, forward) {
    return skipAtoms(this, start, moveByChar(this, start, forward, (initial) => byGroup(this, start.head, initial)));
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(start, forward, includeWrap = true) {
    return moveToLineBoundary(this, start, forward, includeWrap);
  }
  /**
  Move a cursor position vertically. When `distance` isn't given,
  it defaults to moving to the next line (including wrapped
  lines). Otherwise, `distance` should provide a positive distance
  in pixels.
  
  When `start` has a
  [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
  motion will use that as a target horizontal position. Otherwise,
  the cursor's own horizontal position is used. The returned
  cursor will have its goal column set to whichever column was
  used.
  */
  moveVertically(start, forward, distance) {
    return skipAtoms(this, start, moveVertically(this, start, forward, distance));
  }
  /**
  Find the DOM parent node and offset (child offset if `node` is
  an element, character offset when it is a text node) at the
  given document position.
  
  Note that for positions that aren't currently in
  `visibleRanges`, the resulting DOM position isn't necessarily
  meaningful (it may just point before or after a placeholder
  element).
  */
  domAtPos(pos) {
    return this.docView.domAtPos(pos);
  }
  /**
  Find the document position at the given DOM node. Can be useful
  for associating positions with DOM events. Will raise an error
  when `node` isn't part of the editor content.
  */
  posAtDOM(node, offset = 0) {
    return this.docView.posFromDOM(node, offset);
  }
  posAtCoords(coords, precise = true) {
    this.readMeasured();
    return posAtCoords(this, coords, precise);
  }
  /**
  Get the screen coordinates at the given document position.
  `side` determines whether the coordinates are based on the
  element before (-1) or after (1) the position (if no element is
  available on the given side, the method will transparently use
  another strategy to get reasonable coordinates).
  */
  coordsAtPos(pos, side = 1) {
    this.readMeasured();
    let rect = this.docView.coordsAt(pos, side);
    if (!rect || rect.left == rect.right)
      return rect;
    let line = this.state.doc.lineAt(pos), order = this.bidiSpans(line);
    let span = order[BidiSpan.find(order, pos - line.from, -1, side)];
    return flattenRect(rect, span.dir == Direction.LTR == side > 0);
  }
  /**
  The default width of a character in the editor. May not
  accurately reflect the width of all characters (given variable
  width fonts or styling of invididual ranges).
  */
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  /**
  The default height of a line in the editor. May not be accurate
  for all lines.
  */
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  /**
  The text direction
  ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
  CSS property) of the editor's content element.
  */
  get textDirection() {
    return this.viewState.defaultTextDirection;
  }
  /**
  Find the text direction of the block at the given position, as
  assigned by CSS. If
  [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
  isn't enabled, or the given position is outside of the viewport,
  this will always return the same as
  [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
  this may trigger a DOM layout.
  */
  textDirectionAt(pos) {
    let perLine = this.state.facet(perLineTextDirection);
    if (!perLine || pos < this.viewport.from || pos > this.viewport.to)
      return this.textDirection;
    this.readMeasured();
    return this.docView.textDirectionAt(pos);
  }
  /**
  Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
  (as determined by the
  [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
  CSS property of its content element).
  */
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  /**
  Returns the bidirectional text structure of the given line
  (which should be in the current document) as an array of span
  objects. The order of these spans matches the [text
  direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
  left-to-right, the leftmost spans come first, otherwise the
  rightmost spans come first.
  */
  bidiSpans(line) {
    if (line.length > MaxBidiLine)
      return trivialOrder(line.length);
    let dir = this.textDirectionAt(line.from);
    for (let entry of this.bidiCache)
      if (entry.from == line.from && entry.dir == dir)
        return entry.order;
    let order = computeOrder(line.text, dir);
    this.bidiCache.push(new CachedOrder(line.from, line.to, dir, order));
    return order;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var _a2;
    return (this.dom.ownerDocument.hasFocus() || browser.safari && ((_a2 = this.inputState) === null || _a2 === void 0 ? void 0 : _a2.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      focusPreventScroll(this.contentDOM);
      this.docView.updateSelection();
    });
  }
  /**
  Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
  necessary when moving the editor's existing DOM to a new window or shadow root.
  */
  setRoot(root) {
    if (this._root != root) {
      this._root = root;
      this.observer.setWindow((root.nodeType == 9 ? root : root.ownerDocument).defaultView || window);
      this.mountStyles();
    }
  }
  /**
  Clean up this editor view, removing its element from the
  document, unregistering event handlers, and notifying
  plugins. The view instance can no longer be used after
  calling this.
  */
  destroy() {
    for (let plugin of this.plugins)
      plugin.destroy(this);
    this.plugins = [];
    this.inputState.destroy();
    this.dom.remove();
    this.observer.destroy();
    if (this.measureScheduled > -1)
      cancelAnimationFrame(this.measureScheduled);
    this.destroyed = true;
  }
  /**
  Returns an effect that can be
  [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
  cause it to scroll the given position or range into view.
  */
  static scrollIntoView(pos, options = {}) {
    return scrollIntoView$1.of(new ScrollTarget(typeof pos == "number" ? EditorSelection.cursor(pos) : pos, options.y, options.x, options.yMargin, options.xMargin));
  }
  /**
  Returns an extension that can be used to add DOM event handlers.
  The value should be an object mapping event names to handler
  functions. For any given event, such functions are ordered by
  extension precedence, and the first handler to return true will
  be assumed to have handled that event, and no other handlers or
  built-in behavior will be activated for it. These are registered
  on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
  for `scroll` handlers, which will be called any time the
  editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
  its parent nodes is scrolled.
  */
  static domEventHandlers(handlers2) {
    return ViewPlugin.define(() => ({}), { eventHandlers: handlers2 });
  }
  /**
  Create a theme extension. The first argument can be a
  [`style-mod`](https://github.com/marijnh/style-mod#documentation)
  style spec providing the styles for the theme. These will be
  prefixed with a generated class for the style.
  
  Because the selectors will be prefixed with a scope class, rule
  that directly match the editor's [wrapper
  element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
  added—need to be explicitly differentiated by adding an `&` to
  the selector for that element—for example
  `&.cm-focused`.
  
  When `dark` is set to true, the theme will be marked as dark,
  which will cause the `&dark` rules from [base
  themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
  `&light` when a light theme is active).
  */
  static theme(spec, options) {
    let prefix = StyleModule.newName();
    let result = [theme.of(prefix), styleModule.of(buildTheme(`.${prefix}`, spec))];
    if (options && options.dark)
      result.push(darkTheme.of(true));
    return result;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(spec) {
    return Prec.lowest(styleModule.of(buildTheme("." + baseThemeID, spec, lightDarkIDs)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(dom) {
    var _a2;
    let content2 = dom.querySelector(".cm-content");
    let cView = content2 && ContentView.get(content2) || ContentView.get(dom);
    return ((_a2 = cView === null || cView === void 0 ? void 0 : cView.rootView) === null || _a2 === void 0 ? void 0 : _a2.view) || null;
  }
}
EditorView.styleModule = styleModule;
EditorView.inputHandler = inputHandler$1;
EditorView.focusChangeEffect = focusChangeEffect;
EditorView.perLineTextDirection = perLineTextDirection;
EditorView.exceptionSink = exceptionSink;
EditorView.updateListener = updateListener;
EditorView.editable = editable;
EditorView.mouseSelectionStyle = mouseSelectionStyle;
EditorView.dragMovesSelection = dragMovesSelection$1;
EditorView.clickAddsSelectionRange = clickAddsSelectionRange;
EditorView.decorations = decorations;
EditorView.atomicRanges = atomicRanges;
EditorView.scrollMargins = scrollMargins;
EditorView.darkTheme = darkTheme;
EditorView.contentAttributes = contentAttributes;
EditorView.editorAttributes = editorAttributes;
EditorView.lineWrapping = /* @__PURE__ */ EditorView.contentAttributes.of({ "class": "cm-lineWrapping" });
EditorView.announce = /* @__PURE__ */ StateEffect.define();
const MaxBidiLine = 4096;
const BadMeasure = {};
class CachedOrder {
  constructor(from, to, dir, order) {
    this.from = from;
    this.to = to;
    this.dir = dir;
    this.order = order;
  }
  static update(cache2, changes) {
    if (changes.empty)
      return cache2;
    let result = [], lastDir = cache2.length ? cache2[cache2.length - 1].dir : Direction.LTR;
    for (let i = Math.max(0, cache2.length - 10); i < cache2.length; i++) {
      let entry = cache2[i];
      if (entry.dir == lastDir && !changes.touchesRange(entry.from, entry.to))
        result.push(new CachedOrder(changes.mapPos(entry.from, 1), changes.mapPos(entry.to, -1), entry.dir, entry.order));
    }
    return result;
  }
}
function attrsFromFacet(view, facet, base2) {
  for (let sources = view.state.facet(facet), i = sources.length - 1; i >= 0; i--) {
    let source = sources[i], value = typeof source == "function" ? source(view) : source;
    if (value)
      combineAttrs(value, base2);
  }
  return base2;
}
const currentPlatform = browser.mac ? "mac" : browser.windows ? "win" : browser.linux ? "linux" : "key";
function normalizeKeyName(name2, platform) {
  const parts = name2.split(/-(?!$)/);
  let result = parts[parts.length - 1];
  if (result == "Space")
    result = " ";
  let alt, ctrl, shift2, meta2;
  for (let i = 0; i < parts.length - 1; ++i) {
    const mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod))
      meta2 = true;
    else if (/^a(lt)?$/i.test(mod))
      alt = true;
    else if (/^(c|ctrl|control)$/i.test(mod))
      ctrl = true;
    else if (/^s(hift)?$/i.test(mod))
      shift2 = true;
    else if (/^mod$/i.test(mod)) {
      if (platform == "mac")
        meta2 = true;
      else
        ctrl = true;
    } else
      throw new Error("Unrecognized modifier name: " + mod);
  }
  if (alt)
    result = "Alt-" + result;
  if (ctrl)
    result = "Ctrl-" + result;
  if (meta2)
    result = "Meta-" + result;
  if (shift2)
    result = "Shift-" + result;
  return result;
}
function modifiers(name2, event, shift2) {
  if (event.altKey)
    name2 = "Alt-" + name2;
  if (event.ctrlKey)
    name2 = "Ctrl-" + name2;
  if (event.metaKey)
    name2 = "Meta-" + name2;
  if (shift2 !== false && event.shiftKey)
    name2 = "Shift-" + name2;
  return name2;
}
const handleKeyEvents = /* @__PURE__ */ Prec.default(/* @__PURE__ */ EditorView.domEventHandlers({
  keydown(event, view) {
    return runHandlers(getKeymap(view.state), event, view, "editor");
  }
}));
const keymap = /* @__PURE__ */ Facet.define({ enables: handleKeyEvents });
const Keymaps = /* @__PURE__ */ new WeakMap();
function getKeymap(state) {
  let bindings = state.facet(keymap);
  let map = Keymaps.get(bindings);
  if (!map)
    Keymaps.set(bindings, map = buildKeymap(bindings.reduce((a, b) => a.concat(b), [])));
  return map;
}
function runScopeHandlers(view, event, scope) {
  return runHandlers(getKeymap(view.state), event, view, scope);
}
let storedPrefix = null;
const PrefixTimeout = 4e3;
function buildKeymap(bindings, platform = currentPlatform) {
  let bound = /* @__PURE__ */ Object.create(null);
  let isPrefix = /* @__PURE__ */ Object.create(null);
  let checkPrefix = (name2, is) => {
    let current = isPrefix[name2];
    if (current == null)
      isPrefix[name2] = is;
    else if (current != is)
      throw new Error("Key binding " + name2 + " is used both as a regular binding and as a multi-stroke prefix");
  };
  let add2 = (scope, key, command2, preventDefault) => {
    var _a2, _b;
    let scopeObj = bound[scope] || (bound[scope] = /* @__PURE__ */ Object.create(null));
    let parts = key.split(/ (?!$)/).map((k) => normalizeKeyName(k, platform));
    for (let i = 1; i < parts.length; i++) {
      let prefix = parts.slice(0, i).join(" ");
      checkPrefix(prefix, true);
      if (!scopeObj[prefix])
        scopeObj[prefix] = {
          preventDefault: true,
          run: [(view) => {
            let ourObj = storedPrefix = { view, prefix, scope };
            setTimeout(() => {
              if (storedPrefix == ourObj)
                storedPrefix = null;
            }, PrefixTimeout);
            return true;
          }]
        };
    }
    let full = parts.join(" ");
    checkPrefix(full, false);
    let binding = scopeObj[full] || (scopeObj[full] = { preventDefault: false, run: ((_b = (_a2 = scopeObj._any) === null || _a2 === void 0 ? void 0 : _a2.run) === null || _b === void 0 ? void 0 : _b.slice()) || [] });
    if (command2)
      binding.run.push(command2);
    if (preventDefault)
      binding.preventDefault = true;
  };
  for (let b of bindings) {
    let scopes = b.scope ? b.scope.split(" ") : ["editor"];
    if (b.any)
      for (let scope of scopes) {
        let scopeObj = bound[scope] || (bound[scope] = /* @__PURE__ */ Object.create(null));
        if (!scopeObj._any)
          scopeObj._any = { preventDefault: false, run: [] };
        for (let key in scopeObj)
          scopeObj[key].run.push(b.any);
      }
    let name2 = b[platform] || b.key;
    if (!name2)
      continue;
    for (let scope of scopes) {
      add2(scope, name2, b.run, b.preventDefault);
      if (b.shift)
        add2(scope, "Shift-" + name2, b.shift, b.preventDefault);
    }
  }
  return bound;
}
function runHandlers(map, event, view, scope) {
  let name2 = keyName(event);
  let charCode = codePointAt(name2, 0), isChar = codePointSize(charCode) == name2.length && name2 != " ";
  let prefix = "", fallthrough = false;
  if (storedPrefix && storedPrefix.view == view && storedPrefix.scope == scope) {
    prefix = storedPrefix.prefix + " ";
    if (fallthrough = modifierCodes.indexOf(event.keyCode) < 0)
      storedPrefix = null;
  }
  let ran = /* @__PURE__ */ new Set();
  let runFor = (binding) => {
    if (binding) {
      for (let cmd2 of binding.run)
        if (!ran.has(cmd2)) {
          ran.add(cmd2);
          if (cmd2(view, event))
            return true;
        }
      if (binding.preventDefault)
        fallthrough = true;
    }
    return false;
  };
  let scopeObj = map[scope], baseName, shiftName;
  if (scopeObj) {
    if (runFor(scopeObj[prefix + modifiers(name2, event, !isChar)]))
      return true;
    if (isChar && (event.altKey || event.metaKey || event.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
    !(browser.windows && event.ctrlKey && event.altKey) && (baseName = base[event.keyCode]) && baseName != name2) {
      if (runFor(scopeObj[prefix + modifiers(baseName, event, true)]))
        return true;
      else if (event.shiftKey && (shiftName = shift[event.keyCode]) != name2 && shiftName != baseName && runFor(scopeObj[prefix + modifiers(shiftName, event, false)]))
        return true;
    } else if (isChar && event.shiftKey) {
      if (runFor(scopeObj[prefix + modifiers(name2, event, true)]))
        return true;
    }
    if (runFor(scopeObj._any))
      return true;
  }
  return fallthrough;
}
class RectangleMarker {
  /**
  Create a marker with the given class and dimensions. If `width`
  is null, the DOM element will get no width style.
  */
  constructor(className, left, top2, width, height) {
    this.className = className;
    this.left = left;
    this.top = top2;
    this.width = width;
    this.height = height;
  }
  draw() {
    let elt = document.createElement("div");
    elt.className = this.className;
    this.adjust(elt);
    return elt;
  }
  update(elt, prev) {
    if (prev.className != this.className)
      return false;
    this.adjust(elt);
    return true;
  }
  adjust(elt) {
    elt.style.left = this.left + "px";
    elt.style.top = this.top + "px";
    if (this.width != null)
      elt.style.width = this.width + "px";
    elt.style.height = this.height + "px";
  }
  eq(p) {
    return this.left == p.left && this.top == p.top && this.width == p.width && this.height == p.height && this.className == p.className;
  }
  /**
  Create a set of rectangles for the given selection range,
  assigning them theclass`className`. Will create a single
  rectangle for empty ranges, and a set of selection-style
  rectangles covering the range's content (in a bidi-aware
  way) for non-empty ones.
  */
  static forRange(view, className, range) {
    if (range.empty) {
      let pos = view.coordsAtPos(range.head, range.assoc || 1);
      if (!pos)
        return [];
      let base2 = getBase(view);
      return [new RectangleMarker(className, pos.left - base2.left, pos.top - base2.top, null, pos.bottom - pos.top)];
    } else {
      return rectanglesForRange(view, className, range);
    }
  }
}
function getBase(view) {
  let rect = view.scrollDOM.getBoundingClientRect();
  let left = view.textDirection == Direction.LTR ? rect.left : rect.right - view.scrollDOM.clientWidth;
  return { left: left - view.scrollDOM.scrollLeft, top: rect.top - view.scrollDOM.scrollTop };
}
function wrappedLine(view, pos, inside2) {
  let range = EditorSelection.cursor(pos);
  return {
    from: Math.max(inside2.from, view.moveToLineBoundary(range, false, true).from),
    to: Math.min(inside2.to, view.moveToLineBoundary(range, true, true).from),
    type: BlockType.Text
  };
}
function blockAt(view, pos) {
  let line = view.lineBlockAt(pos);
  if (Array.isArray(line.type))
    for (let l of line.type) {
      if (l.to > pos || l.to == pos && (l.to == line.to || l.type == BlockType.Text))
        return l;
    }
  return line;
}
function rectanglesForRange(view, className, range) {
  if (range.to <= view.viewport.from || range.from >= view.viewport.to)
    return [];
  let from = Math.max(range.from, view.viewport.from), to = Math.min(range.to, view.viewport.to);
  let ltr = view.textDirection == Direction.LTR;
  let content2 = view.contentDOM, contentRect = content2.getBoundingClientRect(), base2 = getBase(view);
  let lineStyle = window.getComputedStyle(content2.firstChild);
  let leftSide = contentRect.left + parseInt(lineStyle.paddingLeft) + Math.min(0, parseInt(lineStyle.textIndent));
  let rightSide = contentRect.right - parseInt(lineStyle.paddingRight);
  let startBlock = blockAt(view, from), endBlock = blockAt(view, to);
  let visualStart = startBlock.type == BlockType.Text ? startBlock : null;
  let visualEnd = endBlock.type == BlockType.Text ? endBlock : null;
  if (view.lineWrapping) {
    if (visualStart)
      visualStart = wrappedLine(view, from, visualStart);
    if (visualEnd)
      visualEnd = wrappedLine(view, to, visualEnd);
  }
  if (visualStart && visualEnd && visualStart.from == visualEnd.from) {
    return pieces(drawForLine(range.from, range.to, visualStart));
  } else {
    let top2 = visualStart ? drawForLine(range.from, null, visualStart) : drawForWidget(startBlock, false);
    let bottom = visualEnd ? drawForLine(null, range.to, visualEnd) : drawForWidget(endBlock, true);
    let between = [];
    if ((visualStart || startBlock).to < (visualEnd || endBlock).from - 1)
      between.push(piece(leftSide, top2.bottom, rightSide, bottom.top));
    else if (top2.bottom < bottom.top && view.elementAtHeight((top2.bottom + bottom.top) / 2).type == BlockType.Text)
      top2.bottom = bottom.top = (top2.bottom + bottom.top) / 2;
    return pieces(top2).concat(between).concat(pieces(bottom));
  }
  function piece(left, top2, right, bottom) {
    return new RectangleMarker(
      className,
      left - base2.left,
      top2 - base2.top - 0.01,
      right - left,
      bottom - top2 + 0.01
      /* C.Epsilon */
    );
  }
  function pieces({ top: top2, bottom, horizontal }) {
    let pieces2 = [];
    for (let i = 0; i < horizontal.length; i += 2)
      pieces2.push(piece(horizontal[i], top2, horizontal[i + 1], bottom));
    return pieces2;
  }
  function drawForLine(from2, to2, line) {
    let top2 = 1e9, bottom = -1e9, horizontal = [];
    function addSpan(from3, fromOpen, to3, toOpen, dir) {
      let fromCoords = view.coordsAtPos(from3, from3 == line.to ? -2 : 2);
      let toCoords = view.coordsAtPos(to3, to3 == line.from ? 2 : -2);
      top2 = Math.min(fromCoords.top, toCoords.top, top2);
      bottom = Math.max(fromCoords.bottom, toCoords.bottom, bottom);
      if (dir == Direction.LTR)
        horizontal.push(ltr && fromOpen ? leftSide : fromCoords.left, ltr && toOpen ? rightSide : toCoords.right);
      else
        horizontal.push(!ltr && toOpen ? leftSide : toCoords.left, !ltr && fromOpen ? rightSide : fromCoords.right);
    }
    let start = from2 !== null && from2 !== void 0 ? from2 : line.from, end = to2 !== null && to2 !== void 0 ? to2 : line.to;
    for (let r of view.visibleRanges)
      if (r.to > start && r.from < end) {
        for (let pos = Math.max(r.from, start), endPos = Math.min(r.to, end); ; ) {
          let docLine = view.state.doc.lineAt(pos);
          for (let span of view.bidiSpans(docLine)) {
            let spanFrom = span.from + docLine.from, spanTo = span.to + docLine.from;
            if (spanFrom >= endPos)
              break;
            if (spanTo > pos)
              addSpan(Math.max(spanFrom, pos), from2 == null && spanFrom <= start, Math.min(spanTo, endPos), to2 == null && spanTo >= end, span.dir);
          }
          pos = docLine.to + 1;
          if (pos >= endPos)
            break;
        }
      }
    if (horizontal.length == 0)
      addSpan(start, from2 == null, end, to2 == null, view.textDirection);
    return { top: top2, bottom, horizontal };
  }
  function drawForWidget(block, top2) {
    let y = contentRect.top + (top2 ? block.top : block.bottom);
    return { top: y, bottom: y, horizontal: [] };
  }
}
function sameMarker(a, b) {
  return a.constructor == b.constructor && a.eq(b);
}
class LayerView {
  constructor(view, layer2) {
    this.view = view;
    this.layer = layer2;
    this.drawn = [];
    this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) };
    this.dom = view.scrollDOM.appendChild(document.createElement("div"));
    this.dom.classList.add("cm-layer");
    if (layer2.above)
      this.dom.classList.add("cm-layer-above");
    if (layer2.class)
      this.dom.classList.add(layer2.class);
    this.dom.setAttribute("aria-hidden", "true");
    this.setOrder(view.state);
    view.requestMeasure(this.measureReq);
    if (layer2.mount)
      layer2.mount(this.dom, view);
  }
  update(update) {
    if (update.startState.facet(layerOrder) != update.state.facet(layerOrder))
      this.setOrder(update.state);
    if (this.layer.update(update, this.dom) || update.geometryChanged)
      update.view.requestMeasure(this.measureReq);
  }
  setOrder(state) {
    let pos = 0, order = state.facet(layerOrder);
    while (pos < order.length && order[pos] != this.layer)
      pos++;
    this.dom.style.zIndex = String((this.layer.above ? 150 : -1) - pos);
  }
  measure() {
    return this.layer.markers(this.view);
  }
  draw(markers) {
    if (markers.length != this.drawn.length || markers.some((p, i) => !sameMarker(p, this.drawn[i]))) {
      let old = this.dom.firstChild, oldI = 0;
      for (let marker of markers) {
        if (marker.update && old && marker.constructor && this.drawn[oldI].constructor && marker.update(old, this.drawn[oldI])) {
          old = old.nextSibling;
          oldI++;
        } else {
          this.dom.insertBefore(marker.draw(), old);
        }
      }
      while (old) {
        let next = old.nextSibling;
        old.remove();
        old = next;
      }
      this.drawn = markers;
    }
  }
  destroy() {
    if (this.layer.destroy)
      this.layer.destroy(this.dom, this.view);
    this.dom.remove();
  }
}
const layerOrder = /* @__PURE__ */ Facet.define();
function layer(config2) {
  return [
    ViewPlugin.define((v) => new LayerView(v, config2)),
    layerOrder.of(config2)
  ];
}
const CanHidePrimary = !browser.ios;
const selectionConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      cursorBlinkRate: 1200,
      drawRangeCursor: true
    }, {
      cursorBlinkRate: (a, b) => Math.min(a, b),
      drawRangeCursor: (a, b) => a || b
    });
  }
});
function drawSelection(config2 = {}) {
  return [
    selectionConfig.of(config2),
    cursorLayer,
    selectionLayer,
    hideNativeSelection,
    nativeSelectionHidden.of(true)
  ];
}
function configChanged(update) {
  return update.startState.facet(selectionConfig) != update.state.facet(selectionConfig);
}
const cursorLayer = /* @__PURE__ */ layer({
  above: true,
  markers(view) {
    let { state } = view, conf = state.facet(selectionConfig);
    let cursors = [];
    for (let r of state.selection.ranges) {
      let prim = r == state.selection.main;
      if (r.empty ? !prim || CanHidePrimary : conf.drawRangeCursor) {
        let className = prim ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary";
        let cursor = r.empty ? r : EditorSelection.cursor(r.head, r.head > r.anchor ? -1 : 1);
        for (let piece of RectangleMarker.forRange(view, className, cursor))
          cursors.push(piece);
      }
    }
    return cursors;
  },
  update(update, dom) {
    if (update.transactions.some((tr) => tr.selection))
      dom.style.animationName = dom.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink";
    let confChange = configChanged(update);
    if (confChange)
      setBlinkRate(update.state, dom);
    return update.docChanged || update.selectionSet || confChange;
  },
  mount(dom, view) {
    setBlinkRate(view.state, dom);
  },
  class: "cm-cursorLayer"
});
function setBlinkRate(state, dom) {
  dom.style.animationDuration = state.facet(selectionConfig).cursorBlinkRate + "ms";
}
const selectionLayer = /* @__PURE__ */ layer({
  above: false,
  markers(view) {
    return view.state.selection.ranges.map((r) => r.empty ? [] : RectangleMarker.forRange(view, "cm-selectionBackground", r)).reduce((a, b) => a.concat(b));
  },
  update(update, dom) {
    return update.docChanged || update.selectionSet || update.viewportChanged || configChanged(update);
  },
  class: "cm-selectionLayer"
});
const themeSpec = {
  ".cm-line": {
    "& ::selection": { backgroundColor: "transparent !important" },
    "&::selection": { backgroundColor: "transparent !important" }
  }
};
if (CanHidePrimary)
  themeSpec[".cm-line"].caretColor = "transparent !important";
const hideNativeSelection = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ EditorView.theme(themeSpec));
const setDropCursorPos = /* @__PURE__ */ StateEffect.define({
  map(pos, mapping) {
    return pos == null ? null : mapping.mapPos(pos);
  }
});
const dropCursorPos = /* @__PURE__ */ StateField.define({
  create() {
    return null;
  },
  update(pos, tr) {
    if (pos != null)
      pos = tr.changes.mapPos(pos);
    return tr.effects.reduce((pos2, e) => e.is(setDropCursorPos) ? e.value : pos2, pos);
  }
});
const drawDropCursor = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.cursor = null;
    this.measureReq = { read: this.readPos.bind(this), write: this.drawCursor.bind(this) };
  }
  update(update) {
    var _a2;
    let cursorPos = update.state.field(dropCursorPos);
    if (cursorPos == null) {
      if (this.cursor != null) {
        (_a2 = this.cursor) === null || _a2 === void 0 ? void 0 : _a2.remove();
        this.cursor = null;
      }
    } else {
      if (!this.cursor) {
        this.cursor = this.view.scrollDOM.appendChild(document.createElement("div"));
        this.cursor.className = "cm-dropCursor";
      }
      if (update.startState.field(dropCursorPos) != cursorPos || update.docChanged || update.geometryChanged)
        this.view.requestMeasure(this.measureReq);
    }
  }
  readPos() {
    let pos = this.view.state.field(dropCursorPos);
    let rect = pos != null && this.view.coordsAtPos(pos);
    if (!rect)
      return null;
    let outer = this.view.scrollDOM.getBoundingClientRect();
    return {
      left: rect.left - outer.left + this.view.scrollDOM.scrollLeft,
      top: rect.top - outer.top + this.view.scrollDOM.scrollTop,
      height: rect.bottom - rect.top
    };
  }
  drawCursor(pos) {
    if (this.cursor) {
      if (pos) {
        this.cursor.style.left = pos.left + "px";
        this.cursor.style.top = pos.top + "px";
        this.cursor.style.height = pos.height + "px";
      } else {
        this.cursor.style.left = "-100000px";
      }
    }
  }
  destroy() {
    if (this.cursor)
      this.cursor.remove();
  }
  setDropPos(pos) {
    if (this.view.state.field(dropCursorPos) != pos)
      this.view.dispatch({ effects: setDropCursorPos.of(pos) });
  }
}, {
  eventHandlers: {
    dragover(event) {
      this.setDropPos(this.view.posAtCoords({ x: event.clientX, y: event.clientY }));
    },
    dragleave(event) {
      if (event.target == this.view.contentDOM || !this.view.contentDOM.contains(event.relatedTarget))
        this.setDropPos(null);
    },
    dragend() {
      this.setDropPos(null);
    },
    drop() {
      this.setDropPos(null);
    }
  }
});
function dropCursor() {
  return [dropCursorPos, drawDropCursor];
}
function iterMatches(doc2, re, from, to, f) {
  re.lastIndex = 0;
  for (let cursor = doc2.iterRange(from, to), pos = from, m; !cursor.next().done; pos += cursor.value.length) {
    if (!cursor.lineBreak)
      while (m = re.exec(cursor.value))
        f(pos + m.index, m);
  }
}
function matchRanges(view, maxLength) {
  let visible = view.visibleRanges;
  if (visible.length == 1 && visible[0].from == view.viewport.from && visible[0].to == view.viewport.to)
    return visible;
  let result = [];
  for (let { from, to } of visible) {
    from = Math.max(view.state.doc.lineAt(from).from, from - maxLength);
    to = Math.min(view.state.doc.lineAt(to).to, to + maxLength);
    if (result.length && result[result.length - 1].to >= from)
      result[result.length - 1].to = to;
    else
      result.push({ from, to });
  }
  return result;
}
class MatchDecorator {
  /**
  Create a decorator.
  */
  constructor(config2) {
    const { regexp, decoration, decorate, boundary, maxLength = 1e3 } = config2;
    if (!regexp.global)
      throw new RangeError("The regular expression given to MatchDecorator should have its 'g' flag set");
    this.regexp = regexp;
    if (decorate) {
      this.addMatch = (match, view, from, add2) => decorate(add2, from, from + match[0].length, match, view);
    } else if (typeof decoration == "function") {
      this.addMatch = (match, view, from, add2) => {
        let deco = decoration(match, view, from);
        if (deco)
          add2(from, from + match[0].length, deco);
      };
    } else if (decoration) {
      this.addMatch = (match, _view, from, add2) => add2(from, from + match[0].length, decoration);
    } else {
      throw new RangeError("Either 'decorate' or 'decoration' should be provided to MatchDecorator");
    }
    this.boundary = boundary;
    this.maxLength = maxLength;
  }
  /**
  Compute the full set of decorations for matches in the given
  view's viewport. You'll want to call this when initializing your
  plugin.
  */
  createDeco(view) {
    let build = new RangeSetBuilder(), add2 = build.add.bind(build);
    for (let { from, to } of matchRanges(view, this.maxLength))
      iterMatches(view.state.doc, this.regexp, from, to, (from2, m) => this.addMatch(m, view, from2, add2));
    return build.finish();
  }
  /**
  Update a set of decorations for a view update. `deco` _must_ be
  the set of decorations produced by _this_ `MatchDecorator` for
  the view state before the update.
  */
  updateDeco(update, deco) {
    let changeFrom = 1e9, changeTo = -1;
    if (update.docChanged)
      update.changes.iterChanges((_f, _t, from, to) => {
        if (to > update.view.viewport.from && from < update.view.viewport.to) {
          changeFrom = Math.min(from, changeFrom);
          changeTo = Math.max(to, changeTo);
        }
      });
    if (update.viewportChanged || changeTo - changeFrom > 1e3)
      return this.createDeco(update.view);
    if (changeTo > -1)
      return this.updateRange(update.view, deco.map(update.changes), changeFrom, changeTo);
    return deco;
  }
  updateRange(view, deco, updateFrom, updateTo) {
    for (let r of view.visibleRanges) {
      let from = Math.max(r.from, updateFrom), to = Math.min(r.to, updateTo);
      if (to > from) {
        let fromLine = view.state.doc.lineAt(from), toLine = fromLine.to < to ? view.state.doc.lineAt(to) : fromLine;
        let start = Math.max(r.from, fromLine.from), end = Math.min(r.to, toLine.to);
        if (this.boundary) {
          for (; from > fromLine.from; from--)
            if (this.boundary.test(fromLine.text[from - 1 - fromLine.from])) {
              start = from;
              break;
            }
          for (; to < toLine.to; to++)
            if (this.boundary.test(toLine.text[to - toLine.from])) {
              end = to;
              break;
            }
        }
        let ranges = [], m;
        let add2 = (from2, to2, deco2) => ranges.push(deco2.range(from2, to2));
        if (fromLine == toLine) {
          this.regexp.lastIndex = start - fromLine.from;
          while ((m = this.regexp.exec(fromLine.text)) && m.index < end - fromLine.from)
            this.addMatch(m, view, m.index + fromLine.from, add2);
        } else {
          iterMatches(view.state.doc, this.regexp, start, end, (from2, m2) => this.addMatch(m2, view, from2, add2));
        }
        deco = deco.update({ filterFrom: start, filterTo: end, filter: (from2, to2) => from2 < start || to2 > end, add: ranges });
      }
    }
    return deco;
  }
}
const UnicodeRegexpSupport = /x/.unicode != null ? "gu" : "g";
const Specials = /* @__PURE__ */ new RegExp("[\0-\b\n--­؜​‎‏\u2028\u2029‭‮⁦⁧⁩\uFEFF￹-￼]", UnicodeRegexpSupport);
const Names = {
  0: "null",
  7: "bell",
  8: "backspace",
  10: "newline",
  11: "vertical tab",
  13: "carriage return",
  27: "escape",
  8203: "zero width space",
  8204: "zero width non-joiner",
  8205: "zero width joiner",
  8206: "left-to-right mark",
  8207: "right-to-left mark",
  8232: "line separator",
  8237: "left-to-right override",
  8238: "right-to-left override",
  8294: "left-to-right isolate",
  8295: "right-to-left isolate",
  8297: "pop directional isolate",
  8233: "paragraph separator",
  65279: "zero width no-break space",
  65532: "object replacement"
};
let _supportsTabSize = null;
function supportsTabSize() {
  var _a2;
  if (_supportsTabSize == null && typeof document != "undefined" && document.body) {
    let styles = document.body.style;
    _supportsTabSize = ((_a2 = styles.tabSize) !== null && _a2 !== void 0 ? _a2 : styles.MozTabSize) != null;
  }
  return _supportsTabSize || false;
}
const specialCharConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    let config2 = combineConfig(configs, {
      render: null,
      specialChars: Specials,
      addSpecialChars: null
    });
    if (config2.replaceTabs = !supportsTabSize())
      config2.specialChars = new RegExp("	|" + config2.specialChars.source, UnicodeRegexpSupport);
    if (config2.addSpecialChars)
      config2.specialChars = new RegExp(config2.specialChars.source + "|" + config2.addSpecialChars.source, UnicodeRegexpSupport);
    return config2;
  }
});
function highlightSpecialChars(config2 = {}) {
  return [specialCharConfig.of(config2), specialCharPlugin()];
}
let _plugin = null;
function specialCharPlugin() {
  return _plugin || (_plugin = ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.decorations = Decoration.none;
      this.decorationCache = /* @__PURE__ */ Object.create(null);
      this.decorator = this.makeDecorator(view.state.facet(specialCharConfig));
      this.decorations = this.decorator.createDeco(view);
    }
    makeDecorator(conf) {
      return new MatchDecorator({
        regexp: conf.specialChars,
        decoration: (m, view, pos) => {
          let { doc: doc2 } = view.state;
          let code2 = codePointAt(m[0], 0);
          if (code2 == 9) {
            let line = doc2.lineAt(pos);
            let size = view.state.tabSize, col = countColumn(line.text, size, pos - line.from);
            return Decoration.replace({ widget: new TabWidget((size - col % size) * this.view.defaultCharacterWidth) });
          }
          return this.decorationCache[code2] || (this.decorationCache[code2] = Decoration.replace({ widget: new SpecialCharWidget(conf, code2) }));
        },
        boundary: conf.replaceTabs ? void 0 : /[^]/
      });
    }
    update(update) {
      let conf = update.state.facet(specialCharConfig);
      if (update.startState.facet(specialCharConfig) != conf) {
        this.decorator = this.makeDecorator(conf);
        this.decorations = this.decorator.createDeco(update.view);
      } else {
        this.decorations = this.decorator.updateDeco(update, this.decorations);
      }
    }
  }, {
    decorations: (v) => v.decorations
  }));
}
const DefaultPlaceholder = "•";
function placeholder$1(code2) {
  if (code2 >= 32)
    return DefaultPlaceholder;
  if (code2 == 10)
    return "␤";
  return String.fromCharCode(9216 + code2);
}
class SpecialCharWidget extends WidgetType {
  constructor(options, code2) {
    super();
    this.options = options;
    this.code = code2;
  }
  eq(other) {
    return other.code == this.code;
  }
  toDOM(view) {
    let ph = placeholder$1(this.code);
    let desc = view.state.phrase("Control character") + " " + (Names[this.code] || "0x" + this.code.toString(16));
    let custom = this.options.render && this.options.render(this.code, desc, ph);
    if (custom)
      return custom;
    let span = document.createElement("span");
    span.textContent = ph;
    span.title = desc;
    span.setAttribute("aria-label", desc);
    span.className = "cm-specialChar";
    return span;
  }
  ignoreEvent() {
    return false;
  }
}
class TabWidget extends WidgetType {
  constructor(width) {
    super();
    this.width = width;
  }
  eq(other) {
    return other.width == this.width;
  }
  toDOM() {
    let span = document.createElement("span");
    span.textContent = "	";
    span.className = "cm-tab";
    span.style.width = this.width + "px";
    return span;
  }
  ignoreEvent() {
    return false;
  }
}
function highlightActiveLine() {
  return activeLineHighlighter;
}
const lineDeco = /* @__PURE__ */ Decoration.line({ class: "cm-activeLine" });
const activeLineHighlighter = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = this.getDeco(view);
  }
  update(update) {
    if (update.docChanged || update.selectionSet)
      this.decorations = this.getDeco(update.view);
  }
  getDeco(view) {
    let lastLineStart = -1, deco = [];
    for (let r of view.state.selection.ranges) {
      let line = view.lineBlockAt(r.head);
      if (line.from > lastLineStart) {
        deco.push(lineDeco.range(line.from));
        lastLineStart = line.from;
      }
    }
    return Decoration.set(deco);
  }
}, {
  decorations: (v) => v.decorations
});
const MaxOff = 2e3;
function rectangleFor(state, a, b) {
  let startLine = Math.min(a.line, b.line), endLine = Math.max(a.line, b.line);
  let ranges = [];
  if (a.off > MaxOff || b.off > MaxOff || a.col < 0 || b.col < 0) {
    let startOff = Math.min(a.off, b.off), endOff = Math.max(a.off, b.off);
    for (let i = startLine; i <= endLine; i++) {
      let line = state.doc.line(i);
      if (line.length <= endOff)
        ranges.push(EditorSelection.range(line.from + startOff, line.to + endOff));
    }
  } else {
    let startCol = Math.min(a.col, b.col), endCol = Math.max(a.col, b.col);
    for (let i = startLine; i <= endLine; i++) {
      let line = state.doc.line(i);
      let start = findColumn(line.text, startCol, state.tabSize, true);
      if (start < 0) {
        ranges.push(EditorSelection.cursor(line.to));
      } else {
        let end = findColumn(line.text, endCol, state.tabSize);
        ranges.push(EditorSelection.range(line.from + start, line.from + end));
      }
    }
  }
  return ranges;
}
function absoluteColumn(view, x) {
  let ref = view.coordsAtPos(view.viewport.from);
  return ref ? Math.round(Math.abs((ref.left - x) / view.defaultCharacterWidth)) : -1;
}
function getPos(view, event) {
  let offset = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
  let line = view.state.doc.lineAt(offset), off = offset - line.from;
  let col = off > MaxOff ? -1 : off == line.length ? absoluteColumn(view, event.clientX) : countColumn(line.text, view.state.tabSize, offset - line.from);
  return { line: line.number, col, off };
}
function rectangleSelectionStyle(view, event) {
  let start = getPos(view, event), startSel = view.state.selection;
  if (!start)
    return null;
  return {
    update(update) {
      if (update.docChanged) {
        let newStart = update.changes.mapPos(update.startState.doc.line(start.line).from);
        let newLine = update.state.doc.lineAt(newStart);
        start = { line: newLine.number, col: start.col, off: Math.min(start.off, newLine.length) };
        startSel = startSel.map(update.changes);
      }
    },
    get(event2, _extend, multiple) {
      let cur2 = getPos(view, event2);
      if (!cur2)
        return startSel;
      let ranges = rectangleFor(view.state, start, cur2);
      if (!ranges.length)
        return startSel;
      if (multiple)
        return EditorSelection.create(ranges.concat(startSel.ranges));
      else
        return EditorSelection.create(ranges);
    }
  };
}
function rectangularSelection(options) {
  let filter = (options === null || options === void 0 ? void 0 : options.eventFilter) || ((e) => e.altKey && e.button == 0);
  return EditorView.mouseSelectionStyle.of((view, event) => filter(event) ? rectangleSelectionStyle(view, event) : null);
}
const keys = {
  Alt: [18, (e) => e.altKey],
  Control: [17, (e) => e.ctrlKey],
  Shift: [16, (e) => e.shiftKey],
  Meta: [91, (e) => e.metaKey]
};
const showCrosshair = { style: "cursor: crosshair" };
function crosshairCursor(options = {}) {
  let [code2, getter] = keys[options.key || "Alt"];
  let plugin = ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.isDown = false;
    }
    set(isDown) {
      if (this.isDown != isDown) {
        this.isDown = isDown;
        this.view.update([]);
      }
    }
  }, {
    eventHandlers: {
      keydown(e) {
        this.set(e.keyCode == code2 || getter(e));
      },
      keyup(e) {
        if (e.keyCode == code2 || !getter(e))
          this.set(false);
      },
      mousemove(e) {
        this.set(getter(e));
      }
    }
  });
  return [
    plugin,
    EditorView.contentAttributes.of((view) => {
      var _a2;
      return ((_a2 = view.plugin(plugin)) === null || _a2 === void 0 ? void 0 : _a2.isDown) ? showCrosshair : null;
    })
  ];
}
const Outside = "-10000px";
class TooltipViewManager {
  constructor(view, facet, createTooltipView) {
    this.facet = facet;
    this.createTooltipView = createTooltipView;
    this.input = view.state.facet(facet);
    this.tooltips = this.input.filter((t2) => t2);
    this.tooltipViews = this.tooltips.map(createTooltipView);
  }
  update(update) {
    var _a2;
    let input = update.state.facet(this.facet);
    let tooltips = input.filter((x) => x);
    if (input === this.input) {
      for (let t2 of this.tooltipViews)
        if (t2.update)
          t2.update(update);
      return false;
    }
    let tooltipViews = [];
    for (let i = 0; i < tooltips.length; i++) {
      let tip = tooltips[i], known = -1;
      if (!tip)
        continue;
      for (let i2 = 0; i2 < this.tooltips.length; i2++) {
        let other = this.tooltips[i2];
        if (other && other.create == tip.create)
          known = i2;
      }
      if (known < 0) {
        tooltipViews[i] = this.createTooltipView(tip);
      } else {
        let tooltipView = tooltipViews[i] = this.tooltipViews[known];
        if (tooltipView.update)
          tooltipView.update(update);
      }
    }
    for (let t2 of this.tooltipViews)
      if (tooltipViews.indexOf(t2) < 0) {
        t2.dom.remove();
        (_a2 = t2.destroy) === null || _a2 === void 0 ? void 0 : _a2.call(t2);
      }
    this.input = input;
    this.tooltips = tooltips;
    this.tooltipViews = tooltipViews;
    return true;
  }
}
function windowSpace(view) {
  let { win } = view;
  return { top: 0, left: 0, bottom: win.innerHeight, right: win.innerWidth };
}
const tooltipConfig = /* @__PURE__ */ Facet.define({
  combine: (values) => {
    var _a2, _b, _c;
    return {
      position: browser.ios ? "absolute" : ((_a2 = values.find((conf) => conf.position)) === null || _a2 === void 0 ? void 0 : _a2.position) || "fixed",
      parent: ((_b = values.find((conf) => conf.parent)) === null || _b === void 0 ? void 0 : _b.parent) || null,
      tooltipSpace: ((_c = values.find((conf) => conf.tooltipSpace)) === null || _c === void 0 ? void 0 : _c.tooltipSpace) || windowSpace
    };
  }
});
const knownHeight = /* @__PURE__ */ new WeakMap();
const tooltipPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.inView = true;
    this.lastTransaction = 0;
    this.measureTimeout = -1;
    let config2 = view.state.facet(tooltipConfig);
    this.position = config2.position;
    this.parent = config2.parent;
    this.classes = view.themeClasses;
    this.createContainer();
    this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this };
    this.manager = new TooltipViewManager(view, showTooltip, (t2) => this.createTooltip(t2));
    this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((entries) => {
      if (Date.now() > this.lastTransaction - 50 && entries.length > 0 && entries[entries.length - 1].intersectionRatio < 1)
        this.measureSoon();
    }, { threshold: [1] }) : null;
    this.observeIntersection();
    view.win.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this));
    this.maybeMeasure();
  }
  createContainer() {
    if (this.parent) {
      this.container = document.createElement("div");
      this.container.style.position = "relative";
      this.container.className = this.view.themeClasses;
      this.parent.appendChild(this.container);
    } else {
      this.container = this.view.dom;
    }
  }
  observeIntersection() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      for (let tooltip of this.manager.tooltipViews)
        this.intersectionObserver.observe(tooltip.dom);
    }
  }
  measureSoon() {
    if (this.measureTimeout < 0)
      this.measureTimeout = setTimeout(() => {
        this.measureTimeout = -1;
        this.maybeMeasure();
      }, 50);
  }
  update(update) {
    if (update.transactions.length)
      this.lastTransaction = Date.now();
    let updated = this.manager.update(update);
    if (updated)
      this.observeIntersection();
    let shouldMeasure = updated || update.geometryChanged;
    let newConfig = update.state.facet(tooltipConfig);
    if (newConfig.position != this.position) {
      this.position = newConfig.position;
      for (let t2 of this.manager.tooltipViews)
        t2.dom.style.position = this.position;
      shouldMeasure = true;
    }
    if (newConfig.parent != this.parent) {
      if (this.parent)
        this.container.remove();
      this.parent = newConfig.parent;
      this.createContainer();
      for (let t2 of this.manager.tooltipViews)
        this.container.appendChild(t2.dom);
      shouldMeasure = true;
    } else if (this.parent && this.view.themeClasses != this.classes) {
      this.classes = this.container.className = this.view.themeClasses;
    }
    if (shouldMeasure)
      this.maybeMeasure();
  }
  createTooltip(tooltip) {
    let tooltipView = tooltip.create(this.view);
    tooltipView.dom.classList.add("cm-tooltip");
    if (tooltip.arrow && !tooltipView.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
      let arrow = document.createElement("div");
      arrow.className = "cm-tooltip-arrow";
      tooltipView.dom.appendChild(arrow);
    }
    tooltipView.dom.style.position = this.position;
    tooltipView.dom.style.top = Outside;
    this.container.appendChild(tooltipView.dom);
    if (tooltipView.mount)
      tooltipView.mount(this.view);
    return tooltipView;
  }
  destroy() {
    var _a2, _b;
    this.view.win.removeEventListener("resize", this.measureSoon);
    for (let tooltipView of this.manager.tooltipViews) {
      tooltipView.dom.remove();
      (_a2 = tooltipView.destroy) === null || _a2 === void 0 ? void 0 : _a2.call(tooltipView);
    }
    (_b = this.intersectionObserver) === null || _b === void 0 ? void 0 : _b.disconnect();
    clearTimeout(this.measureTimeout);
  }
  readMeasure() {
    let editor2 = this.view.dom.getBoundingClientRect();
    return {
      editor: editor2,
      parent: this.parent ? this.container.getBoundingClientRect() : editor2,
      pos: this.manager.tooltips.map((t2, i) => {
        let tv = this.manager.tooltipViews[i];
        return tv.getCoords ? tv.getCoords(t2.pos) : this.view.coordsAtPos(t2.pos);
      }),
      size: this.manager.tooltipViews.map(({ dom }) => dom.getBoundingClientRect()),
      space: this.view.state.facet(tooltipConfig).tooltipSpace(this.view)
    };
  }
  writeMeasure(measured) {
    var _a2;
    let { editor: editor2, space: space2 } = measured;
    let others = [];
    for (let i = 0; i < this.manager.tooltips.length; i++) {
      let tooltip = this.manager.tooltips[i], tView = this.manager.tooltipViews[i], { dom } = tView;
      let pos = measured.pos[i], size = measured.size[i];
      if (!pos || pos.bottom <= Math.max(editor2.top, space2.top) || pos.top >= Math.min(editor2.bottom, space2.bottom) || pos.right < Math.max(editor2.left, space2.left) - 0.1 || pos.left > Math.min(editor2.right, space2.right) + 0.1) {
        dom.style.top = Outside;
        continue;
      }
      let arrow = tooltip.arrow ? tView.dom.querySelector(".cm-tooltip-arrow") : null;
      let arrowHeight = arrow ? 7 : 0;
      let width = size.right - size.left, height = (_a2 = knownHeight.get(tView)) !== null && _a2 !== void 0 ? _a2 : size.bottom - size.top;
      let offset = tView.offset || noOffset, ltr = this.view.textDirection == Direction.LTR;
      let left = size.width > space2.right - space2.left ? ltr ? space2.left : space2.right - size.width : ltr ? Math.min(pos.left - (arrow ? 14 : 0) + offset.x, space2.right - width) : Math.max(space2.left, pos.left - width + (arrow ? 14 : 0) - offset.x);
      let above = !!tooltip.above;
      if (!tooltip.strictSide && (above ? pos.top - (size.bottom - size.top) - offset.y < space2.top : pos.bottom + (size.bottom - size.top) + offset.y > space2.bottom) && above == space2.bottom - pos.bottom > pos.top - space2.top)
        above = !above;
      let spaceVert = (above ? pos.top - space2.top : space2.bottom - pos.bottom) - arrowHeight;
      if (spaceVert < height && tView.resize !== false) {
        if (spaceVert < this.view.defaultLineHeight) {
          dom.style.top = Outside;
          continue;
        }
        knownHeight.set(tView, height);
        dom.style.height = (height = spaceVert) + "px";
      } else if (dom.style.height) {
        dom.style.height = "";
      }
      let top2 = above ? pos.top - height - arrowHeight - offset.y : pos.bottom + arrowHeight + offset.y;
      let right = left + width;
      if (tView.overlap !== true) {
        for (let r of others)
          if (r.left < right && r.right > left && r.top < top2 + height && r.bottom > top2)
            top2 = above ? r.top - height - 2 - arrowHeight : r.bottom + arrowHeight + 2;
      }
      if (this.position == "absolute") {
        dom.style.top = top2 - measured.parent.top + "px";
        dom.style.left = left - measured.parent.left + "px";
      } else {
        dom.style.top = top2 + "px";
        dom.style.left = left + "px";
      }
      if (arrow)
        arrow.style.left = `${pos.left + (ltr ? offset.x : -offset.x) - (left + 14 - 7)}px`;
      if (tView.overlap !== true)
        others.push({ left, top: top2, right, bottom: top2 + height });
      dom.classList.toggle("cm-tooltip-above", above);
      dom.classList.toggle("cm-tooltip-below", !above);
      if (tView.positioned)
        tView.positioned(measured.space);
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length) {
      if (this.view.inView)
        this.view.requestMeasure(this.measureReq);
      if (this.inView != this.view.inView) {
        this.inView = this.view.inView;
        if (!this.inView)
          for (let tv of this.manager.tooltipViews)
            tv.dom.style.top = Outside;
      }
    }
  }
}, {
  eventHandlers: {
    scroll() {
      this.maybeMeasure();
    }
  }
});
const baseTheme$4 = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-tooltip": {
    zIndex: 100,
    boxSizing: "border-box"
  },
  "&light .cm-tooltip": {
    border: "1px solid #bbb",
    backgroundColor: "#f5f5f5"
  },
  "&light .cm-tooltip-section:not(:first-child)": {
    borderTop: "1px solid #bbb"
  },
  "&dark .cm-tooltip": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tooltip-arrow": {
    height: `${7}px`,
    width: `${7 * 2}px`,
    position: "absolute",
    zIndex: -1,
    overflow: "hidden",
    "&:before, &:after": {
      content: "''",
      position: "absolute",
      width: 0,
      height: 0,
      borderLeft: `${7}px solid transparent`,
      borderRight: `${7}px solid transparent`
    },
    ".cm-tooltip-above &": {
      bottom: `-${7}px`,
      "&:before": {
        borderTop: `${7}px solid #bbb`
      },
      "&:after": {
        borderTop: `${7}px solid #f5f5f5`,
        bottom: "1px"
      }
    },
    ".cm-tooltip-below &": {
      top: `-${7}px`,
      "&:before": {
        borderBottom: `${7}px solid #bbb`
      },
      "&:after": {
        borderBottom: `${7}px solid #f5f5f5`,
        top: "1px"
      }
    }
  },
  "&dark .cm-tooltip .cm-tooltip-arrow": {
    "&:before": {
      borderTopColor: "#333338",
      borderBottomColor: "#333338"
    },
    "&:after": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent"
    }
  }
});
const noOffset = { x: 0, y: 0 };
const showTooltip = /* @__PURE__ */ Facet.define({
  enables: [tooltipPlugin, baseTheme$4]
});
const showHoverTooltip = /* @__PURE__ */ Facet.define();
class HoverTooltipHost {
  constructor(view) {
    this.view = view;
    this.mounted = false;
    this.dom = document.createElement("div");
    this.dom.classList.add("cm-tooltip-hover");
    this.manager = new TooltipViewManager(view, showHoverTooltip, (t2) => this.createHostedView(t2));
  }
  // Needs to be static so that host tooltip instances always match
  static create(view) {
    return new HoverTooltipHost(view);
  }
  createHostedView(tooltip) {
    let hostedView = tooltip.create(this.view);
    hostedView.dom.classList.add("cm-tooltip-section");
    this.dom.appendChild(hostedView.dom);
    if (this.mounted && hostedView.mount)
      hostedView.mount(this.view);
    return hostedView;
  }
  mount(view) {
    for (let hostedView of this.manager.tooltipViews) {
      if (hostedView.mount)
        hostedView.mount(view);
    }
    this.mounted = true;
  }
  positioned(space2) {
    for (let hostedView of this.manager.tooltipViews) {
      if (hostedView.positioned)
        hostedView.positioned(space2);
    }
  }
  update(update) {
    this.manager.update(update);
  }
}
const showHoverTooltipHost = /* @__PURE__ */ showTooltip.compute([showHoverTooltip], (state) => {
  let tooltips = state.facet(showHoverTooltip).filter((t2) => t2);
  if (tooltips.length === 0)
    return null;
  return {
    pos: Math.min(...tooltips.map((t2) => t2.pos)),
    end: Math.max(...tooltips.filter((t2) => t2.end != null).map((t2) => t2.end)),
    create: HoverTooltipHost.create,
    above: tooltips[0].above,
    arrow: tooltips.some((t2) => t2.arrow)
  };
});
class HoverPlugin {
  constructor(view, source, field, setHover, hoverTime) {
    this.view = view;
    this.source = source;
    this.field = field;
    this.setHover = setHover;
    this.hoverTime = hoverTime;
    this.hoverTimeout = -1;
    this.restartTimeout = -1;
    this.pending = null;
    this.lastMove = { x: 0, y: 0, target: view.dom, time: 0 };
    this.checkHover = this.checkHover.bind(this);
    view.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this));
    view.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
  }
  update() {
    if (this.pending) {
      this.pending = null;
      clearTimeout(this.restartTimeout);
      this.restartTimeout = setTimeout(() => this.startHover(), 20);
    }
  }
  get active() {
    return this.view.state.field(this.field);
  }
  checkHover() {
    this.hoverTimeout = -1;
    if (this.active)
      return;
    let hovered = Date.now() - this.lastMove.time;
    if (hovered < this.hoverTime)
      this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime - hovered);
    else
      this.startHover();
  }
  startHover() {
    clearTimeout(this.restartTimeout);
    let { lastMove } = this;
    let pos = this.view.contentDOM.contains(lastMove.target) ? this.view.posAtCoords(lastMove) : null;
    if (pos == null)
      return;
    let posCoords = this.view.coordsAtPos(pos);
    if (posCoords == null || lastMove.y < posCoords.top || lastMove.y > posCoords.bottom || lastMove.x < posCoords.left - this.view.defaultCharacterWidth || lastMove.x > posCoords.right + this.view.defaultCharacterWidth)
      return;
    let bidi = this.view.bidiSpans(this.view.state.doc.lineAt(pos)).find((s) => s.from <= pos && s.to >= pos);
    let rtl = bidi && bidi.dir == Direction.RTL ? -1 : 1;
    let open = this.source(this.view, pos, lastMove.x < posCoords.left ? -rtl : rtl);
    if (open === null || open === void 0 ? void 0 : open.then) {
      let pending = this.pending = { pos };
      open.then((result) => {
        if (this.pending == pending) {
          this.pending = null;
          if (result)
            this.view.dispatch({ effects: this.setHover.of(result) });
        }
      }, (e) => logException(this.view.state, e, "hover tooltip"));
    } else if (open) {
      this.view.dispatch({ effects: this.setHover.of(open) });
    }
  }
  mousemove(event) {
    var _a2;
    this.lastMove = { x: event.clientX, y: event.clientY, target: event.target, time: Date.now() };
    if (this.hoverTimeout < 0)
      this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime);
    let tooltip = this.active;
    if (tooltip && !isInTooltip(this.lastMove.target) || this.pending) {
      let { pos } = tooltip || this.pending, end = (_a2 = tooltip === null || tooltip === void 0 ? void 0 : tooltip.end) !== null && _a2 !== void 0 ? _a2 : pos;
      if (pos == end ? this.view.posAtCoords(this.lastMove) != pos : !isOverRange(
        this.view,
        pos,
        end,
        event.clientX,
        event.clientY,
        6
        /* Hover.MaxDist */
      )) {
        this.view.dispatch({ effects: this.setHover.of(null) });
        this.pending = null;
      }
    }
  }
  mouseleave(e) {
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = -1;
    if (this.active && !isInTooltip(e.relatedTarget))
      this.view.dispatch({ effects: this.setHover.of(null) });
  }
  destroy() {
    clearTimeout(this.hoverTimeout);
    this.view.dom.removeEventListener("mouseleave", this.mouseleave);
    this.view.dom.removeEventListener("mousemove", this.mousemove);
  }
}
function isInTooltip(elt) {
  for (let cur2 = elt; cur2; cur2 = cur2.parentNode)
    if (cur2.nodeType == 1 && cur2.classList.contains("cm-tooltip"))
      return true;
  return false;
}
function isOverRange(view, from, to, x, y, margin) {
  let range = document.createRange();
  let fromDOM = view.domAtPos(from), toDOM = view.domAtPos(to);
  range.setEnd(toDOM.node, toDOM.offset);
  range.setStart(fromDOM.node, fromDOM.offset);
  let rects = range.getClientRects();
  range.detach();
  for (let i = 0; i < rects.length; i++) {
    let rect = rects[i];
    let dist = Math.max(rect.top - y, y - rect.bottom, rect.left - x, x - rect.right);
    if (dist <= margin)
      return true;
  }
  return false;
}
function hoverTooltip(source, options = {}) {
  let setHover = StateEffect.define();
  let hoverState = StateField.define({
    create() {
      return null;
    },
    update(value, tr) {
      if (value && (options.hideOnChange && (tr.docChanged || tr.selection) || options.hideOn && options.hideOn(tr, value)))
        return null;
      if (value && tr.docChanged) {
        let newPos = tr.changes.mapPos(value.pos, -1, MapMode.TrackDel);
        if (newPos == null)
          return null;
        let copy = Object.assign(/* @__PURE__ */ Object.create(null), value);
        copy.pos = newPos;
        if (value.end != null)
          copy.end = tr.changes.mapPos(value.end);
        value = copy;
      }
      for (let effect of tr.effects) {
        if (effect.is(setHover))
          value = effect.value;
        if (effect.is(closeHoverTooltipEffect))
          value = null;
      }
      return value;
    },
    provide: (f) => showHoverTooltip.from(f)
  });
  return [
    hoverState,
    ViewPlugin.define((view) => new HoverPlugin(
      view,
      source,
      hoverState,
      setHover,
      options.hoverTime || 300
      /* Hover.Time */
    )),
    showHoverTooltipHost
  ];
}
function getTooltip(view, tooltip) {
  let plugin = view.plugin(tooltipPlugin);
  if (!plugin)
    return null;
  let found = plugin.manager.tooltips.indexOf(tooltip);
  return found < 0 ? null : plugin.manager.tooltipViews[found];
}
const closeHoverTooltipEffect = /* @__PURE__ */ StateEffect.define();
const panelConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    let topContainer, bottomContainer;
    for (let c of configs) {
      topContainer = topContainer || c.topContainer;
      bottomContainer = bottomContainer || c.bottomContainer;
    }
    return { topContainer, bottomContainer };
  }
});
function getPanel(view, panel) {
  let plugin = view.plugin(panelPlugin);
  let index = plugin ? plugin.specs.indexOf(panel) : -1;
  return index > -1 ? plugin.panels[index] : null;
}
const panelPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.input = view.state.facet(showPanel);
    this.specs = this.input.filter((s) => s);
    this.panels = this.specs.map((spec) => spec(view));
    let conf = view.state.facet(panelConfig);
    this.top = new PanelGroup(view, true, conf.topContainer);
    this.bottom = new PanelGroup(view, false, conf.bottomContainer);
    this.top.sync(this.panels.filter((p) => p.top));
    this.bottom.sync(this.panels.filter((p) => !p.top));
    for (let p of this.panels) {
      p.dom.classList.add("cm-panel");
      if (p.mount)
        p.mount();
    }
  }
  update(update) {
    let conf = update.state.facet(panelConfig);
    if (this.top.container != conf.topContainer) {
      this.top.sync([]);
      this.top = new PanelGroup(update.view, true, conf.topContainer);
    }
    if (this.bottom.container != conf.bottomContainer) {
      this.bottom.sync([]);
      this.bottom = new PanelGroup(update.view, false, conf.bottomContainer);
    }
    this.top.syncClasses();
    this.bottom.syncClasses();
    let input = update.state.facet(showPanel);
    if (input != this.input) {
      let specs = input.filter((x) => x);
      let panels = [], top2 = [], bottom = [], mount = [];
      for (let spec of specs) {
        let known = this.specs.indexOf(spec), panel;
        if (known < 0) {
          panel = spec(update.view);
          mount.push(panel);
        } else {
          panel = this.panels[known];
          if (panel.update)
            panel.update(update);
        }
        panels.push(panel);
        (panel.top ? top2 : bottom).push(panel);
      }
      this.specs = specs;
      this.panels = panels;
      this.top.sync(top2);
      this.bottom.sync(bottom);
      for (let p of mount) {
        p.dom.classList.add("cm-panel");
        if (p.mount)
          p.mount();
      }
    } else {
      for (let p of this.panels)
        if (p.update)
          p.update(update);
    }
  }
  destroy() {
    this.top.sync([]);
    this.bottom.sync([]);
  }
}, {
  provide: (plugin) => EditorView.scrollMargins.of((view) => {
    let value = view.plugin(plugin);
    return value && { top: value.top.scrollMargin(), bottom: value.bottom.scrollMargin() };
  })
});
class PanelGroup {
  constructor(view, top2, container) {
    this.view = view;
    this.top = top2;
    this.container = container;
    this.dom = void 0;
    this.classes = "";
    this.panels = [];
    this.syncClasses();
  }
  sync(panels) {
    for (let p of this.panels)
      if (p.destroy && panels.indexOf(p) < 0)
        p.destroy();
    this.panels = panels;
    this.syncDOM();
  }
  syncDOM() {
    if (this.panels.length == 0) {
      if (this.dom) {
        this.dom.remove();
        this.dom = void 0;
      }
      return;
    }
    if (!this.dom) {
      this.dom = document.createElement("div");
      this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom";
      this.dom.style[this.top ? "top" : "bottom"] = "0";
      let parent = this.container || this.view.dom;
      parent.insertBefore(this.dom, this.top ? parent.firstChild : null);
    }
    let curDOM = this.dom.firstChild;
    for (let panel of this.panels) {
      if (panel.dom.parentNode == this.dom) {
        while (curDOM != panel.dom)
          curDOM = rm(curDOM);
        curDOM = curDOM.nextSibling;
      } else {
        this.dom.insertBefore(panel.dom, curDOM);
      }
    }
    while (curDOM)
      curDOM = rm(curDOM);
  }
  scrollMargin() {
    return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) : Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
  }
  syncClasses() {
    if (!this.container || this.classes == this.view.themeClasses)
      return;
    for (let cls of this.classes.split(" "))
      if (cls)
        this.container.classList.remove(cls);
    for (let cls of (this.classes = this.view.themeClasses).split(" "))
      if (cls)
        this.container.classList.add(cls);
  }
}
function rm(node) {
  let next = node.nextSibling;
  node.remove();
  return next;
}
const showPanel = /* @__PURE__ */ Facet.define({
  enables: panelPlugin
});
class GutterMarker extends RangeValue {
  /**
  @internal
  */
  compare(other) {
    return this == other || this.constructor == other.constructor && this.eq(other);
  }
  /**
  Compare this marker to another marker of the same type.
  */
  eq(other) {
    return false;
  }
  /**
  Called if the marker has a `toDOM` method and its representation
  was removed from a gutter.
  */
  destroy(dom) {
  }
}
GutterMarker.prototype.elementClass = "";
GutterMarker.prototype.toDOM = void 0;
GutterMarker.prototype.mapMode = MapMode.TrackBefore;
GutterMarker.prototype.startSide = GutterMarker.prototype.endSide = -1;
GutterMarker.prototype.point = true;
const gutterLineClass = /* @__PURE__ */ Facet.define();
const defaults$1 = {
  class: "",
  renderEmptyElements: false,
  elementStyle: "",
  markers: () => RangeSet.empty,
  lineMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {}
};
const activeGutters = /* @__PURE__ */ Facet.define();
function gutter(config2) {
  return [gutters(), activeGutters.of(Object.assign(Object.assign({}, defaults$1), config2))];
}
const unfixGutters = /* @__PURE__ */ Facet.define({
  combine: (values) => values.some((x) => x)
});
function gutters(config2) {
  let result = [
    gutterView
  ];
  if (config2 && config2.fixed === false)
    result.push(unfixGutters.of(true));
  return result;
}
const gutterView = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.prevViewport = view.viewport;
    this.dom = document.createElement("div");
    this.dom.className = "cm-gutters";
    this.dom.setAttribute("aria-hidden", "true");
    this.dom.style.minHeight = this.view.contentHeight + "px";
    this.gutters = view.state.facet(activeGutters).map((conf) => new SingleGutterView(view, conf));
    for (let gutter2 of this.gutters)
      this.dom.appendChild(gutter2.dom);
    this.fixed = !view.state.facet(unfixGutters);
    if (this.fixed) {
      this.dom.style.position = "sticky";
    }
    this.syncGutters(false);
    view.scrollDOM.insertBefore(this.dom, view.contentDOM);
  }
  update(update) {
    if (this.updateGutters(update)) {
      let vpA = this.prevViewport, vpB = update.view.viewport;
      let vpOverlap = Math.min(vpA.to, vpB.to) - Math.max(vpA.from, vpB.from);
      this.syncGutters(vpOverlap < (vpB.to - vpB.from) * 0.8);
    }
    if (update.geometryChanged)
      this.dom.style.minHeight = this.view.contentHeight + "px";
    if (this.view.state.facet(unfixGutters) != !this.fixed) {
      this.fixed = !this.fixed;
      this.dom.style.position = this.fixed ? "sticky" : "";
    }
    this.prevViewport = update.view.viewport;
  }
  syncGutters(detach) {
    let after = this.dom.nextSibling;
    if (detach)
      this.dom.remove();
    let lineClasses = RangeSet.iter(this.view.state.facet(gutterLineClass), this.view.viewport.from);
    let classSet = [];
    let contexts = this.gutters.map((gutter2) => new UpdateContext(gutter2, this.view.viewport, -this.view.documentPadding.top));
    for (let line of this.view.viewportLineBlocks) {
      let text;
      if (Array.isArray(line.type)) {
        for (let b of line.type)
          if (b.type == BlockType.Text) {
            text = b;
            break;
          }
      } else {
        text = line.type == BlockType.Text ? line : void 0;
      }
      if (!text)
        continue;
      if (classSet.length)
        classSet = [];
      advanceCursor(lineClasses, classSet, line.from);
      for (let cx of contexts)
        cx.line(this.view, text, classSet);
    }
    for (let cx of contexts)
      cx.finish();
    if (detach)
      this.view.scrollDOM.insertBefore(this.dom, after);
  }
  updateGutters(update) {
    let prev = update.startState.facet(activeGutters), cur2 = update.state.facet(activeGutters);
    let change = update.docChanged || update.heightChanged || update.viewportChanged || !RangeSet.eq(update.startState.facet(gutterLineClass), update.state.facet(gutterLineClass), update.view.viewport.from, update.view.viewport.to);
    if (prev == cur2) {
      for (let gutter2 of this.gutters)
        if (gutter2.update(update))
          change = true;
    } else {
      change = true;
      let gutters2 = [];
      for (let conf of cur2) {
        let known = prev.indexOf(conf);
        if (known < 0) {
          gutters2.push(new SingleGutterView(this.view, conf));
        } else {
          this.gutters[known].update(update);
          gutters2.push(this.gutters[known]);
        }
      }
      for (let g of this.gutters) {
        g.dom.remove();
        if (gutters2.indexOf(g) < 0)
          g.destroy();
      }
      for (let g of gutters2)
        this.dom.appendChild(g.dom);
      this.gutters = gutters2;
    }
    return change;
  }
  destroy() {
    for (let view of this.gutters)
      view.destroy();
    this.dom.remove();
  }
}, {
  provide: (plugin) => EditorView.scrollMargins.of((view) => {
    let value = view.plugin(plugin);
    if (!value || value.gutters.length == 0 || !value.fixed)
      return null;
    return view.textDirection == Direction.LTR ? { left: value.dom.offsetWidth } : { right: value.dom.offsetWidth };
  })
});
function asArray(val) {
  return Array.isArray(val) ? val : [val];
}
function advanceCursor(cursor, collect, pos) {
  while (cursor.value && cursor.from <= pos) {
    if (cursor.from == pos)
      collect.push(cursor.value);
    cursor.next();
  }
}
class UpdateContext {
  constructor(gutter2, viewport, height) {
    this.gutter = gutter2;
    this.height = height;
    this.i = 0;
    this.cursor = RangeSet.iter(gutter2.markers, viewport.from);
  }
  line(view, line, extraMarkers) {
    let localMarkers = [];
    advanceCursor(this.cursor, localMarkers, line.from);
    if (extraMarkers.length)
      localMarkers = localMarkers.concat(extraMarkers);
    let forLine = this.gutter.config.lineMarker(view, line, localMarkers);
    if (forLine)
      localMarkers.unshift(forLine);
    let gutter2 = this.gutter;
    if (localMarkers.length == 0 && !gutter2.config.renderEmptyElements)
      return;
    let above = line.top - this.height;
    if (this.i == gutter2.elements.length) {
      let newElt = new GutterElement(view, line.height, above, localMarkers);
      gutter2.elements.push(newElt);
      gutter2.dom.appendChild(newElt.dom);
    } else {
      gutter2.elements[this.i].update(view, line.height, above, localMarkers);
    }
    this.height = line.bottom;
    this.i++;
  }
  finish() {
    let gutter2 = this.gutter;
    while (gutter2.elements.length > this.i) {
      let last = gutter2.elements.pop();
      gutter2.dom.removeChild(last.dom);
      last.destroy();
    }
  }
}
class SingleGutterView {
  constructor(view, config2) {
    this.view = view;
    this.config = config2;
    this.elements = [];
    this.spacer = null;
    this.dom = document.createElement("div");
    this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let prop in config2.domEventHandlers) {
      this.dom.addEventListener(prop, (event) => {
        let target = event.target, y;
        if (target != this.dom && this.dom.contains(target)) {
          while (target.parentNode != this.dom)
            target = target.parentNode;
          let rect = target.getBoundingClientRect();
          y = (rect.top + rect.bottom) / 2;
        } else {
          y = event.clientY;
        }
        let line = view.lineBlockAtHeight(y - view.documentTop);
        if (config2.domEventHandlers[prop](view, line, event))
          event.preventDefault();
      });
    }
    this.markers = asArray(config2.markers(view));
    if (config2.initialSpacer) {
      this.spacer = new GutterElement(view, 0, 0, [config2.initialSpacer(view)]);
      this.dom.appendChild(this.spacer.dom);
      this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none";
    }
  }
  update(update) {
    let prevMarkers = this.markers;
    this.markers = asArray(this.config.markers(update.view));
    if (this.spacer && this.config.updateSpacer) {
      let updated = this.config.updateSpacer(this.spacer.markers[0], update);
      if (updated != this.spacer.markers[0])
        this.spacer.update(update.view, 0, 0, [updated]);
    }
    let vp = update.view.viewport;
    return !RangeSet.eq(this.markers, prevMarkers, vp.from, vp.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(update) : false);
  }
  destroy() {
    for (let elt of this.elements)
      elt.destroy();
  }
}
class GutterElement {
  constructor(view, height, above, markers) {
    this.height = -1;
    this.above = 0;
    this.markers = [];
    this.dom = document.createElement("div");
    this.dom.className = "cm-gutterElement";
    this.update(view, height, above, markers);
  }
  update(view, height, above, markers) {
    if (this.height != height)
      this.dom.style.height = (this.height = height) + "px";
    if (this.above != above)
      this.dom.style.marginTop = (this.above = above) ? above + "px" : "";
    if (!sameMarkers(this.markers, markers))
      this.setMarkers(view, markers);
  }
  setMarkers(view, markers) {
    let cls = "cm-gutterElement", domPos = this.dom.firstChild;
    for (let iNew = 0, iOld = 0; ; ) {
      let skipTo = iOld, marker = iNew < markers.length ? markers[iNew++] : null, matched = false;
      if (marker) {
        let c = marker.elementClass;
        if (c)
          cls += " " + c;
        for (let i = iOld; i < this.markers.length; i++)
          if (this.markers[i].compare(marker)) {
            skipTo = i;
            matched = true;
            break;
          }
      } else {
        skipTo = this.markers.length;
      }
      while (iOld < skipTo) {
        let next = this.markers[iOld++];
        if (next.toDOM) {
          next.destroy(domPos);
          let after = domPos.nextSibling;
          domPos.remove();
          domPos = after;
        }
      }
      if (!marker)
        break;
      if (marker.toDOM) {
        if (matched)
          domPos = domPos.nextSibling;
        else
          this.dom.insertBefore(marker.toDOM(view), domPos);
      }
      if (matched)
        iOld++;
    }
    this.dom.className = cls;
    this.markers = markers;
  }
  destroy() {
    this.setMarkers(null, []);
  }
}
function sameMarkers(a, b) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++)
    if (!a[i].compare(b[i]))
      return false;
  return true;
}
const lineNumberMarkers = /* @__PURE__ */ Facet.define();
const lineNumberConfig = /* @__PURE__ */ Facet.define({
  combine(values) {
    return combineConfig(values, { formatNumber: String, domEventHandlers: {} }, {
      domEventHandlers(a, b) {
        let result = Object.assign({}, a);
        for (let event in b) {
          let exists = result[event], add2 = b[event];
          result[event] = exists ? (view, line, event2) => exists(view, line, event2) || add2(view, line, event2) : add2;
        }
        return result;
      }
    });
  }
});
class NumberMarker extends GutterMarker {
  constructor(number2) {
    super();
    this.number = number2;
  }
  eq(other) {
    return this.number == other.number;
  }
  toDOM() {
    return document.createTextNode(this.number);
  }
}
function formatNumber(view, number2) {
  return view.state.facet(lineNumberConfig).formatNumber(number2, view.state);
}
const lineNumberGutter = /* @__PURE__ */ activeGutters.compute([lineNumberConfig], (state) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: false,
  markers(view) {
    return view.state.facet(lineNumberMarkers);
  },
  lineMarker(view, line, others) {
    if (others.some((m) => m.toDOM))
      return null;
    return new NumberMarker(formatNumber(view, view.state.doc.lineAt(line.from).number));
  },
  lineMarkerChange: (update) => update.startState.facet(lineNumberConfig) != update.state.facet(lineNumberConfig),
  initialSpacer(view) {
    return new NumberMarker(formatNumber(view, maxLineNumber(view.state.doc.lines)));
  },
  updateSpacer(spacer, update) {
    let max = formatNumber(update.view, maxLineNumber(update.view.state.doc.lines));
    return max == spacer.number ? spacer : new NumberMarker(max);
  },
  domEventHandlers: state.facet(lineNumberConfig).domEventHandlers
}));
function lineNumbers(config2 = {}) {
  return [
    lineNumberConfig.of(config2),
    gutters(),
    lineNumberGutter
  ];
}
function maxLineNumber(lines) {
  let last = 9;
  while (last < lines)
    last = last * 10 + 9;
  return last;
}
const activeLineGutterMarker = /* @__PURE__ */ new class extends GutterMarker {
  constructor() {
    super(...arguments);
    this.elementClass = "cm-activeLineGutter";
  }
}();
const activeLineGutterHighlighter = /* @__PURE__ */ gutterLineClass.compute(["selection"], (state) => {
  let marks = [], last = -1;
  for (let range of state.selection.ranges) {
    let linePos = state.doc.lineAt(range.head).from;
    if (linePos > last) {
      last = linePos;
      marks.push(activeLineGutterMarker.range(linePos));
    }
  }
  return RangeSet.of(marks);
});
function highlightActiveLineGutter() {
  return activeLineGutterHighlighter;
}
const DefaultBufferLength = 1024;
let nextPropID = 0;
class Range2 {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
}
class NodeProp {
  /// Create a new node prop type.
  constructor(config2 = {}) {
    this.id = nextPropID++;
    this.perNode = !!config2.perNode;
    this.deserialize = config2.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    });
  }
  /// This is meant to be used with
  /// [`NodeSet.extend`](#common.NodeSet.extend) or
  /// [`LRParser.configure`](#lr.ParserConfig.props) to compute
  /// prop values for each node type in the set. Takes a [match
  /// object](#common.NodeType^match) or function that returns undefined
  /// if the node type doesn't get this prop, and the prop's value if
  /// it does.
  add(match) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    if (typeof match != "function")
      match = NodeType.match(match);
    return (type) => {
      let result = match(type);
      return result === void 0 ? null : [this, result];
    };
  }
}
NodeProp.closedBy = new NodeProp({ deserialize: (str) => str.split(" ") });
NodeProp.openedBy = new NodeProp({ deserialize: (str) => str.split(" ") });
NodeProp.group = new NodeProp({ deserialize: (str) => str.split(" ") });
NodeProp.contextHash = new NodeProp({ perNode: true });
NodeProp.lookAhead = new NodeProp({ perNode: true });
NodeProp.mounted = new NodeProp({ perNode: true });
const noProps = /* @__PURE__ */ Object.create(null);
class NodeType {
  /// @internal
  constructor(name2, props, id2, flags = 0) {
    this.name = name2;
    this.props = props;
    this.id = id2;
    this.flags = flags;
  }
  /// Define a node type.
  static define(spec) {
    let props = spec.props && spec.props.length ? /* @__PURE__ */ Object.create(null) : noProps;
    let flags = (spec.top ? 1 : 0) | (spec.skipped ? 2 : 0) | (spec.error ? 4 : 0) | (spec.name == null ? 8 : 0);
    let type = new NodeType(spec.name || "", props, spec.id, flags);
    if (spec.props)
      for (let src of spec.props) {
        if (!Array.isArray(src))
          src = src(type);
        if (src) {
          if (src[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          props[src[0].id] = src[1];
        }
      }
    return type;
  }
  /// Retrieves a node prop for this type. Will return `undefined` if
  /// the prop isn't present on this node.
  prop(prop) {
    return this.props[prop.id];
  }
  /// True when this is the top node of a grammar.
  get isTop() {
    return (this.flags & 1) > 0;
  }
  /// True when this node is produced by a skip rule.
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  /// Indicates whether this is an error node.
  get isError() {
    return (this.flags & 4) > 0;
  }
  /// When true, this node type doesn't correspond to a user-declared
  /// named node, for example because it is used to cache repetition.
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  /// Returns true when this node's name or one of its
  /// [groups](#common.NodeProp^group) matches the given string.
  is(name2) {
    if (typeof name2 == "string") {
      if (this.name == name2)
        return true;
      let group = this.prop(NodeProp.group);
      return group ? group.indexOf(name2) > -1 : false;
    }
    return this.id == name2;
  }
  /// Create a function from node types to arbitrary values by
  /// specifying an object whose property names are node or
  /// [group](#common.NodeProp^group) names. Often useful with
  /// [`NodeProp.add`](#common.NodeProp.add). You can put multiple
  /// names, separated by spaces, in a single property name to map
  /// multiple node names to a single value.
  static match(map) {
    let direct = /* @__PURE__ */ Object.create(null);
    for (let prop in map)
      for (let name2 of prop.split(" "))
        direct[name2] = map[prop];
    return (node) => {
      for (let groups = node.prop(NodeProp.group), i = -1; i < (groups ? groups.length : 0); i++) {
        let found = direct[i < 0 ? node.name : groups[i]];
        if (found)
          return found;
      }
    };
  }
}
NodeType.none = new NodeType(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
class NodeSet {
  /// Create a set with the given types. The `id` property of each
  /// type should correspond to its position within the array.
  constructor(types2) {
    this.types = types2;
    for (let i = 0; i < types2.length; i++)
      if (types2[i].id != i)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  /// Create a copy of this set with some node properties added. The
  /// arguments to this method can be created with
  /// [`NodeProp.add`](#common.NodeProp.add).
  extend(...props) {
    let newTypes = [];
    for (let type of this.types) {
      let newProps = null;
      for (let source of props) {
        let add2 = source(type);
        if (add2) {
          if (!newProps)
            newProps = Object.assign({}, type.props);
          newProps[add2[0].id] = add2[1];
        }
      }
      newTypes.push(newProps ? new NodeType(type.name, newProps, type.id, type.flags) : type);
    }
    return new NodeSet(newTypes);
  }
}
const CachedNode = /* @__PURE__ */ new WeakMap(), CachedInnerNode = /* @__PURE__ */ new WeakMap();
var IterMode;
(function(IterMode2) {
  IterMode2[IterMode2["ExcludeBuffers"] = 1] = "ExcludeBuffers";
  IterMode2[IterMode2["IncludeAnonymous"] = 2] = "IncludeAnonymous";
  IterMode2[IterMode2["IgnoreMounts"] = 4] = "IgnoreMounts";
  IterMode2[IterMode2["IgnoreOverlays"] = 8] = "IgnoreOverlays";
})(IterMode || (IterMode = {}));
class Tree {
  /// Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  constructor(type, children, positions, length, props) {
    this.type = type;
    this.children = children;
    this.positions = positions;
    this.length = length;
    this.props = null;
    if (props && props.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [prop, value] of props)
        this.props[typeof prop == "number" ? prop : prop.id] = value;
    }
  }
  /// @internal
  toString() {
    let mounted = this.prop(NodeProp.mounted);
    if (mounted && !mounted.overlay)
      return mounted.tree.toString();
    let children = "";
    for (let ch of this.children) {
      let str = ch.toString();
      if (str) {
        if (children)
          children += ",";
        children += str;
      }
    }
    return !this.type.name ? children : (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (children.length ? "(" + children + ")" : "");
  }
  /// Get a [tree cursor](#common.TreeCursor) positioned at the top of
  /// the tree. Mode can be used to [control](#common.IterMode) which
  /// nodes the cursor visits.
  cursor(mode = 0) {
    return new TreeCursor(this.topNode, mode);
  }
  /// Get a [tree cursor](#common.TreeCursor) pointing into this tree
  /// at the given position and side (see
  /// [`moveTo`](#common.TreeCursor.moveTo).
  cursorAt(pos, side = 0, mode = 0) {
    let scope = CachedNode.get(this) || this.topNode;
    let cursor = new TreeCursor(scope);
    cursor.moveTo(pos, side);
    CachedNode.set(this, cursor._tree);
    return cursor;
  }
  /// Get a [syntax node](#common.SyntaxNode) object for the top of the
  /// tree.
  get topNode() {
    return new TreeNode(this, 0, 0, null);
  }
  /// Get the [syntax node](#common.SyntaxNode) at the given position.
  /// If `side` is -1, this will move into nodes that end at the
  /// position. If 1, it'll move into nodes that start at the
  /// position. With 0, it'll only enter nodes that cover the position
  /// from both sides.
  ///
  /// Note that this will not enter
  /// [overlays](#common.MountedTree.overlay), and you often want
  /// [`resolveInner`](#common.Tree.resolveInner) instead.
  resolve(pos, side = 0) {
    let node = resolveNode(CachedNode.get(this) || this.topNode, pos, side, false);
    CachedNode.set(this, node);
    return node;
  }
  /// Like [`resolve`](#common.Tree.resolve), but will enter
  /// [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  /// pointing into the innermost overlaid tree at the given position
  /// (with parent links going through all parent structure, including
  /// the host trees).
  resolveInner(pos, side = 0) {
    let node = resolveNode(CachedInnerNode.get(this) || this.topNode, pos, side, true);
    CachedInnerNode.set(this, node);
    return node;
  }
  /// Iterate over the tree and its children, calling `enter` for any
  /// node that touches the `from`/`to` region (if given) before
  /// running over such a node's children, and `leave` (if given) when
  /// leaving the node. When `enter` returns `false`, that node will
  /// not have its children iterated over (or `leave` called).
  iterate(spec) {
    let { enter, leave, from = 0, to = this.length } = spec;
    for (let c = this.cursor((spec.mode || 0) | IterMode.IncludeAnonymous); ; ) {
      let entered = false;
      if (c.from <= to && c.to >= from && (c.type.isAnonymous || enter(c) !== false)) {
        if (c.firstChild())
          continue;
        entered = true;
      }
      for (; ; ) {
        if (entered && leave && !c.type.isAnonymous)
          leave(c);
        if (c.nextSibling())
          break;
        if (!c.parent())
          return;
        entered = true;
      }
    }
  }
  /// Get the value of the given [node prop](#common.NodeProp) for this
  /// node. Works with both per-node and per-type props.
  prop(prop) {
    return !prop.perNode ? this.type.prop(prop) : this.props ? this.props[prop.id] : void 0;
  }
  /// Returns the node's [per-node props](#common.NodeProp.perNode) in a
  /// format that can be passed to the [`Tree`](#common.Tree)
  /// constructor.
  get propValues() {
    let result = [];
    if (this.props)
      for (let id2 in this.props)
        result.push([+id2, this.props[id2]]);
    return result;
  }
  /// Balance the direct children of this tree, producing a copy of
  /// which may have children grouped into subtrees with type
  /// [`NodeType.none`](#common.NodeType^none).
  balance(config2 = {}) {
    return this.children.length <= 8 ? this : balanceRange(NodeType.none, this.children, this.positions, 0, this.children.length, 0, this.length, (children, positions, length) => new Tree(this.type, children, positions, length, this.propValues), config2.makeTree || ((children, positions, length) => new Tree(NodeType.none, children, positions, length)));
  }
  /// Build a tree from a postfix-ordered buffer of node information,
  /// or a cursor over such a buffer.
  static build(data) {
    return buildTree(data);
  }
}
Tree.empty = new Tree(NodeType.none, [], [], 0);
class FlatBufferCursor {
  constructor(buffer, index) {
    this.buffer = buffer;
    this.index = index;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new FlatBufferCursor(this.buffer, this.index);
  }
}
class TreeBuffer {
  /// Create a tree buffer.
  constructor(buffer, length, set) {
    this.buffer = buffer;
    this.length = length;
    this.set = set;
  }
  /// @internal
  get type() {
    return NodeType.none;
  }
  /// @internal
  toString() {
    let result = [];
    for (let index = 0; index < this.buffer.length; ) {
      result.push(this.childString(index));
      index = this.buffer[index + 3];
    }
    return result.join(",");
  }
  /// @internal
  childString(index) {
    let id2 = this.buffer[index], endIndex = this.buffer[index + 3];
    let type = this.set.types[id2], result = type.name;
    if (/\W/.test(result) && !type.isError)
      result = JSON.stringify(result);
    index += 4;
    if (endIndex == index)
      return result;
    let children = [];
    while (index < endIndex) {
      children.push(this.childString(index));
      index = this.buffer[index + 3];
    }
    return result + "(" + children.join(",") + ")";
  }
  /// @internal
  findChild(startIndex, endIndex, dir, pos, side) {
    let { buffer } = this, pick = -1;
    for (let i = startIndex; i != endIndex; i = buffer[i + 3]) {
      if (checkSide(side, pos, buffer[i + 1], buffer[i + 2])) {
        pick = i;
        if (dir > 0)
          break;
      }
    }
    return pick;
  }
  /// @internal
  slice(startI, endI, from) {
    let b = this.buffer;
    let copy = new Uint16Array(endI - startI), len = 0;
    for (let i = startI, j = 0; i < endI; ) {
      copy[j++] = b[i++];
      copy[j++] = b[i++] - from;
      let to = copy[j++] = b[i++] - from;
      copy[j++] = b[i++] - startI;
      len = Math.max(len, to);
    }
    return new TreeBuffer(copy, len, this.set);
  }
}
function checkSide(side, pos, from, to) {
  switch (side) {
    case -2:
      return from < pos;
    case -1:
      return to >= pos && from < pos;
    case 0:
      return from < pos && to > pos;
    case 1:
      return from <= pos && to > pos;
    case 2:
      return to > pos;
    case 4:
      return true;
  }
}
function enterUnfinishedNodesBefore(node, pos) {
  let scan = node.childBefore(pos);
  while (scan) {
    let last = scan.lastChild;
    if (!last || last.to != scan.to)
      break;
    if (last.type.isError && last.from == last.to) {
      node = scan;
      scan = last.prevSibling;
    } else {
      scan = last;
    }
  }
  return node;
}
function resolveNode(node, pos, side, overlays) {
  var _a2;
  while (node.from == node.to || (side < 1 ? node.from >= pos : node.from > pos) || (side > -1 ? node.to <= pos : node.to < pos)) {
    let parent = !overlays && node instanceof TreeNode && node.index < 0 ? null : node.parent;
    if (!parent)
      return node;
    node = parent;
  }
  let mode = overlays ? 0 : IterMode.IgnoreOverlays;
  if (overlays)
    for (let scan = node, parent = scan.parent; parent; scan = parent, parent = scan.parent) {
      if (scan instanceof TreeNode && scan.index < 0 && ((_a2 = parent.enter(pos, side, mode)) === null || _a2 === void 0 ? void 0 : _a2.from) != scan.from)
        node = parent;
    }
  for (; ; ) {
    let inner = node.enter(pos, side, mode);
    if (!inner)
      return node;
    node = inner;
  }
}
class TreeNode {
  constructor(_tree, from, index, _parent) {
    this._tree = _tree;
    this.from = from;
    this.index = index;
    this._parent = _parent;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(i, dir, pos, side, mode = 0) {
    for (let parent = this; ; ) {
      for (let { children, positions } = parent._tree, e = dir > 0 ? children.length : -1; i != e; i += dir) {
        let next = children[i], start = positions[i] + parent.from;
        if (!checkSide(side, pos, start, start + next.length))
          continue;
        if (next instanceof TreeBuffer) {
          if (mode & IterMode.ExcludeBuffers)
            continue;
          let index = next.findChild(0, next.buffer.length, dir, pos - start, side);
          if (index > -1)
            return new BufferNode(new BufferContext(parent, next, i, start), null, index);
        } else if (mode & IterMode.IncludeAnonymous || (!next.type.isAnonymous || hasChild(next))) {
          let mounted;
          if (!(mode & IterMode.IgnoreMounts) && next.props && (mounted = next.prop(NodeProp.mounted)) && !mounted.overlay)
            return new TreeNode(mounted.tree, start, i, parent);
          let inner = new TreeNode(next, start, i, parent);
          return mode & IterMode.IncludeAnonymous || !inner.type.isAnonymous ? inner : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, pos, side);
        }
      }
      if (mode & IterMode.IncludeAnonymous || !parent.type.isAnonymous)
        return null;
      if (parent.index >= 0)
        i = parent.index + dir;
      else
        i = dir < 0 ? -1 : parent._parent._tree.children.length;
      parent = parent._parent;
      if (!parent)
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(
      0,
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(pos) {
    return this.nextChild(
      0,
      1,
      pos,
      2
      /* Side.After */
    );
  }
  childBefore(pos) {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      pos,
      -2
      /* Side.Before */
    );
  }
  enter(pos, side, mode = 0) {
    let mounted;
    if (!(mode & IterMode.IgnoreOverlays) && (mounted = this._tree.prop(NodeProp.mounted)) && mounted.overlay) {
      let rPos = pos - this.from;
      for (let { from, to } of mounted.overlay) {
        if ((side > 0 ? from <= rPos : from < rPos) && (side < 0 ? to >= rPos : to > rPos))
          return new TreeNode(mounted.tree, mounted.overlay[0].from + this.from, -1, this);
      }
    }
    return this.nextChild(0, 1, pos, side, mode);
  }
  nextSignificantParent() {
    let val = this;
    while (val.type.isAnonymous && val._parent)
      val = val._parent;
    return val;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index + 1,
      1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  cursor(mode = 0) {
    return new TreeCursor(this, mode);
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  resolve(pos, side = 0) {
    return resolveNode(this, pos, side, false);
  }
  resolveInner(pos, side = 0) {
    return resolveNode(this, pos, side, true);
  }
  enterUnfinishedNodesBefore(pos) {
    return enterUnfinishedNodesBefore(this, pos);
  }
  getChild(type, before = null, after = null) {
    let r = getChildren(this, type, before, after);
    return r.length ? r[0] : null;
  }
  getChildren(type, before = null, after = null) {
    return getChildren(this, type, before, after);
  }
  /// @internal
  toString() {
    return this._tree.toString();
  }
  get node() {
    return this;
  }
  matchContext(context) {
    return matchNodeContext(this, context);
  }
}
function getChildren(node, type, before, after) {
  let cur2 = node.cursor(), result = [];
  if (!cur2.firstChild())
    return result;
  if (before != null) {
    while (!cur2.type.is(before))
      if (!cur2.nextSibling())
        return result;
  }
  for (; ; ) {
    if (after != null && cur2.type.is(after))
      return result;
    if (cur2.type.is(type))
      result.push(cur2.node);
    if (!cur2.nextSibling())
      return after == null ? result : [];
  }
}
function matchNodeContext(node, context, i = context.length - 1) {
  for (let p = node.parent; i >= 0; p = p.parent) {
    if (!p)
      return false;
    if (!p.type.isAnonymous) {
      if (context[i] && context[i] != p.name)
        return false;
      i--;
    }
  }
  return true;
}
class BufferContext {
  constructor(parent, buffer, index, start) {
    this.parent = parent;
    this.buffer = buffer;
    this.index = index;
    this.start = start;
  }
}
class BufferNode {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(context, _parent, index) {
    this.context = context;
    this._parent = _parent;
    this.index = index;
    this.type = context.buffer.set.types[context.buffer.buffer[index]];
  }
  child(dir, pos, side) {
    let { buffer } = this.context;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.context.start, side);
    return index < 0 ? null : new BufferNode(this.context, this, index);
  }
  get firstChild() {
    return this.child(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.child(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(pos) {
    return this.child(
      1,
      pos,
      2
      /* Side.After */
    );
  }
  childBefore(pos) {
    return this.child(
      -1,
      pos,
      -2
      /* Side.Before */
    );
  }
  enter(pos, side, mode = 0) {
    if (mode & IterMode.ExcludeBuffers)
      return null;
    let { buffer } = this.context;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], side > 0 ? 1 : -1, pos - this.context.start, side);
    return index < 0 ? null : new BufferNode(this.context, this, index);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(dir) {
    return this._parent ? null : this.context.parent.nextChild(
      this.context.index + dir,
      dir,
      0,
      4
      /* Side.DontCare */
    );
  }
  get nextSibling() {
    let { buffer } = this.context;
    let after = buffer.buffer[this.index + 3];
    if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
      return new BufferNode(this.context, this._parent, after);
    return this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer } = this.context;
    let parentStart = this._parent ? this._parent.index + 4 : 0;
    if (this.index == parentStart)
      return this.externalSibling(-1);
    return new BufferNode(this.context, this._parent, buffer.findChild(
      parentStart,
      this.index,
      -1,
      0,
      4
      /* Side.DontCare */
    ));
  }
  cursor(mode = 0) {
    return new TreeCursor(this, mode);
  }
  get tree() {
    return null;
  }
  toTree() {
    let children = [], positions = [];
    let { buffer } = this.context;
    let startI = this.index + 4, endI = buffer.buffer[this.index + 3];
    if (endI > startI) {
      let from = buffer.buffer[this.index + 1];
      children.push(buffer.slice(startI, endI, from));
      positions.push(0);
    }
    return new Tree(this.type, children, positions, this.to - this.from);
  }
  resolve(pos, side = 0) {
    return resolveNode(this, pos, side, false);
  }
  resolveInner(pos, side = 0) {
    return resolveNode(this, pos, side, true);
  }
  enterUnfinishedNodesBefore(pos) {
    return enterUnfinishedNodesBefore(this, pos);
  }
  /// @internal
  toString() {
    return this.context.buffer.childString(this.index);
  }
  getChild(type, before = null, after = null) {
    let r = getChildren(this, type, before, after);
    return r.length ? r[0] : null;
  }
  getChildren(type, before = null, after = null) {
    return getChildren(this, type, before, after);
  }
  get node() {
    return this;
  }
  matchContext(context) {
    return matchNodeContext(this, context);
  }
}
class TreeCursor {
  /// Shorthand for `.type.name`.
  get name() {
    return this.type.name;
  }
  /// @internal
  constructor(node, mode = 0) {
    this.mode = mode;
    this.buffer = null;
    this.stack = [];
    this.index = 0;
    this.bufferNode = null;
    if (node instanceof TreeNode) {
      this.yieldNode(node);
    } else {
      this._tree = node.context.parent;
      this.buffer = node.context;
      for (let n = node._parent; n; n = n._parent)
        this.stack.unshift(n.index);
      this.bufferNode = node;
      this.yieldBuf(node.index);
    }
  }
  yieldNode(node) {
    if (!node)
      return false;
    this._tree = node;
    this.type = node.type;
    this.from = node.from;
    this.to = node.to;
    return true;
  }
  yieldBuf(index, type) {
    this.index = index;
    let { start, buffer } = this.buffer;
    this.type = type || buffer.set.types[buffer.buffer[index]];
    this.from = start + buffer.buffer[index + 1];
    this.to = start + buffer.buffer[index + 2];
    return true;
  }
  yield(node) {
    if (!node)
      return false;
    if (node instanceof TreeNode) {
      this.buffer = null;
      return this.yieldNode(node);
    }
    this.buffer = node.context;
    return this.yieldBuf(node.index, node.type);
  }
  /// @internal
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  /// @internal
  enterChild(dir, pos, side) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(dir < 0 ? this._tree._tree.children.length - 1 : 0, dir, pos, side, this.mode));
    let { buffer } = this.buffer;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.buffer.start, side);
    if (index < 0)
      return false;
    this.stack.push(this.index);
    return this.yieldBuf(index);
  }
  /// Move the cursor to this node's first child. When this returns
  /// false, the node has no child, and the cursor has not been moved.
  firstChild() {
    return this.enterChild(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /// Move the cursor to this node's last child.
  lastChild() {
    return this.enterChild(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /// Move the cursor to the first child that ends after `pos`.
  childAfter(pos) {
    return this.enterChild(
      1,
      pos,
      2
      /* Side.After */
    );
  }
  /// Move to the last child that starts before `pos`.
  childBefore(pos) {
    return this.enterChild(
      -1,
      pos,
      -2
      /* Side.Before */
    );
  }
  /// Move the cursor to the child around `pos`. If side is -1 the
  /// child may end at that position, when 1 it may start there. This
  /// will also enter [overlaid](#common.MountedTree.overlay)
  /// [mounted](#common.NodeProp^mounted) trees unless `overlays` is
  /// set to false.
  enter(pos, side, mode = this.mode) {
    if (!this.buffer)
      return this.yield(this._tree.enter(pos, side, mode));
    return mode & IterMode.ExcludeBuffers ? false : this.enterChild(1, pos, side);
  }
  /// Move to the node's parent node, if this isn't the top node.
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & IterMode.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let parent = this.mode & IterMode.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    this.buffer = null;
    return this.yieldNode(parent);
  }
  /// @internal
  sibling(dir) {
    if (!this.buffer)
      return !this._tree._parent ? false : this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + dir, dir, 0, 4, this.mode));
    let { buffer } = this.buffer, d = this.stack.length - 1;
    if (dir < 0) {
      let parentStart = d < 0 ? 0 : this.stack[d] + 4;
      if (this.index != parentStart)
        return this.yieldBuf(buffer.findChild(
          parentStart,
          this.index,
          -1,
          0,
          4
          /* Side.DontCare */
        ));
    } else {
      let after = buffer.buffer[this.index + 3];
      if (after < (d < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d] + 3]))
        return this.yieldBuf(after);
    }
    return d < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, 0, 4, this.mode)) : false;
  }
  /// Move to this node's next sibling, if any.
  nextSibling() {
    return this.sibling(1);
  }
  /// Move to this node's previous sibling, if any.
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(dir) {
    let index, parent, { buffer } = this;
    if (buffer) {
      if (dir > 0) {
        if (this.index < buffer.buffer.buffer.length)
          return false;
      } else {
        for (let i = 0; i < this.index; i++)
          if (buffer.buffer.buffer[i + 3] < this.index)
            return false;
      }
      ({ index, parent } = buffer);
    } else {
      ({ index, _parent: parent } = this._tree);
    }
    for (; parent; { index, _parent: parent } = parent) {
      if (index > -1)
        for (let i = index + dir, e = dir < 0 ? -1 : parent._tree.children.length; i != e; i += dir) {
          let child = parent._tree.children[i];
          if (this.mode & IterMode.IncludeAnonymous || child instanceof TreeBuffer || !child.type.isAnonymous || hasChild(child))
            return false;
        }
    }
    return true;
  }
  move(dir, enter) {
    if (enter && this.enterChild(
      dir,
      0,
      4
      /* Side.DontCare */
    ))
      return true;
    for (; ; ) {
      if (this.sibling(dir))
        return true;
      if (this.atLastNode(dir) || !this.parent())
        return false;
    }
  }
  /// Move to the next node in a
  /// [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
  /// traversal, going from a node to its first child or, if the
  /// current node is empty or `enter` is false, its next sibling or
  /// the next sibling of the first parent node that has one.
  next(enter = true) {
    return this.move(1, enter);
  }
  /// Move to the next node in a last-to-first pre-order traveral. A
  /// node is followed by its last child or, if it has none, its
  /// previous sibling or the previous sibling of the first parent
  /// node that has one.
  prev(enter = true) {
    return this.move(-1, enter);
  }
  /// Move the cursor to the innermost node that covers `pos`. If
  /// `side` is -1, it will enter nodes that end at `pos`. If it is 1,
  /// it will enter nodes that start at `pos`.
  moveTo(pos, side = 0) {
    while (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos))
      if (!this.parent())
        break;
    while (this.enterChild(1, pos, side)) {
    }
    return this;
  }
  /// Get a [syntax node](#common.SyntaxNode) at the cursor's current
  /// position.
  get node() {
    if (!this.buffer)
      return this._tree;
    let cache2 = this.bufferNode, result = null, depth = 0;
    if (cache2 && cache2.context == this.buffer) {
      scan:
        for (let index = this.index, d = this.stack.length; d >= 0; ) {
          for (let c = cache2; c; c = c._parent)
            if (c.index == index) {
              if (index == this.index)
                return c;
              result = c;
              depth = d + 1;
              break scan;
            }
          index = this.stack[--d];
        }
    }
    for (let i = depth; i < this.stack.length; i++)
      result = new BufferNode(this.buffer, result, this.stack[i]);
    return this.bufferNode = new BufferNode(this.buffer, result, this.index);
  }
  /// Get the [tree](#common.Tree) that represents the current node, if
  /// any. Will return null when the node is in a [tree
  /// buffer](#common.TreeBuffer).
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  /// Iterate over the current node and all its descendants, calling
  /// `enter` when entering a node and `leave`, if given, when leaving
  /// one. When `enter` returns `false`, any children of that node are
  /// skipped, and `leave` isn't called for it.
  iterate(enter, leave) {
    for (let depth = 0; ; ) {
      let mustLeave = false;
      if (this.type.isAnonymous || enter(this) !== false) {
        if (this.firstChild()) {
          depth++;
          continue;
        }
        if (!this.type.isAnonymous)
          mustLeave = true;
      }
      for (; ; ) {
        if (mustLeave && leave)
          leave(this);
        mustLeave = this.type.isAnonymous;
        if (this.nextSibling())
          break;
        if (!depth)
          return;
        this.parent();
        depth--;
        mustLeave = true;
      }
    }
  }
  /// Test whether the current node matches a given context—a sequence
  /// of direct parent node names. Empty strings in the context array
  /// are treated as wildcards.
  matchContext(context) {
    if (!this.buffer)
      return matchNodeContext(this.node, context);
    let { buffer } = this.buffer, { types: types2 } = buffer.set;
    for (let i = context.length - 1, d = this.stack.length - 1; i >= 0; d--) {
      if (d < 0)
        return matchNodeContext(this.node, context, i);
      let type = types2[buffer.buffer[this.stack[d]]];
      if (!type.isAnonymous) {
        if (context[i] && context[i] != type.name)
          return false;
        i--;
      }
    }
    return true;
  }
}
function hasChild(tree) {
  return tree.children.some((ch) => ch instanceof TreeBuffer || !ch.type.isAnonymous || hasChild(ch));
}
function buildTree(data) {
  var _a2;
  let { buffer, nodeSet, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet.types.length } = data;
  let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
  let types2 = nodeSet.types;
  let contextHash = 0, lookAhead = 0;
  function takeNode(parentStart, minPos, children2, positions2, inRepeat) {
    let { id: id2, start, end, size } = cursor;
    let lookAheadAtStart = lookAhead;
    while (size < 0) {
      cursor.next();
      if (size == -1) {
        let node2 = reused[id2];
        children2.push(node2);
        positions2.push(start - parentStart);
        return;
      } else if (size == -3) {
        contextHash = id2;
        return;
      } else if (size == -4) {
        lookAhead = id2;
        return;
      } else {
        throw new RangeError(`Unrecognized record size: ${size}`);
      }
    }
    let type = types2[id2], node, buffer2;
    let startPos = start - parentStart;
    if (end - start <= maxBufferLength && (buffer2 = findBufferSize(cursor.pos - minPos, inRepeat))) {
      let data2 = new Uint16Array(buffer2.size - buffer2.skip);
      let endPos = cursor.pos - buffer2.size, index = data2.length;
      while (cursor.pos > endPos)
        index = copyToBuffer(buffer2.start, data2, index);
      node = new TreeBuffer(data2, end - buffer2.start, nodeSet);
      startPos = buffer2.start - parentStart;
    } else {
      let endPos = cursor.pos - size;
      cursor.next();
      let localChildren = [], localPositions = [];
      let localInRepeat = id2 >= minRepeatType ? id2 : -1;
      let lastGroup = 0, lastEnd = end;
      while (cursor.pos > endPos) {
        if (localInRepeat >= 0 && cursor.id == localInRepeat && cursor.size >= 0) {
          if (cursor.end <= lastEnd - maxBufferLength) {
            makeRepeatLeaf(localChildren, localPositions, start, lastGroup, cursor.end, lastEnd, localInRepeat, lookAheadAtStart);
            lastGroup = localChildren.length;
            lastEnd = cursor.end;
          }
          cursor.next();
        } else {
          takeNode(start, endPos, localChildren, localPositions, localInRepeat);
        }
      }
      if (localInRepeat >= 0 && lastGroup > 0 && lastGroup < localChildren.length)
        makeRepeatLeaf(localChildren, localPositions, start, lastGroup, start, lastEnd, localInRepeat, lookAheadAtStart);
      localChildren.reverse();
      localPositions.reverse();
      if (localInRepeat > -1 && lastGroup > 0) {
        let make = makeBalanced(type);
        node = balanceRange(type, localChildren, localPositions, 0, localChildren.length, 0, end - start, make, make);
      } else {
        node = makeTree(type, localChildren, localPositions, end - start, lookAheadAtStart - end);
      }
    }
    children2.push(node);
    positions2.push(startPos);
  }
  function makeBalanced(type) {
    return (children2, positions2, length2) => {
      let lookAhead2 = 0, lastI = children2.length - 1, last, lookAheadProp;
      if (lastI >= 0 && (last = children2[lastI]) instanceof Tree) {
        if (!lastI && last.type == type && last.length == length2)
          return last;
        if (lookAheadProp = last.prop(NodeProp.lookAhead))
          lookAhead2 = positions2[lastI] + last.length + lookAheadProp;
      }
      return makeTree(type, children2, positions2, length2, lookAhead2);
    };
  }
  function makeRepeatLeaf(children2, positions2, base2, i, from, to, type, lookAhead2) {
    let localChildren = [], localPositions = [];
    while (children2.length > i) {
      localChildren.push(children2.pop());
      localPositions.push(positions2.pop() + base2 - from);
    }
    children2.push(makeTree(nodeSet.types[type], localChildren, localPositions, to - from, lookAhead2 - to));
    positions2.push(from - base2);
  }
  function makeTree(type, children2, positions2, length2, lookAhead2 = 0, props) {
    if (contextHash) {
      let pair2 = [NodeProp.contextHash, contextHash];
      props = props ? [pair2].concat(props) : [pair2];
    }
    if (lookAhead2 > 25) {
      let pair2 = [NodeProp.lookAhead, lookAhead2];
      props = props ? [pair2].concat(props) : [pair2];
    }
    return new Tree(type, children2, positions2, length2, props);
  }
  function findBufferSize(maxSize, inRepeat) {
    let fork = cursor.fork();
    let size = 0, start = 0, skip = 0, minStart = fork.end - maxBufferLength;
    let result = { size: 0, start: 0, skip: 0 };
    scan:
      for (let minPos = fork.pos - maxSize; fork.pos > minPos; ) {
        let nodeSize2 = fork.size;
        if (fork.id == inRepeat && nodeSize2 >= 0) {
          result.size = size;
          result.start = start;
          result.skip = skip;
          skip += 4;
          size += 4;
          fork.next();
          continue;
        }
        let startPos = fork.pos - nodeSize2;
        if (nodeSize2 < 0 || startPos < minPos || fork.start < minStart)
          break;
        let localSkipped = fork.id >= minRepeatType ? 4 : 0;
        let nodeStart2 = fork.start;
        fork.next();
        while (fork.pos > startPos) {
          if (fork.size < 0) {
            if (fork.size == -3)
              localSkipped += 4;
            else
              break scan;
          } else if (fork.id >= minRepeatType) {
            localSkipped += 4;
          }
          fork.next();
        }
        start = nodeStart2;
        size += nodeSize2;
        skip += localSkipped;
      }
    if (inRepeat < 0 || size == maxSize) {
      result.size = size;
      result.start = start;
      result.skip = skip;
    }
    return result.size > 4 ? result : void 0;
  }
  function copyToBuffer(bufferStart, buffer2, index) {
    let { id: id2, start, end, size } = cursor;
    cursor.next();
    if (size >= 0 && id2 < minRepeatType) {
      let startIndex = index;
      if (size > 4) {
        let endPos = cursor.pos - (size - 4);
        while (cursor.pos > endPos)
          index = copyToBuffer(bufferStart, buffer2, index);
      }
      buffer2[--index] = startIndex;
      buffer2[--index] = end - bufferStart;
      buffer2[--index] = start - bufferStart;
      buffer2[--index] = id2;
    } else if (size == -3) {
      contextHash = id2;
    } else if (size == -4) {
      lookAhead = id2;
    }
    return index;
  }
  let children = [], positions = [];
  while (cursor.pos > 0)
    takeNode(data.start || 0, data.bufferStart || 0, children, positions, -1);
  let length = (_a2 = data.length) !== null && _a2 !== void 0 ? _a2 : children.length ? positions[0] + children[0].length : 0;
  return new Tree(types2[data.topID], children.reverse(), positions.reverse(), length);
}
const nodeSizeCache = /* @__PURE__ */ new WeakMap();
function nodeSize(balanceType, node) {
  if (!balanceType.isAnonymous || node instanceof TreeBuffer || node.type != balanceType)
    return 1;
  let size = nodeSizeCache.get(node);
  if (size == null) {
    size = 1;
    for (let child of node.children) {
      if (child.type != balanceType || !(child instanceof Tree)) {
        size = 1;
        break;
      }
      size += nodeSize(balanceType, child);
    }
    nodeSizeCache.set(node, size);
  }
  return size;
}
function balanceRange(balanceType, children, positions, from, to, start, length, mkTop, mkTree) {
  let total = 0;
  for (let i = from; i < to; i++)
    total += nodeSize(balanceType, children[i]);
  let maxChild = Math.ceil(
    total * 1.5 / 8
    /* Balance.BranchFactor */
  );
  let localChildren = [], localPositions = [];
  function divide(children2, positions2, from2, to2, offset) {
    for (let i = from2; i < to2; ) {
      let groupFrom = i, groupStart = positions2[i], groupSize = nodeSize(balanceType, children2[i]);
      i++;
      for (; i < to2; i++) {
        let nextSize = nodeSize(balanceType, children2[i]);
        if (groupSize + nextSize >= maxChild)
          break;
        groupSize += nextSize;
      }
      if (i == groupFrom + 1) {
        if (groupSize > maxChild) {
          let only = children2[groupFrom];
          divide(only.children, only.positions, 0, only.children.length, positions2[groupFrom] + offset);
          continue;
        }
        localChildren.push(children2[groupFrom]);
      } else {
        let length2 = positions2[i - 1] + children2[i - 1].length - groupStart;
        localChildren.push(balanceRange(balanceType, children2, positions2, groupFrom, i, groupStart, length2, null, mkTree));
      }
      localPositions.push(groupStart + offset - start);
    }
  }
  divide(children, positions, from, to, 0);
  return (mkTop || mkTree)(localChildren, localPositions, length);
}
class NodeWeakMap {
  constructor() {
    this.map = /* @__PURE__ */ new WeakMap();
  }
  setBuffer(buffer, index, value) {
    let inner = this.map.get(buffer);
    if (!inner)
      this.map.set(buffer, inner = /* @__PURE__ */ new Map());
    inner.set(index, value);
  }
  getBuffer(buffer, index) {
    let inner = this.map.get(buffer);
    return inner && inner.get(index);
  }
  /// Set the value for this syntax node.
  set(node, value) {
    if (node instanceof BufferNode)
      this.setBuffer(node.context.buffer, node.index, value);
    else if (node instanceof TreeNode)
      this.map.set(node.tree, value);
  }
  /// Retrieve value for this syntax node, if it exists in the map.
  get(node) {
    return node instanceof BufferNode ? this.getBuffer(node.context.buffer, node.index) : node instanceof TreeNode ? this.map.get(node.tree) : void 0;
  }
  /// Set the value for the node that a cursor currently points to.
  cursorSet(cursor, value) {
    if (cursor.buffer)
      this.setBuffer(cursor.buffer.buffer, cursor.index, value);
    else
      this.map.set(cursor.tree, value);
  }
  /// Retrieve the value for the node that a cursor currently points
  /// to.
  cursorGet(cursor) {
    return cursor.buffer ? this.getBuffer(cursor.buffer.buffer, cursor.index) : this.map.get(cursor.tree);
  }
}
class TreeFragment {
  /// Construct a tree fragment. You'll usually want to use
  /// [`addTree`](#common.TreeFragment^addTree) and
  /// [`applyChanges`](#common.TreeFragment^applyChanges) instead of
  /// calling this directly.
  constructor(from, to, tree, offset, openStart = false, openEnd = false) {
    this.from = from;
    this.to = to;
    this.tree = tree;
    this.offset = offset;
    this.open = (openStart ? 1 : 0) | (openEnd ? 2 : 0);
  }
  /// Whether the start of the fragment represents the start of a
  /// parse, or the end of a change. (In the second case, it may not
  /// be safe to reuse some nodes at the start, depending on the
  /// parsing algorithm.)
  get openStart() {
    return (this.open & 1) > 0;
  }
  /// Whether the end of the fragment represents the end of a
  /// full-document parse, or the start of a change.
  get openEnd() {
    return (this.open & 2) > 0;
  }
  /// Create a set of fragments from a freshly parsed tree, or update
  /// an existing set of fragments by replacing the ones that overlap
  /// with a tree with content from the new tree. When `partial` is
  /// true, the parse is treated as incomplete, and the resulting
  /// fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
  /// true.
  static addTree(tree, fragments = [], partial = false) {
    let result = [new TreeFragment(0, tree.length, tree, 0, false, partial)];
    for (let f of fragments)
      if (f.to > tree.length)
        result.push(f);
    return result;
  }
  /// Apply a set of edits to an array of fragments, removing or
  /// splitting fragments as necessary to remove edited ranges, and
  /// adjusting offsets for fragments that moved.
  static applyChanges(fragments, changes, minGap = 128) {
    if (!changes.length)
      return fragments;
    let result = [];
    let fI = 1, nextF = fragments.length ? fragments[0] : null;
    for (let cI = 0, pos = 0, off = 0; ; cI++) {
      let nextC = cI < changes.length ? changes[cI] : null;
      let nextPos = nextC ? nextC.fromA : 1e9;
      if (nextPos - pos >= minGap)
        while (nextF && nextF.from < nextPos) {
          let cut = nextF;
          if (pos >= cut.from || nextPos <= cut.to || off) {
            let fFrom = Math.max(cut.from, pos) - off, fTo = Math.min(cut.to, nextPos) - off;
            cut = fFrom >= fTo ? null : new TreeFragment(fFrom, fTo, cut.tree, cut.offset + off, cI > 0, !!nextC);
          }
          if (cut)
            result.push(cut);
          if (nextF.to > nextPos)
            break;
          nextF = fI < fragments.length ? fragments[fI++] : null;
        }
      if (!nextC)
        break;
      pos = nextC.toA;
      off = nextC.toA - nextC.toB;
    }
    return result;
  }
}
class Parser {
  /// Start a parse, returning a [partial parse](#common.PartialParse)
  /// object. [`fragments`](#common.TreeFragment) can be passed in to
  /// make the parse incremental.
  ///
  /// By default, the entire input is parsed. You can pass `ranges`,
  /// which should be a sorted array of non-empty, non-overlapping
  /// ranges, to parse only those ranges. The tree returned in that
  /// case will start at `ranges[0].from`.
  startParse(input, fragments, ranges) {
    if (typeof input == "string")
      input = new StringInput(input);
    ranges = !ranges ? [new Range2(0, input.length)] : ranges.length ? ranges.map((r) => new Range2(r.from, r.to)) : [new Range2(0, 0)];
    return this.createParse(input, fragments || [], ranges);
  }
  /// Run a full parse, returning the resulting tree.
  parse(input, fragments, ranges) {
    let parse = this.startParse(input, fragments, ranges);
    for (; ; ) {
      let done = parse.advance();
      if (done)
        return done;
    }
  }
}
class StringInput {
  constructor(string2) {
    this.string = string2;
  }
  get length() {
    return this.string.length;
  }
  chunk(from) {
    return this.string.slice(from);
  }
  get lineChunks() {
    return false;
  }
  read(from, to) {
    return this.string.slice(from, to);
  }
}
new NodeProp({ perNode: true });
let nextTagID = 0;
class Tag {
  /// @internal
  constructor(set, base2, modified) {
    this.set = set;
    this.base = base2;
    this.modified = modified;
    this.id = nextTagID++;
  }
  /// Define a new tag. If `parent` is given, the tag is treated as a
  /// sub-tag of that parent, and
  /// [highlighters](#highlight.tagHighlighter) that don't mention
  /// this tag will try to fall back to the parent tag (or grandparent
  /// tag, etc).
  static define(parent) {
    if (parent === null || parent === void 0 ? void 0 : parent.base)
      throw new Error("Can not derive from a modified tag");
    let tag = new Tag([], null, []);
    tag.set.push(tag);
    if (parent)
      for (let t2 of parent.set)
        tag.set.push(t2);
    return tag;
  }
  /// Define a tag _modifier_, which is a function that, given a tag,
  /// will return a tag that is a subtag of the original. Applying the
  /// same modifier to a twice tag will return the same value (`m1(t1)
  /// == m1(t1)`) and applying multiple modifiers will, regardless or
  /// order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
  ///
  /// When multiple modifiers are applied to a given base tag, each
  /// smaller set of modifiers is registered as a parent, so that for
  /// example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
  /// `m1(m3(t1)`, and so on.
  static defineModifier() {
    let mod = new Modifier();
    return (tag) => {
      if (tag.modified.indexOf(mod) > -1)
        return tag;
      return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
    };
  }
}
let nextModifierID = 0;
class Modifier {
  constructor() {
    this.instances = [];
    this.id = nextModifierID++;
  }
  static get(base2, mods) {
    if (!mods.length)
      return base2;
    let exists = mods[0].instances.find((t2) => t2.base == base2 && sameArray(mods, t2.modified));
    if (exists)
      return exists;
    let set = [], tag = new Tag(set, base2, mods);
    for (let m of mods)
      m.instances.push(tag);
    let configs = powerSet(mods);
    for (let parent of base2.set)
      if (!parent.modified.length)
        for (let config2 of configs)
          set.push(Modifier.get(parent, config2));
    return tag;
  }
}
function sameArray(a, b) {
  return a.length == b.length && a.every((x, i) => x == b[i]);
}
function powerSet(array) {
  let sets = [[]];
  for (let i = 0; i < array.length; i++) {
    for (let j = 0, e = sets.length; j < e; j++) {
      sets.push(sets[j].concat(array[i]));
    }
  }
  return sets.sort((a, b) => b.length - a.length);
}
function styleTags(spec) {
  let byName = /* @__PURE__ */ Object.create(null);
  for (let prop in spec) {
    let tags2 = spec[prop];
    if (!Array.isArray(tags2))
      tags2 = [tags2];
    for (let part of prop.split(" "))
      if (part) {
        let pieces = [], mode = 2, rest = part;
        for (let pos = 0; ; ) {
          if (rest == "..." && pos > 0 && pos + 3 == part.length) {
            mode = 1;
            break;
          }
          let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest);
          if (!m)
            throw new RangeError("Invalid path: " + part);
          pieces.push(m[0] == "*" ? "" : m[0][0] == '"' ? JSON.parse(m[0]) : m[0]);
          pos += m[0].length;
          if (pos == part.length)
            break;
          let next = part[pos++];
          if (pos == part.length && next == "!") {
            mode = 0;
            break;
          }
          if (next != "/")
            throw new RangeError("Invalid path: " + part);
          rest = part.slice(pos);
        }
        let last = pieces.length - 1, inner = pieces[last];
        if (!inner)
          throw new RangeError("Invalid path: " + part);
        let rule = new Rule(tags2, mode, last > 0 ? pieces.slice(0, last) : null);
        byName[inner] = rule.sort(byName[inner]);
      }
  }
  return ruleNodeProp.add(byName);
}
const ruleNodeProp = new NodeProp();
class Rule {
  constructor(tags2, mode, context, next) {
    this.tags = tags2;
    this.mode = mode;
    this.context = context;
    this.next = next;
  }
  get opaque() {
    return this.mode == 0;
  }
  get inherit() {
    return this.mode == 1;
  }
  sort(other) {
    if (!other || other.depth < this.depth) {
      this.next = other;
      return this;
    }
    other.next = this.sort(other.next);
    return other;
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
}
Rule.empty = new Rule([], 2, null);
function tagHighlighter(tags2, options) {
  let map = /* @__PURE__ */ Object.create(null);
  for (let style of tags2) {
    if (!Array.isArray(style.tag))
      map[style.tag.id] = style.class;
    else
      for (let tag of style.tag)
        map[tag.id] = style.class;
  }
  let { scope, all = null } = options || {};
  return {
    style: (tags3) => {
      let cls = all;
      for (let tag of tags3) {
        for (let sub of tag.set) {
          let tagClass = map[sub.id];
          if (tagClass) {
            cls = cls ? cls + " " + tagClass : tagClass;
            break;
          }
        }
      }
      return cls;
    },
    scope
  };
}
function highlightTags(highlighters, tags2) {
  let result = null;
  for (let highlighter of highlighters) {
    let value = highlighter.style(tags2);
    if (value)
      result = result ? result + " " + value : value;
  }
  return result;
}
function highlightTree(tree, highlighter, putStyle, from = 0, to = tree.length) {
  let builder = new HighlightBuilder(from, Array.isArray(highlighter) ? highlighter : [highlighter], putStyle);
  builder.highlightRange(tree.cursor(), from, to, "", builder.highlighters);
  builder.flush(to);
}
class HighlightBuilder {
  constructor(at, highlighters, span) {
    this.at = at;
    this.highlighters = highlighters;
    this.span = span;
    this.class = "";
  }
  startSpan(at, cls) {
    if (cls != this.class) {
      this.flush(at);
      if (at > this.at)
        this.at = at;
      this.class = cls;
    }
  }
  flush(to) {
    if (to > this.at && this.class)
      this.span(this.at, to, this.class);
  }
  highlightRange(cursor, from, to, inheritedClass, highlighters) {
    let { type, from: start, to: end } = cursor;
    if (start >= to || end <= from)
      return;
    if (type.isTop)
      highlighters = this.highlighters.filter((h) => !h.scope || h.scope(type));
    let cls = inheritedClass;
    let rule = getStyleTags(cursor) || Rule.empty;
    let tagCls = highlightTags(highlighters, rule.tags);
    if (tagCls) {
      if (cls)
        cls += " ";
      cls += tagCls;
      if (rule.mode == 1)
        inheritedClass += (inheritedClass ? " " : "") + tagCls;
    }
    this.startSpan(cursor.from, cls);
    if (rule.opaque)
      return;
    let mounted = cursor.tree && cursor.tree.prop(NodeProp.mounted);
    if (mounted && mounted.overlay) {
      let inner = cursor.node.enter(mounted.overlay[0].from + start, 1);
      let innerHighlighters = this.highlighters.filter((h) => !h.scope || h.scope(mounted.tree.type));
      let hasChild2 = cursor.firstChild();
      for (let i = 0, pos = start; ; i++) {
        let next = i < mounted.overlay.length ? mounted.overlay[i] : null;
        let nextPos = next ? next.from + start : end;
        let rangeFrom = Math.max(from, pos), rangeTo = Math.min(to, nextPos);
        if (rangeFrom < rangeTo && hasChild2) {
          while (cursor.from < rangeTo) {
            this.highlightRange(cursor, rangeFrom, rangeTo, inheritedClass, highlighters);
            this.startSpan(Math.min(rangeTo, cursor.to), cls);
            if (cursor.to >= nextPos || !cursor.nextSibling())
              break;
          }
        }
        if (!next || nextPos > to)
          break;
        pos = next.to + start;
        if (pos > from) {
          this.highlightRange(inner.cursor(), Math.max(from, next.from + start), Math.min(to, pos), inheritedClass, innerHighlighters);
          this.startSpan(pos, cls);
        }
      }
      if (hasChild2)
        cursor.parent();
    } else if (cursor.firstChild()) {
      do {
        if (cursor.to <= from)
          continue;
        if (cursor.from >= to)
          break;
        this.highlightRange(cursor, from, to, inheritedClass, highlighters);
        this.startSpan(Math.min(to, cursor.to), cls);
      } while (cursor.nextSibling());
      cursor.parent();
    }
  }
}
function getStyleTags(node) {
  let rule = node.type.prop(ruleNodeProp);
  while (rule && rule.context && !node.matchContext(rule.context))
    rule = rule.next;
  return rule || null;
}
const t = Tag.define;
const comment = t(), name = t(), typeName = t(name), propertyName = t(name), literal = t(), string = t(literal), number = t(literal), content = t(), heading = t(content), keyword = t(), operator = t(), punctuation = t(), bracket = t(punctuation), meta = t();
const tags = {
  /// A comment.
  comment,
  /// A line [comment](#highlight.tags.comment).
  lineComment: t(comment),
  /// A block [comment](#highlight.tags.comment).
  blockComment: t(comment),
  /// A documentation [comment](#highlight.tags.comment).
  docComment: t(comment),
  /// Any kind of identifier.
  name,
  /// The [name](#highlight.tags.name) of a variable.
  variableName: t(name),
  /// A type [name](#highlight.tags.name).
  typeName,
  /// A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  tagName: t(typeName),
  /// A property or field [name](#highlight.tags.name).
  propertyName,
  /// An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  attributeName: t(propertyName),
  /// The [name](#highlight.tags.name) of a class.
  className: t(name),
  /// A label [name](#highlight.tags.name).
  labelName: t(name),
  /// A namespace [name](#highlight.tags.name).
  namespace: t(name),
  /// The [name](#highlight.tags.name) of a macro.
  macroName: t(name),
  /// A literal value.
  literal,
  /// A string [literal](#highlight.tags.literal).
  string,
  /// A documentation [string](#highlight.tags.string).
  docString: t(string),
  /// A character literal (subtag of [string](#highlight.tags.string)).
  character: t(string),
  /// An attribute value (subtag of [string](#highlight.tags.string)).
  attributeValue: t(string),
  /// A number [literal](#highlight.tags.literal).
  number,
  /// An integer [number](#highlight.tags.number) literal.
  integer: t(number),
  /// A floating-point [number](#highlight.tags.number) literal.
  float: t(number),
  /// A boolean [literal](#highlight.tags.literal).
  bool: t(literal),
  /// Regular expression [literal](#highlight.tags.literal).
  regexp: t(literal),
  /// An escape [literal](#highlight.tags.literal), for example a
  /// backslash escape in a string.
  escape: t(literal),
  /// A color [literal](#highlight.tags.literal).
  color: t(literal),
  /// A URL [literal](#highlight.tags.literal).
  url: t(literal),
  /// A language keyword.
  keyword,
  /// The [keyword](#highlight.tags.keyword) for the self or this
  /// object.
  self: t(keyword),
  /// The [keyword](#highlight.tags.keyword) for null.
  null: t(keyword),
  /// A [keyword](#highlight.tags.keyword) denoting some atomic value.
  atom: t(keyword),
  /// A [keyword](#highlight.tags.keyword) that represents a unit.
  unit: t(keyword),
  /// A modifier [keyword](#highlight.tags.keyword).
  modifier: t(keyword),
  /// A [keyword](#highlight.tags.keyword) that acts as an operator.
  operatorKeyword: t(keyword),
  /// A control-flow related [keyword](#highlight.tags.keyword).
  controlKeyword: t(keyword),
  /// A [keyword](#highlight.tags.keyword) that defines something.
  definitionKeyword: t(keyword),
  /// A [keyword](#highlight.tags.keyword) related to defining or
  /// interfacing with modules.
  moduleKeyword: t(keyword),
  /// An operator.
  operator,
  /// An [operator](#highlight.tags.operator) that dereferences something.
  derefOperator: t(operator),
  /// Arithmetic-related [operator](#highlight.tags.operator).
  arithmeticOperator: t(operator),
  /// Logical [operator](#highlight.tags.operator).
  logicOperator: t(operator),
  /// Bit [operator](#highlight.tags.operator).
  bitwiseOperator: t(operator),
  /// Comparison [operator](#highlight.tags.operator).
  compareOperator: t(operator),
  /// [Operator](#highlight.tags.operator) that updates its operand.
  updateOperator: t(operator),
  /// [Operator](#highlight.tags.operator) that defines something.
  definitionOperator: t(operator),
  /// Type-related [operator](#highlight.tags.operator).
  typeOperator: t(operator),
  /// Control-flow [operator](#highlight.tags.operator).
  controlOperator: t(operator),
  /// Program or markup punctuation.
  punctuation,
  /// [Punctuation](#highlight.tags.punctuation) that separates
  /// things.
  separator: t(punctuation),
  /// Bracket-style [punctuation](#highlight.tags.punctuation).
  bracket,
  /// Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  /// tokens).
  angleBracket: t(bracket),
  /// Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  /// tokens).
  squareBracket: t(bracket),
  /// Parentheses (usually `(` and `)` tokens). Subtag of
  /// [bracket](#highlight.tags.bracket).
  paren: t(bracket),
  /// Braces (usually `{` and `}` tokens). Subtag of
  /// [bracket](#highlight.tags.bracket).
  brace: t(bracket),
  /// Content, for example plain text in XML or markup documents.
  content,
  /// [Content](#highlight.tags.content) that represents a heading.
  heading,
  /// A level 1 [heading](#highlight.tags.heading).
  heading1: t(heading),
  /// A level 2 [heading](#highlight.tags.heading).
  heading2: t(heading),
  /// A level 3 [heading](#highlight.tags.heading).
  heading3: t(heading),
  /// A level 4 [heading](#highlight.tags.heading).
  heading4: t(heading),
  /// A level 5 [heading](#highlight.tags.heading).
  heading5: t(heading),
  /// A level 6 [heading](#highlight.tags.heading).
  heading6: t(heading),
  /// A prose separator (such as a horizontal rule).
  contentSeparator: t(content),
  /// [Content](#highlight.tags.content) that represents a list.
  list: t(content),
  /// [Content](#highlight.tags.content) that represents a quote.
  quote: t(content),
  /// [Content](#highlight.tags.content) that is emphasized.
  emphasis: t(content),
  /// [Content](#highlight.tags.content) that is styled strong.
  strong: t(content),
  /// [Content](#highlight.tags.content) that is part of a link.
  link: t(content),
  /// [Content](#highlight.tags.content) that is styled as code or
  /// monospace.
  monospace: t(content),
  /// [Content](#highlight.tags.content) that has a strike-through
  /// style.
  strikethrough: t(content),
  /// Inserted text in a change-tracking format.
  inserted: t(),
  /// Deleted text.
  deleted: t(),
  /// Changed text.
  changed: t(),
  /// An invalid or unsyntactic element.
  invalid: t(),
  /// Metadata or meta-instruction.
  meta,
  /// [Metadata](#highlight.tags.meta) that applies to the entire
  /// document.
  documentMeta: t(meta),
  /// [Metadata](#highlight.tags.meta) that annotates or adds
  /// attributes to a given syntactic element.
  annotation: t(meta),
  /// Processing instruction or preprocessor directive. Subtag of
  /// [meta](#highlight.tags.meta).
  processingInstruction: t(meta),
  /// [Modifier](#highlight.Tag^defineModifier) that indicates that a
  /// given element is being defined. Expected to be used with the
  /// various [name](#highlight.tags.name) tags.
  definition: Tag.defineModifier(),
  /// [Modifier](#highlight.Tag^defineModifier) that indicates that
  /// something is constant. Mostly expected to be used with
  /// [variable names](#highlight.tags.variableName).
  constant: Tag.defineModifier(),
  /// [Modifier](#highlight.Tag^defineModifier) used to indicate that
  /// a [variable](#highlight.tags.variableName) or [property
  /// name](#highlight.tags.propertyName) is being called or defined
  /// as a function.
  function: Tag.defineModifier(),
  /// [Modifier](#highlight.Tag^defineModifier) that can be applied to
  /// [names](#highlight.tags.name) to indicate that they belong to
  /// the language's standard environment.
  standard: Tag.defineModifier(),
  /// [Modifier](#highlight.Tag^defineModifier) that indicates a given
  /// [names](#highlight.tags.name) is local to some scope.
  local: Tag.defineModifier(),
  /// A generic variant [modifier](#highlight.Tag^defineModifier) that
  /// can be used to tag language-specific alternative variants of
  /// some common tag. It is recommended for themes to define special
  /// forms of at least the [string](#highlight.tags.string) and
  /// [variable name](#highlight.tags.variableName) tags, since those
  /// come up a lot.
  special: Tag.defineModifier()
};
tagHighlighter([
  { tag: tags.link, class: "tok-link" },
  { tag: tags.heading, class: "tok-heading" },
  { tag: tags.emphasis, class: "tok-emphasis" },
  { tag: tags.strong, class: "tok-strong" },
  { tag: tags.keyword, class: "tok-keyword" },
  { tag: tags.atom, class: "tok-atom" },
  { tag: tags.bool, class: "tok-bool" },
  { tag: tags.url, class: "tok-url" },
  { tag: tags.labelName, class: "tok-labelName" },
  { tag: tags.inserted, class: "tok-inserted" },
  { tag: tags.deleted, class: "tok-deleted" },
  { tag: tags.literal, class: "tok-literal" },
  { tag: tags.string, class: "tok-string" },
  { tag: tags.number, class: "tok-number" },
  { tag: [tags.regexp, tags.escape, tags.special(tags.string)], class: "tok-string2" },
  { tag: tags.variableName, class: "tok-variableName" },
  { tag: tags.local(tags.variableName), class: "tok-variableName tok-local" },
  { tag: tags.definition(tags.variableName), class: "tok-variableName tok-definition" },
  { tag: tags.special(tags.variableName), class: "tok-variableName2" },
  { tag: tags.definition(tags.propertyName), class: "tok-propertyName tok-definition" },
  { tag: tags.typeName, class: "tok-typeName" },
  { tag: tags.namespace, class: "tok-namespace" },
  { tag: tags.className, class: "tok-className" },
  { tag: tags.macroName, class: "tok-macroName" },
  { tag: tags.propertyName, class: "tok-propertyName" },
  { tag: tags.operator, class: "tok-operator" },
  { tag: tags.comment, class: "tok-comment" },
  { tag: tags.meta, class: "tok-meta" },
  { tag: tags.invalid, class: "tok-invalid" },
  { tag: tags.punctuation, class: "tok-punctuation" }
]);
var _a;
const languageDataProp = /* @__PURE__ */ new NodeProp();
function defineLanguageFacet(baseData) {
  return Facet.define({
    combine: baseData ? (values) => values.concat(baseData) : void 0
  });
}
const sublanguageProp = /* @__PURE__ */ new NodeProp();
class Language {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(data, parser2, extraExtensions = [], name2 = "") {
    this.data = data;
    this.name = name2;
    if (!EditorState.prototype.hasOwnProperty("tree"))
      Object.defineProperty(EditorState.prototype, "tree", { get() {
        return syntaxTree(this);
      } });
    this.parser = parser2;
    this.extension = [
      language.of(this),
      EditorState.languageData.of((state, pos, side) => {
        let top2 = topNodeAt(state, pos, side), data2 = top2.type.prop(languageDataProp);
        if (!data2)
          return [];
        let base2 = state.facet(data2), sub = top2.type.prop(sublanguageProp);
        if (sub) {
          let innerNode = top2.resolve(pos - top2.from, side);
          for (let sublang of sub)
            if (sublang.test(innerNode, state)) {
              let data3 = state.facet(sublang.facet);
              return sublang.type == "replace" ? data3 : data3.concat(base2);
            }
        }
        return base2;
      })
    ].concat(extraExtensions);
  }
  /**
  Query whether this language is active at the given position.
  */
  isActiveAt(state, pos, side = -1) {
    return topNodeAt(state, pos, side).type.prop(languageDataProp) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(state) {
    let lang2 = state.facet(language);
    if ((lang2 === null || lang2 === void 0 ? void 0 : lang2.data) == this.data)
      return [{ from: 0, to: state.doc.length }];
    if (!lang2 || !lang2.allowsNesting)
      return [];
    let result = [];
    let explore = (tree, from) => {
      if (tree.prop(languageDataProp) == this.data) {
        result.push({ from, to: from + tree.length });
        return;
      }
      let mount = tree.prop(NodeProp.mounted);
      if (mount) {
        if (mount.tree.prop(languageDataProp) == this.data) {
          if (mount.overlay)
            for (let r of mount.overlay)
              result.push({ from: r.from + from, to: r.to + from });
          else
            result.push({ from, to: from + tree.length });
          return;
        } else if (mount.overlay) {
          let size = result.length;
          explore(mount.tree, mount.overlay[0].from + from);
          if (result.length > size)
            return;
        }
      }
      for (let i = 0; i < tree.children.length; i++) {
        let ch = tree.children[i];
        if (ch instanceof Tree)
          explore(ch, tree.positions[i] + from);
      }
    };
    explore(syntaxTree(state), 0);
    return result;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return true;
  }
}
Language.setState = /* @__PURE__ */ StateEffect.define();
function topNodeAt(state, pos, side) {
  let topLang = state.facet(language), tree = syntaxTree(state).topNode;
  if (!topLang || topLang.allowsNesting) {
    for (let node = tree; node; node = node.enter(pos, side, IterMode.ExcludeBuffers))
      if (node.type.isTop)
        tree = node;
  }
  return tree;
}
class LRLanguage extends Language {
  constructor(data, parser2, name2) {
    super(data, parser2, [], name2);
    this.parser = parser2;
  }
  /**
  Define a language from a parser.
  */
  static define(spec) {
    let data = defineLanguageFacet(spec.languageData);
    return new LRLanguage(data, spec.parser.configure({
      props: [languageDataProp.add((type) => type.isTop ? data : void 0)]
    }), spec.name);
  }
  /**
  Create a new instance of this language with a reconfigured
  version of its parser and optionally a new name.
  */
  configure(options, name2) {
    return new LRLanguage(this.data, this.parser.configure(options), name2 || this.name);
  }
  get allowsNesting() {
    return this.parser.hasWrappers();
  }
}
function syntaxTree(state) {
  let field = state.field(Language.state, false);
  return field ? field.tree : Tree.empty;
}
class DocInput {
  constructor(doc2) {
    this.doc = doc2;
    this.cursorPos = 0;
    this.string = "";
    this.cursor = doc2.iter();
  }
  get length() {
    return this.doc.length;
  }
  syncTo(pos) {
    this.string = this.cursor.next(pos - this.cursorPos).value;
    this.cursorPos = pos + this.string.length;
    return this.cursorPos - this.string.length;
  }
  chunk(pos) {
    this.syncTo(pos);
    return this.string;
  }
  get lineChunks() {
    return true;
  }
  read(from, to) {
    let stringStart = this.cursorPos - this.string.length;
    if (from < stringStart || to >= this.cursorPos)
      return this.doc.sliceString(from, to);
    else
      return this.string.slice(from - stringStart, to - stringStart);
  }
}
let currentContext = null;
class ParseContext {
  constructor(parser2, state, fragments = [], tree, treeLen, viewport, skipped, scheduleOn) {
    this.parser = parser2;
    this.state = state;
    this.fragments = fragments;
    this.tree = tree;
    this.treeLen = treeLen;
    this.viewport = viewport;
    this.skipped = skipped;
    this.scheduleOn = scheduleOn;
    this.parse = null;
    this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(parser2, state, viewport) {
    return new ParseContext(parser2, state, [], Tree.empty, 0, viewport, [], null);
  }
  startParse() {
    return this.parser.startParse(new DocInput(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(until, upto) {
    if (upto != null && upto >= this.state.doc.length)
      upto = void 0;
    if (this.tree != Tree.empty && this.isDone(upto !== null && upto !== void 0 ? upto : this.state.doc.length)) {
      this.takeTree();
      return true;
    }
    return this.withContext(() => {
      var _a2;
      if (typeof until == "number") {
        let endTime = Date.now() + until;
        until = () => Date.now() > endTime;
      }
      if (!this.parse)
        this.parse = this.startParse();
      if (upto != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > upto) && upto < this.state.doc.length)
        this.parse.stopAt(upto);
      for (; ; ) {
        let done = this.parse.advance();
        if (done) {
          this.fragments = this.withoutTempSkipped(TreeFragment.addTree(done, this.fragments, this.parse.stoppedAt != null));
          this.treeLen = (_a2 = this.parse.stoppedAt) !== null && _a2 !== void 0 ? _a2 : this.state.doc.length;
          this.tree = done;
          this.parse = null;
          if (this.treeLen < (upto !== null && upto !== void 0 ? upto : this.state.doc.length))
            this.parse = this.startParse();
          else
            return true;
        }
        if (until())
          return false;
      }
    });
  }
  /**
  @internal
  */
  takeTree() {
    let pos, tree;
    if (this.parse && (pos = this.parse.parsedPos) >= this.treeLen) {
      if (this.parse.stoppedAt == null || this.parse.stoppedAt > pos)
        this.parse.stopAt(pos);
      this.withContext(() => {
        while (!(tree = this.parse.advance())) {
        }
      });
      this.treeLen = pos;
      this.tree = tree;
      this.fragments = this.withoutTempSkipped(TreeFragment.addTree(this.tree, this.fragments, true));
      this.parse = null;
    }
  }
  withContext(f) {
    let prev = currentContext;
    currentContext = this;
    try {
      return f();
    } finally {
      currentContext = prev;
    }
  }
  withoutTempSkipped(fragments) {
    for (let r; r = this.tempSkipped.pop(); )
      fragments = cutFragments(fragments, r.from, r.to);
    return fragments;
  }
  /**
  @internal
  */
  changes(changes, newState) {
    let { fragments, tree, treeLen, viewport, skipped } = this;
    this.takeTree();
    if (!changes.empty) {
      let ranges = [];
      changes.iterChangedRanges((fromA, toA, fromB, toB) => ranges.push({ fromA, toA, fromB, toB }));
      fragments = TreeFragment.applyChanges(fragments, ranges);
      tree = Tree.empty;
      treeLen = 0;
      viewport = { from: changes.mapPos(viewport.from, -1), to: changes.mapPos(viewport.to, 1) };
      if (this.skipped.length) {
        skipped = [];
        for (let r of this.skipped) {
          let from = changes.mapPos(r.from, 1), to = changes.mapPos(r.to, -1);
          if (from < to)
            skipped.push({ from, to });
        }
      }
    }
    return new ParseContext(this.parser, newState, fragments, tree, treeLen, viewport, skipped, this.scheduleOn);
  }
  /**
  @internal
  */
  updateViewport(viewport) {
    if (this.viewport.from == viewport.from && this.viewport.to == viewport.to)
      return false;
    this.viewport = viewport;
    let startLen = this.skipped.length;
    for (let i = 0; i < this.skipped.length; i++) {
      let { from, to } = this.skipped[i];
      if (from < viewport.to && to > viewport.from) {
        this.fragments = cutFragments(this.fragments, from, to);
        this.skipped.splice(i--, 1);
      }
    }
    if (this.skipped.length >= startLen)
      return false;
    this.reset();
    return true;
  }
  /**
  @internal
  */
  reset() {
    if (this.parse) {
      this.takeTree();
      this.parse = null;
    }
  }
  /**
  Notify the parse scheduler that the given region was skipped
  because it wasn't in view, and the parse should be restarted
  when it comes into view.
  */
  skipUntilInView(from, to) {
    this.skipped.push({ from, to });
  }
  /**
  Returns a parser intended to be used as placeholder when
  asynchronously loading a nested parser. It'll skip its input and
  mark it as not-really-parsed, so that the next update will parse
  it again.
  
  When `until` is given, a reparse will be scheduled when that
  promise resolves.
  */
  static getSkippingParser(until) {
    return new class extends Parser {
      createParse(input, fragments, ranges) {
        let from = ranges[0].from, to = ranges[ranges.length - 1].to;
        let parser2 = {
          parsedPos: from,
          advance() {
            let cx = currentContext;
            if (cx) {
              for (let r of ranges)
                cx.tempSkipped.push(r);
              if (until)
                cx.scheduleOn = cx.scheduleOn ? Promise.all([cx.scheduleOn, until]) : until;
            }
            this.parsedPos = to;
            return new Tree(NodeType.none, [], [], to - from);
          },
          stoppedAt: null,
          stopAt() {
          }
        };
        return parser2;
      }
    }();
  }
  /**
  @internal
  */
  isDone(upto) {
    upto = Math.min(upto, this.state.doc.length);
    let frags = this.fragments;
    return this.treeLen >= upto && frags.length && frags[0].from == 0 && frags[0].to >= upto;
  }
  /**
  Get the context for the current parse, or `null` if no editor
  parse is in progress.
  */
  static get() {
    return currentContext;
  }
}
function cutFragments(fragments, from, to) {
  return TreeFragment.applyChanges(fragments, [{ fromA: from, toA: to, fromB: from, toB: to }]);
}
class LanguageState {
  constructor(context) {
    this.context = context;
    this.tree = context.tree;
  }
  apply(tr) {
    if (!tr.docChanged && this.tree == this.context.tree)
      return this;
    let newCx = this.context.changes(tr.changes, tr.state);
    let upto = this.context.treeLen == tr.startState.doc.length ? void 0 : Math.max(tr.changes.mapPos(this.context.treeLen), newCx.viewport.to);
    if (!newCx.work(20, upto))
      newCx.takeTree();
    return new LanguageState(newCx);
  }
  static init(state) {
    let vpTo = Math.min(3e3, state.doc.length);
    let parseState = ParseContext.create(state.facet(language).parser, state, { from: 0, to: vpTo });
    if (!parseState.work(20, vpTo))
      parseState.takeTree();
    return new LanguageState(parseState);
  }
}
Language.state = /* @__PURE__ */ StateField.define({
  create: LanguageState.init,
  update(value, tr) {
    for (let e of tr.effects)
      if (e.is(Language.setState))
        return e.value;
    if (tr.startState.facet(language) != tr.state.facet(language))
      return LanguageState.init(tr.state);
    return value.apply(tr);
  }
});
let requestIdle = (callback) => {
  let timeout = setTimeout(
    () => callback(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(timeout);
};
if (typeof requestIdleCallback != "undefined")
  requestIdle = (callback) => {
    let idle = -1, timeout = setTimeout(
      () => {
        idle = requestIdleCallback(callback, {
          timeout: 500 - 100
          /* Work.MinPause */
        });
      },
      100
      /* Work.MinPause */
    );
    return () => idle < 0 ? clearTimeout(timeout) : cancelIdleCallback(idle);
  };
const isInputPending = typeof navigator != "undefined" && ((_a = navigator.scheduling) === null || _a === void 0 ? void 0 : _a.isInputPending) ? () => navigator.scheduling.isInputPending() : null;
const parseWorker = /* @__PURE__ */ ViewPlugin.fromClass(class ParseWorker {
  constructor(view) {
    this.view = view;
    this.working = null;
    this.workScheduled = 0;
    this.chunkEnd = -1;
    this.chunkBudget = -1;
    this.work = this.work.bind(this);
    this.scheduleWork();
  }
  update(update) {
    let cx = this.view.state.field(Language.state).context;
    if (cx.updateViewport(update.view.viewport) || this.view.viewport.to > cx.treeLen)
      this.scheduleWork();
    if (update.docChanged) {
      if (this.view.hasFocus)
        this.chunkBudget += 50;
      this.scheduleWork();
    }
    this.checkAsyncSchedule(cx);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state } = this.view, field = state.field(Language.state);
    if (field.tree != field.context.tree || !field.context.isDone(state.doc.length))
      this.working = requestIdle(this.work);
  }
  work(deadline) {
    this.working = null;
    let now = Date.now();
    if (this.chunkEnd < now && (this.chunkEnd < 0 || this.view.hasFocus)) {
      this.chunkEnd = now + 3e4;
      this.chunkBudget = 3e3;
    }
    if (this.chunkBudget <= 0)
      return;
    let { state, viewport: { to: vpTo } } = this.view, field = state.field(Language.state);
    if (field.tree == field.context.tree && field.context.isDone(
      vpTo + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let endTime = Date.now() + Math.min(this.chunkBudget, 100, deadline && !isInputPending ? Math.max(25, deadline.timeRemaining() - 5) : 1e9);
    let viewportFirst = field.context.treeLen < vpTo && state.doc.length > vpTo + 1e3;
    let done = field.context.work(() => {
      return isInputPending && isInputPending() || Date.now() > endTime;
    }, vpTo + (viewportFirst ? 0 : 1e5));
    this.chunkBudget -= Date.now() - now;
    if (done || this.chunkBudget <= 0) {
      field.context.takeTree();
      this.view.dispatch({ effects: Language.setState.of(new LanguageState(field.context)) });
    }
    if (this.chunkBudget > 0 && !(done && !viewportFirst))
      this.scheduleWork();
    this.checkAsyncSchedule(field.context);
  }
  checkAsyncSchedule(cx) {
    if (cx.scheduleOn) {
      this.workScheduled++;
      cx.scheduleOn.then(() => this.scheduleWork()).catch((err) => logException(this.view.state, err)).then(() => this.workScheduled--);
      cx.scheduleOn = null;
    }
  }
  destroy() {
    if (this.working)
      this.working();
  }
  isWorking() {
    return !!(this.working || this.workScheduled > 0);
  }
}, {
  eventHandlers: { focus() {
    this.scheduleWork();
  } }
});
const language = /* @__PURE__ */ Facet.define({
  combine(languages) {
    return languages.length ? languages[0] : null;
  },
  enables: (language2) => [
    Language.state,
    parseWorker,
    EditorView.contentAttributes.compute([language2], (state) => {
      let lang2 = state.facet(language2);
      return lang2 && lang2.name ? { "data-language": lang2.name } : {};
    })
  ]
});
class LanguageSupport {
  /**
  Create a language support object.
  */
  constructor(language2, support = []) {
    this.language = language2;
    this.support = support;
    this.extension = [language2, support];
  }
}
const indentService = /* @__PURE__ */ Facet.define();
const indentUnit = /* @__PURE__ */ Facet.define({
  combine: (values) => {
    if (!values.length)
      return "  ";
    let unit = values[0];
    if (!unit || /\S/.test(unit) || Array.from(unit).some((e) => e != unit[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(values[0]));
    return unit;
  }
});
function getIndentUnit(state) {
  let unit = state.facet(indentUnit);
  return unit.charCodeAt(0) == 9 ? state.tabSize * unit.length : unit.length;
}
function indentString(state, cols) {
  let result = "", ts = state.tabSize, ch = state.facet(indentUnit)[0];
  if (ch == "	") {
    while (cols >= ts) {
      result += "	";
      cols -= ts;
    }
    ch = " ";
  }
  for (let i = 0; i < cols; i++)
    result += ch;
  return result;
}
function getIndentation(context, pos) {
  if (context instanceof EditorState)
    context = new IndentContext(context);
  for (let service of context.state.facet(indentService)) {
    let result = service(context, pos);
    if (result !== void 0)
      return result;
  }
  let tree = syntaxTree(context.state);
  return tree ? syntaxIndentation(context, tree, pos) : null;
}
class IndentContext {
  /**
  Create an indent context.
  */
  constructor(state, options = {}) {
    this.state = state;
    this.options = options;
    this.unit = getIndentUnit(state);
  }
  /**
  Get a description of the line at the given position, taking
  [simulated line
  breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  into account. If there is such a break at `pos`, the `bias`
  argument determines whether the part of the line line before or
  after the break is used.
  */
  lineAt(pos, bias = 1) {
    let line = this.state.doc.lineAt(pos);
    let { simulateBreak, simulateDoubleBreak } = this.options;
    if (simulateBreak != null && simulateBreak >= line.from && simulateBreak <= line.to) {
      if (simulateDoubleBreak && simulateBreak == pos)
        return { text: "", from: pos };
      else if (bias < 0 ? simulateBreak < pos : simulateBreak <= pos)
        return { text: line.text.slice(simulateBreak - line.from), from: simulateBreak };
      else
        return { text: line.text.slice(0, simulateBreak - line.from), from: line.from };
    }
    return line;
  }
  /**
  Get the text directly after `pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  textAfterPos(pos, bias = 1) {
    if (this.options.simulateDoubleBreak && pos == this.options.simulateBreak)
      return "";
    let { text, from } = this.lineAt(pos, bias);
    return text.slice(pos - from, Math.min(text.length, pos + 100 - from));
  }
  /**
  Find the column for the given position.
  */
  column(pos, bias = 1) {
    let { text, from } = this.lineAt(pos, bias);
    let result = this.countColumn(text, pos - from);
    let override = this.options.overrideIndentation ? this.options.overrideIndentation(from) : -1;
    if (override > -1)
      result += override - this.countColumn(text, text.search(/\S|$/));
    return result;
  }
  /**
  Find the column position (taking tabs into account) of the given
  position in the given string.
  */
  countColumn(line, pos = line.length) {
    return countColumn(line, this.state.tabSize, pos);
  }
  /**
  Find the indentation column of the line at the given point.
  */
  lineIndent(pos, bias = 1) {
    let { text, from } = this.lineAt(pos, bias);
    let override = this.options.overrideIndentation;
    if (override) {
      let overriden = override(from);
      if (overriden > -1)
        return overriden;
    }
    return this.countColumn(text, text.search(/\S|$/));
  }
  /**
  Returns the [simulated line
  break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  for this context, if any.
  */
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
}
const indentNodeProp = /* @__PURE__ */ new NodeProp();
function syntaxIndentation(cx, ast, pos) {
  return indentFrom(ast.resolveInner(pos).enterUnfinishedNodesBefore(pos), pos, cx);
}
function ignoreClosed(cx) {
  return cx.pos == cx.options.simulateBreak && cx.options.simulateDoubleBreak;
}
function indentStrategy(tree) {
  let strategy = tree.type.prop(indentNodeProp);
  if (strategy)
    return strategy;
  let first = tree.firstChild, close;
  if (first && (close = first.type.prop(NodeProp.closedBy))) {
    let last = tree.lastChild, closed = last && close.indexOf(last.name) > -1;
    return (cx) => delimitedStrategy(cx, true, 1, void 0, closed && !ignoreClosed(cx) ? last.from : void 0);
  }
  return tree.parent == null ? topIndent : null;
}
function indentFrom(node, pos, base2) {
  for (; node; node = node.parent) {
    let strategy = indentStrategy(node);
    if (strategy)
      return strategy(TreeIndentContext.create(base2, pos, node));
  }
  return null;
}
function topIndent() {
  return 0;
}
class TreeIndentContext extends IndentContext {
  constructor(base2, pos, node) {
    super(base2.state, base2.options);
    this.base = base2;
    this.pos = pos;
    this.node = node;
  }
  /**
  @internal
  */
  static create(base2, pos, node) {
    return new TreeIndentContext(base2, pos, node);
  }
  /**
  Get the text directly after `this.pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  /**
  Get the indentation at the reference line for `this.node`, which
  is the line on which it starts, unless there is a node that is
  _not_ a parent of this node covering the start of that line. If
  so, the line at the start of that node is tried, again skipping
  on if it is covered by another such node.
  */
  get baseIndent() {
    let line = this.state.doc.lineAt(this.node.from);
    for (; ; ) {
      let atBreak = this.node.resolve(line.from);
      while (atBreak.parent && atBreak.parent.from == atBreak.from)
        atBreak = atBreak.parent;
      if (isParent(atBreak, this.node))
        break;
      line = this.state.doc.lineAt(atBreak.from);
    }
    return this.lineIndent(line.from);
  }
  /**
  Continue looking for indentations in the node's parent nodes,
  and return the result of that.
  */
  continue() {
    let parent = this.node.parent;
    return parent ? indentFrom(parent, this.pos, this.base) : 0;
  }
}
function isParent(parent, of) {
  for (let cur2 = of; cur2; cur2 = cur2.parent)
    if (parent == cur2)
      return true;
  return false;
}
function bracketedAligned(context) {
  let tree = context.node;
  let openToken = tree.childAfter(tree.from), last = tree.lastChild;
  if (!openToken)
    return null;
  let sim = context.options.simulateBreak;
  let openLine = context.state.doc.lineAt(openToken.from);
  let lineEnd = sim == null || sim <= openLine.from ? openLine.to : Math.min(openLine.to, sim);
  for (let pos = openToken.to; ; ) {
    let next = tree.childAfter(pos);
    if (!next || next == last)
      return null;
    if (!next.type.isSkipped)
      return next.from < lineEnd ? openToken : null;
    pos = next.to;
  }
}
function delimitedIndent({ closing: closing2, align = true, units = 1 }) {
  return (context) => delimitedStrategy(context, align, units, closing2);
}
function delimitedStrategy(context, align, units, closing2, closedAt) {
  let after = context.textAfter, space2 = after.match(/^\s*/)[0].length;
  let closed = closing2 && after.slice(space2, space2 + closing2.length) == closing2 || closedAt == context.pos + space2;
  let aligned = align ? bracketedAligned(context) : null;
  if (aligned)
    return closed ? context.column(aligned.from) : context.column(aligned.to);
  return context.baseIndent + (closed ? 0 : context.unit * units);
}
const flatIndent = (context) => context.baseIndent;
function continuedIndent({ except, units = 1 } = {}) {
  return (context) => {
    let matchExcept = except && except.test(context.textAfter);
    return context.baseIndent + (matchExcept ? 0 : units * context.unit);
  };
}
const DontIndentBeyond = 200;
function indentOnInput() {
  return EditorState.transactionFilter.of((tr) => {
    if (!tr.docChanged || !tr.isUserEvent("input.type") && !tr.isUserEvent("input.complete"))
      return tr;
    let rules = tr.startState.languageDataAt("indentOnInput", tr.startState.selection.main.head);
    if (!rules.length)
      return tr;
    let doc2 = tr.newDoc, { head } = tr.newSelection.main, line = doc2.lineAt(head);
    if (head > line.from + DontIndentBeyond)
      return tr;
    let lineStart = doc2.sliceString(line.from, head);
    if (!rules.some((r) => r.test(lineStart)))
      return tr;
    let { state } = tr, last = -1, changes = [];
    for (let { head: head2 } of state.selection.ranges) {
      let line2 = state.doc.lineAt(head2);
      if (line2.from == last)
        continue;
      last = line2.from;
      let indent = getIndentation(state, line2.from);
      if (indent == null)
        continue;
      let cur2 = /^\s*/.exec(line2.text)[0];
      let norm = indentString(state, indent);
      if (cur2 != norm)
        changes.push({ from: line2.from, to: line2.from + cur2.length, insert: norm });
    }
    return changes.length ? [tr, { changes, sequential: true }] : tr;
  });
}
const foldService = /* @__PURE__ */ Facet.define();
const foldNodeProp = /* @__PURE__ */ new NodeProp();
function foldInside(node) {
  let first = node.firstChild, last = node.lastChild;
  return first && first.to < last.from ? { from: first.to, to: last.type.isError ? node.to : last.from } : null;
}
function syntaxFolding(state, start, end) {
  let tree = syntaxTree(state);
  if (tree.length < end)
    return null;
  let inner = tree.resolveInner(end, 1);
  let found = null;
  for (let cur2 = inner; cur2; cur2 = cur2.parent) {
    if (cur2.to <= end || cur2.from > end)
      continue;
    if (found && cur2.from < start)
      break;
    let prop = cur2.type.prop(foldNodeProp);
    if (prop && (cur2.to < tree.length - 50 || tree.length == state.doc.length || !isUnfinished(cur2))) {
      let value = prop(cur2, state);
      if (value && value.from <= end && value.from >= start && value.to > end)
        found = value;
    }
  }
  return found;
}
function isUnfinished(node) {
  let ch = node.lastChild;
  return ch && ch.to == node.to && ch.type.isError;
}
function foldable(state, lineStart, lineEnd) {
  for (let service of state.facet(foldService)) {
    let result = service(state, lineStart, lineEnd);
    if (result)
      return result;
  }
  return syntaxFolding(state, lineStart, lineEnd);
}
function mapRange(range, mapping) {
  let from = mapping.mapPos(range.from, 1), to = mapping.mapPos(range.to, -1);
  return from >= to ? void 0 : { from, to };
}
const foldEffect = /* @__PURE__ */ StateEffect.define({ map: mapRange });
const unfoldEffect = /* @__PURE__ */ StateEffect.define({ map: mapRange });
function selectedLines(view) {
  let lines = [];
  for (let { head } of view.state.selection.ranges) {
    if (lines.some((l) => l.from <= head && l.to >= head))
      continue;
    lines.push(view.lineBlockAt(head));
  }
  return lines;
}
const foldState = /* @__PURE__ */ StateField.define({
  create() {
    return Decoration.none;
  },
  update(folded, tr) {
    folded = folded.map(tr.changes);
    for (let e of tr.effects) {
      if (e.is(foldEffect) && !foldExists(folded, e.value.from, e.value.to))
        folded = folded.update({ add: [foldWidget.range(e.value.from, e.value.to)] });
      else if (e.is(unfoldEffect))
        folded = folded.update({
          filter: (from, to) => e.value.from != from || e.value.to != to,
          filterFrom: e.value.from,
          filterTo: e.value.to
        });
    }
    if (tr.selection) {
      let onSelection = false, { head } = tr.selection.main;
      folded.between(head, head, (a, b) => {
        if (a < head && b > head)
          onSelection = true;
      });
      if (onSelection)
        folded = folded.update({
          filterFrom: head,
          filterTo: head,
          filter: (a, b) => b <= head || a >= head
        });
    }
    return folded;
  },
  provide: (f) => EditorView.decorations.from(f),
  toJSON(folded, state) {
    let ranges = [];
    folded.between(0, state.doc.length, (from, to) => {
      ranges.push(from, to);
    });
    return ranges;
  },
  fromJSON(value) {
    if (!Array.isArray(value) || value.length % 2)
      throw new RangeError("Invalid JSON for fold state");
    let ranges = [];
    for (let i = 0; i < value.length; ) {
      let from = value[i++], to = value[i++];
      if (typeof from != "number" || typeof to != "number")
        throw new RangeError("Invalid JSON for fold state");
      ranges.push(foldWidget.range(from, to));
    }
    return Decoration.set(ranges, true);
  }
});
function findFold(state, from, to) {
  var _a2;
  let found = null;
  (_a2 = state.field(foldState, false)) === null || _a2 === void 0 ? void 0 : _a2.between(from, to, (from2, to2) => {
    if (!found || found.from > from2)
      found = { from: from2, to: to2 };
  });
  return found;
}
function foldExists(folded, from, to) {
  let found = false;
  folded.between(from, from, (a, b) => {
    if (a == from && b == to)
      found = true;
  });
  return found;
}
function maybeEnable(state, other) {
  return state.field(foldState, false) ? other : other.concat(StateEffect.appendConfig.of(codeFolding()));
}
const foldCode = (view) => {
  for (let line of selectedLines(view)) {
    let range = foldable(view.state, line.from, line.to);
    if (range) {
      view.dispatch({ effects: maybeEnable(view.state, [foldEffect.of(range), announceFold(view, range)]) });
      return true;
    }
  }
  return false;
};
const unfoldCode = (view) => {
  if (!view.state.field(foldState, false))
    return false;
  let effects = [];
  for (let line of selectedLines(view)) {
    let folded = findFold(view.state, line.from, line.to);
    if (folded)
      effects.push(unfoldEffect.of(folded), announceFold(view, folded, false));
  }
  if (effects.length)
    view.dispatch({ effects });
  return effects.length > 0;
};
function announceFold(view, range, fold = true) {
  let lineFrom = view.state.doc.lineAt(range.from).number, lineTo = view.state.doc.lineAt(range.to).number;
  return EditorView.announce.of(`${view.state.phrase(fold ? "Folded lines" : "Unfolded lines")} ${lineFrom} ${view.state.phrase("to")} ${lineTo}.`);
}
const foldAll = (view) => {
  let { state } = view, effects = [];
  for (let pos = 0; pos < state.doc.length; ) {
    let line = view.lineBlockAt(pos), range = foldable(state, line.from, line.to);
    if (range)
      effects.push(foldEffect.of(range));
    pos = (range ? view.lineBlockAt(range.to) : line).to + 1;
  }
  if (effects.length)
    view.dispatch({ effects: maybeEnable(view.state, effects) });
  return !!effects.length;
};
const unfoldAll = (view) => {
  let field = view.state.field(foldState, false);
  if (!field || !field.size)
    return false;
  let effects = [];
  field.between(0, view.state.doc.length, (from, to) => {
    effects.push(unfoldEffect.of({ from, to }));
  });
  view.dispatch({ effects });
  return true;
};
const foldKeymap = [
  { key: "Ctrl-Shift-[", mac: "Cmd-Alt-[", run: foldCode },
  { key: "Ctrl-Shift-]", mac: "Cmd-Alt-]", run: unfoldCode },
  { key: "Ctrl-Alt-[", run: foldAll },
  { key: "Ctrl-Alt-]", run: unfoldAll }
];
const defaultConfig = {
  placeholderDOM: null,
  placeholderText: "…"
};
const foldConfig = /* @__PURE__ */ Facet.define({
  combine(values) {
    return combineConfig(values, defaultConfig);
  }
});
function codeFolding(config2) {
  let result = [foldState, baseTheme$1$2];
  if (config2)
    result.push(foldConfig.of(config2));
  return result;
}
const foldWidget = /* @__PURE__ */ Decoration.replace({ widget: /* @__PURE__ */ new class extends WidgetType {
  toDOM(view) {
    let { state } = view, conf = state.facet(foldConfig);
    let onclick = (event) => {
      let line = view.lineBlockAt(view.posAtDOM(event.target));
      let folded = findFold(view.state, line.from, line.to);
      if (folded)
        view.dispatch({ effects: unfoldEffect.of(folded) });
      event.preventDefault();
    };
    if (conf.placeholderDOM)
      return conf.placeholderDOM(view, onclick);
    let element = document.createElement("span");
    element.textContent = conf.placeholderText;
    element.setAttribute("aria-label", state.phrase("folded code"));
    element.title = state.phrase("unfold");
    element.className = "cm-foldPlaceholder";
    element.onclick = onclick;
    return element;
  }
}() });
const foldGutterDefaults = {
  openText: "⌄",
  closedText: "›",
  markerDOM: null,
  domEventHandlers: {},
  foldingChanged: () => false
};
class FoldMarker extends GutterMarker {
  constructor(config2, open) {
    super();
    this.config = config2;
    this.open = open;
  }
  eq(other) {
    return this.config == other.config && this.open == other.open;
  }
  toDOM(view) {
    if (this.config.markerDOM)
      return this.config.markerDOM(this.open);
    let span = document.createElement("span");
    span.textContent = this.open ? this.config.openText : this.config.closedText;
    span.title = view.state.phrase(this.open ? "Fold line" : "Unfold line");
    return span;
  }
}
function foldGutter(config2 = {}) {
  let fullConfig = Object.assign(Object.assign({}, foldGutterDefaults), config2);
  let canFold = new FoldMarker(fullConfig, true), canUnfold = new FoldMarker(fullConfig, false);
  let markers = ViewPlugin.fromClass(class {
    constructor(view) {
      this.from = view.viewport.from;
      this.markers = this.buildMarkers(view);
    }
    update(update) {
      if (update.docChanged || update.viewportChanged || update.startState.facet(language) != update.state.facet(language) || update.startState.field(foldState, false) != update.state.field(foldState, false) || syntaxTree(update.startState) != syntaxTree(update.state) || fullConfig.foldingChanged(update))
        this.markers = this.buildMarkers(update.view);
    }
    buildMarkers(view) {
      let builder = new RangeSetBuilder();
      for (let line of view.viewportLineBlocks) {
        let mark = findFold(view.state, line.from, line.to) ? canUnfold : foldable(view.state, line.from, line.to) ? canFold : null;
        if (mark)
          builder.add(line.from, line.from, mark);
      }
      return builder.finish();
    }
  });
  let { domEventHandlers } = fullConfig;
  return [
    markers,
    gutter({
      class: "cm-foldGutter",
      markers(view) {
        var _a2;
        return ((_a2 = view.plugin(markers)) === null || _a2 === void 0 ? void 0 : _a2.markers) || RangeSet.empty;
      },
      initialSpacer() {
        return new FoldMarker(fullConfig, false);
      },
      domEventHandlers: Object.assign(Object.assign({}, domEventHandlers), { click: (view, line, event) => {
        if (domEventHandlers.click && domEventHandlers.click(view, line, event))
          return true;
        let folded = findFold(view.state, line.from, line.to);
        if (folded) {
          view.dispatch({ effects: unfoldEffect.of(folded) });
          return true;
        }
        let range = foldable(view.state, line.from, line.to);
        if (range) {
          view.dispatch({ effects: foldEffect.of(range) });
          return true;
        }
        return false;
      } })
    }),
    codeFolding()
  ];
}
const baseTheme$1$2 = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-foldPlaceholder": {
    backgroundColor: "#eee",
    border: "1px solid #ddd",
    color: "#888",
    borderRadius: ".2em",
    margin: "0 1px",
    padding: "0 1px",
    cursor: "pointer"
  },
  ".cm-foldGutter span": {
    padding: "0 1px",
    cursor: "pointer"
  }
});
class HighlightStyle {
  constructor(specs, options) {
    this.specs = specs;
    let modSpec;
    function def(spec) {
      let cls = StyleModule.newName();
      (modSpec || (modSpec = /* @__PURE__ */ Object.create(null)))["." + cls] = spec;
      return cls;
    }
    const all = typeof options.all == "string" ? options.all : options.all ? def(options.all) : void 0;
    const scopeOpt = options.scope;
    this.scope = scopeOpt instanceof Language ? (type) => type.prop(languageDataProp) == scopeOpt.data : scopeOpt ? (type) => type == scopeOpt : void 0;
    this.style = tagHighlighter(specs.map((style) => ({
      tag: style.tag,
      class: style.class || def(Object.assign({}, style, { tag: null }))
    })), {
      all
    }).style;
    this.module = modSpec ? new StyleModule(modSpec) : null;
    this.themeType = options.themeType;
  }
  /**
  Create a highlighter style that associates the given styles to
  the given tags. The specs must be objects that hold a style tag
  or array of tags in their `tag` property, and either a single
  `class` property providing a static CSS class (for highlighter
  that rely on external styling), or a
  [`style-mod`](https://github.com/marijnh/style-mod#documentation)-style
  set of CSS properties (which define the styling for those tags).
  
  The CSS rules created for a highlighter will be emitted in the
  order of the spec's properties. That means that for elements that
  have multiple tags associated with them, styles defined further
  down in the list will have a higher CSS precedence than styles
  defined earlier.
  */
  static define(specs, options) {
    return new HighlightStyle(specs, options || {});
  }
}
const highlighterFacet = /* @__PURE__ */ Facet.define();
const fallbackHighlighter = /* @__PURE__ */ Facet.define({
  combine(values) {
    return values.length ? [values[0]] : null;
  }
});
function getHighlighters(state) {
  let main = state.facet(highlighterFacet);
  return main.length ? main : state.facet(fallbackHighlighter);
}
function syntaxHighlighting(highlighter, options) {
  let ext = [treeHighlighter], themeType;
  if (highlighter instanceof HighlightStyle) {
    if (highlighter.module)
      ext.push(EditorView.styleModule.of(highlighter.module));
    themeType = highlighter.themeType;
  }
  if (options === null || options === void 0 ? void 0 : options.fallback)
    ext.push(fallbackHighlighter.of(highlighter));
  else if (themeType)
    ext.push(highlighterFacet.computeN([EditorView.darkTheme], (state) => {
      return state.facet(EditorView.darkTheme) == (themeType == "dark") ? [highlighter] : [];
    }));
  else
    ext.push(highlighterFacet.of(highlighter));
  return ext;
}
class TreeHighlighter {
  constructor(view) {
    this.markCache = /* @__PURE__ */ Object.create(null);
    this.tree = syntaxTree(view.state);
    this.decorations = this.buildDeco(view, getHighlighters(view.state));
  }
  update(update) {
    let tree = syntaxTree(update.state), highlighters = getHighlighters(update.state);
    let styleChange = highlighters != getHighlighters(update.startState);
    if (tree.length < update.view.viewport.to && !styleChange && tree.type == this.tree.type) {
      this.decorations = this.decorations.map(update.changes);
    } else if (tree != this.tree || update.viewportChanged || styleChange) {
      this.tree = tree;
      this.decorations = this.buildDeco(update.view, highlighters);
    }
  }
  buildDeco(view, highlighters) {
    if (!highlighters || !this.tree.length)
      return Decoration.none;
    let builder = new RangeSetBuilder();
    for (let { from, to } of view.visibleRanges) {
      highlightTree(this.tree, highlighters, (from2, to2, style) => {
        builder.add(from2, to2, this.markCache[style] || (this.markCache[style] = Decoration.mark({ class: style })));
      }, from, to);
    }
    return builder.finish();
  }
}
const treeHighlighter = /* @__PURE__ */ Prec.high(/* @__PURE__ */ ViewPlugin.fromClass(TreeHighlighter, {
  decorations: (v) => v.decorations
}));
const defaultHighlightStyle = /* @__PURE__ */ HighlightStyle.define([
  {
    tag: tags.meta,
    color: "#404740"
  },
  {
    tag: tags.link,
    textDecoration: "underline"
  },
  {
    tag: tags.heading,
    textDecoration: "underline",
    fontWeight: "bold"
  },
  {
    tag: tags.emphasis,
    fontStyle: "italic"
  },
  {
    tag: tags.strong,
    fontWeight: "bold"
  },
  {
    tag: tags.strikethrough,
    textDecoration: "line-through"
  },
  {
    tag: tags.keyword,
    color: "#708"
  },
  {
    tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
    color: "#219"
  },
  {
    tag: [tags.literal, tags.inserted],
    color: "#164"
  },
  {
    tag: [tags.string, tags.deleted],
    color: "#a11"
  },
  {
    tag: [tags.regexp, tags.escape, /* @__PURE__ */ tags.special(tags.string)],
    color: "#e40"
  },
  {
    tag: /* @__PURE__ */ tags.definition(tags.variableName),
    color: "#00f"
  },
  {
    tag: /* @__PURE__ */ tags.local(tags.variableName),
    color: "#30a"
  },
  {
    tag: [tags.typeName, tags.namespace],
    color: "#085"
  },
  {
    tag: tags.className,
    color: "#167"
  },
  {
    tag: [/* @__PURE__ */ tags.special(tags.variableName), tags.macroName],
    color: "#256"
  },
  {
    tag: /* @__PURE__ */ tags.definition(tags.propertyName),
    color: "#00c"
  },
  {
    tag: tags.comment,
    color: "#940"
  },
  {
    tag: tags.invalid,
    color: "#f00"
  }
]);
const baseTheme$3 = /* @__PURE__ */ EditorView.baseTheme({
  "&.cm-focused .cm-matchingBracket": { backgroundColor: "#328c8252" },
  "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bb555544" }
});
const DefaultScanDist = 1e4, DefaultBrackets = "()[]{}";
const bracketMatchingConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      afterCursor: true,
      brackets: DefaultBrackets,
      maxScanDistance: DefaultScanDist,
      renderMatch: defaultRenderMatch
    });
  }
});
const matchingMark = /* @__PURE__ */ Decoration.mark({ class: "cm-matchingBracket" }), nonmatchingMark = /* @__PURE__ */ Decoration.mark({ class: "cm-nonmatchingBracket" });
function defaultRenderMatch(match) {
  let decorations2 = [];
  let mark = match.matched ? matchingMark : nonmatchingMark;
  decorations2.push(mark.range(match.start.from, match.start.to));
  if (match.end)
    decorations2.push(mark.range(match.end.from, match.end.to));
  return decorations2;
}
const bracketMatchingState = /* @__PURE__ */ StateField.define({
  create() {
    return Decoration.none;
  },
  update(deco, tr) {
    if (!tr.docChanged && !tr.selection)
      return deco;
    let decorations2 = [];
    let config2 = tr.state.facet(bracketMatchingConfig);
    for (let range of tr.state.selection.ranges) {
      if (!range.empty)
        continue;
      let match = matchBrackets(tr.state, range.head, -1, config2) || range.head > 0 && matchBrackets(tr.state, range.head - 1, 1, config2) || config2.afterCursor && (matchBrackets(tr.state, range.head, 1, config2) || range.head < tr.state.doc.length && matchBrackets(tr.state, range.head + 1, -1, config2));
      if (match)
        decorations2 = decorations2.concat(config2.renderMatch(match, tr.state));
    }
    return Decoration.set(decorations2, true);
  },
  provide: (f) => EditorView.decorations.from(f)
});
const bracketMatchingUnique = [
  bracketMatchingState,
  baseTheme$3
];
function bracketMatching(config2 = {}) {
  return [bracketMatchingConfig.of(config2), bracketMatchingUnique];
}
const bracketMatchingHandle = /* @__PURE__ */ new NodeProp();
function matchingNodes(node, dir, brackets) {
  let byProp = node.prop(dir < 0 ? NodeProp.openedBy : NodeProp.closedBy);
  if (byProp)
    return byProp;
  if (node.name.length == 1) {
    let index = brackets.indexOf(node.name);
    if (index > -1 && index % 2 == (dir < 0 ? 1 : 0))
      return [brackets[index + dir]];
  }
  return null;
}
function findHandle(node) {
  let hasHandle = node.type.prop(bracketMatchingHandle);
  return hasHandle ? hasHandle(node.node) : node;
}
function matchBrackets(state, pos, dir, config2 = {}) {
  let maxScanDistance = config2.maxScanDistance || DefaultScanDist, brackets = config2.brackets || DefaultBrackets;
  let tree = syntaxTree(state), node = tree.resolveInner(pos, dir);
  for (let cur2 = node; cur2; cur2 = cur2.parent) {
    let matches = matchingNodes(cur2.type, dir, brackets);
    if (matches && cur2.from < cur2.to) {
      let handle = findHandle(cur2);
      if (handle && (dir > 0 ? pos >= handle.from && pos < handle.to : pos > handle.from && pos <= handle.to))
        return matchMarkedBrackets(state, pos, dir, cur2, handle, matches, brackets);
    }
  }
  return matchPlainBrackets(state, pos, dir, tree, node.type, maxScanDistance, brackets);
}
function matchMarkedBrackets(_state, _pos, dir, token, handle, matching, brackets) {
  let parent = token.parent, firstToken = { from: handle.from, to: handle.to };
  let depth = 0, cursor = parent === null || parent === void 0 ? void 0 : parent.cursor();
  if (cursor && (dir < 0 ? cursor.childBefore(token.from) : cursor.childAfter(token.to)))
    do {
      if (dir < 0 ? cursor.to <= token.from : cursor.from >= token.to) {
        if (depth == 0 && matching.indexOf(cursor.type.name) > -1 && cursor.from < cursor.to) {
          let endHandle = findHandle(cursor);
          return { start: firstToken, end: endHandle ? { from: endHandle.from, to: endHandle.to } : void 0, matched: true };
        } else if (matchingNodes(cursor.type, dir, brackets)) {
          depth++;
        } else if (matchingNodes(cursor.type, -dir, brackets)) {
          if (depth == 0) {
            let endHandle = findHandle(cursor);
            return {
              start: firstToken,
              end: endHandle && endHandle.from < endHandle.to ? { from: endHandle.from, to: endHandle.to } : void 0,
              matched: false
            };
          }
          depth--;
        }
      }
    } while (dir < 0 ? cursor.prevSibling() : cursor.nextSibling());
  return { start: firstToken, matched: false };
}
function matchPlainBrackets(state, pos, dir, tree, tokenType, maxScanDistance, brackets) {
  let startCh = dir < 0 ? state.sliceDoc(pos - 1, pos) : state.sliceDoc(pos, pos + 1);
  let bracket2 = brackets.indexOf(startCh);
  if (bracket2 < 0 || bracket2 % 2 == 0 != dir > 0)
    return null;
  let startToken = { from: dir < 0 ? pos - 1 : pos, to: dir > 0 ? pos + 1 : pos };
  let iter = state.doc.iterRange(pos, dir > 0 ? state.doc.length : 0), depth = 0;
  for (let distance = 0; !iter.next().done && distance <= maxScanDistance; ) {
    let text = iter.value;
    if (dir < 0)
      distance += text.length;
    let basePos = pos + distance * dir;
    for (let pos2 = dir > 0 ? 0 : text.length - 1, end = dir > 0 ? text.length : -1; pos2 != end; pos2 += dir) {
      let found = brackets.indexOf(text[pos2]);
      if (found < 0 || tree.resolveInner(basePos + pos2, 1).type != tokenType)
        continue;
      if (found % 2 == 0 == dir > 0) {
        depth++;
      } else if (depth == 1) {
        return { start: startToken, end: { from: basePos + pos2, to: basePos + pos2 + 1 }, matched: found >> 1 == bracket2 >> 1 };
      } else {
        depth--;
      }
    }
    if (dir > 0)
      distance += text.length;
  }
  return iter.done ? { start: startToken, matched: false } : null;
}
const noTokens = /* @__PURE__ */ Object.create(null);
const typeArray = [NodeType.none];
const warned = [];
const defaultTable = /* @__PURE__ */ Object.create(null);
for (let [legacyName, name2] of [
  ["variable", "variableName"],
  ["variable-2", "variableName.special"],
  ["string-2", "string.special"],
  ["def", "variableName.definition"],
  ["tag", "tagName"],
  ["attribute", "attributeName"],
  ["type", "typeName"],
  ["builtin", "variableName.standard"],
  ["qualifier", "modifier"],
  ["error", "invalid"],
  ["header", "heading"],
  ["property", "propertyName"]
])
  defaultTable[legacyName] = /* @__PURE__ */ createTokenType(noTokens, name2);
function warnForPart(part, msg) {
  if (warned.indexOf(part) > -1)
    return;
  warned.push(part);
  console.warn(msg);
}
function createTokenType(extra, tagStr) {
  let tag = null;
  for (let part of tagStr.split(".")) {
    let value = extra[part] || tags[part];
    if (!value) {
      warnForPart(part, `Unknown highlighting tag ${part}`);
    } else if (typeof value == "function") {
      if (!tag)
        warnForPart(part, `Modifier ${part} used at start of tag`);
      else
        tag = value(tag);
    } else {
      if (tag)
        warnForPart(part, `Tag ${part} used as modifier`);
      else
        tag = value;
    }
  }
  if (!tag)
    return 0;
  let name2 = tagStr.replace(/ /g, "_"), type = NodeType.define({
    id: typeArray.length,
    name: name2,
    props: [styleTags({ [name2]: tag })]
  });
  typeArray.push(type);
  return type.id;
}
const toggleComment = (target) => {
  let { state } = target, line = state.doc.lineAt(state.selection.main.head), config2 = getConfig(target.state, line.from);
  return config2.line ? toggleLineComment(target) : config2.block ? toggleBlockCommentByLine(target) : false;
};
function command(f, option) {
  return ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let tr = f(option, state);
    if (!tr)
      return false;
    dispatch(state.update(tr));
    return true;
  };
}
const toggleLineComment = /* @__PURE__ */ command(
  changeLineComment,
  0
  /* CommentOption.Toggle */
);
const toggleBlockComment = /* @__PURE__ */ command(
  changeBlockComment,
  0
  /* CommentOption.Toggle */
);
const toggleBlockCommentByLine = /* @__PURE__ */ command(
  (o, s) => changeBlockComment(o, s, selectedLineRanges(s)),
  0
  /* CommentOption.Toggle */
);
function getConfig(state, pos) {
  let data = state.languageDataAt("commentTokens", pos);
  return data.length ? data[0] : {};
}
const SearchMargin = 50;
function findBlockComment(state, { open, close }, from, to) {
  let textBefore = state.sliceDoc(from - SearchMargin, from);
  let textAfter = state.sliceDoc(to, to + SearchMargin);
  let spaceBefore = /\s*$/.exec(textBefore)[0].length, spaceAfter = /^\s*/.exec(textAfter)[0].length;
  let beforeOff = textBefore.length - spaceBefore;
  if (textBefore.slice(beforeOff - open.length, beforeOff) == open && textAfter.slice(spaceAfter, spaceAfter + close.length) == close) {
    return {
      open: { pos: from - spaceBefore, margin: spaceBefore && 1 },
      close: { pos: to + spaceAfter, margin: spaceAfter && 1 }
    };
  }
  let startText, endText;
  if (to - from <= 2 * SearchMargin) {
    startText = endText = state.sliceDoc(from, to);
  } else {
    startText = state.sliceDoc(from, from + SearchMargin);
    endText = state.sliceDoc(to - SearchMargin, to);
  }
  let startSpace = /^\s*/.exec(startText)[0].length, endSpace = /\s*$/.exec(endText)[0].length;
  let endOff = endText.length - endSpace - close.length;
  if (startText.slice(startSpace, startSpace + open.length) == open && endText.slice(endOff, endOff + close.length) == close) {
    return {
      open: {
        pos: from + startSpace + open.length,
        margin: /\s/.test(startText.charAt(startSpace + open.length)) ? 1 : 0
      },
      close: {
        pos: to - endSpace - close.length,
        margin: /\s/.test(endText.charAt(endOff - 1)) ? 1 : 0
      }
    };
  }
  return null;
}
function selectedLineRanges(state) {
  let ranges = [];
  for (let r of state.selection.ranges) {
    let fromLine = state.doc.lineAt(r.from);
    let toLine = r.to <= fromLine.to ? fromLine : state.doc.lineAt(r.to);
    let last = ranges.length - 1;
    if (last >= 0 && ranges[last].to > fromLine.from)
      ranges[last].to = toLine.to;
    else
      ranges.push({ from: fromLine.from, to: toLine.to });
  }
  return ranges;
}
function changeBlockComment(option, state, ranges = state.selection.ranges) {
  let tokens = ranges.map((r) => getConfig(state, r.from).block);
  if (!tokens.every((c) => c))
    return null;
  let comments = ranges.map((r, i) => findBlockComment(state, tokens[i], r.from, r.to));
  if (option != 2 && !comments.every((c) => c)) {
    return { changes: state.changes(ranges.map((range, i) => {
      if (comments[i])
        return [];
      return [{ from: range.from, insert: tokens[i].open + " " }, { from: range.to, insert: " " + tokens[i].close }];
    })) };
  } else if (option != 1 && comments.some((c) => c)) {
    let changes = [];
    for (let i = 0, comment2; i < comments.length; i++)
      if (comment2 = comments[i]) {
        let token = tokens[i], { open, close } = comment2;
        changes.push({ from: open.pos - token.open.length, to: open.pos + open.margin }, { from: close.pos - close.margin, to: close.pos + token.close.length });
      }
    return { changes };
  }
  return null;
}
function changeLineComment(option, state, ranges = state.selection.ranges) {
  let lines = [];
  let prevLine = -1;
  for (let { from, to } of ranges) {
    let startI = lines.length, minIndent = 1e9;
    for (let pos = from; pos <= to; ) {
      let line = state.doc.lineAt(pos);
      if (line.from > prevLine && (from == to || to > line.from)) {
        prevLine = line.from;
        let token = getConfig(state, line.from).line;
        if (!token)
          continue;
        let indent = /^\s*/.exec(line.text)[0].length;
        let empty2 = indent == line.length;
        let comment2 = line.text.slice(indent, indent + token.length) == token ? indent : -1;
        if (indent < line.text.length && indent < minIndent)
          minIndent = indent;
        lines.push({ line, comment: comment2, token, indent, empty: empty2, single: false });
      }
      pos = line.to + 1;
    }
    if (minIndent < 1e9) {
      for (let i = startI; i < lines.length; i++)
        if (lines[i].indent < lines[i].line.text.length)
          lines[i].indent = minIndent;
    }
    if (lines.length == startI + 1)
      lines[startI].single = true;
  }
  if (option != 2 && lines.some((l) => l.comment < 0 && (!l.empty || l.single))) {
    let changes = [];
    for (let { line, token, indent, empty: empty2, single } of lines)
      if (single || !empty2)
        changes.push({ from: line.from + indent, insert: token + " " });
    let changeSet = state.changes(changes);
    return { changes: changeSet, selection: state.selection.map(changeSet, 1) };
  } else if (option != 1 && lines.some((l) => l.comment >= 0)) {
    let changes = [];
    for (let { line, comment: comment2, token } of lines)
      if (comment2 >= 0) {
        let from = line.from + comment2, to = from + token.length;
        if (line.text[to - line.from] == " ")
          to++;
        changes.push({ from, to });
      }
    return { changes };
  }
  return null;
}
const fromHistory = /* @__PURE__ */ Annotation.define();
const isolateHistory = /* @__PURE__ */ Annotation.define();
const invertedEffects = /* @__PURE__ */ Facet.define();
const historyConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      minDepth: 100,
      newGroupDelay: 500,
      joinToEvent: (_t, isAdjacent2) => isAdjacent2
    }, {
      minDepth: Math.max,
      newGroupDelay: Math.min,
      joinToEvent: (a, b) => (tr, adj) => a(tr, adj) || b(tr, adj)
    });
  }
});
function changeEnd(changes) {
  let end = 0;
  changes.iterChangedRanges((_, to) => end = to);
  return end;
}
const historyField_ = /* @__PURE__ */ StateField.define({
  create() {
    return HistoryState.empty;
  },
  update(state, tr) {
    let config2 = tr.state.facet(historyConfig);
    let fromHist = tr.annotation(fromHistory);
    if (fromHist) {
      let selection = tr.docChanged ? EditorSelection.single(changeEnd(tr.changes)) : void 0;
      let item = HistEvent.fromTransaction(tr, selection), from = fromHist.side;
      let other = from == 0 ? state.undone : state.done;
      if (item)
        other = updateBranch(other, other.length, config2.minDepth, item);
      else
        other = addSelection(other, tr.startState.selection);
      return new HistoryState(from == 0 ? fromHist.rest : other, from == 0 ? other : fromHist.rest);
    }
    let isolate = tr.annotation(isolateHistory);
    if (isolate == "full" || isolate == "before")
      state = state.isolate();
    if (tr.annotation(Transaction.addToHistory) === false)
      return !tr.changes.empty ? state.addMapping(tr.changes.desc) : state;
    let event = HistEvent.fromTransaction(tr);
    let time = tr.annotation(Transaction.time), userEvent = tr.annotation(Transaction.userEvent);
    if (event)
      state = state.addChanges(event, time, userEvent, config2, tr);
    else if (tr.selection)
      state = state.addSelection(tr.startState.selection, time, userEvent, config2.newGroupDelay);
    if (isolate == "full" || isolate == "after")
      state = state.isolate();
    return state;
  },
  toJSON(value) {
    return { done: value.done.map((e) => e.toJSON()), undone: value.undone.map((e) => e.toJSON()) };
  },
  fromJSON(json) {
    return new HistoryState(json.done.map(HistEvent.fromJSON), json.undone.map(HistEvent.fromJSON));
  }
});
function history(config2 = {}) {
  return [
    historyField_,
    historyConfig.of(config2),
    EditorView.domEventHandlers({
      beforeinput(e, view) {
        let command2 = e.inputType == "historyUndo" ? undo : e.inputType == "historyRedo" ? redo : null;
        if (!command2)
          return false;
        e.preventDefault();
        return command2(view);
      }
    })
  ];
}
function cmd(side, selection) {
  return function({ state, dispatch }) {
    if (!selection && state.readOnly)
      return false;
    let historyState = state.field(historyField_, false);
    if (!historyState)
      return false;
    let tr = historyState.pop(side, state, selection);
    if (!tr)
      return false;
    dispatch(tr);
    return true;
  };
}
const undo = /* @__PURE__ */ cmd(0, false);
const redo = /* @__PURE__ */ cmd(1, false);
const undoSelection = /* @__PURE__ */ cmd(0, true);
const redoSelection = /* @__PURE__ */ cmd(1, true);
class HistEvent {
  constructor(changes, effects, mapped, startSelection, selectionsAfter) {
    this.changes = changes;
    this.effects = effects;
    this.mapped = mapped;
    this.startSelection = startSelection;
    this.selectionsAfter = selectionsAfter;
  }
  setSelAfter(after) {
    return new HistEvent(this.changes, this.effects, this.mapped, this.startSelection, after);
  }
  toJSON() {
    var _a2, _b, _c;
    return {
      changes: (_a2 = this.changes) === null || _a2 === void 0 ? void 0 : _a2.toJSON(),
      mapped: (_b = this.mapped) === null || _b === void 0 ? void 0 : _b.toJSON(),
      startSelection: (_c = this.startSelection) === null || _c === void 0 ? void 0 : _c.toJSON(),
      selectionsAfter: this.selectionsAfter.map((s) => s.toJSON())
    };
  }
  static fromJSON(json) {
    return new HistEvent(json.changes && ChangeSet.fromJSON(json.changes), [], json.mapped && ChangeDesc.fromJSON(json.mapped), json.startSelection && EditorSelection.fromJSON(json.startSelection), json.selectionsAfter.map(EditorSelection.fromJSON));
  }
  // This does not check `addToHistory` and such, it assumes the
  // transaction needs to be converted to an item. Returns null when
  // there are no changes or effects in the transaction.
  static fromTransaction(tr, selection) {
    let effects = none$1;
    for (let invert of tr.startState.facet(invertedEffects)) {
      let result = invert(tr);
      if (result.length)
        effects = effects.concat(result);
    }
    if (!effects.length && tr.changes.empty)
      return null;
    return new HistEvent(tr.changes.invert(tr.startState.doc), effects, void 0, selection || tr.startState.selection, none$1);
  }
  static selection(selections) {
    return new HistEvent(void 0, none$1, void 0, void 0, selections);
  }
}
function updateBranch(branch, to, maxLen, newEvent) {
  let start = to + 1 > maxLen + 20 ? to - maxLen - 1 : 0;
  let newBranch = branch.slice(start, to);
  newBranch.push(newEvent);
  return newBranch;
}
function isAdjacent(a, b) {
  let ranges = [], isAdjacent2 = false;
  a.iterChangedRanges((f, t2) => ranges.push(f, t2));
  b.iterChangedRanges((_f, _t, f, t2) => {
    for (let i = 0; i < ranges.length; ) {
      let from = ranges[i++], to = ranges[i++];
      if (t2 >= from && f <= to)
        isAdjacent2 = true;
    }
  });
  return isAdjacent2;
}
function eqSelectionShape(a, b) {
  return a.ranges.length == b.ranges.length && a.ranges.filter((r, i) => r.empty != b.ranges[i].empty).length === 0;
}
function conc(a, b) {
  return !a.length ? b : !b.length ? a : a.concat(b);
}
const none$1 = [];
const MaxSelectionsPerEvent = 200;
function addSelection(branch, selection) {
  if (!branch.length) {
    return [HistEvent.selection([selection])];
  } else {
    let lastEvent = branch[branch.length - 1];
    let sels = lastEvent.selectionsAfter.slice(Math.max(0, lastEvent.selectionsAfter.length - MaxSelectionsPerEvent));
    if (sels.length && sels[sels.length - 1].eq(selection))
      return branch;
    sels.push(selection);
    return updateBranch(branch, branch.length - 1, 1e9, lastEvent.setSelAfter(sels));
  }
}
function popSelection(branch) {
  let last = branch[branch.length - 1];
  let newBranch = branch.slice();
  newBranch[branch.length - 1] = last.setSelAfter(last.selectionsAfter.slice(0, last.selectionsAfter.length - 1));
  return newBranch;
}
function addMappingToBranch(branch, mapping) {
  if (!branch.length)
    return branch;
  let length = branch.length, selections = none$1;
  while (length) {
    let event = mapEvent(branch[length - 1], mapping, selections);
    if (event.changes && !event.changes.empty || event.effects.length) {
      let result = branch.slice(0, length);
      result[length - 1] = event;
      return result;
    } else {
      mapping = event.mapped;
      length--;
      selections = event.selectionsAfter;
    }
  }
  return selections.length ? [HistEvent.selection(selections)] : none$1;
}
function mapEvent(event, mapping, extraSelections) {
  let selections = conc(event.selectionsAfter.length ? event.selectionsAfter.map((s) => s.map(mapping)) : none$1, extraSelections);
  if (!event.changes)
    return HistEvent.selection(selections);
  let mappedChanges = event.changes.map(mapping), before = mapping.mapDesc(event.changes, true);
  let fullMapping = event.mapped ? event.mapped.composeDesc(before) : before;
  return new HistEvent(mappedChanges, StateEffect.mapEffects(event.effects, mapping), fullMapping, event.startSelection.map(before), selections);
}
const joinableUserEvent = /^(input\.type|delete)($|\.)/;
class HistoryState {
  constructor(done, undone, prevTime = 0, prevUserEvent = void 0) {
    this.done = done;
    this.undone = undone;
    this.prevTime = prevTime;
    this.prevUserEvent = prevUserEvent;
  }
  isolate() {
    return this.prevTime ? new HistoryState(this.done, this.undone) : this;
  }
  addChanges(event, time, userEvent, config2, tr) {
    let done = this.done, lastEvent = done[done.length - 1];
    if (lastEvent && lastEvent.changes && !lastEvent.changes.empty && event.changes && (!userEvent || joinableUserEvent.test(userEvent)) && (!lastEvent.selectionsAfter.length && time - this.prevTime < config2.newGroupDelay && config2.joinToEvent(tr, isAdjacent(lastEvent.changes, event.changes)) || // For compose (but not compose.start) events, always join with previous event
    userEvent == "input.type.compose")) {
      done = updateBranch(done, done.length - 1, config2.minDepth, new HistEvent(event.changes.compose(lastEvent.changes), conc(event.effects, lastEvent.effects), lastEvent.mapped, lastEvent.startSelection, none$1));
    } else {
      done = updateBranch(done, done.length, config2.minDepth, event);
    }
    return new HistoryState(done, none$1, time, userEvent);
  }
  addSelection(selection, time, userEvent, newGroupDelay) {
    let last = this.done.length ? this.done[this.done.length - 1].selectionsAfter : none$1;
    if (last.length > 0 && time - this.prevTime < newGroupDelay && userEvent == this.prevUserEvent && userEvent && /^select($|\.)/.test(userEvent) && eqSelectionShape(last[last.length - 1], selection))
      return this;
    return new HistoryState(addSelection(this.done, selection), this.undone, time, userEvent);
  }
  addMapping(mapping) {
    return new HistoryState(addMappingToBranch(this.done, mapping), addMappingToBranch(this.undone, mapping), this.prevTime, this.prevUserEvent);
  }
  pop(side, state, selection) {
    let branch = side == 0 ? this.done : this.undone;
    if (branch.length == 0)
      return null;
    let event = branch[branch.length - 1];
    if (selection && event.selectionsAfter.length) {
      return state.update({
        selection: event.selectionsAfter[event.selectionsAfter.length - 1],
        annotations: fromHistory.of({ side, rest: popSelection(branch) }),
        userEvent: side == 0 ? "select.undo" : "select.redo",
        scrollIntoView: true
      });
    } else if (!event.changes) {
      return null;
    } else {
      let rest = branch.length == 1 ? none$1 : branch.slice(0, branch.length - 1);
      if (event.mapped)
        rest = addMappingToBranch(rest, event.mapped);
      return state.update({
        changes: event.changes,
        selection: event.startSelection,
        effects: event.effects,
        annotations: fromHistory.of({ side, rest }),
        filter: false,
        userEvent: side == 0 ? "undo" : "redo",
        scrollIntoView: true
      });
    }
  }
}
HistoryState.empty = /* @__PURE__ */ new HistoryState(none$1, none$1);
const historyKeymap = [
  { key: "Mod-z", run: undo, preventDefault: true },
  { key: "Mod-y", mac: "Mod-Shift-z", run: redo, preventDefault: true },
  { linux: "Ctrl-Shift-z", run: redo, preventDefault: true },
  { key: "Mod-u", run: undoSelection, preventDefault: true },
  { key: "Alt-u", mac: "Mod-Shift-u", run: redoSelection, preventDefault: true }
];
function updateSel(sel, by) {
  return EditorSelection.create(sel.ranges.map(by), sel.mainIndex);
}
function setSel(state, selection) {
  return state.update({ selection, scrollIntoView: true, userEvent: "select" });
}
function moveSel({ state, dispatch }, how) {
  let selection = updateSel(state.selection, how);
  if (selection.eq(state.selection))
    return false;
  dispatch(setSel(state, selection));
  return true;
}
function rangeEnd(range, forward) {
  return EditorSelection.cursor(forward ? range.to : range.from);
}
function cursorByChar(view, forward) {
  return moveSel(view, (range) => range.empty ? view.moveByChar(range, forward) : rangeEnd(range, forward));
}
function ltrAtCursor(view) {
  return view.textDirectionAt(view.state.selection.main.head) == Direction.LTR;
}
const cursorCharLeft = (view) => cursorByChar(view, !ltrAtCursor(view));
const cursorCharRight = (view) => cursorByChar(view, ltrAtCursor(view));
function cursorByGroup(view, forward) {
  return moveSel(view, (range) => range.empty ? view.moveByGroup(range, forward) : rangeEnd(range, forward));
}
const cursorGroupLeft = (view) => cursorByGroup(view, !ltrAtCursor(view));
const cursorGroupRight = (view) => cursorByGroup(view, ltrAtCursor(view));
function interestingNode(state, node, bracketProp) {
  if (node.type.prop(bracketProp))
    return true;
  let len = node.to - node.from;
  return len && (len > 2 || /[^\s,.;:]/.test(state.sliceDoc(node.from, node.to))) || node.firstChild;
}
function moveBySyntax(state, start, forward) {
  let pos = syntaxTree(state).resolveInner(start.head);
  let bracketProp = forward ? NodeProp.closedBy : NodeProp.openedBy;
  for (let at = start.head; ; ) {
    let next = forward ? pos.childAfter(at) : pos.childBefore(at);
    if (!next)
      break;
    if (interestingNode(state, next, bracketProp))
      pos = next;
    else
      at = forward ? next.to : next.from;
  }
  let bracket2 = pos.type.prop(bracketProp), match, newPos;
  if (bracket2 && (match = forward ? matchBrackets(state, pos.from, 1) : matchBrackets(state, pos.to, -1)) && match.matched)
    newPos = forward ? match.end.to : match.end.from;
  else
    newPos = forward ? pos.to : pos.from;
  return EditorSelection.cursor(newPos, forward ? -1 : 1);
}
const cursorSyntaxLeft = (view) => moveSel(view, (range) => moveBySyntax(view.state, range, !ltrAtCursor(view)));
const cursorSyntaxRight = (view) => moveSel(view, (range) => moveBySyntax(view.state, range, ltrAtCursor(view)));
function cursorByLine(view, forward) {
  return moveSel(view, (range) => {
    if (!range.empty)
      return rangeEnd(range, forward);
    let moved = view.moveVertically(range, forward);
    return moved.head != range.head ? moved : view.moveToLineBoundary(range, forward);
  });
}
const cursorLineUp = (view) => cursorByLine(view, false);
const cursorLineDown = (view) => cursorByLine(view, true);
function pageInfo(view) {
  let selfScroll = view.scrollDOM.clientHeight < view.scrollDOM.scrollHeight - 2;
  let marginTop = 0, marginBottom = 0, height;
  if (selfScroll) {
    for (let source of view.state.facet(EditorView.scrollMargins)) {
      let margins = source(view);
      if (margins === null || margins === void 0 ? void 0 : margins.top)
        marginTop = Math.max(margins === null || margins === void 0 ? void 0 : margins.top, marginTop);
      if (margins === null || margins === void 0 ? void 0 : margins.bottom)
        marginBottom = Math.max(margins === null || margins === void 0 ? void 0 : margins.bottom, marginBottom);
    }
    height = view.scrollDOM.clientHeight - marginTop - marginBottom;
  } else {
    height = (view.dom.ownerDocument.defaultView || window).innerHeight;
  }
  return {
    marginTop,
    marginBottom,
    selfScroll,
    height: Math.max(view.defaultLineHeight, height - 5)
  };
}
function cursorByPage(view, forward) {
  let page = pageInfo(view);
  let { state } = view, selection = updateSel(state.selection, (range) => {
    return range.empty ? view.moveVertically(range, forward, page.height) : rangeEnd(range, forward);
  });
  if (selection.eq(state.selection))
    return false;
  let effect;
  if (page.selfScroll) {
    let startPos = view.coordsAtPos(state.selection.main.head);
    let scrollRect = view.scrollDOM.getBoundingClientRect();
    let scrollTop = scrollRect.top + page.marginTop, scrollBottom = scrollRect.bottom - page.marginBottom;
    if (startPos && startPos.top > scrollTop && startPos.bottom < scrollBottom)
      effect = EditorView.scrollIntoView(selection.main.head, { y: "start", yMargin: startPos.top - scrollTop });
  }
  view.dispatch(setSel(state, selection), { effects: effect });
  return true;
}
const cursorPageUp = (view) => cursorByPage(view, false);
const cursorPageDown = (view) => cursorByPage(view, true);
function moveByLineBoundary(view, start, forward) {
  let line = view.lineBlockAt(start.head), moved = view.moveToLineBoundary(start, forward);
  if (moved.head == start.head && moved.head != (forward ? line.to : line.from))
    moved = view.moveToLineBoundary(start, forward, false);
  if (!forward && moved.head == line.from && line.length) {
    let space2 = /^\s*/.exec(view.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
    if (space2 && start.head != line.from + space2)
      moved = EditorSelection.cursor(line.from + space2);
  }
  return moved;
}
const cursorLineBoundaryForward = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, true));
const cursorLineBoundaryBackward = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, false));
const cursorLineBoundaryLeft = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, !ltrAtCursor(view)));
const cursorLineBoundaryRight = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, ltrAtCursor(view)));
const cursorLineStart = (view) => moveSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).from, 1));
const cursorLineEnd = (view) => moveSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).to, -1));
function toMatchingBracket(state, dispatch, extend2) {
  let found = false, selection = updateSel(state.selection, (range) => {
    let matching = matchBrackets(state, range.head, -1) || matchBrackets(state, range.head, 1) || range.head > 0 && matchBrackets(state, range.head - 1, 1) || range.head < state.doc.length && matchBrackets(state, range.head + 1, -1);
    if (!matching || !matching.end)
      return range;
    found = true;
    let head = matching.start.from == range.head ? matching.end.to : matching.end.from;
    return extend2 ? EditorSelection.range(range.anchor, head) : EditorSelection.cursor(head);
  });
  if (!found)
    return false;
  dispatch(setSel(state, selection));
  return true;
}
const cursorMatchingBracket = ({ state, dispatch }) => toMatchingBracket(state, dispatch, false);
function extendSel(view, how) {
  let selection = updateSel(view.state.selection, (range) => {
    let head = how(range);
    return EditorSelection.range(range.anchor, head.head, head.goalColumn, head.bidiLevel || void 0);
  });
  if (selection.eq(view.state.selection))
    return false;
  view.dispatch(setSel(view.state, selection));
  return true;
}
function selectByChar(view, forward) {
  return extendSel(view, (range) => view.moveByChar(range, forward));
}
const selectCharLeft = (view) => selectByChar(view, !ltrAtCursor(view));
const selectCharRight = (view) => selectByChar(view, ltrAtCursor(view));
function selectByGroup(view, forward) {
  return extendSel(view, (range) => view.moveByGroup(range, forward));
}
const selectGroupLeft = (view) => selectByGroup(view, !ltrAtCursor(view));
const selectGroupRight = (view) => selectByGroup(view, ltrAtCursor(view));
const selectSyntaxLeft = (view) => extendSel(view, (range) => moveBySyntax(view.state, range, !ltrAtCursor(view)));
const selectSyntaxRight = (view) => extendSel(view, (range) => moveBySyntax(view.state, range, ltrAtCursor(view)));
function selectByLine(view, forward) {
  return extendSel(view, (range) => view.moveVertically(range, forward));
}
const selectLineUp = (view) => selectByLine(view, false);
const selectLineDown = (view) => selectByLine(view, true);
function selectByPage(view, forward) {
  return extendSel(view, (range) => view.moveVertically(range, forward, pageInfo(view).height));
}
const selectPageUp = (view) => selectByPage(view, false);
const selectPageDown = (view) => selectByPage(view, true);
const selectLineBoundaryForward = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, true));
const selectLineBoundaryBackward = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, false));
const selectLineBoundaryLeft = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, !ltrAtCursor(view)));
const selectLineBoundaryRight = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, ltrAtCursor(view)));
const selectLineStart = (view) => extendSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).from));
const selectLineEnd = (view) => extendSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).to));
const cursorDocStart = ({ state, dispatch }) => {
  dispatch(setSel(state, { anchor: 0 }));
  return true;
};
const cursorDocEnd = ({ state, dispatch }) => {
  dispatch(setSel(state, { anchor: state.doc.length }));
  return true;
};
const selectDocStart = ({ state, dispatch }) => {
  dispatch(setSel(state, { anchor: state.selection.main.anchor, head: 0 }));
  return true;
};
const selectDocEnd = ({ state, dispatch }) => {
  dispatch(setSel(state, { anchor: state.selection.main.anchor, head: state.doc.length }));
  return true;
};
const selectAll = ({ state, dispatch }) => {
  dispatch(state.update({ selection: { anchor: 0, head: state.doc.length }, userEvent: "select" }));
  return true;
};
const selectLine = ({ state, dispatch }) => {
  let ranges = selectedLineBlocks(state).map(({ from, to }) => EditorSelection.range(from, Math.min(to + 1, state.doc.length)));
  dispatch(state.update({ selection: EditorSelection.create(ranges), userEvent: "select" }));
  return true;
};
const selectParentSyntax = ({ state, dispatch }) => {
  let selection = updateSel(state.selection, (range) => {
    var _a2;
    let context = syntaxTree(state).resolveInner(range.head, 1);
    while (!(context.from < range.from && context.to >= range.to || context.to > range.to && context.from <= range.from || !((_a2 = context.parent) === null || _a2 === void 0 ? void 0 : _a2.parent)))
      context = context.parent;
    return EditorSelection.range(context.to, context.from);
  });
  dispatch(setSel(state, selection));
  return true;
};
const simplifySelection = ({ state, dispatch }) => {
  let cur2 = state.selection, selection = null;
  if (cur2.ranges.length > 1)
    selection = EditorSelection.create([cur2.main]);
  else if (!cur2.main.empty)
    selection = EditorSelection.create([EditorSelection.cursor(cur2.main.head)]);
  if (!selection)
    return false;
  dispatch(setSel(state, selection));
  return true;
};
function deleteBy(target, by) {
  if (target.state.readOnly)
    return false;
  let event = "delete.selection", { state } = target;
  let changes = state.changeByRange((range) => {
    let { from, to } = range;
    if (from == to) {
      let towards = by(from);
      if (towards < from) {
        event = "delete.backward";
        towards = skipAtomic(target, towards, false);
      } else if (towards > from) {
        event = "delete.forward";
        towards = skipAtomic(target, towards, true);
      }
      from = Math.min(from, towards);
      to = Math.max(to, towards);
    } else {
      from = skipAtomic(target, from, false);
      to = skipAtomic(target, to, true);
    }
    return from == to ? { range } : { changes: { from, to }, range: EditorSelection.cursor(from) };
  });
  if (changes.changes.empty)
    return false;
  target.dispatch(state.update(changes, {
    scrollIntoView: true,
    userEvent: event,
    effects: event == "delete.selection" ? EditorView.announce.of(state.phrase("Selection deleted")) : void 0
  }));
  return true;
}
function skipAtomic(target, pos, forward) {
  if (target instanceof EditorView)
    for (let ranges of target.state.facet(EditorView.atomicRanges).map((f) => f(target)))
      ranges.between(pos, pos, (from, to) => {
        if (from < pos && to > pos)
          pos = forward ? to : from;
      });
  return pos;
}
const deleteByChar = (target, forward) => deleteBy(target, (pos) => {
  let { state } = target, line = state.doc.lineAt(pos), before, targetPos;
  if (!forward && pos > line.from && pos < line.from + 200 && !/[^ \t]/.test(before = line.text.slice(0, pos - line.from))) {
    if (before[before.length - 1] == "	")
      return pos - 1;
    let col = countColumn(before, state.tabSize), drop = col % getIndentUnit(state) || getIndentUnit(state);
    for (let i = 0; i < drop && before[before.length - 1 - i] == " "; i++)
      pos--;
    targetPos = pos;
  } else {
    targetPos = findClusterBreak(line.text, pos - line.from, forward, forward) + line.from;
    if (targetPos == pos && line.number != (forward ? state.doc.lines : 1))
      targetPos += forward ? 1 : -1;
  }
  return targetPos;
});
const deleteCharBackward = (view) => deleteByChar(view, false);
const deleteCharForward = (view) => deleteByChar(view, true);
const deleteByGroup = (target, forward) => deleteBy(target, (start) => {
  let pos = start, { state } = target, line = state.doc.lineAt(pos);
  let categorize = state.charCategorizer(pos);
  for (let cat = null; ; ) {
    if (pos == (forward ? line.to : line.from)) {
      if (pos == start && line.number != (forward ? state.doc.lines : 1))
        pos += forward ? 1 : -1;
      break;
    }
    let next = findClusterBreak(line.text, pos - line.from, forward) + line.from;
    let nextChar2 = line.text.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
    let nextCat = categorize(nextChar2);
    if (cat != null && nextCat != cat)
      break;
    if (nextChar2 != " " || pos != start)
      cat = nextCat;
    pos = next;
  }
  return pos;
});
const deleteGroupBackward = (target) => deleteByGroup(target, false);
const deleteGroupForward = (target) => deleteByGroup(target, true);
const deleteToLineEnd = (view) => deleteBy(view, (pos) => {
  let lineEnd = view.lineBlockAt(pos).to;
  return pos < lineEnd ? lineEnd : Math.min(view.state.doc.length, pos + 1);
});
const deleteToLineStart = (view) => deleteBy(view, (pos) => {
  let lineStart = view.lineBlockAt(pos).from;
  return pos > lineStart ? lineStart : Math.max(0, pos - 1);
});
const splitLine = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  let changes = state.changeByRange((range) => {
    return {
      changes: { from: range.from, to: range.to, insert: Text.of(["", ""]) },
      range: EditorSelection.cursor(range.from)
    };
  });
  dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
  return true;
};
const transposeChars = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  let changes = state.changeByRange((range) => {
    if (!range.empty || range.from == 0 || range.from == state.doc.length)
      return { range };
    let pos = range.from, line = state.doc.lineAt(pos);
    let from = pos == line.from ? pos - 1 : findClusterBreak(line.text, pos - line.from, false) + line.from;
    let to = pos == line.to ? pos + 1 : findClusterBreak(line.text, pos - line.from, true) + line.from;
    return {
      changes: { from, to, insert: state.doc.slice(pos, to).append(state.doc.slice(from, pos)) },
      range: EditorSelection.cursor(to)
    };
  });
  if (changes.changes.empty)
    return false;
  dispatch(state.update(changes, { scrollIntoView: true, userEvent: "move.character" }));
  return true;
};
function selectedLineBlocks(state) {
  let blocks = [], upto = -1;
  for (let range of state.selection.ranges) {
    let startLine = state.doc.lineAt(range.from), endLine = state.doc.lineAt(range.to);
    if (!range.empty && range.to == endLine.from)
      endLine = state.doc.lineAt(range.to - 1);
    if (upto >= startLine.number) {
      let prev = blocks[blocks.length - 1];
      prev.to = endLine.to;
      prev.ranges.push(range);
    } else {
      blocks.push({ from: startLine.from, to: endLine.to, ranges: [range] });
    }
    upto = endLine.number + 1;
  }
  return blocks;
}
function moveLine(state, dispatch, forward) {
  if (state.readOnly)
    return false;
  let changes = [], ranges = [];
  for (let block of selectedLineBlocks(state)) {
    if (forward ? block.to == state.doc.length : block.from == 0)
      continue;
    let nextLine = state.doc.lineAt(forward ? block.to + 1 : block.from - 1);
    let size = nextLine.length + 1;
    if (forward) {
      changes.push({ from: block.to, to: nextLine.to }, { from: block.from, insert: nextLine.text + state.lineBreak });
      for (let r of block.ranges)
        ranges.push(EditorSelection.range(Math.min(state.doc.length, r.anchor + size), Math.min(state.doc.length, r.head + size)));
    } else {
      changes.push({ from: nextLine.from, to: block.from }, { from: block.to, insert: state.lineBreak + nextLine.text });
      for (let r of block.ranges)
        ranges.push(EditorSelection.range(r.anchor - size, r.head - size));
    }
  }
  if (!changes.length)
    return false;
  dispatch(state.update({
    changes,
    scrollIntoView: true,
    selection: EditorSelection.create(ranges, state.selection.mainIndex),
    userEvent: "move.line"
  }));
  return true;
}
const moveLineUp = ({ state, dispatch }) => moveLine(state, dispatch, false);
const moveLineDown = ({ state, dispatch }) => moveLine(state, dispatch, true);
function copyLine(state, dispatch, forward) {
  if (state.readOnly)
    return false;
  let changes = [];
  for (let block of selectedLineBlocks(state)) {
    if (forward)
      changes.push({ from: block.from, insert: state.doc.slice(block.from, block.to) + state.lineBreak });
    else
      changes.push({ from: block.to, insert: state.lineBreak + state.doc.slice(block.from, block.to) });
  }
  dispatch(state.update({ changes, scrollIntoView: true, userEvent: "input.copyline" }));
  return true;
}
const copyLineUp = ({ state, dispatch }) => copyLine(state, dispatch, false);
const copyLineDown = ({ state, dispatch }) => copyLine(state, dispatch, true);
const deleteLine = (view) => {
  if (view.state.readOnly)
    return false;
  let { state } = view, changes = state.changes(selectedLineBlocks(state).map(({ from, to }) => {
    if (from > 0)
      from--;
    else if (to < state.doc.length)
      to++;
    return { from, to };
  }));
  let selection = updateSel(state.selection, (range) => view.moveVertically(range, true)).map(changes);
  view.dispatch({ changes, selection, scrollIntoView: true, userEvent: "delete.line" });
  return true;
};
function isBetweenBrackets(state, pos) {
  if (/\(\)|\[\]|\{\}/.test(state.sliceDoc(pos - 1, pos + 1)))
    return { from: pos, to: pos };
  let context = syntaxTree(state).resolveInner(pos);
  let before = context.childBefore(pos), after = context.childAfter(pos), closedBy;
  if (before && after && before.to <= pos && after.from >= pos && (closedBy = before.type.prop(NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1 && state.doc.lineAt(before.to).from == state.doc.lineAt(after.from).from)
    return { from: before.to, to: after.from };
  return null;
}
const insertNewlineAndIndent = /* @__PURE__ */ newlineAndIndent(false);
const insertBlankLine = /* @__PURE__ */ newlineAndIndent(true);
function newlineAndIndent(atEof) {
  return ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let changes = state.changeByRange((range) => {
      let { from, to } = range, line = state.doc.lineAt(from);
      let explode = !atEof && from == to && isBetweenBrackets(state, from);
      if (atEof)
        from = to = (to <= line.to ? line : state.doc.lineAt(to)).to;
      let cx = new IndentContext(state, { simulateBreak: from, simulateDoubleBreak: !!explode });
      let indent = getIndentation(cx, from);
      if (indent == null)
        indent = /^\s*/.exec(state.doc.lineAt(from).text)[0].length;
      while (to < line.to && /\s/.test(line.text[to - line.from]))
        to++;
      if (explode)
        ({ from, to } = explode);
      else if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from)))
        from = line.from;
      let insert2 = ["", indentString(state, indent)];
      if (explode)
        insert2.push(indentString(state, cx.lineIndent(line.from, -1)));
      return {
        changes: { from, to, insert: Text.of(insert2) },
        range: EditorSelection.cursor(from + 1 + insert2[1].length)
      };
    });
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
    return true;
  };
}
function changeBySelectedLine(state, f) {
  let atLine = -1;
  return state.changeByRange((range) => {
    let changes = [];
    for (let pos = range.from; pos <= range.to; ) {
      let line = state.doc.lineAt(pos);
      if (line.number > atLine && (range.empty || range.to > line.from)) {
        f(line, changes, range);
        atLine = line.number;
      }
      pos = line.to + 1;
    }
    let changeSet = state.changes(changes);
    return {
      changes,
      range: EditorSelection.range(changeSet.mapPos(range.anchor, 1), changeSet.mapPos(range.head, 1))
    };
  });
}
const indentSelection = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  let updated = /* @__PURE__ */ Object.create(null);
  let context = new IndentContext(state, { overrideIndentation: (start) => {
    let found = updated[start];
    return found == null ? -1 : found;
  } });
  let changes = changeBySelectedLine(state, (line, changes2, range) => {
    let indent = getIndentation(context, line.from);
    if (indent == null)
      return;
    if (!/\S/.test(line.text))
      indent = 0;
    let cur2 = /^\s*/.exec(line.text)[0];
    let norm = indentString(state, indent);
    if (cur2 != norm || range.from < line.from + cur2.length) {
      updated[line.from] = indent;
      changes2.push({ from: line.from, to: line.from + cur2.length, insert: norm });
    }
  });
  if (!changes.changes.empty)
    dispatch(state.update(changes, { userEvent: "indent" }));
  return true;
};
const indentMore = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
    changes.push({ from: line.from, insert: state.facet(indentUnit) });
  }), { userEvent: "input.indent" }));
  return true;
};
const indentLess = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
    let space2 = /^\s*/.exec(line.text)[0];
    if (!space2)
      return;
    let col = countColumn(space2, state.tabSize), keep = 0;
    let insert2 = indentString(state, Math.max(0, col - getIndentUnit(state)));
    while (keep < space2.length && keep < insert2.length && space2.charCodeAt(keep) == insert2.charCodeAt(keep))
      keep++;
    changes.push({ from: line.from + keep, to: line.from + space2.length, insert: insert2.slice(keep) });
  }), { userEvent: "delete.dedent" }));
  return true;
};
const emacsStyleKeymap = [
  { key: "Ctrl-b", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
  { key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight },
  { key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp },
  { key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown },
  { key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart },
  { key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd },
  { key: "Ctrl-d", run: deleteCharForward },
  { key: "Ctrl-h", run: deleteCharBackward },
  { key: "Ctrl-k", run: deleteToLineEnd },
  { key: "Ctrl-Alt-h", run: deleteGroupBackward },
  { key: "Ctrl-o", run: splitLine },
  { key: "Ctrl-t", run: transposeChars },
  { key: "Ctrl-v", run: cursorPageDown }
];
const standardKeymap = /* @__PURE__ */ [
  { key: "ArrowLeft", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: cursorGroupLeft, shift: selectGroupLeft, preventDefault: true },
  { mac: "Cmd-ArrowLeft", run: cursorLineBoundaryLeft, shift: selectLineBoundaryLeft, preventDefault: true },
  { key: "ArrowRight", run: cursorCharRight, shift: selectCharRight, preventDefault: true },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: cursorGroupRight, shift: selectGroupRight, preventDefault: true },
  { mac: "Cmd-ArrowRight", run: cursorLineBoundaryRight, shift: selectLineBoundaryRight, preventDefault: true },
  { key: "ArrowUp", run: cursorLineUp, shift: selectLineUp, preventDefault: true },
  { mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart },
  { mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp },
  { key: "ArrowDown", run: cursorLineDown, shift: selectLineDown, preventDefault: true },
  { mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd },
  { mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown },
  { key: "PageUp", run: cursorPageUp, shift: selectPageUp },
  { key: "PageDown", run: cursorPageDown, shift: selectPageDown },
  { key: "Home", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward, preventDefault: true },
  { key: "Mod-Home", run: cursorDocStart, shift: selectDocStart },
  { key: "End", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward, preventDefault: true },
  { key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd },
  { key: "Enter", run: insertNewlineAndIndent },
  { key: "Mod-a", run: selectAll },
  { key: "Backspace", run: deleteCharBackward, shift: deleteCharBackward },
  { key: "Delete", run: deleteCharForward },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward },
  { key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward },
  { mac: "Mod-Backspace", run: deleteToLineStart },
  { mac: "Mod-Delete", run: deleteToLineEnd }
].concat(/* @__PURE__ */ emacsStyleKeymap.map((b) => ({ mac: b.key, run: b.run, shift: b.shift })));
const defaultKeymap = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight },
  { key: "Alt-ArrowUp", run: moveLineUp },
  { key: "Shift-Alt-ArrowUp", run: copyLineUp },
  { key: "Alt-ArrowDown", run: moveLineDown },
  { key: "Shift-Alt-ArrowDown", run: copyLineDown },
  { key: "Escape", run: simplifySelection },
  { key: "Mod-Enter", run: insertBlankLine },
  { key: "Alt-l", mac: "Ctrl-l", run: selectLine },
  { key: "Mod-i", run: selectParentSyntax, preventDefault: true },
  { key: "Mod-[", run: indentLess },
  { key: "Mod-]", run: indentMore },
  { key: "Mod-Alt-\\", run: indentSelection },
  { key: "Shift-Mod-k", run: deleteLine },
  { key: "Shift-Mod-\\", run: cursorMatchingBracket },
  { key: "Mod-/", run: toggleComment },
  { key: "Alt-A", run: toggleBlockComment }
].concat(standardKeymap);
function crelt() {
  var elt = arguments[0];
  if (typeof elt == "string")
    elt = document.createElement(elt);
  var i = 1, next = arguments[1];
  if (next && typeof next == "object" && next.nodeType == null && !Array.isArray(next)) {
    for (var name2 in next)
      if (Object.prototype.hasOwnProperty.call(next, name2)) {
        var value = next[name2];
        if (typeof value == "string")
          elt.setAttribute(name2, value);
        else if (value != null)
          elt[name2] = value;
      }
    i++;
  }
  for (; i < arguments.length; i++)
    add(elt, arguments[i]);
  return elt;
}
function add(elt, child) {
  if (typeof child == "string") {
    elt.appendChild(document.createTextNode(child));
  } else if (child == null)
    ;
  else if (child.nodeType != null) {
    elt.appendChild(child);
  } else if (Array.isArray(child)) {
    for (var i = 0; i < child.length; i++)
      add(elt, child[i]);
  } else {
    throw new RangeError("Unsupported child node: " + child);
  }
}
const basicNormalize = typeof String.prototype.normalize == "function" ? (x) => x.normalize("NFKD") : (x) => x;
class SearchCursor {
  /**
  Create a text cursor. The query is the search string, `from` to
  `to` provides the region to search.
  
  When `normalize` is given, it will be called, on both the query
  string and the content it is matched against, before comparing.
  You can, for example, create a case-insensitive search by
  passing `s => s.toLowerCase()`.
  
  Text is always normalized with
  [`.normalize("NFKD")`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)
  (when supported).
  */
  constructor(text, query, from = 0, to = text.length, normalize, test) {
    this.test = test;
    this.value = { from: 0, to: 0 };
    this.done = false;
    this.matches = [];
    this.buffer = "";
    this.bufferPos = 0;
    this.iter = text.iterRange(from, to);
    this.bufferStart = from;
    this.normalize = normalize ? (x) => normalize(basicNormalize(x)) : basicNormalize;
    this.query = this.normalize(query);
  }
  peek() {
    if (this.bufferPos == this.buffer.length) {
      this.bufferStart += this.buffer.length;
      this.iter.next();
      if (this.iter.done)
        return -1;
      this.bufferPos = 0;
      this.buffer = this.iter.value;
    }
    return codePointAt(this.buffer, this.bufferPos);
  }
  /**
  Look for the next match. Updates the iterator's
  [`value`](https://codemirror.net/6/docs/ref/#search.SearchCursor.value) and
  [`done`](https://codemirror.net/6/docs/ref/#search.SearchCursor.done) properties. Should be called
  at least once before using the cursor.
  */
  next() {
    while (this.matches.length)
      this.matches.pop();
    return this.nextOverlapping();
  }
  /**
  The `next` method will ignore matches that partially overlap a
  previous match. This method behaves like `next`, but includes
  such matches.
  */
  nextOverlapping() {
    for (; ; ) {
      let next = this.peek();
      if (next < 0) {
        this.done = true;
        return this;
      }
      let str = fromCodePoint(next), start = this.bufferStart + this.bufferPos;
      this.bufferPos += codePointSize(next);
      let norm = this.normalize(str);
      for (let i = 0, pos = start; ; i++) {
        let code2 = norm.charCodeAt(i);
        let match = this.match(code2, pos);
        if (match) {
          this.value = match;
          return this;
        }
        if (i == norm.length - 1)
          break;
        if (pos == start && i < str.length && str.charCodeAt(i) == code2)
          pos++;
      }
    }
  }
  match(code2, pos) {
    let match = null;
    for (let i = 0; i < this.matches.length; i += 2) {
      let index = this.matches[i], keep = false;
      if (this.query.charCodeAt(index) == code2) {
        if (index == this.query.length - 1) {
          match = { from: this.matches[i + 1], to: pos + 1 };
        } else {
          this.matches[i]++;
          keep = true;
        }
      }
      if (!keep) {
        this.matches.splice(i, 2);
        i -= 2;
      }
    }
    if (this.query.charCodeAt(0) == code2) {
      if (this.query.length == 1)
        match = { from: pos, to: pos + 1 };
      else
        this.matches.push(1, pos);
    }
    if (match && this.test && !this.test(match.from, match.to, this.buffer, this.bufferPos))
      match = null;
    return match;
  }
}
if (typeof Symbol != "undefined")
  SearchCursor.prototype[Symbol.iterator] = function() {
    return this;
  };
const empty = { from: -1, to: -1, match: /* @__PURE__ */ /.*/.exec("") };
const baseFlags = "gm" + (/x/.unicode == null ? "" : "u");
class RegExpCursor {
  /**
  Create a cursor that will search the given range in the given
  document. `query` should be the raw pattern (as you'd pass it to
  `new RegExp`).
  */
  constructor(text, query, options, from = 0, to = text.length) {
    this.text = text;
    this.to = to;
    this.curLine = "";
    this.done = false;
    this.value = empty;
    if (/\\[sWDnr]|\n|\r|\[\^/.test(query))
      return new MultilineRegExpCursor(text, query, options, from, to);
    this.re = new RegExp(query, baseFlags + ((options === null || options === void 0 ? void 0 : options.ignoreCase) ? "i" : ""));
    this.test = options === null || options === void 0 ? void 0 : options.test;
    this.iter = text.iter();
    let startLine = text.lineAt(from);
    this.curLineStart = startLine.from;
    this.matchPos = toCharEnd(text, from);
    this.getLine(this.curLineStart);
  }
  getLine(skip) {
    this.iter.next(skip);
    if (this.iter.lineBreak) {
      this.curLine = "";
    } else {
      this.curLine = this.iter.value;
      if (this.curLineStart + this.curLine.length > this.to)
        this.curLine = this.curLine.slice(0, this.to - this.curLineStart);
      this.iter.next();
    }
  }
  nextLine() {
    this.curLineStart = this.curLineStart + this.curLine.length + 1;
    if (this.curLineStart > this.to)
      this.curLine = "";
    else
      this.getLine(0);
  }
  /**
  Move to the next match, if there is one.
  */
  next() {
    for (let off = this.matchPos - this.curLineStart; ; ) {
      this.re.lastIndex = off;
      let match = this.matchPos <= this.to && this.re.exec(this.curLine);
      if (match) {
        let from = this.curLineStart + match.index, to = from + match[0].length;
        this.matchPos = toCharEnd(this.text, to + (from == to ? 1 : 0));
        if (from == this.curLineStart + this.curLine.length)
          this.nextLine();
        if ((from < to || from > this.value.to) && (!this.test || this.test(from, to, match))) {
          this.value = { from, to, match };
          return this;
        }
        off = this.matchPos - this.curLineStart;
      } else if (this.curLineStart + this.curLine.length < this.to) {
        this.nextLine();
        off = 0;
      } else {
        this.done = true;
        return this;
      }
    }
  }
}
const flattened = /* @__PURE__ */ new WeakMap();
class FlattenedDoc {
  constructor(from, text) {
    this.from = from;
    this.text = text;
  }
  get to() {
    return this.from + this.text.length;
  }
  static get(doc2, from, to) {
    let cached = flattened.get(doc2);
    if (!cached || cached.from >= to || cached.to <= from) {
      let flat = new FlattenedDoc(from, doc2.sliceString(from, to));
      flattened.set(doc2, flat);
      return flat;
    }
    if (cached.from == from && cached.to == to)
      return cached;
    let { text, from: cachedFrom } = cached;
    if (cachedFrom > from) {
      text = doc2.sliceString(from, cachedFrom) + text;
      cachedFrom = from;
    }
    if (cached.to < to)
      text += doc2.sliceString(cached.to, to);
    flattened.set(doc2, new FlattenedDoc(cachedFrom, text));
    return new FlattenedDoc(from, text.slice(from - cachedFrom, to - cachedFrom));
  }
}
class MultilineRegExpCursor {
  constructor(text, query, options, from, to) {
    this.text = text;
    this.to = to;
    this.done = false;
    this.value = empty;
    this.matchPos = toCharEnd(text, from);
    this.re = new RegExp(query, baseFlags + ((options === null || options === void 0 ? void 0 : options.ignoreCase) ? "i" : ""));
    this.test = options === null || options === void 0 ? void 0 : options.test;
    this.flat = FlattenedDoc.get(text, from, this.chunkEnd(
      from + 5e3
      /* Chunk.Base */
    ));
  }
  chunkEnd(pos) {
    return pos >= this.to ? this.to : this.text.lineAt(pos).to;
  }
  next() {
    for (; ; ) {
      let off = this.re.lastIndex = this.matchPos - this.flat.from;
      let match = this.re.exec(this.flat.text);
      if (match && !match[0] && match.index == off) {
        this.re.lastIndex = off + 1;
        match = this.re.exec(this.flat.text);
      }
      if (match) {
        let from = this.flat.from + match.index, to = from + match[0].length;
        if ((this.flat.to >= this.to || match.index + match[0].length <= this.flat.text.length - 10) && (!this.test || this.test(from, to, match))) {
          this.value = { from, to, match };
          this.matchPos = toCharEnd(this.text, to + (from == to ? 1 : 0));
          return this;
        }
      }
      if (this.flat.to == this.to) {
        this.done = true;
        return this;
      }
      this.flat = FlattenedDoc.get(this.text, this.flat.from, this.chunkEnd(this.flat.from + this.flat.text.length * 2));
    }
  }
}
if (typeof Symbol != "undefined") {
  RegExpCursor.prototype[Symbol.iterator] = MultilineRegExpCursor.prototype[Symbol.iterator] = function() {
    return this;
  };
}
function validRegExp(source) {
  try {
    new RegExp(source, baseFlags);
    return true;
  } catch (_a2) {
    return false;
  }
}
function toCharEnd(text, pos) {
  if (pos >= text.length)
    return pos;
  let line = text.lineAt(pos), next;
  while (pos < line.to && (next = line.text.charCodeAt(pos - line.from)) >= 56320 && next < 57344)
    pos++;
  return pos;
}
function createLineDialog(view) {
  let input = crelt("input", { class: "cm-textfield", name: "line" });
  let dom = crelt("form", {
    class: "cm-gotoLine",
    onkeydown: (event) => {
      if (event.keyCode == 27) {
        event.preventDefault();
        view.dispatch({ effects: dialogEffect.of(false) });
        view.focus();
      } else if (event.keyCode == 13) {
        event.preventDefault();
        go();
      }
    },
    onsubmit: (event) => {
      event.preventDefault();
      go();
    }
  }, crelt("label", view.state.phrase("Go to line"), ": ", input), " ", crelt("button", { class: "cm-button", type: "submit" }, view.state.phrase("go")));
  function go() {
    let match = /^([+-])?(\d+)?(:\d+)?(%)?$/.exec(input.value);
    if (!match)
      return;
    let { state } = view, startLine = state.doc.lineAt(state.selection.main.head);
    let [, sign, ln, cl, percent] = match;
    let col = cl ? +cl.slice(1) : 0;
    let line = ln ? +ln : startLine.number;
    if (ln && percent) {
      let pc = line / 100;
      if (sign)
        pc = pc * (sign == "-" ? -1 : 1) + startLine.number / state.doc.lines;
      line = Math.round(state.doc.lines * pc);
    } else if (ln && sign) {
      line = line * (sign == "-" ? -1 : 1) + startLine.number;
    }
    let docLine = state.doc.line(Math.max(1, Math.min(state.doc.lines, line)));
    view.dispatch({
      effects: dialogEffect.of(false),
      selection: EditorSelection.cursor(docLine.from + Math.max(0, Math.min(col, docLine.length))),
      scrollIntoView: true
    });
    view.focus();
  }
  return { dom };
}
const dialogEffect = /* @__PURE__ */ StateEffect.define();
const dialogField = /* @__PURE__ */ StateField.define({
  create() {
    return true;
  },
  update(value, tr) {
    for (let e of tr.effects)
      if (e.is(dialogEffect))
        value = e.value;
    return value;
  },
  provide: (f) => showPanel.from(f, (val) => val ? createLineDialog : null)
});
const gotoLine = (view) => {
  let panel = getPanel(view, createLineDialog);
  if (!panel) {
    let effects = [dialogEffect.of(true)];
    if (view.state.field(dialogField, false) == null)
      effects.push(StateEffect.appendConfig.of([dialogField, baseTheme$1$1]));
    view.dispatch({ effects });
    panel = getPanel(view, createLineDialog);
  }
  if (panel)
    panel.dom.querySelector("input").focus();
  return true;
};
const baseTheme$1$1 = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-panel.cm-gotoLine": {
    padding: "2px 6px 4px",
    "& label": { fontSize: "80%" }
  }
});
const defaultHighlightOptions = {
  highlightWordAroundCursor: false,
  minSelectionLength: 1,
  maxMatches: 100,
  wholeWords: false
};
const highlightConfig = /* @__PURE__ */ Facet.define({
  combine(options) {
    return combineConfig(options, defaultHighlightOptions, {
      highlightWordAroundCursor: (a, b) => a || b,
      minSelectionLength: Math.min,
      maxMatches: Math.min
    });
  }
});
function highlightSelectionMatches(options) {
  let ext = [defaultTheme, matchHighlighter];
  if (options)
    ext.push(highlightConfig.of(options));
  return ext;
}
const matchDeco = /* @__PURE__ */ Decoration.mark({ class: "cm-selectionMatch" });
const mainMatchDeco = /* @__PURE__ */ Decoration.mark({ class: "cm-selectionMatch cm-selectionMatch-main" });
function insideWordBoundaries(check, state, from, to) {
  return (from == 0 || check(state.sliceDoc(from - 1, from)) != CharCategory.Word) && (to == state.doc.length || check(state.sliceDoc(to, to + 1)) != CharCategory.Word);
}
function insideWord(check, state, from, to) {
  return check(state.sliceDoc(from, from + 1)) == CharCategory.Word && check(state.sliceDoc(to - 1, to)) == CharCategory.Word;
}
const matchHighlighter = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = this.getDeco(view);
  }
  update(update) {
    if (update.selectionSet || update.docChanged || update.viewportChanged)
      this.decorations = this.getDeco(update.view);
  }
  getDeco(view) {
    let conf = view.state.facet(highlightConfig);
    let { state } = view, sel = state.selection;
    if (sel.ranges.length > 1)
      return Decoration.none;
    let range = sel.main, query, check = null;
    if (range.empty) {
      if (!conf.highlightWordAroundCursor)
        return Decoration.none;
      let word = state.wordAt(range.head);
      if (!word)
        return Decoration.none;
      check = state.charCategorizer(range.head);
      query = state.sliceDoc(word.from, word.to);
    } else {
      let len = range.to - range.from;
      if (len < conf.minSelectionLength || len > 200)
        return Decoration.none;
      if (conf.wholeWords) {
        query = state.sliceDoc(range.from, range.to);
        check = state.charCategorizer(range.head);
        if (!(insideWordBoundaries(check, state, range.from, range.to) && insideWord(check, state, range.from, range.to)))
          return Decoration.none;
      } else {
        query = state.sliceDoc(range.from, range.to).trim();
        if (!query)
          return Decoration.none;
      }
    }
    let deco = [];
    for (let part of view.visibleRanges) {
      let cursor = new SearchCursor(state.doc, query, part.from, part.to);
      while (!cursor.next().done) {
        let { from, to } = cursor.value;
        if (!check || insideWordBoundaries(check, state, from, to)) {
          if (range.empty && from <= range.from && to >= range.to)
            deco.push(mainMatchDeco.range(from, to));
          else if (from >= range.to || to <= range.from)
            deco.push(matchDeco.range(from, to));
          if (deco.length > conf.maxMatches)
            return Decoration.none;
        }
      }
    }
    return Decoration.set(deco);
  }
}, {
  decorations: (v) => v.decorations
});
const defaultTheme = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-selectionMatch": { backgroundColor: "#99ff7780" },
  ".cm-searchMatch .cm-selectionMatch": { backgroundColor: "transparent" }
});
const selectWord = ({ state, dispatch }) => {
  let { selection } = state;
  let newSel = EditorSelection.create(selection.ranges.map((range) => state.wordAt(range.head) || EditorSelection.cursor(range.head)), selection.mainIndex);
  if (newSel.eq(selection))
    return false;
  dispatch(state.update({ selection: newSel }));
  return true;
};
function findNextOccurrence(state, query) {
  let { main, ranges } = state.selection;
  let word = state.wordAt(main.head), fullWord = word && word.from == main.from && word.to == main.to;
  for (let cycled = false, cursor = new SearchCursor(state.doc, query, ranges[ranges.length - 1].to); ; ) {
    cursor.next();
    if (cursor.done) {
      if (cycled)
        return null;
      cursor = new SearchCursor(state.doc, query, 0, Math.max(0, ranges[ranges.length - 1].from - 1));
      cycled = true;
    } else {
      if (cycled && ranges.some((r) => r.from == cursor.value.from))
        continue;
      if (fullWord) {
        let word2 = state.wordAt(cursor.value.from);
        if (!word2 || word2.from != cursor.value.from || word2.to != cursor.value.to)
          continue;
      }
      return cursor.value;
    }
  }
}
const selectNextOccurrence = ({ state, dispatch }) => {
  let { ranges } = state.selection;
  if (ranges.some((sel) => sel.from === sel.to))
    return selectWord({ state, dispatch });
  let searchedText = state.sliceDoc(ranges[0].from, ranges[0].to);
  if (state.selection.ranges.some((r) => state.sliceDoc(r.from, r.to) != searchedText))
    return false;
  let range = findNextOccurrence(state, searchedText);
  if (!range)
    return false;
  dispatch(state.update({
    selection: state.selection.addRange(EditorSelection.range(range.from, range.to), false),
    effects: EditorView.scrollIntoView(range.to)
  }));
  return true;
};
const searchConfigFacet = /* @__PURE__ */ Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      top: false,
      caseSensitive: false,
      literal: false,
      wholeWord: false,
      createPanel: (view) => new SearchPanel(view)
    });
  }
});
class SearchQuery {
  /**
  Create a query object.
  */
  constructor(config2) {
    this.search = config2.search;
    this.caseSensitive = !!config2.caseSensitive;
    this.literal = !!config2.literal;
    this.regexp = !!config2.regexp;
    this.replace = config2.replace || "";
    this.valid = !!this.search && (!this.regexp || validRegExp(this.search));
    this.unquoted = this.unquote(this.search);
    this.wholeWord = !!config2.wholeWord;
  }
  /**
  @internal
  */
  unquote(text) {
    return this.literal ? text : text.replace(/\\([nrt\\])/g, (_, ch) => ch == "n" ? "\n" : ch == "r" ? "\r" : ch == "t" ? "	" : "\\");
  }
  /**
  Compare this query to another query.
  */
  eq(other) {
    return this.search == other.search && this.replace == other.replace && this.caseSensitive == other.caseSensitive && this.regexp == other.regexp && this.wholeWord == other.wholeWord;
  }
  /**
  @internal
  */
  create() {
    return this.regexp ? new RegExpQuery(this) : new StringQuery(this);
  }
  /**
  Get a search cursor for this query, searching through the given
  range in the given state.
  */
  getCursor(state, from = 0, to) {
    let st = state.doc ? state : EditorState.create({ doc: state });
    if (to == null)
      to = st.doc.length;
    return this.regexp ? regexpCursor(this, st, from, to) : stringCursor(this, st, from, to);
  }
}
class QueryType {
  constructor(spec) {
    this.spec = spec;
  }
}
function stringCursor(spec, state, from, to) {
  return new SearchCursor(state.doc, spec.unquoted, from, to, spec.caseSensitive ? void 0 : (x) => x.toLowerCase(), spec.wholeWord ? stringWordTest(state.doc, state.charCategorizer(state.selection.main.head)) : void 0);
}
function stringWordTest(doc2, categorizer) {
  return (from, to, buf, bufPos) => {
    if (bufPos > from || bufPos + buf.length < to) {
      bufPos = Math.max(0, from - 2);
      buf = doc2.sliceString(bufPos, Math.min(doc2.length, to + 2));
    }
    return (categorizer(charBefore(buf, from - bufPos)) != CharCategory.Word || categorizer(charAfter(buf, from - bufPos)) != CharCategory.Word) && (categorizer(charAfter(buf, to - bufPos)) != CharCategory.Word || categorizer(charBefore(buf, to - bufPos)) != CharCategory.Word);
  };
}
class StringQuery extends QueryType {
  constructor(spec) {
    super(spec);
  }
  nextMatch(state, curFrom, curTo) {
    let cursor = stringCursor(this.spec, state, curTo, state.doc.length).nextOverlapping();
    if (cursor.done)
      cursor = stringCursor(this.spec, state, 0, curFrom).nextOverlapping();
    return cursor.done ? null : cursor.value;
  }
  // Searching in reverse is, rather than implementing inverted search
  // cursor, done by scanning chunk after chunk forward.
  prevMatchInRange(state, from, to) {
    for (let pos = to; ; ) {
      let start = Math.max(from, pos - 1e4 - this.spec.unquoted.length);
      let cursor = stringCursor(this.spec, state, start, pos), range = null;
      while (!cursor.nextOverlapping().done)
        range = cursor.value;
      if (range)
        return range;
      if (start == from)
        return null;
      pos -= 1e4;
    }
  }
  prevMatch(state, curFrom, curTo) {
    return this.prevMatchInRange(state, 0, curFrom) || this.prevMatchInRange(state, curTo, state.doc.length);
  }
  getReplacement(_result) {
    return this.spec.unquote(this.spec.replace);
  }
  matchAll(state, limit) {
    let cursor = stringCursor(this.spec, state, 0, state.doc.length), ranges = [];
    while (!cursor.next().done) {
      if (ranges.length >= limit)
        return null;
      ranges.push(cursor.value);
    }
    return ranges;
  }
  highlight(state, from, to, add2) {
    let cursor = stringCursor(this.spec, state, Math.max(0, from - this.spec.unquoted.length), Math.min(to + this.spec.unquoted.length, state.doc.length));
    while (!cursor.next().done)
      add2(cursor.value.from, cursor.value.to);
  }
}
function regexpCursor(spec, state, from, to) {
  return new RegExpCursor(state.doc, spec.search, {
    ignoreCase: !spec.caseSensitive,
    test: spec.wholeWord ? regexpWordTest(state.charCategorizer(state.selection.main.head)) : void 0
  }, from, to);
}
function charBefore(str, index) {
  return str.slice(findClusterBreak(str, index, false), index);
}
function charAfter(str, index) {
  return str.slice(index, findClusterBreak(str, index));
}
function regexpWordTest(categorizer) {
  return (_from, _to, match) => !match[0].length || (categorizer(charBefore(match.input, match.index)) != CharCategory.Word || categorizer(charAfter(match.input, match.index)) != CharCategory.Word) && (categorizer(charAfter(match.input, match.index + match[0].length)) != CharCategory.Word || categorizer(charBefore(match.input, match.index + match[0].length)) != CharCategory.Word);
}
class RegExpQuery extends QueryType {
  nextMatch(state, curFrom, curTo) {
    let cursor = regexpCursor(this.spec, state, curTo, state.doc.length).next();
    if (cursor.done)
      cursor = regexpCursor(this.spec, state, 0, curFrom).next();
    return cursor.done ? null : cursor.value;
  }
  prevMatchInRange(state, from, to) {
    for (let size = 1; ; size++) {
      let start = Math.max(
        from,
        to - size * 1e4
        /* FindPrev.ChunkSize */
      );
      let cursor = regexpCursor(this.spec, state, start, to), range = null;
      while (!cursor.next().done)
        range = cursor.value;
      if (range && (start == from || range.from > start + 10))
        return range;
      if (start == from)
        return null;
    }
  }
  prevMatch(state, curFrom, curTo) {
    return this.prevMatchInRange(state, 0, curFrom) || this.prevMatchInRange(state, curTo, state.doc.length);
  }
  getReplacement(result) {
    return this.spec.unquote(this.spec.replace.replace(/\$([$&\d+])/g, (m, i) => i == "$" ? "$" : i == "&" ? result.match[0] : i != "0" && +i < result.match.length ? result.match[i] : m));
  }
  matchAll(state, limit) {
    let cursor = regexpCursor(this.spec, state, 0, state.doc.length), ranges = [];
    while (!cursor.next().done) {
      if (ranges.length >= limit)
        return null;
      ranges.push(cursor.value);
    }
    return ranges;
  }
  highlight(state, from, to, add2) {
    let cursor = regexpCursor(this.spec, state, Math.max(
      0,
      from - 250
      /* RegExp.HighlightMargin */
    ), Math.min(to + 250, state.doc.length));
    while (!cursor.next().done)
      add2(cursor.value.from, cursor.value.to);
  }
}
const setSearchQuery = /* @__PURE__ */ StateEffect.define();
const togglePanel$1 = /* @__PURE__ */ StateEffect.define();
const searchState = /* @__PURE__ */ StateField.define({
  create(state) {
    return new SearchState(defaultQuery(state).create(), null);
  },
  update(value, tr) {
    for (let effect of tr.effects) {
      if (effect.is(setSearchQuery))
        value = new SearchState(effect.value.create(), value.panel);
      else if (effect.is(togglePanel$1))
        value = new SearchState(value.query, effect.value ? createSearchPanel : null);
    }
    return value;
  },
  provide: (f) => showPanel.from(f, (val) => val.panel)
});
class SearchState {
  constructor(query, panel) {
    this.query = query;
    this.panel = panel;
  }
}
const matchMark = /* @__PURE__ */ Decoration.mark({ class: "cm-searchMatch" }), selectedMatchMark = /* @__PURE__ */ Decoration.mark({ class: "cm-searchMatch cm-searchMatch-selected" });
const searchHighlighter = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.decorations = this.highlight(view.state.field(searchState));
  }
  update(update) {
    let state = update.state.field(searchState);
    if (state != update.startState.field(searchState) || update.docChanged || update.selectionSet || update.viewportChanged)
      this.decorations = this.highlight(state);
  }
  highlight({ query, panel }) {
    if (!panel || !query.spec.valid)
      return Decoration.none;
    let { view } = this;
    let builder = new RangeSetBuilder();
    for (let i = 0, ranges = view.visibleRanges, l = ranges.length; i < l; i++) {
      let { from, to } = ranges[i];
      while (i < l - 1 && to > ranges[i + 1].from - 2 * 250)
        to = ranges[++i].to;
      query.highlight(view.state, from, to, (from2, to2) => {
        let selected = view.state.selection.ranges.some((r) => r.from == from2 && r.to == to2);
        builder.add(from2, to2, selected ? selectedMatchMark : matchMark);
      });
    }
    return builder.finish();
  }
}, {
  decorations: (v) => v.decorations
});
function searchCommand(f) {
  return (view) => {
    let state = view.state.field(searchState, false);
    return state && state.query.spec.valid ? f(view, state) : openSearchPanel(view);
  };
}
const findNext = /* @__PURE__ */ searchCommand((view, { query }) => {
  let { to } = view.state.selection.main;
  let next = query.nextMatch(view.state, to, to);
  if (!next)
    return false;
  view.dispatch({
    selection: { anchor: next.from, head: next.to },
    scrollIntoView: true,
    effects: announceMatch(view, next),
    userEvent: "select.search"
  });
  return true;
});
const findPrevious = /* @__PURE__ */ searchCommand((view, { query }) => {
  let { state } = view, { from } = state.selection.main;
  let range = query.prevMatch(state, from, from);
  if (!range)
    return false;
  view.dispatch({
    selection: { anchor: range.from, head: range.to },
    scrollIntoView: true,
    effects: announceMatch(view, range),
    userEvent: "select.search"
  });
  return true;
});
const selectMatches = /* @__PURE__ */ searchCommand((view, { query }) => {
  let ranges = query.matchAll(view.state, 1e3);
  if (!ranges || !ranges.length)
    return false;
  view.dispatch({
    selection: EditorSelection.create(ranges.map((r) => EditorSelection.range(r.from, r.to))),
    userEvent: "select.search.matches"
  });
  return true;
});
const selectSelectionMatches = ({ state, dispatch }) => {
  let sel = state.selection;
  if (sel.ranges.length > 1 || sel.main.empty)
    return false;
  let { from, to } = sel.main;
  let ranges = [], main = 0;
  for (let cur2 = new SearchCursor(state.doc, state.sliceDoc(from, to)); !cur2.next().done; ) {
    if (ranges.length > 1e3)
      return false;
    if (cur2.value.from == from)
      main = ranges.length;
    ranges.push(EditorSelection.range(cur2.value.from, cur2.value.to));
  }
  dispatch(state.update({
    selection: EditorSelection.create(ranges, main),
    userEvent: "select.search.matches"
  }));
  return true;
};
const replaceNext = /* @__PURE__ */ searchCommand((view, { query }) => {
  let { state } = view, { from, to } = state.selection.main;
  if (state.readOnly)
    return false;
  let next = query.nextMatch(state, from, from);
  if (!next)
    return false;
  let changes = [], selection, replacement;
  let announce = [];
  if (next.from == from && next.to == to) {
    replacement = state.toText(query.getReplacement(next));
    changes.push({ from: next.from, to: next.to, insert: replacement });
    next = query.nextMatch(state, next.from, next.to);
    announce.push(EditorView.announce.of(state.phrase("replaced match on line $", state.doc.lineAt(from).number) + "."));
  }
  if (next) {
    let off = changes.length == 0 || changes[0].from >= next.to ? 0 : next.to - next.from - replacement.length;
    selection = { anchor: next.from - off, head: next.to - off };
    announce.push(announceMatch(view, next));
  }
  view.dispatch({
    changes,
    selection,
    scrollIntoView: !!selection,
    effects: announce,
    userEvent: "input.replace"
  });
  return true;
});
const replaceAll = /* @__PURE__ */ searchCommand((view, { query }) => {
  if (view.state.readOnly)
    return false;
  let changes = query.matchAll(view.state, 1e9).map((match) => {
    let { from, to } = match;
    return { from, to, insert: query.getReplacement(match) };
  });
  if (!changes.length)
    return false;
  let announceText = view.state.phrase("replaced $ matches", changes.length) + ".";
  view.dispatch({
    changes,
    effects: EditorView.announce.of(announceText),
    userEvent: "input.replace.all"
  });
  return true;
});
function createSearchPanel(view) {
  return view.state.facet(searchConfigFacet).createPanel(view);
}
function defaultQuery(state, fallback) {
  var _a2, _b, _c, _d;
  let sel = state.selection.main;
  let selText = sel.empty || sel.to > sel.from + 100 ? "" : state.sliceDoc(sel.from, sel.to);
  if (fallback && !selText)
    return fallback;
  let config2 = state.facet(searchConfigFacet);
  return new SearchQuery({
    search: ((_a2 = fallback === null || fallback === void 0 ? void 0 : fallback.literal) !== null && _a2 !== void 0 ? _a2 : config2.literal) ? selText : selText.replace(/\n/g, "\\n"),
    caseSensitive: (_b = fallback === null || fallback === void 0 ? void 0 : fallback.caseSensitive) !== null && _b !== void 0 ? _b : config2.caseSensitive,
    literal: (_c = fallback === null || fallback === void 0 ? void 0 : fallback.literal) !== null && _c !== void 0 ? _c : config2.literal,
    wholeWord: (_d = fallback === null || fallback === void 0 ? void 0 : fallback.wholeWord) !== null && _d !== void 0 ? _d : config2.wholeWord
  });
}
const openSearchPanel = (view) => {
  let state = view.state.field(searchState, false);
  if (state && state.panel) {
    let panel = getPanel(view, createSearchPanel);
    if (!panel)
      return false;
    let searchInput = panel.dom.querySelector("[main-field]");
    if (searchInput && searchInput != view.root.activeElement) {
      let query = defaultQuery(view.state, state.query.spec);
      if (query.valid)
        view.dispatch({ effects: setSearchQuery.of(query) });
      searchInput.focus();
      searchInput.select();
    }
  } else {
    view.dispatch({ effects: [
      togglePanel$1.of(true),
      state ? setSearchQuery.of(defaultQuery(view.state, state.query.spec)) : StateEffect.appendConfig.of(searchExtensions)
    ] });
  }
  return true;
};
const closeSearchPanel = (view) => {
  let state = view.state.field(searchState, false);
  if (!state || !state.panel)
    return false;
  let panel = getPanel(view, createSearchPanel);
  if (panel && panel.dom.contains(view.root.activeElement))
    view.focus();
  view.dispatch({ effects: togglePanel$1.of(false) });
  return true;
};
const searchKeymap = [
  { key: "Mod-f", run: openSearchPanel, scope: "editor search-panel" },
  { key: "F3", run: findNext, shift: findPrevious, scope: "editor search-panel", preventDefault: true },
  { key: "Mod-g", run: findNext, shift: findPrevious, scope: "editor search-panel", preventDefault: true },
  { key: "Escape", run: closeSearchPanel, scope: "editor search-panel" },
  { key: "Mod-Shift-l", run: selectSelectionMatches },
  { key: "Alt-g", run: gotoLine },
  { key: "Mod-d", run: selectNextOccurrence, preventDefault: true }
];
class SearchPanel {
  constructor(view) {
    this.view = view;
    let query = this.query = view.state.field(searchState).query.spec;
    this.commit = this.commit.bind(this);
    this.searchField = crelt("input", {
      value: query.search,
      placeholder: phrase(view, "Find"),
      "aria-label": phrase(view, "Find"),
      class: "cm-textfield",
      name: "search",
      form: "",
      "main-field": "true",
      onchange: this.commit,
      onkeyup: this.commit
    });
    this.replaceField = crelt("input", {
      value: query.replace,
      placeholder: phrase(view, "Replace"),
      "aria-label": phrase(view, "Replace"),
      class: "cm-textfield",
      name: "replace",
      form: "",
      onchange: this.commit,
      onkeyup: this.commit
    });
    this.caseField = crelt("input", {
      type: "checkbox",
      name: "case",
      form: "",
      checked: query.caseSensitive,
      onchange: this.commit
    });
    this.reField = crelt("input", {
      type: "checkbox",
      name: "re",
      form: "",
      checked: query.regexp,
      onchange: this.commit
    });
    this.wordField = crelt("input", {
      type: "checkbox",
      name: "word",
      form: "",
      checked: query.wholeWord,
      onchange: this.commit
    });
    function button(name2, onclick, content2) {
      return crelt("button", { class: "cm-button", name: name2, onclick, type: "button" }, content2);
    }
    this.dom = crelt("div", { onkeydown: (e) => this.keydown(e), class: "cm-search" }, [
      this.searchField,
      button("next", () => findNext(view), [phrase(view, "next")]),
      button("prev", () => findPrevious(view), [phrase(view, "previous")]),
      button("select", () => selectMatches(view), [phrase(view, "all")]),
      crelt("label", null, [this.caseField, phrase(view, "match case")]),
      crelt("label", null, [this.reField, phrase(view, "regexp")]),
      crelt("label", null, [this.wordField, phrase(view, "by word")]),
      ...view.state.readOnly ? [] : [
        crelt("br"),
        this.replaceField,
        button("replace", () => replaceNext(view), [phrase(view, "replace")]),
        button("replaceAll", () => replaceAll(view), [phrase(view, "replace all")])
      ],
      crelt("button", {
        name: "close",
        onclick: () => closeSearchPanel(view),
        "aria-label": phrase(view, "close"),
        type: "button"
      }, ["×"])
    ]);
  }
  commit() {
    let query = new SearchQuery({
      search: this.searchField.value,
      caseSensitive: this.caseField.checked,
      regexp: this.reField.checked,
      wholeWord: this.wordField.checked,
      replace: this.replaceField.value
    });
    if (!query.eq(this.query)) {
      this.query = query;
      this.view.dispatch({ effects: setSearchQuery.of(query) });
    }
  }
  keydown(e) {
    if (runScopeHandlers(this.view, e, "search-panel")) {
      e.preventDefault();
    } else if (e.keyCode == 13 && e.target == this.searchField) {
      e.preventDefault();
      (e.shiftKey ? findPrevious : findNext)(this.view);
    } else if (e.keyCode == 13 && e.target == this.replaceField) {
      e.preventDefault();
      replaceNext(this.view);
    }
  }
  update(update) {
    for (let tr of update.transactions)
      for (let effect of tr.effects) {
        if (effect.is(setSearchQuery) && !effect.value.eq(this.query))
          this.setQuery(effect.value);
      }
  }
  setQuery(query) {
    this.query = query;
    this.searchField.value = query.search;
    this.replaceField.value = query.replace;
    this.caseField.checked = query.caseSensitive;
    this.reField.checked = query.regexp;
    this.wordField.checked = query.wholeWord;
  }
  mount() {
    this.searchField.select();
  }
  get pos() {
    return 80;
  }
  get top() {
    return this.view.state.facet(searchConfigFacet).top;
  }
}
function phrase(view, phrase2) {
  return view.state.phrase(phrase2);
}
const AnnounceMargin = 30;
const Break = /[\s\.,:;?!]/;
function announceMatch(view, { from, to }) {
  let line = view.state.doc.lineAt(from), lineEnd = view.state.doc.lineAt(to).to;
  let start = Math.max(line.from, from - AnnounceMargin), end = Math.min(lineEnd, to + AnnounceMargin);
  let text = view.state.sliceDoc(start, end);
  if (start != line.from) {
    for (let i = 0; i < AnnounceMargin; i++)
      if (!Break.test(text[i + 1]) && Break.test(text[i])) {
        text = text.slice(i);
        break;
      }
  }
  if (end != lineEnd) {
    for (let i = text.length - 1; i > text.length - AnnounceMargin; i--)
      if (!Break.test(text[i - 1]) && Break.test(text[i])) {
        text = text.slice(0, i);
        break;
      }
  }
  return EditorView.announce.of(`${view.state.phrase("current match")}. ${text} ${view.state.phrase("on line")} ${line.number}.`);
}
const baseTheme$2 = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-panel.cm-search": {
    padding: "2px 6px 4px",
    position: "relative",
    "& [name=close]": {
      position: "absolute",
      top: "0",
      right: "4px",
      backgroundColor: "inherit",
      border: "none",
      font: "inherit",
      padding: 0,
      margin: 0
    },
    "& input, & button, & label": {
      margin: ".2em .6em .2em 0"
    },
    "& input[type=checkbox]": {
      marginRight: ".2em"
    },
    "& label": {
      fontSize: "80%",
      whiteSpace: "pre"
    }
  },
  "&light .cm-searchMatch": { backgroundColor: "#ffff0054" },
  "&dark .cm-searchMatch": { backgroundColor: "#00ffff8a" },
  "&light .cm-searchMatch-selected": { backgroundColor: "#ff6a0054" },
  "&dark .cm-searchMatch-selected": { backgroundColor: "#ff00ff8a" }
});
const searchExtensions = [
  searchState,
  /* @__PURE__ */ Prec.lowest(searchHighlighter),
  baseTheme$2
];
class CompletionContext {
  /**
  Create a new completion context. (Mostly useful for testing
  completion sources—in the editor, the extension will create
  these for you.)
  */
  constructor(state, pos, explicit) {
    this.state = state;
    this.pos = pos;
    this.explicit = explicit;
    this.abortListeners = [];
  }
  /**
  Get the extent, content, and (if there is a token) type of the
  token before `this.pos`.
  */
  tokenBefore(types2) {
    let token = syntaxTree(this.state).resolveInner(this.pos, -1);
    while (token && types2.indexOf(token.name) < 0)
      token = token.parent;
    return token ? {
      from: token.from,
      to: this.pos,
      text: this.state.sliceDoc(token.from, this.pos),
      type: token.type
    } : null;
  }
  /**
  Get the match of the given expression directly before the
  cursor.
  */
  matchBefore(expr) {
    let line = this.state.doc.lineAt(this.pos);
    let start = Math.max(line.from, this.pos - 250);
    let str = line.text.slice(start - line.from, this.pos - line.from);
    let found = str.search(ensureAnchor(expr, false));
    return found < 0 ? null : { from: start + found, to: this.pos, text: str.slice(found) };
  }
  /**
  Yields true when the query has been aborted. Can be useful in
  asynchronous queries to avoid doing work that will be ignored.
  */
  get aborted() {
    return this.abortListeners == null;
  }
  /**
  Allows you to register abort handlers, which will be called when
  the query is
  [aborted](https://codemirror.net/6/docs/ref/#autocomplete.CompletionContext.aborted).
  */
  addEventListener(type, listener) {
    if (type == "abort" && this.abortListeners)
      this.abortListeners.push(listener);
  }
}
function toSet(chars) {
  let flat = Object.keys(chars).join("");
  let words = /\w/.test(flat);
  if (words)
    flat = flat.replace(/\w/g, "");
  return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
}
function prefixMatch(options) {
  let first = /* @__PURE__ */ Object.create(null), rest = /* @__PURE__ */ Object.create(null);
  for (let { label } of options) {
    first[label[0]] = true;
    for (let i = 1; i < label.length; i++)
      rest[label[i]] = true;
  }
  let source = toSet(first) + toSet(rest) + "*$";
  return [new RegExp("^" + source), new RegExp(source)];
}
function completeFromList(list) {
  let options = list.map((o) => typeof o == "string" ? { label: o } : o);
  let [validFor, match] = options.every((o) => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options);
  return (context) => {
    let token = context.matchBefore(match);
    return token || context.explicit ? { from: token ? token.from : context.pos, options, validFor } : null;
  };
}
function ifNotIn(nodes, source) {
  return (context) => {
    for (let pos = syntaxTree(context.state).resolveInner(context.pos, -1); pos; pos = pos.parent) {
      if (nodes.indexOf(pos.name) > -1)
        return null;
      if (pos.type.isTop)
        break;
    }
    return source(context);
  };
}
class Option {
  constructor(completion, source, match) {
    this.completion = completion;
    this.source = source;
    this.match = match;
  }
}
function cur(state) {
  return state.selection.main.head;
}
function ensureAnchor(expr, start) {
  var _a2;
  let { source } = expr;
  let addStart = start && source[0] != "^", addEnd = source[source.length - 1] != "$";
  if (!addStart && !addEnd)
    return expr;
  return new RegExp(`${addStart ? "^" : ""}(?:${source})${addEnd ? "$" : ""}`, (_a2 = expr.flags) !== null && _a2 !== void 0 ? _a2 : expr.ignoreCase ? "i" : "");
}
const pickedCompletion = /* @__PURE__ */ Annotation.define();
function insertCompletionText(state, text, from, to) {
  return Object.assign(Object.assign({}, state.changeByRange((range) => {
    if (range == state.selection.main)
      return {
        changes: { from, to, insert: text },
        range: EditorSelection.cursor(from + text.length)
      };
    let len = to - from;
    if (!range.empty || len && state.sliceDoc(range.from - len, range.from) != state.sliceDoc(from, to))
      return { range };
    return {
      changes: { from: range.from - len, to: range.from, insert: text },
      range: EditorSelection.cursor(range.from - len + text.length)
    };
  })), { userEvent: "input.complete" });
}
function applyCompletion(view, option) {
  const apply = option.completion.apply || option.completion.label;
  let result = option.source;
  if (typeof apply == "string")
    view.dispatch(Object.assign(Object.assign({}, insertCompletionText(view.state, apply, result.from, result.to)), { annotations: pickedCompletion.of(option.completion) }));
  else
    apply(view, option.completion, result.from, result.to);
}
const SourceCache = /* @__PURE__ */ new WeakMap();
function asSource(source) {
  if (!Array.isArray(source))
    return source;
  let known = SourceCache.get(source);
  if (!known)
    SourceCache.set(source, known = completeFromList(source));
  return known;
}
class FuzzyMatcher {
  constructor(pattern) {
    this.pattern = pattern;
    this.chars = [];
    this.folded = [];
    this.any = [];
    this.precise = [];
    this.byWord = [];
    for (let p = 0; p < pattern.length; ) {
      let char = codePointAt(pattern, p), size = codePointSize(char);
      this.chars.push(char);
      let part = pattern.slice(p, p + size), upper = part.toUpperCase();
      this.folded.push(codePointAt(upper == part ? part.toLowerCase() : upper, 0));
      p += size;
    }
    this.astral = pattern.length != this.chars.length;
  }
  // Matches a given word (completion) against the pattern (input).
  // Will return null for no match, and otherwise an array that starts
  // with the match score, followed by any number of `from, to` pairs
  // indicating the matched parts of `word`.
  //
  // The score is a number that is more negative the worse the match
  // is. See `Penalty` above.
  match(word) {
    if (this.pattern.length == 0)
      return [0];
    if (word.length < this.pattern.length)
      return null;
    let { chars, folded, any, precise, byWord } = this;
    if (chars.length == 1) {
      let first = codePointAt(word, 0), firstSize = codePointSize(first);
      let score2 = firstSize == word.length ? 0 : -100;
      if (first == chars[0])
        ;
      else if (first == folded[0])
        score2 += -200;
      else
        return null;
      return [score2, 0, firstSize];
    }
    let direct = word.indexOf(this.pattern);
    if (direct == 0)
      return [word.length == this.pattern.length ? 0 : -100, 0, this.pattern.length];
    let len = chars.length, anyTo = 0;
    if (direct < 0) {
      for (let i = 0, e = Math.min(word.length, 200); i < e && anyTo < len; ) {
        let next = codePointAt(word, i);
        if (next == chars[anyTo] || next == folded[anyTo])
          any[anyTo++] = i;
        i += codePointSize(next);
      }
      if (anyTo < len)
        return null;
    }
    let preciseTo = 0;
    let byWordTo = 0, byWordFolded = false;
    let adjacentTo = 0, adjacentStart = -1, adjacentEnd = -1;
    let hasLower = /[a-z]/.test(word), wordAdjacent = true;
    for (let i = 0, e = Math.min(word.length, 200), prevType = 0; i < e && byWordTo < len; ) {
      let next = codePointAt(word, i);
      if (direct < 0) {
        if (preciseTo < len && next == chars[preciseTo])
          precise[preciseTo++] = i;
        if (adjacentTo < len) {
          if (next == chars[adjacentTo] || next == folded[adjacentTo]) {
            if (adjacentTo == 0)
              adjacentStart = i;
            adjacentEnd = i + 1;
            adjacentTo++;
          } else {
            adjacentTo = 0;
          }
        }
      }
      let ch, type = next < 255 ? next >= 48 && next <= 57 || next >= 97 && next <= 122 ? 2 : next >= 65 && next <= 90 ? 1 : 0 : (ch = fromCodePoint(next)) != ch.toLowerCase() ? 1 : ch != ch.toUpperCase() ? 2 : 0;
      if (!i || type == 1 && hasLower || prevType == 0 && type != 0) {
        if (chars[byWordTo] == next || folded[byWordTo] == next && (byWordFolded = true))
          byWord[byWordTo++] = i;
        else if (byWord.length)
          wordAdjacent = false;
      }
      prevType = type;
      i += codePointSize(next);
    }
    if (byWordTo == len && byWord[0] == 0 && wordAdjacent)
      return this.result(-100 + (byWordFolded ? -200 : 0), byWord, word);
    if (adjacentTo == len && adjacentStart == 0)
      return [-200 - word.length + (adjacentEnd == word.length ? 0 : -100), 0, adjacentEnd];
    if (direct > -1)
      return [-700 - word.length, direct, direct + this.pattern.length];
    if (adjacentTo == len)
      return [-200 + -700 - word.length, adjacentStart, adjacentEnd];
    if (byWordTo == len)
      return this.result(-100 + (byWordFolded ? -200 : 0) + -700 + (wordAdjacent ? 0 : -1100), byWord, word);
    return chars.length == 2 ? null : this.result((any[0] ? -700 : 0) + -200 + -1100, any, word);
  }
  result(score2, positions, word) {
    let result = [score2 - word.length], i = 1;
    for (let pos of positions) {
      let to = pos + (this.astral ? codePointSize(codePointAt(word, pos)) : 1);
      if (i > 1 && result[i - 1] == pos)
        result[i - 1] = to;
      else {
        result[i++] = pos;
        result[i++] = to;
      }
    }
    return result;
  }
}
const completionConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      activateOnTyping: true,
      selectOnOpen: true,
      override: null,
      closeOnBlur: true,
      maxRenderedOptions: 100,
      defaultKeymap: true,
      tooltipClass: () => "",
      optionClass: () => "",
      aboveCursor: false,
      icons: true,
      addToOptions: [],
      compareCompletions: (a, b) => a.label.localeCompare(b.label),
      interactionDelay: 75
    }, {
      defaultKeymap: (a, b) => a && b,
      closeOnBlur: (a, b) => a && b,
      icons: (a, b) => a && b,
      tooltipClass: (a, b) => (c) => joinClass(a(c), b(c)),
      optionClass: (a, b) => (c) => joinClass(a(c), b(c)),
      addToOptions: (a, b) => a.concat(b)
    });
  }
});
function joinClass(a, b) {
  return a ? b ? a + " " + b : a : b;
}
function optionContent(config2) {
  let content2 = config2.addToOptions.slice();
  if (config2.icons)
    content2.push({
      render(completion) {
        let icon = document.createElement("div");
        icon.classList.add("cm-completionIcon");
        if (completion.type)
          icon.classList.add(...completion.type.split(/\s+/g).map((cls) => "cm-completionIcon-" + cls));
        icon.setAttribute("aria-hidden", "true");
        return icon;
      },
      position: 20
    });
  content2.push({
    render(completion, _s, match) {
      let labelElt = document.createElement("span");
      labelElt.className = "cm-completionLabel";
      let { label } = completion, off = 0;
      for (let j = 1; j < match.length; ) {
        let from = match[j++], to = match[j++];
        if (from > off)
          labelElt.appendChild(document.createTextNode(label.slice(off, from)));
        let span = labelElt.appendChild(document.createElement("span"));
        span.appendChild(document.createTextNode(label.slice(from, to)));
        span.className = "cm-completionMatchedText";
        off = to;
      }
      if (off < label.length)
        labelElt.appendChild(document.createTextNode(label.slice(off)));
      return labelElt;
    },
    position: 50
  }, {
    render(completion) {
      if (!completion.detail)
        return null;
      let detailElt = document.createElement("span");
      detailElt.className = "cm-completionDetail";
      detailElt.textContent = completion.detail;
      return detailElt;
    },
    position: 80
  });
  return content2.sort((a, b) => a.position - b.position).map((a) => a.render);
}
function rangeAroundSelected(total, selected, max) {
  if (total <= max)
    return { from: 0, to: total };
  if (selected < 0)
    selected = 0;
  if (selected <= total >> 1) {
    let off2 = Math.floor(selected / max);
    return { from: off2 * max, to: (off2 + 1) * max };
  }
  let off = Math.floor((total - selected) / max);
  return { from: total - (off + 1) * max, to: total - off * max };
}
class CompletionTooltip {
  constructor(view, stateField) {
    this.view = view;
    this.stateField = stateField;
    this.info = null;
    this.placeInfo = {
      read: () => this.measureInfo(),
      write: (pos) => this.positionInfo(pos),
      key: this
    };
    this.space = null;
    this.currentClass = "";
    let cState = view.state.field(stateField);
    let { options, selected } = cState.open;
    let config2 = view.state.facet(completionConfig);
    this.optionContent = optionContent(config2);
    this.optionClass = config2.optionClass;
    this.tooltipClass = config2.tooltipClass;
    this.range = rangeAroundSelected(options.length, selected, config2.maxRenderedOptions);
    this.dom = document.createElement("div");
    this.dom.className = "cm-tooltip-autocomplete";
    this.updateTooltipClass(view.state);
    this.dom.addEventListener("mousedown", (e) => {
      for (let dom = e.target, match; dom && dom != this.dom; dom = dom.parentNode) {
        if (dom.nodeName == "LI" && (match = /-(\d+)$/.exec(dom.id)) && +match[1] < options.length) {
          applyCompletion(view, options[+match[1]]);
          e.preventDefault();
          return;
        }
      }
    });
    this.list = this.dom.appendChild(this.createListBox(options, cState.id, this.range));
    this.list.addEventListener("scroll", () => {
      if (this.info)
        this.view.requestMeasure(this.placeInfo);
    });
  }
  mount() {
    this.updateSel();
  }
  update(update) {
    var _a2, _b, _c;
    let cState = update.state.field(this.stateField);
    let prevState = update.startState.field(this.stateField);
    this.updateTooltipClass(update.state);
    if (cState != prevState) {
      this.updateSel();
      if (((_a2 = cState.open) === null || _a2 === void 0 ? void 0 : _a2.disabled) != ((_b = prevState.open) === null || _b === void 0 ? void 0 : _b.disabled))
        this.dom.classList.toggle("cm-tooltip-autocomplete-disabled", !!((_c = cState.open) === null || _c === void 0 ? void 0 : _c.disabled));
    }
  }
  updateTooltipClass(state) {
    let cls = this.tooltipClass(state);
    if (cls != this.currentClass) {
      for (let c of this.currentClass.split(" "))
        if (c)
          this.dom.classList.remove(c);
      for (let c of cls.split(" "))
        if (c)
          this.dom.classList.add(c);
      this.currentClass = cls;
    }
  }
  positioned(space2) {
    this.space = space2;
    if (this.info)
      this.view.requestMeasure(this.placeInfo);
  }
  updateSel() {
    let cState = this.view.state.field(this.stateField), open = cState.open;
    if (open.selected > -1 && open.selected < this.range.from || open.selected >= this.range.to) {
      this.range = rangeAroundSelected(open.options.length, open.selected, this.view.state.facet(completionConfig).maxRenderedOptions);
      this.list.remove();
      this.list = this.dom.appendChild(this.createListBox(open.options, cState.id, this.range));
      this.list.addEventListener("scroll", () => {
        if (this.info)
          this.view.requestMeasure(this.placeInfo);
      });
    }
    if (this.updateSelectedOption(open.selected)) {
      if (this.info) {
        this.info.remove();
        this.info = null;
      }
      let { completion } = open.options[open.selected];
      let { info } = completion;
      if (!info)
        return;
      let infoResult = typeof info === "string" ? document.createTextNode(info) : info(completion);
      if (!infoResult)
        return;
      if ("then" in infoResult) {
        infoResult.then((node) => {
          if (node && this.view.state.field(this.stateField, false) == cState)
            this.addInfoPane(node);
        }).catch((e) => logException(this.view.state, e, "completion info"));
      } else {
        this.addInfoPane(infoResult);
      }
    }
  }
  addInfoPane(content2) {
    let dom = this.info = document.createElement("div");
    dom.className = "cm-tooltip cm-completionInfo";
    dom.appendChild(content2);
    this.dom.appendChild(dom);
    this.view.requestMeasure(this.placeInfo);
  }
  updateSelectedOption(selected) {
    let set = null;
    for (let opt = this.list.firstChild, i = this.range.from; opt; opt = opt.nextSibling, i++) {
      if (i == selected) {
        if (!opt.hasAttribute("aria-selected")) {
          opt.setAttribute("aria-selected", "true");
          set = opt;
        }
      } else {
        if (opt.hasAttribute("aria-selected"))
          opt.removeAttribute("aria-selected");
      }
    }
    if (set)
      scrollIntoView(this.list, set);
    return set;
  }
  measureInfo() {
    let sel = this.dom.querySelector("[aria-selected]");
    if (!sel || !this.info)
      return null;
    let listRect = this.dom.getBoundingClientRect();
    let infoRect = this.info.getBoundingClientRect();
    let selRect = sel.getBoundingClientRect();
    let space2 = this.space;
    if (!space2) {
      let win = this.dom.ownerDocument.defaultView || window;
      space2 = { left: 0, top: 0, right: win.innerWidth, bottom: win.innerHeight };
    }
    if (selRect.top > Math.min(space2.bottom, listRect.bottom) - 10 || selRect.bottom < Math.max(space2.top, listRect.top) + 10)
      return null;
    let rtl = this.view.textDirection == Direction.RTL, left = rtl, narrow = false, maxWidth;
    let top2 = "", bottom = "";
    let spaceLeft = listRect.left - space2.left, spaceRight = space2.right - listRect.right;
    if (left && spaceLeft < Math.min(infoRect.width, spaceRight))
      left = false;
    else if (!left && spaceRight < Math.min(infoRect.width, spaceLeft))
      left = true;
    if (infoRect.width <= (left ? spaceLeft : spaceRight)) {
      top2 = Math.max(space2.top, Math.min(selRect.top, space2.bottom - infoRect.height)) - listRect.top + "px";
      maxWidth = Math.min(400, left ? spaceLeft : spaceRight) + "px";
    } else {
      narrow = true;
      maxWidth = Math.min(
        400,
        (rtl ? listRect.right : space2.right - listRect.left) - 30
        /* Info.Margin */
      ) + "px";
      let spaceBelow = space2.bottom - listRect.bottom;
      if (spaceBelow >= infoRect.height || spaceBelow > listRect.top)
        top2 = selRect.bottom - listRect.top + "px";
      else
        bottom = listRect.bottom - selRect.top + "px";
    }
    return {
      top: top2,
      bottom,
      maxWidth,
      class: narrow ? rtl ? "left-narrow" : "right-narrow" : left ? "left" : "right"
    };
  }
  positionInfo(pos) {
    if (this.info) {
      if (pos) {
        this.info.style.top = pos.top;
        this.info.style.bottom = pos.bottom;
        this.info.style.maxWidth = pos.maxWidth;
        this.info.className = "cm-tooltip cm-completionInfo cm-completionInfo-" + pos.class;
      } else {
        this.info.style.top = "-1e6px";
      }
    }
  }
  createListBox(options, id2, range) {
    const ul = document.createElement("ul");
    ul.id = id2;
    ul.setAttribute("role", "listbox");
    ul.setAttribute("aria-expanded", "true");
    ul.setAttribute("aria-label", this.view.state.phrase("Completions"));
    for (let i = range.from; i < range.to; i++) {
      let { completion, match } = options[i];
      const li = ul.appendChild(document.createElement("li"));
      li.id = id2 + "-" + i;
      li.setAttribute("role", "option");
      let cls = this.optionClass(completion);
      if (cls)
        li.className = cls;
      for (let source of this.optionContent) {
        let node = source(completion, this.view.state, match);
        if (node)
          li.appendChild(node);
      }
    }
    if (range.from)
      ul.classList.add("cm-completionListIncompleteTop");
    if (range.to < options.length)
      ul.classList.add("cm-completionListIncompleteBottom");
    return ul;
  }
}
function completionTooltip(stateField) {
  return (view) => new CompletionTooltip(view, stateField);
}
function scrollIntoView(container, element) {
  let parent = container.getBoundingClientRect();
  let self = element.getBoundingClientRect();
  if (self.top < parent.top)
    container.scrollTop -= parent.top - self.top;
  else if (self.bottom > parent.bottom)
    container.scrollTop += self.bottom - parent.bottom;
}
function score(option) {
  return (option.boost || 0) * 100 + (option.apply ? 10 : 0) + (option.info ? 5 : 0) + (option.type ? 1 : 0);
}
function sortOptions(active, state) {
  let options = [], i = 0;
  for (let a of active)
    if (a.hasResult()) {
      if (a.result.filter === false) {
        let getMatch = a.result.getMatch;
        for (let option of a.result.options) {
          let match = [1e9 - i++];
          if (getMatch)
            for (let n of getMatch(option))
              match.push(n);
          options.push(new Option(option, a, match));
        }
      } else {
        let matcher = new FuzzyMatcher(state.sliceDoc(a.from, a.to)), match;
        for (let option of a.result.options)
          if (match = matcher.match(option.label)) {
            if (option.boost != null)
              match[0] += option.boost;
            options.push(new Option(option, a, match));
          }
      }
    }
  let result = [], prev = null;
  let compare2 = state.facet(completionConfig).compareCompletions;
  for (let opt of options.sort((a, b) => b.match[0] - a.match[0] || compare2(a.completion, b.completion))) {
    if (!prev || prev.label != opt.completion.label || prev.detail != opt.completion.detail || prev.type != null && opt.completion.type != null && prev.type != opt.completion.type || prev.apply != opt.completion.apply)
      result.push(opt);
    else if (score(opt.completion) > score(prev))
      result[result.length - 1] = opt;
    prev = opt.completion;
  }
  return result;
}
class CompletionDialog {
  constructor(options, attrs, tooltip, timestamp, selected, disabled) {
    this.options = options;
    this.attrs = attrs;
    this.tooltip = tooltip;
    this.timestamp = timestamp;
    this.selected = selected;
    this.disabled = disabled;
  }
  setSelected(selected, id2) {
    return selected == this.selected || selected >= this.options.length ? this : new CompletionDialog(this.options, makeAttrs(id2, selected), this.tooltip, this.timestamp, selected, this.disabled);
  }
  static build(active, state, id2, prev, conf) {
    let options = sortOptions(active, state);
    if (!options.length) {
      return prev && active.some(
        (a) => a.state == 1
        /* State.Pending */
      ) ? new CompletionDialog(prev.options, prev.attrs, prev.tooltip, prev.timestamp, prev.selected, true) : null;
    }
    let selected = state.facet(completionConfig).selectOnOpen ? 0 : -1;
    if (prev && prev.selected != selected && prev.selected != -1) {
      let selectedValue = prev.options[prev.selected].completion;
      for (let i = 0; i < options.length; i++)
        if (options[i].completion == selectedValue) {
          selected = i;
          break;
        }
    }
    return new CompletionDialog(options, makeAttrs(id2, selected), {
      pos: active.reduce((a, b) => b.hasResult() ? Math.min(a, b.from) : a, 1e8),
      create: completionTooltip(completionState),
      above: conf.aboveCursor
    }, prev ? prev.timestamp : Date.now(), selected, false);
  }
  map(changes) {
    return new CompletionDialog(this.options, this.attrs, Object.assign(Object.assign({}, this.tooltip), { pos: changes.mapPos(this.tooltip.pos) }), this.timestamp, this.selected, this.disabled);
  }
}
class CompletionState {
  constructor(active, id2, open) {
    this.active = active;
    this.id = id2;
    this.open = open;
  }
  static start() {
    return new CompletionState(none, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
  }
  update(tr) {
    let { state } = tr, conf = state.facet(completionConfig);
    let sources = conf.override || state.languageDataAt("autocomplete", cur(state)).map(asSource);
    let active = sources.map((source) => {
      let value = this.active.find((s) => s.source == source) || new ActiveSource(
        source,
        this.active.some(
          (a) => a.state != 0
          /* State.Inactive */
        ) ? 1 : 0
        /* State.Inactive */
      );
      return value.update(tr, conf);
    });
    if (active.length == this.active.length && active.every((a, i) => a == this.active[i]))
      active = this.active;
    let open = this.open;
    if (open && tr.docChanged)
      open = open.map(tr.changes);
    if (tr.selection || active.some((a) => a.hasResult() && tr.changes.touchesRange(a.from, a.to)) || !sameResults(active, this.active))
      open = CompletionDialog.build(active, state, this.id, open, conf);
    else if (open && open.disabled && !active.some(
      (a) => a.state == 1
      /* State.Pending */
    ))
      open = null;
    if (!open && active.every(
      (a) => a.state != 1
      /* State.Pending */
    ) && active.some((a) => a.hasResult()))
      active = active.map((a) => a.hasResult() ? new ActiveSource(
        a.source,
        0
        /* State.Inactive */
      ) : a);
    for (let effect of tr.effects)
      if (effect.is(setSelectedEffect))
        open = open && open.setSelected(effect.value, this.id);
    return active == this.active && open == this.open ? this : new CompletionState(active, this.id, open);
  }
  get tooltip() {
    return this.open ? this.open.tooltip : null;
  }
  get attrs() {
    return this.open ? this.open.attrs : baseAttrs;
  }
}
function sameResults(a, b) {
  if (a == b)
    return true;
  for (let iA = 0, iB = 0; ; ) {
    while (iA < a.length && !a[iA].hasResult)
      iA++;
    while (iB < b.length && !b[iB].hasResult)
      iB++;
    let endA = iA == a.length, endB = iB == b.length;
    if (endA || endB)
      return endA == endB;
    if (a[iA++].result != b[iB++].result)
      return false;
  }
}
const baseAttrs = {
  "aria-autocomplete": "list"
};
function makeAttrs(id2, selected) {
  let result = {
    "aria-autocomplete": "list",
    "aria-haspopup": "listbox",
    "aria-controls": id2
  };
  if (selected > -1)
    result["aria-activedescendant"] = id2 + "-" + selected;
  return result;
}
const none = [];
function getUserEvent(tr) {
  return tr.isUserEvent("input.type") ? "input" : tr.isUserEvent("delete.backward") ? "delete" : null;
}
class ActiveSource {
  constructor(source, state, explicitPos = -1) {
    this.source = source;
    this.state = state;
    this.explicitPos = explicitPos;
  }
  hasResult() {
    return false;
  }
  update(tr, conf) {
    let event = getUserEvent(tr), value = this;
    if (event)
      value = value.handleUserEvent(tr, event, conf);
    else if (tr.docChanged)
      value = value.handleChange(tr);
    else if (tr.selection && value.state != 0)
      value = new ActiveSource(
        value.source,
        0
        /* State.Inactive */
      );
    for (let effect of tr.effects) {
      if (effect.is(startCompletionEffect))
        value = new ActiveSource(value.source, 1, effect.value ? cur(tr.state) : -1);
      else if (effect.is(closeCompletionEffect))
        value = new ActiveSource(
          value.source,
          0
          /* State.Inactive */
        );
      else if (effect.is(setActiveEffect)) {
        for (let active of effect.value)
          if (active.source == value.source)
            value = active;
      }
    }
    return value;
  }
  handleUserEvent(tr, type, conf) {
    return type == "delete" || !conf.activateOnTyping ? this.map(tr.changes) : new ActiveSource(
      this.source,
      1
      /* State.Pending */
    );
  }
  handleChange(tr) {
    return tr.changes.touchesRange(cur(tr.startState)) ? new ActiveSource(
      this.source,
      0
      /* State.Inactive */
    ) : this.map(tr.changes);
  }
  map(changes) {
    return changes.empty || this.explicitPos < 0 ? this : new ActiveSource(this.source, this.state, changes.mapPos(this.explicitPos));
  }
}
class ActiveResult extends ActiveSource {
  constructor(source, explicitPos, result, from, to) {
    super(source, 2, explicitPos);
    this.result = result;
    this.from = from;
    this.to = to;
  }
  hasResult() {
    return true;
  }
  handleUserEvent(tr, type, conf) {
    var _a2;
    let from = tr.changes.mapPos(this.from), to = tr.changes.mapPos(this.to, 1);
    let pos = cur(tr.state);
    if ((this.explicitPos < 0 ? pos <= from : pos < this.from) || pos > to || type == "delete" && cur(tr.startState) == this.from)
      return new ActiveSource(
        this.source,
        type == "input" && conf.activateOnTyping ? 1 : 0
        /* State.Inactive */
      );
    let explicitPos = this.explicitPos < 0 ? -1 : tr.changes.mapPos(this.explicitPos), updated;
    if (checkValid(this.result.validFor, tr.state, from, to))
      return new ActiveResult(this.source, explicitPos, this.result, from, to);
    if (this.result.update && (updated = this.result.update(this.result, from, to, new CompletionContext(tr.state, pos, explicitPos >= 0))))
      return new ActiveResult(this.source, explicitPos, updated, updated.from, (_a2 = updated.to) !== null && _a2 !== void 0 ? _a2 : cur(tr.state));
    return new ActiveSource(this.source, 1, explicitPos);
  }
  handleChange(tr) {
    return tr.changes.touchesRange(this.from, this.to) ? new ActiveSource(
      this.source,
      0
      /* State.Inactive */
    ) : this.map(tr.changes);
  }
  map(mapping) {
    return mapping.empty ? this : new ActiveResult(this.source, this.explicitPos < 0 ? -1 : mapping.mapPos(this.explicitPos), this.result, mapping.mapPos(this.from), mapping.mapPos(this.to, 1));
  }
}
function checkValid(validFor, state, from, to) {
  if (!validFor)
    return false;
  let text = state.sliceDoc(from, to);
  return typeof validFor == "function" ? validFor(text, from, to, state) : ensureAnchor(validFor, true).test(text);
}
const startCompletionEffect = /* @__PURE__ */ StateEffect.define();
const closeCompletionEffect = /* @__PURE__ */ StateEffect.define();
const setActiveEffect = /* @__PURE__ */ StateEffect.define({
  map(sources, mapping) {
    return sources.map((s) => s.map(mapping));
  }
});
const setSelectedEffect = /* @__PURE__ */ StateEffect.define();
const completionState = /* @__PURE__ */ StateField.define({
  create() {
    return CompletionState.start();
  },
  update(value, tr) {
    return value.update(tr);
  },
  provide: (f) => [
    showTooltip.from(f, (val) => val.tooltip),
    EditorView.contentAttributes.from(f, (state) => state.attrs)
  ]
});
function moveCompletionSelection(forward, by = "option") {
  return (view) => {
    let cState = view.state.field(completionState, false);
    if (!cState || !cState.open || cState.open.disabled || Date.now() - cState.open.timestamp < view.state.facet(completionConfig).interactionDelay)
      return false;
    let step = 1, tooltip;
    if (by == "page" && (tooltip = getTooltip(view, cState.open.tooltip)))
      step = Math.max(2, Math.floor(tooltip.dom.offsetHeight / tooltip.dom.querySelector("li").offsetHeight) - 1);
    let { length } = cState.open.options;
    let selected = cState.open.selected > -1 ? cState.open.selected + step * (forward ? 1 : -1) : forward ? 0 : length - 1;
    if (selected < 0)
      selected = by == "page" ? 0 : length - 1;
    else if (selected >= length)
      selected = by == "page" ? length - 1 : 0;
    view.dispatch({ effects: setSelectedEffect.of(selected) });
    return true;
  };
}
const acceptCompletion = (view) => {
  let cState = view.state.field(completionState, false);
  if (view.state.readOnly || !cState || !cState.open || cState.open.selected < 0 || Date.now() - cState.open.timestamp < view.state.facet(completionConfig).interactionDelay)
    return false;
  if (!cState.open.disabled)
    applyCompletion(view, cState.open.options[cState.open.selected]);
  return true;
};
const startCompletion = (view) => {
  let cState = view.state.field(completionState, false);
  if (!cState)
    return false;
  view.dispatch({ effects: startCompletionEffect.of(true) });
  return true;
};
const closeCompletion = (view) => {
  let cState = view.state.field(completionState, false);
  if (!cState || !cState.active.some(
    (a) => a.state != 0
    /* State.Inactive */
  ))
    return false;
  view.dispatch({ effects: closeCompletionEffect.of(null) });
  return true;
};
class RunningQuery {
  constructor(active, context) {
    this.active = active;
    this.context = context;
    this.time = Date.now();
    this.updates = [];
    this.done = void 0;
  }
}
const DebounceTime = 50, MaxUpdateCount = 50, MinAbortTime = 1e3;
const completionPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.debounceUpdate = -1;
    this.running = [];
    this.debounceAccept = -1;
    this.composing = 0;
    for (let active of view.state.field(completionState).active)
      if (active.state == 1)
        this.startQuery(active);
  }
  update(update) {
    let cState = update.state.field(completionState);
    if (!update.selectionSet && !update.docChanged && update.startState.field(completionState) == cState)
      return;
    let doesReset = update.transactions.some((tr) => {
      return (tr.selection || tr.docChanged) && !getUserEvent(tr);
    });
    for (let i = 0; i < this.running.length; i++) {
      let query = this.running[i];
      if (doesReset || query.updates.length + update.transactions.length > MaxUpdateCount && Date.now() - query.time > MinAbortTime) {
        for (let handler of query.context.abortListeners) {
          try {
            handler();
          } catch (e) {
            logException(this.view.state, e);
          }
        }
        query.context.abortListeners = null;
        this.running.splice(i--, 1);
      } else {
        query.updates.push(...update.transactions);
      }
    }
    if (this.debounceUpdate > -1)
      clearTimeout(this.debounceUpdate);
    this.debounceUpdate = cState.active.some((a) => a.state == 1 && !this.running.some((q) => q.active.source == a.source)) ? setTimeout(() => this.startUpdate(), DebounceTime) : -1;
    if (this.composing != 0)
      for (let tr of update.transactions) {
        if (getUserEvent(tr) == "input")
          this.composing = 2;
        else if (this.composing == 2 && tr.selection)
          this.composing = 3;
      }
  }
  startUpdate() {
    this.debounceUpdate = -1;
    let { state } = this.view, cState = state.field(completionState);
    for (let active of cState.active) {
      if (active.state == 1 && !this.running.some((r) => r.active.source == active.source))
        this.startQuery(active);
    }
  }
  startQuery(active) {
    let { state } = this.view, pos = cur(state);
    let context = new CompletionContext(state, pos, active.explicitPos == pos);
    let pending = new RunningQuery(active, context);
    this.running.push(pending);
    Promise.resolve(active.source(context)).then((result) => {
      if (!pending.context.aborted) {
        pending.done = result || null;
        this.scheduleAccept();
      }
    }, (err) => {
      this.view.dispatch({ effects: closeCompletionEffect.of(null) });
      logException(this.view.state, err);
    });
  }
  scheduleAccept() {
    if (this.running.every((q) => q.done !== void 0))
      this.accept();
    else if (this.debounceAccept < 0)
      this.debounceAccept = setTimeout(() => this.accept(), DebounceTime);
  }
  // For each finished query in this.running, try to create a result
  // or, if appropriate, restart the query.
  accept() {
    var _a2;
    if (this.debounceAccept > -1)
      clearTimeout(this.debounceAccept);
    this.debounceAccept = -1;
    let updated = [];
    let conf = this.view.state.facet(completionConfig);
    for (let i = 0; i < this.running.length; i++) {
      let query = this.running[i];
      if (query.done === void 0)
        continue;
      this.running.splice(i--, 1);
      if (query.done) {
        let active = new ActiveResult(query.active.source, query.active.explicitPos, query.done, query.done.from, (_a2 = query.done.to) !== null && _a2 !== void 0 ? _a2 : cur(query.updates.length ? query.updates[0].startState : this.view.state));
        for (let tr of query.updates)
          active = active.update(tr, conf);
        if (active.hasResult()) {
          updated.push(active);
          continue;
        }
      }
      let current = this.view.state.field(completionState).active.find((a) => a.source == query.active.source);
      if (current && current.state == 1) {
        if (query.done == null) {
          let active = new ActiveSource(
            query.active.source,
            0
            /* State.Inactive */
          );
          for (let tr of query.updates)
            active = active.update(tr, conf);
          if (active.state != 1)
            updated.push(active);
        } else {
          this.startQuery(current);
        }
      }
    }
    if (updated.length)
      this.view.dispatch({ effects: setActiveEffect.of(updated) });
  }
}, {
  eventHandlers: {
    blur() {
      let state = this.view.state.field(completionState, false);
      if (state && state.tooltip && this.view.state.facet(completionConfig).closeOnBlur)
        this.view.dispatch({ effects: closeCompletionEffect.of(null) });
    },
    compositionstart() {
      this.composing = 1;
    },
    compositionend() {
      if (this.composing == 3) {
        setTimeout(() => this.view.dispatch({ effects: startCompletionEffect.of(false) }), 20);
      }
      this.composing = 0;
    }
  }
});
const baseTheme$1 = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      overflow: "hidden auto",
      maxWidth_fallback: "700px",
      maxWidth: "min(700px, 95vw)",
      minWidth: "250px",
      maxHeight: "10em",
      height: "100%",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li": {
        overflowX: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer",
        padding: "1px 3px",
        lineHeight: 1.2
      }
    }
  },
  "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#17c",
    color: "white"
  },
  "&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#777"
  },
  "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#347",
    color: "white"
  },
  "&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#444"
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
    content: '"···"',
    opacity: 0.5,
    display: "block",
    textAlign: "center"
  },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: `${400}px`,
    boxSizing: "border-box"
  },
  ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
  ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
  ".cm-completionInfo.cm-completionInfo-left-narrow": { right: `${30}px` },
  ".cm-completionInfo.cm-completionInfo-right-narrow": { left: `${30}px` },
  "&light .cm-snippetField": { backgroundColor: "#00000022" },
  "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
  ".cm-snippetFieldPosition": {
    verticalAlign: "text-top",
    width: 0,
    height: "1.15em",
    display: "inline-block",
    margin: "0 -0.7px -.7em",
    borderLeft: "1.4px dotted #888"
  },
  ".cm-completionMatchedText": {
    textDecoration: "underline"
  },
  ".cm-completionDetail": {
    marginLeft: "0.5em",
    fontStyle: "italic"
  },
  ".cm-completionIcon": {
    fontSize: "90%",
    width: ".8em",
    display: "inline-block",
    textAlign: "center",
    paddingRight: ".6em",
    opacity: "0.6",
    boxSizing: "content-box"
  },
  ".cm-completionIcon-function, .cm-completionIcon-method": {
    "&:after": { content: "'ƒ'" }
  },
  ".cm-completionIcon-class": {
    "&:after": { content: "'○'" }
  },
  ".cm-completionIcon-interface": {
    "&:after": { content: "'◌'" }
  },
  ".cm-completionIcon-variable": {
    "&:after": { content: "'𝑥'" }
  },
  ".cm-completionIcon-constant": {
    "&:after": { content: "'𝐶'" }
  },
  ".cm-completionIcon-type": {
    "&:after": { content: "'𝑡'" }
  },
  ".cm-completionIcon-enum": {
    "&:after": { content: "'∪'" }
  },
  ".cm-completionIcon-property": {
    "&:after": { content: "'□'" }
  },
  ".cm-completionIcon-keyword": {
    "&:after": { content: "'🔑︎'" }
    // Disable emoji rendering
  },
  ".cm-completionIcon-namespace": {
    "&:after": { content: "'▢'" }
  },
  ".cm-completionIcon-text": {
    "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
  }
});
class FieldPos {
  constructor(field, line, from, to) {
    this.field = field;
    this.line = line;
    this.from = from;
    this.to = to;
  }
}
class FieldRange {
  constructor(field, from, to) {
    this.field = field;
    this.from = from;
    this.to = to;
  }
  map(changes) {
    let from = changes.mapPos(this.from, -1, MapMode.TrackDel);
    let to = changes.mapPos(this.to, 1, MapMode.TrackDel);
    return from == null || to == null ? null : new FieldRange(this.field, from, to);
  }
}
class Snippet {
  constructor(lines, fieldPositions) {
    this.lines = lines;
    this.fieldPositions = fieldPositions;
  }
  instantiate(state, pos) {
    let text = [], lineStart = [pos];
    let lineObj = state.doc.lineAt(pos), baseIndent = /^\s*/.exec(lineObj.text)[0];
    for (let line of this.lines) {
      if (text.length) {
        let indent = baseIndent, tabs = /^\t*/.exec(line)[0].length;
        for (let i = 0; i < tabs; i++)
          indent += state.facet(indentUnit);
        lineStart.push(pos + indent.length - tabs);
        line = indent + line.slice(tabs);
      }
      text.push(line);
      pos += line.length + 1;
    }
    let ranges = this.fieldPositions.map((pos2) => new FieldRange(pos2.field, lineStart[pos2.line] + pos2.from, lineStart[pos2.line] + pos2.to));
    return { text, ranges };
  }
  static parse(template) {
    let fields = [];
    let lines = [], positions = [], m;
    for (let line of template.split(/\r\n?|\n/)) {
      while (m = /[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(line)) {
        let seq = m[1] ? +m[1] : null, name2 = m[2] || m[3] || "", found = -1;
        for (let i = 0; i < fields.length; i++) {
          if (seq != null ? fields[i].seq == seq : name2 ? fields[i].name == name2 : false)
            found = i;
        }
        if (found < 0) {
          let i = 0;
          while (i < fields.length && (seq == null || fields[i].seq != null && fields[i].seq < seq))
            i++;
          fields.splice(i, 0, { seq, name: name2 });
          found = i;
          for (let pos of positions)
            if (pos.field >= found)
              pos.field++;
        }
        positions.push(new FieldPos(found, lines.length, m.index, m.index + name2.length));
        line = line.slice(0, m.index) + name2 + line.slice(m.index + m[0].length);
      }
      for (let esc; esc = /\\([{}])/.exec(line); ) {
        line = line.slice(0, esc.index) + esc[1] + line.slice(esc.index + esc[0].length);
        for (let pos of positions)
          if (pos.line == lines.length && pos.from > esc.index) {
            pos.from--;
            pos.to--;
          }
      }
      lines.push(line);
    }
    return new Snippet(lines, positions);
  }
}
let fieldMarker = /* @__PURE__ */ Decoration.widget({ widget: /* @__PURE__ */ new class extends WidgetType {
  toDOM() {
    let span = document.createElement("span");
    span.className = "cm-snippetFieldPosition";
    return span;
  }
  ignoreEvent() {
    return false;
  }
}() });
let fieldRange = /* @__PURE__ */ Decoration.mark({ class: "cm-snippetField" });
class ActiveSnippet {
  constructor(ranges, active) {
    this.ranges = ranges;
    this.active = active;
    this.deco = Decoration.set(ranges.map((r) => (r.from == r.to ? fieldMarker : fieldRange).range(r.from, r.to)));
  }
  map(changes) {
    let ranges = [];
    for (let r of this.ranges) {
      let mapped = r.map(changes);
      if (!mapped)
        return null;
      ranges.push(mapped);
    }
    return new ActiveSnippet(ranges, this.active);
  }
  selectionInsideField(sel) {
    return sel.ranges.every((range) => this.ranges.some((r) => r.field == this.active && r.from <= range.from && r.to >= range.to));
  }
}
const setActive = /* @__PURE__ */ StateEffect.define({
  map(value, changes) {
    return value && value.map(changes);
  }
});
const moveToField = /* @__PURE__ */ StateEffect.define();
const snippetState = /* @__PURE__ */ StateField.define({
  create() {
    return null;
  },
  update(value, tr) {
    for (let effect of tr.effects) {
      if (effect.is(setActive))
        return effect.value;
      if (effect.is(moveToField) && value)
        return new ActiveSnippet(value.ranges, effect.value);
    }
    if (value && tr.docChanged)
      value = value.map(tr.changes);
    if (value && tr.selection && !value.selectionInsideField(tr.selection))
      value = null;
    return value;
  },
  provide: (f) => EditorView.decorations.from(f, (val) => val ? val.deco : Decoration.none)
});
function fieldSelection(ranges, field) {
  return EditorSelection.create(ranges.filter((r) => r.field == field).map((r) => EditorSelection.range(r.from, r.to)));
}
function snippet(template) {
  let snippet2 = Snippet.parse(template);
  return (editor2, completion, from, to) => {
    let { text, ranges } = snippet2.instantiate(editor2.state, from);
    let spec = {
      changes: { from, to, insert: Text.of(text) },
      scrollIntoView: true,
      annotations: pickedCompletion.of(completion)
    };
    if (ranges.length)
      spec.selection = fieldSelection(ranges, 0);
    if (ranges.length > 1) {
      let active = new ActiveSnippet(ranges, 0);
      let effects = spec.effects = [setActive.of(active)];
      if (editor2.state.field(snippetState, false) === void 0)
        effects.push(StateEffect.appendConfig.of([snippetState, addSnippetKeymap, snippetPointerHandler, baseTheme$1]));
    }
    editor2.dispatch(editor2.state.update(spec));
  };
}
function moveField(dir) {
  return ({ state, dispatch }) => {
    let active = state.field(snippetState, false);
    if (!active || dir < 0 && active.active == 0)
      return false;
    let next = active.active + dir, last = dir > 0 && !active.ranges.some((r) => r.field == next + dir);
    dispatch(state.update({
      selection: fieldSelection(active.ranges, next),
      effects: setActive.of(last ? null : new ActiveSnippet(active.ranges, next))
    }));
    return true;
  };
}
const clearSnippet = ({ state, dispatch }) => {
  let active = state.field(snippetState, false);
  if (!active)
    return false;
  dispatch(state.update({ effects: setActive.of(null) }));
  return true;
};
const nextSnippetField = /* @__PURE__ */ moveField(1);
const prevSnippetField = /* @__PURE__ */ moveField(-1);
const defaultSnippetKeymap = [
  { key: "Tab", run: nextSnippetField, shift: prevSnippetField },
  { key: "Escape", run: clearSnippet }
];
const snippetKeymap = /* @__PURE__ */ Facet.define({
  combine(maps) {
    return maps.length ? maps[0] : defaultSnippetKeymap;
  }
});
const addSnippetKeymap = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ keymap.compute([snippetKeymap], (state) => state.facet(snippetKeymap)));
function snippetCompletion(template, completion) {
  return Object.assign(Object.assign({}, completion), { apply: snippet(template) });
}
const snippetPointerHandler = /* @__PURE__ */ EditorView.domEventHandlers({
  mousedown(event, view) {
    let active = view.state.field(snippetState, false), pos;
    if (!active || (pos = view.posAtCoords({ x: event.clientX, y: event.clientY })) == null)
      return false;
    let match = active.ranges.find((r) => r.from <= pos && r.to >= pos);
    if (!match || match.field == active.active)
      return false;
    view.dispatch({
      selection: fieldSelection(active.ranges, match.field),
      effects: setActive.of(active.ranges.some((r) => r.field > match.field) ? new ActiveSnippet(active.ranges, match.field) : null)
    });
    return true;
  }
});
const defaults = {
  brackets: ["(", "[", "{", "'", '"'],
  before: ")]}:;>",
  stringPrefixes: []
};
const closeBracketEffect = /* @__PURE__ */ StateEffect.define({
  map(value, mapping) {
    let mapped = mapping.mapPos(value, -1, MapMode.TrackAfter);
    return mapped == null ? void 0 : mapped;
  }
});
const skipBracketEffect = /* @__PURE__ */ StateEffect.define({
  map(value, mapping) {
    return mapping.mapPos(value);
  }
});
const closedBracket = /* @__PURE__ */ new class extends RangeValue {
}();
closedBracket.startSide = 1;
closedBracket.endSide = -1;
const bracketState = /* @__PURE__ */ StateField.define({
  create() {
    return RangeSet.empty;
  },
  update(value, tr) {
    if (tr.selection) {
      let lineStart = tr.state.doc.lineAt(tr.selection.main.head).from;
      let prevLineStart = tr.startState.doc.lineAt(tr.startState.selection.main.head).from;
      if (lineStart != tr.changes.mapPos(prevLineStart, -1))
        value = RangeSet.empty;
    }
    value = value.map(tr.changes);
    for (let effect of tr.effects) {
      if (effect.is(closeBracketEffect))
        value = value.update({ add: [closedBracket.range(effect.value, effect.value + 1)] });
      else if (effect.is(skipBracketEffect))
        value = value.update({ filter: (from) => from != effect.value });
    }
    return value;
  }
});
function closeBrackets() {
  return [inputHandler, bracketState];
}
const definedClosing = "()[]{}<>";
function closing(ch) {
  for (let i = 0; i < definedClosing.length; i += 2)
    if (definedClosing.charCodeAt(i) == ch)
      return definedClosing.charAt(i + 1);
  return fromCodePoint(ch < 128 ? ch : ch + 1);
}
function config(state, pos) {
  return state.languageDataAt("closeBrackets", pos)[0] || defaults;
}
const android$1 = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent);
const inputHandler = /* @__PURE__ */ EditorView.inputHandler.of((view, from, to, insert2) => {
  if ((android$1 ? view.composing : view.compositionStarted) || view.state.readOnly)
    return false;
  let sel = view.state.selection.main;
  if (insert2.length > 2 || insert2.length == 2 && codePointSize(codePointAt(insert2, 0)) == 1 || from != sel.from || to != sel.to)
    return false;
  let tr = insertBracket(view.state, insert2);
  if (!tr)
    return false;
  view.dispatch(tr);
  return true;
});
const deleteBracketPair = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  let conf = config(state, state.selection.main.head);
  let tokens = conf.brackets || defaults.brackets;
  let dont = null, changes = state.changeByRange((range) => {
    if (range.empty) {
      let before = prevChar(state.doc, range.head);
      for (let token of tokens) {
        if (token == before && nextChar(state.doc, range.head) == closing(codePointAt(token, 0)))
          return {
            changes: { from: range.head - token.length, to: range.head + token.length },
            range: EditorSelection.cursor(range.head - token.length)
          };
      }
    }
    return { range: dont = range };
  });
  if (!dont)
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "delete.backward" }));
  return !dont;
};
const closeBracketsKeymap = [
  { key: "Backspace", run: deleteBracketPair }
];
function insertBracket(state, bracket2) {
  let conf = config(state, state.selection.main.head);
  let tokens = conf.brackets || defaults.brackets;
  for (let tok of tokens) {
    let closed = closing(codePointAt(tok, 0));
    if (bracket2 == tok)
      return closed == tok ? handleSame(state, tok, tokens.indexOf(tok + tok + tok) > -1, conf) : handleOpen(state, tok, closed, conf.before || defaults.before);
    if (bracket2 == closed && closedBracketAt(state, state.selection.main.from))
      return handleClose(state, tok, closed);
  }
  return null;
}
function closedBracketAt(state, pos) {
  let found = false;
  state.field(bracketState).between(0, state.doc.length, (from) => {
    if (from == pos)
      found = true;
  });
  return found;
}
function nextChar(doc2, pos) {
  let next = doc2.sliceString(pos, pos + 2);
  return next.slice(0, codePointSize(codePointAt(next, 0)));
}
function prevChar(doc2, pos) {
  let prev = doc2.sliceString(pos - 2, pos);
  return codePointSize(codePointAt(prev, 0)) == prev.length ? prev : prev.slice(1);
}
function handleOpen(state, open, close, closeBefore) {
  let dont = null, changes = state.changeByRange((range) => {
    if (!range.empty)
      return {
        changes: [{ insert: open, from: range.from }, { insert: close, from: range.to }],
        effects: closeBracketEffect.of(range.to + open.length),
        range: EditorSelection.range(range.anchor + open.length, range.head + open.length)
      };
    let next = nextChar(state.doc, range.head);
    if (!next || /\s/.test(next) || closeBefore.indexOf(next) > -1)
      return {
        changes: { insert: open + close, from: range.head },
        effects: closeBracketEffect.of(range.head + open.length),
        range: EditorSelection.cursor(range.head + open.length)
      };
    return { range: dont = range };
  });
  return dont ? null : state.update(changes, {
    scrollIntoView: true,
    userEvent: "input.type"
  });
}
function handleClose(state, _open, close) {
  let dont = null, moved = state.selection.ranges.map((range) => {
    if (range.empty && nextChar(state.doc, range.head) == close)
      return EditorSelection.cursor(range.head + close.length);
    return dont = range;
  });
  return dont ? null : state.update({
    selection: EditorSelection.create(moved, state.selection.mainIndex),
    scrollIntoView: true,
    effects: state.selection.ranges.map(({ from }) => skipBracketEffect.of(from))
  });
}
function handleSame(state, token, allowTriple, config2) {
  let stringPrefixes = config2.stringPrefixes || defaults.stringPrefixes;
  let dont = null, changes = state.changeByRange((range) => {
    if (!range.empty)
      return {
        changes: [{ insert: token, from: range.from }, { insert: token, from: range.to }],
        effects: closeBracketEffect.of(range.to + token.length),
        range: EditorSelection.range(range.anchor + token.length, range.head + token.length)
      };
    let pos = range.head, next = nextChar(state.doc, pos), start;
    if (next == token) {
      if (nodeStart(state, pos)) {
        return {
          changes: { insert: token + token, from: pos },
          effects: closeBracketEffect.of(pos + token.length),
          range: EditorSelection.cursor(pos + token.length)
        };
      } else if (closedBracketAt(state, pos)) {
        let isTriple = allowTriple && state.sliceDoc(pos, pos + token.length * 3) == token + token + token;
        return {
          range: EditorSelection.cursor(pos + token.length * (isTriple ? 3 : 1)),
          effects: skipBracketEffect.of(pos)
        };
      }
    } else if (allowTriple && state.sliceDoc(pos - 2 * token.length, pos) == token + token && (start = canStartStringAt(state, pos - 2 * token.length, stringPrefixes)) > -1 && nodeStart(state, start)) {
      return {
        changes: { insert: token + token + token + token, from: pos },
        effects: closeBracketEffect.of(pos + token.length),
        range: EditorSelection.cursor(pos + token.length)
      };
    } else if (state.charCategorizer(pos)(next) != CharCategory.Word) {
      if (canStartStringAt(state, pos, stringPrefixes) > -1 && !probablyInString(state, pos, token, stringPrefixes))
        return {
          changes: { insert: token + token, from: pos },
          effects: closeBracketEffect.of(pos + token.length),
          range: EditorSelection.cursor(pos + token.length)
        };
    }
    return { range: dont = range };
  });
  return dont ? null : state.update(changes, {
    scrollIntoView: true,
    userEvent: "input.type"
  });
}
function nodeStart(state, pos) {
  let tree = syntaxTree(state).resolveInner(pos + 1);
  return tree.parent && tree.from == pos;
}
function probablyInString(state, pos, quoteToken, prefixes) {
  let node = syntaxTree(state).resolveInner(pos, -1);
  let maxPrefix = prefixes.reduce((m, p) => Math.max(m, p.length), 0);
  for (let i = 0; i < 5; i++) {
    let start = state.sliceDoc(node.from, Math.min(node.to, node.from + quoteToken.length + maxPrefix));
    let quotePos = start.indexOf(quoteToken);
    if (!quotePos || quotePos > -1 && prefixes.indexOf(start.slice(0, quotePos)) > -1) {
      let first = node.firstChild;
      while (first && first.from == node.from && first.to - first.from > quoteToken.length + quotePos) {
        if (state.sliceDoc(first.to - quoteToken.length, first.to) == quoteToken)
          return false;
        first = first.firstChild;
      }
      return true;
    }
    let parent = node.to == pos && node.parent;
    if (!parent)
      break;
    node = parent;
  }
  return false;
}
function canStartStringAt(state, pos, prefixes) {
  let charCat = state.charCategorizer(pos);
  if (charCat(state.sliceDoc(pos - 1, pos)) != CharCategory.Word)
    return pos;
  for (let prefix of prefixes) {
    let start = pos - prefix.length;
    if (state.sliceDoc(start, pos) == prefix && charCat(state.sliceDoc(start - 1, start)) != CharCategory.Word)
      return start;
  }
  return -1;
}
function autocompletion(config2 = {}) {
  return [
    completionState,
    completionConfig.of(config2),
    completionPlugin,
    completionKeymapExt,
    baseTheme$1
  ];
}
const completionKeymap = [
  { key: "Ctrl-Space", run: startCompletion },
  { key: "Escape", run: closeCompletion },
  { key: "ArrowDown", run: /* @__PURE__ */ moveCompletionSelection(true) },
  { key: "ArrowUp", run: /* @__PURE__ */ moveCompletionSelection(false) },
  { key: "PageDown", run: /* @__PURE__ */ moveCompletionSelection(true, "page") },
  { key: "PageUp", run: /* @__PURE__ */ moveCompletionSelection(false, "page") },
  { key: "Enter", run: acceptCompletion }
];
const completionKeymapExt = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ keymap.computeN([completionConfig], (state) => state.facet(completionConfig).defaultKeymap ? [completionKeymap] : []));
class SelectedDiagnostic {
  constructor(from, to, diagnostic) {
    this.from = from;
    this.to = to;
    this.diagnostic = diagnostic;
  }
}
class LintState {
  constructor(diagnostics, panel, selected) {
    this.diagnostics = diagnostics;
    this.panel = panel;
    this.selected = selected;
  }
  static init(diagnostics, panel, state) {
    let markedDiagnostics = diagnostics;
    let diagnosticFilter = state.facet(lintConfig).markerFilter;
    if (diagnosticFilter)
      markedDiagnostics = diagnosticFilter(markedDiagnostics);
    let ranges = Decoration.set(markedDiagnostics.map((d) => {
      return d.from == d.to || d.from == d.to - 1 && state.doc.lineAt(d.from).to == d.from ? Decoration.widget({
        widget: new DiagnosticWidget(d),
        diagnostic: d
      }).range(d.from) : Decoration.mark({
        attributes: { class: "cm-lintRange cm-lintRange-" + d.severity },
        diagnostic: d
      }).range(d.from, d.to);
    }), true);
    return new LintState(ranges, panel, findDiagnostic(ranges));
  }
}
function findDiagnostic(diagnostics, diagnostic = null, after = 0) {
  let found = null;
  diagnostics.between(after, 1e9, (from, to, { spec }) => {
    if (diagnostic && spec.diagnostic != diagnostic)
      return;
    found = new SelectedDiagnostic(from, to, spec.diagnostic);
    return false;
  });
  return found;
}
function hideTooltip(tr, tooltip) {
  return !!(tr.effects.some((e) => e.is(setDiagnosticsEffect)) || tr.changes.touchesRange(tooltip.pos));
}
function maybeEnableLint(state, effects) {
  return state.field(lintState, false) ? effects : effects.concat(StateEffect.appendConfig.of([
    lintState,
    EditorView.decorations.compute([lintState], (state2) => {
      let { selected, panel } = state2.field(lintState);
      return !selected || !panel || selected.from == selected.to ? Decoration.none : Decoration.set([
        activeMark.range(selected.from, selected.to)
      ]);
    }),
    hoverTooltip(lintTooltip, { hideOn: hideTooltip }),
    baseTheme
  ]));
}
function setDiagnostics(state, diagnostics) {
  return {
    effects: maybeEnableLint(state, [setDiagnosticsEffect.of(diagnostics)])
  };
}
const setDiagnosticsEffect = /* @__PURE__ */ StateEffect.define();
const togglePanel = /* @__PURE__ */ StateEffect.define();
const movePanelSelection = /* @__PURE__ */ StateEffect.define();
const lintState = /* @__PURE__ */ StateField.define({
  create() {
    return new LintState(Decoration.none, null, null);
  },
  update(value, tr) {
    if (tr.docChanged) {
      let mapped = value.diagnostics.map(tr.changes), selected = null;
      if (value.selected) {
        let selPos = tr.changes.mapPos(value.selected.from, 1);
        selected = findDiagnostic(mapped, value.selected.diagnostic, selPos) || findDiagnostic(mapped, null, selPos);
      }
      value = new LintState(mapped, value.panel, selected);
    }
    for (let effect of tr.effects) {
      if (effect.is(setDiagnosticsEffect)) {
        value = LintState.init(effect.value, value.panel, tr.state);
      } else if (effect.is(togglePanel)) {
        value = new LintState(value.diagnostics, effect.value ? LintPanel.open : null, value.selected);
      } else if (effect.is(movePanelSelection)) {
        value = new LintState(value.diagnostics, value.panel, effect.value);
      }
    }
    return value;
  },
  provide: (f) => [
    showPanel.from(f, (val) => val.panel),
    EditorView.decorations.from(f, (s) => s.diagnostics)
  ]
});
const activeMark = /* @__PURE__ */ Decoration.mark({ class: "cm-lintRange cm-lintRange-active" });
function lintTooltip(view, pos, side) {
  let { diagnostics } = view.state.field(lintState);
  let found = [], stackStart = 2e8, stackEnd = 0;
  diagnostics.between(pos - (side < 0 ? 1 : 0), pos + (side > 0 ? 1 : 0), (from, to, { spec }) => {
    if (pos >= from && pos <= to && (from == to || (pos > from || side > 0) && (pos < to || side < 0))) {
      found.push(spec.diagnostic);
      stackStart = Math.min(from, stackStart);
      stackEnd = Math.max(to, stackEnd);
    }
  });
  let diagnosticFilter = view.state.facet(lintConfig).tooltipFilter;
  if (diagnosticFilter)
    found = diagnosticFilter(found);
  if (!found.length)
    return null;
  return {
    pos: stackStart,
    end: stackEnd,
    above: view.state.doc.lineAt(stackStart).to < stackEnd,
    create() {
      return { dom: diagnosticsTooltip(view, found) };
    }
  };
}
function diagnosticsTooltip(view, diagnostics) {
  return crelt("ul", { class: "cm-tooltip-lint" }, diagnostics.map((d) => renderDiagnostic(view, d, false)));
}
const openLintPanel = (view) => {
  let field = view.state.field(lintState, false);
  if (!field || !field.panel)
    view.dispatch({ effects: maybeEnableLint(view.state, [togglePanel.of(true)]) });
  let panel = getPanel(view, LintPanel.open);
  if (panel)
    panel.dom.querySelector(".cm-panel-lint ul").focus();
  return true;
};
const closeLintPanel = (view) => {
  let field = view.state.field(lintState, false);
  if (!field || !field.panel)
    return false;
  view.dispatch({ effects: togglePanel.of(false) });
  return true;
};
const nextDiagnostic = (view) => {
  let field = view.state.field(lintState, false);
  if (!field)
    return false;
  let sel = view.state.selection.main, next = field.diagnostics.iter(sel.to + 1);
  if (!next.value) {
    next = field.diagnostics.iter(0);
    if (!next.value || next.from == sel.from && next.to == sel.to)
      return false;
  }
  view.dispatch({ selection: { anchor: next.from, head: next.to }, scrollIntoView: true });
  return true;
};
const lintKeymap = [
  { key: "Mod-Shift-m", run: openLintPanel, preventDefault: true },
  { key: "F8", run: nextDiagnostic }
];
const lintPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
  constructor(view) {
    this.view = view;
    this.timeout = -1;
    this.set = true;
    let { delay } = view.state.facet(lintConfig);
    this.lintTime = Date.now() + delay;
    this.run = this.run.bind(this);
    this.timeout = setTimeout(this.run, delay);
  }
  run() {
    let now = Date.now();
    if (now < this.lintTime - 10) {
      setTimeout(this.run, this.lintTime - now);
    } else {
      this.set = false;
      let { state } = this.view, { sources } = state.facet(lintConfig);
      Promise.all(sources.map((source) => Promise.resolve(source(this.view)))).then((annotations) => {
        let all = annotations.reduce((a, b) => a.concat(b));
        if (this.view.state.doc == state.doc)
          this.view.dispatch(setDiagnostics(this.view.state, all));
      }, (error) => {
        logException(this.view.state, error);
      });
    }
  }
  update(update) {
    let config2 = update.state.facet(lintConfig);
    if (update.docChanged || config2 != update.startState.facet(lintConfig)) {
      this.lintTime = Date.now() + config2.delay;
      if (!this.set) {
        this.set = true;
        this.timeout = setTimeout(this.run, config2.delay);
      }
    }
  }
  force() {
    if (this.set) {
      this.lintTime = Date.now();
      this.run();
    }
  }
  destroy() {
    clearTimeout(this.timeout);
  }
});
const lintConfig = /* @__PURE__ */ Facet.define({
  combine(input) {
    return Object.assign({ sources: input.map((i) => i.source) }, combineConfig(input.map((i) => i.config), {
      delay: 750,
      markerFilter: null,
      tooltipFilter: null
    }));
  },
  enables: lintPlugin
});
function assignKeys(actions) {
  let assigned = [];
  if (actions)
    actions:
      for (let { name: name2 } of actions) {
        for (let i = 0; i < name2.length; i++) {
          let ch = name2[i];
          if (/[a-zA-Z]/.test(ch) && !assigned.some((c) => c.toLowerCase() == ch.toLowerCase())) {
            assigned.push(ch);
            continue actions;
          }
        }
        assigned.push("");
      }
  return assigned;
}
function renderDiagnostic(view, diagnostic, inPanel) {
  var _a2;
  let keys2 = inPanel ? assignKeys(diagnostic.actions) : [];
  return crelt("li", { class: "cm-diagnostic cm-diagnostic-" + diagnostic.severity }, crelt("span", { class: "cm-diagnosticText" }, diagnostic.renderMessage ? diagnostic.renderMessage() : diagnostic.message), (_a2 = diagnostic.actions) === null || _a2 === void 0 ? void 0 : _a2.map((action, i) => {
    let fired = false, click = (e) => {
      e.preventDefault();
      if (fired)
        return;
      fired = true;
      let found = findDiagnostic(view.state.field(lintState).diagnostics, diagnostic);
      if (found)
        action.apply(view, found.from, found.to);
    };
    let { name: name2 } = action, keyIndex = keys2[i] ? name2.indexOf(keys2[i]) : -1;
    let nameElt = keyIndex < 0 ? name2 : [
      name2.slice(0, keyIndex),
      crelt("u", name2.slice(keyIndex, keyIndex + 1)),
      name2.slice(keyIndex + 1)
    ];
    return crelt("button", {
      type: "button",
      class: "cm-diagnosticAction",
      onclick: click,
      onmousedown: click,
      "aria-label": ` Action: ${name2}${keyIndex < 0 ? "" : ` (access key "${keys2[i]})"`}.`
    }, nameElt);
  }), diagnostic.source && crelt("div", { class: "cm-diagnosticSource" }, diagnostic.source));
}
class DiagnosticWidget extends WidgetType {
  constructor(diagnostic) {
    super();
    this.diagnostic = diagnostic;
  }
  eq(other) {
    return other.diagnostic == this.diagnostic;
  }
  toDOM() {
    return crelt("span", { class: "cm-lintPoint cm-lintPoint-" + this.diagnostic.severity });
  }
}
class PanelItem {
  constructor(view, diagnostic) {
    this.diagnostic = diagnostic;
    this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16);
    this.dom = renderDiagnostic(view, diagnostic, true);
    this.dom.id = this.id;
    this.dom.setAttribute("role", "option");
  }
}
class LintPanel {
  constructor(view) {
    this.view = view;
    this.items = [];
    let onkeydown = (event) => {
      if (event.keyCode == 27) {
        closeLintPanel(this.view);
        this.view.focus();
      } else if (event.keyCode == 38 || event.keyCode == 33) {
        this.moveSelection((this.selectedIndex - 1 + this.items.length) % this.items.length);
      } else if (event.keyCode == 40 || event.keyCode == 34) {
        this.moveSelection((this.selectedIndex + 1) % this.items.length);
      } else if (event.keyCode == 36) {
        this.moveSelection(0);
      } else if (event.keyCode == 35) {
        this.moveSelection(this.items.length - 1);
      } else if (event.keyCode == 13) {
        this.view.focus();
      } else if (event.keyCode >= 65 && event.keyCode <= 90 && this.selectedIndex >= 0) {
        let { diagnostic } = this.items[this.selectedIndex], keys2 = assignKeys(diagnostic.actions);
        for (let i = 0; i < keys2.length; i++)
          if (keys2[i].toUpperCase().charCodeAt(0) == event.keyCode) {
            let found = findDiagnostic(this.view.state.field(lintState).diagnostics, diagnostic);
            if (found)
              diagnostic.actions[i].apply(view, found.from, found.to);
          }
      } else {
        return;
      }
      event.preventDefault();
    };
    let onclick = (event) => {
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].dom.contains(event.target))
          this.moveSelection(i);
      }
    };
    this.list = crelt("ul", {
      tabIndex: 0,
      role: "listbox",
      "aria-label": this.view.state.phrase("Diagnostics"),
      onkeydown,
      onclick
    });
    this.dom = crelt("div", { class: "cm-panel-lint" }, this.list, crelt("button", {
      type: "button",
      name: "close",
      "aria-label": this.view.state.phrase("close"),
      onclick: () => closeLintPanel(this.view)
    }, "×"));
    this.update();
  }
  get selectedIndex() {
    let selected = this.view.state.field(lintState).selected;
    if (!selected)
      return -1;
    for (let i = 0; i < this.items.length; i++)
      if (this.items[i].diagnostic == selected.diagnostic)
        return i;
    return -1;
  }
  update() {
    let { diagnostics, selected } = this.view.state.field(lintState);
    let i = 0, needsSync = false, newSelectedItem = null;
    diagnostics.between(0, this.view.state.doc.length, (_start, _end, { spec }) => {
      let found = -1, item;
      for (let j = i; j < this.items.length; j++)
        if (this.items[j].diagnostic == spec.diagnostic) {
          found = j;
          break;
        }
      if (found < 0) {
        item = new PanelItem(this.view, spec.diagnostic);
        this.items.splice(i, 0, item);
        needsSync = true;
      } else {
        item = this.items[found];
        if (found > i) {
          this.items.splice(i, found - i);
          needsSync = true;
        }
      }
      if (selected && item.diagnostic == selected.diagnostic) {
        if (!item.dom.hasAttribute("aria-selected")) {
          item.dom.setAttribute("aria-selected", "true");
          newSelectedItem = item;
        }
      } else if (item.dom.hasAttribute("aria-selected")) {
        item.dom.removeAttribute("aria-selected");
      }
      i++;
    });
    while (i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0)) {
      needsSync = true;
      this.items.pop();
    }
    if (this.items.length == 0) {
      this.items.push(new PanelItem(this.view, {
        from: -1,
        to: -1,
        severity: "info",
        message: this.view.state.phrase("No diagnostics")
      }));
      needsSync = true;
    }
    if (newSelectedItem) {
      this.list.setAttribute("aria-activedescendant", newSelectedItem.id);
      this.view.requestMeasure({
        key: this,
        read: () => ({ sel: newSelectedItem.dom.getBoundingClientRect(), panel: this.list.getBoundingClientRect() }),
        write: ({ sel, panel }) => {
          if (sel.top < panel.top)
            this.list.scrollTop -= panel.top - sel.top;
          else if (sel.bottom > panel.bottom)
            this.list.scrollTop += sel.bottom - panel.bottom;
        }
      });
    } else if (this.selectedIndex < 0) {
      this.list.removeAttribute("aria-activedescendant");
    }
    if (needsSync)
      this.sync();
  }
  sync() {
    let domPos = this.list.firstChild;
    function rm2() {
      let prev = domPos;
      domPos = prev.nextSibling;
      prev.remove();
    }
    for (let item of this.items) {
      if (item.dom.parentNode == this.list) {
        while (domPos != item.dom)
          rm2();
        domPos = item.dom.nextSibling;
      } else {
        this.list.insertBefore(item.dom, domPos);
      }
    }
    while (domPos)
      rm2();
  }
  moveSelection(selectedIndex) {
    if (this.selectedIndex < 0)
      return;
    let field = this.view.state.field(lintState);
    let selection = findDiagnostic(field.diagnostics, this.items[selectedIndex].diagnostic);
    if (!selection)
      return;
    this.view.dispatch({
      selection: { anchor: selection.from, head: selection.to },
      scrollIntoView: true,
      effects: movePanelSelection.of(selection)
    });
  }
  static open(view) {
    return new LintPanel(view);
  }
}
function svg(content2, attrs = `viewBox="0 0 40 40"`) {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${encodeURIComponent(content2)}</svg>')`;
}
function underline(color) {
  return svg(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${color}" fill="none" stroke-width=".7"/>`, `width="6" height="3"`);
}
const baseTheme = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-diagnostic": {
    padding: "3px 6px 3px 8px",
    marginLeft: "-1px",
    display: "block",
    whiteSpace: "pre-wrap"
  },
  ".cm-diagnostic-error": { borderLeft: "5px solid #d11" },
  ".cm-diagnostic-warning": { borderLeft: "5px solid orange" },
  ".cm-diagnostic-info": { borderLeft: "5px solid #999" },
  ".cm-diagnosticAction": {
    font: "inherit",
    border: "none",
    padding: "2px 4px",
    backgroundColor: "#444",
    color: "white",
    borderRadius: "3px",
    marginLeft: "8px",
    cursor: "pointer"
  },
  ".cm-diagnosticSource": {
    fontSize: "70%",
    opacity: 0.7
  },
  ".cm-lintRange": {
    backgroundPosition: "left bottom",
    backgroundRepeat: "repeat-x",
    paddingBottom: "0.7px"
  },
  ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ underline("#d11") },
  ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ underline("orange") },
  ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ underline("#999") },
  ".cm-lintRange-active": { backgroundColor: "#ffdd9980" },
  ".cm-tooltip-lint": {
    padding: 0,
    margin: 0
  },
  ".cm-lintPoint": {
    position: "relative",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "-2px",
      borderLeft: "3px solid transparent",
      borderRight: "3px solid transparent",
      borderBottom: "4px solid #d11"
    }
  },
  ".cm-lintPoint-warning": {
    "&:after": { borderBottomColor: "orange" }
  },
  ".cm-lintPoint-info": {
    "&:after": { borderBottomColor: "#999" }
  },
  ".cm-panel.cm-panel-lint": {
    position: "relative",
    "& ul": {
      maxHeight: "100px",
      overflowY: "auto",
      "& [aria-selected]": {
        backgroundColor: "#ddd",
        "& u": { textDecoration: "underline" }
      },
      "&:focus [aria-selected]": {
        background_fallback: "#bdf",
        backgroundColor: "Highlight",
        color_fallback: "white",
        color: "HighlightText"
      },
      "& u": { textDecoration: "none" },
      padding: 0,
      margin: 0
    },
    "& [name=close]": {
      position: "absolute",
      top: "0",
      right: "2px",
      background: "inherit",
      border: "none",
      font: "inherit",
      padding: 0,
      margin: 0
    }
  }
});
const basicSetup = /* @__PURE__ */ (() => [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap
  ])
])();
class Stack {
  /// @internal
  constructor(p, stack, state, reducePos, pos, score2, buffer, bufferBase, curContext, lookAhead = 0, parent) {
    this.p = p;
    this.stack = stack;
    this.state = state;
    this.reducePos = reducePos;
    this.pos = pos;
    this.score = score2;
    this.buffer = buffer;
    this.bufferBase = bufferBase;
    this.curContext = curContext;
    this.lookAhead = lookAhead;
    this.parent = parent;
  }
  /// @internal
  toString() {
    return `[${this.stack.filter((_, i) => i % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
  }
  // Start an empty stack
  /// @internal
  static start(p, state, pos = 0) {
    let cx = p.parser.context;
    return new Stack(p, [], state, pos, pos, 0, [], 0, cx ? new StackContext(cx, cx.start) : null, 0, null);
  }
  /// The stack's current [context](#lr.ContextTracker) value, if
  /// any. Its type will depend on the context tracker's type
  /// parameter, or it will be `null` if there is no context
  /// tracker.
  get context() {
    return this.curContext ? this.curContext.context : null;
  }
  // Push a state onto the stack, tracking its start position as well
  // as the buffer base at that point.
  /// @internal
  pushState(state, start) {
    this.stack.push(this.state, start, this.bufferBase + this.buffer.length);
    this.state = state;
  }
  // Apply a reduce action
  /// @internal
  reduce(action) {
    var _a2;
    let depth = action >> 19, type = action & 65535;
    let { parser: parser2 } = this.p;
    let dPrec = parser2.dynamicPrecedence(type);
    if (dPrec)
      this.score += dPrec;
    if (depth == 0) {
      this.pushState(parser2.getGoto(this.state, type, true), this.reducePos);
      if (type < parser2.minRepeatTerm)
        this.storeNode(type, this.reducePos, this.reducePos, 4, true);
      this.reduceContext(type, this.reducePos);
      return;
    }
    let base2 = this.stack.length - (depth - 1) * 3 - (action & 262144 ? 6 : 0);
    let start = base2 ? this.stack[base2 - 2] : this.p.ranges[0].from, size = this.reducePos - start;
    if (size >= 2e3 && !((_a2 = this.p.parser.nodeSet.types[type]) === null || _a2 === void 0 ? void 0 : _a2.isAnonymous)) {
      if (start == this.p.lastBigReductionStart) {
        this.p.bigReductionCount++;
        this.p.lastBigReductionSize = size;
      } else if (this.p.lastBigReductionSize < size) {
        this.p.bigReductionCount = 1;
        this.p.lastBigReductionStart = start;
        this.p.lastBigReductionSize = size;
      }
    }
    let bufferBase = base2 ? this.stack[base2 - 1] : 0, count = this.bufferBase + this.buffer.length - bufferBase;
    if (type < parser2.minRepeatTerm || action & 131072) {
      let pos = parser2.stateFlag(
        this.state,
        1
        /* StateFlag.Skipped */
      ) ? this.pos : this.reducePos;
      this.storeNode(type, start, pos, count + 4, true);
    }
    if (action & 262144) {
      this.state = this.stack[base2];
    } else {
      let baseStateID = this.stack[base2 - 3];
      this.state = parser2.getGoto(baseStateID, type, true);
    }
    while (this.stack.length > base2)
      this.stack.pop();
    this.reduceContext(type, start);
  }
  // Shift a value into the buffer
  /// @internal
  storeNode(term, start, end, size = 4, isReduce = false) {
    if (term == 0 && (!this.stack.length || this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)) {
      let cur2 = this, top2 = this.buffer.length;
      if (top2 == 0 && cur2.parent) {
        top2 = cur2.bufferBase - cur2.parent.bufferBase;
        cur2 = cur2.parent;
      }
      if (top2 > 0 && cur2.buffer[top2 - 4] == 0 && cur2.buffer[top2 - 1] > -1) {
        if (start == end)
          return;
        if (cur2.buffer[top2 - 2] >= start) {
          cur2.buffer[top2 - 2] = end;
          return;
        }
      }
    }
    if (!isReduce || this.pos == end) {
      this.buffer.push(term, start, end, size);
    } else {
      let index = this.buffer.length;
      if (index > 0 && this.buffer[index - 4] != 0)
        while (index > 0 && this.buffer[index - 2] > end) {
          this.buffer[index] = this.buffer[index - 4];
          this.buffer[index + 1] = this.buffer[index - 3];
          this.buffer[index + 2] = this.buffer[index - 2];
          this.buffer[index + 3] = this.buffer[index - 1];
          index -= 4;
          if (size > 4)
            size -= 4;
        }
      this.buffer[index] = term;
      this.buffer[index + 1] = start;
      this.buffer[index + 2] = end;
      this.buffer[index + 3] = size;
    }
  }
  // Apply a shift action
  /// @internal
  shift(action, next, nextEnd) {
    let start = this.pos;
    if (action & 131072) {
      this.pushState(action & 65535, this.pos);
    } else if ((action & 262144) == 0) {
      let nextState = action, { parser: parser2 } = this.p;
      if (nextEnd > this.pos || next <= parser2.maxNode) {
        this.pos = nextEnd;
        if (!parser2.stateFlag(
          nextState,
          1
          /* StateFlag.Skipped */
        ))
          this.reducePos = nextEnd;
      }
      this.pushState(nextState, start);
      this.shiftContext(next, start);
      if (next <= parser2.maxNode)
        this.buffer.push(next, start, nextEnd, 4);
    } else {
      this.pos = nextEnd;
      this.shiftContext(next, start);
      if (next <= this.p.parser.maxNode)
        this.buffer.push(next, start, nextEnd, 4);
    }
  }
  // Apply an action
  /// @internal
  apply(action, next, nextEnd) {
    if (action & 65536)
      this.reduce(action);
    else
      this.shift(action, next, nextEnd);
  }
  // Add a prebuilt (reused) node into the buffer.
  /// @internal
  useNode(value, next) {
    let index = this.p.reused.length - 1;
    if (index < 0 || this.p.reused[index] != value) {
      this.p.reused.push(value);
      index++;
    }
    let start = this.pos;
    this.reducePos = this.pos = start + value.length;
    this.pushState(next, start);
    this.buffer.push(
      index,
      start,
      this.reducePos,
      -1
      /* size == -1 means this is a reused value */
    );
    if (this.curContext)
      this.updateContext(this.curContext.tracker.reuse(this.curContext.context, value, this, this.p.stream.reset(this.pos - value.length)));
  }
  // Split the stack. Due to the buffer sharing and the fact
  // that `this.stack` tends to stay quite shallow, this isn't very
  // expensive.
  /// @internal
  split() {
    let parent = this;
    let off = parent.buffer.length;
    while (off > 0 && parent.buffer[off - 2] > parent.reducePos)
      off -= 4;
    let buffer = parent.buffer.slice(off), base2 = parent.bufferBase + off;
    while (parent && base2 == parent.bufferBase)
      parent = parent.parent;
    return new Stack(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, buffer, base2, this.curContext, this.lookAhead, parent);
  }
  // Try to recover from an error by 'deleting' (ignoring) one token.
  /// @internal
  recoverByDelete(next, nextEnd) {
    let isNode = next <= this.p.parser.maxNode;
    if (isNode)
      this.storeNode(next, this.pos, nextEnd, 4);
    this.storeNode(0, this.pos, nextEnd, isNode ? 8 : 4);
    this.pos = this.reducePos = nextEnd;
    this.score -= 190;
  }
  /// Check if the given term would be able to be shifted (optionally
  /// after some reductions) on this stack. This can be useful for
  /// external tokenizers that want to make sure they only provide a
  /// given token when it applies.
  canShift(term) {
    for (let sim = new SimulatedStack(this); ; ) {
      let action = this.p.parser.stateSlot(
        sim.state,
        4
        /* ParseState.DefaultReduce */
      ) || this.p.parser.hasAction(sim.state, term);
      if (action == 0)
        return false;
      if ((action & 65536) == 0)
        return true;
      sim.reduce(action);
    }
  }
  // Apply up to Recover.MaxNext recovery actions that conceptually
  // inserts some missing token or rule.
  /// @internal
  recoverByInsert(next) {
    if (this.stack.length >= 300)
      return [];
    let nextStates = this.p.parser.nextStates(this.state);
    if (nextStates.length > 4 << 1 || this.stack.length >= 120) {
      let best = [];
      for (let i = 0, s; i < nextStates.length; i += 2) {
        if ((s = nextStates[i + 1]) != this.state && this.p.parser.hasAction(s, next))
          best.push(nextStates[i], s);
      }
      if (this.stack.length < 120)
        for (let i = 0; best.length < 4 << 1 && i < nextStates.length; i += 2) {
          let s = nextStates[i + 1];
          if (!best.some((v, i2) => i2 & 1 && v == s))
            best.push(nextStates[i], s);
        }
      nextStates = best;
    }
    let result = [];
    for (let i = 0; i < nextStates.length && result.length < 4; i += 2) {
      let s = nextStates[i + 1];
      if (s == this.state)
        continue;
      let stack = this.split();
      stack.pushState(s, this.pos);
      stack.storeNode(0, stack.pos, stack.pos, 4, true);
      stack.shiftContext(nextStates[i], this.pos);
      stack.score -= 200;
      result.push(stack);
    }
    return result;
  }
  // Force a reduce, if possible. Return false if that can't
  // be done.
  /// @internal
  forceReduce() {
    let reduce = this.p.parser.stateSlot(
      this.state,
      5
      /* ParseState.ForcedReduce */
    );
    if ((reduce & 65536) == 0)
      return false;
    let { parser: parser2 } = this.p;
    if (!parser2.validAction(this.state, reduce)) {
      let depth = reduce >> 19, term = reduce & 65535;
      let target = this.stack.length - depth * 3;
      if (target < 0 || parser2.getGoto(this.stack[target], term, false) < 0)
        return false;
      this.storeNode(0, this.reducePos, this.reducePos, 4, true);
      this.score -= 100;
    }
    this.reducePos = this.pos;
    this.reduce(reduce);
    return true;
  }
  /// @internal
  forceAll() {
    while (!this.p.parser.stateFlag(
      this.state,
      2
      /* StateFlag.Accepting */
    )) {
      if (!this.forceReduce()) {
        this.storeNode(0, this.pos, this.pos, 4, true);
        break;
      }
    }
    return this;
  }
  /// Check whether this state has no further actions (assumed to be a direct descendant of the
  /// top state, since any other states must be able to continue
  /// somehow). @internal
  get deadEnd() {
    if (this.stack.length != 3)
      return false;
    let { parser: parser2 } = this.p;
    return parser2.data[parser2.stateSlot(
      this.state,
      1
      /* ParseState.Actions */
    )] == 65535 && !parser2.stateSlot(
      this.state,
      4
      /* ParseState.DefaultReduce */
    );
  }
  /// Restart the stack (put it back in its start state). Only safe
  /// when this.stack.length == 3 (state is directly below the top
  /// state). @internal
  restart() {
    this.state = this.stack[0];
    this.stack.length = 0;
  }
  /// @internal
  sameState(other) {
    if (this.state != other.state || this.stack.length != other.stack.length)
      return false;
    for (let i = 0; i < this.stack.length; i += 3)
      if (this.stack[i] != other.stack[i])
        return false;
    return true;
  }
  /// Get the parser used by this stack.
  get parser() {
    return this.p.parser;
  }
  /// Test whether a given dialect (by numeric ID, as exported from
  /// the terms file) is enabled.
  dialectEnabled(dialectID) {
    return this.p.parser.dialect.flags[dialectID];
  }
  shiftContext(term, start) {
    if (this.curContext)
      this.updateContext(this.curContext.tracker.shift(this.curContext.context, term, this, this.p.stream.reset(start)));
  }
  reduceContext(term, start) {
    if (this.curContext)
      this.updateContext(this.curContext.tracker.reduce(this.curContext.context, term, this, this.p.stream.reset(start)));
  }
  /// @internal
  emitContext() {
    let last = this.buffer.length - 1;
    if (last < 0 || this.buffer[last] != -3)
      this.buffer.push(this.curContext.hash, this.reducePos, this.reducePos, -3);
  }
  /// @internal
  emitLookAhead() {
    let last = this.buffer.length - 1;
    if (last < 0 || this.buffer[last] != -4)
      this.buffer.push(this.lookAhead, this.reducePos, this.reducePos, -4);
  }
  updateContext(context) {
    if (context != this.curContext.context) {
      let newCx = new StackContext(this.curContext.tracker, context);
      if (newCx.hash != this.curContext.hash)
        this.emitContext();
      this.curContext = newCx;
    }
  }
  /// @internal
  setLookAhead(lookAhead) {
    if (lookAhead > this.lookAhead) {
      this.emitLookAhead();
      this.lookAhead = lookAhead;
    }
  }
  /// @internal
  close() {
    if (this.curContext && this.curContext.tracker.strict)
      this.emitContext();
    if (this.lookAhead > 0)
      this.emitLookAhead();
  }
}
class StackContext {
  constructor(tracker, context) {
    this.tracker = tracker;
    this.context = context;
    this.hash = tracker.strict ? tracker.hash(context) : 0;
  }
}
var Recover;
(function(Recover2) {
  Recover2[Recover2["Insert"] = 200] = "Insert";
  Recover2[Recover2["Delete"] = 190] = "Delete";
  Recover2[Recover2["Reduce"] = 100] = "Reduce";
  Recover2[Recover2["MaxNext"] = 4] = "MaxNext";
  Recover2[Recover2["MaxInsertStackDepth"] = 300] = "MaxInsertStackDepth";
  Recover2[Recover2["DampenInsertStackDepth"] = 120] = "DampenInsertStackDepth";
  Recover2[Recover2["MinBigReduction"] = 2e3] = "MinBigReduction";
})(Recover || (Recover = {}));
class SimulatedStack {
  constructor(start) {
    this.start = start;
    this.state = start.state;
    this.stack = start.stack;
    this.base = this.stack.length;
  }
  reduce(action) {
    let term = action & 65535, depth = action >> 19;
    if (depth == 0) {
      if (this.stack == this.start.stack)
        this.stack = this.stack.slice();
      this.stack.push(this.state, 0, 0);
      this.base += 3;
    } else {
      this.base -= (depth - 1) * 3;
    }
    let goto = this.start.p.parser.getGoto(this.stack[this.base - 3], term, true);
    this.state = goto;
  }
}
class StackBufferCursor {
  constructor(stack, pos, index) {
    this.stack = stack;
    this.pos = pos;
    this.index = index;
    this.buffer = stack.buffer;
    if (this.index == 0)
      this.maybeNext();
  }
  static create(stack, pos = stack.bufferBase + stack.buffer.length) {
    return new StackBufferCursor(stack, pos, pos - stack.bufferBase);
  }
  maybeNext() {
    let next = this.stack.parent;
    if (next != null) {
      this.index = this.stack.bufferBase - next.bufferBase;
      this.stack = next;
      this.buffer = next.buffer;
    }
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  next() {
    this.index -= 4;
    this.pos -= 4;
    if (this.index == 0)
      this.maybeNext();
  }
  fork() {
    return new StackBufferCursor(this.stack, this.pos, this.index);
  }
}
function decodeArray(input, Type = Uint16Array) {
  if (typeof input != "string")
    return input;
  let array = null;
  for (let pos = 0, out = 0; pos < input.length; ) {
    let value = 0;
    for (; ; ) {
      let next = input.charCodeAt(pos++), stop = false;
      if (next == 126) {
        value = 65535;
        break;
      }
      if (next >= 92)
        next--;
      if (next >= 34)
        next--;
      let digit = next - 32;
      if (digit >= 46) {
        digit -= 46;
        stop = true;
      }
      value += digit;
      if (stop)
        break;
      value *= 46;
    }
    if (array)
      array[out++] = value;
    else
      array = new Type(value);
  }
  return array;
}
class CachedToken {
  constructor() {
    this.start = -1;
    this.value = -1;
    this.end = -1;
    this.extended = -1;
    this.lookAhead = 0;
    this.mask = 0;
    this.context = 0;
  }
}
const nullToken = new CachedToken();
class InputStream {
  /// @internal
  constructor(input, ranges) {
    this.input = input;
    this.ranges = ranges;
    this.chunk = "";
    this.chunkOff = 0;
    this.chunk2 = "";
    this.chunk2Pos = 0;
    this.next = -1;
    this.token = nullToken;
    this.rangeIndex = 0;
    this.pos = this.chunkPos = ranges[0].from;
    this.range = ranges[0];
    this.end = ranges[ranges.length - 1].to;
    this.readNext();
  }
  /// @internal
  resolveOffset(offset, assoc) {
    let range = this.range, index = this.rangeIndex;
    let pos = this.pos + offset;
    while (pos < range.from) {
      if (!index)
        return null;
      let next = this.ranges[--index];
      pos -= range.from - next.to;
      range = next;
    }
    while (assoc < 0 ? pos > range.to : pos >= range.to) {
      if (index == this.ranges.length - 1)
        return null;
      let next = this.ranges[++index];
      pos += next.from - range.to;
      range = next;
    }
    return pos;
  }
  /// @internal
  clipPos(pos) {
    if (pos >= this.range.from && pos < this.range.to)
      return pos;
    for (let range of this.ranges)
      if (range.to > pos)
        return Math.max(pos, range.from);
    return this.end;
  }
  /// Look at a code unit near the stream position. `.peek(0)` equals
  /// `.next`, `.peek(-1)` gives you the previous character, and so
  /// on.
  ///
  /// Note that looking around during tokenizing creates dependencies
  /// on potentially far-away content, which may reduce the
  /// effectiveness incremental parsing—when looking forward—or even
  /// cause invalid reparses when looking backward more than 25 code
  /// units, since the library does not track lookbehind.
  peek(offset) {
    let idx = this.chunkOff + offset, pos, result;
    if (idx >= 0 && idx < this.chunk.length) {
      pos = this.pos + offset;
      result = this.chunk.charCodeAt(idx);
    } else {
      let resolved = this.resolveOffset(offset, 1);
      if (resolved == null)
        return -1;
      pos = resolved;
      if (pos >= this.chunk2Pos && pos < this.chunk2Pos + this.chunk2.length) {
        result = this.chunk2.charCodeAt(pos - this.chunk2Pos);
      } else {
        let i = this.rangeIndex, range = this.range;
        while (range.to <= pos)
          range = this.ranges[++i];
        this.chunk2 = this.input.chunk(this.chunk2Pos = pos);
        if (pos + this.chunk2.length > range.to)
          this.chunk2 = this.chunk2.slice(0, range.to - pos);
        result = this.chunk2.charCodeAt(0);
      }
    }
    if (pos >= this.token.lookAhead)
      this.token.lookAhead = pos + 1;
    return result;
  }
  /// Accept a token. By default, the end of the token is set to the
  /// current stream position, but you can pass an offset (relative to
  /// the stream position) to change that.
  acceptToken(token, endOffset = 0) {
    let end = endOffset ? this.resolveOffset(endOffset, -1) : this.pos;
    if (end == null || end < this.token.start)
      throw new RangeError("Token end out of bounds");
    this.token.value = token;
    this.token.end = end;
  }
  getChunk() {
    if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
      let { chunk, chunkPos } = this;
      this.chunk = this.chunk2;
      this.chunkPos = this.chunk2Pos;
      this.chunk2 = chunk;
      this.chunk2Pos = chunkPos;
      this.chunkOff = this.pos - this.chunkPos;
    } else {
      this.chunk2 = this.chunk;
      this.chunk2Pos = this.chunkPos;
      let nextChunk = this.input.chunk(this.pos);
      let end = this.pos + nextChunk.length;
      this.chunk = end > this.range.to ? nextChunk.slice(0, this.range.to - this.pos) : nextChunk;
      this.chunkPos = this.pos;
      this.chunkOff = 0;
    }
  }
  readNext() {
    if (this.chunkOff >= this.chunk.length) {
      this.getChunk();
      if (this.chunkOff == this.chunk.length)
        return this.next = -1;
    }
    return this.next = this.chunk.charCodeAt(this.chunkOff);
  }
  /// Move the stream forward N (defaults to 1) code units. Returns
  /// the new value of [`next`](#lr.InputStream.next).
  advance(n = 1) {
    this.chunkOff += n;
    while (this.pos + n >= this.range.to) {
      if (this.rangeIndex == this.ranges.length - 1)
        return this.setDone();
      n -= this.range.to - this.pos;
      this.range = this.ranges[++this.rangeIndex];
      this.pos = this.range.from;
    }
    this.pos += n;
    if (this.pos >= this.token.lookAhead)
      this.token.lookAhead = this.pos + 1;
    return this.readNext();
  }
  setDone() {
    this.pos = this.chunkPos = this.end;
    this.range = this.ranges[this.rangeIndex = this.ranges.length - 1];
    this.chunk = "";
    return this.next = -1;
  }
  /// @internal
  reset(pos, token) {
    if (token) {
      this.token = token;
      token.start = pos;
      token.lookAhead = pos + 1;
      token.value = token.extended = -1;
    } else {
      this.token = nullToken;
    }
    if (this.pos != pos) {
      this.pos = pos;
      if (pos == this.end) {
        this.setDone();
        return this;
      }
      while (pos < this.range.from)
        this.range = this.ranges[--this.rangeIndex];
      while (pos >= this.range.to)
        this.range = this.ranges[++this.rangeIndex];
      if (pos >= this.chunkPos && pos < this.chunkPos + this.chunk.length) {
        this.chunkOff = pos - this.chunkPos;
      } else {
        this.chunk = "";
        this.chunkOff = 0;
      }
      this.readNext();
    }
    return this;
  }
  /// @internal
  read(from, to) {
    if (from >= this.chunkPos && to <= this.chunkPos + this.chunk.length)
      return this.chunk.slice(from - this.chunkPos, to - this.chunkPos);
    if (from >= this.chunk2Pos && to <= this.chunk2Pos + this.chunk2.length)
      return this.chunk2.slice(from - this.chunk2Pos, to - this.chunk2Pos);
    if (from >= this.range.from && to <= this.range.to)
      return this.input.read(from, to);
    let result = "";
    for (let r of this.ranges) {
      if (r.from >= to)
        break;
      if (r.to > from)
        result += this.input.read(Math.max(r.from, from), Math.min(r.to, to));
    }
    return result;
  }
}
class TokenGroup {
  constructor(data, id2) {
    this.data = data;
    this.id = id2;
  }
  token(input, stack) {
    let { parser: parser2 } = stack.p;
    readToken(this.data, input, stack, this.id, parser2.data, parser2.tokenPrecTable);
  }
}
TokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
class LocalTokenGroup {
  constructor(data, precTable, elseToken) {
    this.precTable = precTable;
    this.elseToken = elseToken;
    this.data = typeof data == "string" ? decodeArray(data) : data;
  }
  token(input, stack) {
    let start = input.pos, cur2;
    for (; ; ) {
      cur2 = input.pos;
      readToken(this.data, input, stack, 0, this.data, this.precTable);
      if (input.token.value > -1)
        break;
      if (this.elseToken == null)
        return;
      if (input.next < 0)
        break;
      input.advance();
      input.reset(cur2 + 1, input.token);
    }
    if (cur2 > start) {
      input.reset(start, input.token);
      input.acceptToken(this.elseToken, cur2 - start);
    }
  }
}
LocalTokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
class ExternalTokenizer {
  /// Create a tokenizer. The first argument is the function that,
  /// given an input stream, scans for the types of tokens it
  /// recognizes at the stream's position, and calls
  /// [`acceptToken`](#lr.InputStream.acceptToken) when it finds
  /// one.
  constructor(token, options = {}) {
    this.token = token;
    this.contextual = !!options.contextual;
    this.fallback = !!options.fallback;
    this.extend = !!options.extend;
  }
}
function readToken(data, input, stack, group, precTable, precOffset) {
  let state = 0, groupMask = 1 << group, { dialect } = stack.p.parser;
  scan:
    for (; ; ) {
      if ((groupMask & data[state]) == 0)
        break;
      let accEnd = data[state + 1];
      for (let i = state + 3; i < accEnd; i += 2)
        if ((data[i + 1] & groupMask) > 0) {
          let term = data[i];
          if (dialect.allows(term) && (input.token.value == -1 || input.token.value == term || overrides(term, input.token.value, precTable, precOffset))) {
            input.acceptToken(term);
            break;
          }
        }
      let next = input.next, low = 0, high = data[state + 2];
      if (input.next < 0 && high > low && data[accEnd + high * 3 - 3] == 65535 && data[accEnd + high * 3 - 3] == 65535) {
        state = data[accEnd + high * 3 - 1];
        continue scan;
      }
      for (; low < high; ) {
        let mid = low + high >> 1;
        let index = accEnd + mid + (mid << 1);
        let from = data[index], to = data[index + 1] || 65536;
        if (next < from)
          high = mid;
        else if (next >= to)
          low = mid + 1;
        else {
          state = data[index + 2];
          input.advance();
          continue scan;
        }
      }
      break;
    }
}
function findOffset(data, start, term) {
  for (let i = start, next; (next = data[i]) != 65535; i++)
    if (next == term)
      return i - start;
  return -1;
}
function overrides(token, prev, tableData, tableOffset) {
  let iPrev = findOffset(tableData, tableOffset, prev);
  return iPrev < 0 || findOffset(tableData, tableOffset, token) < iPrev;
}
const verbose = typeof process != "undefined" && process.env && /\bparse\b/.test({}.LOG);
let stackIDs = null;
var Safety;
(function(Safety2) {
  Safety2[Safety2["Margin"] = 25] = "Margin";
})(Safety || (Safety = {}));
function cutAt(tree, pos, side) {
  let cursor = tree.cursor(IterMode.IncludeAnonymous);
  cursor.moveTo(pos);
  for (; ; ) {
    if (!(side < 0 ? cursor.childBefore(pos) : cursor.childAfter(pos)))
      for (; ; ) {
        if ((side < 0 ? cursor.to < pos : cursor.from > pos) && !cursor.type.isError)
          return side < 0 ? Math.max(0, Math.min(
            cursor.to - 1,
            pos - 25
            /* Safety.Margin */
          )) : Math.min(tree.length, Math.max(
            cursor.from + 1,
            pos + 25
            /* Safety.Margin */
          ));
        if (side < 0 ? cursor.prevSibling() : cursor.nextSibling())
          break;
        if (!cursor.parent())
          return side < 0 ? 0 : tree.length;
      }
  }
}
class FragmentCursor {
  constructor(fragments, nodeSet) {
    this.fragments = fragments;
    this.nodeSet = nodeSet;
    this.i = 0;
    this.fragment = null;
    this.safeFrom = -1;
    this.safeTo = -1;
    this.trees = [];
    this.start = [];
    this.index = [];
    this.nextFragment();
  }
  nextFragment() {
    let fr = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
    if (fr) {
      this.safeFrom = fr.openStart ? cutAt(fr.tree, fr.from + fr.offset, 1) - fr.offset : fr.from;
      this.safeTo = fr.openEnd ? cutAt(fr.tree, fr.to + fr.offset, -1) - fr.offset : fr.to;
      while (this.trees.length) {
        this.trees.pop();
        this.start.pop();
        this.index.pop();
      }
      this.trees.push(fr.tree);
      this.start.push(-fr.offset);
      this.index.push(0);
      this.nextStart = this.safeFrom;
    } else {
      this.nextStart = 1e9;
    }
  }
  // `pos` must be >= any previously given `pos` for this cursor
  nodeAt(pos) {
    if (pos < this.nextStart)
      return null;
    while (this.fragment && this.safeTo <= pos)
      this.nextFragment();
    if (!this.fragment)
      return null;
    for (; ; ) {
      let last = this.trees.length - 1;
      if (last < 0) {
        this.nextFragment();
        return null;
      }
      let top2 = this.trees[last], index = this.index[last];
      if (index == top2.children.length) {
        this.trees.pop();
        this.start.pop();
        this.index.pop();
        continue;
      }
      let next = top2.children[index];
      let start = this.start[last] + top2.positions[index];
      if (start > pos) {
        this.nextStart = start;
        return null;
      }
      if (next instanceof Tree) {
        if (start == pos) {
          if (start < this.safeFrom)
            return null;
          let end = start + next.length;
          if (end <= this.safeTo) {
            let lookAhead = next.prop(NodeProp.lookAhead);
            if (!lookAhead || end + lookAhead < this.fragment.to)
              return next;
          }
        }
        this.index[last]++;
        if (start + next.length >= Math.max(this.safeFrom, pos)) {
          this.trees.push(next);
          this.start.push(start);
          this.index.push(0);
        }
      } else {
        this.index[last]++;
        this.nextStart = start + next.length;
      }
    }
  }
}
class TokenCache {
  constructor(parser2, stream) {
    this.stream = stream;
    this.tokens = [];
    this.mainToken = null;
    this.actions = [];
    this.tokens = parser2.tokenizers.map((_) => new CachedToken());
  }
  getActions(stack) {
    let actionIndex = 0;
    let main = null;
    let { parser: parser2 } = stack.p, { tokenizers } = parser2;
    let mask = parser2.stateSlot(
      stack.state,
      3
      /* ParseState.TokenizerMask */
    );
    let context = stack.curContext ? stack.curContext.hash : 0;
    let lookAhead = 0;
    for (let i = 0; i < tokenizers.length; i++) {
      if ((1 << i & mask) == 0)
        continue;
      let tokenizer = tokenizers[i], token = this.tokens[i];
      if (main && !tokenizer.fallback)
        continue;
      if (tokenizer.contextual || token.start != stack.pos || token.mask != mask || token.context != context) {
        this.updateCachedToken(token, tokenizer, stack);
        token.mask = mask;
        token.context = context;
      }
      if (token.lookAhead > token.end + 25)
        lookAhead = Math.max(token.lookAhead, lookAhead);
      if (token.value != 0) {
        let startIndex = actionIndex;
        if (token.extended > -1)
          actionIndex = this.addActions(stack, token.extended, token.end, actionIndex);
        actionIndex = this.addActions(stack, token.value, token.end, actionIndex);
        if (!tokenizer.extend) {
          main = token;
          if (actionIndex > startIndex)
            break;
        }
      }
    }
    while (this.actions.length > actionIndex)
      this.actions.pop();
    if (lookAhead)
      stack.setLookAhead(lookAhead);
    if (!main && stack.pos == this.stream.end) {
      main = new CachedToken();
      main.value = stack.p.parser.eofTerm;
      main.start = main.end = stack.pos;
      actionIndex = this.addActions(stack, main.value, main.end, actionIndex);
    }
    this.mainToken = main;
    return this.actions;
  }
  getMainToken(stack) {
    if (this.mainToken)
      return this.mainToken;
    let main = new CachedToken(), { pos, p } = stack;
    main.start = pos;
    main.end = Math.min(pos + 1, p.stream.end);
    main.value = pos == p.stream.end ? p.parser.eofTerm : 0;
    return main;
  }
  updateCachedToken(token, tokenizer, stack) {
    let start = this.stream.clipPos(stack.pos);
    tokenizer.token(this.stream.reset(start, token), stack);
    if (token.value > -1) {
      let { parser: parser2 } = stack.p;
      for (let i = 0; i < parser2.specialized.length; i++)
        if (parser2.specialized[i] == token.value) {
          let result = parser2.specializers[i](this.stream.read(token.start, token.end), stack);
          if (result >= 0 && stack.p.parser.dialect.allows(result >> 1)) {
            if ((result & 1) == 0)
              token.value = result >> 1;
            else
              token.extended = result >> 1;
            break;
          }
        }
    } else {
      token.value = 0;
      token.end = this.stream.clipPos(start + 1);
    }
  }
  putAction(action, token, end, index) {
    for (let i = 0; i < index; i += 3)
      if (this.actions[i] == action)
        return index;
    this.actions[index++] = action;
    this.actions[index++] = token;
    this.actions[index++] = end;
    return index;
  }
  addActions(stack, token, end, index) {
    let { state } = stack, { parser: parser2 } = stack.p, { data } = parser2;
    for (let set = 0; set < 2; set++) {
      for (let i = parser2.stateSlot(
        state,
        set ? 2 : 1
        /* ParseState.Actions */
      ); ; i += 3) {
        if (data[i] == 65535) {
          if (data[i + 1] == 1) {
            i = pair(data, i + 2);
          } else {
            if (index == 0 && data[i + 1] == 2)
              index = this.putAction(pair(data, i + 2), token, end, index);
            break;
          }
        }
        if (data[i] == token)
          index = this.putAction(pair(data, i + 1), token, end, index);
      }
    }
    return index;
  }
}
var Rec;
(function(Rec2) {
  Rec2[Rec2["Distance"] = 5] = "Distance";
  Rec2[Rec2["MaxRemainingPerStep"] = 3] = "MaxRemainingPerStep";
  Rec2[Rec2["MinBufferLengthPrune"] = 500] = "MinBufferLengthPrune";
  Rec2[Rec2["ForceReduceLimit"] = 10] = "ForceReduceLimit";
  Rec2[Rec2["CutDepth"] = 15e3] = "CutDepth";
  Rec2[Rec2["CutTo"] = 9e3] = "CutTo";
  Rec2[Rec2["MaxLeftAssociativeReductionCount"] = 300] = "MaxLeftAssociativeReductionCount";
  Rec2[Rec2["MaxStackCount"] = 12] = "MaxStackCount";
})(Rec || (Rec = {}));
class Parse {
  constructor(parser2, input, fragments, ranges) {
    this.parser = parser2;
    this.input = input;
    this.ranges = ranges;
    this.recovering = 0;
    this.nextStackID = 9812;
    this.minStackPos = 0;
    this.reused = [];
    this.stoppedAt = null;
    this.lastBigReductionStart = -1;
    this.lastBigReductionSize = 0;
    this.bigReductionCount = 0;
    this.stream = new InputStream(input, ranges);
    this.tokens = new TokenCache(parser2, this.stream);
    this.topTerm = parser2.top[1];
    let { from } = ranges[0];
    this.stacks = [Stack.start(this, parser2.top[0], from)];
    this.fragments = fragments.length && this.stream.end - from > parser2.bufferLength * 4 ? new FragmentCursor(fragments, parser2.nodeSet) : null;
  }
  get parsedPos() {
    return this.minStackPos;
  }
  // Move the parser forward. This will process all parse stacks at
  // `this.pos` and try to advance them to a further position. If no
  // stack for such a position is found, it'll start error-recovery.
  //
  // When the parse is finished, this will return a syntax tree. When
  // not, it returns `null`.
  advance() {
    let stacks = this.stacks, pos = this.minStackPos;
    let newStacks = this.stacks = [];
    let stopped, stoppedTokens;
    if (this.bigReductionCount > 300 && stacks.length == 1) {
      let [s] = stacks;
      while (s.forceReduce() && s.stack.length && s.stack[s.stack.length - 2] >= this.lastBigReductionStart) {
      }
      this.bigReductionCount = this.lastBigReductionSize = 0;
    }
    for (let i = 0; i < stacks.length; i++) {
      let stack = stacks[i];
      for (; ; ) {
        this.tokens.mainToken = null;
        if (stack.pos > pos) {
          newStacks.push(stack);
        } else if (this.advanceStack(stack, newStacks, stacks)) {
          continue;
        } else {
          if (!stopped) {
            stopped = [];
            stoppedTokens = [];
          }
          stopped.push(stack);
          let tok = this.tokens.getMainToken(stack);
          stoppedTokens.push(tok.value, tok.end);
        }
        break;
      }
    }
    if (!newStacks.length) {
      let finished = stopped && findFinished(stopped);
      if (finished)
        return this.stackToTree(finished);
      if (this.parser.strict) {
        if (verbose && stopped)
          console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none"));
        throw new SyntaxError("No parse at " + pos);
      }
      if (!this.recovering)
        this.recovering = 5;
    }
    if (this.recovering && stopped) {
      let finished = this.stoppedAt != null && stopped[0].pos > this.stoppedAt ? stopped[0] : this.runRecovery(stopped, stoppedTokens, newStacks);
      if (finished)
        return this.stackToTree(finished.forceAll());
    }
    if (this.recovering) {
      let maxRemaining = this.recovering == 1 ? 1 : this.recovering * 3;
      if (newStacks.length > maxRemaining) {
        newStacks.sort((a, b) => b.score - a.score);
        while (newStacks.length > maxRemaining)
          newStacks.pop();
      }
      if (newStacks.some((s) => s.reducePos > pos))
        this.recovering--;
    } else if (newStacks.length > 1) {
      outer:
        for (let i = 0; i < newStacks.length - 1; i++) {
          let stack = newStacks[i];
          for (let j = i + 1; j < newStacks.length; j++) {
            let other = newStacks[j];
            if (stack.sameState(other) || stack.buffer.length > 500 && other.buffer.length > 500) {
              if ((stack.score - other.score || stack.buffer.length - other.buffer.length) > 0) {
                newStacks.splice(j--, 1);
              } else {
                newStacks.splice(i--, 1);
                continue outer;
              }
            }
          }
        }
      if (newStacks.length > 12)
        newStacks.splice(
          12,
          newStacks.length - 12
          /* Rec.MaxStackCount */
        );
    }
    this.minStackPos = newStacks[0].pos;
    for (let i = 1; i < newStacks.length; i++)
      if (newStacks[i].pos < this.minStackPos)
        this.minStackPos = newStacks[i].pos;
    return null;
  }
  stopAt(pos) {
    if (this.stoppedAt != null && this.stoppedAt < pos)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = pos;
  }
  // Returns an updated version of the given stack, or null if the
  // stack can't advance normally. When `split` and `stacks` are
  // given, stacks split off by ambiguous operations will be pushed to
  // `split`, or added to `stacks` if they move `pos` forward.
  advanceStack(stack, stacks, split) {
    let start = stack.pos, { parser: parser2 } = this;
    let base2 = verbose ? this.stackID(stack) + " -> " : "";
    if (this.stoppedAt != null && start > this.stoppedAt)
      return stack.forceReduce() ? stack : null;
    if (this.fragments) {
      let strictCx = stack.curContext && stack.curContext.tracker.strict, cxHash = strictCx ? stack.curContext.hash : 0;
      for (let cached = this.fragments.nodeAt(start); cached; ) {
        let match = this.parser.nodeSet.types[cached.type.id] == cached.type ? parser2.getGoto(stack.state, cached.type.id) : -1;
        if (match > -1 && cached.length && (!strictCx || (cached.prop(NodeProp.contextHash) || 0) == cxHash)) {
          stack.useNode(cached, match);
          if (verbose)
            console.log(base2 + this.stackID(stack) + ` (via reuse of ${parser2.getName(cached.type.id)})`);
          return true;
        }
        if (!(cached instanceof Tree) || cached.children.length == 0 || cached.positions[0] > 0)
          break;
        let inner = cached.children[0];
        if (inner instanceof Tree && cached.positions[0] == 0)
          cached = inner;
        else
          break;
      }
    }
    let defaultReduce = parser2.stateSlot(
      stack.state,
      4
      /* ParseState.DefaultReduce */
    );
    if (defaultReduce > 0) {
      stack.reduce(defaultReduce);
      if (verbose)
        console.log(base2 + this.stackID(stack) + ` (via always-reduce ${parser2.getName(
          defaultReduce & 65535
          /* Action.ValueMask */
        )})`);
      return true;
    }
    if (stack.stack.length >= 15e3) {
      while (stack.stack.length > 9e3 && stack.forceReduce()) {
      }
    }
    let actions = this.tokens.getActions(stack);
    for (let i = 0; i < actions.length; ) {
      let action = actions[i++], term = actions[i++], end = actions[i++];
      let last = i == actions.length || !split;
      let localStack = last ? stack : stack.split();
      localStack.apply(action, term, end);
      if (verbose)
        console.log(base2 + this.stackID(localStack) + ` (via ${(action & 65536) == 0 ? "shift" : `reduce of ${parser2.getName(
          action & 65535
          /* Action.ValueMask */
        )}`} for ${parser2.getName(term)} @ ${start}${localStack == stack ? "" : ", split"})`);
      if (last)
        return true;
      else if (localStack.pos > start)
        stacks.push(localStack);
      else
        split.push(localStack);
    }
    return false;
  }
  // Advance a given stack forward as far as it will go. Returns the
  // (possibly updated) stack if it got stuck, or null if it moved
  // forward and was given to `pushStackDedup`.
  advanceFully(stack, newStacks) {
    let pos = stack.pos;
    for (; ; ) {
      if (!this.advanceStack(stack, null, null))
        return false;
      if (stack.pos > pos) {
        pushStackDedup(stack, newStacks);
        return true;
      }
    }
  }
  runRecovery(stacks, tokens, newStacks) {
    let finished = null, restarted = false;
    for (let i = 0; i < stacks.length; i++) {
      let stack = stacks[i], token = tokens[i << 1], tokenEnd = tokens[(i << 1) + 1];
      let base2 = verbose ? this.stackID(stack) + " -> " : "";
      if (stack.deadEnd) {
        if (restarted)
          continue;
        restarted = true;
        stack.restart();
        if (verbose)
          console.log(base2 + this.stackID(stack) + " (restarted)");
        let done = this.advanceFully(stack, newStacks);
        if (done)
          continue;
      }
      let force = stack.split(), forceBase = base2;
      for (let j = 0; force.forceReduce() && j < 10; j++) {
        if (verbose)
          console.log(forceBase + this.stackID(force) + " (via force-reduce)");
        let done = this.advanceFully(force, newStacks);
        if (done)
          break;
        if (verbose)
          forceBase = this.stackID(force) + " -> ";
      }
      for (let insert2 of stack.recoverByInsert(token)) {
        if (verbose)
          console.log(base2 + this.stackID(insert2) + " (via recover-insert)");
        this.advanceFully(insert2, newStacks);
      }
      if (this.stream.end > stack.pos) {
        if (tokenEnd == stack.pos) {
          tokenEnd++;
          token = 0;
        }
        stack.recoverByDelete(token, tokenEnd);
        if (verbose)
          console.log(base2 + this.stackID(stack) + ` (via recover-delete ${this.parser.getName(token)})`);
        pushStackDedup(stack, newStacks);
      } else if (!finished || finished.score < stack.score) {
        finished = stack;
      }
    }
    return finished;
  }
  // Convert the stack's buffer to a syntax tree.
  stackToTree(stack) {
    stack.close();
    return Tree.build({
      buffer: StackBufferCursor.create(stack),
      nodeSet: this.parser.nodeSet,
      topID: this.topTerm,
      maxBufferLength: this.parser.bufferLength,
      reused: this.reused,
      start: this.ranges[0].from,
      length: stack.pos - this.ranges[0].from,
      minRepeatType: this.parser.minRepeatTerm
    });
  }
  stackID(stack) {
    let id2 = (stackIDs || (stackIDs = /* @__PURE__ */ new WeakMap())).get(stack);
    if (!id2)
      stackIDs.set(stack, id2 = String.fromCodePoint(this.nextStackID++));
    return id2 + stack;
  }
}
function pushStackDedup(stack, newStacks) {
  for (let i = 0; i < newStacks.length; i++) {
    let other = newStacks[i];
    if (other.pos == stack.pos && other.sameState(stack)) {
      if (newStacks[i].score < stack.score)
        newStacks[i] = stack;
      return;
    }
  }
  newStacks.push(stack);
}
class Dialect {
  constructor(source, flags, disabled) {
    this.source = source;
    this.flags = flags;
    this.disabled = disabled;
  }
  allows(term) {
    return !this.disabled || this.disabled[term] == 0;
  }
}
const id = (x) => x;
class ContextTracker {
  /// Define a context tracker.
  constructor(spec) {
    this.start = spec.start;
    this.shift = spec.shift || id;
    this.reduce = spec.reduce || id;
    this.reuse = spec.reuse || id;
    this.hash = spec.hash || (() => 0);
    this.strict = spec.strict !== false;
  }
}
class LRParser extends Parser {
  /// @internal
  constructor(spec) {
    super();
    this.wrappers = [];
    if (spec.version != 14)
      throw new RangeError(`Parser version (${spec.version}) doesn't match runtime version (${14})`);
    let nodeNames = spec.nodeNames.split(" ");
    this.minRepeatTerm = nodeNames.length;
    for (let i = 0; i < spec.repeatNodeCount; i++)
      nodeNames.push("");
    let topTerms = Object.keys(spec.topRules).map((r) => spec.topRules[r][1]);
    let nodeProps = [];
    for (let i = 0; i < nodeNames.length; i++)
      nodeProps.push([]);
    function setProp(nodeID, prop, value) {
      nodeProps[nodeID].push([prop, prop.deserialize(String(value))]);
    }
    if (spec.nodeProps)
      for (let propSpec of spec.nodeProps) {
        let prop = propSpec[0];
        if (typeof prop == "string")
          prop = NodeProp[prop];
        for (let i = 1; i < propSpec.length; ) {
          let next = propSpec[i++];
          if (next >= 0) {
            setProp(next, prop, propSpec[i++]);
          } else {
            let value = propSpec[i + -next];
            for (let j = -next; j > 0; j--)
              setProp(propSpec[i++], prop, value);
            i++;
          }
        }
      }
    this.nodeSet = new NodeSet(nodeNames.map((name2, i) => NodeType.define({
      name: i >= this.minRepeatTerm ? void 0 : name2,
      id: i,
      props: nodeProps[i],
      top: topTerms.indexOf(i) > -1,
      error: i == 0,
      skipped: spec.skippedNodes && spec.skippedNodes.indexOf(i) > -1
    })));
    if (spec.propSources)
      this.nodeSet = this.nodeSet.extend(...spec.propSources);
    this.strict = false;
    this.bufferLength = DefaultBufferLength;
    let tokenArray = decodeArray(spec.tokenData);
    this.context = spec.context;
    this.specializerSpecs = spec.specialized || [];
    this.specialized = new Uint16Array(this.specializerSpecs.length);
    for (let i = 0; i < this.specializerSpecs.length; i++)
      this.specialized[i] = this.specializerSpecs[i].term;
    this.specializers = this.specializerSpecs.map(getSpecializer);
    this.states = decodeArray(spec.states, Uint32Array);
    this.data = decodeArray(spec.stateData);
    this.goto = decodeArray(spec.goto);
    this.maxTerm = spec.maxTerm;
    this.tokenizers = spec.tokenizers.map((value) => typeof value == "number" ? new TokenGroup(tokenArray, value) : value);
    this.topRules = spec.topRules;
    this.dialects = spec.dialects || {};
    this.dynamicPrecedences = spec.dynamicPrecedences || null;
    this.tokenPrecTable = spec.tokenPrec;
    this.termNames = spec.termNames || null;
    this.maxNode = this.nodeSet.types.length - 1;
    this.dialect = this.parseDialect();
    this.top = this.topRules[Object.keys(this.topRules)[0]];
  }
  createParse(input, fragments, ranges) {
    let parse = new Parse(this, input, fragments, ranges);
    for (let w of this.wrappers)
      parse = w(parse, input, fragments, ranges);
    return parse;
  }
  /// Get a goto table entry @internal
  getGoto(state, term, loose = false) {
    let table = this.goto;
    if (term >= table[0])
      return -1;
    for (let pos = table[term + 1]; ; ) {
      let groupTag = table[pos++], last = groupTag & 1;
      let target = table[pos++];
      if (last && loose)
        return target;
      for (let end = pos + (groupTag >> 1); pos < end; pos++)
        if (table[pos] == state)
          return target;
      if (last)
        return -1;
    }
  }
  /// Check if this state has an action for a given terminal @internal
  hasAction(state, terminal) {
    let data = this.data;
    for (let set = 0; set < 2; set++) {
      for (let i = this.stateSlot(
        state,
        set ? 2 : 1
        /* ParseState.Actions */
      ), next; ; i += 3) {
        if ((next = data[i]) == 65535) {
          if (data[i + 1] == 1)
            next = data[i = pair(data, i + 2)];
          else if (data[i + 1] == 2)
            return pair(data, i + 2);
          else
            break;
        }
        if (next == terminal || next == 0)
          return pair(data, i + 1);
      }
    }
    return 0;
  }
  /// @internal
  stateSlot(state, slot) {
    return this.states[state * 6 + slot];
  }
  /// @internal
  stateFlag(state, flag) {
    return (this.stateSlot(
      state,
      0
      /* ParseState.Flags */
    ) & flag) > 0;
  }
  /// @internal
  validAction(state, action) {
    if (action == this.stateSlot(
      state,
      4
      /* ParseState.DefaultReduce */
    ))
      return true;
    for (let i = this.stateSlot(
      state,
      1
      /* ParseState.Actions */
    ); ; i += 3) {
      if (this.data[i] == 65535) {
        if (this.data[i + 1] == 1)
          i = pair(this.data, i + 2);
        else
          return false;
      }
      if (action == pair(this.data, i + 1))
        return true;
    }
  }
  /// Get the states that can follow this one through shift actions or
  /// goto jumps. @internal
  nextStates(state) {
    let result = [];
    for (let i = this.stateSlot(
      state,
      1
      /* ParseState.Actions */
    ); ; i += 3) {
      if (this.data[i] == 65535) {
        if (this.data[i + 1] == 1)
          i = pair(this.data, i + 2);
        else
          break;
      }
      if ((this.data[i + 2] & 65536 >> 16) == 0) {
        let value = this.data[i + 1];
        if (!result.some((v, i2) => i2 & 1 && v == value))
          result.push(this.data[i], value);
      }
    }
    return result;
  }
  /// Configure the parser. Returns a new parser instance that has the
  /// given settings modified. Settings not provided in `config` are
  /// kept from the original parser.
  configure(config2) {
    let copy = Object.assign(Object.create(LRParser.prototype), this);
    if (config2.props)
      copy.nodeSet = this.nodeSet.extend(...config2.props);
    if (config2.top) {
      let info = this.topRules[config2.top];
      if (!info)
        throw new RangeError(`Invalid top rule name ${config2.top}`);
      copy.top = info;
    }
    if (config2.tokenizers)
      copy.tokenizers = this.tokenizers.map((t2) => {
        let found = config2.tokenizers.find((r) => r.from == t2);
        return found ? found.to : t2;
      });
    if (config2.specializers) {
      copy.specializers = this.specializers.slice();
      copy.specializerSpecs = this.specializerSpecs.map((s, i) => {
        let found = config2.specializers.find((r) => r.from == s.external);
        if (!found)
          return s;
        let spec = Object.assign(Object.assign({}, s), { external: found.to });
        copy.specializers[i] = getSpecializer(spec);
        return spec;
      });
    }
    if (config2.contextTracker)
      copy.context = config2.contextTracker;
    if (config2.dialect)
      copy.dialect = this.parseDialect(config2.dialect);
    if (config2.strict != null)
      copy.strict = config2.strict;
    if (config2.wrap)
      copy.wrappers = copy.wrappers.concat(config2.wrap);
    if (config2.bufferLength != null)
      copy.bufferLength = config2.bufferLength;
    return copy;
  }
  /// Tells you whether any [parse wrappers](#lr.ParserConfig.wrap)
  /// are registered for this parser.
  hasWrappers() {
    return this.wrappers.length > 0;
  }
  /// Returns the name associated with a given term. This will only
  /// work for all terms when the parser was generated with the
  /// `--names` option. By default, only the names of tagged terms are
  /// stored.
  getName(term) {
    return this.termNames ? this.termNames[term] : String(term <= this.maxNode && this.nodeSet.types[term].name || term);
  }
  /// The eof term id is always allocated directly after the node
  /// types. @internal
  get eofTerm() {
    return this.maxNode + 1;
  }
  /// The type of top node produced by the parser.
  get topNode() {
    return this.nodeSet.types[this.top[1]];
  }
  /// @internal
  dynamicPrecedence(term) {
    let prec2 = this.dynamicPrecedences;
    return prec2 == null ? 0 : prec2[term] || 0;
  }
  /// @internal
  parseDialect(dialect) {
    let values = Object.keys(this.dialects), flags = values.map(() => false);
    if (dialect)
      for (let part of dialect.split(" ")) {
        let id2 = values.indexOf(part);
        if (id2 >= 0)
          flags[id2] = true;
      }
    let disabled = null;
    for (let i = 0; i < values.length; i++)
      if (!flags[i]) {
        for (let j = this.dialects[values[i]], id2; (id2 = this.data[j++]) != 65535; )
          (disabled || (disabled = new Uint8Array(this.maxTerm + 1)))[id2] = 1;
      }
    return new Dialect(dialect, flags, disabled);
  }
  /// Used by the output of the parser generator. Not available to
  /// user code. @hide
  static deserialize(spec) {
    return new LRParser(spec);
  }
}
function pair(data, off) {
  return data[off] | data[off + 1] << 16;
}
function findFinished(stacks) {
  let best = null;
  for (let stack of stacks) {
    let stopped = stack.p.stoppedAt;
    if ((stack.pos == stack.p.stream.end || stopped != null && stack.pos > stopped) && stack.p.parser.stateFlag(
      stack.state,
      2
      /* StateFlag.Accepting */
    ) && (!best || best.score < stack.score))
      best = stack;
  }
  return best;
}
function getSpecializer(spec) {
  if (spec.external) {
    let mask = spec.extend ? 1 : 0;
    return (value, stack) => spec.external(value, stack) << 1 | mask;
  }
  return spec.get;
}
const noSemi = 301, incdec = 1, incdecPrefix = 2, insertSemi = 302, spaces = 304, newline = 305, LineComment = 3, BlockComment = 4;
const space = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
];
const braceR = 125, semicolon = 59, slash = 47, star = 42, plus = 43, minus = 45;
const trackNewline = new ContextTracker({
  start: false,
  shift(context, term) {
    return term == LineComment || term == BlockComment || term == spaces ? context : term == newline;
  },
  strict: false
});
const insertSemicolon = new ExternalTokenizer((input, stack) => {
  let { next } = input;
  if ((next == braceR || next == -1 || stack.context) && stack.canShift(insertSemi))
    input.acceptToken(insertSemi);
}, { contextual: true, fallback: true });
const noSemicolon = new ExternalTokenizer((input, stack) => {
  let { next } = input, after;
  if (space.indexOf(next) > -1)
    return;
  if (next == slash && ((after = input.peek(1)) == slash || after == star))
    return;
  if (next != braceR && next != semicolon && next != -1 && !stack.context && stack.canShift(noSemi))
    input.acceptToken(noSemi);
}, { contextual: true });
const incdecToken = new ExternalTokenizer((input, stack) => {
  let { next } = input;
  if (next == plus || next == minus) {
    input.advance();
    if (next == input.next) {
      input.advance();
      let mayPostfix = !stack.context && stack.canShift(incdec);
      input.acceptToken(mayPostfix ? incdec : incdecPrefix);
    }
  }
}, { contextual: true });
const jsHighlight = styleTags({
  "get set async static": tags.modifier,
  "for while do if else switch try catch finally return throw break continue default case": tags.controlKeyword,
  "in of await yield void typeof delete instanceof": tags.operatorKeyword,
  "let var const function class extends": tags.definitionKeyword,
  "import export from": tags.moduleKeyword,
  "with debugger as new": tags.keyword,
  TemplateString: tags.special(tags.string),
  super: tags.atom,
  BooleanLiteral: tags.bool,
  this: tags.self,
  null: tags.null,
  Star: tags.modifier,
  VariableName: tags.variableName,
  "CallExpression/VariableName TaggedTemplateExpression/VariableName": tags.function(tags.variableName),
  VariableDefinition: tags.definition(tags.variableName),
  Label: tags.labelName,
  PropertyName: tags.propertyName,
  PrivatePropertyName: tags.special(tags.propertyName),
  "CallExpression/MemberExpression/PropertyName": tags.function(tags.propertyName),
  "FunctionDeclaration/VariableDefinition": tags.function(tags.definition(tags.variableName)),
  "ClassDeclaration/VariableDefinition": tags.definition(tags.className),
  PropertyDefinition: tags.definition(tags.propertyName),
  PrivatePropertyDefinition: tags.definition(tags.special(tags.propertyName)),
  UpdateOp: tags.updateOperator,
  LineComment: tags.lineComment,
  BlockComment: tags.blockComment,
  Number: tags.number,
  String: tags.string,
  Escape: tags.escape,
  ArithOp: tags.arithmeticOperator,
  LogicOp: tags.logicOperator,
  BitOp: tags.bitwiseOperator,
  CompareOp: tags.compareOperator,
  RegExp: tags.regexp,
  Equals: tags.definitionOperator,
  Arrow: tags.function(tags.punctuation),
  ": Spread": tags.punctuation,
  "( )": tags.paren,
  "[ ]": tags.squareBracket,
  "{ }": tags.brace,
  "InterpolationStart InterpolationEnd": tags.special(tags.brace),
  ".": tags.derefOperator,
  ", ;": tags.separator,
  "@": tags.meta,
  TypeName: tags.typeName,
  TypeDefinition: tags.definition(tags.typeName),
  "type enum interface implements namespace module declare": tags.definitionKeyword,
  "abstract global Privacy readonly override": tags.modifier,
  "is keyof unique infer": tags.operatorKeyword,
  JSXAttributeValue: tags.attributeValue,
  JSXText: tags.content,
  "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": tags.angleBracket,
  "JSXIdentifier JSXNameSpacedName": tags.tagName,
  "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": tags.attributeName,
  "JSXBuiltin/JSXIdentifier": tags.standard(tags.tagName)
});
const spec_identifier = { __proto__: null, export: 14, as: 19, from: 27, default: 30, async: 35, function: 36, extends: 46, this: 50, true: 58, false: 58, null: 70, void: 74, typeof: 78, super: 96, new: 130, delete: 146, yield: 155, await: 159, class: 164, public: 219, private: 219, protected: 219, readonly: 221, instanceof: 240, satisfies: 243, in: 244, const: 246, import: 278, keyof: 333, unique: 337, infer: 343, is: 379, abstract: 399, implements: 401, type: 403, let: 406, var: 408, interface: 415, enum: 419, namespace: 425, module: 427, declare: 431, global: 435, for: 456, of: 465, while: 468, with: 472, do: 476, if: 480, else: 482, switch: 486, case: 492, try: 498, catch: 502, finally: 506, return: 510, throw: 514, break: 518, continue: 522, debugger: 526 };
const spec_word = { __proto__: null, async: 117, get: 119, set: 121, public: 181, private: 181, protected: 181, static: 183, abstract: 185, override: 187, readonly: 193, accessor: 195, new: 383 };
const spec_LessThan = { __proto__: null, "<": 137 };
const parser = LRParser.deserialize({
  version: 14,
  states: "$BhO`QUOOO%QQUOOO'TQWOOP(_OSOOO*mQ(CjO'#CfO*tOpO'#CgO+SO!bO'#CgO+bO07`O'#DZO-sQUO'#DaO.TQUO'#DlO%QQUO'#DvO0[QUO'#EOOOQ(CY'#EW'#EWO0rQSO'#ETOOQO'#I_'#I_O0zQSO'#GjOOQO'#Eh'#EhO1VQSO'#EgO1[QSO'#EgO3^Q(CjO'#JbO5}Q(CjO'#JcO6kQSO'#FVO6pQ#tO'#FnOOQ(CY'#F_'#F_O6{O&jO'#F_O7ZQ,UO'#FuO8qQSO'#FtOOQ(CY'#Jc'#JcOOQ(CW'#Jb'#JbOOQQ'#J|'#J|O8vQSO'#IOO8{Q(C[O'#IPOOQQ'#JO'#JOOOQQ'#IT'#ITQ`QUOOO%QQUO'#DnO9TQUO'#DzO%QQUO'#D|O9[QSO'#GjO9aQ,UO'#ClO9oQSO'#EfO9zQSO'#EqO:PQ,UO'#F^O:nQSO'#GjO:sQSO'#GnO;OQSO'#GnO;^QSO'#GqO;^QSO'#GrO;^QSO'#GtO9[QSO'#GwO;}QSO'#GzO=`QSO'#CbO=pQSO'#HXO=xQSO'#H_O=xQSO'#HaO`QUO'#HcO=xQSO'#HeO=xQSO'#HhO=}QSO'#HnO>SQ(C]O'#HtO%QQUO'#HvO>_Q(C]O'#HxO>jQ(C]O'#HzO8{Q(C[O'#H|O>uQ(CjO'#CfO?wQWO'#DfQOQSOOO@_QSO'#EPO9aQ,UO'#EfO@jQSO'#EfO@uQ`O'#F^OOQQ'#Cd'#CdOOQ(CW'#Dk'#DkOOQ(CW'#Jf'#JfO%QQUO'#JfOBOQWO'#E_OOQ(CW'#E^'#E^OBYQ(C`O'#E_OBtQWO'#ESOOQO'#Ji'#JiOCYQWO'#ESOCgQWO'#E_OC}QWO'#EeODQQWO'#E_O@}QWO'#E_OBtQWO'#E_PDkO?MpO'#C`POOO)CDm)CDmOOOO'#IU'#IUODvOpO,59ROOQ(CY,59R,59ROOOO'#IV'#IVOEUO!bO,59RO%QQUO'#D]OOOO'#IX'#IXOEdO07`O,59uOOQ(CY,59u,59uOErQUO'#IYOFVQSO'#JdOHXQbO'#JdO+pQUO'#JdOH`QSO,59{OHvQSO'#EhOITQSO'#JqOI`QSO'#JpOI`QSO'#JpOIhQSO,5;UOImQSO'#JoOOQ(CY,5:W,5:WOItQUO,5:WOKuQ(CjO,5:bOLfQSO,5:jOLkQSO'#JmOMeQ(C[O'#JnO:sQSO'#JmOMlQSO'#JmOMtQSO,5;TOMyQSO'#JmOOQ(CY'#Cf'#CfO%QQUO'#EOONmQ`O,5:oOOQO'#Jj'#JjOOQO-E<]-E<]O9[QSO,5=UO! TQSO,5=UO! YQUO,5;RO!#]Q,UO'#EcO!$pQSO,5;RO!&YQ,UO'#DpO!&aQUO'#DuO!&kQWO,5;[O!&sQWO,5;[O%QQUO,5;[OOQQ'#E}'#E}OOQQ'#FP'#FPO%QQUO,5;]O%QQUO,5;]O%QQUO,5;]O%QQUO,5;]O%QQUO,5;]O%QQUO,5;]O%QQUO,5;]O%QQUO,5;]O%QQUO,5;]O%QQUO,5;]O%QQUO,5;]OOQQ'#FT'#FTO!'RQUO,5;nOOQ(CY,5;s,5;sOOQ(CY,5;t,5;tO!)UQSO,5;tOOQ(CY,5;u,5;uO%QQUO'#IeO!)^Q(C[O,5<bO!#]Q,UO,5;]O!){Q,UO,5;]O%QQUO,5;qO!*SQ#tO'#FdO!+PQ#tO'#JuO!*kQ#tO'#JuO!+WQ#tO'#JuOOQO'#Ju'#JuO!+lQ#tO,5;|OOOO,5<Y,5<YO!+}QUO'#FpOOOO'#Id'#IdO6{O&jO,5;yO!,UQ#tO'#FrOOQ(CY,5;y,5;yO!,uQ7[O'#CrOOQ(CY'#Cv'#CvO!-YQSO'#CvO!-_O07`O'#CzO!-{Q,UO,5<_O!.SQSO,5<aO!/iQMhO'#GPO!/vQSO'#GQO!/{QSO'#GQO!0QQMhO'#GUO!1PQWO'#GYO!1rQ7[O'#J]OOQ(CY'#J]'#J]O!1|QSO'#J[O!2[QSO'#JZO!2dQSO'#CqOOQ(CY'#Ct'#CtOOQ(CY'#DO'#DOOOQ(CY'#DQ'#DQO0uQSO'#DSO!$uQ,UO'#FwO!$uQ,UO'#FyO!2lQSO'#F{O!2qQSO'#F|O!/{QSO'#GSO!$uQ,UO'#GXO!2vQSO'#EiO!3bQSO,5<`O`QUO,5>jOOQQ'#JW'#JWOOQQ,5>k,5>kOOQQ-E<R-E<RO!5aQ(CjO,5:YO!7}Q(CjO,5:fO%QQUO,5:fO!:hQ(CjO,5:hOOQ(CW'#Co'#CoO!;XQ,UO,5=UO!;gQ(C[O'#JXO8qQSO'#JXO=}QSO,59WO!;xQWO,59WO!<QQ,UO,59WO9aQ,UO,59WO!<]QSO,5;RO!<eQSO'#HWO!<vQSO'#KQO%QQUO,5;vO!=OQWO,5;xO!=TQSO,5=qO!=YQSO,5=qO!=_QSO,5=qO8{Q(C[O,5=qO!=mQSO'#EjO!>gQWO'#EkOOQ(CW'#Jo'#JoO!>nQ(C[O'#J}O8{Q(C[O,5=YO;^QSO,5=`OOQO'#Cr'#CrO!>yQWO,5=]O!?RQ,UO,5=^O!?^QSO,5=`O!?cQ`O,5=cO=}QSO'#G|O9[QSO'#HOO!?kQSO'#HOO9aQ,UO'#HRO!?pQSO'#HROOQQ,5=f,5=fO!?uQSO'#HSO!?}QSO'#ClO!@SQSO,58|O!@^QSO,58|O!BfQUO,58|OOQQ,58|,58|O!BsQ(C[O,58|O%QQUO,58|O!COQUO'#HZOOQQ'#H['#H[OOQQ'#H]'#H]O`QUO,5=sO!C`QSO,5=sO`QUO,5=yO`QUO,5={O!CeQSO,5=}O`QUO,5>PO!CjQSO,5>SO!CoQUO,5>YOOQQ,5>`,5>`O%QQUO,5>`O8{Q(C[O,5>bOOQQ,5>d,5>dO!GvQSO,5>dOOQQ,5>f,5>fO!GvQSO,5>fOOQQ,5>h,5>hO!G{QWO'#DXO%QQUO'#JfO!HjQWO'#JfO!IXQWO'#DgO!IjQWO'#DgO!K{QUO'#DgO!LSQSO'#JeO!L[QSO,5:QO!LaQSO'#ElO!LoQSO'#JrO!LwQSO,5;VO!L|QWO'#DgO!MZQWO'#EROOQ(CY,5:k,5:kO%QQUO,5:kO!MbQSO,5:kO=}QSO,5;QO!;xQWO,5;QO!<QQ,UO,5;QO9aQ,UO,5;QO!MjQSO,5@QO!MoQ!LQO,5:oO!NrQ(C`O,5:yOBtQWO,5:nO# ^QWO,5:nO# kQWO,5:yO#!RQWO,5:yO#!lQWO,5:yOBtQWO,5:yO=}QSO,5:nOOQ(CW'#Eb'#EbOOQO,5:y,5:yO%QQUO,5:yO##]Q(C[O,5:yO##hQ(C[O,5:yO!;xQWO,5:nOOQO,5;P,5;PO##vQ(C[O,5:yPOOO'#IS'#ISP#$[O?MpO,58zPOOO,58z,58zOOOO-E<S-E<SOOQ(CY1G.m1G.mOOOO-E<T-E<TO#$gQ`O,59wOOOO-E<V-E<VOOQ(CY1G/a1G/aO#$lQbO,5>tO+pQUO,5>tOOQO,5>z,5>zO#$vQUO'#IYOOQO-E<W-E<WO#%TQSO,5@OO#%]QbO,5@OO#%dQSO,5@[OOQ(CY1G/g1G/gO%QQUO,5@]O#%lQSO'#I`OOQO-E<^-E<^O#%dQSO,5@[OOQ(CW1G0p1G0pOOQ(CY1G/r1G/rOOQ(CY1G0U1G0UO#&QQSO,5@XO:sQSO,5@XO#&YQSO,5@XO%QQUO,5@YO#&hQ(C[O,5@YO#&yQ(C[O,5@YO#'QQSO'#IbO#&QQSO,5@XOOQ(CW1G0o1G0oO!&kQWO,5:qO!&vQWO,5:qOOQO,5:s,5:sO#'oQSO,5:sO#'wQ,UO1G2pO9[QSO1G2pOOQ(CY1G0m1G0mO#(VQ(CjO1G0mO#)[Q(ChO,5:}OOQ(CY'#GO'#GOO#)xQ(CjO'#J]O! YQUO1G0mO#,QQ,UO'#JgO#,[QSO,5:[O#,aQbO'#JhO%QQUO'#JhO#,kQSO,5:aOOQ(CY'#DX'#DXOOQ(CY1G0v1G0vO%QQUO1G0vOOQ(CY1G1`1G1`O#,pQSO1G0vO#/XQ(CjO1G0wO#/`Q(CjO1G0wO#1yQ(CjO1G0wO#2QQ(CjO1G0wO#4[Q(CjO1G0wO#4rQ(CjO1G0wO#7lQ(CjO1G0wO#7sQ(CjO1G0wO#:^Q(CjO1G0wO#:eQ(CjO1G0wO#<]Q(CjO1G0wO#?]Q$IUO'#CfO#AZQ$IUO1G1YO#CXQ$IUO'#JcO!)XQSO1G1`O#ClQ(CjO,5?POOQ(CW-E<c-E<cO#D`Q(CjO1G0wOOQ(CY1G0w1G0wO#FkQ(CjO1G1]O#G_Q#tO,5<QO#GgQ#tO,5<RO#GoQ#tO'#FiO#HWQSO'#FhOOQO'#Jv'#JvOOQO'#Ic'#IcO#H]Q#tO1G1hOOQ(CY1G1h1G1hOOOO1G1s1G1sO#HnQ$IUO'#JbO#HxQSO,5<[O!'RQUO,5<[OOOO-E<b-E<bOOQ(CY1G1e1G1eO#H}QWO'#JuOOQ(CY,5<^,5<^O#IVQWO,5<^OOQ(CY,59b,59bO!#]Q,UO'#C|OOOO'#IW'#IWO#I[O07`O,59fOOQ(CY,59f,59fO%QQUO1G1yO!2qQSO'#IgO#IgQSO,5<rOOQ(CY,5<o,5<oOOQO'#Ge'#GeO!$uQ,UO,5=OOOQO'#Gg'#GgO!$uQ,UO,5=QO!#]Q,UO,5=SOOQO1G1{1G1{O#IuQ`O'#CoO#JYQ`O,5<kO#JaQSO'#JyO9[QSO'#JyO#JoQSO,5<mO!$uQ,UO,5<lO#JtQSO'#GRO#KPQSO,5<lO#KUQ`O'#GOO#KcQ`O'#JzO#KmQSO'#JzO!#]Q,UO'#JzO#KrQSO,5<pO#KwQWO'#GZO!0zQWO'#GZO#LYQSO'#G]O#L_QSO'#G_O!/{QSO'#GbO#LdQ(C[O'#IiO#LoQWO,5<tOOQ(CY,5<t,5<tO#LvQWO'#GZO#MUQWO'#G[O#M^QWO'#G[OOQ(CY,5=T,5=TO!$uQ,UO,5?vO!$uQ,UO,5?vO#McQSO'#IjO#MnQSO,5?uO#MvQSO,59]O#NgQ,UO,59nOOQ(CY,59n,59nO$ YQ,UO,5<cO$ {Q,UO,5<eO?oQSO,5<gOOQ(CY,5<h,5<hO$!VQSO,5<nO$![Q,UO,5<sO! YQUO1G1zO$!lQSO1G1zOOQQ1G4U1G4UOOQ(CY1G/t1G/tO!)UQSO1G/tO$$kQ(CjO1G0QOOQQ1G2p1G2pO!#]Q,UO1G2pO%QQUO1G2pO$%[QSO1G2pO$%gQ,UO'#EcOOQ(CW,5?s,5?sO$%qQ(C[O,5?sOOQQ1G.r1G.rO=}QSO1G.rO!;xQWO1G.rO!<QQ,UO1G.rO$&SQSO1G0mO$&XQSO'#CfO$&dQSO'#KRO$&lQSO,5=rO$&qQSO'#KRO$&vQSO'#KRO$'RQSO'#IrO$'aQSO,5@lO$'iQbO1G1bOOQ(CY1G1d1G1dO9[QSO1G3]O?oQSO1G3]O$'pQSO1G3]O$'uQSO1G3]OOQQ1G3]1G3]O:sQSO'#JpO:sQSO'#ElO%QQUO'#ElO:sQSO'#IlO$'zQ(C[O,5@iOOQQ1G2t1G2tO!?^QSO1G2zO!#]Q,UO1G2wO$(VQSO1G2wOOQQ1G2x1G2xO!#]Q,UO1G2xO$([QSO1G2xO$(dQWO'#GvOOQQ1G2z1G2zO!0zQWO'#InO!?cQ`O1G2}OOQQ1G2}1G2}OOQQ,5=h,5=hO$(lQ,UO,5=jO9[QSO,5=jO#L_QSO,5=mO8qQSO,5=mO!;xQWO,5=mO!<QQ,UO,5=mO9aQ,UO,5=mO$(zQSO'#KPO$)VQSO,5=nOOQQ1G.h1G.hO$)[Q(C[O1G.hO?oQSO1G.hO$)gQSO1G.hO8{Q(C[O1G.hO$)rQbO,5@nO$*VQSO,5@nO$*bQUO,5=uO$*iQSO,5=uO:sQSO,5@nOOQQ1G3_1G3_O`QUO1G3_OOQQ1G3e1G3eOOQQ1G3g1G3gO=xQSO1G3iO$*nQUO1G3kO$.oQUO'#HjOOQQ1G3n1G3nO$.|QSO'#HpO=}QSO'#HrOOQQ1G3t1G3tO$/UQUO1G3tO8{Q(C[O1G3zOOQQ1G3|1G3|OOQ(CW'#GV'#GVO8{Q(C[O1G4OO8{Q(C[O1G4QO$3YQSO,5@QO!'RQUO,5;WO:sQSO,5;WO=}QSO,5:RO!'RQUO,5:RO!;xQWO,5:RO$3_Q$IUO,5:ROOQO,5;W,5;WO$3iQWO'#IZO$4PQSO,5@POOQ(CY1G/l1G/lO$4XQWO'#IaO$4cQSO,5@^OOQ(CW1G0q1G0qO!IjQWO,5:ROOQO'#I^'#I^O$4kQWO,5:mOOQ(CY,5:m,5:mO!MeQSO1G0VOOQ(CY1G0V1G0VO%QQUO1G0VOOQ(CY1G0l1G0lO=}QSO1G0lO!;xQWO1G0lO!<QQ,UO1G0lOOQ(CW1G5l1G5lO=}QSO1G0YOOQO1G0e1G0eO%QQUO1G0eO$4rQ(C[O1G0eO$4}Q(C[O1G0eO!;xQWO1G0YOBtQWO1G0YO$5]Q(C`O1G0eO$5wQWO1G0YOBtQWO1G0eO$6UQWO1G0eO$6lQWO1G0eO$7VQ(C[O1G0eOOQO1G0Y1G0YO$7kQ(CjO1G0ePOOO-E<Q-E<QPOOO1G.f1G.fOOOO1G/c1G/cO$7uQ`O,5<bO$7}QbO1G4`OOQO1G4f1G4fO%QQUO,5>tO$8XQSO1G5jO$8aQSO1G5vO$8iQbO1G5wO:sQSO,5>zO$8sQSO1G5sO$8sQSO1G5sO:sQSO1G5sO$8{Q(CjO1G5tO%QQUO1G5tO$9]Q(C[O1G5tO$9nQSO,5>|O:sQSO,5>|OOQO,5>|,5>|O$:SQSO,5>|OOQO-E<`-E<`OOQO1G0]1G0]OOQO1G0_1G0_O!)XQSO1G0_OOQQ7+([7+([O!#]Q,UO7+([O%QQUO7+([O$:bQSO7+([O$:mQ,UO7+([O$:{Q(CjO,59nO$=TQ(CjO,5<cO$?`Q(CjO,5<eO$AkQ(CjO,5<sOOQ(CY7+&X7+&XO$C|Q(CjO7+&XO$DpQ,UO'#I[O$DzQSO,5@ROOQ(CY1G/v1G/vO$ESQUO'#I]O$EaQSO,5@SO$EiQbO,5@SOOQ(CY1G/{1G/{O$EsQSO7+&bOOQ(CY7+&b7+&bO$ExQ$IUO,5:bO%QQUO7+&tO$FSQ$IUO,5:YO$FaQ$IUO,5:fO$FkQ$IUO,5:hOOQ(CY7+&z7+&zOOQO1G1l1G1lOOQO1G1m1G1mO$FuQ#tO,5<TO!'RQUO,5<SOOQO-E<a-E<aOOQ(CY7+'S7+'SOOOO7+'_7+'_OOOO1G1v1G1vO$GQQSO1G1vOOQ(CY1G1x1G1xO$GVQ`O,59hOOOO-E<U-E<UOOQ(CY1G/Q1G/QO$G^Q(CjO7+'eOOQ(CY,5?R,5?RO$HQQSO,5?ROOQ(CY1G2^1G2^P$HVQSO'#IgPOQ(CY-E<e-E<eO$HyQ,UO1G2jO$IlQ,UO1G2lO$IvQ`O1G2nOOQ(CY1G2V1G2VO$I}QSO'#IfO$J]QSO,5@eO$J]QSO,5@eO$JeQSO,5@eO$JpQSO,5@eOOQO1G2X1G2XO$KOQ,UO1G2WO!$uQ,UO1G2WO$K`QMhO'#IhO$KpQSO,5@fO!#]Q,UO,5@fO$KxQ`O,5@fOOQ(CY1G2[1G2[OOQ(CW,5<u,5<uOOQ(CW,5<v,5<vO$LSQSO,5<vOBoQSO,5<vO!;xQWO,5<uOOQO'#G^'#G^O$LXQSO,5<wOOQ(CW,5<y,5<yO$LSQSO,5<|OOQO,5?T,5?TOOQO-E<g-E<gOOQ(CY1G2`1G2`O!0zQWO,5<uO$LaQSO,5<vO#LYQSO,5<wO!0zQWO,5<vO$LlQ,UO1G5bO$LvQ,UO1G5bOOQO,5?U,5?UOOQO-E<h-E<hOOQO1G.w1G.wO!=OQWO,59pO%QQUO,59pO$MTQSO1G2RO!$uQ,UO1G2YO$MYQ(CjO7+'fOOQ(CY7+'f7+'fO! YQUO7+'fOOQ(CY7+%`7+%`O$M|Q`O'#J{O!MeQSO7+([O$NWQbO7+([O$:eQSO7+([O$N_Q(ChO'#CfO$NrQ(ChO,5<zO% dQSO,5<zOOQ(CW1G5_1G5_OOQQ7+$^7+$^O=}QSO7+$^O!;xQWO7+$^O! YQUO7+&XO% iQSO'#IqO% }QSO,5@mOOQO1G3^1G3^O9[QSO,5@mO% }QSO,5@mO%!VQSO,5@mOOQO,5?^,5?^OOQO-E<p-E<pOOQ(CY7+&|7+&|O%![QSO7+(wO8{Q(C[O7+(wO9[QSO7+(wO?oQSO7+(wO%!aQSO,5;WOOQ(CW,5?W,5?WOOQ(CW-E<j-E<jOOQQ7+(f7+(fO%!fQ(ChO7+(cO!#]Q,UO7+(cO%!pQ`O7+(dOOQQ7+(d7+(dO!#]Q,UO7+(dO%!wQSO'#KOO%#SQSO,5=bOOQO,5?Y,5?YOOQO-E<l-E<lOOQQ7+(i7+(iO%$`QWO'#HPOOQQ1G3U1G3UO!#]Q,UO1G3UO%QQUO1G3UO%$gQSO1G3UO%$rQ,UO1G3UO8{Q(C[O1G3XO#L_QSO1G3XO8qQSO1G3XO!;xQWO1G3XO!<QQ,UO1G3XO%%QQSO'#IpO%%]QSO,5@kO%%eQWO,5@kOOQ(CW1G3Y1G3YOOQQ7+$S7+$SO?oQSO7+$SO8{Q(C[O7+$SO%%pQSO7+$SO%QQUO1G6YO%QQUO1G6ZO%%uQUO1G3aO%%|QSO1G3aO%&RQUO1G3aO%&YQ(C[O1G6YOOQQ7+(y7+(yO8{Q(C[O7+)TO`QUO7+)VOOQQ'#KU'#KUOOQQ'#Is'#IsO%&dQUO,5>UOOQQ,5>U,5>UO%QQUO'#HkO%&qQSO'#HmOOQQ,5>[,5>[O:sQSO,5>[OOQQ,5>^,5>^OOQQ7+)`7+)`OOQQ7+)f7+)fOOQQ7+)j7+)jOOQQ7+)l7+)lO%&vQWO1G5lO%'[Q$IUO1G0rO%'fQSO1G0rOOQO1G/m1G/mO%'qQ$IUO1G/mO=}QSO1G/mO!'RQUO'#DgOOQO,5>u,5>uOOQO-E<X-E<XOOQO,5>{,5>{OOQO-E<_-E<_O!;xQWO1G/mOOQO-E<[-E<[OOQ(CY1G0X1G0XOOQ(CY7+%q7+%qO!MeQSO7+%qOOQ(CY7+&W7+&WO=}QSO7+&WO!;xQWO7+&WOOQO7+%t7+%tO$7kQ(CjO7+&POOQO7+&P7+&PO%QQUO7+&PO%'{Q(C[O7+&PO=}QSO7+%tO!;xQWO7+%tO%(WQ(C[O7+&POBtQWO7+%tO%(fQ(C[O7+&PO%(zQ(C`O7+&PO%)UQWO7+%tOBtQWO7+&PO%)cQWO7+&PO%)yQSO7++_O%)yQSO7++_O%*RQ(CjO7++`O%QQUO7++`OOQO1G4h1G4hO:sQSO1G4hO%*cQSO1G4hOOQO7+%y7+%yO!MeQSO<<KvO$NWQbO<<KvO%*qQSO<<KvOOQQ<<Kv<<KvO!#]Q,UO<<KvO%QQUO<<KvO%*yQSO<<KvO%+UQ(CjO1G2jO%-aQ(CjO1G2lO%/lQ(CjO1G2WO%1}Q,UO,5>vOOQO-E<Y-E<YO%2XQbO,5>wO%QQUO,5>wOOQO-E<Z-E<ZO%2cQSO1G5nOOQ(CY<<I|<<I|O%2kQ$IUO1G0mO%4uQ$IUO1G0wO%4|Q$IUO1G0wO%7QQ$IUO1G0wO%7XQ$IUO1G0wO%8|Q$IUO1G0wO%9dQ$IUO1G0wO%;wQ$IUO1G0wO%<OQ$IUO1G0wO%>SQ$IUO1G0wO%>ZQ$IUO1G0wO%@RQ$IUO1G0wO%@fQ(CjO<<J`O%AkQ$IUO1G0wO%CaQ$IUO'#J]O%EdQ$IUO1G1]O%EqQ$IUO1G0QO!'RQUO'#FkOOQO'#Jw'#JwOOQO1G1o1G1oO%E{QSO1G1nO%FQQ$IUO,5?POOOO7+'b7+'bOOOO1G/S1G/SOOQ(CY1G4m1G4mO!$uQ,UO7+(YO%F[QSO,5?QO9[QSO,5?QOOQO-E<d-E<dO%FjQSO1G6PO%FjQSO1G6PO%FrQSO1G6PO%F}Q,UO7+'rO%G_Q`O,5?SO%GiQSO,5?SO!#]Q,UO,5?SOOQO-E<f-E<fO%GnQ`O1G6QO%GxQSO1G6QOOQ(CW1G2b1G2bO$LSQSO1G2bOOQ(CW1G2a1G2aO%HQQSO1G2cO!#]Q,UO1G2cOOQ(CW1G2h1G2hO!;xQWO1G2aOBoQSO1G2bO%HVQSO1G2cO%H_QSO1G2bO!$uQ,UO7+*|OOQ(CY1G/[1G/[O%HjQSO1G/[OOQ(CY7+'m7+'mO%HoQ,UO7+'tO%IPQ(CjO<<KQOOQ(CY<<KQ<<KQO!#]Q,UO'#IkO%IsQSO,5@gO!#]Q,UO1G2fOOQQ<<Gx<<GxO=}QSO<<GxO%I{Q(CjO<<IsOOQ(CY<<Is<<IsOOQO,5?],5?]O%JoQSO,5?]O$&vQSO,5?]OOQO-E<o-E<oO%JtQSO1G6XO%JtQSO1G6XO9[QSO1G6XO?oQSO<<LcOOQQ<<Lc<<LcO%J|QSO<<LcO8{Q(C[O<<LcO%KRQSO1G0rOOQQ<<K}<<K}O%!fQ(ChO<<K}OOQQ<<LO<<LOO%!pQ`O<<LOO%KWQWO'#ImO%KcQSO,5@jO!'RQUO,5@jOOQQ1G2|1G2|O%KkQ(C`O'#JfO%LVQUO'#JfO%L^QWO'#E_O%LwQ(C[O'#E_OBYQ(C`O'#E_O(VQWO'#HQOOQO'#Io'#IoO8{Q(C[O'#IoO%M]QWO,5=kOOQQ,5=k,5=kO%MuQWO'#E_O%LmQWO'#E_O%M|QWO'#E_O%NgQWO'#E_O& WQWO'#HQO& iQSO7+(pO& nQSO7+(pOOQQ7+(p7+(pO!#]Q,UO7+(pO%QQUO7+(pO& vQSO7+(pOOQQ7+(s7+(sO8{Q(C[O7+(sO#L_QSO7+(sO8qQSO7+(sO!;xQWO7+(sO&!RQSO,5?[OOQO-E<n-E<nOOQO'#HT'#HTO&!^QSO1G6VO8{Q(C[O<<GnOOQQ<<Gn<<GnO?oQSO<<GnO&!fQSO7++tO&!kQSO7++uOOQQ7+({7+({O&!pQSO7+({O&!uQUO7+({O&!|QSO7+({O%QQUO7++tO%QQUO7++uOOQQ<<Lo<<LoOOQQ<<Lq<<LqOOQQ-E<q-E<qOOQQ1G3p1G3pO&#RQSO,5>VOOQQ,5>X,5>XO&#WQSO1G3vO:sQSO7+&^O!'RQUO7+&^OOQO7+%X7+%XO&#]Q$IUO1G5wO=}QSO7+%XOOQ(CY<<I]<<I]OOQ(CY<<Ir<<IrO=}QSO<<IrOOQO<<Ik<<IkO$7kQ(CjO<<IkO%QQUO<<IkOOQO<<I`<<I`O=}QSO<<I`O&#gQ(C[O<<IkO!;xQWO<<I`O&#rQ(C[O<<IkOBtQWO<<I`O&$QQ(C[O<<IkO&$fQ(C`O<<IkO&$pQWO<<I`OBtQWO<<IkO&$}QSO<<NyO&%VQ(CjO<<NzOOQO7+*S7+*SO:sQSO7+*SOOQQANAbANAbO&%gQSOANAbO!#]Q,UOANAbO!MeQSOANAbO$NWQbOANAbO%QQUOANAbO&%oQ(CjO7+'rO&(QQ(CjO7+'tO&*cQbO1G4cO&*mQ$IUO7+&XO&*zQ$IUO,59nO&,}Q$IUO,5<cO&/QQ$IUO,5<eO&1TQ$IUO,5<sO&2yQ$IUO7+'eO&3WQ$IUO7+'fO&3eQSO,5<VOOQO7+'Y7+'YO&3jQ,UO<<KtOOQO1G4l1G4lO&3qQSO1G4lO&3|QSO1G4lO&4[QSO7++kO&4[QSO7++kO!#]Q,UO1G4nO&4dQ`O1G4nO&4nQSO7++lOOQ(CW7+'|7+'|O$LSQSO7+'}O&4vQ`O7+'}OOQ(CW7+'{7+'{O$LSQSO7+'|O&4}QSO7+'}O!#]Q,UO7+'}OBoQSO7+'|O&5SQ,UO<<NhOOQ(CY7+$v7+$vO&5^Q`O,5?VOOQO-E<i-E<iO&5hQ(ChO7+(QOOQQAN=dAN=dO9[QSO1G4wOOQO1G4w1G4wO&5xQSO1G4wO&5}QSO7++sO&5}QSO7++sO8{Q(C[OANA}O?oQSOANA}OOQQANA}ANA}OOQQANAiANAiOOQQANAjANAjO&6VQSO,5?XOOQO-E<k-E<kO&6bQ$IUO1G6UO#L_QSO,5=lO8qQSO,5=lO&8rQbO'#CfO&8|QWO,5:yO&9WQWO,5:yO&9eQWO,5:yO!;xQWO,5=lOOQO,5?Z,5?ZOOQO-E<m-E<mOOQQ1G3V1G3VO%LVQUO,5<wO%KkQ(C`O,5=lO!NrQ(C`O,5:yO(VQWO,5=lO&9xQWO,5=lO&:ZQWO,5:yOOQQ<<L[<<L[O!#]Q,UO<<L[O& iQSO<<L[O&:tQSO<<L[O%QQUO<<L[OOQQ<<L_<<L_O8{Q(C[O<<L_O#L_QSO<<L_O8qQSO<<L_O&:|QWO1G4vO&;XQSO7++qOOQQAN=YAN=YO8{Q(C[OAN=YOOQQ<= `<= `OOQQ<= a<= aOOQQ<<Lg<<LgO&;aQSO<<LgO&;fQUO<<LgO&;mQSO<= `O&;rQSO<= aOOQQ1G3q1G3qO=}QSO7+)bO&;wQSO<<IxO&<SQ$IUO<<IxOOQO<<Hs<<HsOOQ(CYAN?^AN?^OOQOAN?VAN?VO$7kQ(CjOAN?VOOQOAN>zAN>zO%QQUOAN?VO=}QSOAN>zO&<^Q(C[OAN?VO!;xQWOAN>zO&<iQ(C[OAN?VOBtQWOAN>zO&<wQ(C[OAN?VOOQO<<Mn<<MnOOQQG26|G26|O!#]Q,UOG26|O!MeQSOG26|O&=]QSOG26|O$NWQbOG26|O&=eQ$IUO<<J`O&=rQ$IUO1G2WO&?hQ$IUO1G2jO&AkQ$IUO1G2lO&CnQ$IUO<<KQO&C{Q$IUO<<IsOOQO1G1q1G1qO!$uQ,UOANA`OOQO7+*W7+*WO&DYQSO7+*WO&DeQSO<= VO&DmQ`O7+*YOOQ(CW<<Ki<<KiO$LSQSO<<KiOOQ(CW<<Kh<<KhO&DwQ`O<<KiO$LSQSO<<KhOOQO7+*c7+*cO9[QSO7+*cO&EOQSO<= _OOQQG27iG27iO8{Q(C[OG27iO!'RQUO1G4sO&EWQSO7++pO8{Q(C[O1G3WO#L_QSO1G3WO&E`QWO1G0eO&EjQWO1G0eO8qQSO1G3WO!;xQWO1G3WO(VQWO1G3WO%KkQ(C`O1G3WO$5]Q(C`O1G0eO&EwQWO1G3WO& iQSOANAvOOQQANAvANAvO!#]Q,UOANAvO&FYQSOANAvOOQQANAyANAyO8{Q(C[OANAyO#L_QSOANAyOOQO'#HU'#HUOOQO7+*b7+*bOOQQG22tG22tOOQQANBRANBRO&FbQSOANBROOQQANDzANDzOOQQAND{AND{OOQQ<<L|<<L|O!'RQUOAN?dOOQOG24qG24qO$7kQ(CjOG24qOOQOG24fG24fO%QQUOG24qO=}QSOG24fO&FgQ(C[OG24qO!;xQWOG24fO&FrQ(C[OG24qO!MeQSOLD,hOOQQLD,hLD,hO!#]Q,UOLD,hO&GQQSOLD,hO&GYQ$IUO7+'rO&IOQ$IUO7+'tO&JtQ,UOG26zOOQO<<Mr<<MrOOQ(CWANATANATO$LSQSOANATOOQ(CWANASANASOOQO<<M}<<M}OOQQLD-TLD-TO&KUQ$IUO7+*_OOQO7+(r7+(rO8{Q(C[O7+(rO&K`QWO7+&PO#L_QSO7+(rO8qQSO7+(rO!;xQWO7+(rO(VQWO7+(rOOQQG27bG27bO& iQSOG27bO!#]Q,UOG27bOOQQG27eG27eO8{Q(C[OG27eOOQQG27mG27mO&KjQ$IUOG25OOOQOLD*]LD*]O$7kQ(CjOLD*]OOQOLD*QLD*QO%QQUOLD*]O=}QSOLD*QO&KtQ(C[OLD*]OOQQ!$(!S!$(!SO!MeQSO!$(!SO!#]Q,UO!$(!SO&LPQ(CjOG26zOOQ(CWG26oG26oOOQO<<L^<<L^O8{Q(C[O<<L^O#L_QSO<<L^O8qQSO<<L^O!;xQWO<<L^OOQQLD,|LD,|O& iQSOLD,|OOQQLD-PLD-POOQO!$'Mw!$'MwO$7kQ(CjO!$'MwOOQO!$'Ml!$'MlO%QQUO!$'MwOOQQ!)9En!)9EnO!MeQSO!)9EnOOQOANAxANAxO8{Q(C[OANAxO#L_QSOANAxO8qQSOANAxOOQQ!$(!h!$(!hOOQO!)9Cc!)9CcO$7kQ(CjO!)9CcOOQQ!.K;Y!.K;YO&NbQ$IUOG26zOOQOG27dG27dO8{Q(C[OG27dO#L_QSOG27dOOQO!.K8}!.K8}OOQOLD-OLD-OO8{Q(C[OLD-OOOQO!$(!j!$(!jO!'RQUO'#DvO0rQSO'#ETO'!WQbO'#JbO!'RQUO'#DnO'!_QUO'#DzO!'RQUO'#D|O'!fQbO'#CfO'$|QbO'#CfO'%^QUO,5;RO!'RQUO,5;]O!'RQUO,5;]O!'RQUO,5;]O!'RQUO,5;]O!'RQUO,5;]O!'RQUO,5;]O!'RQUO,5;]O!'RQUO,5;]O!'RQUO,5;]O!'RQUO,5;]O!'RQUO,5;]O!'RQUO'#IeO''aQSO,5<bO''iQ,UO,5;]O'(|Q,UO,5;]O!'RQUO,5;qO0uQSO'#DSO0uQSO'#DSO!#]Q,UO'#FwO''iQ,UO'#FwO!#]Q,UO'#FyO''iQ,UO'#FyO!#]Q,UO'#GXO''iQ,UO'#GXO!'RQUO,5:fO!'RQUO,5@]O'%^QUO1G0mO')TQ$IUO'#CfO!'RQUO1G1yO!#]Q,UO,5=OO''iQ,UO,5=OO!#]Q,UO,5=QO''iQ,UO,5=QO!#]Q,UO,5<lO''iQ,UO,5<lO'%^QUO1G1zO!'RQUO7+&tO!#]Q,UO1G2WO''iQ,UO1G2WO!#]Q,UO1G2YO''iQ,UO1G2YO'%^QUO7+'fO'%^QUO7+&XO!#]Q,UOANA`O''iQ,UOANA`O')_QSO'#EgO')dQSO'#EgO')lQSO'#FVO')qQSO'#EqO')vQSO'#JqO'*RQSO'#JoO'*^QSO,5;RO'*cQ,UO,5<_O'*jQSO'#GQO'*oQSO'#GQO'*tQSO,5<`O'*|QSO,5;RO'+UQ$IUO1G1YO'+]QSO,5<lO'+bQSO,5<lO'+gQSO,5<nO'+lQSO,5<nO'+qQSO1G1zO'+vQSO1G0mO'+{Q,UO<<KtO',SQ,UO<<KtO7ZQ,UO'#FuO8qQSO'#FtO@jQSO'#EfO!'RQUO,5;nO!/{QSO'#GQO!/{QSO'#GQO!/{QSO'#GSO!/{QSO'#GSO!$uQ,UO7+(YO!$uQ,UO7+(YO$IvQ`O1G2nO$IvQ`O1G2nO!#]Q,UO,5=SO!#]Q,UO,5=S",
  stateData: "'-[~O'lOS'mOSROS'nRQ~OPYOQYOV!TO^pOaxObwOikOkYOlkOmkOskOuYOwYO|WO!QkO!RkO!XXO!csO!hZO!kYO!lYO!mYO!otO!quO!tvO!x]O#o}O$PzO$TfO%_{O%a!OO%c|O%d|O%g!PO%i!QO%l!RO%m!RO%o!SO%|!UO&S!VO&U!WO&W!XO&Y!YO&]!ZO&c![O&i!]O&k!^O&m!_O&o!`O&q!aO'sSO'uTO'xUO(QVO(_[O(liO~OPYOQYOa!gOb!fOikOkYOlkOmkOskOuYOwYO|WO!QkO!RkO!X!cO!csO!hZO!kYO!lYO!mYO!otO!quO!t!eO$P!hO$TfO's!bO'uTO'xUO(QVO(_[O(liO~O^!qOl!kO|!lO![!rO!]!pO!^!pO!x;oO!|!vO!}!tO#O!uO#P!sO#S!wO#T!wO't!iO'uTO'xUO(T!jO(_!nO~O'n!xO~OPYXXYX^YXkYXyYXzYX|YX!VYX!eYX!fYX!hYX!lYX#WYX#ccX#fYX#gYX#hYX#iYX#jYX#kYX#lYX#mYX#nYX#pYX#rYX#tYX#uYX#zYX'jYX(QYX(`YX(gYX(hYX~O!a$yX~P(dO[!zO'u!|O'v!zO'w!|O~O[!}O'w!|O'x!|O'y!}O~Oq#PO!O#QO(R#QO(S#SO~OPYOQYOa!gOb!fOikOkYOlkOmkOskOuYOwYO|WO!QkO!RkO!X!cO!csO!hZO!kYO!lYO!mYO!otO!quO!t!eO$P!hO$TfO's;tO'uTO'xUO(QVO(_[O(liO~O!U#WO!V#TO!S(WP!S(dP~P+pO!W#`O~P`OPYOQYOa!gOb!fOikOkYOlkOmkOskOuYOwYO|WO!QkO!RkO!X!cO!csO!hZO!kYO!lYO!mYO!otO!quO!t!eO$P!hO$TfO'uTO'xUO(QVO(_[O(liO~O!U#fO!x]O#a#iO#b#fO's;uO!g(aP~P.[O!h#kO's#jO~O!t#oO!x]O%_#pO~O#c#qO~O!a#rO#c#qO~OP$YOX$aOk#}Oy#vOz#wO|#xO!V$^O!e$PO!f#tO!h#uO!l$YO#f#{O#g#|O#h#|O#i#|O#j$OO#k$PO#l$PO#m$`O#n$PO#p$QO#r$SO#t$UO#u$VO(QVO(`$WO(g#yO(h#zO~O^(UX'j(UX'h(UX!g(UX!S(UX!X(UX%`(UX!a(UX~P1dO#W$bO#z$bOP(VXX(VXk(VXy(VXz(VX|(VX!V(VX!e(VX!h(VX!l(VX#f(VX#g(VX#h(VX#i(VX#j(VX#k(VX#l(VX#m(VX#n(VX#p(VX#r(VX#t(VX#u(VX(Q(VX(`(VX(g(VX(h(VX!X(VX%`(VX~O^(VX!f(VX'j(VX'h(VX!S(VX!g(VXo(VX!a(VX~P3zO#W$bO~O$V$dO$X$cO$`$iO~O!X$jO$TfO$c$kO$e$mO~Oi%POk$qOl$pOm$pOs%QOu%ROw%SO|$xO!X$yO!c%XO!h$uO#b%YO$P%VO$l%TO$n%UO$q%WO's$oO'uTO'xUO'|%OO(Q$rOd'}P~O!h%ZO~O!a%]O~O^%^O'j%^O~O't!iO~P%QO's%eO~O!h%ZO's%eO't!iO'|%OO~Ob%lO!h%ZO's%eO~O#n$PO~Oy%qO!X%nO!h%pO%a%tO's%eO't!iO'uTO'xUO](tP~O!t#oO~O|%vO!X%wO's%eO~O|%vO!X%wO%i%{O's%eO~O's%|O~O#o}O%a!OO%c|O%d|O%g!PO%i!QO%l!RO%m!RO~Oa&VOb&UO!t&SO%_&TO%q&RO~P;cOa&YObwO!X&XO!tvO!x]O#o}O%_{O%c|O%d|O%g!PO%i!QO%l!RO%m!RO%o!SO~O_&]O#W&`O%a&ZO't!iO~P<bO!h&aO!q&eO~O!h#kO~O!XXO~O^%^O'i&mO'j%^O~O^%^O'i&pO'j%^O~O^%^O'i&rO'j%^O~O'hYX!SYXoYX!gYX&QYX!XYX%`YX!aYX~P(dO!['PO!]&xO!^&xO't!iO'uTO'xUO~Ol&vO|&uO!U&yO(T&tO!W(XP!W(fP~P?cOg'SO!X'QO's%eO~Ob'XO!h%ZO's%eO~Oy%qO!h%pO~Ol!kO|!lO!['^O!]']O!^']O!}'`O#O'`O#P'_O#S'bO#T'bO't!iO'uTO'xUO(T!jO(_!nO~O!x;oO!|'aO~P@}O^%^O!a#rO!h%ZO!l'hO#W'fO'j%^O'|%OO(`'dO~Ol!kO|!lO'uTO'xUO(T!jO(_!nO~O!]']O!^']O't!iO~PBtO!['^O!]']O!^']O#S'bO#T'bO't!iO~PBtO!XXO!['^O!]']O!^']O#P'_O#S'bO#T'bO't!iO~PBtO'o'lO'p'lO'q'nO~O[!zO'u'pO'v!zO'w'pO~O[!}O'w'pO'x'pO'y!}O~Oq#PO!O#QO(R#QO(S'tO~O!U'vO!S&|X!S'SX!V&|X!V'SX~P+pO!V'xO!S(WX~OP$YOX$aOk#}Oy#vOz#wO|#xO!V'xO!e$PO!f#tO!h#uO!l$YO#f#{O#g#|O#h#|O#i#|O#j$OO#k$PO#l$PO#m$`O#n$PO#p$QO#r$SO#t$UO#u$VO(QVO(`$WO(g#yO(h#zO~O!S(WX~PF_O!S'}O~O!S(cX!V(cX!a(cX!g(cX(`(cX~O#W(cX#c#[X!W(cX~PHeO#W(OO!S(eX!V(eX~O!V(PO!S(dX~O!S(SO~O#W$bO~PHeO!W(TO~P`Oy#vOz#wO|#xO!f#tO!h#uO(QVOP!jaX!jak!ja!V!ja!e!ja!l!ja#f!ja#g!ja#h!ja#i!ja#j!ja#k!ja#l!ja#m!ja#n!ja#p!ja#r!ja#t!ja#u!ja(`!ja(g!ja(h!ja~O^!ja'j!ja'h!ja!S!ja!g!jao!ja!X!ja%`!ja!a!ja~PI{O!g(UO~O|%vO!X%wO!x]O#a(XO#b(WO's%eO~O!a#rO#W(YO(`'dO!V(bX^(bX'j(bX~O!g(bX~PMPO!V(]O!g(aX~O!g(_O~O|%vO!X%wO#b(WO's%eO~Oy(`Oz(aO!f#tO!h#uO!x!wa|!wa~O!t!wa%_!wa!X!wa#a!wa#b!wa's!wa~PNXO!t(eO~OPYOQYOa!gOb!fOikOkYOlkOmkOskOuYOwYO|WO!QkO!RkO!XXO!csO!hZO!kYO!lYO!mYO!otO!quO!t!eO$P!hO$TfO's!bO'uTO'xUO(QVO(_[O(liO~Oi%POk$qOl$pOm$pOs%QOu%ROw<XO|$xO!X$yO!c=cO!h$uO#b<_O$P%VO$l<ZO$n<]O$q%WO's(iO'uTO'xUO'|%OO(Q$rO~O#c(kO~Oi%POk$qOl$pOm$pOs%QOu%ROw%SO|$xO!X$yO!c%XO!h$uO#b%YO$P%VO$l%TO$n%UO$q%WO's(iO'uTO'xUO'|%OO(Q$rO~Od(ZP~P!$uO!U(oO!g([P~P%QO(T(qO(_[O~O|(sO!h#uO(T(qO(_[O~OP;nOQ;nOa=_Ob!fOikOk;nOlkOmkOskOu;nOw;nO|WO!QkO!RkO!X!cO!c;qO!hZO!k;nO!l;nO!m;nO!o;rO!q;sO!t!eO$P!hO$TfO's)RO'uTO'xUO(QVO(_[O(l=]O~Oz)UO!h#uO~O!V$^O^$ja'j$ja'h$ja!g$ja!S$ja!X$ja%`$ja!a$ja~O#o)YO~P!#]Oy)]O!a)[O!X$WX$S$WX$V$WX$X$WX$`$WX~O!a)[O!X(iX$S(iX$V(iX$X(iX$`(iX~Oy)]O~P!*kOy)]O!X(iX$S(iX$V(iX$X(iX$`(iX~O!X)_O$S)cO$V)^O$X)^O$`)dO~O!U)gO~P!'RO$V$dO$X$cO$`)kO~Og$rXy$rX|$rX!f$rX(g$rX(h$rX~OdfXd$rXgfX!VfX#WfX~P!,aOl)mO~Oq)nO(R)oO(S)qO~Og)zOy)sO|)tO(g)vO(h)xO~Od)rO~P!-jOd){O~Oi%POk$qOl$pOm$pOs%QOu%ROw<XO|$xO!X$yO!c=cO!h$uO#b<_O$P%VO$l<ZO$n<]O$q%WO'uTO'xUO'|%OO(Q$rO~O!U*PO's)|O!g(mP~P!.XO#c*RO~O!h*SO~O!U*XO's*UO!S(nP~P!.XOk*eO|*]O![*cO!]*[O!^*[O!h*SO#S*dO%V*_O't!iO(T!jO~O!W*bO~P!0_O!f#tOg(PXy(PX|(PX(g(PX(h(PX!V(PX#W(PX~Od(PX#x(PX~P!1WOg*hO#W*gOd(OX!V(OX~O!V*iOd'}X~O's%|Od'}P~O!h*pO~O's(iO~O|%vO!U#fO!X%wO!x]O#a#iO#b#fO's%eO!g(aP~O!a#rO#c*tO~OP$YOX$aOk#}Oy#vOz#wO|#xO!e$PO!f#tO!h#uO!l$YO#f#{O#g#|O#h#|O#i#|O#j$OO#k$PO#l$PO#m$`O#n$PO#p$QO#r$SO#t$UO#u$VO(QVO(`$WO(g#yO(h#zO~O^!ba!V!ba'j!ba'h!ba!S!ba!g!bao!ba!X!ba%`!ba!a!ba~P!3jOy#vOz#wO|#xO!f#tO!h#uO(QVOP!naX!nak!na!V!na!e!na!l!na#f!na#g!na#h!na#i!na#j!na#k!na#l!na#m!na#n!na#p!na#r!na#t!na#u!na(`!na(g!na(h!na~O^!na'j!na'h!na!S!na!g!nao!na!X!na%`!na!a!na~P!6TOy#vOz#wO|#xO!f#tO!h#uO(QVOP!paX!pak!pa!V!pa!e!pa!l!pa#f!pa#g!pa#h!pa#i!pa#j!pa#k!pa#l!pa#m!pa#n!pa#p!pa#r!pa#t!pa#u!pa(`!pa(g!pa(h!pa~O^!pa'j!pa'h!pa!S!pa!g!pao!pa!X!pa%`!pa!a!pa~P!8nOg*|O!X'QO%`*{O'|%OO~O!a+OO!X'{X^'{X!V'{X'j'{X~O!h%ZO'|%OO~O!h%ZO's%eO'|%OO~O!a#rO#c(kO~O%a+[O's+WO'uTO'xUO!W(uP~O!V+]O](tX~O(T(qO~OX+aO~O]+bO~O!X%nO's%eO't!iO](tP~O|%vO!U+fO!V(PO!X%wO's%eO!S(dP~Ol&|O|+hO!U+gO'uTO'xUO(T(qO~O!W(fP~P!>RO!V+iO^(qX'j(qX~O#W+mO'|%OO~Og+pO!X$yO'|%OO~O!X+rO~Oy+tO!XXO~O!t+yO~Ob,OO~O's#jO!W(sP~Ob%lO~O%a!OO's%|O~P<bOX,UO],TO~OPYOQYOaxObwOikOkYOlkOmkOskOuYOwYO|WO!QkO!RkO!csO!hZO!kYO!lYO!mYO!otO!quO!tvO!x]O$TfO%_{O'uTO'xUO(QVO(_[O(liO~O!X!cO$P!hO's!bO~P!@fO],TO^%^O'j%^O~O^,YO#o,[O%c,[O%d,[O~P%QO!h&aO~O&S,aO~O!X,cO~O&e,eO&g,fOP&baQ&baV&ba^&baa&bab&bai&bak&bal&bam&bas&bau&baw&ba|&ba!Q&ba!R&ba!X&ba!c&ba!h&ba!k&ba!l&ba!m&ba!o&ba!q&ba!t&ba!x&ba#o&ba$P&ba$T&ba%_&ba%a&ba%c&ba%d&ba%g&ba%i&ba%l&ba%m&ba%o&ba%|&ba&S&ba&U&ba&W&ba&Y&ba&]&ba&c&ba&i&ba&k&ba&m&ba&o&ba&q&ba'h&ba's&ba'u&ba'x&ba(Q&ba(_&ba(l&ba!W&ba&Z&ba_&ba&`&ba~O's,kO~O!V{X!V!_X!W{X!W!_X!a{X!a!_X!h!_X#W{X'|!_X~O!a,pO#W,oO!V#`X!V(YX!W#`X!W(YX!a(YX!h(YX'|(YX~O!a,rO!h%ZO'|%OO!V!ZX!W!ZX~Ol!kO|!lO'uTO'xUO(T!jO~OP;nOQ;nOa=_Ob!fOikOk;nOlkOmkOskOu;nOw;nO|WO!QkO!RkO!X!cO!c;qO!hZO!k;nO!l;nO!m;nO!o;rO!q;sO!t!eO$P!hO$TfO'uTO'xUO(QVO(_[O(l=]O~O's<dO~P!I{O!V,vO!W(XX~O!W,xO~O!a,pO#W,oO!V#`X!W#`X~O!V,yO!W(fX~O!W,{O~O!],|O!^,|O't!iO~P!IjO!W-PO~P'TOg-SO!X'QO~O!S-XO~Ol!wa![!wa!]!wa!^!wa!|!wa!}!wa#O!wa#P!wa#S!wa#T!wa't!wa'u!wa'x!wa(T!wa(_!wa~PNXO^%^O!a#rO!h%ZO!l-^O#W-[O'j%^O'|%OO(`'dO~O!]-`O!^-`O't!iO~PBtO![-bO!]-`O!^-`O#S-cO#T-cO't!iO~PBtO![-bO!]-`O!^-`O#P-dO#S-cO#T-cO't!iO~PBtO![-bO!]-`O!^-`O!}-eO#O-eO#P-dO#S-cO#T-cO't!iO~PBtO^%^O#W-[O'j%^O~O^%^O!a#rO#W-[O'j%^O~O^%^O!a#rO!l-^O#W-[O'j%^O(`'dO~O'o'lO'p'lO'q-jO~Oo-kO~O!S&|a!V&|a~P!3jO!U-oO!S&|X!V&|X~P%QO!V'xO!S(Wa~O!S(Wa~PF_O!V(PO!S(da~O|%vO!U-sO!X%wO's%eO!S'SX!V'SX~O!V(]O!g(aa~O|%vO!X%wO#b-vO's%eO~O#W-xO!V(ba!g(ba^(ba'j(ba~O!a#rO~P#&hO|%vO!U-{O!X%wO!x]O#a-}O#b-{O's%eO!V'UX!g'UX~Oz.RO!h#uO~Og.UO!X'QO%`.TO'|%OO~O^#Zi!V#Zi'j#Zi'h#Zi!S#Zi!g#Zio#Zi!X#Zi%`#Zi!a#Zi~P!3jOg=iOy)sO|)tO(g)vO(h)xO~O#c#Va^#Va#W#Va'j#Va!V#Va!g#Va!X#Va!S#Va~P#(yO#c(PXP(PXX(PX^(PXk(PXz(PX!e(PX!h(PX!l(PX#f(PX#g(PX#h(PX#i(PX#j(PX#k(PX#l(PX#m(PX#n(PX#p(PX#r(PX#t(PX#u(PX'j(PX(Q(PX(`(PX!g(PX!S(PX'h(PXo(PX!X(PX%`(PX!a(PX~P!1WO!V._Od(ZX~P!-jOd.aO~O!V.bO!g([X~P!3jO!g.eO~O!S.gO~OP$YOy#vOz#wO|#xO!f#tO!h#uO!l$YO(QVOX#ei^#eik#ei!V#ei!e#ei#g#ei#h#ei#i#ei#j#ei#k#ei#l#ei#m#ei#n#ei#p#ei#r#ei#t#ei#u#ei'j#ei(`#ei(g#ei(h#ei'h#ei!S#ei!g#eio#ei!X#ei%`#ei!a#ei~O#f#ei~P#,uO#f#{O~P#,uOP$YOy#vOz#wO|#xO!f#tO!h#uO!l$YO#f#{O#g#|O#h#|O#i#|O(QVOX#ei^#ei!V#ei!e#ei#j#ei#k#ei#l#ei#m#ei#n#ei#p#ei#r#ei#t#ei#u#ei'j#ei(`#ei(g#ei(h#ei'h#ei!S#ei!g#eio#ei!X#ei%`#ei!a#ei~Ok#ei~P#/gOk#}O~P#/gOP$YOk#}Oy#vOz#wO|#xO!f#tO!h#uO!l$YO#f#{O#g#|O#h#|O#i#|O#j$OO(QVO^#ei!V#ei#p#ei#r#ei#t#ei#u#ei'j#ei(`#ei(g#ei(h#ei'h#ei!S#ei!g#eio#ei!X#ei%`#ei!a#ei~OX#ei!e#ei#k#ei#l#ei#m#ei#n#ei~P#2XOX$aO!e$PO#k$PO#l$PO#m$`O#n$PO~P#2XOP$YOX$aOk#}Oy#vOz#wO|#xO!e$PO!f#tO!h#uO!l$YO#f#{O#g#|O#h#|O#i#|O#j$OO#k$PO#l$PO#m$`O#n$PO#p$QO(QVO^#ei!V#ei#r#ei#t#ei#u#ei'j#ei(`#ei(h#ei'h#ei!S#ei!g#eio#ei!X#ei%`#ei!a#ei~O(g#ei~P#5YO(g#yO~P#5YOP$YOX$aOk#}Oy#vOz#wO|#xO!e$PO!f#tO!h#uO!l$YO#f#{O#g#|O#h#|O#i#|O#j$OO#k$PO#l$PO#m$`O#n$PO#p$QO#r$SO(QVO(g#yO^#ei!V#ei#t#ei#u#ei'j#ei(`#ei'h#ei!S#ei!g#eio#ei!X#ei%`#ei!a#ei~O(h#ei~P#7zO(h#zO~P#7zOP$YOX$aOk#}Oy#vOz#wO|#xO!e$PO!f#tO!h#uO!l$YO#f#{O#g#|O#h#|O#i#|O#j$OO#k$PO#l$PO#m$`O#n$PO#p$QO#r$SO#t$UO(QVO(g#yO(h#zO~O^#ei!V#ei#u#ei'j#ei(`#ei'h#ei!S#ei!g#eio#ei!X#ei%`#ei!a#ei~P#:lOPYXXYXkYXyYXzYX|YX!eYX!fYX!hYX!lYX#WYX#ccX#fYX#gYX#hYX#iYX#jYX#kYX#lYX#mYX#nYX#pYX#rYX#tYX#uYX#zYX(QYX(`YX(gYX(hYX!VYX!WYX~O#xYX~P#=VOP$YOX<VOk;yOy#vOz#wO|#xO!e;{O!f#tO!h#uO!l$YO#f;wO#g;xO#h;xO#i;xO#j;zO#k;{O#l;{O#m<UO#n;{O#p;|O#r<OO#t<QO#u<RO(QVO(`$WO(g#yO(h#zO~O#x.iO~P#?dOP(VXX(VXk(VXy(VXz(VX|(VX!e(VX!f(VX!h(VX!l(VX#f(VX#g(VX#h(VX#i(VX#j(VX#k(VX#l(VX#m(VX#p(VX#r(VX#t(VX#u(VX(Q(VX(`(VX(g(VX(h(VX!V(VX~O#W<WO#z<WO#n(VX#x(VX!W(VX~P#AbO^'Xa!V'Xa'j'Xa'h'Xa!g'Xa!S'Xao'Xa!X'Xa%`'Xa!a'Xa~P!3jOP#eiX#ei^#eik#eiz#ei!V#ei!e#ei!f#ei!h#ei!l#ei#f#ei#g#ei#h#ei#i#ei#j#ei#k#ei#l#ei#m#ei#n#ei#p#ei#r#ei#t#ei#u#ei'j#ei(Q#ei(`#ei'h#ei!S#ei!g#eio#ei!X#ei%`#ei!a#ei~P#(yO^#yi!V#yi'j#yi'h#yi!S#yi!g#yio#yi!X#yi%`#yi!a#yi~P!3jO$V.nO$X.nO~O$V.oO$X.oO~O!a)[O#W.pO!X$]X$S$]X$V$]X$X$]X$`$]X~O!U.qO~O!X)_O$S.sO$V)^O$X)^O$`.tO~O!V<SO!W(UX~P#?dO!W.uO~O!a)[O$`(iX~O$`.wO~Oq)nO(R)oO(S.zO~Ol.}O!S/OO'uTO'xUO~O!VcX!acX!gcX!g$rX(`cX~P!,aO!g/UO~P#(yO!V/VO!a#rO(`'dO!g(mX~O!g/[O~O!U*PO's%eO!g(mP~O#c/^O~O!S$rX!V$rX!a$yX~P!,aO!V/_O!S(nX~P#(yO!a/aO~O!S/cO~Ok/gO!a#rO!h%ZO'|%OO(`'dO~O's/iO~O!a+OO~O^%^O!V/mO'j%^O~O!W/oO~P!0_O!]/pO!^/pO't!iO(T!jO~O|/rO(T!jO~O#S/sO~O's%|Od'^X!V'^X~O!V*iOd'}a~Od/xO~Oy/yOz/yO|/zOgva(gva(hva!Vva#Wva~Odva#xva~P#M{Oy)sO|)tOg$ka(g$ka(h$ka!V$ka#W$ka~Od$ka#x$ka~P#NqOy)sO|)tOg$ma(g$ma(h$ma!V$ma#W$ma~Od$ma#x$ma~P$ dO#c/|O~Od${a!V${a#W${a#x${a~P!-jO#c0PO~Oy#vOz#wO|#xO!f#tO!h#uO(QVOP!niX!nik!ni!V!ni!e!ni!l!ni#f!ni#g!ni#h!ni#i!ni#j!ni#k!ni#l!ni#m!ni#n!ni#p!ni#r!ni#t!ni#u!ni(`!ni(g!ni(h!ni~O^!ni'j!ni'h!ni!S!ni!g!nio!ni!X!ni%`!ni!a!ni~P$!qOg.UO!X'QO%`.TO~Oi0WO's0VO~P!.[O!a+OO!X'{a^'{a!V'{a'j'{a~O#c0^O~OXYX!VcX!WcX~O!V0_O!W(uX~O!W0aO~OX0bO~O's+WO'uTO'xUO~O!X%nO's%eO]'fX!V'fX~O!V+]O](ta~O!g0gO~P!3jOX0jO~O]0kO~O!V+iO^(qa'j(qa~O#W0qO~Og0tO!X$yO~O(T(qO!W(rP~Og0}O!X0zO%`0|O'|%OO~OX1XO!V1VO!W(sX~O!W1YO~O]1[O^%^O'j%^O~O's#jO'uTO'xUO~O#W$bO#n1_O#z$bO&Q1`O^(VX~P#AbO#W$bO#n1_O&Q1`O~O^1aO~P%QO^1cO~O&Z1gOP&XiQ&XiV&Xi^&Xia&Xib&Xii&Xik&Xil&Xim&Xis&Xiu&Xiw&Xi|&Xi!Q&Xi!R&Xi!X&Xi!c&Xi!h&Xi!k&Xi!l&Xi!m&Xi!o&Xi!q&Xi!t&Xi!x&Xi#o&Xi$P&Xi$T&Xi%_&Xi%a&Xi%c&Xi%d&Xi%g&Xi%i&Xi%l&Xi%m&Xi%o&Xi%|&Xi&S&Xi&U&Xi&W&Xi&Y&Xi&]&Xi&c&Xi&i&Xi&k&Xi&m&Xi&o&Xi&q&Xi'h&Xi's&Xi'u&Xi'x&Xi(Q&Xi(_&Xi(l&Xi!W&Xi_&Xi&`&Xi~O_1mO!W1kO&`1lO~P`O!XXO!h1oO~O&g,fOP&biQ&biV&bi^&bia&bib&bii&bik&bil&bim&bis&biu&biw&bi|&bi!Q&bi!R&bi!X&bi!c&bi!h&bi!k&bi!l&bi!m&bi!o&bi!q&bi!t&bi!x&bi#o&bi$P&bi$T&bi%_&bi%a&bi%c&bi%d&bi%g&bi%i&bi%l&bi%m&bi%o&bi%|&bi&S&bi&U&bi&W&bi&Y&bi&]&bi&c&bi&i&bi&k&bi&m&bi&o&bi&q&bi'h&bi's&bi'u&bi'x&bi(Q&bi(_&bi(l&bi!W&bi&Z&bi_&bi&`&bi~O!S1uO~O!V!Za!W!Za~P#?dOl!kO|!lO!U1{O(T!jO!V&}X!W&}X~P?cO!V,vO!W(Xa~O!V'TX!W'TX~P!>RO!V,yO!W(fa~O!W2SO~P'TO^%^O#W2]O'j%^O~O^%^O!a#rO#W2]O'j%^O~O^%^O!a#rO!h%ZO!l2aO#W2]O'j%^O'|%OO(`'dO~O!]2bO!^2bO't!iO~PBtO![2eO!]2bO!^2bO#S2fO#T2fO't!iO~PBtO![2eO!]2bO!^2bO#P2gO#S2fO#T2fO't!iO~PBtO^%^O!a#rO!l2aO#W2]O'j%^O(`'dO~O^%^O'j%^O~P!3jO!V$^Oo$ja~O!S&|i!V&|i~P!3jO!V'xO!S(Wi~O!V(PO!S(di~O!S(ei!V(ei~P!3jO!V(]O!g(ai~O!V(bi!g(bi^(bi'j(bi~P!3jO#W2kO!V(bi!g(bi^(bi'j(bi~O|%vO!X%wO!x]O#a2nO#b2mO's%eO~O|%vO!X%wO#b2mO's%eO~Og2uO!X'QO%`2tO~Og2uO!X'QO%`2tO'|%OO~O#cvaPvaXva^vakva!eva!fva!hva!lva#fva#gva#hva#iva#jva#kva#lva#mva#nva#pva#rva#tva#uva'jva(Qva(`va!gva!Sva'hvaova!Xva%`va!ava~P#M{O#c$kaP$kaX$ka^$kak$kaz$ka!e$ka!f$ka!h$ka!l$ka#f$ka#g$ka#h$ka#i$ka#j$ka#k$ka#l$ka#m$ka#n$ka#p$ka#r$ka#t$ka#u$ka'j$ka(Q$ka(`$ka!g$ka!S$ka'h$kao$ka!X$ka%`$ka!a$ka~P#NqO#c$maP$maX$ma^$mak$maz$ma!e$ma!f$ma!h$ma!l$ma#f$ma#g$ma#h$ma#i$ma#j$ma#k$ma#l$ma#m$ma#n$ma#p$ma#r$ma#t$ma#u$ma'j$ma(Q$ma(`$ma!g$ma!S$ma'h$mao$ma!X$ma%`$ma!a$ma~P$ dO#c${aP${aX${a^${ak${az${a!V${a!e${a!f${a!h${a!l${a#f${a#g${a#h${a#i${a#j${a#k${a#l${a#m${a#n${a#p${a#r${a#t${a#u${a'j${a(Q${a(`${a!g${a!S${a'h${a#W${ao${a!X${a%`${a!a${a~P#(yO^#Zq!V#Zq'j#Zq'h#Zq!S#Zq!g#Zqo#Zq!X#Zq%`#Zq!a#Zq~P!3jOd'OX!V'OX~P!$uO!V._Od(Za~O!U2}O!V'PX!g'PX~P%QO!V.bO!g([a~O!V.bO!g([a~P!3jO!S3QO~O#x!ja!W!ja~PI{O#x!ba!V!ba!W!ba~P#?dO#x!na!W!na~P!6TO#x!pa!W!pa~P!8nO!X3dO$TfO$^3eO~O!W3iO~Oo3jO~P#(yO^$gq!V$gq'j$gq'h$gq!S$gq!g$gqo$gq!X$gq%`$gq!a$gq~P!3jO!S3kO~Ol.}O'uTO'xUO~Oy)sO|)tO(h)xOg%Wi(g%Wi!V%Wi#W%Wi~Od%Wi#x%Wi~P$HbOy)sO|)tOg%Yi(g%Yi(h%Yi!V%Yi#W%Yi~Od%Yi#x%Yi~P$ITO(`$WO~P#(yO!U3nO's%eO!V'YX!g'YX~O!V/VO!g(ma~O!V/VO!a#rO!g(ma~O!V/VO!a#rO(`'dO!g(ma~Od$ti!V$ti#W$ti#x$ti~P!-jO!U3vO's*UO!S'[X!V'[X~P!.XO!V/_O!S(na~O!V/_O!S(na~P#(yO!a#rO~O!a#rO#n4OO~Ok4RO!a#rO(`'dO~Od(Oi!V(Oi~P!-jO#W4UOd(Oi!V(Oi~P!-jO!g4XO~O^$hq!V$hq'j$hq'h$hq!S$hq!g$hqo$hq!X$hq%`$hq!a$hq~P!3jO!V4]O!X(oX~P#(yO!f#tO~P3zO!X$rX%TYX^$rX!V$rX'j$rX~P!,aO%T4_OghXyhX|hX!XhX(ghX(hhX^hX!VhX'jhX~O%T4_O~O%a4fO's+WO'uTO'xUO!V'eX!W'eX~O!V0_O!W(ua~OX4jO~O]4kO~O!S4oO~O^%^O'j%^O~P#(yO!X$yO~P#(yO!V4tO#W4vO!W(rX~O!W4wO~Ol!kO|4yO![5WO!]4}O!^4}O!x;oO!|5VO!}5UO#O5UO#P5TO#S5SO#T!wO't!iO'uTO'xUO(T!jO(_!nO~O!W5RO~P%#XOg5]O!X0zO%`5[O~Og5]O!X0zO%`5[O'|%OO~O's#jO!V'dX!W'dX~O!V1VO!W(sa~O'uTO'xUO(T5fO~O]5jO~O!g5mO~P%QO^5oO~O^5oO~P%QO#n5qO&Q5rO~PMPO_1mO!W5vO&`1lO~P`O!a5xO~O!a5zO!V(Yi!W(Yi!a(Yi!h(Yi'|(Yi~O!V#`i!W#`i~P#?dO#W5{O!V#`i!W#`i~O!V!Zi!W!Zi~P#?dO^%^O#W6UO'j%^O~O^%^O!a#rO#W6UO'j%^O~O^%^O!a#rO!l6ZO#W6UO'j%^O(`'dO~O!h%ZO'|%OO~P%(fO!]6[O!^6[O't!iO~PBtO![6_O!]6[O!^6[O#S6`O#T6`O't!iO~PBtO!V(]O!g(aq~O!V(bq!g(bq^(bq'j(bq~P!3jO|%vO!X%wO#b6dO's%eO~O!X'QO%`6gO~Og6jO!X'QO%`6gO~O#c%WiP%WiX%Wi^%Wik%Wiz%Wi!e%Wi!f%Wi!h%Wi!l%Wi#f%Wi#g%Wi#h%Wi#i%Wi#j%Wi#k%Wi#l%Wi#m%Wi#n%Wi#p%Wi#r%Wi#t%Wi#u%Wi'j%Wi(Q%Wi(`%Wi!g%Wi!S%Wi'h%Wio%Wi!X%Wi%`%Wi!a%Wi~P$HbO#c%YiP%YiX%Yi^%Yik%Yiz%Yi!e%Yi!f%Yi!h%Yi!l%Yi#f%Yi#g%Yi#h%Yi#i%Yi#j%Yi#k%Yi#l%Yi#m%Yi#n%Yi#p%Yi#r%Yi#t%Yi#u%Yi'j%Yi(Q%Yi(`%Yi!g%Yi!S%Yi'h%Yio%Yi!X%Yi%`%Yi!a%Yi~P$ITO#c$tiP$tiX$ti^$tik$tiz$ti!V$ti!e$ti!f$ti!h$ti!l$ti#f$ti#g$ti#h$ti#i$ti#j$ti#k$ti#l$ti#m$ti#n$ti#p$ti#r$ti#t$ti#u$ti'j$ti(Q$ti(`$ti!g$ti!S$ti'h$ti#W$tio$ti!X$ti%`$ti!a$ti~P#(yOd'Oa!V'Oa~P!-jO!V'Pa!g'Pa~P!3jO!V.bO!g([i~O#x#Zi!V#Zi!W#Zi~P#?dOP$YOy#vOz#wO|#xO!f#tO!h#uO!l$YO(QVOX#eik#ei!e#ei#g#ei#h#ei#i#ei#j#ei#k#ei#l#ei#m#ei#n#ei#p#ei#r#ei#t#ei#u#ei#x#ei(`#ei(g#ei(h#ei!V#ei!W#ei~O#f#ei~P%2xO#f;wO~P%2xOP$YOy#vOz#wO|#xO!f#tO!h#uO!l$YO#f;wO#g;xO#h;xO#i;xO(QVOX#ei!e#ei#j#ei#k#ei#l#ei#m#ei#n#ei#p#ei#r#ei#t#ei#u#ei#x#ei(`#ei(g#ei(h#ei!V#ei!W#ei~Ok#ei~P%5TOk;yO~P%5TOP$YOk;yOy#vOz#wO|#xO!f#tO!h#uO!l$YO#f;wO#g;xO#h;xO#i;xO#j;zO(QVO#p#ei#r#ei#t#ei#u#ei#x#ei(`#ei(g#ei(h#ei!V#ei!W#ei~OX#ei!e#ei#k#ei#l#ei#m#ei#n#ei~P%7`OX<VO!e;{O#k;{O#l;{O#m<UO#n;{O~P%7`OP$YOX<VOk;yOy#vOz#wO|#xO!e;{O!f#tO!h#uO!l$YO#f;wO#g;xO#h;xO#i;xO#j;zO#k;{O#l;{O#m<UO#n;{O#p;|O(QVO#r#ei#t#ei#u#ei#x#ei(`#ei(h#ei!V#ei!W#ei~O(g#ei~P%9zO(g#yO~P%9zOP$YOX<VOk;yOy#vOz#wO|#xO!e;{O!f#tO!h#uO!l$YO#f;wO#g;xO#h;xO#i;xO#j;zO#k;{O#l;{O#m<UO#n;{O#p;|O#r<OO(QVO(g#yO#t#ei#u#ei#x#ei(`#ei!V#ei!W#ei~O(h#ei~P%<VO(h#zO~P%<VOP$YOX<VOk;yOy#vOz#wO|#xO!e;{O!f#tO!h#uO!l$YO#f;wO#g;xO#h;xO#i;xO#j;zO#k;{O#l;{O#m<UO#n;{O#p;|O#r<OO#t<QO(QVO(g#yO(h#zO~O#u#ei#x#ei(`#ei!V#ei!W#ei~P%>bO^#vy!V#vy'j#vy'h#vy!S#vy!g#vyo#vy!X#vy%`#vy!a#vy~P!3jOg=jOy)sO|)tO(g)vO(h)xO~OP#eiX#eik#eiz#ei!e#ei!f#ei!h#ei!l#ei#f#ei#g#ei#h#ei#i#ei#j#ei#k#ei#l#ei#m#ei#n#ei#p#ei#r#ei#t#ei#u#ei#x#ei(Q#ei(`#ei!V#ei!W#ei~P%AYO!f#tOP(PXX(PXg(PXk(PXy(PXz(PX|(PX!e(PX!h(PX!l(PX#f(PX#g(PX#h(PX#i(PX#j(PX#k(PX#l(PX#m(PX#n(PX#p(PX#r(PX#t(PX#u(PX#x(PX(Q(PX(`(PX(g(PX(h(PX!V(PX!W(PX~O#x#yi!V#yi!W#yi~P#?dO#x!ni!W!ni~P$!qO!W6vO~O!V'Xa!W'Xa~P#?dO!a#rO(`'dO!V'Ya!g'Ya~O!V/VO!g(mi~O!V/VO!a#rO!g(mi~Od$tq!V$tq#W$tq#x$tq~P!-jO!S'[a!V'[a~P#(yO!a6}O~O!V/_O!S(ni~P#(yO!V/_O!S(ni~O!S7RO~O!a#rO#n7WO~Ok7XO!a#rO(`'dO~O!S7ZO~Od$vq!V$vq#W$vq#x$vq~P!-jO^$hy!V$hy'j$hy'h$hy!S$hy!g$hyo$hy!X$hy%`$hy!a$hy~P!3jO!V4]O!X(oa~O^#Zy!V#Zy'j#Zy'h#Zy!S#Zy!g#Zyo#Zy!X#Zy%`#Zy!a#Zy~P!3jOX7`O~O!V0_O!W(ui~O]7fO~O!a5zO~O(T(qO!V'aX!W'aX~O!V4tO!W(ra~O!h%ZO'|%OO^(YX!a(YX!l(YX#W(YX'j(YX(`(YX~O's7oO~P.[O!x;oO!|7rO!}7qO#O7qO#P7pO#S'bO#T'bO~PBtO^%^O!a#rO!l'hO#W'fO'j%^O(`'dO~O!W7vO~P%#XOl!kO'uTO'xUO(T!jO(_!nO~O|7wO~P%MdO![7{O!]7zO!^7zO#P7pO#S'bO#T'bO't!iO~PBtO![7{O!]7zO!^7zO!}7|O#O7|O#P7pO#S'bO#T'bO't!iO~PBtO!]7zO!^7zO't!iO(T!jO(_!nO~O!X0zO~O!X0zO%`8OO~Og8RO!X0zO%`8OO~OX8WO!V'da!W'da~O!V1VO!W(si~O!g8[O~O!g8]O~O!g8^O~O!g8^O~P%QO^8`O~O!a8cO~O!g8dO~O!V(ei!W(ei~P#?dO^%^O#W8lO'j%^O~O^%^O!a#rO#W8lO'j%^O~O^%^O!a#rO!l8pO#W8lO'j%^O(`'dO~O!h%ZO'|%OO~P&$QO!]8qO!^8qO't!iO~PBtO!V(]O!g(ay~O!V(by!g(by^(by'j(by~P!3jO!X'QO%`8uO~O#c$tqP$tqX$tq^$tqk$tqz$tq!V$tq!e$tq!f$tq!h$tq!l$tq#f$tq#g$tq#h$tq#i$tq#j$tq#k$tq#l$tq#m$tq#n$tq#p$tq#r$tq#t$tq#u$tq'j$tq(Q$tq(`$tq!g$tq!S$tq'h$tq#W$tqo$tq!X$tq%`$tq!a$tq~P#(yO#c$vqP$vqX$vq^$vqk$vqz$vq!V$vq!e$vq!f$vq!h$vq!l$vq#f$vq#g$vq#h$vq#i$vq#j$vq#k$vq#l$vq#m$vq#n$vq#p$vq#r$vq#t$vq#u$vq'j$vq(Q$vq(`$vq!g$vq!S$vq'h$vq#W$vqo$vq!X$vq%`$vq!a$vq~P#(yO!V'Pi!g'Pi~P!3jO#x#Zq!V#Zq!W#Zq~P#?dOy/yOz/yO|/zOPvaXvagvakva!eva!fva!hva!lva#fva#gva#hva#iva#jva#kva#lva#mva#nva#pva#rva#tva#uva#xva(Qva(`va(gva(hva!Vva!Wva~Oy)sO|)tOP$kaX$kag$kak$kaz$ka!e$ka!f$ka!h$ka!l$ka#f$ka#g$ka#h$ka#i$ka#j$ka#k$ka#l$ka#m$ka#n$ka#p$ka#r$ka#t$ka#u$ka#x$ka(Q$ka(`$ka(g$ka(h$ka!V$ka!W$ka~Oy)sO|)tOP$maX$mag$mak$maz$ma!e$ma!f$ma!h$ma!l$ma#f$ma#g$ma#h$ma#i$ma#j$ma#k$ma#l$ma#m$ma#n$ma#p$ma#r$ma#t$ma#u$ma#x$ma(Q$ma(`$ma(g$ma(h$ma!V$ma!W$ma~OP${aX${ak${az${a!e${a!f${a!h${a!l${a#f${a#g${a#h${a#i${a#j${a#k${a#l${a#m${a#n${a#p${a#r${a#t${a#u${a#x${a(Q${a(`${a!V${a!W${a~P%AYO#x$gq!V$gq!W$gq~P#?dO#x$hq!V$hq!W$hq~P#?dO!W9PO~O#x9QO~P!-jO!a#rO!V'Yi!g'Yi~O!a#rO(`'dO!V'Yi!g'Yi~O!V/VO!g(mq~O!S'[i!V'[i~P#(yO!V/_O!S(nq~O!S9WO~P#(yO!S9WO~Od(Oy!V(Oy~P!-jO!V'_a!X'_a~P#(yO!X%Sq^%Sq!V%Sq'j%Sq~P#(yOX9]O~O!V0_O!W(uq~O#W9aO!V'aa!W'aa~O!V4tO!W(ri~P#?dOPYXXYXkYXyYXzYX|YX!SYX!VYX!eYX!fYX!hYX!lYX#WYX#ccX#fYX#gYX#hYX#iYX#jYX#kYX#lYX#mYX#nYX#pYX#rYX#tYX#uYX#zYX(QYX(`YX(gYX(hYX~O!a%QX#n%QX~P&6lO#S-cO#T-cO~PBtO#P9eO#S-cO#T-cO~PBtO!}9fO#O9fO#P9eO#S-cO#T-cO~PBtO!]9iO!^9iO't!iO(T!jO(_!nO~O![9lO!]9iO!^9iO#P9eO#S-cO#T-cO't!iO~PBtO!X0zO%`9oO~O'uTO'xUO(T9tO~O!V1VO!W(sq~O!g9wO~O!g9wO~P%QO!g9yO~O!g9zO~O#W9|O!V#`y!W#`y~O!V#`y!W#`y~P#?dO^%^O#W:QO'j%^O~O^%^O!a#rO#W:QO'j%^O~O^%^O!a#rO!l:UO#W:QO'j%^O(`'dO~O!X'QO%`:XO~O#x#vy!V#vy!W#vy~P#?dOP$tiX$tik$tiz$ti!e$ti!f$ti!h$ti!l$ti#f$ti#g$ti#h$ti#i$ti#j$ti#k$ti#l$ti#m$ti#n$ti#p$ti#r$ti#t$ti#u$ti#x$ti(Q$ti(`$ti!V$ti!W$ti~P%AYOy)sO|)tO(h)xOP%WiX%Wig%Wik%Wiz%Wi!e%Wi!f%Wi!h%Wi!l%Wi#f%Wi#g%Wi#h%Wi#i%Wi#j%Wi#k%Wi#l%Wi#m%Wi#n%Wi#p%Wi#r%Wi#t%Wi#u%Wi#x%Wi(Q%Wi(`%Wi(g%Wi!V%Wi!W%Wi~Oy)sO|)tOP%YiX%Yig%Yik%Yiz%Yi!e%Yi!f%Yi!h%Yi!l%Yi#f%Yi#g%Yi#h%Yi#i%Yi#j%Yi#k%Yi#l%Yi#m%Yi#n%Yi#p%Yi#r%Yi#t%Yi#u%Yi#x%Yi(Q%Yi(`%Yi(g%Yi(h%Yi!V%Yi!W%Yi~O#x$hy!V$hy!W$hy~P#?dO#x#Zy!V#Zy!W#Zy~P#?dO!a#rO!V'Yq!g'Yq~O!V/VO!g(my~O!S'[q!V'[q~P#(yO!S:`O~P#(yO!V0_O!W(uy~O!V4tO!W(rq~O#S2fO#T2fO~PBtO#P:gO#S2fO#T2fO~PBtO!]:kO!^:kO't!iO(T!jO(_!nO~O!X0zO%`:nO~O!g:qO~O^%^O#W:vO'j%^O~O^%^O!a#rO#W:vO'j%^O~O!X'QO%`:{O~OP$tqX$tqk$tqz$tq!e$tq!f$tq!h$tq!l$tq#f$tq#g$tq#h$tq#i$tq#j$tq#k$tq#l$tq#m$tq#n$tq#p$tq#r$tq#t$tq#u$tq#x$tq(Q$tq(`$tq!V$tq!W$tq~P%AYOP$vqX$vqk$vqz$vq!e$vq!f$vq!h$vq!l$vq#f$vq#g$vq#h$vq#i$vq#j$vq#k$vq#l$vq#m$vq#n$vq#p$vq#r$vq#t$vq#u$vq#x$vq(Q$vq(`$vq!V$vq!W$vq~P%AYOd%[!Z!V%[!Z#W%[!Z#x%[!Z~P!-jO!V'aq!W'aq~P#?dO#S6`O#T6`O~PBtO!V#`!Z!W#`!Z~P#?dO^%^O#W;ZO'j%^O~O#c%[!ZP%[!ZX%[!Z^%[!Zk%[!Zz%[!Z!V%[!Z!e%[!Z!f%[!Z!h%[!Z!l%[!Z#f%[!Z#g%[!Z#h%[!Z#i%[!Z#j%[!Z#k%[!Z#l%[!Z#m%[!Z#n%[!Z#p%[!Z#r%[!Z#t%[!Z#u%[!Z'j%[!Z(Q%[!Z(`%[!Z!g%[!Z!S%[!Z'h%[!Z#W%[!Zo%[!Z!X%[!Z%`%[!Z!a%[!Z~P#(yOP%[!ZX%[!Zk%[!Zz%[!Z!e%[!Z!f%[!Z!h%[!Z!l%[!Z#f%[!Z#g%[!Z#h%[!Z#i%[!Z#j%[!Z#k%[!Z#l%[!Z#m%[!Z#n%[!Z#p%[!Z#r%[!Z#t%[!Z#u%[!Z#x%[!Z(Q%[!Z(`%[!Z!V%[!Z!W%[!Z~P%AYOo(UX~P1dO't!iO~P!'RO!ScX!VcX#WcX~P&6lOPYXXYXkYXyYXzYX|YX!VYX!VcX!eYX!fYX!hYX!lYX#WYX#WcX#ccX#fYX#gYX#hYX#iYX#jYX#kYX#lYX#mYX#nYX#pYX#rYX#tYX#uYX#zYX(QYX(`YX(gYX(hYX~O!acX!gYX!gcX(`cX~P'!sOP;nOQ;nOa=_Ob!fOikOk;nOlkOmkOskOu;nOw;nO|WO!QkO!RkO!XXO!c;qO!hZO!k;nO!l;nO!m;nO!o;rO!q;sO!t!eO$P!hO$TfO's)RO'uTO'xUO(QVO(_[O(l=]O~O!V<SO!W$ja~Oi%POk$qOl$pOm$pOs%QOu%ROw<YO|$xO!X$yO!c=dO!h$uO#b<`O$P%VO$l<[O$n<^O$q%WO's(iO'uTO'xUO'|%OO(Q$rO~O#o)YO~P''iO!WYX!WcX~P'!sO#c;vO~O!a#rO#c;vO~O#W<WO~O#n;{O~O#W<bO!V(eX!W(eX~O#W<WO!V(cX!W(cX~O#c<cO~Od<eO~P!-jO#c<jO~O#c<kO~O!a#rO#c<lO~O!a#rO#c<cO~O#x<mO~P#?dO#c<nO~O#c<oO~O#c<pO~O#c<qO~O#c<rO~O#c<sO~O#x<tO~P!-jO#x<uO~P!-jO$T~!f!|#O#P#S#a#b#m(l$l$n$q%T%_%`%a%g%i%l%m%o%q~'nR$T(l#g!R'l't#hl#f#iky'm(T'm's$V$X$V~",
  goto: "$/X(yPPPP(zP(}P)_P+a/fPPPP6iPP7OP<|@mPAQPAQPPPAQPBpPAQPAQPAQPBtPPByPCdPH`PPPHdPPPPHdKfPPPKlMlPHdP!!SPPPP!$eHdPPPHdPHdP!&vHdP!*]!+_!+dP!,U!,Y!,UPPPP!/f!1kPP!1t!3OP!+_HdHd!6b!9m!>v!>v!BnPPP!BuHdPPPPPPPPPPP!FTP!GiPPHd!HyPHdPHdHdHdHdPHd!J`PP!MiP#!nP#!r#!|##Q##QP!MfP##U##UP#&ZP#&_HdHd#&e#)iAQPAQPAQAQP#*sAQAQ#,mAQ#.zAQ#0nAQAQ#1[#3W#3W#3[#3d#3W#3lP#3WPAQ#4hAQ#5pAQAQ6iPPP#6{PP#7e#7eP#7eP#7z#7ePP#8QP#7wP#7w#8d!1p#7w#9O#9U6f(}#9X(}P#9`#9`#9`P(}P(}P(}P(}PP(}P#9f#9iP#9i(}P#9mP#9pP(}P(}P(}P(}P(}P(}(}PP#9v#9|#:W#:^#:d#:j#:p#;O#;U#;[#;f#;l#<h#<w#<}#=a#=g#=m#={#>b#?r#@Q#@W#@^#@d#@j#@t#@z#AQ#A[#An#AtPPPPPPPPPP#AzPPPPPPP#Bn#FYP#Gu#G|#HUPPPP#L`$ U$'t$'w$'z$)w$)z$)}$*UPP$*[$*`$+X$,X$,]$,qPP$,u$,{$-PP$-S$-W$-Z$.P$.g$.l$.o$.r$.x$.{$/P$/TR!yRmpOXr!X#a%]&d&f&g&i,^,c1g1jU!pQ'Q-OQ%ctQ%kwQ%rzQ&[!TS&x!c,vQ'W!f[']!m!r!s!t!u!vS*[$y*aQ+U%lQ+c%tQ+}&UQ,|'PQ-W'XW-`'^'_'`'aQ/p*cQ1U,OU2b-b-d-eS4}0z5QS6[2e2gU7z5U5V5WQ8q6_S9i7{7|Q:k9lR<a;r%QdOPWXYZrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&d&f&g&i&m&u'S'f'v'x(O(Y(k(o(s)r*t+h,Y,^,c-S-[-o-x.b.i/z0P0^0}1_1`1a1c1g1j1l2]2k2}4y5]5o5q5r6U7w8R8`8l:Q:v;ZS#m];o!r)T$X$j&y)g,o,r.q1{3d4v5{9a9|;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`Q*l%SQ+Z%nQ,P&XQ,W&aQ.X<XQ0T*|Q0X+OQ0d+[Q1^,UQ2q.UQ4e0_Q5d1VQ6i2uQ6o<YQ7b4fR8x6j'OkOPWXYZrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j%]%c%p&]&`&a&d&f&g&i&m&u&y'S'f'v'x(O(Y(k(o(s)g)r*t*|+h,Y,^,c,o,r-S-[-o-x.U.b.i.q/z0P0^0}1_1`1a1c1g1j1l1{2]2k2u2}3d4v4y5]5o5q5r5{6U6j7w8R8`8l9a9|:Q:v;Z;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`#S!kQ!m!p!r!s!t!u!v!w&x'P'Q']'^'_'`'a'b,v,|-O-`-b-c-d-e0z2b2e2f2g4z5Q5S5T5U5V6[6_6`7p7q7r7|8q9e9f:g$Y$pi#r#t$`$a$u$x%T%U%Y)n)w)y)z*R*X*g*h*{+O+m+p.T._/^/_/a/|0q0t0|2t3l3v4O4U4]4_5[6g6}7W8O8u9Q9o:X:n:{<U<V<Z<[<]<^<_<`<f<g<h<i<j<k<n<o<p<q<t<u=]=e=f=i=jQ%uzQ&v!cS&|%w,yQ+Z%nS.})t/PQ/{*pQ0d+[Q0i+bQ1],TQ1^,UQ4e0_Q4n0kQ5g1XQ5h1[Q7b4fQ7e4kQ8Z5jQ9`7fR9u8WpmOXr!T!X#a%]&Z&d&f&g&i,^,c1g1jR,R&]&x`OPXYrstux!X!^!g!l#P#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j%]%c%p&]&`&a&d&f&g&i&m&u'S'f'x(O(Y(k(o(s)g)r*t*|+h,Y,^,c,o,r-S-[-o-x.U.b.i.q/z0P0^0}1_1`1a1c1g1j1l1{2]2k2u2}3d4v4y5]5o5q5r5{6U6j7w8R8`8l9a9|:Q:v;Z;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=_=`[#YWZ#T#W&y'vQ%fvQ%jwS%oz%t!U%x|}#d#f#i%Z%v(P(W(X(]+f+g+i,[,p-s-v-z-{-}1o2m2n5z6dQ&Q!RQ'T!eQ'V!fQ(d#oS*O$u*SS+T%k%lQ+X%nQ+x&SQ+|&US-V'W'XQ.W(eQ/Z*PQ0]+UQ0c+[Q0e+]Q0h+aQ1P+yS1T+},OQ2X-WQ3m/VQ4d0_Q4h0bQ4m0jQ5c1UQ6z3nQ7a4fQ7d4jQ9[7`R:b9]v$wi#t%T%U%Y)w)y*R*g*h._/^/|3l4U9Q=]=e=f!`%hw!f!o%j%k%l&w'V'W'X'['i*Z+T+U,s-V-W-_-a/h0]2Q2X2`2d4Q6Y6^8o:TQ*}%fQ+n%}Q+q&OQ+{&UQ.V(dQ1O+xU1S+|+},OQ2v.WQ5^1PS5b1T1US7n4x4|Q8V5cU9g7s7x7yU:i9h9j9kQ;R:jQ;a;S!z=a#r$`$a$u$x)n)z*X*{+O+m+p.T/_/a0q0t0|2t3v4O4]4_5[6g6}7W8O8u9o:X:n:{<Z<]<_<f<h<j<n<p<t=i=jg=b<U<V<[<^<`<g<i<k<o<q<uW$|i%O*i=]S%}!O&ZQ&O!PQ&P!QR+l%{$Z${i#r#t$`$a$u$x%T%U%Y)n)w)y)z*R*X*g*h*{+O+m+p.T._/^/_/a/|0q0t0|2t3l3v4O4U4]4_5[6g6}7W8O8u9Q9o:X:n:{<U<V<Z<[<]<^<_<`<f<g<h<i<j<k<n<o<p<q<t<u=]=e=f=i=jT)o$r)pV*m%S<X<YU&|!c%w,yS(r#v#wQ+`%qS.P(`(aQ0u+rQ4V/yR7j4t'OkOPWXYZrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j%]%c%p&]&`&a&d&f&g&i&m&u&y'S'f'v'x(O(Y(k(o(s)g)r*t*|+h,Y,^,c,o,r-S-[-o-x.U.b.i.q/z0P0^0}1_1`1a1c1g1j1l1{2]2k2u2}3d4v4y5]5o5q5r5{6U6j7w8R8`8l9a9|:Q:v;Z;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`$o$]c#V#b%a%b%d'u'{(g(n(v(w(x(y(z({(|(})O)P)Q)S)V)Z)e*y+_,t-h-m-r-w.^.d.h.j.k.l.{/}1v1y2Z2j2|3R3S3T3U3V3W3X3Y3Z3[3]3^3_3b3c3h4Z4b5}6T6b6m6n6s6t7l8f8j8y8}9O:O:d:r:t;X;d;p=ST#QV#R'PkOPWXYZrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j%]%c%p&]&`&a&d&f&g&i&m&u&y'S'f'v'x(O(Y(k(o(s)g)r*t*|+h,Y,^,c,o,r-S-[-o-x.U.b.i.q/z0P0^0}1_1`1a1c1g1j1l1{2]2k2u2}3d4v4y5]5o5q5r5{6U6j7w8R8`8l9a9|:Q:v;Z;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`Q&z!cR1|,v!z!kQ!c!m!p!r!s!t!u!v!w&x'P'Q']'^'_'`'a'b,v,|-O-`-b-c-d-e2b2e2f2g4z5S5T6[6_6`7p7q7r8q9e9f:gS*Z$y*aS/h*[*cQ/q*dQ0w+tQ4Q/pQ4T/sS4x0z5QS7s4}5WS7x5U5VS9h7z7{Q9j7|S:j9i9lR;S:klpOXr!X#a%]&d&f&g&i,^,c1g1jQ&k![Q'j!tS(f#q;vQ+R%iQ+v&QQ+w&RQ-T'UQ-g'cS.](k<cS0O*t<lQ0Z+SQ0y+uQ1n,eQ1p,fQ1x,qQ2V-UQ2Y-YS4[0P<rQ4`0[S4c0^<sQ5|1zQ6Q2WQ6V2_Q7_4aQ8g6OQ8h6RQ8k6WQ9{8dQ:P8mQ:u:RR;Y:w$j$[c#V#b%b%d'u'{(g(n(v(w(x(y(z({(|(})O)P)Q)S)V)Z)e*y+_,t-h-m-r-w.^.d.h.k.l.{/}1v1y2Z2j2|3R3S3T3U3V3W3X3Y3Z3[3]3^3_3b3c3h4Z4b5}6T6b6m6n6s6t7l8f8j8y8}9O:O:d:r:t;X;d;p=SS(c#l'ZU*f$z(j3aS*x%a.jQ2r0TQ6f2qQ8w6iR:Y8x$j$Zc#V#b%b%d'u'{(g(n(v(w(x(y(z({(|(})O)P)Q)S)V)Z)e*y+_,t-h-m-r-w.^.d.h.k.l.{/}1v1y2Z2j2|3R3S3T3U3V3W3X3Y3Z3[3]3^3_3b3c3h4Z4b5}6T6b6m6n6s6t7l8f8j8y8}9O:O:d:r:t;X;d;p=SS(b#l'ZS(t#w$[S*w%a.jS.Q(a(cQ.m)UQ0Q*xR2o.R'OkOPWXYZrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j%]%c%p&]&`&a&d&f&g&i&m&u&y'S'f'v'x(O(Y(k(o(s)g)r*t*|+h,Y,^,c,o,r-S-[-o-x.U.b.i.q/z0P0^0}1_1`1a1c1g1j1l1{2]2k2u2}3d4v4y5]5o5q5r5{6U6j7w8R8`8l9a9|:Q:v;Z;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`S#m];oQ&f!VQ&g!WQ&i!YQ&j!ZR1f,aQ'R!eQ*z%fQ-R'TS.S(d*}Q2T-QW2s.V.W0S0UQ6P2UU6e2p2r2vS8t6f6hS:W8v8wS:y:V:YQ;[:zR;e;]V!qQ'Q-O!_^OQXZ_r!T!X!m#a#d%Z%]&Z&]&d&f&g&i'Q(],^,c-O-z0z1g1j4z5QT#m];o%[yOPWXYZrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&a&d&f&g&i&m&u'S'f'v'x(O(Y(k(o(s)r*t*|+h,Y,^,c-S-[-o-x.U.b.i/z0P0^0}1_1`1a1c1g1j1l2]2k2u2}4y5]5o5q5r6U6j7w8R8`8l:Q:v;ZS(r#v#wS.P(`(a!s<y$X$j&y)g,o,r.q1{3d4v5{9a9|;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`U!oQ'Q-OY'[!m!s!t!u!vS'i!p!rW'k!w4z5S5TS-_']'^U-a'_'`'aW-f'b7p7q7rS2`-`-bU2c-c9e9fS2d-d-eS4|0z5QS6Y2b2eS6]2f:gQ6^2gS7s4}5WS7y5U5VS8o6[6_Q8r6`S9h7z7{Q9k7|Q:T8qS:j9i9lR;S:kU!qQ'Q-OT5O0z5QU'h!o4{4|S([#e1dU-^'['k7yQ/Y*OQ/f*ZU2a-a-f9kQ3r/ZS3{/g/qS6Z2c2dQ6y3mS7U4R4TS8p6]6^Q9S6zQ9Z7XR:U8rQ#sbU'g!o4{4|S(Z#e1dQ*u%[Q+P%gQ+V%mW-]'['h'k7yQ-y([Q/X*OQ/e*ZQ/k*^Q0Y+QQ1Q+zW2^-^-a-f9kS3q/Y/ZS3z/f/qQ3}/jQ4P/lQ5`1RU6X2a2c2dQ6x3mQ6|3rS7Q3{4TQ7V4SQ8T5aU8n6Z6]6^S9R6y6zQ9V7RQ9X7UQ9c7mQ9r8US:S8p8rQ:^9SQ:_9WQ:a9ZQ:f9dQ:p9sQ:x:UQ:}:`Q;P:hQ;_;QQ;h;`Q;l;iQ<|<wQ=X=QR=Y=R%[aOPWXYZrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&a&d&f&g&i&m&u'S'f'v'x(O(Y(k(o(s)r*t*|+h,Y,^,c-S-[-o-x.U.b.i/z0P0^0}1_1`1a1c1g1j1l2]2k2u2}4y5]5o5q5r6U6j7w8R8`8l:Q:v;ZS#sx!g!r<v$X$j&y)g,o,r.q1{3d4v5{9a9|;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`R<|=_%[bOPWXYZrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&a&d&f&g&i&m&u'S'f'v'x(O(Y(k(o(s)r*t*|+h,Y,^,c-S-[-o-x.U.b.i/z0P0^0}1_1`1a1c1g1j1l2]2k2u2}4y5]5o5q5r6U6j7w8R8`8l:Q:v;ZQ%[j!`%gw!f!o%j%k%l&w'V'W'X'['i*Z+T+U,s-V-W-_-a/h0]2Q2X2`2d4Q6Y6^8o:TS%mx!gQ+Q%hQ+z&UW1R+{+|+},OU5a1S1T1US7m4x4|S8U5b5cW9d7n7s7x7yQ9s8VW:h9g9h9j9kS;Q:i:jS;`;R;SQ;i;a!r<w$X$j&y)g,o,r.q1{3d4v5{9a9|;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`Q=Q=^R=R=_%OeOPXYrstu!X!^!l#P#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&d&f&g&i&m&u'S'f'x(O(Y(k(o(s)r*t*|+h,Y,^,c-S-[-o-x.U.b.i/z0P0^0}1_1`1a1c1g1j1l2]2k2u2}4y5]5o5q5r6U6j7w8R8`8l:Q:v;ZY#_WZ#T#W'v!U%x|}#d#f#i%Z%v(P(W(X(]+f+g+i,[,p-s-v-z-{-}1o2m2n5z6dQ,X&a!p<x$X$j)g,o,r.q1{3d4v5{9a9|;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`R<{&yS&}!c%wR2O,y%QdOPWXYZrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&d&f&g&i&m&u'S'f'v'x(O(Y(k(o(s)r*t+h,Y,^,c-S-[-o-x.b.i/z0P0^0}1_1`1a1c1g1j1l2]2k2}4y5]5o5q5r6U7w8R8`8l:Q:v;Z!r)T$X$j&y)g,o,r.q1{3d4v5{9a9|;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`Q,W&aQ0T*|Q2q.UQ6i2uR8x6j!l$Rc#V%a'u'{(g(n(})O)P)Q)V)Z+_-h-m-r-w.^.d.{/}2Z2j2|3_4Z4b6T6b6m8j:O:t;X;d;p!T;})S)e,t.j1v1y3R3Z3[3]3^3b3h5}6n6s6t7l8f8y8}9O:d:r=S!h$Tc#V%a'u'{(g(n)P)Q)V)Z+_-h-m-r-w.^.d.{/}2Z2j2|3_4Z4b6T6b6m8j:O:t;X;d;p!P<P)S)e,t.j1v1y3R3]3^3b3h5}6n6s6t7l8f8y8}9O:d:r=S!d$Xc#V%a'u'{(g(n)V)Z+_-h-m-r-w.^.d.{/}2Z2j2|3_4Z4b6T6b6m8j:O:t;X;d;pQ3l/Tz=`)S)e,t.j1v1y3R3b3h5}6n6s6t7l8f8y8}9O:d:r=SQ=e=gR=f=h'OkOPWXYZrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j%]%c%p&]&`&a&d&f&g&i&m&u&y'S'f'v'x(O(Y(k(o(s)g)r*t*|+h,Y,^,c,o,r-S-[-o-x.U.b.i.q/z0P0^0}1_1`1a1c1g1j1l1{2]2k2u2}3d4v4y5]5o5q5r5{6U6j7w8R8`8l9a9|:Q:v;Z;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`S$kh$lR3e.p'VgOPWXYZhrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j$l%]%c%p&]&`&a&d&f&g&i&m&u&y'S'f'v'x(O(Y(k(o(s)g)r*t*|+h,Y,^,c,o,r-S-[-o-x.U.b.i.p.q/z0P0^0}1_1`1a1c1g1j1l1{2]2k2u2}3d4v4y5]5o5q5r5{6U6j7w8R8`8l9a9|:Q:v;Z;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`T$gf$mQ$efS)^$h)bR)j$mT$ff$mT)`$h)b'VhOPWXYZhrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j$l%]%c%p&]&`&a&d&f&g&i&m&u&y'S'f'v'x(O(Y(k(o(s)g)r*t*|+h,Y,^,c,o,r-S-[-o-x.U.b.i.p.q/z0P0^0}1_1`1a1c1g1j1l1{2]2k2u2}3d4v4y5]5o5q5r5{6U6j7w8R8`8l9a9|:Q:v;Z;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`T$kh$lQ$nhR)i$l%[jOPWXYZrstu!X!^!l#P#T#W#a#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&a&d&f&g&i&m&u'S'f'v'x(O(Y(k(o(s)r*t*|+h,Y,^,c-S-[-o-x.U.b.i/z0P0^0}1_1`1a1c1g1j1l2]2k2u2}4y5]5o5q5r6U6j7w8R8`8l:Q:v;Z!s=^$X$j&y)g,o,r.q1{3d4v5{9a9|;n;q;r;s;v;w;x;y;z;{;|;}<O<P<Q<R<S<W<a<b<c<e<l<m<r<s=`#alOPXZr!X!^!l#P#a#k#x$j%]&]&`&a&d&f&g&i&m&u'S(s)g*|+h,Y,^,c-S.U.q/z0}1_1`1a1c1g1j1l2u3d4y5]5o5q5r6j7w8R8`v$zi#t%T%U%Y)w)y*R*g*h._/^/|3l4U9Q=]=e=f!z(j#r$`$a$u$x)n)z*X*{+O+m+p.T/_/a0q0t0|2t3v4O4]4_5[6g6}7W8O8u9o:X:n:{<Z<]<_<f<h<j<n<p<t=i=jQ*q%WQ.|)sg3a<U<V<[<^<`<g<i<k<o<q<uv$vi#t%T%U%Y)w)y*R*g*h._/^/|3l4U9Q=]=e=fQ*T$wS*^$y*aQ*r%XQ/l*_!z=O#r$`$a$u$x)n)z*X*{+O+m+p.T/_/a0q0t0|2t3v4O4]4_5[6g6}7W8O8u9o:X:n:{<Z<]<_<f<h<j<n<p<t=i=jf=P<U<V<[<^<`<g<i<k<o<q<uQ=T=aQ=U=bQ=V=cR=W=dv$zi#t%T%U%Y)w)y*R*g*h._/^/|3l4U9Q=]=e=f!z(j#r$`$a$u$x)n)z*X*{+O+m+p.T/_/a0q0t0|2t3v4O4]4_5[6g6}7W8O8u9o:X:n:{<Z<]<_<f<h<j<n<p<t=i=jg3a<U<V<[<^<`<g<i<k<o<q<ulnOXr!X#a%]&d&f&g&i,^,c1g1jQ*W$xQ,l&pQ,m&rR3u/_$Y${i#r#t$`$a$u$x%T%U%Y)n)w)y)z*R*X*g*h*{+O+m+p.T._/^/_/a/|0q0t0|2t3l3v4O4U4]4_5[6g6}7W8O8u9Q9o:X:n:{<U<V<Z<[<]<^<_<`<f<g<h<i<j<k<n<o<p<q<t<u=]=e=f=i=jQ+o&OQ0s+qQ4r0rR7i4sT*`$y*aS*`$y*aT5P0z5QS/j*]4yT4S/r7wQ+P%gQ/k*^Q0Y+QQ1Q+zQ5`1RQ8T5aQ9c7mQ9r8UQ:f9dQ:p9sQ;P:hQ;_;QQ;h;`R;l;in)w$s(l*s/]/t/u2z3s4Y6w7Y:]<}=Z=[!W<f(h)X)}*V.[.x/T/b0R0p0r2y3t3x4q4s6k6l7O7S7[7^9U9Y:|=g=h]<g3`6r8z:Z:[;fp)y$s(l*s/R/]/t/u2z3s4Y6w7Y:]<}=Z=[!Y<h(h)X)}*V.[.x/T/b0R0p0r2w2y3t3x4q4s6k6l7O7S7[7^9U9Y:|=g=h_<i3`6r8z8{:Z:[;fpmOXr!T!X#a%]&Z&d&f&g&i,^,c1g1jQ&W!SR,Y&apmOXr!T!X#a%]&Z&d&f&g&i,^,c1g1jR&W!SQ+s&PR0o+lqmOXr!T!X#a%]&Z&d&f&g&i,^,c1g1jQ0{+xS5Z1O1PU7}5X5Y5^S9n8P8QS:l9m9pQ;T:mR;b;UQ&_!TR,S&ZR5g1XS%oz%tR0e+]Q&d!UR,^&eR,d&jT1h,c1jR,h&kQ,g&kR1q,hQ'm!xR-i'mQrOQ#aXT%`r#aQ!{TR'o!{Q#OUR'q#OQ)p$rR.y)pQ#RVR's#RQ#UWU'y#U'z-pQ'z#VR-p'{Q,w&zR1},wQ.`(lR2{.`Q.c(nS3O.c3PR3P.dQ-O'QR2R-Or_OXr!T!X#a%]&Z&]&d&f&g&i,^,c1g1jU!mQ'Q-OS#dZ%ZY#n_!m#d-z4zQ-z(]T4z0z5QS#[W%vU(Q#[(R-qQ(R#]R-q'|Q,z&}R2P,zQ(^#gQ-t(VW.O(^-t2h6aQ2h-uR6a2iQ)b$hR.r)bQ$lhR)h$lQ$_cU)W$_-l<TQ-l;pR<T)eQ/W*OW3o/W3p6{9TU3p/X/Y/ZS6{3q3rR9T6|#m)u$s(h(l)X)}*V*n*o*s.Y.Z.[.x/R/S/T/]/b/t/u0R0p0r2w2x2y2z3`3s3t3x4Y4q4s6k6l6p6q6r6w7O7S7Y7[7^8z8{8|9U9Y:Z:[:]:|;f<}=Z=[=g=hQ/`*VU3w/`3y7PQ3y/bR7P3xQ*a$yR/n*aQ*j$}R/w*jQ4^0RR7]4^Q+j%yR0n+jQ4u0uS7k4u9bR9b7lQ+u&QR0x+uQ5Q0zR7u5QQ1W,PS5e1W8XR8X5gQ0`+XW4g0`4i7c9^Q4i0cQ7c4hR9^7dQ+^%oR0f+^Q1j,cR5u1jWqOXr#aQ&h!XQ*v%]Q,]&dQ,_&fQ,`&gQ,b&iQ1e,^S1h,c1jR5t1gQ%_oQ&l!]Q&o!_Q&q!`Q&s!aU'e!o4{4|Q+e%uQ+k%zQ,R&_Q,j&nY-Z'['g'h'k7yQ/m*`S1Z,S,VQ1r,iQ1s,lQ1t,m[2[-]-^-a-f-h9kQ4l0iQ4p0pQ5_1QQ5i1]Q5s1fY6S2Z2^2a2c2dQ7g4nQ7h4qQ7t5PQ8S5`Q8Y5hY8i6T6X6Z6]6^Q9_7eQ9q8TQ9v8ZW9}8j8n8p8rQ:c9`Q:e9cQ:o9rU:s:O:S:UQ;O:fQ;V:pS;W:t:xQ;^;PQ;c;XQ;g;_Q;j;dQ;k;hR;m;lQ%iwQ'U!fQ'c!oU+S%j%k%lQ,q&wU-U'V'W'XS-Y'['iQ/d*ZS0[+T+UQ1z,sS2W-V-WS2_-_-aQ3|/hQ4a0]Q6O2QQ6R2XS6W2`2dQ7T4QS8m6Y6^Q:R8oR:w:TS$ti=]R*k%OU$}i%O=]R/v*iQ$siS(h#r+OQ(l#tS)X$`$aQ)}$uQ*V$xQ*n%TQ*o%UQ*s%YQ.Y<ZQ.Z<]Q.[<_Q.x)nQ/R)wQ/S)yQ/T)zQ/]*RQ/b*XQ/t*gQ/u*hh0R*{.T0|2t5[6g8O8u9o:X:n:{Q0p+mQ0r+pQ2w<fQ2x<hQ2y<jQ2z._S3`<U<VQ3s/^Q3t/_Q3x/aQ4Y/|Q4q0qQ4s0tQ6k<nQ6l<pQ6p<[Q6q<^Q6r<`Q6w3lQ7O3vQ7S4OQ7Y4UQ7[4]Q7^4_Q8z<kQ8{<gQ8|<iQ9U6}Q9Y7WQ:Z<oQ:[<qQ:]9QQ:|<tQ;f<uQ<}=]Q=Z=eQ=[=fQ=g=iR=h=jloOXr!X#a%]&d&f&g&i,^,c1g1jQ!dPS#cZ#kQ&n!^U'Y!l4y7wQ'r#PQ(u#xQ)f$jS,V&]&`Q,Z&aQ,i&mQ,n&uQ-Q'SQ.f(sQ.v)gQ0U*|Q0l+hQ1b,YQ2U-SQ2r.UQ3g.qQ4W/zQ5Y0}Q5k1_Q5l1`Q5n1aQ5p1cQ5w1lQ6f2uQ6u3dQ8Q5]Q8_5oQ8a5qQ8b5rQ8w6jQ9p8RR9x8`#UcOPXZr!X!^!l#a#k#x%]&]&`&a&d&f&g&i&m&u'S(s*|+h,Y,^,c-S.U/z0}1_1`1a1c1g1j1l2u4y5]5o5q5r6j7w8R8`Q#VWQ#bYQ%asQ%btQ%duS'u#T'xQ'{#WQ(g#qQ(n#uQ(v#{Q(w#|Q(x#}Q(y$OQ(z$PQ({$QQ(|$RQ(}$SQ)O$TQ)P$UQ)Q$VQ)S$XQ)V$^Q)Z$bW)e$j)g.q3dQ*y%cQ+_%pS,t&y1{Q-h'fS-m'v-oQ-r(OQ-w(YQ.^(kQ.d(oQ.h;nQ.j;qQ.k;rQ.l;sQ.{)rQ/}*tQ1v,oQ1y,rQ2Z-[Q2j-xQ2|.bQ3R;vQ3S;wQ3T;xQ3U;yQ3V;zQ3W;{Q3X;|Q3Y;}Q3Z<OQ3[<PQ3]<QQ3^<RQ3_.iQ3b<WQ3c<aQ3h<SQ4Z0PQ4b0^Q5}<bQ6T2]Q6b2kQ6m2}Q6n<cQ6s<eQ6t<lQ7l4vQ8f5{Q8j6UQ8y<mQ8}<rQ9O<sQ:O8lQ:d9aQ:r9|Q:t:QQ;X:vQ;d;ZQ;p#PR=S=`R#XWR&{!cU!oQ'Q-OS&w!c,vY'[!m!s!t!u!vS'i!p!r['k!w4z5S5T5U5VS,s&x'PS-_']'^U-a'_'`'aY-f'b7p7q7r7|Q2Q,|S2`-`-bU2c-c9e9fS2d-d-eS4{0z5QS6Y2b2eS6]2f:gQ6^2gS8o6[6_Q8r6`R:T8qR(m#tR(p#uQ!dQT,}'Q-OQ#l]R'Z;oT#hZ%ZS#gZ%ZU%y|},[U(V#d#f#iS-u(W(XQ-|(]Q0m+iQ2i-vU2l-z-{-}S6c2m2nR8s6d`#ZW#T#W%v'v(P+f-st#eZ|}#d#f#i%Z(W(X(]+i-v-z-{-}2m2n6dQ1d,[Q1w,pQ5y1oQ8e5zT<z&y+gT#^W%vS#]W%vS'w#T(PS'|#W+fS,u&y+gT-n'v-sT'O!c%wQ$hfR)l$mT)a$h)bR3f.pT*Q$u*SR*Y$xQ0S*{Q2p.TQ5X0|Q6h2tQ8P5[Q8v6gQ9m8OQ:V8uQ:m9oQ:z:XQ;U:nR;]:{lpOXr!X#a%]&d&f&g&i,^,c1g1jQ&^!TR,R&ZV%z|},[R0v+rR,Q&XQ%szR+d%tR+Y%nT&b!U&eT&c!U&eT1i,c1j",
  nodeNames: "⚠ ArithOp ArithOp LineComment BlockComment Script ExportDeclaration export Star as VariableName String Escape from ; default FunctionDeclaration async function VariableDefinition > TypeParamList TypeDefinition extends ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType InterpolationEnd Interpolation InterpolationStart NullType null VoidType void TypeofType typeof MemberExpression . ?. PropertyName [ TemplateString Escape Interpolation super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewExpression new TypeArgList CompareOp < ) ( ArgList UnaryExpression delete LogicOp BitOp YieldExpression yield AwaitExpression await ParenthesizedExpression ClassExpression class ClassBody MethodDeclaration Decorator @ MemberExpression PrivatePropertyName CallExpression Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly accessor Optional TypeAnnotation Equals StaticBlock FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp instanceof satisfies in const CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression TaggedTemplateExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXStartTag JSXSelfClosingTag JSXIdentifier JSXBuiltin JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast ArrowFunction TypeParamList SequenceExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature PropertyDefinition CallSignature TypePredicate is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody MethodDeclaration AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try CatchClause catch FinallyClause finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement SingleExpression SingleClassItem",
  maxTerm: 362,
  context: trackNewline,
  nodeProps: [
    ["group", -26, 6, 14, 16, 62, 198, 202, 205, 206, 208, 211, 214, 225, 227, 233, 235, 237, 239, 242, 248, 254, 256, 258, 260, 262, 264, 265, "Statement", -32, 10, 11, 25, 28, 29, 35, 45, 48, 49, 51, 56, 64, 72, 76, 78, 80, 81, 102, 103, 112, 113, 130, 133, 135, 136, 137, 138, 140, 141, 161, 162, 164, "Expression", -23, 24, 26, 30, 34, 36, 38, 165, 167, 169, 170, 172, 173, 174, 176, 177, 178, 180, 181, 182, 192, 194, 196, 197, "Type", -3, 84, 95, 101, "ClassItem"],
    ["openedBy", 31, "InterpolationStart", 50, "[", 54, "{", 69, "(", 142, "JSXStartTag", 154, "JSXStartTag JSXStartCloseTag"],
    ["closedBy", 33, "InterpolationEnd", 44, "]", 55, "}", 70, ")", 143, "JSXSelfCloseEndTag JSXEndTag", 159, "JSXEndTag"]
  ],
  propSources: [jsHighlight],
  skippedNodes: [0, 3, 4, 268],
  repeatNodeCount: 32,
  tokenData: "$>y(CSR!bOX%ZXY+gYZ-yZ[+g[]%Z]^.c^p%Zpq+gqr/mrs3cst:_tu>PuvBavwDxwxGgxyMvyz! Qz{!![{|!%O|}!&]}!O!%O!O!P!'g!P!Q!1w!Q!R#0t!R![#3T![!]#@T!]!^#Aa!^!_#Bk!_!`#GS!`!a#In!a!b#N{!b!c$$z!c!}>P!}#O$&U#O#P$'`#P#Q$,w#Q#R$.R#R#S>P#S#T$/`#T#o$0j#o#p$4z#p#q$5p#q#r$7Q#r#s$8^#s$f%Z$f$g+g$g#BY>P#BY#BZ$9h#BZ$IS>P$IS$I_$9h$I_$I|>P$I|$I}$<s$I}$JO$<s$JO$JT>P$JT$JU$9h$JU$KV>P$KV$KW$9h$KW&FU>P&FU&FV$9h&FV;'S>P;'S;=`BZ<%l?HT>P?HT?HU$9h?HUO>P(n%d_$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&j&hT$c&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c&j&zP;=`<%l&c'|'U]$c&j'y!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!b(SU'y!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!b(iP;=`<%l'}'|(oP;=`<%l&}'[(y]$c&j'vpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(rp)wU'vpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)rp*^P;=`<%l)r'[*dP;=`<%l(r#S*nX'vp'y!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g#S+^P;=`<%l*g(n+dP;=`<%l%Z(CS+rq$c&j'vp'y!b'l(;dOX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p$f%Z$f$g+g$g#BY%Z#BY#BZ+g#BZ$IS%Z$IS$I_+g$I_$JT%Z$JT$JU+g$JU$KV%Z$KV$KW+g$KW&FU%Z&FU&FV+g&FV;'S%Z;'S;=`+a<%l?HT%Z?HT?HU+g?HUO%Z(CS.ST'w#S$c&j'm(;dO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c(CS.n_$c&j'vp'y!b'm(;dOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#`/x`$c&j!l$Ip'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S1V`#p$Id$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`2X!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S2d_#p$Id$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$2b3l_'u$(n$c&j'y!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k*r4r_$c&j'y!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k)`5vX$c&jOr5qrs6cs!^5q!^!_6y!_#o5q#o#p6y#p;'S5q;'S;=`7h<%lO5q)`6jT$^#t$c&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c#t6|TOr6yrs7]s;'S6y;'S;=`7b<%lO6y#t7bO$^#t#t7eP;=`<%l6y)`7kP;=`<%l5q*r7w]$^#t$c&j'y!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}%W8uZ'y!bOY8pYZ6yZr8prs9hsw8pwx6yx#O8p#O#P6y#P;'S8p;'S;=`:R<%lO8p%W9oU$^#t'y!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}%W:UP;=`<%l8p*r:[P;=`<%l4k#%|:hg$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}st%Ztu<Puw%Zwx(rx!^%Z!^!_*g!_!c%Z!c!}<P!}#O%Z#O#P&c#P#R%Z#R#S<P#S#T%Z#T#o<P#o#p*g#p$g%Z$g;'S<P;'S;=`=y<%lO<P#%|<[i$c&j(_!L^'vp'y!bOY%ZYZ&cZr%Zrs&}st%Ztu<Puw%Zwx(rx!Q%Z!Q![<P![!^%Z!^!_*g!_!c%Z!c!}<P!}#O%Z#O#P&c#P#R%Z#R#S<P#S#T%Z#T#o<P#o#p*g#p$g%Z$g;'S<P;'S;=`=y<%lO<P#%|=|P;=`<%l<P(CS>`k$c&j'vp'y!b(T!LY's&;d$V#tOY%ZYZ&cZr%Zrs&}st%Ztu>Puw%Zwx(rx}%Z}!O@T!O!Q%Z!Q![>P![!^%Z!^!_*g!_!c%Z!c!}>P!}#O%Z#O#P&c#P#R%Z#R#S>P#S#T%Z#T#o>P#o#p*g#p$g%Z$g;'S>P;'S;=`BZ<%lO>P+d@`k$c&j'vp'y!b$V#tOY%ZYZ&cZr%Zrs&}st%Ztu@Tuw%Zwx(rx}%Z}!O@T!O!Q%Z!Q![@T![!^%Z!^!_*g!_!c%Z!c!}@T!}#O%Z#O#P&c#P#R%Z#R#S@T#S#T%Z#T#o@T#o#p*g#p$g%Z$g;'S@T;'S;=`BT<%lO@T+dBWP;=`<%l@T(CSB^P;=`<%l>P%#SBl`$c&j'vp'y!b#h$IdOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#SCy_$c&j#z$Id'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%DfETa(h%<v$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sv%ZvwFYwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#SFe`$c&j#t$Id'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$2bGp_'x$)`$c&j'vpOYHoYZIuZrHorsIuswHowxKVx!^Ho!^!_LX!_#OHo#O#PIu#P#oHo#o#pLX#p;'SHo;'S;=`Mp<%lOHo*QHv_$c&j'vpOYHoYZIuZrHorsIuswHowxKVx!^Ho!^!_LX!_#OHo#O#PIu#P#oHo#o#pLX#p;'SHo;'S;=`Mp<%lOHo)`IzX$c&jOwIuwx6cx!^Iu!^!_Jg!_#oIu#o#pJg#p;'SIu;'S;=`KP<%lOIu#tJjTOwJgwx7]x;'SJg;'S;=`Jy<%lOJg#tJ|P;=`<%lJg)`KSP;=`<%lIu*QK`]$^#t$c&j'vpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r$fL^Z'vpOYLXYZJgZrLXrsJgswLXwxMPx#OLX#O#PJg#P;'SLX;'S;=`Mj<%lOLX$fMWU$^#t'vpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)r$fMmP;=`<%lLX*QMsP;=`<%lHo(*QNR_!h(!b$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z!'l! ]_!gM|$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'+h!!ib$c&j'vp'y!b't#)d#i$IdOY%ZYZ&cZr%Zrs&}sw%Zwx(rxz%Zz{!#q{!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S!#|`$c&j'vp'y!b#f$IdOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&-O!%Z`$c&j'vp'y!bk&%`OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&C[!&h_!V&;l$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS!'rc$c&j'vp'y!by'<nOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!(}!P!Q%Z!Q![!+g![!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z!'d!)Wa$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!*]!P!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z!'d!*h_!UMt$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l!+rg$c&j'vp'y!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!+g![!^%Z!^!_*g!_!g%Z!g!h!-Z!h#O%Z#O#P&c#P#R%Z#R#S!+g#S#X%Z#X#Y!-Z#Y#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l!-dg$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx{%Z{|!.{|}%Z}!O!.{!O!Q%Z!Q![!0a![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!0a#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l!/Uc$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!0a![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!0a#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l!0lc$c&j'vp'y!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!0a![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!0a#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS!2Sf$c&j'vp'y!b#g$IdOY!3hYZ&cZr!3hrs!4{sw!3hwx!C}xz!3hz{#$s{!P!3h!P!Q#&Y!Q!^!3h!^!_!Mh!_!`#-x!`!a#/_!a!}!3h!}#O##[#O#P!<w#P#o!3h#o#p!Mh#p;'S!3h;'S;=`#$m<%lO!3h(r!3sb$c&j'vp'y!b!RSOY!3hYZ&cZr!3hrs!4{sw!3hwx!C}x!P!3h!P!Q!Kh!Q!^!3h!^!_!Mh!_!}!3h!}#O##[#O#P!<w#P#o!3h#o#p!Mh#p;'S!3h;'S;=`#$m<%lO!3h(Q!5U`$c&j'y!b!RSOY!4{YZ&cZw!4{wx!6Wx!P!4{!P!Q!=o!Q!^!4{!^!_!?g!_!}!4{!}#O!Bn#O#P!<w#P#o!4{#o#p!?g#p;'S!4{;'S;=`!Cw<%lO!4{&n!6_^$c&j!RSOY!6WYZ&cZ!P!6W!P!Q!7Z!Q!^!6W!^!_!8g!_!}!6W!}#O!;U#O#P!<w#P#o!6W#o#p!8g#p;'S!6W;'S;=`!=i<%lO!6W&n!7ba$c&j!RSO!^&c!_#Z&c#Z#[!7Z#[#]&c#]#^!7Z#^#a&c#a#b!7Z#b#g&c#g#h!7Z#h#i&c#i#j!7Z#j#m&c#m#n!7Z#n#o&c#p;'S&c;'S;=`&w<%lO&cS!8lX!RSOY!8gZ!P!8g!P!Q!9X!Q!}!8g!}#O!9p#O#P!:o#P;'S!8g;'S;=`!;O<%lO!8gS!9^U!RS#Z#[!9X#]#^!9X#a#b!9X#g#h!9X#i#j!9X#m#n!9XS!9sVOY!9pZ#O!9p#O#P!:Y#P#Q!8g#Q;'S!9p;'S;=`!:i<%lO!9pS!:]SOY!9pZ;'S!9p;'S;=`!:i<%lO!9pS!:lP;=`<%l!9pS!:rSOY!8gZ;'S!8g;'S;=`!;O<%lO!8gS!;RP;=`<%l!8g&n!;Z[$c&jOY!;UYZ&cZ!^!;U!^!_!9p!_#O!;U#O#P!<P#P#Q!6W#Q#o!;U#o#p!9p#p;'S!;U;'S;=`!<q<%lO!;U&n!<UX$c&jOY!;UYZ&cZ!^!;U!^!_!9p!_#o!;U#o#p!9p#p;'S!;U;'S;=`!<q<%lO!;U&n!<tP;=`<%l!;U&n!<|X$c&jOY!6WYZ&cZ!^!6W!^!_!8g!_#o!6W#o#p!8g#p;'S!6W;'S;=`!=i<%lO!6W&n!=lP;=`<%l!6W(Q!=xi$c&j'y!b!RSOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#Z&}#Z#[!=o#[#]&}#]#^!=o#^#a&}#a#b!=o#b#g&}#g#h!=o#h#i&}#i#j!=o#j#m&}#m#n!=o#n#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!f!?nZ'y!b!RSOY!?gZw!?gwx!8gx!P!?g!P!Q!@a!Q!}!?g!}#O!Ap#O#P!:o#P;'S!?g;'S;=`!Bh<%lO!?g!f!@hb'y!b!RSOY'}Zw'}x#O'}#P#Z'}#Z#[!@a#[#]'}#]#^!@a#^#a'}#a#b!@a#b#g'}#g#h!@a#h#i'}#i#j!@a#j#m'}#m#n!@a#n;'S'};'S;=`(f<%lO'}!f!AuX'y!bOY!ApZw!Apwx!9px#O!Ap#O#P!:Y#P#Q!?g#Q;'S!Ap;'S;=`!Bb<%lO!Ap!f!BeP;=`<%l!Ap!f!BkP;=`<%l!?g(Q!Bu^$c&j'y!bOY!BnYZ&cZw!Bnwx!;Ux!^!Bn!^!_!Ap!_#O!Bn#O#P!<P#P#Q!4{#Q#o!Bn#o#p!Ap#p;'S!Bn;'S;=`!Cq<%lO!Bn(Q!CtP;=`<%l!Bn(Q!CzP;=`<%l!4{'`!DW`$c&j'vp!RSOY!C}YZ&cZr!C}rs!6Ws!P!C}!P!Q!EY!Q!^!C}!^!_!GQ!_!}!C}!}#O!JX#O#P!<w#P#o!C}#o#p!GQ#p;'S!C};'S;=`!Kb<%lO!C}'`!Eci$c&j'vp!RSOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#Z(r#Z#[!EY#[#](r#]#^!EY#^#a(r#a#b!EY#b#g(r#g#h!EY#h#i(r#i#j!EY#j#m(r#m#n!EY#n#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(rt!GXZ'vp!RSOY!GQZr!GQrs!8gs!P!GQ!P!Q!Gz!Q!}!GQ!}#O!IZ#O#P!:o#P;'S!GQ;'S;=`!JR<%lO!GQt!HRb'vp!RSOY)rZr)rs#O)r#P#Z)r#Z#[!Gz#[#])r#]#^!Gz#^#a)r#a#b!Gz#b#g)r#g#h!Gz#h#i)r#i#j!Gz#j#m)r#m#n!Gz#n;'S)r;'S;=`*Z<%lO)rt!I`X'vpOY!IZZr!IZrs!9ps#O!IZ#O#P!:Y#P#Q!GQ#Q;'S!IZ;'S;=`!I{<%lO!IZt!JOP;=`<%l!IZt!JUP;=`<%l!GQ'`!J`^$c&j'vpOY!JXYZ&cZr!JXrs!;Us!^!JX!^!_!IZ!_#O!JX#O#P!<P#P#Q!C}#Q#o!JX#o#p!IZ#p;'S!JX;'S;=`!K[<%lO!JX'`!K_P;=`<%l!JX'`!KeP;=`<%l!C}(r!Ksk$c&j'vp'y!b!RSOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#Z%Z#Z#[!Kh#[#]%Z#]#^!Kh#^#a%Z#a#b!Kh#b#g%Z#g#h!Kh#h#i%Z#i#j!Kh#j#m%Z#m#n!Kh#n#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#W!Mq]'vp'y!b!RSOY!MhZr!Mhrs!?gsw!Mhwx!GQx!P!Mh!P!Q!Nj!Q!}!Mh!}#O#!U#O#P!:o#P;'S!Mh;'S;=`##U<%lO!Mh#W!Nse'vp'y!b!RSOY*gZr*grs'}sw*gwx)rx#O*g#P#Z*g#Z#[!Nj#[#]*g#]#^!Nj#^#a*g#a#b!Nj#b#g*g#g#h!Nj#h#i*g#i#j!Nj#j#m*g#m#n!Nj#n;'S*g;'S;=`+Z<%lO*g#W#!]Z'vp'y!bOY#!UZr#!Urs!Apsw#!Uwx!IZx#O#!U#O#P!:Y#P#Q!Mh#Q;'S#!U;'S;=`##O<%lO#!U#W##RP;=`<%l#!U#W##XP;=`<%l!Mh(r##e`$c&j'vp'y!bOY##[YZ&cZr##[rs!Bnsw##[wx!JXx!^##[!^!_#!U!_#O##[#O#P!<P#P#Q!3h#Q#o##[#o#p#!U#p;'S##[;'S;=`#$g<%lO##[(r#$jP;=`<%l##[(r#$pP;=`<%l!3h(CS#%Qb$c&j'vp'y!b'n(;d!RSOY!3hYZ&cZr!3hrs!4{sw!3hwx!C}x!P!3h!P!Q!Kh!Q!^!3h!^!_!Mh!_!}!3h!}#O##[#O#P!<w#P#o!3h#o#p!Mh#p;'S!3h;'S;=`#$m<%lO!3h(CS#&e_$c&j'vp'y!bR(;dOY#&YYZ&cZr#&Yrs#'dsw#&Ywx#*tx!^#&Y!^!_#,s!_#O#&Y#O#P#(f#P#o#&Y#o#p#,s#p;'S#&Y;'S;=`#-r<%lO#&Y(Bb#'m]$c&j'y!bR(;dOY#'dYZ&cZw#'dwx#(fx!^#'d!^!_#)w!_#O#'d#O#P#(f#P#o#'d#o#p#)w#p;'S#'d;'S;=`#*n<%lO#'d(AO#(mX$c&jR(;dOY#(fYZ&cZ!^#(f!^!_#)Y!_#o#(f#o#p#)Y#p;'S#(f;'S;=`#)q<%lO#(f(;d#)_SR(;dOY#)YZ;'S#)Y;'S;=`#)k<%lO#)Y(;d#)nP;=`<%l#)Y(AO#)tP;=`<%l#(f(<v#*OW'y!bR(;dOY#)wZw#)wwx#)Yx#O#)w#O#P#)Y#P;'S#)w;'S;=`#*h<%lO#)w(<v#*kP;=`<%l#)w(Bb#*qP;=`<%l#'d(Ap#*}]$c&j'vpR(;dOY#*tYZ&cZr#*trs#(fs!^#*t!^!_#+v!_#O#*t#O#P#(f#P#o#*t#o#p#+v#p;'S#*t;'S;=`#,m<%lO#*t(<U#+}W'vpR(;dOY#+vZr#+vrs#)Ys#O#+v#O#P#)Y#P;'S#+v;'S;=`#,g<%lO#+v(<U#,jP;=`<%l#+v(Ap#,pP;=`<%l#*t(=h#,|Y'vp'y!bR(;dOY#,sZr#,srs#)wsw#,swx#+vx#O#,s#O#P#)Y#P;'S#,s;'S;=`#-l<%lO#,s(=h#-oP;=`<%l#,s(CS#-uP;=`<%l#&Y%#W#.Vb$c&j#z$Id'vp'y!b!RSOY!3hYZ&cZr!3hrs!4{sw!3hwx!C}x!P!3h!P!Q!Kh!Q!^!3h!^!_!Mh!_!}!3h!}#O##[#O#P!<w#P#o!3h#o#p!Mh#p;'S!3h;'S;=`#$m<%lO!3h+h#/lb$S#t$c&j'vp'y!b!RSOY!3hYZ&cZr!3hrs!4{sw!3hwx!C}x!P!3h!P!Q!Kh!Q!^!3h!^!_!Mh!_!}!3h!}#O##[#O#P!<w#P#o!3h#o#p!Mh#p;'S!3h;'S;=`#$m<%lO!3h$/l#1Pp$c&j'vp'y!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!+g!P!Q%Z!Q![#3T![!^%Z!^!_*g!_!g%Z!g!h!-Z!h#O%Z#O#P&c#P#R%Z#R#S#3T#S#U%Z#U#V#6_#V#X%Z#X#Y!-Z#Y#b%Z#b#c#5T#c#d#9g#d#l%Z#l#m#<i#m#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#3`k$c&j'vp'y!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!+g!P!Q%Z!Q![#3T![!^%Z!^!_*g!_!g%Z!g!h!-Z!h#O%Z#O#P&c#P#R%Z#R#S#3T#S#X%Z#X#Y!-Z#Y#b%Z#b#c#5T#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#5`_$c&j'vp'y!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#6hd$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#7v!R!S#7v!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#7v#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#8Rf$c&j'vp'y!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#7v!R!S#7v!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#7v#S#b%Z#b#c#5T#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#9pc$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#:{!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#:{#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#;We$c&j'vp'y!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#:{!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#:{#S#b%Z#b#c#5T#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#<rg$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#>Z![!^%Z!^!_*g!_!c%Z!c!i#>Z!i#O%Z#O#P&c#P#R%Z#R#S#>Z#S#T%Z#T#Z#>Z#Z#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#>fi$c&j'vp'y!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#>Z![!^%Z!^!_*g!_!c%Z!c!i#>Z!i#O%Z#O#P&c#P#R%Z#R#S#>Z#S#T%Z#T#Z#>Z#Z#b%Z#b#c#5T#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%Gh#@b_!a$b$c&j#x%<f'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)[#Al_^l$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS#Bz^'|!*v!e'.r'vp'y!b$T)d(lSOY*gZr*grs'}sw*gwx)rx!P*g!P!Q#Cv!Q!^*g!^!_#Dl!_!`#F^!`#O*g#P;'S*g;'S;=`+Z<%lO*g(n#DPX$e&j'vp'y!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g$Kh#DuZ#j$Id'vp'y!bOY*gZr*grs'}sw*gwx)rx!_*g!_!`#Eh!`#O*g#P;'S*g;'S;=`+Z<%lO*g$Kh#EqX#z$Id'vp'y!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g$Kh#FgX#k$Id'vp'y!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g%Gh#G_a#W%?x$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`!a#Hd!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#W#Ho_#c$Ih$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%Gh#I}adBf#k$Id$`#|$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`#KS!`!a#L^!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S#K__#k$Id$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S#Lia#j$Id$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`!a#Mn!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S#My`#j$Id$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'+h$ Wc(`$Ip$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P$!c!P!^%Z!^!_*g!_!a%Z!a!b$#m!b#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'+`$!n_z'#p$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S$#x`$c&j#u$Id'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#&^$%V_!x!Ln$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(@^$&a_|(8n$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(n$'eZ$c&jO!^$(W!^!_$(n!_#i$(W#i#j$(s#j#l$(W#l#m$*f#m#o$(W#o#p$(n#p;'S$(W;'S;=`$,q<%lO$(W(n$(_T[#S$c&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c#S$(sO[#S(n$(x[$c&jO!Q&c!Q![$)n![!^&c!_!c&c!c!i$)n!i#T&c#T#Z$)n#Z#o&c#o#p$,U#p;'S&c;'S;=`&w<%lO&c(n$)sZ$c&jO!Q&c!Q![$*f![!^&c!_!c&c!c!i$*f!i#T&c#T#Z$*f#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$*kZ$c&jO!Q&c!Q![$+^![!^&c!_!c&c!c!i$+^!i#T&c#T#Z$+^#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$+cZ$c&jO!Q&c!Q![$(W![!^&c!_!c&c!c!i$(W!i#T&c#T#Z$(W#Z#o&c#p;'S&c;'S;=`&w<%lO&c#S$,XR!Q![$,b!c!i$,b#T#Z$,b#S$,eS!Q![$,b!c!i$,b#T#Z$,b#q#r$(n(n$,tP;=`<%l$(W!'l$-S_!SM|$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S$.^`#r$Id$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&,v$/k_$c&j'vp'y!b(Q&%WOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS$0yk$c&j'vp'y!b(T!LY's&;d$X#tOY%ZYZ&cZr%Zrs&}st%Ztu$0juw%Zwx(rx}%Z}!O$2n!O!Q%Z!Q![$0j![!^%Z!^!_*g!_!c%Z!c!}$0j!}#O%Z#O#P&c#P#R%Z#R#S$0j#S#T%Z#T#o$0j#o#p*g#p$g%Z$g;'S$0j;'S;=`$4t<%lO$0j+d$2yk$c&j'vp'y!b$X#tOY%ZYZ&cZr%Zrs&}st%Ztu$2nuw%Zwx(rx}%Z}!O$2n!O!Q%Z!Q![$2n![!^%Z!^!_*g!_!c%Z!c!}$2n!}#O%Z#O#P&c#P#R%Z#R#S$2n#S#T%Z#T#o$2n#o#p*g#p$g%Z$g;'S$2n;'S;=`$4n<%lO$2n+d$4qP;=`<%l$2n(CS$4wP;=`<%l$0j!5p$5TX!X!3l'vp'y!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g%Df$5{a(g%<v$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p#q$#m#q;'S%Z;'S;=`+a<%lO%Z%#`$7__!W$I`o`$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(r$8i_!mS$c&j'vp'y!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS$9y|$c&j'vp'y!b'l(;d(T!LY's&;d$V#tOX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}st%Ztu>Puw%Zwx(rx}%Z}!O@T!O!Q%Z!Q![>P![!^%Z!^!_*g!_!c%Z!c!}>P!}#O%Z#O#P&c#P#R%Z#R#S>P#S#T%Z#T#o>P#o#p*g#p$f%Z$f$g+g$g#BY>P#BY#BZ$9h#BZ$IS>P$IS$I_$9h$I_$JT>P$JT$JU$9h$JU$KV>P$KV$KW$9h$KW&FU>P&FU&FV$9h&FV;'S>P;'S;=`BZ<%l?HT>P?HT?HU$9h?HUO>P(CS$=Uk$c&j'vp'y!b'm(;d(T!LY's&;d$V#tOY%ZYZ&cZr%Zrs&}st%Ztu>Puw%Zwx(rx}%Z}!O@T!O!Q%Z!Q![>P![!^%Z!^!_*g!_!c%Z!c!}>P!}#O%Z#O#P&c#P#R%Z#R#S>P#S#T%Z#T#o>P#o#p*g#p$g%Z$g;'S>P;'S;=`BZ<%lO>P",
  tokenizers: [noSemicolon, incdecToken, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, insertSemicolon, new LocalTokenGroup("$S~RRtu[#O#Pg#S#T#|~_P#o#pb~gOq~~jVO#i!P#i#j!U#j#l!P#l#m!q#m;'S!P;'S;=`#v<%lO!P~!UO!O~~!XS!Q![!e!c!i!e#T#Z!e#o#p#Z~!hR!Q![!q!c!i!q#T#Z!q~!tR!Q![!}!c!i!}#T#Z!}~#QR!Q![!P!c!i!P#T#Z!P~#^R!Q![#g!c!i#g#T#Z#g~#jS!Q![#g!c!i#g#T#Z#g#q#r!P~#yP;=`<%l!P~$RO(S~~", 141, 325), new LocalTokenGroup("j~RQYZXz{^~^O'p~~aP!P!Qd~iO'q~~", 25, 307)],
  topRules: { "Script": [0, 5], "SingleExpression": [1, 266], "SingleClassItem": [2, 267] },
  dialects: { jsx: 13213, ts: 13215 },
  dynamicPrecedences: { "76": 1, "78": 1, "162": 1, "190": 1 },
  specialized: [{ term: 311, get: (value) => spec_identifier[value] || -1 }, { term: 327, get: (value) => spec_word[value] || -1 }, { term: 67, get: (value) => spec_LessThan[value] || -1 }],
  tokenPrec: 13238
});
const snippets = [
  /* @__PURE__ */ snippetCompletion("function ${name}(${params}) {\n	${}\n}", {
    label: "function",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n	${}\n}", {
    label: "for",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("for (let ${name} of ${collection}) {\n	${}\n}", {
    label: "for",
    detail: "of loop",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("do {\n	${}\n} while (${})", {
    label: "do",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("while (${}) {\n	${}\n}", {
    label: "while",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("try {\n	${}\n} catch (${error}) {\n	${}\n}", {
    label: "try",
    detail: "/ catch block",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("if (${}) {\n	${}\n}", {
    label: "if",
    detail: "block",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("if (${}) {\n	${}\n} else {\n	${}\n}", {
    label: "if",
    detail: "/ else block",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("class ${name} {\n	constructor(${params}) {\n		${}\n	}\n}", {
    label: "class",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion('import {${names}} from "${module}"\n${}', {
    label: "import",
    detail: "named",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion('import ${name} from "${module}"\n${}', {
    label: "import",
    detail: "default",
    type: "keyword"
  })
];
const cache = /* @__PURE__ */ new NodeWeakMap();
const ScopeNodes = /* @__PURE__ */ new Set([
  "Script",
  "Block",
  "FunctionExpression",
  "FunctionDeclaration",
  "ArrowFunction",
  "MethodDeclaration",
  "ForStatement"
]);
function defID(type) {
  return (node, def) => {
    let id2 = node.node.getChild("VariableDefinition");
    if (id2)
      def(id2, type);
    return true;
  };
}
const functionContext = ["FunctionDeclaration"];
const gatherCompletions = {
  FunctionDeclaration: /* @__PURE__ */ defID("function"),
  ClassDeclaration: /* @__PURE__ */ defID("class"),
  ClassExpression: () => true,
  EnumDeclaration: /* @__PURE__ */ defID("constant"),
  TypeAliasDeclaration: /* @__PURE__ */ defID("type"),
  NamespaceDeclaration: /* @__PURE__ */ defID("namespace"),
  VariableDefinition(node, def) {
    if (!node.matchContext(functionContext))
      def(node, "variable");
  },
  TypeDefinition(node, def) {
    def(node, "type");
  },
  __proto__: null
};
function getScope(doc2, node) {
  let cached = cache.get(node);
  if (cached)
    return cached;
  let completions = [], top2 = true;
  function def(node2, type) {
    let name2 = doc2.sliceString(node2.from, node2.to);
    completions.push({ label: name2, type });
  }
  node.cursor(IterMode.IncludeAnonymous).iterate((node2) => {
    if (top2) {
      top2 = false;
    } else if (node2.name) {
      let gather = gatherCompletions[node2.name];
      if (gather && gather(node2, def) || ScopeNodes.has(node2.name))
        return false;
    } else if (node2.to - node2.from > 8192) {
      for (let c of getScope(doc2, node2.node))
        completions.push(c);
      return false;
    }
  });
  cache.set(node, completions);
  return completions;
}
const Identifier = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/;
const dontComplete = [
  "TemplateString",
  "String",
  "RegExp",
  "LineComment",
  "BlockComment",
  "VariableDefinition",
  "TypeDefinition",
  "Label",
  "PropertyDefinition",
  "PropertyName",
  "PrivatePropertyDefinition",
  "PrivatePropertyName"
];
function localCompletionSource(context) {
  let inner = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (dontComplete.indexOf(inner.name) > -1)
    return null;
  let isWord = inner.name == "VariableName" || inner.to - inner.from < 20 && Identifier.test(context.state.sliceDoc(inner.from, inner.to));
  if (!isWord && !context.explicit)
    return null;
  let options = [];
  for (let pos = inner; pos; pos = pos.parent) {
    if (ScopeNodes.has(pos.name))
      options = options.concat(getScope(context.state.doc, pos));
  }
  return {
    options,
    from: isWord ? inner.from : context.pos,
    validFor: Identifier
  };
}
const javascriptLanguage = /* @__PURE__ */ LRLanguage.define({
  name: "javascript",
  parser: /* @__PURE__ */ parser.configure({
    props: [
      /* @__PURE__ */ indentNodeProp.add({
        IfStatement: /* @__PURE__ */ continuedIndent({ except: /^\s*({|else\b)/ }),
        TryStatement: /* @__PURE__ */ continuedIndent({ except: /^\s*({|catch\b|finally\b)/ }),
        LabeledStatement: flatIndent,
        SwitchBody: (context) => {
          let after = context.textAfter, closed = /^\s*\}/.test(after), isCase = /^\s*(case|default)\b/.test(after);
          return context.baseIndent + (closed ? 0 : isCase ? 1 : 2) * context.unit;
        },
        Block: /* @__PURE__ */ delimitedIndent({ closing: "}" }),
        ArrowFunction: (cx) => cx.baseIndent + cx.unit,
        "TemplateString BlockComment": () => null,
        "Statement Property": /* @__PURE__ */ continuedIndent({ except: /^{/ }),
        JSXElement(context) {
          let closed = /^\s*<\//.test(context.textAfter);
          return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
        },
        JSXEscape(context) {
          let closed = /\s*\}/.test(context.textAfter);
          return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
        },
        "JSXOpenTag JSXSelfClosingTag"(context) {
          return context.column(context.node.from) + context.unit;
        }
      }),
      /* @__PURE__ */ foldNodeProp.add({
        "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression": foldInside,
        BlockComment(tree) {
          return { from: tree.from + 2, to: tree.to - 2 };
        }
      })
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
});
const jsxSublanguage = {
  test: (node) => /^JSX/.test(node.name),
  facet: /* @__PURE__ */ defineLanguageFacet({ commentTokens: { block: { open: "{/*", close: "*/}" } } })
};
const typescriptLanguage = /* @__PURE__ */ javascriptLanguage.configure({ dialect: "ts" }, "typescript");
const jsxLanguage = /* @__PURE__ */ javascriptLanguage.configure({
  dialect: "jsx",
  props: [/* @__PURE__ */ sublanguageProp.add((n) => n.isTop ? [jsxSublanguage] : void 0)]
});
const tsxLanguage = /* @__PURE__ */ javascriptLanguage.configure({
  dialect: "jsx ts",
  props: [/* @__PURE__ */ sublanguageProp.add((n) => n.isTop ? [jsxSublanguage] : void 0)]
}, "typescript");
const keywords = /* @__PURE__ */ "break case const continue default delete export extends false finally in instanceof let new return static super switch this throw true typeof var yield".split(" ").map((kw) => ({ label: kw, type: "keyword" }));
function javascript(config2 = {}) {
  let lang2 = config2.jsx ? config2.typescript ? tsxLanguage : jsxLanguage : config2.typescript ? typescriptLanguage : javascriptLanguage;
  return new LanguageSupport(lang2, [
    javascriptLanguage.data.of({
      autocomplete: ifNotIn(dontComplete, completeFromList(snippets.concat(keywords)))
    }),
    javascriptLanguage.data.of({
      autocomplete: localCompletionSource
    }),
    config2.jsx ? autoCloseTags : []
  ]);
}
function findOpenTag(node) {
  for (; ; ) {
    if (node.name == "JSXOpenTag" || node.name == "JSXSelfClosingTag" || node.name == "JSXFragmentTag")
      return node;
    if (!node.parent)
      return null;
    node = node.parent;
  }
}
function elementName(doc2, tree, max = doc2.length) {
  for (let ch = tree === null || tree === void 0 ? void 0 : tree.firstChild; ch; ch = ch.nextSibling) {
    if (ch.name == "JSXIdentifier" || ch.name == "JSXBuiltin" || ch.name == "JSXNamespacedName" || ch.name == "JSXMemberExpression")
      return doc2.sliceString(ch.from, Math.min(ch.to, max));
  }
  return "";
}
const android = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent);
const autoCloseTags = /* @__PURE__ */ EditorView.inputHandler.of((view, from, to, text) => {
  if ((android ? view.composing : view.compositionStarted) || view.state.readOnly || from != to || text != ">" && text != "/" || !javascriptLanguage.isActiveAt(view.state, from, -1))
    return false;
  let { state } = view;
  let changes = state.changeByRange((range) => {
    var _a2, _b;
    let { head } = range, around = syntaxTree(state).resolveInner(head, -1), name2;
    if (around.name == "JSXStartTag")
      around = around.parent;
    if (text == ">" && around.name == "JSXFragmentTag") {
      return { range: EditorSelection.cursor(head + 1), changes: { from: head, insert: `></>` } };
    } else if (text == "/" && around.name == "JSXFragmentTag") {
      let empty2 = around.parent, base2 = empty2 === null || empty2 === void 0 ? void 0 : empty2.parent;
      if (empty2.from == head - 1 && ((_a2 = base2.lastChild) === null || _a2 === void 0 ? void 0 : _a2.name) != "JSXEndTag" && (name2 = elementName(state.doc, base2 === null || base2 === void 0 ? void 0 : base2.firstChild, head))) {
        let insert2 = `/${name2}>`;
        return { range: EditorSelection.cursor(head + insert2.length), changes: { from: head, insert: insert2 } };
      }
    } else if (text == ">") {
      let openTag = findOpenTag(around);
      if (openTag && ((_b = openTag.lastChild) === null || _b === void 0 ? void 0 : _b.name) != "JSXEndTag" && state.sliceDoc(head, head + 2) != "</" && (name2 = elementName(state.doc, openTag, head)))
        return { range: EditorSelection.cursor(head + 1), changes: { from: head, insert: `></${name2}>` } };
    }
    return { range };
  });
  if (changes.changes.empty)
    return false;
  view.dispatch(changes, { userEvent: "input.type", scrollIntoView: true });
  return true;
});
let lang = javascript();
let extensions = [basicSetup, EditorView.lineWrapping];
async function editor(element, value) {
  let view = new EditorView({
    extensions,
    parent: element,
    doc: value,
    wordWrapColumn: 80
  });
  return {
    editor: view,
    // Anything before this promise resolves will happen before timing starts
    ready: Promise.resolve(),
    getScrollHeight() {
      return element.scrollHeight;
    },
    getScrollTop() {
      return element.scrollTop;
    },
    setScrollTop(value2) {
      element.scrollTop = value2;
    },
    setValue: (value2) => view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value2 }
    }),
    format(on) {
      if (on && extensions.length == 2) {
        extensions.push(lang);
      } else if (!on && extensions.length == 3) {
        extensions.pop();
      }
      view.dispatch({
        effects: StateEffect.reconfigure.of(extensions)
      });
    }
  };
}
let editorContainer = document.querySelector("#editor");
let editorInstance = null;
let editorPromise = null;
let buttons = {
  create: document.querySelector("#create"),
  highlight: document.querySelector("#highlight"),
  unhighlight: document.querySelector("#unhighlight"),
  big: document.querySelector("#big"),
  small: document.querySelector("#small"),
  scroll: document.querySelector("#scroll"),
  layout: document.querySelector("#layout")
};
buttons.scroll.addEventListener("click", scroll);
buttons.highlight.addEventListener("click", highlight);
buttons.unhighlight.addEventListener("click", unhighlight);
buttons.big.addEventListener("click", big);
buttons.small.addEventListener("click", small);
buttons.layout.addEventListener("click", layout);
buttons.create.addEventListener("click", (e) => {
  if (!editorPromise) {
    editorPromise = editor(editorContainer);
    editorPromise.then((instance) => {
      editorInstance = instance;
      editorInstance.ready.then(() => {
        buttons.unhighlight.classList.add("active", "true");
        buttons.create.setAttribute("disabled", "true");
      });
    });
  }
});
function layout() {
  const body = document.body.getBoundingClientRect();
  layout.e = document.elementFromPoint(body.width / 2 | 0, body.height / 2 | 0);
}
function highlight() {
  buttons.unhighlight.classList.toggle("active", false);
  buttons.highlight.classList.toggle("active", true);
  editorInstance.format(true);
}
function unhighlight() {
  buttons.unhighlight.classList.toggle("active", true);
  buttons.highlight.classList.toggle("active", false);
  editorInstance.format(false);
}
function big() {
  buttons.small.classList.toggle("active", false);
  buttons.big.classList.toggle("active", true);
  editorInstance.setValue(code);
}
function small() {
  buttons.small.classList.toggle("active", true);
  buttons.big.classList.toggle("active", false);
  editorInstance.setValue(code$1);
}
function scroll() {
  let isTop = editorInstance.getScrollTop() == 0;
  editorInstance.setScrollTop(isTop ? editorInstance.getScrollHeight() : 0);
}
