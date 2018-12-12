export const cases= (myCase)=>{
    return allCases[myCase.type](myCase);
};

const assExp=(item) =>{
    return {Name: cases(item.left),Value: cases(item.right)};
};

const expState=(item) =>{
    cases(item.expression);
};

const binaryExp= (item)=>{
    const left= cases(item.left);
    const right= cases(item.right);
    const expression= left+' '+item.operator+' '+right;
    if(item.operator==='+' || item.operator==='-')
        return '('+expression+')';
    return expression;
};

const unaryExp=(item) =>{
    let expression='';
    expression+=item.operator;
    expression+=item.argument.value;
    return expression;
};


const allCases={
    'ExpressionStatement': expState,
    'Identifier': (myCase)=> {return myCase.name;},
    'MemberExpression': (myCase)=> {return myCase.object.name + `[${cases(myCase.property)}]`;},
    'Literal': (myCase)=> {return isNaN(myCase.value) ? '\''+myCase.value+'\'' : myCase.value ;},
    'BinaryExpression': binaryExp,
    'AssignmentExpression':assExp,
    'UnaryExpression':unaryExp,
};


