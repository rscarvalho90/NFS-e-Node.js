import axios from "axios";
import {AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../../enum/Ambiente";
import {Cliente} from "../Cliente";


/**
 * @deprecated Esta classe, apesar de fazer chamadas a serviços existentes na API, nunca retornará as consultas quando utilizado certificado de fiscos. Seu correto funcionamento só ocorre quando do uso de certificados de interessados constantes na NFS-e consultada.
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/fisco/
 */
export class SefinNacionalCliente extends Cliente {
    private hostRequisicao = getHostRequisicao(this.ambiente, AreaAmbienteEnum.FISCO, ServicoEnum.SEFIN);

    /**
     * Retorna uma NFS-e com base na sua chave.
     *
     * @param chaveAcesso Chave de acesso da Nota Fiscal de Serviço Eletrônica (NFS-e)
     */
    async retornaNfse(chaveAcesso: string) {
        return await axios.get(`${this.hostRequisicao}/sefinnacional/nfse/${chaveAcesso}`,
            await this.axiosConfig).catch((error) => {return error});
    }
}