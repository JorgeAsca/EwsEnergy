export type RolUsuario = 'Manager' | 'Operario';

export interface IPersonal {
    Id: number;
    Title: string; 
    Rol: RolUsuario;
    Email: string;
    FotoPerfil?: {
        Url: string;
    };
    EmpresaAsociadaId?: number;
}