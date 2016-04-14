'use strict';

angular.module('myApp.view1', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'View1Ctrl'
        });
    }])

    .controller('View1Ctrl', ['$scope', function ($scope) {
        $scope.attributesImportance = [];

        var Sample = function (attributesValue, output) {
            this.values = attributesValue;
            this.output = output;
        };

        // attribute name - attribute index
        var attributes = {"A1": 0, "A2": 1, "A3": 2};

        var samples = [new Sample([1, 0, 0], 0),
            new Sample([1, 0, 1], 0),
            new Sample([0, 1, 0], 0),
            new Sample([1, 1, 1], 1),
            new Sample([1, 1, 0], 1)];

        var p = 2,
            n = 3;

        var entropyInit = entropyB(p / (p + n));

        getTreeDecision(samples, attributes, null);

        function getTreeDecision(samples, attributes, parentSample) {
            var decisionTree = null;

            var importanceTmp = null,
                attributeChosen;

            var importanceResults = [];

            for (var attribute in attributes) {
                var imp = importance(attributes[attribute], samples);

                importanceResults.push("Importance for " + attribute + " = " + imp);
                if (importanceTmp == null || importanceTmp < imp) {
                    importanceTmp = imp;
                    attributeChosen = attribute;
                }
            }

            $scope.importanceResults = importanceResults;
            $scope.attributeChosen = attributeChosen;
            return decisionTree;
        }

        function importance(attributeIndex, samples) {
            var restTmp = 0.0;

            for (var i = 0; i < 2; i++) {
                restTmp += rest(samples, attributeIndex, i);
            }

            return entropyInit - restTmp;

        }

        function rest(samples, attributeIndex, value) {
            var nk = 0,
                pk = 0;

            for (var i = 0; i < samples.length; i++) {
                var sample = samples[i];
                if (sample.values[attributeIndex] === value) {
                    if (sample.output === 1) {
                        pk++;
                    } else {
                        nk++;
                    }
                }
            }

            var a = ((pk + nk) / (p + n)) * entropyB(pk / (nk + pk));
            console.log("Rest for " + attributeIndex + " value " + value + " = " + a);
            return a;
        }

        function entropyB(probability) {
            var entropy = 0;

            if (probability != 1) {
                entropy += (1.0 - probability) * Math.log2(1.0 - probability);
            }

            if (probability != 0) {
                entropy += (probability * Math.log2(probability));
            }

            entropy = -entropy;
            console.log("EntropyB for " + probability + " = " + entropy);
            return entropy;
        }


    }]);