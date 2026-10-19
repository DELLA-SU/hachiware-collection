import Cocoa
import WebKit

let publicSite = "https://della-su.github.io/hachiware-collection/"
let startupCheck = CommandLine.arguments.contains("--startup-check")
class PetView: NSView {
 var image: NSImage?
 var action: (() -> Void)?
 var doubleAction: (() -> Void)?
 var pendingClick: DispatchWorkItem?
 var menuAction: (() -> Void)?
 var launchAction: (() -> Void)?
 var throwAction: ((NSPoint)->Void)?
 var dragSamples: [(point:NSPoint,time:Double)] = []
 var hoverAction: ((Bool)->Void)?
 var flung = false
 var inFlight = false
 var flightSpin = 900.0
 var bounceSquash = 0.0
 var start: NSPoint = .zero
 var base: NSPoint = .zero
 var moved = false
 var dragging = false
 var dragEnded: (() -> Void)?
 var hovering = false
 var angle = 0.0
 var hoverDuration = 0.0
 var lastFrame = Date.timeIntervalSinceReferenceDate
 override func updateTrackingAreas(){super.updateTrackingAreas();for area in trackingAreas{removeTrackingArea(area)};addTrackingArea(NSTrackingArea(rect:bounds,options:[.mouseEnteredAndExited,.activeAlways,.inVisibleRect],owner:self,userInfo:nil))}
 override func mouseEntered(with event:NSEvent){hovering=true;hoverDuration=0;flung=false;hoverAction?(true)}
 override func mouseExited(with event:NSEvent){hovering=false;hoverAction?(false)}

 override func draw(_ rect: NSRect) {
 guard let image=image else{return}
 let now=Date.timeIntervalSinceReferenceDate
 let dt=min(0.05,max(0,now-lastFrame));lastFrame=now
 bounceSquash *= pow(0.02,dt)
 if inFlight {angle += dt*flightSpin}
 else if hovering && NSEvent.pressedMouseButtons == 0 {hoverDuration += dt;angle += dt*min(720,240+hoverDuration*100);if hoverDuration>=5 && !flung{flung=true;launchAction?()}}
 else if angle>0 {let target=ceil(angle/360)*360;angle=min(target,angle+dt*600);if angle>=target{angle=0}}
 NSGraphicsContext.saveGraphicsState()
 let tr=NSAffineTransform();tr.translateX(by:bounds.midX,yBy:bounds.midY);tr.rotate(byDegrees:CGFloat(angle.truncatingRemainder(dividingBy:360)));tr.scaleX(by:CGFloat(1+0.26*bounceSquash),yBy:CGFloat(1-0.20*bounceSquash));tr.concat()
 let side=min(bounds.width,bounds.height)-24
 let ratio=image.size.width/image.size.height
 let w=ratio>1 ? side : side*ratio, h=ratio>1 ? side/ratio : side
 image.draw(in:NSRect(x:-w/2,y:-h/2,width:w,height:h),from:.zero,operation:.sourceOver,fraction:1)
 NSGraphicsContext.restoreGraphicsState()
 }
 override func mouseDown(with event: NSEvent) { dragging=true;start = NSEvent.mouseLocation; base = window!.frame.origin; moved = false; dragSamples=[(start,Date.timeIntervalSinceReferenceDate)] }
 override func mouseDragged(with event: NSEvent) { pendingClick?.cancel(); let p = NSEvent.mouseLocation; let now=Date.timeIntervalSinceReferenceDate; dragSamples.append((p,now));dragSamples.removeAll{now-$0.time>0.12}; moved = moved || hypot(p.x-start.x,p.y-start.y)>5; window?.setFrameOrigin(NSPoint(x:base.x+p.x-start.x,y:base.y+p.y-start.y)) }
 override func mouseUp(with event: NSEvent) { dragging=false;if moved { let now=Date.timeIntervalSinceReferenceDate;let p=NSEvent.mouseLocation;if let sample=dragSamples.first,now-sample.time<0.16{let dt=max(0.016,now-sample.time);let velocity=NSPoint(x:(p.x-sample.point.x)/dt,y:(p.y-sample.point.y)/dt);if hypot(velocity.x,velocity.y)>350{throwAction?(velocity);return}}; if let p=window?.frame.origin { UserDefaults.standard.set(p.x,forKey:"x");UserDefaults.standard.set(p.y,forKey:"y");dragEnded?() } } else if event.clickCount>=2 { pendingClick?.cancel();pendingClick=nil;doubleAction?() } else { pendingClick?.cancel();let work=DispatchWorkItem{[weak self] in self?.action?()};pendingClick=work;DispatchQueue.main.asyncAfter(deadline:.now()+NSEvent.doubleClickInterval+0.05,execute:work) } }
 override func rightMouseDown(with event: NSEvent) { menuAction?() }
}
class ClickableImageView: NSImageView {
 var onClick:(()->Void)?
 override func mouseUp(with event:NSEvent){onClick?()}
}
class App: NSObject, NSApplicationDelegate, NSWindowDelegate {
 var musicWindow:NSWindow?
 var musicView:WKWebView?
 var lastDesktopPhoto:String?
 var pet: NSPanel!
 var status: NSStatusItem!
 var timer: Timer?
 var server: Process?
 var busy = false
 var base = NSPoint.zero
 var tick = 0.0
 var result: NSWindow?
 var requestID: String?
 var unaSound: NSSound?
 var voiceBag: [String] = []
 var lastVoice = ""
 var motionSounds: [NSSound] = []
 var spinSound: NSSound?
 var spinLevel = 0
 var soundsEnabled = true
 var petSize:CGFloat = 160
 var sizeItems:[NSMenuItem] = []
 var lastBounceSound = 0.0
 var flightTime: Double?
 var flightPoint = NSPoint.zero
 var flightVelocity = NSPoint.zero
 var returnPoint = NSPoint.zero
 var flightBounds = NSRect.zero
 var bounceCount = 0
 func applicationDidFinishLaunching(_ notification: Notification) {
  NSApp.setActivationPolicy(.accessory)
  guard let characterURL=Bundle.main.url(forResource:"character",withExtension:"png"),let character=NSImage(contentsOf:characterURL),character.isValid else{
   if startupCheck{fputs("Missing or invalid character.png\n",stderr);exit(1)}
   let alert=NSAlert();alert.messageText="앱 파일을 다시 받아 주세요";alert.informativeText="캐릭터 파일이 없거나 손상되었어요. ZIP 파일의 압축을 모두 푼 다음 치이 친구.app 전체를 응용 프로그램 폴더로 옮겨 주세요.";alert.runModal();NSApp.terminate(nil);return
  }
  NSApp.applicationIconImage=character
  soundsEnabled=UserDefaults.standard.object(forKey:"motionSounds") as? Bool ?? true
  let savedSize=UserDefaults.standard.integer(forKey:"petSize")
  petSize=CGFloat([120,160,200,240].contains(savedSize) ? savedSize : 160)
  let menu=NSMenu()
  menu.addItem(withTitle:"오늘의 치이 친구 보여줘",action:#selector(collect),keyEquivalent:"")
  menu.addItem(withTitle:"치이카와 가챠 열기",action:#selector(openArchive),keyEquivalent:"")
  menu.addItem(withTitle:"하치와레 노래 TV",action:#selector(openMusic),keyEquivalent:"")
  menu.addItem(withTitle:"캐릭터 위치 초기화",action:#selector(resetPosition),keyEquivalent:"")
  let sizeMenu=NSMenu(title:"캐릭터 크기")
  for (title,size) in [("작게 · 75%",120),("기본 · 100%",160),("크게 · 125%",200),("아주 크게 · 150%",240)]{let item=NSMenuItem(title:title,action:#selector(changeSize(_:)),keyEquivalent:"");item.tag=size;item.target=self;item.state=CGFloat(size)==petSize ? .on : .off;sizeMenu.addItem(item);sizeItems.append(item)}
  let sizeItem=menu.addItem(withTitle:"캐릭터 크기",action:nil,keyEquivalent:"");sizeItem.submenu=sizeMenu
  let soundItem=menu.addItem(withTitle:"효과음 켜기",action:#selector(toggleSounds),keyEquivalent:"");soundItem.state=soundsEnabled ? .on : .off
  menu.addItem(.separator())
  menu.addItem(withTitle:"종료",action:#selector(quit),keyEquivalent:"q")
  for item in menu.items { item.target=self }
  status=NSStatusBar.system.statusItem(withLength:NSStatusItem.variableLength);status.button?.title="🐾";status.menu=menu
  status.isVisible = !startupCheck
  pet=NSPanel(contentRect:NSRect(x:0,y:0,width:petSize,height:petSize),styleMask:[.borderless,.nonactivatingPanel],backing:.buffered,defer:false)
  pet.hidesOnDeactivate=false;pet.canHide=false;pet.isFloatingPanel=true
  pet.isOpaque=false;pet.backgroundColor = .clear;pet.hasShadow=false;pet.level = .floating;pet.collectionBehavior=[.canJoinAllSpaces,.fullScreenAuxiliary];pet.isReleasedWhenClosed=false
  let v=PetView(frame:NSRect(x:0,y:0,width:petSize,height:petSize));v.autoresizingMask=[.width,.height];v.image=character;v.action={ [weak self] in self?.collect() };v.doubleAction={ [weak self] in self?.openMusic() };v.menuAction={ [weak self,weak v] in if let menu=self?.status.menu,let view=v,let event=NSApp.currentEvent{NSMenu.popUpContextMenu(menu,with:event,for:view)} };v.launchAction={ [weak self] in self?.launchPet() };v.throwAction={ [weak self] velocity in self?.throwPet(velocity) };v.hoverAction={ [weak self] active in self?.setSpin(active ? 1 : 0) };v.dragEnded={ [weak self] in guard let self=self else{return};self.base=self.pet.frame.origin;self.restorePetVisibility() };pet.contentView=v
  let screen=NSScreen.main?.visibleFrame ?? NSRect(x:0,y:0,width:1200,height:800);base=NSPoint(x:screen.maxX-petSize-50,y:screen.minY+100)
  if UserDefaults.standard.object(forKey:"x") != nil { base=NSPoint(x:UserDefaults.standard.double(forKey:"x"),y:UserDefaults.standard.double(forKey:"y"));pet.setFrameOrigin(base) }
  clampPetPosition();pet.setFrameOrigin(base)
  if !startupCheck{pet.orderFrontRegardless()}
  if CommandLine.arguments.contains("--music-preview"){openMusic()}
  if !startupCheck{
   NotificationCenter.default.addObserver(self,selector:#selector(restorePetVisibility),name:NSApplication.didChangeScreenParametersNotification,object:nil)
   for name in [NSWorkspace.didWakeNotification,NSWorkspace.screensDidWakeNotification,NSWorkspace.activeSpaceDidChangeNotification]{NSWorkspace.shared.notificationCenter.addObserver(self,selector:#selector(restorePetVisibility),name:name,object:nil)}
  }
  timer=Timer.scheduledTimer(withTimeInterval:1.0/30.0,repeats:true){ [weak self] _ in guard let s=self else{return}; if let v=s.pet.contentView as? PetView,v.dragging { s.base=s.pet.frame.origin;s.flightTime=nil;(s.pet.contentView as? PetView)?.inFlight=false;return };if let v=s.pet.contentView as? PetView,v.hovering && !v.inFlight{s.setSpin(v.hoverDuration>4 ? 3 : v.hoverDuration>2 ? 2 : 1)};s.pet.contentView?.needsDisplay=true;s.tick += 1.0/30.0;if s.flightTime != nil{s.advanceFlight()}else{s.pet.setFrameOrigin(NSPoint(x:s.base.x+sin(s.tick*0.65)*5,y:s.base.y+sin(s.tick*1.15)*9))} }
  if startupCheck{Task{[weak self] in try? await Task.sleep(nanoseconds:1_000_000_000);await MainActor.run{self?.finishStartupCheck()}}}
 }
 func finishStartupCheck(){
  guard tick>0,let url=Bundle.main.url(forResource:"catalog",withExtension:"json"),let data=try? Data(contentsOf:url),let photos=try? JSONSerialization.jsonObject(with:data) as? [[String:Any]],!photos.isEmpty,let resourcePath=Bundle.main.resourcePath,let first=photos.first?["image_url"] as? String,let image=NSImage(contentsOfFile:resourcePath+"/"+first),image.isValid else{fputs("Startup check failed: event loop or bundled photos\n",stderr);exit(1)}
  let version=Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown"
  print("Startup check passed: responsive main loop, character, catalog and bundled photo; version \(version)")
  NSApp.terminate(nil)
 }
 func applicationShouldHandleReopen(_ sender:NSApplication,hasVisibleWindows flag:Bool)->Bool{restorePetVisibility();return true}
 func launchPet(){
  guard flightTime == nil else{return}
  setSpin(0);playEffect("launch")
  flightTime=0;flightPoint=pet.frame.origin;bounceCount=0
  flightBounds=pet.screen?.visibleFrame ?? NSScreen.main!.visibleFrame
  flightVelocity=NSPoint(x:flightPoint.x>flightBounds.midX ? -1450 : 1450,y:1050)
  if let v=pet.contentView as? PetView{v.inFlight=true;v.flightSpin=1100;v.bounceSquash=0}
 }
 func throwPet(_ velocity:NSPoint){
  flightTime=nil;base=pet.frame.origin
  let r=pet.screen?.visibleFrame ?? NSScreen.main!.visibleFrame
  base.x=min(max(base.x,r.minX+8),max(r.minX+8,r.maxX-pet.frame.width-8));base.y=min(max(base.y,r.minY+8),max(r.minY+8,r.maxY-pet.frame.height-8))
  UserDefaults.standard.set(base.x,forKey:"x");UserDefaults.standard.set(base.y,forKey:"y")
  launchPet()
  let speed=hypot(velocity.x,velocity.y),scale=min(2600,max(1000,speed))/speed
  flightVelocity=NSPoint(x:velocity.x*scale,y:velocity.y*scale)
  if let v=pet.contentView as? PetView{v.hovering=false;v.flightSpin=velocity.x<0 ? -1100 : 1100}
 }
 func bouncePet(){
  bounceCount += 1
  let now=Date.timeIntervalSinceReferenceDate;if now-lastBounceSound>0.075{playEffect("bounce-"+String(1+(bounceCount%3)));lastBounceSound=now}
  if let v=pet.contentView as? PetView{v.bounceSquash=1;v.flightSpin=(bounceCount%2 == 0 ? 1.0 : -1.0)*min(1750,1100+Double(bounceCount)*90)}
 }
 func advanceFlight(){
  guard let t=flightTime else{return}
  let dt=1.0/30.0;flightTime=t+dt
  let playDuration=3.8,returnDuration=0.9
  if t<playDuration {
   let r=flightBounds,minX=r.minX+8,maxX=max(minX,r.maxX-pet.frame.width-8),minY=r.minY+8,maxY=max(minY,r.maxY-pet.frame.height-8)
   for _ in 0..<2 {
    let step=dt/2
    flightVelocity.y -= 1250*step
    flightPoint.x += flightVelocity.x*step;flightPoint.y += flightVelocity.y*step
    if flightPoint.x<minX{flightPoint.x=minX;flightVelocity.x=abs(flightVelocity.x);bouncePet()}
    else if flightPoint.x>maxX{flightPoint.x=maxX;flightVelocity.x = -abs(flightVelocity.x);bouncePet()}
    if flightPoint.y<minY{flightPoint.y=minY;flightVelocity.y=max(950,abs(flightVelocity.y)*0.96);bouncePet()}
    else if flightPoint.y>maxY{flightPoint.y=maxY;flightVelocity.y = -max(500,abs(flightVelocity.y)*0.9);bouncePet()}
   }
   returnPoint=flightPoint;pet.setFrameOrigin(flightPoint)
  }else{
   let u=min(1,(t-playDuration)/returnDuration),eased=u*u*(3-2*u)
   pet.setFrameOrigin(NSPoint(x:returnPoint.x+(base.x-returnPoint.x)*eased,y:returnPoint.y+(base.y-returnPoint.y)*eased+sin(u * .pi)*45))
   if u>=1{playEffect("return");flightTime=nil;pet.setFrameOrigin(base);if let v=pet.contentView as? PetView{v.inFlight=false;v.hovering=false;v.angle=0;v.bounceSquash=0;v.flung=true}}
  }
 }
 func clampPetPosition(){
  let main=NSScreen.main,others=NSScreen.screens.filter{$0 !== main}
  base=visiblePetOrigin(base,size:petSize,screens:([main].compactMap{$0}+others).map{$0.visibleFrame})
 }
 @objc func restorePetVisibility(){
  guard pet != nil,!startupCheck else{return}
  flightTime=nil;setSpin(0)
  if let view=pet.contentView as? PetView{view.inFlight=false;view.hovering=false;view.angle=0;view.lastFrame=Date.timeIntervalSinceReferenceDate;view.needsDisplay=true}
  clampPetPosition();pet.setFrameOrigin(base);pet.alphaValue=1
  NSApp.unhideWithoutActivation();pet.orderFrontRegardless()
 }
 func applicationDidBecomeActive(_ notification:Notification){restorePetVisibility()}

 @objc func changeSize(_ sender:NSMenuItem){guard [120,160,200,240].contains(sender.tag) else{return};let center=NSPoint(x:pet.frame.midX,y:pet.frame.midY);flightTime=nil;spinSound?.stop();spinLevel=0;petSize=CGFloat(sender.tag);pet.setContentSize(NSSize(width:petSize,height:petSize));base=NSPoint(x:center.x-petSize/2,y:center.y-petSize/2);clampPetPosition();pet.setFrameOrigin(base);if let v=pet.contentView as? PetView{v.inFlight=false;v.hovering=false;v.angle=0;v.bounceSquash=0;v.needsDisplay=true};UserDefaults.standard.set(sender.tag,forKey:"petSize");UserDefaults.standard.set(base.x,forKey:"x");UserDefaults.standard.set(base.y,forKey:"y");for item in sizeItems{item.state=item.tag==sender.tag ? .on : .off}}
 @objc func resetPosition(){flightTime=nil;let r=NSScreen.main?.visibleFrame ?? NSRect(x:0,y:0,width:1200,height:800);base=NSPoint(x:r.maxX-petSize-50,y:r.minY+100);restorePetVisibility();UserDefaults.standard.removeObject(forKey:"x");UserDefaults.standard.removeObject(forKey:"y")}
 @objc func collect(){
  guard !busy else{return};busy=true;setSpin(0);status.button?.title="⏳"
  Task {do{
   var photos:[[String:Any]]=[]
   var request=URLRequest(url:URL(string:publicSite+"catalog.json")!);request.timeoutInterval=15;request.cachePolicy = .reloadIgnoringLocalCacheData
   if let (data,response)=try? await URLSession.shared.data(for:request),(response as? HTTPURLResponse)?.statusCode==200,data.count<6_000_000,let list=try? JSONSerialization.jsonObject(with:data) as? [[String:Any]]{photos=list}
   if photos.isEmpty,let url=Bundle.main.url(forResource:"catalog",withExtension:"json"),let data=try? Data(contentsOf:url),let list=try? JSONSerialization.jsonObject(with:data) as? [[String:Any]]{photos=list}
   photos=photos.filter{p in guard let id=p["id"] as? String else{return false};return p["draw_enabled"] as? Bool != false && id.range(of:"^[a-f0-9]{64}$",options:.regularExpression) != nil && p["image_url"] as? String == "photos/"+id+".jpg"}
   var seen=Set(UserDefaults.standard.stringArray(forKey:"seenDesktopPhotoIDs") ?? [])
#if PERSONAL_BUILD
   if !UserDefaults.standard.bool(forKey:"desktopPhotosInitialized"),let url=Bundle.main.url(forResource:"legacy-collected-ids",withExtension:"json"),let data=try? Data(contentsOf:url),let ids=try? JSONSerialization.jsonObject(with:data) as? [String]{seen.formUnion(ids);UserDefaults.standard.set(true,forKey:"desktopPhotosInitialized")}
#endif
   let mainTurn=UserDefaults.standard.integer(forKey:"desktopDrawCount")%6<5
   let primary:Set<String>=["hachiware","chiikawa","usagi","friends"]
   let category=photos.filter{primary.contains($0["character"] as? String ?? "friends")==mainTurn}
   let candidates=category.isEmpty ? photos:category
   let fresh=candidates.filter{!seen.contains($0["id"] as? String ?? "")};let repeatPool=candidates.filter{$0["id"] as? String != lastDesktopPhoto};let pool=fresh.isEmpty ? (repeatPool.isEmpty ? candidates:repeatPool):fresh
   let previous=photos.first{$0["id"] as? String==lastDesktopPhoto}?["character"] as? String
   let groups=Dictionary(grouping:pool){$0["character"] as? String ?? "friends"};let different=groups.keys.filter{$0 != previous};let types=different.isEmpty ? Array(groups.keys):different
   guard let type=types.randomElement(),let photo=groups[type]?.randomElement(),let id=photo["id"] as? String else{throw NSError(domain:"하치와레",code:1,userInfo:[NSLocalizedDescriptionKey:"사진 목록을 불러오지 못했어요."])}
   var image=NSImage(contentsOfFile:Bundle.main.resourcePath!+"/photos/"+id+".jpg")
   if image==nil{let (bytes,_)=try await URLSession.shared.data(from:URL(string:publicSite+"photos/"+id+".jpg")!);image=NSImage(data:bytes)}
   guard let image=image else{throw NSError(domain:"하치와레",code:2,userInfo:[NSLocalizedDescriptionKey:"사진을 표시하지 못했어요."])}
   UserDefaults.standard.set(UserDefaults.standard.integer(forKey:"desktopDrawCount")+1,forKey:"desktopDrawCount");seen.insert(id);UserDefaults.standard.set(Array(seen),forKey:"seenDesktopPhotoIDs")
   await MainActor.run{self.lastDesktopPhoto=id;let usagi=photo["character"] as? String=="usagi";self.show(image,isUsagi:usagi);if usagi{self.playUna()}else{self.playEffect("reveal")}}
  }catch{await MainActor.run{let a=NSAlert();a.messageText="사진을 불러오지 못했어요";a.informativeText=error.localizedDescription;a.runModal()}}
  await MainActor.run{self.busy=false;self.status.button?.title="🐾"}
  }
 }
 @objc func openArchive(){let suffix=lastDesktopPhoto.map{"#desktop_photo="+$0+"&request="+UUID().uuidString} ?? "";_ = NSWorkspace.shared.open(URL(string:publicSite+suffix)!)}
 @objc func openMusic(){
  setSpin(0);playEffect("switch");if let v=pet.contentView as? PetView{v.hovering=false}
  if let window=musicWindow{window.makeKeyAndOrderFront(nil);NSApp.activate(ignoringOtherApps:true);return}
  let screen=pet.screen?.visibleFrame ?? NSScreen.main!.visibleFrame
  let width=min(900,screen.width-60),height=min(630,screen.height-70)
  let window=NSWindow(contentRect:NSRect(x:0,y:0,width:width,height:height),styleMask:[.titled,.closable,.resizable,.miniaturizable],backing:.buffered,defer:false)
  window.title="하치와레 노래 TV ♪";window.isReleasedWhenClosed=false;window.contentMinSize=NSSize(width:420,height:340);window.delegate=self
  let configuration=WKWebViewConfiguration();configuration.mediaTypesRequiringUserActionForPlayback=[]
  let web=WKWebView(frame:NSRect(x:0,y:0,width:width,height:height),configuration:configuration);web.autoresizingMask=[.width,.height];window.contentView=web;web.load(URLRequest(url:URL(string:publicSite+"desktop-tv.html")!));musicView=web;musicWindow=window
  window.center();window.makeKeyAndOrderFront(nil);NSApp.activate(ignoringOtherApps:true)
 }
 func windowWillClose(_ notification:Notification){if let window=notification.object as? NSWindow,window===musicWindow{musicView?.loadHTMLString("",baseURL:nil);musicView=nil;musicWindow=nil}}
 @objc func toggleSounds(_ sender:NSMenuItem){soundsEnabled.toggle();UserDefaults.standard.set(soundsEnabled,forKey:"motionSounds");sender.state=soundsEnabled ? .on : .off;if !soundsEnabled{setSpin(0);motionSounds.forEach{$0.stop()};unaSound?.stop()}}
 func playEffect(_ name:String){
  guard soundsEnabled,let path=Bundle.main.path(forResource:name,ofType:"wav"),let sound=NSSound(contentsOfFile:path,byReference:false) else{return}
  motionSounds=motionSounds.filter{$0.isPlaying};motionSounds.append(sound);sound.play()
 }
 func setSpin(_ level:Int){
  let value=soundsEnabled ? level : 0;guard value != spinLevel else{return};spinSound?.stop();spinSound=nil;spinLevel=value
  if value>0,let path=Bundle.main.path(forResource:"spin-"+String(value),ofType:"wav"){spinSound=NSSound(contentsOfFile:path,byReference:false);spinSound?.loops=true;spinSound?.play()}
 }
 func playUna(){
  guard soundsEnabled else{return}

  if voiceBag.isEmpty{
   guard let url=Bundle.main.url(forResource:"usagi-voices",withExtension:"json"),let data=try? Data(contentsOf:url),let clips=try? JSONDecoder().decode([String].self,from:data),!clips.isEmpty else{return}
   voiceBag=clips.shuffled();if voiceBag.last==lastVoice{voiceBag.reverse()}
  }
  let clip=voiceBag.removeLast();lastVoice=clip
  guard let path=Bundle.main.path(forResource:clip,ofType:"wav") else{return}
  unaSound?.stop();unaSound=NSSound(contentsOfFile:path,byReference:false);unaSound?.play()
 }

 func show(_ image:NSImage,isUsagi:Bool=false){
  result?.close()
  let screen=pet.screen?.visibleFrame ?? NSScreen.main!.visibleFrame
  let width=min(760,screen.width*0.76),height=min(840,screen.height-70)
  let w=NSWindow(contentRect:NSRect(x:0,y:0,width:width,height:height),styleMask:[.titled,.closable,.resizable],backing:.buffered,defer:false)
  w.title="오늘의 치이 친구";w.isReleasedWhenClosed=false;w.contentMinSize=NSSize(width:320,height:360)
  w.backgroundColor=NSColor(calibratedRed:0.985,green:0.978,blue:0.949,alpha:1)
  let v=ClickableImageView(frame:NSRect(x:20,y:80,width:width-40,height:height-100))
  v.onClick=isUsagi ? { [weak self] in self?.playUna() } : nil
  v.image=image;v.imageScaling = .scaleProportionallyUpOrDown;v.autoresizingMask=[.width,.height];w.contentView?.addSubview(v)
  let button=NSButton(title:"웹사이트 바로가기 ↗",target:self,action:#selector(openArchive))
  button.isBordered=false;button.wantsLayer=true;button.layer?.backgroundColor=NSColor(calibratedRed:0.45,green:0.65,blue:0.78,alpha:1).cgColor;button.layer?.cornerRadius=10
  button.attributedTitle=NSAttributedString(string:"웹사이트 바로가기 ↗",attributes:[.foregroundColor:NSColor.white,.font:NSFont.systemFont(ofSize:15,weight:.semibold)])
  button.frame=NSRect(x:(width-230)/2,y:22,width:230,height:40);button.autoresizingMask=[.minXMargin,.maxXMargin,.maxYMargin];w.contentView?.addSubview(button)
  w.setFrameOrigin(NSPoint(x:screen.midX-w.frame.width/2,y:screen.midY-w.frame.height/2));w.makeKeyAndOrderFront(nil);NSApp.activate(ignoringOtherApps:true);result=w
 }
 @objc func quit(){NSApp.terminate(nil)}
 func applicationWillTerminate(_ notification:Notification){timer?.invalidate();NotificationCenter.default.removeObserver(self);NSWorkspace.shared.notificationCenter.removeObserver(self);server?.terminate()}
}
@main
struct HachiwareMain {
 static func main(){let app=NSApplication.shared;let delegate=App();app.delegate=delegate;withExtendedLifetime(delegate){app.run()}}
}
