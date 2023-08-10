"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventoCliente = void 0;
const Ambiente_1 = require("../../../enum/Ambiente");
const Cliente_1 = require("../Cliente");
const axios_1 = __importDefault(require("axios"));
const AssinaturaXmlNfse_1 = require("../../../util/AssinaturaXmlNfse");
const node_gzip_1 = __importDefault(require("node-gzip"));
const xml2js_1 = __importDefault(require("xml2js"));
const fs_1 = __importDefault(require("fs"));
/**
 * Classe que realiza envio e consulta a eventos da NFS-e, crédito, débito e apuração.
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
 */
class EventoCliente extends Cliente_1.Cliente {
    constructor() {
        super(...arguments);
        this.hostRequisicao = (0, Ambiente_1.getHostRequisicao)(this.ambiente, Ambiente_1.AreaAmbienteEnum.CONTRIBUINTE, Ambiente_1.ServicoEnum.EVENTOS);
    }
    /**
     * Envia um pedido de registro de evento.
     *
     * @param xmlString String representativa do conteúdo XML (Evento) a ser assinado.
     */
    enviaPedidoRegistroEvento(xmlString) {
        return __awaiter(this, void 0, void 0, function* () {
            let chaveAcesso;
            xml2js_1.default.parseString(xmlString, (erro, resultado) => {
                chaveAcesso = resultado.pedRegEvento.infPedReg[0].chNFSe[0];
            });
            if (chaveAcesso == undefined)
                throw Error("Chave de acesso não encontrada no arquivo XML do evento.");
            let xmlAssinado = yield (0, AssinaturaXmlNfse_1.assinaStringXml)(xmlString, "infPedReg", this.pathCertificado, this.senhaCertificado);
            const xmlAssinadoGzipBase64 = Buffer.from(yield node_gzip_1.default.gzip(xmlAssinado)).toString("base64");
            return yield axios_1.default.post(`${this.hostRequisicao}/nfse/${chaveAcesso}/eventos`, { pedidoRegistroEventoXmlGZipB64: xmlAssinadoGzipBase64 }, yield this.axiosConfig).catch(erro => {
                return erro;
            });
        });
    }
    /**
     * Envia um pedido de registro de evento.
     *
     * @param xmlPath Path (caminho, na estação cliente) do arquivo XML representativo do Pedido de Registro de Evento (PRE) a ser enviado.
     */
    enviaPedidoRegistroEventoDeArquivo(xmlPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const xmlString = fs_1.default.readFileSync(xmlPath, "utf8");
            return this.enviaPedidoRegistroEvento(xmlString);
        });
    }
    /**
     * Retorna os eventos relativos a determina NFS-e.
     *
     * @param chaveAcesso Chave de acesso da NFS-e em que os eventos serão consultados.
     * @param tipoEvento Tipo de evento - Valores disponíveis : 101101, 101103, 105102, 105104, 105105, 202201, 202205, 203202, 203206, 204203, 204207, 205204, 205208, 305101, 305102, 305103, 907201, 967203
     * @param numSeqEvento Número sequencial do evento. Se informado, os demais parâmetros são obrigatórios.
     */
    retornaEventos(chaveAcesso, tipoEvento, numSeqEvento) {
        return __awaiter(this, void 0, void 0, function* () {
            if (tipoEvento == undefined)
                return yield axios_1.default.get(`${this.hostRequisicao}/nfse/${chaveAcesso}/eventos`, yield this.axiosConfig).catch((error) => {
                    return error;
                });
            else if (numSeqEvento == undefined)
                return yield axios_1.default.get(`${this.hostRequisicao}/nfse/${chaveAcesso}/eventos/${tipoEvento}`, yield this.axiosConfig).catch((error) => {
                    return error;
                });
            else
                return yield axios_1.default.get(`${this.hostRequisicao}/nfse/${chaveAcesso}/eventos/${tipoEvento}/${numSeqEvento}`, yield this.axiosConfig).catch((error) => {
                    return error;
                });
        });
    }
}
exports.EventoCliente = EventoCliente;
