import {AdnCliente} from "../../src/model/fisco/AdnCliente";
import {AmbienteEnum} from "../../src/enum/AmbienteEnum";
import {TipoNsuEnum} from "../../src/enum/TipoNsuEnum";
import {SefinNacionalCliente} from "../../src/model/fisco/SefinNacionalCliente";
import {NfseCliente} from "../../src/model/contribuintes/NfseCliente";


const senha_certificado: string = "senha1"
const ambiente: AmbienteEnum = AmbienteEnum.PRODUCAO_RESTRITA
const pathCertificado: string = "res/certificados_producao_restrita/461523_MUNICIPIO_DE_PACARAIMA.p12"

describe("Testes", () => {
    let chaveAcesso: string;

    const adnCliente: AdnCliente = new AdnCliente(ambiente, pathCertificado, senha_certificado);
    const sefinCliente: SefinNacionalCliente = new SefinNacionalCliente(ambiente, pathCertificado, senha_certificado);
    const nfseCliente: NfseCliente = new NfseCliente(ambiente, pathCertificado, senha_certificado);

    test("Teste Retorna DFEs", async () => {
        const axiosResponse = await adnCliente.retornaDocumentosFiscais(1, TipoNsuEnum.DISTRIBUICAO, true);
        chaveAcesso = axiosResponse.data.LoteDFe[0].ChaveAcesso as string;
        expect(axiosResponse.data.LoteDFe[0].DataHoraGeracao).toBe("2023-04-18T18:54:11.307");
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