'use strict';

var trans = require('./transducers');
var _ = require('./lib');

/**
 * Channel
 */

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
 * Make a new channel.
 *
 * Takes:
 *     size — buffer size. Defaults to 1.
 *     transducer — for transforming for channel values
 */
function chan(size, transducer) {
    return {
        uid: uid('chan'),
        buffer: [],
        consumers: [],
        size: _.opt(size, 1),
        transducer: _.opt(transducer, trans.mapping(_.identity)),
        closed: false,
        timeout: undefined
    };
}

/**
 * Take a value from channel `c`, and pass it to callback `cb`.
 *
 * Returns `c`.
 */
chan.take = function take(c, cb) {
    return _chan.add(
        _chan.dispatch(c),
        _chan.box(cb)
    );
};

/**
 * Put value `v` into channel `c`.
 *
 * Returns `c`.
 */
chan.put = function put(c, v) {
    if (v !== undefined && !c.closed) {
        c.buffer = _.concat(
            c.buffer,
            // Reduce the new value using the transducer, reducing the result using cons
            trans.transduce(c.transducer, _.cons, [], [v])
        ).slice(0, c.size);
    }
    _chan.dispatch(c);
    return c;
};


/**
 * Close channel `c`.
 *
 * Returns `c`.
 */
chan.close = function close(c) {
    c.closed = true;
    return _chan.dispatch(c);
};

/**
 * Take from any of `cs` channels.
 *
 * Returns `cs`.
 */
chan.alts = function alts(cs, cb) {
    var altbox = _chan.box(cb);
    return trans.map(function (c) {
        return _chan.add(
            _chan.dispatch(c),
            altbox
        );
    }, cs);
};

/**
 * Create a timeout channel that closes after `time`.
 *
 * Returns the new channel.
 */
chan.timeout = function timeout(time) {
    var c = chan(0);
    setTimeout(_.partial(chan.close, c), time);
    return c;
};

// Implementation

var _chan = {};
_chan.run = function run(c) {
    c.timeout = undefined;
    if (!((c.buffer.length || c.closed) && c.consumers.length)) {
        return c;
    }

    var shuffled = trans.filter(
        _.partial(_.has, idToBox),
        _.shuffle(c.consumers)
    );

    if (!shuffled.length) {
        return c;
    }

    var fn = _.getFrom(idToBox, _.head(shuffled))

    fn((c.buffer.length ? c.buffer.shift() : undefined), c);
    c.consumers = _.tail(shuffled);

    return _chan.run(c);
};

_chan.dispatch = function dispatch(c) {
    !c.timeout && (c.timeout = setTimeout(_.partial(_chan.run, c), 0));
    return c;
};

_chan.add = function add(c, cb) {
    c.consumers = _.cons(c.consumers, cb);
    return c;
};

_chan.box = function box(cb) {
    var id = uid('box');
    idToBox[id] = _.partial(_.apply, function () {
        delete idToBox[id];
        return _.apply(cb, _.arr(arguments));
    });
    return id;
}

module.exports = chan;
