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
const AdnCliente_1 = require("../../src/model/fiscos/AdnCliente");
const Ambiente_1 = require("../../src/enum/Ambiente");
const TipoNsuEnum_1 = require("../../src/enum/TipoNsuEnum");
const SefinNacionalCliente_1 = require("../../src/model/fiscos/SefinNacionalCliente");
const NfseCliente_1 = require("../../src/model/contribuintes/NfseCliente");
const AssinaturaXmlNfse_1 = require("../../src/util/AssinaturaXmlNfse");
const fs_1 = __importDefault(require("fs"));
const GeraId_1 = require("../../src/util/GeraId");
const XmlUtil_1 = require("../../src/util/XmlUtil");
const senhaCertificado = "senha1";
const ambiente = Ambiente_1.Ambiente.PRODUCAO_RESTRITA;
const pathCertificado = "res/certificados_producao_restrita/461523_MUNICIPIO_DE_PACARAIMA.p12";
const pathXml = "tests/exemplos/teste.xml";
describe("Testes", () => {
    let chaveAcesso;
    const adnCliente = new AdnCliente_1.AdnCliente(ambiente, pathCertificado, senhaCertificado);
    const sefinCliente = new SefinNacionalCliente_1.SefinNacionalCliente(ambiente, pathCertificado, senhaCertificado);
    const nfseCliente = new NfseCliente_1.NfseCliente(ambiente, pathCertificado, senhaCertificado);
    test("Teste Retorna DFEs", () => __awaiter(void 0, void 0, void 0, function* () {
        const axiosResponse = yield adnCliente.retornaDocumentosFiscais(1, TipoNsuEnum_1.TipoNsuEnum.DISTRIBUICAO, true);
        const ultimoDocumento = axiosResponse.data.LoteDFe.length - 1;
        chaveAcesso = axiosResponse.data.LoteDFe[ultimoDocumento].ChaveAcesso;
        expect(axiosResponse.data.LoteDFe[ultimoDocumento].DataHoraGeracao).toBe("2023-04-18T18:54:11.363");
        //let conteudoXml = await descomprimeGzipDeBase64(axiosResponse.data.LoteDFe[0].ArquivoXml as string);
        let conteudoXml = fs_1.default.readFileSync(pathXml, "utf8");
        conteudoXml = conteudoXml.replace("<tribNac />", "");
        const numNfse = (0, GeraId_1.geraIdNfse)(conteudoXml);
        conteudoXml = (0, XmlUtil_1.modificaValorTagXml)(conteudoXml, "NFSe.infNFSe['0']['$'].Id", numNfse);
        conteudoXml = (0, AssinaturaXmlNfse_1.removeAssinaturaNfse)(conteudoXml);
        conteudoXml = (0, AssinaturaXmlNfse_1.configuraXml)(conteudoXml);
        const conteudoXmlAssinado = yield (0, AssinaturaXmlNfse_1.assinaStringXml)(conteudoXml, "infNFSe", pathCertificado, senhaCertificado);
        const resposta = yield adnCliente.recepcionaLoteDfeXml([conteudoXmlAssinado]);
        resposta.data;
    }));
    test("Teste Retorna Eventos", () => __awaiter(void 0, void 0, void 0, function* () {
        const axiosResponse = yield adnCliente.retornaEventos(chaveAcesso);
        expect(axiosResponse.data.LoteDFe[0].DataHoraRecebimento).toBe("2022-09-28T16:43:19.973");
    }));
    test("Teste Retorna NFS-e", () => __awaiter(void 0, void 0, void 0, function* () {
        const axiosResponse = yield nfseCliente.retornaNfse(chaveAcesso);
        expect(axiosResponse.data.LoteDFe[0].DataHoraRecebimento).toBe("2022-09-28T16:43:19.973");
    }));
});
