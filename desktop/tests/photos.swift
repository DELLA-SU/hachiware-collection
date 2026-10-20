import Foundation

@main
struct DesktopPhotosCheck {
 static func main() throws {
  let before=ISO8601DateFormatter().date(from:"2026-10-20T14:59:59Z")!,after=before.addingTimeInterval(1)
  precondition(DesktopDrawHistory.dayKey(before)=="2026-10-20")
  precondition(DesktopDrawHistory.dayKey(after)=="2026-10-21")
  let photos=[DesktopDrawCandidate(id:"main",character:"hachiware"),DesktopDrawCandidate(id:"side",character:"armor-pochette")]
  var history=DesktopDrawHistory(day:DesktopDrawHistory.dayKey(before),ids:[])
  history.record("side",on:before)
  let restored=try JSONDecoder().decode(DesktopDrawHistory.self,from:JSONEncoder().encode(history))
  precondition(restored.seen(on:before)==["side"])
  precondition(desktopDrawPool(photos,today:restored.seen(on:before),seen:["main","side"],mainTurn:false).map{$0.id}==["main"])
  history.record("main",on:before)
  precondition(desktopDrawPool(photos,today:history.seen(on:before),seen:[],mainTurn:true).isEmpty)
  precondition(desktopDrawPool(photos,today:history.seen(on:after),seen:["main","side"],mainTurn:false).map{$0.id}==["side"])
  history.record("main",on:after);precondition(history.ids==["main"])
  let id=String(repeating:"a",count:64),request=UUID().uuidString
  let url=desktopArchiveURL(photoID:id,requestID:request)!
  precondition(url.host=="della-su.github.io"&&url.query=="skip_intro=1")
  precondition(url.fragment=="desktop_photo="+id+"&request="+request)
  precondition(desktopArchiveURL(photoID:"invalid",requestID:request)==nil)
  precondition(desktopArchiveURL(photoID:id,requestID:"invalid")==nil)
  for screen in [CGSize(width:1280,height:720),CGSize(width:1440,height:790),CGSize(width:1024,height:550),CGSize(width:800,height:500)]{
   let size=desktopPhotoContentSize(screen:screen)
   precondition(size.width<=640&&size.height<=700&&size.width<screen.width&&size.height+50<screen.height)
  }
  print("Desktop photos checks passed: Korea midnight, persisted no-repeat history, category fallback, exhaustion and exact-photo save URL.")
 }
}
