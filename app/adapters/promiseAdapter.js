exports.resolve = function (data) {

    return new Promise((resolve, reject) => {
        return resolve(data);
    });
}

exports.reject = function (data) {
    return new Promise((resolve, reject) => {
        return reject(data);
    });
}