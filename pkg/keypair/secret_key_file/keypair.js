"use strict";
exports.__esModule = true;
var fs = require("fs");
var web3_js_1 = require("@solana/web3.js");
var KeypairProvider = /** @class */ (function () {
    function KeypairProvider(path) {
        var data;
        try {
            data = fs.readFileSync(path, 'utf8');
        }
        catch (err) {
            console.error(err);
        }
        var opening_bracket_index = data.indexOf("[");
        var closing_bracket_index = data.indexOf("]") - data.length;
        data = data.slice(opening_bracket_index + 1, closing_bracket_index);
        var data_list = data.split(",");
        var data_ints = data_list.map(function (item) { return parseInt(item); });
        var secretKey = Uint8Array.from(data_ints);
        this.keypair = web3_js_1.Keypair.fromSecretKey(secretKey);
    }
    KeypairProvider.prototype.get = function () {
        return this.keypair;
    };
    return KeypairProvider;
}());
exports["default"] = KeypairProvider;
