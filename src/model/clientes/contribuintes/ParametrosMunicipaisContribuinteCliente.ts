import {Ambiente, AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../../enum/Ambiente";
import {ParametrosMunicipaisFiscoCliente} from "../fiscos/ParametrosMunicipaisFiscoCliente";
import {Cliente} from "../Cliente";


/**
 * Classe que retorna os parâmetros municipais (alíquotas, benefícios, regimes especiais, retenções e convênios).
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
 */
export class ParametrosMunicipaisContribuinteCliente extends ParametrosMunicipaisFiscoCliente {
    protected hostRequisicao = getHostRequisicao(this.ambiente, AreaAmbienteEnum.CONTRIBUINTE, ServicoEnum.PARAMETROS_MUNICIPAIS);
}