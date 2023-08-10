"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametrosMunicipaisContribuinteCliente = void 0;
const Ambiente_1 = require("../../../enum/Ambiente");
const ParametrosMunicipaisFiscoCliente_1 = require("../fiscos/ParametrosMunicipaisFiscoCliente");
/**
 * Classe que retorna os parâmetros municipais (alíquotas, benefícios, regimes especiais, retenções e convênios).
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
 */
class ParametrosMunicipaisContribuinteCliente extends ParametrosMunicipaisFiscoCliente_1.ParametrosMunicipaisFiscoCliente {
    constructor() {
        super(...arguments);
        this.hostRequisicao = (0, Ambiente_1.getHostRequisicao)(this.ambiente, Ambiente_1.AreaAmbienteEnum.CONTRIBUINTE, Ambiente_1.ServicoEnum.PARAMETROS_MUNICIPAIS);
    }
}
exports.ParametrosMunicipaisContribuinteCliente = ParametrosMunicipaisContribuinteCliente;
