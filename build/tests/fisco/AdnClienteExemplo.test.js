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
const senha_certificado = "senha1";
const ambiente = AmbienteEnum_1.AmbienteEnum.PRODUCAO_RESTRITA;
const pathCertificado = "res/certificados_producao_restrita/461523_MUNICIPIO_DE_PACARAIMA.p12";
describe("Testes", () => {
    test("Teste Retorna DFEs", () => __awaiter(void 0, void 0, void 0, function* () {
        const adnCliente = new AdnCliente_1.AdnCliente(ambiente, pathCertificado, senha_certificado);
        const axiosResponse = yield adnCliente.retornaDocumentosFiscais(1, TipoNsuEnum_1.TipoNsuEnum.DISTRIBUICAO, true);
    }));
});
