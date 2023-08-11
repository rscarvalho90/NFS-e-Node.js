import {testeFiscoHom} from "./fisco/Homologacao - FiscoClientes.test";
import {testeFiscoProdRestr} from "./fisco/ProducaoRestrita - FiscoClientes.test";
import {testeContribuinteHom} from "./contribuinte/Homologação - ContribuinteClientes.test";

describe("Testes Importantes", () => {
    describe("Teste Contribuinte Homologação", testeContribuinteHom);
    describe("Teste Fisco Produção Restrita", testeFiscoProdRestr);
});

describe("Testes Homologação", () => {
    describe("Teste Contribuinte Homologação", testeContribuinteHom);
    describe("Teste Fisco Homologação", testeFiscoHom);
});