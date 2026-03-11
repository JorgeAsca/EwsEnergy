export type RolUsuario = 'Manager' | 'Operario';

export interface IPersonal {
    Id: number;
    NombreyApellido: string; 
    Rol: string;
    EmpresaAsociadaId?: number;
    FotoPerfil?: {
        Url: string;
    };
}