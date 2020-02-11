const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
var HappyPack = require('happypack');
const os = require('os');
var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.base.config.js');
 
module.exports = merge(webpackBaseConfig, {
    plugins:[
        
        new webpack.optimize.UglifyJsPlugin({
            parallel: true,
            compress: {
                warnings: false
            }
        }),
        new HappyPack({
            id: 'happybabel',
            loaders: ['babel-loader'],
            threadPool: happyThreadPool,
            verbose: true
        }),
        new CleanWebpackPlugin(
            ['*.js'], //匹配删除的文件
            {
                root: path.join(__dirname, '../dist'),//根目录
                verbose:  true,//开启在控制台输出信息
                dry:      true //启用删除文件
            }
        )
    ]
});