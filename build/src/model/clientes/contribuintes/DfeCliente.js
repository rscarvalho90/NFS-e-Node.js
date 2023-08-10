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
exports.DfeCliente = void 0;
const Ambiente_1 = require("../../../enum/Ambiente");
const axios_1 = __importDefault(require("axios"));
const Cliente_1 = require("../Cliente");
/**
 * Classe que realiza a distribuição de Documentos Fiscais Eletrônicos (DF-e's).
 *
 * Documentação do Ambiente de Produção: https://www.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Produção Restrita: https://www.producaorestrita.nfse.gov.br/swagger/contribuintesissqn/
 * Documentação do Ambiente de Homologação: https://hom.nfse.fazenda.gov.br/swagger/contribuintesissqn/
 */
class DfeCliente extends Cliente_1.Cliente {
    constructor() {
        super(...arguments);
        this.hostRequisicao = (0, Ambiente_1.getHostRequisicao)(this.ambiente, Ambiente_1.AreaAmbienteEnum.CONTRIBUINTE, Ambiente_1.ServicoEnum.DFE);
    }
    /**
     * Distribui os DF-e para contribuinte relacionados à NFS-e.
     *
     * @param identificador NSU @type {number} ou chave @type {string} do documento a ser distribuído aos contribuinte relacionados.
     */
    distribuiDfe(identificador) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof identificador == "number") {
                return yield axios_1.default.get(`${this.hostRequisicao}/DFe/${identificador}?lote=false`, yield this.axiosConfig).catch((error) => {
                    return error;
                });
            }
            else {
                return yield axios_1.default.get(`${this.hostRequisicao}/NFSe/${identificador}/Eventos?lote=false`, yield this.axiosConfig).catch((error) => {
                    return error;
                });
            }
        });
    }
}
exports.DfeCliente = DfeCliente;
