var test = require('tape');

var chan = require('../lib/channel');

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
        var c = chan(2);
        var cb = function (v) {
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
        var c = chan(2);
        var cb = function (v) {
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
        var c = chan(2);
        var cb = function (v) {
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

test('closing', function (t) {
    t.test('closing does not error', function (t) {
        var c = chan();
        chan.close(c);
        t.end();
    });

    t.test('closing means takers get undefined', function (t) {
        var c = chan();
        chan.close(c);
        chan.take(c, function (v) {
            t.equal(v, undefined);
            t.end();
        });
    });
    t.test('closing means existing takers get undefined', function (t) {
        var c = chan();
        chan.take(c, function (v) {
            t.equal(v, undefined);
            t.end();
        });
        chan.close(c);
    });

    t.test('closing means puts do not trigger takers', function (t) {
        var c = chan();
        var calls = 0;
        var cb = function (v) {
            t.notOk(v);
            calls += 1;
            if (calls === 2) t.end();
        };

        chan.close(c);
        chan.put(c, 1);
        chan.take(c, cb);
        chan.take(c, cb);
        chan.put(c, 2);
    });

    t.end();
});

test('alts', function (t) {
    t.test('alts does not error', function (t) {
        var c = chan();
        chan.alts([c], function () {});
        t.end();
    });

    t.test('alts acts like take for single channel', function (t) {
        var c = chan();
        chan.alts([c], function (v) {
            t.equal(v, 1);
            t.end();
        });
        chan.put(c, 1);
    });

    t.test('alts takes from channel that returns the data', function (t) {
        var c = chan();
        var c2 = chan();
        chan.alts([c, c2], function (v, tc) {
            t.equal(v, 1);
            t.equal(tc, c2);
            t.end();
        });
        chan.put(c2, 1);
    });

    t.test('alts is discarded after first take', function (t) {
        var c = chan();
        var c2 = chan();
        chan.alts([c, c2], function (v, tc) {
            t.equal(v, 1);
            t.equal(tc, c);
            t.end();
        });
        chan.put(c, 1);
        chan.put(c2, 2);
    });

    t.test('alts is only triggered once alongside a take', function (t) {
        var c = chan(2);
        var c2 = chan(2);
        var cb = function (v, tc) {
            t.ok(v);
            t.equal(c, tc);
            if (v === 2) t.end();
        };
        chan.alts([c, c2], cb);
        chan.take(c, cb);
        chan.put(c, 1);
        chan.put(c, 2);
    });

    t.end();
});

test('timeout', function (t) {
    t.test('timeout does not error', function (t) {
        var c = chan.timeout();
        t.end();
    });

    t.test('timeout closes after specified time', function (t) {
        var c = chan.timeout(20);
        var now = Date.now();
        chan.take(c, function () {
            t.ok(Date.now() - now >= 20);
            t.end();
        });
    });

    t.end();
});
