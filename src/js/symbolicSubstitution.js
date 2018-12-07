
let varMap={};

const symbolicSub=(table)=>{
    table.forEach((item)=>{
        if(item.type==='FunctionDeclaration'){
            if(item.params)
            {
                item.params.forEach((para)=>{
                    varMap.push({key: para.name,val: 0});
                });
            }
        }
        if(item.type==='AssignmentExpression'){
            varMap.push()
        }
    })
};