"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaAmbienteEnum = exports.ServicoEnum = exports.getHostRequisicao = exports.Ambiente = void 0;
/**
 * Lista de servidores por ambiente (Produção, Produção Restrita ou Homologação).
 */
class Ambiente {
    constructor(urlServidor, nome) {
        this.urlServidor = urlServidor;
        this.nome = nome;
    }
    toString() {
        return this.urlServidor;
    }
}
exports.Ambiente = Ambiente;
Ambiente.PRODUCAO = new Ambiente(".nfse.gov.br", "Produção");
Ambiente.PRODUCAO_RESTRITA = new Ambiente(".producaorestrita.nfse.gov.br", "Produção Restrita");
Ambiente.HOMOLOGACAO = new Ambiente("hom.nfse.fazenda.gov.br", "Homologação");
function getHostRequisicao(ambiente, area, servico) {
    switch (ambiente) {
        case (Ambiente.PRODUCAO):
            switch (area) {
                case (AreaAmbienteEnum.CONTRIBUINTE):
                    switch (servico) {
                        case (ServicoEnum.DANFSE):
                        case (ServicoEnum.DPS):
                        case (ServicoEnum.EVENTOS):
                        case (ServicoEnum.NFSE):
                        case (ServicoEnum.PARAMETROS_MUNICIPAIS):
                            return "https://sefin" + ambiente + "/sefinnacional";
                        case (ServicoEnum.DFE):
                            return "https://adn" + ambiente + "/contribuinte";
                    }
                    break;
                case (AreaAmbienteEnum.FISCO):
                    switch (servico) {
                        case (ServicoEnum.SEFIN):
                        case (ServicoEnum.PARAMETROS_MUNICIPAIS):
                            return "https://sefin" + ambiente + "/sefinnacional";
                        case (ServicoEnum.ADN):
                            return "https://adn" + ambiente;
                    }
            }
            break;
        case (Ambiente.PRODUCAO_RESTRITA):
            switch (area) {
                case (AreaAmbienteEnum.CONTRIBUINTE):
                    switch (servico) {
                        case (ServicoEnum.DANFSE):
                        case (ServicoEnum.DPS):
                        case (ServicoEnum.EVENTOS):
                        case (ServicoEnum.NFSE):
                        case (ServicoEnum.PARAMETROS_MUNICIPAIS):
                            return "https://sefin" + ambiente + "/SefinNacional";
                        case (ServicoEnum.DFE):
                            return "https://adn" + ambiente + "/contribuintes";
                    }
                    break;
                case (AreaAmbienteEnum.FISCO):
                    switch (servico) {
                        case (ServicoEnum.SEFIN):
                        case (ServicoEnum.PARAMETROS_MUNICIPAIS):
                            return "https://sefin" + ambiente + "/sefinnacional";
                        case (ServicoEnum.ADN):
                            return "https://adn" + ambiente;
                    }
            }
            break;
        case (Ambiente.HOMOLOGACAO):
            switch (area) {
                case (AreaAmbienteEnum.CONTRIBUINTE):
                    switch (servico) {
                        case (ServicoEnum.DANFSE):
                        case (ServicoEnum.DPS):
                        case (ServicoEnum.EVENTOS):
                        case (ServicoEnum.NFSE):
                        case (ServicoEnum.PARAMETROS_MUNICIPAIS):
                            return "https://" + ambiente + "/API/SefinNacional";
                        case (ServicoEnum.DAN):
                        case (ServicoEnum.DNA):
                        case (ServicoEnum.NPP):
                            return "https://" + ambiente + "/nfse/man";
                        case (ServicoEnum.DFE):
                            return "https://hom-nfse.estaleiro.serpro.gov.br/adn/contribuinte";
                    }
                    break;
                case (AreaAmbienteEnum.FISCO):
                    switch (servico) {
                        case (ServicoEnum.SEFIN):
                        case (ServicoEnum.PARAMETROS_MUNICIPAIS):
                            return "https://" + ambiente + "/api/sefinnacional";
                        case (ServicoEnum.MAN):
                            return "https://" + ambiente + "/man";
                        case (ServicoEnum.ADN):
                            return "https://hom-nfse.estaleiro.serpro.gov.br/adn";
                    }
                    break;
            }
            break;
    }
    throw new Error("Não há host para o serviço " + servico.toUpperCase() + " na área do " + area.toUpperCase() + " no ambiente de " + ambiente.nome.toUpperCase() + ".");
}
exports.getHostRequisicao = getHostRequisicao;
var ServicoEnum;
(function (ServicoEnum) {
    ServicoEnum["ADN"] = "adn";
    ServicoEnum["DANFSE"] = "danfse";
    ServicoEnum["DFE"] = "dfe";
    ServicoEnum["DAN"] = "dan";
    ServicoEnum["DNA"] = "dna";
    ServicoEnum["DPS"] = "dps";
    ServicoEnum["EVENTOS"] = "eventos";
    ServicoEnum["MAN"] = "man";
    ServicoEnum["NFSE"] = "nfse";
    ServicoEnum["NPP"] = "npp";
    ServicoEnum["PARAMETROS_MUNICIPAIS"] = "parametros_municipais";
    ServicoEnum["SEFIN"] = "sefin";
})(ServicoEnum || (exports.ServicoEnum = ServicoEnum = {}));
var AreaAmbienteEnum;
(function (AreaAmbienteEnum) {
    AreaAmbienteEnum["CONTRIBUINTE"] = "contribuinte";
    AreaAmbienteEnum["FISCO"] = "fisco";
})(AreaAmbienteEnum || (exports.AreaAmbienteEnum = AreaAmbienteEnum = {}));
