import { ObjectId } from 'mongodb';
import { StatusStudent } from '../enum/status-student';
import { StatusOnline } from '../enum/stautus-online';
export interface Student {
  _id?: string;
  name: string;
  email: string;
  tax_ident_number: string;
  personal_ident_number: string;
  login: string;
  password: string;
  status?: StatusStudent;
  online?: StatusOnline;
  course?: ObjectId[];
  lesson_done?: ObjectId[];
  scheduled_lessons?: ObjectId[];
  books?: ObjectId[];
  list_word_text?: ObjectId[];
  gender: string;
  fone_number: string;
  end: string;
  country: string;
  city: string;
  spoken_language: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  tictok: string;
  x: string;
  image_url: string;
  date_create: Date;
  bitcoin?: ObjectId[];
}


