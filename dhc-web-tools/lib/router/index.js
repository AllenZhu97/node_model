import message from '../message';
/**
 * 路由组件
 */
export default {
    routers: [],
    initRouters: function(routers) {
        this.routers = routers;
    },
    getRouter: function(path) {
        const func = this.routers[path];
        if (func) {
            return this.routers[path];
        } else {
            message.error(path + ',页面不存在');
        }
    }
}