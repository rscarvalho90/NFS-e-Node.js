"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametrosMunicipaisFiscosCliente = void 0;
const axios_1 = __importDefault(require("axios"));
const Ambiente_1 = require("../../enum/Ambiente");
const HttpConfig_1 = require("../../util/HttpConfig");
/**
 * Observação: Apesar de os serviços serem os mesmos existentes para os contribuintes ({@link ParametrosMunicipaisContribuintesCliente}),
 * há uma diferença nas URLs dos serviços (passando de "SefinNacional" para "sefinnacional"), impossibilitando a herença entre esta classe e a
 * destinada aos contribuintes.
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/fisco/
 *
 * Painel Municipal: https://www.producaorestrita.nfse.gov.br/PainelMunicipal/
 */
class ParametrosMunicipaisFiscosCliente {
    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(ambiente, pathCertificado, senhaCertificado) {
        this.ambiente = ambiente;
        this.pathCertificado = pathCertificado;
        this.senhaCertificado = senhaCertificado;
        this.axiosConfig = (0, HttpConfig_1.getConfiguracoesHttpAxios)(this.pathCertificado, this.senhaCertificado);
    }
    /**
     * Retorna a alíquota do ISSQN parametrizada de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param codigoServico O código do serviço deve ser informado no formato 00.00.00.000.
     * @param competencia No formato MM/DD/YYYY
     */
    retornaAliquotas(codigoMunicipio, codigoServico, competencia) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get("https://" + Ambiente_1.ServicoEnum.SEFIN + this.ambiente + "/sefinnacional/parametros_municipais/" + codigoMunicipio + "/" + codigoServico + "/" + competencia + "/aliquota", yield this.axiosConfig).catch((error) => { return error; });
        });
    }
    /**
     * Retorna histórico de alíquotas do ISSQN parametrizadas de um município a partir de um código de município e código de serviço.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param codigoServico O código do serviço deve ser informado no formato 00.00.00.000.
     */
    retornaHistoricoAliquotas(codigoMunicipio, codigoServico) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get("https://" + Ambiente_1.ServicoEnum.SEFIN + this.ambiente + "/sefinnacional/parametros_municipais/" + codigoMunicipio + "/" + codigoServico + "/historicoaliquotas", yield this.axiosConfig).catch((error) => { return error; });
        });
    }
    /**
     * Retorna os parâmetros do convênio de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     */
    retornaConvenio(codigoMunicipio) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get("https://" + Ambiente_1.ServicoEnum.SEFIN + this.ambiente + "/sefinnacional/parametros_municipais/" + codigoMunicipio + "/convenio", yield this.axiosConfig).catch((error) => { return error; });
        });
    }
    /**
     * Retorna os parâmetros de regimes especiais de tributação de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param codigoServico O código do serviço deve ser informado no formato 00.00.00.000.
     * @param competencia No formato MM/DD/YYYY
     */
    retornaRegimesEspeciais(codigoMunicipio, codigoServico, competencia) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get("https://" + Ambiente_1.ServicoEnum.SEFIN + this.ambiente + "/sefinnacional/parametros_municipais/" + codigoMunicipio + "/" + codigoServico + "/" + competencia + "/regimes_especiais", yield this.axiosConfig).catch((error) => { return error; });
        });
    }
    /**
     * Retorna os parâmetros para retenções do ISSQN de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param competencia No formato MM/DD/YYYY
     */
    retornaRetencoes(codigoMunicipio, competencia) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get("https://" + Ambiente_1.ServicoEnum.SEFIN + this.ambiente + "/sefinnacional/parametros_municipais/" + codigoMunicipio + "/" + competencia + "/retencoes", yield this.axiosConfig).catch((error) => { return error; });
        });
    }
    /**
     * Retorna os parâmetros de um número de benefício municipal a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param numeroBeneficio O número do benefício deve ser composto por onze dígitos.
     * @param competencia No formato MM/DD/YYYY
     */
    retornaBeneficios(codigoMunicipio, numeroBeneficio, competencia) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get("https://" + Ambiente_1.ServicoEnum.SEFIN + this.ambiente + "/sefinnacional/parametros_municipais/" + codigoMunicipio + "/" + numeroBeneficio + "/" + competencia + "/beneficio", yield this.axiosConfig).catch((error) => { return error; });
        });
    }
}
exports.ParametrosMunicipaisFiscosCliente = ParametrosMunicipaisFiscosCliente;
