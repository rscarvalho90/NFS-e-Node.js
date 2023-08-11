import {Ambiente, AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../../enum/Ambiente";
import axios from "axios";
import {Cliente} from "../Cliente";
import {integracaoNaoTestada, retornandoErro} from "../../decorators/ClienteDecorators";


/**
 * Classe que realiza a distribuição de Documentos Fiscais Eletrônicos (DF-e's).
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
 */
export class DfeCliente extends Cliente {
    private hostRequisicao = getHostRequisicao(this.ambiente, AreaAmbienteEnum.CONTRIBUINTE, ServicoEnum.DFE);

    /**
     * Distribui os DF-e para contribuinte relacionados à NFS-e.
     *
     * @param identificador NSU @type {number} ou chave @type {string} do documento a ser distribuído aos contribuinte relacionados.
     */
    @retornandoErro([Ambiente.HOMOLOGACAO], "Erro no reconhecimento do certificado digital utilizado: Certificado de Transmissão difere da ICP - Brasil.")
    @integracaoNaoTestada([Ambiente.PRODUCAO, Ambiente.PRODUCAO_RESTRITA], "Teste no ambiente de Homologação retornou erro, não permitindo inferir se a integração com a API é válida nos ambientes citados.")
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