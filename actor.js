/*
 * # Actor
 *
 * Send & recieves, optionally addressed, messages.
 *
 * # Channel
 *
 * Inter-actor communications. Queue-like, variable semantics.
 */

/**
 * Channel
 */

function chan(size, fn) {
    return {
        buffer: [],
        consumers: [],
        size: size,
        transducer: fn || mapping(identity)
    };
}

chan.run = function run(c) {
    if (c.buffer.length && c.consumers.length) {
        c.consumers.shift()(c.buffer.shift());
    }
};

chan.take = function take(c, cb) {
    c.consumers.push(cb);
    chan.run(c);
    return c;
};

chan.put = function put(c, v) {
    c.buffer = c.buffer.concat(
        // Reduce the new value using the transducer, reducing the result using cons
        transduce(c.transducer, cons, [], [v])
    ).slice(0, c.size);
    chan.run(c);
    return c;
};

/**
 * Actor
 *
 * - send messages
 * - recieve messages
 */

function actor(c) {
    return {
        c: c || chan(1)
    };
}

actor.take = function (a) {
    return apply(chan.take, a.c, [].slice.call(arguments, 1));
};

actor.put = function (a) {
    return apply(chan.put, a.c, [].slice.call(arguments, 1));
};
