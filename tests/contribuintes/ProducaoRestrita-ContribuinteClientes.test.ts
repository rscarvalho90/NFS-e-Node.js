import {NfseCliente} from "../../src/model/contribuintes/NfseCliente";
import {Ambiente} from "../../src/enum/Ambiente";
import {extraiDpsDaNfse, modificaValorTagXml} from "../../src/util/XmlUtil";
import fs from "fs";
import {geraIdDps} from "../../src/util/GeraId";


const senhaCertificado: string = "123456";
const ambiente: Ambiente = Ambiente.HOMOLOGACAO;
const pathCertificado: string = "res/certificados_homologacao/Certificados de Contribuintes/Certificado_MEI/46871_PWIQMWDEW_PXGIW_NH_PHDX_71847871453.p12";
const pathXml = "tests/exemplos/RN0-DPS-_Correto.xml";

describe("Produção Restrita - Contribuinte", () => {
    describe("Sefin NFS-e", () => {
        let nfseCliente = new NfseCliente(ambiente, pathCertificado, senhaCertificado);

        test("Transmite DPS", async () => {
            let conteudoXml = fs.readFileSync(pathXml, "utf8");
            const numDps = geraIdDps(conteudoXml);
            conteudoXml = conteudoXml.replace(/(<tribNac)( )?(\/>)/g, "");
            conteudoXml = modificaValorTagXml(conteudoXml, "DPS.infDPS['0']['$'].Id", numDps);
            //let conteudoDps = extraiDpsDaNfse(conteudoXml)[0];
            const axiosResponse = await nfseCliente.enviaDps(conteudoXml);
            const a = 1;
        });
    });
});