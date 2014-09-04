/**
 * A library of functional stuff. Does things like change Array.prototype. #yolo
 */

/**
 * Util
 */

exports.apply = apply;
function apply(fn /*, arg, ..., args... */) {
    return fn.apply(
        null,
        [].concat.apply(
            arr(arguments, 1, -1),
            arr(arguments, -1)
        )
    );
}

exports.call = call;
function call(fn /*, arg, ... */) {
    return fn.apply(
        null,
        arr(arguments, 1)
    );
}

exports.partial = partial;
function partial(fn /*, args... */) {
    var args = arr(arguments, 1);
    return function () {
        return apply(
            fn,
            args.concat(
                arr(arguments)
            )
        );
    };
}

exports.identity = identity;
function identity(x) {
    return x;
}

exports.compose = compose;
function compose(/*fns..., fn*/) {
    var args = arr(arguments);
    var len = length(args);
    if (!length(args)) return identity;
    var args = arr(arguments);
    var fn = args.last;
    if (length(args) === 1) return fn;
    var fns = apply(compose, args.slice(0, -1));
    return function composed(x) {
        return fns(fn(x));
    };
}

exports.not = not;
function not(f) {
    return function () {
        return !apply(f, arr(arguments));
    };
}

exports.log = log;
function log() {
    console.log.apply(console, arguments);
}

/**
 * DOM
 */

exports.listen = listen;
function listen(elem, type, c) {
    c = c || chan(1);
    elem.addEventListener(type, partial(chan.put, c));
    return c;
}

/**
 * Math
 */

exports.inc = inc;
function inc(x) {
    return x + 1;
}

exports.dec = dec;
function dec(x) {
    return x - 1;
}

exports.add = add;
function add(a, b) {
    return a + b;
}

exports.sub = sub;
function sub(a, b) {
    return a + b;
}

exports.mult = mult;
function mult(a, b) {
    return a * b;
}

exports.div = div;
function div(a, b) {
    return a / b;
}

exports.even = even;
function even(a) {
    return (a % 2 === 0);
}

exports.odd = odd;
function odd(a) {
    return !even(a);
}

exports.min = min;
function min() {
    return Math.min.apply(Math, arguments);
}

exports.max = max;
function max() {
    return Math.max.apply(Math, arguments);
}

/**
 * Ord
 */

exports.eq = eq;
function eq(a, b) {
    return a === b;
}

exports.gt = gt;
function gt(a, b) {
    return a < b;
}

exports.lt = lt;
function lt(a, b) {
    return a > b;
}

/**
 * Arrays
 */

exports.arr = arr;
function arr(c, a, b) {
    return [].slice.call(c, a, b);
}

exports.reverse = reverse;
function reverse(a) {
    return (!length(a) ?
        [] :
        concat(
            reverse(tail(a)),
            head(a)
        )
    );
}

exports.concat = concat;
function concat(a, b) {
    return a.concat(b);
}

exports.cons = cons;
function cons(a, b) {
    return concat(a, [b]);
}

exports.join = join;
function join(fst /*, rest...*/) {
    if (!fst) return [];
    var rest = arr(arguments, 1);
    return concat(fst, apply(join, rest));
}

exports.head = head;
function head(a) {
    return a[0];
}

exports.tail = tail;
function tail(a) {
    return arr(a, 1);
}

exports.length = length;
function length(a) {
    return a.length;
}

exports.shuffle = shuffle;
function shuffle(xs) {
    if (!length(xs)) return [];
    var pivot = ~~(Math.random() * length(xs));
    return concat(
        [xs[pivot]],
        shuffle(
            join(
                arr(xs, 0, pivot),
                arr(xs, pivot + 1)
            )
        )
    );

}

/**
 * Maps (objects, yo)
 */

exports.getFrom = getFrom;
function getFrom(o, k) {
    return o[k];
}

exports.get = get;
function get(k, o) {
    return getFrom(o, k);
}

exports.has = has;
function has(o, k) {
    return (typeof o[k] !== 'undefined');
}

// Clojure's (loop) with rebinding but without the macro-ness.
// It's fucking nuts. Yes, it will stack overflow.
exports.loop = loop;
function loop(fn) {
    return apply(
        fn,
        partial(loop, fn),
        arr(arguments, 1)
    );
}
