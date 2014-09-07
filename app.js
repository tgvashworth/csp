var chan = require('./lib/channel');

window.chan = chan;

var c = chan(1);
var c2 = chan(1);
c.name = 'c';
c2.name = 'c2';

window.c = c;
window.c2 = c2;

// loop(function (recur, count) {
//     chan.alts([c, c2], function (v, c) {
//         console.log('%s : got % from %s', count, v, c.name);
//         (v !== undefined) && recur(count + 1);
//     });
// }, 0);

chan.alts([c, c2], function (v, c) {
    console.log('alts got %O from %s', v, c.name);
});

chan.take(c, function (v, c) {
    console.log('take 1 got %O from %s', v, c.name);
});
chan.take(c, function (v, c) {
    console.log('take 2 got %O from %s', v, c.name);
});
chan.take(c, function (v, c) {
    console.log('take 3 got %O from %s', v, c.name);
});

chan.take(c2, function (v, c) {
    console.log('take 1 got %O from %s', v, c.name);
});
chan.take(c2, function (v, c) {
    console.log('take 2 got %O from %s', v, c.name);
});
chan.take(c2, function (v, c) {
    console.log('take 3 got %O from %s', v, c.name);
});
