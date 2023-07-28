import axios, {AxiosResponse} from "axios";
import {Ambiente, ServicoEnum} from "../../enum/Ambiente";
import gzip from "node-gzip";
import {AxiosConfig, getConfiguracoesHttpAxios} from "../../util/HttpConfig";
import {assinaArquivoXml, finalizaXml} from "../../util/AssinaturaXmlNfse";


/**
 * Classe que realiza integrações com as APIs de envio
 * e consulta da NFS-e Nacional. <br>
 * Documentação: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/ 
 */
export class NfseCliente {

    private axiosConfig: Promise<AxiosConfig> = getConfiguracoesHttpAxios(this.pathCertificado, this.senhaCertificado);

    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(private ambiente: Ambiente, private pathCertificado: string, private senhaCertificado: string) {

    }

    //TODO: Método {@link NfseCliente.enviaDps} não testado devido à indisponibilidade de certificado de contribuinte

    /**
     * Envia um XML contendo uma DPS (Declaração de Prestação de Serviços).
     *
     * @param xmlPath Path (local, caminho) do arquivo XML a ser enviado.
     * @return
     */
    async enviaDps(xmlPath: string): Promise<AxiosResponse<any, any>> {
        let xmlAssinado = await assinaArquivoXml(xmlPath, "infDPS", this.pathCertificado, this.senhaCertificado);

        xmlAssinado = finalizaXml(xmlAssinado);
        const xmlAssinadoGzipBase64 = Buffer.from(await gzip.gzip(xmlAssinado)).toString("base64");

        return await axios.post("https://" + ServicoEnum.SEFIN + this.ambiente + "/SefinNacional/nfse",
            {dpsXmlGZipB64: xmlAssinadoGzipBase64},
            await this.axiosConfig);
    }

    /**
     * Retorna a NFS-e a partir da consulta pela chave de acesso correspondente (50 posições).
     *
     * @param chaveAcesso Chave de acesso da Nota Fiscal de Serviço Eletrônica (NFS-e)
     */
    async retornaNfse(chaveAcesso: string) {
        return await axios.get("https://" + ServicoEnum.SEFIN + this.ambiente + "/SefinNacional/nfse/"+chaveAcesso,
            await this.axiosConfig).catch((error) => {return error});
    }
}