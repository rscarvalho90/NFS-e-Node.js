"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoEnum = exports.AmbienteEnum = void 0;
/**
 * Lista de servidores por ambiente.
 */
var AmbienteEnum;
(function (AmbienteEnum) {
    AmbienteEnum["PRODUCAO_RESTRITA"] = ".producaorestrita.nfse.gov.br";
})(AmbienteEnum || (exports.AmbienteEnum = AmbienteEnum = {}));
var ServicoEnum;
(function (ServicoEnum) {
    ServicoEnum["ADN"] = "adn";
    ServicoEnum["SEFIN"] = "sefin";
})(ServicoEnum || (exports.ServicoEnum = ServicoEnum = {}));
