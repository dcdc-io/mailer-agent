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
exports.compileTemplate = exports.findTemplate = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var markdown_it_1 = __importDefault(require("markdown-it"));
var front_matter_1 = __importDefault(require("front-matter"));
var html_to_text_1 = __importDefault(require("html-to-text"));
// credit: https://dev.to/ycmjason/stringprototypereplace-asynchronously-28k9
function asyncStringReplace(str, regex, aReplacer) {
    return __awaiter(this, void 0, void 0, function () {
        var substrs, match, i, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    substrs = [];
                    i = 0;
                    _d.label = 1;
                case 1:
                    if (!((match = regex.exec(str)) !== null)) return [3 /*break*/, 5];
                    substrs.push(str.slice(i, match.index));
                    _b = (_a = substrs).push;
                    if (!(typeof aReplacer === "function")) return [3 /*break*/, 3];
                    return [4 /*yield*/, aReplacer.apply(void 0, match)];
                case 2:
                    _c = (_d.sent());
                    return [3 /*break*/, 4];
                case 3:
                    _c = aReplacer;
                    _d.label = 4;
                case 4:
                    _b.apply(_a, [_c]);
                    i = regex.lastIndex;
                    return [3 /*break*/, 1];
                case 5:
                    substrs.push(str.slice(i));
                    return [4 /*yield*/, Promise.all(substrs)];
                case 6: return [2 /*return*/, (_d.sent()).join('')];
            }
        });
    });
}
;
function findTemplate(name) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, source;
        return __generator(this, function (_a) {
            try {
                dir = process.env.TEMPLATE_PATH || path_1.join(__dirname, "templates");
                source = fs_1.readFileSync(path_1.join(dir, name + ".md")).toString();
                return [2 /*return*/, {
                        name: name,
                        source: source,
                        version: "0"
                    }];
            }
            catch (e) {
                throw Error("resource not found: " + name);
            }
            return [2 /*return*/];
        });
    });
}
exports.findTemplate = findTemplate;
function compileTemplate(template, replacements) {
    if (replacements === void 0) { replacements = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var md, missingReplacements, replacementKeys, replace, source, fm, _a, body, _b, _c, text;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    md = markdown_it_1.default({
                        html: true,
                        xhtmlOut: true,
                        typographer: true
                    });
                    missingReplacements = [];
                    replacementKeys = Object.keys(replacements);
                    replace = function (source) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, asyncStringReplace(source, /\{\s*([^\{\s]*)\s*\}/gm, function (_, substring) { return __awaiter(_this, void 0, void 0, function () {
                                        var _a;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    if (/^func\:/.test(replacements[substring])) {
                                                        replacements[substring] = eval(replacements[substring]);
                                                    }
                                                    if (!(replacementKeys && replacementKeys.indexOf(substring) >= 0)) return [3 /*break*/, 3];
                                                    if (!(typeof replacements[substring] === "function")) return [3 /*break*/, 2];
                                                    return [4 /*yield*/, replacements[substring](replacements)];
                                                case 1: return [2 /*return*/, _b.sent()];
                                                case 2: return [2 /*return*/, replacements[substring]];
                                                case 3:
                                                    if (!/\.md$/.test(substring)) return [3 /*break*/, 6];
                                                    _a = replace;
                                                    return [4 /*yield*/, findTemplate(substring.replace(/\.md$/, ""))];
                                                case 4: return [4 /*yield*/, _a.apply(void 0, [(_b.sent()).source])];
                                                case 5: return [2 /*return*/, _b.sent()];
                                                case 6:
                                                    if (!missingReplacements.includes(substring)) {
                                                        missingReplacements.push(substring);
                                                    }
                                                    return [2 /*return*/, substring];
                                            }
                                        });
                                    }); })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); };
                    return [4 /*yield*/, replace(template.source)];
                case 1:
                    source = _d.sent();
                    _a = front_matter_1.default;
                    return [4 /*yield*/, source];
                case 2:
                    fm = _a.apply(void 0, [_d.sent()]);
                    _c = (_b = md).render;
                    return [4 /*yield*/, fm.body];
                case 3:
                    body = _c.apply(_b, [_d.sent()]);
                    text = html_to_text_1.default.fromString(body);
                    return [2 /*return*/, __assign({ subject: fm.attributes.subject || "", body: body,
                            text: text, metadata: fm.attributes }, (missingReplacements.length ? { missingReplacements: missingReplacements } : {}))];
            }
        });
    });
}
exports.compileTemplate = compileTemplate;
