import {AdnCliente} from "../../src/model/clientes/fiscos/AdnCliente";
import {Ambiente} from "../../src/enum/Ambiente";
import {TipoNsuEnum} from "../../src/enum/TipoNsuEnum";
import {assinaStringXml, configuraXml, removeAssinaturaNfse} from "../../src/util/AssinaturaXmlNfse";
import fs from "fs";
import {geraIdDps, geraIdNfse} from "../../src/util/GeraId";
import {extraiDpsDaNfse, modificaValorTagXml} from "../../src/util/XmlUtil";
import {descomprimeGzipDeBase64} from "../../src/util/GzipUtil";
import date from "date-and-time";
import {ParametrosMunicipaisFiscoCliente} from "../../src/model/clientes/fiscos/ParametrosMunicipaisFiscoCliente";


const senhaCertificado: string = "senha1"
const ambiente: Ambiente = Ambiente.HOMOLOGACAO
const pathCertificado: string = "res/certificados_producao_restrita/461523_MUNICIPIO_DE_PACARAIMA.p12"
const pathXml = "tests/exemplos/Teste Producao Restrita.xml"


export const testeFiscoHom = () => {
    if(ambiente==Ambiente.PRODUCAO)
        throw Error("Testes unitários não devem ser realizados em amiente de Produção.");

    describe(`${ambiente.nome} - Fisco`, () => {

        let chaveAcesso: string;
        let nsu: number;
        let conteudoXmlAssinado: string;
        let dataHoraGeracao: Date;

        describe("ADN", () => {
            const adnCliente: AdnCliente = new AdnCliente(ambiente, pathCertificado, senhaCertificado);

            test("Retorna DFEs (NSU Distribuição)", async () => {
                const axiosResponse = await adnCliente.retornaDocumentosFiscais(1, TipoNsuEnum.DISTRIBUICAO, true);
                const ultimoDocumento: number = axiosResponse.data.LoteDFe.length - 1;
                chaveAcesso = axiosResponse.data.LoteDFe[ultimoDocumento].ChaveAcesso as string;
                expect(axiosResponse.data.LoteDFe[ultimoDocumento].DataHoraGeracao).toBe("2023-04-18T18:54:11.363");
                //let conteudoXml = await descomprimeGzipDeBase64(axiosResponse.data.LoteDFe[0].ArquivoXml as string);
            });

            test("Envia DFE para ADN", async () => {
                let conteudoXml = fs.readFileSync(pathXml, "utf8");
                conteudoXml = conteudoXml.replace(/(<tribNac)( )?(\/>)/g, "");
                const numNfse = geraIdNfse(conteudoXml);
                const numDps = geraIdDps(conteudoXml);
                conteudoXml = modificaValorTagXml(conteudoXml, "NFSe.infNFSe['0']['$'].Id", numNfse);
                conteudoXml = modificaValorTagXml(conteudoXml, "NFSe.infNFSe['0'].DPS['0'].infDPS['0']['$'].Id", numDps);
                conteudoXml = removeAssinaturaNfse(conteudoXml);
                conteudoXmlAssinado = await assinaStringXml(conteudoXml, "infNFSe", pathCertificado, senhaCertificado)
                const resposta = await adnCliente.recepcionaLoteDfeXml([conteudoXmlAssinado]);
                chaveAcesso = resposta.data.Lote[0].ChaveAcesso;
                nsu = parseInt(resposta.data.Lote[0].NsuRecepcao);
            })

            test("Retorna DFE Transmitida (NSU Recepção)", async () => {
                const axiosResponse = await adnCliente.retornaDocumentosFiscais(nsu - 1, TipoNsuEnum.RECEPCAO, true);
                dataHoraGeracao = new Date(axiosResponse.data.LoteDFe[0].DataHoraGeracao);
                expect(new Date(axiosResponse.data.LoteDFe[0].DataHoraGeracao).getTime()).toBeLessThan(new Date().getTime());
                expect(axiosResponse.data.LoteDFe[0].ChaveAcesso).toBe(chaveAcesso);
                const xml = await descomprimeGzipDeBase64(axiosResponse.data.LoteDFe[0].ArquivoXml);
                expect(configuraXml(xml)).toBe(configuraXml(conteudoXmlAssinado));
                expect(axiosResponse.data.LoteDFe[0].TipoDocumento).toBe("NFSE");
            });

            test("Retorna Eventos", async () => {
                const axiosResponse = await adnCliente.retornaEventos(chaveAcesso);
                expect([axiosResponse.data.LoteDFe[0].ChaveAcesso,
                    axiosResponse.data.LoteDFe[0].ArquivoXml,
                    axiosResponse.data.LoteDFe[0].DataHoraRecebimento]).toBeDefined();
                expect(axiosResponse.data.LoteDFe[0].TipoDocumento).toBe("NFSE");
                expect(chaveAcesso.length).toBe(50);
                expect(axiosResponse.data.LoteDFe[0].ChaveAcesso).toBe(chaveAcesso);
                expect(new Date(axiosResponse.data.LoteDFe[0].DataHoraRecebimento).getTime()).toBe(dataHoraGeracao.getTime());
                expect(new Date(axiosResponse.data.LoteDFe[0].DataHoraRecebimento).getTime()).toBeLessThan(new Date().getTime());
            });
        });

        describe("Parâmetros Municipais", () => {
            const pmFisco = new ParametrosMunicipaisFiscoCliente(ambiente, pathCertificado, senhaCertificado);

            test("Retorna Alíquota", async () => {
                const codigoServico: string = "01.01.01.000";
                const competencia1 = date.parse("01/09/2022", "DD/MM/YYYY");
                const competencia2 = date.parse("09/01/2022", "DD/MM/YYYY");
                let axiosResponse: any = await pmFisco.retornaAliquotas(4309001, codigoServico, competencia1);
                expect(axiosResponse.data.mensagem).toBe("Alíquotas recuperadas com sucesso.");
                expect(axiosResponse.data.aliquotas[codigoServico][0].aliq).toBe(5);
                axiosResponse = await pmFisco.retornaAliquotas(4309001, codigoServico, competencia2);
                expect(axiosResponse.data).toBeUndefined();
            });

            test("Retorna Histórico Alíquotas", async () => {
                const codigoServico: string = "01.01.01.000";
                const axiosResponse: any = await pmFisco.retornaHistoricoAliquotas(4309001, codigoServico);
                expect(axiosResponse.data.mensagem).toBe("Histórico de alíquotas recuperadas com sucesso.");
                expect(axiosResponse.data.aliquotas[codigoServico][0].aliq).toBe(5);
            });

            test("Retorna Parâmetros Convênio", async () => {
                const axiosResponse: any = await pmFisco.retornaParametrosConvenio(4309001);
                expect(axiosResponse.data.mensagem).toBe("Parâmetros do convênio recuperados com sucesso.");
                expect([axiosResponse.data.parametrosConvenio.aderenteAmbienteNacional,
                    axiosResponse.data.parametrosConvenio.aderenteEmissorNacional,
                    axiosResponse.data.parametrosConvenio.origCad,
                    axiosResponse.data.parametrosConvenio.aderenteMAN,
                    axiosResponse.data.parametrosConvenio.permiteAproveitamentoDeCreditos]).toBeDefined();
            });

            test("Retorna Parâmetros Regime Especial", async () => {
                let codigoServico: string = "01.01.01.000";
                const competencia = date.parse("01/09/2022", "DD/MM/YYYY");
                let axiosResponse: any = await pmFisco.retornaParametrosRegimeEspecial(4309001, codigoServico, competencia);
                expect(axiosResponse.response.data.mensagem).toBe("Parâmetros de regimes especiais não encontrados.");

                codigoServico = "01.02.01.000";
                axiosResponse = await pmFisco.retornaParametrosRegimeEspecial(4309001, codigoServico, competencia);
                expect(axiosResponse.data.mensagem).toBe("Parâmetros de regimes especiais recuperados com sucesso.");
                expect(axiosResponse.data.regimesEspeciais[codigoServico].toString()).toBe({
                    "-1590865684": [
                        {
                            "sit": 3,
                            "dtIni": "2022-08-13T00:00:00",
                            "motivo": ""
                        }
                    ]
                }.toString())
            });

            test("Retorna Parâmetros Retenção", async () => {
                const competencia = date.parse("01/09/2022", "DD/MM/YYYY");
                const axiosResponse: any = await pmFisco.retornaParametrosRetencao(4309001, competencia);
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
            });

            test("Retorna Parâmetros Benefício", async () => {
                let numeroBeneficio: number = 43090010200001;
                const competencia = date.parse("01/09/2022", "DD/MM/YYYY");
                let axiosResponse: any = await pmFisco.retornaParametrosBeneficio(4309001, numeroBeneficio, competencia);
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
                axiosResponse = await pmFisco.retornaParametrosBeneficio(4309001, numeroBeneficio, competencia);
                expect(axiosResponse.response.data.mensagem).toBe(`Parâmetros do benefício de número  <${numeroBeneficio}> não encontrados para a competência`);
                expect(axiosResponse.data).toBeUndefined();
            });
        });

    });
}