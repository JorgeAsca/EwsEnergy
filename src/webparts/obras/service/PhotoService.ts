import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';

export class PhotoService {
    private _context: WebPartContext;
    private _baseUrl: string;

    constructor(context: WebPartContext) {
        this._context = context;
        this._baseUrl = context.pageContext.web.absoluteUrl;
    }

    /**
     * Sube una foto a la Biblioteca de Documentos 'Fotos_Diario'
     * @param file El archivo capturado por el móvil/PC
     * @param nombreObra Nombre de la obra para organizar por carpetas
     */
    public async subirFotoDiaria(file: File, nombreObra: string): Promise<string> {
        // Limpiamos el nombre del archivo para evitar errores
        const fileName = `${Date.now()}_${file.name}`;
        
        // Convertimos el archivo a un formato que SharePoint entienda (ArrayBuffer)
        const content = await file.arrayBuffer();

        // Endpoint para subir archivos a la biblioteca
        // Nota: Subiermos los archivos a la raíz hasta que se creen las carpetas 
        const endpoint = `${this._baseUrl}/_api/web/lists/getbytitle('Fotos_Diario')/RootFolder/Files/add(url='${fileName}',overwrite=true)`;

        const response = await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            body: content,
            headers: {
                "Accept": "application/json",
                "Content-type": "application/octet-stream"
            }
        });

        if (!response.ok) {
            throw new Error("Error al subir la imagen");
        }

        const data = await response.json();
        // Devolvemos la URL interna de la foto para que el Front pueda mostrarla
        return data.ServerRelativeUrl;
    }
}