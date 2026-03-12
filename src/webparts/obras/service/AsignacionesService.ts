import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';

export interface IAsignacion {
    Id?: number;
    ObraId: number;
    PersonalId: number;
    FechaInicio: string;
    FechaFinPrevista: string;
}

export class AsignacionesService {
    private _context: WebPartContext;
    private _listName = "Asignaciones EWS";

    constructor(context: WebPartContext) {
        this._context = context;
    }

    public async getAsignaciones(): Promise<IAsignacion[]> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
        const response = await this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
        const data = await response.json();
        return data.value;
    }

    public async asignarPersonal(asignacion: IAsignacion): Promise<void> {
        const endpoint = `${this._context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this._listName}')/items`;
        await this._context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, {
            headers: {
                'Accept': 'application/json;odata=nometadata',
                'Content-type': 'application/json;odata=nometadata',
                'odata-version': ''
            },
            body: JSON.stringify(asignacion)
        });
    }
}