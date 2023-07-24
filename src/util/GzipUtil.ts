import gzip from "node-gzip"

/**
 * Retorna uma string representativa do Buffer compactado (binária)
 * @param buffer O buffer dos dados a serem comprimidos
 */
export async function comprimeGzipDeBuffer(buffer: Buffer): Promise<string> {
    const gzipBuffer: Buffer = await gzip.gzip(buffer);

    return gzipBuffer.toString();
}

/**
 * Retorna uma string representativa do Buffer do arquivo descompactado (binária)
 * @param buffer O buffer dos dados a serem descomprimidos
 */
export async function descomprimeGzipDeBuffer(buffer: Buffer): Promise<string> {
    const gzipBuffer: Buffer = await gzip.ungzip(buffer);

    return gzipBuffer.toString();
}

export async function comprimeGzipDeBase64(base64String: string): Promise<string> {
    return await comprimeGzipDeBuffer(base64ParaBuffer(base64String));
}

export async function descomprimeGzipDeBase64(base64String: string): Promise<string> {
    return await descomprimeGzipDeBuffer(base64ParaBuffer(base64String));
}

function base64ParaBuffer(base64String: string): Buffer {
    return Buffer.from(base64String, 'base64');
}

function bufferParaBase64(buffer: Buffer): string {
    return buffer.toString('base64');
}