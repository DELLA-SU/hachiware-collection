import Foundation

let publicSite = "https://della-su.github.io/hachiware-collection/"

func desktopPhotoContentSize(screen: CGSize) -> CGSize {
 return CGSize(width:min(640,max(240,screen.width-80)),height:min(700,max(260,screen.height-100)))
}

struct DesktopDrawHistory: Codable {
 var day: String
 var ids: Set<String>
 static func dayKey(_ date: Date) -> String {
  let formatter=DateFormatter();formatter.calendar=Calendar(identifier:.gregorian)
  formatter.locale=Locale(identifier:"en_US_POSIX");formatter.timeZone=TimeZone(identifier:"Asia/Seoul");formatter.dateFormat="yyyy-MM-dd"
  return formatter.string(from:date)
 }
 func seen(on date: Date) -> Set<String> { day==Self.dayKey(date) ? ids:[] }
 mutating func record(_ id: String,on date: Date) {
  let key=Self.dayKey(date);if day != key{day=key;ids=[]};ids.insert(id)
 }
}

struct DesktopDrawCandidate: Equatable {
 let id: String
 let character: String
}

func desktopDrawPool(_ photos: [DesktopDrawCandidate],today: Set<String>,seen: Set<String>,mainTurn: Bool) -> [DesktopDrawCandidate] {
 let available=photos.filter{!today.contains($0.id)}
 let primary:Set<String>=["hachiware","chiikawa","usagi","friends"]
 let preferred=available.filter{primary.contains($0.character)==mainTurn}
 let candidates=preferred.isEmpty ? available:preferred
 let fresh=candidates.filter{!seen.contains($0.id)}
 return fresh.isEmpty ? candidates:fresh
}

func desktopArchiveURL(photoID: String,requestID: String) -> URL? {
 guard photoID.range(of:"^[a-f0-9]{64}$",options:.regularExpression) != nil,UUID(uuidString:requestID) != nil else{return nil}
 return URL(string:publicSite+"?skip_intro=1#desktop_photo="+photoID+"&request="+requestID)
}
