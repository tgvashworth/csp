var test = require('tape');

var chan = require('../channel');

test('making channels', function (t) {
    var c = chan();
    t.ok(c);
    t.end();
});

test('putting to a channel', function (t) {
    test('does not error', function (t) {
        var c = chan();
        chan.put(c, 1);
        t.end();
    });

    t.end();
});

test('taking from a channel', function (t) {
    test('does not error', function (t) {
        var c = chan();
        chan.take(c, function () {});
        t.end();
    });

    test('gets value when put has already happened', function (t) {
        var c = chan();
        chan.put(c, 1);
        chan.take(c, function (v) {
            t.equal(v, 1);
            t.end();
        });
    });

    test('gets value when put happens later', function (t) {
        var c = chan();
        chan.take(c, function (v) {
            t.equal(v, 1);
            t.end();
        });
        chan.put(c, 1);
    });

    test('every taker gets a value when put first', function (t) {
        t.plan(2);
        var c = chan();
        var cb = function (v) {
            console.log('v', v);
            t.ok(v);
            if (v === 2) t.end();
        };

        chan.put(c, 1);
        chan.put(c, 2);

        chan.take(c, cb);
        chan.take(c, cb);
    });

    test('every taker gets a value when put last', function (t) {
        t.plan(2);
        var c = chan();
        var cb = function (v) {
            console.log('v', v);
            t.ok(v);
            if (v === 2) t.end();
        };

        chan.take(c, cb);
        chan.take(c, cb);

        chan.put(c, 1);
        chan.put(c, 2);
    });

    test('every taker gets a value when put interleaved', function (t) {
        t.plan(2);
        var c = chan();
        var cb = function (v) {
            console.log('v', v);
            t.ok(v);
            if (v === 2) t.end();
        };

        chan.put(c, 1);
        chan.take(c, cb);

        chan.put(c, 2);
        chan.take(c, cb);
    });

    t.end();
});
