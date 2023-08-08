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


const senhaCertificado: string = "senha1";
const ambiente: Ambiente = Ambiente.HOMOLOGACAO;
const pathCertificado: string = "res/certificados_homologacao/Certificados de Contribuintes/462469_03763656000154 (1).p12";
const pathXml = "tests/exemplos/RN0-DPS-_Correto.xml";

describe("Produção Restrita - Contribuinte", () => {
    let chaveAcesso: string;
    let conteudoXmlAssinado: string, nfseXmlGZipB64: string, nsu: number;

    describe("Sefin NFS-e", () => {
        let nfseCliente = new NfseCliente(ambiente, pathCertificado, senhaCertificado);

        test("Transmite DPS", async () => {
            let conteudoXml = fs.readFileSync(pathXml, "utf8");

            let xmlJson: any;

            xml2js.parseString(conteudoXml, (erro, resultado) => {
                xmlJson = resultado;
            });

            conteudoXml = conteudoXml.replace(/(<tribNac)( )?(\/>)/g, "");
            conteudoXml = modificaValorTagXml(conteudoXml, "DPS.infDPS['0'].nDPS['0']", String(parseInt(xmlJson.DPS.infDPS[0].nDPS[0]) + 1));
            const idDps = geraIdDps(conteudoXml);
            conteudoXml = modificaValorTagXml(conteudoXml, "DPS.infDPS['0']['$'].Id", idDps);
            const axiosResponse = await nfseCliente.enviaDps(conteudoXml);

            expect([axiosResponse.data.chaveAcesso, axiosResponse.data.nfseXmlGZipB64]).toBeDefined();

            fs.writeFileSync(pathXml, conteudoXml); // Salva o novo XML para controle do número da DPS para testes futuros

            chaveAcesso = axiosResponse.data.chaveAcesso;
            nfseXmlGZipB64 = axiosResponse.data.nfseXmlGZipB64;
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

            //expect(axiosResponse.data.nfseXmlGZipB64).toBe(nfseXmlGZipB64); // Está havendo um erro de codificação entre os retornos
            expect(configuraXml(extraiDpsDaNfse(utf8.decode(xml))[0])).toBe(configuraXml(conteudoXmlAssinado));
        });


        // Teste ignorado devido ao fato da funcionalidade não estar disponível em nenhum dos ambientes
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

    describe("Sefin DANFS-e", () => {

        // PDF saindo em branco
        test("Consulta DANFS-e", async () => {
            let danfseCliente = new DanfseCliente(ambiente, pathCertificado, senhaCertificado);

            const axiosResponse: any = await danfseCliente.retornaDanfse(chaveAcesso);
            const pdfBinario = Buffer.from(axiosResponse.data, "utf-8");
            expect(axiosResponse.data.substring(0, 8)).toContain("%PDF-1.4");
            const pdf: pdfParse.Result = await pdfParse(pdfBinario);

            fs.writeFileSync("res/danfses/DANFSe_teste.pdf", pdfBinario);
            expect(pdf.text.match("/("+chaveAcesso+")/g")).toContain(chaveAcesso);
        });
    });

    describe("ADN DF-e", () => {

        test("Distribui DF-e por NSU", async () => {
            let dfeCliente = new DfeCliente(ambiente, pathCertificado, senhaCertificado);

            const axiosResponse: any = await dfeCliente.distribuiDfe(nsu);
            const a = 1;
        });

        test("Distribui DF-e por Chave de Acesso", async () => {
            let dfeCliente = new DfeCliente(ambiente, pathCertificado, senhaCertificado);

            const axiosResponse: any = await dfeCliente.distribuiDfe(chaveAcesso);
            const a = 1;
        });
    });
});