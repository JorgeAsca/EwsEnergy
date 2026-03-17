import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, ISPHttpClientOptions } from '@microsoft/sp-http';

export class PhotoService {
    private _context: WebPartContext;
    private _libName: string = "Fotos_Diario"; // Biblioteca de archivos
    private _metadataListName: string = "Registro_Fotos_Diarias"; // Lista de metadatos

    constructor(context: WebPartContext) {
        this._context = context;
    }

    public async subirFotoProyecto(file: File, nombreProyecto: string, metadatos: { operario: string, operarioId: number, comentarios?: string }): Promise<void> {
        const siteUrl = this._context.pageContext.web.absoluteUrl;
        const serverRelativeUrl = this._context.pageContext.web.serverRelativeUrl;
        const nombreCarpeta = nombreProyecto.replace(/[/\\?%*:|"<>]/g, '-');
        const folderUrl = `${serverRelativeUrl}/${this._libName}/${nombreCarpeta}`;

        // Paso 1: Asegurar carpeta del proyecto
        await this._asegurarCarpeta(folderUrl);

        // Paso 2: Subir binario con nombre único (Fecha + Operario + NombreOriginal)
        const fileName = `${Date.now()}_${metadatos.operarioId}_${encodeURIComponent(file.name)}`;
        const endpointFile = `${siteUrl}/_api/web/getfolderbyserverrelativeurl('${folderUrl}')/files/add(url='${fileName}',overwrite=true)`;

        const uploadOptions: ISPHttpClientOptions = {
            body: file,
            headers: { "Accept": "application/json;odata=nometadata", "Content-type": file.type }
        };

        const uploadResponse = await this._context.spHttpClient.post(endpointFile, SPHttpClient.configurations.v1, uploadOptions);
        if (!uploadResponse.ok) throw new Error("Error al subir archivo");

        const fileData = await uploadResponse.json();
        const fotoUrlAbsoluta = `${window.location.origin}${fileData.ServerRelativeUrl}`;

        // Paso 3: Registrar metadatos vinculados
        await this._registrarMetadatos(fotoUrlAbsoluta, nombreProyecto, metadatos);
    }

    private async _asegurarCarpeta(folderUrl: string): Promise<void> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/folders`;
        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            body: JSON.stringify({ 'ServerRelativeUrl': folderUrl }),
            headers: { 'Accept': 'application/json;odata=nometadata', 'Content-type': 'application/json;odata=nometadata', 'odata-version': '3.0' }
        });
    }

    private async _registrarMetadatos(url: string, proyecto: string, meta: any): Promise<void> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._metadataListName}')/items`;
        const body = {
            Title: proyecto,
            UrlFoto: { Description: `Registro - ${proyecto}`, Url: url },
            FechaRegistro: new Date().toISOString(),
            OperarioId: meta.operarioId, // Guardamos el ID para filtros futuros
            Comentarios: meta.comentarios || ""
        };

        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            body: JSON.stringify(body),
            headers: { 'Accept': 'application/json;odata=nometadata', 'Content-type': 'application/json;odata=nometadata', 'odata-version': '3.0' }
        });
    }
}