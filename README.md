
<p align="center">
  <img width="128" src="https://static.thenounproject.com/png/2775817-200.png">
  <h1 style="text-align: center">Typescript Partials</h1>
</p>

Inspired from C# partial classes for typescript, Simplified 🎀 syntax that may help divide functionality of a single class into multiple 🍬🍬🍬 class files


## Installation

### Install

Install dependencies with npm:

```bash
npm i partials
```

### Import
```ts
import partial from 'partials';
```

### Add your partial classes 🍬🍬🍬
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
### Use your class
```ts
new Employee().start()
// Ouputs:
// goToWork()
// goToLunch()
```
