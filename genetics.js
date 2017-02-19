angular.module('Genetics', [])
    .controller('GeneticsController', function($scope) {
        $scope.target = "Hello World";
        $scope.simulating = false;
        $scope.population = [];
        $scope.best = null;

        $scope.Start = function() {
            $scope.simulating = true;

            var pop = new Population($scope.target, 100, 0.05);
            pop.CalcFitness();

            $scope.population = pop.population;
            $scope.best = pop.best;
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
                    var subject = new Subject(target.length);
                    subject.Init();
                    self.population.push(subject);
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
            };

            /**
             * Sorts each subject by descending fitness and calculates their accumulated normalized
             * fitness value.
             */
            self.NormalizeFitness = function() {
                // Sort by descending fitness
                self.population.sort(function(a, b) {
                    return b.fitness - a.fitness;
                });

                // Calc accumulated normalized fitness
                var accumulatedFitness = 0;
                for (var i = 0; i < self.population.length; ++i) {
                    var normalizedFitness = population[i].fitness / self.totalFitness;
                    population[i].accNormFitness = accumulatedFitness + normalizedFitness;
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

                    for (var j = 0; j < self.population.length; ++i) {
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
                    child.data[i] = i <= mid ? self.data[i] : other.data[i];
                }

                return child;
            };

            self.Mutate = function(mutationRate) {
                for (var i = 0; i < self.data.length; ++i) {
                    if (Math.random() < mutationRate) self.data[i] = String.fromCharCode(Math.random() * 95 + 32);
                }
            }
        }
    });