import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IAsignacion } from "../models/IAsignacion";
import { ProjectService } from "./ProjectService";
import { PersonalService } from "./PersonalService";
import { IPersonal } from "../models/IPersonal";

export class AsignacionesService {
  private _sp: SPFI;
  private _listName = "Asignaciones EWS";

  constructor(sp: SPFI) {
    this._sp = sp;
  }

  // Método para cargar los datos de una sola vez
  public async getDatosPanel() {
    const projectService = new ProjectService(this._sp);
    const personalService = new PersonalService(this._sp);

    const [obras, personal, asignaciones] = await Promise.all([
      projectService.getObras(),
      personalService.getPersonal(),
      this.getAsignaciones(),
    ]);

    return { obras, personal, asignaciones };
  }

  public async getAsignaciones(): Promise<IAsignacion[]> {
    try {
      const items = await this._sp.web.lists.getByTitle(this._listName).items();
      return items as IAsignacion[];
    } catch (error) {
      console.error("Error al obtener asignaciones:", error);
      return [];
    }
  }

  // Creación encapsulada en el servicio
  public async crearAsignacion(obraId: number, personalId: number, fechaFin: Date): Promise<void> {
    try {
      await this._sp.web.lists.getByTitle(this._listName).items.add({
        Title: `Asignación Obra ${obraId}`,
        ObraId: obraId,
        PersonalId: personalId,
        FechaInicio: new Date().toISOString(),
        FechaFinPrevista: fechaFin.toISOString(),
        EstadoProgreso: 0,
      });
    } catch (error) {
      console.error(error);
      throw new Error("Error al guardar la asignación en SharePoint");
    }
  }

  public async asignarPersonal(asignacion: IAsignacion): Promise<void> {
    try {
      await this._sp.web.lists.getByTitle(this._listName).items.add({
        Title: `Asignación Obra ${asignacion.ObraId}`,
        ObraId: asignacion.ObraId,
        PersonalId: asignacion.PersonalId,
        FechaInicio: asignacion.FechaInicio.toISOString(),
        FechaFinPrevista: asignacion.FechaFinPrevista.toISOString(),
        EstadoProgreso: asignacion.EstadoProgreso || 0,
      });
    } catch (error) {
      console.error("Detalle del error:", error);
      throw new Error("Error al asignar personal en SharePoint");
    }
  }

  public async eliminarAsignacion(id: number): Promise<void> {
    try {
      await this._sp.web.lists.getByTitle(this._listName).items.getById(id).delete();
    } catch (error) {
      console.error("Error detallado de SharePoint:", error);
      throw new Error(`No se pudo eliminar la asignación`);
    }
  }

  public async actualizarAsignacion(id: number, datos: Partial<IAsignacion>): Promise<void> {
    try {
      await this._sp.web.lists.getByTitle(this._listName).items.getById(id).update(datos);
    } catch (error) {
      console.error("Error al actualizar la asignación:", error);
    }
  }

  public getCuadrillaSugerida(obraId: number, operarioId: number, asignaciones: any[], personal: IPersonal[]): IPersonal[] {
    const idsEnObra = asignaciones
        .filter(a => Number(a.ObraId) === Number(obraId))
        .map(a => Number(a.PersonalId));
    
    return personal.filter(p => idsEnObra.indexOf(Number(p.Id)) !== -1 && p.Id !== operarioId);
  }
}