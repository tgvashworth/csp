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
 * Chan
 */

function chan(size, transducer) {
    return {
        uid: uid('chan'),
        buffer: [],
        consumers: [],
        size: size,
        transducer: transducer || trans.mapping(_.identity),
        closed: false,
        timeout: undefined
    };
}

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

_chan.add = function (c, cb) {
    c.consumers = _.cons(c.consumers, cb);
    return c;
};

function box(cb) {
    var id = uid('box');
    idToBox[id] = _.partial(_.apply, function () {
        delete idToBox[id];
        return _.apply(cb, _.arr(arguments));
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

chan.close = function close(c) {
    c.closed = true;
    return _chan.dispatch(c);
};

chan.alts = function alts(cs, cb) {
    var altbox = box(cb);
    return trans.map(function (c) {
        return _chan.add(
            _chan.dispatch(c),
            altbox
        );
    }, cs);
};

chan.timeout = function timeout(time) {
    var c = chan(0);
    setTimeout(_.partial(chan.close, c), time);
    return c;
};

module.exports = chan;
