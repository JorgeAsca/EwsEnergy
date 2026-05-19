"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VistaHistorialTarjetas = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var react_1 = require("@fluentui/react");
var DailyReportService_1 = require("../../../service/DailyReportService");
var VistaHistorialTarjetas_module_scss_1 = tslib_1.__importDefault(require("./VistaHistorialTarjetas.module.scss"));
var VistaHistorialTarjetas = function (props) {
    // --- ESTADOS ---
    var _a = React.useState([]), reportes = _a[0], setReportes = _a[1];
    var _b = React.useState([]), filtrados = _b[0], setFiltrados = _b[1];
    var _c = React.useState(true), loading = _c[0], setLoading = _c[1];
    var _d = React.useState(null), error = _d[0], setError = _d[1];
    // --- SERVICIO ---
    var service = React.useMemo(function () { return new DailyReportService_1.DailyReportService(props.context); }, [props.context]);
    // --- CARGA DE DATOS ---
    var cargarDatos = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var data, e_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    setError(null);
                    return [4 /*yield*/, service.getHistorialGlobal()];
                case 1:
                    data = _a.sent();
                    setReportes(data);
                    setFiltrados(data);
                    return [3 /*break*/, 4];
                case 2:
                    e_1 = _a.sent();
                    setError("Error al cargar el historial de evidencias. Por favor, intente de nuevo.");
                    console.error(e_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    React.useEffect(function () {
        cargarDatos().catch(console.error);
    }, []);
    // --- LÓGICA DE FILTRADO ---
    var onFilter = function (text) {
        if (!text) {
            setFiltrados(reportes);
            return;
        }
        var busqueda = text.toLowerCase();
        var filtrado = reportes.filter(function (r) {
            return (r.Title && r.Title.toLowerCase().indexOf(busqueda) > -1) ||
                (r.Comentarios && r.Comentarios.toLowerCase().indexOf(busqueda) > -1);
        });
        setFiltrados(filtrado);
    };
    if (loading)
        return React.createElement(react_1.Spinner, { label: "Consultando archivos EWS...", className: VistaHistorialTarjetas_module_scss_1.default.loader });
    return (React.createElement("div", { className: VistaHistorialTarjetas_module_scss_1.default.container },
        React.createElement(react_1.Stack, { tokens: { childrenGap: 25 } },
            React.createElement("div", { className: VistaHistorialTarjetas_module_scss_1.default.headerSection },
                React.createElement(react_1.Stack, null,
                    React.createElement(react_1.Text, { variant: "xxLarge", className: VistaHistorialTarjetas_module_scss_1.default.titulo }, "Historial de Evidencias"),
                    React.createElement(react_1.Text, { variant: "small", className: VistaHistorialTarjetas_module_scss_1.default.subtitulo }, "Registro fotogr\u00E1fico de operaciones en campo")),
                React.createElement(react_1.SearchBox, { placeholder: "Buscar por obra o comentario...", onSearch: onFilter, onChange: function (_, val) { return onFilter(val || ""); }, className: VistaHistorialTarjetas_module_scss_1.default.searchBar })),
            error && (React.createElement(react_1.MessageBar, { messageBarType: react_1.MessageBarType.error, onDismiss: function () { return setError(null); } }, error)),
            React.createElement("div", { className: VistaHistorialTarjetas_module_scss_1.default.cardGrid }, filtrados.length > 0 ? (filtrados.map(function (item) {
                var _a;
                return (React.createElement("div", { key: item.Id, className: VistaHistorialTarjetas_module_scss_1.default.reporteCard },
                    React.createElement("div", { className: VistaHistorialTarjetas_module_scss_1.default.cardHeader },
                        React.createElement(react_1.Text, { className: VistaHistorialTarjetas_module_scss_1.default.obraName }, item.Title),
                        React.createElement(react_1.Text, { className: VistaHistorialTarjetas_module_scss_1.default.fechaText }, item.FechaRegistro ? new Date(item.FechaRegistro).toLocaleDateString() : 'S/F')),
                    React.createElement("div", { className: VistaHistorialTarjetas_module_scss_1.default.imageContainer },
                        React.createElement(react_1.Image, { src: (_a = item.UrlFoto) === null || _a === void 0 ? void 0 : _a.Url, alt: "Foto reporte", height: 200, imageFit: react_1.ImageFit.cover, className: VistaHistorialTarjetas_module_scss_1.default.reporteImagen })),
                    React.createElement("div", { className: VistaHistorialTarjetas_module_scss_1.default.cardContent },
                        React.createElement("div", { className: VistaHistorialTarjetas_module_scss_1.default.comentarioBox },
                            React.createElement(react_1.Text, { className: VistaHistorialTarjetas_module_scss_1.default.comentarios }, item.Comentarios ? "\"".concat(item.Comentarios, "\"") : "Sin observaciones técnicas")),
                        React.createElement(react_1.Stack, { horizontal: true, verticalAlign: "center", tokens: { childrenGap: 8 }, className: VistaHistorialTarjetas_module_scss_1.default.footerOperario },
                            React.createElement(react_1.Icon, { iconName: "Contact", className: VistaHistorialTarjetas_module_scss_1.default.iconOperario }),
                            React.createElement(react_1.Text, { variant: "small" },
                                "ID Operario: ",
                                React.createElement("b", null, item.OperarioId))))));
            })) : (!error && React.createElement(react_1.Text, { variant: "large", styles: { root: { textAlign: 'center', marginTop: 20 } } }, "No se encontraron evidencias."))))));
};
exports.VistaHistorialTarjetas = VistaHistorialTarjetas;
//# sourceMappingURL=VistaHistorialReportes.js.map