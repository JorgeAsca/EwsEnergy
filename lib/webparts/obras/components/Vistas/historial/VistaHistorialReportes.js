import { __awaiter, __generator } from "tslib";
import * as React from 'react';
import { Stack, Text, SearchBox, Spinner, Icon, Image, ImageFit, MessageBar, MessageBarType } from '@fluentui/react';
import { DailyReportService } from '../../../service/DailyReportService';
import styles from './VistaHistorialTarjetas.module.scss';
export var VistaHistorialTarjetas = function (props) {
    // --- ESTADOS ---
    var _a = React.useState([]), reportes = _a[0], setReportes = _a[1];
    var _b = React.useState([]), filtrados = _b[0], setFiltrados = _b[1];
    var _c = React.useState(true), loading = _c[0], setLoading = _c[1];
    var _d = React.useState(null), error = _d[0], setError = _d[1];
    // --- SERVICIO ---
    var service = React.useMemo(function () { return new DailyReportService(props.context); }, [props.context]);
    // --- CARGA DE DATOS ---
    var cargarDatos = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data, e_1;
        return __generator(this, function (_a) {
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
        return React.createElement(Spinner, { label: "Consultando archivos EWS...", className: styles.loader });
    return (React.createElement("div", { className: styles.container },
        React.createElement(Stack, { tokens: { childrenGap: 25 } },
            React.createElement("div", { className: styles.headerSection },
                React.createElement(Stack, null,
                    React.createElement(Text, { variant: "xxLarge", className: styles.titulo }, "Historial de Evidencias"),
                    React.createElement(Text, { variant: "small", className: styles.subtitulo }, "Registro fotogr\u00E1fico de operaciones en campo")),
                React.createElement(SearchBox, { placeholder: "Buscar por obra o comentario...", onSearch: onFilter, onChange: function (_, val) { return onFilter(val || ""); }, className: styles.searchBar })),
            error && (React.createElement(MessageBar, { messageBarType: MessageBarType.error, onDismiss: function () { return setError(null); } }, error)),
            React.createElement("div", { className: styles.cardGrid }, filtrados.length > 0 ? (filtrados.map(function (item) {
                var _a;
                return (React.createElement("div", { key: item.Id, className: styles.reporteCard },
                    React.createElement("div", { className: styles.cardHeader },
                        React.createElement(Text, { className: styles.obraName }, item.Title),
                        React.createElement(Text, { className: styles.fechaText }, item.FechaRegistro ? new Date(item.FechaRegistro).toLocaleDateString() : 'S/F')),
                    React.createElement("div", { className: styles.imageContainer },
                        React.createElement(Image, { src: (_a = item.UrlFoto) === null || _a === void 0 ? void 0 : _a.Url, alt: "Foto reporte", height: 200, imageFit: ImageFit.cover, className: styles.reporteImagen })),
                    React.createElement("div", { className: styles.cardContent },
                        React.createElement("div", { className: styles.comentarioBox },
                            React.createElement(Text, { className: styles.comentarios }, item.Comentarios ? "\"".concat(item.Comentarios, "\"") : "Sin observaciones técnicas")),
                        React.createElement(Stack, { horizontal: true, verticalAlign: "center", tokens: { childrenGap: 8 }, className: styles.footerOperario },
                            React.createElement(Icon, { iconName: "Contact", className: styles.iconOperario }),
                            React.createElement(Text, { variant: "small" },
                                "ID Operario: ",
                                React.createElement("b", null, item.OperarioId))))));
            })) : (!error && React.createElement(Text, { variant: "large", styles: { root: { textAlign: 'center', marginTop: 20 } } }, "No se encontraron evidencias."))))));
};
//# sourceMappingURL=VistaHistorialReportes.js.map