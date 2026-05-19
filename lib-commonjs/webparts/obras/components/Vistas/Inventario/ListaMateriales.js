"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListaMateriales = void 0;
var tslib_1 = require("tslib");
var React = tslib_1.__importStar(require("react"));
var react_1 = require("@fluentui/react");
var ListaMateriales_module_scss_1 = tslib_1.__importDefault(require("./ListaMateriales.module.scss"));
var StockService_1 = require("../../../service/StockService");
var categorias = [
    { key: "Consumible", text: "Consumible" },
    { key: "Herramienta", text: "Herramienta" },
    { key: "Maquinaria", text: "Maquinaria" },
    { key: "EPIS", text: "EPIS" },
];
var ListaMateriales = function (props) {
    var _a, _b;
    var _c = React.useState([]), items = _c[0], setItems = _c[1];
    var _d = React.useState(true), loading = _d[0], setLoading = _d[1];
    var _e = React.useState(""), filterText = _e[0], setFilterText = _e[1];
    var _f = React.useState(false), isPanelOpen = _f[0], setIsPanelOpen = _f[1];
    var _g = React.useState(null), selectedItem = _g[0], setSelectedItem = _g[1];
    var _h = React.useState({
        nombre: "",
        stock: 0,
        stockMin: 0,
        cat: "Consumible",
        file: null
    }), nuevo = _h[0], setNuevo = _h[1];
    var service = React.useMemo(function () { return new StockService_1.StockService(props.context); }, [props.context]);
    var cargarMateriales = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var data, e_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, service.getInventario()];
                case 2:
                    data = _a.sent();
                    setItems(data);
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _a.sent();
                    console.error("Error al cargar inventario", e_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    React.useEffect(function () {
        cargarMateriales();
    }, []);
    var handleAdd = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var e_2;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!nuevo.nombre)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, service.crearMaterial({
                            Title: nuevo.nombre,
                            StockActual: nuevo.stock,
                            StockMinimo: nuevo.stockMin,
                            Categoria: nuevo.cat
                        })];
                case 2:
                    _a.sent();
                    setNuevo({ nombre: "", stock: 0, stockMin: 0, cat: "Consumible", file: null });
                    cargarMateriales();
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    console.error(e_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (id) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("¿Seguro que desea eliminar este registro?")) return [3 /*break*/, 2];
                    return [4 /*yield*/, service.eliminarMaterial(id)];
                case 1:
                    _a.sent();
                    cargarMateriales();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdate = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var e_3;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedItem)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    setLoading(true);
                    return [4 /*yield*/, service.actualizarMaterial(selectedItem.Id, {
                            Title: selectedItem.Title,
                            Categoria: selectedItem.Categoria,
                            StockActual: selectedItem.StockActual,
                            StockMinimo: selectedItem.StockMinimo
                        })];
                case 2:
                    _a.sent();
                    setIsPanelOpen(false);
                    return [4 /*yield*/, cargarMateriales()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    e_3 = _a.sent();
                    console.error("Error al actualizar", e_3);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var columns = [
        {
            key: "col1",
            name: "Material",
            fieldName: "Title",
            minWidth: 150,
            isResizable: true,
            onRender: function (item) { return React.createElement(react_1.Text, null, item.Title); }
        },
        {
            key: "col2",
            name: "Categoría",
            fieldName: "Categoria",
            minWidth: 100,
        },
        {
            key: "col3",
            name: "Stock Actual",
            fieldName: "StockActual",
            minWidth: 80,
            onRender: function (item) { return (React.createElement("span", { className: item.StockActual <= item.StockMinimo ? ListaMateriales_module_scss_1.default.stockCellAlerta : ListaMateriales_module_scss_1.default.stockCellNormal }, item.StockActual)); }
        },
        {
            key: "col4",
            name: "Mínimo",
            fieldName: "StockMinimo",
            minWidth: 80,
        },
        {
            key: "col5",
            name: "Acciones",
            minWidth: 100,
            onRender: function (item) { return (React.createElement(react_1.Stack, { horizontal: true, gap: 5 },
                React.createElement(react_1.IconButton, { iconProps: { iconName: "Edit" }, onClick: function () { setSelectedItem(tslib_1.__assign({}, item)); setIsPanelOpen(true); }, className: ListaMateriales_module_scss_1.default.actionBtn }),
                React.createElement(react_1.IconButton, { iconProps: { iconName: "Delete" }, onClick: function () { return handleDelete(item.Id); }, className: ListaMateriales_module_scss_1.default.deleteBtn }))); },
        },
    ];
    var itemsFiltrados = items.filter(function (i) { var _a; return (_a = i.Title) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(filterText.toLowerCase()); });
    return (React.createElement("div", { className: ListaMateriales_module_scss_1.default.container },
        React.createElement("div", { className: ListaMateriales_module_scss_1.default.formCard },
            React.createElement("div", { className: ListaMateriales_module_scss_1.default.formTitle },
                React.createElement(react_1.Icon, { iconName: "BoxAdditionSolid" }),
                React.createElement(react_1.Text, { variant: "xLarge" }, "Dar de alta nuevo material")),
            React.createElement("div", { className: ListaMateriales_module_scss_1.default.gridForm },
                React.createElement(react_1.TextField, { label: "Nombre", value: nuevo.nombre, onChange: function (_, v) { return setNuevo(tslib_1.__assign(tslib_1.__assign({}, nuevo), { nombre: v || "" })); }, required: true }),
                React.createElement(react_1.Dropdown, { label: "Categor\u00EDa", options: categorias, selectedKey: nuevo.cat, onChange: function (_, o) { return setNuevo(tslib_1.__assign(tslib_1.__assign({}, nuevo), { cat: o === null || o === void 0 ? void 0 : o.key })); } }),
                React.createElement(react_1.TextField, { label: "Stock", type: "number", value: nuevo.stock.toString(), onChange: function (_, v) { return setNuevo(tslib_1.__assign(tslib_1.__assign({}, nuevo), { stock: parseInt(v || "0") })); } }),
                React.createElement(react_1.TextField, { label: "Alerta M\u00EDn.", type: "number", value: nuevo.stockMin.toString(), onChange: function (_, v) { return setNuevo(tslib_1.__assign(tslib_1.__assign({}, nuevo), { stockMin: parseInt(v || "0") })); } }),
                React.createElement(react_1.PrimaryButton, { text: "Registrar", iconProps: { iconName: "Save" }, onClick: handleAdd, className: ListaMateriales_module_scss_1.default.btnAdd }))),
        React.createElement("div", { className: ListaMateriales_module_scss_1.default.searchSection },
            React.createElement(react_1.SearchBox, { placeholder: "Filtrar materiales...", onChange: function (_, v) { return setFilterText(v || ""); } })),
        loading ? (React.createElement(react_1.Spinner, { size: react_1.SpinnerSize.large, label: "Cargando almac\u00E9n..." })) : (React.createElement("div", { className: ListaMateriales_module_scss_1.default.tableContainer },
            React.createElement(react_1.DetailsList, { items: itemsFiltrados, columns: columns, selectionMode: react_1.SelectionMode.none, layoutMode: react_1.DetailsListLayoutMode.justified }))),
        React.createElement(react_1.Panel, { isOpen: isPanelOpen, onDismiss: function () { return setIsPanelOpen(false); }, headerText: "Editar Material", type: react_1.PanelType.medium }, selectedItem && (React.createElement(react_1.Stack, { gap: 15, className: ListaMateriales_module_scss_1.default.panelStack },
            React.createElement(react_1.TextField, { label: "Nombre", value: selectedItem.Title, onChange: function (_, v) { return setSelectedItem(tslib_1.__assign(tslib_1.__assign({}, selectedItem), { Title: v || "" })); } }),
            React.createElement(react_1.Dropdown, { label: "Categor\u00EDa", options: categorias, selectedKey: selectedItem.Categoria, onChange: function (_, o) { return setSelectedItem(tslib_1.__assign(tslib_1.__assign({}, selectedItem), { Categoria: o === null || o === void 0 ? void 0 : o.key })); } }),
            React.createElement(react_1.TextField, { label: "Stock Actual", type: "number", value: (_a = selectedItem.StockActual) === null || _a === void 0 ? void 0 : _a.toString(), onChange: function (_, v) { return setSelectedItem(tslib_1.__assign(tslib_1.__assign({}, selectedItem), { StockActual: parseInt(v || "0") })); } }),
            React.createElement(react_1.TextField, { label: "Stock M\u00EDnimo", type: "number", value: (_b = selectedItem.StockMinimo) === null || _b === void 0 ? void 0 : _b.toString(), onChange: function (_, v) { return setSelectedItem(tslib_1.__assign(tslib_1.__assign({}, selectedItem), { StockMinimo: parseInt(v || "0") })); } }),
            React.createElement(react_1.Separator, null),
            React.createElement(react_1.Stack, { horizontal: true, gap: 10 },
                React.createElement(react_1.PrimaryButton, { text: "Guardar Cambios", onClick: handleUpdate }),
                React.createElement(react_1.DefaultButton, { text: "Cancelar", onClick: function () { return setIsPanelOpen(false); } })))))));
};
exports.ListaMateriales = ListaMateriales;
//# sourceMappingURL=ListaMateriales.js.map