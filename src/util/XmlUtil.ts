import xml2js from "xml2js";
import jsonpath from "jsonpath";

/**
 * Extrai, de uma NFS-e (Nota Fiscal de Serviço Eletrônica), as DPSs (Declarações de Prestação de Serviços)
 *
 * @param conteudoXmlNfse Conteúdo do XML da NFS-e
 */
export function extraiDpsDaNfse(conteudoXmlNfse: string): string[] {
    let conteudoDps: string[] = [];

    xml2js.parseString(conteudoXmlNfse, (erro, resultado) => {
        if(erro) {
            throw erro;
        }

        for(let i=0; i<resultado.NFSe.infNFSe.length; i++) {
            for(let j=0; j<resultado.NFSe.infNFSe[i].DPS.length; j++) {
                conteudoDps.push(new xml2js.Builder({rootName: "DPS"}).buildObject(resultado.NFSe.infNFSe[i].DPS[j]));
            }
        }
    });

    return conteudoDps;
}

/**
 * Modifica um valor de uma tag XML, retornando o novo XML modificado
 *
 * @param conteudoXml Conteúdo do XML, no formato de string
 * @param jsonPath JSON path relativo à tag a ser modificada
 * @param novoValor Novo valor da tag
 */
export function modificaValorTagXml(conteudoXml: string, jsonPath: string, novoValor:string): string {
    let novoConteudoXml: string = conteudoXml;

    xml2js.parseString(conteudoXml, (erro, resultado) => {
        if(erro) {
            throw erro;
        }

        jsonpath.apply(resultado, jsonPath, (valor) => {
            return novoValor;
        })

        novoConteudoXml = new xml2js.Builder().buildObject(resultado);
    });

    return novoConteudoXml;
}