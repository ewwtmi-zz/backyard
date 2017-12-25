// ***********************************************
// Gulpfile template
// dev :
// localhost :
// ***********************************************


// -----------------------------------------------
// plugin
// -----------------------------------------------
var gulp = require('gulp');

plugins = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'gulp.*'],
	replaceString: /\bgulp[\-.]/
});

var browserSync = require('browser-sync').create();


// -----------------------------------------------
// Directory settings
// -----------------------------------------------
var dir_root = '../';
var dir_css = '../css';
var dir_js = '../js';
var dir_sass = '../_dev/sass';
var dir_pug = '../_dev/pug';


// -----------------------------------------------
// browser-sync : Default task
// -----------------------------------------------
gulp.task('browser-sync', function() {
	browserSync.init({
		proxy: 'xxxxx-local',
		ghostMode: false,
		// ghostMode: {
		// 	clicks: true,
		// 	forms: true,
		// 	scroll: false
		// },
		port: 7777
	});
});


// -----------------------------------------------
// Sass : Default task
// -----------------------------------------------
gulp.task('sass', function(){
	return gulp.src(dir_sass + '/**/*.scss')
	.pipe(plugins.cached('sass'))

	.pipe(plugins.plumber({
		errorHandler: plugins.notify.onError('<%= error.message %>')
	}))

	.pipe(plugins.sass({outputStyle: 'expanded'}))
	// .pipe(plugins.sass({outputStyle: 'nested'}))

	.pipe(plugins.autoprefixer({
		browsers: ['last 2 version', 'ie >= 7', 'iOS >= 7', 'Android >= 4'],
		cascade: false
	}))

	// .pipe(plugins.cssbeautify({
	// 	indent: '	',
	// 	openbrace: 'end-of-line',    // or separate-line
	// 	autosemicolon: true
	// }))

	// .pipe(plugins.csscomb())
	.pipe(plugins.csscomb('.csscomb.json'))

	.pipe(gulp.dest(dir_css))
	.pipe(browserSync.reload({stream:true}));
});


// -----------------------------------------------
// pug : "gulp pug"
// -----------------------------------------------
gulp.task('pug', () => {
	return gulp.src([
		dir_pug + '/**/*.pug',
		'!' + dir_pug + '/**/_*.pug'
	])

	.pipe(plugins.plumber({
		errorHandler: plugins.notify.onError('<%= error.message %>')
	}))

	.pipe(plugins.pug({
		pretty: true
	}))

	.pipe(gulp.dest(dir_root));
});


// -----------------------------------------------
// htmlhint : "gulp htmlhint"
// -----------------------------------------------
gulp.task('htmlhint', function() {
	console.log('--------- HTML lint ----------');

	gulp.src(dir_root + 'products/index.html')
		.pipe(plugins.htmlhint())
		.pipe(plugins.htmlhint.reporter());
});


// -----------------------------------------------
// csslint : "gulp csslint"
// -----------------------------------------------
gulp.task('csslint', function() {
	console.log('--------- CSS lint ----------');

	gulp.src([
		dir_css + '/products/style.css',
		'!' + dir_css + '/**/*.min.css'
	])

	// .pipe(plugins.csslint())
	.pipe(plugins.csslint('csslintrc.json'))
	.pipe(plugins.csslint.reporter());
});


// -----------------------------------------------
// jshint : "gulp jshint"
// -----------------------------------------------
gulp.task('jshint', function() {
	console.log('--------- JS lint ----------');

	return gulp.src([
		dir_js + '/products/function.js',
		'!' + dir_js + '/**/*.min.js'
	])

	.pipe(plugins.jshint())
	// .pipe(plugins.jshint('jshintrc.json'))
	// .pipe(plugins.jshint.reporter());

	.pipe(plugins.notify(function (file) {
		if (file.jshint.success) {
			return false;
		}
		var errors = file.jshint.results.map(function (data) {
			if (data.error) {
				return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
			}
		}).join("\n");
		return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
	}));
});


// -----------------------------------------------
// for reload : Default task
// -----------------------------------------------
gulp.task('html', function(){
	gulp.src(dir_root + '**/*.html')

	.pipe(plugins.plumber({
		errorHandler: plugins.notify.onError('<%= error.message %>')
	}))

	.pipe(browserSync.reload({stream:true}));
});


// -----------------------------------------------
// styleguide : "gulp kss"
// -----------------------------------------------
gulp.task('kss', function() {
	console.log('--------- Styleguide ----------');

	gulp.src(dir_sass + '/**/*.scss')
	.pipe(plugins.kss())
	.pipe(gulp.dest('../_dev/styleguide/'))

	.pipe(plugins.notify('Complete!'));
});


// -----------------------------------------------
// cssmin : "gulp cssmin"
// -----------------------------------------------
gulp.task('cssmin', function() {
	console.log('--------- CSS minify ----------');

	gulp.src([
		dir_css + '/style.css',
		'!' + dir_css + '/**/*.min.css'
	])

	.pipe(plugins.cssmin())
	.pipe(plugins.rename({
		extname: '.min.css'
	}))

	.pipe(gulp.dest(dir_css));
});


// -----------------------------------------------
// minjs : "gulp jsmin"
// -----------------------------------------------
gulp.task('jsmin', function() {
	console.log('--------- JS minify ----------');

	gulp.src([
		dir_js + '/products/function.js',
		'!' + dir_js + '/**/*.min.js'
	])

	.pipe(plugins.uglify())
	.pipe(plugins.rename({
		extname: '.min.js'
	}))

	.pipe(gulp.dest(dir_js));
});


// -----------------------------------------------
// iconfont : "gulp font"
// -----------------------------------------------
gulp.task('font', function() {
	console.log('--------- Iconfont ----------');

	var fontName = 'myicon';

	gulp.src( '../_dev/iconfont/svg/*.svg' )
		.pipe(plugins.iconfont({ fontName: fontName }))

			.on('codepoints', function(codepoints) {
				var options = {
					className: fontName,
					fontName:  fontName,
					fontPath:  './fonts/',
					glyphs: codepoints
				};

				gulp.src( '../_dev/iconfont/template/template.css' )
					.pipe(plugins.consolidate('lodash', options))
					.pipe(plugins.rename({ basename: fontName }))
					.pipe(gulp.dest('../_dev/iconfont/'));

				gulp.src('../_dev/iconfont/template/template.html')
					.pipe(plugins.consolidate('lodash', options))
					.pipe(plugins.rename({ basename: fontName }))
					.pipe(gulp.dest('../_dev/iconfont/'));
			})

		.pipe(gulp.dest('../_dev/iconfont/fonts'));
});


// -----------------------------------------------
// watch : Default task
// -----------------------------------------------
gulp.task('watch', function(){
	// HTML
	gulp.watch([dir_root + 'products/index.html'], ['html']);

	// pug
	// gulp.watch([dir_pug + '/**/*.pug'], ['pug']);

	// Sass
	gulp.watch([dir_sass + '/**/*.scss'], ['sass']);

	// gulp.watch([dir_root + '/**/*.html'], ['html', 'htmlhint']);
	// gulp.watch([dir_css + '/**/*.css'], ['html', 'csslint']);
	// gulp.watch([dir_js + '/**/*.js'], ['html', 'jshint']);

	// minify
	// gulp.watch([dir_css + '/company/style.css'], ['cssmin']);
	// gulp.watch([dir_js + '/function.js'], ['jsmin']);

	// Styleguide
	// gulp.watch([dir_sass + '/**/*.scss'], ['kss']);
});


// -----------------------------------------------
// Default task : "gulp"
// -----------------------------------------------
gulp.task('default', [
	'watch',
	'browser-sync'
]);
