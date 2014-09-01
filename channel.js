/**
 * Channel
 */

function chan(size, transducer) {
    return {
        buffer: [],
        consumers: [],
        listeners: [],
        size: size,
        transducer: transducer || mapping(identity),
        closed: false
    };
}

chan.run = function run(c) {
    if ((c.buffer.length || c.closed) && (c.consumers.length || c.listeners.length)) {
        while (c.listeners.length) c.listeners.shift()();
        c.consumers.length && c.consumers.shift()(
            (c.buffer.length ? c.buffer.shift() : nil),
            c
        );
    }
    return c;
};

chan.take = function take(c, cb) {
    c.consumers.push(cb);
    setTimeout(partial(chan.run, c), 0);
    return c;
};

chan.put = function put(c, v) {
    if (v !== nil && !c.closed) {
        c.buffer = concat(
            c.buffer,
            // Reduce the new value using the transducer, reducing the result using cons
            transduce(c.transducer, cons, [], [v])
        ).slice(0, c.size);
    }
    setTimeout(partial(chan.run, c), 0);
    return c;
};

chan.close = function close(c) {
    c.closed = true;
    return chan.run(c);
};

chan.listen = function take(c, cb) {
    c.listeners.push(cb);
    return chan.run(c);
};

chan.alts = function alts(cs, cb) {
    var done = false;
    return map(function (c) {
        return chan.listen(c, function () {
            if (done) return;
            done = true;
            chan.take(c, cb);
        });
    }, shuffle(cs));
};

function timeout(time) {
    var c = chan();
    c.name = 'timeout';
    setTimeout(partial(chan.close, c), time);
    return c;
}
