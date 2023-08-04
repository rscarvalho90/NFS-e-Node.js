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
exports.removeAssinaturaNfse = exports.configuraXml = exports.assinaArquivoXml = exports.assinaStringXml = void 0;
const fs = __importStar(require("fs"));
const HttpConfig_1 = require("./HttpConfig");
const xml_crypto_1 = __importDefault(require("xml-crypto"));
/**
 * Assina um XML com certificado do tipo A1.
 *
 * @param xmlStr XML em formato string.
 * @param tagAssinatura Tag a ser assinada no XML
 * @param pathCertificado Path (local, caminho) do certificado digital a ser utilizado na assinatura.
 * @param senhaCertificado Senha do certificado digital
 * @private
 */
function assinaStringXml(xmlStr, tagAssinatura, pathCertificado, senhaCertificado) {
    return __awaiter(this, void 0, void 0, function* () {
        // Importa um certificado tipo A1
        const certBuffer = fs.readFileSync(pathCertificado);
        // Configura os dados do certificado
        const dadosPkcs12 = yield (0, HttpConfig_1.getDadosPkcs12)(certBuffer, senhaCertificado);
        const chavePrivadaConfigurada = dadosPkcs12.key;
        // Configura o assinador
        let assinador = new xml_crypto_1.default.SignedXml();
        const transforms = [
            'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
            'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
        ];
        assinador.addReference("//*[local-name(.)='" + tagAssinatura + "']", transforms, "", "", "", "", false);
        assinador.signingKey = Buffer.from(chavePrivadaConfigurada);
        assinador.canonicalizationAlgorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
        assinador.signatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
        assinador.keyInfoProvider = new KeyInfoProvider(dadosPkcs12.cert);
        // Abre o XML a ser assinado
        const xmlString = configuraXml(xmlStr);
        // Assina o XML
        assinador.computeSignature(xmlString);
        return assinador.getSignedXml();
    });
}
exports.assinaStringXml = assinaStringXml;
/**
 * Assina um XML com certificado do tipo A1.
 *
 * @param xmlPath Path (local, caminho) do arquivo XML a ser enviado.
 * @param tagAssinatura Tag a ser assinada no XML
 * @param pathCertificado Path (local, caminho) do certificado digital a ser utilizado na assinatura.
 * @param senhaCertificado Senha do certificado digital
 * @private
 */
function assinaArquivoXml(xmlPath, tagAssinatura, pathCertificado, senhaCertificado) {
    return __awaiter(this, void 0, void 0, function* () {
        return assinaStringXml(fs.readFileSync(xmlPath, "utf8"), tagAssinatura, pathCertificado, senhaCertificado);
    });
}
exports.assinaArquivoXml = assinaArquivoXml;
/**
 * Configura o XML antes da assinatura.
 *
 * @param xmlTxt XML, em formato String, a ser configurado.
 * @private
 */
function configuraXml(xmlTxt) {
    xmlTxt = xmlTxt.replace(/\r/g, "");
    xmlTxt = xmlTxt.replace(/\n/g, "");
    xmlTxt = xmlTxt.replace(/\t/g, "");
    xmlTxt = xmlTxt.replace(/( ){2,}/g, " ");
    xmlTxt = xmlTxt.replace(/(> )/g, ">");
    xmlTxt = xmlTxt.replace(/( <)/g, "<");
    return xmlTxt;
}
exports.configuraXml = configuraXml;
function removeAssinaturaNfse(conteudoXml) {
    return conteudoXml.replace(/(<Signature)(.|(\r\n|\r|\n))*(\/Signature>)/gi, "");
}
exports.removeAssinaturaNfse = removeAssinaturaNfse;
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
