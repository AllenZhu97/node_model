function transfer (data, instance){
    var data2 = data;
    const instance2 = instance;
    return new SelfVue(data2, instance2);
};
function SelfVue (data, instance) {
	var self = this;
	self.data = data;
    self.data.instance = instance;
    Object.keys(data).forEach(function(key) {
        self.proxyKeys(key);
    });
    return self;
}

SelfVue.prototype = {
    proxyKeys: function (key) {
        var self = this;
        var instance = self.data.instance;
        Object.defineProperty(self, key, {
            enumerable: false,
            configurable: true,
            get: function proxyGetter() {
            	self.data[key] = instance.executeMethod(key,'getValue');
                return self.data[key];
            },
            set: function proxySetter(newVal) {
                self.data[key] = newVal;
                instance.executeMethod(key,'setValue',newVal);
            }
        });
    },
    loadData:function(){
    	var self = this;
    	var instance = self.data.instance;
    	for(var key in self.data){
    		self.data[key] = instance.executeMethod(key,'getValue');
    	}
    }
    
}
export {
	transfer
}