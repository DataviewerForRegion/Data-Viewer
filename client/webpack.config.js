const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");
const MinifyPlugin = require("babel-minify-webpack-plugin");

const extractSass = new ExtractTextPlugin({
	filename: 'style.css'
});

module.exports = {
	entry: './src/js/index.js',
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'bundle.js',
		publicPath: '/static/'
	},
	devtool: '#cheap-source-map',
	module: {
		rules: [
			{
				test: path.join(__dirname, 'src/js'),
				//loader: 'babel-loader',
				exclude: [
          /node_modules/,
          path.join(__dirname, 'src/js/tags'),
         ],
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: ["es2015"]
						}
					},
					{
						loader: "eslint-loader",
					}
				]
			},
			{
				test: path.join(__dirname, 'src/js/tags'),
        use: [
          {
            loader: "tag-loader",
            options: {
              presets: ["es2015-riot"]
            }
          },
          {
            loader: "eslint-loader",
          }
        ]
			},
			{	
				test: /\.scss$/,
				use: extractSass.extract({
					use: [{
						loader: "css-loader"
					}, {
						loader: "sass-loader"
					}],
					fallback: "style-loader"
				})
			},
			{
				test: /\.png$/,
				loader: "url-loader?limit=10000",
			},
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
				loader: "url-loader?limit=10000&mimetype=application/font-woff&name=[hash].[ext]"
			},
			{
				test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: "file-loader" 
			},
		]
	},
	plugins: [
		extractSass,
		//new MinifyPlugin()
	]
};
