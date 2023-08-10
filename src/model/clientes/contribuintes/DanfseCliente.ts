import {AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../../enum/Ambiente";
import axios from "axios";
import {Cliente} from "../Cliente";


/**
 * Classe que realiza a emissão de Documentos Auxiliares de Notas Fiscais de Serviço eletrônicas (DANFS-e).
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
 */
export class DanfseCliente extends Cliente{
    private hostRequisicao = getHostRequisicao(this.ambiente, AreaAmbienteEnum.CONTRIBUINTE, ServicoEnum.DANFSE);

    /**
     * Retorna o DANFSe (em formato PDF) de uma NFS-e a partir de sua chave de acesso.
     *
     * @param chaveAcesso Chave de acesso da Nota Fiscal de Serviço Eletrônica (NFS-e)
     */
    async retornaDanfse(chaveAcesso: string): Promise<any> {
        return await axios.get(`${this.hostRequisicao}/danfse/${chaveAcesso}`,
            await this.axiosConfig).catch((error) => {
            return error
        });
    }
}