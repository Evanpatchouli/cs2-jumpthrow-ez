import { text as _text, json, urlencoded } from 'express';
import multer from 'multer';

const text = _text({type: 'text'});
const jsonParser = json({type: 'application/json'});
const formParser = urlencoded({extended: false});
const formParserPlus = urlencoded({extended: true});
const multiParser = multer().any();

export const Text = text;
export const Json = jsonParser;
export const Form = formParser;
export const FromPlus = formParserPlus;
export const Multi = multiParser;
