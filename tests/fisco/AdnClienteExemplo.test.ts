import {AdnCliente} from "../../src/model/fisco/AdnCliente";
import {AmbienteEnum} from "../../src/enum/AmbienteEnum";
import {TipoNsuEnum} from "../../src/enum/TipoNsuEnum";

const senha_certificado: string = 'senha1'
const ambiente: AmbienteEnum = AmbienteEnum.PRODUCAO_RESTRITA
const pathCertificado: string = 'res/certificados_producao_restrita/461523_MUNICIPIO_DE_PACARAIMA.p12'

describe("Testes", () => {
    test('Teste Retorna DFEs', async () => {
        const adnCliente: AdnCliente = new AdnCliente(ambiente, pathCertificado, senha_certificado);
        const axiosResponse = await adnCliente.retornaDocumentosFiscais(1, TipoNsuEnum.RECEPCAO, true);
        console.log(axiosResponse.data);
    });
});