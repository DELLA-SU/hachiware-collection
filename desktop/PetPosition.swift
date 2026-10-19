import Foundation
import CoreGraphics

// Keep the whole mascot and its idle bobbing inside an available display.
func visiblePetOrigin(_ origin: CGPoint, size: CGFloat, screens: [CGRect]) -> CGPoint {
 let frames = screens.filter { !$0.isEmpty && !$0.isInfinite && !$0.isNull }
 guard let first = frames.first else { return origin }
 let point = origin.x.isFinite && origin.y.isFinite ? origin : CGPoint(x:first.maxX-size-50,y:first.minY+100)
 let pet = CGRect(origin:point,size:CGSize(width:size,height:size))
 let overlap = { (screen:CGRect) -> CGFloat in let r=screen.intersection(pet);return r.isNull ? 0:r.width*r.height }
 let distance = { (screen:CGRect) -> CGFloat in let x=max(screen.minX-pet.midX,0,pet.midX-screen.maxX),y=max(screen.minY-pet.midY,0,pet.midY-screen.maxY);return x*x+y*y }
 let screen = frames.min { a,b in overlap(a)==overlap(b) ? distance(a)<distance(b):overlap(a)>overlap(b) } ?? first
 let margin:CGFloat=20
 return CGPoint(x:min(max(point.x,screen.minX+margin),max(screen.minX+margin,screen.maxX-size-margin)),y:min(max(point.y,screen.minY+margin),max(screen.minY+margin,screen.maxY-size-margin)))
}
