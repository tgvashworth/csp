/**
 * Actor
 *
 * - send messages
 * - recieve messages
 */

function actor(c) {
    return {
        c: c || chan(1)
    };
}

actor.take = function (a) {
    return apply(chan.take, a.c, [].slice.call(arguments, 1));
};

actor.put = function (a) {
    return apply(chan.put, a.c, [].slice.call(arguments, 1));
};
