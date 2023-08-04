"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculaDvChave = exports.geraIdDps = exports.geraIdNfse = void 0;
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
        const dataEmissao = new Date(resultado.NFSe.infNFSe[0].DPS[0].infDPS[0].dhEmi[0]);
        const anoMes = date_and_time_1.default.format(dataEmissao, "YYMM");
        let inscr = resultado.NFSe.infNFSe[0].emit[0].CNPJ[0];
        let tpInscr = 2;
        if (inscr === undefined) {
            inscr = String(resultado.NFSe.infNFSe[0].emit[0].CPF[0]).padStart(14, "0");
            tpInscr = 1;
        }
        const codNum = String(Math.floor(Math.random() * 1000000000)).padStart(9, "0");
        const chaveNfseParcial = resultado.NFSe.infNFSe[0].cLocIncid + ambienteGerador + tpInscr + inscr + String(resultado.NFSe.infNFSe[0].nNFSe).padStart(13, "0") + anoMes + codNum;
        const dv = calculaDvChave(chaveNfseParcial, 50);
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
    let idDps = "DPS000000000000000000000000000000000000000000";
    xml2js_1.default.parseString(xmlString, (erro, resultado) => {
        let inscr, tpInscr, numDPS, chaveDpsParcial;
        let raiz;
        // Se for apresentado um XML de NFS-e
        try {
            raiz = resultado.NFSe.infNFSe[0].DPS[0];
        }
        catch (e) { // Se for apresentado um XML de DPS
            raiz = resultado.DPS;
        }
        inscr = raiz.infDPS[0].prest[0].CNPJ[0];
        tpInscr = 2;
        if (inscr === undefined) {
            inscr = String(inscr = raiz.infDPS[0].prest[0].CPF[0]).padStart(14, "0");
            tpInscr = 1;
        }
        numDPS = String(raiz.infDPS[0].nDPS[0]).padStart(15, "0");
        chaveDpsParcial = raiz.infDPS[0].cLocEmi + tpInscr + inscr + raiz.infDPS[0].serie[0] + numDPS;
        idDps = "DPS" + chaveDpsParcial;
    });
    return idDps;
}
exports.geraIdDps = geraIdDps;
/**
 * Calcula o dígito verificador da chave de NF-e, NFS-e, DPS etc.
 *
 * @param chave String com {@link nDigitos} dígitos contendo os demais valores (exceto o DV, por óbvio) da chave da NFS-e.
 * @param nDigitos Número total de dígitos da chave
 */
function calculaDvChave(chave, nDigitos) {
    if (nDigitos == undefined) {
        nDigitos = chave.length + 1;
    }
    let indice = chave.length - 1, multiplicador = 2, soma = 0, resto = 0, digito = 0;
    if (chave && chave.length == nDigitos - 1 && parseInt(chave)) {
        for (; indice >= 0; indice--) {
            let char = chave.charAt(indice);
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
exports.calculaDvChave = calculaDvChave;
