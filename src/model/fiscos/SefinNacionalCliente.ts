import axios from "axios";
import {Ambiente, ServicoEnum} from "../../enum/Ambiente";
import {AxiosConfig, getConfiguracoesHttpAxios} from "../../util/HttpConfig";


/**
 * @deprecated Esta classe, apesar de fazer chamadas a serviços existentes na API, nunca retornará as consultas quando utilizado certificado de fiscos. Seu correto funcionamento só ocorre quando do uso de certificados de interessados constantes na NFS-e consultada.
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/fisco/
 */
export class SefinNacionalCliente {

    private axiosConfig: Promise<AxiosConfig> = getConfiguracoesHttpAxios(this.pathCertificado, this.senhaCertificado);

    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(private ambiente: Ambiente, private pathCertificado: string, private senhaCertificado: string) {

    }

    async retornaNfse(chaveAcesso: string) {
        return await axios.get("https://" + ServicoEnum.SEFIN + this.ambiente + "/sefinnacional/nfse/"+chaveAcesso,
            await this.axiosConfig).catch((error) => {return error});
    }
}