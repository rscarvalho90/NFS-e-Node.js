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
const NfseCliente_1 = require("../../src/model/contribuintes/NfseCliente");
const Ambiente_1 = require("../../src/enum/Ambiente");
const XmlUtil_1 = require("../../src/util/XmlUtil");
const fs_1 = __importDefault(require("fs"));
const GeraId_1 = require("../../src/util/GeraId");
const GzipUtil_1 = require("../../src/util/GzipUtil");
const xml2js_1 = __importDefault(require("xml2js"));
const utf8_1 = __importDefault(require("utf8"));
const AssinaturaXmlNfse_1 = require("../../src/util/AssinaturaXmlNfse");
const date_and_time_1 = __importDefault(require("date-and-time"));
const DanfseCliente_1 = require("../../src/model/contribuintes/DanfseCliente");
const DfeCliente_1 = require("../../src/model/contribuintes/DfeCliente");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const ParametrosMunicipaisContribuinteCliente_1 = require("../../src/model/contribuintes/ParametrosMunicipaisContribuinteCliente");
const senhaCertificado = "senha1";
const ambiente = Ambiente_1.Ambiente.HOMOLOGACAO;
const pathCertificado = "res/certificados_homologacao/Certificados de Contribuintes/462469_03763656000154 (1).p12";
const pathXml = "tests/exemplos/RN0-DPS-_Correto.xml";
describe(`${ambiente.nome} - Contribuinte`, () => {
    let chaveAcesso;
    let conteudoXmlAssinado, nfseXmlGZipB64, nsu;
    describe("Sefin NFS-e", () => {
        const nfseCliente = new NfseCliente_1.NfseCliente(ambiente, pathCertificado, senhaCertificado);
        test("Transmite DPS", () => __awaiter(void 0, void 0, void 0, function* () {
            let conteudoXml = fs_1.default.readFileSync(pathXml, "utf8");
            let xmlJson;
            xml2js_1.default.parseString(conteudoXml, (erro, resultado) => {
                xmlJson = resultado;
            });
            conteudoXml = conteudoXml.replace(/(<tribNac)( )?(\/>)/g, "");
            conteudoXml = (0, XmlUtil_1.modificaValorTagXml)(conteudoXml, "DPS.infDPS['0'].nDPS['0']", String(parseInt(xmlJson.DPS.infDPS[0].nDPS[0]) + 1));
            const idDps = (0, GeraId_1.geraIdDps)(conteudoXml);
            conteudoXml = (0, XmlUtil_1.modificaValorTagXml)(conteudoXml, "DPS.infDPS['0']['$'].Id", idDps);
            const axiosResponse = yield nfseCliente.enviaDps(conteudoXml);
            expect([axiosResponse.data.chaveAcesso, axiosResponse.data.nfseXmlGZipB64]).toBeDefined();
            fs_1.default.writeFileSync(pathXml, conteudoXml); // Salva o novo XML para controle do número da DPS para testes futuros
            chaveAcesso = axiosResponse.data.chaveAcesso;
            nfseXmlGZipB64 = axiosResponse.data.nfseXmlGZipB64;
            const xml = yield (0, GzipUtil_1.descomprimeGzipDeBase64)(axiosResponse.data.nfseXmlGZipB64);
            conteudoXmlAssinado = yield (0, AssinaturaXmlNfse_1.assinaStringXml)((0, AssinaturaXmlNfse_1.configuraXml)(conteudoXml), "infDPS", pathCertificado, senhaCertificado);
            expect((0, AssinaturaXmlNfse_1.configuraXml)((0, XmlUtil_1.extraiDpsDaNfse)(xml)[0])).toBe((0, AssinaturaXmlNfse_1.configuraXml)(conteudoXmlAssinado));
        }));
        test("Consulta DPS enviada", () => __awaiter(void 0, void 0, void 0, function* () {
            const axiosResponse = yield nfseCliente.retornaNfse(chaveAcesso);
            const xml = yield (0, GzipUtil_1.descomprimeGzipDeBase64)(axiosResponse.data.nfseXmlGZipB64);
            let xmlJson;
            xml2js_1.default.parseString(xml, (erro, resultado) => {
                xmlJson = resultado;
            });
            nsu = xmlJson.NFSe.infNFSe[0].nNFSe[0];
            //expect(axiosResponse.data.nfseXmlGZipB64).toBe(nfseXmlGZipB64); // Está havendo um erro de codificação entre os retornos
            expect((0, AssinaturaXmlNfse_1.configuraXml)((0, XmlUtil_1.extraiDpsDaNfse)(utf8_1.default.decode(xml))[0])).toBe((0, AssinaturaXmlNfse_1.configuraXml)(conteudoXmlAssinado));
        }));
        // FIXME - Teste ignorado devido ao fato da funcionalidade não estar disponível em nenhum dos ambientes
        test.skip("Consulta NFS-e pagáveis", () => __awaiter(void 0, void 0, void 0, function* () {
            let xmlJson;
            xml2js_1.default.parseString(conteudoXmlAssinado, (erro, resultado) => {
                xmlJson = resultado;
            });
            let inscricaoFederal;
            const mesCompetencia = date_and_time_1.default.format(new Date(xmlJson.DPS.infDPS[0].dhEmi[0]), "YYMM");
            const codigoMunicipal = xmlJson.DPS.infDPS[0].cLocEmi[0];
            try {
                inscricaoFederal = xmlJson.DPS.infDPS[0].prest[0].CNPJ[0];
            }
            catch (e) {
                inscricaoFederal = xmlJson.DPS.infDPS[0].prest[0].CPF[0];
            }
            const axiosResponse = yield nfseCliente.retornaNfsePagaveis(inscricaoFederal, mesCompetencia, codigoMunicipal, 1);
        }));
    });
    // FIXME - Teste com falha devido ao PDF estar retornando em branco
    describe("Sefin DANFS-e", () => {
        // PDF saindo em branco
        test("Consulta DANFS-e", () => __awaiter(void 0, void 0, void 0, function* () {
            const danfseCliente = new DanfseCliente_1.DanfseCliente(ambiente, pathCertificado, senhaCertificado);
            const axiosResponse = yield danfseCliente.retornaDanfse(chaveAcesso);
            const pdfBinario = Buffer.from(axiosResponse.data, "utf-8");
            expect(axiosResponse.data.substring(0, 8)).toContain("%PDF-1.4");
            const pdf = yield (0, pdf_parse_1.default)(pdfBinario);
            fs_1.default.writeFileSync("res/danfses/DANFSe_teste.pdf", pdfBinario);
            expect(pdf.text.match("/(" + chaveAcesso + ")/g")).toContain(chaveAcesso);
        }));
    });
    // FIXME - Teste com falha devido a erro do certificado no ambiente de homologação
    describe("ADN DF-e", () => {
        test("Distribui DF-e por NSU", () => __awaiter(void 0, void 0, void 0, function* () {
            let dfeCliente = new DfeCliente_1.DfeCliente(ambiente, pathCertificado, senhaCertificado);
            const axiosResponse = yield dfeCliente.distribuiDfe(nsu);
            expect(axiosResponse.constructor.name).not.toBe("AxiosError");
        }));
        test("Distribui DF-e por Chave de Acesso", () => __awaiter(void 0, void 0, void 0, function* () {
            let dfeCliente = new DfeCliente_1.DfeCliente(ambiente, pathCertificado, senhaCertificado);
            const axiosResponse = yield dfeCliente.distribuiDfe(chaveAcesso);
            expect(axiosResponse.constructor.name).not.toBe("AxiosError");
        }));
    });
    describe("Parâmetros Municipais", () => {
        const pmContribuinte = new ParametrosMunicipaisContribuinteCliente_1.ParametrosMunicipaisContribuinteCliente(ambiente, pathCertificado, senhaCertificado);
        const codigoMunicipio = 4309001;
        test("Retorna Alíquota", () => __awaiter(void 0, void 0, void 0, function* () {
            const codigoServico = "01.01.01.000";
            const competencia1 = date_and_time_1.default.parse("01/09/2022", "DD/MM/YYYY");
            const competencia2 = date_and_time_1.default.parse("09/01/2022", "DD/MM/YYYY");
            let axiosResponse = yield pmContribuinte.retornaAliquotas(codigoMunicipio, codigoServico, competencia1);
            expect(axiosResponse.data.mensagem).toBe("Alíquotas recuperadas com sucesso.");
            expect(axiosResponse.data.aliquotas[codigoServico][0].aliq).toBe(5);
            axiosResponse = yield pmContribuinte.retornaAliquotas(4309001, codigoServico, competencia2);
            expect(axiosResponse.data).toBeUndefined();
        }));
        test("Retorna Histórico Alíquotas", () => __awaiter(void 0, void 0, void 0, function* () {
            const codigoServico = "01.01.01.000";
            const axiosResponse = yield pmContribuinte.retornaHistoricoAliquotas(codigoMunicipio, codigoServico);
            expect(axiosResponse.data.mensagem).toBe("Histórico de alíquotas recuperadas com sucesso.");
            expect(axiosResponse.data.aliquotas[codigoServico][0].aliq).toBe(5);
        }));
        test("Retorna Parâmetros Convênio", () => __awaiter(void 0, void 0, void 0, function* () {
            const axiosResponse = yield pmContribuinte.retornaParametrosConvenio(codigoMunicipio);
            expect(axiosResponse.data.mensagem).toBe("Parâmetros do convênio recuperados com sucesso.");
            expect([axiosResponse.data.parametrosConvenio.aderenteAmbienteNacional,
                axiosResponse.data.parametrosConvenio.aderenteEmissorNacional,
                axiosResponse.data.parametrosConvenio.origCad,
                axiosResponse.data.parametrosConvenio.aderenteMAN,
                axiosResponse.data.parametrosConvenio.permiteAproveitamentoDeCreditos]).toBeDefined();
        }));
        test("Retorna Parâmetros Regime Especial", () => __awaiter(void 0, void 0, void 0, function* () {
            let codigoServico = "01.01.01.000";
            const competencia = date_and_time_1.default.parse("01/09/2022", "DD/MM/YYYY");
            let axiosResponse = yield pmContribuinte.retornaParametrosRegimeEspecial(codigoMunicipio, codigoServico, competencia);
            expect(axiosResponse.response.data.mensagem).toBe("Parâmetros de regimes especiais não encontrados.");
            codigoServico = "01.02.01.000";
            axiosResponse = yield pmContribuinte.retornaParametrosRegimeEspecial(codigoMunicipio, codigoServico, competencia);
            expect(axiosResponse.data.mensagem).toBe("Parâmetros de regimes especiais recuperados com sucesso.");
            expect(axiosResponse.data.regimesEspeciais[codigoServico].toString()).toBe({
                "-1590865684": [
                    {
                        "sit": 3,
                        "dtIni": "2022-08-13T00:00:00",
                        "motivo": ""
                    }
                ]
            }.toString());
        }));
        test("Retorna Prâmetros Retenção", () => __awaiter(void 0, void 0, void 0, function* () {
            const competencia = date_and_time_1.default.parse("01/09/2022", "DD/MM/YYYY");
            const axiosResponse = yield pmContribuinte.retornaParametrosRetencao(codigoMunicipio, competencia);
            expect(axiosResponse.data.retencoes.toString()).toBe({
                "art6": {
                    "habilitado": true,
                    "hist": [
                        {
                            "dtIni": "2022-08-12T00:00:00"
                        }
                    ]
                },
                "retMun": []
            }.toString());
        }));
        test("Retorna Parâmetros Benefício", () => __awaiter(void 0, void 0, void 0, function* () {
            let numeroBeneficio = 43090010200001;
            const competencia = date_and_time_1.default.parse("01/09/2022", "DD/MM/YYYY");
            let axiosResponse = yield pmContribuinte.retornaParametrosBeneficio(codigoMunicipio, numeroBeneficio, competencia);
            expect(axiosResponse.data.beneficio.toString()).toBe({
                "numBenef": "43090010200001",
                "desc": "Benefício teste",
                "dtIni": "2022-08-13T00:00:00",
                "tpoBenef": 2,
                "tpoRedBC": 2,
                "redPerclBC": 60,
                "serv": [
                    {
                        "codigo": "01.02.01.000",
                        "dtIni": "2022-08-13T00:00:00"
                    }
                ],
                "contrib": []
            }.toString());
            numeroBeneficio = 43090010200125;
            axiosResponse = yield pmContribuinte.retornaParametrosBeneficio(codigoMunicipio, numeroBeneficio, competencia);
            expect(axiosResponse.response.data.mensagem).toBe(`Parâmetros do benefício de número  <${numeroBeneficio}> não encontrados para a competência`);
            expect(axiosResponse.data).toBeUndefined();
        }));
    });
});
