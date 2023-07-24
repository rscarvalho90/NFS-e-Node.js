import {AdnCliente} from "../../src/model/fiscos/AdnCliente";
import {AmbienteEnum} from "../../src/enum/AmbienteEnum";
import {TipoNsuEnum} from "../../src/enum/TipoNsuEnum";
import {SefinNacionalCliente} from "../../src/model/fiscos/SefinNacionalCliente";
import {NfseCliente} from "../../src/model/contribuintes/NfseCliente";
import {descomprimeGzipDeBase64} from "../../src/util/GzipUtil";
import {assinaStringXml, removeAssinaturaNfse} from "../../src/util/AssinaturaXmlNfse";


const senhaCertificado: string = "senha1"
const ambiente: AmbienteEnum = AmbienteEnum.PRODUCAO_RESTRITA
const pathCertificado: string = "res/certificados_producao_restrita/461523_MUNICIPIO_DE_PACARAIMA.p12"

describe("Testes", () => {
    let chaveAcesso: string;

    const adnCliente: AdnCliente = new AdnCliente(ambiente, pathCertificado, senhaCertificado);
    const sefinCliente: SefinNacionalCliente = new SefinNacionalCliente(ambiente, pathCertificado, senhaCertificado);
    const nfseCliente: NfseCliente = new NfseCliente(ambiente, pathCertificado, senhaCertificado);

    test("Teste Retorna DFEs", async () => {
        const axiosResponse = await adnCliente.retornaDocumentosFiscais(1, TipoNsuEnum.DISTRIBUICAO, true);
        const ultimoDocumento: number = axiosResponse.data.LoteDFe.length-1;
        chaveAcesso = axiosResponse.data.LoteDFe[ultimoDocumento].ChaveAcesso as string;
        expect(axiosResponse.data.LoteDFe[ultimoDocumento].DataHoraGeracao).toBe("2023-04-18T18:54:11.363");
        let conteudoXml = await descomprimeGzipDeBase64(axiosResponse.data.LoteDFe[0].ArquivoXml as string);
        conteudoXml = conteudoXml.replace("<tribNac />", "");
        conteudoXml = removeAssinaturaNfse(conteudoXml);
        const conteudoXmlAssinado = await assinaStringXml(conteudoXml, "infNFSe", pathCertificado, senhaCertificado)
        const resposta = await adnCliente.recepcionaLoteDfeXml([conteudoXmlAssinado]);
        resposta.data;
    });

    test("Teste Retorna Eventos", async () => {
        const axiosResponse = await adnCliente.retornaEventos(chaveAcesso);
        expect(axiosResponse.data.LoteDFe[0].DataHoraRecebimento).toBe("2022-09-28T16:43:19.973");
    });

    test("Teste Retorna NFS-e", async () => {
        const axiosResponse = await nfseCliente.retornaNfse(chaveAcesso);
        expect(axiosResponse.data.LoteDFe[0].DataHoraRecebimento).toBe("2022-09-28T16:43:19.973");
    });
});