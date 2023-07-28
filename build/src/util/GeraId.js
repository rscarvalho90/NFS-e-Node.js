"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculaDvChaveNfse = exports.geraIdDps = exports.geraIdNfse = void 0;
const xml2js_1 = __importDefault(require("xml2js"));
const date_and_time_1 = __importDefault(require("date-and-time"));
/**
 * Gera um id (idNFSe) no formato "NFS" + Cód.Mun. (7) + Amb.Ger. (1) + Tipo de Inscrição Federal (1) + Inscrição Federal (14 - CPF completar com 000 à esquerda) + nNFSe (13) + AnoMes Emis. (4) + Cód.Num. (9) + DV (1)
 *
 * @param xmlString Arquivo XMl no formato string
 */
function geraIdNfse(xmlString) {
    let idNfse = "NFS00000000000000000000000000000000000000000000000000";
    xml2js_1.default.parseString(xmlString, (erro, resultado) => {
        const ambienteGerador = resultado.NFSe.infNFSe[0].ambGer;
        const dataProcessamento = new Date(resultado.NFSe.infNFSe[0].dhProc);
        const anoMes = date_and_time_1.default.format(dataProcessamento, "YYMM");
        let inscr = resultado.NFSe.infNFSe[0].emit[0].CNPJ[0];
        let tpInscr = 2;
        if (inscr === undefined) {
            inscr = String(resultado.NFSe.infNFSe[0].emit[0].CPF[0]).padStart(14, "0");
            tpInscr = 1;
        }
        const codNum = String(Math.floor(Math.random() * 1000000000)).padStart(9, "0");
        const chaveNfseParcial = resultado.NFSe.infNFSe[0].cLocIncid + ambienteGerador + tpInscr + inscr + String(resultado.NFSe.infNFSe[0].nDFSe).padStart(13, "0") + anoMes + codNum;
        const dv = calculaDvChaveNfse(chaveNfseParcial);
        if (typeof dv === "number") {
            idNfse = "NFS" + chaveNfseParcial + dv;
        }
    });
    return idNfse;
}
exports.geraIdNfse = geraIdNfse;
/**
 * Gera um id (idDPS) no formato "DPS" + Cód.Mun.Emi. + Tipo de Inscrição Federal + Inscrição Federal + Série DPS + Núm. DPS
 *
 * @param xmlString Arquivo XMl no formato string
 */
function geraIdDps(xmlString) {
    return "0";
}
exports.geraIdDps = geraIdDps;
function calculaDvChaveNfse(chaveNfse) {
    let indice = chaveNfse.length - 1, multiplicador = 2, soma = 0, resto = 0, digito = 0;
    if (chaveNfse && chaveNfse.length == 49 && parseInt(chaveNfse)) {
        for (; indice >= 0; indice--) {
            let char = chaveNfse.charAt(indice);
            soma += parseInt(char) * multiplicador;
            multiplicador++;
            if (multiplicador > 9)
                multiplicador = 2;
        }
        resto = soma % 11;
        digito = 11 - resto;
        if (digito >= 10)
            digito = 0;
        return digito;
    }
    else {
        return false;
    }
}
exports.calculaDvChaveNfse = calculaDvChaveNfse;
