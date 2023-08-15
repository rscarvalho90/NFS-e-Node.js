import axios, {AxiosResponse} from "axios";
import {Ambiente, AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../../enum/Ambiente";
import gzip from "node-gzip";
import {AxiosConfig, getConfiguracoesHttpAxios} from "../../../util/HttpConfig";
import {assinaStringXml} from "../../../util/AssinaturaXmlNfse";
import fs from "fs";
import {Cliente} from "../Cliente";


/**
 * Classe que realiza integrações com as APIs de envio
 * e consulta da NFS-e Nacional.
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
 */
export class NfseCliente extends Cliente {
    private hostRequisicao = getHostRequisicao(this.ambiente, AreaAmbienteEnum.CONTRIBUINTE, ServicoEnum.NFSE);

    /**
     * Envia um XML contendo uma DPS (Declaração de Prestação de Serviços).
     *
     * @param xmlString String representativa do conteúdo XML (DPS) a ser assinado.
     */
    async enviaDps(xmlString: string): Promise<AxiosResponse<any, any>> {
        let xmlAssinado = await assinaStringXml(xmlString, "infDPS", this.pathCertificado, this.senhaCertificado);

        const xmlAssinadoGzipBase64 = Buffer.from(await gzip.gzip(xmlAssinado)).toString("base64");

        return await axios.post(`${this.hostRequisicao}/nfse`,
            {dpsXmlGZipB64: xmlAssinadoGzipBase64},
            await this.axiosConfig).catch(erro => {
            return erro;
        });
    }

    /**
     * Envia um XML contendo uma DPS (Declaração de Prestação de Serviços).
     *
     * @param xmlPath Path (caminho, na estação cliente) do arquivo XML representativo da DPS (Declaração de Prestação de Serviços) a ser enviado.
     */
    async enviaDpsDeArquivo(xmlPath: string): Promise<AxiosResponse<any, any>> {
        const xmlString = fs.readFileSync(xmlPath, "utf8");

        return this.enviaDps(xmlString);
    }

    /**
     * Retorna a NFS-e a partir da consulta pela chave de acesso correspondente (50 posições).
     *
     * @param chaveAcesso Chave de acesso da Nota Fiscal de Serviço Eletrônica (NFS-e)
     */
    async retornaNfse(chaveAcesso: string): Promise<any> {
        return await axios.get(`${this.hostRequisicao}/nfse/${chaveAcesso}`,
            await this.axiosConfig).catch((error) => {
            return error
        });
    }

    /**
     * Obtém as NFS-e's pagáveis pelo contribuinte.
     *
     * @param inscricaoFederal CNPJ/CPF do contribuinte apenas com sinais numéricos
     * @param mesCompetencia Mês de competência no formato MMAA
     * @param codigoMunicipal Código IBGE do município
     * @param situacaoTributaria Situação tributária
     */
    async retornaNfsePagaveis(inscricaoFederal: string, mesCompetencia: string, codigoMunicipal: number, situacaoTributaria: number) {
        inscricaoFederal = inscricaoFederal.replace(/\D/g, "");
        mesCompetencia = mesCompetencia.replace(/\D/g, "");

        return await axios.get(`${this.hostRequisicao}/nfse/${inscricaoFederal}/${mesCompetencia}/${codigoMunicipal}/${situacaoTributaria}`,
            await this.axiosConfig).catch((error) => {
            return error
        });
    }
}