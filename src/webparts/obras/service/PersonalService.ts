import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/fields";
import { IPersonal } from "../models/IPersonal";

export class PersonalService {
    private _sp: SPFI;
    private _listName: string = "Personal EWS";

    constructor(sp: SPFI) { 
        this._sp = sp; 
    }

    public async getPersonal(): Promise<IPersonal[]> {
        try {
            const items = await this._sp.web.lists.getByTitle(this._listName).items.select("Id", "Title", "Rol", "FotoPerfil", "Email")();

            return items.map((item: any) => ({
                Id: item.Id,
                NombreyApellido: item.Title,
                Rol: item.Rol,
                FotoPerfil: item.FotoPerfil ? item.FotoPerfil.Url : undefined,
                Email: item.Email
            }));
        } catch (error) {
            console.error("Error en getPersonal:", error);
            return [];
        }
    }

    /**
     * Obtiene los archivos de la biblioteca 'Fotos_Personal' para elegirlos en el formulario
     */
    public async getFotosDisponibles(): Promise<{ key: string, text: string, url: string }[]> {
        try {
            const files = await this._sp.web.getFolderByServerRelativePath("Fotos_Personal").files();

            return files.map((file: any) => ({
                key: `${window.location.origin}${file.ServerRelativeUrl}`,
                text: file.Name,
                url: `${window.location.origin}${file.ServerRelativeUrl}`
            }));
        } catch (error) {
            console.error("Error obteniendo fotos de la biblioteca:", error);
            return [];
        }
    }

    public async crearTrabajador(nuevo: { NombreyApellido: string, Rol: string, FotoPerfil?: string }): Promise<void> {
        try {
            const body: any = {
                Title: nuevo.NombreyApellido,
                Rol: nuevo.Rol,
            };

            if (nuevo.FotoPerfil) {
                body.FotoPerfil = {
                    Description: nuevo.NombreyApellido,
                    Url: nuevo.FotoPerfil
                };
            }

            await this._sp.web.lists.getByTitle(this._listName).items.add(body);
        } catch (error) {
            console.error("Detalle del error al crear ítem:", error);
            throw new Error("No se pudo crear el registro del personal.");
        }
    }

    public async getRolOptions(): Promise<string[]> {
        try {
            const field: any = await this._sp.web.lists.getByTitle(this._listName).fields.getByInternalNameOrTitle("Rol")();
            return field.Choices || [];
        } catch (error) {
            console.error("Error obteniendo roles:", error);
            return [];
        }
    }

    public async actualizarTrabajador(id: number, datos: any): Promise<void> {
        try {
            const body: any = {
                Title: datos.NombreyApellido,
                Rol: datos.Rol,
            };

            if (datos.FotoPerfil) {
                body.FotoPerfil = {
                    Description: datos.NombreyApellido,
                    Url: datos.FotoPerfil
                };
            }

            await this._sp.web.lists.getByTitle(this._listName).items.getById(id).update(body);
        } catch (error) {
            console.error("Error detallado al actualizar:", error);
            throw new Error("No se pudo actualizar el registro del trabajador.");
        }
    }

    public async eliminarTrabajador(id: number): Promise<void> {
        try {
            await this._sp.web.lists.getByTitle(this._listName).items.getById(id).delete();
        } catch (error) {
            console.error("Error al eliminar de SharePoint:", error);
            throw new Error("No se pudo eliminar el registro.");
        }
    }
}