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
const Ambiente_1 = require("../../../enum/Ambiente");
const HttpConfig_1 = require("../../../util/HttpConfig");
const fs = __importStar(require("fs"));
const node_gzip_1 = __importDefault(require("node-gzip"));
const Cliente_1 = require("../Cliente");
/**
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/fisco/
 */
class AdnCliente extends Cliente_1.Cliente {
    constructor() {
        super(...arguments);
        this.hostRequisicao = (0, Ambiente_1.getHostRequisicao)(this.ambiente, Ambiente_1.AreaAmbienteEnum.FISCO, Ambiente_1.ServicoEnum.ADN);
    }
    /**
     * Recepciona um lote de Documentos
     * @param loteGzipBase64 Arquivo Gzip, em base64, contendo o lote de documentos fiscais.
     */
    recepcionaLoteDfe(loteGzipBase64) {
        return __awaiter(this, void 0, void 0, function* () {
            // Importa um certificado tipo A1
            const certBuffer = fs.readFileSync(this.pathCertificado);
            const dadosPkcs12 = yield (0, HttpConfig_1.getDadosPkcs12)(certBuffer, this.senhaCertificado);
            const certificadoBase64 = Buffer.from(dadosPkcs12.cert, "utf-8").toString("base64");
            const ip = yield (0, HttpConfig_1.getIp)();
            const axiosConfig = yield this.axiosConfig;
            axiosConfig.headers["X-SSL-Client-Cert"] = certificadoBase64;
            axiosConfig.headers["X-Forwarded-For"] = ip;
            return yield axios_1.default.post(`${this.hostRequisicao}/dfe`, { LoteXmlGZipB64: loteGzipBase64 }, axiosConfig).catch((erro) => {
                return erro;
            });
        });
    }
    /**
     * Recepciona um lote de Documentos
     * @param xmlStrings Lista de strings representando os documentos a serem enviados.
     */
    recepcionaLoteDfeXml(xmlStrings) {
        return __awaiter(this, void 0, void 0, function* () {
            let loteGzipBase64 = [];
            for (const xmlString of xmlStrings) {
                loteGzipBase64.push(Buffer.from(yield node_gzip_1.default.gzip(xmlString)).toString("base64"));
            }
            return this.recepcionaLoteDfe(loteGzipBase64);
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
            return yield axios_1.default.get(`${this.hostRequisicao}/municipios/dfe/${nsuInicial}?tipoNSU=${tipoNsu}&lotes=${lote}`, yield this.axiosConfig).catch((erro) => {
                return erro;
            });
        });
    }
    /**
     * Retorna um lote contendo até 100 (cem) Documentos Fiscais de Serviço do tipo Evento vinculados à chave de acesso informada.
     *
     * @param chaveAcesso Chave de acesso da Nota Fiscal de Serviço Eletrônica (NFS-e)
     */
    retornaEventos(chaveAcesso) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get(`${this.hostRequisicao}/municipios/NFSe/${chaveAcesso}/Eventos`, yield this.axiosConfig).catch((erro) => {
                return erro;
            });
        });
    }
}
exports.AdnCliente = AdnCliente;
