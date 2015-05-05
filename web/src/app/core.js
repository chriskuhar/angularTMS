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
        controller: 'AppCtrl'
    });
})

.run( function run () {
})

.value('contentTypeOptions', [
        {
            'text': "HTML",
            'contenttype': "text/html"
        },
        {
            'text': "CSS",
            'contenttype': "text/css"
        },
        {
            'text': "JavaScript",
            'contenttype': "application/javascript"
        },
        {
            'text': "JSON",
            'contenttype': "application/json"
        },
        {
            'text': "Image",
            'contenttype': "image/auto-select"
        }
    ])

.service('jsTreeNav', function() {

    var jsTree = null;

    this.setJsTree = function(_jsTree) {
        jsTree = _jsTree;
    };

    this.getJsTree = function() {
        return jsTree;
    };

})

// global access to EditCtrl scope
//
.service('scopeEditCtrl', function() {

    var scope = null;

    this.setScope = function(_scope) {
        scope = _scope;
    };

    this.getScope = function() {
        return scope;
    };

})

.directive('fileOnChange', function() {
      return {
              restrict: 'A',
    link: function (scope, element, attrs) {
              var onChangeFunc = scope.$eval(attrs.fileOnChange);
                    element.bind('change', onChangeFunc);
                        }
  };
})

.controller( 'AppCtrl', function AppCtrl ( $scope, 
                                            $location, 
                                            $http, 
                                            $state, 
                                            jsTreeNav , 
                                            $stateParams, 
                                            scopeEditCtrl,
                                            contentTypeOptions) {

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      // Set page title, but not now need to get proper scope / nesting
      //
    //if ( angular.isDefined( toState.data.pageTitle ) ) {
    //  $scope.pageTitle = toState.data.pageTitle + ' | ngBoilerplate' ;
    //}
  });
    $scope.showAceEditor = true;
    scopeEditCtrl.setScope($scope);

    $scope.readyCB = function(e, data) {
        console.log("DEBUG readyCB");
    };

    $scope.clickCB = function(e, data) {
        console.log("DEBUG clickCB");
    };

    $scope.changedCB = function(e, data) {

        // do nothing of no data
        // or not leaf node
        //
        if((typeof data.node === 'undefined') || 
                (typeof data.node.id === 'undefined') || 
                (data.node.children.length > 0)) {
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
    };

    $scope.treeContextCB = function(e) {
        console.log("treeContextCB");
        // NOTE: these were stolen from jstree.js around line 5211
        //
        // See for list of all possible operations: $.jstree.defaults.contextmenu
        //
        var folder =  {
                "create" : {
                        "separator_before"  : false,
                        "separator_after"   : true,
                        "_disabled"         : false, //(this.check("create_node", data.reference, {}, "last")),
                        "label"             : "Create",
                        "action"            : function (data) {
                            var inst = $.jstree.reference(data.reference),
                                        obj = inst.get_node(data.reference);
                            
                            inst.create_node(obj, {}, "last", function (new_node) {
                                setTimeout(function () { inst.edit(new_node); },0);
                            });
                        }
                }

        };
        var file = {
            "rename" : {
                            "separator_before"  : false,
                            "separator_after"   : false,
                            "_disabled"         : false, //(this.check("rename_node", data.reference, this.get_parent(data.reference), "")),
                            "label"             : "Rename",
                            /*
                            "shortcut"          : 113,
                            "shortcut_label"    : 'F2',
                            "icon"              : "glyphicon glyphicon-leaf",
                            */
                            "action"    : function (data) {
                                var inst = $.jstree.reference(data.reference),
                                obj = inst.get_node(data.reference);
                            
                                inst.edit(obj);
                    }
            },
            "remove" : {
                    "separator_before"  : false,
                    "icon"              : false,
                    "separator_after"   : false,
                    "_disabled"         : false, //(this.check("delete_node", data.reference, this.get_parent(data.reference), "")),
                    "label"             : "Delete",
                    "action"            : function (data) {
                        var inst = $.jstree.reference(data.reference),
                            obj = inst.get_node(data.reference);
                        if(inst.is_selected(obj)) {
                            inst.delete_node(inst.get_selected());
                        }
                        else {
                            inst.delete_node(obj);
                        }
                    }
            }
        };

        // determin menu contents
        // top level Files, no menu
        //
        // TODO: localize "Files" tricky here
        //
        if(e.children.length === 0) {
            return file;
        } if (e.text == "Files") {
            return {};
        }

        return folder;
    };

    $scope.renameNodeCB = function(e, treeData) {
        $scope = scopeEditCtrl.getScope();
        $scope.route = treeData.text;
        $scope.id = treeData.node.id;

        // create new node if it has '_'
        // if it has one it was jstree generated id
        //
        if(treeData.node.id.indexOf('_') > 0) {
            $scope.id = 0;
        }

        var data = { 
            route: $scope.route
        };

        var dataOut = "";
        if((typeof $scope.id !== 'undefined') && ($scope.id != null) && ($scope.id !== 0)) {
            // Update Template
            //
            //
            data.id = $scope.id;

            dataOut = JSON.stringify(data);

            $http.put("/templates", dataOut).success(function(data) {
                if(data.success === true) {
                    console.log("Success, template saved");
                } else {
                    console.log("Error, template not saved");
                }
            }).error(function(data) {
                console.log("Error, template not saved");
            });
        } else {
            dataOut = JSON.stringify(data);

            $http.post("/templates", dataOut).success(function(data) {
                if(data.success === true) {
                    console.log("Success, template saved");
                    treeData.node.id = data.id;
                } else {
                    console.log("Error, template not saved");
                }
            }).error(function(data) {
                console.log("Error, template not saved");
            });

        }

        $state.go('editor', {'id': $scope.id});
    };

    $scope.createNodeCB = function(e, data) {
        console.log("create node");
        $state.go('editor', {'id':0});
    };

    $scope.deleteNodeCB = function(e, data) {
        $scope.id = data.node.id;
        if((typeof $scope.id !== undefined) && ($scope.id != null) && ($scope.id !== 0)) {
            $http['delete']("/templates?id=" + $scope.id).success(function(data) {
                 if(data.success === true) {
                     console.log("Success, template deleted");
                 } else {
                     console.log("Error, template not deleted");
                 }
            }).error(function(data) {
                 console.log("Error, template not deleted");
            });
        }
    };

    console.log("DEBUG EditCtrl id:" + $stateParams.id);
    $scope.id = $stateParams.id;

    $scope.aceLoaded = function(_editor) {
        $scope.aceEditor = _editor;

        // if new file, just return
        // nothing to fill out
        //
        if($stateParams.id === 0) {
            return;
        } 

        $http.get("/templates?id=" + $stateParams.id).success(function(data) {
            // did not find a template, that is okay
            //
            if(typeof data == 'string') {
                return;
            }
            $scope.route = data.route;
            $scope.description = data.description;
            $scope.group = data.group;
            $scope.id = data._id;
            var content = "";
            if((typeof data.content !== 'undefined') && (data.content != null)) {
                content = atob(data.content);
            }
            //content = "abc123";

            //$scope.content = content;

            _editor.$blockScrolling = "Infinity";

            $scope.aceContent = content;
            //_editor.setValue(content);
            //var _session = _editor.getSession();
            //_session.setValue(content);

            // set selected content type
            //
            // Get content type, construct the correct form
            // see if it is an image
            var cType = "text/html";
            $scope.showAceEditor = true;

            if(data.contenttype.toLowerCase().indexOf('text/css') === 0) {
                cType = data.contenttype;
                _editor.session.setMode("ace/mode/css");
            } else if(data.contenttype.toLowerCase().indexOf('application/javascript') === 0) {
                cType = data.contenttype;
                _editor.session.setMode("ace/mode/javascript");
            } else if(data.contenttype.toLowerCase().indexOf('application/json') === 0) {
                cType = data.contenttype;
                _editor.session.setMode("ace/mode/json");
            } else if(data.contenttype.toLowerCase().indexOf('image') === 0) {
                cType = "image/auto-select";
                $scope.showAceEditor = false;
                $scope.previewSrc = "/tpl/" + data.route;
            } else {
                cType = data.contenttype;
                _editor.session.setMode("ace/mode/html");
            }

            $scope.contentTypeOptions = contentTypeOptions;

            var keyFound = 0;
            $.each($scope.contentTypeOptions, function(key, value) {
                if(cType == value.contenttype) {
                    $scope.contentType = $scope.contentTypeOptions[key];
                }
            });

        }).error(function(data){
            console.log("Error fetching template");
        });
    };

    $scope.aceChanged = function(e) {
        console.log("aceChanged");
    };

    $scope.CopyTemplate = function() {
        $scope.route = "Copy of " + $scope.route;
        $scope.id = 0;
    };

    $scope.DeleteTemplate = function() {
        if((typeof $scope.id !== undefined) && ($scope.id != null) && ($scope.id !== 0)) {
            $http['delete']("/templates?id=" + $scope.id).success(function(data) {
                 if(data.success === true) {
                     console.log("Success, template deleted");
                 } else {
                     console.log("Error, template not deleted");
                 }
            }).error(function(data) {
                 console.log("Error, template not deleted");
            });
        }
    };

    // click event to save form
    // 
    $scope.SaveTemplate = function() {
        var id = $scope.id;
        var route = $scope.route;
        var description = $scope.description;
        var group = $scope.group;

        var contenttype = "";
        var content = "";
        // plain text content
        //
        if($scope.showAceEditor === true) {
            contenttype = $scope.contentType.contenttype;
            content = btoa($scope.aceEditor.getSession().getValue());
        } else {
            // image content
            //
            contenttype = $scope.imageContentType;
            content = $scope.imageData;
            $scope.route = $scope.imageName;
        }

        var data = { 
            route: route,
            description: description,
            group: group,
            contenttype: contenttype,
            content: content
        };

        if($scope.showAceEditor === false) {
            data.size = $scope.imageSize;
        }
        var dataOut = "";

        if((typeof $scope.id !== 'undefined') && ($scope.id != null) && ($scope.id !== 0)) {
            // Update Template
            //
            //
            data.id = $scope.id;

            dataOut = JSON.stringify(data);

            $http.put("/templates", dataOut).success(function(data) {
                if(data.success === true) {
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
            dataOut = JSON.stringify(data);

            $http.post("/templates", dataOut).success(function(data) {
                if(data.success === true) {
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

    $scope.changeContentType = function() {
        console.log("changed content type to " + $scope.contentType.contenttype);
        $scope.showAceEditor = ($scope.contentType.contenttype == "image/auto-select")? false: true;
    };

    angular.extend($scope, {
        model: { file: null },
        
        uploadFile: function(model) {
            console.log("upload files");
            var imageFile = $("#uploadFile");
            var blob = uploadFile.files[0];

            var imageBlob = null;
            var imageData = null;

            var reader = new FileReader();

            reader.onload = function() {
                imageBlob = reader.result;
                $scope.imageData = btoa(imageBlob);
                $scope.imageName = blob.name;
                $scope.route = blob.name;
                $scope.imageContentType = blob.type;
                $scope.imageSize = blob.size;
                $scope.previewSrc = "/tpl/" + blob.name;
            };

            reader.readAsBinaryString(blob);

        }
    });

})
;

