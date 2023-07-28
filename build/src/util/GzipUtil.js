"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.descomprimeGzipDeBase64 = exports.comprimeGzipDeBase64 = exports.descomprimeGzipDeBuffer = exports.comprimeGzipDeBuffer = void 0;
const node_gzip_1 = __importDefault(require("node-gzip"));
/**
 * Retorna uma string representativa do Buffer compactado (binária)
 * @param buffer O buffer dos dados a serem comprimidos
 */
function comprimeGzipDeBuffer(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        const gzipBuffer = yield node_gzip_1.default.gzip(buffer);
        return gzipBuffer.toString();
    });
}
exports.comprimeGzipDeBuffer = comprimeGzipDeBuffer;
/**
 * Retorna uma string representativa do Buffer do arquivo descompactado (binária)
 * @param buffer O buffer dos dados a serem descomprimidos
 */
function descomprimeGzipDeBuffer(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        const gzipBuffer = yield node_gzip_1.default.ungzip(buffer);
        return gzipBuffer.toString();
    });
}
exports.descomprimeGzipDeBuffer = descomprimeGzipDeBuffer;
function comprimeGzipDeBase64(base64String) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield comprimeGzipDeBuffer(base64ParaBuffer(base64String));
    });
}
exports.comprimeGzipDeBase64 = comprimeGzipDeBase64;
function descomprimeGzipDeBase64(base64String) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield descomprimeGzipDeBuffer(base64ParaBuffer(base64String));
    });
}
exports.descomprimeGzipDeBase64 = descomprimeGzipDeBase64;
function base64ParaBuffer(base64String) {
    return Buffer.from(base64String, 'base64');
}
function bufferParaBase64(buffer) {
    return buffer.toString('base64');
}
