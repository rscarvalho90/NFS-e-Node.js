import * as fs from "fs";
import https from "https";
import pem, {Pkcs12ReadResult} from "pem";
import axios from "axios";


/**
 * Retorna os dados do certificado PKCS12.
 * @param certBuffer Buffer do certificado (pode ser obtido pelo método "fs.readFileSync")
 * @param senhaCertificado Senha do arquivo do certificado.
 * @private
 */
export async function getDadosPkcs12(certBuffer: Buffer, senhaCertificado: string): Promise<Pkcs12ReadResult> {
    return new Promise(async (resolve, reject) => {
        pem.readPkcs12(certBuffer, {p12Password: senhaCertificado}, (err, cert) => {
            if(cert.key!=undefined) {
                resolve(cert);
            } else {
                reject(err);
            }
        });
    });
}

/**
 * Retorna as configurações HTTP do Axios.
 * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
 * @param senhaCertificado Senha do arquivo do certificado.
 */
export async function getConfiguracoesHttpAxios(pathCertificado: string, senhaCertificado: string): Promise<AxiosConfig> {
    // Importa um certificado tipo A1
    const certBuffer: Buffer = fs.readFileSync(pathCertificado);
    const dadosPkcs12 = await getDadosPkcs12(certBuffer, senhaCertificado);

    const httpsAgent = new https.Agent({
        cert: dadosPkcs12.cert,
        key: dadosPkcs12.key,
        ca: dadosPkcs12.ca,
        keepAlive: false,
        rejectUnauthorized: false
    });

    return {
        headers: {},
        httpsAgent: httpsAgent
    };
}

/**
 * Retorna o IP (público) atual do cliente.
 *
 * @private
 */
export async function getIp(): Promise<string> {
    let jsonResposta = (await axios.get("https://api.myip.com")).data;

    return jsonResposta["ip"] as string;
}

export interface AxiosConfig {
    headers: { [key: string]: string },
    httpsAgent: https.Agent
}