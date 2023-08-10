import {AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../../enum/Ambiente";
import axios from "axios";
import {Cliente} from "../Cliente";

export class DpsCliente extends Cliente {
    private hostRequisicao = getHostRequisicao(this.ambiente, AreaAmbienteEnum.CONTRIBUINTE, ServicoEnum.DPS);

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