import {NfseCliente} from "../../src/model/contribuintes/NfseCliente";
import {Ambiente} from "../../src/enum/Ambiente";
import {extraiDpsDaNfse} from "../../src/util/XmlUtil";
import fs from "fs";


const senhaCertificado: string = "123456";
const ambiente: Ambiente = Ambiente.HOMOLOGACAO;
const pathCertificado: string = "res/certificados_homologacao/Certificados de Contribuintes/Certificado_Nao_Mei_Nao_Simples/46869_OWMKX_OIWNHUKX_U_W_.p12";
const pathXml = "tests/exemplos/teste.xml";

describe("Produção Restrita - Contribuinte", () => {
    describe("Sefin NFS-e", () => {
        let nfseCliente = new NfseCliente(ambiente, pathCertificado, senhaCertificado);

        test("Transmite DPS", async () => {
            let conteudoXml = fs.readFileSync(pathXml, "utf8");
            conteudoXml = conteudoXml.replace(/(<tribNac)( )?(\/>)/g, "");
            let conteudoDps = extraiDpsDaNfse(conteudoXml)[0];
            const axiosResponse = await nfseCliente.enviaDps(conteudoDps);
        });
    });
});