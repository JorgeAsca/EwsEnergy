import { __assign, __awaiter, __generator, __spreadArray } from "tslib";
import * as React from "react";
import { Stack, Text, Persona, PersonaSize, PrimaryButton, DefaultButton, Spinner, SpinnerSize, TextField, Icon, IconButton, Dropdown, Slider, } from "@fluentui/react";
import { PersonalService } from "../../../service/PersonalService";
import { AsignacionesService } from "../../../service/AsignacionesService";
import { ProjectService } from "../../../service/ProjectService";
import { PhotoService } from "../../../service/PhotoService";
import styles from "./VistaFotosObra.module.scss";
export var VistaFotosObra = function (props) {
    var _a = React.useState(1), paso = _a[0], setPaso = _a[1];
    var _b = React.useState(true), loading = _b[0], setLoading = _b[1];
    var _c = React.useState(false), subiendo = _c[0], setSubiendo = _c[1];
    // Inputs independientes para fotos
    var fileInputRefFinal = React.useRef(null);
    var fileInputRefPrevia = React.useRef(null);
    var _d = React.useState(false), mensajeExito = _d[0], setMensajeExito = _d[1];
    var _e = React.useState(false), procesandoCaptura = _e[0], setProcesandoCaptura = _e[1];
    var _f = React.useState(null), operario = _f[0], setOperario = _f[1];
    var _g = React.useState(null), obraSeleccionada = _g[0], setObraSeleccionada = _g[1];
    // Gestión de cuadrilla y horas
    var _h = React.useState([]), compañeros = _h[0], setCompañeros = _h[1];
    var _j = React.useState({}), horasTrabajadas = _j[0], setHorasTrabajadas = _j[1];
    // Listados de fotos separados
    var _k = React.useState([]), fotosPrevias = _k[0], setFotosPrevias = _k[1];
    var _l = React.useState([]), fotosFinales = _l[0], setFotosFinales = _l[1];
    var _m = React.useState(""), comentarios = _m[0], setComentarios = _m[1];
    var _o = React.useState({
        listaPersonal: [],
        obrasActivas: [],
        asignacionesGlobales: []
    }), data = _o[0], setData = _o[1];
    var services = React.useMemo(function () { return ({
        personal: new PersonalService(props.context),
        asig: new AsignacionesService(props.context),
        obras: new ProjectService(props.context),
        fotos: new PhotoService(props.context),
    }); }, [props.context]);
    React.useEffect(function () {
        var iniciar = function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, pers, asigs, obs, obrasActivasFiltradas, currentUserEmail_1, yoMismo_1, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, Promise.all([
                                services.personal.getPersonal(),
                                services.asig.getAsignaciones(),
                                services.obras.getObras(),
                            ])];
                    case 1:
                        _a = _b.sent(), pers = _a[0], asigs = _a[1], obs = _a[2];
                        obrasActivasFiltradas = obs.filter(function (o) { return o.EstadoObra !== "Finalizado"; });
                        setData({
                            listaPersonal: pers,
                            asignacionesGlobales: asigs,
                            obrasActivas: obrasActivasFiltradas
                        });
                        currentUserEmail_1 = props.context.pageContext.user.email.toLowerCase();
                        yoMismo_1 = pers.find(function (p) { return p.Email && p.Email.toLowerCase() === currentUserEmail_1; });
                        if (yoMismo_1) {
                            setOperario(yoMismo_1);
                            // Inicializamos las horas del operario actual por defecto en 8h (100%)
                            if (yoMismo_1.Id) {
                                setHorasTrabajadas(function (prev) {
                                    var _a;
                                    return (__assign(__assign({}, prev), (_a = {}, _a[yoMismo_1.Id] = 8, _a)));
                                });
                            }
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        e_1 = _b.sent();
                        console.error(e_1);
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        iniciar();
    }, [services]);
    var handleSeleccionarObra = function (ob) {
        setObraSeleccionada(ob);
        // Cargar los compañeros asignados automáticamente a esta obra
        var asigsObra = data.asignacionesGlobales.filter(function (a) { return Number(a.ObraId) === Number(ob.Id); });
        var compis = data.listaPersonal.filter(function (p) {
            return asigsObra.some(function (a) { return Number(a.PersonalId) === Number(p.Id); }) && p.Id !== (operario === null || operario === void 0 ? void 0 : operario.Id);
        });
        setCompañeros(compis);
        // Inicializar las horas de los compañeros asignados por defecto en 8 horas
        var horasIniciales = {};
        if (operario === null || operario === void 0 ? void 0 : operario.Id)
            horasIniciales[operario.Id] = horasTrabajadas[operario.Id] || 8;
        compis.forEach(function (c) {
            if (c.Id)
                horasIniciales[c.Id] = 8;
        });
        setHorasTrabajadas(horasIniciales);
        setPaso(2);
    };
    var agregarCompañeroExtra = function (event, option) {
        if (option) {
            var persona_1 = data.listaPersonal.find(function (p) { return p.Id === option.key; });
            if (persona_1 && persona_1.Id) {
                setCompañeros(function (prev) { return __spreadArray(__spreadArray([], prev, true), [persona_1], false); });
                setHorasTrabajadas(function (prev) {
                    var _a;
                    return (__assign(__assign({}, prev), (_a = {}, _a[persona_1.Id] = 8, _a)));
                });
            }
        }
    };
    var removerCompañero = function (id) {
        setCompañeros(function (prev) { return prev.filter(function (c) { return c.Id !== id; }); });
        setHorasTrabajadas(function (prev) {
            var copia = __assign({}, prev);
            delete copia[id];
            return copia;
        });
    };
    var cambiarHoras = function (id, nuevasHoras) {
        setHorasTrabajadas(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[id] = nuevasHoras, _a)));
        });
    };
    var manejarCapturaFoto = function (event, esPrevia) { return __awaiter(void 0, void 0, void 0, function () {
        var archivo, ubicacion, nuevaFotoLocal_1, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    archivo = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
                    if (!archivo)
                        return [2 /*return*/];
                    setProcesandoCaptura(true);
                    setMensajeExito(false);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, obtenerUbicacion()];
                case 2:
                    ubicacion = _b.sent();
                    nuevaFotoLocal_1 = {
                        ID: Date.now(),
                        archivo: archivo,
                        Url: URL.createObjectURL(archivo),
                        Nombre: archivo.name,
                        latitud: ubicacion === null || ubicacion === void 0 ? void 0 : ubicacion.lat,
                        longitud: ubicacion === null || ubicacion === void 0 ? void 0 : ubicacion.lng,
                        Ubicacion: ubicacion ? "".concat(ubicacion.lat, ", ").concat(ubicacion.lng) : "Capturada"
                    };
                    if (esPrevia) {
                        setFotosPrevias(function (prev) { return __spreadArray(__spreadArray([], prev, true), [nuevaFotoLocal_1], false); });
                    }
                    else {
                        setFotosFinales(function (prev) { return __spreadArray(__spreadArray([], prev, true), [nuevaFotoLocal_1], false); });
                    }
                    setMensajeExito(true);
                    setTimeout(function () { return setMensajeExito(false); }, 3000);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error("Error en vista previa:", error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setProcesandoCaptura(false);
                    if (fileInputRefPrevia.current)
                        fileInputRefPrevia.current.value = "";
                    if (fileInputRefFinal.current)
                        fileInputRefFinal.current.value = "";
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var obtenerUbicacion = function () {
        return new Promise(function (resolve) {
            if (!navigator.geolocation)
                resolve(null);
            navigator.geolocation.getCurrentPosition(function (pos) { return resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); }, function () { return resolve(null); }, { enableHighAccuracy: true, timeout: 5000 });
        });
    };
    var enviarReporte = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _i, fotosPrevias_1, fotoObj, _a, fotosFinales_1, fotoObj, totalHorasCuadrilla_1, jornadasConsumidasHoy, jornadasTotales, nuevoProgresoReal, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!obraSeleccionada || !operario || fotosFinales.length === 0)
                        return [2 /*return*/];
                    setSubiendo(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 11, 12, 13]);
                    _i = 0, fotosPrevias_1 = fotosPrevias;
                    _b.label = 2;
                case 2:
                    if (!(_i < fotosPrevias_1.length)) return [3 /*break*/, 5];
                    fotoObj = fotosPrevias_1[_i];
                    return [4 /*yield*/, services.fotos.uploadCompressedPhoto(fotoObj.archivo, "".concat(obraSeleccionada.Title, "_Previas"), {
                            operario: operario.NombreyApellido,
                            operarioId: operario.Id,
                            obraId: obraSeleccionada.Id,
                            comentarios: "Registro previo de entrada",
                            latitud: fotoObj.latitud,
                            longitud: fotoObj.longitud
                        })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    _a = 0, fotosFinales_1 = fotosFinales;
                    _b.label = 6;
                case 6:
                    if (!(_a < fotosFinales_1.length)) return [3 /*break*/, 9];
                    fotoObj = fotosFinales_1[_a];
                    return [4 /*yield*/, services.fotos.uploadCompressedPhoto(fotoObj.archivo, obraSeleccionada.Title, {
                            operario: operario.NombreyApellido,
                            operarioId: operario.Id,
                            obraId: obraSeleccionada.Id,
                            comentarios: comentarios,
                            latitud: fotoObj.latitud,
                            longitud: fotoObj.longitud
                        })];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 6];
                case 9:
                    totalHorasCuadrilla_1 = 0;
                    Object.keys(horasTrabajadas).forEach(function (key) {
                        totalHorasCuadrilla_1 += horasTrabajadas[Number(key)] || 0;
                    });
                    jornadasConsumidasHoy = totalHorasCuadrilla_1 / 8;
                    jornadasTotales = obraSeleccionada.JornadasTotales || 30;
                    nuevoProgresoReal = Math.min((obraSeleccionada.ProgresoReal || 0) + ((jornadasConsumidasHoy / jornadasTotales) * 100), 100);
                    // Actualizamos en SharePoint el progreso calculado de forma automática
                    return [4 /*yield*/, services.obras.actualizarProgresoObra(obraSeleccionada.Id, parseFloat(nuevoProgresoReal.toFixed(2)))];
                case 10:
                    // Actualizamos en SharePoint el progreso calculado de forma automática
                    _b.sent();
                    alert("\u00A1Reporte enviado! Se registraron ".concat(totalHorasCuadrilla_1, "h en total (").concat(jornadasConsumidasHoy.toFixed(2), " jornadas descontadas del proyecto)."));
                    window.location.reload();
                    return [3 /*break*/, 13];
                case 11:
                    error_2 = _b.sent();
                    alert("Hubo un error al sincronizar las evidencias de la obra.");
                    return [3 /*break*/, 13];
                case 12:
                    setSubiendo(false);
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    }); };
    if (loading)
        return React.createElement(Spinner, { size: SpinnerSize.large, label: "Cargando informaci\u00F3n del proyecto..." });
    var direccionCodificada = obraSeleccionada ? encodeURIComponent(obraSeleccionada.DireccionObra || obraSeleccionada.Title) : "";
    var urlMapaInteractivo = "https://maps.google.com/maps?q=".concat(direccionCodificada, "&t=&z=15&ie=UTF8&iwloc=&output=embed");
    return (React.createElement("div", { className: styles.container },
        React.createElement("header", { className: styles.appHeader },
            React.createElement(Stack, null,
                React.createElement(Text, { variant: "xLarge", className: styles.title }, "EWS"),
                React.createElement(Text, { className: styles.subtitle }, "Portal de Obra Inteligente")),
            operario && React.createElement(Persona, { imageUrl: operario.FotoPerfil, size: PersonaSize.size32, hidePersonaDetails: true })),
        React.createElement("div", { className: styles.wizardNav }, [1, 2, 3, 4, 5].map(function (p) { return (React.createElement("div", { key: p, className: "".concat(styles.dot, " ").concat(paso >= p ? styles.active : "") })); })),
        React.createElement("main", { className: styles.mainContent },
            paso === 1 && (React.createElement("section", { className: styles.stepContainer },
                React.createElement(Text, { variant: "large", className: styles.stepTitle }, "1. Selecci\u00F3n de Obra"),
                !operario ? (React.createElement(Stack, { tokens: { childrenGap: 10 } },
                    React.createElement(Text, null, "\u00BFQui\u00E9n env\u00EDa el reporte?"),
                    data.listaPersonal.map(function (p) { return (React.createElement("div", { key: p.Id, className: styles.userCard, onClick: function () { return setOperario(p); } },
                        React.createElement(Persona, { imageUrl: p.FotoPerfil, text: p.NombreyApellido, secondaryText: p.Rol, size: PersonaSize.size40 }))); }))) : (React.createElement(Stack, { tokens: { childrenGap: 15 } },
                    React.createElement(Text, null,
                        "Hola ",
                        React.createElement("b", null, operario.NombreyApellido),
                        ", selecciona una obra activa:"),
                    data.obrasActivas.map(function (o) { return (React.createElement("div", { key: o.Id, className: styles.obraCard, onClick: function () { return handleSeleccionarObra(o); } },
                        React.createElement(Text, { className: styles.obraTitle }, o.Title),
                        React.createElement(Text, { variant: "small" },
                            React.createElement(Icon, { iconName: "MapPin" }),
                            " ",
                            o.DireccionObra))); }),
                    React.createElement(DefaultButton, { text: "Cambiar Operario", onClick: function () { return setOperario(null); }, style: { marginTop: 10 } }))))),
            paso === 2 && obraSeleccionada && (React.createElement("section", { className: styles.stepContainer },
                React.createElement(Text, { variant: "large", className: styles.stepTitle }, "2. Datos de la Obra"),
                React.createElement("div", { style: { background: '#f3f2f1', padding: '15px', borderRadius: '8px', marginBottom: '20px' } },
                    React.createElement(Text, { variant: "mediumPlus", style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, obraSeleccionada.Title),
                    React.createElement(Text, { variant: "small", style: { color: '#605e5c', display: 'block', marginBottom: '15px' } },
                        React.createElement(Icon, { iconName: "MapPin", style: { marginRight: '5px' } }),
                        " ",
                        obraSeleccionada.DireccionObra || "Dirección no especificada"),
                    React.createElement("div", { style: { width: '100%', height: '220px', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '15px', border: '1px solid #ced4da' } },
                        React.createElement("iframe", { width: "100%", height: "100%", style: { border: 0 }, src: urlMapaInteractivo, loading: "lazy" })),
                    React.createElement(Stack, { tokens: { childrenGap: 12 } },
                        React.createElement("div", { style: { background: '#ffffff', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #107c41', display: 'flex', alignItems: 'center' } },
                            React.createElement(Icon, { iconName: "BuildDefinition", style: { fontSize: '20px', color: '#107c41', marginRight: '10px' } }),
                            React.createElement(Stack, { style: { flexGrow: 1 } },
                                React.createElement(Text, { style: { fontWeight: '600' } }, "Planos T\u00E9cnicos"),
                                React.createElement(Text, { variant: "small", style: { color: '#a19f9d' } }, "Esquemas estructurales y el\u00E9ctricos")),
                            React.createElement(IconButton, { iconProps: { iconName: "DietPlanView" }, title: "Ver Planos", onClick: function () { return alert("Módulo de planos (Próximamente)..."); } })),
                        React.createElement("div", { style: { background: '#ffffff', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #d83b01', display: 'flex', alignItems: 'center' } },
                            React.createElement(Icon, { iconName: "PDF", style: { fontSize: '20px', color: '#d83b01', marginRight: '10px' } }),
                            React.createElement(Stack, { style: { flexGrow: 1 } },
                                React.createElement(Text, { style: { fontWeight: '600' } }, "Documentaci\u00F3n y Permisos"),
                                React.createElement(Text, { variant: "small", style: { color: '#a19f9d' } }, "Hojas de seguridad y actas")),
                            React.createElement(IconButton, { iconProps: { iconName: "DocumentSearch" }, title: "Ver Documentos", onClick: function () { return alert("Biblioteca de documentos (Próximamente)..."); } })))),
                React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 10 } },
                    React.createElement(DefaultButton, { text: "Atr\u00E1s", onClick: function () { return setPaso(1); } }),
                    React.createElement(PrimaryButton, { text: "Tomar fotos previas", onClick: function () { return setPaso(3); }, className: styles.btnEws, style: { flex: 1 } })))),
            paso === 3 && obraSeleccionada && (React.createElement("section", { className: styles.stepContainer },
                React.createElement(Text, { variant: "large", className: styles.stepTitle }, "3. Fotos Previas (Llegada)"),
                React.createElement("input", { type: "file", accept: "image/*", capture: "environment", style: { display: "none" }, ref: fileInputRefPrevia, onChange: function (e) { return manejarCapturaFoto(e, true); } }),
                React.createElement("label", { className: styles.photoDropzone, onClick: function () { var _a; return !procesandoCaptura && ((_a = fileInputRefPrevia.current) === null || _a === void 0 ? void 0 : _a.click()); }, style: { cursor: procesandoCaptura ? 'wait' : 'pointer', opacity: procesandoCaptura ? 0.7 : 1, border: '2px dashed #0078d4' } }, procesandoCaptura ? (React.createElement(Spinner, { size: SpinnerSize.large, label: "Registrando llegada..." })) : (React.createElement(React.Fragment, null,
                    React.createElement(Icon, { iconName: "Camera", className: styles.bigIcon, style: { color: '#0078d4' } }),
                    React.createElement(Text, null, "Capturar Estado Inicial de la Obra (GPS)")))),
                React.createElement("div", { className: styles.previewContainer }, fotosPrevias.map(function (f, i) { return (React.createElement("div", { key: f.ID || i, className: styles.previewItem },
                    React.createElement("img", { src: f.Url, alt: "preview previa" }),
                    f.latitud && React.createElement("span", { className: styles.gpsBadge },
                        React.createElement(Icon, { iconName: "MapPin" })),
                    React.createElement(IconButton, { iconProps: { iconName: "Cancel" }, className: styles.removePhoto, onClick: function () { return setFotosPrevias(function (prev) { return prev.filter(function (_, idx) { return idx !== i; }); }); } }))); })),
                React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 10 }, styles: { root: { marginTop: 25 } } },
                    React.createElement(DefaultButton, { text: "Atr\u00E1s", onClick: function () { return setPaso(2); }, disabled: procesandoCaptura }),
                    React.createElement(PrimaryButton, { text: "Gestionar Personal", onClick: function () { return setPaso(4); }, disabled: fotosPrevias.length === 0 || procesandoCaptura, className: styles.btnEws, style: { flex: 1 } })))),
            paso === 4 && obraSeleccionada && (React.createElement("section", { className: styles.stepContainer },
                React.createElement(Text, { variant: "large", className: styles.stepTitle }, "4. Gestionar Personal"),
                React.createElement(Text, { style: { display: 'block', marginBottom: '15px', color: '#605e5c' } },
                    "Ajusta las horas de trabajo del personal. ",
                    React.createElement("b", null, "M\u00E1ximo 8 Horas por jornada (100%)"),
                    "."),
                React.createElement("div", { style: { background: '#f3f2f1', padding: '15px', borderRadius: '8px', marginBottom: '15px' } },
                    React.createElement(Stack, { tokens: { childrenGap: 20 } },
                        operario && operario.Id && (React.createElement("div", { style: { background: '#ffffff', padding: '12px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } },
                            React.createElement(Persona, { imageUrl: operario.FotoPerfil, text: "".concat(operario.NombreyApellido, " (T\u00FA)"), secondaryText: operario.Rol, size: PersonaSize.size32 }),
                            React.createElement("div", { style: { marginTop: '10px' } },
                                React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '2px' } },
                                    React.createElement(Text, { variant: "small", style: { fontWeight: '600', color: '#0078d4' } },
                                        "Horas: ",
                                        horasTrabajadas[operario.Id] || 0,
                                        "h"),
                                    React.createElement(Text, { variant: "small", style: { fontWeight: '600', color: '#0078d4' } },
                                        Math.round(((horasTrabajadas[operario.Id] || 0) / 8) * 100),
                                        "%")),
                                React.createElement(Slider, { min: 0, max: 8, step: 0.5, value: horasTrabajadas[operario.Id] || 0, showValue: false, onChange: function (v) { return cambiarHoras(operario.Id, v); } })))),
                        compañeros.map(function (c) {
                            if (!c.Id)
                                return null;
                            var hrs = horasTrabajadas[c.Id] || 0;
                            var pct = Math.round((hrs / 8) * 100);
                            return (React.createElement("div", { key: c.Id, style: { background: '#ffffff', padding: '12px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' } },
                                React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                    React.createElement(Persona, { imageUrl: c.FotoPerfil, text: c.NombreyApellido, secondaryText: c.Rol, size: PersonaSize.size32 }),
                                    React.createElement(IconButton, { iconProps: { iconName: "Delete" }, title: "Quitar de la lista", styles: { root: { color: '#a19f9d' }, rootHovered: { color: '#d83b01' } }, onClick: function () { return removerCompañero(c.Id); } })),
                                React.createElement("div", { style: { marginTop: '10px' } },
                                    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '2px' } },
                                        React.createElement(Text, { variant: "small", style: { fontWeight: '600', color: '#107c41' } },
                                            "Horas: ",
                                            hrs,
                                            "h"),
                                        React.createElement(Text, { variant: "small", style: { fontWeight: '600', color: '#107c41' } },
                                            pct,
                                            "%")),
                                    React.createElement(Slider, { min: 0, max: 8, step: 0.5, value: hrs, showValue: false, onChange: function (v) { return cambiarHoras(c.Id, v); } }))));
                        }))),
                React.createElement("div", { style: { marginBottom: '20px' } },
                    React.createElement(Dropdown, { placeholder: "+ A\u00F1adir personal por imprevisto", options: data.listaPersonal.filter(function (p) { return p.Id !== (operario === null || operario === void 0 ? void 0 : operario.Id) && !compañeros.some(function (c) { return c.Id === p.Id; }); }).map(function (p) { return ({ key: p.Id, text: p.NombreyApellido }); }), onChange: agregarCompañeroExtra, selectedKey: null })),
                React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 10 } },
                    React.createElement(DefaultButton, { text: "Atr\u00E1s", onClick: function () { return setPaso(3); } }),
                    React.createElement(PrimaryButton, { text: "Siguiente (Evidencias de Cierre)", onClick: function () { return setPaso(5); }, className: styles.btnEws, style: { flex: 1 } })))),
            paso === 5 && obraSeleccionada && (React.createElement("section", { className: styles.stepContainer },
                React.createElement(Text, { variant: "large", className: styles.stepTitle }, "5. Evidencia Visual (Cierre)"),
                React.createElement("input", { type: "file", accept: "image/*", capture: "environment", style: { display: "none" }, ref: fileInputRefFinal, onChange: function (e) { return manejarCapturaFoto(e, false); } }),
                React.createElement("label", { className: styles.photoDropzone, onClick: function () { var _a; return !procesandoCaptura && ((_a = fileInputRefFinal.current) === null || _a === void 0 ? void 0 : _a.click()); }, style: { cursor: procesandoCaptura ? 'wait' : 'pointer', opacity: procesandoCaptura ? 0.7 : 1 } }, procesandoCaptura ? (React.createElement(Spinner, { size: SpinnerSize.large, label: "Optimizando..." })) : (React.createElement(React.Fragment, null,
                    React.createElement(Icon, { iconName: "Camera", className: styles.bigIcon }),
                    React.createElement(Text, null, "Toca para tomar foto de fin de jornada")))),
                React.createElement("div", { className: styles.previewContainer }, fotosFinales.map(function (f, i) { return (React.createElement("div", { key: f.ID || i, className: styles.previewItem },
                    React.createElement("img", { src: f.Url, alt: "preview final" }),
                    f.latitud && React.createElement("span", { className: styles.gpsBadge },
                        React.createElement(Icon, { iconName: "MapPin" })),
                    React.createElement(IconButton, { iconProps: { iconName: "Cancel" }, className: styles.removePhoto, onClick: function () { return setFotosFinales(function (prev) { return prev.filter(function (_, idx) { return idx !== i; }); }); } }))); })),
                React.createElement(TextField, { label: "Comentarios de Cierre \uD83C\uDFA4", multiline: true, rows: 3, value: comentarios, onChange: function (_, v) { return setComentarios(v || ""); } }),
                React.createElement(Stack, { horizontal: true, tokens: { childrenGap: 10 }, styles: { root: { marginTop: 25 } } },
                    React.createElement(DefaultButton, { text: "Atr\u00E1s", onClick: function () { return setPaso(4); }, disabled: subiendo || procesandoCaptura }),
                    React.createElement(PrimaryButton, { text: subiendo ? "Sincronizando..." : "Enviar Reporte", iconProps: { iconName: "Send" }, onClick: enviarReporte, disabled: fotosFinales.length === 0 || subiendo || procesandoCaptura, className: styles.btnEws, style: { flex: 1 } })))))));
};
//# sourceMappingURL=VistaFotosObra.js.map