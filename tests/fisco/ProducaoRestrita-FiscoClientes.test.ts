import {AdnCliente} from "../../src/model/fiscos/AdnCliente";
import {Ambiente} from "../../src/enum/Ambiente";
import {TipoNsuEnum} from "../../src/enum/TipoNsuEnum";
import {assinaStringXml, configuraXml, removeAssinaturaNfse} from "../../src/util/AssinaturaXmlNfse";
import fs from "fs";
import {geraIdDps, geraIdNfse} from "../../src/util/GeraId";
import {modificaValorTagXml} from "../../src/util/XmlUtil";
import gzip from "node-gzip";


const senhaCertificado: string = "senha1"
const ambiente: Ambiente = Ambiente.PRODUCAO_RESTRITA
const pathCertificado: string = "res/certificados_producao_restrita/461523_MUNICIPIO_DE_PACARAIMA.p12"
const pathXml = "tests/exemplos/teste.xml"


describe("Produção Restrita - Fisco", () => {

    let chaveAcesso: string;
    let nsu: number;
    let conteudoXmlAssinado: string;
    let dataHoraGeracao: Date;

    describe("ADN", () => {
        const adnCliente: AdnCliente = new AdnCliente(ambiente, pathCertificado, senhaCertificado);

        test("Retorna DFEs (NSU Distribuição)", async () => {
            const axiosResponse = await adnCliente.retornaDocumentosFiscais(1, TipoNsuEnum.DISTRIBUICAO, true);
            const ultimoDocumento: number = axiosResponse.data.LoteDFe.length-1;
            chaveAcesso = axiosResponse.data.LoteDFe[ultimoDocumento].ChaveAcesso as string;
            expect(axiosResponse.data.LoteDFe[ultimoDocumento].DataHoraGeracao).toBe("2023-04-18T18:54:11.363");
            //let conteudoXml = await descomprimeGzipDeBase64(axiosResponse.data.LoteDFe[0].ArquivoXml as string);
        });

        test("Envia DFE para ADN", async () => {
            let conteudoXml = fs.readFileSync(pathXml, "utf8");
            conteudoXml = conteudoXml.replace(/(<tribNac)( )?(\/>)/g, "");
            const numNfse = geraIdNfse(conteudoXml);
            const numDps = geraIdDps(conteudoXml);
            conteudoXml = modificaValorTagXml(conteudoXml, "NFSe.infNFSe['0']['$'].Id", numNfse);
            conteudoXml = modificaValorTagXml(conteudoXml, "NFSe.infNFSe['0'].DPS['0'].infDPS['0']['$'].Id", numDps);
            conteudoXml = removeAssinaturaNfse(conteudoXml);
            conteudoXml = configuraXml(conteudoXml);
            conteudoXmlAssinado = await assinaStringXml(conteudoXml, "infNFSe", pathCertificado, senhaCertificado)
            const resposta = await adnCliente.recepcionaLoteDfeXml([conteudoXmlAssinado]);
            chaveAcesso = resposta.data.Lote[0].ChaveAcesso;
            nsu = parseInt(resposta.data.Lote[0].NsuRecepcao);
        })

        test("Retorna DFE Transmitida (NSU Recepção)", async () => {
            const axiosResponse = await adnCliente.retornaDocumentosFiscais(nsu-1, TipoNsuEnum.RECEPCAO, true);
            dataHoraGeracao = new Date(axiosResponse.data.LoteDFe[0].DataHoraGeracao);
            expect(new Date(axiosResponse.data.LoteDFe[0].DataHoraGeracao).getTime()).toBeLessThan(new Date().getTime());
            expect(axiosResponse.data.LoteDFe[0].ChaveAcesso).toBe(chaveAcesso);
            expect(axiosResponse.data.LoteDFe[0].ArquivoXml).toBe(Buffer.from(await gzip.gzip(conteudoXmlAssinado)).toString("base64"));
            expect(axiosResponse.data.LoteDFe[0].TipoDocumento).toBe("NFSE");
        });

        test("Retorna Eventos", async () => {
            const axiosResponse = await adnCliente.retornaEventos(chaveAcesso);
            expect([axiosResponse.data.LoteDFe[0].ChaveAcesso,
                axiosResponse.data.LoteDFe[0].ArquivoXml,
                axiosResponse.data.LoteDFe[0].DataHoraRecebimento]).toBeDefined();
            expect(axiosResponse.data.LoteDFe[0].TipoDocumento).toBe("NFSE");
            expect(chaveAcesso.length).toBe(50);
            expect(axiosResponse.data.LoteDFe[0].ChaveAcesso).toBe(chaveAcesso);
            expect(new Date(axiosResponse.data.LoteDFe[0].DataHoraRecebimento).getTime()).toBe(dataHoraGeracao.getTime());
            expect(new Date(axiosResponse.data.LoteDFe[0].DataHoraRecebimento).getTime()).toBeLessThan(new Date().getTime());
        });

    });

})