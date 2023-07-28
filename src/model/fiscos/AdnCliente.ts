import axios, {AxiosResponse} from "axios";
import {Ambiente, ServicoEnum} from "../../enum/Ambiente";
import {AxiosConfig, getConfiguracoesHttpAxios, getDadosPkcs12, getIp} from "../../util/HttpConfig";
import * as fs from "fs";
import {TipoNsuEnum} from "../../enum/TipoNsuEnum";
import gzip from "node-gzip";

/**
 * Documentação: https://www.producaorestrita.nfse.gov.br/swagger/fisco/
 */

export class AdnCliente {

    private axiosConfig: Promise<AxiosConfig> = getConfiguracoesHttpAxios(this.pathCertificado, this.senhaCertificado);

    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(private ambiente: Ambiente, private pathCertificado: string, private senhaCertificado: string) {

    }

    //TODO: Testar a recepção de lotes no ADN

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

        return await axios.post("https://" + ServicoEnum.ADN + this.ambiente + "/dfe",
            {LoteXmlGZipB64: loteGzipBase64},
            axiosConfig).catch((error) => {return error});
    }

    /**
     * Recepciona um lote de Documentos
     * @param xmlStrings Lista de strings representando os documentos a serem enviados.
     */
    async recepcionaLoteDfeXml(xmlStrings: string[]): Promise<AxiosResponse<any, any>> {
        let loteGzipBase64: string[] = []

        for(const xmlString of xmlStrings) {
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
        return await axios.get("https://" + ServicoEnum.ADN + this.ambiente + "/municipios/dfe/"+nsuInicial+"?tipoNSU="+tipoNsu+"&lotes="+lote,
            await this.axiosConfig).catch((error) => {return error});
    }

    /**
     * Retorna um lote contendo até 100 (cem) Documentos Fiscais de Serviço do tipo Evento vinculados à chave de acesso informada.
     *
     * @param chaveAcesso Chave de acesso da Nota Fiscal de Serviço Eletrônica (NFS-e)
     */
    async retornaEventos(chaveAcesso: string) {
        return await axios.get("https://" + ServicoEnum.ADN + this.ambiente + "/municipios/NFSe/"+chaveAcesso+"/Eventos",
            await this.axiosConfig).catch((error) => {return error});
    }
}