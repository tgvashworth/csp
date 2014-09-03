/**
 * Channel
 */

var chan = (function () {
    'use strict';

    /**
     * uid generation
     */

    var uidc = 0;
    function uid(str) {
        return (str + '-' + uidc++);
    }

    /**
     * box pool
     */
    var idToBox = {};

    /**
     * Chan
     */

    function chan(size, transducer) {
        return {
            uid: uid('chan'),
            buffer: [],
            consumers: [],
            size: size,
            transducer: transducer || mapping(identity),
            closed: false,
            timeout: nil
        };
    }

    // Implementation

    var _chan = {};
    _chan.run = function run(c) {
        c.timeout = nil;
        if ((c.buffer.length || c.closed) && c.consumers.length) {
            var shuffled = filter(partial(has, idToBox), shuffle(c.consumers));
            getFrom(idToBox, head(shuffled))(
                (c.buffer.length ? c.buffer.shift() : nil),
                c
            );
            c.consumers = tail(shuffled);
        }
        return c;
    };

    _chan.dispatch = function dispatch(c) {
        !c.timeout && (c.timeout = setTimeout(partial(_chan.run, c), 0));
        return c;
    };

    _chan.add = function (c, cb) {
        c.consumers = cons(c.consumers, cb);
        return c;
    };

    function box(cb) {
        var id = uid('box');
        idToBox[id] = partial(apply, function () {
            delete idToBox[id];
            return apply(cb, arr(arguments));
        });
        return id;
    }

    // Public

    chan.take = function take(c, cb) {
        return _chan.add(
            _chan.dispatch(c),
            box(cb)
        );
    };

    chan.put = function put(c, v) {
        if (v !== nil && !c.closed) {
            c.buffer = concat(
                c.buffer,
                // Reduce the new value using the transducer, reducing the result using cons
                transduce(c.transducer, cons, [], [v])
            ).slice(0, c.size);
        }
        _chan.dispatch(c);
        return c;
    };

    chan.close = function close(c) {
        c.closed = true;
        return _chan.dispatch(c);
    };

    chan.alts = function alts(cs, cb) {
        var altbox = box(cb);
        return map(function (c) {
            return _chan.add(
                _chan.dispatch(c),
                altbox
            );
        }, cs);
    };

    chan.timeout = function timeout(time) {
        var c = chan(0);
        setTimeout(partial(chan.close, c), time);
        return c;
    };

    return chan;

}());
