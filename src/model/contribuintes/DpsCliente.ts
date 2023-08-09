import {AxiosConfig, getConfiguracoesHttpAxios} from "../../util/HttpConfig";
import {Ambiente, AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../enum/Ambiente";
import axios from "axios";

export class DpsCliente {
    private axiosConfig: Promise<AxiosConfig> = getConfiguracoesHttpAxios(this.pathCertificado, this.senhaCertificado);
    private hostRequisicao = getHostRequisicao(this.ambiente, AreaAmbienteEnum.CONTRIBUINTE, ServicoEnum.DPS);

    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(private ambiente: Ambiente, private pathCertificado: string, private senhaCertificado: string) {

    }

    /**
     * Retorna a chave de acesso da NFS-e a partir do identificador do DPS.
     *
     * @param idDps Id da DPS (pode ser informado com ou sem o prefixo "DPS")
     */
    async retornaDps(idDps: string) {
        return await axios.get(`${this.hostRequisicao}/dps/${idDps}`,
            await this.axiosConfig).catch((error) => {
            return error
        });
    }

    /**
     * Verifica se uma NFS-e foi emitida a partir do Id do DPS
     *
     * @param idDps Id da DPS (pode ser informado com ou sem o prefixo "DPS")
     */
    async verificaEmissaoDps(idDps: string) {
        return await axios.head(`${this.hostRequisicao}/dps/${idDps}`,
            await this.axiosConfig).catch((error) => {
            return error
        });
    }
}