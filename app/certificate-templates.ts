import {assetUrl} from './asset-url';
export type CertificateTemplate={id:string;name:string;category:string;image:string;width:number;height:number;photo:{x:number;y:number;width:number;height:number};kind:'reference'|'fan';};
export const certificateTemplates:CertificateTemplate[]=[
 {id:'grass-5',name:'풀뽑기 검정 5급',category:'풀뽑기 검정',image:assetUrl('certificates/grass-5.webp'),width:455,height:374,photo:{x:288,y:108,width:98,height:114},kind:'reference'},
 {id:'grass-3',name:'풀뽑기 검정 3급',category:'풀뽑기 검정',image:assetUrl('certificates/grass-3.webp'),width:455,height:374,photo:{x:293,y:108,width:95,height:114},kind:'reference'},
 {id:'super-worker',name:'슈퍼 아르바이터',category:'슈퍼 아르바이터',image:assetUrl('certificates/super-worker.svg'),width:900,height:570,photo:{x:632,y:155,width:174,height:220},kind:'fan'},
 {id:'drink-license',name:'음주 자격',category:'음주 자격',image:assetUrl('certificates/drink-license.svg'),width:900,height:570,photo:{x:632,y:155,width:174,height:220},kind:'fan'},
];
export const qualifications=[
 {name:'풀뽑기 검정',original:'草むしり検定',text:'풀뽑기 일을 위한 검정. 치이카와가 친구들에게 선물을 주기 위해 공부하는 이야기와 이어져요.',source:'https://cstation.kodansha.co.jp/mangaip/database/0000354016',sourceLabel:'코단샤 작품 소개'},
 {name:'슈퍼 아르바이터',original:'スーパーアルバイター',text:'시사가 가진 자격. 라멘 가게에서 일하는 시사의 이야기와 연결돼요.',source:'https://dengekionline.com/article/202610/90586',sourceLabel:'시사의 자격 이야기'},
 {name:'음주 자격',original:'お酒の資格',text:'작품 속에서 술을 마시는 것과 관련된 자격. 시사와 쿠리만쥬의 이야기에도 등장해요.',source:'https://dengekionline.com/article/202610/90586',sourceLabel:'음주 자격 이야기'},
];
