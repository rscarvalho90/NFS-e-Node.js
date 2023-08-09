import {Ambiente, AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../enum/Ambiente";
import {ParametrosMunicipaisFiscoCliente} from "../fiscos/ParametrosMunicipaisFiscoCliente";


/**
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
 */
export class ParametrosMunicipaisContribuinteCliente extends ParametrosMunicipaisFiscoCliente{

    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(ambiente: Ambiente, pathCertificado: string, senhaCertificado: string) {
        const hostRequisicao = getHostRequisicao(ambiente, AreaAmbienteEnum.CONTRIBUINTE, ServicoEnum.PARAMETROS_MUNICIPAIS);
        super(ambiente, pathCertificado, senhaCertificado, hostRequisicao);
    }
}