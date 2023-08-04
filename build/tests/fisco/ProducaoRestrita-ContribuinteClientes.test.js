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
const NfseCliente_1 = require("../../src/model/contribuintes/NfseCliente");
const Ambiente_1 = require("../../src/enum/Ambiente");
const XmlUtil_1 = require("../../src/util/XmlUtil");
const fs_1 = __importDefault(require("fs"));
const GeraId_1 = require("../../src/util/GeraId");
const senhaCertificado = "123456";
const ambiente = Ambiente_1.Ambiente.HOMOLOGACAO;
const pathCertificado = "res/certificados_homologacao/Certificados de Contribuintes/Certificado_Nao_Mei_Nao_Simples/46869_OWMKX_OIWNHUKX_U_W_.p12";
const pathXml = "tests/exemplos/RN0-DPS-_Correto.xml";
describe("Produção Restrita - Contribuinte", () => {
    describe("Sefin NFS-e", () => {
        let nfseCliente = new NfseCliente_1.NfseCliente(ambiente, pathCertificado, senhaCertificado);
        test("Transmite DPS", () => __awaiter(void 0, void 0, void 0, function* () {
            let conteudoXml = fs_1.default.readFileSync(pathXml, "utf8");
            const numDps = (0, GeraId_1.geraIdDps)(conteudoXml);
            conteudoXml = conteudoXml.replace(/(<tribNac)( )?(\/>)/g, "");
            conteudoXml = (0, XmlUtil_1.modificaValorTagXml)(conteudoXml, "DPS.infDPS['0']['$'].Id", numDps);
            //let conteudoDps = extraiDpsDaNfse(conteudoXml)[0];
            const axiosResponse = yield nfseCliente.enviaDps(conteudoXml);
            const a = 1;
        }));
    });
});
