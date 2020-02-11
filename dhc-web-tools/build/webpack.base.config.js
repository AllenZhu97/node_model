const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin'); 

module.exports = {
    entry:  {
        main:   path.join(__dirname, '../lib/index.js')
    },//入口文件
    output: {
        path: path.join(__dirname, '../dist'),//打包后的文件存放的地方
        filename: 'dhcwebtools.js'//打包后输出文件的文件名
    },
    module: {
		
        loaders: [	
            { 
                test: /\.js$/,
                loader: 'happypack/loader?id=happybabel',
                exclude: /node_modules/
            },
            {
                test: require.resolve('jquery'),  // 此loader配置项的目标是NPM中的jquery
                loader: 'expose-loader?$!expose-loader?jQuery', // 先把jQuery对象声明成为全局变量`jQuery`，再通过管道进一步又声明成为全局变量`$`
            }
        ]
    } 
};