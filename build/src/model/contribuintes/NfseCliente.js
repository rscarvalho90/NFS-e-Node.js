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
exports.NfseCliente = void 0;
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = __importDefault(require("xml2js"));
const fs = __importStar(require("fs"));
const AmbienteEnum_1 = require("../../enum/AmbienteEnum");
const xml_crypto_1 = __importDefault(require("xml-crypto"));
const node_gzip_1 = __importDefault(require("node-gzip"));
const HttpConfig_1 = require("../../util/HttpConfig");
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
            let xmlAssinado = yield this.assinaXml(xmlPath);
            xmlAssinado = this.finalizaXml(xmlAssinado);
            const xmlAssinadoGzipBase64 = Buffer.from(yield node_gzip_1.default.gzip(xmlAssinado)).toString("base64");
            return yield axios_1.default.post("https://" + AmbienteEnum_1.ServicoEnum.SEFIN + this.ambiente + "/SefinNacional/nfse", { dpsXmlGZipB64: xmlAssinadoGzipBase64 }, yield this.axiosConfig);
        });
    }
    /**
     * Retorna a NFS-e a partir da consulta pela chave de acesso correspondente (50 posições).
     *
     * @param chaveAcesso Chave de acesso da Nota Fiscal de Serviço Eletrônica (NFS-e)
     */
    retornaNfse(chaveAcesso) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get("https://" + AmbienteEnum_1.ServicoEnum.SEFIN + this.ambiente + "/SefinNacional/nfse/" + chaveAcesso, yield this.axiosConfig).catch((error) => { return error; });
        });
    }
    /**
     * Assina um XML com certificado do tipo A1.
     *
     * @param xmlPath Path (local, caminho) do arquivo XML a ser enviado.
     * @private
     */
    assinaXml(xmlPath) {
        return __awaiter(this, void 0, void 0, function* () {
            // Importa um certificado tipo A1
            const certBuffer = fs.readFileSync(this.pathCertificado);
            // Configura os dados do certificado
            const dadosPkcs12 = yield (0, HttpConfig_1.getDadosPkcs12)(certBuffer, this.senhaCertificado);
            const chavePrivadaConfigurada = dadosPkcs12.key;
            // Configura o assinador
            let assinador = new xml_crypto_1.default.SignedXml();
            const transforms = [
                'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
                'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
            ];
            assinador.addReference("//*[local-name(.)='infDPS']", transforms, "", "", "", "", false);
            assinador.signingKey = Buffer.from(chavePrivadaConfigurada);
            assinador.canonicalizationAlgorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
            assinador.signatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
            assinador.keyInfoProvider = new KeyInfoProvider(dadosPkcs12.cert);
            // Abre o XML a ser assinado
            const xmlString = this.configuraXml(fs.readFileSync(xmlPath, "utf8"));
            // Assina o XML
            assinador.computeSignature(xmlString);
            return assinador.getSignedXml();
        });
    }
    /**
     * Configura o XML antes da assinatura.
     *
     * @param xmlTxt XML, em formato String, a ser configurado.
     * @private
     */
    configuraXml(xmlTxt) {
        xmlTxt = xmlTxt.replace(/\r/g, "");
        xmlTxt = xmlTxt.replace(/\n/g, "");
        xmlTxt = xmlTxt.replace(/\t/g, "");
        return xmlTxt;
    }
    /**
     * Faz as inserções não disponibilizadas por padrão pela biblioteca **SignedXml** do pacote *xml-crypto*.
     * Estas inserções permitem que o XML esteja no formato esperado pela API do Serpro.
     *
     * @param xmlTxt XML a ser finalizado em formato *string*
     * @private
     */
    finalizaXml(xmlTxt) {
        xml2js_1.default.parseString(xmlTxt, (erro, resultado) => {
            resultado.DAO.Signature[0].SignedInfo[0].Reference[0].Transforms[0].Transform[0] = { $: { Algorithm: "http://www.w3.org/2000/09/xmldsig#enveloped-signature" } };
            resultado.DAO.Signature[0].SignedInfo[0].Reference[0].Transforms[0].Transform[1] = { $: { Algorithm: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315" } };
            const builder = new xml2js_1.default.Builder({ renderOpts: { pretty: false } });
            xmlTxt = builder.buildObject(resultado);
        });
        return xmlTxt;
    }
}
exports.NfseCliente = NfseCliente;
/**
 * Configura o xml-crypto para inserir os dados do certificado X509 na assinatura.
 */
class KeyInfoProvider {
    constructor(cert) {
        this.cert = cert;
        this.file = "";
    }
    getKeyInfo(key, prefix) {
        this.cert = this.cert.replace(/\n/g, "");
        this.cert = this.cert.replace("-----BEGIN CERTIFICATE-----", "");
        this.cert = this.cert.replace("-----END CERTIFICATE-----", "");
        return `<X509Data><X509Certificate>${this.cert}</X509Certificate></X509Data>`;
    }
    ;
    getKey(keyInfo) {
        return Buffer.from(this.cert);
    }
    ;
}
