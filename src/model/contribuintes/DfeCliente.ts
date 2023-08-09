import {AxiosConfig, getConfiguracoesHttpAxios} from "../../util/HttpConfig";
import {Ambiente, AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../enum/Ambiente";
import axios from "axios";


/**
 * Classe que realiza a distribuição de Documentos Fiscais Eletrônicos (DF-e's).
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
 */
export class DfeCliente {
    private axiosConfig: Promise<AxiosConfig> = getConfiguracoesHttpAxios(this.pathCertificado, this.senhaCertificado);
    private hostRequisicao = getHostRequisicao(this.ambiente, AreaAmbienteEnum.CONTRIBUINTE, ServicoEnum.DFE);

    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(private ambiente: Ambiente, private pathCertificado: string, private senhaCertificado: string) {

    }

    /**
     * Distribui os DF-e para contribuinte relacionados à NFS-e.
     *
     * @param identificador NSU @type {number} ou chave @type {string} do documento a ser distribuído aos contribuinte relacionados.
     */
    async distribuiDfe(identificador: number | string): Promise<any> {
        if (typeof identificador == "number") {
            return await axios.get(`${this.hostRequisicao}/DFe/${identificador}?lote=false`,
                await this.axiosConfig).catch((error) => {
                return error
            });
        } else {
            return await axios.get(`${this.hostRequisicao}/NFSe/${identificador}/Eventos?lote=false`,
                await this.axiosConfig).catch((error) => {
                return error
            });
        }
    }
}