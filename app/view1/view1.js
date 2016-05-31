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
        $scope.output = null;
        $scope.indexSample = 0;


        var Sample = function (attributesValue, output) {
            this.values = attributesValue;
            this.output = output;
        };

        // attribute name - attribute index
        var attributes1 = {"A1": 0, "A2": 1, "A3": 2};
        // attribute name - attribute value
        var values1 = {"A1": [1, 0], "A2": [1, 0], "A3": [1, 0]};
        // samples for the learning
        var samples1 = [new Sample([1, 0, 0], 0),
            new Sample([1, 0, 1], 0),
            new Sample([0, 1, 0], 0),
            new Sample([1, 1, 1], 1),
            new Sample([1, 1, 0], 1)];

        var attributes2 = {"A1": 0, "A2": 1, "A3": 2, "A4": 3};
        var values2 = {"A1": [1, 0], "A2": [1, 0], "A3": [1, 0], "A4": [1, 0]};
        var samples2 = [new Sample([1, 0, 0, 0], 0),
            new Sample([1, 0, 1, 0], 0),
            new Sample([1, 0, 1, 1], 0),
            new Sample([0, 1, 0, 0], 1),
            new Sample([0, 1, 0, 1], 0),
            new Sample([1, 1, 1, 0], 1),
            new Sample([1, 1, 1, 1], 1),
            new Sample([1, 1, 0, 1], 1)];

        var attributes3 = {'I1': 0, 'I2': 1, 'I3': 2, 'I4': 3, 'I5': 4, 'I6': 5};
        var values3 = {'I1': [1, 0], 'I2': [1, 0], 'I3': [1, 0], 'I4': [1, 0], 'I5': [1, 0], 'I6': [1, 0]};
        var samples3 = [new Sample([1, 0, 1, 0, 0, 0], 1),
            new Sample([1, 0, 1, 1, 0, 0], 1),
            new Sample([1, 0, 1, 0, 1, 0], 1),
            new Sample([1, 1, 0, 0, 1, 1], 1),
            new Sample([1, 1, 1, 1, 0, 0], 1),
            new Sample([1, 0, 0, 0, 1, 1], 1),
            new Sample([1, 0, 0, 0, 1, 0], 0),
            new Sample([0, 1, 1, 1, 0, 1], 1),
            new Sample([0, 1, 1, 0, 1, 1], 0),
            new Sample([0, 0, 0, 1, 1, 0], 0),
            new Sample([0, 1, 0, 1, 0, 1], 0),
            new Sample([0, 0, 0, 1, 0, 1], 0),
            new Sample([0, 1, 1, 0, 1, 1], 0),
            new Sample([0, 1, 1, 1, 0, 0], 0)
        ];


        $scope.samples = samples3;
        $scope.attributes = attributes3;
        $scope.values = values3;

        var p = getNbPositiveOuput($scope.samples),
            n = $scope.samples.length - p;

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
        var rootNode = getTreeDecision($scope.samples, $scope.attributes, $scope.samples);
        var sampleToTest = $scope.samples[0];
        var obj = getResultFromSample(rootNode, sampleToTest, []);
        var result = obj[0];
        var path = obj[1];
        $scope.resultOutput = result;
        $scope.indexSampleAfter = "0";


        console.log("DecisionTree");
        console.log(rootNode);
        console.log("Result for ", sampleToTest, ' -> ', result);

        $scope.getResult = function (index) {
            $scope.indexSample = index;
            var result = getResultFromSample(rootNode, $scope.samples[$scope.indexSample], []);
            $scope.resultOutput = result[0];
            $scope.indexSampleAfter = $scope.indexSample;
            console.log(result[0] + ' for ' + $scope.indexSample);
            var path = result[1];
            //removing all the shapes
            for (var i = 0; i < figures.length; i++) {
                figures[i].remove();
            }
            figures = [];
            buildGraph(rootNode, 1, 1, path);
        };


        var space = 100;
        var xStart = 1;
        var width = 40;
        var height = 20;
        var figures = [];

        var paper = Raphael(300, 300, 1000, 1000);
        Raphael.el.blue = function () {
            this.attr({fill: "#87CEFA"});
        };

        buildGraph(rootNode, 1, 1, path);

        function buildGraph(rootNode, depth, x, path) {

            var xGraph = x * (space * 2);
            var yGraph = depth * space;
            var nodeView = paper.ellipse(xGraph, yGraph, width, height);
            figures.push(nodeView);

            if (rootNode instanceof NodeQuery) {
                var text = paper.text(xGraph, yGraph, rootNode.attribute);
                figures.push(text);
                if (path.length !== 0 && path[0] instanceof NodeQuery && path[0].attribute === rootNode.attribute) {
                    nodeView.blue();
                    path.shift();
                }
            } else {
                var text = paper.text(xGraph, yGraph, rootNode.value);
                figures.push(text);
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
                    var x1 = addRadius(xGraph, height);
                    var y1 = addRadius(yGraph, width);
                    var x2 = removeRadius((newXGraph * space * 2), height);
                    var y2 = removeRadius((newDepth * space), width);
                    var pathDim = "M" + x1 + " " + y1 + "L" + x2 + " " + y2;
                    var pathLine = paper.path(pathDim);
                    pathLine.attr({
                        'arrow-end': 'classic-wide-long',
                        'stroke-width': 1.5
                    });
                    var labelPath = paper.text((x1 + x2) / 2 + 15, (y1 + y2) / 2 + 15, edge.attributeValue);
                    figures.push(pathLine);
                    figures.push(labelPath);
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
                var attributeIndex = $scope.attributes[currentAttribute];
                var valueAttribute = sample.values[attributeIndex];
                for (var i = 0; i < rootNode.edge.length && result === null; i++) {
                    var edge = rootNode.edge[i];
                    if (parseInt(edge.attributeValue) === valueAttribute) {
                        if (edge.nodeTo instanceof NodeResult) {
                            result = edge.nodeTo.value;
                            path.push(result);
                        } else if (edge.nodeTo instanceof NodeQuery) {
                            result = getResultFromSample(edge.nodeTo, sample, path)[0];
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
            for (var value in $scope.values[attributeChosen]) {
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

        function getNbPositiveOuput(samples) {
            var result = 0;
            for (var i = 0; i < samples.length; i++) {
                var sample = samples[i];
                if (sample.output === 1) {
                    result++;
                }
            }
            return result;
        }

    }]);