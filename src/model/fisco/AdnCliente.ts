import axios, {AxiosResponse} from "axios";
import {AmbienteEnum, ServicoEnum} from "../../enum/AmbienteEnum";
import {getConfiguracoesHttpAxios, getDadosPkcs12, getIp} from "../../util/HttpConfig";
import * as fs from "fs";
import {TipoNsuEnum} from "../../enum/TipoNsuEnum";

export class AdnCliente {

    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(private ambiente: AmbienteEnum, private pathCertificado: string, private senhaCertificado: string) {

    }

    /**
     * Recepciona um lote de Documentos
     * @param gzipPath Path (local, caminho) do arquivo gzip com o lote de documentos a ser enviado.
     */
    async recepcionaDfe(gzipPath: string): Promise<AxiosResponse<any, any>> {
        const loteXmlGzip = Buffer.from(gzipPath).toString("base64");

        // Importa um certificado tipo A1
        const certBuffer: Buffer = fs.readFileSync(this.pathCertificado);
        const dadosPkcs12 = await getDadosPkcs12(certBuffer, this.senhaCertificado);

        const certificadoBase64 = Buffer.from(dadosPkcs12.cert, "utf-8").toString("base64");
        const ip = await getIp();

        const axiosConfig = await getConfiguracoesHttpAxios(this.pathCertificado, this.senhaCertificado);
        axiosConfig.headers["X-SSL-Client-Cert"] = certificadoBase64;
        axiosConfig.headers["X-Forwarded-For"] = ip;

        return await axios.post("https://" + ServicoEnum.ADN + this.ambiente + "/dfe",
            {LoteXmlGZipB64: loteXmlGzip},
            axiosConfig);
    }

    /**
     * Retorna um lote contendo até 100 (cem) Documentos Fiscais de Serviço a partir do NSU informado (inclusive)
     * @param nsuInicial Primeiro NSU a ser retornado
     * @param tipoNsu Tipo do NSU (RECEPCAO, DISTRIBUICAO, MEI)
     * @param lote Retorna lote (true) ou apenas o documento referente ao NSU (false)
     */
    async retornaDocumentosFiscais(nsuInicial: number, tipoNsu: TipoNsuEnum, lote: boolean) {
        const axiosConfig = await getConfiguracoesHttpAxios(this.pathCertificado, this.senhaCertificado);
        return await axios.get("https://" + ServicoEnum.ADN + this.ambiente + "/municipios/dfe/"+nsuInicial+"?tipoNSU="+tipoNsu+"&lotes="+lote,
            axiosConfig).catch((error) => {return error});
    }
}