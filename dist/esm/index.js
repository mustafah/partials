var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import 'reflect-metadata';
window.partialsClasses = {};
export function partialDebug(target, propertyName, propertyType) {
    debugger;
    return partial(target, propertyName, propertyType);
}
export default function partial(target, propertyName, propertyType) {
    if (propertyType && typeof (propertyType === null || propertyType === void 0 ? void 0 : propertyType.value) === 'function') {
        return propertyType;
    }
    else if (target && propertyName) {
        return partialPropertyDecorator(target, propertyName, propertyType);
    }
    else if (target) {
        if (target.prototype) {
            return partialClassDecorator(target);
        }
        else {
            return function (target2, propertyName2) {
                return partialPropertyDecorator(target2, propertyName2, target);
            };
        }
    }
    else {
        throw new Error("You probably calling decorator with (), call it bare like @partial not @partial() \uD83D\uDE04");
    }
}
function throwPartialError(target, propertyName) {
    throw new Error("class " + target.name + " { " + propertyName + ": ?; }, Can not Reflect partial type probably due to CircularDependencies, try to name it like instance name `(className: ClassName)` or with `@partial(() => ClassName)` \uD83D\uDE15");
}
function partialPropertyDecorator(target, propertyName, propertyType) {
    var t = propertyType || Reflect.getMetadata('design:type', target, propertyName) || propertyName;
    if (t) {
        var lateType = void 0;
        if (typeof t === 'string') {
            lateType = t.charAt(0).toLowerCase() + t.slice(1);
        }
        else
            lateType = t.name ? (function () { return t; }) : t;
        target.constructor.__partials = target.constructor.__partials || {};
        target.constructor.__partials[propertyName] = { name: propertyName, lateType: lateType };
    }
    else {
        throwPartialError(target.constructor, propertyName);
    }
}
var PartialLateRef = /** @class */ (function () {
    function PartialLateRef(target) {
        this.target = target;
        this.properties = {};
        this.name = target.name;
    }
    PartialLateRef.prototype.setProperty = function (name, obj) {
        this.properties[name] = this.properties[name] || [];
        this.properties[name].push(obj);
    };
    PartialLateRef.prototype.realizeRef = function () {
        // tslint:disable-next-line: forin
        for (var property in this.properties) {
            // tslint:disable-next-line: forin
            for (var _i = 0, _a = this.properties[property]; _i < _a.length; _i++) {
                var obj = _a[_i];
                if (obj instanceof PartialLateRef)
                    this.realizedRef[property] = obj.realizedRef;
                else
                    this.realizedRef[property] = obj;
            }
        }
        this.properties = null;
        return this.realizedRef;
    };
    return PartialLateRef;
}());
function getTypeName(t) {
    if (t.name !== 'f')
        return t.name;
    else
        return t.prototype.constructor.name;
}
function getTypeProperty(t, propertyName) {
    if (t.name !== 'f')
        return t[propertyName];
    else
        return t.prototype.constructor[propertyName];
}
function setTypeProperty(t, propertyName, propertyValue) {
    if (t.name === 'f')
        t = t.prototype.constructor;
    t[propertyName] = propertyValue;
}
function partialClassDecorator(target) {
    var original = target;
    var f = function () {
        var _a, _b;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var partialsReferences = target.__partials;
        var partialsInstances = target.__partialsInstances || { __lateRefs: [] };
        var isRootObject = Object.keys(partialsInstances).length > 1 ? false : true;
        var startPartialMaybeLateRef = partialsInstances[getTypeName(target)] = partialsInstances[getTypeName(target)] || new PartialLateRef(target);
        for (var partialReference in partialsReferences) {
            var pRef = partialsReferences[partialReference];
            // Trying to resolve type if it's late or unknown, assume typeName from property name 😄
            if (!pRef.type) {
                if (typeof pRef.lateType === 'string') {
                    if (window.partialsClasses[pRef.lateType])
                        pRef.type = window.partialsClasses[pRef.lateType];
                    else
                        throwPartialError(target, pRef.name);
                }
                else
                    pRef.type = pRef.lateType();
            }
            if (!pRef.type)
                throwPartialError(target, pRef.name);
            if (window.partialDebugTarget && target.name === window.partialDebugTarget)
                debugger;
            setTypeProperty(pRef.type, '__partialsInstances', partialsInstances);
            {
                var partObject = partialsInstances[getTypeName(pRef.type)] = partialsInstances[getTypeName(pRef.type)] || new pRef.type();
                if (startPartialMaybeLateRef instanceof PartialLateRef)
                    startPartialMaybeLateRef.setProperty(pRef.name, partObject);
                else
                    startPartialMaybeLateRef[pRef.name] = partObject;
            }
            if (((_a = pRef.type) === null || _a === void 0 ? void 0 : _a.name) && ((_b = pRef.type) === null || _b === void 0 ? void 0 : _b.name) !== 'f') {
                console.error('Probably you forgot add @partial to ' + pRef.type.name + ' 🌝');
            }
            setTypeProperty(pRef.type, '__partialsInstances', null);
        }
        var o = new (original.bind.apply(original, __spreadArrays([void 0], args)))();
        if (window.addID)
            o.id = Math.floor(Math.random() * 100);
        if (startPartialMaybeLateRef instanceof PartialLateRef) {
            startPartialMaybeLateRef.realizedRef = o;
            partialsInstances.__lateRefs.push(startPartialMaybeLateRef);
            // If used in the future just put O
            partialsInstances[target.name] = o;
        }
        if (isRootObject) {
            for (var _c = 0, _d = partialsInstances.__lateRefs; _c < _d.length; _c++) {
                var lateRef = _d[_c];
                lateRef.realizeRef();
            }
            delete partialsInstances.__lateRefs;
            for (var _e = 0, _f = Object.keys(partialsInstances); _e < _f.length; _e++) {
                var k = _f[_e];
                var ref = partialsInstances[k];
                if (ref === null || ref === void 0 ? void 0 : ref.onInit)
                    ref.onInit();
                delete partialsInstances[k];
            }
        }
        target.__partialsInstances = null;
        return o;
    };
    // copy prototype so intanceof operator still works
    f.prototype = original.prototype;
    // Move static properties and methods
    var props = Object.getOwnPropertyDescriptors(target);
    for (var prop in props) {
        if (!['name', 'prototype', 'length', '__partials'].includes(prop)) {
            var propValue = props[prop];
            Object.defineProperty(f, prop, propValue);
        }
    }
    window.partialsClasses[target.name.charAt(0).toLowerCase() + target.name.slice(1)] = f;
    return f;
}
