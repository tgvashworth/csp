var c = chan(1);
var c2 = chan(1);
c.name = 'c';
c2.name = 'c2';

// loop(function (recur, count) {
//     chan.alts([c, c2], function (v, c) {
//         console.log('%s : got % from %s', count, v, c.name);
//         (v !== nil) && recur(count + 1);
//     });
// }, 0);


chan.alts([c, c2, timeout(1000 * 5)], function (v, c) {
    console.log('got %O from %s', v, c.name);
});
