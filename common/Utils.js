module.exports = {

    generateRandomString: function generateRandomString(length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < length; i++) {
            text += possible[Math.floor(Math.random() * possible.length)];
        }
        return text;
    },

    generateFakeToken: function generateFakeToken(length1, length2, length3) {
        return (module.exports.generateRandomString(length1) + "."
            + module.exports.generateRandomString(length2) + "." +
            module.exports.generateRandomString(length3));
    },

    manipulateToken: function manipulateToken(token) {
        // Add 'n' to position 3
        token = token.splice(3, 0, "n");
        // Add 'C' to position 200
        token = token.splice(200, 0, "C");
        // Add '3' to position 149
        token = token.splice(149, 0, "3");
        return token;
    }
};
