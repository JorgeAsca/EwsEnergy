import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, ISPHttpClientOptions } from '@microsoft/sp-http';

export class PhotoService {
    private _context: WebPartContext;
    private _libName: string = "Fotos_Diario";
    private _metadataListName: string = "Registro_Fotos_Diarias";

    constructor(context: WebPartContext) {
        this._context = context;
    }

    public async subirFotoProyecto(file: File, nombreProyecto: string, metadatos: { operario: string, operarioId: number, comentarios?: string }): Promise<void> {
        const siteUrl = this._context.pageContext.web.absoluteUrl;
        const serverRelativeUrl = this._context.pageContext.web.serverRelativeUrl;

        // Limpiamos el nombre del proyecto de caracteres prohibidos en SharePoint
        const nombreCarpeta = nombreProyecto.replace(/[/\\?%*:|"<>]/g, '-');
        const folderUrl = `${serverRelativeUrl}/${this._libName}/${nombreCarpeta}`;

        // PASO 1: Asegurar carpeta (Verifica si existe, si no, la crea)
        await this._asegurarCarpeta(folderUrl);

        // PASO 2: Subir archivo
        const fileName = `${Date.now()}_${metadatos.operarioId}_${encodeURIComponent(file.name)}`;
        const endpointFile = `${siteUrl}/_api/web/getfolderbyserverrelativeurl('${folderUrl}')/files/add(url='${fileName}',overwrite=true)`;

        const uploadOptions: ISPHttpClientOptions = {
            body: file,
            headers: {
                "Accept": "application/json;odata=nometadata",
                "Content-type": file.type,
                "odata-version": "3.0"
            }
        };

        const uploadResponse = await this._context.spHttpClient.post(endpointFile, SPHttpClient.configurations.v1, uploadOptions);
        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error("Detalle técnico del servidor:", errorText);
            throw new Error("Error al subir archivo a la carpeta del proyecto.");
        }

        const fileData = await uploadResponse.json();
        const fotoUrlAbsoluta = `${window.location.origin}${fileData.ServerRelativeUrl}`;

        // PASO 3: Registrar metadatos
        await this._registrarMetadatos(fotoUrlAbsoluta, nombreProyecto, metadatos);
    }

    /**
     * Verifica si la carpeta existe. Si no existe, la crea.
     */
    private async _asegurarCarpeta(folderUrl: string): Promise<void> {
        const siteUrl = this._context.pageContext.web.absoluteUrl;

        // Primero intentamos verificar si la carpeta existe
        const checkEndpoint = `${siteUrl}/_api/web/getfolderbyserverrelativeurl('${folderUrl}')`;
        const checkResponse = await this._context.spHttpClient.get(checkEndpoint, SPHttpClient.configurations.v1);

        // Si el estado es 404 (Not Found), procedemos a crearla
        if (checkResponse.status === 404) {
            const createEndpoint = `${siteUrl}/_api/web/folders`;
            const createResponse = await this._context.spHttpClient.post(createEndpoint, SPHttpClient.configurations.v1, {
                body: JSON.stringify({ 'ServerRelativeUrl': folderUrl }),
                headers: {
                    'Accept': 'application/json;odata=nometadata',
                    'Content-type': 'application/json;odata=nometadata',
                    'odata-version': '3.0'
                }
            });

            if (!createResponse.ok) {
                throw new Error("No se pudo crear la carpeta del proyecto en la biblioteca.");
            }
        } else if (!checkResponse.ok) {
            // Si hay otro error que no sea 404, informamos
            throw new Error("Error al verificar la existencia de la carpeta.");
        }
    }

    public async getFotosHoyPorOperario(operarioId: number): Promise<any[]> {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const isoHoy = hoy.toISOString();

        // Filtramos por OperarioId y que la FechaRegistro sea hoy
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._metadataListName}')/items?$filter=OperarioId eq ${operarioId} and FechaRegistro ge '${isoHoy}'&$orderby=FechaRegistro desc`;

        const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        if (!response.ok) return [];

        const data = await response.json();
        return data.value || [];
    }

    private async _registrarMetadatos(url: string, proyecto: string, meta: any): Promise<void> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._metadataListName}')/items`;
        const body = {
            Title: proyecto,
            UrlFoto: { Description: `Registro - ${proyecto}`, Url: url },
            FechaRegistro: new Date().toISOString(),
            OperarioId: meta.operarioId,
            Comentarios: meta.comentarios || ""
        };

        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=nometadata',
                'odata-version': '3.0'
            }
        });
    }
}