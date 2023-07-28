"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modificaValorTagXml = exports.extraiDpsDaNfse = void 0;
const xml2js_1 = __importDefault(require("xml2js"));
const jsonpath_1 = __importDefault(require("jsonpath"));
/**
 * Extrai, de uma NFS-e (Nota Fiscal de Serviço Eletrônica), a DPS (Declaração de Prestação de Serviços)
 *
 * @param conteudoXmlNfse Conteúdo do XML da NFS-e
 */
function extraiDpsDaNfse(conteudoXmlNfse) {
    let conteudoDps = [];
    xml2js_1.default.parseString(conteudoXmlNfse, (erro, resultado) => {
        if (erro) {
            throw erro;
        }
        for (let i = 0; i < resultado.NFSe.infNFSe.length; i++) {
            for (let j = 0; j < resultado.NFSe.infNFSe[i].DPS.length; j++) {
                conteudoDps.push(new xml2js_1.default.Builder({ rootName: "DPS" }).buildObject(resultado.NFSe.infNFSe[i].DPS[j]));
            }
        }
    });
    return conteudoDps;
}
exports.extraiDpsDaNfse = extraiDpsDaNfse;
/**
 * Modifica um valor de uma tag XML, retornando o novo XML modificado
 *
 * @param conteudoXml Conteúdo do XML, no formato de string
 * @param jsonPath JSON path relativo à tag a ser modificada
 * @param novoValor Novo valor da tag
 */
function modificaValorTagXml(conteudoXml, jsonPath, novoValor) {
    let novoConteudoXml = conteudoXml;
    xml2js_1.default.parseString(conteudoXml, (erro, resultado) => {
        if (erro) {
            throw erro;
        }
        jsonpath_1.default.apply(resultado, jsonPath, (valor) => {
            return novoValor;
        });
        novoConteudoXml = new xml2js_1.default.Builder().buildObject(resultado);
    });
    return novoConteudoXml;
}
exports.modificaValorTagXml = modificaValorTagXml;
