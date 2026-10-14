import type {CertificateTemplate,PhotoFrame} from './certificate-templates';
export const certificateCanvas=[1536,1024] as const;
export const certificateCardBox:[number,number,number,number]=[64,80,1408,864];
export function cleanCertificateLayout(original:CertificateTemplate):CertificateTemplate{
 const clean=original.clean;
 if(!clean)return original;
 const bounds=clean.artBounds||[0,0,clean.width,clean.height];
 const [left,top,width,height]=bounds,[x,y,w,h]=certificateCardBox,sx=w/width,sy=h/height;
 const point=([px,py]:[number,number]):[number,number]=>[x+(px-left)*sx,y+(py-top)*sy];
 const p=clean.photo;let photo:PhotoFrame;
 if(p.quad){const quad=p.quad.map(point) as PhotoFrame['quad'];const [tl,tr,br,bl]=quad!;photo={x:0,y:0,width:(Math.hypot(tr[0]-tl[0],tr[1]-tl[1])+Math.hypot(br[0]-bl[0],br[1]-bl[1]))/2,height:(Math.hypot(bl[0]-tl[0],bl[1]-tl[1])+Math.hypot(br[0]-tr[0],br[1]-tr[1]))/2,quad};}
 else{const [px,py]=point([p.x,p.y]);photo={x:px,y:py,width:p.width*sx,height:p.height*sy};}
 if(p.outline)photo.outline=p.outline.map(point);
 return{...original,...clean,width:certificateCanvas[0],height:certificateCanvas[1],photo,sourceCrop:bounds as [number,number,number,number],destination:certificateCardBox};
}
