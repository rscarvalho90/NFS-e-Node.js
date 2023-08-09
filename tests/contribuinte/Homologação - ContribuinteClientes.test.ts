import {NfseCliente} from "../../src/model/contribuintes/NfseCliente";
import {Ambiente} from "../../src/enum/Ambiente";
import {extraiDpsDaNfse, modificaValorTagXml} from "../../src/util/XmlUtil";
import fs from "fs";
import {geraIdDps} from "../../src/util/GeraId";
import {descomprimeGzipDeBase64} from "../../src/util/GzipUtil";
import xml2js from "xml2js";
import utf8 from "utf8";
import {assinaStringXml, configuraXml} from "../../src/util/AssinaturaXmlNfse";
import date from "date-and-time";
import {DanfseCliente} from "../../src/model/contribuintes/DanfseCliente";
import {DfeCliente} from "../../src/model/contribuintes/DfeCliente";
import pdfParse from "pdf-parse";
import {
    ParametrosMunicipaisContribuinteCliente
} from "../../src/model/contribuintes/ParametrosMunicipaisContribuinteCliente";
import {DpsCliente} from "../../src/model/contribuintes/DpsCliente";


const senhaCertificado: string = "senha1";
const ambiente: Ambiente = Ambiente.HOMOLOGACAO;
const pathCertificado: string = "res/certificados_homologacao/Certificados de Contribuintes/462469_03763656000154 (1).p12";
const pathXml = "tests/exemplos/RN0-DPS-_Correto.xml";

export const testeContribuinteHom = () => {
    describe(`${ambiente.nome} - Contribuinte`, () => {
        let chaveAcesso: string, idDps: string;
        let conteudoXmlAssinado: string, nsu: number;

        describe("Sefin NFS-e", () => {
            const nfseCliente = new NfseCliente(ambiente, pathCertificado, senhaCertificado);

            test("Transmite DPS", async () => {
                let conteudoXml = fs.readFileSync(pathXml, "utf8");

                let xmlJson: any;

                xml2js.parseString(conteudoXml, (erro, resultado) => {
                    xmlJson = resultado;
                });

                conteudoXml = conteudoXml.replace(/(<tribNac)( )?(\/>)/g, "");
                conteudoXml = modificaValorTagXml(conteudoXml, "DPS.infDPS['0'].nDPS['0']", String(parseInt(xmlJson.DPS.infDPS[0].nDPS[0]) + 1));
                idDps = geraIdDps(conteudoXml);
                conteudoXml = modificaValorTagXml(conteudoXml, "DPS.infDPS['0']['$'].Id", idDps);
                const axiosResponse = await nfseCliente.enviaDps(conteudoXml);

                expect([axiosResponse.data.chaveAcesso, axiosResponse.data.nfseXmlGZipB64]).toBeDefined();

                fs.writeFileSync(pathXml, conteudoXml); // Salva o novo XML para controle do número da DPS para testes futuros

                chaveAcesso = axiosResponse.data.chaveAcesso;
                const xml = await descomprimeGzipDeBase64(axiosResponse.data.nfseXmlGZipB64);
                conteudoXmlAssinado = await assinaStringXml(configuraXml(conteudoXml), "infDPS", pathCertificado, senhaCertificado);
                expect(configuraXml(extraiDpsDaNfse(xml)[0])).toBe(configuraXml(conteudoXmlAssinado));
            });

            test("Consulta DPS enviada", async () => {
                const axiosResponse: any = await nfseCliente.retornaNfse(chaveAcesso);

                const xml = await descomprimeGzipDeBase64(axiosResponse.data.nfseXmlGZipB64);

                let xmlJson: any;

                xml2js.parseString(xml, (erro, resultado) => {
                    xmlJson = resultado;
                });

                nsu = xmlJson.NFSe.infNFSe[0].nNFSe[0];

                //expect(axiosResponse.data.nfseXmlGZipB64).toBe(nfseXmlGZipB64); // Está havendo um erro de codificação entre o enviado e o retorno
                expect(configuraXml(extraiDpsDaNfse(utf8.decode(xml))[0])).toBe(configuraXml(conteudoXmlAssinado));
            });


            // FIXME - Teste ignorado devido ao fato da funcionalidade não estar disponível em nenhum dos ambientes
            test.skip("Consulta NFS-e pagáveis", async () => {
                let xmlJson: any;

                xml2js.parseString(conteudoXmlAssinado, (erro, resultado) => {
                    xmlJson = resultado;
                });

                let inscricaoFederal: string;
                const mesCompetencia: string = date.format(new Date(xmlJson.DPS.infDPS[0].dhEmi[0]), "YYMM");
                const codigoMunicipal: number = xmlJson.DPS.infDPS[0].cLocEmi[0];

                try {
                    inscricaoFederal = xmlJson.DPS.infDPS[0].prest[0].CNPJ[0];
                } catch (e) {
                    inscricaoFederal = xmlJson.DPS.infDPS[0].prest[0].CPF[0];
                }

                const axiosResponse: any = await nfseCliente.retornaNfsePagaveis(inscricaoFederal, mesCompetencia, codigoMunicipal, 1);
            });
        });

        // FIXME - Teste com falha devido ao PDF estar retornando em branco
        describe("Sefin DANFS-e", () => {

            // PDF saindo em branco
            test("Consulta DANFS-e", async () => {
                const danfseCliente = new DanfseCliente(ambiente, pathCertificado, senhaCertificado);

                const axiosResponse: any = await danfseCliente.retornaDanfse(chaveAcesso);
                const pdfBinario = Buffer.from(axiosResponse.data, "utf-8");
                expect(axiosResponse.data.substring(0, 8)).toContain("%PDF-1.4");
                const pdf: pdfParse.Result = await pdfParse(pdfBinario);

                fs.writeFileSync("res/danfses/DANFSe_teste.pdf", pdfBinario);
                expect(pdf.text.match("/(" + chaveAcesso + ")/g")).toContain(chaveAcesso);
            });
        });

        // FIXME - Teste com falha devido a erro do certificado no ambiente de homologação
        describe("DF-e", () => {

            test("Distribui DF-e por NSU", async () => {
                const dfeCliente = new DfeCliente(ambiente, pathCertificado, senhaCertificado);

                const axiosResponse: any = await dfeCliente.distribuiDfe(nsu);
                expect(axiosResponse.constructor.name).not.toBe("AxiosError");
            });

            test("Distribui DF-e por Chave de Acesso", async () => {
                const dfeCliente = new DfeCliente(ambiente, pathCertificado, senhaCertificado);

                const axiosResponse: any = await dfeCliente.distribuiDfe(chaveAcesso);
                expect(axiosResponse.constructor.name).not.toBe("AxiosError");
            });
        });

        describe("DPS", () => {
            const dpsCliente = new DpsCliente(ambiente, pathCertificado, senhaCertificado);

            test("Retorna DPS", async () => {
                const axiosResponse: any = await dpsCliente.retornaDps(idDps);
                expect(axiosResponse.data.chaveAcesso).toBe(chaveAcesso);
            });

            test("Verifica Emissão DPS", async () => {
                let axiosResponse: any = await dpsCliente.verificaEmissaoDps(idDps);
                expect(axiosResponse.status).toBe(200);

                const numeroAleatorio = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
                axiosResponse = await dpsCliente.verificaEmissaoDps(idDps.replace(/.{5}$/g, numeroAleatorio));
                expect(axiosResponse.response.status).toBe(404);

                axiosResponse = await dpsCliente.verificaEmissaoDps(idDps.replace(/.{4}$/g, numeroAleatorio));
                expect(axiosResponse.response.status).toBe(400);
            });

        });

        describe("Parâmetros Municipais", () => {
            const pmContribuinte = new ParametrosMunicipaisContribuinteCliente(ambiente, pathCertificado, senhaCertificado);
            const codigoMunicipio: number = 4309001;

            test("Retorna Alíquota", async () => {
                const codigoServico: string = "01.01.01.000";
                const competencia1 = date.parse("01/09/2022", "DD/MM/YYYY");
                const competencia2 = date.parse("09/01/2022", "DD/MM/YYYY");
                let axiosResponse: any = await pmContribuinte.retornaAliquotas(codigoMunicipio, codigoServico, competencia1);
                expect(axiosResponse.data.mensagem).toBe("Alíquotas recuperadas com sucesso.");
                expect(axiosResponse.data.aliquotas[codigoServico][0].aliq).toBe(5);
                axiosResponse = await pmContribuinte.retornaAliquotas(4309001, codigoServico, competencia2);
                expect(axiosResponse.data).toBeUndefined();
            });

            test("Retorna Histórico Alíquotas", async () => {
                const codigoServico: string = "01.01.01.000";
                const axiosResponse: any = await pmContribuinte.retornaHistoricoAliquotas(codigoMunicipio, codigoServico);
                expect(axiosResponse.data.mensagem).toBe("Histórico de alíquotas recuperadas com sucesso.");
                expect(axiosResponse.data.aliquotas[codigoServico][0].aliq).toBe(5);
            });

            test("Retorna Parâmetros Convênio", async () => {
                const axiosResponse: any = await pmContribuinte.retornaParametrosConvenio(codigoMunicipio);
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
                let axiosResponse: any = await pmContribuinte.retornaParametrosRegimeEspecial(codigoMunicipio, codigoServico, competencia);
                expect(axiosResponse.response.data.mensagem).toBe("Parâmetros de regimes especiais não encontrados.");

                codigoServico = "01.02.01.000";
                axiosResponse = await pmContribuinte.retornaParametrosRegimeEspecial(codigoMunicipio, codigoServico, competencia);
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
                const axiosResponse: any = await pmContribuinte.retornaParametrosRetencao(codigoMunicipio, competencia);
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
                let axiosResponse: any = await pmContribuinte.retornaParametrosBeneficio(codigoMunicipio, numeroBeneficio, competencia);
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
                axiosResponse = await pmContribuinte.retornaParametrosBeneficio(codigoMunicipio, numeroBeneficio, competencia);
                expect(axiosResponse.response.data.mensagem).toBe(`Parâmetros do benefício de número  <${numeroBeneficio}> não encontrados para a competência`);
                expect(axiosResponse.data).toBeUndefined();
            });
        });
    });
}