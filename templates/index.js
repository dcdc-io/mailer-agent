"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var lib_1 = require("./lib");
var nodemailer_1 = __importDefault(require("nodemailer"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var emailSafe = function (str) { if (require('./rx.js').email.test(str.split("<").reverse()[0].trim().replace(">", ""))) {
    return str;
}
else {
    throw "invalid email address";
} };
var randomString = function () { return require('crypto').randomBytes(16).toString("hex"); };
var _a = process.env, _b = _a.DOMAIN, DOMAIN = _b === void 0 ? "advocat.group" : _b, _c = _a.MESSAGE_DELAY, MESSAGE_DELAY = _c === void 0 ? "10000" : _c, _d = _a.RECOVERY_TIME, RECOVERY_TIME = _d === void 0 ? "60000" : _d, _e = _a.EMAIL_FROM, EMAIL_FROM = _e === void 0 ? "advocat. <advocat@dcdc.io>" : _e, _f = _a.SMTP_HOST, SMTP_HOST = _f === void 0 ? "localhost" : _f, SMTP_PASS = _a.SMTP_PASS, _g = _a.SMTP_PORT, SMTP_PORT = _g === void 0 ? "25" : _g, SMTP_USER = _a.SMTP_USER, MAILER_USER = _a.MAILER_USER, MAILER_PASS = _a.MAILER_PASS, PROTOCOL = _a.PROTOCOL, PORT = _a.PORT;
var wellKnownReplacements = {
    domain: DOMAIN
};
var loop = function () { return __awaiter(void 0, void 0, void 0, function () {
    var transport, messages, _i, messages_1, doc, template, compiled, info, error_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 12, , 13]);
                transport = nodemailer_1.default.createTransport({
                    host: SMTP_HOST,
                    port: parseInt(SMTP_PORT),
                    auth: {
                        user: SMTP_USER,
                        pass: SMTP_PASS
                    }
                });
                return [4 /*yield*/, node_fetch_1.default(PROTOCOL + "://" + MAILER_USER + ":" + MAILER_PASS + "@" + DOMAIN + (PORT ? ":" + PORT : "") + "/db/mail_outbox/_all_docs?include_docs=true").then(function (res) { return res.json(); }).then(function (data) { return data.rows; })];
            case 1:
                messages = _a.sent();
                _i = 0, messages_1 = messages;
                _a.label = 2;
            case 2:
                if (!(_i < messages_1.length)) return [3 /*break*/, 11];
                doc = messages_1[_i].doc;
                _a.label = 3;
            case 3:
                _a.trys.push([3, 8, , 10]);
                if (doc.status === "sent" || doc.type !== "email") {
                    return [3 /*break*/, 10];
                }
                return [4 /*yield*/, lib_1.findTemplate(doc.template)];
            case 4:
                template = _a.sent();
                return [4 /*yield*/, lib_1.compileTemplate(template, __assign(__assign({}, doc.params), wellKnownReplacements))];
            case 5:
                compiled = _a.sent();
                doc.status = "sent";
                return [4 /*yield*/, transport.sendMail({
                        from: EMAIL_FROM,
                        to: emailSafe(doc.to.email || doc.to),
                        subject: compiled.metadata.subject,
                        text: compiled.text,
                        html: compiled.body
                    })];
            case 6:
                info = _a.sent();
                console.log(info);
                return [4 /*yield*/, node_fetch_1.default(PROTOCOL + "://" + MAILER_USER + ":" + MAILER_PASS + "@" + DOMAIN + (PORT ? ":" + PORT : "") + "/db/mail_outbox/" + encodeURIComponent(doc._id) + "?conflict=true", {
                        method: "PUT",
                        body: JSON.stringify(doc),
                        headers: { 'Content-Type': 'application/json' }
                    })];
            case 7:
                _a.sent();
                return [3 /*break*/, 10];
            case 8:
                error_1 = _a.sent();
                doc.status = "error";
                console.error(error_1);
                return [4 /*yield*/, node_fetch_1.default(PROTOCOL + "://" + MAILER_USER + ":" + MAILER_PASS + "@" + DOMAIN + (PORT ? ":" + PORT : "") + "/db/mail_outbox/" + encodeURIComponent(doc._id) + "?conflict=true", {
                        method: "PUT",
                        body: JSON.stringify(doc),
                        headers: { 'Content-Type': 'application/json' }
                    })];
            case 9:
                _a.sent();
                return [3 /*break*/, 10];
            case 10:
                _i++;
                return [3 /*break*/, 2];
            case 11:
                setTimeout(loop, parseInt(MESSAGE_DELAY));
                return [3 /*break*/, 13];
            case 12:
                error_2 = _a.sent();
                console.error("an error occured...");
                setTimeout(loop, parseInt(RECOVERY_TIME));
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); };
loop();
