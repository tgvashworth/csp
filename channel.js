/**
 * Channel
 */

function chan(size, transducer) {
    return {
        buffer: [],
        consumers: [],
        size: size,
        transducer: transducer || mapping(identity),
        closed: false
    };
}

chan.run = function run(c) {
    if ((c.buffer.length || c.closed) && c.consumers.length) {
        c.consumers.shift()(
            c.buffer.length ? c.buffer.shift() : nil
        );
    }
    return c;
};

chan.take = function take(c, cb) {
    c.consumers.push(cb);
    return chan.run(c);
};

chan.put = function put(c, v) {
    if (v !== nil && !c.closed) {
        c.buffer = concat(
            c.buffer,
            // Reduce the new value using the transducer, reducing the result using cons
            transduce(c.transducer, cons, [], [v])
        ).slice(0, c.size);
    }
    return chan.run(c);
};

chan.close = function close(c) {
    c.closed = true;
    return chan.run(c);
};
