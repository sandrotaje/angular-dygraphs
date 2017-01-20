angular.module("angular-dygraphs", [])
    .directive("dygraphs", function ($timeout) {
        return {
            restrict: "A",
            scope: {
                data: "=",
                options: "=?",
                synchronize: "=?"
            },
            require: '?^^dygraphsSynchronize',
            link: function (scope, element, attr, ctrl) {
                var graph = null;

                function fromCssToNum(val) {
                    return +val.match(/^([0-9]+).*$/)[1];
                }

                function resize() {
                    var parent = element.parent()[0];
                    var compStyle = window.getComputedStyle(parent);
                    var width = fromCssToNum(compStyle.width);
                    var height = fromCssToNum(compStyle.height);
                    var vertPadding = fromCssToNum(compStyle.paddingTop) + fromCssToNum(compStyle.paddingBottom);
                    var horPadding = fromCssToNum(compStyle.paddingLeft) + fromCssToNum(compStyle.paddingRight);
                    graph && graph.resize(width - horPadding, height - vertPadding);
                }

                scope.$watch(function () {
                    var parent = element.parent()[0];
                    return [parent.offsetWidth, parent.offsetHeight].join('x');
                }, function () {
                    resize();
                })

                scope.$watch('data', function () {
                    graph && graph.destroy();
                    if (scope.data && scope.data.length > 0) {
                        graph = new Dygraph(element[0], scope.data, scope.options);
                        ctrl && ctrl.toggleDygraph(attr.id, graph);
                        resize();
                    }
                }, true);

                scope.$watch('options', function () {
                    graph && graph.updateOptions(scope.options);
                }, true);
            }
        };
    })
    .directive("dygraphsSynchronize", function () {
        return {
            restrict: "A",
            controller: function ($scope) {

                var ctrl = this;
                ctrl.sync = null;
                ctrl.syncMap = {};

                ctrl.toggleDygraph = function (id, d) {
                    if (ctrl.sync) {
                        try {
                            ctrl.sync.detach();
                        } catch (e) { };
                    }


                    ctrl.syncMap[id] = d;
                    var syncList = Object.keys(ctrl.syncMap).map(function (el) {
                        return ctrl.syncMap[el];
                    });
                    if (syncList.length > 1) {
                        ctrl.sync = Dygraph.synchronize(syncList, {
                            zoom: true,
                            range: false
                        });
                    }
                }
            }
        };
    })
    ;