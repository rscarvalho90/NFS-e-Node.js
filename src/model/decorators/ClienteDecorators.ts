import {Ambiente} from "../../enum/Ambiente";
import {Cliente} from "../clientes/Cliente";

/**
 * Decorator para uso em serviços que não foram testados.
 *
 * @param ambientes Lista de ambientes em que não houve teste.
 * @param observacao Observação adicional.
 */
export function integracaoNaoTestada(ambientes: Ambiente[], observacao?: string) {
    return (target: Cliente, propertyKey: string, descriptor: PropertyDescriptor) => {

        let descriptorOriginal = descriptor.value;

        descriptor.value = function (...args: any[]) { // Reescreve o método comentado

            this.get = function (this: Cliente) { // Retorna a instância do objeto da classe do método
                return this;
            };

            const ambienteExecucao = this.get().ambiente;

            if (ambientes.includes(ambienteExecucao)) {
                if (observacao != undefined)
                    observacao = " Motivo: " + observacao;
                else
                    observacao = "";

                const plural: string = gerasStringPlural(ambientes);
                console.log(`O método "${propertyKey}" da classe "${target.constructor.name}" não foi testado no${plural} ambiente${plural} de ${gerasStringListaNomesAmbientes(ambientes)}.${observacao}`);
            }

            return descriptorOriginal.apply(this, args); // Continua a execução do método comentado (método original)
        }
    };
}

/**
 * Decorator para uso em serviços que estão retornando erro(s).
 *
 * @param ambientes Lista de ambientes em que o mesmo erro é retornado.
 * @param observacao Observação adicional ao erro.
 */
export function retornandoErro(ambientes: Ambiente[], observacao?: string) {

    return (target: Cliente, propertyKey: string, descriptor: PropertyDescriptor) => {
        let descriptorOriginal = descriptor.value;

        descriptor.value = function (...args: any[]) { // Reescreve o método comentado

            this.get = function (this: Cliente) { // Retorna a instância do objeto da classe do método
                return this;
            };

            const ambienteExecucao = this.get().ambiente;

            if (ambientes.includes(ambienteExecucao)) {
                if (observacao != undefined)
                    observacao = " Motivo: " + observacao;
                else
                    observacao = "";

                const plural: string = gerasStringPlural(ambientes);
                console.log(`O método "${propertyKey}" da classe "${target.constructor.name}" está retonando erro no${plural} ambiente${plural} de ${gerasStringListaNomesAmbientes(ambientes)}.${observacao}`);
            }

            return descriptorOriginal.apply(this, args); // Continua a execução do método comentado (método original)
        };
    }
}

/**
 * Decorator para uso em serviços não implementados.
 *
 * @param ambientes Lista de ambientes em que o serviço não foi implementado.
 */
export function naoImplementado(ambientes: Ambiente[]) {

    return (target: Cliente, propertyKey: string, descriptor: PropertyDescriptor) => {
        descriptor.value = function (...args: any[]) { // Reescreve o método comentado

            this.get = function (this: Cliente) { // Retorna a instância do objeto da classe do método
                return this;
            };

            const ambienteExecucao = this.get().ambiente;

            if (ambientes.includes(ambienteExecucao)) {
                const plural: string = gerasStringPlural(ambientes);
                console.log(`O método "${propertyKey}" da classe "${target.constructor.name}" não foi implementado no${plural} ambiente${plural} de ${gerasStringListaNomesAmbientes(ambientes)}.`);
            }
        };
    }
}

function gerasStringListaNomesAmbientes(ambientes: Ambiente[]): string {
    let str = ""

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

function gerasStringPlural(lista: any[]): string {
    if (lista.length > 1)
        return "s";
    else
        return "";
}