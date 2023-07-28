/**
 * Lista de servidores por ambiente (Produção, Produção Restrita ou Homologação).
 */
export class Ambiente {
    static readonly PRODUCAO_RESTRITA = new Ambiente(".producaorestrita.nfse.gov.br", 2);

    private constructor(public readonly urlServidor: string, public readonly ambienteId: number) {
    }

    toString(): string {
        return this.urlServidor;
    }
}

export enum AmbienteGerador {
    SISTEMA_PROPRIO = 1,
    SEFIN_NACIONAL = 2
}

export enum ServicoEnum {
    ADN = "adn",
    SEFIN = "sefin"
}