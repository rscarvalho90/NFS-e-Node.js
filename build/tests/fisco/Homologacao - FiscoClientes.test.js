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
exports.testeFiscoHom = void 0;
const AdnCliente_1 = require("../../src/model/clientes/fiscos/AdnCliente");
const Ambiente_1 = require("../../src/enum/Ambiente");
const TipoNsuEnum_1 = require("../../src/enum/TipoNsuEnum");
const AssinaturaXmlNfse_1 = require("../../src/util/AssinaturaXmlNfse");
const fs_1 = __importDefault(require("fs"));
const GeraId_1 = require("../../src/util/GeraId");
const XmlUtil_1 = require("../../src/util/XmlUtil");
const GzipUtil_1 = require("../../src/util/GzipUtil");
const date_and_time_1 = __importDefault(require("date-and-time"));
const ParametrosMunicipaisFiscoCliente_1 = require("../../src/model/clientes/fiscos/ParametrosMunicipaisFiscoCliente");
const senhaCertificado = "senha1";
const ambiente = Ambiente_1.Ambiente.HOMOLOGACAO;
const pathCertificado = "res/certificados_producao_restrita/461523_MUNICIPIO_DE_PACARAIMA.p12";
const pathXml = "tests/exemplos/Teste Producao Restrita.xml";
const testeFiscoHom = () => {
    if (ambiente == Ambiente_1.Ambiente.PRODUCAO)
        throw Error("Testes unitários não devem ser realizados em amiente de Produção.");
    describe(`${ambiente.nome} - Fisco`, () => {
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
                const xml = yield (0, GzipUtil_1.descomprimeGzipDeBase64)(axiosResponse.data.LoteDFe[0].ArquivoXml);
                expect((0, AssinaturaXmlNfse_1.configuraXml)(xml)).toBe((0, AssinaturaXmlNfse_1.configuraXml)(conteudoXmlAssinado));
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
        describe("Parâmetros Municipais", () => {
            const pmFisco = new ParametrosMunicipaisFiscoCliente_1.ParametrosMunicipaisFiscoCliente(ambiente, pathCertificado, senhaCertificado);
            test("Retorna Alíquota", () => __awaiter(void 0, void 0, void 0, function* () {
                const codigoServico = "01.01.01.000";
                const competencia1 = date_and_time_1.default.parse("01/09/2022", "DD/MM/YYYY");
                const competencia2 = date_and_time_1.default.parse("09/01/2022", "DD/MM/YYYY");
                let axiosResponse = yield pmFisco.retornaAliquotas(4309001, codigoServico, competencia1);
                expect(axiosResponse.data.mensagem).toBe("Alíquotas recuperadas com sucesso.");
                expect(axiosResponse.data.aliquotas[codigoServico][0].aliq).toBe(5);
                axiosResponse = yield pmFisco.retornaAliquotas(4309001, codigoServico, competencia2);
                expect(axiosResponse.data).toBeUndefined();
            }));
            test("Retorna Histórico Alíquotas", () => __awaiter(void 0, void 0, void 0, function* () {
                const codigoServico = "01.01.01.000";
                const axiosResponse = yield pmFisco.retornaHistoricoAliquotas(4309001, codigoServico);
                expect(axiosResponse.data.mensagem).toBe("Histórico de alíquotas recuperadas com sucesso.");
                expect(axiosResponse.data.aliquotas[codigoServico][0].aliq).toBe(5);
            }));
            test("Retorna Parâmetros Convênio", () => __awaiter(void 0, void 0, void 0, function* () {
                const axiosResponse = yield pmFisco.retornaParametrosConvenio(4309001);
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
                let axiosResponse = yield pmFisco.retornaParametrosRegimeEspecial(4309001, codigoServico, competencia);
                expect(axiosResponse.response.data.mensagem).toBe("Parâmetros de regimes especiais não encontrados.");
                codigoServico = "01.02.01.000";
                axiosResponse = yield pmFisco.retornaParametrosRegimeEspecial(4309001, codigoServico, competencia);
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
            test("Retorna Parâmetros Retenção", () => __awaiter(void 0, void 0, void 0, function* () {
                const competencia = date_and_time_1.default.parse("01/09/2022", "DD/MM/YYYY");
                const axiosResponse = yield pmFisco.retornaParametrosRetencao(4309001, competencia);
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
                let axiosResponse = yield pmFisco.retornaParametrosBeneficio(4309001, numeroBeneficio, competencia);
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
                axiosResponse = yield pmFisco.retornaParametrosBeneficio(4309001, numeroBeneficio, competencia);
                expect(axiosResponse.response.data.mensagem).toBe(`Parâmetros do benefício de número  <${numeroBeneficio}> não encontrados para a competência`);
                expect(axiosResponse.data).toBeUndefined();
            }));
        });
    });
};
exports.testeFiscoHom = testeFiscoHom;
