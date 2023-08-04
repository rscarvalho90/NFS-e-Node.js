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
const fs_1 = __importDefault(require("fs"));
/**
 * Classe que realiza integrações com as APIs de envio
 * e consulta da NFS-e Nacional.
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
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
        this.hostRequisicao = (0, Ambiente_1.getHostRequisicao)(this.ambiente, Ambiente_1.AreaAmbienteEnum.CONTRIBUINTE, Ambiente_1.ServicoEnum.NFSE);
    }
    //TODO: Método {@link NfseCliente.enviaDps} não testado devido à indisponibilidade de certificado de contribuinte
    /**
     * Envia um XML contendo uma DPS (Declaração de Prestação de Serviços).
     *
     * @param xmlString String representativa do conteúdo XMl a ser assinado.
     * @return
     */
    enviaDps(xmlString) {
        return __awaiter(this, void 0, void 0, function* () {
            let xmlAssinado = yield (0, AssinaturaXmlNfse_1.assinaStringXml)(xmlString, "infDPS", this.pathCertificado, this.senhaCertificado);
            const xmlAssinadoGzipBase64 = Buffer.from(yield node_gzip_1.default.gzip(xmlAssinado)).toString("base64");
            return yield axios_1.default.post(this.hostRequisicao + "/nfse", { dpsXmlGZipB64: xmlAssinadoGzipBase64 }, yield this.axiosConfig).catch(erro => {
                return erro;
            });
        });
    }
    /**
     * Envia um XML contendo uma DPS (Declaração de Prestação de Serviços).
     *
     * @param xmlPath Path (caminho, na estação cliente) do arquivo XML representativo da DPS a ser enviado.
     * @return
     */
    enviaDpsDeArquivo(xmlPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const xmlString = fs_1.default.readFileSync(xmlPath, "utf8");
            return this.enviaDps(xmlString);
        });
    }
    /**
     * Retorna a NFS-e a partir da consulta pela chave de acesso correspondente (50 posições).
     *
     * @param chaveAcesso Chave de acesso da Nota Fiscal de Serviço Eletrônica (NFS-e)
     */
    retornaNfse(chaveAcesso) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get(this.hostRequisicao + "/nfse/" + chaveAcesso, yield this.axiosConfig).catch((error) => {
                return error;
            });
        });
    }
}
exports.NfseCliente = NfseCliente;
