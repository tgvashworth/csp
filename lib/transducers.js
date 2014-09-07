'use strict';
var _ = require('./lib');

/**
 * Transducers
 */

exports.transduce = transduce;
function transduce(transducer, reducer, seed, coll) {
    return coll.reduce(transducer(reducer), seed);
}

exports.mapping = mapping;
function mapping(f) {
    return function (f1) {
        return function (result, input) {
            return f1(
                result,
                f(input)
            );
        }
    }
}

exports.filtering = filtering;
function filtering(pred) {
    return function (f1) {
        return function (result, input) {
            return (pred(input) ?
                f1(result, input) :
                result
            );
        }
    }
}

exports.reduce = reduce;
function reduce(f, v, xs) {
    return xs.reduce(f, v);
}

exports.map = map;
function map(f, xs) {
    return xs.reduce(mapping(f)(_.cons), []);
}

exports.filter = filter;
function filter(f, xs) {
    return xs.reduce(filtering(f)(_.cons), []);
}

/**
 * Filter generators
 */

exports.gateFilter = gateFilter;
function gateFilter(opener, closer) {
    var open = false;
    return function (e) {
        if (e.type === opener) {
            open = true;
        }
        if (e.type === closer) {
            open = false;
        }
        return open;
    };
};

exports.keyFilter = keyFilter;
function keyFilter(key, value) {
    return function (e) {
        return (e[key] === value);
    };
}
