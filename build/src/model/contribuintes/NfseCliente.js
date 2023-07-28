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
exports.NfseCliente = void 0;
const axios_1 = __importDefault(require("axios"));
const Ambiente_1 = require("../../enum/Ambiente");
const node_gzip_1 = __importDefault(require("node-gzip"));
const HttpConfig_1 = require("../../util/HttpConfig");
const AssinaturaXmlNfse_1 = require("../../util/AssinaturaXmlNfse");
/**
 * Classe que realiza integrações com as APIs de envio
 * e consulta da NFS-e Nacional. <br>
 * Documentação: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 */
class NfseCliente {
    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(ambiente, pathCertificado, senhaCertificado) {
        this.ambiente = ambiente;
        this.pathCertificado = pathCertificado;
        this.senhaCertificado = senhaCertificado;
        this.axiosConfig = (0, HttpConfig_1.getConfiguracoesHttpAxios)(this.pathCertificado, this.senhaCertificado);
    }
    //TODO: Método {@link NfseCliente.enviaDps} não testado devido à indisponibilidade de certificado de contribuinte
    /**
     * Envia um XML contendo uma DPS (Declaração de Prestação de Serviços).
     *
     * @param xmlPath Path (local, caminho) do arquivo XML a ser enviado.
     * @return
     */
    enviaDps(xmlPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let xmlAssinado = yield (0, AssinaturaXmlNfse_1.assinaArquivoXml)(xmlPath, "infDPS", this.pathCertificado, this.senhaCertificado);
            xmlAssinado = (0, AssinaturaXmlNfse_1.finalizaXml)(xmlAssinado);
            const xmlAssinadoGzipBase64 = Buffer.from(yield node_gzip_1.default.gzip(xmlAssinado)).toString("base64");
            return yield axios_1.default.post("https://" + Ambiente_1.ServicoEnum.SEFIN + this.ambiente + "/SefinNacional/nfse", { dpsXmlGZipB64: xmlAssinadoGzipBase64 }, yield this.axiosConfig);
        });
    }
    /**
     * Retorna a NFS-e a partir da consulta pela chave de acesso correspondente (50 posições).
     *
     * @param chaveAcesso Chave de acesso da Nota Fiscal de Serviço Eletrônica (NFS-e)
     */
    retornaNfse(chaveAcesso) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get("https://" + Ambiente_1.ServicoEnum.SEFIN + this.ambiente + "/SefinNacional/nfse/" + chaveAcesso, yield this.axiosConfig).catch((error) => { return error; });
        });
    }
}
exports.NfseCliente = NfseCliente;
