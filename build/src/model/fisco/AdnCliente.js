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
exports.AdnCliente = void 0;
const axios_1 = __importDefault(require("axios"));
const AmbienteEnum_1 = require("../../enum/AmbienteEnum");
const HttpConfig_1 = require("../../util/HttpConfig");
const fs = __importStar(require("fs"));
class AdnCliente {
    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(ambiente, pathCertificado, senhaCertificado) {
        this.ambiente = ambiente;
        this.pathCertificado = pathCertificado;
        this.senhaCertificado = senhaCertificado;
    }
    /**
     * Recepciona um lote de Documentos
     * @param gzipPath Path (local, caminho) do arquivo gzip com o lote de documentos a ser enviado.
     */
    recepcionaDfe(gzipPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const loteXmlGzip = Buffer.from(gzipPath).toString("base64");
            // Importa um certificado tipo A1
            const certBuffer = fs.readFileSync(this.pathCertificado);
            const dadosPkcs12 = yield (0, HttpConfig_1.getDadosPkcs12)(certBuffer, this.senhaCertificado);
            const certificadoBase64 = Buffer.from(dadosPkcs12.cert, "utf-8").toString("base64");
            const ip = yield (0, HttpConfig_1.getIp)();
            const axiosConfig = yield (0, HttpConfig_1.getConfiguracoesHttpAxios)(this.pathCertificado, this.senhaCertificado);
            axiosConfig.headers["X-SSL-Client-Cert"] = certificadoBase64;
            axiosConfig.headers["X-Forwarded-For"] = ip;
            return yield axios_1.default.post("https://" + AmbienteEnum_1.ServicoEnum.ADN + this.ambiente + "/dfe", { LoteXmlGZipB64: loteXmlGzip }, axiosConfig);
        });
    }
    /**
     * Retorna um lote contendo até 100 (cem) Documentos Fiscais de Serviço a partir do NSU informado (inclusive)
     * @param nsuInicial Primeiro NSU a ser retornado
     * @param tipoNsu Tipo do NSU (RECEPCAO, DISTRIBUICAO, MEI)
     * @param lote Retorna lote (true) ou apenas o documento referente ao NSU (false)
     */
    retornaDocumentosFiscais(nsuInicial, tipoNsu, lote) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("https://" + AmbienteEnum_1.ServicoEnum.ADN + this.ambiente + "/municipios/dfe/" + nsuInicial + "?tipoNSU=" + tipoNsu + "&lote=" + lote);
            const axiosConfig = yield (0, HttpConfig_1.getConfiguracoesHttpAxios)(this.pathCertificado, this.senhaCertificado);
            return yield axios_1.default.get("https://" + AmbienteEnum_1.ServicoEnum.SEFIN + this.ambiente + "/municipios/dfe/" + nsuInicial + "?tipoNSU=" + tipoNsu + "&lotes=" + lote, axiosConfig);
        });
    }
}
exports.AdnCliente = AdnCliente;
