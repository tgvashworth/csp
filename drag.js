// Create a channel to 'put' DOM events into.
var c = chan(
    1,
    compose(
        // Only allow through when mouse has been down
        filtering(gateFilter('mousedown', 'mouseup')),
        // Filter by type === mousemove
        filtering(keyFilter('type', 'mousemove')),
        // e -> [type, x, y]
        mapping(function (e) {
            return [e.type, e.pageX, e.pageY];
        })
    )
);

// Listen for relevant events
listen(document, 'mousemove', c);
listen(document, 'mouseup',   c);
listen(document, 'mousedown', c);

// Keep taking from the channel forever, and count the events
// Yep, this will stack overflow
loop(function (recur, count) {
    chan.take(c, function (v) {
        console.log('%s : got', count, v);
        recur(count + 1);
    });
}, 0);

// [[1,2,3],[4,5,6],[7,8,9]].reduce(
//     compose(
//         mapping(head),
//         filtering(partial(gt, 3))
//     )(concat),
//     []
// ) => [4,7]
