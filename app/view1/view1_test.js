'use strict';

describe('myApp.view1 module', function () {

    beforeEach(module('myApp.view1'));

    describe('view1 controller', function () {

        it('should ....', inject(function ($controller) {
            //spec body
            var view1Ctrl = $controller('View1Ctrl');
            expect(view1Ctrl).toBeDefined();
            //expect(1 - ( (2 / 12) * view1Ctrl.entropyB(0) + (4 / 12) * view1Ctrl.entropyB(1) + (6 / 12) * view1Ctrl.entropyB(2 / 6) )).to.be.equals(0.5408520829727552);
        }));

    });
});