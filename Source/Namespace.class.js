/*
---
description: Allows for slightly new Class instantiations for name.spacing

license: MIT-style

authors:
- Eric Clemmons <eric@uxdriven.com>

requires:
- core/1.2.4:Class.Extras
- core/1.2.4:Request

provides: [Namespace]

...
*/

var Namespace = new Class({
    
    Implements: Options,
    
    dependencyOptions:  ["Implements", "Extends", "Requires"],
        
    // Accepts the namespace path "my.namespace.path" & the class options for instantiation
    initialize: function(namespace, options) {
        // Parse options for strings where classes should exist
        options = this.parseOptions(options);
        
        // Return the instantiated class
        return Namespace.getClass(namespace, options);
    },
    
    // Replace `Extends: "myClass"` with `Extends: myClass` instantiation
    parseOptions: function(options) {
        
        // Iterate through each type of dependency (i.e. "Extends")
        this.dependencyOptions.each(function(param) {
            var resources = $splat(options[param]);
            
            resources.each(function(resource, i) {
                // If the dependency isn't a class yet, try to load the class
                if ($type(resource) === "string") {
                    // Get existing class or load it via SJAX
                    var resource = Namespace.getClass(resource)
                                 ? Namespace.getClass(resource)
                                 : Namespace.load(resource, Namespace.options.delimiter);
                    
                    // If class finally exists, assign it to it's key (for Requires)
                    // or to the param itself (for Extends)
                    if ($type(resource) === "class") {
                        if ($type(options[param]) === "array") {
                            options[param][i] = resource;
                        } else {
                            options[param] = resource;
                        }
                    } else {
                        if (param !== "Requires") {
                            throw new Error(param + " class \"" + resource + "\" does not exist or could not be loaded.");
                        }
                    }
                }
            }, this);
        }, this);
        
        return options;
    }
    
});

Namespace.options = {
    root:       this,   // You can set the base for your namespace.  Defaults to `window` in the browser
    delimiter:  "."     // Delimiter for namespacing
};

Namespace.paths = {
    _base: "."
};

// Traverses down the namespace path and returns the (newly instantiated if not existing) class
Namespace.getClass = function(namespace, options) {
    var root = Namespace.options.root;
    
    // Iterate through each section of the namespace
    namespace.split(Namespace.options.delimiter).each(function(name, i, names) {
        // Up until the last leaf, create an object if undefined
        if (i < names.length - 1) {
            if (!root[name]) {
                root[name] = {};
            }
        } else {
            // If the last leaf doesn't exist & we're looking to instantiate, instantiate the class
            if (!root[name] && options) {
                return root[name] = new Class(options);
            }
        };
        
        root = root[name];
    });
    
    // Return the requested namespaced class
    return root;
};

Namespace.load = function(namespace) {
    new Request({
        url:    Namespace.getBasePath(namespace, Namespace.options.delimiter) + ".js",
        method: 'GET',
        async:  false,
        evalResponse:   true
    }).send();
    
    return Namespace.getClass(namespace);
};

Namespace.setBasePath = function(namespace, path) {
    if (!path) {
        var path = namespace;
        var namespace = "_base";
    }
    
    Namespace.paths[namespace] = path;
};

Namespace.getBasePath = function(namespace) {
    // Default namespace to empty string
    var namespace = namespace || '';
    
    // Initially, namespaces are split from "My.Name.Space" to "[My, Name, Space]"
    var namespaces = namespace.split(Namespace.options.delimiter);
    
    // Start with the base path
    var path = Namespace.paths._base;
    
    // Iterate through each specified namespace path ("Moo.Core" => "js/Moo/Core/Source")
    for (var stub in Namespace.paths) {
        if (stub === namespace.substring(0, stub.length)) {
            var stubPath = Namespace.paths[stub];
            
            // Remove stub from namespace, as we've already pathed it
            namespace = namespace.substring(stub.length + 1);
            
            // Split on specified delimiter or specified one
            var namespaces = namespace.split(Namespace.options.delimiter);
            
            // If namespace has a callback instead of a path, use that
            if ($type(stubPath) === 'function') {
                return stubPath(namespaces);
            } else {
            // Otherwise, use the specified path
                path += "/" + Namespace.paths[stub];
                break;
            }
        }
    }
    
    // Join our base path with the remaining pathed namespace
    return path + "/" + namespaces.join("/");
};

Namespace.require = function(namespaces) {
    $splat(namespaces).each(function(namespace) {
        Namespace.load(namespace);
    });
};

if (typeof module == 'object') {
    module.exports = Namespace;
}