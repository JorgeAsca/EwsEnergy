import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IObra } from "../models/IObra";
import { IObraCard } from "../models/IObraCard";
import { IFacepilePersona } from "@fluentui/react";

export class ProjectService {
  private _sp: SPFI;
  private _listName: string = "Proyectos y Obras";

  constructor(sp: SPFI) {
    this._sp = sp;
  }

  public async getObras(): Promise<IObra[]> {
    try {
      const items = await this._sp.web.lists.getByTitle(this._listName).items
        .select(
          "Id", 
          "Title", 
          "Descripcion",
          "DireccionObra",
          "FechaInicio",
          "FechaFinPrevista",
          "EstadoObra",
          "ProgresoReal",
          "JornadasTotales", 
          "Cliente/Id", 
          "Cliente/Title"
        )
        .expand("Cliente")();

      return items.map((item: any) => ({
        ...item,
        Id: item.Id,
        Title: item.Title,
        EstadoObra: item.EstadoObra || "Fase Previa",
        ProgresoReal: item.ProgresoReal || 0,
        JornadasTotales: item.JornadasTotales || 0,
        Cliente: item.Cliente ? { Id: item.Cliente.Id, Title: item.Cliente.Title } : undefined
      }));
    } catch (error) {
      console.error("Fallo crítico al pedir Obras:", error);
      return [];
    }
  }

  public async crearObra(nuevaObra: any): Promise<void> {
    try {
      await this._sp.web.lists.getByTitle(this._listName).items.add({
        Title: nuevaObra.Nombre || nuevaObra.Title,
        ClienteId: nuevaObra.ClienteId,
        DireccionObra: nuevaObra.Direccion || nuevaObra.DireccionObra,
        FechaInicio: nuevaObra.FechaInicio,
        FechaFinPrevista: nuevaObra.FechaFin || nuevaObra.FechaFinPrevista,
        JornadasTotales: nuevaObra.Jornadas || nuevaObra.JornadasTotales,
        EstadoObra: nuevaObra.EstadoObra || "Fase Previa",
        ProgresoReal: 0,
      });
    } catch (error) {
      console.error("Error al crear obra:", error);
      throw error;
    }
  }

  // Mantenemos alias addObra por si lo llamas desde otros componentes con ese nombre
  public async addObra(nuevaObra: any): Promise<void> {
    return this.crearObra(nuevaObra);
  }

  public async updateObra(id: number, data: any): Promise<void> {
    try {
      // Formateamos los datos para admitir tanto el modelo de formulario antiguo como el nuevo
      const updateData: any = {};
      if (data.Nombre || data.Title) updateData.Title = data.Nombre || data.Title;
      if (data.ClienteId) updateData.ClienteId = data.ClienteId;
      if (data.Direccion || data.DireccionObra) updateData.DireccionObra = data.Direccion || data.DireccionObra;
      if (data.FechaInicio) updateData.FechaInicio = data.FechaInicio;
      if (data.FechaFin || data.FechaFinPrevista) updateData.FechaFinPrevista = data.FechaFin || data.FechaFinPrevista;
      if (data.Jornadas || data.JornadasTotales) updateData.JornadasTotales = data.Jornadas || data.JornadasTotales;
      if (data.EstadoObra) updateData.EstadoObra = data.EstadoObra;

      await this._sp.web.lists.getByTitle(this._listName).items.getById(id).update(updateData);
    } catch (error) {
      console.error("Error al actualizar obra:", error);
      throw error;
    }
  }

  public async actualizarProgresoObra(id: number, nuevoProgreso: number): Promise<void> {
    await this._sp.web.lists.getByTitle(this._listName).items.getById(id).update({
      ProgresoReal: nuevoProgreso,
    });
  }

  public async actualizarEstado(id: number, nuevoEstado: string): Promise<void> {
    await this._sp.web.lists.getByTitle(this._listName).items.getById(id).update({
      EstadoObra: nuevoEstado,
    });
  }

  public async finalizarObra(id: number): Promise<void> {
    await this._sp.web.lists.getByTitle(this._listName).items.getById(id).update({
      EstadoObra: "Finalizado",
    });
  }

  public async cancelarObra(id: number): Promise<void> {
    await this._sp.web.lists.getByTitle(this._listName).items.getById(id).update({
      EstadoObra: "Cancelado",
    });
  }

  public async getFotosPorObra(obraId: number): Promise<any[]> {
    try {
      const items = await this._sp.web.lists.getByTitle('Registro_Fotos_Diarias').items
        .filter(`ObraId eq ${obraId}`)
        .orderBy("FechaRegistro", false)();
      
      return items || [];
    } catch (e) {
      console.error("Error al obtener fotos:", e);
      return [];
    }
  }

  public async getAsignacionesConPersonal(): Promise<any[]> {
    try {
      const items = await this._sp.web.lists.getByTitle('Asignaciones_Obras').items
        .select("Id", "ObraId", "Personal/NombreyApellido", "Personal/FotoPerfil")
        .expand("Personal")();

      return items.map((item: any) => ({
        Id: item.Id,
        ObraId: item.ObraId,
        Personal: {
          NombreyApellido: item.Personal ? item.Personal.NombreyApellido : "Sin nombre",
          FotoPerfil: item.Personal ? item.Personal.FotoPerfil : "",
        },
      }));
    } catch (error) {
      console.error("Error en getAsignacionesConPersonal:", error);
      return [];
    }
  }

  /**
   * Método automático para descontar jornadas de una obra y subir el progreso real
   * @param id ID de la obra
   * @param jornadasADescontar Cantidad calculada (Horas/8)
   */
  public async descontarJornadasObra(id: number, jornadasADescontar: number): Promise<void> {
    try {
      if (jornadasADescontar === 0) {
        console.warn("Se intentó procesar 0 jornadas. Omitiendo actualización.");
        return;
      }

      // 1. Obtenemos los valores actuales (JornadasTotales y ProgresoReal)
      const obra = await this._sp.web.lists.getByTitle(this._listName).items.getById(id).select("JornadasTotales", "ProgresoReal")();
      
      const valorActual = obra.JornadasTotales || 0;
      const progresoActual = obra.ProgresoReal || 0;

      // 2. Matemáticas: Restamos a las jornadas restantes y sumamos al progreso visual
      const nuevoValor = valorActual - jornadasADescontar;
      const nuevoProgreso = progresoActual + jornadasADescontar;

      // 3. Actualizamos la lista con ambos valores
      await this._sp.web.lists.getByTitle(this._listName).items.getById(id).update({
        JornadasTotales: nuevoValor,
        ProgresoReal: nuevoProgreso
      });

      console.log(`Actualización exitosa - Obra ID ${id} | Restantes: ${nuevoValor} | Progreso: ${nuevoProgreso}`);
    } catch (error) {
      console.error("Error al actualizar las jornadas y progreso automáticamente:", error);
      throw error;
    }
  }

  public async getObrasCompletas(
    asignaciones: any[],
    personal: any[],
  ): Promise<IObraCard[]> {
    const obras = await this.getObras();

    return obras.map((obra) => {
      const asignados = asignaciones.filter(
        (a) => Number(a.ObraId) === Number(obra.Id),
      );
      const operariosProps: IFacepilePersona[] = asignados.map((asig) => {
        const p = personal.find(
          (pers) => Number(pers.Id) === Number(asig.PersonalId),
        );
        return { personaName: p ? p.NombreyApellido : "Desconocido" };
      });

      return {
        ...obra,
        clienteNombre: (obra as any).Cliente?.Title || "Sin Cliente",
        porcentajeReal: obra.ProgresoReal || 0,
        operarios: operariosProps,
        // Cálculo mantenido del código original
        jornadasConsumidas: Math.round(((obra.ProgresoReal || 0) / 100) * (obra.JornadasTotales || 30)),
      } as IObraCard;
    });
  }
}