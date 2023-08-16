# NFS-e (Nota Fiscal de Serviço eletrônica)

Este é um repositório de exemplo, em Node.js (utilizando o TypeScript como fonte), de integração da Nota Fiscal de Serviço eletrônica com os serviços disponibilizados pela respectiva API.

## Dependências

As dependências para este projeto encontram-se no arquivo [package.json](package.json). </br>
O projeto foi criado utilizando a versão 18.7.0 do Node.js e a versão 5.1.3 do TypeScript.

## Uso

As classes que representam os [clientes](src/model/clientes) retornam a resposta HTTP às requisições (no formato do Axios - AxiosResponse ou AxiosError).
O tratamento das respostas deve ser realizado na implementação dos clientes pelos usuários.
Os exemplos de respostas podem ser encontrados no Swagger da API [para Contribuintes](https://www.nfse.gov.br/swagger/contribuintesissqn/) ou [para Fiscos Municipais/Distrital](https://www.nfse.gov.br/swagger/fisco/).</br></br>
Exemplos de uso encontram-se no repositório de [Testes](tests).

## Ambiente para testes

Importante que os usuários realizem seus testes no Ambiente de **Produção Restrita**, configurando-o no momento de instanciar a classe cliente. Os certificados específicos para este e demais ambientes não são e nem serão disponibilizados neste repositório de código.

## Erros em clientes específicos

Os testes dos [clientes](src/model/clientes) deste repositório foram realizados em 
**Homologação** para os Contribuintes e em **Produção Restrita** para os Fiscos. 
Sendo assim, presumir-se-á que métodos que funcionaram para os Fiscos funcionem também no 
ambiente de Produção. Já para os Contribuintes, presume-se que os métodos que funcionaram no 
ambiente de Homologação também funcionem em Produção Restrita e Produção. Com relação aos 
métodos que não produziram o resultado esperado no ambiente (principalmente para o caso dos 
Contribuintes no ambiente de Homologação), não significa que este comportamento se repetirá nos
ambiente de Produção Restrita e Produção. Métodos com comportamentos inesperados foram anotados com
os *decorators* `integracaoNaoTestada` e `retornandoErro` do arquivo [ClienteDecorators.ts](src/model/decorators/ClienteDecorators.ts)

## Arquivos no formato JavaScript (.js)

Os arquivos TypeScript compilados para o formato JavaScript encontram-se dentro do diretório [build](build).

## OpenSSL no Windows

Para correto funcionamento das requisições em ambiente Windows, fazer o Download, instalar e configurar o OpenSSL conforme instruções [desta página](https://medium.com/swlh/installing-openssl-on-windows-10-and-updating-path-80992e26f6a1).
Após isso, caso opte por instalar a versão 3 do OpenSSL, copiar o conteúdo do diretório "/bin" para o diretório "/lib" e renomeá-lo para "ossl-modules" ficará assim (C:/Program Files/OpenSSL/lib/ossl-modules).