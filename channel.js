/**
 * Channel
 */

function chan(size, transducer) {
    return {
        buffer: [],
        consumers: [],
        size: size,
        transducer: transducer || mapping(identity)
    };
}

chan.run = function run(c) {
    if (c.buffer.length && c.consumers.length) {
        c.consumers.shift()(c.buffer.shift());
    }
    return c;
};

chan.take = function take(c, cb) {
    c.consumers.push(cb);
    return chan.run(c);
};

chan.put = function put(c, v) {
    c.buffer = concat(
        c.buffer,
        // Reduce the new value using the transducer, reducing the result using cons
        transduce(c.transducer, cons, [], [v])
    ).slice(0, c.size);
    return chan.run(c);
};
