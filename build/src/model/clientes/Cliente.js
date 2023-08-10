"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cliente = void 0;
const HttpConfig_1 = require("../../util/HttpConfig");
class Cliente {
    /**
     * @param ambiente Ambiente em que o serviço será executado.
     * @param pathCertificado Local, na estação de execução do serviço, em que encontra-se o certificado para assinatura do XML.
     * @param senhaCertificado Senha do arquivo do certificado.
     */
    constructor(ambiente, pathCertificado, senhaCertificado) {
        this.ambiente = ambiente;
        this.pathCertificado = pathCertificado;
        this.senhaCertificado = senhaCertificado;
        this.axiosConfig = (0, HttpConfig_1.getConfiguracoesHttpAxios)(this.pathCertificado, this.senhaCertificado);
    }
}
exports.Cliente = Cliente;
