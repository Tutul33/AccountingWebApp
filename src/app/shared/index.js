"use strict";
///////* Services */
////export { ModalService } from '../commonComponents/services/modal.service';
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalConstants = exports.GlobalMethods = exports.ModalConfig = exports.BarCodeConfig = exports.NiWebcamComponent = void 0;
///* Components */
var ni_webcam_component_1 = require("./components/ni-webcam/ni-webcam.component");
Object.defineProperty(exports, "NiWebcamComponent", { enumerable: true, get: function () { return ni_webcam_component_1.NiWebcamComponent; } });
///* Models */
var common_model_1 = require("./models/common.model");
Object.defineProperty(exports, "BarCodeConfig", { enumerable: true, get: function () { return common_model_1.BarCodeConfig; } });
Object.defineProperty(exports, "ModalConfig", { enumerable: true, get: function () { return common_model_1.ModalConfig; } });
// Others
var javascriptMethods_1 = require("../core/models/javascriptMethods");
Object.defineProperty(exports, "GlobalMethods", { enumerable: true, get: function () { return javascriptMethods_1.GlobalMethods; } });
var javascriptVariables_1 = require("../app-shared/models/javascriptVariables");
Object.defineProperty(exports, "GlobalConstants", { enumerable: true, get: function () { return javascriptVariables_1.GlobalConstants; } });
//# sourceMappingURL=index.js.map