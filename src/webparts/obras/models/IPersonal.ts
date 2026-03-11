export type RolUsuario = 'Manager' | 'Operario';

export interface IPersonal {
    Id: number;
    Title: string; // Nombre completo
    Rol: RolUsuario;
    Email: string;
    FotoPerfil?: {
        Url: string;
    };
    EmpresaAsociadaId?: number;
}