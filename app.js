var c = chan(1);

loop(function (recur, count) {
    chan.take(c, function (v) {
        console.log('%s : got', count, v);
        (v !== nil) && recur(count + 1);
    });
}, 0);
