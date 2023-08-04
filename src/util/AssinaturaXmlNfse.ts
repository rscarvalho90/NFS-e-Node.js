import * as fs from "fs";
import {getDadosPkcs12} from "./HttpConfig";
import SignedXml from "xml-crypto";

/**
 * Assina um XML com certificado do tipo A1.
 *
 * @param xmlStr XML em formato string.
 * @param tagAssinatura Tag a ser assinada no XML
 * @param pathCertificado Path (local, caminho) do certificado digital a ser utilizado na assinatura.
 * @param senhaCertificado Senha do certificado digital
 * @private
 */
export async function assinaStringXml(xmlStr: string, tagAssinatura: string, pathCertificado: string, senhaCertificado: string): Promise<string> {
    // Importa um certificado tipo A1
    const certBuffer: Buffer = fs.readFileSync(pathCertificado);

    // Configura os dados do certificado
    const dadosPkcs12 = await getDadosPkcs12(certBuffer, senhaCertificado);
    const chavePrivadaConfigurada: string = dadosPkcs12.key;

    // Configura o assinador
    let assinador = new SignedXml.SignedXml();

    const transforms = [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
    ];

    assinador.addReference("//*[local-name(.)='"+tagAssinatura+"']", transforms, "", "", "", "", false);
    assinador.signingKey = Buffer.from(chavePrivadaConfigurada);
    assinador.canonicalizationAlgorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
    assinador.signatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
    assinador.keyInfoProvider = new KeyInfoProvider(dadosPkcs12.cert);

    // Abre o XML a ser assinado
    const xmlString: string = configuraXml(xmlStr);

    // Assina o XML
    assinador.computeSignature(xmlString);

    return assinador.getSignedXml();
}

/**
 * Assina um XML com certificado do tipo A1.
 *
 * @param xmlPath Path (local, caminho) do arquivo XML a ser enviado.
 * @param tagAssinatura Tag a ser assinada no XML
 * @param pathCertificado Path (local, caminho) do certificado digital a ser utilizado na assinatura.
 * @param senhaCertificado Senha do certificado digital
 * @private
 */
export async function assinaArquivoXml(xmlPath: string, tagAssinatura: string, pathCertificado: string, senhaCertificado: string): Promise<string> {
    return assinaStringXml(fs.readFileSync(xmlPath, "utf8"), tagAssinatura, pathCertificado, senhaCertificado);
}

/**
 * Configura o XML antes da assinatura.
 *
 * @param xmlTxt XML, em formato String, a ser configurado.
 * @private
 */
export function configuraXml(xmlTxt: string): string {
    xmlTxt = xmlTxt.replace(/\r/g, "");
    xmlTxt = xmlTxt.replace(/\n/g, "");
    xmlTxt = xmlTxt.replace(/\t/g, "");
    xmlTxt = xmlTxt.replace(/( ){2,}/g, " ");
    xmlTxt = xmlTxt.replace(/(> )/g, ">");
    xmlTxt = xmlTxt.replace(/( <)/g, "<");

    return xmlTxt;
}

export function removeAssinaturaNfse(conteudoXml: string): string{
    return conteudoXml.replace(/(<Signature)(.|(\r\n|\r|\n))*(\/Signature>)/gi, "");
}

/**
 * Configura o xml-crypto para inserir os dados do certificado X509 na assinatura.
 */
class KeyInfoProvider {
    private file: string = "";

    constructor(public cert: string) {

    }

    getKeyInfo(key?: string, prefix?: string): string {
        this.cert = this.cert.replace(/\n/g, "");
        this.cert = this.cert.replace("-----BEGIN CERTIFICATE-----", "");
        this.cert = this.cert.replace("-----END CERTIFICATE-----", "");

        return `<X509Data><X509Certificate>${this.cert}</X509Certificate></X509Data>`;
    };

    getKey(keyInfo?: Node[] | null): Buffer {
        return Buffer.from(this.cert);
    };

}