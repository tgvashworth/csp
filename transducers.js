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
