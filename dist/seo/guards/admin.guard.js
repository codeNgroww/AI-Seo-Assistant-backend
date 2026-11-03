"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGuard = void 0;
const common_1 = require("@nestjs/common");
let AdminGuard = class AdminGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const userRole = request.headers['x-user-role'] || 'ADMIN';
        if (userRole !== 'ADMIN' && userRole !== 'CONTENT_EDITOR') {
            throw new common_1.UnauthorizedException(`Role "${userRole}" is not authorized. This endpoint is strictly restricted to ADMIN or CONTENT_EDITOR.`);
        }
        request.user = {
            id: request.headers['x-user-id'] || 'admin_usr_01',
            name: request.headers['x-user-name'] || 'Space42 Admin',
            role: userRole
        };
        return true;
    }
};
exports.AdminGuard = AdminGuard;
exports.AdminGuard = AdminGuard = __decorate([
    (0, common_1.Injectable)()
], AdminGuard);
//# sourceMappingURL=admin.guard.js.map