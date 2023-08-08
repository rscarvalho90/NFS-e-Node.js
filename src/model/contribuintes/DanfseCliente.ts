import {AxiosConfig, getConfiguracoesHttpAxios} from "../../util/HttpConfig";
import {Ambiente, AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../enum/Ambiente";
import axios from "axios";

export class DanfseCliente {
    private axiosConfig: Promise<AxiosConfig> = getConfiguracoesHttpAxios(this.pathCertificado, this.senhaCertificado);
    private hostRequisicao = getHostRequisicao(this.ambiente, AreaAmbienteEnum.CONTRIBUINTE, ServicoEnum.DANFSE);

    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(private ambiente: Ambiente, private pathCertificado: string, private senhaCertificado: string) {

    }

    /**
     * Retorna o DANFSe (em formato PDF) de uma NFS-e a partir de sua chave de acesso.
     *
     * @param chaveAcesso Chave de acesso da Nota Fiscal de Serviço Eletrônica (NFS-e)
     */
    async retornaDanfse(chaveAcesso: string): Promise<any> {
        return await axios.get(this.hostRequisicao + `/danfse/${chaveAcesso}`,
            await this.axiosConfig).catch((error) => {
            return error
        });
    }
}