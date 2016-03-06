(function() {
	'use strict';

	angular
		.module('watchwith.resizer')
		.decorator('wwResizer', Resizer);

	Resizer.$inject = ['$log', '$delegate', '$window', '$rootScope', 'VIDEO_TRIGGERS', '$timeout', 'wwPlayer'];

	function Resizer($log, $delegate, $window, $rootScope, VIDEO_TRIGGERS, $timeout, wwPlayer) {

        $delegate.resizeElement = function(playerRect, stageElement, wwPlayer) {
            if (playerRect && stageElement) {
                var wwParent = document.querySelector('watchwith').offsetParent;
                var wwParentBoundingObj = wwParent.getBoundingClientRect();
                var rect = playerRect;
                var isFullScreen = wwPlayer.isFullScreen();
                if (isFullScreen === true || $delegate.isRectEmpty(rect)){
                    rect = wwPlayer.getMediaDimension();
                }

                if (!rect) {
                    $log.debug("[wwResizer] resizeElement cannot determine the size. Returning.");
                    return;
                }

                var element = stageElement;

                // DETECT FULL SCREEN - BECAUSE IN FULL SCREEN WE DON'T APPLY THE PARENT BOUNDING BOX OFFEST.
                var isWindowFullScreen = (($window.fullScreen) || ($window.innerWidth == screen.width && $window.innerHeight == screen.height));
                var top = rect.y;
                var left = rect.x;

                //var isFirefox = $window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

                var safeRegion = wwPlayer.getSafeRegion();

                if(isWindowFullScreen) {

                    if(!safeRegion ){
                        safeRegion = {};
                    }
                    safeRegion.height = screen.width * 9 / 16;
                    safeRegion.y = (screen.height - safeRegion.height) / 2;
                    safeRegion.x = 0;
                    safeRegion.width = screen.width;


                } else {
                    top = top - wwParentBoundingObj.top;
                    left = left - wwParentBoundingObj.left;
                }

                var height = rect.height;
                var width = rect.width;

                if (safeRegion) {
                    // Adjust the region to be confined in the safe region.

                    if (safeRegion.width < width) {
                        width = safeRegion.width;
                    }
                    if (safeRegion.height < height) {
                        height = safeRegion.height;
                    }
                    if (safeRegion.x > 0) {
                        left += safeRegion.x;
                    }
                    if (safeRegion.y > 0) {
                        top += safeRegion.y;
                    }
                }


                $delegate.applySizeCssToStageEl(element, left, top, width, height);
                $delegate.applyCssClasses(element, wwPlayer, width, height);

                if(isWindowFullScreen) {
                    stageElement.addClass('ww-fullscreen');
                } else {
                    stageElement.removeClass('ww-fullscreen');
                }

            } else {
                $log.debug("[wwResizer] resizeElement ignoring " + playerRect + ", " + stageElement);
            }
        }

        /**
         * @name rescale
         * @desc Adjusts the font size of the stage element according to the width. Child elements should use em units to scale.
         */
        $delegate.rescale = function ( ) {
            // Scale the content by adjusting the font size
            var width = $delegate.getPlayerElRegion().width;
            var fontSize = width / 58.18;
            if (fontSize < 5) {
                fontSize = 5;
            }
            $delegate.getStageElement().css('font-size', fontSize + 'px');
        }

        /**
         * @name activateRescaler
         * @desc sets a listener on resize to call the rescale function
         *       periodically calls the resize method at launch to insure a correct initial scale
         *
         */
        $delegate.activateRescaler = function() {
            $rootScope.$on(VIDEO_TRIGGERS.PLAYER_REGION_CHANGED, $delegate.rescale);

            // Rescale the wrapper periodically at start
            var rescaleTimes = [500, 1000, 2500, 5000];
            var i = 0;
            for (i = 0; i < rescaleTimes.length; i++) {
                $timeout(function () {
                    if(wwPlayer){
                        $delegate.resizeElement($delegate.getPlayerElRegion(), $delegate.getStageElement(), wwPlayer);
                    }
                    $delegate.rescale();
                }, rescaleTimes[i]);
            }

        }


        $delegate.fullScreenChange = function (){
            $timeout( $delegate.resizeAfterFullscreen, 500);
            $timeout( $delegate.resizeAfterFullscreen, 1000);
            $timeout( $delegate.resizeAfterFullscreen, 1500);
            $timeout( $delegate.resizeAfterFullscreen, 2000);
            $timeout( $delegate.resizeAfterFullscreen, 3000);
        }
        $delegate.resizeAfterFullscreen = function(){
            $delegate.resizeElement($delegate.getPlayerElRegion(), $delegate.getStageElement(), wwPlayer);
            $delegate.rescale();

        }
        angular.element(document).on ('mozfullscreenchange webkitfullscreenchange fullscreenchange', $delegate.fullScreenChange);

        $delegate.activateRescaler();

        angular.element($window).on('resize', function() { $delegate.resizeElement($delegate.getPlayerElRegion(), $delegate.getStageElement(), wwPlayer); $delegate.rescale(); } );


        return( $delegate );
	}
})();