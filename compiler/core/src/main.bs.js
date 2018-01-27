// Generated by BUCKLESCRIPT VERSION 2.1.0, PLEASE EDIT WITH CARE
'use strict';

var Fs                                   = require("fs");
var List                                 = require("bs-platform/lib/js/list.js");
var Glob                                 = require("glob");
var Path                                 = require("path");
var $$Array                              = require("bs-platform/lib/js/array.js");
var Js_exn                               = require("bs-platform/lib/js/js_exn.js");
var Process                              = require("process");
var FsExtra                              = require("fs-extra");
var GetStdin                             = require("get-stdin");
var Caml_array                           = require("bs-platform/lib/js/caml_array.js");
var Json_decode                          = require("bs-json/src/Json_decode.js");
var Color$LonaCompilerCore               = require("./core/color.bs.js");
var Caml_builtin_exceptions              = require("bs-platform/lib/js/caml_builtin_exceptions.js");
var Decode$LonaCompilerCore              = require("./core/decode.bs.js");
var XmlColor$LonaCompilerCore            = require("./xml/xmlColor.bs.js");
var TextStyle$LonaCompilerCore           = require("./core/textStyle.bs.js");
var SwiftColor$LonaCompilerCore          = require("./swift/swiftColor.bs.js");
var SwiftRender$LonaCompilerCore         = require("./swift/swiftRender.bs.js");
var SwiftComponent$LonaCompilerCore      = require("./swift/swiftComponent.bs.js");
var SwiftTextStyle$LonaCompilerCore      = require("./swift/swiftTextStyle.bs.js");
var JavaScriptRender$LonaCompilerCore    = require("./javaScript/javaScriptRender.bs.js");
var JavaScriptComponent$LonaCompilerCore = require("./javaScript/javaScriptComponent.bs.js");

var $$arguments = $$Array.to_list(Process.argv);

var tmp;

var exit = 0;

var arg;

try {
  arg = List.find((function (param) {
          return +param.includes("--framework=");
        }), $$arguments);
  exit = 1;
}
catch (exn){
  if (exn === Caml_builtin_exceptions.not_found) {
    tmp = /* AppKit */1;
  } else {
    throw exn;
  }
}

if (exit === 1) {
  tmp = arg.endsWith("uikit") ? /* UIKit */0 : /* AppKit */1;
}

var swiftOptions = /* record */[/* framework */tmp];

function exit$1(message) {
  console.log(message);
  return (process.exit(1));
}

if (List.length($$arguments) < 3) {
  console.log("No command given");
  ((process.exit(1)));
}

var command = Caml_array.caml_array_get(Process.argv, 2);

if (Process.argv.length < 4) {
  console.log("No target given");
  ((process.exit(1)));
}

var match = Caml_array.caml_array_get(Process.argv, 3);

var target;

switch (match) {
  case "js" : 
      target = /* JavaScript */0;
      break;
  case "swift" : 
      target = /* Swift */1;
      break;
  case "xml" : 
      target = /* Xml */2;
      break;
  default:
    console.log("Unrecognized target");
    target = (process.exit(1));
}

function findWorkspaceDirectory(_path) {
  while(true) {
    var path = _path;
    var exists = +Fs.existsSync(Path.join(path, "colors.json"));
    if (exists !== 0) {
      return /* Some */[path];
    } else {
      var parent = Path.dirname(path);
      if (parent === "/") {
        return /* None */0;
      } else {
        _path = parent;
        continue ;
        
      }
    }
  };
}

function concat(base, addition) {
  return Path.join(base, addition);
}

function getTargetExtension(param) {
  switch (param) {
    case 0 : 
        return ".js";
    case 1 : 
        return ".swift";
    case 2 : 
        return ".xml";
    
  }
}

var targetExtension = getTargetExtension(target);

function renderColors(target, colors) {
  switch (target) {
    case 0 : 
        return "";
    case 1 : 
        return SwiftColor$LonaCompilerCore.render(swiftOptions, colors);
    case 2 : 
        return XmlColor$LonaCompilerCore.render(colors);
    
  }
}

function renderTextStyles(target, colors, textStyles) {
  if (target !== 1) {
    return "";
  } else {
    return SwiftTextStyle$LonaCompilerCore.render(swiftOptions, colors, textStyles);
  }
}

function convertColors(target, content) {
  return renderColors(target, Color$LonaCompilerCore.parseFile(content));
}

function convertTextStyles(target, filename) {
  var match = findWorkspaceDirectory(filename);
  if (match) {
    var colorsFile = Fs.readFileSync(Path.join(match[0], "colors.json"), "utf8");
    var colors = Color$LonaCompilerCore.parseFile(colorsFile);
    var textStylesFile = Fs.readFileSync(filename, "utf8");
    return renderTextStyles(target, colors, TextStyle$LonaCompilerCore.parseFile(textStylesFile));
  } else {
    console.log("Couldn't find workspace directory. Try specifying it as a parameter (TODO)");
    return (process.exit(1));
  }
}

function convertComponent(filename) {
  var content = Fs.readFileSync(filename, "utf8");
  var parsed = JSON.parse(content);
  var name = Path.basename(filename, ".component");
  switch (target) {
    case 0 : 
        return JavaScriptRender$LonaCompilerCore.toString(JavaScriptComponent$LonaCompilerCore.generate(name, parsed));
    case 1 : 
        var match = findWorkspaceDirectory(filename);
        if (match) {
          var workspace = match[0];
          var colorsFile = Fs.readFileSync(Path.join(workspace, "colors.json"), "utf8");
          var colors = Color$LonaCompilerCore.parseFile(colorsFile);
          var textStylesFile = Fs.readFileSync(Path.join(workspace, "textStyles.json"), "utf8");
          var textStyles = TextStyle$LonaCompilerCore.parseFile(textStylesFile);
          return SwiftRender$LonaCompilerCore.toString(SwiftComponent$LonaCompilerCore.generate(swiftOptions, name, colors, textStyles, parsed));
        } else {
          console.log("Couldn't find workspace directory. Try specifying it as a parameter (TODO)");
          return (process.exit(1));
        }
        break;
    case 2 : 
        console.log("Unrecognized target");
        return (process.exit(1));
    
  }
}

function copyStaticFiles(outputDirectory) {
  if (target !== 1) {
    return /* () */0;
  } else {
    var match = swiftOptions[/* framework */0];
    var framework = match !== 0 ? "appkit" : "uikit";
    var base = __dirname;
    FsExtra.copySync(Path.join(base, "../static/swift/AttributedFont." + (framework + ".swift")), Path.join(outputDirectory, "AttributedFont.swift"));
    return /* () */0;
  }
}

function convertWorkspace(workspace, output) {
  var fromDirectory = Path.resolve(workspace);
  var toDirectory = Path.resolve(output);
  FsExtra.ensureDirSync(toDirectory);
  var colorsInputPath = Path.join(fromDirectory, "colors.json");
  var colorsOutputPath = Path.join(toDirectory, "Colors" + targetExtension);
  var colors = Color$LonaCompilerCore.parseFile(Fs.readFileSync(colorsInputPath, "utf8"));
  Fs.writeFileSync(colorsOutputPath, renderColors(target, colors));
  var textStylesInputPath = Path.join(fromDirectory, "textStyles.json");
  var textStylesOutputPath = Path.join(toDirectory, "TextStyles" + targetExtension);
  var textStylesFile = Fs.readFileSync(textStylesInputPath, "utf8");
  var textStyles = renderTextStyles(target, colors, TextStyle$LonaCompilerCore.parseFile(textStylesFile));
  Fs.writeFileSync(textStylesOutputPath, textStyles);
  copyStaticFiles(toDirectory);
  Glob(Path.join(fromDirectory, "**/*.component"), (function (_, files) {
          var files$1 = $$Array.to_list(files);
          var processFile = function (file) {
            var fromRelativePath = Path.relative(fromDirectory, file);
            var addition = Path.basename(fromRelativePath, ".component");
            var base = Path.dirname(fromRelativePath);
            var toRelativePath = Path.join(base, addition) + targetExtension;
            var outputPath = Path.join(toDirectory, toRelativePath);
            console.log(Path.join(workspace, fromRelativePath) + ("=>" + Path.join(output, toRelativePath)));
            var exit = 0;
            var content;
            try {
              content = convertComponent(file);
              exit = 1;
            }
            catch (raw_exn){
              var exn = Js_exn.internalToOCamlException(raw_exn);
              if (exn[0] === Json_decode.DecodeError) {
                console.log("Failed to decode " + file);
                console.log(exn[1]);
                return /* () */0;
              } else if (exn[0] === Decode$LonaCompilerCore.UnknownParameter) {
                console.log("Unknown parameter: " + exn[1]);
                return /* () */0;
              } else {
                throw exn;
              }
            }
            if (exit === 1) {
              FsExtra.ensureDirSync(Path.dirname(outputPath));
              Fs.writeFileSync(outputPath, content);
              return /* () */0;
            }
            
          };
          return List.iter(processFile, files$1);
        }));
  return /* () */0;
}

switch (command) {
  case "colors" : 
      if (Process.argv.length < 5) {
        var render = function (content) {
          return Promise.resolve((console.log(renderColors(target, Color$LonaCompilerCore.parseFile(content))), /* () */0));
        };
        GetStdin().then(render);
      } else {
        var content = Fs.readFileSync(Caml_array.caml_array_get(Process.argv, 4), "utf8");
        console.log(renderColors(target, Color$LonaCompilerCore.parseFile(content)));
      }
      break;
  case "component" : 
      if (Process.argv.length < 5) {
        console.log("No filename given");
        ((process.exit(1)));
      }
      console.log(convertComponent(Caml_array.caml_array_get(Process.argv, 4)));
      break;
  case "workspace" : 
      if (Process.argv.length < 5) {
        console.log("No workspace path given");
        ((process.exit(1)));
      }
      if (Process.argv.length < 6) {
        console.log("No output path given");
        ((process.exit(1)));
      }
      convertWorkspace(Caml_array.caml_array_get(Process.argv, 4), Caml_array.caml_array_get(Process.argv, 5));
      break;
  default:
    console.log("Invalid command", command);
}

exports.$$arguments            = $$arguments;
exports.swiftOptions           = swiftOptions;
exports.exit                   = exit$1;
exports.command                = command;
exports.target                 = target;
exports.findWorkspaceDirectory = findWorkspaceDirectory;
exports.concat                 = concat;
exports.getTargetExtension     = getTargetExtension;
exports.targetExtension        = targetExtension;
exports.renderColors           = renderColors;
exports.renderTextStyles       = renderTextStyles;
exports.convertColors          = convertColors;
exports.convertTextStyles      = convertTextStyles;
exports.convertComponent       = convertComponent;
exports.copyStaticFiles        = copyStaticFiles;
exports.convertWorkspace       = convertWorkspace;
/* arguments Not a pure module */
