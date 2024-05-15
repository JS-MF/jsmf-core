# JSMF-Core

[![build status](https://git.list.lu/jsmf/jsmf-core/badges/master/build.svg)](https://git.list.lu/jsmf/jsmf-core/commits/master)

The JavaScript Modelling Framework (JSMF) has been designed for providing a flexible modelling environment that could support the many modelling situations: from informal model to code generation. It is a JavaScript embedded DSL inspired by the Eclipse Modelling Framework (EMF) in its basic functions but that rely on JavaScript dynamic typing and on a relative independence between a metamodel and a model.

## Install

Thanks to npm: `npm install jsmf-core`

## Usage and Example

### In order to access the most commun JSMF elements use:
```javascript
const JSMF = require('jsmf-core')
	  Model = JSMF.Model
      Class = JSMF.Class
      Enum = JSMF.Enum
```

### Creating a metamodel element (i.e., Class)

Here we created a Class "Family" and a "lastname" attribute.
This syntax is inspired by the EMF one.
```javascript
const Course = Class.newInstance('Course')
Course.addAttribute('title' , String )

const Person = Class.newInstance('Person')
Person.addAttribute('age' , JSMF.Positive) 
```
Alternatively you can use a more compact syntax (here defining a Person Class) using javascript objects.
```javascript
const Student = Class.newInstance ('Student', [] ,
{ firstname : String , lastName : String})
```
You can use the different basic Javascript types : Number, String. Boolean, BigInt(*), Date, Array, Objects. There are also some constrained types like JSMF.Positive and JSMF.Negative that takes respectively only positive and negative numbers. A range of value can also be defined using Range(Min,Max). Finally, for a flexible usage, you can use JSMF.Any that is not enforcing any specific type checking.

Inheritance is managed using the function setSuperClass, this way multiple classes can be added using an array like: [Person,Human]. SetSuperClasses or SetSuperTypes are also alternative syntax.
```javascript
Student.setSuperClass(Person);
```

Inheritance can also be specified when creating the class student:
```javascript
const Student = Class.newInstance ('Student', [Person])
```


Having defined the classes "Person" and "Family" let's create a reference between those two classes.

```javascript
Family.addReference ('registeredStudents', Student , JSMF.Cardinality.Some ) 
```
The cardinality (or multiplicities) indicates the number of instances of one class can be linked to the instances of another class under a given reference.  There is a minimum and a maximum (which can be potentially infinite indicated by *)
Shortcuts are following, note that using using the value -1 also mean 0..*
```javascript
/** A Shortcut for 0..1 cardinality
 */
Cardinality.optional = new Cardinality(0,1)

/** A Shortcut for 1..1 cardinality
 */
Cardinality.one = new Cardinality(1,1)

/** A Shortcut for 0..* cardinality
 */
Cardinality.any = new Cardinality(0)

/** A Shortcut for * cardinality
 */
Cardinality.some = new Cardinality(1)
```

### Creating a model element conforms to a metamodel element.


```javascript
const john = new Student ()
john . firstname = ’ John ’
john . age = 46
```

Alternatively you can also use a compact syntax:
```javascript
const Modelling = Course . newInstance ({ name : ’ Modelling ’ ,
registeredStudents : [ john ]})
```

You can find examples, discover the other components and test it online with Tonic on JSMF github website (https://js-mf.github.io/#portfolio)

## License information

See [License](LICENSE).
