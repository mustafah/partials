import 'reflect-metadata';

declare var window: any;
window.partialsClasses = {};

export function partialDebug(target?, propertyName?, propertyType?) {
    debugger
    return partial(target, propertyName, propertyType);
}

export default function partial(target?, propertyName?, propertyType?) {
    if (propertyType && typeof propertyType?.value === 'function') {
        return propertyType;
    } else if (target && propertyName) {
        return partialPropertyDecorator(target, propertyName, propertyType);
    } else if (target) {
        if (target.prototype) {
            return partialClassDecorator(target);
        } else {
            return (target2, propertyName2) => {
                return partialPropertyDecorator(target2, propertyName2, target);
            }
        }
    }
    else {
        throw new Error(`You probably calling decorator with (), call it bare like @partial not @partial() 😄`);
    }
}

function throwPartialError(target, propertyName) {
    throw new Error(`class ${target.name} { ${propertyName}: ?; }, Can not Reflect partial type probably due to CircularDependencies, try to name it like instance name \`(className: ClassName)\` or with \`@partial(() => ClassName)\` 😕`);
}

function partialPropertyDecorator(target?, propertyName?, propertyType?) {
    const t = propertyType || Reflect.getMetadata('design:type', target, propertyName) || propertyName;
    if (t) {
        let lateType;
        if (typeof t === 'string') {
            lateType = t.charAt(0).toLowerCase() + t.slice(1);
        } else
            lateType = t.name ? (() => t) : t;
        target.constructor.__partials = target.constructor.__partials || {};
        target.constructor.__partials[propertyName] = { name: propertyName, lateType };
    } else {
        throwPartialError(target.constructor, propertyName);
    }
}

class PartialLateRef {
    name: string;
    constructor(private target) {
        this.name = target.name;
    }
    setProperty(name: string, obj) {
        this.properties[name] = this.properties[name] || [];
        this.properties[name].push(obj);
    }
    properties = {};
    realizedRef;
    realizeRef() {
        // tslint:disable-next-line: forin
        for (const property in this.properties) {
            // tslint:disable-next-line: forin
            for (const obj of this.properties[property]) {
                if (obj instanceof PartialLateRef)
                    this.realizedRef[property] = obj.realizedRef;
                else
                    this.realizedRef[property] = obj;
            }
        }
        this.properties = null;
        return this.realizedRef;
    }
}

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

function partialClassDecorator(target: any) {
    const original = target;

    const f: any = function (...args) {


        const partialsReferences = target.__partials;
        const partialsInstances = target.__partialsInstances || { __lateRefs: [] };
        const isRootObject = Object.keys(partialsInstances).length > 1 ? false : true;

        const startPartialMaybeLateRef = partialsInstances[getTypeName(target)] = partialsInstances[getTypeName(target)] || new PartialLateRef(target);

        for (const partialReference in partialsReferences) {
            const pRef = partialsReferences[partialReference];

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
                const partObject = partialsInstances[getTypeName(pRef.type)] = partialsInstances[getTypeName(pRef.type)] || new pRef.type();
                if (startPartialMaybeLateRef instanceof PartialLateRef)
                    startPartialMaybeLateRef.setProperty(pRef.name, partObject);
                else
                    startPartialMaybeLateRef[pRef.name] = partObject;
            }

            if (pRef.type?.name && pRef.type?.name !== 'f') {
                console.error('Probably you forgot add @partial to ' + pRef.type.name + ' 🌝');
            }

            setTypeProperty(pRef.type, '__partialsInstances', null);
        }

        const o = new original(...args);
        if (window.addID)
            o.id = Math.floor(Math.random() * 100);

        if (startPartialMaybeLateRef instanceof PartialLateRef) {
            (startPartialMaybeLateRef as PartialLateRef).realizedRef = o;
            partialsInstances.__lateRefs.push(startPartialMaybeLateRef);
            // If used in the future just put O
            partialsInstances[target.name] = o;
        }

        if (isRootObject) {
            for (const lateRef of partialsInstances.__lateRefs) {
                lateRef.realizeRef();
            }
            delete partialsInstances.__lateRefs;

            for (const k of Object.keys(partialsInstances)) {
                const ref = partialsInstances[k];
                if (ref?.onInit) ref.onInit();
                delete partialsInstances[k];
            }
        }

        target.__partialsInstances = null;
        return o;
    }
    // copy prototype so intanceof operator still works
    f.prototype = original.prototype;

    // Move static properties and methods
    const props = Object.getOwnPropertyDescriptors(target);
    for (const prop in props) {
        if (!['name', 'prototype', 'length', '__partials'].includes(prop)) {
            const propValue = props[prop];
            Object.defineProperty(f, prop, propValue);
        }
    }

    window.partialsClasses[target.name.charAt(0).toLowerCase() + target.name.slice(1)] = f;
    return f;
}
