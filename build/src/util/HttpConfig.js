"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIp = exports.getConfiguracoesHttpAxios = exports.getDadosPkcs12 = void 0;
const fs = __importStar(require("fs"));
const https_1 = __importDefault(require("https"));
const pem_1 = __importDefault(require("pem"));
const axios_1 = __importDefault(require("axios"));
/**
 * Retorna os dados do certificado PKCS12.
 * @param certBuffer Buffer do certificado (pode ser obtido pelo método "fs.readFileSync")
 * @param senhaCertificado Senha do arquivo do certificado.
 * @private
 */
function getDadosPkcs12(certBuffer, senhaCertificado) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            pem_1.default.readPkcs12(certBuffer, { p12Password: senhaCertificado }, (err, cert) => {
                if (cert.key != undefined) {
                    resolve(cert);
                    return;
                }
                else {
                    reject(err);
                    return;
                }
            });
        }));
    });
}
exports.getDadosPkcs12 = getDadosPkcs12;
/**
 * Retorna as configurações HTTP do Axios.
 * @param pathCertificado Local, na estação de execução do serviço, em que se encontra o certificado para assinatura do XML.
 * @param senhaCertificado Senha do arquivo do certificado.
 */
function getConfiguracoesHttpAxios(pathCertificado, senhaCertificado) {
    return __awaiter(this, void 0, void 0, function* () {
        // Importa um certificado tipo A1
        const certBuffer = fs.readFileSync(pathCertificado);
        const dadosPkcs12 = yield getDadosPkcs12(certBuffer, senhaCertificado);
        const httpsAgent = new https_1.default.Agent({
            cert: dadosPkcs12.cert,
            key: dadosPkcs12.key,
            ca: dadosPkcs12.ca,
            keepAlive: false,
            rejectUnauthorized: false
        });
        return {
            headers: {},
            httpsAgent: httpsAgent
        };
    });
}
exports.getConfiguracoesHttpAxios = getConfiguracoesHttpAxios;
/**
 * Retorna o IP (público) atual do cliente.
 *
 * @private
 */
function getIp() {
    return __awaiter(this, void 0, void 0, function* () {
        let jsonResposta = (yield axios_1.default.get("https://api.myip.com")).data;
        return jsonResposta["ip"];
    });
}
exports.getIp = getIp;
