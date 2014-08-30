var c = chan(
    1,
    compose(
        filtering(function (e) {
            return even(e.x) && even(e.y);
        }),
        mapping(function (e) {
            return [e.type, e.x, e.y];
        })
    )
);

// var a = actor(c);

loop(function (recur) {
    chan.take(c, function (v) {
        console.log('got', v);
        recur();
    });
});

listen(c, 'mousemove');

function listen(c, event) {
    document.addEventListener(event, partial(chan.put, c));
}


// [[1,2,3],[4,5,6],[7,8,9]].reduce(
//     compose(
//         mapping(head),
//         filtering(partial(gt, 3))
//     )(concat),
//     []
// )
