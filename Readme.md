
## OpenSSL no Windows

Para correto funcionamento das requisições em ambiente Windows, fazer o Download, instalar e configurar o OpenSSL conforme instruções [desta página](https://medium.com/swlh/installing-openssl-on-windows-10-and-updating-path-80992e26f6a1).
Após isso, caso opte por instalar a versão 3 do OpenSSL, copiar o conteúdo do diretório "/bin" para o diretório "/lib" e renomeá-lo para "ossl-modules" ficará assim (C:/Program Files/OpenSSL/lib/ossl-modules).