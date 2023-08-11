import {Ambiente, AreaAmbienteEnum, getHostRequisicao, ServicoEnum} from "../../../enum/Ambiente";
import {Cliente} from "../Cliente";
import axios from "axios";
import {assinaStringXml} from "../../../util/AssinaturaXmlNfse";
import gzip from "node-gzip";
import xml2js from "xml2js";
import fs from "fs";
import {integracaoNaoTestada, retornandoErro} from "../../decorators/ClienteDecorators";

/**
 * Classe que realiza envio e consulta a eventos da NFS-e, crédito, débito e apuração.
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
 */
export class EventoCliente extends Cliente{
    private hostRequisicao = getHostRequisicao(this.ambiente, AreaAmbienteEnum.CONTRIBUINTE, ServicoEnum.EVENTOS);

    /**
     * Envia um pedido de registro de evento.
     *
     * @param xmlString String representativa do conteúdo XML (Evento) a ser assinado.
     */
    @retornandoErro([Ambiente.HOMOLOGACAO], "Padrão do \"Id\" do Pedido de Registro de Evento exigido diverge da documentação.")
    @integracaoNaoTestada([Ambiente.PRODUCAO, Ambiente.PRODUCAO_RESTRITA], "Teste no ambiente de Homologação retornou erro, não permitindo inferir se a integração com a API é válida nos ambientes citados.")
    async enviaPedidoRegistroEvento(xmlString: string) {
        let chaveAcesso;

        xml2js.parseString(xmlString, (erro, resultado) => {
            chaveAcesso = resultado.pedRegEvento.infPedReg[0].chNFSe[0] as string;
        });

        if(chaveAcesso==undefined)
            throw Error("Chave de acesso não encontrada no arquivo XML do evento.");

        let xmlAssinado = await assinaStringXml(xmlString, "infPedReg", this.pathCertificado, this.senhaCertificado);

        const xmlAssinadoGzipBase64 = Buffer.from(await gzip.gzip(xmlAssinado)).toString("base64");

        return await axios.post(`${this.hostRequisicao}/nfse/${chaveAcesso}/eventos`,
            {pedidoRegistroEventoXmlGZipB64: xmlAssinadoGzipBase64},
            await this.axiosConfig).catch(erro => {
            return erro;
        });
    }

    /**
     * Envia um pedido de registro de evento.
     *
     * @param xmlPath Path (caminho, na estação cliente) do arquivo XML representativo do Pedido de Registro de Evento (PRE) a ser enviado.
     */
    @retornandoErro([Ambiente.HOMOLOGACAO], "Padrão do \"Id\" do Pedido de Registro de Evento exigido diverge da documentação.")
    @integracaoNaoTestada([Ambiente.PRODUCAO, Ambiente.PRODUCAO_RESTRITA], "Teste no ambiente de Homologação retornou erro, não permitindo inferir se a integração com a API é válida nos ambientes citados.")
    async enviaPedidoRegistroEventoDeArquivo(xmlPath: string) {
        const xmlString = fs.readFileSync(xmlPath, "utf8");

        return this.enviaPedidoRegistroEvento(xmlString);
    }

    /**
     * Retorna os eventos relativos a determina NFS-e.
     *
     * @param chaveAcesso Chave de acesso da NFS-e em que os eventos serão consultados.
     * @param tipoEvento Tipo de evento - Valores disponíveis : 101101, 101103, 105102, 105104, 105105, 202201, 202205, 203202, 203206, 204203, 204207, 205204, 205208, 305101, 305102, 305103, 907201, 967203
     * @param numSeqEvento Número sequencial do evento. Se informado, os demais parâmetros são obrigatórios.
     */
    @retornandoErro([Ambiente.HOMOLOGACAO], "O ambiente está retornando método não permitido (HTTP 405) ou não encontrado (HTTP 404).")
    @integracaoNaoTestada([Ambiente.PRODUCAO, Ambiente.PRODUCAO_RESTRITA], "Teste no ambiente de Homologação retornou erro, não permitindo inferir se a integração com a API é válida nos ambientes citados.")
    async retornaEventos(chaveAcesso: string, tipoEvento?: number, numSeqEvento?: number) {
        if(tipoEvento==undefined)
            return await axios.get(`${this.hostRequisicao}/nfse/${chaveAcesso}/eventos`,
                await this.axiosConfig).catch((error) => {
                return error
            });
        else if(numSeqEvento==undefined)
            return await axios.get(`${this.hostRequisicao}/nfse/${chaveAcesso}/eventos/${tipoEvento}`,
                await this.axiosConfig).catch((error) => {
                return error
            });
        else
            return await axios.get(`${this.hostRequisicao}/nfse/${chaveAcesso}/eventos/${tipoEvento}/${numSeqEvento}`,
                await this.axiosConfig).catch((error) => {
                return error
            });
    }
}