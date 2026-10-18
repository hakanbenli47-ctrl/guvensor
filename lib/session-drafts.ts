import type {Question} from "./study";

export type SessionMode="ders"|"tekrar"|"deneme";
export interface StudySession {
 questions:Question[];
 step:"learn"|"quiz"|"result";
 index:number;
 selected:Record<number,number>;
 mode:SessionMode;
 topicId?:string;
 blockId?:string;
 examType?:"Mini"|"TYT"|"AYT"|"Seviye";
 startedAt:number;
 questionStartedAt:number;
 pausedAt?:number;
 lessonSection?:number;
}
export type DraftCollection=Record<string,StudySession>;
export interface CloudPayload {
 version:2;
 progress:unknown;
 drafts:DraftCollection;
 session:null;
}
export function draftKey(s:StudySession):string {
 if(s.blockId)return "plan:"+s.blockId;
 if(s.examType)return "exam:"+s.examType;
 return "topic:"+s.mode+":"+(s.topicId||"unknown");
}
export function validDraft(value:unknown):value is StudySession{
 if(!value||typeof value!=="object")return false;
 const s=value as Partial<StudySession>;
 return (s.step==="learn"||s.step==="quiz")&&
  (s.mode==="ders"||s.mode==="deneme"||s.mode==="tekrar")&&
  Array.isArray(s.questions)&&s.questions.length>0&&
  s.questions.every(q=>q&&typeof q.id==="string"&&Array.isArray(q.choices))&&
  typeof s.startedAt==="number"&&Number.isFinite(s.startedAt)&&
  typeof s.questionStartedAt==="number"&&
  typeof s.index==="number"&&s.index>=0&&s.index<s.questions.length&&
  Boolean(s.selected)&&typeof s.selected==="object";
}
export function freezeDraft(s:StudySession,time=Date.now()):StudySession{
 return {...s,pausedAt:time};
}
export function resumeDraft(s:StudySession,time=Date.now()):StudySession{
 const pause=Math.max(0,time-(s.pausedAt??time));
 return {...s,startedAt:s.startedAt+pause,questionStartedAt:s.questionStartedAt+pause,pausedAt:undefined};
}
export function safeDraftCollection(value:unknown,storedAt=Date.now()):DraftCollection {
 if(!value||typeof value!=="object"||Array.isArray(value))return {};
 const result:DraftCollection={};
 for(const session of Object.values(value)){
  if(validDraft(session)){
   const d=freezeDraft(session,session.pausedAt??storedAt);
   result[draftKey(d)]=d;
  }
 }
 return result;
}
export function combinedDrafts(drafts:DraftCollection,current:StudySession|null,at=Date.now()):DraftCollection {
 if(!current||current.step==="result")return {...drafts};
 return {...drafts,[draftKey(current)]:freezeDraft(current,at)};
}
export function sessionDescription(s:StudySession):string {
 if(s.step==="learn")return (s.lessonSection??0)+" bölüm tamamlandı";
 return (s.index+1)+". soru · "+Object.keys(s.selected).length+"/"+s.questions.length+" cevap";
}
