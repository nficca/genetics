angular.module('Genetics', [])
    .controller('GeneticsController', function($scope) {
        $scope.target = "Hello World";
        $scope.simulating = false;
        $scope.advancing = false;
        $scope.population = [];
        $scope.best = null;

        $scope.Start = function() {
            if ($scope.simulating) return;

            $scope.simulating = true;

            var pop = new Population($scope.target, 400, 0.01);
            pop.CalcFitness();

            $scope.population = pop;
        };

        $scope.Reset = function() {
            $scope.simulating = false;
            $scope.advancing = false;
            $scope.population = 0;
            $scope.best = null;
        };

        $scope.AdvanceGeneration = function() {
            if (!$scope.simulating || $scope.advancing) return;

            $scope.advancing = true;

            $scope.population.NormalizeFitness();
            $scope.population.Breed();

            $scope.population.CalcFitness();

            $scope.advancing = false;
        };

        $scope.AdvanceXGenerations = function(x) {
            while (x > 0) {
                $scope.AdvanceGeneration();
                x--;
            }
        };

        function Population(target, max, mutationRate) {
            var self = this;

            self.target = target;
            self.max = max;
            self.mutationRate = mutationRate;
            self.best = null;
            self.generations = 0;
            self.totalFitness = 0;
            self.population = [];

            self.Init = function() {
                self.population.length = 0;
                for (var i = 0; i < self.max; ++i) {
                    self.population.push(new Subject(target.length));
                }
            };

            self.CalcFitness = function() {
                self.totalFitness = 0;
                self.best = null;
                for (var i = 0; i < self.population.length; ++i) {
                    self.population[i].CalcFitness(self.target);
                    self.totalFitness += self.population[i].fitness;
                    if (self.best === null || self.population[i].fitness > self.best.fitness) {
                        self.best = self.population[i];
                    }
                }

                // Sort by descending fitness
                self.population.sort(function(a, b) {
                    return b.fitness - a.fitness;
                });

            };

            self.NormalizeFitness = function() {
                // Calc accumulated normalized fitness
                var accumulatedFitness = 0;
                for (var i = 0; i < self.population.length; ++i) {
                    var normalizedFitness = self.population[i].fitness / self.totalFitness;
                    self.population[i].accNormFitness = accumulatedFitness + normalizedFitness;
                    accumulatedFitness += normalizedFitness;
                }
            };

            self.Breed = function() {
                var newPop = [];
                for (var i = 0; i < self.max; ++i) {
                    var valueA = Math.random(),
                        valueB = Math.random(),
                        parentA = -1,
                        parentB = -1;

                    for (var j = 0; j < self.population.length; ++j) {
                        if (parentA === -1 && self.population[j].accNormFitness >= valueA) {
                            parentA = j;
                        }
                        if (parentB === -1 && self.population[j].accNormFitness >= valueB) {
                            parentB = j;
                        }
                        if (parentA > -1 && parentB > -1) break;
                    }

                    if (parentA === -1) parentA = self.population.length - 1;
                    if (parentB === -1) parentB = self.population.length - 1;

                    var child = self.population[parentA].Crossover(self.population[parentB]);

                    child.Mutate(self.mutationRate);

                    newPop.push(child);
                }

                self.population = newPop;
                self.generations++;
            };

            self.Init();
        }

        function Subject(length) {
            var self = this;

            self.length = length;
            self.data = "";
            self.fitness = 0;
            self.accNormFitness = 0;

            self.Init = function() {
                for (var i = 0; i < self.length; ++i) {
                    self.data += String.fromCharCode(Math.random() * 95 + 32);
                }
            };

            self.CalcFitness = function(target) {
                var score = 0;
                for (var i = 0; i < self.data.length && i < target.length; ++i) {
                    score += self.data[i] === target[i] ? 1 : 0;
                }
                self.fitness = score;
            };

            /**
             * Creates a child with other
             *
             * @param {Subject} other
             * @returns {Subject}
             */
            self.Crossover = function(other) {
                var mid = Math.floor(Math.random() * self.data.length);

                var child = new Subject(self.length);

                for (var i = 0; i < self.data.length && i < other.data.length; ++i) {
                    child.data = child.data.substr(0, i) + (i <= mid ? self.data[i] : other.data[i]) + child.data.substr(i + 1);
                }

                return child;
            };

            self.Mutate = function(mutationRate) {
                for (var i = 0; i < self.data.length; ++i) {
                    if (Math.random() < mutationRate) {
                        var mutatedChar = String.fromCharCode(Math.random() * 95 + 32);
                        self.data = self.data.substr(0, i) + mutatedChar + self.data.substr(i + 1);
                    }
                }
            };

            self.Init();
        }
    });