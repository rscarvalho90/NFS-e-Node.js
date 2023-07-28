"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoEnum = exports.AmbienteGerador = exports.Ambiente = void 0;
/**
 * Lista de servidores por ambiente (Produção, Produção Restrita ou Homologação).
 */
class Ambiente {
    constructor(urlServidor, ambienteId) {
        this.urlServidor = urlServidor;
        this.ambienteId = ambienteId;
    }
    toString() {
        return this.urlServidor;
    }
}
exports.Ambiente = Ambiente;
Ambiente.PRODUCAO_RESTRITA = new Ambiente(".producaorestrita.nfse.gov.br", 2);
var AmbienteGerador;
(function (AmbienteGerador) {
    AmbienteGerador[AmbienteGerador["SISTEMA_PROPRIO"] = 1] = "SISTEMA_PROPRIO";
    AmbienteGerador[AmbienteGerador["SEFIN_NACIONAL"] = 2] = "SEFIN_NACIONAL";
})(AmbienteGerador || (exports.AmbienteGerador = AmbienteGerador = {}));
var ServicoEnum;
(function (ServicoEnum) {
    ServicoEnum["ADN"] = "adn";
    ServicoEnum["SEFIN"] = "sefin";
})(ServicoEnum || (exports.ServicoEnum = ServicoEnum = {}));
