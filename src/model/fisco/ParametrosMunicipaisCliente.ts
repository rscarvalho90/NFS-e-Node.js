import axios from "axios";
import {AmbienteEnum, ServicoEnum} from "../../enum/AmbienteEnum";
import {AxiosConfig, getConfiguracoesHttpAxios, getDadosPkcs12, getIp} from "../../util/HttpConfig";

/**
 * Documentação: https://www.producaorestrita.nfse.gov.br/swagger/fisco/
 *
 * Painel Municipal: https://www.producaorestrita.nfse.gov.br/PainelMunicipal/
 */
export class ParametrosMunicipaisCliente {

    private axiosConfig: Promise<AxiosConfig> = getConfiguracoesHttpAxios(this.pathCertificado, this.senhaCertificado);

    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(private ambiente: AmbienteEnum, private pathCertificado: string, private senhaCertificado: string) {

    }

    /**
     * Retorna a alíquota do ISSQN parametrizada de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param codigoServico O código do serviço deve ser informado no formato 00.00.00.000.
     * @param competencia No formato MM/DD/YYYY
     */
    async retornaAliquotas(codigoMunicipio: number, codigoServico: string, competencia: Date) {
        return await axios.get("https://" + ServicoEnum.SEFIN + this.ambiente + "/parametros_municipais/"+codigoMunicipio+"/"+codigoServico+"/"+competencia+"/aliquota",
            await this.axiosConfig).catch((error) => {return error});
    }

    /**
     * Retorna histórico de alíquotas do ISSQN parametrizadas de um município a partir de um código de município e código de serviço.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param codigoServico O código do serviço deve ser informado no formato 00.00.00.000.
     */
    async retornaHistoricoAliquotas(codigoMunicipio: number, codigoServico: string) {
        return await axios.get("https://" + ServicoEnum.SEFIN + this.ambiente + "/parametros_municipais/"+codigoMunicipio+"/"+codigoServico+"/historicoaliquotas",
            await this.axiosConfig).catch((error) => {return error});
    }

    /**
     * Retorna os parâmetros do convênio de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     */
    async retornaConvenio(codigoMunicipio: number) {
        return await axios.get("https://" + ServicoEnum.SEFIN + this.ambiente + "/parametros_municipais/"+codigoMunicipio+"/convenio",
            await this.axiosConfig).catch((error) => {return error});
    }

    /**
     * Retorna os parâmetros de regimes especiais de tributação de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param codigoServico O código do serviço deve ser informado no formato 00.00.00.000.
     * @param competencia No formato MM/DD/YYYY
     */
    async retornaRegimesEspeciais(codigoMunicipio: number, codigoServico: string, competencia: Date) {
        return await axios.get("https://" + ServicoEnum.SEFIN + this.ambiente + "/parametros_municipais/"+codigoMunicipio+"/"+codigoServico+"/"+competencia+"/regimes_especiais",
            await this.axiosConfig).catch((error) => {return error});
    }

    /**
     * Retorna os parâmetros para retenções do ISSQN de um município a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param competencia No formato MM/DD/YYYY
     */
    async retornaRetencoes(codigoMunicipio: number, competencia: Date) {
        return await axios.get("https://" + ServicoEnum.SEFIN + this.ambiente + "/parametros_municipais/"+codigoMunicipio+"/"+competencia+"/retencoes",
            await this.axiosConfig).catch((error) => {return error});
    }

    /**
     * Retorna os parâmetros de um número de benefício municipal a partir desta consulta.
     *
     * @param codigoMunicipio O código do município deve ser composto por sete dígitos.
     * @param numeroBeneficio O número do benefício deve ser composto por onze dígitos.
     * @param competencia No formato MM/DD/YYYY
     */
    async retornaBeneficios(codigoMunicipio: number, numeroBeneficio: number, competencia: Date) {
        return await axios.get("https://" + ServicoEnum.SEFIN + this.ambiente + "/parametros_municipais/"+codigoMunicipio+"/"+numeroBeneficio+"/"+competencia+"/beneficio",
            await this.axiosConfig).catch((error) => {return error});
    }
}