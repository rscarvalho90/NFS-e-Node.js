"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Homologacao___FiscoClientes_test_1 = require("./fisco/Homologacao - FiscoClientes.test");
const ProducaoRestrita___FiscoClientes_test_1 = require("./fisco/ProducaoRestrita - FiscoClientes.test");
const Homologa__o___ContribuinteClientes_test_1 = require("./contribuinte/Homologa\u00E7\u00E3o - ContribuinteClientes.test");
describe("Testes Importantes", () => {
    describe("Teste Contribuinte Homologação", Homologa__o___ContribuinteClientes_test_1.testeContribuinteHom);
    describe("Teste Fisco Produção Restrita", ProducaoRestrita___FiscoClientes_test_1.testeFiscoProdRestr);
});
describe("Testes Homologação", () => {
    describe("Teste Contribuinte Homologação", Homologa__o___ContribuinteClientes_test_1.testeContribuinteHom);
    describe("Teste Fisco Homologação", Homologacao___FiscoClientes_test_1.testeFiscoHom);
});
