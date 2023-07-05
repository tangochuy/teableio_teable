// Generated from src/query/parser/QueryLexer.g4 by ANTLR 4.9.0-SNAPSHOT

import type { ATN } from 'antlr4ts/atn/ATN';
import { ATNDeserializer } from 'antlr4ts/atn/ATNDeserializer';
import { LexerATNSimulator } from 'antlr4ts/atn/LexerATNSimulator';
import type { CharStream } from 'antlr4ts/CharStream';
import { NotNull, Override } from 'antlr4ts/Decorators';
import { Lexer } from 'antlr4ts/Lexer';
import * as Utils from 'antlr4ts/misc/Utils';
import { RuleContext } from 'antlr4ts/RuleContext';
import type { Vocabulary } from 'antlr4ts/Vocabulary';
import { VocabularyImpl } from 'antlr4ts/VocabularyImpl';

export class QueryLexer extends Lexer {
  public static readonly COMMA = 1;
  public static readonly OPEN_PAREN = 2;
  public static readonly CLOSE_PAREN = 3;
  public static readonly OPEN_BRACKET = 4;
  public static readonly CLOSE_BRACKET = 5;
  public static readonly L_CURLY = 6;
  public static readonly R_CURLY = 7;
  public static readonly SIMPLE_IDENTIFIER = 8;
  public static readonly SINGLEQ_STRING_LITERAL = 9;
  public static readonly DOUBLEQ_STRING_LITERAL = 10;
  public static readonly INTEGER_LITERAL = 11;
  public static readonly NUMERIC_LITERAL = 12;
  public static readonly EQUAL_OPERATOR = 13;
  public static readonly NOT_EQUAL_OPERATOR = 14;
  public static readonly GT_OPERATOR = 15;
  public static readonly GTE_OPERATOR = 16;
  public static readonly LT_OPERATOR = 17;
  public static readonly LTE_OPERATOR = 18;
  public static readonly TRUE_SYMBOL = 19;
  public static readonly FALSE_SYMBOL = 20;
  public static readonly AND_SYMBOL = 21;
  public static readonly OR_SYMBOL = 22;
  public static readonly NOT_SYMBOL = 23;
  public static readonly NULL_SYMBOL = 24;
  public static readonly IS_SYMBOL = 25;
  public static readonly LIKE_SYMBOL = 26;
  public static readonly IN_SYMBOL = 27;
  public static readonly HAS_SYMBOL = 28;
  public static readonly NOT_LIKE_SYMBOL = 29;
  public static readonly NOT_IN_SYMBOL = 30;
  public static readonly WHITESPACE = 31;
  public static readonly NOT_EQUAL2_OPERATOR = 32;

  public static readonly channelNames: string[] = ['DEFAULT_TOKEN_CHANNEL', 'HIDDEN'];

  public static readonly modeNames: string[] = ['DEFAULT_MODE'];

  public static readonly ruleNames: string[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'DEC_DIGIT',
    'DQUOTA_STRING',
    'SQUOTA_STRING',
    'SPACE',
    'COMMA',
    'OPEN_PAREN',
    'CLOSE_PAREN',
    'OPEN_BRACKET',
    'CLOSE_BRACKET',
    'L_CURLY',
    'R_CURLY',
    'SIMPLE_IDENTIFIER',
    'SINGLEQ_STRING_LITERAL',
    'DOUBLEQ_STRING_LITERAL',
    'INTEGER_LITERAL',
    'NUMERIC_LITERAL',
    'EQUAL_OPERATOR',
    'NOT_EQUAL_OPERATOR',
    'NOT_EQUAL2_OPERATOR',
    'GT_OPERATOR',
    'GTE_OPERATOR',
    'LT_OPERATOR',
    'LTE_OPERATOR',
    'TRUE_SYMBOL',
    'FALSE_SYMBOL',
    'AND_SYMBOL',
    'OR_SYMBOL',
    'NOT_SYMBOL',
    'NULL_SYMBOL',
    'IS_SYMBOL',
    'LIKE_SYMBOL',
    'IN_SYMBOL',
    'HAS_SYMBOL',
    'NOT_LIKE_SYMBOL',
    'NOT_IN_SYMBOL',
    'WHITESPACE',
  ];

  private static readonly _LITERAL_NAMES: Array<string | undefined> = [
    undefined,
    "','",
    "'('",
    "')'",
    "'['",
    "']'",
    "'{'",
    "'}'",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "'='",
    "'!='",
    "'>'",
    "'>='",
    "'<'",
    "'<='",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "'<>'",
  ];
  private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
    undefined,
    'COMMA',
    'OPEN_PAREN',
    'CLOSE_PAREN',
    'OPEN_BRACKET',
    'CLOSE_BRACKET',
    'L_CURLY',
    'R_CURLY',
    'SIMPLE_IDENTIFIER',
    'SINGLEQ_STRING_LITERAL',
    'DOUBLEQ_STRING_LITERAL',
    'INTEGER_LITERAL',
    'NUMERIC_LITERAL',
    'EQUAL_OPERATOR',
    'NOT_EQUAL_OPERATOR',
    'GT_OPERATOR',
    'GTE_OPERATOR',
    'LT_OPERATOR',
    'LTE_OPERATOR',
    'TRUE_SYMBOL',
    'FALSE_SYMBOL',
    'AND_SYMBOL',
    'OR_SYMBOL',
    'NOT_SYMBOL',
    'NULL_SYMBOL',
    'IS_SYMBOL',
    'LIKE_SYMBOL',
    'IN_SYMBOL',
    'HAS_SYMBOL',
    'NOT_LIKE_SYMBOL',
    'NOT_IN_SYMBOL',
    'WHITESPACE',
    'NOT_EQUAL2_OPERATOR',
  ];
  public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(
    QueryLexer._LITERAL_NAMES,
    QueryLexer._SYMBOLIC_NAMES,
    []
  );

  // @Override
  // @NotNull
  public get vocabulary(): Vocabulary {
    return QueryLexer.VOCABULARY;
  }

  constructor(input: CharStream) {
    super(input);
    this._interp = new LexerATNSimulator(QueryLexer._ATN, this);
  }

  // @Override
  public get grammarFileName(): string {
    return 'QueryLexer.g4';
  }

  // @Override
  public get ruleNames(): string[] {
    return QueryLexer.ruleNames;
  }

  // @Override
  public get serializedATN(): string {
    return QueryLexer._serializedATN;
  }

  // @Override
  public get channelNames(): string[] {
    return QueryLexer.channelNames;
  }

  // @Override
  public get modeNames(): string[] {
    return QueryLexer.modeNames;
  }

  public static readonly _serializedATN: string =
    '\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02"\u0165\b\x01' +
    '\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06' +
    '\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r' +
    '\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t' +
    '\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t' +
    '\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t' +
    '\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04"\t' +
    "\"\x04#\t#\x04$\t$\x04%\t%\x04&\t&\x04'\t'\x04(\t(\x04)\t)\x04*\t*\x04" +
    '+\t+\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x041\t1\x042\t2\x043\t3\x04' +
    '4\t4\x045\t5\x046\t6\x047\t7\x048\t8\x049\t9\x04:\t:\x04;\t;\x04<\t<\x04' +
    '=\t=\x04>\t>\x04?\t?\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03' +
    '\x05\x03\x05\x03\x06\x03\x06\x03\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03' +
    '\n\x03\n\x03\v\x03\v\x03\f\x03\f\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0F\x03' +
    '\x0F\x03\x10\x03\x10\x03\x11\x03\x11\x03\x12\x03\x12\x03\x13\x03\x13\x03' +
    '\x14\x03\x14\x03\x15\x03\x15\x03\x16\x03\x16\x03\x17\x03\x17\x03\x18\x03' +
    '\x18\x03\x19\x03\x19\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1C\x03\x1C\x03' +
    '\x1D\x03\x1D\x03\x1D\x03\x1D\x07\x1D\xBA\n\x1D\f\x1D\x0E\x1D\xBD\v\x1D' +
    '\x03\x1D\x03\x1D\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x07\x1E\xC5\n\x1E\f\x1E' +
    '\x0E\x1E\xC8\v\x1E\x03\x1E\x03\x1E\x03\x1F\x03\x1F\x03 \x03 \x03!\x03' +
    '!\x03"\x03"\x03#\x03#\x03$\x03$\x03%\x03%\x03&\x03&\x03\'\x03\'\x06' +
    "'\xDE\n'\r'\x0E'\xDF\x03'\x03'\x03(\x03(\x03)\x03)\x03*\x05*\xE9" +
    '\n*\x03*\x06*\xEC\n*\r*\x0E*\xED\x03*\x03*\x06*\xF2\n*\r*\x0E*\xF3\x05' +
    '*\xF6\n*\x03+\x05+\xF9\n+\x03+\x06+\xFC\n+\r+\x0E+\xFD\x03+\x03+\x06+' +
    '\u0102\n+\r+\x0E+\u0103\x03+\x03+\x07+\u0108\n+\f+\x0E+\u010B\v+\x03+' +
    '\x06+\u010E\n+\r+\x0E+\u010F\x05+\u0112\n+\x03,\x03,\x03-\x03-\x03-\x03' +
    '.\x03.\x03.\x03.\x03.\x03/\x03/\x030\x030\x030\x031\x031\x032\x032\x03' +
    '2\x033\x033\x033\x033\x033\x034\x034\x034\x034\x034\x034\x035\x035\x03' +
    '5\x035\x036\x036\x036\x037\x037\x037\x037\x038\x038\x038\x038\x038\x03' +
    '9\x039\x039\x03:\x03:\x03:\x03:\x03:\x03;\x03;\x03;\x03<\x03<\x03<\x03' +
    '<\x03=\x03=\x03=\x03=\x03=\x03=\x03=\x03=\x03=\x03>\x03>\x03>\x03>\x03' +
    '>\x03>\x03>\x03?\x03?\x03?\x03?\x02\x02\x02@\x03\x02\x02\x05\x02\x02\x07' +
    '\x02\x02\t\x02\x02\v\x02\x02\r\x02\x02\x0F\x02\x02\x11\x02\x02\x13\x02' +
    '\x02\x15\x02\x02\x17\x02\x02\x19\x02\x02\x1B\x02\x02\x1D\x02\x02\x1F\x02' +
    "\x02!\x02\x02#\x02\x02%\x02\x02'\x02\x02)\x02\x02+\x02\x02-\x02\x02/" +
    '\x02\x021\x02\x023\x02\x025\x02\x027\x02\x029\x02\x02;\x02\x02=\x02\x02' +
    '?\x02\x03A\x02\x04C\x02\x05E\x02\x06G\x02\x07I\x02\bK\x02\tM\x02\nO\x02' +
    '\vQ\x02\fS\x02\rU\x02\x0EW\x02\x0FY\x02\x10[\x02"]\x02\x11_\x02\x12a' +
    '\x02\x13c\x02\x14e\x02\x15g\x02\x16i\x02\x17k\x02\x18m\x02\x19o\x02\x1A' +
    'q\x02\x1Bs\x02\x1Cu\x02\x1Dw\x02\x1Ey\x02\x1F{\x02 }\x02!\x03\x02"\x04' +
    '\x02CCcc\x04\x02DDdd\x04\x02EEee\x04\x02FFff\x04\x02GGgg\x04\x02HHhh\x04' +
    '\x02IIii\x04\x02JJjj\x04\x02KKkk\x04\x02LLll\x04\x02MMmm\x04\x02NNnn\x04' +
    '\x02OOoo\x04\x02PPpp\x04\x02QQqq\x04\x02RRrr\x04\x02SSss\x04\x02TTtt\x04' +
    '\x02UUuu\x04\x02VVvv\x04\x02WWww\x04\x02XXxx\x04\x02YYyy\x04\x02ZZzz\x04' +
    '\x02[[{{\x04\x02\\\\||\x03\x022;\x04\x02$$^^\x04\x02))^^\x04\x02\v\v"' +
    '"\x03\x02\x7F\x7F\x05\x02\v\f\x0F\x0F""\x02\u0155\x02?\x03\x02\x02' +
    '\x02\x02A\x03\x02\x02\x02\x02C\x03\x02\x02\x02\x02E\x03\x02\x02\x02\x02' +
    'G\x03\x02\x02\x02\x02I\x03\x02\x02\x02\x02K\x03\x02\x02\x02\x02M\x03\x02' +
    '\x02\x02\x02O\x03\x02\x02\x02\x02Q\x03\x02\x02\x02\x02S\x03\x02\x02\x02' +
    '\x02U\x03\x02\x02\x02\x02W\x03\x02\x02\x02\x02Y\x03\x02\x02\x02\x02[\x03' +
    '\x02\x02\x02\x02]\x03\x02\x02\x02\x02_\x03\x02\x02\x02\x02a\x03\x02\x02' +
    '\x02\x02c\x03\x02\x02\x02\x02e\x03\x02\x02\x02\x02g\x03\x02\x02\x02\x02' +
    'i\x03\x02\x02\x02\x02k\x03\x02\x02\x02\x02m\x03\x02\x02\x02\x02o\x03\x02' +
    '\x02\x02\x02q\x03\x02\x02\x02\x02s\x03\x02\x02\x02\x02u\x03\x02\x02\x02' +
    '\x02w\x03\x02\x02\x02\x02y\x03\x02\x02\x02\x02{\x03\x02\x02\x02\x02}\x03' +
    '\x02\x02\x02\x03\x7F\x03\x02\x02\x02\x05\x81\x03\x02\x02\x02\x07\x83\x03' +
    '\x02\x02\x02\t\x85\x03\x02\x02\x02\v\x87\x03\x02\x02\x02\r\x89\x03\x02' +
    '\x02\x02\x0F\x8B\x03\x02\x02\x02\x11\x8D\x03\x02\x02\x02\x13\x8F\x03\x02' +
    '\x02\x02\x15\x91\x03\x02\x02\x02\x17\x93\x03\x02\x02\x02\x19\x95\x03\x02' +
    '\x02\x02\x1B\x97\x03\x02\x02\x02\x1D\x99\x03\x02\x02\x02\x1F\x9B\x03\x02' +
    '\x02\x02!\x9D\x03\x02\x02\x02#\x9F\x03\x02\x02\x02%\xA1\x03\x02\x02\x02' +
    "'\xA3\x03\x02\x02\x02)\xA5\x03\x02\x02\x02+\xA7\x03\x02\x02\x02-\xA9" +
    '\x03\x02\x02\x02/\xAB\x03\x02\x02\x021\xAD\x03\x02\x02\x023\xAF\x03\x02' +
    '\x02\x025\xB1\x03\x02\x02\x027\xB3\x03\x02\x02\x029\xB5\x03\x02\x02\x02' +
    ';\xC0\x03\x02\x02\x02=\xCB\x03\x02\x02\x02?\xCD\x03\x02\x02\x02A\xCF\x03' +
    '\x02\x02\x02C\xD1\x03\x02\x02\x02E\xD3\x03\x02\x02\x02G\xD5\x03\x02\x02' +
    '\x02I\xD7\x03\x02\x02\x02K\xD9\x03\x02\x02\x02M\xDB\x03\x02\x02\x02O\xE3' +
    '\x03\x02\x02\x02Q\xE5\x03\x02\x02\x02S\xE8\x03\x02\x02\x02U\xF8\x03\x02' +
    '\x02\x02W\u0113\x03\x02\x02\x02Y\u0115\x03\x02\x02\x02[\u0118\x03\x02' +
    '\x02\x02]\u011D\x03\x02\x02\x02_\u011F\x03\x02\x02\x02a\u0122\x03\x02' +
    '\x02\x02c\u0124\x03\x02\x02\x02e\u0127\x03\x02\x02\x02g\u012C\x03\x02' +
    '\x02\x02i\u0132\x03\x02\x02\x02k\u0136\x03\x02\x02\x02m\u0139\x03\x02' +
    '\x02\x02o\u013D\x03\x02\x02\x02q\u0142\x03\x02\x02\x02s\u0145\x03\x02' +
    '\x02\x02u\u014A\x03\x02\x02\x02w\u014D\x03\x02\x02\x02y\u0151\x03\x02' +
    '\x02\x02{\u015A\x03\x02\x02\x02}\u0161\x03\x02\x02\x02\x7F\x80\t\x02\x02' +
    '\x02\x80\x04\x03\x02\x02\x02\x81\x82\t\x03\x02\x02\x82\x06\x03\x02\x02' +
    '\x02\x83\x84\t\x04\x02\x02\x84\b\x03\x02\x02\x02\x85\x86\t\x05\x02\x02' +
    '\x86\n\x03\x02\x02\x02\x87\x88\t\x06\x02\x02\x88\f\x03\x02\x02\x02\x89' +
    '\x8A\t\x07\x02\x02\x8A\x0E\x03\x02\x02\x02\x8B\x8C\t\b\x02\x02\x8C\x10' +
    '\x03\x02\x02\x02\x8D\x8E\t\t\x02\x02\x8E\x12\x03\x02\x02\x02\x8F\x90\t' +
    '\n\x02\x02\x90\x14\x03\x02\x02\x02\x91\x92\t\v\x02\x02\x92\x16\x03\x02' +
    '\x02\x02\x93\x94\t\f\x02\x02\x94\x18\x03\x02\x02\x02\x95\x96\t\r\x02\x02' +
    '\x96\x1A\x03\x02\x02\x02\x97\x98\t\x0E\x02\x02\x98\x1C\x03\x02\x02\x02' +
    '\x99\x9A\t\x0F\x02\x02\x9A\x1E\x03\x02\x02\x02\x9B\x9C\t\x10\x02\x02\x9C' +
    ' \x03\x02\x02\x02\x9D\x9E\t\x11\x02\x02\x9E"\x03\x02\x02\x02\x9F\xA0' +
    '\t\x12\x02\x02\xA0$\x03\x02\x02\x02\xA1\xA2\t\x13\x02\x02\xA2&\x03\x02' +
    '\x02\x02\xA3\xA4\t\x14\x02\x02\xA4(\x03\x02\x02\x02\xA5\xA6\t\x15\x02' +
    '\x02\xA6*\x03\x02\x02\x02\xA7\xA8\t\x16\x02\x02\xA8,\x03\x02\x02\x02\xA9' +
    '\xAA\t\x17\x02\x02\xAA.\x03\x02\x02\x02\xAB\xAC\t\x18\x02\x02\xAC0\x03' +
    '\x02\x02\x02\xAD\xAE\t\x19\x02\x02\xAE2\x03\x02\x02\x02\xAF\xB0\t\x1A' +
    '\x02\x02\xB04\x03\x02\x02\x02\xB1\xB2\t\x1B\x02\x02\xB26\x03\x02\x02\x02' +
    '\xB3\xB4\t\x1C\x02\x02\xB48\x03\x02\x02\x02\xB5\xBB\x07$\x02\x02\xB6\xB7' +
    '\x07^\x02\x02\xB7\xBA\v\x02\x02\x02\xB8\xBA\n\x1D\x02\x02\xB9\xB6\x03' +
    '\x02\x02\x02\xB9\xB8\x03\x02\x02\x02\xBA\xBD\x03\x02\x02\x02\xBB\xB9\x03' +
    '\x02\x02\x02\xBB\xBC\x03\x02\x02\x02\xBC\xBE\x03\x02\x02\x02\xBD\xBB\x03' +
    '\x02\x02\x02\xBE\xBF\x07$\x02\x02\xBF:\x03\x02\x02\x02\xC0\xC6\x07)\x02' +
    '\x02\xC1\xC2\x07^\x02\x02\xC2\xC5\v\x02\x02\x02\xC3\xC5\n\x1E\x02\x02' +
    '\xC4\xC1\x03\x02\x02\x02\xC4\xC3\x03\x02\x02\x02\xC5\xC8\x03\x02\x02\x02' +
    '\xC6\xC4\x03\x02\x02\x02\xC6\xC7\x03\x02\x02\x02\xC7\xC9\x03\x02\x02\x02' +
    '\xC8\xC6\x03\x02\x02\x02\xC9\xCA\x07)\x02\x02\xCA<\x03\x02\x02\x02\xCB' +
    '\xCC\t\x1F\x02\x02\xCC>\x03\x02\x02\x02\xCD\xCE\x07.\x02\x02\xCE@\x03' +
    '\x02\x02\x02\xCF\xD0\x07*\x02\x02\xD0B\x03\x02\x02\x02\xD1\xD2\x07+\x02' +
    '\x02\xD2D\x03\x02\x02\x02\xD3\xD4\x07]\x02\x02\xD4F\x03\x02\x02\x02\xD5' +
    '\xD6\x07_\x02\x02\xD6H\x03\x02\x02\x02\xD7\xD8\x07}\x02\x02\xD8J\x03\x02' +
    '\x02\x02\xD9\xDA\x07\x7F\x02\x02\xDAL\x03\x02\x02\x02\xDB\xDD\x07}\x02' +
    '\x02\xDC\xDE\n \x02\x02\xDD\xDC\x03\x02\x02\x02\xDE\xDF\x03\x02\x02\x02' +
    '\xDF\xDD\x03\x02\x02\x02\xDF\xE0\x03\x02\x02\x02\xE0\xE1\x03\x02\x02\x02' +
    '\xE1\xE2\x07\x7F\x02\x02\xE2N\x03\x02\x02\x02\xE3\xE4\x05;\x1E\x02\xE4' +
    'P\x03\x02\x02\x02\xE5\xE6\x059\x1D\x02\xE6R\x03\x02\x02\x02\xE7\xE9\x07' +
    '/\x02\x02\xE8\xE7\x03\x02\x02\x02\xE8\xE9\x03\x02\x02\x02\xE9\xEB\x03' +
    '\x02\x02\x02\xEA\xEC\x057\x1C\x02\xEB\xEA\x03\x02\x02\x02\xEC\xED\x03' +
    '\x02\x02\x02\xED\xEB\x03\x02\x02\x02\xED\xEE\x03\x02\x02\x02\xEE\xF5\x03' +
    '\x02\x02\x02\xEF\xF1\t\x06\x02\x02\xF0\xF2\x057\x1C\x02\xF1\xF0\x03\x02' +
    '\x02\x02\xF2\xF3\x03\x02\x02\x02\xF3\xF1\x03\x02\x02\x02\xF3\xF4\x03\x02' +
    '\x02\x02\xF4\xF6\x03\x02\x02\x02\xF5\xEF\x03\x02\x02\x02\xF5\xF6\x03\x02' +
    '\x02\x02\xF6T\x03\x02\x02\x02\xF7\xF9\x07/\x02\x02\xF8\xF7\x03\x02\x02' +
    '\x02\xF8\xF9\x03\x02\x02\x02\xF9\xFB\x03\x02\x02\x02\xFA\xFC\x057\x1C' +
    '\x02\xFB\xFA\x03\x02\x02\x02\xFC\xFD\x03\x02\x02\x02\xFD\xFB\x03\x02\x02' +
    '\x02\xFD\xFE\x03\x02\x02\x02\xFE\xFF\x03\x02\x02\x02\xFF\u0101\x070\x02' +
    '\x02\u0100\u0102\x057\x1C\x02\u0101\u0100\x03\x02\x02\x02\u0102\u0103' +
    '\x03\x02\x02\x02\u0103\u0101\x03\x02\x02\x02\u0103\u0104\x03\x02\x02\x02' +
    '\u0104\u0111\x03\x02\x02\x02\u0105\u0109\t\x06\x02\x02\u0106\u0108\x07' +
    '/\x02\x02\u0107\u0106\x03\x02\x02\x02\u0108\u010B\x03\x02\x02\x02\u0109' +
    '\u0107\x03\x02\x02\x02\u0109\u010A\x03\x02\x02\x02\u010A\u010D\x03\x02' +
    '\x02\x02\u010B\u0109\x03\x02\x02\x02\u010C\u010E\x057\x1C\x02\u010D\u010C' +
    '\x03\x02\x02\x02\u010E\u010F\x03\x02\x02\x02\u010F\u010D\x03\x02\x02\x02' +
    '\u010F\u0110\x03\x02\x02\x02\u0110\u0112\x03\x02\x02\x02\u0111\u0105\x03' +
    '\x02\x02\x02\u0111\u0112\x03\x02\x02\x02\u0112V\x03\x02\x02\x02\u0113' +
    '\u0114\x07?\x02\x02\u0114X\x03\x02\x02\x02\u0115\u0116\x07#\x02\x02\u0116' +
    '\u0117\x07?\x02\x02\u0117Z\x03\x02\x02\x02\u0118\u0119\x07>\x02\x02\u0119' +
    '\u011A\x07@\x02\x02\u011A\u011B\x03\x02\x02\x02\u011B\u011C\b.\x02\x02' +
    '\u011C\\\x03\x02\x02\x02\u011D\u011E\x07@\x02\x02\u011E^\x03\x02\x02\x02' +
    '\u011F\u0120\x07@\x02\x02\u0120\u0121\x07?\x02\x02\u0121`\x03\x02\x02' +
    '\x02\u0122\u0123\x07>\x02\x02\u0123b\x03\x02\x02\x02\u0124\u0125\x07>' +
    '\x02\x02\u0125\u0126\x07?\x02\x02\u0126d\x03\x02\x02\x02\u0127\u0128\x05' +
    ')\x15\x02\u0128\u0129\x05%\x13\x02\u0129\u012A\x05+\x16\x02\u012A\u012B' +
    '\x05\v\x06\x02\u012Bf\x03\x02\x02\x02\u012C\u012D\x05\r\x07\x02\u012D' +
    "\u012E\x05\x03\x02\x02\u012E\u012F\x05\x19\r\x02\u012F\u0130\x05'\x14" +
    '\x02\u0130\u0131\x05\v\x06\x02\u0131h\x03\x02\x02\x02\u0132\u0133\x05' +
    '\x03\x02\x02\u0133\u0134\x05\x1D\x0F\x02\u0134\u0135\x05\t\x05\x02\u0135' +
    'j\x03\x02\x02\x02\u0136\u0137\x05\x1F\x10\x02\u0137\u0138\x05%\x13\x02' +
    '\u0138l\x03\x02\x02\x02\u0139\u013A\x05\x1D\x0F\x02\u013A\u013B\x05\x1F' +
    '\x10\x02\u013B\u013C\x05)\x15\x02\u013Cn\x03\x02\x02\x02\u013D\u013E\x05' +
    '\x1D\x0F\x02\u013E\u013F\x05+\x16\x02\u013F\u0140\x05\x19\r\x02\u0140' +
    '\u0141\x05\x19\r\x02\u0141p\x03\x02\x02\x02\u0142\u0143\x05\x13\n\x02' +
    "\u0143\u0144\x05'\x14\x02\u0144r\x03\x02\x02\x02\u0145\u0146\x05\x19" +
    '\r\x02\u0146\u0147\x05\x13\n\x02\u0147\u0148\x05\x17\f\x02\u0148\u0149' +
    '\x05\v\x06\x02\u0149t\x03\x02\x02\x02\u014A\u014B\x05\x13\n\x02\u014B' +
    '\u014C\x05\x1D\x0F\x02\u014Cv\x03\x02\x02\x02\u014D\u014E\x05\x11\t\x02' +
    "\u014E\u014F\x05\x03\x02\x02\u014F\u0150\x05'\x14\x02\u0150x\x03\x02" +
    '\x02\x02\u0151\u0152\x05\x1D\x0F\x02\u0152\u0153\x05\x1F\x10\x02\u0153' +
    '\u0154\x05)\x15\x02\u0154\u0155\x05=\x1F\x02\u0155\u0156\x05\x19\r\x02' +
    '\u0156\u0157\x05\x13\n\x02\u0157\u0158\x05\x17\f\x02\u0158\u0159\x05\v' +
    '\x06\x02\u0159z\x03\x02\x02\x02\u015A\u015B\x05\x1D\x0F\x02\u015B\u015C' +
    '\x05\x1F\x10\x02\u015C\u015D\x05)\x15\x02\u015D\u015E\x05=\x1F\x02\u015E' +
    '\u015F\x05\x13\n\x02\u015F\u0160\x05\x1D\x0F\x02\u0160|\x03\x02\x02\x02' +
    '\u0161\u0162\t!\x02\x02\u0162\u0163\x03\x02\x02\x02\u0163\u0164\b?\x03' +
    '\x02\u0164~\x03\x02\x02\x02\x12\x02\xB9\xBB\xC4\xC6\xDF\xE8\xED\xF3\xF5' +
    '\xF8\xFD\u0103\u0109\u010F\u0111\x04\t\x10\x02\x02\x03\x02';
  public static __ATN: ATN;
  public static get _ATN(): ATN {
    if (!QueryLexer.__ATN) {
      QueryLexer.__ATN = new ATNDeserializer().deserialize(
        Utils.toCharArray(QueryLexer._serializedATN)
      );
    }

    return QueryLexer.__ATN;
  }
}
