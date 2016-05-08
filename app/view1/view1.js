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
        // attribute name - attribute value
        var values = {"A1": [1, 0], "A2": [1, 0], "A3": [1, 0]};
        // samples for the learning
        var samples = [new Sample([1, 0, 0], 0),
            new Sample([1, 0, 1], 0),
            new Sample([0, 1, 0], 0),
            new Sample([1, 1, 1], 1),
            new Sample([1, 1, 0], 1)];

        var p = 2,
            n = 3;

        //Node structure
        var NodeQuery = function (attribute) {
            this.attribute = attribute;
            this.edge = null;
        };

        var Edge = function (nodeFrom, nodeTo, attributeValue) {
            this.nodeFrom = nodeFrom;
            this.nodeTo = nodeTo;
            this.attributeValue = attributeValue;
        };

        var NodeResult = function (value) {
            this.value = value;
        };

        var entropyInit = entropyB(p / (p + n));

        var tree = getTreeDecision(samples, attributes, samples);

        console.log("DecisionTree");
        console.log(tree);

        function getTreeDecision(samples, attributes, parentSample) {
            var decisionTree = {},
                importanceTmp = null,
                attributeChosen, // A1, A2, A3,
                attributeChosenIndex, // 0, 1, 2
                importanceResults = [];


            // Determine the classification from the parent samples if there is no more sample.
            if (samples.length === 0) {
                return pluralityValue(parentSample);
            }
            // Check if the sample have the same classification.
            var classification = checkClassification(samples);
            if (classification != null) {
                return new NodeResult(classification);
            }
            // Check if the attributes array is empty
            if (Object.keys(attributes).length === 0) {
                return new NodeResult(samples);
            }

            // Retrieve the attribute with the highest 'importance'
            var i = 0;
            for (var attribute in attributes) {
                var imp = importance(attributes[attribute], samples);
                importanceResults.push("Importance for " + attribute + " = " + imp);
                if (importanceTmp == null || importanceTmp < imp) {
                    importanceTmp = imp;
                    attributeChosen = attribute;
                    attributeChosenIndex = i;
                }
                i++;
            }
            $scope.importanceResults = importanceResults;
            $scope.attributeChosen = attributeChosen;

            decisionTree = new NodeQuery(attributeChosen);
            for (var value in values[attributeChosen]) {
                console.log("Retrieving the samples for attribute " + attributeChosen + " : " + value);
                var attributeIndex = attributes[attributeChosen];
                var exs = [];
                for (var index in samples) {
                    var sample = samples[index];
                    if (sample.values[attributeIndex] === parseInt(value)) {
                        exs.push(sample);
                        delete attributes[attributeChosen];
                        var subTree = getTreeDecision(exs, attributes, samples)
                        var edge = new Edge(decisionTree, subTree, value);
                        decisionTree.edge = edge;
                    }
                }
            }

            return decisionTree;
        }


        /**
         * Determinate a classification (the most common) corresponding to the sample
         * @param samples
         */
        function pluralityValue(samples) {
            var classifications = {},
                classificationMax = null;
            for (var sample in samples) {
                if (classifications[sample.output] === null) {
                    classifications[sample.output] = 1;
                } else {
                    classifications[sample.output]++;
                }
            }
            for (var output in classifications) {
                if (classificationMax === null) {
                    classificationMax = classifications[output];
                } else if (classificationMax < classifications[output]) {
                    classificationMax = classifications[output];
                }
            }
            console.log("PluralityValue classification : ", classificationMax);
            return new NodeResult(classificationMax);
        }

        /**
         * Return the classification if all the examples have the same classification
         */
        function checkClassification(samples) {
            var sameClassification = true,
                refSample = samples[0];
            if (samples.length > 1) {
                for (var i = 1; i < samples.length; i++) {
                    if (samples[i].output !== refSample.output) {
                        sameClassification = false;
                    }
                }
            }

            return (sameClassification ? refSample.output : null);
        }

        /**
         * Calculate the importance with samples for a corresponding attribute
         * @param attributeIndex
         * @param samples
         * @returns {number} - importance
         */
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