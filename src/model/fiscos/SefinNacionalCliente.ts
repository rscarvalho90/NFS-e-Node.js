import axios from "axios";
import {AmbienteEnum, ServicoEnum} from "../../enum/AmbienteEnum";
import {AxiosConfig, getConfiguracoesHttpAxios} from "../../util/HttpConfig";

/**
 * Documentação: https://www.producaorestrita.nfse.gov.br/swagger/fisco/
 */
export class SefinNacionalCliente {

    private axiosConfig: Promise<AxiosConfig> = getConfiguracoesHttpAxios(this.pathCertificado, this.senhaCertificado);

    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(private ambiente: AmbienteEnum, private pathCertificado: string, private senhaCertificado: string) {

    }

    async retornaNfse(chaveAcesso: string) {
        return await axios.get("https://" + ServicoEnum.SEFIN + this.ambiente + "/sefinnacional/nfse/"+chaveAcesso,
            await this.axiosConfig).catch((error) => {return error});
    }
}