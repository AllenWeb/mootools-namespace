#   Mootools Namespace

##  Purpose

Allow `Class` declarations to support [Dojo-like packaging & namespacing][dojo].

##  Why?

Enterprise-level development, in my experience, requires organization & quality
on the client-side that is normally seen on the server-side.  Simply put, you would
find Zend Framework namespaced in the `/library/Zend/...` folder and, similarly, the
client-side scripts would likely be located in `/public/js/my/...`, where `my` is your
company or project name.

A good example of Javascript namespacing can be found in my tutorial
[Making Your Own Growl Widget With Dojo][growl].

##  Current Limitations

As Mootools is not yet namespaced (aside from folder structure), I've forked the
[Mootools Core][core] and [Mootools More][more] repositories to clean up structure
for autoloading & implement namespacing.  For example, `Fx.Tween` becomes
`Moo.Core.Fx.Tween`.  `Element.tween` continues to work, as well as `new Fx.Tween`.

Remember, this grew out of the need for namespacing within existing enterprise-level
code, not for improving upon Mootools' pseudo-namespacing.

##  Example 1 - Old & New

### Old `Class` (*still works*)

Nothing here is really out-of-the-ordinary besides the function creating the namespace.

    // First, create our namespace
    (function(root) {
        
        "My.Fx.Accordion".split(".").each(function(segment) {
            if (root[segment]) {
                // window[segement] or deeper already exists
            } else {
                root[segment] = {};
            }
            
            root = root[segment];
        });
        
    })(window);
    
    // Assign sub-classed Accordion to new namespace
    var My.Fx.Accordion = new Class({
        
        Implements: ["Accordion"],
        
        initialize: function() {
            // Re-implement initialize, unless we're using Class.Refactor
            // ...
            
            // Now, do something slightly different
            // ....
        }
        
    });

### New `Class`

Also, `Moo.More.Fx.Accordion` is automatically included in the page if it doesn't exist already,
after which the class will be created.

`this.parent()` exists because of Mootools' `Extends` option.

    new Namespace("My.Fx.Accordion", {
        
        Extends: "Moo.More.Fx.Accordion",
        
        initialize: function() {
            this.parent();
            
            // Now, do something slightly different
            // ...
        }
    });

## Example 2 - Requires

If you class depends on the existence of another class, that dependent class will be
loaded prior prior to class creation.

    new Namespace("My.Fx.Accordion", {
        // Load class to automatically bind function `say` to `this`
        Requires: "Moo.More.Class.Binds",
        
        // Loading will have finished before `Binds` is analyzed
        Binds: 'say',
        
        initialize: function(message) {
            this.message = message;
            setTimeout(this.say, 1000);
        },
        
        say: function() {
            alert(this.message);
        }
    });

## Example 3 - Require entire library

Often in large applications, you will need a whole library in the beginning to
prevent any delayed execution of events (animations, AJAX calls, etc.).

In the following example, we have an application that has a login page that may
allow the user to register or login with an existing account.  There may be specific
animations only used in this page, custom validation for the forms and their respective
templates, as well as events associated with elements on the page.

### Folder Structure

    /public
        /application
        /library
        /js
            /Moo
                /Core
                /More
                Namespace.js
            /My
                /Login
                    /Templates
                        Register.html
                        Login.html
                    All.js
                    Animations.js
                    Events.js
                    Form.js
                    Fx.js

### HTML - index.html

    <!-- Include the namespacing functionality -->
    <script src="js/Moo/Namespace.js"></script>
    
    <!-- Now, require  -->
    <script src="js/My/Login/All.js"></script>

### Javascript - /js/My/Login/All.js

    new Namespace("My.Login.All", {
        Requires: [
            "My.Login.Animations",
            "My.Login.Events",
            "My.Login.Form",
            "My.Login.Fx"
        ]
    });

## Demos

See the /demos folder.

[dojo]: http://docs.dojocampus.org/dojo/index#package-system
[wf]:   http://www.whitefence.com/
[growl]:http://blog.uxdriven.com/2009/09/08/making-your-own-growl-widget-with-dojo/
[core]: git@github.com:ericclemmons/mootools-core.git
[more]: git@github.com:ericclemmons/mootools-more.git