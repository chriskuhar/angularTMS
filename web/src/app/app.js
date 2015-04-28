angular.module( 'ngBoilerplate', [
  'templates-app',
  'templates-common',
  'ngBoilerplate.home',
  'ngBoilerplate.about',
  'ui.router',
  'jsTree.directive',
  'ui.ace'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise( '/home' );

  $stateProvider
    .state('editor', {
        url: "/editor/{id}",
        templateUrl: "/tpl/editor",
        controller: 'EditCtrl'
    })
})

.run( function run () {
})

.service('jsTreeNav', function() {

    var jsTree = null;

    this.setJsTree = function(_jsTree) {
        jsTree = _jsTree;
    };

    this.getJsTree = function() {
        return jsTree;
    };

})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, $http, $state, jsTreeNav ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      // Set page title, but not now need to get proper scope / nesting
      //
    //if ( angular.isDefined( toState.data.pageTitle ) ) {
    //  $scope.pageTitle = toState.data.pageTitle + ' | ngBoilerplate' ;
    //}
  });

    $scope.readyCB = function(e, data) {
        console.log("DEBUG readyCB");
    }

    $scope.clickCB = function(e, data) {
        console.log("DEBUG clickCB");
    }

    $scope.changedCB = function(e, data) {

        // do nothing of no data
        //
        if((typeof data.node == 'undefined') || (typeof data.node.id == 'undefined')) {
            return;
        }

        //jsTreeNav.setJsTree(data.instance);
        jsTreeNav.setJsTree(data);

        console.log('changedCB');
        console.log('e : ', e);
        console.log('data : ', data);
        
        console.log('processed data >>> ');
        var i, j, r = [];
        for (i = 0, j = data.selected.length; i < j; i++) {
          r.push(data.instance.get_node(data.selected[i]).text);
        }
        
        $state.go('editor', {'id':data.node.id});
    }

})

.controller( 'EditCtrl', function AppCtrl ( $scope, $location, $http, $stateParams, jsTreeNav) {
    console.log("DEBUG EditCtrl id:" + $stateParams.id);
    $scope.id = $stateParams.id;

    $scope.aceLoaded = function(_editor) {
        $scope.aceEditor = _editor;
        $http.get("/templates?id=" + $stateParams.id).success(function(data) {
            $scope.route = data.route;
            $scope.description = data.description;
            $scope.group = data.group;
            $scope.id = data._id;
            var content = "";
            if((typeof data.content != 'undefined') && (data.content != null)) {
                content = atob(data.content);
            }
            //content = "abc123";

            //$scope.content = content;

            _editor.$blockScrolling = "Infinity";

            $scope.aceContent = content;
            //_editor.setValue(content);
            //var _session = _editor.getSession();
            //_session.setValue(content);

        }).error(function(data){
            console.log("Error fetching template");
        });
    };

    $scope.aceChanged = function(e) {

    }

    $scope.CopyTemplate = function() {
        $scope.route = "Copy of " + $scope.route;
        $scope.id = 0;
    }

    $scope.DeleteTemplate = function() {
        if((typeof $scope.id != undefined) && ($scope.id != null) && ($scope.id != 0)) {
            $http.delete("/templates?id=" + $scope.id).success(function(data) {
                 if(data.success == true) {
                     console.log("Success, template deleted");
                 } else {
                     console.log("Error, template not deleted");
                 }
            }).error(function(data) {
                 console.log("Error, template not deleted");
            });
        }
    }

    // click event to save form
    // 
    $scope.SaveTemplate = function() {
        var id = $scope.id;
        var content = btoa($scope.aceEditor.getSession().getValue());
        var route = $scope.route;
        var description = $scope.description;
        var group = $scope.group;

        var data = { 
            route: route,
            description: description,
            group: group,
            content: content
        };

        if((typeof $scope.id != 'undefined') && ($scope.id != null) && ($scope.id != 0)) {
            // Update Template
            //
            //
            data.id = $scope.id;

            var dataOut = JSON.stringify(data);

            $http.put("/templates", dataOut).success(function(data) {
                if(data.success == true) {
                    console.log("Success, template saved");
                    //var treeNav = jsTreeNav.getJsTree();
                    //var node = $.jstree._focused().get_selected();
                    //$.jstree._focused().rename_node(node, $scope.route);
                    $("#" + $scope.id).jstree('rename_node', $scope.route);
                    //treeNav.refresh();
                } else {
                    console.log("Error, template not saved");
                }
            }).error(function(data) {
                console.log("Error, template not saved");
            });

            console.log("updateTemplate Edit Template");
        } else {
            // New Template
            //
            var dataOut = JSON.stringify(data);

            $http.post("/templates", dataOut).success(function(data) {
                if(data.success == true) {
                    console.log("Success, template saved");
                    var treeNav = jsTreeNav.getJsTree();
                    //treeNav.refresh();
                } else {
                    console.log("Error, template not saved");
                }
            }).error(function(data) {
                console.log("Error, template not saved");
            });

            console.log("submitTemplate Edit Template");
        }
    };

})
;

