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
Object.defineProperty(exports, "__esModule", { value: true });
const AdnCliente_1 = require("../../src/model/fisco/AdnCliente");
const AmbienteEnum_1 = require("../../src/enum/AmbienteEnum");
const TipoNsuEnum_1 = require("../../src/enum/TipoNsuEnum");
const SefinNacionalCliente_1 = require("../../src/model/fisco/SefinNacionalCliente");
const NfseCliente_1 = require("../../src/model/contribuintes/NfseCliente");
const senha_certificado = "senha1";
const ambiente = AmbienteEnum_1.AmbienteEnum.PRODUCAO_RESTRITA;
const pathCertificado = "res/certificados_producao_restrita/461523_MUNICIPIO_DE_PACARAIMA.p12";
describe("Testes", () => {
    let chaveAcesso;
    const adnCliente = new AdnCliente_1.AdnCliente(ambiente, pathCertificado, senha_certificado);
    const sefinCliente = new SefinNacionalCliente_1.SefinNacionalCliente(ambiente, pathCertificado, senha_certificado);
    const nfseCliente = new NfseCliente_1.NfseCliente(ambiente, pathCertificado, senha_certificado);
    test("Teste Retorna DFEs", () => __awaiter(void 0, void 0, void 0, function* () {
        const axiosResponse = yield adnCliente.retornaDocumentosFiscais(1, TipoNsuEnum_1.TipoNsuEnum.DISTRIBUICAO, true);
        chaveAcesso = axiosResponse.data.LoteDFe[0].ChaveAcesso;
        expect(axiosResponse.data.LoteDFe[0].DataHoraGeracao).toBe("2023-04-18T18:54:11.307");
    }));
    test("Teste Retorna Eventos", () => __awaiter(void 0, void 0, void 0, function* () {
        const axiosResponse = yield adnCliente.retornaEventos(chaveAcesso);
        expect(axiosResponse.data.LoteDFe[0].DataHoraRecebimento).toBe("2022-09-28T16:43:19.973");
    }));
    test("Teste Retorna NFS-e", () => __awaiter(void 0, void 0, void 0, function* () {
        const axiosResponse = yield nfseCliente.retornaNfse(chaveAcesso);
        expect(axiosResponse.data.LoteDFe[0].DataHoraRecebimento).toBe("2022-09-28T16:43:19.973");
    }));
});
