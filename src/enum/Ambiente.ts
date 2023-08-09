/**
 * Lista de servidores por ambiente (Produção, Produção Restrita ou Homologação).
 */
export class Ambiente {
    static readonly PRODUCAO = new Ambiente(".nfse.gov.br", "Produção");
    static readonly PRODUCAO_RESTRITA = new Ambiente(".producaorestrita.nfse.gov.br", "Produção Restrita");
    static readonly HOMOLOGACAO = new Ambiente("hom.nfse.fazenda.gov.br", "Homologação");

    private constructor(public readonly urlServidor: string, public readonly nome: string) {
    }

    toString(): string {
        return this.urlServidor;
    }
}

export function getHostRequisicao(ambiente: Ambiente, area: AreaAmbienteEnum, servico: ServicoEnum): string {
    switch (ambiente) {
        case (Ambiente.PRODUCAO):
            switch (area) {
                case (AreaAmbienteEnum.CONTRIBUINTE):
                    switch (servico) {
                        case(ServicoEnum.DANFSE):
                        case(ServicoEnum.DPS):
                        case(ServicoEnum.EVENTOS):
                        case(ServicoEnum.NFSE):
                        case(ServicoEnum.PARAMETROS_MUNICIPAIS):
                            return "https://sefin" + ambiente + "/sefinnacional";
                        case(ServicoEnum.DFE):
                            return "https://adn" + ambiente + "/contribuinte";
                    }
                    break;
                case (AreaAmbienteEnum.FISCO):
                    switch (servico) {
                        case(ServicoEnum.SEFIN):
                        case(ServicoEnum.PARAMETROS_MUNICIPAIS):
                            return "https://sefin" + ambiente + "/sefinnacional";
                        case(ServicoEnum.ADN):
                            return "https://adn" + ambiente;
                    }
            }
            break;
        case (Ambiente.PRODUCAO_RESTRITA):
            switch (area) {
                case (AreaAmbienteEnum.CONTRIBUINTE):
                    switch (servico) {
                        case(ServicoEnum.DANFSE):
                        case(ServicoEnum.DPS):
                        case(ServicoEnum.EVENTOS):
                        case(ServicoEnum.NFSE):
                        case(ServicoEnum.PARAMETROS_MUNICIPAIS):
                            return "https://sefin" + ambiente + "/SefinNacional";
                        case(ServicoEnum.DFE):
                            return "https://adn" + ambiente + "/contribuinte";
                    }
                    break;
                case (AreaAmbienteEnum.FISCO):
                    switch (servico) {
                        case(ServicoEnum.SEFIN):
                        case(ServicoEnum.PARAMETROS_MUNICIPAIS):
                            return "https://sefin" + ambiente + "/sefinnacional";
                        case(ServicoEnum.ADN):
                            return "https://adn" + ambiente;
                    }
            }
            break;
        case (Ambiente.HOMOLOGACAO):
            switch (area) {
                case (AreaAmbienteEnum.CONTRIBUINTE):
                    switch (servico) {
                        case(ServicoEnum.DANFSE):
                        case(ServicoEnum.DPS):
                        case(ServicoEnum.EVENTOS):
                        case(ServicoEnum.NFSE):
                        case(ServicoEnum.PARAMETROS_MUNICIPAIS):
                            return "https://" + ambiente + "/API/SefinNacional";
                        case(ServicoEnum.DAN):
                        case(ServicoEnum.DNA):
                        case(ServicoEnum.NPP):
                            return "https://" + ambiente + "/nfse/man";
                        case(ServicoEnum.DFE):
                            return "https://hom-nfse.estaleiro.serpro.gov.br/adn/contribuinte";
                    }
                    break;
                case (AreaAmbienteEnum.FISCO):
                    switch (servico) {
                        case(ServicoEnum.SEFIN):
                        case(ServicoEnum.PARAMETROS_MUNICIPAIS):
                            return "https://" + ambiente + "/api/sefinnacional";
                        case(ServicoEnum.MAN):
                            return "https://" + ambiente + "/man";
                        case(ServicoEnum.ADN):
                            return "https://hom-nfse.estaleiro.serpro.gov.br/adn";
                    }
                    break;
            }
            break;
    }

    throw new Error("Não há host para o serviço "+servico.toUpperCase()+" na área do "+area.toUpperCase()+" no ambiente de "+ambiente.nome.toUpperCase()+".");
}

export enum ServicoEnum {
    ADN = "adn",
    DANFSE = "danfse",
    DFE = "dfe",
    DAN = "dan",
    DNA = "dna",
    DPS = "dps",
    EVENTOS = "eventos",
    MAN = "man",
    NFSE = "nfse",
    NPP = "npp",
    PARAMETROS_MUNICIPAIS = "parametros_municipais",
    SEFIN = "sefin"
}

export enum AreaAmbienteEnum {
    CONTRIBUINTE = "contribuinte",
    FISCO = "fisco"
}