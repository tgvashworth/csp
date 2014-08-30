// Create a channel to 'put' DOM events into.
// Filters events by type and 'even-ness', then maps them to [type, x, y].
var c = chan(
    1, // Buffer size
    compose(
        filtering(function (e) {
            return (
                even(e.pageX) &&
                even(e.pageX)
            );
        }),
        mapping(function (e) {
            return [e.type, e.pageX, e.pageY];
        })
    )
);

// Keep taking from the channel forever, and count the events
// Yep, this will stack overflow
loop(function (recur, count) {
    chan.take(c, function (v) {
        console.log('%s : got', count, v);
        recur(count + 1);
    });
}, 0);

// Listen for mousemoves and put them into the channel
listen('mousemove', c);

// [[1,2,3],[4,5,6],[7,8,9]].reduce(
//     compose(
//         mapping(head),
//         filtering(partial(gt, 3))
//     )(concat),
//     []
// ) => [4,7]
