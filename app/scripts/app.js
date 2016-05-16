/**
*  Module
*
* Description
*/
// angular.module('depee', [
// 	// 'ngAnimate',
//  //    'ngCookies',
//  //    'ngResource',
//  //    'ngSanitize',
//  //    'ngTouch',
//     'ui.router'
// ]).controller('appCtrl', ['$scope', function($scope){
// 	$scope.showPanel = function(panel){
// 		$('.tab-panel').hide();
// 		$(panel).show();
// 	};
// }]);


;(function($){
	$('.tab-panel').eq(0).show();
	$('.tab-bar').on('click','li',function(e){
		if($(e.target).hasClass('active')){
			return;
		}
		$('.tab-bar').find('li').removeClass('active');
		$(this).addClass('active');
		$('.tab-bar').parent().find('.tab-panel').hide();
		$('#'+$(this).attr('data-id')).show();
	});
}(jQuery))