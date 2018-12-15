import * as myParser from './myParser';

let lineCount=1;
let varMap=[];
let linesDic;
let colorsMap;

const init = ()=>{
    colorsMap=[];
    linesDic=[];
};

export const initVarMap = () => varMap=[];

export const getColorsMap= () => colorsMap;

const addToDic= (key,val,dic)=>{
    val=replaceVals(val,dic);
    dic[key]=val;
};

const getVarOrNum = (val)=>{
    if (isNaN(val)) {
        return val.split(/[\s<>,=()*/;{}%+-]+/).filter(s=>s!=='');
    }
    return [];
};

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
    val=val.split(' ').join('');
    const vals=val.split(/[\s<>=]+/);
    const operators=val.split(/[^\s<>=]+/);
    let res='';
    for(let i=0;i<vals.length;i++){
        try {
            let caseTrue=eval(vals[i]) + operators[i+1];
            if(/^[a-zA-Z]+$/.test(caseTrue))
                caseTrue=val;
            res+= caseTrue;
        }catch(e){
            res = val;
        }
    }
    return res;
};

const calPhrase = (prase,dic,lastIf)=> {
    let val = replaceVals(prase, dic);
    const arr = val.split(/[\s<>,=()*/;{}%+-]+/).filter(s => s !== ' ');
    arr.forEach((item) => {
        if (item in varMap)
            val = val.replace(item, varMap[item]);
    });
    let caseTrue= eval(val);
    return lastIf !== undefined ? lastIf ? caseTrue : false : caseTrue;
};

const saveDicLine = (dic)=>{
    const newDic=[];
    for(const k in dic)
        newDic[k]=dic[k];
    linesDic[lineCount]=newDic;
};

export const setLineCount=(l)=>{lineCount=l;};

export const parseGlobalVars= (parsedCode)=>{
    parsedCode.body.forEach(item=>{
        switch (item.type) {
        case 'VariableDeclaration': parseDeclarations(item.declarations); break;
        case 'ExpressionStatement': insertToMap(myParser.cases(item.expression).Name,myParser.cases(item.expression).Value); break;
        }
    });
};

const parseDeclarations = (declarations) =>{
    declarations.forEach((decleration)=> {
        insertToMap(cases(decleration.id),myParser.cases(decleration.init));
    });
};

const insertToMap = (left,right) =>{
    const varNum=getVarOrNum(right);
    for (let i=0;i<varNum.length;i++)
    {
        right= varNum[i] in varMap ? right.replace(varNum[i],varMap[varNum[i]]) : right;
    }
    varMap[left]=replaceNums(right);
};

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

const ifState =(item,dic,lastIf,type)=>{
    if (type===undefined)
        type='If Statement';
    const obj={Line: lineCount , Type:type, Name: '', Condition:cases(item.test,dic,lastIf), Value:''};
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
        handleAlt(item,dic,lastIf);
    }
};

const handleAlt = (item,dic,lastIf)=>{
    if (item.alternate.type=='IfStatement')
        item.alternate.type='ElseIfStatment';
    else {
        colorsMap.push(lastIf === false ? false : true);
        saveDicLine(dic);
        lineCount++;
    }
    cases(item.alternate,dic,lastIf);
};

const assExp=(item,dic,lastif) =>{
    const left=cases(item.left, dic,lastif);
    const right= cases(item.right, dic,lastif);
    const obj={Line: lineCount,Type: item.type,Name: left ,Condition: '',Value: right};
    addToDic(left,right,dic);
    saveDicLine(dic);
    lineCount++;
    return obj;
};

const expState=(item,dic,lastif) =>{
    cases(item.expression,dic,lastif);
};

const whileState=(item,dic,lastif) =>{
    saveDicLine(dic);
    lineCount++;
    cases(item.body,dic,lastif);
    saveDicLine(dic);
    lineCount++;
};

const binaryExp= (item,dic,lastIf)=>{
    const left= cases(item.left,dic,lastIf);
    const right= cases(item.right,dic,lastIf);
    const expression= '('+left+' '+item.operator+' '+right+')';
    return expression;
};

const fundecl= (item,dic,lastIf)=>{
    item.params.forEach((param)=>{
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
        addToDic(obj.Name,obj.Value,dic);
    });
    saveDicLine(dic);
    lineCount++;
};

const returnState=(item,dic) =>{
    saveDicLine(dic);
    lineCount++;
};

const unaryExp=(item) =>{
    let expression='';
    expression+=item.operator;
    expression+=item.argument.value;
    return expression;
};

const allCases={
    'FunctionDeclaration': fundecl,
    'VariableDeclaration': vardecl,
    'ExpressionStatement': expState,
    'WhileStatement': whileState,
    'IfStatement': ifState,
    'ElseIfStatment': elseIfState,
    'UnaryExpression':unaryExp,
    'ReturnStatement': returnState,
    'BlockStatement': (myCase,dic,lastif)=>parseAllCode(myCase,dic,lastif),
    'Identifier': (myCase)=> {return myCase.name;},
    'MemberExpression': (myCase)=> {return cases(myCase.object) + `[${cases(myCase.property)}]`;},
    'Literal': (myCase)=> {return isNaN(myCase.value) ? '\''+myCase.value+'\'' : myCase.value ;},
    'BinaryExpression': binaryExp,
    'AssignmentExpression':assExp,
    'ArrowFunctionExpression': fundecl
};


const dicToTemp = (dic)=> {
    const temp=[];
    for(const k in dic)
        temp[k]=dic[k];
    return temp;
};

const createFunctionColor=(code)=>{
    const getValid= (index,sen)=>replaceVals(sen,linesDic[index+1],true);
    let lines=code.split(/\r?\n/);
    const res=[];
    let indx=0;
    for(let i=0;i<lines.length;i++){
        let sentence=lines[i].replace('\t','');
        if(isLineInValid(sentence)){
            indx++;
            res.push(sentence);
        }
        else if(isPred(sentence))
            res.push(getValid(i-indx ,sentence));
    }
    return res;
};

const isLineInValid= (sen)=> sen==='{' || sen==='' || sen==='}' || sen.split(' ').join('')===''|| sen.split(' ').join('')==='}';

const isPred = (sen)=>{
    const isIf=sent=> sent.includes('else')||sent.includes('if');
    const getExpression= sent=> sent.includes('=') ? getVarOrNum(sent).filter(s=>s!=='')[0] : '';
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
        vals.forEach((val,index)=>argToDic(left+'['+index+']',val));
    }
};

export const argsParser= sen =>{
    const res= sen.split(/,(?![^([]*[\])])/g).filter(s=>s!=='');
    res.forEach((varible)=> {
        const exp=varible.split('=');
        varible = exp[0];
        argToDic(varible,exp[1]);
    });
};

function copyInitVarMap(dic) {
    for(let vari in varMap) {
        dic[vari] =varMap[vari];
    }
    return dic;
}

export const subtitution = (code,parsed)=>{
    setLineCount(1);
    init();
    let dic=[];
    parseGlobalVars(parsed);
    dic= copyInitVarMap(dic);
    parseAllCode(parsed,dic,undefined);
    return createFunctionColor(code);
};







