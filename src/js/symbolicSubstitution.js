let lineCount=1;
let myTable=[];
let varMap;
let linesDic;
let colorsMap;

const init = ()=>{
    colorsMap=[];
    linesDic=[];
};

const setVarMap =  map => varMap=map;

export const getColorsMap= () => colorsMap;

const addToDic= (key,val,dic)=>{
    val=replaceVariables(val,dic);
    dic[key]=val;
};

const getVarOrNum = (val)=>{
    if (isNaN(val)) {
        return val.split(/[\s<>,=()*/;{}%+-]+/).filter(s=>s!=='');
    }
    return val;
};
function replaceVariables(value,dictinoary,bool)
{
    var ArrayOfTokens=getVarOrNum(value);
    for (let i=0;i<ArrayOfTokens.length;i++)
    {
        var tok=ArrayOfTokens[i];
        var tokInDic=tok;
        if (dictinoary[tok]!=undefined) {
            if (!(tokInDic in varMap))
                tokInDic = dictinoary[tok];
        }
        value=value.replace(tok,tokInDic);
    }
    if (bool) {
        return value;
    }
    value = replaceNumbers(value);
    return value;
}
function replaceNumbers(value)
{
    if (isNaN(value)) {
        var values = value.split(/[\s<>=]+/);
        var tokens = value.split(/[^\s<>=]+/);
        var toReturn = '';
        for (var i = 0; i < values.length; i++) {
            toReturn += evalPharse(values[i]) + tokens[i + 1];
        }
        return toReturn;
    }
    return value;
}
function evalPharse(value)
{
    var toReturn;
    try
    {
        toReturn=eval(value);
    }
    catch(e)
    {
        toReturn=value;
    }
    return toReturn;
}
const replaceVals= (val,dic,isVar)=>{
    const vars=getVarOrNum(val);
    vars.forEach((item)=> {
        let varOrNum = item;
        if (dic[item] !== undefined) {
            if (!(varOrNum in varMap))
                varOrNum = dic[item];
        }
        val = val.replace(item, varOrNum);
    });
    if(isVar){
        return val;
    }
    val=replaceNums(val);
    return val;
};

const replaceNums= (val)=>{
    if(!isNaN(val)){
        return val;
    }
    const vals=val.split(/[\s<>=]+/);
    const operators=val.split(/^[\s<>=]+/);
    let res='';
    for(let i=0;i<vals.length;i++)
    {
        try {
            res += eval(vals[i]) + operators[i+1];
        }catch(e){
            res += val;
        }
    }
    return res;
};

const calPhrase = (prase,dic,lastIf)=> {
    let val = replaceVariables(prase, dic);
    const arr = val.split(/[\s<>,=()*/;{}%+-]+/).filter(s => s !== ' ');
    arr.forEach((item) => {
        if (item in varMap)
            val = val.replace(item, varMap[item]);
    });
    const caseTrue=eval(val);
    return lastIf !== undefined ? lastIf ? true : false : caseTrue;
};

const saveDicLine = (dic)=>{
    const newDic=[];
    for(const k in dic)
        newDic[k]=dic[k];
    linesDic[lineCount]=newDic;
};

export const setTable=(t)=>{myTable=t;};

export const setLineCount=(l)=>{lineCount=l;};

export const parseAllCode = (codeToParse,dic,lastIf) =>{
    codeToParse.body.forEach(item=>{
        cases(item,dic,lastIf);
    });
};

const cases= (myCase, dic, lastIf)=>{
    return allCases[myCase.type](myCase, dic, lastIf);
};

const elseIfState= (item,dic,lastIf)=>{
    ifState(item,dic,lastIf,'Else If Statement');
};

const ifState = (item,dic,lastIf,type)=>{
    if (type===undefined)
        type='If Statement';
    const obj={Line: lineCount , Type:type, Name: '', Condition:cases(item.test,dic,lastIf), Value:''};
    myTable.push(obj);
    const caseTrue=calPhrase(obj.Condition,dic,lastIf);
    colorsMap.push(caseTrue);
    if(caseTrue)
        lastIf=false;
    saveDicLine(dic);
    lineCount++;
    let tempDic=dicToTemp(dic);
    cases(item.consequent,dic,caseTrue);
    dic=tempDic;
    if (item.alternate!=null)
    {
        if (item.alternate.type=='IfStatement')
            item.alternate.type='ElseIfStatment';
        else {
            const obj={Line: lineCount , Type:'Else Statement', Name: '', Condition:'', Value:''};
            myTable.push(obj);
            colorsMap.push(lastIf === false ? false : true);
            saveDicLine(dic);
            lineCount++;
        }
        //tempDic=dicToTemp(dic);
        cases(item.alternate,dic,lastIf);
        //dic=tempDic;
    }
};

const updateExp= (item)=>{
    myTable.push({Line: lineCount,Type: item.type, Name: updateState(item),Condition: '',Value: ''});
    lineCount++;
};

const assExp=(item,dic,lastif) =>{
    const left=cases(item.left, dic,lastif);
    const right= cases(item.right, dic,lastif);
    const obj={Line: lineCount,Type: item.type,Name: left ,Condition: '',Value: right};
    myTable.push(obj);
    if(left in varMap)
        varMap[left]=right;
    addToDic(left,right,dic);
    saveDicLine(dic)
    lineCount++;
    return obj;
};

const expState=(item,dic,lastif) =>{
    cases(item.expression,dic,lastif);
};

const whileState=(item,dic,lastif) =>{
    myTable.push({Line: lineCount , Type: item.type, Name: '', Condition: cases(item.test,dic,lastif), Value:''});
    saveDicLine(dic);
    lineCount++;
    parseAllCode(item.body,dic,lastif);
    lineCount++;
};

const binaryExp= (item,dic,lastIf)=>{
    const left= cases(item.left,dic,lastIf);
    const right= cases(item.right,dic,lastIf);
    const expression= '('+left+' '+item.operator+' '+right+')';
    return expression;
};

const fundecl= (item,dic,lastIf)=>{
    myTable.push({Line: lineCount , Type: item.type, Name: cases(item.id,dic,lastIf), Condition:'' , Value:''});
    item.params.forEach((param)=>{ 
        myTable.push({Line: lineCount , Type:'Variable Declaration', Name: cases(param,dic), Condition:'' , Value:''});
        dic[cases(param,dic)]=cases(param,dic);
    });
    saveDicLine(dic);
    lineCount++;
    cases(item.body,dic,lastIf);
};

const vardecl= (item, dic, lastif)=>{
    item.declarations.forEach((decleration)=> {
        const obj={
            Line: lineCount,
            Type: 'Variable Declaration',
            Name: cases(decleration.id,dic,lastif),
            Condition: '',
            Value: decleration.init ? cases(decleration.init,dic,lastif) : null
        };
        myTable.push(obj);
        addToDic(obj.Name,obj.Value,dic);
    });
    saveDicLine(dic);
    lineCount++;
};

const returnState=(item,dic) =>{
    myTable.push({Line: lineCount , Type: item.type, Name: '', Condition:'' , Value: cases(item.argument)});
    saveDicLine(dic);
    lineCount++;
};

const unaryExp=(item) =>{
    let expression='';
    expression+=item.operator;
    expression+=item.argument.value;
    return expression;
};

const forState= (item)=>{
    let expression= item.init.kind+' '+ cases(item.init.declarations[0].id)+ '='+item.init.declarations[0].init.value+'; ';
    expression+=cases(item.test)+'; ';
    expression+=updateState(item.update);
    myTable.push({Line: lineCount , Type: item.type, Name: '', Condition: expression , Value: ''});
    lineCount++;
    parseAllCode(item.body);
};

const  updateState=(item)=> {
    let opertator = item.operator;
    item.prefix ? opertator = opertator + cases(item.argument) : opertator = cases(item.argument) + opertator;
    return opertator;
};

const allCases={
    'FunctionDeclaration': fundecl,
    'VariableDeclaration': vardecl,
    'ExpressionStatement': expState,
    'WhileStatement': whileState,
    'IfStatement': ifState,
    'ElseIfStatment': elseIfState,
    'ReturnStatement': returnState,
    'BlockStatement': (myCase,dic,lastif)=>parseAllCode(myCase,dic,lastif),
    'Identifier': (myCase)=> {return myCase.name;},
    'MemberExpression': (myCase)=> {return cases(myCase.object) + `[${cases(myCase.property)}]`;},
    'ForStatement': forState,
    'Literal': (myCase)=> {return ''+myCase.value;},
    'BinaryExpression': binaryExp,
    'UpdateExpression': updateExp,
    'AssignmentExpression':assExp,
    'UnaryExpression':unaryExp,
    'ArrowFunctionExpression': fundecl
};

export const parserStart=(parsedCode)=>{
    setLineCount(1);
    setTable([]);
    init();
    parseAllCode(parsedCode);
    return myTable;
};

const dicToTemp = (dic)=> {
    const temp=[];
    for(const k in dic)
        temp[k]=dic[k];
    return temp;
};

const createFunctionColor=(code)=>{
    const getValid= (index,sen)=>replaceVariables(sen,linesDic[index+1],true);
    let lines=code.split(/\r?\n/);
    const res=[];
    let indx=0;
    for(let i=0;i<lines.length;i++){
        let sentence=lines[i].replace('\t','').replace(' ','');
        if(isLineValid(sentence)){
            indx++;
            res.push(sentence);
        }
        else if(isPred(sentence))
            res.push(getValid(i-indx,sentence));
    }
    return res;
};

const isLineValid= (sen)=> sen==='{' || sen==='' || sen==='}';

const isPred = (sen)=>{
    const isIf=sent=> sent.includes('else')||sent.includes('if');
    const getExpression= sent=> sent.includes('=') ? sent.split('').filter(s=>s!==' ')[0] : '';
    if(sen.includes('function') || getExpression(sen) in varMap)
        return true;
    return isIf(sen) || sen.includes('return') || sen.includes('while');
};

const argToDic = (left,right)=>{
    if(right[0]!=='['){
        varMap[left]=right;
    }
    else{
        right=right.substring(1,right.length-1);
        const vals=right.split(',');
        vals.forEach(val=>argToDic(left,val));
    }
};

export const argsParser= sen =>{
    varMap=[];
    const res= sen.split(/,(?![^\(\[]*[\]\)])/g);
    res.forEach((varible)=> {
        const exp=varible.split('=');
        varible = exp[0];
        argToDic(varible,exp[1]);
    });
};

export const subtitution = (code,parsed)=>{
    setLineCount(1);
    setTable([]);
    init();
    setVarMap(varMap);
    const dic=[];
    parseAllCode(parsed,dic,undefined);
    return createFunctionColor(code);
};







