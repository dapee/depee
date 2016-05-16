	'use strict';

var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var wiredep = require('wiredep').stream;

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

/*
	版本控制
 */
var pkg = require('./package.json');
var config = {
	base:'app',
	dist:'dist/'+pkg.version,
	proxyUrl:'http://10.118.200.112:8102/'
};

gulp.task('sass',function(){
	return gulp.src('app/scss/*.scss')
	    .pipe($.plumber())
	    .pipe($.sourcemaps.init())
	    .pipe($.sass.sync({
	      outputStyle: 'expanded',
	      precision: 10,
	      includePaths: ['.']
	    }).on('error', $.sass.logError))
	    //.pipe($.autoprefixer({browsers: ['last 1 version']}))
	    .pipe($.sourcemaps.write())
	    .pipe(gulp.dest('app/styles'))
	    .pipe(reload({stream: true}));
});


function lint(files, options) {
  return function() {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
var testLintOptions = {
  env: {
    mocha: true
  }
};
gulp.task('lint', lint('app/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));


gulp.task('home',function(){
	var assets = $.useref({searchPath: ['.tmp', 'app', '.']});
	return gulp.src('app/*.html')
	    .pipe(assets)
	    .pipe($.if('*.js', $.ngAnnotate()))
	    .pipe($.if('*.js', $.uglify()))
	    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
	    //.pipe(assets.restore()) // V2.0版本写法，V3.0不支持
	    .pipe($.useref())
	    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
	    .pipe(gulp.dest(config.dist));
});


gulp.task('html',function(){
	return gulp.src(['app/**/*.html','!app/*.html'])
    .pipe($.minifyHtml({conditionals:true,loose:true}))
    .pipe(gulp.dest(config.dist))
    .pipe(reload({stream: true}));
});

gulp.task('images',function(){
	return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest(config.dist+'/images'));
});

gulp.task('fonts',function(){
	return gulp.src(require('main-bower-files')({
			filter: '**/*.{eot,svg,ttf,woff,woff2}'
		}).concat('bower_components/bootstrap-sass/assets/fonts/**/*'))
	    .pipe(gulp.dest('app/fonts'))
	    .pipe(gulp.dest(config.dist+'/fonts'));
});


gulp.task('wiredep',function(){
	gulp.src('app/scss/*.scss')
        .pipe(wiredep({
        	directory: './bower_components/',
            ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest('app/scss'));

    gulp.src('app/*.{html,htm}')
        .pipe(wiredep({
            directory: './bower_components/',
            //exclude: ['ionic'],
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('app'));
});




//var proxyMiddleware = require('http-proxy-middleware');
//var proxy = proxyMiddleware('/api', {target: config.proxyUrl});

gulp.task('serve',function(){
	browserSync({
	    notify: false,
	    port: 9000,
	    server: {
			baseDir: ['app'],
			routes: {
				'/bower_components': 'bower_components'
			}
	    }/*,
	    middleware: [proxy]*/
	});

	gulp.watch([
	    'app/**/*.html',
	    'app/scripts/**/*.js',
	    'app/images/**/*',
	    'app/fonts/**/*',
	    'app/styles/**/*'
	]).on('change', reload);

	gulp.watch('app/scss/**/*.scss', ['sass']);
	gulp.watch('app/fonts/**/*', ['fonts']);
	gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist',function(){
	browserSync({
	    notify: false,
	    port: 9001,
	    server: {
			baseDir: [config.dist]
	    }
	});

	gulp.watch([
	    config.dist+'/**/*.html',
	    config.dist+'/scripts/**/*.js',
	    config.dist+'/images/**/*',
	    config.dist+'/fonts/**/*',
	    config.dist+'/styles/**/*'
	]).on('change', reload());
});

gulp.task('build:production', function() {
  return gulp.src(config.dist+'/**/*').pipe($.size({title: 'build', gzip: true}));
});
gulp.task('build',$.sequence('lint',['images','fonts','html','home'],'build:production'));

gulp.task('default', ['clean'],function(){
	gulp.start('serve');
});


