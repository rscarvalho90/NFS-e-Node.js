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
exports.ParametrosMunicipaisFiscoCliente = void 0;
const axios_1 = __importDefault(require("axios"));
const Ambiente_1 = require("../../enum/Ambiente");
const HttpConfig_1 = require("../../util/HttpConfig");
const date_and_time_1 = __importDefault(require("date-and-time"));
/**
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/fisco/
 *
 * Painel Municipal: https://www.producaorestrita.nfse.gov.br/PainelMunicipal/
 */
class ParametrosMunicipaisFiscoCliente {
    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     * @param hostRequisicao Parâmetro opcional para uso na herança da classe de contribuintes.
     */
    constructor(ambiente, pathCertificado, senhaCertificado, hostRequisicao) {
        this.ambiente = ambiente;
        this.pathCertificado = pathCertificado;
        this.senhaCertificado = senhaCertificado;
        this.axiosConfig = (0, HttpConfig_1.getConfiguracoesHttpAxios)(this.pathCertificado, this.senhaCertificado);
        this.hostRequisicao = (0, Ambiente_1.getHostRequisicao)(this.ambiente, Ambiente_1.AreaAmbienteEnum.FISCO, Ambiente_1.ServicoEnum.PARAMETROS_MUNICIPAIS);
        if (hostRequisicao != undefined) {
            this.hostRequisicao = hostRequisicao;
        }
    }
    /**
     * Retorna a alíquota do ISSQN parametrizada de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param codigoServico O código do serviço deve ser informado no formato 00.00.00.000
     * @param competencia No formato MM-DD-YYYY
     */
    retornaAliquotas(codigoMunicipio, codigoServico, competencia) {
        return __awaiter(this, void 0, void 0, function* () {
            const competenciaStr = date_and_time_1.default.format(competencia, "MM-DD-YYYY");
            return yield axios_1.default.get(`${this.hostRequisicao}/parametros_municipais/${codigoMunicipio}/${codigoServico}/${competenciaStr}/aliquota`, yield this.axiosConfig).catch((error) => {
                return error;
            });
        });
    }
    /**
     * Retorna histórico de alíquotas do ISSQN parametrizadas de um município a partir de um código de município e código de serviço.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param codigoServico O código do serviço deve ser informado no formato 00.00.00.000
     */
    retornaHistoricoAliquotas(codigoMunicipio, codigoServico) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get(`${this.hostRequisicao}/parametros_municipais/${codigoMunicipio}/${codigoServico}/historicoaliquotas`, yield this.axiosConfig).catch((error) => {
                return error;
            });
        });
    }
    /**
     * Retorna os parâmetros do convênio de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     */
    retornaParametrosConvenio(codigoMunicipio) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get(`${this.hostRequisicao}/parametros_municipais/${codigoMunicipio}/convenio`, yield this.axiosConfig).catch((error) => {
                return error;
            });
        });
    }
    /**
     * Retorna os parâmetros de regimes especiais de tributação de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param codigoServico O código do serviço deve ser informado no formato 00.00.00.000
     * @param competencia No formato MM-DD-YYYY
     */
    retornaParametrosRegimeEspecial(codigoMunicipio, codigoServico, competencia) {
        return __awaiter(this, void 0, void 0, function* () {
            const competenciaStr = date_and_time_1.default.format(competencia, "MM-DD-YYYY");
            return yield axios_1.default.get(`${this.hostRequisicao}/parametros_municipais/${codigoMunicipio}/${codigoServico}/${competenciaStr}/regimes_especiais`, yield this.axiosConfig).catch((error) => {
                return error;
            });
        });
    }
    /**
     * Retorna os parâmetros para retenções do ISSQN de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param competencia No formato MM-DD-YYYY
     */
    retornaParametrosRetencao(codigoMunicipio, competencia) {
        return __awaiter(this, void 0, void 0, function* () {
            const competenciaStr = date_and_time_1.default.format(competencia, "MM-DD-YYYY");
            return yield axios_1.default.get(`${this.hostRequisicao}/parametros_municipais/${codigoMunicipio}/${competenciaStr}/retencoes`, yield this.axiosConfig).catch((error) => {
                return error;
            });
        });
    }
    /**
     * Retorna os parâmetros de um número de benefício municipal a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param numeroBeneficio O número do benefício deve ser composto por onze dígitos.
     * @param competencia No formato MM-DD-YYYY
     */
    retornaParametrosBeneficio(codigoMunicipio, numeroBeneficio, competencia) {
        return __awaiter(this, void 0, void 0, function* () {
            const competenciaStr = date_and_time_1.default.format(competencia, "MM-DD-YYYY");
            return yield axios_1.default.get(`${this.hostRequisicao}/parametros_municipais/${codigoMunicipio}/${numeroBeneficio}/${competenciaStr}/beneficio`, yield this.axiosConfig).catch((error) => {
                return error;
            });
        });
    }
}
exports.ParametrosMunicipaisFiscoCliente = ParametrosMunicipaisFiscoCliente;
