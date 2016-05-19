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

        $scope.samples = samples;
        $scope.attributes = attributes;

        var p = 2,
            n = 3;

        //Node structure
        var NodeQuery = function (attribute) {
            this.attribute = attribute;
            this.edge = [];
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
        var rootNode = getTreeDecision(samples, attributes, samples);
        var sampleToTest = samples[0];
        var obj = getResultFromSample(rootNode, sampleToTest, []);
        var result = obj[0];
        var path = obj[1];

        console.log("DecisionTree");
        console.log(rootNode);
        console.log("Result for ", sampleToTest, ' -> ', result);

        var space = 100;
        var xStart = 1;
        var width = 40;
        var height = 20;

        var paper = Raphael(300, 300, 500, 500);
        Raphael.el.blue = function () {
            this.attr({fill: "#87CEFA"});
        };

        buildGraph(rootNode, 1, 1, path);

        function buildGraph(rootNode, depth, x, path) {

            var xGraph = x * (space * 2);
            var yGraph = depth * space;
            var nodeView = paper.ellipse(xGraph, yGraph, width, height);

            if (rootNode instanceof NodeQuery) {
                paper.text(xGraph, yGraph, rootNode.attribute);
                if (path.length !== 0 && path[0] instanceof NodeQuery && path[0].attribute === rootNode.attribute) {
                    nodeView.blue();
                    path.shift();
                }
            } else {
                paper.text(xGraph, yGraph, rootNode.value);
                if (path.length !== 0 && path[0] === rootNode.value) {
                    nodeView.blue();
                    path.shift();
                }
            }

            if (rootNode.edge != undefined) {
                var newDepth = depth + 1;
                for (var i = 0; i < rootNode.edge.length; i++) {
                    var edge = rootNode.edge[i];
                    var newXGraph = (i + xStart );
                    buildGraph(edge.nodeTo, newDepth, newXGraph, path);
                    var pathDim = "M" + addRadius(xGraph, height) + " " + addRadius(yGraph, width)
                        + "L" + removeRadius((newXGraph * space * 2), height) + " " + removeRadius((newDepth * space), width);
                    console.log(pathDim);
                    var path = paper.path(pathDim);
                    path.attr({
                        'arrow-end': 'classic-wide-long',
                        'stroke': '#87CEFA',
                        'stroke-width': 3
                    });
                }
            }
        }

        function removeRadius(position, diameter) {
            return position - (diameter / 2);
        }

        function addRadius(position, diameter) {
            return position + (diameter / 2);
        }

        function getResultFromSample(rootNode, sample, path) {
            var result = null;

            if (rootNode instanceof NodeQuery) {
                path.push(rootNode);
                var currentAttribute = rootNode.attribute;
                var attributeIndex = attributes[currentAttribute];
                var valueAttribute = sample.values[attributeIndex];
                for (var i = 0; i < rootNode.edge.length && result === null; i++) {
                    var edge = rootNode.edge[i];
                    if (parseInt(edge.attributeValue) === valueAttribute) {
                        if (edge.nodeTo instanceof NodeResult) {
                            result = edge.nodeTo.value;
                            path.push(result);
                        } else if (edge.nodeTo instanceof NodeQuery) {
                            result = getResultFromSample(edge.nodeTo, sample);
                        }
                    }
                }
            }

            return [result, path];
        }

        function getTreeDecision(samples, attributes, parentSample) {
            var decisionRootNode = {},
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

            decisionRootNode = new NodeQuery(attributeChosen);
            for (var value in values[attributeChosen]) {
                console.log("Retrieving the samples for attribute " + attributeChosen + " : " + value);
                var attributeIndex = attributes[attributeChosen];
                var exs = [];
                for (var index in samples) {
                    var sample = samples[index];
                    if (sample.values[attributeIndex] === parseInt(value)) {
                        exs.push(sample);
                    }
                }
                var attributesCopy = JSON.parse(JSON.stringify(attributes));
                delete attributesCopy[attributeChosen];
                var subTree = getTreeDecision(exs, attributesCopy, samples)
                var edge = new Edge(decisionRootNode, subTree, value);
                decisionRootNode.edge.push(edge);
            }

            return decisionRootNode;
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