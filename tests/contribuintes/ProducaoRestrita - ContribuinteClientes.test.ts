import {NfseCliente} from "../../src/model/contribuintes/NfseCliente";
import {Ambiente} from "../../src/enum/Ambiente";
import {extraiDpsDaNfse, modificaValorTagXml} from "../../src/util/XmlUtil";
import fs from "fs";
import {geraIdDps} from "../../src/util/GeraId";
import {descomprimeGzipDeBase64} from "../../src/util/GzipUtil";
import xml2js from "xml2js";
import {configuraXml, removeAssinaturaNfse} from "../../src/util/AssinaturaXmlNfse";


const senhaCertificado: string = "senha1";
const ambiente: Ambiente = Ambiente.HOMOLOGACAO;
const pathCertificado: string = "res/certificados_homologacao/Certificados de Contribuintes/462469_03763656000154 (1).p12";
const pathXml = "tests/exemplos/RN0-DPS-_Correto.xml";

describe("Produção Restrita - Contribuinte", () => {
    describe("Sefin NFS-e", () => {
        let nfseCliente = new NfseCliente(ambiente, pathCertificado, senhaCertificado);

        test("Transmite DPS", async () => {
            let conteudoXml = fs.readFileSync(pathXml, "utf8");

            let xmlJson: any;

            xml2js.parseString(conteudoXml, (erro, resultado) => {
                xmlJson = resultado;
            });

            conteudoXml = conteudoXml.replace(/(<tribNac)( )?(\/>)/g, "");
            conteudoXml = modificaValorTagXml(conteudoXml, "DPS.infDPS['0'].nDPS['0']", String(parseInt(xmlJson.DPS.infDPS[0].nDPS[0])+1));
            const idDps = geraIdDps(conteudoXml);
            conteudoXml = modificaValorTagXml(conteudoXml, "DPS.infDPS['0']['$'].Id", idDps);
            const axiosResponse = await nfseCliente.enviaDps(conteudoXml);

            expect([axiosResponse.data.chaveAcesso, axiosResponse.data.nfseXmlGZipB64]).toBeDefined();

            fs.writeFileSync(pathXml, conteudoXml); // Salva o novo XMl para controle do número da DPS para testes futuros

            const xml = await descomprimeGzipDeBase64(axiosResponse.data.nfseXmlGZipB64);
            expect(configuraXml(removeAssinaturaNfse(extraiDpsDaNfse(xml)[0]))).toBe(configuraXml(conteudoXml));
        });
    });
});