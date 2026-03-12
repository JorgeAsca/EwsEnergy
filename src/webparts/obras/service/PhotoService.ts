import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';

export class PhotoService {
    private _context: WebPartContext;

    constructor(context: WebPartContext) {
        this._context = context;
    }

    // Método para subir la imagen a una biblioteca (ej: "FotosPersonal")
    public async subirFoto(fileName: string, blob: Blob): Promise<string> {
        const serverRelativeUrl = this._context.pageContext.web.serverRelativeUrl;
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/getfolderbyserverrelativeurl('${serverRelativeUrl}/Fotos_Diario')/files/add(url='${fileName}',overwrite=true)`;

        const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            body: blob
        });

        const data = await response.json();
        return data.ServerRelativeUrl; // Devolvemos la URL para guardarla en la lista
    }
}