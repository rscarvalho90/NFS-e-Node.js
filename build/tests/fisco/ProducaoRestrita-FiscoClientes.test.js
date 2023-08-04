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
const AssinaturaXmlNfse_1 = require("../../src/util/AssinaturaXmlNfse");
const fs_1 = __importDefault(require("fs"));
const GeraId_1 = require("../../src/util/GeraId");
const XmlUtil_1 = require("../../src/util/XmlUtil");
const node_gzip_1 = __importDefault(require("node-gzip"));
const senhaCertificado = "senha1";
const ambiente = Ambiente_1.Ambiente.PRODUCAO_RESTRITA;
const pathCertificado = "res/certificados_producao_restrita/461523_MUNICIPIO_DE_PACARAIMA.p12";
const pathXml = "tests/exemplos/Teste Producao Restrita.xml";
describe("Produção Restrita - Fisco", () => {
    let chaveAcesso;
    let nsu;
    let conteudoXmlAssinado;
    let dataHoraGeracao;
    describe("ADN", () => {
        const adnCliente = new AdnCliente_1.AdnCliente(ambiente, pathCertificado, senhaCertificado);
        test("Retorna DFEs (NSU Distribuição)", () => __awaiter(void 0, void 0, void 0, function* () {
            const axiosResponse = yield adnCliente.retornaDocumentosFiscais(1, TipoNsuEnum_1.TipoNsuEnum.DISTRIBUICAO, true);
            const ultimoDocumento = axiosResponse.data.LoteDFe.length - 1;
            chaveAcesso = axiosResponse.data.LoteDFe[ultimoDocumento].ChaveAcesso;
            expect(axiosResponse.data.LoteDFe[ultimoDocumento].DataHoraGeracao).toBe("2023-04-18T18:54:11.363");
            //let conteudoXml = await descomprimeGzipDeBase64(axiosResponse.data.LoteDFe[0].ArquivoXml as string);
        }));
        test("Envia DFE para ADN", () => __awaiter(void 0, void 0, void 0, function* () {
            let conteudoXml = fs_1.default.readFileSync(pathXml, "utf8");
            conteudoXml = conteudoXml.replace(/(<tribNac)( )?(\/>)/g, "");
            const numNfse = (0, GeraId_1.geraIdNfse)(conteudoXml);
            const numDps = (0, GeraId_1.geraIdDps)(conteudoXml);
            conteudoXml = (0, XmlUtil_1.modificaValorTagXml)(conteudoXml, "NFSe.infNFSe['0']['$'].Id", numNfse);
            conteudoXml = (0, XmlUtil_1.modificaValorTagXml)(conteudoXml, "NFSe.infNFSe['0'].DPS['0'].infDPS['0']['$'].Id", numDps);
            conteudoXml = (0, AssinaturaXmlNfse_1.removeAssinaturaNfse)(conteudoXml);
            conteudoXmlAssinado = yield (0, AssinaturaXmlNfse_1.assinaStringXml)(conteudoXml, "infNFSe", pathCertificado, senhaCertificado);
            const resposta = yield adnCliente.recepcionaLoteDfeXml([conteudoXmlAssinado]);
            chaveAcesso = resposta.data.Lote[0].ChaveAcesso;
            nsu = parseInt(resposta.data.Lote[0].NsuRecepcao);
        }));
        test("Retorna DFE Transmitida (NSU Recepção)", () => __awaiter(void 0, void 0, void 0, function* () {
            const axiosResponse = yield adnCliente.retornaDocumentosFiscais(nsu - 1, TipoNsuEnum_1.TipoNsuEnum.RECEPCAO, true);
            dataHoraGeracao = new Date(axiosResponse.data.LoteDFe[0].DataHoraGeracao);
            expect(new Date(axiosResponse.data.LoteDFe[0].DataHoraGeracao).getTime()).toBeLessThan(new Date().getTime());
            expect(axiosResponse.data.LoteDFe[0].ChaveAcesso).toBe(chaveAcesso);
            expect(axiosResponse.data.LoteDFe[0].ArquivoXml).toBe(Buffer.from(yield node_gzip_1.default.gzip(conteudoXmlAssinado)).toString("base64"));
            expect(axiosResponse.data.LoteDFe[0].TipoDocumento).toBe("NFSE");
        }));
        test("Retorna Eventos", () => __awaiter(void 0, void 0, void 0, function* () {
            const axiosResponse = yield adnCliente.retornaEventos(chaveAcesso);
            expect([axiosResponse.data.LoteDFe[0].ChaveAcesso,
                axiosResponse.data.LoteDFe[0].ArquivoXml,
                axiosResponse.data.LoteDFe[0].DataHoraRecebimento]).toBeDefined();
            expect(axiosResponse.data.LoteDFe[0].TipoDocumento).toBe("NFSE");
            expect(chaveAcesso.length).toBe(50);
            expect(axiosResponse.data.LoteDFe[0].ChaveAcesso).toBe(chaveAcesso);
            expect(new Date(axiosResponse.data.LoteDFe[0].DataHoraRecebimento).getTime()).toBe(dataHoraGeracao.getTime());
            expect(new Date(axiosResponse.data.LoteDFe[0].DataHoraRecebimento).getTime()).toBeLessThan(new Date().getTime());
        }));
    });
});
