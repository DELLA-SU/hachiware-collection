import Foundation
import CoreGraphics
let main=CGRect(x:0,y:25,width:1440,height:850),left=CGRect(x:-1920,y:0,width:1920,height:1080)
func check(_ origin:CGPoint,_ size:CGFloat,_ screens:[CGRect],_ expected:CGPoint){precondition(visiblePetOrigin(origin,size:size,screens:screens)==expected,"Position check failed for \(origin)")}
check(CGPoint(x:100,y:100),160,[main],CGPoint(x:100,y:100))
check(CGPoint(x:3000,y:-900),240,[main],CGPoint(x:1180,y:45))
check(CGPoint(x:-1800,y:100),160,[main,left],CGPoint(x:-1800,y:100))
check(CGPoint(x:-1800,y:100),160,[main],CGPoint(x:20,y:100))
check(CGPoint(x:1390,y:830),240,[main],CGPoint(x:1180,y:615))
check(CGPoint(x:CGFloat.nan,y:CGFloat.infinity),160,[main],CGPoint(x:1230,y:125))
for size:CGFloat in [120,160,200,240]{
 for x in stride(from:-3000,through:3000,by:200){for y in stride(from:-1000,through:2000,by:200){
  let p=visiblePetOrigin(CGPoint(x:x,y:y),size:size,screens:[main,left])
  precondition([main,left].contains{ $0.contains(CGRect(x:p.x-5,y:p.y-9,width:size+10,height:size+18)) },"Mascot can leave screen")
 }}
}
print("Pet position checks passed: all sizes, offscreen restore, detached/negative displays, idle motion and invalid saved coordinates.")
