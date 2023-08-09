"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametrosMunicipaisContribuinteCliente = void 0;
const Ambiente_1 = require("../../enum/Ambiente");
const ParametrosMunicipaisFiscoCliente_1 = require("../fiscos/ParametrosMunicipaisFiscoCliente");
/**
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
 */
class ParametrosMunicipaisContribuinteCliente extends ParametrosMunicipaisFiscoCliente_1.ParametrosMunicipaisFiscoCliente {
    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(ambiente, pathCertificado, senhaCertificado) {
        const hostRequisicao = (0, Ambiente_1.getHostRequisicao)(ambiente, Ambiente_1.AreaAmbienteEnum.CONTRIBUINTE, Ambiente_1.ServicoEnum.PARAMETROS_MUNICIPAIS);
        super(ambiente, pathCertificado, senhaCertificado, hostRequisicao);
    }
}
exports.ParametrosMunicipaisContribuinteCliente = ParametrosMunicipaisContribuinteCliente;
