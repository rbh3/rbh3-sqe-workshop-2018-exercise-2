import assert from 'assert';
import * as symbolic from '../src/js/symbolicSubstitution';
import {parseCode} from '../src/js/code-analyzer';

describe('Tests for symbolic functions', () => {
    beforeEach(()=> {
        symbolic.initVarMap();
    });

    it('check colors - if alt and input', () => {
        const input='function f(x){\n' +
            '    if (x > 2) {\n' +
            '        x = x + 1;\n' +
            '    } else if (x == 1) {\n' +
            '        x = x - 1;\n' +
            '    } else {\n' +
            '        x = x * 3;\n' +
            '    }\n' +
            '    return x;\n' +
            '}';
        symbolic.argsParser('x=10')
        assert.equal(
            symbolic.subtitution(input,parseCode(input)).length,
            10
        );
        assert.deepEqual(
            symbolic.getColorsMap(),
            [true,false,false]
        );
    });

    it('check colors - if alt and input', () => {
        const input='function f(x){\n' +
            '    if (x > 2) {\n' +
            '        x = x + 1;\n' +
            '    } else if (x == 1) {\n' +
            '        x = x - 1;\n' +
            '    } else {\n' +
            '        x = x * 3;\n' +
            '    }\n' +
            '    return x;\n' +
            '}';
        symbolic.argsParser('x=10')
        assert.equal(
            symbolic.subtitution(input,parseCode(input)).length,
            10
        );
        assert.deepEqual(
            symbolic.getColorsMap(),
            [true,false,false]
        );
    });

    it('check complex if with strings and array', () => {
        const input='let w = 1;\n' +
            'function foo(x, y, z){\n' +
            ' while(x<2){\n' +
            '  let g=\'king\';\n' +
            '  let g2 = true;\n' +
            '  if(g== z[2]){\n' +
            '    return y + x * 2\n' +
            '  }else if(g== \'king\'){\n' +
            '    if(g2 == false){\n' +
            '     return w + x;\n' +
            '    }else{\n' +
            '     w = 2;\n' +
            '    }\n' +
            '  }else{\n' +
            '    return true; \n' +
            '  }\n' +
            ' }\n' +
            ' y = w + 1;\n' +
            ' let a = y;\n' +
            '}';
        symbolic.argsParser('x=1,y=2,z=[0,2,\'r\']')
        assert.equal(
            symbolic.subtitution(input,parseCode(input)).length,
            16
        );
        assert.deepEqual(
            symbolic.getColorsMap(),
            [false,true,false,true,false]
        );
    });

    it('check with global vars', () => {
        const input='let w=2;\n' +
            '\n' +
            '            function f(x){\n' +
            '                if (x > 2) {\n' +
            '                    x = 12;\n' +
            '                } else if (a == w) {\n' +
            '                    x = x - 1;\n' +
            '                } else {\n' +
            '                    x = x * 3;\n' +
            '            }\n' +
            '                return x;\n' +
            '            }\n' +
            'let a=12;\n' +
            '            w=w+10;';
        symbolic.argsParser('x=1')
        assert.equal(symbolic.subtitution(input,parseCode(input)).length,  12);
        assert.deepEqual(
            symbolic.getColorsMap(),
            [false,true,false]
        );
    });

    it('check with global arr', () => {
        const input='let w=a[1]\n' +
            'w=\'ravid\'\n' +
            'let xs2=-1;\n' +
            'xs2=xs2-1;\n' +
            'xs2=xs2*-1;\n' +
            'function foo(){\n' +
            'let x\n' +
            'if(xs2==2){\n' +
            'return xs2;\n' +
            '}\n' +
            '}';
        symbolic.argsParser('')
        assert.equal(symbolic.subtitution(input,parseCode(input)).length, 8);
        assert.deepEqual(
            symbolic.getColorsMap(),
            [true]
        );
    });

});



