"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retornandoErro = exports.integracaoNaoTestada = void 0;
/**
 * Decorator para uso em clientes que não foram testados.
 *
 * @param ambientes Lista de ambientes em que não houve teste.
 * @param observacao Observação adicional.
 */
function integracaoNaoTestada(ambientes, observacao) {
    return (target, propertyKey, descriptor) => {
        let descriptorOriginal = descriptor.value;
        descriptor.value = function (...args) {
            this.get = function () {
                return this;
            };
            const ambienteExecucao = this.get().ambiente;
            if (ambientes.includes(ambienteExecucao)) {
                if (observacao != undefined)
                    observacao = " Motivo: " + observacao;
                else
                    observacao = "";
                const plural = gerasStringPlural(ambientes);
                console.log(`O método "${propertyKey}" da classe "${target.constructor.name}" não foi testado no${plural} ambiente${plural} de ${gerasStringListaNomesAmbientes(ambientes)}.${observacao}`);
            }
            return descriptorOriginal.apply(this, args); // Continua a execução do método comentado (método original)
        };
    };
}
exports.integracaoNaoTestada = integracaoNaoTestada;
/**
 * Decorator para uso em clientes que estão retornando erro(s).
 *
 * @param ambientes Lista de ambientes em que o mesmo erro é retornado.
 * @param observacao Observação adicional ao erro.
 */
function retornandoErro(ambientes, observacao) {
    return (target, propertyKey, descriptor) => {
        let descriptorOriginal = descriptor.value;
        descriptor.value = function (...args) {
            this.get = function () {
                return this;
            };
            const ambienteExecucao = this.get().ambiente;
            if (ambientes.includes(ambienteExecucao)) {
                if (observacao != undefined)
                    observacao = " Motivo: " + observacao;
                else
                    observacao = "";
                const plural = gerasStringPlural(ambientes);
                console.log(`O método "${propertyKey}" da classe "${target.constructor.name}" está retonando erro no${plural} ambiente${plural} de ${gerasStringListaNomesAmbientes(ambientes)}.${observacao}`);
            }
            return descriptorOriginal.apply(this, args); // Continua a execução do método comentado (método original)
        };
    };
}
exports.retornandoErro = retornandoErro;
function gerasStringListaNomesAmbientes(ambientes) {
    let str = "";
    for (let i = 0; i < ambientes.length; i++) {
        if (i != ambientes.length - 1 && i != ambientes.length - 2)
            str = str + ambientes[i].nome + ", ";
        if (i == ambientes.length - 2)
            str = str + ambientes[i].nome + " e ";
        if (i == ambientes.length - 1)
            str = str + ambientes[i].nome;
    }
    return str;
}
function gerasStringPlural(lista) {
    if (lista.length > 1)
        return "s";
    else
        return "";
}
