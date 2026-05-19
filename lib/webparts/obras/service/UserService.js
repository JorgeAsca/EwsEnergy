import { __awaiter, __generator } from "tslib";
import { SPHttpClient } from '@microsoft/sp-http';
var UserService = /** @class */ (function () {
    function UserService(context) {
        this._context = context;
        this._baseUrl = context.pageContext.web.absoluteUrl;
    }
    /**
     * Determina el rol del usuario actual consultando sus grupos de SharePoint
     */
    UserService.prototype.getRolActual = function () {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, response, data, grupos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = "".concat(this._baseUrl, "/_api/web/currentuser/groups");
                        return [4 /*yield*/, this._context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            // Si hay error o no tiene grupos, por defecto es Operario (seguridad mínima)
                            return [2 /*return*/, 'Operario'];
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        grupos = data.value.map(function (g) { return g.Title; });
                        if (grupos.indexOf('EWS_Admins') !== -1)
                            return [2 /*return*/, 'Administrador'];
                        if (grupos.indexOf('EWS_Managers') !== -1)
                            return [2 /*return*/, 'Manager'];
                        return [2 /*return*/, 'Operario'];
                }
            });
        });
    };
    /**
     * Obtiene la información del perfil del usuario logueado
     */
    UserService.prototype.getInfoUsuario = function () {
        return {
            nombre: this._context.pageContext.user.displayName,
            email: this._context.pageContext.user.email,
            id: this._context.pageContext.user.loginName
        };
    };
    return UserService;
}());
export { UserService };
//# sourceMappingURL=UserService.js.map