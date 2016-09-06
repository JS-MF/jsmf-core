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
const Family = Class.newInstance('Family')
Family.addAttribute('lastname' , String )
```
Alternatively you can use a more compact syntax (here defining a Person Class) using javascript objects.
```javascript
const Person = Class.newInstance ('Person', [] ,
{ firstname : String , age : JSMF.Positive })
```
Now we have the Class "Person" and "Family" let's create a reference between those two Classes.

```javascript
Family.addReference ('members', Person , JSMF.Cardinality.Some ) 
```

### Creating a model element conforms to a metamodel element.


```javascript
const john = new Person ()
john . firstname = ’ John ’
john . age = 46
```

Alternatively you can also use a compact syntax:
```javascript
const kennedy = Family . newInstance ({ name : ’ Kennedy ’ ,
members : [ john ]})
```

You can find examples, discover the other components and test it online with Tonic on JSMF github website (https://js-mf.github.io/#portfolio)

## License information

See [License](LICENSE).
