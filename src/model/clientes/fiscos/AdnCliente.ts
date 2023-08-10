import axios, {AxiosResponse} from "axios";
import {AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../../enum/Ambiente";
import {AxiosConfig, getDadosPkcs12, getIp} from "../../../util/HttpConfig";
import * as fs from "fs";
import {TipoNsuEnum} from "../../../enum/TipoNsuEnum";
import gzip from "node-gzip";
import {Cliente} from "../Cliente";

/**
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/fisco/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/fisco/
 */

export class AdnCliente extends Cliente {
    private hostRequisicao: string = getHostRequisicao(this.ambiente, AreaAmbienteEnum.FISCO, ServicoEnum.ADN);

    /**
     * Recepciona um lote de Documentos
     * @param loteGzipBase64 Arquivo Gzip, em base64, contendo o lote de documentos fiscais.
     */
    private async recepcionaLoteDfe(loteGzipBase64: string[]): Promise<AxiosResponse<any, any>> {
        // Importa um certificado tipo A1
        const certBuffer: Buffer = fs.readFileSync(this.pathCertificado);
        const dadosPkcs12 = await getDadosPkcs12(certBuffer, this.senhaCertificado);

        const certificadoBase64 = Buffer.from(dadosPkcs12.cert, "utf-8").toString("base64");
        const ip = await getIp();

        const axiosConfig: AxiosConfig = await this.axiosConfig;
        axiosConfig.headers["X-SSL-Client-Cert"] = certificadoBase64;
        axiosConfig.headers["X-Forwarded-For"] = ip;

        return await axios.post(`${this.hostRequisicao}/dfe`,
            {LoteXmlGZipB64: loteGzipBase64},
            axiosConfig).catch((erro) => {
            return erro
        });
    }

    /**
     * Recepciona um lote de Documentos
     * @param xmlStrings Lista de strings representando os documentos a serem enviados.
     */
    async recepcionaLoteDfeXml(xmlStrings: string[]): Promise<AxiosResponse<any, any>> {
        let loteGzipBase64: string[] = []

        for (const xmlString of xmlStrings) {
            loteGzipBase64.push(Buffer.from(await gzip.gzip(xmlString)).toString("base64"));
        }

        return this.recepcionaLoteDfe(loteGzipBase64);
    }

    /**
     * Retorna um lote contendo até 100 (cem) Documentos Fiscais de Serviço a partir do NSU informado (inclusive)
     * @param nsuInicial Primeiro NSU a ser retornado
     * @param tipoNsu Tipo do NSU (RECEPCAO, DISTRIBUICAO, MEI)
     * @param lote Retorna lote (true) ou apenas o documento referente ao NSU (false)
     */
    async retornaDocumentosFiscais(nsuInicial: number, tipoNsu: TipoNsuEnum, lote: boolean) {
        return await axios.get(`${this.hostRequisicao}/municipios/dfe/${nsuInicial}?tipoNSU=${tipoNsu}&lotes=${lote}`,
            await this.axiosConfig).catch((erro) => {
            return erro
        });
    }

    /**
     * Retorna um lote contendo até 100 (cem) Documentos Fiscais de Serviço do tipo Evento vinculados à chave de acesso informada.
     *
     * @param chaveAcesso Chave de acesso da Nota Fiscal de Serviço Eletrônica (NFS-e)
     */
    async retornaEventos(chaveAcesso: string) {
        return await axios.get(`${this.hostRequisicao}/municipios/NFSe/${chaveAcesso}/Eventos`,
            await this.axiosConfig).catch((erro) => {
            return erro
        });
    }
}