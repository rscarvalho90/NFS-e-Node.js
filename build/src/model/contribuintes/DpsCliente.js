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
exports.DpsCliente = void 0;
const HttpConfig_1 = require("../../util/HttpConfig");
const Ambiente_1 = require("../../enum/Ambiente");
const axios_1 = __importDefault(require("axios"));
class DpsCliente {
    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(ambiente, pathCertificado, senhaCertificado) {
        this.ambiente = ambiente;
        this.pathCertificado = pathCertificado;
        this.senhaCertificado = senhaCertificado;
        this.axiosConfig = (0, HttpConfig_1.getConfiguracoesHttpAxios)(this.pathCertificado, this.senhaCertificado);
        this.hostRequisicao = (0, Ambiente_1.getHostRequisicao)(this.ambiente, Ambiente_1.AreaAmbienteEnum.CONTRIBUINTE, Ambiente_1.ServicoEnum.DPS);
    }
    /**
     * Retorna a chave de acesso da NFS-e a partir do identificador do DPS.
     *
     * @param idDps Id da DPS (pode ser informado com ou sem o prefixo "DPS")
     */
    retornaDps(idDps) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get(`${this.hostRequisicao}/dps/${idDps}`, yield this.axiosConfig).catch((error) => {
                return error;
            });
        });
    }
    /**
     * Verifica se uma NFS-e foi emitida a partir do Id do DPS
     *
     * @param idDps Id da DPS (pode ser informado com ou sem o prefixo "DPS")
     */
    verificaEmissaoDps(idDps) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.head(`${this.hostRequisicao}/dps/${idDps}`, yield this.axiosConfig).catch((error) => {
                return error;
            });
        });
    }
}
exports.DpsCliente = DpsCliente;