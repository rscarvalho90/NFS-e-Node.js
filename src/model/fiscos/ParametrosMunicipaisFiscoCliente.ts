import axios from "axios";
import {Ambiente, AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../enum/Ambiente";
import {AxiosConfig, getConfiguracoesHttpAxios} from "../../util/HttpConfig";
import date from "date-and-time";

/**
 * Classe que retorna os parâmetros municipais (alíquotas, benefícios, regimes especiais, retenções e convênios).
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/fisco/
 *
 * Painel Municipal: https://www.producaorestrita.nfse.gov.br/PainelMunicipal/
 */
export class ParametrosMunicipaisFiscoCliente {

    private axiosConfig: Promise<AxiosConfig> = getConfiguracoesHttpAxios(this.pathCertificado, this.senhaCertificado);
    private hostRequisicao = getHostRequisicao(this.ambiente, AreaAmbienteEnum.FISCO, ServicoEnum.PARAMETROS_MUNICIPAIS);

    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     * @param hostRequisicao Parâmetro opcional para uso na herança da classe de contribuinte.
     */
    constructor(private ambiente: Ambiente, private pathCertificado: string, private senhaCertificado: string, hostRequisicao?: string) {
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
    async retornaAliquotas(codigoMunicipio: number, codigoServico: string, competencia: Date) {
        const competenciaStr: string = date.format(competencia, "MM-DD-YYYY");

        return await axios.get(`${this.hostRequisicao}/parametros_municipais/${codigoMunicipio}/${codigoServico}/${competenciaStr}/aliquota`,
            await this.axiosConfig).catch((error) => {
            return error
        });
    }

    /**
     * Retorna histórico de alíquotas do ISSQN parametrizadas de um município a partir de um código de município e código de serviço.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param codigoServico O código do serviço deve ser informado no formato 00.00.00.000
     */
    async retornaHistoricoAliquotas(codigoMunicipio: number, codigoServico: string) {
        return await axios.get(`${this.hostRequisicao}/parametros_municipais/${codigoMunicipio}/${codigoServico}/historicoaliquotas`,
            await this.axiosConfig).catch((error) => {
            return error
        });
    }

    /**
     * Retorna os parâmetros do convênio de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     */
    async retornaParametrosConvenio(codigoMunicipio: number) {
        return await axios.get(`${this.hostRequisicao}/parametros_municipais/${codigoMunicipio}/convenio`,
            await this.axiosConfig).catch((error) => {
            return error
        });
    }

    /**
     * Retorna os parâmetros de regimes especiais de tributação de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param codigoServico O código do serviço deve ser informado no formato 00.00.00.000
     * @param competencia No formato MM-DD-YYYY
     */
    async retornaParametrosRegimeEspecial(codigoMunicipio: number, codigoServico: string, competencia: Date) {
        const competenciaStr: string = date.format(competencia, "MM-DD-YYYY");

        return await axios.get(`${this.hostRequisicao}/parametros_municipais/${codigoMunicipio}/${codigoServico}/${competenciaStr}/regimes_especiais`,
            await this.axiosConfig).catch((error) => {
            return error
        });
    }

    /**
     * Retorna os parâmetros para retenções do ISSQN de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param competencia No formato MM-DD-YYYY
     */
    async retornaParametrosRetencao(codigoMunicipio: number, competencia: Date) {
        const competenciaStr: string = date.format(competencia, "MM-DD-YYYY");

        return await axios.get(`${this.hostRequisicao}/parametros_municipais/${codigoMunicipio}/${competenciaStr}/retencoes`,
            await this.axiosConfig).catch((error) => {
            return error
        });
    }

    /**
     * Retorna os parâmetros de um número de benefício municipal a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param numeroBeneficio O número do benefício deve ser composto por onze dígitos.
     * @param competencia No formato MM-DD-YYYY
     */
    async retornaParametrosBeneficio(codigoMunicipio: number, numeroBeneficio: number, competencia: Date) {
        const competenciaStr: string = date.format(competencia, "MM-DD-YYYY");

        return await axios.get(`${this.hostRequisicao}/parametros_municipais/${codigoMunicipio}/${numeroBeneficio}/${competenciaStr}/beneficio`,
            await this.axiosConfig).catch((error) => {
            return error
        });
    }
}