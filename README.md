
<p align="center">
  <img width="128" src="https://static.thenounproject.com/png/2775817-200.png">
  <h1 style="text-align: center">Typescript Partials 🍬🍬🍬 <span style="font-size: 25%">(αlpha)</span></h1>
</p>

Inspired from C# partial classes for typescript, Simplified 🎀 syntax that may help divide functionality of a single class into multiple 🍬🍬🍬 class files


### Install

Install dependencies with npm:

```bash
npm i mustafah/partials
```

### Import
```ts
import partial from 'partials';
```

### Add your partial classes 🍬🍬🍬
###### Split class function through multiple files
```ts
@partial export class Employee {
    @partial work: EmployeeWork;
    @partial lunch: EmployeeLunch;
    start() {
        this.work.doWork();
        this.lunch.goToLunch();
    }
}
```
```ts
@partial export class EmployeeWork {
    @partial model: EmployeeModel;
    doWork() {
        console.log(`doWork()`);
    }
}
```
```ts
@partial export class EmployeeLunch {
    @partial model: EmployeeModel;
    goToLunch() {
        console.log(`goToLunch()`);
    }
}
```
### 🎁 Voila, Use your class 👏
```ts
new Employee().start()
// Ouputs:
// goToWork()
// goToLunch()
```
---

##### 🌱 Need initialization code ?
```ts
@partial export class Employee {
    @partial work: EmployeeWork;
    @partial lunch: EmployeeLunch;
    ///////////////////////////////////////////////
    // Use onInit() instead of class's constructor 
    /////////////////////////////////////////////
    onInit() {
        this.work.doWork();
        this.lunch.goToLunch();
    }
}
```
---
##### 🌱 TwoWay communication between classes ?
If you tried the following scenario, JS Runtime will raise <span style="background: #FFEFF0; color: #FF0200; border-radius: 4px; padding: 4px;font-size: 80%">🚫 Uncaught ReferenceError: Cannot access 'Employee' before initialization</span> error and <span style="background: #FFFBE5; color: #5C3C00; border-radius: 4px; padding: 4px;font-size: 80%">⚠️ Circular dependency detected</span> warning
```ts
@partial export class Employee {
    @partial work: EmployeeWork;
    name = 'Mustafah';
}
```
```ts
@partial export class EmployeeWork {
    @partial employee: Employee;
    doWork() {
        console.log(`${this.employee.name} doWork()`);
    }
}
```
##### 🌱 Solution 1: Class name as string:
```ts
@partial export class EmployeeWork {
    @partial('Employee') employee;
    doWork() {
        console.log(`${this.employee.name} doWork()`);
    }
}
```

##### 🌱 Solution 2: Class name as forward reference:
```ts
@partial export class EmployeeWork {
    @partial(() => Employee) employee;
    doWork() {
        console.log(`${this.employee.name} doWork()`);
    }
}
```
##### 🌱 If you need strong typing, feel free to use interfaces:
```ts
@partial export class Employee {
    @partial work: EmployeeWork;
    name = 'Mustafah';
}
```
```ts
export interface IEmployee {
    name: string;
}
```
```ts
@partial export class EmployeeWork {
    @partial(() => Employee) employee: IEmployee;
}
```