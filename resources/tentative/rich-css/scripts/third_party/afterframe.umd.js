!function(e, n) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = n() : "function" == typeof define && define.amd ? define(n) : (e || self).afterFrame = n()
}(this, function() {
    var e = []
      , n = new MessageChannel
      , o = function() {
        this.postMessage(void 0)
    }
    .bind(n.port2);
    return n.port1.onmessage = function() {
        var n = e;
        e = [];
        for (var o = performance.now(), t = 0; t < n.length; t++)
            n[t](o)
    }
    ,
    n = null,
    function(n) {
        1 === e.push(n) && requestAnimationFrame(o)
    }
});
//# sourceMappingURL=afterframe.umd.js.map
