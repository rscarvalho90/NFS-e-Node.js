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
exports.DanfseCliente = void 0;
const Ambiente_1 = require("../../../enum/Ambiente");
const axios_1 = __importDefault(require("axios"));
const Cliente_1 = require("../Cliente");
/**
 * Classe que realiza a emissão de Documentos Auxiliares de Notas Fiscais de Serviço eletrônicas (DANFS-e).
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
 */
class DanfseCliente extends Cliente_1.Cliente {
    constructor() {
        super(...arguments);
        this.hostRequisicao = (0, Ambiente_1.getHostRequisicao)(this.ambiente, Ambiente_1.AreaAmbienteEnum.CONTRIBUINTE, Ambiente_1.ServicoEnum.DANFSE);
    }
    /**
     * Retorna o DANFSe (em formato PDF) de uma NFS-e a partir de sua chave de acesso.
     *
     * @param chaveAcesso Chave de acesso da Nota Fiscal de Serviço Eletrônica (NFS-e)
     */
    retornaDanfse(chaveAcesso) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get(`${this.hostRequisicao}/danfse/${chaveAcesso}`, yield this.axiosConfig).catch((error) => {
                return error;
            });
        });
    }
}
exports.DanfseCliente = DanfseCliente;
