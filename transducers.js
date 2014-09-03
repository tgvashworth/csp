/**
 * Transducers
 */

function transduce(transducer, reducer, seed, coll) {
    return coll.reduce(transducer(reducer), seed);
}

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

function reduce(f, v, xs) {
    return xs.reduce(f, v);
}

function map(f, xs) {
    return xs.reduce(mapping(f)(cons), []);
}

function filter(f, xs) {
    return xs.reduce(filtering(f)(cons), []);
}

/**
 * Filter generators
 */

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

function keyFilter(key, value) {
    return function (e) {
        return (e[key] === value);
    };
}
